import { integers } from "./integers.js";
import { fractions } from "./fractions.js";
import { algebra } from "./algebra.js";
import { mathExamples } from "./mathExamples.js";

/**
 * Maths engine registry.
 *
 * This module is fully self-contained: it imports nothing from the 3D world,
 * the UI, or the progress store. Everything here is pure question generation
 * and checking. That separation is intentional — you can develop and test the
 * maths engines completely independently of the game.
 *
 * Every topic engine implements the same interface:
 *
 *   {
 *     id: string,
 *     title: string,
 *     description: string,
 *     generate(): standardised question (see makeQuestion in helpers.js)
 *   }
 *
 * ---------------------------------------------------------------------------
 * HOW TO ADD YOUR REAL MILLS MATHS TOOLS ENGINES:
 *   1. Create a new file in src/maths/ exporting an object with the interface
 *      above. Inside generate(), call your existing generator and wrap its
 *      output in makeQuestion().
 *   2. Import it here and add it to ENGINES.
 *   3. Reference its id from an encounter in src/data/encounters.js.
 * No game wiring needs to change.
 * ---------------------------------------------------------------------------
 */
export const ENGINES = {
  [integers.id]: integers,
  [fractions.id]: fractions,
  [algebra.id]: algebra,
  // Example/demo engine for the equation editor (not a curriculum topic; not
  // attached to any world NPC). Reached via the "demo-math-input" encounter.
  [mathExamples.id]: mathExamples,
};

// List of topics (handy for menus and the dev panel).
export const TOPICS = Object.values(ENGINES).map((e) => ({
  id: e.id,
  title: e.title,
  description: e.description,
}));

// Look up an engine by topic id. Falls back to integers if unknown.
export function getEngine(topicId) {
  return ENGINES[topicId] || integers;
}

// Build a fresh set of `count` questions for a topic.
export function buildQuestionSet(topicId, count = 5) {
  const engine = getEngine(topicId);
  const questions = [];
  for (let i = 0; i < count; i++) {
    questions.push(engine.generate());
  }
  return questions;
}

/**
 * Self-test every engine. Used by the developer panel (and easy to run in a
 * test runner later). For each topic it generates many questions and asserts:
 *   - the question has all required fields
 *   - the canonical answer passes check()
 *   - every listed acceptable answer passes check()
 * Returns a summary object per topic.
 */
export function runEngineSelfTest(samples = 100) {
  const results = [];
  for (const engine of Object.values(ENGINES)) {
    let passed = 0;
    let failed = 0;
    const failures = [];
    for (let i = 0; i < samples; i++) {
      const q = engine.generate();
      const hasFields =
        typeof q.text === "string" &&
        q.text.length > 0 &&
        q.answer !== undefined &&
        Array.isArray(q.acceptableAnswers) &&
        typeof q.feedback === "string" &&
        typeof q.topic === "string" &&
        typeof q.difficulty === "string" &&
        typeof q.check === "function";

      const answerOk = hasFields && q.check(q.answer);
      const acceptedOk = hasFields && q.acceptableAnswers.every((a) => q.check(a));

      if (hasFields && answerOk && acceptedOk) {
        passed++;
      } else {
        failed++;
        if (failures.length < 3) failures.push(q.text);
      }
    }
    results.push({ topic: engine.id, title: engine.title, passed, failed, failures });
  }
  return results;
}
