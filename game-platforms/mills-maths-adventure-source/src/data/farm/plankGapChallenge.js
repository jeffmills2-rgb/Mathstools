/**
 * PLANK THE GAP (F12) — pure logic for ADDING & SUBTRACTING FRACTIONS. No
 * React, no stores — fully checkable headlessly. Everything is held as INTEGER
 * TWELFTHS so no float dust ever leaks into a display or a grade.
 *
 * PEDAGOGY — a common denominator is a SHARED GRID: a gap in the fence is some
 * width; the student lays planks (½, ⅓, ¼, ⅙, 1/12) to fill it EXACTLY. Every
 * plank is a whole number of twelfths, so they all snap onto the same faint
 * twelfths grid — "finding a common denominator" is literally seeing which grid
 * the pieces sit on (½ = 6/12, ⅓ = 4/12 → 6/12 + 4/12 = 10/12). SUBTRACTION
 * rounds pre-fill part of the gap ("the trough is 3 m; you've laid 1¾ m — fill
 * the rest"), so the remainder the student builds is total − used.
 *
 * NOTE: the ⅛ plank from the brief can't sit on a twelfths grid (⅛ = 1.5/12),
 * so the pile uses ⅙ + 1/12 instead — keeping every plank exact on the grid.
 *
 * A SET is 15 rounds, 3 per concept stage:
 *   S1  add, ≤ 1 whole          (¼, ⅓, ½, ⅔, ¾)
 *   S2  add, mixed denominators (5/12, 7/12, ⅚, 11/12)
 *   S3  add, MORE than 1        (1¼, 1⅓, 1½, 2¼)
 *   S4  subtract (trough)       total − used, remainder ≤ 1
 *   S5  subtract, mixed         total − used, mixed remainder
 *
 * Scoring: fill the gap exactly = 25 (matches the other farm challenges).
 */

export const PLANK_ROUNDS_PER_SET = 15;
const PLANK_STAGES = 5;
const PLANK_ROUNDS_PER_STAGE = PLANK_ROUNDS_PER_SET / PLANK_STAGES;
export const PLANK_ROUND_POINTS = 25;

// The whole unit is 12 twelfths — the shared grid.
export const PLANK_TWELFTHS = 12;

// The plank pile: each piece as an exact number of twelfths.
export const PLANK_PIECES = [
  { id: "half", tw: 6, label: "1/2", color: "#e0a800" },
  { id: "third", tw: 4, label: "1/3", color: "#3a7bd5" },
  { id: "quarter", tw: 3, label: "1/4", color: "#2a9d8f" },
  { id: "sixth", tw: 2, label: "1/6", color: "#e05780" },
  { id: "twelfth", tw: 1, label: "1/12", color: "#9b5de5" },
];

/** Which concept stage (0–4) a round index belongs to. Pure. */
export function plankStageFor(i) {
  return Math.max(0, Math.min(PLANK_STAGES - 1, Math.floor(i / PLANK_ROUNDS_PER_STAGE)));
}

