/*
  MMT Exam Builder — Stage 5 Non-Linear Relationships Diagram Engine
  ------------------------------------------------------------------
  Save as:

  engines/nonlinear/nonlinear-engine.js

  Exposes:
  window.MMT_NONLINEAR_ENGINE.render(target, config)

  Supported diagramType values:
  - "graph-grid"       coordinate grid with optional functions/points
  - "graph-options"    A-D graph cards for matching/identifying curves
  - "relationship-card" compact visual for real-world contexts
*/

window.MMT_NONLINEAR_ENGINE = (() => {
  const SVG_NS = "http://www.w3.org/2000/svg";

  const VIEW = {
    w: 780,
    h: 430
  };

  const PALETTE = ["#2563eb", "#16a34a", "#c026d3", "#ea580c", "#0f766e"];

  function el(name, attrs = {}) {
    const node = document.createElementNS(SVG_NS, name);
    Object.entries(attrs).forEach(([key, value]) => {
      if (value !== undefined && value !== null) node.setAttribute(key, String(value));
    });
    return node;
  }

  function makeSvg(label = "non-linear relationships diagram") {
    const svg = el("svg", {
      viewBox: `0 0 ${VIEW.w} ${VIEW.h}`,
      width: "100%",
      height: "100%",
      role: "img",
      "aria-label": label,
      class: "nonlinear-svg"
    });

    const defs = el("defs");
    const arrow = el("marker", {
      id: `nl-arrow-${Math.random().toString(36).slice(2, 8)}`,
      markerWidth: 10,
      markerHeight: 10,
      refX: 8,
      refY: 3,
      orient: "auto",
      markerUnits: "strokeWidth"
    });
    arrow.appendChild(el("path", { d: "M0,0 L8,3 L0,6 Z", fill: "#111827" }));
    defs.appendChild(arrow);
    svg.appendChild(defs);
    svg.dataset.arrowId = arrow.id;

    const style = el("style");
    style.textContent = `
      .nonlinear-svg{overflow:visible;display:block}
      .nl-grid{stroke:#d1d5db;stroke-width:1}
      .nl-axis{stroke:#111827;stroke-width:2.8;stroke-linecap:round}
      .nl-axis-light{stroke:#64748b;stroke-width:1.5;stroke-linecap:round}
      .nl-curve{fill:none;stroke-width:4.2;stroke-linecap:round;stroke-linejoin:round}
      .nl-point{fill:#111827;stroke:#fff;stroke-width:2}
      .nl-fill{fill:#eff6ff;stroke:#111827;stroke-width:2.5}
      .nl-card{fill:#fff;stroke:#cbd5e1;stroke-width:2.4;rx:16;ry:16}
      .nl-label,.nl-small,.nl-title,.nl-card-label{
        font-family:"Cambria Math","STIX Two Math","Times New Roman",serif;
        fill:#111827;
        font-weight:700;
        text-anchor:middle;
        dominant-baseline:middle;
        paint-order:stroke;
        stroke:#fff;
        stroke-width:4px;
        stroke-linejoin:round;
      }
      .nl-label{font-size:20px}
      .nl-small{font-size:15px;stroke-width:3px}
      .nl-title{font-size:24px;stroke-width:5px}
      .nl-card-label{font-size:26px;fill:#c026d3;stroke-width:5px}
      .nl-context{fill:#ecfeff;stroke:#0f766e;stroke-width:3;rx:16;ry:16}
      .nl-dashed{stroke:#64748b;stroke-width:2;stroke-dasharray:7 6;fill:none}
    `;
    svg.appendChild(style);

    return svg;
  }

  function addText(parent, text, x, y, className = "nl-label", attrs = {}) {
    const node = el("text", { x, y, class: className, ...attrs });
    node.textContent = String(text ?? "");
    parent.appendChild(node);
    return node;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function evaluateFunction(fn, x) {
    if (!fn) return NaN;

    if (fn.kind === "quadratic") {
      const a = Number(fn.a ?? 1);
      const b = Number(fn.b ?? 0);
      const c = Number(fn.c ?? 0);
      return a * x * x + b * x + c;
    }

    if (fn.kind === "exponential") {
      const a = Number(fn.a ?? 1);
      const base = Number(fn.base ?? 2);
      const c = Number(fn.c ?? 0);
      return a * Math.pow(base, x) + c;
    }

    if (fn.kind === "linear") {
      const m = Number(fn.m ?? 1);
      const c = Number(fn.c ?? 0);
      return m * x + c;
    }

    // y = a/x + c  — hyperbola (inverse proportion, NSW Stage 5)
    if (fn.kind === "hyperbola") {
      if (Math.abs(x) < 1e-9) return NaN;
      const a = Number(fn.a ?? 1);
      const c = Number(fn.c ?? 0);
      return a / x + c;
    }

    // y = a * x^3 + b * x^2 + c * x + d  — cubic
    if (fn.kind === "cubic") {
      const a = Number(fn.a ?? 1);
      const b = Number(fn.b ?? 0);
      const c = Number(fn.c ?? 0);
      const d = Number(fn.d ?? 0);
      return a * x * x * x + b * x * x + c * x + d;
    }

    // y = a * sqrt(x + h) + k  — square root (half-parabola)
    if (fn.kind === "sqrt") {
      const a = Number(fn.a ?? 1);
      const h = Number(fn.h ?? 0);
      const k = Number(fn.k ?? 0);
      const inner = x + h;
      if (inner < 0) return NaN;
      return a * Math.sqrt(inner) + k;
    }

    // y = a * x^n  — power function
    if (fn.kind === "power") {
      const a = Number(fn.a ?? 1);
      const n = Number(fn.n ?? 2);
      return a * Math.pow(x, n);
    }

    return NaN;
  }

  function makeScale(cfg, box) {
    const xMin = Number(cfg.xMin ?? -5);
    const xMax = Number(cfg.xMax ?? 5);
    const yMin = Number(cfg.yMin ?? -5);
    const yMax = Number(cfg.yMax ?? 10);

    const sx = x => box.x + ((x - xMin) / (xMax - xMin)) * box.w;
    const sy = y => box.y + box.h - ((y - yMin) / (yMax - yMin)) * box.h;

    return { xMin, xMax, yMin, yMax, sx, sy };
  }

  function niceDefaultYLabelStep(s) {
    const range = Math.abs(s.yMax - s.yMin);
    const maxAbs = Math.max(Math.abs(s.yMin), Math.abs(s.yMax));

    // Keep graph paper usable: small ranges count by 1s, medium ranges by 2s,
    // and very large exponential scales by larger steps.
    if (maxAbs > 80 || range > 90) return 10;
    if (maxAbs > 30 || range > 40) return 5;
    if (maxAbs > 16 || range > 16) return 2;
    return 1;
  }

  function firstTick(min, step) {
    return Math.ceil(min / step) * step;
  }

  function drawGrid(svg, cfg, box) {
    const s = makeScale(cfg, box);
    const xGridStep = Number(cfg.xGridStep ?? cfg.xStep ?? 1);
    const xLabelStep = Number(cfg.xLabelStep ?? cfg.xStep ?? 1);
    const yLabelStep = Number(cfg.yLabelStep ?? cfg.yStep ?? niceDefaultYLabelStep(s));
    const yGridStep = Number(cfg.yGridStep ?? (Math.abs(s.yMax - s.yMin) > 40 ? yLabelStep : 1));
    const arrowUrl = `url(#${svg.dataset.arrowId})`;

    const clipId = `nl-clip-${Math.random().toString(36).slice(2, 8)}`;
    const defs = svg.querySelector("defs") || el("defs");
    const clip = el("clipPath", { id: clipId });
    clip.appendChild(el("rect", { x: box.x, y: box.y, width: box.w, height: box.h }));
    defs.appendChild(clip);
    if (!defs.parentNode) svg.appendChild(defs);

    const xAxisY = s.yMin <= 0 && s.yMax >= 0 ? s.sy(0) : box.y + box.h;
    const yAxisX = s.xMin <= 0 && s.xMax >= 0 ? s.sx(0) : box.x;
    const hasInteriorYAxis = yAxisX > box.x + 22 && yAxisX < box.x + box.w - 22;
    const hasInteriorXAxis = xAxisY > box.y + 22 && xAxisY < box.y + box.h - 22;
    const yTickLabelX = hasInteriorYAxis ? yAxisX - 10 : box.x - 18;
    const xTickLabelY = hasInteriorXAxis ? xAxisY + 18 : box.y + box.h + 18;

    for (let x = firstTick(s.xMin, xGridStep); x <= s.xMax + 1e-9; x += xGridStep) {
      const X = s.sx(x);
      svg.appendChild(el("line", { x1: X, y1: box.y, x2: X, y2: box.y + box.h, class: "nl-grid" }));
    }

    for (let y = firstTick(s.yMin, yGridStep); y <= s.yMax + 1e-9; y += yGridStep) {
      const Y = s.sy(y);
      svg.appendChild(el("line", { x1: box.x, y1: Y, x2: box.x + box.w, y2: Y, class: "nl-grid" }));
    }

    svg.appendChild(el("line", { x1: box.x, y1: xAxisY, x2: box.x + box.w + 8, y2: xAxisY, class: "nl-axis", "marker-end": arrowUrl }));
    svg.appendChild(el("line", { x1: yAxisX, y1: box.y + box.h, x2: yAxisX, y2: box.y - 8, class: "nl-axis", "marker-end": arrowUrl }));

    if (cfg.showScale !== false) {
      for (let x = firstTick(s.xMin, xLabelStep); x <= s.xMax + 1e-9; x += xLabelStep) {
        if (Math.abs(x) < 1e-9) continue;
        const label = Number.isInteger(x) ? String(x) : String(Number(x.toFixed(2)));
        addText(svg, label, s.sx(x), xTickLabelY, "nl-small");
      }

      for (let y = firstTick(s.yMin, yLabelStep); y <= s.yMax + 1e-9; y += yLabelStep) {
        if (Math.abs(y) < 1e-9) continue;
        const label = Number.isInteger(y) ? String(y) : String(Number(y.toFixed(2)));
        addText(svg, label, yTickLabelX, s.sy(y), "nl-small", { "text-anchor": "end" });
      }

      addText(svg, "0", yAxisX - 14, xAxisY + 18, "nl-small");
    }

    addText(svg, cfg.xLabel || "x", box.x + box.w + 24, xAxisY + 2, "nl-label");
    addText(svg, cfg.yLabel || "y", yAxisX + 2, box.y - 24, "nl-label");

    return { ...s, clipId };
  }

  function drawFunction(svg, cfg, box, fn, index = 0) {
    const s = makeScale(cfg, box);
    const samples = Number(fn.samples ?? 320);
    const colour = fn.color || PALETTE[index % PALETTE.length];
    const points = [];
    const YCLIP = 120; // extra pixels beyond box before breaking path

    // Detect large jumps (discontinuities like x=0 in hyperbola)
    let prevY = null;
    const jumpThreshold = (s.yMax - s.yMin) * 2.5;

    for (let i = 0; i <= samples; i++) {
      const x = s.xMin + (i / samples) * (s.xMax - s.xMin);
      const y = evaluateFunction(fn, x);
      if (!Number.isFinite(y)) {
        if (points.length && points[points.length - 1] !== null) points.push(null);
        prevY = null;
        continue;
      }
      // Break path at discontinuities (jump > threshold)
      if (prevY !== null && Math.abs(y - prevY) > jumpThreshold) {
        if (points.length && points[points.length - 1] !== null) points.push(null);
      }
      prevY = y;
      const X = s.sx(x);
      const Y = s.sy(y);
      if (Y < box.y - YCLIP || Y > box.y + box.h + YCLIP) {
        if (points.length && points[points.length - 1] !== null) points.push(null);
        continue;
      }
      points.push([X, Y]);
    }

    let pathData = "";
    let open = false;
    points.forEach(point => {
      if (!point) {
        open = false;
        return;
      }
      const [X, Y] = point;
      pathData += open ? ` L ${X.toFixed(1)} ${Y.toFixed(1)}` : `M ${X.toFixed(1)} ${Y.toFixed(1)}`;
      open = true;
    });

    if (pathData) {
      svg.appendChild(el("path", {
        d: pathData,
        class: "nl-curve",
        stroke: colour,
        "clip-path": cfg.clipId ? `url(#${cfg.clipId})` : undefined
      }));
    }

    if (fn.label) {
      addText(svg, fn.label, Number(fn.labelX ?? box.x + box.w - 72), Number(fn.labelY ?? box.y + 34 + index * 28), "nl-label", { fill: colour });
    }
  }

  function drawPoints(svg, cfg, box, points = []) {
    const s = makeScale(cfg, box);
    points.forEach(point => {
      const X = s.sx(Number(point.x));
      const Y = s.sy(Number(point.y));
      svg.appendChild(el("circle", { cx: X, cy: Y, r: 5.5, class: "nl-point" }));
      if (point.label) addText(svg, point.label, X + 20, Y - 16, "nl-small");
    });
  }

  function renderGraphGrid(target, cfg = {}) {
    const svg = makeSvg(cfg.title || "coordinate graph");
    const box = cfg.compact
      ? { x: 54, y: 48, w: 250, h: 185 }
      : { x: 68, y: 54, w: 650, h: 310 };

    if (cfg.title) addText(svg, cfg.title, VIEW.w / 2, 24, "nl-title");

    const scale = drawGrid(svg, cfg, box);
    const enhancedCfg = { ...cfg, clipId: scale.clipId };

    (cfg.functions || []).forEach((fn, index) => drawFunction(svg, enhancedCfg, box, fn, index));
    drawPoints(svg, cfg, box, cfg.points || []);

    if (cfg.caption) addText(svg, cfg.caption, VIEW.w / 2, VIEW.h - 22, "nl-label");

    target.innerHTML = "";
    target.appendChild(svg);
  }

  function renderGraphOptions(target, cfg = {}) {
    const svg = makeSvg(cfg.title || "graph options");
    if (cfg.title) addText(svg, cfg.title, VIEW.w / 2, 24, "nl-title");

    const cards = Array.isArray(cfg.cards) ? cfg.cards.slice(0, 4) : [];
    const positions = [
      { x: 52, y: 60, w: 320, h: 145 },
      { x: 408, y: 60, w: 320, h: 145 },
      { x: 52, y: 238, w: 320, h: 145 },
      { x: 408, y: 238, w: 320, h: 145 }
    ];

    cards.forEach((card, index) => {
      const pos = positions[index];
      svg.appendChild(el("rect", { x: pos.x, y: pos.y, width: pos.w, height: pos.h, class: "nl-card" }));
      addText(svg, card.option || String.fromCharCode(65 + index), pos.x + 24, pos.y + 28, "nl-card-label");

      const graphBox = { x: pos.x + 48, y: pos.y + 20, w: pos.w - 72, h: pos.h - 46 };
      const localCfg = {
        xMin: card.xMin ?? cfg.xMin ?? -4,
        xMax: card.xMax ?? cfg.xMax ?? 4,
        yMin: card.yMin ?? cfg.yMin ?? -2,
        yMax: card.yMax ?? cfg.yMax ?? 10,
        showScale: false,
        xLabel: "",
        yLabel: ""
      };
      drawGrid(svg, localCfg, graphBox);
      (card.functions || []).forEach((fn, fnIndex) => drawFunction(svg, localCfg, graphBox, fn, fnIndex));
      if (card.equationLabel) addText(svg, card.equationLabel, pos.x + pos.w / 2, pos.y + pos.h - 16, "nl-small");
    });

    target.innerHTML = "";
    target.appendChild(svg);
  }

  function renderRelationshipCard(target, cfg = {}) {
    const svg = makeSvg(cfg.title || "relationship card");
    svg.appendChild(el("rect", { x: 90, y: 70, width: 600, height: 250, class: "nl-context" }));
    addText(svg, cfg.title || "Relationship", VIEW.w / 2, 114, "nl-title");

    const lines = Array.isArray(cfg.lines) ? cfg.lines : [];
    lines.slice(0, 5).forEach((line, index) => {
      addText(svg, line, VIEW.w / 2, 165 + index * 36, "nl-label");
    });

    if (cfg.footer) addText(svg, cfg.footer, VIEW.w / 2, 360, "nl-label");
    target.innerHTML = "";
    target.appendChild(svg);
  }

  function render(target, config = {}) {
    const type = String(config.diagramType || "graph-grid");

    if (type === "graph-options") {
      renderGraphOptions(target, config);
      return;
    }

    if (type === "relationship-card") {
      renderRelationshipCard(target, config);
      return;
    }

    renderGraphGrid(target, config);
  }

  return { render };
})();
