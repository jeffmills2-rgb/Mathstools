/**
 * PARTS OF A WHOLE FARM — LAYOUT (F1) — the single source of truth for the
 * third region: a LARGE, FLAT farming world reached through a Teleport Gate
 * BEHIND the island spawn point. Scenery, colliders and the in-world
 * challenges all read this file so they can never drift apart.
 *
 * Coordinate space is the region's own: x ∈ [-60, 60], z ∈ [-48, 48]
 * (noticeably bigger than the Schoolyard). Ground is flat (height 0).
 *
 * The paddock INTERIORS are deliberately left empty — they're reserved for
 * Meshy-style animal characters (cows, pigs, sheep) to be added later.
 * 1 world unit = 1 metre for all challenge maths.
 */

export const FARM_BOUNDS = { shape: "rect", width: 120, height: 96, center: [0, 0] };

// Player arrives at the south edge, looking north up the main lane.
export const FARM_SPAWN = { x: 0, z: 40 };

// Return Teleport Gate → back to the island. Behind the arrival point.
export const FARM_RETURN_PORTAL = [0, 44.5];

// Dirt lanes — axis-aligned rects { x, z, w, d } (centre + size).
export const FARM_LANES = [
  { id: "main-lane", x: 0, z: 12, w: 5, d: 68 },      // south entrance → barn yard
  { id: "cross-lane", x: 0, z: 12, w: 70, d: 4 },     // east–west spur to the paddocks
];

// The barn yard — a big dirt circle in front of the barn.
export const FARM_YARD = { center: [0, -24], radius: 11 };

/** True when (x,z) is on a dirt lane or the barn yard — used for footprints. */
export function isOnFarmPath(x, z) {
  for (const l of FARM_LANES) {
    if (Math.abs(x - l.x) <= l.w / 2 && Math.abs(z - l.z) <= l.d / 2) return true;
  }
  return Math.hypot(x - FARM_YARD.center[0], z - FARM_YARD.center[1]) < FARM_YARD.radius;
}

// Big red barn (door faces south, toward the lane).
export const FARM_BARN = { x: 0, z: -33, w: 14, d: 10, wall: "#c94f39", roof: "#8a3626", trim: "#f3e9d6" };

// Grain silo + windmill flanking the barn.
export const FARM_SILO = { x: 11, z: -35, radius: 2.4, height: 9 };
export const FARM_WINDMILL = { x: -13, z: -36, height: 8.5 };

// Fenced paddocks — { x, z, w, d } rects with a GATE GAP so the player can
// walk in. `gate` = { side: "north"|"south"|"east"|"west", offset, width }.
// Interiors stay EMPTY (future Meshy cows/pigs/sheep).
export const FARM_PADDOCKS = [
  { id: "cow-paddock", x: -36, z: 2, w: 34, d: 28, gate: { side: "east", offset: 0, width: 4 }, label: "Cow Paddock" },
  { id: "sheep-paddock", x: 36, z: 18, w: 26, d: 20, gate: { side: "west", offset: 0, width: 4 }, label: "Veggie Plot" },
  { id: "pig-pen", x: 32, z: -18, w: 22, d: 16, gate: { side: "west", offset: 0, width: 4 }, label: "Pig Pen" },
];

// Mud wallow inside the pig pen (visual only, no collider).
export const FARM_MUD = { center: [34, -18], radius: 5 };

// Where the 8 pigs may wander — inside the pig-pen fences (x:32 z:-18 w:22 d:16),
// kept ~2 units clear of the rails so they never clip through the fence.
export const PIG_WANDER = { minX: 23, maxX: 41, minZ: -24.5, maxZ: -11.5 };

// Duck pond (solid — the player walks around it). Small orange fish leap out of
// it at intermittent intervals (see PondFish in FarmScenery).
export const FARM_POND = { center: [16, 2], radius: 6 };

// Crop field — parallel rows southwest of the lane. { x, z } is the field
// centre; rows run east–west.
export const FARM_CROPS = { x: -32, z: 38, rows: 5, rowLength: 22, rowGap: 2.2 };

// Scarecrow watching the crops.
export const FARM_SCARECROW = { x: -20, z: 34 };

// Hay bales — [x, z, rotY]. Kept WEST of the barn, clear of the Crate
// Packing staging area east of the yard (teacher feedback).
export const FARM_HAY_BALES = [
  [-20, -29, 0.4], [-22, -26.5, 1.2], [-9, -17, 2.2], [24, -34, 0.9], [-24, 8, 1.7],
];

