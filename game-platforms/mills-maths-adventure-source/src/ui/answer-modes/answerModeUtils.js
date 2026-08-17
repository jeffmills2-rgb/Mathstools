/**
 * answerModeUtils — UI-side conveniences for the answer-mode system (Phase 2K).
 *
 * The PURE logic (modes, matchers, graders) lives in src/maths/answerModes.js so
 * it can be unit-tested in plain Node. This module just re-exports it for the UI
 * components and adds a couple of UI-only helpers.
 */
export {
  ANSWER_MODES,
  answerModeOf,
  isNewAnswerMode,
  gradeAnswer,
  isAnswerReady,
  enterSubmitsFor,
  emptyValueFor,
  tableInputCells,
  splitList,
} from "../../maths/answerModes.js";

import { answerModeOf, ANSWER_MODES } from "../../maths/answerModes.js";

// A short human label for the mode (used by the DevPanel preview).
export function answerModeLabel(question) {
  const m = answerModeOf(question);
  return {
    [ANSWER_MODES.SIMPLE]: "Simple box",
    [ANSWER_MODES.MATH]: "MathLive",
    [ANSWER_MODES.TRUE_FALSE]: "True / False",
    [ANSWER_MODES.COMPARISON]: "Comparison < > =",
    [ANSWER_MODES.ORDERED_LIST]: "Ordered list",
    [ANSWER_MODES.MULTI_PART]: "Multi-part (a)(b)(c)",
    [ANSWER_MODES.TABLE]: "Table input",
    [ANSWER_MODES.RATIO]: "Ratio a : b",
    [ANSWER_MODES.MULTIPLE_CHOICE]: "Multiple choice",
  }[m] || m;
}
