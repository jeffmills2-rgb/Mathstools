import { generatePythagoras, pythagorasSkillIds } from "../../../adapters/pythagorasAdapter.js";

/**
 * STAGE 4 · Pythagoras — REAL skills, powered by the legacy CHHS Pythagoras
 * question bank through the pythagoras adapter (Phase 2N).
 *
 * Not attached to any world NPC (no new story mission / gate). Selectable in the
 * Mission Builder and testable from the DevPanel — exactly like the Area topic.
 * Numeric answers use the `simple` answer mode with tolerant unit/rounding
 * checking; triad questions use a yes/no check. Right-triangle, student-diagram
 * and ramp figures are rendered via the existing DiagramRenderer.
 * See src/maths/legacy-engines/stage4-pythagoras/notes.md.
 */
const NAMES = {
  "pythagoras-squares": "Calculate Squares",
  "pythagoras-square-roots": "Calculate Square Roots",
  "pythagoras-hypotenuse": "Find the Hypotenuse",
  "pythagoras-shorter-side": "Find a Shorter Side",
  "pythagoras-decimal-sides": "Decimal Side Lengths",
  "pythagoras-triads": "Pythagorean Triads",
  "pythagoras-real-world": "Real-world Pythagoras",
  "pythagoras-multi-step": "Multi-step Pythagoras",
};

function makeSkill(id) {
  return {
    id,
    name: NAMES[id] || id,
    source: "legacy-adapter",
    syllabusArea: "MA4-PYT",
    generate: (level) => generatePythagoras(id, level),
  };
}

export const PYTHAGORAS_SKILLS_LIST = pythagorasSkillIds().map(makeSkill);
