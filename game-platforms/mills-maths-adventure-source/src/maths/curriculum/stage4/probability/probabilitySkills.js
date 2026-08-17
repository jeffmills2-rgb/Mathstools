import { randInt, pick, gcd, makeQuestion } from "../../../helpers.js";

/**
 * STAGE 4 · Probability — NATIVE skills (Phase 3D), covering EVERY NESA
 * content statement, across all THREE strands the syllabus interleaves:
 *
 *   THEORETICAL (calculated) ....... sampleSpace, theoreticalProbability,
 *                                    probabilityScale, sumToOne
 *   OBSERVED (trials/simulation) ... theoreticalVsObserved, observedProbability,
 *                                    randomSimulation (RNG relative frequencies)
 *   COMPLEMENTARY EVENTS ........... complementDescribe, complementCalculate
 *
 * DESIGN PRINCIPLES:
 *   - Probability answers use MATH input where fractions are natural; the
 *     math matcher grades NUMERICALLY, so 3/6, 1/2 and 0.5 all pass — students
 *     are never marked wrong for an unsimplified but correct probability.
 *   - Observed data (trial counts, RNG results) is constructed to sum exactly
 *     to the stated number of trials, and pin/bottle-top contexts have NO
 *     theoretical value — matching why observed probability exists at all.
 *   - Spinner/bag figures reuse the existing fractionCircle / fractionSet
 *     diagram renderers (a shaded circle IS a spinner face).
 *   - Progression: skill ORDER carries the conceptual build (sample space →
 *     theoretical → scale → sum to 1 → observed → simulation → complements);
 *     levels 1–5 inside each skill carry numeric/structural difficulty.
 */
const SYL = "MA4-PRO";

// ---- helpers -----------------------------------------------------------------

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Simplest form of n/d as a display string.
function fracStr(n, d) {
  const h = gcd(n, d);
  return d / h === 1 ? String(n / h) : `${n / h}/${d / h}`;
}

// Split `total` into `parts` positive counts that sum exactly to total.
function splitCounts(total, parts) {
  const cuts = [];
  while (cuts.length < parts - 1) {
    const c = randInt(1, total - 1);
    if (!cuts.includes(c)) cuts.push(c);
  }
  cuts.sort((a, b) => a - b);
  const out = [];
  let prev = 0;
  for (const c of cuts) { out.push(c - prev); prev = c; }
  out.push(total - prev);
  return out.every((v) => v >= 1) ? out : splitCounts(total, parts);
}

const COLOURS = ["red", "blue", "green", "yellow", "purple", "orange"];

// ---- 1. Sample spaces ----------------------------------------------------------

const SS_SIMPLE = [
  {
    story: "A fair coin is flipped",
    correct: "heads, tails",
    wrong: ["heads", "heads, tails, edge", "1, 2"],
  },
  {
    story: "A standard six-sided die is rolled",
    correct: "1, 2, 3, 4, 5, 6",
    wrong: ["1, 2, 3, 4, 5", "0, 1, 2, 3, 4, 5, 6", "6"],
  },
  {
    story: "A card is drawn from cards labelled A, B and C",
    correct: "A, B, C",
    wrong: ["A, B", "A, B, C, D", "1, 2, 3"],
  },
];

