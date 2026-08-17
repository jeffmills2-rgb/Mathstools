import React, { useEffect, useState } from "react";

import { useProgress } from "../progress/store.js";
import { useSession } from "../game/sessionStore.js";
import { completionTarget } from "../missions/missionEngine.js";
import { getBadge, getAllBadges, decorateEarnedBadges } from "../data/badges.js";
import { getChainForMission } from "../data/npcQuestChains.js";
import { getInteractable } from "../data/interactables.js";
import { getZoneForNpc } from "../data/worldZones.js";
import { MAIN_QUEST, resolveMainQuest, mainQuestSnapshot } from "../data/mainQuest.js";

/**
 * STUDENT MISSION VIEW (Phase 2D).
 *
 * Three small, reusable pieces of student-facing UI:
 *   - MissionTracker : compact card for the HUD (title, progress, adaptive,
 *                      reward, and a "Start mission" button).
 *   - MissionDetails : fuller card for the Quest Log.
 *   - BadgeShelf     : the student's earned badges (their "profile" area).
 *
 * They read the SAME progress store the rest of the game uses, so what the
 * student sees always matches the real saved state.
 */

// Work out how far through the mission the student is, honouring the mission's
// completion criteria (answered vs correct).
function missionStats(mission, progress) {
  const target = completionTarget(mission);
  const useCorrect = mission.completionCriteria?.type === "correct";
  const counter = useCorrect ? progress?.correct ?? 0 : progress?.answered ?? 0;
  const pct = Math.min(100, Math.round((counter / target) * 100));
  return { target, counter, pct, useCorrect };
}

function topicFocus(mission) {
  if (mission.selectedTopics?.length) return mission.selectedTopics.join(", ");
  return mission.stages.join(", ");
}

/** Compact mission card for the HUD. Renders nothing if no mission is active. */
export function MissionTracker() {
  const getActiveMission = useProgress((s) => s.getActiveMission);
  const missionProgress = useProgress((s) => s.missionProgress);
  const completedMissions = useProgress((s) => s.completedMissions);
  // Subscribe to activeMissionId so this re-renders when a mission is (de)activated.
  useProgress((s) => s.activeMissionId);

  const startGame = useSession((s) => s.startGame);
  const phase = useSession((s) => s.phase);
  const openEncounter = useSession((s) => s.openEncounter);

  const mission = getActiveMission();
  const done = mission
    ? Boolean(missionProgress?.complete) || completedMissions.includes(mission.missionId)
    : false;
  // The card auto-hides 3 seconds after it appears. A new mission — or this
  // mission changing to "complete" — makes a new key, so the card shows again
  // (for another 3s). The × hides it immediately.
  const cardKey = mission ? `${mission.missionId}:${done ? "c" : "a"}` : null;
  const [hiddenKey, setHiddenKey] = useState(null);
  useEffect(() => {
    if (!cardKey || cardKey === hiddenKey) return undefined;
    const t = setTimeout(() => setHiddenKey(cardKey), 3000);
    return () => clearTimeout(t);
  }, [cardKey, hiddenKey]);

  if (!mission) return null;
  if (cardKey === hiddenKey) return null; // auto-hidden (3s) or × dismissed

  const { target, counter, pct, useCorrect } = missionStats(mission, missionProgress);
  const badge = mission.rewardBadge ? getBadge(mission.rewardBadge) : null;

  // NPC-chain missions must be played by FINDING the character — no shortcut
  // "Start" button on the HUD card. Free-choice board missions keep a Continue.
  const chainInfo = getChainForMission(mission.missionId);
  const npc = chainInfo ? getInteractable(chainInfo.npcId) : null;
  const npcZone = chainInfo ? getZoneForNpc(chainInfo.npcId) : null;

  function start() {
    if (phase !== "playing") startGame();
    openEncounter("mission-active");
  }

  return (
    <div className="hud-panel hud-mission">
      <button
        className="mission-card-close"
        onClick={() => setHiddenKey(cardKey)}
        title="Hide this card"
        aria-label="Hide mission card"
      >
        ✕
      </button>
      <span className="tracker-label">🎯 Mission</span>
      <div className="tracker-title">{mission.title}</div>
      <div className="mission-meta">
        <span className="mission-focus">{topicFocus(mission)}</span>
        {mission.adaptiveOn && <span className="mission-adaptive">adaptive</span>}
      </div>
      <div className="tracker-progress">
        <div className="tracker-bar">
          <div className="tracker-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="tracker-count">
          {counter}/{target} {useCorrect ? "correct" : ""}
        </span>
      </div>
      <div className="mission-reward-line">
        Reward: {mission.rewardXP} XP · {mission.rewardCoins} 🪙
        {badge && <span> · {badge.icon} {badge.badgeName}</span>}
      </div>
      {done ? (
        <div className="mission-complete-tag">✓ Completed</div>
      ) : chainInfo ? (
        // Must visit the NPC — guide the student there instead of a Start button.
        <div className="mission-find-npc">
          🚶 Find {npc ? npc.name : "the character"}
          {npcZone ? ` in ${npcZone.name}` : ""} to begin
        </div>
      ) : (
        <button className="mission-start-btn" onClick={start}>
          ▶ Start mission
        </button>
      )}
    </div>
  );
}

