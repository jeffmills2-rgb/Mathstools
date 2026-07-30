/*
  CHHS Exam Builder — Multi-topic Exam Controls
  ---------------------------------------------
  Save as:

  components/exam-controls.js

  Purpose:
  - Render exam metadata fields.
  - Render one expandable settings panel per topic.
  - Allow a teacher to build a mixed-topic exam.
  - Return a clean config object to app.js.
*/

export function renderExamControls(target, {
  title = "Exam Builder",
  subtitle = "Choose options, then generate a printable exam.",
  topics = {},
  defaultTopicCounts = {},
  defaultMultipleChoiceCount = 0,
  defaultTemplate = "hsc-style",
  onGenerate
} = {}) {
  const container =
    typeof target === "string"
      ? document.getElementById(target)
      : target;

  if (!container) {
    throw new Error("renderExamControls target was not found.");
  }

  const topicEntries = Object.entries(topics);

  const defaultInstructions = [
    "Attempt all questions.",
    "Show all relevant working in the spaces provided.",
    "Diagrams are not necessarily drawn to scale.",
    "Write using black or blue pen."
  ].join("\n");

  container.innerHTML = `
    <section class="exam-controls print-hide">

      <div class="exam-controls-header">
        <div>
          <h1>${escapeHtml(title)}</h1>
          <p>${escapeHtml(subtitle)}</p>
        </div>

        <div class="exam-controls-header-actions">
          <button
            type="button"
            class="exam-controls-print"
            data-action="print"
          >
            Print / Save Student Exam
          </button>

          <button
            type="button"
            class="exam-controls-secondary"
            data-action="toggle-worked-solutions"
          >
            Show Worked Solutions
          </button>

          <button
            type="button"
            class="exam-controls-secondary"
            data-action="print-worked-solutions"
          >
            Print Worked Solutions
          </button>
        </div>
      </div>

      <div class="exam-controls-panel">

        <div class="exam-controls-section-title">
          Exam Details
        </div>

        <div class="exam-controls-grid">

          <label class="exam-control-field">
            <span>School</span>
            <input
              type="text"
              data-field="school"
              value="Coffs Harbour High School"
            />
          </label>

          <label class="exam-control-field">
            <span>Title</span>
            <input
              type="text"
              data-field="exam-title"
              value="Stage 4 Mathematics Examination"
            />
          </label>

          <label class="exam-control-field">
            <span>Subtitle / Topic</span>
            <input
              type="text"
              data-field="exam-subtitle"
              value="Integers and Angle Relationships"
            />
          </label>

          <label class="exam-control-field">
            <span>Time allowed</span>
            <input
              type="text"
              data-field="time-allowed"
              value="45 minutes"
            />
          </label>

          <label class="exam-control-field">
            <span>Template</span>
            <select data-field="template">
              ${renderTemplateOptions(defaultTemplate)}
            </select>
          </label>

        </div>

        <label class="exam-control-toggle">
          <input
            type="checkbox"
            data-field="calculator"
          />
          <span>Calculator permitted</span>
        </label>

        <label class="exam-control-field">
          <span>Multiple choice questions</span>
          <select data-field="multiple-choice-count">
            ${[0, 5, 10, 15, 20, 25, 30].map(value => `
              <option
                value="${value}"
                ${Number(defaultMultipleChoiceCount) === value ? "selected" : ""}
              >
                ${value}
              </option>
            `).join("")}
          </select>
        </label>

        <p class="exam-control-note">
          Multiple choice questions are generated from the switched-on topics and selected question types.
        </p>

        <label class="exam-control-field">
          <span>Instructions</span>
          <textarea
            data-field="instructions"
            rows="6"
          >${escapeHtml(defaultInstructions)}</textarea>
        </label>

      </div>

      <div class="exam-controls-panel">

        <div class="exam-controls-section-title">
          Topic Sections
        </div>

        <div class="exam-topic-list">

          ${topicEntries.map(([topicId, topic], index) => renderTopicPanel({
            topicId,
            topic,
            checked: index === 0,
            count: defaultTopicCounts[topicId] ?? 4
          })).join("")}

        </div>

      </div>

      <div class="exam-controls-actions">
        <button
          type="button"
          class="exam-controls-generate"
          data-action="generate"
        >
          Generate Exam
        </button>
      </div>

      <p
        class="exam-controls-warning"
        hidden
      >
        Please switch on at least one topic and select at least one question type within that topic.
      </p>

    </section>
  `;

  const warning = container.querySelector(".exam-controls-warning");

  function getConfig() {
    const selectedTopics = {};

    container.querySelectorAll("[data-topic-id]").forEach(topicPanel => {
      const topicId = topicPanel.dataset.topicId;
      const enabled = topicPanel.querySelector('[data-topic-field="enabled"]').checked;

      if (!enabled) return;

      const count = Math.max(
        1,
        Math.min(
          40,
          Number(topicPanel.querySelector('[data-topic-field="count"]').value) || 1
        )
      );

      const allowedTypes = [
        ...topicPanel.querySelectorAll(".exam-control-check input:checked")
      ].map(input => input.value);

      if (!allowedTypes.length) return;

      selectedTopics[topicId] = {
        count,
        allowedTypes
      };
    });

    return {
      school:
        container.querySelector('[data-field="school"]').value,

      examTitle:
        container.querySelector('[data-field="exam-title"]').value,

      examSubtitle:
        container.querySelector('[data-field="exam-subtitle"]').value,

      timeAllowed:
        container.querySelector('[data-field="time-allowed"]').value,

      template:
        container.querySelector('[data-field="template"]')?.value || "hsc-style",

      calculator:
        container.querySelector('[data-field="calculator"]').checked,

      multipleChoiceCount:
        Number(container.querySelector('[data-field="multiple-choice-count"]')?.value) || 0,

      instructions:
        container
          .querySelector('[data-field="instructions"]')
          .value
          .split("\n")
          .map(v => v.trim())
          .filter(Boolean),

      selectedTopics
    };
  }

  function generate() {
    const config = getConfig();

    if (!Object.keys(config.selectedTopics).length) {
      warning.hidden = false;
      return;
    }

    warning.hidden = true;

    if (typeof onGenerate === "function") {
      onGenerate(config);
    }
  }

  container
    .querySelector('[data-action="generate"]')
    .addEventListener("click", generate);

  container
    .querySelector('[data-action="print"]')
    .addEventListener("click", () => {
      printWithMode("print-student-only");
    });

  container
    .querySelector('[data-action="print-worked-solutions"]')
    ?.addEventListener("click", () => {
      printWithMode("print-solutions-only");
    });

  container
    .querySelector('[data-action="toggle-worked-solutions"]')
    ?.addEventListener("click", event => {
      document.body.classList.toggle("show-worked-solutions");
      event.currentTarget.textContent = document.body.classList.contains("show-worked-solutions")
        ? "Hide Worked Solutions"
        : "Show Worked Solutions";
    });

  container
    .querySelector('[data-field="multiple-choice-count"]')
    ?.addEventListener("change", generate);

  container
    .querySelectorAll("[data-topic-id]")
    .forEach(topicPanel => {
      const enabledInput = topicPanel.querySelector('[data-topic-field="enabled"]');
      const body = topicPanel.querySelector(".exam-topic-body");

      function syncOpenState() {
        body.hidden = !enabledInput.checked;
      }

      enabledInput.addEventListener("change", () => {
        syncOpenState();
        generate();
      });

      topicPanel
        .querySelector('[data-action="select-topic-all"]')
        .addEventListener("click", () => {
          topicPanel
            .querySelectorAll(".exam-control-check input")
            .forEach(input => input.checked = true);
          generate();
        });

      topicPanel
        .querySelector('[data-action="deselect-topic-all"]')
        .addEventListener("click", () => {
          topicPanel
            .querySelectorAll(".exam-control-check input")
            .forEach(input => input.checked = false);
        });

      topicPanel
        .querySelector('[data-topic-field="count"]')
        .addEventListener("change", generate);

      topicPanel
        .querySelectorAll(".exam-control-check input")
        .forEach(input => input.addEventListener("change", generate));

      syncOpenState();
    });

  generate();

  return {
    getConfig,
    generate
  };
}

