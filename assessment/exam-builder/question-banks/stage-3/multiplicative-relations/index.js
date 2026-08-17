/*
  Mills Maths Tools — Stage 3 Question Bank: Multiplicative Relations
  --------------------------------------------------------------------
  question-banks/stage-3/multiplicative-relations/index.js

  NSW Mathematics K–10 (2022), Stage 3, focus areas "Multiplicative relations A"
  and "Multiplicative relations B", merged into one topic. Outcomes:

    MA3-MR-01  selects and applies appropriate strategies to solve
               multiplication and division problems
    MA3-MR-02  constructs and completes number sentences involving
               multiplicative relations, applying the order of operations to
               calculations

  Content mapping is in docs/stage-3-syllabus-reference.md. Prompts are
  original; the syllabus supplies the content points, not the wording.

  THE MODEL IS THE POINT
  ----------------------
  Stage 3 does not ask students to be fast at multiplication — it asks them to
  "use partitioning and place value to multiply" and to "represent and solve
  division problems". Both of those are claims about a picture, so twelve of
  the twenty-one types here carry a diagram the student reads or completes,
  and the arithmetic-only types exist mainly to connect that picture to the
  symbols beside it.

  Four ways in, deliberately:
    - BUILD it     an empty area model to fill in
    - READ it      a completed model with no numbers in the prompt; say what
                   multiplication it shows
    - REVERSE it   the same rectangle as a division, with the quotient missing
    - SEE it       multiples shaded on a hundred chart, so a pattern is looked
                   at rather than listed

  Numbers are chosen so a partition is always clean: a 2-digit multiplicand
  splits into tens and ones, a 3-digit one into hundreds, tens and ones, and
  every division splits into a whole number of tens plus ones.
*/

import {
  createQuestion,
  SPACE_SIZES
} from "../../../schemas/question.schema.js";

import {
  attachQuestionTranslations
} from "../../../utils/translation.js";

const TOPIC = "Multiplicative Relations";

const TYPE_LIST = [
  { id: "array-product", label: "Read an array" },
  { id: "array-commutative", label: "One array, two facts" },
  { id: "factor-rectangles", label: "Factors as rectangles" },
  { id: "build-area-model", label: "Build an area model" },
  { id: "area-model-3-digit", label: "Area model: 3-digit × 1-digit" },
  { id: "area-model-2x2", label: "Area model: 2-digit × 2-digit" },
  { id: "area-model-read", label: "Read an area model" },
  { id: "division-model", label: "Division on an area model" },
  { id: "division-model-remainder", label: "Division with a remainder" },
  { id: "multiples-pattern", label: "Patterns made by multiples" },
  { id: "common-multiples", label: "Common multiples" },
  { id: "partition-to-multiply", label: "Partition to multiply" },
  { id: "estimate-product", label: "Estimate a product" },
  { id: "estimate-quotient", label: "Estimate a quotient" },
  { id: "interpret-remainder", label: "What the remainder means" },
  { id: "powers-of-ten", label: "Multiply and divide by 10, 100, 1000" },
  { id: "equivalent-sentence", label: "Equivalent number sentences" },
  { id: "unknown-factor", label: "Find the unknown" },
  { id: "order-of-operations", label: "Brackets and order of operations" },
  { id: "divide-3-digit", label: "Divide a 3-digit number" },
  { id: "multi-part-multiplicative", label: "Multi-part problem" }
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

function randomId(prefix = "s3mr") {
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

/*
  Thousands are spaced, in the diagrams as well as the prose. The renderer
  converts an already-grouped run to non-breaking spaces, so a number written
  this way can never be split across a line.
*/
function spaced(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/* Split 234 into [200, 30, 4], dropping any zero place. */
function placeParts(n) {
  return String(n)
    .split("")
    .map((digit, i, all) => Number(digit) * Math.pow(10, all.length - 1 - i))
    .filter(part => part > 0);
}

/* A 2-digit number whose ones digit is not zero, so the partition has two parts. */
function twoDigit(min = 12, max = 49) {
  let n = randInt(min, max);
  if (n % 10 === 0) n += randInt(1, 8);
  return n;
}

function threeDigit() {
  let n = randInt(112, 489);
  if (n % 10 === 0) n += randInt(1, 8);
  return n;
}

const NAMES = ["Ava", "Noah", "Mia", "Jack", "Ruby", "Kai", "Zara", "Leo", "Ivy", "Sam"];

function areaModelDiagram({ columnParts, rowParts, columnLabels, rowLabels, cells, total }) {
  return {
    engine: "array-area-engine",
    config: {
      diagramType: "area-model",
      columnParts,
      rowParts,
      ...(columnLabels !== undefined ? { columnLabels } : {}),
      ...(rowLabels !== undefined ? { rowLabels } : {}),
      ...(cells !== undefined ? { cells } : {}),
      ...(total !== undefined ? { total } : {})
    }
  };
}

/* ══ ARRAYS — the first multiplicative model ══════════════ */

/*
  The side labels are left blank. With them filled in, the question is just
  "copy these two numbers and multiply"; blank, the student has to see the
  array AS rows and columns, which is the thing being learnt.
*/
function arrayProductQuestion() {
  const rows = randInt(2, 9);
  const cols = randInt(2, 9);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "array-product",
    marks: 2,
    prompt: "Write a multiplication that matches this array, then find its answer.",
    diagram: {
      engine: "array-area-engine",
      config: { diagramType: "array", rows, cols, rowLabel: null, colLabel: null }
    },
    answer: `${rows} × ${cols} = ${rows * cols}`,
    working: [
      `There are ${rows} rows of ${cols}.`,
      `${rows} × ${cols} = ${rows * cols}. (${cols} × ${rows} = ${rows * cols} is also correct.)`
    ],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "multiplication", "array", "diagram"]
  });
}

