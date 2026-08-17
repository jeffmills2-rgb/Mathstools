import React from "react";

/**
 * MultiSelectAnswerInput (Phase 3H) — "select ALL that apply". Toggle any number
 * of options; the value is the array of chosen labels. Graded as an exact set
 * (all correct options ticked, none of the wrong ones). After checking, each
 * option shows whether its ticked/unticked state was right (partResults, in the
 * option order of `options`).
 */
export default function MultiSelectAnswerInput({ value, onChange, disabled, options, partResults }) {
  const opts = Array.isArray(options) ? options : [];
  const sel = Array.isArray(value) ? value : [];

  function toggle(opt) {
    if (disabled) return;
    onChange(sel.includes(opt) ? sel.filter((o) => o !== opt) : [...sel, opt]);
  }

  return (
    <div className="multiselect-input" role="group" aria-label="Select all that apply">
      {opts.map((opt, i) => {
        const on = sel.includes(opt);
        const mark = partResults ? (partResults[i] ? "ms-correct" : "ms-wrong") : "";
        return (
          <button
            key={opt}
            type="button"
            className={`ms-option ${on ? "on" : ""} ${mark}`}
            disabled={disabled}
            aria-pressed={on}
            onClick={() => toggle(opt)}
          >
            <span className="ms-box">{on ? "✓" : ""}</span>
            <span className="ms-label">{opt}</span>
            {partResults && <span className="ms-mark">{partResults[i] ? "✓" : "✗"}</span>}
          </button>
        );
      })}
    </div>
  );
}
