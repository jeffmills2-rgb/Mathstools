/**
 * Fraction Farm teacher-task objective text (Phase — farm tasks).
 *
 * The challengeId keys + host names here MUST stay in lockstep with:
 *   - the Teacher Platform's FARM_CHALLENGES list (website portal), and
 *   - FARM_BEST_KEYS / FARM_MAX_SCORES in src/data/farm/farmRecords.js.
 * A mismatch silently yields "no active farm task".
 */
export const FARM_TASK_META = {
  fence:   { name: "Fence Challenge",   host: "Pip" },
  roundup: { name: "The Round-Up",      host: "Fern" },
  order:   { name: "Order the Parts",   host: "Alby" },
  crate:   { name: "Crate Packing",     host: "Robot" },
  milk:    { name: "The Milk Splitter", host: "the Milkman" },
  weigh:   { name: "The Weigh Station", host: "the Weigh Master" },
  trade:   { name: "The Trading Post",  host: "Steve" },
  veggie:  { name: "The Veggie Plot",   host: "Trevor" },
  plank:   { name: "Plank the Gap",     host: "Woody" },
  shop:    { name: "The Farm Shop",     host: "Sunny" },
};

export const FARM_TASK_CHALLENGE_IDS = Object.keys(FARM_TASK_META);

/** e.g. "Find Pip to complete the Fence Challenge in Fraction Farm". */
export function farmObjectiveText(challengeId) {
  const m = FARM_TASK_META[challengeId];
  if (!m) return "Head to Fraction Farm for your challenge";
  return `Find ${m.host} to complete the ${m.name} in Fraction Farm`;
}
