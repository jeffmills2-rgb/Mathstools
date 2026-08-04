/*
  Mills Maths Tools — Stage 3 Question Bank: Represents Numbers
  -------------------------------------------------------------
  question-banks/stage-3/represents-numbers/index.js

  NSW Mathematics K–10 (2022), Stage 3, focus areas "Represents numbers A"
  and "Represents numbers B", merged into one topic. Outcomes:

    MA3-RN-01  applies an understanding of place value and the role of zero
               to represent the properties of numbers
    MA3-RN-02  compares and orders decimals up to 3 decimal places
    MA3-RN-03  determines percentages of quantities, and finds equivalent
               fractions and decimals for benchmark percentage values

  Content mapping is in docs/stage-3-syllabus-reference.md. Prompts here are
  original; the syllabus supplies the content points, not the wording.

  Calibration notes for Years 5–6, settled on this first Stage 3 bank:
  - Whole numbers reach the millions, and the billion boundary appears only
    as a naming/regrouping fact, never as arithmetic.
  - Decimals stop at 3 places (MA3-RN-02).
  - Percentages are restricted to the benchmark set 10%, 25%, 50% (MA3-RN-03),
    plus 75% where it falls out of a quarter.
  - Quantities are chosen so every answer is exact — no rounding of money.
  - One mark for a single step, two for anything needing working, so the
    difficulty ramp and the worksheet answer spaces both behave.
*/

import {
  createQuestion,
  QUESTION_KINDS,
  SPACE_SIZES
} from "../../../schemas/question.schema.js";

import {
  attachQuestionTranslations
} from "../../../utils/translation.js";

const TOPIC = "Represents Numbers";

const TYPE_LIST = [
  { id: "read-millions", label: "Read and write numbers in the millions" },
  { id: "order-millions", label: "Order numbers in the millions" },
  { id: "round-large", label: "Round to a given place value" },
  { id: "place-value-large", label: "Place value of a digit" },
  { id: "regroup-thousands", label: "Regroup thousands, millions and billions" },
  { id: "partition-nonstandard", label: "Partition numbers in non-standard forms" },
  { id: "decimal-place-value", label: "Place value in decimals" },
  { id: "compare-decimals", label: "Compare two decimals" },
  { id: "order-decimals", label: "Order decimals" },
  { id: "decimal-number-line", label: "Decimals on a number line" },
  { id: "integer-number-line", label: "Integers on a number line" },
  { id: "benchmark-equivalents", label: "Benchmark fractions, decimals and percentages" },
  { id: "percent-of-quantity", label: "Percentages of quantities" },
  { id: "percentage-discount", label: "Percentage discounts" },
  { id: "multi-part-number", label: "Multi-part number problem" }
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

function randomId(prefix = "s3rn") {
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

/* Spaced thousands, matching how the renderer formats large numbers. */
function spaced(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/* Typographic minus, not a hyphen — every other bank renders negatives this
   way and a hyphen reads as a dash beside a number. */
function fmtInteger(n) {
  return n < 0 ? `\u2212${Math.abs(n)}` : String(n);
}

function money(n) {
  return `$${Number(n).toFixed(2)}`;
}

const ONES = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen",
  "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

function wordsUnderThousand(n) {
  if (n === 0) return "";
  const parts = [];
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;

  if (hundreds) parts.push(`${ONES[hundreds]} hundred`);
  if (rest) {
    if (parts.length) parts.push("and");
    if (rest < 20) parts.push(ONES[rest]);
    else {
      const tens = Math.floor(rest / 10);
      const ones = rest % 10;
      parts.push(ones ? `${TENS[tens]}-${ONES[ones]}` : TENS[tens]);
    }
  }
  return parts.join(" ");
}

/*
  Number words to the millions. Stage 3 names millions using the place value
  grouping of ones, tens and hundreds, so the groups are spelled out in full
  rather than abbreviated.
*/
function numberInWords(n) {
  if (n === 0) return "zero";

  const groups = [
    { value: 1e6, name: "million" },
    { value: 1e3, name: "thousand" },
    { value: 1, name: "" }
  ];

  const parts = [];
  let remaining = n;

  for (const { value, name } of groups) {
    const count = Math.floor(remaining / value);
    remaining %= value;
    if (!count) continue;
    parts.push(name ? `${wordsUnderThousand(count)} ${name}` : wordsUnderThousand(count));
  }

  return parts.join(" ").replace(/\s+/g, " ").trim();
}

/*
  A number in the millions with no trailing zero run, so the words are worth
  writing. maxMillions caps the digit count: the place-value question draws a
  column per digit, and a table wider than about seven columns cannot fit a
  textbook column with its headings legible.
*/
function millionsNumber(maxMillions = 99) {
  const millions = randInt(1, maxMillions);
  const thousands = randInt(1, 999);
  const ones = randInt(1, 999);
  return millions * 1e6 + thousands * 1e3 + ones;
}

const PLACE_NAMES = [
  { value: 1, name: "ones" },
  { value: 10, name: "tens" },
  { value: 100, name: "hundreds" },
  { value: 1000, name: "thousands" },
  { value: 10000, name: "ten thousands" },
  { value: 100000, name: "hundred thousands" },
  { value: 1000000, name: "millions" }
];

const DECIMAL_PLACE_NAMES = [
  { value: 0.1, name: "tenths" },
  { value: 0.01, name: "hundredths" },
  { value: 0.001, name: "thousandths" }
];

/* ── A: whole numbers ────────────────────────────────────── */

function readMillionsQuestion() {
  const n = millionsNumber();
  const toWords = Math.random() < 0.5;

  if (toWords) {
    return createQuestion({
      id: randomId(),
      topic: TOPIC,
      level: "mixed",
      type: "read-millions",
      marks: 1,
      prompt: `Write ${spaced(n)} in words.`,
      answer: numberInWords(n),
      working: [
        `Group the digits in threes from the right: ${spaced(n)}.`,
        `Name each group: ${numberInWords(n)}.`
      ],
      space: SPACE_SIZES.SMALL,
      mcEligible: false,
      tags: ["stage3", "place value", "millions"]
    });
  }

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "read-millions",
    marks: 1,
    prompt: `Write this number as a numeral: ${numberInWords(n)}.`,
    answer: spaced(n),
    working: [`Each named group becomes three digits: ${spaced(n)}.`],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "place value", "millions"]
  });
}

