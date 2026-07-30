/*
  CHHS Exam Builder — Length Question Bank
  ----------------------------------------
  Save as:

  question-banks/length/index.js

  Requires:
  - engines/length/length-engine.js
*/

import {
  createQuestion,
  QUESTION_KINDS,
  SPACE_SIZES
} from "../../schemas/question.schema.js";

import {
  attachQuestionTranslations
} from "../../utils/translation.js";

const TOPIC = "Length";

const TYPE_LIST = [
  { id: "perimeter-plane-shapes", label: "Perimeter of plane shapes" },
  { id: "perimeter-composite", label: "Perimeter of composite figures" },
  { id: "missing-side-perimeter", label: "Find missing sides before perimeter" },
  { id: "perimeter-worded-problems", label: "Worded perimeter problems" },

  { id: "circle-features", label: "Identify features of circles" },
  { id: "circumference-diameter", label: "Circumference using diameter" },
  { id: "circumference-radius", label: "Circumference using radius" },
  { id: "find-radius-diameter", label: "Find radius or diameter from circumference" },

  { id: "arc-length", label: "Arc length" },
  { id: "sector-perimeter", label: "Perimeter of sectors" },
  { id: "semicircle-perimeter", label: "Perimeter of semicircles" },
  { id: "quadrant-perimeter", label: "Perimeter of quadrants" },
  { id: "curved-composite-perimeter", label: "Composite figures with curved edges" },

  { id: "metric-length-conversion", label: "Convert metric units of length" },
  { id: "choose-length-units", label: "Choose appropriate length units" },
  { id: "read-ruler", label: "Read a length from a ruler" },
  { id: "wheel-revolutions", label: "Wheel revolutions (distance travelled)" },
  { id: "multi-part-circle", label: "Multi-part circle problem" },
  { id: "error-spot-length", label: "Spot the error (reasoning)" },
  { id: "true-false-circle", label: "Circle facts: true or false (reasoning)" },
  { id: "multi-part-perimeter", label: "Multi-part perimeter problem" }
];

const UNITS = ["cm", "m", "mm"];

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

function randomId(prefix = "length") {
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

function lengthQuestion({
  type,
  marks = 1,
  prompt,
  answer,
  working = [],
  diagram = null,
  space = SPACE_SIZES.MEDIUM
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
    tags: ["length", type]
  });
}

function retagQuestion(question, type) {
  if (!question) return question;

  return {
    ...question,
    type,
    tags: [
      ...new Set([
        ...(Array.isArray(question.tags) ? question.tags : []).filter(tag => !/^perimeter-(quadrilaterals|parallelograms|trapeziums|rhombuses|kites)$/.test(String(tag))),
        type
      ])
    ]
  };
}

function unitLabel(value, unit) {
  return `${value} ${unit}`;
}

function piTerm(coefficient, unit = "") {
  const rounded = Math.round(coefficient * 1000) / 1000;
  if (rounded === 1) return `π${unit ? " " + unit : ""}`;
  return `${rounded}π${unit ? " " + unit : ""}`;
}

function approx(value, dp = 1) {
  return Number(value.toFixed(dp)).toString();
}

function money(n) {
  return `$${Number(n).toFixed(2)}`;
}

function polygonDiagram(shape, labels) {
  return {
    engine: "length-engine",
    config: {
      diagramType: "polygon",
      shape,
      labels
    }
  };
}

function compositeDiagram(labels) {
  return {
    engine: "length-engine",
    config: {
      diagramType: "composite-rectilinear",
      labels
    }
  };
}


function genericCompositeDiagram(points, edgeLabels, options = {}) {
  return {
    engine: "length-engine",
    config: {
      diagramType: "composite-rectilinear",
      points,
      edgeLabels,
      labelOffsetScale: options.labelOffsetScale ?? 0.72
    }
  };
}

function scaleUnitPoints(points, {
  originX = 145,
  originY = 88,
  maxWidth = 430,
  maxHeight = 250
} = {}) {
  const xs = points.map(point => point.x);
  const ys = points.map(point => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);
  const scale = Math.min(maxWidth / width, maxHeight / height);
  const drawnWidth = width * scale;
  const drawnHeight = height * scale;
  const extraX = (maxWidth - drawnWidth) / 2;
  const extraY = (maxHeight - drawnHeight) / 2;

  return points.map(point => ({
    x: Math.round(originX + extraX + (point.x - minX) * scale),
    y: Math.round(originY + extraY + (point.y - minY) * scale)
  }));
}

function scaledCompositeDiagram(unitPoints, edgeLabels, options = {}) {
  return genericCompositeDiagram(
    scaleUnitPoints(unitPoints, options),
    edgeLabels,
    options
  );
}

function edgeLabel(edge, text, dx = 0, dy = 0, className = "shape-small-label", highlight = false) {
  return { edge, text, dx, dy, className, highlight };
}

function missingEdgeLabel(edge, unit, dx = 0, dy = 0) {
  return edgeLabel(edge, `? ${unit}`, dx, dy, "missing-label", true);
}

function exactMode() {
  return Math.random() < 0.55;
}

function promptSuffix(exact) {
  return exact ? "Give your answer in terms of π." : "Give your answer correct to 1 decimal place.";
}

function decimalLength(value, unit) {
  return `${approx(value, 1)} ${unit}`;
}

function circleMeasureDiagram(given, value, unit) {
  const config = {
    diagramType: "circle-measure",
    given,
    value,
    unit
  };

  if (given === "diameter") {
    config.diameter = value;
  } else {
    config.radius = value;
  }

  return {
    engine: "length-engine",
    config
  };
}

function sectorDiagram(radius, angle, unit) {
  return {
    engine: "length-engine",
    config: {
      diagramType: "sector",
      radius,
      angle,
      unit
    }
  };
}

function partialCircleDiagram(shape, radius, unit) {
  return {
    engine: "length-engine",
    config: {
      diagramType: "partial-circle",
      shape,
      radius,
      unit
    }
  };
}

