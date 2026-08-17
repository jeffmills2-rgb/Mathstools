import React from "react";

import { useUI } from "./effects/uiStore.js";
import { useSession, touchInput } from "../game/sessionStore.js";

/**
 * On-screen movement helpers for touch devices (W4-E): camera rotate (left /
 * right) and Jump. Tap-to-move handles walking, so these are just the extras
 * that WASD/Shift/Z/X give on desktop. They write to the shared `touchInput`
 * object, which the Player OR-combines with the keyboard each frame.
 *
 * Touch-only, and hidden while an encounter/dialogue modal is open.
 */
function holdHandlers(set) {
  return {
    onPointerDown: (e) => { e.currentTarget.setPointerCapture?.(e.pointerId); set(true); },
    onPointerUp: () => set(false),
    onPointerCancel: () => set(false),
    onPointerLeave: () => set(false),
  };
}

export default function TouchControls() {
  const touchMode = useUI((s) => s.touchMode);
  const activeEncounterId = useSession((s) => s.activeEncounterId);

  if (!touchMode || activeEncounterId) return null;

  return (
    <>
      <div className="touch-controls touch-controls-left">
        <button className="touch-btn" aria-label="Rotate camera left"
          {...holdHandlers((v) => { touchInput.rotateLeft = v; })}>⟲</button>
        <button className="touch-btn" aria-label="Rotate camera right"
          {...holdHandlers((v) => { touchInput.rotateRight = v; })}>⟳</button>
      </div>
      <div className="touch-controls touch-controls-right">
        <button className="touch-btn touch-btn-jump" aria-label="Jump"
          {...holdHandlers((v) => { touchInput.jump = v; })}>⤒<span className="touch-btn-label">Jump</span></button>
      </div>
    </>
  );
}