function arrayCommutativeQuestion() {
  const rows = randInt(3, 9);
  let cols = randInt(3, 9);
  if (cols === rows) cols = rows === 9 ? 4 : rows + 1;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "array-commutative",
    marks: 2,
    prompt: "Write the TWO multiplication facts that this array shows.",
    diagram: {
      engine: "array-area-engine",
      config: { diagramType: "array", rows, cols, rowLabel: rows, colLabel: cols }
    },
    answer: `${rows} × ${cols} = ${rows * cols} and ${cols} × ${rows} = ${rows * cols}`,
    working: [
      `Read as rows: ${rows} rows of ${cols} is ${rows * cols}.`,
      `Read as columns: ${cols} columns of ${rows} is also ${rows * cols}.`,
      "Turning the array does not change how many dots there are."
    ],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "multiplication", "array", "diagram"]
  });
}

/*
  A factor pair is a rectangle that can actually be built, so the factors of a
  number are something to count rather than recall.
*/
const FACTOR_SETS = {
  12: [[1, 12], [2, 6], [3, 4]],
  16: [[1, 16], [2, 8], [4, 4]],
  18: [[1, 18], [2, 9], [3, 6]],
  20: [[1, 20], [2, 10], [4, 5]],
  24: [[1, 24], [2, 12], [3, 8], [4, 6]]
};

function factorCount(n) {
  let count = 0;
  for (let i = 1; i <= n; i++) if (n % i === 0) count += 1;
  return count;
}

function factorListOf(n) {
  const list = [];
  for (let i = 1; i <= n; i++) if (n % i === 0) list.push(i);
  return list;
}

function factorRectanglesQuestion() {
  const number = Number(choice(Object.keys(FACTOR_SETS)));
  const pairs = FACTOR_SETS[number];
  const askCount = Math.random() < 0.5;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "factor-rectangles",
    marks: 2,
    prompt: askCount
      ? `Every rectangle that can be made from ${number} counters is shown below. How many factors does ${number} have, and what are they?`
      : `These rectangles are all made from ${number} counters. Write the multiplication each one shows.`,
    diagram: {
      engine: "array-area-engine",
      config: {
        diagramType: "factor-rectangles",
        pairs,
        ...(askCount ? {} : { captions: null })
      }
    },
    answer: askCount
      ? `${factorCount(number)} factors: ${factorListOf(number).join(", ")}`
      : pairs.map(([a, b]) => `${a} × ${b}`).join(", "),
    working: askCount
      ? [
          `Each rectangle gives two factors — its width and its height.`,
          `The factors of ${number} are ${factorListOf(number).join(", ")}.`
        ]
      : [`Each rectangle is a factor pair: ${pairs.map(([a, b]) => `${a} × ${b} = ${number}`).join(", ")}.`],
    /* The "write the multiplication" variant blanks the caption under each
       rectangle, so it is answered ON the diagram and needs nothing below. */
    space: askCount ? SPACE_SIZES.MEDIUM : SPACE_SIZES.NONE,
    mcEligible: false,
    tags: ["stage3", "factors", "diagram"]
  });
}

