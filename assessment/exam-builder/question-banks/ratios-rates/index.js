/*
  CHHS Exam Builder — Ratios and Rates Question Bank
  --------------------------------------------------
  Save as:

  question-banks/ratios-rates/index.js
*/

import {
  createQuestion,
  QUESTION_KINDS,
  SPACE_SIZES
} from "../../schemas/question.schema.js";

import {
  attachQuestionTranslations
} from "../../utils/translation.js";

const TOPIC = "Ratios and Rates";

const TYPE_LIST = [
  { id: "simplify-ratios", label: "Simplify ratios" },
  { id: "ratio-as-fraction", label: "Express part of a ratio as a fraction of the whole" },
  { id: "equivalent-ratios", label: "Equivalent ratios and missing values" },
  { id: "unitary-ratio-method", label: "Unitary method with ratios" },
  { id: "divide-in-ratio", label: "Divide a quantity in a given ratio" },
  { id: "divide-in-ratio-bar", label: "Divide in a ratio (bar model)" },
  { id: "scale-drawings", label: "Scale drawings" },
  { id: "rate-double-number-line", label: "Rates with a double number line" },
  { id: "real-life-ratio-problems", label: "Real-life ratio problems" },
  { id: "simplify-rates", label: "Represent information as a simplified rate" },
  { id: "convert-rates", label: "Convert between units for rates" },
  { id: "rate-problems", label: "Real-life rate problems" },
  { id: "best-buy-rates", label: "Best buys using rates" },
  { id: "speed-distance-time", label: "Speed, distance and time" },
  { id: "distance-time-read", label: "Read distance-time graphs" },
  { id: "distance-time-speed", label: "Calculate speed from distance-time graphs" },
  { id: "distance-time-interpret", label: "Interpret distance-time graphs" },
  { id: "distance-time-construct", label: "Construct distance-time graphs" },
  { id: "error-spot-ratio", label: "Spot the error (reasoning)" },
  { id: "true-false-ratio", label: "Ratios and rates: true or false (reasoning)" },
  { id: "multi-part-ratio", label: "Multi-part ratio problem" }
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

function randomId(prefix = "ratios-rates") {
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

function simplifyTwo(a, b) {
  const g = gcd(a, b);
  return { a: a / g, b: b / g, g };
}

function ratio2(a, b) {
  return `${a}:${b}`;
}

function ratio3(a, b, c) {
  return `${a}:${b}:${c}`;
}

function frac(n, d) {
  if (d === 1) return String(n);
  return `[[frac:${n}:${d}]]`;
}

function money(n) {
  return `$${Number(n).toFixed(2)}`;
}

function cleanNumber(n, dp = 2) {
  if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
  return Number(n.toFixed(dp)).toString();
}

function capitaliseFirst(value) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
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

function ratiosRatesQuestion({
  type,
  marks = 1,
  prompt,
  answer,
  working = [],
  diagram = null,
  space = SPACE_SIZES.MEDIUM
}) {
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
    tags: ["ratios rates", type]
  });
}

/* -----------------------------
   Ratio generators
----------------------------- */

