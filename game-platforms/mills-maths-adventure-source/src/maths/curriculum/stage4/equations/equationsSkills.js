import { randInt, pick, gcd, makeQuestion } from "../../../helpers.js";

/**
 * STAGE 4 · Equations — NATIVE skills (Phase 3C), covering EVERY NESA content
 * statement for the Equations topic:
 *
 *   Represent & describe ......... writeEquation, expressionVsEquation
 *   Solve up to 2 steps .......... oneStepEquations, twoStepEquations,
 *                                  bothSidesEquations (incl. non-integer sols)
 *   Word problems ................ equationWordProblems
 *   Verify by substitution ....... verifySolution
 *   Formulas → linear equations .. formulaSubstitution
 *   Quadratics ................... quadraticReasoning (why ±), solveQuadratics
 *                                  (ax² = c, exact + decimal), quadraticFormulas
 *
 * DESIGN PRINCIPLES:
 *   - Solutions are chosen FIRST, then coefficients are built around them, so
 *     every equation is clean by construction (no ugly accidental fractions —
 *     non-integer solutions appear only where the level intends them).
 *   - Equations are shown via promptText + mathExpression so the equation
 *     renders on its own non-breaking line (never wraps mid-equation).
 *   - Non-integer answers accept BOTH forms ("7/2" and "3.5").
 *   - Progression: the SKILL ORDER carries the conceptual build (represent →
 *     solve → verify → formulas → quadratics); the 1–5 LEVELS inside each
 *     skill carry the numeric difficulty per DIFFICULTY_INTENT.
 */
const SYL = "MA4-EQU";

// ---- helpers -----------------------------------------------------------------

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Non-zero random int in [-max, max] (negatives only when allowNeg).
function coeff(max, allowNeg) {
  let v;
  do { v = randInt(allowNeg ? -max : 1, max); } while (v === 0);
  return v;
}

// Answer + acceptable forms for a rational solution p/q (q > 0, simplified).
function rationalAnswer(p, q) {
  const h = gcd(p, q);
  const n = p / h, d = q / h;
  if (d === 1) return { answer: String(n), acceptable: [String(n)] };
  const dec = n / d;
  const decStr = Number.isInteger(dec * 100) ? String(dec) : null; // ≤ 2 dp only
  const acceptable = [`${n}/${d}`];
  if (decStr) acceptable.push(decStr);
  return { answer: decStr || `${n}/${d}`, acceptable };
}

// "3x", "x", "-x", "-3x"
const xTerm = (a) => (a === 1 ? "x" : a === -1 ? "-x" : `${a}x`);
// "+ 5" / "- 5" as a trailing term.
const addTerm = (b) => (b >= 0 ? `+ ${b}` : `- ${-b}`);
// The inverse move in words: undoing "+ b" subtracts, undoing "− b" adds.
const undoTerm = (b) => (b >= 0 ? `Subtract ${b}` : `Add ${-b}`);

// Build a question whose equation renders on its own non-breaking line.
function eqQuestion({ topic, prompt, equation, answer, acceptableAnswers, feedback, inputMode, answerMode, options, expectedParts }) {
  return makeQuestion({
    topic,
    text: `${prompt}\n${equation}`,
    promptText: prompt,
    mathExpression: equation,
    answer,
    acceptableAnswers,
    feedback,
    inputMode: inputMode || "simple",
    answerMode: answerMode || null,
    options: options || null,
    expectedParts: expectedParts || null,
  });
}

// ---- 1. Represent number sentences as equations --------------------------------