export const sampleSpace = {
  id: "sampleSpace",
  name: "Sample Spaces",
  syllabusArea: SYL,
  prerequisiteSkillIds: [],
  nextSkillIds: ["theoreticalProbability"],

  generate(level) {
    if (level <= 1) {
      const item = pick(SS_SIMPLE);
      const options = shuffle([item.correct, ...item.wrong]);
      return makeQuestion({
        topic: "sampleSpace",
        text: `${item.story}.\nWhich list shows the COMPLETE sample space?`,
        answer: item.correct,
        feedback: `The sample space lists every possible outcome, each exactly once: ${item.correct}.`,
        answerMode: "multipleChoice",
        options,
      });
    }

    if (level <= 3) {
      // List a numbered spinner's sample space in order (orderedList).
      const n = randInt(4, level === 2 ? 5 : 8);
      const items = Array.from({ length: n }, (_, i) => String(i + 1));
      return makeQuestion({
        topic: "sampleSpace",
        text: `A spinner has ${n} equal sectors numbered 1 to ${n}.\nList the sample space from smallest to largest, separated by commas.`,
        answer: items.join(", "),
        feedback: `Every sector is a possible outcome: ${items.join(", ")}.`,
        answerMode: "orderedList",
        orderedItems: items,
      });
    }

    // Levels 4–5: COUNT the outcomes of a compound experiment.
    const kind = pick(level >= 5 ? ["coinDie", "twoSpinners", "twoCoins"] : ["coinDie", "twoCoins"]);
    if (kind === "twoCoins") {
      return makeQuestion({
        topic: "sampleSpace",
        text: `Two coins are flipped together.\nHow many outcomes are in the sample space?`,
        answer: 4,
        feedback: `HH, HT, TH, TT — 2 × 2 = 4 outcomes (HT and TH are different outcomes).`,
        inputMode: "simple",
      });
    }
    if (kind === "coinDie") {
      return makeQuestion({
        topic: "sampleSpace",
        text: `A coin is flipped and a standard die is rolled.\nHow many outcomes are in the sample space?`,
        answer: 12,
        feedback: `Each of 2 coin results pairs with each of 6 die results: 2 × 6 = 12 outcomes.`,
        inputMode: "simple",
      });
    }
    const m = randInt(3, 5);
    const n2 = randInt(3, 6);
    return makeQuestion({
      topic: "sampleSpace",
      text: `One spinner has ${m} equal sectors and another has ${n2}.\nBoth are spun. How many outcomes are in the sample space?`,
      answer: m * n2,
      feedback: `Each of the ${m} results pairs with each of the ${n2}: ${m} × ${n2} = ${m * n2} outcomes.`,
      inputMode: "simple",
    });
  },
};

// ---- 2. Theoretical probability --------------------------------------------------

export const theoreticalProbability = {
  id: "theoreticalProbability",
  name: "Theoretical Probability",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["sampleSpace"],
  nextSkillIds: ["probabilityScale", "sumToOne"],

  generate(level) {
    // Levels 1–2: spinner (shaded circle diagram) or a single die outcome.
    if (level <= 2) {
      if (pick([true, false])) {
        const n = pick([4, 5, 6, 8]);
        const fav = randInt(1, n - 1);
        return makeQuestion({
          topic: "theoreticalProbability",
          text: `The spinner has ${n} equal sectors; the shaded sectors are red.\nWhat is the probability of landing on red? Give your answer as a fraction.`,
          answer: fracStr(fav, n),
          feedback: `P(red) = favourable ÷ total = ${fav}/${n}${fracStr(fav, n) !== `${fav}/${n}` ? ` = ${fracStr(fav, n)}` : ""}.`,
          inputMode: "math",
          diagramType: "fractionCircle",
          diagramData: { numerator: fav, denominator: n },
        });
      }
      const target = randInt(1, 6);
      return makeQuestion({
        topic: "theoreticalProbability",
        text: `A standard die is rolled.\nWhat is the probability of rolling a ${target}? Give your answer as a fraction.`,
        answer: "1/6",
        feedback: `One favourable outcome out of six equally likely: P = 1/6.`,
        inputMode: "math",
      });
    }

    // Level 3: bag of counters (fraction-set diagram) or cards.
    if (level === 3) {
      if (pick([true, false])) {
        const total = pick([8, 10, 12]);
        const fav = randInt(2, total - 2);
        const colour = pick(COLOURS);
        return makeQuestion({
          topic: "theoreticalProbability",
          text: `A bag holds ${total} counters; the shaded ones are ${colour}.\nOne counter is drawn at random. What is the probability it is ${colour}?`,
          answer: fracStr(fav, total),
          feedback: `P(${colour}) = ${fav}/${total}${fracStr(fav, total) !== `${fav}/${total}` ? ` = ${fracStr(fav, total)}` : ""}.`,
          inputMode: "math",
          diagramType: "fractionSet",
          diagramData: { total, shaded: fav, cols: total > 8 ? 5 : 4 },
        });
      }
      const k = randInt(4, 8);
      return makeQuestion({
        topic: "theoreticalProbability",
        text: `Cards numbered 1 to 10 are shuffled and one is drawn.\nWhat is the probability the card is greater than ${k}?`,
        answer: fracStr(10 - k, 10),
        feedback: `The favourable cards are ${k + 1}–10: that's ${10 - k} of 10, so P = ${fracStr(10 - k, 10)}.`,
        inputMode: "math",
      });
    }

    // Level 4: die events with a described condition.
    if (level === 4) {
      const events = [
        ["an even number", 3, "2, 4 and 6"],
        ["an odd number", 3, "1, 3 and 5"],
        ["a number greater than 4", 2, "5 and 6"],
        ["a prime number", 3, "2, 3 and 5"],
        ["a multiple of 3", 2, "3 and 6"],
        ["a number less than 3", 2, "1 and 2"],
      ];
      const [desc, fav, which] = pick(events);
      return makeQuestion({
        topic: "theoreticalProbability",
        text: `A standard die is rolled.\nWhat is the probability of rolling ${desc}?`,
        answer: fracStr(fav, 6),
        feedback: `Favourable outcomes: ${which} — ${fav} of 6, so P = ${fracStr(fav, 6)}.`,
        inputMode: "math",
      });
    }

    // Level 5: compound experiments (the sample-space skill built these).
    const items = [
      ["Two coins are flipped.", "both land heads", 1, 4, "only HH out of HH, HT, TH, TT"],
      ["Two coins are flipped.", "at least one head appears", 3, 4, "HH, HT and TH out of 4 outcomes"],
      ["A coin is flipped and a die is rolled.", "the coin shows heads AND the die shows a 6", 1, 12, "1 favourable of 2 × 6 = 12 outcomes"],
      ["A coin is flipped and a die is rolled.", "the coin shows tails AND the die shows an even number", 3, 12, "T2, T4, T6 out of 12 outcomes"],
    ];
    const [setup, event, fav, total, why] = pick(items);
    return makeQuestion({
      topic: "theoreticalProbability",
      text: `${setup}\nWhat is the probability that ${event}?`,
      answer: fracStr(fav, total),
      feedback: `${why}: P = ${fracStr(fav, total)}.`,
      inputMode: "math",
    });
  },
};

