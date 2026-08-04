/*
  Mills Maths Tools — Stage 3 Question Bank: Additive Relations
  -------------------------------------------------------------
  question-banks/stage-3/additive-relations/index.js

  NSW Mathematics K–10 (2022), Stage 3, focus areas "Additive relations A"
  and "Additive relations B", merged into one topic. Outcome:

    MA3-AR-01  selects and applies appropriate strategies to solve addition
               and subtraction problems

  Content mapping is in docs/stage-3-syllabus-reference.md. Prompts are
  original; the syllabus supplies the content points, not the wording.

  The distinctive thing about this outcome is that it is about STRATEGY, not
  just answers. "Selects and applies appropriate strategies" is the verb, and
  the content names the strategies explicitly — levelling, addition for
  subtraction, constant difference, bridging — alongside estimation to judge
  reasonableness and knowing when a calculator is the efficient choice. A bank
  of bare sums would miss the outcome entirely, so roughly half the types here
  ask which strategy fits, or whether an answer is reasonable, rather than
  asking for the total.

  Calibration follows docs/stage-3-syllabus-reference.md: whole numbers to the
  millions, decimals to 3 places, one mark for a single step and two where
  working is expected.
*/

import {
  createQuestion,
  SPACE_SIZES
} from "../../../schemas/question.schema.js";

import {
  attachQuestionTranslations
} from "../../../utils/translation.js";

const TOPIC = "Additive Relations";

const TYPE_LIST = [
  { id: "add-multidigit", label: "Add multi-digit numbers" },
  { id: "subtract-multidigit", label: "Subtract multi-digit numbers" },
  { id: "add-three-numbers", label: "Add three or more numbers" },
  { id: "missing-addend", label: "Find the missing number" },
  { id: "add-decimals", label: "Add decimals" },
  { id: "subtract-decimals", label: "Subtract decimals" },
  { id: "money-totals", label: "Money totals and change" },
  { id: "estimate-sum", label: "Estimate to check reasonableness" },
  { id: "is-it-reasonable", label: "Is the answer reasonable?" },
  { id: "choose-strategy", label: "Choose an efficient strategy" },
  { id: "constant-difference", label: "Constant difference" },
  { id: "bridging", label: "Bridging to a friendly number" },
  { id: "word-problem", label: "Word problems" },
  { id: "multistep-word", label: "Multi-step word problems" },
  { id: "calculator-or-not", label: "Calculator or mental strategy?" },

  // Open number line strategies, following the Coffs Harbour Mathematics
  // Faculty workbook "Building Additive Strategies".
  { id: "onl-bridging-add", label: "Number line: bridging to ten (addition)" },
  { id: "onl-jump-add", label: "Number line: jump strategy (addition)" },
  { id: "onl-jumping-over-add", label: "Number line: jumping over (addition)" },
  { id: "onl-bridging-sub", label: "Number line: bridging to ten (subtraction)" },
  { id: "onl-counting-up", label: "Number line: counting up (subtraction)" },
  { id: "onl-constant-difference", label: "Number line: constant difference" },
  { id: "onl-draw-your-own", label: "Number line: draw your own jumps" }
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

function randomId(prefix = "s3ar") {
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

/* Thousands are spaced in money too — "$5320.00" reads as a different kind of
   number from the "5 320" used everywhere else on the same page. */
function money(n) {
  return `$${spaced(Number(n).toFixed(2).split(".")[0])}.${Number(n).toFixed(2).split(".")[1]}`;
}

/* Decimal arithmetic in cents/thousandths, so no floating-point dust. */
function exact(value, places) {
  const scale = Math.pow(10, places);
  return Math.round(value * scale) / scale;
}

function decimalPart(places) {
  let digits = "";
  for (let i = 0; i < places; i++) {
    digits += i === places - 1 ? randInt(1, 9) : randInt(0, 9);
  }
  return digits;
}

function makeDecimal(wholeMax, places) {
  const text = `${randInt(0, wholeMax)}.${decimalPart(places)}`;
  return { text, value: Number(text) };
}

const NAMES = ["Ava", "Noah", "Mia", "Jack", "Ruby", "Kai", "Zara", "Leo", "Ivy", "Sam"];

/* ── plain calculation ───────────────────────────────────── */

function addMultidigitQuestion() {
  const a = randInt(1200, 89000);
  const b = randInt(1200, 89000);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "add-multidigit",
    marks: 1,
    prompt: `Calculate: ${spaced(a)} + ${spaced(b)}`,
    answer: spaced(a + b),
    working: [`${spaced(a)} + ${spaced(b)} = ${spaced(a + b)}.`],
    space: SPACE_SIZES.SMALL,
    tags: ["stage3", "addition"]
  });
}

