/* Stage 3 "Geometric Measure" — three strands under one topic, so this harness
   re-derives every coordinate, every conversion, every perimeter and every
   angle independently of the bank, and checks the two things the syllabus is
   fussy about: that the position questions actually teach point-vs-area, and
   that no Stage 4 angle relationship has crept in. */
import { fileURLToPath } from "node:url";
const base = fileURLToPath(new URL("..", import.meta.url));
const bank = await import(base + "question-banks/stage-3/geometric-measure/index.js");
const { resolveAnswerSpace } = await import(base + "utils/answer-space-rules.js");

let fail = 0;
const t = (l, ok, x = "") => { console.log((ok ? "  ✓ " : "  ✗ ") + l + (x ? ` — ${x}` : "")); if (!ok) fail++; };
const TYPES = bank.getStage3GeometricMeasureQuestionTypes();
const ALL = bank.generateStage3GeometricMeasureQuestions({ count: 4000 });
const by = id => ALL.filter(q => q.type === id);
const num = s => Number(String(s).replace(/[^\d.]/g, ""));

console.log("\nCOVERAGE");
t("18 question types declared", TYPES.length === 18, `${TYPES.length}`);
t("every declared type generates", TYPES.every(ty => by(ty.id).length > 0),
  TYPES.filter(ty => !by(ty.id).length).map(ty => ty.id).join(", ") || "all present");
t("all three strands are represented",
  ["read-coordinates", "convert-length", "angles-straight-line"].every(id => by(id).length > 0));

console.log("\nPOSITION — THE PLOTTED POINT MATCHES THE ANSWER (MA3-GM-01)");
let bad = 0;
for (const q of by("read-coordinates")) {
  const p = q.diagram.config.points[0];
  if (q.answer !== `(${p.x}, ${p.y})`) bad++;
}
t("the read coordinate is the drawn point", bad === 0, `${by("read-coordinates").length} checked`);
t("read-coordinates never leaks the answer onto the diagram",
  by("read-coordinates").every(q =>
    q.diagram.config.showCoordinates !== true &&
    q.diagram.config.points.every(p => p.showCoordinates !== true)));
t("read-coordinates stays in the first quadrant",
  by("read-coordinates").every(q => {
    const p = q.diagram.config.points[0];
    return p.x > 0 && p.y > 0;
  }));
/* A point on the frame collides with the axis numbers, so the grid is always
   drawn one square bigger than the biggest coordinate in play. */
t("no point ever sits on the edge of the grid",
  [...by("read-coordinates"), ...by("four-quadrants")].every(q => {
    const c = q.diagram.config;
    return c.points.every(p =>
      Math.abs(p.x) < Math.max(c.xMax, -c.xMin) && Math.abs(p.y) < Math.max(c.yMax, -c.yMin));
  }));
t("the plotted point in a plot question is inside the drawn grid",
  by("plot-point").every(q => {
    const [, x, y] = q.prompt.match(/\((\d+), (\d+)\)/);
    return Number(x) < q.diagram.config.xMax && Number(y) < q.diagram.config.yMax;
  }));
t("the plot question hands over an EMPTY plane",
  by("plot-point").every(q => q.diagram.config.mode === "blank"));
t("the plot question names the point in the prompt",
  by("plot-point").every(q => /^Plot the point [A-D] \(\d+, \d+\)/.test(q.prompt)));
t("plotting is answered on the diagram, so it gets no answer space",
  by("plot-point").every(q => resolveAnswerSpace(q).kind === "none"));

bad = 0;
for (const q of by("four-quadrants")) {
  const p = q.diagram.config.points[0];
  if (/Which quadrant/.test(q.prompt)) {
    const expected = p.x > 0 ? (p.y > 0 ? "first" : "fourth") : (p.y > 0 ? "second" : "third");
    if (q.answer !== `The ${expected} quadrant`) bad++;
  } else if (q.answer !== `(${p.x}, ${p.y})`) bad++;
}
t("quadrant naming and coordinates agree with the drawn point", bad === 0,
  `${by("four-quadrants").length} checked`);
t("four-quadrant questions actually draw four quadrants",
  by("four-quadrants").every(q => q.diagram.config.xMin < 0 && q.diagram.config.yMin < 0));
