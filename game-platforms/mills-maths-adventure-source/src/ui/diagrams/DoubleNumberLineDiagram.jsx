import React from "react";

/**
 * DoubleNumberLineDiagram — ONE shared number line with the two quantities
 * labelled above and below it (teacher-requested redesign, Phase 3A2): the top
 * quantity's values sit above each tick, the bottom quantity's values sit
 * below. The marked top value is highlighted and its bottom value shows "?".
 *
 * Reads diagramData { topLabel, bottomLabel, topMax, bottomMax, ticks,
 * markPercent } — markPercent is the marked value ON THE TOP SCALE (kept name
 * for back-compat with the FDP percentage questions).
 */
export default function DoubleNumberLineDiagram({ data }) {
  const topMax = Number(data?.topMax ?? 100);
  const bottomMax = Number(data?.bottomMax ?? 100);
  const ticks = Math.max(1, Math.round(data?.ticks ?? 4));
  const topLabel = data?.topLabel ?? "%";
  const bottomLabel = data?.bottomLabel ?? "amount";
  const mark = Number.isFinite(data?.markPercent) ? data.markPercent : null;

  const left = 92, right = 336, yLine = 62;
  const x = (frac) => left + frac * (right - left);
  const round = (v) => Math.round(v * 100) / 100;
  const markFrac = mark != null && topMax > 0 ? mark / topMax : null;

  const tickEls = [];
  for (let i = 0; i <= ticks; i++) {
    const f = i / ticks;
    const isMark = markFrac != null && Math.abs(f - markFrac) < 1e-6;
    tickEls.push(
      <g key={i}>
        <line className="fd-tick" x1={x(f)} y1={yLine - 9} x2={x(f)} y2={yLine + 9} />
        {/* Top quantity value above the tick (highlight the marked one). */}
        <text
          className={isMark ? "fd-mark-q" : "fd-label-sm"}
          x={x(f)} y={yLine - 16} textAnchor="middle"
        >
          {round(f * topMax)}
        </text>
        {/* Bottom quantity value below the tick — "?" at the marked position. */}
        <text
          className={isMark ? "fd-mark-q" : "fd-label-sm"}
          x={x(f)} y={yLine + 30} textAnchor="middle"
        >
          {isMark ? "?" : round(f * bottomMax)}
        </text>
      </g>
    );
  }

  return (
    <svg className="diagram-svg diagram-svg-wide" viewBox="0 0 360 110" role="img"
      aria-label="Double number line">
      {/* Quantity labels at the left: top quantity above, bottom below. */}
      <text className="fd-axis" x={84} y={yLine - 16} textAnchor="end">{topLabel}</text>
      <text className="fd-axis" x={84} y={yLine + 30} textAnchor="end">{bottomLabel}</text>
      {/* The single shared line. */}
      <line className="fd-line" x1={left - 6} y1={yLine} x2={right + 12} y2={yLine} />
      {tickEls}
      {/* A dot on the line marks the asked position (works even off-tick). */}
      {markFrac != null && markFrac >= 0 && markFrac <= 1 && (
        <g>
          <circle className="fd-mark-dot" cx={x(markFrac)} cy={yLine} r="5" />
          {Math.abs(Math.round(markFrac * ticks) / ticks - markFrac) > 1e-6 && (
            <>
              <text className="fd-mark-q" x={x(markFrac)} y={yLine - 16} textAnchor="middle">{round(mark)}</text>
              <text className="fd-mark-q" x={x(markFrac)} y={yLine + 30} textAnchor="middle">?</text>
            </>
          )}
        </g>
      )}
    </svg>
  );
}
