/*
  Topic Question Generator — Exam Renderer
  --------------------------------
  Assembles questions into a printable document.
*/

import { validateQuestionList } from "../schemas/question.schema.js";
import { renderQuestion, hydrateQuestionDiagrams, renderMathText } from "./question-renderer.js";
import {
  renderBilingualHtml,
  localizeInstruction,
  localizeQuestionForLanguage
} from "../utils/translation.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function totalMarks(questions) {
  return questions.reduce((sum, question) => sum + Number(question.marks || 0), 0);
}

function getMultipleChoiceQuestions(exam) {
  return (exam.questions || []).filter(question => question.kind === "multiple-choice");
}

function getExtendedResponseQuestions(exam) {
  return (exam.questions || []).filter(question => question.kind !== "multiple-choice");
}

function getExamLanguage(exam, renderOptions = {}) {
  return renderOptions.language || exam.language || exam.options?.language || "en";
}

function getExamTemplate(exam, renderOptions = {}) {
  return renderOptions.template || exam.template || exam.options?.template || "hsc-style";
}

function getTemplateClass(template = "hsc-style") {
  if (template === "class-test") return " template-class-test";
  if (template === "revision-package") return " template-revision-package";
  if (template === "worksheet") return " template-worksheet";
  if (template === "textbook-template") return " template-textbook";
  return " template-hsc-style";
}

function localizeQuestions(questions, language = "en") {
  return (questions || []).map(question => localizeQuestionForLanguage(question, language));
}

function uiText(text, language = "en") {
  return renderBilingualHtml(text, language);
}

function localizeSectionInstruction(instruction, language = "en") {
  if (!instruction) return "";

  const match = String(instruction).match(/^For questions (\d+) to (\d+), answer in the spaces provided\.$/);

  if (match && language !== "en") {
    const translated = language === "ar"
      ? `للأسئلة ${match[1]} إلى ${match[2]}، أجب في المساحات المخصصة.`
      : `برای پرسش‌های ${match[1]} تا ${match[2]}، در فضاهای داده‌شده پاسخ دهید.`;

    return renderBilingualHtml(instruction, language, translated);
  }

  return renderBilingualHtml(instruction, language);
}

function renderCover(exam, language = "en") {
  return `
    <section class="exam-cover">
      <div>
        <div class="exam-brand">${escapeHtml(exam.school || "[School name]")}</div>
        <h1>${escapeHtml(exam.title || "Mathematics Question Set")}</h1>
        <p class="exam-subtitle">${escapeHtml(exam.subtitle || "")}</p>
      </div>

      <div class="exam-info-grid">
        <div><strong>${uiText("Time allowed", language)}</strong><span>${escapeHtml(exam.timeAllowed || "_____")}</span></div>
        <div><strong>${uiText("Total marks", language)}</strong><span>${totalMarks(exam.questions)}</span></div>
        <div><strong>${uiText("Calculator", language)}</strong><span>${escapeHtml(exam.calculator || "As directed by teacher")}</span></div>
      </div>

      <div class="student-lines">
        <label>${uiText("Name", language)} <span></span></label>
        <label>${uiText("Class", language)} <span></span></label>
        <label>${uiText("Date", language)} <span></span></label>
      </div>

      ${(exam.instructions && exam.instructions.length) ? `
      <div class="instructions">
        <h2>${uiText("Instructions", language)}</h2>
        <ul>
          ${exam.instructions.map(item => `<li>${localizeInstruction(item, language)}</li>`).join("")}
        </ul>
      </div>
      ` : ""}
    </section>
  `;
}

function renderQuestionSection({
  title,
  subtitle,
  instruction = "",
  questions,
  startNumber = 1,
  options = {},
  extraClass = "",
  language = "en"
}) {
  if (!questions.length) return "";

  return `
    <section class="exam-section ${escapeHtml(extraClass)}">
      <header class="section-header">
        <h2>${renderBilingualHtml(title, language)}</h2>
        ${subtitle ? `<p>${renderBilingualHtml(subtitle, language)}</p>` : ""}
        ${instruction ? `<p class="section-instruction">${localizeSectionInstruction(instruction, language)}</p>` : ""}
      </header>

      <div class="question-list">
        ${questions.map((question, index) => renderQuestion(question, startNumber + index, {
          ...options,
          canMoveUp: index > 0,
          canMoveDown: index < questions.length - 1
        })).join("")}
      </div>
    </section>
  `;
}

