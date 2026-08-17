import React from "react";

/**
 * FractionNumberLineDiagram — a 0…`wholes` number line subdivided into
 * `denominator` parts per whole, optionally marking the fraction `mark`/denominator.
 * Reads diagramData: { denominator, wholes, mark, showMark }.
 * From the legacy FDP number-line-fraction design (reference only).
 */
export default function FractionNumberLineDiagram({ data }) {
  const denominator = Math.max(1, Math.round(data?.denominator ?? 1));
  const wholes = Math.max(1, Math.round(data?.wholes ?? 1));
  const mark = Math.max(0, Math.round(data?.mark ?? 0));
  const showMark = data?.showMark !== false;

  const left = 24, right = 336, y = 56;
  const totalParts = denominator * wholes;
  const x = (i) => left + (i / totalParts) * (right - left);

  const ticks = [];
  for (let i = 0; i <= totalParts; i++) {
    const isWhole = i % denominator === 0;
    ticks.push(
      <g key={i}>
        <line className={isWhole ? "fd-tick" : "fd-tick-minor"}
          x1={x(i)} y1={y - (isWhole ? 12 : 7)} x2={x(i)} y2={y + (isWhole ? 12 : 7)} />
        {isWhole && (
          <text className="fd-label" x={x(i)} y={y + 30} textAnchor="middle">{i / denominator}</text>
        )}
      </g>
    );
  }

  return (
    <svg className="diagram-svg diagram-svg-wide" viewBox="0 0 360 90" role="img"
      aria-label={`Number line 0 to ${wholes}`}>
      <line className="fd-line" x1={left} y1={y} x2={right} y2={y} />
      {ticks}
      {showMark && mark > 0 && mark < totalParts && (
        <g>
          <path className="fd-mark" d={`M ${x(mark)} ${y - 26} l -6 -10 l 12 0 z`} />
          <circle className="fd-mark-dot" cx={x(mark)} cy={y} r="5" />
        </g>
      )}
    </svg>
  );
}
