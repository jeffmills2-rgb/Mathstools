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

/*
  Optional teacher setting: start each topic on a new page. Off by default,
  because the dense flow is what makes the exercise templates economical; on
  when the paper is going out as one handout per topic.
*/
function getDocumentModifiers(exam, renderOptions = {}) {
  const topicPageBreaks = renderOptions.topicPageBreaks ?? exam.topicPageBreaks ?? exam.options?.topicPageBreaks;
  return topicPageBreaks === true ? " has-topic-page-breaks" : "";
}

/*
  Width of the question-number column, and therefore the indent everything
  under a prompt should line up with.

  The column was auto-sized per question, so "Q9." and "Q199." produced
  different prompt indents — and diagrams, tables and answer rules used a flat
  6mm that matched neither. On a 240-question paper the ruled lines sat 4mm to
  the left of the text they belonged to, giving every question a ragged left
  edge. Sizing it once from the paper's largest number makes the alignment
  exact without wasting the column on a short paper.
*/
function getDocumentMetrics(exam) {
  const count = (exam.questions || []).length;
  const digits = String(Math.max(1, count)).length;
  const numberWidth = digits >= 4 ? "11mm" : digits === 3 ? "8.5mm" : "6mm";

  return `--question-number-width: ${numberWidth};`;
}

function getTemplateClass(template = "hsc-style") {
  if (template === "class-test") return " template-class-test";
  if (template === "revision-package") return " template-revision-package";
  if (template === "worksheet") return " template-worksheet";
  if (template === "textbook-template") return " template-textbook";
  return " template-hsc-style";
}

function localizeQuestions(questions, language = "en") {
  return suppressRepeatedCaptions(
    (questions || []).map(question => localizeQuestionForLanguage(question, language))
  );
}

/*
  Show each diagram caption once per topic.

  "Each arrow shows one jump." appeared six times, "Temperature at dawn." four,
  "Percentages line up with amounts." three. A caption that repeats on every
  instance stops being read after the first, and it costs a line of vertical
  space each time. The first occurrence within a topic keeps it; later ones drop
  it, and it returns when the topic changes.

  Returns new objects — the exam's own question data is not touched.
*/
function suppressRepeatedCaptions(questions) {
  const seen = new Set();

  return (questions || []).map(question => {
    const caption = question?.diagram?.caption;
    if (!caption) return question;

    const key = `${question.topic || ""}::${caption}`;
    if (!seen.has(key)) {
      seen.add(key);
      return question;
    }

    return {
      ...question,
      diagram: { ...question.diagram, caption: "" }
    };
  });
}

/* ══════════════════════════════════════════════════════════════════════
   TOPIC BANDS
   ----------------------------------------------------------------------
   A multi-topic paper used to run straight from the last fraction question
   into the first integer question with nothing marking the change, so the
   student carried the wrong frame of reference into the new topic and had to
   work out from the question itself that the subject had moved on.

   Every question already carries a human-readable `topic`, so a band can be
   emitted wherever that value changes. A single-topic paper produces no bands
   at all — the header already names the topic, and a lone band would be noise.
   ══════════════════════════════════════════════════════════════════════ */

function renderTopicBand(topic) {
  return `
    <div class="topic-band" role="separator" aria-label="Topic: ${escapeHtml(topic)}">
      <span class="topic-band-label">${escapeHtml(topic)}</span>
    </div>
  `;
}