// Orchard / gum trees, kept clear of lanes, fences, portals and the challenge fence.
export const FARM_TREES = [
  // NOTE: the tree that used to sit at [52, -40] was moved to [56, -44] so it
  // no longer clashes with the (now central, wider) Weigh Station number line.
  [-56, 42], [-56, 20], [-56, -8], [-54, -34], [-30, -44], [30, -42], [56, -44],
  // [24,14] moved to [56,16] — it was INSIDE the Veggie Plot paddock, clashing
  // with the bed / potion plant.
  [56, -12], [56, 6], [56, 32], [44, 42], [22, 42], [-14, 20], [56, 16], [-20, -12],
];

// A big welcome sign just inside the entrance, facing the arrival point.
export const FARM_WELCOME_SIGN = {
  position: [5, 36],
  rotationY: -0.5,
  text: "Welcome to Fraction Farm!",
};

// ==========================================================================
// THE MILK SPLITTER (F8) — terminating vs recurring decimals. A machine in
// the quiet north-west "dairy corner" shares milk among d cups by actually
// performing the division: terminating shares finish cleanly, recurring
// shares drip in a visible loop forever. Students predict STOPS/REPEATS on
// the two chutes, then label the share with proper dot notation.
// ==========================================================================
export const MILK_AREA = { x: -40, z: -28 };                 // the machine
export const MILK_CHUTE_STOPS = [-44.5, -25.5];              // green chute (terminating)
export const MILK_CHUTE_REPEATS = [-35.5, -25.5];            // purple chute (recurring)
export const MILK_TRUCK = { position: [-47.5, -33], rotationY: 0.9 };
export const MILK_SIGN = { id: "farm-milk-sign", position: [-33, -22.5] }; // Milkman Pearce
export const MILK_VIEW_SPOT = [-34, -19.5];                  // player parks here

// ==========================================================================
// THE WEIGH STATION (F9) — rounding + ≈ in the BACK-RIGHT (north-east)
// corner: produce lands on a big analogue scale, and the zoomed number-line
// beam above it shows exactly where the reading sits between the two
// candidate roundings — rounding as LOCATING on a number line, not a digit
// rule. Includes money-to-5c rounds and exact-vs-estimate judgement rounds.
// ==========================================================================
export const WEIGH_AREA = { x: 48, z: -38 };                 // the scale
export const WEIGH_SIGN = { id: "farm-weigh-sign", position: [42.5, -33.5] }; // host
export const WEIGH_VIEW_SPOT = [42, -31];                    // player parks here

// ==========================================================================
// THE TRADING POST (F10) — FDP conversions as commerce, in the eastern gap
// BETWEEN the pig pen and the sheep paddock. Three stallholders price in
// different notations (fractions / decimals / percentages) and only accept
// their own language: a crate arrives priced in ONE notation and the
// student pays the other two stalls in THEIRS. Bulk deals bring improper
// fractions + mixed numbers ("7/4 crates = 1¾").
// ==========================================================================
export const TRADE_AREA = { x: 38, z: -1 };
// Stall offsets from TRADE_AREA (an arc facing south): fraction | decimal | percent.
export const TRADE_STALL_OFFSETS = {
  fraction: [-3.6, -1.0],
  decimal: [0, -2.2],
  percent: [3.6, -1.0],
};
export const TRADE_TABLE_OFFSET = [0, 1.6]; // the crate + source price tag
export const TRADE_SIGN = { id: "farm-trade-sign", position: [32, 3.5] }; // host
export const TRADE_VIEW_SPOT = [31.5, 5.5];

// ==========================================================================
// WORLD DRESSING (F7) — late-afternoon farm atmosphere: a tall boundary
// fence around the whole property, hazy rolling hills on the horizon, and
// autumn "liquid amber" trees.
// ==========================================================================

// Autumn trees INSIDE the walkable farm (these get colliders).
export const AUTUMN_TREES = [
  [-54, 30], [-52, 44], [52, 22], [50, -28], [-34, -42], [20, -44], [56, 42],
];

// Autumn + green trees scattered OUT past the boundary fence, among the
// hills (visual only — no colliders; the fog hazes them).
export const DISTANT_TREES = [
  { pos: [-64, 18], autumn: true }, { pos: [63, -8], autumn: true },
  { pos: [-60, -38], autumn: true }, { pos: [58, 36], autumn: false },
  { pos: [24, -52], autumn: true }, { pos: [-30, 52], autumn: false },
  { pos: [70, 14], autumn: false }, { pos: [-72, -8], autumn: true },
];

// THE big liquid amber — an open-pasture landmark with a carpet of fallen
// leaves that flutter up when the player walks through them.
export const BIG_AMBER = { position: [-30, 20], leafRadius: 4.2, leafCount: 44 };

