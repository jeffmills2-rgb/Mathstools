/**
 * SNOW COLLIDERS (S1) — solid props for Snowball Sums. Circles only (cheap,
 * jitter-free), the same shape as worldColliders / the Schoolyard / the Farm.
 * Derived from snowLayout so scenery + collision stay in sync.
 *
 * The RINK BANK circles are tagged `jumpable: true` — a walking player is
 * kept off the ice except through the southern entrance gap, but Space vaults
 * the low bank (Player.jsx drops jumpable colliders while airborne). The
 * property BOUNDARY bank is solid and NON-jumpable (you can't hop out).
 */
import {
  SNOW_LODGE,
  SNOW_IGLOOS,
  SNOWMEN,
  XMAS_TREES,
  SNOW_LAMPS,
  CANDY_CANES,
  ICE_CAVE_MOUND,
  ICE_CRYSTALS,
  SLED_PROP,
  SLED_FLAGS,
  ICE_RINK,
  RINK_GATE_HALF_ANGLE,
  SNOW_BOUNDARY,
  SNOW_WELCOME_SIGN,
  SNOW_RECORDS_STAND,
  RANGE_FRAME_POS,
  RANGE_CRATE_POS,
  RANGE_SIGN,
  RINK_GLIDE_SIGN,
  GROVE_TREE_POS,
  GROVE_BOX_POS,
  GROVE_SIGN,
  MEADOW_TOWER_LEFT,
  MEADOW_TOWER_RIGHT,
  MEADOW_SIGN,
  SLOPE_SIGN,
  VILLAGE_LEFT_STAND,
  VILLAGE_RIGHT_STAND,
  VILLAGE_BUILD_SITE,
  VILLAGE_SIGN,
  COLONY_SIGN,
  CAVE_SIGN,
  YARD_STALL,
  YARD_BOARD,
  YARD_SIGN,
  LOOKOUT_DECK,
  LOOKOUT_SIGN,
} from "./snowLayout.js";

/**
 * Circles along one straight run of the property BOUNDARY bank — solid and
 * NON-jumpable (you cannot slide out of the snow world). Pure.
 */
const BORDER_COLLIDER_SPACING = 2.2;
const BORDER_COLLIDER_RADIUS = 1.1;
function borderRunColliders(idPrefix, x1, z1, x2, z2) {
  const cols = [];
  const len = Math.hypot(x2 - x1, z2 - z1);
  const steps = Math.max(1, Math.round(len / BORDER_COLLIDER_SPACING));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    cols.push({
      id: `${idPrefix}-${i}`,
      kind: "boundary",
      x: x1 + (x2 - x1) * t,
      z: z1 + (z2 - z1) * t,
      radius: BORDER_COLLIDER_RADIUS,
    });
  }
  return cols;
}

/** The four solid, NON-jumpable runs of the property boundary bank. */
function boundaryColliders() {
  const { halfW, halfD } = SNOW_BOUNDARY;
  return [
    ...borderRunColliders("snow-border-n", -halfW, -halfD, halfW, -halfD),
    ...borderRunColliders("snow-border-s", -halfW, halfD, halfW, halfD),
    ...borderRunColliders("snow-border-w", -halfW, -halfD, -halfW, halfD),
    ...borderRunColliders("snow-border-e", halfW, -halfD, halfW, halfD),
  ];
}

/**
 * The rink's low snow-bank ring — circles around the ellipse perimeter,
 * skipping the southern entrance gap. JUMPABLE (hop the bank for fun); the
 * gap is the walking way in. Pure.
 */
export function rinkBankColliders() {
  const cols = [];
  const STEPS = 40;
  for (let i = 0; i < STEPS; i++) {
    const theta = (i / STEPS) * Math.PI * 2;
    // Southern entrance gap: ellipse parameter θ = +π/2 points at +z (south).
    let d = Math.abs(theta - Math.PI / 2);
    if (d > Math.PI) d = Math.PI * 2 - d;
    if (d < RINK_GATE_HALF_ANGLE) continue;
    cols.push({
      id: `snow-rink-bank-${i}`,
      kind: "boundary",
      x: ICE_RINK.center[0] + ICE_RINK.rx * Math.cos(theta),
      z: ICE_RINK.center[1] + ICE_RINK.rz * Math.sin(theta),
      radius: 0.7,
      jumpable: true,
    });
  }
  return cols;
}

