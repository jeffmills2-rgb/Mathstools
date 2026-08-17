/**
 * SCHOOLYARD COLLIDERS (W2-G) — solid props + the boss gate. Circles only
 * (cheap, jitter-free), same shape as worldColliders. Derived from the layout so
 * scenery + collision stay in sync. The rectangular region bounds keep the player
 * inside; the Head Teacher's gate is a full-width barrier across the top tier that
 * is present ONLY while the boss is locked (earn all 8 keys to open it).
 */
import {
  SCHOOLYARD_TREES,
  SCHOOLYARD_PLANTERS,
  SCHOOLYARD_CHARACTERS,
  SCHOOLYARD_GATE,
  SCHOOLYARD_BOUNDS,
  SCHOOLYARD_PROPS,
} from "./schoolyardLayout.js";
import { isBossUnlocked } from "./schoolyardProgress.js";

const STATIC = [
  ...SCHOOLYARD_TREES.map((p, i) => ({ id: `sy-tree-${i}`, kind: "tree", x: p[0], z: p[1], radius: 0.8 })),
  ...SCHOOLYARD_PLANTERS.map((p, i) => ({ id: `sy-planter-${i}`, kind: "boundary", x: p[0], z: p[1], radius: p[2] })),
  ...SCHOOLYARD_CHARACTERS.map((c) => ({ id: `sy-${c.id}`, kind: "interactable", x: c.position[0], z: c.position[1], radius: c.boss ? 1.3 : 0.8 })),
  // Landmark .glb props (lighthouse / front / canteen / tree) — solid so the
  // player can't walk into them (radius tuned in SCHOOLYARD_PROPS).
  ...SCHOOLYARD_PROPS.filter((p) => (p.collider || 0) > 0).map((p) => ({
    id: `sy-prop-${p.id}`, kind: "boundary", x: p.position[0], z: p.position[1], radius: p.collider,
  })),
];

// A full-width row of colliders sealing the top tier at the gate line (so the
// boss can't be reached around the side). Present only while the gate is locked.
// Spans the FULL (widened) region width so there's no gap at the far edges.
function gateColliders() {
  const cols = [];
  const hw = SCHOOLYARD_BOUNDS.width / 2; // 44 after the widening
  for (let x = -hw; x <= hw; x += 5.5) {
    cols.push({
      id: `sy-gate-${Math.round(x)}`, kind: "gate", x, z: SCHOOLYARD_GATE.z, radius: 3.2,
      hint: "The Head Teacher's gate — earn all 8 keys to open it.",
    });
  }
  return cols;
}

/** Schoolyard colliders for the current progress snapshot (adds the boss gate
 *  while it is locked). */
export function getSchoolyardColliders(snapshot = {}) {
  const cm = snapshot.completedMissions || [];
  return isBossUnlocked(cm) ? STATIC : [...STATIC, ...gateColliders()];
}

// Back-compat static export (locked state) for any direct importers.
export const SCHOOLYARD_COLLIDERS = getSchoolyardColliders({});
