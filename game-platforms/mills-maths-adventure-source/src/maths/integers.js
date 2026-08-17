import { randInt, pick, makeQuestion, DIFFICULTY } from "./helpers.js";

const TOPIC = "integers";

/**
 * INTEGERS topic engine (placeholder).
 *
 * Addition, subtraction and multiplication with positive and negative whole
 * numbers. Every question is returned via makeQuestion() so it carries text,
 * the correct answer, acceptable answers, worked feedback, topic and
 * difficulty.
 *
 * ---------------------------------------------------------------------------
 * PLUG-IN POINT:
 * Replace the body of `generate()` with a call into your existing Mills Maths
 * Tools "integers" engine, then wrap its output in makeQuestion(). The rest of
 * the game does not change.
 * ---------------------------------------------------------------------------
 */
export const integers = {
  id: TOPIC,
  title: "Integers",
  description: "Adding, subtracting and multiplying positive and negative numbers.",

  generate() {
    const op = pick(["+", "-", "×"]);
    const a = randInt(-12, 12);
    const b = randInt(-12, 12);

    let answer;
    if (op === "+") answer = a + b;
    else if (op === "-") answer = a - b;
    else answer = a * b;

    // Show negatives in brackets so the question reads clearly, e.g. 7 + (-3).
    const fmt = (n) => (n < 0 ? `(${n})` : `${n}`);
    const text = `What is ${fmt(a)} ${op} ${fmt(b)}?`;

    // Multiplication is a touch harder than +/-.
    const difficulty = op === "×" ? DIFFICULTY.MEDIUM : DIFFICULTY.EASY;

    let feedback;
    if (op === "+") {
      feedback = `Adding a negative is like subtracting: ${a} ${op} ${b < 0 ? `(${b})` : b} = ${answer}.`;
    } else if (op === "-") {
      feedback = `Subtracting a negative is like adding: ${a} ${op} ${b < 0 ? `(${b})` : b} = ${answer}.`;
    } else {
      feedback = `Same signs give a positive, different signs give a negative: ${a} × ${b} = ${answer}.`;
    }

    return makeQuestion({
      topic: TOPIC,
      difficulty,
      text,
      answer,
      acceptableAnswers: [answer], // numeric matching handles "4" vs "4.0"
      feedback,
    });
  },
};

export default integers;
