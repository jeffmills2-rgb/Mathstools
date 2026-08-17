/**
 * THE ROUND-UP (F3) — pure logic for the farm's second in-world challenge:
 * "herd a fraction / decimal / percentage OF THE HERD into the sorting pen".
 * No React, no stores — fully checkable headlessly.
 *
 * PEDAGOGY — fraction of an AMOUNT via the EQUAL-GROUPS model:
 *   n/d of N  →  split N into d equal groups (N ÷ d = g per group),
 *                take n groups (g × n = the answer).
 * Every round is built SOLUTIONS-FIRST: pick the denominator d and the group
 * size g, set the herd N = d × g, so the answer n × g is ALWAYS a whole
 * number of cows. Decimals are taught as TENTHS (0.7 → 7/10 → ten groups),
 * percentages via BENCHMARKS (25/50/75% → quarters/halves; multiples of 10%
 * → tenths), so all three notations resolve to the same groups picture.
 * After grading, the herd REARRANGES into those d equal groups in the field
 * with the n counted groups highlighted — the reveal IS the model.
 *
 * A SET is 5 rounds, concept order fixed (order carries the concept,
 * randomised values carry variety):
 *   1  unit fraction of the herd        (1/2, 1/3, 1/4 — pure sharing)
 *   2  non-unit fraction                (divide THEN multiply)
 *   3  harder non-unit                  (fifths & eighths)
 *   4  DECIMAL of the herd              (tenths: "0.7 of the herd")
 *   5  PERCENT of the herd              (benchmarks: 25/50/75% or tens)
 *
 * Grading is EXACT (a count of cows is discrete — unlike the fence's
 * estimation band). The live pen count is shown to the student: the skill
 * being built is multiplicative reasoning, not counting.
 */
import {
  ROUNDUP_PEN,
  ROUNDUP_FIELD,
  ROUNDUP_IDLE_HERD,
} from "./farmLayout.js";
import { displayValue } from "./fenceChallenge.js";

// 15 rounds per set (teacher feedback): the 5-concept arc is walked in order
// with THREE rounds per concept (herds re-dealt every round).
export const ROUNDUP_ROUNDS_PER_SET = 15;
const RU_STAGES = 5;
const RU_ROUNDS_PER_STAGE = ROUNDUP_ROUNDS_PER_SET / RU_STAGES;

/** Which concept stage (0–4) a round index belongs to. Pure. */
export function roundUpStageFor(i) {
  return Math.max(0, Math.min(RU_STAGES - 1, Math.floor(i / RU_ROUNDS_PER_STAGE)));
}

export const MAX_HERD = 20;
export const HERD_RADIUS = 8; // how close the player must be to herd a cow

function pick(list, rand) {
  return list[Math.floor(rand() * list.length)];
}

/**
 * One round. roundIndex ∈ [0, 4]; rand injectable for the checks.
 * Returns { roundIndex, kind, n, d, pct?, display, herd, groupSize, target,
 *           prompt, reasoning }.
 */
export function generateRoundUpRound(roundIndex, rand = Math.random) {
  const i = roundUpStageFor(roundIndex);
  let kind = "fraction";
  let n, d, pct = null;

  if (i === 0) {
    // Unit fractions — pure sharing into equal groups.
    d = pick([2, 3, 4], rand);
    n = 1;
  } else if (i === 1) {
    // Non-unit — divide then multiply.
    d = pick([3, 4, 5], rand);
    n = pick(d === 3 ? [2] : d === 4 ? [3] : [2, 3, 4], rand);
  } else if (i === 2) {
    // Harder non-unit — fifths & eighths.
    d = pick([5, 8], rand);
    n = pick(d === 5 ? [2, 3, 4] : [3, 5, 7], rand);
  } else if (i === 3) {
    // Decimal — always read as tenths.
    kind = "decimal";
    d = 10;
    n = pick([1, 3, 7, 9], rand);
  } else {
    // Percent — benchmarks: quarters/halves, or multiples of 10%.
    kind = "percent";
    if (rand() < 0.5) {
      pct = pick([25, 50, 75], rand);
      if (pct === 25) { n = 1; d = 4; }
      else if (pct === 50) { n = 1; d = 2; }
      else { n = 3; d = 4; }
    } else {
      n = pick([2, 3, 4, 6, 7, 8, 9], rand); // skip 1 & 5 (too close to R4/halves)
      d = 10;
      pct = n * 10;
    }
  }

  // Solutions-first: herd = d × groupSize, capped at MAX_HERD, min 6 cows.
  const maxG = Math.floor(MAX_HERD / d);
  const minG = d * 2 >= 6 ? 2 : Math.ceil(6 / d);
  const groupSize = minG + Math.floor(rand() * (maxG - minG + 1));
  const herd = d * groupSize;
  const target = n * groupSize;

  const display = kind === "percent" ? `${pct}%` : displayValue(kind, n, d);
  const frac = `${n}/${d}`;
  const share = `${herd} ÷ ${d} = ${groupSize} in each group`;
  const take = n === 1 ? `take 1 group → ${target} cows` : `take ${n} groups: ${groupSize} × ${n} = ${target} cows`;
  let reasoning;
  if (kind === "fraction") {
    reasoning = `${frac} of ${herd}: split the herd into ${d} equal groups — ${share} — then ${take}.`;
  } else if (kind === "decimal") {
    reasoning = `${display} is ${n} tenths, so ${frac} of ${herd}: ${share} — then ${take}.`;
  } else {
    reasoning = `${display} of ${herd}: ${display} = ${frac}, so ${share} — then ${take}.`;
  }

  return {
    roundIndex,
    stage: i,
    kind,
    n,
    d,
    pct,
    display,
    herd,
    groupSize,
    target,
    prompt: `Your herd has ${herd} cows. Round up ${display} of the herd into the Sorting Pen!`,
    reasoning,
  };
}