function printWithMode(modeClass) {
  document.body.classList.remove("print-student-only", "print-solutions-only");
  document.body.classList.add(modeClass);

  const cleanup = () => {
    document.body.classList.remove("print-student-only", "print-solutions-only");
    window.removeEventListener("afterprint", cleanup);
  };

  window.addEventListener("afterprint", cleanup);
  window.print();

  // Fallback for browsers that do not reliably fire afterprint.
  window.setTimeout(cleanup, 1200);
}

function renderTopicPanel({ topicId, topic, checked, count }) {
  const types = typeof topic.getTypes === "function"
    ? topic.getTypes()
    : topic.questionTypes || [];

  return `
    <section
      class="exam-topic-panel"
      data-topic-id="${escapeHtml(topicId)}"
    >

      <label class="exam-topic-header">
        <input
          type="checkbox"
          data-topic-field="enabled"
          ${checked ? "checked" : ""}
        />

        <span class="exam-topic-title">
          ${escapeHtml(topic.label)}
        </span>

        <span class="exam-topic-hint">
          switch on/off
        </span>
      </label>

      <div class="exam-topic-body">

        <div class="exam-controls-grid">

          <label class="exam-control-field">
            <span>Questions from this topic</span>
            <input
              type="number"
              min="1"
              max="40"
              step="1"
              data-topic-field="count"
              value="${Number(count) || 4}"
            />
          </label>

        </div>

        <div class="exam-control-types">

          <div class="exam-control-types-heading">
            <strong>${escapeHtml(topic.label)} question types</strong>

            <div>
              <button
                type="button"
                data-action="select-topic-all"
              >
                Select all
              </button>

              <button
                type="button"
                data-action="deselect-topic-all"
              >
                Deselect all
              </button>
            </div>
          </div>

          <div class="exam-control-checks">

            ${types.map(type => `
              <label class="exam-control-check">
                <input
                  type="checkbox"
                  value="${escapeHtml(type.id)}"
                  checked
                />
                <span>${escapeHtml(type.label)}</span>
              </label>
            `).join("")}

          </div>

        </div>

      </div>

    </section>
  `;
}

function renderTemplateOptions(selectedValue = "hsc-style") {
  const options = [
    { id: "hsc-style", label: "HSC style" },
    { id: "class-test", label: "Class test" }
  ];

  return options
    .map(option => `
      <option
        value="${escapeHtml(option.id)}"
        ${String(selectedValue || "hsc-style") === option.id ? "selected" : ""}
      >
        ${escapeHtml(option.label)}
      </option>
    `).join("");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