/* ══ THE AREA MODEL ═══════════════════════════════════════ */

/*
  Everything blank — the edges as well as the cells. The student decides how
  to partition, which is the content point ("uses partitioning and place value
  to multiply"), rather than being handed the partition and asked to multiply.
  Answered on the diagram, so no answer space is added underneath.
*/
function buildAreaModelQuestion() {
  const big = twoDigit(13, 49);
  const small = randInt(3, 9);
  const parts = placeParts(big);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "build-area-model",
    marks: 2,
    prompt: `Split ${big} into tens and ones to complete this area model, and work out ${big} × ${small}.`,
    diagram: areaModelDiagram({
      columnParts: parts,
      rowParts: [small],
      columnLabels: parts.map(() => null),
      rowLabels: [small],
      cells: [parts.map(() => null)],
      total: null
    }),
    answer: spaced(big * small),
    working: [
      `${big} splits into ${parts.join(" and ")}.`,
      `${parts.map(p => `${p} × ${small} = ${spaced(p * small)}`).join(", ")}.`,
      `${parts.map(p => spaced(p * small)).join(" + ")} = ${spaced(big * small)}.`
    ],
    space: SPACE_SIZES.NONE,
    mcEligible: false,
    tags: ["stage3", "multiplication", "area-model", "diagram"]
  });
}

function areaModelThreeDigitQuestion() {
  const big = threeDigit();
  const small = randInt(3, 8);
  const parts = placeParts(big);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "area-model-3-digit",
    marks: 2,
    prompt: `Complete the area model to work out ${big} × ${small}.`,
    diagram: areaModelDiagram({
      columnParts: parts,
      rowParts: [small],
      columnLabels: parts.map(p => spaced(p)),
      rowLabels: [small],
      cells: [parts.map(() => null)],
      total: null
    }),
    answer: spaced(big * small),
    working: [
      `${parts.map(p => `${spaced(p)} × ${small} = ${spaced(p * small)}`).join(", ")}.`,
      `${parts.map(p => spaced(p * small)).join(" + ")} = ${spaced(big * small)}.`
    ],
    space: SPACE_SIZES.NONE,
    mcEligible: false,
    tags: ["stage3", "multiplication", "area-model", "diagram"]
  });
}

function areaModelTwoByTwoQuestion() {
  const a = twoDigit(13, 39);
  const b = twoDigit(13, 29);
  const aParts = placeParts(a);
  const bParts = placeParts(b);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "area-model-2x2",
    marks: 3,
    prompt: `Complete the area model to work out ${a} × ${b}.`,
    diagram: areaModelDiagram({
      columnParts: aParts,
      rowParts: bParts,
      columnLabels: aParts.map(p => String(p)),
      rowLabels: bParts.map(p => String(p)),
      cells: bParts.map(() => aParts.map(() => null)),
      total: null
    }),
    answer: spaced(a * b),
    working: [
      `Four parts: ${bParts.map(r => aParts.map(c => `${c} × ${r} = ${spaced(c * r)}`).join(", ")).join(", ")}.`,
      `Adding the four parts gives ${spaced(a * b)}.`
    ],
    space: SPACE_SIZES.NONE,
    mcEligible: false,
    tags: ["stage3", "multiplication", "area-model", "diagram"]
  });
}

