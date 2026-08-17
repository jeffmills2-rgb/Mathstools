/**
 * WORLD LABELS (Phase 2H) — the on-map text labels (zone signs), derived from
 * the zones so labels stay data-driven and in sync. The renderer iterates this
 * list; each label is hidden globally while a modal is open (see CSS
 * body.modal-open). Pure data.
 */
import { WORLD_ZONES } from "./worldZones.js";

// The hub ("Mission Plaza") and the grove ("Champion's Grove") signs are omitted
// (W6-B): the plaza sign served no purpose and the grove is now the portal.
const NO_SIGN = new Set(["zone-hub", "zone-grove"]);

export const WORLD_LABELS = WORLD_ZONES.filter((z) => !NO_SIGN.has(z.id)).map((z) => ({
  id: `label-${z.id}`,
  zoneId: z.id,
  text: z.name,
  position: z.sign,
  color: z.color,
  unlockId: z.unlockId || null, // labels for locked zones can show a 🔒
}));

export function getLabel(id) {
  return WORLD_LABELS.find((l) => l.id === id) || null;
}
