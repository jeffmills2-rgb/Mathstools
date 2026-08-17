import { randInt, pick } from "../../../helpers.js";
import {
  dist, interiorAngle, isConvex, segmentsParallel, lineIntersect, midpoint, rotate,
} from "../../../../ui/diagrams/geometryShapeUtils.js";

/**
 * shapeCatalogue (Phase 3H) — builds every triangle and quadrilateral the topic
 * needs FROM its defining properties, then verifies the result, so a shape can
 * never render as the wrong type (a general parallelogram is never a rectangle;
 * an isosceles triangle is never equilateral; a "non-convex" quad is genuinely
 * concave). Convention MARKINGS (equal-side ticks, parallel chevrons, equal-
 * angle arcs, right-angle squares, diagonal properties) are computed GENERICALLY
 * from the finished geometry, so the marks always match the actual shape.
 *
 * Coordinates are MATH space (y-up); the diagram component fits them to screen.
 */

const TOL = 0.04; // relative length / small-angle tolerance for "equal".

// ---- generic mark computation (rotation-invariant counts/flags) -------------

function computeMarks(points) {
  const n = points.length;
  const sides = points.map((p, i) => dist(p, points[(i + 1) % n]));
  const angles = points.map((_, i) => interiorAngle(points, i));
  const maxSide = Math.max(...sides);

  // Equal-side groups → tick counts (1,2,3 in order of appearance).
  const ticks = new Array(n).fill(0);
  const sideGroups = [];
  sides.forEach((L, i) => {
    const g = sideGroups.find((gr) => Math.abs(gr.len - L) <= TOL * maxSide);
    if (g) g.idx.push(i); else sideGroups.push({ len: L, idx: [i] });
  });
  let tickNo = 0;
  sideGroups.filter((g) => g.idx.length >= 2).forEach((g) => { tickNo++; g.idx.forEach((i) => { ticks[i] = tickNo; }); });

  // Equal-angle groups → arc counts; right angles (≈90°) get a square instead.
  const right = angles.map((a) => Math.abs(a - 90) <= 1.2);
  const arcs = new Array(n).fill(0);
  const angGroups = [];
  angles.forEach((A, i) => {
    if (right[i]) return;
    const g = angGroups.find((gr) => Math.abs(gr.a - A) <= 1.5);
    if (g) g.idx.push(i); else angGroups.push({ a: A, idx: [i] });
  });
  let arcNo = 0;
  angGroups.filter((g) => g.idx.length >= 2).forEach((g) => { arcNo++; g.idx.forEach((i) => { arcs[i] = arcNo; }); });

  // Parallel edge classes → chevron counts.
  const chevrons = new Array(n).fill(0);
  const parClasses = [];
  for (let i = 0; i < n; i++) {
    const a = points[i], b = points[(i + 1) % n];
    const cls = parClasses.find((c) => segmentsParallel(points[c.idx[0]], points[(c.idx[0] + 1) % n], a, b));
    if (cls) cls.idx.push(i); else parClasses.push({ idx: [i] });
  }
  let chNo = 0;
  parClasses.filter((c) => c.idx.length >= 2).forEach((c) => { chNo++; c.idx.forEach((i) => { chevrons[i] = chNo; }); });

  return { sides, angles, ticks, arcs, right, chevrons };
}

function computeDiagonals(points) {
  if (points.length !== 4) return null;
  const [A, B, C, D] = points;
  const d1 = dist(A, C), d2 = dist(B, D);
  const equal = Math.abs(d1 - d2) <= TOL * Math.max(d1, d2);
  // Perpendicular?
  const u1 = { x: C.x - A.x, y: C.y - A.y }, u2 = { x: D.x - B.x, y: D.y - B.y };
  const perpendicular = Math.abs(u1.x * u2.x + u1.y * u2.y) <= TOL * (Math.hypot(u1.x, u1.y) * Math.hypot(u2.x, u2.y));
  // Bisect each other? intersection ≈ both midpoints.
  const X = lineIntersect(A, C, B, D);
  const mAC = midpoint(A, C), mBD = midpoint(B, D);
  const bisect = X && dist(X, mAC) <= TOL * d1 && dist(X, mBD) <= TOL * d2;
  return { equal, perpendicular, bisect };
}

// A shape object bundles points + its computed marks + metadata.
function finish(kind, type, points, extra = {}) {
  const marks = computeMarks(points);
  return { kind, type, points, ...marks, diagonals: computeDiagonals(points), ...extra };
}

