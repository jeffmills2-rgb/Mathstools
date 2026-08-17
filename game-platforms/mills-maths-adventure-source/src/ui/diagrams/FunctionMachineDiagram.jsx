import React from "react";

/**
 * FunctionMachineDiagram — an input box flowing through one or more operation
 * boxes to an output. Reads diagramData:
 *   { input, operations: ["× 3", "+ 1"], output }.
 * From the legacy function-machine design (reference only).
 */
export default function FunctionMachineDiagram({ data }) {
  const input = String(data?.input ?? "x");
  const ops = Array.isArray(data?.operations) ? data.operations.map(String) : [];
  const output = String(data?.output ?? "?");

  const boxW = 64, boxH = 40, gap = 26, y = 24;
  const items = [{ kind: "io", label: input }, ...ops.map((t) => ({ kind: "op", label: t })), { kind: "io", label: output }];
  const width = 10 + items.length * boxW + (items.length - 1) * gap + 10;
  const height = y + boxH + 18;

  const nodes = [];
  let x = 10;
  items.forEach((it, i) => {
    if (i > 0) {
      const px = x - gap;
      nodes.push(
        <g key={`a${i}`}>
          <line className="fm-arrow" x1={px} y1={y + boxH / 2} x2={x} y2={y + boxH / 2} />
          <path className="fm-arrow-head" d={`M ${x} ${y + boxH / 2} l -7 -5 l 0 10 z`} />
        </g>
      );
    }
    nodes.push(
      <g key={`b${i}`}>
        <rect className={it.kind === "op" ? "fm-op" : "fm-io"} x={x} y={y} width={boxW} height={boxH} rx="6" />
        <text className="fm-label" x={x + boxW / 2} y={y + boxH / 2 + 5} textAnchor="middle">{it.label}</text>
      </g>
    );
    x += boxW + gap;
  });

  return (
    <svg className="diagram-svg diagram-svg-wide" viewBox={`0 0 ${width} ${height}`} role="img"
      aria-label={`Function machine: input ${input}, ${ops.join(", ")}`}>
      {nodes}
    </svg>
  );
}
