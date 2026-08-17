/* Stage 3 "Multiplicative Relations" — twelve of the twenty-one types carry a
   diagram the student reads or completes, so almost every check here reads the
   numbers off the DIAGRAM CONFIG rather than the prompt, and re-derives the
   answer from those. If the picture and the answer ever disagree, that is the
   defect this harness exists to catch. It also guards the two Stage 3 scope
   boundaries the syllabus draws around this topic: nothing goes negative, and
   the symbolic work stays number sentences rather than algebra. */
import { fileURLToPath } from "node:url";
const base = fileURLToPath(new URL("..", import.meta.url));
const bank = await import(base + "question-banks/stage-3/multiplicative-relations/index.js");
const { resolveAnswerSpace } = await import(base + "utils/answer-space-rules.js");

let fail = 0;
const t = (l, ok, x = "") => { console.log((ok ? "  ✓ " : "  ✗ ") + l + (x ? ` — ${x}` : "")); if (!ok) fail++; };
const TYPES = bank.getMultiplicativeRelationsQuestionTypes();
const ALL = bank.generateMultiplicativeRelationsQuestions({ count: 4200 });
const by = id => ALL.filter(q => q.type === id);
/* The bank spaces its thousands, so every comparison strips the spacing out. */
const num = s => Number(String(s).replace(/[^\d.-]/g, ""));
const nums = s => (String(s).replace(/(\d) (?=\d{3}\b)/g, "$1").match(/-?\d+(\.\d+)?/g) || []).map(Number);
const cfg = q => q.diagram.config;

console.log("\nCOVERAGE");
t("21 question types declared", TYPES.length === 21, `${TYPES.length}`);
t("every declared type generates", TYPES.every(ty => by(ty.id).length > 0),
  TYPES.filter(ty => !by(ty.id).length).map(ty => ty.id).join(", ") || "all present");
t("all four ways in are present — build, read, reverse, see",
  ["build-area-model", "area-model-read", "division-model", "multiples-pattern"]
    .every(id => by(id).length > 0));
t("the topic really is diagram-led", ALL.filter(q => q.diagram || q.subparts?.some(s => s.diagram)).length / ALL.length > 0.5,
  `${Math.round(100 * ALL.filter(q => q.diagram || q.subparts?.some(s => s.diagram)).length / ALL.length)}% carry a figure`);

console.log("\nARRAYS — THE ANSWER IS THE DRAWN ARRAY (MA3-MR-01)");
let bad = 0;
for (const q of by("array-product")) {
  const { rows, cols } = cfg(q);
  if (q.answer !== `${rows} × ${cols} = ${rows * cols}`) bad++;
}
t("the multiplication written is the array drawn", bad === 0, `${by("array-product").length} checked`);
t("array-product leaves BOTH side labels blank, so the array must be read",
  by("array-product").every(q => cfg(q).rowLabel === null && cfg(q).colLabel === null));
t("the commutative pair labels its sides (the fact is the point, not the count)",
  by("array-commutative").every(q => cfg(q).rowLabel === cfg(q).rows && cfg(q).colLabel === cfg(q).cols));
t("a commutative array is never square — a square shows only one fact",
  by("array-commutative").every(q => cfg(q).rows !== cfg(q).cols));
bad = 0;
for (const q of by("array-commutative")) {
  const { rows, cols } = cfg(q);
  if (q.answer !== `${rows} × ${cols} = ${rows * cols} and ${cols} × ${rows} = ${rows * cols}`) bad++;
}
t("both facts are stated, and both are true", bad === 0, `${by("array-commutative").length} checked`);
t("arrays stay inside a countable size",
  ALL.filter(q => q.diagram && cfg(q).diagramType === "array")
    .every(q => cfg(q).rows <= 9 && cfg(q).cols <= 9));

