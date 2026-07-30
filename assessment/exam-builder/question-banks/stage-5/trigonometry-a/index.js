/*
  MMT Exam Builder — Stage 5 Trigonometry A Question Bank
  ------------------------------------------------------
  Save as:

  question-banks/stage-5/trigonometry-a/index.js

  Requires:
  - engines/trigonometry/trigonometry-engine.js
*/

import {
  createQuestion,
  SPACE_SIZES
} from "../../../schemas/question.schema.js";

const TOPIC = "Trigonometry A";

const TYPE_LIST = [
  { id: "identify-hoa", label: "Identify hypotenuse, opposite and adjacent sides" },
  { id: "match-trig-ratios", label: "Match sine, cosine and tangent ratios" },
  { id: "write-trig-equation", label: "Write a trigonometric equation from a triangle" },
  { id: "find-unknown-side", label: "Find an unknown side using sin, cos or tan" },
  { id: "find-unknown-angle", label: "Find an unknown angle using inverse trig" },
  { id: "degrees-minutes", label: "Trigonometry with degrees and minutes" },
  { id: "similar-constant-ratios", label: "Similar triangles and constant trig ratios" },
  { id: "approximate-trig-ratios", label: "Approximate trig ratios for a given angle" },
  { id: "practical-problems", label: "Practical right-triangle problems" },
  { id: "mixed-trigonometry", label: "Mixed trigonometry problems" }
];

const ROTATIONS = [0, 90, 180, 270, 18, -18, 162, -162, 72, -72];
const UNKNOWN_VARIABLES = ["x", "y", "z", "m", "n", "p", "q", "r", "s", "t", "u", "v", "w"];

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

