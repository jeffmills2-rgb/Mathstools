/*
  MMT Exam Builder — Stage 5 Non-Linear Relationships B Question Bank
  --------------------------------------------------------------------
  Save as:

  question-banks/stage-5/non-linear-relationships-b/index.js

  Focus:
  - features of y = kx² and y = kx² + c
  - features of y = aˣ
  - distinguishing linear, quadratic and exponential relationships
  - graph-based simultaneous equations where one relationship is non-linear
*/

import {
  createQuestion,
  SPACE_SIZES
} from "../../../schemas/question.schema.js";

const TOPIC = "Non-Linear Relationships B";

const TYPE_LIST = [
  { id: "nonlinear-b-quadratic-features", label: "Identify features of parabolas y = kx² + c" },
  { id: "nonlinear-b-compare-parabolas", label: "Compare parabolas of the form y = kx² and y = kx² + c" },
  { id: "nonlinear-b-exponential-features", label: "Identify features of exponential curves y = aˣ" },
  { id: "nonlinear-b-which-graph", label: "Select the matching graph for a given equation" },
  { id: "nonlinear-b-match-equation-graph", label: "Match graphs with linear, quadratic and exponential equations" },
  { id: "nonlinear-b-distinguish-table", label: "Distinguish relationship types from tables" },
  { id: "nonlinear-b-simultaneous-linear-quadratic", label: "Solve a linear-quadratic pair using a graph" },
  { id: "nonlinear-b-simultaneous-linear-exponential", label: "Solve a linear-exponential pair using a graph" },
  { id: "nonlinear-b-real-life-problems", label: "Solve simple real-life non-linear relationship problems" }
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

function randomId(prefix = "nonlinear-b") {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

function signTerm(value) {
  if (value === 0) return "";
  return value > 0 ? ` + ${value}` : ` − ${Math.abs(value)}`;
}

function quadraticEquation({ a = 1, b = 0, c = 0 }) {
  const first = a === 1 ? "x²" : a === -1 ? "−x²" : `${a}x²`;
  const middle = b === 0 ? "" : b > 0 ? ` + ${b === 1 ? "x" : `${b}x`}` : ` − ${Math.abs(b) === 1 ? "x" : `${Math.abs(b)}x`}`;
  return `y = ${first}${middle}${signTerm(c)}`;
}

function linearEquation({ m = 1, c = 0 }) {
  const first = m === 1 ? "x" : m === -1 ? "−x" : `${m}x`;
  return `y = ${first}${signTerm(c)}`;
}

function exponentialTerm({ coefficient = 1, base = 2 }) {
  const coeff = coefficient === 1 ? "" : `${coefficient}`;
  const bracketedBase = coefficient === 1 ? `${base}` : `(${base})`;
  return `${coeff}${bracketedBase}ˣ`;
}

function exponentialEquation({ coefficient = 1, base = 2, c = 0 }) {
  return `y = ${exponentialTerm({ coefficient, base })}${signTerm(c)}`;
}

function nonlinearBQuestion({ type, marks = 2, prompt, answer, working = [], table = null, diagram = null, choices = null, matching = null, space = SPACE_SIZES.MEDIUM, tags = [] }) {
  const question = createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type,
    marks,
    prompt,
    diagram,
    answer,
    working,
    space,
    tags: ["stage-5", "non-linear-relationships", "non-linear-relationships-b", type, ...tags]
  });

  if (table) question.table = table;
  if (choices) question.choices = choices;
  if (matching) question.matching = matching;
  return question;
}

function quadraticFeaturesQuestion() {
  const a = choice([-3, -2, -1, 1, 2, 3]);
  const c = choice([-4, -2, 0, 2, 5]);
  const eq = quadraticEquation({ a, c });
  const concavity = a > 0 ? "opens upwards" : "opens downwards";
  const vertex = `(0, ${c})`;

  return nonlinearBQuestion({
    type: "nonlinear-b-quadratic-features",
    marks: 3,
    prompt: `For the parabola ${eq}, state the vertex, axis of symmetry, y-intercept and concavity.`,
    diagram: {
      engine: "nonlinear-engine",
      config: {
        diagramType: "graph-grid",
        title: eq,
        xMin: -4,
        xMax: 4,
        yMin: Math.min(-8, c - 6),
        yMax: Math.max(8, c + 12),
        functions: [{ kind: "quadratic", a, c }]
      }
    },
    answer: `vertex ${vertex}; axis of symmetry x = 0; y-intercept ${vertex}; ${concavity}`,
    working: [
      `In ${eq}, there is no horizontal shift, so the axis of symmetry is x = 0.`,
      `The value of c gives the vertex and y-intercept: ${vertex}.`,
      `Since k = ${a}, the parabola ${concavity}.`
    ],
    space: SPACE_SIZES.MEDIUM,
    tags: ["quadratic", "features", "parabola"]
  });
}

