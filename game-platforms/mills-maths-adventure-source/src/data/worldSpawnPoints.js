/**
 * WORLD SPAWN POINTS (Phase 2H) — where the player starts and the teleport
 * targets used for testing the larger map. Pure data.
 */
import { WORLD_ZONES } from "./worldZones.js";

// The student spawns at the BASE of the plaza stairs (south), so the first
// thing they do is walk up onto the raised Mission Plaza.
export const SPAWN_POINT = { x: 0, z: 20 };

// "Return to Hub" lands the player on top of the plaza, by the Mission Board.
export const HUB_POINT = { x: 0, z: 0 };

// Teleport targets: the hub plus each zone centre (for DevPanel testing and a
// "Return to Hub" option). Built from the zones so it stays in sync.
export const ZONE_TELEPORTS = WORLD_ZONES.map((z) => ({
  id: z.id,
  name: z.name,
  // Stand a little in front of the zone centre so we don't spawn inside a prop.
  x: z.center[0],
  z: z.center[1] + 3,
}));

export function getSpawnPoint() {
  return { ...SPAWN_POINT };
}
