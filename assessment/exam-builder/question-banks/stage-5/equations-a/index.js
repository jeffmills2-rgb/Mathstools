/*
  MMT Exam Builder — Stage 5 Equations A Question Bank
  ----------------------------------------------------
  Save as:

  question-banks/stage-5/equations-a/index.js

  Focus:
  - Linear equations up to 3 steps
  - Pronumerals on both sides
  - Grouping symbols
  - One algebraic fraction
  - Formula substitution and word problems

  Fraction notation is rendered with [[algfrac:numerator:denominator]] tokens.
*/

import {
  createQuestion,
  SPACE_SIZES
} from "../../../schemas/question.schema.js";

const TOPIC = "Equations A";

const TYPE_LIST = [
  { id: "linear-one-step", label: "One-step equations" },
  { id: "linear-two-step", label: "Two-step equations" },
  { id: "linear-three-step", label: "Three-step equations" },
  { id: "linear-negative-solutions", label: "Equations with negative solutions" },
  { id: "linear-decimals", label: "Equations with decimals" },
  { id: "mixed-linear-equations", label: "Mixed linear equations up to 3 steps" },
  { id: "pronumerals-both-sides", label: "Pronumerals on both sides" },
  { id: "pronumerals-both-sides-constants", label: "Pronumerals on both sides with constants" },
  { id: "pronumerals-both-sides-negative", label: "Pronumerals on both sides with negative terms" },
  { id: "verify-solution-substitution", label: "Verify a proposed solution by substitution" },
  { id: "equations-one-bracket", label: "Equations involving one set of brackets" },
  { id: "equations-brackets-both-sides", label: "Equations involving brackets on both sides" },
  { id: "expand-simplify-solve", label: "Expand, simplify and solve" },
  { id: "mixed-grouping-equations", label: "Mixed grouping-symbol equations" },
  { id: "fraction-x-over-number", label: "Equations with x over a number" },
  { id: "fraction-linear-numerator", label: "Equations with a linear numerator over a number" },
  { id: "fraction-with-constant", label: "Equations with one algebraic fraction and a constant" },
  { id: "mixed-algebraic-fraction-equations", label: "Mixed equations with one algebraic fraction" },
  { id: "substitute-formulas-solve", label: "Substitute into formulas and solve" },
  { id: "write-equation-word-problem", label: "Write an equation from a word problem" },
  { id: "number-word-problems", label: "Solve number word problems" },
  { id: "geometry-word-problems", label: "Solve geometry word problems" },
  { id: "money-sharing-word-problems", label: "Solve money/sharing word problems" },
  { id: "mixed-equation-word-problems", label: "Mixed equation word problems" }
];

const VARIABLES = ["x", "a", "b", "m", "n", "p", "q", "r", "t", "w", "y", "z"];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function choice(items) {
  return items[randInt(0, items.length - 1)];
}

