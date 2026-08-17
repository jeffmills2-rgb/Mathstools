import { randInt, pick, makeQuestion } from "../../../helpers.js";

/**
 * STAGE 3 · Number Facts · Addition & Subtraction within 20.
 *
 * Foundational fact fluency: single questions with non-negative whole-number
 * answers, all within 20. Used as an ACCESSIBLE DEFAULT (sandbox) skill — a
 * student can always answer these, so free-play never gets stuck.
 *
 * Difficulty gently scales the ceiling (10 → 15 → 20); operations stay + and −.
 */
export const addSubTo20 = {
  id: "addSubTo20",
  name: "Addition & Subtraction to 20",
  syllabusArea: "MA1-AR-01",
  prerequisiteSkillIds: [],
  nextSkillIds: ["wholeNumberOps"],

  generate(level) {
    const cap = level <= 1 ? 10 : level === 2 ? 15 : 20;
    const op = pick(["+", "-"]);

    let a, b, answer, symbol;
    if (op === "+") {
      a = randInt(1, cap - 1);
      b = randInt(1, cap - a); // keep the sum within the cap
      answer = a + b;
      symbol = "+";
    } else {
      a = randInt(2, cap);
      b = randInt(1, a); // keep the answer non-negative
      answer = a - b;
      symbol = "−";
    }

    return makeQuestion({
      topic: "addSubTo20",
      text: `What is ${a} ${symbol} ${b}?`,
      answer,
      acceptableAnswers: [answer],
      feedback: `${a} ${symbol} ${b} = ${answer}.`,
      inputMode: "simple",
    });
  },
};

export default addSubTo20;
