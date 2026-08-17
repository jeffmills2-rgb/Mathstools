import {
  generateAngleQuestions,
  getAngleQuestionTypes
} from "./question-banks/angles/index.js";

import {
  generateRepresentsNumbersQuestions,
  getRepresentsNumbersQuestionTypes
} from "./question-banks/stage-3/represents-numbers/index.js";

import {
  generateAdditiveRelationsQuestions,
  getAdditiveRelationsQuestionTypes
} from "./question-banks/stage-3/additive-relations/index.js";

import {
  generateStage3FractionsQuestions,
  getStage3FractionsQuestionTypes
} from "./question-banks/stage-3/fractions/index.js";

import {
  generateStage3TwoDQuestions,
  getStage3TwoDQuestionTypes
} from "./question-banks/stage-3/two-d-space-area/index.js";

import {
  generateStage3GeometricMeasureQuestions,
  getStage3GeometricMeasureQuestionTypes
} from "./question-banks/stage-3/geometric-measure/index.js";

import {
  generateMultiplicativeRelationsQuestions,
  getMultiplicativeRelationsQuestionTypes
} from "./question-banks/stage-3/multiplicative-relations/index.js";

import {
  generateIntegerQuestions,
  getIntegerQuestionTypes
} from "./question-banks/integers/index.js";

import {
  generateEquationQuestions,
  getEquationQuestionTypes
} from "./question-banks/equations/index.js";

import {
  generatePythagorasQuestions,
  getPythagorasQuestionTypes
} from "./question-banks/pythagoras/index.js";

import {
  generateAlgebraicTechniquesQuestions,
  getAlgebraicTechniquesQuestionTypes
} from "./question-banks/algebraic-techniques/index.js";

import {
  generateFdpQuestions,
  getFdpQuestionTypes
} from "./question-banks/fdp/index.js";

import {
  generateRatiosRatesQuestions,
  getRatiosRatesQuestionTypes
} from "./question-banks/ratios-rates/index.js";

import {
  generateIndicesQuestions,
  getIndicesQuestionTypes
} from "./question-banks/indices/index.js";

import {
  generateLinearRelationshipsQuestions,
  getLinearRelationshipsQuestionTypes
} from "./question-banks/linear-relationships/index.js";

import {
  generateLengthQuestions,
  getLengthQuestionTypes
} from "./question-banks/length/index.js";

import {
  generateAreaQuestions,
  getAreaQuestionTypes
} from "./question-banks/area/index.js";

import {
  generateTrigonometryAQuestions,
  getTrigonometryAQuestionTypes
} from "./question-banks/stage-5/trigonometry-a/index.js";

import {
  generateTrigonometryBQuestions,
  getTrigonometryBQuestionTypes
} from "./question-banks/stage-5/trigonometry-b/index.js";


import {
  generateTrigonometryCQuestions,
  getTrigonometryCQuestionTypes
} from "./question-banks/stage-5/trigonometry-c/index.js";

import {
  generateFinancialMathematicsAQuestions,
  getFinancialMathematicsAQuestionTypes
} from "./question-banks/stage-5/financial-mathematics-a/index.js";

import {
  generateFinancialMathematicsBQuestions,
  getFinancialMathematicsBQuestionTypes
} from "./question-banks/stage-5/financial-mathematics-b/index.js";

import {
  generateNonLinearRelationshipsAQuestions,
  getNonLinearRelationshipsAQuestionTypes
} from "./question-banks/stage-5/non-linear-relationships-a/index.js";

import {
  generateNonLinearRelationshipsBQuestions,
  getNonLinearRelationshipsBQuestionTypes
} from "./question-banks/stage-5/non-linear-relationships-b/index.js";

import {
  generateAlgebraicTechniquesAQuestions,
  getAlgebraicTechniquesAQuestionTypes
} from "./question-banks/stage-5/algebraic-techniques-a/index.js";

import {
  generateEquationsAQuestions,
  getEquationsAQuestionTypes
} from "./question-banks/stage-5/equations-a/index.js";

import {
  generateAreaSurfaceAreaAQuestions,
  getAreaSurfaceAreaAQuestionTypes
} from "./question-banks/stage-5/area-and-surface-area-a/index.js";

import {
  generateVolumeAQuestions,
  getVolumeAQuestionTypes
} from "./question-banks/stage-5/volume-a/index.js";

import {
  generateIntroductionToNetworksQuestions,
  getIntroductionToNetworksQuestionTypes
} from "./question-banks/stage-5/introduction-to-networks/index.js";


import {
  createExam,
  renderExam
} from "./renderers/exam-renderer.js";

import {
  LANGUAGE_OPTIONS,
  getLanguageLabel
} from "./utils/translation.js";

import {
  buildBalancedMultipleChoiceQuestions
} from "./utils/multiple-choice.js";

import {
  applyAnswerSpaceRules
} from "./utils/answer-space-rules.js";

import {
  buildWorkedSolutionData
} from "./utils/worked-solution-builder.js";

import {
  renderWorkedSolutions
} from "./renderers/worked-solution-renderer.js";

import {
  ensureQuestionIds,
  getExamEditorSummary,
  moveQuestionById,
  moveQuestionRelativeToId,
  removeQuestionById,
  restoreRemovedQuestion
} from "./utils/exam-editor.js";


const controlsRoot = document.createElement("div");
controlsRoot.id = "controls";

const editorRoot = document.createElement("div");
editorRoot.id = "exam-editor-output";

const examRoot = document.createElement("div");
examRoot.id = "exam-output";

const solutionsRoot = document.createElement("div");
solutionsRoot.id = "worked-solutions-output";

const appRoot = document.getElementById("app");
appRoot.appendChild(controlsRoot);
appRoot.appendChild(editorRoot);
appRoot.appendChild(examRoot);
appRoot.appendChild(solutionsRoot);

let currentExam = null;
let editMode = false;
let lastRemovedQuestion = null;
let editorStatus = "";
let draggedQuestionId = null;
let activeModal = null;
let activeTopicId = null;
let activeTopicStage = "stage4";
/* Working copies of each stage's selection while the topic modal is open,
   keyed by stage id. Was one `let` per stage. */
const stageDraftTopics = {};
/* Per-stage status message shown in the topic modal, keyed by stage id. */
const stageStatus = {};

function setStageStatus(stageId, message) {
  stageStatus[getStage(stageId).id] = message;
}

function getStageStatus(stageId) {
  return stageStatus[getStage(stageId).id] || "";
}

function anyStageStatus() {
  return STAGES.map(stage => getStageStatus(stage.id)).find(Boolean) || "";
}
let controlsStatus = "";
let showWorkedSolutions = false;
let wizardActive = false;

const DEFAULT_TOPIC_COUNTS = {
  integers: 6,
  fractionsDecimalsPercentages: 6,
  ratiosRates: 6,
  indices: 6,
  linearRelationships: 6,
  length: 6,
  area: 6,
  angles: 4,
  equations: 6,
  pythagoras: 4,
  algebraicTechniques: 6,
  trigonometryA: 6,
  trigonometryB: 6,
  trigonometryC: 6,
  financialMathematicsA: 6,
  financialMathematicsB: 6,
  algebraicTechniquesA: 6,
  equationsA: 6,
  areaSurfaceAreaA: 6,
  volumeA: 6,
  introductionToNetworks: 6,
  nonLinearRelationshipsA: 6,
  nonLinearRelationshipsB: 6
};

const DEFAULT_SCHOOL = "[School name]";

const DEFAULT_INSTRUCTIONS = [
  "Complete all questions.",
  "Show all working in the spaces provided.",
  "Diagrams are not drawn to scale.",
  "Ask your teacher if you need help."
];

// Exam-style templates use a different default instruction set.
const EXAM_INSTRUCTIONS = [
  "Attempt all questions.",
  "Show all relevant working in the spaces provided.",
  "Diagrams are not necessarily drawn to scale.",
  "Write using black or blue pen."
];

// Ordered worksheet-first so the friendlier classroom layouts lead.
const OUTPUT_TEMPLATES = [
  {
    id: "worksheet",
    label: "Worksheet",
    icon: "✏️",
    tagline: "Exercise sheet with ruled answer spaces",
    bestFor: "Everyday classwork & homework",
    description: "Exercise-sheet layout with ruled answer spaces, school name, title, topic, name and date fields. No marks shown."
  },
  {
    id: "textbook-template",
    label: "Textbook exercises",
    icon: "📘",
    tagline: "Clean numbered question list, no answer spaces",
    bestFor: "Bookwork & quick practice",
    description: "Clean question-list layout with no answer spaces and no marks — ideal for classwork exercises or homework questions."
  },
  {
    id: "class-test",
    label: "Class test",
    icon: "📝",
    tagline: "Compact assessment with marks",
    bestFor: "Short in-class assessments",
    description: "Compact classroom assessment layout with marks shown."
  },
  {
    id: "hsc-style",
    label: "HSC-style exam",
    icon: "🎓",
    tagline: "Formal exam paper with cover & answer sheet",
    bestFor: "Formal exams & trials",
    description: "Formal exam layout with cover page, sections and multiple choice answer sheet."
  }
];

// Templates that read as exams/tests (marks shown, formal wording).
const EXAM_STYLE_TEMPLATES = new Set(["hsc-style", "class-test"]);

function getDefaultInstructionsForTemplate(template = "worksheet") {
  return EXAM_STYLE_TEMPLATES.has(String(template || ""))
    ? EXAM_INSTRUCTIONS.slice()
    : DEFAULT_INSTRUCTIONS.slice();
}

// How the answers / worked solutions are presented.
const ANSWERS_FORMAT_OPTIONS = [
  { id: "hsc", label: "HSC style (full worked solutions & marking criteria)" },
  { id: "class-test", label: "Class test style (answers with marks)" },
  { id: "textbook", label: "Textbook style (answers only, by question number)" },
  { id: "none", label: "No answers" }
];

// Default answer format for each template style.
const TEMPLATE_ANSWERS_DEFAULT = {
  "hsc-style": "hsc",
  "class-test": "class-test",
  "worksheet": "textbook",
  "textbook-template": "textbook"
};

function getDefaultAnswersFormatForTemplate(template = "worksheet") {
  return TEMPLATE_ANSWERS_DEFAULT[String(template || "")] || "textbook";
}

function renderAnswersFormatOptions(selectedValue = "textbook") {
  return ANSWERS_FORMAT_OPTIONS
    .map(option => `<option value="${escapeHtml(option.id)}" ${String(selectedValue) === option.id ? "selected" : ""}>${escapeHtml(option.label)}</option>`)
    .join("");
}