function subtractMultidigitQuestion() {
  const a = randInt(20000, 95000);
  const b = randInt(1200, a - 1000);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "subtract-multidigit",
    marks: 1,
    prompt: `Calculate: ${spaced(a)} − ${spaced(b)}`,
    answer: spaced(a - b),
    working: [`${spaced(a)} − ${spaced(b)} = ${spaced(a - b)}.`],
    space: SPACE_SIZES.SMALL,
    tags: ["stage3", "subtraction"]
  });
}

/* Deliberately mixed digit counts — the content point is using place value to
   add numbers that do not line up neatly. */
function addThreeNumbersQuestion() {
  const values = [randInt(100, 999), randInt(1000, 9999), randInt(10, 99)];
  if (Math.random() < 0.5) values.push(randInt(10000, 99999));

  const shown = shuffle(values);
  const total = values.reduce((sum, v) => sum + v, 0);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "add-three-numbers",
    marks: 2,
    prompt: `Calculate: ${shown.map(spaced).join(" + ")}`,
    answer: spaced(total),
    working: [
      "Line the numbers up by place value before adding.",
      `Total = ${spaced(total)}.`
    ],
    space: SPACE_SIZES.MEDIUM,
    tags: ["stage3", "addition", "place value"]
  });
}

function missingAddendQuestion() {
  const total = randInt(2000, 40000);
  const known = randInt(500, total - 500);
  const missing = total - known;
  const subtraction = Math.random() < 0.5;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "missing-addend",
    marks: 1,
    // Ends with a colon so the number sentence is set on its own line rather
    // than sharing one with the instruction and breaking mid-expression.
    prompt: subtraction
      ? `Find the missing number: ${spaced(total)} − □ = ${spaced(known)}`
      : `Find the missing number: ${spaced(known)} + □ = ${spaced(total)}`,
    answer: spaced(missing),
    working: [
      subtraction
        ? `${spaced(total)} − ${spaced(known)} = ${spaced(missing)}.`
        : `${spaced(total)} − ${spaced(known)} = ${spaced(missing)}.`
    ],
    space: SPACE_SIZES.SMALL,
    tags: ["stage3", "missing value"]
  });
}

/* ── decimals ────────────────────────────────────────────── */

function addDecimalsQuestion() {
  const places = randInt(1, 3);
  const a = makeDecimal(40, places);
  const b = makeDecimal(40, places);
  const total = exact(a.value + b.value, places);
  // Keep the answer in the same place value as the question, so a result that
  // lands on a whole number still reads as a decimal.
  const shown = total.toFixed(places);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "add-decimals",
    marks: 1,
    prompt: `Calculate: ${a.text} + ${b.text}`,
    answer: shown,
    working: [
      "Line up the decimal points, then add column by column.",
      `${a.text} + ${b.text} = ${shown}.`
    ],
    space: SPACE_SIZES.SMALL,
    tags: ["stage3", "decimals", "addition"]
  });
}