// Apply a random orientation (rotation + optional horizontal flip) so shapes are
// recognised by properties, not a fixed pose. Marks are rotation-invariant.
function orient(points, { spin = true, flip = true } = {}) {
  let pts = points.map((p) => ({ ...p }));
  if (flip && Math.random() < 0.5) pts = pts.map((p) => ({ x: -p.x, y: p.y }));
  if (spin) pts = rotate(pts, randInt(0, 359));
  return pts;
}

// ---- triangles --------------------------------------------------------------

// Build a triangle from its base angles A (at P0) and B (at P1); apex P2.
function triFromAngles(A, B) {
  const ra = (A * Math.PI) / 180, rb = (B * Math.PI) / 180;
  const P0 = { x: 0, y: 0 }, P1 = { x: 1, y: 0 };
  const dirA = { x: Math.cos(ra), y: Math.sin(ra) };
  const dirB = { x: -Math.cos(rb), y: Math.sin(rb) };
  const P2 = lineIntersect(P0, { x: P0.x + dirA.x, y: P0.y + dirA.y }, P1, { x: P1.x + dirB.x, y: P1.y + dirB.y });
  return [P0, P1, P2];
}

// Place the three chosen angles at randomly-ordered vertices for pose variety.
function triangleWithAngles(angleList) {
  const [g0, g1] = pick([[0, 1], [1, 2], [2, 0]]).map((i) => angleList[i]);
  return orient(triFromAngles(g0, g1));
}

function chooseTriangleAngles(sideClass, angleClass) {
  if (sideClass === "equilateral") return [60, 60, 60];
  if (sideClass === "isosceles") {
    if (angleClass === "right") return [45, 45, 90];
    if (angleClass === "obtuse") { const apex = randInt(100, 140); return [(180 - apex) / 2, (180 - apex) / 2, apex]; }
    const base = randInt(50, 74); const apex = 180 - 2 * base; return Math.abs(apex - 60) < 6 ? null : [base, base, apex];
  }
  // scalene: three pairwise-distinct angles (so all three sides differ).
  if (angleClass === "right") { const a = pick([28, 32, 35, 38, 52, 55, 58, 62]); return [90, a, 90 - a]; }
  if (angleClass === "obtuse") { const o = randInt(96, 130); const a = randInt(30, Math.min(58, 176 - o)); const b = 180 - o - a; return b < 24 || Math.abs(a - b) < 10 ? null : [o, a, b]; }
  const a = randInt(45, 68), b = randInt(50, 80), c = 180 - a - b;
  return c < 46 || c > 86 || Math.abs(a - b) < 10 || Math.abs(b - c) < 10 || Math.abs(a - c) < 10 ? null : [a, b, c];
}

// Does the built triangle's ACTUAL marks match the requested classes? (guard)
function triangleMatches(shape, sideClass, angleClass) {
  const tickCount = shape.ticks.filter((t) => t > 0).length;
  const gotSide = tickCount === 3 ? "equilateral" : tickCount === 2 ? "isosceles" : "scalene";
  const maxA = Math.max(...shape.angles);
  const gotAngle = shape.right.some(Boolean) ? "right" : maxA > 91 ? "obtuse" : "acute";
  return gotSide === sideClass && gotAngle === angleClass;
}

export function makeTriangle(sideClass, angleClass) {
  for (let attempt = 0; attempt < 60; attempt++) {
    const angles = chooseTriangleAngles(sideClass, angleClass);
    if (!angles) continue;
    const points = triangleWithAngles(angles);
    const shape = finish("triangle", `${sideClass}-${angleClass}`, points, {
      sideClass, angleClass, name: `${angleClass}-angled ${sideClass}`,
    });
    if (triangleMatches(shape, sideClass, angleClass)) return shape;
  }
  // Fallback to a canonical, guaranteed-correct instance.
  const fallback = { "equilateral-acute": [60, 60, 60], "isosceles-acute": [55, 55, 70], "isosceles-right": [45, 45, 90], "isosceles-obtuse": [30, 30, 120], "scalene-acute": [50, 62, 68], "scalene-right": [90, 35, 55], "scalene-obtuse": [110, 28, 42] };
  const points = triangleWithAngles(fallback[`${sideClass}-${angleClass}`] || [50, 62, 68]);
  return finish("triangle", `${sideClass}-${angleClass}`, points, { sideClass, angleClass, name: `${angleClass}-angled ${sideClass}` });
}

// A triangle with EXPLICIT interior angles (for unknown-angle problems). The
// vertices carry those angles (in some rotated order); read shape.angles back.
export function customTriangle(angleList) {
  const points = triangleWithAngles(angleList);
  return finish("triangle", "custom", points, {});
}

