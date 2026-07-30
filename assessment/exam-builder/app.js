import {
  generateAngleQuestions,
  getAngleQuestionTypes
} from "./question-banks/angles/index.js";

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
let stage4DraftTopics = null;
let stage5DraftTopics = null;
let stage4Status = "";
let stage5Status = "";
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

const ALL_TOPICS = {
  ...TOPICS,
  ...STAGE5_TOPICS
};

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
  selectedTopics: {},
  selectedStage5Topics: {}
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

  return questions;
}

function buildExam(config) {
  const questions = [];
  const requestedMultipleChoiceCount = Number(config.multipleChoiceCount || 0);

  const selectedForMultipleChoice = {
    ...(config.selectedTopics || {}),
    ...(config.selectedStage5Topics || {})
  };

  const multipleChoiceQuestions = buildBalancedMultipleChoiceQuestions({
    topics: ALL_TOPICS,
    selectedTopics: selectedForMultipleChoice,
    count: requestedMultipleChoiceCount
  });

  questions.push(...multipleChoiceQuestions);

  for (const [topicId, topicConfig] of Object.entries(config.selectedTopics || {})) {
    const topic = TOPICS[topicId];

    if (!topic) continue;

    const topicQuestions = generateTopicQuestionsStrict(topic, topicConfig, `Stage 4 ${topic.label || topicId}`);

    questions.push(...topicQuestions);
  }

  for (const [topicId, topicConfig] of Object.entries(config.selectedStage5Topics || {})) {
    const topic = STAGE5_TOPICS[topicId];

    if (!topic) continue;

    const topicQuestions = generateTopicQuestionsStrict(topic, topicConfig, `Stage 5 ${topic.label || topicId}`);

    questions.push(...topicQuestions);
  }

  const finalQuestions = ensureQuestionIds(applyAnswerSpaceRules(questions));

  currentExam = createExam({
    school: config.school || DEFAULT_SCHOOL,
    title: config.examTitle || "",
    subtitle: config.examSubtitle || buildSubtitleFromSelectedTopics(config.selectedTopics, config.selectedStage5Topics),
    timeAllowed: config.timeAllowed || "",

    calculator: config.calculator
      ? "Calculator permitted"
      : "No calculator permitted",

    language: config.language || "en",
    template: config.template || "worksheet",
    answersFormat: config.answersFormat || getDefaultAnswersFormatForTemplate(config.template),

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
  const selectedStage4TopicCount = Object.keys(draftConfig.selectedTopics || {}).length;
  const selectedStage5TopicCount = Object.keys(draftConfig.selectedStage5Topics || {}).length;
  const selectedTopicCount = selectedStage4TopicCount + selectedStage5TopicCount;

  const selectedStage4QuestionTotal = Object.values(draftConfig.selectedTopics || {})
    .reduce((sum, topicConfig) => sum + Number(topicConfig.count || 0), 0);
  const selectedStage5QuestionTotal = Object.values(draftConfig.selectedStage5Topics || {})
    .reduce((sum, topicConfig) => sum + Number(topicConfig.count || 0), 0);
  const selectedQuestionTotal = selectedStage4QuestionTotal + selectedStage5QuestionTotal;

  const hasExam = Boolean(currentExam);
  const mcCount = Number(draftConfig.multipleChoiceCount || 0);
  const readyToGenerate = selectedTopicCount > 0 && (selectedQuestionTotal > 0 || mcCount > 0);
  const workedToggleText = showWorkedSolutions ? "Hide solutions" : "Show solutions";

  const selectedStage4TopicLabels = Object.keys(draftConfig.selectedTopics || {})
    .map(topicId => TOPICS[topicId]?.label)
    .filter(Boolean);
  const selectedStage5TopicLabels = Object.keys(draftConfig.selectedStage5Topics || {})
    .map(topicId => STAGE5_TOPICS[topicId]?.label)
    .filter(Boolean);
  const selectedTopicLabels = [
    ...selectedStage4TopicLabels.map(label => `Stage 4: ${label}`),
    ...selectedStage5TopicLabels.map(label => `Stage 5: ${label}`)
  ];

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
  const setupLine = `${getTemplateLabel(draftConfig.template)} · ${selectedStage4TopicCount} Stage 4 · ${selectedStage5TopicCount} Stage 5 · ${selectedQuestionTotal} extended · ${mcCount} MC${generatedSummary}`;

  const topicDescription = selectedTopicCount
    ? selectedTopicLabels.slice(0, 3).join(", ") + (selectedTopicLabels.length > 3 ? ` + ${selectedTopicLabels.length - 3} more` : "")
    : "Select Stage 4 or Stage 5 topics and question types.";

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
        selectedStage4TopicLabels,
        selectedStage5TopicLabels,
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
    stage4DraftTopics = cloneSelectedTopics(draftConfig.selectedTopics);
    stage5DraftTopics = cloneSelectedTopics(draftConfig.selectedStage5Topics);
  }

  renderControlDashboard();
}

function closeWizard() {
  wizardActive = false;
  activeModal = null;
  activeTopicId = null;
  stage4DraftTopics = null;
  stage5DraftTopics = null;
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
  const stage4Total = Object.values(getStage4WorkingTopics())
    .reduce((sum, c) => sum + Number(c.count || 0), 0);
  const stage5Total = Object.values(getStage5WorkingTopics())
    .reduce((sum, c) => sum + Number(c.count || 0), 0);
  const total = stage4Total + stage5Total;
  const selectedCount = Object.keys(getStage4WorkingTopics()).length + Object.keys(getStage5WorkingTopics()).length;

  return `
    <div class="builder-modal-backdrop" role="presentation">
      <section class="builder-modal builder-modal-wide wizard-modal" role="dialog" aria-modal="true" aria-labelledby="wizard-topics-title">
        <div class="builder-modal-header">
          <div>
            <h2 id="wizard-topics-title">Choose topics</h2>
            <p>Tap a topic to pick its question types and how many. Mix Stage 4 and Stage 5 freely.</p>
          </div>
          <button type="button" class="builder-modal-close" data-control-action="close-modal" aria-label="Close">×</button>
        </div>

        ${renderWizardStepper("topics")}

        ${stage4Status || stage5Status ? `<p class="stage4-status">${escapeHtml(stage4Status || stage5Status)}</p>` : ""}

        <div class="wizard-topic-summary">
          <span><strong>${selectedCount}</strong> topic${selectedCount === 1 ? "" : "s"}</span>
          <span><strong>${total}</strong> question${total === 1 ? "" : "s"}</span>
          <span><strong>${Number(draftConfig.multipleChoiceCount || 0)}</strong> multiple choice</span>
        </div>

        <h3 class="wizard-stage-heading">Stage 4</h3>
        <div class="stage-topic-card-grid" aria-label="Stage 4 topics">
          ${Object.entries(TOPICS).map(([topicId, topic]) => renderTopicCard(topicId, topic, "stage4")).join("")}
        </div>

        <h3 class="wizard-stage-heading">Stage 5</h3>
        <div class="stage-topic-card-grid" aria-label="Stage 5 topics">
          ${Object.entries(STAGE5_TOPICS).map(([topicId, topic]) => renderTopicCard(topicId, topic, "stage5")).join("")}
        </div>

        <div class="builder-modal-actions wizard-actions">
          <button type="button" class="builder-cancel" data-control-action="wizard-back-details">← Back</button>
          <button type="button" class="builder-submit" data-control-action="wizard-topics-next" ${total > 0 || Number(draftConfig.multipleChoiceCount || 0) > 0 ? "" : "disabled"}>Next: generate →</button>
        </div>
      </section>
    </div>
  `;
}

function renderWizardReviewModal() {
  const stage4Labels = Object.keys(draftConfig.selectedTopics || {}).map(id => TOPICS[id]?.label).filter(Boolean);
  const stage5Labels = Object.keys(draftConfig.selectedStage5Topics || {}).map(id => STAGE5_TOPICS[id]?.label).filter(Boolean);
  const extendedTotal = Object.values(draftConfig.selectedTopics || {}).reduce((s, c) => s + Number(c.count || 0), 0)
    + Object.values(draftConfig.selectedStage5Topics || {}).reduce((s, c) => s + Number(c.count || 0), 0);
  const mcCount = Number(draftConfig.multipleChoiceCount || 0);
  const ready = (stage4Labels.length + stage5Labels.length) > 0 && (extendedTotal > 0 || mcCount > 0);

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
          <div><strong>Stage 4</strong><span>${stage4Labels.length ? escapeHtml(stage4Labels.join(", ")) : "—"}</span></div>
          <div><strong>Stage 5</strong><span>${stage5Labels.length ? escapeHtml(stage5Labels.join(", ")) : "—"}</span></div>
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
  selectedStage4TopicLabels = [],
  selectedStage5TopicLabels = [],
  selectedQuestionTotal,
  mcCount,
  hasExam,
  paperSummary
}) {
  const stage4Text = selectedStage4TopicLabels.length
    ? `Stage 4: ${selectedStage4TopicLabels.join(" · ")}`
    : "No Stage 4 topics selected";

  const stage5Text = selectedStage5TopicLabels.length
    ? `Stage 5: ${selectedStage5TopicLabels.join(" · ")}`
    : "No Stage 5 topics selected";

  return `
    <div class="workflow-paper-summary" aria-label="Current setup summary">
      <div>
        <strong>Current setup</strong>
        <span>${escapeHtml(draftConfig.examTitle || "Untitled document")} · ${escapeHtml(getTemplateLabel(draftConfig.template))} · ${escapeHtml(draftConfig.timeAllowed || "Time not set")} · ${draftConfig.calculator ? "Calculator permitted" : "No calculator"}</span>
      </div>

      <div>
        <strong>Topics</strong>
        <span>${escapeHtml(stage4Text)}<br>${escapeHtml(stage5Text)}</span>
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
  if (activeModal === "stage-4") return renderStage4TopicsModal();
  if (activeModal === "stage-5") return renderStage5TopicsModal();
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


function getStage4WorkingTopics() {
  return stage4DraftTopics || {};
}

function getStage5WorkingTopics() {
  return stage5DraftTopics || {};
}

function getWorkingTopicsForStage(stage = "stage4") {
  return stage === "stage5" ? getStage5WorkingTopics() : getStage4WorkingTopics();
}

function getTopicRegistryForStage(stage = "stage4") {
  return stage === "stage5" ? STAGE5_TOPICS : TOPICS;
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

function renderStage4Summary() {
  const workingTopics = getStage4WorkingTopics();
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


function renderStage5Summary() {
  const workingTopics = getStage5WorkingTopics();
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


function renderStage4TopicsModal() {
  return `
    <div class="builder-modal-backdrop" role="presentation">
      <section class="builder-modal builder-modal-wide stage4-modal" role="dialog" aria-modal="true" aria-labelledby="stage-4-title">
        <div class="builder-modal-header">
          <div>
            <h2 id="stage-4-title">Select Topics (Stage 4)</h2>
            <p>Choose a topic card, configure its question types, then submit your Stage 4 selection.</p>
          </div>
          <button type="button" class="builder-modal-close" data-control-action="cancel-stage-4" aria-label="Close">×</button>
        </div>

        ${renderStage4Summary()}

        ${stage4Status ? `<p class="stage4-status">${escapeHtml(stage4Status)}</p>` : ""}

        <div class="stage-topic-card-grid" aria-label="Stage 4 topics">
          ${Object.entries(TOPICS).map(([topicId, topic]) => renderTopicCard(topicId, topic, "stage4")).join("")}
        </div>

        <div class="builder-modal-actions">
          <button type="button" class="builder-submit" data-control-action="submit-stage-4">Submit Stage 4 topics</button>
          <button type="button" class="builder-cancel" data-control-action="cancel-stage-4">Cancel</button>
        </div>
      </section>
    </div>
  `;
}

function renderTopicConfigureModal() {
  const topicId = activeTopicId;
  const stage = activeTopicStage || "stage4";
  const topicRegistry = getTopicRegistryForStage(stage);
  const topic = topicRegistry[topicId];

  if (!topic) {
    activeModal = stage === "stage5" ? "stage-5" : "stage-4";
    activeTopicId = null;
    return stage === "stage5" ? renderStage5TopicsModal() : renderStage4TopicsModal();
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
              <p>Select the question types you want included for this ${stage === "stage5" ? "Stage 5" : "Stage 4"} topic.</p>
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

function renderStage5TopicsModal() {
  return `
    <div class="builder-modal-backdrop" role="presentation">
      <section class="builder-modal builder-modal-wide stage4-modal" role="dialog" aria-modal="true" aria-labelledby="stage-5-title">
        <div class="builder-modal-header">
          <div>
            <h2 id="stage-5-title">Select Topics (Stage 5)</h2>
            <p>Choose a Stage 5 topic card, configure its question types, then submit your Stage 5 selection.</p>
          </div>
          <button type="button" class="builder-modal-close" data-control-action="cancel-stage-5" aria-label="Close">×</button>
        </div>

        ${renderStage5Summary()}

        ${stage5Status ? `<p class="stage4-status">${escapeHtml(stage5Status)}</p>` : ""}

        <div class="stage-topic-card-grid" aria-label="Stage 5 topics">
          ${Object.entries(STAGE5_TOPICS).map(([topicId, topic]) => renderTopicCard(topicId, topic, "stage5")).join("")}
        </div>

        <div class="builder-modal-actions">
          <button type="button" class="builder-submit" data-control-action="submit-stage-5">Submit Stage 5 topics</button>
          <button type="button" class="builder-cancel" data-control-action="cancel-stage-5">Cancel</button>
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
  draftConfig.language = String(formData.get("language") || "en");
  draftConfig.answersFormat = String(formData.get("answersFormat") || getDefaultAnswersFormatForTemplate(draftConfig.template));
  draftConfig.multipleChoiceCount = Number(formData.get("multipleChoiceCount") || 0);
  draftConfig.instructions = String(formData.get("instructions") || "")
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  openWizard("topics");
}

