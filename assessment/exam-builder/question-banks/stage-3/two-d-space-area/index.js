/*
  Mills Maths Tools — Stage 3 Question Bank: 2D Space and Area
  --------------------------------------------------------------
  question-banks/stage-3/two-d-space-area/index.js

  NSW Mathematics K–10 (2022), Stage 3, focus areas "Two-dimensional spatial
  structure A" and "Two-dimensional spatial structure B", merged into one
  topic. Outcomes:

    MA3-2DS-01  investigates and classifies two-dimensional shapes, including
                triangles and quadrilaterals, based on their properties
    MA3-2DS-02  selects and applies appropriate strategies to solve problems
                involving translation, reflection and rotation
    MA3-2DS-03  selects and uses the appropriate unit to calculate areas,
                including areas of rectangles

  Content mapping is in docs/stage-3-syllabus-reference.md. Prompts are
  original; the syllabus supplies the content points, not the wording.

  Three things shape this bank:

  - AREA IS BUILT FROM THE GRID FIRST. Stage 3 meets area as "how many unit
    squares cover it" before it meets length × width, so the grid-counting
    questions come first in the type list and use the same rectangles the
    formula questions do.
  - THE UNIT IS PART OF THE ANSWER. MA3-2DS-03 is about "selects and uses the
    appropriate unit", so square centimetres, square metres, hectares and
    square kilometres all appear, and choosing between them is its own
    question type. Every area answer carries its unit.
  - TRIANGLES AND PARALLELOGRAMS COME FROM REARRANGEMENT, not a memorised
    formula. The content says "using subdivision and rearrangement" and
    "determine the area of a triangle", so the working explains the halving
    or the shear rather than quoting bh/2.
*/

import {
  createQuestion,
  SPACE_SIZES
} from "../../../schemas/question.schema.js";

import {
  attachQuestionTranslations
} from "../../../utils/translation.js";

const TOPIC = "2D Space and Area";

const TYPE_LIST = [
  { id: "count-unit-squares", label: "Area by counting unit squares" },
  { id: "rows-and-columns", label: "Area from rows and columns" },
  { id: "area-rectangle", label: "Area of a rectangle" },
  { id: "area-square", label: "Area of a square" },
  { id: "missing-side", label: "Find a missing side from the area" },
  { id: "area-triangle", label: "Area of a triangle" },
  { id: "area-parallelogram", label: "Area of a parallelogram" },
  { id: "composite-area", label: "Area of a composite figure" },
  { id: "choose-unit", label: "Choose the appropriate unit" },
  { id: "hectares", label: "Hectares and square kilometres" },
  { id: "classify-quadrilateral", label: "Classify a quadrilateral" },
  { id: "classify-triangle", label: "Classify a triangle" },
  { id: "shape-properties", label: "Properties of a shape" },
  { id: "transformations", label: "Translation, reflection and rotation" },
  { id: "symmetry", label: "Lines of symmetry" },
  { id: "multi-part-area", label: "Multi-part area problem" }
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

function randomId(prefix = "s3ds") {
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

/* Superscript two, so "cm²" reads as a unit rather than "cm2". */
const SQ = "²";

/* ── area from the grid ──────────────────────────────────── */

/*
  Counting unit squares is where Stage 3 starts. The grid engine caps at
  14 × 10, and anything near that is tedious to count, so the shapes stay
  small enough that counting is a reasonable strategy rather than a chore.
*/
function countUnitSquaresQuestion() {
  const cols = randInt(3, 8);
  const rows = randInt(2, 6);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "count-unit-squares",
    marks: 1,
    prompt: `What is the area of the shaded rectangle?`,
    diagram: {
      engine: "area-engine",
      caption: "Each square is 1 cm².",
      config: { diagramType: "grid-count", cols, rows }
    },
    answer: `${cols * rows} cm${SQ}`,
    working: [
      `There are ${rows} rows of ${cols} squares.`,
      `${rows} × ${cols} = ${cols * rows} cm${SQ}.`
    ],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "area", "diagram"]
  });
}