/*
  The reverse direction. No numbers in the prompt at all — the student has to
  get the multiplication out of the picture. This is the type that separates
  "can fill in boxes" from "knows what the boxes mean".
*/
function areaModelReadQuestion() {
  const big = twoDigit(13, 49);
  const small = randInt(3, 9);
  const parts = placeParts(big);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "area-model-read",
    marks: 2,
    prompt: "What multiplication does this area model show? Write the multiplication and its answer.",
    diagram: areaModelDiagram({
      columnParts: parts,
      rowParts: [small],
      columnLabels: parts.map(p => String(p)),
      rowLabels: [small],
      cells: [parts.map(p => spaced(p * small))],
      total: false
    }),
    answer: `${big} × ${small} = ${spaced(big * small)}`,
    working: [
      `The top edge is ${parts.join(" + ")} = ${big}, and the side is ${small}.`,
      `The parts add to ${spaced(big * small)}, so the model shows ${big} × ${small} = ${spaced(big * small)}.`
    ],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "multiplication", "area-model", "diagram"]
  });
}

/* ── division on the same rectangle ──────────────────────── */

/*
  Division is the same rectangle with a different piece missing: the area and
  one side are known, and the other side is the answer. Keeping the picture
  identical to the multiplication model is the whole idea — it is why
  "represent division" is a content point at all.
*/
function divisionModelQuestion() {
  const divisor = randInt(3, 9);
  const tens = randInt(1, 4) * 10;
  const ones = randInt(2, 9);
  const quotient = tens + ones;
  const dividend = quotient * divisor;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "division-model",
    marks: 2,
    prompt: `Use the area model to work out ${spaced(dividend)} ÷ ${divisor}.`,
    diagram: {
      engine: "array-area-engine",
      config: {
        diagramType: "division-area-model",
        divisor,
        parts: [
          { quotient: null, area: spaced(tens * divisor) },
          { quotient: null, area: spaced(ones * divisor) }
        ]
      }
    },
    answer: `${quotient}`,
    working: [
      `${spaced(dividend)} splits into ${spaced(tens * divisor)} and ${spaced(ones * divisor)}.`,
      `${spaced(tens * divisor)} ÷ ${divisor} = ${tens} and ${spaced(ones * divisor)} ÷ ${divisor} = ${ones}.`,
      `${tens} + ${ones} = ${quotient}.`
    ],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "division", "area-model", "diagram"]
  });
}

function divisionModelRemainderQuestion() {
  const divisor = randInt(3, 9);
  const tens = randInt(1, 3) * 10;
  const ones = randInt(2, 9);
  const quotient = tens + ones;
  const remainder = randInt(1, divisor - 1);
  const dividend = quotient * divisor + remainder;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "division-model-remainder",
    marks: 2,
    prompt: `Use the area model to work out ${spaced(dividend)} ÷ ${divisor}. The block on the right is what is left over.`,
    diagram: {
      engine: "array-area-engine",
      config: {
        diagramType: "division-area-model",
        divisor,
        parts: [
          { quotient: null, area: spaced(tens * divisor) },
          { quotient: null, area: spaced(ones * divisor) }
        ],
        remainder
      }
    },
    answer: `${quotient} remainder ${remainder}`,
    working: [
      `${spaced(tens * divisor)} ÷ ${divisor} = ${tens} and ${spaced(ones * divisor)} ÷ ${divisor} = ${ones}, so far ${quotient}.`,
      `${remainder} is left over because it is not enough to make another group of ${divisor}.`
    ],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "division", "remainder", "area-model", "diagram"]
  });
}

/* ══ MULTIPLES ON A HUNDRED CHART ═════════════════════════ */

const MULTIPLE_PATTERNS = {
  2: "Five complete columns — every number ending in 0, 2, 4, 6 or 8.",
  3: "Diagonal lines running down to the left.",
  5: "Two complete columns — every number ending in 5 or 0.",
  9: "A diagonal running down to the left, moving one column across each row.",
  10: "One complete column — every number ending in 0."
};

function multiplesOf(k, to) {
  const list = [];
  for (let v = k; v <= to; v += k) list.push(v);
  return list;
}

function multiplesPatternQuestion() {
  const k = Number(choice(Object.keys(MULTIPLE_PATTERNS)));

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "multiples-pattern",
    marks: 2,
    prompt: `The multiples of ${k} are shaded on this grid. Describe the pattern they make.`,
    diagram: {
      engine: "array-area-engine",
      config: {
        diagramType: "number-grid",
        from: 1,
        to: 60,
        columns: 10,
        shade: multiplesOf(k, 60),
        shadeLabel: `multiples of ${k}`
      }
    },
    answer: MULTIPLE_PATTERNS[k],
    working: [
      MULTIPLE_PATTERNS[k],
      `The grid is 10 wide, so the pattern repeats every time you add ${k}.`
    ],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "multiples", "patterns", "diagram"]
  });
}

