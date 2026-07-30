/*
  CHHS Exam Builder — Solution Formatters
  ---------------------------------------
  Shared formatting helpers for worked solutions and marking criteria.
*/

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderMathText(value) {
  return escapeHtml(value)
    .replace(
      /\[\[frac:(-?\d+):(-?\d+)\]\]/g,
      `<span class="math-frac"><span>$1</span><span>$2</span></span>`
    )
    .replace(
      /\[\[algfrac:([^:\]]+):([^:\]]+)\]\]/g,
      `<span class="math-frac"><span>$1</span><span>$2</span></span>`
    )
    .replace(/\r?\n/g, "<br>");
}

export function normaliseText(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

export function stripHtml(value) {
  const node = document.createElement("div");
  node.innerHTML = String(value ?? "");
  return node.textContent || node.innerText || "";
}

export function choiceLetter(index) {
  return ["A", "B", "C", "D"][Number(index)] || "";
}

export function getCorrectChoiceLetter(question) {
  if (!question || !Array.isArray(question.choices)) return "";

  const answer = normaliseChoiceText(question.answer);
  const index = question.choices.findIndex(choice => normaliseChoiceText(choice) === answer);

  return choiceLetter(index);
}

export function normaliseChoiceText(value) {
  return String(value ?? "")
    .replace(/\u2212/g, "−")
    .replace(/-/g, "−")
    .replace(/\s+/g, " ")
    .trim();
}

export function totalMarks(questions = []) {
  return questions.reduce((sum, question) => sum + Number(question.marks || 0), 0);
}

export function splitQuestionsByKind(questions = []) {
  return {
    multipleChoice: questions.filter(question => question.kind === "multiple-choice"),
    extendedResponse: questions.filter(question => question.kind !== "multiple-choice")
  };
}
