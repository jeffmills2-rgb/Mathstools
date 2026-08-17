/**
 * AREA ADAPTER — maps the legacy stage4-area engine onto the current question
 * shape, attaching the diagram metadata the renderer needs.
 *
 * This is the ONLY module that imports the legacy area engine. It exposes three
 * generate(level) functions (rectangle / triangle / composite), each returning a
 * core question with:
 *   - inputMode "simple" (the area is a plain number),
 *   - acceptableAnswers keyed on that number,
 *   - feedback taken from the legacy "workings",
 *   - diagramType + diagramData so <DiagramRenderer> can draw the figure,
 *   - diagramRendererHint "svg".
 *
 * The diagramType strings used here MUST match the renderer's supported list
 * (src/ui/diagrams/diagramTypes.js). We use string literals (not an import) so
 * the maths layer stays free of any UI dependency; a system check verifies the
 * strings line up.
 *
 * Pure: imports only other maths modules. No React, no stores, no DOM.
 */
import {
  generateRectangle,
  generateTriangle,
  generateComposite,
} from "../legacy-engines/stage4-area/original-area-engine.js";
import { createAdaptedGenerator } from "./mmtEngineAdapter.js";
import { numericAnswerForms, withUnitHint } from "./legacyAdapterHelpers.js";

// Shared base mapping for any area question (numeric answer + feedback).
function baseAreaDescriptor(legacy) {
  return {
    topic: "area",
    answer: legacy.answer,
    acceptableAnswers: numericAnswerForms(legacy.answer, legacy.unit),
    feedback: legacy.workings,
    inputMode: "simple",
    diagramRendererHint: "svg",
  };
}

// --- Per-shape mappers: legacy output -> descriptor (incl. diagramData) ---

function mapRectangle(legacy) {
  return {
    ...baseAreaDescriptor(legacy),
    text: withUnitHint(legacy.prompt, legacy.unit),
    diagramType: "rectangleArea",
    diagramData: {
      width: legacy.width,
      height: legacy.height,
      unit: legacy.unit,
    },
  };
}

function mapTriangle(legacy) {
  return {
    ...baseAreaDescriptor(legacy),
    text: withUnitHint(legacy.prompt, legacy.unit),
    diagramType: "triangleArea",
    diagramData: {
      base: legacy.base,
      height: legacy.height,
      unit: legacy.unit,
    },
  };
}

function mapComposite(legacy) {
  return {
    ...baseAreaDescriptor(legacy),
    text: withUnitHint(legacy.prompt, legacy.unit),
    diagramType: "compositeRectangleArea",
    diagramData: {
      W: legacy.W,
      H: legacy.H,
      notchW: legacy.notchW,
      notchH: legacy.notchH,
      unit: legacy.unit,
    },
  };
}

// Skill-ready generators (level -> core question with diagram fields).
export const generateRectangleArea = createAdaptedGenerator(generateRectangle, mapRectangle);
export const generateTriangleArea = createAdaptedGenerator(generateTriangle, mapTriangle);
export const generateCompositeArea = createAdaptedGenerator(generateComposite, mapComposite);
