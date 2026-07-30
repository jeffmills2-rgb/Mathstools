/*
  CHHS Exam Builder — Fractions, Decimals and Percentages Question Bank
  --------------------------------------------------------------------
  Save as:

  question-banks/fdp/index.js

  Blended Stage 4 style bank covering:
  - simplify/equivalent/compare fractions
  - fraction operations and mixed/improper conversions
  - compare/order/round/operate with decimals
  - percentage of quantities, FDP conversions, percentage change, discounts/best buys
*/

import {
  createQuestion,
  QUESTION_KINDS,
  SPACE_SIZES
} from "../../schemas/question.schema.js";

import {
  attachQuestionTranslations
} from "../../utils/translation.js";

const TOPIC = "Fractions, Decimals and Percentages";

const TYPE_LIST = [
  { id: "shaded-fractions", label: "Shaded fractions" },
  { id: "shaded-fraction-circle", label: "Shaded fractions (circle)" },
  { id: "fraction-of-group", label: "Fraction of a set" },
  { id: "place-fraction-number-line", label: "Fractions on a number line" },
  { id: "equivalent-fraction-visual", label: "Equivalent fractions (bars)" },
  { id: "fraction-multiply-area", label: "Multiply fractions (area model)" },
  { id: "fraction-of-quantity", label: "Fraction of a quantity" },
  { id: "simplify-fractions", label: "Simplify fractions" },
  { id: "equivalent-fractions", label: "Equivalent fractions" },
  { id: "compare-fractions", label: "Compare and order fractions" },
  { id: "fraction-operations", label: "Operations with fractions" },
  { id: "mixed-improper", label: "Mixed and improper fractions" },
  { id: "compare-decimals", label: "Compare and order decimals" },
  { id: "round-decimals", label: "Round decimals" },
  { id: "decimal-operations", label: "Operations with decimals" },
  { id: "percentage-of", label: "Percentage of a quantity" },
  { id: "fdp-conversions", label: "Fraction/decimal/percentage conversions" },
  { id: "percentage-change", label: "Percentage increase and decrease" },
  { id: "discounts", label: "Discounts and best buys" },
  { id: "gst-tax", label: "GST calculations (10%)" },
  { id: "find-original-value", label: "Find the original value (reverse percentage)" },
  { id: "decimal-place-value", label: "Decimal place value" },
  { id: "proportion-double-line", label: "Percentage with a double number line" },
  { id: "error-spot-fdp", label: "Spot the error (reasoning)" },
  { id: "true-false-fdp", label: "True or false (reasoning)" },
  { id: "multi-part-percentage", label: "Multi-part percentage problem" }
];

