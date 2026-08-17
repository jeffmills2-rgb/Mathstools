import React from "react";

import { useSession } from "../../game/sessionStore.js";

/**
 * BattlePlaceholder — a stub for a future battle system.
 *
 * It deliberately does nothing except show a message, so the encounter "type"
 * exists and is testable from the DevPanel. When you build the real battle
 * system, replace the body of this component (see README "add a battle
 * encounter") — no other file needs to change.
 */
export default function BattlePlaceholder({ encounter }) {
  const closeEncounter = useSession((s) => s.closeEncounter);

  return (
    <div className="modal-card">
      <button className="modal-close" onClick={closeEncounter} title="Close" aria-label="Close">✕</button>
      <div className="modal-header">
        <span className="modal-npc" style={{ color: "#c1121f" }}>
          ⚔️ {encounter.title}
        </span>
      </div>

      <p className="question-prompt">{encounter.config.message}</p>
      <p className="dialogue-line">
        Battle system coming soon — this is a placeholder encounter.
      </p>

      <div className="modal-actions">
        <button className="primary-button" onClick={closeEncounter}>
          Close
        </button>
      </div>
    </div>
  );
}
