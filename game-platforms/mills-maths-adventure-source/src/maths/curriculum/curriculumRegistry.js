import { STAGE3 } from "./stage3/index.js";
import { STAGE4 } from "./stage4/index.js";
import { STAGE5 } from "./stage5/index.js";
import { decorateQuestion, clampDifficulty } from "./shared/curriculumUtils.js";
import { getEngine } from "../index.js"; // legacy engines (e.g. math-examples)

/**
 * CURRICULUM REGISTRY
 *
 * The single entry point the game uses to request maths questions. It exposes
 * the Stage → Topic → Skill tree and turns a request into a fully-decorated
 * question (with stage/topic/skill metadata, difficulty, XP, input mode, etc.).
 *
 * It imports ONLY other maths modules — never game/UI/progress — so the maths
 * layer stays isolated and testable.
 *
 * Tree shape:
 *   stage  = { id, name, topics: [ topic ] }
 *   topic  = { id, name, skills: [ skill ] }
 *   skill  = { id, name, syllabusArea?, prerequisiteSkillIds?, nextSkillIds?,
 *              generate(difficultyLevel) -> core question }
 */
const STAGES = {
  [STAGE3.id]: STAGE3,
  [STAGE4.id]: STAGE4,
  [STAGE5.id]: STAGE5,
};

// ---- Browsing the tree --------------------------------------------------

export function getStages() {
  return Object.values(STAGES).map((s) => ({ id: s.id, name: s.name }));
}

export function getStage(stageId) {
  return STAGES[stageId] || null;
}

export function getTopics(stageId) {
  const stage = STAGES[stageId];
  if (!stage) return [];
  return stage.topics.map((t) => ({
    id: t.id,
    name: t.name,
    skills: t.skills.map((k) => ({ id: k.id, name: k.name })),
  }));
}

export function getTopic(stageId, topicId) {
  const stage = STAGES[stageId];
  return stage ? stage.topics.find((t) => t.id === topicId) || null : null;
}

export function getSkill(stageId, topicId, skillId) {
  const topic = getTopic(stageId, topicId);
  return topic ? topic.skills.find((k) => k.id === skillId) || null : null;
}

// ---- Generating questions ----------------------------------------------

// One curriculum question at a given difficulty (skillId optional → first skill).
export function generateCurriculumQuestion(stageId, topicId, skillId, difficultyLevel) {
  const stage = STAGES[stageId];
  const topic = getTopic(stageId, topicId);
  const skill = skillId ? getSkill(stageId, topicId, skillId) : topic && topic.skills[0];
  if (!stage || !topic || !skill) return null;

  const level = clampDifficulty(difficultyLevel ?? 2);
  const core = skill.generate(level);
  return decorateQuestion(core, {
    stage: stageId,
    topicId,
    topicName: topic.name,
    skillId: skill.id,
    skillName: skill.name,
    syllabusArea: skill.syllabusArea,
    difficultyLevel: level,
    source: skill.source, // "legacy-adapter" | undefined(→"native")
    prerequisiteSkillIds: skill.prerequisiteSkillIds,
    nextSkillIds: skill.nextSkillIds,
  });
}

// One question from a LEGACY engine (e.g. the math-examples demo), wrapped in
// the same rich shape so the rest of the game treats it identically.
export function generateLegacyQuestion(legacyTopic, difficultyLevel, skillId) {
  const engine = getEngine(legacyTopic);
  const core = engine.generate();
  const level = clampDifficulty(difficultyLevel ?? 2);
  return decorateQuestion(core, {
    stage: "legacy",
    topicId: legacyTopic,
    topicName: engine.title,
    skillId: skillId || `legacy:${legacyTopic}`,
    skillName: engine.title,
    syllabusArea: "legacy",
    difficultyLevel: level,
  });
}

/**
 * Build a set of questions for an encounter.
 *
 * `config` is the encounter's mathsChallenge config, either:
 *   - curriculum: { stage, topicId, skillId?, questionCount }
 *   - legacy:     { topic, questionCount }
 *
 * `resolveDifficulty(skillId)` lets the caller (the encounter, reading the
 * player's performance profile) decide the difficulty per skill. The registry
 * never imports the progress store; difficulty is injected.
 */
export function buildEncounterQuestions(config, resolveDifficulty) {
  const resolve = typeof resolveDifficulty === "function" ? resolveDifficulty : () => 2;
  const count = config.questionCount ?? 5;
  const out = [];

  for (let i = 0; i < count; i++) {
    if (config.stage && config.topicId) {
      const topic = getTopic(config.stage, config.topicId);
      if (!topic) continue;
      const skills = config.skillId
        ? topic.skills.filter((k) => k.id === config.skillId)
        : topic.skills;
      const skill = skills[i % skills.length] || topic.skills[0];
      const level = clampDifficulty(resolve(skill.id));
      out.push(generateCurriculumQuestion(config.stage, config.topicId, skill.id, level));
    } else if (config.topic) {
      const skillId = `legacy:${config.topic}`;
      const level = clampDifficulty(resolve(skillId));
      out.push(generateLegacyQuestion(config.topic, level, skillId));
    }
  }
  return out;
}
