import { randInt, pick, gcd, makeQuestion } from "../../../helpers.js";

/**
 * STAGE 4 · Ratios & Rates — NATIVE skills (Phase 3A, expanded 3A2 after
 * teacher review + the NSW content statements; question styles adapted from
 * the CHHS Exam-Builder ratio/rates bank).
 *
 * Coverage:
 *   Recognise & simplify ratios .... simplifyRatio, mixedUnitRatio, ratioAsFraction
 *   Solve ratio problems ........... equivalentRatios, dividingQuantity,
 *                                    unitaryMethod, mapScale, ratioTables
 *   Recognise & simplify rates ..... unitRates, convertRates
 *   Solve rate problems ............ unitRates, bestBuy
 *   Distance–time graphs ........... distanceTimeRead, distanceTimeSpeed
 *
 * Input notes (the simple input rejects ":" and the touch keypad has no ":"):
 *   - Ratio answers use the RATIO mode — one box per part with colons between.
 *   - Prompts put each sentence on its own line ("\n"; .question-prompt is
 *     white-space: pre-line).
 *   - Money answers are asked "in dollars"/"how many dollars" → plain number.
 */
const SYL = "MA4-RAT";

// ---- tiny shared helpers ----------------------------------------------------

// A coprime pair a:b (a ≠ b), each ≤ maxBase.
function coprimePair(maxBase) {
  let a, b;
  do {
    a = randInt(1, maxBase);
    b = randInt(1, maxBase);
  } while (a === b || gcd(a, b) !== 1);
  return [a, b];
}

// A coprime triple (overall HCF 1, not all equal, each ≤ maxBase).
function coprimeTriple(maxBase) {
  let a, b, c;
  do {
    a = randInt(1, maxBase);
    b = randInt(1, maxBase);
    c = randInt(1, maxBase);
  } while (gcd(gcd(a, b), c) !== 1 || (a === b && b === c));
  return [a, b, c];
}

// Non-breaking ratio text — a ratio like "12 : 18" must NEVER wrap across
// lines (teacher feedback, 3A2), so its internal spaces are non-breaking.
const NB = "\u00A0"; // non-breaking space
const ratioText = (parts) => parts.join(`${NB}:${NB}`);

// Parse a fraction answer "a/b" (also tolerates "\frac{a}{b}" and spaces).
function parseFrac(input) {
  const s = String(input ?? "")
    .replace(/\\frac\{(-?\d+)\}\{(-?\d+)\}/g, "$1/$2")
    .replace(/\s+/g, "");
  const m = s.match(/^(-?\d+)\/(-?\d+)$/);
  if (!m) return null;
  const d = Number(m[2]);
  return d === 0 ? null : { n: Number(m[1]), d };
}

// Counts as words for readable prices/packs ("four pens", "twelve muffins").
const COUNT_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
  "nine", "ten", "eleven", "twelve",
];
const countWord = (n) => COUNT_WORDS[n] || String(n);

const dollars = (cents) => `$${(cents / 100).toFixed(2)}`;

// ---- 1. Ratios on a Double Number Line (diagram) ---------------------------

const LINE_CONTEXTS = [
  { top: "servings", bottom: "cups of rice", question: (m) => `How many cups of rice are needed for ${m} servings?` },
  { top: "hours", bottom: "km travelled", question: (m) => `How far does the cyclist travel in ${m} hours?` },
  { top: "tickets", bottom: "cost ($)", question: (m) => `How many dollars do ${m} tickets cost?` },
];

export const ratioDoubleLine = {
  id: "ratioDoubleLine",
  name: "Ratios on a Double Number Line",
  syllabusArea: SYL,
  prerequisiteSkillIds: [],
  nextSkillIds: ["simplifyRatio"],

  generate(level) {
    const ctx = pick(LINE_CONTEXTS);
    const ticks = 4;
    const topMax = pick(level <= 2 ? [4, 8] : [8, 12, 20]);
    // Rate per ONE top unit; levels 4–5 allow a .5 rate (topMax stays even so
    // every tick value is tidy).
    const rate = level >= 4 && Math.random() < 0.5 ? randInt(2, 6) + 0.5 : randInt(2, level <= 2 ? 6 : 9);
    const bottomMax = topMax * rate;
    const markIndex = randInt(1, ticks - 1); // an interior tick, never 0 / max
    const mark = (topMax / ticks) * markIndex;
    const answer = mark * rate;

    return makeQuestion({
      topic: "ratioDoubleLine",
      text: `The number line shows ${ctx.top} (above) and ${ctx.bottom} (below).\n${ctx.question(mark)}`,
      answer,
      feedback: `${topMax} ${ctx.top} ↔ ${bottomMax} ${ctx.bottom}, so 1 ${ctx.top.replace(/s$/, "")} ↔ ${rate}. Then ${mark} × ${rate} = ${answer}.`,
      inputMode: "simple",
      diagramType: "doubleNumberLine",
      diagramData: {
        topLabel: ctx.top,
        bottomLabel: ctx.bottom,
        topMax,
        bottomMax,
        ticks,
        markPercent: mark, // the marked value on the TOP scale
      },
    });
  },
};

