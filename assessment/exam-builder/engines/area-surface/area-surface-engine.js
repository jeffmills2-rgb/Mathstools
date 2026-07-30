/*
  MMT Exam Builder — Area and Surface Area Engine
  ------------------------------------------------
  Save as: engines/area-surface/area-surface-engine.js

  Renders Stage 5 Area and Surface Area A diagrams.
*/
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const ink = "#111827";
  const accent = "#b31983";
  const fill = "#eef6ff";
  const greenFill = "#dcfce7";
  const soft = "#eaf2ff";

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function attrs(obj = {}) {
    return Object.entries(obj)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
      .join(" ");
  }

  function svg(width, height, body, extra = "") {
    return `<svg xmlns="${NS}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Area and surface area diagram" ${extra}>${body}</svg>`;
  }

  function line(x1, y1, x2, y2, options = {}) {
    return `<line ${attrs({ x1, y1, x2, y2, stroke: options.stroke || ink, "stroke-width": options.width || 4, "stroke-linecap": options.cap || "round", "stroke-dasharray": options.dash })}/>`;
  }

  function rect(x, y, w, h, options = {}) {
    return `<rect ${attrs({ x, y, width: w, height: h, rx: options.rx || 0, fill: options.fill || "none", stroke: options.stroke || ink, "stroke-width": options.width || 4, "stroke-dasharray": options.dash })}/>`;
  }

  function path(d, options = {}) {
    return `<path ${attrs({ d, fill: options.fill || "none", stroke: options.stroke || ink, "stroke-width": options.width || 4, "stroke-linejoin": options.join || "round", "stroke-linecap": options.cap || "round", "stroke-dasharray": options.dash })}/>`;
  }

  function text(x, y, value, options = {}) {
    const anchor = options.anchor || "middle";
    const size = options.size || 24;
    const weight = options.weight || 700;
    return `<text ${attrs({ x, y, "text-anchor": anchor, "font-family": options.font || "Cambria Math, STIX Two Math, Times New Roman, serif", "font-size": size, "font-weight": weight, fill: options.fill || ink })}>${escapeHtml(value)}</text>`;
  }

  function dimText(x, y, value, options = {}) {
    return text(x, y, value, { size: 22, weight: 700, ...options });
  }

  function arrowMarker() {
    return `<defs><marker id="arrow-area-surface" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="${ink}"/></marker></defs>`;
  }

  function doubleArrow(x1, y1, x2, y2) {
    return `<line ${attrs({ x1, y1, x2, y2, stroke: ink, "stroke-width": 2, "marker-start": "url(#arrow-area-surface)", "marker-end": "url(#arrow-area-surface)" })}/>`;
  }

  function renderRectilinear(c = {}) {
    const W = 360, H = 230;
    const x = 120, y = 60, w = 250, h = 170, cutW = 105, cutH = 90;
    const d = `M${x} ${y} H${x+w} V${y+h} H${x+w-cutW} V${y+cutH} H${x} Z`;
    return svg(520, 330, `
      ${path(d, { fill, stroke: accent, width: 4 })}
      ${dimText(x+w/2, y-14, c.top || "24 cm")}
      ${dimText(x-28, y+cutH/2, c.left || "10 cm")}
      ${dimText(x+w+32, y+h/2, c.right || "28 cm")}
      ${dimText(x+w-cutW/2, y+h+28, c.bottom || "12 cm")}
      ${dimText(x+w-cutW-22, y+cutH+h/2-20, c.inner || "14 cm")}
    `);
  }

  function renderShaded(c = {}) {
    const outerW = 310, outerH = 170;
    const x = 105, y = 70;
    const holeW = 140, holeH = 62;
    const hx = x + 85, hy = y + 52;
    return svg(540, 320, `
      ${rect(x, y, outerW, outerH, { fill: greenFill, stroke: "#42ad49", width: 4 })}
      ${rect(hx, hy, holeW, holeH, { fill: "white", stroke: "#42ad49", width: 4 })}
      ${dimText(x + outerW/2, y + outerH + 28, c.outerWidth || "45 m")}
      ${dimText(x + outerW + 42, y + outerH/2, c.outerHeight || "20 m")}
      ${dimText(hx + holeW/2, hy - 12, c.holeWidth || "30 m")}
      ${dimText(hx + holeW + 34, hy + holeH/2 + 8, c.holeHeight || "10 m")}
    `);
  }