// ---- 3. The 0–1 probability scale --------------------------------------------------

const SCALE_WORDS = ["Impossible", "Unlikely", "Even chance", "Likely", "Certain"];

export const probabilityScale = {
  id: "probabilityScale",
  name: "The 0–1 Probability Scale",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["theoreticalProbability"],
  nextSkillIds: ["sumToOne"],

  generate(level) {
    if (level <= 1) {
      // The endpoints: impossible = 0, certain = 1 (as numbers).
      const certain = pick([true, false]);
      return makeQuestion({
        topic: "probabilityScale",
        text: certain
          ? `A standard die is rolled.\nWhat is the probability of rolling a number from 1 to 6?`
          : `A standard die is rolled.\nWhat is the probability of rolling a 7?`,
        answer: certain ? 1 : 0,
        feedback: certain
          ? `Every outcome counts — the event is CERTAIN, so P = 1.`
          : `No outcome works — the event is IMPOSSIBLE, so P = 0.`,
        inputMode: "simple",
      });
    }

    if (level <= 3) {
      // Classify a probability with a scale word.
      const items = [
        ["0", "Impossible"], ["1", "Certain"], ["1/2", "Even chance"], ["0.5", "Even chance"],
        ["0.9", "Likely"], ["9/10", "Likely"], ["0.1", "Unlikely"], ["1/8", "Unlikely"],
      ];
      const [p, answer] = pick(items);
      return makeQuestion({
        topic: "probabilityScale",
        text: `An event has probability ${p}.\nWhich word best describes this event?`,
        answer,
        feedback: `Probabilities run from 0 (impossible) to 1 (certain); ${p} is best described as "${answer.toLowerCase()}".`,
        answerMode: "multipleChoice",
        options: SCALE_WORDS,
      });
    }

    if (level === 4) {
      // Compare two die events with < > = (equally likely outcomes!).
      const events = [
        ["rolling an even number", 3],
        ["rolling an odd number", 3],
        ["rolling a number greater than 4", 2],
        ["rolling a 6", 1],
        ["rolling a number less than 5", 4],
        ["rolling a multiple of 3", 2],
      ];
      const A = pick(events);
      let B;
      do { B = pick(events); } while (B[0] === A[0]);
      const answer = A[1] > B[1] ? ">" : A[1] < B[1] ? "<" : "=";
      return makeQuestion({
        topic: "probabilityScale",
        text: `A standard die is rolled.\nCompare the probabilities: P(${A[0]}) __ P(${B[0]})`,
        answer,
        feedback: `P(${A[0]}) = ${A[1]}/6 and P(${B[0]}) = ${B[1]}/6, so the correct symbol is ${answer}.`,
        answerMode: "comparison",
        comparisonOptions: ["<", ">", "="],
      });
    }

    // Level 5: true/false statements about the scale itself.
    const items = [
      ["A probability can be 1.4", "False", "probabilities never exceed 1 (certain)"],
      ["A probability can be 0", "True", "0 means the event is impossible"],
      ["On a fair die, each outcome has the same probability", "True", "equally likely outcomes have equal probabilities — that's what 'fair' means"],
      ["A probability of 0.5 means the event is certain", "False", "0.5 is an even chance; certain is 1"],
      ["A probability can be negative", "False", "the scale starts at 0"],
    ];
    const [claim, answer, why] = pick(items);
    return makeQuestion({
      topic: "probabilityScale",
      text: `True or false:\n${claim}.`,
      answer,
      feedback: `${answer} — ${why}.`,
      answerMode: "trueFalse",
      options: ["True", "False"],
    });
  },
};

