/*
  CHHS Exam Builder — Integers Question Bank
  ------------------------------------------
  Save as:

  question-banks/integers/index.js

  This bank intentionally removes Basic/Expected separation.
  It blends friendly D/E-style items with C-expected items.
*/

import {
  createQuestion,
  QUESTION_KINDS,
  SPACE_SIZES
} from "../../schemas/question.schema.js";

const TOPIC = "Integers";

const TYPE_LIST = [
  { id: "place-number-line", label: "Place an integer on a number line" },
  { id: "number-line-jump", label: "Add/subtract on a number line" },
  { id: "integer-calculations", label: "Integer calculations" },
  { id: "division-remainder", label: "Division with remainders" },
  { id: "rounding", label: "Rounding whole numbers" },
  { id: "estimation", label: "Estimating by rounding" },
  { id: "place-value", label: "Place value of digits" },
  { id: "compare-integers", label: "Compare integers" },
  { id: "ordering-integers", label: "Ordering integers" },
  { id: "combining-signs", label: "Combining signs" },
  { id: "order-of-operations", label: "Order of operations" },
  { id: "substitution-negatives", label: "Substitution with negatives" },
  { id: "thermometer-read", label: "Temperature (thermometer)" },
  { id: "real-world-integers", label: "Real-world integer problems" },
  { id: "true-false-integers", label: "True or false (reasoning)" },
  { id: "error-spot", label: "Spot the error" },
  { id: "multi-part-integers", label: "Multi-part integer problem" }
];

const STEPS = [1, 2, 3, 4, 5, 10];

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

function randomId(prefix = "integer") {
  return crypto.randomUUID ? crypto.randomUUID() : `${prefix}-${Date.now()}-${Math.random()}`;
}

function fmt(n) {
  return n < 0 ? `−${Math.abs(n)}` : String(n);
}

function paren(n) {
  return n < 0 ? `(${fmt(n)})` : String(n);
}

function compareSymbol(a, b) {
  if (a < b) return "<";
  if (a > b) return ">";
  return "=";
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

/* -----------------------------
   Question generators
----------------------------- */

function placeNumberLineQuestion() {
  const useExpectedScale = Math.random() < 0.55;
  const step = useExpectedScale ? choice([2, 3, 4, 5, 10]) : 1;
  const max = step * 10;
  const min = -max;

  const possible = [];
  for (let v = min + step; v <= max - step; v += step) {
    if (v !== 0) possible.push(v);
  }

  const answer = choice(possible);

  const labels = step === 1
    ? [min, 0, max]
    : shuffle(possible.filter(v => Math.abs(v - answer) > step * 2)).slice(0, 2).concat([min, 0, max]);

  const sortedLabels = [...new Set(labels)].sort((a, b) => a - b);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "place-number-line",
    marks: 1,
    prompt: `Place ${fmt(answer)} on the number line.`,
    diagram: {
      engine: "integer-engine",
      config: {
        diagramType: "number-line",
        min,
        max,
        step,
        labels: sortedLabels,
        answer,
        showAnswer: false
      }
    },
    answer: fmt(answer),
    working: [`Locate ${fmt(answer)} using the scale on the number line.`],
    space: SPACE_SIZES.NONE,
    mcEligible: false,
    tags: ["integers", "number line", "diagram task", "no multiple choice"]
  });
}

function integerCalculationQuestion() {
  const op = choice(["+", "−", "×", "÷"]);
  let a, b, answer, prompt;

  if (op === "+" || op === "−") {
    a = randInt(-50, 50);
    b = randInt(1, 50);
    answer = op === "+" ? a + b : a - b;
    prompt = `Calculate: ${fmt(a)} ${op} ${fmt(b)}`;
  }

  if (op === "×") {
    a = randInt(-12, 12);
    b = randInt(-12, 12);
    if (a === 0 && b === 0) b = 3;
    answer = a * b;
    prompt = `Calculate: ${paren(a)} × ${paren(b)}`;
  }

  if (op === "÷") {
    b = choice([-12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    answer = choice([-12, -10, -8, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 8, 10, 12]);
    a = b * answer;
    prompt = `Calculate: ${paren(a)} ÷ ${paren(b)}`;
  }

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "integer-calculations",
    marks: 1,
    prompt,
    answer: fmt(answer),
    working: [`${prompt.replace("Calculate: ", "")} = ${fmt(answer)}`],
    space: SPACE_SIZES.SMALL,
    tags: ["integers", "operations"]
  });
}

