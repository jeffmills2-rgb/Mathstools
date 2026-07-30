/*
  MMT Exam Builder — Stage 5 Volume A Question Bank
  -------------------------------------------------
  Save as:

  question-banks/stage-5/volume-a/index.js

  Requires:
  - engines/volume/volume-engine.js
*/

import {
  createQuestion,
  SPACE_SIZES
} from "../../../schemas/question.schema.js";

import {
  attachQuestionTranslations
} from "../../../utils/translation.js";

const TOPIC = "Volume A";

const TYPE_LIST = [
  { id: "rectangular-prisms", label: "Cubes and rectangular prisms" },
  { id: "uniform-cross-section", label: "Uniform cross-section prisms" },
  { id: "triangular-prisms", label: "Triangular prisms" },
  { id: "quadrilateral-prisms", label: "Quadrilateral prisms" },
  { id: "composite-prisms", label: "Composite prisms" },
  { id: "cylinders", label: "Cylinders" },
  { id: "part-circle-prisms", label: "Part-circle prisms" },
  { id: "composite-cylinders", label: "Composite cylinders" },
  { id: "composite-prisms-cylinders", label: "Composite prisms and cylinders" },
  { id: "practical-capacity", label: "Worded volume and capacity problems" }
];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function choice(items) {
  return items[randInt(0, items.length - 1)];
}

function cycleChoice(items, variantIndex = null) {
  const index = Number(variantIndex);
  if (Number.isFinite(index)) return items[Math.abs(index) % items.length];
  return choice(items);
}