function orderMillionsQuestion() {
  const direction = Math.random() < 0.5 ? "ascending" : "descending";
  const values = new Set();

  // Keep the values close enough that place value has to be used to separate
  // them, rather than the answer being obvious from digit count alone.
  const base = randInt(2, 8) * 1e6;
  while (values.size < 5) {
    values.add(base + randInt(0, 999) * 1e3 + randInt(0, 999));
  }

  const shown = shuffle([...values]);
  const answer = shown.slice().sort((a, b) => direction === "ascending" ? a - b : b - a);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "order-millions",
    marks: 1,
    prompt: `Write these numbers in ${direction} order: ${shown.map(spaced).join(", ")}`,
    answer: answer.map(spaced).join(", "),
    working: [
      "All five numbers have the same number of digits, so compare from the left.",
      `${direction[0].toUpperCase() + direction.slice(1)} order: ${answer.map(spaced).join(", ")}.`
    ],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "ordering", "millions"]
  });
}

function roundLargeQuestion() {
  const place = choice(PLACE_NAMES.slice(2, 6));
  const n = randInt(place.value * 3, place.value * 90) + randInt(1, place.value - 1);
  const rounded = Math.round(n / place.value) * place.value;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "round-large",
    marks: 1,
    prompt: `Round ${spaced(n)} to the nearest ${place.name.replace(/s$/, "")}.`,
    answer: spaced(rounded),
    working: [
      `Look at the digit to the right of the ${place.name} column.`,
      `${spaced(n)} rounds to ${spaced(rounded)}.`
    ],
    space: SPACE_SIZES.SMALL,
    tags: ["stage3", "rounding"]
  });
}

function placeValueLargeQuestion() {
  // Seven digits at most — one place-value column per digit, and PLACE_NAMES
  // tops out at millions.
  const n = millionsNumber(9);
  const digits = String(n).split("");
  const index = randInt(0, digits.length - 1);
  const digit = digits[index];
  const place = PLACE_NAMES[digits.length - 1 - index];
  const value = Number(digit) * place.value;

  const headers = digits
    .map((_, i) => PLACE_NAMES[digits.length - 1 - i].name)
    .map(name => name.replace(/^\w/, c => c.toUpperCase()));

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "place-value-large",
    marks: 1,
    prompt: `In the number ${spaced(n)}, what is the value of the digit ${digit} in the ${place.name} column?`,
    table: {
      headerRow: true,
      caption: "Place value table",
      rows: [headers, digits]
    },
    answer: spaced(value),
    working: [
      `The digit ${digit} sits in the ${place.name} column.`,
      `Value = ${digit} × ${spaced(place.value)} = ${spaced(value)}.`
    ],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "place value"]
  });
}

