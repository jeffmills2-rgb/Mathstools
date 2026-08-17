import React from "react";

import { useSession } from "../../game/sessionStore.js";

/**
 * GateEncounter — a locked-area placeholder. Shows a message and closes.
 * It does NOT mark itself complete, so the gate stays "locked" for now.
 * Later you can gate it behind a quest and swap this for a real transition.
 */
export default function GateEncounter({ encounter }) {
  const closeEncounter = useSession((s) => s.closeEncounter);

  return (
    <div className="modal-card">
      <button className="modal-close" onClick={closeEncounter} title="Close" aria-label="Close">✕</button>
      <div className="modal-header">
        <span className="modal-npc" style={{ color: "#5c6b7a" }}>
          {encounter.title}
        </span>
      </div>

      <p className="question-prompt">🔒 {encounter.config.message}</p>

      <div className="modal-actions">
        <button className="primary-button" onClick={closeEncounter}>
          Close
        </button>
      </div>
    </div>
  );
}