const TOPICS = {
  integers: {
    label: "Integers",
    generate: generateIntegerQuestions,
    getTypes: getIntegerQuestionTypes
  },

  fractionsDecimalsPercentages: {
    label: "Fractions, Decimals and Percentages",
    generate: generateFdpQuestions,
    getTypes: getFdpQuestionTypes
  },

  ratiosRates: {
    label: "Ratios and Rates",
    generate: generateRatiosRatesQuestions,
    getTypes: getRatiosRatesQuestionTypes
  },

  indices: {
    label: "Indices",
    generate: generateIndicesQuestions,
    getTypes: getIndicesQuestionTypes
  },

  linearRelationships: {
    label: "Cartesian Plane and Linear Relationships",
    generate: generateLinearRelationshipsQuestions,
    getTypes: getLinearRelationshipsQuestionTypes
  },

  length: {
    label: "Length",
    generate: generateLengthQuestions,
    getTypes: getLengthQuestionTypes
  },

  area: {
    label: "Area",
    generate: generateAreaQuestions,
    getTypes: getAreaQuestionTypes
  },

  angles: {
    label: "Angle Relationships",
    generate: generateAngleQuestions,
    getTypes: getAngleQuestionTypes
  },

  equations: {
    label: "Equations",
    generate: generateEquationQuestions,
    getTypes: getEquationQuestionTypes
  },

  pythagoras: {
    label: "Pythagoras Theorem",
    generate: generatePythagorasQuestions,
    getTypes: getPythagorasQuestionTypes
  },

  algebraicTechniques: {
    label: "Algebraic Techniques",
    generate: generateAlgebraicTechniquesQuestions,
    getTypes: getAlgebraicTechniquesQuestionTypes
  }
};


/*
  Stage 3 (Years 5–6). Empty until the banks land — the registry entry exists
  so the plumbing is exercised now rather than discovered later. Scope and
  syllabus mapping: docs/stage-3-syllabus-reference.md.
*/
const STAGE3_TOPICS = {
  representsNumbers: {
    label: "Represents Numbers",
    generate: generateRepresentsNumbersQuestions,
    getTypes: getRepresentsNumbersQuestionTypes
  },

  additiveRelations: {
    label: "Additive Relations",
    generate: generateAdditiveRelationsQuestions,
    getTypes: getAdditiveRelationsQuestionTypes
  },

  stage3MultiplicativeRelations: {
    label: "Multiplicative Relations",
    generate: generateMultiplicativeRelationsQuestions,
    getTypes: getMultiplicativeRelationsQuestionTypes
  },

  stage3Fractions: {
    label: "Fractions",
    generate: generateStage3FractionsQuestions,
    getTypes: getStage3FractionsQuestionTypes
  },

  stage3TwoDSpaceArea: {
    label: "2D Space and Area",
    generate: generateStage3TwoDQuestions,
    getTypes: getStage3TwoDQuestionTypes
  },

  stage3GeometricMeasure: {
    label: "Geometric Measure",
    generate: generateStage3GeometricMeasureQuestions,
    getTypes: getStage3GeometricMeasureQuestionTypes
  }
};

const STAGE5_TOPICS = {
  trigonometryA: {
    label: "Trigonometry A",
    generate: generateTrigonometryAQuestions,
    getTypes: getTrigonometryAQuestionTypes
  },

  trigonometryB: {
    label: "Trigonometry B",
    generate: generateTrigonometryBQuestions,
    getTypes: getTrigonometryBQuestionTypes
  },

  trigonometryC: {
    label: "Trigonometry C",
    generate: generateTrigonometryCQuestions,
    getTypes: getTrigonometryCQuestionTypes
  },

  financialMathematicsA: {
    label: "Financial Mathematics A",
    generate: generateFinancialMathematicsAQuestions,
    getTypes: getFinancialMathematicsAQuestionTypes
  },

  financialMathematicsB: {
    label: "Financial Mathematics B",
    generate: generateFinancialMathematicsBQuestions,
    getTypes: getFinancialMathematicsBQuestionTypes
  },

  algebraicTechniquesA: {
    label: "Algebraic Techniques A",
    generate: generateAlgebraicTechniquesAQuestions,
    getTypes: getAlgebraicTechniquesAQuestionTypes
  },

  equationsA: {
    label: "Equations A",
    generate: generateEquationsAQuestions,
    getTypes: getEquationsAQuestionTypes
  },

  areaSurfaceAreaA: {
    label: "Area and Surface Area A",
    generate: generateAreaSurfaceAreaAQuestions,
    getTypes: getAreaSurfaceAreaAQuestionTypes
  },

  volumeA: {
    label: "Volume A",
    generate: generateVolumeAQuestions,
    getTypes: getVolumeAQuestionTypes
  },

  introductionToNetworks: {
    label: "Introduction to Networks",
    generate: generateIntroductionToNetworksQuestions,
    getTypes: getIntroductionToNetworksQuestionTypes
  },

  nonLinearRelationshipsA: {
    label: "Non-Linear Relationships A",
    generate: generateNonLinearRelationshipsAQuestions,
    getTypes: getNonLinearRelationshipsAQuestionTypes
  },

  nonLinearRelationshipsB: {
    label: "Non-Linear Relationships B",
    generate: generateNonLinearRelationshipsBQuestions,
    getTypes: getNonLinearRelationshipsBQuestionTypes
  }
};

/*
  ══════════════════════════════════════════════════════════════════════
  STAGE REGISTRY
  ----------------------------------------------------------------------
  Stages used to be hardcoded in pairs: two topic maps, two draftConfig keys,
  two loops in buildExam, two headings in the picker, two counts in every
  summary. Adding a third meant finding and duplicating every one of those.

  A stage is now data. Adding one — Stage 3 here, Stage 2 or 6 later — is a
  single entry: a label, the topic map, and the draftConfig key its selections
  live under. `selectionKey` keeps the ORIGINAL key names so drafts saved by
  earlier versions still load.
  ══════════════════════════════════════════════════════════════════════
*/
const STAGES = [
  { id: "stage3", label: "Stage 3", selectionKey: "selectedStage3Topics", topics: STAGE3_TOPICS },
  { id: "stage4", label: "Stage 4", selectionKey: "selectedTopics", topics: TOPICS },
  { id: "stage5", label: "Stage 5", selectionKey: "selectedStage5Topics", topics: STAGE5_TOPICS }
];

const STAGE_BY_ID = Object.fromEntries(STAGES.map(stage => [stage.id, stage]));
const DEFAULT_STAGE_ID = "stage4";

/* Modal id for a stage's standalone topic picker: stage3 → "stage-3". */
function stageModalId(stageId) {
  return `stage-${String(getStage(stageId).id).replace("stage", "")}`;
}

function getStage(stageId = DEFAULT_STAGE_ID) {
  return STAGE_BY_ID[stageId] || STAGE_BY_ID[DEFAULT_STAGE_ID];
}

/* Selections for one stage, out of a config object. */
function selectedTopicsForStage(config, stageId) {
  return config?.[getStage(stageId).selectionKey] || {};
}

/*
  Every selected topic across every stage, in stage order. One place that knows
  how to walk the selection, so callers never enumerate stages themselves.
*/
function eachSelectedTopic(config) {
  return STAGES.flatMap(stage =>
    Object.entries(selectedTopicsForStage(config, stage.id))
      .map(([topicId, topicConfig]) => ({
        stage,
        topicId,
        topicConfig,
        topic: stage.topics[topicId]
      }))
      .filter(entry => entry.topic)
  );
}

const ALL_TOPICS = Object.assign({}, ...STAGES.map(stage => stage.topics));

const draftConfig = {
  school: "",
  examTitle: "",
  examSubtitle: "",
  timeAllowed: "",
  calculator: false,
  language: "en",
  template: "worksheet",
  answersFormat: getDefaultAnswersFormatForTemplate("worksheet"),
  multipleChoiceCount: 0,
  instructions: [],
  topicPageBreaks: false,
  // One selection bucket per stage, keyed by the stage's selectionKey.
  ...Object.fromEntries(STAGES.map(stage => [stage.selectionKey, {}]))
};


function getAllowedTypeSet(topicConfig = {}) {
  if (!Array.isArray(topicConfig.allowedTypes)) return null;
  const allowedTypes = [...new Set(topicConfig.allowedTypes.map(String).filter(Boolean))];
  return new Set(allowedTypes);
}

function isQuestionAllowedBySelectedTypes(question, allowedSet) {
  if (!allowedSet || !allowedSet.size) return true;
  return allowedSet.has(String(question?.type || ""));
}

/*
  ══════════════════════════════════════════════════════════════════════
  SPREAD REPEATED QUESTION TYPES
  ----------------------------------------------------------------------
  A bank returns questions in whatever order its generator happens to emit
  them, so asking for 30 questions from a bank with ~10 types produced runs of
  the same task: "Solve: x + 5 = 1" twenty times in a row, or the same
  double-number-line prompt four questions apart with only its numbers
  changed. Adjacent near-identical items read as a printing error, and they
  waste the interleaving effect that makes mixed practice worth setting.

  This reorders a topic's questions so the same type is never adjacent where
  that is possible. It is a pure rearrangement — no question is added, dropped
  or altered, and the relative order WITHIN a type is preserved, so any
  progression a bank builds into its own sequence survives.

  Two cases, because they need different constructions:

    • No type holds a majority (biggest <= rest + 1). Repeatedly taking the
      largest remaining group that is not the one just placed separates every
      type completely.

    • One type dominates — 16 "solve for x" among 20, say. Repeats are then
      unavoidable, and the greedy above is actively bad: it alternates until
      the minority runs out and dumps the entire remainder in one block. So
      the dominant type is split into evenly sized chunks with a minority
      question between each, which gives the shortest run that arithmetic
      allows: ceil(dominant / (others + 1)).
  ══════════════════════════════════════════════════════════════════════
*/
function spreadQuestionTypes(questions) {
  const list = Array.isArray(questions) ? questions : [];
  if (list.length < 3) return list;

  // Preserve insertion order of both the groups and their contents.
  const groups = new Map();
  for (const question of list) {
    const key = String(question?.type || "untyped");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(question);
  }

  if (groups.size < 2) return list;

  const largestType = [...groups.entries()]
    .reduce((best, entry) => (entry[1].length > best[1].length ? entry : best))[0];
  const largest = groups.get(largestType);
  const otherCount = list.length - largest.length;

  if (largest.length > otherCount + 1) {
    return spreadAroundDominantType(groups, largestType, otherCount);
  }

  const spread = [];
  let previousType = null;

  while (spread.length < list.length) {
    let chosen = null;
    let chosenSize = 0;

    for (const [type, bucket] of groups) {
      if (!bucket.length || type === previousType) continue;
      if (bucket.length > chosenSize) {
        chosen = type;
        chosenSize = bucket.length;
      }
    }

    if (!chosen) break;

    spread.push(groups.get(chosen).shift());
    previousType = chosen;
  }

  return spread;
}

