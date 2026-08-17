/**
 * FDP ADAPTER — wraps the REAL legacy Stage 4 Fractions/Decimals/Percentages
 * question bank and maps it onto the current core question shape with Phase 2F
 * difficulty provenance + prompt splitting.
 *
 * Only this module imports the legacy FDP bank. Pure: no React/DOM/stores.
 *
 * Input modes:
 *   - MathLive ("math") for STRUCTURED FRACTION answers (simplify, equivalent,
 *     operations, conversions-to-fraction, …) with simplest-form checking.
 *   - simple for decimals, percentages, money and whole-number answers.
 *
 * Difficulty: the FDP bank has no levels; difficulty is primarily expressed by
 * WHICH type/skill is used (see FDP_TYPE_LEVELS). Each skill honours the
 * requested level for XP/metadata, applies LIGHT content scaling where the type
 * allows it, and records the mapping in difficultyNotes (requested == actual).
 */
import { generateFdpQuestions } from "../legacy-engines/stage4-fdp/original-engine.js";
import { adaptToCoreQuestion } from "./mmtEngineAdapter.js";
import { splitPrompt } from "../promptFormat.js";
import { FDP_TYPE_LEVELS, levelForType } from "../difficulty/difficultyProfiles.js";
import { makeDifficultyMeta } from "../difficulty/difficultyUtils.js";
import {
  uniq,
  fracTokensToSlash,
  parseFraction,
  makeFractionCheck,
  reduceFraction,
} from "./legacyAdapterHelpers.js";

// Per-skill behaviour. `type` is the legacy bank type; `mode` the input mode;
// flags drive answer handling. `scale` (optional) enables a light content
// filter by level.
const FDP_SKILLS = {
  shadedFractionCircle: { type: "shaded-fraction-circle", mode: "math", simplest: true },
  // --- diagram-heavy skills (Slice 2B) ---
  shadedFractions:       { type: "shaded-fractions", mode: "math", simplest: true, needShaded: true },
  fractionOfGroup:       { type: "fraction-of-group", mode: "math", simplest: true },
  placeFractionNumberLine: { type: "place-fraction-number-line", mode: "math",
    reframePrompt: "What fraction is marked on the number line?" },
  equivalentFractionVisual: { type: "equivalent-fraction-visual", mode: "simple", equivBox: true },
  fractionMultiplyArea:  { type: "fraction-multiply-area", mode: "math", simplest: true },
  proportionDoubleLine:  { type: "proportion-double-line", mode: "simple" },
  simplifyFractions:    { type: "simplify-fractions", mode: "math", simplest: true, scale: "fracSize" },
  fractionOfQuantity:   { type: "fraction-of-quantity", mode: "simple", stripUnit: true, scale: "amount" },
  equivalentFractions:  { type: "equivalent-fractions", mode: "math", reqDenom: true },
  percentageOf:         { type: "percentage-of", mode: "simple", scale: "amount" },
  roundDecimals:        { type: "round-decimals", mode: "simple" },
  fdpConversions:       { type: "fdp-conversions", mode: "auto" },
  fractionOperations:   { type: "fraction-operations", mode: "math", simplest: true },
  decimalOperations:    { type: "decimal-operations", mode: "simple", scale: "decmag" },
  mixedImproper:        { type: "mixed-improper", mode: "math", improperOnly: true },
  percentageChange:     { type: "percentage-change", mode: "simple" },
  discounts:            { type: "discounts", mode: "simple", money: true },
  gstTax:               { type: "gst-tax", mode: "simple", money: true },
  findOriginalValue:    { type: "find-original-value", mode: "simple", money: true },
  errorSpotFractions:   { type: "error-spot-fdp", mode: "auto" },
  // --- Phase 2K: previously-deferred types, now adopted via new answer modes ---
  compareFractions:     { type: "compare-fractions", answerMode: "comparison" },
  orderDecimals:        { type: "compare-decimals", answerMode: "orderedList" },
  trueFalseFdp:         { type: "true-false-fdp", answerMode: "trueFalse" },
  multiPartPercentage:  { type: "multi-part-percentage", answerMode: "multiPart" },
};

export function fdpSkillIds() {
  return Object.keys(FDP_SKILLS);
}

// ---- small utilities ----
const FRAC_TOKEN = /\[\[frac:(-?\d+):(\d+)\]\]/;
const isPureFracToken = (s) => /^\s*\[\[frac:-?\d+:\d+\]\]\s*$/.test(s);
const numbersIn = (s) => (String(s).replace(/−/g, "-").match(/-?\d+(?:\.\d+)?/g) || []).map(Number);