function renderQuestions(exam, renderOptions = {}) {
  const language = getExamLanguage(exam, renderOptions);
  const allQuestions = localizeQuestions(exam.questions || [], language);
  const multipleChoiceQuestions = allQuestions.filter(question => question.kind === "multiple-choice");
  const extendedResponseQuestions = allQuestions.filter(question => question.kind !== "multiple-choice");

  if (!multipleChoiceQuestions.length) {
    return renderQuestionSection({
      title: exam.sectionTitle || "Section I",
      subtitle: exam.sectionSubtitle || "Answer all questions. Show working where appropriate.",
      questions: allQuestions,
      startNumber: 1,
      options: {
        ...exam.options,
        ...renderOptions
      },
      language
    });
  }

  const extendedStart = multipleChoiceQuestions.length + 1;
  const extendedEnd = allQuestions.length;

  return `
    ${renderQuestionSection({
      title: "Section I - Multiple choice",
      subtitle: "Select the alternative A, B, C or D that best answers each question.",
      questions: multipleChoiceQuestions,
      startNumber: 1,
      options: {
        ...exam.options,
        ...renderOptions
      },
      language
    })}

    ${renderQuestionSection({
      title: "Section II - Extended response",
      instruction: extendedResponseQuestions.length
        ? `For questions ${extendedStart} to ${extendedEnd}, answer in the spaces provided.`
        : "",
      questions: extendedResponseQuestions,
      startNumber: extendedStart,
      options: {
        ...exam.options,
        ...renderOptions
      },
      extraClass: "section-break-before",
      language
    })}
  `;
}

function renderMcInstructionOvals({ selected = null, crossed = null, correct = null } = {}) {
  return ["A", "B", "C", "D"].map(letter => `
    <span class="mc-demo-option">
      <span class="mc-demo-letter">${letter}</span>
      <span class="mc-demo-oval${selected === letter ? " is-filled" : ""}${crossed === letter ? " is-crossed" : ""}"></span>
      ${correct === letter ? `<span class="mc-correct-arrow">correct</span>` : ""}
    </span>
  `).join("");
}

function renderMultipleChoiceInstructions(language = "en") {
  return `
    <div class="mc-instructions-box">
      <p>
        ${renderBilingualHtml("Select the alternative A, B, C or D that best answers the question.", language)}
        ${renderBilingualHtml("Fill in the response oval completely.", language)}
      </p>

      <div class="mc-sample-line">
        <strong>Sample</strong>
        <span>2 + 4 = ?</span>
        <span><strong>(A)</strong> 2</span>
        <span><strong>(B)</strong> 6</span>
        <span><strong>(C)</strong> 8</span>
        <span><strong>(D)</strong> 9</span>
      </div>

      <div class="mc-demo-row">
        ${renderMcInstructionOvals({ selected: "B" })}
      </div>

      <p>
        ${renderBilingualHtml("If you think you have made a mistake, put a cross through the incorrect answer and fill in the new answer.", language)}
      </p>

      <div class="mc-demo-row">
        ${renderMcInstructionOvals({ selected: "A", crossed: "B" })}
      </div>

      <p>
        ${renderBilingualHtml("If you change your mind and have crossed out what you consider to be the correct answer, then indicate this by writing the word correct and drawing an arrow.", language)}
      </p>

      <div class="mc-demo-row">
        ${renderMcInstructionOvals({ selected: "B", crossed: "A", correct: "B" })}
      </div>
    </div>
  `;
}

function renderMcResponseRow(number) {
  return `
    <div class="mc-response-row">
      <span class="mc-response-number">${number}.</span>
      ${["A", "B", "C", "D"].map(letter => `
        <span class="mc-response-option">
          <span class="mc-response-letter">${letter}</span>
          <span class="mc-response-oval"></span>
        </span>
      `).join("")}
    </div>
  `;
}