function makeCompositeVariant({ missing = false } = {}) {
  const unit = choice(["cm", "m"]);
  const variant = missing
    ? choice(["bottom-right-notch", "top-right-notch", "bottom-left-notch"])
    : choice(["bottom-right-notch", "top-right-notch", "bottom-left-notch", "opposite-corner-cutouts", "rectangle-triangle", "house-shape", "u-shape", "t-shape", "stepped-zigzag"]);

  if (variant === "bottom-right-notch") {
    const width = randInt(15, 25);
    const rightHeight = randInt(7, 14);
    const notchWidth = randInt(4, 9);
    const notchHeight = randInt(3, 8);
    const bottom = width - notchWidth;
    const leftHeight = rightHeight + notchHeight;
    const perimeter = width + rightHeight + notchWidth + notchHeight + bottom + leftHeight;

    const points = [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: rightHeight },
      { x: bottom, y: rightHeight },
      { x: bottom, y: leftHeight },
      { x: 0, y: leftHeight }
    ];

    return {
      unit,
      missingSide: bottom,
      perimeter,
      diagram: scaledCompositeDiagram(points, [
        edgeLabel([0, 1], unitLabel(width, unit), 0, -36),
        edgeLabel([1, 2], unitLabel(rightHeight, unit), 58, 0),
        edgeLabel([2, 3], unitLabel(notchWidth, unit), 0, -36),
        edgeLabel([3, 4], unitLabel(notchHeight, unit), 74, 0),
        missing ? missingEdgeLabel([4, 5], unit, 0, 44) : edgeLabel([4, 5], unitLabel(bottom, unit), 0, 44),
        edgeLabel([5, 0], unitLabel(leftHeight, unit), -62, 0)
      ]),
      working: [
        missing
          ? `Missing side = ${width} − ${notchWidth} = ${bottom} ${unit}.`
          : `Add the outside edges only.`,
        `Perimeter = ${width} + ${rightHeight} + ${notchWidth} + ${notchHeight} + ${bottom} + ${leftHeight} = ${perimeter} ${unit}.`
      ]
    };
  }

  if (variant === "top-right-notch") {
    const width = randInt(15, 25);
    const leftHeight = randInt(9, 17);
    const notchWidth = randInt(4, 9);
    const notchHeight = randInt(3, 7);
    const topLeft = width - notchWidth;
    const rightHeight = leftHeight - notchHeight;
    const perimeter = topLeft + notchHeight + notchWidth + rightHeight + width + leftHeight;

    const points = [
      { x: 0, y: notchHeight },
      { x: topLeft, y: notchHeight },
      { x: topLeft, y: 0 },
      { x: width, y: 0 },
      { x: width, y: leftHeight },
      { x: 0, y: leftHeight }
    ];

    return {
      unit,
      missingSide: topLeft,
      perimeter,
      diagram: scaledCompositeDiagram(points, [
        missing ? missingEdgeLabel([0, 1], unit, 0, -40) : edgeLabel([0, 1], unitLabel(topLeft, unit), 0, -40),
        edgeLabel([1, 2], unitLabel(notchHeight, unit), -74, 0),
        edgeLabel([2, 3], unitLabel(notchWidth, unit), 0, -38),
        edgeLabel([3, 4], unitLabel(rightHeight, unit), 60, 0),
        edgeLabel([4, 5], unitLabel(width, unit), 0, 44),
        edgeLabel([5, 0], unitLabel(leftHeight, unit), -62, 0)
      ]),
      working: [
        missing
          ? `Missing side = ${width} − ${notchWidth} = ${topLeft} ${unit}.`
          : `Add the outside edges only.`,
        `Perimeter = ${topLeft} + ${notchHeight} + ${notchWidth} + ${rightHeight} + ${width} + ${leftHeight} = ${perimeter} ${unit}.`
      ]
    };
  }

  if (variant === "bottom-left-notch") {
    const width = randInt(15, 25);
    const rightHeight = randInt(10, 18);
    const notchWidth = randInt(4, 9);
    const notchHeight = randInt(3, 7);
    const bottomRight = width - notchWidth;
    const leftHeight = rightHeight - notchHeight;
    const perimeter = width + rightHeight + bottomRight + notchHeight + notchWidth + leftHeight;

    const points = [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: rightHeight },
      { x: notchWidth, y: rightHeight },
      { x: notchWidth, y: leftHeight },
      { x: 0, y: leftHeight }
    ];

    return {
      unit,
      missingSide: bottomRight,
      perimeter,
      diagram: scaledCompositeDiagram(points, [
        edgeLabel([0, 1], unitLabel(width, unit), 0, -36),
        edgeLabel([1, 2], unitLabel(rightHeight, unit), 60, 0),
        missing ? missingEdgeLabel([2, 3], unit, 0, 44) : edgeLabel([2, 3], unitLabel(bottomRight, unit), 0, 44),
        edgeLabel([3, 4], unitLabel(notchHeight, unit), 74, 0),
        edgeLabel([4, 5], unitLabel(notchWidth, unit), 0, -42),
        edgeLabel([5, 0], unitLabel(leftHeight, unit), -64, 0)
      ]),
      working: [
        missing
          ? `Missing side = ${width} − ${notchWidth} = ${bottomRight} ${unit}.`
          : `Add the outside edges only.`,
        `Perimeter = ${width} + ${rightHeight} + ${bottomRight} + ${notchHeight} + ${notchWidth} + ${leftHeight} = ${perimeter} ${unit}.`
      ]
    };
  }


  if (variant === "u-shape") {
    const width = randInt(18, 28);
    const height = randInt(10, 18);
    const leg = randInt(4, 7);
    const notchDepth = randInt(5, 10);
    const insideWidth = width - 2 * leg;
    const perimeter = width + height + leg + notchDepth + insideWidth + notchDepth + leg + height;

    const points = [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height },
      { x: width - leg, y: height },
      { x: width - leg, y: height - notchDepth },
      { x: leg, y: height - notchDepth },
      { x: leg, y: height },
      { x: 0, y: height }
    ];

    return {
      unit,
      missingSide: null,
      perimeter,
      diagram: scaledCompositeDiagram(points, [
        edgeLabel([0, 1], unitLabel(width, unit), 0, -36),
        edgeLabel([1, 2], unitLabel(height, unit), 58, 0),
        edgeLabel([2, 3], unitLabel(leg, unit), 0, 42),
        edgeLabel([3, 4], unitLabel(notchDepth, unit), 68, 0),
        edgeLabel([4, 5], unitLabel(insideWidth, unit), 0, -36),
        edgeLabel([5, 6], unitLabel(notchDepth, unit), -68, 0),
        edgeLabel([6, 7], unitLabel(leg, unit), 0, 42),
        edgeLabel([7, 0], unitLabel(height, unit), -58, 0)
      ]),
      working: [
        `Add each outside edge, including the edges around the cut-out.`,
        `Perimeter = ${width} + ${height} + ${leg} + ${notchDepth} + ${insideWidth} + ${notchDepth} + ${leg} + ${height} = ${perimeter} ${unit}.`
      ]
    };
  }

  if (variant === "t-shape") {
    const stemWidth = choice([6, 8, 10, 12]);
    const sideGap = randInt(4, 9);
    const top = stemWidth + 2 * sideGap;
    const topHeight = randInt(4, 8);
    const stemHeight = randInt(9, 18);
    const perimeter = top + topHeight + sideGap + stemHeight + stemWidth + stemHeight + sideGap + topHeight;

    const points = [
      { x: 0, y: 0 },
      { x: top, y: 0 },
      { x: top, y: topHeight },
      { x: sideGap + stemWidth, y: topHeight },
      { x: sideGap + stemWidth, y: topHeight + stemHeight },
      { x: sideGap, y: topHeight + stemHeight },
      { x: sideGap, y: topHeight },
      { x: 0, y: topHeight }
    ];

    return {
      unit,
      missingSide: null,
      perimeter,
      diagram: scaledCompositeDiagram(points, [
        edgeLabel([0, 1], unitLabel(top, unit), 0, -36),
        edgeLabel([1, 2], unitLabel(topHeight, unit), 58, 0),
        edgeLabel([2, 3], unitLabel(sideGap, unit), 0, 36),
        edgeLabel([3, 4], unitLabel(stemHeight, unit), 62, 0),
        edgeLabel([4, 5], unitLabel(stemWidth, unit), 0, 42),
        edgeLabel([5, 6], unitLabel(stemHeight, unit), -62, 0),
        edgeLabel([6, 7], unitLabel(sideGap, unit), 0, 36),
        edgeLabel([7, 0], unitLabel(topHeight, unit), -58, 0)
      ]),
      working: [
        `Add each outside edge of the T-shape.`,
        `Perimeter = ${top} + ${topHeight} + ${sideGap} + ${stemHeight} + ${stemWidth} + ${stemHeight} + ${sideGap} + ${topHeight} = ${perimeter} ${unit}.`
      ]
    };
  }

  if (variant === "stepped-zigzag") {
    const top = randInt(18, 28);
    const leftDrop = randInt(3, 7);
    const stepA = randInt(5, 9);
    const midDrop = randInt(3, 7);
    const stepB = randInt(5, 9);
    const rightDrop = randInt(6, 12);
    const bottom = top - stepA - stepB;
    const perimeter = top + rightDrop + bottom + midDrop + stepB + leftDrop + stepA + (leftDrop + midDrop + rightDrop);

    const totalDrop = leftDrop + midDrop + rightDrop;
    const points = [
      { x: 0, y: 0 },
      { x: top, y: 0 },
      { x: top, y: totalDrop },
      { x: top - bottom, y: totalDrop },
      { x: top - bottom, y: leftDrop + midDrop },
      { x: stepA, y: leftDrop + midDrop },
      { x: stepA, y: leftDrop },
      { x: 0, y: leftDrop }
    ];

    return {
      unit,
      missingSide: null,
      perimeter,
      diagram: scaledCompositeDiagram(points, [
        edgeLabel([0, 1], unitLabel(top, unit), 0, -36),
        edgeLabel([1, 2], unitLabel(rightDrop, unit), 58, 0),
        edgeLabel([2, 3], unitLabel(bottom, unit), 0, 42),
        edgeLabel([3, 4], unitLabel(midDrop, unit), 65, 0),
        edgeLabel([4, 5], unitLabel(stepB, unit), 0, -36),
        edgeLabel([5, 6], unitLabel(leftDrop, unit), -64, 0),
        edgeLabel([6, 7], unitLabel(stepA, unit), 0, -36),
        edgeLabel([7, 0], unitLabel(leftDrop + midDrop + rightDrop, unit), -58, 0)
      ]),
      working: [
        `Add the outside edges only.`,
        `Perimeter = ${top} + ${rightDrop} + ${bottom} + ${midDrop} + ${stepB} + ${leftDrop} + ${stepA} + ${leftDrop + midDrop + rightDrop} = ${perimeter} ${unit}.`
      ]
    };
  }

  if (variant === "rectangle-triangle") {
    const width = randInt(10, 18);
    const height = randInt(5, 10);
    const slantA = randInt(6, 12);
    const slantB = randInt(6, 12);
    const perimeter = width + height + slantB + slantA + height;

    const points = [
      { x: 175, y: 300 },
      { x: 545, y: 300 },
      { x: 545, y: 160 },
      { x: 360, y: 70 },
      { x: 175, y: 160 }
    ];

    return {
      unit,
      missingSide: null,
      perimeter,
      diagram: scaledCompositeDiagram(points, [
        edgeLabel([0, 1], unitLabel(width, unit), 0, 42),
        edgeLabel([1, 2], unitLabel(height, unit), 58, 0),
        edgeLabel([2, 3], unitLabel(slantB, unit), 45, -34),
        edgeLabel([3, 4], unitLabel(slantA, unit), -45, -34),
        edgeLabel([4, 0], unitLabel(height, unit), -58, 0)
      ]),
      working: [
        `This composite figure is a rectangle with a triangle on top.`,
        `Add only the outside edges.`,
        `Perimeter = ${width} + ${height} + ${slantB} + ${slantA} + ${height} = ${perimeter} ${unit}.`
      ]
    };
  }

  if (variant === "house-shape") {
    const base = randInt(10, 18);
    const wall = randInt(5, 10);
    const roof = randInt(6, 12);
    const perimeter = base + 2 * wall + 2 * roof;

    const points = [
      { x: 170, y: 310 },
      { x: 550, y: 310 },
      { x: 550, y: 170 },
      { x: 360, y: 70 },
      { x: 170, y: 170 }
    ];

    return {
      unit,
      missingSide: null,
      perimeter,
      diagram: scaledCompositeDiagram(points, [
        edgeLabel([0, 1], unitLabel(base, unit), 0, 42),
        edgeLabel([1, 2], unitLabel(wall, unit), 58, 0),
        edgeLabel([2, 3], unitLabel(roof, unit), 48, -36),
        edgeLabel([3, 4], unitLabel(roof, unit), -48, -36),
        edgeLabel([4, 0], unitLabel(wall, unit), -58, 0)
      ]),
      working: [
        `Add the outside edges of the rectangle and triangular roof.`,
        `Perimeter = ${base} + ${wall} + ${roof} + ${roof} + ${wall} = ${perimeter} ${unit}.`
      ]
    };
  }

  // Opposite-corner cutouts: one cutout is at the top-right and the other is at the bottom-left.
  // This is easier to read than a same-side double-step shape.
  const width = randInt(18, 28);
  const height = randInt(14, 22);
  const topRightWidth = randInt(4, 8);
  const topRightHeight = randInt(3, 7);
  const bottomLeftWidth = randInt(4, 8);
  const bottomLeftHeight = randInt(3, 7);

  const topLength = width - topRightWidth;
  const rightLength = height - topRightHeight;
  const bottomLength = width - bottomLeftWidth;
  const leftLength = height - bottomLeftHeight;
  const perimeter = 2 * width + 2 * height;

  const points = [
    { x: 0, y: 0 },
    { x: topLength, y: 0 },
    { x: topLength, y: topRightHeight },
    { x: width, y: topRightHeight },
    { x: width, y: height },
    { x: bottomLeftWidth, y: height },
    { x: bottomLeftWidth, y: leftLength },
    { x: 0, y: leftLength }
  ];

  return {
    unit,
    missingSide: null,
    perimeter,
    diagram: scaledCompositeDiagram(points, [
      edgeLabel([0, 1], unitLabel(topLength, unit), 0, -38),
      edgeLabel([1, 2], unitLabel(topRightHeight, unit), -66, 0),
      edgeLabel([2, 3], unitLabel(topRightWidth, unit), 0, 38),
      edgeLabel([3, 4], unitLabel(rightLength, unit), 62, 0),
      edgeLabel([4, 5], unitLabel(bottomLength, unit), 0, 44),
      edgeLabel([5, 6], unitLabel(bottomLeftHeight, unit), 68, 0),
      edgeLabel([6, 7], unitLabel(bottomLeftWidth, unit), 0, -38),
      edgeLabel([7, 0], unitLabel(leftLength, unit), -62, 0)
    ]),
    working: [
      `This shape has cutouts on opposite corners.`,
      `Add the outside edges only.`,
      `Perimeter = ${topLength} + ${topRightHeight} + ${topRightWidth} + ${rightLength} + ${bottomLength} + ${bottomLeftHeight} + ${bottomLeftWidth} + ${leftLength} = ${perimeter} ${unit}.`
    ]
  };
}