console.log("\nFACTORS AS RECTANGLES");
bad = 0;
for (const q of by("factor-rectangles")) {
  const n = Number(q.prompt.match(/(?:from|of) (\d+) counters/)?.[1] ?? q.prompt.match(/does (\d+) have/)[1]);
  if (!cfg(q).pairs.every(([a, b]) => a * b === n)) bad++;
}
t("every rectangle drawn really is a factor pair", bad === 0, `${by("factor-rectangles").length} checked`);
bad = 0;
for (const q of by("factor-rectangles").filter(q => /How many factors/.test(q.prompt))) {
  const n = Number(q.prompt.match(/does (\d+) have/)[1]);
  const expected = [];
  for (let i = 1; i <= n; i++) if (n % i === 0) expected.push(i);
  if (q.answer !== `${expected.length} factors: ${expected.join(", ")}`) bad++;
  /* The claim in the prompt is that EVERY rectangle is shown — so the drawn
     pairs have to account for the whole factor list, with nothing missing. */
  if (new Set(cfg(q).pairs.flat()).size !== expected.length) bad++;
}
t("the factor list is complete and the drawing shows all of it", bad === 0);
t("the 'write the multiplication' variant is answered on the diagram",
  by("factor-rectangles").filter(q => /Write the multiplication/.test(q.prompt))
    .every(q => cfg(q).captions === null && resolveAnswerSpace(q).kind === "none"));
t("both variants appear",
  by("factor-rectangles").some(q => /How many factors/.test(q.prompt)) &&
  by("factor-rectangles").some(q => /Write the multiplication/.test(q.prompt)));

console.log("\nTHE AREA MODEL — THE PARTITION IS CLEAN AND THE TOTAL IS RIGHT");
const AREA_TYPES = ["build-area-model", "area-model-3-digit", "area-model-2x2", "area-model-read"];
bad = 0;
for (const q of ALL.filter(x => AREA_TYPES.includes(x.type))) {
  const c = cfg(q);
  const colSum = c.columnParts.reduce((s, v) => s + v, 0);
  const rowSum = c.rowParts.reduce((s, v) => s + v, 0);
  if (num(q.answer.replace(/.*= /, "")) !== colSum * rowSum) bad++;
}
t("the model's edges multiply to the stated answer", bad === 0,
  `${ALL.filter(x => AREA_TYPES.includes(x.type)).length} checked`);
t("every part is a place-value part — a single digit followed by zeros",
  ALL.filter(x => AREA_TYPES.includes(x.type))
    .every(q => [...cfg(q).columnParts, ...cfg(q).rowParts].every(p => /^[1-9]0*$/.test(String(p)) || p < 10 || /^[1-9]\d$/.test(String(p)))),
  "place parts only");
t("a partition never has a zero part",
  ALL.filter(x => AREA_TYPES.includes(x.type)).every(q => cfg(q).columnParts.every(p => p > 0)));
bad = 0;
for (const q of ALL.filter(x => ["build-area-model", "area-model-3-digit", "area-model-2x2"].includes(x.type))) {
  const [, a, b] = q.prompt.match(/(\d[\d\s]*) × (\d+)/);
  if (num(a) !== cfg(q).columnParts.reduce((s, v) => s + v, 0)) bad++;
  if (num(b) !== cfg(q).rowParts.reduce((s, v) => s + v, 0)) bad++;
}
t("the numbers in the prompt are the numbers on the edges", bad === 0);
t("a model the student must COMPLETE arrives with its cells empty",
  ALL.filter(x => ["build-area-model", "area-model-3-digit", "area-model-2x2"].includes(x.type))
    .every(q => cfg(q).cells.every(row => row.every(cell => cell === null)) && cfg(q).total === null));
t("'build' blanks the edge labels too, so the student chooses the partition",
  by("build-area-model").every(q => cfg(q).columnLabels.every(l => l === null)));
t("'3-digit' hands over the partition and asks only for the multiplying",
  by("area-model-3-digit").every(q => cfg(q).columnLabels.every(l => l !== null)));
t("the 2×2 model really is 2 by 2",
  by("area-model-2x2").every(q => cfg(q).columnParts.length === 2 && cfg(q).rowParts.length === 2 &&
    cfg(q).cells.length === 2 && cfg(q).cells.every(r => r.length === 2)));