// ---- 4. Probabilities sum to 1 --------------------------------------------------------

export const sumToOne = {
  id: "sumToOne",
  name: "Probabilities Sum to 1",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["theoreticalProbability"],
  nextSkillIds: ["complementCalculate"],

  generate(level) {
    if (level <= 2) {
      // One missing probability, decimals (L1) or same-denominator fractions (L2).
      if (level <= 1 || pick([true, false])) {
        const a = randInt(1, 6) / 10;
        const b = randInt(1, Math.round((1 - a) * 10) - 1) / 10;
        const c = Math.round((1 - a - b) * 10) / 10;
        return makeQuestion({
          topic: "sumToOne",
          text: `A spinner has three colours. P(red) = ${a} and P(blue) = ${b}.\nWhat is P(green)?`,
          answer: c,
          feedback: `All probabilities sum to 1: P(green) = 1 - ${a} - ${b} = ${c}.`,
          inputMode: "simple",
        });
      }
      const d = pick([6, 8, 10]);
      const a = randInt(1, d - 3);
      const b = randInt(1, d - a - 2);
      const c = d - a - b;
      return makeQuestion({
        topic: "sumToOne",
        text: `A spinner has three colours. P(red) = ${a}/${d} and P(blue) = ${b}/${d}.\nWhat is P(green)?`,
        answer: fracStr(c, d),
        feedback: `The three probabilities sum to 1 (= ${d}/${d}): P(green) = ${d}/${d} - ${a}/${d} - ${b}/${d} = ${fracStr(c, d)}.`,
        inputMode: "math",
      });
    }

    if (level <= 4) {
      // Complete the probability TABLE (one missing cell; 2 dp at level 4).
      const n = 4;
      const cols = COLOURS.slice(0, n);
      const step = level >= 4 ? 20 : 10; // 0.05 steps at L4, 0.1 at L3
      const parts = splitCounts(step, n).map((v) => v / step);
      const missing = randInt(0, n - 1);
      const rows = [cols.map((c, i) => (i === missing ? { input: true, answer: String(parts[i]) } : String(parts[i])))];
      return makeQuestion({
        topic: "sumToOne",
        text: `The table shows the probability of a spinner landing on each colour.\nComplete the missing probability.`,
        answer: String(parts[missing]),
        feedback: `The row must sum to 1: the missing value is 1 - ${parts.filter((_, i) => i !== missing).join(" - ")} = ${parts[missing]}.`,
        answerMode: "tableInput",
        tableConfig: {
          caption: "Spinner probabilities (must sum to 1)",
          headerRow: cols.map((c) => c[0].toUpperCase() + c.slice(1)),
          rows,
        },
      });
    }

    // Level 5: verify — could this table be a probability distribution?
    const good = pick([true, false]);
    const step = 10;
    const parts = splitCounts(step, 3).map((v) => v / step);
    const shown = good ? parts : [parts[0], parts[1], Math.round((parts[2] + pick([-0.1, 0.1, 0.2])) * 10) / 10].map((v) => Math.max(0.1, v));
    const total = Math.round(shown.reduce((x, y) => x + y, 0) * 10) / 10;
    const isValid = total === 1;
    return makeQuestion({
      topic: "sumToOne",
      text: `A spinner supposedly has P(red) = ${shown[0]}, P(blue) = ${shown[1]} and P(green) = ${shown[2]}.\nTrue or false: these could be the probabilities of ALL its outcomes.`,
      answer: isValid ? "True" : "False",
      feedback: `${shown.join(" + ")} = ${total}${isValid ? " = 1 ✓ — a complete set of outcome probabilities must sum to exactly 1." : " ≠ 1 — the probabilities of all possible outcomes must sum to exactly 1."}`,
      answerMode: "trueFalse",
      options: ["True", "False"],
    });
  },
};

