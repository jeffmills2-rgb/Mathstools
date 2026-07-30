/*
  MMT Exam Builder — Stage 5 Trigonometry B Question Bank
  ------------------------------------------------------
  Save as:

  question-banks/stage-5/trigonometry-b/index.js

  Requires:
  - engines/trigonometry/trigonometry-engine.js
*/

import {
  createQuestion,
  SPACE_SIZES
} from "../../../schemas/question.schema.js";

const TOPIC = "Trigonometry B";

const TYPE_LIST = [
  { id: "identify-elevation-depression", label: "Identify angles of elevation and depression" },
  { id: "elevation-problems", label: "Solve angle of elevation problems" },
  { id: "depression-problems", label: "Solve angle of depression problems" },
  { id: "true-bearings", label: "Read true bearings from directional axes" },
  { id: "compass-bearings", label: "Read compass bearings from directional axes" },
  { id: "reverse-bearings", label: "Work backwards to find reverse bearings" },
  { id: "convert-bearings", label: "Convert between true and compass bearings" },
  { id: "bearing-practical-with-diagram", label: "Solve practical bearing problems with a diagram" },
  { id: "bearing-practical-no-diagram", label: "Solve practical bearing problems by drawing a diagram" },
  { id: "bearing-distance", label: "Find a distance using bearings" },
  { id: "bearing-angle", label: "Find a bearing using trigonometry" },
  { id: "mixed-bearings", label: "Mixed bearing problems" }
];

const VARIABLES = ["x", "y", "z", "m", "n", "p", "q", "r", "s", "t", "u", "v", "w"];
const UNITS = ["m", "km"];

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

function randomId(prefix = "trig-b") {
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

function unitValue(value, unit = "m", dp = 1) {
  return `${fmt(value, dp)} ${unit}`;
}

function bearingText(value) {
  const bearing = ((Math.round(value) % 360) + 360) % 360;
  return `${String(bearing).padStart(3, "0")}°`;
}

function compassTextFromBearing(bearingValue) {
  const bearing = ((Math.round(bearingValue) % 360) + 360) % 360;

  if (bearing === 0) return "N";
  if (bearing === 90) return "E";
  if (bearing === 180) return "S";
  if (bearing === 270) return "W";

  if (bearing > 0 && bearing < 90) return `N ${bearing}° E`;
  if (bearing > 90 && bearing < 180) return `S ${180 - bearing}° E`;
  if (bearing > 180 && bearing < 270) return `S ${bearing - 180}° W`;
  return `N ${360 - bearing}° W`;
}

function trueBearingFromCompass(start, angle, turn) {
  const a = Number(angle);

  if (start === "N" && turn === "E") return a;
  if (start === "S" && turn === "E") return 180 - a;
  if (start === "S" && turn === "W") return 180 + a;
  return 360 - a;
}

function randomBearing() {
  return choice([25, 35, 40, 50, 55, 65, 70, 110, 125, 140, 150, 210, 225, 235, 250, 290, 305, 320, 335]);
}

function randomNebearing() {
  return choice([25, 30, 35, 40, 45, 50, 55, 60, 65]);
}

function randomVariable() {
  return choice(VARIABLES);
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
  diagramSpace = null,
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
    tags: ["stage-5", "trigonometry", "bearings", type, ...tags]
  });

  if (table) question.table = table;
  if (matching) question.matching = matching;
  if (diagramSpace) question.diagramSpace = diagramSpace;

  return question;
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

function bearingDiagram(config = {}) {
  return {
    engine: "trigonometry-engine",
    config: {
      diagramType: "bearing-diagram",
      ...config
    }
  };
}

function bearingTriangleDiagram(config = {}) {
  return {
    engine: "trigonometry-engine",
    config: {
      diagramType: "bearing-triangle",
      ...config
    }
  };
}

function identifyElevationDepressionQuestion() {
  const isElevation = Math.random() < 0.5;
  const angle = randInt(25, 60);
  const context = isElevation
    ? choice(["tree", "building", "lighthouse", "ramp"])
    : choice(["lighthouse", "cliff"]);
  const answer = isElevation ? "angle of elevation" : "angle of depression";

  return trigQuestion({
    type: "identify-elevation-depression",
    marks: 1,
    prompt: "Identify whether the marked angle is an angle of elevation or an angle of depression.",
    diagram: practicalDiagram({
      context,
      angle,
      angleType: isElevation ? "elevation" : "depression",
      angleLabel: "?"
    }),
    answer,
    working: [`The marked angle is an ${answer}.`],
    space: SPACE_SIZES.SMALL
  });
}

