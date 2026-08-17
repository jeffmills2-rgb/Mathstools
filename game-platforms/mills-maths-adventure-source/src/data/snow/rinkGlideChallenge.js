/**
 * THE ICE RINK — GLIDE BY TENS (RG) — pure logic for the JUMP-STRATEGY
 * challenge, the second Snowball Sums build. No React, no stores — fully
 * checkable headlessly. All values are small integers — no float dust.
 *
 * PEDAGOGY — the EMPTY NUMBER LINE, travelled bodily: the rink's ice is a
 * giant 0–100 number line. Fern's penguin starts on one number and must
 * glide to EXACTLY another. The student plans a QUEUE of pushes (+10 / +1,
 * and later −10 / −1) BEFORE the glide — then watches the penguin skate the
 * jumps one by one. Big jumps carry it a whole ten; little scoots move it
 * one. Landing exactly scores; planning the FEWEST pushes scores more, so
 * 37 → 82 as +10 ×4, +1 ×5 (9 pushes) beats forty-five little shoves — and
 * 38 → 77 is best glided +10 ×4 to 78... no: 38+40=78, then −1 (5 pushes):
 * OVERSHOOT AND STEP BACK, the compensation strategy discovered on ice.
 *
 * A SET is 15 rounds, 3 per concept stage:
 *   S1  jump forward          +10/+1 only, no overshoot advantage
 *   S2  jump back             −10/−1 only (subtraction as jumping back)
 *   S3  overshoot forward     ones digit 8–9: gliding an extra ten then
 *                             stepping back wins (all four pushes allowed)
 *   S4  overshoot back        the same discovery in reverse
 *   S5  skater's choice       any direction, any ones digit, all pushes
 *
 * Scoring (per round, max 25 — matches every other in-world challenge):
 *   A) LAND exactly on the target                       = 15
 *   B) EFFICIENCY (only when landed): fewest possible
 *      pushes = 10 · within 2 of fewest = 6 · else 3
 */

export const RINK_ROUNDS_PER_SET = 15;
const RINK_STAGES = 5;
const RINK_ROUNDS_PER_STAGE = RINK_ROUNDS_PER_SET / RINK_STAGES;

export const RINK_LAND_POINTS = 15;
export const RINK_EFF_BANDS = [
  { over: 0, points: 10, label: "🎯 Champion glide — fewest pushes!" },
  { over: 2, points: 6, label: "Nearly the fewest!" },
  { over: Infinity, points: 3, label: "Landed — now try fewer pushes" },
];
export const RINK_ROUND_POINTS = RINK_LAND_POINTS + RINK_EFF_BANDS[0].points; // 25
export const RINK_MAX_SCORE = RINK_ROUNDS_PER_SET * RINK_ROUND_POINTS; // 375

// The line runs 0–100; every start/target keeps inside these so flags and
// overshoots always stay on the ice.
export const RINK_LINE_MIN = 0;
export const RINK_LINE_MAX = 100;

// Plans are queued, not typed — cap the queue so "sixty-nine +1s" is never a
// plan (the cap still fits every tens-and-ones route: max 6 tens + 9 ones).
export const RINK_MAX_QUEUE = 24;

// Glide pacing (shared by the 3D layer + panel): one push per beat.
export const RINK_PUSH_MS = 620;
export const RINK_GLIDE_TAIL_MS = 700;

/** Which concept stage (0–4) a round index belongs to. Pure. */
export function rinkStageFor(i) {
  return Math.max(0, Math.min(RINK_STAGES - 1, Math.floor(i / RINK_ROUNDS_PER_STAGE)));
}

function randInt(min, max, rand) {
  return min + Math.floor(rand() * (max - min + 1));
}

// Stage configs — SOLUTIONS FIRST: choose the difference's tens + ones and
// the direction, then place the start so the whole route (including the
// overshoot ten, where allowed) stays on the 0–100 line.
//   dir        +1 forward, −1 back, 0 = random per round
//   onesMin/Max  the difference's ones digit (never 0 — a pure-tens glide
//                would need no ones thinking)
//   four       all four pushes available (overshoot possible)
const RINK_STAGE_CONFIGS = [
  { dir: +1, tensMin: 1, tensMax: 6, onesMin: 1, onesMax: 4, four: false, name: "jump forward" },
  { dir: -1, tensMin: 1, tensMax: 6, onesMin: 1, onesMax: 4, four: false, name: "jump back" },
  { dir: +1, tensMin: 1, tensMax: 4, onesMin: 8, onesMax: 9, four: true, name: "overshoot forward" },
  { dir: -1, tensMin: 1, tensMax: 4, onesMin: 8, onesMax: 9, four: true, name: "overshoot back" },
  { dir: 0, tensMin: 1, tensMax: 6, onesMin: 1, onesMax: 9, four: true, name: "skater's choice" },
];

/**
 * Fewest pushes to travel |diff| with the round's buttons. Two buttons:
 * tens + ones. Four buttons: gliding k tens then stepping the remainder
 * (either direction) — min over k of k + |d − 10k|. Pure.
 */
export function minPushesFor(diff, four) {
  const d = Math.abs(diff);
  if (!four) return Math.floor(d / 10) + (d % 10);
  let best = Infinity;
  for (let k = 0; k <= 12; k++) best = Math.min(best, k + Math.abs(d - 10 * k));
  return best;
}

