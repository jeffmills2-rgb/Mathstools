/*
  CHHS Exam Builder — Pythagoras Theorem Question Bank
  ----------------------------------------------------
  Save as:

  question-banks/pythagoras/index.js

  Includes:
  - Basic: calculating squares and square roots
  - Expected: unknown sides, decimal sides, Pythagorean triads,
    real-world problems, and multi-step problems
*/

import {
  createQuestion,
  QUESTION_KINDS,
  SPACE_SIZES
} from "../schemas/question.schema.js";

import {
  attachQuestionTranslations
} from "../utils/translation.js";

const TOPIC = "Pythagoras Theorem";

const TYPE_LIST = [
  { id: "squares", label: "Calculate squares" },
  { id: "square-roots", label: "Calculate square roots" },
  { id: "unknown-sides", label: "Calculating unknown sides" },
  { id: "decimal-sides", label: "Calculating unknown sides — decimals" },
  { id: "triads", label: "Pythagorean triads" },
  { id: "real-world", label: "Real-world problems" },
  { id: "multi-step", label: "Multi-step problems" }
];

const TRIPLES = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [20, 21, 29],
  [28, 45, 53],
  [33, 56, 65]
];

const DECIMAL_LEGS = [
  [6.2, 8.7],
  [4.8, 9.1],
  [7.3, 11.6],
  [5.4, 12.8],
  [9.5, 14.2],
  [10.6, 15.9],
  [8.4, 13.7],
  [11.2, 18.5]
];

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

