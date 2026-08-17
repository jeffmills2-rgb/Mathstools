/**
 * ANSWER MODES (Phase 2K) — the PURE core of the answer/input system.
 *
 * Previously the game supported two answer modes: "simple" (typed box) and
 * "math" (MathLive). This module generalises that into a small, reusable set of
 * answer modes, with PURE matchers + graders so the whole thing is testable in
 * plain Node (no React/DOM). The UI layer (src/ui/answer-modes/) renders an
 * input per mode and calls gradeAnswer() here to check.
 *
 * It imports NOTHING from the UI or stores (one-way dependency: UI → maths).
 *
 * MODES:
 *   simple       a typed numeric/short answer (existing)
 *   math         a MathLive expression (existing)
 *   trueFalse    True / False
 *   comparison   one of <, >, =
 *   orderedList  a comma-separated ordered list (exact order)
 *   multiPart    parts (a)(b)(c), each its own short answer
 *   tableInput   a small table with editable cells
 *
 * QUESTION FIELDS used by these modes (all optional; carried by makeQuestion):
 *   answerMode      one of the above (defaults from inputMode)
 *   comparisonOptions  e.g. ["<", ">", "="]
 *   orderedItems    expected ordered tokens, e.g. ["0.3","0.45","0.6"]
 *   expectedParts   [{ label, prompt, answer, acceptableAnswers?, mode? }]
 *   tableConfig     { caption?, headerRow?, rows: Cell[][] }
 *                     Cell = string (static) | { input:true, answer, acceptableAnswers? }
 *   validationRules optional hints for the UI (e.g. { allowEquivalent:true })
 *   feedbackParts   optional per-part feedback strings
 */

export const ANSWER_MODES = Object.freeze({
  SIMPLE: "simple",
  MATH: "math",
  TRUE_FALSE: "trueFalse",
  COMPARISON: "comparison",
  ORDERED_LIST: "orderedList",
  MULTI_PART: "multiPart",
  TABLE: "tableInput",
  RATIO: "ratio", // a : b (: c) — one box per part with colons between (Phase 3A2)
  MULTIPLE_CHOICE: "multipleChoice", // pick one of 3–4 labelled options (Phase 3B)
  MULTI_SELECT: "multiSelect", // SELECT ALL that apply — checkboxes (Phase 3H)
});

const NEW_MODES = new Set([
  ANSWER_MODES.TRUE_FALSE,
  ANSWER_MODES.COMPARISON,
  ANSWER_MODES.ORDERED_LIST,
  ANSWER_MODES.MULTI_PART,
  ANSWER_MODES.TABLE,
  ANSWER_MODES.RATIO,
  ANSWER_MODES.MULTIPLE_CHOICE,
  ANSWER_MODES.MULTI_SELECT,
]);

export function isNewAnswerMode(mode) {
  return NEW_MODES.has(mode);
}

/** The effective answer mode for a question (falls back to its input mode). */
export function answerModeOf(question) {
  if (question && question.answerMode) return question.answerMode;
  return question && question.inputMode === "math" ? ANSWER_MODES.MATH : ANSWER_MODES.SIMPLE;
}

// ---- Low-level tolerant matching (self-contained; no helpers.js import) ----

// Normalise a short answer for comparison: trim, lowercase, drop spaces, unify
// the unicode minus, and strip $ and a trailing %.
function norm(v) {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/−/g, "-")
    .replace(/\s+/g, "")
    .replace(/[$,]/g, "")
    .replace(/%$/, "");
}

// Numeric value of a token, supporting "a/b" fractions; null if non-numeric.
function numOf(v) {
  const s = norm(v);
  if (s === "") return null;
  const f = s.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/);
  if (f) {
    const d = Number(f[2]);
    return d === 0 ? null : Number(f[1]) / d;
  }
  return /^-?\d+(?:\.\d+)?$/.test(s) ? Number(s) : null;
}

/** Tolerant equality: exact normalised string OR numeric/fraction value. */
export function looseMatch(input, expected) {
  const a = norm(input);
  const b = norm(expected);
  if (a === "" ) return false;
  if (a === b) return true;
  const na = numOf(input);
  const nb = numOf(expected);
  if (na !== null && nb !== null) return Math.abs(na - nb) < 1e-9;
  return false;
}

// Match a value against an answer + optional acceptable list.
function matchAny(value, answer, acceptable) {
  if (looseMatch(value, answer)) return true;
  return (acceptable || []).some((a) => looseMatch(value, a));
}

// ---- Per-mode graders. Each returns a uniform result -----------------------
//   { correct, score (0..1), total, correctCount, partResults? }

export function gradeTrueFalse(value, answer) {
  const v = norm(value);
  const ok = v !== "" && norm(value) === norm(answer);
  return { correct: ok, score: ok ? 1 : 0, total: 1, correctCount: ok ? 1 : 0 };
}

export function gradeComparison(value, answer) {
  const v = String(value || "").trim();
  const ok = v !== "" && v === String(answer).trim();
  return { correct: ok, score: ok ? 1 : 0, total: 1, correctCount: ok ? 1 : 0 };
}