/** The optimal tens-count k for a four-button route (for the reason text). */
function bestTensFor(d) {
  let bestK = 0;
  let best = Infinity;
  for (let k = 0; k <= 12; k++) {
    const cost = k + Math.abs(d - 10 * k);
    if (cost < best) { best = cost; bestK = k; }
  }
  return bestK;
}

/** Human route for the reason card: the optimal plan, described. Pure. */
export function routeText(round) {
  const d = Math.abs(round.diff);
  const sign = round.diff > 0 ? "+" : "−";
  const stepSign = (v) => (v > 0 ? `+${v}` : `−${Math.abs(v)}`);
  const k = round.four ? bestTensFor(d) : Math.floor(d / 10);
  const afterTens = round.start + round.dir * 10 * k;
  const remainder = round.target - afterTens; // signed ones steps
  const parts = [];
  if (k > 0) parts.push(`${sign}10 ×${k} → ${afterTens}`);
  if (remainder !== 0) parts.push(`${stepSign(Math.sign(remainder))} ×${Math.abs(remainder)} → ${round.target}`);
  const overshot = Math.sign(remainder) === -round.dir && remainder !== 0;
  return `${round.start}: ${parts.join(", ")} — ${round.minPushes} push${round.minPushes === 1 ? "" : "es"}${overshot ? " (overshoot, then step back!)" : ""}.`;
}

/** One round. roundIndex ∈ [0, 15); rand injectable for the checks. */
export function generateRinkRound(roundIndex, rand = Math.random) {
  const stage = rinkStageFor(roundIndex);
  const cfg = RINK_STAGE_CONFIGS[stage];
  const dir = cfg.dir === 0 ? (rand() < 0.5 ? 1 : -1) : cfg.dir;

  const tens = randInt(cfg.tensMin, cfg.tensMax, rand);
  const ones = randInt(cfg.onesMin, cfg.onesMax, rand);
  const d = tens * 10 + ones;

  // Room for the whole route: with four pushes the glide may pass one ten
  // BEYOND the target, so keep start + dir·10·(tens+1) on the line too.
  const reach = 10 * (tens + (cfg.four ? 1 : 0));
  let start;
  let guard = 0;
  do {
    start = dir > 0
      ? randInt(3, Math.min(97 - d, RINK_LINE_MAX - reach), rand)
      : randInt(Math.max(3 + d, RINK_LINE_MIN + reach), 97, rand);
    guard++;
  } while (start % 10 === 0 && guard < 20);
  const target = start + dir * d;
  const diff = target - start;
  const buttons = cfg.four ? [10, 1, -10, -1] : dir > 0 ? [10, 1] : [-10, -1];
  const minPushes = minPushesFor(diff, cfg.four);

  const round = {
    roundIndex,
    stage,
    stageName: cfg.name,
    start,
    target,
    diff,
    dir,
    four: cfg.four,
    buttons,
    minPushes,
    prompt: `Glide the penguin from ${start} to exactly ${target} — plan your pushes, then GO!`,
    reason: "",
  };
  round.reason = `Fewest pushes: ${routeText(round)}`;
  return round;
}

/**
 * A full set. Consecutive rounds never repeat the same (start, target) pair,
 * so every glide is a fresh trip.
 */
export function generateRinkSet(rand = Math.random) {
  const rounds = [];
  for (let i = 0; i < RINK_ROUNDS_PER_SET; i++) {
    let round = generateRinkRound(i, rand);
    let guard = 0;
    while (
      i > 0 && guard < 30 &&
      round.start === rounds[i - 1].start && round.target === rounds[i - 1].target
    ) {
      round = generateRinkRound(i, rand);
      guard++;
    }
    rounds.push(round);
  }
  return rounds;
}

/**
 * Grade a planned queue (an array of pushes, each ±10/±1). Landing exactly
 * earns the land points; efficiency is banded against the fewest possible
 * pushes for THIS round's buttons. Pure.
 */
export function gradeGlide(round, queue) {
  const legal = queue.length > 0 && queue.length <= RINK_MAX_QUEUE &&
    queue.every((v) => round.buttons.includes(v));
  const sum = queue.reduce((a, v) => a + v, 0);
  const finalValue = round.start + sum;
  const landed = legal && finalValue === round.target;
  if (!landed) {
    return { landed: false, legal, finalValue, sum, pushes: queue.length, points: 0, effPoints: 0, effLabel: "" };
  }
  const over = queue.length - round.minPushes;
  const band = RINK_EFF_BANDS.find((b) => over <= b.over) || RINK_EFF_BANDS[RINK_EFF_BANDS.length - 1];
  return {
    landed: true,
    legal,
    finalValue,
    sum,
    pushes: queue.length,
    points: RINK_LAND_POINTS + band.points,
    effPoints: band.points,
    effLabel: band.label,
  };
}

/**
 * The running value after each push of a queue (for the glide animation +
 * the live chip): [start, after push 1, after push 2, …]. Pure.
 */
export function glideStops(round, queue) {
  const stops = [round.start];
  let v = round.start;
  for (const p of queue) {
    v += p;
    stops.push(v);
  }
  return stops;
}