t("four-quadrant points avoid the axes (no ambiguous quadrant)",
  by("four-quadrants").every(q => {
    const p = q.diagram.config.points[0];
    return p.x !== 0 && p.y !== 0;
  }));

console.log("\nPOSITION — THE TWO STATED MISCONCEPTIONS");
t("grid reference is taught as an AREA, coordinates as a POINT",
  by("coordinate-vs-grid-map").length > 0 &&
  by("coordinate-vs-grid-map").every(q => /point|area|square/i.test(q.answer)));
t("both directions of the distinction appear",
  by("coordinate-vs-grid-map").some(q => q.answer === "An area") &&
  by("coordinate-vs-grid-map").some(q => q.answer === "A point"));
t("'the lines are numbered, not the spaces' is asked",
  by("lines-not-spaces").some(q => /Against the lines/.test(q.answer)));
t("the origin is named",
  by("lines-not-spaces").some(q => /origin/i.test(q.answer)));

console.log("\nLENGTH — CONVERSIONS (MA3-GM-02)");
bad = 0;
for (const q of by("metre-kilometre")) {
  if (/How many metres are there in (\d+) km/.test(q.prompt)) {
    const km = Number(q.prompt.match(/in (\d+) km/)[1]);
    if (km * 1000 !== num(q.answer)) bad++;
  } else if (/How many kilometres/.test(q.prompt)) {
    const m = num(q.prompt.match(/in ([\d\s]+) m\?/)[1]);
    if (m / 1000 !== num(q.answer)) bad++;
  } else {
    const [, laps, each] = q.prompt.match(/(\d+) laps of a (\d+) m track/);
    if ((Number(laps) * Number(each)) / 1000 !== num(q.answer)) bad++;
  }
}
t("metre ↔ kilometre is exact", bad === 0, `${by("metre-kilometre").length} checked`);
t("1000 m = 1 km is stated in the working",
  by("metre-kilometre").every(q => /1000/.test(q.working.join(" "))));

const FACTORS = { "mm": 1, "cm": 10, "m": 1000, "km": 1000000 };
bad = 0;
for (const q of by("convert-length")) {
  const [, from, fromUnit, toUnit] = q.prompt.match(/Convert ([\d\s]+) (\w+) to (\w+)\./);
  const expected = (num(from) * FACTORS[fromUnit]) / FACTORS[toUnit];
  if (expected !== num(q.answer)) bad++;
  if (!String(q.answer).endsWith(toUnit)) bad++;
}
t("every metric conversion is exact and carries the target unit", bad === 0,
  `${by("convert-length").length} checked`);
t("conversions stay whole (no decimal answers to a whole-number question)",
  by("convert-length").every(q => Number.isInteger(num(q.answer))));

bad = 0;
for (const q of by("decimal-length")) {
  const [, value, from, to] = q.prompt.match(/Write ([\d.]+) (\w+) in (\w+)\./);
  if (Math.round(Number(value) * FACTORS[from] / FACTORS[to]) !== num(q.answer)) bad++;
}
t("decimal lengths convert correctly", bad === 0, `${by("decimal-length").length} checked`);
t("decimal lengths actually use a decimal",
  by("decimal-length").every(q => /\d\.\d/.test(q.prompt)));

const SENSIBLE = {
  "the thickness of a coin": "mm", "the width of a fingernail": "mm",
  "the length of a pencil": "cm", "the height of a door": "m",
  "the length of a swimming pool": "m", "the distance between two towns": "km",
  "the length of a school bus trip": "km"
};
t("unit choices are sensible for the object",
  by("choose-length-unit").every(q => {
    const thing = q.prompt.match(/to measure (.+?): mm/)[1];
    return SENSIBLE[thing] === q.answer;
  }), `${by("choose-length-unit").length} checked`);

console.log("\nLENGTH — PERIMETER");
bad = 0;
for (const q of by("perimeter-rectangle")) {
  const l = num(q.diagram.config.labels.bottom);
  const w = num(q.diagram.config.labels.right);
  if (2 * (l + w) !== num(q.answer)) bad++;
}
t("rectangle perimeter matches the labelled figure", bad === 0,
  `${by("perimeter-rectangle").length} checked`);

