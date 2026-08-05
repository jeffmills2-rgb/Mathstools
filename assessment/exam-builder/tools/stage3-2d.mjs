/* Stage 3 "2D Space and Area" — the area arithmetic, the unit conversions and
   the shape facts all have to be right, and every area answer needs its unit. */
import { fileURLToPath } from "node:url";
const base = fileURLToPath(new URL("..", import.meta.url));
const bank = await import(base + "question-banks/stage-3/two-d-space-area/index.js");
const { resolveAnswerSpace } = await import(base + "utils/answer-space-rules.js");

let fail = 0;
const t = (l, ok, x = "") => { console.log((ok ? "  ✓ " : "  ✗ ") + l + (x ? ` — ${x}` : "")); if (!ok) fail++; };
const TYPES = bank.getStage3TwoDQuestionTypes();
const ALL = bank.generateStage3TwoDQuestions({ count: 4000 });
const by = id => ALL.filter(q => q.type === id);
const num = s => Number(String(s).replace(/[^\d.]/g, ""));

console.log("\nCOVERAGE");
t("16 question types declared", TYPES.length === 16, `${TYPES.length}`);
t("every declared type generates", TYPES.every(ty => by(ty.id).length > 0),
  TYPES.filter(ty => !by(ty.id).length).map(ty => ty.id).join(", ") || "all present");

console.log("\nAREA ARITHMETIC IS CORRECT");
let bad = 0;
for (const q of by("area-rectangle")) {
  // Read the dimensions off the DIAGRAM — that is now where they live, so this
  // also checks the figure and the answer agree.
  const l = num(q.diagram.config.lengthLabel);
  const w = num(q.diagram.config.widthLabel);
  if (l * w !== num(q.answer)) bad++;
}
t("rectangle area", bad === 0, `${by("area-rectangle").length} checked`);

bad = 0;
for (const q of by("area-square")) {
  const side = num(q.diagram.config.lengthLabel);
  if (side * side !== num(q.answer)) bad++;
}
t("square area", bad === 0, `${by("area-square").length} checked`);

bad = 0;
for (const q of by("area-triangle")) {
  const b = num(q.diagram.config.baseLabel);
  const h = num(q.diagram.config.heightLabel);
  if (b * h / 2 !== num(q.answer)) bad++;
}
t("triangle area is half the rectangle", bad === 0, `${by("area-triangle").length} checked`);
t("triangle areas are always whole numbers",
  by("area-triangle").every(q => Number.isInteger(num(q.answer))));

bad = 0;
for (const q of by("area-parallelogram")) {
  const b = num(q.diagram.config.baseLabel);
  const h = num(q.diagram.config.heightLabel);
  if (b * h !== num(q.answer)) bad++;
}
t("parallelogram area", bad === 0, `${by("area-parallelogram").length} checked`);

bad = 0;
for (const q of by("missing-side")) {
  const [, area, known] = q.prompt.match(/area of ([\d\s]+) \w+²\. One side is (\d+)/);
  if (num(area) / Number(known) !== num(q.answer)) bad++;
}
t("missing side works backwards correctly", bad === 0, `${by("missing-side").length} checked`);
t("missing side is always a whole number",
  by("missing-side").every(q => Number.isInteger(num(q.answer))));

bad = 0;
for (const q of by("composite-area")) {
  const dims = [...q.prompt.matchAll(/(\d+) \w+ by (\d+)/g)].map(m => Number(m[1]) * Number(m[2]));
  if (dims.reduce((s, v) => s + v, 0) !== num(q.answer)) bad++;
}
t("composite area sums its parts", bad === 0, `${by("composite-area").length} checked`);

bad = 0;
for (const q of by("count-unit-squares")) {
  const { cols, rows } = q.diagram.config;
  if (cols * rows !== num(q.answer)) bad++;
}
t("grid-counting matches the drawn grid", bad === 0, `${by("count-unit-squares").length} checked`);
t("grids stay small enough to count",
  [...by("count-unit-squares"), ...by("rows-and-columns")]
    .every(q => q.diagram.config.cols * q.diagram.config.rows <= 70));

