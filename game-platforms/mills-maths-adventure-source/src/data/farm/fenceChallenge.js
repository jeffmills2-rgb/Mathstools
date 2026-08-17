/**
 * FENCE CHALLENGE (F2) — pure logic for the farm's flagship in-world
 * challenge: "walk to a fraction of the way along the fence and place an
 * item". No React, no stores — fully checkable headlessly.
 *
 * A SET is 5 rounds with a fixed concept progression (mirroring the
 * curriculum convention that ORDER carries the concept, randomised VALUES
 * carry variety):
 *   1  halves & quarters          (fraction display)
 *   2  thirds & fifths            (fraction display)
 *   3  non-unit fractions         (fraction display)
 *   4  tenths as a DECIMAL        ("0.7 of the way")
 *   5  PERCENT                    ("60% of the way")
 *
 * Distances are measured FROM a named end post (red = west, blue = east) so
 * students must attend to direction, not just magnitude. 1 unit = 1 metre.
 * Solutions first: each round stores the exact target distance from the RED
 * post; grading is a tolerance band on the placed distance.
 */
import { CHALLENGE_FENCE_LENGTH } from "./farmLayout.js";

// 15 rounds per set (teacher feedback): the 5-concept arc below is walked in
// order with THREE rounds per concept (values re-randomised every round).
export const ROUNDS_PER_SET = 15;
const CONCEPT_STAGES = 5;
const ROUNDS_PER_STAGE = ROUNDS_PER_SET / CONCEPT_STAGES;

/** Which concept stage (0–4) a round index belongs to. Pure. */
export function stageForRound(i) {
  return Math.max(0, Math.min(CONCEPT_STAGES - 1, Math.floor(i / ROUNDS_PER_STAGE)));
}

// Within ±4.5% of the fence length (1.8 m on the 40 m fence) counts as placed —
// this is ESTIMATION by proportional reasoning (no live tape measure shown), so
// the band is generous, but stays BELOW half the gap between neighbouring
// tenths so two different answers can never both grade correct.
export const PLACEMENT_TOLERANCE = Math.max(1.0, 0.045 * CHALLENGE_FENCE_LENGTH);

// Things the farmer asks you to place — cosmetic variety only.
const ITEMS = ["gate", "water trough", "lantern", "bird box", "feed bucket"];

// Value pools per round (num/den kept as integers so displays are exact).
const POOLS = [
  [ { n: 1, d: 2 }, { n: 1, d: 4 }, { n: 3, d: 4 } ],
  [ { n: 1, d: 3 }, { n: 2, d: 3 }, { n: 1, d: 5 }, { n: 2, d: 5 } ],
  [ { n: 3, d: 5 }, { n: 4, d: 5 }, { n: 3, d: 8 }, { n: 5, d: 8 }, { n: 7, d: 8 } ],
  [ { n: 1, d: 10 }, { n: 3, d: 10 }, { n: 7, d: 10 }, { n: 9, d: 10 } ],
  [ { n: 1, d: 4 }, { n: 2, d: 5 }, { n: 3, d: 5 }, { n: 3, d: 4 }, { n: 17, d: 20 } ],
];
const KINDS = ["fraction", "fraction", "fraction", "decimal", "percent"];

function pick(list, rand) {
  return list[Math.floor(rand() * list.length)];
}

/** How the value is SHOWN to the student for this round's kind. */
export function displayValue(kind, n, d) {
  if (kind === "decimal") return String(Math.round((n / d) * 100) / 100);
  if (kind === "percent") return `${Math.round((n / d) * 100)}%`;
  return `${n}/${d}`;
}