function planeShapeDiagram(shape, labels) {
  return polygonDiagram(shape, labels);
}

function perimeterRectangleQuestion() {
  const unit = choice(UNITS);
  const length = randInt(8, 30);
  const width = randInt(4, 18);
  const perimeter = 2 * (length + width);

  return lengthQuestion({
    type: "perimeter-plane-shapes",
    marks: 1,
    prompt: `Find the perimeter of the rectangle.`,
    diagram: planeShapeDiagram("rectangle", {
      bottom: unitLabel(length, unit),
      right: unitLabel(width, unit)
    }),
    answer: unitLabel(perimeter, unit),
    working: [`Opposite sides of a rectangle are equal.`, `Perimeter = 2(${length} + ${width}) = ${perimeter} ${unit}.`],
    space: SPACE_SIZES.SMALL
  });
}

function perimeterSquareQuestion() {
  const unit = choice(UNITS);
  const side = randInt(5, 25);
  const perimeter = 4 * side;

  return lengthQuestion({
    type: "perimeter-plane-shapes",
    marks: 1,
    prompt: `Find the perimeter of the square.`,
    diagram: planeShapeDiagram("square", {
      bottom: unitLabel(side, unit)
    }),
    answer: unitLabel(perimeter, unit),
    working: [`All sides of a square are equal.`, `Perimeter = 4 × ${side} = ${perimeter} ${unit}.`],
    space: SPACE_SIZES.SMALL
  });
}