function compareIntegersQuestion() {
  const expressionMode = Math.random() < 0.55;

  if (!expressionMode) {
    const a = randInt(-50, 50);
    const b = randInt(-50, 50);
    const answer = compareSymbol(a, b);

    return createQuestion({
      id: randomId(),
      topic: TOPIC,
      level: "mixed",
      type: "compare-integers",
      marks: 1,
      prompt: `Insert <, > or = to make the statement true: ${fmt(a)} ___ ${fmt(b)}`,
      answer,
      working: [`${fmt(a)} ${answer} ${fmt(b)}`],
      space: SPACE_SIZES.NONE,
      tags: ["integers", "comparison"]
    });
  }

  const a = randInt(-30, 30);
  const b = randInt(-30, 30);
  const c = randInt(-50, 50);
  const op = choice(["+", "−"]);
  const exprValue = op === "+" ? a + b : a - b;
  const swap = Math.random() < 0.5;

  const leftText = swap ? fmt(c) : `${fmt(a)} ${op} ${paren(b)}`;
  const rightText = swap ? `${fmt(a)} ${op} ${paren(b)}` : fmt(c);
  const leftValue = swap ? c : exprValue;
  const rightValue = swap ? exprValue : c;
  const answer = compareSymbol(leftValue, rightValue);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "compare-integers",
    marks: 1,
    prompt: `Insert <, > or = to make the statement true: ${leftText} ___ ${rightText}`,
    answer,
    working: [
      `${leftText} = ${fmt(leftValue)}`,
      `${rightText} = ${fmt(rightValue)}`,
      `${fmt(leftValue)} ${answer} ${fmt(rightValue)}`
    ],
    space: SPACE_SIZES.NONE,
    tags: ["integers", "comparison", "expressions"]
  });
}

function orderingIntegersQuestion() {
  const direction = Math.random() < 0.5 ? "ascending" : "descending";
  const values = new Set();

  while (values.size < 5) {
    values.add(randInt(-100, 50));
  }

  const shown = shuffle([...values]);
  const answer = shown.slice().sort((a, b) => direction === "ascending" ? a - b : b - a);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "ordering-integers",
    marks: 1,
    prompt: `Place these integers in ${direction} order: ${shown.map(fmt).join(", ")}`,
    answer: answer.map(fmt).join(", "),
    working: [`${direction[0].toUpperCase() + direction.slice(1)} order: ${answer.map(fmt).join(", ")}`],
    space: SPACE_SIZES.SMALL,
    tags: ["integers", "ordering"]
  });
}

function combiningSignsQuestion() {
  const forms = [
    { aSign: 1, op: "+", bSign: 1 },
    { aSign: 1, op: "+", bSign: -1 },
    { aSign: 1, op: "−", bSign: 1 },
    { aSign: 1, op: "−", bSign: -1 },
    { aSign: -1, op: "+", bSign: 1 },
    { aSign: -1, op: "+", bSign: -1 },
    { aSign: -1, op: "−", bSign: 1 },
    { aSign: -1, op: "−", bSign: -1 }
  ];

  const form = choice(forms);
  const a = form.aSign * randInt(1, 50);
  const b = form.bSign * randInt(1, 50);
  const answer = form.op === "+" ? a + b : a - b;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "combining-signs",
    marks: 1,
    prompt: `Calculate: ${paren(a)} ${form.op} ${paren(b)}`,
    answer: fmt(answer),
    working: [`${paren(a)} ${form.op} ${paren(b)} = ${fmt(answer)}`],
    space: SPACE_SIZES.SMALL,
    tags: ["integers", "combining signs"]
  });
}

