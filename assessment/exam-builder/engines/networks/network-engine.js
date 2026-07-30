/*
  MMT Exam Builder — Networks Engine
  ----------------------------------
  Save as:

  engines/networks/network-engine.js

  Browser global:
    window.MMT_NETWORK_ENGINE.render(node, config)
*/

(function () {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const INK = "#111827";
  const MUTED = "#64748b";
  const BLUE = "#2563eb";
  const GREEN = "#16a34a";
  const RED = "#dc2626";
  const AMBER = "#f59e0b";
  const PURPLE = "#7c3aed";
  const SOFT = "#f8fafc";
  const FACE = "#e8f0fa";
  const NODE_FILL = "#ffffff";
  const NODE_SOFT = "#dbeafe";
  const HIGHLIGHT = "#fef3c7";
  const RIVER = "#dbeafe";
  const LAND = "#fef3c7";

  function svgEl(name, attrs = {}) {
    const el = document.createElementNS(SVG_NS, name);
    Object.entries(attrs).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") el.setAttribute(key, String(value));
    });
    return el;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function makeSvg(width = 720, height = 420, label = "Network diagram") {
    const svg = svgEl("svg", {
      viewBox: `0 0 ${width} ${height}`,
      role: "img",
      "aria-label": label
    });
    svg.appendChild(svgEl("rect", {
      x: 8,
      y: 8,
      width: width - 16,
      height: height - 16,
      rx: 16,
      fill: SOFT,
      stroke: "none"
    }));
    return svg;
  }

  function addLine(svg, x1, y1, x2, y2, attrs = {}) {
    const el = svgEl("line", {
      x1,
      y1,
      x2,
      y2,
      stroke: attrs.stroke || INK,
      "stroke-width": attrs.width || 3,
      "stroke-linecap": attrs.cap || "round",
      "stroke-dasharray": attrs.dash || ""
    });
    svg.appendChild(el);
    return el;
  }

  function addPath(svg, d, attrs = {}) {
    const el = svgEl("path", {
      d,
      fill: attrs.fill ?? "none",
      stroke: attrs.stroke || INK,
      "stroke-width": attrs.width || 3,
      "stroke-linejoin": attrs.join || "round",
      "stroke-linecap": attrs.cap || "round",
      "stroke-dasharray": attrs.dash || ""
    });
    svg.appendChild(el);
    return el;
  }

  function addPoly(svg, points, attrs = {}) {
    const el = svgEl("polygon", {
      points: points.map(p => p.join(",")).join(" "),
      fill: attrs.fill ?? FACE,
      stroke: attrs.stroke || INK,
      "stroke-width": attrs.width || 3,
      "stroke-linejoin": "round",
      "stroke-linecap": "round",
      "stroke-dasharray": attrs.dash || ""
    });
    svg.appendChild(el);
    return el;
  }

  function addCircle(svg, cx, cy, r, attrs = {}) {
    const el = svgEl("circle", {
      cx,
      cy,
      r,
      fill: attrs.fill ?? NODE_FILL,
      stroke: attrs.stroke || INK,
      "stroke-width": attrs.width || 3
    });
    svg.appendChild(el);
    return el;
  }

  function addText(svg, text, x, y, attrs = {}) {
    const el = svgEl("text", {
      x,
      y,
      "font-family": attrs.family || "Cambria Math, STIX Two Math, Times New Roman, serif",
      "font-size": attrs.size || 20,
      "font-weight": attrs.weight || 700,
      "text-anchor": attrs.anchor || "middle",
      "dominant-baseline": attrs.baseline || "middle",
      fill: attrs.fill || INK
    });
    el.textContent = String(text ?? "");
    svg.appendChild(el);
    return el;
  }

  function addTextBox(svg, text, x, y, attrs = {}) {
    const value = String(text ?? "");
    const size = attrs.size || 18;
    const width = attrs.boxWidth || Math.max(38, value.length * size * 0.56 + 16);
    const height = attrs.boxHeight || size * 1.35 + 8;
    if (attrs.background !== false) {
      svg.appendChild(svgEl("rect", {
        x: x - width / 2,
        y: y - height / 2,
        width,
        height,
        rx: 7,
        fill: attrs.background || "#ffffff",
        stroke: attrs.strokeBox || "none"
      }));
    }
    return addText(svg, value, x, y, attrs);
  }

  function addTitle(svg, text, x, y, attrs = {}) {
    addTextBox(svg, text, x, y, {
      size: attrs.size || 18,
      fill: attrs.fill || INK,
      background: attrs.background || "#ffffff",
      weight: attrs.weight || 800
    });
  }

  function normaliseGraph(graph = {}) {
    const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
    const nodeMap = new Map(nodes.map(node => [node.id, node]));
    const edges = Array.isArray(graph.edges) ? graph.edges : [];
    return { nodes, edges, nodeMap };
  }

  function edgeEnds(edge) {
    if (Array.isArray(edge)) return { from: edge[0], to: edge[1] };
    return { from: edge.from, to: edge.to };
  }

  function quadraticPath(a, b, curve = 0) {
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    return `M${a.x} ${a.y} Q${mx + nx * curve} ${my + ny * curve} ${b.x} ${b.y}`;
  }

  function drawArrowHead(svg, tipX, tipY, tailX, tailY, attrs = {}) {
    const stroke = attrs.stroke || INK;
    const size = attrs.size || 8;
    const angle = Math.atan2(tipY - tailY, tipX - tailX);
    const spread = Math.PI / 7;
    const p1 = [tipX, tipY];
    const p2 = [tipX - size * Math.cos(angle - spread), tipY - size * Math.sin(angle - spread)];
    const p3 = [tipX - size * Math.cos(angle + spread), tipY - size * Math.sin(angle + spread)];
    addPoly(svg, [p1, p2, p3], { fill: stroke, stroke, width: 1 });
  }

  function drawEdge(svg, nodeMap, edge, opts = {}) {
    const { from, to } = edgeEnds(edge);
    const a = nodeMap.get(from);
    const b = nodeMap.get(to);
    if (!a || !b) return;

    const isHighlighted = edge.highlight || edge.mst || edge.path;
    const stroke = isHighlighted
      ? (edge.color || (edge.mst ? GREEN : (edge.path ? RED : (opts.highlightEdge || BLUE))))
      : (edge.color || opts.edgeColor || INK);
    const width = isHighlighted ? (edge.width || 5) : (edge.width || opts.edgeWidth || 3);
    const dash = edge.dash || "";
    const curve = Number(edge.curve || 0);

    if (curve) {
      addPath(svg, quadraticPath(a, b, curve), { stroke, width, dash });
    } else {
      addLine(svg, a.x, a.y, b.x, b.y, { stroke, width, dash });
    }

    if (edge.arrow) {
      const t = 0.72;
      const x = a.x + (b.x - a.x) * t;
      const y = a.y + (b.y - a.y) * t;
      drawArrowHead(svg, x, y, a.x, a.y, { stroke, size: 8 });
    }

    if (edge.label) {
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const labelStroke = isHighlighted ? stroke : "none";
      addTextBox(svg, edge.label, mx + (edge.labelDx || 0), my + (edge.labelDy || 0), {
        size: 15,
        weight: isHighlighted ? 800 : 700,
        fill: isHighlighted ? stroke : INK,
        strokeBox: labelStroke,
        background: "#ffffff"
      });
    }
  }

  function drawNode(svg, node, opts = {}) {
    const r = node.r || opts.nodeRadius || 18;
    const fill = node.highlight ? (node.fill || HIGHLIGHT) : (node.fill || opts.nodeFill || NODE_FILL);
    const stroke = node.highlight ? (node.stroke || AMBER) : (node.stroke || opts.nodeStroke || INK);
    addCircle(svg, node.x, node.y, r, { fill, stroke, width: node.width || 3 });
    addText(svg, node.label || node.id, node.x, node.y + 1, {
      size: node.size || opts.nodeLabelSize || 18,
      weight: 800,
      fill: node.textFill || INK
    });
    if (node.caption) {
      addTextBox(svg, node.caption, node.x, node.y + r + 21, { size: 13, weight: 700, fill: MUTED });
    }
  }

  function drawGraph(svg, graph, opts = {}) {
    const { nodes, edges, nodeMap } = normaliseGraph(graph);
    edges.forEach(edge => drawEdge(svg, nodeMap, edge, opts));
    nodes.forEach(node => drawNode(svg, node, opts));
  }

  function degreeMap(graph) {
    const { nodes, edges } = normaliseGraph(graph);
    const degrees = Object.fromEntries(nodes.map(n => [n.id, 0]));
    edges.forEach(edge => {
      const { from, to } = edgeEnds(edge);
      if (degrees[from] !== undefined) degrees[from] += 1;
      if (degrees[to] !== undefined) degrees[to] += 1;
    });
    return degrees;
  }

  const SAMPLE_GRAPHS = {
    // Weighted graph for MST / shortest-path diagram types
    weightedRoads: {
      nodes: [
        { id: "A", x: 160, y: 130 },
        { id: "B", x: 310, y: 85  },
        { id: "C", x: 460, y: 130 },
        { id: "D", x: 200, y: 270 },
        { id: "E", x: 360, y: 290 },
        { id: "F", x: 480, y: 260 }
      ],
      edges: [
        { from: "A", to: "B", label: "4" },
        { from: "A", to: "D", label: "3" },
        { from: "B", to: "C", label: "5" },
        { from: "B", to: "D", label: "6" },
        { from: "B", to: "E", label: "7" },
        { from: "C", to: "F", label: "4" },
        { from: "D", to: "E", label: "2" },
        { from: "E", to: "C", label: "5" },
        { from: "E", to: "F", label: "3" }
      ]
    },
    pentagonChord: {
      nodes: [
        { id: "A", x: 190, y: 115 },
        { id: "B", x: 345, y: 105 },
        { id: "C", x: 430, y: 235 },
        { id: "D", x: 280, y: 310 },
        { id: "E", x: 140, y: 235 }
      ],
      edges: [
        ["A", "B"], ["B", "C"], ["C", "D"], ["D", "E"], ["E", "A"], ["A", "D"], ["B", "D"]
      ]
    },
    squareDiagonals: {
      nodes: [
        { id: "A", x: 180, y: 125 },
        { id: "B", x: 395, y: 125 },
        { id: "C", x: 395, y: 300 },
        { id: "D", x: 180, y: 300 }
      ],
      edges: [["A", "B"], ["B", "C"], ["C", "D"], ["D", "A"], ["A", "C"], ["B", "D"]]
    },
    house: {
      nodes: [
        { id: "A", x: 160, y: 295 },
        { id: "B", x: 360, y: 295 },
        { id: "C", x: 360, y: 160 },
        { id: "D", x: 160, y: 160 },
        { id: "E", x: 260, y: 75 }
      ],
      edges: [["A", "B"], ["B", "C"], ["C", "D"], ["D", "A"], ["D", "E"], ["E", "C"], ["A", "C"]]
    },
    eulerTrail: {
      nodes: [
        { id: "A", x: 165, y: 210 },
        { id: "B", x: 280, y: 105 },
        { id: "C", x: 395, y: 210 },
        { id: "D", x: 280, y: 310 },
        { id: "E", x: 280, y: 210 }
      ],
      edges: [["A", "B"], ["B", "C"], ["C", "D"], ["D", "A"], ["A", "E"], ["B", "E"], ["C", "E"], ["D", "E"]]
    },
    eulerCircuit: {
      nodes: [
        { id: "A", x: 160, y: 125 },
        { id: "B", x: 390, y: 125 },
        { id: "C", x: 390, y: 300 },
        { id: "D", x: 160, y: 300 },
        { id: "E", x: 275, y: 212 }
      ],
      edges: [["A", "B"], ["B", "C"], ["C", "D"], ["D", "A"], ["A", "E"], ["B", "E"], ["C", "E"], ["D", "E"]]
    },
    eulerNone: {
      nodes: [
        { id: "A", x: 160, y: 130 },
        { id: "B", x: 360, y: 130 },
        { id: "C", x: 430, y: 275 },
        { id: "D", x: 250, y: 320 },
        { id: "E", x: 100, y: 260 }
      ],
      edges: [["A", "B"], ["B", "C"], ["C", "D"], ["D", "E"], ["E", "A"], ["A", "D"], ["B", "D"], ["B", "E"]]
    }
  };

  function scaledGraph(graph, dx, dy, scale = 1) {
    return {
      nodes: graph.nodes.map(n => ({ ...n, x: dx + n.x * scale, y: dy + n.y * scale, r: (n.r || 18) * Math.sqrt(scale) })),
      edges: graph.edges.map(e => Array.isArray(e) ? e.slice() : { ...e })
    };
  }

  function renderGraph(node, config = {}) {
    const svg = makeSvg();
    drawGraph(svg, config.graph || SAMPLE_GRAPHS.pentagonChord, config);
    if (config.title) addTitle(svg, config.title, 360, 40);
    node.appendChild(svg);
  }

  function renderApplications(node) {
    const svg = makeSvg();
    const panels = [
      { title: "Social", subtitle: "people connected by friendships", x: 70, color: BLUE },
      { title: "Supply", subtitle: "warehouses, shops and transport routes", x: 270, color: GREEN },
      { title: "Communication", subtitle: "devices connected by links", x: 470, color: PURPLE }
    ];

    panels.forEach(panel => {
      svg.appendChild(svgEl("rect", { x: panel.x, y: 82, width: 170, height: 250, rx: 18, fill: "#ffffff", stroke: "#cbd5e1", "stroke-width": 2 }));
      addTitle(svg, panel.title, panel.x + 85, 112, { fill: panel.color, size: 18 });
      const graph = {
        nodes: [
          { id: "A", label: "", x: panel.x + 56, y: 175, r: 12, fill: "#ffffff", stroke: panel.color },
          { id: "B", label: "", x: panel.x + 115, y: 162, r: 12, fill: "#ffffff", stroke: panel.color },
          { id: "C", label: "", x: panel.x + 128, y: 235, r: 12, fill: "#ffffff", stroke: panel.color },
          { id: "D", label: "", x: panel.x + 62, y: 252, r: 12, fill: "#ffffff", stroke: panel.color },
          { id: "E", label: "", x: panel.x + 88, y: 208, r: 12, fill: "#ffffff", stroke: panel.color }
        ],
        edges: [["A", "B"], ["B", "C"], ["C", "D"], ["D", "A"], ["A", "E"], ["C", "E"]].map(([from, to]) => ({ from, to, color: panel.color }))
      };
      drawGraph(svg, graph, { edgeColor: panel.color, nodeRadius: 12 });
      addText(svg, panel.subtitle, panel.x + 85, 300, { size: 13, fill: MUTED, weight: 700 });
    });
    node.appendChild(svg);
  }

  function renderDegree(node, config = {}) {
    const svg = makeSvg();
    const graph = JSON.parse(JSON.stringify(config.graph || SAMPLE_GRAPHS.pentagonChord));
    const target = config.vertex || "D";

    // Assessment version: identify the target vertex without showing the degree
    // or highlighting/counting the incident edges for the student.
    graph.nodes.forEach(n => {
      if (n.id === target) {
        n.highlight = true;
        n.fill = "#fff7ed";
        n.stroke = AMBER;
      }
    });

    drawGraph(svg, graph);
    node.appendChild(svg);
  }

  function renderSameGraphPair(node) {
    const svg = makeSvg();
    const left = {
      nodes: [
        { id: "A", x: 145, y: 150 }, { id: "B", x: 280, y: 125 }, { id: "C", x: 330, y: 250 }, { id: "D", x: 200, y: 310 }, { id: "E", x: 95, y: 250 }
      ],
      edges: [["A", "B"], ["B", "C"], ["C", "D"], ["D", "E"], ["E", "A"], ["A", "D"], ["B", "D"]]
    };
    const right = {
      nodes: [
        { id: "A", x: 500, y: 225 }, { id: "B", x: 610, y: 140 }, { id: "C", x: 625, y: 310 }, { id: "D", x: 470, y: 315 }, { id: "E", x: 455, y: 120 }
      ],
      edges: left.edges
    };
    addTitle(svg, "Drawing 1", 215, 62);
    addTitle(svg, "Drawing 2", 545, 62);
    drawGraph(svg, left);
    drawGraph(svg, right);
    node.appendChild(svg);
  }

  function renderPlanarRedraw(node) {
    const svg = makeSvg();
    addTitle(svg, "Crossing drawing", 205, 55);
    addTitle(svg, "Planar redraw", 525, 55);

    const crossing = {
      nodes: [
        { id: "A", x: 105, y: 120 }, { id: "B", x: 285, y: 120 }, { id: "C", x: 285, y: 300 }, { id: "D", x: 105, y: 300 }
      ],
      edges: [["A", "B"], ["B", "C"], ["C", "D"], ["D", "A"], ["A", "C"], ["B", "D"]]
    };
    drawGraph(svg, crossing);
    addCircle(svg, 195, 210, 12, { fill: "#ffffff", stroke: RED, width: 2 });
    addText(svg, "×", 195, 211, { size: 18, fill: RED, weight: 900 });

    const planar = {
      nodes: [
        { id: "A", x: 435, y: 145 }, { id: "B", x: 615, y: 145 }, { id: "C", x: 615, y: 300 }, { id: "D", x: 435, y: 300 }
      ],
      edges: [
        ["A", "B"], ["B", "C"], ["C", "D"], ["D", "A"], ["A", "C"], { from: "B", to: "D", curve: 90 }
      ]
    };
    drawGraph(svg, planar);
    node.appendChild(svg);
  }

  function renderEulerFaces(node, config = {}) {
    const svg = makeSvg();
    const x = 140, y = 95;
    const pts = {
      A: [x, y + 185],
      B: [x + 160, y + 40],
      C: [x + 330, y + 80],
      D: [x + 390, y + 245],
      E: [x + 210, y + 305]
    };

    const showFaceShading = config.showFaceShading !== false && config.shading !== false;
    const showFaceLabels = config.showFaceLabels !== false && config.faceLabels !== false;

    if (showFaceShading) {
      addPoly(svg, [pts.A, pts.B, pts.C, pts.D, pts.E], { fill: "#ffffff", stroke: "none" });
      addPoly(svg, [pts.A, pts.B, pts.E], { fill: "#e0f2fe", stroke: "none" });
      addPoly(svg, [pts.B, pts.C, pts.E], { fill: "#dcfce7", stroke: "none" });
      addPoly(svg, [pts.C, pts.D, pts.E], { fill: "#fef3c7", stroke: "none" });
    }

    const graph = {
      nodes: Object.entries(pts).map(([id, [px, py]]) => ({ id, x: px, y: py })),
      edges: [["A", "B"], ["B", "C"], ["C", "D"], ["D", "E"], ["E", "A"], ["B", "E"], ["C", "E"]]
    };
    drawGraph(svg, graph);

    if (showFaceLabels) {
      addText(svg, "F₁", 205, 225, { size: 18, fill: BLUE });
      addText(svg, "F₂", 305, 190, { size: 18, fill: GREEN });
      addText(svg, "F₃", 390, 270, { size: 18, fill: AMBER });
    }

    node.appendChild(svg);
  }

  function renderConnectedComparison(node) {
    const svg = makeSvg();
    addTitle(svg, "Graph A", 205, 56);
    addTitle(svg, "Graph B", 515, 56);
    const connected = {
      nodes: [
        { id: "A", x: 120, y: 145 }, { id: "B", x: 265, y: 130 }, { id: "C", x: 315, y: 250 }, { id: "D", x: 175, y: 310 }, { id: "E", x: 95, y: 250 }
      ],
      edges: [["A", "B"], ["B", "C"], ["C", "D"], ["D", "E"], ["E", "A"], ["A", "D"]]
    };
    const disconnected = {
      nodes: [
        { id: "A", x: 430, y: 145 }, { id: "B", x: 545, y: 125 }, { id: "C", x: 620, y: 215 }, { id: "D", x: 455, y: 300 }, { id: "E", x: 590, y: 305 }
      ],
      edges: [["A", "B"], ["B", "C"], ["D", "E"]]
    };
    drawGraph(svg, connected, { highlightEdge: GREEN });
    drawGraph(svg, disconnected);
    node.appendChild(svg);
  }

  function renderWalkTrail(node) {
    const svg = makeSvg();
    const graph = JSON.parse(JSON.stringify(SAMPLE_GRAPHS.pentagonChord));
    const sequence = ["E", "A", "B", "D", "C"];
    const pairs = new Set(sequence.slice(0, -1).map((v, i) => [v, sequence[i + 1]].sort().join("-")));
    graph.edges = graph.edges.map(edge => {
      const { from, to } = edgeEnds(edge);
      const key = [from, to].sort().join("-");
      return pairs.has(key) ? { from, to, highlight: true, color: GREEN, width: 5, arrow: true } : edge;
    });
    graph.nodes = graph.nodes.map(n => sequence.includes(n.id) ? { ...n, fill: "#dcfce7", stroke: GREEN } : n);
    drawGraph(svg, graph);
    addTitle(svg, `Walk: ${sequence.join(" → ")}`, 360, 45, { fill: GREEN });
    node.appendChild(svg);
  }

  function renderEulerian(node, config = {}) {
    const svg = makeSvg();
    const variant = config.variant || "trail";
    const graph = JSON.parse(JSON.stringify(
      variant === "circuit" ? SAMPLE_GRAPHS.eulerCircuit : variant === "none" ? SAMPLE_GRAPHS.eulerNone : SAMPLE_GRAPHS.eulerTrail
    ));

    // Assessment version: show only the graph. Do not display odd-vertex counts,
    // degree captions, or conclusion text in the diagram.
    drawGraph(svg, graph);
    node.appendChild(svg);
  }

  function renderKonigsberg(node, config = {}) {
    const svg = makeSvg();
    const mapOnly = config.mapOnly === true;
    const mapLayer = mapOnly ? svgEl("g", { transform: "translate(155 0)" }) : svg;

    if (mapOnly) svg.appendChild(mapLayer);

    // Stylised river and land regions. In assessment questions where students
    // must create the graph model themselves, only the bridge map is shown.
    mapLayer.appendChild(svgEl("rect", { x: 55, y: 75, width: 300, height: 260, rx: 24, fill: RIVER, stroke: "none" }));
    addPath(mapLayer, "M195 75 C175 130 178 210 198 335", { stroke: "#93c5fd", width: 38, fill: "none" });
    addPath(mapLayer, "M55 210 C140 192 240 205 355 185", { stroke: "#93c5fd", width: 38, fill: "none" });
    addPoly(mapLayer, [[92, 120], [175, 110], [168, 185], [82, 178]], { fill: LAND, stroke: "#c084fc", width: 2 });
    addPoly(mapLayer, [[235, 105], [320, 120], [310, 178], [230, 165]], { fill: LAND, stroke: "#c084fc", width: 2 });
    addPoly(mapLayer, [[95, 250], [178, 235], [178, 308], [88, 302]], { fill: LAND, stroke: "#c084fc", width: 2 });
    addPoly(mapLayer, [[230, 230], [315, 222], [322, 305], [238, 315]], { fill: LAND, stroke: "#c084fc", width: 2 });
    addPoly(mapLayer, [[175, 175], [232, 168], [236, 235], [180, 242]], { fill: LAND, stroke: "#fde68a", width: 2 });

    const bridges = [
      [165, 145, 220, 135], [168, 170, 226, 160], [170, 260, 230, 248],
      [170, 285, 235, 276], [124, 190, 180, 203], [232, 202, 298, 190], [205, 230, 208, 172]
    ];
    bridges.forEach(([x1, y1, x2, y2]) => addLine(mapLayer, x1, y1, x2, y2, { stroke: "#92400e", width: 5 }));
    addTitle(mapLayer, "Königsberg bridges", 205, 50, { size: 17 });

    if (!mapOnly) {
      // Abstract graph model. Hidden when the question asks students to draw it.
      addTitle(svg, "Network model", 535, 50, { size: 17 });
      const graph = {
        nodes: [
          { id: "A", x: 455, y: 135 },
          { id: "B", x: 620, y: 135 },
          { id: "C", x: 455, y: 295 },
          { id: "D", x: 620, y: 295 }
        ],
        edges: [
          { from: "A", to: "B", curve: 28 },
          { from: "A", to: "B", curve: -28 },
          { from: "A", to: "C", curve: 18 },
          { from: "A", to: "C", curve: -18 },
          { from: "B", to: "D", curve: 18 },
          { from: "C", to: "D", curve: -18 },
          { from: "A", to: "D" }
        ]
      };
      drawGraph(svg, graph);
    }

    node.appendChild(svg);
  }

  function renderDefinition(node) {
    const svg = makeSvg();
    const graph = {
      nodes: [
        { id: "A", x: 180, y: 150, caption: "vertex" },
        { id: "B", x: 360, y: 105, caption: "vertex" },
        { id: "C", x: 500, y: 220, caption: "vertex" },
        { id: "D", x: 300, y: 300, caption: "vertex" }
      ],
      edges: [
        { from: "A", to: "B", label: "edge", labelDy: -22 },
        ["B", "C"], ["C", "D"], ["D", "A"], ["A", "C"]
      ]
    };
    drawGraph(svg, graph);
    addTitle(svg, "A network is vertices connected by edges", 360, 55);
    node.appendChild(svg);
  }

  // Minimum spanning tree: edges with mst:true highlighted green, others dimmed
  function renderMST(node, config = {}) {
    const svg = makeSvg();
    const graph = JSON.parse(JSON.stringify(config.graph || SAMPLE_GRAPHS.pentagonChord));

    graph.edges = graph.edges.map(edge => {
      const e = typeof edge === "object" ? { ...edge } : { from: edge[0], to: edge[1] };
      if (!e.mst) { e.color = "#d1d5db"; e.width = 2; }
      return e;
    });

    drawGraph(svg, graph, config);
    if (config.title) addTitle(svg, config.title, 360, 38);
    node.appendChild(svg);
  }

  // Shortest path: edges with path:true highlighted red, start/end nodes colored
  function renderShortestPath(node, config = {}) {
    const svg = makeSvg();
    const graph = JSON.parse(JSON.stringify(config.graph || SAMPLE_GRAPHS.pentagonChord));

    graph.edges = graph.edges.map(edge => {
      const e = typeof edge === "object" ? { ...edge } : { from: edge[0], to: edge[1] };
      if (!e.path) { e.color = "#d1d5db"; e.width = 2; }
      return e;
    });

    const startId = config.start;
    const endId = config.end;
    if (startId || endId) {
      graph.nodes = graph.nodes.map(n => {
        const nd = { ...n };
        if (nd.id === startId) { nd.fill = "#d1fae5"; nd.stroke = GREEN; }
        if (nd.id === endId) { nd.fill = "#fee2e2"; nd.stroke = RED; }
        return nd;
      });
    }

    drawGraph(svg, graph, config);
    if (config.title) addTitle(svg, config.title, 360, 38);
    node.appendChild(svg);
  }

  function render(node, config = {}) {
    clear(node);
    const type = config.diagramType || "graph";
    if (type === "applications") return renderApplications(node, config);
    if (type === "definition") return renderDefinition(node, config);
    if (type === "degree-graph") return renderDegree(node, config);
    if (type === "same-graph-pair") return renderSameGraphPair(node, config);
    if (type === "planar-redraw") return renderPlanarRedraw(node, config);
    if (type === "euler-faces") return renderEulerFaces(node, config);
    if (type === "connected-comparison") return renderConnectedComparison(node, config);
    if (type === "walk-trail") return renderWalkTrail(node, config);
    if (type === "eulerian") return renderEulerian(node, config);
    if (type === "konigsberg") return renderKonigsberg(node, config);
    if (type === "minimum-spanning-tree") return renderMST(node, config);
    if (type === "shortest-path") return renderShortestPath(node, config);
    return renderGraph(node, config);
  }

  window.MMT_NETWORK_ENGINE = { render };
})();
