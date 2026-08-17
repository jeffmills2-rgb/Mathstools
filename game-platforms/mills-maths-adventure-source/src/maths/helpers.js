/**
 * Shared helpers for the maths engines.
 *
 * These are intentionally tiny and have NO dependency on React or the 3D
 * world. The maths engines are a self-contained module: they only know how to
 * produce and check questions. When you swap in your real Mills Maths Tools
 * engines you can keep using `makeQuestion` / `answersMatch`, or replace them.
 */
import { buildModeCheck, isNewAnswerMode } from "./answerModes.js";

// Difficulty labels used across all topics.
export const DIFFICULTY = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
};

// Random integer between min and max (inclusive).
export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Pick a random element from an array.
export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Greatest common divisor (used for fraction simplification).
export function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

// Normalise a typed answer so "0.5", " .5 ", "50%" etc. compare sensibly.
// Strips spaces and a trailing % sign, and lowercases.
export function normalise(value) {
  return String(value).trim().toLowerCase().replace(/\s+/g, "").replace(/%$/, "");
}

// Compare two answers. Tries an exact normalised string match first, then a
// numeric match (so "0.50" matches "0.5", and "5" matches "5.0").
export function answersMatch(input, expected) {
  const a = normalise(input);
  const b = normalise(expected);
  if (a === "") return false;
  if (a === b) return true;

  const na = Number(a);
  const nb = Number(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb)) {
    return Math.abs(na - nb) < 1e-9;
  }
  return false;
}

/**
 * Lightweight format validation for the answer box.
 *
 * Every placeholder topic expects a number, decimal, fraction or percentage,
 * so we accept digits and the characters - . / %  (plus surrounding spaces).
 * Returns { valid: boolean, message?: string }.
 *
 * If you add a topic that needs words/units, give that question its own
 * `inputHint` / validation, or relax this in EncounterModal.
 */
export function validateAnswerFormat(value) {
  const trimmed = String(value).trim();
  if (trimmed === "") {
    return { valid: false, message: "Type an answer first." };
  }
  // Digits, signs, decimal/fraction/percent characters, plus brackets and
  // commas for coordinate answers like (3, -2).
  if (!/^[0-9+\-./%\s(),]+$/.test(trimmed)) {
    return {
      valid: false,
      message: "Use a number, decimal, fraction or coordinate (e.g. 3, 0.5, 1/2 or (3, 2)).",
    };
  }
  return { valid: true };
}

/* =========================================================================
 * MATH-EXPRESSION ANSWER MATCHING
 *
 * For questions answered with the equation editor (inputMode: "math"), answers
 * arrive as plain strings derived from the editor (e.g. "1/2", "sqrt(2)",
 * "root(3)(8)", "x^2"). We compare two ways:
 *   1. a canonical string match (case/space/bracket-insensitive), and
 *   2. a NUMERIC match — we safely evaluate both sides when they contain no
 *      variables (so "1/2" = "0.5", "sqrt(2)" = "2^(1/2)", "root(3)(8)" = "2").
 *
 * This lives in the maths module (not the UI) so the engines stay fully
 * self-contained and testable without a browser.
 * ========================================================================= */

// Canonical form for string comparison: lowercase, no spaces, no explicit
// multiplication signs, and brackets removed so "x^(2)" == "x^2".
export function normaliseMathExpr(value) {
  return String(value)
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/÷/g, "/") // ÷ from the editor's Math-symbols toolbar
    .replace(/[*·×]/g, "")
    .replace(/[(){}\[\]]/g, "");
}