function regroupThousandsQuestion() {
  // Fixed forms repeat verbatim once a paper asks for more than a handful, so
  // the unit pair is generated rather than picked from a short list.
  const units = [
    { value: 10, name: "tens" },
    { value: 100, name: "hundreds" },
    { value: 1000, name: "thousands" },
    { value: 10000, name: "ten thousands" },
    { value: 100000, name: "hundred thousands" },
    { value: 1000000, name: "millions" },
    { value: 1000000000, name: "billions" }
  ];

  const smallIndex = randInt(0, units.length - 2);
  const bigIndex = randInt(smallIndex + 1, Math.min(units.length - 1, smallIndex + 3));
  const small = units[smallIndex];
  const big = units[bigIndex];
  const count = big.value / small.value;
  const bigName = big.name.replace(/s$/, "");

  const form = {
    prompt: `How many ${small.name} are there in 1 ${bigName}?`,
    answer: spaced(count),
    note: `${spaced(count)} ${small.name} = 1 ${bigName}.`
  };

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "regroup-thousands",
    marks: 1,
    prompt: form.prompt,
    answer: form.answer,
    working: [form.note],
    space: SPACE_SIZES.SMALL,
    tags: ["stage3", "place value", "regrouping"]
  });
}

function partitionNonStandardQuestion() {
  const unit = choice([
    { value: 100, name: "hundreds" },
    { value: 1000, name: "thousands" },
    { value: 10000, name: "ten thousands" }
  ]);
  const count = randInt(12, 400);
  const n = count * unit.value;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "partition-nonstandard",
    marks: 1,
    prompt: `How many ${unit.name} are there in ${spaced(n)}?`,
    answer: spaced(count),
    working: [
      `${spaced(n)} ÷ ${spaced(unit.value)} = ${spaced(count)}.`,
      `So ${spaced(n)} is ${spaced(count)} ${unit.name}.`
    ],
    space: SPACE_SIZES.SMALL,
    tags: ["stage3", "place value", "partitioning"]
  });
}

/* ── A: decimals ─────────────────────────────────────────── */

function decimalWithPlaces(places) {
  const whole = randInt(0, 40);
  let value = whole;
  const digits = [];

  for (let i = 0; i < places; i++) {
    // Avoid a trailing zero, which would make the stated place ambiguous.
    const d = i === places - 1 ? randInt(1, 9) : randInt(0, 9);
    digits.push(d);
    value += d / Math.pow(10, i + 1);
  }

  return { text: `${whole}.${digits.join("")}`, digits, whole };
}

function decimalPlaceValueQuestion() {
  const places = randInt(2, 3);
  const { text, digits } = decimalWithPlaces(places);
  const index = randInt(0, places - 1);
  const digit = digits[index];
  const place = DECIMAL_PLACE_NAMES[index];

  const headers = ["Ones", "•", ...DECIMAL_PLACE_NAMES.slice(0, places)
    .map(p => p.name.replace(/^\w/, c => c.toUpperCase()))];
  const row = [text.split(".")[0], "•", ...digits.map(String)];

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "decimal-place-value",
    marks: 1,
    prompt: `In the decimal ${text}, which column is the digit ${digit} in?`,
    table: { headerRow: true, caption: "Place value table", rows: [headers, row] },
    answer: place.name,
    working: [`Counting right from the decimal point: ${place.name}.`],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "decimals", "place value"]
  });
}

function compareDecimalsQuestion() {
  // A shared whole-number part forces a genuine comparison of the decimal
  // places rather than a glance at the units digit.
  const whole = randInt(0, 12);
  const a = `${whole}.${randInt(0, 9)}${randInt(0, 9)}${randInt(1, 9)}`;
  const b = `${whole}.${randInt(0, 9)}${randInt(0, 9)}${randInt(1, 9)}`;

  if (a === b) return compareDecimalsQuestion();

  const symbol = Number(a) > Number(b) ? ">" : "<";

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "compare-decimals",
    marks: 1,
    prompt: `Insert < or > to make the statement true: ${a} ___ ${b}`,
    answer: `${a} ${symbol} ${b}`,
    working: [
      "The whole numbers match, so compare the tenths, then the hundredths.",
      `${a} ${symbol} ${b}.`
    ],
    space: SPACE_SIZES.NONE,
    tags: ["stage3", "decimals", "comparing"]
  });
}