function applyWizardTopicSelections() {
  draftConfig.selectedTopics = cloneSelectedTopics(stage4DraftTopics || {});
  draftConfig.selectedStage5Topics = cloneSelectedTopics(stage5DraftTopics || {});

  if (!draftConfig.examSubtitle?.trim()) {
    draftConfig.examSubtitle = buildSubtitleFromSelectedTopics(
      draftConfig.selectedTopics,
      draftConfig.selectedStage5Topics
    );
  }
}

function submitExamDetails(form) {
  const formData = new FormData(form);

  draftConfig.school = String(formData.get("school") || "").trim() || DEFAULT_SCHOOL;
  draftConfig.examTitle = String(formData.get("examTitle") || "").trim() || "Mathematics Worksheet";
  draftConfig.examSubtitle = String(formData.get("examSubtitle") || "").trim();
  draftConfig.timeAllowed = String(formData.get("timeAllowed") || "").trim();
  draftConfig.calculator = formData.has("calculator");
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
    currentExam.subtitle = draftConfig.examSubtitle || buildSubtitleFromSelectedTopics(draftConfig.selectedTopics, draftConfig.selectedStage5Topics);
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
    if (stage === "stage5") {
      stage5Status = "Select at least one question type, or press Cancel to leave this topic unselected.";
    } else {
      stage4Status = "Select at least one question type, or press Cancel to leave this topic unselected.";
    }
    renderControlDashboard();
    return;
  }

  if (stage === "stage5") {
    if (!stage5DraftTopics) {
      stage5DraftTopics = cloneSelectedTopics(draftConfig.selectedStage5Topics);
    }

    stage5DraftTopics[topicId] = {
      count,
      allowedTypes: selectedTypeIds
    };

    activeModal = wizardActive ? "wizard-topics" : "stage-5";
    stage5Status = `${topic.label} saved.`;
  } else {
    if (!stage4DraftTopics) {
      stage4DraftTopics = cloneSelectedTopics(draftConfig.selectedTopics);
    }

    stage4DraftTopics[topicId] = {
      count,
      allowedTypes: selectedTypeIds
    };

    activeModal = wizardActive ? "wizard-topics" : "stage-4";
    stage4Status = `${topic.label} saved.`;
  }

  activeTopicId = null;
  activeTopicStage = stage;
  renderControlDashboard();
}

