/*
  Mills Maths Tools — Array and Area Model Engine
  ------------------------------------------------
  engines/array-area/array-area-engine.js

  Exposes: window.MMT_ARRAY_AREA_ENGINE.render(target, config)

  The multiplicative models Stage 3 is built on. NSW Mathematics K–10 (2022)
  does not ask Year 5/6 students to be fast at long multiplication; it asks
  them to "use partitioning and place value" and to "represent" division. Both
  of those are claims about a PICTURE. Fluency questions can be written without
  an engine, so everything this engine draws is a model a student reasons with,
  not a decoration beside a sum.

  Diagram types
  -------------
    array                 rows × columns of dots, with braces naming each side
    area-model            a rectangle partitioned by place value, one cell per
                          partial product
    division-area-model   the same rectangle read backwards — total area and
                          one side known, the other side and any remainder to
                          be found
    factor-rectangles     every rectangle that can be made from n counters,
                          which is what a factor pair IS
    number-grid           a hundred-chart with one or two sets of multiples
                          shaded, so a pattern can be seen rather than listed

  The blank-box convention
  ------------------------
  Any label — an edge, a partial product, a total — given as `null` draws an
  empty box for the student to fill, exactly as `open-number-line-engine` does.
  One diagram type therefore covers "here is a worked model", "fill in the
  gaps" and "build it yourself" without three near-identical code paths. A
  label given as `false` is omitted entirely.

  Proportions
  -----------
  The area model is only worth drawing if 20 looks bigger than 3, so widths
  ARE proportional — but damped, and floored at a minimum. Strictly to scale,
  the "3" column of a 23 × 4 model is too narrow to hold the number 12, which
  defeats the point. Each cell gets a guaranteed minimum, and the space left
  over is shared out by a square-root weight.
*/

