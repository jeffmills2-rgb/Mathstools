/**
 * SNOWBALL SUMS — LAYOUT (S1) — the single source of truth for the FOURTH
 * region: a LARGE, FLAT snow world reached through an IGLOO gate on the
 * island, just east of Integer Dunes (between the dunes and the Retrieval
 * Practice Playground portal). Scenery, colliders and the (future) in-world
 * challenges all read this file so they can never drift apart.
 *
 * Coordinate space is the region's own: x ∈ [-60, 60], z ∈ [-48, 48] — the
 * SAME dimensions as Fraction Farm. Ground is flat (height 0). Twilight
 * lighting with an aurora overhead (see SnowScenery + World.jsx).
 *
 * The world is deliberately laid out around TEN reserved challenge areas
 * (SNOW_CHALLENGE_SPOTS) so ten in-world maths challenges can land here one
 * at a time without ever fighting the scenery for space. 1 unit = 1 metre.
 *
 * All snowmen / Christmas trees / penguins / igloos are primitive MARKERS for
 * now — teacher glbs will replace them (wire like the farm characters).
 */

export const SNOW_BOUNDS = { shape: "rect", width: 120, height: 96, center: [0, 0] };

// Player arrives at the south edge, looking north up the main lane (the same
// arrival pattern as Fraction Farm, so travel always feels familiar).
export const SNOW_SPAWN = { x: 0, z: 40 };

// Return Teleport Gate → back to the island. Behind the arrival point.
export const SNOW_RETURN_PORTAL = [0, 44.5];

// A big welcome sign just inside the entrance, facing the arrival point.
export const SNOW_WELCOME_SIGN = {
  position: [5, 36],
  rotationY: -0.5,
  text: "Welcome to Snowball Sums!",
};

// The trophy stand (trophy.glb — identical to Fraction Farm's: ten pigeonhole
// spaces + the grand-trophy top spot). On the NORTH boundary west of the
// return portal so it greets players by the entrance. Faces south.
export const SNOW_RECORDS_STAND = { id: "snow-records", position: [-11, 43], rotationY: Math.PI };

// Packed-snow lanes — axis-aligned rects { x, z, w, d } (centre + size).
export const SNOW_LANES = [
  { id: "snow-main-lane", x: 0, z: 12, w: 5, d: 68 },   // south entrance → lodge yard
  { id: "snow-cross-lane", x: 0, z: 12, w: 70, d: 4 },  // east–west spur to the areas
];

// The lodge yard — a packed-snow circle in front of the ski lodge.
export const SNOW_YARD = { center: [0, -24], radius: 11 };

// The big alpine SKI LODGE (the barn analogue — warm glowing windows, the
// only cosy light in the twilight). Door faces south, toward the lane.
export const SNOW_LODGE = { x: 0, z: -33, w: 14, d: 10, wall: "#7a5638", roof: "#3d4a63", trim: "#f3ead6" };

// ==========================================================================
// THE ICE RINK — an elliptical sheet of real SLIPPERY ice (Player.jsx gives
// movement momentum + glide while on it) ringed by a low snow bank the
// player can hop (jumpable colliders), with a southern entrance gap onto
// the cross lane. Reserved as a future challenge area too.
// ==========================================================================
export const ICE_RINK = { center: [16, 4], rx: 12, rz: 8.5 };
// The bank's entrance gap: centred on the SOUTH edge (toward the cross lane),
// as a half-angle (radians) around the ellipse parameter θ = +π/2.
export const RINK_GATE_HALF_ANGLE = 0.35;

/** True when (x, z) is ON the rink ice — Player.jsx switches to slide physics. */
export function isOnIce(x, z) {
  const dx = (x - ICE_RINK.center[0]) / ICE_RINK.rx;
  const dz = (z - ICE_RINK.center[1]) / ICE_RINK.rz;
  return dx * dx + dz * dz <= 1;
}

/** True when (x, z) is on walkable SNOW (footprints show) — anywhere in the
 *  region that isn't the rink ice. */
export function isOnSnow(x, z) {
  const hw = SNOW_BOUNDS.width / 2;
  const hh = SNOW_BOUNDS.height / 2;
  return Math.abs(x) <= hw && Math.abs(z) <= hh && !isOnIce(x, z);
}

