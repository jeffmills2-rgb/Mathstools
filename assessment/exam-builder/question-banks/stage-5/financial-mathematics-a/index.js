/*
  MMT Exam Builder — Stage 5 Financial Mathematics A Question Bank
  ----------------------------------------------------------------
  Save as:

  question-banks/stage-5/financial-mathematics-a/index.js

  Optional visual helper:
  - engines/financial/financial-engine.js
*/

import {
  createQuestion,
  SPACE_SIZES
} from "../../../schemas/question.schema.js";

const TOPIC = "Financial Mathematics A";

const TYPE_LIST = [
  { id: "hourly-wages", label: "Hourly wages" },
  { id: "overtime-penalty-rates", label: "Overtime and penalty rates" },
  { id: "salary-conversions", label: "Weekly, fortnightly, monthly and yearly earnings" },
  { id: "pay-rise-percent-change", label: "Pay rises and percentage change" },
  { id: "commission", label: "Commission" },
  { id: "piecework-royalties", label: "Piecework and royalties" },
  { id: "leave-loading", label: "Leave loading" },
  { id: "taxable-income", label: "Taxable income" },
  { id: "tax-payable-table", label: "Tax payable from the resident tax table" },
  { id: "net-earnings-after-tax", label: "Net earnings after deductions and tax" },
  { id: "simple-interest", label: "Calculate simple interest" },
  { id: "simple-interest-time-conversion", label: "Simple interest with time conversions" },
  { id: "simple-interest-total-amount", label: "Total amount after simple interest" },
  { id: "simple-interest-find-variable", label: "Calculate principal, rate or time" },
  { id: "simple-interest-compare", label: "Compare simple-interest investments" },
  { id: "simple-interest-table-graph", label: "Simple interest from a graph or table" },
  { id: "buying-on-terms", label: "Buying items on terms" },
  { id: "compare-payment-options", label: "Compare payment options" },
  { id: "short-term-loans", label: "Short-term loan costs" },
  { id: "best-financial-option", label: "Best financial option" }
];

const RESIDENT_TAX_TABLE = [
  { min: 0, max: 18200, base: 0, rate: 0, threshold: 0, label: "$0 to $18 200", rule: "Nil" },
  { min: 18201, max: 45000, base: 0, rate: 0.16, threshold: 18200, label: "$18 201 to $45 000", rule: "16c for each $1 over $18 200" },
  { min: 45001, max: 135000, base: 4288, rate: 0.30, threshold: 45000, label: "$45 001 to $135 000", rule: "$4 288 plus 30c for each $1 over $45 000" },
  { min: 135001, max: 190000, base: 31288, rate: 0.37, threshold: 135000, label: "$135 001 to $190 000", rule: "$31 288 plus 37c for each $1 over $135 000" },
  { min: 190001, max: Infinity, base: 51638, rate: 0.45, threshold: 190000, label: "over $190 000", rule: "$51 638 plus 45c for each $1 over $190 000" }
];

const NAMES = ["Alex", "Amal", "Brianna", "Casey", "Dina", "Eli", "Fatima", "George", "Hannah", "Ivy", "Jamal", "Kylie", "Luca", "Mia", "Noah", "Priya", "Sam", "Tara", "Vinh", "Zoe"];
const JOBS = ["retail assistant", "barista", "library assistant", "lifeguard", "warehouse assistant", "garden centre worker", "cinema attendant", "office assistant", "coach", "cleaner"];
const ITEMS = ["laptop", "phone", "washing machine", "bike", "sofa", "tablet", "fridge", "television"];

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

