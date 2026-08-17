import React, { useEffect, useRef } from "react";
import { MathfieldElement } from "mathlive"; // also registers the <math-field> element

// Load MathLive's maths fonts from the installed package. This CSS file holds
// the @font-face rules and sets --ML__static-fonts, which tells MathLive to use
// these (self-hosted) fonts instead of trying to fetch its own. Vite bundles
// the .woff2 files automatically, so it works offline with no CDN.
//
// This is what fixes the radical rendering: without the proper fonts MathLive
// falls back to the page font, so the radical glyph has the wrong metrics and
// the nth-root index (e.g. the "3" in a cube root) collides with the sign and
// placeholders render as stray letters.
import "mathlive/fonts.css";

import "./mathInput.css";
import { readMathValue } from "./mathInputUtils.js";
import { useUI } from "../effects/uiStore.js";

if (typeof window !== "undefined" && MathfieldElement) {
  // We provide the fonts ourselves (via the import above), so disable
  // MathLive's own font fetching, and we don't use its keypress sounds.
  MathfieldElement.fontsDirectory = null;
  MathfieldElement.soundsDirectory = null;
}

/**
 * MathAnswerInput — a reusable equation-style answer box.
 *
 * It wraps MathLive's <math-field> web component (see README for why MathLive
 * was chosen) and adds a small toolbar of structure templates. MathLive gives
 * us, for free: clickable fraction/root/exponent templates, arrow-key
 * navigation between placeholders, natural Backspace/Delete behaviour around
 * structures, and LaTeX / ascii-math output.
 *
 * Props:
 *   onChange(value)   called with { latex, ascii, plain } on every edit
 *   onEnter()         called when the student presses Enter (we intercept it
 *                     so the encounter's check/advance flow stays identical to
 *                     the simple input)
 *   readOnly          freeze the field after an answer has been checked
 *   autoFocus         focus the field on mount (default true)
 *
 * Remount this component (e.g. with key={questionIndex}) to reset it to blank.
 */