// ==========================================================================
// TEN RESERVED CHALLENGE AREAS — one per future in-world maths challenge
// (topics TBD). Each is an open clearing the scenery keeps out of; the
// checks assert they stay in bounds, well apart, and clear of colliders.
// The ids are also the trophy-slot keys in data/snow/snowRecords.js.
// ==========================================================================
export const SNOW_CHALLENGE_SPOTS = [
  { id: "rink", label: "The Ice Rink", center: [16, 4] },       // the rink itself
  { id: "village", label: "Igloo Village", center: [-36, 4] },  // west (cow-paddock analogue)
  { id: "colony", label: "Penguin Colony", center: [-14, -2] }, // the penguins wander here
  { id: "snowmen", label: "Snowman Meadow", center: [-32, 36] },// south-west clearing
  { id: "pines", label: "Christmas Tree Grove", center: [36, 20] }, // eastern grove
  { id: "range", label: "Snowball Range", center: [33, 36.5] }, // south-east clearing
  { id: "cave", label: "Ice Cave", center: [-40, -28] },        // north-west corner
  { id: "sled", label: "Sledding Slope", center: [48, -38] },   // north-east corner
  { id: "lodgeyard", label: "Lodge Yard", center: [13, -25] },  // east of the lodge
  { id: "lights", label: "Aurora Lookout", center: [38, -14] }, // eastern gap
];

// ==========================================================================
// THE SNOWBALL RANGE (SR) — the first built snow challenge, claiming the
// "range" reserved area (south-east clearing). Bridging to ten: a ten-frame
// snowball CRATE on a stand, the student splits their handful to fill it to
// the next ten before the throw. 3D lives in game/SnowballRangeChallenge.jsx;
// pure maths in snowballRangeChallenge.js.
// ==========================================================================
export const RANGE_AREA = { x: 33, z: 36.5 }; // == SNOW_CHALLENGE_SPOTS "range"
// The ten-frame crate stand (north of the area centre, facing the camera).
export const RANGE_FRAME_POS = [33, 33];
// Idle dressing: a stack of packed snowball crates beside the stand.
export const RANGE_CRATE_POS = [30, 34];
// Where the player parks during the challenge (tap/type-only, front-on view).
export const RANGE_VIEW_SPOT = [33, 41];
// Pip hosts from beside the range (clear of the throw line + the view spot).
export const RANGE_SIGN = { position: [37.5, 40] };

// ==========================================================================
// THE ICE RINK — GLIDE BY TENS (RG) — the second built snow challenge,
// claiming the "rink" reserved area: the rink ice becomes a giant 0–100
// number line and Fern's penguin glides the queued jumps. 3D lives in
// game/RinkGlideChallenge.jsx; pure maths in rinkGlideChallenge.js.
// ==========================================================================
// The etched number line across the rink ice (0–100 maps xMin → xMax along
// the ellipse's long axis, comfortably inside the rim).
export const RINK_GLIDE_LINE = { z: 4, xMin: 5, xMax: 27 };
// Where the player parks during the challenge — on the ice, off to the
// south-west so they never block the camera's view of the line.
export const RINK_GLIDE_VIEW_SPOT = [9.5, 8.5];
// Fern hosts from just outside the rink's southern entrance gap.
export const RINK_GLIDE_SIGN = { position: [12.2, 14.8] };

/** World x of a number-line value (0–100) on the rink. Pure. */
export function rinkGlideX(value) {
  const { xMin, xMax } = RINK_GLIDE_LINE;
  return xMin + (Math.max(0, Math.min(100, value)) / 100) * (xMax - xMin);
}

// ==========================================================================
// CHRISTMAS TREE GROVE — LIGHT THE TREE (GV) — the third built snow
// challenge, claiming the "pines" reserved area (eastern grove):
// compensation with bundles of ten fairy lights. 3D lives in
// game/GroveLightsChallenge.jsx; pure maths in groveLightsChallenge.js.
// ==========================================================================
export const GROVE_AREA = { x: 36, z: 20 }; // == SNOW_CHALLENGE_SPOTS "pines"
// The big light-up tree (north of the area centre, facing the camera).
export const GROVE_TREE_POS = [36, 16.5];
// The bundle box (crate of ten-light bundles + slow loose singles).
export const GROVE_BOX_POS = [33.2, 16.8];
// Where the player parks during the challenge (button/type-only).
export const GROVE_VIEW_SPOT = [32.8, 23.5];
// Alby hosts from the eastern side of the grove clearing.
export const GROVE_SIGN = { position: [39.5, 23] };

