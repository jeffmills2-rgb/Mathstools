/*
  MMT Exam Builder — Stage 5 Financial Mathematics B Question Bank
  ----------------------------------------------------------------
  Save as:

  question-banks/stage-5/financial-mathematics-b/index.js

  Focus:
  - compound interest using repeated simple-interest steps
  - repeated multiplication and compound-interest formula
  - comparisons with simple interest
  - depreciation, using the terminology from the content statements
*/

import {
  createQuestion,
  SPACE_SIZES
} from "../../../schemas/question.schema.js";

const TOPIC = "Financial Mathematics B";

const TYPE_LIST = [
  { id: "compound-repeated-simple-interest", label: "Compound interest by repeated simple-interest steps" },
  { id: "compound-repeated-multiplication", label: "Compound interest by repeated multiplication" },
  { id: "compound-formula-future-value", label: "Use FV = PV(1 + r)ⁿ" },
  { id: "compound-interest-earned", label: "Calculate compound interest earned" },
  { id: "compound-compounding-frequency", label: "Compound interest with different compounding periods" },
  { id: "simple-vs-compound-compare", label: "Compare simple interest and compound interest" },
  { id: "compound-find-present-value", label: "Calculate the amount to invest now" },
  { id: "compound-find-rate-or-time", label: "Calculate rate or time in compound situations" },
  { id: "depreciation-repeated", label: "Depreciation by repeated multiplication" },
  { id: "depreciation-formula-value", label: "Use S = V₀(1 − r)ⁿ" },
  { id: "depreciation-amount", label: "Calculate the amount of depreciation" },
  { id: "depreciation-find-rate-or-time", label: "Calculate rate or time in depreciation situations" }
];

const NAMES = ["Alex", "Amal", "Brianna", "Casey", "Dina", "Eli", "Fatima", "George", "Hannah", "Ivy", "Jamal", "Kylie", "Luca", "Mia", "Noah", "Priya", "Sam", "Tara", "Vinh", "Zoe"];
const INVESTMENT_PURPOSES = ["holiday fund", "car fund", "home deposit", "education fund", "business equipment fund", "savings account", "term deposit", "retirement account"];
const ASSETS = ["car", "computer", "photocopier", "delivery van", "coffee machine", "tractor", "laptop", "printer", "boat", "piece of machinery"];
const GROWING_ASSETS = ["antique vase", "coin", "block of land", "artwork", "collectable watch", "rare book", "souvenir", "small business" ];

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

function randomId(prefix = "financial-b") {
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

function round(value, dp = 2) {
  return Number(Number(value).toFixed(dp));
}

function addSpaces(value) {
  const [whole, decimal] = String(value).split(".");
  const spaced = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return decimal !== undefined ? `${spaced}.${decimal}` : spaced;
}

function formatPlain(value, dp = 2) {
  const rounded = round(value, dp);
  if (Math.abs(rounded - Math.round(rounded)) < 1e-9 && dp !== 2) return String(Math.round(rounded));
  return rounded.toFixed(dp);
}

function money(value, dp = 2) {
  return `$${addSpaces(formatPlain(value, dp))}`;
}

function dollars(value) {
  return money(value, 0);
}

function percent(value) {
  return `${Number(value).toFixed(Number.isInteger(Number(value)) ? 0 : 1)}%`;
}

function multiplier(ratePercent, growth = true) {
  return growth ? 1 + Number(ratePercent) / 100 : 1 - Number(ratePercent) / 100;
}

function compoundValue(pv, ratePercent, periods) {
  return pv * Math.pow(multiplier(ratePercent, true), periods);
}

function depreciatedValue(initial, ratePercent, periods) {
  return initial * Math.pow(multiplier(ratePercent, false), periods);
}

function simpleInterestAmount(principal, ratePercent, years) {
  return principal * (1 + Number(ratePercent) / 100 * years);
}

function financialBQuestion({
  type,
  marks = 2,
  prompt,
  answer,
  working = [],
  table = null,
  diagram = null,
  space = SPACE_SIZES.MEDIUM,
  tags = []
}) {
  const question = createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type,
    marks,
    prompt: normalisePromptWording(prompt),
    diagram,
    answer,
    working,
    space,
    tags: ["stage-5", "financial-mathematics", "financial-mathematics-b", type, ...tags]
  });

  if (table) question.table = table;
  return question;
}

function normalisePromptWording(prompt) {
  return String(prompt ?? "")
    .replace(/\bFind\b/g, "Calculate")
    .replace(/\bfind\b/g, "calculate");
}

