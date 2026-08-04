/*
  Mills Maths Tools — Open Number Line Engine
  --------------------------------------------
  engines/open-number-line/open-number-line-engine.js

  Exposes: window.MMT_OPEN_NUMBER_LINE_ENGINE.render(target, config)

  Draws the additive strategies from the Coffs Harbour Mathematics Faculty
  workbook "Building Additive Strategies". An OPEN number line has no scale —
  only the points that matter are marked, and the spacing carries no meaning.
  That is the whole pedagogical point: the student records the jumps they
  chose, not a measurement.

  Diagram types
  -------------
    open-number-line   the general model — ticks, values, arcs above and below
    blank-number-line  a bare line for the student to draw their own jumps

  Everything is expressed as JUMPS. A jump has a size, a direction, and may sit
  above the line (the strategy) or below it (the adjustment used by constant
  difference). Any label — a tick value or a jump size — can be given as null,
  which draws an empty box for the student to fill, exactly as the workbook
  does. That single convention covers "worked example", "fill the gaps" and
  "do it yourself" without needing three diagram types.

  Positions
  ---------
  Ticks are laid out by their ORDER, not their value, with a little extra room
  given to larger jumps so the picture still reads sensibly. A true-to-scale
  layout would squash the small ±1 bridging jumps into invisibility, which is
  the opposite of what the model is for.
*/