function subtractDecimalsQuestion() {
  const places = randInt(1, 3);
  const a = makeDecimal(60, places);
  const b = makeDecimal(Math.max(1, Math.floor(a.value) - 1), places);

  if (b.value >= a.value) return subtractDecimalsQuestion();

  const result = exact(a.value - b.value, places);
  const shown = result.toFixed(places);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "subtract-decimals",
    marks: 1,
    prompt: `Calculate: ${a.text} − ${b.text}`,
    answer: shown,
    working: [
      "Line up the decimal points, then subtract column by column.",
      `${a.text} − ${b.text} = ${shown}.`
    ],
    space: SPACE_SIZES.SMALL,
    tags: ["stage3", "decimals", "subtraction"]
  });
}

function moneyTotalsQuestion() {
  const paid = choice([20, 50, 100]);
  const items = [
    { name: choice(["a drink bottle", "a notebook", "a lunch box"]), cost: randInt(3, 12) + randInt(0, 19) * 0.05 },
    { name: choice(["a pencil case", "a set of markers", "a folder"]), cost: randInt(4, 15) + randInt(0, 19) * 0.05 }
  ];
  const total = exact(items.reduce((s, i) => s + i.cost, 0), 2);

  if (total >= paid) return moneyTotalsQuestion();

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "money-totals",
    marks: 2,
    prompt: `${choice(NAMES)} buys ${items[0].name} for ${money(items[0].cost)} and ${items[1].name} for ${money(items[1].cost)}. They pay with ${money(paid)}. How much change do they get?`,
    answer: money(exact(paid - total, 2)),
    working: [
      `Total spent: ${money(items[0].cost)} + ${money(items[1].cost)} = ${money(total)}.`,
      `Change: ${money(paid)} − ${money(total)} = ${money(exact(paid - total, 2))}.`
    ],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "money", "multistep"]
  });
}

/* ── estimation and reasonableness ───────────────────────── */

function leadingDigitRound(n) {
  const magnitude = Math.pow(10, String(Math.trunc(n)).length - 1);
  return Math.round(n / magnitude) * magnitude;
}

function estimateSumQuestion() {
  const values = [randInt(180, 9400), randInt(180, 9400), randInt(180, 9400)];
  const estimate = values.reduce((sum, v) => sum + leadingDigitRound(v), 0);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "estimate-sum",
    marks: 1,
    prompt: `Estimate the answer by first rounding each number to its leading digit: ${values.map(spaced).join(" + ")}`,
    answer: spaced(estimate),
    working: [
      `Rounded: ${values.map(v => spaced(leadingDigitRound(v))).join(" + ")}.`,
      `Estimate = ${spaced(estimate)}.`
    ],
    space: SPACE_SIZES.SMALL,
    tags: ["stage3", "estimation"]
  });
}

/*
  Reasonableness, not recomputation. The wrong answers are built from real
  mistakes — a place-value slip of one column, or a digit reversal — so
  rejecting them needs estimation rather than spotting a random number.
*/
function isItReasonableQuestion() {
  const a = randInt(2400, 8900);
  const b = randInt(1200, 6800);
  const correct = a + b;
  const wrong = Math.random() < 0.5
    ? correct * 10                       // a place-value slip
    : Number(String(correct).split("").reverse().join(""));

  const showCorrect = Math.random() < 0.5;
  const shown = showCorrect ? correct : wrong;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "is-it-reasonable",
    marks: 2,
    prompt: `A student worked out ${spaced(a)} + ${spaced(b)} and got ${spaced(shown)}. Use estimation to decide whether this is reasonable. Explain your answer.`,
    answer: showCorrect ? "Reasonable" : "Not reasonable",
    working: [
      `Estimate: ${spaced(leadingDigitRound(a))} + ${spaced(leadingDigitRound(b))} ≈ ${spaced(leadingDigitRound(a) + leadingDigitRound(b))}.`,
      showCorrect
        ? `${spaced(shown)} is close to the estimate, so it is reasonable.`
        : `${spaced(shown)} is nowhere near the estimate, so it is not reasonable.`
    ],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "estimation", "reasoning"]
  });
}

