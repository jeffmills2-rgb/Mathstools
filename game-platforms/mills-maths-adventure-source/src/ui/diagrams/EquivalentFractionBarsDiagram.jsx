import React from "react";

/**
 * EquivalentFractionBarsDiagram — two equal-length bars showing equivalent
 * fractions, each split into its own denominator with its numerator shaded.
 * Reads diagramData: { fracs: [[n1,d1],[n2,d2]] }.
 * From the legacy FDP equivalent-bars design (reference only).
 */
export default function EquivalentFractionBarsDiagram({ data }) {
  const fracs = Array.isArray(data?.fracs) ? data.fracs.slice(0, 2) : [];
  if (fracs.length < 2) return null;

  const x0 = 12, w = 296, h = 32;
  const rows = [18, 64];

  function bar([n, d], y, key) {
    const den = Math.max(1, Math.round(d));
    const num = Math.max(0, Math.min(den, Math.round(n)));
    const cellW = w / den;
    const cells = [];
    for (let i = 0; i < den; i++) {
      cells.push(
        <rect key={i} className={i < num ? "fd-shaded" : "fd-empty"}
          x={x0 + i * cellW} y={y} width={cellW} height={h} />
      );
    }
    return (
      <g key={key}>
        {cells}
        <text className="fd-label-sm" x={x0 + w + 8} y={y + h / 2 + 4} textAnchor="start">
          {num}/{den}
        </text>
      </g>
    );
  }

  return (
    <svg className="diagram-svg diagram-svg-wide" viewBox="0 0 360 112" role="img"
      aria-label="Two equivalent fraction bars">
      {bar(fracs[0], rows[0], "a")}
      {bar(fracs[1], rows[1], "b")}
    </svg>
  );
}
