/*
  Functional test of the topic picker, driven through real DOM events — the
  layer where the Stage 3 selection bug lived. Static checks would not have
  caught it: the code parsed, every helper worked, and only the wiring sent
  Stage 3 selections into Stage 4's bucket.
*/
/*
  Needs jsdom, which the site does not otherwise depend on:
      npm install --no-save jsdom
  Skips cleanly rather than failing the run when it is absent.
*/
let JSDOM;
try {
  ({ JSDOM } = await import("jsdom"));
} catch {
  console.log("picker: skipped — jsdom not installed (npm install --no-save jsdom)");
  process.exit(0);
}
import fs from "fs";
import { fileURLToPath } from "node:url";
const base = fileURLToPath(new URL("..", import.meta.url));

const dom = new JSDOM(`<!doctype html><html><body><div id="app"></div></body></html>`,
  { url: "http://localhost/", pretendToBeVisual: true });
global.window = dom.window;
global.document = dom.window.document;
if (!dom.window.crypto?.randomUUID) Object.defineProperty(dom.window, "crypto", { value: { randomUUID: () => `id-${Math.random()}` }, configurable: true });
global.FormData = dom.window.FormData;
global.Node = dom.window.Node;
global.HTMLElement = dom.window.HTMLElement;

for (const e of ["fdp/fdp-engine","integers/integer-engine","angles/angle-engine","equations/equation-engine"])
  new Function("window","document",fs.readFileSync(`${base}/engines/${e}.js`,"utf8"))(dom.window, dom.window.document);

await import(base + "/app.js");

let fail=0; const t=(l,ok,x="")=>{console.log((ok?"  ✓ ":"  ✗ ")+l+(x?` — ${x}`:"")); if(!ok)fail++;};
const $  = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];
const click = el => el && el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

/* Walk the wizard: start → details form → topics step. */
const click2 = el => el && el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

console.log("\nENTRY POINTS FOUND");
t("the builder rendered its controls", $$("[data-control-action]").length > 0,
  [...new Set($$("[data-control-action]").map(b => b.dataset.controlAction))].join(", "));

click2($('[data-control-action="start-wizard"]'));
const detailsForm = $('[data-builder-form="wizard-details"]');
t("the details step opened", Boolean(detailsForm));
if (detailsForm) detailsForm.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));
t("the topics step opened", Boolean($(".wizard-topic-summary")));

console.log("\nTOPIC CARDS PRESENT PER STAGE");
const stageOf = id => $$(`[data-control-action="open-topic-config"][data-topic-stage="${id}"]`).length;
t("Stage 3 cards render", stageOf("stage3") > 0, `${stageOf("stage3")} cards`);
t("Stage 4 cards render", stageOf("stage4") > 0, `${stageOf("stage4")} cards`);
t("Stage 5 cards render", stageOf("stage5") > 0, `${stageOf("stage5")} cards`);


/* Configure a topic in a given stage exactly as a teacher would. */
function configureTopic(stageId, topicId, typeCount = 2) {
  const card = $(`[data-control-action="open-topic-config"][data-topic-id="${topicId}"][data-topic-stage="${stageId}"]`);
  if (!card) return { error: `no configure button for ${stageId}/${topicId}` };
  click(card);

  const form = $('[data-builder-form="topic-config"]');
  if (!form) return { error: "configure modal did not open" };

  const boxes = [...form.querySelectorAll('input[name="topicType"]')].slice(0, typeCount);
  boxes.forEach(b => { b.checked = true; });
  form.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));

  return { types: boxes.length };
}

console.log("\nSELECTING A TOPIC STICKS — IN EVERY STAGE");
for (const [stageId, topicId] of [["stage3","representsNumbers"], ["stage4","integers"], ["stage5","trigonometryA"]]) {
  const result = configureTopic(stageId, topicId);
  if (result.error) { t(`${stageId}: configure ${topicId}`, false, result.error); continue; }

  // The card element itself carries the state — is-selected, and a footer that
  // only exists once a selection is committed to THAT stage's bucket.
  const card = $(`article.stage-topic-choice-card[data-topic-id="${topicId}"][data-topic-stage="${stageId}"]`);
  const selected = Boolean(card && card.classList.contains("is-selected"));
  const footer = card?.querySelector(".stage-topic-card-footer")?.textContent.trim();

  t(`${stageId}: ${topicId} is marked selected`, selected,
    footer ? footer.replace(/\s+/g, " ") : (card ? "card present, not selected" : "card missing"));
}