/*
  Splits the dominant group into (otherCount + 1) chunks of as near-equal size
  as possible and lays one minority question between consecutive chunks. The
  minority questions are dealt largest-group-first so no two of the same
  minority type end up in neighbouring gaps.
*/
function spreadAroundDominantType(groups, dominantType, otherCount) {
  const dominant = groups.get(dominantType);
  const gaps = otherCount + 1;

  const others = [...groups.entries()]
    .filter(([type]) => type !== dominantType)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([, bucket]) => bucket);

  // Round-robin across the minority groups, biggest first.
  const fillers = [];
  while (fillers.length < otherCount) {
    let placedThisPass = false;

    for (const bucket of others) {
      if (!bucket.length) continue;
      fillers.push(bucket.shift());
      placedThisPass = true;
      if (fillers.length >= otherCount) break;
    }

    if (!placedThisPass) break;
  }

  const spread = [];
  let remainingChunks = gaps;
  let remaining = dominant.length;

  for (let chunk = 0; chunk < gaps; chunk++) {
    // Ceiling division spreads the odd items over the earliest chunks.
    const size = Math.ceil(remaining / remainingChunks);
    for (let i = 0; i < size; i++) spread.push(dominant.shift());

    remaining -= size;
    remainingChunks -= 1;

    if (fillers.length) spread.push(fillers.shift());
  }

  // Anything left over (shouldn't happen, but never drop a question).
  return spread.concat(fillers, dominant);
}

function generateTopicQuestionsStrict(topic, topicConfig = {}, topicLabel = "topic") {
  if (!topic?.generate) return [];

  const requestedCount = Math.max(0, Number(topicConfig.count || 0));
  if (requestedCount < 1) return [];

  const allowedTypes = Array.isArray(topicConfig.allowedTypes)
    ? [...new Set(topicConfig.allowedTypes.map(String).filter(Boolean))]
    : [];
  const allowedSet = getAllowedTypeSet(topicConfig);
  const questions = [];

  // Generate in small batches and filter by the selected type list. This is a
  // safety net for topic banks that internally reuse another generator. It
  // prevents unchecked subtypes, such as Angle Relationships → Equations
  // application, from appearing when they were not selected in the topic modal.
  const maxAttempts = Math.max(80, requestedCount * Math.max(1, allowedTypes.length) * 8);
  let attempts = 0;

  while (questions.length < requestedCount && attempts < maxAttempts) {
    attempts += 1;

    const remaining = requestedCount - questions.length;
    const generated = topic.generate({
      count: Math.max(1, remaining),
      allowedTypes
    });

    const batch = Array.isArray(generated) ? generated : [];

    for (const question of batch) {
      if (!isQuestionAllowedBySelectedTypes(question, allowedSet)) {
        console.warn(
          `Skipped ${topicLabel} question type "${question?.type || "unknown"}" because it was not selected.`,
          question
        );
        continue;
      }

      questions.push(question);
      if (questions.length >= requestedCount) break;
    }

    // Avoid spinning forever if a generator returns nothing.
    if (!batch.length) break;
  }

  if (questions.length < requestedCount) {
    console.warn(
      `Only generated ${questions.length} of ${requestedCount} requested questions for ${topicLabel}.`,
      { topicConfig, allowedTypes }
    );
  }

  // Order and interleave within the topic. Done per topic, so topic grouping
  // (and the topic bands the renderer draws from it) is untouched.
  return orderQuestionsForPractice(questions);
}

/*
  ══════════════════════════════════════════════════════════════════════
  DIFFICULTY RAMP
  ----------------------------------------------------------------------
  A topic's questions arrived in generator order, so a three-mark multi-part
  word problem could open the set and a one-step recall question could close
  it. A set that starts easy and builds is more usable as a lesson sequence.

  The banks carry no difficulty rating — `level` is "mixed" on every question
  in every bank, so it tells us nothing. `marks` is the one honest signal
  available: it already encodes how many steps the author expected, from
  one-mark recall up to five-mark multi-part problems.

  So questions are banded by marks ascending, and the existing type-spreading
  runs INSIDE each band. That keeps the variety that stops identical questions
  clustering, while still moving from single-step to multi-step work.
  ══════════════════════════════════════════════════════════════════════
*/
function orderQuestionsForPractice(questions) {
  const list = Array.isArray(questions) ? questions : [];
  if (list.length < 3) return list;

  const bands = new Map();

  for (const question of list) {
    const marks = Number(question?.marks);
    const band = Number.isFinite(marks) ? marks : 1;
    if (!bands.has(band)) bands.set(band, []);
    bands.get(band).push(question);
  }

  // A single band means marks tell us nothing here — spread and leave it.
  if (bands.size < 2) return spreadQuestionTypes(list);

  return [...bands.keys()]
    .sort((a, b) => a - b)
    .flatMap(band => spreadQuestionTypes(bands.get(band)));
}

function buildExam(config) {
  const questions = [];
  const requestedMultipleChoiceCount = Number(config.multipleChoiceCount || 0);

  const selectedForMultipleChoice = Object.assign(
    {},
    ...STAGES.map(stage => selectedTopicsForStage(config, stage.id))
  );

  const multipleChoiceQuestions = buildBalancedMultipleChoiceQuestions({
    topics: ALL_TOPICS,
    selectedTopics: selectedForMultipleChoice,
    count: requestedMultipleChoiceCount
  });

  questions.push(...multipleChoiceQuestions);

  for (const { stage, topicId, topicConfig, topic } of eachSelectedTopic(config)) {
    questions.push(...generateTopicQuestionsStrict(
      topic,
      topicConfig,
      `${stage.label} ${topic.label || topicId}`
    ));
  }

  const finalQuestions = ensureQuestionIds(applyAnswerSpaceRules(questions));

  currentExam = createExam({
    school: config.school || DEFAULT_SCHOOL,
    title: config.examTitle || "",
    subtitle: config.examSubtitle || buildSubtitleFromSelectedTopics(config),
    timeAllowed: config.timeAllowed || "",

    calculator: config.calculator
      ? "Calculator permitted"
      : "No calculator permitted",

    language: config.language || "en",
    template: config.template || "worksheet",
    answersFormat: config.answersFormat || getDefaultAnswersFormatForTemplate(config.template),
    topicPageBreaks: config.topicPageBreaks === true,

    sectionTitle: "Section I",
    sectionSubtitle: "Answer all questions. Show working where appropriate.",

    instructions: Array.isArray(config.instructions) ? config.instructions : [],

    questions: finalQuestions,
    multipleChoiceCount: multipleChoiceQuestions.length
  });

  editMode = false;
  lastRemovedQuestion = null;
  editorStatus = "Question set generated. Turn on Edit question set to remove or reorder questions.";
  controlsStatus = requestedMultipleChoiceCount > 0 && multipleChoiceQuestions.length < requestedMultipleChoiceCount
    ? `Question set generated successfully. ${multipleChoiceQuestions.length} of ${requestedMultipleChoiceCount} multiple-choice question${requestedMultipleChoiceCount === 1 ? "" : "s"} could be created because multiple choice now only uses 1-mark questions.`
    : "Question set generated successfully.";

  renderAll();
}

function renderCurrentExam() {
  if (!currentExam) {
    editorRoot.innerHTML = "";
    examRoot.innerHTML = "";
    solutionsRoot.innerHTML = "";
    return;
  }

  renderEditorToolbar();
  renderExam(examRoot, currentExam, { editMode });

  const answersFormat = currentExam.answersFormat || getDefaultAnswersFormatForTemplate(currentExam.template);
  const answersHidden = answersFormat === "none" || !showWorkedSolutions;

  if (answersFormat === "none") {
    solutionsRoot.innerHTML = "";
    solutionsRoot.style.display = "none";
  } else {
    const workedSolutionData = buildWorkedSolutionData(currentExam);
    renderWorkedSolutions(solutionsRoot, workedSolutionData, { format: answersFormat });
    solutionsRoot.style.display = answersHidden ? "none" : "";
  }
}

function renderAll() {
  renderControlDashboard();
  renderCurrentExam();
}

function renderControlDashboard() {
  const stageCounts = STAGES.map(stage => ({
    stage,
    topics: Object.keys(selectedTopicsForStage(draftConfig, stage.id)).length,
    questions: Object.values(selectedTopicsForStage(draftConfig, stage.id))
      .reduce((sum, topicConfig) => sum + Number(topicConfig.count || 0), 0)
  }));

  const selectedTopicCount = stageCounts.reduce((sum, entry) => sum + entry.topics, 0);
  const selectedQuestionTotal = stageCounts.reduce((sum, entry) => sum + entry.questions, 0);

  const hasExam = Boolean(currentExam);
  const mcCount = Number(draftConfig.multipleChoiceCount || 0);
  const readyToGenerate = selectedTopicCount > 0 && (selectedQuestionTotal > 0 || mcCount > 0);
  const workedToggleText = showWorkedSolutions ? "Hide solutions" : "Show solutions";

  const selectedTopicLabels = eachSelectedTopic(draftConfig)
    .map(({ stage, topic }) => `${stage.label}: ${topic.label}`);

  const paperSummary = hasExam ? getExamEditorSummary(currentExam) : null;
  const paperNeedsRegeneration = hasExam && (
    Number(paperSummary.extendedResponseCount || 0) !== Number(selectedQuestionTotal || 0) ||
    String(currentExam.template || "hsc-style") !== String(draftConfig.template || "hsc-style")
  );
  const regenerationWarning = paperNeedsRegeneration
    ? `Current setup requests ${selectedQuestionTotal} extended question${selectedQuestionTotal === 1 ? "" : "s"} and ${mcCount} multiple choice, but the displayed/exported document currently has ${paperSummary.extendedResponseCount} extended and ${paperSummary.multipleChoiceCount} multiple choice. Click Regenerate before printing.`
    : "";
  const generatedSummary = hasExam
    ? ` · generated ${paperSummary.questionCount} questions${isRevisionPackageTemplate() ? "" : ` · ${paperSummary.totalMarks} marks`}`
    : "";
  const stageSummary = stageCounts
    .filter(entry => entry.topics > 0)
    .map(entry => `${entry.topics} ${entry.stage.label}`)
    .join(" · ") || "no topics";
  const setupLine = `${getTemplateLabel(draftConfig.template)} · ${stageSummary} · ${selectedQuestionTotal} extended · ${mcCount} MC${generatedSummary}`;

  const topicDescription = selectedTopicCount
    ? selectedTopicLabels.slice(0, 3).join(", ") + (selectedTopicLabels.length > 3 ? ` + ${selectedTopicLabels.length - 3} more` : "")
    : "Select topics and question types.";

  controlsRoot.innerHTML = `
    <section class="builder-dashboard workflow-dashboard" aria-label="Topic question generator controls">
      <div class="builder-dashboard-header workflow-dashboard-header">
        <div>
          <div class="workflow-eyebrow">NSW Stage 4 &amp; 5 Mathematics</div>
          <h1>Maths Worksheet &amp; Assessment Builder</h1>
          <p>Pick a style, choose your syllabus topics, and generate worksheets, tests, revision or exams — with answers.</p>
        </div>

        <div class="builder-summary workflow-summary workflow-quick-stats" aria-label="Quick setup summary">
          <span>${escapeHtml(setupLine)}</span>
        </div>
      </div>

      ${renderTemplateGallery()}

      ${renderSetupPanel({
        hasExam,
        readyToGenerate,
        paperNeedsRegeneration,
        paperSummary,
        selectedTopicCount,
        selectedQuestionTotal,
        mcCount,
        topicDescription,
        workedToggleText
      })}

      ${renderWorkflowSummary({
        stageCounts,
        selectedQuestionTotal,
        mcCount,
        hasExam,
        paperSummary
      })}

      ${controlsStatus ? `<p class="builder-status">${escapeHtml(controlsStatus)}</p>` : ""}
      ${regenerationWarning ? `<p class="builder-status builder-status-warning">${escapeHtml(regenerationWarning)}</p>` : ""}
    </section>

    ${renderActiveModal()}
  `;
}

