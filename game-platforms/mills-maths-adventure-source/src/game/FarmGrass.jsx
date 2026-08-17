import React, { useMemo, useRef, useLayoutEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { FARM_PADDOCKS, VEGGIE_AREA, PLANK_AREA, FARM_MUD } from "../data/farm/farmLayout.js";
import { playerState } from "./sessionStore.js";

/**
 * FARM PADDOCK GRASS — a carpet of short blades scattered INSIDE the fenced
 * paddocks (cow / veggie / pig), matching the wind-grass on Number Island: each
 * blade BENDS AWAY from the player as they walk through it (proximity push in
 * the vertex shader). Blades keep clear of the paddock fences and of the two
 * in-paddock challenge structures (the Veggie Plot bed + the Plank gap). High
 * graphics only (gated by the caller).
 */

const BLADE = new THREE.PlaneGeometry(0.06, 0.24);
BLADE.translate(0, 0.12, 0);
const GREENS = ["#4e9b45", "#5fa855", "#6fb862", "#569c48", "#7cc26a"];

// Structures inside paddocks to keep grass clear of (centre + keep-out radius).
// The pig-pen MUD wallow is bare earth — no grass grows on it.
const KEEPOUT = [
  [VEGGIE_AREA.x, VEGGIE_AREA.z, 4.0],
  [PLANK_AREA.x, PLANK_AREA.z, 2.6],
  [FARM_MUD.center[0], FARM_MUD.center[1], FARM_MUD.radius + 0.4],
];

export default function FarmGrass({ perPaddock = 1100 }) {
  const ref = useRef();
  const shaderRef = useRef(null);

  const placements = useMemo(() => {
    const out = [];
    for (const p of FARM_PADDOCKS) {
      const halfW = p.w / 2 - 1.4; // stay off the fence line
      const halfD = p.d / 2 - 1.4;
      let made = 0, tries = 0;
      while (made < perPaddock && tries < perPaddock * 6) {
        tries++;
        const x = p.x + (Math.random() * 2 - 1) * halfW;
        const z = p.z + (Math.random() * 2 - 1) * halfD;
        let blocked = false;
        for (const [kx, kz, kr] of KEEPOUT) {
          if (Math.hypot(x - kx, z - kz) < kr) { blocked = true; break; }
        }
        if (blocked) continue;
        out.push([x, z, Math.random() * Math.PI, 0.75 + Math.random() * 0.6]);
        made++;
      }
    }
    return out;
  }, [perPaddock]);

  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ color: "#ffffff", side: THREE.DoubleSide });
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uPlayer = { value: new THREE.Vector2(9999, 9999) };
      shader.vertexShader = "uniform vec2 uPlayer;\n" + shader.vertexShader.replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
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
