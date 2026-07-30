/*
  CHHS Exam Builder — Worked Solution Builder
  -------------------------------------------
  Converts the generated exam object into data for the worked-solution renderer.
*/

import { buildCriteriaForQuestion } from "./marking-criteria.js";
import {
  getCorrectChoiceLetter,
  splitQuestionsByKind,
  totalMarks
} from "./solution-formatters.js";

export function buildWorkedSolutionData(exam = {}) {
  const questions = Array.isArray(exam.questions) ? exam.questions : [];
  const numberedQuestions = questions.map((question, index) => ({
    number: index + 1,
    question
  }));

  const { multipleChoice, extendedResponse } = splitQuestionsByKind(questions);

  return {
    school: exam.school || "[School name]",
    title: `${exam.title || "Mathematics Exam"} — Worked Solutions and Marking Criteria`,
    examTitle: exam.title || "Mathematics Exam",
    subtitle: exam.subtitle || "",
    timeAllowed: exam.timeAllowed || "",
    calculator: exam.calculator || "",
    totalMarks: totalMarks(questions),
    generatedAt: new Date().toLocaleDateString("en-AU"),
    multipleChoiceCount: multipleChoice.length,
    questions: numberedQuestions.map(({ number, question }) =>
      buildWorkedSolutionQuestion(question, number)
    ),
    hasMultipleChoice: multipleChoice.length > 0,
    hasExtendedResponse: extendedResponse.length > 0
  };
}

export function buildWorkedSolutionQuestion(question, number) {
  const isMultipleChoice = question.kind === "multiple-choice";
  const correctChoice = isMultipleChoice ? getCorrectChoiceLetter(question) : "";

  return {
    number,
    id: question.id,
    topic: question.topic,
    type: question.type,
    kind: question.kind,
    marks: Number(question.marks || 1),
    prompt: question.prompt,
    choices: Array.isArray(question.choices) ? question.choices.slice() : null,
    table: cloneTable(question.table),
    matching: cloneMatching(question.matching),
    answerTable: cloneTable(question.answerTable),
    answer: question.answer,
    correctChoice,
    solutionMode: question.solutionMode || null,
    solutionAnswerMode: question.solutionAnswerMode || null,
    working: normaliseWorking(question.working, question.answer, correctChoice, question.solutionMode),
    diagram: shouldIncludeDiagram(question) ? question.diagram : null,
    answerDiagram: buildAnswerDiagram(question),
    subparts: cloneSubparts(question.subparts),
    criteria: buildCriteriaForQuestion(question)
  };
}

function cloneSubparts(subparts) {
  if (!Array.isArray(subparts) || !subparts.length) return null;
  return subparts.map((part, index) => ({
    label: part.label || `(${"abcdefghijklmnopqrstuvwxyz"[index] || index + 1})`,
    prompt: part.prompt || "",
    marks: Number.isFinite(part.marks) ? part.marks : null,
    diagram: part.diagram ? deepClone(part.diagram) : null,
    table: part.table ? deepClone(part.table) : null,
    answer: part.answer ?? null,
    working: Array.isArray(part.working)
      ? part.working.map(line => String(line ?? "").trim()).filter(Boolean)
      : []
  }));
}

function cloneTable(table) {
  return table ? deepClone(table) : null;
}

function cloneMatching(matching) {
  return matching ? deepClone(matching) : null;
}

function normaliseWorking(working, answer, correctChoice, solutionMode = null) {
  if (solutionMode === "table-only") return [];

  const lines = Array.isArray(working)
    ? working.map(line => String(line ?? "").trim()).filter(Boolean)
    : [];

  if (lines.length) return lines;

  if (correctChoice) {
    return [`Correct alternative: ${correctChoice}`];
  }

  if (answer !== undefined && answer !== null && answer !== "") {
    return [`Answer: ${answer}`];
  }

  return ["No worked solution has been provided for this generated item yet."];
}

