import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";

import { LOOKOUT_AREA, LOOKOUT_DECK } from "../data/snow/snowLayout.js";
import { useAuroraLookout } from "./auroraLookoutStore.js";
import { ConfettiBurst } from "./OrderPartsChallenge.jsx";

/**
 * AURORA LOOKOUT — 3D layer (AL). A raised wooden VIEWING DECK (platform,
 * rail, telescope) faces the northern sky, where shimmering light columns
 * frame the sum the aurora has written. The pillars sway gently; when the
 * brightest tool is picked they flare, and a correct answer sets the whole
 * sky celebrating. The scene is deliberately sparse — at the capstone, the
 * MENU is the mechanic and the sky is the stage.
 */

const WOOD = "#6e5a44";
const WOOD_DARK = "#57462f";
const BEAM_COLORS = ["#67e08a", "#59d8e8", "#9b5de5", "#ffd166"];

const DECK = [LOOKOUT_DECK[0] - LOOKOUT_AREA.x, LOOKOUT_DECK[1] - LOOKOUT_AREA.z];

/** One shimmering aurora pillar. */
function Pillar({ x, z, color, index, flare }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.scale.y = 1 + Math.sin(t * 0.9 + index * 1.7) * 0.12;
    ref.current.rotation.y = Math.sin(t * 0.4 + index) * 0.2;
    ref.current.position.x = x + Math.sin(t * 0.5 + index * 2.1) * 0.4;
  });
  return (
    <mesh ref={ref} position={[x, 6.5, z]}>
      <cylinderGeometry args={[0.5, 1.1, 11, 8, 1, true]} />
      <meshBasicMaterial color={color} transparent opacity={flare ? 0.55 : 0.3} side={2} depthWrite={false} />
    </mesh>
  );
}

function Deck() {
  return (
    <group position={[DECK[0], 0, DECK[1]]} rotation={[0, -0.4, 0]}>
      {/* The raised platform + steps. */}
      <mesh castShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[3.4, 0.18, 2.6]} />
        <meshStandardMaterial color={WOOD} />
      </mesh>
      {[[-1.5, -1.1], [1.5, -1.1], [-1.5, 1.1], [1.5, 1.1]].map(([dx, dz], i) => (
        <mesh key={i} castShadow position={[dx, 0.22, dz]}>
          <boxGeometry args={[0.16, 0.45, 0.16]} />
          <meshStandardMaterial color={WOOD_DARK} />
        </mesh>
      ))}
      {[0, 1].map((s) => (
        <mesh key={s} castShadow position={[0, 0.14 + s * 0.18, 1.6 + (1 - s) * 0.4]}>
          <boxGeometry args={[1.4, 0.12, 0.4]} />
          <meshStandardMaterial color={WOOD} />
        </mesh>
      ))}
      {/* The rail (northern edge — facing the lights). */}
      {[-1.5, 0, 1.5].map((dx) => (
        <mesh key={dx} castShadow position={[dx, 1.0, -1.2]}>
          <boxGeometry args={[0.1, 0.85, 0.1]} />
          <meshStandardMaterial color={WOOD_DARK} />
        </mesh>
      ))}
      <mesh castShadow position={[0, 1.4, -1.2]}>
        <boxGeometry args={[3.4, 0.1, 0.12]} />
        <meshStandardMaterial color={WOOD} />
      </mesh>
      {/* The telescope, aimed at the sky. */}
      <group position={[0.7, 1.35, -0.5]} rotation={[-0.6, 0.2, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.09, 0.13, 1.0, 10]} />
          <meshStandardMaterial color="#c9a227" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.62, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
          <meshStandardMaterial color={WOOD_DARK} />
        </mesh>
      </group>
    </group>
  );
}

export default function AuroraLookoutChallenge() {
  const status = useAuroraLookout((s) => s.status);
  const shown = useAuroraLookout((s) => s.currentRound());
  const pickResult = useAuroraLookout((s) => s.pickResult);
  const active = status !== "idle" && status !== "intro";

  return (
    <group position={[LOOKOUT_AREA.x, 0, LOOKOUT_AREA.z]}>
      <Deck />
      {active && shown && (
        <>
          {/* The aurora's light columns framing the written sum. */}
          {BEAM_COLORS.map((c, i) => (
            <Pillar
              key={i}
              x={-6 + i * 4}
              z={-9 - (i % 2) * 1.5}
              color={c}
              index={i}
              flare={Boolean(pickResult && pickResult.best) && status !== "picking"}
            />
          ))}

          {/* The sum, written in the sky. */}
          <Html position={[0, 8.2, -9]} center distanceFactor={16} className="ix-badge-anchor" zIndexRange={[24, 0]}>
            <div className="milk-display">
              {status === "celebrate" ? `${shown.expr} = ${shown.answer} ✨` : shown.expr}
            </div>
          </Html>

          {/* The scaffold appears under the sum once a tool is picked. */}
          {(status === "typing" || status === "feedback") && (
            <Html position={[0, 6.4, -9]} center distanceFactor={13} className="ix-badge-anchor" zIndexRange={[24, 0]}>
              <div className="fc-count-chip">{shown.scaffold} ?</div>
            </Html>
          )}

          {status === "celebrate" && <ConfettiBurst origin={[0, 7, -8]} />}
        </>
      )}
    </group>
  );
}
