import React, { useState } from "react";

import { useProgress } from "../progress/store.js";
import { requestTeleport } from "../game/sessionStore.js";
import {
  mainQuestSnapshot,
  resolveMainQuest,
  mainQuestGuidance,
  mainQuestTarget,
} from "../data/mainQuest.js";
import { runStoryChecks, runRouteChecks } from "../dev/systemChecks.js";
import { TOPIC_WORLD_ROUTES, routeForMission } from "../data/topicWorldRoutes.js";
import { getInteractable } from "../data/interactables.js";

/**
 * STORY / ONBOARDING testing (DevPanel section, Phase 2I). Inspect the current
 * main-quest step + flags, jump steps for testing, teleport to the current
 * target, reset onboarding / main-quest flags, and run the story checks.
 */
export function StoryTesting() {
  const onboardingSeen = useProgress((s) => s.onboardingSeen);
  const sageMet = useProgress((s) => s.sageMet);
  const championClaimed = useProgress((s) => s.championClaimed);
  const seenUnlocks = useProgress((s) => s.seenUnlocks);
  const completedMissions = useProgress((s) => s.completedMissions);
  const earnedBadges = useProgress((s) => s.earnedBadges);
  const completedEncounters = useProgress((s) => s.completedEncounters);

  const setOnboardingSeen = useProgress((s) => s.setOnboardingSeen);
  const setSageMet = useProgress((s) => s.setSageMet);
  const claimChampion = useProgress((s) => s.claimChampion);
  const resetOnboarding = useProgress((s) => s.resetOnboarding);
  const resetMainQuestFlags = useProgress((s) => s.resetMainQuestFlags);
  const activateMission = useProgress((s) => s.activateMission);
  const recordMissionAttempt = useProgress((s) => s.recordMissionAttempt);

  const [checks, setChecks] = useState(null);

  const snap = mainQuestSnapshot({
    onboardingSeen, sageMet, championClaimed, seenUnlocks,
    completedMissions, earnedBadges, completedEncounters,
  });
  const { stepIndex, step, complete } = resolveMainQuest(snap);
  const guide = mainQuestGuidance(snap);

  // Instant-complete an NPC mission with a PASSING score (advances the journey).
  function finishMission(missionId) {
    activateMission(missionId);
    const m = useProgress.getState().getActiveMission();
    const total = m ? m.requiredQuestions : 1;
    for (let i = 0; i < total; i++) recordMissionAttempt(true, 10);
    useProgress.getState().finalizeActiveMission({ correct: total, total });
  }

  function teleportToTarget() {
    const t = mainQuestTarget(snap);
    if (t) requestTeleport(t.position[0], t.position[1]);
  }

  return (
    <div className="dev-section">
      <div className="dev-subtitle">Story / onboarding (Phase 2I)</div>

      {/* Inspect current main-quest state. */}
      <div className="dev-line">
        step: <code>{complete ? "champion ✓" : `${stepIndex + 1} — ${step.id}`}</code>
      </div>
      <div className="dev-line">next: <code>{guide.text}</code> → <code>{guide.targetId || "—"}</code></div>
      <div className="dev-line">
        flags: onboardingSeen <code>{String(onboardingSeen)}</code> · sageMet <code>{String(sageMet)}</code> · champion <code>{String(championClaimed)}</code>
      </div>
      <div className="dev-line">seenUnlocks: <code>{seenUnlocks.length ? seenUnlocks.join(", ") : "none"}</code></div>

      {/* Mark a step for testing. */}
      <div className="dev-line" style={{ marginTop: 6 }}>Mark step (testing):</div>
      <div className="dev-row">
        <button onClick={() => setSageMet(true)}>Meet Sage</button>
        <button onClick={() => finishMission("npc-pip-1")}>Finish Pip</button>
        <button onClick={() => finishMission("npc-fern-1")}>Finish Fern</button>
        <button onClick={() => finishMission("npc-alby-1")}>Finish Alby</button>
        <button onClick={() => claimChampion()}>Claim Champion</button>
      </div>

      {/* Navigation + onboarding replay. */}
      <div className="dev-row">
        <button onClick={teleportToTarget}>Teleport to current target</button>
        <button onClick={() => setOnboardingSeen(false)}>Show welcome again</button>
      </div>

      <div className="dev-row">
        <button className="dev-danger" onClick={resetOnboarding}>Reset onboarding</button>
        <button className="dev-danger" onClick={resetMainQuestFlags}>Reset main-quest flags</button>
        <button onClick={() => setChecks(runStoryChecks(useProgress.getState()))}>Run story checks</button>
      </div>

      {checks && (
        <div className="dev-test-results">
          {checks.map((c) => (
            <div key={c.name} className={`dev-test-row ${c.pass ? "pass" : "fail"}`}>
              {c.pass ? "✓" : "✗"} {c.name} — {c.detail}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * TOPIC ROUTES & TEACHER-MISSION testing (DevPanel, Phase 2J). Inspect the
 * topic→world routes, see the active teacher/free-choice mission + where it
 * routes, teleport to its target, and reset teacher/free missions separately
 * from the main story.
 */
export function RouteTesting() {
  const getActiveMission = useProgress((s) => s.getActiveMission);
  const completedMissions = useProgress((s) => s.completedMissions);
  const resetFreeChoiceMissions = useProgress((s) => s.resetFreeChoiceMissions);
  useProgress((s) => s.activeMissionId);
  const [checks, setChecks] = useState(null);

  const active = getActiveMission();
  const isTeacher = active && active.kind !== "story";
  const route = isTeacher ? routeForMission(active) : null;
  const target = route ? getInteractable(route.targetId) : null;

  function teleportToMissionTarget() {
    if (target) requestTeleport(target.position[0], target.position[1]);
  }

  return (
    <div className="dev-section">
      <div className="dev-subtitle">Topic routes & teacher missions (Phase 2J)</div>

      <div className="dev-line">Routes:</div>
      {TOPIC_WORLD_ROUTES.map((r) => (
        <div key={r.topicId} className="dev-line">
          <code>{r.topicId}</code> → {r.displayName} · <code>{r.guidanceTarget}</code> (fallback <code>{r.fallbackTarget}</code>)
        </div>
      ))}

      <div className="dev-line" style={{ marginTop: 6 }}>Active mission:</div>
      {active ? (
        <div className="dev-sample">
          <div className="dev-line">
            <code>{active.title}</code> · kind <code>{active.kind}</code>
          </div>
          <div className="dev-line">
            topics <code>{active.selectedTopics.join(",") || "all"}</code>
          </div>
          {isTeacher && route && (
            <div className="dev-line">
              routes to <code>{route.targetId}</code>{route.fallback ? " (fallback)" : ""}{target ? ` — ${target.name}` : ""}
            </div>
          )}
          <div className="dev-line">
            done <code>{String(completedMissions.includes(active.missionId))}</code>
          </div>
        </div>
      ) : (
        <div className="dev-line">No active mission.</div>
      )}

      <div className="dev-row">
        <button onClick={teleportToMissionTarget} disabled={!target}>Teleport to mission target</button>
        <button className="dev-danger" onClick={resetFreeChoiceMissions}>Reset teacher/free missions</button>
        <button onClick={() => setChecks(runRouteChecks(useProgress.getState()))}>Run route checks</button>
      </div>

      {checks && (
        <div className="dev-test-results">
          {checks.map((c) => (
            <div key={c.name} className={`dev-test-row ${c.pass ? "pass" : "fail"}`}>
              {c.pass ? "✓" : "✗"} {c.name} — {c.detail}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