// ==========================================================================
// SNOWMAN MEADOW — LEVEL THE TWINS (ML) — the fourth built snow challenge,
// claiming the "snowmen" reserved area (south-west clearing): levelling a
// sum into a double by hopping snowballs between two snowman towers. 3D in
// game/MeadowLevelChallenge.jsx; pure maths in meadowLevelChallenge.js.
// ==========================================================================
export const MEADOW_AREA = { x: -32, z: 36 }; // == SNOW_CHALLENGE_SPOTS "snowmen"
// The two snowman towers (north of the centre, facing the camera).
export const MEADOW_TOWER_LEFT = [-33.8, 33.5];
export const MEADOW_TOWER_RIGHT = [-30.2, 33.5];
// Where the player parks during the challenge (button/type-only).
export const MEADOW_VIEW_SPOT = [-28.9, 41.3];
// The placeholder host ("Frosty" — no glb yet) beside the towers.
export const MEADOW_SIGN = { position: [-28.2, 38.2] };

// ==========================================================================
// SLEDDING SLOPE — THE ROPED SLEDS (SL) — the fifth built snow challenge,
// claiming the "sled" reserved area (north-east corner). The corner gets a
// REAL HILL: the only non-flat ground in the snow world. The hill is a
// smooth bump that rises to `peak` near its crest and falls back to ZERO
// before every zone edge — so the flat world, the boundary bank and every
// other challenge area are untouched. Player physics just works (the walk
// step is far below the per-frame rise), and regions.js points the region's
// groundHeight at snowGroundHeight() below. 3D in game/SledSlopeChallenge.jsx
// + the SlopeHill terrain mesh in SnowScenery; maths in sledSlopeChallenge.js.
// ==========================================================================
export const SLOPE = {
  xMin: 40, xCrest: 54, xMax: 58, // rises west→crest, falls crest→bank
  zMin: -46, zCrest: -38, zMax: -30,
  peak: 2.8,
};

/** A smooth 0→1→0 bump: 0 at/outside [a, b], 1 at peakT (smoothstep). Pure. */
function slopeBump(t, a, peakT, b) {
  if (t <= a || t >= b) return 0;
  const u = t < peakT ? (t - a) / (peakT - a) : (b - t) / (b - peakT);
  return u * u * (3 - 2 * u);
}

/** Ground height anywhere in the snow world — the sled hill, else 0. Pure. */
export function snowGroundHeight(x, z) {
  return (
    SLOPE.peak *
    slopeBump(x, SLOPE.xMin, SLOPE.xCrest, SLOPE.xMax) *
    slopeBump(z, SLOPE.zMin, SLOPE.zCrest, SLOPE.zMax)
  );
}

// The groomed RUN down the fall line (the crest's z), where the number
// window + the roped sleds live. Values increase DOWNHILL (toward -x).
export const SLOPE_LANE = { z: SLOPE.zCrest, xTop: 53.5, xBottom: 42 };
// Where the player parks during the challenge (button/type-only) — on the
// flat, off the camera's sightline.
export const SLOPE_VIEW_SPOT = [42, -28.5];
// The placeholder host ("Flake" — no glb yet) on the slope's shoulder.
export const SLOPE_SIGN = { position: [51.5, -31.5] };

// ==========================================================================
// IGLOO VILLAGE — JOIN THE IGLOOS (VG) — the "village" reserved area:
// partitioning with ten-blocks + one-blocks. 3D in GroveLights-style
// game/VillageSplitChallenge.jsx; maths in villageSplitChallenge.js.
// ==========================================================================
export const VILLAGE_AREA = { x: -36, z: 4 }; // == SNOW_CHALLENGE_SPOTS "village"
export const VILLAGE_LEFT_STAND = [-39.5, 2]; // the first igloo's block stand
export const VILLAGE_RIGHT_STAND = [-32.5, 2]; // the second igloo's block stand
export const VILLAGE_BUILD_SITE = [-36, -1.5]; // where the new igloo assembles
export const VILLAGE_VIEW_SPOT = [-38.8, 11.3];
export const VILLAGE_SIGN = { position: [-32, 7.5] };

// ==========================================================================
// PENGUIN COLONY — PAIR THE PENGUINS (PC) — the "colony" reserved area:
// doubles + near-doubles via pairing rows. 3D in game/ColonyPairsChallenge.jsx;
// maths in colonyPairsChallenge.js.
// ==========================================================================
export const COLONY_AREA = { x: -14, z: -2 }; // == SNOW_CHALLENGE_SPOTS "colony"
export const COLONY_ROWS = { z1: -3.4, z2: -1.2 }; // the two pairing rows
export const COLONY_VIEW_SPOT = [-8.5, 3.8];
export const COLONY_SIGN = { position: [-19, 3] };