function perimeterTriangleQuestion() {
  const unit = choice(UNITS);
  const equilateral = Math.random() < 0.28;

  if (equilateral) {
    const side = randInt(5, 24);
    const perimeter = 3 * side;

    return lengthQuestion({
      type: "perimeter-plane-shapes",
      marks: 1,
      prompt: `Find the perimeter of the equilateral triangle.`,
      diagram: planeShapeDiagram("equilateral-triangle", {
        bottom: unitLabel(side, unit)
      }),
      answer: unitLabel(perimeter, unit),
      working: [`All sides of an equilateral triangle are equal.`, `Perimeter = 3 × ${side} = ${perimeter} ${unit}.`],
      space: SPACE_SIZES.SMALL
    });
  }

  const sides = [randInt(5, 18), randInt(5, 18), randInt(5, 18)];
  const perimeter = sides.reduce((sum, value) => sum + value, 0);

  return lengthQuestion({
    type: "perimeter-plane-shapes",
    marks: 1,
    prompt: `Find the perimeter of the triangle.`,
    diagram: planeShapeDiagram("triangle", {
      bottom: unitLabel(sides[0], unit),
      right: unitLabel(sides[1], unit),
      left: unitLabel(sides[2], unit)
    }),
    answer: unitLabel(perimeter, unit),
    working: [`Perimeter = ${sides.join(" + ")} = ${perimeter} ${unit}.`],
    space: SPACE_SIZES.SMALL
  });
}

function perimeterRegularPolygonQuestion() {
  const unit = choice(UNITS);
  const shape = choice([
    { name: "regular pentagon", engineShape: "regular-pentagon", sides: 5 },
    { name: "regular hexagon", engineShape: "regular-hexagon", sides: 6 },
    { name: "regular octagon", engineShape: "regular-octagon", sides: 8 }
  ]);
  const side = randInt(4, 18);
  const perimeter = shape.sides * side;

  return lengthQuestion({
    type: "perimeter-plane-shapes",
    marks: 1,
    prompt: `Find the perimeter of the ${shape.name}.`,
    diagram: planeShapeDiagram(shape.engineShape, {
      bottom: unitLabel(side, unit)
    }),
    answer: unitLabel(perimeter, unit),
    working: [`All ${shape.sides} sides are equal.`, `Perimeter = ${shape.sides} × ${side} = ${perimeter} ${unit}.`],
    space: SPACE_SIZES.SMALL
  });
}

/* -----------------------------
   Straight-sided perimeter
----------------------------- */

function perimeterQuadrilateralsQuestion() {
  const unit = choice(UNITS);
  const sides = [randInt(4, 15), randInt(4, 15), randInt(4, 15), randInt(4, 15)];
  const perimeter = sides.reduce((sum, value) => sum + value, 0);

  return lengthQuestion({
    type: "perimeter-quadrilaterals",
    marks: 1,
    prompt: `Find the perimeter of the quadrilateral.`,
    diagram: polygonDiagram("quadrilateral", {
      bottom: unitLabel(sides[0], unit),
      right: unitLabel(sides[1], unit),
      top: unitLabel(sides[2], unit),
      left: unitLabel(sides[3], unit)
    }),
    answer: unitLabel(perimeter, unit),
    working: [`Perimeter = ${sides.join(" + ")} = ${perimeter} ${unit}.`],
    space: SPACE_SIZES.SMALL
  });
}

function perimeterParallelogramsQuestion() {
  const unit = choice(UNITS);
  const a = randInt(5, 18);
  const b = randInt(4, 14);
  const perimeter = 2 * (a + b);

  return lengthQuestion({
    type: "perimeter-parallelograms",
    marks: 1,
    prompt: `Find the perimeter of the parallelogram.`,
    diagram: polygonDiagram("parallelogram", {
      top: unitLabel(a, unit),
      left: unitLabel(b, unit)
    }),
    answer: unitLabel(perimeter, unit),
    working: [`Opposite sides of a parallelogram are equal.`, `Perimeter = 2(${a} + ${b}) = ${perimeter} ${unit}.`],
    space: SPACE_SIZES.SMALL
  });
}

function perimeterTrapeziumsQuestion() {
  const unit = choice(UNITS);
  const top = randInt(5, 14);
  const bottom = top + randInt(3, 10);
  const left = randInt(4, 12);
  const right = randInt(4, 12);
  const perimeter = top + bottom + left + right;

  return lengthQuestion({
    type: "perimeter-trapeziums",
    marks: 1,
    prompt: `Find the perimeter of the trapezium.`,
    diagram: polygonDiagram("trapezium", {
      top: unitLabel(top, unit),
      bottom: unitLabel(bottom, unit),
      left: unitLabel(left, unit),
      right: unitLabel(right, unit)
    }),
    answer: unitLabel(perimeter, unit),
    working: [`Perimeter = ${top} + ${bottom} + ${left} + ${right} = ${perimeter} ${unit}.`],
    space: SPACE_SIZES.SMALL
  });
}

function perimeterRhombusesQuestion() {
  const unit = choice(UNITS);
  const side = randInt(4, 16);
  const perimeter = 4 * side;

  return lengthQuestion({
    type: "perimeter-rhombuses",
    marks: 1,
    prompt: `Find the perimeter of the rhombus.`,
    diagram: polygonDiagram("rhombus", {
      top: unitLabel(side, unit)
    }),
    answer: unitLabel(perimeter, unit),
    working: [`All sides of a rhombus are equal.`, `Perimeter = 4 × ${side} = ${perimeter} ${unit}.`],
    space: SPACE_SIZES.SMALL
  });
}

function perimeterKitesQuestion() {
  const unit = choice(UNITS);
  const shortSide = randInt(4, 12);
  const longSide = randInt(shortSide + 2, 18);
  const perimeter = 2 * shortSide + 2 * longSide;

  return lengthQuestion({
    type: "perimeter-kites",
    marks: 1,
    prompt: `Find the perimeter of the kite.`,
    diagram: polygonDiagram("kite", {
      bottom: unitLabel(shortSide, unit),
      left: unitLabel(shortSide, unit),
      right: unitLabel(longSide, unit),
      top: unitLabel(longSide, unit)
    }),
    answer: unitLabel(perimeter, unit),
    working: [`A kite has two pairs of adjacent equal sides.`, `Perimeter = 2 × ${shortSide} + 2 × ${longSide} = ${perimeter} ${unit}.`],
    space: SPACE_SIZES.SMALL
  });
}


function perimeterPlaneShapesQuestion() {
  const generator = choice([
    perimeterQuadrilateralsQuestion,
    perimeterParallelogramsQuestion,
    perimeterTrapeziumsQuestion,
    perimeterRhombusesQuestion,
    perimeterKitesQuestion,
    perimeterRectangleQuestion,
    perimeterSquareQuestion,
    perimeterTriangleQuestion,
    perimeterRegularPolygonQuestion
  ]);

  return retagQuestion(generator(), "perimeter-plane-shapes");
}

