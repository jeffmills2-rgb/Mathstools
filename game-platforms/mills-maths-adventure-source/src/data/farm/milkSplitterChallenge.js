/**
 * THE MILK SPLITTER (F8) — pure logic for the terminating-vs-recurring
 * decimals challenge. No React, no stores — fully checkable headlessly.
 *
 * PEDAGOGY — the DIVISION is the concept: sharing n L among d cups performs
 * n ÷ d before the student's eyes. A terminating share finishes (the tap
 * stops); a recurring share loops forever (the drip never stops) BECAUSE the
 * long-division remainder repeats. Each round is two parts:
 *   A) PREDICT — stops or repeats? (tap a chute)          +10 pts
 *   B) LABEL   — pick the correct dot-notation writing    +15 pts
 * so notation (dot over the repeating digit(s)) is taught explicitly and a
 * lucky coin-flip can never carry a round.
 *
 * A SET is 15 rounds, 3 per concept stage:
 *   S1  unit fractions that STOP     (1/2, 1/4, 1/5, 1/10)
 *   S2  unit fractions that REPEAT   (1/3, 1/6, 1/9)
 *   S3  mixed unit fractions         (incl. 1/8 = 0.125)
 *   S4  non-unit fractions           (3/8 vs 5/6 …)
 *   S5  simplify traps + showpieces  (3/6 STOPS! · 1/7's six-digit loop)
 *
 * THE RULE the set builds toward: a fraction terminates ⟺ its denominator
 * in lowest terms has no prime factors other than 2 and 5.
 */

export const MILK_ROUNDS_PER_SET = 15;
const MILK_STAGES = 5;
const MILK_ROUNDS_PER_STAGE = MILK_ROUNDS_PER_SET / MILK_STAGES;

export const MILK_PREDICT_POINTS = 10;
export const MILK_NOTATION_POINTS = 15;
export const MILK_ROUND_POINTS = MILK_PREDICT_POINTS + MILK_NOTATION_POINTS;

// Wave pacing for the pour animation (shared with the 3D layer + panel):
// each decimal PLACE is one wave of drops — one drop into EVERY jug, the
// drops shrinking with each place (tenths → hundredths → …), the digit
// revealed as the wave lands.
export const MILK_DIGIT_MS = 950;
export const MILK_POUR_LEAD_MS = 700;