// ==========================================================================
// THE ICE CAVE — LIGHT THE CRYSTALS (IC) — the "cave" reserved area:
// think-addition (count up vs count back) on a numbered crystal wall inside
// a dark cave mouth. 3D in game/CaveCrystalsChallenge.jsx; maths in
// caveCrystalsChallenge.js.
// ==========================================================================
export const CAVE_AREA = { x: -40, z: -28 }; // == SNOW_CHALLENGE_SPOTS "cave"
export const CAVE_WALL = { z: -32.5, xMin: -45.5, xMax: -34.5 }; // crystal arc
export const CAVE_DOME = { center: [-40, -34], radius: 7.5 }; // the dark mouth
export const CAVE_VIEW_SPOT = [-36, -23.5];
export const CAVE_SIGN = { position: [-35.5, -26.5] };

// ==========================================================================
// THE LODGE YARD — COCOA CHANGE (LY) — the "lodgeyard" reserved area:
// friends of 100 counted up on a hundred-bead cocoa board beside the
// lodge's hot-chocolate stall. 3D in game/LodgeYardChallenge.jsx; maths in
// lodgeYardChallenge.js.
// ==========================================================================
export const YARD_AREA = { x: 13, z: -25 }; // == SNOW_CHALLENGE_SPOTS "lodgeyard"
export const YARD_STALL = [11.5, -28]; // the cocoa stall (trading-post analogue)
export const YARD_BOARD = [16, -27.5]; // the hundred-bead board on its stand
export const YARD_VIEW_SPOT = [9.5, -20];
export const YARD_SIGN = { position: [16.5, -22] };

// ==========================================================================
// AURORA LOOKOUT — THE STRATEGY PICKER (AL) — the "lights" reserved area:
// the capstone. The aurora writes a sum in the sky over a raised viewing
// deck; the play is CHOOSING the strategy. 3D in game/AuroraLookoutChallenge.jsx;
// maths in auroraLookoutChallenge.js.
// ==========================================================================
export const LOOKOUT_AREA = { x: 38, z: -14 }; // == SNOW_CHALLENGE_SPOTS "lights"
export const LOOKOUT_DECK = [40.5, -16.5]; // the raised viewing platform
export const LOOKOUT_VIEW_SPOT = [37, -9.5];
export const LOOKOUT_SIGN = { position: [34.5, -11] };

// Where the penguins waddle — an open rectangle around the Penguin Colony,
// clear of the lanes, the rink ice and every collider (they're walk-through
// markers like the farm cows, so they never block the player).
export const PENGUIN_WANDER = { minX: -22, maxX: -6, minZ: -8, maxZ: 6 };
export const PENGUIN_COUNT = 6;

// Two extra penguins belly-slide back and forth across the rink (pure fun).
export const RINK_SLIDERS = 2;

// ==========================================================================
// PETE — the snow world's wandering local (game/WanderingPete.jsx).
// He is ambient life, not an interactable: he strolls the open snow, stops
// for a few seconds, throws a spin jump, then walks on. He NEVER runs.
//
// The wander box sits well inside the boundary bank (±58/±46) so he can
// never walk into it, and `isPeteSpotOk` keeps him off the rink ice (he has
// no slide physics) and out of the ten challenge clearings — a stranger
// strolling through the shot while a student works a challenge is exactly
// the distraction the world-quieting pass exists to remove.
// ==========================================================================
// Pete's three-beat loop, by clip name in pete.glb. Kept HERE (pure data)
// rather than only in characterModels.js so the headless checks can assert
// them — characterModels.js reads `import.meta.env` and can't be imported
// outside vite. characterModels spreads this into the `pete` entry.
// NOTE there is deliberately NO run clip: Pete only ever walks.
export const PETE_CLIPS = {
  idle: "Idle_6",
  walk: "Walking",
  spin: "360_Power_Spin_Jump",
};

export const PETE_WANDER = { minX: -50, maxX: 50, minZ: -38, maxZ: 38 };
export const PETE_START = [4, 24]; // open snow south of the rink
export const PETE_WALK_SPEED = 1.15; // world units/sec — a stroll, never a run
export const PETE_IDLE_MS = [3000, 5000]; // pause before the spin jump
// How far Pete keeps clear of a challenge clearing's centre.
export const PETE_CHALLENGE_CLEARANCE = 11;

