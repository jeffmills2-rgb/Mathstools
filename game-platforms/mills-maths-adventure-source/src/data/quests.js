/**
 * QUESTS — data-driven quest definitions.
 *
 * A quest is "complete" once all of its `requiredEncounters` are in the
 * player's completedEncounters list. Completion is detected and rewarded
 * automatically by the progress store (see _syncQuests in progress/store.js),
 * using the pure helpers in src/quests/questEngine.js.
 *
 * Fields:
 *   id                 unique string
 *   title              short name
 *   description        what the player should do
 *   requiredEncounters encounter ids that must be completed
 *   rewards            { xp, coins } granted once when the quest completes
 *   unlock             conditions to make the quest active:
 *                        { requiredQuests: [questId, ...] }  (empty = available now)
 *
 * To add a new quest chain: add entries here and set each one's
 * unlock.requiredQuests to the previous quest's id.
 */
export const QUESTS = {
  "learn-the-basics": {
    id: "learn-the-basics",
    title: "Learn the Basics",
    description: "Complete the Integers, Fractions and Algebra challenges.",
    requiredEncounters: ["maths-integers", "maths-fractions", "maths-algebra"],
    rewards: { xp: 50, coins: 30 },
    unlock: { requiredQuests: [] }, // available from the start
  },

  // A second quest that only unlocks after the first — demonstrates chains
  // and unlock conditions.
  "island-explorer": {
    id: "island-explorer",
    title: "Island Explorer",
    description: "Say hello to Sage and find the hidden chest.",
    requiredEncounters: ["dialogue-sage", "treasure-cove"],
    rewards: { xp: 25, coins: 20 },
    unlock: { requiredQuests: ["learn-the-basics"] },
  },
};

// Look up a quest by id.
export function getQuest(id) {
  return QUESTS[id] || null;
}

// All quests as an array (handy for iteration / the DevPanel).
export function getAllQuests() {
  return Object.values(QUESTS);
}
