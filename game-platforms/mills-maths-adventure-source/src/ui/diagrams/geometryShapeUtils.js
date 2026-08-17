/**
 * geometryShapeUtils (Phase 3H — Properties of geometrical figures) — the PURE
 * marking & geometry library shared by the shape and proof renderers AND the
 * system checks (no React, no DOM). This is the heart of the topic's graphics:
 * one consistent set of convention markings and label placement so every
 * triangle and quadrilateral is drawn the same, correct way.
 *
 * Two coordinate spaces:
 *   • MATH space (y-up) — how shapes are authored in shapeCatalogue.js.
 *   • SCREEN space (y-down, SVG) — after `fitToBox` flips + scales into the view.
 * Marking helpers below all operate in SCREEN space (on already-fitted points).
 */

export function round(v) {
  return Math.round(Number(v) * 100) / 100;
}

export function centroid(pts) {
  const n = pts.length || 1;
  return { x: pts.reduce((s, p) => s + p.x, 0) / n, y: pts.reduce((s, p) => s + p.y, 0) / n };
}

export function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function unit(a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const L = Math.hypot(dx, dy) || 1;
  return { x: dx / L, y: dy / L };
}

export function dist(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

// Rotate MATH-space points anticlockwise by `deg` about their centroid — used to
// vary orientation so shapes are recognised by properties, not a fixed pose.
export function rotate(pts, deg, c = centroid(pts)) {
  const r = (deg * Math.PI) / 180, cos = Math.cos(r), sin = Math.sin(r);
  return pts.map((p) => ({
    x: c.x + (p.x - c.x) * cos - (p.y - c.y) * sin,
    y: c.y + (p.x - c.x) * sin + (p.y - c.y) * cos,
  }));
}

// Fit MATH-space points into a SCREEN box (uniform scale so squares stay square;
// y flipped so larger math-y sits higher). `box` = { x, y, w, h }.
export function fitToBox(pts, box) {
  const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const pw = maxX - minX || 1, ph = maxY - minY || 1;
  const s = Math.min(box.w / pw, box.h / ph);
  const ox = box.x + (box.w - pw * s) / 2;
  const oy = box.y + (box.h - ph * s) / 2;
  return pts.map((p) => ({ x: ox + (p.x - minX) * s, y: oy + (maxY - p.y) * s }));
}

// Equal-side tick marks: `count` short strokes across the midpoint of edge a→b,
// perpendicular to it. Returns [{x1,y1,x2,y2}].
export function edgeTicks(a, b, count = 1, len = 7, gap = 5) {
  if (!count) return [];
  const m = midpoint(a, b), u = unit(a, b), n = { x: -u.y, y: u.x };
  const out = [];
  const spread = (count - 1) * gap;
  for (let i = 0; i < count; i++) {
    const off = -spread / 2 + i * gap;
    const c = { x: m.x + u.x * off, y: m.y + u.y * off };
    out.push({ x1: c.x - n.x * len, y1: c.y - n.y * len, x2: c.x + n.x * len, y2: c.y + n.y * len });
  }
  return out;
}

// Parallel-side chevrons: `count` ">" marks at the midpoint of a→b, pointing
// along the edge. Returns polyline point-strings.
export function edgeChevrons(a, b, count = 1, size = 6, gap = 6) {
  if (!count) return [];
  const m = midpoint(a, b), u = unit(a, b), n = { x: -u.y, y: u.x };
  const out = [];
  const spread = (count - 1) * gap;
  for (let i = 0; i < count; i++) {
    const off = -spread / 2 + i * gap;
    const c = { x: m.x + u.x * off, y: m.y + u.y * off };
    const tip = { x: c.x + u.x * size, y: c.y + u.y * size };
    out.push(`${round(c.x - u.x + n.x * size)},${round(c.y - u.y + n.y * size)} ${round(tip.x)},${round(tip.y)} ${round(c.x - u.x - n.x * size)},${round(c.y - u.y - n.y * size)}`);
  }
  return out;
}

// The MINOR arc between edges v→pA and v→pB (the marked interior angle when it
// is < 180°). Returns { path, labelPos } with the label sitting on the bisector.
export function angleArc(v, pA, pB, r = 20, labelGap = 13) {
  const a1 = Math.atan2(pA.y - v.y, pA.x - v.x);
  const a2 = Math.atan2(pB.y - v.y, pB.x - v.x);
  let d = a2 - a1;
  while (d <= -Math.PI) d += 2 * Math.PI;
  while (d > Math.PI) d -= 2 * Math.PI;
  const s = { x: v.x + r * Math.cos(a1), y: v.y + r * Math.sin(a1) };
  const e = { x: v.x + r * Math.cos(a1 + d), y: v.y + r * Math.sin(a1 + d) };
  const sweep = d > 0 ? 1 : 0;
  const mid = a1 + d / 2;
  return {
    path: `M ${round(s.x)} ${round(s.y)} A ${r} ${r} 0 0 ${sweep} ${round(e.x)} ${round(e.y)}`,
    labelPos: { x: v.x + (r + labelGap) * Math.cos(mid), y: v.y + (r + labelGap) * Math.sin(mid) },
  };
}

// `count` concentric equal-angle arcs (single/double/triple).
export function angleArcs(v, pA, pB, count = 1, r0 = 18, gap = 5) {
  const arcs = [];
  for (let i = 0; i < count; i++) arcs.push(angleArc(v, pA, pB, r0 + i * gap).path);
  return arcs;
}

// A right-angle square at v, between edges v→pA and v→pB.
export function rightSquare(v, pA, pB, size = 12) {
  const uA = unit(v, pA), uB = unit(v, pB);
  const p1 = { x: v.x + uA.x * size, y: v.y + uA.y * size };
  const corner = { x: v.x + (uA.x + uB.x) * size, y: v.y + (uA.y + uB.y) * size };
  const p2 = { x: v.x + uB.x * size, y: v.y + uB.y * size };
  return `${round(p1.x)},${round(p1.y)} ${round(corner.x)},${round(corner.y)} ${round(p2.x)},${round(p2.y)}`;
}

// Intersection of segments p1p2 and p3p4 (as infinite lines); null if parallel.
export function lineIntersect(p1, p2, p3, p4) {
  const d = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
  if (Math.abs(d) < 1e-9) return null;
  const a = p1.x * p2.y - p1.y * p2.x, b = p3.x * p4.y - p3.y * p4.x;
  return { x: (a * (p3.x - p4.x) - (p1.x - p2.x) * b) / d, y: (a * (p3.y - p4.y) - (p1.y - p2.y) * b) / d };
}

// A label point placed OUTSIDE the shape: beyond vertex v, away from the centroid.
export function labelOutside(v, c, offset = 16) {
  const u = unit(c, v);
  return { x: v.x + u.x * offset, y: v.y + u.y * offset };
}

// A label point OUTSIDE an edge midpoint (away from the centroid).
export function edgeLabelOutside(a, b, c, offset = 16) {
  const m = midpoint(a, b);
  const u = unit(c, m);
  return { x: m.x + u.x * offset, y: m.y + u.y * offset };
}

// ---- MATH-space geometry (used by the catalogue + checks) -------------------

// Interior angle at vertex i of a polygon (degrees), math space.
export function interiorAngle(pts, i) {
  const n = pts.length;
  const prev = pts[(i - 1 + n) % n], cur = pts[i], next = pts[(i + 1) % n];
  const a1 = Math.atan2(prev.y - cur.y, prev.x - cur.x);
  const a2 = Math.atan2(next.y - cur.y, next.x - cur.x);
  let d = Math.abs(a1 - a2) * 180 / Math.PI;
  if (d > 180) d = 360 - d;
  return d;
}

// The cross-product sign at each vertex; a simple polygon is CONVEX iff all the
// signs agree. Used to build + verify convex/non-convex quads.
export function isConvex(pts) {
  const n = pts.length;
  let sign = 0;
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n], c = pts[(i + 2) % n];
    const cross = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
    if (Math.abs(cross) < 1e-9) continue;
    const s = Math.sign(cross);
    if (sign === 0) sign = s;
    else if (s !== sign) return false;
  }
  return true;
}

// Are edges a→b and c→d parallel (math space)?
export function segmentsParallel(a, b, c, d) {
  const cross = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x);
  return Math.abs(cross) < 1e-6;
}