function perimeterWordedProblemsQuestion() {
  const unit = choice(["m", "cm", "mm"]);
  const variant = choice([
    "rectangle-field",
    "triangle-garden",
    "square-playground",
    "three-sided-fence",
    "path-around-pool",
    "fencing-cost"
  ]);

  if (variant === "rectangle-field") {
    const length = randInt(18, 90);
    const width = randInt(8, Math.min(44, length - 4));
    const perimeter = 2 * (length + width);

    return lengthQuestion({
      type: "perimeter-worded-problems",
      marks: 2,
      prompt: `A rectangular field is ${length} ${unit} long and ${width} ${unit} wide. Find its perimeter.`,
      answer: unitLabel(perimeter, unit),
      working: [`Perimeter = 2(length + width)`, `Perimeter = 2(${length} + ${width}) = ${perimeter} ${unit}.`],
      space: SPACE_SIZES.MEDIUM
    });
  }

  if (variant === "triangle-garden") {
    const sides = [randInt(8, 45), randInt(8, 45), randInt(8, 45)];
    const perimeter = sides.reduce((sum, value) => sum + value, 0);

    return lengthQuestion({
      type: "perimeter-worded-problems",
      marks: 2,
      prompt: `A triangular garden has side lengths ${sides[0]} ${unit}, ${sides[1]} ${unit} and ${sides[2]} ${unit}. Find the perimeter.`,
      answer: unitLabel(perimeter, unit),
      working: [`Perimeter = ${sides.join(" + ")} = ${perimeter} ${unit}.`],
      space: SPACE_SIZES.MEDIUM
    });
  }

  if (variant === "square-playground") {
    const side = randInt(12, 55);
    const perimeter = 4 * side;

    return lengthQuestion({
      type: "perimeter-worded-problems",
      marks: 2,
      prompt: `A square playground has side length ${side} ${unit}. Find the perimeter.`,
      answer: unitLabel(perimeter, unit),
      working: [`Perimeter = 4 × side length`, `Perimeter = 4 × ${side} = ${perimeter} ${unit}.`],
      space: SPACE_SIZES.MEDIUM
    });
  }

  if (variant === "three-sided-fence") {
    const width = randInt(12, 35);
    const length = randInt(width + 6, 70);
    const fence = 2 * width + length;

    return lengthQuestion({
      type: "perimeter-worded-problems",
      marks: 2,
      prompt: `A rectangular block of land is fenced on three sides, with a river along the fourth side. The block is ${length} ${unit} long and ${width} ${unit} wide. Find the length of fencing needed.`,
      answer: unitLabel(fence, unit),
      working: [`Only three sides need fencing.`, `Fencing = ${length} + ${width} + ${width} = ${fence} ${unit}.`],
      space: SPACE_SIZES.MEDIUM
    });
  }

  if (variant === "path-around-pool") {
    const poolLength = randInt(8, 18);
    const poolWidth = randInt(4, 10);
    const path = choice([1, 1.5, 2]);
    const outsideLength = poolLength + 2 * path;
    const outsideWidth = poolWidth + 2 * path;
    const outsidePerimeter = 2 * (outsideLength + outsideWidth);

    return lengthQuestion({
      type: "perimeter-worded-problems",
      marks: 3,
      prompt: `A ${path} m wide path is built around a rectangular pool ${poolLength} m long and ${poolWidth} m wide. Find the distance around the outside of the path.`,
      answer: unitLabel(outsidePerimeter, "m"),
      working: [`Outside length = ${poolLength} + 2 × ${path} = ${outsideLength} m.`, `Outside width = ${poolWidth} + 2 × ${path} = ${outsideWidth} m.`, `Outside perimeter = 2(${outsideLength} + ${outsideWidth}) = ${outsidePerimeter} m.`],
      space: SPACE_SIZES.LARGE
    });
  }

  const length = randInt(20, 60);
  const width = randInt(10, 35);
  const costPerMetre = choice([8.5, 12.75, 18.9, 22.65, 29.35]);
  const perimeter = 2 * (length + width);
  const cost = perimeter * costPerMetre;

  return lengthQuestion({
    type: "perimeter-worded-problems",
    marks: 3,
    prompt: `A rectangular field is ${length} m by ${width} m. Fencing costs ${money(costPerMetre)} per metre. Find the total cost of fencing the field.`,
    answer: money(cost),
    working: [`Perimeter = 2(${length} + ${width}) = ${perimeter} m.`, `Cost = ${perimeter} × ${money(costPerMetre)} = ${money(cost)}.`],
    space: SPACE_SIZES.LARGE
  });
}

function perimeterCompositeQuestion() {
  const made = makeCompositeVariant({ missing: false });

  return lengthQuestion({
    type: "perimeter-composite",
    marks: 2,
    prompt: `Find the perimeter of the composite figure.`,
    diagram: made.diagram,
    answer: unitLabel(made.perimeter, made.unit),
    working: made.working,
    space: SPACE_SIZES.MEDIUM
  });
}

function missingSidePerimeterQuestion() {
  const made = makeCompositeVariant({ missing: true });

  return lengthQuestion({
    type: "missing-side-perimeter",
    marks: 2,
    prompt: `Find the missing side length, then find the perimeter of the composite figure.`,
    diagram: made.diagram,
    answer: `${made.missingSide} ${made.unit}; perimeter = ${made.perimeter} ${made.unit}`,
    working: made.working,
    space: SPACE_SIZES.MEDIUM
  });
}

/* -----------------------------
   Circles and curved length
----------------------------- */

function circleFeaturesQuestion() {
  const features = ["radius", "diameter", "chord", "arc", "sector", "segment", "tangent"];
  const feature = choice(features);

  return lengthQuestion({
    type: "circle-features",
    marks: 1,
    prompt: `Name the labelled feature of the circle.`,
    diagram: {
      engine: "length-engine",
      config: {
        diagramType: "circle-features",
        feature
      }
    },
    answer: feature,
    working: [`The labelled feature is the ${feature}.`],
    space: SPACE_SIZES.SMALL
  });
}

function circumferenceDiameterQuestion() {
  const unit = choice(["cm", "m"]);
  const diameter = randInt(4, 24);
  const exact = exactMode();
  const exactAnswer = piTerm(diameter, unit);
  const decimalAnswer = decimalLength(Math.PI * diameter, unit);

  return lengthQuestion({
    type: "circumference-diameter",
    marks: 2,
    prompt: `Find the circumference of the circle. ${promptSuffix(exact)}`,
    diagram: circleMeasureDiagram("diameter", diameter, unit),
    answer: exact ? exactAnswer : decimalAnswer,
    working: exact
      ? [`C = πd`, `C = π × ${diameter} = ${exactAnswer}.`]
      : [`C = πd`, `C = π × ${diameter}`, `C ≈ ${decimalAnswer}.`],
    space: SPACE_SIZES.MEDIUM
  });
}

function circumferenceRadiusQuestion() {
  const unit = choice(["cm", "m"]);
  const radius = randInt(3, 15);
  const exact = exactMode();
  const exactAnswer = piTerm(2 * radius, unit);
  const decimalAnswer = decimalLength(2 * Math.PI * radius, unit);

  return lengthQuestion({
    type: "circumference-radius",
    marks: 2,
    prompt: `Find the circumference of the circle. ${promptSuffix(exact)}`,
    diagram: circleMeasureDiagram("radius", radius, unit),
    answer: exact ? exactAnswer : decimalAnswer,
    working: exact
      ? [`C = 2πr`, `C = 2π × ${radius} = ${exactAnswer}.`]
      : [`C = 2πr`, `C = 2π × ${radius}`, `C ≈ ${decimalAnswer}.`],
    space: SPACE_SIZES.MEDIUM
  });
}

function findRadiusDiameterQuestion() {
  const unit = choice(["cm", "m"]);
  const radiusMode = Math.random() < 0.5;

  if (radiusMode) {
    const radius = randInt(3, 15);
    const coefficient = 2 * radius;

    return lengthQuestion({
      type: "find-radius-diameter",
      marks: 2,
      prompt: `The circumference of a circle is ${piTerm(coefficient, unit)}. Find the radius.`,
      answer: unitLabel(radius, unit),
      working: [`C = 2πr`, `${coefficient}π = 2πr`, `r = ${radius} ${unit}.`],
      space: SPACE_SIZES.MEDIUM
    });
  }

  const diameter = randInt(4, 26);

  return lengthQuestion({
    type: "find-radius-diameter",
    marks: 2,
    prompt: `The circumference of a circle is ${piTerm(diameter, unit)}. Find the diameter.`,
    answer: unitLabel(diameter, unit),
    working: [`C = πd`, `${diameter}π = πd`, `d = ${diameter} ${unit}.`],
    space: SPACE_SIZES.MEDIUM
  });
}

