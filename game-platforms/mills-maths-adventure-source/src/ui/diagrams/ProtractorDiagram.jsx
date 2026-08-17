import React from "react";

import { pol, arcPath, round } from "./angleDiagramUtils.js";

/**
 * ProtractorDiagram (Phase 3G) — a clean semicircular protractor with a full
 * dual scale. BOTH arms sit at NON-ZERO readings, so the measured angle is the
 * DIFFERENCE of the two readings (the whole point of this question type) — never
 * "read the number the arm points at". Bearings are math-convention (0° = east
 * along the flat edge, 90° = straight up, 180° = west).
 *
 * diagramData: { armA, armB }  bearings in (0,180); answer = |armA − armB|.
 */
export default function ProtractorDiagram({ data }) {
  const cx = 190, cy = 196;
  const outerR = 172, ringR = 150, innerR = 50;
  const armA = clamp(Number(data?.armA ?? 40));
  const armB = clamp(Number(data?.armB ?? 120));

  const bodyPath = [
    `M ${cx - outerR} ${cy}`,
    `A ${outerR} ${outerR} 0 0 1 ${cx + outerR} ${cy}`,
    `L ${cx + innerR} ${cy}`,
    `A ${innerR} ${innerR} 0 0 0 ${cx - innerR} ${cy}`,
    "Z",
  ].join(" ");

  const ticks = [];
  for (let d = 0; d <= 180; d += 1) {
    const major = d % 10 === 0;
    const mid = d % 5 === 0 && !major;
    const len = major ? 16 : mid ? 11 : 7;
    const o = pol(cx, cy, d, outerR);
    const i = pol(cx, cy, d, outerR - len);
    ticks.push(
      <line key={`tk${d}`} className={major ? "prot-tick-major" : mid ? "prot-tick-mid" : "prot-tick-minor"}
        x1={round(o.x)} y1={round(o.y)} x2={round(i.x)} y2={round(i.y)} />
    );
  }

  const numbers = [];
  for (let d = 0; d <= 180; d += 10) {
    const inner = pol(cx, cy, d, ringR - 34); // inner scale: 0 at east → 180 at west
    const outer = pol(cx, cy, d, ringR - 12); // outer scale: 0 at west → 180 at east
    numbers.push(
      <text key={`in${d}`} className="prot-num" x={round(inner.x)} y={round(inner.y) + 3.5} textAnchor="middle">{d}</text>,
      <text key={`on${d}`} className="prot-num prot-num-outer" x={round(outer.x)} y={round(outer.y) + 3.5} textAnchor="middle">{180 - d}</text>
    );
  }

  const A = pol(cx, cy, armA, outerR - 4);
  const B = pol(cx, cy, armB, outerR - 4);
  const lo = Math.min(armA, armB), hi = Math.max(armA, armB);

  return (
    <svg className="diagram-svg diagram-svg-wide" viewBox="0 0 380 224" role="img"
      aria-label="Angle measured on a protractor">
      <path className="prot-body" d={bodyPath} fillRule="evenodd" />
      {[outerR, ringR, 92, innerR].map((r, i) => (
        <path key={`ga${i}`} className="prot-guide" d={arcPath(cx, cy, r, 0, 180)} />
      ))}
      <line className="prot-base" x1={cx - outerR} y1={cy} x2={cx + outerR} y2={cy} />
      {ticks}
      {numbers}

      {/* Measured angle between the two arms (highlighted arc, not filled). */}
      <path className="prot-measure" d={arcPath(cx, cy, innerR + 26, lo, hi)} />

      {/* The two arms. */}
      <line className="prot-arm" x1={cx} y1={cy} x2={round(A.x)} y2={round(A.y)} />
      <line className="prot-arm" x1={cx} y1={cy} x2={round(B.x)} y2={round(B.y)} />
      <circle className="prot-armdot" cx={round(A.x)} cy={round(A.y)} r={4} />
      <circle className="prot-armdot" cx={round(B.x)} cy={round(B.y)} r={4} />

      <circle className="prot-origin" cx={cx} cy={cy} r={4.5} />
    </svg>
  );
}

function clamp(v) {
  return Math.min(178, Math.max(2, Number.isFinite(v) ? v : 90));
}
