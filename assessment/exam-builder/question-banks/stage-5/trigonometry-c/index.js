/*
  MMT Exam Builder — Stage 5 Trigonometry C Question Bank
  ------------------------------------------------------
  Save as:

  question-banks/stage-5/trigonometry-c/index.js

  Requires:
  - engines/trigonometry/trigonometry-engine.js

  Covers:
  - 3D right-triangle applications
  - sine rule
  - cosine rule
  - area rule
  - mixed non-right-angled triangle problems
*/

import {
  createQuestion,
  SPACE_SIZES
} from "../../../schemas/question.schema.js";

const TOPIC = "Trigonometry C";
const LARGE_SPACE = SPACE_SIZES.LARGE || SPACE_SIZES.MEDIUM;
const FIVE_MARK_SPACE = SPACE_SIZES.EXTRA_LARGE || SPACE_SIZES.XLARGE || SPACE_SIZES.LARGE || SPACE_SIZES.MEDIUM;

const TYPE_LIST = [
  { id: "sine-rule-side", label: "Sine rule — find an unknown side" },
  { id: "sine-rule-angle", label: "Sine rule — find an unknown angle" },
  { id: "cosine-rule-side", label: "Cosine rule — find an unknown side" },
  { id: "cosine-rule-angle", label: "Cosine rule — find an unknown angle" },
  { id: "area-rule-triangle", label: "Area rule — find the area of a triangle" },
  { id: "mixed-non-right-trig", label: "Choose sine, cosine or area rule" },
  { id: "rectangular-prism-3d", label: "3D Pythagoras in rectangular prisms" },
  { id: "three-dimensional-elevation-bearing", label: "3D bearings and elevation/depression applications" },
  { id: "three-dimensional-practical", label: "Multi-step 3D practical problems" }
];

const UNITS = ["cm", "m"];
const VARIABLES = ["a", "b", "c", "p", "q", "r", "x", "y", "z", "m", "n", "t"];
const ANGLES = [28, 32, 36, 38, 41, 45, 52, 56, 58, 61, 64, 68, 72, 76, 108, 112, 115];

export function getTrigonometryCQuestionTypes() {
  return TYPE_LIST.slice();
}

export function generateTrigonometryCQuestions({ count = 6, allowedTypes = [] } = {}) {
  const plan = makeBalancedPlan(allowedTypes, count);

  return plan.map(type => {
    if (type === "sine-rule-side") return sineRuleSideQuestion();
    if (type === "sine-rule-angle") return sineRuleAngleQuestion();
    if (type === "cosine-rule-side") return cosineRuleSideQuestion();
    if (type === "cosine-rule-angle") return cosineRuleAngleQuestion();
    if (type === "area-rule-triangle") return areaRuleQuestion();
    if (type === "mixed-non-right-trig") return mixedRuleQuestion();
    if (type === "rectangular-prism-3d") return rectangularPrismQuestion();
    if (type === "three-dimensional-elevation-bearing") return bearingElevation3dQuestion();
    if (type === "three-dimensional-practical") return tentPoleQuestion();

    return sineRuleSideQuestion();
  });
}

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