function shuffle(items) {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function randomId(prefix = "equations-a") {
  return globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function pickVar() {
  return choice(VARIABLES);
}

function fmt(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  if (Object.is(n, -0)) return "0";
  return n < 0 ? `−${Math.abs(n)}` : String(n);
}

function fmtDecimal(value, places = 1) {
  const n = Number(value);
  const rounded = Number(n.toFixed(places));
  return fmt(rounded);
}

function formatSignedConstant(value) {
  const n = Number(value);
  return n < 0 ? `− ${Math.abs(n)}` : `+ ${n}`;
}

function formatVariableTerm(coef, variable, isFirst = false) {
  if (coef === 0) return "";
  const sign = coef < 0 ? "−" : "+";
  const abs = Math.abs(coef);
  const body = abs === 1 ? variable : `${abs}${variable}`;
  if (isFirst) return coef < 0 ? `−${body}` : body;
  return ` ${sign} ${body}`;
}

function formatConstant(value, isFirst = false) {
  if (value === 0) return "";
  const sign = value < 0 ? "−" : "+";
  const abs = Math.abs(value);
  if (isFirst) return value < 0 ? `−${abs}` : String(abs);
  return ` ${sign} ${abs}`;
}

function formatLinear(coef, constant, variable) {
  let out = "";
  if (coef !== 0) out += formatVariableTerm(coef, variable, true);
  if (constant !== 0 || out === "") out += formatConstant(constant, out === "");
  return out.trim();
}

function formatMathFraction(numerator, denominator) {
  return `[[algfrac:${numerator}:${denominator}]]`;
}

function equationAnswer(variable, value, unit = "") {
  return `${variable} = ${fmt(value)}${unit ? ` ${unit}` : ""}`;
}

function makeBalancedPlan(typeIds, count) {
  const ids = typeIds.length ? typeIds.slice() : TYPE_LIST.map(type => type.id);
  const out = [];
  let i = 0;
  while (out.length < count) {
    out.push(ids[i % ids.length]);
    i += 1;
  }
  return shuffle(out);
}

function equationQuestion({ type, marks = 1, prompt, answer, working = [], space = SPACE_SIZES.MEDIUM, tags = [] }) {
  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type,
    marks,
    prompt,
    answer,
    working,
    space,
    tags: ["stage-5", "equations-a", type, ...tags]
  });
}

function oneStepEquationQuestion() {
  const v = pickVar();
  const x = randInt(2, 12);
  const template = choice(["multiply", "divide", "add", "subtract", "subtract-from"]);

  if (template === "multiply") {
    const a = randInt(2, 9);
    const prompt = `Solve: ${a}${v} = ${a * x}`;
    return equationQuestion({
      type: "linear-one-step",
      prompt,
      answer: equationAnswer(v, x),
      working: [`Divide both sides by ${a}.`, `${v} = ${x}`],
      space: SPACE_SIZES.SMALL
    });
  }

  if (template === "divide") {
    const d = randInt(2, 9);
    const prompt = `Solve: ${formatMathFraction(v, d)} = ${x}`;
    return equationQuestion({
      type: "linear-one-step",
      prompt,
      answer: equationAnswer(v, d * x),
      working: [`Multiply both sides by ${d}.`, `${v} = ${d * x}`],
      space: SPACE_SIZES.SMALL
    });
  }

  if (template === "add") {
    const c = randInt(2, 15);
    const prompt = `Solve: ${v} + ${c} = ${x + c}`;
    return equationQuestion({
      type: "linear-one-step",
      prompt,
      answer: equationAnswer(v, x),
      working: [`Subtract ${c} from both sides.`, `${v} = ${x}`],
      space: SPACE_SIZES.SMALL
    });
  }

  if (template === "subtract") {
    const c = randInt(2, 15);
    const prompt = `Solve: ${v} − ${c} = ${x - c}`;
    return equationQuestion({
      type: "linear-one-step",
      prompt,
      answer: equationAnswer(v, x),
      working: [`Add ${c} to both sides.`, `${v} = ${x}`],
      space: SPACE_SIZES.SMALL
    });
  }

  const c = randInt(12, 30);
  const prompt = `Solve: ${c} − ${v} = ${c - x}`;
  return equationQuestion({
    type: "linear-one-step",
    prompt,
    answer: equationAnswer(v, x),
    working: [`Rearrange or add ${v} to both sides.`, `${v} = ${x}`],
    space: SPACE_SIZES.SMALL
  });
}

