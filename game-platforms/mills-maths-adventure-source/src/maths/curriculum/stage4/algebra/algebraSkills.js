import { generateAlgebra, algebraSkillIds } from "../../../adapters/algebraicTechniquesAdapter.js";

/**
 * STAGE 4 · Algebraic Techniques — REAL skills, powered by the legacy Algebra
 * question bank through the algebraicTechniquesAdapter (Phase 2F, Slice 3).
 *
 * Alby uses these automatically (same topic id "algebra"). Expression-answer
 * skills use MathLive input with a commutativity-aware check; substitution and
 * numeric function-machine answers use simple input. Four diagram types are
 * ported (algebra tiles, expand area model, perimeter figure, function machine).
 * See src/maths/legacy-engines/stage4-algebraic-techniques/notes.md.
 */
const NAMES = {
  introNotation: "Algebraic Notation",
  simplifySimple: "Simplify Like Terms",
  simplifyMixed: "Simplify Mixed Like Terms",
  multiplyTerms: "Multiplying Terms",
  translateWords: "Translate Words → Expression",
  subTwo: "Substitute & Evaluate",
  subTwoVars: "Substitute (two pronumerals)",
  factorise: "Factorising",
  expandSimplify: "Expand & Simplify",
  expandNegativeBracket: "Expand (negative bracket)",
  algebraicFractions: "Algebraic Fractions",
  wordedExpression: "Write an Expression",
  useExpressionSolve: "Use an Expression to Solve",
  errorSpotAlgebra: "Spot the Error",
  likeTermsTiles: "Like Terms (algebra tiles)",
  expandArea: "Expand (area model)",
  perimeterExpression: "Perimeter Expression",
  functionMachine: "Function Machine",
  // Phase 2K — new answer-mode skills.
  patternTable: "Table of Values",
  trueFalseEquivalent: "Equivalent? True or False",
  multiPartAlgebra: "Multi-part Algebra",
};

function makeSkill(id) {
  return {
    id,
    name: NAMES[id] || id,
    source: "legacy-adapter",
    syllabusArea: "MA4-ALG",
    generate: (level) => generateAlgebra(id, level),
  };
}

export const ALGEBRA_SKILLS_LIST = algebraSkillIds().map(makeSkill);