/* The bridge from counting to multiplying — same picture, different question. */
function rowsAndColumnsQuestion() {
  const cols = randInt(4, 10);
  const rows = randInt(3, 7);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "rows-and-columns",
    marks: 2,
    prompt: `Explain how you could find the area of this rectangle without counting every square, then give the area.`,
    diagram: {
      engine: "area-engine",
      caption: "Each square is 1 cm².",
      config: { diagramType: "grid-count", cols, rows }
    },
    answer: `${cols * rows} cm${SQ}`,
    working: [
      `Each of the ${rows} rows holds ${cols} squares.`,
      `Multiply instead of counting: ${rows} × ${cols} = ${cols * rows} cm${SQ}.`
    ],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "area", "reasoning", "diagram"]
  });
}

const LENGTH_UNITS = [
  { unit: "cm", min: 3, max: 20 },
  { unit: "m", min: 2, max: 15 }
];

function areaRectangleQuestion() {
  const { unit, min, max } = choice(LENGTH_UNITS);
  const length = randInt(min + 2, max);
  const width = randInt(min, length - 1);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "area-rectangle",
    marks: 1,
    // The measurements go ON the figure rather than being stated beside an
    // unlabelled one. The engine draws every rectangle at the same fixed
    // proportions, so a bare shape silently contradicts the numbers — which at
    // a stage where students are still building the concept is worse than no
    // picture at all.
    prompt: `What is the area of this rectangle?`,
    diagram: {
      engine: "area-engine",
      notToScale: true,
      config: {
        diagramType: "rectangle",
        shape: "rectangle",
        lengthLabel: `${length} ${unit}`,
        widthLabel: `${width} ${unit}`
      }
    },
    answer: `${spaced(length * width)} ${unit}${SQ}`,
    working: [`${length} × ${width} = ${spaced(length * width)} ${unit}${SQ}.`],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "area", "diagram"]
  });
}

function areaSquareQuestion() {
  const { unit } = choice(LENGTH_UNITS);
  const side = randInt(3, 15);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "area-square",
    marks: 1,
    prompt: `What is the area of this square?`,
    diagram: {
      engine: "area-engine",
      notToScale: true,
      config: {
        diagramType: "rectangle",
        shape: "square",
        lengthLabel: `${side} ${unit}`
      }
    },
    answer: `${spaced(side * side)} ${unit}${SQ}`,
    working: [`${side} × ${side} = ${spaced(side * side)} ${unit}${SQ}.`],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "area", "diagram"]
  });
}

/* Working backwards from the area — the harder direction, and the one that
   shows whether the multiplication was understood or just performed. */
function missingSideQuestion() {
  const { unit } = choice(LENGTH_UNITS);
  const known = randInt(3, 12);
  const missing = randInt(3, 15);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "missing-side",
    marks: 2,
    prompt: `A rectangle has an area of ${spaced(known * missing)} ${unit}${SQ}. One side is ${known} ${unit}. How long is the other side?`,
    answer: `${missing} ${unit}`,
    working: [
      `Area = length × width, so divide to work backwards.`,
      `${spaced(known * missing)} ÷ ${known} = ${missing} ${unit}.`
    ],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "area", "reverse"]
  });
}

/*
  Triangle areas are introduced by halving a rectangle, which is what the
  content means by determining the area rather than applying a formula. Base
  and height are kept even so the halving stays whole.
*/
function areaTriangleQuestion() {
  const { unit } = choice(LENGTH_UNITS);
  const base = randInt(2, 9) * 2;
  const height = randInt(2, 8) * 2;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "area-triangle",
    marks: 2,
    prompt: `What is the area of this triangle?`,
    diagram: {
      engine: "area-engine",
      notToScale: true,
      config: {
        diagramType: "triangle",
        baseLabel: `${base} ${unit}`,
        heightLabel: `${height} ${unit}`
      }
    },
    answer: `${spaced((base * height) / 2)} ${unit}${SQ}`,
    working: [
      `The triangle is half of a ${base} by ${height} rectangle.`,
      `${base} × ${height} = ${spaced(base * height)}, and half of that is ${spaced((base * height) / 2)} ${unit}${SQ}.`
    ],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "area", "diagram"]
  });
}

