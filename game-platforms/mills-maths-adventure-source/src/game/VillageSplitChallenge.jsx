import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";

import {
  VILLAGE_AREA,
  VILLAGE_LEFT_STAND,
  VILLAGE_RIGHT_STAND,
  VILLAGE_BUILD_SITE,
} from "../data/snow/snowLayout.js";
import { useVillageSplit } from "./villageSplitStore.js";
import { VILLAGE_BLOCK_MS, VILLAGE_SNAP_MS } from "../data/snow/villageSplitChallenge.js";
import { ConfettiBurst } from "./OrderPartsChallenge.jsx";

/**
 * IGLOO VILLAGE — 3D layer (VG). Two part-built igloos stand on block
 * stands, each made of big TEN-BLOCKS (a stacked wall) and small ONE-BLOCKS
 * (a little pile) — the numbers' structure visible before any adding. After
 * the join is answered, blocks FLY to the build site like with like: tens
 * stack into one wall, ones gather into one pile — and when the pile passes
 * ten, TEN one-blocks flash and SNAP into a fresh glowing ten-block that
 * slides onto the wall (the regroup, made physical). Correct total → the
 * finished igloo gets its dome + confetti.
 */

const ICE_TEN = "#9fdcf2";
const ICE_ONE = "#d8f0fb";
const ICE_NEW = "#ffe14d"; // the freshly snapped ten-block
const STAND = "#57462f";

const LEFT = [VILLAGE_LEFT_STAND[0] - VILLAGE_AREA.x, VILLAGE_LEFT_STAND[1] - VILLAGE_AREA.z];
const RIGHT = [VILLAGE_RIGHT_STAND[0] - VILLAGE_AREA.x, VILLAGE_RIGHT_STAND[1] - VILLAGE_AREA.z];
const SITE = [VILLAGE_BUILD_SITE[0] - VILLAGE_AREA.x, VILLAGE_BUILD_SITE[1] - VILLAGE_AREA.z];

const TEN_W = 1.05;
const TEN_H = 0.5;
const ONE_S = 0.34;

/** A ten-block (a big ice brick). */
function TenBlock({ position, fresh }) {
  return (
    <mesh castShadow position={position}>
      <boxGeometry args={[TEN_W, TEN_H, 0.6]} />
      <meshStandardMaterial
        color={fresh ? ICE_NEW : ICE_TEN}
        emissive={fresh ? ICE_NEW : ICE_TEN}
        emissiveIntensity={fresh ? 0.8 : 0.25}
        transparent
        opacity={0.95}
      />
    </mesh>
  );
}

/** A one-block (a small ice cube). */
function OneBlock({ position, hot }) {
  return (
    <mesh castShadow position={position}>
      <boxGeometry args={[ONE_S, ONE_S, ONE_S]} />
      <meshStandardMaterial
        color={ICE_ONE}
        emissive={hot ? ICE_NEW : ICE_ONE}
        emissiveIntensity={hot ? 0.9 : 0.2}
        transparent
        opacity={0.95}
      />
    </mesh>
  );
}

/** Ten-block k's local slot in a wall (2 per course). */
function tenSlot(k) {
  return [(k % 2 - 0.5) * (TEN_W + 0.08), TEN_H / 2 + Math.floor(k / 2) * (TEN_H + 0.06), 0];
}

/** One-block k's local slot in a pile (rows of 5 in front). */
function oneSlot(k) {
  return [((k % 5) - 2) * (ONE_S + 0.07), ONE_S / 2 + Math.floor(k / 5) * (ONE_S + 0.05), 0.85];
}

/** A source igloo: its ten wall + ones pile + count chip. */
function SourceIgloo({ local, tens, ones, count, hidden }) {
  if (hidden) return null;
  return (
    <group position={[local[0], 0.12, local[1]]}>
      <mesh receiveShadow position={[0, -0.06, 0.3]}>
        <boxGeometry args={[2.6, 0.12, 2.4]} />
        <meshStandardMaterial color={STAND} />
      </mesh>
      {Array.from({ length: tens }, (_, k) => (
        <TenBlock key={`t${k}`} position={tenSlot(k)} />
      ))}
      {Array.from({ length: ones }, (_, k) => (
        <OneBlock key={`o${k}`} position={oneSlot(k)} />
      ))}
      <Html position={[0, 2.3, 0.3]} center distanceFactor={11} className="ix-badge-anchor" zIndexRange={[24, 0]}>
        <div className="fc-count-chip">{count}</div>
      </Html>
    </group>
  );
}

