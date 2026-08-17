import React, { useState } from "react";

import { useProgress } from "../../progress/store.js";
import { useSession } from "../../game/sessionStore.js";
import { useUI } from "../effects/uiStore.js";
import { announceResult } from "../effects/announce.js";

/**
 * TreasureEncounter — a one-time coin reward.
 *
 * If the chest has already been opened (its encounter id is in
 * completedEncounters), it shows as empty and grants nothing. Otherwise the
 * player can claim the coins exactly once. The one-time logic is enforced by
 * completeEncounter({ oneTime: true }) in the progress store.
 */
export default function TreasureEncounter({ encounter }) {
  const { coins, message } = encounter.config;

  const closeEncounter = useSession((s) => s.closeEncounter);
  const completeEncounter = useProgress((s) => s.completeEncounter);
  const alreadyOpened = useProgress((s) =>
    s.completedEncounters.includes(encounter.id)
  );

  const playSound = useUI((s) => s.playSound);
  const [claimed, setClaimed] = useState(false);

  function claim() {
    const result = completeEncounter({ encounterId: encounter.id, coins, oneTime: true });
    setClaimed(true);
    playSound("coin");
    announceResult(result); // celebrate any quest finished by opening the chest
  }

  return (
    <div className="modal-card">
      <button className="modal-close" onClick={closeEncounter} title="Close" aria-label="Close">✕</button>
      <div className="modal-header">
        <span className="modal-npc" style={{ color: "#b07d2b" }}>
          {encounter.title}
        </span>
      </div>

      {alreadyOpened ? (
        <>
          <p className="question-prompt">🪹 The chest is empty.</p>
          <p className="dialogue-line">You've already taken these coins.</p>
          <div className="modal-actions">
            <button className="primary-button" onClick={closeEncounter}>
              Close
            </button>
          </div>
        </>
      ) : claimed ? (
        <>
          <p className="question-prompt">🎉 {message}</p>
          <div className="summary-rewards">
            <div className="reward-chip">+{coins} 🪙</div>
          </div>
          <div className="modal-actions">
            <button className="primary-button" onClick={closeEncounter}>
              Close
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="question-prompt">🧰 A locked chest...</p>
          <p className="dialogue-line">It looks like it has something inside.</p>
          <div className="modal-actions">
            <button className="primary-button" onClick={claim}>
              Open chest
            </button>
            <button className="link-button" onClick={closeEncounter}>
              Leave it
            </button>
          </div>
        </>
      )}
    </div>
  );
}
