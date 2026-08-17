/*
  Mills Maths Tools — Stage 3 Question Bank: Geometric Measure
  --------------------------------------------------------------
  question-banks/stage-3/geometric-measure/index.js

  NSW Mathematics K–10 (2022), Stage 3, focus areas "Geometric measure A" and
  "Geometric measure B", merged into one topic. Outcomes:

    MA3-GM-01  locates and describes points on a coordinate plane
    MA3-GM-02  selects and uses the appropriate unit and device to measure
               lengths and distances including perimeters
    MA3-GM-03  measures and constructs angles, and identifies the
               relationships between angles on a straight line and angles at
               a point

  Content mapping is in docs/stage-3-syllabus-reference.md. Prompts are
  original; the syllabus supplies the content points, not the wording.

  This is three quite different strands under one outcome group, and the
  syllabus is unusually specific about two of them:

  - POSITION. The content insists that "the grid-map reference system gives
    the AREA of a location and the number plane identifies a specific POINT",
    and that "the lines are numbered, not the spaces". Both are stated as
    content points in their own right because both are common misconceptions,
    so both get their own question type rather than being assumed.
  - ANGLES. Stage 3 measures and constructs angles and knows the two
    relationships — on a straight line (180°) and at a point (360°). It does
    NOT do vertically opposite angles or parallel-line relationships; those
    are Stage 4. The angle engine offers them, and they are deliberately
    unused here.

  Angles are kept to multiples of 5°, which is what a student can actually
  read off a classroom protractor.
*/

import {
  createQuestion,
  SPACE_SIZES
} from "../../../schemas/question.schema.js";

import {
  attachQuestionTranslations
} from "../../../utils/translation.js";

const TOPIC = "Geometric Measure";

const TYPE_LIST = [
  { id: "read-coordinates", label: "Read coordinates from the plane" },
  { id: "plot-point", label: "Plot a point on the plane" },
  { id: "coordinate-vs-grid-map", label: "Coordinates or grid references?" },
  { id: "lines-not-spaces", label: "Reading the number plane" },
  { id: "four-quadrants", label: "All four quadrants" },
  { id: "metre-kilometre", label: "Metres and kilometres" },
  { id: "convert-length", label: "Convert between length units" },
  { id: "decimal-length", label: "Lengths as decimals" },
  { id: "choose-length-unit", label: "Choose the appropriate unit" },
  { id: "perimeter-rectangle", label: "Perimeter of a rectangle" },
  { id: "perimeter-polygon", label: "Perimeter of a polygon" },
  { id: "perimeter-missing-side", label: "Find a side from the perimeter" },
  { id: "classify-angle", label: "Name the type of angle" },
  { id: "estimate-angle", label: "Estimate an angle" },
  { id: "angles-straight-line", label: "Angles on a straight line" },
  { id: "angles-at-a-point", label: "Angles at a point" },
  { id: "read-protractor", label: "Read a protractor" },
  { id: "multi-part-perimeter", label: "Multi-part measurement problem" }
];

/* ── helpers ─────────────────────────────────────────────── */

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

function randomId(prefix = "s3gm") {
  return crypto.randomUUID ? crypto.randomUUID() : `${prefix}-${Date.now()}-${Math.random()}`;
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

function spaced(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/* A protractor reads to the nearest 5° at best, so every angle is a multiple. */
function friendlyAngle(min, max) {
  return randInt(Math.ceil(min / 5), Math.floor(max / 5)) * 5;
}

/*
  The plane is always drawn one unit larger than the largest coordinate a
  question will use. A point sitting exactly on the frame is hard to read and
  collides with the axis numbering, so the grid gets a margin of one square.
*/
function coordinatePlane({ points = [], mode = "completed", quadrants = 1, showCoordinates = false }) {
  const span = quadrants === 4 ? 5 : 6;

  return {
    engine: "linear-engine",
    config: {
      diagramType: "coordinate-plane",
      mode,
      xMin: quadrants === 4 ? -span : 0,
      xMax: span,
      yMin: quadrants === 4 ? -span : 0,
      yMax: span,
      xStep: 1,
      yStep: 1,
      xMinorStep: 1,
      yMinorStep: 1,
      width: 720,
      height: 620,
      squareGrid: true,
      points,
      showCoordinates
    }
  };
}

const NAMES = ["Ava", "Noah", "Mia", "Jack", "Ruby", "Kai", "Zara", "Leo"];

/* ══ POSITION (MA3-GM-01) ═════════════════════════════════ */

function readCoordinatesQuestion() {
  const x = randInt(1, 5);
  const y = randInt(1, 5);
  const label = choice(["A", "B", "P", "Q", "M"]);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "read-coordinates",
    marks: 1,
    prompt: `Write the coordinates of point ${label}.`,
    diagram: coordinatePlane({ points: [{ x, y, label }] }),
    answer: `(${x}, ${y})`,
    working: [
      `Read across to ${x}, then up to ${y}.`,
      `The horizontal position is written first: (${x}, ${y}).`
    ],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "position", "coordinates", "diagram"]
  });
}

