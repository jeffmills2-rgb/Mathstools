import React, { Suspense, lazy } from "react";

/**
 * MathAnswerInput (answer-mode wrapper, Phase 2K) — wraps the existing MathLive
 * equation editor so it fits the answer-mode interface (value/onChange). The
 * heavy MathLive bundle is still lazy-loaded only when a math question appears.
 *
 * Controlled value is the plain-text form; onChange is called with that string.
 */
const MathField = lazy(() => import("../math-input/MathAnswerInput.jsx"));

export default function MathAnswerInput({ onChange, onEnter, disabled, remountKey }) {
  return (
    <Suspense fallback={<div className="math-loading">Loading equation editor…</div>}>
      <MathField
        key={remountKey}
        readOnly={disabled}
        onChange={(v) => onChange(v.plain)}
        onEnter={onEnter}
      />
    </Suspense>
  );
}