console.log("\nUNIT CONVERSIONS");
bad = 0;
for (const q of by("hectares")) {
  if (/hectares\. How many square metres/.test(q.prompt)) {
    const h = Number(q.prompt.match(/covers (\d+) hectares/)[1]);
    if (h * 10000 !== num(q.answer)) bad++;
  } else if (/km²\. How many hectares/.test(q.prompt)) {
    const k = Number(q.prompt.match(/covers (\d+) km/)[1]);
    if (k * 100 !== num(q.answer)) bad++;
  } else {
    const side = Number(q.prompt.match(/sides of (\d+) m/)[1]);
    if (side * side / 10000 !== num(q.answer)) bad++;
  }
}
t("hectare and km² conversions", bad === 0, `${by("hectares").length} checked`);

console.log("\nTHE UNIT IS PART OF THE ANSWER (MA3-2DS-03)");
const AREA_TYPES = ["count-unit-squares", "rows-and-columns", "area-rectangle", "area-square",
                    "area-triangle", "area-parallelogram", "composite-area"];
t("every area answer carries a squared unit",
  ALL.filter(q => AREA_TYPES.includes(q.type)).every(q => /(cm|m|km)²$/.test(String(q.answer))),
  ALL.filter(q => AREA_TYPES.includes(q.type) && !/(cm|m|km)²$/.test(String(q.answer)))[0]?.answer || "all carry units");
t("a length answer is NOT squared",
  by("missing-side").every(q => /^\d+ (cm|m)$/.test(String(q.answer))));
t("labelled figures carry a not-to-scale note",
  ["area-rectangle","area-square","area-triangle","area-parallelogram"]
    .every(id => by(id).every(q => q.diagram.notToScale === true)));
t("the figure's units match the answer's unit",
  ["area-rectangle","area-square","area-triangle","area-parallelogram"].every(id =>
    by(id).every(q => {
      const shown = String(q.diagram.config.lengthLabel || q.diagram.config.baseLabel).replace(/[\d\s]/g, "");
      return String(q.answer).includes(shown + "²");
    })));
t("unit-choice questions offer the four named units",
  by("choose-unit").every(q => /cm².*m².*hectares.*km²/.test(q.prompt)));

console.log("\nSHAPE FACTS");
const symmetryFacts = { square: 4, rectangle: 2, "equilateral triangle": 3, "isosceles triangle": 1,
  rhombus: 2, "regular pentagon": 5, "regular hexagon": 6, kite: 1 };
t("lines of symmetry are correct",
  by("symmetry").every(q => {
    const shape = q.prompt.match(/does a (.+?) have/)[1];
    return symmetryFacts[shape] === Number(q.answer);
  }), `${by("symmetry").length} checked`);
t("quadrilateral clues map to one shape only", (() => {
  const pairs = new Map();
  for (const q of by("classify-quadrilateral")) {
    const clue = q.prompt.match(/has (.+)\?$/)[1];
    if (pairs.has(clue) && pairs.get(clue) !== q.answer) return false;
    pairs.set(clue, q.answer);
  }
  return pairs.size > 0;
})());
t("triangle clues map to one type only", (() => {
  const pairs = new Map();
  for (const q of by("classify-triangle")) {
    const clue = q.prompt.match(/has (.+)\?$/)[1];
    if (pairs.has(clue) && pairs.get(clue) !== q.answer) return false;
    pairs.set(clue, q.answer);
  }
  return pairs.size > 0;
})());
t("all three transformations appear",
  ["translation", "reflection", "rotation"]
    .every(word => by("transformations").some(q => new RegExp(word, "i").test(q.answer + q.working.join()))));

console.log("\nFITS THE PIPELINE");
t("every question carries the topic", ALL.every(q => q.topic === "2D Space and Area"));
t("every question has an answer", ALL.every(q => String(q.answer ?? "").length));
t("diagram questions reference the area engine",
  ALL.filter(q => q.diagram).every(q => q.diagram.engine === "area-engine"));
t("explanation questions get room to write",
  ALL.filter(q => /Explain/i.test(q.prompt) && !q.subparts)
    .every(q => resolveAnswerSpace(q).kind === "lines"));
t("2-mark questions get ruled lines",
  ALL.filter(q => q.marks === 2 && resolveAnswerSpace(q).kind !== "none")
    .every(q => resolveAnswerSpace(q).kind === "lines"));
t("the multi-part question exposes its parts",
  by("multi-part-area").every(q => q.subparts?.length === 3 && resolveAnswerSpace(q).kind === "parts"));
t("the multi-part 'half as wide' part stays whole",
  by("multi-part-area").every(q => Number.isInteger(num(q.subparts[2].answer))));

console.log(fail ? `\n${fail} FAILED` : "\nALL PASSED");
process.exit(fail ? 1 : 0);
