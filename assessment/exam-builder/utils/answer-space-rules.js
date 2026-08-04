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

/*
  ══════════════════════════════════════════════════════════════════════
  ANSWER SPACE AS A KIND, NOT A SIZE
  ----------------------------------------------------------------------
  `space` is a t-shirt size the bank picks — none/small/medium/large — and
  templates drew it as a full-column ruled rectangle. That conflates two
  different things: how much WORKING the author expected, and what the answer
  actually looks like. So "Calculate: 2 − (−32)" was given 48mm × 165mm of
  ruled paper for a three-character answer, and a worksheet ran to 61 pages
  where the same questions fit on 13.

  What matters for layout is the SHAPE of the response:

    none   the student answers on the diagram or in a blank in the prompt
    box    a short final answer — a number, a fraction, an inequality
    lines  genuine working, sized by the marks the author assigned

  All three are derived from data the question already carries, so no bank
  needs editing. Marks are the honest signal for working: they already encode
  how many steps the author expected.
  ══════════════════════════════════════════════════════════════════════
*/

const MAX_LINES = 4;

/*
  A one-mark question is a single step, but a single step does not always give
  a short answer. On the first Stage 3 worksheet these all got a 22mm box:

    "Write 51 821 724 in words."           → sixty-plus characters
    "Write these numbers in ascending order: …"  → a five-value list
    "Explain your answer."                 → a sentence

  So marks decide whether WORKING is expected; the answer itself decides
  whether a box can hold it. The question already carries its own `answer`,
  which is the best available estimate of what the student will write.
*/
/*
  The box is 22mm wide (.answer-box). At the worksheet's 10.5pt maths font a
  digit runs about 1.9mm, so roughly 12 characters fit. Measured across every
  bank, the median one-mark answer is 5 characters and the 75th percentile is
  7, so this promotes about an eighth of them — the ones that genuinely would
  not have fitted, such as "4.04, 4.1, 4.4, 4.9".
*/
const LONG_ANSWER_CHARS = 12;
const EXPLANATION_CUE = /\b(explain|justify|why|give a reason|describe|convince|in your own words)\b/i;

function needsRoomToWrite(question) {
  if (EXPLANATION_CUE.test(String(question.prompt || ""))) return true;

  // Fraction tokens render far shorter than they read, so discount them.
  const answer = String(question.answer ?? "").replace(/\[\[[^\]]*\]\]/g, "x");
  return answer.length > LONG_ANSWER_CHARS;
}

export function resolveAnswerSpace(question) {
  if (!question || typeof question !== "object") return { kind: "none", lines: 0 };

  if (shouldSuppressAnswerSpace(question)) return { kind: "none", lines: 0 };

  // Explicit "no space" from the bank is still respected.
  if (String(question.space || "").toLowerCase() === "none") return { kind: "none", lines: 0 };

  // A question with subparts holds no answer itself — each part carries its own.
  if (Array.isArray(question.subparts) && question.subparts.length) {
    return { kind: "parts", lines: 0 };
  }

  const marks = Number(question.marks);

  // One mark is a single step: the response is a final answer, not working —
  // unless that answer is too long to fit on one short line.
  if (!Number.isFinite(marks) || marks <= 1) {
    return needsRoomToWrite(question) ? { kind: "lines", lines: 2 } : { kind: "box", lines: 0 };
  }

  return { kind: "lines", lines: Math.min(MAX_LINES, Math.max(2, Math.round(marks))) };
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
