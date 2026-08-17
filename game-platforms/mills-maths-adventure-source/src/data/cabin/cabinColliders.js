/**
 * CABIN COLLIDERS (CB) — solid props for the Lodge Interior. Circles only
 * (cheap, jitter-free), the same shape as every other region. Derived from
 * cabinLayout so scenery + collision stay in sync.
 *
 * The outer LOG WALLS are sealed on all four sides EXCEPT the south
 * doorway gap (the way out — the return portal sits in it). The bedroom's
 * plank walls are sealed except their own doorway.
 */
import {
  CABIN_WALL,
  CABIN_DOOR_GAP,
  CABIN_FIRE,
  CABIN_LONG_TABLE,
  CABIN_ROUND_TABLES,
  CABIN_BOOKSHELVES,
  CABIN_BEDROOM,
  CABIN_BED,
  CABIN_WARDROBE,
  CABIN_BEDSIDE,
  CABIN_PIP,
} from "./cabinLayout.js";

const WALL_SPACING = 1.2;
const WALL_RADIUS = 0.9;

/** Circles along a straight wall run, skipping an optional gap on x. Pure. */
function wallRun(idPrefix, x1, z1, x2, z2, gap) {
  const cols = [];
  const len = Math.hypot(x2 - x1, z2 - z1);
  const steps = Math.max(1, Math.round(len / WALL_SPACING));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x1 + (x2 - x1) * t;
    const z = z1 + (z2 - z1) * t;
    if (gap && x > gap.xMin - 0.2 && x < gap.xMax + 0.2) continue;
    cols.push({ id: `${idPrefix}-${i}`, kind: "boundary", x, z, radius: WALL_RADIUS });
  }
  return cols;
}

function outerWalls() {
  const { halfW, halfD } = CABIN_WALL;
  return [
    ...wallRun("cabin-wall-n", -halfW, -halfD, halfW, -halfD),
    ...wallRun("cabin-wall-s", -halfW, halfD, halfW, halfD, CABIN_DOOR_GAP),
    ...wallRun("cabin-wall-w", -halfW, -halfD, -halfW, halfD),
    ...wallRun("cabin-wall-e", halfW, -halfD, halfW, halfD),
  ];
}

function bedroomWalls() {
  const { wallX, wallZ, doorXMin, doorXMax } = CABIN_BEDROOM;
  const { halfW, halfD } = CABIN_WALL;
  return [
    // Along z = wallZ from the x-wall to the east wall, with the doorway gap.
    ...wallRun("cabin-bed-wz", wallX, wallZ, halfW, wallZ, { xMin: doorXMin, xMax: doorXMax }),
    // Along x = wallX from the z-wall to the south wall.
    ...wallRun("cabin-bed-wx", wallX, wallZ, wallX, halfD),
  ];
}

/** Circles across the long table's footprint. */
function longTableColliders() {
  const t = CABIN_LONG_TABLE;
  const cols = [];
  for (let i = 0; i < 4; i++) {
    cols.push({
      id: `cabin-table-${i}`,
      kind: "boundary",
      x: t.x - t.w / 2 + (t.w / 3) * i,
      z: t.z,
      radius: 1.15,
    });
  }
  return cols;
}

const STATIC = [
  ...outerWalls(),
  ...bedroomWalls(),
  // The fireplace + chimney breast (against the north wall).
  { id: "cabin-fire", kind: "boundary", x: CABIN_FIRE.position[0], z: CABIN_FIRE.position[1], radius: 2.4 },
  ...longTableColliders(),
  ...CABIN_ROUND_TABLES.map((t, i) => ({ id: `cabin-round-${i}`, kind: "boundary", x: t.x, z: t.z, radius: t.r })),
  ...CABIN_BOOKSHELVES.map((p, i) => ({ id: `cabin-shelf-${i}`, kind: "boundary", x: p[0], z: p[1], radius: 0.9 })),
  { id: "cabin-bed", kind: "boundary", x: CABIN_BED.position[0], z: CABIN_BED.position[1], radius: 1.5 },
  { id: "cabin-wardrobe", kind: "boundary", x: CABIN_WARDROBE.position[0], z: CABIN_WARDROBE.position[1], radius: 0.9 },
  { id: "cabin-bedside", kind: "boundary", x: CABIN_BEDSIDE.position[0], z: CABIN_BEDSIDE.position[1], radius: 0.5 },
  { id: "cabin-pip", kind: "interactable", x: CABIN_PIP.position[0], z: CABIN_PIP.position[1], radius: 0.7 },
];

/** Lodge-interior colliders (static — no progress-gated barriers). */
export function getCabinColliders() {
  return STATIC;
}
