import React from "react";

import {
  fitToBox, centroid, edgeTicks, edgeChevrons, angleArcs, angleArc, rightSquare,
  lineIntersect, labelOutside, edgeLabelOutside, round,
} from "./geometryShapeUtils.js";

/**
 * GeometryShapeDiagram (Phase 3H) — THE renderer for triangles and
 * quadrilaterals. It is data-driven: the shapeCatalogue produces a spec of
 * points + which convention markings each edge/vertex carries, and this
 * component fits it to the view and draws the polygon, equal-side ticks,
 * parallel chevrons, equal-angle arcs, right-angle squares, diagonals with their
 * markings, and clean outward vertex / side / angle labels.
 *
 * diagramData: {
 *   points:  [{x,y}]  (MATH space; fitted here),
 *   edges:   [{ ticks?, chevrons?, label? }]   // edge i = points[i]→points[i+1]
 *   angles:  [{ at, arcs?, right?, label? }],
 *   diagonals?: [{ from, to }],  diagonalMarks?: { equal?, perpendicular?, bisected? },
 *   vertexLabels?: ["A","B",...],  caption?: string,
 * }
 */
export default function GeometryShapeDiagram({ data }) {
  const raw = Array.isArray(data?.points) ? data.points : [];
  if (raw.length < 3) return null;
  const pts = fitToBox(raw, { x: 46, y: 36, w: 268, h: 178 });
  const n = pts.length;
  const c = centroid(pts);
  const edges = data.edges || [];
  const angles = data.angles || [];

  const polyPath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${round(p.x)} ${round(p.y)}`).join(" ") + " Z";

  return (
    <svg className="diagram-svg diagram-svg-wide" viewBox="0 0 360 260" role="img" aria-label="Geometric figure">
      <path className="gm-shape" d={polyPath} />

      {/* Edge markings + side labels. */}
      {edges.map((e, i) => {
        const a = pts[i], b = pts[(i + 1) % n];
        const ticks = edgeTicks(a, b, e.ticks || 0);
        const chev = edgeChevrons(a, b, e.chevrons || 0);
        const lp = e.label != null ? edgeLabelOutside(a, b, c, 16) : null;
        return (
          <g key={`e${i}`}>
            {ticks.map((t, k) => <line key={`t${k}`} className="gm-tick" x1={round(t.x1)} y1={round(t.y1)} x2={round(t.x2)} y2={round(t.y2)} />)}
            {chev.map((pp, k) => <polyline key={`c${k}`} className="gm-chevron" points={pp} />)}
            {lp && <text className="gm-side-label" x={round(lp.x)} y={round(lp.y) + 4} textAnchor="middle">{e.label}</text>}
          </g>
        );
      })}

      {/* Angle markings + angle labels. */}
      {angles.map((ang, i) => {
        const at = ang.at, v = pts[at], pA = pts[(at + 1) % n], pB = pts[(at - 1 + n) % n];
        if (ang.right) {
          return <polyline key={`a${i}`} className="gm-mark" points={rightSquare(v, pA, pB, 12)} />;
        }
        const arcs = ang.arcs ? angleArcs(v, pA, pB, ang.arcs) : [];
        const lbl = ang.label != null ? angleArc(v, pA, pB, 22).labelPos : null;
        return (
          <g key={`a${i}`}>
            {arcs.map((d, k) => <path key={`ar${k}`} className="gm-arc" d={d} />)}
            {lbl && <text className={/x|y|z|\?/.test(String(ang.label)) ? "gm-angle-label gm-angle-missing" : "gm-angle-label"} x={round(lbl.x)} y={round(lbl.y) + 4} textAnchor="middle">{ang.label}</text>}
          </g>
        );
      })}

      {/* Diagonals + their markings. */}
      {Array.isArray(data.diagonals) && (() => {
        const dm = data.diagonalMarks || {};
        const D = data.diagonals.map((d) => ({ a: pts[d.from], b: pts[d.to] }));
        const X = D.length === 2 ? lineIntersect(D[0].a, D[0].b, D[1].a, D[1].b) : null;
        return (
          <g>
            {D.map((d, i) => <line key={`d${i}`} className="gm-diagonal" x1={round(d.a.x)} y1={round(d.a.y)} x2={round(d.b.x)} y2={round(d.b.y)} />)}
            {/* Equal diagonals: one tick at the midpoint of each. */}
            {dm.equal && D.map((d, i) => edgeTicks(d.a, d.b, 1, 6).map((t, k) => (
              <line key={`de${i}${k}`} className="gm-tick" x1={round(t.x1)} y1={round(t.y1)} x2={round(t.x2)} y2={round(t.y2)} />
            )))}
            {/* Bisected: matching ticks on the two halves of each diagonal. */}
            {dm.bisected && X && D.map((d, i) => [d.a, d.b].map((end, k) => edgeTicks(end, X, i + 1, 5).map((t, j) => (
              <line key={`db${i}${k}${j}`} className="gm-tick" x1={round(t.x1)} y1={round(t.y1)} x2={round(t.x2)} y2={round(t.y2)} />
            ))))}
            {/* Perpendicular diagonals: right-angle square at the crossing. */}
            {dm.perpendicular && X && <polyline className="gm-mark" points={rightSquare(X, D[0].b, D[1].b, 9)} />}
          </g>
        );
      })()}

      {/* Vertex labels, placed outside the shape. */}
      {Array.isArray(data.vertexLabels) && pts.map((p, i) => (
        data.vertexLabels[i] != null ? (
          <text key={`v${i}`} className="gm-vertex" x={round(labelOutside(p, c, 15).x)} y={round(labelOutside(p, c, 15).y) + 4} textAnchor="middle">{data.vertexLabels[i]}</text>
        ) : null
      ))}

      {data?.caption && <text className="gm-caption" x={180} y={248} textAnchor="middle">{data.caption}</text>}
    </svg>
  );
}