/*
  Parallelogram by rearrangement: cut the triangle off one end and slide it to
  the other, and a rectangle appears. Same area, easier shape.
*/
function areaParallelogramQuestion() {
  const { unit } = choice(LENGTH_UNITS);
  const base = randInt(4, 16);
  const height = randInt(3, 12);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "area-parallelogram",
    marks: 2,
    prompt: `What is the area of this parallelogram?`,
    diagram: {
      engine: "area-engine",
      notToScale: true,
      config: {
        diagramType: "parallelogram",
        baseLabel: `${base} ${unit}`,
        heightLabel: `${height} ${unit}`
      }
    },
    answer: `${spaced(base * height)} ${unit}${SQ}`,
    working: [
      `Cut the triangle from one end and slide it to the other — the parallelogram becomes a rectangle.`,
      `${base} × ${height} = ${spaced(base * height)} ${unit}${SQ}.`
    ],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "area", "diagram"]
  });
}

/* Composite figures — split into rectangles, find each, add. */
function compositeAreaQuestion() {
  const unit = choice(["cm", "m"]);
  const a = { w: randInt(4, 12), h: randInt(3, 8) };
  const b = { w: randInt(3, 8), h: randInt(2, 6) };

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "composite-area",
    marks: 3,
    prompt: `An L-shaped garden bed is made from two rectangles. One is ${a.w} ${unit} by ${a.h} ${unit}, the other is ${b.w} ${unit} by ${b.h} ${unit}. What is the total area?`,
    answer: `${spaced(a.w * a.h + b.w * b.h)} ${unit}${SQ}`,
    working: [
      `First rectangle: ${a.w} × ${a.h} = ${spaced(a.w * a.h)} ${unit}${SQ}.`,
      `Second rectangle: ${b.w} × ${b.h} = ${spaced(b.w * b.h)} ${unit}${SQ}.`,
      `Total: ${spaced(a.w * a.h)} + ${spaced(b.w * b.h)} = ${spaced(a.w * a.h + b.w * b.h)} ${unit}${SQ}.`
    ],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "area", "composite"]
  });
}

/* ── units ───────────────────────────────────────────────── */

/*
  "Selects and uses the appropriate unit" is the verb in MA3-2DS-03, so
  choosing the unit is a question in its own right rather than something
  assumed. Each object sits unambiguously in one unit's range.
*/
const UNIT_CONTEXTS = [
  { thing: "a postage stamp", unit: `cm${SQ}`, why: "small enough to measure in centimetres" },
  { thing: "the cover of a book", unit: `cm${SQ}`, why: "a bit bigger than a hand" },
  { thing: "a classroom floor", unit: `m${SQ}`, why: "measured in metres, not centimetres" },
  { thing: "a basketball court", unit: `m${SQ}`, why: "tens of metres across" },
  { thing: "a school playground", unit: "hectares", why: "too large for square metres to be convenient" },
  { thing: "a cattle farm", unit: `km${SQ}`, why: "kilometres across" },
  { thing: "a national park", unit: `km${SQ}`, why: "far larger than a farm" }
];

function chooseUnitQuestion() {
  const context = choice(UNIT_CONTEXTS);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "choose-unit",
    marks: 1,
    prompt: `Which unit would you use to measure the area of ${context.thing}: cm${SQ}, m${SQ}, hectares or km${SQ}?`,
    answer: context.unit,
    working: [`It is ${context.why}, so ${context.unit} is the sensible unit.`],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "area", "units"]
  });
}