function randomId(prefix = "financial-a") {
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

function formatPlain(value, dp = 2) {
  const rounded = round(value, dp);
  if (Math.abs(rounded - Math.round(rounded)) < 1e-9 && dp !== 2) return String(Math.round(rounded));
  return rounded.toFixed(dp);
}

function addSpaces(value) {
  const [whole, decimal] = String(value).split(".");
  const spaced = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return decimal !== undefined ? `${spaced}.${decimal}` : spaced;
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

function decimalRate(percentValue) {
  return Number(percentValue) / 100;
}

function taxTableStimulus() {
  return {
    caption: "Resident income tax table",
    className: "financial-tax-table",
    headerRow: true,
    rows: [
      ["Taxable income", "Tax on this income"],
      ...RESIDENT_TAX_TABLE.map(row => [row.label, row.rule])
    ]
  };
}

function calculateTax(income) {
  const taxableIncome = Math.max(0, Number(income || 0));
  const row = RESIDENT_TAX_TABLE.find(bracket => taxableIncome >= bracket.min && taxableIncome <= bracket.max) || RESIDENT_TAX_TABLE.at(-1);
  return round(row.base + Math.max(0, taxableIncome - row.threshold) * row.rate, 2);
}

function taxWorking(income) {
  const taxableIncome = Math.max(0, Number(income || 0));
  const row = RESIDENT_TAX_TABLE.find(bracket => taxableIncome >= bracket.min && taxableIncome <= bracket.max) || RESIDENT_TAX_TABLE.at(-1);

  if (row.rate === 0) {
    return [`${money(taxableIncome, 0)} is in the ${row.label} bracket.`, "Tax payable = $0.00"];
  }

  const excess = taxableIncome - row.threshold;
  const tax = calculateTax(taxableIncome);
  return [
    `${money(taxableIncome, 0)} is in the ${row.label} bracket.`,
    `Tax = ${money(row.base)} + ${percent(row.rate * 100)} × (${money(taxableIncome, 0)} − ${money(row.threshold, 0)})`,
    `Tax = ${money(row.base)} + ${percent(row.rate * 100)} × ${money(excess, 0)}`,
    `Tax payable = ${money(tax)}`
  ];
}

function financialQuestion({
  type,
  marks = 1,
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
    tags: ["stage-5", "financial-mathematics", type, ...tags]
  });

  if (table) question.table = table;
  return question;
}

function financialDiagram(config = {}) {
  return {
    engine: "financial-engine",
    config
  };
}

function normalisePromptWording(prompt) {
  return String(prompt ?? "")
    .replace(/\bFind\b/g, "Calculate")
    .replace(/\bfind\b/g, "calculate");
}

function hourlyWagesQuestion() {
  const name = choice(NAMES);
  const job = choice(JOBS);
  const rate = round(randInt(1750, 3250) / 100, 2);
  const hours = choice([4, 5, 6, 7, 8, 12, 15, 18, 20, 24, 30, 35, 38]);
  const pay = rate * hours;

  return financialQuestion({
    type: "hourly-wages",
    marks: 1,
    prompt: `${name} works as a ${job} and is paid ${money(rate)} per hour.\nHow much does ${name} earn for working ${hours} hours?`,
    answer: money(pay),
    working: [
      `Pay = hourly rate × hours worked`,
      `Pay = ${money(rate)} × ${hours}`,
      `Pay = ${money(pay)}`
    ],
    space: SPACE_SIZES.SMALL
  });
}

function overtimePenaltyQuestion() {
  const name = choice(NAMES);
  const normalRate = round(randInt(1800, 3400) / 100, 2);
  const normalHours = choice([20, 24, 28, 30, 32, 35, 38]);
  const overtimeHours = choice([2, 3, 4, 5, 6, 8]);
  const multiplier = choice([1.5, 2]);
  const overtimePay = normalRate * multiplier * overtimeHours;
  const normalPay = normalRate * normalHours;
  const total = normalPay + overtimePay;
  const ratePhrase = multiplier === 1.5 ? "time and a half" : "double time";

  return financialQuestion({
    type: "overtime-penalty-rates",
    marks: 2,
    prompt: `${name} is paid ${money(normalRate)} per hour for normal work.\nIn one week, ${name} works ${normalHours} normal hours and ${overtimeHours} hours overtime at ${ratePhrase}.\nFind ${name}'s total pay for the week.`,
    answer: money(total),
    working: [
      `Normal pay = ${normalHours} × ${money(normalRate)} = ${money(normalPay)}`,
      `Overtime rate = ${multiplier} × ${money(normalRate)} = ${money(normalRate * multiplier)}`,
      `Overtime pay = ${overtimeHours} × ${money(normalRate * multiplier)} = ${money(overtimePay)}`,
      `Total pay = ${money(normalPay)} + ${money(overtimePay)} = ${money(total)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function salaryConversionsQuestion() {
  const name = choice(NAMES);
  const annual = randInt(42, 95) * 1000 + choice([0, 250, 500, 750]);
  const conversion = choice(["weekly", "fortnightly", "monthly"]);
  const divisor = conversion === "weekly" ? 52 : conversion === "fortnightly" ? 26 : 12;
  const answer = annual / divisor;

  return financialQuestion({
    type: "salary-conversions",
    marks: 1,
    prompt: `${name} earns an annual salary of ${money(annual, 0)}.\nFind ${name}'s ${conversion} pay. Assume 1 year = 52 weeks.`,
    answer: money(answer),
    working: [
      `${conversion[0].toUpperCase() + conversion.slice(1)} pay = ${money(annual, 0)} ÷ ${divisor}`,
      `${conversion[0].toUpperCase() + conversion.slice(1)} pay = ${money(answer)}`
    ],
    space: SPACE_SIZES.SMALL
  });
}

function payRiseQuestion() {
  const name = choice(NAMES);
  const oldSalary = randInt(48, 92) * 1000;
  const rate = choice([2.5, 3, 3.5, 4, 4.5, 5, 6, 7.5]);
  const newSalary = oldSalary * (1 + decimalRate(rate));

  return financialQuestion({
    type: "pay-rise-percent-change",
    marks: 2,
    prompt: `${name}'s annual salary increases from ${money(oldSalary, 0)} by ${percent(rate)}.\nFind ${name}'s new annual salary.`,
    answer: money(newSalary),
    working: [
      `Increase = ${percent(rate)} × ${money(oldSalary, 0)}`,
      `Increase = ${money(oldSalary * decimalRate(rate))}`,
      `New salary = ${money(oldSalary, 0)} + ${money(oldSalary * decimalRate(rate))}`,
      `New salary = ${money(newSalary)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function commissionQuestion() {
  const name = choice(NAMES);
  const retainer = choice([150, 200, 250, 300, 400, 450]);
  const rate = choice([5, 7, 10, 12, 15, 18]);
  const threshold = choice([0, 1000, 2000, 3000]);
  const sales = threshold + randInt(25, 90) * 100;
  const commissionBase = Math.max(0, sales - threshold);
  const pay = retainer + commissionBase * decimalRate(rate);

  return financialQuestion({
    type: "commission",
    marks: 2,
    prompt: threshold > 0
      ? `${name} is paid ${money(retainer)} per week plus ${percent(rate)} commission on sales over ${money(threshold, 0)}.\nIf ${name}'s sales for the week are ${money(sales, 0)}, find ${name}'s total pay.`
      : `${name} is paid ${money(retainer)} per week plus ${percent(rate)} commission on all sales.\nIf ${name}'s sales for the week are ${money(sales, 0)}, find ${name}'s total pay.`,
    answer: money(pay),
    working: [
      threshold > 0 ? `Commission is paid on ${money(sales, 0)} − ${money(threshold, 0)} = ${money(commissionBase, 0)}` : `Commission is paid on ${money(sales, 0)}`,
      `Commission = ${percent(rate)} × ${money(commissionBase, 0)} = ${money(commissionBase * decimalRate(rate))}`,
      `Total pay = ${money(retainer)} + ${money(commissionBase * decimalRate(rate))} = ${money(pay)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function pieceworkRoyaltiesQuestion() {
  const useRoyalty = Math.random() < 0.35;

  if (useRoyalty) {
    const name = choice(NAMES);
    const rate = round(randInt(35, 180) / 100, 2);
    const copies = randInt(120, 850);
    const earnings = rate * copies;

    return financialQuestion({
      type: "piecework-royalties",
      marks: 1,
      prompt: `${name} receives a royalty of ${money(rate)} for each digital resource sold.\nHow much does ${name} earn if ${copies} resources are sold?`,
      answer: money(earnings),
      working: [
        `Earnings = royalty per sale × number sold`,
        `Earnings = ${money(rate)} × ${copies} = ${money(earnings)}`
      ],
      space: SPACE_SIZES.SMALL
    });
  }

  const name = choice(NAMES);
  const item = choice(["boxes of fruit", "shirts", "gift cards", "ceramic mugs", "leather belts", "buttons"]);
  const rate = round(randInt(45, 375) / 100, 2);
  const count = randInt(40, 260);
  const earnings = rate * count;

  return financialQuestion({
    type: "piecework-royalties",
    marks: 1,
    prompt: `${name} is paid a piecework rate of ${money(rate)} for each ${item.slice(0, -1)} completed.\nHow much does ${name} earn for completing ${count} ${item}?`,
    answer: money(earnings),
    working: [
      `Earnings = piecework rate × number completed`,
      `Earnings = ${money(rate)} × ${count} = ${money(earnings)}`
    ],
    space: SPACE_SIZES.SMALL
  });
}

function leaveLoadingQuestion() {
  const name = choice(NAMES);
  const weeklyPay = randInt(700, 1900);
  const weeks = choice([2, 3, 4]);
  const loadingRate = 17.5;
  const eligiblePay = weeklyPay * weeks;
  const loading = eligiblePay * decimalRate(loadingRate);

  return financialQuestion({
    type: "leave-loading",
    marks: 2,
    prompt: `${name} receives leave loading of 17.5% on ${weeks} weeks of eligible pay.\n${name}'s normal weekly pay is ${money(weeklyPay)}.\nCalculate the leave loading.`,
    answer: money(loading),
    working: [
      `Eligible pay = ${weeks} × ${money(weeklyPay)} = ${money(eligiblePay)}`,
      `Leave loading = 17.5% × ${money(eligiblePay)}`,
      `Leave loading = ${money(loading)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function taxableIncomeQuestion() {
  const name = choice(NAMES);
  const gross = randInt(45, 110) * 1000 + randInt(0, 9) * 100;
  const otherIncome = randInt(0, 45) * 100;
  const deductions = randInt(8, 60) * 100;
  const taxable = gross + otherIncome - deductions;

  return financialQuestion({
    type: "taxable-income",
    marks: 2,
    prompt: `${name} has a gross income of ${money(gross, 0)} and earns ${money(otherIncome, 0)} from other income.\n${name} has ${money(deductions, 0)} in allowable deductions.\nFind ${name}'s taxable income.`,
    answer: money(taxable, 0),
    working: [
      `Taxable income = gross income + other income − allowable deductions`,
      `Taxable income = ${money(gross, 0)} + ${money(otherIncome, 0)} − ${money(deductions, 0)}`,
      `Taxable income = ${money(taxable, 0)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function taxPayableQuestion() {
  const income = choice([0, randInt(22, 44) * 1000, randInt(46, 130) * 1000, randInt(138, 185) * 1000, randInt(195, 240) * 1000]);
  const tax = calculateTax(income);

  return financialQuestion({
    type: "tax-payable-table",
    marks: 2,
    prompt: `Use the resident income tax table to calculate the tax payable on a taxable income of ${money(income, 0)}.`,
    table: taxTableStimulus(),
    answer: money(tax),
    working: taxWorking(income),
    space: SPACE_SIZES.MEDIUM
  });
}

function netEarningsAfterTaxQuestion() {
  const name = choice(NAMES);
  const gross = randInt(48, 115) * 1000;
  const deductions = randInt(8, 45) * 100;
  const taxable = gross - deductions;
  const tax = calculateTax(taxable);
  const net = gross - tax;

  return financialQuestion({
    type: "net-earnings-after-tax",
    marks: 3,
    prompt: `${name} earns a gross annual income of ${money(gross, 0)} and has ${money(deductions, 0)} in allowable deductions.\nUse the resident income tax table to find the tax payable and ${name}'s net annual earnings after tax.`,
    table: taxTableStimulus(),
    answer: money(net),
    working: [
      `Taxable income = ${money(gross, 0)} − ${money(deductions, 0)} = ${money(taxable, 0)}`,
      ...taxWorking(taxable),
      `Net annual earnings after tax = ${money(gross, 0)} − ${money(tax)}`,
      `Net annual earnings after tax = ${money(net)}`
    ],
    space: SPACE_SIZES.LARGE
  });
}

function simpleInterestQuestion() {
  const principal = randInt(8, 90) * 100;
  const rate = choice([3, 4, 4.5, 5, 6, 6.5, 7, 7.5, 8, 9, 10]);
  const years = choice([2, 3, 4, 5, 6, 8, 10]);
  const interest = principal * decimalRate(rate) * years;

  return financialQuestion({
    type: "simple-interest",
    marks: 1,
    prompt: `Find the simple interest earned on ${money(principal, 0)} invested at ${percent(rate)} pa for ${years} years.`,
    answer: money(interest),
    working: [
      `I = Prn`,
      `I = ${money(principal, 0)} × ${rate / 100} × ${years}`,
      `I = ${money(interest)}`
    ],
    space: SPACE_SIZES.SMALL
  });
}

function simpleInterestTimeConversionQuestion() {
  const principal = randInt(12, 95) * 100;
  const rate = choice([4, 5, 6, 7, 8, 9, 10, 12]);
  const timeType = choice(["months", "weeks", "days"]);
  const timeValue = timeType === "months" ? choice([3, 4, 6, 8, 9, 18]) : timeType === "weeks" ? choice([6, 10, 13, 20, 26]) : choice([30, 45, 60, 90, 120, 180]);
  const n = timeType === "months" ? timeValue / 12 : timeType === "weeks" ? timeValue / 52 : timeValue / 365;
  const interest = principal * decimalRate(rate) * n;

  return financialQuestion({
    type: "simple-interest-time-conversion",
    marks: 2,
    prompt: `Find the simple interest earned on ${money(principal, 0)} invested at ${percent(rate)} pa for ${timeValue} ${timeType}.`,
    answer: money(interest),
    working: [
      `Convert the time to years: n = ${timeValue}/${timeType === "months" ? 12 : timeType === "weeks" ? 52 : 365}`,
      `n = ${n.toFixed(4)} years`,
      `I = Prn = ${money(principal, 0)} × ${rate / 100} × ${n.toFixed(4)}`,
      `I = ${money(interest)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function simpleInterestTotalAmountQuestion() {
  const principal = randInt(20, 120) * 100;
  const rate = choice([3.5, 4, 5, 6, 6.5, 7, 8, 9]);
  const years = choice([2, 3, 4, 5, 6]);
  const interest = principal * decimalRate(rate) * years;
  const total = principal + interest;

  return financialQuestion({
    type: "simple-interest-total-amount",
    marks: 2,
    prompt: `${money(principal, 0)} is invested at ${percent(rate)} pa simple interest for ${years} years.\nFind the total amount at the end of the investment.`,
    answer: money(total),
    working: [
      `I = Prn = ${money(principal, 0)} × ${rate / 100} × ${years}`,
      `I = ${money(interest)}`,
      `Total amount = principal + interest`,
      `Total amount = ${money(principal, 0)} + ${money(interest)} = ${money(total)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function simpleInterestFindVariableQuestion() {
  const target = choice(["principal", "rate", "time"]);
  const principal = randInt(20, 90) * 100;
  const rate = choice([4, 5, 6, 7, 8, 9]);
  const years = choice([2, 3, 4, 5]);
  const interest = principal * decimalRate(rate) * years;

  if (target === "principal") {
    return financialQuestion({
      type: "simple-interest-find-variable",
      marks: 2,
      prompt: `An investment earns ${money(interest)} simple interest over ${years} years at ${percent(rate)} pa.\nFind the principal invested.`,
      answer: money(principal, 0),
      working: [
        `I = Prn, so P = I ÷ (rn)`,
        `P = ${money(interest)} ÷ (${rate / 100} × ${years})`,
        `P = ${money(principal, 0)}`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  if (target === "rate") {
    return financialQuestion({
      type: "simple-interest-find-variable",
      marks: 2,
      prompt: `${money(principal, 0)} earns ${money(interest)} simple interest over ${years} years.\nFind the annual interest rate.`,
      answer: percent(rate),
      working: [
        `I = Prn, so r = I ÷ (Pn)`,
        `r = ${money(interest)} ÷ (${money(principal, 0)} × ${years})`,
        `r = ${rate / 100}`,
        `The annual interest rate is ${percent(rate)}.`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  return financialQuestion({
    type: "simple-interest-find-variable",
    marks: 2,
    prompt: `${money(principal, 0)} earns ${money(interest)} simple interest at ${percent(rate)} pa.\nFind the time of the investment in years.`,
    answer: `${years} years`,
    working: [
      `I = Prn, so n = I ÷ (Pr)`,
      `n = ${money(interest)} ÷ (${money(principal, 0)} × ${rate / 100})`,
      `n = ${years}`,
      `The investment time is ${years} years.`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function simpleInterestCompareQuestion() {
  const principal = randInt(20, 95) * 100;
  const years = choice([2, 3, 4, 5]);
  const rateA = choice([4, 5, 6, 7, 8]);
  const rateB = rateA + choice([0.5, 1, 1.5, 2]);
  const interestA = principal * decimalRate(rateA) * years;
  const interestB = principal * decimalRate(rateB) * years;
  const difference = Math.abs(interestB - interestA);

  return financialQuestion({
    type: "simple-interest-compare",
    marks: 2,
    prompt: `${money(principal, 0)} is invested for ${years} years.\nOption A earns simple interest at ${percent(rateA)} pa.\nOption B earns simple interest at ${percent(rateB)} pa.\nWhich option earns more interest, and by how much?`,
    answer: `Option B by ${money(difference)}`,
    working: [
      `Option A: I = ${money(principal, 0)} × ${rateA / 100} × ${years} = ${money(interestA)}`,
      `Option B: I = ${money(principal, 0)} × ${rateB / 100} × ${years} = ${money(interestB)}`,
      `Difference = ${money(interestB)} − ${money(interestA)} = ${money(difference)}`,
      `Option B earns more by ${money(difference)}.`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function simpleInterestTableGraphQuestion() {
  const principal = randInt(10, 60) * 100;
  const rate = choice([4, 5, 6, 7, 8]);
  const years = choice([3, 4, 5, 6]);
  const amount = principal * (1 + decimalRate(rate) * years);
  const interest = amount - principal;

  return financialQuestion({
    type: "simple-interest-table-graph",
    marks: 2,
    prompt: `The graph shows the amount in an account earning simple interest.\nFind the interest earned after ${years} years.`,
    diagram: financialDiagram({
      diagramType: "simple-interest-graph",
      principal,
      ratePercent: rate,
      years
    }),
    answer: money(interest),
    working: [
      `Amount after ${years} years = ${money(amount)}`,
      `Interest earned = amount − principal`,
      `Interest earned = ${money(amount)} − ${money(principal, 0)} = ${money(interest)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function buyingOnTermsQuestion() {
  const item = choice(ITEMS);
  const cashPrice = randInt(6, 35) * 100;
  const deposit = randInt(1, 8) * 50;
  const repayments = choice([12, 18, 24, 30, 36]);
  const payment = round((cashPrice - deposit) / repayments + randInt(5, 25), 2);
  const total = deposit + payment * repayments;
  const extra = total - cashPrice;

  return financialQuestion({
    type: "buying-on-terms",
    marks: 2,
    prompt: `A ${item} has a cash price of ${money(cashPrice, 0)}.\nIt can be bought on terms with a ${money(deposit, 0)} deposit and ${repayments} monthly repayments of ${money(payment)}.\nFind the total cost and the extra amount paid compared with the cash price.`,
    answer: `Total cost ${money(total)}; extra ${money(extra)}`,
    working: [
      `Total cost on terms = deposit + repayments`,
      `Total cost = ${money(deposit, 0)} + ${repayments} × ${money(payment)}`,
      `Total cost = ${money(total)}`,
      `Extra paid = ${money(total)} − ${money(cashPrice, 0)} = ${money(extra)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function comparePaymentOptionsQuestion() {
  const item = choice(ITEMS);
  const cashPrice = randInt(8, 40) * 100;
  const deposit = randInt(1, 6) * 100;
  const months = choice([12, 18, 24]);
  const monthly = round((cashPrice - deposit) / months + randInt(8, 22), 2);
  const planTotal = deposit + monthly * months;
  const bnplFee = randInt(6, 18) * 10;
  const bnplTotal = cashPrice + bnplFee;
  const best = cashPrice <= bnplTotal && cashPrice <= planTotal ? "cash" : bnplTotal <= planTotal ? "buy now, pay later" : "payment plan";
  const bestAmount = Math.min(cashPrice, bnplTotal, planTotal);

  return financialQuestion({
    type: "compare-payment-options",
    marks: 2,
    prompt: `A ${item} can be purchased using one of these options:\n• Cash price: ${money(cashPrice, 0)}\n• Payment plan: ${money(deposit, 0)} deposit plus ${months} monthly payments of ${money(monthly)}\n• Buy now, pay later: cash price plus ${money(bnplFee, 0)} in fees\nWhich option is cheapest?`,
    answer: `${best} option, ${money(bestAmount)}`,
    working: [
      `Cash price = ${money(cashPrice, 0)}`,
      `Payment plan = ${money(deposit, 0)} + ${months} × ${money(monthly)} = ${money(planTotal)}`,
      `Buy now, pay later = ${money(cashPrice, 0)} + ${money(bnplFee, 0)} = ${money(bnplTotal)}`,
      `The cheapest option is the ${best} option at ${money(bestAmount)}.`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function shortTermLoanQuestion() {
  const amount = randInt(3, 18) * 100;
  const fee = randInt(35, 120);
  const rate = choice([3, 4, 5, 6, 8]);
  const months = choice([1, 2, 3, 4, 6]);
  const interest = amount * decimalRate(rate) * months;
  const total = amount + fee + interest;

  return financialQuestion({
    type: "short-term-loans",
    marks: 2,
    prompt: `A short-term loan of ${money(amount, 0)} has an establishment fee of ${money(fee, 0)} and interest of ${percent(rate)} per month.\nFind the total amount to be repaid after ${months} months.`,
    answer: money(total),
    working: [
      `Interest = ${money(amount, 0)} × ${rate / 100} × ${months} = ${money(interest)}`,
      `Total repayment = loan amount + fee + interest`,
      `Total repayment = ${money(amount, 0)} + ${money(fee, 0)} + ${money(interest)}`,
      `Total repayment = ${money(total)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function bestFinancialOptionQuestion() {
  const amount = randInt(10, 60) * 100;
  const feeA = randInt(20, 100);
  const rateA = choice([3, 4, 5, 6]);
  const feeB = feeA + randInt(20, 90);
  const rateB = Math.max(1, rateA - choice([1, 2]));
  const months = choice([2, 3, 4, 6]);
  const totalA = amount + feeA + amount * decimalRate(rateA) * months;
  const totalB = amount + feeB + amount * decimalRate(rateB) * months;
  const best = totalA <= totalB ? "Option A" : "Option B";
  const difference = Math.abs(totalA - totalB);

  return financialQuestion({
    type: "best-financial-option",
    marks: 3,
    prompt: `A person needs to borrow ${money(amount, 0)} for ${months} months.\nOption A has a ${money(feeA, 0)} fee and interest of ${percent(rateA)} per month.\nOption B has a ${money(feeB, 0)} fee and interest of ${percent(rateB)} per month.\nWhich option costs less, and by how much?`,
    answer: `${best} by ${money(difference)}`,
    working: [
      `Option A total = ${money(amount, 0)} + ${money(feeA, 0)} + (${money(amount, 0)} × ${rateA / 100} × ${months}) = ${money(totalA)}`,
      `Option B total = ${money(amount, 0)} + ${money(feeB, 0)} + (${money(amount, 0)} × ${rateB / 100} × ${months}) = ${money(totalB)}`,
      `Difference = ${money(difference)}`,
      `${best} costs less by ${money(difference)}.`
    ],
    space: SPACE_SIZES.LARGE
  });
}

const GENERATORS = {
  "hourly-wages": hourlyWagesQuestion,
  "overtime-penalty-rates": overtimePenaltyQuestion,
  "salary-conversions": salaryConversionsQuestion,
  "pay-rise-percent-change": payRiseQuestion,
  "commission": commissionQuestion,
  "piecework-royalties": pieceworkRoyaltiesQuestion,
  "leave-loading": leaveLoadingQuestion,
  "taxable-income": taxableIncomeQuestion,
  "tax-payable-table": taxPayableQuestion,
  "net-earnings-after-tax": netEarningsAfterTaxQuestion,
  "simple-interest": simpleInterestQuestion,
  "simple-interest-time-conversion": simpleInterestTimeConversionQuestion,
  "simple-interest-total-amount": simpleInterestTotalAmountQuestion,
  "simple-interest-find-variable": simpleInterestFindVariableQuestion,
  "simple-interest-compare": simpleInterestCompareQuestion,
  "simple-interest-table-graph": simpleInterestTableGraphQuestion,
  "buying-on-terms": buyingOnTermsQuestion,
  "compare-payment-options": comparePaymentOptionsQuestion,
  "short-term-loans": shortTermLoanQuestion,
  "best-financial-option": bestFinancialOptionQuestion
};

export function getFinancialMathematicsAQuestionTypes() {
  return TYPE_LIST.map(type => ({ ...type }));
}

export function generateFinancialMathematicsAQuestions({
  count = 6,
  allowedTypes = []
} = {}) {
  const safeTypes = allowedTypes.filter(type => GENERATORS[type]);
  const plan = makeBalancedPlan(safeTypes, count);

  return plan.map(type => (GENERATORS[type] || GENERATORS["hourly-wages"])());
}
