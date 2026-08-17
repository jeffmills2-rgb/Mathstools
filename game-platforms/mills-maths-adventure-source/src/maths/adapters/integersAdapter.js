/**
 * INTEGERS ADAPTER — wraps the REAL legacy Stage 4 Integers question bank and
 * applies the Phase 2F difficulty calibration.
 *
 * The legacy bank has NO difficulty (every item is "mixed"), so this adapter
 * deliberately shapes complexity per level using the declarative profiles in
 * src/maths/difficulty/difficultyProfiles.js — operand magnitude, sign-crossing,
 * jump count, brackets, substitution form, and temperature sign/Δ. Each adapted
 * question carries its difficulty provenance (requested vs actual + notes).
 *
 * Only this module imports the legacy integers bank. Pure: no React/DOM/stores.
 */
import { generateIntegerQuestions } from "../legacy-engines/stage4-integers/original-engine.js";
import { adaptToCoreQuestion } from "./mmtEngineAdapter.js";
import {
  asciiMinus,
  normaliseNumericAnswer,
  numbersIn,
  uniq,
} from "./legacyAdapterHelpers.js";
import { INTEGER_LEVELS } from "../difficulty/difficultyProfiles.js";
import { resolveLevel, makeDifficultyMeta } from "../difficulty/difficultyUtils.js";
import { splitPrompt } from "../promptFormat.js";

// Pull one legacy question of a type, reporting whether the predicate matched.
function pull(type, predicate, tries = 320) {
  let last = null;
  for (let i = 0; i < tries; i++) {
    const q = generateIntegerQuestions({ count: 1, allowedTypes: [type] })[0];
    if (!q) continue;
    last = q;
    if (!predicate || predicate(q)) return { q, matched: true };
  }
  return { q: last, matched: false };
}

function detectOp(prompt) {
  if (prompt.includes(" + ")) return "+";
  if (prompt.includes(" − ")) return "−";
  if (prompt.includes(" × ")) return "×";
  if (prompt.includes(" ÷ ")) return "÷";
  return null;
}

// A real GROUPING bracket contains a binary operation between two numbers,
// e.g. "(5 + −3)". A parenthesised negative like "(−12)" is NOT grouping.
function hasGroupingBracket(prompt) {
  return /\([^()]*[0-9][^()]*[-+×÷][^()]*[0-9][^()]*\)/.test(asciiMinus(prompt));
}

// ---- per-level predicates (built from the profile params) ----

function calcPredicate(params, op) {
  return (q) => {
    if (op && detectOp(q.prompt) !== op) return false;
    const nums = numbersIn(q.prompt);
    if (params.magMax && !nums.every((n) => Math.abs(n) <= params.magMax)) return false;
    if (params.sameSign && nums.some((n) => n < 0)) return false;
    if (params.crossZero && !nums.some((n) => n < 0)) return false;
    if (params.requireNeg && !nums.some((n) => n < 0)) return false;
    if (params.bothNeg && !(nums.length >= 2 && nums[0] < 0 && nums[1] < 0)) return false;
    return true;
  };
}

function orderPredicate(params) {
  return (q) => {
    const grouped = hasGroupingBracket(q.prompt);
    if (params.brackets === false && grouped) return false;
    if (params.brackets === true && !grouped) return false;
    const ans = Number(normaliseNumericAnswer(q.answer));
    if (params.ansMax && Math.abs(ans) > params.ansMax) return false;
    if (params.requireNeg && !numbersIn(q.prompt).some((n) => n < 0)) return false;
    return true;
  };
}

function subPredicate(params) {
  return (q) => {
    if (!params.forms) return true;
    const m = q.prompt.match(/evaluate (.+?)\.?$/);
    const expr = m ? m[1].trim() : "";
    return params.forms.includes(expr);
  };
}

function jumpsPredicate(params) {
  return (q) => {
    const cfg = q.diagram && q.diagram.config;
    if (!cfg) return false;
    const js = cfg.jumps || [];
    if (params.jumps && js.length !== params.jumps) return false;
    if (params.byMax && !js.every((j) => Math.abs(j.by) <= params.byMax)) return false;
    return true;
  };
}

function thermPredicate(params) {
  return (q) => {
    const cfg = q.diagram && q.diagram.config;
    if (!cfg) return false;
    const start = cfg.value;
    const end = Number(normaliseNumericAnswer(q.answer));
    const change = Math.abs(end - start);
    if (params.changeMax && change > params.changeMax) return false;
    if (params.nonNeg && (start < 0 || end < 0)) return false;
    if (params.requireNeg && !(start < 0 || end < 0)) return false;
    return true;
  };
}

const PREDICATE_BY_SKILL = {
  addingIntegers: (p, prof) => calcPredicate(p, prof.op),
  subtractingIntegers: (p, prof) => calcPredicate(p, prof.op),
  multiplyingIntegers: (p, prof) => calcPredicate(p, prof.op),
  dividingIntegers: (p, prof) => calcPredicate(p, prof.op),
  mixedIntegerOperations: (p, prof) => calcPredicate(p, prof.op),
  orderOfOperations: (p) => orderPredicate(p),
  substitution: (p) => subPredicate(p),
  numberLineJumps: (p) => jumpsPredicate(p),
  thermometer: (p) => thermPredicate(p),
};

