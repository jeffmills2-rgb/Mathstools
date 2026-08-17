import React, { useEffect, useRef } from "react";

import { normaliseAvatar } from "./avatarOptions.js";
import { useUI } from "../../ui/effects/uiStore.js";
import { injectOutlines } from "./outline.js";

/**
 * PLAYER AVATAR (W3-A) — the customisable low-poly "shape" character, built from
 * primitives so it stays light and the whole look is a tiny JSON (outfit colour,
 * skin tone, hair colour + style, hat, glasses). Used for the player (and usable
 * in the creator preview). ~2.2 units tall, feet at y=0.
 */
export default function PlayerAvatar({ avatar }) {
  const a = normaliseAvatar(avatar);
  const showHair = a.hairStyle !== "none" && a.hat !== "beanie"; // beanie covers hair

  // Thin cartoon outline (W5-C), High graphics only. Re-injected when the look
  // changes (creator tweaks) so new hair/hat parts get outlined too. The tiny
  // eyes/nose/glasses fall under the min-size filter and stay clean.
  const root = useRef();
  const highGfx = useUI((s) => s.graphicsQuality) === "high";
  useEffect(() => {
    if (!highGfx || !root.current) return undefined;
    const remove = injectOutlines(root.current, { scale: 1.012, color: "#3a3f4a" });
    return remove;
  }, [highGfx, a.body, a.skin, a.hair, a.hairStyle, a.hat, a.glasses]);

  return (
    <group ref={root}>
      {/* Body / outfit */}
      <mesh castShadow position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.45, 0.55, 1.2, 16]} />
        <meshStandardMaterial color={a.body} />
      </mesh>
      {/* Head (skin) */}
      <mesh castShadow position={[0, 1.75, 0]}>
        <sphereGeometry args={[0.45, 24, 24]} />
        <meshStandardMaterial color={a.skin} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.16, 1.8, 0.4]}><sphereGeometry args={[0.06, 10, 10]} /><meshStandardMaterial color="#2b2d42" /></mesh>
      <mesh position={[0.16, 1.8, 0.4]}><sphereGeometry args={[0.06, 10, 10]} /><meshStandardMaterial color="#2b2d42" /></mesh>
      {/* Nose (also shows facing) */}
      <mesh position={[0, 1.72, 0.45]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.07, 0.18, 10]} />
        <meshStandardMaterial color={a.skin} />
      </mesh>

      {/* Hair */}
      {showHair && <Hair style={a.hairStyle} colour={a.hair} />}

      {/* Hat */}
      {a.hat === "cap" && <Cap colour={a.hatColour} />}
      {a.hat === "beanie" && <Beanie colour={a.hatColour} />}

      {/* Glasses */}
      {a.glasses && <Glasses />}
    </group>
  );
}

function Hair({ style, colour }) {
  return (
    <group>
      {/* Base cap of hair over the crown. */}
      <mesh castShadow position={[0, 1.92, -0.02]}>
        <sphereGeometry args={[0.48, 20, 16, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
        <meshStandardMaterial color={colour} />
      </mesh>
      {style === "spiky" && [[-0.2, 0.2], [0.2, 0.2], [0, 0.28], [-0.15, -0.1], [0.15, -0.1]].map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, 2.15, z]} rotation={[0.2 * z, 0, 0.2 * x]}>
          <coneGeometry args={[0.1, 0.28, 8]} /><meshStandardMaterial color={colour} />
        </mesh>
      ))}
      {style === "long" && [[-0.42, 0], [0.42, 0], [0, -0.42]].map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, 1.5, z]}>
          <boxGeometry args={[0.22, 0.7, 0.22]} /><meshStandardMaterial color={colour} />
        </mesh>
      ))}
      {style === "bun" && (
        <mesh castShadow position={[0, 2.25, -0.15]}>
          <sphereGeometry args={[0.2, 14, 14]} /><meshStandardMaterial color={colour} />
        </mesh>
      )}
    </group>
  );
}

function Cap({ colour }) {
  return (
    <group>
      <mesh castShadow position={[0, 2.0, 0]}>
        <sphereGeometry args={[0.5, 18, 14, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
        <meshStandardMaterial color={colour} />
      </mesh>
      {/* Peak */}
      <mesh castShadow position={[0, 1.98, 0.42]} rotation={[-0.15, 0, 0]}>
        <boxGeometry args={[0.5, 0.06, 0.35]} /><meshStandardMaterial color={colour} />
      </mesh>
    </group>
  );
}

function Beanie({ colour }) {
  return (
    <mesh castShadow position={[0, 2.02, 0]}>
      <sphereGeometry args={[0.5, 18, 14, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
      <meshStandardMaterial color={colour} />
    </mesh>
  );
}

function Glasses() {
  return (
    <group position={[0, 1.8, 0.42]}>
      <mesh position={[-0.16, 0, 0]}><torusGeometry args={[0.1, 0.02, 8, 16]} /><meshStandardMaterial color="#22223b" /></mesh>
      <mesh position={[0.16, 0, 0]}><torusGeometry args={[0.1, 0.02, 8, 16]} /><meshStandardMaterial color="#22223b" /></mesh>
      <mesh position={[0, 0, 0]}><boxGeometry args={[0.12, 0.03, 0.03]} /><meshStandardMaterial color="#22223b" /></mesh>
    </group>
  );
}