function renderCircleComposite(c = {}) {
    const x = 155, y = 118, w = 190, rectH = 118, r = w / 2;
    const baseY = y + rectH;
    return svg(540, 330, `
      ${path(`M${x} ${baseY} V${y} A${r} ${r} 0 0 1 ${x+w} ${y} V${baseY} Z`, { fill: soft, stroke: accent, width: 4 })}
      ${line(x, y, x+w, y, { stroke: accent, width: 3, dash: "8 8" })}
      ${doubleArrow(x+w+38, y, x+w+38, baseY)}
      ${doubleArrow(x, baseY+34, x+w, baseY+34)}
      ${dimText(x+w+70, y+rectH/2+8, c.height || "5.5 m")}
      ${dimText(x+w/2, baseY+65, c.width || "4.8 m")}
    `);
  }

function renderRectanglePrism(c = {}) {
    const x = 120, y = 115, w = 190, h = 105, dx = 75, dy = -55;
    return svg(560, 330, `
      ${path(`M${x} ${y} H${x+w} V${y+h} H${x} Z`, { stroke: accent, width: 4 })}
      ${path(`M${x+w} ${y} L${x+w+dx} ${y+dy} V${y+h+dy} L${x+w} ${y+h}`, { stroke: accent, width: 4 })}
      ${path(`M${x} ${y} L${x+dx} ${y+dy} H${x+w+dx}`, { stroke: accent, width: 4 })}
      ${line(x+dx, y+dy, x+dx, y+h+dy, { stroke: accent, width: 2.5, dash: "8 8" })}
      ${line(x+dx, y+h+dy, x+w+dx, y+h+dy, { stroke: accent, width: 2.5, dash: "8 8" })}
      ${line(x, y+h, x+dx, y+h+dy, { stroke: accent, width: 2.5, dash: "8 8" })}
      ${dimText(x+w/2, y+h+34, c.length || "18 cm")}
      ${dimText(x+w+dx+40, y+h/2+dy/2, c.width || "12 cm")}
      ${dimText(x-35, y+h/2, c.height || "10 cm")}
    `);
  }

  function renderTriangularPrism(c = {}) {
    const ax = 95, ay = 230, bx = 185, by = 230, cx = 135, cy = 120;
    const dx = 220, dy = -34;
    return svg(620, 330, `
      ${path(`M${ax} ${ay} L${bx} ${by} L${cx} ${cy} Z`, { stroke: "#42ad49", width: 4 })}
      ${path(`M${ax+dx} ${ay+dy} L${bx+dx} ${by+dy} L${cx+dx} ${cy+dy} Z`, { stroke: "#42ad49", width: 4 })}
      ${line(ax,ay,ax+dx,ay+dy,{stroke:"#42ad49",width:4})}
      ${line(bx,by,bx+dx,by+dy,{stroke:"#42ad49",width:4})}
      ${line(cx,cy,cx+dx,cy+dy,{stroke:"#42ad49",width:4})}
      ${line(cx+dx, cy+dy, ax+dx, ay+dy, { stroke: "#42ad49", width: 2.5, dash: "8 8" })}
      ${dimText((ax+bx)/2, ay+30, c.base || "6 cm")}
      ${dimText(ax-40, (ay+cy)/2, c.height || "4 cm")}
      ${dimText((bx+cx)/2+25, (by+cy)/2, c.side || "5 cm")}
      ${dimText((bx+bx+dx)/2+20, by+dy/2+30, c.length || "15 cm")}
    `);
  }

  function renderTrapezoidalPrism(c = {}) {
    const p = [[95,220],[250,220],[210,110],[130,110]];
    const dx = 210, dy = -30;
    const poly = pts => `M${pts.map(pt => pt.join(" ")).join(" L")} Z`;
    return svg(660, 340, `
      ${path(poly(p), { stroke: accent, width: 4 })}
      ${path(poly(p.map(([x,y]) => [x+dx,y+dy])), { stroke: accent, width: 4 })}
      ${p.map(([x,y]) => line(x,y,x+dx,y+dy,{stroke:accent,width:4})).join("")}
      ${line(130+dx,110+dy,95+dx,220+dy,{stroke:accent,width:2.4,dash:"8 8"})}
      ${line(95+dx,220+dy,250+dx,220+dy,{stroke:accent,width:2.4,dash:"8 8"})}
      ${dimText(172, 252, c.bottom || "18 cm")}
      ${dimText(178, 92, c.top || "11 cm")}
      ${dimText(64, 162, c.height || "6 cm")}
      ${dimText(330, 246, c.length || "16 cm")}
      ${dimText(268, 146, c.side || "7.7 cm")}
    `);
  }