// Boundary fence rectangle (tall, 3-rail) just inside the walkable bounds.
export const BOUNDARY_FENCE = { halfW: 58, halfD: 46 };

// Rolling horizon hills — [x, z, scaleX, scaleY, scaleZ] (visual only). Every
// hill's footprint stays ENTIRELY outside the boundary-fence rectangle
// (±58/±46) so no hill ever pokes into the playable farm.
export const HORIZON_HILLS = [
  [-105, -25, 34, 8, 22], [-95, 40, 30, 7, 20], [-55, -95, 38, 9, 24],
  [15, -100, 40, 8, 25], [75, -85, 34, 8, 22], [105, -15, 36, 9, 24],
  [95, 45, 30, 7, 20], [40, 95, 38, 8, 24], [-35, 95, 34, 7, 22],
  [-105, 15, 28, 6, 18],
];

// ==========================================================================
// THE CHALLENGE FENCE (F2) — the flagship in-world challenge: a long,
// straight fence with a RED end post (west) and a BLUE end post (east).
// The student WALKS to a fraction of the way along it and places an item.
// It runs east–west so it spans the screen with the default camera.
// NOT solid — the player can cross it freely while lining up a placement.
// ==========================================================================
export const CHALLENGE_FENCE = {
  // End posts: red at x1 (west), blue at x2 (east). 40 m long, 1 unit = 1 m.
  x1: -50,
  x2: -10,
  z: 28,
  redPost: { color: "#e63946", label: "Red post" },
  bluePost: { color: "#3a7bd5", label: "Blue post" },
};
export const CHALLENGE_FENCE_LENGTH = CHALLENGE_FENCE.x2 - CHALLENGE_FENCE.x1; // 40 m

// The signpost that starts the challenge — at the fence's east end, by the lane.
export const CHALLENGE_SIGN = { id: "farm-fence-sign", position: [-7, 30] };

// ==========================================================================
// THE ROUND-UP (F3) — "fraction OF AN AMOUNT" in-world challenge: a grazing
// herd of cows (white markers for now) in the HERD FIELD, and a small gated
// SORTING PEN beside it. The student computes how many cows a fraction /
// decimal / percentage of the herd is, then herds exactly that many into the
// pen. On feedback the herd rearranges into EQUAL GROUPS in the field — the
// canonical model for fraction of a quantity.
// ==========================================================================

// The sorting pen — a small gated paddock west of the main lane. Same shape
// as FARM_PADDOCKS entries so it can reuse the fence renderer + colliders.
// Gate faces SOUTH (toward the herd field).
export const ROUNDUP_PEN = {
  id: "roundup-pen", x: -13, z: -5, w: 10, d: 7,
  gate: { side: "south", offset: 0, width: 4 }, label: "Sorting Pen",
};

// Where the herd grazes — an open rectangle south of the pen, clear of the
// lanes, trees, the pond AND the cow paddock's east fence (x = -19).
// Cows spawn (and regroup) inside this.
export const ROUNDUP_FIELD = { x1: -17.5, z1: 1, x2: -5, z2: 9.5 };

// Waypoints cows walk through so they always pass THROUGH the pen gate
// (never through the fence): just outside, then just inside.
export const ROUNDUP_GATE_OUT = [-13, 0.6];
export const ROUNDUP_GATE_IN = [-13, -2.8];

// The signpost that starts the Round-Up — east of the pen, by the lane.
export const ROUNDUP_SIGN = { id: "farm-roundup-sign", position: [-6.5, -4] };

// Ambient herd size while no round is running (the field never looks empty).
export const ROUNDUP_IDLE_HERD = 12;

// ==========================================================================
// ORDER THE PARTS (F4) — the carrot garden: 5 carrots in a row, each with a
// fraction/decimal/percentage chip. Tap two carrots to swap them; get the
// row ascending and the carrots pull out of the ground (confetti!).
// In the open south-east pasture, clear of the sheep paddock and trees.
// ==========================================================================
export const ORDER_GARDEN = {
  x: 33, z: 36.5,        // centre of the carrot row
  count: 5, spacing: 2.3, // 5 carrots, row along x
  bedW: 13, bedD: 5,      // tilled soil bed
};

// Where the player stands to view the row (auto-walked in order mode).
export const ORDER_VIEW_SPOT = [33, 41.5];

// The signpost that starts the challenge — front-left of the garden bed.
export const ORDER_SIGN = { id: "farm-order-sign", position: [26, 41] };

// x position of carrot slot i (row centred on the garden).
export function orderSlotX(i) {
  return ORDER_GARDEN.x + (i - (ORDER_GARDEN.count - 1) / 2) * ORDER_GARDEN.spacing;
}