function plotPointQuestion() {
  const x = randInt(1, 5);
  const y = randInt(1, 5);
  const label = choice(["A", "B", "C", "D"]);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "plot-point",
    marks: 1,
    prompt: `Plot the point ${label} (${x}, ${y}) on the number plane below.`,
    diagram: coordinatePlane({ mode: "blank" }),
    answer: `${x} across, ${y} up`,
    working: [`Go ${x} across from the origin, then ${y} up, and mark the point.`],
    space: SPACE_SIZES.NONE,
    mcEligible: false,
    tags: ["stage3", "position", "coordinates", "diagram"]
  });
}

/*
  The syllabus states this distinction as its own content point: a grid-map
  reference names an AREA (a whole square, like B3), while a coordinate names
  a POINT (where two numbered lines cross). Confusing the two is the standard
  error, so it is asked directly.
*/
function coordinateVsGridMapQuestion() {
  const forms = [
    {
      prompt: "On a street map, a park is at B3. Does B3 name a point or an area? Explain your answer.",
      answer: "An area",
      note: "A grid reference names the whole square, so B3 is an area, not a single point."
    },
    {
      prompt: "On a number plane, a tree is at (2, 5). Does (2, 5) name a point or an area? Explain your answer.",
      answer: "A point",
      note: "Coordinates name the exact spot where the two numbered lines cross, so it is a single point."
    },
    {
      prompt: "What is the difference between the grid reference D4 on a map and the coordinates (4, 4) on a number plane?",
      answer: "D4 names a square; (4, 4) names a single point",
      note: "A grid reference labels the spaces, so it names a region. Coordinates label the lines, so they name a point."
    }
  ];

  const form = choice(forms);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "coordinate-vs-grid-map",
    marks: 2,
    prompt: form.prompt,
    answer: form.answer,
    working: [form.note],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "position", "reasoning"]
  });
}

/* "The lines are numbered, not the spaces" — also a stated content point. */
function linesNotSpacesQuestion() {
  const forms = [
    {
      prompt: "On a number plane, are the numbers written against the lines or against the spaces between them? Explain why that matters.",
      answer: "Against the lines",
      note: "Coordinates name a point where two lines cross, so the numbers must label the lines themselves."
    },
    {
      prompt: `${choice(NAMES)} says the point (0, 0) is in the bottom-left square of the grid. Explain the mistake.`,
      answer: "(0, 0) is the origin — the point where the axes meet, not a square",
      note: "The numbers label the lines, so (0, 0) is where the two axes cross."
    },
    {
      prompt: "What is the name of the point (0, 0) on the number plane?",
      answer: "The origin",
      note: "Both axes meet at (0, 0), which is called the origin."
    }
  ];

  const form = choice(forms);
  const explains = /Explain/.test(form.prompt);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "lines-not-spaces",
    marks: explains ? 2 : 1,
    prompt: form.prompt,
    answer: form.answer,
    working: [form.note],
    space: explains ? SPACE_SIZES.MEDIUM : SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "position", "reasoning"]
  });
}