// ---- descriptors (legacy question → core descriptor) ----

function numericDescriptor(legacy) {
  const canonical = normaliseNumericAnswer(legacy.answer);
  // Split "Calculate: …", "… evaluate ab", etc. so the expression renders on
  // its own non-breaking line.
  const parts = splitPrompt(legacy.prompt);
  return {
    topic: "integers",
    text: legacy.prompt,
    promptText: parts ? parts.promptText : null,
    mathExpression: parts ? parts.mathExpression : null,
    answer: canonical,
    acceptableAnswers: uniq([canonical, asciiMinus(legacy.answer), legacy.answer]),
    feedback: Array.isArray(legacy.working) ? legacy.working.join(" ") : "",
    inputMode: "simple",
  };
}

function numberLineDescriptor(legacy) {
  const cfg = legacy.diagram.config;
  const canonical = normaliseNumericAnswer(legacy.answer);
  return {
    ...numericDescriptor(legacy),
    diagramType: "integerNumberLine",
    diagramData: {
      min: cfg.min, max: cfg.max, step: cfg.step,
      start: cfg.start, jumps: cfg.jumps, labels: cfg.labels,
    },
    diagramRendererHint: "svg",
  };
}

function thermometerDescriptor(legacy) {
  const cfg = legacy.diagram.config;
  const canonical = normaliseNumericAnswer(legacy.answer);
  return {
    topic: "integers",
    text: legacy.prompt,
    answer: canonical,
    acceptableAnswers: uniq([canonical, `${canonical}°C`, asciiMinus(legacy.answer)]),
    feedback: legacy.working.join(" "),
    inputMode: "simple",
    diagramType: "thermometer",
    diagramData: {
      min: cfg.min, max: cfg.max, step: cfg.step, value: cfg.value, unit: cfg.unit,
    },
    diagramRendererHint: "svg",
  };
}

const DESCRIPTOR_BY_SKILL = {
  numberLineJumps: numberLineDescriptor,
  thermometer: thermometerDescriptor,
  // everything else is numeric
};

// Human-readable difficulty note (the "mapped by ..." reason).
function buildNote(params, matched) {
  const bits = [];
  if (params.magMax) bits.push(`|operands| ≤ ${params.magMax}`);
  if (params.sameSign) bits.push("same sign (no zero-crossing)");
  if (params.crossZero) bits.push("crosses zero");
  if (params.requireNeg) bits.push("includes negatives");
  if (params.bothNeg) bits.push("both negative");
  if (params.jumps) bits.push(`${params.jumps} jump${params.jumps > 1 ? "s" : ""}`);
  if (params.byMax) bits.push(`|jump| ≤ ${params.byMax}`);
  if (params.brackets === true) bits.push("with grouping brackets");
  if (params.brackets === false) bits.push("no grouping brackets");
  if (params.ansMax) bits.push(`|answer| ≤ ${params.ansMax}`);
  if (params.forms) bits.push(`forms: ${params.forms.join(", ")}`);
  if (params.changeMax) bits.push(`Δ ≤ ${params.changeMax}°`);
  if (params.nonNeg) bits.push("temperatures ≥ 0");
  let s = `Legacy bank does not separate this skill by difficulty; mapped by ${bits.join(", ") || "type only"}.`;
  if (!matched) s += " Could not match the target exactly — used the nearest available question.";
  return s;
}

/**
 * Core generator: produce ONE integer question for a skill at a target level,
 * shaped by the difficulty profile and carrying difficulty provenance.
 */
function makeIntegerQuestion(skillId, requestedLevel) {
  const prof = INTEGER_LEVELS[skillId];
  if (!prof) throw new Error(`integersAdapter: no profile for ${skillId}`);

  const { level: actual } = resolveLevel(requestedLevel, prof.supported);
  const params = prof.params[actual] || {};
  const predicate = PREDICATE_BY_SKILL[skillId](params, prof);
  const { q, matched } = pull(prof.legacyType, predicate);

  const descriptor = (DESCRIPTOR_BY_SKILL[skillId] || numericDescriptor)(q);
  const core = adaptToCoreQuestion(descriptor);
  const meta = makeDifficultyMeta({
    requested: requestedLevel,
    actual,
    skillId,
    legacyType: prof.legacyType,
    sourceType: "legacy-adapter",
    notes: buildNote(params, matched),
  });
  return { ...core, ...meta };
}

// Exported skill generators (names unchanged from Slice 1).
export const generateAddingIntegers = (l) => makeIntegerQuestion("addingIntegers", l);
export const generateSubtractingIntegers = (l) => makeIntegerQuestion("subtractingIntegers", l);
export const generateMultiplyingIntegers = (l) => makeIntegerQuestion("multiplyingIntegers", l);
export const generateDividingIntegers = (l) => makeIntegerQuestion("dividingIntegers", l);
export const generateMixedIntegerOperations = (l) => makeIntegerQuestion("mixedIntegerOperations", l);
export const generateOrderOfOperations = (l) => makeIntegerQuestion("orderOfOperations", l);
export const generateSubstitution = (l) => makeIntegerQuestion("substitution", l);
export const generateNumberLineJumps = (l) => makeIntegerQuestion("numberLineJumps", l);
export const generateThermometer = (l) => makeIntegerQuestion("thermometer", l);
