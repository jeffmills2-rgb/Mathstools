import { randInt, makeQuestion } from "../../../helpers.js";

/**
 * STAGE 3 · Number Facts · Multiplication Facts (times tables 1–10).
 *
 * Foundational fact fluency: single-digit factor products from the 1–10 tables.
 * Used as an ACCESSIBLE DEFAULT (sandbox) skill.
 *
 * Difficulty gently widens the factor range (up to 5 → 8 → 10).
 */
export const multFacts = {
  id: "multFacts",
  name: "Multiplication Facts",
  syllabusArea: "MA2-MR-01",
  prerequisiteSkillIds: [],
  nextSkillIds: ["divFacts"],

  generate(level) {
    const cap = level <= 1 ? 5 : level === 2 ? 8 : 10;
    const a = randInt(1, cap);
    const b = randInt(1, 10); // one factor always from the full 1–10 tables
    const answer = a * b;

    return makeQuestion({
      topic: "multFacts",
      text: `What is ${a} × ${b}?`,
      answer,
      acceptableAnswers: [answer],
      feedback: `${a} × ${b} = ${answer}.`,
      inputMode: "simple",
    });
  },
};

export default multFacts;
