import { pick, randInt, makeQuestion } from "../../../helpers.js";

/**
 * STAGE 4 · Fractions, Decimals & Percentages · Percentages (sample skill).
 *
 * Whole-number / decimal answers → SIMPLE input (per the input-mode guidance:
 * percentages and decimals are plain answers).
 */
export const percentages = {
  id: "percentages",
  name: "Percentages",
  syllabusArea: "MA4-FRC-01",
  prerequisiteSkillIds: ["wholeNumberOps"],
  nextSkillIds: ["simplifyFractions"],

  generate(level) {
    // Easier levels: convert % to a decimal. Harder: percentage of an amount.
    const kind = level <= 2 ? "percentToDecimal" : pick(["percentToDecimal", "percentOf"]);

    if (kind === "percentToDecimal") {
      const pct = pick([5, 10, 12, 20, 25, 40, 50, 75]);
      const answer = pct / 100;
      return makeQuestion({
        topic: "percentages",
        text: `Write ${pct}% as a decimal.`,
        answer,
        acceptableAnswers: [answer],
        feedback: `Per cent means "out of 100", so ${pct} ÷ 100 = ${answer}.`,
        inputMode: "simple",
      });
    }

    const pct = pick([10, 20, 25, 50]);
    const amount = pick([40, 60, 80, 120, 200, 360]);
    const answer = (pct / 100) * amount;
    return makeQuestion({
      topic: "percentages",
      text: `What is ${pct}% of ${amount}?`,
      answer,
      acceptableAnswers: [answer],
      feedback: `${pct}% = ${pct / 100}, and ${pct / 100} × ${amount} = ${answer}.`,
      inputMode: "simple",
    });
  },
};

export default percentages;
