import React from "react";

import { useProgress } from "../progress/store.js";
import { useSession } from "../game/sessionStore.js";
import { useUI } from "./effects/uiStore.js";

/**
 * OnboardingWelcome (Phase 2I) — a short, one-time welcome shown only for a
 * BRAND-NEW save. It points the player up the plaza steps to Sage, then gets
 * out of the way (the player stays in control — no cutscene). Closing it sets
 * onboardingSeen, so it never replays after a refresh.
 *
 * It hides while any encounter modal is open so it can't overlap a conversation.
 */
export default function OnboardingWelcome() {
  const phase = useSession((s) => s.phase);
  const activeEncounterId = useSession((s) => s.activeEncounterId);
  const onboardingSeen = useProgress((s) => s.onboardingSeen);
  const setOnboardingSeen = useProgress((s) => s.setOnboardingSeen);

  if (phase !== "playing" || onboardingSeen || activeEncounterId) return null;

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <div className="onboarding-emoji">🏝️</div>
        <h2 className="onboarding-title">Welcome to Number Island</h2>
        <p className="onboarding-text">
          The whole island is open — wander freely and talk to <strong>Pip</strong>, <strong>Fern</strong>
          and <strong>Alby</strong> for a quick number warm-up (score at least <strong>60%</strong> to pass).
          Your teacher can set special tasks that appear on a character. Climb the plaza steps and say
          hello to <strong>Sage</strong> to begin!
        </p>
        <button className="primary-button" onClick={() => setOnboardingSeen(true)}>
          Let’s go!
        </button>
        <button className="link-button" onClick={() => { setOnboardingSeen(true); useUI.getState().setHowTo(true); }}>
          How to play
        </button>
      </div>
    </div>
  );
}
