/*
  Topic Question Generator — Question Renderer
  -------------------------------------
  Converts one shared question object into HTML.

  This file does not generate maths. It only renders the data it receives.
*/

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatLargeNumbers(text) {
  return String(text ?? "").replace(/(?<![\\w.])(-?\\d{1,3}(?:\\d{3})+)(?![\\w.])/g, match => {
    const sign = match.startsWith("-") ? "-" : "";
    const digits = sign ? match.slice(1) : match;
    return sign + digits.replace(/\\B(?=(\\d{3})+(?!\\d))/g, " ");
  });
}

export function renderMathText(value) {
  const formatted = formatLargeNumbers(escapeHtml(value))
    .replace(
      /\[\[frac:(-?\d+):(-?\d+)\]\]/g,
      `<span class="math-frac"><span>$1</span><span>$2</span></span>`
    )
    .replace(
      /\[\[algfrac:([^:\]]+):([^:\]]+)\]\]/g,
      `<span class="math-frac"><span>$1</span><span>$2</span></span>`
    )
    // Safety net: render any other fraction-shaped token [[anything:n:d]] as a
    // fraction (recovers from corrupted token names), then drop any remaining
    // stray [[...]] markup so raw tokens never leak to students.
    .replace(
      /\[\[[^\[\]]*?:(-?\d+):(-?\d+)\]\]/g,
      `<span class="math-frac"><span>$1</span><span>$2</span></span>`
    )
    .replace(/\[\[[^\[\]]*?\]\]/g, "");

  const lines = formatted.split(/\r?\n/);

  if (lines.length <= 1) {
    return formatted;
  }

  return lines
    .map((line, index) => {
      if (index === 0) return line;
      return `<span class="prompt-indented-line">${line}</span>`;
    })
    .join("");
}

function renderEditorControls(question, options = {}) {
  if (!options.editMode) return "";

  const upDisabled = options.canMoveUp ? "" : "disabled";
  const downDisabled = options.canMoveDown ? "" : "disabled";

  return `
    <div class="question-editor-controls" aria-label="Question editor controls">
      <button
        type="button"
        class="question-editor-drag-handle"
        data-editor-drag-handle="true"
        draggable="true"
        title="Drag to reorder"
        aria-label="Drag question to reorder">↕</button>

      <button type="button" data-editor-action="move-up" ${upDisabled} aria-label="Move question up">↑</button>
      <button type="button" data-editor-action="move-down" ${downDisabled} aria-label="Move question down">↓</button>
      <button type="button" class="question-editor-remove" data-editor-action="remove" aria-label="Remove question">×</button>
    </div>
  `;
}

function renderChoices(choices) {
  if (!Array.isArray(choices)) return "";

  return `
    <ol class="choice-list" type="A">
      ${choices.map(choice => `<li>${renderMathText(choice)}</li>`).join("")}
    </ol>
  `;
}

