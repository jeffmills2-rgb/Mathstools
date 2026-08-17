/**
 * ALGEBRAIC TECHNIQUES ADAPTER — wraps the REAL legacy Stage 4 Algebraic
 * Techniques question bank into the current core question shape with Phase 2F
 * difficulty provenance, prompt splitting, and diagram mapping.
 *
 * Only this module imports the legacy algebra bank. Pure: no React/DOM/stores.
 *
 * Input modes:
 *   - MathLive ("math") for ALGEBRAIC EXPRESSION answers (simplify, expand,
 *     factorise, terms…), checked with a commutativity-aware normaliser.
 *   - simple for NUMERIC answers (substitution, numeric function machines).
 *
 * Difficulty is type-based (see ALGEBRA_TYPE_LEVELS); each skill honours the
 * requested level for XP/metadata (requested == actual) and records a note.
 */
import { generateAlgebraicTechniquesQuestions }
  from "../legacy-engines/stage4-algebraic-techniques/original-engine.js";
import { adaptToCoreQuestion } from "./mmtEngineAdapter.js";
import { splitPrompt } from "../promptFormat.js";
import { ALGEBRA_TYPE_LEVELS, levelForType } from "../difficulty/difficultyProfiles.js";
import { makeDifficultyMeta } from "../difficulty/difficultyUtils.js";
import { uniq, asciiMinus, makeAlgebraCheck } from "./legacyAdapterHelpers.js";

// Skill config. mode: "math" | "simple" | "auto" (decide per answer).
const ALG_SKILLS = {
  introNotation:        { type: "intro-notation", mode: "auto" },
  simplifySimple:       { type: "simplify-simple", mode: "math" },
  simplifyMixed:        { type: "simplify-mixed", mode: "math" },
  multiplyTerms:        { type: "multiply-terms", mode: "math" },
  translateWords:       { type: "translate-rich", mode: "math" },
  subTwo:               { type: "sub-two", mode: "simple" },
  subTwoVars:           { type: "sub-two-vars", mode: "simple" },
  factorise:            { type: "factorise", mode: "math" },
  expandSimplify:       { type: "expand-simplify", mode: "math" },
  expandNegativeBracket:{ type: "expand-negative-bracket", mode: "math" },
  algebraicFractions:   { type: "algebraic-fractions", mode: "math" },
  wordedExpression:     { type: "worded-expression", mode: "math" },
  useExpressionSolve:   { type: "use-expression-solve", mode: "simple", stripLet: true },
  errorSpotAlgebra:     { type: "error-spot-algebra", mode: "auto" },
  // diagram-heavy
  likeTermsTiles:       { type: "like-terms-tiles", mode: "math" },
  expandArea:           { type: "expand-area-model", mode: "math" },
  perimeterExpression:  { type: "perimeter-expression", mode: "math" },
  functionMachine:      { type: "function-machine", mode: "auto" },
  // --- Phase 2K: previously-deferred types via the new answer modes ---
  patternTable:         { type: "pattern-table", answerMode: "tableInput" },
  trueFalseEquivalent:  { type: "true-false-equivalent", answerMode: "trueFalse" },
  multiPartAlgebra:     { type: "multi-part-algebra", answerMode: "multiPart" },
};

export function algebraSkillIds() {
  return Object.keys(ALG_SKILLS);
}

const isNumeric = (s) => /^-?\d+(?:\.\d+)?$/.test(asciiMinus(String(s)).trim());

// Map a legacy algebra diagram config → our { diagramType, diagramData }.
const DIAGRAM_MAP = {
  "algebra-tiles": (dc) => ({
    diagramType: "algebraTiles",
    diagramData: { variable: dc.variable, x: dc.x, ones: dc.ones },
  }),
  "expand-area-model": (dc) => ({
    diagramType: "expandAreaModel",
    diagramData: { multiplier: dc.multiplier, parts: dc.parts },
  }),
  "perimeter-figure": (dc) => ({
    diagramType: "perimeterFigure",
    diagramData: dc.shape === "triangle"
      ? { shape: "triangle", sides: dc.sides }
      : { shape: "rectangle", width: dc.width, length: dc.length },
  }),
  "function-machine": (dc) => ({
    diagramType: "functionMachine",
    diagramData: {
      input: dc.input,
      operations: (dc.operations || []).map((o) => o.text),
      output: dc.output,
    },
  }),
};

function pull(type, predicate, tries = 60) {
  let last = null;
  for (let i = 0; i < tries; i++) {
    let q;
    try { q = generateAlgebraicTechniquesQuestions({ count: 1, allowedTypes: [type] })[0]; }
    catch { continue; }
    if (!q) continue;
    last = q;
    if (!predicate || predicate(q)) return { q, matched: true };
  }
  return { q: last, matched: false };
}

/**
 * Phase 2K — map the previously-deferred Algebra types onto the new answer
 * modes (pattern-table → tableInput, true-false-equivalent → trueFalse,
 * multi-part-algebra → multiPart). Returns { inputMode, descriptor } or null.
 */
