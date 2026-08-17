import React from "react";

/**
 * FractionMultiplicationAreaDiagram — a unit square split into d1 columns and
 * d2 rows. n1 columns are tinted one way, n2 rows another; their overlap (the
 * product n1·n2 / d1·d2) is the darkest. Reads diagramData: { n1, d1, n2, d2 }.
 * From the legacy FDP fraction-multiply-area design (reference only).
 */
export default function FractionMultiplicationAreaDiagram({ data }) {
  const d1 = Math.max(1, Math.round(data?.d1 ?? 1));
  const d2 = Math.max(1, Math.round(data?.d2 ?? 1));
  const n1 = Math.max(0, Math.min(d1, Math.round(data?.n1 ?? 0)));
  const n2 = Math.max(0, Math.min(d2, Math.round(data?.n2 ?? 0)));

  const x0 = 30, y0 = 14, size = 176;
  const cw = size / d1, ch = size / d2;

  const cells = [];
  for (let c = 0; c < d1; c++) {
    for (let r = 0; r < d2; r++) {
      const inCol = c < n1;
      const inRow = r < n2;
      const cls = inCol && inRow ? "fma-overlap" : inCol ? "fma-col" : inRow ? "fma-row" : "fd-empty";
      cells.push(
        <rect key={`${c}-${r}`} className={cls}
          x={x0 + c * cw} y={y0 + r * ch} width={cw} height={ch} />
      );
    }
  }

  return (
    <svg className="diagram-svg" viewBox="0 0 224 220" role="img"
      aria-label={`Area model for ${n1}/${d1} times ${n2}/${d2}`}>
      {cells}
      {/* axis labels */}
      <text className="fd-label-sm" x={x0 + size / 2} y={y0 + size + 22} textAnchor="middle">
        {n1}/{d1}
      </text>
      <text className="fd-label-sm" x={x0 - 12} y={y0 + size / 2}
        textAnchor="middle" transform={`rotate(-90 ${x0 - 12} ${y0 + size / 2})`}>
        {n2}/{d2}
      </text>
    </svg>
  );
}