// ---- quadrilaterals ---------------------------------------------------------

// Property truth-table + name inclusions (the classification hierarchy).
export const QUAD_PROPERTIES = [
  "All sides are equal",
  "Opposite sides are equal",
  "Opposite sides are parallel",
  "All angles are 90°",
  "Opposite angles are equal",
  "Diagonals are equal",
  "Diagonals are perpendicular",
  "Diagonals bisect each other",
  "Exactly one pair of parallel sides",
];

const PROP_TABLE = {
  square:        [1, 1, 1, 1, 1, 1, 1, 1, 0],
  rectangle:     [0, 1, 1, 1, 1, 1, 0, 1, 0],
  rhombus:       [1, 1, 1, 0, 1, 0, 1, 1, 0],
  parallelogram: [0, 1, 1, 0, 1, 0, 0, 1, 0],
  trapezium:     [0, 0, 0, 0, 0, 0, 0, 0, 1],
  kite:          [0, 0, 0, 0, 0, 0, 1, 0, 0],
};

export const QUAD_NAMES = {
  square: ["square", "rectangle", "rhombus", "parallelogram", "quadrilateral"],
  rectangle: ["rectangle", "parallelogram", "quadrilateral"],
  rhombus: ["rhombus", "parallelogram", "quadrilateral"],
  parallelogram: ["parallelogram", "quadrilateral"],
  trapezium: ["trapezium", "quadrilateral"],
  kite: ["kite", "quadrilateral"],
};

export function propertiesOf(type) {
  const row = PROP_TABLE[type] || [];
  const out = {};
  QUAD_PROPERTIES.forEach((p, i) => { out[p] = Boolean(row[i]); });
  return out;
}

function quadPoints(type) {
  if (type === "square") { const s = 1; return [{ x: 0, y: 0 }, { x: s, y: 0 }, { x: s, y: s }, { x: 0, y: s }]; }
  if (type === "rectangle") { const w = randInt(14, 22) / 10, h = 1; return [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h }]; }
  if (type === "rhombus") { const s = 1, th = (pick([50, 55, 62, 68, 112, 118, 125, 130]) * Math.PI) / 180; return [{ x: 0, y: 0 }, { x: s, y: 0 }, { x: s + s * Math.cos(th), y: s * Math.sin(th) }, { x: s * Math.cos(th), y: s * Math.sin(th) }]; }
  if (type === "parallelogram") { const a = randInt(16, 22) / 10, b = 1, th = (pick([58, 64, 70, 116, 122]) * Math.PI) / 180; return [{ x: 0, y: 0 }, { x: a, y: 0 }, { x: a + b * Math.cos(th), y: b * Math.sin(th) }, { x: b * Math.cos(th), y: b * Math.sin(th) }]; }
  if (type === "trapezium") { const bottom = randInt(20, 26) / 10, top = randInt(9, 15) / 10, h = randInt(9, 12) / 10, iso = Math.random() < 0.5; const offL = iso ? (bottom - top) / 2 : randInt(2, 6) / 10; return [{ x: 0, y: 0 }, { x: bottom, y: 0 }, { x: offL + top, y: h }, { x: offL, y: h }]; }
  // kite: symmetric about the y-axis; two distinct adjacent-equal pairs.
  const w = randInt(9, 13) / 10, m = randInt(7, 10) / 10, h = randInt(19, 24) / 10;
  return [{ x: 0, y: 0 }, { x: w, y: m }, { x: 0, y: h }, { x: -w, y: m }];
}

export function makeQuad(type) {
  for (let attempt = 0; attempt < 40; attempt++) {
    const points = orient(quadPoints(type), { flip: type !== "kite" });
    const shape = finish("quad", type, points, { properties: propertiesOf(type), names: QUAD_NAMES[type], convex: isConvex(points) });
    if (verifyQuad(shape)) return shape;
  }
  // Fallback: return an un-rotated canonical instance (still correct by construction).
  const points = quadPoints(type);
  return finish("quad", type, points, { properties: propertiesOf(type), names: QUAD_NAMES[type], convex: isConvex(points) });
}

