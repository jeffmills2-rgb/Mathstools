/**
 * MISSIONS — teacher-assigned assignment definitions (Phase 2D, LOCAL prototype).
 *
 * A "mission" is a teacher-selected slice of the curriculum that drives the
 * game instead of random maths generation. It says: from these STAGES, these
 * TOPICS and these SKILLS, ask this many questions, within this difficulty
 * range, optionally adaptive, for these rewards.
 *
 * This file is pure DATA + tiny validation helpers. It imports ONLY the
 * curriculum registry and the badge catalogue so we can validate references —
 * never React, the world, or the progress store. That keeps missions in the
 * curriculum/maths layer and lets them be tested in plain Node.
 *
 * ---------------------------------------------------------------------------
 * MISSION SHAPE
 *   {
 *     missionId:          string
 *     kind:               "story" | "teacher" | "free"   // see KIND below
 *     title:              string
 *     description:        string
 *     stages:             string[]   // one or more stage ids ("assignedStage(s)")
 *     selectedTopics:     string[]   // topic ids to draw from (within stages)
 *     selectedSkills:     string[]   // skill ids to draw from (within topics);
 *                                    //   empty = all skills of selectedTopics
 *     difficultyRange:    { min, max }   // 1..5, questions stay inside this
 *     adaptiveOn:         boolean    // use the adaptive selector inside range
 *     requiredQuestions:  number     // how many questions to complete (alias:
 *     requiredEncounters: number     //   requiredEncounters, optional)
 *     completionCriteria: { type, count }
 *                                    //   type: "answered" (default) | "correct"
 *     passThreshold:      number     // fraction (0..1) to "pass" (default 0.6)
 *     rewardXP:           number
 *     rewardCoins:        number
 *     rewardBadge:        string|null   // badgeId from src/data/badges.js
 *     teacherNotes:       string     // free text, optional
 *   }
 *
 * KIND — keeps the curated story and the flexible mission system separate:
 *   "story"   a curated MAIN_QUEST_CHAIN mission (the npc-* chains). Only these
 *             advance the main story / unlock story gates.
 *   "teacher" built by a teacher in the Mission Builder (local for now).
 *   "free"    an optional free-choice mission from the built-in library.
 * A teacher/free mission NEVER counts as a story mission, even if it shares a
 * topic or badge — the main quest checks the story mission ids, not just badges.
 *
 * ---------------------------------------------------------------------------
 * FUTURE FIREBASE-READY FIELDS (placeholders today; null/local until a real
 * teacher portal exists — no accounts, task codes or cloud saves are built yet):
 *   classCode:      string|null   // teacher's class / group code
 *   taskCode:       string|null   // short code a student types to load a task
 *   createdBy:      string|null   // teacher uid / display name
 *   topicIds:       alias of selectedTopics (kept as selectedTopics here)
 *   skillIds:       alias of selectedSkills (kept as selectedSkills here)
 *   assignedAt:     number|null   // epoch ms when assigned
 *   dueAt:          number|null   // epoch ms due date
 *   studentProgress:object|null   // per-student progress snapshot (server-side)
 *
 * A Firebase teacher portal would write this SAME shape to Firestore and the
 * game would read it — no consumer changes required. storage.js is the only
 * place that would swap localStorage for Firestore.
 * ---------------------------------------------------------------------------
 */
import {
  getStage,
  getTopic,
  getSkill,
  getTopics,
} from "../maths/curriculum/curriculumRegistry.js";
import { clampDifficulty } from "../maths/curriculum/shared/curriculumUtils.js";
import { isValidBadge } from "./badges.js";
import { SCHOOLYARD_CHARACTERS } from "./schoolyard/schoolyardLayout.js";

export const COMPLETION_TYPES = {
  ANSWERED: "answered", // finish once N questions have been ATTEMPTED
  CORRECT: "correct", // finish once N questions have been answered CORRECTLY
};

// Classroom-flow constants (Phase 2O/2P). Presets stay short; longer custom
// missions are still allowed but switch to a condensed progress display.
export const CLASSROOM_MAX_PRESET_QUESTIONS = 12; // Year 7 presets cap
export const LONG_MISSION_THRESHOLD = 15; // above this, use the condensed bar

