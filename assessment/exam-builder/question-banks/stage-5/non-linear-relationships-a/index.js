/*
  MMT Exam Builder — Stage 5 Non-Linear Relationships A Question Bank
  --------------------------------------------------------------------
  Save as:

  question-banks/stage-5/non-linear-relationships-a/index.js

  Focus:
  - tables of values for quadratic and exponential relationships
  - graphing simple quadratics and exponentials
  - identifying parabolas and exponential curves from equations, tables and contexts
*/

import {
  createQuestion,
  SPACE_SIZES
} from "../../../schemas/question.schema.js";

const TOPIC = "Non-Linear Relationships A";

const TYPE_LIST = [
  { id: "nonlinear-quadratic-table-values", label: "Complete tables of values for quadratics" },
  { id: "nonlinear-exponential-table-values", label: "Complete tables of values for exponentials" },
  { id: "nonlinear-graph-quadratic-from-table", label: "Graph a quadratic from a table of values" },
  { id: "nonlinear-graph-exponential-from-table", label: "Graph an exponential from a table of values" },
  { id: "nonlinear-identify-graph-type", label: "Identify linear, quadratic or exponential graphs" },
  { id: "nonlinear-match-equation-to-graph", label: "Match simple curves to equations" },
  { id: "nonlinear-table-patterns", label: "Use table patterns to identify relationship type" },
  { id: "nonlinear-real-life-contexts", label: "Recognise non-linear relationships in real-life contexts" }
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

function randomId(prefix = "nonlinear-a") {
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

function sup(value) {
  return String(value)
    .replace(/0/g, "⁰")
    .replace(/1/g, "¹")
    .replace(/2/g, "²")
    .replace(/3/g, "³")
    .replace(/4/g, "⁴")
    .replace(/5/g, "⁵")
    .replace(/6/g, "⁶")
    .replace(/7/g, "⁷")
    .replace(/8/g, "⁸")
    .replace(/9/g, "⁹")
    .replace(/-/g, "⁻")
    .replace(/x/g, "ˣ");
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

function exponentialTerm({ coefficient = 1, base = 2 }) {
  const coeff = coefficient === 1 ? "" : `${coefficient}`;
  const bracketedBase = coefficient === 1 ? `${base}` : `(${base})`;
  return `${coeff}${bracketedBase}ˣ`;
}

function exponentialEquation({ coefficient = 1, base = 2 }) {
  return `y = ${exponentialTerm({ coefficient, base })}`;
}

function exponentialSubstitution({ coefficient = 1, base = 2, x = 0 }) {
  return coefficient === 1
    ? `${base}${sup(x)}`
    : `${coefficient}(${base})${sup(x)}`;
}

function formatList(values) {
  return values.join(", ");
}

function nonlinearAQuestion({ type, marks = 1, prompt, answer, working = [], table = null, diagram = null, choices = null, space = SPACE_SIZES.MEDIUM, tags = [] }) {
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
    tags: ["stage-5", "non-linear-relationships", "non-linear-relationships-a", type, ...tags]
  });

  if (table) question.table = table;
  if (choices) question.choices = choices;
  return question;
}

function quadraticTableValuesQuestion() {
  const a = choice([-2, -1, 1, 2, 3]);
  const c = choice([-3, -2, -1, 0, 1, 2, 4]);
  const xs = [-2, -1, 0, 1, 2];
  const ys = xs.map(x => a * x * x + c);
  const eq = quadraticEquation({ a, c });

  return nonlinearAQuestion({
    type: "nonlinear-quadratic-table-values",
    marks: 2,
    prompt: `Complete the table of values for ${eq}.`,
    table: {
      headerRow: false,
      className: "values",
      rows: [
        ["x", ...xs.map(String)],
        ["y", ...xs.map(() => "")]
      ]
    },
    answer: `y-values: ${formatList(ys)}`,
    working: xs.map(x => `When x = ${x}, y = ${a}(${x})² ${c >= 0 ? "+" : "−"} ${Math.abs(c)} = ${a * x * x + c}`),
    space: SPACE_SIZES.NONE,
    tags: ["table", "quadratic", "parabola"]
  });
}

function exponentialTableValuesQuestion() {
  const base = choice([2, 3, 4]);
  const coefficient = choice([1, 2, 3]);
  const xs = [0, 1, 2, 3, 4];
  const ys = xs.map(x => coefficient * Math.pow(base, x));
  const eq = exponentialEquation({ coefficient, base });

  return nonlinearAQuestion({
    type: "nonlinear-exponential-table-values",
    marks: 2,
    prompt: `Complete the table of values for the exponential relationship ${eq}.`,
    table: {
      headerRow: false,
      className: "values",
      rows: [
        ["x", ...xs.map(String)],
        ["y", ...xs.map(() => "")]
      ]
    },
    answer: `y-values: ${formatList(ys)}`,
    working: xs.map((x, index) => `When x = ${x}, y = ${exponentialSubstitution({ coefficient, base, x })} = ${ys[index]}`),
    space: SPACE_SIZES.NONE,
    tags: ["table", "exponential"]
  });
}

function graphQuadraticFromTableQuestion() {
  const a = choice([1, 2, -1]);
  const c = choice([0, 1, 2, -1]);
  const xs = [-3, -2, -1, 0, 1, 2, 3];
  const ys = xs.map(x => a * x * x + c);
  const eq = quadraticEquation({ a, c });
  const yMin = Math.min(-2, ...ys) - 1;
  const yMax = Math.max(8, ...ys) + 2;

  return nonlinearAQuestion({
    type: "nonlinear-graph-quadratic-from-table",
    marks: 3,
    prompt: `Complete the table of values and graph the quadratic relationship ${eq}.`,
    table: {
      headerRow: false,
      className: "values",
      rows: [
        ["x", ...xs.map(String)],
        ["y", ...xs.map(() => "")]
      ]
    },
    diagram: {
      engine: "nonlinear-engine",
      config: {
        diagramType: "graph-grid",
        xMin: -4,
        xMax: 4,
        yMin,
        yMax,
        xLabel: "x",
        yLabel: "y"
      }
    },
    answer: `The completed y-values are ${formatList(ys)}. The graph is a parabola.`,
    working: [
      `Substitute each x-value into ${eq}.`,
      `Plot the points (${xs.map((x, i) => `${x}, ${ys[i]}`).join("), (")}) and draw a smooth parabola.`
    ],
    space: SPACE_SIZES.NONE,
    tags: ["graph", "quadratic", "parabola"]
  });
}

function graphExponentialFromTableQuestion() {
  const base = choice([2, 3]);
  const coefficient = choice([1, 2]);
  const xs = base === 3 ? [0, 1, 2, 3] : [0, 1, 2, 3, 4];
  const ys = xs.map(x => coefficient * Math.pow(base, x));
  const eq = exponentialEquation({ coefficient, base });
  const yTop = Math.max(16, Math.max(...ys) + 4);

  return nonlinearAQuestion({
    type: "nonlinear-graph-exponential-from-table",
    marks: 3,
    prompt: `Complete the table of values and graph the exponential relationship ${eq}.`,
    table: {
      headerRow: false,
      className: "values",
      rows: [
        ["x", ...xs.map(String)],
        ["y", ...xs.map(() => "")]
      ]
    },
    diagram: {
      engine: "nonlinear-engine",
      config: {
        diagramType: "graph-grid",
        xMin: 0,
        xMax: 5,
        yMin: 0,
        yMax: yTop,
        yStep: yTop > 40 ? 10 : yTop > 20 ? 5 : 2,
        xLabel: "x",
        yLabel: "y"
      }
    },
    answer: `The completed y-values are ${formatList(ys)}. The graph is an exponential curve.`,
    working: [
      `Substitute each x-value into ${eq}.`,
      `Plot the points (${xs.map((x, i) => `${x}, ${ys[i]}`).join("), (")}) and draw a smooth increasing curve.`
    ],
    space: SPACE_SIZES.NONE,
    tags: ["graph", "exponential"]
  });
}

function identifyGraphTypeQuestion() {
  const graphs = [
    {
      answer: "quadratic",
      cfg: { functions: [{ kind: "quadratic", a: 1, c: -1, label: "" }], xMin: -4, xMax: 4, yMin: -3, yMax: 12, title: "Graph shown" }
    },
    {
      answer: "exponential",
      cfg: { functions: [{ kind: "exponential", base: 2, a: 1, label: "" }], xMin: -3, xMax: 4, yMin: -1, yMax: 12, title: "Graph shown" }
    },
    {
      answer: "linear",
      cfg: { functions: [{ kind: "linear", m: 1.5, c: 2, label: "" }], xMin: -4, xMax: 4, yMin: -3, yMax: 10, title: "Graph shown" }
    }
  ];
  const selected = choice(graphs);

  return nonlinearAQuestion({
    type: "nonlinear-identify-graph-type",
    marks: 1,
    prompt: "Identify the type of relationship shown by the graph.",
    diagram: {
      engine: "nonlinear-engine",
      config: { diagramType: "graph-grid", ...selected.cfg }
    },
    choices: ["linear", "quadratic", "exponential"],
    answer: selected.answer,
    working: [`The graph is ${selected.answer === "quadratic" ? "a parabola" : selected.answer === "exponential" ? "a curve with repeated multiplication growth" : "a straight line"}.`],
    space: SPACE_SIZES.NONE,
    tags: ["identify", selected.answer]
  });
}

function matchEquationToGraphQuestion() {
  const options = shuffle([
    { label: "A", equation: "y = x²", fn: { kind: "quadratic", a: 1, c: 0 } },
    { label: "B", equation: "y = 2x²", fn: { kind: "quadratic", a: 2, c: 0 } },
    { label: "C", equation: exponentialEquation({ base: 2, coefficient: 1 }), fn: { kind: "exponential", base: 2, a: 1 } },
    { label: "D", equation: "y = x + 2", fn: { kind: "linear", m: 1, c: 2 } }
  ]);

  const correct = choice(options);

  return nonlinearAQuestion({
    type: "nonlinear-match-equation-to-graph",
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
          yMin: -2,
          yMax: 12
        }))
      }
    },
    choices: ["A", "B", "C", "D"],
    answer: String.fromCharCode(65 + options.findIndex(option => option.equation === correct.equation)),
    working: [`${correct.equation} matches the curve with the same shape and key values.`],
    space: SPACE_SIZES.NONE,
    tags: ["matching", "graph"]
  });
}

