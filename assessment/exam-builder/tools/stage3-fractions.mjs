/*
  Stage 3 "Fractions" — checks the fraction arithmetic is right and the two
  outcome limits are actually enforced.
*/
import { fileURLToPath } from "node:url";
const base = fileURLToPath(new URL("..", import.meta.url));
const bank = await import(base + "question-banks/stage-3/fractions/index.js");
const { resolveAnswerSpace } = await import(base + "utils/answer-space-rules.js");

let fail = 0;
const t = (l, ok, x = "") => { console.log((ok ? "  ✓ " : "  ✗ ") + l + (x ? ` — ${x}` : "")); if (!ok) fail++; };

const TYPES = bank.getStage3FractionsQuestionTypes();
const ALL = bank.generateStage3FractionsQuestions({ count: 4000 });
const by = id => ALL.filter(q => q.type === id);

/* Pull every [[frac:n:d]] out of a string. */
const fracs = s => [...String(s).matchAll(/\[\[frac:(-?\d+):(-?\d+)\]\]/g)]
  .map(m => ({ n: Number(m[1]), d: Number(m[2]) }));
const value = f => f.n / f.d;
const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);

console.log("\nCOVERAGE");
t("17 question types declared", TYPES.length === 17, `${TYPES.length}`);
t("every declared type generates", TYPES.every(ty => by(ty.id).length > 0),
  TYPES.filter(ty => !by(ty.id).length).map(ty => ty.id).join(", ") || "all present");

console.log("\nOUTCOME LIMITS ARE ENFORCED");
/* MA3-RQF-01 names exactly these denominators. */
const ALLOWED_D = new Set([2, 3, 4, 5, 6, 8, 10]);
const rogue = new Set();
for (const q of ALL) {
  for (const f of [...fracs(q.prompt), ...fracs(q.answer)]) {
    if (!ALLOWED_D.has(f.d)) rogue.add(`${f.n}/${f.d}`);
  }
}
t("denominators stay within 2, 3, 4, 5, 6, 8, 10 (MA3-RQF-01)",
  rogue.size === 0, rogue.size ? [...rogue].slice(0, 6).join(", ") : "clean");

/* MA3-RQF-02 names only halves, quarters, fifths and tenths as operators. */
const QUANTITY_TYPES = ["fraction-of-quantity", "fraction-of-measure", "build-to-whole"];
const opRogue = new Set();
for (const q of ALL.filter(q => QUANTITY_TYPES.includes(q.type))) {
  for (const f of fracs(q.prompt)) if (![2, 4, 5, 10].includes(f.d)) opRogue.add(`${f.n}/${f.d}`);
  const words = String(q.prompt).match(/\b(half|quarter|fifth|tenth|third|sixth|eighth)\b/);
  if (words && !["half", "quarter", "fifth", "tenth"].includes(words[1])) opRogue.add(words[1]);
}
t("fractions OF a quantity use only halves, quarters, fifths, tenths (MA3-RQF-02)",
  opRogue.size === 0, opRogue.size ? [...opRogue].join(", ") : "clean");

console.log("\nTHE FRACTION ARITHMETIC IS CORRECT");
let bad = 0;
for (const q of by("add-same-denominator")) {
  const [a, b] = fracs(q.prompt);
  const answer = fracs(q.answer)[0];
  if (Math.abs(value(a) + value(b) - value(answer)) > 1e-9) bad++;
}
t("same-denominator addition", bad === 0, `${by("add-same-denominator").length} checked`);

bad = 0;
for (const q of by("subtract-same-denominator")) {
  const [a, b] = fracs(q.prompt);
  const answer = fracs(q.answer)[0];
  if (Math.abs(value(a) - value(b) - value(answer)) > 1e-9) bad++;
}
t("same-denominator subtraction", bad === 0, `${by("subtract-same-denominator").length} checked`);

bad = 0;
for (const q of by("add-related-denominators")) {
  const [a, b] = fracs(q.prompt);
  const answer = fracs(q.answer)[0];
  if (Math.abs(value(a) + value(b) - value(answer)) > 1e-9) bad++;
}
t("related-denominator addition", bad === 0, `${by("add-related-denominators").length} checked`);

bad = 0;
for (const q of by("compare-unit-fractions")) {
  const [a, b] = fracs(q.prompt);
  const answer = fracs(q.answer)[0];
  if (value(answer) !== Math.max(value(a), value(b))) bad++;
}
t("unit-fraction comparison picks the larger", bad === 0, `${by("compare-unit-fractions").length} checked`);