function compareParabolasQuestion() {
  const k1 = choice([1, 2, 3]);
  const k2 = choice([1, 2, 3].filter(k => k !== k1));
  const c = choice([-4, -2, 2, 4]);
  const eq1 = quadraticEquation({ a: k1, c: 0 });
  const eq2 = quadraticEquation({ a: k2, c });
  const narrower = k1 > k2 ? eq1 : eq2;
  const moved = c > 0 ? `${Math.abs(c)} units up` : `${Math.abs(c)} units down`;

  return nonlinearBQuestion({
    type: "nonlinear-b-compare-parabolas",
    marks: 3,
    prompt: `The two parabolas ${eq1} and ${eq2} are shown below.
Compare their widths and describe the vertical translation of ${eq2} compared with ${quadraticEquation({ a: k2, c: 0 })}.`,
    diagram: {
      engine: "nonlinear-engine",
      config: {
        diagramType: "graph-grid",
        title: "Comparing parabolas",
        xMin: -4,
        xMax: 4,
        yMin: Math.min(-6, c - 3),
        yMax: Math.max(14, c + 10),
        functions: [
          { kind: "quadratic", a: k1, c: 0, label: eq1, labelX: 610, labelY: 58 },
          { kind: "quadratic", a: k2, c, label: eq2, labelX: 610, labelY: 88 }
        ]
      }
    },
    answer: `${narrower} is narrower. ${eq2} is translated ${moved} compared with ${quadraticEquation({ a: k2, c: 0 })}.`,
    working: [
      `A larger value of |k| makes a parabola narrower.`,
      `The + c value translates the graph vertically; here c = ${c}, so the shift is ${moved}.`
    ],
    space: SPACE_SIZES.MEDIUM,
    tags: ["quadratic", "compare"]
  });
}

function exponentialFeaturesQuestion() {
  const base = choice([2, 3]);
  const coefficient = choice([1, 2]);
  const eq = exponentialEquation({ coefficient, base });
  const yIntercept = coefficient;

  return nonlinearBQuestion({
    type: "nonlinear-b-exponential-features",
    marks: 3,
    prompt: `For the exponential curve ${eq}, state the y-intercept, horizontal asymptote and whether the curve represents growth or decay.`,
    diagram: {
      engine: "nonlinear-engine",
      config: {
        diagramType: "graph-grid",
        title: eq,
        xMin: -3,
        xMax: 5,
        yMin: -1,
        yMax: Math.max(12, coefficient * Math.pow(base, 4) + 2),
        yStep: coefficient * Math.pow(base, 4) > 40 ? 10 : 2,
        functions: [{ kind: "exponential", a: coefficient, base }]
      }
    },
    answer: `y-intercept (0, ${yIntercept}); horizontal asymptote y = 0; growth`,
    working: [
      `When x = 0, ${base}⁰ = 1, so y = ${coefficient}.`,
      `The curve approaches y = 0 for very small x-values.`,
      `Since the base ${base} is greater than 1, the curve shows growth.`
    ],
    space: SPACE_SIZES.MEDIUM,
    tags: ["exponential", "features"]
  });
}

function matchEquationGraphQuestion() {
  const options = shuffle([
    { equation: "y = x²", fn: { kind: "quadratic", a: 1, c: 0 } },
    { equation: "y = −x² + 4", fn: { kind: "quadratic", a: -1, c: 4 } },
    { equation: exponentialEquation({ base: 2, coefficient: 1 }), fn: { kind: "exponential", base: 2, a: 1 } },
    { equation: "y = 2x + 1", fn: { kind: "linear", m: 2, c: 1 } }
  ]);

  const graphLabels = options.map((_, index) => String.fromCharCode(65 + index));
  const equations = shuffle(options.map(option => option.equation));

  return nonlinearBQuestion({
    type: "nonlinear-b-match-equation-graph",
    marks: 3,
    prompt: "Match each graph A–D to the most appropriate equation by drawing lines between the columns.",
    diagram: {
      engine: "nonlinear-engine",
      config: {
        diagramType: "graph-options",
        title: "Graphs A–D",
        cards: options.map((option, index) => ({
          option: graphLabels[index],
          functions: [{ ...option.fn }],
          xMin: -3,
          xMax: 4,
          yMin: -5,
          yMax: 12
        }))
      }
    },
    matching: {
      left: graphLabels.map(label => `Graph ${label}`),
      right: equations
    },
    answer: options.map((option, index) => `Graph ${graphLabels[index]}: ${option.equation}`).join("; "),
    working: ["Use the curve shape, intercepts and turning point/asymptote to match each graph."],
    space: SPACE_SIZES.NONE,
    tags: ["matching", "graphs"]
  });
}

