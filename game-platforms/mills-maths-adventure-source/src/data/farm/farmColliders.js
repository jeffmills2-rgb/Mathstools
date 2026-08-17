/**
 * FARM COLLIDERS (F1) — solid props for the Parts of a Whole Farm. Circles
 * only (cheap, jitter-free), same shape as worldColliders / the Schoolyard.
 * Derived from farmLayout so scenery + collision stay in sync.
 *
 * JUMPABLE fences: every paddock / pen / challenge-fence run circle is tagged
 * `jumpable: true`. The player can vault them with Space (Player.jsx drops
 * jumpable colliders while airborne), but they block a walking player — so the
 * challenge fence is now solid on the ground (was deliberately open before) yet
 * still clearable by jumping. The property BOUNDARY fence is NON-jumpable.
 * Still not solid: the paddock gate gaps.
 */
import {
  FARM_PADDOCKS,
  FARM_BARN,
  FARM_SILO,
  FARM_WINDMILL,
  FARM_POND,
  FARM_TREES,
  FARM_HAY_BALES,
  FARM_SCARECROW,
  FARM_WELCOME_SIGN,
  CHALLENGE_SIGN,
  CHALLENGE_FENCE,
  BOUNDARY_FENCE,
  ROUNDUP_PEN,
  ROUNDUP_SIGN,
  ORDER_GARDEN,
  ORDER_SIGN,
  CRATE_SIGN,
  FARM_RECORDS_STAND,
  AUTUMN_TREES,
  BIG_AMBER,
  MILK_AREA,
  MILK_CHUTE_STOPS,
  MILK_CHUTE_REPEATS,
  MILK_TRUCK,
  MILK_SIGN,
  WEIGH_AREA,
  WEIGH_SIGN,
  TRADE_AREA,
  TRADE_STALL_OFFSETS,
  TRADE_TABLE_OFFSET,
  TRADE_SIGN,
  VEGGIE_AREA,
  VEGGIE_SIGN,
  PLANK_AREA,
  PLANK_SIGN,
  SHOP_AREA,
  SHOP_SIGN,
} from "./farmLayout.js";

const FENCE_COLLIDER_SPACING = 1.8;
const FENCE_COLLIDER_RADIUS = 0.7;

/**
 * Circles along one straight fence run from (x1,z1) to (x2,z2), skipping any
 * point inside a gap interval (used for paddock gates). Pure.
 */
export function fenceRunColliders(idPrefix, x1, z1, x2, z2, gap = null) {
  const cols = [];
  const len = Math.hypot(x2 - x1, z2 - z1);
  const steps = Math.max(1, Math.round(len / FENCE_COLLIDER_SPACING));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x1 + (x2 - x1) * t;
    const z = z1 + (z2 - z1) * t;
    if (gap && Math.hypot(x - gap.x, z - gap.z) < gap.halfWidth) continue;
    // jumpable: a walking player is blocked, but Space clears it (Player.jsx
    // drops jumpable colliders once the player is airborne).
    cols.push({ id: `${idPrefix}-${i}`, kind: "boundary", x, z, radius: FENCE_COLLIDER_RADIUS, jumpable: true });
  }
  return cols;
}

/**
 * Circles along one straight run of the property BOUNDARY fence — solid and
 * NON-jumpable (you cannot hop out of the farm). Coarser spacing than the
 * paddock runs but still overlapping so a running/jumping player can't slip
 * through. Pure.
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

/** The four solid, NON-jumpable runs of the property boundary fence. */
function boundaryColliders() {
  const { halfW, halfD } = BOUNDARY_FENCE;
  return [
    ...borderRunColliders("farm-border-n", -halfW, -halfD, halfW, -halfD),
    ...borderRunColliders("farm-border-s", -halfW, halfD, halfW, halfD),
    ...borderRunColliders("farm-border-w", -halfW, -halfD, -halfW, halfD),
    ...borderRunColliders("farm-border-e", halfW, -halfD, halfW, halfD),
  ];
}

/**
 * The four fence runs of one paddock rect, with the gate side split around the
 * gate gap. Pure — returns collider circles.
 */
