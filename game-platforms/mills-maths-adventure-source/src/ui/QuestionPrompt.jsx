import React from "react";

import { resolvePromptParts } from "../maths/promptFormat.js";

/**
 * QuestionPrompt — the shared renderer for a question's prompt.
 *
 * Goal: mathematical expressions must never wrap awkwardly mid-bracket / power /
 * product. So when a prompt has (or can be split into) a wording part + a maths
 * expression, the expression is shown in its own non-breaking block.
 *
 * Resolution order (most explicit first):
 *   1. question.promptParts — [{ type: "text" | "expr", value }]
 *   2. question.mathExpression (+ promptText / expressionLatex) set by an adapter
 *   3. a global fallback split of question.text (so EVERY topic benefits)
 *   4. plain text
 *
 * Used by MathsEncounter; works for simple-text and LaTeX-style expressions and
 * is independent of the answer input mode (simple box or MathLive).
 */
export default function QuestionPrompt({ question }) {
  if (!question) return null;

  // 1) Explicit promptParts.
  if (Array.isArray(question.promptParts) && question.promptParts.length) {
    return (
      <div className="question-prompt">
        {question.promptParts.map((p, i) =>
          p.type === "expr" ? (
            <span key={i} className="prompt-expression">{p.value}</span>
          ) : (
            <span key={i} className="prompt-text">{p.value}</span>
          )
        )}
      </div>
    );
  }

  // 2 & 3) Adapter-provided parts, or a fallback split of the raw text.
  const parts = resolvePromptParts(question);
  if (parts && parts.mathExpression) {
    return (
      <div className="question-prompt">
        {parts.promptText && <span className="prompt-text">{parts.promptText}</span>}
        <span className="prompt-expression" data-latex={parts.expressionLatex || undefined}>
          {parts.mathExpression}
        </span>
      </div>
    );
  }

  // 4) Plain prompt.
  return <p className="question-prompt">{question.text}</p>;
}
