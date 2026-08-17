import React from "react";

/**
 * TouchKeypad (W4-D) — a big, kid-friendly on-screen number pad for typing
 * answers on a phone/tablet without relying on the OS keyboard (which covers the
 * screen and auto-focuses unreliably). Used for the `simple` numeric answer mode;
 * math questions use MathLive's own virtual keyboard, and the button modes
 * (true/false, comparison) need no keyboard at all.
 *
 * Purely presentational: it calls back with edits to a plain string value.
 *   onKey(ch)      append a character ("0"-"9", ".", "-", "/")
 *   onBackspace()  delete the last character
 *   onClear()      empty the value
 */
const KEYS = [
  "7", "8", "9", "back",
  "4", "5", "6", "/",
  "1", "2", "3", "-",
  ".", "0", "clear", "",
  // Coordinate entry (3G): (x, y) answers need brackets and a comma.
  "(", ")", ",", "",
];

export default function TouchKeypad({ onKey, onBackspace, onClear, disabled = false }) {
  function press(k) {
    if (disabled) return;
    if (k === "back") return onBackspace();
    if (k === "clear") return onClear();
    if (k === "") return;
    onKey(k);
  }

  return (
    <div className={`touch-keypad ${disabled ? "disabled" : ""}`} role="group" aria-label="Number keypad">
      {KEYS.map((k, i) => {
        if (k === "") return <span key={i} className="keypad-gap" />;
        const label = k === "back" ? "⌫" : k === "clear" ? "C" : k;
        const cls = k === "back" ? "keypad-back" : k === "clear" ? "keypad-clear" : "keypad-digit";
        return (
          <button
            key={i}
            type="button"
            className={`keypad-key ${cls}`}
            onClick={() => press(k)}
            disabled={disabled}
            aria-label={k === "back" ? "Backspace" : k === "clear" ? "Clear" : k}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