bad = 0;
for (const q of by("compare-related-fractions")) {
  const [a, b] = fracs(q.prompt);
  const answer = fracs(q.answer)[0];
  if (value(answer) !== Math.max(value(a), value(b))) bad++;
}
t("related-fraction comparison picks the larger", bad === 0, `${by("compare-related-fractions").length} checked`);

bad = 0;
for (const q of by("order-fractions")) {
  const ascending = /smallest to largest/.test(q.prompt);
  const values = fracs(q.answer).map(value);
  const sorted = values.slice().sort((x, y) => ascending ? x - y : y - x);
  if (values.join() !== sorted.join()) bad++;
}
t("ordering is correct", bad === 0, `${by("order-fractions").length} checked`);

bad = 0;
for (const q of by("equivalent-fractions")) {
  const [given] = fracs(q.prompt);
  const big = Number(q.prompt.match(/□\/(\d+)/)[1]);
  if (Math.abs(given.n / given.d - Number(q.answer) / big) > 1e-9) bad++;
}
t("equivalent fractions really are equivalent", bad === 0, `${by("equivalent-fractions").length} checked`);

console.log("\nANSWERS ARE IN SIMPLEST FORM WHERE ASKED");
const simplifyTypes = ["name-fraction-set", "add-same-denominator", "subtract-same-denominator"];
t("no answer can be simplified further",
  ALL.filter(q => simplifyTypes.includes(q.type)).every(q => {
    const f = fracs(q.answer)[0];
    return !f || gcd(f.n, f.d) === 1;
  }));

console.log("\nQUANTITIES STAY WHOLE");
t("fraction of a quantity gives a whole number",
  by("fraction-of-quantity").every(q => Number.isInteger(Number(String(q.answer).match(/^\d+/)?.[0]))));
t("fraction of a measure gives a whole number",
  by("fraction-of-measure").every(q => /^\d+ /.test(String(q.answer))));
t("building to the whole multiplies back exactly",
  by("build-to-whole").every(q => {
    const part = Number(q.prompt.match(/is (\d+)/)[1]);
    const whole = Number(String(q.answer).match(/^\d+/)[0]);
    return whole % part === 0;
  }));

console.log("\nFITS THE PIPELINE");
t("every question carries the topic", ALL.every(q => q.topic === "Fractions"));
t("every question has an answer", ALL.every(q => String(q.answer ?? "").length));
t("diagram questions reference the fdp engine",
  ALL.filter(q => q.diagram).every(q => q.diagram.engine === "fdp-engine"));
t("shade / mark questions get no answer space",
  ALL.filter(q => /^(Shade|Mark) /.test(q.prompt)).every(q => resolveAnswerSpace(q).kind === "none"));
t("explanation questions get room to write",
  ALL.filter(q => /Explain/i.test(q.prompt) && !q.subparts)
    .every(q => resolveAnswerSpace(q).kind === "lines"));
t("the multi-part question exposes its parts",
  by("multi-part-fractions").every(q => q.subparts?.length === 3 && resolveAnswerSpace(q).kind === "parts"));
t("no raw tokens leak outside fraction markup",
  !ALL.some(q => /\[\[(?!frac:)/.test(String(q.prompt) + String(q.answer))));

console.log("\nWORDING AND USEFULNESS");
t("no plural mismatch in the sharing questions",
  !by("fraction-as-division").some(q => /\b1 \w+s\b/.test(q.prompt)),
  by("fraction-as-division").find(q => /\b1 \w+s\b/.test(q.prompt))?.prompt || "clean");
t("ordering questions are not already in order",
  by("order-fractions").every(q => {
    const shown = [...String(q.prompt).matchAll(/\[\[frac:(\d+):(\d+)\]\]/g)].map(m => m[1]).join();
    const want = [...String(q.answer).matchAll(/\[\[frac:(\d+):(\d+)\]\]/g)].map(m => m[1]).join();
    return shown !== want;
  }), `${by("order-fractions").length} checked`);
t("a list of fractions gets ruled lines, not a 22mm box",
  by("order-fractions").every(q => resolveAnswerSpace(q).kind === "lines"));
t("a single fraction still gets a box",
  by("add-same-denominator").every(q => resolveAnswerSpace(q).kind === "box"));

console.log(fail ? `\n${fail} FAILED` : "\nALL PASSED");
process.exit(fail ? 1 : 0);
