/**
 * FARM RECORDS (F5) — pure helpers for the trophy bench: medal thresholds,
 * per-challenge maximums, and the record lines shown when the bench is used.
 *
 * Medals (of the challenge's maximum score):
 *   🥇 Gold    100%
 *   🥈 Silver  75–99%
 *   🥉 Bronze  50–74%
 *   —          below 50% (keep trying!)
 */
import { ROUNDS_PER_SET, MAX_ROUND_POINTS } from "./fenceChallenge.js";
import { ROUNDUP_ROUNDS_PER_SET } from "./roundUpChallenge.js";
import { ORDER_ROUNDS_PER_SET, ORDER_FULL_POINTS } from "./orderPartsChallenge.js";
import { CRATE_ROUNDS_PER_SET, CRATE_FULL_POINTS } from "./cratePackingChallenge.js";
import { MILK_ROUNDS_PER_SET, MILK_ROUND_POINTS } from "./milkSplitterChallenge.js";
import { WEIGH_ROUNDS_PER_SET, WEIGH_ROUND_POINTS } from "./weighStationChallenge.js";
import { TRADE_ROUNDS_PER_SET, TRADE_ROUND_POINTS } from "./tradingPostChallenge.js";
import { VEGGIE_ROUNDS_PER_SET, VEGGIE_ROUND_POINTS } from "./veggiePlotChallenge.js";
import { PLANK_ROUNDS_PER_SET, PLANK_ROUND_POINTS } from "./plankGapChallenge.js";
import { SHOP_ROUNDS_PER_SET, SHOP_ROUND_POINTS } from "./farmShopChallenge.js";

export const FARM_BEST_KEYS = {
  fence: "mma-farm-fence-best",
  roundup: "mma-farm-roundup-best",
  order: "mma-farm-order-best",
  crate: "mma-farm-crate-best",
  milk: "mma-farm-milk-best",
  weigh: "mma-farm-weigh-best",
  trade: "mma-farm-trade-best",
  veggie: "mma-farm-veggie-best",
  plank: "mma-farm-plank-best",
  shop: "mma-farm-shop-best",
};

export const FARM_MAX_SCORES = {
  fence: ROUNDS_PER_SET * MAX_ROUND_POINTS,
  roundup: ROUNDUP_ROUNDS_PER_SET,
  order: ORDER_ROUNDS_PER_SET * ORDER_FULL_POINTS,
  crate: CRATE_ROUNDS_PER_SET * CRATE_FULL_POINTS,
  milk: MILK_ROUNDS_PER_SET * MILK_ROUND_POINTS,
  weigh: WEIGH_ROUNDS_PER_SET * WEIGH_ROUND_POINTS,
  trade: TRADE_ROUNDS_PER_SET * TRADE_ROUND_POINTS,
  veggie: VEGGIE_ROUNDS_PER_SET * VEGGIE_ROUND_POINTS,
  plank: PLANK_ROUNDS_PER_SET * PLANK_ROUND_POINTS,
  shop: SHOP_ROUNDS_PER_SET * SHOP_ROUND_POINTS,
};

export const MEDALS = [
  { id: "gold", minPercent: 100, label: "🥇 Gold", color: "#ffd166" },
  { id: "silver", minPercent: 75, label: "🥈 Silver", color: "#cfd6dd" },
  { id: "bronze", minPercent: 50, label: "🥉 Bronze", color: "#cd7f32" },
];

/** Medal for a percentage (0–100), or null below bronze. Pure. */
export function medalFor(percent) {
  return MEDALS.find((m) => percent >= m.minPercent) || null;
}

/** Best score for a challenge key (localStorage-guarded; 0 if unset). */
export function readFarmBest(challenge) {
  try {
    const v = Number(localStorage.getItem(FARM_BEST_KEYS[challenge]));
    return Number.isFinite(v) && v > 0 ? v : 0;
  } catch {
    return 0;
  }
}

