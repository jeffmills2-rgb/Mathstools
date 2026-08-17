import React from "react";

import { useSession } from "../../game/sessionStore.js";

/**
 * BossPlaceholder — a stub for a future boss system.
 *
 * Same idea as BattlePlaceholder: the type exists and is testable from the
 * DevPanel. Replace the body when you build real boss fights (see README
 * "add a boss encounter").
 */
export default function BossPlaceholder({ encounter }) {
  const closeEncounter = useSession((s) => s.closeEncounter);

  return (
    <div className="modal-card">
      <button className="modal-close" onClick={closeEncounter} title="Close" aria-label="Close">✕</button>
      <div className="modal-header">
        <span className="modal-npc" style={{ color: "#6a0572" }}>
          👑 {encounter.title}
        </span>
      </div>

      <p className="question-prompt">{encounter.config.message}</p>
      <p className="dialogue-line">
        Boss system coming soon — this is a placeholder encounter.
      </p>

      <div className="modal-actions">
        <button className="primary-button" onClick={closeEncounter}>
          Close
        </button>
      </div>
    </div>
  );
}
