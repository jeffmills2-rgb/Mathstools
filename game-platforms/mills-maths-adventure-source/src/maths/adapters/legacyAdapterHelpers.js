/**
 * LEGACY ADAPTER HELPERS — small, pure utilities shared by adapters.
 *
 * These help convert legacy engine output into the fields the current question
 * contract expects. Pure: no React, no stores, no DOM.
 */
import { answersMatchMath } from "../helpers.js";

// The area unit string, e.g. "cm" -> "cm²".
export function areaUnit(unit) {
  return `${unit}²`; // ² (superscript two)
}

/**
 * Build the list of acceptable typed answers for a NUMERIC area question.
 *
 * The answer box uses "simple" input, whose validator only allows digits and
 * a few symbols (so unit suffixes like "cm²" can't be typed anyway). We
 * therefore key on the bare number, but also list a couple of unit forms for
 * completeness / future input modes. The canonical answer is always the number.
 */
export function numericAnswerForms(answer, unit) {
  const n = String(answer);
  return Array.from(
    new Set([n, `${n} ${areaUnit(unit)}`, `${n}${areaUnit(unit)}`])
  );
}

/**
 * Turn a legacy `prompt` into the current question text, appending the expected
 * unit so students know what to type (e.g. "... (give your answer in cm²)").
 */
export function withUnitHint(prompt, unit) {
  return `${prompt} Give your answer in ${areaUnit(unit)}.`;
}

// Validate that a mapped descriptor has the minimum fields the core builder
// needs. Returns { ok, missing: [] }. Used defensively by adapters/tests.
export function validateDescriptor(desc) {
  const required = ["topic", "text", "answer", "inputMode"];
  const missing = required.filter((k) => desc[k] === undefined || desc[k] === null);
  return { ok: missing.length === 0, missing };
}

// ---- Numeric-answer normalisation (legacy banks use a Unicode minus) ----

// Replace U+2212 MINUS SIGN ("−") with an ASCII hyphen-minus so values parse
// and compare correctly with what students actually type.
export function asciiMinus(value) {
  return String(value).replace(/−/g, "-");
}

/**
 * Turn a legacy answer string into a canonical ASCII form for checking:
 * convert Unicode minus, strip a trailing unit (°C, °, cm, etc.) and spaces.
 * "−40" -> "-40", "2°C" -> "2".
 */
export function normaliseNumericAnswer(value) {
  return asciiMinus(value)
    .replace(/\s+/g, "")
    .replace(/°?[a-zA-Z]+$/u, "") // trailing unit like °C, cm, m
    .replace(/°$/u, "");
}

// Extract all integers from a string (handles the Unicode minus).
export function numbersIn(text) {
  const m = asciiMinus(text).match(/-?\d+/g);
  return m ? m.map(Number) : [];
}

// De-duplicate while preserving order (small helper for acceptableAnswers).
export function uniq(arr) {
  return Array.from(new Set(arr.filter((x) => x !== undefined && x !== null && x !== "")));
}

// ---- Algebraic expression normalisation / checking ----------------------

/**
 * Normalise a SIMPLE algebraic expression for comparison. For bracket-free sums
 * of monomials it sorts terms and the letters inside each term, so
 * "2k + 9b" === "9b + 2k" and "36xc" === "36cx". Expressions containing
 * brackets or fractions are compared as a plain de-spaced string (no
 * reordering). Pure: string logic only.
 */
export function normaliseAlgebraExpr(expr) {
  let s = String(expr).replace(/−/g, "-").toLowerCase().replace(/\s+/g, "").replace(/\*/g, "");
  if (s.includes("(") || s.includes("/")) return s; // don't reorder these
  const terms = s.match(/[+-]?[^+-]+/g) || [s];
  const norm = terms.map((t) => {
    let sign = "+";
    if (t[0] === "+" || t[0] === "-") { sign = t[0]; t = t.slice(1); }
    const cm = t.match(/^(\d*)(.*)$/);
    const coeff = cm[1];
    const rest = cm[2];
    const letters = (rest.match(/[a-z]/g) || []).sort().join("");
    const others = rest.replace(/[a-z]/g, ""); // powers like ^2
    const coeffOut = letters && (coeff === "" || coeff === "1") ? "" : coeff;
    const body = (coeffOut + letters + others) || "0";
    return { key: letters + others || "~", body: sign + body };
  });
  norm.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  return norm.map((t) => t.body).join("");
}

/**
 * Build a check() for an algebraic-expression answer: accept a match by the
 * algebra normaliser (commutative for simple sums) OR by the maths matcher
 * (numeric equivalence for constant expressions). `answer` may use Unicode minus.
 */
export function makeAlgebraCheck(answer) {
  const canon = normaliseAlgebraExpr(answer);
  return function check(input) {
    if (input == null || String(input).trim() === "") return false;
    if (normaliseAlgebraExpr(input) === canon) return true;
    return answersMatchMath(asciiMinus(String(input)), asciiMinus(String(answer)));
  };
}

// ---- Fraction tokens (the MMT banks use "[[frac:n:d]]") -----------------

// Convert "[[frac:9:10]]" → "9/10" everywhere in a string (mixed numbers like
// "4 [[frac:5:6]]" become "4 5/6").
export function fracTokensToSlash(text) {
  return String(text).replace(/\[\[frac:(-?\d+):(\d+)\]\]/g, "$1/$2");
}

function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a || 1;
}

// Parse a typed/MathLive fraction into { n, d } (whole numbers → d=1), or null.
// Accepts "6/7", "6 / 7", MathLive "(6)/(7)", "-3/4", and bare integers.
export function parseFraction(input) {
  let s = String(input).trim().replace(/\s+/g, "").replace(/[()]/g, "");
  s = s.replace(/−/g, "-");
  let m = s.match(/^(-?\d+)\/(-?\d+)$/);
  if (m) {
    const d = Number(m[2]);
    if (d === 0) return null;
    return { n: Number(m[1]), d };
  }
  m = s.match(/^(-?\d+)$/);
  if (m) return { n: Number(m[1]), d: 1 };
  return null;
}

export function isSimplestFraction(n, d) {
  return gcd(n, d) === 1;
}

// Reduce a fraction to simplest form (sign kept on the numerator).
export function reduceFraction(n, d) {
  const g = gcd(n, d) || 1;
  const sign = d < 0 ? -1 : 1;
  return { n: (n / g) * sign, d: Math.abs(d / g) };
}

/**
 * Build a check() for a fraction answer.
 *   target "n/d"
 *   opts.requireSimplest  → the entry must be fully reduced (for "simplest form")
 *   opts.requireDenominator → the entry must use this exact denominator
 * Falls back to numeric-equality when neither constraint applies.
 */
export function makeFractionCheck(targetN, targetD, opts = {}) {
  const tg = gcd(targetN, targetD);
  const rN = targetN / tg;
  const rD = targetD / tg;
  return function check(input) {
    const f = parseFraction(input);
    if (!f) return false;
    // Same value?
    if (f.n * rD !== rN * f.d) return false;
    if (opts.requireSimplest && !isSimplestFraction(f.n, f.d)) return false;
    if (opts.requireDenominator && f.d !== opts.requireDenominator) return false;
    return true;
  };
}