// ---- 2. Simplify Ratios (ratio boxes a : b) ---------------------------------

export const simplifyRatio = {
  id: "simplifyRatio",
  name: "Simplify Ratios",
  syllabusArea: SYL,
  prerequisiteSkillIds: [],
  nextSkillIds: ["equivalentRatios"],

  generate(level) {
    const maxBase = level <= 1 ? 5 : level === 2 ? 6 : level === 3 ? 9 : 12;
    const k = randInt(2, level <= 2 ? 4 : level === 3 ? 6 : 9);
    const threeTerm = level >= 4 && Math.random() < 0.5;

    const parts = threeTerm ? coprimeTriple(maxBase) : coprimePair(maxBase);
    const scaled = parts.map((p) => p * k);

    return makeQuestion({
      topic: "simplifyRatio",
      text: `Simplify the ratio ${ratioText(scaled)}.`,
      answer: parts.join(" : "),
      feedback: `Divide every part by the HCF ${k}: ${ratioText(scaled)} = ${ratioText(parts)}.`,
      answerMode: "ratio",
      ratioParts: parts.map(String),
    });
  },
};

// ---- 3. Mixed-unit Ratios (same units first, then simplify; ratio boxes) ----

const UNIT_PAIRS = [
  { small: "minutes", big: "hour", factor: 60, smalls: [15, 20, 30, 45, 90], bigs: [1, 2, 3] },
  { small: "cm", big: "m", factor: 100, smalls: [20, 25, 50, 75, 150], bigs: [1, 2, 3] },
  { small: "g", big: "kg", factor: 1000, smalls: [200, 250, 400, 500, 750], bigs: [1, 2] },
  { small: "mL", big: "L", factor: 1000, smalls: [200, 250, 400, 500, 750], bigs: [1, 2] },
  { small: "cents", big: "dollar", factor: 100, smalls: [20, 25, 50, 75], bigs: [1, 2] },
];

export const mixedUnitRatio = {
  id: "mixedUnitRatio",
  name: "Ratios with Different Units",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["simplifyRatio"],
  nextSkillIds: ["ratioAsFraction"],

  generate(level) {
    const u = pick(level <= 2 ? UNIT_PAIRS.slice(0, 2) : UNIT_PAIRS);
    const s = pick(u.smalls);
    const bigN = pick(level <= 2 ? [1] : u.bigs);
    const A = s;
    const B = bigN * u.factor;
    const h = gcd(A, B);
    const parts = [A / h, B / h];

    // The whole ratio expression uses non-breaking spaces so it never wraps.
    const bigText = `${bigN}${NB}${u.big}${bigN === 1 ? "" : "s"}`;
    const smallText = `${s}${NB}${u.small}`;
    // Levels 4–5 sometimes put the larger unit first.
    const reversed = level >= 4 && Math.random() < 0.5;
    const text = reversed
      ? `Simplify the ratio ${bigText}${NB}:${NB}${smallText}.`
      : `Simplify the ratio ${smallText}${NB}:${NB}${bigText}.`;
    const ansParts = reversed ? [parts[1], parts[0]] : parts;

    return makeQuestion({
      topic: "mixedUnitRatio",
      text,
      answer: ansParts.join(" : "),
      feedback: `Write both in ${u.small} first: ${bigText} = ${B}${NB}${u.small}. Then ${reversed ? ratioText([B, A]) : ratioText([A, B])} ÷ ${h} = ${ratioText(ansParts)}.`,
      answerMode: "ratio",
      ratioParts: ansParts.map(String),
    });
  },
};

// ---- 4. Part of a Ratio as a Fraction ---------------------------------------

const FRACTION_CONTEXTS = [
  { a: "boys", b: "girls", whole: "class", wholeShort: "class" },
  { a: "cats", b: "dogs", whole: "group of animals", wholeShort: "group" },
  { a: "red marbles", b: "blue marbles", whole: "bag of marbles", wholeShort: "bag" },
  { a: "apples", b: "oranges", whole: "fruit bowl", wholeShort: "bowl" },
];

