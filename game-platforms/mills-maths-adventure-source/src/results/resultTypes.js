/**
 * RESULT TYPES (Phase 2L) — the LOCAL attempt/result record shape + helpers.
 *
 * A "result" is one completed mission/challenge attempt. Records are stored
 * LOCALLY (localStorage via resultStore.js) — there is NO Firebase, no login, no
 * class/task codes (only documented placeholders). The shape is deliberately
 * aligned with a future Firestore document so the cloud move is a storage swap.
 *
 * Pure data + helpers. No React, no stores, no DOM.
 */

export const MISSION_KINDS = Object.freeze({
  STORY: "story",
  TEACHER: "teacher",
  FREE: "free",
  PRESET: "preset", // a Year 7 classroom preset (Phase 2O) — teacher-style, never story
  PRACTICE: "practice", // a non-mission challenge (e.g. an NPC/area challenge)
});

export const ATTEMPT_STATUS = Object.freeze({
  COMPLETED: "completed", // passed (≥ threshold) — mission rewards granted
  FAILED: "failed", // finished but below the pass threshold
  ABANDONED: "abandoned", // (reserved) left mid-attempt — not saved yet
});

// Topic/skill mastery status labels (PART 4).
export const MASTERY = Object.freeze({
  NONE: "Not attempted",
  NEEDS: "Needs practice",
  DEVELOPING: "Developing",
  SECURE: "Secure",
});

/** Status from an average percentage + attempt count (PART 4 rule). */
export function statusForAverage(avgPercent, attempts) {
  if (!attempts) return MASTERY.NONE;
  if (avgPercent < 50) return MASTERY.NEEDS;
  if (avgPercent < 80) return MASTERY.DEVELOPING;
  return MASTERY.SECURE;
}

// The local attempt record fields (used by checks + the DevPanel).
export const RESULT_RECORD_FIELDS = [
  "attemptId", "missionId", "missionKind", "missionTitle", "studentName",
  "stage", "topicIds", "topicNames", "skillIds", "skillNames",
  "difficultyRange", "adaptiveOn", "passThreshold", "questionCount",
  "correctCount", "percentage", "passed", "status",
  "startedAt", "completedAt", "durationSeconds",
  "xpAwarded", "coinsAwarded", "badgeAwarded", "routedTarget", "source",
  "classCode", "taskCode", "taskId", "studentCode", "createdBy", "questionResults",
];

export const QUESTION_RESULT_FIELDS = [
  "questionId", "text", "topicId", "skillId", "difficultyLevel",
  "requestedDifficultyLevel", "actualDifficultyLevel", "answerMode",
  "studentAnswer", "expectedAnswer", "acceptableAnswers", "correct",
  "partResults", "diagramType", "legacyType", "sourceType", "feedback",
];

/**
 * FUTURE FIREBASE/Firestore result document shape (documented, not implemented).
 * A cloud teacher dashboard would read/write THIS shape; the local record maps
 * onto it directly (topicBreakdown/skillBreakdown/answerModeResults are derived
 * by resultUtils from the stored attempts + questionResults).
 */
export const FIREBASE_RESULT_FIELDS = [
  "attemptId", "missionId", "taskCode", "classCode", "studentCode",
  "studentName", "startedAt", "completedAt", "score", "percentage", "passed",
  "topicBreakdown", "skillBreakdown", "questionResults", "answerModeResults",
  "createdAt", "updatedAt",
];

