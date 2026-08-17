/**
 * WORLD LANDMARKS (Phase 2H) — simple, themed low-poly props that give each
 * zone its identity. Pure data; the renderer (WorldScenery) maps `type` to a
 * small set of meshes. Keep the count modest for performance.
 *
 *   id, zoneId, type, position [x,z], color?, scale?
 *
 * Supported types: "fountain" (hub), "dune" (desert), "signpostPM" (±),
 * "volcano" (fdp), "crate" (algebra), "plot" (area meadow), "trophy" (grove),
 * "palm" (coast).
 */
export const WORLD_LANDMARKS = [
  // (The hub's centrepiece is the raised plaza plateau itself — no fountain, to
  //  keep the plaza clear and avoid a prop buried in the raised ground.)

  // Integer Dunes (SNOW, wintry) — Pip the penguin's clearing: 2 snowmen + 2
  // Christmas trees flanking, snow dunes blocking behind, and the ± signpost.
  { id: "int-signpost", zoneId: "zone-integers", type: "signpostPM", position: [-23, -11], color: "#6c757d" },
  { id: "int-snowman-l", zoneId: "zone-integers", type: "snowman", position: [-30, -12] },
  { id: "int-snowman-r", zoneId: "zone-integers", type: "snowman", position: [-21, -21] },
  { id: "int-snowman-3", zoneId: "zone-integers", type: "snowman", position: [-33, -15] },
  { id: "int-snowman-4", zoneId: "zone-integers", type: "snowman", position: [-23, -23] },
  { id: "int-xtree-l", zoneId: "zone-integers", type: "xmastree", position: [-31, -8] },
  { id: "int-xtree-r", zoneId: "zone-integers", type: "xmastree", position: [-19, -24] },
  { id: "int-xtree-3", zoneId: "zone-integers", type: "xmastree", position: [-28, -9] },
  { id: "int-xtree-4", zoneId: "zone-integers", type: "xmastree", position: [-32, -19] },
  // snow dunes behind Pip (SW) — a soft wall closing off the back.
  { id: "int-dune-1", zoneId: "zone-integers", type: "snowdune", position: [-30, -20], scale: 1.5 },
  { id: "int-dune-2", zoneId: "zone-integers", type: "snowdune", position: [-33, -16], scale: 1.2 },
  { id: "int-dune-3", zoneId: "zone-integers", type: "snowdune", position: [-27, -23], scale: 1.3 },

  // Fraction Volcano — a larger volcano set well back behind Fern (clear of her),
  // with animated flowing lava.
  { id: "fdp-volcano", zoneId: "zone-fdp", type: "volcano", position: [33, -22], color: "#9d0208", scale: 2.0 },

  // Algebra Coast — a palm (the blue crates were removed in W6-B).
  { id: "alg-palm", zoneId: "zone-algebra", type: "palm", position: [29, 14], color: "#2d6a4f" },

  // (Area Meadow removed in W6-B; Champion's Grove trophy removed — the grove is
  //  now the SchoolYard portal entrance.)
];

export function getLandmarksForZone(zoneId) {
  return WORLD_LANDMARKS.filter((l) => l.zoneId === zoneId);
}