function pick(list, rand) {
  return list[Math.floor(rand() * list.length)];
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

/** Format an integer number of TWELFTHS as a reduced (mixed) fraction. Pure. */
export function twDisplay(tw) {
  if (tw === 0) return "0";
  const whole = Math.floor(tw / PLANK_TWELFTHS);
  const rem = tw - whole * PLANK_TWELFTHS;
  if (rem === 0) return `${whole}`;
  const g = gcd(rem, PLANK_TWELFTHS) || 1;
  const frac = `${rem / g}/${PLANK_TWELFTHS / g}`;
  return whole ? `${whole} ${frac}` : frac;
}

// Addition targets per stage (in twelfths).
const ADD_TARGETS = [
  [3, 4, 6, 8, 9], // S1 — ¼ ⅓ ½ ⅔ ¾
  [5, 7, 10, 11], // S2 — 5/12 7/12 ⅚ 11/12
  [15, 16, 18, 20, 27], // S3 — 1¼ 1⅓ 1½ 1⅔ 2¼
];

// Subtraction rounds — { total, used } in twelfths; remaining = total − used.
const SUB_POOLS = [
  // S4 — remainder ≤ 1 whole.
  [
    { total: 12, used: 3 }, { total: 12, used: 4 }, { total: 12, used: 6 },
    { total: 18, used: 9 }, { total: 18, used: 12 }, { total: 24, used: 16 }, { total: 24, used: 18 },
  ],
  // S5 — bigger troughs, mixed remainders (incl. the brief's 3 − 1¾ = 1¼).
  [
    { total: 36, used: 21 }, { total: 36, used: 24 }, { total: 24, used: 9 },
    { total: 30, used: 18 }, { total: 24, used: 6 }, { total: 30, used: 12 },
  ],
];

const ITEMS = ["fence", "gate rail", "sheep run", "paddock rail"];

/** One round. roundIndex ∈ [0, 15); rand injectable for the checks. */
export function generatePlankRound(roundIndex, rand = Math.random) {
  const stage = plankStageFor(roundIndex);

  if (stage <= 2) {
    // ADDITION — fill a gap of `gapTw` from empty.
    const gapTw = pick(ADD_TARGETS[stage], rand);
    const item = pick(ITEMS, rand);
    return {
      roundIndex,
      stage,
      kind: "add",
      totalTw: gapTw,
      preTw: 0,
      gapTw,
      totalStr: twDisplay(gapTw),
      preStr: "0",
      gapStr: twDisplay(gapTw),
      prompt: `The gap in the ${item} is ${twDisplay(gapTw)} wide. Lay planks to fill it EXACTLY.`,
      reason: `The gap was ${twDisplay(gapTw)} = ${gapTw}/12 — every plank snaps to the twelfths grid, so the pieces just have to add up to ${gapTw}/12.`,
    };
  }

  // SUBTRACTION — the trough is `total`; `used` is pre-laid; fill the rest.
  const { total, used } = pick(SUB_POOLS[stage - 3], rand);
  const gapTw = total - used;
  return {
    roundIndex,
    stage,
    kind: "subtract",
    totalTw: total,
    preTw: used,
    gapTw,
    totalStr: twDisplay(total),
    preStr: twDisplay(used),
    gapStr: twDisplay(gapTw),
    prompt: `The trough is ${twDisplay(total)} long; you've already laid ${twDisplay(used)}. Fill the rest of the gap!`,
    reason: `${twDisplay(total)} − ${twDisplay(used)} = ${twDisplay(gapTw)} — that's the length left to fill.`,
  };
}

/**
 * A full set. Consecutive rounds never share the same gap-to-fill, so every
 * round is a fresh build.
 */
export function generatePlankSet(rand = Math.random) {
  const rounds = [];
  for (let i = 0; i < PLANK_ROUNDS_PER_SET; i++) {
    let round = generatePlankRound(i, rand);
    let guard = 0;
    while (i > 0 && guard < 30 && round.gapTw === rounds[i - 1].gapTw && round.kind === rounds[i - 1].kind) {
      round = generatePlankRound(i, rand);
      guard++;
    }
    rounds.push(round);
  }
  return rounds;
}

/** Sum a list of plank twelfth-values. Pure. */
export function sumPlanks(laid) {
  return laid.reduce((a, b) => a + b, 0);
}

/**
 * Grade a fill. `laidTw` is the total twelfths the student laid (NOT counting
 * the pre-filled portion). Correct when it fills the gap EXACTLY. Pure.
 */
export function gradePlank(round, laidTw) {
  const correct = laidTw === round.gapTw;
  return {
    correct,
    points: correct ? PLANK_ROUND_POINTS : 0,
    over: laidTw > round.gapTw,
    under: laidTw < round.gapTw,
    laidTw,
  };
}