function yearlyTableRows(principal, rate, periods, growth = true) {
  const rows = [["Period", "Opening value", growth ? "Interest" : "Depreciation", "Closing value"]];
  let value = principal;
  for (let period = 1; period <= periods; period++) {
    const change = value * (rate / 100);
    const closing = growth ? value + change : value - change;
    rows.push([String(period), money(value), money(change), money(closing)]);
    value = closing;
  }
  return rows;
}

function compoundRepeatedSimpleInterestQuestion() {
  const name = choice(NAMES);
  const pv = randInt(30, 180) * 100;
  const rate = choice([4, 4.5, 5, 5.5, 6, 6.8, 7, 7.5, 8, 8.25, 9]);
  const periods = choice([2, 3]);
  const fv = compoundValue(pv, rate, periods);

  const working = [
    `Year 1 interest = ${money(pv)} × ${percent(rate)} = ${money(pv * rate / 100)}`
  ];
  let amount = pv;
  for (let year = 1; year <= periods; year++) {
    const interest = amount * rate / 100;
    const closing = amount + interest;
    working.push(`After year ${year}: ${money(amount)} + ${money(interest)} = ${money(closing)}`);
    amount = closing;
  }

  return financialBQuestion({
    type: "compound-repeated-simple-interest",
    marks: periods === 2 ? 2 : 3,
    prompt: `${name} invests ${money(pv, 0)} at ${percent(rate)} pa compound interest, compounded yearly.
Using repeated simple-interest calculations, calculate the value of the investment after ${periods} years, correct to the nearest cent.`,
    answer: money(fv),
    working,
    table: {
      caption: "Repeated yearly compounding structure",
      headerRow: true,
      rows: [["Year", "Opening value", "Interest", "Closing value"], ...Array.from({ length: periods }, (_, i) => [String(i + 1), "", "", ""])]
    },
    space: SPACE_SIZES.LARGE
  });
}

