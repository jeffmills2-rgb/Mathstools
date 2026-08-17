/**
 * angleDiagramUtils (Phase 3G — Angles) — PURE geometry helpers shared by every
 * angle diagram renderer AND the system checks (no React, no DOM). Kept separate
 * from lengthDiagramUtils because angle work reads far more naturally in the
 * standard MATHEMATICAL convention (0° = east, angles increase anticlockwise)
 * with the screen y-axis flipped, exactly like a textbook protractor.
 *
 *   pol(cx, cy, deg, r)  → point r from (cx,cy) at bearing `deg`, y-UP on screen.
 *   sweepCCW(a, b)       → the positive turn from a to b (0..360), anticlockwise.
 *   arcPath(cx,cy,r,a,b) → SVG path for the arc a→b (anticlockwise, sweep-flag 0).
 *
 * These match the geometry the CHHS engine used (proven on-screen) so the arcs,
 * arrowheads and labels sit where you expect.
 */

export function pol(cx, cy, deg, r) {
  const a = (deg * Math.PI) / 180;
  return { x: cx + Math.cos(a) * r, y: cy - Math.sin(a) * r };
}

// Positive anticlockwise turn a→b, in [0, 360).
export function sweepCCW(a, b) {
  let v = b - a;
  while (v < 0) v += 360;
  while (v >= 360) v -= 360;
  return v;
}

// SVG arc from bearing `a` to bearing `b` going ANTICLOCKWISE (increasing angle).
// With y flipped that is SVG sweep-flag 0; large-arc when the turn exceeds 180°.
export function arcPath(cx, cy, r, a, b) {
  const p = pol(cx, cy, a, r);
  const q = pol(cx, cy, b, r);
  const large = sweepCCW(a, b) > 180 ? 1 : 0;
  return `M ${round(p.x)} ${round(p.y)} A ${r} ${r} 0 ${large} 0 ${round(q.x)} ${round(q.y)}`;
}

// The bearing that bisects the anticlockwise sector a→b.
export function midBearing(a, b) {
  return a + sweepCCW(a, b) / 2;
}

// A label position sitting `dist` from the vertex along the sector's bisector.
export function sectorLabelPos(cx, cy, a, b, dist) {
  return pol(cx, cy, midBearing(a, b), dist);
}

// A small right-angle square at the vertex, between bearings `a` and `a+90`.
// Returns the 3 polyline points (out along a, corner, out along a+90).
export function rightAngleSquare(cx, cy, a, size = 15) {
  const p1 = pol(cx, cy, a, size);
  const corner = pol(cx, cy, a + 45, size * Math.SQRT2);
  const p2 = pol(cx, cy, a + 90, size);
  return [p1, corner, p2];
}

// Short equal-angle tick marks: `count` little arcs across the sector bisector.
// Returns an array of {x1,y1,x2,y2} chord segments crossing the arc at radius r.
export function equalAngleTicks(cx, cy, a, b, r, count = 1, gap = 6) {
  const mid = midBearing(a, b);
  const out = [];
  const spread = (count - 1) * gap;
  for (let i = 0; i < count; i++) {
    const rr = r - spread / 2 + i * gap;
    const t = pol(cx, cy, mid, rr);
    // A tiny chord perpendicular to the bisector.
    const perp = { x: -Math.sin((mid * Math.PI) / 180), y: -Math.cos((mid * Math.PI) / 180) };
    out.push({ x1: t.x - perp.x * 5, y1: t.y - perp.y * 5, x2: t.x + perp.x * 5, y2: t.y + perp.y * 5 });
  }
  return out;
}

// Parallel-direction chevrons (› marks) drawn along a line's direction `deg`,
// centred at (x,y). `count` chevrons stacked. Returns polyline point strings.
export function parallelChevrons(x, y, deg, count = 1, size = 6, gap = 6) {
  const dir = { x: Math.cos((deg * Math.PI) / 180), y: -Math.sin((deg * Math.PI) / 180) };
  const perp = { x: -dir.y, y: dir.x };
  const marks = [];
  const spread = (count - 1) * gap;
  for (let i = 0; i < count; i++) {
    const off = -spread / 2 + i * gap;
    const c = { x: x + dir.x * off, y: y + dir.y * off };
    const tip = { x: c.x + dir.x * size, y: c.y + dir.y * size };
    const w1 = { x: c.x - dir.x * 1 + perp.x * size, y: c.y - dir.y * 1 + perp.y * size };
    const w2 = { x: c.x - dir.x * 1 - perp.x * size, y: c.y - dir.y * 1 - perp.y * size };
    marks.push(`${round(w1.x)},${round(w1.y)} ${round(tip.x)},${round(tip.y)} ${round(w2.x)},${round(w2.y)}`);
  }
  return marks;
}

export function round(v) {
  return Math.round(Number(v) * 100) / 100;
}

/**
 * PROTRACTOR MODEL (pure). A physical protractor has two scales:
 *   outer scale: 0° on the LEFT increasing anticlockwise to 180° on the right,
 *   inner scale: 0° on the RIGHT increasing clockwise to 180° on the left.
 * We store each arm as a BEARING in [0,180] measured from the positive x-axis
 * (east = 0° flat side on the right, west = 180° flat side on the left), i.e.
 * the physical direction the arm points. The reading a student takes on a given
 * scale is derived below. The measured angle is ALWAYS the absolute difference
 * of the two arm bearings — the whole point of the topic.
 */
export function innerReading(bearing) {
  // Inner scale: 0 at east (bearing 0), 180 at west (bearing 180).
  return Math.round(bearing);
}
export function outerReading(bearing) {
  // Outer scale: 0 at west (bearing 180), 180 at east (bearing 0).
  return Math.round(180 - bearing);
}
export function measuredAngle(bearingA, bearingB) {
  return Math.abs(Math.round(bearingA) - Math.round(bearingB));
}
