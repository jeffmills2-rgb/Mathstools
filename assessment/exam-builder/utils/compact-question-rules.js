/*
  MMT Exam Builder — Compact Question Rules
  -----------------------------------------
  Used by the Class test template to bundle short, safe 1-mark extended-response
  questions into compact response groups.

  The rules are intentionally conservative. Anything with diagrams, graphs,
  tables, matching, multi-mark working, or a prompt that suggests drawing,
  graphing, explaining or justifying stays in the normal full layout.
*/

const MAX_COMPACT_PROMPT_LENGTH = 190;
const DEFAULT_MAX_GROUP_SIZE = 8;
const DEFAULT_MIN_GROUP_SIZE = 2;

const DISALLOWED_TYPE_KEYWORDS = [
  "angle-engine",
  "bearing",
  "construct",
  "coordinate",
  "diagram",
  "distance-time",
  "draw",
  "graph",
  "identify-hoa",
  "match",
  "net",
  "plot",
  "shade",
  "table",
  "trig"
];

const DISALLOWED_PROMPT_PATTERNS = [
  /\bshow\b.*\bworking\b/i,
  /\bshow\b.*\breason/i,
  /\bgive\b.*\breason/i,
  /\bjustify\b/i,
  /\bexplain\b/i,
  /\bdescribe\b/i,
  /\bconstruct\b/i,
  /\bdraw\b/i,
  /\bgraph\b/i,
  /\bplot\b/i,
  /\bshade\b/i,
  /\bcomplete\b.*\btable\b/i,
  /\busing the diagram\b/i,
  /\bfrom the graph\b/i,
  /\bon the number line\b/i,
  /\bmatch\b/i,
  /\bwhich graph\b/i,
  /\bwrite an equation and solve\b/i
];

export function canBundleAsCompactQuestion(question = {}) {
  if (!question || typeof question !== "object") return false;

  const kind = String(question.kind || "short-response");
  const marks = Number(question.marks ?? 1);
  const type = String(question.type || "").toLowerCase();
  const prompt = String(question.prompt || "").trim();
  const tags = Array.isArray(question.tags)
    ? question.tags.map(tag => String(tag || "").toLowerCase())
    : [];

  if (kind === "multiple-choice") return false;
  if (!Number.isFinite(marks) || marks !== 1) return false;
  if (!prompt) return false;
  if (prompt.length > MAX_COMPACT_PROMPT_LENGTH) return false;

  if (question.diagram || question.diagramSpace) return false;
  if (question.table || question.answerTable || question.matching) return false;
  if (question.parts || question.choices) return false;

  // A question with no answer space usually asks students to respond directly
  // on a graph, table, blank, diagram or number line, so leave it alone.
  if (String(question.space || "").toLowerCase() === "none") return false;

  if (DISALLOWED_TYPE_KEYWORDS.some(keyword => type.includes(keyword))) return false;
  if (tags.some(tag => DISALLOWED_TYPE_KEYWORDS.some(keyword => tag.includes(keyword)))) return false;
  if (DISALLOWED_PROMPT_PATTERNS.some(pattern => pattern.test(prompt))) return false;

  return true;
}

export function buildCompactQuestionBlocks(questions = [], {
  startNumber = 1,
  minGroupSize = DEFAULT_MIN_GROUP_SIZE,
  maxGroupSize = DEFAULT_MAX_GROUP_SIZE
} = {}) {
  const blocks = [];
  let run = [];

  function flushRun() {
    if (!run.length) return;

    if (run.length < minGroupSize) {
      run.forEach(item => blocks.push({ type: "single", ...item }));
      run = [];
      return;
    }

    let index = 0;

    while (index < run.length) {
      const remaining = run.length - index;

      if (remaining < minGroupSize) {
        blocks.push({ type: "single", ...run[index] });
        index += 1;
        continue;
      }

      let groupSize = Math.min(maxGroupSize, remaining);

      // Avoid leaving a one-question group at the end. For example, 9 questions
      // becomes groups of 7 and 2 rather than 8 and 1.
      if (remaining > maxGroupSize && remaining - maxGroupSize < minGroupSize) {
        groupSize = Math.max(minGroupSize, maxGroupSize - 1);
      }

      const groupQuestions = run.slice(index, index + groupSize);

      blocks.push({
        type: "compact-group",
        questions: groupQuestions.map((item, partIndex) => ({
          ...item,
          partLabel: getPartLabel(partIndex)
        })),
        startNumber: groupQuestions[0].number,
        endNumber: groupQuestions[groupQuestions.length - 1].number,
        totalMarks: groupQuestions.reduce((sum, item) => sum + Number(item.question?.marks || 0), 0)
      });

      index += groupSize;
    }

    run = [];
  }

  (questions || []).forEach((question, index) => {
    const item = {
      question,
      number: startNumber + index
    };

    if (canBundleAsCompactQuestion(question)) {
      run.push(item);
      return;
    }

    flushRun();
    blocks.push({ type: "single", ...item });
  });

  flushRun();
  return blocks;
}

function getPartLabel(index) {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  if (index >= 0 && index < letters.length) return letters[index];
  return String(index + 1);
}
