import * as THREE from "three";

/**
 * Inverted-hull outlines (W5-C) — the subtle "thin cartoon line" around a
 * character. For every mesh under `root` we add a slightly-enlarged BACK-FACE
 * copy in a dark colour, so its silhouette peeks out behind the real mesh as a
 * clean outline. Skinned (animated) meshes share the original skeleton, so the
 * outline deforms with the animation for free.
 *
 * Returns a cleanup function that removes + disposes everything it added.
 * Tiny meshes (eyes, nose, glasses) are skipped so the outline stays tidy.
 *
 *   root           an Object3D to outline (a glTF scene group, or our primitive
 *                  avatar group)
 *   color          outline colour (a dark slate reads better than pure black)
 *   scale          hull expansion (1.03 ≈ a thin line; higher = bolder)
 *   minLocalRadius skip meshes whose geometry is smaller than this (local units)
 */
export function injectOutlines(root, { color = "#20242c", scale = 1.03, minLocalRadius = 0.15 } = {}) {
  if (!root) return () => {};
  const added = [];

  // Collect first (don't mutate the tree while traversing it).
  const meshes = [];
  root.traverse((o) => {
    if (o.isMesh && !o.userData.__outline) meshes.push(o);
  });

  for (const obj of meshes) {
    const geom = obj.geometry;
    if (!geom) continue;
    if (!geom.boundingSphere) geom.computeBoundingSphere();
    if (geom.boundingSphere && geom.boundingSphere.radius < minLocalRadius) continue;

    const mat = new THREE.MeshBasicMaterial({ color, side: THREE.BackSide });
    let outline;
    if (obj.isSkinnedMesh) {
      outline = new THREE.SkinnedMesh(geom, mat);
      outline.bind(obj.skeleton, obj.bindMatrix);
      outline.bindMode = obj.bindMode;
    } else {
      outline = new THREE.Mesh(geom, mat);
    }
    outline.userData.__outline = true;
    outline.castShadow = false;
    outline.receiveShadow = false;
    outline.frustumCulled = obj.frustumCulled;
    outline.raycast = () => null; // never intercept taps/clicks (W4 tap-to-interact)
    outline.scale.setScalar(scale);
    obj.add(outline);
    added.push(outline);
  }

  return () => {
    for (const o of added) {
      if (o.parent) o.parent.remove(o);
      if (o.material) o.material.dispose();
    }
    added.length = 0;
  };
}