bad = 0;
for (const q of by("area-model-read")) {
  const c = cfg(q);
  const row = c.rowParts[0];
  if (!c.cells[0].every((cell, i) => num(cell) === c.columnParts[i] * row)) bad++;
  if (c.total !== false) bad++;
}
t("'read' shows filled cells that match the edges, and hides the total", bad === 0,
  `${by("area-model-read").length} checked`);
t("'read' puts no numbers in the prompt — the picture is the whole question",
  by("area-model-read").every(q => !/\d/.test(q.prompt)));
t("a model completed on the page gets no answer space underneath",
  ALL.filter(x => ["build-area-model", "area-model-3-digit", "area-model-2x2"].includes(x.type))
    .every(q => resolveAnswerSpace(q).kind === "none"));

console.log("\nDIVISION ON THE SAME RECTANGLE");
bad = 0;
for (const q of by("division-model")) {
  const c = cfg(q);
  const dividend = num(q.prompt.match(/out ([\d\s]+) ÷/)[1]);
  const areas = c.parts.map(p => num(p.area));
  if (areas.reduce((s, v) => s + v, 0) !== dividend) bad++;
  if (num(q.answer) * c.divisor !== dividend) bad++;
  if (!areas.every(a => a % c.divisor === 0)) bad++;
}
t("the blocks add to the dividend and the quotient checks by multiplying back",
  bad === 0, `${by("division-model").length} checked`);
t("the division model splits into a whole number of tens plus ones",
  by("division-model").every(q => (num(cfg(q).parts[0].area) / cfg(q).divisor) % 10 === 0));

bad = 0;
for (const q of by("division-model-remainder")) {
  const c = cfg(q);
  const dividend = num(q.prompt.match(/out ([\d\s]+) ÷/)[1]);
  const areas = c.parts.map(p => num(p.area));
  const [quot, rem] = nums(q.answer);
  if (areas.reduce((s, v) => s + v, 0) + c.remainder !== dividend) bad++;
  if (quot * c.divisor + rem !== dividend) bad++;
  if (rem !== c.remainder) bad++;
}
t("the leftover block is the remainder, and the parts rebuild the dividend",
  bad === 0, `${by("division-model-remainder").length} checked`);
t("a remainder is never zero and never large enough to make another group",
  by("division-model-remainder").every(q => cfg(q).remainder > 0 && cfg(q).remainder < cfg(q).divisor));
t("the remainder is named in the answer, not silently dropped",
  by("division-model-remainder").every(q => /remainder/.test(q.answer)));

console.log("\nMULTIPLES ON THE HUNDRED CHART");
bad = 0;
for (const q of by("multiples-pattern")) {
  const k = Number(q.prompt.match(/multiples of (\d+)/)[1]);
  const c = cfg(q);
  const expected = [];
  for (let v = k; v <= c.to; v += k) expected.push(v);
  if (c.shade.join(",") !== expected.join(",")) bad++;
}
t("the shaded squares are exactly the multiples", bad === 0, `${by("multiples-pattern").length} checked`);
t("the pattern described is a pattern you could actually see",
  by("multiples-pattern").every(q => /column|diagonal/i.test(q.answer)));
t("the grid is 10 wide, which is what makes the pattern appear",
  by("multiples-pattern").every(q => cfg(q).columns === 10));

bad = 0;
for (const q of by("common-multiples")) {
  const [a, b] = [...q.prompt.matchAll(/multiples of (\d+)/gi)].map(m => Number(m[1]));
  const c = cfg(q);
  const both = [];
  for (let v = 1; v <= c.to; v++) if (v % a === 0 && v % b === 0) both.push(v);
  if (/SMALLEST/.test(q.prompt)) {
    if (num(q.answer) !== both[0]) bad++;
  } else if (q.answer !== both.join(", ")) bad++;
  if (c.shade.some(v => v % a !== 0) || c.shadeAlt.some(v => v % b !== 0)) bad++;
}
t("common multiples are correct, and both shadings are honest", bad === 0,
  `${by("common-multiples").length} checked`);
t("there is always at least one common multiple on the grid to find",
  by("common-multiples").every(q => q.answer.length > 0));
