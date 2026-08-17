/**
 * Shared helpers for the curriculum layer.
 *
 * Pure data/string helpers only — no React, no stores, no DOM. This keeps the
 * whole maths/curriculum tree testable in plain Node and fully separate from
 * the game/UI/progress code.
 */

// Difficulty labels / XP / clamping now live in ONE place (the difficulty
// layer). We re-export them here so existing imports of curriculumUtils keep
// working unchanged.
export {
  DIFFICULTY_LABELS,
  XP_BY_DIFFICULTY,
  MIN_DIFFICULTY,
  MAX_DIFFICULTY,
  clampDifficulty,
  difficultyLabel,
  xpForDifficulty,
} from "../../difficulty/difficultyLabels.js";

import {
  clampDifficulty,
  difficultyLabel,
  xpForDifficulty,
} from "../../difficulty/difficultyLabels.js";

// Monotonically increasing id suffix so generated questions have unique ids.
let seq = 0;

/**
 * Wrap a "core" question (produced by a skill via makeQuestion) with the full
 * curriculum metadata the game relies on. The skill provides the maths; the
 * registry provides the context (stage/topic/skill names, difficulty, XP).
 *
 * `core` has: { text, answer, acceptableAnswers, feedback, inputMode, check }.
 */
export function decorateQuestion(core, ctx) {
  // The level the caller REQUESTED (what generate(level) was called with).
  const requested = clampDifficulty(ctx.difficultyLevel);
  // The level the adapter ACTUALLY delivered (may differ if a skill can't honour
  // the requested level). Falls back to the requested level for native skills
  // that don't report an actual level. Difficulty label + XP follow the ACTUAL
  // level so reward reflects the complexity actually served.
  const actual = clampDifficulty(core.actualDifficultyLevel ?? requested);
  return {
    id: `${ctx.stage}.${ctx.topicId}.${ctx.skillId}.L${actual}.${(seq++).toString(36)}`,
    // --- curriculum location ---
    stage: ctx.stage,
    topicId: ctx.topicId,
    topicName: ctx.topicName,
    subtopicId: core.subtopicId || ctx.skillId,
    skillId: ctx.skillId,
    skillName: ctx.skillName,
    syllabusArea: ctx.syllabusArea || null,
    // --- difficulty + reward (driven by ACTUAL difficulty) ---
    difficultyLevel: actual,
    difficultyLabel: difficultyLabel(actual),
    xpValue: xpForDifficulty(actual),
    // --- difficulty provenance (Phase 2F calibration) ---
    requestedDifficultyLevel: core.requestedDifficultyLevel ?? requested,
    actualDifficultyLevel: actual,
    difficultyNotes: core.difficultyNotes ?? null,
    legacyType: core.legacyType ?? null,
    sourceType: core.sourceType ?? ctx.source ?? "native",
    // --- the question itself ---
    inputMode: core.inputMode || "simple",
    text: core.text,
    answer: core.answer,
    acceptableAnswers: core.acceptableAnswers,
    feedback: core.feedback,
    check: core.check,
    // --- diagram hooks (Phase 2D; carried through, null until a diagram
    //     engine populates them — no diagram engine exists yet) ---
    diagramType: core.diagramType ?? null,
    diagramData: core.diagramData ?? null,
    diagramRendererHint: core.diagramRendererHint ?? null,
    // --- prompt parts (Phase 2F; optional split wording vs expression) ---
    promptText: core.promptText ?? null,
    mathExpression: core.mathExpression ?? null,
    expressionLatex: core.expressionLatex ?? null,
    promptParts: core.promptParts ?? null,
    // --- answer-mode fields (Phase 2K; default simple/math, new modes opt-in) ---
    answerMode: core.answerMode ?? null,
    options: core.options ?? null,
    // Centre a choice question's stacked option content (e.g. coordinate sets).
    centerOptions: core.centerOptions ?? false,
    // The correct subset for a "select all that apply" (multiSelect) question.
    correctOptions: core.correctOptions ?? null,
    comparisonOptions: core.comparisonOptions ?? null,
    orderedItems: core.orderedItems ?? null,
    answerParts: core.answerParts ?? null,
    expectedParts: core.expectedParts ?? null,
    tableConfig: core.tableConfig ?? null,
    validationRules: core.validationRules ?? null,
    feedbackParts: core.feedbackParts ?? null,
    ratioParts: core.ratioParts ?? null,
    // --- learning graph (optional) ---
    prerequisiteSkillIds: ctx.prerequisiteSkillIds || [],
    nextSkillIds: ctx.nextSkillIds || [],
  };
}