/**
 * Normalise a partial/raw mission object (e.g. from the teacher setup panel)
 * into a complete, valid mission with safe defaults. Pure — returns a new
 * object and never throws.
 */
export function normaliseMission(raw = {}) {
  const stages = arrayOf(raw.stages?.length ? raw.stages : [raw.assignedStage]);
  const min = clampDifficulty(raw.difficultyRange?.min ?? 1);
  const maxRaw = clampDifficulty(raw.difficultyRange?.max ?? 5);
  const max = Math.max(min, maxRaw); // never let max < min
  const required = Math.max(
    1,
    Math.round(raw.requiredQuestions ?? raw.requiredEncounters ?? 10)
  );

  const missionId = raw.missionId || `mission-${Date.now().toString(36)}`;
  // KIND: explicit wins; else story for npc-* chains; else free.
  const kind = raw.kind || (String(missionId).startsWith("npc-") ? "story" : "free");
  // passThreshold is a fraction 0..1 (default 0.6 = the global pass mark).
  const ptRaw = typeof raw.passThreshold === "number" ? raw.passThreshold : 0.6;
  const passThreshold = Math.min(1, Math.max(0, ptRaw));

  return {
    missionId,
    kind,
    title: raw.title || "Untitled Mission",
    description: raw.description || "",
    stages,
    selectedTopics: arrayOf(raw.selectedTopics),
    selectedSkills: arrayOf(raw.selectedSkills),
    difficultyRange: { min, max },
    adaptiveOn: raw.adaptiveOn !== false, // default ON
    requiredQuestions: required,
    requiredEncounters: required,
    completionCriteria: {
      type: raw.completionCriteria?.type || COMPLETION_TYPES.ANSWERED,
      count: Math.max(1, Math.round(raw.completionCriteria?.count ?? required)),
    },
    passThreshold,
    rewardXP: Math.max(0, Math.round(raw.rewardXP ?? 50)),
    rewardCoins: Math.max(0, Math.round(raw.rewardCoins ?? 30)),
    rewardBadge: isValidBadge(raw.rewardBadge) ? raw.rewardBadge : null,
    teacherNotes: raw.teacherNotes || "",

    // --- Future Firebase-ready placeholders (local/null until a real portal) ---
    classCode: raw.classCode ?? null,
    taskCode: raw.taskCode ?? null,
    createdBy: raw.createdBy ?? null,
    assignedAt: raw.assignedAt ?? null,
    dueAt: raw.dueAt ?? null,
    studentProgress: raw.studentProgress ?? null,
  };
}

// Stable field list a future teacher portal / Firestore document should carry.
// Used by the system checks to confirm the local shape stays portal-ready.
export const FIREBASE_MISSION_FIELDS = [
  "missionId", "kind", "title", "stages", "selectedTopics", "selectedSkills",
  "difficultyRange", "adaptiveOn", "requiredQuestions", "passThreshold",
  "rewardXP", "rewardCoins", "rewardBadge",
  "classCode", "taskCode", "createdBy", "assignedAt", "dueAt", "studentProgress",
];

function arrayOf(v) {
  if (Array.isArray(v)) return v.filter(Boolean);
  return v ? [v] : [];
}

/**
 * Validate that a mission's stage/topic/skill references all exist in the
 * curriculum and that its difficulty range and badge are sane. Returns
 * { valid, problems: string[] }. Used by the system checks and the engine.
 */