// ---- 5. Theoretical vs observed (the concepts) -------------------------------------------

export const theoreticalVsObserved = {
  id: "theoreticalVsObserved",
  name: "Theoretical vs Observed",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["theoreticalProbability"],
  nextSkillIds: ["observedProbability"],

  generate(level) {
    if (level <= 2) {
      const items = [
        ["Counting equally likely outcomes on a fair die to get P(6) = 1/6", "Theoretical", "it is calculated from fair, unbiased conditions — no trials needed"],
        ["Flipping a coin 100 times and recording how often heads appears", "Observed", "it comes from the relative frequency of repeated trials"],
        ["Using a spinner's equal sectors to calculate P(red)", "Theoretical", "equal sectors are equally likely, so it can be calculated"],
        ["Rolling a die 60 times and finding that 4 came up 8 times", "Observed", "it is measured from an experiment's results"],
      ];
      const [scenario, answer, why] = pick(items);
      return makeQuestion({
        topic: "theoreticalVsObserved",
        text: `${scenario}.\nIs this THEORETICAL or OBSERVED probability?`,
        answer,
        feedback: `${answer} — ${why}.`,
        answerMode: "multipleChoice",
        options: ["Theoretical", "Observed"],
      });
    }

    if (level <= 4) {
      const items = [
        ["Observed probability is another name for relative frequency", "True", "observed probability = frequency of the event ÷ number of trials"],
        ["Theoretical probability requires running an experiment", "False", "it is CALCULATED from equally likely outcomes — no trials needed"],
        ["With more trials, observed probability usually gets closer to the theoretical probability", "True", "more trials smooth out chance variation"],
        ["A fair die's theoretical probability of a 3 changes if you roll badly", "False", "theoretical probability depends only on the fair die, not on any trials"],
        ["An observed probability can differ from the theoretical probability", "True", "chance variation means short runs rarely match theory exactly"],
      ];
      const [claim, answer, why] = pick(items);
      return makeQuestion({
        topic: "theoreticalVsObserved",
        text: `True or false:\n${claim}.`,
        answer,
        feedback: `${answer} — ${why}.`,
        answerMode: "trueFalse",
        options: ["True", "False"],
      });
    }

    // Level 5: interpret a mismatch between observed and theoretical.
    const rolls = pick([60, 120]);
    const sixes = Math.round(rolls / 6) + pick([3, 4, 5, -3, -4]);
    return makeQuestion({
      topic: "theoreticalVsObserved",
      text: `A fair die is rolled ${rolls} times and a six appears ${sixes} times — not exactly ${rolls / 6}.\nWhich statement best explains this?`,
      answer: "Chance variation — observed results rarely match theory exactly",
      feedback: `The die is still fair; short runs vary by chance. As the number of trials grows, the relative frequency of sixes will settle towards 1/6.`,
      answerMode: "multipleChoice",
      options: shuffle([
        "Chance variation — observed results rarely match theory exactly",
        "The die must be biased",
        "The theoretical probability of a six changed",
        "The experiment was done incorrectly",
      ]),
    });
  },
};

// ---- 6. Observed probability (relative frequency) --------------------------------------------

