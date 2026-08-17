/**
 * ORDER THE PARTS (F4) — pure logic for the carrot-garden ordering challenge:
 * put 5 fractions / decimals / percentages in ASCENDING order by swapping
 * carrots in a row. No React, no stores — fully checkable headlessly.
 *
 * PEDAGOGY — comparing and ordering across representations:
 *   R1  unit fractions          (the "bigger denominator = bigger" trap)
 *   R2  same-denominator        (numerator counts parts — consolidation)
 *   R3  benchmark fractions     (different denominators → equivalence)
 *   R4  decimals                (place-value traps: 0.09 < 0.1)
 *   R5  MIXED f/d/%             (one value line for all three notations)
 * Every set ends by showing the sorted chain AND its percent equivalents, so
 * all three notations resolve onto one scale.
 *
 * SCORING: perfect order = 25 points (same top prize as a fence bullseye).
 * Wrong = 2 points per carrot already in its correct spot (max 6 — real
 * consolation, never enough to progress on luck).
 */

// 15 rounds per set (teacher feedback): the 5-concept arc is walked in order
// with THREE rounds per concept (values re-dealt every round).
export const ORDER_ROUNDS_PER_SET = 15;
const ORDER_STAGES = 5;
const ORDER_ROUNDS_PER_STAGE = ORDER_ROUNDS_PER_SET / ORDER_STAGES;

/** Which concept stage (0–4) a round index belongs to. Pure. */
export function orderStageFor(i) {
  return Math.max(0, Math.min(ORDER_STAGES - 1, Math.floor(i / ORDER_ROUNDS_PER_STAGE)));
}

export const ORDER_ITEM_COUNT = 5;
export const ORDER_FULL_POINTS = 25;
export const ORDER_PARTIAL_PER_FIXED = 2;

function pick(list, rand) {
  return list[Math.floor(rand() * list.length)];
}