window.MMT_ARRAY_AREA_ENGINE = (() => {
  const SVG_NS = "http://www.w3.org/2000/svg";

  /* Label size in user units. Registered in the renderer's
     DIAGRAM_BASE_TEXT_UNITS so every diagram prints at the same physical
     text size regardless of engine. */
  const TEXT = 22;

  const INK = "#111827";
  const ACCENT = "#1d4ed8";
  const CELL_A = "#eaf1fb";
  const CELL_B = "#ffffff";
  const REMAINDER_FILL = "#fdf1dc";
  const REMAINDER_INK = "#a16207";
  const SHADE_ONE = "#dbeafe";
  const SHADE_TWO = "#dcfce7";
  const SHADE_BOTH = "#fde68a";

  function el(name, attrs = {}) {
    const node = document.createElementNS(SVG_NS, name);
    Object.entries(attrs).forEach(([key, value]) => {
      if (value !== undefined && value !== null) node.setAttribute(key, String(value));
    });
    return node;
  }

  function svgRoot(width, height, label = "multiplication model") {
    const s = el("svg", {
      viewBox: `0 0 ${Math.round(width)} ${Math.round(height)}`,
      width: "100%",
      role: "img",
      "aria-label": label,
      class: "aae-svg"
    });

    const style = el("style");
    style.textContent = `
      .aae-svg{overflow:visible}
      /* No fill is declared on the rule classes. A cell's tint is passed as a
         presentation attribute, and a class-level fill:none would silently
         win over it — the same trap that once turned the number-line arcs
         into solid blobs. */
      .aae-line{stroke:${INK};stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}
      .aae-divide{stroke:${INK};stroke-width:2}
      .aae-thin{stroke:${INK};stroke-width:1.4}
      .aae-brace{stroke:${ACCENT};stroke-width:2.2;fill:none;stroke-linecap:round}
      .aae-dot{fill:${INK}}
      .aae-text{font-family:"Cambria Math","Times New Roman",serif;font-size:${TEXT}px;fill:${INK};text-anchor:middle;dominant-baseline:middle}
      .aae-edge{font-weight:700;fill:${ACCENT}}
      .aae-cell{font-weight:700}
      .aae-small{font-size:${TEXT - 4}px}
      /* Alignment overrides must be CLASSES. A presentation attribute of
         text-anchor="start" loses to the text-anchor:middle in .aae-text —
         CSS beats presentation attributes, always. */
      .aae-start{text-anchor:start}
      .aae-end{text-anchor:end}
      .aae-remainder{fill:${REMAINDER_INK};font-weight:700}
      .aae-box{fill:#ffffff;stroke:${INK};stroke-width:2}
    `;
    s.appendChild(style);
    return s;
  }

  function text(parent, value, x, y, cls = "aae-text", extra = {}) {
    const node = el("text", { x, y, class: cls, ...extra });
    node.textContent = String(value);
    parent.appendChild(node);
    return node;
  }

  /*
    A label is either a value or an empty box for the student to fill. Callers
    never branch on which — they pass a value or null and get the right thing.
  */
  function label(parent, value, x, y, cls = "aae-text", boxW = 58, boxH = 36) {
    if (value === false) return;
    if (value === null || value === undefined || value === "") {
      parent.appendChild(el("rect", {
        x: x - boxW / 2, y: y - boxH / 2, width: boxW, height: boxH, rx: 3,
        class: "aae-box", fill: "#ffffff", stroke: INK, "stroke-width": 2
      }));
      return;
    }
    text(parent, value, x, y, cls);
  }

  function rect(parent, x, y, w, h, fill, cls = "aae-line", extra = {}) {
    parent.appendChild(el("rect", {
      x, y, width: w, height: h,
      fill: fill || "none",
      stroke: INK,
      "stroke-width": 2.6,
      class: cls,
      ...extra
    }));
  }

  function line(parent, x1, y1, x2, y2, cls = "aae-divide", stroke = INK, width = 2) {
    parent.appendChild(el("line", {
      x1, y1, x2, y2, class: cls, stroke, "stroke-width": width
    }));
  }

  function numbers(value, fallback = [1]) {
    const list = (Array.isArray(value) ? value : [value])
      .map(v => Number(v))
      .filter(v => Number.isFinite(v) && v > 0);
    return list.length ? list : fallback;
  }

  /*
    Give every slot a guaranteed minimum, then share what is left over by a
    damped weight. This is the compromise that lets 20 and 3 sit side by side
    and both hold a two-digit number, while 20 still plainly looks bigger.
  */
  function proportionalSizes(parts, total, minimum) {
    const n = parts.length;
    const floor = Math.min(minimum, total / n);
    const spare = Math.max(0, total - floor * n);
    /*
      An exponent of 0.62 rather than a square root. A tens column has to look
      clearly, obviously bigger than a ones column — that IS the place-value
      point being made — and a square root flattens 20 against 3 to about
      1.5 : 1, which reads as "two roughly equal boxes".
    */
    const weights = parts.map(p => 0.2 + Math.pow(Math.abs(p), 0.62));
    const sum = weights.reduce((a, b) => a + b, 0) || 1;
    return weights.map(w => floor + spare * (w / sum));
  }

  /*
    Labels supplied by the caller win; otherwise the part values label
    themselves. An explicit null inside the array still means "blank box", so
    a caller can blank one edge and show the other.
  */
  function edgeLabels(given, parts) {
    if (Array.isArray(given)) return parts.map((p, i) => (i < given.length ? given[i] : p));
    return parts.slice();
  }

  /* ── array ───────────────────────────────────────────────── */

  function renderArray(config = {}) {
    const rows = Math.max(1, Math.min(12, Math.round(Number(config.rows) || 3)));
    const cols = Math.max(1, Math.min(12, Math.round(Number(config.cols) || 4)));

    const step = Math.max(24, Math.min(42, Math.round(430 / Math.max(rows, cols))));
    const radius = Math.max(5, step * 0.19);

    const padLeft = 96;
    const padTop = 66;
    const gridW = cols * step;
    const gridH = rows * step;

    const s = svgRoot(padLeft + gridW + 26, padTop + gridH + 26, "array");

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        s.appendChild(el("circle", {
          cx: padLeft + c * step + step / 2,
          cy: padTop + r * step + step / 2,
          r: radius,
          class: "aae-dot",
          fill: INK
        }));
      }
    }

    /*
      The braces are what turn a field of dots into "4 rows of 6". Without
      them the picture shows a quantity but not its structure, and the
      structure is the whole content point.
    */
    const braceTop = padTop - 16;
    s.appendChild(el("path", {
      d: `M ${padLeft} ${braceTop + 9} L ${padLeft} ${braceTop} L ${padLeft + gridW} ${braceTop} L ${padLeft + gridW} ${braceTop + 9}`,
      class: "aae-brace", fill: "none", stroke: ACCENT, "stroke-width": 2.2
    }));
    label(s, config.colLabel ?? cols, padLeft + gridW / 2, braceTop - 20, "aae-text aae-edge", 54, 34);

    const braceLeft = padLeft - 18;
    s.appendChild(el("path", {
      d: `M ${braceLeft + 9} ${padTop} L ${braceLeft} ${padTop} L ${braceLeft} ${padTop + gridH} L ${braceLeft + 9} ${padTop + gridH}`,
      class: "aae-brace", fill: "none", stroke: ACCENT, "stroke-width": 2.2
    }));
    label(s, config.rowLabel ?? rows, braceLeft - 34, padTop + gridH / 2, "aae-text aae-edge", 54, 34);

    return s;
  }

  /* ── area model ──────────────────────────────────────────── */

  function renderAreaModel(config = {}) {
    const colParts = numbers(config.columnParts, [10]);
    const rowParts = numbers(config.rowParts, [1]);

    const MIN_W = 96;
    const MIN_H = 74;
    const GRID_W = 462;
    const GRID_H = rowParts.length === 1 ? 106 : Math.max(MIN_H * rowParts.length, 172);

    const widths = proportionalSizes(colParts, GRID_W, MIN_W);
    const heights = proportionalSizes(rowParts, GRID_H, MIN_H);

    const colLabels = edgeLabels(config.columnLabels, colParts);
    const rowLabels = edgeLabels(config.rowLabels, rowParts);

    const padLeft = 84;
    const padTop = 52;
    const showTotal = Object.prototype.hasOwnProperty.call(config, "total");
    const padBottom = showTotal ? 74 : 20;

    const s = svgRoot(padLeft + GRID_W + 22, padTop + GRID_H + padBottom, "area model");

    // Cells first, so the outer rule draws over their edges.
    let y = padTop;
    rowParts.forEach((_, r) => {
      let x = padLeft;
      colParts.forEach((__, c) => {
        /* Tinted by COLUMN, not as a checkerboard. On a four-region model a
           checker pattern implies a diagonal pairing that does not exist;
           banding by column reinforces the place-value split instead. */
        rect(s, x, y, widths[c], heights[r], c % 2 === 0 ? CELL_A : CELL_B, "aae-divide");

        const row = Array.isArray(config.cells) ? config.cells[r] : undefined;
        const value = Array.isArray(row) ? row[c] : (row === undefined ? null : row);
        label(s, value, x + widths[c] / 2, y + heights[r] / 2, "aae-text aae-cell", 74, 38);

        x += widths[c];
      });
      y += heights[r];
    });

    rect(s, padLeft, padTop, GRID_W, GRID_H, "none", "aae-line");

    // Edge labels. The "×" in the corner names the operation the model shows.
    let x = padLeft;
    colParts.forEach((_, c) => {
      label(s, colLabels[c], x + widths[c] / 2, padTop - 24, "aae-text aae-edge", 58, 34);
      x += widths[c];
    });

    y = padTop;
    rowParts.forEach((_, r) => {
      label(s, rowLabels[r], padLeft - 40, y + heights[r] / 2, "aae-text aae-edge", 58, 34);
      y += heights[r];
    });

    text(s, "×", padLeft - 40, padTop - 24, "aae-text aae-edge");

    if (showTotal) {
      const baseY = padTop + GRID_H + 40;
      text(s, "Total =", padLeft + 46, baseY, "aae-text");
      label(s, config.total, padLeft + 148, baseY, "aae-text aae-cell", 88, 38);
    }

    return s;
  }

  /* ── division as an area model ───────────────────────────── */

  /*
    The same rectangle, read backwards. The known side is the divisor, the
    area is the dividend, and the missing side is the quotient — which is why
    the parts along the top are the parts of the ANSWER. A remainder is drawn
    as a separate block outside the rectangle, because a remainder is exactly
    the part that would not fit.
  */
  function renderDivisionAreaModel(config = {}) {
    const parts = Array.isArray(config.parts) && config.parts.length
      ? config.parts
      : [{ quotient: 10, area: 60 }];

    const remainder = Number(config.remainder) || 0;

    const MIN_W = 108;
    const GRID_W = remainder > 0 ? 386 : 452;
    const GRID_H = 108;
    const REM_W = 74;

    /*
      Fall back to the partial dividend when the quotient is blanked out. The
      two are in the same ratio, so the picture keeps its proportions in the
      case that matters most — the one where the student has to work the
      quotient out.
    */
    const widths = proportionalSizes(
      parts.map(p => Number(p.quotient) || Number(p.area) || 1), GRID_W, MIN_W);

    const padLeft = 92;
    const padTop = 52;

    const s = svgRoot(
      padLeft + GRID_W + (remainder > 0 ? REM_W + 20 : 0) + 24,
      padTop + GRID_H + 28,
      "division area model"
    );

    let x = padLeft;
    parts.forEach((part, i) => {
      rect(s, x, padTop, widths[i], GRID_H, i % 2 === 0 ? CELL_A : CELL_B, "aae-divide");
      label(s, part.area ?? null, x + widths[i] / 2, padTop + GRID_H / 2, "aae-text aae-cell", 78, 38);
      label(s, part.quotient ?? null, x + widths[i] / 2, padTop - 24, "aae-text aae-edge", 58, 34);
      x += widths[i];
    });

    rect(s, padLeft, padTop, GRID_W, GRID_H, "none", "aae-line");
    label(s, config.divisor ?? null, padLeft - 44, padTop + GRID_H / 2, "aae-text aae-edge", 58, 34);
    text(s, "×", padLeft - 44, padTop - 24, "aae-text aae-edge");

    if (remainder > 0) {
      const rx = padLeft + GRID_W + 20;
      s.appendChild(el("rect", {
        x: rx, y: padTop, width: REM_W, height: GRID_H, rx: 4,
        fill: REMAINDER_FILL, stroke: REMAINDER_INK, "stroke-width": 2.4,
        "stroke-dasharray": "8 6"
      }));
      label(s, config.remainderLabel ?? remainder, rx + REM_W / 2, padTop + GRID_H / 2,
        "aae-text aae-remainder", 52, 36);
      text(s, "left over", rx + REM_W / 2, padTop - 24, "aae-text aae-small aae-remainder");
    }

    return s;
  }

  /* ── factor rectangles ───────────────────────────────────── */

  /*
    A factor pair is not a fact to memorise, it is a rectangle that can be
    built. Drawing every rectangle for n makes "n has six factors" something
    the student can count rather than recall.
  */
  function renderFactorRectangles(config = {}) {
    const pairs = (Array.isArray(config.pairs) ? config.pairs : [[2, 6]])
      .map(p => [Math.max(1, Math.round(p[0])), Math.max(1, Math.round(p[1]))])
      .slice(0, 6);

    const CELL = 17;
    const GAP = 40;
    const CAPTION = 30;
    const MAX_ROW_W = 560;

    // Lay the rectangles out left to right, wrapping onto a new row.
    const laid = [];
    let cursorX = 0;
    let cursorY = 0;
    let rowHeight = 0;

    pairs.forEach(([rows, cols]) => {
      const w = cols * CELL;
      const h = rows * CELL;
      if (cursorX > 0 && cursorX + w > MAX_ROW_W) {
        cursorX = 0;
        cursorY += rowHeight + CAPTION + 26;
        rowHeight = 0;
      }
      laid.push({ rows, cols, x: cursorX, y: cursorY, w, h });
      cursorX += w + GAP;
      rowHeight = Math.max(rowHeight, h);
    });

    const rows = new Map();
    laid.forEach(item => rows.set(item.y, Math.max(rows.get(item.y) || 0, item.h)));

    const totalW = Math.max(...laid.map(i => i.x + i.w));
    const totalH = [...rows.entries()].reduce((sum, [, h]) => sum + h + CAPTION + 26, 0);

    const padLeft = 14;
    const padTop = 12;
    const s = svgRoot(padLeft + totalW + 14, padTop + totalH + 4, "factor rectangles");

    laid.forEach(item => {
      const baseY = padTop + item.y + (rows.get(item.y) - item.h);
      const baseX = padLeft + item.x;

      rect(s, baseX, baseY, item.w, item.h, CELL_A, "aae-line");

      for (let c = 1; c < item.cols; c++) {
        line(s, baseX + c * CELL, baseY, baseX + c * CELL, baseY + item.h, "aae-thin", INK, 1.2);
      }
      for (let r = 1; r < item.rows; r++) {
        line(s, baseX, baseY + r * CELL, baseX + item.w, baseY + r * CELL, "aae-thin", INK, 1.2);
      }

      if (config.showCaptions !== false) {
        label(s, config.captions === null ? null : `${item.rows} × ${item.cols}`,
          baseX + item.w / 2, baseY + item.h + 24, "aae-text aae-edge", 78, 34);
      }
    });

    return s;
  }

  /* ── number grid ─────────────────────────────────────────── */

  /*
    Multiples make a pattern on a hundred chart — columns for 2, 5 and 10, a
    diagonal for 3 and 9 — and common multiples are literally where two
    shadings overlap. Listing them loses all of that.
  */
  function renderNumberGrid(config = {}) {
    const from = Math.round(Number(config.from) || 1);
    const to = Math.round(Number(config.to) || 60);
    const columns = Math.max(1, Math.round(Number(config.columns) || 10));

    const shade = new Set((config.shade || []).map(Number));
    const shadeAlt = new Set((config.shadeAlt || []).map(Number));

    const CELL_W = 47;
    const CELL_H = 35;
    const count = Math.max(1, to - from + 1);
    const rowCount = Math.ceil(count / columns);

    const legend = [];
    if (config.shadeLabel) legend.push([SHADE_ONE, config.shadeLabel]);
    if (config.shadeAltLabel) legend.push([SHADE_TWO, config.shadeAltLabel]);
    if (config.shadeLabel && config.shadeAltLabel) legend.push([SHADE_BOTH, "both"]);

    const padLeft = 10;
    const padTop = 10;

    const s = svgRoot(
      padLeft + columns * CELL_W + 10,
      padTop + rowCount * CELL_H + (legend.length ? 22 + legend.length * 32 : 10),
      "number grid"
    );

    for (let i = 0; i < count; i++) {
      const value = from + i;
      const c = i % columns;
      const r = Math.floor(i / columns);
      const x = padLeft + c * CELL_W;
      const y = padTop + r * CELL_H;

      const inOne = shade.has(value);
      const inTwo = shadeAlt.has(value);
      const fill = inOne && inTwo ? SHADE_BOTH : inOne ? SHADE_ONE : inTwo ? SHADE_TWO : "#ffffff";

      s.appendChild(el("rect", {
        x, y, width: CELL_W, height: CELL_H,
        fill, stroke: INK, "stroke-width": 1.2, class: "aae-thin"
      }));
      text(s, value, x + CELL_W / 2, y + CELL_H / 2 + 1, "aae-text aae-small");
    }

    /*
      The key is stacked, one entry per line. Laid out in a row it has to
      guess the printed width of each caption to know where the next chip
      starts, and a wrong guess pushes the last chip outside the viewBox where
      it gets clipped. A column needs no measuring.
    */
    legend.forEach(([fill, caption], i) => {
      const y = padTop + rowCount * CELL_H + 26 + i * 32;
      s.appendChild(el("rect", {
        x: padLeft + 2, y: y - 13, width: 26, height: 26,
        fill, stroke: INK, "stroke-width": 1.4
      }));
      text(s, caption, padLeft + 38, y, "aae-text aae-small aae-start");
    });

    return s;
  }

  /* ── entry point ─────────────────────────────────────────── */

  function render(target, config = {}) {
    if (!target) return;
    target.innerHTML = "";

    const type = config.diagramType || "area-model";

    let node;
    if (type === "array") node = renderArray(config);
    else if (type === "division-area-model") node = renderDivisionAreaModel(config);
    else if (type === "factor-rectangles") node = renderFactorRectangles(config);
    else if (type === "number-grid") node = renderNumberGrid(config);
    else node = renderAreaModel(config);

    target.appendChild(node);
  }

  return { render };
})();
