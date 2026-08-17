/**
 * MMT TOOL REGISTRY (Phase 4A) — the single place that declares which tools /
 * quizzes feed results into the platform. Add or disable entries here to control
 * what the Student + Teacher platforms surface; nothing else should hardcode a
 * single tool. PURE data + helpers (no Firebase / DOM), so the app's system
 * checks can import it directly.
 *
 * Field meanings:
 *   toolId                 stable id used in filters / dedupe
 *   title                  display name
 *   category               grouping ("Adventure", "Quiz", ...)
 *   enabled                show in the platform (false = hidden but kept)
 *   resultCollection       compact records collection (always "achievements")
 *   richCollection         rich per-attempt collection, or null
 *   achievementToolName    the `tool` value this writes into achievements
 *   topics                 topic ids/names this tool covers
 *   stage                  NSW stage label
 *   launchUrl              where to play/open the tool
 *   supportsAdventureAttempts  writes rich adventureAttempts?
 *   supportsSkillBreakdown     per-question/skill detail available?
 *   notes                  free text
 */
export const MMT_TOOLS = Object.freeze([
  {
    toolId: "mills-maths-adventure",
    title: "Mills Maths Adventure",
    category: "Adventure",
    enabled: true,
    resultCollection: "achievements",
    richCollection: "adventureAttempts",
    achievementToolName: "Mills Maths Adventure",
    topics: ["integers", "fdp", "algebra", "area", "pythagoras"],
    stage: "Stage 4",
    // Site-absolute path (Netlify publish="."). Built Adventure lives in a
    // lowercase-hyphenated folder (no space) — copy `dist/` here after building.
    launchUrl: "/game-platforms/mills-maths-adventure/index.html",
    supportsAdventureAttempts: true,
    supportsSkillBreakdown: true,
    notes: "3D low-poly maths world. Compact achievements + rich adventureAttempts (no typed answers).",
  },
  {
    toolId: "algebraic-techniques",
    title: "Algebraic Techniques — Student Quiz",
    category: "Quiz",
    enabled: true,
    resultCollection: "achievements",
    richCollection: null,
    achievementToolName: "Algebraic Techniques — Student Quiz",
    topics: ["algebra"],
    stage: "Stage 4",
    launchUrl: "/online-quizzes/stage-4/algebra/algebraic-techniques.html",
    supportsAdventureAttempts: false,
    supportsSkillBreakdown: false,
    notes: "Live quiz page still uses the OLD anonymous pattern — apply docs/quiz-migration-guide.md (canonical migrated template lives in the MMA repo portals/). achievementToolName matches the live records.",
  },
  // Migrated student-achievement quizzes (Phase 4A.1, secure code exchange).
  // achievementToolName = the EXACT live `tool` string each page writes.
  {
    toolId: "equations-quiz", title: "Equations — Student Quiz", category: "Quiz",
    enabled: true, resultCollection: "achievements", richCollection: null,
    achievementToolName: "equations-student-quiz", topics: ["algebra"], stage: "Stage 4",
    launchUrl: "/online-quizzes/stage-4/algebra/equations.html",
    supportsAdventureAttempts: false, supportsSkillBreakdown: false, notes: "Migrated.",
  },
  {
    toolId: "substitution-quiz", title: "Substitution — Student Quiz", category: "Quiz",
    enabled: true, resultCollection: "achievements", richCollection: null,
    achievementToolName: "substitution-in-algebra-student-quiz", topics: ["algebra"], stage: "Stage 4",
    launchUrl: "/online-quizzes/stage-4/algebra/substitution.html",
    supportsAdventureAttempts: false, supportsSkillBreakdown: false, notes: "Migrated.",
  },
  {
    toolId: "double-numberline-quiz", title: "Double Number Line: Equations — Student Quiz", category: "Quiz",
    enabled: true, resultCollection: "achievements", richCollection: null,
    achievementToolName: "equations-double-number-line-student-quiz", topics: ["algebra"], stage: "Stage 4",
    launchUrl: "/online-quizzes/stage-4/algebra/double-numberline/student-quiz.html",
    supportsAdventureAttempts: false, supportsSkillBreakdown: false, notes: "Migrated.",
  },
  {
    toolId: "double-numberline-add-subtract-quiz", title: "Double Number Line: +/− Equations — Student Quiz", category: "Quiz",
    enabled: true, resultCollection: "achievements", richCollection: null,
    achievementToolName: "addition-subtraction-equations-student-quiz", topics: ["algebra"], stage: "Stage 4",
    launchUrl: "/online-quizzes/stage-4/algebra/double-numberline/student-quiz-add-subtract.html",
    supportsAdventureAttempts: false, supportsSkillBreakdown: false, notes: "Migrated.",
  },
  {
    toolId: "double-numberline-mult-div-quiz", title: "Double Number Line: ×/÷ Equations — Student Quiz", category: "Quiz",
    enabled: true, resultCollection: "achievements", richCollection: null,
    achievementToolName: "multiplication-division-equations-student-quiz", topics: ["algebra"], stage: "Stage 4",
    launchUrl: "/online-quizzes/stage-4/algebra/double-numberline/student-quiz-mult-div.html",
    supportsAdventureAttempts: false, supportsSkillBreakdown: false, notes: "Migrated.",
  },
  {
    toolId: "angle-relationships-quiz", title: "Angle Relationships — Student Quiz", category: "Quiz",
    enabled: true, resultCollection: "achievements", richCollection: null,
    achievementToolName: "angle-relationships-student-quiz", topics: ["measurement-space"], stage: "Stage 4",
    launchUrl: "/online-quizzes/stage-4/measurement-space/angle-relationships.html",
    supportsAdventureAttempts: false, supportsSkillBreakdown: false, notes: "Migrated.",
  },
  {
    toolId: "reading-a-protractor-quiz", title: "Reading a Protractor — Student Quiz", category: "Quiz",
    enabled: true, resultCollection: "achievements", richCollection: null,
    achievementToolName: "reading-a-protractor-student-quiz", topics: ["measurement-space"], stage: "Stage 4",
    launchUrl: "/online-quizzes/stage-4/measurement-space/reading-a-protractor.html",
    supportsAdventureAttempts: false, supportsSkillBreakdown: false, notes: "Migrated.",
  },
  {
    toolId: "integers-quiz", title: "Computation with Integers — Student Quiz", category: "Quiz",
    enabled: true, resultCollection: "achievements", richCollection: null,
    achievementToolName: "integers-student-quiz", topics: ["integers"], stage: "Stage 4",
    launchUrl: "/online-quizzes/stage-4/number/computation-with-integers.html",
    supportsAdventureAttempts: false, supportsSkillBreakdown: false, notes: "Migrated.",
  },
  {
    toolId: "fdp-quiz", title: "Fractions, Decimals & Percentages — Student Quiz", category: "Quiz",
    enabled: true, resultCollection: "achievements", richCollection: null,
    achievementToolName: "fdp-student-quiz", topics: ["fdp"], stage: "Stage 4",
    launchUrl: "/online-quizzes/stage-4/number/fractions-decimals-percentages.html",
    supportsAdventureAttempts: false, supportsSkillBreakdown: false, notes: "Migrated.",
  },
  {
    toolId: "decimal-zoom-quiz", title: "Decimal Zoom Rounding — Student Quiz", category: "Quiz",
    enabled: true, resultCollection: "achievements", richCollection: null,
    achievementToolName: "Decimal Zoom Rounding Quiz", topics: ["fdp"], stage: "Stage 4",
    launchUrl: "/online-quizzes/stage-4/number/decimal-zoom.html",
    supportsAdventureAttempts: false, supportsSkillBreakdown: false,
    notes: "Converted from a public-leaderboard quiz to a secure achievements quiz (Phase 4A.1).",
  },
  // Disabled placeholder — no standalone Pythagoras quiz yet (Adventure covers it).
  // Demonstrates the enable/disable switch; flip enabled + set launchUrl when built.
  {
    toolId: "pythagoras-quiz", title: "Pythagoras — Student Quiz", category: "Quiz",
    enabled: false, resultCollection: "achievements", richCollection: null,
    achievementToolName: "Pythagoras — Student Quiz", topics: ["pythagoras"], stage: "Stage 4",
    launchUrl: "", supportsAdventureAttempts: false, supportsSkillBreakdown: false,
    notes: "Placeholder — no standalone quiz yet.",
  },
]);

