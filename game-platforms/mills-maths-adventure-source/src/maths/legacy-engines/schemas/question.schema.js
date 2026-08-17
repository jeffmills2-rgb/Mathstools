/**
 * LEGACY QUESTION SCHEMA SHIM (source-material support).
 *
 * The uploaded MMT question banks (e.g. stage4-integers/original-engine.js) were
 * written against an "Exam Builder" schema module that we don't ship. Rather
 * than edit the bank's logic, we provide a tiny, faithful shim so the legacy
 * code runs UNCHANGED (only its import path was repointed here).
 *
 * `createQuestion` simply returns the object it is given — the bank already
 * assembles all the fields it needs (prompt, answer, working, diagram, tags…).
 * The adapter layer is what translates that legacy object into the current
 * Phase 2C/2D core question shape.
 *
 * Pure: no React, no DOM, no stores.
 */

// Space hints the exam-builder used for print layout. Our game ignores them,
// but they must exist as the banks reference SPACE_SIZES.*.
export const SPACE_SIZES = {
  NONE: "none",
  SMALL: "small",
  MEDIUM: "medium",
  LARGE: "large",
};

// Question "kinds" the exam-builder distinguished (short-answer, multiple
// choice, etc.). Banks may reference these; a permissive map is enough.
export const QUESTION_KINDS = {
  SHORT_ANSWER: "short-answer",
  MULTIPLE_CHOICE: "multiple-choice",
  TRUE_FALSE: "true-false",
  DIAGRAM: "diagram",
  MULTI_PART: "multi-part",
};

// Identity builder: the legacy generators pass a fully-formed question object.
export function createQuestion(question) {
  return question;
}

export default { SPACE_SIZES, QUESTION_KINDS, createQuestion };
