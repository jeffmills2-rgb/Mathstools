import { algebra } from "../../../algebra.js";

/**
 * STAGE 4 · Algebra · Linear Equations (sample skill).
 *
 * Adapts the existing `algebra` engine (one-step equations, expression
 * evaluation). Answers are single values such as x = 9 → SIMPLE input.
 */
export const linearEquations = {
  id: "linearEquations",
  name: "Linear Equations",
  syllabusArea: "MA4-ALG-01",
  prerequisiteSkillIds: ["integerOps"],
  nextSkillIds: ["indexLaws"],

  generate(level) {
    void level; // legacy engine ignores level for now
    return algebra.generate();
  },
};

export default linearEquations;
