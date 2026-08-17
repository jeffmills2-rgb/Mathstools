import React from "react";

import { POLYGON_SPECS, fitPoints, midpoint, pathFromPoints, resolveLabelPositions } from "./lengthDiagramUtils.js";

/**
 * LengthPolygonDiagram (Phase 3B) — a labelled polygon for perimeter work:
 * squares, rectangles, parallelograms, rhombuses, kites, trapeziums, triangles.
 *
 * Improvements over the legacy engine: geometry-driven label placement (edge
 * normals), equal-side tick marks, PARALLEL chevrons (the legacy engine had
 * none), right-angle corners, and an accent-highlighted "missing" side.
 *
 * diagramData: { shape, labels: [text per edge, "" = unlabelled],
 *                highlightEdge?: index, note?: string }
 */

function tickMarks(a, b, count) {
  const m = midpoint(a, b);
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const px = -uy, py = ux;
  const half = 7, gap = 7;
  const offs = count === 2 ? [-gap / 2, gap / 2] : count === 3 ? [-gap, 0, gap] : [0];
  return offs.map((o, i) => (
    <line key={i} className="ln-mark"
      x1={m.x + ux * o - px * half} y1={m.y + uy * o - py * half}
      x2={m.x + ux * o + px * half} y2={m.y + uy * o + py * half} />
  ));
}

// A ">" chevron (or ">>") on an edge marking parallel sides.
function chevrons(a, b, count) {
  const m = midpoint(a, b);
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const px = -uy, py = ux;
  const s = 6, gap = 9;
  const offs = count === 2 ? [-gap / 2, gap / 2] : [0];
  return offs.map((o, i) => {
    const tip = { x: m.x + ux * (o + s), y: m.y + uy * (o + s) };
    const b1 = { x: m.x + ux * (o - s) + px * s, y: m.y + uy * (o - s) + py * s };
    const b2 = { x: m.x + ux * (o - s) - px * s, y: m.y + uy * (o - s) - py * s };
    return <path key={i} className="ln-mark" d={`M ${b1.x} ${b1.y} L ${tip.x} ${tip.y} L ${b2.x} ${b2.y}`} />;
  });
}

// A small right-angle square at corner point `c` between its two edges.
function rightAngleMark(prev, c, next) {
  const s = 11;
  const u = { x: prev.x - c.x, y: prev.y - c.y };
  const v = { x: next.x - c.x, y: next.y - c.y };
  const lu = Math.hypot(u.x, u.y) || 1, lv = Math.hypot(v.x, v.y) || 1;
  const a = { x: c.x + (u.x / lu) * s, y: c.y + (u.y / lu) * s };
  const b = { x: c.x + (v.x / lv) * s, y: c.y + (v.y / lv) * s };
  const d = { x: a.x + (v.x / lv) * s, y: a.y + (v.y / lv) * s };
  return <path className="ln-mark" d={`M ${a.x} ${a.y} L ${d.x} ${d.y} L ${b.x} ${b.y}`} />;
}

export default function LengthPolygonDiagram({ data }) {
  const spec = POLYGON_SPECS[data?.shape] || POLYGON_SPECS.rectangle;
  const labels = Array.isArray(data?.labels) ? data.labels : [];
  const highlight = Number.isInteger(data?.highlightEdge) ? data.highlightEdge : null;

  const pts = fitPoints(spec.points, { left: 56, top: 34, width: 248, height: 150 });
  const n = pts.length;
  const edge = (i) => [pts[i], pts[(i + 1) % n]];

  // Collision-aware outward placement (shared with the composite figures).
  const labelledEdges = labels.map((t, i) => (t ? i : -1)).filter((i) => i >= 0);
  const labelPositions = resolveLabelPositions(pts, labelledEdges, { offset: 20 });
  const posForEdge = new Map(labelledEdges.map((ei, i) => [ei, labelPositions[i]]));

  return (
    <svg className="diagram-svg diagram-svg-wide" viewBox="0 0 360 236" role="img"
      aria-label={`${data?.shape || "polygon"} perimeter diagram`}>
      <path className="ln-shape" d={pathFromPoints(pts)} />

      {(spec.tickGroups || []).map((group, gi) =>
        group.map((ei) => {
          const [a, b] = edge(ei);
          return <g key={`t${gi}-${ei}`}>{tickMarks(a, b, gi + 1)}</g>;
        })
      )}
      {(spec.parallelGroups || []).map((group, gi) =>
        group.map((ei) => {
          const [a, b] = edge(ei);
          return <g key={`p${gi}-${ei}`}>{chevrons(a, b, gi + 1)}</g>;
        })
      )}
      {(spec.rightAngles || []).map((ci) => (
        <g key={`r${ci}`}>{rightAngleMark(pts[(ci + n - 1) % n], pts[ci], pts[(ci + 1) % n])}</g>
      ))}

      {highlight != null && (() => {
        const [a, b] = edge(highlight);
        return <line className="ln-accent" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
      })()}

      {labels.map((text, ei) => {
        if (!text) return null;
        const pos = posForEdge.get(ei);
        const accent = highlight === ei;
        return (
          <text key={`l${ei}`} className={accent ? "ln-accent-label" : "fd-label"}
            x={pos.x} y={pos.y + 5} textAnchor="middle">{text}</text>
        );
      })}

      {data?.note && (
        <text className="fd-axis" x={180} y={228} textAnchor="middle">{data.note}</text>
      )}
    </svg>
  );
}
