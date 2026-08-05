/*
  Mills Maths Tools — Stage 3 Question Bank: Fractions
  -----------------------------------------------------
  question-banks/stage-3/fractions/index.js

  NSW Mathematics K–10 (2022), Stage 3, focus areas "Representing quantity
  fractions A" and "Representing quantity fractions B", merged into one topic.
  Outcomes:

    MA3-RQF-01  compares and orders fractions with denominators of
                2, 3, 4, 5, 6, 8 and 10
    MA3-RQF-02  determines 1/2, 1/4, 1/5 and 1/10 of measures and quantities

  Content mapping is in docs/stage-3-syllabus-reference.md. Prompts are
  original; the syllabus supplies the content points, not the wording.

  Two limits come straight from the outcomes and are enforced throughout:

    - DENOMINATORS are restricted to 2, 3, 4, 5, 6, 8 and 10. MA3-RQF-01 names
      that set explicitly, and a seventh or ninth would be out of stage.
    - FRACTIONS OF A QUANTITY use only halves, quarters, fifths and tenths, the
      four MA3-RQF-02 names. Thirds and sixths appear when comparing and
      ordering, but never as an operator on an amount.

  Quantities are always chosen so the answer is a whole number — a Stage 3
  student finding 1/4 of an amount should not meet a remainder while doing it.
*/

import {
  createQuestion,
  SPACE_SIZES
} from "../../../schemas/question.schema.js";

import {
  attachQuestionTranslations
} from "../../../utils/translation.js";

const TOPIC = "Fractions";

const TYPE_LIST = [
  { id: "name-fraction-bar", label: "Name the fraction (bar)" },
  { id: "name-fraction-circle", label: "Name the fraction (circle)" },
  { id: "name-fraction-set", label: "Fraction of a group" },
  { id: "shade-fraction", label: "Shade a fraction" },
  { id: "fraction-number-line", label: "Fractions on a number line" },
  { id: "compare-unit-fractions", label: "Compare unit fractions" },
  { id: "compare-related-fractions", label: "Compare related fractions" },
  { id: "order-fractions", label: "Order fractions" },
  { id: "equivalent-fractions", label: "Equivalent fractions" },
  { id: "add-same-denominator", label: "Add fractions (same denominator)" },
  { id: "subtract-same-denominator", label: "Subtract fractions (same denominator)" },
  { id: "add-related-denominators", label: "Add fractions (related denominators)" },
  { id: "fraction-as-division", label: "A fraction as a division" },
  { id: "build-to-whole", label: "Build up to the whole" },
  { id: "fraction-of-quantity", label: "Fraction of a quantity" },
  { id: "fraction-of-measure", label: "Fraction of a measurement" },
  { id: "multi-part-fractions", label: "Multi-part fraction problem" }
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

function randomId(prefix = "s3fr") {
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

/* The renderer's stacked-fraction token. */
function frac(n, d) {
  return `[[frac:${n}:${d}]]`;
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function simplify(n, d) {
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}

/* MA3-RQF-01 names this set. Nothing outside it appears anywhere in the bank. */
const DENOMINATORS = [2, 3, 4, 5, 6, 8, 10];

/* MA3-RQF-02 names these four as operators on a quantity. */
const QUANTITY_FRACTIONS = [
  { n: 1, d: 2, words: "half" },
  { n: 1, d: 4, words: "quarter" },
  { n: 1, d: 5, words: "fifth" },
  { n: 1, d: 10, words: "tenth" }
];

/* Denominator pairs where one divides the other, for the "related
   denominators" content point: 1/2 and 1/4, 1/3 and 1/6, 1/5 and 1/10. */
const RELATED_PAIRS = [[2, 4], [2, 6], [2, 8], [2, 10], [3, 6], [4, 8], [5, 10]];

/* ── naming a fraction from a diagram ────────────────────── */

function nameFractionBarQuestion() {
  const d = choice(DENOMINATORS);
  const n = randInt(1, d - 1);
  const simple = simplify(n, d);
  const askSimplest = simple.d !== d;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "name-fraction-bar",
    marks: 1,
    prompt: askSimplest
      ? "What fraction of the bar is shaded? Give your answer in its simplest form."
      : "What fraction of the bar is shaded?",
    diagram: {
      engine: "fdp-engine",
      config: { diagramType: "fraction-bar", denominator: d, numerator: n }
    },
    answer: askSimplest ? frac(simple.n, simple.d) : frac(n, d),
    working: askSimplest
      ? [`${n} of the ${d} parts are shaded, and ${frac(n, d)} simplifies to ${frac(simple.n, simple.d)}.`]
      : [`${n} of the ${d} equal parts are shaded.`],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "fractions", "diagram"]
  });
}