function arcLengthQuestion() {
  const unit = choice(["cm", "m"]);
  const angle = choice([30, 45, 60, 90, 120, 180, 270]);
  const radius = randInt(4, 14);
  const coefficient = 2 * radius * angle / 360;
  const exact = exactMode();
  const exactAnswer = piTerm(coefficient, unit);
  const decimalAnswer = decimalLength(coefficient * Math.PI, unit);

  return lengthQuestion({
    type: "arc-length",
    marks: 2,
    prompt: `Find the arc length. ${promptSuffix(exact)}`,
    diagram: sectorDiagram(radius, angle, unit),
    answer: exact ? exactAnswer : decimalAnswer,
    working: exact
      ? [`Arc length = θ/360 × 2πr`, `Arc length = ${angle}/360 × 2π × ${radius} = ${exactAnswer}.`]
      : [`Arc length = θ/360 × 2πr`, `Arc length = ${angle}/360 × 2π × ${radius}`, `Arc length ≈ ${decimalAnswer}.`],
    space: SPACE_SIZES.MEDIUM
  });
}

function sectorPerimeterQuestion() {
  const unit = choice(["cm", "m"]);
  const angle = choice([60, 90, 120, 180]);
  const radius = randInt(4, 14);
  const arcCoefficient = 2 * radius * angle / 360;
  const exact = exactMode();
  const exactAnswer = `${2 * radius} + ${piTerm(arcCoefficient, unit)}`;
  const decimalAnswer = decimalLength(2 * radius + arcCoefficient * Math.PI, unit);

  return lengthQuestion({
    type: "sector-perimeter",
    marks: 2,
    prompt: `Find the perimeter of the sector. ${promptSuffix(exact)}`,
    diagram: sectorDiagram(radius, angle, unit),
    answer: exact ? exactAnswer : decimalAnswer,
    working: exact
      ? [`Perimeter = two radii + arc length.`, `Arc length = ${piTerm(arcCoefficient, unit)}.`, `Perimeter = ${radius} + ${radius} + ${piTerm(arcCoefficient, unit)} = ${exactAnswer}.`]
      : [`Perimeter = two radii + arc length.`, `Arc length = ${angle}/360 × 2π × ${radius}.`, `Perimeter ≈ ${decimalAnswer}.`],
    space: SPACE_SIZES.MEDIUM
  });
}

function semicirclePerimeterQuestion() {
  const unit = choice(["cm", "m"]);
  const radius = randInt(4, 16);
  const exact = exactMode();
  const exactAnswer = `${2 * radius} + ${piTerm(radius, unit)}`;
  const decimalAnswer = decimalLength(2 * radius + Math.PI * radius, unit);

  return lengthQuestion({
    type: "semicircle-perimeter",
    marks: 2,
    prompt: `Find the perimeter of the semicircle. ${promptSuffix(exact)}`,
    diagram: partialCircleDiagram("semicircle", radius, unit),
    answer: exact ? exactAnswer : decimalAnswer,
    working: exact
      ? [`Perimeter = half the circumference + diameter.`, `Half circumference = πr = ${piTerm(radius, unit)}.`, `Diameter = ${2 * radius} ${unit}.`, `Perimeter = ${exactAnswer}.`]
      : [`Perimeter = half the circumference + diameter.`, `Perimeter = π × ${radius} + ${2 * radius}.`, `Perimeter ≈ ${decimalAnswer}.`],
    space: SPACE_SIZES.MEDIUM
  });
}

function quadrantPerimeterQuestion() {
  const unit = choice(["cm", "m"]);
  const radius = randInt(4, 16);
  const arcCoefficient = radius / 2;
  const exact = exactMode();
  const exactAnswer = `${2 * radius} + ${piTerm(arcCoefficient, unit)}`;
  const decimalAnswer = decimalLength(2 * radius + arcCoefficient * Math.PI, unit);

  return lengthQuestion({
    type: "quadrant-perimeter",
    marks: 2,
    prompt: `Find the perimeter of the quadrant. ${promptSuffix(exact)}`,
    diagram: partialCircleDiagram("quadrant", radius, unit),
    answer: exact ? exactAnswer : decimalAnswer,
    working: exact
      ? [`Perimeter = two radii + one-quarter circumference.`, `Quarter circumference = ${piTerm(arcCoefficient, unit)}.`, `Two radii = ${2 * radius} ${unit}.`, `Perimeter = ${exactAnswer}.`]
      : [`Perimeter = two radii + one-quarter circumference.`, `Perimeter = ${2 * radius} + ${piTerm(arcCoefficient, unit)}.`, `Perimeter ≈ ${decimalAnswer}.`],
    space: SPACE_SIZES.MEDIUM
  });
}

function curvedCompositePerimeterQuestion() {
  const unit = choice(["cm", "m"]);
  const variant = choice(["rectangle-semicircle", "arch-rectangle", "stadium", "quadrant-sector", "square-quadrant-cutout", "four-semicircle-square"]);
  const exact = exactMode();
  let prompt;
  let diagram;
  let exactAnswer;
  let decimalAnswer;
  let workingExact;
  let workingDecimal;

  if (variant === "arch-rectangle") {
    const width = choice([8, 10, 12, 14, 16]);
    const height = choice([4, 6, 8, 10]);
    const coefficient = width / 2;
    const straight = width + 2 * height;
    exactAnswer = `${straight} + ${piTerm(coefficient, unit)}`;
    decimalAnswer = decimalLength(straight + coefficient * Math.PI, unit);
    prompt = `Find the perimeter of the composite figure. ${promptSuffix(exact)}`;
    diagram = {
      engine: "length-engine",
      config: {
        diagramType: "curved-composite",
        shape: "arch-rectangle",
        width,
        height,
        unit
      }
    };
    workingExact = [
      `The semicircle has diameter ${width} ${unit}, so radius = ${width / 2} ${unit}.`,
      `Curved part = half circumference = ${piTerm(coefficient, unit)}.`,
      `Straight edges included = ${width} + ${height} + ${height} = ${straight} ${unit}.`,
      `Perimeter = ${exactAnswer}.`
    ];
    workingDecimal = [
      `The semicircle has diameter ${width} ${unit}, so radius = ${width / 2} ${unit}.`,
      `Curved part = half circumference = ${piTerm(coefficient, unit)}.`,
      `Straight edges included = ${straight} ${unit}.`,
      `Perimeter ≈ ${decimalAnswer}.`
    ];
  } else if (variant === "stadium") {
    const length = choice([10, 12, 14, 16, 18]);
    const width = choice([4, 6, 8, 10]);
    const coefficient = width;
    const straight = 2 * length;
    exactAnswer = `${straight} + ${piTerm(coefficient, unit)}`;
    decimalAnswer = decimalLength(straight + coefficient * Math.PI, unit);
    prompt = `Find the perimeter of the composite figure. ${promptSuffix(exact)}`;
    diagram = {
      engine: "length-engine",
      config: {
        diagramType: "curved-composite",
        shape: "stadium",
        length,
        width,
        unit
      }
    };
    workingExact = [
      `The two semicircles make one full circle with diameter ${width} ${unit}.`,
      `Curved part = ${piTerm(coefficient, unit)}.`,
      `Straight edges included = ${length} + ${length} = ${straight} ${unit}.`,
      `Perimeter = ${exactAnswer}.`
    ];
    workingDecimal = [
      `The two semicircles make one full circle with diameter ${width} ${unit}.`,
      `Curved part = ${piTerm(coefficient, unit)}.`,
      `Straight edges included = ${straight} ${unit}.`,
      `Perimeter ≈ ${decimalAnswer}.`
    ];
  } else if (variant === "quadrant-sector" || variant === "square-quadrant-cutout") {
    const side = choice([6, 8, 10, 12, 14]);
    const coefficient = side / 2;
    const straight = 2 * side;
    exactAnswer = `${straight} + ${piTerm(coefficient, unit)}`;
    decimalAnswer = decimalLength(straight + coefficient * Math.PI, unit);
    prompt = `Find the perimeter of the composite figure. ${promptSuffix(exact)}`;
    diagram = {
      engine: "length-engine",
      config: {
        diagramType: "curved-composite",
        shape: variant,
        side,
        unit
      }
    };
    workingExact = [
      `The curved edge is one-quarter of a circle with radius ${side} ${unit}.`,
      `Curved part = ${piTerm(coefficient, unit)}.`,
      `Straight edges included = ${side} + ${side} = ${straight} ${unit}.`,
      `Perimeter = ${exactAnswer}.`
    ];
    workingDecimal = [
      `The curved edge is one-quarter of a circle with radius ${side} ${unit}.`,
      `Curved part = ${piTerm(coefficient, unit)}.`,
      `Straight edges included = ${straight} ${unit}.`,
      `Perimeter ≈ ${decimalAnswer}.`
    ];
  } else if (variant === "four-semicircle-square") {
    const side = choice([40, 50, 60, 70, 80]);
    const coefficient = 2 * side;
    exactAnswer = piTerm(coefficient, unit);
    decimalAnswer = decimalLength(coefficient * Math.PI, unit);
    prompt = `Find the perimeter of the composite figure. ${promptSuffix(exact)}`;
    diagram = {
      engine: "length-engine",
      config: {
        diagramType: "curved-composite",
        shape: "four-semicircle-square",
        side,
        unit
      }
    };
    workingExact = [
      `Each curved edge is a semicircle with diameter ${side} ${unit}.`,
      `Four semicircles make two full circles with diameter ${side} ${unit}.`,
      `Perimeter = 2 × π × ${side} = ${exactAnswer}.`
    ];
    workingDecimal = [
      `Each curved edge is a semicircle with diameter ${side} ${unit}.`,
      `Four semicircles make two full circles with diameter ${side} ${unit}.`,
      `Perimeter ≈ ${decimalAnswer}.`
    ];
  } else {
    const width = choice([8, 10, 12, 14, 16]);
    const height = choice([4, 6, 8, 10]);
    const coefficient = height / 2;
    const straight = 2 * width + height;
    exactAnswer = `${straight} + ${piTerm(coefficient, unit)}`;
    decimalAnswer = decimalLength(straight + coefficient * Math.PI, unit);
    prompt = `Find the perimeter of the composite figure. ${promptSuffix(exact)}`;
    diagram = {
      engine: "length-engine",
      config: {
        diagramType: "curved-composite",
        shape: "rectangle-semicircle",
        width,
        height,
        unit
      }
    };
    workingExact = [
      `The semicircle has diameter ${height} ${unit}, so radius = ${height / 2} ${unit}.`,
      `Curved part = half circumference = ${piTerm(coefficient, unit)}.`,
      `Straight edges included = ${width} + ${width} + ${height} = ${straight} ${unit}.`,
      `Perimeter = ${exactAnswer}.`
    ];
    workingDecimal = [
      `The semicircle has diameter ${height} ${unit}, so radius = ${height / 2} ${unit}.`,
      `Curved part = half circumference = ${piTerm(coefficient, unit)}.`,
      `Straight edges included = ${straight} ${unit}.`,
      `Perimeter ≈ ${decimalAnswer}.`
    ];
  }

  return lengthQuestion({
    type: "curved-composite-perimeter",
    marks: 3,
    prompt,
    diagram,
    answer: exact ? exactAnswer : decimalAnswer,
    working: exact ? workingExact : workingDecimal,
    space: SPACE_SIZES.LARGE
  });
}