/* Geometric measure B extends to all four quadrants. */
function fourQuadrantsQuestion() {
  const x = choice([-4, -3, -2, -1, 1, 2, 3, 4]);
  const y = choice([-4, -3, -2, -1, 1, 2, 3, 4]);
  const label = choice(["A", "B", "P", "R"]);

  const quadrant = x > 0
    ? (y > 0 ? "first" : "fourth")
    : (y > 0 ? "second" : "third");

  const askQuadrant = Math.random() < 0.5;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "four-quadrants",
    marks: 1,
    prompt: askQuadrant
      ? `Which quadrant is point ${label} in?`
      : `Write the coordinates of point ${label}.`,
    diagram: coordinatePlane({ points: [{ x, y, label }], quadrants: 4 }),
    answer: askQuadrant ? `The ${quadrant} quadrant` : `(${x}, ${y})`,
    working: askQuadrant
      ? [`${label} is ${x > 0 ? "right of" : "left of"} the vertical axis and ${y > 0 ? "above" : "below"} the horizontal axis, so it is in the ${quadrant} quadrant.`]
      : [`Read across to ${x}, then up or down to ${y}: (${x}, ${y}).`],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "position", "coordinates", "diagram"]
  });
}

/* ══ LENGTH (MA3-GM-02) ═══════════════════════════════════ */

function metreKilometreQuestion() {
  const forms = [
    () => {
      const km = randInt(2, 40);
      return {
        prompt: `How many metres are there in ${km} km?`,
        answer: `${spaced(km * 1000)} m`,
        note: `1 km is 1000 m, so ${km} × 1000 = ${spaced(km * 1000)} m.`
      };
    },
    () => {
      const km = randInt(2, 30);
      return {
        prompt: `How many kilometres are there in ${spaced(km * 1000)} m?`,
        answer: `${km} km`,
        note: `${spaced(km * 1000)} ÷ 1000 = ${km} km.`
      };
    },
    () => {
      const laps = randInt(3, 12);
      const each = choice([200, 400, 500]);
      return {
        prompt: `${choice(NAMES)} runs ${laps} laps of a ${each} m track. How far is that in kilometres?`,
        answer: `${(laps * each) / 1000} km`,
        note: `${laps} × ${each} = ${spaced(laps * each)} m, and ${spaced(laps * each)} ÷ 1000 = ${(laps * each) / 1000} km.`
      };
    }
  ];

  const form = choice(forms)();

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "metre-kilometre",
    marks: form.prompt.includes("laps") ? 2 : 1,
    prompt: form.prompt,
    answer: form.answer,
    working: [form.note],
    space: form.prompt.includes("laps") ? SPACE_SIZES.MEDIUM : SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "length", "units"]
  });
}

const METRIC_STEPS = [
  { from: "cm", to: "mm", factor: 10 },
  { from: "m", to: "cm", factor: 100 },
  { from: "km", to: "m", factor: 1000 },
  { from: "m", to: "mm", factor: 1000 }
];

function convertLengthQuestion() {
  const step = choice(METRIC_STEPS);
  const up = Math.random() < 0.5;
  const small = randInt(2, 90);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "convert-length",
    marks: 1,
    prompt: up
      ? `Convert ${small} ${step.from} to ${step.to}.`
      : `Convert ${spaced(small * step.factor)} ${step.to} to ${step.from}.`,
    answer: up ? `${spaced(small * step.factor)} ${step.to}` : `${small} ${step.from}`,
    working: [
      up
        ? `1 ${step.from} is ${spaced(step.factor)} ${step.to}, so ${small} × ${spaced(step.factor)} = ${spaced(small * step.factor)} ${step.to}.`
        : `${spaced(small * step.factor)} ÷ ${spaced(step.factor)} = ${small} ${step.from}.`
    ],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "length", "units"]
  });
}

/* "Connect decimal representations to the metric system" — 2.5 km is 2500 m. */
function decimalLengthQuestion() {
  const whole = randInt(1, 9);
  const tenths = randInt(1, 9);
  const pair = choice([
    { big: "km", small: "m", factor: 1000 },
    { big: "m", small: "cm", factor: 100 },
    { big: "cm", small: "mm", factor: 10 }
  ]);
  const value = Number(`${whole}.${tenths}`);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "decimal-length",
    marks: 1,
    prompt: `Write ${value} ${pair.big} in ${pair.small}.`,
    answer: `${spaced(Math.round(value * pair.factor))} ${pair.small}`,
    working: [
      `1 ${pair.big} is ${spaced(pair.factor)} ${pair.small}.`,
      `${value} × ${spaced(pair.factor)} = ${spaced(Math.round(value * pair.factor))} ${pair.small}.`
    ],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "length", "decimals"]
  });
}

