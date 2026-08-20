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
    toolId: "area-of-a-triangle-quiz", title: "Area of a Triangle — Student Quiz", category: "Quiz",
    enabled: true, resultCollection: "achievements", richCollection: null,
    achievementToolName: "area-of-a-triangle-student-quiz", topics: ["measurement-space"], stage: "Stage 4",
    launchUrl: "/online-quizzes/stage-4/measurement-space/area-of-a-triangle.html",
    supportsAdventureAttempts: false, supportsSkillBreakdown: false,
    notes: "Sweet/Mild/Medium/Spicy area-of-triangle quiz (⅓ obtuse from Mild up; Medium half-of-odd areas; Spicy find-a-missing-length). Optional student-code login + secure MMTQuiz achievements save; no typed answers; masteryTopic 'area-of-a-triangle'. Pairs with the interactive + worksheet creator.",
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
    toolId: "decimal-zoom-quiz", title: "Decimal Zoom Rounding — Stage 4 Student Quiz", category: "Quiz",
    enabled: true, resultCollection: "achievements", richCollection: null,
    achievementToolName: "Decimal Zoom Rounding Quiz", topics: ["fdp"], stage: "Stage 4",
    launchUrl: "/online-quizzes/stage-4/number/decimal-zoom.html",
    supportsAdventureAttempts: false, supportsSkillBreakdown: false,
    notes: "Converted from a public-leaderboard quiz to a secure achievements quiz (Phase 4A.1). Retitled Stage 4 when the Stage 3 whole-number companion shipped; achievementToolName kept as 'Decimal Zoom Rounding Quiz' for record continuity.",
  },
  {
    toolId: "whole-number-zoom-quiz", title: "Whole Number Zoom Rounding — Stage 3 Student Quiz", category: "Quiz",
    enabled: true, resultCollection: "achievements", richCollection: null,
    achievementToolName: "Whole Number Zoom Rounding Quiz", topics: ["whole-numbers"], stage: "Stage 3",
    launchUrl: "/online-quizzes/stage-3/number/whole-number-zoom.html",
    supportsAdventureAttempts: false, supportsSkillBreakdown: false,
    notes: "Stage 3 whole-number companion to the Decimal Zoom quiz — rounds to the nearest 10/100/1000/10 000/100 000 (no decimals). Same Sweet/Mild/Medium/Spicy structure + secure achievements save; masteryTopic 'rounding-whole-numbers'.",
  },
  {
    toolId: "fraction-thinking-explorer", title: "Fraction Thinking Explorer — Student", category: "Quiz",
    enabled: true, resultCollection: "achievements", richCollection: null,
    achievementToolName: "Fraction Thinking Explorer — Student", topics: ["fdp"], stage: "Stage 4",
    launchUrl: "/online-quizzes/stage-4/number/fraction-thinking-explorer.html",
    supportsAdventureAttempts: false, supportsSkillBreakdown: false,
    notes: "Open exploration + thinking-challenge shuffler (predict/construct/compare/misconception/recurring/division). Informational feedback, no typed answers; achievement = challenges met/worked. score/total are challenge counts, not marks. NOTE: superseded for classroom use by the guided 'Fraction Thinking Quest' — keep or set enabled:false to hide.",
  },
  {
    toolId: "fractions-number-line-quiz", title: "Fractions Number Line Quiz — Student", category: "Quiz",
    enabled: true, resultCollection: "achievements", richCollection: null,
    achievementToolName: "Fractions Number Line Quiz — Student", topics: ["fdp"], stage: "Stage 4",
    launchUrl: "/online-quizzes/stage-4/number/fraction-thinking-quest.html",
    supportsAdventureAttempts: false, supportsSkillBreakdown: false,
    notes: "Guided 8-stage progression (understand→equivalence→density→recurring→division→improper→compare→convince) with RANDOMISED values (same learning intention each attempt). EN/Arabic/Farsi bilingual. Minimal student UI: drag the point + an 'equal parts' stepper + contextual chips. Informational feedback, no typed answers; part-b checkable inputs + reasoning tags stored in types[]. score/total = stages completed. localStorage resume + secure achievement save.",
  },
  // Newly-migrated student quizzes (2026-07, secure code exchange + dashboard-linkable).
  // Each page now shows the student-login modal on load and writes an `achievements`
  // record via window.MMTSave; achievementToolName MUST match the `tool` string the page writes.
  {
    toolId: "fraction-to-percentage-quiz", title: "Fraction to Percentage — Student Quiz", category: "Quiz",
    enabled: true, resultCollection: "achievements", richCollection: null,
    achievementToolName: "fraction-to-percentage-student-quiz", topics: ["fdp"], stage: "Stage 4",
    launchUrl: "/online-quizzes/stage-4/number/fraction-to-percentage.html",
    supportsAdventureAttempts: false, supportsSkillBreakdown: false,
    notes: "Sweet/Mild/Medium/Spicy, 15 questions, built on the Fraction to Percentage double number line. Each question opens with an ESTIMATE (drag the marker), which clears on the first reveal; the second reveal names ONE part (100 ÷ d) and the student counts on. No unit fractions in any bank — 1/d would be the answer. Sweet = friendly only; Mild = 7 friendly then 8 terminating (improper in both); Medium = 5 friendly / 5 terminating / 5 recurring; Spicy = Medium's bank with NO model. Secure student-code login + achievements save; masteryTopic 'fraction-to-percentage'; types[] carry level/kind/improper/estimate-accuracy flags. No typed answers stored.",
  },
  {
    toolId: "adding-subtracting-fractions-quiz", title: "Adding and Subtracting Fractions — Student Quiz", category: "Quiz",
    enabled: true, resultCollection: "achievements", richCollection: null,
    achievementToolName: "adding-subtracting-fractions-student-quiz", topics: ["fdp"], stage: "Stage 4",   // five levels: sweet/mild/medium/spicy/extrahot (extrahot = coprime denominators <= 10, no model)
    launchUrl: "/online-quizzes/stage-4/number/adding-subtracting-fractions.html",
    supportsAdventureAttempts: false, supportsSkillBreakdown: false,
    notes: "Sweet/Mild/Medium/Spicy, 15 questions, built on the Adding and Subtracting Fractions bar + number-line tool. The ladder raises the RENAMING demand while the model stays: Sweet = same denominators, Mild = related (one bar re-splits), Medium = unrelated (both re-split, improper sums, simplifying); Spicy = Medium's bank with NO model and take-aways that pass zero (negative answers). Each model question runs estimate (drag the marker) → bars in their own units; every modelled level (Sweet/Mild/Medium) offers an optional reveal via back/forward arrows ('Show the pieces' / 'Show the renaming', tagged usedRenameReveal), with the pieces animating into and out of place. Answers are entered in a MathLive fraction editor (same library as the Adventure's MathAnswerInput, trimmed to ONE fraction-template button; CDN-loaded, falls back to the plain typed input offline). Answers accept any equivalent form — 10/12, 5/6 or 1 3/20 — matched as exact rationals; one attempt per question, so the score is a true /15. Secure student-code login + achievements save; masteryTopic 'adding-subtracting-fractions'; types[] carry level/op/den/improper/negative/estimate flags. No typed answers stored. Trilingual EN/AR/FA (selected language on top, English beneath; maths and numerals stay Western/LTR); non-English attempts tagged lang:ar / lang:fa in types[].",
  },
  {
    toolId: "fraction-of-amount-quiz", title: "Fraction of an Amount — Student Quiz", category: "Quiz",
    enabled: true, resultCollection: "achievements", richCollection: null,
    achievementToolName: "fraction-of-amount-student-quiz", topics: ["fdp"], stage: "Stage 4",
    launchUrl: "/online-quizzes/stage-4/number/fraction-of-amount.html",
    supportsAdventureAttempts: false, supportsSkillBreakdown: false,
    notes: "Sweet/Mild/Medium/Spicy fraction-of-an-amount quiz (times-table chart tool). Added secure student-code login + achievements save (2026-07). masteryTopic 'fraction-of-amount'; no typed answers stored.",
  },
  {
    toolId: "collecting-like-terms-quiz", title: "Collecting Like Terms — Student Quiz", category: "Quiz",
    enabled: true, resultCollection: "achievements", richCollection: null,
    achievementToolName: "collecting-like-terms-student-quiz", topics: ["algebra"], stage: "Stage 4",
    launchUrl: "/online-quizzes/stage-4/algebra/collecting-like-terms.html",
    supportsAdventureAttempts: false, supportsSkillBreakdown: false,
    notes: "Escape-room style, 15 locks, EN/AR/FA. Added secure student-code login + achievements save (2026-07). score = locks broken; masteryTopic 'collecting-like-terms'.",
  },
  {
    toolId: "number-groups-quiz", title: "Number Groups (Coefficients) — Student Quiz", category: "Quiz",
    enabled: true, resultCollection: "achievements", richCollection: null,
    achievementToolName: "number-groups-student-quiz", topics: ["algebra"], stage: "Stage 4",
    launchUrl: "/online-quizzes/stage-4/algebra/number-groups.html",
    supportsAdventureAttempts: false, supportsSkillBreakdown: false,
    notes: "Seeing a coefficient × factor as equal groups (lead-in to like terms). Added secure student-code login + achievements save (2026-07). masteryTopic 'number-groups'. (Page <title> was a copy-paste of the like-terms quiz — content is the groups quiz.)",
  },
  {
    toolId: "perimeter-area-rectangle-quiz", title: "Perimeter and Area of Rectangles — Student Quiz", category: "Quiz",
    enabled: true, resultCollection: "achievements", richCollection: null,
    achievementToolName: "perimeter-area-rectangle-student-quiz", topics: ["measurement-space"], stage: "Stage 4",
    launchUrl: "/online-quizzes/stage-4/measurement-space/perimeter-area-rectangle.html",
    supportsAdventureAttempts: false, supportsSkillBreakdown: false,
    notes: "Dual area+perimeter quiz. Added secure student-code login + achievements save (2026-07). Saved score = area+perimeter combined out of 30 (2×15); area/perimeter subtotals stored in types[]. masteryTopic 'perimeter-area-rectangle'. Title aligned to 'Perimeter and Area of Rectangles' (2026-07) to match the interactive tool's Student Quiz flyout; toolId/achievementToolName unchanged so existing records still group.",
  },
  {
    toolId: "area-model-quiz", title: "Area Model — Student Quiz", category: "Quiz",
    enabled: true, resultCollection: "achievements", richCollection: null,
    achievementToolName: "area-model-student-quiz", topics: ["measurement-space"], stage: "Stage 4",
    launchUrl: "/online-quizzes/stage-4/measurement-space/area-model.html",
    supportsAdventureAttempts: false, supportsSkillBreakdown: false,
    notes: "Area-only sibling of the perimeter-area-rectangle quiz (2026-07): same board, splits and levels, but students enter area only. Saved score = area out of 15; masteryTopic 'area-model'.",
  },
  {
    toolId: "factor-circles-quiz", title: "Products & Factors: Escape the Factor Circle Room — Student Quiz", category: "Quiz",
    enabled: true, resultCollection: "achievements", richCollection: null,
    achievementToolName: "factor-circles-student-quiz", topics: ["number"], stage: "Stage 4",
    launchUrl: "/online-quizzes/stage-4/number/factor-circles.html",
    supportsAdventureAttempts: false, supportsSkillBreakdown: false,
    notes: "Escape-room, 10 locks (factors/products). Added secure student-code login + achievements save on escape (2026-07). score = locks solved out of 10; masteryTopic 'factors-and-products'.",
  },
  {
    toolId: "integer-addition-quiz", title: "Integer Addition & Subtraction — Student Quiz", category: "Quiz",
    enabled: true, resultCollection: "achievements", richCollection: null,
    achievementToolName: "integer-addition-student-quiz", topics: ["integers"], stage: "Stage 4",
    launchUrl: "/online-quizzes/stage-4/number/integer-addition.html",
    supportsAdventureAttempts: false, supportsSkillBreakdown: false,
    notes: "Add/subtract integers, Sweet→Spicy, 15 questions. Added secure student-code login + achievements save (2026-07). masteryTopic 'integer-addition'.",
  },
  {
    toolId: "integer-combined-signs-quiz", title: "Integers: Combined Signs — Student Quiz", category: "Quiz",
    enabled: true, resultCollection: "achievements", richCollection: null,
    achievementToolName: "integer-combined-signs-student-quiz", topics: ["integers"], stage: "Stage 4",
    launchUrl: "/online-quizzes/stage-4/number/integer-combined-signs.html",
    supportsAdventureAttempts: false, supportsSkillBreakdown: false,
    notes: "Combined-signs integer quiz with worked solutions. Added secure student-code login + achievements save (2026-07). masteryTopic 'integer-combined-signs'.",
  },
  {
    toolId: "negatives-on-the-number-line-quiz", title: "Negatives on the Number Line — Student Quiz", category: "Quiz",
    enabled: true, resultCollection: "achievements", richCollection: null,
    achievementToolName: "negatives-on-the-number-line-student-quiz", topics: ["integers"], stage: "Stage 4",
    launchUrl: "/online-quizzes/stage-4/number/negatives-on-the-number-line.html",
    supportsAdventureAttempts: false, supportsSkillBreakdown: false,
    notes: "Missing-value on a number line incl. negatives, 20 questions. Added secure student-code login + achievements save on completion (2026-07). masteryTopic 'negatives-on-the-number-line'.",
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