function renderCompositePrism(c = {}) {
    // Front face is a step-shaped prism. Visible outside/back edges are solid;
    // only genuinely hidden rear/interior construction edges are dashed.
    const front = [[105,255],[105,185],[250,185],[250,145],[398,145],[398,255]];
    const dx = 90, dy = -58;
    const back = front.map(([x,y]) => [x+dx, y+dy]);
    const poly = pts => `M${pts.map(([x,y]) => `${x} ${y}`).join(" L")} Z`;
    const hidden = { stroke: accent, width: 2.4, dash: "8 8" };
    const solid = { stroke: accent, width: 4 };

    return svg(660, 360, `
      ${path(poly(front), solid)}

      <!-- visible depth edges -->
      ${line(front[1][0], front[1][1], back[1][0], back[1][1], solid)}
      ${line(front[2][0], front[2][1], back[2][0], back[2][1], solid)}
      ${line(front[3][0], front[3][1], back[3][0], back[3][1], solid)}
      ${line(front[4][0], front[4][1], back[4][0], back[4][1], solid)}
      ${line(front[5][0], front[5][1], back[5][0], back[5][1], solid)}

      <!-- visible rear/top outside edges -->
      ${line(back[1][0], back[1][1], back[2][0], back[2][1], solid)}
      ${line(back[3][0], back[3][1], back[4][0], back[4][1], solid)}
      ${line(back[4][0], back[4][1], back[5][0], back[5][1], solid)}
      ${line(back[5][0], back[5][1], back[0][0], back[0][1], solid)}

      <!-- hidden rear/interior edges -->
      ${line(back[0][0], back[0][1], back[1][0], back[1][1], hidden)}
      ${line(back[2][0], back[2][1], back[3][0], back[3][1], hidden)}
      ${line(front[0][0], front[0][1], back[0][0], back[0][1], hidden)}

      ${dimText(305, 282, c.length || "36 cm")}
      ${dimText(178, 172, c.step || "28 cm")}
      ${dimText(530, 142, c.depth || "20 cm")}
      ${dimText(480, 236, c.height || "34 cm")}
    `);
  }

function netRect(x, y, w, h, label, fillColour = soft) {
    return `${rect(x,y,w,h,{fill:fillColour,stroke:ink,width:3})}${label?text(x+w/2,y+h/2+8,label,{size:20,weight:700}):""}`;
  }

  function renderNet(c = {}) {
    const x = 135, y = 90, a = 82, b = 54;
    return svg(570, 320, `
      ${netRect(x+a,y,a,b,"top")}
      ${netRect(x,y+b,a,b,"side")}
      ${netRect(x+a,y+b,a,b,"base")}
      ${netRect(x+2*a,y+b,a,b,"side")}
      ${netRect(x+3*a,y+b,a,b,"side")}
      ${netRect(x+a,y+2*b,a,b,"side")}
      ${dimText(x+a*2, y-18, c.length || "8 cm")}
      ${dimText(x-34, y+b*1.5+6, c.width || "5 cm")}
      ${dimText(x+a*4+30, y+b*1.5+6, c.height || "3 cm")}
    `);
  }

  function renderNetComparison() {
    return svg(690, 330, `
      ${text(110,42,"A",{size:28,fill:accent})}
      ${netRect(80,80,52,52,"")} ${netRect(132,80,52,52,"")} ${netRect(184,80,52,52,"")} ${netRect(236,80,52,52,"")}
      ${netRect(132,28,52,52,"")} ${netRect(132,132,52,52,"")}
      ${text(455,42,"B",{size:28,fill:accent})}
      ${netRect(340,110,46,46,"")} ${netRect(386,110,46,46,"")} ${netRect(432,110,46,46,"")} ${netRect(478,110,46,46,"")} ${netRect(524,110,46,46,"")}
      ${netRect(432,64,46,46,"")}
      ${text(170,242,"Which is a valid net?",{size:20,weight:700})}
    `);
  }

