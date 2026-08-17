/**
 * WORLD ZONES — data-driven topic areas on the (now larger) island (Phase 2H).
 *
 * The map is a central hub surrounded by four topic zones, with a locked
 * Champion's Grove beyond them. Each zone renders a coloured ground patch + a
 * sign; its NPC/marker lives at the zone centre. Pure data — no React/stores.
 *
 *   id        unique zone id
 *   name      sign label
 *   topicId   curriculum topic (null for hub / grove)
 *   theme     visual theme key (used by landmarks/colours)
 *   color     accent colour for the patch / sign
 *   center    [x, z] ground position
 *   radius    patch radius (also the rough "bounds")
 *   sign      [x, z] position of the sign post
 *   npcIds    interactable ids that belong to this zone
 *   unlockId  (optional) id in worldUnlocks that gates entry
 */
export const WORLD_ZONES = [
  {
    id: "zone-hub",
    name: "Mission Plaza",
    topicId: null,
    theme: "hub",
    color: "#2a9d8f",
    center: [0, 0],
    radius: 8,
    sign: [0, 9.6], // at the base of the plaza stairs (welcomes the player)
    npcIds: ["mission-board", "trophy-stand", "sage"],
  },
  {
    id: "zone-integers",
    name: "Pip's Problems",
    topicId: "integers",
    theme: "desert",
    color: "#e9c46a",
    center: [-25, -16],
    radius: 7,
    sign: [-25, -9.5],
    npcIds: ["pip"],
  },
  {
    id: "zone-fdp",
    name: "Fern's Fun",
    topicId: "fdp",
    theme: "volcano",
    color: "#e76f51",
    center: [25, -16],
    radius: 7,
    sign: [25, -9.5],
    npcIds: ["fern"],
  },
  {
    id: "zone-algebra",
    name: "Alby's Addition",
    topicId: "algebra",
    theme: "coast",
    color: "#4cc9f0",
    center: [25, 16],
    radius: 7,
    sign: [25, 9.5],
    npcIds: ["alby"],
  },
  {
    id: "zone-grove",
    name: "Retrieval Practice Playground",
    topicId: null,
    theme: "grove",
    color: "#ffd166",
    center: [0, -32],
    radius: 6,
    sign: [0, -26.5],
    npcIds: [], // the grove is now the SchoolYard portal entrance (W6-B)
    unlockId: "reward-grove", // locked until the grove gate opens
  },
];

// Map extent (used by the renderer + the player clamp). The walkable island is
// a circle of WALKABLE_RADIUS; the coastline drawn around it is IRREGULAR (see
// World.jsx) but the walkable area stays a clean circle so collision is simple.
// Enlarged in W6-D so the zones sit further apart and the map feels less cramped.
export const ISLAND_RADIUS = 40;
export const WALKABLE_RADIUS = 38;
export const OCEAN_RADIUS = 52;

// Integer Dunes SNOW region (W5-F+): the SW corner around Pip is snow rather than
// grass — roughly 1/5 of the map. Grass isn't drawn here, and the player leaves
// fading footprints while walking on it. Centred on the Integer Dunes zone.
export const SAND_PATCH = { center: [-25, -16], radius: 18 };

// Fraction Volcano ASH region: the ground around Fern is ashy grey with pebbles,
// extending SLIGHTLY beyond the rock wall (bnd-fdp radius). Footprints show here
// too. Centred on the Fraction Volcano zone.
export const ASH_PATCH = { center: [25, -16], radius: 16 };

export function getZone(id) {
  return WORLD_ZONES.find((z) => z.id === id) || null;
}

export function getZoneForTopic(topicId) {
  return WORLD_ZONES.find((z) => z.topicId === topicId) || null;
}

// Which zone a given interactable id belongs to (or null).
export function getZoneForNpc(npcId) {
  return WORLD_ZONES.find((z) => (z.npcIds || []).includes(npcId)) || null;
}
