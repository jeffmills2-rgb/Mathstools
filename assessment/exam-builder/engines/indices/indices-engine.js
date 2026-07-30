/*
  CHHS Exam Builder — Indices Diagram Engine
  ------------------------------------------
  Save as:

  engines/indices/indices-engine.js

  Exposes:
  window.MMT_INDICES_ENGINE.render(target, config)

  Supported:
  - factor-tree diagrams
*/

window.MMT_INDICES_ENGINE = (() => {
  const SVG_NS = "http://www.w3.org/2000/svg";

  function el(name, attrs = {}) {
    const node = document.createElementNS(SVG_NS, name);

    Object.entries(attrs).forEach(([key, value]) => {
      node.setAttribute(key, String(value));
    });

    return node;
  }

  function primeFactors(n) {
    const factors = [];
    let x = n;
    let p = 2;

    while (p * p <= x) {
      while (x % p === 0) {
        factors.push(p);
        x /= p;
      }
      p += p === 2 ? 1 : 2;
    }

    if (x > 1) factors.push(x);
    return factors;
  }

  function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i * i <= n; i += 1) {
      if (n % i === 0) return false;
    }
    return true;
  }

  function splitFactor(n) {
    for (let p = 2; p * p <= n; p += 1) {
      if (n % p === 0) return [p, n / p];
    }

    return [n, 1];
  }

  function buildTree(n) {
    if (isPrime(n)) {
      return { value: n, prime: true, children: [] };
    }

    const [a, b] = splitFactor(n);
    return {
      value: n,
      prime: false,
      children: [buildTree(a), buildTree(b)]
    };
  }

  function collectLeaves(node, out = []) {
    if (!node.children?.length) {
      out.push(node);
      return out;
    }

    node.children.forEach(child => collectLeaves(child, out));
    return out;
  }

  function layoutTree(node, depth = 0, counter = { x: 0 }) {
    node.depth = depth;

    if (!node.children.length) {
      node.x = counter.x;
      counter.x += 1;
      return node.x;
    }

    const childXs = node.children.map(child => layoutTree(child, depth + 1, counter));
    node.x = childXs.reduce((sum, value) => sum + value, 0) / childXs.length;
    return node.x;
  }

  function renderFactorTree(target, config = {}) {
    const number = Number(config.number || 60);
    const mode = config.mode || "completed";
    const tree = buildTree(number);

    layoutTree(tree);

    const leaves = collectLeaves(tree);
    const maxDepth = Math.max(...collectNodes(tree).map(node => node.depth));
    const width = Math.max(520, leaves.length * 86 + 100);
    const height = Math.max(250, (maxDepth + 1) * 82 + 40);
    const xPadding = 54;
    const yPadding = 36;
    const leafSpacing = leaves.length > 1
      ? (width - 2 * xPadding) / (leaves.length - 1)
      : 0;

    const svg = el("svg", {
      viewBox: `0 0 ${width} ${height}`,
      width: "100%",
      height: "100%",
      role: "img",
      "aria-label": `factor tree for ${number}`,
      class: "indices-svg"
    });

    const style = el("style");
    style.textContent = `
      .indices-svg{overflow:visible}
      .factor-link{stroke:#111827;stroke-width:2.4;stroke-linecap:round}
      .factor-node{fill:#fff;stroke:#111827;stroke-width:2.2}
      .factor-node-prime{fill:#ecfdf5;stroke:#065f46;stroke-width:2.2}
      .factor-node-blank{fill:#fff;stroke:#111827;stroke-width:2.2;stroke-dasharray:5 4}
      .factor-text{font-family:"Cambria Math","Times New Roman",serif;font-size:22px;font-weight:800;fill:#111827;text-anchor:middle;dominant-baseline:middle}
      .factor-hint{font-family:"Cambria Math","Times New Roman",serif;font-size:13px;fill:#4b5563;text-anchor:middle;dominant-baseline:middle}
    `;
    svg.appendChild(style);

    const nodes = collectNodes(tree);

    const toScreen = node => {
      const x = xPadding + node.x * leafSpacing;
      const y = yPadding + node.depth * 78;
      return { x, y };
    };

    nodes.forEach(node => {
      node.children.forEach(child => {
        const a = toScreen(node);
        const b = toScreen(child);
        svg.appendChild(el("line", {
          x1: a.x,
          y1: a.y + 17,
          x2: b.x,
          y2: b.y - 17,
          class: "factor-link"
        }));
      });
    });

    nodes.forEach(node => {
      const p = toScreen(node);
      const shouldHideLeaves = config.hideLeafValues === true || mode === "student";
      const isTerminalPrimeLeaf = node.prime && !node.children?.length;
      const blank = shouldHideLeaves && isTerminalPrimeLeaf;

      svg.appendChild(el("circle", {
        cx: p.x,
        cy: p.y,
        r: 22,
        class: blank
          ? "factor-node-blank"
          : node.prime
            ? "factor-node-prime"
            : "factor-node"
      }));

      const text = el("text", {
        x: p.x,
        y: p.y + 1,
        class: "factor-text"
      });
      text.textContent = blank ? "" : node.value;
      svg.appendChild(text);
    });

    if (mode === "partial" || mode === "student") {
      const hint = el("text", {
        x: width / 2,
        y: height - 14,
        class: "factor-hint"
      });
      hint.textContent = "Fill in the missing prime factors, then write the prime factorisation.";
      svg.appendChild(hint);
    }

    target.innerHTML = "";
    target.appendChild(svg);
  }

  function collectNodes(node, out = []) {
    out.push(node);
    node.children.forEach(child => collectNodes(child, out));
    return out;
  }

  // Visual for index laws: shows repeated multiplication grouped in brackets,
  // e.g. (x·x·x) × (x·x) = x⁵.
  function renderIndexExpansion(target, config = {}) {
    const base = String(config.base || "x");
    const groups = Array.isArray(config.groups) && config.groups.length ? config.groups : [3, 2];
    const op = config.op || "×";
    const resultSup = config.resultExp != null ? config.resultExp : groups.reduce((a, b) => a + b, 0);

    const svg = el("svg", { viewBox: "0 0 640 150", width: "100%", height: "100%", role: "img", "aria-label": "index expansion" });
    const style = el("style");
    style.textContent = `
      .ix-text{font-family:"Cambria Math","Times New Roman",serif;font-size:26px;font-weight:700;fill:#111827;dominant-baseline:middle}
      .ix-brace{stroke:#2563eb;stroke-width:2;fill:none}
      .ix-small{font-family:Arial,sans-serif;font-size:14px;fill:#2563eb;text-anchor:middle}
    `;
    svg.appendChild(style);

    let x = 30;
    const y = 70;
    groups.forEach((g, gi) => {
      const factors = Array.from({ length: g }, () => base).join("·");
      const startX = x;
      const t = el("text", { x, y, class: "ix-text" });
      t.textContent = `(${factors})`;
      svg.appendChild(t);
      const wApprox = (factors.length + 2) * 13;
      // brace + count under group
      svg.appendChild(el("path", { d: `M ${startX} ${y + 22} q 0 8 8 8 L ${startX + wApprox - 16} ${y + 30} q 8 0 8 -8`, class: "ix-brace" }));
      const c = el("text", { x: startX + wApprox / 2, y: y + 48, class: "ix-small" });
      c.textContent = `${base}${supLocal(g)}`;
      svg.appendChild(c);
      x += wApprox + 8;
      if (gi < groups.length - 1) {
        const o = el("text", { x, y, class: "ix-text" });
        o.textContent = op;
        svg.appendChild(o);
        x += 28;
      }
    });

    const eq = el("text", { x: x + 6, y, class: "ix-text" });
    eq.textContent = `= ${base}${supLocal(resultSup)}`;
    svg.appendChild(eq);

    target.innerHTML = "";
    target.appendChild(svg);
  }

  function supLocal(value) {
    const map = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
    return String(value).split("").map(ch => map[ch] ?? ch).join("");
  }

  function render(target, config = {}) {
    const type = config.diagramType || "factor-tree";

    if (type === "factor-tree") {
      renderFactorTree(target, config);
      return;
    }

    if (type === "index-expansion") {
      renderIndexExpansion(target, config);
      return;
    }

    target.innerHTML = `<div class="diagram-placeholder">Unknown indices diagram: ${type}</div>`;
  }

  return { render };
})();
