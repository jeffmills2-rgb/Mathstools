import React from "react";

import { arcPath, sweepCCW, midBearing, equalAngleTicks, round } from "./angleDiagramUtils.js";

/**
 * GeometryFigureDiagram (Phase 3G) — a data-driven labelled figure for geometry
 * LANGUAGE & CONVENTIONS: naming points/rays/lines/intervals with capitals,
 * labelling a vertex and arms, reading diagram markings (right-angle squares,
 * equal-angle ticks, equal-interval ticks), and the ⊥ / ∥ conventions. Also used
 * to CLASSIFY angles (acute/right/obtuse/straight/reflex/revolution).
 *
 * All coordinates are in the SVG viewBox (0..360 × 0..220). Points are named so
 * segments/angles can reference them.
 *
 * diagramData: {
 *   points:   [{ id, x, y, label?, labelDx?, labelDy? }],
 *   segments: [{ from, to, type?: "line"|"ray"|"interval",
 *                ticks?: number, chevrons?: number, accent?: boolean }],
 *   angles:   [{ vertex, from, to, label?, right?: boolean, reflex?: boolean,
 *                ticks?: number, accent?: boolean, r?: number }],
 *   caption?: string,
 * }
 */
export default function GeometryFigureDiagram({ data }) {
  const points = Array.isArray(data?.points) ? data.points : [];
  const segments = Array.isArray(data?.segments) ? data.segments : [];
  const angles = Array.isArray(data?.angles) ? data.angles : [];
  const byId = Object.fromEntries(points.map((p) => [p.id, p]));

  const bearing = (v, p) => (Math.atan2(-(p.y - v.y), p.x - v.x) * 180) / Math.PI;
  const unit = (v, p) => {
    const dx = p.x - v.x, dy = p.y - v.y;
    const L = Math.hypot(dx, dy) || 1;
    return { x: dx / L, y: dy / L };
  };
  const arrow = (tip, from) => {
    const u = unit(from, tip);
    const px = -u.y, py = u.x, L = 9, W = 4.5;
    return `${round(tip.x)},${round(tip.y)} ${round(tip.x - u.x * L + px * W)},${round(tip.y - u.y * L + py * W)} ${round(tip.x - u.x * L - px * W)},${round(tip.y - u.y * L - py * W)}`;
  };

  return (
    <svg className="diagram-svg diagram-svg-wide" viewBox="0 0 360 220" role="img" aria-label="Geometry figure">
      {segments.map((s, i) => {
        const a = byId[s.from], b = byId[s.to];
        if (!a || !b) return null;
        const type = s.type || "interval";
        const u = unit(a, b);
        const ext = 22;
        // A full line overshoots both ends; a ray overshoots the `to` end.
        const p1 = type === "line" ? { x: a.x - u.x * ext, y: a.y - u.y * ext } : { x: a.x, y: a.y };
        const p2 = type === "interval" ? { x: b.x, y: b.y } : { x: b.x + u.x * ext, y: b.y + u.y * ext };
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        const perp = { x: -u.y, y: u.x };
        return (
          <g key={`seg${i}`}>
            <line className={s.accent ? "ang-ray ang-ray-accent" : "ang-ray"} x1={round(p1.x)} y1={round(p1.y)} x2={round(p2.x)} y2={round(p2.y)} />
            {(type === "ray" || type === "line") && <polygon className="ang-arrow" points={arrow(p2, a)} />}
            {type === "line" && <polygon className="ang-arrow" points={arrow(p1, b)} />}
            {/* Equal-interval ticks at the midpoint. */}
            {Array.from({ length: s.ticks || 0 }).map((_, k) => {
              const off = ((k - (s.ticks - 1) / 2) * 5);
              const c = { x: mid.x + u.x * off, y: mid.y + u.y * off };
              return <line key={`tk${k}`} className="ang-tick" x1={round(c.x - perp.x * 6)} y1={round(c.y - perp.y * 6)} x2={round(c.x + perp.x * 6)} y2={round(c.y + perp.y * 6)} />;
            })}
            {/* Parallel chevrons at the midpoint. */}
            {Array.from({ length: s.chevrons || 0 }).map((_, k) => {
              const off = ((k - (s.chevrons - 1) / 2) * 7);
              const c = { x: mid.x + u.x * off, y: mid.y + u.y * off };
              const tip = { x: c.x + u.x * 6, y: c.y + u.y * 6 };
              return <polyline key={`cv${k}`} className="ang-chevron"
                points={`${round(c.x - u.x + perp.x * 6)},${round(c.y - u.y + perp.y * 6)} ${round(tip.x)},${round(tip.y)} ${round(c.x - u.x - perp.x * 6)},${round(c.y - u.y - perp.y * 6)}`} />;
            })}
          </g>
        );
      })}

      {angles.map((ang, i) => {
        const v = byId[ang.vertex], f = byId[ang.from], t = byId[ang.to];
        if (!v || !f || !t) return null;
        let a0 = bearing(v, f), a1 = bearing(v, t);
        // Draw the intended side: minor arc by default, major if reflex.
        if ((sweepCCW(a0, a1) > 180) !== Boolean(ang.reflex)) { const tmp = a0; a0 = a1; a1 = tmp; }
        const r = ang.r || 26;
        if (ang.right) {
          const u1 = unit(v, f), u2 = unit(v, t), s = 13;
          const c1 = { x: v.x + u1.x * s, y: v.y + u1.y * s };
          const corner = { x: v.x + (u1.x + u2.x) * s, y: v.y + (u1.y + u2.y) * s };
          const c2 = { x: v.x + u2.x * s, y: v.y + u2.y * s };
          return <polyline key={`ang${i}`} className="ang-mark" points={`${round(c1.x)},${round(c1.y)} ${round(corner.x)},${round(corner.y)} ${round(c2.x)},${round(c2.y)}`} />;
        }
        const mb = midBearing(a0, a1);
        const lp = { x: v.x + Math.cos((mb * Math.PI) / 180) * (r + 16), y: v.y - Math.sin((mb * Math.PI) / 180) * (r + 16) };
        const ticks = ang.ticks ? equalAngleTicks(v.x, v.y, a0, a1, r, ang.ticks) : [];
        return (
          <g key={`ang${i}`}>
            <path className={ang.accent ? "ang-arc ang-arc-accent" : "ang-arc"} d={arcPath(v.x, v.y, r, a0, a1)} />
            {ticks.map((t, k) => (
              <line key={`at${k}`} className="ang-tick" x1={round(t.x1)} y1={round(t.y1)} x2={round(t.x2)} y2={round(t.y2)} />
            ))}
            {ang.label != null && <text className={ang.accent ? "ang-label ang-label-missing" : "ang-label"} x={round(lp.x)} y={round(lp.y) + 5} textAnchor="middle">{ang.label}</text>}
          </g>
        );
      })}

      {points.map((p, i) => (
        <g key={`pt${i}`}>
          <circle className="ang-point-dot" cx={round(p.x)} cy={round(p.y)} r={3} />
          {p.label != null && <text className="ang-point" x={round(p.x + (p.labelDx ?? 0))} y={round(p.y + (p.labelDy ?? -9))} textAnchor="middle">{p.label}</text>}
        </g>
      ))}

      {data?.caption && <text className="ang-caption" x={180} y={210} textAnchor="middle">{data.caption}</text>}
    </svg>
  );
}