function renderMultipleChoiceAnswerSheet(exam, language = "en") {
  const multipleChoiceCount = getMultipleChoiceQuestions(exam).length;

  if (!multipleChoiceCount) return "";

  const rows = Array.from({ length: multipleChoiceCount }, (_, index) => renderMcResponseRow(index + 1)).join("");

  return `
    <section class="mc-answer-sheet">
      <header class="mc-answer-header">
        <h1>${escapeHtml(exam.title || "Mathematics Question Set")} ${renderBilingualHtml("Multiple Choice answer sheet", language)}</h1>
      </header>

      ${renderMultipleChoiceInstructions(language)}

      <div class="mc-student-number-line">
        <strong>${uiText("Student Number:", language)}</strong>
        <span></span>
      </div>

      <p class="mc-response-instruction">
        ${renderBilingualHtml("Completely fill the response oval representing the most correct answer.", language)}
      </p>

      <div class="mc-response-grid" aria-label="Multiple choice answer sheet">
        ${rows}
      </div>
    </section>
  `;
}


function renderClassTestHeader(exam, language = "en") {
  return `
    <header class="class-test-header">
      <div class="class-test-title-row">
        <div>
          <div class="class-test-brand">${escapeHtml(exam.school || "[School name]")}</div>
          <h1>${escapeHtml(exam.title || "Mathematics Class Test")}</h1>
          ${exam.subtitle ? `<p class="class-test-subtitle">${escapeHtml(exam.subtitle)}</p>` : ""}
        </div>

        <div class="class-test-mark-box">
          <strong>${totalMarks(exam.questions)}</strong>
          <span>${uiText("Total marks", language)}</span>
        </div>
      </div>

      <div class="class-test-info-grid">
        <div><strong>${uiText("Name", language)}</strong><span></span></div>
        <div><strong>${uiText("Class", language)}</strong><span></span></div>
        <div><strong>${uiText("Date", language)}</strong><span></span></div>
        <div><strong>${uiText("Time allowed", language)}</strong><em>${escapeHtml(exam.timeAllowed || "_____")}</em></div>
        <div><strong>${uiText("Calculator", language)}</strong><em>${escapeHtml(exam.calculator || "As directed by teacher")}</em></div>
      </div>

      ${(exam.instructions && exam.instructions.length) ? `
      <div class="class-test-instructions">
        <strong>${uiText("Instructions", language)}</strong>
        <ul>
          ${exam.instructions.map(item => `<li>${localizeInstruction(item, language)}</li>`).join("")}
        </ul>
      </div>
      ` : ""}
    </header>
  `;
}

function renderClassTestSectionHeader(title, subtitle = "", language = "en") {
  return `
    <header class="class-test-section-header">
      <h2>${renderBilingualHtml(title, language)}</h2>
      ${subtitle ? `<p>${renderBilingualHtml(subtitle, language)}</p>` : ""}
    </header>
  `;
}

function renderClassTestQuestionList(questions, startNumber = 1, options = {}) {
  if (!questions.length) return "";

  return `
    <div class="question-list class-test-question-list">
      ${questions.map((question, index) => renderQuestion(question, startNumber + index, {
        ...options,
        canMoveUp: index > 0,
        canMoveDown: index < questions.length - 1
      })).join("")}
    </div>
  `;
}


function renderClassTestExtendedQuestions(questions, startNumber = 1, options = {}) {
  if (!questions.length) return "";

  return `
    <div class="question-list class-test-question-list">
      ${questions.map((question, index) => `
        ${index > 0 ? '<hr class="question-separator">' : ""}
        ${renderQuestion(question, startNumber + index, {
          ...options,
          canMoveUp: index > 0,
          canMoveDown: index < questions.length - 1
        })}
      `).join("")}
    </div>
  `;
}

