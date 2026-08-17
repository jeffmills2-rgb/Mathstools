/**
 * DIFFICULTY UTILITIES — helpers adapters use to (a) resolve a requested level
 * to the nearest level a skill can actually deliver, and (b) build the standard
 * difficulty-metadata block that travels with every adapted question.
 *
 * Pure: no React/DOM/stores.
 */
import { clampDifficulty, difficultyLabel, xpForDifficulty } from "./difficultyLabels.js";

/**
 * Given the levels a skill genuinely supports (e.g. [3,4,5]) and a requested
 * level, return the nearest supported level and whether we had to move.
 *   resolveLevel(1, [3,4,5]) -> { level: 3, fellBack: true }
 *   resolveLevel(4, [3,4,5]) -> { level: 4, fellBack: false }
 * An empty/old-style "all levels" list means every 1..5 is supported.
 */
export function resolveLevel(requested, supportedLevels) {
  const req = clampDifficulty(requested);
  const supported = (supportedLevels && supportedLevels.length
    ? supportedLevels
    : [1, 2, 3, 4, 5]
  )
    .map(clampDifficulty)
    .sort((a, b) => a - b);

  if (supported.includes(req)) return { level: req, fellBack: false };

  // Nearest supported (ties → lower).
  let best = supported[0];
  let bestDist = Math.abs(supported[0] - req);
  for (const lv of supported) {
    const d = Math.abs(lv - req);
    if (d < bestDist) {
      best = lv;
      bestDist = d;
    }
  }
  return { level: best, fellBack: true };
}

/**
 * Build the difficulty-metadata block attached to an adapted question. The
 * registry/decorateQuestion reads `actualDifficultyLevel` to set the final
 * difficultyLevel / label / XP, and surfaces the rest for inspection.
 *
 *   requested  the level the caller asked for
 *   actual     the level actually delivered (after resolveLevel + content)
 *   skillId, skillName, legacyType, sourceType
 *   notes      human-readable reason / limitation
 */
export function makeDifficultyMeta({
  requested,
  actual,
  skillId = null,
  skillName = null,
  legacyType = null,
  sourceType = "legacy-adapter",
  notes = "",
}) {
  const req = clampDifficulty(requested);
  const act = clampDifficulty(actual ?? requested);
  return {
    requestedDifficultyLevel: req,
    actualDifficultyLevel: act,
    difficultyLabel: difficultyLabel(act),
    xpValue: xpForDifficulty(act),
    difficultyNotes: notes || null,
    legacyType,
    sourceType,
    skillId,
    skillName,
  };
}

export { clampDifficulty };