/**
 * Map a LEGACY FDP diagram config (legacy.diagram.config) to our React diagram
 * contract { diagramType, diagramData }. The legacy DOM renderer is NOT used —
 * only its config field names are read here. `legacy` is passed so a mapper can
 * read the prompt/answer when the config alone is insufficient.
 */
const DIAGRAM_MAP = {
  "fraction-circle": (dc) => ({
    diagramType: "fractionCircle",
    diagramData: { numerator: dc.numerator, denominator: dc.denominator },
  }),
  "fraction-bar": (dc) => ({
    diagramType: "fractionBar",
    diagramData: { numerator: dc.numerator, denominator: dc.denominator },
  }),
  "fraction-of-set": (dc) => ({
    diagramType: "fractionSet",
    diagramData: { total: dc.total, shaded: dc.shaded, cols: dc.cols },
  }),
  "number-line-fraction": (dc) => ({
    diagramType: "fractionNumberLine",
    // We show the mark (showMark:true) and ask the student to read it.
    diagramData: { denominator: dc.denominator, wholes: dc.wholes, mark: dc.markNumerator, showMark: true },
  }),
  "equivalent-bars": (dc) => ({
    diagramType: "equivalentFractionBars",
    diagramData: { fracs: (dc.fracs || []).map((f) => [f.n, f.d]) },
  }),
  "fraction-multiply-area": (dc) => ({
    diagramType: "fractionMultiplicationArea",
    diagramData: { n1: dc.n1, d1: dc.d1, n2: dc.n2, d2: dc.d2 },
  }),
  "double-number-line": (dc, legacy) => {
    const ns = numbersIn(legacy.prompt); // "find P% of B" → [P, B]
    const markPercent = ns.length ? ns[0] : null;
    return {
      diagramType: "doubleNumberLine",
      diagramData: {
        topLabel: dc.topLabel, bottomLabel: dc.bottomLabel,
        topMax: dc.topMax, bottomMax: dc.bottomMax, ticks: dc.ticks, markPercent,
      },
    };
  },
};

// Custom check for the "equivalent bars" complete-the-box question: accept the
// bare numerator (e.g. "2") OR the full equivalent fraction (e.g. "2/8").
function makeEquivBoxCheck(targetNum, n, d) {
  return function check(input) {
    const f = parseFraction(input);
    if (!f) return false;
    if (f.d === 1 && f.n === targetNum) return true; // bare numerator
    return f.n * d === n * f.d; // value-equal fraction
  };
}

function pull(type, predicate, tries = 120) {
  let last = null;
  for (let i = 0; i < tries; i++) {
    let q;
    try { q = generateFdpQuestions({ count: 1, allowedTypes: [type] })[0]; }
    catch { continue; }
    if (!q) continue;
    last = q;
    if (!predicate || predicate(q)) return { q, matched: true };
  }
  return { q: last, matched: false };
}

// Light per-level content predicates (return true if the legacy question fits).
function scalePredicate(kind, level) {
  if (kind === "fracSize") {
    const cap = { 1: 12, 2: 24, 3: 40, 4: 64, 5: 90 }[level] || 40;
    const floor = { 1: 0, 2: 0, 3: 12, 4: 24, 5: 40 }[level] || 0;
    return (q) => {
      const m = q.prompt.match(FRAC_TOKEN);
      if (!m) return true;
      const d = Math.abs(Number(m[2]));
      return d <= cap && d >= floor;
    };
  }
  if (kind === "amount") {
    const cap = { 1: 50, 2: 120, 3: 300, 4: 800, 5: 2000 }[level] || 300;
    const floor = { 1: 0, 2: 30, 3: 80, 4: 200, 5: 500 }[level] || 0;
    return (q) => {
      const ns = numbersIn(q.prompt).map(Math.abs);
      const big = ns.length ? Math.max(...ns) : 0;
      return big <= cap && big >= floor;
    };
  }
  if (kind === "decmag") {
    const cap = { 1: 10, 2: 30, 3: 100, 4: 500, 5: 1000 }[level] || 100;
    return (q) => {
      const ns = numbersIn(q.prompt).map(Math.abs);
      return !ns.length || Math.max(...ns) <= cap;
    };
  }
  return null;
}

// Strip a money answer ("$24.00") to a numeric canonical + acceptable forms.
function moneyForms(answer) {
  const cleaned = String(answer).replace(/[$,]/g, "").trim();
  const num = Number(cleaned);
  const canonical = Number.isFinite(num) ? String(num) : cleaned;
  return { canonical, acceptable: uniq([canonical, cleaned, String(answer)]) };
}

