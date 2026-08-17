import { pick, makeQuestion, DIFFICULTY } from "./helpers.js";

/**
 * EXAMPLE "math input" engine (NOT a curriculum topic).
 *
 * Its only job is to demonstrate the equation-editor input (inputMode: "math")
 * with fractions, square roots, nth roots and exponents. It is intentionally
 * NOT attached to any NPC in the world — it is reached from the DevPanel via
 * the "demo-math-input" encounter, so the three real maths topics are unchanged.
 *
 * Answers are written in the plain form the equation editor produces
 * (e.g. "1/2", "sqrt(2)", "root(3)(8)", "x^2"). The math-aware matcher in
 * helpers.js also accepts numerically-equivalent forms (so "0.5", "2^(1/2)",
 * and "2" respectively are accepted too).
 */
export const mathExamples = {
  id: "math-examples",
  title: "Equation Input Examples",
  description: "Demonstrates the equation editor: fractions, roots and powers.",

  generate() {
    const kind = pick(["fraction", "sqrt", "nthroot", "power"]);

    if (kind === "fraction") {
      return makeQuestion({
        topic: this.id,
        difficulty: DIFFICULTY.EASY,
        inputMode: "math",
        text: "Use the fraction button to enter one half.",
        answer: "1/2",
        acceptableAnswers: ["1/2", "0.5"],
        feedback: "One half is written as the fraction 1/2 (which equals 0.5).",
      });
    }

    if (kind === "sqrt") {
      return makeQuestion({
        topic: this.id,
        difficulty: DIFFICULTY.MEDIUM,
        inputMode: "math",
        text: "Use the √ button to enter the square root of 2.",
        answer: "sqrt(2)",
        acceptableAnswers: ["sqrt(2)", "2^(1/2)"],
        feedback: "The square root of 2 is written √2 (about 1.414).",
      });
    }

    if (kind === "nthroot") {
      return makeQuestion({
        topic: this.id,
        difficulty: DIFFICULTY.MEDIUM,
        inputMode: "math",
        text: "Use the nth-root button to enter the cube root of 8.",
        answer: "root(3)(8)",
        acceptableAnswers: ["root(3)(8)", "8^(1/3)", "2"],
        feedback: "The cube root of 8 is 2, because 2 × 2 × 2 = 8.",
      });
    }

    // power
    return makeQuestion({
      topic: this.id,
      difficulty: DIFFICULTY.MEDIUM,
      inputMode: "math",
      text: "Use the exponent button to enter x squared.",
      answer: "x^2",
      acceptableAnswers: ["x^2"],
      feedback: "x squared is written x² (or x^2).",
    });
  },
};

export default mathExamples;