function simplifyRatiosQuestion() {
  const withUnitConversion = Math.random() < 0.35;

  if (withUnitConversion) {
    const minutes = choice([15, 20, 30, 45, 90, 120]);
    const hours = choice([1, 2, 3]);
    const hourMinutes = hours * 60;
    const s = simplifyTwo(minutes, hourMinutes);

    return ratiosRatesQuestion({
      type: "simplify-ratios",
      marks: 2,
      prompt: `Simplify the ratio ${minutes} minutes : ${hours} hour${hours === 1 ? "" : "s"}.`,
      answer: ratio2(s.a, s.b),
      working: [
        `${hours} hour${hours === 1 ? "" : "s"} = ${hourMinutes} minutes`,
        `${minutes}:${hourMinutes} simplifies by dividing by ${s.g}.`,
        `Simplified ratio = ${ratio2(s.a, s.b)}`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  const a = randInt(2, 12);
  const b = randInt(2, 12);
  const factor = randInt(2, 8);
  const left = a * factor;
  const right = b * factor;
  const s = simplifyTwo(left, right);

  return ratiosRatesQuestion({
    type: "simplify-ratios",
    marks: 1,
    prompt: `Simplify the ratio ${left}:${right}.`,
    answer: ratio2(s.a, s.b),
    working: [
      `The highest common factor is ${s.g}.`,
      `${left}:${right} = ${ratio2(s.a, s.b)}`
    ],
    space: SPACE_SIZES.SMALL
  });
}

function ratioAsFractionQuestion() {
  const contexts = [
    ["red counters", "blue counters"],
    ["boys", "girls"],
    ["cats", "dogs"],
    ["wins", "losses"],
    ["green marbles", "yellow marbles"]
  ];

  const [partA, partB] = choice(contexts);
  const a = randInt(2, 8);
  const b = randInt(2, 8);
  const askA = Math.random() < 0.5;
  const total = a + b;

  return ratiosRatesQuestion({
    type: "ratio-as-fraction",
    marks: 1,
    prompt: `The ratio of ${partA} to ${partB} is ${a}:${b}. What fraction of the total is ${askA ? partA : partB}?`,
    answer: askA ? frac(a, total) : frac(b, total),
    working: [
      `Total parts = ${a} + ${b} = ${total}.`,
      `${askA ? partA : partB} make up ${askA ? a : b} out of ${total} parts.`
    ],
    space: SPACE_SIZES.SMALL
  });
}

function equivalentRatiosQuestion() {
  const a = randInt(2, 9);
  const b = randInt(2, 9);
  const factor = randInt(2, 8);
  const blank = "_______";
  const missingFirst = Math.random() < 0.5;

  if (missingFirst) {
    return ratiosRatesQuestion({
      type: "equivalent-ratios",
      marks: 1,
      prompt: `Complete the equivalent ratio: ${a}:${b} = ${blank}:${b * factor}.`,
      answer: String(a * factor),
      working: [`${b} × ${factor} = ${b * factor}`, `${a} × ${factor} = ${a * factor}`],
      space: SPACE_SIZES.NONE
    });
  }

  return ratiosRatesQuestion({
    type: "equivalent-ratios",
    marks: 1,
    prompt: `Complete the equivalent ratio: ${a}:${b} = ${a * factor}:${blank}.`,
    answer: String(b * factor),
    working: [`${a} × ${factor} = ${a * factor}`, `${b} × ${factor} = ${b * factor}`],
    space: SPACE_SIZES.NONE
  });
}

function unitaryRatioMethodQuestion() {
  const cordial = choice([1, 2, 3]);
  const water = choice([4, 5, 6, 7, 8]);
  const multiplier = randInt(3, 10);
  const givenWater = water * multiplier;
  const answer = cordial * multiplier;

  return ratiosRatesQuestion({
    type: "unitary-ratio-method",
    marks: 2,
    prompt: `A drink is mixed in the ratio cordial:water = ${cordial}:${water}.\nIf ${givenWater} cups of water are used, how many cups of cordial are needed?`,
    answer: `${answer} cups`,
    working: [
      `${water} parts of water corresponds to ${givenWater} cups.`,
      `1 part = ${givenWater} ÷ ${water} = ${multiplier} cups.`,
      `Cordial = ${cordial} × ${multiplier} = ${answer} cups.`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function divideInRatioQuestion() {
  const threePart = Math.random() < 0.35;

  if (threePart) {
    const a = randInt(1, 5);
    const b = randInt(2, 6);
    const c = randInt(2, 7);
    const totalParts = a + b + c;
    const valuePerPart = choice([4, 5, 6, 8, 10, 12]);
    const total = totalParts * valuePerPart;

    return ratiosRatesQuestion({
      type: "divide-in-ratio",
      marks: 2,
      prompt: `Divide ${total} students into groups in the ratio ${ratio3(a, b, c)}.`,
      answer: `${a * valuePerPart}, ${b * valuePerPart}, ${c * valuePerPart}`,
      working: [
        `Total parts = ${a} + ${b} + ${c} = ${totalParts}.`,
        `1 part = ${total} ÷ ${totalParts} = ${valuePerPart}.`,
        `Groups: ${a * valuePerPart}, ${b * valuePerPart}, ${c * valuePerPart}.`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  const a = randInt(1, 6);
  const b = randInt(2, 8);
  const totalParts = a + b;
  const valuePerPart = choice([4, 5, 6, 8, 10, 12, 15]);
  const total = totalParts * valuePerPart;

  return ratiosRatesQuestion({
    type: "divide-in-ratio",
    marks: 2,
    prompt: `Share ${money(total)} in the ratio ${a}:${b}.`,
    answer: `${money(a * valuePerPart)} and ${money(b * valuePerPart)}`,
    working: [
      `Total parts = ${a} + ${b} = ${totalParts}.`,
      `1 part = ${money(total)} ÷ ${totalParts} = ${money(valuePerPart)}.`,
      `Shares: ${money(a * valuePerPart)} and ${money(b * valuePerPart)}.`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function realLifeRatioProblemsQuestion() {
  if (Math.random() < 0.5) {
    const scale = choice([10000, 20000, 50000]);
    const mapCm = randInt(3, 12);
    const realCm = mapCm * scale;
    const realKm = realCm / 100000;

    return ratiosRatesQuestion({
      type: "real-life-ratio-problems",
      marks: 2,
      prompt: `A map uses a scale of 1:${scale}.\nA distance on the map is ${mapCm} cm. Find the real distance in kilometres.`,
      answer: `${cleanNumber(realKm)} km`,
      working: [
        `Real distance = ${mapCm} × ${scale} = ${realCm} cm.`,
        `${realCm} cm = ${cleanNumber(realKm)} km.`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  const flour = randInt(2, 6);
  const sugar = randInt(1, 4);
  const batches = randInt(3, 8);
  const flourUsed = flour * batches;
  const sugarNeeded = sugar * batches;

  return ratiosRatesQuestion({
    type: "real-life-ratio-problems",
    marks: 2,
    prompt: `A recipe uses flour:sugar in the ratio ${flour}:${sugar}.\nIf ${flourUsed} cups of flour are used, how many cups of sugar are needed?`,
    answer: `${sugarNeeded} cups`,
    working: [
      `${flour} parts of flour corresponds to ${flourUsed} cups.`,
      `1 part = ${flourUsed} ÷ ${flour} = ${batches} cups.`,
      `Sugar = ${sugar} × ${batches} = ${sugarNeeded} cups.`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

/* -----------------------------
   Rate generators
----------------------------- */

function simplifyRatesQuestion() {
  const templates = [
    () => {
      const minutes = choice([3, 4, 5, 6, 8, 10]);
      const pagesPerMinute = choice([8, 10, 12, 15, 20]);
      const pages = minutes * pagesPerMinute;
      return {
        prompt: `A printer prints ${pages} pages in ${minutes} minutes. Write this as a simplified rate.`,
        answer: `${pagesPerMinute} pages/min`,
        working: [`${pages} ÷ ${minutes} = ${pagesPerMinute}`, `Rate = ${pagesPerMinute} pages per minute.`]
      };
    },
    () => {
      const hours = choice([2, 3, 4, 5]);
      const speed = choice([40, 50, 60, 80, 90]);
      const distance = hours * speed;
      return {
        prompt: `A car travels ${distance} km in ${hours} hours. Write this as a simplified rate.`,
        answer: `${speed} km/h`,
        working: [`${distance} ÷ ${hours} = ${speed}`, `Rate = ${speed} km/h.`]
      };
    }
  ];

  const made = choice(templates)();

  return ratiosRatesQuestion({
    type: "simplify-rates",
    marks: 1,
    prompt: made.prompt,
    answer: made.answer,
    working: made.working,
    space: SPACE_SIZES.SMALL
  });
}

function convertRatesQuestion() {
  if (Math.random() < 0.5) {
    const kmh = choice([30, 60, 90, 120]);
    const mPerMin = kmh * 1000 / 60;

    return ratiosRatesQuestion({
      type: "convert-rates",
      marks: 2,
      prompt: `Convert ${kmh} km/h to m/min.`,
      answer: `${cleanNumber(mPerMin)} m/min`,
      working: [
        `${kmh} km = ${kmh * 1000} m.`,
        `1 hour = 60 minutes.`,
        `${kmh} km/h = ${kmh * 1000} ÷ 60 = ${cleanNumber(mPerMin)} m/min.`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  const ms = choice([2, 3, 4, 5, 6, 8, 10]);
  const mPerMin = ms * 60;

  return ratiosRatesQuestion({
    type: "convert-rates",
    marks: 2,
    prompt: `Convert ${ms} m/s to m/min.`,
    answer: `${mPerMin} m/min`,
    working: [
      `1 minute = 60 seconds.`,
      `${ms} m/s = ${ms} × 60 = ${mPerMin} m/min.`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function rateProblemsQuestion() {
  const templates = [
    () => {
      const litresPerMinute = choice([3, 4, 5, 6, 8, 10]);
      const knownMinutes = randInt(3, 8);
      const targetMinutes = randInt(9, 18);
      const litres = litresPerMinute * knownMinutes;
      const answer = litresPerMinute * targetMinutes;
      return {
        prompt: `A tap fills ${litres} L in ${knownMinutes} minutes. How many litres will it fill in ${targetMinutes} minutes?`,
        answer: `${answer} L`,
        working: [`Rate = ${litres} ÷ ${knownMinutes} = ${litresPerMinute} L/min.`, `${litresPerMinute} × ${targetMinutes} = ${answer} L.`]
      };
    },
    () => {
      const hourly = choice([18, 22, 25, 30, 35, 40]);
      const knownHours = randInt(3, 8);
      const targetHours = randInt(9, 14);
      const pay = hourly * knownHours;
      const answer = hourly * targetHours;
      return {
        prompt: `A worker earns ${money(pay)} for ${knownHours} hours. How much would they earn for ${targetHours} hours?`,
        answer: money(answer),
        working: [`Hourly rate = ${money(pay)} ÷ ${knownHours} = ${money(hourly)} per hour.`, `${money(hourly)} × ${targetHours} = ${money(answer)}.`]
      };
    }
  ];

  const made = choice(templates)();

  return ratiosRatesQuestion({
    type: "rate-problems",
    marks: 2,
    prompt: made.prompt,
    answer: made.answer,
    working: made.working,
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

function bestBuyRatesQuestion() {
  const made = makeBestBuyScenario();

  return ratiosRatesQuestion({
    type: "best-buy-rates",
    marks: 2,
    prompt: made.prompt,
    answer: made.answer,
    working: made.working,
    space: SPACE_SIZES.MEDIUM
  });
}

function speedDistanceTimeQuestion() {
  const mode = choice(["speed", "distance", "time"]);

  if (mode === "speed") {
    const time = choice([2, 3, 4, 5]);
    const speed = choice([40, 50, 60, 80, 90]);
    const distance = time * speed;

    return ratiosRatesQuestion({
      type: "speed-distance-time",
      marks: 2,
      prompt: `A cyclist travels ${distance} km in ${time} hours.\nFind the average speed.`,
      answer: `${speed} km/h`,
      working: [`Speed = distance ÷ time`, `${distance} ÷ ${time} = ${speed} km/h.`],
      space: SPACE_SIZES.MEDIUM
    });
  }

  if (mode === "distance") {
    const time = choice([2, 3, 4, 5]);
    const speed = choice([40, 50, 60, 80, 90]);
    const distance = time * speed;

    return ratiosRatesQuestion({
      type: "speed-distance-time",
      marks: 2,
      prompt: `A car travels at ${speed} km/h for ${time} hours.\nHow far does it travel?`,
      answer: `${distance} km`,
      working: [`Distance = speed × time`, `${speed} × ${time} = ${distance} km.`],
      space: SPACE_SIZES.MEDIUM
    });
  }

  const time = choice([2, 3, 4, 5]);
  const speed = choice([40, 50, 60, 80, 90]);
  const distance = time * speed;

  return ratiosRatesQuestion({
    type: "speed-distance-time",
    marks: 2,
    prompt: `A bus travels ${distance} km at ${speed} km/h.\nHow long does it take?`,
    answer: `${time} hours`,
    working: [`Time = distance ÷ speed`, `${distance} ÷ ${speed} = ${time} hours.`],
    space: SPACE_SIZES.MEDIUM
  });
}

/* -----------------------------
   Distance-time graphs
----------------------------- */

function stepTime(values) {
  return choice(values);
}

function buildGraphTemplateA() {
  const t1 = stepTime([10, 15]);
  const stop1 = stepTime([5, 10]);
  const t2 = stepTime([10, 15, 20]);
  const stop2 = stepTime([5, 10]);
  const t3 = stepTime([10, 15, 20]);

  const d1 = choice([80, 100, 120, 150]);
  const d2 = d1 + choice([60, 80, 100, 120, 150]);

  const p1 = { x: t1, y: d1 };
  const p2 = { x: t1 + stop1, y: d1 };
  const p3 = { x: p2.x + t2, y: d2 };
  const p4 = { x: p3.x + stop2, y: d2 };
  const p5 = { x: p4.x + t3, y: 0 };

  return {
    points: [{ x: 0, y: 0 }, p1, p2, p3, p4, p5],
    description: `a person walks ${d1} m from home in ${t1} minutes, stops for ${stop1} minutes, walks further to ${d2} m from home in ${t2} minutes, stops for ${stop2} minutes, then returns home in ${t3} minutes`
  };
}

function buildGraphTemplateB() {
  const t1 = stepTime([10, 15]);
  const stop1 = stepTime([5, 10]);
  const t2 = stepTime([10, 15]);
  const stop2 = stepTime([5, 10]);
  const t3 = stepTime([10, 15]);

  const d1 = choice([120, 150, 180, 200]);
  const d2 = choice([40, 60, 80, 100]);
  const d3 = d2 + choice([60, 80, 100, 120]);

  const p1 = { x: t1, y: d1 };
  const p2 = { x: t1 + stop1, y: d1 };
  const p3 = { x: p2.x + t2, y: d2 };
  const p4 = { x: p3.x + stop2, y: d2 };
  const p5 = { x: p4.x + t3, y: 0 };

  return {
    points: [{ x: 0, y: 0 }, p1, p2, p3, p4, p5],
    description: `a person walks ${d1} m from home in ${t1} minutes, stops for ${stop1} minutes, walks back until they are ${d2} m from home in ${t2} minutes, stops for ${stop2} minutes, then returns home in ${t3} minutes`
  };
}

function buildGraphTemplateC() {
  const t1 = stepTime([5, 10]);
  const t2 = stepTime([10, 15]);
  const stop1 = stepTime([5, 10]);
  const t3 = stepTime([10, 15]);

  const d1 = choice([50, 80, 100]);
  const d2 = d1 + choice([100, 120, 150, 180]);
  const d3 = d2 + choice([40, 50, 60, 80]);

  const p1 = { x: t1, y: d1 };
  const p2 = { x: t1 + t2, y: d2 };
  const p3 = { x: p2.x + stop1, y: d2 };
  const p4 = { x: p3.x + t3, y: d3 };
  const p5 = { x: p4.x + stepTime([10, 15, 20]), y: 0 };

  return {
    points: [{ x: 0, y: 0 }, p1, p2, p3, p4, p5],
    description: `a person walks ${d1} m from home in ${t1} minutes, continues until they are ${d2} m from home after another ${t2} minutes, stops for ${stop1} minutes, walks further to ${d3} m from home in ${t3} minutes, then returns home in ${p5.x - p4.x} minutes`
  };
}

function finaliseGraph(raw) {
  const maxY = Math.max(...raw.points.map(p => p.y));
  const lastX = raw.points[raw.points.length - 1].x;
  return {
    xMax: Math.ceil(lastX / 10) * 10,
    yMax: Math.max(200, Math.ceil(maxY / 100) * 100),
    xStep: 10,
    yStep: maxY <= 250 ? 50 : 100,
    points: raw.points,
    description: raw.description
  };
}

function makeDistanceTimeGraph() {
  const builder = choice([
    buildGraphTemplateA,
    buildGraphTemplateB,
    buildGraphTemplateC
  ]);
  return finaliseGraph(builder());
}

function distanceTimeDiagram(graph, mode = "completed") {
  return {
    engine: "rates-engine",
    config: {
      diagramType: "distance-time",
      mode,
      xLabel: "Time (minutes)",
      yLabel: "Distance from home (m)",
      xMax: graph.xMax,
      yMax: graph.yMax,
      xStep: graph.xStep,
      yStep: graph.yStep,
      xMinorStep: 5,
      yMinorStep: graph.yStep / 2,
      points: mode === "completed" ? graph.points : [],
      answerPoints: graph.points
    }
  };
}

function distanceTimeReadQuestion() {
  const graph = makeDistanceTimeGraph();
  const point = choice(graph.points.slice(1, -1));

  return ratiosRatesQuestion({
    type: "distance-time-read",
    marks: 1,
    prompt: `Use the distance-time graph below to answer the question below.\nHow far from home was the person after ${point.x} minutes?`,
    diagram: distanceTimeDiagram(graph),
    answer: `${point.y} m`,
    working: [`At ${point.x} minutes, the graph shows ${point.y} m from home.`],
    space: SPACE_SIZES.SMALL
  });
}

function distanceTimeSpeedQuestion() {
  const graph = makeDistanceTimeGraph();
  const segments = [];

  for (let i = 0; i < graph.points.length - 1; i++) {
    const a = graph.points[i];
    const b = graph.points[i + 1];
    const dt = b.x - a.x;
    const dd = Math.abs(b.y - a.y);
    if (dt > 0 && dd > 0) {
      segments.push({ a, b, speed: dd / dt });
    }
  }

  const seg = choice(segments);

  return ratiosRatesQuestion({
    type: "distance-time-speed",
    marks: 2,
    prompt: `Use the distance-time graph below to answer the question below.\nFind the average speed between ${seg.a.x} and ${seg.b.x} minutes.`,
    diagram: distanceTimeDiagram(graph),
    answer: `${cleanNumber(seg.speed)} m/min`,
    working: [
      `Change in distance = |${seg.b.y} − ${seg.a.y}| = ${Math.abs(seg.b.y - seg.a.y)} m.`,
      `Change in time = ${seg.b.x} − ${seg.a.x} = ${seg.b.x - seg.a.x} minutes.`,
      `Speed = ${Math.abs(seg.b.y - seg.a.y)} ÷ ${seg.b.x - seg.a.x} = ${cleanNumber(seg.speed)} m/min.`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function distanceTimeInterpretQuestion() {
  const graph = makeDistanceTimeGraph();
  const flatSegments = [];

  for (let i = 0; i < graph.points.length - 1; i++) {
    const a = graph.points[i];
    const b = graph.points[i + 1];
    if (a.y === b.y) flatSegments.push({ a, b });
  }

  const intervals = flatSegments.map(seg => `${seg.a.x} to ${seg.b.x} minutes`);
  const plural = intervals.length > 1;

  return ratiosRatesQuestion({
    type: "distance-time-interpret",
    marks: plural ? 2 : 1,
    prompt: `Use the distance-time graph below to answer the question below.\n${plural ? "During which time intervals was the person stopped?" : "During which time interval was the person stopped?"}`,
    diagram: distanceTimeDiagram(graph),
    answer: intervals.join("; "),
    working: [
      `A horizontal line means the distance did not change.`,
      plural
        ? `The person was stopped from ${intervals.join(" and from ")}.`
        : `The person was stopped from ${intervals[0]}.`
    ],
    space: SPACE_SIZES.SMALL
  });
}

function distanceTimeConstructQuestion() {
  const graph = makeDistanceTimeGraph();

  return ratiosRatesQuestion({
    type: "distance-time-construct",
    marks: 2,
    prompt: `Construct a distance-time graph for this journey.\n${capitaliseFirst(graph.description)}.`,
    diagram: distanceTimeDiagram(graph, "blank"),
    answer: "Graph should match the described journey.",
    working: [
      `Plot the key points from the description and join them with straight-line segments.`,
      `Make sure any stop is shown by a horizontal segment and any return journey is shown by a decreasing segment.`
    ],
    space: SPACE_SIZES.NONE
  });
}

// ── Divide in a ratio with a bar model (diagram) ─────────

function divideInRatioBarQuestion() {
  const a = randInt(1, 4);
  const b = randInt(2, 5);
  const totalParts = a + b;
  const valuePerPart = choice([4, 5, 6, 8, 10, 12]);
  const total = totalParts * valuePerPart;

  return ratiosRatesQuestion({
    type: "divide-in-ratio-bar",
    marks: 2,
    prompt: `The bar model shows ${money(total)} shared in the ratio ${a}:${b}. Find each share.`,
    diagram: {
      engine: "rates-engine",
      caption: "Each cell is one equal part.",
      config: {
        diagramType: "ratio-bar",
        parts: [{ label: "A", units: a }, { label: "B", units: b }],
        totalLabel: money(total)
      }
    },
    answer: `A = ${money(a * valuePerPart)}, B = ${money(b * valuePerPart)}`,
    working: [
      `Total parts = ${a} + ${b} = ${totalParts}.`,
      `1 part = ${money(total)} ÷ ${totalParts} = ${money(valuePerPart)}.`,
      `A = ${money(a * valuePerPart)}, B = ${money(b * valuePerPart)}.`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

// ── Scale drawings (6C) ──────────────────────────────────

function scaleDrawingsQuestion() {
  const scale = choice([50, 100, 200, 500]);
  const planLenCm = choice([4, 5, 6, 8]);
  const planWidCm = choice([3, 4, 5]);
  const realLenCm = planLenCm * scale;
  const realWidCm = planWidCm * scale;
  const realLenM = realLenCm / 100;
  const realWidM = realWidCm / 100;
  const toReal = Math.random() < 0.6;

  if (toReal) {
    return ratiosRatesQuestion({
      type: "scale-drawings",
      marks: 2,
      prompt: `A floor plan is drawn to a scale of 1:${scale}. On the plan a room is ${planLenCm} cm long. How long is the real room, in metres?`,
      diagram: {
        engine: "rates-engine",
        config: { diagramType: "scale-drawing", title: "Floor plan", lengthLabel: `${planLenCm} cm`, widthLabel: `${planWidCm} cm`, scale: `1:${scale}` }
      },
      answer: `${cleanNumber(realLenM)} m`,
      working: [
        `Real length = ${planLenCm} cm × ${scale} = ${realLenCm} cm.`,
        `${realLenCm} cm = ${cleanNumber(realLenM)} m.`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  return ratiosRatesQuestion({
    type: "scale-drawings",
    marks: 2,
    prompt: `A room is ${cleanNumber(realLenM)} m long. It is drawn on a plan to a scale of 1:${scale}. How long is the room on the plan, in centimetres?`,
    diagram: {
      engine: "rates-engine",
      config: { diagramType: "scale-drawing", title: "Floor plan", lengthLabel: "? cm", widthLabel: `${planWidCm} cm`, scale: `1:${scale}` }
    },
    answer: `${planLenCm} cm`,
    working: [
      `Real length = ${cleanNumber(realLenM)} m = ${realLenCm} cm.`,
      `Plan length = ${realLenCm} cm ÷ ${scale} = ${planLenCm} cm.`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

// ── Rates with a double number line (diagram) ────────────

function rateDoubleNumberLineQuestion() {
  const unitsBought = choice([2, 3, 4, 5]);
  const unitCost = choice([2, 3, 4, 6]);
  const cost = unitsBought * unitCost;
  const target = unitsBought + choice([1, 2, 3]);
  const targetCost = target * unitCost;
  const maxUnits = target;
  const ticks = maxUnits;

  return ratiosRatesQuestion({
    type: "rate-double-number-line",
    marks: 2,
    prompt: `${unitsBought} drinks cost ${money(cost)}. Use the double number line to find the cost of ${target} drinks.`,
    diagram: {
      engine: "rates-engine",
      config: { diagramType: "double-number-line", topLabel: "drinks", bottomLabel: "cost ($)", topMax: maxUnits, bottomMax: maxUnits * unitCost, ticks }
    },
    answer: money(targetCost),
    working: [
      `1 drink costs ${money(cost)} ÷ ${unitsBought} = ${money(unitCost)}.`,
      `${target} drinks cost ${target} × ${money(unitCost)} = ${money(targetCost)}.`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

// ── Reasoning: spot the error ────────────────────────────

function errorSpotRatioQuestion() {
  const scenarios = [
    () => { const k = choice([2, 3, 4]); const a = 2 * k, b = 3 * k; return { wrong: `${a}:${b} simplifies to ${a / 2}:${b / 2}`, issue: "divide both parts by the HCF, not just by 2", correct: "2:3" }; },
    () => { return { wrong: `In the ratio 2:3, the first quantity is 2/3 of the total`, issue: "it is 2 out of 2+3 = 5 parts", correct: "2/5 of the total" }; },
    () => { const d = choice([2, 4, 5]); return { wrong: `${d} km in ${d} min is a speed of 1 km/h`, issue: "convert minutes to hours first", correct: "60 km/h" }; }
  ];
  const s = choice(scenarios)();
  const distractors = shuffle([s.correct, "3:2", "1:1", "5:3", "2/3 of the total", "30 km/h"])
    .filter(d => d !== undefined);
  const choices = [s.correct, ...distractors.filter(d => d !== s.correct)].slice(0, 4);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "error-spot-ratio",
    kind: QUESTION_KINDS.MULTIPLE_CHOICE,
    marks: 1,
    prompt: `A student wrote:  ${s.wrong}\nThis is incorrect. What is the correct answer?`,
    choices: shuffle(choices),
    answer: s.correct,
    working: [`The error: ${s.issue}.`, `Correct answer: ${s.correct}.`],
    space: SPACE_SIZES.NONE,
    tags: ["ratios rates", "reasoning", "error analysis"]
  });
}

function trueFalseRatioQuestion() {
  const items = [
    { stmt: "The ratio 2:3 is the same as the ratio 3:2.", val: false, reason: "Order matters in a ratio, so 2:3 ≠ 3:2." },
    { stmt: "The ratio 4:6 simplifies to 2:3.", val: true, reason: "Divide both parts by the HCF, 2." },
    { stmt: "A rate of 60 km/h is the same as 1 km/min.", val: true, reason: "60 km in 60 min = 1 km/min." },
    { stmt: "In the ratio 1:4, one part out of five is the first quantity.", val: true, reason: "Total = 1 + 4 = 5 parts." },
    { stmt: "A unit rate always has 1 in the second quantity.", val: true, reason: "A unit rate is per one unit, e.g. $/kg." }
  ];
  const it = choice(items);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "true-false-ratio",
    marks: 1,
    prompt: `True or false? ${it.stmt}  (Give a reason.)`,
    answer: it.val ? "True" : "False",
    working: [it.reason],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["ratios rates", "reasoning", "true false"]
  });
}

function multiPartRatioQuestion() {
  // Recipe scaling.
  const flour = choice([2, 3, 4]);     // cups per batch
  const sugar = choice([1, 2]);
  const batchServes = choice([4, 6]);
  const wantServes = batchServes * choice([2, 3]);
  const factor = wantServes / batchServes;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "multi-part-ratio",
    marks: 3,
    prompt: `A muffin recipe for ${batchServes} muffins uses flour and sugar in the ratio ${flour}:${sugar} (in cups).`,
    subparts: [
      { label: "(a)", prompt: `How many cups of flour and sugar are used in total for one batch?`, marks: 1, answer: `${flour + sugar} cups`, working: [`${flour} + ${sugar} = ${flour + sugar} cups.`] },
      { label: "(b)", prompt: `You want to make ${wantServes} muffins. By what factor must you scale the recipe?`, marks: 1, answer: `× ${factor}`, working: [`${wantServes} ÷ ${batchServes} = ${factor}.`] },
      { label: "(c)", prompt: `How many cups of flour are needed for ${wantServes} muffins?`, marks: 1, answer: `${flour * factor} cups`, working: [`${flour} × ${factor} = ${flour * factor} cups.`] }
    ],
    answer: `(a) ${flour + sugar} cups; (b) × ${factor}; (c) ${flour * factor} cups`,
    working: [],
    space: SPACE_SIZES.NONE,
    mcEligible: false,
    tags: ["ratios rates", "multi-part", "real-world"]
  });
}

const GENERATORS = {
  "simplify-ratios": simplifyRatiosQuestion,
  "ratio-as-fraction": ratioAsFractionQuestion,
  "equivalent-ratios": equivalentRatiosQuestion,
  "unitary-ratio-method": unitaryRatioMethodQuestion,
  "divide-in-ratio": divideInRatioQuestion,
  "divide-in-ratio-bar": divideInRatioBarQuestion,
  "scale-drawings": scaleDrawingsQuestion,
  "rate-double-number-line": rateDoubleNumberLineQuestion,
  "real-life-ratio-problems": realLifeRatioProblemsQuestion,
  "simplify-rates": simplifyRatesQuestion,
  "convert-rates": convertRatesQuestion,
  "rate-problems": rateProblemsQuestion,
  "best-buy-rates": bestBuyRatesQuestion,
  "speed-distance-time": speedDistanceTimeQuestion,
  "distance-time-read": distanceTimeReadQuestion,
  "distance-time-speed": distanceTimeSpeedQuestion,
  "distance-time-interpret": distanceTimeInterpretQuestion,
  "distance-time-construct": distanceTimeConstructQuestion,
  "error-spot-ratio": errorSpotRatioQuestion,
  "true-false-ratio": trueFalseRatioQuestion,
  "multi-part-ratio": multiPartRatioQuestion
};

export function getRatiosRatesQuestionTypes() {
  return TYPE_LIST.slice();
}

export function generateRatiosRatesQuestions({ count = 8, allowedTypes = null } = {}) {
  const typeIds = Array.isArray(allowedTypes) && allowedTypes.length
    ? allowedTypes.filter(id => GENERATORS[id])
    : TYPE_LIST.map(t => t.id);

  const plan = makeBalancedPlan(typeIds, count);
  return plan.map(type => GENERATORS[type]()).map(attachQuestionTranslations);
}
