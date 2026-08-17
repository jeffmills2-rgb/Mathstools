/**
 * PENGUIN COLONY — PAIR THE PENGUINS (PC) — pure logic for the DOUBLES &
 * NEAR-DOUBLES challenge, the seventh Snowball Sums build. No React, no
 * stores — fully checkable headlessly. All values are small integers.
 *
 * PEDAGOGY — near-doubles as PAIRING: two rows of penguins waddle together
 * and pair off. 7 + 8 pairs up with ONE penguin left sticking out — so the
 * hidden double shows itself: double 7 and 1 more (or double 8 less 1 —
 * both are true, and BOTH score). The prediction comes BEFORE the pairing:
 * "which double is hiding in 7 + 8?" Exact doubles (7 + 7) pair perfectly.
 * The last stage plants the loveliest trick in the book: a DIFFERENCE OF
 * TWO (7 + 9) — one penguin waddles across and it's 8 + 8: DOUBLE THE
 * MIDDLE (levelling's little sibling). Grows to 25 + 26 and 35 + 36, where
 * near-doubling beats counting cold.
 *
 * A SET is 15 rounds, 3 per concept stage:
 *   S1  little near-doubles   4+5 … 9+10 (diff 1)
 *   S2  know your doubles     exact doubles 6+6 … 12+12
 *   S3  teen near-doubles     12+13 … 17+18
 *   S4  big near-doubles      24+25 … 38+39
 *   S5  the middle double     mixed — round 13 is ALWAYS a diff-2 pair
 *
 * Scoring (per round, max 25):
 *   A) PREDICT the hiding double (any TRUE form scores)  = 10
 *   B) TYPE the total after the pairs light up           = 15
 */

export const COLONY_ROUNDS_PER_SET = 15;
const COLONY_STAGES = 5;
const COLONY_ROUNDS_PER_STAGE = COLONY_ROUNDS_PER_SET / COLONY_STAGES;

export const COLONY_PREDICT_POINTS = 10;
export const COLONY_TOTAL_POINTS = 15;
export const COLONY_ROUND_POINTS = COLONY_PREDICT_POINTS + COLONY_TOTAL_POINTS; // 25
export const COLONY_MAX_SCORE = COLONY_ROUNDS_PER_SET * COLONY_ROUND_POINTS; // 375

// The diff-2 "double the middle" trap always lands mid-S5.
export const COLONY_MIDDLE_ROUND_INDEX = 13;

// Pairing pacing (3D layer + panel): one pair lights per beat; on diff-2
// rounds one penguin first waddles across (levelling's little sibling).
export const COLONY_PAIR_MS = 320;
export const COLONY_WADDLE_MS = 1100;

/** Which concept stage (0–4) a round index belongs to. Pure. */
export function colonyStageFor(i) {
  return Math.max(0, Math.min(COLONY_STAGES - 1, Math.floor(i / COLONY_ROUNDS_PER_STAGE)));
}

function randInt(min, max, rand) {
  return min + Math.floor(rand() * (max - min + 1));
}

function shuffle(list, rand) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Stage configs: the smaller addend's range + the difference on offer.
const COLONY_STAGE_CONFIGS = [
  { aMin: 4, aMax: 9, diffs: [1], name: "little near-doubles" },
  { aMin: 6, aMax: 12, diffs: [0], name: "know your doubles" },
  { aMin: 12, aMax: 17, diffs: [1], name: "teen near-doubles" },
  { aMin: 24, aMax: 38, diffs: [1], name: "big near-doubles" },
  { aMin: 6, aMax: 14, diffs: [0, 1, 2], name: "the middle double" },
];

/** A doubles-form label. kind: base ± adjust (adjust may be 0). Pure. */
export function colonyFormLabel(base, adjust) {
  if (adjust === 0) return `double ${base}`;
  return `double ${base} ${adjust > 0 ? "+" : "−"} ${Math.abs(adjust)}`;
}

/** Is `double base ± adjust` a TRUE reading of a + b? Pure. */
export function colonyFormTrue(round, base, adjust) {
  return 2 * base + adjust === round.total;
}