export const writeEquation = {
  id: "writeEquation",
  name: "Write the Equation",
  syllabusArea: SYL,
  prerequisiteSkillIds: [],
  nextSkillIds: ["expressionVsEquation", "oneStepEquations"],

  generate(level) {
    const a = randInt(2, level <= 2 ? 5 : 9);
    const b = randInt(1, level <= 2 ? 9 : 15);
    const x = randInt(2, 9);

    let story, correct, distractors;
    if (level <= 1) {
      // One-step stories.
      const mult = pick([true, false]);
      story = mult
        ? `I think of a number n and multiply it by ${a}. The result is ${a * x}.`
        : `I think of a number n and add ${b}. The result is ${x + b}.`;
      correct = mult ? `${a}n = ${a * x}` : `n + ${b} = ${x + b}`;
      distractors = mult
        ? [`n + ${a} = ${a * x}`, `n/${a} = ${a * x}`, `${a}n = ${a + x}`]
        : [`${b}n = ${x + b}`, `n - ${b} = ${x + b}`, `n + ${x} = ${b}`];
    } else if (level <= 3) {
      // Two-step: multiply THEN add/subtract.
      const sub = level >= 3 && pick([true, false]);
      const c = sub ? a * x - b : a * x + b;
      story = `I think of a number n, multiply it by ${a}, then ${sub ? "subtract" : "add"} ${b}. The result is ${c}.`;
      correct = `${a}n ${sub ? "-" : "+"} ${b} = ${c}`;
      distractors = [
        `${a}(n ${sub ? "-" : "+"} ${b}) = ${c}`,
        `${a}n ${sub ? "+" : "-"} ${b} = ${c}`,
        `n/${a} ${sub ? "-" : "+"} ${b} = ${c}`,
      ];
    } else if (level === 4) {
      // Brackets: add THEN multiply.
      const c = a * (x + b);
      story = `I think of a number n, add ${b}, then multiply the result by ${a}. I get ${c}.`;
      correct = `${a}(n + ${b}) = ${c}`;
      distractors = [`${a}n + ${b} = ${c}`, `${a}n + ${a * b} = ${c + 1}`, `n + ${a * b} = ${c}`];
    } else {
      // Both sides.
      const d = x + randInt(2, 9);
      const c = 2 * x + (d - x); // 2n + k = n + d with k chosen so both hold
      const k = c - 2 * x;
      story = `Doubling my number n and adding ${k} gives the same result as adding ${d} to my number.`;
      correct = `2n + ${k} = n + ${d}`;
      distractors = [`2n + ${k} = ${d}`, `2(n + ${k}) = n + ${d}`, `2n = n + ${k + d}`];
    }

    const opts = shuffle([correct, ...distractors]);
    return makeQuestion({
      topic: "writeEquation",
      text: `${story}\nWhich equation represents this?`,
      answer: correct,
      feedback: `Each step becomes part of the equation, in order: ${correct}.`,
      answerMode: "multipleChoice",
      options: opts,
    });
  },
};

// ---- 2. Expression vs equation --------------------------------------------------

const EXPR_ITEMS = [
  // [display, isEquation, note]  — levels 1–3 use the plain ones,
  // levels 4–5 add the sneaky ones (marked tricky).
  ["3x + 4", false, "no equals sign — it's a phrase, not a statement"],
  ["2(a + 3)", false, "brackets don't make it an equation — still no equals sign"],
  ["5y", false, "a single term is an expression"],
  ["x/2 - 7", false, "no equals sign"],
  ["3x + 4 = 19", true, "it states that two expressions are EQUAL"],
  ["2m - 1 = 9", true, "it has an equals sign relating two sides"],
  ["y = 5", true, "even this short statement equates two expressions", true],
  ["P = 2l + 2w", true, "a formula IS an equation", true],
  ["0 = x - 4", true, "the zero side still makes it an equation", true],
  ["7 - 3k", false, "reads like a sentence but has no equals sign", true],
];

export const expressionVsEquation = {
  id: "expressionVsEquation",
  name: "Expression or Equation?",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["writeEquation"],
  nextSkillIds: ["oneStepEquations"],

  generate(level) {
    const pool = level <= 3 ? EXPR_ITEMS.filter((i) => !i[3]) : EXPR_ITEMS;
    const [display, isEq, note] = pick(pool);
    const answer = isEq ? "Equation" : "Expression";

    return eqQuestion({
      topic: "expressionVsEquation",
      prompt: "Is this an expression or an equation?",
      equation: display,
      answer,
      feedback: `It is an ${answer.toLowerCase()} — ${note}. An equation always contains "=".`,
      answerMode: "multipleChoice",
      options: ["Expression", "Equation"],
    });
  },
};

// ---- 3. One-step equations -------------------------------------------------------

