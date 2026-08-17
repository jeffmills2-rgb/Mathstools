import { randInt, pick, makeQuestion } from "../../../helpers.js";

/**
 * STAGE 5 · Indices · Index Laws (sample skill).
 *
 * Algebraic answers with exponents → MATH input. The matcher compares the
 * canonical string form (so "x^5" matches "x^{5}").
 */
export const indexLaws = {
  id: "indexLaws",
  name: "Index Laws",
  syllabusArea: "MA5-IND-01",
  prerequisiteSkillIds: ["linearEquations"],
  nextSkillIds: ["simplifySurds"],

  generate(level) {
    const a = randInt(2, 4 + level);
    const b = randInt(2, 4 + level);

    // Easier levels: multiply (add indices). Harder: power of a power.
    const kind = level <= 3 ? "multiply" : pick(["multiply", "power"]);

    if (kind === "multiply") {
      const answer = `x^${a + b}`;
      return makeQuestion({
        topic: "indexLaws",
        text: `Simplify x^${a} × x^${b} (write as a single power of x).`,
        answer,
        acceptableAnswers: [answer],
        feedback: `When multiplying powers with the same base, add the indices: x^${a} × x^${b} = x^${a + b}.`,
        inputMode: "math",
      });
    }

    const answer = `x^${a * b}`;
    return makeQuestion({
      topic: "indexLaws",
      text: `Simplify (x^${a})^${b} (write as a single power of x).`,
      answer,
      acceptableAnswers: [answer],
      feedback: `For a power of a power, multiply the indices: (x^${a})^${b} = x^${a * b}.`,
      inputMode: "math",
    });
  },
};

export default indexLaws;
