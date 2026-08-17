/**
 * CHRISTMAS TREE GROVE — LIGHT THE TREE (GV) — pure logic for the
 * COMPENSATION challenge, the third Snowball Sums build. No React, no
 * stores — fully checkable headlessly. All values are small integers.
 *
 * PEDAGOGY — compensation as the LAZY-SMART grab: fairy lights come in
 * BUNDLES OF TEN (plus loose singles, one slow clip at a time). A tree
 * already wears some lights and needs, say, 29 more. Counting out 29
 * singles is the trap ("you must count every one"). The play: grab the
 * FRIENDLY bundle pile — 3 bundles (30) — hang the lot in one go, then
 * UNCLIP 1 (it pings back into the box): 47 + 29 becomes 47 + 30 − 1.
 * Additions ending 1–2 flip the fix (hang the tens, clip 1–2 more), and
 * exact-tens rounds need NO fix at all — the "perfect — done!" option
 * punishes blindly always adjusting.
 *
 * A SET is 15 rounds, 3 per concept stage:
 *   S1  near-ten singles     add 8 or 9        (26 + 9 → 26 + 10 − 1)
 *   S2  nine-ish bundles     add ends 8–9      (47 + 29 → 47 + 30 − 1)
 *   S3  just-past bundles    add ends 1–2      (47 + 21 → 47 + 20 + 1)
 *   S4  choose the direction mixed 1/2/8/9, bigger numbers
 *   S5  traps                mixed + an EXACT-tens round (no fix needed)
 *
 * Scoring (per round, max 25 — Trading-Post-style three-parter):
 *   A) GRAB the friendly bundle pile                     = 10
 *   B) PICK the fix (unclip 2/1 · perfect · clip 1/2)    = 10
 *   C) TYPE the finished total                           = 5
 */

export const GROVE_ROUNDS_PER_SET = 15;
const GROVE_STAGES = 5;
const GROVE_ROUNDS_PER_STAGE = GROVE_ROUNDS_PER_SET / GROVE_STAGES;

export const GROVE_GRAB_POINTS = 10;
export const GROVE_ADJUST_POINTS = 10;
export const GROVE_TOTAL_POINTS = 5;
export const GROVE_ROUND_POINTS = GROVE_GRAB_POINTS + GROVE_ADJUST_POINTS + GROVE_TOTAL_POINTS; // 25
export const GROVE_MAX_SCORE = GROVE_ROUNDS_PER_SET * GROVE_ROUND_POINTS; // 375

// The five fix choices, in display order. `value` is lights added on top of
// the hung bundles (negative = unclipped back into the box).
export const GROVE_ADJUSTMENTS = [
  { value: -2, label: "Unclip 2" },
  { value: -1, label: "Unclip 1" },
  { value: 0, label: "Perfect — done!" },
  { value: 1, label: "Clip 1 more" },
  { value: 2, label: "Clip 2 more" },
];

/** Which concept stage (0–4) a round index belongs to. Pure. */
export function groveStageFor(i) {
  return Math.max(0, Math.min(GROVE_STAGES - 1, Math.floor(i / GROVE_ROUNDS_PER_STAGE)));
}

function pick(list, rand) {
  return list[Math.floor(rand() * list.length)];
}

function randInt(min, max, rand) {
  return min + Math.floor(rand() * (max - min + 1));
}

// Stage configs — SOLUTIONS FIRST: choose the addition's ones digit from the
// stage's set (never 3–7, so the friendly bundle pile is unambiguous and the
// fix is always within ±2), a tens count, then a start that keeps the total
// two-digit. Round 13 (mid-S5) is FORCED to an exact-tens add so the
// "perfect — done!" trap always appears in every set.
const GROVE_STAGE_CONFIGS = [
  { onesSet: [8, 9], tensMin: 0, tensMax: 0, startMin: 13, startMax: 48, name: "near-ten singles" },
  { onesSet: [8, 9], tensMin: 1, tensMax: 3, startMin: 22, startMax: 58, name: "nine-ish bundles" },
  { onesSet: [1, 2], tensMin: 1, tensMax: 3, startMin: 22, startMax: 58, name: "just-past bundles" },
  { onesSet: [1, 2, 8, 9], tensMin: 1, tensMax: 4, startMin: 25, startMax: 68, name: "choose the direction" },
  { onesSet: [1, 2, 8, 9], tensMin: 1, tensMax: 4, startMin: 25, startMax: 68, name: "traps" },
];

export const GROVE_PERFECT_ROUND_INDEX = 13; // the guaranteed exact-tens trap

