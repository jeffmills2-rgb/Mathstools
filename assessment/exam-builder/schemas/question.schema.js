/* 
  MMT Exam Builder — Question Schema
  ----------------------------------
  This file defines the shared question shape that all topic banks should output.

  A question bank should return objects matching createQuestion({...}).
  Renderers should rely on this shape rather than topic-specific internals.
*/

export const QUESTION_LEVELS = Object.freeze({
  BASIC: "basic",
  EXPECTED: "expected",
  EXTENSION: "extension",
  MIXED: "mixed"
});

export const QUESTION_KINDS = Object.freeze({
  SHORT_RESPONSE: "short-response",
  MULTIPLE_CHOICE: "multiple-choice",
  EXTENDED_RESPONSE: "extended-response"
});

export const SPACE_SIZES = Object.freeze({
  NONE: "none",
  SMALL: "small",
  MEDIUM: "medium",
  LARGE: "large"
});

export function createQuestion({
  id,
  topic,
  level = QUESTION_LEVELS.BASIC,
  type,
  kind = QUESTION_KINDS.SHORT_RESPONSE,
  marks = 1,
  prompt,
  diagram = null,
  diagramSpace = null,
  matching = null,
  choices = null,
  table = null,
  answerTable = null,
  answer = null,
  working = [],
  space = SPACE_SIZES.MEDIUM,
  solutionMode = null,
  solutionAnswerMode = null,
  mcEligible = true,
  hint = null,
  subparts = null,
  tags = []
}) {
  const question = {
    id,
    topic,
    level,
    type,
    kind,
    marks,
    prompt,
    diagram,
    diagramSpace,
    matching,
    choices,
    table,
    answerTable,
    answer,
    working,
    space,
    solutionMode,
    solutionAnswerMode,
    mcEligible,
    hint,
    subparts,
    tags
  };

  validateQuestion(question);
  return question;
}

export function validateQuestion(question) {
  const required = ["id", "topic", "level", "type", "kind", "marks", "prompt"];

  for (const key of required) {
    if (question[key] === undefined || question[key] === null || question[key] === "") {
      throw new Error(`Question is missing required field: ${key}`);
    }
  }

  if (!Number.isFinite(question.marks) || question.marks < 1) {
    throw new Error(`Question ${question.id} has an invalid marks value.`);
  }

  if (question.diagram && !question.diagram.engine) {
    throw new Error(`Question ${question.id} has a diagram but no diagram.engine.`);
  }

  if (question.kind === QUESTION_KINDS.MULTIPLE_CHOICE) {
    if (!Array.isArray(question.choices) || question.choices.length < 2) {
      throw new Error(`Multiple-choice question ${question.id} needs at least two choices.`);
    }
  }

  return true;
}

export function validateQuestionList(questions) {
  if (!Array.isArray(questions)) {
    throw new Error("Expected an array of questions.");
  }

  questions.forEach(validateQuestion);
  return true;
}