// ── Metric length conversions (10A) ──────────────────────

function metricLengthConversionQuestion() {
  const conversions = [
    { from: "cm", to: "mm", factor: 10 },
    { from: "m", to: "cm", factor: 100 },
    { from: "km", to: "m", factor: 1000 },
    { from: "mm", to: "cm", factor: 1 / 10 },
    { from: "cm", to: "m", factor: 1 / 100 },
    { from: "m", to: "km", factor: 1 / 1000 }
  ];
  const c = choice(conversions);
  const up = c.factor >= 1;
  const value = up ? randInt(2, 95) : choice([250, 500, 750, 1500, 3000, 4500, 120, 80, 40]);
  const result = value * c.factor;
  const resultStr = Number.isInteger(result) ? String(result) : String(Number(result.toFixed(3)));

  return lengthQuestion({
    type: "metric-length-conversion",
    marks: 1,
    prompt: `Convert ${value} ${c.from} to ${c.to}.`,
    answer: `${resultStr} ${c.to}`,
    working: [
      up ? `1 ${c.from} = ${c.factor} ${c.to}` : `${Math.round(1 / c.factor)} ${c.from} = 1 ${c.to}`,
      `${value} ${c.from} = ${resultStr} ${c.to}`
    ],
    space: SPACE_SIZES.SMALL
  });
}

function chooseLengthUnitsQuestion() {
  const items = [
    { thing: "the length of a soccer field", unit: "m" },
    { thing: "the thickness of a coin", unit: "mm" },
    { thing: "the distance between two towns", unit: "km" },
    { thing: "the width of a textbook", unit: "cm" },
    { thing: "the height of a door", unit: "m" },
    { thing: "the length of an ant", unit: "mm" }
  ];
  const it = choice(items);
  const choices = shuffle(["mm", "cm", "m", "km"]);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "choose-length-units",
    kind: QUESTION_KINDS.MULTIPLE_CHOICE,
    marks: 1,
    prompt: `Which metric unit is most appropriate for measuring ${it.thing}?`,
    choices,
    answer: it.unit,
    working: [`The most sensible unit for ${it.thing} is ${it.unit}.`],
    space: SPACE_SIZES.NONE,
    tags: ["length", "units", "choose-length-units"]
  });
}

function readRulerQuestion() {
  const maxCm = choice([10, 12, 15]);
  const start = choice([0, 0, 1, 2]);
  const len = randInt(3, maxCm - start - 1);
  const end = start + len;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "read-ruler",
    marks: 1,
    prompt: `Read the length of the shaded bar from the ruler below.`,
    diagram: {
      engine: "length-engine",
      caption: "Measure from the left end of the bar to the right end.",
      config: { diagramType: "ruler", maxCm, objectStart: start, objectEnd: end }
    },
    answer: `${len} cm`,
    working: [`The bar runs from ${start} cm to ${end} cm.`, `Length = ${end} − ${start} = ${len} cm.`],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["length", "ruler", "measurement", "diagram"]
  });
}

function errorSpotLengthQuestion() {
  const scenarios = [
    () => { const m = randInt(2, 9); return { wrong: `${m} m = ${m * 10} cm`, issue: "1 m = 100 cm, not 10 cm", correct: `${m * 100} cm`, wrongVal: m * 10 }; },
    () => { const km = randInt(2, 8); return { wrong: `${km} km = ${km * 100} m`, issue: "1 km = 1000 m", correct: `${km * 1000} m`, wrongVal: km * 100 }; },
    () => { const s = randInt(3, 9); return { wrong: `The perimeter of a square with side ${s} cm is ${s * s} cm`, issue: "perimeter is 4 × side, not side squared", correct: `${4 * s} cm`, wrongVal: s * s }; }
  ];
  const s = choice(scenarios)();
  const num = parseFloat(s.correct);
  const unit = s.correct.replace(/[\d.]/g, "").trim();
  const distractors = shuffle([s.correct, `${s.wrongVal} ${unit}`, `${num / 10} ${unit}`, `${num * 2} ${unit}`])
    .filter((d, i, arr) => arr.indexOf(d) === i).slice(0, 4);
  if (!distractors.includes(s.correct)) distractors[0] = s.correct;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "error-spot-length",
    kind: QUESTION_KINDS.MULTIPLE_CHOICE,
    marks: 1,
    prompt: `A student wrote:  ${s.wrong}\nThis is incorrect. What is the correct answer?`,
    choices: shuffle(distractors),
    answer: s.correct,
    working: [`The error: ${s.issue}.`, `Correct answer: ${s.correct}.`],
    space: SPACE_SIZES.NONE,
    tags: ["length", "reasoning", "error analysis"]
  });
}

