import React, { useEffect, useState } from "react";

import { useProgress, deriveLevel } from "../progress/store.js";
import { useSession } from "../game/sessionStore.js";
import { ENCOUNTERS } from "../data/encounters.js";
import { getAllQuests } from "../data/quests.js";
import { getQuestStatus, questProgress } from "../quests/questEngine.js";
import { runSystemChecks } from "../dev/systemChecks.js";
import {
  getStages,
  getTopics,
  generateCurriculumQuestion,
} from "../maths/curriculum/curriculumRegistry.js";
import { suggestDifficulty } from "../maths/adaptive/adaptiveSelector.js";
import { TeacherMissionSetup, MissionTesting } from "./DevMissionPanel.jsx";
import { AreaTesting } from "./DevAreaPanel.jsx";
import { RealEngineTesting } from "./DevRealEnginePanel.jsx";
import { WorldTesting } from "./DevWorldPanel.jsx";
import { StoryTesting, RouteTesting } from "./DevStoryPanel.jsx";
import { ResultsTesting } from "./DevResultsPanel.jsx";
import { CloudTesting } from "./DevCloudPanel.jsx";

/**
 * Developer testing panel.
 *
 * Opened by the "⚙ Dev" tab in the corner (primary method), or by pressing the
 * backtick (`) key (secondary shortcut). It is intentionally separate from the
 * normal game UI; delete <DevPanel /> from App.jsx to remove it for students.
 *
 * It lets you inspect: player progress, completed encounters, active &
 * completed quests, and the current encounter/proximity state — and act on
 * them (grant rewards, complete encounters, jump into any encounter, run the
 * system checks, reset).
 */
