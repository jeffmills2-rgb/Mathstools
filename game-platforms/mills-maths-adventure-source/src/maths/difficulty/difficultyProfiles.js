/**
 * DIFFICULTY PROFILES — declarative, per-topic statements of which legacy
 * question types (and content knobs) belong to which difficulty level.
 *
 * Adapters READ these profiles to request a question at a target difficulty.
 * Keeping the declarations here (not scattered through adapters) means the
 * difficulty design for a topic can be read and tuned in one place.
 *
 * Pure data + the shared intent. No React/DOM/stores.
 *
 * Integer profile entry shape:
 *   {
 *     legacyType,        // the bank type to draw from
 *     op?,               // for integer-calculations: "+","−","×","÷" (null=any)
 *     supported: [1..5], // levels this skill can meaningfully vary
 *     params: { [level]: { ...content knobs the adapter interprets } },
 *   }
 *
 * Knobs the integers adapter understands:
 *   magMax       max |operand| allowed
 *   sameSign     require both operands non-negative (no zero-crossing)
 *   crossZero    require a negative operand (answer likely crosses zero)
 *   requireNeg   require a negative number present
 *   bothNeg      require both factors negative
 *   jumps        exact jump count (number-line)
 *   byMax        max |jump|
 *   brackets     require / forbid brackets (order of operations)
 *   ansMax       max |answer|
 *   forms        allowed substitution expression forms
 *   changeMax    max temperature change
 *   nonNeg       keep temperatures ≥ 0
 */
export { DIFFICULTY_INTENT } from "./difficultyLabels.js";

export const INTEGER_LEVELS = {
  numberLineJumps: {
    legacyType: "number-line-jump",
    supported: [1, 2, 3, 4, 5],
    params: {
      1: { jumps: 1, byMax: 4 },
      2: { jumps: 1, byMax: 7 },
      3: { jumps: 2, byMax: 6 },
      4: { jumps: 2, byMax: 8 },
      5: { jumps: 2, byMax: 9 },
    },
  },
  addingIntegers: {
    legacyType: "integer-calculations",
    op: "+",
    supported: [1, 2, 3, 4, 5],
    params: {
      1: { magMax: 12 },
      2: { magMax: 25, crossZero: true },
      3: { magMax: 40 },
      4: { magMax: 50, requireNeg: true },
      5: { magMax: 50, requireNeg: true },
    },
  },
  subtractingIntegers: {
    legacyType: "integer-calculations",
    op: "−",
    supported: [1, 2, 3, 4, 5],
    params: {
      1: { magMax: 12 },
      2: { magMax: 25, crossZero: true },
      3: { magMax: 40 },
      4: { magMax: 50, requireNeg: true },
      5: { magMax: 50, requireNeg: true },
    },
  },
  multiplyingIntegers: {
    legacyType: "integer-calculations",
    op: "×",
    supported: [1, 2, 3, 4, 5],
    params: {
      1: { magMax: 6 },
      2: { magMax: 9 },
      3: { magMax: 12 },
      4: { magMax: 12, requireNeg: true },
      5: { magMax: 12, bothNeg: true },
    },
  },
  dividingIntegers: {
    legacyType: "integer-calculations",
    op: "÷",
    supported: [1, 2, 3, 4, 5],
    params: {
      1: { magMax: 24 },
      2: { magMax: 48 },
      3: { magMax: 96 },
      4: { magMax: 144, requireNeg: true },
      5: { magMax: 144, requireNeg: true },
    },
  },
  mixedIntegerOperations: {
    legacyType: "integer-calculations",
    op: null,
    supported: [1, 2, 3, 4, 5],
    params: {
      1: { magMax: 12 },
      2: { magMax: 25 },
      3: { magMax: 40 },
      4: { magMax: 60, requireNeg: true },
      5: { magMax: 90, requireNeg: true },
    },
  },
  orderOfOperations: {
    legacyType: "order-of-operations",
    supported: [1, 2, 3, 4, 5],
    params: {
      1: { brackets: false, ansMax: 30 },
      2: { brackets: false, ansMax: 60 },
      3: { ansMax: 100 },
      4: { brackets: true, ansMax: 150 },
      5: { brackets: true, requireNeg: true, ansMax: 300 },
    },
  },
  substitution: {
    legacyType: "substitution-negatives",
    supported: [1, 2, 3, 4, 5],
    params: {
      1: { forms: ["ab", "a + 3b"] },
      2: { forms: ["ab", "a + 3b", "2a − b"] },
      3: {},
      4: { forms: ["ab − 4", "2a − b", "a + 3b"] },
      5: { forms: ["a² + b", "ab − 4"] },
    },
  },
  thermometer: {
    legacyType: "thermometer-read",
    supported: [1, 2, 3, 4, 5],
    params: {
      1: { changeMax: 8, nonNeg: true },
      2: { changeMax: 12 },
      3: { changeMax: 16 },
      4: { changeMax: 20, requireNeg: true },
      5: { changeMax: 22, requireNeg: true },
    },
  },
};

/**
 * FDP & ALGEBRA type→level groupings (DECLARED NOW for the upcoming adapters).
 * These say which legacy bank type each level should draw from. The adapters
 * (next slices) will consume these the same way the integers adapter consumes
 * INTEGER_LEVELS. Authored from the bank type lists + the Phase 2F design.
 */
export const FDP_TYPE_LEVELS = {
  1: ["shaded-fractions", "shaded-fraction-circle", "simplify-fractions", "fraction-of-quantity", "decimal-place-value"],
  2: ["equivalent-fractions", "equivalent-fraction-visual", "fdp-conversions", "round-decimals", "percentage-of"],
  3: ["fraction-operations", "mixed-improper", "decimal-operations", "compare-fractions", "compare-decimals", "fraction-multiply-area", "place-fraction-number-line"],
  4: ["percentage-change", "discounts", "gst-tax", "find-original-value", "proportion-double-line"],
  5: ["multi-part-percentage", "error-spot-fdp", "true-false-fdp"],
};

export const PYTHAGORAS_TYPE_LEVELS = {
  1: ["squares", "square-roots"],
  2: ["unknown-sides"],
  3: ["decimal-sides", "triads"],
  4: ["real-world"],
  5: ["multi-step"],
};

export const ALGEBRA_TYPE_LEVELS = {
  1: ["intro-notation", "simplify-simple", "sub-two", "like-terms-tiles"],
  2: ["simplify-mixed", "multiply-terms", "translate-rich", "pattern-table"],
  3: ["expand-area-model", "sub-two-vars", "factorise", "function-machine"],
  4: ["expand-simplify", "expand-negative-bracket", "algebraic-fractions", "perimeter-expression", "worded-expression"],
  5: ["multi-part-algebra", "error-spot-algebra", "true-false-equivalent", "use-expression-solve"],
};

// Helper: the recommended level for a legacy type within a type→level map.
export function levelForType(typeLevelMap, typeId) {
  for (const lvl of [1, 2, 3, 4, 5]) {
    if ((typeLevelMap[lvl] || []).includes(typeId)) return lvl;
  }
  return null;
}
