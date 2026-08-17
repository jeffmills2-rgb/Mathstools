/**
 * THE LODGE YARD — COCOA CHANGE (LY) — pure logic for the FRIENDS-OF-100
 * challenge, the ninth Snowball Sums build. No React, no stores — fully
 * checkable headlessly. All values are small integers.
 *
 * PEDAGOGY — complements to 100 are built from complements to 10, with a
 * money-shaped purpose: the lodge sells hot chocolate, you pay with a
 * 100-token, and the CHANGE is counted UP on the hundred-bead cocoa board
 * (10 rows of 10). A cocoa costing 65 fills 65 beads; the change fills the
 * rest in TWO chosen hops — first the ones hop to the next ten (+5 → 70,
 * finishing the part-row), then the tens hop to 100 (+30 → 100, three
 * clean rows). Friends of 10 (5 needs 5) power friends of 100 (70 needs
 * 30). Traps: prices already ON a ten need NO ones hop, and prices in the
 * 90s need NO tens hop — zero is sometimes the right hop.
 *
 * A SET is 15 rounds, 3 per concept stage:
 *   S1  fives         prices ending 5 (the friendliest ones hop)
 *   S2  near tens     prices ending 1/2/8/9
 *   S3  the hard ones prices ending 3/4/6/7
 *   S4  any price     11–89, all endings
 *   S5  zero hops     round 13 is ON a ten; round 14 is in the 90s
 *
 * Scoring (per round, max 25):
 *   A) the ONES hop to the next ten (0–9)   = 10
 *   B) the TENS hop to 100 (0, 10 … 90)     = 5
 *   C) TYPE the whole change                = 10
 */

export const YARD_ROUNDS_PER_SET = 15;
const YARD_STAGES = 5;
const YARD_ROUNDS_PER_STAGE = YARD_ROUNDS_PER_SET / YARD_STAGES;

export const YARD_ONES_POINTS = 10;
export const YARD_TENS_POINTS = 5;
export const YARD_CHANGE_POINTS = 10;
export const YARD_ROUND_POINTS = YARD_ONES_POINTS + YARD_TENS_POINTS + YARD_CHANGE_POINTS; // 25
export const YARD_MAX_SCORE = YARD_ROUNDS_PER_SET * YARD_ROUND_POINTS; // 375

// The zero-hop traps land late in S5.
export const YARD_ON_TEN_ROUND_INDEX = 13; // price ends 0 → ones hop 0
export const YARD_NINETIES_ROUND_INDEX = 14; // price 91–99 → tens hop 0

// Bead pacing for the fill animation (3D layer + panel).
export const YARD_BEAD_MS = 90;

/** Which concept stage (0–4) a round index belongs to. Pure. */
export function yardStageFor(i) {
  return Math.max(0, Math.min(YARD_STAGES - 1, Math.floor(i / YARD_ROUNDS_PER_STAGE)));
}

function pick(list, rand) {
  return list[Math.floor(rand() * list.length)];
}

function randInt(min, max, rand) {
  return min + Math.floor(rand() * (max - min + 1));
}

// Stage configs: the price's ones digits on offer + its tens range.
const YARD_STAGE_CONFIGS = [
  { onesSet: [5], tMin: 2, tMax: 7, name: "fives" },
  { onesSet: [1, 2, 8, 9], tMin: 2, tMax: 7, name: "near tens" },
  { onesSet: [3, 4, 6, 7], tMin: 2, tMax: 7, name: "the hard ones" },
  { onesSet: [1, 2, 3, 4, 5, 6, 7, 8, 9], tMin: 1, tMax: 8, name: "any price" },
  { onesSet: [1, 2, 3, 4, 5, 6, 7, 8, 9], tMin: 1, tMax: 8, name: "zero hops" },
];

/** One round. roundIndex ∈ [0, 15); rand injectable for the checks. */
export function generateYardRound(roundIndex, rand = Math.random) {
  const stage = yardStageFor(roundIndex);
  const cfg = YARD_STAGE_CONFIGS[stage];

  let price;
  if (roundIndex === YARD_ON_TEN_ROUND_INDEX) {
    price = randInt(2, 8, rand) * 10; // ON a ten — the ones hop is ZERO
  } else if (roundIndex === YARD_NINETIES_ROUND_INDEX) {
    price = 90 + randInt(1, 9, rand); // in the 90s — the tens hop is ZERO
  } else {
    price = randInt(cfg.tMin, cfg.tMax, rand) * 10 + pick(cfg.onesSet, rand);
  }

  const onesHop = (10 - (price % 10)) % 10; // 0 when already on a ten
  const afterOnes = price + onesHop;
  const tensHop = 100 - afterOnes; // a multiple of ten; 0 from the 90s
  const change = 100 - price;

  return {
    roundIndex,
    stage,
    stageName: cfg.name,
    price,
    onesHop,
    afterOnes,
    tensHop,
    change,
    prompt: `A hot chocolate costs ${price}. You hand over a 100-token — count UP the change!`,
    reason:
      onesHop === 0
        ? `${price} is already ON a ten — no ones hop! ${price} + ${tensHop} → 100. Change: ${change}.`
        : tensHop === 0
          ? `${price} + ${onesHop} → 100 in one hop — no tens needed! Change: ${change}.`
          : `${price} + ${onesHop} → ${afterOnes} (finish the row), + ${tensHop} → 100 (the clean rows). Change: ${onesHop} + ${tensHop} = ${change}.`,
  };
}

/**
 * A full set. Consecutive rounds never repeat the same price, so every
 * order is fresh.
 */
export function generateYardSet(rand = Math.random) {
  const rounds = [];
  for (let i = 0; i < YARD_ROUNDS_PER_SET; i++) {
    let round = generateYardRound(i, rand);
    let guard = 0;
    while (i > 0 && guard < 30 && round.price === rounds[i - 1].price) {
      round = generateYardRound(i, rand);
      guard++;
    }
    rounds.push(round);
  }
  return rounds;
}

function parseNum(text) {
  const cleaned = String(text || "").replace(/\s/g, "");
  return /^\d+$/.test(cleaned) ? Number(cleaned) : null;
}

/** Grade Part A — the typed ONES hop (0–9). Pure. */
export function checkYardOnes(round, text) {
  const v = parseNum(text);
  if (v === null) return { valid: false, correct: false };
  return { valid: true, correct: v === round.onesHop };
}

/** Grade Part B — the typed TENS hop (0, 10 … 90 — the VALUE). Pure. */
export function checkYardTens(round, text) {
  const v = parseNum(text);
  if (v === null) return { valid: false, correct: false };
  return { valid: true, correct: v === round.tensHop };
}

/** Grade Part C — the whole change. Pure. */
export function checkYardChange(round, text) {
  const v = parseNum(text);
  if (v === null) return { valid: false, correct: false };
  return { valid: true, correct: v === round.change };
}