function renderClassTestQuestions(exam, renderOptions = {}) {
  const language = getExamLanguage(exam, renderOptions);
  const allQuestions = localizeQuestions(exam.questions || [], language);
  const multipleChoiceQuestions = allQuestions.filter(question => question.kind === "multiple-choice");
  const extendedResponseQuestions = allQuestions.filter(question => question.kind !== "multiple-choice");
  const sharedOptions = {
    ...exam.options,
    ...renderOptions
  };

  const mcSection = multipleChoiceQuestions.length
    ? `
      <section class="class-test-section class-test-multiple-choice-section">
        ${renderClassTestSectionHeader(
          "Multiple choice",
          "Circle the alternative A, B, C or D that best answers each question.",
          language
        )}
        ${renderClassTestQuestionList(multipleChoiceQuestions, 1, sharedOptions)}
      </section>
    `
    : "";

  const extendedStart = multipleChoiceQuestions.length + 1;
  const extendedSection = extendedResponseQuestions.length
    ? `
      <section class="class-test-section class-test-extended-section">
        ${renderClassTestSectionHeader(
          multipleChoiceQuestions.length ? "Short answer" : "Questions",
          "Answer in the spaces provided.",
          language
        )}
        ${renderClassTestExtendedQuestions(extendedResponseQuestions, extendedStart, sharedOptions)}
      </section>
    `
    : "";

  return `${mcSection}${extendedSection}`;
}

function renderClassTestExam(exam, renderOptions = {}) {
  const language = getExamLanguage(exam, renderOptions);

  return `
    <main class="exam-document${getTemplateClass("class-test")}${renderOptions.editMode ? " is-edit-mode" : ""}">
      <section class="exam-section class-test-page">
        ${renderClassTestHeader(exam, language)}
        ${renderClassTestQuestions(exam, { ...renderOptions, language })}
      </section>
    </main>
  `;
}

function renderRevisionPackageHeader(exam, language = "en") {
  return `
    <header class="revision-package-header">
      <div class="revision-package-title-block">
        <div class="revision-package-school">${escapeHtml(exam.school || "[School name]")}</div>
        <h1>${escapeHtml(exam.title || "Revision Package")}</h1>
      </div>

      <div class="revision-package-name-line">
        <strong>${uiText("Name", language)}</strong>
        <span></span>
      </div>
    </header>
  `;
}

function renderRevisionPackageQuestions(exam, renderOptions = {}) {
  const language = getExamLanguage(exam, renderOptions);
  const allQuestions = localizeQuestions(exam.questions || [], language);
  const multipleChoiceQuestions = allQuestions.filter(question => question.kind === "multiple-choice");
  const extendedResponseQuestions = allQuestions.filter(question => question.kind !== "multiple-choice");
  const sharedOptions = {
    ...exam.options,
    ...renderOptions,
    showMarks: false
  };

  const mcSection = multipleChoiceQuestions.length
    ? `
      <section class="revision-package-section revision-package-multiple-choice-section">
        ${renderClassTestSectionHeader(
          "Multiple choice",
          "Circle the alternative A, B, C or D that best answers each question.",
          language
        )}
        ${renderClassTestQuestionList(multipleChoiceQuestions, 1, sharedOptions)}
      </section>
    `
    : "";

  const extendedStart = multipleChoiceQuestions.length + 1;
  const extendedSection = extendedResponseQuestions.length
    ? `
      <section class="revision-package-section revision-package-question-section">
        ${renderClassTestSectionHeader(
          multipleChoiceQuestions.length ? "Questions" : "Questions",
          "Answer in the spaces provided.",
          language
        )}
        ${renderClassTestExtendedQuestions(extendedResponseQuestions, extendedStart, sharedOptions)}
      </section>
    `
    : "";

  return `${mcSection}${extendedSection}`;
}

function renderRevisionPackageExam(exam, renderOptions = {}) {
  const language = getExamLanguage(exam, renderOptions);

  return `
    <main class="exam-document${getTemplateClass("revision-package")}${renderOptions.editMode ? " is-edit-mode" : ""}">
      <section class="exam-section revision-package-page">
        ${renderRevisionPackageHeader(exam, language)}
        ${renderRevisionPackageQuestions(exam, { ...renderOptions, language })}
      </section>
    </main>
  `;
}


/* ──────────────────────────────────────────────────────────
   WORKSHEET TEMPLATE
   Exercise-sheet layout: individual questions, ruled answer
   boxes, school/title/topic/name/date header. No marks.
────────────────────────────────────────────────────────── */