function orderOfOperationsQuestion() {
  const forms = [
    () => {
      const a = randInt(-20, 20);
      const b = choice([-12, -10, -8, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 8, 10, 12]);
      const c = choice([-12, -10, -8, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 8, 10, 12]);
      return {
        expr: `${fmt(a)} + ${paren(b)} × ${paren(c)}`,
        answer: a + b * c,
        working: [
          `Calculate multiplication first: ${paren(b)} × ${paren(c)} = ${fmt(b * c)}`,
          `${fmt(a)} + ${fmt(b * c)} = ${fmt(a + b * c)}`
        ]
      };
    },
    () => {
      const a = choice([-12, -10, -8, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 8, 10, 12]);
      const b = randInt(-12, 12);
      const c = randInt(-12, 12);
      return {
        expr: `${paren(a)} × (${fmt(b)} + ${paren(c)})`,
        answer: a * (b + c),
        working: [
          `Calculate brackets first: ${fmt(b)} + ${paren(c)} = ${fmt(b + c)}`,
          `${paren(a)} × ${paren(b + c)} = ${fmt(a * (b + c))}`
        ]
      };
    },
    () => {
      const divisor = choice([-8, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 8]);
      const quotient = choice([-10, -8, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 8, 10]);
      const dividend = divisor * quotient;
      const c = randInt(-20, 20);
      return {
        expr: `${paren(dividend)} ÷ ${paren(divisor)} − ${paren(c)}`,
        answer: quotient - c,
        working: [
          `Calculate division first: ${paren(dividend)} ÷ ${paren(divisor)} = ${fmt(quotient)}`,
          `${fmt(quotient)} − ${paren(c)} = ${fmt(quotient - c)}`
        ]
      };
    }
  ];

  let made = choice(forms)();

  // Avoid very large answers.
  let guard = 0;
  while (Math.abs(made.answer) > 150 && guard < 30) {
    made = choice(forms)();
    guard += 1;
  }

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "order-of-operations",
    marks: 2,
    prompt: `Use order of operations to calculate: ${made.expr}`,
    answer: fmt(made.answer),
    working: made.working,
    space: SPACE_SIZES.MEDIUM,
    tags: ["integers", "order of operations"]
  });
}

// ── Real-world integer word problems ─────────────────────

function realWorldIntegersQuestion() {
  const scenarios = [
    // Temperature
    () => {
      const start = randInt(-15, 10);
      const change = randInt(1, 20);
      const direction = Math.random() < 0.5 ? "rises" : "drops";
      const end = direction === "rises" ? start + change : start - change;
      const op = direction === "rises" ? "+" : "−";
      return {
        prompt: `The temperature is ${fmt(start)}°C. It ${direction} by ${change}°C. What is the new temperature?`,
        answer: fmt(end),
        working: [
          `${fmt(start)} ${op} ${change} = ${fmt(end)}`,
          `The new temperature is ${fmt(end)}°C.`
        ],
        tags: ["integers", "real-world", "temperature"]
      };
    },
    // Altitude / depth
    () => {
      const depth = randInt(10, 400) * 10;
      const rise = randInt(1, Math.floor(depth / 10)) * 10;
      const start = -depth;
      const end = start + rise;
      return {
        prompt: `A submarine is ${depth} m below sea level (${fmt(start)} m). It rises ${rise} m. What is its new depth?`,
        answer: `${fmt(end)} m`,
        working: [
          `${fmt(start)} + ${rise} = ${fmt(end)}`,
          `The submarine is now at ${fmt(end)} m.`
        ],
        tags: ["integers", "real-world", "altitude"]
      };
    },
    // Bank balance
    () => {
      const overdraft = randInt(1, 12) * 10;
      const deposit = randInt(overdraft + 10, overdraft + 200);
      const start = -overdraft;
      const end = start + deposit;
      return {
        prompt: `A bank account has an overdraft of $${overdraft} (balance: ${fmt(start)}). A deposit of $${deposit} is made. What is the new balance?`,
        answer: `$${fmt(end)}`,
        working: [
          `${fmt(start)} + ${deposit} = ${fmt(end)}`,
          `The new balance is $${fmt(end)}.`
        ],
        tags: ["integers", "real-world", "money"]
      };
    },
    // Score / points
    () => {
      const start = randInt(-20, 5);
      const earn = randInt(5, 30);
      const penalty = randInt(1, earn - 1);
      const end = start + earn - penalty;
      return {
        prompt: `A team starts with ${fmt(start)} points. They earn ${earn} points then lose ${penalty} points. What is their final score?`,
        answer: fmt(end),
        working: [
          `${fmt(start)} + ${earn} − ${penalty}`,
          `= ${fmt(start + earn)} − ${penalty}`,
          `= ${fmt(end)}`
        ],
        tags: ["integers", "real-world", "score"]
      };
    },
    // Floors in a building
    () => {
      const underground = randInt(1, 4);
      const floors = randInt(5, 20);
      const startFloor = -randInt(1, underground);
      const change = randInt(5, underground + floors);
      const endFloor = startFloor + change;
      return {
        prompt: `A lift starts on floor ${fmt(startFloor)} (basement). It goes up ${change} floors. Which floor does it stop on?`,
        answer: `Floor ${fmt(endFloor)}`,
        working: [
          `${fmt(startFloor)} + ${change} = ${fmt(endFloor)}`,
          `The lift stops on floor ${fmt(endFloor)}.`
        ],
        tags: ["integers", "real-world", "floors"]
      };
    },
    // Two-step: time zones
    () => {
      const utc = randInt(-8, 8);
      const local = randInt(-8, 8);
      const diff = local - utc;
      const utcHour = randInt(8, 20);
      let localHour = utcHour + diff;
      const nextDay = localHour >= 24;
      const prevDay = localHour < 0;
      if (nextDay) localHour -= 24;
      if (prevDay) localHour += 24;
      const dayNote = nextDay ? " (next day)" : prevDay ? " (previous day)" : "";
      const sign = diff >= 0 ? "+" : "−";
      const absDiff = Math.abs(diff);
      return {
        prompt: `A city is UTC ${diff >= 0 ? "+" : ""}${diff}. If the UTC time is ${utcHour}:00, what is the local time?`,
        answer: `${localHour}:00${dayNote}`,
        working: [
          `${utcHour} ${sign} ${absDiff} = ${utcHour + diff}`,
          `Local time is ${localHour}:00${dayNote}.`
        ],
        tags: ["integers", "real-world", "time zones"]
      };
    }
  ];

  const made = choice(scenarios)();

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "real-world-integers",
    marks: 2,
    prompt: made.prompt,
    answer: made.answer,
    working: made.working,
    space: SPACE_SIZES.MEDIUM,
    tags: made.tags
  });
}

