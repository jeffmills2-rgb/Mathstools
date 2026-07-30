/*
  CHHS Exam Builder — Area Question Bank
  --------------------------------------
  Save as:

  question-banks/area/index.js

  Requires:
  - engines/area/area-engine.js
*/

import {
  createQuestion,
  QUESTION_KINDS,
  SPACE_SIZES
} from "../../schemas/question.schema.js";

import {
  attachQuestionTranslations
} from "../../utils/translation.js";

const TOPIC = "Area";

const TYPE_LIST = [
  { id: "area-rectangles", label: "Area of rectangles and squares" },
  { id: "area-triangles", label: "Area of triangles" },
  { id: "area-parallelograms", label: "Area of parallelograms" },

  { id: "composite-rectangles-triangles", label: "Composite area: plane shapes" },
  { id: "area-worded-problems", label: "Worded area problems" },

  { id: "area-circles-radius", label: "Area of circles using radius" },
  { id: "area-circles-diameter", label: "Area of circles using diameter" },
  { id: "area-sectors", label: "Area of sectors" },
  { id: "area-semicircles", label: "Area of semicircles" },
  { id: "area-quadrants", label: "Area of quadrants" },
  { id: "curved-composite-area", label: "Composite area with circles, semicircles and quadrants" },

  { id: "area-trapeziums", label: "Area of trapeziums" },
  { id: "area-rhombuses", label: "Area of rhombuses" },
  { id: "area-kites", label: "Area of kites" },
  { id: "choose-area-units", label: "Choose appropriate area units" },
  { id: "convert-area-units", label: "Convert metric units of area" },

  { id: "grid-count-area", label: "Find area by counting squares" },
  { id: "area-find-dimension", label: "Find a missing dimension from the area" },
  { id: "annulus-area", label: "Area of a ring (annulus)" },
  { id: "area-coverage", label: "Real-world coverage (paint/turf)" },
  { id: "error-spot-area", label: "Spot the error (reasoning)" },
  { id: "true-false-area", label: "Area facts: true or false (reasoning)" },
  { id: "multi-part-area", label: "Multi-part area problem" }
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

function randomId(prefix = "area") {
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

function areaQuestion({
  type,
  marks = 1,
  prompt,
  answer,
  working = [],
  diagram = null,
  choices = null,
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
    choices,
    answer,
    working,
    space,
    tags: ["area", type]
  });
}

function unitLabel(value, unit) {
  return `${value} ${unit}`;
}

function squareUnit(unit) {
  return `${unit}²`;
}

function areaLabel(value, unit) {
  return `${value} ${squareUnit(unit)}`;
}

function piAreaTerm(coefficient, unit = "") {
  const rounded = Math.round(coefficient * 1000) / 1000;
  if (rounded === 1) return `π${unit ? " " + squareUnit(unit) : ""}`;
  return `${rounded}π${unit ? " " + squareUnit(unit) : ""}`;
}

function approx(value, dp = 1) {
  return Number(value.toFixed(dp)).toString();
}

function decimalArea(value, unit) {
  return `${approx(value, 1)} ${squareUnit(unit)}`;
}

function exactMode() {
  return Math.random() < 0.55;
}

function promptSuffix(exact) {
  return exact ? "Give your answer in terms of π." : "Give your answer correct to 1 decimal place.";
}

function areaDiagram(diagramType, config = {}) {
  return {
    engine: "area-engine",
    config: {
      diagramType,
      ...config
    }
  };
}

function cleanNumber(value, dp = 2) {
  if (Math.abs(value - Math.round(value)) < 1e-9) return String(Math.round(value));
  return Number(value.toFixed(dp)).toString();
}

function money(value) {
  return `$${Number(value).toFixed(2)}`;
}

function edgeLabel(edge, text, dx = 0, dy = 0, className = "area-small-label") {
  return { edge, text, dx, dy, className };
}

function internalLine(from, to, className = "area-dash") {
  return { from, to, className };
}

function rightAngleMark(x, y, orientation = "bottom-right", size = 18) {
  return { x, y, orientation, size };
}

function customCompositeDiagram(points, edgeLabels = [], internalLines = [], rightAngles = [], dimensionArrows = [], pointLabels = []) {
  return areaDiagram("composite-straight", {
    points,
    edgeLabels,
    internalLines,
    rightAngles,
    dimensionArrows,
    pointLabels
  });
}

/* -----------------------------
   Rectangles, triangles and parallelograms
----------------------------- */

function areaRectanglesQuestion() {
  const unit = choice(["cm", "m", "mm"]);
  const square = Math.random() < 0.35;

  if (square) {
    const side = randInt(4, 18);
    const area = side * side;

    return areaQuestion({
      type: "area-rectangles",
      marks: 1,
      prompt: `Find the area of the square.`,
      diagram: areaDiagram("rectangle", {
        shape: "square",
        lengthLabel: unitLabel(side, unit),
        widthLabel: unitLabel(side, unit)
      }),
      answer: areaLabel(area, unit),
      working: [`A = l × b`, `A = ${side} × ${side} = ${area} ${squareUnit(unit)}.`],
      space: SPACE_SIZES.SMALL
    });
  }

  const length = randInt(5, 24);
  const width = randInt(3, 15);
  const area = length * width;

  return areaQuestion({
    type: "area-rectangles",
    marks: 1,
    prompt: `Find the area of the rectangle.`,
    diagram: areaDiagram("rectangle", {
      lengthLabel: unitLabel(length, unit),
      widthLabel: unitLabel(width, unit)
    }),
    answer: areaLabel(area, unit),
    working: [`A = l × b`, `A = ${length} × ${width} = ${area} ${squareUnit(unit)}.`],
    space: SPACE_SIZES.SMALL
  });
}

function areaTrianglesQuestion() {
  const unit = choice(["cm", "m", "mm"]);
  const base = randInt(6, 24);
  const height = randInt(4, 16);
  const area = base * height / 2;

  return areaQuestion({
    type: "area-triangles",
    marks: 2,
    prompt: `Find the area of the triangle.`,
    diagram: areaDiagram("triangle", {
      baseLabel: unitLabel(base, unit),
      heightLabel: unitLabel(height, unit),
      oblique: Math.random() < 0.5
    }),
    answer: areaLabel(area, unit),
    working: [`A = 1/2 × b × h`, `A = 1/2 × ${base} × ${height} = ${area} ${squareUnit(unit)}.`],
    space: SPACE_SIZES.MEDIUM
  });
}

function areaParallelogramsQuestion() {
  const unit = choice(["cm", "m", "mm"]);
  const base = randInt(6, 24);
  const height = randInt(4, 16);
  const area = base * height;

  return areaQuestion({
    type: "area-parallelograms",
    marks: 1,
    prompt: `Find the area of the parallelogram.`,
    diagram: areaDiagram("parallelogram", {
      baseLabel: unitLabel(base, unit),
      heightLabel: unitLabel(height, unit)
    }),
    answer: areaLabel(area, unit),
    working: [`A = b × h`, `A = ${base} × ${height} = ${area} ${squareUnit(unit)}.`],
    space: SPACE_SIZES.SMALL
  });
}

function compositeRectanglesTrianglesQuestion() {
  const unit = choice(["cm", "m"]);
  const shape = choice([
    "l-shape",
    "u-shape",
    "t-shape",
    "rectangle-triangle",
    "arrow-shape",
    "trapezium-strip",
    "rectangle-triangle-side",
    "frame-cutout",
    "notched-rectangle",
    "wide-arrow",
    "bowtie",
    "trapezium-plus-triangle",
    "rhombus-diagonals",
    "kite-diagonals"
  ]);

  if (shape === "trapezium-strip") {
    const left = choice([18, 20, 22, 25]);
    const right = choice([12, 16, 18, 20]);
    const distance = choice([8, 10, 12, 14]);
    const area = (left + right) / 2 * distance;
    const pts = [
      { x: 170, y: 315 },
      { x: 170, y: 95 },
      { x: 520, y: 150 },
      { x: 520, y: 315 }
    ];

    return areaQuestion({
      type: "composite-rectangles-triangles",
      marks: 2,
      prompt: `Find the area of the composite figure.`,
      diagram: customCompositeDiagram(pts, [
        edgeLabel([3, 0], unitLabel(distance, unit), 0, 32),
        edgeLabel([0, 1], unitLabel(left, unit), -44, 0),
        edgeLabel([2, 3], unitLabel(right, unit), 44, 0)
      ]),
      answer: areaLabel(area, unit),
      working: [
        `The parallel sides are ${left} ${unit} and ${right} ${unit}.`,
        `The perpendicular distance between them is ${distance} ${unit}.`,
        `Area = 1/2 × (${left} + ${right}) × ${distance} = ${area} ${squareUnit(unit)}.`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  if (shape === "rectangle-triangle-side") {
    const rectWidth = choice([8, 10, 12]);
    const height = choice([8, 10, 12, 14]);
    const totalWidth = rectWidth + choice([5, 6, 7, 8]);
    const triangleWidth = totalWidth - rectWidth;
    const area = rectWidth * height + triangleWidth * height / 2;
    const x = 150;
    const y = 120;
    const sx = 360 / totalWidth;
    const sy = 190 / height;
    const pts = [
      { x, y },
      { x: x + rectWidth * sx, y },
      { x: x + totalWidth * sx, y: y + height * sy / 2 },
      { x: x + rectWidth * sx, y: y + height * sy },
      { x, y: y + height * sy }
    ];

    return areaQuestion({
      type: "composite-rectangles-triangles",
      marks: 2,
      prompt: `Find the area of the composite figure.`,
      diagram: customCompositeDiagram(pts, [
        edgeLabel([0, 1], unitLabel(rectWidth, unit), 0, -24),
        edgeLabel([4, 0], unitLabel(height, unit), -42, 0)
      ], [
        internalLine({ x: x + rectWidth * sx, y }, { x: x + rectWidth * sx, y: y + height * sy })
      ], [], [
        { from: { x, y: y + height * sy + 40 }, to: { x: x + totalWidth * sx, y: y + height * sy + 40 }, text: unitLabel(totalWidth, unit), offset: 18 }
      ]),
      answer: areaLabel(area, unit),
      working: [
        `Rectangle area = ${rectWidth} × ${height} = ${rectWidth * height} ${squareUnit(unit)}.`,
        `Triangle base = ${totalWidth} − ${rectWidth} = ${triangleWidth} ${unit}.`,
        `Triangle area = 1/2 × ${triangleWidth} × ${height} = ${triangleWidth * height / 2} ${squareUnit(unit)}.`,
        `Total area = ${area} ${squareUnit(unit)}.`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  if (shape === "frame-cutout") {
    const outerW = choice([30, 36, 40, 46]);
    const outerH = choice([50, 60, 72]);
    const innerW = choice([10, 14, 18, 20]);
    const innerH = choice([22, 30, 36, 46]);
    const area = outerW * outerH - innerW * innerH;
    const pts = [
      { x: 180, y: 70 }, { x: 520, y: 70 }, { x: 520, y: 335 }, { x: 180, y: 335 }
    ];
    const x1 = 300, y1 = 135, x2 = 400, y2 = 270;

    return areaQuestion({
      type: "composite-rectangles-triangles",
      marks: 2,
      prompt: `Find the shaded area.`,
      diagram: areaDiagram("composite-straight", {
        points: pts,
        holes: [[{ x: x1, y: y1 }, { x: x2, y: y1 }, { x: x2, y: y2 }, { x: x1, y: y2 }]],
        edgeLabels: [
          edgeLabel([0, 1], unitLabel(outerW, unit), 0, -26),
          edgeLabel([1, 2], unitLabel(outerH, unit), 40, 0)
        ],
        pointLabels: [
          { x: (x1 + x2) / 2, y: y1 + 22, text: unitLabel(innerW, unit) },
          { x: (x1 + x2) / 2, y: (y1 + y2) / 2, text: unitLabel(innerH, unit) }
        ]
      }),
      answer: areaLabel(area, unit),
      working: [
        `Outer rectangle area = ${outerW} × ${outerH} = ${outerW * outerH} ${squareUnit(unit)}.`,
        `Inner rectangle area = ${innerW} × ${innerH} = ${innerW * innerH} ${squareUnit(unit)}.`,
        `Shaded area = ${outerW * outerH} − ${innerW * innerH} = ${area} ${squareUnit(unit)}.`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  if (shape === "notched-rectangle") {
    const width = choice([8, 9, 10, 12]);
    const height = choice([10, 12, 14]);
    const notchDepth = choice([5, 6, 7]);
    const area = width * height - width * notchDepth / 2;
    const pts = [
      { x: 215, y: 90 }, { x: 505, y: 90 }, { x: 505, y: 320 },
      { x: 360, y: 320 - notchDepth * 15 }, { x: 215, y: 320 }
    ];

    return areaQuestion({
      type: "composite-rectangles-triangles",
      marks: 2,
      prompt: `Find the area of the composite figure.`,
      diagram: customCompositeDiagram(pts, [
        edgeLabel([0, 1], unitLabel(width, unit), 0, -24),
        edgeLabel([1, 2], unitLabel(height, unit), 40, 0)
      ], [], [], [
        { from: { x: 360, y: 90 }, to: { x: 360, y: 320 - notchDepth * 15 }, text: unitLabel(notchDepth, unit), offset: 26, vertical: true }
      ]),
      answer: areaLabel(area, unit),
      working: [
        `Outer rectangle area = ${width} × ${height} = ${width * height} ${squareUnit(unit)}.`,
        `Triangular cut-out area = 1/2 × ${width} × ${notchDepth} = ${width * notchDepth / 2} ${squareUnit(unit)}.`,
        `Area = ${area} ${squareUnit(unit)}.`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  if (shape === "wide-arrow") {
    const rectLength = choice([18, 20, 25]);
    const rectHeight = choice([4, 5, 6]);
    const triangleLength = choice([6, 8, 10]);
    const triangleHeight = rectHeight * 3;
    const area = rectLength * rectHeight + triangleLength * triangleHeight / 2;
    const x = 180;
    const y = 170;
    const sx = 330 / (rectLength + triangleLength);
    const sy = 135 / triangleHeight;
    const midY = y + triangleHeight * sy / 2;
    const pts = [
      { x, y: midY },
      { x: x + triangleLength * sx, y },
      { x: x + triangleLength * sx, y: midY - rectHeight * sy / 2 },
      { x: x + (triangleLength + rectLength) * sx, y: midY - rectHeight * sy / 2 },
      { x: x + (triangleLength + rectLength) * sx, y: midY + rectHeight * sy / 2 },
      { x: x + triangleLength * sx, y: midY + rectHeight * sy / 2 },
      { x: x + triangleLength * sx, y: y + triangleHeight * sy }
    ];

    return areaQuestion({
      type: "composite-rectangles-triangles",
      marks: 2,
      prompt: `Find the area of the composite figure.`,
      diagram: customCompositeDiagram(pts, [
        edgeLabel([3, 4], unitLabel(rectHeight, unit), 38, 0),
        edgeLabel([2, 3], unitLabel(rectLength, unit), 0, -26),
        edgeLabel([2, 5], unitLabel(triangleHeight, unit), -34, 0)
      ], [
        internalLine(pts[2], pts[5])
      ], [], [
        // The triangular arrow head is treated as a triangle with a vertical base.
        // Its perpendicular height is the horizontal distance from the tip to that base,
        // so the dimension arrow must be horizontal rather than along the sloping side.
        {
          from: { x: pts[0].x, y: pts[0].y - 60 },
          to: { x: pts[2].x, y: pts[0].y - 60 },
          text: unitLabel(triangleLength, unit),
          offset: -14
        }
      ]),
      answer: areaLabel(area, unit),
      working: [
        `Rectangle area = ${rectLength} × ${rectHeight} = ${rectLength * rectHeight} ${squareUnit(unit)}.`,
        `Triangle area = 1/2 × ${triangleLength} × ${triangleHeight} = ${triangleLength * triangleHeight / 2} ${squareUnit(unit)}.`,
        `Total area = ${area} ${squareUnit(unit)}.`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  if (shape === "bowtie") {
    const halfWidth = choice([7, 8, 9, 10]);
    const height = choice([6, 8, 10]);
    const area = halfWidth * height;
    const cx = 360;
    const cy = 220;
    const pts = [
      { x: cx - halfWidth * 16, y: cy - height * 10 },
      { x: cx, y: cy },
      { x: cx - halfWidth * 16, y: cy + height * 10 },
      { x: cx + halfWidth * 16, y: cy + height * 10 },
      { x: cx, y: cy },
      { x: cx + halfWidth * 16, y: cy - height * 10 }
    ];

    return areaQuestion({
      type: "composite-rectangles-triangles",
      marks: 2,
      prompt: `Find the total shaded area.`,
      diagram: areaDiagram("composite-straight", {
        bowtie: true,
        points: pts,
        edgeLabels: [
          edgeLabel([0, 2], unitLabel(height, unit), -36, 0),
          edgeLabel([5, 3], unitLabel(height, unit), 36, 0)
        ],
        dimensionArrows: [
          { from: { x: pts[2].x, y: pts[2].y + 32 }, to: { x: cx, y: pts[2].y + 32 }, text: unitLabel(halfWidth, unit), offset: 15 },
          { from: { x: cx, y: pts[3].y + 32 }, to: { x: pts[3].x, y: pts[3].y + 32 }, text: unitLabel(halfWidth, unit), offset: 15 }
        ]
      }),
      answer: areaLabel(area, unit),
      working: [
        `Each triangle area = 1/2 × ${halfWidth} × ${height} = ${halfWidth * height / 2} ${squareUnit(unit)}.`,
        `There are two congruent triangles.`,
        `Total area = ${area} ${squareUnit(unit)}.`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  if (shape === "trapezium-plus-triangle") {
    return advancedCompositeAreaQuestion("composite-rectangles-triangles");
  }

  if (shape === "rhombus-diagonals") {
    const q = areaRhombusesQuestion();
    return { ...q, type: "composite-rectangles-triangles" };
  }

  if (shape === "kite-diagonals") {
    const q = areaKitesQuestion();
    return { ...q, type: "composite-rectangles-triangles" };
  }

  if (shape === "rectangle-triangle") {
    const width = randInt(10, 20);
    const rectHeight = randInt(5, 12);
    const triangleHeight = randInt(4, 10);
    const area = width * rectHeight + width * triangleHeight / 2;

    return areaQuestion({
      type: "composite-rectangles-triangles",
      marks: 2,
      prompt: `Find the area of the composite figure.`,
      diagram: areaDiagram("composite-straight", {
        shape: "rectangle-triangle",
        baseLabel: unitLabel(width, unit),
        heightLabel: unitLabel(rectHeight, unit),
        triangleHeightLabel: unitLabel(triangleHeight, unit)
      }),
      answer: areaLabel(area, unit),
      working: [
        `Rectangle area = ${width} × ${rectHeight} = ${width * rectHeight} ${squareUnit(unit)}.`,
        `Triangle area = 1/2 × ${width} × ${triangleHeight} = ${width * triangleHeight / 2} ${squareUnit(unit)}.`,
        `Total area = ${area} ${squareUnit(unit)}.`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  if (shape === "u-shape") {
    const width = choice([18, 20, 24, 28]);
    const height = choice([14, 16, 18, 20]);
    const cutWidth = choice([6, 8, 10]);
    const cutDepth = choice([6, 8, 10, 12]);
    const area = width * height - cutWidth * cutDepth;
    const x = 150;
    const y = 105;
    const sx = 420 / width;
    const sy = 220 / height;
    const leftArm = (width - cutWidth) / 2;
    const pts = [
      { x, y },
      { x: x + width * sx, y },
      { x: x + width * sx, y: y + height * sy },
      { x: x + (leftArm + cutWidth) * sx, y: y + height * sy },
      { x: x + (leftArm + cutWidth) * sx, y: y + (height - cutDepth) * sy },
      { x: x + leftArm * sx, y: y + (height - cutDepth) * sy },
      { x: x + leftArm * sx, y: y + height * sy },
      { x, y: y + height * sy }
    ];

    return areaQuestion({
      type: "composite-rectangles-triangles",
      marks: 2,
      prompt: `Find the area of the composite figure.`,
      diagram: customCompositeDiagram(pts, [
        edgeLabel([0, 1], unitLabel(width, unit), 0, -28),
        edgeLabel([1, 2], unitLabel(height, unit), 42, 0),
        edgeLabel([4, 5], unitLabel(cutWidth, unit), 0, -24),
        edgeLabel([5, 6], unitLabel(cutDepth, unit), -42, 0)
      ]),
      answer: areaLabel(area, unit),
      working: [
        `Outer rectangle area = ${width} × ${height} = ${width * height} ${squareUnit(unit)}.`,
        `Cut-out area = ${cutWidth} × ${cutDepth} = ${cutWidth * cutDepth} ${squareUnit(unit)}.`,
        `Area = ${width * height} − ${cutWidth * cutDepth} = ${area} ${squareUnit(unit)}.`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  if (shape === "t-shape") {
    const topWidth = choice([18, 20, 24, 30]);
    const topHeight = choice([4, 5, 6]);
    const stemWidth = choice([6, 8, 10]);
    const stemHeight = choice([10, 12, 14, 16]);
    const area = topWidth * topHeight + stemWidth * stemHeight;
    const x = 150;
    const y = 100;
    const sx = 420 / topWidth;
    const sy = 250 / (topHeight + stemHeight);
    const side = (topWidth - stemWidth) / 2;
    const pts = [
      { x, y },
      { x: x + topWidth * sx, y },
      { x: x + topWidth * sx, y: y + topHeight * sy },
      { x: x + (side + stemWidth) * sx, y: y + topHeight * sy },
      { x: x + (side + stemWidth) * sx, y: y + (topHeight + stemHeight) * sy },
      { x: x + side * sx, y: y + (topHeight + stemHeight) * sy },
      { x: x + side * sx, y: y + topHeight * sy },
      { x, y: y + topHeight * sy }
    ];

    return areaQuestion({
      type: "composite-rectangles-triangles",
      marks: 2,
      prompt: `Find the area of the composite figure.`,
      diagram: customCompositeDiagram(pts, [
        edgeLabel([0, 1], unitLabel(topWidth, unit), 0, -26),
        edgeLabel([1, 2], unitLabel(topHeight, unit), 36, 0),
        edgeLabel([4, 5], unitLabel(stemWidth, unit), 0, 30),
        edgeLabel([3, 4], unitLabel(stemHeight, unit), 46, 0)
      ]),
      answer: areaLabel(area, unit),
      working: [
        `Top rectangle area = ${topWidth} × ${topHeight} = ${topWidth * topHeight} ${squareUnit(unit)}.`,
        `Stem area = ${stemWidth} × ${stemHeight} = ${stemWidth * stemHeight} ${squareUnit(unit)}.`,
        `Total area = ${area} ${squareUnit(unit)}.`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  if (shape === "arrow-shape") {
    const rectLength = choice([14, 16, 18, 20]);
    const height = choice([6, 8, 10]);
    const triangleLength = choice([5, 6, 8]);
    const area = rectLength * height + triangleLength * height / 2;
    const x = 150;
    const y = 130;
    const sx = 360 / (rectLength + triangleLength);
    const sy = 180 / height;
    const pts = [
      { x, y },
      { x: x + rectLength * sx, y },
      { x: x + (rectLength + triangleLength) * sx, y: y + height * sy / 2 },
      { x: x + rectLength * sx, y: y + height * sy },
      { x, y: y + height * sy }
    ];

    return areaQuestion({
      type: "composite-rectangles-triangles",
      marks: 2,
      prompt: `Find the area of the composite figure.`,
      diagram: customCompositeDiagram(pts, [
        edgeLabel([0, 1], unitLabel(rectLength, unit), 0, -28),
        edgeLabel([4, 0], unitLabel(height, unit), -42, 0),
        edgeLabel([1, 2], unitLabel(triangleLength, unit), 40, -18)
      ], [
        internalLine({ x: x + rectLength * sx, y }, { x: x + rectLength * sx, y: y + height * sy })
      ]),
      answer: areaLabel(area, unit),
      working: [
        `Rectangle area = ${rectLength} × ${height} = ${rectLength * height} ${squareUnit(unit)}.`,
        `Triangle area = 1/2 × ${triangleLength} × ${height} = ${triangleLength * height / 2} ${squareUnit(unit)}.`,
        `Total area = ${area} ${squareUnit(unit)}.`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  const top = randInt(14, 24);
  const leftHeight = randInt(8, 16);
  const rightHeight = randInt(4, leftHeight - 2);
  const notchWidth = randInt(4, 9);
  const bottom = top - notchWidth;
  const area = bottom * leftHeight + notchWidth * rightHeight;

  return areaQuestion({
    type: "composite-rectangles-triangles",
    marks: 2,
    prompt: `Find the area of the composite figure.`,
    diagram: areaDiagram("composite-straight", {
      shape: "l-shape",
      topLabel: unitLabel(top, unit),
      leftHeightLabel: unitLabel(leftHeight, unit),
      rightHeightLabel: unitLabel(rightHeight, unit),
      notchWidthLabel: unitLabel(notchWidth, unit),
      bottomLabel: unitLabel(bottom, unit)
    }),
    answer: areaLabel(area, unit),
    working: [
      `Split the shape into two rectangles.`,
      `Area = ${bottom} × ${leftHeight} + ${notchWidth} × ${rightHeight}.`,
      `Area = ${area} ${squareUnit(unit)}.`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function areaWordedProblemsQuestion() {
  const unit = choice(["m", "cm"]);
  const mode = choice(["tiling", "path-around-garden", "wall-cutout", "concrete-path", "perimeter-to-area"]);

  if (mode === "tiling") {
    const length = choice([4, 5, 6, 8, 10]);
    const width = choice([2.5, 3, 3.5, 4, 4.5]);
    const cost = choice([32.85, 40, 48, 72.45, 74]);
    const area = length * width;
    const total = area * cost;

    return areaQuestion({
      type: "area-worded-problems",
      marks: 3,
      prompt: `A rectangular room is ${length} m long and ${width} m wide. Tiles cost ${money(cost)} per square metre. Find the cost of tiling the room.`,
      answer: money(total),
      working: [`Area = ${length} × ${width} = ${cleanNumber(area)} m².`, `Cost = ${cleanNumber(area)} × ${money(cost)} = ${money(total)}.`],
      space: SPACE_SIZES.LARGE
    });
  }

  if (mode === "path-around-garden") {
    const length = choice([4, 6, 8, 10, 12]);
    const width = choice([3, 4, 5, 6]);
    const path = choice([1, 1.5, 2]);
    const outerLength = length + 2 * path;
    const outerWidth = width + 2 * path;
    const area = outerLength * outerWidth - length * width;

    return areaQuestion({
      type: "area-worded-problems",
      marks: 3,
      prompt: `A rectangular garden is ${length} m long and ${width} m wide. A path ${path} m wide is built around the garden. What is the area of the path?`,
      answer: areaLabel(cleanNumber(area), "m"),
      working: [`Outer rectangle = ${outerLength} m by ${outerWidth} m.`, `Outer area = ${cleanNumber(outerLength * outerWidth)} m².`, `Garden area = ${length} × ${width} = ${length * width} m².`, `Path area = ${cleanNumber(area)} m².`],
      space: SPACE_SIZES.LARGE
    });
  }

  if (mode === "wall-cutout") {
    const length = choice([4.8, 5.2, 6, 7.5]);
    const width = choice([3, 3.2, 3.5, 4]);
    const doorHeight = choice([2, 2.1, 2.2]);
    const doorWidth = choice([0.8, 0.9, 1]);
    const area = length * width - doorHeight * doorWidth;

    return areaQuestion({
      type: "area-worded-problems",
      marks: 3,
      prompt: `A rectangular wall is ${length} m by ${width} m. A doorway ${doorHeight} m by ${doorWidth} m is cut into it. What area of wall remains?`,
      answer: areaLabel(cleanNumber(area), "m"),
      working: [`Wall area = ${length} × ${width} = ${cleanNumber(length * width)} m².`, `Doorway area = ${doorHeight} × ${doorWidth} = ${cleanNumber(doorHeight * doorWidth)} m².`, `Remaining area = ${cleanNumber(area)} m².`],
      space: SPACE_SIZES.LARGE
    });
  }

  if (mode === "concrete-path") {
    const length = choice([9, 10, 12, 15]);
    const width = choice([1.2, 1.5, 2]);
    const cost = choice([40, 48, 52.5, 65]);
    const area = length * width;
    const total = area * cost;

    return areaQuestion({
      type: "area-worded-problems",
      marks: 3,
      prompt: `A rectangular path is ${length} m long and ${width} m wide. Concrete costs ${money(cost)} per square metre. Find the cost of concreting the path.`,
      answer: money(total),
      working: [`Area = ${length} × ${width} = ${cleanNumber(area)} m².`, `Cost = ${cleanNumber(area)} × ${money(cost)} = ${money(total)}.`],
      space: SPACE_SIZES.LARGE
    });
  }

  const perimeter = choice([48, 60, 72, 84, 96]);
  const side = perimeter / 4;
  const area = side * side;

  return areaQuestion({
    type: "area-worded-problems",
    marks: 2,
    prompt: `The perimeter of a square is ${perimeter} m. Find the area of the square.`,
    answer: areaLabel(area, "m"),
    working: [`Side length = ${perimeter} ÷ 4 = ${side} m.`, `Area = ${side} × ${side} = ${area} m².`],
    space: SPACE_SIZES.MEDIUM
  });
}

/* -----------------------------
   Circles and curved area
----------------------------- */

function areaCirclesRadiusQuestion() {
  const unit = choice(["cm", "m"]);
  const radius = randInt(3, 15);
  const exact = exactMode();
  const exactAnswer = piAreaTerm(radius * radius, unit);
  const decimalAnswer = decimalArea(Math.PI * radius * radius, unit);

  return areaQuestion({
    type: "area-circles-radius",
    marks: 2,
    prompt: `Find the area of the circle. ${promptSuffix(exact)}`,
    diagram: areaDiagram("circle", {
      given: "radius",
      radius,
      radiusLabel: unitLabel(radius, unit),
      unit
    }),
    answer: exact ? exactAnswer : decimalAnswer,
    working: exact
      ? [`A = πr²`, `A = π × ${radius}² = ${exactAnswer}.`]
      : [`A = πr²`, `A = π × ${radius}²`, `A ≈ ${decimalAnswer}.`],
    space: SPACE_SIZES.MEDIUM
  });
}

function areaCirclesDiameterQuestion() {
  const unit = choice(["cm", "m"]);
  const radius = randInt(3, 12);
  const diameter = radius * 2;
  const exact = exactMode();
  const exactAnswer = piAreaTerm(radius * radius, unit);
  const decimalAnswer = decimalArea(Math.PI * radius * radius, unit);

  return areaQuestion({
    type: "area-circles-diameter",
    marks: 2,
    prompt: `Find the area of the circle. ${promptSuffix(exact)}`,
    diagram: areaDiagram("circle", {
      given: "diameter",
      diameter,
      diameterLabel: unitLabel(diameter, unit),
      unit
    }),
    answer: exact ? exactAnswer : decimalAnswer,
    working: exact
      ? [`Radius = ${diameter} ÷ 2 = ${radius} ${unit}.`, `A = πr²`, `A = π × ${radius}² = ${exactAnswer}.`]
      : [`Radius = ${diameter} ÷ 2 = ${radius} ${unit}.`, `A = πr²`, `A = π × ${radius}²`, `A ≈ ${decimalAnswer}.`],
    space: SPACE_SIZES.MEDIUM
  });
}

function areaSectorsQuestion() {
  const unit = choice(["cm", "m"]);
  const angle = choice([30, 45, 60, 90, 120, 180, 270]);
  const radius = randInt(4, 14);
  const coefficient = angle / 360 * radius * radius;
  const exact = exactMode();
  const exactAnswer = piAreaTerm(coefficient, unit);
  const decimalAnswer = decimalArea(coefficient * Math.PI, unit);

  return areaQuestion({
    type: "area-sectors",
    marks: 2,
    prompt: `Find the area of the sector. ${promptSuffix(exact)}`,
    diagram: areaDiagram("sector", {
      angle,
      radius,
      radiusLabel: unitLabel(radius, unit),
      unit
    }),
    answer: exact ? exactAnswer : decimalAnswer,
    working: exact
      ? [`A = θ/360 × πr²`, `A = ${angle}/360 × π × ${radius}² = ${exactAnswer}.`]
      : [`A = θ/360 × πr²`, `A = ${angle}/360 × π × ${radius}²`, `A ≈ ${decimalAnswer}.`],
    space: SPACE_SIZES.MEDIUM
  });
}

function areaSemicirclesQuestion() {
  const unit = choice(["cm", "m"]);
  const radius = randInt(4, 16);
  const coefficient = radius * radius / 2;
  const exact = exactMode();
  const exactAnswer = piAreaTerm(coefficient, unit);
  const decimalAnswer = decimalArea(coefficient * Math.PI, unit);

  return areaQuestion({
    type: "area-semicircles",
    marks: 2,
    prompt: `Find the area of the semicircle. ${promptSuffix(exact)}`,
    diagram: areaDiagram("partial-circle", {
      shape: "semicircle",
      radius,
      radiusLabel: unitLabel(radius, unit),
      unit
    }),
    answer: exact ? exactAnswer : decimalAnswer,
    working: exact
      ? [`A = 1/2 × πr²`, `A = 1/2 × π × ${radius}² = ${exactAnswer}.`]
      : [`A = 1/2 × πr²`, `A = 1/2 × π × ${radius}²`, `A ≈ ${decimalAnswer}.`],
    space: SPACE_SIZES.MEDIUM
  });
}

function areaQuadrantsQuestion() {
  const unit = choice(["cm", "m"]);
  const radius = randInt(4, 16);
  const coefficient = radius * radius / 4;
  const exact = exactMode();
  const exactAnswer = piAreaTerm(coefficient, unit);
  const decimalAnswer = decimalArea(coefficient * Math.PI, unit);

  return areaQuestion({
    type: "area-quadrants",
    marks: 2,
    prompt: `Find the area of the quadrant. ${promptSuffix(exact)}`,
    diagram: areaDiagram("partial-circle", {
      shape: "quadrant",
      radius,
      radiusLabel: unitLabel(radius, unit),
      unit
    }),
    answer: exact ? exactAnswer : decimalAnswer,
    working: exact
      ? [`A = 1/4 × πr²`, `A = 1/4 × π × ${radius}² = ${exactAnswer}.`]
      : [`A = 1/4 × πr²`, `A = 1/4 × π × ${radius}²`, `A ≈ ${decimalAnswer}.`],
    space: SPACE_SIZES.MEDIUM
  });
}

function curvedCompositeAreaQuestion() {
  const unit = choice(["cm", "m"]);
  const shape = choice(["rectangle-semicircle", "square-minus-quadrant", "annulus", "semicircle", "stadium", "rectangle-semicircle-cutout"]);

  if (shape === "square-minus-quadrant") {
    const side = choice([6, 8, 10, 12, 14]);
    const exact = exactMode();
    const exactAnswer = `${side * side} − ${piAreaTerm(side * side / 4, unit)}`;
    const decimalAnswer = decimalArea(side * side - Math.PI * side * side / 4, unit);

    return areaQuestion({
      type: "curved-composite-area",
      marks: 3,
      prompt: `Find the shaded area. ${promptSuffix(exact)}`,
      diagram: areaDiagram("curved-composite", {
        shape: "square-minus-quadrant",
        side,
        sideLabel: unitLabel(side, unit),
        unit
      }),
      answer: exact ? exactAnswer : decimalAnswer,
      working: exact
        ? [`Square area = ${side}² = ${side * side} ${squareUnit(unit)}.`, `Quadrant area = ${piAreaTerm(side * side / 4, unit)}.`, `Shaded area = ${exactAnswer}.`]
        : [`Square area = ${side}² = ${side * side} ${squareUnit(unit)}.`, `Quadrant area = 1/4 × π × ${side}².`, `Shaded area ≈ ${decimalAnswer}.`],
      space: SPACE_SIZES.LARGE
    });
  }

  if (shape === "annulus") {
    const outer = choice([10, 12, 15, 18, 20]);
    const inner = choice([3, 4, 5, 6, 8]);
    const exact = exactMode();
    const coefficient = outer * outer - inner * inner;
    const exactAnswer = piAreaTerm(coefficient, unit);
    const decimalAnswer = decimalArea(Math.PI * coefficient, unit);

    return areaQuestion({
      type: "curved-composite-area",
      marks: 3,
      prompt: `Find the shaded area. ${promptSuffix(exact)}`,
      diagram: areaDiagram("curved-composite", {
        shape: "annulus",
        outerLabel: unitLabel(outer, unit),
        innerLabel: unitLabel(inner, unit),
        unit
      }),
      answer: exact ? exactAnswer : decimalAnswer,
      working: exact
        ? [`Outer circle area = ${piAreaTerm(outer * outer, unit)}.`, `Inner circle area = ${piAreaTerm(inner * inner, unit)}.`, `Shaded area = ${exactAnswer}.`]
        : [`Outer circle area = π × ${outer}².`, `Inner circle area = π × ${inner}².`, `Shaded area ≈ ${decimalAnswer}.`],
      space: SPACE_SIZES.LARGE
    });
  }

  if (shape === "semicircle") {
    const diameter = choice([10, 12, 14, 16, 20, 24]);
    const radius = diameter / 2;
    const exact = exactMode();
    const coefficient = radius * radius / 2;
    const exactAnswer = piAreaTerm(coefficient, unit);
    const decimalAnswer = decimalArea(Math.PI * coefficient, unit);

    return areaQuestion({
      type: "curved-composite-area",
      marks: 2,
      prompt: `Find the shaded area of the semicircle. ${promptSuffix(exact)}`,
      diagram: areaDiagram("curved-composite", {
        shape: "semicircle",
        diameterLabel: unitLabel(diameter, unit),
        unit
      }),
      answer: exact ? exactAnswer : decimalAnswer,
      working: exact
        ? [`Radius = ${diameter} ÷ 2 = ${radius} ${unit}.`, `Area = 1/2 × π × ${radius}² = ${exactAnswer}.`]
        : [`Radius = ${diameter} ÷ 2 = ${radius} ${unit}.`, `Area = 1/2 × π × ${radius}².`, `Area ≈ ${decimalAnswer}.`],
      space: SPACE_SIZES.MEDIUM
    });
  }

  if (shape === "stadium") {
    const straightLength = choice([8, 10, 12, 14, 16]);
    const diameter = choice([4, 6, 8, 10]);
    const radius = diameter / 2;
    const exact = exactMode();
    const rectangleArea = straightLength * diameter;
    const exactAnswer = `${rectangleArea} + ${piAreaTerm(radius * radius, unit)}`;
    const decimalAnswer = decimalArea(rectangleArea + Math.PI * radius * radius, unit);

    return areaQuestion({
      type: "curved-composite-area",
      marks: 3,
      prompt: `Find the area of the composite figure. ${promptSuffix(exact)}`,
      diagram: areaDiagram("curved-composite", {
        shape: "stadium",
        lengthLabel: unitLabel(straightLength, unit),
        diameterLabel: unitLabel(diameter, unit),
        unit
      }),
      answer: exact ? exactAnswer : decimalAnswer,
      working: exact
        ? [`Rectangle area = ${straightLength} × ${diameter} = ${rectangleArea} ${squareUnit(unit)}.`, `The two semicircles make one circle with radius ${radius} ${unit}.`, `Circle area = ${piAreaTerm(radius * radius, unit)}.`, `Total area = ${exactAnswer}.`]
        : [`Rectangle area = ${rectangleArea} ${squareUnit(unit)}.`, `The two semicircles make one circle with radius ${radius} ${unit}.`, `Total area ≈ ${decimalAnswer}.`],
      space: SPACE_SIZES.LARGE
    });
  }

  if (shape === "rectangle-semicircle-cutout") {
    const width = choice([20, 30, 40, 50]);
    const height = choice([20, 30, 40]);
    const notchDiameter = height / 2;
    const radius = notchDiameter / 2;
    const exact = exactMode();
    const rectangleArea = width * height;
    const exactAnswer = `${rectangleArea} − ${piAreaTerm(radius * radius, unit)}`;
    const decimalAnswer = decimalArea(rectangleArea - Math.PI * radius * radius, unit);

    return areaQuestion({
      type: "curved-composite-area",
      marks: 3,
      prompt: `Find the shaded area. ${promptSuffix(exact)}`,
      diagram: areaDiagram("curved-composite", {
        shape: "rectangle-semicircle-cutout",
        widthLabel: unitLabel(width, unit),
        heightLabel: unitLabel(height, unit),
        notchLabel: unitLabel(notchDiameter, unit),
        unit
      }),
      answer: exact ? exactAnswer : decimalAnswer,
      working: exact
        ? [`Rectangle area = ${width} × ${height} = ${rectangleArea} ${squareUnit(unit)}.`, `Two semicircular cutouts make one circle with radius ${radius} ${unit}.`, `Cut-out area = ${piAreaTerm(radius * radius, unit)}.`, `Shaded area = ${exactAnswer}.`]
        : [`Rectangle area = ${rectangleArea} ${squareUnit(unit)}.`, `Two semicircular cutouts make one circle with radius ${radius} ${unit}.`, `Shaded area ≈ ${decimalAnswer}.`],
      space: SPACE_SIZES.LARGE
    });
  }

  const width = choice([8, 10, 12, 14, 16]);
  const height = choice([4, 6, 8, 10]);
  const radius = height / 2;
  const exact = exactMode();
  const rectangleArea = width * height;
  const exactAnswer = `${rectangleArea} + ${piAreaTerm(radius * radius / 2, unit)}`;
  const decimalAnswer = decimalArea(rectangleArea + Math.PI * radius * radius / 2, unit);

  return areaQuestion({
    type: "curved-composite-area",
    marks: 3,
    prompt: `Find the area of the composite figure. ${promptSuffix(exact)}`,
    diagram: areaDiagram("curved-composite", {
      shape: "rectangle-semicircle",
      width,
      height,
      widthLabel: unitLabel(width, unit),
      heightLabel: unitLabel(height, unit),
      unit
    }),
    answer: exact ? exactAnswer : decimalAnswer,
    working: exact
      ? [`Rectangle area = ${width} × ${height} = ${rectangleArea} ${squareUnit(unit)}.`, `Semicircle radius = ${radius} ${unit}.`, `Semicircle area = ${piAreaTerm(radius * radius / 2, unit)}.`, `Total area = ${exactAnswer}.`]
      : [`Rectangle area = ${width} × ${height} = ${rectangleArea} ${squareUnit(unit)}.`, `Semicircle radius = ${radius} ${unit}.`, `Total area ≈ ${decimalAnswer}.`],
    space: SPACE_SIZES.LARGE
  });
}

/* -----------------------------
   Trapeziums, rhombuses and kites
----------------------------- */

function areaTrapeziumsQuestion() {
  const unit = choice(["cm", "m"]);
  const a = randInt(6, 16);
  const b = a + randInt(4, 12);
  const h = randInt(4, 12);
  const area = h / 2 * (a + b);

  return areaQuestion({
    type: "area-trapeziums",
    marks: 2,
    prompt: `Find the area of the trapezium.`,
    diagram: areaDiagram("trapezium", {
      topLabel: unitLabel(a, unit),
      bottomLabel: unitLabel(b, unit),
      heightLabel: unitLabel(h, unit)
    }),
    answer: areaLabel(area, unit),
    working: [`A = h/2 × (a + b)`, `A = ${h}/2 × (${a} + ${b}) = ${area} ${squareUnit(unit)}.`],
    space: SPACE_SIZES.MEDIUM
  });
}

function areaRhombusesQuestion() {
  const unit = choice(["cm", "m"]);
  const x = randInt(8, 24);
  const y = randInt(6, 20);
  const area = x * y / 2;

  return areaQuestion({
    type: "area-rhombuses",
    marks: 2,
    prompt: `Find the area of the rhombus.`,
    diagram: areaDiagram("rhombus", {
      diagonalXLabel: unitLabel(x, unit),
      diagonalYLabel: unitLabel(y, unit)
    }),
    answer: areaLabel(area, unit),
    working: [`A = 1/2 × x × y`, `A = 1/2 × ${x} × ${y} = ${area} ${squareUnit(unit)}.`],
    space: SPACE_SIZES.MEDIUM
  });
}

function areaKitesQuestion() {
  const unit = choice(["cm", "m"]);
  const x = randInt(8, 24);
  const y = randInt(6, 20);
  const area = x * y / 2;

  return areaQuestion({
    type: "area-kites",
    marks: 2,
    prompt: `Find the area of the kite.`,
    diagram: areaDiagram("kite", {
      diagonalXLabel: unitLabel(x, unit),
      diagonalYLabel: unitLabel(y, unit)
    }),
    answer: areaLabel(area, unit),
    working: [`A = 1/2 × x × y`, `A = 1/2 × ${x} × ${y} = ${area} ${squareUnit(unit)}.`],
    space: SPACE_SIZES.MEDIUM
  });
}

function advancedCompositeAreaQuestion(forceType = "advanced-composite-area") {
  const unit = choice(["cm", "m"]);
  const top = choice([14, 16, 18, 20]);
  const bottom = top + choice([3, 4, 5, 6]);
  const trapeziumHeight = choice([6, 8, 10, 12]);
  const triangleHeight = choice([5, 7, 9]);
  const triangleArea = top * triangleHeight / 2;
  const trapeziumArea = trapeziumHeight / 2 * (top + bottom);
  const totalArea = triangleArea + trapeziumArea;

  return areaQuestion({
    type: forceType,
    marks: 3,
    prompt: `Find the area of the composite figure.`,
    diagram: areaDiagram("advanced-composite", {
      trapeziumTopLabel: unitLabel(top, unit),
      trapeziumBottomLabel: unitLabel(bottom, unit),
      trapeziumHeightLabel: unitLabel(trapeziumHeight, unit),
      triangleHeightLabel: unitLabel(triangleHeight, unit),
      unit
    }),
    answer: areaLabel(totalArea, unit),
    working: [
      `Split the shape into a trapezium and a triangle.`,
      `Trapezium area = 1/2 × (${top} + ${bottom}) × ${trapeziumHeight} = ${trapeziumArea} ${squareUnit(unit)}.`,
      `Triangle area = 1/2 × ${top} × ${triangleHeight} = ${triangleArea} ${squareUnit(unit)}.`,
      `Total area = ${totalArea} ${squareUnit(unit)}.`
    ],
    space: SPACE_SIZES.LARGE
  });
}

/* -----------------------------
   Units
----------------------------- */

function chooseAreaUnitsQuestion() {
  const contexts = [
    { item: "a postage stamp", answer: "cm²", reason: "It is a small surface." },
    { item: "a classroom floor", answer: "m²", reason: "It is a room-sized surface." },
    { item: "a town park", answer: "ha", reason: "It is a large land area." },
    { item: "a large farm", answer: "km²", reason: "It is a very large land area." },
    { item: "a phone screen", answer: "cm²", reason: "It is a small surface." },
    { item: "the surface of a desk", answer: "cm²", reason: "It is a moderately small surface." },
    { item: "a football field", answer: "m²", reason: "It is a large surface but still best measured in square metres." }
  ];
  const context = choice(contexts);
  const choices = ["mm²", "cm²", "m²", "ha", "km²"];
  let options = shuffle([context.answer, ...choices.filter(unit => unit !== context.answer)]).slice(0, 4);
  if (!options.includes(context.answer)) options[randInt(0, 3)] = context.answer;

  return areaQuestion({
    type: "choose-area-units",
    marks: 1,
    prompt: `Circle the appropriate unit to measure the area of ${context.item}.`,
    choices: options,
    answer: context.answer,
    working: [`${context.answer} is appropriate because ${context.reason}`],
    space: SPACE_SIZES.NONE
  });
}

function convertAreaUnitsQuestion() {
  const mode = choice(["cm2-to-mm2", "m2-to-cm2", "ha-to-m2", "km2-to-m2", "m2-to-ha"]);

  if (mode === "cm2-to-mm2") {
    const value = randInt(2, 30);
    return areaQuestion({
      type: "convert-area-units",
      marks: 1,
      prompt: `Convert ${value} cm² to mm².`,
      answer: `${value * 100} mm²`,
      working: [`1 cm² = 100 mm²`, `${value} cm² = ${value * 100} mm².`],
      space: SPACE_SIZES.SMALL
    });
  }

  if (mode === "m2-to-cm2") {
    const value = randInt(2, 20);
    return areaQuestion({
      type: "convert-area-units",
      marks: 1,
      prompt: `Convert ${value} m² to cm².`,
      answer: `${value * 10000} cm²`,
      working: [`1 m² = 10 000 cm²`, `${value} m² = ${value * 10000} cm².`],
      space: SPACE_SIZES.SMALL
    });
  }

  if (mode === "ha-to-m2") {
    const value = randInt(2, 12);
    return areaQuestion({
      type: "convert-area-units",
      marks: 1,
      prompt: `Convert ${value} ha to m².`,
      answer: `${value * 10000} m²`,
      working: [`1 ha = 10 000 m²`, `${value} ha = ${value * 10000} m².`],
      space: SPACE_SIZES.SMALL
    });
  }

  if (mode === "km2-to-m2") {
    const value = randInt(2, 8);
    return areaQuestion({
      type: "convert-area-units",
      marks: 1,
      prompt: `Convert ${value} km² to m².`,
      answer: `${value * 1000000} m²`,
      working: [`1 km² = 1 000 000 m²`, `${value} km² = ${value * 1000000} m².`],
      space: SPACE_SIZES.SMALL
    });
  }

  const value = choice([10000, 20000, 30000, 50000, 75000, 100000]);
  return areaQuestion({
    type: "convert-area-units",
    marks: 1,
    prompt: `Convert ${value} m² to ha.`,
    answer: `${value / 10000} ha`,
    working: [`1 ha = 10 000 m²`, `${value} m² = ${value / 10000} ha.`],
    space: SPACE_SIZES.SMALL
  });
}

// ── Find area by counting squares on a grid (10E) ────────

function gridCountAreaQuestion() {
  const cols = randInt(3, 9);
  const rows = randInt(2, 6);
  const area = cols * rows;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "grid-count-area",
    marks: 1,
    prompt: `Each square on the grid is 1 cm². Find the area of the shaded rectangle.`,
    diagram: areaDiagram("grid-count", { cols, rows }),
    answer: `${area} cm²`,
    working: [
      `Count the squares: ${cols} columns × ${rows} rows.`,
      `Area = ${cols} × ${rows} = ${area} cm².`
    ],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["area", "grid", "counting squares", "diagram"]
  });
}

function areaFindDimensionQuestion() {
  const variant = choice(["rectangle", "triangle", "parallelogram"]);
  const unit = choice(["cm", "m"]);

  if (variant === "rectangle") {
    const w = randInt(3, 12);
    const known = randInt(4, 15);
    const area = w * known;
    return areaQuestion({
      type: "area-find-dimension",
      marks: 2,
      prompt: `A rectangle has an area of ${areaLabel(area, unit)} and a length of ${unitLabel(known, unit)}. Find its width.`,
      diagram: areaDiagram("rectangle", { lengthLabel: unitLabel(known, unit), widthLabel: "w" }),
      answer: unitLabel(w, unit),
      working: [`A = l × w`, `${area} = ${known} × w`, `w = ${area} ÷ ${known} = ${unitLabel(w, unit)}`],
      space: SPACE_SIZES.MEDIUM
    });
  }

  if (variant === "parallelogram") {
    const h = randInt(3, 12);
    const base = randInt(4, 15);
    const area = base * h;
    return areaQuestion({
      type: "area-find-dimension",
      marks: 2,
      prompt: `A parallelogram has an area of ${areaLabel(area, unit)} and a base of ${unitLabel(base, unit)}. Find its perpendicular height.`,
      answer: unitLabel(h, unit),
      working: [`A = b × h`, `${area} = ${base} × h`, `h = ${area} ÷ ${base} = ${unitLabel(h, unit)}`],
      space: SPACE_SIZES.MEDIUM
    });
  }

  const h = randInt(3, 12) * 2; // even so half is whole
  const base = randInt(4, 14);
  const area = base * h / 2;
  return areaQuestion({
    type: "area-find-dimension",
    marks: 2,
    prompt: `A triangle has an area of ${areaLabel(area, unit)} and a base of ${unitLabel(base, unit)}. Find its perpendicular height.`,
    answer: unitLabel(h, unit),
    working: [`A = ½ × b × h`, `${area} = ½ × ${base} × h`, `h = (2 × ${area}) ÷ ${base} = ${unitLabel(h, unit)}`],
    space: SPACE_SIZES.MEDIUM
  });
}

function annulusAreaQuestion() {
  const inner = randInt(2, 6);
  const outer = inner + randInt(1, 4);
  const unit = choice(["m", "cm"]);
  const exact = exactMode();
  const coeff = outer * outer - inner * inner;
  const decimalVal = approx(Math.PI * coeff, 1);

  return areaQuestion({
    type: "annulus-area",
    marks: 3,
    prompt: `A circular garden path forms a ring. The outer radius is ${unitLabel(outer, unit)} and the inner radius is ${unitLabel(inner, unit)}. Find the area of the path (shaded). ${promptSuffix(exact)}`,
    diagram: areaDiagram("curved-composite", { shape: "annulus", outerLabel: unitLabel(outer, unit), innerLabel: unitLabel(inner, unit) }),
    answer: exact ? piAreaTerm(coeff, unit) : `${decimalVal} ${squareUnit(unit)}`,
    working: [
      `Area = πR² − πr² = π(R² − r²)`,
      `= π(${outer}² − ${inner}²) = π(${outer * outer} − ${inner * inner}) = ${coeff}π ${squareUnit(unit)}`,
      exact ? `= ${piAreaTerm(coeff, unit)}` : `≈ ${decimalVal} ${squareUnit(unit)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function areaCoverageQuestion() {
  const l = randInt(4, 12);
  const w = randInt(3, 10);
  const area = l * w;
  const coverage = choice([4, 5, 8, 10]);
  const litres = Math.ceil(area / coverage);
  const cost = choice([12, 15, 18]);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "area-coverage",
    marks: 3,
    prompt: `A wall is ${l} m long and ${w} m high.`,
    diagram: areaDiagram("rectangle", { lengthLabel: `${l} m`, widthLabel: `${w} m` }),
    subparts: [
      { label: "(a)", prompt: `Find the area of the wall.`, marks: 1, answer: `${area} m²`, working: [`A = ${l} × ${w} = ${area} m².`] },
      { label: "(b)", prompt: `One litre of paint covers ${coverage} m². How many litres are needed (whole litres)?`, marks: 1, answer: `${litres} litres`, working: [`${area} ÷ ${coverage} = ${approx(area / coverage, 2)}, round up to ${litres} litres.`] },
      { label: "(c)", prompt: `Paint costs $${cost} per litre. Find the total cost.`, marks: 1, answer: `$${litres * cost}`, working: [`${litres} × $${cost} = $${litres * cost}.`] }
    ],
    answer: `(a) ${area} m²; (b) ${litres} litres; (c) $${litres * cost}`,
    working: [],
    space: SPACE_SIZES.NONE,
    mcEligible: false,
    tags: ["area", "real-world", "multi-part", "coverage"]
  });
}

function errorSpotAreaQuestion() {
  const scenarios = [
    () => { const b = randInt(4, 12), h = randInt(3, 9); return { wrong: `Area of a triangle with base ${b} and height ${h} = ${b * h} cm²`, issue: "the area of a triangle is ½ × b × h", correct: `${b * h / 2} cm²` }; },
    () => { const s = randInt(3, 9); return { wrong: `Area of a square with side ${s} cm = ${4 * s} cm²`, issue: "that is the perimeter; area = side × side", correct: `${s * s} cm²` }; },
    () => { const l = randInt(4, 10), w = randInt(2, 8); return { wrong: `Area of a ${l} cm by ${w} cm rectangle = ${2 * (l + w)} cm²`, issue: "that is the perimeter; area = length × width", correct: `${l * w} cm²` }; }
  ];
  const s = choice(scenarios)();
  const correctNum = parseFloat(s.correct);
  const distractors = shuffle([s.correct, parseFloat(s.wrong.match(/=\s*([\d.]+)/)[1]) + " cm²", (correctNum * 2) + " cm²", (correctNum + 4) + " cm²"])
    .filter((d, i, arr) => arr.indexOf(d) === i).slice(0, 4);
  if (!distractors.includes(s.correct)) distractors[0] = s.correct;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "error-spot-area",
    kind: QUESTION_KINDS.MULTIPLE_CHOICE,
    marks: 1,
    prompt: `A student wrote:  ${s.wrong}\nThis is incorrect. What is the correct answer?`,
    choices: shuffle(distractors),
    answer: s.correct,
    working: [`The error: ${s.issue}.`, `Correct answer: ${s.correct}.`],
    space: SPACE_SIZES.NONE,
    tags: ["area", "reasoning", "error analysis"]
  });
}

function trueFalseAreaQuestion() {
  const items = [
    { stmt: "The area of a rectangle is length × width.", val: true, reason: "A = l × w." },
    { stmt: "The area of a triangle is base × height.", val: false, reason: "It is ½ × base × height." },
    { stmt: "1 m² = 100 cm².", val: false, reason: "1 m² = 10 000 cm² (100 × 100)." },
    { stmt: "A parallelogram with base b and perpendicular height h has area bh.", val: true, reason: "A = b × h." },
    { stmt: "Doubling the side length of a square doubles its area.", val: false, reason: "It multiplies the area by 4." }
  ];
  const it = choice(items);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "true-false-area",
    marks: 1,
    prompt: `True or false? ${it.stmt}  (Give a reason.)`,
    answer: it.val ? "True" : "False",
    working: [it.reason],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["area", "reasoning", "true false"]
  });
}

function multiPartAreaQuestion() {
  const l = randInt(6, 14);
  const w = randInt(4, 10);
  const area = l * w;
  const tileSide = choice([1, 2]);
  const tileArea = tileSide * tileSide;
  const tiles = Math.ceil(area / tileArea);
  const costPer = choice([3, 4, 5]);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "multi-part-area",
    marks: 3,
    prompt: `A rectangular courtyard is ${l} m long and ${w} m wide.`,
    diagram: areaDiagram("rectangle", { lengthLabel: `${l} m`, widthLabel: `${w} m` }),
    subparts: [
      { label: "(a)", prompt: `Find the area of the courtyard.`, marks: 1, answer: `${area} m²`, working: [`A = ${l} × ${w} = ${area} m².`] },
      { label: "(b)", prompt: `Paving tiles are ${tileSide} m by ${tileSide} m. How many tiles are needed to cover the courtyard?`, marks: 1, answer: `${tiles} tiles`, working: [`Each tile covers ${tileArea} m².`, `${area} ÷ ${tileArea} = ${tiles} tiles.`] },
      { label: "(c)", prompt: `Each tile costs $${costPer}. Find the total cost of the tiles.`, marks: 1, answer: `$${tiles * costPer}`, working: [`${tiles} × $${costPer} = $${tiles * costPer}.`] }
    ],
    answer: `(a) ${area} m²; (b) ${tiles} tiles; (c) $${tiles * costPer}`,
    working: [],
    space: SPACE_SIZES.NONE,
    mcEligible: false,
    tags: ["area", "multi-part", "real-world"]
  });
}

const GENERATORS = {
  "area-rectangles": areaRectanglesQuestion,
  "area-triangles": areaTrianglesQuestion,
  "area-parallelograms": areaParallelogramsQuestion,
  "composite-rectangles-triangles": compositeRectanglesTrianglesQuestion,
  "area-worded-problems": areaWordedProblemsQuestion,
  "area-circles-radius": areaCirclesRadiusQuestion,
  "area-circles-diameter": areaCirclesDiameterQuestion,
  "area-sectors": areaSectorsQuestion,
  "area-semicircles": areaSemicirclesQuestion,
  "area-quadrants": areaQuadrantsQuestion,
  "curved-composite-area": curvedCompositeAreaQuestion,
  "area-trapeziums": areaTrapeziumsQuestion,
  "area-rhombuses": areaRhombusesQuestion,
  "area-kites": areaKitesQuestion,
  "advanced-composite-area": advancedCompositeAreaQuestion,
  "choose-area-units": chooseAreaUnitsQuestion,
  "convert-area-units": convertAreaUnitsQuestion,
  "grid-count-area": gridCountAreaQuestion,
  "area-find-dimension": areaFindDimensionQuestion,
  "annulus-area": annulusAreaQuestion,
  "area-coverage": areaCoverageQuestion,
  "error-spot-area": errorSpotAreaQuestion,
  "true-false-area": trueFalseAreaQuestion,
  "multi-part-area": multiPartAreaQuestion
};

export function getAreaQuestionTypes() {
  return TYPE_LIST.slice();
}

export function generateAreaQuestions({
  count = 8,
  allowedTypes = null
} = {}) {
  const typeIds = Array.isArray(allowedTypes)
    ? allowedTypes.filter(id => GENERATORS[id])
    : TYPE_LIST.map(t => t.id);

  if (!typeIds.length) return [];

  const plan = makeBalancedPlan(typeIds, count);

  return plan.map(type => GENERATORS[type]()).map(attachQuestionTranslations);
}