/** A full 5-round set. */
export function generateRoundUpSet(rand = Math.random) {
  const rounds = [];
  for (let i = 0; i < ROUNDUP_ROUNDS_PER_SET; i++) rounds.push(generateRoundUpRound(i, rand));
  return rounds;
}

/** Grade a round-up: exact count required. Pure. */
export function gradeRoundUp(round, pennedCount) {
  const diff = pennedCount - round.target;
  return { correct: diff === 0, penned: pennedCount, target: round.target, diff };
}

/** Feedback line (the reveal shows the groups; this names the result). */
export function roundUpFeedback(round, grade) {
  if (grade.correct) return `Exactly right — ${round.display} of ${round.herd} is ${round.target} cows. ${round.reasoning}`;
  const dir = grade.diff > 0 ? `${grade.diff} too many` : `${-grade.diff} too few`;
  return `You penned ${grade.penned} — that's ${dir}. ${round.reasoning}`;
}

// ==========================================================================
// GEOMETRY — spot layouts (pure; rand injectable). All inside the layout's
// field/pen rects so cows never spawn in a fence or wander off.
// ==========================================================================

/** Random grazing spots in the herd field, min 1.5 m apart (grid fallback). */
export function fieldSpots(count, rand = Math.random) {
  const { x1, z1, x2, z2 } = ROUNDUP_FIELD;
  const spots = [];
  let guard = 0;
  while (spots.length < count && guard < 3000) {
    guard++;
    const x = x1 + 0.7 + rand() * (x2 - x1 - 1.4);
    const z = z1 + 0.7 + rand() * (z2 - z1 - 1.4);
    if (spots.every((s) => Math.hypot(s[0] - x, s[1] - z) >= 1.5)) spots.push([x, z]);
  }
  // Deterministic grid fallback (never leaves a cow without a spot).
  let k = 0;
  while (spots.length < count) {
    spots.push([x1 + 1 + (k % 9) * 1.5, z1 + 1 + Math.floor(k / 9) * 1.5]);
    k++;
  }
  return spots;
}

/** Grid slots inside the sorting pen (row-major, up to MAX_HERD). */
export function penSlots(count) {
  const cols = 5;
  const spacingX = (ROUNDUP_PEN.w - 2.4) / (cols - 1);
  const spacingZ = 1.25;
  const x0 = ROUNDUP_PEN.x - (ROUNDUP_PEN.w - 2.4) / 2;
  const z0 = ROUNDUP_PEN.z - (ROUNDUP_PEN.d - 2.6) / 2;
  const slots = [];
  for (let i = 0; i < count; i++) {
    slots.push([x0 + (i % cols) * spacingX, z0 + Math.floor(i / cols) * spacingZ]);
  }
  return slots;
}

/**
 * The EQUAL-GROUPS reveal formation: d columns (one per group) × groupSize
 * rows, centred in the herd field. The first n columns are the "counted"
 * groups → highlight: true. Returns [{ x, z, highlight, group }] with one
 * slot per cow (herd = d × groupSize).
 */
export function formationSlots(round) {
  const { d, n, groupSize, herd } = round;
  const { x1, z1, x2, z2 } = ROUNDUP_FIELD;
  const cx = (x1 + x2) / 2;
  const cz = (z1 + z2) / 2;
  const colGap = Math.min(1.6, (x2 - x1 - 1.2) / Math.max(1, d - 1 || 1));
  const rowGap = Math.min(1.3, (z2 - z1 - 1.2) / Math.max(1, groupSize - 1 || 1));
  const slots = [];
  for (let c = 0; c < d; c++) {
    for (let r = 0; r < groupSize; r++) {
      slots.push({
        x: cx + (c - (d - 1) / 2) * colGap,
        z: cz + (r - (groupSize - 1) / 2) * rowGap,
        highlight: c < n,
        group: c,
      });
    }
  }
  return slots.slice(0, herd);
}

export { ROUNDUP_IDLE_HERD };
