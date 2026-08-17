import React from "react";

/**
 * PythagorasTriangleDiagram (Phase 2N) — a clean right-angled triangle for
 * unknown-side questions. Ported from the legacy Pythagoras engine but drawn in
 * a FIXED, readable orientation (right angle bottom-left) so labels sit OUTSIDE
 * each side with no collision and nothing overflows the modal.
 *
 * diagramData: { a, b, c, labels: { a, b, c }, units }
 *   a = vertical leg, b = horizontal leg, c = hypotenuse. labels.* are the
 *   display strings (e.g. "x", "9.1 m") provided by the adapter.
 */
export default function PythagorasTriangleDiagram({ data }) {
  const { a, b, labels = {} } = data || {};
  const av = Number(a);
  const bv = Number(b);
  if (!(av > 0) || !(bv > 0)) return null;

  // Scale the legs to fit the drawing area.
  const s = Math.min(150 / bv, 110 / av);
  const bw = bv * s;
  const ah = av * s;
  const x0 = 64;
  const yB = 158; // baseline

  const A = `${x0},${yB}`;            // right angle
  const B = `${x0 + bw},${yB}`;       // along the horizontal leg
  const C = `${x0},${yB - ah}`;       // along the vertical leg

  const la = labels.a != null ? labels.a : "";
  const lb = labels.b != null ? labels.b : "";
  const lc = labels.c != null ? labels.c : "";

  return (
    <svg className="diagram-svg" viewBox="0 0 280 200" role="img" aria-label="Right-angled triangle for Pythagoras">
      <polygon className="diagram-shape" points={`${A} ${B} ${C}`} />

      {/* right-angle marker at A (bottom-left) */}
      <path className="diagram-right-angle" d={`M ${x0 + 13} ${yB} L ${x0 + 13} ${yB - 13} L ${x0} ${yB - 13}`} />

      {/* vertical leg a — label to the LEFT */}
      <text className="diagram-dim" x={x0 - 16} y={yB - ah / 2} textAnchor="middle"
        transform={`rotate(-90 ${x0 - 16} ${yB - ah / 2})`}>{la}</text>

      {/* horizontal leg b — label BELOW */}
      <text className="diagram-dim" x={x0 + bw / 2} y={yB + 22} textAnchor="middle">{lb}</text>

      {/* hypotenuse c — label OUTSIDE (up-right of its midpoint) */}
      <text className="diagram-dim" x={x0 + bw / 2 + 12} y={yB - ah / 2 - 8} textAnchor="start">{lc}</text>
    </svg>
  );
}
