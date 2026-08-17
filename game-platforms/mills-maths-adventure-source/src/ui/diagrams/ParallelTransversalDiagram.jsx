import React from "react";

import { pol, arcPath, sectorLabelPos, rightAngleSquare, parallelChevrons, round } from "./angleDiagramUtils.js";

/**
 * ParallelTransversalDiagram (Phase 3G) — two lines cut by a transversal, the
 * heart of the parallel-lines work: corresponding / alternate / co-interior
 * pairs, naming, "are they parallel?" and finding unknowns. Angles are labelled
 * per sector at each intersection; a marked pair can be accented; parallel
 * lines carry matching chevrons; a perpendicular transversal draws a square.
 *
 * The four sectors at each crossing use the standard keys (bearings, math
 * convention with the transversal bearing θ):
 *   upperRight [0,θ]  upperLeft [θ,180]  lowerLeft [180,θ+180]  lowerRight [θ+180,360]
 *
 * diagramData: {
 *   acute: 35..70, direction: "rising"|"falling",
 *   top:    [{ sector, label, accent? }],   bottom: [{ sector, label, accent? }],
 *   parallelMarks?: boolean,   perpendicular?: boolean,   caption?: string,
 * }
 */
const SECTORS = (theta) => ({
  upperRight: [0, theta],
  upperLeft: [theta, 180],
  lowerLeft: [180, theta + 180],
  lowerRight: [theta + 180, 360],
});

export default function ParallelTransversalDiagram({ data }) {
  const acute = Math.min(70, Math.max(35, Number(data?.acute ?? 55)));
  const direction = data?.direction === "falling" ? "falling" : "rising";
  const perpendicular = Boolean(data?.perpendicular);
  const theta = perpendicular ? 90 : direction === "falling" ? 180 - acute : acute;
  const sectorMap = SECTORS(theta);

  const y1 = 74, y2 = 176;
  const lineX0 = 34, lineX1 = 336;
  const dy = y2 - y1;
  const run = perpendicular ? 0 : dy / Math.tan((acute * Math.PI) / 180);
  const clampedRun = Math.max(-150, Math.min(150, run));
  const topX = direction === "falling" ? 185 - clampedRun / 2 : 185 + clampedRun / 2;
  const botX = direction === "falling" ? 185 + clampedRun / 2 : 185 - clampedRun / 2;

  // Transversal line through T and B, drawn to the view edges.
  const m = perpendicular ? Infinity : (direction === "falling" ? Math.tan((acute * Math.PI) / 180) : -Math.tan((acute * Math.PI) / 180));
  const yTopEdge = 22, yBotEdge = 214;
  const xAt = (y) => (perpendicular ? topX : botX + (y - y2) / m);

  const drawSectors = (cx, cy, list) =>
    (list || []).map((it, i) => {
      const range = sectorMap[it.sector];
      if (!range) return null;
      const [from, to] = range;
      const span = to - from;
      const r = span <= 90 ? 24 : 28;
      const dist = r + 20;
      const lp = sectorLabelPos(cx, cy, from, to, dist);
      const isX = it.accent || String(it.label).includes("x");
      return (
        <g key={`s${cy}${i}`}>
          <path className={isX ? "ang-arc ang-arc-accent" : "ang-arc ang-arc-parallel"} d={arcPath(cx, cy, r, from, to)} />
          {it.label != null && (
            <text className={isX ? "ang-label ang-label-missing" : "ang-label"} x={round(lp.x)} y={round(lp.y) + 5} textAnchor="middle">{it.label}</text>
          )}
        </g>
      );
    });

  return (
    <svg className="diagram-svg diagram-svg-wide" viewBox="0 0 370 232" role="img"
      aria-label="Parallel lines cut by a transversal">
      {/* The two parallel lines. */}
      <line className="ang-parallel" x1={lineX0} y1={y1} x2={lineX1} y2={y1} />
      <line className="ang-parallel" x1={lineX0} y1={y2} x2={lineX1} y2={y2} />

      {/* Transversal. */}
      <line className="ang-ray" x1={round(xAt(yTopEdge))} y1={yTopEdge} x2={round(xAt(yBotEdge))} y2={yBotEdge} />

      {/* Parallel chevrons (one per line, to the right of the transversal). */}
      {data?.parallelMarks && [y1, y2].map((yy, i) => (
        parallelChevrons(Math.max(topX, botX) + 40, yy, 0, 1).map((pts, k) => (
          <polyline key={`pc${i}${k}`} className="ang-chevron" points={pts} />
        ))
      ))}

      {/* Perpendicular square at the top intersection. */}
      {perpendicular && (() => {
        const [q1, q2, q3] = rightAngleSquare(topX, y1, 0, 13);
        return <polyline className="ang-mark" points={`${round(q1.x)},${round(q1.y)} ${round(q2.x)},${round(q2.y)} ${round(q3.x)},${round(q3.y)}`} />;
      })()}

      {drawSectors(topX, y1, data?.top)}
      {drawSectors(botX, y2, data?.bottom)}

      <circle className="ang-vertex" cx={round(topX)} cy={y1} r={3} />
      <circle className="ang-vertex" cx={round(botX)} cy={y2} r={3} />
      {data?.caption && <text className="ang-caption" x={185} y={226} textAnchor="middle">{data.caption}</text>}
    </svg>
  );
}