// A generic convex (no special properties) or non-convex (concave / dart) quad.
export function makeGenericQuad(concave) {
  if (concave) {
    // A dart: the 4th vertex sits INSIDE the triangle of the other three, giving
    // one reflex (interior > 180°) angle — a genuine non-convex quadrilateral.
    const base = [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 2 }, { x: 1, y: 0.6 }];
    for (let attempt = 0; attempt < 40; attempt++) {
      const pts = orient(base, { flip: true });
      if (!isConvex(pts)) return finish("quad", "concave", pts, { convex: false, generic: true });
    }
    return finish("quad", "concave", base, { convex: false, generic: true });
  }
  for (let attempt = 0; attempt < 60; attempt++) {
    const A = { x: 0, y: 0 }, B = { x: randInt(18, 24) / 10, y: randInt(1, 4) / 10 }, C = { x: randInt(16, 22) / 10, y: randInt(15, 20) / 10 }, D = { x: randInt(1, 5) / 10, y: randInt(13, 18) / 10 };
    const pts = orient([A, B, C, D], { flip: true });
    const m = computeMarks(pts);
    // Convex and NOT accidentally special (no right angles, no equal sides, no parallel pairs).
    if (isConvex(pts) && !m.right.some(Boolean) && !m.ticks.some(Boolean) && !m.chevrons.some(Boolean)) {
      return finish("quad", "convex", pts, { convex: true, generic: true });
    }
  }
  return finish("quad", "convex", [{ x: 0, y: 0 }, { x: 2.2, y: 0.3 }, { x: 1.8, y: 1.7 }, { x: 0.3, y: 1.5 }], { convex: true, generic: true });
}

// Verify a special quad really has its defining properties (used as a build
// guard AND exported for the system checks).
export function verifyQuad(shape) {
  const t = shape.type, P = shape.properties, D = shape.diagonals, m = { ticks: shape.ticks, angles: shape.angles, chevrons: shape.chevrons };
  const allRight = shape.right.every(Boolean);
  const parallelPairs = Math.max(...shape.chevrons, 0);
  const allSidesEqual = shape.ticks.every((x) => x === 1) && Math.max(...shape.ticks) === 1;
  if (t === "square") return allRight && allSidesEqual && D.equal && D.perpendicular && D.bisect;
  if (t === "rectangle") return allRight && !allSidesEqual && D.equal && !D.perpendicular && D.bisect;
  if (t === "rhombus") return !allRight && allSidesEqual && D.perpendicular && D.bisect && !D.equal;
  if (t === "parallelogram") return !allRight && !allSidesEqual && parallelPairs >= 2 && D.bisect && !D.equal && !D.perpendicular;
  if (t === "trapezium") return parallelPairs === 1 && !allRight;
  if (t === "kite") return D.perpendicular && !allSidesEqual && !shape.convex === false; // kite is convex here
  return true;
}

// ---- diagram spec builder ---------------------------------------------------

/**
 * Turn a shape into a GeometryShapeDiagram spec. `opts` chooses which convention
 * markings to show plus any vertex/side/angle labels.
 *   { ticks, chevrons, arcs, right, diagonals,   // booleans: show that mark set
 *     labels: true|["A",..], angleLabels: {i:txt}, sideLabels: {i:txt},
 *     caption }
 */
export function buildSpec(shape, opts = {}) {
  const n = shape.points.length;
  const show = (flag, def = true) => (flag === undefined ? def : flag);
  const labels = opts.labels === true ? "ABCDEFG".slice(0, n).split("") : (Array.isArray(opts.labels) ? opts.labels : null);
  const edges = shape.points.map((_, i) => ({
    ticks: show(opts.ticks) ? shape.ticks[i] : 0,
    chevrons: show(opts.chevrons, false) ? shape.chevrons[i] : 0,
    label: opts.sideLabels ? opts.sideLabels[i] : undefined,
  }));
  const angles = shape.points.map((_, i) => ({
    at: i,
    arcs: show(opts.arcs, false) ? shape.arcs[i] : 0,
    right: show(opts.right) ? shape.right[i] : false,
    label: opts.angleLabels ? opts.angleLabels[i] : undefined,
  }));
  const spec = {
    points: shape.points,
    edges,
    angles,
    vertexLabels: labels,
    caption: opts.caption,
  };
  if (show(opts.diagonals, false) && n === 4) {
    spec.diagonals = [{ from: 0, to: 2 }, { from: 1, to: 3 }];
    spec.diagonalMarks = {
      equal: shape.diagonals.equal,
      perpendicular: shape.diagonals.perpendicular,
      bisected: shape.diagonals.bisect,
    };
  }
  return spec;
}

export const TRIANGLE_TYPES = [
  ["equilateral", "acute"], ["isosceles", "acute"], ["isosceles", "right"], ["isosceles", "obtuse"],
  ["scalene", "acute"], ["scalene", "right"], ["scalene", "obtuse"],
];
export const SPECIAL_QUADS = ["square", "rectangle", "rhombus", "parallelogram", "trapezium", "kite"];
