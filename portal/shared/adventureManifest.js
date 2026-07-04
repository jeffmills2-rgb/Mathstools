/**
 * MMT Platform — Adventure curriculum manifest (Phase 4B, teacher tasks).
 *
 * A SMALL static mirror of the game's Stage 4 curriculum tree, just enough for
 * the Teacher Platform's "Set Adventure Task" form to offer real stage/topic ids
 * without bundling the game source. The game still validates every assignment on
 * read via normaliseMission/validateMission, so this is a UI convenience only.
 *
 * Keep the topic ids IDENTICAL to src/maths/curriculum/stage4/index.js. If the
 * game adds stages/topics, mirror them here (or export this file from the build).
 */

// The characters that can deliver a task — island (Pip/Fern/Alby) + the nine
// schoolyard staff. defaultTopic just pre-selects the form; off-theme is fine.
export const ADVENTURE_NPCS = [
  { id: "pip",  name: "Pip",  defaultTopic: "integers" },
  { id: "fern", name: "Fern", defaultTopic: "fdp" },
  { id: "alby", name: "Alby", defaultTopic: "algebra" },
  { id: "pearce",   name: "Mr. Pearce (Schoolyard)",   defaultTopic: "area" },
  { id: "mahoney",  name: "Ms. Mahoney (Schoolyard)",  defaultTopic: "pythagoras" },
  { id: "ewings",   name: "Ms. Ewings (Schoolyard)",   defaultTopic: "algebra" },
  { id: "kellahan", name: "Mrs. Kellahan (Schoolyard)", defaultTopic: "area" },
  { id: "dawson",   name: "Mr. Dawson (Schoolyard)",   defaultTopic: "pythagoras" },
  { id: "heywood",  name: "Mr. Heywood (Schoolyard)",  defaultTopic: "algebra" },
  { id: "morgan",   name: "Mr. Morgan (Schoolyard)",   defaultTopic: "area" },
  { id: "bacon",    name: "Mrs. Bacon (Schoolyard)",   defaultTopic: "pythagoras" },
  { id: "brookes",  name: "Ms. Brookes (Schoolyard)",  defaultTopic: "algebra" },
];

// Stage → topics (ids mirror the game curriculum exactly).
export const ADVENTURE_STAGES = [
  {
    id: "stage4",
    name: "Stage 4",
    topics: [
      { id: "integers",   name: "Integers" },
      { id: "fdp",        name: "Fractions, Decimals & Percentages" },
      { id: "algebra",    name: "Algebraic Techniques" },
      { id: "area",       name: "Area" },
      { id: "pythagoras", name: "Pythagoras" },
    ],
  },
];

// Badges a teacher task can award on completion ("get to the end" → trophy).
// Mirror of the game's badge catalogue (src/data/badges.js). Keep ids identical.
export const ADVENTURE_BADGES = [
  { id: "integer-adventurer", name: "Integer Adventurer", icon: "➕" },
  { id: "fraction-explorer", name: "Fraction Explorer", icon: "🍰" },
  { id: "algebra-apprentice", name: "Algebra Apprentice", icon: "🧮" },
  { id: "stage4-quest-champion", name: "Quest Champion (trophy)", icon: "🏆" },
];

export function getStageTopics(stageId) {
  const s = ADVENTURE_STAGES.find((x) => x.id === stageId);
  return s ? s.topics : [];
}

export function npcDefaultTopic(npcId) {
  const n = ADVENTURE_NPCS.find((x) => x.id === npcId);
  return n ? n.defaultTopic : null;
}
