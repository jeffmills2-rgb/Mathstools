/*
  MMT Exam Builder — Answer Space Rules
  -------------------------------------
  Central policy for suppressing answer/working boxes on questions where
  students respond directly on the diagram, number line, or blank in the prompt.

  This avoids confusing boxes under questions such as:
  - Insert <, > or =
  - Place a value on the number line
  - Shade a fraction bar
  - Fill-the-gap ratio questions
*/

const NO_SPACE_TYPES = new Set([
  "intersecting-lines",
  "graph-from-equation",
  "graph-from-table",
  "plot-coordinates",
  "place-number-line",
  "distance-time-construct",
  "equivalent-ratios",
  "complete-table-rule",
  "identify-hoa",
  "match-trig-ratios",
  "recognise-valid-nets",
  "nonlinear-quadratic-table-values",
  "nonlinear-exponential-table-values",
  "nonlinear-graph-quadratic-from-table",
  "nonlinear-graph-exponential-from-table",
  "nonlinear-construct-table-and-graph-quadratic",
  "nonlinear-construct-table-and-graph-exponential",
  "nonlinear-blank-graph-application"
]);

export function applyAnswerSpaceRules(questions = []) {
  if (!Array.isArray(questions)) return [];

  return questions.map(question => {
    if (!question || typeof question !== "object") return question;

    if (!shouldSuppressAnswerSpace(question)) {
      return question;
    }

    return {
      ...question,
      space: "none"
    };
  });
}

export function shouldSuppressAnswerSpace(question) {
  if (!question || typeof question !== "object") return false;

  const kind = String(question.kind || "");
  const type = String(question.type || "");
  const prompt = String(question.prompt || "").trim();
  const lowerPrompt = prompt.toLowerCase();

  // Multiple choice questions should never show a working box.
  if (kind === "multiple-choice") return true;

  // Type-level rules.
  if (NO_SPACE_TYPES.has(type)) return true;

  // Students answer directly in a fill-the-gap blank.
  if (prompt.includes("___") || prompt.includes("____")) return true;

  // Students answer directly in the blank in these comparison questions.
  if (
    lowerPrompt.startsWith("insert ") &&
    (
      prompt.includes("___") ||
      prompt.includes("____") ||
      prompt.includes("<") ||
      prompt.includes(">") ||
      prompt.includes("=")
    )
  ) {
    return true;
  }

  // Fill-the-gap ratio questions are answered in the blank provided.
  if (/^complete the equivalent ratio:/i.test(prompt)) return true;

  // Students respond by marking the diagram itself.
  if (/^place\b.+\bon the number line\.?$/i.test(prompt)) return true;

  // Students respond by shading the bar/diagram itself.
  if (/^shade\b/i.test(prompt)) return true;

  // Future-proofing for similar diagram-response commands.
  if (/^(mark|plot|draw|construct)\b/i.test(prompt)) return true;

  return false;
}
