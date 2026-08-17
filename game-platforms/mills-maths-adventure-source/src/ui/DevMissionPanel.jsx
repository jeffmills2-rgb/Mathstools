import React, { useState } from "react";

import { useProgress } from "../progress/store.js";
import { useSession } from "../game/sessionStore.js";
import {
  getStages,
  getTopics,
} from "../maths/curriculum/curriculumRegistry.js";
import { getAllMissions } from "../data/missions.js";
import { getAllBadges, getBadge, decorateEarnedBadges } from "../data/badges.js";
import { completionTarget } from "../missions/missionEngine.js";
import { runMissionChecks } from "../dev/systemChecks.js";

/**
 * TEACHER MISSION SETUP (prototype) + MISSION TESTING.
 *
 * Lives inside the DevPanel. This is intentionally a rough prototype — it
 * proves the teacher → mission → student workflow without being the real
 * teacher portal. Everything here drives the SAME store/engine the game uses.
 */

// ---- Teacher Mission Setup ------------------------------------------------

export function TeacherMissionSetup() {
  const stages = getStages();
  const activateCustomMission = useProgress((s) => s.activateCustomMission);

  const [stage, setStage] = useState(stages[0]?.id || "");
  const topics = getTopics(stage);
  const [pickedTopics, setPickedTopics] = useState([]);
  const [pickedSkills, setPickedSkills] = useState([]);
  const [count, setCount] = useState(5);
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(4);
  const [adaptive, setAdaptive] = useState(true);
  const [badge, setBadge] = useState("");
  const [result, setResult] = useState(null);

  // Skills available given the picked topics (or all topics if none picked).
  const visibleTopics = pickedTopics.length
    ? topics.filter((t) => pickedTopics.includes(t.id))
    : topics;
  const availableSkills = visibleTopics.flatMap((t) =>
    (t.skills || []).map((k) => ({ ...k, topicName: t.name }))
  );

  function onStage(id) {
    setStage(id);
    setPickedTopics([]);
    setPickedSkills([]);
    setResult(null);
  }
  function toggle(list, setList, id) {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
    setResult(null);
  }

  function activate() {
    const raw = {
      title: `Custom: ${stage} ${pickedTopics.join("+") || "all topics"}`,
      description: "Teacher-built mission (prototype).",
      stages: [stage],
      selectedTopics: pickedTopics,
      selectedSkills: pickedSkills,
      difficultyRange: { min: Number(min), max: Number(max) },
      adaptiveOn: adaptive,
      requiredQuestions: Number(count),
      rewardXP: 60,
      rewardCoins: 30,
      rewardBadge: badge || null,
    };
    const r = useProgress.getState().activateCustomMission(raw);
    setResult(r);
  }

  return (
    <div className="dev-section">
      <div className="dev-subtitle">Teacher mission setup (prototype)</div>

      <div className="dev-row">
        <select value={stage} onChange={(e) => onStage(e.target.value)}>
          {stages.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="dev-line">Topics:</div>
      <div className="dev-checkbox-row">
        {topics.map((t) => (
          <label key={t.id}>
            <input
              type="checkbox"
              checked={pickedTopics.includes(t.id)}
              onChange={() => toggle(pickedTopics, setPickedTopics, t.id)}
            />
            {t.name}
          </label>
        ))}
      </div>

      <div className="dev-line">Skills (empty = all skills of chosen topics):</div>
      <div className="dev-checkbox-row">
        {availableSkills.map((k) => (
          <label key={k.id}>
            <input
              type="checkbox"
              checked={pickedSkills.includes(k.id)}
              onChange={() => toggle(pickedSkills, setPickedSkills, k.id)}
            />
            {k.name}
          </label>
        ))}
      </div>

      <div className="dev-row">
        <label>Questions:&nbsp;
          <input
            type="number" min="1" max="50" value={count}
            style={{ width: 56 }}
            onChange={(e) => setCount(e.target.value)}
          />
        </label>
        <label>Diff min:&nbsp;
          <select value={min} onChange={(e) => setMin(e.target.value)}>
            {[1, 2, 3, 4, 5].map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </label>
        <label>max:&nbsp;
          <select value={max} onChange={(e) => setMax(e.target.value)}>
            {[1, 2, 3, 4, 5].map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </label>
      </div>

      <div className="dev-row">
        <label>
          <input type="checkbox" checked={adaptive} onChange={(e) => setAdaptive(e.target.checked)} />
          &nbsp;Adaptive
        </label>
        <label>Badge:&nbsp;
          <select value={badge} onChange={(e) => setBadge(e.target.value)}>
            <option value="">— none —</option>
            {getAllBadges().map((b) => (
              <option key={b.badgeId} value={b.badgeId}>{b.icon} {b.badgeName}</option>
            ))}
          </select>
        </label>
        <button onClick={activate}>Activate mission</button>
      </div>

      {result && (
        <div className={`dev-line ${result.ok ? "" : "dev-danger"}`}>
          {result.ok
            ? "✓ Mission activated and saved locally."
            : `✗ Invalid: ${result.problems.join("; ")}`}
        </div>
      )}
    </div>
  );
}

// ---- Mission Testing ------------------------------------------------------

export function MissionTesting() {
  const getActiveMission = useProgress((s) => s.getActiveMission);
  const missionProgress = useProgress((s) => s.missionProgress);
  const completedMissions = useProgress((s) => s.completedMissions);
  const earnedBadges = useProgress((s) => s.earnedBadges);
  useProgress((s) => s.activeMissionId);

  const activateMission = useProgress((s) => s.activateMission);
  const clearActiveMission = useProgress((s) => s.clearActiveMission);
  const resetMissionProgress = useProgress((s) => s.resetMissionProgress);
  const recordMissionAttempt = useProgress((s) => s.recordMissionAttempt);

  const startGame = useSession((s) => s.startGame);
  const phase = useSession((s) => s.phase);
  const openEncounter = useSession((s) => s.openEncounter);

  const [checks, setChecks] = useState(null);
  const mission = getActiveMission();
  const sampleMissions = getAllMissions();

  function playActive() {
    if (phase !== "playing") startGame();
    openEncounter("mission-active");
  }

  return (
    <div className="dev-section">
      <div className="dev-subtitle">Mission testing</div>

      <div className="dev-line">Activate a sample mission:</div>
      <div className="dev-row">
        {sampleMissions.map((m) => (
          <button key={m.missionId} onClick={() => activateMission(m.missionId)}>
            {m.title}
          </button>
        ))}
      </div>

      <div className="dev-row">
        <button onClick={playActive} disabled={!mission}>▶ Play active mission</button>
        <button onClick={clearActiveMission}>Clear active mission</button>
        <button onClick={resetMissionProgress} disabled={!mission}>Reset mission progress</button>
      </div>

      {/* Inspect current mission progress */}
      {mission ? (
        <div className="dev-sample">
          <div className="dev-line">active: <code>{mission.title}</code></div>
          <div className="dev-line">
            stages <code>{mission.stages.join(",")}</code> · topics <code>{mission.selectedTopics.join(",") || "all"}</code>
          </div>
          <div className="dev-line">
            skills <code>{mission.selectedSkills.join(",") || "all"}</code>
          </div>
          <div className="dev-line">
            difficulty <code>{mission.difficultyRange.min}–{mission.difficultyRange.max}</code> · adaptive <code>{String(mission.adaptiveOn)}</code>
          </div>
          <div className="dev-line">
            progress <code>{missionProgress?.answered ?? 0}</code> answered · <code>{missionProgress?.correct ?? 0}</code> correct · target <code>{completionTarget(mission)}</code>
          </div>
          <div className="dev-line">
            complete <code>{String(missionProgress?.complete ?? false)}</code> · rewarded <code>{String(missionProgress?.rewarded ?? false)}</code>
          </div>
        </div>
      ) : (
        <div className="dev-line">No active mission.</div>
      )}

      {/* Simulate answers (progress only) + finalize (decides pass/complete) */}
      <div className="dev-row">
        <button onClick={() => recordMissionAttempt(true, 15)} disabled={!mission}>
          Simulate correct
        </button>
        <button onClick={() => recordMissionAttempt(false, 0)} disabled={!mission}>
          Simulate incorrect
        </button>
      </div>
      <div className="dev-row">
        <button
          onClick={() => { const p = useProgress.getState().missionProgress; useProgress.getState().finalizeActiveMission({ correct: p?.answered ?? 0, total: p?.answered ?? 0 }); }}
          disabled={!mission}
        >
          Finalize (use answered as score)
        </button>
        <button
          onClick={() => { const m = useProgress.getState().getActiveMission(); const t = m?.requiredQuestions ?? 5; useProgress.getState().finalizeActiveMission({ correct: t, total: t }); }}
          disabled={!mission}
        >
          Finalize as PASS
        </button>
      </div>

      <div className="dev-line">completed missions: <code>{completedMissions.join(", ") || "none"}</code></div>

      {/* Earned badges */}
      <div className="dev-line">Earned badges:</div>
      <div className="dev-row">
        {earnedBadges.length === 0 && <span className="dev-line">none yet</span>}
        {decorateEarnedBadges(earnedBadges).map((b) => (
          <span key={b.badgeId} title={b.description}>{b.icon} {b.badgeName}</span>
        ))}
      </div>

      {/* Mission system checks */}
      <div className="dev-row">
        <button onClick={() => setChecks(runMissionChecks(useProgress.getState()))}>
          Run mission system checks
        </button>
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