// ==========================================================================
// CRATE PACKING (F6) — HCF as the BIGGEST crate that packs two harvests with
// nothing left over. In the barn yard: two fruit piles near the barn, a row
// of tappable crate-size choices in front, viewed front-on (tap-only, like
// the carrot garden). Also carries the "simplify a fraction" framing.
// ==========================================================================
export const CRATE_AREA = { x: 13, z: -25 };            // staging centre
export const CRATE_PILES = [ [10, -25.2], [16, -25.2] ]; // apples / pears (close to the crate row so the fruit is always on screen)
export const CRATE_ROW = { z: -21, spacing: 1.6 };       // choice crates along x
// Player parks OFF to the side (front-left, by Mr. Pearce) so the avatar
// never blocks the steep top-down view of the staging area.
export const CRATE_VIEW_SPOT = [4.5, -22.5];
// Crate-size palette (always shown; every round's HCF is in here).
export const CRATE_SIZES = [1, 2, 3, 4, 5, 6, 8, 12];

// x position of choice crate i (row centred on the area).
export function crateSlotX(i) {
  return CRATE_AREA.x + (i - (CRATE_SIZES.length - 1) / 2) * CRATE_ROW.spacing;
}

// Mr. Pearce hosts, west of the staging area.
export const CRATE_SIGN = { id: "farm-crate-sign", position: [6, -19] };

// ==========================================================================
// FARM RECORDS (F5) — the trophy stand (trophy.glb: 10 trophy spaces + one
// top spot for a grand trophy at 10/10 — criteria TBD). Moved deeper into
// the farm, by the crossroads east of the main lane (teacher feedback:
// further from the arrival point). Cups render dynamically from bests.
// ==========================================================================
// Placed on the NORTH boundary fence, between the return portal [0,44.5] and
// Alby the Owl (who hosts Order the Parts at [26,41]) — so it greets players by
// the entrance. Faces south, into the play area. Rendered MUCH larger (see
// TROPHY_STAND_GROUP_SCALE in FarmScenery).
export const FARM_RECORDS_STAND = { id: "farm-records", position: [13, 43], rotationY: Math.PI };

// ==========================================================================
// THE VEGGIE PLOT (F11) — MULTIPLYING FRACTIONS as an area model, in the
// MIDDLE of the (renamed) "Veggie Plot" paddock. A unit-square garden bed:
// the student drags the WIDTH + LENGTH edges to two fractions, the overlap
// shades, and the harvest reveals the product (2/3 × 3/4 = 6/12). Companion
// fertiliser potions multiply a plant's height by a factor (grow/shrink).
// ==========================================================================
export const VEGGIE_AREA = { x: 36, z: 18 };   // centre of the paddock = the bed
export const VEGGIE_BED = 6;                    // bed side length (world units)
export const VEGGIE_VIEW_SPOT = [36, 25];       // player parks here (inside the paddock)
export const VEGGIE_SIGN = { id: "farm-veggie-sign", position: [26, 18] }; // host, by the west gate

// ==========================================================================
// PLANK THE GAP (F12) — ADDING & SUBTRACTING FRACTIONS, in the MIDDLE of the
// cow paddock. A gap in a fence rail: the student lays planks (½ ⅓ ¼ ⅙ 1/12)
// that all snap to a shared TWELFTHS grid to fill the gap exactly (common
// denominator = the grid). Subtraction rounds pre-fill part of a trough. Five
// black-and-white cows wander the paddock around it.
// ==========================================================================
export const PLANK_AREA = { x: -36, z: 2 };        // centre of the cow paddock
export const PLANK_VIEW_SPOT = [-36, 10];          // player parks here (inside the paddock)
export const PLANK_SIGN = { id: "farm-plank-sign", position: [-22, 2] }; // host, by the east gate
// Where the 5 cows may wander — inside the cow-paddock fences, with margin.
export const COW_WANDER = { minX: -51, maxX: -21, minZ: -10, maxZ: 14 };

// ==========================================================================
// THE FARM SHOP (F13) — PERCENTAGES CAPSTONE, a market stall JUST IN FRONT of
// the windmill (which sits at x:-13, z:-36 on the back edge). The stall faces
// south toward the play area; the student parks in front of it. Markup,
// discount, GST, profit/loss and unitary restocks — all typed answers.
// ==========================================================================
export const SHOP_AREA = { x: -13, z: -28 };        // stall, ~8 units in front of the windmill
export const SHOP_VIEW_SPOT = [-13, -20];           // player parks here, looking north at the stall
export const SHOP_SIGN = { id: "farm-shop-sign", position: [-13, -23] }; // host, at the counter