// Lodge: a grid of circles across the footprint (the interior is out of
// bounds for now, matching the closed low-poly lodge).
function lodgeColliders() {
  const cols = [];
  const hw = SNOW_LODGE.w / 2;
  const hd = SNOW_LODGE.d / 2;
  for (let x = -hw + 1; x <= hw - 1; x += 2.4) {
    for (let z = -hd + 1; z <= hd - 1; z += 2.4) {
      cols.push({ id: `snow-lodge-${cols.length}`, kind: "boundary", x: SNOW_LODGE.x + x, z: SNOW_LODGE.z + z, radius: 1.6 });
    }
  }
  return cols;
}

const STATIC = [
  // The property BOUNDARY bank — solid + NON-jumpable (can't slide out).
  ...boundaryColliders(),
  // The rink's snow bank — jumpable, with the southern entrance gap open.
  ...rinkBankColliders(),
  ...lodgeColliders(),
  ...SNOW_IGLOOS.map((g, i) => ({ id: `snow-igloo-${i}`, kind: "boundary", x: g[0], z: g[1], radius: 2.0 })),
  ...SNOWMEN.map((p, i) => ({ id: `snow-snowman-${i}`, kind: "boundary", x: p[0], z: p[1], radius: 0.5 })),
  ...XMAS_TREES.map((p, i) => ({ id: `snow-xtree-${i}`, kind: "tree", x: p[0], z: p[1], radius: 0.7 })),
  ...SNOW_LAMPS.map((p, i) => ({ id: `snow-lamp-${i}`, kind: "boundary", x: p[0], z: p[1], radius: 0.3 })),
  ...CANDY_CANES.map((p, i) => ({ id: `snow-cane-${i}`, kind: "boundary", x: p[0], z: p[1], radius: 0.25 })),
  { id: "snow-cave-mound", kind: "boundary", x: ICE_CAVE_MOUND.position[0], z: ICE_CAVE_MOUND.position[1], radius: ICE_CAVE_MOUND.radius },
  ...ICE_CRYSTALS.map((p, i) => ({ id: `snow-crystal-${i}`, kind: "boundary", x: p[0], z: p[1], radius: 0.7 })),
  { id: "snow-sled", kind: "boundary", x: SLED_PROP.position[0], z: SLED_PROP.position[1], radius: 1.0 },
  ...SLED_FLAGS.map((p, i) => ({ id: `snow-flag-${i}`, kind: "boundary", x: p[0], z: p[1], radius: 0.3 })),
  { id: "snow-welcome-sign", kind: "boundary", x: SNOW_WELCOME_SIGN.position[0], z: SNOW_WELCOME_SIGN.position[1], radius: 0.6 },
  { id: "snow-records", kind: "interactable", x: SNOW_RECORDS_STAND.position[0], z: SNOW_RECORDS_STAND.position[1], radius: 3.6 },
  // Snowball Range (SR): the ten-frame crate stand + the idle crate stack +
  // Pip's hosting spot (also an interactable, like the welcome sign).
  { id: "snow-range-frame", kind: "boundary", x: RANGE_FRAME_POS[0], z: RANGE_FRAME_POS[1], radius: 0.9 },
  { id: "snow-range-crates", kind: "boundary", x: RANGE_CRATE_POS[0], z: RANGE_CRATE_POS[1], radius: 0.8 },
  { id: "snow-range-sign", kind: "boundary", x: RANGE_SIGN.position[0], z: RANGE_SIGN.position[1], radius: 0.6 },
  // Ice Rink glide (RG): Fern's hosting spot outside the southern rink gate.
  { id: "snow-rink-sign", kind: "boundary", x: RINK_GLIDE_SIGN.position[0], z: RINK_GLIDE_SIGN.position[1], radius: 0.6 },
  // Christmas Tree Grove (GV): the big light-up tree, the bundle box and
  // Alby's hosting spot.
  { id: "snow-grove-tree", kind: "tree", x: GROVE_TREE_POS[0], z: GROVE_TREE_POS[1], radius: 1.0 },
  { id: "snow-grove-box", kind: "boundary", x: GROVE_BOX_POS[0], z: GROVE_BOX_POS[1], radius: 0.8 },
  { id: "snow-pines-sign", kind: "boundary", x: GROVE_SIGN.position[0], z: GROVE_SIGN.position[1], radius: 0.6 },
  // Snowman Meadow (ML): the two snowman towers + Frosty's hosting spot.
  { id: "snow-meadow-left", kind: "boundary", x: MEADOW_TOWER_LEFT[0], z: MEADOW_TOWER_LEFT[1], radius: 0.8 },
  { id: "snow-meadow-right", kind: "boundary", x: MEADOW_TOWER_RIGHT[0], z: MEADOW_TOWER_RIGHT[1], radius: 0.8 },
  { id: "snow-snowmen-sign", kind: "boundary", x: MEADOW_SIGN.position[0], z: MEADOW_SIGN.position[1], radius: 0.6 },
  // Sledding Slope (SL): Flake's hosting spot on the hill's shoulder.
  { id: "snow-sled-sign", kind: "boundary", x: SLOPE_SIGN.position[0], z: SLOPE_SIGN.position[1], radius: 0.6 },
  // Igloo Village (VG): the two block stands, the build site + the host.
  { id: "snow-village-left", kind: "boundary", x: VILLAGE_LEFT_STAND[0], z: VILLAGE_LEFT_STAND[1], radius: 1.0 },
  { id: "snow-village-right", kind: "boundary", x: VILLAGE_RIGHT_STAND[0], z: VILLAGE_RIGHT_STAND[1], radius: 1.0 },
  { id: "snow-village-site", kind: "boundary", x: VILLAGE_BUILD_SITE[0], z: VILLAGE_BUILD_SITE[1], radius: 1.2 },
  { id: "snow-village-sign", kind: "boundary", x: VILLAGE_SIGN.position[0], z: VILLAGE_SIGN.position[1], radius: 0.6 },
  // Penguin Colony (PC): the host (the pairing penguins are walk-through).
  { id: "snow-colony-sign", kind: "boundary", x: COLONY_SIGN.position[0], z: COLONY_SIGN.position[1], radius: 0.6 },
  // The Ice Cave (IC): the host (the wall + dome are dressing at the back).
  { id: "snow-cave-sign", kind: "boundary", x: CAVE_SIGN.position[0], z: CAVE_SIGN.position[1], radius: 0.6 },
  // The Lodge Yard (LY): the cocoa stall, the bead board + the host.
  { id: "snow-yard-stall", kind: "boundary", x: YARD_STALL[0], z: YARD_STALL[1], radius: 1.0 },
  { id: "snow-yard-board", kind: "boundary", x: YARD_BOARD[0], z: YARD_BOARD[1], radius: 0.9 },
  { id: "snow-yard-sign", kind: "boundary", x: YARD_SIGN.position[0], z: YARD_SIGN.position[1], radius: 0.6 },
  // Aurora Lookout (AL): the viewing deck + the host.
  { id: "snow-lookout-deck", kind: "boundary", x: LOOKOUT_DECK[0], z: LOOKOUT_DECK[1], radius: 1.6 },
  { id: "snow-lights-sign", kind: "boundary", x: LOOKOUT_SIGN.position[0], z: LOOKOUT_SIGN.position[1], radius: 0.6 },
];

/** Snow-world colliders (static for now — no progress-gated barriers). */
export function getSnowColliders() {
  return STATIC;
}
