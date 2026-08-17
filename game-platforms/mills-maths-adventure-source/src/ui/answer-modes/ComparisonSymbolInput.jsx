import React, { useEffect } from "react";

/**
 * ComparisonSymbolInput (Phase 2K) — large selectable <, >, = buttons. Typing
 * the symbol on the keyboard also selects it. Symbols are rendered as plain
 * text (React escapes them), avoiding any HTML-entity ambiguity.
 */
export default function ComparisonSymbolInput({ value, onChange, disabled, options }) {
  const opts = options && options.length ? options : ["<", ">", "="];

  useEffect(() => {
    if (disabled) return undefined;
    function onKey(e) {
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (opts.includes(e.key)) onChange(e.key);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [disabled, onChange, opts]);

  return (
    <div className="answer-choice-row comparison-row">
      {opts.map((opt) => (
        <button
          key={opt}
          type="button"
          className={`choice-btn comparison-btn ${value === opt ? "selected" : ""}`}
          disabled={disabled}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
