import React from "react";

/**
 * FractionSetDiagram — a group of `total` counters arranged in `cols` columns,
 * with the first `shaded` counters filled. Reads diagramData:
 *   { total, shaded, cols }.
 * From the legacy FDP fraction-of-set design (reference only).
 */
export default function FractionSetDiagram({ data }) {
  const total = Math.max(1, Math.round(data?.total ?? 1));
  const shaded = Math.max(0, Math.min(total, Math.round(data?.shaded ?? 0)));
  const cols = Math.max(1, Math.round(data?.cols ?? Math.min(total, 6)));
  const rows = Math.ceil(total / cols);

  const cell = 34, r = 12, pad = 6;
  const width = cols * cell + pad * 2;
  const height = rows * cell + pad * 2;

  const dots = [];
  for (let i = 0; i < total; i++) {
    const c = i % cols;
    const row = Math.floor(i / cols);
    dots.push(
      <circle key={i} className={i < shaded ? "fd-shaded" : "fd-empty"}
        cx={pad + c * cell + cell / 2} cy={pad + row * cell + cell / 2} r={r} />
    );
  }

  return (
    <svg className="diagram-svg" viewBox={`0 0 ${width} ${height}`} role="img"
      aria-label={`${shaded} of ${total} counters shaded`}>
      {dots}
    </svg>
  );
}
