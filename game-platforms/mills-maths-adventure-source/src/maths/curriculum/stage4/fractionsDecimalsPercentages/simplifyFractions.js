import { randInt, gcd, makeQuestion } from "../../../helpers.js";

/**
 * STAGE 4 · Fractions, Decimals & Percentages · Simplify Fractions (sample).
 *
 * Fraction answers are structured notation → MATH input (the equation editor),
 * per the input-mode guidance. The math-aware matcher accepts any equivalent
 * form (e.g. the simplified fraction or its decimal value).
 */
export const simplifyFractions = {
  id: "simplifyFractions",
  name: "Simplify Fractions",
  syllabusArea: "MA4-FRC-02",
  prerequisiteSkillIds: ["percentages"],
  nextSkillIds: [],

  generate(level) {
    // Higher levels use larger common factors → less obvious simplifications.
    const factor = randInt(2, 2 + level); // 1..5 → up to 3..7
    const n = randInt(1, 6);
    const d = randInt(n + 1, 9);
    const num = n * factor;
    const den = d * factor;
    const g = gcd(num, den);
    const sNum = num / g;
    const sDen = den / g;
    const answer = `${sNum}/${sDen}`;

    return makeQuestion({
      topic: "simplifyFractions",
      text: `Simplify the fraction ${num}/${den}. Use the fraction button.`,
      answer,
      // Accept the simplified fraction (and its decimal value via the matcher).
      acceptableAnswers: [answer, `${sNum / sDen}`],
      feedback: `The highest common factor of ${num} and ${den} is ${g}, so ${num}/${den} = ${answer}.`,
      inputMode: "math",
    });
  },
};

export default simplifyFractions;
