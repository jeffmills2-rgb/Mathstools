/**
 * SCHOOLYARD LAYOUT (W2-F) — the single source of truth for the second region:
 * a LARGER, TERRACED quad on the Coffs Coast, inspired by the real school's
 * three stepped levels. Scenery, terrain (heights), colliders and the NINE
 * character NPCs all read this so they can never drift apart.
 *
 * Coordinate space is the region's own: x ∈ [-44, 44], z ∈ [-30, 30].
 * Ground steps UP toward the north (buildings): tier 0 (front quad, h0) →
 * tier 1 (middle, h1.1) → tier 2 (upper, h2.2), linked by central staircases.
 *
 * WIDENED (from width 76 → 88) to make room in the east/west corners + edges
 * for the teacher's landmark models (see SCHOOLYARD_PROPS) without collisions.
 * The terrace planes, town backdrop and boss-gate seal all derive from this
 * width, so they widen together.
 */

export const SCHOOLYARD_BOUNDS = { shape: "rect", width: 88, height: 60, center: [0, 0] };

// Player arrives at the south edge of the lowest tier, looking north.
export const SCHOOLYARD_SPAWN = { x: 0, z: 24 };

// Three tiers as z-bands (south → north), stepping up. Heights ≤ STEP_UP apart
// per stair step so the central staircases are walkable.
export const SCHOOLYARD_TIERS = [
  { id: "tier-0", zMin: 8, zMax: 30, height: 0.0 },    // front quad (arrival)
  { id: "tier-1", zMin: -8, zMax: 8, height: 1.1 },    // middle
  { id: "tier-2", zMin: -30, zMax: -8, height: 2.2 },  // upper (near buildings)
];

// Central staircases (|x| ≤ halfWidth) bridging adjacent tiers, straddling the
// tier boundary. Everywhere else the tier boundary is a retaining wall.
export const SCHOOLYARD_STAIRS = [
  { id: "stair-0-1", zBoundary: 8, from: 0.0, to: 1.1, halfWidth: 4 },
  { id: "stair-1-2", zBoundary: -8, from: 1.1, to: 2.2, halfWidth: 4 },
];

// The NINE characters — the renamed trio + six new staff. Spaced across the
// three tiers (3 per tier). `skill` is a balanced round-robin of the Stage 3
// number-facts warm-ups; `flavor` is a Coffs Coast line; `complete` is the
// warm-up sign-off. NPC missions/chains/dialogue/encounters are GENERATED from
// this list (see missions.js, npcQuestChains.js, mainQuest.js, encounters.js).
export const SCHOOLYARD_CHARACTERS = [
  // Tier 0 — the front quad (three keys).
  { id: "pearce", name: "Mr. Pearce", position: [-24, 16], color: "#e07a5f", skill: "addSubTo20",
    flavor: "Ever ridden the toboggan at the Big Banana? What a blast!",
    complete: ["Nice one — that's the spirit! Here's your key.", "One down — go find the others."] },
  { id: "mahoney", name: "Ms. Mahoney", position: [0, 18], color: "#3d9970", skill: "multFacts",
    flavor: "Nothing beats a morning swim down at Jetty Beach.",
    complete: ["Great counting — take a key!", "Off you go — enjoy the sunshine."] },
  { id: "ewings", name: "Ms. Ewings", position: [24, 16], color: "#5b8def", skill: "divFacts",
    flavor: "The breakwall walk to Muttonbird Island is my favourite — whales in season!",
    complete: ["Lovely sharing those out — here's a key!", "Say hi to the shearwaters for me."] },

  // Tier 1 — the middle terrace (three keys).
  { id: "dawson", name: "Mr. Dawson", position: [-24, 0], color: "#9b5de5", skill: "multFacts",
    flavor: "The view from Sealy Lookout's Forest Sky Pier is unreal.",
    complete: ["Top work — that's a key earned!", "Head up and enjoy the view."] },
  { id: "heywood", name: "Mr. Heywood", position: [0, 2], color: "#2a9d8f", skill: "divFacts",
    flavor: "Went diving out at the Solitary Islands on the weekend.",
    complete: ["Sharp division — take your key!", "Dive back in any time."] },
  { id: "morgan", name: "Mr. Morgan", position: [24, 0], color: "#e76f51", skill: "addSubTo20",
    flavor: "The banana plantations up here go on for miles.",
    complete: ["Great work — here's a key!", "Keep it up."] },

  // Tier 2 — the upper terrace (two flanking keys)…
  { id: "bacon", name: "Ms. Bacon", position: [-14, -16], color: "#457b9d", skill: "multFacts",
    flavor: "I love watching the boats come in at the marina.",
    complete: ["Terrific times tables — a key for you!", "Smooth sailing from here."] },
  { id: "brookes", name: "Ms. Brookes", position: [14, -16], color: "#8ac926", skill: "divFacts",
    flavor: "The rainforest tracks at Bruxner Park are so peaceful.",
    complete: ["Beautiful division — take the last key!", "Now… go and see the Head Teacher."] },

  // …and the BOSS: a larger, orange Head Teacher on a podium behind the gate.
  { id: "kellahan", name: "Mrs. Kellahan", position: [0, -26], color: "#f4772e", skill: "addSubTo20",
    boss: true, scale: 1.35,
    flavor: "You've earned every key — ready for the Head Teacher's challenge?",
    complete: ["🏆 You did it — you've completed the whole Schoolyard!",
      "What a champion. Well done, from all the staff on the Coffs Coast!"] },
];

