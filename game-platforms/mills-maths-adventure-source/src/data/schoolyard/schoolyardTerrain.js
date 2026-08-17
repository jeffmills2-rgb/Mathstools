/**
 * SCHOOLYARD TERRAIN (W2-F) — the region's height field: three tiers stepping up
 * toward the north, linked by central staircases. Pure function of (x, z), used
 * by the Player (walking), Interactables (sitting on the ground) and the scenery
 * (drawing the platforms/steps). Mirrors the island's plateau/stairs approach
 * (collisionEngine.groundHeightAt) but for rectangular tiers.
 */
import { SCHOOLYARD_TIERS, SCHOOLYARD_STAIRS, SCHOOLYARD_PODIUM } from "./schoolyardLayout.js";

const STAIR_DEPTH = 3;  // z-depth of each staircase footprint
const STAIR_STEPS = 3;  // discrete steps (rise per step ≈ 0.37 ≤ STEP_UP 0.45)

// Stepped height within a staircase footprint (bottom = south/high-z, top =
// north/low-z). Discrete steps so the Player's step-up/step-down logic walks it.
function stairHeightAt(s, z) {
  const bottom = s.zBoundary + STAIR_DEPTH / 2;
  const t = Math.min(1, Math.max(0, (bottom - z) / STAIR_DEPTH)); // 0 bottom → 1 top
  const frac = Math.round(t * STAIR_STEPS) / STAIR_STEPS;
  return s.from + (s.to - s.from) * frac;
}

/** Ground height at (x, z) in the schoolyard. */
export function schoolyardGroundHeight(x, z) {
  // Boss podium — a raised disc the Head Teacher stands on (sits on its tier).
  const [ppx, ppz] = SCHOOLYARD_PODIUM.position;
  if (Math.hypot(x - ppx, z - ppz) <= SCHOOLYARD_PODIUM.radius) {
    return tierAtZ(ppz).height + SCHOOLYARD_PODIUM.height;
  }
  // Central staircases override the tier boundary (walkable ramp).
  for (const s of SCHOOLYARD_STAIRS) {
    if (Math.abs(x) <= s.halfWidth &&
        z >= s.zBoundary - STAIR_DEPTH / 2 && z <= s.zBoundary + STAIR_DEPTH / 2) {
      return stairHeightAt(s, z);
    }
  }
  // Tier plateaus by z-band.
  for (const tr of SCHOOLYARD_TIERS) {
    if (z >= tr.zMin && z < tr.zMax) return tr.height;
  }
  return 0;
}

// The tier a z falls in (for scenery). Returns the tier record or tier 0.
export function tierAtZ(z) {
  return SCHOOLYARD_TIERS.find((tr) => z >= tr.zMin && z < tr.zMax) || SCHOOLYARD_TIERS[0];
}
