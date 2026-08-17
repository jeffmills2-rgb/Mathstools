import { getTopics } from "../../maths/curriculum/curriculumRegistry.js";
import { SCHOOLYARD_CHARACTERS } from "./schoolyardLayout.js";

/**
 * schoolyardTopics (Phase 3J) — the schoolyard staff no longer pose fixed Stage 3
 * number-facts warm-ups; each defaults to a RANDOM Stage 4 topic.
 *
 * Behaviour (per the teacher spec):
 *   • A fresh random topic is rolled each time a NOT-yet-completed warm-up
 *     encounter starts (see interaction.js), and re-rolls again next reload.
 *   • The nine NPCs' current topics are kept DISTINCT (no two the same at once).
 *   • Once the warm-up is COMPLETE the topic is NOT re-rolled — the NPC stays in
 *     its "well done / key unlocked" state (interaction.js gates the roll on
 *     completion). Completion/keys/unlocks key off the unchanged missionId.
 *   • A teacher-set task still overrides (handled upstream in interaction.js).
 *
 * This module holds only the live assignment map + the roller; missions.js
 * applies the chosen topic to the NPC's warm-up mission.
 */
const SY_IDS = SCHOOLYARD_CHARACTERS.map((c) => c.id);

// The Stage 4 topic pool (id + display name), read from the curriculum so it
// always tracks the real topic list (14 today).
function stage4Topics() {
  return getTopics("stage4").map((t) => ({ id: t.id, name: t.name }));
}

// npcId → { id, name } currently assigned.
const current = {};

export function isSchoolyardNpc(id) {
  return SY_IDS.includes(id);
}

export function getSchoolyardTopic(id) {
  return current[id] || null;
}

/**
 * Roll a fresh random Stage 4 topic for one schoolyard NPC, kept DISTINCT from
 * the topics the other eight currently hold. Returns { id, name }.
 */
export function rollSchoolyardTopic(npcId) {
  const topics = stage4Topics();
  const usedByOthers = new Set(
    SY_IDS.filter((id) => id !== npcId && current[id]).map((id) => current[id].id)
  );
  const pool = topics.filter((t) => !usedByOthers.has(t.id));
  const list = pool.length ? pool : topics;
  const choice = list[Math.floor(Math.random() * list.length)];
  current[npcId] = choice;
  return choice;
}

// Clear all assignments (e.g. on sign-out / a fresh session) so topics re-roll.
export function clearSchoolyardTopics() {
  for (const k of Object.keys(current)) delete current[k];
}