/**
 * Build the four prediction options for a pair (a ≤ b). Exactly the TRUE
 * forms among them are marked correct:
 *   diff 0 → "double a" (1 true)
 *   diff 1 → "double a + 1" AND "double b − 1" (2 true)
 *   diff 2 → "double m" where m is the MIDDLE (1 true)
 * Pure.
 */
export function colonyOptionsFor(round, rand = Math.random) {
  const { a, b, diff } = round;
  let candidates;
  if (diff === 0) {
    candidates = [
      { base: a, adjust: 0 },
      { base: a, adjust: 1 },
      { base: a, adjust: -1 },
      { base: a + 1, adjust: 0 },
    ];
  } else if (diff === 1) {
    candidates = [
      { base: a, adjust: 1 },
      { base: b, adjust: -1 },
      { base: a, adjust: -1 },
      { base: b, adjust: 1 },
    ];
  } else {
    const m = a + 1; // the middle
    candidates = [
      { base: m, adjust: 0 },
      { base: a, adjust: 1 },
      { base: b, adjust: -1 },
      { base: b, adjust: 1 },
    ];
  }
  return shuffle(
    candidates.map((c) => ({
      ...c,
      label: colonyFormLabel(c.base, c.adjust),
      correct: colonyFormTrue(round, c.base, c.adjust),
    })),
    rand
  );
}

/** One round. roundIndex ∈ [0, 15); rand injectable for the checks. */
export function generateColonyRound(roundIndex, rand = Math.random) {
  const stage = colonyStageFor(roundIndex);
  const cfg = COLONY_STAGE_CONFIGS[stage];
  const middle = roundIndex === COLONY_MIDDLE_ROUND_INDEX;

  const diff = middle ? 2 : cfg.diffs[Math.floor(rand() * cfg.diffs.length)];
  const a = randInt(cfg.aMin, cfg.aMax, rand);
  const b = a + diff;
  const total = a + b;

  const round = {
    roundIndex,
    stage,
    stageName: cfg.name,
    a,
    b,
    diff,
    total,
    pairs: a, // full pairs after alignment (diff-2 pairs a+1 after the waddle)
    middleBase: diff === 2 ? a + 1 : null,
    options: [],
    prompt:
      diff === 0
        ? `${a} + ${b} — the rows pair up perfectly. Which double is that?`
        : `${a} + ${b} — which double is hiding in there?`,
    reason:
      diff === 0
        ? `${a} + ${b} is exactly double ${a} = ${total}.`
        : diff === 1
          ? `${a} + ${b} is double ${a} + 1 (or double ${b} − 1) = ${total} — one penguin sticks out of the pairs.`
          : `${a} + ${b} has a gap of 2 — one penguin waddles across and it's ${a + 1} + ${a + 1}: DOUBLE THE MIDDLE, ${total}.`,
  };
  round.options = colonyOptionsFor(round, rand);
  return round;
}

/**
 * A full set. Consecutive rounds never repeat the same (a, b) pair, so
 * every huddle is fresh.
 */
export function generateColonySet(rand = Math.random) {
  const rounds = [];
  for (let i = 0; i < COLONY_ROUNDS_PER_SET; i++) {
    let round = generateColonyRound(i, rand);
    let guard = 0;
    while (
      i > 0 && guard < 30 &&
      round.a === rounds[i - 1].a && round.b === rounds[i - 1].b
    ) {
      round = generateColonyRound(i, rand);
      guard++;
    }
    rounds.push(round);
  }
  return rounds;
}

/** Grade Part A — the chosen option index. ANY true form scores. Pure. */
export function gradeColonyPredict(round, optionIndex) {
  const opt = round.options[optionIndex];
  const correct = Boolean(opt && opt.correct);
  return {
    correct,
    optionIndex,
    points: correct ? COLONY_PREDICT_POINTS : 0,
    label: correct
      ? `🐧 ${opt.label} — that's the one! +${COLONY_PREDICT_POINTS} pts`
      : opt
        ? `${opt.label} makes ${2 * opt.base + opt.adjust}, not ${round.total}!`
        : "Pick a double!",
  };
}

/** Grade Part B — the TYPED total. Pure. */
export function checkColonyTotal(round, text) {
  const cleaned = String(text || "").replace(/\s/g, "");
  if (!/^\d+$/.test(cleaned)) return { valid: false, correct: false };
  return { valid: true, correct: Number(cleaned) === round.total };
}