export const oneStepEquations = {
  id: "oneStepEquations",
  name: "One-step Equations",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["writeEquation"],
  nextSkillIds: ["twoStepEquations"],

  generate(level) {
    const forms = level <= 1 ? ["add", "mult"]
      : level === 2 ? ["add", "sub", "mult", "div"]
      : ["add", "sub", "mult", "div"];
    const form = pick(forms);
    const allowNeg = level >= 3;

    if (form === "mult" && level >= 4 && Math.random() < 0.5) {
      // Non-integer solution: ax = b with a ∤ b.
      const a = randInt(2, 6);
      let b;
      do { b = randInt(3, 30); } while (b % a === 0);
      const r = rationalAnswer(b, a);
      return eqQuestion({
        topic: "oneStepEquations",
        prompt: "Solve for x:",
        equation: `${a}x = ${b}`,
        answer: r.answer,
        acceptableAnswers: r.acceptable,
        feedback: `Divide both sides by ${a}: x = ${b}/${a}${r.acceptable[1] ? ` = ${r.acceptable[1]}` : ""}.`,
      });
    }

    const x = allowNeg ? coeff(level >= 4 ? 15 : 10, true) : randInt(1, level <= 1 ? 10 : 12);
    if (form === "add") {
      const b = randInt(1, level <= 1 ? 10 : 20);
      return eqQuestion({
        topic: "oneStepEquations",
        prompt: "Solve for x:",
        equation: `x ${addTerm(b)} = ${x + b}`,
        answer: x,
        feedback: `Subtract ${b} from both sides: x = ${x + b} - ${b} = ${x}.`,
      });
    }
    if (form === "sub") {
      const b = randInt(1, level <= 2 ? 10 : 20);
      return eqQuestion({
        topic: "oneStepEquations",
        prompt: "Solve for x:",
        equation: `x - ${b} = ${x - b}`,
        answer: x,
        feedback: `Add ${b} to both sides: x = ${x - b} + ${b} = ${x}.`,
      });
    }
    if (form === "mult") {
      const a = level >= 5 && Math.random() < 0.4 ? -randInt(2, 6) : randInt(2, level <= 1 ? 5 : 9);
      return eqQuestion({
        topic: "oneStepEquations",
        prompt: "Solve for x:",
        equation: `${xTerm(a)} = ${a * x}`,
        answer: x,
        feedback: `Divide both sides by ${a}: x = ${a * x} ÷ ${a} = ${x}.`,
      });
    }
    const a = randInt(2, 6);
    return eqQuestion({
      topic: "oneStepEquations",
      prompt: "Solve for x:",
      equation: `x/${a} = ${x}`,
      answer: x * a,
      feedback: `Multiply both sides by ${a}: x = ${x} × ${a} = ${x * a}.`,
    });
  },
};

// ---- 4. Two-step equations --------------------------------------------------------

export const twoStepEquations = {
  id: "twoStepEquations",
  name: "Two-step Equations",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["oneStepEquations"],
  nextSkillIds: ["bothSidesEquations", "equationWordProblems"],

  generate(level) {
    const allowNeg = level >= 3;
    const x = allowNeg ? coeff(12, true) : randInt(1, 10);

    // Level 4+: brackets a(x + b) = c, half the time.
    if (level >= 4 && Math.random() < 0.4) {
      const a = randInt(2, 6);
      const b = coeff(9, true);
      const c = a * (x + b);
      return eqQuestion({
        topic: "twoStepEquations",
        prompt: "Solve for x:",
        equation: `${a}(x ${addTerm(b)}) = ${c}`,
        answer: x,
        feedback: `Divide both sides by ${a}: x ${addTerm(b)} = ${c / a}. Then x = ${c / a} - (${b}) = ${x}.`,
      });
    }

    // Level 5: non-integer solution for ax + b = c, half the time.
    if (level >= 5 && Math.random() < 0.5) {
      const a = randInt(2, 6);
      const b = coeff(12, true);
      let num; // a·x = num, non-divisible
      do { num = coeff(30, true); } while (num % a === 0);
      const r = rationalAnswer(num, a);
      const c = num + b;
      return eqQuestion({
        topic: "twoStepEquations",
        prompt: "Solve for x:",
        equation: `${a}x ${addTerm(b)} = ${c}`,
        answer: r.answer,
        acceptableAnswers: r.acceptable,
        feedback: `${undoTerm(b)}: ${a}x = ${num}. Divide by ${a}: x = ${num}/${a}${r.acceptable[1] ? ` = ${r.acceptable[1]}` : ""}.`,
      });
    }

    const divForm = level >= 2 && Math.random() < 0.35;
    if (divForm) {
      const a = randInt(2, 6);
      const b = allowNeg ? coeff(9, true) : randInt(1, 9);
      const c = x + b; // x/a + b = c with x divisible by a
      return eqQuestion({
        topic: "twoStepEquations",
        prompt: "Solve for x:",
        equation: `x/${a} ${addTerm(b)} = ${c}`,
        answer: x * a,
        feedback: `${undoTerm(b)}: x/${a} = ${x}. Multiply by ${a}: x = ${x * a}.`,
      });
    }

    const a = randInt(2, level <= 1 ? 5 : 9);
    const b = allowNeg ? coeff(12, true) : randInt(1, 12);
    const c = a * x + b;
    return eqQuestion({
      topic: "twoStepEquations",
      prompt: "Solve for x:",
      equation: `${a}x ${addTerm(b)} = ${c}`,
      answer: x,
      feedback: `${undoTerm(b)} on both sides: ${a}x = ${a * x}. Divide by ${a}: x = ${x}.`,
    });
  },
};

