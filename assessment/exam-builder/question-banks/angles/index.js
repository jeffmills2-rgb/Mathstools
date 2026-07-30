/*
  CHHS Exam Builder — Angle Relationships Question Bank
  ----------------------------------------------------
  Save as:

  question-banks/angles/index.js

  This version removes Basic/Expected.
  It exposes one blended mixed list of angle question types.
*/

import {
  createQuestion,
  SPACE_SIZES
} from "../../schemas/question.schema.js";

import {
  attachQuestionTranslations
} from "../../utils/translation.js";

const TOPIC = "Angle Relationships";

const TYPE_LIST = [
  { id: "straight-line", label: "Angles on a straight line" },
  { id: "right-angle", label: "Angles in a right angle" },
  { id: "around-point", label: "Angles around a point" },
  { id: "vertically-opposite", label: "Vertically opposite angles" },
  { id: "parallel-lines", label: "Parallel lines" },
  { id: "equations-application", label: "Equations application" },
  { id: "protractor", label: "Read an angle from a protractor" }
];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function choice(items) {
  return items[randInt(0, items.length - 1)];
}

function shuffle(items) {
  const arr = items.slice();

  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

function parallelSectorSize(theta, sector) {
  const lower = theta + 180;
  const sectors = {
    upperRight: [0, theta],
    upperLeft: [theta, 180],
    lowerLeft: [180, lower],
    lowerRight: [lower, 360]
  };

  const pair = sectors[sector] || sectors.upperRight;
  let value = pair[1] - pair[0];
  while (value < 0) value += 360;
  return Math.round(value);
}

function makeParallelAngleConfig(relationship) {
  const acute = randInt(25, 75);
  const direction = choice(["rising", "falling"]);
  const theta = direction === "falling" ? 180 - acute : acute;

  const correspondingPairs = [
    { top: "upperRight", bottom: "upperRight" },
    { top: "upperLeft", bottom: "upperLeft" },
    { top: "lowerLeft", bottom: "lowerLeft" },
    { top: "lowerRight", bottom: "lowerRight" }
  ];

  const alternatePairs = [
    { top: "lowerLeft", bottom: "upperRight" },
    { top: "lowerRight", bottom: "upperLeft" }
  ];

  const coInteriorPairs = [
    { top: "lowerLeft", bottom: "upperLeft" },
    { top: "lowerRight", bottom: "upperRight" }
  ];

  const pair = relationship === "co-interior"
    ? choice(coInteriorPairs)
    : relationship === "alternate"
      ? choice(alternatePairs)
      : choice(correspondingPairs);

  const knownIntersection = choice(["top", "bottom"]);
  const missingIntersection = knownIntersection === "top" ? "bottom" : "top";
  const knownSector = pair[knownIntersection];
  const missingSector = pair[missingIntersection];
  const knownAngle = parallelSectorSize(theta, knownSector);
  const answer = parallelSectorSize(theta, missingSector);

  return {
    acute,
    theta,
    direction,
    knownIntersection,
    missingIntersection,
    knownSector,
    missingSector,
    knownAngle,
    answer
  };
}

function randomId(prefix = "angle") {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.random()}`;
}

function makeBalancedPlan(typeIds, count) {
  const ids = typeIds.length ? typeIds.slice() : TYPE_LIST.map(t => t.id);
  const plan = [];

  let i = 0;

  while (plan.length < count) {
    plan.push(ids[i % ids.length]);
    i += 1;
  }

  return shuffle(plan);
}

function friendlyAngle(min, max, step = 5) {
  const values = [];
  for (let value = min; value <= max; value += step) {
    values.push(value);
  }
  return choice(values);
}

function anglePart(value, label = `${value}°`, isMissing = false) {
  return { value, label, isMissing };
}

function shuffledAngleParts(knownAngles, missing, missingLabel = "x") {
  return shuffle([
    ...knownAngles.map(value => anglePart(value)),
    anglePart(missing, missingLabel, true)
  ]);
}

function replaceMissingAngleLabel(question, labelText) {
  if (!question?.diagram?.config) return question;

  question.diagram.config.missingLabel = labelText;

  if (Array.isArray(question.diagram.config.angleParts)) {
    question.diagram.config.angleParts = question.diagram.config.angleParts.map(part => {
      if (part?.isMissing || String(part?.label || "") === "x") {
        return { ...part, label: labelText, isMissing: true };
      }

      return part;
    });
  }

  return question;
}

function makeStraightLineParts() {
  const useThreeAngles = Math.random() < 0.42;

  if (!useThreeAngles) {
    const known = friendlyAngle(35, 145, 5);
    return {
      knownAngles: [known],
      missing: 180 - known
    };
  }

  let a;
  let b;
  let missing;

  do {
    a = friendlyAngle(25, 75, 5);
    b = friendlyAngle(25, 75, 5);
    missing = 180 - a - b;
  } while (missing < 25 || missing > 105);

  return {
    knownAngles: [a, b],
    missing
  };
}

function makeAroundPointParts() {
  const knownCount = choice([1, 2, 3]);
  let knownAngles = [];
  let missing = 0;
  let guard = 0;

  do {
    guard += 1;

    if (knownCount === 1) {
      knownAngles = [friendlyAngle(35, 140, 5)];
    } else if (knownCount === 2) {
      knownAngles = [friendlyAngle(45, 140, 5), friendlyAngle(45, 140, 5)];
    } else {
      knownAngles = [friendlyAngle(55, 130, 5), friendlyAngle(45, 120, 5), friendlyAngle(35, 100, 5)];
    }

    missing = 360 - knownAngles.reduce((sum, value) => sum + value, 0);
  } while (
    guard < 100 &&
    (
      missing < 35 ||
      missing > (knownCount === 1 ? 325 : knownCount === 2 ? 260 : 150)
    )
  );

  return { knownAngles, missing };
}

function straightLineQuestion() {
  const made = makeStraightLineParts();
  const knownTotal = made.knownAngles.reduce((sum, value) => sum + value, 0);
  const workingSubtract = made.knownAngles.length === 1
    ? `${made.knownAngles[0]}°`
    : `(${made.knownAngles.map(value => `${value}°`).join(" + ")})`;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "straight-line",
    marks: 2,
    prompt: "Find the value of x. Give a reason for your answer.",
    diagram: {
      engine: "angle-engine",
      config: {
        diagramType: "straight",
        knownAngles: made.knownAngles,
        angleParts: shuffledAngleParts(made.knownAngles, made.missing, "x"),
        missingLabel: "x"
      }
    },
    answer: `${made.missing}°`,
    working: [
      "Angles on a straight line add to 180°.",
      `x = 180° − ${workingSubtract}`,
      `x = ${made.missing}°`
    ],
    space: SPACE_SIZES.MEDIUM,
    tags: made.knownAngles.length === 2
      ? ["angles", "straight line", "three adjacent angles"]
      : ["angles", "straight line"]
  });
}

function rightAngleQuestion() {
  const known = randInt(20, 70);
  const missing = 90 - known;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "right-angle",
    marks: 2,
    prompt: "Find the value of x. Give a reason for your answer.",
    diagram: {
      engine: "angle-engine",
      config: {
        diagramType: "right",
        knownAngle: known,
        missingLabel: "x"
      }
    },
    answer: `${missing}°`,
    working: [
      "Angles in a right angle add to 90°.",
      `x = 90° − ${known}°`,
      `x = ${missing}°`
    ],
    space: SPACE_SIZES.MEDIUM,
    tags: ["angles", "right angle"]
  });
}

function aroundPointQuestion() {
  const made = makeAroundPointParts();
  const workingSubtract = made.knownAngles.length === 1
    ? `${made.knownAngles[0]}°`
    : `(${made.knownAngles.map(value => `${value}°`).join(" + ")})`;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "around-point",
    marks: 2,
    prompt: "Find the value of x. Give a reason for your answer.",
    diagram: {
      engine: "angle-engine",
      config: {
        diagramType: "point",
        knownAngles: made.knownAngles,
        angleParts: shuffledAngleParts(made.knownAngles, made.missing, "x"),
        missingLabel: "x",
        startAngle: friendlyAngle(0, 60, 5)
      }
    },
    answer: `${made.missing}°`,
    working: [
      "Angles around a point add to 360°.",
      `x = 360° − ${workingSubtract}`,
      `x = ${made.missing}°`
    ],
    space: SPACE_SIZES.MEDIUM,
    tags: ["angles", "around a point", `${made.knownAngles.length + 1} angles`]
  });
}

function verticallyOppositeQuestion() {
  const angle = randInt(35, 145);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "vertically-opposite",
    marks: 2,
    prompt: "Find the value of x. Give a reason for your answer.",
    diagram: {
      engine: "angle-engine",
      config: {
        diagramType: "vertical",
        knownAngle: angle,
        missingLabel: "x"
      }
    },
    answer: `${angle}°`,
    working: [
      "Vertically opposite angles are equal.",
      `x = ${angle}°`
    ],
    space: SPACE_SIZES.MEDIUM,
    tags: ["angles", "vertically opposite"]
  });
}

function parallelLinesQuestion() {
  const relationship = choice(["corresponding", "alternate", "co-interior"]);
  const made = makeParallelAngleConfig(relationship);
  const angle = made.knownAngle;
  const answer = made.answer;

  const reason = relationship === "co-interior"
    ? "Co-interior angles on parallel lines are supplementary."
    : `${relationship[0].toUpperCase() + relationship.slice(1)} angles on parallel lines are equal.`;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "parallel-lines",
    marks: 2,
    prompt: "Find the value of x. Give a reason for your answer.",
    diagram: {
      engine: "angle-engine",
      config: {
        diagramType: "parallel",
        relationship,
        transversalAngle: made.acute,
        transversalDirection: made.direction,
        knownIntersection: made.knownIntersection,
        missingIntersection: made.missingIntersection,
        knownSector: made.knownSector,
        missingSector: made.missingSector,
        knownAngle: angle,
        missingLabel: "x"
      }
    },
    answer: `${answer}°`,
    working: relationship === "co-interior"
      ? [
          reason,
          `x = 180° − ${angle}°`,
          `x = ${answer}°`
        ]
      : [
          reason,
          `x = ${answer}°`
        ],
    space: SPACE_SIZES.MEDIUM,
    tags: ["angles", "parallel lines", relationship]
  });
}


function parseDegreeAnswer(answer) {
  const match = String(answer ?? "").match(/-?\d+/);
  return match ? Number(match[0]) : null;
}

function multiplicationEquationOptions(target) {
  return [2, 3, 4, 5]
    .filter(multiplier => target % multiplier === 0 && target / multiplier >= 5 && target / multiplier <= 90)
    .map(multiplier => ({
      label: `${multiplier}x`,
      x: target / multiplier,
      equation: `${multiplier}x = ${target}°`,
      solve: `x = ${target}° ÷ ${multiplier}`,
      kind: "multiply"
    }));
}

function makeOneStepAngleEquation(target, { preferMultiply = false } = {}) {
  const additiveOptions = [];

  [10, 15, 20, 25, 30, 35, 40].forEach(k => {
    if (target - k >= 5) {
      additiveOptions.push({
        label: `x + ${k}`,
        x: target - k,
        equation: `x + ${k} = ${target}°`,
        solve: `x = ${target}° − ${k}°`,
        kind: "add"
      });
    }

    if (target + k <= 170) {
      additiveOptions.push({
        label: `x − ${k}`,
        x: target + k,
        equation: `x − ${k} = ${target}°`,
        solve: `x = ${target}° + ${k}°`,
        kind: "subtract"
      });
    }
  });

  const multiplyOptions = multiplicationEquationOptions(target);

  if (multiplyOptions.length && (preferMultiply || Math.random() < 0.55)) {
    return choice(multiplyOptions);
  }

  const options = additiveOptions.length ? additiveOptions : multiplyOptions;

  return choice(options.length ? options : [{
    label: "x",
    x: target,
    equation: `x = ${target}°`,
    solve: `x = ${target}°`,
    kind: "plain"
  }]);
}

function equationsApplicationQuestion() {
  const generators = [
    straightLineQuestion,
    rightAngleQuestion,
    aroundPointQuestion,
    verticallyOppositeQuestion,
    parallelLinesQuestion
  ];

  // About half of these questions should use multiplication forms such as
  // 2x, 3x, 4x or 5x. Generate a few candidates until one has a suitable
  // integer solution for a multiplication label.
  const preferMultiply = Math.random() < 0.55;
  let question = null;
  let target = null;

  for (let attempt = 0; attempt < 40; attempt++) {
    const candidate = choice(generators)();
    const candidateTarget = parseDegreeAnswer(candidate.answer);

    if (!preferMultiply || multiplicationEquationOptions(candidateTarget).length) {
      question = candidate;
      target = candidateTarget;
      break;
    }
  }

  if (!question) {
    question = choice(generators)();
    target = parseDegreeAnswer(question.answer);
  }

  const made = makeOneStepAngleEquation(target, { preferMultiply });

  question.id = randomId();
  question.type = "equations-application";
  question.marks = 2;
  question.prompt = "Find the value of x. Give a reason for your answer.";
  replaceMissingAngleLabel(question, made.label);
  question.answer = `x = ${made.x}°`;
  question.working = [
    question.working[0],
    `The marked angle is ${target}°, so ${made.equation}.`,
    made.solve,
    `x = ${made.x}°`
  ];
  question.space = SPACE_SIZES.MEDIUM;
  question.tags = ["angles", "equations application", made.kind, ...(question.tags || [])];

  return question;
}

function protractorQuestion() {
  const friendlyAngles = [
    10, 15, 20, 25, 30, 35, 40, 45,
    50, 55, 60, 65, 70, 75, 80, 85,
    90, 95, 100, 105, 110, 115, 120,
    125, 130, 135, 140, 145, 150, 155,
    160, 165, 170
  ];

  const angle = choice(friendlyAngles);
  const startSide = Math.random() < 0.5 ? "right" : "left";

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "protractor",
    marks: 1,
    prompt: "Read the size of the angle shown on the protractor.",
    diagram: {
      engine: "angle-engine",
      config: {
        diagramType: "protractor",
        angle,
        startSide
      }
    },
    answer: `${angle}°`,
    working: [
      `The angle shown is ${angle}° using the correct protractor scale.`
    ],
    space: SPACE_SIZES.SMALL,
    tags: ["angles", "protractor"]
  });
}

const GENERATORS = {
  "straight-line": straightLineQuestion,
  "right-angle": rightAngleQuestion,
  "around-point": aroundPointQuestion,
  "vertically-opposite": verticallyOppositeQuestion,
  "parallel-lines": parallelLinesQuestion,
  "equations-application": equationsApplicationQuestion,
  "protractor": protractorQuestion
};

export function getAngleQuestionTypes() {
  return TYPE_LIST;
}

export function generateAngleQuestions({
  count = 6,
  allowedTypes = null
} = {}) {
  const allowedTypeList = Array.isArray(allowedTypes)
    ? [...new Set(allowedTypes)].filter(type => GENERATORS[type])
    : null;

  // If allowedTypes is explicitly provided as an empty array, respect that.
  // This prevents unchecked angle subtypes, especially equations-application,
  // from reappearing through the old "empty means all types" fallback.
  const typeIds = allowedTypeList === null
    ? TYPE_LIST.map(t => t.id)
    : allowedTypeList;

  if (!typeIds.length || count < 1) return [];

  const plan = makeBalancedPlan(typeIds, count);
  const questions = [];

  let safety = 0;

  while (questions.length < count && safety < count * 30) {
    const type = plan[questions.length % plan.length];
    const generator = GENERATORS[type];

    if (generator) {
      questions.push(generator());
    }

    safety += 1;
  }

  return questions.map(attachQuestionTranslations);
}
