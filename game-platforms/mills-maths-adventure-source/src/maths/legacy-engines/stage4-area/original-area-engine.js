/**
 * LEGACY AREA ENGINE (stage4-area) — SOURCE MATERIAL, NOT FOR DIRECT USE.
 *
 * This file represents an OLDER "Mills Maths Tools" style question generator.
 * Its output shape is deliberately DIFFERENT from the current Phase 2C/2D
 * question contract (it predates it). Nothing in the game/curriculum imports
 * this file directly — it is only consumed through the adapter layer
 * (src/maths/adapters/areaAdapter.js), which converts this old shape into the
 * current decorated-question shape and attaches diagram metadata.
 *
 * Keeping legacy engines quarantined like this means we can drop in real,
 * historical MMT engines later without rewriting them and without leaking their
 * idiosyncratic shapes into the rest of the codebase.
 *
 * ---------------------------------------------------------------------------
 * LEGACY OUTPUT SHAPE (what these functions return):
 *   {
 *     kind:     "rectangle" | "triangle" | "composite",
 *     prompt:   string,        // the question wording
 *     answer:   number,        // numeric area (no units)
 *     unit:     string,        // linear unit, e.g. "cm" (area unit is unit²)
 *     workings: string,        // a worked solution line
 *     ...shape-specific dimension fields (width/height/base/W/H/notch...)
 *   }
 * ---------------------------------------------------------------------------
 *
 * This module is PURE: it imports nothing (its own tiny RNG), exactly as an
 * external/legacy engine would be. That independence is the point.
 */

// Self-contained RNG so this "external" engine has no shared dependencies.
function rnd(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const UNITS = ["cm", "m", "mm"];
function unitFor(level) {
  // Vary the unit a little so questions feel less repetitive.
  return UNITS[(level + rnd(0, 2)) % UNITS.length];
}

// Area of a rectangle. Dimensions grow with difficulty.
export function generateRectangle(level = 1) {
  const unit = unitFor(level);
  const width = rnd(2 + level, 5 + level * 2);
  const height = rnd(2 + level, 4 + level * 2);
  const answer = width * height;
  return {
    kind: "rectangle",
    prompt: "Find the area of the rectangle.",
    width,
    height,
    unit,
    answer,
    workings: `Area = length × width = ${width} × ${height} = ${answer} ${unit}²`,
  };
}

// Area of a right-angled triangle (base & perpendicular height shown).
export function generateTriangle(level = 1) {
  const unit = unitFor(level);
  // Keep base × height even so ½·b·h is a whole number.
  let base = rnd(2 + level, 6 + level * 2);
  let height = rnd(2 + level, 6 + level * 2);
  if ((base * height) % 2 !== 0) base += 1; // ensure an even product
  const answer = (base * height) / 2;
  return {
    kind: "triangle",
    prompt: "Find the area of the triangle.",
    base,
    height,
    unit,
    answer,
    workings: `Area = ½ × base × height = ½ × ${base} × ${height} = ${answer} ${unit}²`,
  };
}

// Area of a simple L-shape: an outer rectangle (W×H) with a rectangular notch
// (notchW×notchH) removed from the top-right corner.
export function generateComposite(level = 1) {
  const unit = unitFor(level);
  const W = rnd(6 + level, 9 + level * 2);
  const H = rnd(5 + level, 8 + level * 2);
  const notchW = rnd(2, Math.max(2, Math.floor(W / 2) - 1));
  const notchH = rnd(2, Math.max(2, Math.floor(H / 2) - 1));
  const answer = W * H - notchW * notchH;
  return {
    kind: "composite",
    prompt: "Find the area of the L-shape.",
    W,
    H,
    notchW,
    notchH,
    unit,
    answer,
    workings:
      `Whole rectangle = ${W} × ${H} = ${W * H} ${unit}². ` +
      `Cut-out = ${notchW} × ${notchH} = ${notchW * notchH} ${unit}². ` +
      `Area = ${W * H} − ${notchW * notchH} = ${answer} ${unit}².`,
  };
}

// A convenience map so an adapter can pick a generator by kind.
export const LEGACY_AREA_GENERATORS = {
  rectangle: generateRectangle,
  triangle: generateTriangle,
  composite: generateComposite,
};