function submitStage4Topics() {
  const selectedTopics = cloneSelectedTopics(stage4DraftTopics || {});
  draftConfig.selectedTopics = selectedTopics;

  if (!draftConfig.examSubtitle?.trim()) {
    draftConfig.examSubtitle = buildSubtitleFromSelectedTopics(selectedTopics, draftConfig.selectedStage5Topics);
  }

  activeModal = null;
  activeTopicId = null;
  stage4DraftTopics = null;
  stage4Status = "";
  controlsStatus = `${Object.keys(selectedTopics).length} Stage 4 topic${Object.keys(selectedTopics).length === 1 ? "" : "s"} selected.${currentExam ? " Click Regenerate before printing/exporting to apply these topic changes." : ""}`;
  if (currentExam) {
    editorStatus = "Topic selections changed. The displayed document still shows the previous generated questions until you click Regenerate.";
  }
  renderControlDashboard();
}

function cancelStage4Topics() {
  activeModal = null;
  activeTopicId = null;
  stage4DraftTopics = null;
  stage4Status = "";
  controlsStatus = "Stage 4 topic selection cancelled.";
  renderControlDashboard();
}

function submitStage5Topics() {
  const selectedTopics = cloneSelectedTopics(stage5DraftTopics || {});
  draftConfig.selectedStage5Topics = selectedTopics;

  if (!draftConfig.examSubtitle?.trim()) {
    draftConfig.examSubtitle = buildSubtitleFromSelectedTopics(draftConfig.selectedTopics, selectedTopics);
  }

  activeModal = null;
  activeTopicId = null;
  activeTopicStage = "stage5";
  stage5DraftTopics = null;
  stage5Status = "";
  controlsStatus = `${Object.keys(selectedTopics).length} Stage 5 topic${Object.keys(selectedTopics).length === 1 ? "" : "s"} selected.${currentExam ? " Click Regenerate before printing/exporting to apply these topic changes." : ""}`;
  if (currentExam) {
    editorStatus = "Topic selections changed. The displayed document still shows the previous generated questions until you click Regenerate.";
  }
  renderControlDashboard();
}