const LENGTH_CONTEXTS = [
  { thing: "the thickness of a coin", unit: "mm" },
  { thing: "the width of a fingernail", unit: "mm" },
  { thing: "the length of a pencil", unit: "cm" },
  { thing: "the height of a door", unit: "m" },
  { thing: "the length of a swimming pool", unit: "m" },
  { thing: "the distance between two towns", unit: "km" },
  { thing: "the length of a school bus trip", unit: "km" }
];

function chooseLengthUnitQuestion() {
  const context = choice(LENGTH_CONTEXTS);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "choose-length-unit",
    marks: 1,
    prompt: `Which unit would you use to measure ${context.thing}: mm, cm, m or km?`,
    answer: context.unit,
    working: [`${context.thing.replace(/^the /, "The ")} is best measured in ${context.unit}.`],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "length", "units"]
  });
}

/* ── perimeter ───────────────────────────────────────────── */

function perimeterRectangleQuestion() {
  const unit = choice(["cm", "m"]);
  const length = randInt(4, 18);
  const width = randInt(2, length - 1);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "perimeter-rectangle",
    marks: 1,
    prompt: "What is the perimeter of this rectangle?",
    diagram: {
      engine: "length-engine",
      notToScale: true,
      config: {
        diagramType: "polygon",
        shape: "rectangle",
        labels: {
          bottom: `${length} ${unit}`,
          right: `${width} ${unit}`
        }
      }
    },
    answer: `${2 * (length + width)} ${unit}`,
    working: [
      "Perimeter is the distance all the way around.",
      `${length} + ${width} + ${length} + ${width} = ${2 * (length + width)} ${unit}.`
    ],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "perimeter", "diagram"]
  });
}

function perimeterPolygonQuestion() {
  const unit = choice(["cm", "m"]);
  const shape = choice(["triangle", "square"]);

  if (shape === "square") {
    const side = randInt(3, 16);
    return createQuestion({
      id: randomId(),
      topic: TOPIC,
      level: "mixed",
      type: "perimeter-polygon",
      marks: 1,
      prompt: "What is the perimeter of this square?",
      diagram: {
        engine: "length-engine",
        notToScale: true,
        config: {
          diagramType: "polygon",
          shape: "square",
          labels: { bottom: `${side} ${unit}` }
        }
      },
      answer: `${side * 4} ${unit}`,
      working: [`All four sides are equal: ${side} × 4 = ${side * 4} ${unit}.`],
      space: SPACE_SIZES.SMALL,
      mcEligible: false,
      tags: ["stage3", "perimeter", "diagram"]
    });
  }

  const a = randInt(4, 14);
  const b = randInt(4, 14);
  const c = randInt(Math.abs(a - b) + 1, a + b - 1);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "perimeter-polygon",
    marks: 2,
    prompt: "What is the perimeter of this triangle?",
    diagram: {
      engine: "length-engine",
      notToScale: true,
      config: {
        diagramType: "polygon",
        shape: "triangle",
        labels: {
          bottom: `${a} ${unit}`,
          right: `${b} ${unit}`,
          left: `${c} ${unit}`
        }
      }
    },
    answer: `${a + b + c} ${unit}`,
    working: [`${a} + ${b} + ${c} = ${a + b + c} ${unit}.`],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "perimeter", "diagram"]
  });
}

function perimeterMissingSideQuestion() {
  const unit = choice(["cm", "m"]);
  const length = randInt(5, 18);
  const width = randInt(2, length - 1);
  const perimeter = 2 * (length + width);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "perimeter-missing-side",
    marks: 2,
    prompt: `A rectangle has a perimeter of ${perimeter} ${unit}. One side is ${length} ${unit}. How long is the other side?`,
    answer: `${width} ${unit}`,
    working: [
      `Two sides of ${length} ${unit} use ${2 * length} ${unit}.`,
      `${perimeter} − ${2 * length} = ${2 * width}, and ${2 * width} ÷ 2 = ${width} ${unit}.`
    ],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "perimeter", "reverse"]
  });
}

/* ══ ANGLES (MA3-GM-03) ═══════════════════════════════════ */