const MULTIPLE_PAIRS = [[2, 3], [2, 5], [3, 4], [3, 5], [4, 6], [4, 5], [5, 6], [6, 8]];

function commonMultiplesQuestion() {
  const [a, b] = choice(MULTIPLE_PAIRS);
  const setA = multiplesOf(a, 60);
  const setB = multiplesOf(b, 60);
  const both = setA.filter(v => setB.includes(v));
  const askSmallest = Math.random() < 0.5;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "common-multiples",
    marks: askSmallest ? 1 : 2,
    prompt: askSmallest
      ? `Multiples of ${a} and multiples of ${b} are shaded. What is the SMALLEST number that is a multiple of both?`
      : `Multiples of ${a} and multiples of ${b} are shaded. Write all the numbers on the grid that are multiples of both.`,
    diagram: {
      engine: "array-area-engine",
      config: {
        diagramType: "number-grid",
        from: 1,
        to: 60,
        columns: 10,
        shade: setA,
        shadeAlt: setB,
        shadeLabel: `multiples of ${a}`,
        shadeAltLabel: `multiples of ${b}`
      }
    },
    answer: askSmallest ? `${both[0]}` : both.join(", "),
    working: [
      "The numbers shaded in both colours are the common multiples.",
      askSmallest
        ? `The smallest is ${both[0]}.`
        : `They are ${both.join(", ")}.`
    ],
    space: askSmallest ? SPACE_SIZES.SMALL : SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "multiples", "diagram"]
  });
}

/* ══ CONNECTING THE MODEL TO THE SYMBOLS ══════════════════ */

function partitionToMultiplyQuestion() {
  const big = twoDigit(13, 69);
  const small = randInt(3, 9);
  const parts = placeParts(big);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "partition-to-multiply",
    marks: 2,
    prompt: `Use partitioning to work out ${big} × ${small}. Write the two multiplications you would do, then add them.`,
    answer: `${parts.map(p => `${p} × ${small} = ${spaced(p * small)}`).join(", ")}, total ${spaced(big * small)}`,
    working: [
      `${big} is ${parts.join(" + ")}.`,
      `${parts.map(p => `${p} × ${small} = ${spaced(p * small)}`).join(" and ")}.`,
      `${parts.map(p => spaced(p * small)).join(" + ")} = ${spaced(big * small)}.`
    ],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "multiplication", "partitioning"]
  });
}

function roundToTen(n) {
  return Math.round(n / 10) * 10;
}

function estimateProductQuestion() {
  let a = twoDigit(21, 89);
  let b = twoDigit(12, 49);
  if (a % 10 === 5) a += 1;
  if (b % 10 === 5) b += 1;

  const ra = roundToTen(a);
  const rb = roundToTen(b);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "estimate-product",
    marks: 1,
    prompt: `Estimate ${a} × ${b} by rounding each number to the nearest ten.`,
    answer: `${ra} × ${rb} = ${spaced(ra * rb)}`,
    working: [
      `${a} rounds to ${ra} and ${b} rounds to ${rb}.`,
      `${ra} × ${rb} = ${spaced(ra * rb)}.`
    ],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "estimation"]
  });
}

function estimateQuotientQuestion() {
  const divisor = randInt(3, 9);
  const quotient = randInt(12, 60);
  const target = quotient * divisor;
  /* Nudge off the exact answer so rounding is doing real work. */
  const dividend = target + choice([-3, -2, -1, 1, 2, 3]);

  const rounded = roundToTen(dividend);
  const nearestUsable = Math.round(rounded / divisor);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "estimate-quotient",
    marks: 1,
    prompt: `Estimate ${spaced(dividend)} ÷ ${divisor} by first rounding ${spaced(dividend)} to the nearest ten.`,
    answer: `About ${nearestUsable}`,
    working: [
      `${spaced(dividend)} rounds to ${spaced(rounded)}.`,
      `${spaced(rounded)} ÷ ${divisor} is about ${nearestUsable}.`
    ],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "estimation", "division"]
  });
}