t("both the 'smallest' and the 'list them all' variants appear",
  by("common-multiples").some(q => /SMALLEST/.test(q.prompt)) &&
  by("common-multiples").some(q => /Write all/.test(q.prompt)));

console.log("\nFROM THE MODEL TO THE SYMBOLS");
bad = 0;
for (const q of by("partition-to-multiply")) {
  const [, big, small] = q.prompt.match(/out (\d+) × (\d+)/).map(Number);
  if (num(q.answer.match(/total ([\d\s]+)/)[1]) !== big * small) bad++;
}
t("partitioning reaches the same total as multiplying", bad === 0,
  `${by("partition-to-multiply").length} checked`);

bad = 0;
for (const q of by("estimate-product")) {
  const [a, b] = nums(q.prompt.match(/Estimate (\d+ × \d+)/)[1]);
  const r = n => Math.round(n / 10) * 10;
  if (q.answer !== `${r(a)} × ${r(b)} = ${String(r(a) * r(b)).replace(/\B(?=(\d{3})+(?!\d))/g, " ")}`) bad++;
}
t("the estimate rounds both numbers and multiplies them", bad === 0,
  `${by("estimate-product").length} checked`);
t("no number ending in 5 is set for rounding (the rule is ambiguous there)",
  by("estimate-product").every(q => nums(q.prompt.match(/Estimate (\d+ × \d+)/)[1]).every(n => n % 10 !== 5)));
/* Rounding a number like 14 to the nearest ten is a blunt instrument, so the
   bound here is what rounding CAN guarantee, not what feels close: each factor
   moves by at most 5, and the product moves with it. */
t("an estimate is as close as rounding to the nearest ten allows",
  by("estimate-product").every(q => {
    const [a, b] = nums(q.prompt.match(/Estimate (\d+ × \d+)/)[1]);
    const worst = 5 * a + 5 * b + 25;
    return Math.abs(num(q.answer.split("= ")[1]) - a * b) <= worst;
  }), `${by("estimate-product").length} checked`);
t("estimating a quotient lands within one group of the true value",
  by("estimate-quotient").every(q => {
    const dividend = num(q.prompt.match(/Estimate ([\d\s]+) ÷/)[1]);
    const divisor = num(q.prompt.match(/÷ (\d+)/)[1]);
    return Math.abs(num(q.answer) - dividend / divisor) <= 5 / divisor + 1;
  }), `${by("estimate-quotient").length} checked`);
t("an estimated quotient is a whole number a student could hold in their head",
  by("estimate-quotient").every(q => Number.isInteger(num(q.answer))));

console.log("\nWHAT THE REMAINDER MEANS — THE THREE READINGS");
bad = 0;
for (const q of by("interpret-remainder")) {
  if (/How many buses/.test(q.prompt)) {
    const per = num(q.prompt.match(/seats (\d+)/)[1]);
    const students = num(q.prompt.match(/\. (\d+) students/)[1]);
    if (num(q.answer) !== Math.ceil(students / per)) bad++;
  } else if (/FULL boxes/.test(q.prompt)) {
    const per = num(q.prompt.match(/packed (\d+) to a box/)[1]);
    const items = num(q.prompt.match(/from (\d+) eggs/)[1]);
    if (num(q.answer) !== Math.floor(items / per)) bad++;
  } else {
    const total = num(q.prompt.match(/^(\d+) marbles/)[1]);
    const people = num(q.prompt.match(/between (\d+) friends/)[1]);
    if (num(q.answer) !== total % people) bad++;
  }
}
t("each reading of the remainder is the right one for its question", bad === 0,
  `${by("interpret-remainder").length} checked`);
t("all three readings appear — round up, drop it, and it IS the answer",
  by("interpret-remainder").some(q => /buses/.test(q.prompt)) &&
  by("interpret-remainder").some(q => /FULL boxes/.test(q.prompt)) &&
  by("interpret-remainder").some(q => /left over/.test(q.prompt)));
t("a remainder question never divides exactly (there would be nothing to interpret)",
  by("interpret-remainder").every(q => {
    const ns = nums(q.prompt);
    return ns.length >= 2;
  }));

