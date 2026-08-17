import { useEffect, useRef } from "react";

/**
 * Tiny keyboard hook for movement.
 *
 * Returns a ref whose `.current` is an object of booleans:
 *   { forward, backward, left, right }
 *
 * We use a ref (not state) so reading it inside the render loop is cheap and
 * never triggers re-renders. Supports both WASD and the arrow keys.
 */
export function useKeyboard() {
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    rotateLeft: false, // Z — orbit camera left around the player
    rotateRight: false, // X — orbit camera right around the player
    jump: false, // Space — jump (edge-triggered + grounded check in Player)
    run: false, // Shift — hold to run (2× speed + run animation)
  });

  useEffect(() => {
    const map = {
      KeyW: "forward",
      ArrowUp: "forward",
      KeyS: "backward",
      ArrowDown: "backward",
      KeyA: "left",
      ArrowLeft: "left",
      KeyD: "right",
      ArrowRight: "right",
      KeyZ: "rotateLeft",
      KeyX: "rotateRight",
      Space: "jump",
      ShiftLeft: "run",
      ShiftRight: "run",
    };

    // Don't capture movement keys while the student is typing (answer box,
    // MathLive, any input/textarea/contenteditable) — Shift etc. must not move
    // or jump the player mid-question.
    function isTyping(target) {
      if (!target) return false;
      const tag = (target.tagName || "").toLowerCase();
      return tag === "input" || tag === "textarea" || tag === "select" || target.isContentEditable;
    }

    function setKey(code, value, target) {
      const dir = map[code];
      if (!dir) return;
      if (value && isTyping(target)) return; // ignore key-presses while typing
      keys.current[dir] = value;
    }

    const onDown = (e) => {
      // Space is the jump key — stop it scrolling the page / re-clicking a
      // focused button while the game has it.
      if (e.code === "Space" && !isTyping(e.target)) e.preventDefault();
      setKey(e.code, true, e.target);
    };
    const onUp = (e) => setKey(e.code, false, e.target);

    // Reset EVERY key. Called when the window/tab loses focus or a native popup
    // (e.g. a <select> dropdown) steals it — otherwise a key pressed just before
    // focus moved never gets its keyup and stays "stuck on", walking the player.
    const clearAll = () => {
      const k = keys.current;
      k.forward = k.backward = k.left = k.right = false;
      k.rotateLeft = k.rotateRight = k.jump = k.run = false;
    };
    const onVisibility = () => { if (document.hidden) clearAll(); };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", clearAll);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", clearAll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return keys;
}
