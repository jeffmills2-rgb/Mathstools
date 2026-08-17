import React, { useMemo, useRef, useLayoutEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { PLATEAU } from "../data/worldColliders.js";
import { SAND_PATCH, ASH_PATCH, WORLD_ZONES } from "../data/worldZones.js";
import { playerState } from "./sessionStore.js";

// Distance from (x,z) to the path segment from the hub (origin) to a zone centre.
function distToPath(x, z, cx, cz) {
  const len2 = cx * cx + cz * cz || 1;
  const t = Math.max(0, Math.min(1, (x * cx + z * cz) / len2));
  const px = cx * t, pz = cz * t;
  return Math.hypot(x - px, z - pz);
}

/**
 * GROUND GRASS (W5-F, revised) — a dense carpet of short, thin blades. It does
 * NOT sway in the wind; instead each blade BENDS AWAY from the player as they
 * walk through it (a proximity push in the vertex shader). Blades are tinted
 * with a mix of greens (per-instance colour) so the field reads more naturally.
 * High-graphics only.
 *
 * Blades avoid the raised plaza and the Algebra moat/island.
 */

// A short, thin blade — base at the ground (y: 0 → ~0.26).
const BLADE = new THREE.PlaneGeometry(0.06, 0.26);
BLADE.translate(0, 0.13, 0);

// A few greens to mix between for a more natural look.
const GREENS = ["#4e9b45", "#5fa855", "#6fb862", "#478a3c", "#7cc26a"];

export default function WindGrass({ count = 9000, radius = 36 }) {
  const ref = useRef();
  const shaderRef = useRef(null);

  const placements = useMemo(() => {
    const out = [];
    let tries = 0;
    while (out.length < count && tries < count * 5) {
      tries++;
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * radius;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (Math.abs(x) <= PLATEAU.halfW + 1 && Math.abs(z) <= PLATEAU.halfD + 1) continue; // plaza
      if (Math.hypot(x - 25, z - 16) < 11) continue; // Algebra moat / island
      if (Math.hypot(x - SAND_PATCH.center[0], z - SAND_PATCH.center[1]) < SAND_PATCH.radius) continue; // snow
      if (Math.hypot(x - ASH_PATCH.center[0], z - ASH_PATCH.center[1]) < ASH_PATCH.radius) continue; // ash
      // No grass on the paths, or inside a zone's NPC area (its patch/ring).
      let blocked = false;
      for (const zn of WORLD_ZONES) {
        if (zn.id === "zone-hub") continue;
        if (Math.hypot(x - zn.center[0], z - zn.center[1]) < zn.radius + 1) { blocked = true; break; }
        if (distToPath(x, z, zn.center[0], zn.center[1]) < 2.2) { blocked = true; break; }
      }
      if (blocked) continue;
      out.push([x, z, Math.random() * Math.PI, 0.8 + Math.random() * 0.7]);
    }
    return out;
  }, [count, radius]);

  const material = useMemo(() => {
    // White base so the per-instance colours show through.
    const m = new THREE.MeshStandardMaterial({ color: "#ffffff", side: THREE.DoubleSide });
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uPlayer = { value: new THREE.Vector2(9999, 9999) };
      shader.vertexShader = "uniform vec2 uPlayer;\n" + shader.vertexShader.replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
         // Bend the blade away from the player as they walk through it.
         vec2 ipos = vec2(instanceMatrix[3][0], instanceMatrix[3][2]);
         vec2 diff = ipos - uPlayer;
         float d = length(diff);
         float R = 1.7;
         float infl = (1.0 - clamp(d / R, 0.0, 1.0)) * position.y * 1.6;
         vec2 dir = d > 0.001 ? normalize(diff) : vec2(0.0);
         transformed.x += dir.x * infl;
         transformed.z += dir.y * infl;`
      );
      shaderRef.current = shader;
    };
    return m;
  }, []);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const dummy = new THREE.Object3D();
    const col = new THREE.Color();
    placements.forEach(([x, z, rot, sc], i) => {
      dummy.position.set(x, 0, z);
      dummy.rotation.y = rot;
      dummy.scale.set(sc, sc, sc);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
      // slight per-blade colour jitter on top of the chosen green
      col.set(GREENS[(Math.random() * GREENS.length) | 0]);
      col.offsetHSL(0, 0, (Math.random() - 0.5) * 0.08);
      ref.current.setColorAt(i, col);
    });
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  }, [placements]);

  useFrame(() => {
    if (shaderRef.current) shaderRef.current.uniforms.uPlayer.value.set(playerState.x, playerState.z);
  });

  return <instancedMesh ref={ref} args={[BLADE, material, placements.length]} frustumCulled={false} />;
}
