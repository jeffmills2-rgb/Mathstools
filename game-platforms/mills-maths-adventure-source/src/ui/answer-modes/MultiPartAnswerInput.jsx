import React from "react";

/**
 * MultiPartAnswerInput (Phase 2K; Phase 3G adds choice parts) — labelled fields
 * for parts (a), (b), (c). A part is normally a typed box, but a part carrying
 * an `options` array renders as a single-select MULTIPLE-CHOICE list instead
 * (used for the "value + reason" angle questions, where the student types the
 * value AND picks the reason). Controlled value is an array of strings (one per
 * part). After checking, per-part correctness is shown (partResults). Enter does
 * NOT submit here (multiple fields) — the student clicks Check.
 */
export default function MultiPartAnswerInput({ question, value, onChange, disabled, partResults }) {
  const parts = question.expectedParts || [];
  const vals = Array.isArray(value) ? value : parts.map(() => "");

  function setPart(i, v) {
    const next = parts.map((_, k) => vals[k] || "");
    next[i] = v;
    onChange(next);
  }

  return (
    <div className="multipart-input">
      {parts.map((p, i) => {
        const mark = partResults ? (partResults[i] ? "part-correct" : "part-wrong") : "";
        return (
          <div key={p.label || i} className={`multipart-row ${mark}`}>
            <span className="multipart-label">{p.label}</span>
            <div className="multipart-field">
              {p.prompt && <div className="multipart-prompt">{p.prompt}</div>}
              {Array.isArray(p.options) && p.options.length ? (
                <div className="multipart-choices" role="group" aria-label={p.prompt || "Choose one"}>
                  {p.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={`choice-btn ${vals[i] === opt ? "selected" : ""}`}
                      disabled={disabled}
                      onClick={() => setPart(i, opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  className="text-input"
                  type="text"
                  value={vals[i] || ""}
                  placeholder="Your answer"
                  disabled={disabled}
                  onChange={(e) => setPart(i, e.target.value)}
                />
              )}
            </div>
            {partResults && (
              <span className="multipart-mark">{partResults[i] ? "✓" : "✗"}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
