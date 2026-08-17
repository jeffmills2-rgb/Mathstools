/**
 * UNLOCK ENGINE — pure derivation of world-progression state from EXISTING
 * progress (completed missions, earned badges, completed encounters). No new
 * persisted state: unlocks/quest-chain steps are computed, so they automatically
 * survive a refresh because their inputs do.
 *
 * Pure: no React, no stores. Takes a plain `snapshot`:
 *   { completedMissions: [], earnedBadges: [{badgeId}], completedEncounters: [] }
 */
import { WORLD_UNLOCKS } from "../data/worldUnlocks.js";
import { NPC_QUEST_CHAINS, getChainForMission } from "../data/npcQuestChains.js";

function badgeIds(snapshot) {
  return (snapshot.earnedBadges || []).map((b) => b.badgeId);
}

// Is a single unlock's `requires` satisfied by the snapshot?
export function isUnlocked(unlock, snapshot) {
  const r = unlock.requires || {};
  const cm = snapshot.completedMissions || [];
  const eb = badgeIds(snapshot);
  const ce = snapshot.completedEncounters || [];
  const missionsOk = (r.completedMissions || []).every((id) => cm.includes(id));
  const badgesOk = (r.badges || []).every((id) => eb.includes(id));
  const encOk = (r.completedEncounters || []).every((id) => ce.includes(id));
  return missionsOk && badgesOk && encOk;
}

// Every unlock decorated with its current state.
export function getUnlockStates(snapshot) {
  return WORLD_UNLOCKS.map((u) => ({ ...u, unlocked: isUnlocked(u, snapshot) }));
}

export function isUnlockedById(id, snapshot) {
  const u = WORLD_UNLOCKS.find((x) => x.id === id);
  return u ? isUnlocked(u, snapshot) : false;
}

// ---- NPC quest chains -----------------------------------------------------

/**
 * Resolve a chain to the current step: the first step whose mission has NOT
 * been completed. Returns { index, step, complete } — complete=true when every
 * step's mission is in completedMissions.
 */
export function resolveChainStep(chain, completedMissions = []) {
  const steps = (chain && chain.steps) || [];
  for (let i = 0; i < steps.length; i++) {
    if (!completedMissions.includes(steps[i].missionId)) {
      return { index: i, step: steps[i], complete: false };
    }
  }
  return { index: steps.length, step: null, complete: true };
}

/**
 * What should happen when the student interacts with this NPC right now:
 *   - a mission step → { kind: "mission", missionId, step }
 *   - all complete   → { kind: "complete", encounterId }
 */
export function getNpcAction(chain, completedMissions = []) {
  const { step, complete } = resolveChainStep(chain, completedMissions);
  if (complete) return { kind: "complete", encounterId: chain.completionEncounter };
  return { kind: "mission", missionId: step.missionId, step };
}

const NPC_LABELS = { pip: "Pip", fern: "Fern", alby: "Alby" };

/**
 * Light "what next?" guidance: returns { text, targetId } where targetId is the
 * interactable the student should head to. Keeps students oriented without
 * clutter. Pure.
 */
export function getGuidance(snapshot = {}) {
  const cm = snapshot.completedMissions || [];
  const activeIncomplete =
    snapshot.activeMissionId && !(snapshot.missionProgress && snapshot.missionProgress.complete);
  if (activeIncomplete) {
    // If the active mission belongs to an NPC, guide the student TO that NPC
    // (they must find the character). Otherwise it's a free-choice board mission.
    const chainInfo = getChainForMission(snapshot.activeMissionId);
    if (chainInfo) {
      return { text: `Find ${NPC_LABELS[chainInfo.npcId] || "the character"}`, targetId: chainInfo.npcId };
    }
    return { text: "Continue your active mission", targetId: "mission-board" };
  }
  for (const npcId of ["pip", "fern", "alby"]) {
    const chain = NPC_QUEST_CHAINS[npcId];
    if (chain && !resolveChainStep(chain, cm).complete) {
      return { text: `Talk to ${NPC_LABELS[npcId]}`, targetId: npcId };
    }
  }
  return { text: "Great work! Explore the island and the Mission Board.", targetId: "mission-board" };
}