/* ── strategy ────────────────────────────────────────────── */

/*
  The syllabus names these strategies, so the questions name them too. Each
  calculation below is built to make one strategy clearly the efficient one.
*/
function chooseStrategyQuestion() {
  const forms = [
    () => {
      const near = choice([99, 199, 299, 998, 1999]);
      const other = randInt(120, 900);
      return {
        prompt: `Which is the most efficient way to work out ${spaced(other)} + ${spaced(near)}?`,
        answer: `Add ${spaced(near + 1)}, then subtract 1`,
        note: `${spaced(near)} is 1 less than ${spaced(near + 1)}, so add the friendly number and adjust.`
      };
    },
    () => {
      const a = randInt(300, 900);
      return {
        prompt: `Which is the most efficient way to work out ${spaced(a)} − ${spaced(a - 1)}?`,
        answer: "Count on from the smaller number",
        note: "The numbers are next to each other, so counting on is faster than a written algorithm."
      };
    },
    () => {
      const a = randInt(2000, 6000);
      const b = randInt(1000, a - 500);
      return {
        prompt: `Which is the most efficient way to work out ${spaced(a)} − ${spaced(b)}?`,
        answer: "Use a written strategy or a calculator",
        note: "Neither number is close to a friendly number, so a mental strategy is not efficient here."
      };
    }
  ];

  const form = choice(forms)();

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "choose-strategy",
    marks: 2,
    prompt: `${form.prompt} Explain your choice.`,
    answer: form.answer,
    working: [form.note],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "strategy", "reasoning"]
  });
}

/*
  Constant difference: shifting both numbers by the same amount leaves the
  difference unchanged, which turns an awkward subtraction into an easy one.
*/
function constantDifferenceQuestion() {
  const shift = choice([1, 2, 3, 4]);
  const b = randInt(20, 80) * 10 - shift;
  const a = b + randInt(200, 900);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "constant-difference",
    marks: 2,
    prompt: `To work out ${spaced(a)} − ${spaced(b)}, ${choice(NAMES)} adds ${shift} to both numbers first. Explain why this does not change the answer, then find the answer.`,
    answer: spaced(a - b),
    working: [
      `Adding ${shift} to both numbers keeps the gap between them the same.`,
      `${spaced(a + shift)} − ${spaced(b + shift)} = ${spaced(a - b)}.`
    ],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "strategy", "subtraction"]
  });
}

/* Bridging: step to the next friendly number, then take the rest. */
function bridgingQuestion() {
  const start = randInt(20, 90) * 10 + randInt(1, 9) * 10 + randInt(1, 9);
  const nextHundred = Math.ceil(start / 100) * 100;
  const bridge = nextHundred - start;
  const rest = randInt(20, 260);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "bridging",
    marks: 2,
    prompt: `Work out ${spaced(start)} + ${spaced(bridge + rest)} by first bridging to ${spaced(nextHundred)}.`,
    answer: spaced(start + bridge + rest),
    working: [
      `${spaced(start)} + ${bridge} = ${spaced(nextHundred)}.`,
      `${spaced(nextHundred)} + ${spaced(rest)} = ${spaced(start + bridge + rest)}.`
    ],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "strategy", "addition"]
  });
}

/* ── word problems ───────────────────────────────────────── */

