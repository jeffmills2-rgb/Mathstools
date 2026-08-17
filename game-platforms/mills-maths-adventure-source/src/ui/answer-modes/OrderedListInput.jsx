import React, { useEffect, useRef } from "react";

/**
 * OrderedListInput (Phase 2K) — a single text box for a comma-separated ordered
 * list (e.g. "0.3, 0.45, 0.6"). Kept deliberately simple (typed input rather
 * than drag-and-drop). Equivalent forms (e.g. 1/2 and 0.5) are accepted by the
 * grader where the bank supports it. Enter checks (single field).
 */
export default function OrderedListInput({ value, onChange, disabled, invalid, count }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!disabled && ref.current) ref.current.focus();
  }, [disabled]);

  return (
    <div className="ordered-list-input">
      <input
        ref={ref}
        className={`text-input ${invalid ? "input-invalid" : ""}`}
        type="text"
        value={typeof value === "string" ? value : (value || []).join(", ")}
        placeholder={count ? `Enter ${count} values, smallest first, separated by commas` : "Enter values separated by commas"}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="input-hint">Separate each value with a comma, in order.</div>
    </div>
  );
}