export const ratioAsFraction = {
  id: "ratioAsFraction",
  name: "Ratio Part as a Fraction",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["simplifyRatio"],
  nextSkillIds: ["dividingQuantity"],

  generate(level) {
    const ctx = pick(FRACTION_CONTEXTS);
    const [a, b] = coprimePair(level <= 2 ? 5 : 9);
    const askFirst = pick([true, false]);
    const part = askFirst ? a : b;
    const who = askFirst ? ctx.a : ctx.b;
    const total = a + b;
    const answer = `${part}/${total}`; // coprime pair ⇒ already simplest form

    // MATH input (the MathLive fraction editor, like the FDP fraction skills),
    // with a simplest-form-only check: 6/14 is NOT accepted for 3/7.
    const q = makeQuestion({
      topic: "ratioAsFraction",
      text: `In a ${ctx.whole}, the ratio of ${ctx.a} to ${ctx.b} is ${ratioText([a, b])}.\nWhat fraction of the whole ${ctx.wholeShort} are ${who}?\nGive your answer as a fraction in simplest form.`,
      answer,
      feedback: `There are ${a} + ${b} = ${total} parts in total, and ${who} make up ${part} of them: ${answer}.`,
      inputMode: "math",
    });
    q.check = (input) => {
      const f = parseFrac(input);
      return Boolean(f && f.n === part && f.d === total);
    };
    return q;
  },
};

// ---- 5. Equivalent Ratios (find the missing value) --------------------------

export const equivalentRatios = {
  id: "equivalentRatios",
  name: "Equivalent Ratios",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["simplifyRatio"],
  nextSkillIds: ["dividingQuantity"],

  generate(level) {
    const maxBase = level <= 2 ? 6 : 9;
    const k = randInt(2, level <= 1 ? 4 : level === 2 ? 6 : level === 3 ? 9 : 12);
    const [a, b] = coprimePair(maxBase);
    const values = [a, b, a * k, b * k];
    // Levels 1–2: the missing value is on the scaled (right) side; 3+ anywhere.
    const missing = level <= 2 ? pick([2, 3]) : randInt(0, 3);
    const shown = values.map((v, i) => (i === missing ? "?" : v));

    return makeQuestion({
      topic: "equivalentRatios",
      text: `Find the missing value:\n${ratioText([shown[0], shown[1]])}${NB}=${NB}${ratioText([shown[2], shown[3]])}`,
      answer: values[missing],
      feedback:
        missing >= 2
          ? `Both parts are multiplied by ${k}: the missing value is ${values[missing]}.`
          : `Both parts are divided by ${k} to simplify: the missing value is ${values[missing]}.`,
      inputMode: "simple",
    });
  },
};

// ---- 6. Dividing a Quantity in a Ratio --------------------------------------

const SHARE_CONTEXTS = [
  { kind: "money", verb: "is", what: (n) => `$${n}`, fmt: (n) => `$${n}` },
  { kind: "lollies", verb: "are", what: (n) => `${n} lollies`, fmt: (n) => `${n} lollies` },
  { kind: "marbles", verb: "are", what: (n) => `${n} marbles`, fmt: (n) => `${n} marbles` },
  { kind: "minutes", verb: "is", what: (n) => `${n} minutes`, fmt: (n) => `${n} minutes` },
];
const NAMES3 = [
  ["Ava", "Ben", "Cate"],
  ["Jack", "Mia", "Noah"],
  ["Ruby", "Sam", "Tom"],
];

export const dividingQuantity = {
  id: "dividingQuantity",
  name: "Dividing a Quantity in a Ratio",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["equivalentRatios"],
  nextSkillIds: ["unitaryMethod"],

  generate(level) {
    const ctx = pick(SHARE_CONTEXTS);
    const unit = randInt(2, level <= 2 ? 6 : level === 3 ? 9 : 15);

    // Level 5: a three-way split, answered part by part (multiPart).
    if (level >= 5) {
      const [a, b, c] = coprimeTriple(6);
      const total = (a + b + c) * unit;
      const names = pick(NAMES3);
      const shares = [a * unit, b * unit, c * unit];
      return makeQuestion({
        topic: "dividingQuantity",
        text: `${ctx.what(total)} ${ctx.verb} divided among ${names[0]}, ${names[1]} and ${names[2]} in the ratio ${ratioText([a, b, c])}.\nHow much does each person get?`,
        answer: shares.join(", "),
        feedback: `${a + b + c} parts share ${ctx.what(total)}, so 1 part = ${ctx.fmt(unit)}. Shares: ${shares.map(ctx.fmt).join(", ")}.`,
        answerMode: "multiPart",
        expectedParts: shares.map((s, i) => ({ label: `(${"abc"[i]})`, prompt: names[i], answer: String(s) })),
      });
    }

    const [a, b] = coprimePair(level <= 2 ? 5 : 8);
    const total = (a + b) * unit;
    const wantLarger = pick([true, false]);
    const share = (wantLarger ? Math.max(a, b) : Math.min(a, b)) * unit;

    return makeQuestion({
      topic: "dividingQuantity",
      text: `${ctx.what(total)} ${ctx.verb} divided in the ratio ${ratioText([a, b])}.\nWhat is the ${wantLarger ? "larger" : "smaller"} share?`,
      answer: share,
      feedback: `${a} + ${b} = ${a + b} parts, so 1 part = ${ctx.fmt(unit)}. The ${wantLarger ? "larger" : "smaller"} share is ${wantLarger ? Math.max(a, b) : Math.min(a, b)} parts = ${ctx.fmt(share)}.`,
      inputMode: "simple",
    });
  },
};

