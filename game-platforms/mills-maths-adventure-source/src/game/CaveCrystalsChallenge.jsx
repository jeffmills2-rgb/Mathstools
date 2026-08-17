import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";

import { CAVE_AREA, CAVE_WALL, CAVE_DOME } from "../data/snow/snowLayout.js";
import { useCaveCrystals } from "./caveCrystalsStore.js";
import { CAVE_GLOW_MS } from "../data/snow/caveCrystalsChallenge.js";
import { ConfettiBurst } from "./OrderPartsChallenge.jsx";

/**
 * THE ICE CAVE — 3D layer (IC). A DARK half-dome cave mouth swallows the
 * back of the clearing; inside it, a wall of numbered crystals spans the
 * round's little window of the number line. Everything starts dim — then
 * the chosen act plays: crystals GLOW one beat at a time, cyan sweeping UP
 * from b, or amber stepping BACK from a, with the landing crystal ringed
 * gold. Count-up rounds read the ANSWER as how-many-glows; count-back
 * rounds read it as where-you-land — the wall makes the difference between
 * the two readings visible. Correct answer → the whole wall shimmers +
 * confetti.
 */

const DOME = "#141830";
const CRYSTAL_DIM = "#2c3252";
const GLOW_UP = "#59d8e8";
const GLOW_BACK = "#e8a020";
const LAND = "#ffe14d";

const WALL = [CAVE_WALL.xMin - CAVE_AREA.x, CAVE_WALL.z - CAVE_AREA.z]; // west end, local
const WALL_LEN = CAVE_WALL.xMax - CAVE_WALL.xMin;
const DOME_LOCAL = [CAVE_DOME.center[0] - CAVE_AREA.x, CAVE_DOME.center[1] - CAVE_AREA.z];

/** Local x of value v within the round's crystal window. */
function xFor(round, v) {
  const span = round.windowMax - round.windowMin;
  return WALL[0] + ((v - round.windowMin) / span) * WALL_LEN;
}

/** How many crystals glow right now (0 = just the start marker). */
function glowProgress(round, startedAt) {
  const elapsed = Date.now() - startedAt;
  return Math.max(0, Math.min(round.steps, Math.floor(elapsed / CAVE_GLOW_MS)));
}

/** One wall crystal (an octahedron on a stub). */
function Crystal({ position, lit, color, landing, tall }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, tall ? 0.85 : 0.62, 0]} rotation={[0, 0.5, 0]}>
        <octahedronGeometry args={[tall ? 0.34 : 0.26]} />
        <meshStandardMaterial
          color={lit ? color : CRYSTAL_DIM}
          emissive={lit ? color : CRYSTAL_DIM}
          emissiveIntensity={lit ? 1.1 : 0.25}
          transparent
          opacity={0.95}
          flatShading
        />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 0.36, 6]} />
        <meshStandardMaterial color="#3a4166" />
      </mesh>
      {landing && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.4, 0.55, 20]} />
          <meshBasicMaterial color={LAND} transparent opacity={0.85} />
        </mesh>
      )}
    </group>
  );
}

export default function CaveCrystalsChallenge() {
  const status = useCaveCrystals((s) => s.status);
  const shown = useCaveCrystals((s) => s.currentRound());
  const startedAt = useCaveCrystals((s) => s.lightStartedAt);
  const active = status !== "idle" && status !== "intro";
  const tick = useRef(0);
  const [, force] = React.useReducer((n) => n + 1, 0);
  useFrame((state) => {
    if (status !== "lighting") return;
    if (state.clock.elapsedTime - tick.current > 0.1) {
      tick.current = state.clock.elapsedTime;
      force();
    }
  });

  if (!active || !shown) return null;

  const started = status !== "choosing" && startedAt > 0;
  const glows = started
    ? status === "lighting"
      ? glowProgress(shown, startedAt)
      : shown.steps
    : 0;

  // Which crystal values are lit, and where the run lands.
  // up: light b+1 … b+glows (cyan). back: light a−1 … a−glows (amber).
  const litSet = new Set();
  for (let g = 1; g <= glows; g++) {
    litSet.add(shown.kind === "up" ? shown.b + g : shown.a - g);
  }
  const landingValue = shown.kind === "up" ? shown.a : shown.answer;
  const landed = glows === shown.steps && started;
  const glowColor = shown.kind === "up" ? GLOW_UP : GLOW_BACK;

  const chip =
    status === "choosing"
      ? `${shown.a} − ${shown.b} ?`
      : status === "typing"
        ? shown.kind === "up"
          ? `how many glows from ${shown.b} to ${shown.a}?`
          : `${shown.b} steps back from ${shown.a} lands on…?`
        : status === "celebrate"
          ? `${shown.a} − ${shown.b} = ${shown.answer}`
          : `${shown.a} − ${shown.b}`;

  return (
    <group position={[CAVE_AREA.x, 0, CAVE_AREA.z]}>
      {/* The dark cave mouth — a half-dome swallowing the back wall. */}
      <mesh position={[DOME_LOCAL[0], 0, DOME_LOCAL[1]]}>
        <sphereGeometry args={[CAVE_DOME.radius, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={DOME} side={2} transparent opacity={0.96} />
      </mesh>

      {/* The numbered crystal wall (the round's window of the line). */}
      {Array.from({ length: shown.windowMax - shown.windowMin + 1 }, (_, i) => {
        const v = shown.windowMin + i;
        const endpoint = v === shown.a || v === shown.b;
        const lit = litSet.has(v) || (started && endpoint && (v === (shown.kind === "up" ? shown.b : shown.a)));
        return (
          <group key={v}>
            <Crystal
              position={[xFor(shown, v), 0, WALL[1]]}
              lit={lit || (landed && v === landingValue)}
              color={landed && v === landingValue ? LAND : glowColor}
              landing={landed && v === landingValue}
              tall={endpoint}
            />
            <Html position={[xFor(shown, v), 1.45, WALL[1]]} center distanceFactor={14} className="ix-badge-anchor" zIndexRange={[24, 0]}>
              <div className="fc-count-chip">{v}</div>
            </Html>
          </group>
        );
      })}

      {/* The glow counter while the wall lights (up-rounds read THIS). */}
      {started && shown.kind === "up" && glows > 0 && (
        <Html position={[xFor(shown, shown.b + glows), 2.2, WALL[1]]} center distanceFactor={11} className="ix-badge-anchor" zIndexRange={[24, 0]}>
          <div className="fc-count-chip">{glows} glow{glows === 1 ? "" : "s"}</div>
        </Html>
      )}

      {/* The running sentence over the cave mouth. */}
      <Html position={[WALL[0] + WALL_LEN / 2, 3.6, WALL[1] + 1.2]} center distanceFactor={10} className="ix-badge-anchor" zIndexRange={[24, 0]}>
        <div className="milk-display">{chip}</div>
      </Html>

      {status === "celebrate" && (
        <ConfettiBurst origin={[xFor(shown, landingValue), 1.6, WALL[1] + 0.6]} />
      )}
    </group>
  );
}
