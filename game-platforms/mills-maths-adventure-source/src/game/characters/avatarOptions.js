/**
 * AVATAR OPTIONS (W3-A) — the choices for the player's customisable "shape"
 * avatar, shared by the creator UI, the renderer (PlayerAvatar) and the saved
 * profile defaults. Pure data — no React/three. Each option is small so the
 * whole avatar is a tiny JSON that saves locally and (W3-B) to the cloud.
 */

// Outfit / body colours (the original palette).
export const BODY_COLOURS = [
  "#ffb703", "#fb5607", "#ff006e", "#8338ec",
  "#3a86ff", "#06d6a0", "#ef476f", "#118ab2",
];

// Skin tones.
export const SKIN_TONES = [
  "#ffe0bd", "#f1c27d", "#e0ac69", "#c68642", "#8d5524", "#5a3825",
];

// Hair colours.
export const HAIR_COLOURS = [
  "#2b2118", "#3b2a1a", "#6b4f2a", "#a9743b", "#d9b382", "#c0392b", "#e8e2d6", "#4a4a4a",
];

// Hair styles (rendered by PlayerAvatar).
export const HAIR_STYLES = ["none", "short", "long", "bun", "spiky"];

// Hats (rendered by PlayerAvatar; "none" = bare head/hair).
export const HATS = ["none", "cap", "beanie"];

// The default avatar for a brand-new player.
export const DEFAULT_AVATAR = {
  body: "#3a86ff",     // outfit colour
  skin: "#f1c27d",     // skin tone
  hair: "#3b2a1a",     // hair colour
  hairStyle: "short",  // one of HAIR_STYLES
  hat: "none",         // one of HATS
  hatColour: "#e63946",
  glasses: false,
};

// Fill any missing fields from the defaults (tolerant of old/partial saves).
export function normaliseAvatar(a = {}) {
  return { ...DEFAULT_AVATAR, ...a };
}