function whichGraphQuestion() {
  const options = shuffle([
    { equation: "y = x²", fn: { kind: "quadratic", a: 1, c: 0 } },
    { equation: "y = 2x²", fn: { kind: "quadratic", a: 2, c: 0 } },
    { equation: "y = −x² + 4", fn: { kind: "quadratic", a: -1, c: 4 } },
    { equation: exponentialEquation({ base: 2, coefficient: 1 }), fn: { kind: "exponential", base: 2, a: 1 } },
    { equation: "y = 2x + 1", fn: { kind: "linear", m: 2, c: 1 } }
  ]).slice(0, 4);

  const correct = choice(options);
  const answerLetter = String.fromCharCode(65 + options.findIndex(option => option.equation === correct.equation));

  return nonlinearBQuestion({
    type: "nonlinear-b-which-graph",
    marks: 1,
    prompt: `Which option shows the graph of ${correct.equation}?`,
    diagram: {
      engine: "nonlinear-engine",
      config: {
        diagramType: "graph-options",
        title: "Select the matching graph",
        cards: options.map((option, index) => ({
          option: String.fromCharCode(65 + index),
          functions: [{ ...option.fn }],
          xMin: -3,
          xMax: 4,
          yMin: -5,
          yMax: 12
        }))
      }
    },
    choices: ["A", "B", "C", "D"],
    answer: answerLetter,
    working: [`${correct.equation} matches graph ${answerLetter}.`],
    space: SPACE_SIZES.NONE,
    tags: ["matching", "graph-selection"]
  });
}

function distinguishTableQuestion() {
  const kind = choice(["linear", "quadratic", "exponential"]);
  const xs = [0, 1, 2, 3, 4, 5];
  let ys;
  let feature;

  if (kind === "linear") {
    const m = choice([2, 3, 5]);
    const c = choice([1, 4, 7]);
    ys = xs.map(x => m * x + c);
    feature = "constant first differences";
  } else if (kind === "quadratic") {
    const a = choice([1, 2]);
    const c = choice([0, 2, 4]);
    ys = xs.map(x => a * x * x + c);
    feature = "constant second differences";
  } else {
    const base = choice([2, 3]);
    const coefficient = choice([1, 2]);
    ys = xs.map(x => coefficient * Math.pow(base, x));
    feature = "a constant multiplier between consecutive y-values";
  }

  return nonlinearBQuestion({
    type: "nonlinear-b-distinguish-table",
    marks: 2,
    prompt: "Classify the relationship in the table as linear, quadratic or exponential. Explain how you know.",
    table: {
      headerRow: false,
      className: "values",
      rows: [
        ["x", ...xs.map(String)],
        ["y", ...ys.map(String)]
      ]
    },
    answer: `${kind}; ${feature}`,
    working: [`The table has ${feature}, so it is ${kind}.`],
    space: SPACE_SIZES.SMALL,
    tags: ["table", "distinguish", kind]
  });
}

function simultaneousLinearQuadraticQuestion() {
  const c = choice([2, 6]);
  const m = choice([1, -1]);
  const line = { m, c };
  const eqLine = linearEquation(line);
  const eqQuad = "y = x²";

  // Solve x² = mx + c.
  const A = 1;
  const B = -m;
  const C = -c;
  const discriminant = B * B - 4 * A * C;
  const r1 = (-B - Math.sqrt(discriminant)) / 2;
  const r2 = (-B + Math.sqrt(discriminant)) / 2;
  const roots = [r1, r2].map(v => Number(v.toFixed(2)));
  const points = roots.map(x => `(${x}, ${Number((x * x).toFixed(2))})`);

  return nonlinearBQuestion({
    type: "nonlinear-b-simultaneous-linear-quadratic",
    marks: 2,
    prompt: `Use the graph to solve the simultaneous equations ${eqQuad} and ${eqLine}.`,
    diagram: {
      engine: "nonlinear-engine",
      config: {
        diagramType: "graph-grid",
        title: "Linear and quadratic graphs",
        xMin: -5,
        xMax: 5,
        yMin: -2,
        yMax: Math.max(12, c + 8),
        functions: [
          { kind: "quadratic", a: 1, c: 0, label: eqQuad, labelX: 600, labelY: 58 },
          { kind: "linear", m, c, label: eqLine, labelX: 600, labelY: 88 }
        ],
        points: roots.map(x => ({ x, y: x * x, label: "" }))
      }
    },
    answer: points.join(" and "),
    working: [
      `The solutions occur where the graphs intersect.`,
      `From the graph, the intersection points are approximately ${points.join(" and ")}.`
    ],
    space: SPACE_SIZES.SMALL,
    tags: ["simultaneous-equations", "quadratic", "linear"]
  });
}