function nameFractionCircleQuestion() {
  const d = choice([2, 3, 4, 5, 6, 8, 10]);
  const n = randInt(1, d - 1);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "name-fraction-circle",
    marks: 1,
    prompt: "What fraction of the circle is shaded?",
    diagram: {
      engine: "fdp-engine",
      config: { diagramType: "fraction-circle", denominator: d, numerator: n }
    },
    answer: frac(n, d),
    working: [`The circle is cut into ${d} equal parts and ${n} are shaded.`],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "fractions", "diagram"]
  });
}

function nameFractionSetQuestion() {
  const d = choice([2, 3, 4, 5, 6]);
  const groups = randInt(2, 4);
  const total = d * groups;
  const shadedGroups = randInt(1, d - 1);
  const shaded = shadedGroups * groups;
  const simple = simplify(shaded, total);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "name-fraction-set",
    marks: 1,
    prompt: "What fraction of the counters is shaded? Give your answer in its simplest form.",
    diagram: {
      engine: "fdp-engine",
      config: { diagramType: "fraction-of-set", total, shaded, cols: Math.min(total, 6) }
    },
    answer: frac(simple.n, simple.d),
    working: [
      `${shaded} of the ${total} counters are shaded.`,
      `${frac(shaded, total)} simplifies to ${frac(simple.n, simple.d)}.`
    ],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "fractions", "diagram"]
  });
}

function shadeFractionQuestion() {
  const d = choice(DENOMINATORS);
  const n = randInt(1, d - 1);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "shade-fraction",
    marks: 1,
    prompt: `Shade ${frac(n, d)} of the bar below.`,
    diagram: {
      engine: "fdp-engine",
      config: { diagramType: "fraction-bar", denominator: d, numerator: 0 }
    },
    answer: `${n} of the ${d} parts shaded`,
    working: [`The bar has ${d} equal parts, so shade ${n} of them.`],
    space: SPACE_SIZES.NONE,
    mcEligible: false,
    tags: ["stage3", "fractions", "diagram"]
  });
}

function fractionNumberLineQuestion() {
  const d = choice([2, 3, 4, 5, 6, 8, 10]);
  const n = randInt(1, d - 1);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "fraction-number-line",
    marks: 1,
    prompt: `Mark ${frac(n, d)} on the number line below.`,
    diagram: {
      engine: "fdp-engine",
      config: { diagramType: "number-line-fraction", denominator: d, wholes: 1, showMark: false }
    },
    answer: `${n} parts along from 0`,
    working: [
      `The line from 0 to 1 is cut into ${d} equal parts.`,
      `Count ${n} of them.`
    ],
    space: SPACE_SIZES.NONE,
    mcEligible: false,
    tags: ["stage3", "fractions", "number line", "diagram"]
  });
}

/* ── comparing and ordering ──────────────────────────────── */

/*
  Unit fractions first, because the ordering is counter-intuitive: the bigger
  the denominator the SMALLER the piece. The syllabus lists this separately
  from general comparison for that reason.
*/
function compareUnitFractionsQuestion() {
  const [a, b] = shuffle(DENOMINATORS).slice(0, 2);
  const larger = a < b ? a : b;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "compare-unit-fractions",
    marks: 1,
    prompt: `Which is larger: ${frac(1, a)} or ${frac(1, b)}?`,
    answer: frac(1, larger),
    working: [
      `The whole is cut into ${a} parts and into ${b} parts.`,
      `Fewer parts means bigger parts, so ${frac(1, larger)} is larger.`
    ],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "fractions", "comparing"]
  });
}