/** One round. roundIndex ∈ [0, ROUNDS_PER_SET); rand injectable. */
export function generateRound(roundIndex, rand = Math.random) {
  const i = stageForRound(roundIndex);
  const kind = KINDS[i];
  const { n, d } = pick(POOLS[i], rand);
  const fromEnd = rand() < 0.5 ? "red" : "blue";
  const item = pick(ITEMS, rand);
  const value = n / d;
  const L = CHALLENGE_FENCE_LENGTH;
  // The exact answer, always stored as a distance from the RED (west) post.
  const targetFromRed = fromEnd === "red" ? value * L : L - value * L;
  return {
    roundIndex,
    stage: i,
    kind,
    n,
    d,
    value,
    display: displayValue(kind, n, d),
    fromEnd,
    item,
    length: L,
    targetFromRed,
    prompt:
      `This fence is ${L} m long. ` +
      `Place the ${item} ${displayValue(kind, n, d)} of the way along the fence, ` +
      `starting from the ${fromEnd.toUpperCase()} post.`,
  };
}

/**
 * A full set. Consecutive rounds are guaranteed to have CLEARLY different
 * target positions (more than twice the tolerance band apart), so the bird
 * must actually be moved every round — never "same spot, press Enter again".
 */
export const MIN_CONSECUTIVE_TARGET_GAP = PLACEMENT_TOLERANCE * 2.2;

export function generateRoundSet(rand = Math.random) {
  const rounds = [];
  for (let i = 0; i < ROUNDS_PER_SET; i++) {
    let round = generateRound(i, rand);
    let guard = 0;
    while (
      i > 0 &&
      Math.abs(round.targetFromRed - rounds[i - 1].targetFromRed) <= MIN_CONSECUTIVE_TARGET_GAP &&
      guard < 40
    ) {
      round = generateRound(i, rand);
      guard++;
    }
    rounds.push(round);
  }
  return rounds;
}

/**
 * SCORE BANDS — graded points by closeness (fraction of the fence length),
 * tuned so progress isn't free but a near miss still pays: a perfect strike
 * is celebrated ("BULLSEYE!"), the old ±4.5% band still "counts", and even a
 * warm attempt earns something so students keep playing. Ordered tightest
 * band first; `frac` is the max error as a fraction of the length.
 */
export const SCORE_BANDS = [
  { id: "bullseye", frac: 0.0125, points: 25, label: "🎯 BULLSEYE!" }, // ≤ 0.5 m on 40 m
  { id: "spot-on", frac: 0.045, points: 15, label: "Spot on!" },       // ≤ 1.8 m
  { id: "close", frac: 0.09, points: 8, label: "So close!" },          // ≤ 3.6 m
  { id: "warm", frac: 0.15, points: 3, label: "Getting there" },       // ≤ 6 m
  { id: "miss", frac: Infinity, points: 0, label: "Missed it" },
];
export const MAX_ROUND_POINTS = SCORE_BANDS[0].points;

/** Which band an error (in metres) falls into. Pure. */
export function bandForError(errorM, length = CHALLENGE_FENCE_LENGTH) {
  const frac = errorM / length;
  return SCORE_BANDS.find((b) => frac <= b.frac) || SCORE_BANDS[SCORE_BANDS.length - 1];
}

/**
 * Grade a placement. `placedFromRed` is the placed distance from the RED post
 * in metres. Pure — returns { correct, band, points, label, errorM,
 * targetFromRed, tolerance }. `correct` keeps its original meaning (within
 * the ±4.5% band, i.e. spot-on or better).
 */
export function gradePlacement(round, placedFromRed) {
  const errorM = Math.abs(placedFromRed - round.targetFromRed);
  const band = bandForError(errorM, round.length);
  return {
    correct: errorM <= PLACEMENT_TOLERANCE,
    band: band.id,
    points: band.points,
    label: band.label,
    errorM: Math.round(errorM * 10) / 10,
    targetFromRed: round.targetFromRed,
    tolerance: PLACEMENT_TOLERANCE,
  };
}

/** Feedback line for one graded placement (encouraging, specific). */
export function feedbackFor(round, grade) {
  const exact = `${round.display} of ${round.length} m = ${Math.round((round.value * round.length) * 10) / 10} m from the ${round.fromEnd} post`;
  const off = grade.errorM <= 0.05 ? "dead centre" : `${grade.errorM} m off`;
  return `${exact}. You were ${off} — +${grade.points} points.`;
}
