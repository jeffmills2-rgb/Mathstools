import { randInt, pick, makeQuestion } from "../../../helpers.js";

/**
 * STAGE 3 · Number · Whole Number Operations (sample skill).
 *
 * Simple typed input (whole-number answers). Difficulty scales the size of the
 * numbers and which operations appear.
 *
 * A "skill" exports: id, name, metadata, and generate(difficultyLevel) which
 * returns a CORE question via makeQuestion() (the registry adds curriculum
 * metadata, difficulty label, XP, etc.).
 */
export const wholeNumberOps = {
  id: "wholeNumberOps",
  name: "Whole Number Operations",
  syllabusArea: "MA3-AR-01",
  prerequisiteSkillIds: [],
  nextSkillIds: ["integerOps"],

  generate(level) {
    const max = [10, 20, 50, 100, 500][level - 1] || 20;
    // Multiplication only appears from level 3 upward.
    const op = level >= 3 ? pick(["+", "-", "×"]) : pick(["+", "-"]);

    let a = randInt(2, max);
    let b = randInt(2, op === "×" ? Math.max(3, Math.floor(max / 10) + 9) : max);
    if (op === "-" && b > a) [a, b] = [b, a]; // keep Stage 3 answers non-negative

    const answer = op === "+" ? a + b : op === "-" ? a - b : a * b;

    return makeQuestion({
      topic: "wholeNumberOps",
      text: `What is ${a} ${op} ${b}?`,
      answer,
      acceptableAnswers: [answer],
      feedback: `${a} ${op} ${b} = ${answer}.`,
      inputMode: "simple",
    });
  },
};

export default wholeNumberOps;