function tablePatternsQuestion() {
  const kind = choice(["linear", "quadratic", "exponential"]);
  const xs = [0, 1, 2, 3, 4];
  let ys;
  let rule;
  if (kind === "linear") {
    const m = choice([2, 3, 4]);
    const c = choice([1, 2, 5]);
    ys = xs.map(x => m * x + c);
    rule = "constant first differences";
  } else if (kind === "quadratic") {
    const a = choice([1, 2]);
    const c = choice([0, 1, 3]);
    ys = xs.map(x => a * x * x + c);
    rule = "constant second differences";
  } else {
    const base = choice([2, 3]);
    ys = xs.map(x => Math.pow(base, x));
    rule = "a constant multiplier between y-values";
  }

  return nonlinearAQuestion({
    type: "nonlinear-table-patterns",
    marks: 2,
    prompt: "Use the table to identify whether the relationship is linear, quadratic or exponential. Give a reason.",
    table: {
      headerRow: false,
      className: "values",
      rows: [
        ["x", ...xs.map(String)],
        ["y", ...ys.map(String)]
      ]
    },
    answer: `${kind}; ${rule}`,
    working: [`This table shows ${rule}, so the relationship is ${kind}.`],
    space: SPACE_SIZES.SMALL,
    tags: ["table", "identify", kind]
  });
}

