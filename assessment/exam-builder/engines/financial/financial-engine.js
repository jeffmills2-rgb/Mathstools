/*
  MMT Exam Builder — Financial Mathematics Engine
  ------------------------------------------------
  Save as:

  engines/financial/financial-engine.js

  Browser global:
    window.MMT_FINANCIAL_ENGINE.render(node, config)

  This engine is intentionally light. Most Financial Mathematics A and B questions are
  text/table based; the engine supports optional clean financial stimuli such as
  simple-interest graphs and repayment comparisons.
*/

(function () {
  const SVG_NS = "http://www.w3.org/2000/svg";

  function svgEl(name, attrs = {}) {
    const el = document.createElementNS(SVG_NS, name);
    Object.entries(attrs).forEach(([key, value]) => {
      if (value !== undefined && value !== null) el.setAttribute(key, String(value));
    });
    return el;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function money(value, decimals = 0) {
    const n = Number(value || 0);
    return `$${n.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, " ")}`;
  }

  function addText(svg, text, x, y, attrs = {}) {
    const el = svgEl("text", {
      x,
      y,
      "font-family": "Cambria Math, STIX Two Math, Times New Roman, serif",
      "font-size": attrs.size || 16,
      "font-weight": attrs.weight || 700,
      "text-anchor": attrs.anchor || "middle",
      fill: attrs.fill || "#111827"
    });
    el.textContent = text;
    svg.appendChild(el);
    return el;
  }

  function addLine(svg, x1, y1, x2, y2, attrs = {}) {
    const el = svgEl("line", {
      x1,
      y1,
      x2,
      y2,
      stroke: attrs.stroke || "#111827",
      "stroke-width": attrs.width || 2,
      "stroke-dasharray": attrs.dash || "",
      "stroke-linecap": attrs.cap || "round"
    });
    svg.appendChild(el);
    return el;
  }

  function renderSimpleInterestGraph(node, config = {}) {
    clear(node);
    const width = 720;
    const height = 430;
    const margin = { left: 86, right: 34, top: 34, bottom: 76 };
    const svg = svgEl("svg", { viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": "Simple interest graph" });

    const principal = Number(config.principal || 1000);
    const rate = Number(config.ratePercent || config.rate || 5);
    const years = Number(config.years || 5);
    const maxYears = Math.max(1, years);
    const amountAtEnd = principal * (1 + rate / 100 * maxYears);
    const yMax = Math.ceil(amountAtEnd / 500) * 500 || amountAtEnd + 100;

    const plotW = width - margin.left - margin.right;
    const plotH = height - margin.top - margin.bottom;
    const xScale = value => margin.left + (value / maxYears) * plotW;
    const yScale = value => margin.top + plotH - (value / yMax) * plotH;

    const background = svgEl("rect", { x: 8, y: 8, width: width - 16, height: height - 16, rx: 18, fill: "#f8fafc" });
    svg.appendChild(background);

    // Grid and axes
    for (let i = 0; i <= maxYears; i++) {
      const x = xScale(i);
      addLine(svg, x, margin.top, x, margin.top + plotH, { stroke: i === 0 ? "#111827" : "#cbd5e1", width: i === 0 ? 2.5 : 1 });
      addText(svg, String(i), x, margin.top + plotH + 26, { size: 13, weight: 700 });
    }

    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
      const value = (yMax / ySteps) * i;
      const y = yScale(value);
      addLine(svg, margin.left, y, margin.left + plotW, y, { stroke: i === 0 ? "#111827" : "#cbd5e1", width: i === 0 ? 2.5 : 1 });
      addText(svg, money(value), margin.left - 10, y + 5, { size: 12, anchor: "end" });
    }

    // Simple interest line
    const x1 = xScale(0);
    const y1 = yScale(principal);
    const x2 = xScale(maxYears);
    const y2 = yScale(amountAtEnd);
    addLine(svg, x1, y1, x2, y2, { stroke: "#1d4ed8", width: 4 });
    svg.appendChild(svgEl("circle", { cx: x1, cy: y1, r: 5, fill: "#1d4ed8" }));
    svg.appendChild(svgEl("circle", { cx: x2, cy: y2, r: 5, fill: "#1d4ed8" }));

    addText(svg, "Time (years)", margin.left + plotW / 2, height - 24, { size: 16, weight: 700 });
    const yLabel = addText(svg, "Amount ($)", 28, margin.top + plotH / 2, { size: 16, weight: 700 });
    yLabel.setAttribute("transform", `rotate(-90 28 ${margin.top + plotH / 2})`);

    addText(svg, `P = ${money(principal)}; r = ${rate}% pa`, margin.left + plotW / 2, 24, { size: 15, weight: 700 });

    node.appendChild(svg);
  }

  function renderRepaymentComparison(node, config = {}) {
    clear(node);
    const options = Array.isArray(config.options) ? config.options : [];
    const width = 720;
    const height = Math.max(220, 92 + options.length * 62);
    const svg = svgEl("svg", { viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": "Payment option comparison" });
    svg.appendChild(svgEl("rect", { x: 8, y: 8, width: width - 16, height: height - 16, rx: 18, fill: "#f8fafc" }));
    addText(svg, config.title || "Payment option comparison", width / 2, 40, { size: 20, weight: 800 });

    const x = 70;
    const y0 = 72;
    const rowH = 54;
    const maxTotal = Math.max(...options.map(option => Number(option.total || 0)), 1);

    options.forEach((option, index) => {
      const y = y0 + index * rowH;
      const total = Number(option.total || 0);
      const barW = Math.max(16, (total / maxTotal) * 410);
      addText(svg, option.label || `Option ${index + 1}`, x, y + 19, { size: 15, weight: 800, anchor: "end" });
      svg.appendChild(svgEl("rect", { x: x + 16, y, width: barW, height: 28, rx: 8, fill: "#dbeafe", stroke: "#1d4ed8", "stroke-width": 1.5 }));
      addText(svg, money(total, 2), x + 32 + barW, y + 20, { size: 14, weight: 800, anchor: "start" });
    });

    node.appendChild(svg);
  }


  function renderValueTimeline(node, config = {}) {
    clear(node);
    const values = Array.isArray(config.values) ? config.values.map(Number).filter(Number.isFinite) : [];
    const labels = Array.isArray(config.labels) ? config.labels : [];
    const title = config.title || "Value over time";
    const width = 720;
    const height = Math.max(220, 96 + values.length * 54);
    const svg = svgEl("svg", { viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": title });
    svg.appendChild(svgEl("rect", { x: 8, y: 8, width: width - 16, height: height - 16, rx: 18, fill: "#f8fafc" }));
    addText(svg, title, width / 2, 38, { size: 20, weight: 800 });

    if (!values.length) {
      addText(svg, "No values supplied", width / 2, height / 2, { size: 16, weight: 700 });
      node.appendChild(svg);
      return;
    }

    const maxValue = Math.max(...values, 1);
    const x = 165;
    const y0 = 72;
    const rowH = 48;

    values.forEach((value, index) => {
      const y = y0 + index * rowH;
      const barW = Math.max(12, (value / maxValue) * 390);
      addText(svg, labels[index] || `Period ${index}`, x - 18, y + 18, { size: 14, weight: 800, anchor: "end" });
      svg.appendChild(svgEl("rect", { x, y, width: barW, height: 25, rx: 8, fill: "#dbeafe", stroke: "#1d4ed8", "stroke-width": 1.5 }));
      addText(svg, money(value, 2), x + barW + 14, y + 18, { size: 14, weight: 800, anchor: "start" });
    });

    node.appendChild(svg);
  }

  function render(node, config = {}) {
    const type = String(config.diagramType || config.type || "simple-interest-graph");

    if (type === "simple-interest-graph") {
      renderSimpleInterestGraph(node, config);
      return;
    }

    if (type === "repayment-comparison") {
      renderRepaymentComparison(node, config);
      return;
    }

    if (type === "value-timeline" || type === "compound-value-timeline" || type === "depreciation-value-timeline") {
      renderValueTimeline(node, config);
      return;
    }

    clear(node);
    node.innerHTML = `<div class="diagram-placeholder">Financial diagram unavailable: ${type}</div>`;
  }

  window.MMT_FINANCIAL_ENGINE = { render };
})();
