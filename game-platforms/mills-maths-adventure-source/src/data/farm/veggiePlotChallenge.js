/**
 * THE VEGGIE PLOT (F11) — pure logic for MULTIPLYING FRACTIONS as an area
 * model, grown in soil. No React, no stores — fully checkable headlessly.
 *
 * PEDAGOGY — a·c/b·d is an AREA, not a rule: the plot is a unit square. The
 * student drags the WIDTH edge to cover w = wn/wd of the width and the LENGTH
 * edge to cover l = ln/ld of the length. The shaded overlap is wn·ln little
 * cells out of wd·ld — the harvest — so 2/3 × 3/4 = 6/12 is SEEN as the
 * overlap, then written. Companion mechanic: FERTILISER POTIONS multiply a
 * plant's height by a factor (3/2, 3/5, 1/4 …). The student predicts
 * GROW-or-SHRINK first, physically attacking "multiplying always makes bigger"
 * — a potion below 1 shrinks the plant.
 *
 * A SET is 15 rounds, 3 per concept stage:
 *   S1  unit × unit            (1/2 × 1/3)          area
 *   S2  unit × non-unit        (1/2 × 3/4)          area
 *   S3  non-unit × non-unit    (2/3 × 3/4)          area
 *   S4  FERTILISER — shrink    (×3/5, ×1/4 …)       predict grow/shrink
 *   S5  FERTILISER — mixed     (×3/2, ×2/3, ×5/4 …) predict grow/shrink
 *
 * Scoring (per round, max 25 — matches the other farm challenges):
 *   area:   PLACE both edges correctly = 10, then TYPE the product = 15
 *   potion: PREDICT grow/shrink correctly = 25
 */

export const VEGGIE_ROUNDS_PER_SET = 15;
// 11 AREA rounds (fraction × fraction) then 4 FERTILISER-POTION rounds
// (teacher split: mostly the area model, a few grow/shrink at the end).
export const VEGGIE_AREA_ROUNDS = 11;
export const VEGGIE_POTION_ROUNDS = VEGGIE_ROUNDS_PER_SET - VEGGIE_AREA_ROUNDS; // 4

export const VEGGIE_PLACE_POINTS = 10; // both edges dragged to the target
export const VEGGIE_TYPE_POINTS = 15; // the product typed correctly
export const VEGGIE_POTION_POINTS = 25; // a correct grow/shrink prediction
export const VEGGIE_ROUND_POINTS = 25; // max per round (place 10 + type 15)

/**
 * Which concept stage a round index belongs to. AREA rounds 0–10 split into 3
 * sub-stages (unit×unit → unit×non-unit → non-unit×non-unit); POTION rounds
 * 11–14 are stage 3. Pure.
 */
export function veggieStageFor(i) {
  if (i >= VEGGIE_AREA_ROUNDS) return 3;
  return i < 4 ? 0 : i < 8 ? 1 : 2;
}

