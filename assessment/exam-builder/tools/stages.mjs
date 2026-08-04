/* The plumbing must behave identically with 2 stages and with 3, and an empty
   stage must be invisible rather than an empty heading. */
import fs from "fs";
import { fileURLToPath } from "node:url";
const base = fileURLToPath(new URL("..", import.meta.url));
const src = fs.readFileSync(base + "/app.js", "utf8");

let fail=0; const t=(l,ok,x="")=>{console.log((ok?"  ✓ ":"  ✗ ")+l+(x?` — ${x}`:"")); if(!ok)fail++;};

console.log("\nREGISTRY");
t("STAGES registry exists with three stages",
  /const STAGES = \[/.test(src) && (src.match(/id: "stage[345]"/g)||[]).length===3,
  (src.match(/id: "stage[345]"/g)||[]).join(" "));
t("Stage 3 topic map declared", /const STAGE3_TOPICS = \{/.test(src));
t("original selection keys preserved for saved drafts",
  /selectionKey: "selectedTopics"/.test(src) && /selectionKey: "selectedStage5Topics"/.test(src));

console.log("\nNO HARDCODED STAGE BRANCHES LEFT IN THE HOT PATHS");
for (const [label, pattern] of [
  ["buildExam iterates the registry", /for \(const \{ stage, topicId, topicConfig, topic \} of eachSelectedTopic\(config\)\)/],
  ["subtitle takes a config", /function buildSubtitleFromSelectedTopics\(config = \{\}\)/],
  ["picker renders a grid per stage", /STAGES\.filter\(stage => Object\.keys\(stage\.topics\)\.length\)/],
  ["one submit for all stages", /function submitStageTopics\(stageId\)/],
  ["one cancel for all stages", /function cancelStageTopics\(stageId\)/],
  ["status is keyed by stage", /const stageStatus = \{\}/],
  ["draft topics keyed by stage", /const stageDraftTopics = \{\}/]
]) t(label, pattern.test(src));

for (const [label, pattern] of [
  ["no stage4DraftTopics variable", /\bstage4DraftTopics\b/],
  ["no stage5DraftTopics variable", /\bstage5DraftTopics\b/],
  ["no submitStage4Topics", /function submitStage4Topics/],
  ["no submitStage5Topics", /function submitStage5Topics/],
  ["no stage4Status variable", /let stage4Status/],
  ["no two-argument subtitle call", /buildSubtitleFromSelectedTopics\([^)]*,[^)]*\)/]
]) t(label, !pattern.test(src));

console.log("\nEMPTY STAGE IS INVISIBLE");
t("picker skips stages with no topics", /STAGES\.filter\(stage => Object\.keys\(stage\.topics\)\.length\)/.test(src));

console.log(fail?`\n${fail} FAILED`:"\nALL PASSED");
process.exit(fail?1:0);