function compoundRepeatedMultiplicationQuestion() {
  const pv = randInt(40, 250) * 100;
  const rate = choice([3.5, 4, 4.8, 5.2, 6, 6.5, 7.2, 8, 9.4]);
  const years = choice([3, 4, 5, 6]);
  const m = multiplier(rate, true);
  const fv = compoundValue(pv, rate, years);

  return financialBQuestion({
    type: "compound-repeated-multiplication",
    marks: 2,
    prompt: `An investment of ${money(pv, 0)} earns ${percent(rate)} pa compound interest, compounded yearly.
Use repeated multiplication to calculate the value of the investment after ${years} years, correct to the nearest cent.`,
    answer: money(fv),
    working: [
      `The yearly multiplier is 1 + ${rate / 100} = ${m.toFixed(3).replace(/0+$/, "").replace(/\.$/, "")}.`,
      `FV = ${money(pv, 0)} × ${m.toFixed(4)}^${years}`,
      `FV = ${money(fv)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function compoundFormulaFutureValueQuestion() {
  const pv = randInt(20, 300) * 100;
  const rate = choice([4.25, 4.8, 5.4, 6.2, 6.75, 7.1, 8.3, 9.6]);
  const years = choice([4, 5, 6, 7, 8, 10, 12]);
  const fv = compoundValue(pv, rate, years);

  return financialBQuestion({
    type: "compound-formula-future-value",
    marks: 2,
    prompt: `Use FV = PV(1 + r)ⁿ to calculate the future value of an investment of ${money(pv, 0)} at ${percent(rate)} pa compound interest for ${years} years.
Give your answer correct to the nearest cent.`,
    answer: money(fv),
    working: [
      `PV = ${money(pv, 0)}, r = ${rate / 100}, n = ${years}`,
      `FV = ${money(pv, 0)}(1 + ${rate / 100})^${years}`,
      `FV = ${money(fv)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function compoundInterestEarnedQuestion() {
  const pv = randInt(25, 220) * 100;
  const rate = choice([3.9, 4.5, 5.5, 6, 6.25, 7.75, 8.5, 9]);
  const years = choice([2, 3, 4, 5, 6, 8]);
  const fv = compoundValue(pv, rate, years);
  const interest = fv - pv;

  return financialBQuestion({
    type: "compound-interest-earned",
    marks: 2,
    prompt: `${money(pv, 0)} is invested for ${years} years at ${percent(rate)} pa compound interest, compounded yearly.
Calculate the compound interest earned, correct to the nearest cent.`,
    answer: money(interest),
    working: [
      `FV = ${money(pv, 0)}(1 + ${rate / 100})^${years}`,
      `FV = ${money(fv)}`,
      `Compound interest earned = ${money(fv)} − ${money(pv, 0)}`,
      `Compound interest earned = ${money(interest)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function compoundCompoundingFrequencyQuestion() {
  const pv = randInt(20, 180) * 100;
  const nominalRate = choice([4.8, 5.4, 6, 6.6, 7.2, 8.4, 9.6]);
  const years = choice([1, 2, 3, 4, 5]);
  const option = choice([
    { label: "monthly", periodsPerYear: 12 },
    { label: "quarterly", periodsPerYear: 4 },
    { label: "half-yearly", periodsPerYear: 2 }
  ]);
  const periodRate = nominalRate / option.periodsPerYear;
  const periods = years * option.periodsPerYear;
  const fv = compoundValue(pv, periodRate, periods);

  return financialBQuestion({
    type: "compound-compounding-frequency",
    marks: 3,
    prompt: `${money(pv, 0)} is invested at ${percent(nominalRate)} pa compound interest, compounded ${option.label}, for ${years} years.
Calculate the future value of the investment, correct to the nearest cent.`,
    answer: money(fv),
    working: [
      `${option.label[0].toUpperCase()}${option.label.slice(1)} compounding gives ${option.periodsPerYear} periods per year.`,
      `r per period = ${percent(nominalRate)} ÷ ${option.periodsPerYear} = ${percent(periodRate)}`,
      `n = ${years} × ${option.periodsPerYear} = ${periods}`,
      `FV = ${money(pv, 0)}(1 + ${periodRate / 100})^${periods}`,
      `FV = ${money(fv)}`
    ],
    space: SPACE_SIZES.LARGE
  });
}

function simpleVsCompoundCompareQuestion() {
  const pv = randInt(20, 140) * 100;
  const simpleRate = choice([4, 5, 6, 7, 8, 9]);
  const compoundRate = simpleRate - choice([0.5, 1, 1.5]);
  const years = choice([2, 3, 4, 5, 6]);
  const simpleAmount = simpleInterestAmount(pv, simpleRate, years);
  const compoundAmount = compoundValue(pv, compoundRate, years);
  const simpleBetter = simpleAmount > compoundAmount;
  const difference = Math.abs(simpleAmount - compoundAmount);
  const optionA = `simple interest at ${percent(simpleRate)} pa for ${years} years`;
  const optionB = `${percent(compoundRate)} pa compound interest, compounded yearly, for ${years} years`;

  return financialBQuestion({
    type: "simple-vs-compound-compare",
    marks: 3,
    prompt: `${choice(NAMES)} has ${money(pv, 0)} to invest and is comparing two options:
A: ${optionA}
B: ${optionB}
Which option gives the greater final amount, and by how much? Give your answer correct to the nearest cent.`,
    answer: `${simpleBetter ? "Option A" : "Option B"} by ${money(difference)}`,
    working: [
      `Option A amount = ${money(pv, 0)}(1 + ${simpleRate / 100} × ${years}) = ${money(simpleAmount)}`,
      `Option B amount = ${money(pv, 0)}(1 + ${compoundRate / 100})^${years} = ${money(compoundAmount)}`,
      `Difference = ${money(difference)}`,
      `${simpleBetter ? "Option A" : "Option B"} gives the greater final amount.`
    ],
    space: SPACE_SIZES.LARGE
  });
}

function compoundFindPresentValueQuestion() {
  const target = randInt(50, 300) * 100;
  const rate = choice([4.5, 5.2, 5.8, 6.4, 7.1, 7.8, 8.5]);
  const years = choice([3, 4, 5, 6, 8, 10]);
  const pv = target / Math.pow(multiplier(rate, true), years);

  return financialBQuestion({
    type: "compound-find-present-value",
    marks: 3,
    prompt: `${choice(NAMES)} wants to have ${money(target, 0)} in ${years} years for a ${choice(INVESTMENT_PURPOSES)}.
How much should be invested now at ${percent(rate)} pa compound interest, compounded yearly, to reach this amount? Give your answer correct to the nearest cent.`,
    answer: money(pv),
    working: [
      `FV = PV(1 + r)^n`,
      `${money(target, 0)} = PV(1 + ${rate / 100})^${years}`,
      `PV = ${money(target, 0)} ÷ (1 + ${rate / 100})^${years}`,
      `PV = ${money(pv)}`
    ],
    space: SPACE_SIZES.LARGE
  });
}

function compoundFindRateOrTimeQuestion() {
  const mode = choice(["rate", "time", "time", "rate"]);

  if (mode === "rate") {
    const assetName = choice(GROWING_ASSETS);
    const pv = randInt(30, 180) * 100;
    const years = choice([3, 4, 5, 6, 8]);
    const rate = choice([4, 5, 6, 7, 8, 9, 10, 12]);
    const fv = compoundValue(pv, rate, years);

    return financialBQuestion({
      type: "compound-find-rate-or-time",
      marks: 3,
      prompt: `${assetName[0].toUpperCase()}${assetName.slice(1)} originally valued at ${money(pv, 0)} is worth ${money(fv, 0)} after ${years} years.
Calculate the average annual compound interest rate, correct to 1 decimal place.`,
      answer: `${round(rate, 1).toFixed(1)}% pa`,
      working: [
        `FV = PV(1 + r)^n`,
        `${money(fv, 0)} = ${money(pv, 0)}(1 + r)^${years}`,
        `1 + r = (${money(fv, 0)} ÷ ${money(pv, 0)})^(1/${years})`,
        `r = ${rate / 100}`,
        `Rate = ${round(rate, 1).toFixed(1)}% pa`
      ],
      space: SPACE_SIZES.LARGE
    });
  }

  const pv = randInt(20, 120) * 100;
  const rate = choice([4, 5, 6, 7, 8, 9, 10]);
  const years = choice([4, 5, 6, 7, 8, 9, 10]);
  const fv = compoundValue(pv, rate, years);

  return financialBQuestion({
    type: "compound-find-rate-or-time",
    marks: 3,
    prompt: `After how many years will ${money(pv, 0)} grow to at least ${money(fv, 0)} if it earns ${percent(rate)} pa compound interest, compounded yearly?`,
    answer: `${years} years`,
    working: [
      `FV = PV(1 + r)^n`,
      `${money(fv, 0)} = ${money(pv, 0)}(1 + ${rate / 100})^n`,
      `n = log(${money(fv, 0)} ÷ ${money(pv, 0)}) ÷ log(1 + ${rate / 100})`,
      `n ≈ ${round(Math.log(fv / pv) / Math.log(1 + rate / 100), 2)} years`,
      `The investment reaches at least ${money(fv, 0)} after ${years} years.`
    ],
    space: SPACE_SIZES.LARGE
  });
}

function depreciationRepeatedQuestion() {
  const asset = choice(ASSETS);
  const initial = randInt(25, 240) * 100;
  const rate = choice([8, 10, 12, 15, 18, 20, 22, 25]);
  const years = choice([2, 3, 4]);
  const salvage = depreciatedValue(initial, rate, years);

  const working = [];
  let value = initial;
  for (let year = 1; year <= years; year++) {
    const dep = value * rate / 100;
    const closing = value - dep;
    working.push(`After year ${year}: ${money(value)} − ${percent(rate)} of ${money(value)} = ${money(closing)}`);
    value = closing;
  }

  return financialBQuestion({
    type: "depreciation-repeated",
    marks: years === 2 ? 2 : 3,
    prompt: `A ${asset} is valued at ${money(initial, 0)} new and depreciates at ${percent(rate)} pa.
Without using the depreciation formula, calculate its value after ${years} years by calculating the depreciated value year by year.`,
    answer: money(salvage),
    working,
    table: {
      caption: "Depreciation year by year",
      headerRow: true,
      rows: [["Year", "Opening value", "Depreciation", "Closing value"], ...Array.from({ length: years }, (_, i) => [String(i + 1), "", "", ""])]
    },
    space: SPACE_SIZES.LARGE
  });
}

function depreciationFormulaValueQuestion() {
  const asset = choice(ASSETS);
  const initial = randInt(30, 260) * 100;
  const rate = choice([6, 8, 10, 12, 14, 15, 18, 20]);
  const years = choice([3, 4, 5, 6, 8, 10]);
  const salvage = depreciatedValue(initial, rate, years);

  return financialBQuestion({
    type: "depreciation-formula-value",
    marks: 2,
    prompt: `A ${asset} is valued at ${money(initial, 0)} and depreciates at ${percent(rate)} pa.
Use S = V₀(1 − r)ⁿ to calculate its salvage value after ${years} years, correct to the nearest cent.`,
    answer: money(salvage),
    working: [
      `V₀ = ${money(initial, 0)}, r = ${rate / 100}, n = ${years}`,
      `S = ${money(initial, 0)}(1 − ${rate / 100})^${years}`,
      `S = ${money(salvage)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function depreciationAmountQuestion() {
  const asset = choice(ASSETS);
  const initial = randInt(40, 300) * 100;
  const rate = choice([5, 7.5, 9, 11, 12, 15, 16, 20]);
  const years = choice([1, 2, 3, 4, 5, 6]);
  const salvage = depreciatedValue(initial, rate, years);
  const depreciation = initial - salvage;

  return financialBQuestion({
    type: "depreciation-amount",
    marks: 2,
    prompt: `A ${asset} originally cost ${money(initial, 0)} and depreciates at ${percent(rate)} pa.
By how much has it depreciated after ${years} year${years === 1 ? "" : "s"}? Give your answer correct to the nearest cent.`,
    answer: money(depreciation),
    working: [
      `Salvage value after ${years} year${years === 1 ? "" : "s"}: S = ${money(initial, 0)}(1 − ${rate / 100})^${years}`,
      `S = ${money(salvage)}`,
      `Depreciation = original value − salvage value`,
      `Depreciation = ${money(initial, 0)} − ${money(salvage)} = ${money(depreciation)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function depreciationFindRateOrTimeQuestion() {
  const mode = choice(["time", "time", "rate"]);

  if (mode === "rate") {
    const asset = choice(ASSETS);
    const initial = randInt(40, 240) * 100;
    const years = choice([3, 4, 5, 6]);
    const rate = choice([8, 10, 12, 15, 18, 20]);
    const salvage = depreciatedValue(initial, rate, years);

    return financialBQuestion({
      type: "depreciation-find-rate-or-time",
      marks: 3,
      prompt: `A ${asset} depreciates from ${money(initial, 0)} to ${money(salvage, 0)} over ${years} years.
Calculate the annual depreciation rate, correct to 1 decimal place.`,
      answer: `${round(rate, 1).toFixed(1)}% pa`,
      working: [
        `S = V₀(1 − r)^n`,
        `${money(salvage, 0)} = ${money(initial, 0)}(1 − r)^${years}`,
        `1 − r = (${money(salvage, 0)} ÷ ${money(initial, 0)})^(1/${years})`,
        `r ≈ ${round(rate / 100, 3)}`,
        `Depreciation rate ≈ ${round(rate, 1).toFixed(1)}% pa`
      ],
      space: SPACE_SIZES.LARGE
    });
  }

  const asset = choice(ASSETS);
  const initial = randInt(50, 250) * 100;
  const rate = choice([8, 10, 12, 14, 15, 18, 20]);
  const targetPercent = choice([0.5, 0.6, 0.7, 0.75]);
  const rawYears = Math.log(targetPercent) / Math.log(1 - rate / 100);
  const years = Math.ceil(rawYears);
  const targetValue = initial * targetPercent;

  return financialBQuestion({
    type: "depreciation-find-rate-or-time",
    marks: 3,
    prompt: `A ${asset} is valued at ${money(initial, 0)} and depreciates at ${percent(rate)} pa.
For how long, to the nearest whole year, will it take for the ${asset} to be worth ${money(targetValue, 0)} or less?`,
    answer: `${years} years`,
    working: [
      `S = V₀(1 − r)^n`,
      `${money(targetValue, 0)} = ${money(initial, 0)}(1 − ${rate / 100})^n`,
      `n = log(${money(targetValue, 0)} ÷ ${money(initial, 0)}) ÷ log(1 − ${rate / 100})`,
      `n ≈ ${round(rawYears, 2)} years`,
      `It will take ${years} years to be worth ${money(targetValue, 0)} or less.`
    ],
    space: SPACE_SIZES.LARGE
  });
}

const GENERATORS = {
  "compound-repeated-simple-interest": compoundRepeatedSimpleInterestQuestion,
  "compound-repeated-multiplication": compoundRepeatedMultiplicationQuestion,
  "compound-formula-future-value": compoundFormulaFutureValueQuestion,
  "compound-interest-earned": compoundInterestEarnedQuestion,
  "compound-compounding-frequency": compoundCompoundingFrequencyQuestion,
  "simple-vs-compound-compare": simpleVsCompoundCompareQuestion,
  "compound-find-present-value": compoundFindPresentValueQuestion,
  "compound-find-rate-or-time": compoundFindRateOrTimeQuestion,
  "depreciation-repeated": depreciationRepeatedQuestion,
  "depreciation-formula-value": depreciationFormulaValueQuestion,
  "depreciation-amount": depreciationAmountQuestion,
  "depreciation-find-rate-or-time": depreciationFindRateOrTimeQuestion
};

export function getFinancialMathematicsBQuestionTypes() {
  return TYPE_LIST.slice();
}

export function generateFinancialMathematicsBQuestions({
  count = 6,
  allowedTypes = []
} = {}) {
  const typeIds = (allowedTypes || []).filter(typeId => GENERATORS[typeId]);
  const plan = makeBalancedPlan(typeIds, Math.max(0, Number(count || 0)));

  return plan.map(typeId => GENERATORS[typeId]());
}