export function validateMission(mission) {
  const problems = [];
  const m = mission || {};

  if (!m.missionId) problems.push("missing missionId");
  if (!Array.isArray(m.stages) || m.stages.length === 0) {
    problems.push("no stages");
  }

  // Stages must exist.
  for (const stageId of m.stages || []) {
    if (!getStage(stageId)) problems.push(`unknown stage: ${stageId}`);
  }

  // Each selected topic must exist in at least one of the mission's stages.
  for (const topicId of m.selectedTopics || []) {
    const found = (m.stages || []).some((s) => getTopic(s, topicId));
    if (!found) problems.push(`topic not in stages: ${topicId}`);
  }

  // Each selected skill must exist in at least one (stage, selectedTopic).
  for (const skillId of m.selectedSkills || []) {
    const found = (m.stages || []).some((s) =>
      (m.selectedTopics?.length ? m.selectedTopics : topicsOfStage(s)).some((t) =>
        getSkill(s, t, skillId)
      )
    );
    if (!found) problems.push(`skill not in topics: ${skillId}`);
  }

  // Difficulty range sane.
  const { min, max } = m.difficultyRange || {};
  if (!(min >= 1 && max <= 5 && min <= max)) {
    problems.push(`bad difficultyRange ${min}-${max}`);
  }

  // Badge (if any) must be a real badge.
  if (m.rewardBadge && !isValidBadge(m.rewardBadge)) {
    problems.push(`unknown badge: ${m.rewardBadge}`);
  }

  return { valid: problems.length === 0, problems };
}

// Small local helper so validateMission can fall back to "all topics" when a
// mission lists no explicit topics. Imported lazily to avoid a cycle warning.
function topicsOfStage(stageId) {
  const stage = getStage(stageId);
  return stage ? stage.topics.map((t) => t.id) : [];
}

/**
 * SAMPLE MISSIONS — a tiny built-in library for the prototype.
 * These prove the workflow without needing a teacher to build one by hand.
 */