function randomId(prefix = "trig-c") {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeBalancedPlan(typeIds, count) {
  const ids = typeIds.length ? typeIds.slice() : TYPE_LIST.map(type => type.id);
  const out = [];

  let i = 0;
  while (out.length < count) {
    out.push(ids[i % ids.length]);
    i += 1;
  }

  return shuffle(out);
}

function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

function radToDeg(radians) {
  return radians * 180 / Math.PI;
}

function sin(degrees) {
  return Math.sin(degToRad(degrees));
}

function cos(degrees) {
  return Math.cos(degToRad(degrees));
}

function asin(value) {
  return radToDeg(Math.asin(value));
}

function acos(value) {
  return radToDeg(Math.acos(value));
}

function round(value, dp = 1) {
  return Number(value.toFixed(dp));
}

function fmt(value, dp = 1) {
  const rounded = round(value, dp);
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(dp);
}

function unitValue(value, unit = "cm", dp = 1) {
  return `${fmt(value, dp)} ${unit}`;
}

function angleValue(value, dp = 0) {
  return `${fmt(value, dp)}°`;
}

function money(value) {
  return `$${Number(value).toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function randomUnit() {
  return choice(UNITS);
}

function randomVariable(except = []) {
  const avoid = new Set(except);
  return choice(VARIABLES.filter(v => !avoid.has(v)));
}

function triangleDiagram(config = {}) {
  return {
    engine: "trigonometry-engine",
    config: {
      diagramType: "non-right-triangle",
      // Trig C uses actual side-length values as coordinate data. Let the
      // engine scale these diagrams up so labels do not clash.
      maxScale: 28,
      marginX: 96,
      marginY: 70,
      ...config
    }
  };
}

function prismDiagram(config = {}) {
  return {
    engine: "trigonometry-engine",
    config: {
      diagramType: "rectangular-prism-3d",
      ...config
    }
  };
}

function tentDiagram(config = {}) {
  return {
    engine: "trigonometry-engine",
    config: {
      diagramType: "tent-pole-3d",
      ...config
    }
  };
}

function bearingElevationDiagram(config = {}) {
  return {
    engine: "trigonometry-engine",
    config: {
      diagramType: "bearing-elevation-3d",
      ...config
    }
  };
}

function blankDiagram(config = {}) {
  return {
    engine: "trigonometry-engine",
    config: {
      diagramType: "blank-diagram-space",
      // These are intentionally for student-drawn diagrams only, not for
      // generated diagrams. The engine uses this to remove the narrow centred
      // diagram layout and provide a full-width pencil-and-paper space.
      fullWidth: true,
      ...config
    }
  };
}

function trigQuestion({
  type,
  marks = 2,
  prompt,
  answer,
  working = [],
  diagram = null,
  space = SPACE_SIZES.MEDIUM,
  tags = []
}) {
  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type,
    marks,
    prompt,
    diagram,
    answer,
    working,
    space,
    tags: ["stage-5", "trigonometry", "trigonometry-c", type, ...tags]
  });
}

function triangleFromASA({ A, B, a }) {
  const C = 180 - A - B;
  const b = a * sin(B) / sin(A);
  const c = a * sin(C) / sin(A);
  return triangleFromSSS({ a, b, c });
}

function triangleFromSAS({ A, b, c }) {
  const a = Math.sqrt(b ** 2 + c ** 2 - 2 * b * c * cos(A));
  return triangleFromSSS({ a, b, c });
}

function triangleFromSSS({ a, b, c }) {
  // Standard notation: a = BC, b = AC, c = AB.
  const B = { x: 0, y: 0 };
  const C = { x: a, y: 0 };
  const x = (c ** 2 + a ** 2 - b ** 2) / (2 * a);
  const y = -Math.sqrt(Math.max(12, c ** 2 - x ** 2));

  return {
    vertices: {
      A: { x, y },
      B,
      C
    }
  };
}

function angleFromSides({ a, b, c }) {
  const value = (b ** 2 + c ** 2 - a ** 2) / (2 * b * c);
  return acos(Math.min(1, Math.max(-1, value)));
}

function safeAngles() {
  const A = choice([38, 42, 46, 52, 58, 64, 68]);
  const B = choice([34, 40, 48, 56, 62, 70]);
  if (A + B > 132) return { A: 48, B: 62, C: 70 };
  return { A, B, C: 180 - A - B };
}

function sineRuleSideQuestion() {
  const { A, B } = safeAngles();
  const unit = randomUnit();
  const knownSide = randInt(7, 18);
  const unknown = choice(["a", "b", "p", "x"]);
  const unknownSide = knownSide * sin(B) / sin(A);
  const { vertices } = triangleFromASA({ A, B, a: knownSide });

  return trigQuestion({
    type: "sine-rule-side",
    marks: 2,
    prompt: `Use the sine rule to calculate the value of ${unknown}, correct to 1 decimal place.`,
    diagram: triangleDiagram({
      vertices,
      sideLabels: {
        a: `${knownSide} ${unit}`,
        b: unknown
      },
      angleLabels: {
        A: angleValue(A),
        B: angleValue(B)
      }
    }),
    answer: unitValue(unknownSide, unit),
    working: [
      `Use the sine rule because a side and its opposite angle are known.`,
      `${unknown} / sin ${B}° = ${knownSide} / sin ${A}°`,
      `${unknown} = ${knownSide} × sin ${B}° ÷ sin ${A}°`,
      `${unknown} = ${unitValue(unknownSide, unit)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function sineRuleAngleQuestion() {
  const A = choice([34, 38, 42, 46, 52, 56]);
  const B = choice([48, 54, 60, 66, 72]);
  const unit = randomUnit();
  const a = randInt(12, 24);
  const b = a * sin(B) / sin(A);
  const { vertices } = triangleFromASA({ A, B, a });
  const rawValue = sin(A) * b / a;
  const calculatedB = asin(Math.min(1, Math.max(-1, rawValue)));

  return trigQuestion({
    type: "sine-rule-angle",
    marks: 2,
    prompt: `Use the sine rule to calculate angle B, correct to 1 decimal place.`,
    diagram: triangleDiagram({
      vertices,
      sideLabels: {
        a: `${a} ${unit}`,
        b: `${fmt(b, 1)} ${unit}`
      },
      angleLabels: {
        A: angleValue(A),
        B: "B"
      },
      vertexLabels: { A: "A", B: "B", C: "C" }
    }),
    answer: angleValue(calculatedB, 1),
    working: [
      `Use the sine rule because two sides and one opposite angle are known.`,
      `sin B / ${fmt(b, 1)} = sin ${A}° / ${a}`,
      `sin B = ${fmt(b, 1)} × sin ${A}° ÷ ${a}`,
      `B = ${angleValue(calculatedB, 1)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function cosineRuleSideQuestion() {
  const A = choice([52, 61, 66, 71, 78, 104, 112]);
  const b = randInt(6, 15);
  const c = randInt(7, 16);
  const unit = randomUnit();
  const variable = randomVariable(["a"]);
  const a = Math.sqrt(b ** 2 + c ** 2 - 2 * b * c * cos(A));
  const { vertices } = triangleFromSAS({ A, b, c });

  return trigQuestion({
    type: "cosine-rule-side",
    marks: 2,
    prompt: `Use the cosine rule to calculate the value of ${variable}, correct to 1 decimal place.`,
    diagram: triangleDiagram({
      vertices,
      sideLabels: {
        a: variable,
        b: `${b} ${unit}`,
        c: `${c} ${unit}`
      },
      angleLabels: {
        A: angleValue(A)
      }
    }),
    answer: unitValue(a, unit),
    working: [
      `Use the cosine rule because two sides and the included angle are known.`,
      `${variable}² = ${b}² + ${c}² − 2 × ${b} × ${c} × cos ${A}°`,
      `${variable} = ${unitValue(a, unit)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function cosineRuleAngleQuestion() {
  const b = randInt(6, 14);
  const c = randInt(7, 16);
  const A = choice([42, 55, 68, 76, 102, 118]);
  const a = Math.sqrt(b ** 2 + c ** 2 - 2 * b * c * cos(A));
  const unit = randomUnit();
  const { vertices } = triangleFromSAS({ A, b, c });
  const calculatedA = angleFromSides({ a, b, c });

  return trigQuestion({
    type: "cosine-rule-angle",
    marks: 2,
    prompt: `Use the cosine rule to calculate the size of ∠A, correct to the nearest degree.`,
    diagram: triangleDiagram({
      vertices,
      sideLabels: {
        a: `${fmt(a, 1)} ${unit}`,
        b: `${b} ${unit}`,
        c: `${c} ${unit}`
      },
      angleLabels: {
        A: "A"
      }
    }),
    answer: angleValue(calculatedA, 0),
    working: [
      `Use the rearranged cosine rule to find an angle.`,
      `cos A = (${b}² + ${c}² − ${fmt(a, 1)}²) ÷ (2 × ${b} × ${c})`,
      `A = ${angleValue(calculatedA, 0)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function areaRuleQuestion() {
  const A = choice([38, 45, 57, 65, 74, 98, 112]);
  const b = randInt(7, 18);
  const c = randInt(6, 16);
  const unit = randomUnit();
  const area = 0.5 * b * c * sin(A);
  const { vertices } = triangleFromSAS({ A, b, c });

  return trigQuestion({
    type: "area-rule-triangle",
    marks: 2,
    prompt: `Use the area rule to calculate the area of the triangle, correct to 1 decimal place.`,
    diagram: triangleDiagram({
      vertices,
      sideLabels: {
        b: `${b} ${unit}`,
        c: `${c} ${unit}`
      },
      angleLabels: {
        A: angleValue(A)
      }
    }),
    answer: `${fmt(area, 1)} ${unit}²`,
    working: [
      `Use A = 1/2 ab sin C with the two given sides and the included angle.`,
      `Area = 1/2 × ${b} × ${c} × sin ${A}°`,
      `Area = ${fmt(area, 1)} ${unit}²`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function mixedRuleQuestion() {
  return Math.random() < 0.5
    ? mixedPracticalSineQuestion()
    : mixedPracticalCosineQuestion();
}

function mixedPracticalSineQuestion() {
  const base = choice([120, 150, 180, 220, 300, 350]);
  const angleP = choice([42, 48, 52, 56, 61, 68]);
  const angleQ = choice([38, 44, 50, 56, 62]);
  const angleR = 180 - angleP - angleQ;
  const distFromP = base * sin(angleQ) / sin(angleR);
  const { vertices } = triangleFromASA({ A: angleR, B: angleP, a: base });

  return trigQuestion({
    type: "mixed-non-right-trig",
    marks: 3,
    prompt: `Two observation points P and Q are ${base} m apart. A tower R is seen so that ∠RPQ = ${angleP}° and ∠RQP = ${angleQ}°. Calculate the distance PR, correct to the nearest metre.`,
    diagram: blankDiagram({
      caption: "Draw a labelled diagram here"
    }),
    answer: `${Math.round(distFromP)} m`,
    working: [
      `Find the third angle: ∠R = 180° − ${angleP}° − ${angleQ}° = ${angleR}°`,
      `Use the sine rule because a side and its opposite angle are known.`,
      `PR / sin ${angleQ}° = ${base} / sin ${angleR}°`,
      `PR = ${base} × sin ${angleQ}° ÷ sin ${angleR}°`,
      `PR = ${Math.round(distFromP)} m`
    ],
    space: LARGE_SPACE,
    tags: ["practical", "sine rule"]
  });
}

function mixedPracticalCosineQuestion() {
  const side1 = randInt(80, 180);
  const side2 = randInt(90, 220);
  const included = choice([54, 63, 72, 83, 96, 108, 121]);
  const answer = Math.sqrt(side1 ** 2 + side2 ** 2 - 2 * side1 * side2 * cos(included));
  const { vertices } = triangleFromSAS({ A: included, b: side1, c: side2 });

  return trigQuestion({
    type: "mixed-non-right-trig",
    marks: 3,
    prompt: `A surveyor walks ${side1} m from A to B and then ${side2} m from A to C. The angle BAC is ${included}°. Calculate the distance BC, correct to the nearest metre.`,
    diagram: blankDiagram({
      caption: "Draw a labelled diagram here"
    }),
    answer: `${Math.round(answer)} m`,
    working: [
      `Use the cosine rule because two sides and the included angle are known.`,
      `BC² = ${side1}² + ${side2}² − 2 × ${side1} × ${side2} × cos ${included}°`,
      `BC = ${Math.round(answer)} m`
    ],
    space: LARGE_SPACE,
    tags: ["practical", "cosine rule"]
  });
}

function rectangularPrismQuestion() {
  const length = randInt(7, 16);
  const width = randInt(4, 10);
  const height = randInt(3, 9);
  const faceDiagonal = Math.sqrt(length ** 2 + width ** 2);
  const spaceDiagonal = Math.sqrt(faceDiagonal ** 2 + height ** 2);
  const diagonalVariant = choice(["A-G", "B-H", "C-E", "D-F"]);

  return trigQuestion({
    type: "rectangular-prism-3d",
    marks: 3,
    prompt: `A rectangular prism is ${length} cm long, ${width} cm wide and ${height} cm high. Calculate the length of its space diagonal, correct to 2 decimal places.`,
    diagram: prismDiagram({
      lengthLabel: `${length} cm`,
      widthLabel: `${width} cm`,
      heightLabel: `${height} cm`,
      showFaceDiagonal: true,
      showSpaceDiagonal: true,
      faceDiagonalLabel: "d",
      spaceDiagonalLabel: "x",
      diagonalVariant
    }),
    answer: `${fmt(spaceDiagonal, 2)} cm`,
    working: [
      `First find the base diagonal.`,
      `d² = ${length}² + ${width}²`,
      `d = ${fmt(faceDiagonal, 2)} cm`,
      `Now use Pythagoras with the height.`,
      `x² = ${fmt(faceDiagonal, 2)}² + ${height}²`,
      `x = ${fmt(spaceDiagonal, 2)} cm`
    ],
    space: LARGE_SPACE,
    tags: ["3D", "Pythagoras"]
  });
}

function bearingElevation3dQuestion() {
  const useNoDiagram = Math.random() < 0.35;
  const template = choice(["horizontal-distance", "height-from-distance", "two-observers"]);

  if (useNoDiagram || template === "two-observers") {
    return bearingElevationNoDiagramQuestion(template);
  }

  const context = choice([
    { object: "drone", point: "the point directly below the drone" },
    { object: "weather balloon", point: "the point directly below the balloon" },
    { object: "helicopter", point: "the point directly below the helicopter" },
    { object: "repeater station", point: "the base of the station" }
  ]);
  const height = choice([24, 30, 36, 42, 48, 60]);
  const elevation = choice([24, 28, 32, 35, 39, 43]);
  const horizontal = height / Math.tan(degToRad(elevation));
  const bearing = choice([28, 36, 42, 125, 202, 250, 318]);

  return trigQuestion({
    type: "three-dimensional-elevation-bearing",
    marks: 3,
    prompt: `A ${context.object} is observed from point P on a true bearing of ${String(bearing).padStart(3, "0")}°. The angle of elevation to the ${context.object} is ${elevation}° and the ${context.object} is ${height} m above level ground. Calculate the horizontal distance from P to ${context.point}, correct to 1 decimal place.`,
    diagram: bearingElevationDiagram({
      bearing,
      bearingLabel: `${String(bearing).padStart(3, "0")}°`,
      elevationLabel: `${elevation}°`,
      heightLabel: `${height} m`,
      horizontalLabel: "x",
      originLabel: "P",
      targetLabel: "D",
      topLabel: context.object
    }),
    answer: `${fmt(horizontal, 1)} m`,
    working: [
      `The horizontal distance and height form a right-angled triangle.`,
      `tan ${elevation}° = ${height} / x`,
      `x = ${height} ÷ tan ${elevation}°`,
      `x = ${fmt(horizontal, 1)} m`
    ],
    space: LARGE_SPACE,
    tags: ["3D", "bearing", "elevation"]
  });
}

function bearingElevationNoDiagramQuestion(template = "horizontal-distance") {
  if (template === "two-observers") {
    const height = choice([80, 120, 150, 180, 240]);
    const angleA = choice([28, 32, 36, 40]);
    const angleB = choice([42, 48, 52, 58]);
    const distA = height / Math.tan(degToRad(angleA));
    const distB = height / Math.tan(degToRad(angleB));
    const separation = Math.abs(distA - distB);

    return trigQuestion({
      type: "three-dimensional-elevation-bearing",
      marks: 5,
      prompt: `Two observation points A and B lie on the same straight horizontal line from the base of a tower. The angle of elevation from A to the top of the tower is ${angleA}° and the angle of elevation from B is ${angleB}°. The tower is ${height} m high. Draw a diagram and calculate the distance between A and B, correct to 1 decimal place.`,
      diagram: blankDiagram({ caption: "Draw a labelled diagram here", size: "large" }),
      answer: `${fmt(separation, 1)} m`,
      working: [
        `Draw two right-angled triangles sharing the same vertical height of ${height} m.`,
        `Distance from A to the base = ${height} ÷ tan ${angleA}° = ${fmt(distA, 1)} m`,
        `Distance from B to the base = ${height} ÷ tan ${angleB}° = ${fmt(distB, 1)} m`,
        `Distance AB = ${fmt(distA, 1)} − ${fmt(distB, 1)} = ${fmt(separation, 1)} m`
      ],
      space: FIVE_MARK_SPACE,
      tags: ["3D", "elevation", "no diagram"]
    });
  }

  if (template === "height-from-distance") {
    const bearing = choice([32, 48, 126, 204, 248, 315]);
    const horizontal = choice([85, 120, 160, 210, 280]);
    const elevation = choice([21, 26, 31, 37, 44]);
    const height = horizontal * Math.tan(degToRad(elevation));
    const object = choice(["lighthouse", "communications tower", "lookout tower", "flagpole"]);

    return trigQuestion({
      type: "three-dimensional-elevation-bearing",
      marks: 5,
      prompt: `From point P, the base of a ${object} is on a true bearing of ${String(bearing).padStart(3, "0")}° and is ${horizontal} m away horizontally. The angle of elevation to the top of the ${object} is ${elevation}°. Draw a diagram and calculate the height of the ${object}, correct to 1 decimal place.`,
      diagram: blankDiagram({ caption: "Draw a labelled diagram here", size: "large" }),
      answer: `${fmt(height, 1)} m`,
      working: [
        `Draw a bearing diagram to locate the base, then a vertical right-angled triangle.`,
        `tan ${elevation}° = h / ${horizontal}`,
        `h = ${horizontal} × tan ${elevation}°`,
        `h = ${fmt(height, 1)} m`
      ],
      space: FIVE_MARK_SPACE,
      tags: ["3D", "bearing", "elevation", "no diagram"]
    });
  }

  const height = choice([24, 30, 36, 42, 48, 60]);
  const elevation = choice([24, 28, 32, 35, 39, 43]);
  const horizontal = height / Math.tan(degToRad(elevation));
  const bearing = choice([28, 36, 42, 125, 202, 250, 318]);
  const object = choice(["drone", "weather balloon", "helicopter"]);

  return trigQuestion({
    type: "three-dimensional-elevation-bearing",
    marks: 5,
    prompt: `A ${object} is observed from point P on a true bearing of ${String(bearing).padStart(3, "0")}°. The angle of elevation to the ${object} is ${elevation}° and the ${object} is ${height} m above level ground. Draw a diagram and calculate the horizontal distance from P to the point directly below the ${object}, correct to 1 decimal place.`,
    diagram: blankDiagram({ caption: "Draw a labelled diagram here", size: "large" }),
    answer: `${fmt(horizontal, 1)} m`,
    working: [
      `Draw the true bearing from north, then draw the vertical height at the ground point below the object.`,
      `tan ${elevation}° = ${height} / x`,
      `x = ${height} ÷ tan ${elevation}°`,
      `x = ${fmt(horizontal, 1)} m`
    ],
    space: FIVE_MARK_SPACE,
    tags: ["3D", "bearing", "elevation", "no diagram"]
  });
}


function tentPoleQuestion() {
  const height = choice([2.1, 2.4, 2.7, 3.0]);
  const angleA = choice([39, 41, 43, 46]);
  const angleB = choice([34, 37, 40, 42]);
  const distanceA = height / Math.tan(degToRad(angleA));
  const distanceB = height / Math.tan(degToRad(angleB));
  const pegDistance = Math.sqrt(distanceA ** 2 + distanceB ** 2);

  return trigQuestion({
    type: "three-dimensional-practical",
    marks: 4,
    prompt: `A vertical tent pole is ${height} m tall. Two ropes reach from the top of the pole to pegs A and B. The ropes make angles of ${angleA}° and ${angleB}° to the horizontal, respectively. The line from the base of the pole to peg A is at right angles to the line from the base of the pole to peg B. Calculate the distance between peg A and peg B, correct to 2 decimal places.`,
    diagram: tentDiagram({
      heightLabel: `${height} m`,
      angleALabel: `${angleA}°`,
      angleBLabel: `${angleB}°`
    }),
    answer: `${fmt(pegDistance, 2)} m`,
    working: [
      `Find the horizontal distance from the base to peg A.`,
      `tan ${angleA}° = ${height} / OA`,
      `OA = ${height} ÷ tan ${angleA}° = ${fmt(distanceA, 2)} m`,
      `Find the horizontal distance from the base to peg B.`,
      `tan ${angleB}° = ${height} / OB`,
      `OB = ${height} ÷ tan ${angleB}° = ${fmt(distanceB, 2)} m`,
      `Since OA and OB are at right angles, use Pythagoras.`,
      `AB² = ${fmt(distanceA, 2)}² + ${fmt(distanceB, 2)}²`,
      `AB = ${fmt(pegDistance, 2)} m`
    ],
    space: LARGE_SPACE,
    tags: ["3D", "elevation", "Pythagoras"]
  });
}
