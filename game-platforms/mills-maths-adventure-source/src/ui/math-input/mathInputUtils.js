/**
 * Pure helpers for the math answer input.
 *
 * IMPORTANT: this file imports NOTHING (no MathLive, no React), so it can be
 * unit-tested in plain Node. The MathLive-specific React wrapper lives in
 * MathAnswerInput.jsx; this file only transforms strings.
 */

// Convert MathLive "ascii-math" output into a compact plain string.
// ascii-math is already close to what we want (e.g. "1/2", "sqrt(2)",
// "root(3)(8)", "x^2"); we just trim whitespace.
export function asciiToPlain(ascii) {
  return String(ascii || "").replace(/\s+/g, "");
}

// Fallback: convert a LaTeX string to a plain expression, used if ascii-math
// is unavailable. Handles the structures our toolbar can insert.
export function latexToPlain(latex) {
  let s = String(latex || "");
  s = s.replace(/\\left|\\right/g, "");
  // nth root: \sqrt[n]{x} -> root(n)(x)
  s = s.replace(/\\sqrt\[([^\]]*)\]\{([^{}]*)\}/g, "root($1)($2)");
  // square root: \sqrt{x} -> sqrt(x)
  s = s.replace(/\\sqrt\{([^{}]*)\}/g, "sqrt($1)");
  // fraction: \frac{a}{b} -> (a)/(b)  (repeat for nesting)
  let prev;
  do {
    prev = s;
    s = s.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "($1)/($2)");
  } while (s !== prev);
  // exponent: ^{...} -> ^(...)
  s = s.replace(/\^\{([^{}]*)\}/g, "^($1)");
  s = s.replace(/\\cdot|\\times|×|·/g, "*");
  s = s.replace(/\\div|÷/g, "/");
  s = s.replace(/\\placeholder\{\}/g, "");
  s = s.replace(/[{}]/g, "");
  s = s.replace(/\s+/g, "");
  return s;
}

/**
 * Read the three useful values out of a MathLive <math-field> element:
 *   latex  — the LaTeX form (good for display / re-rendering)
 *   ascii  — MathLive's ascii-math form
 *   plain  — the normalised plain string we send to answer-checking
 *
 * Defensive about MathLive's API across versions.
 */
export function readMathValue(mf) {
  if (!mf) return { latex: "", ascii: "", plain: "" };

  const latex =
    (typeof mf.getValue === "function" ? mf.getValue("latex") : mf.value) || "";

  let ascii = "";
  try {
    if (typeof mf.getValue === "function") ascii = mf.getValue("ascii-math") || "";
  } catch {
    ascii = "";
  }

  const plain = ascii ? asciiToPlain(ascii) : latexToPlain(latex);
  return { latex, ascii, plain };
}

// Minimal validation for the equation editor: just "is there anything?".
// (The expression itself is validated by the answer-checker.)
export function validateMathInput(plain) {
  if (!plain || String(plain).trim() === "") {
    return { valid: false, message: "Build or type an answer first." };
  }
  return { valid: true };
}