function compareRelatedFractionsQuestion() {
  const [small, big] = choice(RELATED_PAIRS);
  const factor = big / small;

  const aNum = randInt(1, small - 1);
  const bNum = randInt(1, big - 1);

  const aScaled = aNum * factor;
  if (aScaled === bNum) return compareRelatedFractionsQuestion();

  const aBigger = aScaled > bNum;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "compare-related-fractions",
    marks: 2,
    prompt: `Which is larger, ${frac(aNum, small)} or ${frac(bNum, big)}? Explain how you know.`,
    answer: aBigger ? frac(aNum, small) : frac(bNum, big),
    working: [
      `${small} divides into ${big}, so rename ${frac(aNum, small)} as ${frac(aScaled, big)}.`,
      `${frac(aScaled, big)} and ${frac(bNum, big)} now have the same denominator, so compare the numerators.`,
      `${aBigger ? frac(aNum, small) : frac(bNum, big)} is larger.`
    ],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "fractions", "comparing", "equivalence"]
  });
}

function orderFractionsQuestion() {
  const d = choice([4, 6, 8, 10]);
  const pool = Array.from({ length: d - 1 }, (_, i) => i + 1);
  const ascending = Math.random() < 0.5;

  // Reshuffle until the displayed order differs from the answer — otherwise
  // the question is already done and asks the student nothing.
  let numerators;
  let sorted;
  let attempts = 0;
  do {
    numerators = shuffle(pool).slice(0, 4);
    sorted = numerators.slice().sort((x, y) => ascending ? x - y : y - x);
    attempts += 1;
  } while (numerators.join() === sorted.join() && attempts < 20);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "order-fractions",
    marks: 1,
    prompt: `Write these fractions in order from ${ascending ? "smallest to largest" : "largest to smallest"}: ${numerators.map(n => frac(n, d)).join(", ")}`,
    answer: sorted.map(n => frac(n, d)).join(", "),
    working: [
      `All four have the same denominator, so order them by the numerator.`,
      `In order: ${sorted.map(n => frac(n, d)).join(", ")}.`
    ],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "fractions", "ordering"]
  });
}

function equivalentFractionsQuestion() {
  const [small, big] = choice(RELATED_PAIRS);
  const factor = big / small;
  const n = randInt(1, small - 1);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "equivalent-fractions",
    marks: 1,
    prompt: `The bars show two equivalent fractions. Complete: ${frac(n, small)} = □/${big}`,
    diagram: {
      engine: "fdp-engine",
      config: {
        diagramType: "equivalent-bars",
        fracs: [{ n, d: small }, { n: n * factor, d: big }]
      }
    },
    answer: String(n * factor),
    working: [
      `Each of the ${small} parts splits into ${factor}.`,
      `${frac(n, small)} = ${frac(n * factor, big)}.`
    ],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "fractions", "equivalence", "diagram"]
  });
}

/* ── adding and subtracting ──────────────────────────────── */

function addSameDenominatorQuestion() {
  const d = choice([3, 4, 5, 6, 8, 10]);
  const a = randInt(1, d - 2);
  const b = randInt(1, d - a - 1);
  const total = a + b;
  const simple = simplify(total, d);
  const needsSimplifying = simple.d !== d;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "add-same-denominator",
    marks: 1,
    prompt: `Calculate: ${frac(a, d)} + ${frac(b, d)}`,
    answer: needsSimplifying ? frac(simple.n, simple.d) : frac(total, d),
    working: [
      `The denominators match, so add the numerators: ${a} + ${b} = ${total}.`,
      needsSimplifying
        ? `${frac(total, d)} simplifies to ${frac(simple.n, simple.d)}.`
        : `The answer is ${frac(total, d)}.`
    ],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "fractions", "addition"]
  });
}

