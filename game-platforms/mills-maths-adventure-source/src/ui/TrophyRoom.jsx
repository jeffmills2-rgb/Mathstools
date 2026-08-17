import React, { useEffect } from "react";

import { useProgress } from "../progress/store.js";
import { useUI } from "./effects/uiStore.js";
import { getMission } from "../data/missions.js";
import { getAllChains } from "../data/npcQuestChains.js";
import { resolveChainStep } from "../systems/unlockEngine.js";
import { BadgeShelf } from "./MissionView.jsx";

/**
 * TrophyRoom — a student-facing achievements modal (Phase 2G), opened from the
 * HUD 🏆 button. Shows earned + locked badges, completed missions, and per-NPC
 * topic progress. Uses the existing badge/mission systems.
 */
export default function TrophyRoom() {
  const open = useUI((s) => s.trophyOpen);
  const setTrophy = useUI((s) => s.setTrophy);
  const setResults = useUI((s) => s.setResults);
  const completedMissions = useProgress((s) => s.completedMissions);

  useEffect(() => {
    if (!open) return undefined;
    function onKey(e) { if (e.key === "Escape") setTrophy(false); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setTrophy]);

  if (!open) return null;

  const chains = getAllChains();

  return (
    <div className="trophy-overlay" onClick={() => setTrophy(false)}>
      <div className="trophy-panel" onClick={(e) => e.stopPropagation()}>
        <div className="trophy-header">
          <h2>🏆 Trophy Room</h2>
          <button className="dev-close" onClick={() => setTrophy(false)}>✕</button>
        </div>

        <button className="trophy-results-link" onClick={() => { setTrophy(false); setResults(true); }}>
          📊 View detailed results & progress
        </button>

        <BadgeShelf />

        <h3 className="trophy-section-title">🎯 Completed Missions ({completedMissions.length})</h3>
        {completedMissions.length === 0 ? (
          <p className="questlog-empty">No missions completed yet.</p>
        ) : (
          completedMissions.map((id) => {
            const m = getMission(id);
            return (
              <div key={id} className="trophy-mission-row">
                <span>{m ? m.title : id}</span>
                <span>{m ? `${m.rewardXP} XP` : ""}</span>
              </div>
            );
          })
        )}

        <h3 className="trophy-section-title">📈 Topic Progress</h3>
        {chains.map((chain) => {
          const total = chain.steps.length;
          const done = chain.steps.filter((s) => completedMissions.includes(s.missionId)).length;
          const pct = Math.round((done / total) * 100);
          const complete = resolveChainStep(chain, completedMissions).complete;
          return (
            <div key={chain.npcId} className="trophy-topic-row">
              <span style={{ width: 90 }}>{chain.topicId}</span>
              <span className="trophy-topic-bar">
                <span className="trophy-topic-fill" style={{ width: `${pct}%` }} />
              </span>
              <span>{done}/{total}{complete ? " ✓" : ""}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