function wordProblemQuestion() {
  const contexts = [
    () => {
      const start = randInt(1200, 8600);
      const change = randInt(200, 1400);
      const up = Math.random() < 0.5;
      return {
        prompt: `A library has ${spaced(start)} books. It ${up ? "receives" : "gives away"} ${spaced(change)} more. How many books does it have now?`,
        answer: spaced(up ? start + change : start - change),
        note: `${spaced(start)} ${up ? "+" : "−"} ${spaced(change)} = ${spaced(up ? start + change : start - change)}.`
      };
    },
    () => {
      const a = randInt(4200, 9800);
      const b = randInt(1200, 4000);
      return {
        prompt: `A stadium seats ${spaced(a)} people. ${spaced(b)} seats are still empty. How many people are in the stadium?`,
        answer: spaced(a - b),
        note: `${spaced(a)} − ${spaced(b)} = ${spaced(a - b)}.`
      };
    },
    () => {
      const a = randInt(1500, 6000);
      const b = randInt(1500, 6000);
      return {
        prompt: `Two schools raised ${money(a)} and ${money(b)} for charity. How much did they raise altogether?`,
        answer: money(a + b),
        note: `${money(a)} + ${money(b)} = ${money(a + b)}.`
      };
    }
  ];

  const context = choice(contexts)();

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "word-problem",
    marks: 1,
    prompt: context.prompt,
    answer: context.answer,
    working: [context.note],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["stage3", "word problem"]
  });
}

function multistepWordQuestion() {
  const name = choice(NAMES);
  const start = randInt(3000, 9000);
  const spentA = randInt(400, 1400);
  const spentB = randInt(400, 1400);
  const after = start - spentA - spentB;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "multistep-word",
    marks: 3,
    prompt: `${name} is saving for a trip. They start with ${money(start)}.`,
    subparts: [
      {
        label: "(a)",
        prompt: `They spend ${money(spentA)} on flights. How much is left?`,
        marks: 1,
        answer: money(start - spentA),
        working: [`${money(start)} − ${money(spentA)} = ${money(start - spentA)}.`]
      },
      {
        label: "(b)",
        prompt: `They then spend ${money(spentB)} on accommodation. How much is left now?`,
        marks: 1,
        answer: money(after),
        working: [`${money(start - spentA)} − ${money(spentB)} = ${money(after)}.`]
      },
      {
        label: "(c)",
        prompt: "How much did they spend altogether? Show how you could check your answer.",
        marks: 1,
        answer: money(spentA + spentB),
        working: [
          `${money(spentA)} + ${money(spentB)} = ${money(spentA + spentB)}.`,
          `Check: ${money(after)} + ${money(spentA + spentB)} = ${money(start)}.`
        ]
      }
    ],
    answer: `(a) ${money(start - spentA)}; (b) ${money(after)}; (c) ${money(spentA + spentB)}`,
    working: [],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "word problem", "multistep"]
  });
}

/*
  "Determine when it would be more efficient to use a calculator" is a content
  point in its own right, so it gets a question rather than being implied.
*/
function calculatorOrNotQuestion() {
  const mental = Math.random() < 0.5;

  const calculation = mental
    ? choice([
        `${randInt(2, 9) * 100} + ${randInt(2, 9) * 100}`,
        `${randInt(20, 90) * 10} − ${randInt(2, 9) * 10}`,
        `${randInt(3, 9) * 1000} + ${randInt(3, 9) * 1000}`
      ])
    : `${spaced(randInt(10000, 89000))} + ${spaced(randInt(10000, 89000))} + ${spaced(randInt(10000, 89000))}`;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "calculator-or-not",
    marks: 2,
    prompt: `Would you use a mental strategy or a calculator for this calculation? Explain why. ${calculation}`,
    answer: mental ? "A mental strategy" : "A calculator",
    working: [
      mental
        ? "The numbers are friendly, so a mental strategy is quicker than reaching for a calculator."
        : "Three large numbers with different digit counts make a mental strategy slow and error-prone."
    ],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "strategy", "reasoning"]
  });
}


/* ══════════════════════════════════════════════════════════════════════
   OPEN NUMBER LINE STRATEGIES
   ----------------------------------------------------------------------
   Following the Coffs Harbour Mathematics Faculty workbook "Building
   Additive Strategies". The model is the point of these questions: the
   student reads the jumps off the line and writes the number sentence, or
   fills the gaps in a partly-drawn strategy.

   Each generator builds the jump sequence the strategy actually produces, so
   the diagram and the arithmetic can never disagree. Which labels are hidden
   is decided last, by blanking entries — the diagram engine draws an empty
   box wherever it finds a null.
   ══════════════════════════════════════════════════════════════════════ */