function orderDecimalsQuestion() {
  const direction = Math.random() < 0.5 ? "smallest to largest" : "largest to smallest";
  const whole = randInt(0, 6);
  const values = new Set();

  // Mixed decimal lengths, so "longer means larger" fails as a strategy.
  while (values.size < 4) {
    const places = randInt(1, 3);
    let text = `${whole}.`;
    for (let i = 0; i < places; i++) {
      text += i === places - 1 ? randInt(1, 9) : randInt(0, 9);
    }
    values.add(text);
  }

  const shown = shuffle([...values]);
  const sorted = shown.slice().sort((x, y) =>
    direction === "smallest to largest" ? Number(x) - Number(y) : Number(y) - Number(x));

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "order-decimals",
    marks: 1,
    prompt: `Write these decimals in order from ${direction}: ${shown.join(", ")}`,
    answer: sorted.join(", "),
    working: [
      "Line up the decimal points and compare one column at a time.",
      `In order: ${sorted.join(", ")}.`
    ],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "decimals", "ordering"]
  });
}

function decimalNumberLineQuestion() {
  const whole = randInt(0, 8);
  const tenths = randInt(1, 9);
  const value = Number(`${whole}.${tenths}`);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "decimal-number-line",
    marks: 1,
    prompt: `Mark ${value} on the number line below.`,
    diagram: {
      engine: "fdp-engine",
      config: {
        diagramType: "decimal-number-line",
        min: whole,
        max: whole + 1,
        tickCount: 10,
        showPoint: false
      }
    },
    answer: `${value}, ${tenths} tenths along from ${whole}`,
    working: [
      `The line is divided into 10 equal parts, so each part is one tenth.`,
      `Count ${tenths} parts on from ${whole}.`
    ],
    space: SPACE_SIZES.NONE,
    mcEligible: false,
    tags: ["stage3", "decimals", "number line", "diagram"]
  });
}

/* ── B: integers on a number line ────────────────────────── */

function integerNumberLineQuestion() {
  const span = choice([10, 20, 50]);
  const value = randInt(-span + 1, span - 1);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "integer-number-line",
    marks: 1,
    prompt: `Place ${fmtInteger(value)} on the number line below.`,
    diagram: {
      engine: "integer-engine",
      config: {
        diagramType: "number-line",
        min: -span,
        max: span,
        step: span / 10,
        labels: [-span, 0, span],
        showAnswer: false
      }
    },
    answer: fmtInteger(value),
    working: [
      `${fmtInteger(value)} is ${Math.abs(value)} ${value < 0 ? "to the left of" : "to the right of"} zero.`
    ],
    space: SPACE_SIZES.NONE,
    mcEligible: false,
    tags: ["stage3", "integers", "number line", "diagram"]
  });
}

/* ── B: benchmark fractions, decimals and percentages ────── */

const BENCHMARKS = [
  { fraction: "[[frac:1:2]]", decimal: "0.5", percent: "50%", words: "one half" },
  { fraction: "[[frac:1:4]]", decimal: "0.25", percent: "25%", words: "one quarter" },
  { fraction: "[[frac:3:4]]", decimal: "0.75", percent: "75%", words: "three quarters" },
  { fraction: "[[frac:1:10]]", decimal: "0.1", percent: "10%", words: "one tenth" },
  { fraction: "[[frac:1:5]]", decimal: "0.2", percent: "20%", words: "one fifth" },
  { fraction: "[[frac:1:1]]", decimal: "1.0", percent: "100%", words: "one whole" }
];

function benchmarkEquivalentsQuestion() {
  const b = choice(BENCHMARKS.slice(0, 5));
  const form = choice(["fraction-to-percent", "percent-to-fraction", "decimal-to-percent"]);

  if (form === "fraction-to-percent") {
    return createQuestion({
      id: randomId(),
      topic: TOPIC,
      level: "mixed",
      type: "benchmark-equivalents",
      marks: 1,
      prompt: `Write ${b.fraction} as a percentage.`,
      answer: b.percent,
      working: [`${b.words} is ${b.percent}.`],
      space: SPACE_SIZES.SMALL,
      tags: ["stage3", "percentages", "equivalence"]
    });
  }

  if (form === "percent-to-fraction") {
    return createQuestion({
      id: randomId(),
      topic: TOPIC,
      level: "mixed",
      type: "benchmark-equivalents",
      marks: 1,
      prompt: `Write ${b.percent} as a fraction in its simplest form.`,
      answer: b.fraction,
      working: [`${b.percent} means ${b.percent.replace("%", "")} out of 100, which simplifies to ${b.words}.`],
      space: SPACE_SIZES.SMALL,
      mcEligible: false,
      tags: ["stage3", "percentages", "equivalence"]
    });
  }

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "benchmark-equivalents",
    marks: 1,
    prompt: `Write ${b.decimal} as a percentage.`,
    answer: b.percent,
    working: [`${b.decimal} is ${b.words}, which is ${b.percent}.`],
    space: SPACE_SIZES.SMALL,
    tags: ["stage3", "percentages", "equivalence"]
  });
}

