import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";

import { YARD_AREA, YARD_STALL, YARD_BOARD } from "../data/snow/snowLayout.js";
import { useLodgeYard } from "./lodgeYardStore.js";
import { YARD_BEAD_MS } from "../data/snow/lodgeYardChallenge.js";
import { ConfettiBurst } from "./OrderPartsChallenge.jsx";

/**
 * THE LODGE YARD — 3D layer (LY). The lodge's hot-chocolate STALL (striped
 * awning, steaming mug) with the HUNDRED-BEAD COCOA BOARD beside it: ten
 * rows of ten beads on an upright frame. The price fills cocoa-brown beads
 * from the top; the change counts UP in gold — the ones hop finishes its
 * part-row bead by bead, then the tens hop floods the clean rows — so
 * "friends of 10 make friends of 100" is literally visible as rows
 * completing. Correct change → the mug steams double + confetti.
 */

const WOOD = "#6e5a44";
const WOOD_DARK = "#57462f";
const AWNING_A = "#d6493f";
const AWNING_B = "#f3ead6";
const BEAD_PAID = "#7a5638"; // cocoa
const BEAD_CHANGE = "#ffd166"; // gold
const BEAD_EMPTY = "#2c3252";

const STALL = [YARD_STALL[0] - YARD_AREA.x, YARD_STALL[1] - YARD_AREA.z];
const BOARD = [YARD_BOARD[0] - YARD_AREA.x, YARD_BOARD[1] - YARD_AREA.z];

const BEAD_R = 0.135;
const BEAD_GAP = 0.31;

/** Board-local position of bead i (0–99): row 0 on TOP, reading order. */
function beadPos(i) {
  const row = Math.floor(i / 10);
  const col = i % 10;
  return [(col - 4.5) * BEAD_GAP, 3.3 - row * BEAD_GAP, 0.1];
}

/** How many change beads are lit right now. */
function changeBeads(round, status, onesAt, tensAt) {
  if (status === "ones" || !onesAt) return 0;
  const onesLit = Math.min(round.onesHop, Math.floor((Date.now() - onesAt) / YARD_BEAD_MS));
  if (status === "tens" || !tensAt) return onesLit;
  const tensLit = Math.min(round.tensHop, Math.floor((Date.now() - tensAt) / (YARD_BEAD_MS / 2)));
  return Math.min(round.change, round.onesHop + tensLit);
}

function Stall() {
  return (
    <group position={[STALL[0], 0, STALL[1]]} rotation={[0, 0.35, 0]}>
      {/* Counter + posts + striped awning. */}
      <mesh castShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[2.6, 1.1, 1.0]} />
        <meshStandardMaterial color={WOOD} />
      </mesh>
      {[-1.15, 1.15].map((dx) => (
        <mesh key={dx} castShadow position={[dx, 1.5, -0.4]}>
          <boxGeometry args={[0.1, 2.0, 0.1]} />
          <meshStandardMaterial color={WOOD_DARK} />
        </mesh>
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} castShadow position={[(i - 2.5) * 0.48, 2.55, -0.1]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.48, 0.06, 1.1]} />
          <meshStandardMaterial color={i % 2 ? AWNING_A : AWNING_B} />
        </mesh>
      ))}
      {/* The steaming mug on the counter. */}
      <mesh castShadow position={[0.6, 1.28, 0.1]}>
        <cylinderGeometry args={[0.18, 0.15, 0.32, 12]} />
        <meshStandardMaterial color="#e8eef8" />
      </mesh>
      <mesh position={[0.6, 1.42, 0.1]}>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 12]} />
        <meshStandardMaterial color={BEAD_PAID} />
      </mesh>
      <Html position={[0, 3.0, 0]} center distanceFactor={11} className="ix-badge-anchor" zIndexRange={[24, 0]}>
        <div className="fc-count-chip">☕ cocoa stall</div>
      </Html>
    </group>
  );
}

export default function LodgeYardChallenge() {
  const status = useLodgeYard((s) => s.status);
  const shown = useLodgeYard((s) => s.currentRound());
  const onesAt = useLodgeYard((s) => s.onesFilledAt);
  const tensAt = useLodgeYard((s) => s.tensFilledAt);
  const active = status !== "idle" && status !== "intro";
  const tick = useRef(0);
  const [, force] = React.useReducer((n) => n + 1, 0);
  useFrame((state) => {
    if (status !== "tens" && status !== "typing") return; // beads filling
    if (state.clock.elapsedTime - tick.current > 0.08) {
      tick.current = state.clock.elapsedTime;
      force();
    }
  });

  if (!active || !shown) return null;

  const lit =
    status === "celebrate" || status === "feedback"
      ? shown.change
      : changeBeads(shown, status, onesAt, tensAt);

  const chip =
    status === "ones"
      ? `${shown.price} + ? → the next ten`
      : status === "tens"
        ? `${shown.afterOnes} + ? → 100`
        : status === "typing"
          ? shown.onesHop === 0
            ? `${shown.price} + ${shown.tensHop} = 100 — change?`
            : shown.tensHop === 0
              ? `${shown.price} + ${shown.onesHop} = 100 — change?`
              : `${shown.onesHop} + ${shown.tensHop} = change?`
          : `100 − ${shown.price} = ${shown.change}`;

  return (
    <group position={[YARD_AREA.x, 0, YARD_AREA.z]}>
      <Stall />

      {/* The hundred-bead board on its stand. */}
      <group position={[BOARD[0], 0, BOARD[1]]} rotation={[0, -0.25, 0]}>
        {[-1.6, 1.6].map((dx) => (
          <mesh key={dx} castShadow position={[dx, 1.8, -0.06]}>
            <boxGeometry args={[0.12, 3.6, 0.12]} />
            <meshStandardMaterial color={WOOD_DARK} />
          </mesh>
        ))}
        <mesh castShadow position={[0, 1.85, -0.05]}>
          <boxGeometry args={[3.4, 3.4, 0.08]} />
          <meshStandardMaterial color={WOOD} />
        </mesh>
        {Array.from({ length: 100 }, (_, i) => {
          const paid = i < shown.price;
          const change = !paid && i < shown.price + lit;
          return (
            <mesh key={i} position={beadPos(i)}>
              <sphereGeometry args={[BEAD_R, 8, 8]} />
              <meshStandardMaterial
                color={paid ? BEAD_PAID : change ? BEAD_CHANGE : BEAD_EMPTY}
                emissive={paid ? BEAD_PAID : change ? BEAD_CHANGE : BEAD_EMPTY}
                emissiveIntensity={change ? 0.9 : paid ? 0.25 : 0.15}
              />
            </mesh>
          );
        })}
        <Html position={[0, 4.1, 0]} center distanceFactor={10} className="ix-badge-anchor" zIndexRange={[24, 0]}>
          <div className="milk-display">{chip}</div>
        </Html>
      </group>

      {status === "celebrate" && <ConfettiBurst origin={[BOARD[0], 2.6, BOARD[1] + 0.6]} />}
    </group>
  );
}