// ---- 7. Unitary Method (ratio problems) -------------------------------------

export const unitaryMethod = {
  id: "unitaryMethod",
  name: "Unitary Method",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["dividingQuantity"],
  nextSkillIds: ["unitRates"],

  generate(level) {
    const kind = pick(level <= 2 ? ["cordial", "recipe"] : ["cordial", "recipe", "cost"]);

    if (kind === "cordial") {
      const [c, w] = level <= 2 ? [1, randInt(3, 5)] : coprimePair(6).sort((x, y) => x - y);
      const mult = randInt(2, level <= 2 ? 5 : 9);
      const water = w * mult;
      const answer = c * mult;
      return makeQuestion({
        topic: "unitaryMethod",
        text: `A drink is mixed with cordial and water in the ratio ${ratioText([c, w])}.\nIf ${water} cups of water are used, how many cups of cordial are needed?`,
        answer,
        feedback: `${water} ÷ ${w} = ${mult}, so multiply both parts by ${mult}: cordial = ${c} × ${mult} = ${answer} cups.`,
        inputMode: "simple",
      });
    }
    if (kind === "recipe") {
      const [f, s] = coprimePair(level <= 2 ? 5 : 8);
      const mult = randInt(2, level <= 2 ? 4 : 8);
      const flour = f * mult;
      const answer = s * mult;
      return makeQuestion({
        topic: "unitaryMethod",
        text: `A recipe uses flour and sugar in the ratio ${ratioText([f, s])}.\nIf ${flour} cups of flour are used, how many cups of sugar are needed?`,
        answer,
        feedback: `${flour} ÷ ${f} = ${mult}, so sugar = ${s} × ${mult} = ${answer} cups.`,
        inputMode: "simple",
      });
    }
    // cost: n items → price of m items via the unit price.
    const n = randInt(2, 6);
    const unitCents = randInt(4, 30) * 10; // clean cents
    let m;
    do { m = randInt(2, 9); } while (m === n);
    const costN = (n * unitCents) / 100;
    const answer = (m * unitCents) / 100;
    return makeQuestion({
      topic: "unitaryMethod",
      text: `${countWord(n)[0].toUpperCase()}${countWord(n).slice(1)} pens cost $${costN.toFixed(2)}.\nHow many dollars do ${countWord(m)} pens cost?`,
      answer,
      acceptableAnswers: [answer.toFixed(2)],
      feedback: `One pen costs $${costN.toFixed(2)} ÷ ${n} = ${dollars(unitCents)}. Then ${m} × ${dollars(unitCents)} = $${answer.toFixed(2)}.`,
      inputMode: "simple",
    });
  },
};

// ---- 8. Unit Rates & simple rate problems -----------------------------------

