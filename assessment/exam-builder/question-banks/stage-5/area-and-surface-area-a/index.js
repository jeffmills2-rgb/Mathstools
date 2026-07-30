/*
  MMT Exam Builder — Stage 5 Area and Surface Area A Question Bank
  -----------------------------------------------------------------
  Save as:

  question-banks/stage-5/area-and-surface-area-a/index.js

  Diagram engine:
  - engines/area-surface/area-surface-engine.js
*/

import {
  createQuestion,
  SPACE_SIZES
} from "../../../schemas/question.schema.js";

const TOPIC = "Area and Surface Area A";

const TYPE_LIST = [
  { id: "rectilinear-composite-area", label: "Rectilinear composite areas" },
  { id: "shaded-area", label: "Shaded area problems" },
  { id: "composite-area-circles", label: "Composite areas involving circles and semicircles" },
  { id: "practical-area-applications", label: "Practical area applications" },
  { id: "identify-prism-faces", label: "Identify faces and edge lengths of prisms" },
  { id: "rectangular-prism-surface-area", label: "Surface area of rectangular prisms and cubes" },
  { id: "triangular-prism-surface-area", label: "Surface area of triangular prisms" },
  { id: "trapezoidal-prism-surface-area", label: "Surface area of trapezoidal prisms" },
  { id: "composite-prism-surface-area", label: "Surface area of composite prisms" },
  { id: "recognise-valid-nets", label: "Recognise valid nets of right prisms" },
  { id: "surface-area-from-net", label: "Find surface area from a net" },
  { id: "curved-surface-area-cylinder", label: "Curved surface area of cylinders" },
  { id: "closed-cylinder-surface-area", label: "Total surface area of closed cylinders" },
  { id: "cylinder-net-surface-area", label: "Surface area from a cylinder net" },
  { id: "half-cylinder-surface-area", label: "Surface area of half-cylinders" },
  { id: "composite-cylinder-surface-area", label: "Surface area of composite solids involving cylinders" },
  { id: "practical-cylinder-surface-area", label: "Practical cylinder surface area problems" }
];

const UNITS = ["cm", "m"];

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

function randomId(prefix = "area-surface-a") {
  return globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
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

function round(value, dp = 1) {
  return Number(Number(value).toFixed(dp));
}

function fmt(value, dp = 1) {
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  const rounded = round(n, dp);
  if (Math.abs(rounded - Math.round(rounded)) < 1e-9) return String(Math.round(rounded));
  return rounded.toFixed(dp);
}

function addSpaces(value) {
  const [whole, decimal] = String(value).split(".");
  const spaced = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return decimal !== undefined ? `${spaced}.${decimal}` : spaced;
}

function areaUnit(unit) {
  return `${unit}²`;
}

function piRound(value, dp = 1) {
  return round(value, dp);
}

function areaDiagram(config) {
  return { engine: "area-surface-engine", config };
}

function areaSurfaceQuestion({
  type,
  marks = 1,
  prompt,
  answer,
  working = [],
  diagram = null,
  choices = null,
  kind = "short-response",
  space = SPACE_SIZES.MEDIUM,
  tags = [],
  diagramSpace = null
}) {
  const question = createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type,
    kind,
    marks,
    prompt,
    diagram,
    choices,
    answer,
    working,
    space,
    tags: ["stage-5", "area-surface-area", type, ...tags]
  });

  if (diagramSpace) question.diagramSpace = diagramSpace;
  return question;
}