/*
  A remainder is not always "r 3". Whether it rounds up, is dropped, or is the
  answer itself depends entirely on the question, which is why the syllabus
  asks students to SOLVE division problems rather than just perform them.
*/
function interpretRemainderQuestion() {
  const forms = [
    () => {
      const perBus = choice([28, 32, 45, 50]);
      const students = perBus * randInt(3, 7) + randInt(1, perBus - 1);
      const buses = Math.ceil(students / perBus);
      return {
        prompt: `A bus seats ${perBus} students. ${students} students are going on an excursion. How many buses are needed?`,
        answer: `${buses} buses`,
        note: `${students} ÷ ${perBus} = ${Math.floor(students / perBus)} remainder ${students % perBus}. The students left over still need a bus, so round up to ${buses}.`
      };
    },
    () => {
      const perBox = choice([6, 8, 12]);
      const items = perBox * randInt(6, 14) + randInt(1, perBox - 1);
      const boxes = Math.floor(items / perBox);
      return {
        prompt: `Eggs are packed ${perBox} to a box. How many FULL boxes can be packed from ${items} eggs?`,
        answer: `${boxes} boxes`,
        note: `${items} ÷ ${perBox} = ${boxes} remainder ${items % perBox}. The leftover eggs do not fill a box, so the answer is ${boxes}.`
      };
    },
    () => {
      const people = randInt(4, 9);
      const total = people * randInt(4, 12) + randInt(1, people - 1);
      return {
        prompt: `${total} marbles are shared equally between ${people} friends. How many are left over?`,
        answer: `${total % people} marbles`,
        note: `${total} ÷ ${people} = ${Math.floor(total / people)} each, with ${total % people} left over.`
      };
    }
  ];

  const form = choice(forms)();

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "interpret-remainder",
    marks: 2,
    prompt: form.prompt,
    answer: form.answer,
    working: [form.note],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "division", "remainder", "word-problem"]
  });
}

/* ══ NUMBER SENTENCES (MA3-MR-02) ═════════════════════════ */

function powersOfTenQuestion() {
  const power = choice([10, 100, 1000]);
  const multiply = Math.random() < 0.5;

  if (multiply) {
    const value = choice([
      randInt(2, 99) / 10,
      randInt(2, 99) / 100,
      randInt(2, 60)
    ]);
    const result = Number((value * power).toFixed(4));

    return createQuestion({
      id: randomId(),
      topic: TOPIC,
      level: "mixed",
      type: "powers-of-ten",
      marks: 1,
      prompt: `Work out ${value} × ${spaced(power)}.`,
      answer: spaced(result),
      working: [
        `Multiplying by ${spaced(power)} moves every digit ${String(power).length - 1} places to the left.`,
        `${value} × ${spaced(power)} = ${spaced(result)}.`
      ],
      space: SPACE_SIZES.SMALL,
      mcEligible: false,
      tags: ["stage3", "powers-of-ten"]
    });
  }

  const result = choice([randInt(2, 99) / 10, randInt(2, 99), randInt(2, 60)]);
  const value = Number((result * power).toFixed(4));

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "powers-of-ten",
    marks: 1,
    prompt: `Work out ${spaced(value)} ÷ ${spaced(power)}.`,
    answer: spaced(result),
    working: [
      `Dividing by ${spaced(power)} moves every digit ${String(power).length - 1} places to the right.`,
      `${spaced(value)} ÷ ${spaced(power)} = ${spaced(result)}.`
    ],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "powers-of-ten"]
  });
}