function twoStepEquationQuestion(type = "linear-two-step", forceNegative = false) {
  const v = pickVar();
  const x = forceNegative ? -randInt(2, 10) : choice([randInt(2, 12), -randInt(2, 8)]);
  const a = randInt(2, 9);
  const b = randInt(2, 15);
  const plus = Math.random() < 0.5;
  const rhs = plus ? a * x + b : a * x - b;
  const prompt = `Solve: ${a}${v} ${plus ? "+" : "−"} ${b} = ${fmt(rhs)}`;

  return equationQuestion({
    type,
    marks: 2,
    prompt,
    answer: equationAnswer(v, x),
    working: [
      `${a}${v} = ${fmt(plus ? rhs - b : rhs + b)}`,
      `${v} = ${fmt(x)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function threeStepEquationQuestion() {
  const v = pickVar();
  const x = choice([randInt(2, 9), -randInt(2, 6)]);
  const a = randInt(2, 6);
  const b = randInt(2, 8);
  const c = randInt(2, 10);
  const rhs = a * (x + b) - c;
  const prompt = `Solve: ${a}(${v} + ${b}) − ${c} = ${fmt(rhs)}`;

  return equationQuestion({
    type: "linear-three-step",
    marks: 2,
    prompt,
    answer: equationAnswer(v, x),
    working: [
      `${a}(${v} + ${b}) = ${fmt(rhs + c)}`,
      `${v} + ${b} = ${fmt(x + b)}`,
      `${v} = ${fmt(x)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function negativeSolutionQuestion() {
  return twoStepEquationQuestion("linear-negative-solutions", true);
}

function decimalEquationQuestion() {
  const v = pickVar();
  const x = choice([2.5, 3.5, 4.5, 5.5, 6.5, 7.5]);
  const a = choice([1.2, 1.5, 2.4, 2.5, 3.2]);
  const b = choice([0.5, 1.5, 2.5, 3.5]);
  const rhs = a * x + b;
  const prompt = `Solve: ${a}${v} + ${b} = ${fmtDecimal(rhs, 2)}`;

  return equationQuestion({
    type: "linear-decimals",
    marks: 2,
    prompt,
    answer: `${v} = ${fmtDecimal(x, 1)}`,
    working: [
      `${a}${v} = ${fmtDecimal(rhs - b, 2)}`,
      `${v} = ${fmtDecimal(x, 1)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function mixedLinearEquationQuestion() {
  return choice([
    oneStepEquationQuestion,
    twoStepEquationQuestion,
    threeStepEquationQuestion,
    negativeSolutionQuestion,
    decimalEquationQuestion
  ])();
}

function pronumeralsBothSidesQuestion(type = "pronumerals-both-sides", forceNegative = false, includeConstants = true) {
  const v = pickVar();
  const x = forceNegative ? -randInt(2, 8) : randInt(2, 10);
  let a = randInt(4, 10);
  let c = randInt(1, 7);
  while (a === c) c = randInt(1, 7);

  if (forceNegative && a < c) [a, c] = [c, a];

  const b = includeConstants ? choice([-9, -7, -5, -3, 3, 5, 7, 9]) : 0;
  const d = (a - c) * x + b;
  const lhs = formatLinear(a, b, v);
  const rhs = formatLinear(c, d, v);

  return equationQuestion({
    type,
    marks: 2,
    prompt: `Solve: ${lhs} = ${rhs}`,
    answer: equationAnswer(v, x),
    working: [
      `Collect the ${v} terms on one side and constants on the other side.`,
      `${a - c}${v} = ${fmt((a - c) * x)}`,
      `${v} = ${fmt(x)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function verifySolutionQuestion() {
  const v = pickVar();
  const x = randInt(2, 10);
  const a = randInt(2, 7);
  const b = randInt(1, 9);
  const rhs = a * x + b;
  const proposed = Math.random() < 0.55 ? x : x + choice([-2, -1, 1, 2, 3]);
  const correct = proposed === x;
  const prompt = `Verify by substitution whether ${v} = ${fmt(proposed)} is a solution to ${a}${v} + ${b} = ${rhs}.`;

  return equationQuestion({
    type: "verify-solution-substitution",
    marks: 1,
    prompt,
    answer: correct ? "Yes" : "No",
    working: [
      `Substitute ${v} = ${fmt(proposed)}.`,
      `${a} × ${fmt(proposed)} + ${b} = ${fmt(a * proposed + b)}`,
      correct ? `This equals ${rhs}, so it is a solution.` : `This does not equal ${rhs}, so it is not a solution.`
    ],
    space: SPACE_SIZES.SMALL
  });
}

function oneBracketEquationQuestion(type = "equations-one-bracket") {
  const v = pickVar();
  const x = choice([randInt(2, 10), -randInt(2, 6)]);
  const a = randInt(2, 7);
  const b = choice([-6, -4, -3, 2, 3, 4, 5, 6]);
  const rhs = a * (x + b);
  const prompt = `Solve: ${a}(${v} ${formatSignedConstant(b)}) = ${fmt(rhs)}`;

  return equationQuestion({
    type,
    marks: 2,
    prompt,
    answer: equationAnswer(v, x),
    working: [
      `${v} ${formatSignedConstant(b)} = ${fmt(x + b)}`,
      `${v} = ${fmt(x)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function bracketsBothSidesQuestion(type = "equations-brackets-both-sides") {
  const v = pickVar();
  const x = choice([randInt(2, 8), -randInt(2, 5)]);
  let a = randInt(2, 6);
  let c = randInt(2, 6);
  while (a === c) c = randInt(2, 6);
  const b = choice([-5, -3, -2, 2, 3, 4, 5]);
  const d = (a * (x + b) / c) - x;

  if (!Number.isInteger(d) || d === 0 || Math.abs(d) > 10) {
    return bracketsBothSidesQuestion(type);
  }

  const prompt = `Solve: ${a}(${v} ${formatSignedConstant(b)}) = ${c}(${v} ${formatSignedConstant(d)})`;

  return equationQuestion({
    type,
    marks: 2,
    prompt,
    answer: equationAnswer(v, x),
    working: [
      `Expand both sides and collect like terms.`,
      `${formatLinear(a, a * b, v)} = ${formatLinear(c, c * d, v)}`,
      `${v} = ${fmt(x)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function expandSimplifySolveQuestion(type = "expand-simplify-solve") {
  const v = pickVar();
  const x = choice([randInt(2, 9), -randInt(2, 6)]);
  let a = randInt(2, 6);
  let c = randInt(1, 5);
  while (a === c) c = randInt(1, 5);
  const b = choice([-5, -3, -2, 2, 3, 4, 5]);
  const d = choice([-4, -2, 2, 3, 4]);
  const e = choice([-7, -5, 3, 4, 6, 8]);
  const f = a * (x + b) + e - c * (x + d);
  const prompt = `Solve: ${a}(${v} ${formatSignedConstant(b)}) ${formatSignedConstant(e)} = ${c}(${v} ${formatSignedConstant(d)}) ${formatSignedConstant(f)}`;

  return equationQuestion({
    type,
    marks: 2,
    prompt,
    answer: equationAnswer(v, x),
    working: [
      `Expand the brackets and collect like terms.`,
      `${formatLinear(a, a * b + e, v)} = ${formatLinear(c, c * d + f, v)}`,
      `${v} = ${fmt(x)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function mixedGroupingQuestion() {
  return choice([oneBracketEquationQuestion, bracketsBothSidesQuestion, expandSimplifySolveQuestion])("mixed-grouping-equations");
}

function fractionXOverNumberQuestion(type = "fraction-x-over-number") {
  const v = pickVar();
  const denominator = randInt(2, 9);
  const rhs = randInt(2, 12);
  const prompt = `Solve: ${formatMathFraction(v, denominator)} = ${rhs}`;

  return equationQuestion({
    type,
    marks: 1,
    prompt,
    answer: equationAnswer(v, denominator * rhs),
    working: [
      `Multiply both sides by ${denominator}.`,
      `${v} = ${denominator * rhs}`
    ],
    space: SPACE_SIZES.SMALL
  });
}

function fractionLinearNumeratorQuestion(type = "fraction-linear-numerator") {
  const v = pickVar();
  const denominator = randInt(2, 8);
  const x = choice([randInt(2, 12), -randInt(2, 6)]);
  const constant = choice([-9, -7, -5, -3, 3, 5, 7, 9]);
  const rhs = (x + constant) / denominator;

  if (!Number.isInteger(rhs)) return fractionLinearNumeratorQuestion(type);

  const numerator = formatLinear(1, constant, v);
  const prompt = `Solve: ${formatMathFraction(numerator, denominator)} = ${fmt(rhs)}`;

  return equationQuestion({
    type,
    marks: 2,
    prompt,
    answer: equationAnswer(v, x),
    working: [
      `${numerator} = ${fmt(rhs * denominator)}`,
      `${v} = ${fmt(x)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function fractionWithConstantQuestion(type = "fraction-with-constant") {
  const v = pickVar();
  const denominator = randInt(2, 8);
  const coef = randInt(2, 6);
  const x = choice([randInt(2, 10), -randInt(2, 6)]);
  const constant = choice([-7, -5, -3, 3, 5, 7]);
  const outside = choice([-5, -3, -2, 2, 3, 4, 5]);
  const fractionValue = (coef * x + constant) / denominator;

  if (!Number.isInteger(fractionValue)) return fractionWithConstantQuestion(type);

  const rhs = fractionValue + outside;
  const numerator = formatLinear(coef, constant, v);
  const prompt = `Solve: ${formatMathFraction(numerator, denominator)} ${formatSignedConstant(outside)} = ${fmt(rhs)}`;

  return equationQuestion({
    type,
    marks: 2,
    prompt,
    answer: equationAnswer(v, x),
    working: [
      `${formatMathFraction(numerator, denominator)} = ${fmt(rhs - outside)}`,
      `${numerator} = ${fmt((rhs - outside) * denominator)}`,
      `${v} = ${fmt(x)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function mixedAlgebraicFractionEquationQuestion() {
  return choice([fractionXOverNumberQuestion, fractionLinearNumeratorQuestion, fractionWithConstantQuestion])("mixed-algebraic-fraction-equations");
}

function substituteFormulaQuestion() {
  const scenario = choice(["perimeter", "speed", "cost", "temperature"]);

  if (scenario === "perimeter") {
    const w = randInt(4, 14);
    const l = randInt(w + 3, w + 15);
    const p = 2 * l + 2 * w;
    return equationQuestion({
      type: "substitute-formulas-solve",
      marks: 2,
      prompt: `Use P = 2l + 2w. If P = ${p} cm and l = ${l} cm, calculate w.`,
      answer: `w = ${w} cm`,
      working: [`${p} = 2 × ${l} + 2w`, `${p} = ${2 * l} + 2w`, `2w = ${2 * w}`, `w = ${w} cm`],
      space: SPACE_SIZES.MEDIUM
    });
  }

  if (scenario === "speed") {
    const speed = randInt(40, 90);
    const time = randInt(2, 6);
    const distance = speed * time;
    return equationQuestion({
      type: "substitute-formulas-solve",
      marks: 2,
      prompt: `Use d = st. If d = ${distance} km and t = ${time} hours, calculate s.`,
      answer: `s = ${speed} km/h`,
      working: [`${distance} = s × ${time}`, `s = ${distance} ÷ ${time}`, `s = ${speed} km/h`],
      space: SPACE_SIZES.MEDIUM
    });
  }

  if (scenario === "cost") {
    const n = randInt(6, 20);
    const fixed = randInt(10, 40);
    const rate = randInt(3, 12);
    const cost = fixed + rate * n;
    return equationQuestion({
      type: "substitute-formulas-solve",
      marks: 2,
      prompt: `Use C = ${fixed} + ${rate}n. If C = $${cost}, calculate n.`,
      answer: `n = ${n}`,
      working: [`${cost} = ${fixed} + ${rate}n`, `${rate}n = ${rate * n}`, `n = ${n}`],
      space: SPACE_SIZES.MEDIUM
    });
  }

  const c = choice([10, 20, 25, 30]);
  const f = Math.round((9 * c) / 5 + 32);
  return equationQuestion({
    type: "substitute-formulas-solve",
    marks: 2,
    prompt: `Use F = ${formatMathFraction("9C", 5)} + 32. If F = ${f}, calculate C.`,
    answer: `C = ${c}`,
    working: [`${f} = ${formatMathFraction("9C", 5)} + 32`, `${f - 32} = ${formatMathFraction("9C", 5)}`, `C = ${c}`],
    space: SPACE_SIZES.MEDIUM
  });
}

function writeEquationWordProblem() {
  const x = randInt(3, 15);
  const a = randInt(2, 5);
  const b = randInt(3, 12);
  const result = a * x + b;
  const noun = choice(["number", "value", "score"]);

  return equationQuestion({
    type: "write-equation-word-problem",
    marks: 2,
    prompt: `When ${b} is added to ${a} times a ${noun}, the result is ${result}. Write an equation and solve it to calculate the ${noun}.`,
    answer: `${noun} = ${x}`,
    working: [`Let ${noun === "number" ? "n" : "x"} be the ${noun}.`, `${a}${noun === "number" ? "n" : "x"} + ${b} = ${result}`, `${noun === "number" ? "n" : "x"} = ${x}`],
    space: SPACE_SIZES.LARGE
  });
}

function numberWordProblem() {
  const template = choice(["consecutive", "more-than", "fraction"]);

  if (template === "consecutive") {
    const first = randInt(6, 25);
    const sum = first + first + 1 + first + 2;
    return equationQuestion({
      type: "number-word-problems",
      marks: 2,
      prompt: `The sum of 3 consecutive whole numbers is ${sum}. Calculate the largest number.`,
      answer: `${first + 2}`,
      working: [`Let the numbers be n, n + 1 and n + 2.`, `3n + 3 = ${sum}`, `n = ${first}`, `Largest number = ${first + 2}`],
      space: SPACE_SIZES.LARGE
    });
  }

  if (template === "fraction") {
    const x = randInt(12, 60);
    const b = randInt(4, 20);
    const result = x - b;
    return equationQuestion({
      type: "number-word-problems",
      marks: 2,
      prompt: `When ${b} is subtracted from a number, the result is ${formatMathFraction("1", "2")} of the number. Calculate the number.`,
      answer: `${x}`,
      working: [`Let the number be n.`, `n − ${b} = ${formatMathFraction("n", "2")}`, `n = ${x}`],
      space: SPACE_SIZES.LARGE
    });
  }

  const x = randInt(4, 18);
  const result = 3 * x - 5;
  return equationQuestion({
    type: "number-word-problems",
    marks: 2,
    prompt: `Five less than 3 times a number is ${result}. Calculate the number.`,
    answer: `${x}`,
    working: [`Let the number be n.`, `3n − 5 = ${result}`, `n = ${x}`],
    space: SPACE_SIZES.LARGE
  });
}

function geometryWordProblem() {
  const template = choice(["rectangle", "triangle", "isosceles"]);

  if (template === "rectangle") {
    const w = randInt(4, 16);
    const multiplier = randInt(2, 4);
    const l = multiplier * w;
    const p = 2 * (l + w);
    return equationQuestion({
      type: "geometry-word-problems",
      marks: 2,
      prompt: `The length of a rectangle is ${multiplier} times its width. The perimeter is ${p} cm. Calculate the width of the rectangle.`,
      answer: `${w} cm`,
      working: [`Let the width be w.`, `Length = ${multiplier}w`, `2(${multiplier}w + w) = ${p}`, `w = ${w} cm`],
      space: SPACE_SIZES.LARGE
    });
  }

  if (template === "triangle") {
    const x = randInt(20, 45);
    const c = 180 - 4 * x;
    if (c < 5 || c > 50) return geometryWordProblem();
    return equationQuestion({
      type: "geometry-word-problems",
      marks: 2,
      prompt: `The angles in a triangle are x°, 2x° and (x + ${c})°. Calculate the size of the smallest angle.`,
      answer: `${x}°`,
      working: [`x + 2x + x + ${c} = 180`, `4x = ${180 - c}`, `x = ${x}`],
      space: SPACE_SIZES.LARGE
    });
  }

  const vertex = choice([30, 36, 40, 50]);
  const base = (180 - vertex) / 2;
  return equationQuestion({
    type: "geometry-word-problems",
    marks: 2,
    prompt: `In an isosceles triangle, each base angle is ${base}°. Let the remaining angle be x°. Write an equation and calculate x.`,
    answer: `${vertex}°`,
    working: [`${base} + ${base} + x = 180`, `x = ${vertex}°`],
    space: SPACE_SIZES.MEDIUM
  });
}

function moneySharingWordProblem() {
  const b = randInt(12, 60);
  const extra = randInt(4, 18);
  const a = 2 * b + extra;
  const total = a + b;
  const names = choice([
    ["Mia", "Noah"],
    ["Aisha", "Ben"],
    ["Sophie", "Leo"],
    ["Grace", "Tom"]
  ]);

  return equationQuestion({
    type: "money-sharing-word-problems",
    marks: 2,
    prompt: `${names[0]} and ${names[1]} share $${total}. ${names[0]}'s share is $${extra} more than twice ${names[1]}'s share. Calculate how much each person receives.`,
    answer: `${names[0]} receives $${a}; ${names[1]} receives $${b}`,
    working: [`Let ${names[1]}'s share be n.`, `2n + ${extra} + n = ${total}`, `n = ${b}`, `${names[0]}'s share = ${a}`],
    space: SPACE_SIZES.LARGE
  });
}

function mixedEquationWordProblem() {
  return choice([
    writeEquationWordProblem,
    numberWordProblem,
    geometryWordProblem,
    moneySharingWordProblem,
    substituteFormulaQuestion
  ])();
}

const GENERATORS = {
  "linear-one-step": oneStepEquationQuestion,
  "linear-two-step": twoStepEquationQuestion,
  "linear-three-step": threeStepEquationQuestion,
  "linear-negative-solutions": negativeSolutionQuestion,
  "linear-decimals": decimalEquationQuestion,
  "mixed-linear-equations": mixedLinearEquationQuestion,
  "pronumerals-both-sides": pronumeralsBothSidesQuestion,
  "pronumerals-both-sides-constants": () => pronumeralsBothSidesQuestion("pronumerals-both-sides-constants", false, true),
  "pronumerals-both-sides-negative": () => pronumeralsBothSidesQuestion("pronumerals-both-sides-negative", true, true),
  "verify-solution-substitution": verifySolutionQuestion,
  "equations-one-bracket": oneBracketEquationQuestion,
  "equations-brackets-both-sides": bracketsBothSidesQuestion,
  "expand-simplify-solve": expandSimplifySolveQuestion,
  "mixed-grouping-equations": mixedGroupingQuestion,
  "fraction-x-over-number": fractionXOverNumberQuestion,
  "fraction-linear-numerator": fractionLinearNumeratorQuestion,
  "fraction-with-constant": fractionWithConstantQuestion,
  "mixed-algebraic-fraction-equations": mixedAlgebraicFractionEquationQuestion,
  "substitute-formulas-solve": substituteFormulaQuestion,
  "write-equation-word-problem": writeEquationWordProblem,
  "number-word-problems": numberWordProblem,
  "geometry-word-problems": geometryWordProblem,
  "money-sharing-word-problems": moneySharingWordProblem,
  "mixed-equation-word-problems": mixedEquationWordProblem
};

export function getEquationsAQuestionTypes() {
  return TYPE_LIST.map(type => ({ ...type }));
}

export function generateEquationsAQuestions({
  count = 6,
  allowedTypes = []
} = {}) {
  const safeTypes = allowedTypes.filter(type => GENERATORS[type]);
  const plan = makeBalancedPlan(safeTypes, count);
  return plan.map(type => (GENERATORS[type] || GENERATORS["linear-two-step"])());
}
