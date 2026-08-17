import React, { useEffect } from "react";

/**
 * MultipleChoiceAnswerInput (Phase 3B) — pick ONE of 3–4 labelled options
 * (e.g. naming a highlighted circle feature: radius / chord / arc / tangent).
 *
 * The selected value is the option label; grading compares it to the canonical
 * answer (same contract as trueFalse). Number keys 1–4 select an option when no
 * other input is focused.
 */
export default function MultipleChoiceAnswerInput({ value, onChange, disabled, options, center = false }) {
  const opts = Array.isArray(options) && options.length >= 2 ? options : [];

  useEffect(() => {
    if (disabled) return undefined;
    function onKey(e) {
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      const idx = Number(e.key) - 1;
      if (idx >= 0 && idx < opts.length) onChange(opts[idx]);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [disabled, onChange, opts]);

  return (
    <div className={`choice-grid ${center ? "choice-grid-center" : ""}`} role="group" aria-label="Choose one answer">
      {opts.map((opt, i) => (
        <button
          key={opt}
          type="button"
          className={`choice-btn ${value === opt ? "selected" : ""}`}
          disabled={disabled}
          onClick={() => onChange(opt)}
        >
          <span className="choice-num">{i + 1}</span> {opt}
        </button>
      ))}
    </div>
  );
}