function renderCylinder(c = {}) {
    const x = 180, y = 80, w = 175, h = 185;
    return svg(560, 350, `
      ${path(`M${x} ${y+28} C${x+18} ${y-8} ${x+w-18} ${y-8} ${x+w} ${y+28}`, { stroke: "#b02d4d", width: 4 })}
      ${path(`M${x} ${y+28} C${x+18} ${y+58} ${x+w-18} ${y+58} ${x+w} ${y+28}`, { stroke: "#b02d4d", width: 4 })}
      ${line(x, y+28, x, y+h, { stroke: "#b02d4d", width: 4 })}
      ${line(x+w, y+28, x+w, y+h, { stroke: "#b02d4d", width: 4 })}
      ${path(`M${x} ${y+h} C${x+18} ${y+h-28} ${x+w-18} ${y+h-28} ${x+w} ${y+h}`, { stroke: "#b02d4d", width: 2, dash:"8 8" })}
      ${path(`M${x} ${y+h} C${x+18} ${y+h+36} ${x+w-18} ${y+h+36} ${x+w} ${y+h}`, { stroke: "#b02d4d", width: 4 })}
      ${doubleArrow(x-45, y+28, x-45, y+h)}
      ${doubleArrow(x, y-25, x+w, y-25)}
      ${dimText(x+w/2, y-38, c.diameter || "10 cm")}
      ${dimText(x-78, y+h/2+18, c.height || "14 cm")}
    `);
  }

function renderCylinderNet(c = {}) {
    const rx = 195, ry = 95, rw = 250, rh = 125;
    const leftCx = 135, rightCx = 505, cy = ry + rh / 2, cr = 45;
    return svg(650, 330, `
      ${arrowMarker()}
      <circle cx="${leftCx}" cy="${cy}" r="${cr}" fill="${soft}" stroke="#b02d4d" stroke-width="4"/>
      <circle cx="${rightCx}" cy="${cy}" r="${cr}" fill="${soft}" stroke="#b02d4d" stroke-width="4"/>
      ${rect(rx, ry, rw, rh, { fill: soft, stroke: "#b02d4d", width: 4 })}
      ${dimText(rx + rw/2, ry - 16, c.width || "25.1 cm")}
      ${doubleArrow(rx + 34, ry + 12, rx + 34, ry + rh - 12)}
      ${text(rx + 58, ry + rh/2 + 8, c.height || "10 cm", { size: 22, weight: 700, anchor: "start" })}
      ${text(rx + rw/2, ry + rh + 55, "Cylinder net", { size: 22, weight: 700 })}
    `);
  }

function renderHalfCylinder(c = {}) {
    const fx = 120, fy = 215, d = 120, rx = d / 2, dx = 215, dy = -35;
    const bx = fx + dx, by = fy + dy;
    return svg(620, 330, `
      ${path(`M${fx-rx} ${fy} A${rx} ${rx} 0 0 1 ${fx+rx} ${fy}`, { stroke: "#ad2746", width: 4 })}
      ${line(fx-rx, fy, fx+rx, fy, { stroke: "#ad2746", width: 4 })}
      ${path(`M${bx-rx} ${by} A${rx} ${rx} 0 0 1 ${bx+rx} ${by}`, { stroke: "#ad2746", width: 4 })}
      ${line(bx-rx, by, bx+rx, by, { stroke: "#ad2746", width: 4 })}
      ${line(fx-rx, fy, bx-rx, by, { stroke: "#ad2746", width: 4 })}
      ${line(fx+rx, fy, bx+rx, by, { stroke: "#ad2746", width: 4 })}
      ${line(fx, fy-rx, bx, by-rx, { stroke: "#ad2746", width: 4 })}
      ${line(fx-rx, fy, bx-rx, by, { stroke: "#ad2746", width: 2.2, dash: "8 8" })}
      ${line(fx+rx, fy, bx+rx, by, { stroke: "#ad2746", width: 2.2, dash: "8 8" })}
      ${dimText(fx, fy+33, c.diameter || "18 cm")}
      ${dimText((fx+bx)/2+20, (fy+by)/2+42, c.length || "30 cm")}
    `);
  }