export function paddockColliders(p) {
  const hw = p.w / 2;
  const hd = p.d / 2;
  const west = p.x - hw, east = p.x + hw, north = p.z - hd, south = p.z + hd;
  const g = p.gate || {};
  const gapHalf = (g.width || 0) / 2 + 0.4; // a little clearance beyond the visual gap

  const gapFor = (side) => {
    if (g.side !== side) return null;
    if (side === "north") return { x: p.x + (g.offset || 0), z: north, halfWidth: gapHalf };
    if (side === "south") return { x: p.x + (g.offset || 0), z: south, halfWidth: gapHalf };
    if (side === "east") return { x: east, z: p.z + (g.offset || 0), halfWidth: gapHalf };
    return { x: west, z: p.z + (g.offset || 0), halfWidth: gapHalf };
  };

  return [
    ...fenceRunColliders(`${p.id}-n`, west, north, east, north, gapFor("north")),
    ...fenceRunColliders(`${p.id}-s`, west, south, east, south, gapFor("south")),
    ...fenceRunColliders(`${p.id}-e`, east, north, east, south, gapFor("east")),
    ...fenceRunColliders(`${p.id}-w`, west, north, west, south, gapFor("west")),
  ];
}

// Barn: a row of circles across the footprint (the door face stays south —
// the interior is out of bounds for now, matching the closed low-poly barn).
function barnColliders() {
  const cols = [];
  const hw = FARM_BARN.w / 2;
  const hd = FARM_BARN.d / 2;
  for (let x = -hw + 1; x <= hw - 1; x += 2.4) {
    for (let z = -hd + 1; z <= hd - 1; z += 2.4) {
      cols.push({ id: `farm-barn-${cols.length}`, kind: "boundary", x: FARM_BARN.x + x, z: FARM_BARN.z + z, radius: 1.6 });
    }
  }
  return cols;
}