// Split a comma list into trimmed tokens.
export function splitList(value) {
  return String(value || "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "");
}

export function gradeOrderedList(value, items) {
  const got = Array.isArray(value) ? value.map((s) => String(s).trim()).filter(Boolean) : splitList(value);
  const want = items || [];
  const partResults = want.map((w, i) => matchAny(got[i] ?? "", w));
  const correctCount = partResults.filter(Boolean).length;
  const correct = got.length === want.length && correctCount === want.length;
  return { correct, score: want.length ? correctCount / want.length : 0, total: want.length, correctCount, partResults };
}

export function gradeMultiPart(values, parts) {
  const arr = Array.isArray(values) ? values : [];
  const partResults = (parts || []).map((p, i) =>
    matchAny(arr[i] ?? "", p.answer, p.acceptableAnswers)
  );
  const correctCount = partResults.filter(Boolean).length;
  const total = (parts || []).length;
  return { correct: total > 0 && correctCount === total, score: total ? correctCount / total : 0, total, correctCount, partResults };
}

// Split a ratio string like "2 : 3" or "2:3:5" into its part tokens.
export function splitRatio(value) {
  return String(value || "")
    .split(":")
    .map((s) => s.trim())
    .filter((s) => s !== "");
}

// The expected part values for a ratio-mode question.
export function ratioPartsOf(question) {
  if (Array.isArray(question?.ratioParts) && question.ratioParts.length) {
    return question.ratioParts.map(String);
  }
  return splitRatio(question?.answer);
}

export function gradeRatio(value, parts) {
  const want = parts || [];
  // Accept an array (one entry per box) OR a typed "a:b" string.
  const got = Array.isArray(value)
    ? value.map((s) => String(s).trim())
    : splitRatio(value);
  const partResults = want.map((w, i) => matchAny(got[i] ?? "", w, null));
  const correctCount = partResults.filter(Boolean).length;
  const correct = got.length === want.length && correctCount === want.length;
  return { correct, score: want.length ? correctCount / want.length : 0, total: want.length, correctCount, partResults };
}

// Collect the editable cells of a tableConfig in row-major order.
export function tableInputCells(tableConfig) {
  const cells = [];
  for (const row of (tableConfig && tableConfig.rows) || []) {
    for (const cell of row) {
      if (cell && typeof cell === "object" && cell.input) cells.push(cell);
    }
  }
  return cells;
}

export function gradeTable(values, tableConfig) {
  const cells = tableInputCells(tableConfig);
  const arr = Array.isArray(values) ? values : [];
  const partResults = cells.map((c, i) => matchAny(arr[i] ?? "", c.answer, c.acceptableAnswers));
  const correctCount = partResults.filter(Boolean).length;
  const total = cells.length;
  return { correct: total > 0 && correctCount === total, score: total ? correctCount / total : 0, total, correctCount, partResults };
}

/**
 * SELECT ALL that apply (Phase 3H). `value` is the array of chosen option
 * labels; correct iff the chosen SET equals the correct set exactly. Per-option
 * partResults report whether each option's ticked/unticked state is right.
 */
export function gradeMultiSelect(value, correct, all) {
  const sel = new Set((Array.isArray(value) ? value : splitList(value)).map((s) => String(s).trim()));
  const cor = new Set((correct || []).map((s) => String(s).trim()));
  const opts = (all && all.length ? all : [...cor]).map((s) => String(s));
  const partResults = opts.map((o) => sel.has(o) === cor.has(o));
  const correctCount = partResults.filter(Boolean).length;
  const exact = sel.size === cor.size && [...cor].every((c) => sel.has(c));
  return { correct: exact, score: opts.length ? correctCount / opts.length : 0, total: opts.length, correctCount, partResults };
}

/**
 * Unified grader. `value` shape depends on the mode:
 *   simple/math/trueFalse/comparison → string
 *   orderedList                       → string (comma list) or string[]
 *   multiPart                         → string[]
 *   tableInput                        → string[] (editable cells, row-major)
 *
 * SCORING POLICY (Phase 2K): a question counts as CORRECT for mission scoring
 * only when ALL required parts/cells/list-positions are correct (result.correct).
 * `result.score` (0..1) and `result.partResults` are exposed for PART-LEVEL
 * feedback only — the mission scoring + 60% pass threshold are unchanged.
 */
export function gradeAnswer(question, value) {
  const mode = answerModeOf(question);
  switch (mode) {
    case ANSWER_MODES.TRUE_FALSE:
      return gradeTrueFalse(value, question.answer);
    case ANSWER_MODES.COMPARISON:
      return gradeComparison(value, question.answer);
    case ANSWER_MODES.ORDERED_LIST:
      return gradeOrderedList(value, question.orderedItems || splitList(question.answer));
    case ANSWER_MODES.MULTI_PART:
      return gradeMultiPart(value, question.expectedParts || []);
    case ANSWER_MODES.TABLE:
      return gradeTable(value, question.tableConfig || {});
    case ANSWER_MODES.RATIO:
      return gradeRatio(value, ratioPartsOf(question));
    case ANSWER_MODES.MULTIPLE_CHOICE:
      // Same contract as trueFalse: the value is the chosen option label.
      return gradeTrueFalse(value, question.answer);
    case ANSWER_MODES.MULTI_SELECT:
      return gradeMultiSelect(value, question.correctOptions, question.options);
    default: {
      // simple / math — reuse the question's own string check.
      const ok = typeof question.check === "function" ? question.check(value) : looseMatch(value, question.answer);
      return { correct: Boolean(ok), score: ok ? 1 : 0, total: 1, correctCount: ok ? 1 : 0 };
    }
  }
}

/**
 * Build a `check(input)` for a question in a NEW answer mode, so the curriculum
 * registry's self-test (q.check(q.answer)) still works and so simple string
 * comparisons keep functioning. For structured modes the canonical string
 * answer validates true; runtime grading uses gradeAnswer() with the real value.
 */
export function buildModeCheck(q) {
  const mode = q.answerMode;
  if (mode === ANSWER_MODES.TRUE_FALSE) return (input) => gradeTrueFalse(input, q.answer).correct;
  if (mode === ANSWER_MODES.COMPARISON) return (input) => gradeComparison(input, q.answer).correct;
  if (mode === ANSWER_MODES.ORDERED_LIST) {
    const items = q.orderedItems || splitList(q.answer);
    return (input) => gradeOrderedList(input, items).correct;
  }
  if (mode === ANSWER_MODES.MULTI_PART || mode === ANSWER_MODES.TABLE) {
    // Structured value at runtime; the canonical string answer for self-test.
    return (input) => (typeof input === "string" ? looseMatch(input, q.answer) : gradeAnswer(q, input).correct);
  }
  if (mode === ANSWER_MODES.RATIO) {
    // gradeRatio accepts both the boxes array and a typed "a:b" string.
    const parts = ratioPartsOf(q);
    return (input) => gradeRatio(input, parts).correct;
  }
  if (mode === ANSWER_MODES.MULTIPLE_CHOICE) {
    return (input) => gradeTrueFalse(input, q.answer).correct;
  }
  if (mode === ANSWER_MODES.MULTI_SELECT) {
    // Runtime value is an array of chosen labels; the canonical string answer
    // (option labels may themselves contain commas) validates by identity for
    // the curriculum self-test.
    return (input) => (Array.isArray(input) ? gradeMultiSelect(input, q.correctOptions, q.options).correct : String(input) === String(q.answer));
  }
  return null;
}

/**
 * Is the student's current value "ready" to be checked (so we don't submit a
 * blank/partial answer)? The UI uses this to gate the Check button / Enter.
 */
export function isAnswerReady(question, value) {
  const mode = answerModeOf(question);
  switch (mode) {
    case ANSWER_MODES.TRUE_FALSE:
    case ANSWER_MODES.COMPARISON:
    case ANSWER_MODES.MULTIPLE_CHOICE:
      return Boolean(value && String(value).trim() !== "");
    case ANSWER_MODES.MULTI_SELECT:
      return Array.isArray(value) && value.length >= 1;
    case ANSWER_MODES.ORDERED_LIST: {
      const items = question.orderedItems || splitList(question.answer);
      const got = Array.isArray(value) ? value : splitList(value);
      return got.length === items.length && got.every((s) => String(s).trim() !== "");
    }
    case ANSWER_MODES.MULTI_PART: {
      const n = (question.expectedParts || []).length;
      return Array.isArray(value) && value.length === n && value.every((s) => String(s).trim() !== "");
    }
    case ANSWER_MODES.TABLE: {
      const n = tableInputCells(question.tableConfig || {}).length;
      return Array.isArray(value) && value.length === n && value.every((s) => String(s).trim() !== "");
    }
    case ANSWER_MODES.RATIO: {
      const n = ratioPartsOf(question).length;
      return Array.isArray(value) && value.length === n && value.every((s) => String(s).trim() !== "");
    }
    default:
      return Boolean(value && String(value).trim() !== "");
  }
}

/** Does Enter submit/check for this mode? (multi-field modes shouldn't.) */
export function enterSubmitsFor(mode) {
  return mode === ANSWER_MODES.SIMPLE ||
    mode === ANSWER_MODES.ORDERED_LIST; // single text field
}

/** A fresh empty value of the right shape for a mode. */
export function emptyValueFor(question) {
  const mode = answerModeOf(question);
  if (mode === ANSWER_MODES.MULTI_PART) return (question.expectedParts || []).map(() => "");
  if (mode === ANSWER_MODES.TABLE) return tableInputCells(question.tableConfig || {}).map(() => "");
  if (mode === ANSWER_MODES.RATIO) return ratioPartsOf(question).map(() => "");
  if (mode === ANSWER_MODES.MULTI_SELECT) return [];
  return "";
}