// ---- 5. Pronumerals on both sides ---------------------------------------------------

export const bothSidesEquations = {
  id: "bothSidesEquations",
  name: "Pronumerals on Both Sides",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["twoStepEquations"],
  nextSkillIds: [],

  generate(level) {
    const x = level >= 3 ? coeff(10, true) : randInt(1, 10);

    // Level 4+: bracket on one side, half the time: a(x + b) = cx + d.
    if (level >= 4 && Math.random() < 0.5) {
      const a = randInt(2, 5);
      let c;
      do { c = randInt(1, 6); } while (c === a);
      const b = coeff(8, true);
      const d = a * (x + b) - c * x;
      return eqQuestion({
        topic: "bothSidesEquations",
        prompt: "Solve for x:",
        equation: `${a}(x ${addTerm(b)}) = ${xTerm(c)} ${addTerm(d)}`,
        answer: x,
        feedback: `Expand: ${a}x ${addTerm(a * b)} = ${xTerm(c)} ${addTerm(d)}. Collect x on one side: ${a - c}x = ${d - a * b}, so x = ${x}.`,
      });
    }

    // ax + b = cx + d, a > c so collecting keeps a positive coefficient early.
    const a = randInt(level <= 2 ? 2 : 3, level <= 2 ? 5 : 8);
    let c;
    do { c = randInt(1, a - 1); } while (c === a);
    const b = level >= 3 ? coeff(12, true) : randInt(1, 9);
    const d = (a - c) * x + b;
    return eqQuestion({
      topic: "bothSidesEquations",
      prompt: "Solve for x:",
      equation: `${xTerm(a)} ${addTerm(b)} = ${xTerm(c)} ${addTerm(d)}`,
      answer: x,
      feedback: `Subtract ${xTerm(c)} from both sides: ${a - c}x ${addTerm(b)} = ${d}. Then ${a - c}x = ${d - b}, so x = ${x}.`,
    });
  },
};

// ---- 6. Word problems (model + solve, up to 2 steps) ---------------------------------