const FRIENDLY_FDP = [
  { n: 1, d: 2, decimal: "0.5", percent: "50%" },
  { n: 1, d: 4, decimal: "0.25", percent: "25%" },
  { n: 3, d: 4, decimal: "0.75", percent: "75%" },
  { n: 1, d: 5, decimal: "0.2", percent: "20%" },
  { n: 2, d: 5, decimal: "0.4", percent: "40%" },
  { n: 3, d: 5, decimal: "0.6", percent: "60%" },
  { n: 4, d: 5, decimal: "0.8", percent: "80%" },
  { n: 1, d: 10, decimal: "0.1", percent: "10%" },
  { n: 3, d: 10, decimal: "0.3", percent: "30%" },
  { n: 7, d: 10, decimal: "0.7", percent: "70%" },
  { n: 1, d: 8, decimal: "0.125", percent: "12.5%" },
  { n: 3, d: 8, decimal: "0.375", percent: "37.5%" },
  { n: 5, d: 8, decimal: "0.625", percent: "62.5%" },
  { n: 7, d: 8, decimal: "0.875", percent: "87.5%" }
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

function randomId(prefix = "fdp") {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.random()}`;
}

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}

function simplify(n, d) {
  const g = gcd(n, d);
  return { n: n / g, d: d / g, g };
}

function frac(n, d) {
  if (d === 1) return String(n);
  return `[[frac:${n}:${d}]]`;
}

function money(n) {
  return `$${Number(n).toFixed(2)}`;
}

function dp(n, places = 2) {
  return Number(n).toFixed(places);
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

function fdpQuestion({ type, marks = 1, prompt, answer, working = [], diagram = null, space = SPACE_SIZES.MEDIUM }) {
  return createQuestion({
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
    tags: ["fractions decimals percentages", type]
  });
}


function shadedFractionsQuestion() {
  const mode = choice(["identify", "simplify", "shade"]);

  if (mode === "shade") {
    const denominator = choice([3, 4, 5, 6, 8, 10, 12]);
    const numerator = randInt(1, denominator - 1);

    return fdpQuestion({
      type: "shaded-fractions",
      marks: 1,
      prompt: `Shade ${frac(numerator, denominator)} on the bar below.`,
      diagram: {
        engine: "fdp-engine",
        config: {
          diagramType: "fraction-bar",
          numerator: 0,
          denominator,
          showLabel: false
        }
      },
      answer: frac(numerator, denominator),
      working: [`Shade ${numerator} out of ${denominator} equal parts.`],
      space: SPACE_SIZES.SMALL
    });
  }

  const denominator = choice(mode === "simplify" ? [4, 6, 8, 10, 12] : [3, 4, 5, 6, 8, 10, 12]);
  let numerator = randInt(1, denominator - 1);

  if (mode === "simplify") {
    const options = [];
    for (let n = 1; n < denominator; n++) {
      if (gcd(n, denominator) > 1) options.push(n);
    }
    numerator = choice(options.length ? options : [numerator]);
  }

  const simple = simplify(numerator, denominator);
  const needsSimplifying = simple.g > 1;

  return fdpQuestion({
    type: "shaded-fractions",
    marks: needsSimplifying ? 2 : 1,
    prompt: needsSimplifying
      ? "What fraction is shaded below? Simplify your answer."
      : "What fraction is shaded in the diagram below?",
    diagram: {
      engine: "fdp-engine",
      config: {
        diagramType: "fraction-bar",
        numerator,
        denominator,
        showLabel: false
      }
    },
    answer: frac(simple.n, simple.d),
    working: needsSimplifying
      ? [`${numerator} out of ${denominator} parts are shaded.`, `${frac(numerator, denominator)} simplifies to ${frac(simple.n, simple.d)}.`]
      : [`${numerator} out of ${denominator} parts are shaded.`, `Fraction shaded = ${frac(numerator, denominator)}.`],
    space: SPACE_SIZES.SMALL
  });
}

function simplifyFractionsQuestion() {
  const baseN = randInt(2, 9);
  const baseD = randInt(baseN + 1, 12);
  const factor = randInt(2, 8);
  const n = baseN * factor;
  const d = baseD * factor;
  const s = simplify(n, d);

  return fdpQuestion({
    type: "simplify-fractions",
    marks: 1,
    prompt: `Simplify: ${frac(n, d)}`,
    answer: frac(s.n, s.d),
    working: [`Divide numerator and denominator by ${s.g}.`, `${frac(n, d)} = ${frac(s.n, s.d)}`],
    space: SPACE_SIZES.SMALL
  });
}

function equivalentFractionsQuestion() {
  const item = choice(FRIENDLY_FDP.filter(x => x.d <= 8));
  const factor = choice([2, 3, 4, 5, 6]);
  const targetD = item.d * factor;
  const answerN = item.n * factor;

  return fdpQuestion({
    type: "equivalent-fractions",
    marks: 1,
    prompt: `Write ${frac(item.n, item.d)} as an equivalent fraction with denominator ${targetD}.`,
    answer: frac(answerN, targetD),
    working: [`${item.d} × ${factor} = ${targetD}`, `${item.n} × ${factor} = ${answerN}`, `${frac(item.n, item.d)} = ${frac(answerN, targetD)}`],
    space: SPACE_SIZES.SMALL
  });
}

function compareFractionsQuestion() {
  const a = choice(FRIENDLY_FDP);
  let b = choice(FRIENDLY_FDP);
  while (a.n / a.d === b.n / b.d) b = choice(FRIENDLY_FDP);
  const symbol = a.n / a.d < b.n / b.d ? "<" : ">";

  return fdpQuestion({
    type: "compare-fractions",
    marks: 1,
    prompt: `Insert < or > to make this true: ${frac(a.n, a.d)} ___ ${frac(b.n, b.d)}`,
    answer: symbol,
    working: [`${frac(a.n, a.d)} = ${a.decimal}`, `${frac(b.n, b.d)} = ${b.decimal}`, `${a.decimal} ${symbol} ${b.decimal}`],
    space: SPACE_SIZES.SMALL
  });
}

function fractionOperationsQuestion() {
  const op = choice(["+", "−", "×"]);
  let a = choice(FRIENDLY_FDP.filter(x => x.n < x.d));
  let b = choice(FRIENDLY_FDP.filter(x => x.n < x.d));

  if (op === "−") {
    while (a.n / a.d <= b.n / b.d) {
      a = choice(FRIENDLY_FDP.filter(x => x.n < x.d));
      b = choice(FRIENDLY_FDP.filter(x => x.n < x.d));
    }
  }

  let n;
  let d;
  let working;

  if (op === "×") {
    n = a.n * b.n;
    d = a.d * b.d;
    const s = simplify(n, d);
    working = [`Multiply the numerators and denominators.`, `${frac(a.n, a.d)} × ${frac(b.n, b.d)} = ${frac(n, d)}`, `Simplify: ${frac(n, d)} = ${frac(s.n, s.d)}`];
    n = s.n;
    d = s.d;
  } else {
    const common = lcm(a.d, b.d);
    const an = a.n * (common / a.d);
    const bn = b.n * (common / b.d);
    n = op === "+" ? an + bn : an - bn;
    d = common;
    const s = simplify(n, d);
    working = [`Use common denominator ${common}.`, `${frac(a.n, a.d)} = ${frac(an, common)} and ${frac(b.n, b.d)} = ${frac(bn, common)}`, `${frac(an, common)} ${op} ${frac(bn, common)} = ${frac(n, d)}`, `Simplify: ${frac(n, d)} = ${frac(s.n, s.d)}`];
    n = s.n;
    d = s.d;
  }

  return fdpQuestion({
    type: "fraction-operations",
    marks: 2,
    prompt: `Calculate and simplify: ${frac(a.n, a.d)} ${op} ${frac(b.n, b.d)}`,
    answer: frac(n, d),
    working,
    space: SPACE_SIZES.MEDIUM
  });
}

function mixedImproperQuestion() {
  const toImproper = Math.random() < 0.5;

  if (toImproper) {
    const whole = randInt(1, 5);
    const d = randInt(3, 10);
    const n = randInt(1, d - 1);
    const answerN = whole * d + n;

    return fdpQuestion({
      type: "mixed-improper",
      marks: 1,
      prompt: `Convert ${whole} ${frac(n, d)} to an improper fraction.`,
      answer: frac(answerN, d),
      working: [`${whole} × ${d} + ${n} = ${answerN}`, `${whole} ${frac(n, d)} = ${frac(answerN, d)}`],
      space: SPACE_SIZES.SMALL
    });
  }

  const d = randInt(3, 10);
  const whole = randInt(1, 5);
  const n = randInt(1, d - 1);
  const improper = whole * d + n;

  return fdpQuestion({
    type: "mixed-improper",
    marks: 1,
    prompt: `Convert ${frac(improper, d)} to a mixed number.`,
    answer: `${whole} ${frac(n, d)}`,
    working: [`${improper} ÷ ${d} = ${whole} remainder ${n}`, `${frac(improper, d)} = ${whole} ${frac(n, d)}`],
    space: SPACE_SIZES.SMALL
  });
}

function compareDecimalsQuestion() {
  const values = shuffle([
    Number((randInt(12, 98) / 100).toFixed(2)),
    Number((randInt(101, 999) / 1000).toFixed(3)),
    Number((randInt(3, 9) / 10).toFixed(1))
  ]);
  const ordered = values.slice().sort((a, b) => a - b).map(v => String(v)).join(", ");

  return fdpQuestion({
    type: "compare-decimals",
    marks: 1,
    prompt: `Order these decimals from smallest to largest: ${values.join(", ")}`,
    answer: ordered,
    working: [`Compare using place value.`, `Smallest to largest: ${ordered}`],
    space: SPACE_SIZES.SMALL
  });
}

function roundDecimalsQuestion() {
  const value = Number((randInt(1001, 9999) / 1000).toFixed(3));
  const places = choice([1, 2]);
  const answer = value.toFixed(places);

  return fdpQuestion({
    type: "round-decimals",
    marks: 1,
    prompt: `Round ${value} to ${places} decimal place${places === 1 ? "" : "s"}.`,
    answer,
    working: [`Look at the next digit after ${places} decimal place${places === 1 ? "" : "s"}.`, `${value} ≈ ${answer}`],
    space: SPACE_SIZES.SMALL
  });
}

function decimalOperationsQuestion() {
  const op = choice(["+", "−", "×", "÷"]);
  let a;
  let b;
  let answer;

  if (op === "+" || op === "−") {
    a = Number((randInt(120, 950) / 10).toFixed(1));
    b = Number((randInt(10, 250) / 10).toFixed(1));
    if (op === "−" && b > a) [a, b] = [b, a];
    answer = op === "+" ? a + b : a - b;
  } else if (op === "×") {
    a = Number((randInt(12, 95) / 10).toFixed(1));
    b = Number((randInt(2, 9) / 10).toFixed(1));
    answer = a * b;
  } else {
    b = Number((randInt(2, 9) / 10).toFixed(1));
    answer = randInt(2, 12);
    a = Number((b * answer).toFixed(1));
  }

  const answerText = dp(answer, Math.abs(answer - Math.round(answer)) < 1e-9 ? 0 : 2).replace(/\.00$/, "");

  return fdpQuestion({
    type: "decimal-operations",
    marks: 1,
    prompt: `Calculate: ${a} ${op} ${b}`,
    answer: answerText,
    working: [`${a} ${op} ${b} = ${answerText}`],
    space: SPACE_SIZES.SMALL
  });
}

function percentageOfQuestion() {
  const percent = choice([5, 10, 12.5, 15, 20, 25, 30, 40, 50, 75]);
  const quantity = choice([40, 60, 80, 120, 160, 200, 240, 320, 400]);
  const answer = quantity * percent / 100;

  return fdpQuestion({
    type: "percentage-of",
    marks: 1,
    prompt: `Find ${percent}% of ${quantity}.`,
    answer: String(answer),
    working: [`${percent}% = ${percent}/100`, `${percent}% of ${quantity} = ${answer}`],
    space: SPACE_SIZES.SMALL
  });
}

function fdpConversionsQuestion() {
  const item = choice(FRIENDLY_FDP);
  const mode = choice(["fraction-to-decimal", "decimal-to-percent", "percent-to-fraction"]);

  if (mode === "fraction-to-decimal") {
    return fdpQuestion({
      type: "fdp-conversions",
      marks: 1,
      prompt: `Convert ${frac(item.n, item.d)} to a decimal.`,
      answer: item.decimal,
      working: [`${item.n} ÷ ${item.d} = ${item.decimal}`],
      space: SPACE_SIZES.SMALL
    });
  }

  if (mode === "decimal-to-percent") {
    return fdpQuestion({
      type: "fdp-conversions",
      marks: 1,
      prompt: `Convert ${item.decimal} to a percentage.`,
      answer: item.percent,
      working: [`${item.decimal} × 100 = ${item.percent}`],
      space: SPACE_SIZES.SMALL
    });
  }

  const s = simplify(item.n, item.d);
  return fdpQuestion({
    type: "fdp-conversions",
    marks: 1,
    prompt: `Convert ${item.percent} to a fraction in simplest form.`,
    answer: frac(s.n, s.d),
    working: [`${item.percent} = ${Number.parseFloat(item.percent)}/100`, `Simplify to ${frac(s.n, s.d)}.`],
    space: SPACE_SIZES.SMALL
  });
}

function percentageChangeQuestion() {
  const percent = choice([5, 10, 12, 15, 20, 25, 30]);
  const original = choice([50, 60, 80, 100, 120, 150, 200, 240]);
  const increase = Math.random() < 0.5;
  const change = original * percent / 100;
  const answer = increase ? original + change : original - change;

  return fdpQuestion({
    type: "percentage-change",
    marks: 2,
    prompt: `${increase ? "Increase" : "Decrease"} ${original} by ${percent}%.`,
    answer: String(answer),
    working: [`${percent}% of ${original} = ${change}`, `${increase ? original + " + " + change : original + " − " + change} = ${answer}`],
    space: SPACE_SIZES.MEDIUM
  });
}


const BEST_BUY_CONTEXTS = [
  {
    noun: "cereal",
    unit: "g",
    quantities: [375, 500, 750, 900],
    base: 100,
    rateLabel: "per 100 g",
    lowCents: 70,
    highCents: 150,
    describe(quantity) {
      return `${quantity} g box of cereal`;
    }
  },
  {
    noun: "milk",
    unit: "mL",
    quantities: [600, 1000, 2000, 3000],
    base: 1000,
    rateLabel: "per litre",
    lowCents: 180,
    highCents: 360,
    describe(quantity) {
      return `${quantity} mL bottle of milk`;
    }
  },
  {
    noun: "juice",
    unit: "mL",
    quantities: [600, 1000, 1250, 2000],
    base: 1000,
    rateLabel: "per litre",
    lowCents: 160,
    highCents: 420,
    describe(quantity) {
      return `${quantity} mL bottle of juice`;
    }
  },
  {
    noun: "rice",
    unit: "kg",
    quantities: [1, 2, 5],
    base: 1,
    rateLabel: "per kg",
    lowCents: 180,
    highCents: 420,
    describe(quantity) {
      return `${quantity} kg bag of rice`;
    }
  },
  {
    noun: "pens",
    unit: "items",
    quantities: [4, 6, 10, 12, 20],
    base: 1,
    rateLabel: "per pen",
    lowCents: 45,
    highCents: 130,
    describe(quantity) {
      return `pack of ${quantity} pens`;
    }
  },
  {
    noun: "printer paper",
    unit: "sheets",
    quantities: [100, 250, 500],
    base: 100,
    rateLabel: "per 100 sheets",
    lowCents: 120,
    highCents: 340,
    describe(quantity) {
      return `${quantity}-sheet pack of printer paper`;
    }
  }
];

function makeBestBuyScenario() {
  const context = choice(BEST_BUY_CONTEXTS);
  const quantities = shuffle(context.quantities).slice(0, 2).sort((a, b) => a - b);
  const quantityA = quantities[0];
  const quantityB = quantities[1];
  const unitPriceCents = randInt(context.lowCents, context.highCents);

  const adjustmentA = randInt(-40, 80);
  const adjustmentB = randInt(-90, 70);

  let priceA = Number(((quantityA / context.base) * unitPriceCents / 100 + adjustmentA / 100).toFixed(2));
  let priceB = Number(((quantityB / context.base) * unitPriceCents / 100 + adjustmentB / 100).toFixed(2));

  priceA = Math.max(0.50, priceA);
  priceB = Math.max(0.50, priceB);

  let rateA = priceA / (quantityA / context.base);
  let rateB = priceB / (quantityB / context.base);

  if (Math.abs(rateA - rateB) < 0.005) {
    priceB = Number((priceB + 0.25).toFixed(2));
    rateB = priceB / (quantityB / context.base);
  }

  const best = rateA < rateB ? "Option A" : "Option B";

  return {
    prompt: [
      "Which is better value?",
      `• Option A: ${context.describe(quantityA)} for ${money(priceA)}`,
      `• Option B: ${context.describe(quantityB)} for ${money(priceB)}`
    ].join("\n"),
    answer: best,
    working: [
      `Option A: ${money(priceA)} ÷ ${quantityA / context.base} = ${money(rateA)} ${context.rateLabel}.`,
      `Option B: ${money(priceB)} ÷ ${quantityB / context.base} = ${money(rateB)} ${context.rateLabel}.`,
      `${best} is better value.`
    ]
  };
}

function discountsQuestion() {
  if (Math.random() < 0.55) {
    const price = choice([40, 60, 80, 100, 120, 160, 200]);
    const percent = choice([10, 15, 20, 25, 30, 40]);
    const discount = price * percent / 100;
    const sale = price - discount;

    return fdpQuestion({
      type: "discounts",
      marks: 2,
      prompt: `A jacket costs ${money(price)}. It is discounted by ${percent}%. Find the sale price.`,
      answer: money(sale),
      working: [`${percent}% of ${money(price)} = ${money(discount)}`, `${money(price)} − ${money(discount)} = ${money(sale)}`],
      space: SPACE_SIZES.MEDIUM
    });
  }

  const made = makeBestBuyScenario();

  return fdpQuestion({
    type: "discounts",
    marks: 2,
    prompt: made.prompt,
    answer: made.answer,
    working: made.working,
    space: SPACE_SIZES.MEDIUM
  });
}

// ── GST calculations (Australian context, 10%) ───────────

function gstTaxQuestion() {
  const items = [
    "a laptop", "a textbook", "a bicycle", "a pair of shoes",
    "a sports bag", "a calculator", "a printer", "a microwave",
    "a set of headphones", "a dining table"
  ];
  const item = choice(items);

  const form = choice(["add-gst", "find-gst", "remove-gst"]);

  if (form === "add-gst") {
    // Given pre-GST price, find price including GST
    const base = choice([20, 30, 40, 50, 60, 80, 100, 120, 150, 200, 250, 300, 400, 500]);
    const gst = base * 0.1;
    const total = base + gst;

    return fdpQuestion({
      type: "gst-tax",
      marks: 2,
      prompt: `The pre-GST price of ${item} is ${money(base)}. GST is 10%. Find the price including GST.`,
      answer: money(total),
      working: [
        `GST = 10% × ${money(base)} = ${money(gst)}`,
        `Price including GST = ${money(base)} + ${money(gst)} = ${money(total)}`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  if (form === "find-gst") {
    // Given total (inc. GST), find the GST amount
    const base = choice([20, 30, 40, 50, 60, 80, 100, 120, 150, 200, 250, 300]);
    const gst = base * 0.1;
    const total = base + gst;

    return fdpQuestion({
      type: "gst-tax",
      marks: 2,
      prompt: `The total price of ${item} (including 10% GST) is ${money(total)}. How much of that is GST?`,
      answer: money(gst),
      working: [
        `GST-inclusive price = 110% of original`,
        `Original = ${money(total)} ÷ 1.1 = ${money(base)}`,
        `GST = ${money(total)} − ${money(base)} = ${money(gst)}`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  // remove-gst: Given GST-inclusive price, find the pre-GST price
  const base = choice([20, 30, 40, 50, 60, 80, 100, 120, 150, 200, 250, 300]);
  const total = base * 1.1;

  return fdpQuestion({
    type: "gst-tax",
    marks: 2,
    prompt: `The price of ${item} including 10% GST is ${money(total)}. What was the pre-GST price?`,
    answer: money(base),
    working: [
      `Pre-GST price = ${money(total)} ÷ 1.1`,
      `= ${money(base)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

// ── Find the original value (reverse percentage) ──────────

function findOriginalValueQuestion() {
  const items = [
    "a jacket", "a phone", "a TV", "a pair of jeans",
    "a watch", "a camera", "a pair of sneakers", "a backpack"
  ];
  const item = choice(items);

  const form = choice(["discount", "increase"]);
  const percent = choice([10, 15, 20, 25, 30, 40, 50]);

  if (form === "discount") {
    // Sale price is given — find original
    const original = choice([40, 60, 80, 100, 120, 160, 200, 250, 300]);
    const saleFactor = (100 - percent) / 100;
    const salePrice = original * saleFactor;

    return fdpQuestion({
      type: "find-original-value",
      marks: 2,
      prompt: `${item[0].toUpperCase() + item.slice(1)} is on sale for ${money(salePrice)} after a ${percent}% discount. What was the original price?`,
      answer: money(original),
      working: [
        `Sale price = (100 − ${percent})% of original = ${100 - percent}% of original`,
        `Original = ${money(salePrice)} ÷ ${saleFactor}`,
        `= ${money(original)}`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  // increase: final price after % increase — find original
  const original = choice([40, 60, 80, 100, 120, 150, 200]);
  const factor = (100 + percent) / 100;
  const finalPrice = original * factor;

  return fdpQuestion({
    type: "find-original-value",
    marks: 2,
    prompt: `After a ${percent}% price increase, ${item} costs ${money(finalPrice)}. What was the original price?`,
    answer: money(original),
    working: [
      `Final price = ${100 + percent}% of original`,
      `Original = ${money(finalPrice)} ÷ ${factor}`,
      `= ${money(original)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

// ── New visual + reasoning generators ────────────────────

function shadedFractionCircleQuestion() {
  const denominator = choice([3, 4, 5, 6, 8]);
  const numerator = randInt(1, denominator - 1);
  const simple = simplify(numerator, denominator);
  const needs = simple.g > 1;

  return fdpQuestion({
    type: "shaded-fraction-circle",
    marks: needs ? 2 : 1,
    prompt: needs
      ? "What fraction of the circle is shaded? Give your answer in simplest form."
      : "What fraction of the circle is shaded?",
    diagram: {
      engine: "fdp-engine",
      config: { diagramType: "fraction-circle", numerator, denominator, showLabel: false }
    },
    answer: frac(simple.n, simple.d),
    working: needs
      ? [`${numerator} of ${denominator} parts are shaded.`, `${frac(numerator, denominator)} = ${frac(simple.n, simple.d)}.`]
      : [`${numerator} of ${denominator} equal parts are shaded.`, `Fraction shaded = ${frac(numerator, denominator)}.`],
    space: SPACE_SIZES.SMALL
  });
}

function fractionOfGroupQuestion() {
  const denominator = choice([2, 3, 4, 5, 6]);
  const per = choice([2, 3, 4]);
  const total = denominator * per;
  const n = randInt(1, denominator - 1);
  const shaded = n * per;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "fraction-of-group",
    marks: 1,
    prompt: `What fraction of the counters is shaded? Give your answer in simplest form.`,
    diagram: {
      engine: "fdp-engine",
      config: { diagramType: "fraction-of-set", total, shaded, cols: Math.min(total, 6), showLabel: false }
    },
    answer: frac(n, denominator),
    working: [
      `${shaded} out of ${total} counters are shaded.`,
      `${frac(shaded, total)} = ${frac(n, denominator)}.`
    ],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["fractions decimals percentages", "fraction-of-group", "diagram"]
  });
}

function placeFractionNumberLineQuestion() {
  const denominator = choice([2, 3, 4, 5, 6, 8]);
  const wholes = choice([1, 1, 2]);
  const mark = randInt(1, denominator * wholes - 1);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "place-fraction-number-line",
    marks: 1,
    prompt: `Mark ${frac(mark, denominator)} on the number line below.`,
    diagram: {
      engine: "fdp-engine",
      config: { diagramType: "number-line-fraction", denominator, wholes, markNumerator: mark, showMark: false }
    },
    answer: frac(mark, denominator),
    working: [`Each interval is ${frac(1, denominator)}. Count ${mark} intervals from 0.`],
    space: SPACE_SIZES.NONE,
    mcEligible: false,
    tags: ["fractions decimals percentages", "number line", "diagram"]
  });
}

function equivalentFractionVisualQuestion() {
  const base = choice([{ n: 1, d: 2 }, { n: 1, d: 3 }, { n: 2, d: 3 }, { n: 1, d: 4 }, { n: 3, d: 4 }, { n: 2, d: 5 }]);
  const k = choice([2, 3]);
  const eq = { n: base.n * k, d: base.d * k };

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "equivalent-fraction-visual",
    marks: 1,
    prompt: `The bars show two equivalent fractions. Complete: ${frac(base.n, base.d)} = □/${eq.d}`,
    diagram: {
      engine: "fdp-engine",
      config: { diagramType: "equivalent-bars", fracs: [base, eq], showLabel: false }
    },
    answer: frac(eq.n, eq.d),
    working: [`Multiply numerator and denominator by ${k}: ${frac(base.n, base.d)} = ${frac(eq.n, eq.d)}.`],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["fractions decimals percentages", "equivalent fractions", "diagram"]
  });
}

function fractionMultiplyAreaQuestion() {
  const d1 = choice([2, 3, 4]);
  const n1 = randInt(1, d1 - 1);
  const d2 = choice([3, 4, 5]);
  const n2 = randInt(1, d2 - 1);
  const prodN = n1 * n2, prodD = d1 * d2;
  const simple = simplify(prodN, prodD);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "fraction-multiply-area",
    marks: 2,
    prompt: `Use the area model to find ${frac(n1, d1)} × ${frac(n2, d2)}. Give your answer in simplest form.`,
    diagram: {
      engine: "fdp-engine",
      caption: "The darker overlap shows the product.",
      config: { diagramType: "fraction-multiply-area", n1, d1, n2, d2 }
    },
    answer: frac(simple.n, simple.d),
    working: [
      `${frac(n1, d1)} × ${frac(n2, d2)} = ${frac(prodN, prodD)}`,
      simple.g > 1 ? `${frac(prodN, prodD)} = ${frac(simple.n, simple.d)}.` : `Already in simplest form.`
    ],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["fractions decimals percentages", "multiply fractions", "diagram"]
  });
}

function fractionOfQuantityQuestion() {
  const d = choice([2, 3, 4, 5, 6, 8, 10]);
  const n = randInt(1, d - 1);
  const per = randInt(3, 20);
  const quantity = d * per;
  const result = n * per;
  const unit = choice(["", "", " students", " mL", " cm", " kg"]);

  return fdpQuestion({
    type: "fraction-of-quantity",
    marks: 2,
    prompt: `Find ${frac(n, d)} of ${quantity}${unit}.`,
    answer: `${result}${unit}`,
    working: [
      `${quantity} ÷ ${d} = ${per}`,
      `${per} × ${n} = ${result}${unit}`
    ],
    space: SPACE_SIZES.SMALL
  });
}

function decimalPlaceValueQuestion() {
  const whole = randInt(1, 9);
  const places = choice([2, 3]);
  let dec = "";
  for (let i = 0; i < places; i++) dec += String(randInt(0, 9));
  const idx = randInt(0, places - 1);
  const digit = Number(dec[idx]);
  const placeVal = Math.pow(10, -(idx + 1));
  const value = digit * placeVal;
  const placeNames = ["tenths", "hundredths", "thousandths"];
  const number = `${whole}.${dec}`;

  const headers = ["Ones", "•"].concat(placeNames.slice(0, places).map(s => s.replace(/^\w/, c => c.toUpperCase())));
  const digitsRow = [String(whole), "•"].concat(dec.split(""));

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "decimal-place-value",
    marks: 1,
    prompt: `In the decimal ${number}, what is the value of the digit ${digit} in the ${placeNames[idx]} column?`,
    table: { headerRow: true, caption: "Place value table", rows: [headers, digitsRow] },
    answer: dp(value, places),
    working: [`The digit ${digit} is in the ${placeNames[idx]} place.`, `Value = ${digit} × ${dp(placeVal, places)} = ${dp(value, places)}.`],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["fractions decimals percentages", "decimal", "place value"]
  });
}

function proportionDoubleLineQuestion() {
  const percent = choice([10, 20, 25, 50, 75, 30, 40, 60]);
  const base = choice([20, 40, 60, 80, 100, 120, 200]);
  const result = base * percent / 100;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "proportion-double-line",
    marks: 2,
    prompt: `Use the double number line to find ${percent}% of ${base}.`,
    diagram: {
      engine: "fdp-engine",
      caption: "Percentages line up with amounts.",
      config: { diagramType: "double-number-line", topLabel: "%", bottomLabel: "amount", topMax: 100, bottomMax: base, ticks: 4 }
    },
    answer: String(result),
    working: [
      `100% = ${base}, so 1% = ${dp(base / 100, 2)}.`,
      `${percent}% = ${percent} × ${dp(base / 100, 2)} = ${result}.`
    ],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["fractions decimals percentages", "percentage", "proportion", "diagram"]
  });
}

function errorSpotFdpQuestion() {
  const scenarios = [
    () => {
      // adding fractions wrongly
      const a = choice([[1, 2], [1, 3], [1, 4], [2, 3]]);
      const b = choice([[1, 3], [1, 4], [1, 6], [1, 2]]);
      const wrongN = a[0] + b[0], wrongD = a[1] + b[1];
      const L = lcm(a[1], b[1]);
      const corrN = a[0] * (L / a[1]) + b[0] * (L / b[1]);
      const simple = simplify(corrN, L);
      return {
        wrong: `${frac(a[0], a[1])} + ${frac(b[0], b[1])} = ${frac(wrongN, wrongD)}`,
        issue: "you cannot add numerators and denominators; use a common denominator",
        correct: frac(simple.n, simple.d)
      };
    },
    () => {
      // percentage of: 10% wrong
      const base = choice([40, 60, 80, 120, 200]);
      const correct = base * 0.1;
      return {
        wrong: `10% of ${base} = ${base * 10}`,
        issue: "10% means divide by 10, not multiply",
        correct: String(correct)
      };
    }
  ];
  const s = choice(scenarios)();
  const isFrac = s.correct.includes("[[frac");
  let distractors;
  if (isFrac) {
    distractors = [s.correct, "[[frac:1:2]]", "[[frac:2:5]]", "[[frac:3:4]]"];
  } else {
    const c = Number(s.correct);
    distractors = [s.correct, String(c * 10), String(c / 2), String(c + 5)];
  }
  const seen = new Set();
  const choices = shuffle(distractors.filter(d => (seen.has(d) ? false : seen.add(d)))).slice(0, 4);
  if (!choices.includes(s.correct)) choices[0] = s.correct;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "error-spot-fdp",
    kind: QUESTION_KINDS.MULTIPLE_CHOICE,
    marks: 1,
    prompt: `A student wrote:  ${s.wrong}\nThis is incorrect. What is the correct answer?`,
    choices: shuffle(choices),
    answer: s.correct,
    working: [`The error: ${s.issue}.`, `Correct answer = ${s.correct}.`],
    space: SPACE_SIZES.NONE,
    tags: ["fractions decimals percentages", "reasoning", "error analysis"]
  });
}

function trueFalseFdpQuestion() {
  const items = [
    () => { const f = choice(FRIENDLY_FDP); return { stmt: `${frac(f.n, f.d)} = ${f.decimal}`, val: true, reason: `${frac(f.n, f.d)} = ${f.decimal}.` }; },
    () => { const f = choice(FRIENDLY_FDP); return { stmt: `${frac(f.n, f.d)} = ${f.percent}`, val: true, reason: `${frac(f.n, f.d)} = ${f.percent}.` }; },
    () => { const a = dp(randInt(10, 89) / 100, 2); const b = dp(randInt(10, 89) / 100, 2); return { stmt: `${a} > ${b}`, val: Number(a) > Number(b), reason: `Compare place by place: ${a} ${Number(a) > Number(b) ? ">" : "≤"} ${b}.` }; },
    () => { return { stmt: `0.5 > 0.45`, val: true, reason: `0.50 > 0.45.` }; },
    () => { return { stmt: `[[frac:2:5]] > [[frac:1:2]]`, val: false, reason: `2/5 = 0.4 and 1/2 = 0.5, so 2/5 < 1/2.` }; }
  ];
  const it = choice(items)();

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "true-false-fdp",
    marks: 1,
    prompt: `True or false? ${it.stmt}  (Give a reason.)`,
    answer: it.val ? "True" : "False",
    working: [it.reason],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["fractions decimals percentages", "reasoning", "true false"]
  });
}

function multiPartPercentageQuestion() {
  const price = choice([40, 50, 60, 80, 120, 150, 200]);
  const pct = choice([10, 15, 20, 25, 30]);
  const discount = price * pct / 100;
  const sale = price - discount;
  const gst = sale * 0.1;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "multi-part-percentage",
    marks: 3,
    prompt: `A jacket is priced at ${money(price)}. It is on sale with ${pct}% off.`,
    subparts: [
      { label: "(a)", prompt: `How much is the discount?`, marks: 1, answer: money(discount), working: [`${pct}% of ${money(price)} = ${money(discount)}.`] },
      { label: "(b)", prompt: `What is the sale price?`, marks: 1, answer: money(sale), working: [`${money(price)} − ${money(discount)} = ${money(sale)}.`] },
      { label: "(c)", prompt: `GST of 10% is then added to the sale price. What is the final price?`, marks: 1, answer: money(sale + gst), working: [`10% of ${money(sale)} = ${money(gst)}.`, `${money(sale)} + ${money(gst)} = ${money(sale + gst)}.`] }
    ],
    answer: `(a) ${money(discount)}; (b) ${money(sale)}; (c) ${money(sale + gst)}`,
    working: [],
    space: SPACE_SIZES.NONE,
    mcEligible: false,
    tags: ["fractions decimals percentages", "multi-part", "real-world", "percent"]
  });
}

const GENERATORS = {
  "shaded-fractions": shadedFractionsQuestion,
  "shaded-fraction-circle": shadedFractionCircleQuestion,
  "fraction-of-group": fractionOfGroupQuestion,
  "place-fraction-number-line": placeFractionNumberLineQuestion,
  "equivalent-fraction-visual": equivalentFractionVisualQuestion,
  "fraction-multiply-area": fractionMultiplyAreaQuestion,
  "fraction-of-quantity": fractionOfQuantityQuestion,
  "simplify-fractions": simplifyFractionsQuestion,
  "equivalent-fractions": equivalentFractionsQuestion,
  "compare-fractions": compareFractionsQuestion,
  "fraction-operations": fractionOperationsQuestion,
  "mixed-improper": mixedImproperQuestion,
  "compare-decimals": compareDecimalsQuestion,
  "round-decimals": roundDecimalsQuestion,
  "decimal-operations": decimalOperationsQuestion,
  "percentage-of": percentageOfQuestion,
  "fdp-conversions": fdpConversionsQuestion,
  "percentage-change": percentageChangeQuestion,
  "discounts": discountsQuestion,
  "gst-tax": gstTaxQuestion,
  "find-original-value": findOriginalValueQuestion,
  "decimal-place-value": decimalPlaceValueQuestion,
  "proportion-double-line": proportionDoubleLineQuestion,
  "error-spot-fdp": errorSpotFdpQuestion,
  "true-false-fdp": trueFalseFdpQuestion,
  "multi-part-percentage": multiPartPercentageQuestion
};

export function getFdpQuestionTypes() {
  return TYPE_LIST.slice();
}

export function generateFdpQuestions({ count = 8, allowedTypes = null } = {}) {
  const typeIds = Array.isArray(allowedTypes) && allowedTypes.length
    ? allowedTypes.filter(id => GENERATORS[id])
    : TYPE_LIST.map(t => t.id);

  const plan = makeBalancedPlan(typeIds, count);
  return plan.map(type => GENERATORS[type]()).map(attachQuestionTranslations);
}