export const unitRates = {
  id: "unitRates",
  name: "Unit Rates",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["dividingQuantity"],
  nextSkillIds: ["convertRates", "bestBuy"],

  generate(level) {
    const kind = pick(["speed", "distance", "time", "price", "pump", "typing"]);

    if (kind === "speed") {
      const hours = randInt(2, level <= 2 ? 4 : 6);
      const rate = level >= 4 && Math.random() < 0.5 ? randInt(50, 110) + 0.5 : randInt(40, 110);
      const km = Math.round(rate * hours * 10) / 10;
      return makeQuestion({
        topic: "unitRates",
        text: `A car travels ${km} km in ${hours} hours.\nWhat is its average speed in km per hour?`,
        answer: rate,
        feedback: `Speed = distance ÷ time = ${km} ÷ ${hours} = ${rate} km/h.`,
        inputMode: "simple",
      });
    }
    if (kind === "distance") {
      const hours = randInt(2, level <= 2 ? 4 : 6);
      const speed = randInt(4, level <= 2 ? 9 : 12) * 10;
      const km = speed * hours;
      return makeQuestion({
        topic: "unitRates",
        text: `A car travels at ${speed} km/h for ${hours} hours.\nHow far does it travel, in kilometres?`,
        answer: km,
        feedback: `Distance = speed × time = ${speed} × ${hours} = ${km} km.`,
        inputMode: "simple",
      });
    }
    if (kind === "time") {
      const speed = pick(level <= 2 ? [50, 60, 80, 100] : [40, 50, 60, 70, 80, 90, 100]);
      const hours = randInt(2, level <= 2 ? 4 : 6);
      const km = speed * hours;
      return makeQuestion({
        topic: "unitRates",
        text: `A bus travels ${km} km at ${speed} km/h.\nHow long does the trip take, in hours?`,
        answer: hours,
        feedback: `Time = distance ÷ speed = ${km} ÷ ${speed} = ${hours} hours.`,
        inputMode: "simple",
      });
    }
    if (kind === "price") {
      const n = randInt(2, level <= 2 ? 6 : 12);
      const eachCents = level <= 2 ? randInt(1, 6) * 100 : randInt(4, 30) * 25;
      const each = eachCents / 100;
      const total = (n * eachCents) / 100;
      return makeQuestion({
        topic: "unitRates",
        text: `${countWord(n)[0].toUpperCase()}${countWord(n).slice(1)} identical notebooks cost $${total.toFixed(2)}.\nHow many dollars does ONE notebook cost?`,
        answer: each,
        acceptableAnswers: [each.toFixed(2)],
        feedback: `$${total.toFixed(2)} ÷ ${n} = $${each.toFixed(2)} each.`,
        inputMode: "simple",
      });
    }
    if (kind === "pump") {
      const mins = randInt(3, 8);
      const rate = randInt(6, 20);
      const litres = rate * mins;
      return makeQuestion({
        topic: "unitRates",
        text: `A pump fills ${litres} litres in ${mins} minutes.\nHow many litres per minute is that?`,
        answer: rate,
        feedback: `${litres} ÷ ${mins} = ${rate} litres per minute.`,
        inputMode: "simple",
      });
    }
    const mins = randInt(2, 6);
    const rate = randInt(25, 70);
    const words = rate * mins;
    return makeQuestion({
      topic: "unitRates",
      text: `Zoe types ${words} words in ${mins} minutes.\nHow many words per minute is that?`,
      answer: rate,
      feedback: `${words} ÷ ${mins} = ${rate} words per minute.`,
      inputMode: "simple",
    });
  },
};

// ---- 9. Converting Rate Units ------------------------------------------------

export const convertRates = {
  id: "convertRates",
  name: "Converting Rates",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["unitRates"],
  nextSkillIds: ["bestBuy"],

  generate(level) {
    const kinds = level <= 2 ? ["msToMin", "kmhToMmin"] : level <= 4
      ? ["msToMin", "kmhToMmin", "msToKmh"]
      : ["msToMin", "kmhToMmin", "msToKmh", "kmhToMs"];
    const kind = pick(kinds);

    if (kind === "msToMin") {
      const ms = randInt(2, 12);
      const answer = ms * 60;
      return makeQuestion({
        topic: "convertRates",
        text: `Convert ${ms} metres per second to metres per minute.`,
        answer,
        feedback: `There are 60 seconds in a minute: ${ms} × 60 = ${answer} m/min.`,
        inputMode: "simple",
      });
    }
    if (kind === "kmhToMmin") {
      const kmh = pick([6, 12, 18, 24, 30, 36, 48, 60, 72, 90]);
      const answer = (kmh * 1000) / 60;
      return makeQuestion({
        topic: "convertRates",
        text: `Convert ${kmh} km/h to metres per minute.`,
        answer,
        feedback: `${kmh} km/h = ${kmh * 1000} m per hour, and ${kmh * 1000} ÷ 60 = ${answer} m/min.`,
        inputMode: "simple",
      });
    }
    if (kind === "msToKmh") {
      const ms = pick([5, 10, 15, 20, 25]);
      const answer = ms * 3.6;
      return makeQuestion({
        topic: "convertRates",
        text: `Convert ${ms} metres per second to km/h.`,
        answer,
        feedback: `Multiply by 3.6 (×3600 seconds, ÷1000 metres): ${ms} × 3.6 = ${answer} km/h.`,
        inputMode: "simple",
      });
    }
    const kmh = pick([18, 36, 54, 72, 90, 108]);
    const answer = kmh / 3.6;
    return makeQuestion({
      topic: "convertRates",
      text: `Convert ${kmh} km/h to metres per second.`,
      answer,
      feedback: `Divide by 3.6: ${kmh} ÷ 3.6 = ${answer} m/s.`,
      inputMode: "simple",
    });
  },
};

