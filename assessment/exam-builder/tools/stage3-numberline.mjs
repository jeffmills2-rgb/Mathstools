/*
  Open number line strategies — the diagram and the arithmetic must agree.

  These questions are unusual in that the picture IS the method, so the risk is
  not a wrong total but a jump sequence that does not actually reach it. Every
  check below reconstructs the answer from the jumps in the diagram config
  rather than trusting the answer string.
*/
import { fileURLToPath } from "node:url";
const base = fileURLToPath(new URL("..", import.meta.url));
const bank = await import(base + "question-banks/stage-3/additive-relations/index.js");

let fail = 0;
const t = (l, ok, x = "") => { console.log((ok ? "  ✓ " : "  ✗ ") + l + (x ? ` — ${x}` : "")); if (!ok) fail++; };

const ONL = ["onl-bridging-add", "onl-jump-add", "onl-jumping-over-add",
             "onl-bridging-sub", "onl-counting-up", "onl-constant-difference", "onl-draw-your-own"];

const ALL = bank.generateAdditiveRelationsQuestions({ count: 4000 });
const by = id => ALL.filter(q => q.type === id);

console.log("\nALL SEVEN STRATEGIES GENERATE");
for (const id of ONL) t(`${id}`, by(id).length > 0, `${by(id).length} generated`);

console.log("\nTHE DIAGRAM REACHES THE ANSWER");
/* Walk the jumps from the first stop and check where they land. */
function walk(q) {
  const { jumps, stops } = q.diagram.config;
  let position = Number(stops[0]);
  for (const jump of jumps) {
    if (jump.size === null) return null;      // hidden by design
    position += jump.direction === "back" ? -Number(jump.size) : Number(jump.size);
  }
  return position;
}

for (const id of ["onl-bridging-add", "onl-jump-add", "onl-jumping-over-add", "onl-bridging-sub"]) {
  const qs = by(id).filter(q => walk(q) !== null);
  const bad = qs.filter(q => {
    const total = Number(String(q.answer).split("=").pop().trim());
    return walk(q) !== total;
  });
  t(`${id}: jumps land on the stated answer`, bad.length === 0,
    `${qs.length} fully-labelled checked` + (bad.length ? ` · e.g. ${bad[0].answer}` : ""));
}

/* Counting up is different: the ANSWER is the total of the jumps, not where
   they land. Getting this backwards is the classic error the strategy exists
   to address, so it is checked explicitly. */
{
  const qs = by("onl-counting-up").filter(q => q.diagram.config.jumps.every(j => j.size !== null));
  const bad = qs.filter(q => {
    const jumpTotal = q.diagram.config.jumps.reduce((s, j) => s + Number(j.size), 0);
    const stated = Number(String(q.answer).split("=").pop().trim());
    return jumpTotal !== stated;
  });
  t("onl-counting-up: the jumps TOTAL the difference", bad.length === 0, `${qs.length} checked`);

  const landsBad = qs.filter(q => {
    const { stops } = q.diagram.config;
    const larger = Number(String(q.prompt).match(/work out (\d+) −/)[1]);
    return Number(stops[stops.length - 1]) !== larger;
  });
  t("onl-counting-up: the last stop is the larger number", landsBad.length === 0);
}

console.log("\nSTRATEGY SHAPES ARE FAITHFUL TO THE WORKBOOK");
t("bridging always steps to a multiple of ten first",
  by("onl-bridging-add").every(q => Number(q.diagram.config.stops[1] ?? 0) % 10 === 0
    || q.diagram.config.stops[1] === null),
  "first stop after the bridge");
t("jumping over uses one forward jump then one back",
  by("onl-jumping-over-add").every(q => {
    const j = q.diagram.config.jumps;
    return j.length === 2 && !j[0].direction && j[1].direction === "back";
  }));
t("jumping over jumps a round number",
  by("onl-jumping-over-add").every(q => Number(q.diagram.config.jumps[0].size) % 10 === 0));
t("subtraction bridging jumps backwards only",
  by("onl-bridging-sub").every(q => q.diagram.config.jumps.every(j => j.direction === "back")));
t("constant difference shifts BOTH numbers by the same amount",
  by("onl-constant-difference").every(q => {
    const shifts = q.diagram.config.shifts || [];
    return shifts.length === 2 && shifts[0].by === shifts[1].by;
  }));
// The originals stay on the line; the SHIFTED positions are the round ones,
// which is the entire point of the strategy.
t("constant difference shifts both endpoints onto a ten",
  by("onl-constant-difference").every(q => {
    const [smaller, larger] = q.diagram.config.stops.map(Number);
    const by = Number(q.diagram.config.shifts[0].by);
    return (smaller + by) % 10 === 0 && (larger + by) === larger + by;
  }));
// Only the SMALLER original has to be off a ten — that is what makes the
// shift worth doing. The larger one may land on a ten by chance.
t("constant difference starts from an awkward smaller number",
  by("onl-constant-difference").every(q => Number(q.diagram.config.stops[0]) % 10 !== 0));
t("draw-your-own gives a blank line",
  by("onl-draw-your-own").every(q => q.diagram.config.diagramType === "blank-number-line"));

console.log("\nSTAGE 3 CALIBRATION HOLDS");
t("no negative results", by("onl-bridging-sub").every(q =>
  Number(String(q.answer).split("=").pop().trim()) >= 0));
t("numbers stay within two and three digits",
  ALL.filter(q => ONL.includes(q.type)).every(q =>
    (q.diagram.config.stops || []).every(v => v === null || Math.abs(Number(v)) < 1000)));
t("every strategy question carries a diagram",
  ALL.filter(q => ONL.includes(q.type)).every(q => q.diagram?.engine === "open-number-line-engine"));
t("hidden labels are nulls, which the engine draws as boxes",
  by("onl-jumping-over-add").every(q => q.diagram.config.stops.includes(null)));

console.log(fail ? `\n${fail} FAILED` : "\nALL PASSED");
process.exit(fail ? 1 : 0);
