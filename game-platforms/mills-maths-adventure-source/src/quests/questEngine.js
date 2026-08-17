/**
 * QUEST ENGINE — pure logic, no React and no storage.
 *
 * These helpers answer questions about a quest given a snapshot of progress
 * ({ completedEncounters, completedQuests }). The progress store uses them to
 * decide when to mark quests complete; the UI uses them to show quest state.
 *
 * Keeping this pure makes it trivial to unit-test and reuse.
 */

// Has the player met a quest's unlock conditions?
export function isQuestUnlocked(quest, progress) {
  const required = quest.unlock?.requiredQuests ?? [];
  return required.every((qid) => progress.completedQuests.includes(qid));
}

// Have all of a quest's required encounters been completed?
export function areRequirementsMet(quest, progress) {
  return quest.requiredEncounters.every((eid) =>
    progress.completedEncounters.includes(eid)
  );
}

// One of: "completed" | "active" | "locked".
export function getQuestStatus(quest, progress) {
  if (progress.completedQuests.includes(quest.id)) return "completed";
  if (!isQuestUnlocked(quest, progress)) return "locked";
  return "active";
}

// How many required encounters are done (for progress display).
export function questProgress(quest, progress) {
  const done = quest.requiredEncounters.filter((eid) =>
    progress.completedEncounters.includes(eid)
  ).length;
  return { done, total: quest.requiredEncounters.length };
}

// A quest should be auto-completed when it's active, unlocked and all its
// required encounters are done (and it isn't already complete).
export function shouldComplete(quest, progress) {
  return (
    !progress.completedQuests.includes(quest.id) &&
    isQuestUnlocked(quest, progress) &&
    areRequirementsMet(quest, progress)
  );
}