// ---- 10. Best Buy (True/False; one line per option) --------------------------

const PACK_ITEMS = ["pens", "muffins", "stickers", "tennis balls", "erasers"];
const GROCERY = [
  { noun: "juice", container: "Bottle", unit: "mL", base: 100, baseLabel: "100 mL", sizes: [[600, 1000], [500, 750], [250, 500], [1000, 2000]] },
  { noun: "milk", container: "Bottle", unit: "mL", base: 100, baseLabel: "100 mL", sizes: [[600, 1000], [1000, 2000]] },
  { noun: "cereal", container: "Box", unit: "g", base: 100, baseLabel: "100 g", sizes: [[375, 500], [500, 750], [750, 900]] },
  { noun: "rice", container: "Bag", unit: "g", base: 100, baseLabel: "100 g", sizes: [[500, 1000], [1000, 2000]] },
];

export const bestBuy = {
  id: "bestBuy",
  name: "Best Buy",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["unitRates"],
  nextSkillIds: ["ratioTables"],

  generate(level) {
    // Levels 4–5: half the time, a grocery "per 100 g / 100 mL" comparison.
    if (level >= 4 && Math.random() < 0.5) {
      const g = pick(GROCERY);
      const [q1, q2] = pick(g.sizes);
      const u1 = randInt(30, 90); // cents per base
      const gapG = randInt(3, 12);
      const u2 = u1 + pick([-1, 1]) * gapG;
      const p1 = Math.round((q1 / g.base) * u1);
      const p2 = Math.round((q2 / g.base) * u2);
      const subject = pick(["A", "B"]);
      const betterIsA = u1 < u2;
      const truth = subject === "A" ? betterIsA : !betterIsA;
      const answer = truth ? "True" : "False";
      return makeQuestion({
        topic: "bestBuy",
        text: `${g.container} A: ${q1} ${g.unit} of ${g.noun} for ${dollars(p1)}.\n${g.container} B: ${q2} ${g.unit} of ${g.noun} for ${dollars(p2)}.\nTrue or false: ${g.container} ${subject} is the better buy.`,
        answer,
        feedback: `${g.container} A costs ${dollars(u1)} per ${g.baseLabel}; ${g.container} B costs ${dollars(u2)} per ${g.baseLabel} — ${g.container} ${betterIsA ? "A" : "B"} is the better buy, so the statement is ${answer.toLowerCase()}.`,
        answerMode: "trueFalse",
        options: ["True", "False"],
      });
    }

    const item = pick(PACK_ITEMS);
    const n1 = randInt(2, level <= 2 ? 5 : 8);
    let n2;
    do { n2 = randInt(3, level <= 2 ? 8 : 12); } while (n2 === n1);

    // Build prices FROM whole-cent unit prices so the feedback divides exactly.
    // Higher levels → closer unit prices (a harder judgement call).
    const u1 = randInt(60, 300); // cents each
    const gap = level <= 2 ? randInt(20, 80) : level === 3 ? randInt(10, 40) : randInt(4, 15);
    // Keep both unit prices positive (never a $0.00-or-less pack).
    const sign = u1 - gap >= 20 ? pick([-1, 1]) : 1;
    const u2 = u1 + sign * gap;
    const p1 = n1 * u1;
    const p2 = n2 * u2;

    const subject = pick(["A", "B"]);
    const betterIsA = u1 < u2;
    const truth = subject === "A" ? betterIsA : !betterIsA;
    const answer = truth ? "True" : "False";

    return makeQuestion({
      topic: "bestBuy",
      text: `Pack A: ${countWord(n1)} ${item} for ${dollars(p1)}.\nPack B: ${countWord(n2)} ${item} for ${dollars(p2)}.\nTrue or false: Pack ${subject} is the better buy.`,
      answer,
      feedback: `Pack A costs ${dollars(u1)} each; Pack B costs ${dollars(u2)} each — Pack ${betterIsA ? "A" : "B"} is the better buy, so the statement is ${answer.toLowerCase()}.`,
      answerMode: "trueFalse",
      options: ["True", "False"],
    });
  },
};

// ---- 11. Map Scales (real-life ratio) ----------------------------------------

const SCALES = [
  { scale: 10000, cmToKm: 0.1 },
  { scale: 25000, cmToKm: 0.25 },
  { scale: 50000, cmToKm: 0.5 },
  { scale: 100000, cmToKm: 1 },
];