/** Percentage (0–100, rounded) of the maximum for a challenge's best. */
export function farmBestPercent(challenge, best = readFarmBest(challenge)) {
  const max = FARM_MAX_SCORES[challenge] || 1;
  return Math.max(0, Math.min(100, Math.round((best / max) * 100)));
}

// Per-challenge metadata: icon, display name, unit, the skill it teaches, and a
// one-line blurb shown when a trophy is opened in the grid.
export const FARM_TROPHY_META = [
  { key: "fence", icon: "🚜", name: "Fence Challenge", unit: "points",
    skill: "Parts of a whole", blurb: "Fence off the right fraction of the field — naming and building fractions from a whole." },
  { key: "roundup", icon: "🐄", name: "The Round-Up", unit: `/${ROUNDUP_ROUNDS_PER_SET} exact`,
    skill: "Fractions of a quantity", blurb: "Herd exactly a fraction of the mob into the pen — finding a fraction of a whole number." },
  { key: "order", icon: "🥕", name: "Order the Parts", unit: "points",
    skill: "Comparing & ordering", blurb: "Line the carrots up smallest to largest — comparing and ordering fractions." },
  { key: "crate", icon: "📦", name: "Crate Packing", unit: "points",
    skill: "Simplifying (HCF)", blurb: "Pack crates in lowest terms — highest common factor and simplifying fractions." },
  { key: "milk", icon: "🥛", name: "The Milk Splitter", unit: "points",
    skill: "Decimals", blurb: "Predict terminating vs recurring decimals, then write the share properly." },
  { key: "weigh", icon: "⚖️", name: "The Weigh Station", unit: "points",
    skill: "Rounding", blurb: "Read the scale and round to the nearest mark — rounding and approximation (≈)." },
  { key: "trade", icon: "🏪", name: "The Trading Post", unit: "points",
    skill: "FDP conversions", blurb: "Trade across three stalls — converting between fractions, decimals and percentages." },
  { key: "veggie", icon: "🥬", name: "The Veggie Plot", unit: "points",
    skill: "Multiplying fractions", blurb: "Shade the area model to multiply two fractions, and predict grow-or-shrink potions." },
  { key: "plank", icon: "🪵", name: "Plank the Gap", unit: "points",
    skill: "Adding & subtracting", blurb: "Fill the fence gap exactly on a shared twelfths grid — adding and subtracting fractions." },
  { key: "shop", icon: "🛒", name: "The Farm Shop", unit: "points",
    skill: "Percentages", blurb: "Run the market stall — markup, discount, GST, profit/loss and unitary restocks." },
];

/** Full per-challenge trophy data for the grid: best, %, medal, max, blurb. */
export function farmTrophyRows() {
  return FARM_TROPHY_META.map((r) => {
    const best = readFarmBest(r.key);
    const pct = farmBestPercent(r.key, best);
    return { ...r, best, pct, medal: medalFor(pct), max: FARM_MAX_SCORES[r.key] || 0 };
  });
}

/** The dialogue lines for the trophy bench (live from the saved bests). */
export function farmRecordLines() {
  const rows = FARM_TROPHY_META;
  const any = rows.some((r) => readFarmBest(r.key) > 0);
  if (!any) {
    return [
      "The trophy bench is empty!",
      "Talk to the hosts around the farm — your best scores earn bronze, silver and gold trophies here.",
    ];
  }
  const lines = ["🏅 Your Fraction Farm trophy bench:"];
  for (const r of rows) {
    const best = readFarmBest(r.key);
    const pct = farmBestPercent(r.key, best);
    const medal = medalFor(pct);
    const bestText = r.key === "roundup" ? `${best}${r.unit}` : `${best} ${r.unit}`;
    lines.push(`${r.icon} ${r.name} — best ${bestText} (${pct}%) ${medal ? medal.label : "· no trophy yet"}`);
  }
  lines.push("Gold needs a PERFECT set. Can you do it?");
  return lines;
}