function shuffle(items) {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function randomId(prefix = "volume-a") {
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

function fmt(value, dp = 1) {
  const rounded = Number(value.toFixed(dp));
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(dp);
}

function cubicUnit(unit) {
  return `${unit}³`;
}

function piAnswer(coefficient, unit) {
  return `${fmt(coefficient, 1)}π ${cubicUnit(unit)}`.replace(/\.0π/, "π");
}

function volumeQuestion({
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
    tags: ["stage-5", "volume", "volume-a", type, ...tags]
  });
}

function volumeDiagram(diagramType, config = {}) {
  return {
    engine: "volume-engine",
    config: {
      diagramType,
      ...config
    }
  };
}

function rectangularPrismQuestion() {
  const unit = choice(["cm", "m", "mm"]);
  const isCube = Math.random() < 0.22;
  const a = randInt(3, unit === "mm" ? 12 : 10);
  const length = isCube ? a : randInt(5, 14);
  const width = isCube ? a : randInt(3, 10);
  const height = isCube ? a : randInt(3, 12);
  const volume = length * width * height;

  return volumeQuestion({
    type: "rectangular-prisms",
    marks: isCube ? 1 : 2,
    prompt: isCube ? "Find the volume of the cube." : "Find the volume of the rectangular prism.",
    answer: `${volume} ${cubicUnit(unit)}`,
    working: isCube
      ? [`V = s³`, `V = ${a}³`, `V = ${volume} ${cubicUnit(unit)}`]
      : [`V = l × w × h`, `V = ${length} × ${width} × ${height}`, `V = ${volume} ${cubicUnit(unit)}`],
    diagram: volumeDiagram("rectangular-prism", {
      length,
      width,
      height,
      unit,
      label: "",
      isCube
    }),
    space: isCube ? SPACE_SIZES.SMALL : SPACE_SIZES.MEDIUM
  });
}

function uniformCrossSectionQuestion({ variantIndex = null } = {}) {
  const unit = choice(["cm", "m"]);
  const crossArea = choice([12, 18, 24, 30, 36, 42, 48, 60]);
  const length = randInt(5, 16);
  const volume = crossArea * length;
  const shape = cycleChoice(["rectangle", "trapezium", "triangle", "pentagon"], variantIndex);

  return volumeQuestion({
    type: "uniform-cross-section",
    marks: 2,
    prompt: `The front cross-section of this right prism has area ${crossArea} ${unit}². The prism is ${length} ${unit} long. Find its volume.`,
    answer: `${volume} ${cubicUnit(unit)}`,
    working: [
      `Volume = area of cross-section × length`,
      `V = ${crossArea} × ${length}`,
      `V = ${volume} ${cubicUnit(unit)}`
    ],
    diagram: volumeDiagram("uniform-cross-section", { shape, crossArea, length, unit }),
    space: SPACE_SIZES.MEDIUM
  });
}

function triangularPrismQuestion() {
  const unit = choice(["cm", "m"]);
  const base = randInt(5, 14);
  const height = randInt(4, 12);
  const length = randInt(6, 18);
  const area = base * height / 2;
  const volume = area * length;

  return volumeQuestion({
    type: "triangular-prisms",
    marks: 3,
    prompt: "Find the volume of the triangular prism.",
    answer: `${fmt(volume)} ${cubicUnit(unit)}`,
    working: [
      `Area of triangular cross-section = 1/2 × base × height`,
      `Area = 1/2 × ${base} × ${height} = ${fmt(area)} ${unit}²`,
      `Volume = ${fmt(area)} × ${length}`,
      `Volume = ${fmt(volume)} ${cubicUnit(unit)}`
    ],
    diagram: volumeDiagram("triangular-prism", { base, height, length, unit }),
    space: SPACE_SIZES.MEDIUM
  });
}

function quadrilateralPrismQuestion({ variantIndex = null } = {}) {
  const unit = choice(["cm", "m"]);
  const kind = cycleChoice(["trapezium", "parallelogram", "rhombus"], variantIndex);
  let prompt = "Find the volume of the prism.";
  let answer;
  let working;
  let config;

  if (kind === "trapezium") {
    const top = randInt(4, 10);
    const bottom = top + randInt(4, 10);
    const height = randInt(4, 9);
    const length = randInt(6, 16);
    const area = (top + bottom) * height / 2;
    const volume = area * length;
    answer = `${fmt(volume)} ${cubicUnit(unit)}`;
    working = [
      `Area of trapezium = 1/2 × (${top} + ${bottom}) × ${height}`,
      `Area = ${fmt(area)} ${unit}²`,
      `Volume = ${fmt(area)} × ${length}`,
      `Volume = ${fmt(volume)} ${cubicUnit(unit)}`
    ];
    config = { kind, top, bottom, height, length, unit };
  } else if (kind === "parallelogram") {
    const base = randInt(7, 16);
    const height = randInt(4, 10);
    const length = randInt(5, 14);
    const area = base * height;
    const volume = area * length;
    answer = `${volume} ${cubicUnit(unit)}`;
    working = [
      `Area of parallelogram = base × perpendicular height`,
      `Area = ${base} × ${height} = ${area} ${unit}²`,
      `Volume = ${area} × ${length}`,
      `Volume = ${volume} ${cubicUnit(unit)}`
    ];
    config = { kind, base, height, length, unit };
  } else {
    const d1 = randInt(8, 18);
    const d2 = randInt(6, 16);
    const length = randInt(5, 14);
    const area = d1 * d2 / 2;
    const volume = area * length;
    answer = `${fmt(volume)} ${cubicUnit(unit)}`;
    working = [
      `Area of rhombus/kite = 1/2 × d₁ × d₂`,
      `Area = 1/2 × ${d1} × ${d2} = ${fmt(area)} ${unit}²`,
      `Volume = ${fmt(area)} × ${length}`,
      `Volume = ${fmt(volume)} ${cubicUnit(unit)}`
    ];
    config = { kind, d1, d2, length, unit };
  }

  return volumeQuestion({
    type: "quadrilateral-prisms",
    marks: 3,
    prompt,
    answer,
    working,
    diagram: volumeDiagram("quadrilateral-prism", config),
    space: SPACE_SIZES.MEDIUM
  });
}

function compositePrismQuestion({ variantIndex = null } = {}) {
  const unit = choice(["cm", "m"]);
  const kind = cycleChoice(["l-block", "stepped-block", "notched-block", "t-block"], variantIndex);
  let config;
  let volume;
  let working;

  if (kind === "l-block") {
    const length = randInt(8, 16);
    const width = randInt(4, 8);
    const heightA = randInt(3, 7);
    const heightB = heightA + randInt(2, 6);
    const split = randInt(3, length - 3);
    volume = split * width * heightB + (length - split) * width * heightA;
    working = [
      `Split the solid into two rectangular prisms.`,
      `V₁ = ${split} × ${width} × ${heightB}`,
      `V₂ = ${length - split} × ${width} × ${heightA}`,
      `Total volume = ${volume} ${cubicUnit(unit)}`
    ];
    config = { kind, length, width, heightA, heightB, split, unit };
  } else if (kind === "stepped-block") {
    const depth = randInt(3, 7);
    const lowerLength = randInt(7, 14);
    const upperLength = randInt(4, lowerLength - 1);
    const lowerHeight = randInt(3, 7);
    const upperHeight = randInt(2, 6);
    volume = lowerLength * depth * lowerHeight + upperLength * depth * upperHeight;
    working = [
      `Split the stepped solid into two rectangular prisms.`,
      `Bottom prism = ${lowerLength} × ${depth} × ${lowerHeight}`,
      `Top prism = ${upperLength} × ${depth} × ${upperHeight}`,
      `Total volume = ${volume} ${cubicUnit(unit)}`
    ];
    config = { kind, depth, lowerLength, upperLength, lowerHeight, upperHeight, unit };
  } else if (kind === "t-block") {
    const topLength = randInt(12, 20);
    const topWidth = randInt(3, 6);
    const stemLength = randInt(6, 12);
    const stemWidth = randInt(3, 5);
    const depth = randInt(3, 7);
    volume = topLength * topWidth * depth + stemLength * stemWidth * depth;
    working = [
      `Split the T-shape into two rectangular prisms.`,
      `Top prism = ${topLength} × ${topWidth} × ${depth}`,
      `Stem prism = ${stemLength} × ${stemWidth} × ${depth}`,
      `Total volume = ${volume} ${cubicUnit(unit)}`
    ];
    config = { kind, topLength, topWidth, stemLength, stemWidth, depth, unit };
  } else {
    const length = randInt(10, 18);
    const width = randInt(5, 9);
    const height = randInt(6, 12);
    const cutLength = randInt(3, 6);
    const cutHeight = randInt(2, 5);
    volume = length * width * height - cutLength * width * cutHeight;
    working = [
      `Find the volume of the outside rectangular prism, then subtract the missing prism.`,
      `Outside = ${length} × ${width} × ${height}`,
      `Missing = ${cutLength} × ${width} × ${cutHeight}`,
      `Total volume = ${volume} ${cubicUnit(unit)}`
    ];
    config = { kind, length, width, height, cutLength, cutHeight, unit };
  }

  return volumeQuestion({
    type: "composite-prisms",
    marks: 3,
    prompt: "Find the volume of the composite solid.",
    answer: `${volume} ${cubicUnit(unit)}`,
    working,
    diagram: volumeDiagram("composite-prism", config),
    space: SPACE_SIZES.MEDIUM
  });
}

function cylinderQuestion({ variantIndex = null } = {}) {
  const unit = choice(["cm", "mm", "m"]);
  const radius = randInt(2, 9);
  const height = randInt(6, 20);
  const useDiameter = Math.random() < 0.35;
  const exact = Math.random() < 0.45;
  const coefficient = radius * radius * height;
  const answer = exact
    ? piAnswer(coefficient, unit)
    : `${fmt(Math.PI * coefficient, 1)} ${cubicUnit(unit)}`;

  return volumeQuestion({
    type: "cylinders",
    marks: 2,
    prompt: exact
      ? "Find the volume of the cylinder. Give your answer in terms of π."
      : "Find the volume of the cylinder. Give your answer correct to 1 decimal place.",
    answer,
    working: [
      `V = πr²h`,
      useDiameter ? `r = ${2 * radius} ÷ 2 = ${radius} ${unit}` : `r = ${radius} ${unit}`,
      `V = π × ${radius}² × ${height}`,
      `V = ${answer}`
    ],
    diagram: volumeDiagram("cylinder", {
      radius,
      diameter: useDiameter ? 2 * radius : null,
      height,
      unit,
      orientation: cycleChoice(["vertical", "horizontal", "slanted"], variantIndex)
    }),
    space: SPACE_SIZES.MEDIUM
  });
}

function partCirclePrismQuestion({ variantIndex = null } = {}) {
  const unit = choice(["cm", "m"]);
  const kind = cycleChoice(["semicircle", "quadrant", "sector"], variantIndex);
  const radius = randInt(3, 10);
  const length = randInt(5, 18);
  const angle = kind === "sector" ? choice([60, 90, 120, 150]) : kind === "semicircle" ? 180 : 90;
  const fraction = angle / 360;
  const coefficient = fraction * radius * radius * length;
  const exact = Math.random() < 0.55;
  const answer = exact
    ? piAnswer(coefficient, unit)
    : `${fmt(Math.PI * coefficient, 1)} ${cubicUnit(unit)}`;

  return volumeQuestion({
    type: "part-circle-prisms",
    marks: 3,
    prompt: exact
      ? "Find the volume of the solid. Give your answer in terms of π."
      : "Find the volume of the solid. Give your answer correct to 1 decimal place.",
    answer,
    working: [
      `Area of cross-section = ${angle}/360 × πr²`,
      `Area = ${angle}/360 × π × ${radius}²`,
      `Volume = area of cross-section × length`,
      `Volume = ${answer}`
    ],
    diagram: volumeDiagram("part-circle-prism", { kind, radius, angle, length, unit }),
    space: SPACE_SIZES.MEDIUM
  });
}

function compositeCylinderQuestion({ variantIndex = null } = {}) {
  const unit = choice(["cm", "mm"]);
  const kind = cycleChoice(["stacked", "coaxial"], variantIndex);
  const r1 = randInt(3, 8);
  const h1 = randInt(5, 14);
  // Keep the attached/secondary cylinder smaller than the main cylinder.
  // Earlier side-by-side variants could accidentally produce a "smaller"
  // attached cylinder with a larger diameter than the main cylinder, which made
  // the diagram read incorrectly and created impossible-looking questions.
  const r2 = Math.max(1, r1 - randInt(1, Math.min(3, r1 - 1)));
  const h2 = randInt(4, 12);
  const coefficient = r1 * r1 * h1 + r2 * r2 * h2;
  const answer = piAnswer(coefficient, unit);

  return volumeQuestion({
    type: "composite-cylinders",
    marks: 3,
    prompt: "Find the volume of the composite solid. Give your answer in terms of π.",
    answer,
    working: [
      `Find the volume of each cylinder and add.`,
      `V₁ = π × ${r1}² × ${h1} = ${r1 * r1 * h1}π`,
      `V₂ = π × ${r2}² × ${h2} = ${r2 * r2 * h2}π`,
      `Total volume = ${answer}`
    ],
    diagram: volumeDiagram("composite-cylinder", { kind, r1, h1, r2, h2, unit }),
    space: SPACE_SIZES.MEDIUM
  });
}

function compositePrismsCylindersQuestion({ variantIndex = null } = {}) {
  const unit = choice(["cm", "m"]);
  const kind = cycleChoice(["half-cylinder-on-prism", "cylinder-on-box", "tank-on-stand"], variantIndex);
  const length = randInt(8, 18);
  let width = randInt(4, 9);
  const height = randInt(3, 8);
  const radius = randInt(2, 5);
  let cylLength = randInt(6, 16);

  // For a half-cylinder sitting on a rectangular prism, keep the diagram
  // geometrically coherent: the roof runs along the prism length and its
  // diameter matches the prism width.
  if (kind === "half-cylinder-on-prism") {
    width = radius * 2;
    cylLength = length;
  }

  let coefficient;
  let rectangularVolume;
  let answer;
  let working;

  if (kind === "half-cylinder-on-prism") {
    rectangularVolume = length * width * height;
    coefficient = 0.5 * radius * radius * cylLength;
    answer = `${rectangularVolume} + ${fmt(coefficient, 1)}π ${cubicUnit(unit)}`.replace(".0π", "π");
    working = [
      `Rectangular prism volume = ${length} × ${width} × ${height} = ${rectangularVolume}`,
      `Half-cylinder volume = 1/2 × π × ${radius}² × ${cylLength} = ${fmt(coefficient, 1)}π`,
      `Total volume = ${answer}`
    ];
  } else {
    rectangularVolume = length * width * height;
    coefficient = radius * radius * cylLength;
    answer = `${rectangularVolume} + ${coefficient}π ${cubicUnit(unit)}`;
    working = [
      `Rectangular prism volume = ${length} × ${width} × ${height} = ${rectangularVolume}`,
      `Cylinder volume = π × ${radius}² × ${cylLength} = ${coefficient}π`,
      `Total volume = ${answer}`
    ];
  }

  return volumeQuestion({
    type: "composite-prisms-cylinders",
    marks: 3,
    prompt: "Find the volume of the composite solid. Give your answer in terms of π where needed.",
    answer,
    working,
    diagram: volumeDiagram("prism-cylinder-composite", { kind, length, width, height, radius, cylLength, unit }),
    space: SPACE_SIZES.MEDIUM
  });
}

function practicalCapacityQuestion({ variantIndex = null } = {}) {
  const template = cycleChoice(["fish-tank", "pool-path", "rainwater", "concrete", "container"], variantIndex);

  if (template === "fish-tank") {
    const length = randInt(60, 120);
    const width = randInt(25, 50);
    const height = randInt(25, 60);
    const litres = length * width * height / 1000;
    return volumeQuestion({
      type: "practical-capacity",
      marks: 3,
      prompt: `A rectangular fish tank is ${length} cm long, ${width} cm wide and ${height} cm high. How many litres of water can it hold?`,
      answer: `${fmt(litres, 1)} L`,
      working: [
        `Volume = ${length} × ${width} × ${height} = ${length * width * height} cm³`,
        `1000 cm³ = 1 L`,
        `Capacity = ${fmt(litres, 1)} L`
      ],
      diagram: volumeDiagram("capacity-tank", { length, width, height, unit: "cm", context: "fish tank" }),
      space: SPACE_SIZES.MEDIUM
    });
  }

  if (template === "rainwater") {
    const radius = randInt(3, 8) / 10;
    const height = randInt(12, 24) / 10;
    const volumeM3 = Math.PI * radius * radius * height;
    const litres = volumeM3 * 1000;
    return volumeQuestion({
      type: "practical-capacity",
      marks: 3,
      prompt: `A cylindrical rainwater tank has radius ${fmt(radius, 1)} m and height ${fmt(height, 1)} m. Find its capacity in litres, correct to the nearest litre.`,
      answer: `${Math.round(litres)} L`,
      working: [
        `V = πr²h`,
        `V = π × ${fmt(radius, 1)}² × ${fmt(height, 1)} = ${fmt(volumeM3, 3)} m³`,
        `1 m³ = 1000 L`,
        `Capacity = ${Math.round(litres)} L`
      ],
      diagram: volumeDiagram("cylinder", { radius: fmt(radius, 1), height: fmt(height, 1), unit: "m", orientation: "vertical" }),
      space: SPACE_SIZES.MEDIUM
    });
  }

  if (template === "concrete") {
    const length = randInt(8, 20);
    const width = randInt(2, 5);
    const depthCm = choice([10, 12, 15, 20]);
    const volume = length * width * (depthCm / 100);
    return volumeQuestion({
      type: "practical-capacity",
      marks: 3,
      prompt: `A concrete slab is ${length} m long, ${width} m wide and ${depthCm} cm deep. Find the volume of concrete needed in cubic metres.`,
      answer: `${fmt(volume, 2)} m³`,
      working: [
        `${depthCm} cm = ${fmt(depthCm / 100, 2)} m`,
        `Volume = ${length} × ${width} × ${fmt(depthCm / 100, 2)}`,
        `Volume = ${fmt(volume, 2)} m³`
      ],
      diagram: volumeDiagram("capacity-tank", { length, width, height: fmt(depthCm / 100, 2), unit: "m", context: "slab" }),
      space: SPACE_SIZES.MEDIUM
    });
  }

  if (template === "pool-path") {
    const outerL = randInt(10, 18);
    const outerW = randInt(6, 12);
    const innerL = outerL - randInt(2, 4);
    const innerW = outerW - randInt(2, 4);
    const depth = choice([0.2, 0.25, 0.3, 0.4]);
    const volume = (outerL * outerW - innerL * innerW) * depth;
    return volumeQuestion({
      type: "practical-capacity",
      marks: 3,
      prompt: `A path around a rectangular pool has outside dimensions ${outerL} m by ${outerW} m and inside dimensions ${innerL} m by ${innerW} m. The path is ${depth} m deep. Find the volume of concrete needed.`,
      answer: `${fmt(volume, 2)} m³`,
      working: [
        `Area of path = ${outerL} × ${outerW} − ${innerL} × ${innerW}`,
        `Area = ${outerL * outerW - innerL * innerW} m²`,
        `Volume = ${outerL * outerW - innerL * innerW} × ${depth} = ${fmt(volume, 2)} m³`
      ],
      diagram: volumeDiagram("pool-path", { outerL, outerW, innerL, innerW, depth, unit: "m" }),
      space: SPACE_SIZES.MEDIUM
    });
  }

  const length = randInt(5, 12);
  const width = randInt(4, 9);
  const height = randInt(3, 8);
  const capacity = length * width * height * 1000;
  return volumeQuestion({
    type: "practical-capacity",
    marks: 3,
    prompt: `A rectangular container is ${length} m long, ${width} m wide and ${height} m deep. Find its capacity in litres.`,
    answer: `${capacity} L`,
    working: [
      `Volume = ${length} × ${width} × ${height} = ${length * width * height} m³`,
      `1 m³ = 1000 L`,
      `Capacity = ${capacity} L`
    ],
    diagram: volumeDiagram("capacity-tank", { length, width, height, unit: "m", context: "container" }),
    space: SPACE_SIZES.MEDIUM
  });
}

const GENERATORS = {
  "rectangular-prisms": rectangularPrismQuestion,
  "uniform-cross-section": uniformCrossSectionQuestion,
  "triangular-prisms": triangularPrismQuestion,
  "quadrilateral-prisms": quadrilateralPrismQuestion,
  "composite-prisms": compositePrismQuestion,
  "cylinders": cylinderQuestion,
  "part-circle-prisms": partCirclePrismQuestion,
  "composite-cylinders": compositeCylinderQuestion,
  "composite-prisms-cylinders": compositePrismsCylindersQuestion,
  "practical-capacity": practicalCapacityQuestion
};

export function getVolumeAQuestionTypes() {
  return TYPE_LIST;
}

export function generateVolumeAQuestions({
  count = 8,
  allowedTypes = null
} = {}) {
  const allowed = Array.isArray(allowedTypes) && allowedTypes.length
    ? allowedTypes.filter(type => GENERATORS[type])
    : TYPE_LIST.map(type => type.id);

  const plan = makeBalancedPlan(allowed, count);
  const questions = [];
  const seenByType = {};
  let safety = 0;

  while (questions.length < count && safety < count * 40) {
    const type = plan[questions.length % plan.length];
    const generator = GENERATORS[type];
    if (generator) {
      const variantIndex = seenByType[type] || 0;
      seenByType[type] = variantIndex + 1;
      questions.push(generator({ variantIndex }));
    }
    safety += 1;
  }

  return questions.map(attachQuestionTranslations);
}
