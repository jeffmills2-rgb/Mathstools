import {
  generateAddingIntegers,
  generateSubtractingIntegers,
  generateMultiplyingIntegers,
  generateDividingIntegers,
  generateMixedIntegerOperations,
  generateOrderOfOperations,
  generateSubstitution,
  generateNumberLineJumps,
  generateThermometer,
} from "../../../adapters/integersAdapter.js";

/**
 * STAGE 4 · Integers — REAL skills, powered by the legacy Integers question
 * bank through the integers adapter (Phase 2F).
 *
 * Each skill is a thin wrapper whose generate(level) calls the adapter. The
 * adapter pulls a real legacy question and converts it to the core shape; the
 * curriculum registry then decorates it with stage/topic/skill/difficulty/XP.
 *
 * Two skills carry diagrams (number-line jumps, thermometer); the rest are
 * simple numeric input. See src/maths/legacy-engines/stage4-integers/notes.md.
 */
const SYL = "MA4-INT-01";

export const addingIntegers = {
  id: "addingIntegers",
  name: "Adding Integers",
  syllabusArea: SYL,
  prerequisiteSkillIds: [],
  nextSkillIds: ["subtractingIntegers"],
  generate: (level) => generateAddingIntegers(level),
};

export const subtractingIntegers = {
  id: "subtractingIntegers",
  name: "Subtracting Integers",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["addingIntegers"],
  nextSkillIds: ["multiplyingIntegers"],
  generate: (level) => generateSubtractingIntegers(level),
};

export const multiplyingIntegers = {
  id: "multiplyingIntegers",
  name: "Multiplying Integers",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["addingIntegers"],
  nextSkillIds: ["dividingIntegers"],
  generate: (level) => generateMultiplyingIntegers(level),
};

export const dividingIntegers = {
  id: "dividingIntegers",
  name: "Dividing Integers",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["multiplyingIntegers"],
  nextSkillIds: ["mixedIntegerOperations"],
  generate: (level) => generateDividingIntegers(level),
};

export const mixedIntegerOperations = {
  id: "mixedIntegerOperations",
  name: "Mixed Integer Operations",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["addingIntegers", "subtractingIntegers"],
  nextSkillIds: ["orderOfOperations"],
  generate: (level) => generateMixedIntegerOperations(level),
};

export const orderOfOperations = {
  id: "orderOfOperations",
  name: "Order of Operations",
  syllabusArea: "MA4-INT-02",
  prerequisiteSkillIds: ["mixedIntegerOperations"],
  nextSkillIds: [],
  generate: (level) => generateOrderOfOperations(level),
};

export const substitution = {
  id: "substitution",
  name: "Substitution with Negatives",
  syllabusArea: "MA4-INT-03",
  prerequisiteSkillIds: ["mixedIntegerOperations"],
  nextSkillIds: [],
  generate: (level) => generateSubstitution(level),
};

export const numberLineJumps = {
  id: "numberLineJumps",
  name: "Number Line Jumps",
  syllabusArea: "MA4-INT-01",
  prerequisiteSkillIds: [],
  nextSkillIds: ["addingIntegers"],
  generate: (level) => generateNumberLineJumps(level),
};

export const thermometer = {
  id: "thermometer",
  name: "Temperature (Thermometer)",
  syllabusArea: "MA4-INT-04",
  prerequisiteSkillIds: [],
  nextSkillIds: [],
  generate: (level) => generateThermometer(level),
};

// The full ordered skill list for the Integers topic.
export const INTEGER_SKILLS = [
  numberLineJumps,
  addingIntegers,
  subtractingIntegers,
  multiplyingIntegers,
  dividingIntegers,
  mixedIntegerOperations,
  orderOfOperations,
  substitution,
  thermometer,
];

// Tag every integer skill as backed by a legacy-engine adapter (used by the
// DevPanel "Real Engine Testing" source indicator).
INTEGER_SKILLS.forEach((s) => {
  s.source = "legacy-adapter";
});
