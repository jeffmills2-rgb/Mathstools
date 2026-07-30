/*
  CHHS Exam Builder — Cartesian Plane and Linear Relationships Question Bank
  ------------------------------------------------------------------------
  Save as:

  question-banks/linear-relationships/index.js

  Requires:
  - engines/linear/linear-engine.js

  Covers:
  - plotting and identifying coordinates, including non-whole numbers
  - tables of values, patterns and rules
  - moving between rules, tables, coordinates and graphs
  - graphing linear relationships
  - comparing straight-line graphs
  - real-life linear relationships
  - solving equations graphically
  - intersecting lines and verification
*/

import {
  createQuestion,
  QUESTION_KINDS,
  SPACE_SIZES
} from "../../schemas/question.schema.js";

import {
  attachQuestionTranslations
} from "../../utils/translation.js";

const TOPIC = "Cartesian Plane and Linear Relationships";

const TYPE_LIST = [
  { id: "identify-coordinates", label: "Identify coordinates of points" },
  { id: "plot-coordinates", label: "Plot and label points" },
  { id: "decimal-coordinates", label: "Non-whole number coordinates" },
  { id: "name-quadrant", label: "Name the quadrant of a point" },

  { id: "complete-table-rule", label: "Complete a table from a rule" },
  { id: "pattern-table-rule", label: "Patterns, tables and rules" },
  { id: "use-rule", label: "Use a rule to calculate values" },

  { id: "graph-from-table", label: "Graph a line from a table of values" },
  { id: "graph-from-equation", label: "Graph a line from an equation" },
  { id: "equation-from-table", label: "Write the equation from a table of values" },
  { id: "equation-from-graph", label: "Find a rule from a graph" },

  { id: "x-y-intercepts", label: "Find x- and y-intercepts" },
  { id: "read-gradient", label: "Read the gradient from a graph" },
  { id: "gradient-two-points", label: "Gradient from two points" },
  { id: "gradient-intercept-form", label: "Gradient–intercept form (y = mx + c)" },
  { id: "multi-part-linear", label: "Multi-part: gradient, intercept and rule" },

  { id: "compare-linear-graphs", label: "Compare linear graphs" },
  { id: "real-life-linear", label: "Real-life linear relationships" },

  { id: "solve-by-graphing", label: "Solve linear equations graphically" },
  { id: "intersecting-lines", label: "Intersecting lines" },
  { id: "verify-intersection", label: "Verify an intersection point algebraically" },
  { id: "error-spot-linear", label: "Spot the error (reasoning)" },
  { id: "true-false-linear", label: "Linear relationships: true or false (reasoning)" }
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

function randomId(prefix = "linear") {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.random()}`;
}

function fmt(n) {
  if (Math.abs(n) < 1e-9) return "0";
  if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
  return Number(n.toFixed(2)).toString();
}

function coord(x, y) {
  return `(${fmt(x)}, ${fmt(y)})`;
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

function lineExpr(m, b) {
  let mText;

  if (m === 1) mText = "x";
  else if (m === -1) mText = "−x";
  else mText = `${fmt(m)}x`;

  if (b === 0) return `y = ${mText}`;
  if (b > 0) return `y = ${mText} + ${fmt(b)}`;
  return `y = ${mText} − ${fmt(Math.abs(b))}`;
}

function yValue(m, b, x) {
  return m * x + b;
}

function cleanList(values) {
  return values.map(v => typeof v === "number" ? fmt(v) : String(v)).join(", ");
}

function valuesTable(xValues, yValues, blankY = false) {
  return {
    rows: [
      ["x", ...xValues.map(fmt)],
      ["y", ...yValues.map(value => blankY ? "" : fmt(value))]
    ]
  };
}


function linearQuestion({
  type,
  marks = 1,
  prompt,
  answer,
  working = [],
  diagram = null,
  table = null,
  answerTable = null,
  solutionMode = null,
  solutionAnswerMode = null,
  space = SPACE_SIZES.MEDIUM
}) {
  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type,
    marks,
    prompt,
    diagram,
    table,
    answerTable,
    answer,
    working,
    space,
    solutionMode,
    solutionAnswerMode,
    tags: ["linear relationships", type]
  });
}

function coordinatePlaneDiagram({
  mode = "completed",
  points = [],
  showCoordinates = false,
  xMin = -5,
  xMax = 5,
  yMin = -5,
  yMax = 5,
  xStep = 1,
  yStep = 1,
  xMinorStep = 0.5,
  yMinorStep = 0.5,
  squareGrid = true
} = {}) {
  return {
    engine: "linear-engine",
    config: {
      diagramType: "coordinate-plane",
      mode,
      xMin,
      xMax,
      yMin,
      yMax,
      xStep,
      yStep,
      xMinorStep,
      yMinorStep,
      width: 720,
      height: 620,
      squareGrid,
      points,
      showCoordinates
    }
  };
}

function linearGraphDiagram({
  mode = "completed",
  line = null,
  lines = null,
  points = [],
  showLine = true,
  showLineLabels = true,
  showIntersection = false,
  showIntersectionLabel = true,
  xMin = -8,
  xMax = 8,
  yMin = -8,
  yMax = 8,
  squareGrid = true
} = {}) {
  return {
    engine: "linear-engine",
    config: {
      diagramType: lines && lines.length > 1 ? "intersecting-lines" : "linear-graph",
      mode,
      xMin,
      xMax,
      yMin,
      yMax,
      width: 720,
      height: 620,
      squareGrid,
      xStep: 1,
      yStep: 1,
      xMinorStep: 0.5,
      yMinorStep: 0.5,
      line,
      lines,
      points,
      showLine,
      showLineLabels,
      showIntersection,
      showIntersectionLabel
    }
  };
}

/* -----------------------------
   Coordinates
----------------------------- */

function identifyCoordinatesQuestion() {
  const labels = ["A", "B", "C", "D"];
  const points = [];

  while (points.length < 3) {
    const x = randInt(-4, 4);
    const y = randInt(-4, 4);

    if (x === 0 && y === 0) continue;
    if (points.some(p => p.x === x && p.y === y)) continue;

    points.push({
      label: labels[points.length],
      x,
      y
    });
  }

  const target = choice(points);

  return linearQuestion({
    type: "identify-coordinates",
    marks: 1,
    prompt: `Write the coordinates of point ${target.label}.`,
    diagram: coordinatePlaneDiagram({ points }),
    answer: coord(target.x, target.y),
    working: [`Point ${target.label} is ${coord(target.x, target.y)}.`],
    space: SPACE_SIZES.SMALL
  });
}

function plotCoordinatesQuestion() {
  const point = {
    label: "A",
    x: randInt(-4, 4),
    y: randInt(-4, 4)
  };

  if (point.x === 0 && point.y === 0) point.x = 3;

  return linearQuestion({
    type: "plot-coordinates",
    marks: 1,
    prompt: `Plot and label the point A${coord(point.x, point.y)} on the Cartesian plane.`,
    diagram: coordinatePlaneDiagram({ mode: "blank" }),
    answer: `Point A at ${coord(point.x, point.y)}`,
    working: [`Move ${fmt(point.x)} along the x-axis and ${fmt(point.y)} along the y-axis.`],
    space: SPACE_SIZES.NONE
  });
}

function decimalCoordinatesQuestion() {
  const values = [-4, -3.5, -3, -2.5, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4];
  const identify = Math.random() < 0.5;
  const point = {
    label: "P",
    x: choice(values),
    y: choice(values)
  };

  if (identify) {
    return linearQuestion({
      type: "decimal-coordinates",
      marks: 1,
      prompt: `Write the coordinates of point ${point.label}.`,
      diagram: coordinatePlaneDiagram({
        points: [point],
        xMin: -5,
        xMax: 5,
        yMin: -5,
        yMax: 5,
        xMinorStep: 0.5,
        yMinorStep: 0.5
      }),
      answer: coord(point.x, point.y),
      working: [`Point ${point.label} is ${coord(point.x, point.y)}.`],
      space: SPACE_SIZES.SMALL
    });
  }

  return linearQuestion({
    type: "decimal-coordinates",
    marks: 1,
    prompt: `Plot and label the point P${coord(point.x, point.y)} on the Cartesian plane.`,
    diagram: coordinatePlaneDiagram({
      mode: "blank",
      xMin: -5,
      xMax: 5,
      yMin: -5,
      yMax: 5,
      xMinorStep: 0.5,
      yMinorStep: 0.5
    }),
    answer: `Point P at ${coord(point.x, point.y)}`,
    working: [`Use the half-unit grid lines to locate ${coord(point.x, point.y)}.`],
    space: SPACE_SIZES.NONE
  });
}

/* -----------------------------
   Tables, patterns and rules
----------------------------- */

function completeTableRuleQuestion() {
  const m = choice([-2, -1, 1, 2, 3, 4]);
  const b = randInt(-3, 5);
  const xs = [-2, -1, 0, 1, 2];
  const ys = xs.map(x => yValue(m, b, x));

  return linearQuestion({
    type: "complete-table-rule",
    marks: 2,
    prompt: `Complete the table of values for ${lineExpr(m, b)}.`,
    table: valuesTable(xs, ys, true),
    answerTable: valuesTable(xs, ys, false),
    answer: `y-values: ${cleanList(ys)}`,
    working: [],
    solutionMode: "table-only",
    space: SPACE_SIZES.MEDIUM
  });
}

function patternTableRuleQuestion() {
  const start = randInt(2, 7);
  const difference = choice([2, 3, 4, 5]);
  const figures = [1, 2, 3];
  const counts = figures.map(n => start + difference * (n - 1));
  const nTarget = choice([8, 10, 12, 15]);
  const targetValue = start + difference * (nTarget - 1);
  const m = difference;
  const b = start - difference;

  return linearQuestion({
    type: "pattern-table-rule",
    marks: 3,
    prompt: `The tile pattern continues in the same way. Write a rule for the number of tiles in Figure n, then find the number of tiles in Figure ${nTarget}.`,
    diagram: {
      engine: "linear-engine",
      config: {
        diagramType: "tile-pattern",
        figures: figures.map((n, i) => ({ n, count: counts[i] })),
        showCounts: true
      }
    },
    answer: `Rule: T = ${m}n ${b >= 0 ? "+ " + b : "− " + Math.abs(b)}; Figure ${nTarget}: ${targetValue} tiles`,
    working: [
      `The pattern increases by ${difference} each figure.`,
      `Rule: T = ${m}n ${b >= 0 ? "+ " + b : "− " + Math.abs(b)}.`,
      `For n = ${nTarget}, T = ${targetValue}.`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function useRuleQuestion() {
  const m = choice([2, 3, 4, 5, -1, -2]);
  const b = randInt(-5, 8);
  const x = choice([6, 8, 10, 12, 15]);
  const y = yValue(m, b, x);

  return linearQuestion({
    type: "use-rule",
    marks: 1,
    prompt: `Use the rule ${lineExpr(m, b)} to find y when x = ${x}.`,
    answer: String(y),
    working: [`y = ${fmt(m)} × ${x} ${b >= 0 ? "+ " + fmt(b) : "− " + fmt(Math.abs(b))} = ${fmt(y)}.`],
    space: SPACE_SIZES.SMALL
  });
}

function equationFromTableQuestion() {
  const m = choice([-3, -2, -1, 1, 2, 3]);
  const b = randInt(-4, 4);
  const xs = [-2, -1, 0, 1, 2];
  const ys = xs.map(x => yValue(m, b, x));
  const direction = m > 0 ? "increases" : "decreases";

  return linearQuestion({
    type: "equation-from-table",
    marks: 2,
    prompt: `Write the equation for the linear relationship shown in the table.`,
    table: valuesTable(xs, ys, false),
    answer: lineExpr(m, b),
    working: [
      `As x increases by 1, y ${direction} by ${fmt(Math.abs(m))}. So the gradient is ${fmt(m)}.`,
      `When x = 0, y = ${fmt(b)}. So the y-intercept is ${fmt(b)}.`,
      `Equation: ${lineExpr(m, b)}.`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

/* -----------------------------
   Graphing linear relationships
----------------------------- */

function graphFromTableQuestion() {
  const m = choice([-2, -1, 1, 2]);
  const b = randInt(-3, 3);
  const xs = [-2, -1, 0, 1, 2];
  const pairs = xs.map(x => ({ x, y: yValue(m, b, x) }));
  const ys = pairs.map(p => p.y);

  return linearQuestion({
    type: "graph-from-table",
    marks: 2,
    prompt: `Complete the table of values for ${lineExpr(m, b)}, then graph the line.`,
    table: valuesTable(xs, ys, true),
    answerTable: valuesTable(xs, ys, false),
    diagram: linearGraphDiagram({
      mode: "blank",
      line: { m, b },
      showLine: false,
      showLineLabels: false,
      xMin: -8,
      xMax: 8,
      yMin: -8,
      yMax: 8
    }),
    answer: `Line ${lineExpr(m, b)}`,
    working: [
      `Complete the table: y-values are ${cleanList(ys)}.`,
      `Plot the coordinate pairs: ${pairs.map(p => coord(p.x, p.y)).join(", ")}.`,
      `Join the points with a straight line.`
    ],
    space: SPACE_SIZES.NONE
  });
}

function graphFromEquationQuestion() {
  const m = choice([-2, -1, 1, 2]);
  const b = randInt(-3, 3);

  return linearQuestion({
    type: "graph-from-equation",
    marks: 2,
    prompt: `Graph the linear relationship ${lineExpr(m, b)}.`,
    diagram: linearGraphDiagram({
      mode: "blank",
      line: { m, b },
      showLine: false,
      showLineLabels: false,
      xMin: -8,
      xMax: 8,
      yMin: -8,
      yMax: 8
    }),
    answer: `Line ${lineExpr(m, b)}`,
    working: [
      `Choose some x-values and calculate y-values.`,
      `Plot the points and join them with a straight line.`
    ],
    space: SPACE_SIZES.NONE
  });
}

function equationFromGraphQuestion() {
  const m = choice([-2, -1, 1, 2, 3]);
  const b = randInt(-3, 4);
  const x1 = 0;
  const x2 = 1;
  const points = [
    { label: "A", x: x1, y: yValue(m, b, x1) },
    { label: "B", x: x2, y: yValue(m, b, x2) }
  ];

  return linearQuestion({
    type: "equation-from-graph",
    marks: 2,
    prompt: `Find the rule for the graphed linear relationship.`,
    diagram: linearGraphDiagram({
      mode: "completed",
      line: { m, b, label: lineExpr(m, b), showLabel: false },
      points,
      showLineLabels: false,
      xMin: -8,
      xMax: 8,
      yMin: -8,
      yMax: 8
    }),
    answer: lineExpr(m, b),
    working: [
      `The y-intercept is ${fmt(b)}.`,
      `The gradient is ${fmt(m)}.`,
      `Rule: ${lineExpr(m, b)}.`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function compareLinearGraphsQuestion() {
  const b = randInt(-3, 3);
  const m1 = choice([1, 2, 3]);
  const m2 = choice([-1, -2, 1, 2, 3].filter(m => m !== m1));
  const lines = [
    { m: m1, b, label: "Line A" },
    { m: m2, b: b + randInt(1, 3), label: "Line B" }
  ];
  const steeper = Math.abs(m1) > Math.abs(m2) ? "Line A" : "Line B";

  return linearQuestion({
    type: "compare-linear-graphs",
    marks: 1,
    prompt: `Which line has a greater gradient, Line A or Line B?`,
    diagram: linearGraphDiagram({
      mode: "completed",
      lines,
      showIntersection: false,
      showLineLabels: true,
      xMin: -8,
      xMax: 8,
      yMin: -8,
      yMax: 8
    }),
    answer: steeper,
    working: [`The line with the greater absolute gradient is steeper.`, `${steeper} has the greater gradient.`],
    space: SPACE_SIZES.SMALL
  });
}

/* -----------------------------
   Applications and graphical solving
----------------------------- */

function realLifeLinearQuestion() {
  const start = choice([5, 10, 20, 30]);
  const rate = choice([2, 3, 4, 5, 8]);

  return linearQuestion({
    type: "real-life-linear",
    marks: 1,
    prompt: `A taxi fare costs $${start} plus $${rate} per kilometre.\nWrite a rule for the cost C after k kilometres.`,
    answer: `C = ${rate}k + ${start}`,
    working: [
      `Fixed cost = $${start}. Rate = $${rate} per km.`,
      `Rule: C = ${rate}k + ${start}.`
    ],
    space: SPACE_SIZES.SMALL
  });
}

function solveByGraphingQuestion() {
  const m = choice([1, 2, 3, -1, -2]);
  const x = randInt(-3, 4);
  const b = randInt(-3, 4);
  const y = yValue(m, b, x);

  return linearQuestion({
    type: "solve-by-graphing",
    marks: 1,
    prompt: `Use the graph of ${lineExpr(m, b)} to find the value of x when y = ${fmt(y)}.`,
    diagram: linearGraphDiagram({
      mode: "completed",
      line: { m, b, label: lineExpr(m, b), showLabel: false },
      points: [],
      showLineLabels: false,
      xMin: -8,
      xMax: 8,
      yMin: -8,
      yMax: 8
    }),
    answer: `x = ${fmt(x)}`,
    working: [`The point on the line with y = ${fmt(y)} has x = ${fmt(x)}.`],
    space: SPACE_SIZES.SMALL
  });
}

function makeIntersectingLines() {
  for (let attempt = 0; attempt < 200; attempt++) {
    const x = randInt(-3, 3);
    const y = randInt(-4, 4);
    const m1 = choice([-2, -1, 1, 2]);
    let m2 = choice([-3, -2, -1, 1, 2, 3]);

    while (m2 === m1) {
      m2 = choice([-3, -2, -1, 1, 2, 3]);
    }

    const b1 = y - m1 * x;
    const b2 = y - m2 * x;

    if (Math.abs(b1) > 6 || Math.abs(b2) > 6) continue;

    return {
      intersection: { x, y },
      lines: [
        { m: m1, b: b1, label: "Line A", showLabel: false },
        { m: m2, b: b2, label: "Line B", showLabel: false }
      ]
    };
  }

  return {
    intersection: { x: 1, y: 0 },
    lines: [
      { m: 1, b: -1, label: "Line A", showLabel: false },
      { m: -2, b: 2, label: "Line B", showLabel: false }
    ]
  };
}

function intersectingLinesQuestion() {
  const made = makeIntersectingLines();

  return linearQuestion({
    type: "intersecting-lines",
    marks: 2,
    prompt: `Graph the two lines and identify their point of intersection:
${lineExpr(made.lines[0].m, made.lines[0].b)}
${lineExpr(made.lines[1].m, made.lines[1].b)}.`,
    diagram: linearGraphDiagram({
      mode: "blank",
      lines: made.lines,
      showLine: false,
      showLineLabels: false,
      showIntersection: false,
      xMin: -8,
      xMax: 8,
      yMin: -8,
      yMax: 8
    }),
    answer: coord(made.intersection.x, made.intersection.y),
    working: [
      `Graph both lines.`,
      `The point of intersection is ${coord(made.intersection.x, made.intersection.y)}.`
    ],
    space: SPACE_SIZES.NONE
  });
}

function verifyIntersectionQuestion() {
  const made = makeIntersectingLines();
  const p = made.intersection;
  const lineA = lineExpr(made.lines[0].m, made.lines[0].b);
  const lineB = lineExpr(made.lines[1].m, made.lines[1].b);

  return linearQuestion({
    type: "verify-intersection",
    marks: 2,
    prompt: `Verify algebraically that ${coord(p.x, p.y)} is the point of intersection for:
${lineA}
${lineB}.`,
    answer: `It satisfies both equations.`,
    working: [
      `Substitute x = ${fmt(p.x)} into ${lineA}: y = ${fmt(p.y)}.`,
      `Substitute x = ${fmt(p.x)} into ${lineB}: y = ${fmt(p.y)}.`,
      `The point satisfies both equations, so it is the point of intersection.`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

/* -----------------------------
   Cartesian plane (bridging integers Ch6) + gradients/intercepts (9F–9H)
----------------------------- */

function nameQuadrantQuestion() {
  const onAxis = Math.random() < 0.25;
  let x, y, answer;

  if (onAxis) {
    if (Math.random() < 0.5) { x = 0; y = choice([-4, -3, -2, 2, 3, 4]); answer = "On the y-axis"; }
    else { x = choice([-4, -3, -2, 2, 3, 4]); y = 0; answer = "On the x-axis"; }
  } else {
    x = choice([-4, -3, -2, -1, 1, 2, 3, 4]);
    y = choice([-4, -3, -2, -1, 1, 2, 3, 4]);
    answer = x > 0 && y > 0 ? "Quadrant 1"
      : x < 0 && y > 0 ? "Quadrant 2"
        : x < 0 && y < 0 ? "Quadrant 3"
          : "Quadrant 4";
  }

  return linearQuestion({
    type: "name-quadrant",
    marks: 1,
    prompt: `The point P${`(${fmt(x)}, ${fmt(y)})`} is shown. In which quadrant (or on which axis) does it lie?`,
    diagram: coordinatePlaneDiagram({ points: [{ label: "P", x, y }], showCoordinates: false, xMin: -5, xMax: 5, yMin: -5, yMax: 5 }),
    answer,
    working: [
      onAxis ? `One coordinate is 0, so P lies on an axis.` : `x is ${x > 0 ? "positive" : "negative"} and y is ${y > 0 ? "positive" : "negative"}.`,
      `P lies ${answer.toLowerCase()}.`
    ],
    space: SPACE_SIZES.SMALL
  });
}

function lineGraphWith(line, extra = {}) {
  return {
    engine: "linear-engine",
    config: {
      diagramType: "linear-graph",
      mode: "completed",
      xMin: -8, xMax: 8, yMin: -8, yMax: 8,
      width: 720, height: 620,
      squareGrid: true,
      xStep: 1, yStep: 1, xMinorStep: 1, yMinorStep: 1,
      line,
      ...extra
    }
  };
}

function xYInterceptsQuestion() {
  const m = choice([1, 2, -1, -2, 3, -3]);
  const xInt = choice([-3, -2, -1, 1, 2, 3]);
  const c = -m * xInt;       // y = m x + c, so x-intercept is xInt, y-intercept is c
  const eqn = `y = ${m === 1 ? "" : m === -1 ? "−" : fmt(m)}x ${c >= 0 ? "+ " + c : "− " + Math.abs(c)}`;

  return linearQuestion({
    type: "x-y-intercepts",
    marks: 2,
    prompt: `For the line ${eqn}, find the x-intercept and the y-intercept.`,
    diagram: lineGraphWith({ m, b: c, label: eqn }),
    answer: `x-intercept: (${fmt(xInt)}, 0); y-intercept: (0, ${fmt(c)})`,
    working: [
      `y-intercept: let x = 0 → y = ${fmt(c)}, so (0, ${fmt(c)}).`,
      `x-intercept: let y = 0 → 0 = ${fmt(m)}x ${c >= 0 ? "+ " + c : "− " + Math.abs(c)} → x = ${fmt(xInt)}, so (${fmt(xInt)}, 0).`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function readGradientQuestion() {
  const m = choice([1, 2, 3, -1, -2]);
  const c = choice([-2, -1, 0, 1, 2]);
  const run = 2;

  return linearQuestion({
    type: "read-gradient",
    marks: 2,
    prompt: `Use the gradient triangle on the graph to find the gradient of the line.`,
    diagram: lineGraphWith({ m, b: c }, {
      showGradientTriangle: true,
      gradTriX1: 1,
      gradTriRun: run,
      runLabel: `run = ${run}`,
      riseLabel: `rise = ${fmt(m * run)}`
    }),
    answer: `gradient = ${fmt(m)}`,
    working: [`gradient = rise ÷ run = ${fmt(m * run)} ÷ ${run} = ${fmt(m)}.`],
    space: SPACE_SIZES.MEDIUM
  });
}

function gradientTwoPointsQuestion() {
  const x1 = choice([-3, -2, -1, 0, 1]);
  const m = choice([1, 2, 3, -1, -2]);
  const run = choice([1, 2, 3]);
  const x2 = x1 + run;
  const b = choice([-2, -1, 0, 1, 2]);
  const y1 = m * x1 + b;
  const y2 = m * x2 + b;

  return linearQuestion({
    type: "gradient-two-points",
    marks: 2,
    prompt: `Find the gradient of the line passing through (${fmt(x1)}, ${fmt(y1)}) and (${fmt(x2)}, ${fmt(y2)}).`,
    diagram: coordinatePlaneDiagram({ points: [{ label: "A", x: x1, y: y1 }, { label: "B", x: x2, y: y2 }], xMin: -6, xMax: 6, yMin: -8, yMax: 8 }),
    answer: `gradient = ${fmt(m)}`,
    working: [
      `gradient = (y₂ − y₁) ÷ (x₂ − x₁)`,
      `= (${fmt(y2)} − ${fmt(y1)}) ÷ (${fmt(x2)} − ${fmt(x1)})`,
      `= ${fmt(y2 - y1)} ÷ ${fmt(x2 - x1)} = ${fmt(m)}.`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function gradientInterceptFormQuestion() {
  const m = choice([1, 2, 3, -1, -2, 4]);
  const c = choice([-4, -3, -2, -1, 1, 2, 3, 5]);
  const eqn = `y = ${m === 1 ? "" : m === -1 ? "−" : fmt(m)}x ${c >= 0 ? "+ " + c : "− " + Math.abs(c)}`;
  const askEquation = Math.random() < 0.5;

  if (askEquation) {
    return linearQuestion({
      type: "gradient-intercept-form",
      marks: 1,
      prompt: `Write the equation of the line with gradient ${fmt(m)} and y-intercept ${fmt(c)} in the form y = mx + c.`,
      answer: eqn,
      working: [`Substitute m = ${fmt(m)} and c = ${fmt(c)} into y = mx + c.`, `${eqn}.`],
      space: SPACE_SIZES.SMALL
    });
  }

  return linearQuestion({
    type: "gradient-intercept-form",
    marks: 1,
    prompt: `State the gradient and the y-intercept of the line ${eqn}.`,
    answer: `gradient = ${fmt(m)}, y-intercept = ${fmt(c)}`,
    working: [`In y = mx + c, m is the gradient and c is the y-intercept.`, `gradient = ${fmt(m)}, y-intercept = ${fmt(c)}.`],
    space: SPACE_SIZES.SMALL
  });
}

function multiPartLinearQuestion() {
  const m = choice([1, 2, 3, -1, -2]);
  const c = choice([-3, -2, -1, 1, 2, 3]);
  const eqn = `y = ${m === 1 ? "" : m === -1 ? "−" : fmt(m)}x ${c >= 0 ? "+ " + c : "− " + Math.abs(c)}`;
  const run = 2;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "multi-part-linear",
    marks: 3,
    prompt: `The graph shows a straight line.`,
    diagram: lineGraphWith({ m, b: c }, { showGradientTriangle: true, gradTriX1: 1, gradTriRun: run, runLabel: `run = ${run}`, riseLabel: `rise = ${fmt(m * run)}` }),
    subparts: [
      { label: "(a)", prompt: `Find the gradient of the line.`, marks: 1, answer: `${fmt(m)}`, working: [`rise ÷ run = ${fmt(m * run)} ÷ ${run} = ${fmt(m)}.`] },
      { label: "(b)", prompt: `Write down the y-intercept.`, marks: 1, answer: `${fmt(c)}`, working: [`The line crosses the y-axis at ${fmt(c)}.`] },
      { label: "(c)", prompt: `Write the equation of the line in the form y = mx + c.`, marks: 1, answer: eqn, working: [`Using m = ${fmt(m)} and c = ${fmt(c)}: ${eqn}.`] }
    ],
    answer: `(a) ${fmt(m)}; (b) ${fmt(c)}; (c) ${eqn}`,
    working: [],
    space: SPACE_SIZES.NONE,
    mcEligible: false,
    tags: ["linear relationships", "multi-part", "gradient", "diagram"]
  });
}

function errorSpotLinearQuestion() {
  const scenarios = [
    () => {
      const x1 = 1, y1 = 1, run = choice([2, 3]), m = choice([2, 3]);
      const x2 = x1 + run, y2 = y1 + m * run;
      return { wrong: `the gradient of the line through (${x1}, ${y1}) and (${x2}, ${y2}) is ${run}/${m * run}`, issue: "gradient is rise ÷ run, not run ÷ rise", correct: `${m}` };
    },
    () => {
      const m = choice([2, 3, 4]); const c = choice([1, 2, 3]);
      return { wrong: `the line y = ${m}x + ${c} has gradient ${c}`, issue: "in y = mx + c the gradient is m, not c", correct: `${m}` };
    }
  ];
  const s = choice(scenarios)();
  const distractors = shuffle([s.correct, "1", String(Number(s.correct) + 1), "0"])
    .filter((d, i, arr) => arr.indexOf(d) === i).slice(0, 4);
  if (!distractors.includes(s.correct)) distractors[0] = s.correct;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "error-spot-linear",
    kind: QUESTION_KINDS.MULTIPLE_CHOICE,
    marks: 1,
    prompt: `A student said ${s.wrong}. This is incorrect. What is the correct gradient?`,
    choices: shuffle(distractors),
    answer: s.correct,
    working: [`The error: ${s.issue}.`, `Correct gradient: ${s.correct}.`],
    space: SPACE_SIZES.NONE,
    tags: ["linear relationships", "reasoning", "error analysis"]
  });
}

function trueFalseLinearQuestion() {
  const items = [
    { stmt: "The point (0, 5) lies on the y-axis.", val: true, reason: "Its x-coordinate is 0, so it is on the y-axis." },
    { stmt: "The line y = 3x + 2 has a gradient of 2.", val: false, reason: "The gradient is 3 (the coefficient of x); 2 is the y-intercept." },
    { stmt: "In the point (−2, 4), the x-coordinate is 4.", val: false, reason: "The x-coordinate is −2; the y-coordinate is 4." },
    { stmt: "A line with a negative gradient slopes downwards from left to right.", val: true, reason: "Negative gradient means y decreases as x increases." },
    { stmt: "The y-intercept of y = 2x − 5 is −5.", val: true, reason: "c = −5 in y = mx + c." }
  ];
  const it = choice(items);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "true-false-linear",
    marks: 1,
    prompt: `True or false? ${it.stmt}  (Give a reason.)`,
    answer: it.val ? "True" : "False",
    working: [it.reason],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["linear relationships", "reasoning", "true false"]
  });
}

const GENERATORS = {
  "identify-coordinates": identifyCoordinatesQuestion,
  "name-quadrant": nameQuadrantQuestion,
  "x-y-intercepts": xYInterceptsQuestion,
  "read-gradient": readGradientQuestion,
  "gradient-two-points": gradientTwoPointsQuestion,
  "gradient-intercept-form": gradientInterceptFormQuestion,
  "multi-part-linear": multiPartLinearQuestion,
  "error-spot-linear": errorSpotLinearQuestion,
  "true-false-linear": trueFalseLinearQuestion,
  "plot-coordinates": plotCoordinatesQuestion,
  "decimal-coordinates": decimalCoordinatesQuestion,
  "complete-table-rule": completeTableRuleQuestion,
  "pattern-table-rule": patternTableRuleQuestion,
  "use-rule": useRuleQuestion,
  "graph-from-table": graphFromTableQuestion,
  "graph-from-equation": graphFromEquationQuestion,
  "equation-from-table": equationFromTableQuestion,
  "equation-from-graph": equationFromGraphQuestion,
  "compare-linear-graphs": compareLinearGraphsQuestion,
  "real-life-linear": realLifeLinearQuestion,
  "solve-by-graphing": solveByGraphingQuestion,
  "intersecting-lines": intersectingLinesQuestion,
  "verify-intersection": verifyIntersectionQuestion
};

export function getLinearRelationshipsQuestionTypes() {
  return TYPE_LIST.slice();
}

export function generateLinearRelationshipsQuestions({
  count = 8,
  allowedTypes = null
} = {}) {
  const typeIds = Array.isArray(allowedTypes) && allowedTypes.length
    ? allowedTypes.filter(id => GENERATORS[id])
    : TYPE_LIST.map(t => t.id);

  const plan = makeBalancedPlan(typeIds, count);

  return plan.map(type => GENERATORS[type]()).map(attachQuestionTranslations);
}
