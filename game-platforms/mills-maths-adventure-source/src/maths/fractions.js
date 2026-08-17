import { randInt, pick, gcd, makeQuestion, DIFFICULTY } from "./helpers.js";

const TOPIC = "fractions";

/**
 * FRACTIONS / DECIMALS / PERCENTAGES topic engine (placeholder).
 *
 * Three question styles: simplify a fraction, convert a percentage to a
 * decimal, and find a percentage of an amount. Each is returned via
 * makeQuestion() with worked feedback and acceptable answers.
 *
 * ---------------------------------------------------------------------------
 * PLUG-IN POINT:
 * Swap `generate()` for your real engine and wrap the result in makeQuestion().
 * ---------------------------------------------------------------------------
 */
export const fractions = {
  id: TOPIC,
  title: "Fractions, Decimals & Percentages",
  description: "Simplifying fractions and converting between fractions, decimals and percentages.",

  generate() {
    const kind = pick(["simplify", "percentToDecimal", "percentOf"]);

    if (kind === "simplify") {
      const factor = randInt(2, 6);
      const n = randInt(1, 6);
      const d = randInt(n + 1, 9);
      const num = n * factor;
      const den = d * factor;
      const g = gcd(num, den);
      const sNum = num / g;
      const sDen = den / g;
      const answer = `${sNum}/${sDen}`;
      return makeQuestion({
        topic: TOPIC,
        difficulty: DIFFICULTY.MEDIUM,
        text: `Simplify the fraction ${num}/${den} (write it as a/b).`,
        answer,
        acceptableAnswers: [answer, `${sNum} / ${sDen}`],
        feedback: `The highest common factor of ${num} and ${den} is ${g}. Dividing top and bottom by ${g} gives ${answer}.`,
      });
    }

    if (kind === "percentToDecimal") {
      const pct = pick([5, 10, 12, 20, 25, 40, 50, 75]);
      const answer = pct / 100; // e.g. 0.2
      return makeQuestion({
        topic: TOPIC,
        difficulty: DIFFICULTY.EASY,
        text: `Write ${pct}% as a decimal.`,
        answer,
        // Accept "0.2" and ".2" etc. (numeric matching covers the rest).
        acceptableAnswers: [answer, `.${String(answer).split(".")[1] || ""}`],
        feedback: `Per cent means "out of 100", so divide by 100: ${pct} ÷ 100 = ${answer}.`,
      });
    }

    // percentOf
    const pct = pick([10, 20, 25, 50]);
    const amount = pick([40, 60, 80, 120, 200]);
    const answer = (pct / 100) * amount;
    return makeQuestion({
      topic: TOPIC,
      difficulty: DIFFICULTY.MEDIUM,
      text: `What is ${pct}% of ${amount}?`,
      answer,
      acceptableAnswers: [answer],
      feedback: `${pct}% = ${pct / 100}. Multiply by the amount: ${pct / 100} × ${amount} = ${answer}.`,
    });
  },
};

export default fractions;
