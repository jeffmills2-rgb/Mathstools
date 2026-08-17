/**
 * SLEDDING SLOPE — THE ROPED SLEDS (SL) — pure logic for the CONSTANT
 * DIFFERENCE challenge, the fifth Snowball Sums build. No React, no stores —
 * fully checkable headlessly. All values are small integers.
 *
 * PEDAGOGY — subtraction as a DIFFERENCE that travels: two sleds are roped
 * together on the hill, each sitting on a number of the run. The ROPE is
 * the difference — it physically cannot stretch. 83 − 29 is hard; slide the
 * PAIR together (+1) and it becomes 84 − 30 — the back sled on a friendly
 * decade, the rope untouched, the gap identical. This attacks "changing the
 * numbers changes the answer": changing BOTH numbers the same way changes
 * NOTHING about the difference.
 *
 * Every round is three quick parts:
 *   A) PREDICT — a rope thought-experiment ("both sleds slide down 2 —
 *      the gap?", "ONLY the front sled slips down 1 — the gap?") answered
 *      bigger / same / smaller. Both-move → same; one-mover → it changes.
 *   B) SLIDE — nudge the roped PAIR ±1 until the BACK sled sits on a
 *      decade (the written pair updates live: 83 − 29 → 84 − 30, the rope
 *      never changing). Confirm with RACE!
 *   C) TYPE the difference off the friendly pair — then the sleds tear
 *      down the hill together, the rope still exactly as long.
 *
 * A SET is 15 rounds, 3 per concept stage:
 *   S1  back sled ends 9      slide UP 1        (45 − 19 → 46 − 20)
 *   S2  ends 8 or 1           choose direction  (62 − 28 / 62 − 31)
 *   S3  ends 1/2/8/9          both directions, bigger numbers
 *   S4  bigger still          minuends into the 90s
 *   S5  traps                 round 13's back sled is ALREADY friendly —
 *                             the right move is NO slides at all
 *
 * Scoring (per round, max 25): predict 10 + friendly slide 5 + difference 10.
 */

export const SLED_ROUNDS_PER_SET = 15;
const SLED_STAGES = 5;
const SLED_ROUNDS_PER_STAGE = SLED_ROUNDS_PER_SET / SLED_STAGES;

export const SLED_PREDICT_POINTS = 10;
export const SLED_SLIDE_POINTS = 5;
export const SLED_DIFF_POINTS = 10;
export const SLED_ROUND_POINTS = SLED_PREDICT_POINTS + SLED_SLIDE_POINTS + SLED_DIFF_POINTS; // 25
export const SLED_MAX_SCORE = SLED_ROUNDS_PER_SET * SLED_ROUND_POINTS; // 375

// Part A's answers, in display order.
export const SLED_PREDICT_OPTIONS = ["bigger", "same", "smaller"];

// Sliding is capped so wandering can't stumble onto a decade by accident
// forever — every friendly decade is within reach (|shift| ≤ 2, or ±10).
export const SLED_MAX_SLIDES = 12;

// Race pacing for the celebrate animation (3D layer).
export const SLED_RACE_MS = 2000;

/** Which concept stage (0–4) a round index belongs to. Pure. */
export function sledStageFor(i) {
  return Math.max(0, Math.min(SLED_STAGES - 1, Math.floor(i / SLED_ROUNDS_PER_STAGE)));
}

function pick(list, rand) {
  return list[Math.floor(rand() * list.length)];
}

function randInt(min, max, rand) {
  return min + Math.floor(rand() * (max - min + 1));
}

// The already-friendly trap always lands mid-S5.
export const SLED_FRIENDLY_ROUND_INDEX = 13;

// Stage configs — SOLUTIONS FIRST: choose the back sled's friendly DECADE,
// the shift that un-friendlies it (b = decade − shift), and the gap.
//   shiftSet   signed shifts (slide the pair +shift to reach the decade);
//              0 = already friendly (the S5 trap only)
const SLED_STAGE_CONFIGS = [
  { decMin: 20, decMax: 50, shiftSet: [1], gapMin: 11, gapMax: 25, name: "just under" },
  { decMin: 20, decMax: 50, shiftSet: [2, -1], gapMin: 11, gapMax: 28, name: "choose the direction" },
  { decMin: 20, decMax: 60, shiftSet: [1, 2, -1, -2], gapMin: 12, gapMax: 32, name: "either way" },
  { decMin: 30, decMax: 70, shiftSet: [1, 2, -1, -2], gapMin: 15, gapMax: 35, name: "the big hill" },
  { decMin: 20, decMax: 70, shiftSet: [1, 2, -1, -2], gapMin: 12, gapMax: 35, name: "already friendly?" },
];

// Part A thought-experiments: who moves, and by how much. `answer` follows
// from the rope: both → same; the front (bigger) sled alone down → bigger,
// up → smaller; the back sled alone down → smaller, up → bigger.
const SLED_SCENARIOS = [
  { mover: "both", delta: 1 },
  { mover: "both", delta: -1 },
  { mover: "both", delta: 2 },
  { mover: "front", delta: 1 },
  { mover: "front", delta: -1 },
  { mover: "back", delta: 1 },
  { mover: "back", delta: -1 },
];