function classifyAngleQuestion() {
  const kinds = [
    { name: "acute", min: 10, max: 85 },
    { name: "right", min: 90, max: 90 },
    { name: "obtuse", min: 95, max: 175 },
    { name: "straight", min: 180, max: 180 },
    { name: "reflex", min: 185, max: 350 }
  ];
  const kind = choice(kinds);
  const angle = kind.min === kind.max ? kind.min : friendlyAngle(kind.min, kind.max);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "classify-angle",
    marks: 1,
    prompt: `What type of angle is ${angle}°?`,
    answer: `${kind.name.replace(/^\w/, c => c.toUpperCase())}`,
    working: [
      kind.name === "acute" ? "An acute angle is less than 90°."
        : kind.name === "right" ? "A right angle is exactly 90°."
        : kind.name === "obtuse" ? "An obtuse angle is between 90° and 180°."
        : kind.name === "straight" ? "A straight angle is exactly 180°."
        : "A reflex angle is between 180° and 360°."
    ],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "angles", "classifying"]
  });
}

/*
  "Estimate, measure and compare angles in degrees." A student estimates by
  benchmarking against a right angle, so these questions work that benchmark
  from three directions: recall it, count right angles in a turn, and compare
  an unfamiliar angle to it.
*/
function estimateAngleQuestion() {
  const forms = [
    () => {
      const ref = choice([
        { angle: 90, thing: "the corner of a page" },
        { angle: 180, thing: "a straight line" },
        { angle: 45, thing: "half a right angle" },
        { angle: 360, thing: "a full turn" }
      ]);
      return {
        prompt: `How many degrees is ${ref.thing}?`,
        answer: `${ref.angle}°`,
        note: `${ref.thing.replace(/^\w/, c => c.toUpperCase())} is ${ref.angle}°.`
      };
    },
    () => {
      const quarters = randInt(1, 4);
      const words = ["a quarter turn", "a half turn", "three-quarters of a turn", "a full turn"];
      return {
        prompt: `How many right angles are there in ${words[quarters - 1]}?`,
        answer: `${quarters}`,
        note: `${words[quarters - 1].replace(/^\w/, c => c.toUpperCase())} is ${quarters * 90}°, and ${quarters * 90} ÷ 90 = ${quarters}.`
      };
    },
    () => {
      const angle = friendlyAngle(15, 170);
      if (angle === 90) return { prompt: "Is 90° bigger or smaller than a right angle, or the same?", answer: "The same", note: "A right angle is exactly 90°." };
      const bigger = angle > 90;
      return {
        prompt: `Without measuring, is an angle of ${angle}° bigger or smaller than a right angle?`,
        answer: bigger ? "Bigger" : "Smaller",
        note: `A right angle is 90°, and ${angle} is ${bigger ? "more" : "less"} than 90.`
      };
    }
  ];

  const form = choice(forms)();

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "estimate-angle",
    marks: 1,
    prompt: form.prompt,
    answer: form.answer,
    working: [form.note],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "angles", "estimating"]
  });
}

/*
  The two relationships Stage 3 knows. Vertically opposite and parallel-line
  angles belong to Stage 4 and are deliberately not generated here, even
  though the angle engine can draw them.
*/
function anglesStraightLineQuestion() {
  const known = friendlyAngle(25, 150);
  const missing = 180 - known;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "angles-straight-line",
    marks: 2,
    prompt: "Find the value of x. Give a reason for your answer.",
    diagram: {
      engine: "angle-engine",
      config: {
        diagramType: "straight",
        knownAngles: [known],
        /* Shuffled so the unknown is not always the right-hand angle. */
        angleParts: shuffle([
          { value: known, label: `${known}°`, isMissing: false },
          { value: missing, label: "x", isMissing: true }
        ]),
        missingLabel: "x"
      }
    },
    answer: `${missing}°`,
    working: [
      "Angles on a straight line add to 180°.",
      `180° − ${known}° = ${missing}°.`
    ],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "angles", "diagram"]
  });
}

function anglesAtAPointQuestion() {
  const first = friendlyAngle(50, 140);
  const second = friendlyAngle(50, Math.max(55, 300 - first));
  const missing = 360 - first - second;

  if (missing < 30) return anglesAtAPointQuestion();

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "angles-at-a-point",
    marks: 2,
    prompt: "Find the value of x. Give a reason for your answer.",
    diagram: {
      engine: "angle-engine",
      config: {
        diagramType: "point",
        knownAngles: [first, second],
        angleParts: shuffle([
          { value: first, label: `${first}°`, isMissing: false },
          { value: second, label: `${second}°`, isMissing: false },
          { value: missing, label: "x", isMissing: true }
        ]),
        missingLabel: "x",
        startAngle: friendlyAngle(0, 60)
      }
    },
    answer: `${missing}°`,
    working: [
      "Angles at a point add to 360°.",
      `360° − ${first}° − ${second}° = ${missing}°.`
    ],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "angles", "diagram"]
  });
}