function elevationProblemQuestion() {
  return buildPracticalProblem("elevation-problems", "elevation");
}

function depressionProblemQuestion() {
  return buildPracticalProblem("depression-problems", "depression");
}

function buildPracticalProblem(type, angleType) {
  const angle = randInt(25, 62);
  const unit = "m";
  const variable = randomVariable();
  const isElevation = angleType === "elevation";
  const context = isElevation
    ? choice(["tree", "building", "lighthouse", "ramp", "ladder"])
    : choice(["lighthouse", "cliff"]);

  if (isElevation) {
    if (context === "ladder") {
      const hyp = randInt(6, 14);
      const height = hyp * sin(angle);
      return trigQuestion({
        type,
        marks: 2,
        prompt: `A ladder ${hyp} m long leans against a wall at an angle of ${angle}° to the ground.\nHow high up the wall does it reach? Give your answer correct to 1 decimal place.`,
        diagram: practicalDiagram({
          context: "ladder",
          angle,
          angleType: "elevation",
          angleLabel: `${angle}°`,
          hypotenuseLabel: `${hyp} m`,
          oppositeLabel: variable
        }),
        answer: unitValue(height, unit),
        working: [
          `Use sine because the height is opposite the angle and the ladder is the hypotenuse.`,
          `sin ${angle}° = ${variable}/${hyp}`,
          `${variable} = ${hyp} × sin ${angle}°`,
          `${variable} = ${unitValue(height, unit)}`
        ],
        space: SPACE_SIZES.MEDIUM
      });
    }

    if (context === "ramp") {
      const horizontal = randInt(5, 16);
      const length = horizontal / cos(angle);
      return trigQuestion({
        type,
        marks: 2,
        prompt: `A ramp makes an angle of ${angle}° with the ground.\nThe horizontal distance is ${horizontal} m.\nFind the length of the ramp correct to 1 decimal place.`,
        diagram: practicalDiagram({
          context: "ramp",
          angle,
          angleType: "elevation",
          angleLabel: `${angle}°`,
          adjacentLabel: `${horizontal} m`,
          hypotenuseLabel: "ramp"
        }),
        answer: unitValue(length, unit),
        working: [
          `Use cosine because the horizontal distance is adjacent and the ramp is the hypotenuse.`,
          `cos ${angle}° = ${horizontal}/ramp`,
          `ramp = ${horizontal} ÷ cos ${angle}°`,
          `ramp = ${unitValue(length, unit)}`
        ],
        space: SPACE_SIZES.MEDIUM
      });
    }

    const distance = randInt(12, 45);
    const height = distance * tan(angle);
    const object = context === "tree" ? "tree" : context === "lighthouse" ? "lighthouse" : "building";
    return trigQuestion({
      type,
      marks: 2,
      prompt: `From a point ${distance} m from the base of a ${object}, the angle of elevation to the top is ${angle}°.\nFind the height of the ${object} correct to 1 decimal place.`,
      diagram: practicalDiagram({
        context,
        angle,
        angleType: "elevation",
        angleLabel: `${angle}°`,
        adjacentLabel: `${distance} m`,
        oppositeLabel: variable
      }),
      answer: unitValue(height, unit),
      working: [
        `Use tangent because the height is opposite and the distance from the base is adjacent.`,
        `tan ${angle}° = ${variable}/${distance}`,
        `${variable} = ${distance} × tan ${angle}°`,
        `${variable} = ${unitValue(height, unit)}`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  const height = randInt(18, 75);
  const distance = height / tan(angle);
  const place = context === "lighthouse" ? "lighthouse" : "cliff";

  return trigQuestion({
    type,
    marks: 2,
    prompt: `From the top of a ${height} m ${place}, the angle of depression to a boat is ${angle}°.\nFind the horizontal distance from the base of the ${place} to the boat correct to 1 decimal place.`,
    diagram: practicalDiagram({
      context,
      angle,
      angleType: "depression",
      angleLabel: `${angle}°`,
      oppositeLabel: `${height} m`,
      adjacentLabel: variable
    }),
    answer: unitValue(distance, unit),
    working: [
      `The angle of depression equals the angle of elevation in the right triangle.`,
      `tan ${angle}° = ${height}/${variable}`,
      `${variable} = ${height} ÷ tan ${angle}°`,
      `${variable} = ${unitValue(distance, unit)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function bearingReferenceInfo(bearingValue) {
  const bearing = ((Math.round(bearingValue) % 360) + 360) % 360;
  const options = [];

  if (bearing > 0 && bearing < 90) {
    options.push({ referenceBearing: 0, angle: bearing, phrase: `${bearing}° east of north` });
    options.push({ referenceBearing: 90, angle: 90 - bearing, phrase: `${90 - bearing}° north of east` });
  } else if (bearing > 90 && bearing < 180) {
    options.push({ referenceBearing: 90, angle: bearing - 90, phrase: `${bearing - 90}° south of east` });
    options.push({ referenceBearing: 180, angle: 180 - bearing, phrase: `${180 - bearing}° east of south` });
  } else if (bearing > 180 && bearing < 270) {
    options.push({ referenceBearing: 180, angle: bearing - 180, phrase: `${bearing - 180}° west of south` });
    options.push({ referenceBearing: 270, angle: 270 - bearing, phrase: `${270 - bearing}° south of west` });
  } else if (bearing > 270 && bearing < 360) {
    options.push({ referenceBearing: 270, angle: bearing - 270, phrase: `${bearing - 270}° north of west` });
    options.push({ referenceBearing: 0, angle: 360 - bearing, phrase: `${360 - bearing}° west of north` });
  } else {
    options.push({ referenceBearing: 0, angle: 0, phrase: bearingText(bearing) });
  }

  return choice(options);
}

function bearingComponents(distance, bearingValue) {
  const bearing = Number(bearingValue);
  return {
    east: distance * sin(bearing),
    north: distance * cos(bearing)
  };
}

function componentOptions(distance, bearingValue) {
  const c = bearingComponents(distance, bearingValue);
  const options = [];

  if (Math.abs(c.east) > 0.05) {
    options.push({ direction: c.east >= 0 ? "east" : "west", value: Math.abs(c.east), component: "horizontal" });
  }

  if (Math.abs(c.north) > 0.05) {
    options.push({ direction: c.north >= 0 ? "north" : "south", value: Math.abs(c.north), component: "vertical" });
  }

  return options;
}

function axisBearingQuestion(kind = "true") {
  const bearing = randomBearing();
  const reference = bearingReferenceInfo(bearing);
  const askTrue = kind === "true";
  const answer = askTrue ? bearingText(bearing) : compassTextFromBearing(bearing);

  return trigQuestion({
    type: askTrue ? "true-bearings" : "compass-bearings",
    marks: 1,
    prompt: askTrue
      ? "Write the true bearing shown in the diagram. Use three digits, for example, 045°."
      : "Write the compass bearing shown in the diagram.",
    diagram: bearingDiagram({
      bearing,
      mode: "axis",
      referenceBearing: reference.referenceBearing,
      angleLabel: `${reference.angle}°`,
      bearingLabel: "?",
      pointLabel: "O",
      targetLabel: "A"
    }),
    answer,
    working: askTrue
      ? [`The direction is ${reference.phrase}.`, `Measured clockwise from north, the true bearing is ${answer}.`]
      : [`The direction is ${reference.phrase}.`, `The compass bearing is ${answer}.`],
    space: SPACE_SIZES.SMALL
  });
}

function trueBearingQuestion() {
  return axisBearingQuestion("true");
}

function compassBearingQuestion() {
  return axisBearingQuestion("compass");
}

function reverseBearingQuestion() {
  const bearing = randomBearing();
  const reference = bearingReferenceInfo(bearing);
  const askReverse = Math.random() < 0.65;
  const answer = askReverse ? bearingText(bearing + 180) : bearingText(bearing);

  return trigQuestion({
    type: "reverse-bearings",
    marks: 1,
    prompt: askReverse
      ? "The diagram shows the direction of A from O. Write the true bearing of O from A."
      : "Write the true bearing of A from O. Use three digits, for example, 045°.",
    diagram: bearingDiagram({
      bearing,
      mode: "axis",
      referenceBearing: reference.referenceBearing,
      angleLabel: `${reference.angle}°`,
      pointLabel: "O",
      targetLabel: "A"
    }),
    answer,
    working: askReverse
      ? [`The bearing of A from O is ${bearingText(bearing)}.`, `The reverse bearing differs by 180°: ${bearingText(bearing)} + 180° = ${answer}.`]
      : [`Measured clockwise from north, the bearing of A from O is ${answer}.`],
    space: SPACE_SIZES.SMALL
  });
}

function convertBearingQuestion() {
  const toTrue = Math.random() < 0.5;
  const angle = choice([20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70]);
  const quadrant = choice([
    { start: "N", turn: "E" },
    { start: "S", turn: "E" },
    { start: "S", turn: "W" },
    { start: "N", turn: "W" }
  ]);
  const trueBearing = trueBearingFromCompass(quadrant.start, angle, quadrant.turn);
  const compass = `${quadrant.start} ${angle}° ${quadrant.turn}`;

  if (toTrue) {
    return trigQuestion({
      type: "convert-bearings",
      marks: 1,
      prompt: `Convert ${compass} to a true bearing.`,
      answer: bearingText(trueBearing),
      working: [`${compass} = ${bearingText(trueBearing)}`],
      space: SPACE_SIZES.SMALL
    });
  }

  return trigQuestion({
    type: "convert-bearings",
    marks: 1,
    prompt: `Convert the true bearing ${bearingText(trueBearing)} to a compass bearing.`,
    answer: compass,
    working: [`${bearingText(trueBearing)} = ${compass}`],
    space: SPACE_SIZES.SMALL
  });
}

function bearingDistanceQuestion() {
  return bearingPracticalWithDiagramQuestion("component");
}

function bearingPracticalWithDiagramQuestion(mode = "mixed") {
  const bearing = choice([32, 38, 45, 52, 60, 126, 135, 140, 148, 210, 225, 238, 250, 305, 318, 330]);
  const distance = randInt(8, 75);
  const unit = choice(["km", "m"]);
  const object = choice(["fishing boat", "hiker", "drone", "rescue boat", "cyclist"]);
  const pointA = choice(["O", "A"]);
  const pointB = pointA === "O" ? "B" : "B";
  const askReverse = mode === "reverse" || (mode === "mixed" && Math.random() < 0.25);

  if (askReverse) {
    const answer = bearingText(bearing + 180);
    return trigQuestion({
      type: "bearing-practical-with-diagram",
      marks: 2,
      prompt: `A ${object} starts from point ${pointA} and travels ${distance} ${unit} on a true bearing of ${bearingText(bearing)} to point ${pointB}.
What is the true bearing of ${pointA} from ${pointB}?`,
      diagram: bearingTriangleDiagram({
        bearing,
        angleLabel: bearingText(bearing),
        hypotenuseLabel: `${distance} ${unit}`,
        pointLabel: pointA,
        targetLabel: pointB,
        showProjections: false
      }),
      answer,
      working: [
        `The reverse bearing differs by 180°.`,
        `${bearingText(bearing)} + 180° = ${answer}.`,
        `The true bearing of ${pointA} from ${pointB} is ${answer}.`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  const options = componentOptions(distance, bearing);
  const component = choice(options);
  const variable = randomVariable();
  const answer = component.value;
  const referenceAngle = bearing <= 90
    ? bearing
    : bearing <= 180
      ? 180 - bearing
      : bearing <= 270
        ? bearing - 180
        : 360 - bearing;
  const horizontal = component.component === "horizontal";
  const useSine = (bearing < 90 || bearing > 270) ? horizontal : !horizontal;

  return trigQuestion({
    type: "bearing-practical-with-diagram",
    marks: 2,
    prompt: `A ${object} starts from point ${pointA} and travels ${distance} ${unit} on a true bearing of ${bearingText(bearing)} to point ${pointB}.
How far ${component.direction} of its starting point is the ${object}, correct to 1 decimal place?`,
    diagram: bearingTriangleDiagram({
      bearing,
      angleLabel: bearingText(bearing),
      hypotenuseLabel: `${distance} ${unit}`,
      eastLabel: component.direction === "east" ? variable : "",
      westLabel: component.direction === "west" ? variable : "",
      northLabel: component.direction === "north" ? variable : "",
      southLabel: component.direction === "south" ? variable : "",
      pointLabel: pointA,
      targetLabel: pointB
    }),
    answer: unitValue(answer, unit),
    working: [
      `The required ${component.direction} distance is a component of the ${distance} ${unit} journey.`,
      `${useSine ? "sin" : "cos"} ${referenceAngle}° = ${variable}/${distance}`,
      `${variable} = ${distance} × ${useSine ? "sin" : "cos"} ${referenceAngle}°`,
      `${variable} = ${unitValue(answer, unit)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function bearingAngleQuestion() {
  const east = randInt(5, 18);
  const north = randInt(6, 22);
  const unit = choice(UNITS);
  const angle = atan(east / north);
  const trueBearing = bearingText(angle);

  return trigQuestion({
    type: "bearing-angle",
    marks: 2,
    prompt: `B is ${east} ${unit} east and ${north} ${unit} north of A.
Find the true bearing of B from A to the nearest degree.`,
    diagram: bearingTriangleDiagram({
      bearing: angle,
      angleLabel: "?",
      eastLabel: `${east} ${unit}`,
      northLabel: `${north} ${unit}`,
      pointLabel: "A",
      targetLabel: "B"
    }),
    answer: trueBearing,
    working: [
      `Use tangent with east as the opposite side and north as the adjacent side.`,
      `tan θ = ${east}/${north}`,
      `θ = tan⁻¹(${east}/${north})`,
      `θ ≈ ${Math.round(angle)}°`,
      `The true bearing is ${trueBearing}.`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function bearingPracticalNoDiagramQuestion() {
  const name = choice(["Christopher", "Mia", "A bushwalker", "A surveyor"]);
  const southDistance = randInt(3, 12);
  const angle = choice([24, 30, 36, 42, 48, 54]);
  const dueEast = Math.random() < 0.5;
  const bearing = dueEast ? angle : 360 - angle;
  const direction = dueEast ? "east" : "west";
  const answer = southDistance * tan(angle);

  return trigQuestion({
    type: "bearing-practical-no-diagram",
    marks: 3,
    prompt: `${name} walks ${southDistance} km south, then walks on a bearing of ${bearingText(bearing)} until they are due ${direction} of the starting point.
Draw a diagram and find how far they are from the starting point, correct to 1 decimal place.`,
    answer: unitValue(answer, "km"),
    working: [
      `Draw a right-angled triangle showing ${southDistance} km south and a final position due ${direction} of the starting point.`,
      `The angle between north and the second part of the journey is ${angle}°.`,
      `tan ${angle}° = distance/${southDistance}`,
      `distance = ${southDistance} × tan ${angle}°`,
      `distance = ${unitValue(answer, "km")}`
    ],
    diagramSpace: {
      label: "Space for diagram",
      size: "medium"
    },
    space: SPACE_SIZES.MEDIUM
  });
}

const GENERATORS = {
  "identify-elevation-depression": identifyElevationDepressionQuestion,
  "elevation-problems": elevationProblemQuestion,
  "depression-problems": depressionProblemQuestion,
  "true-bearings": trueBearingQuestion,
  "compass-bearings": compassBearingQuestion,
  "reverse-bearings": reverseBearingQuestion,
  "convert-bearings": convertBearingQuestion,
  "bearing-practical-with-diagram": bearingPracticalWithDiagramQuestion,
  "bearing-practical-no-diagram": bearingPracticalNoDiagramQuestion,
  "bearing-distance": bearingDistanceQuestion,
  "bearing-angle": bearingAngleQuestion,
  "mixed-bearings": () => choice([
    identifyElevationDepressionQuestion,
    elevationProblemQuestion,
    depressionProblemQuestion,
    trueBearingQuestion,
    compassBearingQuestion,
    reverseBearingQuestion,
    convertBearingQuestion,
    bearingPracticalWithDiagramQuestion,
    bearingPracticalNoDiagramQuestion,
    bearingDistanceQuestion,
    bearingAngleQuestion
  ])()
};

export function getTrigonometryBQuestionTypes() {
  return TYPE_LIST.map(type => ({ ...type }));
}

export function generateTrigonometryBQuestions({
  count = 6,
  allowedTypes = []
} = {}) {
  const safeTypes = allowedTypes.filter(type => GENERATORS[type]);
  const plan = makeBalancedPlan(safeTypes, count);

  return plan.map(type => (GENERATORS[type] || GENERATORS["mixed-bearings"])());
}
