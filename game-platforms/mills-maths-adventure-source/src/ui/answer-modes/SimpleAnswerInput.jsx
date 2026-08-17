import React, { useEffect, useRef } from "react";

import { useUI } from "../effects/uiStore.js";

/**
 * SimpleAnswerInput (Phase 2K) — the classic typed answer box, now an
 * answer-mode component. Controlled: value + onChange. Enter handling stays in
 * MathsEncounter (a window listener) so existing behaviour is unchanged.
 *
 * In touch mode (W4-D) the box is driven by the on-screen TouchKeypad instead of
 * the OS keyboard: it's marked readOnly + inputMode="none" so tapping it never
 * pops the device keyboard, and it isn't auto-focused.
 */
export default function SimpleAnswerInput({ value, onChange, disabled, invalid, placeholder }) {
  const touchMode = useUI((s) => s.touchMode);
  const ref = useRef(null);
  useEffect(() => {
    // Only auto-focus on non-touch (touch uses the on-screen keypad).
    if (!disabled && !touchMode && ref.current) ref.current.focus();
  }, [disabled, touchMode]);

  return (
    <input
      ref={ref}
      className={`text-input ${invalid ? "input-invalid" : ""}`}
      type="text"
      inputMode={touchMode ? "none" : undefined}
      readOnly={touchMode}
      value={value || ""}
      placeholder={placeholder || "Type your answer (e.g. 3, 0.5 or 1/2)"}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