function shouldIncludeDiagram(question) {
  if (!question?.diagram) return false;

  const topic = String(question.topic || "").toLowerCase();
  const type = String(question.type || "").toLowerCase();

  const diagramHeavyKeywords = [
    "angle",
    "pythagoras",
    "fdp",
    "fraction",
    "distance",
    "graph",
    "linear",
    "length",
    "area",
    "circle",
    "sector",
    "quadrant",
    "semicircle",
    "indices",
    "trigonometry",
    "triangle",
    "right-triangle",
    "financial",
    "algebra",
    "binomial",
    "expansion",
    "interest",
    "tax",
    "repayment",
    "money",
    "surface",
    "prism",
    "cylinder",
    "net",
    "solid",
    "composite",
    "integer",
    "number-line",
    "number line",
    "thermometer",
    "temperature",
    "jump",
    "balance",
    "inequality",
    "bar-model",
    "bar model",
    "tile",
    "machine",
    "perimeter",
    "metric",
    "ruler",
    "grid",
    "double-number-line",
    "equation",
    "decimal",
    "percent",
    "proportion",
    "ratio",
    "rate",
    "scale",
    "index",
    "gradient",
    "intercept",
    "quadrant",
    "coordinate",
    "isosceles",
    "box-3d",
    "3d"
  ];

  return diagramHeavyKeywords.some(keyword =>
    topic.includes(keyword) || type.includes(keyword)
  );
}

function buildAnswerDiagram(question) {
  if (!question?.diagram?.engine || !question?.diagram?.config) return null;

  const diagram = deepClone(question.diagram);
  const config = diagram.config || {};
  const engine = String(diagram.engine || "");
  const type = String(question.type || "");
  const prompt = String(question.prompt || "").toLowerCase();

  // FDP: solution to "Shade a/b on the bar" should show the shaded bar.
  if (engine === "fdp-engine" && config.diagramType === "fraction-bar" && prompt.startsWith("shade ")) {
    const frac = parseFraction(question.answer) || parseFraction(question.prompt);

    if (frac) {
      config.numerator = frac.n;
      config.denominator = frac.d;
      config.showLabel = false;
      return diagram;
    }
  }

  // Integers: solution to "Place x on the number line" should show the answer dot.
  if (engine === "integer-engine" && type === "place-number-line") {
    const value = extractFirstNumber(question.answer) ?? extractFirstNumber(question.prompt);

    if (Number.isFinite(value)) {
      config.showAnswer = true;
      config.answer = value;
      return diagram;
    }
  }

  // Linear relationships: plotting or graphing tasks should show the completed graph in the solution.
  if (engine === "linear-engine") {
    if (type === "plot-coordinates") {
      const point = parseCoordinate(question.answer) || parseCoordinate(question.prompt);
      const label = parsePointLabel(question.prompt) || "A";

      if (point) {
        config.mode = "completed";
        config.points = [{ label, x: point.x, y: point.y, showCoordinates: true }];
        return diagram;
      }
    }

    if (type === "graph-from-table" || type === "graph-from-equation") {
      config.mode = "completed";
      config.showLine = true;
      config.showLineLabels = false;
      if (Array.isArray(config.answerPoints) && config.answerPoints.length) {
        config.points = config.answerPoints;
      }
      return diagram;
    }

    if (type === "intersecting-lines") {
      config.mode = "completed";
      config.showLine = true;
      config.showIntersection = true;
      return diagram;
    }
  }

  // Rates: construction tasks can show the completed graph if the bank stored answerPoints.
  if (engine === "rates-engine" && type === "distance-time-construct") {
    if (Array.isArray(config.answerPoints) && config.answerPoints.length) {
      config.mode = "completed";
      config.points = config.answerPoints;
      return diagram;
    }
  }

  // Algebra: area-model expansion solutions can show the four products.
  if (engine === "algebra-engine" && type === "expand-binomial-area-model") {
    config.showProducts = true;
    return diagram;
  }


  return null;
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function parseFraction(value) {
  const text = String(value || "");
  const token = text.match(/\[\[frac:(-?\d+):(-?\d+)\]\]/);

  if (token) {
    return { n: Number(token[1]), d: Number(token[2]) };
  }

  const slash = text.match(/(-?\d+)\s*\/\s*(-?\d+)/);
  if (slash) {
    return { n: Number(slash[1]), d: Number(slash[2]) };
  }

  return null;
}

function parseCoordinate(value) {
  const text = String(value || "");
  const match = text.match(/\((-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\)/);

  if (!match) return null;

  return {
    x: Number(match[1]),
    y: Number(match[2])
  };
}

function parsePointLabel(value) {
  const text = String(value || "");
  const match = text.match(/point\s+([A-Z])/i);
  return match ? match[1].toUpperCase() : "";
}

function extractFirstNumber(value) {
  const text = String(value || "").replace(/\u2212/g, "-");
  const match = text.match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}
