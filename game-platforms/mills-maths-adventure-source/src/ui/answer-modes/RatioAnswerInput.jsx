import React from "react";

import { ratioPartsOf } from "../../maths/answerModes.js";

/**
 * RatioAnswerInput (Phase 3A2) — one small box per ratio part with a colon
 * between them, so students answer "a : b" (or "a : b : c") without needing a
 * ":" key (the simple input rejects ":" and the touch keypad has none).
 *
 * Controlled value is an array of strings (one per part). After checking,
 * per-part ✓/✗ is shown via partResults. Enter does not submit (multiple
 * fields) — the student clicks Check.
 */
export default function RatioAnswerInput({ question, value, onChange, disabled, partResults }) {
  const parts = ratioPartsOf(question);
  const vals = Array.isArray(value) ? value : parts.map(() => "");

  function setPart(i, v) {
    const next = vals.slice();
    next[i] = v;
    onChange(next);
  }

  return (
    <div className="ratio-input" role="group" aria-label="Ratio answer">
      {parts.map((_, i) => {
        const mark = partResults ? (partResults[i] ? "part-correct" : "part-wrong") : "";
        return (
          <React.Fragment key={i}>
            {i > 0 && <span className="ratio-colon" aria-hidden="true">:</span>}
            <span className={`ratio-box ${mark}`}>
              <input
                className="text-input ratio-field"
                type="text"
                inputMode="numeric"
                value={vals[i] || ""}
                placeholder="?"
                disabled={disabled}
                aria-label={`Ratio part ${i + 1}`}
                onChange={(e) => setPart(i, e.target.value)}
              />
              {partResults && (
                <span className="ratio-mark">{partResults[i] ? "✓" : "✗"}</span>
              )}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
}