function renderWorksheetHeader(exam, language = "en") {
  return `
    <header class="worksheet-header">
      <div class="worksheet-header-top">
        <div>
          <div class="worksheet-school">${escapeHtml(exam.school || "[School name]")}</div>
          <h1>${escapeHtml(exam.title || "Worksheet")}</h1>
          ${exam.subtitle ? `<p class="worksheet-topic">${escapeHtml(exam.subtitle)}</p>` : ""}
        </div>
      </div>
      <div class="worksheet-header-fields">
        <div class="worksheet-field">
          <strong>${uiText("Name", language)}</strong>
          <span></span>
        </div>
        <div class="worksheet-field">
          <strong>${uiText("Date", language)}</strong>
          <span></span>
        </div>
      </div>
    </header>
  `;
}

function renderWorksheetSectionHeader(title, subtitle = "", language = "en") {
  return `
    <header class="worksheet-section-header">
      <h2>${renderBilingualHtml(title, language)}</h2>
      ${subtitle ? `<p>${renderBilingualHtml(subtitle, language)}</p>` : ""}
    </header>
  `;
}

function renderWorksheetQuestions(exam, renderOptions = {}) {
  const language = getExamLanguage(exam, renderOptions);
  const allQuestions = localizeQuestions(exam.questions || [], language);
  const multipleChoiceQuestions = allQuestions.filter(q => q.kind === "multiple-choice");
  const extendedResponseQuestions = allQuestions.filter(q => q.kind !== "multiple-choice");
  const sharedOptions = {
    ...exam.options,
    ...renderOptions,
    showMarks: false
  };

  const mcSection = multipleChoiceQuestions.length
    ? `
      <section class="worksheet-section">
        ${renderWorksheetSectionHeader(
          "Multiple choice",
          "Circle the alternative A, B, C or D that best answers each question.",
          language
        )}
        <div class="question-list">
          ${multipleChoiceQuestions.map((q, i) => renderQuestion(q, i + 1, {
            ...sharedOptions,
            canMoveUp: i > 0,
            canMoveDown: i < multipleChoiceQuestions.length - 1
          })).join("")}
        </div>
      </section>
    `
    : "";

  const extendedStart = multipleChoiceQuestions.length + 1;
  const extendedSection = extendedResponseQuestions.length
    ? `
      <section class="worksheet-section">
        ${renderWorksheetSectionHeader(
          multipleChoiceQuestions.length ? "Questions" : "Questions",
          "Show all working.",
          language
        )}
        <div class="question-list">
          ${extendedResponseQuestions.map((q, i) => renderQuestion(q, extendedStart + i, {
            ...sharedOptions,
            canMoveUp: i > 0,
            canMoveDown: i < extendedResponseQuestions.length - 1
          })).join("")}
        </div>
      </section>
    `
    : "";

  return `${mcSection}${extendedSection}`;
}

function renderWorksheetExam(exam, renderOptions = {}) {
  const language = getExamLanguage(exam, renderOptions);

  return `
    <main class="exam-document${getTemplateClass("worksheet")}${renderOptions.editMode ? " is-edit-mode" : ""}">
      <section class="exam-section worksheet-page">
        ${renderWorksheetHeader(exam, language)}
        ${renderWorksheetQuestions(exam, { ...renderOptions, language })}
      </section>
    </main>
  `;
}


/* ──────────────────────────────────────────────────────────
   TEXTBOOK TEMPLATE
   No answer spaces. Clean numbered question list.
   Designed for printed exercises. No marks shown.
────────────────────────────────────────────────────────── */

function renderTextbookHeader(exam, language = "en") {
  return `
    <header class="textbook-header">
      <div class="textbook-school">${escapeHtml(exam.school || "[School name]")}</div>
      <h1>${escapeHtml(exam.title || "Exercise Set")}</h1>
      ${exam.subtitle ? `<p class="textbook-topic">${escapeHtml(exam.subtitle)}</p>` : ""}
    </header>
  `;
}

function renderTextbookSectionHeader(title, subtitle = "", language = "en") {
  return `
    <div class="textbook-section-header">
      <h2>${renderBilingualHtml(title, language)}</h2>
      ${subtitle ? `<p>${renderBilingualHtml(subtitle, language)}</p>` : ""}
    </div>
  `;
}

