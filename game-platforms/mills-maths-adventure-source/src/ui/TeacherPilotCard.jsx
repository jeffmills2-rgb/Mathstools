import React, { useEffect } from "react";

import { useUI } from "./effects/uiStore.js";
import { PILOT_CARD } from "../classroom/pilotInfo.js";

/**
 * TeacherPilotCard (Phase 2P) — a short, practical local classroom launch/help
 * card for the Year 7 pilot dry run. Opened from the Mission Board, Results
 * Centre, or DevPanel. NOT a teacher dashboard — just the workflow + the
 * local-only warning + a dry-run checklist (all from classroom/pilotInfo.js).
 */
export default function TeacherPilotCard() {
  const open = useUI((s) => s.pilotOpen);
  const setPilot = useUI((s) => s.setPilot);

  useEffect(() => {
    if (!open) return undefined;
    function onKey(e) { if (e.key === "Escape") setPilot(false); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setPilot]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={() => setPilot(false)}>
      <div className="modal-card pilot-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setPilot(false)} aria-label="Close">✕</button>
        <h2 className="pilot-title">🍎 {PILOT_CARD.title}</h2>

        <div className="pilot-warning">⚠️ {PILOT_CARD.warning}</div>
        {PILOT_CARD.cloudNote && <div className="pilot-cloud-note">☁ {PILOT_CARD.cloudNote}</div>}

        <h3 className="pilot-subhead">Launch workflow</h3>
        <ol className="pilot-list">
          {PILOT_CARD.workflow.map((s, i) => <li key={i}>{s}</li>)}
        </ol>

        <h3 className="pilot-subhead">Dry-run checklist</h3>
        <ul className="pilot-check">
          {PILOT_CARD.checklist.map((s, i) => <li key={i}>☐ {s}</li>)}
        </ul>

        <h3 className="pilot-subhead">Known limitations</h3>
        <ul className="pilot-limits">
          {PILOT_CARD.limitations.map((s, i) => <li key={i}>{s}</li>)}
        </ul>

        <div className="modal-actions">
          <button className="primary-button" onClick={() => setPilot(false)}>Close</button>
        </div>
      </div>
    </div>
  );
}
