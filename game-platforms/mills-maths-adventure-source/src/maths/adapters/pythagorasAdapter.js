/**
 * PYTHAGORAS ADAPTER (Phase 2N) — wraps the REAL legacy Stage 4 Pythagoras
 * question bank into the current core question shape, with diagram mapping,
 * difficulty provenance, and tolerant unit/rounding answer checking.
 *
 * Only this module imports the legacy Pythagoras bank. Pure: no React/DOM/stores.
 *
 * Answer handling: most Pythagoras answers are NUMERIC with optional units
 * ("5 cm", "12.7 m") — we use the existing `simple` answer mode but install a
 * custom tolerant check that:
 *   - strips a leading "x =" and any unit word (cm, m, mm, km),
 *   - accepts the rounded answer the prompt asks for (nearest whole / 1 dp),
 *   - accepts the precise value within a small tolerance,
 *   - never fails a student just for omitting (or adding) units.
 * Triad "right-angled triangle?" questions use a yes/no check (yes/y/true vs
 * no/n/false). The legacy multiple-choice triad variant is filtered out in
 * favour of the justify-yes/no variant, which fits the existing answer modes.
 *
 * Difficulty is type-based (see PYTHAGORAS_TYPE_LEVELS); each skill honours the
 * requested level for XP/metadata (requested == actual), recorded in a note.
 */
import { generatePythagorasQuestions } from "../legacy-engines/stage4-pythagoras/original-engine.js";
import { adaptToCoreQuestion } from "./mmtEngineAdapter.js";
import { PYTHAGORAS_TYPE_LEVELS, levelForType } from "../difficulty/difficultyProfiles.js";
import { makeDifficultyMeta } from "../difficulty/difficultyUtils.js";
import { uniq } from "./legacyAdapterHelpers.js";

// Per-skill config. `type` is the legacy bank type; `missing` narrows which side
// is unknown for unknown-side skills; `yesNo` flags the triad justify question.
const PY_SKILLS = {
  "pythagoras-squares": { type: "squares" },
  "pythagoras-square-roots": { type: "square-roots" },
  "pythagoras-hypotenuse": { type: "unknown-sides", missing: "hypotenuse" },
  "pythagoras-shorter-side": { type: "unknown-sides", missing: "shorter" },
  "pythagoras-decimal-sides": { type: "decimal-sides" },
  "pythagoras-triads": { type: "triads", yesNo: true },
  "pythagoras-real-world": { type: "real-world" },
  "pythagoras-multi-step": { type: "multi-step" },
};

export function pythagorasSkillIds() {
  return Object.keys(PY_SKILLS);
}

// ---- answer parsing / checking -------------------------------------------

// Extract the first signed number from a typed answer, ignoring "x =", units,
// spacing and capitalisation. Returns a Number or null.
function parseNum(s) {
  const cleaned = String(s).replace(/−/g, "-").replace(/^\s*[a-z]\s*=\s*/i, "");
  const m = cleaned.match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : null;
}

// Build a tolerant numeric check. `dp` = decimal places the prompt requested.
function makeNumCheck(expected, rawValue, dp) {
  return function check(input) {
    const s = parseNum(input);
    if (s === null || expected === null) return false;
    if (Math.abs(s - expected) < 0.06) return true; // matches the rounded answer
    if (Number(s.toFixed(dp)) === Number(expected.toFixed(dp))) return true; // same rounding
    if (rawValue != null && Math.abs(s - rawValue) < 0.15) return true; // precise value
    return false;
  };
}