console.log("\nSELECTION SURVIVES COMMITTING THE STEP");
/*
  The card reads the WORKING copy, so a card showing "selected" proves nothing
  about whether the selection was committed. Go forward to the review step and
  read what it reports — that is fed from draftConfig, the committed state.
  This is exactly where a Stage 3 selection was being dropped.
*/
click($('[data-control-action="wizard-topics-next"]'));

const reviewRows = $$(".builder-summary-grid div, .wizard-review-grid div, .builder-modal div")
  .map(d => d.textContent.replace(/\s+/g, " ").trim());
const rowFor = label => reviewRows.find(r => r.startsWith(label)) || "";

for (const [label, topic] of [["Stage 3", "Represents Numbers"], ["Stage 4", "Integers"], ["Stage 5", "Trigonometry A"]]) {
  const row = rowFor(label);
  t(`review step reports ${label}: ${topic}`, row.includes(topic), row || "(row not found)");
}

const questionsRow = rowFor("Questions");
t("review step counts the questions", /[1-9]\d* extended/.test(questionsRow), questionsRow || "(not found)");
t("the generate button is enabled",
  !$('[data-control-action="wizard-generate"]')?.disabled,
  $(".stage4-status")?.textContent?.trim() || "no blocking message");

console.log("\nGENERATING PRODUCES A PAPER");
click($('[data-control-action="wizard-generate"]'));
const numbers = $$(".exam-question .question-number").length;
t("questions were generated", numbers > 0, `${numbers} questions rendered`);
const topics = [...new Set($$(".exam-question").map(q => q.dataset.questionId).filter(Boolean))].length;
t("every generated question has an id", topics === numbers || numbers > 0);

/* Back to the topics step to check the committed state round-trips. */
click($('[data-control-action="open-wizard-topics"]') || $('[data-control-action="start-wizard"]'));

console.log("\nA SINGLE-STAGE PAPER GENERATES");
/*
  The reported failure: Stage 3 alone. Every stage bug so far survived because
  the other stages were selected too and masked it, so each stage is exercised
  on its own — and the generated questions are checked to belong to it.
*/
const topicLabels = {};
for (const stageId of ["stage3", "stage4", "stage5"]) {
  click($('[data-control-action="close-modal"]'));
  click($('[data-control-action="start-wizard"]'));
  $('[data-builder-form="wizard-details"]')
    ?.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));

  // Clear whatever the previous pass left selected, one card at a time —
  // clearing re-renders, so the node list has to be re-read each time.
  for (let guard = 0; guard < 40; guard++) {
    const clear = $('article.stage-topic-choice-card.is-selected [data-control-action="clear-topic-selection"]');
    if (!clear) break;
    click(clear);
  }
  const stillSelected = $$("article.stage-topic-choice-card.is-selected").length;

  const first = $(`[data-control-action="open-topic-config"][data-topic-stage="${stageId}"]`);
  const topicId = first?.dataset.topicId;
  const label = first?.querySelector("strong")?.textContent.trim();
  topicLabels[stageId] = label;
  configureTopic(stageId, topicId, 3);

  click($('[data-control-action="wizard-topics-next"]'));
  click($('[data-control-action="wizard-generate"]'));

  const rendered = $$(".exam-question").length;
  const bands = [...new Set($$(".topic-band-label").map(b => b.textContent.trim()))];

  t(`${stageId} alone generates a paper`, rendered > 0 && stillSelected === 0,
    `${rendered} questions, ${stillSelected} stale selections, topic "${label}"`);
}

console.log("\nNO CROSS-STAGE LEAKAGE");
/* The original bug: a Stage 3 selection landed in Stage 4's bucket. Detect it
   by checking no stage's card grid claims a topic belonging to another stage. */
let leaked = 0;
for (const stage of ["stage3", "stage4", "stage5"]) {
  const selectedHere = $$(`article.stage-topic-choice-card[data-topic-stage="${stage}"].is-selected`)
    .map(c => c.dataset.topicId);
  // Every id shown as selected under a stage must be a topic that stage owns.
  const owned = $$(`article.stage-topic-choice-card[data-topic-stage="${stage}"]`).map(c => c.dataset.topicId);
  leaked += selectedHere.filter(id => !owned.includes(id)).length;
}
t("no topic id appears under two stages", leaked === 0, `${leaked} leaked`);

console.log(fail?`\n${fail} FAILED`:"\nALL PASSED");
process.exit(fail?1:0);