function realLifeContextsQuestion() {
  const contexts = [
    {
      prompt: "The height of a ball changes as it is kicked into the air and then falls back to the ground.",
      answer: "quadratic",
      reason: "projectile paths are modelled by parabolas"
    },
    {
      prompt: "A bacteria population doubles every hour.",
      answer: "exponential",
      reason: "the population grows by repeated multiplication"
    },
    {
      prompt: "A taxi fare increases by the same amount for each kilometre travelled.",
      answer: "linear",
      reason: "there is a constant increase per kilometre"
    },
    {
      prompt: "A car loses 12% of its value each year.",
      answer: "exponential",
      reason: "the value changes by a repeated percentage multiplier"
    },
    {
      prompt: "The area of a square is calculated from its side length.",
      answer: "quadratic",
      reason: "area = side²"
    }
  ];

  const selected = choice(contexts);

  return nonlinearAQuestion({
    type: "nonlinear-real-life-contexts",
    marks: 2,
    prompt: `${selected.prompt}
Identify whether this relationship is linear, quadratic or exponential. Give a reason.`,
    choices: ["linear", "quadratic", "exponential"],
    answer: `${selected.answer}; ${selected.reason}`,
    working: [`The relationship is ${selected.answer} because ${selected.reason}.`],
    space: SPACE_SIZES.SMALL,
    tags: ["context", selected.answer]
  });
}

const GENERATORS = {
  "nonlinear-quadratic-table-values": quadraticTableValuesQuestion,
  "nonlinear-exponential-table-values": exponentialTableValuesQuestion,
  "nonlinear-graph-quadratic-from-table": graphQuadraticFromTableQuestion,
  "nonlinear-graph-exponential-from-table": graphExponentialFromTableQuestion,
  "nonlinear-identify-graph-type": identifyGraphTypeQuestion,
  "nonlinear-match-equation-to-graph": matchEquationToGraphQuestion,
  "nonlinear-table-patterns": tablePatternsQuestion,
  "nonlinear-real-life-contexts": realLifeContextsQuestion
};

export function getNonLinearRelationshipsAQuestionTypes() {
  return TYPE_LIST.slice();
}

export function generateNonLinearRelationshipsAQuestions({ count = 6, allowedTypes = [] } = {}) {
  const typeIds = Array.isArray(allowedTypes)
    ? allowedTypes.filter(typeId => GENERATORS[typeId])
    : [];

  return makeBalancedPlan(typeIds, count).map(typeId => GENERATORS[typeId]());
}