export const observedProbability = {
  id: "observedProbability",
  name: "Observed Probability",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["theoreticalVsObserved"],
  nextSkillIds: ["randomSimulation"],

  generate(level) {
    // Level 4: expected COUNT from a theoretical probability (the bridge back).
    if (level === 4) {
      const rolls = pick([60, 120, 300]);
      const face = randInt(1, 6);
      return makeQuestion({
        topic: "observedProbability",
        text: `A fair die is rolled ${rolls} times.\nHow many times would you EXPECT to roll a ${face}?`,
        answer: rolls / 6,
        feedback: `Expected count = probability × trials = 1/6 × ${rolls} = ${rolls / 6}. (An actual experiment will vary around this.)`,
        inputMode: "simple",
      });
    }

    const contexts = [
      { trials: () => pick([20, 40, 50]), story: (n, f) => `A coin is flipped ${n} times and lands heads ${f} times`, event: "heads" },
      { trials: () => pick([30, 50, 60]), story: (n, f) => `A drawing pin is dropped ${n} times and lands point-up ${f} times`, event: "point-up", noTheory: true },
      { trials: () => pick([25, 40, 80]), story: (n, f) => `A bottle top is flicked ${n} times and lands upright ${f} times`, event: "upright", noTheory: true },
      { trials: () => pick([30, 60]), story: (n, f) => `A spinner is spun ${n} times and lands on blue ${f} times`, event: "blue" },
    ];
    const ctx = pick(level <= 2 ? contexts : contexts.slice(1)); // pins/tops dominate at L3+
    const n = ctx.trials();
    // Level 1–2: friendly fractions; 3+: any count.
    let f;
    if (level <= 2) {
      const h = pick([2, 4, 5, 10].filter((x) => n % x === 0));
      f = (n / h) * randInt(1, h - 1);
    } else {
      f = randInt(Math.round(n * 0.2), Math.round(n * 0.8));
    }

    return makeQuestion({
      topic: "observedProbability",
      text: `${ctx.story(n, f)}.\nWhat is the observed probability of ${ctx.event}? Give your answer as a fraction.`,
      answer: fracStr(f, n),
      feedback: `Observed probability = relative frequency = ${f}/${n}${fracStr(f, n) !== `${f}/${n}` ? ` = ${fracStr(f, n)}` : ""}.${ctx.noTheory ? " (There's no theoretical value here — the outcomes aren't equally likely, which is exactly why we experiment.)" : ""}`,
      inputMode: "math",
    });
  },
};

// ---- 7. Random-number-generator simulations ------------------------------------------------------

export const randomSimulation = {
  id: "randomSimulation",
  name: "Simulations & Relative Frequency",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["observedProbability"],
  nextSkillIds: [],

  generate(level) {
    const faces = level <= 2 ? 4 : pick([4, 5, 6]);
    const total = level <= 2 ? pick([20, 40]) : pick([40, 50, 60]);
    const counts = splitCounts(total, faces);

    if (level <= 2) {
      // Read ONE relative frequency from listed RNG results.
      const which = randInt(0, faces - 1);
      const resultLine = counts.map((c, i) => `"${i + 1}" came up ${c} times`).join(", ");
      return makeQuestion({
        topic: "randomSimulation",
        text: `A random number generator produced ${total} whole numbers from 1 to ${faces}:\n${resultLine}.\nWhat is the relative frequency of "${which + 1}"? Give your answer as a fraction.`,
        answer: fracStr(counts[which], total),
        feedback: `Relative frequency = count ÷ trials = ${counts[which]}/${total}${fracStr(counts[which], total) !== `${counts[which]}/${total}` ? ` = ${fracStr(counts[which], total)}` : ""}.`,
        inputMode: "math",
      });
    }

    if (level <= 4) {
      // Complete the relative-frequency column of a simulation table.
      const missing = new Set([randInt(0, faces - 1)]);
      if (level >= 4) missing.add((([...missing][0] + 2) % faces));
      const rows = counts.map((c, i) => [
        String(i + 1),
        String(c),
        missing.has(i) ? { input: true, answer: `${c}/${total}`, acceptableAnswers: [fracStr(c, total)] } : `${c}/${total}`,
      ]);
      return makeQuestion({
        topic: "randomSimulation",
        text: `A random number generator simulated ${total} rolls of numbers 1 to ${faces}.\nComplete the missing relative frequenc${missing.size > 1 ? "ies" : "y"} in the table.`,
        answer: [...missing].sort().map((i) => `${counts[i]}/${total}`).join(", "),
        feedback: `Each relative frequency is that outcome's count over the ${total} trials.`,
        answerMode: "tableInput",
        tableConfig: {
          caption: `${total} simulated trials`,
          headerRow: ["Number", "Frequency", "Relative frequency"],
          rows,
        },
      });
    }

    // Level 5: what the simulation SETTLES TOWARDS (long-run behaviour).
    const variant = pick(["settle", "expect"]);
    if (variant === "settle") {
      return makeQuestion({
        topic: "randomSimulation",
        text: `A random number generator simulates rolling a fair ${faces}-sided die, over and over.\nAs the number of trials gets very large, the relative frequency of any one number gets closer and closer to which value?`,
        answer: `1/${faces}`,
        feedback: `Each of the ${faces} numbers is equally likely, so relative frequencies settle towards the theoretical probability 1/${faces}.`,
        answerMode: "multipleChoice",
        options: shuffle([`1/${faces}`, `1/${faces * 2}`, "0", "1"]),
      });
    }
    const big = pick([600, 1200, 3000]);
    return makeQuestion({
      topic: "randomSimulation",
      text: `A random number generator simulates ${big} rolls of a fair ${faces}-sided die.\nAbout how many times should the number 1 appear?`,
      answer: big / faces,
      feedback: `Expected count = 1/${faces} × ${big} = ${big / faces}. The actual simulation will vary a little around this.`,
      inputMode: "simple",
    });
  },
};