function cancelStage5Topics() {
  activeModal = null;
  activeTopicId = null;
  activeTopicStage = "stage5";
  stage5DraftTopics = null;
  stage5Status = "";
  controlsStatus = "Stage 5 topic selection cancelled.";
  renderControlDashboard();
}

function validateBeforeGenerate() {
  const stage4TopicCount = Object.keys(draftConfig.selectedTopics || {}).length;
  const stage5TopicCount = Object.keys(draftConfig.selectedStage5Topics || {}).length;
  const hasTopics = stage4TopicCount + stage5TopicCount > 0;

  const stage4ExtendedCount = Object.values(draftConfig.selectedTopics || {})
    .reduce((sum, topicConfig) => sum + Number(topicConfig.count || 0), 0);
  const stage5ExtendedCount = Object.values(draftConfig.selectedStage5Topics || {})
    .reduce((sum, topicConfig) => sum + Number(topicConfig.count || 0), 0);
  const extendedCount = stage4ExtendedCount + stage5ExtendedCount;

  const mcCount = Number(draftConfig.multipleChoiceCount || 0);

  if (!hasTopics) {
    return "Open Choose Topics and select at least one Stage 4 or Stage 5 topic before generating.";
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
      stage4Status = warning;
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

  if (action === "open-stage-4") {
    stage4DraftTopics = cloneSelectedTopics(draftConfig.selectedTopics);
    stage4Status = "";
    activeTopicId = null;
    activeTopicStage = "stage4";
    activeModal = "stage-4";
    renderControlDashboard();
    return;
  }

  if (action === "open-stage-5") {
    stage5DraftTopics = cloneSelectedTopics(draftConfig.selectedStage5Topics);
    stage5Status = "";
    activeTopicId = null;
    activeTopicStage = "stage5";
    activeModal = "stage-5";
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

  if (action === "cancel-stage-4") {
    cancelStage4Topics();
    return;
  }

  if (action === "submit-stage-4") {
    submitStage4Topics();
    return;
  }

  if (action === "cancel-stage-5") {
    cancelStage5Topics();
    return;
  }

  if (action === "submit-stage-5") {
    submitStage5Topics();
    return;
  }

  if (action === "open-topic-config") {
    const stage = button.dataset.topicStage || "stage4";

    if (stage === "stage5") {
      if (!stage5DraftTopics) {
        stage5DraftTopics = cloneSelectedTopics(draftConfig.selectedStage5Topics);
      }
      stage5Status = "";
    } else {
      if (!stage4DraftTopics) {
        stage4DraftTopics = cloneSelectedTopics(draftConfig.selectedTopics);
      }
      stage4Status = "";
    }

    activeTopicId = button.dataset.topicId;
    activeTopicStage = stage;
    activeModal = "topic-config";
    renderControlDashboard();
    return;
  }

  if (action === "cancel-topic-config") {
    activeTopicId = null;
    activeModal = wizardActive
      ? "wizard-topics"
      : (activeTopicStage === "stage5" ? "stage-5" : "stage-4");
    renderControlDashboard();
    return;
  }

  if (action === "clear-topic-selection") {
    const topicId = button.dataset.topicId;
    const stage = button.dataset.topicStage || "stage4";

    if (stage === "stage5") {
      if (!stage5DraftTopics) {
        stage5DraftTopics = cloneSelectedTopics(draftConfig.selectedStage5Topics);
      }

      delete stage5DraftTopics[topicId];
      stage5Status = "Topic cleared.";
    } else {
      if (!stage4DraftTopics) {
        stage4DraftTopics = cloneSelectedTopics(draftConfig.selectedTopics);
      }

      delete stage4DraftTopics[topicId];
      stage4Status = "Topic cleared.";
    }

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
    submitStage4Topics();
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

function buildSubtitleFromSelectedTopics(selectedTopics = {}, selectedStage5Topics = {}) {
  const stage4Labels = Object.keys(selectedTopics || {})
    .map(topicId => TOPICS[topicId]?.label)
    .filter(Boolean);

  const stage5Labels = Object.keys(selectedStage5Topics || {})
    .map(topicId => STAGE5_TOPICS[topicId]?.label)
    .filter(Boolean);

  const labels = [...stage4Labels, ...stage5Labels];

  return labels.length ? labels.join(" and ") : "Mathematics";
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
