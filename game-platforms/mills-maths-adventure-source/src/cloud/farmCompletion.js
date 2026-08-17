/**
 * Farm challenge → cloud completion + local-progress backfill.
 *
 * When a Fraction Farm challenge SET finishes AND the student is signed in, write
 * a cloud completion (reusing the normal result → cloud path). If there's an
 * active teacher task for that challenge it's tagged with the task id so the
 * teacher portal counts it; otherwise it's saved as free-play so it still shows
 * under the student's Adventure results.
 *
 * On sign-in, syncLocalFarmBests() back-fills any challenge whose best score was
 * earned locally (e.g. before signing in) and hasn't been uploaded yet, so a
 * student's offline farm progress reaches their teacher.
 *
 * Everything here is fire-and-forget and never throws into the game. Farm play
 * without a signed-in student stays local-only.
 */
import { useCloud } from "./cloudSession.js";
import { useProgress } from "../progress/store.js";
import { normaliseResult, makeAttemptId } from "../results/resultTypes.js";
import { FARM_MAX_SCORES, FARM_BEST_KEYS } from "../data/farm/farmRecords.js";
import { FARM_TASK_META } from "../data/farm/farmTaskObjective.js";

const DONE_PREFIX = "mma-farm-task-done:";
const SYNC_PREFIX = "mma-farm-synced:"; // highest score already uploaded per challenge

/** Mark a farm task locally completed (clears its in-world objective). */
export function markFarmTaskDone(assignmentId) {
  if (!assignmentId) return;
  try { localStorage.setItem(DONE_PREFIX + assignmentId, "1"); } catch { /* noop */ }
}

/** Has this student already completed the given farm task locally? */
export function isFarmTaskDone(assignmentId) {
  if (!assignmentId) return false;
  try { return localStorage.getItem(DONE_PREFIX + assignmentId) === "1"; } catch { return false; }
}

function readNum(key) {
  try { const v = Number(localStorage.getItem(key)); return Number.isFinite(v) ? v : 0; } catch { return 0; }
}

/** Build a normalised cloud result for a finished farm challenge set. */
function buildFarmRecord(challengeId, score, rounds, taskId) {
  const max = FARM_MAX_SCORES[challengeId] || 0;
  const pct = max > 0 ? Math.max(0, Math.min(100, Math.round((Number(score) / max) * 100))) : 0;
  const roundCount = Number(rounds) > 0 ? Math.round(Number(rounds)) : 15;
  const correctCount = roundCount ? Math.round((pct / 100) * roundCount) : 0;
  const meta = FARM_TASK_META[challengeId] || { name: "Fraction Farm challenge" };
  const profile = (useProgress.getState() && useProgress.getState().profile) || {};
  return normaliseResult({
    attemptId: makeAttemptId(),
    missionId: taskId || ("farm-" + challengeId),
    missionKind: taskId ? "teacher" : "free",
    taskId: taskId || null,
    missionTitle: "Fraction Farm: " + meta.name,
    studentName: profile.name || "Explorer",
    studentCode: profile.studentCode || null,
    classCode: profile.classCode || profile.className || null,
    stage: null,
    topicIds: [], topicNames: [],
    questionCount: roundCount,
    correctCount,
    percentage: pct,
    passed: true,
    startedAt: Date.now(),
    completedAt: Date.now(),
    xpAwarded: Math.max(0, Number(score) || 0),
    coinsAwarded: 0,
    questionResults: [],
  });
}

/** Remember the highest score uploaded for a challenge (so we never duplicate). */
function markSynced(challengeId, score) {
  try {
    const prev = readNum(SYNC_PREFIX + challengeId);
    localStorage.setItem(SYNC_PREFIX + challengeId, String(Math.max(prev, Number(score) || 0)));
  } catch { /* noop */ }
}

/**
 * Report a finished farm challenge set. Call from a store's terminal branch.
 * Uploads for ANY signed-in student (tagged with the active teacher task if there
 * is one, else as free-play). No-op when not registered.
 */
export function reportFarmCompletion(challengeId, score, rounds) {
  try {
    const cloud = useCloud.getState();
    if (!cloud || cloud.mode !== "registered") return;
    const task = typeof cloud.farmTaskFor === "function" ? cloud.farmTaskFor(challengeId) : null;
    const taskId = task && task.assignmentId ? task.assignmentId : null;
    const rec = buildFarmRecord(challengeId, score, rounds, taskId);
    if (taskId) markFarmTaskDone(taskId);
    markSynced(challengeId, score);
    cloud.saveAttempt(rec); // fire-and-forget dual cloud save
  } catch (err) {
    if (typeof console !== "undefined") console.warn("farm completion report failed:", err);
  }
}

/**
 * Back-fill farm challenges whose BEST score was earned locally and hasn't been
 * uploaded yet. Runs on sign-in. One record per challenge (the best), tagged with
 * the active teacher task if one matches. Fire-and-forget.
 */
export function syncLocalFarmBests() {
  try {
    const cloud = useCloud.getState();
    if (!cloud || cloud.mode !== "registered") return;
    for (const challengeId of Object.keys(FARM_BEST_KEYS)) {
      const best = readNum(FARM_BEST_KEYS[challengeId]);
      const synced = readNum(SYNC_PREFIX + challengeId);
      if (!(best > 0) || best <= synced) continue; // nothing new to upload
      const task = typeof cloud.farmTaskFor === "function" ? cloud.farmTaskFor(challengeId) : null;
      const taskId = task && task.assignmentId ? task.assignmentId : null;
      const rec = buildFarmRecord(challengeId, best, 15, taskId);
      if (taskId) markFarmTaskDone(taskId);
      markSynced(challengeId, best);
      cloud.saveAttempt(rec); // fire-and-forget
    }
  } catch (err) {
    if (typeof console !== "undefined") console.warn("farm progress sync failed:", err);
  }
}