function pickDistinct(list, count, rand) {
  const pool = [...list];
  const out = [];
  while (out.length < count && pool.length) {
    out.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
  }
  return out;
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function fractionDisplay(n, d) {
  const g = gcd(n, d);
  return `${n / g}/${d / g}`;
}

function decimalDisplay(value) {
  // Exact short decimal (values are built from tenths/twentieths/hundredths).
  return String(Math.round(value * 100) / 100);
}

// R3 benchmark fraction pool — all distinct values.
const BENCHMARKS = [
  [1, 4], [1, 3], [2, 5], [1, 2], [3, 5], [2, 3], [7, 10], [3, 4], [4, 5], [5, 6], [7, 8], [9, 10],
];

/**
 * One round. roundIndex ∈ [0, 4]; rand injectable for the checks.
 * Returns { roundIndex, kindLabel, items } where items are in DISPLAY order
 * (shuffled, never already ascending): [{ id, kind, display, value }].
 */
export function generateOrderRound(roundIndex, rand = Math.random) {
  const i = orderStageFor(roundIndex);
  let raw = []; // [{ kind, display, value }]
  let kindLabel = "fractions";

  if (i === 0) {
    // Unit fractions — larger denominator, smaller piece.
    const dens = pickDistinct([2, 3, 4, 5, 6, 8, 10, 12], ORDER_ITEM_COUNT, rand);
    raw = dens.map((d) => ({ kind: "fraction", display: `1/${d}`, value: 1 / d }));
  } else if (i === 1) {
    // Same denominator.
    const d = pick([8, 10, 12], rand);
    const nums = pickDistinct(Array.from({ length: d - 1 }, (_, k) => k + 1), ORDER_ITEM_COUNT, rand);
    raw = nums.map((n) => ({ kind: "fraction", display: `${n}/${d}`, value: n / d }));
  } else if (i === 2) {
    // Benchmark fractions with different denominators.
    raw = pickDistinct(BENCHMARKS, ORDER_ITEM_COUNT, rand)
      .map(([n, d]) => ({ kind: "fraction", display: `${n}/${d}`, value: n / d }));
    kindLabel = "fractions";
  } else if (i === 3) {
    // Decimals — mix one- and two-place so 0.09-vs-0.1 style traps appear.
    kindLabel = "decimals";
    const oneDp = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
    const twoDp = [0.05, 0.09, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95];
    const values = [
      ...pickDistinct(twoDp, 2, rand),
      ...pickDistinct(oneDp, 3, rand),
    ];
    raw = values.map((v) => ({ kind: "decimal", display: decimalDisplay(v), value: v }));
  } else {
    // MIXED notations from the twentieths grid (5%, 10%, …, 95%) — at least
    // one fraction, one decimal and one percent in every row.
    kindLabel = "fractions, decimals and percentages";
    const ks = pickDistinct(Array.from({ length: 19 }, (_, k) => k + 1), ORDER_ITEM_COUNT, rand);
    const kinds = ["fraction", "decimal", "percent", pick(["fraction", "decimal", "percent"], rand), pick(["fraction", "decimal", "percent"], rand)];
    // Shuffle kind assignment.
    for (let s = kinds.length - 1; s > 0; s--) {
      const j = Math.floor(rand() * (s + 1));
      [kinds[s], kinds[j]] = [kinds[j], kinds[s]];
    }
    raw = ks.map((k, idx) => {
      const value = k / 20;
      const kind = kinds[idx];
      const display =
        kind === "fraction" ? fractionDisplay(k, 20)
        : kind === "decimal" ? decimalDisplay(value)
        : `${k * 5}%`;
      return { kind, display, value };
    });
  }

  const items = raw.map((r, idx) => ({ id: `item-${roundIndex}-${idx}`, ...r }));

  // Shuffle the DISPLAY order; never hand out an already-sorted row.
  const isSorted = (arr) => arr.every((it, idx) => idx === 0 || arr[idx - 1].value < it.value);
  let guard = 0;
  do {
    for (let s = items.length - 1; s > 0; s--) {
      const j = Math.floor(rand() * (s + 1));
      [items[s], items[j]] = [items[j], items[s]];
    }
    guard++;
  } while (isSorted(items) && guard < 20);
  if (isSorted(items)) [items[0], items[items.length - 1]] = [items[items.length - 1], items[0]];

  return { roundIndex, stage: i, kindLabel, items };
}

/** A full 5-round set. */
export function generateOrderSet(rand = Math.random) {
  const rounds = [];
  for (let i = 0; i < ORDER_ROUNDS_PER_SET; i++) rounds.push(generateOrderRound(i, rand));
  return rounds;
}

/** The correct (ascending) item order for a round. Pure. */
export function sortedItems(round) {
  return [...round.items].sort((a, b) => a.value - b.value);
}

/**
 * Grade an arrangement. `orderIds` = item ids in the row's current left→right
 * order. Returns { correct, fixed, points, sortedIds }.
 */
export function gradeOrder(round, orderIds) {
  const sortedIds = sortedItems(round).map((it) => it.id);
  const fixed = orderIds.reduce((acc, id, idx) => acc + (sortedIds[idx] === id ? 1 : 0), 0);
  const correct = fixed === round.items.length;
  return {
    correct,
    fixed,
    points: correct ? ORDER_FULL_POINTS : fixed * ORDER_PARTIAL_PER_FIXED,
    sortedIds,
  };
}

/** Feedback: the sorted chain, plus percent equivalents (one shared scale). */
export function orderFeedback(round, grade) {
  const sorted = sortedItems(round);
  const chain = sorted.map((it) => it.display).join(" < ");
  const pct = sorted.map((it) => `${Math.round(it.value * 100)}%`).join(" < ");
  const exact = sorted.every((it) => Math.abs(it.value * 100 - Math.round(it.value * 100)) < 1e-9);
  const lead = grade.correct
    ? "Perfect order!"
    : `${grade.fixed} carrot${grade.fixed === 1 ? " was" : "s were"} in the right spot.`;
  return `${lead} Smallest to largest: ${chain}. As percentages${exact ? "" : " (rounded)"}: ${pct}.`;
}