// ---- legacy diagram config → our React diagram contract -------------------
//
// NOTE (Phase 2N patch): the legacy bank attaches a `student-diagram-space`
// ("Draw a diagram") box to most worded problems. That box is meaningless in
// the 3D game modal (students can't draw in it), so it is NEVER rendered here.
// Instead, worded problems are mapped to a CONTEXTUAL figure where one makes
// sense (ladder / rectangle / ramp), or NO diagram at all.
const DIAGRAM_MAP = {
  "right-triangle": (dc) => ({
    diagramType: "pythagorasTriangle",
    diagramData: { a: dc.a, b: dc.b, c: dc.c, labels: dc.labels, units: dc.units },
  }),
  ramp: (dc) => ({
    diagramType: "pythagorasRamp",
    diagramData: { heightLabel: dc.heightLabel, baseLabel: dc.baseLabel, rampLabel: dc.rampLabel || "x" },
  }),
};

/**
 * Build a CONTEXTUAL diagram for a real-world question (which the legacy bank
 * tagged with a "student-diagram-space" box). Reads the scenario from the
 * question's tags and the two given lengths from its prompt. Returns a
 * { diagramType, diagramData } or null (omit the diagram) — never a draw box.
 */
function realWorldDiagram(legacy) {
  const tags = legacy.tags || [];
  const prompt = String(legacy.prompt);
  const nums = (prompt.match(/\d+(?:\.\d+)?/g) || []).map(Number);
  const unit = (prompt.match(/\b(cm|mm|km|m)\b/) || [])[1] || "m";
  const U = (n) => (n == null ? "" : `${n} ${unit}`);

  if (tags.includes("ladder")) {
    // "How long is the ladder?" → legs known, ladder (hyp) = x.
    if (/how long is the ladder/i.test(prompt)) {
      const [up, base] = nums;
      return { diagramType: "pythagorasLadder", diagramData: { heightLabel: U(up), baseLabel: U(base), ladderLabel: "x" } };
    }
    // "How far up the wall…" → ladder (hyp) known, height up the wall = x.
    const [ladder, base] = nums;
    return { diagramType: "pythagorasLadder", diagramData: { heightLabel: "x", baseLabel: U(base), ladderLabel: U(ladder) } };
  }

  if (tags.includes("square")) {
    const [s] = nums;
    return { diagramType: "pythagorasRectangle", diagramData: { widthLabel: U(s), heightLabel: U(s), diagonalLabel: "x" } };
  }
  if (tags.includes("rectangle") || tags.includes("screen") || tags.includes("paper")) {
    const [w, h] = nums;
    return { diagramType: "pythagorasRectangle", diagramData: { widthLabel: U(w), heightLabel: U(h), diagonalLabel: "x" } };
  }

  if (tags.includes("ramp") || tags.includes("driveway")) {
    const [rise, run] = nums;
    return { diagramType: "pythagorasRamp", diagramData: { heightLabel: U(rise), baseLabel: U(run), rampLabel: "x" } };
  }

  // distance / brace / guy-wire / multi-step → no sensible quick figure: omit.
  return null;
}

// Which triangle side is the unknown "x" (reads the legacy labels)?
function missingSideOf(labels = {}) {
  if (labels.c === "x") return "c";
  if (labels.a === "x") return "a";
  if (labels.b === "x") return "b";
  return null;
}

function pull(type, predicate, tries = 80) {
  let last = null;
  for (let i = 0; i < tries; i++) {
    let q;
    try { q = generatePythagorasQuestions({ count: 1, allowedTypes: [type] })[0]; }
    catch { continue; }
    if (!q) continue;
    last = q;
    if (!predicate || predicate(q)) return { q, matched: true };
  }
  return { q: last, matched: false };
}