export const equationWordProblems = {
  id: "equationWordProblems",
  name: "Equation Word Problems",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["twoStepEquations"],
  nextSkillIds: ["verifySolution"],

  generate(level) {
    const kind = level <= 1 ? pick(["age", "lollies"])
      : level <= 3 ? pick(["taxi", "plan", "lollies"])
      : pick(["taxi", "plan", "samePrice"]);

    if (kind === "age") {
      const now = randInt(8, 14);
      const inYears = randInt(3, 20);
      return makeQuestion({
        topic: "equationWordProblems",
        text: `In ${inYears} years, Priya will be ${now + inYears} years old.\nHow old is Priya now?`,
        answer: now,
        feedback: `Let a be Priya's age: a + ${inYears} = ${now + inYears}, so a = ${now}.`,
        inputMode: "simple",
      });
    }
    if (kind === "lollies") {
      const each = randInt(3, 9);
      const friends = randInt(3, 6);
      const left = level <= 1 ? 0 : randInt(1, 5);
      const total = each * friends + left;
      return makeQuestion({
        topic: "equationWordProblems",
        text: `A bag of ${total} lollies is shared equally among ${friends} friends${left ? `, with ${left} left over` : ""}.\nHow many lollies does each friend get?`,
        answer: each,
        feedback: `Let n be the number each: ${friends}n${left ? ` + ${left}` : ""} = ${total}, so n = ${each}.`,
        inputMode: "simple",
      });
    }
    if (kind === "taxi") {
      const flag = randInt(3, 6);
      const perKm = randInt(2, 4);
      const km = level >= 5 && Math.random() < 0.5 ? randInt(4, 18) + 0.5 : randInt(4, 18);
      const total = flag + perKm * km;
      const totalStr = Number.isInteger(total) ? String(total) : total.toFixed(2);
      return makeQuestion({
        topic: "equationWordProblems",
        text: `A taxi charges a $${flag} flagfall plus $${perKm} per kilometre.\nA trip costs $${totalStr}. How many kilometres was the trip?`,
        answer: km,
        feedback: `Let k be the kilometres: ${flag} + ${perKm}k = ${total}. Subtract ${flag}: ${perKm}k = ${total - flag}. Divide by ${perKm}: k = ${km}.`,
        inputMode: "simple",
      });
    }
    if (kind === "plan") {
      const base = randInt(10, 30);
      const perGb = randInt(2, 8);
      const gb = randInt(2, 12);
      const total = base + perGb * gb;
      return makeQuestion({
        topic: "equationWordProblems",
        text: `A phone plan costs $${base} per month plus $${perGb} per gigabyte of data.\nOne month costs $${total}. How many gigabytes were used?`,
        answer: gb,
        feedback: `Let g be the gigabytes: ${base} + ${perGb}g = ${total}, so ${perGb}g = ${total - base} and g = ${gb}.`,
        inputMode: "simple",
      });
    }
    // samePrice → pronumerals on both sides in context.
    const aBase = randInt(10, 25);
    const bBase = randInt(30, 60);
    const aRate = randInt(4, 8);
    const bRate = randInt(1, aRate - 1);
    const h = Math.round((bBase - aBase) / (aRate - bRate));
    const aB = bBase - (aRate - bRate) * h; // adjust so h is a whole number
    return makeQuestion({
      topic: "equationWordProblems",
      text: `Gym A costs $${aB} to join plus $${aRate} per visit. Gym B costs $${bBase} to join plus $${bRate} per visit.\nAfter how many visits do the two gyms cost the same?`,
      answer: h,
      feedback: `Let v be the visits: ${aB} + ${aRate}v = ${bBase} + ${bRate}v. Then ${aRate - bRate}v = ${bBase - aB}, so v = ${h}.`,
      inputMode: "simple",
    });
  },
};

// ---- 7. Verify solutions by substitution ----------------------------------------------

export const verifySolution = {
  id: "verifySolution",
  name: "Verify by Substitution",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["twoStepEquations"],
  nextSkillIds: ["formulaSubstitution"],

  generate(level) {
    const x = level >= 3 ? coeff(9, true) : randInt(1, 9);
    const a = randInt(2, level <= 2 ? 5 : 8);
    const b = level >= 3 ? coeff(10, true) : randInt(1, 10);
    const c = a * x + b;
    const equation = `${a}x ${addTerm(b)} = ${c}`;

    if (level <= 2) {
      const isTrue = pick([true, false]);
      const candidate = isTrue ? x : x + pick([-2, -1, 1, 2]);
      const lhs = a * candidate + b;
      return eqQuestion({
        topic: "verifySolution",
        prompt: `Is x = ${candidate} a solution of this equation?`,
        equation,
        answer: isTrue ? "Yes" : "No",
        feedback: `Substitute x = ${candidate}: ${a} × ${candidate} ${addTerm(b)} = ${lhs}${isTrue ? ` ✓ — it equals ${c}` : `, but the equation needs ${c}`}. So the answer is ${isTrue ? "yes" : "no"}.`,
        answerMode: "trueFalse",
        options: ["Yes", "No"],
      });
    }

    // Levels 3+: pick the solution from four candidates.
    const wrongs = new Set();
    while (wrongs.size < 3) {
      const w = x + pick([-3, -2, -1, 1, 2, 3]);
      if (w !== x) wrongs.add(w);
    }
    const options = shuffle([x, ...wrongs]).map((v) => `x = ${v}`);
    return eqQuestion({
      topic: "verifySolution",
      prompt: "Which value is a solution of this equation? (Check by substituting.)",
      equation,
      answer: `x = ${x}`,
      feedback: `Substituting x = ${x}: ${a} × ${x} ${addTerm(b)} = ${c} ✓. The other values don't make the two sides equal.`,
      answerMode: "multipleChoice",
      options,
    });
  },
};

