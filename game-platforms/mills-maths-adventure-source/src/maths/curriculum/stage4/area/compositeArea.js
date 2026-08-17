import { generateCompositeArea } from "../../../adapters/areaAdapter.js";

/**
 * STAGE 4 · Area · Area of a Composite L-shape (proof-of-concept, diagram-based).
 *
 * An outer rectangle with a rectangular notch removed from one corner
 * (diagramType "compositeRectangleArea"). Area = whole − cut-out. Answer is a
 * plain number → SIMPLE input.
 */
export const compositeArea = {
  id: "compositeArea",
  name: "Area of an L-shape",
  source: "legacy-adapter",
  syllabusArea: "MA4-ARE-03",
  prerequisiteSkillIds: ["rectangleArea"],
  nextSkillIds: [],

  generate(level) {
    return generateCompositeArea(level);
  },
};

export default compositeArea;
