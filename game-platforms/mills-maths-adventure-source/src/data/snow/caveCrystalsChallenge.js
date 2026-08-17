/**
 * THE ICE CAVE — LIGHT THE CRYSTALS (IC) — pure logic for the
 * THINK-ADDITION challenge, the eighth Snowball Sums build. No React, no
 * stores — fully checkable headlessly. All values are small integers.
 *
 * PEDAGOGY — subtraction is NOT always take-away: the cave wall carries
 * numbered crystals, and 52 − 47 lights UP from 47 to 52 — five glows,
 * done — while 52 − 3 lights BACK three from 52 and lands on the answer.
 * The CHOICE is the whole first act: count up, or count back? Up wins when
 * the numbers are CLOSE (the gap is tiny); back wins when you're only
 * taking a tiny bit away. The answer is read TWO different ways — count-up:
 * the answer is HOW MANY glows; count-back: the answer is WHERE you land —
 * and both are a − b, which is the deep point.
 *
 * A SET is 15 rounds, 3 per concept stage:
 *   S1  close numbers        count UP wins (52 − 47)
 *   S2  tiny take-aways      count BACK wins (52 − 3)
 *   S3  you choose           mixed
 *   S4  bigger + crossings   mixed, minuends to 97, hops cross decades
 *   S5  the long way round   7–9 steps either way — commit! (round 13 is
 *                            always a LONG count-back)
 *
 * Scoring (per round, max 25):
 *   A) CHOOSE the direction (fewer glows wins)  = 10
 *   B) TYPE the answer off the lit crystals     = 15
 */

export const CAVE_ROUNDS_PER_SET = 15;
const CAVE_STAGES = 5;
const CAVE_ROUNDS_PER_STAGE = CAVE_ROUNDS_PER_SET / CAVE_STAGES;

export const CAVE_CHOOSE_POINTS = 10;
export const CAVE_ANSWER_POINTS = 15;
export const CAVE_ROUND_POINTS = CAVE_CHOOSE_POINTS + CAVE_ANSWER_POINTS; // 25
export const CAVE_MAX_SCORE = CAVE_ROUNDS_PER_SET * CAVE_ROUND_POINTS; // 375

// Part A's choices.
export const CAVE_DIRECTIONS = ["up", "back"];

// The forced LONG count-back (b = 7–9) lands mid-S5.
export const CAVE_LONG_ROUND_INDEX = 13;

// Glow pacing (3D layer + panel): one crystal per beat.
export const CAVE_GLOW_MS = 480;
export const CAVE_GLOW_TAIL_MS = 700;

/** Which concept stage (0–4) a round index belongs to. Pure. */
export function caveStageFor(i) {
  return Math.max(0, Math.min(CAVE_STAGES - 1, Math.floor(i / CAVE_ROUNDS_PER_STAGE)));
}

function randInt(min, max, rand) {
  return min + Math.floor(rand() * (max - min + 1));
}

// Stage configs — SOLUTIONS FIRST: pick the round KIND (up-wins or
// back-wins), then the small side (the gap for up-rounds, the subtrahend
// for back-rounds) and a minuend that leaves the other side much bigger.
//   kinds     which kinds this stage draws from
//   smallMin/Max  the tiny side's size (the number of glows)
//   aMin/aMax     the minuend's range
const CAVE_STAGE_CONFIGS = [
  { kinds: ["up"], smallMin: 2, smallMax: 5, aMin: 26, aMax: 60, name: "close numbers" },
  { kinds: ["back"], smallMin: 2, smallMax: 5, aMin: 26, aMax: 60, name: "tiny take-aways" },
  { kinds: ["up", "back"], smallMin: 2, smallMax: 6, aMin: 30, aMax: 79, name: "you choose" },
  { kinds: ["up", "back"], smallMin: 3, smallMax: 6, aMin: 41, aMax: 97, name: "bigger + crossings" },
  { kinds: ["up", "back"], smallMin: 7, smallMax: 9, aMin: 41, aMax: 97, name: "the long way round" },
];

/** One round. roundIndex ∈ [0, 15); rand injectable for the checks. */
export function generateCaveRound(roundIndex, rand = Math.random) {
  const stage = caveStageFor(roundIndex);
  const cfg = CAVE_STAGE_CONFIGS[stage];
  const forcedLong = roundIndex === CAVE_LONG_ROUND_INDEX;

  const kind = forcedLong ? "back" : cfg.kinds[Math.floor(rand() * cfg.kinds.length)];
  const small = randInt(cfg.smallMin, cfg.smallMax, rand);
  const a = randInt(Math.max(cfg.aMin, small * 2 + 5), cfg.aMax, rand);

  // up-round: the GAP is small (b = a − small, close to a).
  // back-round: the SUBTRAHEND is small (b = small).
  const b = kind === "up" ? a - small : small;
  const answer = a - b;
  const steps = kind === "up" ? a - b : b; // glows along the wall
  // The crystal window the wall shows: a little beyond both ends of the lit run.
  const runLow = kind === "up" ? b : a - b;
  const windowMin = Math.max(0, runLow - 2);
  const windowMax = a + 2;

  return {
    roundIndex,
    stage,
    stageName: cfg.name,
    a,
    b,
    answer,
    kind, // the WINNING direction
    steps, // glows in the winning direction
    otherSteps: kind === "up" ? b : a - b, // the losing direction's count
    windowMin,
    windowMax,
    prompt: `${a} − ${b}: light the crystals — count UP from ${b}, or count BACK from ${a}?`,
    reason:
      kind === "up"
        ? `${b} is CLOSE to ${a} — count UP: ${steps} glows from ${b} to ${a}. The ANSWER is how many glows: ${answer}. (Counting back would take ${b} steps!)`
        : `Only ${b} is being taken — count BACK: ${b} glows from ${a} land on ${answer}. The ANSWER is where you land. (Counting up would take ${a - b} steps!)`,
  };
}

/**
 * A full set. Consecutive rounds never repeat the same (a, b) pair, so
 * every wall is fresh.
 */
export function generateCaveSet(rand = Math.random) {
  const rounds = [];
  for (let i = 0; i < CAVE_ROUNDS_PER_SET; i++) {
    let round = generateCaveRound(i, rand);
    let guard = 0;
    while (
      i > 0 && guard < 30 &&
      round.a === rounds[i - 1].a && round.b === rounds[i - 1].b
    ) {
      round = generateCaveRound(i, rand);
      guard++;
    }
    rounds.push(round);
  }
  return rounds;
}

/** Grade Part A — the direction ("up" | "back"). Fewer glows wins. Pure. */
export function gradeCaveChoose(round, direction) {
  const correct = direction === round.kind;
  return {
    correct,
    direction,
    points: correct ? CAVE_CHOOSE_POINTS : 0,
    label: correct
      ? `🔦 ${round.steps} glow${round.steps === 1 ? "" : "s"} — the short way! +${CAVE_CHOOSE_POINTS} pts`
      : `That way takes ${round.otherSteps} glows — the other way only needs ${round.steps}!`,
  };
}

/** Grade Part B — the TYPED answer (a − b, however it was read). Pure. */
export function checkCaveAnswer(round, text) {
  const cleaned = String(text || "").replace(/\s/g, "");
  if (!/^\d+$/.test(cleaned)) return { valid: false, correct: false };
  return { valid: true, correct: Number(cleaned) === round.answer };
}
