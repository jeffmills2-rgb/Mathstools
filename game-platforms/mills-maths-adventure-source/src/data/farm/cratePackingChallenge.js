/**
 * CRATE PACKING (F6) — pure logic for the HCF challenge: two harvests (e.g.
 * 24 apples and 36 pears) must be packed into IDENTICAL crates with nothing
 * left over — and the biggest crate that works is the HCF, discovered by
 * doing. No React, no stores — fully checkable headlessly.
 *
 * PEDAGOGY — HCF via the COMMON-GROUPS model:
 *   choosing a GROUP SIZE s splits a pile of N into equal groups ⟺ s is a
 *   factor of N; s splits BOTH piles ⟺ s is a common factor; the biggest
 *   such s = HCF. The 3D layer ANIMATES the split — every fruit flies into
 *   groups of s (or spills), so the division-into-groups is watched, not
 *   imagined.
 *
 * A SET is 15 rounds, 3 per concept stage:
 *   S1  small pairs, HCF 2–3 (incl. one pile = one group)
 *   S2  HCF 4–5
 *   S3  HCF 6–8
 *   S4  big pairs, HCF 8–12
 *   S5  coprime traps (HCF 1 — no bigger group works) + large HCFs
 *
 * Solutions-first: pick the HCF h and coprime multipliers a, b, so the piles
 * are N₁ = h·a and N₂ = h·b and gcd(N₁, N₂) is EXACTLY h. Piles cap at 36
 * so the 3D fruit stays readable. Grading: HCF = 25 pts; a smaller common
 * factor still packs (8 pts — "you could go bigger"); a non-factor spills
 * fruit (0 pts).
 */
import { CRATE_SIZES } from "./farmLayout.js";

export const CRATE_ROUNDS_PER_SET = 15;
const CRATE_STAGES = 5;
const CRATE_ROUNDS_PER_STAGE = CRATE_ROUNDS_PER_SET / CRATE_STAGES;

export const CRATE_MAX_PILE = 36;
export const CRATE_FULL_POINTS = 25;
export const CRATE_COMMON_POINTS = 8;

/** Which concept stage (0–4) a round index belongs to. Pure. */
export function crateStageFor(i) {
  return Math.max(0, Math.min(CRATE_STAGES - 1, Math.floor(i / CRATE_ROUNDS_PER_STAGE)));
}

export function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

/** All factors of n, ascending. Pure. */
export function factorsOf(n) {
  const out = [];
  for (let f = 1; f <= n; f++) if (n % f === 0) out.push(f);
  return out;
}

function pick(list, rand) {
  return list[Math.floor(rand() * list.length)];
}

// Coprime multiplier pairs (a, b) with a ≤ b — kept small so piles stay ≤ 36.
const COPRIME_PAIRS = [
  [1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [2, 7], [3, 7],
];

// Per-stage HCF pools (every value is in the CRATE_SIZES palette).
const HCF_POOLS = [
  [2, 3],
  [4, 5],
  [6, 8],
  [8, 12],
  [1, 12],        // coprime traps + large HCFs
];

// Coprime pile pairs for HCF-1 rounds (both ≤ 36, both ≥ 5, gcd 1, neither
// divisible by the other so "1" is genuinely the only crate that works).
const COPRIME_PILES = [
  [5, 7], [7, 9], [8, 15], [9, 16], [10, 21], [15, 16], [9, 25], [16, 21],
];

/**
 * One round. roundIndex ∈ [0, 15); rand injectable for the checks.
 */
export function generateCrateRound(roundIndex, rand = Math.random) {
  const stage = crateStageFor(roundIndex);
  const hcf = pick(HCF_POOLS[stage], rand);
  let n1;
  let n2;

  if (hcf === 1) {
    [n1, n2] = pick(COPRIME_PILES, rand);
  } else {
    const pairs = COPRIME_PAIRS.filter(([, b]) => hcf * b <= CRATE_MAX_PILE);
    const [a, b] = pick(pairs, rand);
    n1 = hcf * a;
    n2 = hcf * b;
  }

  const common = factorsOf(gcd(n1, n2));
  return {
    roundIndex,
    stage,
    n1,
    n2,
    hcf,
    common, // all common factors (ascending)
    prompt: `${n1} apples and ${n2} pears. Both piles must use the same group size — tap the biggest size that leaves no fruit over in either pile.`,
  };
}

/** A full 15-round set. */
export function generateCrateSet(rand = Math.random) {
  const rounds = [];
  for (let i = 0; i < CRATE_ROUNDS_PER_SET; i++) rounds.push(generateCrateRound(i, rand));
  return rounds;
}

/**
 * How a chosen crate size packs one pile: full crates + leftover. Pure.
 */
export function packPlan(pile, size) {
  return { crates: Math.floor(pile / size), leftover: pile % size };
}

/**
 * Grade a crate choice. Returns { result: "hcf"|"common"|"spill", correct,
 * points, plans: [packPlan, packPlan] }.
 */
export function gradeCrate(round, size) {
  const divides = round.n1 % size === 0 && round.n2 % size === 0;
  const result = !divides ? "spill" : size === round.hcf ? "hcf" : "common";
  return {
    result,
    correct: result === "hcf",
    points: result === "hcf" ? CRATE_FULL_POINTS : result === "common" ? CRATE_COMMON_POINTS : 0,
    chosen: size,
    plans: [packPlan(round.n1, size), packPlan(round.n2, size)],
  };
}

/** Feedback: the factor story in groups language. */
export function crateFeedback(round, grade) {
  const { n1, n2, hcf, common } = round;
  const factors = `Common factors of ${n1} and ${n2}: ${common.join(", ")} — HCF = ${hcf}.`;
  if (grade.result === "hcf") {
    return hcf === 1
      ? `Right — only groups of 1 work: ${n1} and ${n2} share no bigger factor. ${factors}`
      : `Biggest group found! ${n1} splits into ${n1 / hcf} groups of ${hcf}, and ${n2} into ${n2 / hcf} groups. ${factors}`;
  }
  if (grade.result === "common") {
    return `Groups of ${grade.chosen} DO split both piles evenly — but bigger was possible. ${factors}`;
  }
  const l1 = grade.plans[0].leftover;
  const l2 = grade.plans[1].leftover;
  const spilt = [l1 ? `${l1} apple${l1 > 1 ? "s" : ""}` : null, l2 ? `${l2} pear${l2 > 1 ? "s" : ""}` : null]
    .filter(Boolean).join(" and ");
  return `Groups of ${grade.chosen} leave ${spilt} over — ${grade.chosen} isn't a factor of both. ${factors}`;
}
