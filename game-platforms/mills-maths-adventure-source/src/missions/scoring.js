/**
 * SCORING & PASS THRESHOLD (Phase 2G polish) — the single source of truth for
 * how a challenge score becomes a pass/fail and an encouraging-but-accurate
 * result message. Pure: no React/DOM/stores, so it can be unit-tested and
 * reused by the store, the UI, and the system checks.
 */

// A student must reach this fraction of correct answers for a challenge to
// COUNT toward a mission, badge, gate/unlock or quest step.
export const PASS_THRESHOLD = 0.6; // 60%

export function scorePercent(correct, total) {
  return total > 0 ? Math.round((100 * correct) / total) : 0;
}

export function isPass(correct, total, threshold = PASS_THRESHOLD) {
  return total > 0 && correct / total >= threshold;
}

/**
 * Encouraging-but-accurate band message based on the percentage (0–100).
 * Never tells a student they succeeded when they scored below the threshold.
 */
export function bandMessage(pct) {
  if (pct >= 100) return "Perfect!";
  if (pct >= 80) return "Excellent work!";
  if (pct >= 60) return "Good work!";
  if (pct >= 40) return "Good start — keep practising!";
  if (pct >= 1) return "Keep going — you're building the skill.";
  return "Have another go — this one needs more practice.";
}

// Headline that makes pass/fail unambiguous.
export function resultTitle(passed) {
  return passed ? "Challenge complete" : "Try again to complete this challenge";
}
