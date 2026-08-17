import { randInt, makeQuestion } from "../../../helpers.js";

/**
 * STAGE 3 · Number Facts · Division Facts (from the 1–10 tables).
 *
 * Foundational fact fluency: exact division with whole-number quotients, built
 * from the 1–10 multiplication facts (so the dividend is always divisor ×
 * quotient). Used as an ACCESSIBLE DEFAULT (sandbox) skill.
 *
 * Difficulty gently widens the range (up to 5 → 8 → 10).
 */
export const divFacts = {
  id: "divFacts",
  name: "Division Facts",
  syllabusArea: "MA2-MR-02",
  prerequisiteSkillIds: ["multFacts"],
  nextSkillIds: ["wholeNumberOps"],

  generate(level) {
    const cap = level <= 1 ? 5 : level === 2 ? 8 : 10;
    const divisor = randInt(2, cap); // avoid ÷1 (trivial)
    const quotient = randInt(1, 10); // quotient from the full 1–10 tables
    const dividend = divisor * quotient;

    return makeQuestion({
      topic: "divFacts",
      text: `What is ${dividend} ÷ ${divisor}?`,
      answer: quotient,
      acceptableAnswers: [quotient],
      feedback: `${dividend} ÷ ${divisor} = ${quotient}.`,
      inputMode: "simple",
    });
  },
};

export default divFacts;