function simultaneousLinearExponentialQuestion() {
  const base = choice([2, 3]);
  const targetPower = base === 2 ? choice([2, 3]) : choice([1, 2]);
  const yValue = Math.pow(base, targetPower);
  const eqExp = exponentialEquation({ base, coefficient: 1 });
  const eqLine = `y = ${yValue}`;

  return nonlinearBQuestion({
    type: "nonlinear-b-simultaneous-linear-exponential",
    marks: 1,
    prompt: `Use the graph to solve the simultaneous equations ${eqExp} and ${eqLine}.`,
    diagram: {
      engine: "nonlinear-engine",
      config: {
        diagramType: "graph-grid",
        title: "Exponential and linear graphs",
        xMin: -2,
        xMax: 5,
        yMin: 0,
        yMax: Math.max(12, yValue + 4),
        functions: [
          { kind: "exponential", base, a: 1, label: eqExp, labelX: 600, labelY: 58 },
          { kind: "linear", m: 0, c: yValue, label: eqLine, labelX: 600, labelY: 88 }
        ],
        points: [{ x: targetPower, y: yValue }]
      }
    },
    answer: `(${targetPower}, ${yValue})`,
    working: [
      `The solution is where the exponential curve intersects the horizontal line.`,
      `The graphs meet at (${targetPower}, ${yValue}).`
    ],
    space: SPACE_SIZES.SMALL,
    tags: ["simultaneous-equations", "exponential", "linear"]
  });
}

function realLifeProblemsQuestion() {
  const scenarios = [
    () => {
      const start = choice([80, 120, 250, 500]);
      const years = choice([3, 4, 5]);
      const value = start * Math.pow(2, years);
      return {
        prompt: `A colony of bacteria starts with ${start} bacteria and doubles each hour.
Calculate the number of bacteria after ${years} hours.`,
        answer: `${value} bacteria`,
        working: [`This is exponential growth: ${start} × 2ˣ with x = ${years}.`, `${start} × 2^${years} = ${value}.`],
        tags: ["exponential", "context"]
      };
    },
    () => {
      const side = choice([6, 9, 12, 15, 20]);
      const area = side * side;
      return {
        prompt: `The area A of a square with side length x is modelled by A = x².
Calculate the area when x = ${side} cm.`,
        answer: `${area} cm²`,
        working: [`A = ${side}²`, `A = ${area} cm²`],
        tags: ["quadratic", "context"]
      };
    },
    () => {
      const c = choice([1, 2, 3]);
      const x = choice([2, 3, 4]);
      const y = c * x * x;
      return {
        prompt: `A simple model for stopping distance is d = ${c}v², where d is distance in metres and v is speed in tens of kilometres per hour.
Calculate d when v = ${x}.`,
        answer: `${y} m`,
        working: [`d = ${c} × ${x}²`, `d = ${y} m`],
        tags: ["quadratic", "context"]
      };
    }
  ];

  const item = choice(scenarios)();

  return nonlinearBQuestion({
    type: "nonlinear-b-real-life-problems",
    marks: 2,
    prompt: item.prompt,
    answer: item.answer,
    working: item.working,
    space: SPACE_SIZES.MEDIUM,
    tags: item.tags
  });
}

const GENERATORS = {
  "nonlinear-b-quadratic-features": quadraticFeaturesQuestion,
  "nonlinear-b-compare-parabolas": compareParabolasQuestion,
  "nonlinear-b-exponential-features": exponentialFeaturesQuestion,
  "nonlinear-b-which-graph": whichGraphQuestion,
  "nonlinear-b-match-equation-graph": matchEquationGraphQuestion,
  "nonlinear-b-distinguish-table": distinguishTableQuestion,
  "nonlinear-b-simultaneous-linear-quadratic": simultaneousLinearQuadraticQuestion,
  "nonlinear-b-simultaneous-linear-exponential": simultaneousLinearExponentialQuestion,
  "nonlinear-b-real-life-problems": realLifeProblemsQuestion
};

export function getNonLinearRelationshipsBQuestionTypes() {
  return TYPE_LIST.slice();
}

export function generateNonLinearRelationshipsBQuestions({ count = 6, allowedTypes = [] } = {}) {
  const typeIds = Array.isArray(allowedTypes)
    ? allowedTypes.filter(typeId => GENERATORS[typeId])
    : [];

  return makeBalancedPlan(typeIds, count).map(typeId => GENERATORS[typeId]());
}
