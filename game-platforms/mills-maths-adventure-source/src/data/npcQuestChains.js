/**
 * NPC QUEST CHAINS (sandbox model, W1-B).
 *
 * Two layers now:
 *   - NPC_QUEST_CHAINS — the DEFAULT free-play chain per character: an accessible
 *     Stage 3 arithmetic WARM-UP (XP/coins only, NO badge). This is what a
 *     character offers when it has no teacher task, so free-play never gets stuck.
 *   - CAMPAIGN_CHAINS — the curated integers/FDP/algebra STORY (badges → gates →
 *     Champion). Preserved and REPURPOSED: no longer the free-play default; it is
 *     the teacher-driven / campaign layer (surfaced via teacher tasks or a future
 *     "get to the end" campaign). Its missions/badges/gates stay wired.
 *
 * Data only — the pure resolver lives in src/systems/unlockEngine.js
 * (resolveChainStep / getNpcAction).
 *
 *   npcId               the interactable id
 *   topicId             curriculum topic
 *   completionEncounter dialogue shown once every step is complete
 *   steps[]             { id, missionId, label, intro }
 */

import { SCHOOLYARD_CHARACTERS } from "./schoolyard/schoolyardLayout.js";

// The DEFAULT free-play chains: one arithmetic warm-up step per character,
// balanced round-robin (see NPC_DEFAULT_WARMUP in missions.js).
export const NPC_QUEST_CHAINS = {
  pip: {
    npcId: "pip",
    topicId: "number-facts",
    completionEncounter: "pip-complete",
    steps: [
      { id: "pip-warmup", missionId: "warmup-pip", label: "Pip's Number Warm-up",
        intro: "Pip wants a quick number warm-up — addition and subtraction!" },
    ],
  },
  fern: {
    npcId: "fern",
    topicId: "number-facts",
    completionEncounter: "fern-complete",
    steps: [
      { id: "fern-warmup", missionId: "warmup-fern", label: "Fern's Number Warm-up",
        intro: "Fern wants to warm up with some multiplication facts!" },
    ],
  },
  alby: {
    npcId: "alby",
    topicId: "number-facts",
    completionEncounter: "alby-complete",
    steps: [
      { id: "alby-warmup", missionId: "warmup-alby", label: "Alby's Number Warm-up",
        intro: "Alby wants to warm up with some division facts!" },
    ],
  },
};

// Generate the schoolyard characters' default warm-up chains from the layout
// list (W2-F) — one step each, pointing at their generated warm-up mission. The
// warm-up now poses a RANDOM Stage 4 topic (Phase 3J), so the wording is
// topic-neutral; the actual topic is chosen at encounter time.
for (const c of SCHOOLYARD_CHARACTERS) {
  NPC_QUEST_CHAINS[c.id] = {
    npcId: c.id,
    topicId: "stage4",
    completionEncounter: `${c.id}-complete`,
    steps: [
      { id: `${c.id}-warmup`, missionId: `warmup-${c.id}`, label: `${c.name}'s Warm-up`,
        intro: `${c.name} has a quick Stage 4 warm-up for you!` },
    ],
  };
}

