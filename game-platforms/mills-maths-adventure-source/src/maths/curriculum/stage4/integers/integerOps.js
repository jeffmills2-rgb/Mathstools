import { integers } from "../../../integers.js";

/**
 * STAGE 4 · Integers · Integer Operations (sample skill).
 *
 * THIS IS THE PATTERN FOR ADAPTING AN EXISTING MILLS MATHS TOOLS ENGINE:
 * the skill simply delegates to the existing `integers` engine and returns its
 * core question unchanged. The registry then layers on the curriculum metadata
 * (stage, topic, skill, difficulty, XP). To make a legacy engine difficulty-
 * aware, pass `level` through to it once it supports a difficulty argument.
 *
 * Answers here are plain integers, so this uses simple typed input.
 */
export const integerOps = {
  id: "integerOps",
  name: "Integer Operations",
  syllabusArea: "MA4-INT-01",
  prerequisiteSkillIds: ["wholeNumberOps"],
  nextSkillIds: ["linearEquations"],

  generate(level) {
    // The existing engine ignores `level` for now; difficulty is still recorded
    // by the registry and used for XP + adaptive selection.
    void level;
    return integers.generate();
  },
};

export default integerOps;
