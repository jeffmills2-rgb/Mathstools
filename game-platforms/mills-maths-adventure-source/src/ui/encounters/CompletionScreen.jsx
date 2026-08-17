import React, { useState } from "react";

import { useProgress } from "../../progress/store.js";
import { getAllQuests } from "../../data/quests.js";
import { getQuestStatus, questProgress } from "../../quests/questEngine.js";
import { resultSummaryText } from "../../results/resultUtils.js";
import { useCloud } from "../../cloud/cloudSession.js";
import { pickCompletionIdentity } from "../../cloud/adventureAttemptMapper.js";
import { cloudSaveMessage } from "../../cloud/cloudMessages.js";

/**
 * A short, reusable completion screen shown after an encounter finishes.
 *
 * Shows: XP earned, coins earned, any quest just completed, and the updated
 * progress of the current active quest. It reads quest state AFTER the encounter
 * was recorded, so the progress bars reflect the new totals.
 *
 * Props:
 *   title    headline (e.g. "Challenge complete!")
 *   subtitle optional line under the title (e.g. the score)
 *   reward   { xp, coins, leveledUp, newLevel, newlyCompletedQuests }
 *   onClose  called by the "Back to the island" button
 */
export default function CompletionScreen({
  title,
  subtitle,
  reward = {},
  missionReward = null,
  missionSummary = null,
  savedRecord = null,
  cloudStatus = null,
  passed = true,
  onRetry = null,
  onBoard = null,
  onViewResults = null,
  onClose,
}) {
  const completedEncounters = useProgress((s) => s.completedEncounters);
  const completedQuests = useProgress((s) => s.completedQuests);
  const snapshot = { completedEncounters, completedQuests };
  const [copied, setCopied] = useState(false);

  // Prefer the Firebase student profile for the identity display when registered
  // (Phase 3B.1) — otherwise fall back to the local record / "Explorer".
  const cloudStudent = useCloud((s) => (s.mode === "registered" ? s.student : null));
  const identity = pickCompletionIdentity(cloudStudent, savedRecord);
  const isStory = Boolean(savedRecord && savedRecord.missionKind === "story");

  function copySummary() {
    if (!savedRecord) return;
    try { if (navigator.clipboard) navigator.clipboard.writeText(resultSummaryText(savedRecord)); } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  const justCompleted = reward.newlyCompletedQuests || [];
  const activeQuest = getAllQuests().find(
    (q) => getQuestStatus(q, snapshot) === "active"
  );

  return (
    <div className="modal-card completion-card">
      <button className="modal-close" onClick={onClose} title="Close" aria-label="Close">✕</button>
      <div className="completion-burst" aria-hidden="true">{passed ? "🎉" : "💪"}</div>

      <h2 className="completion-title">{title}</h2>
      {subtitle && <p className="completion-subtitle">{subtitle}</p>}

      {/* Teacher/free-choice mission summary (title, topic, skills attempted). */}
      {missionSummary && (
        <div className="completion-summary">
          <div className="completion-summary-title">🎯 {missionSummary.title}</div>
          <div className="completion-summary-meta">
            <span>Topics: {missionSummary.topics?.join(", ") || "mixed"}</span>
            <span>
              Skills: {missionSummary.skills?.length ? missionSummary.skills.join(", ") : "all in topic"}
            </span>
          </div>
          <div className={`completion-summary-verdict ${passed ? "ok" : "retry"}`}>
            {passed ? "Passed ✓ (60% or above)" : "Not passed yet — keep going, you need 60%."}
          </div>
        </div>
      )}

      {/* Saved-locally status + who it was saved for (identity prefers the
          Firebase profile when registered — Phase 3B.1). */}
      {savedRecord && (
        <div className="completion-saved">
          💾 Saved locally on this device for {identity.name}{identity.tag ? ` (${identity.tag})` : ""}.
        </div>
      )}

      {/* Cloud save status (Phase 3B/3B.1). */}
      {cloudStatus && (
        <div className={`completion-cloud cloud-${cloudStatus}`}>{cloudSaveMessage(cloudStatus, isStory)}</div>
      )}

      {/* Rewards earned this encounter. */}
      <div className="completion-rewards">
        <div className="reward-chip pop" style={{ animationDelay: "0.05s" }}>
          +{reward.xp || 0} XP
        </div>
        <div className="reward-chip pop" style={{ animationDelay: "0.15s" }}>
          +{reward.coins || 0} 🪙
        </div>
      </div>

      {reward.leveledUp && (
        <p className="completion-levelup pop">⭐ You reached Level {reward.newLevel}!</p>
      )}

      {/* Mission completion (badge + mission reward), if a mission finished. */}
      {missionReward && (
        <div className="completion-mission-done pop">
          <div className="completion-mission-head">
            🎯 Mission complete{missionReward.title ? `: ${missionReward.title}` : ""}!
          </div>
          {missionReward.badge && (
            <div className="completion-badge">
              <span className="completion-badge-icon">{missionReward.badge.icon}</span>
              <span>
                Badge earned: <strong>{missionReward.badge.badgeName}</strong>
              </span>
            </div>
          )}
          <div className="completion-mission-rewards">
            +{missionReward.rewardXP || 0} XP · +{missionReward.rewardCoins || 0} 🪙
          </div>
        </div>
      )}

      {/* Quest updates. */}
      {justCompleted.length > 0 && (
        <div className="completion-quest-done">
          {justCompleted.map((q) => (
            <div key={q.id} className="pop">📜 Quest complete: <strong>{q.title}</strong></div>
          ))}
        </div>
      )}

      {activeQuest && (
        <div className="completion-quest-progress">
          <span className="completion-quest-label">Quest progress</span>
          <div className="completion-quest-row">
            <span>{activeQuest.title}</span>
            {(() => {
              const { done, total } = questProgress(activeQuest, snapshot);
              const pct = Math.round((done / total) * 100);
              return (
                <span className="completion-quest-track">
                  <span className="completion-quest-bar">
                    <span className="completion-quest-fill" style={{ width: `${pct}%` }} />
                  </span>
                  {done}/{total}
                </span>
              );
            })()}
          </div>
        </div>
      )}

      <div className="modal-actions completion-actions">
        {!passed && onRetry && (
          <button className="primary-button" onClick={onRetry} title="Starts a new attempt">
            Try again
          </button>
        )}
        {savedRecord && (
          <button className="link-button" onClick={copySummary}>
            {copied ? "Copied!" : "Show teacher / Copy result"}
          </button>
        )}
        {onViewResults && (
          <button className="link-button" onClick={onViewResults}>View Results</button>
        )}
        {onBoard && (
          <button className="link-button" onClick={onBoard}>
            Back to Mission Board
          </button>
        )}
        <button className={passed && !onRetry ? "primary-button" : "link-button"} onClick={onClose}>
          {onBoard ? "Continue exploring" : "Back to the island"}
        </button>
      </div>
      {!passed && onRetry && <p className="completion-retry-hint">Try again creates a new attempt — your previous attempt is still saved.</p>}
    </div>
  );
}