// ---- 8. Formulas → linear equations -----------------------------------------------------

export const formulaSubstitution = {
  id: "formulaSubstitution",
  name: "Equations from Formulas",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["verifySolution"],
  nextSkillIds: ["quadraticReasoning"],

  generate(level) {
    const kind = level <= 2 ? pick(["perimeter", "speed"]) : pick(["perimeter", "speed", "motion", "line"]);

    if (kind === "perimeter") {
      const l = randInt(6, 15);
      const w = randInt(2, l - 1);
      const P = 2 * l + 2 * w;
      return eqQuestion({
        topic: "formulaSubstitution",
        prompt: `The perimeter of a rectangle is P = 2l + 2w. Given P = ${P} and l = ${l}, find w.`,
        equation: `${P} = 2 × ${l} + 2w`,
        answer: w,
        feedback: `Substitute: ${P} = ${2 * l} + 2w. Subtract ${2 * l}: 2w = ${P - 2 * l}. So w = ${w}.`,
      });
    }
    if (kind === "speed") {
      const t = randInt(2, 6);
      const s = randInt(3, 12) * 10;
      const d = s * t;
      return eqQuestion({
        topic: "formulaSubstitution",
        prompt: `Distance is d = st. Given d = ${d} and s = ${s}, find t.`,
        equation: `${d} = ${s}t`,
        answer: t,
        feedback: `Divide both sides by ${s}: t = ${d} ÷ ${s} = ${t}.`,
      });
    }
    if (kind === "motion") {
      const u = randInt(2, 20);
      const aAcc = randInt(2, 6);
      const t = level >= 5 && Math.random() < 0.4 ? randInt(2, 8) + 0.5 : randInt(2, 10);
      const v = u + aAcc * t;
      return eqQuestion({
        topic: "formulaSubstitution",
        prompt: `Using v = u + at, with v = ${v}, u = ${u} and a = ${aAcc}, find t.`,
        equation: `${v} = ${u} + ${aAcc}t`,
        answer: t,
        feedback: `Subtract ${u}: ${aAcc}t = ${v - u}. Divide by ${aAcc}: t = ${t}.`,
      });
    }
    const m = randInt(2, 6);
    const cInt = coeff(9, true);
    const x = level >= 3 ? coeff(9, true) : randInt(1, 9);
    const y = m * x + cInt;
    return eqQuestion({
      topic: "formulaSubstitution",
      prompt: `A line has the rule y = mx + c. Given y = ${y}, m = ${m} and c = ${cInt}, find x.`,
      equation: `${y} = ${m}x ${addTerm(cInt)}`,
      answer: x,
      feedback: `${undoTerm(cInt)}: ${m}x = ${y - cInt}. Divide by ${m}: x = ${x}.`,
    });
  },
};

// ---- 9. Quadratic reasoning (why x² = c has two solutions) -------------------------------

