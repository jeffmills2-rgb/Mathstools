import React from "react";

import { useProgress } from "../progress/store.js";
import { useSession } from "../game/sessionStore.js";
import { useUI } from "./effects/uiStore.js";
import { mainQuestSnapshot, pendingCelebration } from "../data/mainQuest.js";

/**
 * UnlockCelebration (Phase 2I) — a small, dismissible banner shown the first
 * time a gate/zone opens ("The Fraction Bridge rises!"). It is DERIVED from the
 * unlock state, so it appears the moment a mission pass opens a path. Closing it
 * records the unlock in `seenUnlocks`, so a celebration never replays after a
 * refresh. It never blocks the game and hides behind any open modal.
 */
export default function UnlockCelebration() {
  const completedMissions = useProgress((s) => s.completedMissions);
  const earnedBadges = useProgress((s) => s.earnedBadges);
  const completedEncounters = useProgress((s) => s.completedEncounters);
  const seenUnlocks = useProgress((s) => s.seenUnlocks);
  const markUnlockSeen = useProgress((s) => s.markUnlockSeen);

  const activeEncounterId = useSession((s) => s.activeEncounterId);
  const questLogOpen = useUI((s) => s.questLogOpen);
  const trophyOpen = useUI((s) => s.trophyOpen);

  const modalOpen = Boolean(activeEncounterId) || questLogOpen || trophyOpen;
  const snap = mainQuestSnapshot({ completedMissions, earnedBadges, completedEncounters, seenUnlocks });
  const celebration = pendingCelebration(snap);

  if (!celebration || modalOpen) return null;

  return (
    <div className="unlock-celebration" role="status">
      <span className="unlock-celebration-icon">{celebration.icon}</span>
      <span className="unlock-celebration-text">{celebration.message}</span>
      <button
        className="unlock-celebration-close"
        onClick={() => markUnlockSeen(celebration.id)}
        title="Dismiss"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