export const mapScale = {
  id: "mapScale",
  name: "Map Scales",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["unitaryMethod"],
  nextSkillIds: [],

  generate(level) {
    const s = pick(level <= 2 ? SCALES.slice(2) : SCALES); // easy: 1 cm = 0.5/1 km
    let cm = randInt(2, level <= 2 ? 8 : 12);
    // Keep the answer to at most 1 decimal place.
    if (s.cmToKm === 0.25 && cm % 2 !== 0) cm += 1;
    const answer = Math.round(cm * s.cmToKm * 10) / 10;

    return makeQuestion({
      topic: "mapScale",
      text: `A map uses a scale of ${ratioText([1, s.scale.toLocaleString("en-AU")])}.\nA distance on the map is ${cm} cm.\nHow many kilometres is the real distance?`,
      answer,
      feedback: `1 cm on the map = ${s.scale.toLocaleString("en-AU")} cm = ${s.cmToKm} km in real life. So ${cm} × ${s.cmToKm} = ${answer} km.`,
      inputMode: "simple",
    });
  },
};

// ---- 12. Ratio Tables (tableInput) --------------------------------------------

const TABLE_CONTEXTS = [
  { a: "Red paint (L)", b: "Blue paint (L)", caption: (r) => `Purple paint uses red and blue in the ratio ${r}.` },
  { a: "Flour (cups)", b: "Sugar (cups)", caption: (r) => `A recipe uses flour and sugar in the ratio ${r}.` },
  { a: "Adults", b: "Children", caption: (r) => `An excursion needs adults to children in the ratio ${r}.` },
];

export const ratioTables = {
  id: "ratioTables",
  name: "Ratio Tables",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["equivalentRatios"],
  nextSkillIds: ["ratioDoubleLine"],

  generate(level) {
    const ctx = pick(TABLE_CONTEXTS);
    const [a, b] = coprimePair(level <= 2 ? 4 : 6);
    const factorPool = level <= 1 ? [2, 3, 4] : level <= 3 ? [2, 3, 4, 5, 6] : [3, 4, 6, 7, 8, 10];
    const factors = [1];
    while (factors.length < 4) {
      const f = pick(factorPool);
      if (!factors.includes(f)) factors.push(f);
    }
    factors.sort((x, y) => x - y);

    // Row 1 is fully given; later rows hide one side each (both sides at L4+).
    const rows = factors.map((f, i) => {
      const av = a * f, bv = b * f;
      if (i === 0) return [String(av), String(bv)];
      if (level >= 4 && i === factors.length - 1) {
        return [{ input: true, answer: String(av) }, { input: true, answer: String(bv) }];
      }
      const hideA = i % 2 === 0;
      return hideA
        ? [{ input: true, answer: String(av) }, String(bv)]
        : [String(av), { input: true, answer: String(bv) }];
    });

    const blanks = rows.flat().filter((c) => typeof c === "object");
    const lastF = factors[factors.length - 1];
    const hint = level >= 4 ? `\nThe last row uses ${lastF} times the first row.` : "";
    const rText = ratioText([a, b]);

    return makeQuestion({
      topic: "ratioTables",
      text: `${ctx.caption(rText)}\nComplete the table.${hint}`,
      answer: blanks.map((c) => c.answer).join(", "),
      feedback: `Each row keeps the ratio ${rText} — multiply both columns of the first row by the same number (rows use ×${factors.join(", ×")}).`,
      answerMode: "tableInput",
      tableConfig: {
        caption: ctx.caption(rText),
        headerRow: [ctx.a, ctx.b],
        rows,
      },
    });
  },
};

// ---- 13/14. Distance–Time Graphs ----------------------------------------------

// Build a clean journey: out (fast-ish), stop, then return (or a second leg).
// Times are multiples of 10 min up to 60; distances multiples of 100 m.
function buildJourney(level) {
  const outT = pick([10, 20]);
  const outD = pick(level <= 2 ? [200, 400] : [200, 300, 400, 600]);
  const stopT = pick([10, 20]);
  const homeT = 60 - outT - stopT; // return leg duration (≥ 10)
  const points = [
    { x: 0, y: 0 },
    { x: outT, y: outD },
    { x: outT + stopT, y: outD }, // flat = stopped
    { x: 60, y: 0 },
  ];
  return {
    points,
    xMax: 60,
    yMax: Math.max(400, outD),
    outT,
    outD,
    stopT,
    homeT,
    stopStart: outT,
    stopEnd: outT + stopT,
  };
}

