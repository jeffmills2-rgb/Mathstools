import { generateFdp, fdpSkillIds } from "../../../adapters/fdpAdapter.js";

/**
 * STAGE 4 · Fractions, Decimals & Percentages — REAL skills, powered by the
 * legacy FDP question bank through the FDP adapter (Phase 2F).
 *
 * Fern uses these automatically (same topic id "fdp"). Fraction-answer skills
 * use MathLive input with simplest-form checking; decimal/percentage/money/
 * whole-number skills use simple input. One diagram type (fraction circle) is
 * ported. See src/maths/legacy-engines/stage4-fdp/notes.md.
 */
const NAMES = {
  shadedFractionCircle: "Shaded Fractions (circle)",
  shadedFractions: "Shaded Fractions (bar)",
  fractionOfGroup: "Fraction of a Group",
  placeFractionNumberLine: "Fractions on a Number Line",
  equivalentFractionVisual: "Equivalent Fractions (bars)",
  fractionMultiplyArea: "Multiply Fractions (area model)",
  proportionDoubleLine: "Percentage (double number line)",
  simplifyFractions: "Simplify Fractions",
  fractionOfQuantity: "Fraction of a Quantity",
  equivalentFractions: "Equivalent Fractions",
  percentageOf: "Percentage of a Quantity",
  roundDecimals: "Round Decimals",
  fdpConversions: "FDP Conversions",
  fractionOperations: "Operations with Fractions",
  decimalOperations: "Operations with Decimals",
  mixedImproper: "Mixed & Improper Fractions",
  percentageChange: "Percentage Change",
  discounts: "Discounts",
  gstTax: "GST (10%)",
  findOriginalValue: "Reverse Percentage",
  errorSpotFractions: "Spot the Error",
  // Phase 2K — new answer-mode skills.
  compareFractions: "Compare Fractions (< > =)",
  orderDecimals: "Order Decimals",
  trueFalseFdp: "True or False (FDP)",
  multiPartPercentage: "Multi-part Percentage",
};

function makeSkill(id) {
  return {
    id,
    name: NAMES[id] || id,
    source: "legacy-adapter",
    syllabusArea: "MA4-FRC",
    generate: (level) => generateFdp(id, level),
  };
}

export const FDP_SKILLS_LIST = fdpSkillIds().map(makeSkill);