// Strip a unit word ("27 students" → "27").
function unitForms(answer) {
  const m = String(answer).match(/^(-?\d+(?:\.\d+)?)/);
  const canonical = m ? m[1] : String(answer);
  return { canonical, acceptable: uniq([canonical, String(answer)]) };
}

/**
 * Phase 2K — map the previously-deferred FDP types onto the new answer modes.
 * Returns { inputMode, descriptor } or null. Prompts render as plain wording
 * (no expression split) so the symbols/lists read clearly.
 */
function mapSpecialFdp(cfg, legacy, displayPrompt, feedback) {
  const base = { topic: "fdp", text: displayPrompt, feedback };

  if (cfg.answerMode === "comparison") {
    // "Insert < or > …" — the answer is a single comparison symbol.
    const ans = String(legacy.answer).trim();
    return {
      inputMode: "simple",
      descriptor: {
        ...base, answer: ans, acceptableAnswers: uniq([ans]), inputMode: "simple",
        answerMode: "comparison", comparisonOptions: ["<", ">", "="],
      },
    };
  }

  if (cfg.answerMode === "trueFalse") {
    const ans = /true/i.test(String(legacy.answer)) ? "True" : "False";
    return {
      inputMode: "simple",
      descriptor: {
        ...base, answer: ans, acceptableAnswers: uniq([ans]), inputMode: "simple",
        answerMode: "trueFalse", options: ["True", "False"],
      },
    };
  }

  if (cfg.answerMode === "orderedList") {
    // "Order these decimals…" — answer is a comma list in exact order.
    const items = String(legacy.answer).split(",").map((s) => s.trim()).filter(Boolean);
    const canonical = items.join(", ");
    return {
      inputMode: "simple",
      descriptor: {
        ...base, answer: canonical, acceptableAnswers: uniq([canonical]), inputMode: "simple",
        answerMode: "orderedList", orderedItems: items, validationRules: { allowEquivalent: true },
      },
    };
  }

  if (cfg.answerMode === "multiPart") {
    const subs = legacy.subparts || [];
    const expectedParts = subs.map((sp) => {
      const a = fracTokensToSlash(String(sp.answer));
      const mf = moneyForms(a);
      return {
        label: sp.label,
        prompt: fracTokensToSlash(String(sp.prompt)),
        answer: a,
        acceptableAnswers: uniq([a, ...mf.acceptable]),
        mode: "simple",
      };
    });
    const combined = expectedParts.map((p) => `${p.label} ${p.answer}`).join("; ");
    return {
      inputMode: "simple",
      descriptor: {
        ...base, text: fracTokensToSlash(String(legacy.prompt)),
        answer: combined, acceptableAnswers: uniq([combined]), inputMode: "simple",
        answerMode: "multiPart", expectedParts,
        feedbackParts: subs.map((sp) => (Array.isArray(sp.working) ? sp.working.join(" ") : "")),
      },
    };
  }

  return null;
}

/**
 * Map a legacy FDP question + skill config into a descriptor and (optionally) a
 * custom check. Returns { descriptor, check?, inputMode }.
 */