function subtractSameDenominatorQuestion() {
  const d = choice([3, 4, 5, 6, 8, 10]);
  const a = randInt(2, d - 1);
  const b = randInt(1, a - 1);
  const result = a - b;
  const simple = simplify(result, d);
  const needsSimplifying = simple.d !== d;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "subtract-same-denominator",
    marks: 1,
    prompt: `Calculate: ${frac(a, d)} − ${frac(b, d)}`,
    answer: needsSimplifying ? frac(simple.n, simple.d) : frac(result, d),
    working: [
      `The denominators match, so subtract the numerators: ${a} − ${b} = ${result}.`,
      needsSimplifying
        ? `${frac(result, d)} simplifies to ${frac(simple.n, simple.d)}.`
        : `The answer is ${frac(result, d)}.`
    ],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "fractions", "subtraction"]
  });
}

/* Related denominators — rename one fraction, then add. */
function addRelatedDenominatorsQuestion() {
  const [small, big] = choice(RELATED_PAIRS);
  const factor = big / small;

  const a = randInt(1, small - 1);
  const b = randInt(1, big - 1);
  const totalNum = a * factor + b;

  if (totalNum >= big) return addRelatedDenominatorsQuestion();

  const simple = simplify(totalNum, big);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "add-related-denominators",
    marks: 2,
    prompt: `Calculate: ${frac(a, small)} + ${frac(b, big)}`,
    answer: simple.d === big ? frac(totalNum, big) : frac(simple.n, simple.d),
    working: [
      `Rename ${frac(a, small)} as ${frac(a * factor, big)} so both are ${big}ths.`,
      `${frac(a * factor, big)} + ${frac(b, big)} = ${frac(totalNum, big)}.`
    ],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "fractions", "addition", "equivalence"]
  });
}

/* ── fraction as division, and building to the whole ─────── */

/*
  "A fraction can represent a division" — 3 things shared among 4 people is
  3/4 each. Deliberately posed with a numerator smaller than the divisor so
  the answer is a proper fraction rather than a mixed number.
*/
function fractionAsDivisionQuestion() {
  const people = choice([2, 3, 4, 5, 6, 8, 10]);
  const items = randInt(1, people - 1);
  const thing = choice([
    { one: "pizza", many: "pizzas" },
    { one: "cake", many: "cakes" },
    { one: "watermelon", many: "watermelons" },
    { one: "sandwich", many: "sandwiches" },
    { one: "block of chocolate", many: "blocks of chocolate" }
  ]);
  const noun = items === 1 ? thing.one : thing.many;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "fraction-as-division",
    marks: 1,
    prompt: `${items} ${noun} ${items === 1 ? "is" : "are"} shared equally between ${people} people. How much does each person get?`,
    answer: frac(items, people),
    working: [
      `Sharing ${items} between ${people} is ${items} ÷ ${people}.`,
      `Each person gets ${frac(items, people)}.`
    ],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "fractions", "division"]
  });
}

/*
  Build up to the whole from a part — the reverse of finding a fraction of a
  quantity, and the harder direction for most students.
*/
function buildToWholeQuestion() {
  const { n, d, words } = choice(QUANTITY_FRACTIONS);
  const part = randInt(2, 15) * 2;
  const whole = part * d;
  const unit = choice(["", " counters", " marbles", " cards", " stickers"]);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "build-to-whole",
    marks: 2,
    prompt: `One ${words} of a group is ${part}${unit}. How many are in the whole group?`,
    answer: `${whole}${unit}`,
    working: [
      `One ${words} is ${part}, and there are ${d} ${words}s in the whole.`,
      `${part} × ${d} = ${whole}.`
    ],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "fractions", "reverse"]
  });
}

/* ── fractions of quantities (MA3-RQF-02) ────────────────── */