function renderQuestionTable(table) {
  if (!table || !Array.isArray(table.rows) || !table.rows.length) return "";

  const caption = table.caption
    ? `<div class="question-table-caption">${renderMathText(table.caption)}</div>`
    : "";
  const tableClass = table.className ? ` question-table-${escapeHtml(table.className)}` : "";

  return `
    <div class="question-table-wrap${tableClass}">
      ${caption}
      <table class="question-table${tableClass}">
        <tbody>
          ${table.rows.map((row, rowIndex) => `
            <tr>
              ${row.map((cell, index) => {
                const isHeaderRow = table.headerRow === true && rowIndex === 0;
                if (isHeaderRow) return `<th scope="col">${renderMathText(cell)}</th>`;
                return index === 0
                  ? `<th scope="row">${renderMathText(cell)}</th>`
                  : `<td>${renderMathText(cell)}</td>`;
              }).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}


function renderMatching(matching) {
  if (!matching || !Array.isArray(matching.left) || !Array.isArray(matching.right)) return "";

  const rowCount = Math.max(matching.left.length, matching.right.length);

  return `
    <div class="question-matching" aria-label="Matching question" style="display:grid;grid-template-columns:minmax(145px, 1fr) 160px minmax(145px, 1fr);gap:12px;align-items:center;margin:18px 0 8px;font-family:'Cambria Math','STIX Two Math','Times New Roman',serif;">
      ${Array.from({ length: rowCount }).map((_, index) => `
        <div style="border:1.7px solid #111827;border-radius:10px;padding:12px 16px;font-weight:700;text-align:center;font-size:1.05em;">
          ${renderMathText(matching.left[index] || "")}
        </div>
        <div style="height:46px;border-bottom:1.7px dashed #94a3b8;"></div>
        <div style="border:1.7px solid #111827;border-radius:10px;padding:12px 16px;font-weight:700;text-align:center;font-size:1.05em;">
          ${renderMathText(matching.right[index] || "")}
        </div>
      `).join("")}
    </div>
  `;
}

function renderAnswerSpace(space) {
  const safeSpace = ["none", "small", "medium", "large"].includes(space) ? space : "medium";
  if (safeSpace === "none") return "";

  return `<div class="answer-space answer-space-${safeSpace}" aria-label="Answer space"></div>`;
}

function renderDiagram(question) {
  if (!question.diagram) return "";

  const encodedConfig = encodeURIComponent(JSON.stringify(question.diagram.config || {}));
  const engine = escapeHtml(question.diagram.engine);

  // Optional caption / "not to scale" note. These render as siblings AFTER the
  // diagram node so they survive the engine writing its SVG into the node.
  const caption = question.diagram.caption
    ? `<div class="question-diagram-caption">${renderMathText(question.diagram.caption)}</div>`
    : "";
  const scaleNote = question.diagram.notToScale
    ? `<div class="question-diagram-note">Diagram not to scale</div>`
    : "";

  return `
    <div
      class="question-diagram"
      data-engine="${engine}"
      data-config="${encodedConfig}">
    </div>
    ${caption}
    ${scaleNote}
  `;
}

function renderStudentDiagramSpace(diagramSpace) {
  if (!diagramSpace) return "";

  const settings = typeof diagramSpace === "object" ? diagramSpace : {};
  const size = ["small", "medium", "large"].includes(settings.size) ? settings.size : "medium";
  const heights = {
    small: "130px",
    medium: "190px",
    large: "250px"
  };
  const label = settings.label === false ? "" : escapeHtml(settings.label || "Space for diagram");

  return `
    <div
      class="student-diagram-space student-diagram-space-${size}"
      aria-label="Space for student diagram"
      style="height:${heights[size]};border:2px solid #111827;border-radius:6px;margin:18px auto 14px;max-width:920px;background:#fff;position:relative;">
      ${label ? `<div style="position:absolute;top:10px;left:14px;font-size:.86rem;font-family:Arial,sans-serif;color:#64748b;font-weight:700;letter-spacing:.02em;text-transform:uppercase;">${label}</div>` : ""}
    </div>
  `;
}

const LETTERS = "abcdefghijklmnopqrstuvwxyz";

function renderSubparts(question, options = {}) {
  const subparts = Array.isArray(question.subparts) ? question.subparts : null;
  if (!subparts || !subparts.length) return "";

  const hideAnswerSpace = options.hideAnswerSpace === true;
  const showMarks = options.showMarks !== false;

  const items = subparts.map((part, index) => {
    const label = part.label || `(${LETTERS[index] || index + 1})`;
    const subDiagram = part.diagram
      ? renderDiagram({ diagram: part.diagram })
      : "";
    const subChoices = Array.isArray(part.choices) ? renderChoices(part.choices) : "";
    const subTable = part.table ? renderQuestionTable(part.table) : "";
    const space = part.space || (subDiagram || subChoices ? "small" : "medium");
    const answerSpace = hideAnswerSpace ? "" : renderAnswerSpace(space);
    const marks = (showMarks && Number.isFinite(part.marks))
      ? `<span class="subpart-marks">${part.marks} mark${part.marks === 1 ? "" : "s"}</span>`
      : "";

    return `
      <li class="question-subpart" style="margin:0 0 8px;">
        <div class="subpart-heading" style="display:flex;gap:8px;align-items:baseline;">
          <span class="subpart-label" style="font-weight:700;min-width:1.6em;">${escapeHtml(label)}</span>
          <span class="subpart-prompt" style="flex:1;">${renderMathText(part.prompt)}</span>
          ${marks}
        </div>
        ${subTable}
        ${subDiagram}
        ${subChoices}
        ${answerSpace}
      </li>
    `;
  }).join("");

  return `
    <ol class="question-subparts" style="list-style:none;margin:10px 0 0;padding:0;">
      ${items}
    </ol>
  `;
}

export function renderQuestion(question, number, options = {}) {
  const showMarks = options.showMarks !== false;
  const hideAnswerSpace = options.hideAnswerSpace === true;
  const editableClass = options.editMode ? " is-editable" : "";
  const questionKind = escapeHtml(question.kind || "short-response");
  const hasDiagram = Boolean(question.diagram);
  const hasSubparts = Array.isArray(question.subparts) && question.subparts.length > 0;
  const hasAnswerSpace = !hideAnswerSpace && !hasSubparts && !["", "none"].includes(String(question.space || "medium").toLowerCase());
  const hasStudentDiagramSpace = !hideAnswerSpace && Boolean(question.diagramSpace);
  const hasSideAnswerLayout = hasDiagram && hasAnswerSpace && questionKind !== "multiple-choice" && !hasStudentDiagramSpace;
  const layoutClass = hasSideAnswerLayout
    ? " has-diagram-answer-layout"
    : hasDiagram
      ? " has-diagram"
      : "";

  return `
    <article
      class="exam-question${editableClass}${layoutClass}"
      data-question-id="${escapeHtml(question.id)}"
      data-question-kind="${questionKind}">
      ${renderEditorControls(question, options)}

      <div class="question-heading">
        <div class="question-number">${number}</div>
        <div class="question-prompt">${renderMathText(question.prompt)}</div>
        ${showMarks ? `<div class="question-marks">${question.marks} mark${question.marks === 1 ? "" : "s"}</div>` : ""}
      </div>

      ${renderQuestionTable(question.table)}
      ${renderDiagram(question)}
      ${renderMatching(question.matching)}
      ${renderChoices(question.choices)}
      ${renderSubparts(question, options)}
      ${hideAnswerSpace ? "" : renderStudentDiagramSpace(question.diagramSpace)}
      ${hideAnswerSpace || hasSubparts ? "" : renderAnswerSpace(question.space)}
    </article>
  `;
}

/*
  Diagram engine registry
  -----------------------
  Maps a diagram engine id (used in question.diagram.engine) to the global it
  registers itself as. Each engine file assigns window.MMT_<NAME>_ENGINE with a
  .render(node, config) method. Adding a new engine is now a single line here
  plus the matching <script> tag in index.html — no new if-block required.
*/
export const DIAGRAM_ENGINE_REGISTRY = Object.freeze({
  "angle-engine": "MMT_ANGLE_ENGINE",
  "integer-engine": "MMT_INTEGER_ENGINE",
  "equation-engine": "MMT_EQUATION_ENGINE",
  "pythagoras-engine": "MMT_PYTHAGORAS_ENGINE",
  "fdp-engine": "MMT_FDP_ENGINE",
  "rates-engine": "MMT_RATES_ENGINE",
  "indices-engine": "MMT_INDICES_ENGINE",
  "linear-engine": "MMT_LINEAR_ENGINE",
  "length-engine": "MMT_LENGTH_ENGINE",
  "area-engine": "MMT_AREA_ENGINE",
  "trigonometry-engine": "MMT_TRIGONOMETRY_ENGINE",
  "nonlinear-engine": "MMT_NONLINEAR_ENGINE",
  "financial-engine": "MMT_FINANCIAL_ENGINE",
  "algebra-engine": "MMT_ALGEBRA_ENGINE",
  "area-surface-engine": "MMT_AREA_SURFACE_ENGINE",
  "volume-engine": "MMT_VOLUME_ENGINE",
  "network-engine": "MMT_NETWORK_ENGINE"
});

function resolveDiagramEngine(engineId) {
  const globalKey = DIAGRAM_ENGINE_REGISTRY[engineId];
  if (!globalKey) return null;
  const engine = (typeof window !== "undefined") ? window[globalKey] : null;
  return engine && typeof engine.render === "function" ? engine : null;
}

export function hydrateQuestionDiagrams(root = document) {
  const nodes = root.querySelectorAll("[data-engine][data-config]");

  nodes.forEach(node => {
    const engineId = node.dataset.engine;
    let config = {};

    try {
      config = JSON.parse(decodeURIComponent(node.dataset.config || "%7B%7D"));
    } catch (error) {
      console.warn(`Could not parse diagram config for engine "${engineId}".`, error);
    }

    const engine = resolveDiagramEngine(engineId);

    if (engine) {
      try {
        engine.render(node, config);
      } catch (error) {
        console.error(`Diagram engine "${engineId}" failed to render.`, error, config);
        node.innerHTML = `
          <div class="diagram-placeholder">
            Diagram could not be drawn (${escapeHtml(engineId)}).
          </div>
        `;
      }
      return;
    }

    node.innerHTML = `
      <div class="diagram-placeholder">
        Diagram engine unavailable: ${escapeHtml(engineId)}
      </div>
    `;
  });
}