/* 1 hectare = 10 000 m², 1 km² = 100 hectares. Both are named in the content. */
function hectaresQuestion() {
  const forms = [
    () => {
      const hectares = randInt(2, 40);
      return {
        prompt: `A park covers ${hectares} hectares. How many square metres is that?`,
        answer: `${spaced(hectares * 10000)} m${SQ}`,
        note: `1 hectare is 10 000 m${SQ}, so ${hectares} × 10 000 = ${spaced(hectares * 10000)} m${SQ}.`
      };
    },
    () => {
      const km = randInt(2, 20);
      return {
        prompt: `A nature reserve covers ${km} km${SQ}. How many hectares is that?`,
        answer: `${spaced(km * 100)} hectares`,
        note: `1 km${SQ} is 100 hectares, so ${km} × 100 = ${spaced(km * 100)} hectares.`
      };
    },
    () => {
      const side = randInt(2, 9) * 100;
      return {
        prompt: `A square paddock has sides of ${side} m. What is its area in hectares?`,
        answer: `${(side * side) / 10000} hectares`,
        note: `${side} × ${side} = ${spaced(side * side)} m${SQ}, and ${spaced(side * side)} ÷ 10 000 = ${(side * side) / 10000} hectares.`
      };
    }
  ];

  const form = choice(forms)();

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "hectares",
    marks: 2,
    prompt: form.prompt,
    answer: form.answer,
    working: [form.note],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "area", "units"]
  });
}

/* ── classifying shapes ──────────────────────────────────── */

const QUADRILATERALS = [
  { name: "square", clue: "four equal sides and four right angles" },
  { name: "rectangle", clue: "four right angles, with opposite sides equal" },
  { name: "parallelogram", clue: "two pairs of parallel sides, but no right angles" },
  { name: "rhombus", clue: "four equal sides, but no right angles" },
  { name: "trapezium", clue: "exactly one pair of parallel sides" },
  { name: "kite", clue: "two pairs of equal sides next to each other" }
];

function classifyQuadrilateralQuestion() {
  const shape = choice(QUADRILATERALS);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "classify-quadrilateral",
    marks: 1,
    prompt: `Which quadrilateral has ${shape.clue}?`,
    answer: `A ${shape.name}`,
    working: [`Those properties describe a ${shape.name}.`],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "2D shapes", "classifying"]
  });
}

const TRIANGLES = [
  { name: "equilateral", clue: "three equal sides and three equal angles" },
  { name: "isosceles", clue: "exactly two equal sides" },
  { name: "scalene", clue: "no equal sides" },
  { name: "right-angled", clue: "one angle of exactly 90°" }
];

function classifyTriangleQuestion() {
  const triangle = choice(TRIANGLES);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "classify-triangle",
    marks: 1,
    prompt: `Which type of triangle has ${triangle.clue}?`,
    answer: `${triangle.name.replace(/^\w/, c => c.toUpperCase())}`,
    working: [`A triangle with ${triangle.clue} is ${triangle.name}.`],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "2D shapes", "classifying"]
  });
}

/*
  Property questions asked the other way round — given the shape, describe it.
  Both directions matter, and only one of them is answerable by matching
  keywords.
*/
function shapePropertiesQuestion() {
  const shape = choice(QUADRILATERALS);
  const askAbout = choice(["sides", "angles"]);

  const answers = {
    square: { sides: "Four equal sides, with opposite sides parallel", angles: "Four right angles" },
    rectangle: { sides: "Opposite sides equal and parallel", angles: "Four right angles" },
    parallelogram: { sides: "Two pairs of parallel sides, opposite sides equal", angles: "Opposite angles are equal" },
    rhombus: { sides: "Four equal sides, with opposite sides parallel", angles: "Opposite angles are equal" },
    trapezium: { sides: "Exactly one pair of parallel sides", angles: "No angles need to be equal" },
    kite: { sides: "Two pairs of equal sides next to each other", angles: "One pair of opposite angles is equal" }
  };

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "shape-properties",
    marks: 2,
    prompt: `Describe the ${askAbout} of a ${shape.name}.`,
    answer: answers[shape.name][askAbout],
    working: [`A ${shape.name} has ${shape.clue}.`],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "2D shapes", "properties"]
  });
}

/* ── transformations and symmetry (MA3-2DS-02) ───────────── */