/*
  Equivalence, not calculation: 6 × 8 = 12 × □ is solved by noticing that one
  factor doubled so the other must halve. Generated so that the scaling is
  always exact.
*/
function equivalentSentenceQuestion() {
  const scale = choice([2, 3, 4]);
  const base = randInt(3, 9);
  const other = scale * randInt(2, 6);
  const answer = other / scale;

  const asDivision = Math.random() < 0.4;

  if (asDivision) {
    const product = base * other;
    return createQuestion({
      id: randomId(),
      topic: TOPIC,
      level: "mixed",
      type: "equivalent-sentence",
      marks: 2,
      prompt: `Find the number that makes this true: ${spaced(product)} ÷ ${other} = ${spaced(product / scale)} ÷ □`,
      answer: `${other / scale}`,
      working: [
        `The left number was divided by ${scale}, so the other one must be too.`,
        `${other} ÷ ${scale} = ${other / scale}.`
      ],
      space: SPACE_SIZES.MEDIUM,
      mcEligible: false,
      tags: ["stage3", "number-sentences"]
    });
  }

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "equivalent-sentence",
    marks: 2,
    prompt: `Find the number that makes this true: ${base} × ${other} = ${base * scale} × □`,
    answer: `${answer}`,
    working: [
      `${base} was multiplied by ${scale} to get ${base * scale}.`,
      `To keep the answer the same, ${other} must be divided by ${scale}: ${other} ÷ ${scale} = ${answer}.`
    ],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "number-sentences"]
  });
}

function unknownFactorQuestion() {
  const a = randInt(3, 12);
  const b = randInt(4, 12);
  const product = a * b;

  const forms = [
    { prompt: `□ × ${b} = ${product}`, answer: `${a}`, note: `${product} ÷ ${b} = ${a}.` },
    { prompt: `${a} × □ = ${product}`, answer: `${b}`, note: `${product} ÷ ${a} = ${b}.` },
    { prompt: `${product} ÷ □ = ${b}`, answer: `${a}`, note: `${product} ÷ ${b} = ${a}.` },
    { prompt: `${product} ÷ ${a} = □`, answer: `${b}`, note: `${product} ÷ ${a} = ${b}.` }
  ];

  const form = choice(forms);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "unknown-factor",
    marks: 1,
    prompt: `Find the missing number: ${form.prompt}`,
    answer: form.answer,
    working: [form.note],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "number-sentences"]
  });
}

function orderOfOperationsQuestion() {
  const forms = [
    () => {
      const a = randInt(3, 9);
      const b = randInt(2, 9);
      const c = randInt(2, 9);
      return {
        text: `${a} × (${b} + ${c})`,
        value: a * (b + c),
        note: `Brackets first: ${b} + ${c} = ${b + c}. Then ${a} × ${b + c} = ${a * (b + c)}.`
      };
    },
    () => {
      const b = randInt(6, 14);
      const c = randInt(2, 5);
      const a = randInt(2, 9);
      return {
        text: `(${b} − ${c}) × ${a}`,
        value: (b - c) * a,
        note: `Brackets first: ${b} − ${c} = ${b - c}. Then ${b - c} × ${a} = ${(b - c) * a}.`
      };
    },
    () => {
      const b = randInt(2, 6);
      const c = randInt(2, 6);
      /* The product is built FIRST and the start number placed above it.
         Choosing the start number freely lets 22 − 6 × 5 through, and a
         negative answer is Stage 4 content — there are no integers here yet. */
      const a = b * c + randInt(4, 30);
      return {
        text: `${a} − ${b} × ${c}`,
        value: a - b * c,
        note: `Multiplication before subtraction: ${b} × ${c} = ${b * c}. Then ${a} − ${b * c} = ${a - b * c}.`
      };
    },
    () => {
      const b = randInt(2, 9);
      const c = randInt(2, 9);
      const q = randInt(2, 8);
      return {
        text: `${b * q} ÷ ${b} + ${c}`,
        value: q + c,
        note: `Division before addition: ${b * q} ÷ ${b} = ${q}. Then ${q} + ${c} = ${q + c}.`
      };
    }
  ];

  const form = choice(forms)();

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "order-of-operations",
    marks: 2,
    prompt: `Work out: ${form.text}`,
    answer: spaced(form.value),
    working: [form.note],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "order-of-operations"]
  });
}