function trueFalseCircleQuestion() {
  const items = [
    { stmt: "The diameter of a circle is twice the radius.", val: true, reason: "d = 2r." },
    { stmt: "The radius of a circle is twice the diameter.", val: false, reason: "It is the other way around: d = 2r, so r = d ÷ 2." },
    { stmt: "Circumference = π × diameter.", val: true, reason: "C = πd." },
    { stmt: "A chord always passes through the centre of a circle.", val: false, reason: "Only a diameter passes through the centre; a chord need not." },
    { stmt: "π is approximately 3.14.", val: true, reason: "π ≈ 3.14159…" }
  ];
  const it = choice(items);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "true-false-circle",
    marks: 1,
    prompt: `True or false? ${it.stmt}  (Give a reason.)`,
    answer: it.val ? "True" : "False",
    working: [it.reason],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["length", "circle", "reasoning", "true false"]
  });
}

function wheelRevolutionsQuestion() {
  const diameter = choice([40, 50, 60, 65, 70]); // cm
  const revs = choice([5, 10, 20, 50, 100]);
  const exact = exactMode();
  const distCm = diameter * revs; // coefficient of π in cm
  const distM = distCm / 100;

  return lengthQuestion({
    type: "wheel-revolutions",
    marks: 2,
    prompt: `A bicycle wheel has a diameter of ${diameter} cm. How far does the bike travel when the wheel makes ${revs} complete revolutions? ${promptSuffix(exact)}`,
    diagram: circleMeasureDiagram("diameter", diameter, "cm"),
    answer: exact ? `${piAreaTermLen(distCm)} cm` : `${approx(Math.PI * distCm, 1)} cm (≈ ${approx(Math.PI * distM, 2)} m)`,
    working: [
      `Distance in one revolution = circumference = πd = ${diameter}π cm.`,
      `In ${revs} revolutions: ${revs} × ${diameter}π = ${distCm}π cm.`,
      exact ? `Distance = ${distCm}π cm.` : `≈ ${approx(Math.PI * distCm, 1)} cm ≈ ${approx(Math.PI * distM, 2)} m.`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function piAreaTermLen(coefficient) {
  const c = Math.round(coefficient * 1000) / 1000;
  return c === 1 ? "π" : `${c}π`;
}

function multiPartCircleQuestion() {
  const radius = choice([7, 10, 14, 20, 25]); // cm
  const diameter = radius * 2;
  const revs = choice([10, 20, 50]);
  const distCm = diameter * revs;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "multi-part-circle",
    marks: 3,
    prompt: `A circular wheel has a radius of ${radius} cm.`,
    diagram: circleMeasureDiagram("radius", radius, "cm"),
    subparts: [
      { label: "(a)", prompt: `Write down the diameter of the wheel.`, marks: 1, answer: `${diameter} cm`, working: [`d = 2r = 2 × ${radius} = ${diameter} cm.`] },
      { label: "(b)", prompt: `Find the circumference. Give your answer in terms of π.`, marks: 1, answer: `${piAreaTermLen(diameter)} cm`, working: [`C = πd = ${diameter}π cm.`] },
      { label: "(c)", prompt: `How far does the wheel roll in ${revs} revolutions? Give your answer in terms of π.`, marks: 1, answer: `${piAreaTermLen(distCm)} cm`, working: [`${revs} × ${diameter}π = ${distCm}π cm.`] }
    ],
    answer: `(a) ${diameter} cm; (b) ${piAreaTermLen(diameter)} cm; (c) ${piAreaTermLen(distCm)} cm`,
    working: [],
    space: SPACE_SIZES.NONE,
    mcEligible: false,
    tags: ["length", "circle", "multi-part", "real-world"]
  });
}

function multiPartPerimeterQuestion() {
  const w = randInt(4, 12);
  const l = w + randInt(2, 8);
  const perim = 2 * (w + l);
  const cost = 6;
  const totalCost = perim * cost;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "multi-part-perimeter",
    marks: 3,
    prompt: `A rectangular vegetable garden is ${l} m long and ${w} m wide.`,
    diagram: polygonDiagram ? polygonDiagram("rectangle", { length: `${l} m`, width: `${w} m` }) : null,
    subparts: [
      { label: "(a)", prompt: `Find the perimeter of the garden.`, marks: 1, answer: `${perim} m`, working: [`P = 2(${l} + ${w}) = ${perim} m.`] },
      { label: "(b)", prompt: `Fencing costs $${cost} per metre. Find the total cost to fence the garden.`, marks: 1, answer: `$${totalCost}`, working: [`${perim} × $${cost} = $${totalCost}.`] },
      { label: "(c)", prompt: `A 2 m gate is left unfenced. How much is saved?`, marks: 1, answer: `$${2 * cost}`, working: [`2 m × $${cost} = $${2 * cost} saved.`] }
    ],
    answer: `(a) ${perim} m; (b) $${totalCost}; (c) $${2 * cost}`,
    working: [],
    space: SPACE_SIZES.NONE,
    mcEligible: false,
    tags: ["length", "perimeter", "multi-part", "real-world"]
  });
}

const GENERATORS = {
  "perimeter-plane-shapes": perimeterPlaneShapesQuestion,
  // Backward compatibility for older saved selections.
  "perimeter-quadrilaterals": () => retagQuestion(perimeterQuadrilateralsQuestion(), "perimeter-plane-shapes"),
  "perimeter-parallelograms": () => retagQuestion(perimeterParallelogramsQuestion(), "perimeter-plane-shapes"),
  "perimeter-trapeziums": () => retagQuestion(perimeterTrapeziumsQuestion(), "perimeter-plane-shapes"),
  "perimeter-rhombuses": () => retagQuestion(perimeterRhombusesQuestion(), "perimeter-plane-shapes"),
  "perimeter-kites": () => retagQuestion(perimeterKitesQuestion(), "perimeter-plane-shapes"),
  "perimeter-composite": perimeterCompositeQuestion,
  "missing-side-perimeter": missingSidePerimeterQuestion,
  "perimeter-worded-problems": perimeterWordedProblemsQuestion,
  "circle-features": circleFeaturesQuestion,
  "circumference-diameter": circumferenceDiameterQuestion,
  "circumference-radius": circumferenceRadiusQuestion,
  "find-radius-diameter": findRadiusDiameterQuestion,
  "arc-length": arcLengthQuestion,
  "sector-perimeter": sectorPerimeterQuestion,
  "semicircle-perimeter": semicirclePerimeterQuestion,
  "quadrant-perimeter": quadrantPerimeterQuestion,
  "curved-composite-perimeter": curvedCompositePerimeterQuestion,
  "metric-length-conversion": metricLengthConversionQuestion,
  "choose-length-units": chooseLengthUnitsQuestion,
  "read-ruler": readRulerQuestion,
  "wheel-revolutions": wheelRevolutionsQuestion,
  "multi-part-circle": multiPartCircleQuestion,
  "error-spot-length": errorSpotLengthQuestion,
  "true-false-circle": trueFalseCircleQuestion,
  "multi-part-perimeter": multiPartPerimeterQuestion
};

export function getLengthQuestionTypes() {
  return TYPE_LIST.slice();
}

export function generateLengthQuestions({
  count = 8,
  allowedTypes = null
} = {}) {
  const oldPlaneShapeIds = new Set([
    "perimeter-quadrilaterals",
    "perimeter-parallelograms",
    "perimeter-trapeziums",
    "perimeter-rhombuses",
    "perimeter-kites"
  ]);

  const typeIds = Array.isArray(allowedTypes) && allowedTypes.length
    ? [...new Set(allowedTypes.map(id => oldPlaneShapeIds.has(id) ? "perimeter-plane-shapes" : id))].filter(id => GENERATORS[id])
    : TYPE_LIST.map(t => t.id);

  const plan = makeBalancedPlan(typeIds, count);

  return plan.map(type => GENERATORS[type]()).map(attachQuestionTranslations);
}