function renderTextbookQuestions(exam, renderOptions = {}) {
  const language = getExamLanguage(exam, renderOptions);
  const allQuestions = localizeQuestions(exam.questions || [], language);
  const multipleChoiceQuestions = allQuestions.filter(q => q.kind === "multiple-choice");
  const extendedResponseQuestions = allQuestions.filter(q => q.kind !== "multiple-choice");
  const sharedOptions = {
    ...exam.options,
    ...renderOptions,
    showMarks: false,
    hideAnswerSpace: true
  };

  const mcSection = multipleChoiceQuestions.length
    ? `
      <section class="textbook-section">
        ${renderTextbookSectionHeader(
          "Multiple choice",
          "Select the alternative A, B, C or D that best answers each question.",
          language
        )}
        <div class="question-list">
          ${multipleChoiceQuestions.map((q, i) => renderQuestion(q, i + 1, {
            ...sharedOptions,
            canMoveUp: i > 0,
            canMoveDown: i < multipleChoiceQuestions.length - 1
          })).join("")}
        </div>
      </section>
    `
    : "";

  const extendedStart = multipleChoiceQuestions.length + 1;
  const extendedSection = extendedResponseQuestions.length
    ? `
      <section class="textbook-section">
        ${renderTextbookSectionHeader(
          multipleChoiceQuestions.length ? "Questions" : "Questions",
          "",
          language
        )}
        <div class="question-list">
          ${extendedResponseQuestions.map((q, i) => renderQuestion(q, extendedStart + i, {
            ...sharedOptions,
            canMoveUp: i > 0,
            canMoveDown: i < extendedResponseQuestions.length - 1
          })).join("")}
        </div>
      </section>
    `
    : "";

  return `${mcSection}${extendedSection}`;
}

function renderTextbookExam(exam, renderOptions = {}) {
  const language = getExamLanguage(exam, renderOptions);

  return `
    <main class="exam-document${getTemplateClass("textbook-template")}${renderOptions.editMode ? " is-edit-mode" : ""}">
      <section class="exam-section textbook-page">
        ${renderTextbookHeader(exam, language)}
        ${renderTextbookQuestions(exam, { ...renderOptions, language })}
      </section>
    </main>
  `;
}


export function renderExam(target, exam, renderOptions = {}) {
  const container = typeof target === "string" ? document.getElementById(target) : target;

  if (!container) {
    throw new Error("renderExam target was not found.");
  }

  const language = getExamLanguage(exam, renderOptions);

  validateQuestionList(localizeQuestions(exam.questions || [], "en"));

  const template = getExamTemplate(exam, renderOptions);

  if (template === "class-test") {
    container.innerHTML = renderClassTestExam(exam, { ...renderOptions, language, template });
  } else if (template === "revision-package") {
    container.innerHTML = renderRevisionPackageExam(exam, { ...renderOptions, language, template });
  } else if (template === "worksheet") {
    container.innerHTML = renderWorksheetExam(exam, { ...renderOptions, language, template });
  } else if (template === "textbook-template") {
    container.innerHTML = renderTextbookExam(exam, { ...renderOptions, language, template });
  } else {
    container.innerHTML = `
      <main class="exam-document${getTemplateClass(template)}${renderOptions.editMode ? " is-edit-mode" : ""}">
        ${renderCover(exam, language)}
        ${renderQuestions(exam, { ...renderOptions, language, template })}
        ${renderMultipleChoiceAnswerSheet(exam, language)}
      </main>
    `;
  }

  hydrateQuestionDiagrams(container);
}

export function createExam({
  school = "[School name]",
  title = "Mathematics Exam",
  subtitle = "",
  timeAllowed = "45 minutes",
  calculator = "Teacher discretion",
  language = "en",
  sectionTitle = "Section I",
  sectionSubtitle = "Answer all questions. Show working where appropriate.",
  instructions = null,
  questions = [],
  multipleChoiceCount = null,
  template = "hsc-style",
  answersFormat = "hsc",
  options = {}
} = {}) {
  return {
    school,
    title,
    subtitle,
    timeAllowed,
    calculator,
    language,
    sectionTitle,
    sectionSubtitle,
    instructions,
    questions,
    multipleChoiceCount,
    template,
    answersFormat,
    options
  };
}