const STATIC = [
  ...FARM_PADDOCKS.flatMap((p) => paddockColliders(p)),
  // The flagship CHALLENGE FENCE — now a solid but JUMPABLE run (Space vaults
  // it). During the Fence Challenge the player walks a line offset in front, so
  // these never block the placement itself.
  ...fenceRunColliders("farm-challenge-fence", CHALLENGE_FENCE.x1, CHALLENGE_FENCE.z, CHALLENGE_FENCE.x2, CHALLENGE_FENCE.z),
  // The property BOUNDARY fence — solid + NON-jumpable (can't hop out).
  ...boundaryColliders(),
  // Round-Up sorting pen (F3) — fenced like a paddock, gate gap stays open.
  // Cows themselves are NOT solid (walk-through markers).
  ...paddockColliders(ROUNDUP_PEN),
  { id: "farm-roundup-sign", kind: "interactable", x: ROUNDUP_SIGN.position[0], z: ROUNDUP_SIGN.position[1], radius: 0.6 },
  // Order-the-Parts carrot bed (F4) — solid so the row is never trampled;
  // the player views/swaps from the front (south) side.
  { id: "farm-order-bed-w", kind: "boundary", x: ORDER_GARDEN.x - 4, z: ORDER_GARDEN.z, radius: 2.0 },
  { id: "farm-order-bed-c", kind: "boundary", x: ORDER_GARDEN.x, z: ORDER_GARDEN.z, radius: 2.0 },
  { id: "farm-order-bed-e", kind: "boundary", x: ORDER_GARDEN.x + 4, z: ORDER_GARDEN.z, radius: 2.0 },
  { id: "farm-order-sign", kind: "interactable", x: ORDER_SIGN.position[0], z: ORDER_SIGN.position[1], radius: 0.6 },
  { id: "farm-crate-sign", kind: "interactable", x: CRATE_SIGN.position[0], z: CRATE_SIGN.position[1], radius: 0.6 },
  // Milk Splitter dairy corner (F8): machine, chutes and the parked truck.
  { id: "farm-milk-machine", kind: "boundary", x: MILK_AREA.x, z: MILK_AREA.z - 0.4, radius: 1.4 },
  { id: "farm-milk-chute-s", kind: "boundary", x: MILK_CHUTE_STOPS[0], z: MILK_CHUTE_STOPS[1], radius: 0.9 },
  { id: "farm-milk-chute-r", kind: "boundary", x: MILK_CHUTE_REPEATS[0], z: MILK_CHUTE_REPEATS[1], radius: 0.9 },
  { id: "farm-milk-truck-a", kind: "boundary", x: MILK_TRUCK.position[0] - 1.2, z: MILK_TRUCK.position[1] + 1.2, radius: 1.6 },
  { id: "farm-milk-truck-b", kind: "boundary", x: MILK_TRUCK.position[0] + 1.2, z: MILK_TRUCK.position[1] - 1.2, radius: 1.6 },
  { id: "farm-milk-sign", kind: "interactable", x: MILK_SIGN.position[0], z: MILK_SIGN.position[1], radius: 0.6 },
  // Weigh Station NE corner (F9): the scale + its host.
  { id: "farm-weigh-scale", kind: "boundary", x: WEIGH_AREA.x, z: WEIGH_AREA.z, radius: 1.3 },
  { id: "farm-weigh-sign", kind: "interactable", x: WEIGH_SIGN.position[0], z: WEIGH_SIGN.position[1], radius: 0.6 },
  // Trading Post (F10): the three stalls + the trading table.
  ...Object.entries(TRADE_STALL_OFFSETS).map(([k, [ox, oz]]) => ({
    id: `farm-trade-stall-${k}`, kind: "boundary", x: TRADE_AREA.x + ox, z: TRADE_AREA.z + oz, radius: 1.3,
  })),
  { id: "farm-trade-table", kind: "boundary", x: TRADE_AREA.x + TRADE_TABLE_OFFSET[0], z: TRADE_AREA.z + TRADE_TABLE_OFFSET[1], radius: 0.9 },
  { id: "farm-trade-sign", kind: "interactable", x: TRADE_SIGN.position[0], z: TRADE_SIGN.position[1], radius: 0.6 },
  // Veggie Plot (F11): the raised garden bed (solid) + its host sign.
  { id: "farm-veggie-bed", kind: "boundary", x: VEGGIE_AREA.x, z: VEGGIE_AREA.z, radius: 3.6 },
  { id: "farm-veggie-sign", kind: "interactable", x: VEGGIE_SIGN.position[0], z: VEGGIE_SIGN.position[1], radius: 0.6 },
  // Plank the Gap (F12): the fence-gap structure + its host sign.
  { id: "farm-plank-gap", kind: "boundary", x: PLANK_AREA.x, z: PLANK_AREA.z, radius: 1.6 },
  { id: "farm-plank-sign", kind: "interactable", x: PLANK_SIGN.position[0], z: PLANK_SIGN.position[1], radius: 0.6 },
  // The Farm Shop (F13): the market stall (solid counter) + its host sign.
  { id: "farm-shop-stall", kind: "boundary", x: SHOP_AREA.x, z: SHOP_AREA.z, radius: 2.9 },
  { id: "farm-shop-sign", kind: "interactable", x: SHOP_SIGN.position[0], z: SHOP_SIGN.position[1], radius: 0.6 },
  { id: "farm-records", kind: "interactable", x: FARM_RECORDS_STAND.position[0], z: FARM_RECORDS_STAND.position[1], radius: 3.6 },
  ...barnColliders(),
  { id: "farm-silo", kind: "boundary", x: FARM_SILO.x, z: FARM_SILO.z, radius: FARM_SILO.radius + 0.3 },
  { id: "farm-windmill", kind: "boundary", x: FARM_WINDMILL.x, z: FARM_WINDMILL.z, radius: 1.2 },
  {
    id: "farm-pond", kind: "boundary", x: FARM_POND.center[0], z: FARM_POND.center[1],
    radius: FARM_POND.radius + 0.4, hint: "The duck pond — best not to swim in it!",
  },
  ...FARM_TREES.map((p, i) => ({ id: `farm-tree-${i}`, kind: "tree", x: p[0], z: p[1], radius: 0.8 })),
  ...AUTUMN_TREES.map((p, i) => ({ id: `farm-amber-${i}`, kind: "tree", x: p[0], z: p[1], radius: 0.8 })),
  { id: "farm-big-amber", kind: "tree", x: BIG_AMBER.position[0], z: BIG_AMBER.position[1], radius: 1.1 },
  ...FARM_HAY_BALES.map((b, i) => ({ id: `farm-hay-${i}`, kind: "boundary", x: b[0], z: b[1], radius: 1.0 })),
  { id: "farm-scarecrow", kind: "boundary", x: FARM_SCARECROW.x, z: FARM_SCARECROW.z, radius: 0.5 },
  { id: "farm-welcome-sign", kind: "boundary", x: FARM_WELCOME_SIGN.position[0], z: FARM_WELCOME_SIGN.position[1], radius: 0.6 },
  { id: "farm-challenge-sign", kind: "interactable", x: CHALLENGE_SIGN.position[0], z: CHALLENGE_SIGN.position[1], radius: 0.6 },
];

/** Farm colliders (static for now — no progress-gated barriers). */
export function getFarmColliders() {
  return STATIC;
}
