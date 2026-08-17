import React from "react";

/**
 * AlgebraAreaModelDiagram — a rectangle split into two parts modelling
 * multiplier × (part1 + part2), e.g. for expanding 2(p − 7). The product cells
 * are left blank (the student fills them in). Reads diagramData:
 *   { multiplier, parts: [p1, p2] }.
 * From the legacy expand-area-model design (reference only).
 */
export default function AlgebraAreaModelDiagram({ data }) {
  const multiplier = String(data?.multiplier ?? "");
  const parts = Array.isArray(data?.parts) ? data.parts.slice(0, 2) : [];
  if (parts.length < 2) return null;

  const x0 = 44, y0 = 30, h = 70;
  const colW = 120;
  const width = x0 + colW * 2 + 12;
  const height = y0 + h + 16;

  return (
    <svg className="diagram-svg diagram-svg-wide" viewBox={`0 0 ${width} ${height}`} role="img"
      aria-label={`Area model for ${multiplier} times (${parts[0]} plus ${parts[1]})`}>
      {/* two cells */}
      <rect className="am-cell" x={x0} y={y0} width={colW} height={h} />
      <rect className="am-cell" x={x0 + colW} y={y0} width={colW} height={h} />
      {/* left multiplier label */}
      <text className="am-dim" x={x0 - 14} y={y0 + h / 2 + 5} textAnchor="middle">{multiplier}</text>
      {/* top part labels */}
      <text className="am-dim" x={x0 + colW / 2} y={y0 - 10} textAnchor="middle">{parts[0]}</text>
      <text className="am-dim" x={x0 + colW + colW / 2} y={y0 - 10} textAnchor="middle">{parts[1]}</text>
    </svg>
  );
}
