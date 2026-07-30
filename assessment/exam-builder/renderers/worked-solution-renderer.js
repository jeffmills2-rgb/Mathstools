/*
  Topic Question Generator — Worked Solution Renderer
  --------------------------------------------
  Renders a teacher-facing worked-solutions document from workedSolutionData.
*/

import { hydrateQuestionDiagrams } from "./question-renderer.js";
import {
  escapeHtml,
  renderMathText
} from "../utils/solution-formatters.js";

export function renderWorkedSolutions(target, data = {}, options = {}) {
  const container = typeof target === "string" ? document.getElementById(target) : target;

  if (!container) {
    throw new Error("renderWorkedSolutions target was not found.");
  }

  const format = options.format || "hsc";

  if (format === "none") {
    container.innerHTML = "";
    return;
  }

  const questions = Array.isArray(data.questions) ? data.questions : [];

  if (format === "textbook") {
    container.innerHTML = renderTextbookAnswerKey(data, questions);
    return;
  }

  if (format === "class-test") {
    container.innerHTML = renderClassTestAnswerKey(data, questions);
    return;
  }

  container.innerHTML = `
    <main class="worked-solution-document">
      ${renderWorkedCover(data)}
      ${renderMultipleChoiceKey(questions, data)}
      ${renderWorkedQuestionList(questions)}
    </main>
  `;

  hydrateQuestionDiagrams(container);
}

// The concise final answer for an answer-key line.
function finalAnswerFor(question) {
  if (question.kind === "multiple-choice") {
    return question.correctChoice || question.answer || "";
  }
  if (question.answer !== undefined && question.answer !== null && question.answer !== "") {
    return question.answer;
  }
  const working = Array.isArray(question.working) ? question.working.filter(Boolean) : [];
  return working.length ? working[working.length - 1] : "—";
}

// Textbook-style answer key: title heading, then answers only by question number.
function renderTextbookAnswerKey(data, questions) {
  const title = data.examTitle ? `${escapeHtml(data.examTitle)} — Answers` : "Answers";

  return `
    <main class="answers-document answers-textbook">
      <header class="answers-header">
        ${data.school ? `<div class="answers-brand">${escapeHtml(data.school)}</div>` : ""}
        <h1>${title}</h1>
        ${data.subtitle ? `<p class="answers-subtitle">${escapeHtml(data.subtitle)}</p>` : ""}
      </header>
      <ol class="answer-key-list">
        ${questions.map(q => `
          <li class="answer-key-item">
            <span class="ak-num">${q.number}</span>
            <span class="ak-ans">${renderMathText(finalAnswerFor(q))}</span>
          </li>
        `).join("")}
      </ol>
    </main>
  `;
}

// Class-test style answer key: answers with marks, plus a total.
function renderClassTestAnswerKey(data, questions) {
  const title = data.examTitle ? `${escapeHtml(data.examTitle)} — Answers` : "Answers";

  return `
    <main class="answers-document answers-classtest">
      <header class="answers-header">
        ${data.school ? `<div class="answers-brand">${escapeHtml(data.school)}</div>` : ""}
        <h1>${title}</h1>
        <p class="answers-subtitle">Marking answers${data.totalMarks ? ` · Total ${escapeHtml(data.totalMarks)} marks` : ""}</p>
      </header>
      <ol class="answer-key-list answer-key-marks">
        ${questions.map(q => `
          <li class="answer-key-item">
            <span class="ak-num">${q.number}</span>
            <span class="ak-ans">${renderMathText(finalAnswerFor(q))}</span>
            <span class="ak-marks">[${q.marks}]</span>
          </li>
        `).join("")}
      </ol>
    </main>
  `;
}

function renderWorkedCover(data) {
  return `
    <section class="worked-cover">
      <div class="worked-brand">${escapeHtml(data.school || "[School name]")}</div>
      <h1>${escapeHtml(data.title || "Worked Solutions and Marking Criteria")}</h1>
      <p>${escapeHtml(data.subtitle || "")}</p>

      <div class="worked-cover-grid">
        <div><strong>Original document</strong><span>${escapeHtml(data.examTitle || "Mathematics Question Set")}</span></div>
        <div><strong>Total marks</strong><span>${escapeHtml(data.totalMarks ?? "")}</span></div>
        <div><strong>Generated</strong><span>${escapeHtml(data.generatedAt || "")}</span></div>
      </div>

      <div class="worked-note">
        <strong>Teacher copy.</strong>
        The marking criteria and worked solutions are generated from the same question data as the student copy.
        Review any generated item before using it for formal assessment.
      </div>
    </section>
  `;
}

