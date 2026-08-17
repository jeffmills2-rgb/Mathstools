/**
 * MMT ENGINE ADAPTER — generic legacy → current-shape converter.
 *
 * The job of this module is tiny but important: take a topic-specific "mapper"
 * that has already translated a legacy engine's output into a flat descriptor,
 * and turn that descriptor into a real CORE question via makeQuestion() — the
 * exact shape every curriculum skill returns from generate().
 *
 * This keeps the conversion in ONE place: every legacy adapter (area today;
 * angles/Pythagoras/etc. later) funnels through here, so the core question
 * (including the optional diagram fields) is always built the same way.
 *
 * Pure: imports only the maths helpers. No React, no stores, no DOM.
 *
 * DESCRIPTOR shape (what a mapper returns):
 *   {
 *     topic, text, answer,
 *     acceptableAnswers?, feedback?, inputMode?,
 *     diagramType?, diagramData?, diagramRendererHint?
 *   }
 */
import { makeQuestion } from "../helpers.js";
import { validateDescriptor } from "./legacyAdapterHelpers.js";

/**
 * Convert a single mapped descriptor into a core question.
 * Throws (in dev) if the descriptor is missing required fields so problems are
 * caught early rather than producing a silently broken question.
 */
export function adaptToCoreQuestion(desc) {
  const { ok, missing } = validateDescriptor(desc);
  if (!ok) {
    throw new Error(`mmtEngineAdapter: descriptor missing ${missing.join(", ")}`);
  }
  return makeQuestion({
    topic: desc.topic,
    text: desc.text,
    answer: desc.answer,
    acceptableAnswers: desc.acceptableAnswers || [],
    feedback: desc.feedback || "",
    inputMode: desc.inputMode || "simple",
    // Diagram hooks flow straight through to the question (null if absent).
    diagramType: desc.diagramType ?? null,
    diagramData: desc.diagramData ?? null,
    diagramRendererHint: desc.diagramRendererHint ?? null,
    // Prompt parts flow through too (null if the adapter didn't split).
    promptText: desc.promptText ?? null,
    mathExpression: desc.mathExpression ?? null,
    expressionLatex: desc.expressionLatex ?? null,
    promptParts: desc.promptParts ?? null,
    // Answer-mode fields (Phase 2K) flow straight through (null if absent).
    answerMode: desc.answerMode ?? null,
    options: desc.options ?? null,
    comparisonOptions: desc.comparisonOptions ?? null,
    orderedItems: desc.orderedItems ?? null,
    answerParts: desc.answerParts ?? null,
    expectedParts: desc.expectedParts ?? null,
    tableConfig: desc.tableConfig ?? null,
    validationRules: desc.validationRules ?? null,
    feedbackParts: desc.feedbackParts ?? null,
  });
}

/**
 * Build a skill-style generator from a legacy generator + a mapper.
 *
 *   legacyGenerate(level) -> legacy output
 *   mapper(legacyOutput)  -> descriptor (see above)
 *
 * Returns a function generate(level) -> core question, which is exactly what a
 * curriculum skill needs. This is the seam future legacy engines reuse.
 */
export function createAdaptedGenerator(legacyGenerate, mapper) {
  return function generate(level = 1) {
    const legacy = legacyGenerate(level);
    const descriptor = mapper(legacy);
    return adaptToCoreQuestion(descriptor);
  };
}
