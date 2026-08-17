import React from "react";

/**
 * FractionCircleDiagram — a circle split into `denominator` equal sectors with
 * `numerator` of them shaded. Re-created in React/SVG from the legacy FDP
 * diagram engine's fraction-circle design (legacy DOM code kept only as
 * reference, never imported).
 *
 * Reads diagramData: { numerator, denominator }
 */
export default function FractionCircleDiagram({ data }) {
  const numerator = Math.max(0, Math.round(data?.numerator ?? 0));
  const denominator = Math.max(1, Math.round(data?.denominator ?? 1));

  const cx = 100, cy = 100, r = 80;
  const start = -Math.PI / 2; // start at the top
  const point = (angle) => [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];

  // Whole-circle case (denominator 1): just a filled or empty disc.
  if (denominator === 1) {
    return (
      <svg className="diagram-svg" viewBox="0 0 200 200" role="img"
        aria-label={`${numerator} of 1 whole shaded`}>
        <circle className={numerator >= 1 ? "fc-shaded" : "fc-empty"} cx={cx} cy={cy} r={r} />
      </svg>
    );
  }

  const step = (2 * Math.PI) / denominator;
  const sectors = [];
  for (let i = 0; i < denominator; i++) {
    const a0 = start + i * step;
    const a1 = start + (i + 1) * step;
    const [x0, y0] = point(a0);
    const [x1, y1] = point(a1);
    const largeArc = step > Math.PI ? 1 : 0;
    sectors.push(
      <path
        key={i}
        className={i < numerator ? "fc-shaded" : "fc-empty"}
        d={`M ${cx} ${cy} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`}
      />
    );
  }

  return (
    <svg className="diagram-svg" viewBox="0 0 200 200" role="img"
      aria-label={`${numerator} of ${denominator} sectors shaded`}>
      {sectors}
    </svg>
  );
}
