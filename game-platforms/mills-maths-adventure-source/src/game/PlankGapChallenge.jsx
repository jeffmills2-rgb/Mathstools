import React from "react";
import { Html } from "@react-three/drei";

import { PLANK_AREA } from "../data/farm/farmLayout.js";
import { PLANK_TWELFTHS, PLANK_PIECES, twDisplay } from "../data/farm/plankGapChallenge.js";
import { usePlankGap } from "./plankGapStore.js";
import { ConfettiBurst } from "./OrderPartsChallenge.jsx";

/**
 * PLANK THE GAP — 3D layer (F12). A gap in a fence rail (in the middle of the
 * cow paddock): the total width is drawn to scale over a faint TWELFTHS grid,
 * the pre-filled part (subtraction rounds) sits weathered on the left, and the
 * student's laid planks stack up left→right, each coloured by its size. When
 * the planks fill the gap exactly → confetti.
 */

const UNIT = 2.6; // world units per WHOLE (1 = 12 twelfths)
const RAIL_Y = 0.62;
const POST = "#7d5a37";
const WOOD = "#9a7248";
const PRE_FILL = "#c2a878";
const GRID = "#efe4c8";
const GAP_HOLE = "#3f2d1c";
const COLOR_BY_TW = Object.fromEntries(PLANK_PIECES.map((p) => [p.tw, p.color]));

function twX(tw, leftX) {
  return leftX + (tw / PLANK_TWELFTHS) * UNIT;
}

function Post({ x }) {
  return (
    <mesh position={[x, 0.7, 0]} castShadow>
      <boxGeometry args={[0.22, 1.4, 0.22]} />
      <meshStandardMaterial color={POST} />
    </mesh>
  );
}

/** A horizontal rail segment from world x=a to x=b (the intact fence). */
function Rail({ a, b, y }) {
  const len = b - a;
  if (len <= 0.01) return null;
  return (
    <mesh position={[(a + b) / 2, y, -0.12]} castShadow>
      <boxGeometry args={[len, 0.14, 0.1]} />
      <meshStandardMaterial color={WOOD} />
    </mesh>
  );
}

