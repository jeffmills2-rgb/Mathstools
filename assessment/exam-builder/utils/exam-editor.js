/*
  MMT Exam Builder — Exam Editor Utilities
  ----------------------------------------
  Small immutable helpers for editing a generated exam.

  The renderer uses the current exam.questions array as the single source of
  truth. These helpers remove/reorder questions while keeping multiple choice
  questions in Section I and extended response questions in Section II.
*/

export function ensureQuestionIds(questions = []) {
  if (!Array.isArray(questions)) return [];

  const seen = new Set();
  const stamp = Date.now().toString(36);

  return questions.map((question, index) => {
    if (!question || typeof question !== "object") return question;

    let id = String(question.id || "").trim();

    if (!id || seen.has(id)) {
      id = `q_${stamp}_${index + 1}_${Math.random().toString(36).slice(2, 8)}`;
    }

    seen.add(id);

    return question.id === id
      ? question
      : { ...question, id };
  });
}

export function getExamEditorSummary(exam = {}) {
  const questions = Array.isArray(exam.questions) ? exam.questions : [];
  const multipleChoiceCount = questions.filter(isMultipleChoice).length;
  const extendedResponseCount = questions.length - multipleChoiceCount;
  const totalMarks = questions.reduce((sum, question) => sum + Number(question?.marks || 0), 0);

  return {
    questionCount: questions.length,
    multipleChoiceCount,
    extendedResponseCount,
    totalMarks
  };
}

export function removeQuestionById(exam = {}, questionId) {
  const questions = Array.isArray(exam.questions) ? exam.questions : [];
  const index = questions.findIndex(question => question?.id === questionId);

  if (index < 0) {
    return { exam, changed: false, removed: null };
  }

  const question = questions[index];
  const section = getQuestionSection(question);
  const sectionIndex = getSectionIndex(questions, index, section);

  const nextQuestions = questions.filter((_, itemIndex) => itemIndex !== index);

  return {
    exam: withQuestions(exam, nextQuestions),
    changed: true,
    removed: {
      question,
      originalIndex: index,
      section,
      sectionIndex
    }
  };
}

export function restoreRemovedQuestion(exam = {}, removed = null) {
  if (!removed?.question) {
    return { exam, changed: false };
  }

  const groups = splitQuestions(exam.questions || []);
  const section = removed.section || getQuestionSection(removed.question);
  const group = section === "multiple-choice"
    ? groups.multipleChoice
    : groups.extendedResponse;

  const insertAt = clamp(Number(removed.sectionIndex ?? group.length), 0, group.length);
  const restoredQuestion = ensureQuestionIds([removed.question])[0];

  group.splice(insertAt, 0, restoredQuestion);

  return {
    exam: withQuestions(exam, joinGroups(groups)),
    changed: true
  };
}

export function moveQuestionById(exam = {}, questionId, direction = "up") {
  const groups = splitQuestions(exam.questions || []);
  const section = findQuestionSection(groups, questionId);

  if (!section) {
    return { exam, changed: false, reason: "Question not found." };
  }

  const group = section === "multiple-choice"
    ? groups.multipleChoice
    : groups.extendedResponse;

  const index = group.findIndex(question => question?.id === questionId);
  const offset = direction === "down" ? 1 : -1;
  const nextIndex = index + offset;

  if (nextIndex < 0 || nextIndex >= group.length) {
    return { exam, changed: false, reason: "Question is already at the edge of its section." };
  }

  const copy = group.slice();
  [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];

  if (section === "multiple-choice") {
    groups.multipleChoice = copy;
  } else {
    groups.extendedResponse = copy;
  }

  return {
    exam: withQuestions(exam, joinGroups(groups)),
    changed: true
  };
}

export function moveQuestionRelativeToId(exam = {}, sourceId, targetId, position = "before") {
  if (!sourceId || !targetId || sourceId === targetId) {
    return { exam, changed: false };
  }

  const groups = splitQuestions(exam.questions || []);
  const sourceSection = findQuestionSection(groups, sourceId);
  const targetSection = findQuestionSection(groups, targetId);

  if (!sourceSection || !targetSection) {
    return { exam, changed: false, reason: "Question not found." };
  }

  if (sourceSection !== targetSection) {
    return {
      exam,
      changed: false,
      reason: "Questions can only be moved within the same section."
    };
  }

  const group = sourceSection === "multiple-choice"
    ? groups.multipleChoice.slice()
    : groups.extendedResponse.slice();

  const sourceIndex = group.findIndex(question => question?.id === sourceId);
  const targetIndex = group.findIndex(question => question?.id === targetId);

  if (sourceIndex < 0 || targetIndex < 0) {
    return { exam, changed: false };
  }

  const [sourceQuestion] = group.splice(sourceIndex, 1);
  let insertAt = group.findIndex(question => question?.id === targetId);

  if (insertAt < 0) insertAt = group.length;
  if (position === "after") insertAt += 1;

  group.splice(insertAt, 0, sourceQuestion);

  if (sourceSection === "multiple-choice") {
    groups.multipleChoice = group;
  } else {
    groups.extendedResponse = group;
  }

  return {
    exam: withQuestions(exam, joinGroups(groups)),
    changed: true
  };
}

export function getQuestionSection(question = {}) {
  return isMultipleChoice(question) ? "multiple-choice" : "extended-response";
}

export function canMoveQuestion(exam = {}, questionId, direction = "up") {
  const groups = splitQuestions(exam.questions || []);
  const section = findQuestionSection(groups, questionId);

  if (!section) return false;

  const group = section === "multiple-choice"
    ? groups.multipleChoice
    : groups.extendedResponse;

  const index = group.findIndex(question => question?.id === questionId);
  return direction === "down"
    ? index >= 0 && index < group.length - 1
    : index > 0;
}

function isMultipleChoice(question = {}) {
  return question?.kind === "multiple-choice";
}

function splitQuestions(questions = []) {
  return {
    multipleChoice: questions.filter(isMultipleChoice),
    extendedResponse: questions.filter(question => !isMultipleChoice(question))
  };
}

function joinGroups(groups) {
  return [
    ...groups.multipleChoice,
    ...groups.extendedResponse
  ];
}

function withQuestions(exam, questions) {
  const ensuredQuestions = ensureQuestionIds(questions);
  const multipleChoiceCount = ensuredQuestions.filter(isMultipleChoice).length;

  return {
    ...exam,
    questions: ensuredQuestions,
    multipleChoiceCount
  };
}

function findQuestionSection(groups, questionId) {
  if (groups.multipleChoice.some(question => question?.id === questionId)) {
    return "multiple-choice";
  }

  if (groups.extendedResponse.some(question => question?.id === questionId)) {
    return "extended-response";
  }

  return null;
}

function getSectionIndex(questions, absoluteIndex, section) {
  let sectionIndex = -1;

  for (let index = 0; index <= absoluteIndex; index++) {
    if (getQuestionSection(questions[index]) === section) {
      sectionIndex += 1;
    }
  }

  return sectionIndex;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