/** One round. roundIndex ∈ [0, 15); rand injectable for the checks. */
export function generateGroveRound(roundIndex, rand = Math.random) {
  const stage = groveStageFor(roundIndex);
  const cfg = GROVE_STAGE_CONFIGS[stage];

  const exactTens = roundIndex === GROVE_PERFECT_ROUND_INDEX;
  const ones = exactTens ? 0 : pick(cfg.onesSet, rand);
  const tens = exactTens ? randInt(Math.max(1, cfg.tensMin), cfg.tensMax, rand) : randInt(cfg.tensMin, cfg.tensMax, rand);
  const add = tens * 10 + ones;

  // The friendly grab: the nearest whole pile of bundles (ones is never 3–7,
  // so "nearest" is never a coin flip). ones 8–9 → round UP; 0–2 → the tens.
  const grabBundles = ones >= 8 ? tens + 1 : tens;
  const grabValue = grabBundles * 10;
  const adjust = add - grabValue; // −2…+2: the fix performed after the hang

  // Keep every total two-digit so the tree never overflows its spiral.
  const start = randInt(cfg.startMin, Math.min(cfg.startMax, 97 - add), rand);
  const total = start + add;
  const hung = start + grabValue; // after the bundles, before the fix

  // Grab options: three neighbouring pile sizes, ascending, always
  // containing the friendly one (shifted up when the pile would be empty).
  const lowest = Math.max(1, grabBundles - 1);
  const grabOptions = [lowest, lowest + 1, lowest + 2];

  const fixText =
    adjust === 0
      ? `no fixing needed — ${start} + ${grabValue} = ${total}`
      : adjust < 0
        ? `unclip ${-adjust} — ${start} + ${grabValue} = ${hung}, then ${hung} − ${-adjust} = ${total}`
        : `clip ${adjust} more — ${start} + ${grabValue} = ${hung}, then ${hung} + ${adjust} = ${total}`;

  return {
    roundIndex,
    stage,
    stageName: cfg.name,
    start,
    add,
    tens,
    ones,
    grabBundles,
    grabValue,
    adjust,
    hung,
    total,
    grabOptions,
    prompt: `This tree wears ${start} lights and needs ${add} more. Bundles hold TEN — which grab is friendliest?`,
    reason: `${add} is ${adjust === 0 ? "exactly" : "nearly"} ${grabValue}: hang ${grabBundles} bundle${grabBundles === 1 ? "" : "s"}, ${fixText}.`,
  };
}

/**
 * A full set. Consecutive rounds never repeat the same (start, add) pair,
 * so every tree is a fresh job.
 */
export function generateGroveSet(rand = Math.random) {
  const rounds = [];
  for (let i = 0; i < GROVE_ROUNDS_PER_SET; i++) {
    let round = generateGroveRound(i, rand);
    let guard = 0;
    while (
      i > 0 && guard < 30 &&
      round.start === rounds[i - 1].start && round.add === rounds[i - 1].add
    ) {
      round = generateGroveRound(i, rand);
      guard++;
    }
    rounds.push(round);
  }
  return rounds;
}

/**
 * Grade Part A — the GRAB. Wrong piles get the tedium named: too small
 * leaves a slow single-clip job, too big wastes a whole bundle. Pure.
 */
export function gradeGroveGrab(round, bundles) {
  const correct = bundles === round.grabBundles;
  const short = bundles < round.grabBundles;
  const gap = Math.abs(round.add - bundles * 10);
  return {
    correct,
    bundles,
    points: correct ? GROVE_GRAB_POINTS : 0,
    label: correct
      ? `✨ Friendly grab! +${GROVE_GRAB_POINTS} pts`
      : short
        ? `That leaves ${gap} singles to clip one… at… a… time!`
        : `That's ${gap} too many — a whole extra unclipping job!`,
  };
}

/** Grade Part B — the FIX (a value from GROVE_ADJUSTMENTS). Pure. */
export function gradeGroveAdjust(round, value) {
  const correct = value === round.adjust;
  return {
    correct,
    value,
    points: correct ? GROVE_ADJUST_POINTS : 0,
    label: correct ? `💡 Fixed! +${GROVE_ADJUST_POINTS} pts` : "Not that fix!",
  };
}

/** Grade Part C — the TYPED total (plain number, spaces tolerated). Pure. */
export function checkGroveTotal(round, text) {
  const cleaned = String(text || "").replace(/\s/g, "");
  if (!/^\d+$/.test(cleaned)) return { valid: false, correct: false };
  return { valid: true, correct: Number(cleaned) === round.total };
}
