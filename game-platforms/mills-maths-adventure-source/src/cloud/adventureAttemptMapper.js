/**
 * ADVENTURE ATTEMPT MAPPER (Phase 3B) — PURE transforms from a LOCAL result
 * record (src/results/resultTypes.js) into the two cloud documents:
 *   - a COMPACT `achievements` record (existing MMT dashboards compatibility), and
 *   - a RICH `adventureAttempts` record (Adventure teacher reporting later).
 *
 * Pure: imports NOTHING (no Firebase, no React, no stores). Fully testable in
 * Node. The cloud writer injects the server timestamp at write time.
 *
 * PRIVACY (explicit Phase 3B decision): typed student answers are NEVER written
 * to Firebase. `stripTypedAnswers` drops `studentAnswer` from every question and
 * keeps only correctness + safe snapshots (prompt, expected, metadata). To change
 * this later, add an explicit class/task opt-in flag — do not strip silently.
 */

// Adventure topic id → the topic NAME used by the existing MMT dashboards
// (`masteryTopic` / `topic`). Keep these aligned with the platform's wording.
export const MMT_TOPIC_NAMES = {
  integers: "Integers",
  fdp: "Fractions, Decimals & Percentages",
  algebra: "Algebraic Techniques",
  area: "Area",
  pythagoras: "Pythagoras",
};

export const ADVENTURE_ATTEMPT_SCHEMA_VERSION = 1;
export const ADVENTURE_SOURCE = "mills-maths-adventure";

function iso(ms) {
  const n = Number(ms);
  return Number.isFinite(n) && n > 0 ? new Date(n).toISOString() : new Date().toISOString();
}

function fullName(p = {}) {
  return p.name || [p.firstName, p.surname].filter(Boolean).join(" ") || "Student";
}

// The MMT topic label for an attempt (single topic → its name; mixed → label).
export function masteryTopicFor(topicIds = []) {
  if (topicIds.length === 1 && MMT_TOPIC_NAMES[topicIds[0]]) return MMT_TOPIC_NAMES[topicIds[0]];
  if (topicIds.length > 1) return "Mills Maths Adventure (Mixed)";
  return "Mills Maths Adventure";
}

/**
 * Should this completed result be saved to the cloud?
 *
 * Phase 3B.1 policy change: completed attempts of ANY kind — INCLUDING `story`
 * — sync when the student is REGISTERED. Story attempts are tagged
 * `missionKind:"story"` and are NEVER fed into teacher tasks/summaries (this
 * MVP writes no summaries at all), and story PROGRESSION stays purely local. The
 * only thing that changes is that the evidence reaches `achievements` +
 * `adventureAttempts`, clearly distinguishable by kind.
 *
 * Demo/skip (no profile) → false. Abandoned attempts never reach here (the
 * caller only saves on the finish path). Pure.
 */
export function shouldCloudSave(resultRecord = {}, studentProfile = null) {
  return Boolean(studentProfile && studentProfile.studentCode);
}

/**
 * Pick the identity to show on the completion screen. Priority:
 *   1. Firebase registered student profile, then
 *   2. the local result record's student name/code, then
 *   3. "Explorer".
 * Pure → testable. Returns { source, name, tag }.
 */
export function pickCompletionIdentity(cloudStudent, savedRecord) {
  if (cloudStudent && cloudStudent.studentCode) {
    return {
      source: "firebase",
      name: fullName(cloudStudent),
      tag: cloudStudent.className || cloudStudent.studentCode || "",
    };
  }
  return {
    source: "local",
    name: (savedRecord && savedRecord.studentName) || "Explorer",
    tag: (savedRecord && savedRecord.studentCode) || "",
  };
}

/**
 * Strip typed student answers and reshape question results into the SAFE cloud
 * snapshot. `topicName`/`skillName` are resolved from the attempt's parallel id
 * arrays where available.
 */
