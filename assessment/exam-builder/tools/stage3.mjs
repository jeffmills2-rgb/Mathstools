/* Stage 3 "Represents Numbers" — checks the MATHS is right and the calibration
   holds, not just that questions render. */
import fs from "fs";
import { fileURLToPath } from "node:url";
const base = fileURLToPath(new URL("..", import.meta.url));
const bank = await import(base + "/question-banks/stage-3/represents-numbers/index.js");
const { resolveAnswerSpace } = await import(base + "/utils/answer-space-rules.js");

let fail = 0;
const t = (l, ok, x = "") => { console.log((ok ? "  ✓ " : "  ✗ ") + l + (x ? ` — ${x}` : "")); if (!ok) fail++; };

const TYPES = bank.getRepresentsNumbersQuestionTypes();
const ALL = bank.generateRepresentsNumbersQuestions({ count: 3000 });
const by = id => ALL.filter(q => q.type === id);

console.log("\nCOVERAGE");
t("15 question types declared", TYPES.length === 15, `${TYPES.length}`);
t("every declared type generates", TYPES.every(ty => by(ty.id).length > 0),
  TYPES.filter(ty => !by(ty.id).length).map(ty => ty.id).join(", ") || "all present");
t("type selection is respected", (() => {
  const only = bank.generateRepresentsNumbersQuestions({ count: 40, allowedTypes: ["round-large"] });
  return only.length === 40 && only.every(q => q.type === "round-large");
})());
t("empty allowedTypes generates nothing",
  bank.generateRepresentsNumbersQuestions({ count: 10, allowedTypes: [] }).length === 0);

console.log("\nMATHS IS CORRECT");
const num = s => Number(String(s).replace(/[^\d.-]/g, ""));

let bad = 0;
for (const q of by("round-large")) {
  const m = q.prompt.match(/Round ([\d\s]+) to the nearest (\w[\w\s]*)\./);
  const places = { ten: 10, hundred: 100, thousand: 1000, "ten thousand": 10000, "hundred thousand": 100000 };
  const p = places[m[2].trim()];
  if (Math.round(num(m[1]) / p) * p !== num(q.answer)) bad++;
}
t("rounding answers are correct", bad === 0, `${by("round-large").length} checked`);

bad = 0;
for (const q of by("percent-of-quantity")) {
  const m = q.prompt.match(/Find (\d+)% of ([\d\s]+)/);
  if (num(m[2]) * Number(m[1]) / 100 !== num(q.answer)) bad++;
}
t("percentage-of-quantity answers are correct", bad === 0, `${by("percent-of-quantity").length} checked`);

bad = 0;
for (const q of by("percentage-discount")) {
  const m = q.prompt.match(/costs \$([\d.]+)\. It is reduced by (\d+)%/);
  const expected = Number(m[1]) * (100 - Number(m[2])) / 100;
  if (Math.abs(expected - num(q.answer)) > 1e-9) bad++;
}
t("discount answers are correct", bad === 0, `${by("percentage-discount").length} checked`);

bad = 0;
for (const q of by("compare-decimals")) {
  const m = q.answer.match(/([\d.]+) ([<>]) ([\d.]+)/);
  const ok = m[2] === ">" ? Number(m[1]) > Number(m[3]) : Number(m[1]) < Number(m[3]);
  if (!ok) bad++;
}
t("decimal comparisons are correct", bad === 0, `${by("compare-decimals").length} checked`);

bad = 0;
for (const q of by("order-decimals")) {
  const asc = /smallest to largest/.test(q.prompt);
  const vals = q.answer.split(", ").map(Number);
  const sorted = vals.slice().sort((a, b) => asc ? a - b : b - a);
  if (vals.join() !== sorted.join()) bad++;
}
t("decimal ordering is correct", bad === 0, `${by("order-decimals").length} checked`);

bad = 0;
for (const q of by("order-millions")) {
  const asc = /ascending/.test(q.prompt);
  const vals = q.answer.split(", ").map(num);
  const sorted = vals.slice().sort((a, b) => asc ? a - b : b - a);
  if (vals.join() !== sorted.join()) bad++;
}
t("whole-number ordering is correct", bad === 0, `${by("order-millions").length} checked`);

