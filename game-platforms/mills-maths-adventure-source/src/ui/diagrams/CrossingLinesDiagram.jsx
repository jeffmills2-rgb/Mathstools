import React from "react";

import { pol, arcPath, sectorLabelPos, equalAngleTicks, round } from "./angleDiagramUtils.js";

/**
 * CrossingLinesDiagram (Phase 3G) — two straight lines crossing at a point,
 * giving four angles. Used for vertically opposite / adjacent-at-a-crossing and
 * for NAMING a marked pair. Vertical pairs can carry matching equal-angle ticks.
 *
 * diagramData: {
 *   lines: number[]  two bearings (deg); each is drawn as a full line,
 *   sectors: [{ from, to, label, kind?, tickCount? }]  kind: "known"|"missing"|"equal",
 *   pointLabels?: [{ bearing, text }],  vertexLabel?: string,  caption?: string,
 * }
 */
export default function CrossingLinesDiagram({ data }) {
  const cx = 185, cy = 130;
  const lines = Array.isArray(data?.lines) ? data.lines : [];
  const sectors = Array.isArray(data?.sectors) ? data.sectors : [];
  const pointLabels = Array.isArray(data?.pointLabels) ? data.pointLabels : [];
  const LEN = 140;

  return (
    <svg className="diagram-svg diagram-svg-wide" viewBox="0 0 370 220" role="img"
      aria-label="Two crossing lines">
      {lines.map((b, i) => {
        const p = pol(cx, cy, b, LEN);
        const q = pol(cx, cy, b + 180, LEN);
        return <line key={`ln${i}`} className="ang-ray" x1={round(p.x)} y1={round(p.y)} x2={round(q.x)} y2={round(q.y)} />;
      })}

      {sectors.map((s, i) => {
        const missing = s.kind === "missing";
        const r = missing ? 40 : 32 + (i % 2) * 4;
        const dist = missing ? 62 : 54 + (i % 2) * 6;
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

      {pointLabels.map((pl, i) => {
        const p = pol(cx, cy, pl.bearing, LEN + 14);
        return <text key={`pl${i}`} className="ang-point" x={round(p.x)} y={round(p.y) + 4} textAnchor="middle">{pl.text}</text>;
      })}
      {data?.vertexLabel && (
        <text className="ang-point" x={cx + 12} y={cy + 16} textAnchor="middle">{data.vertexLabel}</text>
      )}

      <circle className="ang-vertex" cx={cx} cy={cy} r={3.2} />
      {data?.caption && <text className="ang-caption" x={185} y={210} textAnchor="middle">{data.caption}</text>}
    </svg>
  );
}