export function stripTypedAnswers(questionResults = [], r = {}) {
  const topicName = {};
  (r.topicIds || []).forEach((id, i) => { topicName[id] = (r.topicNames || [])[i] || id; });
  const skillName = {};
  (r.skillIds || []).forEach((id, i) => { skillName[id] = (r.skillNames || [])[i] || id; });

  return (questionResults || []).map((q) => ({
    questionId: q.questionId || null,
    prompt: q.text || "",                 // safe prompt snapshot
    topicId: q.topicId || null,
    topicName: topicName[q.topicId] || q.topicId || null,
    skillId: q.skillId || null,
    skillName: skillName[q.skillId] || q.skillId || null,
    difficulty: q.difficultyLevel ?? null,
    answerMode: q.answerMode || "simple",
    correct: Boolean(q.correct),
    partResults: Array.isArray(q.partResults) ? q.partResults.map(Boolean) : null,
    expectedAnswer: q.expectedAnswer == null ? "" : String(q.expectedAnswer),
    diagramType: q.diagramType || null,
    legacyType: q.legacyType || null,
    sourceType: q.sourceType || null,
    feedback: q.feedback || "",
    // NOTE: q.studentAnswer is intentionally OMITTED (privacy — Phase 3B).
  }));
}

/**
 * COMPACT `achievements` record (no question-level array). Identity fields come
 * from the Firebase student profile. `createdAt` (serverTimestamp) is added by
 * the writer.
 */
export function mapResultToAchievement(r = {}, p = {}) {
  const total = Number(r.questionCount || 0);
  const score = Number(r.correctCount || 0);
  const percent = Number.isFinite(r.percentage) ? r.percentage : (total ? Math.round((score / total) * 100) : 0);
  const mastery = masteryTopicFor(r.topicIds || []);
  const eligible = r.missionKind !== "demo";
  return {
    studentCode: p.studentCode,
    studentName: fullName(p),
    firstName: p.firstName || "",
    surname: p.surname || "",
    className: p.className || "",
    teacherCode: p.teacherCode || "",
    teacherName: p.teacherName || p.teacher || "",
    school: p.school || "",
    topic: mastery,
    tool: "Mills Maths Adventure",
    level: r.missionTitle || "Challenge",
    levelKey: r.missionId || null,
    score,
    total,
    percent,
    xpEarned: Number(r.xpAwarded || 0),
    masteryTopic: mastery,
    masteryScore: percent,
    platformVersion: "mills-maths-adventure-3b",
    missionKind: r.missionKind || "preset",
    adventureAttemptId: r.attemptId || null,
    adventureTaskId: r.taskId ?? null,
    badgeEligible: eligible,
    streakEligible: eligible,
    createdAtClient: new Date().toISOString(),
    // createdAt (serverTimestamp) added at write time.
  };
}

/**
 * RICH `adventureAttempts` record (full, with safe question snapshots and NO
 * typed answers). Doc id should be `attemptId`. `createdAt` added by the writer.
 */
export function mapResultToAdventureAttempt(r = {}, p = {}) {
  return {
    attemptId: r.attemptId,
    source: ADVENTURE_SOURCE,
    schemaVersion: ADVENTURE_ATTEMPT_SCHEMA_VERSION,
    // identity (from the Firebase student profile)
    studentCode: p.studentCode,
    studentName: fullName(p),
    firstName: p.firstName || "",
    surname: p.surname || "",
    className: p.className || "",
    teacherCode: p.teacherCode || "",
    teacherName: p.teacherName || p.teacher || "",
    school: p.school || "",
    // mission context (taskId/classCode future-ready, null in 3B)
    missionId: r.missionId || null,
    missionKind: r.missionKind || "preset",
    missionTitle: r.missionTitle || "Challenge",
    taskId: r.taskId ?? null,
    taskCode: r.taskCode ?? null,
    classCode: p.classCode ?? null,
    topicIds: r.topicIds || [],
    topicNames: r.topicNames || [],
    skillIds: r.skillIds || [],
    skillNames: r.skillNames || [],
    difficultyRange: r.difficultyRange || null,
    adaptive: Boolean(r.adaptiveOn),
    // result
    questionCount: Number(r.questionCount || 0),
    correctCount: Number(r.correctCount || 0),
    percent: Number.isFinite(r.percentage) ? r.percentage : 0,
    passed: Boolean(r.passed),
    passThreshold: r.passThreshold ?? 0.6,
    xpEarned: Number(r.xpAwarded || 0),
    coinsEarned: Number(r.coinsAwarded || 0),
    badgeId: r.badgeAwarded || null,
    // timing
    startedAtClient: iso(r.startedAt),
    completedAtClient: iso(r.completedAt),
    durationMs: Math.max(0, Number(r.durationSeconds || 0)) * 1000,
    createdAtClient: new Date().toISOString(),
    // question-level (typed answers stripped)
    questionResults: stripTypedAnswers(r.questionResults, r),
    // createdAt (serverTimestamp) added at write time.
  };
}