window.MMT_OPEN_NUMBER_LINE_ENGINE = (() => {
  const SVG_NS = "http://www.w3.org/2000/svg";

  const VIEW = { w: 720, h: 300 };
  const AXIS_Y = 190;
  const LEFT = 60;
  const RIGHT = 660;

  function el(name, attrs = {}) {
    const node = document.createElementNS(SVG_NS, name);
    Object.entries(attrs).forEach(([key, value]) => {
      if (value !== undefined && value !== null) node.setAttribute(key, String(value));
    });
    return node;
  }

  function svgRoot() {
    const s = el("svg", {
      viewBox: `0 0 ${VIEW.w} ${VIEW.h}`,
      width: "100%",
      role: "img",
      class: "onl-svg"
    });

    const style = el("style");
    style.textContent = `
      .onl-svg{overflow:visible}
      .onl-axis{stroke:#111827;stroke-width:3.5;stroke-linecap:round;fill:none}
      .onl-tick{stroke:#111827;stroke-width:2.5;stroke-linecap:round}
      .onl-arc{fill:none;stroke:#2563eb;stroke-width:2.6}
      .onl-arc-back{stroke:#dc2626}
      .onl-arc-under{stroke:#15803d}
      .onl-value{font-family:"Cambria Math","Times New Roman",serif;font-size:22px;font-weight:700;fill:#111827;text-anchor:middle;dominant-baseline:middle}
      .onl-jump{font-family:"Cambria Math","Times New Roman",serif;font-size:22px;font-weight:700;fill:#2563eb;text-anchor:middle;dominant-baseline:middle}
      .onl-jump-back{fill:#dc2626}
      .onl-jump-under{fill:#15803d}
      .onl-box{fill:#ffffff;stroke:#111827;stroke-width:2}
    `;
    s.appendChild(style);
    return s;
  }

  function text(parent, value, x, y, cls) {
    const node = el("text", { x, y, class: cls });
    node.textContent = String(value);
    parent.appendChild(node);
    return node;
  }

  /*
    A label is either a value or an empty box for the student. One helper for
    both, so a "worked example" and a "fill the gaps" diagram differ only in
    whether the caller passed a number or null.
  */
  function label(parent, value, x, y, cls, boxWidth = 54, boxHeight = 34) {
    if (value === null || value === undefined || value === "") {
      parent.appendChild(el("rect", {
        x: x - boxWidth / 2,
        y: y - boxHeight / 2,
        width: boxWidth,
        height: boxHeight,
        rx: 3,
        class: "onl-box",
        fill: "#ffffff",
        stroke: "#111827",
        "stroke-width": 2
      }));
      return;
    }
    text(parent, value, x, y, cls);
  }

  /*
    Lay the stops out along the axis. Jump sizes vary hugely — a bridging
    sequence might be +2, +20, +5 — so widths are damped rather than
    proportional: every jump gets a base share, plus a little for its size.
    Small jumps stay visible and large ones still look larger.
  */
  function stopPositions(jumps, rightInset = 0) {
    /*
      Widths are damped, not proportional: a bridging sequence can be +2, +20,
      +5, and drawing those to scale would make the +2 invisible. A small base
      plus a square-root term keeps every jump readable while a large one still
      looks clearly larger — roughly the proportions the workbook draws by hand.
    */
    const widths = jumps.map(jump => 0.3 + Math.sqrt(Math.abs(Number(jump.size) || 1)) / 2.6);

    // A backward jump moves LEFT. Without this the "jumping over" arc pointed
    // right while the value it landed on went down.
    const offsets = [0];
    let x = 0;
    jumps.forEach((jump, index) => {
      x += jump.direction === "back" ? -widths[index] : widths[index];
      offsets.push(x);
    });

    const min = Math.min(...offsets);
    const span = (Math.max(...offsets) - min) || 1;

    const right = RIGHT - rightInset;
    return offsets.map(offset => LEFT + ((offset - min) / span) * (right - LEFT));
  }

  /*
    Paint is set as presentation attributes as well as classes. The stylesheet
    is the single source for colour, but an arc that loses `fill:none` renders
    as a solid black blob, so the one property that cannot degrade gracefully
    is stated on the element itself.
  */
  function drawArc(parent, fromX, toX, height, cls, colour) {
    const midX = (fromX + toX) / 2;
    const peakY = AXIS_Y - height;

    parent.appendChild(el("path", {
      d: `M ${fromX} ${AXIS_Y} Q ${midX} ${peakY - 18} ${toX} ${AXIS_Y}`,
      class: cls,
      fill: "none",
      stroke: colour,
      "stroke-width": 2.6
    }));

    const direction = fromX < toX ? "right" : "left";
    const tipX = toX + (direction === "right" ? -1 : 1);
    parent.appendChild(el("path", {
      d: direction === "right"
        ? `M ${tipX} ${AXIS_Y - 3} l -11 -6 l 0 12 z`
        : `M ${tipX} ${AXIS_Y - 3} l 11 -6 l 0 12 z`,
      fill: colour
    }));

    return { midX, peakY };
  }

  function drawUnderArc(parent, fromX, toX, colour) {
    const midX = (fromX + toX) / 2;
    parent.appendChild(el("path", {
      d: `M ${fromX} ${AXIS_Y + 8} Q ${midX} ${AXIS_Y + 62} ${toX} ${AXIS_Y + 8}`,
      class: "onl-arc onl-arc-under",
      fill: "none",
      stroke: colour,
      "stroke-width": 2.4
    }));
    parent.appendChild(el("path", {
      d: `M ${toX} ${AXIS_Y + 8} l ${fromX < toX ? -9 : 9} 6 l 0 -12 z`,
      fill: colour
    }));
    return { midX, y: AXIS_Y + 52 };
  }

  function renderOpenNumberLine(config = {}) {
    const s = svgRoot();

    const jumps = Array.isArray(config.jumps) ? config.jumps : [];
    const stops = Array.isArray(config.stops) ? config.stops : [];
    /*
      A shift arc and its value box hang off the right of the last stop, so the
      axis is shortened to leave room. Without this the shifted value sits past
      the edge of the frame.
    */
    const shifts = Array.isArray(config.shifts) ? config.shifts : [];
    const SHIFT_REACH = 52;
    const rightInset = shifts.some(shift => Number(shift.by) >= 0) ? SHIFT_REACH + 34 : 0;
    const positions = stopPositions(jumps, rightInset);

    s.appendChild(el("line", {
      x1: LEFT - 30, y1: AXIS_Y, x2: RIGHT + 30, y2: AXIS_Y,
      class: "onl-axis", stroke: "#111827", "stroke-width": 3.5, "stroke-linecap": "round"
    }));

    positions.forEach(x => {
      s.appendChild(el("line", {
        x1: x, y1: AXIS_Y - 13, x2: x, y2: AXIS_Y + 13,
        class: "onl-tick", stroke: "#111827", "stroke-width": 2.5
      }));
    });

    // Values under each stop. A null draws an empty box.
    positions.forEach((x, index) => {
      if (index >= stops.length) return;
      label(s, stops[index], x, AXIS_Y + 44, "onl-value");
    });

    /*
      Arcs are stacked so a long jump sits higher than a short one beside it,
      which stops the labels of adjacent jumps colliding.
    */
    jumps.forEach((jump, index) => {
      const fromX = positions[index];
      const toX = positions[index + 1];
      const back = jump.direction === "back";
      const height = 52 + (index % 2) * 26;

      const colour = back ? "#dc2626" : "#2563eb";
      const cls = back ? "onl-arc onl-arc-back" : "onl-arc";
      const { midX, peakY } = drawArc(s, fromX, toX, height, cls, colour);

      const shown = back && Number.isFinite(Number(jump.size))
        ? `−${Math.abs(jump.size)}`
        : (jump.size ?? null);
      const labelText = jump.size === null ? null : (jump.showSign === false ? jump.size : `${back ? "" : "+"}${shown}`);

      label(s, labelText, midX, peakY - 30, back ? "onl-jump onl-jump-back" : "onl-jump");
    });

    /*
      Constant difference shifts both endpoints by the same amount. The
      ORIGINAL values stay on the line and a small arc carries each to its
      shifted position, drawn as a second tick — otherwise the strategy is
      invisible and the diagram just shows two arbitrary numbers. The two
      shifts are drawn identically because their being equal is the whole
      argument.
    */
    if (shifts.length) {
      shifts.forEach(shift => {
        const index = Number(shift.at);
        const x = positions[index];
        if (!Number.isFinite(x)) return;

        const toX = x + (Number(shift.by) >= 0 ? SHIFT_REACH : -SHIFT_REACH);

        // The shifted position gets its own tick, in the shift colour.
        s.appendChild(el("line", {
          x1: toX, y1: AXIS_Y - 11, x2: toX, y2: AXIS_Y + 11,
          stroke: "#15803d", "stroke-width": 2.5
        }));

        const { midX, y } = drawUnderArc(s, x, toX, "#15803d");
        label(s, shift.label ?? Math.abs(shift.by), midX, y + 20, "onl-jump onl-jump-under", 40, 28);

        // The value it moved to, above the line so it cannot collide with the
        // original value sitting below.
        label(s, shift.to ?? null, toX, AXIS_Y - 34, "onl-jump onl-jump-under", 54, 32);
      });
    }

    return s;
  }

  /* A bare line. The student draws the strategy themselves. */
  function renderBlankNumberLine(config = {}) {
    const s = svgRoot();

    s.appendChild(el("line", {
      x1: LEFT - 30, y1: AXIS_Y, x2: RIGHT + 30, y2: AXIS_Y,
      class: "onl-axis", stroke: "#111827", "stroke-width": 3.5, "stroke-linecap": "round"
    }));

    if (config.showStart !== false && config.start !== undefined && config.start !== null) {
      s.appendChild(el("line", {
        x1: LEFT, y1: AXIS_Y - 13, x2: LEFT, y2: AXIS_Y + 13,
        class: "onl-tick", stroke: "#111827", "stroke-width": 2.5
      }));
      label(s, config.start, LEFT, AXIS_Y + 44, "onl-value");
    }

    return s;
  }

  function render(target, config = {}) {
    if (!target) return;
    target.innerHTML = "";

    const type = config.diagramType || "open-number-line";
    const node = type === "blank-number-line"
      ? renderBlankNumberLine(config)
      : renderOpenNumberLine(config);

    target.appendChild(node);
  }

  return { render };
})();
