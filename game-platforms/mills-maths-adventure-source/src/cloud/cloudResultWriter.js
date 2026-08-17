/**
 * CLOUD RESULT WRITER (Phase 3B) — orchestrates the DUAL-SAVE of one completed
 * attempt to Firebase: a compact `achievements` record + a rich `adventureAttempts`
 * record. It NEVER touches the local resultStore (that save already happened and
 * is the source of truth) and never blocks the student's result screen.
 *
 * `saveCloudAttemptWith(record, student, client)` takes an injectable `client`
 * so system checks can run it with a MOCK (no Firebase, no network). The default
 * export uses the real lazy client.
 *
 * Status returned (never throws):
 *   "saved"   — written to the cloud
 *   "skipped" — registered, but this mission is not cloud-saved (e.g. story)
 *   "demo"    — no student session (skip/demo) → local only
 *   "failed"  — a write error occurred (local save is unaffected)
 */
import {
  shouldCloudSave,
  mapResultToAchievement,
  mapResultToAdventureAttempt,
} from "./adventureAttemptMapper.js";
import { defaultCloudClient } from "./firebaseClient.js";

/** Build the two cloud payloads from a local record + student profile. Pure. */
export function buildCloudPayloads(record, student) {
  return {
    achievement: mapResultToAchievement(record, student),
    adventureAttempt: mapResultToAdventureAttempt(record, student),
  };
}

export async function saveCloudAttemptWith(record, student, client) {
  // Gate first (demo / story / no profile never write).
  if (!student || !student.studentCode) return { status: "demo" };
  if (!shouldCloudSave(record, student)) return { status: "skipped" };

  const { achievement, adventureAttempt } = buildCloudPayloads(record, student);
  try {
    await client.ensureConnected();
    await client.writeAchievement(achievement);
    await client.writeAdventureAttempt(adventureAttempt.attemptId, adventureAttempt);
    return { status: "saved", attemptId: adventureAttempt.attemptId };
  } catch (err) {
    // Non-fatal: the local result already saved; surface a soft failure.
    return { status: "failed", error: String((err && err.message) || err) };
  }
}

/** Production entry point — uses the real lazy Firebase client. */
export function saveCloudAttempt(record, student) {
  return saveCloudAttemptWith(record, student, defaultCloudClient);
}