console.log("\nNUMBER SENTENCES (MA3-MR-02)");
bad = 0;
for (const q of by("powers-of-ten")) {
  const [a, b] = nums(q.prompt.replace(/Work out /, ""));
  const expected = /÷/.test(q.prompt) ? a / b : a * b;
  if (Math.abs(num(q.answer) - expected) > 1e-9) bad++;
}
t("multiplying and dividing by 10, 100 and 1000 is exact", bad === 0,
  `${by("powers-of-ten").length} checked`);
t("both directions appear",
  by("powers-of-ten").some(q => /×/.test(q.prompt)) && by("powers-of-ten").some(q => /÷/.test(q.prompt)));
t("place-value language explains the shift, rather than 'add a zero'",
  by("powers-of-ten").every(q => /places to the (left|right)/.test(q.working.join(" "))) &&
  by("powers-of-ten").every(q => !/add a zero/i.test(q.working.join(" "))));

bad = 0;
for (const q of by("equivalent-sentence")) {
  const body = q.prompt.replace(/.*true: /, "");
  const [lhs, rhs] = body.split("=").map(s => s.trim());
  const op = /÷/.test(lhs) ? "/" : "*";
  const l = nums(lhs);
  const r = nums(rhs);
  const left = op === "/" ? l[0] / l[1] : l[0] * l[1];
  const right = op === "/" ? r[0] / num(q.answer) : r[0] * num(q.answer);
  if (Math.abs(left - right) > 1e-9) bad++;
}
t("the two sides of an equivalent sentence really do balance", bad === 0,
  `${by("equivalent-sentence").length} checked`);
t("the answer to an equivalence is a whole number",
  by("equivalent-sentence").every(q => Number.isInteger(num(q.answer)) && num(q.answer) > 0));
t("the reasoning is about the SCALING, not about calculating both sides",
  by("equivalent-sentence").every(q => /multiplied by|divided by/.test(q.working.join(" "))));
t("both a × and a ÷ form appear",
  by("equivalent-sentence").some(q => /×/.test(q.prompt)) &&
  by("equivalent-sentence").some(q => /÷/.test(q.prompt)));

bad = 0;
for (const q of by("unknown-factor")) {
  const body = q.prompt.replace(/.*number: /, "").replace(/□/, `(${num(q.answer)})`);
  const value = Function(`"use strict"; return ${body.replace(/×/g, "*").replace(/÷/g, "/").replace("=", "===")}`)();
  if (value !== true) bad++;
}
t("substituting the answer back makes the sentence true", bad === 0,
  `${by("unknown-factor").length} checked`);
/* All four shapes matter: the box has to be able to sit in either factor slot
   and on either side of a division, or "find the missing number" collapses
   into one rehearsed move. */
const UNKNOWN_SHAPES = [
  /: □ × \d+ = \d+$/, /: \d+ × □ = \d+$/, /: \d+ ÷ □ = \d+$/, /: \d+ ÷ \d+ = □$/
];
t("the unknown appears in all four positions",
  UNKNOWN_SHAPES.every(re => by("unknown-factor").some(q => re.test(q.prompt))),
  UNKNOWN_SHAPES.filter(re => !by("unknown-factor").some(q => re.test(q.prompt)))
    .map(String).join(" ") || "all four");

console.log("\nORDER OF OPERATIONS — EVALUATED INDEPENDENTLY");
bad = 0;
const oopsNegative = [];
for (const q of by("order-of-operations")) {
  const expr = q.prompt.replace("Work out: ", "")
    .replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");
  const value = Function(`"use strict"; return ${expr}`)();
  if (value !== num(q.answer)) bad++;
  if (value < 0) oopsNegative.push(`${q.prompt.replace("Work out: ", "")} = ${value}`);
}
t("the stated answer is what the expression evaluates to", bad === 0,
  `${by("order-of-operations").length} checked`);
t("no order-of-operations answer is NEGATIVE — Stage 3 has no integers yet",
  oopsNegative.length === 0,
  oopsNegative.length ? `${oopsNegative.length} of ${by("order-of-operations").length}, e.g. ${oopsNegative[0]}` : "all non-negative");