function renderWorkflowStep({
  number,
  title,
  description,
  status,
  state = "",
  action = "",
  buttonText = "",
  disabled = false,
  customContent = ""
}) {
  const button = action
    ? `<button type="button" class="workflow-step-button" data-control-action="${escapeHtml(action)}" ${disabled ? "disabled" : ""}>${escapeHtml(buttonText || title)}</button>`
    : "";

  return `
    <article class="workflow-step-card is-${escapeHtml(state)}">
      <div class="workflow-step-topline">
        <span class="workflow-step-number">${number}</span>
        <span class="workflow-step-state">${escapeHtml(status || "")}</span>
      </div>

      <h2>Step ${number} — ${escapeHtml(title)}</h2>
      <p>${escapeHtml(description || "")}</p>

      ${customContent || button}
    </article>
  `;
}

function renderTemplateGallery() {
  const activeTemplate = String(draftConfig.template || "worksheet");

  const cards = OUTPUT_TEMPLATES.map(template => {
    const isSelected = template.id === activeTemplate;
    return `
      <button
        type="button"
        class="template-card${isSelected ? " is-selected" : ""}"
        data-control-action="select-template"
        data-template="${escapeHtml(template.id)}"
        aria-pressed="${isSelected ? "true" : "false"}">
        <span class="template-card-icon" aria-hidden="true">${template.icon || "📄"}</span>
        <span class="template-card-body">
          <span class="template-card-label">${escapeHtml(template.label)}</span>
          <span class="template-card-tagline">${escapeHtml(template.tagline || "")}</span>
          <span class="template-card-bestfor">${escapeHtml(template.bestFor || "")}</span>
        </span>
        <span class="template-card-check" aria-hidden="true">${isSelected ? "✓" : ""}</span>
      </button>
    `;
  }).join("");

  return `
    <section class="template-gallery" aria-label="Choose a template style">
      <div class="template-gallery-heading">
        <strong>Choose a template style</strong>
        <span>This sets how your document looks. You can change it any time.</span>
      </div>
      <div class="template-card-grid">
        ${cards}
      </div>
    </section>
  `;
}

function renderSetupPanel({
  hasExam,
  readyToGenerate,
  paperNeedsRegeneration,
  paperSummary,
  selectedTopicCount,
  selectedQuestionTotal,
  mcCount,
  topicDescription,
  workedToggleText
}) {
  const styleLabel = getTemplateLabel(draftConfig.template);

  if (!hasExam) {
    return `
      <section class="setup-panel" aria-label="Get started">
        <div class="setup-panel-main">
          <strong>Ready when you are</strong>
          <p>Choose a style above, then we'll walk you through the details and topics in a few quick steps.</p>
          <p class="setup-panel-sub">${selectedTopicCount
            ? escapeHtml(topicDescription)
            : "No topics chosen yet."}</p>
        </div>
        <div class="setup-panel-actions">
          <button type="button" class="setup-start-button" data-control-action="start-wizard">
            Set up my ${escapeHtml(styleLabel)} →
          </button>
          ${readyToGenerate
            ? `<button type="button" class="setup-generate-button" data-control-action="generate-paper">Generate now</button>`
            : ""}
        </div>
      </section>
    `;
  }

  const answersFormat = (currentExam && currentExam.answersFormat) || draftConfig.answersFormat || "none";
  const hasAnswers = answersFormat !== "none";
  const solutionsOn = hasAnswers && showWorkedSolutions;

  return `
    <section class="setup-panel setup-panel-review" aria-label="Review and print">
      <div class="setup-panel-main">
        <strong>Your ${escapeHtml(styleLabel)} is ready</strong>
        <p>${paperSummary.questionCount} questions${isRevisionPackageTemplate() ? "" : ` · ${paperSummary.totalMarks} marks`} · ${escapeHtml(topicDescription)}</p>
        ${paperNeedsRegeneration ? `<p class="setup-panel-sub setup-panel-warn">Your selections changed — regenerate before printing.</p>` : ""}
      </div>

      <div class="setup-review">
        <div class="setup-review-group setup-review-primary">
          <button type="button" class="setup-print-button" data-control-action="print-student">🖨️ Print / Save student copy</button>
          ${hasAnswers ? `
            <button type="button" class="setup-toggle${solutionsOn ? " is-on" : ""}" data-control-action="toggle-solutions" aria-pressed="${solutionsOn ? "true" : "false"}">
              <span class="setup-toggle-switch" aria-hidden="true"></span>
              ${solutionsOn ? "Answers showing" : "Show answers"}
            </button>
          ` : ""}
        </div>
        <div class="setup-review-group setup-review-secondary">
          <button type="button" data-control-action="start-wizard">Change setup</button>
          <button type="button" data-control-action="generate-paper">Regenerate</button>
          ${hasAnswers ? `<button type="button" data-control-action="print-solutions">Print answers</button>` : ""}
        </div>
      </div>
    </section>
  `;
}

/* ──────────────────────────────────────────────────────────
   GUIDED SETUP WIZARD
   A chained sequence of pop-ups: Style → Details → Topics →
   Generate. Launched by choosing a template style (or "Change
   setup"). Reuses the topic-config sub-modal.
────────────────────────────────────────────────────────── */

const WIZARD_STEPS = [
  { key: "style", label: "Style" },
  { key: "details", label: "Details" },
  { key: "topics", label: "Topics" },
  { key: "review", label: "Generate" }
];

function renderWizardStepper(currentKey) {
  const currentIndex = WIZARD_STEPS.findIndex(s => s.key === currentKey);

  return `
    <div class="wizard-stepper" aria-label="Setup progress">
      ${WIZARD_STEPS.map((step, index) => {
        const state = index < currentIndex ? "done" : index === currentIndex ? "current" : "upcoming";
        return `
          <span class="wizard-step is-${state}">
            <span class="wizard-step-dot">${index < currentIndex ? "✓" : index + 1}</span>
            <span class="wizard-step-label">${escapeHtml(step.label)}</span>
          </span>
        `;
      }).join("")}
    </div>
  `;
}

function openWizard(step = "details") {
  wizardActive = true;
  activeModal = `wizard-${step}`;

  if (step === "topics") {
    // Seed a working copy for EVERY stage, or a stage's cards open blank and
    // its previous selection is lost the moment the step is committed.
    for (const stage of STAGES) {
      stageDraftTopics[stage.id] = cloneSelectedTopics(draftConfig[stage.selectionKey]);
    }
  }

  renderControlDashboard();
}

function closeWizard() {
  wizardActive = false;
  activeModal = null;
  activeTopicId = null;
  for (const stage of STAGES) stageDraftTopics[stage.id] = null;
  renderControlDashboard();
}