// Turn a plain maths string into a JS-evaluable numeric expression, or return
// null if it contains a variable or anything we don't trust. Supports + - * /,
// powers (^), sqrt(...) and nth roots root(n)(x).
function toEvaluable(raw) {
  let s = String(raw).toLowerCase().replace(/\s+/g, "")
    .replace(/[×·]/g, "*").replace(/÷/g, "/"); // editor Math-symbols forms
  if (s === "") return null;

  // Insert implicit multiplication: "2sqrt(2)" -> "2*sqrt(2)", "3(4)" -> "3*(4)".
  // (Done before root/sqrt are rewritten; root(n)(x)'s ")(" is left untouched.)
  s = s.replace(/(\d)(sqrt|root|\()/g, "$1*$2");

  // nth root: root(n)(x) -> Math.pow((x), 1/(n)). Repeat for nesting.
  let prev;
  do {
    prev = s;
    s = s.replace(/root\(([^()]+)\)\(([^()]+)\)/g, "Math.pow(($2),1/($1))");
  } while (s !== prev);

  s = s.replace(/sqrt/g, "Math.sqrt"); // square root
  s = s.replace(/\^/g, "**"); // exponent

  // After removing the known function names, any remaining letter means there
  // is a variable (e.g. x) — not a pure number, so don't evaluate.
  const stripped = s.replace(/math\.sqrt/gi, "").replace(/math\.pow/gi, "");
  if (/[a-z]/i.test(stripped)) return null;

  return s;
}

// Safely evaluate a plain maths string to a number, or null if not possible.
export function tryEvalNumber(raw) {
  const expr = toEvaluable(raw);
  if (expr === null) return null;
  try {
    // Only runs on strings already proven variable-free by toEvaluable().
    // eslint-disable-next-line no-new-func
    const val = Function('"use strict"; return (' + expr + ");")();
    return typeof val === "number" && Number.isFinite(val) ? val : null;
  } catch {
    return null;
  }
}

// Compare two maths-expression answers (canonical string OR numeric value).
export function answersMatchMath(input, expected) {
  const a = normaliseMathExpr(input);
  const b = normaliseMathExpr(expected);
  if (a === "") return false;
  if (a === b) return true;

  const na = tryEvalNumber(input);
  const nb = tryEvalNumber(expected);
  if (na !== null && nb !== null) return Math.abs(na - nb) < 1e-6;
  return false;
}

/**
 * Build a standardised question object.
 *
 * THIS IS THE CONTRACT the rest of the game relies on. Every engine returns
 * questions in exactly this shape, so the UI never needs to know which topic
 * produced a question:
 *
 *   {
 *     topic:             string   // e.g. "integers"
 *     difficulty:        string   // "easy" | "medium" | "hard"
 *     text:              string   // the question shown to the student
 *     answer:            string   // the single canonical correct answer
 *     acceptableAnswers: string[] // every form counted as correct
 *     feedback:          string   // a worked explanation
 *     inputMode:         string   // "simple" (typed box) | "math" (equation editor)
 *     check(input):      boolean  // true if a typed answer is acceptable
 *   }
 *
 * CHOOSING THE INPUT TYPE:
 *   - Leave inputMode as "simple" (the default) for plain numeric answers —
 *     integers, decimals, percentages, simple fractions typed as a/b, etc.
 *   - Set inputMode: "math" when the answer is naturally an equation/expression
 *     (roots, exponents, stacked fractions, algebra). The encounter then shows
 *     the MathAnswerInput equation editor instead of a plain box.
 * The matching is chosen automatically: math-mode questions use the
 * expression-aware matcher above; simple questions use the plain matcher.
 */
export function makeQuestion({
  topic,
  difficulty = DIFFICULTY.EASY,
  text,
  answer,
  acceptableAnswers = [],
  feedback = "",
  inputMode = "simple",
  // --- DIAGRAM-READY FIELDS (Phase 2D; optional, unused for now) ---
  // These let a future diagram-based engine attach a picture/figure to a
  // question without changing the question contract. They default to null so
  // every existing engine keeps producing identical questions. No diagram
  // engine is built in this phase — these fields are simply carried through.
  diagramType = null, // e.g. "numberLine" | "barModel" | "pieChart" | "geometry"
  diagramData = null, // arbitrary JSON the renderer needs (points, fractions…)
  diagramRendererHint = null, // e.g. "svg" | "canvas" | a component name
  // --- PROMPT PARTS (Phase 2F; optional) ---
  // Let an adapter split the wording from the maths expression so the renderer
  // can show the expression on its own non-breaking line. All optional/null.
  promptText = null, // wording, e.g. "Use order of operations to calculate:"
  mathExpression = null, // the expression, e.g. "(−8) × (−5 + 3)"
  expressionLatex = null, // optional LaTeX form of the expression
  promptParts = null, // optional [{ type: "text"|"expr", value }]
  // --- ANSWER MODE FIELDS (Phase 2K; optional) ---
  // Extra answer modes beyond simple/math. answerMode defaults from inputMode.
  // See src/maths/answerModes.js for the field contracts.
  answerMode = null, // "trueFalse" | "comparison" | "orderedList" | "multiPart" | "tableInput"
  options = null, // generic option list (e.g. for choice-style modes)
  comparisonOptions = null, // e.g. ["<", ">", "="]
  orderedItems = null, // expected ordered tokens for orderedList
  answerParts = null, // optional raw per-part student-facing structure
  expectedParts = null, // [{ label, prompt, answer, acceptableAnswers?, mode? }]
  tableConfig = null, // { caption?, headerRow?, rows: Cell[][] }
  validationRules = null, // optional UI hints
  feedbackParts = null, // optional per-part feedback strings
  ratioParts = null, // expected parts for the "ratio" mode, e.g. ["2","3"]
}) {
  // The canonical answer is always acceptable; de-duplicate the rest.
  const accepted = Array.from(new Set([String(answer), ...acceptableAnswers.map(String)]));
  const match = inputMode === "math" ? answersMatchMath : answersMatch;

  const q = {
    topic,
    difficulty,
    text,
    answer: String(answer),
    acceptableAnswers: accepted,
    feedback,
    inputMode,
    // Diagram hooks (null today; populated by future diagram engines).
    diagramType,
    diagramData,
    diagramRendererHint,
    // Prompt parts (null unless an adapter split the wording from the maths).
    promptText,
    mathExpression,
    expressionLatex,
    promptParts,
    // Answer-mode fields (Phase 2K).
    answerMode: answerMode || null,
    options,
    comparisonOptions,
    orderedItems,
    answerParts,
    expectedParts,
    tableConfig,
    validationRules,
    feedbackParts,
    ratioParts,
    check(input) {
      return accepted.some((a) => match(input, a));
    },
  };

  // For the new structured modes, use a mode-aware check (keeps the curriculum
  // self-test working and lets simple string comparisons function).
  if (isNewAnswerMode(answerMode)) {
    const modeCheck = buildModeCheck(q);
    if (modeCheck) q.check = modeCheck;
  }
  return q;
}