function renderCompositeCylinder(c = {}) {
    const baseX = 105, baseY = 220, baseW = 410, baseSideH = 48;
    const topCX = 310, topY = 96, topW = 110, topH = 105;
    const maroon = "#ad2746";
    const topLeft = topCX - topW / 2;
    const topRight = topCX + topW / 2;
    const topBaseY = topY + topH;
    const largeDimY = 338;

    return svg(650, 385, `
      ${arrowMarker()}

      <!-- bottom cylinder, including the full top rim -->
      ${path(`M${baseX} ${baseY} C${baseX+38} ${baseY-36} ${baseX+baseW-38} ${baseY-36} ${baseX+baseW} ${baseY}`, { stroke: maroon, width: 4 })}
      ${path(`M${baseX} ${baseY} C${baseX+38} ${baseY+28} ${baseX+baseW-38} ${baseY+28} ${baseX+baseW} ${baseY}`, { stroke: maroon, width: 4 })}
      ${line(baseX, baseY, baseX, baseY + baseSideH, { stroke: maroon, width: 4 })}
      ${line(baseX+baseW, baseY, baseX+baseW, baseY + baseSideH, { stroke: maroon, width: 4 })}
      ${path(`M${baseX} ${baseY + baseSideH} C${baseX+38} ${baseY+baseSideH-20} ${baseX+baseW-38} ${baseY+baseSideH-20} ${baseX+baseW} ${baseY + baseSideH}`, { stroke: maroon, width: 2, dash: "8 8" })}
      ${path(`M${baseX} ${baseY + baseSideH} C${baseX+38} ${baseY+baseSideH+28} ${baseX+baseW-38} ${baseY+baseSideH+28} ${baseX+baseW} ${baseY + baseSideH}`, { stroke: maroon, width: 4 })}

      <!-- top cylinder positioned so its lower rim touches/overlaps the base top rim -->
      ${path(`M${topLeft} ${topY} C${topLeft+12} ${topY-24} ${topRight-12} ${topY-24} ${topRight} ${topY}`, { stroke: maroon, width: 4 })}
      ${path(`M${topLeft} ${topY} C${topLeft+12} ${topY+24} ${topRight-12} ${topY+24} ${topRight} ${topY}`, { stroke: maroon, width: 4 })}
      ${line(topLeft, topY, topLeft, topBaseY, { stroke: maroon, width: 4 })}
      ${line(topRight, topY, topRight, topBaseY, { stroke: maroon, width: 4 })}
      ${path(`M${topLeft} ${topBaseY} C${topLeft+12} ${topBaseY+21} ${topRight-12} ${topBaseY+21} ${topRight} ${topBaseY}`, { stroke: maroon, width: 4 })}
      ${path(`M${topLeft} ${topBaseY} C${topLeft+12} ${topBaseY-13} ${topRight-12} ${topBaseY-13} ${topRight} ${topBaseY}`, { stroke: maroon, width: 2, dash: "8 8" })}

      <!-- dimension lines: all are double-headed arrows -->
      ${doubleArrow(topLeft, topY - 42, topRight, topY - 42)}
      ${dimText(topCX, topY - 52, c.smallDiameter || "12 cm")}

      ${doubleArrow(topRight + 45, topY, topRight + 45, topBaseY)}
      ${dimText(topRight + 82, topY + topH/2 + 8, c.smallHeight || "15 cm")}

      ${c.largeHeight ? doubleArrow(baseX - 32, baseY, baseX - 32, baseY + baseSideH) : ""}
      ${c.largeHeight ? dimText(baseX - 68, baseY + baseSideH/2 + 8, c.largeHeight) : ""}

      ${doubleArrow(baseX, largeDimY, baseX + baseW, largeDimY)}
      ${dimText(baseX + baseW/2, largeDimY + 28, c.largeDiameter || "24 cm")}
    `);
  }

function render(root, config = {}) {
    if (!root) return;
    const type = config.diagramType || config.type || "rectilinear-composite";
    const renderers = {
      "rectilinear-composite": renderRectilinear,
      "shaded-area": renderShaded,
      "composite-circle": renderCircleComposite,
      "rectangular-prism": renderRectanglePrism,
      "triangular-prism": renderTriangularPrism,
      "trapezoidal-prism": renderTrapezoidalPrism,
      "composite-prism": renderCompositePrism,
      "net": renderNet,
      "net-comparison": renderNetComparison,
      "cylinder": renderCylinder,
      "cylinder-net": renderCylinderNet,
      "half-cylinder": renderHalfCylinder,
      "composite-cylinder": renderCompositeCylinder
    };

    const fn = renderers[type] || renderRectilinear;
    root.innerHTML = fn(config);
  }

  window.MMT_AREA_SURFACE_ENGINE = { render };
})();
