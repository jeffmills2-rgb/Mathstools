/**
 * THE SNOWBALL RANGE (SR) — pure logic for the BRIDGING-TO-TEN challenge, the
 * first Snowball Sums build. No React, no stores — fully checkable headlessly.
 * All values are small integers — no float dust anywhere.
 *
 * PEDAGOGY — bridging to ten as a PHYSICAL SPLIT, not a recited rule: the
 * target is a snowball CRATE (a ten-frame) already partly packed (e.g. 8).
 * The student holds a handful of snowballs (e.g. 6) and must SPLIT the
 * handful before the throw is allowed: the first group FILLS the crate to
 * ten, the rest lands on the spare pile. 8 + 6 is SEEN as (8 + 2) + 4 =
 * 10 + 4. A wrong split shows its consequence — too few leaves glowing gaps,
 * too many bounce off a full crate — then the true bridge is revealed.
 * Later stages bridge through ANY decade (38 + 6 → 40 + 4) and finally
 * through 100, so "make ten" grows into "make the next ten".
 *
 * A SET is 15 rounds, 3 per concept stage:
 *   S1  make ten            single + single crossing 10   (8 + 6)
 *   S2  through the teens   teen + single crossing 20     (16 + 7)
 *   S3  any decade          two-digit + single            (38 + 6)
 *   S4  two-digit throws    split a TWO-digit handful     (47 + 15 → 50 + 12)
 *   S5  the century throw   bridging through 100          (96 + 8 → 100 + 4)
 *
 * Scoring (per round, max 25 — matches every other in-world challenge):
 *   A) SPLIT the handful correctly (fill = complement to the next ten) = 10
 *   B) TYPE the finished total                                         = 15
 */

export const RANGE_ROUNDS_PER_SET = 15;
const RANGE_STAGES = 5;
const RANGE_ROUNDS_PER_STAGE = RANGE_ROUNDS_PER_SET / RANGE_STAGES;

export const RANGE_SPLIT_POINTS = 10;
export const RANGE_TYPE_POINTS = 15;
export const RANGE_ROUND_POINTS = RANGE_SPLIT_POINTS + RANGE_TYPE_POINTS;
export const RANGE_MAX_SCORE = RANGE_ROUNDS_PER_SET * RANGE_ROUND_POINTS; // 375

/** Which concept stage (0–4) a round index belongs to. Pure. */
export function rangeStageFor(i) {
  return Math.max(0, Math.min(RANGE_STAGES - 1, Math.floor(i / RANGE_ROUNDS_PER_STAGE)));
}

function pick(list, rand) {
  return list[Math.floor(rand() * list.length)];
}

function randInt(min, max, rand) {
  return min + Math.floor(rand() * (max - min + 1));
}

// Stage configs — SOLUTIONS FIRST: we choose the start's ONES digit (never 0,
// so a bridge always exists), derive the complement, then choose the REST so
// the throw always crosses the next ten with at least one snowball spare.
//   tensMin/tensMax  range for the start's TENS digit
//   onesMin/onesMax  range for the start's ONES digit
//   addMax           cap on the handful (S4 forces a TWO-digit handful)
const STAGE_CONFIGS = [
  { tensMin: 0, tensMax: 0, onesMin: 6, onesMax: 9, addMax: 9, name: "make ten" },
  { tensMin: 1, tensMax: 1, onesMin: 3, onesMax: 8, addMax: 9, name: "through the teens" },
  { tensMin: 2, tensMax: 8, onesMin: 3, onesMax: 8, addMax: 9, name: "any decade" },
  { tensMin: 2, tensMax: 7, onesMin: 4, onesMax: 8, addMax: 15, addMin: 12, name: "two-digit throws" },
  { tensMin: 9, tensMax: 9, onesMin: 3, onesMax: 8, addMax: 9, name: "the century throw" },
];

/** One round. roundIndex ∈ [0, 15); rand injectable for the checks. */
export function generateRangeRound(roundIndex, rand = Math.random) {
  const stage = rangeStageFor(roundIndex);
  const cfg = STAGE_CONFIGS[stage];

  const tens = randInt(cfg.tensMin, cfg.tensMax, rand);
  const ones = randInt(cfg.onesMin, cfg.onesMax, rand);
  const start = tens * 10 + ones;
  const comp = 10 - ones; // snowballs needed to fill the crate to the next ten

  let rest;
  if (cfg.addMin) {
    // S4: a TWO-digit handful — rest = add − comp for an add in [addMin, addMax].
    const add = randInt(cfg.addMin, cfg.addMax, rand);
    rest = add - comp;
  } else {
    // Single-digit handful: at least 1 spare, capped so add ≤ addMax.
    rest = randInt(1, cfg.addMax - comp, rand);
  }
  const add = comp + rest;
  const nextTen = start + comp;
  const sum = start + add;
  const fullCrates = Math.floor(start / 10);

  return {
    roundIndex,
    stage,
    stageName: cfg.name,
    start, // already packed (fullCrates crates of ten + `ones` in the open crate)
    ones, // snowballs already in the open ten-frame crate
    fullCrates,
    add, // the handful the student holds
    comp, // the correct first group (fills the crate)
    rest, // the spare pile
    nextTen,
    sum,
    prompt: `Pip has packed ${start} snowball${start === 1 ? "" : "s"}. Throw your ${add} — split them to FILL the crate to ${nextTen} first!`,
    reason: `${add} splits into ${comp} + ${rest}: ${start} + ${comp} = ${nextTen}, then ${nextTen} + ${rest} = ${sum}.`,
  };
}

/**
 * A full set. Consecutive rounds never repeat the same (start, add) pair, so
 * every throw is a fresh picture.
 */
export function generateRangeSet(rand = Math.random) {
  const rounds = [];
  for (let i = 0; i < RANGE_ROUNDS_PER_SET; i++) {
    let round = generateRangeRound(i, rand);
    let guard = 0;
    while (
      i > 0 && guard < 30 &&
      round.start === rounds[i - 1].start && round.add === rounds[i - 1].add
    ) {
      round = generateRangeRound(i, rand);
      guard++;
    }
    rounds.push(round);
  }
  return rounds;
}

/**
 * Grade Part A — the SPLIT. `firstCount` is how many snowballs the student
 * aimed at the crate (left of the divider). Exact only: the crate either
 * fills to the ten or it doesn't. Pure.
 */
export function gradeRangeSplit(round, firstCount) {
  const correct = firstCount === round.comp;
  const short = firstCount < round.comp;
  return {
    correct,
    firstCount,
    short, // under-filled (gaps glow) vs over-filled (snowballs bounce off)
    points: correct ? RANGE_SPLIT_POINTS : 0,
    label: correct
      ? `❄️ Perfect fill! +${RANGE_SPLIT_POINTS} pts`
      : short
        ? "The crate isn't full yet!"
        : "Too many — they bounced off!",
  };
}

/**
 * Grade Part B — the TYPED total. Accepts the plain number (spaces tolerated).
 * Pure.
 */
export function checkRangeSum(round, text) {
  const cleaned = String(text || "").replace(/\s/g, "");
  if (!/^\d+$/.test(cleaned)) return { valid: false, correct: false };
  return { valid: true, correct: Number(cleaned) === round.sum };
}
