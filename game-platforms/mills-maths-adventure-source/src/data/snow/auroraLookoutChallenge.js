/**
 * AURORA LOOKOUT — THE STRATEGY PICKER (AL) — pure logic for the CAPSTONE,
 * the tenth Snowball Sums build. No React, no stores — fully checkable
 * headlessly. All values are small integers.
 *
 * PEDAGOGY — the whole snow world in one place: the aurora writes a sum in
 * the sky and the play is CHOOSING THE TOOL, not finding the answer. Every
 * problem is engineered around one BRIGHTEST strategy, but other tools can
 * genuinely work — and a SOUND second-best choice still scores (5), while
 * the brightest path scores full (10). Only unsound tools score nothing.
 * Then the chosen tool (if sound — else the brightest) is EXECUTED with a
 * one-line scaffold in that strategy's own language. This is the round that
 * makes the world about strategies rather than answers.
 *
 * The seven tools on the menu (each learned at its own challenge):
 *   bridge   ❄️ make ten first          (Snowball Range)
 *   jump     ⛸️ glide by tens           (Ice Rink)
 *   comp     🎄 round, then adjust      (Christmas Tree Grove)
 *   double   🐧 doubles + near-doubles  (Penguin Colony / Snowman Meadow)
 *   countup  🌌 count up the gap        (Ice Cave)
 *   slide    🛷 slide both numbers      (Sledding Slope)
 *   friends  ☕ friends of 100          (Lodge Yard)
 *
 * Eight problem ARCHETYPES, each with a fixed brightest tool + a sound set
 * (the schedule below guarantees every archetype appears in every set):
 *   makeTen     8 + 6            bridge   (sound: double if near, comp if a 9)
 *   nineAdd     47 + 29          comp     (sound: jump, bridge)
 *   nearDouble  25 + 26          double   (sound: jump for two-digit pairs)
 *   closeSub    83 − 79          countup  (sound: slide)
 *   splitAdd    45 + 38? no —    jump     (two-digit + two-digit, plain ones;
 *               46 + 33 style             sound: bridge? no — jump/comp per ones)
 *   slideSub    62 − 29          slide    (sound: comp? not taught for −; none)
 *   pay100      100 − 65         friends  (sound: countup)
 *   cleanJump   47 + 30          jump     (sound: none needed — jump IS it)
 *
 * A SET is 15 rounds — the archetype SCHEDULE (not random) walks the tools
 * then mixes them, ending on the subtlest calls.
 *
 * Scoring (per round, max 25):
 *   A) PICK the tool — brightest 10 · sound 5 · unsound 0
 *   B) EXECUTE it against the scaffold (type the result)  = 15
 */

export const LOOKOUT_ROUNDS_PER_SET = 15;

export const LOOKOUT_PICK_BEST_POINTS = 10;
export const LOOKOUT_PICK_SOUND_POINTS = 5;
export const LOOKOUT_ANSWER_POINTS = 15;
export const LOOKOUT_ROUND_POINTS = LOOKOUT_PICK_BEST_POINTS + LOOKOUT_ANSWER_POINTS; // 25
export const LOOKOUT_MAX_SCORE = LOOKOUT_ROUNDS_PER_SET * LOOKOUT_ROUND_POINTS; // 375

// The tool menu, in display order (keys 1–7).
export const LOOKOUT_STRATEGIES = [
  { key: "bridge", label: "❄️ Make ten first" },
  { key: "jump", label: "⛸️ Jump by tens" },
  { key: "comp", label: "🎄 Round, then adjust" },
  { key: "double", label: "🐧 Use a double" },
  { key: "countup", label: "🌌 Count up the gap" },
  { key: "slide", label: "🛷 Slide both numbers" },
  { key: "friends", label: "☕ Friends of 100" },
];

// One full pass of the archetypes, then a mixed back half — every archetype
// appears at least once in every set. (Fixed, so the checks can assert it.)
export const LOOKOUT_SCHEDULE = [
  "makeTen", "cleanJump", "nearDouble", "nineAdd", "splitAdd",
  "closeSub", "pay100", "slideSub", "nearDouble", "nineAdd",
  "closeSub", "splitAdd", "pay100", "slideSub", "makeTen",
];

function randInt(min, max, rand) {
  return min + Math.floor(rand() * (max - min + 1));
}

function pick(list, rand) {
  return list[Math.floor(rand() * list.length)];
}

