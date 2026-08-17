import { generateTriangleArea } from "../../../adapters/areaAdapter.js";

/**
 * STAGE 4 · Area · Area of a Triangle (proof-of-concept, diagram-based).
 *
 * Right-angled triangle with base + perpendicular height shown on the diagram
 * (diagramType "triangleArea"). Answer is a plain number → SIMPLE input.
 */
export const triangleArea = {
  id: "triangleArea",
  name: "Area of a Triangle",
  source: "legacy-adapter",
  syllabusArea: "MA4-ARE-02",
  prerequisiteSkillIds: ["rectangleArea"],
  nextSkillIds: ["compositeArea"],

  generate(level) {
    return generateTriangleArea(level);
  },
};

export default triangleArea;
