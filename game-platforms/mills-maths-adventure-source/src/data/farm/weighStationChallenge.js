/**
 * THE WEIGH STATION (F9) — pure logic for the rounding challenge. No React,
 * no stores — fully checkable headlessly. ALL values are held as INTEGER
 * thousandths (or cents for money) so no float dust ever leaks into a
 * display or a grade.
 *
 * PEDAGOGY — rounding as LOCATING, not a digit rule: the scale's zoomed
 * number-line beam runs from the LOWER candidate to the UPPER candidate of
 * the requested place, with the needle at the exact reading. The student
 * taps the ≈ sign the needle is CLOSER to (halfway rounds UP — the tie
 * rounds appear in stage 3). The third option is always a place-value
 * misconception (wrong place / midpoint / "pay the exact amount").
 *
 * A SET is 15 rounds, 3 per concept stage:
 *   S1  nearest WHOLE kg
 *   S2  nearest 0.1 kg (1 dp)
 *   S3  nearest 0.01 kg (2 dp) — includes exact-halfway ties (round UP)
 *   S4  MONEY to the nearest 5c (cash at the till)
 *   S5  JUDGEMENT — which job needs the EXACT number vs an estimate (≈)?
 */

export const WEIGH_ROUNDS_PER_SET = 15;
const WEIGH_STAGES = 5;
const WEIGH_ROUNDS_PER_STAGE = WEIGH_ROUNDS_PER_SET / WEIGH_STAGES;
export const WEIGH_ROUND_POINTS = 25;

// Numeric rounds are TWO-part (like the teacher's Decimal Zoom tool):
//   A) LOCATE — drag the marker to where the reading sits on the zoomed
//      beam (banded points, fence-style: dead centre = 🎯 BULLSEYE!)
//   B) TYPE — key the rounded value into the input box.
export const WEIGH_LOCATE_POINTS = 10;
export const WEIGH_TYPE_POINTS = 15;
export const WEIGH_LOCATE_BANDS = [
  { id: "bullseye", frac: 0.025, points: 10, label: "🎯 BULLSEYE!" },
  { id: "close", frac: 0.06, points: 6, label: "So close!" },
  { id: "warm", frac: 0.12, points: 3, label: "Getting there" },
  { id: "miss", frac: Infinity, points: 0, label: "Way off" },
];

/** Grade a locate: `frac` is the marker position 0..1 along the beam. */
export function gradeLocate(round, frac) {
  const err = Math.abs(frac - round.needleFrac);
  const band = WEIGH_LOCATE_BANDS.find((b) => err <= b.frac) || WEIGH_LOCATE_BANDS[WEIGH_LOCATE_BANDS.length - 1];
  return { err: Math.round(err * 1000) / 1000, band: band.id, points: band.points, label: band.label };
}

/**
 * Check a typed rounded value against the round's correct rounding. Accepts
 * "$" / "kg" / spaces and numerically-equal forms ("3.50" for "3.5 kg").
 */
export function checkRoundedInput(round, text) {
  const cleaned = String(text || "").replace(/[$\s]/g, "").replace(/kg/i, "");
  if (!cleaned || !/^\d*\.?\d+$/.test(cleaned)) return { valid: false, correct: false };
  const value = Number(cleaned);
  const scale = round.money ? 100 : 1000;
  const correctValue = (round.needleFrac >= 0.5 ? round.upper : round.lower) / scale;
  return { valid: true, correct: Math.abs(value - correctValue) < 1e-9 };
}

/** Which concept stage (0–4) a round index belongs to. Pure. */
export function weighStageFor(i) {
  return Math.max(0, Math.min(WEIGH_STAGES - 1, Math.floor(i / WEIGH_ROUNDS_PER_STAGE)));
}

function pick(list, rand) {
  return list[Math.floor(rand() * list.length)];
}

// Produce on the scale (cosmetic variety). [emoji, name, colour]
const PRODUCE = [
  ["🎃", "pumpkin", "#e07b28"],
  ["🍉", "watermelon", "#3f9d4f"],
  ["🥔", "sack of potatoes", "#b98a52"],
  ["🍯", "tub of honey", "#e0a828"],
  ["🧀", "wheel of cheese", "#f4d35e"],
];

// Numeric stage configs. Units: THOUSANDTHS of a kg (money: CENTS).
//   step      the rounding step
//   offsets   exact = lower + offset (offset < step, ≠ 0; step/2 = a tie)
//   baseMin/baseMax  range for the LOWER candidate (in steps)
//   exactDp   decimal places to show the exact reading with
//   stepDp    decimal places for the candidate signs
const NUMERIC_STAGES = [
  { step: 1000, offsets: [200, 300, 400, 500, 600, 700, 800], baseMin: 2, baseMax: 8, exactDp: 1, stepDp: 0, place: "the nearest whole kilogram" },
  { step: 100, offsets: [12, 23, 34, 41, 50, 58, 67, 78, 89], baseMin: 12, baseMax: 88, exactDp: 3, stepDp: 1, place: "1 decimal place" },
  { step: 10, offsets: [2, 3, 4, 5, 6, 7, 8], baseMin: 30, baseMax: 880, exactDp: 3, stepDp: 2, place: "2 decimal places" },
  { step: 5, offsets: [1, 2, 3, 4], baseMin: 40, baseMax: 380, exactDp: 2, stepDp: 2, place: "the nearest 5 cents", money: true },
];