// ── Add/subtract modelled on a number line ───────────────

function numberLineJumpQuestion() {
  const min = -10, max = 10;
  let start = randInt(-7, 7);
  const jumpCount = choice([1, 1, 2]);
  const jumps = [];
  let current = start;

  for (let i = 0; i < jumpCount; i++) {
    const options = [];
    for (let by = -9; by <= 9; by++) {
      if (by === 0) continue;
      if (current + by >= min && current + by <= max) options.push(by);
    }
    if (!options.length) break;
    const by = choice(options);
    jumps.push({ by });
    current += by;
  }

  const end = current;
  const exprParts = [fmt(start)];
  jumps.forEach(j => exprParts.push(`${j.by >= 0 ? "+" : "−"} ${Math.abs(j.by)}`));
  const expr = exprParts.join(" ");

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "number-line-jump",
    marks: jumpCount === 2 ? 2 : 1,
    prompt: `Use the number line to work out ${expr}.`,
    diagram: {
      engine: "integer-engine",
      caption: "Each arrow shows one jump.",
      config: {
        diagramType: "number-line-jumps",
        min, max, step: 1,
        start,
        jumps,
        labels: [min, -5, 0, 5, max],
        showEnd: false
      }
    },
    answer: fmt(end),
    working: [
      `Start at ${fmt(start)}.`,
      ...jumps.map((j, i) => {
        const after = start + jumps.slice(0, i + 1).reduce((s, x) => s + x.by, 0);
        return `${j.by >= 0 ? "Move right" : "Move left"} ${Math.abs(j.by)} → ${fmt(after)}.`;
      }),
      `${expr} = ${fmt(end)}`
    ],
    space: SPACE_SIZES.NONE,
    mcEligible: false,
    tags: ["integers", "number line", "addition", "subtraction", "diagram task"]
  });
}

// ── Division with remainders (1G) ────────────────────────

function divisionRemainderQuestion() {
  const divisor = randInt(3, 12);
  const quotient = randInt(11, 40);
  const remainder = randInt(1, divisor - 1);
  const dividend = divisor * quotient + remainder;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "division-remainder",
    marks: 2,
    prompt: `Calculate ${dividend} ÷ ${divisor}, giving your answer as a whole number and a remainder.`,
    answer: `${quotient} remainder ${remainder}`,
    working: [
      `${divisor} × ${quotient} = ${divisor * quotient}`,
      `${dividend} − ${divisor * quotient} = ${remainder}`,
      `${dividend} ÷ ${divisor} = ${quotient} remainder ${remainder}`
    ],
    space: SPACE_SIZES.MEDIUM,
    tags: ["integers", "division", "remainder"]
  });
}

// ── Rounding (1H) ────────────────────────────────────────