export default function DevPanel() {
  const [open, setOpen] = useState(false);
  const [checks, setChecks] = useState(null);

  // Progress state + actions.
  const xp = useProgress((s) => s.xp);
  const coins = useProgress((s) => s.coins);
  const profile = useProgress((s) => s.profile);
  const completedEncounters = useProgress((s) => s.completedEncounters);
  const completedQuests = useProgress((s) => s.completedQuests);
  const awardRewards = useProgress((s) => s.awardRewards);
  const devCompleteEncounter = useProgress((s) => s.devCompleteEncounter);
  const resetProgress = useProgress((s) => s.resetProgress);
  const recordSkillAttempt = useProgress((s) => s.recordSkillAttempt);
  const skillProfiles = useProgress((s) => s.skillProfiles);

  // --- Curriculum / adaptive testing state ---
  const stages = getStages();
  const [curStage, setCurStage] = useState(stages[0]?.id || "");
  const topics = getTopics(curStage);
  const [curTopic, setCurTopic] = useState(topics[0]?.id || "");
  const topicSkills = (topics.find((t) => t.id === curTopic) || {}).skills || [];
  const [curSkill, setCurSkill] = useState(topicSkills[0]?.id || "");
  const [curLevel, setCurLevel] = useState(2);
  const [sampleQ, setSampleQ] = useState(null);

  // Keep the topic/skill selections valid when the stage/topic changes.
  function onStageChange(stageId) {
    setCurStage(stageId);
    const ts = getTopics(stageId);
    const t = ts[0];
    setCurTopic(t?.id || "");
    setCurSkill(t?.skills[0]?.id || "");
    setSampleQ(null);
  }
  function onTopicChange(topicId) {
    setCurTopic(topicId);
    const t = getTopics(curStage).find((x) => x.id === topicId);
    setCurSkill(t?.skills[0]?.id || "");
    setSampleQ(null);
  }

  // Session state + actions.
  const phase = useSession((s) => s.phase);
  const nearbyId = useSession((s) => s.nearbyId);
  const activeEncounterId = useSession((s) => s.activeEncounterId);
  const startGame = useSession((s) => s.startGame);
  const openEncounter = useSession((s) => s.openEncounter);
  const restart = useSession((s) => s.restart);

  const { level, xpIntoLevel, xpForLevel } = deriveLevel(xp);
  const snapshot = { completedEncounters, completedQuests };
  const quests = getAllQuests();
  const activeQuests = quests.filter((q) => getQuestStatus(q, snapshot) === "active");
  const lockedQuests = quests.filter((q) => getQuestStatus(q, snapshot) === "locked");

  // Toggle with the backtick key (secondary to the gear tab).
  useEffect(() => {
    function onKey(e) {
      if (e.key === "`") setOpen((o) => !o);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Opens an encounter's modal for testing. NOTE: this does NOT move the
  // player/camera in the world — it only opens the encounter UI.
  function testEncounter(id) {
    if (phase !== "playing") startGame();
    openEncounter(id);
  }

  function handleReset() {
    resetProgress();
    restart();
    setChecks(null);
  }

  return (
    <>
      <button className="dev-tab" onClick={() => setOpen((o) => !o)}>
        ⚙ Dev
      </button>

      {open && (
        <div className="dev-panel">
          <div className="dev-header">
            <strong>Developer Panel</strong>
            <button className="dev-close" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>

          {/* --- Player progress --- */}
          <div className="dev-section">
            <div className="dev-subtitle">Player progress</div>
            <div className="dev-line">name: <code>{profile.name || "—"}</code></div>
            <div className="dev-line">
              level <code>{level}</code> · xp <code>{xp}</code> ({xpIntoLevel}/{xpForLevel}) · coins <code>{coins}</code>
            </div>
          </div>

          {/* --- Current encounter / proximity state --- */}
          <div className="dev-section">
            <div className="dev-subtitle">Encounter state</div>
            <div className="dev-line">phase: <code>{phase}</code></div>
            <div className="dev-line">nearby: <code>{nearbyId || "—"}</code></div>
            <div className="dev-line">active encounter: <code>{activeEncounterId || "—"}</code></div>
          </div>

          {/* --- Completed encounters --- */}
          <div className="dev-section">
            <div className="dev-subtitle">Completed encounters ({completedEncounters.length})</div>
            <div className="dev-line">
              <code>{completedEncounters.length ? completedEncounters.join(", ") : "none"}</code>
            </div>
          </div>

          {/* --- Quests --- */}
          <div className="dev-section">
            <div className="dev-subtitle">Quests</div>
            <div className="dev-line">
              active: <code>{activeQuests.length ? activeQuests.map((q) => q.id).join(", ") : "none"}</code>
            </div>
            <div className="dev-line">
              completed: <code>{completedQuests.length ? completedQuests.join(", ") : "none"}</code>
            </div>
            <div className="dev-line">
              locked: <code>{lockedQuests.length ? lockedQuests.map((q) => q.id).join(", ") : "none"}</code>
            </div>
            {activeQuests.map((q) => {
              const { done, total } = questProgress(q, snapshot);
              return (
                <div key={q.id} className="dev-line">• {q.title}: {done}/{total}</div>
              );
            })}
          </div>

          {/* --- Actions --- */}
          <div className="dev-section">
            <div className="dev-subtitle">Actions</div>
            <div className="dev-row">
              <button onClick={() => awardRewards({ xp: 50 })}>+50 XP</button>
              <button onClick={() => awardRewards({ coins: 25 })}>+25 🪙</button>
              <button
                onClick={() => Object.keys(ENCOUNTERS).forEach((id) => devCompleteEncounter(id))}
              >
                Complete all encounters
              </button>
              <button className="dev-danger" onClick={handleReset}>
                Reset progress
              </button>
            </div>
          </div>

          {/* --- Test any encounter (opens the modal; does NOT teleport) --- */}
          <div className="dev-section">
            <div className="dev-subtitle">Test encounter (opens modal — no teleport)</div>
            <div className="dev-row">
              {Object.values(ENCOUNTERS).map((enc) => (
                <button key={enc.id} onClick={() => testEncounter(enc.id)}>
                  {enc.id}
                </button>
              ))}
            </div>
          </div>

          {/* --- Curriculum & adaptive difficulty --- */}
          <div className="dev-section">
            <div className="dev-subtitle">Curriculum & adaptive</div>

            <div className="dev-row">
              <select value={curStage} onChange={(e) => onStageChange(e.target.value)}>
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <select value={curTopic} onChange={(e) => onTopicChange(e.target.value)}>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="dev-row">
              <select value={curSkill} onChange={(e) => { setCurSkill(e.target.value); setSampleQ(null); }}>
                {topicSkills.map((k) => (
                  <option key={k.id} value={k.id}>{k.name}</option>
                ))}
              </select>
              <select value={curLevel} onChange={(e) => setCurLevel(Number(e.target.value))}>
                {[1, 2, 3, 4, 5].map((l) => (
                  <option key={l} value={l}>Difficulty {l}</option>
                ))}
              </select>
              <button onClick={() => setSampleQ(generateCurriculumQuestion(curStage, curTopic, curSkill, curLevel))}>
                Generate sample
              </button>
            </div>

            {sampleQ && (
              <div className="dev-sample">
                <div className="dev-line">prompt: <code>{sampleQ.text}</code></div>
                <div className="dev-line">answer: <code>{sampleQ.answer}</code></div>
                <div className="dev-line">
                  inputMode: <code>{sampleQ.inputMode}</code> · difficulty: <code>{sampleQ.difficultyLevel} ({sampleQ.difficultyLabel})</code> · xp: <code>{sampleQ.xpValue}</code>
                </div>
                <div className="dev-line">skill: <code>{sampleQ.skillName}</code> ({sampleQ.syllabusArea})</div>
                <div className="dev-line">feedback: <code>{sampleQ.feedback}</code></div>
              </div>
            )}

            {/* Simulate attempts on the selected skill → watch adaptive react. */}
            <div className="dev-row">
              <button onClick={() => recordSkillAttempt(curSkill, true)}>Simulate correct</button>
              <button onClick={() => recordSkillAttempt(curSkill, false)}>Simulate incorrect</button>
            </div>
            {(() => {
              const p = skillProfiles[curSkill];
              if (!p) return <div className="dev-line">No attempts yet for <code>{curSkill}</code>.</div>;
              return (
                <div className="dev-sample">
                  <div className="dev-line">
                    attempts <code>{p.attempts}</code> · correct <code>{p.correct}</code> · accuracy <code>{p.accuracy}%</code>
                  </div>
                  <div className="dev-line">
                    streak <code>{p.streak}</code> · wrong streak <code>{p.incorrectStreak}</code>
                  </div>
                  <div className="dev-line">
                    working difficulty <code>{p.workingDifficulty}</code> · selector suggests <code>{suggestDifficulty(p)}</code>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* --- Teacher mission setup + mission testing (Phase 2D) --- */}
          <TeacherMissionSetup />
          <MissionTesting />

          {/* --- Area / diagram testing (Phase 2E) --- */}
          <AreaTesting />

          {/* --- Real engine testing (Phase 2F) --- */}
          <RealEngineTesting />

          {/* --- World progression (Phase 2G) --- */}
          <WorldTesting />

          {/* --- Story / onboarding (Phase 2I) --- */}
          <StoryTesting />

          {/* --- Topic routes & teacher missions (Phase 2J) --- */}
          <RouteTesting />

          {/* --- Results / reporting (Phase 2L) --- */}
          <ResultsTesting />

          {/* --- Cloud / Firebase (Phase 3B) --- */}
          <CloudTesting />

          {/* --- System checks --- */}
          <div className="dev-section">
            <div className="dev-row">
              <button onClick={() => setChecks(runSystemChecks(useProgress.getState()))}>
                Run system checks
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

          <div className="dev-hint">Open with the ⚙ Dev tab, or press ` to toggle.</div>
        </div>
      )}
    </>
  );
}
