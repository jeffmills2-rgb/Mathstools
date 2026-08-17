/**
 * REGIONS (Workstream 2, W2-A) — the world is now REGION-AWARE.
 *
 * Each region is a self-contained place the player can be in: its own spawn,
 * walkable bounds, and ground/ocean geometry. The renderer (World.jsx) and the
 * Player read the ACTIVE region (session store `currentRegionId`), so adding a
 * second region (the Schoolyard) is additive — island-1 is wrapped here UNCHANGED
 * so nothing visible differs until a second region ships.
 *
 * Pure data + a pure clamp helper. Imports only other data modules.
 *
 *   id          unique region id
 *   name        display name
 *   spawn       { x, z } where the player arrives
 *   bounds      walkable limit — { shape:"circle", radius, center? }
 *                                | { shape:"rect", width, height, center? }
 *   geometry    ground/ocean sizes + colours for the renderer
 */
import { WALKABLE_RADIUS, OCEAN_RADIUS } from "./worldZones.js";
import { SPAWN_POINT } from "./worldSpawnPoints.js";
import { SCHOOLYARD_BOUNDS, SCHOOLYARD_SPAWN } from "./schoolyard/schoolyardLayout.js";
import { schoolyardGroundHeight } from "./schoolyard/schoolyardTerrain.js";
import { FARM_BOUNDS, FARM_SPAWN, FARM_RETURN_PORTAL } from "./farm/farmLayout.js";
import { SNOW_BOUNDS, SNOW_SPAWN, SNOW_RETURN_PORTAL, snowGroundHeight } from "./snow/snowLayout.js";
import {
  CABIN_BOUNDS, CABIN_SPAWN, CABIN_DOOR, LODGE_DOOR_SNOW,
  CABIN_ARRIVE_FROM_SNOW, SNOW_ARRIVE_FROM_CABIN,
} from "./cabin/cabinLayout.js";

export const DEFAULT_REGION_ID = "island-1";

