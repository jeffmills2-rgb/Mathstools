import { generateRectangleArea } from "../../../adapters/areaAdapter.js";

/**
 * STAGE 4 · Area · Area of a Rectangle (proof-of-concept, diagram-based).
 *
 * The maths comes from the LEGACY area engine via the area adapter, which also
 * attaches diagramType "rectangleArea" + diagramData {width,height,unit}. The
 * answer is a plain number → SIMPLE input. The skill itself is a thin wrapper,
 * exactly like the other curriculum skills.
 */
export const rectangleArea = {
  id: "rectangleArea",
  name: "Area of a Rectangle",
  source: "legacy-adapter",
  syllabusArea: "MA4-ARE-01",
  prerequisiteSkillIds: [],
  nextSkillIds: ["triangleArea"],

  generate(level) {
    return generateRectangleArea(level);
  },
};

export default rectangleArea;
