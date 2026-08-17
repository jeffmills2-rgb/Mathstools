/**
 * THE TRADING POST (F10) — pure logic for the FDP-conversion challenge. No
 * React, no stores — fully checkable headlessly. Every value is an INTEGER
 * count of THOUSANDTHS of a coin, so all three notations are exact.
 *
 * PEDAGOGY — one value, three languages: a crate arrives priced in ONE
 * notation and the student pays the OTHER TWO stalls in theirs — the same
 * quantity re-expressed, not three different sums. Distractor tags are the
 * classic scale errors (60% vs 6%, 0.6 vs 6.0), so a slip of ×10 never goes
 * unpunished. Stage 4's bulk deals bring improper fractions and mixed
 * numbers into the same chain (7/4 = 1¾ = 1.75 = 175%).
 *
 * A SET is 15 rounds, 3 per concept stage:
 *   S1  benchmarks (1/2, 1/4, 3/4)
 *   S2  fifths + tenths
 *   S3  twentieths + eighths (5%, 12.5% …)
 *   S4  BULK DEALS — improper fractions / mixed numbers (7/4 = 1¾)
 *   S5  fluency mix of everything
 *
 * Scoring: each stall paid correctly = 10, both correct = +5 bonus → 25.
 */

export const TRADE_ROUNDS_PER_SET = 15;
const TRADE_STAGES = 5;
const TRADE_ROUNDS_PER_STAGE = TRADE_ROUNDS_PER_SET / TRADE_STAGES;
export const TRADE_STALL_POINTS = 10;
export const TRADE_BOTH_BONUS = 5;
export const TRADE_ROUND_POINTS = TRADE_STALL_POINTS * 2 + TRADE_BOTH_BONUS;

export const TRADE_STALLS = ["fraction", "decimal", "percent"];
export const TRADE_STALL_NAMES = {
  fraction: "Fraction Fred",
  decimal: "Decimal Dot",
  percent: "Percent Penny",
};

