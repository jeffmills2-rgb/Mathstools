/**
 * PROMPT FORMATTING — shared, pure helpers for splitting a question prompt into
 * a wording part and a standalone mathematical expression.
 *
 * Maths expressions like "(−8) × (−5 + 3)" must never wrap awkwardly across
 * lines. The fix is to render the expression in its own non-breaking block. To
 * do that we need to know where the wording ends and the expression begins.
 *
 * Adapters can call splitPrompt() to pre-compute { promptText, mathExpression }
 * (preferred), and the UI <QuestionPrompt> also calls it as a global fallback,
 * so EVERY topic benefits even if its adapter didn't set the parts.
 *
 * Pure: no React/DOM/stores — just string logic.
 */

// Lead-in phrases that introduce an expression. Longest/most specific first so
// "use order of operations to calculate" wins over "calculate".
export const LEAD_INS = [
  "use order of operations to calculate",
  "expand and simplify",
  "calculate",
  "simplify",
  "expand",
  "factorise",
  "factorize",
  "evaluate",
  "convert",
  "work out",
];

const COLON_RE = new RegExp(
  `^(.*?\\b(?:${LEAD_INS.join("|")}))\\s*:\\s*(.+)$`,
  "i"
);

// "… evaluate ab." / "… work out 4 − 2 − 1." (no colon, expression to the end,
// optional trailing full stop).
const TRAILING_RE = new RegExp(
  `^(.*\\b(?:${LEAD_INS.join("|")}))\\s+([^.:]+?)\\s*\\.?$`,
  "i"
);

// Strip a single trailing period and surrounding whitespace.
function tidyExpression(expr) {
  return String(expr).trim().replace(/\.\s*$/, "").trim();
}

/**
 * Split a prompt into { promptText, mathExpression }.
 *   "Calculate: −32 + 39"
 *     → { promptText: "Calculate:", mathExpression: "−32 + 39" }
 *   "Use order of operations to calculate: (−8) × (−5 + 3)"
 *     → { promptText: "Use order of operations to calculate:", mathExpression: "(−8) × (−5 + 3)" }
 *   "If a = −4 and b = 5, evaluate ab."
 *     → { promptText: "If a = −4 and b = 5, evaluate", mathExpression: "ab" }
 * Returns null when there is no clean expression to lift out (the caller then
 * renders the prompt as ordinary text).
 */
export function splitPrompt(text) {
  if (!text || typeof text !== "string") return null;

  const colon = text.match(COLON_RE);
  if (colon) {
    const promptText = colon[1].trim() + ":";
    const mathExpression = tidyExpression(colon[2]);
    if (mathExpression) return { promptText, mathExpression };
  }

  const trailing = text.match(TRAILING_RE);
  if (trailing) {
    const mathExpression = tidyExpression(trailing[2]);
    // Only treat the tail as an expression if it actually looks like maths and
    // is NOT prose. We allow single/two-letter pronumerals (a, b, ab) but reject
    // any run of 3+ letters (e.g. "improper", "students", "fraction") so wordy
    // tails after "convert"/"work out" stay in the wording, not the expression.
    const looksMath = /[0-9+\-−×÷*/^=()]|[a-z]\b/i.test(mathExpression);
    const hasProse = /[a-zA-Z]{3,}/.test(mathExpression);
    if (mathExpression && looksMath && !hasProse &&
        mathExpression.split(/\s+/).length <= 9) {
      return { promptText: trailing[1].trim(), mathExpression };
    }
  }

  return null;
}

/**
 * Resolve the renderable prompt parts for a question, preferring fields the
 * adapter already set, then falling back to splitting the raw text.
 * Returns { promptText, mathExpression, expressionLatex } or null.
 */
export function resolvePromptParts(question) {
  if (!question) return null;
  if (question.mathExpression) {
    return {
      promptText: question.promptText || "",
      mathExpression: question.mathExpression,
      expressionLatex: question.expressionLatex || null,
    };
  }
  return splitPrompt(question.text || "");
}