function roundingQuestion() {
  const place = choice([10, 100, 1000]);
  const placeName = { 10: "ten", 100: "hundred", 1000: "thousand" }[place];
  const n = place === 10 ? randInt(15, 995) : place === 100 ? randInt(150, 9950) : randInt(1500, 98500);
  const rounded = Math.round(n / place) * place;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "rounding",
    marks: 1,
    prompt: `Round ${n} to the nearest ${placeName}.`,
    answer: String(rounded),
    working: [
      `Look at the digit after the ${placeName}s place.`,
      `${n} rounds to ${rounded}.`
    ],
    space: SPACE_SIZES.SMALL,
    tags: ["integers", "rounding"]
  });
}

// ── Estimation by rounding to the leading digit (1H) ─────

function estimationQuestion() {
  const op = choice(["×", "+"]);

  function lead(n) {
    const mag = Math.pow(10, String(n).length - 1);
    return Math.round(n / mag) * mag;
  }

  if (op === "×") {
    const a = randInt(18, 89);
    const b = randInt(21, 79);
    const est = lead(a) * lead(b);
    return createQuestion({
      id: randomId(),
      topic: TOPIC,
      level: "mixed",
      type: "estimation",
      marks: 1,
      prompt: `Estimate ${a} × ${b} by first rounding each number to its leading digit.`,
      answer: `≈ ${est}`,
      working: [
        `${a} ≈ ${lead(a)} and ${b} ≈ ${lead(b)}`,
        `${lead(a)} × ${lead(b)} = ${est}`,
        `(Exact answer: ${a * b}.)`
      ],
      space: SPACE_SIZES.SMALL,
      tags: ["integers", "estimation", "rounding"]
    });
  }

  const a = randInt(180, 890);
  const b = randInt(210, 790);
  const c = randInt(150, 640);
  const est = lead(a) + lead(b) + lead(c);
  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "estimation",
    marks: 1,
    prompt: `Estimate ${a} + ${b} + ${c} by first rounding each number to its leading digit.`,
    answer: `≈ ${est}`,
    working: [
      `${a} ≈ ${lead(a)}, ${b} ≈ ${lead(b)}, ${c} ≈ ${lead(c)}`,
      `${lead(a)} + ${lead(b)} + ${lead(c)} = ${est}`,
      `(Exact answer: ${a + b + c}.)`
    ],
    space: SPACE_SIZES.SMALL,
    tags: ["integers", "estimation", "rounding"]
  });
}

// ── Place value of a digit (1B) ──────────────────────────

function placeValueQuestion() {
  const digits = randInt(4, 6);
  let n = "";
  n += String(randInt(1, 9));
  for (let i = 1; i < digits; i++) n += String(randInt(0, 9));
  const num = Number(n);
  const idx = randInt(0, digits - 1);
  const digit = Number(n[idx]);
  const place = Math.pow(10, digits - 1 - idx);
  const value = digit * place;
  const placeNames = { 1: "ones", 10: "tens", 100: "hundreds", 1000: "thousands", 10000: "ten thousands", 100000: "hundred thousands" };

  const headerNames = [];
  for (let i = 0; i < digits; i++) {
    const p = Math.pow(10, digits - 1 - i);
    headerNames.push(placeNames[p] || String(p));
  }

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "place-value",
    marks: 1,
    prompt: `In the number ${num}, what is the value of the digit ${digit} (shown in the ${placeNames[place]} column)?`,
    table: {
      headerRow: true,
      caption: "Place value table",
      rows: [
        headerNames.map(s => s.replace(/^\w/, c => c.toUpperCase())),
        n.split("")
      ]
    },
    answer: String(value),
    working: [`The digit ${digit} is in the ${placeNames[place]} column.`, `Value = ${digit} × ${place} = ${value}.`],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["integers", "place value"]
  });
}

// ── Substitution with negatives (6F) ─────────────────────