bad = 0;
for (const q of by("perimeter-polygon")) {
  const sides = Object.values(q.diagram.config.labels).map(num);
  const total = q.diagram.config.shape === "square" ? sides[0] * 4 : sides.reduce((s, v) => s + v, 0);
  if (total !== num(q.answer)) bad++;
}
t("polygon perimeter sums its sides", bad === 0, `${by("perimeter-polygon").length} checked`);
t("triangle side lengths satisfy the triangle inequality",
  by("perimeter-polygon").filter(q => q.diagram.config.shape === "triangle").every(q => {
    const [a, b, c] = Object.values(q.diagram.config.labels).map(num).sort((x, y) => x - y);
    return a + b > c;
  }));

bad = 0;
for (const q of by("perimeter-missing-side")) {
  const [, p, known] = q.prompt.match(/perimeter of (\d+) \w+\. One side is (\d+)/);
  if ((Number(p) - 2 * Number(known)) / 2 !== num(q.answer)) bad++;
}
t("the missing side works backwards correctly", bad === 0,
  `${by("perimeter-missing-side").length} checked`);
t("the missing side is a positive whole number",
  by("perimeter-missing-side").every(q => Number.isInteger(num(q.answer)) && num(q.answer) > 0));

const PERIM_TYPES = ["perimeter-rectangle", "perimeter-polygon", "perimeter-missing-side"];
t("a perimeter answer is a LENGTH, never squared",
  ALL.filter(q => PERIM_TYPES.includes(q.type)).every(q => /^\d+ (cm|m)$/.test(String(q.answer))),
  ALL.filter(q => PERIM_TYPES.includes(q.type) && !/^\d+ (cm|m)$/.test(String(q.answer)))[0]?.answer || "all plain lengths");
t("the figure's unit matches the answer's unit",
  ["perimeter-rectangle", "perimeter-polygon"].every(id => by(id).every(q => {
    const shown = String(q.diagram.config.labels.bottom).replace(/[\d\s]/g, "");
    return String(q.answer).endsWith(shown);
  })));
t("labelled figures carry a not-to-scale note",
  ["perimeter-rectangle", "perimeter-polygon"].every(id =>
    by(id).every(q => q.diagram.notToScale === true)));

console.log("\nANGLES (MA3-GM-03)");
const KINDS = {
  Acute: a => a > 0 && a < 90, Right: a => a === 90, Obtuse: a => a > 90 && a < 180,
  Straight: a => a === 180, Reflex: a => a > 180 && a < 360
};
bad = 0;
for (const q of by("classify-angle")) {
  const a = Number(q.prompt.match(/is (\d+)°/)[1]);
  if (!KINDS[q.answer] || !KINDS[q.answer](a)) bad++;
}
t("angle classification is correct", bad === 0, `${by("classify-angle").length} checked`);
t("estimation benchmarks against a right angle from three directions",
  by("estimate-angle").some(q => /How many degrees/.test(q.prompt)) &&
  by("estimate-angle").some(q => /How many right angles/.test(q.prompt)) &&
  by("estimate-angle").some(q => /bigger or smaller/.test(q.prompt)));
t("the bigger/smaller comparison is right",
  by("estimate-angle").filter(q => /Without measuring/.test(q.prompt)).every(q => {
    const a = Number(q.prompt.match(/of (\d+)°/)[1]);
    return q.answer === (a > 90 ? "Bigger" : "Smaller");
  }));
t("right-angles-in-a-turn is right",
  by("estimate-angle").filter(q => /How many right angles/.test(q.prompt)).every(q => {
    const map = { "a quarter turn": 1, "a half turn": 2, "three-quarters of a turn": 3, "a full turn": 4 };
    return map[q.prompt.match(/in (.+)\?$/)[1]] === Number(q.answer);
  }));
t("all five angle types appear",
  Object.keys(KINDS).every(k => by("classify-angle").some(q => q.answer === k)),
  Object.keys(KINDS).filter(k => !by("classify-angle").some(q => q.answer === k)).join(", ") || "all five");

bad = 0;
for (const q of by("angles-straight-line")) {
  const parts = q.diagram.config.angleParts;
  if (parts.reduce((s, p) => s + p.value, 0) !== 180) bad++;
  if (num(q.answer) !== parts.find(p => p.isMissing).value) bad++;
}
t("angles on a straight line sum to exactly 180°", bad === 0,
  `${by("angles-straight-line").length} checked`);
