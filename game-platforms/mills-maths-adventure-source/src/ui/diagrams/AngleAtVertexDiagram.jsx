import React from "react";

import { pol, arcPath, sectorLabelPos, rightAngleSquare, equalAngleTicks, round } from "./angleDiagramUtils.js";

/**
 * AngleAtVertexDiagram (Phase 3G) — the workhorse for "angles at a point":
 * angles on a straight line, around a point, in a right angle, and
 * complementary / supplementary / adjacent pairs. One vertex, several arms,
 * a labelled arc in each sector.
 *
 * diagramData: {
 *   arms:   number[]  bearings (deg, 0°=east, anticlockwise) of each ray,
 *   sectors:[{ from, to, label, kind? }]  kind: "known"|"missing"|"right"|"equal",
 *   baseline?: boolean   // style the 180°-apart arms as one straight line,
 *   pointLabels?: [{ bearing, text }],  vertexLabel?: string,
 *   caption?: string,
 * }
 */
export default function AngleAtVertexDiagram({ data }) {
  const cx = 185, cy = 150;
  const arms = Array.isArray(data?.arms) ? data.arms : [];
  const sectors = Array.isArray(data?.sectors) ? data.sectors : [];
  const pointLabels = Array.isArray(data?.pointLabels) ? data.pointLabels : [];
  const RAY = 120;

  return (
    <svg className="diagram-svg diagram-svg-wide" viewBox="0 0 370 240" role="img"
      aria-label="Angles at a point">
      {/* Arms (rays from the vertex). */}
      {arms.map((b, i) => {
        const p = pol(cx, cy, b, RAY);
        return <line key={`arm${i}`} className="ang-ray" x1={cx} y1={cy} x2={round(p.x)} y2={round(p.y)} />;
      })}

      {/* Sector arcs + labels. */}
      {sectors.map((s, i) => {
        if (s.kind === "right") {
          const [q1, q2, q3] = rightAngleSquare(cx, cy, s.from, 15);
          return (
            <polyline key={`sec${i}`} className="ang-mark"
              points={`${round(q1.x)},${round(q1.y)} ${round(q2.x)},${round(q2.y)} ${round(q3.x)},${round(q3.y)}`} />
          );
        }
        const missing = s.kind === "missing";
        const r = missing ? 46 : 38 + (i % 2) * 5;
        const dist = missing ? 70 : 60 + (i % 2) * 8;
        const lp = sectorLabelPos(cx, cy, s.from, s.to, dist);
        const ticks = s.kind === "equal" ? equalAngleTicks(cx, cy, s.from, s.to, r, s.tickCount || 1) : [];
        return (
          <g key={`sec${i}`}>
            <path className={missing ? "ang-arc ang-arc-accent" : "ang-arc"} d={arcPath(cx, cy, r, s.from, s.to)} />
            {ticks.map((t, k) => (
              <line key={`t${k}`} className="ang-tick" x1={round(t.x1)} y1={round(t.y1)} x2={round(t.x2)} y2={round(t.y2)} />
            ))}
            {s.label != null && (
              <text className={missing ? "ang-label ang-label-missing" : "ang-label"}
                x={round(lp.x)} y={round(lp.y) + 5} textAnchor="middle">{s.label}</text>
            )}
          </g>
        );
      })}

      {/* Point labels at arm ends + optional vertex label. */}
      {pointLabels.map((pl, i) => {
        const p = pol(cx, cy, pl.bearing, RAY + 16);
        return <text key={`pl${i}`} className="ang-point" x={round(p.x)} y={round(p.y) + 4} textAnchor="middle">{pl.text}</text>;
      })}
      {data?.vertexLabel && (
        <text className="ang-point" x={cx - 12} y={cy + 16} textAnchor="middle">{data.vertexLabel}</text>
      )}

      <circle className="ang-vertex" cx={cx} cy={cy} r={3.2} />
      {data?.caption && <text className="ang-caption" x={185} y={228} textAnchor="middle">{data.caption}</text>}
    </svg>
  );
}
