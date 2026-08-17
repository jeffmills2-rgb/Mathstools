import React from "react";

/**
 * TriangleAreaDiagram — draws a right-angled triangle (right angle bottom-left)
 * with its base and perpendicular height labelled. Reads diagramData:
 *   { base, height, unit }
 *
 * Pure presentational SVG.
 */
export default function TriangleAreaDiagram({ data }) {
  const { base, height, unit } = data || {};
  if (!(base > 0) || !(height > 0)) return null;

  const s = Math.min(180 / base, 120 / height);
  const b = base * s;
  const h = height * s;
  const x0 = 50;
  const yB = 150; // bottom baseline
  const yT = yB - h;

  // Vertices: A bottom-left (right angle), B bottom-right, C top-left.
  const A = `${x0},${yB}`;
  const B = `${x0 + b},${yB}`;
  const C = `${x0},${yT}`;

  return (
    <svg className="diagram-svg" viewBox="0 0 260 200" role="img"
      aria-label={`Right triangle base ${base} height ${height} ${unit}`}>
      <polygon className="diagram-shape" points={`${A} ${B} ${C}`} />

      {/* right-angle marker at A */}
      <path className="diagram-right-angle" d={`M ${x0 + 12} ${yB} L ${x0 + 12} ${yB - 12} L ${x0} ${yB - 12}`} />

      {/* base label */}
      <text className="diagram-dim" x={x0 + b / 2} y={yB + 22} textAnchor="middle">
        {base} {unit}
      </text>
      {/* height label (left, rotated) */}
      <text className="diagram-dim" x={x0 - 14} y={yT + h / 2}
        textAnchor="middle" transform={`rotate(-90 ${x0 - 14} ${yT + h / 2})`}>
        {height} {unit}
      </text>
    </svg>
  );
}