// The curated STORY chains (integers/FDP/algebra). Repurposed as the campaign /
// teacher-driven layer — NOT the free-play default. Kept intact so the badges,
// gates, main quest and a future campaign trigger all still resolve.
export const CAMPAIGN_CHAINS = {
  pip: {
    npcId: "pip",
    topicId: "integers",
    completionEncounter: "pip-complete",
    steps: [
      { id: "pip-1", missionId: "npc-pip-1", label: "Pip's Integer Trial",
        intro: "Pip needs help warming up with some integers!" },
      { id: "pip-2", missionId: "npc-pip-2", label: "Pip's Integer Challenge",
        intro: "Great work! Pip has a tougher integer challenge for you." },
    ],
  },
  fern: {
    npcId: "fern",
    topicId: "fdp",
    completionEncounter: "fern-complete",
    steps: [
      { id: "fern-1", missionId: "npc-fern-1", label: "Fern's Fraction Trial",
        intro: "Fern wants to practise fractions, decimals and percentages." },
      { id: "fern-2", missionId: "npc-fern-2", label: "Fern's FDP Challenge",
        intro: "Nicely done! Fern has a trickier FDP challenge ready." },
    ],
  },
  alby: {
    npcId: "alby",
    topicId: "algebra",
    completionEncounter: "alby-complete",
    steps: [
      { id: "alby-1", missionId: "npc-alby-1", label: "Alby's Algebra Trial",
        intro: "Alby would like to explore algebraic techniques." },
      { id: "alby-2", missionId: "npc-alby-2", label: "Alby's Algebra Challenge",
        intro: "Excellent! Alby has a harder algebra challenge for you." },
    ],
  },
};

// --- Runtime teacher-task overlay ------------------------------------------
// Teacher-assigned tasks, grouped by npcId, fetched at sign-in. They are
// PREPENDED to an NPC's chain so an incomplete task surfaces even when the
// default warm-up is already complete (a returning student still sees a new
// task). Each task becomes a chain step pointing at its assignment mission id.
// Cleared on sign-out.
const RUNTIME_ASSIGNMENTS = {}; // { [npcId]: assignment[] }

/** Set the teacher tasks for this session. `byNpc` = { pip:[...], ... }. */
export function setRuntimeAssignments(byNpc = {}) {
  for (const k of Object.keys(RUNTIME_ASSIGNMENTS)) delete RUNTIME_ASSIGNMENTS[k];
  for (const [npcId, list] of Object.entries(byNpc)) {
    if (Array.isArray(list) && list.length) RUNTIME_ASSIGNMENTS[npcId] = list;
  }
}

export function clearRuntimeAssignments() {
  for (const k of Object.keys(RUNTIME_ASSIGNMENTS)) delete RUNTIME_ASSIGNMENTS[k];
}

// Turn a teacher assignment into a chain step. `teacher:true` lets the dialogue
// show a generic intro (important when the task is off-theme for this NPC).
function assignmentStep(a) {
  return {
    id: a.assignmentId,
    missionId: a.assignmentId,
    label: a.title || "Teacher task",
    intro: a.description || "Your teacher set this task.",
    teacher: true,
  };
}

/**
 * The EFFECTIVE default chain for an NPC: any teacher tasks first, then the
 * default warm-up step. Returns null only if the NPC has neither. The base
 * chain's topicId / completionEncounter are preserved for the warm-up tail.
 */
export function getChain(npcId) {
  const base = NPC_QUEST_CHAINS[npcId] || null;
  const tasks = RUNTIME_ASSIGNMENTS[npcId] || [];
  if (!tasks.length) return base;
  const teacherSteps = tasks.map(assignmentStep);
  if (!base) {
    return { npcId, topicId: null, completionEncounter: null, steps: teacherSteps };
  }
  return { ...base, steps: [...teacherSteps, ...base.steps] };
}

export function getAllChains() {
  return Object.values(NPC_QUEST_CHAINS);
}

// The curated campaign (story) chain for an NPC, or null. Used by the
// teacher-driven / campaign layer and by mission routing/guidance.
export function getCampaignChain(npcId) {
  return CAMPAIGN_CHAINS[npcId] || null;
}

/**
 * Find the NPC chain (and step) that owns a given mission id, searching BOTH the
 * default warm-up chains and the campaign chains, or null if the mission isn't
 * part of any NPC chain (i.e. a free-choice board mission).
 */
export function getChainForMission(missionId) {
  for (const chain of [...Object.values(NPC_QUEST_CHAINS), ...Object.values(CAMPAIGN_CHAINS)]) {
    const step = chain.steps.find((s) => s.missionId === missionId);
    if (step) return { npcId: chain.npcId, chain, step };
  }
  return null;
}