function mapPy(cfg, legacy) {
  const promptRaw = String(legacy.prompt);
  const feedback = Array.isArray(legacy.working) ? legacy.working.join("  ") : "";
  const answerStr = String(legacy.answer);

  // ---- Triad "right-angled triangle?" → Yes/No CHOICE (trueFalse mode) ----
  // No numeric input, no "Justify your answer" wording, no diagram. The worked
  // justification is kept as feedback (shown after the student answers).
  if (cfg.yesNo) {
    const sides = (promptRaw.match(/\d+(?:\.\d+)?/g) || []).slice(0, 3);
    const text = sides.length === 3
      ? `Do the side lengths ${sides[0]}, ${sides[1]} and ${sides[2]} form a right-angled triangle?`
      : promptRaw.replace(/\s*Justify your answer\.?\s*$/i, "");
    const ans = /^y/i.test(answerStr) ? "Yes" : "No";
    return {
      descriptor: {
        topic: "pythagoras", text, feedback, inputMode: "simple",
        answer: ans, acceptableAnswers: uniq([ans]),
        answerMode: "trueFalse", options: ["Yes", "No"],
      },
    };
  }

  const base = { topic: "pythagoras", text: promptRaw, feedback, inputMode: "simple" };

  // ---- Diagram: contextual figures only (never the blank draw box) ----
  const dc = legacy.diagram && legacy.diagram.config;
  let diag = null;
  if (dc) {
    if (dc.diagramType === "right-triangle") diag = DIAGRAM_MAP["right-triangle"](dc);
    else if (dc.diagramType === "ramp") diag = DIAGRAM_MAP.ramp(dc);
    else if (dc.diagramType === "student-diagram-space") diag = realWorldDiagram(legacy);
  }
  if (diag) {
    base.diagramType = diag.diagramType;
    base.diagramData = diag.diagramData;
    base.diagramRendererHint = "svg";
  }

  // ---- Numeric (squares / roots / sides / real-world / multi-step) ----
  const expected = parseNum(answerStr);
  const dp = /\.\d/.test(answerStr) ? 1 : 0;

  // For right-triangle questions we know the precise unknown side from config.
  let rawValue = expected;
  if (dc && dc.diagramType === "right-triangle" && dc.labels) {
    const side = missingSideOf(dc.labels);
    if (side && dc[side] != null) rawValue = Number(dc[side]);
  }

  const units = (dc && dc.units) || (answerStr.match(/[a-zA-Z]+$/) || [""])[0];
  const bare = expected != null ? String(expected) : answerStr;
  const acceptable = uniq([answerStr, bare, units ? `${bare} ${units}` : bare]);

  return {
    descriptor: { ...base, answer: answerStr, acceptableAnswers: acceptable },
    check: makeNumCheck(expected, rawValue, dp),
  };
}

function buildNote(cfg, baseLevel, matched) {
  let s = `Pythagoras type "${cfg.type}" (natural level ${baseLevel}). Difficulty affects XP/metadata (legacy bank is type-based, no levels).`;
  if (!matched) s += " Could not match the target exactly — used the nearest available question.";
  return s;
}

/** Generate ONE Pythagoras question for a skill at a target level. */
export function generatePythagoras(skillId, requestedLevel = 2) {
  const cfg = PY_SKILLS[skillId];
  if (!cfg) throw new Error(`pythagorasAdapter: no skill ${skillId}`);
  const level = Math.max(1, Math.min(5, Math.round(requestedLevel || 2)));
  const baseLevel = levelForType(PYTHAGORAS_TYPE_LEVELS, cfg.type) || 3;

  // Build a predicate for skills that need a specific unknown side / variant.
  let predicate = null;
  if (cfg.missing === "hypotenuse") predicate = (q) => q.diagram?.config?.labels?.c === "x";
  else if (cfg.missing === "shorter") predicate = (q) => {
    const l = q.diagram?.config?.labels || {};
    return l.a === "x" || l.b === "x";
  };
  else if (cfg.yesNo) predicate = (q) => q.kind !== "multiple-choice" && !q.choices;

  const { q, matched } = pull(cfg.type, predicate);
  const mapped = mapPy(cfg, q);

  const core = adaptToCoreQuestion(mapped.descriptor);
  if (mapped.check) core.check = mapped.check;

  const meta = makeDifficultyMeta({
    requested: level,
    actual: level, // Pythagoras skills honour the requested level (XP/metadata)
    skillId,
    legacyType: cfg.type,
    sourceType: "legacy-adapter",
    notes: buildNote(cfg, baseLevel, matched),
  });
  return { ...core, ...meta };
}
