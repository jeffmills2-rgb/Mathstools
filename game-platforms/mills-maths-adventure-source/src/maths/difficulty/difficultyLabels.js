/**
 * DIFFICULTY LABELS & XP — the single source of truth for the 1–5 difficulty
 * scale, its student-facing labels, the internal "intent" of each level, and
 * the XP each level is worth.
 *
 * Previously these lived in curriculum/shared/curriculumUtils.js; they now live
 * here so all difficulty concerns are in one place. curriculumUtils re-exports
 * them, so existing imports keep working. Pure: no React/DOM/stores.
 */

export const MIN_DIFFICULTY = 1;
export const MAX_DIFFICULTY = 5;

// Student-facing labels.
export const DIFFICULTY_LABELS = {
  1: "Mild",
  2: "Medium",
  3: "Spicy",
  4: "Challenge",
  5: "Boss",
};

// XP per level — harder questions are worth more (easier ones still earn XP).
export const XP_BY_DIFFICULTY = {
  1: 10,
  2: 15,
  3: 20,
  4: 30,
  5: 45,
};

/**
 * The INTENT of each difficulty level — the design contract adapters aim for
 * when mapping a legacy question type onto a level. Difficulty should change the
 * actual question (numbers/steps/context), not only metadata + XP.
 */
export const DIFFICULTY_INTENT = {
  1: "Access / recall · small numbers · one step",
  2: "Standard fluency · slightly larger numbers · still direct",
  3: "Mixed fluency · more operations · moderate reasoning",
  4: "Multi-step · less direct · larger / less friendly numbers",
  5: "Challenge · reasoning · mixed skills · unfamiliar or extended",
};

// Clamp + round any value into the valid 1..5 range.
export function clampDifficulty(level) {
  const n = Math.round(Number(level) || MIN_DIFFICULTY);
  return Math.max(MIN_DIFFICULTY, Math.min(MAX_DIFFICULTY, n));
}

export function difficultyLabel(level) {
  return DIFFICULTY_LABELS[clampDifficulty(level)];
}

export function xpForDifficulty(level) {
  return XP_BY_DIFFICULTY[clampDifficulty(level)];
}

export function difficultyIntent(level) {
  return DIFFICULTY_INTENT[clampDifficulty(level)];
}