function substitutionNegativesQuestion() {
  const a = randInt(-6, 6) || -2;
  const b = randInt(-6, 6) || 3;
  const forms = [
    { expr: "2a − b", val: 2 * a - b, show: `2(${paren(a)}) − (${paren(b)})` },
    { expr: "a + 3b", val: a + 3 * b, show: `(${paren(a)}) + 3(${paren(b)})` },
    { expr: "ab", val: a * b, show: `(${paren(a)}) × (${paren(b)})` },
    { expr: "ab − 4", val: a * b - 4, show: `(${paren(a)}) × (${paren(b)}) − 4` },
    { expr: "a² + b", val: a * a + b, show: `(${paren(a)})² + (${paren(b)})` }
  ];
  const f = choice(forms);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "substitution-negatives",
    marks: 2,
    prompt: `If a = ${fmt(a)} and b = ${fmt(b)}, evaluate ${f.expr}.`,
    answer: fmt(f.val),
    working: [
      `Substitute a = ${fmt(a)}, b = ${fmt(b)}:`,
      `${f.show}`,
      `= ${fmt(f.val)}`
    ],
    space: SPACE_SIZES.MEDIUM,
    tags: ["integers", "substitution", "negatives"]
  });
}

// ── Temperature with a thermometer diagram ───────────────

function thermometerReadQuestion() {
  const start = randInt(-15, 25);
  const change = randInt(3, 22);
  const dir = Math.random() < 0.5 ? "rises" : "falls";
  const end = dir === "rises" ? start + change : start - change;
  const op = dir === "rises" ? "+" : "−";

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "thermometer-read",
    marks: 2,
    prompt: `The thermometer shows the temperature at dawn. By midday it ${dir} by ${change}°C. What is the temperature at midday?`,
    diagram: {
      engine: "integer-engine",
      caption: "Temperature at dawn.",
      config: {
        diagramType: "thermometer",
        min: -20, max: 40, step: 10,
        value: start, unit: "°C", showValue: true
      }
    },
    answer: `${fmt(end)}°C`,
    working: [
      `Dawn temperature = ${fmt(start)}°C.`,
      `${fmt(start)} ${op} ${change} = ${fmt(end)}`,
      `Midday temperature = ${fmt(end)}°C.`
    ],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["integers", "temperature", "real-world", "diagram"]
  });
}

// ── True / false reasoning ───────────────────────────────

function trueFalseIntegersQuestion() {
  const a = randInt(-9, 9) || -4;
  const b = randInt(-9, 9) || 5;
  const op = choice(["×", "+", "−"]);
  const correct = op === "×" ? a * b : op === "+" ? a + b : a - b;
  const isTrue = Math.random() < 0.5;
  const shown = isTrue ? correct : correct + choice([-2 * Math.sign(correct) - 1, 2, -3, 4]);
  const exprText = `${paren(a)} ${op} ${paren(b)} = ${fmt(shown)}`;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "true-false-integers",
    marks: 1,
    prompt: `True or false? ${exprText}  (Give the correct value if it is false.)`,
    answer: isTrue ? "True" : `False (${paren(a)} ${op} ${paren(b)} = ${fmt(correct)})`,
    working: [
      `${paren(a)} ${op} ${paren(b)} = ${fmt(correct)}`,
      isTrue ? `The statement is true.` : `The statement is false; the correct value is ${fmt(correct)}.`
    ],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["integers", "reasoning", "true false"]
  });
}

// ── Spot the error (multiple choice) ─────────────────────

function errorSpotQuestion() {
  const scenarios = [
    () => {
      const a = randInt(2, 9), b = randInt(2, 9);
      return {
        wrongLine: `${fmt(-a)} − (${fmt(-b)}) = ${fmt(-a - b)}`,
        issue: `subtracting a negative should add`,
        correct: -a + b
      };
    },
    () => {
      const a = randInt(2, 9), b = randInt(2, 9);
      return {
        wrongLine: `(${fmt(-a)}) × (${fmt(-b)}) = ${fmt(-(a * b))}`,
        issue: `a negative times a negative is positive`,
        correct: a * b
      };
    },
    () => {
      const a = randInt(2, 9), b = randInt(2, 9);
      return {
        wrongLine: `${fmt(-a)} + ${b} = ${fmt(-a - b)}`,
        issue: `adding a positive moves right`,
        correct: -a + b
      };
    }
  ];
  const s = choice(scenarios)();
  const distractors = shuffle([s.correct, -s.correct, s.correct + choice([1, 2]), s.correct - choice([1, 2])])
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .slice(0, 4);
  if (!distractors.includes(s.correct)) distractors[0] = s.correct;
  const choices = shuffle(distractors).map(fmt);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "error-spot",
    kind: QUESTION_KINDS.MULTIPLE_CHOICE,
    marks: 1,
    prompt: `A student wrote:  ${s.wrongLine}\nThis is incorrect. What is the correct answer?`,
    choices,
    answer: fmt(s.correct),
    working: [
      `The error: ${s.issue}.`,
      `Correct answer = ${fmt(s.correct)}.`
    ],
    space: SPACE_SIZES.NONE,
    tags: ["integers", "reasoning", "error analysis"]
  });
}