// ---- 8. Describe the complement -------------------------------------------------------------------

export const complementDescribe = {
  id: "complementDescribe",
  name: "Complementary Events",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["theoreticalProbability"],
  nextSkillIds: ["complementCalculate"],

  generate(level) {
    if (level <= 2) {
      const items = [
        ["rolling an even number on a die", "rolling an odd number", ["rolling a 6", "rolling an even number again", "rolling a number less than 3"]],
        ["the spinner landing on red", "the spinner NOT landing on red", ["the spinner landing on blue", "the spinner landing on red twice", "the spinner stopping"]],
        ["rain falling tomorrow", "no rain falling tomorrow", ["a storm tomorrow", "rain falling today", "sunshine all day"]],
        ["drawing a vowel from the alphabet", "drawing a consonant", ["drawing the letter A", "drawing a vowel again", "drawing the letter Z"]],
      ];
      const [event, correct, wrong] = pick(items);
      return makeQuestion({
        topic: "complementDescribe",
        text: `What is the COMPLEMENT of this event?\n"${event}"`,
        answer: correct,
        feedback: `The complement is everything OTHER than the event: ${correct}. Together they cover all outcomes.`,
        answerMode: "multipleChoice",
        options: shuffle([correct, ...wrong]),
      });
    }

    // Levels 3–5: true/false with increasingly subtle pairs.
    const easy = [
      ["The complement of rolling a 6 is rolling a 1, 2, 3, 4 or 5", "True", "those are ALL the other outcomes"],
      ["The complement of heads is tails", "True", "a coin has exactly two outcomes"],
      ["The complement of 'the spinner lands on blue' is 'the spinner lands on red'", "False", "unless blue and red are the ONLY colours, other outcomes are missing — the complement is 'not blue'"],
    ];
    const subtle = [
      ["The complement of rolling at least a 5 is rolling at most a 4", "True", "'at least 5' is {5, 6}; everything else is {1, 2, 3, 4}"],
      ["The complement of 'at least one head' (two coins) is 'no heads'", "True", "the only outcome without a head is TT"],
      ["The complement of 'at least one head' (two coins) is 'two tails and two heads'", "False", "the complement is exactly 'no heads' (TT)"],
      ["An event and its complement can BOTH happen at once", "False", "they never overlap — one or the other happens"],
      ["An event and its complement together cover every outcome", "True", "that's why their probabilities sum to 1"],
    ];
    const [claim, answer, why] = pick(level <= 3 ? easy : subtle);
    return makeQuestion({
      topic: "complementDescribe",
      text: `True or false:\n${claim}.`,
      answer,
      feedback: `${answer} — ${why}.`,
      answerMode: "trueFalse",
      options: ["True", "False"],
    });
  },
};

// ---- 9. Calculate with complements -----------------------------------------------------------------

