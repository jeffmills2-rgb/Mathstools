/**
 * SCHOOLYARD PROGRESS (W2-G) — pure key/boss logic. A student earns a "key" for
 * each non-boss staff member whose warm-up they complete; with all 8 keys the
 * Head Teacher's (Mrs. Kellahan) padlocked gate opens. Fully DERIVED from
 * completedMissions — no extra persisted state (same pattern as the island
 * unlock engine), so it always matches the save and survives a refresh.
 */
import { SCHOOLYARD_CHARACTERS, SCHOOLYARD_BOSS_ID } from "./schoolyardLayout.js";

// The eight "key" characters (everyone except the boss), in map order.
export const SCHOOLYARD_KEY_IDS = SCHOOLYARD_CHARACTERS
  .filter((c) => !c.boss)
  .map((c) => c.id);

export const SCHOOLYARD_KEY_COUNT = SCHOOLYARD_KEY_IDS.length; // 8

export function isBossCharacter(npcId) {
  return npcId === SCHOOLYARD_BOSS_ID;
}

/** Has this key-character's warm-up been completed? (a key earned) */
export function hasKey(npcId, completedMissions = []) {
  return completedMissions.includes(`warmup-${npcId}`);
}

/** How many of the 8 keys the student has earned. */
export function keysEarned(completedMissions = []) {
  return SCHOOLYARD_KEY_IDS.reduce((n, id) => n + (hasKey(id, completedMissions) ? 1 : 0), 0);
}

/** The boss gate is open once every key is earned. */
export function isBossUnlocked(completedMissions = []) {
  return keysEarned(completedMissions) >= SCHOOLYARD_KEY_COUNT;
}

/** Has the boss challenge itself been completed (the level cleared)? */
export function isBossDefeated(completedMissions = []) {
  return completedMissions.includes(`warmup-${SCHOOLYARD_BOSS_ID}`);
}
