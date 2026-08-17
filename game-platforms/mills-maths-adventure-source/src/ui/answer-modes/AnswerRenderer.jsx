import React from "react";

import { ANSWER_MODES, answerModeOf } from "../../maths/answerModes.js";
import SimpleAnswerInput from "./SimpleAnswerInput.jsx";
import MathAnswerInput from "./MathAnswerInput.jsx";
import TrueFalseAnswerInput from "./TrueFalseAnswerInput.jsx";
import ComparisonSymbolInput from "./ComparisonSymbolInput.jsx";
import OrderedListInput from "./OrderedListInput.jsx";
import MultiPartAnswerInput from "./MultiPartAnswerInput.jsx";
import TableAnswerInput from "./TableAnswerInput.jsx";
import RatioAnswerInput from "./RatioAnswerInput.jsx";
import MultipleChoiceAnswerInput from "./MultipleChoiceAnswerInput.jsx";
import MultiSelectAnswerInput from "./MultiSelectAnswerInput.jsx";

/**
 * AnswerRenderer (Phase 2K) — the single router that turns a question's
 * answerMode into the right input component, with one uniform interface:
 *
 *   value        the current student value (shape depends on mode)
 *   onChange(v)  update the value
 *   disabled     freeze the input (after the answer is checked)
 *   invalid      show an invalid-format hint (simple/list)
 *   result       the last grade (for per-part/cell feedback)
 *   onMathEnter  Enter handler for the MathLive editor
 *   remountKey   bump to reset the MathLive editor between questions
 *
 * Existing simple/MathLive questions flow through here unchanged; the new modes
 * are additive. Any future topic gets all modes for free by setting answerMode.
 */
export default function AnswerRenderer({
  question,
  value,
  onChange,
  disabled = false,
  invalid = false,
  result = null,
  onMathEnter,
  remountKey,
}) {
  const mode = answerModeOf(question);
  const partResults = disabled && result ? result.partResults : null;

  switch (mode) {
    case ANSWER_MODES.MATH:
      return (
        <MathAnswerInput
          remountKey={remountKey}
          disabled={disabled}
          onChange={onChange}
          onEnter={onMathEnter}
        />
      );
    case ANSWER_MODES.TRUE_FALSE:
      return <TrueFalseAnswerInput value={value} onChange={onChange} disabled={disabled} options={question.options} />;
    case ANSWER_MODES.COMPARISON:
      return (
        <ComparisonSymbolInput
          value={value}
          onChange={onChange}
          disabled={disabled}
          options={question.comparisonOptions}
        />
      );
    case ANSWER_MODES.ORDERED_LIST:
      return (
        <OrderedListInput
          value={value}
          onChange={onChange}
          disabled={disabled}
          invalid={invalid}
          count={(question.orderedItems || []).length}
        />
      );
    case ANSWER_MODES.MULTI_PART:
      return (
        <MultiPartAnswerInput
          question={question}
          value={value}
          onChange={onChange}
          disabled={disabled}
          partResults={partResults}
        />
      );
    case ANSWER_MODES.TABLE:
      return (
        <TableAnswerInput
          question={question}
          value={value}
          onChange={onChange}
          disabled={disabled}
          partResults={partResults}
        />
      );
    case ANSWER_MODES.RATIO:
      return (
        <RatioAnswerInput
          question={question}
          value={value}
          onChange={onChange}
          disabled={disabled}
          partResults={partResults}
        />
      );
    case ANSWER_MODES.MULTIPLE_CHOICE:
      return (
        <MultipleChoiceAnswerInput
          value={value}
          onChange={onChange}
          disabled={disabled}
          options={question.options}
          center={question.centerOptions}
        />
      );
    case ANSWER_MODES.MULTI_SELECT:
      return (
        <MultiSelectAnswerInput
          value={value}
          onChange={onChange}
          disabled={disabled}
          options={question.options}
          partResults={partResults}
        />
      );
    default:
      return (
        <SimpleAnswerInput value={value} onChange={onChange} disabled={disabled} invalid={invalid} />
      );
  }
}