/** Which concept stage (0–4) a round index belongs to. Pure. */
export function tradeStageFor(i) {
  return Math.max(0, Math.min(TRADE_STAGES - 1, Math.floor(i / TRADE_ROUNDS_PER_STAGE)));
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function pick(list, rand) {
  return list[Math.floor(rand() * list.length)];
}

function shuffle(list, rand) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// ---- Formatting (V = integer thousandths of a coin) -----------------------

/** Improper/proper fraction form, fully reduced ("3/5", "7/4"). */
export function tradeFraction(V) {
  const g = gcd(V, 1000);
  return `${V / g}/${1000 / g}`;
}

/** Mixed-number form for V > 1000 ("1 3/4"); falls back to the fraction. */
export function tradeMixed(V) {
  if (V <= 1000) return tradeFraction(V);
  const whole = Math.floor(V / 1000);
  const rem = V - whole * 1000;
  if (rem === 0) return `${whole}`;
  const g = gcd(rem, 1000);
  return `${whole} ${rem / g}/${1000 / g}`;
}

/** Decimal form, zeros trimmed ("0.6", "0.125", "1.75"). */
export function tradeDecimal(V) {
  return String(V / 1000);
}

/** Percent form ("60%", "12.5%", "175%"). */
export function tradePercent(V) {
  const p = V / 10;
  return Number.isInteger(p) ? `${p}%` : `${p}%`;
}

/** The display a given stall uses for a value. */
export function tradeDisplay(stall, V) {
  if (stall === "fraction") return tradeFraction(V);
  if (stall === "decimal") return tradeDecimal(V);
  return tradePercent(V);
}

/** The full equal-value chain (with the mixed form on bulk deals). */
export function tradeChain(V) {
  const parts = [tradeFraction(V)];
  if (V > 1000) parts.push(tradeMixed(V));
  parts.push(tradeDecimal(V), tradePercent(V));
  return parts.join(" = ");
}

// ---- Round generation ------------------------------------------------------

// Per-stage value pools (thousandths).
const TRADE_POOLS = [
  [250, 500, 750],
  [100, 200, 300, 400, 600, 700, 800, 900],
  [50, 150, 350, 550, 850, 950, 125, 375, 625, 875],
  [1250, 1500, 1750, 2250, 2500],
  [200, 400, 600, 800, 300, 700, 50, 150, 125, 375, 625, 875, 1250, 1750, 2500],
];

const TRADE_ITEMS = [
  ["🍯", "honey"], ["🥚", "eggs"], ["🧶", "wool"], ["🍎", "apples"],
  ["🌽", "corn"], ["🧀", "cheese"], ["🎃", "pumpkins"],
];

/** Misconception tag values for a stall: ×10 / ÷10 scale slips first. */
function distractorValues(V) {
  return [V * 10, V / 10, V + 250, V - 100, V * 2, V + 500].filter(
    (w) => Number.isInteger(w) && w > 0 && w <= 9990 && w !== V
  );
}

/** One round. roundIndex ∈ [0, 15); rand injectable for the checks.
 *  `forcedSource` (optional) fixes which stall sells this round — used by
 *  generateTradeSet to BALANCE the sellers (exactly 5 of each per set). Bulk
 *  deals can now be sold in ANY notation; the improper fraction still appears
 *  in the chain and as the fraction buyer's tag. */
export function generateTradeRound(roundIndex, rand = Math.random, forcedSource = null) {
  const stage = tradeStageFor(roundIndex);
  const V = pick(TRADE_POOLS[stage], rand);
  const bulk = V > 1000;
  const sourceStall = forcedSource || pick(TRADE_STALLS, rand);
  const [emoji, item] = pick(TRADE_ITEMS, rand);

  const targets = TRADE_STALLS.filter((s) => s !== sourceStall).map((stall) => {
    const correct = tradeDisplay(stall, V);
    const wrongs = [];
    for (const w of distractorValues(V)) {
      const str = tradeDisplay(stall, w);
      if (str !== correct && !wrongs.includes(str)) wrongs.push(str);
      if (wrongs.length === 2) break;
    }
    const tags = shuffle([correct, ...wrongs], rand);
    return { stall, tags, correctIndex: tags.indexOf(correct) };
  });

  const sourceDisplay = tradeDisplay(sourceStall, V);
  return {
    roundIndex,
    stage,
    V,
    bulk,
    emoji,
    item,
    sourceStall,
    sourceDisplay,
    targets, // [{ stall, tags[3], correctIndex }] — the two stalls to pay
    chain: tradeChain(V),
    prompt: `${bulk ? "Bulk deal! " : ""}${TRADE_STALL_NAMES[sourceStall]} sells ${item} for ${sourceDisplay} of a coin. Pay the other two stalls in THEIR language.`,
    reason: `Same value, three languages: ${tradeChain(V)}.`,
  };
}

/**
 * A BALANCED seller sequence for a set: exactly 5 of each of the three stalls
 * across the 15 rounds, shuffled into a random pattern with no seller three
 * times in a row (teacher feedback: alternate the stallholders evenly).
 */
export function balancedSellers(rand = Math.random) {
  const base = [];
  for (const s of TRADE_STALLS) for (let k = 0; k < TRADE_ROUNDS_PER_SET / TRADE_STALLS.length; k++) base.push(s);
  for (let attempt = 0; attempt < 200; attempt++) {
    const seq = shuffle(base, rand);
    let ok = true;
    for (let i = 2; i < seq.length; i++) {
      if (seq[i] === seq[i - 1] && seq[i - 1] === seq[i - 2]) { ok = false; break; }
    }
    if (ok) return seq;
  }
  return shuffle(base, rand); // still balanced, just may have a triple (very rare)
}

/**
 * A full set. Sellers are BALANCED (5 fraction / 5 decimal / 5 percent,
 * shuffled), and consecutive rounds never repeat the same value.
 */
export function generateTradeSet(rand = Math.random) {
  const sellers = balancedSellers(rand);
  const rounds = [];
  for (let i = 0; i < TRADE_ROUNDS_PER_SET; i++) {
    let round = generateTradeRound(i, rand, sellers[i]);
    let guard = 0;
    while (i > 0 && round.V === rounds[i - 1].V && guard < 20) {
      round = generateTradeRound(i, rand, sellers[i]);
      guard++;
    }
    rounds.push(round);
  }
  return rounds;
}

/** Grade one stall's tap. Pure. */
export function gradeTradeTap(target, index) {
  const correct = index === target.correctIndex;
  return { correct, points: correct ? TRADE_STALL_POINTS : 0 };
}