/*
  Renders a question list, inserting a band at each topic change.
  `renderOne(question, number, indexWithinList)` returns the question's HTML.

  A band and the first question under it are emitted as ONE unbreakable unit.
  Left on its own, a band is just another block in the column flow, and a
  column break can land between it and its questions — which is exactly what
  happened on page 1 of the worksheet: the left column ended with an
  "EQUATIONS" heading and nothing beneath it, while the equations questions
  began unlabelled at the top of the right column. `break-after: avoid` is not
  reliable inside a multi-column flow in Chrome; making the pair a single
  break-inside:avoid box is.
*/
function renderQuestionsWithTopicBands(questions, startNumber, renderOne) {
  const list = questions || [];
  const topics = new Set(list.map(q => q.topic).filter(Boolean));
  const showBands = topics.size > 1;

  let currentTopic = null;

  return list
    .map((question, index) => {
      const rendered = renderOne(question, startNumber + index, index);

      if (!showBands || !question.topic || question.topic === currentTopic) {
        return rendered;
      }

      currentTopic = question.topic;

      return `<div class="topic-band-group">${renderTopicBand(question.topic)}${rendered}</div>`;
    })
    .join("");
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

/*
  A running footer, repeated on every printed page.

  Fourteen pages of questions with nothing identifying them is a problem the
  moment the stack is dropped or a page is photocopied on its own. CSS cannot
  produce page numbers in Chrome — that is what the browser's own "Headers and
  footers" print option is for — but it can repeat a fixed element, which at
  least names the paper on every sheet.
*/
function renderRunningFooter(exam) {
  // Unfilled fields carry a bracketed placeholder so the builder shows where
  // the value goes. A placeholder is useful on screen and noise on paper, so
  // the footer only names fields the teacher actually filled in.
  const isPlaceholder = value => /^\s*\[.*\]\s*$/.test(String(value || ""));

  const parts = [exam.school, exam.title]
    .filter(value => value && !isPlaceholder(value))
    .map(escapeHtml);

  if (!parts.length) return "";

  return `<div class="print-running-footer" aria-hidden="true">${parts.join(" · ")}</div>`;
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
        ${renderQuestionsWithTopicBands(questions, startNumber, (question, number, index) =>
          renderQuestion(question, number, {
            ...options,
            canMoveUp: index > 0,
            canMoveDown: index < questions.length - 1
          }))}
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
      ${renderQuestionsWithTopicBands(questions, startNumber, (question, number, index) =>
        renderQuestion(question, number, {
          ...options,
          canMoveUp: index > 0,
          canMoveDown: index < questions.length - 1
        }))}
    </div>
  `;
}


function renderClassTestExtendedQuestions(questions, startNumber = 1, options = {}) {
  if (!questions.length) return "";

  return `
    <div class="question-list class-test-question-list">
      ${renderQuestionsWithTopicBands(questions, startNumber, (question, number, index) => `
        ${index > 0 ? '<hr class="question-separator">' : ""}
        ${renderQuestion(question, number, {
          ...options,
          canMoveUp: index > 0,
          canMoveDown: index < questions.length - 1
        })}
      `)}
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
    <main class="exam-document${getTemplateClass("class-test")}${getDocumentModifiers(exam, renderOptions)}${renderOptions.editMode ? " is-edit-mode" : ""}" style="${getDocumentMetrics(exam)}">
      <section class="exam-section class-test-page">
        ${renderClassTestHeader(exam, language)}
        ${renderClassTestQuestions(exam, { ...renderOptions, language })}
      </section>
      ${renderRunningFooter(exam)}
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
    <main class="exam-document${getTemplateClass("revision-package")}${getDocumentModifiers(exam, renderOptions)}${renderOptions.editMode ? " is-edit-mode" : ""}" style="${getDocumentMetrics(exam)}">
      <section class="exam-section revision-package-page">
        ${renderRevisionPackageHeader(exam, language)}
        ${renderRevisionPackageQuestions(exam, { ...renderOptions, language })}
      </section>
      ${renderRunningFooter(exam)}
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
    showMarks: false,
    // Answer space sized to the shape of the answer rather than drawn as a
    // full-width ruled block. See resolveAnswerSpace().
    answerStyle: "compact"
  };

  const mcSection = multipleChoiceQuestions.length
    ? `
      <section class="worksheet-section">
        ${renderWorksheetSectionHeader(
          "Multiple choice",
          "Circle the alternative A, B, C or D that best answers each question.",
          language
        )}
        <div class="question-list question-list-mc">
          ${renderQuestionsWithTopicBands(multipleChoiceQuestions, 1, (q, n, i) =>
            renderQuestion(q, n, {
              ...sharedOptions,
              canMoveUp: i > 0,
              canMoveDown: i < multipleChoiceQuestions.length - 1
            }))}
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
          ${renderQuestionsWithTopicBands(extendedResponseQuestions, extendedStart, (q, n, i) =>
            renderQuestion(q, n, {
              ...sharedOptions,
              canMoveUp: i > 0,
              canMoveDown: i < extendedResponseQuestions.length - 1
            }))}
        </div>
      </section>
    `
    : "";

  return `${mcSection}${extendedSection}`;
}

function renderWorksheetExam(exam, renderOptions = {}) {
  const language = getExamLanguage(exam, renderOptions);

  return `
    <main class="exam-document${getTemplateClass("worksheet")}${getDocumentModifiers(exam, renderOptions)}${renderOptions.editMode ? " is-edit-mode" : ""}" style="${getDocumentMetrics(exam)}">
      <section class="exam-section worksheet-page">
        ${renderWorksheetHeader(exam, language)}
        ${renderWorksheetQuestions(exam, { ...renderOptions, language })}
      </section>
      ${renderRunningFooter(exam)}
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
        <div class="question-list question-list-mc">
          ${renderQuestionsWithTopicBands(multipleChoiceQuestions, 1, (q, n, i) =>
            renderQuestion(q, n, {
              ...sharedOptions,
              canMoveUp: i > 0,
              canMoveDown: i < multipleChoiceQuestions.length - 1
            }))}
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
          ${renderQuestionsWithTopicBands(extendedResponseQuestions, extendedStart, (q, n, i) =>
            renderQuestion(q, n, {
              ...sharedOptions,
              canMoveUp: i > 0,
              canMoveDown: i < extendedResponseQuestions.length - 1
            }))}
        </div>
      </section>
    `
    : "";

  return `${mcSection}${extendedSection}`;
}

function renderTextbookExam(exam, renderOptions = {}) {
  const language = getExamLanguage(exam, renderOptions);

  return `
    <main class="exam-document${getTemplateClass("textbook-template")}${getDocumentModifiers(exam, renderOptions)}${renderOptions.editMode ? " is-edit-mode" : ""}" style="${getDocumentMetrics(exam)}">
      <section class="exam-section textbook-page">
        ${renderTextbookHeader(exam, language)}
        ${renderTextbookQuestions(exam, { ...renderOptions, language })}
      </section>
      ${renderRunningFooter(exam)}
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
      <main class="exam-document${getTemplateClass(template)}${getDocumentModifiers(exam, renderOptions)}${renderOptions.editMode ? " is-edit-mode" : ""}" style="${getDocumentMetrics(exam)}">
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