export default function MathAnswerInput({ onChange, onEnter, readOnly = false, autoFocus = true }) {
  const ref = useRef(null);
  const onChangeRef = useRef(onChange);
  const onEnterRef = useRef(onEnter);
  onChangeRef.current = onChange;
  onEnterRef.current = onEnter;

  const touchMode = useUI((s) => s.touchMode);

  useEffect(() => {
    const mf = ref.current;
    if (!mf) return undefined;

    // On touch devices, let MathLive pop its own on-screen math keyboard when the
    // field is focused (W4-D). On desktop, keep it manual — the toolbar + the
    // physical keyboard are enough, and an auto-popping panel would be intrusive.
    mf.mathVirtualKeyboardPolicy = touchMode ? "onfocus" : "manual";

    if (autoFocus) {
      // Defer focus so the keystroke that opened the encounter can't leak in.
      const id = setTimeout(() => mf.focus?.(), 0);
      // (cleared below)
      mf._focusTimer = id;
    }

    const handleInput = () => onChangeRef.current?.(readMathValue(mf));

    // Intercept Enter in the CAPTURE phase so MathLive never acts on it and it
    // never bubbles to the window — we route it to onEnter ourselves. This is
    // what keeps Enter = check / advance / finish working with the editor.
    const handleKeyDownCapture = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        onEnterRef.current?.();
      }
    };

    mf.addEventListener("input", handleInput);
    mf.addEventListener("keydown", handleKeyDownCapture, true);

    return () => {
      if (mf._focusTimer) clearTimeout(mf._focusTimer);
      mf.removeEventListener("input", handleInput);
      mf.removeEventListener("keydown", handleKeyDownCapture, true);
    };
  }, [autoFocus, touchMode]);

  // Reflect the readOnly prop onto the element.
  useEffect(() => {
    const mf = ref.current;
    if (mf) mf.readOnly = readOnly;
  }, [readOnly]);

  // Keep the encounter modal clear of MathLive's virtual keyboard: publish the
  // keyboard's height as --vk-height and flag body.vk-open, so the CSS can
  // shrink/widen the modal ("landscape" layout) instead of hiding the input
  // behind the keyboard. Cleared on unmount and whenever the keyboard hides.
  useEffect(() => {
    const vk = window.mathVirtualKeyboard;
    if (!vk || typeof vk.addEventListener !== "function") return undefined;

    const update = () => {
      const h = vk.visible ? Math.ceil(vk.boundingRect?.height || 0) : 0;
      document.documentElement.style.setProperty("--vk-height", `${h}px`);
      document.body.classList.toggle("vk-open", h > 0);
      // Belt-and-braces with the :root --keyboard-zindex CSS var: make sure
      // the keyboard element itself sits ABOVE the .modal-overlay (z 1000),
      // or the overlay silently swallows every tap on the keys.
      const kb = document.querySelector(".ML__keyboard");
      if (kb && h > 0) kb.style.zIndex = "2000";
    };
    vk.addEventListener("virtual-keyboard-toggle", update);
    vk.addEventListener("geometrychange", update);
    update();

    return () => {
      vk.removeEventListener("virtual-keyboard-toggle", update);
      vk.removeEventListener("geometrychange", update);
      document.documentElement.style.setProperty("--vk-height", "0px");
      document.body.classList.remove("vk-open");
    };
  }, []);

  // Insert a LaTeX template at the cursor. "#?" marks an empty placeholder the
  // student tabs/arrows into; "#@" is replaced by the current selection.
  function insert(latex) {
    const mf = ref.current;
    if (!mf || readOnly) return;
    if (typeof mf.insert === "function") mf.insert(latex, { focus: true });
    else mf.executeCommand?.(["insert", latex]);
    mf.focus?.();
    onChangeRef.current?.(readMathValue(mf));
  }

  function clearAll() {
    const mf = ref.current;
    if (!mf || readOnly) return;
    mf.value = "";
    mf.focus?.();
    onChangeRef.current?.(readMathValue(mf));
  }

  return (
    <div className="math-input">
      <div className="math-toolbar" role="toolbar" aria-label="Equation tools">
        <button type="button" className="math-tool" title="Fraction" onClick={() => insert("\\frac{#@}{#?}")}>
          <span className="tool-frac"><span>▢</span><span>▢</span></span>
        </button>
        <button type="button" className="math-tool" title="Square root" onClick={() => insert("\\sqrt{#@}")}>
          √▢
        </button>
        <button type="button" className="math-tool math-tool-wide" title="Nth root" onClick={() => insert("\\sqrt[#?]{#@}")}>
          <span className="tool-nthroot">
            <span className="nthroot-index">n</span>
            <span className="nthroot-radical">√</span>
            <span className="nthroot-box">▢</span>
          </span>
        </button>
        <button type="button" className="math-tool" title="Power / exponent" onClick={() => insert("{#@}^{#?}")}>
          ▢ⁿ
        </button>
        {/* Math symbols (teacher request): friendly × ÷ buttons so young
            learners never need the * or / notation. Grading accepts both forms
            — × and * are equivalent, as are ÷ and /. The x-variable, + and −
            buttons were removed (teacher fix): they clutter the toolbar and are
            always available from the physical keyboard, and on touch from
            MathLive's own virtual keyboard. */}
        <button type="button" className="math-tool" title="Multiply" onClick={() => insert("\\times")}>
          ×
        </button>
        <button type="button" className="math-tool" title="Divide" onClick={() => insert("\\div")}>
          ÷
        </button>
        <button type="button" className="math-tool math-clear" title="Clear" onClick={clearAll}>
          ⌫ Clear
        </button>
      </div>

      {/* The MathLive editor. Styled via .math-input math-field in CSS. */}
      <math-field ref={ref}></math-field>
    </div>
  );
}