export const complementCalculate = {
  id: "complementCalculate",
  name: "P(not A) = 1 − P(A)",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["complementDescribe", "sumToOne"],
  nextSkillIds: [],

  generate(level) {
    if (level <= 1) {
      const p = randInt(1, 9) / 10;
      const ctx = pick([
        ["it rains tomorrow", "it does NOT rain tomorrow"],
        ["the bus is late", "the bus is NOT late"],
        ["Sam wins the raffle", "Sam does NOT win"],
      ]);
      return makeQuestion({
        topic: "complementCalculate",
        text: `The probability that ${ctx[0]} is ${p}.\nWhat is the probability that ${ctx[1]}?`,
        answer: Math.round((1 - p) * 10) / 10,
        feedback: `P(not A) = 1 - P(A) = 1 - ${p} = ${Math.round((1 - p) * 10) / 10}.`,
        inputMode: "simple",
      });
    }

    if (level === 2) {
      const d = pick([5, 7, 8, 9, 10]);
      const num = randInt(1, d - 1);
      return makeQuestion({
        topic: "complementCalculate",
        text: `P(A) = ${num}/${d}.\nWhat is P(not A)?`,
        answer: fracStr(d - num, d),
        feedback: `P(not A) = 1 - ${num}/${d} = ${fracStr(d - num, d)}.`,
        inputMode: "math",
      });
    }

    if (level === 3) {
      // Context with a diagram: P(not shaded).
      const total = pick([8, 10, 12]);
      const fav = randInt(2, total - 2);
      const colour = pick(COLOURS);
      return makeQuestion({
        topic: "complementCalculate",
        text: `A bag holds ${total} counters; the shaded ones are ${colour}.\nOne counter is drawn at random. What is the probability it is NOT ${colour}?`,
        answer: fracStr(total - fav, total),
        feedback: `P(not ${colour}) = 1 - ${fav}/${total} = ${fracStr(total - fav, total)}.`,
        inputMode: "math",
        diagramType: "fractionSet",
        diagramData: { total, shaded: fav, cols: total > 8 ? 5 : 4 },
      });
    }

    if (level === 4) {
      // Verify: find BOTH P(A) and P(not A) — they must sum to 1.
      const n = pick([4, 5, 6, 8]);
      const fav = randInt(1, n - 1);
      return makeQuestion({
        topic: "complementCalculate",
        text: `The spinner has ${n} equal sectors; the shaded sectors are red.\nFind both probabilities (they should sum to 1).`,
        answer: `${fracStr(fav, n)}, ${fracStr(n - fav, n)}`,
        feedback: `P(red) = ${fracStr(fav, n)} and P(not red) = ${fracStr(n - fav, n)} — together ${fav}/${n} + ${n - fav}/${n} = 1. ✓`,
        answerMode: "multiPart",
        expectedParts: [
          { label: "(a)", prompt: "P(red)", answer: `${fav}/${n}`, acceptableAnswers: [fracStr(fav, n)] },
          { label: "(b)", prompt: "P(not red)", answer: `${n - fav}/${n}`, acceptableAnswers: [fracStr(n - fav, n)] },
        ],
        diagramType: "fractionCircle",
        diagramData: { numerator: fav, denominator: n },
      });
    }

    // Level 5: percentage / decimal word problems.
    const kind = pick(["percent", "decimal2"]);
    if (kind === "percent") {
      const p = randInt(3, 19) * 5;
      return makeQuestion({
        topic: "complementCalculate",
        text: `A basketballer scores from ${p}% of her free throws.\nWhat percentage of free throws does she MISS?`,
        answer: 100 - p,
        acceptableAnswers: [`${100 - p}%`],
        feedback: `Scoring and missing are complements: 100% - ${p}% = ${100 - p}%.`,
        inputMode: "simple",
      });
    }
    const p = randInt(5, 95) / 100;
    const comp = Math.round((1 - p) * 100) / 100;
    return makeQuestion({
      topic: "complementCalculate",
      text: `The probability a train arrives late is ${p}.\nWhat is the probability it does NOT arrive late?`,
      answer: comp,
      feedback: `P(not late) = 1 - ${p} = ${comp}.`,
      inputMode: "simple",
    });
  },
};

// The full ordered skill list — the ORDER is the conceptual progression.
export const PROBABILITY_SKILLS_LIST = [
  sampleSpace,
  theoreticalProbability,
  probabilityScale,
  sumToOne,
  theoreticalVsObserved,
  observedProbability,
  randomSimulation,
  complementDescribe,
  complementCalculate,
];

export default PROBABILITY_SKILLS_LIST;
