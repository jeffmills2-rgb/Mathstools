import React, { useEffect } from "react";

import { useUI } from "./effects/uiStore.js";

/**
 * HowToPlay (Phase 2O) — a short, student-friendly "how to play" card for the
 * Year 7 classroom pilot. Opened from the HUD ❔ button. Not a long tutorial —
 * just the essentials a student needs to get going.
 */
export default function HowToPlay() {
  const open = useUI((s) => s.howToOpen);
  const setHowTo = useUI((s) => s.setHowTo);

  useEffect(() => {
    if (!open) return undefined;
    function onKey(e) { if (e.key === "Escape") setHowTo(false); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setHowTo]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={() => setHowTo(false)}>
      <div className="modal-card howto-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setHowTo(false)} aria-label="Close">✕</button>
        <h2 className="howto-title">❔ How to play</h2>
        <p className="howto-intro">
          Your mission is to answer maths questions and earn at least <strong>60%</strong>.
          Follow the marker, talk to the character or read the Mission Board, and do your best!
        </p>
        <ul className="howto-list">
          <li><strong>Move:</strong> WASD or arrow keys. <strong>Jump:</strong> Shift.</li>
          <li><strong>Interact:</strong> walk up and press <kbd>E</kbd> (NPCs, Mission Board, markers).</li>
          <li><strong>Answer:</strong> type your answer or tap the choice buttons, then <strong>Check</strong>.</li>
          <li><strong>Earn XP</strong> for correct answers — pass a mission to earn its rewards.</li>
          <li><strong>Quests:</strong> press <kbd>Q</kbd> to see your current mission and progress.</li>
          <li>Your attempts are <strong>saved on this device</strong> so your teacher can review them.</li>
        </ul>
        <p className="howto-tip">Tip: a 🧭 marker always points to where you need to go next.</p>
        <div className="modal-actions">
          <button className="primary-button" onClick={() => setHowTo(false)}>Got it!</button>
        </div>
      </div>
    </div>
  );
}