export const MISSIONS = {
  "stage4-fdp-revision": normaliseMission({
    missionId: "stage4-fdp-revision",
    title: "Stage 4 FDP Revision Quest",
    description:
      "Revise fractions, decimals and percentages: simplify fractions and find percentages of a quantity.",
    stages: ["stage4"],
    selectedTopics: ["fdp"],
    selectedSkills: ["simplifyFractions", "percentageOf"],
    difficultyRange: { min: 1, max: 4 },
    adaptiveOn: true,
    requiredQuestions: 10,
    rewardXP: 80,
    rewardCoins: 40,
    rewardBadge: "fraction-explorer",
    teacherNotes: "Use before the FDP topic test.",
  }),

  "stage4-integers-warmup": normaliseMission({
    missionId: "stage4-integers-warmup",
    title: "Integer Warm-up",
    description: "A short set of integer operations to warm up.",
    stages: ["stage4"],
    selectedTopics: ["integers"],
    selectedSkills: ["mixedIntegerOperations"],
    difficultyRange: { min: 1, max: 3 },
    adaptiveOn: true,
    requiredQuestions: 5,
    rewardXP: 40,
    rewardCoins: 20,
    rewardBadge: "integer-adventurer",
  }),

  // --- NPC quest-chain missions (Phase 2G) ---
  "npc-pip-1": normaliseMission({
    missionId: "npc-pip-1", title: "Pip's Integer Trial",
    description: "Add and subtract integers to help Pip warm up.",
    stages: ["stage4"], selectedTopics: ["integers"],
    selectedSkills: ["addingIntegers", "subtractingIntegers"],
    difficultyRange: { min: 1, max: 2 }, requiredQuestions: 4,
    rewardXP: 40, rewardCoins: 20, rewardBadge: "integer-adventurer",
  }),
  "npc-pip-2": normaliseMission({
    missionId: "npc-pip-2", title: "Pip's Integer Challenge",
    description: "Mixed operations and order of operations with integers.",
    stages: ["stage4"], selectedTopics: ["integers"],
    selectedSkills: ["mixedIntegerOperations", "orderOfOperations"],
    difficultyRange: { min: 3, max: 4 }, requiredQuestions: 5,
    rewardXP: 70, rewardCoins: 35, rewardBadge: "stage4-quest-champion",
  }),
  "npc-fern-1": normaliseMission({
    missionId: "npc-fern-1", title: "Fern's Fraction Trial",
    description: "Simplify fractions and find fractions of quantities.",
    stages: ["stage4"], selectedTopics: ["fdp"],
    selectedSkills: ["simplifyFractions", "fractionOfQuantity"],
    difficultyRange: { min: 1, max: 2 }, requiredQuestions: 4,
    rewardXP: 40, rewardCoins: 20, rewardBadge: "fraction-explorer",
  }),
  "npc-fern-2": normaliseMission({
    missionId: "npc-fern-2", title: "Fern's FDP Challenge",
    description: "Conversions, percentages and discounts.",
    stages: ["stage4"], selectedTopics: ["fdp"],
    selectedSkills: ["fdpConversions", "percentageOf", "discounts"],
    difficultyRange: { min: 3, max: 4 }, requiredQuestions: 5,
    rewardXP: 70, rewardCoins: 35, rewardBadge: "stage4-quest-champion",
  }),
  "npc-alby-1": normaliseMission({
    missionId: "npc-alby-1", title: "Alby's Algebra Trial",
    description: "Simplify like terms and substitute values.",
    stages: ["stage4"], selectedTopics: ["algebra"],
    selectedSkills: ["simplifySimple", "subTwo"],
    difficultyRange: { min: 1, max: 2 }, requiredQuestions: 4,
    rewardXP: 40, rewardCoins: 20, rewardBadge: "algebra-apprentice",
  }),
  "npc-alby-2": normaliseMission({
    missionId: "npc-alby-2", title: "Alby's Algebra Challenge",
    description: "Expand brackets and write expressions.",
    stages: ["stage4"], selectedTopics: ["algebra"],
    selectedSkills: ["expandSimplify", "translateWords"],
    difficultyRange: { min: 3, max: 4 }, requiredQuestions: 5,
    rewardXP: 70, rewardCoins: 35, rewardBadge: "stage4-quest-champion",
  }),

  "stage4-mixed-challenge": normaliseMission({
    missionId: "stage4-mixed-challenge",
    title: "Stage 4 Mixed Challenge",
    description: "Algebra and FDP combined — a multi-topic Stage 4 mission.",
    stages: ["stage4"],
    selectedTopics: ["algebra", "fdp"],
    selectedSkills: [], // empty → all skills of the selected topics
    difficultyRange: { min: 2, max: 5 },
    adaptiveOn: true,
    requiredQuestions: 8,
    completionCriteria: { type: COMPLETION_TYPES.CORRECT, count: 6 },
    rewardXP: 120,
    rewardCoins: 60,
    rewardBadge: "stage4-quest-champion",
  }),

  // --- Default WARM-UP missions (sandbox model, W1-B) -----------------------
  // What a character offers when it has NO teacher task: an accessible Stage 3
  // Number Facts warm-up. XP/coins only — NO badge, and kind "free" so it never
  // progresses the campaign/story. Balanced round-robin across characters:
  //   pip → add/sub to 20, fern → multiplication facts, alby → division facts
  //   (helen/darby/elka repeat the cycle when the schoolyard lands).
  "warmup-pip": normaliseMission({
    missionId: "warmup-pip", kind: "free", title: "Pip's Number Warm-up",
    description: "A quick warm-up — addition and subtraction within 20.",
    stages: ["stage3"], selectedTopics: ["number-facts"], selectedSkills: ["addSubTo20"],
    difficultyRange: { min: 1, max: 3 }, adaptiveOn: true, requiredQuestions: 8,
    rewardXP: 30, rewardCoins: 15, rewardBadge: null,
  }),
  "warmup-fern": normaliseMission({
    missionId: "warmup-fern", kind: "free", title: "Fern's Number Warm-up",
    description: "A quick warm-up — multiplication facts (times tables 1–10).",
    stages: ["stage3"], selectedTopics: ["number-facts"], selectedSkills: ["multFacts"],
    difficultyRange: { min: 1, max: 3 }, adaptiveOn: true, requiredQuestions: 8,
    rewardXP: 30, rewardCoins: 15, rewardBadge: null,
  }),
  "warmup-alby": normaliseMission({
    missionId: "warmup-alby", kind: "free", title: "Alby's Number Warm-up",
    description: "A quick warm-up — division facts from the 1–10 tables.",
    stages: ["stage3"], selectedTopics: ["number-facts"], selectedSkills: ["divFacts"],
    difficultyRange: { min: 1, max: 3 }, adaptiveOn: true, requiredQuestions: 8,
    rewardXP: 30, rewardCoins: 15, rewardBadge: null,
  }),

};