function mapSpecialAlgebra(cfg, legacy, displayPrompt, feedback) {
  const base = { topic: "algebra", text: displayPrompt, feedback };

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

  if (cfg.answerMode === "tableInput") {
    // The legacy `table.rows` has a blank value row; those blanks are the cells
    // the student completes, filled from the comma-separated answer in order.
    const vals = String(legacy.answer).split(",").map((s) => asciiMinus(s.trim())).filter((s) => s !== "");
    let vi = 0;
    const rows = ((legacy.table && legacy.table.rows) || []).map((row) =>
      row.map((cell) => {
        if (cell === "" || cell == null) {
          const a = vals[vi++] ?? "";
          return { input: true, answer: a, acceptableAnswers: uniq([a]) };
        }
        return String(cell);
      })
    );
    const canonical = vals.join(", ");
    return {
      inputMode: "simple",
      descriptor: {
        ...base, answer: canonical, acceptableAnswers: uniq([canonical]), inputMode: "simple",
        answerMode: "tableInput", tableConfig: { caption: "Complete the table", headerRow: true, rows },
      },
    };
  }

  if (cfg.answerMode === "multiPart") {
    const subs = legacy.subparts || [];
    const expectedParts = subs.map((sp) => {
      const a = asciiMinus(String(sp.answer));
      const noUnit = a.replace(/\s*cm²?\s*$/i, "").trim();
      return {
        label: sp.label,
        prompt: asciiMinus(String(sp.prompt)),
        answer: a,
        acceptableAnswers: uniq([a, noUnit, a.replace(/\s+/g, "")]),
        mode: "simple",
      };
    });
    const combined = expectedParts.map((p) => `${p.label} ${p.answer}`).join("; ");
    return {
      inputMode: "simple",
      descriptor: {
        ...base, answer: combined, acceptableAnswers: uniq([combined]), inputMode: "simple",
        answerMode: "multiPart", expectedParts,
        feedbackParts: subs.map((sp) => (Array.isArray(sp.working) ? sp.working.join(" ") : "")),
      },
    };
  }

  return null;
}

function map(cfg, legacy) {
  const rawAnswer = String(legacy.answer);
  const displayPrompt = asciiMinus(legacy.prompt);
  const feedback = asciiMinus(Array.isArray(legacy.working) ? legacy.working.join(" ") : "");

  // Phase 2K — deferred types via the new answer modes (plain-text prompts).
  if (cfg.answerMode) {
    const special = mapSpecialAlgebra(cfg, legacy, displayPrompt, feedback);
    if (special) return special;
  }

  const parts = splitPrompt(displayPrompt);

  const base = {
    topic: "algebra",
    text: displayPrompt,
    promptText: parts ? parts.promptText : null,
    mathExpression: parts ? parts.mathExpression : null,
    feedback,
  };

  // Diagram (data lives only in the diagram for tiles / perimeter / machine).
  if (legacy.diagram && legacy.diagram.config) {
    const mapper = DIAGRAM_MAP[legacy.diagram.config.diagramType];
    if (mapper) {
      const mapped = mapper(legacy.diagram.config);
      base.diagramType = mapped.diagramType;
      base.diagramData = mapped.diagramData;
      base.diagramRendererHint = "svg";
    }
  }

  // Decide mode.
  let mode = cfg.mode;
  let answer = rawAnswer;
  if (cfg.stripLet) {
    // "n = 9" → "9", keeping the "n = 9" form acceptable.
    const m = rawAnswer.match(/=\s*(-?\d+(?:\.\d+)?)/);
    if (m) {
      const num = asciiMinus(m[1]);
      return {
        inputMode: "simple",
        descriptor: { ...base, answer: num, acceptableAnswers: uniq([num, asciiMinus(rawAnswer), rawAnswer.replace(/\s/g, "")]), inputMode: "simple" },
      };
    }
  }
  if (mode === "auto") mode = isNumeric(answer) ? "simple" : "math";

  if (mode === "simple") {
    const num = asciiMinus(answer);
    return {
      inputMode: "simple",
      descriptor: { ...base, answer: num, acceptableAnswers: uniq([num]), inputMode: "simple" },
    };
  }

  // math expression
  const canonical = asciiMinus(answer);
  return {
    inputMode: "math",
    descriptor: { ...base, answer: canonical, acceptableAnswers: uniq([canonical]), inputMode: "math" },
    check: makeAlgebraCheck(answer),
  };
}

function buildNote(cfg, baseLevel, matched) {
  let s = `Algebra type "${cfg.type}" (natural level ${baseLevel}). Difficulty affects XP/metadata (legacy bank is type-based, no levels).`;
  if (!matched) s += " Could not match exactly — used the nearest available question.";
  return s;
}

export function generateAlgebra(skillId, requestedLevel = 2) {
  const cfg = ALG_SKILLS[skillId];
  if (!cfg) throw new Error(`algebraAdapter: no skill ${skillId}`);
  const level = Math.max(1, Math.min(5, Math.round(requestedLevel || 2)));
  const baseLevel = levelForType(ALGEBRA_TYPE_LEVELS, cfg.type) || 3;

  const { q, matched } = pull(cfg.type, null);
  const mapped = map(cfg, q);

  const core = adaptToCoreQuestion(mapped.descriptor);
  if (mapped.check) core.check = mapped.check;

  const meta = makeDifficultyMeta({
    requested: level,
    actual: level,
    skillId,
    legacyType: cfg.type,
    sourceType: "legacy-adapter",
    notes: buildNote(cfg, baseLevel, matched),
  });
  return { ...core, ...meta };
}