/**
 * Is (x, z) somewhere Pete may walk to? In the wander box, off the rink ice,
 * and clear of every reserved challenge clearing. Pure — the checks use it.
 */
export function isPeteSpotOk(x, z) {
  const b = PETE_WANDER;
  if (x < b.minX || x > b.maxX || z < b.minZ || z > b.maxZ) return false;
  if (isOnIce(x, z)) return false;
  for (const spot of SNOW_CHALLENGE_SPOTS) {
    const d = Math.hypot(x - spot.center[0], z - spot.center[1]);
    if (d < PETE_CHALLENGE_CLEARANCE) return false;
  }
  return true;
}

// ==========================================================================
// SCENERY PLACEMENT — everything below is markers/props (glb-replaceable).
// Positions are kept clear of the lanes, the rink, the ten challenge areas
// (≥ ~2.5 m from each centre) and each other.
// ==========================================================================

// Igloos around (not on) the Igloo Village centre — [x, z, rotY].
export const SNOW_IGLOOS = [
  [-42, 9, 0.9], [-30, 10, -0.7], [-43, -2, 1.6], [-29, -3, 2.6],
];

// Snowmen — a cluster in Snowman Meadow + a few scattered friends. [x, z].
export const SNOWMEN = [
  [-36, 32], [-28, 40], [-26, 32], [-38, 40], [-24, 38], // the meadow
  [8, 20], [-6, 28], [24, -38],                          // scattered
];

// Christmas trees — a grove cluster + scattered singles (all in-bounds; these
// get colliders). [x, z].
export const XMAS_TREES = [
  [41, 24], [31, 25], [42, 15], [30, 14], [36, 27], [41, 18], // the grove
  [-50, 38], [-52, 12], [-54, -16], [52, 28], [54, 8],        // scattered
  [26, -44], [-16, -42], [-48, -40], [10, 32], [-22, 20],
];

// Trees scattered OUT past the boundary bank, hazing into the fog (visual
// only — no colliders).
export const DISTANT_XMAS = [
  [-64, 20], [63, -6], [-62, -36], [58, 38], [24, -54], [-30, 53], [70, 12], [-72, -10],
];

// Lamp posts with warm glowing globes along the lanes (the twilight's path
// lighting). [x, z] — all just OFF the lane surfaces.
export const SNOW_LAMPS = [
  [3.4, 32], [-3.4, 22], [3.4, 8], [-3.4, -6], [3.4, -16],
  [14, 14.6], [-14, 14.6], [28, 14.6], [-28, 14.6],
];

// Candy-cane poles flanking the return portal + the rink entrance. [x, z].
export const CANDY_CANES = [
  [2.8, 43], [-2.8, 43], [12.5, 13.8], [19.5, 13.8],
];

// Ice Cave dressing — a snow mound with glowing ice crystals, kept to the
// BACK of the cave area so the centre stays clear for its future challenge.
export const ICE_CAVE_MOUND = { position: [-43, -33], radius: 3.0 };
export const ICE_CRYSTALS = [
  [-45, -31], [-35, -33], [-44, -23],
];

// Sledding Slope dressing — a wooden sled + course flags (the "slope" is a
// marked run for now; the world is flat like the farm).
export const SLED_PROP = { position: [50, -41], rotationY: -0.6 };
export const SLED_FLAGS = [
  [45, -42], [51, -34],
];

// Boundary snow bank (tall ice-block ridge) just inside the walkable bounds —
// the property line, NON-jumpable like the farm's picket fence.
export const SNOW_BOUNDARY = { halfW: 58, halfD: 46 };

// Snowy horizon peaks — [x, z, scaleX, scaleY, scaleZ] (visual only). Every
// peak's footprint stays ENTIRELY outside the boundary bank so none pokes
// into the playable world.
export const SNOW_PEAKS = [
  [-105, -25, 34, 13, 22], [-95, 40, 30, 11, 20], [-55, -95, 38, 15, 24],
  [15, -100, 40, 14, 25], [75, -85, 34, 13, 22], [105, -15, 36, 15, 24],
  [95, 45, 30, 11, 20], [40, 95, 38, 13, 24], [-35, 95, 34, 11, 22],
  [-105, 15, 28, 9, 18],
];
