/**
 * SUPPORTED DIAGRAM TYPES — the single source of truth for which diagramType
 * strings the renderer knows how to draw.
 *
 * This is a PURE constants module (no React) so it can be imported by both the
 * <DiagramRenderer> component AND the system checks without dragging React into
 * the test path. When you add a new diagram component, add its type id here and
 * wire it into DiagramRenderer.jsx — the checks will then validate it.
 */
export const SUPPORTED_DIAGRAM_TYPES = [
  // Area (Phase 2E)
  "rectangleArea",
  "triangleArea",
  "compositeRectangleArea",
  // Integers (Phase 2F)
  "integerNumberLine",
  "thermometer",
  // FDP (Phase 2F)
  "fractionCircle",
  // FDP diagram infrastructure (Slice 2B)
  "fractionBar",
  "fractionSet",
  "fractionNumberLine",
  "equivalentFractionBars",
  "fractionMultiplicationArea",
  "doubleNumberLine",
  // Algebraic Techniques (Slice 3)
  "algebraTiles",
  "expandAreaModel",
  "perimeterFigure",
  "functionMachine",
  // Pythagoras (Phase 2N)
  "pythagorasTriangle",
  "studentDiagramSpace", // kept for legacy/worksheet use; not rendered in-game
  "pythagorasRamp",
  // Pythagoras contextual figures (Phase 2N patch)
  "pythagorasLadder",
  "pythagorasRectangle",
  // Ratios & Rates (Phase 3A2)
  "distanceTimeGraph",
  // Length (Phase 3B)
  "lengthPolygon",
  "compositeRectilinear",
  "circleFeatures",
  "circleMeasure",
  "sectorArc",
  "curvedComposite",
  // Indices (Phase 3E)
  "factorTree",
  // Linear relationships (Phase 3F)
  "cartesianPlane",
  "tilePattern",
  "valuesTable",
  // Angle relationships (Phase 3G)
  "angleAtVertex",
  "crossingLines",
  "parallelTransversal",
  "protractor",
  "geometryFigure",
  // Properties of geometrical figures (Phase 3H)
  "geometryShape",
  "geometryProof",
  // Data classification & visualisation (Phase 3I)
  "statAxisChart",
  "statProportionChart",
  "statPlotChart",
];

export function isSupportedDiagramType(type) {
  return SUPPORTED_DIAGRAM_TYPES.includes(type);
}