function renderWizardDetailsModal() {
  return `
    <div class="builder-modal-backdrop" role="presentation">
      <section class="builder-modal wizard-modal" role="dialog" aria-modal="true" aria-labelledby="wizard-details-title">
        <form data-builder-form="wizard-details">
          <div class="builder-modal-header">
            <div>
              <h2 id="wizard-details-title">Document details</h2>
              <p>Style: <strong>${escapeHtml(getTemplateLabel(draftConfig.template))}</strong>. These appear on the printed document.</p>
            </div>
            <button type="button" class="builder-modal-close" data-control-action="close-modal" aria-label="Close">×</button>
          </div>

          ${renderWizardStepper("details")}

          <div class="builder-form-grid">
            <label><span>School</span><input name="school" value="${escapeHtml(draftConfig.school)}"></label>
            <label><span>Title</span><input name="examTitle" value="${escapeHtml(draftConfig.examTitle)}"></label>
            <label><span>Subtitle / Topic</span><input name="examSubtitle" value="${escapeHtml(draftConfig.examSubtitle)}"></label>
            <label><span>Time allowed (optional)</span><input name="timeAllowed" value="${escapeHtml(draftConfig.timeAllowed)}"></label>
            <label><span>Language</span><select name="language">${renderLanguageOptions(draftConfig.language)}</select></label>
            <label><span>Multiple choice questions</span><select name="multipleChoiceCount">${renderMultipleChoiceOptions(draftConfig.multipleChoiceCount)}</select></label>
          </div>

          <label class="builder-full-field">
            <span>Answers format</span>
            <select name="answersFormat">${renderAnswersFormatOptions(draftConfig.answersFormat)}</select>
          </label>
          <p class="builder-help-text">How the answer key prints. You can change this any time, and it follows the template style by default.</p>

          <label class="builder-inline-check">
            <input type="checkbox" name="calculator" ${draftConfig.calculator ? "checked" : ""}>
            <span>Calculator permitted</span>
          </label>

          <label class="builder-inline-check">
            <input type="checkbox" name="topicPageBreaks" ${draftConfig.topicPageBreaks ? "checked" : ""}>
            <span>Start each topic on a new page</span>
          </label>
          <p class="builder-help-text">Hand out one topic at a time. Off by default, which packs the questions as tightly as possible.</p>

          <label class="builder-full-field">
            <span>Instructions</span>
            <textarea name="instructions" rows="5">${escapeHtml((draftConfig.instructions || []).join("\n"))}</textarea>
          </label>

          <div class="builder-modal-actions wizard-actions">
            <button type="button" class="builder-cancel" data-control-action="close-modal">Cancel</button>
            <button type="submit" class="builder-submit">Next: choose topics →</button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function renderWizardTopicsModal() {
  const total = getWorkingQuestionTotal();
  const selectedCount = getWorkingTopicCount();

  return `
    <div class="builder-modal-backdrop" role="presentation">
      <section class="builder-modal builder-modal-wide wizard-modal" role="dialog" aria-modal="true" aria-labelledby="wizard-topics-title">
        <div class="builder-modal-header">
          <div>
            <h2 id="wizard-topics-title">Choose topics</h2>
            <p>Tap a topic to pick its question types and how many. Mix stages freely.</p>
          </div>
          <button type="button" class="builder-modal-close" data-control-action="close-modal" aria-label="Close">×</button>
        </div>

        ${renderWizardStepper("topics")}

        ${anyStageStatus() ? `<p class="stage4-status">${escapeHtml(anyStageStatus())}</p>` : ""}

        <div class="wizard-topic-summary">
          <span><strong>${selectedCount}</strong> topic${selectedCount === 1 ? "" : "s"}</span>
          <span><strong>${total}</strong> question${total === 1 ? "" : "s"}</span>
          <span><strong>${Number(draftConfig.multipleChoiceCount || 0)}</strong> multiple choice</span>
        </div>

        ${STAGES.filter(stage => Object.keys(stage.topics).length).map(stage => `
          <h3 class="wizard-stage-heading">${escapeHtml(stage.label)}</h3>
          <div class="stage-topic-card-grid" aria-label="${escapeHtml(stage.label)} topics">
            ${Object.entries(stage.topics).map(([topicId, topic]) => renderTopicCard(topicId, topic, stage.id)).join("")}
          </div>
        `).join("")}

        <div class="builder-modal-actions wizard-actions">
          <button type="button" class="builder-cancel" data-control-action="wizard-back-details">← Back</button>
          <button type="button" class="builder-submit" data-control-action="wizard-topics-next" ${total > 0 || Number(draftConfig.multipleChoiceCount || 0) > 0 ? "" : "disabled"}>Next: generate →</button>
        </div>
      </section>
    </div>
  `;
}

function renderWizardReviewModal() {
  const selected = eachSelectedTopic(draftConfig);
  const labelsByStage = STAGES.map(stage => ({
    stage,
    labels: selected.filter(entry => entry.stage.id === stage.id).map(entry => entry.topic.label)
  }));
  const extendedTotal = selected.reduce((sum, entry) => sum + Number(entry.topicConfig.count || 0), 0);
  const mcCount = Number(draftConfig.multipleChoiceCount || 0);
  const ready = selected.length > 0 && (extendedTotal > 0 || mcCount > 0);

  return `
    <div class="builder-modal-backdrop" role="presentation">
      <section class="builder-modal wizard-modal" role="dialog" aria-modal="true" aria-labelledby="wizard-review-title">
        <div class="builder-modal-header">
          <div>
            <h2 id="wizard-review-title">Ready to generate</h2>
            <p>Check the summary, then create your document and answers.</p>
          </div>
          <button type="button" class="builder-modal-close" data-control-action="close-modal" aria-label="Close">×</button>
        </div>

        ${renderWizardStepper("review")}

        <div class="wizard-review-grid">
          <div><strong>Style</strong><span>${escapeHtml(getTemplateLabel(draftConfig.template))}</span></div>
          <div><strong>Title</strong><span>${escapeHtml(draftConfig.examTitle || "Untitled")}</span></div>
          ${labelsByStage.map(({ stage, labels }) =>
            `<div><strong>${escapeHtml(stage.label)}</strong><span>${labels.length ? escapeHtml(labels.join(", ")) : "—"}</span></div>`
          ).join("")}
          <div><strong>Questions</strong><span>${extendedTotal} extended · ${mcCount} multiple choice</span></div>
          <div><strong>Answers</strong><span>${escapeHtml((ANSWERS_FORMAT_OPTIONS.find(o => o.id === draftConfig.answersFormat) || {}).label || "Textbook style")}</span></div>
        </div>

        ${ready ? "" : `<p class="stage4-status">Choose at least one topic with questions (or some multiple choice) before generating.</p>`}

        <div class="builder-modal-actions wizard-actions">
          <button type="button" class="builder-cancel" data-control-action="wizard-back-topics">← Back</button>
          <button type="button" class="builder-submit" data-control-action="wizard-generate" ${ready ? "" : "disabled"}>Generate ${escapeHtml(getTemplateLabel(draftConfig.template))} →</button>
        </div>
      </section>
    </div>
  `;
}

function getExamDetailsStatus() {
  return "Complete";
}

function renderWorkflowSummary({
  stageCounts = [],
  selectedQuestionTotal,
  mcCount,
  hasExam,
  paperSummary
}) {
  // One line per stage that has something selected; a stage with nothing
  // chosen is simply absent rather than reported as empty.
  const stageLines = STAGES.map(stage => {
    const labels = Object.keys(selectedTopicsForStage(draftConfig, stage.id))
      .map(topicId => stage.topics[topicId]?.label)
      .filter(Boolean);
    return labels.length ? `${stage.label}: ${labels.join(" · ")}` : "";
  }).filter(Boolean);

  const topicsText = stageLines.length ? stageLines : ["No topics selected"];

  return `
    <div class="workflow-paper-summary" aria-label="Current setup summary">
      <div>
        <strong>Current setup</strong>
        <span>${escapeHtml(draftConfig.examTitle || "Untitled document")} · ${escapeHtml(getTemplateLabel(draftConfig.template))} · ${escapeHtml(draftConfig.timeAllowed || "Time not set")} · ${draftConfig.calculator ? "Calculator permitted" : "No calculator"}</span>
      </div>

      <div>
        <strong>Topics</strong>
        <span>${topicsText.map(line => escapeHtml(line)).join("<br>")}</span>
      </div>

      <div>
        <strong>Question mix</strong>
        <span>${selectedQuestionTotal} extended · ${mcCount} multiple choice${hasExam && !isRevisionPackageTemplate() ? ` · ${paperSummary.totalMarks} generated marks` : ""}</span>
      </div>
    </div>
  `;
}

function renderActiveModal() {
  if (activeModal === "wizard-details") return renderWizardDetailsModal();
  if (activeModal === "wizard-topics") return renderWizardTopicsModal();
  if (activeModal === "wizard-review") return renderWizardReviewModal();
  if (activeModal === "topic-config") return renderTopicConfigureModal();
  if (activeModal === "exam-details") return renderExamDetailsModal();
  const stageMatch = STAGES.find(stage => stageModalId(stage.id) === activeModal);
  if (stageMatch) return renderStageTopicsModal(stageMatch.id);
  return "";
}

function renderExamDetailsModal() {
  return `
    <div class="builder-modal-backdrop" role="presentation">
      <section class="builder-modal" role="dialog" aria-modal="true" aria-labelledby="exam-details-title">
        <form data-builder-form="exam-details">
          <div class="builder-modal-header">
            <div>
              <h2 id="exam-details-title">Document Details</h2>
              <p>These details appear on the selected output template. Revision packages hide marks and only show school, title and a student name line.</p>
            </div>
            <button type="button" class="builder-modal-close" data-control-action="close-modal" aria-label="Close">×</button>
          </div>

          <div class="builder-form-grid">
            <label>
              <span>School</span>
              <input name="school" value="${escapeHtml(draftConfig.school)}">
            </label>

            <label>
              <span>Title</span>
              <input name="examTitle" value="${escapeHtml(draftConfig.examTitle)}">
            </label>

            <label>
              <span>Subtitle / Topic</span>
              <input name="examSubtitle" value="${escapeHtml(draftConfig.examSubtitle)}">
            </label>

            <label>
              <span>Time allowed</span>
              <input name="timeAllowed" value="${escapeHtml(draftConfig.timeAllowed)}">
            </label>

            <label>
              <span>Language</span>
              <select name="language">
                ${renderLanguageOptions(draftConfig.language)}
              </select>
            </label>

            <label>
              <span>Output template</span>
              <select name="template">
                ${renderTemplateOptions(draftConfig.template)}
              </select>
            </label>
          </div>

          <label class="builder-inline-check">
            <input type="checkbox" name="calculator" ${draftConfig.calculator ? "checked" : ""}>
            <span>Calculator permitted</span>
          </label>

          <label class="builder-inline-check">
            <input type="checkbox" name="topicPageBreaks" ${draftConfig.topicPageBreaks ? "checked" : ""}>
            <span>Start each topic on a new page</span>
          </label>
          <p class="builder-help-text">Hand out one topic at a time. Off by default, which packs the questions as tightly as possible.</p>

          <label class="builder-full-field">
            <span>Multiple choice questions</span>
            <select name="multipleChoiceCount">
              ${renderMultipleChoiceOptions(draftConfig.multipleChoiceCount)}
            </select>
          </label>

          <p class="builder-help-text">
            Multiple choice questions are generated from the selected Stage 4 and Stage 5 topics and question types, using 1-mark questions only.
          </p>

          <label class="builder-full-field">
            <span>Instructions</span>
            <textarea name="instructions" rows="6">${escapeHtml((draftConfig.instructions || []).join("\n"))}</textarea>
          </label>

          <div class="builder-modal-actions">
            <button type="submit" class="builder-submit">Submit</button>
            <button type="button" class="builder-cancel" data-control-action="close-modal">Cancel</button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function renderLanguageOptions(selectedValue = "en") {
  return LANGUAGE_OPTIONS
    .map(option => `<option value="${escapeHtml(option.id)}" ${String(selectedValue || "en") === option.id ? "selected" : ""}>${escapeHtml(option.label)}</option>`)
    .join("");
}

function getTemplateLabel(template = "hsc-style") {
  return OUTPUT_TEMPLATES.find(option => option.id === String(template || "hsc-style"))?.label || "HSC-style exam paper";
}

function renderTemplateOptions(selectedValue = "hsc-style") {
  return OUTPUT_TEMPLATES
    .map(option => `<option value="${escapeHtml(option.id)}" ${String(selectedValue || "hsc-style") === option.id ? "selected" : ""}>${escapeHtml(option.label)}</option>`)
    .join("");
}

function renderMultipleChoiceOptions(selectedValue = 0) {
  const values = [0, 5, 10, 15, 20, 25, 30];
  return values
    .map(value => `<option value="${value}" ${Number(selectedValue) === value ? "selected" : ""}>${value}</option>`)
    .join("");
}

// Returns true for any template that hides marks (revision-package, worksheet, textbook-template).
const MARK_HIDING_TEMPLATES = new Set(["revision-package", "worksheet", "textbook-template"]);

function isRevisionPackageTemplate(template = draftConfig.template) {
  return MARK_HIDING_TEMPLATES.has(String(template || ""));
}


/* Seed a stage's working copy from the committed selection on first edit. */
function ensureWorkingTopics(stageId) {
  const stage = getStage(stageId);
  if (!stageDraftTopics[stage.id]) {
    stageDraftTopics[stage.id] = cloneSelectedTopics(draftConfig[stage.selectionKey]);
  }
  return stageDraftTopics[stage.id];
}

function getWorkingTopicsForStage(stageId = DEFAULT_STAGE_ID) {
  return stageDraftTopics[stageId] || {};
}

function getTopicRegistryForStage(stageId = DEFAULT_STAGE_ID) {
  return getStage(stageId).topics;
}

/* Total selected questions across every stage's working copy. */
function getWorkingQuestionTotal() {
  return STAGES.reduce((total, stage) =>
    total + Object.values(getWorkingTopicsForStage(stage.id))
      .reduce((sum, topicConfig) => sum + Number(topicConfig.count || 0), 0), 0);
}

function getWorkingTopicCount() {
  return STAGES.reduce((total, stage) =>
    total + Object.keys(getWorkingTopicsForStage(stage.id)).length, 0);
}

function cloneSelectedTopics(selectedTopics = {}) {
  return Object.fromEntries(
    Object.entries(selectedTopics || {}).map(([topicId, topicConfig]) => [
      topicId,
      {
        count: Number(topicConfig?.count || DEFAULT_TOPIC_COUNTS[topicId] || 6),
        allowedTypes: Array.isArray(topicConfig?.allowedTypes)
          ? topicConfig.allowedTypes.slice()
          : []
      }
    ])
  );
}

function getRecommendedTypeIds(topicId, stage = activeTopicStage || "stage4") {
  const types = getTopicTypes(topicId, stage);
  const priorityWords = [
    "graph",
    "solve",
    "calculate",
    "simplify",
    "interpret",
    "construct",
    "area",
    "perimeter",
    "equation",
    "application",
    "problem"
  ];

  const scored = types.map((type, index) => {
    const label = `${type.label || ""} ${type.id || ""}`.toLowerCase();
    const score = priorityWords.reduce((sum, word) => sum + (label.includes(word) ? 1 : 0), 0);
    return { id: type.id, index, score };
  });

  scored.sort((a, b) => b.score - a.score || a.index - b.index);

  const limit = Math.min(6, Math.max(3, Math.ceil(types.length / 2)));
  return scored.slice(0, limit).map(item => item.id);
}

function getTopicSummary(topicId, config) {
  if (!config) return "Not selected";

  const typeCount = Array.isArray(config.allowedTypes) ? config.allowedTypes.length : 0;
  const questionCount = Number(config.count || 0);
  return `${questionCount} question${questionCount === 1 ? "" : "s"} · ${typeCount} type${typeCount === 1 ? "" : "s"} selected`;
}

/* Selection summary for one stage's standalone picker. */
function renderStageSummary(stageId) {
  const workingTopics = getWorkingTopicsForStage(stageId);
  const selectedTopicIds = Object.keys(workingTopics);
  const totalQuestions = Object.values(workingTopics)
    .reduce((sum, topicConfig) => sum + Number(topicConfig.count || 0), 0);

  return `
    <div class="stage4-selection-summary">
      <div>
        <strong>${selectedTopicIds.length}</strong>
        <span>topic${selectedTopicIds.length === 1 ? "" : "s"} selected</span>
      </div>
      <div>
        <strong>${totalQuestions}</strong>
        <span>extended question${totalQuestions === 1 ? "" : "s"}</span>
      </div>
      <div>
        <strong>${draftConfig.multipleChoiceCount || 0}</strong>
        <span>multiple choice</span>
      </div>
    </div>
  `;
}


/*
  Standalone topic picker for one stage — the non-wizard path. One renderer for
  every stage, built from the registry; there were previously two near-identical
  copies and a third stage would have needed a third.
*/
function renderTopicConfigureModal() {
  const topicId = activeTopicId;
  const stage = activeTopicStage || DEFAULT_STAGE_ID;
  const topicRegistry = getTopicRegistryForStage(stage);
  const topic = topicRegistry[topicId];

  if (!topic) {
    activeModal = wizardActive ? "wizard-topics" : stageModalId(stage);
    activeTopicId = null;
    return renderActiveModal();
  }

  const workingTopics = getWorkingTopicsForStage(stage);
  const savedConfig = workingTopics[topicId] || null;
  const types = getTopicTypes(topicId, stage);
  const selectedTypes = new Set(savedConfig?.allowedTypes || []);
  const count = savedConfig?.count ?? DEFAULT_TOPIC_COUNTS[topicId] ?? 6;

  return `
    <div class="builder-modal-backdrop" role="presentation">
      <section class="builder-modal topic-config-modal" role="dialog" aria-modal="true" aria-labelledby="topic-config-title">
        <form data-builder-form="topic-config" data-topic-id="${escapeHtml(topicId)}" data-topic-stage="${escapeHtml(stage)}">
          <div class="builder-modal-header">
            <div>
              <h2 id="topic-config-title">${escapeHtml(topic.label)}</h2>
              <p>Select the question types you want included for this ${escapeHtml(getStage(stage).label)} topic.</p>
            </div>
            <button type="button" class="builder-modal-close" data-control-action="cancel-topic-config" aria-label="Close">×</button>
          </div>

          <div class="topic-config-panel">
            <label class="stage-topic-count topic-config-count">
              <span>Number of extended-response questions</span>
              <input type="number" min="0" max="80" step="1" name="topicCount" value="${escapeHtml(count)}">
            </label>

            <div class="topic-config-tools">
              <button type="button" data-control-action="topic-config-select-all">Select all</button>
              <button type="button" data-control-action="topic-config-clear-all">Clear all</button>
              <button type="button" data-control-action="topic-config-recommended">Recommended mix</button>
            </div>

            <div class="topic-config-type-grid">
              ${types.map(type => `
                <label class="topic-config-type">
                  <input
                    type="checkbox"
                    name="topicType"
                    value="${escapeHtml(type.id)}"
                    ${selectedTypes.has(type.id) ? "checked" : ""}>
                  <span>${escapeHtml(type.label || type.id)}</span>
                </label>
              `).join("")}
            </div>
          </div>

          <p class="builder-help-text">
            Tip: leave unrelated types unticked. You can return and edit this topic at any time before generating.
          </p>

          <div class="builder-modal-actions">
            <button type="submit" class="builder-submit">Save topic</button>
            <button type="button" class="builder-cancel" data-control-action="cancel-topic-config">Cancel</button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function renderStageTopicsModal(stageId) {
  const stage = getStage(stageId);
  const status = getStageStatus(stage.id);

  return `
    <div class="builder-modal-backdrop" role="presentation">
      <section class="builder-modal builder-modal-wide stage4-modal" role="dialog" aria-modal="true" aria-labelledby="stage-topics-title">
        <div class="builder-modal-header">
          <div>
            <h2 id="stage-topics-title">Select Topics (${escapeHtml(stage.label)})</h2>
            <p>Choose a topic card, configure its question types, then submit your ${escapeHtml(stage.label)} selection.</p>
          </div>
          <button type="button" class="builder-modal-close" data-control-action="cancel-stage" data-stage="${escapeHtml(stage.id)}" aria-label="Close">×</button>
        </div>

        ${renderStageSummary(stage.id)}

        ${status ? `<p class="stage4-status">${escapeHtml(status)}</p>` : ""}

        <div class="stage-topic-card-grid" aria-label="${escapeHtml(stage.label)} topics">
          ${Object.entries(stage.topics).map(([topicId, topic]) => renderTopicCard(topicId, topic, stage.id)).join("")}
        </div>

        <div class="builder-modal-actions">
          <button type="button" class="builder-submit" data-control-action="submit-stage" data-stage="${escapeHtml(stage.id)}">Submit ${escapeHtml(stage.label)} topics</button>
          <button type="button" class="builder-cancel" data-control-action="cancel-stage" data-stage="${escapeHtml(stage.id)}">Cancel</button>
        </div>
      </section>
    </div>
  `;
}


function renderTopicCard(topicId, topic, stage = "stage4") {
  const workingTopics = getWorkingTopicsForStage(stage);
  const savedConfig = workingTopics[topicId] || null;
  const selected = Boolean(savedConfig);
  const typeCount = Array.isArray(savedConfig?.allowedTypes) ? savedConfig.allowedTypes.length : 0;

  return `
    <article class="stage-topic-choice-card${selected ? " is-selected" : ""}" data-topic-id="${escapeHtml(topicId)}" data-topic-stage="${escapeHtml(stage)}">
      <button type="button" class="stage-topic-card-button" data-control-action="open-topic-config" data-topic-id="${escapeHtml(topicId)}" data-topic-stage="${escapeHtml(stage)}">
        <span class="stage-topic-check" aria-hidden="true">${selected ? "✓" : ""}</span>
        <span class="stage-topic-card-main">
          <strong>${escapeHtml(topic.label)}</strong>
          <span>${escapeHtml(getTopicSummary(topicId, savedConfig))}</span>
        </span>
        <span class="stage-topic-card-action">${selected ? "Edit" : "Configure"} →</span>
      </button>

      ${selected ? `
        <div class="stage-topic-card-footer">
          <span>${typeCount} selected question type${typeCount === 1 ? "" : "s"}</span>
          <button type="button" data-control-action="clear-topic-selection" data-topic-id="${escapeHtml(topicId)}" data-topic-stage="${escapeHtml(stage)}">Clear</button>
        </div>
      ` : ""}
    </article>
  `;
}

function getTopicTypes(topicId, stage = "stage4") {
  const topic = getTopicRegistryForStage(stage)[topicId];
  if (!topic?.getTypes) return [];

  try {
    const types = topic.getTypes();
    return Array.isArray(types)
      ? types.map(type => typeof type === "string" ? { id: type, label: type } : type)
          .filter(type => type?.id)
      : [];
  } catch (error) {
    console.warn(`Could not read question types for ${topicId}.`, error);
    return [];
  }
}

function instructionsAreDefault(instructions = []) {
  const join = list => list.join("\n").trim();
  const current = join(instructions || []);
  return current === join(DEFAULT_INSTRUCTIONS) || current === join(EXAM_INSTRUCTIONS) || current === "";
}

function applyTemplateChange(newTemplate) {
  draftConfig.template = newTemplate;

  // Changing the style resets the answer format to that style's default.
  draftConfig.answersFormat = getDefaultAnswersFormatForTemplate(newTemplate);

  controlsStatus = `Template style set to ${getTemplateLabel(newTemplate)}.${currentExam ? " The current document has been re-rendered in this style." : ""}`;

  if (currentExam) {
    currentExam.template = draftConfig.template;
    currentExam.answersFormat = draftConfig.answersFormat;
    editorStatus = `Template style changed to ${getTemplateLabel(newTemplate)}.`;
    renderAll();
    return;
  }

  renderControlDashboard();
}

function submitWizardDetails(form) {
  const formData = new FormData(form);

  // Keep exactly what the teacher typed (blank stays blank).
  draftConfig.school = String(formData.get("school") || "").trim();
  draftConfig.examTitle = String(formData.get("examTitle") || "").trim();
  draftConfig.examSubtitle = String(formData.get("examSubtitle") || "").trim();
  draftConfig.timeAllowed = String(formData.get("timeAllowed") || "").trim();
  draftConfig.calculator = formData.has("calculator");
  draftConfig.topicPageBreaks = formData.has("topicPageBreaks");
  draftConfig.language = String(formData.get("language") || "en");
  draftConfig.answersFormat = String(formData.get("answersFormat") || getDefaultAnswersFormatForTemplate(draftConfig.template));
  draftConfig.multipleChoiceCount = Number(formData.get("multipleChoiceCount") || 0);
  draftConfig.instructions = String(formData.get("instructions") || "")
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  openWizard("topics");
}

/*
  Commit every stage's working copy when the wizard leaves the topics step.

  This listed the stages by hand, so a Stage 3 selection was made, shown as
  selected on its card — which reads the working copy — and then silently
  dropped here, leaving the review step with nothing to generate.
*/
function applyWizardTopicSelections() {
  for (const stage of STAGES) {
    draftConfig[stage.selectionKey] = cloneSelectedTopics(stageDraftTopics[stage.id] || {});
  }

  if (!draftConfig.examSubtitle?.trim()) {
    draftConfig.examSubtitle = buildSubtitleFromSelectedTopics(draftConfig);
  }
}

function submitExamDetails(form) {
  const formData = new FormData(form);

  draftConfig.school = String(formData.get("school") || "").trim() || DEFAULT_SCHOOL;
  draftConfig.examTitle = String(formData.get("examTitle") || "").trim() || "Mathematics Worksheet";
  draftConfig.examSubtitle = String(formData.get("examSubtitle") || "").trim();
  draftConfig.timeAllowed = String(formData.get("timeAllowed") || "").trim();
  draftConfig.calculator = formData.has("calculator");
  draftConfig.topicPageBreaks = formData.has("topicPageBreaks");
  draftConfig.language = String(formData.get("language") || "en");
  draftConfig.template = String(formData.get("template") || "worksheet");
  draftConfig.multipleChoiceCount = Number(formData.get("multipleChoiceCount") || 0);
  draftConfig.instructions = String(formData.get("instructions") || "")
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  activeModal = null;
  controlsStatus = currentExam
    ? "Document details updated. The current generated document has been re-rendered with these details."
    : "Document details updated.";

  if (currentExam) {
    currentExam.school = draftConfig.school;
    currentExam.title = draftConfig.examTitle;
    currentExam.subtitle = draftConfig.examSubtitle || buildSubtitleFromSelectedTopics(draftConfig);
    currentExam.timeAllowed = draftConfig.timeAllowed;
    currentExam.calculator = draftConfig.calculator
      ? "Calculator permitted"
      : "No calculator permitted";
    currentExam.language = draftConfig.language;
    currentExam.template = draftConfig.template;
    currentExam.instructions = draftConfig.instructions?.length
      ? draftConfig.instructions
      : DEFAULT_INSTRUCTIONS.slice();
    editorStatus = `Document details updated. Current output template: ${getTemplateLabel(currentExam.template)}.`;
    renderAll();
    return;
  }

  renderControlDashboard();
}

function submitTopicConfig(form) {
  const topicId = form.dataset.topicId;
  const stage = form.dataset.topicStage || activeTopicStage || "stage4";
  const topic = getTopicRegistryForStage(stage)[topicId];

  if (!topic) return;

  const formData = new FormData(form);
  const selectedTypeIds = formData.getAll("topicType").map(String);
  const count = clamp(Number(formData.get("topicCount") || DEFAULT_TOPIC_COUNTS[topicId] || 6), 0, 80);

  if (!selectedTypeIds.length) {
    setStageStatus(stage, "Select at least one question type, or press Cancel to leave this topic unselected.");
    renderControlDashboard();
    return;
  }

  // Write into the stage the topic actually belongs to. This used to be a
  // two-way branch on stage5, which silently filed every Stage 3 topic under
  // Stage 4 — where the id does not exist, so it was dropped on commit and the
  // card stayed "Not selected".
  {
    const working = ensureWorkingTopics(stage);

    working[topicId] = {
      count,
      allowedTypes: selectedTypeIds
    };

    activeModal = wizardActive ? "wizard-topics" : stageModalId(stage);
    setStageStatus(stage, `${topic.label} saved.`);
  }

  activeTopicId = null;
  activeTopicStage = stage;
  renderControlDashboard();
}

/*
  Commit or discard a stage's topic selection. One pair of functions for every
  stage — the per-stage copies differed only in which variable they touched.
*/
function submitStageTopics(stageId) {
  const stage = getStage(stageId);
  const selectedTopics = cloneSelectedTopics(stageDraftTopics[stage.id] || {});
  draftConfig[stage.selectionKey] = selectedTopics;

  if (!draftConfig.examSubtitle?.trim()) {
    draftConfig.examSubtitle = buildSubtitleFromSelectedTopics(draftConfig);
  }

  const count = Object.keys(selectedTopics).length;

  activeModal = null;
  activeTopicId = null;
  activeTopicStage = stage.id;
  stageDraftTopics[stage.id] = null;
  setStageStatus(stage.id, "");
  controlsStatus = `${count} ${stage.label} topic${count === 1 ? "" : "s"} selected.${currentExam ? " Click Regenerate before printing/exporting to apply these topic changes." : ""}`;

  if (currentExam) {
    editorStatus = "Topic selections changed. The displayed document still shows the previous generated questions until you click Regenerate.";
  }

  renderControlDashboard();
}

function cancelStageTopics(stageId) {
  const stage = getStage(stageId);

  activeModal = null;
  activeTopicId = null;
  activeTopicStage = stage.id;
  stageDraftTopics[stage.id] = null;
  setStageStatus(stage.id, "");
  controlsStatus = `${stage.label} topic selection cancelled.`;
  renderControlDashboard();
}

function validateBeforeGenerate() {
  const selected = eachSelectedTopic(draftConfig);
  const hasTopics = selected.length > 0;

  // Count across every stage. This summed Stage 4 and Stage 5 by hand, so a
  // paper built only from Stage 3 counted as zero questions and the Generate
  // button silently bounced back to the review step.
  const extendedCount = selected
    .reduce((sum, { topicConfig }) => sum + Number(topicConfig.count || 0), 0);

  const mcCount = Number(draftConfig.multipleChoiceCount || 0);

  if (!hasTopics) {
    return "Open Choose Topics and select at least one topic before generating.";
  }

  if (extendedCount <= 0 && mcCount <= 0) {
    return "Choose at least one extended-response question or multiple-choice question before generating.";
  }

  return "";
}

function printWithMode(mode) {
  if (!currentExam) return;

  document.body.classList.remove("print-student-exam", "print-worked-solutions");
  document.body.classList.add(mode);

  window.setTimeout(() => window.print(), 50);

  window.setTimeout(() => {
    document.body.classList.remove("print-student-exam", "print-worked-solutions");
  }, 1000);
}

controlsRoot.addEventListener("click", event => {
  const button = event.target.closest("[data-control-action]");
  if (!button) return;

  const action = button.dataset.controlAction;

  if (action === "select-template") {
    const newTemplate = String(button.dataset.template || "worksheet");

    // Once a document exists, choosing a style just restyles it live.
    if (currentExam) {
      if (newTemplate !== draftConfig.template) applyTemplateChange(newTemplate);
      return;
    }

    // Before generating, choosing a style starts the guided setup wizard.
    draftConfig.template = newTemplate;
    draftConfig.answersFormat = getDefaultAnswersFormatForTemplate(newTemplate);
    openWizard("details");
    return;
  }

  if (action === "start-wizard") {
    openWizard("details");
    return;
  }

  if (action === "wizard-back-details") {
    activeModal = "wizard-details";
    renderControlDashboard();
    return;
  }

  if (action === "wizard-topics-next") {
    applyWizardTopicSelections();
    activeModal = "wizard-review";
    renderControlDashboard();
    return;
  }

  if (action === "wizard-back-topics") {
    openWizard("topics");
    return;
  }

  if (action === "wizard-generate") {
    const warning = validateBeforeGenerate();
    if (warning) {
      setStageStatus("stage4", warning);
      activeModal = "wizard-review";
      renderControlDashboard();
      return;
    }

    try {
      wizardActive = false;
      activeModal = null;
      buildExam(draftConfig);
    } catch (error) {
      console.error("Question set generation failed", error);
      controlsStatus = `Generation failed: ${error?.message || error}.`;
      renderControlDashboard();
    }
    return;
  }

  if (action === "open-exam-details") {
    activeModal = "exam-details";
    renderControlDashboard();
    return;
  }

  if (action === "open-stage") {
    const stage = getStage(button.dataset.stage);
    stageDraftTopics[stage.id] = cloneSelectedTopics(draftConfig[stage.selectionKey]);
    setStageStatus(stage.id, "");
    activeTopicId = null;
    activeTopicStage = stage.id;
    activeModal = stageModalId(stage.id);
    renderControlDashboard();
    return;
  }

  if (action === "close-modal") {
    if (wizardActive) {
      closeWizard();
      return;
    }
    activeModal = null;
    activeTopicId = null;
    renderControlDashboard();
    return;
  }

  if (action === "cancel-stage") {
    cancelStageTopics(button.dataset.stage);
    return;
  }

  if (action === "submit-stage") {
    submitStageTopics(button.dataset.stage);
    return;
  }

  if (action === "open-topic-config") {
    const stage = button.dataset.topicStage || DEFAULT_STAGE_ID;

    ensureWorkingTopics(stage);
    setStageStatus(stage, "");

    activeTopicId = button.dataset.topicId;
    activeTopicStage = stage;
    activeModal = "topic-config";
    renderControlDashboard();
    return;
  }

  if (action === "cancel-topic-config") {
    activeTopicId = null;
    activeModal = wizardActive ? "wizard-topics" : stageModalId(activeTopicStage);
    renderControlDashboard();
    return;
  }

  if (action === "clear-topic-selection") {
    const topicId = button.dataset.topicId;
    const stage = button.dataset.topicStage || DEFAULT_STAGE_ID;

    delete ensureWorkingTopics(stage)[topicId];
    setStageStatus(stage, "Topic cleared.");

    renderControlDashboard();
    return;
  }

  if (
    action === "topic-config-select-all" ||
    action === "topic-config-clear-all" ||
    action === "topic-config-recommended"
  ) {
    const form = button.closest("[data-builder-form='topic-config']");
    const topicId = form?.dataset.topicId;
    const stage = form?.dataset.topicStage || activeTopicStage || "stage4";
    const inputs = Array.from(form?.querySelectorAll('input[name="topicType"]') || []);

    if (action === "topic-config-select-all") {
      inputs.forEach(input => { input.checked = true; });
    }

    if (action === "topic-config-clear-all") {
      inputs.forEach(input => { input.checked = false; });
    }

    if (action === "topic-config-recommended") {
      const recommended = new Set(getRecommendedTypeIds(topicId, stage));
      inputs.forEach(input => {
        input.checked = recommended.has(input.value);
      });
    }

    return;
  }

  if (action === "generate-paper") {
    const warning = validateBeforeGenerate();

    if (warning) {
      controlsStatus = warning;
      renderControlDashboard();
      return;
    }

    if (currentExam) {
      const confirmed = window.confirm("Regenerate the question set? This will replace the current generated questions and any edits you have made.");
      if (!confirmed) return;
    }

    try {
      buildExam(draftConfig);
    } catch (error) {
      console.error("Question set generation failed", error);
      controlsStatus = `Question set generation failed: ${error?.message || error}. Check the browser console for the full details.`;
      renderControlDashboard();
    }

    return;
  }

  if (action === "toggle-solutions") {
    showWorkedSolutions = !showWorkedSolutions;
    controlsStatus = showWorkedSolutions
      ? "Worked solutions are visible."
      : "Worked solutions are hidden.";
    renderAll();
    return;
  }

  if (action === "print-student") {
    printWithMode("print-student-exam");
    return;
  }

  if (action === "print-solutions") {
    printWithMode("print-worked-solutions");
    return;
  }

});

controlsRoot.addEventListener("submit", event => {
  const form = event.target.closest("[data-builder-form]");
  if (!form) return;

  event.preventDefault();

  const formType = form.dataset.builderForm;

  if (formType === "wizard-details") {
    submitWizardDetails(form);
    return;
  }

  if (formType === "exam-details") {
    submitExamDetails(form);
    return;
  }

  if (formType === "stage-4-topics") {
    submitStageTopics("stage4");
    return;
  }

  if (formType === "topic-config") {
    submitTopicConfig(form);
  }
});

function renderEditorToolbar() {
  if (!currentExam) {
    editorRoot.innerHTML = "";
    return;
  }

  const summary = getExamEditorSummary(currentExam);
  const editButtonText = editMode ? "Finish editing" : "Edit question set";
  const undoDisabled = lastRemovedQuestion ? "" : "disabled";
  const editHelp = editMode
    ? "Editing is on. Use ↑/↓, ×, or drag the handle. Questions stay inside their current section."
    : "Editing is off. The document is ready to print or save.";

  const activeLanguage = currentExam.language || draftConfig.language || "en";

  editorRoot.innerHTML = `
    <section class="exam-editor-toolbar${editMode ? " is-active" : ""}" aria-label="Question set editor">
      <div class="exam-editor-toolbar-main">
        <div>
          <strong>Question set editor</strong>
          <span>${summary.questionCount} questions · ${summary.totalMarks} marks · ${summary.multipleChoiceCount} MC · ${summary.extendedResponseCount} extended · ${escapeHtml(getTemplateLabel(currentExam.template || draftConfig.template))} · ${escapeHtml(getLanguageLabel(activeLanguage))}</span>
        </div>

        <div class="exam-editor-actions">
          <label class="exam-language-switch">
            <span>Document language</span>
            <select data-editor-toolbar-action="change-language">
              ${renderLanguageOptions(activeLanguage)}
            </select>
          </label>
          <button type="button" data-editor-toolbar-action="toggle-edit">${editButtonText}</button>
          <button type="button" data-editor-toolbar-action="undo-remove" ${undoDisabled}>Undo remove</button>
        </div>
      </div>

      <p class="exam-editor-help">${editorStatus || editHelp}</p>
    </section>
  `;
}

function setEditorStatus(message) {
  editorStatus = message;
}

editorRoot.addEventListener("change", event => {
  const select = event.target.closest('[data-editor-toolbar-action="change-language"]');

  if (!select || !currentExam) return;

  const newLanguage = String(select.value || "en");
  currentExam.language = newLanguage;
  draftConfig.language = newLanguage;
  setEditorStatus(`Document language changed to ${getLanguageLabel(newLanguage)}. The same generated questions have been re-rendered.`);
  renderCurrentExam();
});

editorRoot.addEventListener("click", event => {
  const button = event.target.closest("[data-editor-toolbar-action]");

  if (!button || !currentExam) return;

  const action = button.dataset.editorToolbarAction;

  if (action === "toggle-edit") {
    editMode = !editMode;
    setEditorStatus(editMode
      ? "Editing is on. Use ↑/↓, ×, or drag the handle. Questions stay inside their current section."
      : "Editing is off. The document is ready to print or save."
    );
    renderCurrentExam();
    return;
  }

  if (action === "undo-remove" && lastRemovedQuestion) {
    const result = restoreRemovedQuestion(currentExam, lastRemovedQuestion);

    if (result.changed) {
      currentExam = result.exam;
      lastRemovedQuestion = null;
      setEditorStatus("Question restored.");
      renderCurrentExam();
    }
  }
});

examRoot.addEventListener("click", event => {
  if (!editMode || !currentExam) return;

  const button = event.target.closest("[data-editor-action]");
  if (!button) return;

  const article = button.closest("[data-question-id]");
  const questionId = article?.dataset.questionId;

  if (!questionId) return;

  const action = button.dataset.editorAction;

  if (action === "remove") {
    const removedNumber = findQuestionNumber(questionId);
    const result = removeQuestionById(currentExam, questionId);

    if (result.changed) {
      currentExam = result.exam;
      lastRemovedQuestion = result.removed;
      setEditorStatus(`Removed question ${removedNumber}. Use Undo remove to restore it.`);
      renderCurrentExam();
    }

    return;
  }

  if (action === "move-up" || action === "move-down") {
    const direction = action === "move-up" ? "up" : "down";
    const result = moveQuestionById(currentExam, questionId, direction);

    if (result.changed) {
      currentExam = result.exam;
      setEditorStatus("Question moved.");
      renderCurrentExam();
    } else if (result.reason) {
      setEditorStatus(result.reason);
      renderEditorToolbar();
    }
  }
});

examRoot.addEventListener("dragstart", event => {
  if (!editMode || !currentExam) return;

  const handle = event.target.closest("[data-editor-drag-handle]");
  const article = event.target.closest("[data-question-id]");

  if (!handle || !article) return;

  draggedQuestionId = article.dataset.questionId;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", draggedQuestionId);
  article.classList.add("is-dragging");
});

examRoot.addEventListener("dragover", event => {
  if (!editMode || !draggedQuestionId) return;

  const article = event.target.closest(".exam-question[data-question-id]");
  if (!article || article.dataset.questionId === draggedQuestionId) return;

  event.preventDefault();

  const rect = article.getBoundingClientRect();
  const position = event.clientY > rect.top + rect.height / 2 ? "after" : "before";

  clearDropIndicators();
  article.classList.add(position === "after" ? "is-drop-after" : "is-drop-before");
});

examRoot.addEventListener("dragleave", event => {
  if (!event.relatedTarget || !examRoot.contains(event.relatedTarget)) {
    clearDropIndicators();
  }
});

examRoot.addEventListener("drop", event => {
  if (!editMode || !currentExam || !draggedQuestionId) return;

  const article = event.target.closest(".exam-question[data-question-id]");

  if (!article) return;

  event.preventDefault();

  const rect = article.getBoundingClientRect();
  const position = event.clientY > rect.top + rect.height / 2 ? "after" : "before";
  const targetQuestionId = article.dataset.questionId;
  const result = moveQuestionRelativeToId(currentExam, draggedQuestionId, targetQuestionId, position);

  clearDropIndicators();
  draggedQuestionId = null;

  if (result.changed) {
    currentExam = result.exam;
    setEditorStatus("Question moved.");
    renderCurrentExam();
  } else if (result.reason) {
    setEditorStatus(result.reason);
    renderEditorToolbar();
  }
});

examRoot.addEventListener("dragend", () => {
  draggedQuestionId = null;
  clearDropIndicators();

  examRoot
    .querySelectorAll(".exam-question.is-dragging")
    .forEach(node => node.classList.remove("is-dragging"));
});

function clearDropIndicators() {
  examRoot
    .querySelectorAll(".is-drop-before, .is-drop-after")
    .forEach(node => node.classList.remove("is-drop-before", "is-drop-after"));
}

function findQuestionNumber(questionId) {
  const index = currentExam?.questions?.findIndex(question => question.id === questionId) ?? -1;
  return index >= 0 ? `Q${index + 1}` : "the question";
}

function buildSubtitleFromSelectedTopics(config = {}) {
  const labels = eachSelectedTopic(config)
    .map(({ topic }) => topic.label)
    .filter(Boolean);

  // Joined with " and ", topic names that themselves contain commas and "and"
  // produced an unreadable chain: "Integers and Fractions, Decimals and
  // Percentages and Angle Relationships and Equations". A middot separates the
  // topics unambiguously whatever they are called.
  return labels.length ? labels.join("  ·  ") : "Mathematics";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function clamp(value, min, max) {
  const number = Number.isFinite(value) ? value : min;
  return Math.min(max, Math.max(min, number));
}

renderAll();