function readProtractorQuestion() {
  const angle = friendlyAngle(20, 160);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "read-protractor",
    marks: 1,
    prompt: "Read the size of the angle shown on the protractor.",
    diagram: {
      engine: "angle-engine",
      config: {
        diagramType: "protractor",
        angle,
        startSide: choice(["right", "left"])
      }
    },
    answer: `${angle}°`,
    working: [`Read from the zero on the arm of the angle: ${angle}°.`],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "angles", "protractor", "diagram"]
  });
}

/* ── multi-part ──────────────────────────────────────────── */

function multiPartPerimeterQuestion() {
  const length = randInt(8, 20);
  const width = randInt(4, length - 2);
  const perimeter = 2 * (length + width);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "multi-part-perimeter",
    marks: 3,
    prompt: `A rectangular chicken run is ${length} m long and ${width} m wide.`,
    subparts: [
      {
        label: "(a)",
        prompt: "How many metres of fencing are needed to go all the way around?",
        marks: 1,
        answer: `${perimeter} m`,
        working: [`${length} + ${width} + ${length} + ${width} = ${perimeter} m.`]
      },
      {
        label: "(b)",
        prompt: "Write that length in centimetres.",
        marks: 1,
        answer: `${spaced(perimeter * 100)} cm`,
        working: [`${perimeter} × 100 = ${spaced(perimeter * 100)} cm.`]
      },
      {
        label: "(c)",
        prompt: "Fencing costs $12 per metre. What is the total cost?",
        marks: 1,
        answer: `$${spaced(perimeter * 12)}.00`,
        working: [`${perimeter} × $12 = $${spaced(perimeter * 12)}.00.`]
      }
    ],
    answer: `(a) ${perimeter} m; (b) ${spaced(perimeter * 100)} cm; (c) $${spaced(perimeter * 12)}.00`,
    working: [],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "perimeter", "multi-part"]
  });
}

/* ── registry ────────────────────────────────────────────── */

const GENERATORS = {
  "read-coordinates": readCoordinatesQuestion,
  "plot-point": plotPointQuestion,
  "coordinate-vs-grid-map": coordinateVsGridMapQuestion,
  "lines-not-spaces": linesNotSpacesQuestion,
  "four-quadrants": fourQuadrantsQuestion,
  "metre-kilometre": metreKilometreQuestion,
  "convert-length": convertLengthQuestion,
  "decimal-length": decimalLengthQuestion,
  "choose-length-unit": chooseLengthUnitQuestion,
  "perimeter-rectangle": perimeterRectangleQuestion,
  "perimeter-polygon": perimeterPolygonQuestion,
  "perimeter-missing-side": perimeterMissingSideQuestion,
  "classify-angle": classifyAngleQuestion,
  "estimate-angle": estimateAngleQuestion,
  "angles-straight-line": anglesStraightLineQuestion,
  "angles-at-a-point": anglesAtAPointQuestion,
  "read-protractor": readProtractorQuestion,
  "multi-part-perimeter": multiPartPerimeterQuestion
};

export function getStage3GeometricMeasureQuestionTypes() {
  return TYPE_LIST;
}

export function generateStage3GeometricMeasureQuestions({
  count = 6,
  allowedTypes = null
} = {}) {
  const allowedTypeList = Array.isArray(allowedTypes)
    ? [...new Set(allowedTypes)].filter(type => GENERATORS[type])
    : null;

  const typeIds = allowedTypeList === null
    ? TYPE_LIST.map(t => t.id)
    : allowedTypeList;

  if (!typeIds.length || count < 1) return [];

  const plan = makeBalancedPlan(typeIds, count);
  const questions = [];

  let safety = 0;
  while (questions.length < count && safety < count * 30) {
    const generator = GENERATORS[plan[questions.length % plan.length]];
    if (generator) questions.push(generator());
    safety += 1;
  }

  return questions.map(attachQuestionTranslations);
}