function randomId(prefix = "trig-a") {
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

function tan(degrees) {
  return Math.tan(degToRad(degrees));
}

function asin(value) {
  return radToDeg(Math.asin(value));
}

function acos(value) {
  return radToDeg(Math.acos(value));
}

function atan(value) {
  return radToDeg(Math.atan(value));
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

function angleValue(value) {
  return `${Math.round(value)}°`;
}

function formatDegreesMinutes(decimalDegrees) {
  const totalMinutes = Math.round(decimalDegrees * 60);
  const degrees = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return minutes === 0
    ? `${degrees}°`
    : `${degrees}° ${minutes}′`;
}

function parseDegMin(degrees, minutes) {
  return degrees + minutes / 60;
}

function niceDegMinAngle() {
  const degrees = randInt(25, 72);
  const minutes = choice([10, 15, 20, 30, 40, 45, 50]);

  return {
    degrees,
    minutes,
    decimal: parseDegMin(degrees, minutes),
    label: `${degrees}° ${minutes}′`
  };
}

function randomAngle() {
  return randInt(25, 75);
}

function referenceVertex() {
  return choice(["B", "C"]);
}

function rotation() {
  return choice(ROTATIONS);
}

function randomVariable() {
  return choice(UNKNOWN_VARIABLES);
}

function trigDiagram(config = {}) {
  return {
    engine: "trigonometry-engine",
    config: {
      diagramType: "right-triangle",
      rotation: rotation(),
      ...config
    }
  };
}

function similarDiagram(config = {}) {
  return {
    engine: "trigonometry-engine",
    config: {
      diagramType: "similar-right-triangles",
      ...config
    }
  };
}

function practicalDiagram(config = {}) {
  return {
    engine: "trigonometry-engine",
    config: {
      diagramType: "practical-trig",
      ...config
    }
  };
}

function practicalAngle() {
  return randInt(25, 60);
}

function trigQuestion({
  type,
  marks = 1,
  prompt,
  answer,
  working = [],
  diagram = null,
  table = null,
  matching = null,
  space = SPACE_SIZES.MEDIUM,
  tags = []
}) {
  const question = createQuestion({
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
    tags: ["stage-5", "trigonometry", type, ...tags]
  });

  // Some schema versions do not accept table/matching inside createQuestion(),
  // so attach these optional renderer fields after validation.
  if (table) question.table = table;
  if (matching) question.matching = matching;

  return question;
}

function sideNamesForReference(ref) {
  if (ref === "C") {
    return {
      hypotenuse: "BC",
      adjacent: "AC",
      opposite: "AB"
    };
  }

  return {
    hypotenuse: "BC",
    adjacent: "AB",
    opposite: "AC"
  };
}

function ratioExpression(ratio, angleLabel = "θ") {
  if (ratio === "sin") return `sin ${angleLabel} = opposite/hypotenuse`;
  if (ratio === "cos") return `cos ${angleLabel} = adjacent/hypotenuse`;
  return `tan ${angleLabel} = opposite/adjacent`;
}

function ratioWithSides(ratio, numerator, denominator, angleLabel = "θ") {
  return `${ratio} ${angleLabel} = ${numerator}/${denominator}`;
}

function ratioName(ratio) {
  if (ratio === "sin") return "sine";
  if (ratio === "cos") return "cosine";
  return "tangent";
}

function buildSideFindingCase(variable = randomVariable()) {
  const ratio = choice(["sin", "cos", "tan"]);
  const unknown = choice(["numerator", "denominator"]);
  const angle = randomAngle();
  const unit = choice(["cm", "m"]);
  let known;
  let answer;
  let sideLabels;
  let equation;
  let working;

  if (ratio === "sin") {
    if (unknown === "numerator") {
      known = randInt(8, 22);
      answer = known * sin(angle);
      sideLabels = { hypotenuse: unitValue(known, unit, 0), opposite: variable };
      equation = `sin ${angle}° = ${variable}/${known}`;
      working = [
        `Use sine because opposite and hypotenuse are involved.`,
        `sin ${angle}° = ${variable}/${known}`,
        `${variable} = ${known} × sin ${angle}°`,
        `${variable} = ${unitValue(answer, unit)}`
      ];
    } else {
      known = randInt(6, 18);
      answer = known / sin(angle);
      sideLabels = { opposite: unitValue(known, unit, 0), hypotenuse: variable };
      equation = `sin ${angle}° = ${known}/${variable}`;
      working = [
        `Use sine because opposite and hypotenuse are involved.`,
        `sin ${angle}° = ${known}/${variable}`,
        `${variable} = ${known} ÷ sin ${angle}°`,
        `${variable} = ${unitValue(answer, unit)}`
      ];
    }
  }

  if (ratio === "cos") {
    if (unknown === "numerator") {
      known = randInt(8, 22);
      answer = known * cos(angle);
      sideLabels = { hypotenuse: unitValue(known, unit, 0), adjacent: variable };
      equation = `cos ${angle}° = ${variable}/${known}`;
      working = [
        `Use cosine because adjacent and hypotenuse are involved.`,
        `cos ${angle}° = ${variable}/${known}`,
        `${variable} = ${known} × cos ${angle}°`,
        `${variable} = ${unitValue(answer, unit)}`
      ];
    } else {
      known = randInt(6, 18);
      answer = known / cos(angle);
      sideLabels = { adjacent: unitValue(known, unit, 0), hypotenuse: variable };
      equation = `cos ${angle}° = ${known}/${variable}`;
      working = [
        `Use cosine because adjacent and hypotenuse are involved.`,
        `cos ${angle}° = ${known}/${variable}`,
        `${variable} = ${known} ÷ cos ${angle}°`,
        `${variable} = ${unitValue(answer, unit)}`
      ];
    }
  }

  if (ratio === "tan") {
    if (unknown === "numerator") {
      known = randInt(6, 20);
      answer = known * tan(angle);
      sideLabels = { adjacent: unitValue(known, unit, 0), opposite: variable };
      equation = `tan ${angle}° = ${variable}/${known}`;
      working = [
        `Use tangent because opposite and adjacent are involved.`,
        `tan ${angle}° = ${variable}/${known}`,
        `${variable} = ${known} × tan ${angle}°`,
        `${variable} = ${unitValue(answer, unit)}`
      ];
    } else {
      known = randInt(6, 20);
      answer = known / tan(angle);
      sideLabels = { opposite: unitValue(known, unit, 0), adjacent: variable };
      equation = `tan ${angle}° = ${known}/${variable}`;
      working = [
        `Use tangent because opposite and adjacent are involved.`,
        `tan ${angle}° = ${known}/${variable}`,
        `${variable} = ${known} ÷ tan ${angle}°`,
        `${variable} = ${unitValue(answer, unit)}`
      ];
    }
  }

  return {
    ratio,
    angle,
    unit,
    variable,
    sideLabels,
    answer,
    equation,
    working
  };
}

function identifyHoaQuestion() {
  const angle = randomAngle();
  const ref = referenceVertex();
  const names = sideNamesForReference(ref);

  return trigQuestion({
    type: "identify-hoa",
    marks: 1,
    prompt: `For the marked angle θ, identify the hypotenuse, opposite side and adjacent side.
Hypotenuse: ________    Opposite: ________    Adjacent: ________`,
    diagram: trigDiagram({
      angle,
      angleLabel: "θ",
      referenceVertex: ref,
      marginX: 95,
      marginY: 55,
      angleRadius: 31,
      angleLabelRadius: 50
    }),
    answer: `Hypotenuse: ${names.hypotenuse}; opposite: ${names.opposite}; adjacent: ${names.adjacent}`,
    working: [
      `Hypotenuse: ${names.hypotenuse}`,
      `Opposite: ${names.opposite}`,
      `Adjacent: ${names.adjacent}`
    ],
    space: "none"
  });
}

function matchTrigRatiosQuestion() {
  const angle = randomAngle();
  const ref = referenceVertex();
  const right = shuffle(["o/h", "a/h", "o/a"]);

  return trigQuestion({
    type: "match-trig-ratios",
    marks: 2,
    prompt: "Draw a line to match each trigonometric ratio to the correct fraction.",
    diagram: trigDiagram({
      angle,
      angleLabel: "θ",
      referenceVertex: ref,
      sideLabels: {
        hypotenuse: "h",
        opposite: "o",
        adjacent: "a"
      },
      showVertices: false,
      marginX: 95,
      marginY: 55,
      angleRadius: 31,
      angleLabelRadius: 50
    }),
    matching: {
      left: ["sin θ", "cos θ", "tan θ"],
      right,
      answer: {
        "sin θ": "o/h",
        "cos θ": "a/h",
        "tan θ": "o/a"
      }
    },
    answer: "sin θ → o/h; cos θ → a/h; tan θ → o/a",
    working: [
      "sin θ matches o/h",
      "cos θ matches a/h",
      "tan θ matches o/a"
    ],
    space: "none"
  });
}

function writeTrigEquationQuestion() {
  const ratio = choice(["sin", "cos", "tan"]);
  const angle = randomAngle();
  const ref = referenceVertex();
  const unit = choice(["cm", "m"]);
  const variable = randomVariable();
  let sideLabels;
  let answer;

  if (ratio === "sin") {
    const hyp = randInt(8, 22);
    sideLabels = { hypotenuse: unitValue(hyp, unit, 0), opposite: variable };
    answer = ratioWithSides("sin", variable, String(hyp), `${angle}°`);
  } else if (ratio === "cos") {
    const hyp = randInt(8, 22);
    sideLabels = { hypotenuse: unitValue(hyp, unit, 0), adjacent: variable };
    answer = ratioWithSides("cos", variable, String(hyp), `${angle}°`);
  } else {
    const adj = randInt(6, 20);
    sideLabels = { adjacent: unitValue(adj, unit, 0), opposite: variable };
    answer = ratioWithSides("tan", variable, String(adj), `${angle}°`);
  }

  return trigQuestion({
    type: "write-trig-equation",
    marks: 1,
    prompt: `Write a trigonometric equation that could be used to find ${variable}.`,
    diagram: trigDiagram({
      angle,
      angleLabel: `${angle}°`,
      referenceVertex: ref,
      sideLabels,
      marginX: 95,
      marginY: 55,
      angleRadius: 31,
      angleLabelRadius: 50
    }),
    answer,
    working: [
      `The required ratio is ${ratioName(ratio)}.`,
      answer
    ],
    space: SPACE_SIZES.SMALL
  });
}

function findUnknownSideQuestion() {
  const variable = randomVariable();
  const data = buildSideFindingCase(variable);
  const ref = referenceVertex();

  return trigQuestion({
    type: "find-unknown-side",
    marks: 2,
    prompt: `Find the value of ${variable}. Give your answer correct to 1 decimal place.`,
    diagram: trigDiagram({
      angle: data.angle,
      angleLabel: `${data.angle}°`,
      referenceVertex: ref,
      sideLabels: data.sideLabels,
      marginX: 95,
      marginY: 55,
      angleRadius: 31,
      angleLabelRadius: 50
    }),
    answer: unitValue(data.answer, data.unit),
    working: data.working,
    space: SPACE_SIZES.MEDIUM
  });
}

function findUnknownAngleQuestion() {
  const ratio = choice(["sin", "cos", "tan"]);
  const angle = randomAngle();
  const unit = choice(["cm", "m"]);
  const ref = referenceVertex();
  let sideLabels;
  let ratioValue;
  let answer;
  let working;

  if (ratio === "sin") {
    const hyp = randInt(10, 24);
    const opp = round(hyp * sin(angle), 1);
    ratioValue = opp / hyp;
    answer = asin(ratioValue);
    sideLabels = { opposite: unitValue(opp, unit), hypotenuse: unitValue(hyp, unit, 0) };
    working = [
      `sin θ = opposite/hypotenuse`,
      `sin θ = ${opp}/${hyp}`,
      `θ = sin⁻¹(${opp}/${hyp})`,
      `θ = ${angleValue(answer)}`
    ];
  } else if (ratio === "cos") {
    const hyp = randInt(10, 24);
    const adj = round(hyp * cos(angle), 1);
    ratioValue = adj / hyp;
    answer = acos(ratioValue);
    sideLabels = { adjacent: unitValue(adj, unit), hypotenuse: unitValue(hyp, unit, 0) };
    working = [
      `cos θ = adjacent/hypotenuse`,
      `cos θ = ${adj}/${hyp}`,
      `θ = cos⁻¹(${adj}/${hyp})`,
      `θ = ${angleValue(answer)}`
    ];
  } else {
    const adj = randInt(7, 20);
    const opp = round(adj * tan(angle), 1);
    ratioValue = opp / adj;
    answer = atan(ratioValue);
    sideLabels = { opposite: unitValue(opp, unit), adjacent: unitValue(adj, unit, 0) };
    working = [
      `tan θ = opposite/adjacent`,
      `tan θ = ${opp}/${adj}`,
      `θ = tan⁻¹(${opp}/${adj})`,
      `θ = ${angleValue(answer)}`
    ];
  }

  return trigQuestion({
    type: "find-unknown-angle",
    marks: 2,
    prompt: "Find θ correct to the nearest degree.",
    diagram: trigDiagram({
      angle,
      angleLabel: "θ",
      referenceVertex: ref,
      sideLabels,
      marginX: 95,
      marginY: 55,
      angleRadius: 31,
      angleLabelRadius: 50
    }),
    answer: `θ = ${angleValue(answer)}`,
    working,
    space: SPACE_SIZES.MEDIUM
  });
}

function degreesMinutesQuestion() {
  const ratio = choice(["sin", "cos", "tan"]);
  const angle = niceDegMinAngle();
  const unit = choice(["cm", "m"]);
  const variable = randomVariable();
  let sideLabels;
  let answer;
  let working;

  if (ratio === "sin") {
    const hyp = randInt(8, 22);
    answer = hyp * sin(angle.decimal);
    sideLabels = { hypotenuse: unitValue(hyp, unit, 0), opposite: variable };
    working = [
      `sin ${angle.label} = ${variable}/${hyp}`,
      `${variable} = ${hyp} × sin ${angle.label}`,
      `${variable} = ${unitValue(answer, unit)}`
    ];
  } else if (ratio === "cos") {
    const hyp = randInt(8, 22);
    answer = hyp * cos(angle.decimal);
    sideLabels = { hypotenuse: unitValue(hyp, unit, 0), adjacent: variable };
    working = [
      `cos ${angle.label} = ${variable}/${hyp}`,
      `${variable} = ${hyp} × cos ${angle.label}`,
      `${variable} = ${unitValue(answer, unit)}`
    ];
  } else {
    const adj = randInt(6, 20);
    answer = adj * tan(angle.decimal);
    sideLabels = { adjacent: unitValue(adj, unit, 0), opposite: variable };
    working = [
      `tan ${angle.label} = ${variable}/${adj}`,
      `${variable} = ${adj} × tan ${angle.label}`,
      `${variable} = ${unitValue(answer, unit)}`
    ];
  }

  return trigQuestion({
    type: "degrees-minutes",
    marks: 2,
    prompt: `Find the value of ${variable}. Give your answer correct to 1 decimal place.`,
    diagram: trigDiagram({
      angle: angle.decimal,
      angleLabel: angle.label,
      referenceVertex: referenceVertex(),
      sideLabels,
      marginX: 95,
      marginY: 55,
      angleRadius: 31,
      angleLabelRadius: 50
    }),
    answer: unitValue(answer, unit),
    working,
    space: SPACE_SIZES.MEDIUM
  });
}

function similarConstantRatiosQuestion() {
  const angle = randomAngle();
  const hyp1 = randInt(8, 14);
  const opp1 = round(hyp1 * sin(angle), 1);
  const scaleFactor = choice([1.5, 2, 2.5]);
  const hyp2 = round(hyp1 * scaleFactor, 1);
  const opp2 = round(opp1 * scaleFactor, 1);

  return trigQuestion({
    type: "similar-constant-ratios",
    marks: 2,
    prompt: `The two right-angled triangles are similar and both contain an angle of ${angle}°. Show that the sine ratio is constant.`,
    diagram: similarDiagram({
      angle,
      small: {
        title: "Triangle A",
        labels: {
          hypotenuse: unitValue(hyp1, "cm"),
          opposite: unitValue(opp1, "cm")
        }
      },
      large: {
        title: "Triangle B",
        labels: {
          hypotenuse: unitValue(hyp2, "cm"),
          opposite: unitValue(opp2, "cm")
        }
      }
    }),
    answer: `The sine ratios are equal: ${opp1}/${hyp1} ≈ ${opp2}/${hyp2}.`,
    working: [
      `Triangle A: sin ${angle}° = ${opp1}/${hyp1} ≈ ${fmt(opp1 / hyp1, 3)}`,
      `Triangle B: sin ${angle}° = ${opp2}/${hyp2} ≈ ${fmt(opp2 / hyp2, 3)}`,
      `The ratios are approximately equal because the triangles are similar.`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function approximateTrigRatiosQuestion() {
  const ratio = choice(["sin", "cos", "tan"]);
  const angle = randomAngle();
  const value = ratio === "sin"
    ? sin(angle)
    : ratio === "cos"
      ? cos(angle)
      : tan(angle);

  return trigQuestion({
    type: "approximate-trig-ratios",
    marks: 1,
    prompt: `Use a calculator to find ${ratio} ${angle}° correct to 3 decimal places.`,
    answer: fmt(value, 3),
    working: [
      `${ratio} ${angle}° ≈ ${fmt(value, 3)}`
    ],
    space: SPACE_SIZES.SMALL
  });
}

function practicalProblemsQuestion() {
  const context = choice(["tree", "building", "ladder", "ramp", "cliff", "lighthouse", "boat"]);
  const angle = practicalAngle();
  const variable = randomVariable();

  if (context === "ladder") {
    const ladder = randInt(5, 14);
    const height = ladder * sin(angle);

    return trigQuestion({
      type: "practical-problems",
      marks: 2,
      prompt: `A ladder ${ladder} m long leans against a wall at an angle of ${angle}° to the ground.
How high up the wall does it reach?
Give your answer correct to 1 decimal place.`,
      diagram: practicalDiagram({
        context: "ladder",
        angle,
        angleLabel: `${angle}°`,
        adjacentLabel: "",
        oppositeLabel: variable,
        hypotenuseLabel: `${ladder} m`,
        caption: ""
      }),
      answer: unitValue(height, "m"),
      working: [
        `sin ${angle}° = ${variable}/${ladder}`,
        `${variable} = ${ladder} × sin ${angle}°`,
        `${variable} = ${unitValue(height, "m")}`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  if (context === "ramp") {
    const run = randInt(4, 15);
    const length = run / cos(angle);

    return trigQuestion({
      type: "practical-problems",
      marks: 2,
      prompt: `A ramp makes an angle of ${angle}° with the ground.
The horizontal distance is ${run} m.
Find the length of the ramp correct to 1 decimal place.`,
      diagram: practicalDiagram({
        context: "ramp",
        angle,
        angleLabel: `${angle}°`,
        adjacentLabel: `${run} m`,
        oppositeLabel: "",
        hypotenuseLabel: "ramp",
        caption: ""
      }),
      answer: unitValue(length, "m"),
      working: [
        `cos ${angle}° = ${run}/${variable}`,
        `${variable} = ${run} ÷ cos ${angle}°`,
        `${variable} = ${unitValue(length, "m")}`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  if (context === "tree") {
    const distance = randInt(8, 30);
    const height = distance * tan(angle);

    return trigQuestion({
      type: "practical-problems",
      marks: 2,
      prompt: `From a point ${distance} m from the base of a tree, the angle of elevation to the top is ${angle}°.
Find the height of the tree correct to 1 decimal place.`,
      diagram: practicalDiagram({
        context: "tree",
        angle,
        angleLabel: `${angle}°`,
        adjacentLabel: `${distance} m`,
        oppositeLabel: variable,
        caption: ""
      }),
      answer: unitValue(height, "m"),
      working: [
        `tan ${angle}° = ${variable}/${distance}`,
        `${variable} = ${distance} × tan ${angle}°`,
        `${variable} = ${unitValue(height, "m")}`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  if (context === "building") {
    const distance = randInt(10, 45);
    const height = distance * tan(angle);

    return trigQuestion({
      type: "practical-problems",
      marks: 2,
      prompt: `From a point ${distance} m from the base of a building, the angle of elevation to the top is ${angle}°.
Find the height of the building correct to 1 decimal place.`,
      diagram: practicalDiagram({
        context: "building",
        angle,
        angleLabel: `${angle}°`,
        adjacentLabel: `${distance} m`,
        oppositeLabel: variable,
        caption: ""
      }),
      answer: unitValue(height, "m"),
      working: [
        `tan ${angle}° = ${variable}/${distance}`,
        `${variable} = ${distance} × tan ${angle}°`,
        `${variable} = ${unitValue(height, "m")}`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  if (context === "cliff") {
    const distance = randInt(20, 80);
    const height = distance * tan(angle);

    return trigQuestion({
      type: "practical-problems",
      marks: 2,
      prompt: `From the top of a cliff, the angle of depression to a boat ${distance} m from the base is ${angle}°.
Find the height of the cliff correct to 1 decimal place.`,
      diagram: practicalDiagram({
        context: "cliff",
        angleType: "depression",
        angle,
        angleLabel: `${angle}°`,
        adjacentLabel: `${distance} m`,
        oppositeLabel: variable,
        caption: ""
      }),
      answer: unitValue(height, "m"),
      working: [
        `tan ${angle}° = ${variable}/${distance}`,
        `${variable} = ${distance} × tan ${angle}°`,
        `${variable} = ${unitValue(height, "m")}`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  if (context === "lighthouse") {
    const distance = randInt(40, 120);
    const height = distance * tan(angle);
    const angleType = choice(["depression", "elevation"]);

    if (angleType === "depression") {
      return trigQuestion({
        type: "practical-problems",
        marks: 2,
        prompt: `A boat is ${distance} m from the base of a lighthouse.
The angle of depression from the top of the lighthouse to the boat is ${angle}°.
Find the height of the lighthouse correct to 1 decimal place.`,
        diagram: practicalDiagram({
          context: "lighthouse",
          angleType: "depression",
          angle,
          angleLabel: `${angle}°`,
          adjacentLabel: `${distance} m`,
          oppositeLabel: variable,
          caption: ""
        }),
        answer: unitValue(height, "m"),
        working: [
          `tan ${angle}° = ${variable}/${distance}`,
          `${variable} = ${distance} × tan ${angle}°`,
          `${variable} = ${unitValue(height, "m")}`
        ],
        space: SPACE_SIZES.MEDIUM
      });
    }

    return trigQuestion({
      type: "practical-problems",
      marks: 2,
      prompt: `A boat is ${distance} m from the base of a lighthouse.
The angle of elevation from the boat to the top of the lighthouse is ${angle}°.
Find the height of the lighthouse correct to 1 decimal place.`,
      diagram: practicalDiagram({
        context: "lighthouse",
        angleType: "elevation",
        angle,
        angleLabel: `${angle}°`,
        adjacentLabel: `${distance} m`,
        oppositeLabel: variable,
        caption: ""
      }),
      answer: unitValue(height, "m"),
      working: [
        `tan ${angle}° = ${variable}/${distance}`,
        `${variable} = ${distance} × tan ${angle}°`,
        `${variable} = ${unitValue(height, "m")}`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  const distance = randInt(25, 90);
  const height = distance * tan(angle);

  return trigQuestion({
    type: "practical-problems",
    marks: 2,
    prompt: `From a boat, the angle of elevation to the top of a cliff is ${angle}°.
The boat is ${distance} m from the base of the cliff.
Find the height of the cliff correct to 1 decimal place.`,
    diagram: practicalDiagram({
      context: "boat",
      angle,
      angleLabel: `${angle}°`,
      adjacentLabel: `${distance} m`,
      oppositeLabel: variable,
      caption: ""
    }),
    answer: unitValue(height, "m"),
    working: [
      `tan ${angle}° = ${variable}/${distance}`,
      `${variable} = ${distance} × tan ${angle}°`,
      `${variable} = ${unitValue(height, "m")}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function mixedTrigonometryQuestion() {
  return choice([
    writeTrigEquationQuestion,
    findUnknownSideQuestion,
    findUnknownAngleQuestion,
    practicalProblemsQuestion,
    matchTrigRatiosQuestion
  ])();
}

const GENERATORS = {
  "identify-hoa": identifyHoaQuestion,
  "match-trig-ratios": matchTrigRatiosQuestion,
  "write-trig-equation": writeTrigEquationQuestion,
  "find-unknown-side": findUnknownSideQuestion,
  "find-unknown-angle": findUnknownAngleQuestion,
  "degrees-minutes": degreesMinutesQuestion,
  "similar-constant-ratios": similarConstantRatiosQuestion,
  "approximate-trig-ratios": approximateTrigRatiosQuestion,
  "practical-problems": practicalProblemsQuestion,
  "mixed-trigonometry": mixedTrigonometryQuestion
};

export function getTrigonometryAQuestionTypes() {
  return TYPE_LIST.slice();
}

export function generateTrigonometryAQuestions({
  count = 8,
  allowedTypes = null
} = {}) {
  const typeIds = Array.isArray(allowedTypes) && allowedTypes.length
    ? allowedTypes.filter(id => GENERATORS[id])
    : TYPE_LIST.map(type => type.id);

  const plan = makeBalancedPlan(typeIds, count);

  return plan.map(type => GENERATORS[type]());
}