/** Format integer `units` (thousandths, or cents when money) to a string. */
export function weighFormat(units, dp, money = false) {
  const scale = money ? 100 : 1000;
  const value = (units / scale).toFixed(dp);
  return money ? `$${value}` : `${value} kg`;
}

// Judgement bank: does this farm job need the EXACT number, or is ≈ fine?
export const WEIGH_JUDGEMENT_BANK = [
  { text: "Medicine dose for a sick calf", exact: true, why: "medicine doses must be measured EXACTLY — too much or too little is dangerous" },
  { text: "Change handed back at the till", exact: true, why: "money changing hands must be exact to the cent" },
  { text: "Timber cut for a gate that must fit its posts", exact: true, why: "a gate either fits or it doesn't — the cut must be exact" },
  { text: "Weighing produce that is PRICED per kilogram", exact: true, why: "the customer pays by the scale — the weight must be measured, not guessed" },
  { text: "Hay bales needed to feed the herd over winter", exact: false, why: "an estimate is fine — you'd round UP a little and store spares" },
  { text: "Water needed to fill the trough", exact: false, why: "close enough is fine — the trough doesn't mind an extra litre" },
  { text: "Paint needed for the barn wall", exact: false, why: "you estimate the area and buy a bit extra" },
  { text: "Apples to pack for the pickers' lunches", exact: false, why: "roughly enough is fine — nobody measures lunch to the gram" },
];

/** One round. roundIndex ∈ [0, 15); rand injectable for the checks. */
export function generateWeighRound(roundIndex, rand = Math.random) {
  const stage = weighStageFor(roundIndex);

  if (stage === 4) {
    // JUDGEMENT round: 3 scenarios, exactly ONE matching the prompt type.
    const wantExact = rand() < 0.5;
    const match = pick(WEIGH_JUDGEMENT_BANK.filter((j) => j.exact === wantExact), rand);
    const others = shuffle(WEIGH_JUDGEMENT_BANK.filter((j) => j.exact !== wantExact), rand).slice(0, 2);
    const options = shuffle([match, ...others], rand);
    return {
      roundIndex,
      stage,
      kind: "judge",
      wantExact,
      options: options.map((o) => o.text),
      correctIndex: options.indexOf(match),
      items: options,
      prompt: wantExact
        ? "Tap the job where the EXACT number matters."
        : "Tap the job where an estimate (≈) is good enough.",
      reason: `${match.text}: ${match.why}.`,
    };
  }

  const cfg = NUMERIC_STAGES[stage];
  const money = Boolean(cfg.money);
  const base = cfg.baseMin + Math.floor(rand() * (cfg.baseMax - cfg.baseMin + 1));
  const lower = base * cfg.step;
  const upper = lower + cfg.step;
  const offset = pick(cfg.offsets, rand);
  const exact = lower + offset;
  const isTie = offset * 2 === cfg.step;
  const roundsUp = offset * 2 >= cfg.step; // halfway rounds UP
  const correctUnits = roundsUp ? upper : lower;

  const lowerStr = weighFormat(lower, cfg.stepDp, money);
  const upperStr = weighFormat(upper, cfg.stepDp, money);
  const correctStr = roundsUp ? upperStr : lowerStr;

  const [emoji, name] = money ? ["🧺", "till total", "#b98a52"] : pick(PRODUCE, rand);
  const exactStr = weighFormat(exact, cfg.exactDp, money);
  return {
    roundIndex,
    stage,
    kind: "round",
    money,
    emoji,
    produce: name,
    exact,
    exactStr,
    lower,
    upper,
    lowerStr,
    upperStr,
    step: cfg.step,
    stepDp: cfg.stepDp,
    isTie,
    needleFrac: offset / cfg.step, // 0..1 along the zoomed beam
    correctStr,
    place: cfg.place,
    prompt: money
      ? `The till says ${exactStr}. Slide the marker to where that sits — then round to ${cfg.place}.`
      : `The ${name} weighs ${exactStr}. Slide the marker to where that sits — then round to ${cfg.place}.`,
    reason: isTie
      ? `${exactStr} is EXACTLY halfway between ${lowerStr} and ${upperStr} — halfway always rounds UP, so ${exactStr} ≈ ${upperStr}.`
      : `On the zoomed scale, ${exactStr} sits closer to ${correctStr} than ${roundsUp ? lowerStr : upperStr} — so ${exactStr} ≈ ${correctStr}.`,
  };
}

function shuffle(list, rand) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** A full set. Consecutive numeric rounds never share the same exact value. */
export function generateWeighSet(rand = Math.random) {
  const rounds = [];
  for (let i = 0; i < WEIGH_ROUNDS_PER_SET; i++) {
    let round = generateWeighRound(i, rand);
    let guard = 0;
    while (
      i > 0 && guard < 20 &&
      ((round.kind === "round" && rounds[i - 1].kind === "round" && round.exact === rounds[i - 1].exact) ||
        (round.kind === "judge" && rounds[i - 1].kind === "judge" && round.correctIndex >= 0 &&
          round.options[round.correctIndex] === rounds[i - 1].options[rounds[i - 1].correctIndex]))
    ) {
      round = generateWeighRound(i, rand);
      guard++;
    }
    rounds.push(round);
  }
  return rounds;
}

/** Grade a tap. Pure. */
export function gradeWeigh(round, index) {
  const correct = index === round.correctIndex;
  return { correct, chosen: index, points: correct ? WEIGH_ROUND_POINTS : 0 };
}