function divideThreeDigitQuestion() {
  const divisor = randInt(3, 9);
  /* The dividend is held to three digits, which is what the content point
     says ("divide a number with 3 or more digits by a one-digit divisor").
     Picking the quotient freely would let 180 × 9 through as a 4-digit one. */
  const quotient = randInt(Math.ceil(100 / divisor), Math.floor(999 / divisor));
  const dividend = quotient * divisor;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "divide-3-digit",
    marks: 2,
    prompt: `Work out ${spaced(dividend)} ÷ ${divisor}.`,
    answer: spaced(quotient),
    working: [`${spaced(dividend)} ÷ ${divisor} = ${spaced(quotient)}.`],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "division"]
  });
}

/* ── multi-part ──────────────────────────────────────────── */

/*
  Built so part (c) is the exact inverse of part (a): the same rectangle,
  divided instead of multiplied. That is the connection the outcome is about,
  and it only lands if the numbers come out whole — so the total is
  constructed from the two factors rather than chosen.
*/
function multiPartMultiplicativeQuestion() {
  const boxes = twoDigit(13, 29);
  const perBox = choice([15, 16, 18, 24, 25, 32, 36]);
  const total = boxes * perBox;
  const parts = placeParts(boxes);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "multi-part-multiplicative",
    marks: 3,
    prompt: `${choice(NAMES)}'s school orders ${boxes} boxes of pencils. Each box holds ${perBox} pencils.`,
    subparts: [
      {
        label: "(a)",
        prompt: "Complete the area model to find the total number of pencils.",
        marks: 1,
        diagram: areaModelDiagram({
          columnParts: parts,
          rowParts: [perBox],
          columnLabels: parts.map(p => String(p)),
          rowLabels: [perBox],
          cells: [parts.map(() => null)],
          total: null
        }),
        answer: `${spaced(total)} pencils`,
        working: [`${parts.map(p => `${p} × ${perBox} = ${spaced(p * perBox)}`).join(" and ")}, giving ${spaced(total)}.`]
      },
      {
        label: "(b)",
        prompt: "Check your answer is sensible by rounding each number to the nearest ten and estimating.",
        marks: 1,
        answer: `${roundToTen(boxes)} × ${roundToTen(perBox)} = ${spaced(roundToTen(boxes) * roundToTen(perBox))}`,
        working: [`About ${spaced(roundToTen(boxes) * roundToTen(perBox))}, which is close to ${spaced(total)}.`]
      },
      {
        label: "(c)",
        prompt: `The ${spaced(total)} pencils are shared equally between ${perBox} classrooms. How many does each classroom get?`,
        marks: 1,
        answer: `${boxes} pencils`,
        working: [`${spaced(total)} ÷ ${perBox} = ${boxes}, which is the number of boxes — division undoes the multiplication.`]
      }
    ],
    answer: `(a) ${spaced(total)} pencils; (b) ${spaced(roundToTen(boxes) * roundToTen(perBox))}; (c) ${boxes} pencils`,
    working: [],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "multiplication", "division", "multi-part", "diagram"]
  });
}

/* ── registry ────────────────────────────────────────────── */

const GENERATORS = {
  "array-product": arrayProductQuestion,
  "array-commutative": arrayCommutativeQuestion,
  "factor-rectangles": factorRectanglesQuestion,
  "build-area-model": buildAreaModelQuestion,
  "area-model-3-digit": areaModelThreeDigitQuestion,
  "area-model-2x2": areaModelTwoByTwoQuestion,
  "area-model-read": areaModelReadQuestion,
  "division-model": divisionModelQuestion,
  "division-model-remainder": divisionModelRemainderQuestion,
  "multiples-pattern": multiplesPatternQuestion,
  "common-multiples": commonMultiplesQuestion,
  "partition-to-multiply": partitionToMultiplyQuestion,
  "estimate-product": estimateProductQuestion,
  "estimate-quotient": estimateQuotientQuestion,
  "interpret-remainder": interpretRemainderQuestion,
  "powers-of-ten": powersOfTenQuestion,
  "equivalent-sentence": equivalentSentenceQuestion,
  "unknown-factor": unknownFactorQuestion,
  "order-of-operations": orderOfOperationsQuestion,
  "divide-3-digit": divideThreeDigitQuestion,
  "multi-part-multiplicative": multiPartMultiplicativeQuestion
};

export function getMultiplicativeRelationsQuestionTypes() {
  return TYPE_LIST;
}

export function generateMultiplicativeRelationsQuestions({
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
