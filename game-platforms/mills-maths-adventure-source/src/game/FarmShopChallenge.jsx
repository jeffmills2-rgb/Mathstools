import React from "react";
import { Html } from "@react-three/drei";

import { SHOP_AREA } from "../data/farm/farmLayout.js";
import { useFarmShop } from "./farmShopStore.js";
import { ConfettiBurst } from "./OrderPartsChallenge.jsx";

/**
 * THE FARM SHOP — 3D layer (F13). A market stall (counter + striped awning) just
 * in front of the windmill. A chalkboard beside the till shows the market-day
 * LEDGER as each step is revealed (cost → marked → sale → GST), so the running
 * price the panel asks about is always visible on the stall. Correct → confetti.
 */

const POST = "#7d5a37";
const COUNTER = "#a9814e";
const COUNTER_TOP = "#c8a063";
const AWNING_A = "#c94f39";
const AWNING_B = "#f3e9d6";

function Awning() {
  // Eight alternating stripes sloping down toward the customer (+z).
  const stripes = 8;
  const width = 5.4;
  const w = width / stripes;
  return (
    <group position={[0, 2.35, 0.2]} rotation={[-0.32, 0, 0]}>
      {Array.from({ length: stripes }, (_, i) => (
        <mesh key={i} position={[-width / 2 + w / 2 + i * w, 0, 0]} castShadow>
          <boxGeometry args={[w, 0.08, 1.5]} />
          <meshStandardMaterial color={i % 2 === 0 ? AWNING_A : AWNING_B} />
        </mesh>
      ))}
      {/* Scalloped valance along the front edge. */}
      {Array.from({ length: stripes }, (_, i) => (
        <mesh key={`v${i}`} position={[-width / 2 + w / 2 + i * w, -0.18, 0.75]} castShadow>
          <boxGeometry args={[w - 0.04, 0.28, 0.06]} />
          <meshStandardMaterial color={i % 2 === 0 ? AWNING_B : AWNING_A} />
        </mesh>
      ))}
    </group>
  );
}

function Stall() {
  return (
    <group>
      {/* Counter body + top. */}
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.0, 1.1, 1.2]} />
        <meshStandardMaterial color={COUNTER} />
      </mesh>
      <mesh position={[0, 1.16, 0]} castShadow>
        <boxGeometry args={[5.4, 0.16, 1.5]} />
        <meshStandardMaterial color={COUNTER_TOP} />
      </mesh>
      {/* Corner posts holding the awning. */}
      {[-2.6, 2.6].map((x) => (
        <mesh key={x} position={[x, 1.6, -0.55]} castShadow>
          <boxGeometry args={[0.16, 3.2, 0.16]} />
          <meshStandardMaterial color={POST} />
        </mesh>
      ))}
      <Awning />
    </group>
  );
}

/** A little crate of produce on the counter (the current product). */
function Crate({ emoji }) {
  return (
    <group position={[-1.7, 1.5, 0.2]}>
      <mesh castShadow>
        <boxGeometry args={[1.0, 0.5, 0.8]} />
        <meshStandardMaterial color="#8a5a2b" />
      </mesh>
      <Html position={[0, 0.55, 0]} center distanceFactor={10} className="ix-badge-anchor" zIndexRange={[24, 0]}>
        <div className="shop-crate-emoji">{emoji}</div>
      </Html>
    </group>
  );
}

function ShopScene({ round }) {
  const status = useFarmShop((s) => s.status);
  const result = useFarmShop((s) => s.result);
  const answered = status === "celebrate" || status === "feedback";
  const g = round.given || {};

  // Ledger rows revealed so far this round (chain rounds build these up).
  const rows = [];
  if (g.costStr) rows.push(["Cost", g.costStr]);
  if (g.markedStr) rows.push(["Marked", g.markedStr]);
  if (g.saleStr) rows.push(["Sale", g.saleStr]);
  if (round.kind === "gst") rows.push(["+GST", `${g.gstRate}%`]);
  if (round.kind === "restock") rows.push([`${g.pct}% =`, `${g.part}`]);
  if (round.kind === "percentof") rows.push(["Sold", `${g.a} of ${g.b}`]);

  return (
    <group>
      <Stall />
      <Crate emoji={round.product.emoji} />

      {/* Chalkboard ledger on the right post — the running market-day figures. */}
      <Html position={[2.9, 1.7, 0.2]} center distanceFactor={11} className="ix-badge-anchor" zIndexRange={[24, 0]}>
        <div className="shop-board">
          <div className="shop-board-title">{round.chainId ? "Market day" : "Stall"}</div>
          {rows.map(([k, v]) => (
            <div className="shop-board-row" key={k}><span>{k}</span><b>{v}</b></div>
          ))}
        </div>
      </Html>

      {/* After answering, show the resolved value on the counter (below the
          diagram so it never clashes with the 2D panel). */}
      {answered && (
        <Html position={[0, -0.6, 0.8]} center distanceFactor={12} className="ix-badge-anchor" zIndexRange={[24, 0]}>
          <div className="milk-display">{round.answerStr} {result && result.correct ? "✓" : ""}</div>
        </Html>
      )}
      {status === "celebrate" && <ConfettiBurst origin={[0, 2.0, 0.4]} />}
    </group>
  );
}

export default function FarmShopChallenge() {
  const status = useFarmShop((s) => s.status);
  const round = useFarmShop((s) => s.currentRound());
  const active = status !== "idle" && status !== "intro";

  return (
    <group position={[SHOP_AREA.x, 0, SHOP_AREA.z]}>
      {/* The stall stands whether or not a game is running (a landmark). */}
      {!active && <Stall />}
      {active && round && <ShopScene round={round} />}
    </group>
  );
}
