import { randInt, pick, makeQuestion, DIFFICULTY } from "./helpers.js";

const TOPIC = "algebra";

/**
 * ALGEBRA BASICS topic engine (placeholder).
 *
 * One-step linear equations and expression evaluation, each returned via
 * makeQuestion() with worked feedback.
 *
 * ---------------------------------------------------------------------------
 * PLUG-IN POINT:
 * Replace `generate()` with your real algebra engine and wrap in makeQuestion().
 * ---------------------------------------------------------------------------
 */
export const algebra = {
  id: TOPIC,
  title: "Algebra Basics",
  description: "Solving simple one-step equations and evaluating expressions.",

  generate() {
    const kind = pick(["addEq", "mulEq", "evaluate"]);

    if (kind === "addEq") {
      const a = randInt(1, 12);
      const x = randInt(1, 12);
      const b = a + x;
      return makeQuestion({
        topic: TOPIC,
        difficulty: DIFFICULTY.EASY,
        text: `Solve for x:  x + ${a} = ${b}`,
        answer: x,
        acceptableAnswers: [x, `x=${x}`],
        feedback: `Subtract ${a} from both sides: x = ${b} − ${a} = ${x}.`,
      });
    }

    if (kind === "mulEq") {
      const a = randInt(2, 9);
      const x = randInt(2, 10);
      const b = a * x;
      return makeQuestion({
        topic: TOPIC,
        difficulty: DIFFICULTY.MEDIUM,
        text: `Solve for x:  ${a}x = ${b}`,
        answer: x,
        acceptableAnswers: [x, `x=${x}`],
        feedback: `Divide both sides by ${a}: x = ${b} ÷ ${a} = ${x}.`,
      });
    }

    // evaluate a*x + b for a given x
    const a = randInt(2, 6);
    const b = randInt(1, 10);
    const x = randInt(1, 8);
    const answer = a * x + b;
    return makeQuestion({
      topic: TOPIC,
      difficulty: DIFFICULTY.MEDIUM,
      text: `If x = ${x}, what is ${a}x + ${b}?`,
      answer,
      acceptableAnswers: [answer],
      feedback: `Substitute x = ${x}: ${a} × ${x} + ${b} = ${a * x} + ${b} = ${answer}.`,
    });
  },
};

export default algebra;
