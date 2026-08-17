import React from "react";

import { angleArcs, angleArc, round } from "./geometryShapeUtils.js";

/**
 * GeometryProofDiagram (Phase 3H) — the auxiliary constructions that make the
 * three proofs visible (a plain shape can't). Three kinds:
 *   "triangleSum"   — a line through the apex PARALLEL to the base, so the two
 *                     alternate angles + the apex angle form a straight line 180°.
 *   "exteriorAngle" — one side EXTENDED, the exterior angle marked alongside the
 *                     two interior opposite angles (exterior = sum of the two).
 *   "quadSum"       — a DIAGONAL splitting the quadrilateral into two triangles
 *                     (180° each → 360°).
 *
 * diagramData: { kind, labels?: {a,b,c,d}, ext?: {a,b,exterior} }
 */
export default function GeometryProofDiagram({ data }) {
  const kind = data?.kind || "triangleSum";
  if (kind === "exteriorAngle") return <ExteriorAngle data={data} />;
  if (kind === "quadSum") return <QuadSum data={data} />;
  return <TriangleSum data={data} />;
}

const L = (data, k, d) => (data?.labels && data.labels[k] != null ? data.labels[k] : d);

function arcGroup(v, pA, pB, count, cls, label, labelCls) {
  const paths = angleArcs(v, pA, pB, count, 17, 5);
  const lp = angleArc(v, pA, pB, 20 + count * 3).labelPos;
  return (
    <g>
      {paths.map((d, i) => <path key={i} className={cls} d={d} />)}
      {label != null && <text className={labelCls} x={round(lp.x)} y={round(lp.y) + 4} textAnchor="middle">{label}</text>}
    </g>
  );
}

function TriangleSum({ data }) {
  const A = { x: 168, y: 66 }, B = { x: 52, y: 196 }, C = { x: 300, y: 196 };
  const Ll = { x: 34, y: 66 }, Rr = { x: 302, y: 66 }; // parallel line through the apex
  return (
    <svg className="diagram-svg diagram-svg-wide" viewBox="0 0 360 250" role="img" aria-label="Triangle angle-sum construction">
      <line className="gm-parallel" x1={Ll.x} y1={Ll.y} x2={Rr.x} y2={Rr.y} />
      <polyline className="gm-chevron" points={`${196},${60} ${202},${66} ${196},${72}`} />
      <line className="gm-parallel" x1={B.x} y1={B.y} x2={C.x} y2={C.y} />
      <polyline className="gm-chevron" points={`${172},${190} ${178},${196} ${172},${202}`} />
      <path className="gm-shape gm-shape-open" d={`M ${A.x} ${A.y} L ${B.x} ${B.y} L ${C.x} ${C.y} Z`} />
      {/* base angles */}
      {arcGroup(B, A, C, 1, "gm-arc", L(data, "b", "b"), "gm-angle-label")}
      {arcGroup(C, B, A, 2, "gm-arc", L(data, "c", "c"), "gm-angle-label")}
      {/* the three angles on the straight line at A: alternate(b) · apex(a) · alternate(c) */}
      {arcGroup(A, Ll, B, 1, "gm-arc", L(data, "b", "b"), "gm-angle-label")}
      {arcGroup(A, B, C, 3, "gm-arc", L(data, "a", "a"), "gm-angle-label")}
      {arcGroup(A, C, Rr, 2, "gm-arc", L(data, "c", "c"), "gm-angle-label")}
      <text className="gm-vertex" x={A.x} y={A.y - 12} textAnchor="middle">A</text>
      <text className="gm-vertex" x={B.x - 12} y={B.y + 6} textAnchor="middle">B</text>
      <text className="gm-vertex" x={C.x + 12} y={C.y + 6} textAnchor="middle">C</text>
      <text className="gm-caption" x={180} y={240} textAnchor="middle">A line through the apex, parallel to the base</text>
    </svg>
  );
}

function ExteriorAngle({ data }) {
  const A = { x: 150, y: 66 }, B = { x: 52, y: 188 }, C = { x: 250, y: 188 }, Dd = { x: 336, y: 188 };
  const ext = data?.ext || {};
  return (
    <svg className="diagram-svg diagram-svg-wide" viewBox="0 0 360 250" role="img" aria-label="Exterior angle construction">
      <line className="gm-ray" x1={B.x} y1={B.y} x2={Dd.x} y2={Dd.y} />
      <polygon className="gm-arrow" points={`${Dd.x},${Dd.y} ${Dd.x - 10},${Dd.y - 4.5} ${Dd.x - 10},${Dd.y + 4.5}`} />
      <path className="gm-shape gm-shape-open" d={`M ${A.x} ${A.y} L ${B.x} ${B.y} L ${C.x} ${C.y}`} />
      <line className="gm-shape-edge" x1={A.x} y1={A.y} x2={C.x} y2={C.y} />
      {arcGroup(A, B, C, 1, "gm-arc", ext.a != null ? `${ext.a}°` : L(data, "a", "a"), "gm-angle-label")}
      {arcGroup(B, A, C, 2, "gm-arc", ext.b != null ? `${ext.b}°` : L(data, "b", "b"), "gm-angle-label")}
      {arcGroup(C, A, Dd, 3, "gm-arc gm-arc-ext", ext.exterior != null ? `${ext.exterior}°` : (data?.labels?.ext || "x"), "gm-angle-label gm-angle-missing")}
      <text className="gm-vertex" x={A.x} y={A.y - 12} textAnchor="middle">A</text>
      <text className="gm-vertex" x={B.x - 12} y={B.y + 6} textAnchor="middle">B</text>
      <text className="gm-vertex" x={C.x - 4} y={C.y + 18} textAnchor="middle">C</text>
      <text className="gm-vertex" x={Dd.x} y={Dd.y + 18} textAnchor="middle">D</text>
      <text className="gm-caption" x={180} y={240} textAnchor="middle">Side BC extended to D — exterior angle at C</text>
    </svg>
  );
}

function QuadSum({ data }) {
  const A = { x: 60, y: 70 }, B = { x: 300, y: 56 }, C = { x: 316, y: 196 }, Dd = { x: 44, y: 200 };
  return (
    <svg className="diagram-svg diagram-svg-wide" viewBox="0 0 360 250" role="img" aria-label="Quadrilateral angle-sum construction">
      <path className="gm-shape" d={`M ${A.x} ${A.y} L ${B.x} ${B.y} L ${C.x} ${C.y} L ${Dd.x} ${Dd.y} Z`} />
      <line className="gm-diagonal" x1={A.x} y1={A.y} x2={C.x} y2={C.y} />
      <text className="gm-angle-label" x={(A.x + B.x + C.x) / 3} y={(A.y + B.y + C.y) / 3 + 4} textAnchor="middle">180°</text>
      <text className="gm-angle-label" x={(A.x + C.x + Dd.x) / 3} y={(A.y + C.y + Dd.y) / 3 + 4} textAnchor="middle">180°</text>
      <text className="gm-vertex" x={A.x - 12} y={A.y} textAnchor="middle">A</text>
      <text className="gm-vertex" x={B.x + 12} y={B.y} textAnchor="middle">B</text>
      <text className="gm-vertex" x={C.x + 12} y={C.y + 6} textAnchor="middle">C</text>
      <text className="gm-vertex" x={Dd.x - 12} y={Dd.y + 6} textAnchor="middle">D</text>
      <text className="gm-caption" x={180} y={240} textAnchor="middle">Diagonal AC splits ABCD into two triangles</text>
    </svg>
  );
}
