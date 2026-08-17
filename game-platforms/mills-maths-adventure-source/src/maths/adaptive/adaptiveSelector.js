import { clampDifficulty } from "../curriculum/shared/curriculumUtils.js";

/**
 * Adaptive difficulty selector (foundation).
 *
 * Deliberately simple for now — it only nudges the difficulty up or down by one
 * level based on recent streaks, and never leaves the 1..5 range. A richer
 * model (item response theory, spaced repetition, etc.) can replace
 * suggestDifficulty() later without touching the rest of the app.
 *
 * Pure: no React, no stores. It just reads a performance profile and returns a
 * number.
 *
 * A performance profile looks like:
 *   {
 *     attempts, correct,
 *     workingDifficulty,   // the level we're currently giving the student
 *     streak,              // consecutive correct
 *     incorrectStreak,     // consecutive incorrect
 *     accuracy,            // percent
 *     lastAttempt          // timestamp
 *   }
 */

// Get this many in a row right → step up; this many wrong → step down.
export const STREAK_TO_LEVEL_UP = 3;
export const STREAK_TO_LEVEL_DOWN = 2;

// Create a fresh profile (working difficulty starts at "Medium").
export function newProfile() {
  return {
    attempts: 0,
    correct: 0,
    workingDifficulty: 2,
    streak: 0,
    incorrectStreak: 0,
    accuracy: 0,
    lastAttempt: null,
  };
}

/**
 * Suggest the next working difficulty for a profile.
 *   - several correct in a row  → one level harder
 *   - several incorrect in a row → one level easier
 *   - otherwise                  → stay where we are
 * Always clamped to 1..5, and only moves one step at a time (gradual).
 */
export function suggestDifficulty(profile) {
  const current = clampDifficulty(profile?.workingDifficulty ?? 2);
  const streak = profile?.streak ?? 0;
  const incorrectStreak = profile?.incorrectStreak ?? 0;

  if (streak >= STREAK_TO_LEVEL_UP) return clampDifficulty(current + 1);
  if (incorrectStreak >= STREAK_TO_LEVEL_DOWN) return clampDifficulty(current - 1);
  return current;
}

/**
 * Clamp a difficulty level into an explicit [min, max] window (each first
 * clamped to the global 1..5). Used by missions so adaptive difficulty can
 * never leave the teacher's allowed range.
 */
export function clampToRange(level, min = MIN_DIFFICULTY, max = MAX_DIFFICULTY) {
  const lo = clampDifficulty(min);
  const hi = Math.max(lo, clampDifficulty(max));
  return Math.max(lo, Math.min(hi, clampDifficulty(level)));
}

/**
 * Like suggestDifficulty(), but the result is additionally constrained to a
 * mission's allowed [min, max] difficulty range. The streak logic is identical;
 * the difference is only the final clamp. This is the function missions use.
 */
export function suggestDifficultyInRange(profile, min, max) {
  return clampToRange(suggestDifficulty(profile), min, max);
}

// Re-export so callers can clamp without reaching into curriculumUtils.
export { clampDifficulty };

// Local copies of the global bounds (kept in sync with curriculumUtils) so this
// pure module has sensible defaults without importing more than it needs.
const MIN_DIFFICULTY = 1;
const MAX_DIFFICULTY = 5;