function randomId(prefix = "pythagoras") {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.random()}`;
}

function fmt(n) {
  return Math.abs(n - Math.round(n)) < 1e-9 ? String(Math.round(n)) : Number(n).toFixed(1);
}

function round(n, dp = 1) {
  return Number(n).toFixed(dp);
}

function unit() {
  return choice(["cm", "m"]);
}

function pythagorasDiagram(diagramType, config = {}) {
  return {
    engine: "pythagoras-engine",
    config: {
      diagramType,
      ...config
    }
  };
}

function studentDrawDiagram(label = "Draw a diagram") {
  return pythagorasDiagram("student-diagram-space", { label });
}

function makeBalancedPlan(typeIds, count) {
  const ids = typeIds.length ? typeIds.slice() : TYPE_LIST.map(t => t.id);
  const plan = [];

  let i = 0;
  while (plan.length < count) {
    plan.push(ids[i % ids.length]);
    i += 1;
  }

  return shuffle(plan);
}

function squareQuestion() {
  const n = randInt(4, 18);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "squares",
    marks: 1,
    prompt: `Calculate: ${n}²`,
    answer: String(n * n),
    working: [`${n}² = ${n} × ${n} = ${n * n}`],
    space: SPACE_SIZES.SMALL,
    tags: ["pythagoras", "squares"]
  });
}

function squareRootQuestion() {
  const n = randInt(4, 18);
  const square = n * n;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "square-roots",
    marks: 1,
    prompt: `Calculate: √${square}`,
    answer: String(n),
    working: [`√${square} = ${n}`],
    space: SPACE_SIZES.SMALL,
    tags: ["pythagoras", "square roots"]
  });
}

function pythagorasQuestion({ decimal = false, missingMode = "mixed" } = {}) {
  let a;
  let b;
  let c;

  if (decimal) {
    [a, b] = choice(DECIMAL_LEGS);
    c = Math.sqrt(a * a + b * b);
  } else {
    [a, b, c] = choice(TRIPLES);
    const scale = choice([1, 2, 3, 4]);
    a *= scale;
    b *= scale;
    c *= scale;
  }

  if (a > b) {
    const temp = a;
    a = b;
    b = temp;
  }

  let missing = missingMode;
  if (missing === "mixed") missing = choice(["hypotenuse", "short-leg", "long-leg"]);

  const u = "x";
  const units = unit();

  const radicand =
    missing === "hypotenuse"
      ? a * a + b * b
      : missing === "short-leg"
        ? c * c - b * b
        : c * c - a * a;

  const answerRaw = Math.sqrt(radicand);
  const answer = `${round(answerRaw, decimal ? 1 : 0)} ${units}`;

  const labels = {
    a: `${fmt(a)} ${units}`,
    b: `${fmt(b)} ${units}`,
    c: `${fmt(c)} ${units}`
  };

  if (missing === "hypotenuse") labels.c = u;
  if (missing === "short-leg") labels.a = u;
  if (missing === "long-leg") labels.b = u;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: decimal ? "decimal-sides" : "unknown-sides",
    marks: 2,
    prompt: `Find the value of ${u}. Round your answer to ${decimal ? "1 decimal place" : "the nearest whole number"}.`,
    diagram: {
      engine: "pythagoras-engine",
      config: {
        diagramType: "right-triangle",
        a,
        b,
        c,
        labels,
        units
      }
    },
    answer,
    working: pythagorasSteps({ a, b, c, missing, u, units, decimal, radicand, answerRaw }),
    space: SPACE_SIZES.MEDIUM,
    tags: ["pythagoras", "unknown sides"]
  });
}

function pythagorasSteps({ a, b, c, missing, u, units, decimal, radicand, answerRaw }) {
  const dp = decimal ? 1 : 0;

  if (missing === "hypotenuse") {
    return [
      `${u}² = ${fmt(a)}² + ${fmt(b)}²`,
      `${u}² = ${fmt(radicand)}`,
      `${u} = √${fmt(radicand)}`,
      `${u} ≈ ${round(answerRaw, dp)} ${units}`
    ];
  }

  if (missing === "short-leg") {
    return [
      `${u}² + ${fmt(b)}² = ${fmt(c)}²`,
      `${u}² = ${fmt(c)}² − ${fmt(b)}²`,
      `${u}² = ${fmt(radicand)}`,
      `${u} ≈ ${round(answerRaw, dp)} ${units}`
    ];
  }

  return [
    `${fmt(a)}² + ${u}² = ${fmt(c)}²`,
    `${u}² = ${fmt(c)}² − ${fmt(a)}²`,
    `${u}² = ${fmt(radicand)}`,
    `${u} ≈ ${round(answerRaw, dp)} ${units}`
  ];
}

function triadQuestion() {
  const useMultipleChoice = Math.random() < 0.55;

  if (useMultipleChoice) {
    const good = choice(TRIPLES);
    const bad1 = [good[0], good[1], good[2] + choice([1, 2, 3])].sort((x, y) => x - y);
    const bad2 = choice([[6, 9, 12], [8, 15, 20], [5, 12, 15], [9, 12, 16]]);
    const bad3 = choice([[4, 7, 9], [7, 10, 13], [6, 8, 11], [12, 16, 21]]);

    const sets = shuffle([good, bad1, bad2, bad3]);
    const choices = sets.map(set => set.join(", "));
    const correct = good.join(", ");

    return createQuestion({
      id: randomId(),
      topic: TOPIC,
      level: "mixed",
      type: "triads",
      kind: QUESTION_KINDS.MULTIPLE_CHOICE,
      marks: 1,
      prompt: "Which set of side lengths forms a right-angled triangle?",
      choices,
      answer: correct,
      working: [`${good[0]}² + ${good[1]}² = ${good[2]}²`],
      space: SPACE_SIZES.NONE,
      tags: ["pythagoras", "triads"]
    });
  }

  const right = Math.random() < 0.55;
  let sides;

  if (right) {
    const triple = choice(TRIPLES);
    const scale = choice([1, 2, 3]);
    sides = triple.map(n => n * scale).sort((x, y) => x - y);
  } else {
    const [a, b, c] = choice(TRIPLES);
    sides = [a, b, c + choice([-2, -1, 1, 2, 3])].sort((x, y) => x - y);
  }

  const [a, b, c] = sides;
  const left = a * a + b * b;
  const rightSide = c * c;
  const answer = left === rightSide ? "Yes" : "No";

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "triads",
    marks: 2,
    prompt: `Do the side lengths ${a}, ${b}, ${c} form a right-angled triangle? Justify your answer.`,
    answer,
    working: [
      `${a}² + ${b}² = ${left}`,
      `${c}² = ${rightSide}`,
      left === rightSide
        ? "The triangle is right-angled."
        : "The triangle is not right-angled."
    ],
    space: SPACE_SIZES.MEDIUM,
    tags: ["pythagoras", "triads"]
  });
}

function realWorldQuestion() {
  const scenario = choice([
    "ladder-length",
    "ladder-height",
    "rectangle-diagonal",
    "screen-diagonal",
    "walk-path",
    "north-west-path",
    "ramp-length",
    "gate-brace",
    "guy-wire",
    "paper-diagonal",
    "square-diagonal",
    "driveway-slope"
  ]);

  if (scenario === "ladder-length") {
    const base = choice([3, 4, 5, 6, 7]);
    const height = choice([4, 5, 6, 8, 9, 12]);
    const ladder = Math.sqrt(base * base + height * height);

    return createQuestion({
      id: randomId(),
      topic: TOPIC,
      level: "mixed",
      type: "real-world",
      marks: 3,
      prompt: `A ladder reaches ${height} m up a wall. Its base is ${base} m from the wall. How long is the ladder?`,
      diagram: studentDrawDiagram(),
      answer: `${round(ladder, 1)} m`,
      working: [`x² = ${base}² + ${height}²`, `x² = ${fmt(base * base + height * height)}`, `x ≈ ${round(ladder, 1)} m`],
      space: SPACE_SIZES.LARGE,
      tags: ["pythagoras", "real world", "ladder"]
    });
  }

  if (scenario === "ladder-height") {
    const triples = [[3, 4, 5], [5, 12, 13], [8, 15, 17]];
    let [base, height, ladder] = choice(triples);
    const scale = choice([1, 2]);
    base *= scale;
    height *= scale;
    ladder *= scale;

    return createQuestion({
      id: randomId(),
      topic: TOPIC,
      level: "mixed",
      type: "real-world",
      marks: 3,
      prompt: `A ${ladder} m ladder leans against a wall. The foot of the ladder is ${base} m from the wall. How far up the wall does the ladder reach?`,
      diagram: studentDrawDiagram(),
      answer: `${height} m`,
      working: [`x² + ${base}² = ${ladder}²`, `x² = ${ladder}² − ${base}²`, `x² = ${height * height}`, `x = ${height} m`],
      space: SPACE_SIZES.LARGE,
      tags: ["pythagoras", "real world", "ladder"]
    });
  }

  if (scenario === "rectangle-diagonal") {
    const width = choice([6, 8, 9, 12, 16]);
    const height = choice([6, 8, 10, 12, 15]);
    const diagonal = Math.sqrt(width * width + height * height);

    return createQuestion({
      id: randomId(),
      topic: TOPIC,
      level: "mixed",
      type: "real-world",
      marks: 3,
      prompt: `A rectangular garden is ${width} m by ${height} m. Find the length of the diagonal path.`,
      diagram: studentDrawDiagram(),
      answer: `${round(diagonal, 1)} m`,
      working: [`x² = ${width}² + ${height}²`, `x² = ${fmt(width * width + height * height)}`, `x ≈ ${round(diagonal, 1)} m`],
      space: SPACE_SIZES.LARGE,
      tags: ["pythagoras", "real world", "rectangle"]
    });
  }

  if (scenario === "screen-diagonal") {
    const height = choice([30, 40, 50, 60]);
    const width = choice([40, 60, 80, 90]);
    const diagonal = Math.sqrt(height * height + width * width);

    return createQuestion({
      id: randomId(),
      topic: TOPIC,
      level: "mixed",
      type: "real-world",
      marks: 3,
      prompt: `A screen is ${height} cm high and ${width} cm wide. Find the diagonal length.`,
      diagram: studentDrawDiagram(),
      answer: `${round(diagonal, 1)} cm`,
      working: [`x² = ${height}² + ${width}²`, `x² = ${fmt(height * height + width * width)}`, `x ≈ ${round(diagonal, 1)} cm`],
      space: SPACE_SIZES.LARGE,
      tags: ["pythagoras", "real world", "screen"]
    });
  }

  if (scenario === "walk-path") {
    const east = choice([7, 9, 11, 12, 15]);
    const north = choice([8, 12, 15, 18]);
    const distance = Math.sqrt(east * east + north * north);

    return createQuestion({
      id: randomId(),
      topic: TOPIC,
      level: "mixed",
      type: "real-world",
      marks: 3,
      prompt: `A student walks ${east} m east and ${north} m north. How far are they from the starting point?`,
      diagram: studentDrawDiagram(),
      answer: `${round(distance, 1)} m`,
      working: [`x² = ${east}² + ${north}²`, `x² = ${fmt(east * east + north * north)}`, `x ≈ ${round(distance, 1)} m`],
      space: SPACE_SIZES.LARGE,
      tags: ["pythagoras", "real world", "distance"]
    });
  }

  if (scenario === "north-west-path") {
    const north = choice([12, 15, 18, 24]);
    const west = choice([10, 16, 18, 20]);
    const distance = Math.sqrt(north * north + west * west);

    return createQuestion({
      id: randomId(),
      topic: TOPIC,
      level: "mixed",
      type: "real-world",
      marks: 3,
      prompt: `A is ${north} km north of X. B is ${west} km west of X. How far is A from B in a straight line?`,
      diagram: studentDrawDiagram(),
      answer: `${round(distance, 1)} km`,
      working: [`x² = ${north}² + ${west}²`, `x² = ${fmt(north * north + west * west)}`, `x ≈ ${round(distance, 1)} km`],
      space: SPACE_SIZES.LARGE,
      tags: ["pythagoras", "real world", "distance"]
    });
  }

  if (scenario === "ramp-length") {
    const rise = choice([1.2, 2.5, 3.4, 4.2]);
    const run = choice([8.4, 12.2, 18.6, 30.7]);
    const ramp = Math.sqrt(rise * rise + run * run);

    return createQuestion({
      id: randomId(),
      topic: TOPIC,
      level: "mixed",
      type: "real-world",
      marks: 3,
      prompt: `A ramp rises ${rise} m over a horizontal distance of ${run} m. What is the length of the ramp, correct to 1 decimal place?`,
      diagram: studentDrawDiagram(),
      answer: `${round(ramp, 1)} m`,
      working: [`x² = ${rise}² + ${run}²`, `x² = ${fmt(rise * rise + run * run)}`, `x ≈ ${round(ramp, 1)} m`],
      space: SPACE_SIZES.LARGE,
      tags: ["pythagoras", "real world", "ramp"]
    });
  }

  if (scenario === "gate-brace") {
    const height = choice([1.2, 1.5, 1.8, 2.1]);
    const width = choice([1.6, 1.9, 2.4, 2.8]);
    const brace = Math.sqrt(height * height + width * width);

    return createQuestion({
      id: randomId(),
      topic: TOPIC,
      level: "mixed",
      type: "real-world",
      marks: 3,
      prompt: `A gate is ${height} m high and ${width} m wide. Find the length of the diagonal brace, correct to 1 decimal place.`,
      diagram: studentDrawDiagram(),
      answer: `${round(brace, 1)} m`,
      working: [`x² = ${height}² + ${width}²`, `x² = ${fmt(height * height + width * width)}`, `x ≈ ${round(brace, 1)} m`],
      space: SPACE_SIZES.LARGE,
      tags: ["pythagoras", "real world", "brace"]
    });
  }

  if (scenario === "guy-wire") {
    const pole = choice([12, 15, 18]);
    const fractionNumerator = 2;
    const fractionDenominator = 3;
    const attachHeight = pole * fractionNumerator / fractionDenominator;
    const ground = choice([4, 5, 6, 8]);
    const wire = Math.sqrt(attachHeight * attachHeight + ground * ground);

    return createQuestion({
      id: randomId(),
      topic: TOPIC,
      level: "mixed",
      type: "real-world",
      marks: 3,
      prompt: `A ${pole} m pole is supported by a guy wire attached to a point two-thirds of the way up the pole and to the ground ${ground} m from the base. What is the length of the guy wire?`,
      diagram: studentDrawDiagram(),
      answer: `${round(wire, 1)} m`,
      working: [
        `Attachment height = ${fractionNumerator}/${fractionDenominator} × ${pole} = ${fmt(attachHeight)} m`,
        `x² = ${fmt(attachHeight)}² + ${ground}²`,
        `x² = ${fmt(attachHeight * attachHeight + ground * ground)}`,
        `x ≈ ${round(wire, 1)} m`
      ],
      space: SPACE_SIZES.LARGE,
      tags: ["pythagoras", "real world", "guy wire"]
    });
  }

  if (scenario === "paper-diagonal") {
    const width = choice([21, 24, 30]);
    const height = choice([29.5, 32, 42]);
    const diagonal = Math.sqrt(width * width + height * height);

    return createQuestion({
      id: randomId(),
      topic: TOPIC,
      level: "mixed",
      type: "real-world",
      marks: 2,
      prompt: `Calculate the length of the diagonal of a piece of paper with dimensions ${width} cm by ${height} cm.`,
      diagram: studentDrawDiagram(),
      answer: `${round(diagonal, 1)} cm`,
      working: [`x² = ${width}² + ${height}²`, `x² = ${fmt(width * width + height * height)}`, `x ≈ ${round(diagonal, 1)} cm`],
      space: SPACE_SIZES.MEDIUM,
      tags: ["pythagoras", "real world", "paper"]
    });
  }

  if (scenario === "square-diagonal") {
    const side = choice([4.5, 6.5, 8, 12]);
    const diagonal = Math.sqrt(side * side + side * side);

    return createQuestion({
      id: randomId(),
      topic: TOPIC,
      level: "mixed",
      type: "real-world",
      marks: 2,
      prompt: `What is the length of the diagonal of a square of side ${side} m?`,
      diagram: studentDrawDiagram(),
      answer: `${round(diagonal, 1)} m`,
      working: [`x² = ${side}² + ${side}²`, `x² = ${fmt(2 * side * side)}`, `x ≈ ${round(diagonal, 1)} m`],
      space: SPACE_SIZES.MEDIUM,
      tags: ["pythagoras", "real world", "square"]
    });
  }

  const rise = choice([1.2, 1.5, 2.4, 3.6]);
  const run = choice([18.4, 24.6, 30.7, 36.2]);
  const driveway = Math.sqrt(rise * rise + run * run);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "real-world",
    marks: 3,
    prompt: `A driveway is to be built on a slope. The rise is ${rise} m and the horizontal distance is ${run} m. How long is the driveway, correct to 1 decimal place?`,
    diagram: pythagorasDiagram("ramp", {
      heightLabel: `${rise} m`,
      baseLabel: `${run} m`,
      rampLabel: "x"
    }),
    answer: `${round(driveway, 1)} m`,
    working: [`x² = ${rise}² + ${run}²`, `x² = ${fmt(rise * rise + run * run)}`, `x ≈ ${round(driveway, 1)} m`],
    space: SPACE_SIZES.LARGE,
    tags: ["pythagoras", "real world", "driveway"]
  });
}

function multiStepQuestion() {
  const a = choice([3, 5, 6, 8]);
  const b = choice([4, 8, 10, 12]);
  const d = choice([4, 5, 7, 9]);
  const firstSquare = a * a + b * b;
  const secondSquare = firstSquare + d * d;
  const y = Math.sqrt(secondSquare);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "multi-step",
    marks: 3,
    prompt: `A path forms two right triangles. The first has shorter sides ${a} m and ${b} m. The second uses this diagonal and another side of ${d} m. Find the final diagonal length.`,
    diagram: studentDrawDiagram(),
    answer: `${round(y, 1)} m`,
    working: [
      `First triangle: x² = ${a}² + ${b}²`,
      `x² = ${firstSquare}`,
      `Second triangle: y² = x² + ${d}²`,
      `y² = ${secondSquare}`,
      `y ≈ ${round(y, 1)} m`
    ],
    space: SPACE_SIZES.LARGE,
    tags: ["pythagoras", "multi-step"]
  });
}

const GENERATORS = {
  "squares": squareQuestion,
  "square-roots": squareRootQuestion,
  "unknown-sides": () => pythagorasQuestion({ decimal: false, missingMode: "mixed" }),
  "decimal-sides": () => pythagorasQuestion({ decimal: true, missingMode: "mixed" }),
  "triads": triadQuestion,
  "real-world": realWorldQuestion,
  "multi-step": multiStepQuestion
};

export function getPythagorasQuestionTypes() {
  return TYPE_LIST;
}

export function generatePythagorasQuestions({
  count = 8,
  allowedTypes = null
} = {}) {
  const typeIds = allowedTypes?.length
    ? allowedTypes
    : TYPE_LIST.map(t => t.id);

  const plan = makeBalancedPlan(typeIds, count);
  const questions = [];

  let safety = 0;

  while (questions.length < count && safety < count * 30) {
    const type = plan[questions.length % plan.length];
    const generator = GENERATORS[type];

    if (generator) {
      questions.push(generator());
    }

    safety += 1;
  }

  return questions.map(attachQuestionTranslations);
}