/* Quantities are multiples of 20 so 10%, 25% and 50% are all whole numbers. */
function percentOfQuantityQuestion() {
  const percent = choice([10, 25, 50]);
  const amount = randInt(2, 30) * 20;
  const result = amount * percent / 100;
  const unit = choice(["", " mL", " g", " m", " students", " marbles"]);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "percent-of-quantity",
    marks: 1,
    prompt: `Find ${percent}% of ${spaced(amount)}${unit}.`,
    answer: `${spaced(result)}${unit}`,
    working: [
      percent === 50 ? "50% is one half, so halve the amount."
        : percent === 25 ? "25% is one quarter, so halve it and halve again."
        : "10% is one tenth, so divide by 10.",
      `${percent}% of ${spaced(amount)} = ${spaced(result)}.`
    ],
    space: SPACE_SIZES.SMALL,
    tags: ["stage3", "percentages"]
  });
}

function percentageDiscountQuestion() {
  const percent = choice([10, 25, 50]);
  const price = randInt(2, 30) * 20;
  const discount = price * percent / 100;
  const item = choice(["scooter", "backpack", "pair of runners", "bike helmet", "tent", "skateboard"]);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "percentage-discount",
    marks: 2,
    prompt: `A ${item} costs ${money(price)}. It is reduced by ${percent}%. What is the new price?`,
    answer: money(price - discount),
    working: [
      `${percent}% of ${money(price)} = ${money(discount)}.`,
      `${money(price)} − ${money(discount)} = ${money(price - discount)}.`
    ],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "percentages", "money"]
  });
}

/* ── multi-part ──────────────────────────────────────────── */

function multiPartNumberQuestion() {
  const price = randInt(4, 30) * 20;
  const half = price / 2;
  const quarter = price / 4;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "multi-part-number",
    kind: QUESTION_KINDS.SHORT_RESPONSE,
    marks: 3,
    prompt: `A shop is having a sale. Everything starts at ${money(price)}.`,
    subparts: [
      {
        label: "(a)",
        prompt: "What is 50% of the starting price?",
        marks: 1,
        answer: money(half),
        working: [`50% is one half: ${money(price)} ÷ 2 = ${money(half)}.`]
      },
      {
        label: "(b)",
        prompt: "What is 25% of the starting price?",
        marks: 1,
        answer: money(quarter),
        working: [`25% is one quarter: ${money(price)} ÷ 4 = ${money(quarter)}.`]
      },
      {
        label: "(c)",
        prompt: "Which is the bigger saving, 25% off or $20 off? Explain your answer.",
        marks: 1,
        answer: quarter > 20 ? "25% off" : quarter < 20 ? "$20 off" : "They are the same",
        working: [`25% off saves ${money(quarter)}, compared with $20.00.`]
      }
    ],
    // A summary answer for the key, matching how the Stage 4 multi-part
    // questions present themselves. The parts carry the working.
    answer: `(a) ${money(half)}; (b) ${money(quarter)}; (c) ${quarter > 20 ? "25% off" : quarter < 20 ? "$20 off" : "They are the same"}`,
    working: [],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "percentages", "multi-part"]
  });
}

/* ── registry ────────────────────────────────────────────── */

const GENERATORS = {
  "read-millions": readMillionsQuestion,
  "order-millions": orderMillionsQuestion,
  "round-large": roundLargeQuestion,
  "place-value-large": placeValueLargeQuestion,
  "regroup-thousands": regroupThousandsQuestion,
  "partition-nonstandard": partitionNonStandardQuestion,
  "decimal-place-value": decimalPlaceValueQuestion,
  "compare-decimals": compareDecimalsQuestion,
  "order-decimals": orderDecimalsQuestion,
  "decimal-number-line": decimalNumberLineQuestion,
  "integer-number-line": integerNumberLineQuestion,
  "benchmark-equivalents": benchmarkEquivalentsQuestion,
  "percent-of-quantity": percentOfQuantityQuestion,
  "percentage-discount": percentageDiscountQuestion,
  "multi-part-number": multiPartNumberQuestion
};

export function getRepresentsNumbersQuestionTypes() {
  return TYPE_LIST;
}

export function generateRepresentsNumbersQuestions({
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