// Generate the schoolyard characters' warm-up missions from the layout list, so
// adding/renaming a character is a one-line change (W2-F). Each is a Stage 3
// number-facts warm-up (XP/coins, no badge), kind "free".
// Schoolyard warm-ups now default to STAGE 4 topics (Phase 3J). A RANDOM topic
// is assigned to each NPC on every fresh (not-yet-completed) encounter — see
// schoolyardTopics.js + interaction.js + setSchoolyardMissionTopic below. The
// static default here is a round-robin Stage 4 topic so the mission is valid
// even before any roll (e.g. on the Mission Board); its description stays
// topic-neutral until a topic is assigned. The boss keeps her trophy reward.
const STAGE4_TOPIC_IDS = getTopics("stage4").map((t) => t.id);
SCHOOLYARD_CHARACTERS.forEach((c, i) => {
  const topicId = STAGE4_TOPIC_IDS[i % STAGE4_TOPIC_IDS.length];
  MISSIONS[`warmup-${c.id}`] = normaliseMission(c.boss ? {
    missionId: `warmup-${c.id}`, kind: "free", title: `${c.name}'s Head Teacher Challenge`,
    description: "The Head Teacher's Stage 4 challenge — earn the Schoolyard Champion trophy!",
    stages: ["stage4"], selectedTopics: [topicId], selectedSkills: [],
    difficultyRange: { min: 1, max: 5 }, adaptiveOn: true, requiredQuestions: 12,
    rewardXP: 100, rewardCoins: 60, rewardBadge: "schoolyard-champion",
  } : {
    missionId: `warmup-${c.id}`, kind: "free", title: `${c.name}'s Warm-up`,
    description: "A Stage 4 warm-up challenge!",
    stages: ["stage4"], selectedTopics: [topicId], selectedSkills: [],
    difficultyRange: { min: 1, max: 5 }, adaptiveOn: true, requiredQuestions: 8,
    rewardXP: 30, rewardCoins: 15, rewardBadge: null,
  });
});

/**
 * Point a schoolyard NPC's warm-up mission at a specific Stage 4 topic (called
 * when a fresh, not-yet-completed encounter starts — see interaction.js /
 * schoolyardTopics.js). Keeps the SAME missionId, rewards and requiredQuestions
 * (so completion, keys and unlocks are unaffected) — only the topic + difficulty
 * band + description change.
 */
export function setSchoolyardMissionTopic(npcId, topicId, topicName) {
  const m = MISSIONS[`warmup-${npcId}`];
  if (!m || !topicId) return;
  m.stages = ["stage4"];
  m.selectedTopics = [topicId];
  m.selectedSkills = [];
  m.difficultyRange = { min: 1, max: 5 };
  m.description = m.rewardBadge
    ? `The Head Teacher's Stage 4 challenge — ${topicName}!`
    : `A Stage 4 warm-up on ${topicName}.`;
}

// Round-robin default warm-up skills, in order — used to assign a balanced
// arithmetic default to each character (and future ones).
export const DEFAULT_WARMUP_SKILLS = ["addSubTo20", "multFacts", "divFacts"];

// Which warm-up mission a character offers by default (no teacher task).
export const NPC_DEFAULT_WARMUP = {
  pip: "warmup-pip",
  fern: "warmup-fern",
  alby: "warmup-alby",
  ...Object.fromEntries(SCHOOLYARD_CHARACTERS.map((c) => [c.id, `warmup-${c.id}`])),
};