t("straight-line questions ask for a reason",
  by("angles-straight-line").every(q => /reason/i.test(q.prompt)));
t("the reason is stated in the working",
  by("angles-straight-line").every(q => /straight line add to 180/.test(q.working.join(" "))));

bad = 0;
for (const q of by("angles-at-a-point")) {
  const parts = q.diagram.config.angleParts;
  if (parts.reduce((s, p) => s + p.value, 0) !== 360) bad++;
  if (num(q.answer) !== parts.find(p => p.isMissing).value) bad++;
}
t("angles at a point sum to exactly 360°", bad === 0, `${by("angles-at-a-point").length} checked`);
t("every drawn angle is big enough to label",
  [...by("angles-straight-line"), ...by("angles-at-a-point")]
    .every(q => q.diagram.config.angleParts.every(p => p.value >= 25)));
t("the unknown is not always in the same position",
  new Set(by("angles-at-a-point").map(q =>
    q.diagram.config.angleParts.findIndex(p => p.isMissing))).size > 1);

bad = 0;
for (const q of by("read-protractor")) {
  if (num(q.answer) !== q.diagram.config.angle) bad++;
}
t("the protractor reading is the drawn angle", bad === 0, `${by("read-protractor").length} checked`);
t("protractor angles stay inside the scale",
  by("read-protractor").every(q => q.diagram.config.angle >= 10 && q.diagram.config.angle <= 170));
t("both protractor orientations appear",
  new Set(by("read-protractor").map(q => q.diagram.config.startSide)).size === 2);

t("every angle a student must MEASURE is a multiple of 5°",
  [...by("read-protractor"), ...by("angles-straight-line"), ...by("angles-at-a-point")]
    .every(q => (q.diagram.config.angleParts || [{ value: q.diagram.config.angle }])
      .every(p => p.value % 5 === 0)));

console.log("\nSTAGE 3 SCOPE — NO STAGE 4 ANGLE WORK");
t("no vertically opposite or parallel-line diagrams",
  ALL.filter(q => q.diagram?.engine === "angle-engine")
     .every(q => !["vertical", "vertically-opposite", "parallel", "parallel-lines"]
       .includes(q.diagram.config.diagramType)));
t("no co-interior / alternate / corresponding language",
  ALL.every(q => !/co-?interior|alternate angle|corresponding angle|vertically opposite/i
    .test(q.prompt + " " + q.working.join(" "))));
t("no pronumeral algebra — x is a value to find, not an equation to solve",
  ALL.every(q => !/\d\s*x\b|x\s*[+−-]\s*\d+\s*=/.test(q.prompt)));

console.log("\nFITS THE PIPELINE");
t("every question carries the topic", ALL.every(q => q.topic === "Geometric Measure"));
t("every question has an answer", ALL.every(q => String(q.answer ?? "").length));
t("every question has at least one mark", ALL.every(q => q.marks >= 1));
t("diagrams name a real engine",
  ALL.filter(q => q.diagram).every(q =>
    ["linear-engine", "angle-engine", "length-engine"].includes(q.diagram.engine)));
t("explanation questions get room to write",
  ALL.filter(q => /Explain/i.test(q.prompt) && !q.subparts)
    .every(q => resolveAnswerSpace(q).kind === "lines"));
t("2-mark questions get ruled lines",
  ALL.filter(q => q.marks === 2 && resolveAnswerSpace(q).kind !== "none")
    .every(q => resolveAnswerSpace(q).kind === "lines"));
t("the multi-part question exposes its parts",
  by("multi-part-perimeter").every(q => q.subparts?.length === 3 && resolveAnswerSpace(q).kind === "parts"));
t("the multi-part parts are internally consistent",
  by("multi-part-perimeter").every(q => {
    const p = num(q.subparts[0].answer);
    return num(q.subparts[1].answer) === p * 100 && num(q.subparts[2].answer) === p * 12;
  }));
t("no leftover template tokens", ALL.every(q => !/\{[a-z]/i.test(q.prompt + q.answer)));

console.log(fail ? `\n${fail} FAILED` : "\nALL PASSED");
process.exit(fail ? 1 : 0);
