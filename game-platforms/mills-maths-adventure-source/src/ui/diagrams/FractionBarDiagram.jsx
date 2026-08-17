import React from "react";

/**
 * FractionBarDiagram — a bar split into `denominator` equal cells with the first
 * `numerator` shaded. Reads diagramData: { numerator, denominator }.
 * Re-created in React/SVG from the legacy FDP fraction-bar design (legacy DOM
 * code kept only as reference, never imported).
 */
export default function FractionBarDiagram({ data }) {
  const denominator = Math.max(1, Math.round(data?.denominator ?? 1));
  const numerator = Math.max(0, Math.min(denominator, Math.round(data?.numerator ?? 0)));

  const x0 = 10, y0 = 14, w = 300, h = 40;
  const cellW = w / denominator;
  const cells = [];
  for (let i = 0; i < denominator; i++) {
    cells.push(
      <rect key={i} className={i < numerator ? "fd-shaded" : "fd-empty"}
        x={x0 + i * cellW} y={y0} width={cellW} height={h} />
    );
  }

  return (
    <svg className="diagram-svg" viewBox="0 0 320 68" role="img"
      aria-label={`${numerator} of ${denominator} parts shaded`}>
      {cells}
    </svg>
  );
}