/**
 * Main Quest panel for the Quest Log (Phase 2I). Shows the "Unlock Number
 * Island" journey as a checklist with the CURRENT step highlighted. Steps are
 * derived from real progress so the list always matches the save.
 */
export function MainQuestPanel() {
  const completedMissions = useProgress((s) => s.completedMissions);
  const earnedBadges = useProgress((s) => s.earnedBadges);
  const completedEncounters = useProgress((s) => s.completedEncounters);
  const sageMet = useProgress((s) => s.sageMet);
  const championClaimed = useProgress((s) => s.championClaimed);

  const snap = mainQuestSnapshot({
    completedMissions, earnedBadges, completedEncounters, sageMet, championClaimed,
  });
  const { stepIndex, complete } = resolveMainQuest(snap);

  return (
    <div className="mainquest-panel">
      <h3 className="questlog-subhead">🗺️ Main Quest: {MAIN_QUEST.title}</h3>
      <ul className="mainquest-steps">
        {MAIN_QUEST.steps.map((step, i) => {
          const done = step.done(snap);
          const current = !complete && i === stepIndex;
          const cls = done ? "mq-done" : current ? "mq-current" : "mq-todo";
          return (
            <li key={step.id} className={`mainquest-step ${cls}`}>
              <span className="mq-mark">{done ? "☑" : current ? "➤" : "☐"}</span>
              <span className="mq-label">{step.label}</span>
              {current && <span className="mq-now">now</span>}
            </li>
          );
        })}
        <li className={`mainquest-step ${complete ? "mq-current" : "mq-todo"}`}>
          <span className="mq-mark">{complete ? "🏆" : "☐"}</span>
          <span className="mq-label">Become the Island Champion</span>
          {complete && <span className="mq-now">done</span>}
        </li>
      </ul>
    </div>
  );
}

/** Fuller mission details for the Quest Log. */
export function MissionDetails() {
  const getActiveMission = useProgress((s) => s.getActiveMission);
  const missionProgress = useProgress((s) => s.missionProgress);
  const completedMissions = useProgress((s) => s.completedMissions);
  useProgress((s) => s.activeMissionId);

  const mission = getActiveMission();

  return (
    <div className="questlog-missions">
      <h3 className="questlog-subhead">🎯 Mission</h3>
      {!mission ? (
        <p className="questlog-empty">No mission assigned yet.</p>
      ) : (
        (() => {
          const { target, counter, pct, useCorrect } = missionStats(mission, missionProgress);
          const done = missionProgress?.complete || completedMissions.includes(mission.missionId);
          const badge = mission.rewardBadge ? getBadge(mission.rewardBadge) : null;
          return (
            <div className={`mission-card ${done ? "mission-done" : ""}`}>
              <div className="quest-card-top">
                <span className="quest-card-title">{mission.title}</span>
                <span className={`quest-status-pill ${done ? "pill-completed" : "pill-active"}`}>
                  {done ? "completed" : "active"}
                </span>
              </div>
              <p className="quest-card-desc">{mission.description}</p>
              <div className="mission-meta">
                <span className="mission-focus">Focus: {topicFocus(mission)}</span>
                <span className="mission-adaptive">
                  Adaptive: {mission.adaptiveOn ? "on" : "off"}
                </span>
                <span className="mission-focus">
                  Difficulty {mission.difficultyRange.min}–{mission.difficultyRange.max}
                </span>
              </div>
              <div className="quest-progress-bar">
                <div className="quest-progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <div className="mission-progress-text">
                {counter} / {target} {useCorrect ? "correct" : "questions"} complete
              </div>
              <div className="quest-rewards">
                Reward: {mission.rewardXP} XP · {mission.rewardCoins} 🪙
                {badge && <span> · {badge.icon} {badge.badgeName}</span>}
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
}

/** The student's earned badges (and the rest of the catalogue, greyed out). */
export function BadgeShelf() {
  const earnedBadges = useProgress((s) => s.earnedBadges);
  const earned = decorateEarnedBadges(earnedBadges);
  const earnedIds = new Set(earned.map((b) => b.badgeId));
  const locked = getAllBadges().filter((b) => !earnedIds.has(b.badgeId));

  return (
    <div className="badge-shelf">
      <h3 className="questlog-subhead">🏅 Badges ({earned.length})</h3>
      <div className="badge-grid">
        {earned.map((b) => (
          <div key={b.badgeId} className="badge-tile earned" title={b.description}>
            <span className="badge-icon">{b.icon}</span>
            <span className="badge-name">{b.badgeName}</span>
          </div>
        ))}
        {locked.map((b) => (
          <div key={b.badgeId} className="badge-tile locked" title={`Locked — ${b.description}`}>
            <span className="badge-icon">🔒</span>
            <span className="badge-name">{b.badgeName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