function GapBuild({ round }) {
  const laid = usePlankGap((s) => s.laid);
  const status = usePlankGap((s) => s.status);
  const result = usePlankGap((s) => s.result);

  const totalW = (round.totalTw / PLANK_TWELFTHS) * UNIT;
  const leftX = -totalW / 2;
  const rightX = totalW / 2;
  const filledTw = laid.reduce((a, b) => a + b, 0);
  const answered = status === "celebrate" || status === "feedback";

  // Cumulative plank segments (after the pre-filled portion).
  let cum = round.preTw;
  const segs = laid.map((tw, i) => {
    const a = cum;
    cum += tw;
    return { a, b: cum, tw, key: i };
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Intact fence rails either side of the gap + a long back rail. */}
      <Rail a={leftX - 5} b={leftX} y={RAIL_Y} />
      <Rail a={rightX} b={rightX + 5} y={RAIL_Y} />
      <Rail a={leftX - 5} b={leftX} y={RAIL_Y - 0.4} />
      <Rail a={rightX} b={rightX + 5} y={RAIL_Y - 0.4} />
      <Post x={leftX - 5} />
      <Post x={leftX} />
      <Post x={rightX} />
      <Post x={rightX + 5} />

      {/* The empty gap (a dark recess) — the plank slot. */}
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[totalW + 0.05, 0.5, 0.62]} />
        <meshStandardMaterial color={GAP_HOLE} />
      </mesh>

      {/* Faint twelfths grid — drawn ONLY across the still-EMPTY part of the gap
          (from where the filling has reached, to the far post). Filled sections
          read as solid timber, so the ticks always show exactly "how much is
          left to fill" — i.e. the answer to total − laid, made visible. */}
      {Array.from({ length: round.totalTw + 1 }, (_, k) => {
        const filledUpTo = round.preTw + filledTw;
        if (k < filledUpTo) return null; // solid where already filled
        const isWhole = k % PLANK_TWELFTHS === 0;
        const isEdge = k === filledUpTo;
        const h = isWhole ? 0.7 : 0.5;
        return (
          <mesh key={`g${k}`} position={[twX(k, leftX), 0.28 + h / 2 - 0.25, 0.34]}>
            <boxGeometry args={[0.03, h, 0.04]} />
            <meshStandardMaterial color={isEdge ? "#ffd166" : GRID} />
          </mesh>
        );
      })}

      {/* The pre-filled portion (subtraction rounds) — solid weathered planks,
          clearly ALREADY laid, with a label so the trough reads as "part done,
          the rest is the gap you work out". */}
      {round.preTw > 0 && (
        <>
          <mesh position={[twX(round.preTw / 2, leftX), 0.3, 0.05]} castShadow>
            <boxGeometry args={[(round.preTw / PLANK_TWELFTHS) * UNIT, 0.42, 0.56]} />
            <meshStandardMaterial color={PRE_FILL} />
          </mesh>
          <Html position={[twX(round.preTw / 2, leftX), -0.5, 0]} center distanceFactor={13} className="ix-badge-anchor" zIndexRange={[24, 0]}>
            <div className="fc-count-chip" style={{ borderColor: "#8a6a44", background: "#efe0cf", color: "#6f4a2a" }}>
              already laid {round.preStr}
            </div>
          </Html>
        </>
      )}

      {/* The student's laid planks — coloured by size, in order. */}
      {segs.map((s) => {
        const cx = twX((s.a + s.b) / 2, leftX);
        const len = ((s.b - s.a) / PLANK_TWELFTHS) * UNIT;
        return (
          <mesh key={s.key} position={[cx, 0.34, 0.08]} castShadow>
            <boxGeometry args={[len - 0.03, 0.46, 0.58]} />
            <meshStandardMaterial
              color={COLOR_BY_TW[s.tw] || "#c9a227"}
              emissive={COLOR_BY_TW[s.tw] || "#c9a227"}
              emissiveIntensity={0.15}
            />
          </mesh>
        );
      })}

      {/* Labels: the empty gap = the subtraction (bridge), + the running total.
          Subtraction rounds spell out "the empty gap IS total − laid" right over
          the gap, so the sum and the physical hole are the same thing. */}
      <Html position={[0, -0.85, 0]} center distanceFactor={12} className="ix-badge-anchor" zIndexRange={[24, 0]}>
        <div className="milk-display">
          {round.kind === "subtract" ? `empty gap = ${round.totalStr} − ${round.preStr} = ?` : `Fill ${round.gapStr}`}
        </div>
      </Html>
      <Html position={[rightX + 1.5, 0.9, 0]} center distanceFactor={11} className="ix-badge-anchor" zIndexRange={[24, 0]}>
        <div className="fc-count-chip" style={{ borderColor: filledTw === round.gapTw ? "#2a9d2a" : "#7a5200" }}>
          laid {twDisplay(filledTw)}
        </div>
      </Html>

      {answered && (
        <Html position={[0, -0.85, 0]} center distanceFactor={12} className="ix-badge-anchor" zIndexRange={[24, 0]}>
          <div className="milk-display">
            {round.kind === "subtract"
              ? `${round.totalStr} − ${round.preStr} = ${round.gapStr}`
              : round.gapStr} {result && result.correct ? "✓" : ""}
          </div>
        </Html>
      )}
      {status === "celebrate" && <ConfettiBurst origin={[0, 1.4, 0]} />}
    </group>
  );
}

export default function PlankGapChallenge() {
  const status = usePlankGap((s) => s.status);
  const shown = usePlankGap((s) => s.currentRound());
  const active = status !== "idle" && status !== "intro";

  return (
    <group position={[PLANK_AREA.x, 0, PLANK_AREA.z]}>
      {active && shown && <GapBuild round={shown} />}
      {/* Idle dressing: a small stack of planks waiting by the gap. */}
      {!active &&
        [0, 1, 2].map((i) => (
          <mesh key={i} position={[2.4, 0.15 + i * 0.16, 0.6]} rotation={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[1.6, 0.14, 0.5]} />
            <meshStandardMaterial color={WOOD} />
          </mesh>
        ))}
    </group>
  );
}
