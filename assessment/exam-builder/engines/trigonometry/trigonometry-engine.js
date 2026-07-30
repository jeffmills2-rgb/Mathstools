/*
  MMT Exam Builder — Stage 5 Trigonometry Diagram Engine
  ------------------------------------------------------
  Save as:

  engines/trigonometry/trigonometry-engine.js

  Exposes:
  window.MMT_TRIGONOMETRY_ENGINE.render(target, config)

  Supported diagramType values:
  - "right-triangle"
  - "similar-right-triangles"
  - "practical-trig"
  - "bearing-diagram"
  - "bearing-triangle"

  Designed for printable Stage 5 right-triangle trigonometry diagrams.
*/

window.MMT_TRIGONOMETRY_ENGINE = (() => {
  const SVG_NS = "http://www.w3.org/2000/svg";

  const VIEW = {
    w: 720,
    h: 430
  };

  function el(name, attrs = {}) {
    const node = document.createElementNS(SVG_NS, name);

    Object.entries(attrs).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        node.setAttribute(key, String(value));
      }
    });

    return node;
  }

  function makeSvg(label = "trigonometry diagram") {
    const svg = el("svg", {
      viewBox: `0 0 ${VIEW.w} ${VIEW.h}`,
      width: "100%",
      height: "100%",
      role: "img",
      "aria-label": label,
      class: "trig-svg"
    });

    const style = el("style");
    style.textContent = `
      .trig-svg{overflow:visible;display:block}
      .trig-side{stroke:#111827;stroke-width:5;stroke-linecap:round;stroke-linejoin:round;fill:none}
      .trig-fill{fill:#eff6ff;stroke:#111827;stroke-width:4;stroke-linejoin:round}
      .trig-guide{stroke:#64748b;stroke-width:2.4;stroke-linecap:round;fill:none;stroke-dasharray:8 7}
      .trig-right{stroke:#111827;stroke-width:3.2;fill:none;stroke-linejoin:round}
      .trig-angle{stroke:#2563eb;stroke-width:4;fill:none;stroke-linecap:round}
      .trig-angle.secondary{stroke:#16a34a}
      .trig-label,.trig-vertex,.trig-small-label{
        font-family:"Cambria Math","STIX Two Math","Times New Roman",serif;
        font-weight:700;
        fill:#111827;
        text-anchor:middle;
        dominant-baseline:middle;
        paint-order:stroke;
        stroke:#fff;
        stroke-width:5px;
        stroke-linejoin:round;
      }
      .trig-label{font-size:28px}
      .trig-vertex{font-size:24px}
      .trig-small-label{font-size:20px}
      .trig-caption{
        font-family:"Cambria Math","Times New Roman",serif;
        font-size:21px;
        font-weight:700;
        fill:#111827;
        text-anchor:middle;
      }
      .trig-context-label{
        font-family:"Cambria Math","STIX Two Math","Times New Roman",serif;
        font-size:24px;
        font-weight:700;
        fill:#111827;
        text-anchor:middle;
        dominant-baseline:middle;
        paint-order:stroke;
        stroke:#fff;
        stroke-width:4px;
        stroke-linejoin:round;
      }
      .trig-axis{stroke:#94a3b8;stroke-width:2;stroke-linecap:round;fill:none}
      .trig-ground{stroke:#111827;stroke-width:4;stroke-linecap:round}
      .trig-water{stroke:#38bdf8;stroke-width:3;stroke-linecap:round;fill:none;opacity:.9}
      .trig-context-stroke{stroke:#111827;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;fill:none}
      .trig-context-fill{fill:#e0f2fe;stroke:#111827;stroke-width:3;stroke-linejoin:round}
      .trig-context-soft{fill:#dcfce7;stroke:#166534;stroke-width:3;stroke-linejoin:round}
      .trig-light{stroke:#f59e0b;stroke-width:2.5;stroke-linecap:round;fill:none;opacity:.9}
      .trig-dashed{stroke:#64748b;stroke-width:2.5;stroke-dasharray:8 7;fill:none}
      .trig-horizon{stroke:#94a3b8;stroke-width:2.5;stroke-dasharray:8 7;fill:none}
      .bearing-ray{stroke:#111827;stroke-width:4.5;stroke-linecap:round;fill:none}
      .bearing-north{stroke:#111827;stroke-width:3.2;stroke-linecap:round;fill:none}
      .bearing-guide{stroke:#64748b;stroke-width:2.3;stroke-dasharray:7 6;fill:none}
      .bearing-arc{stroke:#2563eb;stroke-width:4;stroke-linecap:round;fill:none}
      .bearing-point{fill:#111827;stroke:#fff;stroke-width:2}
      .bearing-compass{stroke:#cbd5e1;stroke-width:2;fill:none}
      .bearing-label{font-family:"Cambria Math","STIX Two Math","Times New Roman",serif;font-size:24px;font-weight:700;fill:#111827;text-anchor:middle;dominant-baseline:middle;paint-order:stroke;stroke:#fff;stroke-width:5px;stroke-linejoin:round}
    `;

    svg.appendChild(style);
    return svg;
  }

  function degToRad(deg) {
    return deg * Math.PI / 180;
  }

  function radToDeg(rad) {
    return rad * 180 / Math.PI;
  }

  function rotatePoint(p, deg) {
    const r = degToRad(deg);
    const cos = Math.cos(r);
    const sin = Math.sin(r);

    return {
      x: p.x * cos - p.y * sin,
      y: p.x * sin + p.y * cos
    };
  }

  function bbox(points) {
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);

    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys)
    };
  }

  function fitPoints(points, {
    width = VIEW.w,
    height = VIEW.h,
    marginX = 120,
    marginY = 84,
    centerX = VIEW.w / 2,
    centerY = VIEW.h / 2,
    maxScale = 2.2
  } = {}) {
    const b = bbox(points);
    const currentW = Math.max(1, b.maxX - b.minX);
    const currentH = Math.max(1, b.maxY - b.minY);
    const availableW = Math.max(120, width - marginX * 2);
    const availableH = Math.max(110, height - marginY * 2);
    const scale = Math.min(availableW / currentW, availableH / currentH, Number(maxScale));

    const midX = (b.minX + b.maxX) / 2;
    const midY = (b.minY + b.maxY) / 2;

    return points.map(p => ({
      x: centerX + (p.x - midX) * scale,
      y: centerY + (p.y - midY) * scale
    }));
  }

  function distance(a, b) {
    return Math.hypot(b.x - a.x, b.y - a.y);
  }

  function unitVector(from, to) {
    const d = distance(from, to) || 1;

    return {
      x: (to.x - from.x) / d,
      y: (to.y - from.y) / d
    };
  }

  function midpoint(a, b) {
    return {
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2
    };
  }

  function add(a, b) {
    return { x: a.x + b.x, y: a.y + b.y };
  }

  function scale(v, amount) {
    return { x: v.x * amount, y: v.y * amount };
  }

  function normal(a, b) {
    const u = unitVector(a, b);
    return { x: -u.y, y: u.x };
  }

  function angleOf(from, to) {
    return radToDeg(Math.atan2(to.y - from.y, to.x - from.x));
  }

  function polar(cx, cy, angleDeg, r) {
    const a = degToRad(angleDeg);

    return {
      x: cx + Math.cos(a) * r,
      y: cy + Math.sin(a) * r
    };
  }

  function smallestAngleDiff(a, b) {
    let diff = ((b - a) % 360 + 360) % 360;
    if (diff > 180) diff -= 360;
    return diff;
  }

  function arcPath(center, angle1, angle2, r) {
    let diff = smallestAngleDiff(angle1, angle2);
    const endAngle = angle1 + diff;
    const start = polar(center.x, center.y, angle1, r);
    const end = polar(center.x, center.y, endAngle, r);
    const largeArc = Math.abs(diff) > 180 ? 1 : 0;
    const sweep = diff > 0 ? 1 : 0;

    return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} ${sweep} ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
  }

  function text(svg, value, x, y, cls = "trig-label") {
    if (value === undefined || value === null || value === "") return;

    const node = el("text", {
      x,
      y,
      class: cls
    });

    node.textContent = value;
    svg.appendChild(node);
  }

  function rotatedText(svg, value, x, y, angleDeg, cls = "trig-label") {
    if (value === undefined || value === null || value === "") return;

    const node = el("text", {
      x,
      y,
      class: cls,
      transform: `rotate(${angleDeg} ${x} ${y})`
    });

    node.textContent = value;
    svg.appendChild(node);
  }

  function line(svg, a, b, cls = "trig-side") {
    svg.appendChild(el("line", {
      x1: a.x,
      y1: a.y,
      x2: b.x,
      y2: b.y,
      class: cls
    }));
  }

  function polygon(svg, points, cls = "trig-fill") {
    svg.appendChild(el("polygon", {
      points: points.map(p => `${p.x},${p.y}`).join(" "),
      class: cls
    }));
  }

  function drawRightAngle(svg, A, B, C) {
    const u = unitVector(A, B);
    const v = unitVector(A, C);
    const size = 26;

    const p1 = add(A, scale(u, size));
    const p2 = add(add(A, scale(u, size)), scale(v, size));
    const p3 = add(A, scale(v, size));

    svg.appendChild(el("path", {
      d: `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y}`,
      class: "trig-right"
    }));
  }

  function drawAngleArc(svg, vertex, p1, p2, label, {
    radius = 42,
    labelRadius = 72,
    cls = "trig-angle",
    labelDx = 0,
    labelDy = 0
  } = {}) {
    const a1 = angleOf(vertex, p1);
    const a2 = angleOf(vertex, p2);
    const d = smallestAngleDiff(a1, a2);
    const end = a1 + d;
    const mid = a1 + d / 2;
    const labelPoint = polar(vertex.x, vertex.y, mid, labelRadius);

    svg.appendChild(el("path", {
      d: arcPath(vertex, a1, end, radius),
      class: cls
    }));

    text(svg, label, labelPoint.x + labelDx, labelPoint.y + labelDy, "trig-label");
  }

  function labelVertices(svg, points, labels = {}) {
    const centre = {
      x: (points.A.x + points.B.x + points.C.x) / 3,
      y: (points.A.y + points.B.y + points.C.y) / 3
    };

    Object.entries(points).forEach(([key, point]) => {
      const label = labels[key] ?? key;
      if (!label) return;

      const u = unitVector(centre, point);
      text(svg, label, point.x + u.x * 28, point.y + u.y * 28, "trig-vertex");
    });
  }

  function sideMidpointByRole(points, role, referenceVertex) {
    const roleSides = getRoleSides(referenceVertex);
    const side = roleSides[role];

    if (!side) return null;

    return {
      side,
      midpoint: midpoint(points[side[0]], points[side[1]])
    };
  }

  function sideLabelPoint(points, side, offset = 34) {
    const a = points[side[0]];
    const b = points[side[1]];
    const m = midpoint(a, b);
    const centre = {
      x: (points.A.x + points.B.x + points.C.x) / 3,
      y: (points.A.y + points.B.y + points.C.y) / 3
    };

    let n = normal(a, b);
    const test = add(m, n);
    const d1 = distance(test, centre);
    const d0 = distance(m, centre);

    if (d1 < d0) n = scale(n, -1);

    return add(m, scale(n, offset));
  }

  function getRoleSides(referenceVertex = "B") {
    if (referenceVertex === "C") {
      return {
        hypotenuse: ["B", "C"],
        adjacent: ["A", "C"],
        opposite: ["A", "B"]
      };
    }

    return {
      hypotenuse: ["B", "C"],
      adjacent: ["A", "B"],
      opposite: ["A", "C"]
    };
  }

  function buildTrianglePoints(config = {}) {
    const angle = Math.max(8, Math.min(82, Number(config.angle ?? 38)));
    const hypotenuse = Number(config.hypotenusePx ?? 310);
    const referenceVertex = config.referenceVertex === "C" ? "C" : "B";

    let legAB;
    let legAC;

    // Right angle is at A. If the marked angle is at B, AB is adjacent
    // and AC is opposite. If the marked angle is at C, AC is adjacent
    // and AB is opposite. This keeps the drawn angle approximately to scale.
    if (referenceVertex === "C") {
      legAB = hypotenuse * Math.sin(degToRad(angle));
      legAC = hypotenuse * Math.cos(degToRad(angle));
    } else {
      legAB = hypotenuse * Math.cos(degToRad(angle));
      legAC = hypotenuse * Math.sin(degToRad(angle));
    }

    const base = {
      A: { x: 0, y: 0 },
      B: { x: legAB, y: 0 },
      C: { x: 0, y: -legAC }
    };

    const rotation = Number(config.rotation ?? 0);
    const rotated = {
      A: rotatePoint(base.A, rotation),
      B: rotatePoint(base.B, rotation),
      C: rotatePoint(base.C, rotation)
    };

    const fitted = fitPoints([rotated.A, rotated.B, rotated.C], {
      marginX: Number(config.marginX ?? 100),
      marginY: Number(config.marginY ?? 62),
      centerX: Number(config.centerX ?? VIEW.w / 2),
      centerY: Number(config.centerY ?? VIEW.h / 2)
    });

    return {
      A: fitted[0],
      B: fitted[1],
      C: fitted[2]
    };
  }

  function renderRightTriangle(target, config = {}) {
    const svg = makeSvg("right-angled triangle");
    const points = buildTrianglePoints(config);
    const referenceVertex = config.referenceVertex === "C" ? "C" : "B";
    const otherVertex = referenceVertex === "B" ? "C" : "B";
    const angleLabel = config.angleLabel || (config.angle ? `${config.angle}°` : "θ");
    const vertexLabels = config.vertexLabels || { A: "A", B: "B", C: "C" };

    polygon(svg, [points.A, points.B, points.C]);
    line(svg, points.A, points.B);
    line(svg, points.B, points.C);
    line(svg, points.C, points.A);
    drawRightAngle(svg, points.A, points.B, points.C);

    if (config.showAngle !== false) {
      drawAngleArc(
        svg,
        points[referenceVertex],
        points.A,
        points[otherVertex],
        angleLabel,
        {
          radius: Number(config.angleRadius ?? 31),
          labelRadius: Number(config.angleLabelRadius ?? 50)
        }
      );
    }

    if (config.showVertices !== false) {
      labelVertices(svg, points, vertexLabels);
    }

    const sideLabels = config.sideLabels || {};
    const roleSides = getRoleSides(referenceVertex);

    Object.entries(sideLabels).forEach(([role, value]) => {
      const side = roleSides[role];

      if (!side) return;

      const point = sideLabelPoint(points, side, Number(config.sideLabelOffset ?? 40));
      text(svg, value, point.x, point.y, "trig-label");
    });

    if (config.caption) {
      text(svg, config.caption, VIEW.w / 2, VIEW.h - 26, "trig-caption");
    }

    target.innerHTML = "";
    target.appendChild(svg);
  }

  function triangleGroup(svg, {
    x = 0,
    y = 0,
    scaleFactor = 1,
    angle = 35,
    labels = {},
    title = ""
  } = {}) {
    const hyp = 220 * scaleFactor;
    const adj = hyp * Math.cos(degToRad(angle));
    const opp = hyp * Math.sin(degToRad(angle));

    const A = { x, y };
    const B = { x: x + adj, y };
    const C = { x, y: y - opp };
    const points = { A, B, C };

    polygon(svg, [A, B, C]);
    line(svg, A, B);
    line(svg, B, C);
    line(svg, C, A);
    drawRightAngle(svg, A, B, C);
    drawAngleArc(svg, B, A, C, `${angle}°`, {
      radius: 26 * scaleFactor,
      labelRadius: 48 * scaleFactor,
      cls: "trig-angle secondary"
    });

    const roleSides = getRoleSides("B");

    Object.entries(labels).forEach(([role, value]) => {
      const side = roleSides[role];
      const p = sideLabelPoint(points, side, 28);
      text(svg, value, p.x, p.y, "trig-small-label");
    });

    if (title) {
      text(svg, title, x + adj / 2, y + 42, "trig-caption");
    }
  }

  function renderSimilarRightTriangles(target, config = {}) {
    const svg = makeSvg("similar right-angled triangles");
    const angle = Number(config.angle ?? 35);
    const small = config.small || {};
    const large = config.large || {};

    triangleGroup(svg, {
      x: 100,
      y: 290,
      scaleFactor: 0.8,
      angle,
      labels: small.labels || {},
      title: small.title || "Triangle A"
    });

    triangleGroup(svg, {
      x: 360,
      y: 310,
      scaleFactor: 1.15,
      angle,
      labels: large.labels || {},
      title: large.title || "Triangle B"
    });

    if (config.caption) {
      text(svg, config.caption, VIEW.w / 2, 42, "trig-caption");
    }

    target.innerHTML = "";
    target.appendChild(svg);
  }


  function drawSegmentLabel(svg, a, b, label, {
    dx = 0,
    dy = 0,
    cls = "trig-label",
    t = 0.5,
    normalOffset = 0
  } = {}) {
    if (!label) return;
    const m = {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t
    };
    const u = unitVector(a, b);
    const n = { x: -u.y, y: u.x };
    text(svg, label, m.x + dx + n.x * normalOffset, m.y + dy + n.y * normalOffset, cls);
  }

  function drawTree(svg, base, top) {
    const trunkWidth = 16;
    svg.appendChild(el("rect", {
      x: base.x - trunkWidth / 2,
      y: top.y + 42,
      width: trunkWidth,
      height: Math.max(40, base.y - top.y - 42),
      rx: 4,
      class: "trig-context-fill"
    }));

    [
      { x: top.x, y: top.y + 18, r: 35 },
      { x: top.x - 28, y: top.y + 42, r: 30 },
      { x: top.x + 28, y: top.y + 42, r: 30 },
      { x: top.x, y: top.y + 54, r: 34 }
    ].forEach(c => {
      svg.appendChild(el("circle", {
        cx: c.x,
        cy: c.y,
        r: c.r,
        class: "trig-context-soft"
      }));
    });
  }

  function drawBuilding(svg, base, top) {
    const w = 86;
    svg.appendChild(el("rect", {
      x: base.x - w / 2,
      y: top.y,
      width: w,
      height: base.y - top.y,
      rx: 3,
      class: "trig-context-fill"
    }));

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 2; col++) {
        const wy = top.y + 24 + row * 38;
        if (wy > base.y - 24) continue;
        svg.appendChild(el("rect", {
          x: base.x - 28 + col * 34,
          y: wy,
          width: 17,
          height: 18,
          rx: 2,
          fill: "#fff",
          stroke: "#111827",
          "stroke-width": 1.5
        }));
      }
    }
  }

  function drawLadder(svg, foot, top, wallBase) {
    line(svg, wallBase, top, "trig-context-stroke");

    const u = unitVector(foot, top);
    const n = { x: -u.y, y: u.x };
    const halfWidth = 8;
    const rail1Start = add(foot, scale(n, halfWidth));
    const rail1End = add(top, scale(n, halfWidth));
    const rail2Start = add(foot, scale(n, -halfWidth));
    const rail2End = add(top, scale(n, -halfWidth));

    line(svg, rail1Start, rail1End, "trig-context-stroke");
    line(svg, rail2Start, rail2End, "trig-context-stroke");

    for (let i = 1; i <= 6; i++) {
      const t = i / 7;
      const centre = {
        x: foot.x + (top.x - foot.x) * t,
        y: foot.y + (top.y - foot.y) * t
      };
      line(svg, add(centre, scale(n, halfWidth + 1)), add(centre, scale(n, -(halfWidth + 1))), "trig-context-stroke");
    }
  }

  function drawLighthouse(svg, base, top) {
    const h = base.y - top.y;
    const p = [
      { x: base.x - 35, y: base.y },
      { x: base.x + 35, y: base.y },
      { x: top.x + 18, y: top.y + 34 },
      { x: top.x - 18, y: top.y + 34 }
    ];

    svg.appendChild(el("polygon", {
      points: p.map(pt => `${pt.x},${pt.y}`).join(" "),
      class: "trig-context-fill"
    }));

    svg.appendChild(el("rect", {
      x: top.x - 28,
      y: top.y + 4,
      width: 56,
      height: 30,
      rx: 4,
      class: "trig-context-fill"
    }));

    line(svg, { x: top.x - 45, y: top.y + 20 }, { x: top.x - 85, y: top.y + 4 }, "trig-light");
    line(svg, { x: top.x - 45, y: top.y + 20 }, { x: top.x - 86, y: top.y + 36 }, "trig-light");
  }

  function drawCliff(svg, base, top) {
    svg.appendChild(el("path", {
      d: `M ${base.x - 18} ${base.y} L ${top.x - 18} ${top.y} L ${top.x + 24} ${top.y}
          C ${top.x + 8} ${top.y + 55}, ${base.x + 30} ${base.y - 80}, ${base.x + 6} ${base.y}
          Z`,
      fill: "#f1f5f9",
      stroke: "#111827",
      "stroke-width": 3,
      "stroke-linejoin": "round"
    }));

    line(svg, top, base, "trig-dashed");
  }

  function drawBoat(svg, point) {
    svg.appendChild(el("path", {
      d: `M ${point.x - 42} ${point.y - 10} L ${point.x + 42} ${point.y - 10} L ${point.x + 24} ${point.y + 10} L ${point.x - 24} ${point.y + 10} Z`,
      class: "trig-context-fill"
    }));

    line(svg, { x: point.x, y: point.y - 10 }, { x: point.x, y: point.y - 62 }, "trig-context-stroke");
    svg.appendChild(el("path", {
      d: `M ${point.x} ${point.y - 58} L ${point.x + 36} ${point.y - 24} L ${point.x} ${point.y - 24} Z`,
      fill: "#f8fafc",
      stroke: "#111827",
      "stroke-width": 3,
      "stroke-linejoin": "round"
    }));
  }

  function drawObserver(svg, point) {
    svg.appendChild(el("circle", {
      cx: point.x,
      cy: point.y - 28,
      r: 10,
      fill: "#111827"
    }));
    line(svg, { x: point.x, y: point.y - 18 }, { x: point.x, y: point.y + 18 }, "trig-context-stroke");
    line(svg, { x: point.x, y: point.y - 2 }, { x: point.x - 20, y: point.y + 14 }, "trig-context-stroke");
    line(svg, { x: point.x, y: point.y - 2 }, { x: point.x + 20, y: point.y + 14 }, "trig-context-stroke");
  }

  function drawWater(svg, y, startX = 70, endX = 650) {
    line(svg, { x: startX, y }, { x: endX, y }, "trig-ground");
    for (let i = 0; i < 5; i++) {
      const yy = y + 18 + i * 14;
      svg.appendChild(el("path", {
        d: `M ${startX + 230} ${yy} C ${startX + 270} ${yy - 8}, ${startX + 310} ${yy + 8}, ${startX + 350} ${yy} S ${startX + 430} ${yy - 8}, ${endX - 40} ${yy}`,
        class: "trig-water"
      }));
    }
  }

  function renderPracticalTrig(target, config = {}) {
    const svg = makeSvg("practical trigonometry diagram");
    const context = String(config.context || "tree");
    const angle = Math.max(10, Math.min(80, Number(config.angle ?? 35)));
    const angleLabel = config.angleLabel || `${angle}°`;
    const isDepression = config.angleType === "depression" || (config.angleType == null && ["cliff", "boat"].includes(context));
    const groundY = 330;

    if (isDepression) {
      const top = { x: 160, y: 120 };
      const foot = { x: 160, y: groundY };
      const targetPoint = { x: 555, y: groundY };
      const horizon = { x: targetPoint.x, y: top.y };

      drawWater(svg, groundY);

      if (context === "lighthouse") {
        drawLighthouse(svg, foot, top);
      } else {
        drawCliff(svg, foot, top);
      }

      drawBoat(svg, targetPoint);
      line(svg, top, horizon, "trig-horizon");
      line(svg, top, targetPoint, "trig-side");
      line(svg, foot, targetPoint, "trig-guide");
      drawRightAngle(svg, foot, top, targetPoint);
      drawAngleArc(svg, top, horizon, targetPoint, angleLabel, {
        radius: 42,
        labelRadius: 72
      });

      drawSegmentLabel(svg, foot, targetPoint, config.adjacentLabel, { dy: 28 });
      drawSegmentLabel(svg, top, foot, config.oppositeLabel, { dx: -46 });
      drawSegmentLabel(svg, top, targetPoint, config.hypotenuseLabel, { dx: 22, dy: -20 });

      if (config.caption) {
        text(svg, config.caption, VIEW.w / 2, VIEW.h - 24, "trig-caption");
      }

      target.innerHTML = "";
      target.appendChild(svg);
      return;
    }

    const observer = { x: 120, y: groundY };
    let h = 210;
    let dx = h / Math.tan(degToRad(angle));

    if (dx > 420) {
      dx = 420;
      h = dx * Math.tan(degToRad(angle));
    }

    if (dx < 150) {
      dx = 150;
      h = dx * Math.tan(degToRad(angle));
    }

    h = Math.min(h, 245);

    const base = { x: observer.x + dx, y: groundY };
    const top = { x: base.x, y: groundY - h };
    const drawWaterScene = context === "lighthouse";

    if (drawWaterScene) {
      drawWater(svg, groundY);
    } else {
      line(svg, { x: 70, y: groundY }, { x: 650, y: groundY }, "trig-ground");
    }

    if (context === "tree") {
      drawTree(svg, base, top);
    } else if (context === "building") {
      drawBuilding(svg, base, top);
    } else if (context === "ladder") {
      drawLadder(svg, observer, top, base);
    } else if (context === "ramp") {
      svg.appendChild(el("polygon", {
        points: `${observer.x},${groundY} ${base.x},${groundY} ${top.x},${top.y}`,
        fill: "#f1f5f9",
        stroke: "#111827",
        "stroke-width": 3,
        "stroke-linejoin": "round"
      }));
    } else if (context === "lighthouse") {
      drawLighthouse(svg, base, top);
      drawBoat(svg, { x: observer.x + 8, y: groundY });
    } else {
      drawBuilding(svg, base, top);
    }

    const suppressObserver = ["ramp", "ladder", "lighthouse"].includes(context);
    if (!suppressObserver) {
      drawObserver(svg, observer);
      line(svg, base, top, "trig-guide");
    }

    line(svg, observer, base, "trig-side");
    line(svg, observer, top, "trig-side");
    drawRightAngle(svg, base, observer, top);
    drawAngleArc(svg, observer, base, top, angleLabel, {
      radius: 42,
      labelRadius: 72
    });

    drawSegmentLabel(svg, observer, base, config.adjacentLabel, { dy: 32 });
    drawSegmentLabel(svg, base, top, config.oppositeLabel, { dx: 44 });

    if (context === "ramp" && config.hypotenuseLabel) {
      const m = midpoint(observer, top);
      const ang = angleOf(observer, top);
      rotatedText(svg, config.hypotenuseLabel, m.x - 12, m.y - 20, ang, "trig-context-label");
    } else {
      drawSegmentLabel(svg, observer, top, config.hypotenuseLabel, { dx: -8, dy: -30 });
    }

    if (config.caption) {
      text(svg, config.caption, VIEW.w / 2, VIEW.h - 24, "trig-caption");
    }

    target.innerHTML = "";
    target.appendChild(svg);
  }


  function bearingToPoint(origin, bearingDeg, length) {
    const a = degToRad(bearingDeg);
    return {
      x: origin.x + Math.sin(a) * length,
      y: origin.y - Math.cos(a) * length
    };
  }

  function normaliseBearing(value) {
    return ((Number(value) % 360) + 360) % 360;
  }

  function bearingToScreenAngle(bearingDeg) {
    return normaliseBearing(bearingDeg) - 90;
  }

  function formatBearingLabel(value) {
    const bearing = Math.round(normaliseBearing(value));
    return `${String(bearing).padStart(3, "0")}°`;
  }

  function shortestBearingDiff(startBearing, endBearing) {
    let diff = normaliseBearing(endBearing) - normaliseBearing(startBearing);
    diff = ((diff + 540) % 360) - 180;
    return diff;
  }

  function bearingArcPathBetween(center, startBearing, endBearing, radius, preferClockwise = null) {
    let diff = preferClockwise === true
      ? (normaliseBearing(endBearing) - normaliseBearing(startBearing) + 360) % 360
      : preferClockwise === false
        ? -((normaliseBearing(startBearing) - normaliseBearing(endBearing) + 360) % 360)
        : shortestBearingDiff(startBearing, endBearing);

    if (Math.abs(diff) < 0.001) diff = 360;

    const startAngle = bearingToScreenAngle(startBearing);
    const endAngle = startAngle + diff;
    const start = polar(center.x, center.y, startAngle, radius);
    const end = polar(center.x, center.y, endAngle, radius);
    const largeArc = Math.abs(diff) > 180 ? 1 : 0;
    const sweep = diff > 0 ? 1 : 0;

    return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} ${sweep} ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
  }

  function drawArrowHead(svg, tip, angleDeg, size = 13, cls = "bearing-ray") {
    const left = polar(tip.x, tip.y, angleDeg + 150, size);
    const right = polar(tip.x, tip.y, angleDeg - 150, size);

    svg.appendChild(el("path", {
      d: `M ${left.x} ${left.y} L ${tip.x} ${tip.y} L ${right.x} ${right.y}`,
      class: cls
    }));
  }

  function drawDoubleArrow(svg, a, b, label, {
    cls = "bearing-north",
    labelCls = "trig-label",
    labelDx = 0,
    labelDy = 0,
    arrowSize = 10
  } = {}) {
    line(svg, a, b, cls);
    drawArrowHead(svg, a, angleOf(b, a), arrowSize, cls);
    drawArrowHead(svg, b, angleOf(a, b), arrowSize, cls);
    if (label) {
      text(svg, label, (a.x + b.x) / 2 + labelDx, (a.y + b.y) / 2 + labelDy, labelCls);
    }
  }

  function drawNorthArrow(svg, origin, length = 105, label = "N") {
    const top = { x: origin.x, y: origin.y - length };
    line(svg, origin, top, "bearing-north");
    drawArrowHead(svg, top, -90, 12, "bearing-north");
    text(svg, label, top.x, top.y - 20, "bearing-label");
  }

  function drawBearingAxes(svg, origin, radius = 118, options = {}) {
    const showAllLabels = options.showAllLabels !== false;
    const dot = options.dot !== false;

    const n = bearingToPoint(origin, 0, radius);
    const e = bearingToPoint(origin, 90, radius);
    const s = bearingToPoint(origin, 180, radius);
    const w = bearingToPoint(origin, 270, radius);

    line(svg, origin, n, "bearing-north");
    line(svg, origin, e, "bearing-north");
    line(svg, origin, s, "bearing-north");
    line(svg, origin, w, "bearing-north");
    drawArrowHead(svg, n, -90, 12, "bearing-north");
    drawArrowHead(svg, e, 0, 12, "bearing-north");
    drawArrowHead(svg, s, 90, 12, "bearing-north");
    drawArrowHead(svg, w, 180, 12, "bearing-north");

    if (showAllLabels) {
      text(svg, "N", n.x, n.y - 22, "bearing-label");
      text(svg, "E", e.x + 23, e.y, "bearing-label");
      text(svg, "S", s.x, s.y + 24, "bearing-label");
      text(svg, "W", w.x - 24, w.y, "bearing-label");
    } else {
      text(svg, "N", n.x, n.y - 22, "bearing-label");
    }

    if (dot) {
      svg.appendChild(el("circle", { cx: origin.x, cy: origin.y, r: 6, class: "bearing-point" }));
    }
  }

  function compassReferenceForBearing(bearing) {
    const b = normaliseBearing(bearing);
    if (b > 0 && b < 90) return { start: 0, angle: b, text: `N ${Math.round(b)}° E` };
    if (b > 90 && b < 180) return { start: 180, angle: 180 - b, text: `S ${Math.round(180 - b)}° E` };
    if (b > 180 && b < 270) return { start: 180, angle: b - 180, text: `S ${Math.round(b - 180)}° W` };
    if (b > 270 && b < 360) return { start: 0, angle: 360 - b, text: `N ${Math.round(360 - b)}° W` };
    return { start: b, angle: 0, text: formatBearingLabel(b) };
  }

  function drawBearingAngle(svg, origin, startBearing, endBearing, label, radius = 58, options = {}) {
    const preferClockwise = options.preferClockwise ?? null;
    svg.appendChild(el("path", {
      d: bearingArcPathBetween(origin, startBearing, endBearing, radius, preferClockwise),
      class: options.cls || "bearing-arc"
    }));

    const diff = preferClockwise === true
      ? (normaliseBearing(endBearing) - normaliseBearing(startBearing) + 360) % 360
      : preferClockwise === false
        ? -((normaliseBearing(startBearing) - normaliseBearing(endBearing) + 360) % 360)
        : shortestBearingDiff(startBearing, endBearing);

    const midBearing = normaliseBearing(startBearing + diff / 2);
    const labelPoint = bearingToPoint(origin, midBearing, radius + (options.labelOffset ?? 35));
    text(svg, label, labelPoint.x + (options.labelDx || 0), labelPoint.y + (options.labelDy || 0), "bearing-label");
  }

  function drawBearingRay(svg, origin, bearing, length, cls = "bearing-ray") {
    const endpoint = bearingToPoint(origin, bearing, length);
    line(svg, origin, endpoint, cls);
    drawArrowHead(svg, endpoint, bearingToScreenAngle(bearing), 13, cls);
    return endpoint;
  }

  function renderBearingDiagram(target, config = {}) {
    const svg = makeSvg("bearing diagram");
    const origin = { x: Number(config.originX ?? VIEW.w / 2), y: Number(config.originY ?? VIEW.h / 2 + 25) };
    const bearing = normaliseBearing(config.bearing ?? 65);
    const rayLength = Number(config.rayLength ?? 175);
    const endpoint = bearingToPoint(origin, bearing, rayLength);
    const mode = String(config.mode || "true");
    const axisRadius = Number(config.axisRadius ?? 118);
    const label = config.bearingLabel ?? (config.showBearingValue ? formatBearingLabel(bearing) : "?");

    drawBearingAxes(svg, origin, axisRadius, { showAllLabels: config.showCardinalLabels !== false });
    line(svg, origin, endpoint, "bearing-ray");
    drawArrowHead(svg, endpoint, bearingToScreenAngle(bearing), 13, "bearing-ray");
    svg.appendChild(el("circle", { cx: endpoint.x, cy: endpoint.y, r: 6, class: "bearing-point" }));

    text(svg, config.pointLabel || "O", origin.x - 22, origin.y + 24, "bearing-label");
    text(svg, config.targetLabel || "A", endpoint.x + (config.targetDx ?? 22), endpoint.y + (config.targetDy ?? -18), "bearing-label");

    let startBearing = Number(config.referenceBearing ?? 0);
    let arcLabel = label;
    let preferClockwise = null;

    if (mode === "compass" && config.referenceBearing == null) {
      const ref = compassReferenceForBearing(bearing);
      startBearing = ref.start;
      arcLabel = config.bearingLabel ?? `${Math.round(ref.angle)}°`;
    }

    if (mode === "true" && config.referenceBearing == null) {
      startBearing = 0;
      preferClockwise = true;
    }

    if (config.referenceBearing != null && config.angleLabel != null) {
      arcLabel = config.angleLabel;
    }

    drawBearingAngle(svg, origin, startBearing, bearing, arcLabel, Number(config.arcRadius ?? 58), { preferClockwise });

    if (config.distanceLabel) {
      drawSegmentLabel(svg, origin, endpoint, config.distanceLabel, { dx: 0, dy: -22, cls: "trig-label" });
    }

    if (config.caption) {
      text(svg, config.caption, VIEW.w / 2, VIEW.h - 24, "trig-caption");
    }

    target.innerHTML = "";
    target.appendChild(svg);
  }

  function renderBearingTriangle(target, config = {}) {
    const svg = makeSvg("bearing right-triangle diagram");
    const origin = { x: Number(config.originX ?? VIEW.w / 2), y: Number(config.originY ?? VIEW.h / 2 + 28) };
    const bearing = normaliseBearing(config.bearing ?? 45);
    const rayLength = Number(config.hypotenusePx ?? 170);
    const endpoint = bearingToPoint(origin, bearing, rayLength);
    const arcRadius = Number(config.arcRadius ?? 50);
    const xFoot = { x: endpoint.x, y: origin.y };
    const yFoot = { x: origin.x, y: endpoint.y };

    drawBearingAxes(svg, origin, Number(config.axisRadius ?? 116), { showAllLabels: true });
    line(svg, origin, endpoint, "bearing-ray");
    drawArrowHead(svg, endpoint, bearingToScreenAngle(bearing), 13, "bearing-ray");
    svg.appendChild(el("circle", { cx: endpoint.x, cy: endpoint.y, r: 6, class: "bearing-point" }));

    if (config.showProjections !== false) {
      line(svg, endpoint, xFoot, "bearing-guide");
      line(svg, endpoint, yFoot, "bearing-guide");

      if (Math.abs(endpoint.x - origin.x) > 20 && Math.abs(endpoint.y - origin.y) > 20) {
        const corner = { x: endpoint.x, y: origin.y };
        drawRightAngle(svg, corner, origin, endpoint);
      }
    }

    const angleLabel = config.angleLabel || formatBearingLabel(bearing);
    drawBearingAngle(svg, origin, 0, bearing, angleLabel, arcRadius, {
      preferClockwise: true,
      labelOffset: Number(config.angleLabelOffset ?? 12),
      labelDx: Number(config.angleLabelDx ?? 0),
      labelDy: Number(config.angleLabelDy ?? 0)
    });

    const hypotenuseNormalOffset = endpoint.x >= origin.x ? 28 : -28;
    drawSegmentLabel(svg, origin, endpoint, config.hypotenuseLabel || config.distanceLabel, {
      dx: Number(config.hypotenuseLabelDx ?? 0),
      dy: Number(config.hypotenuseLabelDy ?? 0),
      cls: "trig-label",
      t: Number(config.hypotenuseLabelT ?? 0.66),
      normalOffset: Number(config.hypotenuseLabelOffset ?? hypotenuseNormalOffset)
    });

    if (config.eastLabel || config.westLabel || config.horizontalLabel) {
      const horizontalLabel = config.eastLabel || config.westLabel || config.horizontalLabel;
      drawSegmentLabel(svg, origin, { x: endpoint.x, y: origin.y }, horizontalLabel, { dy: endpoint.y < origin.y ? 30 : -30, cls: "trig-label" });
    }

    if (config.northLabel || config.southLabel || config.verticalLabel) {
      const verticalLabel = config.northLabel || config.southLabel || config.verticalLabel;
      drawSegmentLabel(svg, { x: endpoint.x, y: origin.y }, endpoint, verticalLabel, { dx: endpoint.x >= origin.x ? 40 : -40, cls: "trig-label" });
    }

    text(svg, config.pointLabel || "A", origin.x - 22, origin.y + 24, "bearing-label");
    text(svg, config.targetLabel || "B", endpoint.x + (endpoint.x >= origin.x ? 24 : -24), endpoint.y - 18, "bearing-label");

    if (config.caption) {
      text(svg, config.caption, VIEW.w / 2, VIEW.h - 24, "trig-caption");
    }

    target.innerHTML = "";
    target.appendChild(svg);
  }


  function renderNonRightTriangleC(target, config = {}) {
    const svg = makeSvg(config.ariaLabel || "non-right triangle trigonometry diagram");

    const raw = config.vertices || {
      A: { x: 0, y: -150 },
      B: { x: -150, y: 110 },
      C: { x: 180, y: 115 }
    };

    const labels = config.vertexLabels || { A: "A", B: "B", C: "C" };
    const sourcePoints = [
      { key: "A", ...raw.A },
      { key: "B", ...raw.B },
      { key: "C", ...raw.C }
    ];

    const fitted = fitPoints(sourcePoints, {
      marginX: Number(config.marginX ?? 96),
      marginY: Number(config.marginY ?? 70),
      centerX: Number(config.centerX ?? VIEW.w / 2),
      centerY: Number(config.centerY ?? VIEW.h / 2),
      // Stage 5 Trigonometry C uses real side lengths such as 6, 11 and 17.
      // These are data values, not SVG coordinates, so allow the triangle to
      // scale up to fill the diagram panel instead of being capped at 2.2x.
      maxScale: Number(config.maxScale ?? 28)
    });

    const P = {
      A: fitted[0],
      B: fitted[1],
      C: fitted[2]
    };

    const centroid = {
      x: (P.A.x + P.B.x + P.C.x) / 3,
      y: (P.A.y + P.B.y + P.C.y) / 3
    };

    function outwardLabel(a, b, label, opts = {}) {
      if (!label) return;
      const m = midpoint(a, b);
      const u = unitVector(a, b);
      let n = { x: -u.y, y: u.x };
      const away = { x: m.x - centroid.x, y: m.y - centroid.y };
      if (n.x * away.x + n.y * away.y < 0) n = { x: -n.x, y: -n.y };

      text(
        svg,
        label,
        m.x + n.x * Number(opts.offset ?? 42) + Number(opts.dx ?? 0),
        m.y + n.y * Number(opts.offset ?? 42) + Number(opts.dy ?? 0),
        opts.cls || "trig-label"
      );
    }

    polygon(svg, [P.A, P.B, P.C], config.fillClass || "trig-fill");

    if (config.showDashedAltitude) {
      const foot = config.altitudeFoot === "BC"
        ? { x: P.A.x, y: P.B.y }
        : { x: P.A.x, y: P.C.y };
      line(svg, P.A, foot, "trig-guide");
    }

    const sideLabels = config.sideLabels || {};
    outwardLabel(P.B, P.C, sideLabels.a || sideLabels.BC || sideLabels.CB, config.sideLabelOptions?.a || {});
    outwardLabel(P.A, P.C, sideLabels.b || sideLabels.AC || sideLabels.CA, config.sideLabelOptions?.b || {});
    outwardLabel(P.A, P.B, sideLabels.c || sideLabels.AB || sideLabels.BA, config.sideLabelOptions?.c || {});

    const angleLabels = config.angleLabels || {};
    if (angleLabels.A) drawAngleArc(svg, P.A, P.B, P.C, angleLabels.A, { radius: Number(config.angleRadiusA ?? 42), labelRadius: Number(config.angleLabelRadiusA ?? 70) });
    if (angleLabels.B) drawAngleArc(svg, P.B, P.A, P.C, angleLabels.B, { radius: Number(config.angleRadiusB ?? 42), labelRadius: Number(config.angleLabelRadiusB ?? 70) });
    if (angleLabels.C) drawAngleArc(svg, P.C, P.A, P.B, angleLabels.C, { radius: Number(config.angleRadiusC ?? 42), labelRadius: Number(config.angleLabelRadiusC ?? 70) });

    const vertexOffsets = config.vertexOffsets || {
      A: { dx: 0, dy: -26 },
      B: { dx: -24, dy: 24 },
      C: { dx: 24, dy: 24 }
    };

    ["A", "B", "C"].forEach(key => {
      const offset = vertexOffsets[key] || { dx: 0, dy: 0 };
      text(svg, labels[key] || key, P[key].x + Number(offset.dx || 0), P[key].y + Number(offset.dy || 0), "trig-vertex");
    });

    if (config.caption) {
      text(svg, config.caption, VIEW.w / 2, VIEW.h - 28, "trig-caption");
    }

    target.innerHTML = "";
    target.appendChild(svg);
  }

  function renderBlankDiagramSpace(target, config = {}) {
    const svg = makeSvg(config.ariaLabel || "blank diagram space");

    // Student-drawn diagram spaces need to behave differently from generated
    // diagrams: they should use the full question width, have a plain white
    // drawing area, and be tall enough for pencil-and-paper sketches.
    const isLarge = config.size === "large";
    const wrapper = target.closest?.(".question-diagram") || target;

    if (config.fullWidth !== false) {
      wrapper.style.maxWidth = config.maxWidth || "none";
      wrapper.style.width = config.wrapperWidth || "100%";
      wrapper.style.marginLeft = config.marginLeft || "0";
      wrapper.style.marginRight = config.marginRight || "0";
      wrapper.style.marginTop = config.marginTop || "5mm";
      wrapper.style.marginBottom = config.marginBottom || "6mm";
      wrapper.style.alignItems = "stretch";
      wrapper.style.justifyContent = "stretch";
      wrapper.style.minHeight = config.wrapperMinHeight || (isLarge ? "98mm" : "84mm");
    }

    target.style.width = "100%";

    // Near-full viewBox dimensions so the drawn box aligns visually with the
    // prompt/answer-space margins instead of sitting as a small centred box.
    const x = Number(config.x ?? 6);
    const y = Number(config.y ?? 12);
    const w = Number(config.w ?? (VIEW.w - 12));
    const h = Number(config.h ?? (isLarge ? 350 : 300));

    svg.appendChild(el("rect", {
      x,
      y,
      width: w,
      height: h,
      rx: 3,
      fill: "#ffffff",
      stroke: config.showBorder === false ? "none" : (config.stroke || "#111827"),
      "stroke-width": config.showBorder === false ? 0 : Number(config.strokeWidth ?? 2.4)
    }));

    if (config.caption) {
      const captionY = Math.min(VIEW.h - 18, y + h + 36);
      text(svg, config.caption, VIEW.w / 2, captionY, "trig-caption");
    }

    target.innerHTML = "";
    target.appendChild(svg);
  }

  function renderRectangularPrism3dC(target, config = {}) {
    const svg = makeSvg(config.ariaLabel || "rectangular prism trigonometry diagram");

    const x = Number(config.x ?? 180);
    const y = Number(config.y ?? 150);
    const w = Number(config.w ?? 260);
    const h = Number(config.h ?? 110);
    const dx = Number(config.dx ?? 88);
    const dy = Number(config.dy ?? -62);

    const A = { x, y: y + h };                 // front-bottom-left
    const B = { x: x + w, y: y + h };          // front-bottom-right
    const C = { x: x + w + dx, y: y + h + dy };// back-bottom-right
    const D = { x: x + dx, y: y + h + dy };    // back-bottom-left
    const E = { x, y };                        // front-top-left
    const F = { x: x + w, y };                 // front-top-right
    const G = { x: x + w + dx, y: y + dy };    // back-top-right
    const H = { x: x + dx, y: y + dy };        // back-top-left

    const points = { A, B, C, D, E, F, G, H };

    const visible = [A, B, C, G, F, E, A, D, C, B, F, G, H, E];
    for (let i = 0; i < visible.length - 1; i++) line(svg, visible[i], visible[i + 1], "trig-side");

    line(svg, D, H, "trig-guide");
    line(svg, D, A, "trig-guide");
    line(svg, D, C, "trig-guide");

    const variants = {
      "A-G": { space: ["A", "G"], face: ["A", "C"], height: ["C", "G"], heightSide: "right" },
      "B-H": { space: ["B", "H"], face: ["B", "D"], height: ["D", "H"], heightSide: "left" },
      "C-E": { space: ["C", "E"], face: ["C", "A"], height: ["A", "E"], heightSide: "left" },
      "D-F": { space: ["D", "F"], face: ["D", "B"], height: ["B", "F"], heightSide: "right" }
    };

    const variantKey = variants[config.diagonalVariant] ? config.diagonalVariant : "A-G";
    const variant = variants[variantKey];
    const faceA = points[variant.face[0]];
    const faceB = points[variant.face[1]];
    const spaceA = points[variant.space[0]];
    const spaceB = points[variant.space[1]];
    const heightA = points[variant.height[0]];
    const heightB = points[variant.height[1]];

    if (config.showFaceDiagonal) {
      line(svg, faceA, faceB, "trig-angle secondary");
      drawSegmentLabel(svg, faceA, faceB, config.faceDiagonalLabel || "face diagonal", { normalOffset: -24, cls: "trig-label" });
    }

    if (config.showSpaceDiagonal) {
      line(svg, spaceA, spaceB, "trig-angle");
      drawSegmentLabel(svg, spaceA, spaceB, config.spaceDiagonalLabel || "space diagonal", { normalOffset: -28, cls: "trig-label" });
    }

    if (config.lengthLabel) drawSegmentLabel(svg, A, B, config.lengthLabel, { dy: 30, cls: "trig-label" });
    if (config.widthLabel) drawSegmentLabel(svg, B, C, config.widthLabel, { dx: 32, dy: 18, cls: "trig-label" });

    if (config.heightLabel) {
      // Keep the height dimension on the clear outside right vertical edge.
      // It should not change position when the chosen space diagonal changes.
      const edgeTop = G;
      const edgeBottom = C;
      const offsetX = Number(config.heightDimensionOffsetX ?? 60);
      const top = { x: edgeTop.x + offsetX, y: edgeTop.y };
      const bottom = { x: edgeBottom.x + offsetX, y: edgeBottom.y };
      drawDoubleArrow(svg, top, bottom, config.heightLabel, {
        cls: "bearing-north",
        labelCls: "trig-label",
        labelDx: 44,
        labelDy: 0,
        arrowSize: 9
      });
      line(svg, edgeTop, top, "trig-guide");
      line(svg, edgeBottom, bottom, "trig-guide");
    }

    const vertexLabels = config.vertexLabels || {};
    Object.entries(points).forEach(([key, point]) => {
      if (!vertexLabels[key]) return;
      text(svg, vertexLabels[key], point.x + Number(vertexLabels[`${key}Dx`] || 0), point.y + Number(vertexLabels[`${key}Dy`] || -18), "trig-vertex");
    });

    if (config.caption) {
      text(svg, config.caption, VIEW.w / 2, VIEW.h - 28, "trig-caption");
    }

    target.innerHTML = "";
    target.appendChild(svg);
  }

  function renderTentPole3dC(target, config = {}) {
    const svg = makeSvg(config.ariaLabel || "3D elevation and bearing diagram");

    const base = { x: Number(config.baseX ?? 355), y: Number(config.baseY ?? 300) };
    const top = { x: base.x, y: Number(config.topY ?? 105) };
    const pegA = { x: Number(config.pegAX ?? 130), y: Number(config.pegAY ?? 358) };
    const pegB = { x: Number(config.pegBX ?? 588), y: Number(config.pegBY ?? 358) };
    const footB = { x: Number(config.footBX ?? 510), y: Number(config.footBY ?? 300) };

    line(svg, base, top, "trig-side");
    line(svg, base, pegA, "trig-guide");
    line(svg, base, pegB, "trig-guide");
    line(svg, top, pegA, "trig-side");
    line(svg, top, pegB, "trig-side");
    line(svg, base, footB, "trig-side");
    line(svg, footB, pegB, "trig-side");

    drawRightAngle(svg, base, { x: base.x + 38, y: base.y }, { x: base.x, y: base.y - 38 });
    drawRightAngle(svg, base, pegA, pegB);

    drawAngleArc(svg, pegA, base, top, config.angleALabel || "43°", { radius: 38, labelRadius: 66 });
    drawAngleArc(svg, pegB, base, top, config.angleBLabel || "39°", { radius: 38, labelRadius: 66 });

    drawSegmentLabel(svg, base, top, config.heightLabel || "2.1 m", { dx: 32, cls: "trig-label" });
    drawSegmentLabel(svg, top, pegA, config.ropeALabel || "", { normalOffset: -24, cls: "trig-label" });
    drawSegmentLabel(svg, top, pegB, config.ropeBLabel || "", { normalOffset: 24, cls: "trig-label" });

    text(svg, config.topLabel || "top", top.x + 24, top.y - 16, "trig-small-label");
    text(svg, config.baseLabel || "base", base.x + 34, base.y + 18, "trig-small-label");
    text(svg, config.pegALabel || "peg A", pegA.x - 18, pegA.y + 24, "trig-small-label");
    text(svg, config.pegBLabel || "peg B", pegB.x + 20, pegB.y + 24, "trig-small-label");

    if (config.caption) {
      text(svg, config.caption, VIEW.w / 2, VIEW.h - 24, "trig-caption");
    }

    target.innerHTML = "";
    target.appendChild(svg);
  }

  function render3DBearingElevationC(target, config = {}) {
    const svg = makeSvg(config.ariaLabel || "3D bearing and elevation diagram");

    const bearing = normaliseBearing(config.bearing ?? 36);
    let origin = {
      x: Number(config.originX ?? VIEW.w / 2),
      y: Number(config.originY ?? 300)
    };

    const groundLength = Number(config.groundLength ?? 142);
    let targetPoint = (config.targetX !== undefined && config.targetY !== undefined)
      ? { x: Number(config.targetX), y: Number(config.targetY) }
      : bearingToPoint(origin, bearing, groundLength);

    let verticalTop = {
      x: targetPoint.x,
      y: Number(config.topY ?? (targetPoint.y - Number(config.verticalPx ?? 118)))
    };

    let northTop = { x: origin.x, y: origin.y - 118 };
    let eastEnd = { x: origin.x + 150, y: origin.y };

    // Keep every 3D bearing/elevation diagram inside its own SVG box so it
    // cannot spill into the answer-writing space below. This matters most for
    // southern bearings, where the ground point is below the observer in screen
    // coordinates.
    if (config.autoFit !== false) {
      const pts = [origin, targetPoint, verticalTop, northTop, eastEnd];
      const xs = pts.map(p => p.x);
      const ys = pts.map(p => p.y);
      let shiftX = 0;
      let shiftY = 0;
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      if (minX < 88) shiftX = 88 - minX;
      if (maxX + shiftX > VIEW.w - 88) shiftX = VIEW.w - 88 - maxX;
      if (minY < 78) shiftY = 78 - minY;
      if (maxY + shiftY > VIEW.h - 78) shiftY = VIEW.h - 78 - maxY;

      const move = p => ({ x: p.x + shiftX, y: p.y + shiftY });
      origin = move(origin);
      targetPoint = move(targetPoint);
      verticalTop = move(verticalTop);
      northTop = move(northTop);
      eastEnd = move(eastEnd);
    }

    line(svg, origin, northTop, "bearing-north");
    drawArrowHead(svg, northTop, -90, 13, "bearing-north");
    line(svg, origin, eastEnd, "bearing-north");
    drawArrowHead(svg, eastEnd, 0, 13, "bearing-north");
    text(svg, "N", northTop.x, northTop.y - 24, "bearing-label");
    text(svg, "E", eastEnd.x + 24, eastEnd.y, "bearing-label");

    // Horizontal ground bearing from the observer to the point directly below the object.
    line(svg, origin, targetPoint, "trig-guide");
    // Vertical height and line of sight.
    line(svg, targetPoint, verticalTop, "trig-side");
    line(svg, origin, verticalTop, "trig-side");
    drawRightAngle(svg, targetPoint, origin, verticalTop);

    drawBearingAngle(svg, origin, 0, bearing, config.bearingLabel || formatBearingLabel(bearing), Number(config.bearingArcRadius ?? 56), {
      preferClockwise: true,
      labelOffset: Number(config.bearingLabelOffset ?? 18),
      labelDx: Number(config.bearingLabelDx ?? 0),
      labelDy: Number(config.bearingLabelDy ?? 0)
    });

    drawAngleArc(svg, origin, targetPoint, verticalTop, config.elevationLabel || "29°", {
      radius: Number(config.elevationRadius ?? 42),
      labelRadius: Number(config.elevationLabelRadius ?? 68),
      labelDx: Number(config.elevationLabelDx ?? 0),
      labelDy: Number(config.elevationLabelDy ?? 0)
    });

    const heightDx = targetPoint.x >= origin.x ? 40 : -40;
    drawSegmentLabel(svg, targetPoint, verticalTop, config.heightLabel || "30 m", { dx: Number(config.heightLabelDx ?? heightDx), cls: "trig-label" });
    drawSegmentLabel(svg, origin, targetPoint, config.horizontalLabel || "", { normalOffset: Number(config.horizontalLabelOffset ?? 28), cls: "trig-label" });
    drawSegmentLabel(svg, origin, verticalTop, config.sightLabel || "", { normalOffset: Number(config.sightLabelOffset ?? -34), cls: "trig-label" });

    text(svg, config.originLabel || "P", origin.x - 24, origin.y + 26, "bearing-label");
    text(svg, config.targetLabel || "D", targetPoint.x + (targetPoint.x >= origin.x ? 24 : -24), targetPoint.y + 20, "bearing-label");
    text(svg, config.topLabel || "object", verticalTop.x + (targetPoint.x >= origin.x ? 30 : -30), verticalTop.y - 14, "bearing-label");

    if (config.caption) {
      text(svg, config.caption, VIEW.w / 2, VIEW.h - 24, "trig-caption");
    }

    target.innerHTML = "";
    target.appendChild(svg);
  }

  function render(target, config = {}) {
    if (!target) return;

    const diagramType = config.diagramType || config.type || "right-triangle";

    if (diagramType === "similar-right-triangles") {
      renderSimilarRightTriangles(target, config);
      return;
    }

    if (diagramType === "practical-trig") {
      renderPracticalTrig(target, config);
      return;
    }

    if (diagramType === "bearing-diagram") {
      renderBearingDiagram(target, config);
      return;
    }

    if (diagramType === "bearing-triangle") {
      renderBearingTriangle(target, config);
      return;
    }

    if (diagramType === "non-right-triangle") {
      renderNonRightTriangleC(target, config);
      return;
    }

    if (diagramType === "blank-diagram-space") {
      renderBlankDiagramSpace(target, config);
      return;
    }

    if (diagramType === "rectangular-prism-3d") {
      renderRectangularPrism3dC(target, config);
      return;
    }

    if (diagramType === "tent-pole-3d") {
      renderTentPole3dC(target, config);
      return;
    }

    if (diagramType === "bearing-elevation-3d") {
      render3DBearingElevationC(target, config);
      return;
    }

    renderRightTriangle(target, config);
  }

  return { render };
})();