/* Hide a share of the labels, always keeping the first stop visible so the
   student has somewhere to start. */
function blankSome(values, keepFirst = true) {
  const out = values.slice();
  for (let i = keepFirst ? 1 : 0; i < out.length; i++) {
    if (Math.random() < 0.6) out[i] = null;
  }
  return out;
}

function numberLineQuestion({ type, prompt, jumps, stops, shifts, answer, working, marks = 2 }) {
  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type,
    marks,
    prompt,
    diagram: {
      engine: "open-number-line-engine",
      caption: "Open number line — the spacing is not to scale.",
      config: { diagramType: "open-number-line", jumps, stops, shifts }
    },
    answer,
    working,
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["stage3", "open number line", "strategy", "diagram"]
  });
}

/*
  Bridging to ten: step to the next multiple of ten, then the tens, then the
  remaining ones. 48 + 27 becomes +2 to 50, +20 to 70, +5 to 75.
*/
function bridgingJumps(start, addend) {
  const toTen = (10 - (start % 10)) % 10;
  const bridge = toTen === 0 ? 10 : toTen;
  const afterBridge = start + bridge;
  const remaining = addend - bridge;
  const tens = Math.floor(remaining / 10) * 10;
  const ones = remaining - tens;

  const jumps = [{ size: bridge }];
  const stops = [start, afterBridge];

  if (tens > 0) {
    jumps.push({ size: tens });
    stops.push(afterBridge + tens);
  }
  if (ones > 0) {
    jumps.push({ size: ones });
    stops.push(afterBridge + tens + ones);
  }

  return { jumps, stops };
}

function onlBridgingAddQuestion() {
  const start = randInt(2, 8) * 10 + randInt(1, 9);
  const addend = randInt(2, 6) * 10 + randInt(2, 9);
  const { jumps, stops } = bridgingJumps(start, addend);

  return numberLineQuestion({
    type: "onl-bridging-add",
    prompt: "Fill the gaps on the number line, then write the number sentence.",
    jumps: jumps.map((j, i) => (i === 0 ? j : { ...j, size: Math.random() < 0.5 ? null : j.size })),
    stops: blankSome(stops),
    answer: `${start} + ${addend} = ${start + addend}`,
    working: [
      `Bridge to ${stops[1]} first: ${start} + ${jumps[0].size} = ${stops[1]}.`,
      `Then jump the rest: ${jumps.slice(1).map(j => `+ ${j.size}`).join(" ")}.`,
      `${start} + ${addend} = ${start + addend}.`
    ]
  });
}

/*
  Jump strategy: all the tens in one jump, then the ones. No bridging — the
  contrast with the bridging pages is the teaching point.
*/
function onlJumpAddQuestion() {
  const start = randInt(2, 7) * 10 + randInt(1, 9);
  const tens = randInt(2, 5) * 10;
  const ones = randInt(1, 9);

  const stops = [start, start + tens, start + tens + ones];
  const jumps = [{ size: tens }, { size: ones }];

  return numberLineQuestion({
    type: "onl-jump-add",
    prompt: "Fill the gaps on the number line, then write the number sentence.",
    jumps,
    stops: blankSome(stops),
    answer: `${start} + ${tens + ones} = ${start + tens + ones}`,
    working: [
      `Jump the tens first: ${start} + ${tens} = ${start + tens}.`,
      `Then the ones: ${start + tens} + ${ones} = ${start + tens + ones}.`
    ]
  });
}