export const quadraticReasoning = {
  id: "quadraticReasoning",
  name: "How Many Solutions? (x² = c)",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["oneStepEquations"],
  nextSkillIds: ["solveQuadratics"],

  generate(level) {
    if (level <= 2) {
      // List both solutions of x² = perfect square (the ± moment).
      const root = randInt(2, level <= 1 ? 9 : 12);
      const c = root * root;
      return eqQuestion({
        topic: "quadraticReasoning",
        prompt: "This equation has TWO solutions. Find both.",
        equation: `x² = ${c}`,
        answer: `${root}, -${root}`,
        feedback: `Both ${root}² and (−${root})² equal ${c} — squaring removes the sign. So x = ${root} or x = −${root}.`,
        answerMode: "multiPart",
        expectedParts: [
          { label: "(a)", prompt: "Positive solution", answer: String(root) },
          { label: "(b)", prompt: "Negative solution", answer: String(-root) },
        ],
      });
    }

    if (level <= 4) {
      // Count the solutions for c > 0, c = 0, c < 0.
      const variant = pick(["pos", "zero", "neg"]);
      const c = variant === "pos" ? randInt(1, 100) : variant === "zero" ? 0 : -randInt(1, 50);
      const answer = variant === "pos" ? "Two" : variant === "zero" ? "One" : "None";
      const why = variant === "pos"
        ? `both the positive and negative square roots work: (±√${c})² = ${c}`
        : variant === "zero"
          ? "only 0² = 0 — the positive and negative roots coincide"
          : "squaring any number never gives a negative result";
      return eqQuestion({
        topic: "quadraticReasoning",
        prompt: "How many solutions does this equation have?",
        equation: `x² = ${c}`,
        answer,
        feedback: `${answer} — ${why}.`,
        answerMode: "multipleChoice",
        options: ["None", "One", "Two"],
      });
    }

    // Level 5: true/false statements probing the reasoning itself.
    const items = [
      [`x² = 49 has exactly one solution`, "False", "it has two: 7 and −7 — squaring removes the sign"],
      [`x² = -16 has no solutions`, "True", "no number squares to a negative"],
      [`x = -9 is a solution of x² = 81`, "True", "(−9)² = 81"],
      [`the solutions of x² = 100 are 10 and -10`, "True", "(±10)² = 100"],
      [`x² = 0 has two different solutions`, "False", "only x = 0 works — the ± roots coincide"],
    ];
    const [claim, answer, why] = pick(items);
    return makeQuestion({
      topic: "quadraticReasoning",
      text: `True or false:\n${claim}.`,
      answer,
      feedback: `${answer} — ${why}.`,
      answerMode: "trueFalse",
      options: ["True", "False"],
    });
  },
};

// ---- 10. Solve ax² = c (exact + decimal approximations) -----------------------------------

const SURD_BASES = [2, 3, 5, 6, 7, 10];

export const solveQuadratics = {
  id: "solveQuadratics",
  name: "Solve ax² = c",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["quadraticReasoning"],
  nextSkillIds: ["quadraticFormulas"],

  generate(level) {
    if (level <= 2) {
      // Perfect squares; level 2 adds a coefficient. Both solutions.
      const root = randInt(2, 12);
      const a = level <= 1 ? 1 : randInt(2, 5);
      const c = a * root * root;
      return eqQuestion({
        topic: "solveQuadratics",
        prompt: "Solve, giving BOTH solutions.",
        equation: a === 1 ? `x² = ${c}` : `${a}x² = ${c}`,
        answer: `${root}, -${root}`,
        feedback: `${a === 1 ? "" : `Divide by ${a}: x² = ${root * root}. `}Take both square roots: x = ±${root}.`,
        answerMode: "multiPart",
        expectedParts: [
          { label: "(a)", prompt: "Positive solution", answer: String(root) },
          { label: "(b)", prompt: "Negative solution", answer: String(-root) },
        ],
      });
    }

    if (level === 3) {
      // Decimal approximation of the positive root.
      const a = pick([1, 2, 3]);
      let m;
      do { m = randInt(5, 90); } while (Number.isInteger(Math.sqrt(m)));
      const c = a * m;
      const exact = Math.sqrt(m);
      const q = makeQuestion({
        topic: "solveQuadratics",
        text: `Solve for the POSITIVE solution, correct to 1 decimal place.\n${a === 1 ? "" : a}x² = ${c}`,
        promptText: "Solve for the POSITIVE solution, correct to 1 decimal place.",
        mathExpression: `${a === 1 ? "" : a}x² = ${c}`,
        answer: (Math.round(exact * 10) / 10).toFixed(1),
        feedback: `x² = ${m}, so x = √${m} ≈ ${(Math.round(exact * 10) / 10).toFixed(1)} (the negative root −√${m} also solves it).`,
        inputMode: "simple",
      });
      q.check = (input) => {
        const n = Number(String(input ?? "").trim());
        return Number.isFinite(n) && Math.abs(n - exact) <= 0.05;
      };
      return q;
    }

    // Levels 4–5: EXACT surd form (MathLive). x² = k²·m → x = k√m.
    const m = pick(SURD_BASES);
    const k = level >= 5 ? randInt(2, 5) : pick([1, 2, 3]);
    const a = level >= 5 && Math.random() < 0.5 ? randInt(2, 4) : 1;
    const c = a * k * k * m;
    const exactStr = k === 1 ? `√${m}` : `${k}√${m}`;
    return eqQuestion({
      topic: "solveQuadratics",
      prompt: "Find the POSITIVE solution in exact (surd) form.",
      equation: `${a === 1 ? "" : a}x² = ${c}`,
      answer: k === 1 ? `sqrt(${m})` : `${k}sqrt(${m})`,
      acceptableAnswers: [`sqrt(${k * k * m})`, `${k}sqrt(${m})`],
      feedback: `${a === 1 ? "" : `Divide by ${a}: `}x² = ${k * k * m}, so x = √${k * k * m} = ${exactStr} (and −${exactStr}).`,
      inputMode: "math",
    });
  },
};