function transformationsQuestion() {
  const forms = [
    {
      prompt: "A shape is slid across the page without turning or flipping it. Which transformation is this?",
      answer: "A translation",
      note: "Sliding without turning or flipping is a translation."
    },
    {
      prompt: "A shape is flipped over a line so it faces the other way. Which transformation is this?",
      answer: "A reflection",
      note: "Flipping over a line is a reflection."
    },
    {
      prompt: "A shape is turned about a point. Which transformation is this?",
      answer: "A rotation",
      note: "Turning about a point is a rotation."
    },
    {
      prompt: "A shape is translated 3 units right and 2 units down. Does its size or shape change? Explain.",
      answer: "No — only its position changes",
      note: "Translation, reflection and rotation all move a shape without resizing or reshaping it."
    },
    {
      prompt: "A rectangle is rotated a quarter turn. Is the new shape still a rectangle? Explain your answer.",
      answer: "Yes",
      note: "Rotating changes the orientation but not the side lengths or angles, so it is still a rectangle."
    }
  ];

  const form = choice(forms);
  const explains = /Explain/.test(form.prompt);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "transformations",
    marks: explains ? 2 : 1,
    prompt: form.prompt,
    answer: form.answer,
    working: [form.note],
    space: explains ? SPACE_SIZES.MEDIUM : SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "2D shapes", "transformations"]
  });
}

const SYMMETRY = [
  { name: "square", lines: 4 },
  { name: "rectangle", lines: 2 },
  { name: "equilateral triangle", lines: 3 },
  { name: "isosceles triangle", lines: 1 },
  { name: "rhombus", lines: 2 },
  { name: "regular pentagon", lines: 5 },
  { name: "regular hexagon", lines: 6 },
  { name: "kite", lines: 1 }
];

function symmetryQuestion() {
  const shape = choice(SYMMETRY);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "symmetry",
    marks: 1,
    prompt: `How many lines of symmetry does a ${shape.name} have?`,
    answer: String(shape.lines),
    working: [`A ${shape.name} can be folded onto itself in ${shape.lines} different ${shape.lines === 1 ? "way" : "ways"}.`],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "2D shapes", "symmetry"]
  });
}

/* ── multi-part ──────────────────────────────────────────── */

function multiPartAreaQuestion() {
  const length = randInt(7, 15);
  // Part (c) halves the width, so it has to be even or the answer is a
  // fraction — which is out of stage for a measurement here.
  const width = randInt(2, Math.floor((length - 1) / 2)) * 2;
  const area = length * width;
  const perimeter = 2 * (length + width);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "multi-part-area",
    marks: 3,
    prompt: `A rectangular vegetable patch is ${length} m long and ${width} m wide.`,
    subparts: [
      {
        label: "(a)",
        prompt: "What is its area?",
        marks: 1,
        answer: `${spaced(area)} m${SQ}`,
        working: [`${length} × ${width} = ${spaced(area)} m${SQ}.`]
      },
      {
        label: "(b)",
        prompt: "How much fencing is needed to go all the way around?",
        marks: 1,
        answer: `${perimeter} m`,
        working: [`${length} + ${width} + ${length} + ${width} = ${perimeter} m.`]
      },
      {
        label: "(c)",
        prompt: "A second patch has the same area but is twice as long. How wide is it?",
        marks: 1,
        answer: `${width / 2} m`,
        working: [`Twice as long with the same area means half as wide: ${width} ÷ 2 = ${width / 2} m.`]
      }
    ],
    answer: `(a) ${spaced(area)} m${SQ}; (b) ${perimeter} m; (c) ${width / 2} m`,
    working: [],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "area", "multi-part"]
  });
}

/* ── registry ────────────────────────────────────────────── */

const GENERATORS = {
  "count-unit-squares": countUnitSquaresQuestion,
  "rows-and-columns": rowsAndColumnsQuestion,
  "area-rectangle": areaRectangleQuestion,
  "area-square": areaSquareQuestion,
  "missing-side": missingSideQuestion,
  "area-triangle": areaTriangleQuestion,
  "area-parallelogram": areaParallelogramQuestion,
  "composite-area": compositeAreaQuestion,
  "choose-unit": chooseUnitQuestion,
  "hectares": hectaresQuestion,
  "classify-quadrilateral": classifyQuadrilateralQuestion,
  "classify-triangle": classifyTriangleQuestion,
  "shape-properties": shapePropertiesQuestion,
  "transformations": transformationsQuestion,
  "symmetry": symmetryQuestion,
  "multi-part-area": multiPartAreaQuestion
};

export function getStage3TwoDQuestionTypes() {
  return TYPE_LIST;
}

export function generateStage3TwoDQuestions({
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