// The boss (Head Teacher) and the padlocked gate that guards her. The gate is
// LOCKED until every other staff member's warm-up is complete (8 keys). She
// stands on a raised podium. See schoolyard/schoolyardProgress.js for the pure
// key/unlock logic.
export const SCHOOLYARD_BOSS_ID = "kellahan";
export const SCHOOLYARD_GATE = { z: -21, halfWidth: 6, height: 2.2 };
export const SCHOOLYARD_PODIUM = { position: [0, -26], radius: 2.0, height: 0.6 };

// Big fig / gum trees, kept clear of characters, stairs and spawn.
export const SCHOOLYARD_TREES = [
  [-30, 20], [30, 20], [-12, 22],
  [-30, 4], [30, 4],
  [-30, -14], [30, -14], [-12, -24], [12, -24],
];

// Raised brick garden planters — [x, z, radius]. (Kept clear of the boss podium.)
export const SCHOOLYARD_PLANTERS = [
  [-10, 10, 2.0], [10, 10, 2.0], [-10, -4, 1.8], [10, -4, 1.8],
];

// Perimeter buildings — [x, z, w, d] + colours; base height comes from the tier
// they stand on. Heritage brick verandah + the blue-painted wall (south).
// NOTE: the inner east verandah + west grey block were REMOVED (they read as
// "rogue" slabs blocking the play area now that the big brick buildings form the
// perimeter horizon). Only the north block + the south blue wall remain.
export const SCHOOLYARD_BUILDINGS = [
  { id: "north-block", x: 0, z: -28, w: 52, d: 3, wall: "#cbb28a", roof: "#9a5a3a" },
  { id: "south-blue", x: 14, z: 28, w: 26, d: 2.5, wall: "#4a90d9", roof: "#2f5a86" },
];

// Central plaza (on the middle terrace), for the ground palette.
export const SCHOOLYARD_PLAZA = { center: [0, 0], radius: 8 };

// The welcome point in the corner nearest Ms. Bacon (upper-terrace NW). The
// primitive sign has been REPLACED by Mills (mills.glb, see SCHOOLYARD_PROPS);
// this text now floats as a greeting label above him.
export const SCHOOLYARD_WELCOME_SIGN = {
  position: [-32, -27],
  rotationY: 0.85, // face toward the yard centre
  text: "Welcome to the 2026 CHHS Maths Arena!",
};

// ==========================================================================
// LANDMARK MODELS (teacher's Meshy .glb props) placed around the yard. Each is
// loaded by SchoolyardScenery (SchoolyardProp) and sits on its tier's ground
// height (schoolyardGroundHeight). A matching solid collider is generated in
// schoolyardColliders.js from `collider` (metres radius; 0 = walk-through).
//
// `scale`/`rotationY` are STARTING values — they will almost certainly want a
// quick tune on a live `npm run dev` look. Tune scale/rotationY/collider here;
// everything else follows. `file` is resolved under public/models/ (so a
// character model is "characters/<name>.glb").
//
// Placement (kept clear of NPCs, trees, planters + the boss gate; the region
// was widened to width 88 to give the front room):
//   front   — SW corner near Mr. Pearce [-24,16] (large "school front"),
//             rotated 90° ANTICLOCKWISE.
//   tree-l/r — two large (3×) feature trees flanking the central plaza.
//   mills   — Mills the guide GREETS players where the welcome sign stood
//             (NW upper terrace, near Ms. Bacon).
// `yOffset` sinks a model INTO the ground (negative = down). The tree.glb sits
// on tall silver "legs" that look like they float; dropping it ~4 m buries the
// legs so only the planter + tree show. Tune yOffset on a live look.
// NOTE: Mills is no longer a decorative prop here — he's the arrival greeter
// interactable (schoolyard-sign in interactables.js, rendered via the "sage"
// character config), so he sits at the entrance and can be talked to.
export const SCHOOLYARD_PROPS = [
  { id: "front",  file: "front.glb", position: [-38, 24], scale: 0.6, rotationY: Math.PI / 2, collider: 5.5 },
  { id: "tree-l", file: "tree.glb",  position: [-14, 7],  scale: 135, rotationY: 0,   yOffset: -4, collider: 2.2 },
  { id: "tree-r", file: "tree.glb",  position: [14, 7],   scale: 135, rotationY: 1.1, yOffset: -4, collider: 2.2 },
];