// ---- 11. Quadratics from formulas -----------------------------------------------------------

export const quadraticFormulas = {
  id: "quadraticFormulas",
  name: "Quadratics from Formulas",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["solveQuadratics", "formulaSubstitution"],
  nextSkillIds: [],

  generate(level) {
    const kind = level <= 2 ? "squareArea" : pick(["squareArea", "cubeSurface", "falling"]);

    if (kind === "squareArea") {
      const s = level >= 3 && Math.random() < 0.4 ? randInt(2, 12) + 0.5 : randInt(3, 15);
      const A = Math.round(s * s * 100) / 100;
      return eqQuestion({
        topic: "quadraticFormulas",
        prompt: `The area of a square is A = s². Given A = ${A}, find the side length s.`,
        equation: `s² = ${A}`,
        answer: s,
        feedback: `s = √${A} = ${s}. (−${s} also squares to ${A}, but a LENGTH can't be negative, so we keep only the positive root.)`,
      });
    }
    if (kind === "cubeSurface") {
      const s = randInt(2, 10);
      const SA = 6 * s * s;
      return eqQuestion({
        topic: "quadraticFormulas",
        prompt: `The surface area of a cube is SA = 6s². Given SA = ${SA}, find the edge length s.`,
        equation: `6s² = ${SA}`,
        answer: s,
        feedback: `Divide by 6: s² = ${s * s}. Then s = ${s} — only the positive root makes sense for a length.`,
      });
    }
    // Falling object d = 5t², find t (positive only) — decimal at high level.
    if (level >= 4 && Math.random() < 0.5) {
      let d;
      do { d = randInt(30, 400); } while (Number.isInteger(Math.sqrt(d / 5)));
      const exact = Math.sqrt(d / 5);
      const q = makeQuestion({
        topic: "quadraticFormulas",
        text: `A dropped object falls d = 5t² metres in t seconds.\nHow long does it take to fall ${d} m? Answer correct to 1 decimal place.`,
        answer: (Math.round(exact * 10) / 10).toFixed(1),
        feedback: `5t² = ${d}, so t² = ${d / 5} and t = √${d / 5} ≈ ${(Math.round(exact * 10) / 10).toFixed(1)} s. Time can't be negative, so we keep the positive root.`,
        inputMode: "simple",
      });
      q.check = (input) => {
        const n = Number(String(input ?? "").trim());
        return Number.isFinite(n) && Math.abs(n - exact) <= 0.05;
      };
      return q;
    }
    const t = randInt(2, 8);
    const d = 5 * t * t;
    return eqQuestion({
      topic: "quadraticFormulas",
      prompt: `A dropped object falls d = 5t² metres in t seconds. How long does it take to fall ${d} m?`,
      equation: `5t² = ${d}`,
      answer: t,
      feedback: `Divide by 5: t² = ${t * t}. Then t = ${t} s — time can't be negative, so only the positive root counts.`,
    });
  },
};

// The full ordered skill list — the ORDER is the conceptual progression.
export const EQUATIONS_SKILLS_LIST = [
  writeEquation,
  expressionVsEquation,
  oneStepEquations,
  twoStepEquations,
  bothSidesEquations,
  equationWordProblems,
  verifySolution,
  formulaSubstitution,
  quadraticReasoning,
  solveQuadratics,
  quadraticFormulas,
];

export default EQUATIONS_SKILLS_LIST;