/** The rope answer for a scenario. Pure. */
export function sledScenarioAnswer(mover, delta) {
  if (mover === "both") return "same";
  if (mover === "front") return delta > 0 ? "bigger" : "smaller";
  return delta > 0 ? "smaller" : "bigger";
}

function scenarioText(mover, delta) {
  const n = Math.abs(delta);
  const dir = delta > 0 ? `slide${mover === "both" ? "" : "s"} ${n} further DOWN the hill` : `${mover === "both" ? "are dragged" : "is dragged"} ${n} back UP`;
  if (mover === "both") return `Both sleds ${dir} together — what happens to the rope gap?`;
  return `ONLY the ${mover.toUpperCase()} sled ${dir} — what happens to the rope gap?`;
}

/** One round. roundIndex ∈ [0, 15); rand injectable for the checks. */
export function generateSledRound(roundIndex, rand = Math.random) {
  const stage = sledStageFor(roundIndex);
  const cfg = SLED_STAGE_CONFIGS[stage];
  const friendly = roundIndex === SLED_FRIENDLY_ROUND_INDEX;

  const decade = randInt(cfg.decMin / 10, cfg.decMax / 10, rand) * 10;
  const shift = friendly ? 0 : pick(cfg.shiftSet, rand);
  const b = decade - shift; // the back sled (subtrahend)
  const gap = randInt(cfg.gapMin, Math.min(cfg.gapMax, 97 - b), rand);
  const a = b + gap; // the front sled (minuend)

  const scenario = pick(SLED_SCENARIOS, rand);
  const answer = sledScenarioAnswer(scenario.mover, scenario.delta);

  return {
    roundIndex,
    stage,
    stageName: cfg.name,
    a, // front sled (minuend — further down the hill)
    b, // back sled (subtrahend — up the hill)
    gap,
    decade, // the friendly decade the back sled slides to
    shift, // slide the PAIR by this to get there (0 = already there)
    friendly,
    scenario: { ...scenario, answer, text: scenarioText(scenario.mover, scenario.delta) },
    prompt: `The roped sleds sit at ${a} and ${b} — the rope is the gap, and it can't stretch!`,
    reason: friendly
      ? `${b} is ALREADY on a decade — no sliding needed: ${a} − ${b} = ${gap}.`
      : `Slide the pair ${shift > 0 ? `down ${shift}` : `up ${-shift}`}: ${a} − ${b} becomes ${a + shift} − ${decade}. The rope never stretched, so ${a} − ${b} = ${a + shift} − ${decade} = ${gap}.`,
  };
}

/**
 * A full set. Consecutive rounds never repeat the same (a, b) pair, so
 * every race is fresh.
 */
export function generateSledSet(rand = Math.random) {
  const rounds = [];
  for (let i = 0; i < SLED_ROUNDS_PER_SET; i++) {
    let round = generateSledRound(i, rand);
    let guard = 0;
    while (
      i > 0 && guard < 30 &&
      round.a === rounds[i - 1].a && round.b === rounds[i - 1].b
    ) {
      round = generateSledRound(i, rand);
      guard++;
    }
    rounds.push(round);
  }
  return rounds;
}

/** Grade Part A — the rope prediction ("bigger" | "same" | "smaller"). Pure. */
export function gradeSledPredict(round, choice) {
  const correct = choice === round.scenario.answer;
  return {
    correct,
    choice,
    points: correct ? SLED_PREDICT_POINTS : 0,
    label: correct
      ? `🪢 The rope knows! +${SLED_PREDICT_POINTS} pts`
      : round.scenario.mover === "both"
        ? "Both sleds moved TOGETHER — the rope never stretched!"
        : "Only ONE sled moved — that DOES change the gap!",
  };
}

/**
 * Grade Part B — the confirmed slide. `slid` is the total the pair moved.
 * Correct when the back sled sits on ANY decade (0 slides when it already
 * does). Pure.
 */
export function gradeSledSlide(round, slid) {
  const back = round.b + slid;
  const onDecade = back % 10 === 0 && back >= 10;
  return {
    correct: onDecade,
    slid,
    back,
    points: onDecade ? SLED_SLIDE_POINTS : 0,
    label: onDecade
      ? slid === 0
        ? `👀 Already friendly — no slides needed! +${SLED_SLIDE_POINTS} pts`
        : `❄️ ${back} — a friendly decade! +${SLED_SLIDE_POINTS} pts`
      : `${back} isn't on a decade yet!`,
  };
}

/** Grade Part C — the TYPED difference (plain number, spaces tolerated). Pure. */
export function checkSledDiff(round, text) {
  const cleaned = String(text || "").replace(/\s/g, "");
  if (!/^\d+$/.test(cleaned)) return { valid: false, correct: false };
  return { valid: true, correct: Number(cleaned) === round.gap };
}