const DT_DIAGRAM = (j) => ({
  diagramType: "distanceTimeGraph",
  diagramData: {
    xMax: j.xMax,
    yMax: j.yMax,
    xTick: 10,
    yTick: j.yMax > 400 ? 200 : 100,
    points: j.points,
    xLabel: "Time (minutes)",
    yLabel: "Distance from home (m)",
  },
});

export const distanceTimeRead = {
  id: "distanceTimeRead",
  name: "Distance–Time Graphs: Reading",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["unitRates"],
  nextSkillIds: ["distanceTimeSpeed"],

  generate(level) {
    const j = buildJourney(level);

    // Levels 4–5: half the time, a true/false "stopped between …" reading.
    if (level >= 4 && Math.random() < 0.5) {
      const claimStopped = pick([true, false]);
      const [t1, t2] = claimStopped
        ? [j.stopStart, j.stopEnd]
        : pick([[0, j.outT], [j.stopEnd, 60]]);
      const answer = claimStopped ? "True" : "False";
      return makeQuestion({
        topic: "distanceTimeRead",
        text: `The graph shows a walker's distance from home.\nTrue or false: the walker was stopped between ${t1} and ${t2} minutes.`,
        answer,
        feedback: `The graph is flat (no distance change) only between ${j.stopStart} and ${j.stopEnd} minutes — so the statement is ${answer.toLowerCase()}.`,
        answerMode: "trueFalse",
        options: ["True", "False"],
        ...DT_DIAGRAM(j),
      });
    }

    // Read the distance at a vertex time (or any time during the stop).
    const askT = pick(level <= 2 ? [j.outT, j.stopEnd] : [j.outT, j.stopEnd, j.stopStart + 10 <= j.stopEnd ? j.stopStart + 10 : j.outT]);
    const answer = j.outD; // all those times sit at the top plateau

    return makeQuestion({
      topic: "distanceTimeRead",
      text: `The graph shows a walker's distance from home.\nHow far from home was the walker after ${askT} minutes?`,
      answer,
      feedback: `Read up from ${askT} minutes to the line, then across: ${answer} m.`,
      inputMode: "simple",
      ...DT_DIAGRAM(j),
    });
  },
};

export const distanceTimeSpeed = {
  id: "distanceTimeSpeed",
  name: "Distance–Time Graphs: Speed",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["distanceTimeRead"],
  nextSkillIds: [],

  generate(level) {
    // Rebuild until the asked leg has a whole-number speed.
    for (let tries = 0; tries < 40; tries++) {
      const j = buildJourney(level);
      const askReturn = level >= 3 && Math.random() < 0.5;
      const dist = j.outD;
      const dur = askReturn ? j.homeT : j.outT;
      const speed = dist / dur;
      if (!Number.isInteger(speed)) continue;

      const text = askReturn
        ? `The graph shows a walker's distance from home.\nFind the walker's speed on the way home (from ${j.stopEnd} to 60 minutes), in metres per minute.`
        : `The graph shows a walker's distance from home.\nFind the walker's speed during the first ${j.outT} minutes, in metres per minute.`;

      return makeQuestion({
        topic: "distanceTimeSpeed",
        text,
        answer: speed,
        feedback: `Speed = distance ÷ time = ${dist} ÷ ${dur} = ${speed} m/min.`,
        inputMode: "simple",
        ...DT_DIAGRAM(j),
      });
    }
    // Guaranteed-clean fallback: 400 m out in 20 min.
    const j = { points: [{ x: 0, y: 0 }, { x: 20, y: 400 }, { x: 40, y: 400 }, { x: 60, y: 0 }], xMax: 60, yMax: 400, outT: 20, outD: 400, stopT: 20, homeT: 20, stopStart: 20, stopEnd: 40 };
    return makeQuestion({
      topic: "distanceTimeSpeed",
      text: `The graph shows a walker's distance from home.\nFind the walker's speed during the first 20 minutes, in metres per minute.`,
      answer: 20,
      feedback: `Speed = distance ÷ time = 400 ÷ 20 = 20 m/min.`,
      inputMode: "simple",
      ...DT_DIAGRAM(j),
    });
  },
};

// The full ordered skill list for the Ratios & Rates topic.
export const RATIO_SKILLS_LIST = [
  ratioDoubleLine,
  simplifyRatio,
  mixedUnitRatio,
  ratioAsFraction,
  equivalentRatios,
  dividingQuantity,
  unitaryMethod,
  unitRates,
  convertRates,
  bestBuy,
  mapScale,
  ratioTables,
  distanceTimeRead,
  distanceTimeSpeed,
];

export default RATIO_SKILLS_LIST;
