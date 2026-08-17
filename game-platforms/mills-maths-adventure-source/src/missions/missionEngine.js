/**
 * MISSION ENGINE — the pure "brain" of the teacher-assignment system.
 *
 * Responsibilities (all pure / side-effect free):
 *   - turn a mission's stage/topic/skill filters into a concrete list of skills
 *   - generate questions ONLY from those filters, respecting difficultyRange
 *   - use the adaptive selector (clamped to the range) when adaptiveOn is true
 *   - create and advance a mission-progress object as questions are answered
 *   - decide when a mission is complete (by completionCriteria)
 *
 * What this file deliberately does NOT do:
 *   - touch localStorage or the progress store
 *   - award XP / coins / badges
 *   - import React or anything from the game/world/UI layers
 *
 * Persistence and reward-granting live in the PROGRESS STORE, which calls these
 * pure functions. This mirrors the existing split between adaptiveSelector.js
 * (pure) and progress/store.js (stateful), and keeps the maths/curriculum logic
 * cleanly separated from game/progress code. A Firebase teacher portal can reuse
 * this engine unchanged — only the store's read/write functions would change.
 */
import {
  getStage,
  getTopic,
  generateCurriculumQuestion,
} from "../maths/curriculum/curriculumRegistry.js";
import { clampDifficulty } from "../maths/curriculum/shared/curriculumUtils.js";
import {
  suggestDifficultyInRange,
  clampToRange,
} from "../maths/adaptive/adaptiveSelector.js";
import { COMPLETION_TYPES } from "../data/missions.js";

/**
 * Resolve a mission's filters into a flat list of concrete targets:
 *   [{ stage, topicId, topicName, skillId, skillName }, ...]
 *
 * Logic:
 *   - stages:         the mission's stages (must exist)
 *   - topics:         selectedTopics, or ALL topics of the stage if none chosen
 *   - skills:         selectedSkills that belong to the topic, or ALL of the
 *                     topic's skills if no skill was chosen / none match
 */
export function getMissionTargets(mission) {
  const targets = [];
  if (!mission || !Array.isArray(mission.stages)) return targets;

  const wantTopics = mission.selectedTopics || [];
  const wantSkills = mission.selectedSkills || [];

  for (const stageId of mission.stages) {
    const stage = getStage(stageId);
    if (!stage) continue;

    const topicIds = wantTopics.length
      ? wantTopics
      : stage.topics.map((t) => t.id);

    for (const topicId of topicIds) {
      const topic = getTopic(stageId, topicId);
      if (!topic) continue;

      const skills = wantSkills.length
        ? topic.skills.filter((k) => wantSkills.includes(k.id))
        : topic.skills;
      const useSkills = skills.length ? skills : topic.skills;

      for (const skill of useSkills) {
        targets.push({
          stage: stageId,
          topicId,
          topicName: topic.name,
          skillId: skill.id,
          skillName: skill.name,
        });
      }
    }
  }
  return targets;
}

// True if a mission can actually produce at least one question.
export function missionCanGenerate(mission) {
  return getMissionTargets(mission).length > 0;
}

// True if the given encounter topic should be driven by this mission, i.e. the
// mission draws from that (stage, topic). Used by the encounter wiring to decide
// whether an NPC's maths should be filtered by the active mission.
export function missionCoversTopic(mission, stageId, topicId) {
  if (!mission) return false;
  return getMissionTargets(mission).some(
    (t) => t.stage === stageId && t.topicId === topicId
  );
}

/**
 * Decide the difficulty to serve for one skill in a mission.
 *   - adaptiveOn:  start from the player's working difficulty for that skill
 *                  (read via the injected getWorkingDifficulty), let the
 *                  adaptive selector nudge it, then clamp into the range.
 *   - adaptiveOff: use the bottom of the range (steady, teacher-fixed).
 * The difficulty NEVER leaves the mission's [min, max] range.
 *
 * `getProfile(skillId)` is injected so this stays pure (no store import). It may
 * return undefined; we then fall back to the range minimum.
 */
export function resolveMissionDifficulty(mission, skillId, getProfile) {
  const { min, max } = mission.difficultyRange;
  if (!mission.adaptiveOn) {
    return clampToRange(min, min, max);
  }
  const profile = typeof getProfile === "function" ? getProfile(skillId) : null;
  if (!profile) return clampToRange(min, min, max);
  return suggestDifficultyInRange(profile, min, max);
}

/**
 * Generate ONE mission question. `getProfile` is optional (adaptive input).
 * Rotates through the mission's targets using `seed` so a set of questions
 * spreads across the selected skills.
 */
export function buildMissionQuestion(mission, getProfile, seed = 0) {
  const targets = getMissionTargets(mission);
  if (!targets.length) return null;
  const target = targets[seed % targets.length];
  const level = resolveMissionDifficulty(mission, target.skillId, getProfile);
  return generateCurriculumQuestion(
    target.stage,
    target.topicId,
    target.skillId,
    clampDifficulty(level)
  );
}

/**
 * Build a SET of `count` mission questions (defaults to requiredQuestions),
 * each respecting the difficulty range and (optionally) adaptive difficulty.
 */
export function buildMissionQuestions(mission, count, getProfile) {
  const n = count ?? mission.requiredQuestions ?? 10;
  const out = [];
  for (let i = 0; i < n; i++) {
    const q = buildMissionQuestion(mission, getProfile, i);
    if (q) out.push(q);
  }
  return out;
}

// ---- Mission progress (pure data the store persists) --------------------

/**
 * A fresh progress record for a mission.
 *   answered   questions attempted so far
 *   correct    questions answered correctly so far
 *   xpEarned   running XP attributed to this mission (for display)
 *   complete   has the completion criteria been met
 *   rewarded   have the rewards been granted (guards "award once")
 */
export function createMissionProgress(mission) {
  return {
    missionId: mission.missionId,
    answered: 0,
    correct: 0,
    xpEarned: 0,
    complete: false,
    rewarded: false,
    startedAt: Date.now(),
    completedAt: null,
  };
}

// How many questions still count toward completion.
export function completionTarget(mission) {
  const c = mission.completionCriteria || {};
  return Math.max(1, Math.round(c.count ?? mission.requiredQuestions ?? 10));
}

// Has this progress met the mission's completion criteria?
export function isMissionComplete(progress, mission) {
  if (!progress) return false;
  const target = completionTarget(mission);
  const type = mission.completionCriteria?.type || COMPLETION_TYPES.ANSWERED;
  const counter = type === COMPLETION_TYPES.CORRECT ? progress.correct : progress.answered;
  return counter >= target;
}

/**
 * Record one attempt against a mission's progress. PURE: returns a NEW progress
 * object (does not mutate). The store decides whether this newly completed the
 * mission and, if so, grants rewards exactly once (using the `rewarded` flag).
 *
 *   prev       previous progress (or null → a fresh one is created)
 *   mission    the active mission
 *   isCorrect  was the answer correct
 *   xpEarned   XP earned for this question (for the running display total)
 */
export function recordMissionAttempt(prev, mission, isCorrect, xpEarned = 0) {
  const base = prev && prev.missionId === mission.missionId
    ? { ...prev }
    : createMissionProgress(mission);

  const wasComplete = base.complete;
  base.answered += 1;
  if (isCorrect) base.correct += 1;
  base.xpEarned += Math.max(0, Math.round(xpEarned));

  const nowComplete = isMissionComplete(base, mission);
  base.complete = nowComplete;
  if (nowComplete && !base.completedAt) base.completedAt = Date.now();

  return {
    progress: base,
    justCompleted: nowComplete && !wasComplete,
  };
}
