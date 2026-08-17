import React from "react";

/**
 * DOTTED TEXT (F8) — renders recurring-decimal notation with clean,
 * perfectly-centred dots. The pure maths module writes recurring digits
 * using the Unicode combining dot (U+0307), which many fonts render
 * off-centre and cramped; this component strips the combining characters
 * and draws the dot itself via CSS (.ms-rep::after) instead.
 *
 * Works on any string: only digit+U+0307 pairs are transformed, so whole
 * feedback sentences can be passed through safely.
 */
const COMBINING_DOT = "̇";

export default function DottedText({ text }) {
  if (!text || !text.includes(COMBINING_DOT)) return <>{text}</>;
  const parts = [];
  let plain = "";
  for (let i = 0; i < text.length; i++) {
    if (text[i + 1] === COMBINING_DOT) {
      if (plain) {
        parts.push(<React.Fragment key={parts.length}>{plain}</React.Fragment>);
        plain = "";
      }
      parts.push(<span key={parts.length} className="ms-rep">{text[i]}</span>);
      i++; // skip the combining dot
    } else {
      plain += text[i];
    }
  }
  if (plain) parts.push(<React.Fragment key={parts.length}>{plain}</React.Fragment>);
  return <>{parts}</>;
}