function fractionOfQuantityQuestion() {
  const { n, d, words } = choice(QUANTITY_FRACTIONS);
  // A multiple of the denominator, so the answer is always a whole number.
  const amount = d * randInt(3, 24);
  const result = amount / d;
  const unit = choice(["", " students", " books", " apples", " stickers", " marbles"]);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "fraction-of-quantity",
    marks: 1,
    prompt: `Find ${frac(n, d)} of ${amount}${unit}.`,
    answer: `${result}${unit}`,
    working: [
      `One ${words} means one of ${d} equal parts.`,
      `${amount} ÷ ${d} = ${result}.`
    ],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "fractions", "quantity"]
  });
}

/*
  The same skill on a measurement, which is the other half of MA3-RQF-02
  ("of measures and quantities"). Units are chosen so the answer stays whole.
*/
function fractionOfMeasureQuestion() {
  const { n, d, words } = choice(QUANTITY_FRACTIONS);
  const measures = [
    { whole: d * randInt(4, 25), unit: "cm" },
    { whole: d * randInt(4, 25), unit: "mL" },
    { whole: d * randInt(4, 25), unit: "g" },
    { whole: d * randInt(2, 12), unit: "minutes" }
  ];
  const measure = choice(measures);
  const result = measure.whole / d;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "fraction-of-measure",
    marks: 1,
    prompt: `Find ${frac(n, d)} of ${measure.whole} ${measure.unit}.`,
    answer: `${result} ${measure.unit}`,
    working: [`${measure.whole} ÷ ${d} = ${result} ${measure.unit}.`],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "fractions", "measurement"]
  });
}

/* ── multi-part ──────────────────────────────────────────── */

function multiPartFractionsQuestion() {
  const total = 20 * randInt(2, 6);
  const half = total / 2;
  const quarter = total / 4;
  const tenth = total / 10;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "multi-part-fractions",
    marks: 3,
    prompt: `A box holds ${total} counters.`,
    subparts: [
      {
        label: "(a)",
        prompt: `How many counters are ${frac(1, 2)} of the box?`,
        marks: 1,
        answer: String(half),
        working: [`${total} ÷ 2 = ${half}.`]
      },
      {
        label: "(b)",
        prompt: `How many counters are ${frac(1, 10)} of the box?`,
        marks: 1,
        answer: String(tenth),
        working: [`${total} ÷ 10 = ${tenth}.`]
      },
      {
        label: "(c)",
        prompt: `Ruby takes ${frac(1, 4)} of the box. How many counters are left?`,
        marks: 1,
        answer: String(total - quarter),
        working: [`${total} ÷ 4 = ${quarter}, so ${total} − ${quarter} = ${total - quarter} are left.`]
      }
    ],
    answer: `(a) ${half}; (b) ${tenth}; (c) ${total - quarter}`,
    working: [],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "fractions", "multi-part"]
  });
}

/* ── registry ────────────────────────────────────────────── */

const GENERATORS = {
  "name-fraction-bar": nameFractionBarQuestion,
  "name-fraction-circle": nameFractionCircleQuestion,
  "name-fraction-set": nameFractionSetQuestion,
  "shade-fraction": shadeFractionQuestion,
  "fraction-number-line": fractionNumberLineQuestion,
  "compare-unit-fractions": compareUnitFractionsQuestion,
  "compare-related-fractions": compareRelatedFractionsQuestion,
  "order-fractions": orderFractionsQuestion,
  "equivalent-fractions": equivalentFractionsQuestion,
  "add-same-denominator": addSameDenominatorQuestion,
  "subtract-same-denominator": subtractSameDenominatorQuestion,
  "add-related-denominators": addRelatedDenominatorsQuestion,
  "fraction-as-division": fractionAsDivisionQuestion,
  "build-to-whole": buildToWholeQuestion,
  "fraction-of-quantity": fractionOfQuantityQuestion,
  "fraction-of-measure": fractionOfMeasureQuestion,
  "multi-part-fractions": multiPartFractionsQuestion
};

export function getStage3FractionsQuestionTypes() {
  return TYPE_LIST;
}

export function generateStage3FractionsQuestions({
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