/** Which concept stage (0–4) a round index belongs to. Pure. */
export function milkStageFor(i) {
  return Math.max(0, Math.min(MILK_STAGES - 1, Math.floor(i / MILK_ROUNDS_PER_STAGE)));
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function pick(list, rand) {
  return list[Math.floor(rand() * list.length)];
}

/** Terminating ⟺ the reduced denominator has only 2s and 5s. Pure. */
export function isTerminatingFraction(n, d) {
  let q = d / gcd(n, d);
  while (q % 2 === 0) q /= 2;
  while (q % 5 === 0) q /= 5;
  return q === 1;
}

/**
 * Long-division decimal expansion of n/d (n < d): returns
 *   { pre, cycle }  — "0." + pre, then cycle repeating ("" if terminating).
 * e.g. 1/8 → { pre: "125", cycle: "" }, 1/6 → { pre: "1", cycle: "6" },
 * 1/7 → { pre: "", cycle: "142857" }.
 */
export function decimalExpansion(n, d) {
  const digits = [];
  const seenAt = new Map();
  let r = n % d;
  let guard = 0;
  while (r !== 0 && guard < 40) {
    if (seenAt.has(r)) {
      const start = seenAt.get(r);
      return { pre: digits.slice(0, start).join(""), cycle: digits.slice(start).join("") };
    }
    seenAt.set(r, digits.length);
    r *= 10;
    digits.push(Math.floor(r / d));
    r %= d;
    guard++;
  }
  return { pre: digits.join(""), cycle: "" };
}

const DOT = "̇"; // combining dot above

/** Dot notation: single repeating digit → one dot; longer cycle → dots on
 *  the first AND last digit of the cycle. Terminating → plain. */
export function milkNotation(n, d) {
  const { pre, cycle } = decimalExpansion(n, d);
  if (!cycle) return `0.${pre}`;
  if (cycle.length === 1) return `0.${pre}${cycle}${DOT}`;
  const dotted = cycle[0] + DOT + cycle.slice(1, -1) + cycle[cycle.length - 1] + DOT;
  return `0.${pre}${dotted}`;
}

/**
 * Notation options for part B: the correct writing + 2 misconception
 * distractors, all distinct. Pure; rand shuffles the order.
 */
export function milkOptions(n, d, rand = Math.random) {
  const { pre, cycle } = decimalExpansion(n, d);
  const correct = milkNotation(n, d);
  const wrong = [];
  if (cycle) {
    // Truncated, dots dropped — "recurring is just a long decimal".
    wrong.push(`0.${pre}${cycle}${cycle[0] || ""}`);
    // Dot in the WRONG place: single-digit cycles get "write it twice, dot
    // the copy" (0.33̇); longer cycles get a dot on the first digit only.
    if (cycle.length === 1) {
      wrong.push(`0.${pre}${cycle}${cycle}${DOT}`);
    } else {
      const all = pre + cycle;
      wrong.push(`0.${all[0]}${DOT}${all.slice(1)}`);
    }
  } else {
    // Spurious dot — "every fraction repeats".
    wrong.push(`0.${pre.slice(0, -1)}${pre[pre.length - 1]}${DOT}`);
    // Digit-mash misconception (1/8 = 0.8, 3/4 = 0.34).
    wrong.push(n === 1 ? `0.${d}` : `0.${n}${d}`);
  }
  const options = [correct, ...wrong.filter((w, i, a) => w !== correct && a.indexOf(w) === i)].slice(0, 3);
  while (options.length < 3) options.push(`0.${pre}${cycle}9`); // paranoid filler
  // Shuffle.
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return { options, correctIndex: options.indexOf(correct) };
}

// Per-stage fraction pools [n, d] (n < d, d ≤ 15 so the cup row renders).
const MILK_POOLS = [
  [[1, 2], [1, 4], [1, 5], [1, 10]],
  [[1, 3], [1, 6], [1, 9]],
  [[1, 8], [1, 3], [1, 4], [1, 6], [1, 5], [1, 9], [1, 10], [1, 2]],
  [[3, 4], [3, 8], [7, 10], [3, 5], [5, 8], [2, 3], [5, 6], [2, 9], [5, 9], [4, 9]],
  // Simplify traps (3/6 STOPS!) + prefix cycles + the 1/7 showpiece.
  [[3, 6], [6, 8], [2, 6], [9, 12], [4, 6], [1, 7], [6, 15], [5, 12]],
];

/** One round. roundIndex ∈ [0, 15); rand injectable for the checks. */
export function generateMilkRound(roundIndex, rand = Math.random) {
  const stage = milkStageFor(roundIndex);
  const [n, d] = pick(MILK_POOLS[stage], rand);
  const isTerminating = isTerminatingFraction(n, d);
  const expansion = decimalExpansion(n, d);
  const { options, correctIndex } = milkOptions(n, d, rand);
  return {
    roundIndex,
    stage,
    n,
    d,
    isTerminating,
    expansion,
    notation: milkNotation(n, d),
    options,
    correctIndex,
    prompt: `${n} L of milk shared among ${d} jugs. Will each jug's share STOP or REPEAT?`,
  };
}

/** A full set. Consecutive rounds never repeat the same fraction. */
export function generateMilkSet(rand = Math.random) {
  const rounds = [];
  for (let i = 0; i < MILK_ROUNDS_PER_SET; i++) {
    let round = generateMilkRound(i, rand);
    let guard = 0;
    while (i > 0 && round.n === rounds[i - 1].n && round.d === rounds[i - 1].d && guard < 20) {
      round = generateMilkRound(i, rand);
      guard++;
    }
    rounds.push(round);
  }
  return rounds;
}

/**
 * How many digits (= drop waves) the pour shows: terminating → all of them;
 * a single repeating digit → FIVE copies (0.33333…); a longer cycle (1/7's
 * 142857) → one full cycle, then the endless small-drop loop carries on.
 */
export function pourDigits(round) {
  const { pre, cycle } = round.expansion;
  if (!cycle) return pre.length;
  if (cycle.length === 1) return Math.min(10, pre.length + 5);
  return Math.min(10, pre.length + cycle.length);
}

/** Total pour animation time, ms (shared by the panel's timers). */
export function pourDurationMs(round) {
  return MILK_POUR_LEAD_MS + pourDigits(round) * MILK_DIGIT_MS + (round.expansion.cycle ? 600 : 300);
}

/** Why the prediction was right/wrong — the remainder story. */
export function milkReasonA(round) {
  const { n, d, notation } = round;
  if (round.isTerminating) {
    const q = d / gcd(n, d);
    return `${n} ÷ ${d} STOPS: ${n}/${d} = ${notation} exactly. The simplified denominator (${q}) is built only from 2s and 5s, so the division finishes.`;
  }
  return `${n} ÷ ${d} REPEATS: the remainder keeps coming back, so the digits loop forever — ${n}/${d} = ${notation}.`;
}

/** Why the notation is written that way. */
export function milkReasonB(round) {
  const { cycle, pre } = round.expansion;
  if (!cycle) return `${round.n}/${round.d} = ${round.notation} — it terminates, so NO dots.`;
  if (cycle.length === 1) {
    return `Only the ${cycle} repeats${pre ? ` (the ${pre.split("").join(", ")} happens once)` : ""} — one dot over it: ${round.notation}.`;
  }
  return `The block ${cycle} repeats — dots over its first and last digits: ${round.notation}.`;
}