/*
  Jumping over: add a round number that overshoots, then step back. 40 + 39
  becomes +40 then −1.
*/
function onlJumpingOverAddQuestion() {
  const start = randInt(2, 8) * 10 + randInt(1, 8);
  const over = randInt(1, 3);
  const round = randInt(2, 6) * 10;
  const addend = round - over;

  const stops = [start, start + round, start + addend];
  const jumps = [{ size: round }, { size: over, direction: "back" }];

  return numberLineQuestion({
    type: "onl-jumping-over-add",
    prompt: `Use the number line to work out ${start} + ${addend}. Fill the gaps, then write the number sentence.`,
    jumps,
    stops: [start, null, null],
    answer: `${start} + ${addend} = ${start + addend}`,
    working: [
      `${addend} is ${over} less than ${round}, so jump ${round} then step back ${over}.`,
      `${start} + ${round} = ${start + round}, then − ${over} = ${start + addend}.`
    ]
  });
}

/* Bridging for subtraction — back to the ten below, then the rest. */
function onlBridgingSubQuestion() {
  const start = randInt(4, 9) * 10 + randInt(1, 9);
  const subtrahend = randInt(2, 4) * 10 + randInt(2, 9);

  const toTen = start % 10;
  const bridge = toTen === 0 ? 10 : toTen;
  const afterBridge = start - bridge;
  const remaining = subtrahend - bridge;

  if (remaining <= 0 || afterBridge - remaining < 0) return onlBridgingSubQuestion();

  const tens = Math.floor(remaining / 10) * 10;
  const ones = remaining - tens;

  const jumps = [{ size: bridge, direction: "back" }];
  const stops = [start, afterBridge];

  if (tens > 0) { jumps.push({ size: tens, direction: "back" }); stops.push(afterBridge - tens); }
  if (ones > 0) { jumps.push({ size: ones, direction: "back" }); stops.push(afterBridge - tens - ones); }

  return numberLineQuestion({
    type: "onl-bridging-sub",
    prompt: "Fill the gaps on the number line, then write the number sentence.",
    jumps,
    stops: blankSome(stops),
    answer: `${start} − ${subtrahend} = ${start - subtrahend}`,
    working: [
      `Step back to ${afterBridge} first.`,
      `${start} − ${subtrahend} = ${start - subtrahend}.`
    ]
  });
}

/*
  Counting up (distance): the difference is found by jumping FORWARD from the
  smaller number to the larger, and the answer is the total of the jumps —
  not the number the last jump lands on. That distinction is the reason this
  strategy gets its own pages in the workbook.
*/
function onlCountingUpQuestion() {
  const smaller = randInt(1, 4) * 10 + randInt(1, 9);
  const larger = randInt(6, 9) * 10 + randInt(1, 9);

  const toTen = (10 - (smaller % 10)) % 10;
  const bridge = toTen === 0 ? 10 : toTen;
  const afterBridge = smaller + bridge;
  const lastTen = Math.floor(larger / 10) * 10;
  const middle = lastTen - afterBridge;
  const finalOnes = larger - lastTen;

  if (middle <= 0) return onlCountingUpQuestion();

  const jumps = [{ size: bridge }, { size: middle }];
  const stops = [smaller, afterBridge, lastTen];

  if (finalOnes > 0) { jumps.push({ size: finalOnes }); stops.push(larger); }

  return numberLineQuestion({
    type: "onl-counting-up",
    prompt: `Use the number line to work out ${larger} − ${smaller} by counting up. Fill the gaps, then write the number sentence.`,
    jumps: jumps.map(j => ({ ...j, size: Math.random() < 0.5 ? null : j.size })),
    stops,
    answer: `${larger} − ${smaller} = ${larger - smaller}`,
    working: [
      `Count up from ${smaller} to ${larger}: ${jumps.map(j => `+ ${j.size}`).join(" ")}.`,
      `The jumps total ${larger - smaller}, so ${larger} − ${smaller} = ${larger - smaller}.`
    ]
  });
}