function pick(list, rand) {
  return list[Math.floor(rand() * list.length)];
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

/** A reduced "n/d" (or a whole number when it divides). Pure. */
export function reduceFraction(n, d) {
  const g = gcd(n, d) || 1;
  const rn = n / g, rd = d / g;
  return rd === 1 ? `${rn}` : `${rn}/${rd}`;
}

// Denominator pools per AREA stage (kept small so the grid stays drawable/
// draggable — at most a 5×5 grid).
const AREA_DEN_POOLS = [
  [2, 3, 4], // S1
  [2, 3, 4], // S2
  [3, 4, 5], // S3
];

/** Numerator for a denominator + stage (unit fraction where the stage wants one). */
function pickNumerator(den, wantUnit, rand) {
  if (wantUnit) return 1;
  // A proper non-unit numerator in [1, den-1]; bias away from 1 so it's a
  // genuine non-unit fraction, but 1 is still allowed for variety at S3.
  const options = [];
  for (let k = 1; k < den; k++) options.push(k);
  const nonUnit = options.filter((k) => k > 1);
  return pick(nonUnit.length ? nonUnit : options, rand);
}

/** Parse a typed fraction/whole to a value, or null if unparseable. Accepts a
 *  bare "a/b" or whole number AND the equation-editor's plain output
 *  ("(1)/(8)") by stripping spaces + parentheses. Pure. */
export function parseFractionInput(text) {
  const cleaned = String(text || "").replace(/[\s()]/g, "");
  if (/^\d+$/.test(cleaned)) return Number(cleaned);
  const m = cleaned.match(/^(\d+)\/(\d+)$/);
  if (m) {
    const d = Number(m[2]);
    if (d === 0) return null;
    return Number(m[1]) / d;
  }
  return null;
}

/**
 * Check a typed product for an area round. Accepts ANY fraction equal in value
 * to the product (so "6/12", "1/2" and "3/6" all pass). Pure.
 */
export function checkAreaProduct(round, text) {
  const value = parseFractionInput(text);
  if (value === null) return { valid: false, correct: false };
  return { valid: true, correct: Math.abs(value - round.productValue) < 1e-9 };
}

// Fertiliser potions — factor as an exact fraction. Grows when n > d, shrinks
// when n < d (never equal, so the grow/shrink choice is always well-defined).
const POTION_POOLS = [
  // S4 — all SHRINK (factor < 1): the "×<1 makes it smaller" cases.
  [ { n: 3, d: 5 }, { n: 1, d: 4 }, { n: 2, d: 3 }, { n: 4, d: 5 }, { n: 1, d: 3 }, { n: 1, d: 2 } ],
  // S5 — MIXED grow + shrink so the student can't just always tap one answer.
  [ { n: 3, d: 2 }, { n: 5, d: 4 }, { n: 7, d: 4 }, { n: 2, d: 1 }, { n: 3, d: 5 }, { n: 2, d: 3 }, { n: 5, d: 2 } ],
];

const POTION_COLORS = ["#e05780", "#7b5cd6", "#2a9d8f", "#e9a020", "#3a7bd5"];
const VEGGIES = [
  ["🥕", "carrot", "#e8772e"],
  ["🥬", "lettuce", "#6cbf3f"],
  ["🍅", "tomato", "#e23b3b"],
  ["🌽", "corn", "#e9c218"],
  ["🥔", "potato", "#c69a5b"],
];

/** One round. roundIndex ∈ [0, 15); rand injectable for the checks. */
export function generateVeggieRound(roundIndex, rand = Math.random) {
  const stage = veggieStageFor(roundIndex);
  const [emoji, veg, vegColor] = pick(VEGGIES, rand);

  if (roundIndex < VEGGIE_AREA_ROUNDS) {
    // AREA round — multiply two proper fractions.
    const wd = pick(AREA_DEN_POOLS[stage], rand);
    let ld = pick(AREA_DEN_POOLS[stage], rand);
    // Keep the two denominators distinct where possible so the grid isn't square
    // (a richer area picture) — but never loop forever.
    let guard = 0;
    while (ld === wd && guard < 8 && AREA_DEN_POOLS[stage].length > 1) { ld = pick(AREA_DEN_POOLS[stage], rand); guard++; }
    const unitBoth = stage === 0;
    const unitOne = stage === 1;
    const wn = pickNumerator(wd, unitBoth || unitOne, rand);
    const ln = pickNumerator(ld, unitBoth, rand); // S1: width unit, length non-unit
    const prodN = wn * ln;
    const prodD = wd * ld;
    return {
      roundIndex,
      stage,
      kind: "area",
      emoji,
      veg,
      vegColor,
      wn, wd, ln, ld,
      widthStr: `${wn}/${wd}`,
      lengthStr: `${ln}/${ld}`,
      gridCols: wd,
      gridRows: ld,
      targetCols: wn,
      targetRows: ln,
      prodN, prodD,
      productStr: `${prodN}/${prodD}`,
      simplifiedStr: reduceFraction(prodN, prodD),
      productValue: prodN / prodD,
      prompt: `Plant a bed ${wn}/${wd} of the width and ${ln}/${ld} of the length. Drag both edges, then read the harvest.`,
      reason: `${wn}/${wd} × ${ln}/${ld} = ${prodN}/${prodD}${reduceFraction(prodN, prodD) !== `${prodN}/${prodD}` ? ` = ${reduceFraction(prodN, prodD)}` : ""} — the shaded overlap is ${prodN} of the ${prodD} little plots.`,
    };
  }

  // POTION round — predict grow or shrink. Of the 4, the first two come from
  // the SHRINK pool (so the "×<1 makes it smaller" lesson always appears) and
  // the last two from the MIXED pool.
  const pIdx = roundIndex - VEGGIE_AREA_ROUNDS; // 0..3
  const pool = pIdx < 2 ? POTION_POOLS[0] : POTION_POOLS[1];
  const { n, d } = pick(pool, rand);
  const grows = n > d;
  return {
    roundIndex,
    stage,
    kind: "potion",
    emoji,
    veg,
    vegColor,
    potionColor: POTION_COLORS[roundIndex % POTION_COLORS.length],
    n, d,
    factorStr: reduceFraction(n, d),
    factorValue: n / d,
    grows,
    answer: grows ? "grow" : "shrink",
    prompt: `A fertiliser potion multiplies the ${veg}'s height by ${reduceFraction(n, d)}. Will it GROW or SHRINK?`,
    reason: grows
      ? `${reduceFraction(n, d)} is MORE than 1, so the ${veg} grows taller — multiplying by more than 1 makes it bigger.`
      : `${reduceFraction(n, d)} is LESS than 1, so the ${veg} shrinks — multiplying by a fraction below 1 makes it SMALLER!`,
  };
}

/**
 * A full set. Consecutive AREA rounds never share the same product, and
 * consecutive POTION rounds never repeat the same factor, so every round is a
 * fresh picture.
 */
export function generateVeggieSet(rand = Math.random) {
  const rounds = [];
  for (let i = 0; i < VEGGIE_ROUNDS_PER_SET; i++) {
    let round = generateVeggieRound(i, rand);
    let guard = 0;
    while (
      i > 0 && guard < 30 &&
      ((round.kind === "area" && rounds[i - 1].kind === "area" && round.productStr === rounds[i - 1].productStr) ||
        (round.kind === "potion" && rounds[i - 1].kind === "potion" && round.factorStr === rounds[i - 1].factorStr))
    ) {
      round = generateVeggieRound(i, rand);
      guard++;
    }
    rounds.push(round);
  }
  return rounds;
}

/** Grade an area PLACEMENT: both edges snapped to the target cells. Pure. */
export function gradeVeggiePlace(round, cols, rows) {
  const correct = cols === round.targetCols && rows === round.targetRows;
  return { correct, points: correct ? VEGGIE_PLACE_POINTS : 0 };
}

/** Grade a potion PREDICTION ("grow" | "shrink"). Pure. */
export function gradeVeggiePotion(round, choice) {
  const correct = choice === round.answer;
  return { correct, points: correct ? VEGGIE_POTION_POINTS : 0 };
}
