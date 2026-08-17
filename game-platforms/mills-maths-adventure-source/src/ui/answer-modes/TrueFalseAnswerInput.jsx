import React, { useEffect } from "react";

/**
 * TrueFalseAnswerInput (Phase 2K; extended in 2N) — two clear choice buttons.
 * Defaults to True / False, but accepts a custom 2-option set via `options`
 * (e.g. ["Yes", "No"] for Pythagorean-triad questions) so we reuse this mode
 * instead of building a separate multiple-choice system.
 *
 * Keyboard shortcuts are the first letter of each option (T/F, or Y/N), ignored
 * while another input is focused and once the question is answered. The selected
 * value is the option label; grading compares it to the canonical answer.
 */
export default function TrueFalseAnswerInput({ value, onChange, disabled, options }) {
  const opts = Array.isArray(options) && options.length === 2 ? options : ["True", "False"];
  const keyFor = (opt) => String(opt).trim().charAt(0).toLowerCase();

  useEffect(() => {
    if (disabled) return undefined;
    function onKey(e) {
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      const k = e.key.toLowerCase();
      const hit = opts.find((o) => keyFor(o) === k);
      if (hit) onChange(hit);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [disabled, onChange, opts]);

  return (
    <div className="answer-choice-row">
      {opts.map((opt, i) => (
        <button
          key={opt}
          type="button"
          className={`choice-btn ${value === opt ? "selected" : ""}`}
          disabled={disabled}
          onClick={() => onChange(opt)}
        >
          {i === 0 ? "✓ " : "✗ "}{opt}
        </button>
      ))}
    </div>
  );
}