// Build the Year 7 presets (normalised) as their own object so we can both add
// them to the MISSIONS registry (so getMission/activate works) and list them
// separately on the Mission Board.
function definePresets() {
  const raw = {
    "y7-integer-foundations": {
      title: "Integer Foundations",
      description: "Warm up with positive and negative integers — adding, subtracting and mixed operations.",
      stages: ["stage4"], selectedTopics: ["integers"],
      selectedSkills: ["addingIntegers", "subtractingIntegers", "mixedIntegerOperations"],
      difficultyRange: { min: 1, max: 3 }, adaptiveOn: true, requiredQuestions: 10,
    },
    "y7-fdp-check": {
      title: "Fraction, Decimal & Percentage Check",
      description: "Simplify, convert, compare and order fractions, decimals and percentages.",
      stages: ["stage4"], selectedTopics: ["fdp"],
      selectedSkills: ["simplifyFractions", "fdpConversions", "percentageOf", "compareFractions", "orderDecimals"],
      difficultyRange: { min: 1, max: 3 }, adaptiveOn: true, requiredQuestions: 10,
    },
    "y7-algebra-readiness": {
      title: "Algebra Readiness",
      description: "Algebra basics — notation, simplifying like terms and tables of values.",
      stages: ["stage4"], selectedTopics: ["algebra"],
      selectedSkills: ["introNotation", "simplifySimple", "patternTable"],
      difficultyRange: { min: 1, max: 3 }, adaptiveOn: true, requiredQuestions: 10,
    },
    "y7-area-measurement": {
      title: "Area & Measurement",
      description: "Find the area of rectangles, triangles and composite shapes using diagrams.",
      stages: ["stage4"], selectedTopics: ["area"], selectedSkills: [],
      difficultyRange: { min: 1, max: 3 }, adaptiveOn: true, requiredQuestions: 10,
    },
    "y7-mixed-review": {
      title: "Mixed Year 7 Review",
      description: "A balanced review across Integers, FDP, Algebra and Area.",
      stages: ["stage4"], selectedTopics: ["integers", "fdp", "algebra", "area"], selectedSkills: [],
      difficultyRange: { min: 1, max: 3 }, adaptiveOn: true, requiredQuestions: 12,
    },
    "y7-pythagoras-extension": {
      title: "Pythagoras Extension",
      description: "Extension: squares, square roots and finding the hypotenuse with Pythagoras.",
      stages: ["stage4"], selectedTopics: ["pythagoras"],
      selectedSkills: ["pythagoras-squares", "pythagoras-square-roots", "pythagoras-hypotenuse"],
      difficultyRange: { min: 1, max: 3 }, adaptiveOn: true, requiredQuestions: 10,
      isExtension: true,
    },
  };
  const out = {};
  for (const [id, def] of Object.entries(raw)) {
    out[id] = normaliseMission({
      missionId: id, kind: "preset",
      rewardXP: 60, rewardCoins: 30, rewardBadge: null,
      createdBy: "year7-pilot",
      ...def,
    });
    out[id].isExtension = Boolean(def.isExtension);
  }
  return out;
}
const PRESET_DEFS = definePresets();

// The Year 7 preset missions (for the Mission Board's "Year 7 Missions" section).
export function getPresetMissions() {
  return Object.values(PRESET_DEFS);
}

// Is a mission id one of the Year 7 presets?
export function isPresetMission(missionId) {
  return Object.prototype.hasOwnProperty.call(PRESET_DEFS, missionId);
}

// --- Runtime (teacher-assigned) missions ----------------------------------
// Teacher tasks are fetched from Firestore at sign-in and registered here so
// the EXISTING mission flow (activateMission → getMission → engine) works for
// them unchanged. Kept in a separate mutable map so the built-in catalogue is
// never mutated; cleared on sign-out. Pure module — no imports added.
const RUNTIME_MISSIONS = {};

/** Register normalised teacher missions for this session. Replaces the set. */
export function setRuntimeMissions(list = []) {
  for (const k of Object.keys(RUNTIME_MISSIONS)) delete RUNTIME_MISSIONS[k];
  for (const raw of list) {
    const m = normaliseMission({ ...raw, kind: "teacher" });
    RUNTIME_MISSIONS[m.missionId] = m;
  }
  return Object.values(RUNTIME_MISSIONS);
}

/** Clear all runtime teacher missions (on sign-out / session clear). */
export function clearRuntimeMissions() {
  for (const k of Object.keys(RUNTIME_MISSIONS)) delete RUNTIME_MISSIONS[k];
}

// Look up a mission by id (built-in registry → Year 7 presets → runtime teacher
// missions, so activateMission / results work for all of them).
export function getMission(missionId) {
  return MISSIONS[missionId] || PRESET_DEFS[missionId] || RUNTIME_MISSIONS[missionId] || null;
}

// All sample + preset missions as an array (handy for the teacher panel /
// DevPanel / checks). The Mission Board lists presets in their own section.
export function getAllMissions() {
  return [...Object.values(MISSIONS), ...Object.values(PRESET_DEFS)];
}