export const REGIONS = {
  "island-1": {
    id: "island-1",
    name: "Number Island",
    spawn: { x: SPAWN_POINT.x, z: SPAWN_POINT.z },
    bounds: { shape: "circle", radius: WALKABLE_RADIUS },
    geometry: {
      walkableRadius: WALKABLE_RADIUS,
      oceanRadius: OCEAN_RADIUS,
      grassColor: "#90cf6f",
      beachColor: "#ffe5a3",
      oceanColor: "#4cc9f0",
      skyColor: "#bde0fe",
    },
    // Teleport Gate — in Champion's Grove (north), the end-of-island reward that
    // travels you onward to the SchoolYard (W6-B). Walk into it to travel.
    portals: [
      { id: "island-to-schoolyard", position: [0, -32], radius: 2.0, rotationY: 0, target: "schoolyard", label: "Retrieval Practice Playground", lock: "playground" },
      // Farm Gate — out on the WESTERN coastline, about halfway between Mills and
      // its previous spot (same latitude as Mills), well clear of Integer Dunes
      // so nothing overlaps. rotationY faces the gate back toward the map centre.
      // Rendered as a stacked-haybale gate with waving grass + a bright-yellow
      // portal swirl (variant "haybale").
      { id: "island-to-farm", position: [-32, 16], radius: 2.0, rotationY: Math.atan2(32, -16), target: "farm-parts-whole", label: "Fraction Farm", variant: "haybale" },
      // Snowball Sums gate — an IGLOO on the Integer Dunes snow patch, just
      // EAST of the dunes (between Pip's clearing and the Retrieval Practice
      // Playground portal), so it sits naturally on the existing snow.
      // rotationY faces the doorway back toward the map centre.
      { id: "island-to-snow", position: [-14, -25], radius: 2.0, rotationY: Math.atan2(14, 25), target: "snow-sums", label: "Snowball Sums", variant: "igloo" },
    ],
  },

  // The Schoolyard (W2) — a flat, rectangular second region rendered by
  // SchoolyardScenery.jsx. `flatGround` tells the Player to use height 0 here
  // (island-1's plateau/stairs don't apply). Reached via the Teleport Gate (W2-C).
  "schoolyard": {
    id: "schoolyard",
    name: "Retrieval Practice Playground",
    spawn: { x: SCHOOLYARD_SPAWN.x, z: SCHOOLYARD_SPAWN.z },
    bounds: SCHOOLYARD_BOUNDS,
    // Terraced ground (three tiers + central stairs). Player/Interactables read
    // this instead of island-1's plateau/stairs.
    groundHeight: schoolyardGroundHeight,
    geometry: {
      // Ground is drawn by SchoolyardScenery; only skyColor is used by World.
      skyColor: "#cfe8ff",
      grassColor: "#717a85",
      beachColor: "#717a85",
      oceanColor: "#717a85",
      walkableRadius: 30,
      oceanRadius: 40,
    },
    // Return Teleport Gate → back to the island. On the front tier's east edge,
    // clear of the trees/NPCs/planters (moved anticlockwise off the corner tree).
    portals: [
      { id: "schoolyard-to-island", position: [34, 12], radius: 2.0, rotationY: -Math.PI / 2, target: "island-1", label: "Number Island" },
    ],
  },

  // Parts of a Whole Farm (F1) — a LARGE, flat farming region rendered by
  // FarmScenery.jsx: paddocks (kept empty for future Meshy animals), a barn,
  // crops, a pond — and the in-world CHALLENGE FENCE (fractions of a length).
  // Reached via the Farm Gate behind the island spawn point.
  "farm-parts-whole": {
    id: "farm-parts-whole",
    name: "Fraction Farm",
    spawn: { x: FARM_SPAWN.x, z: FARM_SPAWN.z },
    bounds: FARM_BOUNDS,
    groundHeight: () => 0, // flat farmland (island plateau/stairs don't apply)
    geometry: {
      // Ground is drawn by FarmScenery; only skyColor is used by World.
      // Warm peach horizon = the farm's LATE-AFTERNOON light (fog matches,
      // so the rolling hills haze into a golden distance).
      skyColor: "#f6d9a8",
      grassColor: "#8ecf6a",
      beachColor: "#8ecf6a",
      oceanColor: "#8ecf6a",
      walkableRadius: 60,
      oceanRadius: 70,
    },
    portals: [
      { id: "farm-to-island", position: FARM_RETURN_PORTAL, radius: 2.0, rotationY: Math.PI, target: "island-1", label: "Number Island" },
    ],
  },

  // Snowball Sums (S1) — a LARGE, flat TWILIGHT snow world (same dimensions
  // as Fraction Farm) rendered by SnowScenery.jsx: aurora overhead, snowmen,
  // Christmas trees, waddling penguins, an ice rink with real slide physics,
  // and TEN reserved in-world challenge areas. Reached via the igloo gate
  // east of Integer Dunes.
  "snow-sums": {
    id: "snow-sums",
    name: "Snowball Sums",
    spawn: { x: SNOW_SPAWN.x, z: SNOW_SPAWN.z },
    bounds: SNOW_BOUNDS,
    // Flat snowfield EXCEPT the sledding hill in the NE corner (SL) — the
    // bump falls back to zero before every edge, so everywhere else stays 0.
    groundHeight: (x, z) => snowGroundHeight(x, z),
    geometry: {
      // Ground is drawn by SnowScenery; only skyColor is used by World.
      // Dusky indigo horizon = the snow world's TWILIGHT (fog matches, so the
      // peaks + distant trees haze into a purple-blue distance under the aurora).
      skyColor: "#3a3f6b",
      grassColor: "#e8eef8",
      beachColor: "#e8eef8",
      oceanColor: "#e8eef8",
      walkableRadius: 60,
      oceanRadius: 70,
    },
    portals: [
      { id: "snow-to-island", position: SNOW_RETURN_PORTAL, radius: 2.0, rotationY: Math.PI, target: "island-1", label: "Number Island" },
      // The lodge's AJAR front door → the Lodge Interior (CB). The door
      // visual lives on the lodge (SnowScenery LodgeDoor) — variant
      // "cabindoor" renders NO portal swirl. Door-to-door travel: `arrive`
      // puts the traveller just inside the matching doorway.
      {
        id: "snow-to-cabin", position: LODGE_DOOR_SNOW.position, radius: LODGE_DOOR_SNOW.radius,
        rotationY: 0, target: "cabin", label: "The Lodge", variant: "cabindoor",
        arrive: CABIN_ARRIVE_FROM_SNOW,
      },
    ],
  },

  // --- THE LODGE INTERIOR (CB) — the FIFTH region: the warm inside of the
  // ski lodge, entered through the lodge's ajar front door in Snowball Sums.
  // A large log-cabin great room (fireplace, tables, bookshelves, windows)
  // with a separate bedroom, rendered by CabinScenery.jsx. Pip hosts
  // fireside addition by the hearth.
  "cabin": {
    id: "cabin",
    name: "The Lodge",
    spawn: { x: CABIN_SPAWN.x, z: CABIN_SPAWN.z },
    bounds: CABIN_BOUNDS,
    groundHeight: () => 0, // plank floor
    geometry: {
      // Interior: a deep warm brown "sky" — the rafters lost in shadow
      // above the open-top dollhouse view (fog matches, so the room's
      // corners fall away into warm darkness).
      skyColor: "#241a12",
      grassColor: "#5a4630",
      beachColor: "#5a4630",
      oceanColor: "#5a4630",
      walkableRadius: 40,
      oceanRadius: 50,
    },
    portals: [
      // The south door back out to the snow (its twin ajar door).
      {
        id: "cabin-to-snow", position: CABIN_DOOR.position, radius: CABIN_DOOR.radius,
        rotationY: Math.PI, target: "snow-sums", label: "Snowball Sums", variant: "cabindoor",
        arrive: SNOW_ARRIVE_FROM_CABIN,
      },
    ],
  },
};

export function getRegion(id) {
  return REGIONS[id] || REGIONS[DEFAULT_REGION_ID];
}

export function getAllRegions() {
  return Object.values(REGIONS);
}

/**
 * Clamp a point (x, z) to a region's walkable bounds. Supports a centred circle
 * (island-1) or an axis-aligned rectangle (the Schoolyard). Pure — returns a new
 * { x, z }. Falls back to a generous circle if bounds are missing/unknown.
 */
export function clampToBounds(x, z, bounds) {
  if (!bounds) return { x, z };
  const cx = (bounds.center && bounds.center[0]) || 0;
  const cz = (bounds.center && bounds.center[1]) || 0;

  if (bounds.shape === "rect") {
    const hw = (bounds.width || 0) / 2;
    const hh = (bounds.height || 0) / 2;
    return {
      x: Math.max(cx - hw, Math.min(cx + hw, x)),
      z: Math.max(cz - hh, Math.min(cz + hh, z)),
    };
  }

  // Default: circle.
  const r = bounds.radius || WALKABLE_RADIUS;
  const dx = x - cx;
  const dz = z - cz;
  const dist = Math.hypot(dx, dz);
  if (dist > r) return { x: cx + (dx / dist) * r, z: cz + (dz / dist) * r };
  return { x, z };
}