console.log("\nSTAGE 3 CALIBRATION");
t("decimals never exceed 3 places",
  !ALL.some(q => (String(q.prompt).match(/\d+\.(\d+)/g) || []).some(d => d.split(".")[1].length > 3)));
t("negatives use a typographic minus, not a hyphen",
  !ALL.some(q => /(^|\s)-\d/.test(String(q.prompt)) || /(^|\s)-\d/.test(String(q.answer))));
t("regrouping questions do not repeat verbatim", (() => {
  const prompts = by("regroup-thousands").map(q => q.prompt);
  const distinct = new Set(prompts).size;
  return distinct >= 10 ? true : (console.log("      only", distinct, "distinct forms"), false);
})());
t("percentages stay on the benchmark set",
  (() => {
    const pcts = ALL.flatMap(q => (String(q.prompt).match(/(\d+)%/g) || []).map(p => Number(p.replace("%",""))));
    const allowed = new Set([10, 20, 25, 50, 75, 100]);
    const rogue = [...new Set(pcts)].filter(p => !allowed.has(p));
    return rogue.length === 0 ? true : (console.log("      rogue:", rogue.join(", ")), false);
  })());
t("no numbers beyond the millions (9 digits)", (() => {
  const worst = Math.max(0, ...ALL.flatMap(q =>
    (String(q.prompt).match(/\d[\d\s]*\d/g) || []).map(run => run.replace(/\s/g, "").length)));
  return worst <= 9 ? true : (console.log("      longest run:", worst, "digits"), false);
})());
t("money answers are always exact cents",
  by("percentage-discount").every(q => /^\$\d+\.\d{2}$/.test(q.answer)));

console.log("\nFITS THE PIPELINE");
t("every question carries the topic", ALL.every(q => q.topic === "Represents Numbers"));
t("every question has an answer", ALL.every(q => q.answer !== null && q.answer !== undefined && String(q.answer).length));
t("every question has working, or is a multi-part whose parts do",
  ALL.every(q => Array.isArray(q.working) &&
    (q.working.length || (q.subparts || []).every(p => (p.working || []).length))));
t("no raw fraction tokens leak into answers", !ALL.some(q => /\[\[/.test(String(q.answer)) && q.type !== "benchmark-equivalents"));
t("diagram questions reference a real engine",
  ALL.filter(q => q.diagram).every(q => ["fdp-engine", "integer-engine"].includes(q.diagram.engine)));
t("diagram-answered questions get no answer space",
  ALL.filter(q => /^(Mark|Place) /.test(q.prompt)).every(q => resolveAnswerSpace(q).kind === "none"));
t("2-mark questions get ruled lines", ALL.filter(q => q.marks === 2)
  .every(q => resolveAnswerSpace(q).kind === "lines"));
t("short 1-mark answers get a box, long ones get lines", (() => {
  const one = ALL.filter(q => q.marks === 1 && resolveAnswerSpace(q).kind !== "none");
  const wrong = one.filter(q => {
    const long = String(q.answer).replace(/\[\[[^\]]*\]\]/g, "x").length > 12 || /explain|justify|why/i.test(q.prompt);
    return resolveAnswerSpace(q).kind !== (long ? "lines" : "box");
  });
  return wrong.length === 0 ? true : (console.log("      e.g.", wrong[0].prompt.slice(0, 60)), false);
})());
t("writing a number in words gets room to write",
  by("read-millions").filter(q => /in words/.test(q.prompt))
    .every(q => resolveAnswerSpace(q).kind === "lines"));
t("ordering questions get room for the list",
  [...by("order-millions"), ...by("order-decimals")]
    .every(q => resolveAnswerSpace(q).kind === "lines"));
t("the multi-part question exposes its parts",
  by("multi-part-number").every(q => q.subparts?.length === 3 && resolveAnswerSpace(q).kind === "parts"));

console.log("\nNUMBER WORDS");
const words = by("read-millions").filter(q => /in words/.test(q.prompt));
t("number words look well formed",
  words.every(q => /^[a-z][a-z\s-]*$/.test(q.answer) && !/\s{2}/.test(q.answer)),
  words.length ? `e.g. "${words[0].answer}"` : "none");

console.log(fail ? `\n${fail} FAILED` : "\nALL PASSED");
process.exit(fail ? 1 : 0);