function mapFdp(cfg, legacy) {
  const rawAnswer = String(legacy.answer);
  // Some diagram questions are originally "do" tasks (shade / mark); the adapter
  // reframes them into readable answer-entry questions while showing the figure.
  const displayPrompt = cfg.reframePrompt || fracTokensToSlash(legacy.prompt);
  const feedback = fracTokensToSlash(
    Array.isArray(legacy.working) ? legacy.working.join(" ") : `Answer: ${fracTokensToSlash(rawAnswer)}`
  );

  // --- Phase 2K: previously-deferred FDP types via the new answer modes. ---
  if (cfg.answerMode) {
    const special = mapSpecialFdp(cfg, legacy, fracTokensToSlash(legacy.prompt), feedback);
    if (special) return special;
  }

  const parts = splitPrompt(displayPrompt);

  const base = {
    topic: "fdp",
    text: displayPrompt,
    promptText: parts ? parts.promptText : null,
    mathExpression: parts ? parts.mathExpression : null,
    feedback,
  };

  // Attach a diagram by mapping the legacy diagram config → our contract.
  if (legacy.diagram && legacy.diagram.config) {
    const dc = legacy.diagram.config;
    const mapper = DIAGRAM_MAP[dc.diagramType];
    if (mapper) {
      const mapped = mapper(dc, legacy);
      base.diagramType = mapped.diagramType;
      base.diagramData = mapped.diagramData;
      base.diagramRendererHint = "svg";
    }
  }

  // Special: "equivalent bars" → complete the box (numerator or fraction).
  if (cfg.equivBox) {
    const m = rawAnswer.match(FRAC_TOKEN);
    const n = m ? Number(m[1]) : 0;
    const d = m ? Number(m[2]) : 1;
    return {
      inputMode: "simple",
      descriptor: {
        ...base,
        answer: String(n),
        acceptableAnswers: uniq([String(n), `${n}/${d}`]),
        inputMode: "simple",
      },
      check: makeEquivBoxCheck(n, n, d),
    };
  }

  // Decide answer handling. "auto" resolves per the actual answer shape.
  let mode = cfg.mode;
  if (mode === "auto") {
    if (FRAC_TOKEN.test(rawAnswer)) mode = "math";
    else mode = "simple";
  }

  // Fraction (MathLive) answers.
  if (mode === "math") {
    const m = rawAnswer.match(FRAC_TOKEN);
    if (m) {
      const n = Number(m[1]);
      const d = Number(m[2]);
      // For simplest-form skills, DISPLAY the reduced fraction as the canonical
      // answer (the legacy bank sometimes leaves answers like 4/6 unreduced even
      // when it asks for simplest form).
      const disp = cfg.simplest ? reduceFraction(n, d) : { n, d };
      const canonical = `${disp.n}/${disp.d}`;
      const opts = {};
      if (cfg.simplest) opts.requireSimplest = true;
      if (cfg.reqDenom) opts.requireDenominator = d;
      return {
        inputMode: "math",
        descriptor: {
          ...base,
          answer: canonical,
          acceptableAnswers: uniq([canonical]),
          inputMode: "math",
          expressionLatex: `\\frac{${disp.n}}{${disp.d}}`,
        },
        check: makeFractionCheck(n, d, opts),
      };
    }
    // Fallback: a "math" skill whose answer wasn't a fraction → treat as simple.
    mode = "simple";
  }

  // Simple answers (decimal / percentage / money / whole / unit).
  let canonical;
  let acceptable;
  if (cfg.money) {
    ({ canonical, acceptable } = moneyForms(rawAnswer));
  } else if (cfg.stripUnit) {
    ({ canonical, acceptable } = unitForms(rawAnswer));
  } else if (/%$/.test(rawAnswer)) {
    const num = rawAnswer.replace(/%$/, "").trim();
    canonical = num;
    acceptable = uniq([num, rawAnswer]);
  } else {
    canonical = fracTokensToSlash(rawAnswer);
    acceptable = uniq([canonical]);
  }
  return {
    inputMode: "simple",
    descriptor: { ...base, answer: canonical, acceptableAnswers: acceptable, inputMode: "simple" },
  };
}

function buildNote(cfg, baseLevel, level, scaled, matched) {
  let s = `FDP type "${cfg.type}" (natural level ${baseLevel}). `;
  s += scaled
    ? `Content scaled toward level ${level}.`
    : `Difficulty affects XP/metadata; this type is type-based (legacy bank has no levels).`;
  if (!matched) s += " Could not match the target exactly — used the nearest available question.";
  return s;
}

/**
 * Generate ONE FDP question for a skill at a target level.
 */
export function generateFdp(skillId, requestedLevel = 2) {
  const cfg = FDP_SKILLS[skillId];
  if (!cfg) throw new Error(`fdpAdapter: no skill ${skillId}`);
  const level = Math.max(1, Math.min(5, Math.round(requestedLevel || 2)));
  const baseLevel = levelForType(FDP_TYPE_LEVELS, cfg.type) || 3;

  // Build the predicate (scaling + any inherent filters).
  const preds = [];
  let scaled = false;
  if (cfg.scale) {
    const p = scalePredicate(cfg.scale, level);
    if (p) { preds.push(p); scaled = true; }
  }
  if (cfg.improperOnly) preds.push((q) => isPureFracToken(String(q.answer)));
  // shaded-fractions has a degenerate "shade the bar" mode (numerator:0, answer
  // stated in the prompt); keep only "what fraction is shaded?" items.
  if (cfg.needShaded) preds.push((q) => q.diagram && q.diagram.config && q.diagram.config.numerator > 0);
  const predicate = preds.length ? (q) => preds.every((fn) => fn(q)) : null;

  const { q, matched } = pull(cfg.type, predicate);
  const mapped = mapFdp(cfg, q);

  const core = adaptToCoreQuestion(mapped.descriptor);
  if (mapped.check) core.check = mapped.check; // stricter fraction checking

  const meta = makeDifficultyMeta({
    requested: level,
    actual: level, // FDP skills honour the requested level (XP/metadata)
    skillId,
    legacyType: cfg.type,
    sourceType: "legacy-adapter",
    notes: buildNote(cfg, baseLevel, level, scaled, matched),
  });
  return { ...core, ...meta };
}