// ── Multi-part structured problem ────────────────────────

function multiPartIntegersQuestion() {
  const scenarios = [
    () => {
      const mon = randInt(-8, -1);
      const drop = randInt(2, 6);
      const tue = mon - drop;
      const rise = randInt(5, 12);
      const wed = tue + rise;
      return {
        prompt: `Over three days the minimum temperature in a town was recorded.`,
        subparts: [
          {
            label: "(a)",
            prompt: `Monday's minimum was ${fmt(mon)}°C. On Tuesday it was ${drop}°C colder. What was Tuesday's minimum?`,
            marks: 1,
            answer: `${fmt(tue)}°C`,
            working: [`${fmt(mon)} − ${drop} = ${fmt(tue)}`]
          },
          {
            label: "(b)",
            prompt: `On Wednesday it was ${rise}°C warmer than Tuesday. What was Wednesday's minimum?`,
            marks: 1,
            answer: `${fmt(wed)}°C`,
            working: [`${fmt(tue)} + ${rise} = ${fmt(wed)}`]
          },
          {
            label: "(c)",
            prompt: `By how many degrees did the minimum temperature change from Monday to Wednesday?`,
            marks: 1,
            answer: `${fmt(wed - mon)}°C`,
            working: [`${fmt(wed)} − (${fmt(mon)}) = ${fmt(wed - mon)}`]
          }
        ]
      };
    },
    () => {
      const depth = randInt(40, 120);
      const up = randInt(15, depth - 10);
      const after1 = -depth + up;
      const down = randInt(10, 40);
      const after2 = after1 - down;
      return {
        prompt: `A diver starts at the surface (0 m).`,
        subparts: [
          {
            label: "(a)",
            prompt: `The diver descends to ${depth} m below the surface. Write this depth as an integer.`,
            marks: 1,
            answer: `${fmt(-depth)} m`,
            working: [`Below the surface is negative: ${fmt(-depth)} m.`]
          },
          {
            label: "(b)",
            prompt: `The diver rises ${up} m. What is the new depth?`,
            marks: 1,
            answer: `${fmt(after1)} m`,
            working: [`${fmt(-depth)} + ${up} = ${fmt(after1)} m`]
          },
          {
            label: "(c)",
            prompt: `The diver then descends ${down} m. What is the final depth?`,
            marks: 1,
            answer: `${fmt(after2)} m`,
            working: [`${fmt(after1)} − ${down} = ${fmt(after2)} m`]
          }
        ]
      };
    }
  ];

  const made = choice(scenarios)();
  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "multi-part-integers",
    marks: made.subparts.reduce((s, p) => s + (p.marks || 1), 0),
    prompt: made.prompt,
    subparts: made.subparts,
    answer: made.subparts.map(p => `${p.label} ${p.answer}`).join("; "),
    working: [],
    space: SPACE_SIZES.NONE,
    mcEligible: false,
    tags: ["integers", "multi-part", "real-world"]
  });
}

const GENERATORS = {
  "place-number-line": placeNumberLineQuestion,
  "number-line-jump": numberLineJumpQuestion,
  "integer-calculations": integerCalculationQuestion,
  "division-remainder": divisionRemainderQuestion,
  "rounding": roundingQuestion,
  "estimation": estimationQuestion,
  "place-value": placeValueQuestion,
  "compare-integers": compareIntegersQuestion,
  "ordering-integers": orderingIntegersQuestion,
  "combining-signs": combiningSignsQuestion,
  "order-of-operations": orderOfOperationsQuestion,
  "substitution-negatives": substitutionNegativesQuestion,
  "thermometer-read": thermometerReadQuestion,
  "real-world-integers": realWorldIntegersQuestion,
  "true-false-integers": trueFalseIntegersQuestion,
  "error-spot": errorSpotQuestion,
  "multi-part-integers": multiPartIntegersQuestion
};

export function getIntegerQuestionTypes() {
  return TYPE_LIST;
}

export function generateIntegerQuestions({
  count = 8,
  allowedTypes = null
} = {}) {
  const typeIds = allowedTypes?.length ? allowedTypes : TYPE_LIST.map(t => t.id);
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

  return questions;
}
