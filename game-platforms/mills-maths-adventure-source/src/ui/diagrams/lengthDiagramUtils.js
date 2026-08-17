/**
 * Shared helpers for the LENGTH diagram family (Phase 3B).
 *
 * Rebuilt from the CHHS Exam-Builder length engine with the hardcoded pixel
 * coordinates replaced by small pure helpers: shapes are described in ABSTRACT
 * units, auto-fitted into the viewBox, and labels/marks are PLACED FROM THE
 * GEOMETRY (edge normals point away from the centroid) instead of per-shape
 * dx/dy guesswork. Pure maths only — no React — so the checks can import it.
 */

// Fit abstract points into a box (left/top/width/height) preserving aspect.
export function fitPoints(points, box) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const w = maxX - minX || 1;
  const h = maxY - minY || 1;
  const s = Math.min(box.width / w, box.height / h);
  const ox = box.left + (box.width - w * s) / 2;
  const oy = box.top + (box.height - h * s) / 2;
  // SVG y grows downward; abstract shapes use y-up, so flip.
  return points.map((p) => ({ x: ox + (p.x - minX) * s, y: oy + (maxY - p.y) * s }));
}

export function centroid(points) {
  const n = points.length || 1;
  return {
    x: points.reduce((a, p) => a + p.x, 0) / n,
    y: points.reduce((a, p) => a + p.y, 0) / n,
  };
}

export function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

// A point offset from the midpoint of edge a→b, on the side AWAY from `inside`
// (the shape centroid) — i.e. where an outside label should sit.
export function outwardLabelPos(a, b, inside, offset = 18) {
  const m = midpoint(a, b);
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  let nx = -dy / len, ny = dx / len; // a normal
  // Flip it if it points toward the inside point.
  if ((m.x + nx - inside.x) ** 2 + (m.y + ny - inside.y) ** 2 <
      (m.x - nx - inside.x) ** 2 + (m.y - ny - inside.y) ** 2) {
    nx = -nx; ny = -ny;
  }
  return { x: m.x + nx * offset, y: m.y + ny * offset };
}

/**
 * Collision-aware label placement for a polygon's edge labels (teacher fix:
 * labels on the two short edges of a notch used to land on top of each other).
 *
 * Each label starts at its edge midpoint, pushed OUTWARD along the edge normal
 * (short edges get a bigger base offset so neighbouring notch labels separate).
 * Then a repulsion pass nudges any pair closer than `minGap` further out along
 * their OWN normals until every pair is clear.
 *
 * `pts` are SCREEN points; `edges` is an array of edge indices to label.
 * Returns [{ x, y }] aligned with `edges`. Pure — usable by the checks.
 */
export function resolveLabelPositions(pts, edges, { offset = 19, minGap = 26, iterations = 8 } = {}) {
  const inside = centroid(pts);
  const n = pts.length;

  const items = edges.map((ei) => {
    const a = pts[ei];
    const b = pts[(ei + 1) % n];
    const m = midpoint(a, b);
    const dx = b.x - a.x, dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    let nx = -dy / len, ny = dx / len;
    if ((m.x + nx - inside.x) ** 2 + (m.y + ny - inside.y) ** 2 <
        (m.x - nx - inside.x) ** 2 + (m.y - ny - inside.y) ** 2) {
      nx = -nx; ny = -ny;
    }
    // Short edges push their label further out so notch labels split apart.
    const base = offset + Math.max(0, (44 - len) / 2);
    return { nx, ny, pos: { x: m.x + nx * base, y: m.y + ny * base } };
  });

  for (let it = 0; it < iterations; it++) {
    let moved = false;
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i].pos, b = items[j].pos;
        if (Math.hypot(a.x - b.x, a.y - b.y) < minGap) {
          a.x += items[i].nx * 7; a.y += items[i].ny * 7;
          b.x += items[j].nx * 7; b.y += items[j].ny * 7;
          moved = true;
        }
      }
    }
    if (!moved) break;
  }
  return items.map((it) => it.pos);
}

// Polar point (angleDeg measured clockwise from 12 o'clock, like a clock face).
export function polar(cx, cy, r, angleDeg) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

// SVG arc path between two clock angles (sweep clockwise).
export function arcPath(cx, cy, r, startDeg, endDeg) {
  const s = polar(cx, cy, r, startDeg);
  const e = polar(cx, cy, r, endDeg);
  const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

export function pathFromPoints(points, close = true) {
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + (close ? " Z" : "");
}

/**
 * ABSTRACT SHAPES (unit coordinates, y-up) + which edges carry equal-ticks /
 * parallel-chevrons / right-angle corners. Edge i runs points[i]→points[i+1].
 * Proportions are chosen for CLARITY (they are NOT to scale with the numbers,
 * which is normal for perimeter questions).
 */
export const POLYGON_SPECS = {
  square: {
    points: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }],
    tickGroups: [[0, 1, 2, 3]],
    rightAngles: [0],
  },
  rectangle: {
    points: [{ x: 0, y: 0 }, { x: 16, y: 0 }, { x: 16, y: 9 }, { x: 0, y: 9 }],
    tickGroups: [[0, 2], [1, 3]],
    rightAngles: [0],
  },
  parallelogram: {
    points: [{ x: 0, y: 0 }, { x: 14, y: 0 }, { x: 18, y: 8 }, { x: 4, y: 8 }],
    tickGroups: [[0, 2], [1, 3]],
    parallelGroups: [[0, 2], [1, 3]],
  },
  rhombus: {
    points: [{ x: 6, y: 0 }, { x: 12, y: 5 }, { x: 6, y: 10 }, { x: 0, y: 5 }],
    tickGroups: [[0, 1, 2, 3]],
    parallelGroups: [[0, 2], [1, 3]],
  },
  kite: {
    points: [{ x: 5, y: 0 }, { x: 10, y: 6 }, { x: 5, y: 14 }, { x: 0, y: 6 }],
    tickGroups: [[0, 3], [1, 2]],
  },
  trapezium: {
    points: [{ x: 0, y: 0 }, { x: 18, y: 0 }, { x: 13, y: 8 }, { x: 4, y: 8 }],
    parallelGroups: [[0, 2]],
  },
  triangle: {
    points: [{ x: 0, y: 0 }, { x: 14, y: 0 }, { x: 9, y: 9 }],
  },
};

// The circle-feature catalogue (naming questions draw from this list).
export const CIRCLE_FEATURES = ["radius", "diameter", "chord", "arc", "sector", "segment", "tangent"];