/*
  Constant difference: shift BOTH numbers by the same amount and the
  difference is unchanged, which turns an awkward subtraction into an easy
  one. The two equal shifts are drawn under the line.
*/
function onlConstantDifferenceQuestion() {
  const smaller = randInt(2, 6) * 10 + randInt(1, 9);
  const shift = 10 - (smaller % 10);
  const larger = smaller + randInt(2, 4) * 10 + randInt(1, 9);

  const shiftedSmaller = smaller + shift;
  const shiftedLarger = larger + shift;

  return numberLineQuestion({
    type: "onl-constant-difference",
    prompt: `Shift both numbers by the same amount to make ${larger} − ${smaller} easier. Fill the gaps, then write the number sentence.`,
    // The ORIGINAL numbers stay on the line; the shift arcs carry each to its
    // new position, so the student can see that the gap is unchanged.
    jumps: [{ size: null }],
    stops: [smaller, larger],
    shifts: [
      { at: 0, by: shift, label: `+${shift}`, to: shiftedSmaller },
      { at: 1, by: shift, label: `+${shift}`, to: null }
    ],
    answer: `${larger} − ${smaller} = ${shiftedLarger} − ${shiftedSmaller} = ${larger - smaller}`,
    working: [
      `Adding ${shift} to both numbers keeps the gap the same.`,
      `${shiftedLarger} − ${shiftedSmaller} = ${larger - smaller}.`
    ],
    marks: 3
  });
}

/* A bare line. The student chooses and draws their own strategy. */
function onlDrawYourOwnQuestion() {
  const addition = Math.random() < 0.5;
  const a = randInt(4, 8) * 10 + randInt(1, 9);
  // Subtraction must stay positive — Additive Relations at Stage 3 does not go
  // below zero, and "35 − 38" slipped through when b was drawn independently.
  const b = addition
    ? randInt(2, 5) * 10 + randInt(1, 9)
    : randInt(11, a - 5);
  const result = addition ? a + b : a - b;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "onl-draw-your-own",
    marks: 2,
    prompt: `Show how you would work out ${a} ${addition ? "+" : "−"} ${b} on the number line below.`,
    diagram: {
      engine: "open-number-line-engine",
      caption: "Draw your jumps and label them.",
      config: { diagramType: "blank-number-line", start: a }
    },
    answer: String(result),
    working: [`${a} ${addition ? "+" : "−"} ${b} = ${result}.`],
    space: SPACE_SIZES.NONE,
    mcEligible: false,
    tags: ["stage3", "open number line", "strategy", "diagram"]
  });
}

/* ── registry ────────────────────────────────────────────── */

const GENERATORS = {
  "add-multidigit": addMultidigitQuestion,
  "subtract-multidigit": subtractMultidigitQuestion,
  "add-three-numbers": addThreeNumbersQuestion,
  "missing-addend": missingAddendQuestion,
  "add-decimals": addDecimalsQuestion,
  "subtract-decimals": subtractDecimalsQuestion,
  "money-totals": moneyTotalsQuestion,
  "estimate-sum": estimateSumQuestion,
  "is-it-reasonable": isItReasonableQuestion,
  "choose-strategy": chooseStrategyQuestion,
  "constant-difference": constantDifferenceQuestion,
  "bridging": bridgingQuestion,
  "word-problem": wordProblemQuestion,
  "multistep-word": multistepWordQuestion,
  "calculator-or-not": calculatorOrNotQuestion,
  "onl-bridging-add": onlBridgingAddQuestion,
  "onl-jump-add": onlJumpAddQuestion,
  "onl-jumping-over-add": onlJumpingOverAddQuestion,
  "onl-bridging-sub": onlBridgingSubQuestion,
  "onl-counting-up": onlCountingUpQuestion,
  "onl-constant-difference": onlConstantDifferenceQuestion,
  "onl-draw-your-own": onlDrawYourOwnQuestion
};

export function getAdditiveRelationsQuestionTypes() {
  return TYPE_LIST;
}

export function generateAdditiveRelationsQuestions({
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
