/**
 * SNOW RECORDS (S2) — pure helpers for the Snowball Sums trophy stand: the
 * TEN trophy slots (one per reserved challenge area), best-score keys, and
 * the rows shown in the trophy grid.
 *
 * The ten CHALLENGES themselves are still to be designed — each slot is a
 * placeholder named after its reserved area (see SNOW_CHALLENGE_SPOTS in
 * snowLayout.js). When a challenge is built, rename its slot here, point its
 * store at the matching best key (`mma-snow-<id>-best`) and set its real
 * max score — the stand, grid and medals all follow automatically.
 *
 * Medal thresholds are IMPORTED from the farm (MEDALS/medalFor) so gold /
 * silver / bronze can never drift between the two trophy stands.
 */
import { MEDALS, medalFor } from "../farm/farmRecords.js";
import { SNOW_CHALLENGE_SPOTS } from "./snowLayout.js";

export { MEDALS, medalFor };

// Slot order = reading order on the stand (top row first, like the farm).
export const SNOW_CHALLENGE_IDS = SNOW_CHALLENGE_SPOTS.map((s) => s.id);

export const SNOW_BEST_KEYS = Object.fromEntries(
  SNOW_CHALLENGE_IDS.map((id) => [id, `mma-snow-${id}-best`])
);

// Placeholder maximums — the farm's standard 15 rounds × 25 points. Replace
// per-challenge as each one is designed (the % maths follows automatically).
export const SNOW_MAX_SCORES = Object.fromEntries(
  SNOW_CHALLENGE_IDS.map((id) => [id, 375])
);

// Per-slot metadata for the trophy grid. `name` is the reserved AREA name
// until its real challenge exists; blurbs say so honestly. BUILT slots get
// their real name/skill/blurb via SLOT_OVERRIDES.
const SPOT_ICONS = {
  rink: "⛸️", village: "🧊", colony: "🐧", snowmen: "⛄", pines: "🎄",
  range: "❄️", cave: "🌌", sled: "🛷", lodgeyard: "🏔️", lights: "✨",
};

// Slots whose challenge has been BUILT (keep max scores in SNOW_MAX_SCORES'
// shape — 15 rounds × 25 pts unless a challenge says otherwise).
const SLOT_OVERRIDES = {
  range: {
    name: "The Snowball Range",
    skill: "Bridging to ten (addition strategies)",
    blurb: "Split your throw to fill the crate to the next ten first — bridging to ten turns any sum friendly. Perfect splits and totals earn the points.",
  },
  rink: {
    name: "The Ice Rink",
    skill: "Jumping by tens (the empty number line)",
    blurb: "The rink is a giant number line — glide Fern's penguin to the fish bucket in the fewest pushes. Big jumps of ten beat little shoves, and sometimes overshooting and stepping back wins!",
  },
  pines: {
    name: "Christmas Tree Grove",
    skill: "Compensation (round, then adjust)",
    blurb: "Lights come in bundles of ten — grab the friendly pile, hang the lot, then unclip the extra or clip one more. 47 + 29 is really 47 + 30 − 1. Nobody counts every single light!",
  },
  snowmen: {
    name: "Snowman Meadow",
    skill: "Levelling (make a double)",
    blurb: "Hop snowballs from the taller snowman to the shorter until they're level twins — 17 + 21 becomes 19 + 19, a double you know. The total never changes… and odd differences can never make twins!",
  },
  sled: {
    name: "Sledding Slope",
    skill: "Constant difference (slide both numbers)",
    blurb: "Two sleds, one rope — the rope IS the gap and it can't stretch. Slide the pair together until the back sled sits on a decade: 83 − 29 becomes 84 − 30, and the difference never changed.",
  },
  village: {
    name: "Igloo Village",
    skill: "Split strategy (tens with tens, ones with ones)",
    blurb: "Igloos are built from ten-blocks and one-blocks — join like with like, and when the ones pile passes ten, ten of them SNAP into a brand-new ten-block. 38 + 25 is 50 and 13, regrouped.",
  },
  colony: {
    name: "Penguin Colony",
    skill: "Doubles + near-doubles (pair them up)",
    blurb: "The rows pair off and the hiding double shows itself: 7 + 8 is double 7 and one sticking out. A gap of two? One penguin waddles across — double the middle!",
  },
  cave: {
    name: "The Ice Cave",
    skill: "Think-addition (count up to subtract)",
    blurb: "Subtraction isn't always take-away: 52 − 47 lights five crystals UP from 47; 52 − 3 steps back three and lands on the answer. Choose the way with fewer glows.",
  },
  lodgeyard: {
    name: "The Lodge Yard",
    skill: "Friends of 100 (bridge through the tens)",
    blurb: "Pay for cocoa with a 100-token and count the change UP on the hundred-bead board: 65 + 5 → 70, + 30 → 100. Friends of 10 make friends of 100 — and sometimes a hop is zero.",
  },
  lights: {
    name: "Aurora Lookout",
    skill: "Strategy picker (the capstone)",
    blurb: "The aurora writes a sum in the sky and YOU choose the tool: bridge it, jump it, round it, double it, count up, slide both, or make friends with 100. The brightest path shines fullest.",
  },
};

export const SNOW_TROPHY_META = SNOW_CHALLENGE_SPOTS.map((s) => ({
  key: s.id,
  icon: SPOT_ICONS[s.id] || "❄️",
  name: s.label,
  unit: "points",
  skill: "Coming soon",
  blurb: `A new maths challenge is coming to the ${s.label}. Its trophy will live in this spot.`,
  ...(SLOT_OVERRIDES[s.id] || {}),
}));

/** Best score for a snow challenge key (localStorage-guarded; 0 if unset). */
export function readSnowBest(challenge) {
  try {
    const v = Number(localStorage.getItem(SNOW_BEST_KEYS[challenge]));
    return Number.isFinite(v) && v > 0 ? v : 0;
  } catch {
    return 0;
  }
}

/** Percentage (0–100, rounded) of the maximum for a challenge's best. */
export function snowBestPercent(challenge, best = readSnowBest(challenge)) {
  const max = SNOW_MAX_SCORES[challenge] || 1;
  return Math.max(0, Math.min(100, Math.round((best / max) * 100)));
}

/** Full per-slot trophy data for the grid: best, %, medal, max, blurb. */
export function snowTrophyRows() {
  return SNOW_TROPHY_META.map((r) => {
    const best = readSnowBest(r.key);
    const pct = snowBestPercent(r.key, best);
    return { ...r, best, pct, medal: medalFor(pct), max: SNOW_MAX_SCORES[r.key] || 0 };
  });
}

/** Entries for the 3D trophy stand — [{ key, percent }] in slot order. */
export function snowShelfEntries() {
  return SNOW_CHALLENGE_IDS.map((key) => ({ key, percent: snowBestPercent(key) }));
}

/** The fallback dialogue lines for the stand (live from any saved bests). */
export function snowRecordLines() {
  const any = SNOW_TROPHY_META.some((r) => readSnowBest(r.key) > 0);
  if (!any) {
    return [
      "The Snowball Sums trophy stand is empty — for now!",
      "Ten challenges are coming to the snow world. Each one will earn bronze, silver or gold here.",
    ];
  }
  const lines = ["🏅 Your Snowball Sums trophy stand:"];
  for (const r of SNOW_TROPHY_META) {
    const best = readSnowBest(r.key);
    const pct = snowBestPercent(r.key, best);
    const medal = medalFor(pct);
    lines.push(`${r.icon} ${r.name} — best ${best} ${r.unit} (${pct}%) ${medal ? medal.label : "· no trophy yet"}`);
  }
  return lines;
}