function rectilinearCompositeAreaQuestion() {
  const unit = choice(UNITS);
  const W = choice([22, 24, 26, 28, 30]);
  const H = choice([20, 24, 28, 32]);
  const cutW = choice([8, 10, 12]);
  const cutH = choice([8, 10, 12, 14]);
  const area = W * H - cutW * cutH;

  return areaSurfaceQuestion({
    type: "rectilinear-composite-area",
    marks: 2,
    prompt: "Calculate the area of the composite shape below.",
    diagram: areaDiagram({
      diagramType: "rectilinear-composite",
      top: `${W} ${unit}`,
      right: `${H} ${unit}`,
      bottom: `${W - cutW} ${unit}`,
      left: `${cutH} ${unit}`,
      inner: `${H - cutH} ${unit}`
    }),
    answer: `${addSpaces(area)} ${areaUnit(unit)}`,
    working: [
      `Outer rectangle area = ${W} × ${H} = ${W * H} ${areaUnit(unit)}`,
      `Missing rectangle area = ${cutW} × ${cutH} = ${cutW * cutH} ${areaUnit(unit)}`,
      `Composite area = ${W * H} − ${cutW * cutH} = ${area} ${areaUnit(unit)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function shadedAreaQuestion() {
  const unit = "m";
  const outerW = choice([36, 40, 45, 48]);
  const outerH = choice([18, 20, 24]);
  const holeW = choice([18, 20, 24, 30]);
  const holeH = choice([8, 10, 12]);
  const area = outerW * outerH - holeW * holeH;

  return areaSurfaceQuestion({
    type: "shaded-area",
    marks: 2,
    prompt: "Calculate the shaded area.",
    diagram: areaDiagram({
      diagramType: "shaded-area",
      outerWidth: `${outerW} ${unit}`,
      outerHeight: `${outerH} ${unit}`,
      holeWidth: `${holeW} ${unit}`,
      holeHeight: `${holeH} ${unit}`
    }),
    answer: `${addSpaces(area)} ${areaUnit(unit)}`,
    working: [
      `Outer area = ${outerW} × ${outerH} = ${outerW * outerH} ${areaUnit(unit)}`,
      `Unshaded area = ${holeW} × ${holeH} = ${holeW * holeH} ${areaUnit(unit)}`,
      `Shaded area = ${outerW * outerH} − ${holeW * holeH} = ${area} ${areaUnit(unit)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function compositeAreaCirclesQuestion() {
  const width = choice([2.4, 3.2, 4.8]);
  const rectHeight = choice([5.5, 6.8, 7.2]);
  const radius = width / 2;
  const area = width * rectHeight + 0.5 * Math.PI * radius * radius;

  return areaSurfaceQuestion({
    type: "composite-area-circles",
    marks: 2,
    prompt: "Calculate the area of the window shape below, correct to 1 decimal place.",
    diagram: areaDiagram({
      diagramType: "composite-circle",
      width: `${fmt(width)} m`,
      height: `${fmt(rectHeight)} m`
    }),
    answer: `${fmt(area)} m²`,
    working: [
      `Radius of semicircle = ${fmt(width)} ÷ 2 = ${fmt(radius)} m`,
      `Rectangle area = ${fmt(width)} × ${fmt(rectHeight)} = ${fmt(width * rectHeight)} m²`,
      `Semicircle area = 1/2 × π × ${fmt(radius)}² = ${fmt(0.5 * Math.PI * radius * radius)} m²`,
      `Total area = ${fmt(area)} m²`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function practicalAreaQuestion() {
  const contexts = [
    { item: "patio", job: "tiling", unitCost: 42, material: "tiles", width: 3.8, length: 7.2, labour: 27 },
    { item: "classroom wall", job: "painting", unitCost: 18.5, material: "paint", width: 8.4, length: 3.2, labour: 32 },
    { item: "sports field", job: "fertilising", unitCost: 0.25, material: "fertiliser", width: 68, length: 120, labour: 0 }
  ];
  const c = choice(contexts);
  const area = c.width * c.length;
  const total = area * (c.unitCost + c.labour);
  const costPhrase = c.labour
    ? `${c.material} costs $${fmt(c.unitCost, 2)}/m² and labour costs $${fmt(c.labour, 2)}/m²`
    : `${c.material} is spread at ${fmt(c.unitCost, 2)} kg/m²`;
  const prompt = c.labour
    ? `A rectangular ${c.item} measures ${fmt(c.length)} m by ${fmt(c.width)} m.
Calculate the cost of ${c.job} the ${c.item}, given that ${costPhrase}.`
    : `A rectangular ${c.item} measures ${fmt(c.length)} m by ${fmt(c.width)} m.
Calculate how much ${c.material} is needed if it is spread at ${fmt(c.unitCost, 2)} kg/m².`;

  return areaSurfaceQuestion({
    type: "practical-area-applications",
    marks: 2,
    prompt,
    answer: c.labour ? `$${addSpaces(fmt(total, 2))}` : `${fmt(total, 1)} kg`,
    working: c.labour
      ? [
          `Area = ${fmt(c.length)} × ${fmt(c.width)} = ${fmt(area)} m²`,
          `Cost per square metre = $${fmt(c.unitCost, 2)} + $${fmt(c.labour, 2)} = $${fmt(c.unitCost + c.labour, 2)}`,
          `Total cost = ${fmt(area)} × $${fmt(c.unitCost + c.labour, 2)} = $${addSpaces(fmt(total, 2))}`
        ]
      : [
          `Area = ${fmt(c.length)} × ${fmt(c.width)} = ${fmt(area)} m²`,
          `Fertiliser needed = ${fmt(area)} × ${fmt(c.unitCost, 2)} = ${fmt(total, 1)} kg`
        ],
    space: SPACE_SIZES.MEDIUM
  });
}

function identifyPrismFacesQuestion() {
  return areaSurfaceQuestion({
    type: "identify-prism-faces",
    marks: 1,
    prompt: "For the rectangular prism below, identify the number of faces and name the three different edge lengths shown.",
    diagram: areaDiagram({ diagramType: "rectangular-prism", length: "18 cm", width: "12 cm", height: "10 cm" }),
    answer: "6 faces; edge lengths 18 cm, 12 cm and 10 cm",
    working: ["A rectangular prism has 6 rectangular faces.", "The labelled edge lengths are 18 cm, 12 cm and 10 cm."],
    space: SPACE_SIZES.SMALL
  });
}

function rectangularPrismSurfaceAreaQuestion() {
  const unit = choice(UNITS);
  const l = choice([12, 14, 18, 20]);
  const w = choice([6, 8, 10, 12]);
  const h = choice([5, 7, 9, 10]);
  const sa = 2 * (l*w + l*h + w*h);

  return areaSurfaceQuestion({
    type: "rectangular-prism-surface-area",
    marks: 2,
    prompt: "Calculate the surface area of the rectangular prism below.",
    diagram: areaDiagram({ diagramType: "rectangular-prism", length: `${l} ${unit}`, width: `${w} ${unit}`, height: `${h} ${unit}` }),
    answer: `${addSpaces(sa)} ${areaUnit(unit)}`,
    working: [
      `Surface area = 2(lw + lh + wh)`,
      `Surface area = 2(${l} × ${w} + ${l} × ${h} + ${w} × ${h})`,
      `Surface area = ${addSpaces(sa)} ${areaUnit(unit)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function triangularPrismSurfaceAreaQuestion() {
  const unit = "cm";
  const base = choice([6, 8, 10, 12]);
  const height = choice([4, 6, 8]);
  const hyp = Math.sqrt(base*base + height*height);
  const length = choice([12, 15, 18, 20]);
  const sa = 2 * (0.5 * base * height) + length * (base + height + hyp);

  return areaSurfaceQuestion({
    type: "triangular-prism-surface-area",
    marks: 2,
    prompt: "Calculate the surface area of the triangular prism below, correct to 1 decimal place.",
    diagram: areaDiagram({ diagramType: "triangular-prism", base: `${base} ${unit}`, height: `${height} ${unit}`, side: `${fmt(hyp)} ${unit}`, length: `${length} ${unit}` }),
    answer: `${fmt(sa)} ${areaUnit(unit)}`,
    working: [
      `Area of two triangular ends = 2 × 1/2 × ${base} × ${height} = ${base * height} ${areaUnit(unit)}`,
      `Area of rectangular faces = ${length} × (${base} + ${height} + ${fmt(hyp)}) = ${fmt(length * (base + height + hyp))} ${areaUnit(unit)}`,
      `Surface area = ${fmt(sa)} ${areaUnit(unit)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function trapezoidalPrismSurfaceAreaQuestion() {
  const unit = "cm";
  const a = choice([10, 11, 12]);
  const b = choice([16, 18, 20]);
  const h = choice([6, 8]);
  const side = choice([7.2, 7.7, 8.5]);
  const length = choice([14, 16, 18]);
  const endArea = 0.5 * (a + b) * h;
  const perimeter = a + b + 2 * side;
  const sa = 2 * endArea + perimeter * length;

  return areaSurfaceQuestion({
    type: "trapezoidal-prism-surface-area",
    marks: 2,
    prompt: "Calculate the surface area of the trapezoidal prism below, correct to 1 decimal place.",
    diagram: areaDiagram({ diagramType: "trapezoidal-prism", top: `${a} ${unit}`, bottom: `${b} ${unit}`, height: `${h} ${unit}`, side: `${fmt(side)} ${unit}`, length: `${length} ${unit}` }),
    answer: `${fmt(sa)} ${areaUnit(unit)}`,
    working: [
      `Area of one trapezium = 1/2 × (${a} + ${b}) × ${h} = ${fmt(endArea)} ${areaUnit(unit)}`,
      `Area of rectangular faces = ${length} × (${a} + ${b} + ${fmt(side)} + ${fmt(side)}) = ${fmt(perimeter * length)} ${areaUnit(unit)}`,
      `Surface area = ${fmt(sa)} ${areaUnit(unit)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function compositePrismSurfaceAreaQuestion() {
  const unit = "cm";
  const frontArea = 36 * 34 - 28 * 18;
  const perimeter = 36 + 16 + 28 + 18 + 8 + 16 + 16 + 34;
  const depth = 20;
  const sa = 2 * frontArea + perimeter * depth;

  return areaSurfaceQuestion({
    type: "composite-prism-surface-area",
    marks: 3,
    prompt: "Calculate the surface area of the composite prism below.",
    diagram: areaDiagram({ diagramType: "composite-prism", length: "36 cm", height: "34 cm", step: "28 cm", depth: "20 cm" }),
    answer: `${addSpaces(sa)} ${areaUnit(unit)}`,
    working: [
      `Front area = 36 × 34 − 28 × 18 = ${frontArea} ${areaUnit(unit)}`,
      `Perimeter of front face = ${perimeter} ${unit}`,
      `Surface area = 2 × ${frontArea} + ${perimeter} × ${depth}`,
      `Surface area = ${addSpaces(sa)} ${areaUnit(unit)}`
    ],
    space: SPACE_SIZES.LARGE
  });
}

function recogniseValidNetsQuestion() {
  return areaSurfaceQuestion({
    type: "recognise-valid-nets",
    kind: "multiple-choice",
    marks: 1,
    prompt: "Which diagram is a valid net of a rectangular prism?",
    diagram: areaDiagram({ diagramType: "net-comparison" }),
    choices: ["A only", "B only", "Both A and B", "Neither A nor B"],
    answer: "A only",
    working: ["Diagram A has six faces arranged so they can fold to form a rectangular prism.", "Diagram B cannot fold without overlapping faces."],
    space: SPACE_SIZES.NONE
  });
}

function surfaceAreaFromNetQuestion() {
  const l = choice([8, 10, 12]);
  const w = choice([5, 6]);
  const h = choice([3, 4, 5]);
  const sa = 2 * (l*w + l*h + w*h);

  return areaSurfaceQuestion({
    type: "surface-area-from-net",
    marks: 2,
    prompt: "Use the net below to calculate the surface area of the rectangular prism.",
    diagram: areaDiagram({ diagramType: "net", length: `${l} cm`, width: `${w} cm`, height: `${h} cm` }),
    answer: `${sa} cm²`,
    working: [
      `Surface area = 2(lw + lh + wh)`,
      `Surface area = 2(${l} × ${w} + ${l} × ${h} + ${w} × ${h})`,
      `Surface area = ${sa} cm²`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function curvedSurfaceAreaCylinderQuestion() {
  const diameter = choice([8, 10, 12, 14]);
  const height = choice([14, 18, 22, 25]);
  const r = diameter / 2;
  const csa = 2 * Math.PI * r * height;

  return areaSurfaceQuestion({
    type: "curved-surface-area-cylinder",
    marks: 1,
    prompt: "Calculate the curved surface area of the cylinder below, correct to 1 decimal place.",
    diagram: areaDiagram({ diagramType: "cylinder", diameter: `${diameter} cm`, height: `${height} cm` }),
    answer: `${fmt(csa)} cm²`,
    working: [
      `Radius = ${diameter} ÷ 2 = ${r} cm`,
      `Curved surface area = 2πrh`,
      `Curved surface area = 2π × ${r} × ${height} = ${fmt(csa)} cm²`
    ],
    space: SPACE_SIZES.SMALL
  });
}

function closedCylinderSurfaceAreaQuestion() {
  const diameter = choice([8, 10, 12, 16]);
  const height = choice([12, 14, 18, 20]);
  const r = diameter / 2;
  const sa = 2 * Math.PI * r * r + 2 * Math.PI * r * height;

  return areaSurfaceQuestion({
    type: "closed-cylinder-surface-area",
    marks: 2,
    prompt: "Calculate the total surface area of the closed cylinder below, correct to 1 decimal place.",
    diagram: areaDiagram({ diagramType: "cylinder", diameter: `${diameter} cm`, height: `${height} cm` }),
    answer: `${fmt(sa)} cm²`,
    working: [
      `Radius = ${diameter} ÷ 2 = ${r} cm`,
      `Total surface area = 2πr² + 2πrh`,
      `Total surface area = 2π × ${r}² + 2π × ${r} × ${height}`,
      `Total surface area = ${fmt(sa)} cm²`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function cylinderNetSurfaceAreaQuestion() {
  const r = choice([3, 4, 5, 6]);
  const h = choice([8, 10, 12, 15]);
  const sa = 2 * Math.PI * r * r + 2 * Math.PI * r * h;

  return areaSurfaceQuestion({
    type: "cylinder-net-surface-area",
    marks: 2,
    prompt: "The net below forms a closed cylinder. Calculate the total surface area correct to 1 decimal place.",
    diagram: areaDiagram({ diagramType: "cylinder-net", width: `${fmt(2 * Math.PI * r)} cm`, height: `${h} cm` }),
    answer: `${fmt(sa)} cm²`,
    working: [
      `Rectangle width = circumference = ${fmt(2 * Math.PI * r)} cm`,
      `So 2πr = ${fmt(2 * Math.PI * r)}, giving r = ${r} cm`,
      `Curved surface area = 2πrh = 2π × ${r} × ${h} = ${fmt(2 * Math.PI * r * h)} cm²`,
      `Area of two circular bases = 2πr² = 2π × ${r}² = ${fmt(2 * Math.PI * r * r)} cm²`,
      `Total surface area = ${fmt(sa)} cm²`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function halfCylinderSurfaceAreaQuestion() {
  const diameter = choice([12, 18, 20]);
  const r = diameter / 2;
  const length = choice([24, 30, 36]);
  const sa = Math.PI * r * length + 2 * r * length + Math.PI * r * r;

  return areaSurfaceQuestion({
    type: "half-cylinder-surface-area",
    marks: 3,
    prompt: "The solid below is a half-cylinder with both semicircular ends included. Calculate its total surface area correct to 1 decimal place.",
    diagram: areaDiagram({ diagramType: "half-cylinder", diameter: `${diameter} cm`, length: `${length} cm` }),
    answer: `${fmt(sa)} cm²`,
    working: [
      `Radius = ${diameter} ÷ 2 = ${r} cm`,
      `Curved half-cylinder area = πrh = π × ${r} × ${length} = ${fmt(Math.PI * r * length)} cm²`,
      `Rectangular base area = ${diameter} × ${length} = ${diameter * length} cm²`,
      `Two semicircular ends = one circle = πr² = ${fmt(Math.PI * r * r)} cm²`,
      `Total surface area = ${fmt(sa)} cm²`
    ],
    space: SPACE_SIZES.LARGE
  });
}

function compositeCylinderSurfaceAreaQuestion() {
  const R = choice([12, 14]);
  const H = choice([5, 6]);
  const r = choice([5, 6]);
  const h = choice([12, 15]);
  const sa = 2 * Math.PI * R * H + 2 * Math.PI * R * R + 2 * Math.PI * r * h;

  return areaSurfaceQuestion({
    type: "composite-cylinder-surface-area",
    marks: 3,
    prompt: "The solid below is made from two closed cylinders joined together. Calculate the exposed surface area correct to 1 decimal place.",
    diagram: areaDiagram({ diagramType: "composite-cylinder", largeDiameter: `${2*R} cm`, smallDiameter: `${2*r} cm`, smallHeight: `${h} cm`, largeHeight: `${H} cm` }),
    answer: `${fmt(sa)} cm²`,
    working: [
      `The joined circular face is not exposed.`,
      `Large cylinder exposed area = curved area + bottom + exposed top annulus`,
      `This simplifies to 2πRH + 2πR² = 2π × ${R} × ${H} + 2π × ${R}²`,
      `Small cylinder exposed curved area = 2πrh = 2π × ${r} × ${h}`,
      `Total exposed surface area = ${fmt(sa)} cm²`
    ],
    space: SPACE_SIZES.LARGE
  });
}

function practicalCylinderSurfaceAreaQuestion() {
  const radius = choice([3, 4, 5]);
  const height = choice([12, 15, 18]);
  const cost = choice([0.08, 0.12, 0.15]);
  const csa = 2 * Math.PI * radius * height;
  const total = csa * cost;

  return areaSurfaceQuestion({
    type: "practical-cylinder-surface-area",
    marks: 2,
    prompt: `A label wraps around the curved surface of a cylindrical container with radius ${radius} cm and height ${height} cm.
The label costs $${cost.toFixed(2)} per cm² to print. Calculate the printing cost correct to the nearest cent.`,
    diagram: areaDiagram({ diagramType: "cylinder", diameter: `${2*radius} cm`, height: `${height} cm` }),
    answer: `$${fmt(total, 2)}`,
    working: [
      `Curved surface area = 2πrh = 2π × ${radius} × ${height} = ${fmt(csa)} cm²`,
      `Cost = ${fmt(csa)} × $${cost.toFixed(2)} = $${fmt(total, 2)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

const BUILDERS = {
  "rectilinear-composite-area": rectilinearCompositeAreaQuestion,
  "shaded-area": shadedAreaQuestion,
  "composite-area-circles": compositeAreaCirclesQuestion,
  "practical-area-applications": practicalAreaQuestion,
  "identify-prism-faces": identifyPrismFacesQuestion,
  "rectangular-prism-surface-area": rectangularPrismSurfaceAreaQuestion,
  "triangular-prism-surface-area": triangularPrismSurfaceAreaQuestion,
  "trapezoidal-prism-surface-area": trapezoidalPrismSurfaceAreaQuestion,
  "composite-prism-surface-area": compositePrismSurfaceAreaQuestion,
  "recognise-valid-nets": recogniseValidNetsQuestion,
  "surface-area-from-net": surfaceAreaFromNetQuestion,
  "curved-surface-area-cylinder": curvedSurfaceAreaCylinderQuestion,
  "closed-cylinder-surface-area": closedCylinderSurfaceAreaQuestion,
  "cylinder-net-surface-area": cylinderNetSurfaceAreaQuestion,
  "half-cylinder-surface-area": halfCylinderSurfaceAreaQuestion,
  "composite-cylinder-surface-area": compositeCylinderSurfaceAreaQuestion,
  "practical-cylinder-surface-area": practicalCylinderSurfaceAreaQuestion
};

export function getAreaSurfaceAreaAQuestionTypes() {
  return TYPE_LIST.map(type => ({ ...type }));
}

export function generateAreaSurfaceAreaAQuestions({ count = 6, allowedTypes = [] } = {}) {
  const selectedTypes = Array.isArray(allowedTypes) && allowedTypes.length
    ? allowedTypes.filter(type => BUILDERS[type])
    : TYPE_LIST.map(type => type.id);

  const plan = makeBalancedPlan(selectedTypes, Math.max(0, Number(count || 0)));

  return plan.map(type => {
    const builder = BUILDERS[type] || rectilinearCompositeAreaQuestion;
    return builder();
  });
}