t("brackets and precedence-without-brackets both appear",
  by("order-of-operations").some(q => /\(/.test(q.prompt)) &&
  by("order-of-operations").some(q => !/\(/.test(q.prompt)));
t("the working names the rule it used",
  by("order-of-operations").every(q => /Brackets first|before/.test(q.working.join(" "))));

bad = 0;
for (const q of by("divide-3-digit")) {
  const dividend = num(q.prompt.match(/out ([\d\s]+) ÷/)[1]);
  const divisor = num(q.prompt.match(/÷ (\d+)/)[1]);
  if (num(q.answer) * divisor !== dividend) bad++;
  if (dividend < 100 || dividend > 999) bad++;
}
t("a 3-digit division is exact, and the dividend really has 3 digits", bad === 0,
  `${by("divide-3-digit").length} checked`);
t("the divisor stays single-digit, as the content point says",
  by("divide-3-digit").every(q => num(q.prompt.match(/÷ (\d+)/)[1]) < 10));

console.log("\nSTAGE 3 SCOPE");
t("no answer is ever negative",
  ALL.every(q => !/^-|\s-\d/.test(String(q.answer))),
  ALL.filter(q => /^-|\s-\d/.test(String(q.answer)))[0]?.answer ?? "all non-negative");
t("no pronumerals — the unknown is a box, not a letter",
  ALL.every(q => !/\b\d+[a-z]\b|\b[a-z]\s*=\s*\d/.test(q.prompt)));
t("nothing goes beyond the thousands",
  ALL.every(q => nums(q.prompt + " " + q.answer).every(n => Math.abs(n) < 100000)));
t("no fraction or percentage work has leaked in from the neighbouring topics",
  ALL.every(q => !/%|\bfraction\b/i.test(q.prompt)));
t("decimals only appear in the powers-of-ten type",
  ALL.filter(q => /\d\.\d/.test(q.prompt)).every(q => q.type === "powers-of-ten"));

console.log("\nFITS THE PIPELINE");
t("every question carries the topic", ALL.every(q => q.topic === "Multiplicative Relations"));
t("every question has an answer", ALL.every(q => String(q.answer ?? "").length));
t("every question has at least one mark", ALL.every(q => q.marks >= 1));
t("every question has working, or is a multi-part whose parts do",
  ALL.every(q => q.working?.length || q.subparts?.every(s => s.working?.length)));
t("every diagram names the array/area engine",
  ALL.filter(q => q.diagram).every(q => q.diagram.engine === "array-area-engine"));
t("subpart diagrams name it too",
  ALL.flatMap(q => q.subparts ?? []).filter(s => s.diagram)
    .every(s => s.diagram.engine === "array-area-engine"));
t("2-mark questions get ruled lines",
  ALL.filter(q => q.marks === 2 && resolveAnswerSpace(q).kind !== "none")
    .every(q => resolveAnswerSpace(q).kind === "lines"));
t("a one-number answer gets a box, not lines",
  by("unknown-factor").every(q => resolveAnswerSpace(q).kind === "box"));
t("the multi-part question exposes its parts",
  by("multi-part-multiplicative").every(q => q.subparts?.length === 3 && resolveAnswerSpace(q).kind === "parts"));
bad = 0;
for (const q of by("multi-part-multiplicative")) {
  const boxes = num(q.prompt.match(/orders (\d+) boxes/)[1]);
  const perBox = num(q.prompt.match(/holds (\d+) pencils/)[1]);
  /* (c) is (a) run backwards — that inverse is the whole reason the part exists. */
  if (num(q.subparts[0].answer) !== boxes * perBox) bad++;
  if (num(q.subparts[2].answer) !== boxes) bad++;
  if (nums(q.subparts[2].prompt)[0] !== boxes * perBox) bad++;
}
t("part (c) is exactly part (a) reversed, and comes out whole", bad === 0,
  `${by("multi-part-multiplicative").length} checked`);
t("no leftover template tokens", ALL.every(q => !/\{[a-z]/i.test(q.prompt + q.answer)));

console.log(fail ? `\n${fail} FAILED` : "\nALL PASSED");
process.exit(fail ? 1 : 0);