// Per-archetype: generate the numbers, the brightest tool, the sound set,
// the answer, and the execute scaffold (the strategy's own language).
const ARCHETYPES = {
  makeTen: (rand) => {
    const a = randInt(6, 9, rand);
    const comp = 10 - a;
    const b = comp + randInt(1, 9 - comp, rand);
    const sound = ["comp"];
    if (Math.abs(a - b) <= 2) sound.push("double");
    return {
      expr: `${a} + ${b}`, answer: a + b, best: "bridge", sound,
      scaffold: `${a} + ${comp} makes ten, then ${b - comp} more:`,
    };
  },
  cleanJump: (rand) => {
    const b = randInt(2, 4, rand) * 10;
    const a = randInt(23, Math.min(59, 97 - b), rand);
    return {
      expr: `${a} + ${b}`, answer: a + b, best: "jump", sound: [],
      scaffold: `${a}, then ${b / 10} glides of ten:`,
    };
  },
  nearDouble: (rand) => {
    const a = randInt(13, 37, rand);
    const b = a + 1;
    return {
      expr: `${a} + ${b}`, answer: a + b, best: "double", sound: ["jump"],
      scaffold: `double ${a}, and 1 more:`,
    };
  },
  nineAdd: (rand) => {
    const ones = pick([8, 9], rand);
    const b = randInt(1, 4, rand) * 10 + ones;
    const a = randInt(25, 97 - b - 2, rand);
    return {
      expr: `${a} + ${b}`, answer: a + b, best: "comp", sound: ["jump", "bridge"],
      scaffold: `${a} + ${b + (10 - ones)}, then take back ${10 - ones}:`,
    };
  },
  splitAdd: (rand) => {
    const oa = randInt(4, 7, rand);
    const ob = randInt(Math.max(3, 11 - oa), Math.min(7, 14 - oa), rand);
    const ta = randInt(2, 5, rand);
    const tb = randInt(2, Math.min(5, 8 - ta - 1), rand);
    const a = ta * 10 + oa;
    const b = tb * 10 + ob;
    return {
      expr: `${a} + ${b}`, answer: a + b, best: "jump", sound: ["bridge", "comp"],
      scaffold: `tens ${ta * 10} + ${tb * 10}, ones ${oa} + ${ob}:`,
    };
  },
  closeSub: (rand) => {
    const gap = randInt(2, 5, rand);
    const a = randInt(41, 97, rand);
    const b = a - gap;
    return {
      expr: `${a} − ${b}`, answer: gap, best: "countup", sound: ["slide"],
      scaffold: `count up from ${b} to ${a}:`,
    };
  },
  slideSub: (rand) => {
    const ones = pick([8, 9], rand);
    const shift = 10 - ones;
    const b = randInt(1, 4, rand) * 10 + ones;
    const a = randInt(b + 13, 97, rand);
    return {
      expr: `${a} − ${b}`, answer: a - b, best: "slide", sound: [],
      scaffold: `slide both up ${shift}: ${a + shift} − ${b + shift}:`,
    };
  },
  pay100: (rand) => {
    const price = randInt(2, 8, rand) * 10 + randInt(1, 9, rand);
    return {
      expr: `100 − ${price}`, answer: 100 - price, best: "friends", sound: ["countup"],
      scaffold: `${price} + ${(10 - (price % 10)) % 10} → ${price + ((10 - (price % 10)) % 10)}, then up to 100:`,
    };
  },
};

export const LOOKOUT_ARCHETYPE_KEYS = Object.keys(ARCHETYPES);

/** One round. roundIndex ∈ [0, 15); rand injectable for the checks. */
export function generateLookoutRound(roundIndex, rand = Math.random) {
  const archetype = LOOKOUT_SCHEDULE[roundIndex];
  const built = ARCHETYPES[archetype](rand);
  return {
    roundIndex,
    stage: Math.floor(roundIndex / 3),
    archetype,
    expr: built.expr,
    answer: built.answer,
    best: built.best,
    sound: built.sound,
    scaffold: built.scaffold,
    prompt: `The aurora writes: ${built.expr}. Which tool makes it EASY?`,
    reason: `${built.expr}: the brightest tool is ${LOOKOUT_STRATEGIES.find((s) => s.key === built.best).label} — ${built.scaffold} ${built.answer}.`,
  };
}

/**
 * A full set — the schedule is FIXED; only the numbers vary. Consecutive
 * rounds never repeat the same expression.
 */
export function generateLookoutSet(rand = Math.random) {
  const rounds = [];
  for (let i = 0; i < LOOKOUT_ROUNDS_PER_SET; i++) {
    let round = generateLookoutRound(i, rand);
    let guard = 0;
    while (i > 0 && guard < 30 && round.expr === rounds[i - 1].expr) {
      round = generateLookoutRound(i, rand);
      guard++;
    }
    rounds.push(round);
  }
  return rounds;
}

/** Grade Part A — the picked tool. Brightest 10 · sound 5 · unsound 0. Pure. */
export function gradeLookoutPick(round, key) {
  const best = key === round.best;
  const sound = round.sound.includes(key);
  const points = best ? LOOKOUT_PICK_BEST_POINTS : sound ? LOOKOUT_PICK_SOUND_POINTS : 0;
  const strat = LOOKOUT_STRATEGIES.find((s) => s.key === key);
  return {
    best,
    sound: best || sound,
    key,
    points,
    label: best
      ? `✨ The brightest path! +${LOOKOUT_PICK_BEST_POINTS} pts`
      : sound
        ? `${strat ? strat.label : key} works — but a brighter tool was shining. +${LOOKOUT_PICK_SOUND_POINTS} pts`
        : `${strat ? strat.label : key} doesn't fit this one!`,
  };
}

/** Grade Part B — the TYPED result. Pure. */
export function checkLookoutAnswer(round, text) {
  const cleaned = String(text || "").replace(/\s/g, "");
  if (!/^\d+$/.test(cleaned)) return { valid: false, correct: false };
  return { valid: true, correct: Number(cleaned) === round.answer };
}