let _seq = 0;
export function makeAttemptId() {
  _seq += 1;
  return `attempt-${Date.now().toString(36)}-${_seq.toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function arr(v) {
  return Array.isArray(v) ? v.filter((x) => x != null) : v != null ? [v] : [];
}
function num(v, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

/** Normalise one question-level result, tolerating missing fields. */
export function normaliseQuestionResult(raw = {}) {
  return {
    questionId: raw.questionId || null,
    text: raw.text || "",
    topicId: raw.topicId || null,
    skillId: raw.skillId || null,
    difficultyLevel: raw.difficultyLevel ?? null,
    requestedDifficultyLevel: raw.requestedDifficultyLevel ?? null,
    actualDifficultyLevel: raw.actualDifficultyLevel ?? null,
    answerMode: raw.answerMode || "simple",
    studentAnswer: raw.studentAnswer == null ? "" : String(raw.studentAnswer),
    expectedAnswer: raw.expectedAnswer == null ? "" : String(raw.expectedAnswer),
    acceptableAnswers: arr(raw.acceptableAnswers).map(String),
    correct: Boolean(raw.correct),
    partResults: Array.isArray(raw.partResults) ? raw.partResults.map(Boolean) : null,
    diagramType: raw.diagramType || null,
    legacyType: raw.legacyType || null,
    sourceType: raw.sourceType || null,
    feedback: raw.feedback || "",
  };
}

/**
 * Normalise a raw attempt into a complete, safe result record. Computes
 * percentage/passed/status if not given, fills placeholders, and never throws.
 */
export function normaliseResult(raw = {}) {
  const questionCount = Math.max(0, num(raw.questionCount, arr(raw.questionResults).length));
  const correctCount = Math.max(0, num(raw.correctCount));
  const percentage = raw.percentage != null
    ? num(raw.percentage)
    : questionCount > 0 ? Math.round((correctCount / questionCount) * 100) : 0;
  const passThreshold = raw.passThreshold != null ? num(raw.passThreshold, 0.6) : 0.6;
  const passed = raw.passed != null ? Boolean(raw.passed) : percentage >= passThreshold * 100;
  const status = raw.status || (passed ? ATTEMPT_STATUS.COMPLETED : ATTEMPT_STATUS.FAILED);
  const startedAt = num(raw.startedAt, Date.now());
  const completedAt = num(raw.completedAt, Date.now());

  return {
    attemptId: raw.attemptId || makeAttemptId(),
    missionId: raw.missionId || null,
    missionKind: raw.missionKind || MISSION_KINDS.PRACTICE,
    missionTitle: raw.missionTitle || "Challenge",
    studentName: raw.studentName || "Explorer",
    stage: raw.stage || null,
    topicIds: arr(raw.topicIds),
    topicNames: arr(raw.topicNames),
    skillIds: arr(raw.skillIds),
    skillNames: arr(raw.skillNames),
    difficultyRange: raw.difficultyRange || null,
    adaptiveOn: Boolean(raw.adaptiveOn),
    passThreshold,
    questionCount,
    correctCount,
    percentage,
    passed,
    status,
    startedAt,
    completedAt,
    durationSeconds: raw.durationSeconds != null
      ? num(raw.durationSeconds)
      : Math.max(0, Math.round((completedAt - startedAt) / 1000)),
    xpAwarded: num(raw.xpAwarded),
    coinsAwarded: num(raw.coinsAwarded),
    badgeAwarded: raw.badgeAwarded || null,
    routedTarget: raw.routedTarget || null,
    source: "local",
    // Documented placeholders for a future teacher portal (null locally).
    classCode: raw.classCode ?? null,
    taskCode: raw.taskCode ?? null,
    taskId: raw.taskId ?? null,
    studentCode: raw.studentCode ?? null,
    createdBy: raw.createdBy ?? null,
    questionResults: arr(raw.questionResults).map(normaliseQuestionResult),
  };
}

/** Validate a record carries the required fields + sane numbers. */
export function validateResult(r) {
  const problems = [];
  if (!r || typeof r !== "object") return { valid: false, problems: ["not an object"] };
  for (const f of ["attemptId", "missionKind", "questionCount", "correctCount", "percentage", "passed", "status"]) {
    if (!(f in r)) problems.push(`missing ${f}`);
  }
  if (r.correctCount > r.questionCount) problems.push("correctCount > questionCount");
  if (r.percentage < 0 || r.percentage > 100) problems.push("percentage out of range");
  if (!Array.isArray(r.questionResults)) problems.push("questionResults not an array");
  return { valid: problems.length === 0, problems };
}