/**
 * ⚠ NAME-MISMATCH NOTE (Phase 4A.1 audit of the live website repo).
 * Existing achievements records use INCONSISTENT `tool` values, e.g.
 * "Mills Maths Adventure" (✓ matches), "Algebraic Techniques — Student Quiz" (✓),
 * but also slugs like "fdp-student-quiz", "equations-student-quiz",
 * "angle-relationships-student-quiz", "Decimal Zoom Rounding Quiz".
 * Until each quiz is migrated + standardised, set each placeholder's
 * `achievementToolName` to the EXACT live string so records group correctly
 * (unmatched records still appear, grouped as "other"). Recommended: standardise
 * tool names to the registry title as you migrate each quiz.
 */

/** All tools (incl. disabled) — for admin/registry views. */
export function getAllTools() { return MMT_TOOLS.slice(); }

/** Only enabled tools — what the platforms surface by default. */
export function getEnabledTools() { return MMT_TOOLS.filter((t) => t.enabled); }

/** Look up a tool by id. */
export function getTool(toolId) { return MMT_TOOLS.find((t) => t.toolId === toolId) || null; }

/** Is a tool enabled? */
export function isToolEnabled(toolId) { const t = getTool(toolId); return Boolean(t && t.enabled); }

/**
 * Match a compact achievement record to a registry tool. Records carry a `tool`
 * string (achievementToolName); fall back to a loose title match. Returns the
 * toolId or "other" so the platform can always group a result.
 */
export function toolIdForAchievement(record = {}) {
  const name = String(record.tool || record.toolName || "").trim();
  if (!name) return "other";
  const hit = MMT_TOOLS.find((t) => t.achievementToolName === name) ||
    MMT_TOOLS.find((t) => name.toLowerCase().includes(t.title.toLowerCase().split(" —")[0].toLowerCase()));
  return hit ? hit.toolId : "other";
}

/** Distinct topic ids across enabled tools (for filter dropdowns). */
export function enabledTopics() {
  const set = new Set();
  for (const t of getEnabledTools()) for (const tp of (t.topics || [])) set.add(tp);
  return [...set];
}
