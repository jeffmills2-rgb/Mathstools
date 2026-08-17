/**
 * LEGACY TRANSLATION SHIM (source-material support).
 *
 * The uploaded MMT question banks call `attachQuestionTranslations(question)` to
 * bolt on multi-language strings via an exam-builder utility we don't ship. The
 * game is single-language, so this shim is an identity pass-through: it returns
 * the question unchanged. This lets the legacy banks run UNCHANGED (only their
 * import path was repointed here).
 *
 * Pure: no React/DOM/stores.
 */
export function attachQuestionTranslations(question) {
  return question;
}

export default { attachQuestionTranslations };