function renderMultipleChoiceKey(questions, data) {
  const mc = questions.filter(question => question.kind === "multiple-choice");

  if (!mc.length) return "";

  return `
    <section class="worked-section worked-mc-key-section">
      <header class="worked-section-header">
        <h2>Section I — Multiple choice answer key</h2>
        <p>Correct alternatives for the multiple choice section.</p>
      </header>

      <table class="worked-mc-key-table">
        <thead>
          <tr>
            <th>Question</th>
            <th>Answer</th>
            <th>Final answer / reason</th>
          </tr>
        </thead>
        <tbody>
          ${mc.map(question => `
            <tr>
              <td>Q${question.number}</td>
              <td><strong>${escapeHtml(question.correctChoice || "")}</strong></td>
              <td>${renderMathText(question.answer || question.working?.[0] || "")}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `;
}

function renderWorkedQuestionList(questions) {
  const extended = questions.filter(question => question.kind !== "multiple-choice");

  if (!extended.length) return "";

  return `
    <section class="worked-section worked-solutions-section">
      <header class="worked-section-header">
        <h2>Section II — Worked solutions and marking criteria</h2>
        <p>Sample answers and suggested marking criteria.</p>
      </header>

      <div class="worked-question-list">
        ${extended.map(renderWorkedQuestion).join("")}
      </div>
    </section>
  `;
}

function renderWorkedQuestion(question) {
  return `
    <article class="worked-question">
      <header class="worked-question-heading">
        <div class="worked-question-number">Q${question.number}</div>
        <div class="worked-question-prompt">${renderMathText(question.prompt)}</div>
        <div class="worked-question-marks">${question.marks} mark${question.marks === 1 ? "" : "s"}</div>
      </header>

      ${renderTable(question.table, "worked-question-table")}
      ${renderDiagram(question.diagram, "worked-diagram")}

      <div class="worked-solution-stack">
        ${renderCriteria(question.criteria)}
        ${renderSampleAnswer(question)}
      </div>
    </article>
  `;
}

function renderDiagram(diagram, className = "worked-diagram") {
  if (!diagram) return "";

  const encodedConfig = encodeURIComponent(JSON.stringify(diagram.config || {}));
  const engine = escapeHtml(diagram.engine || "");

  return `
    <div
      class="${escapeHtml(className)}"
      data-engine="${engine}"
      data-config="${encodedConfig}">
    </div>
  `;
}

function renderTable(table, className = "worked-table") {
  if (!table || !Array.isArray(table.rows) || !table.rows.length) return "";

  const caption = table.caption
    ? `<div class="${escapeHtml(className)}-caption">${renderMathText(table.caption)}</div>`
    : "";

  return `
    <div class="${escapeHtml(className)}-wrap">
      ${caption}
      <table class="${escapeHtml(className)}">
        <tbody>
          ${table.rows.map(row => `
            <tr>
              ${row.map((cell, index) => index === 0
                ? `<th scope="row">${renderMathText(cell)}</th>`
                : `<td>${renderMathText(cell)}</td>`
              ).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderCriteria(criteria = []) {
  if (!Array.isArray(criteria) || !criteria.length) return "";

  return `
    <section class="worked-card worked-criteria-card">
      <h3>Marking criteria</h3>
      <table class="worked-criteria-table">
        <thead>
          <tr>
            <th>Criteria</th>
            <th>Marks</th>
          </tr>
        </thead>
        <tbody>
          ${criteria.map(item => `
            <tr>
              <td>${renderMathText(item.text)}</td>
              <td>${escapeHtml(item.marks)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `;
}

function renderSubpartSolutions(subparts) {
  if (!Array.isArray(subparts) || !subparts.length) return "";

  return `
    <ol class="worked-subparts" style="list-style:none;margin:0 0 6px;padding:0;">
      ${subparts.map(part => `
        <li class="worked-subpart" style="margin:0 0 10px;">
          <div class="worked-subpart-heading" style="font-weight:700;">
            <span>${escapeHtml(part.label)}</span>
            <span> ${renderMathText(part.prompt)}</span>
          </div>
          ${part.diagram ? renderDiagram(part.diagram, "worked-answer-diagram") : ""}
          ${part.working && part.working.length ? `
            <ol class="worked-steps">
              ${part.working.map(step => `<li>${renderMathText(step)}</li>`).join("")}
            </ol>
          ` : ""}
          ${part.answer ? `
            <div class="worked-final-answer">
              <strong>Answer:</strong>
              <span>${renderMathText(part.answer)}</span>
            </div>
          ` : ""}
        </li>
      `).join("")}
    </ol>
  `;
}

function renderSampleAnswer(question) {
  const working = Array.isArray(question.working) ? question.working : [];
  const tableOnly = question.solutionMode === "table-only";
  const hasSubparts = Array.isArray(question.subparts) && question.subparts.length > 0;

  return `
    <section class="worked-card worked-answer-card">
      <h3>Sample answer</h3>

      ${renderSubpartSolutions(question.subparts)}

      ${question.answerDiagram ? `
        <div class="worked-answer-diagram-wrap">
          <div class="worked-answer-diagram-title">Completed diagram</div>
          ${renderDiagram(question.answerDiagram, "worked-answer-diagram")}
        </div>
      ` : ""}

      ${renderTable(question.answerTable, "worked-answer-table")}

      ${working.length ? `
        <ol class="worked-steps">
          ${working.map(step => `<li>${renderMathText(step)}</li>`).join("")}
        </ol>
      ` : ""}

      ${question.answer && !tableOnly ? `
        <div class="worked-final-answer">
          <strong>Final answer:</strong>
          <span>${renderMathText(question.answer)}</span>
        </div>
      ` : ""}
    </section>
  `;
}

export function renderWorkedSolutionsOnly(data = {}) {
  const wrapper = document.createElement("div");
  renderWorkedSolutions(wrapper, data);
  return wrapper.innerHTML;
}