/** The build phase timeline: how many blocks have LANDED at the site. */
function buildProgress(round, startedAt) {
  const totalTens = round.ta + round.tb;
  const elapsed = Date.now() - startedAt;
  const tensLanded = Math.max(0, Math.min(totalTens, Math.floor(elapsed / VILLAGE_BLOCK_MS)));
  const onesElapsed = elapsed - totalTens * VILLAGE_BLOCK_MS;
  const onesLanded = Math.max(0, Math.min(round.onesSum, Math.floor(onesElapsed / VILLAGE_BLOCK_MS)));
  const snapElapsed = onesElapsed - round.onesSum * VILLAGE_BLOCK_MS;
  // The regroup snap: after every block lands, ten ones flash then become a
  // fresh ten-block on the wall.
  const snapping = round.regroup && snapElapsed > 0 && snapElapsed < VILLAGE_SNAP_MS;
  const snapped = round.regroup && snapElapsed >= VILLAGE_SNAP_MS;
  const done = round.regroup ? snapped : tensLanded === totalTens && onesLanded === round.onesSum;
  return { tensLanded, onesLanded, snapping, snapped, done };
}

export default function VillageSplitChallenge() {
  const status = useVillageSplit((s) => s.status);
  const shown = useVillageSplit((s) => s.currentRound());
  const startedAt = useVillageSplit((s) => s.buildStartedAt);
  const active = status !== "idle" && status !== "intro";
  const tick = useRef(0);
  const [, force] = React.useReducer((n) => n + 1, 0);
  useFrame((state) => {
    if (status !== "typing") return; // the build animates during typing
    if (state.clock.elapsedTime - tick.current > 0.1) {
      tick.current = state.clock.elapsedTime;
      force();
    }
  });

  if (!active || !shown) return null;

  const building = (status === "typing" || status === "celebrate" || status === "feedback") && startedAt > 0;
  const prog = building
    ? status === "typing"
      ? buildProgress(shown, startedAt)
      : { tensLanded: shown.ta + shown.tb, onesLanded: shown.onesSum, snapping: false, snapped: shown.regroup, done: true }
    : { tensLanded: 0, onesLanded: 0, snapping: false, snapped: false, done: false };

  // What stands at the build site right now.
  const siteTens = prog.tensLanded + (prog.snapped ? 1 : 0);
  const siteOnes = prog.snapped ? shown.onesSum - 10 : prog.onesLanded;

  const chip =
    status === "predicting"
      ? `${shown.a} + ${shown.b} ?`
      : status === "joining"
        ? `tens with tens, ones with ones…`
        : status === "typing"
          ? prog.snapped
            ? `${shown.tensSum} + 10 + ${shown.onesSum - 10} = ?`
            : `${shown.tensSum} + ${shown.onesSum} = ?`
          : `${shown.a} + ${shown.b} = ${shown.total}`;

  return (
    <group position={[VILLAGE_AREA.x, 0, VILLAGE_AREA.z]}>
      {/* The two source igloos (emptied once their blocks have flown). */}
      <SourceIgloo local={LEFT} tens={building ? 0 : shown.ta} ones={building ? 0 : shown.oa} count={shown.a} hidden={false} />
      <SourceIgloo local={RIGHT} tens={building ? 0 : shown.tb} ones={building ? 0 : shown.ob} count={shown.b} hidden={false} />

      {/* The build site: the joined wall + pile (+ the snap). */}
      <group position={[SITE[0], 0.12, SITE[1]]}>
        <mesh receiveShadow position={[0, -0.06, 0.3]}>
          <boxGeometry args={[3.2, 0.12, 2.6]} />
          <meshStandardMaterial color={STAND} />
        </mesh>
        {Array.from({ length: siteTens }, (_, k) => (
          <TenBlock key={`t${k}`} position={tenSlot(k)} fresh={prog.snapped && k === siteTens - 1} />
        ))}
        {Array.from({ length: siteOnes }, (_, k) => (
          <OneBlock key={`o${k}`} position={oneSlot(k)} hot={prog.snapping && k < 10} />
        ))}
        {/* The finished dome appears on the correct total. */}
        {status === "celebrate" && (
          <mesh castShadow position={[0, 1.9, 0.2]}>
            <sphereGeometry args={[1.3, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={ICE_TEN} emissive={ICE_TEN} emissiveIntensity={0.4} transparent opacity={0.85} />
          </mesh>
        )}
      </group>

      {/* The running sentence above the build site. */}
      <Html position={[SITE[0], 3.6, SITE[1]]} center distanceFactor={10} className="ix-badge-anchor" zIndexRange={[24, 0]}>
        <div className="milk-display">{chip}</div>
      </Html>

      {status === "celebrate" && <ConfettiBurst origin={[SITE[0], 2.4, SITE[1] + 0.5]} />}
    </group>
  );
}
