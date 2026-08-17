import React, { useMemo, useRef, useState, useLayoutEffect, Suspense } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html, useGLTF } from "@react-three/drei";

import {
  FARM_BOUNDS,
  FARM_LANES,
  FARM_YARD,
  FARM_BARN,
  FARM_SILO,
  FARM_WINDMILL,
  FARM_PADDOCKS,
  FARM_MUD,
  FARM_POND,
  FARM_CROPS,
  FARM_SCARECROW,
  FARM_HAY_BALES,
  FARM_TREES,
  ROUNDUP_PEN,
  FARM_RECORDS_STAND,
  AUTUMN_TREES,
  DISTANT_TREES,
  BIG_AMBER,
  BOUNDARY_FENCE,
  HORIZON_HILLS,
  MILK_TRUCK,
  COW_WANDER,
  PIG_WANDER,
} from "../data/farm/farmLayout.js";
import { playerState } from "./sessionStore.js";
import { isAnyChallengeActive, useFarmChallengeActive } from "./farmChallengeActive.js";
import Footprints from "./Footprints.jsx";
import { farmBestPercent, medalFor } from "../data/farm/farmRecords.js";
import { useFarmChallenge } from "./farmChallengeStore.js";
import { useRoundUp } from "./roundUpStore.js";
import { useOrderParts } from "./orderPartsStore.js";
import { useCratePacking } from "./cratePackingStore.js";
import { useMilkSplitter } from "./milkSplitterStore.js";
import { useWeighStation } from "./weighStationStore.js";
import { useTradingPost } from "./tradingPostStore.js";
import { useVeggiePlot } from "./veggiePlotStore.js";
import { usePlankGap } from "./plankGapStore.js";
import { useFarmShop } from "./farmShopStore.js";

/**
 * PARTS OF A WHOLE FARM — SCENERY (F1). All geometry is derived from
 * farmLayout.js (shared with the colliders). Low-poly primitives in the same
 * soft-cartoon style as the island/schoolyard. Paddock interiors are kept
 * EMPTY — reserved for Meshy-style animals (cows, pigs, sheep) later.
 */

const GRASS = "#8ecf6a";
const GRASS_DARK = "#7cbf5b";
const DIRT = "#c9a06a";
const FENCE_WOOD = "#9a7248";
const POST_WOOD = "#7d5a37";

// ---- Small shared pieces ----------------------------------------------------

function FenceRun({ x1, z1, x2, z2, gap = null }) {
  // Posts every ~2.2 m with two horizontal rails between consecutive posts.
  const pieces = useMemo(() => {
    const len = Math.hypot(x2 - x1, z2 - z1);
    const steps = Math.max(1, Math.round(len / 2.2));
    const posts = [];
    const rails = [];
    const pt = (i) => ({ x: x1 + ((x2 - x1) * i) / steps, z: z1 + ((z2 - z1) * i) / steps });
    const inGap = (p) => gap && Math.hypot(p.x - gap.x, p.z - gap.z) < gap.halfWidth;
    for (let i = 0; i <= steps; i++) {
      const p = pt(i);
      if (!inGap(p)) posts.push(p);
      if (i < steps) {
        const q = pt(i + 1);
        if (!inGap(p) && !inGap(q)) {
          rails.push({ x: (p.x + q.x) / 2, z: (p.z + q.z) / 2, len: Math.hypot(q.x - p.x, q.z - p.z), rot: Math.atan2(-(q.z - p.z), q.x - p.x) });
        }
      }
    }
    return { posts, rails };
  }, [x1, z1, x2, z2, gap]);

  return (
    <group>
      {pieces.posts.map((p, i) => (
        <mesh key={`p${i}`} position={[p.x, 0.55, p.z]} castShadow>
          <boxGeometry args={[0.18, 1.1, 0.18]} />
          <meshStandardMaterial color={POST_WOOD} />
        </mesh>
      ))}
      {pieces.rails.map((r, i) => (
        <group key={`r${i}`} position={[r.x, 0, r.z]} rotation={[0, r.rot, 0]}>
          <mesh position={[0, 0.85, 0]} castShadow>
            <boxGeometry args={[r.len, 0.09, 0.07]} />
            <meshStandardMaterial color={FENCE_WOOD} />
          </mesh>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[r.len, 0.09, 0.07]} />
            <meshStandardMaterial color={FENCE_WOOD} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Paddock({ p, hideLabel = false }) {
  const hw = p.w / 2;
  const hd = p.d / 2;
  const west = p.x - hw, east = p.x + hw, north = p.z - hd, south = p.z + hd;
  const g = p.gate || {};
  const gapHalf = (g.width || 0) / 2 + 0.4;
  const gapFor = (side) => {
    if (g.side !== side) return null;
    if (side === "north") return { x: p.x + (g.offset || 0), z: north, halfWidth: gapHalf };
    if (side === "south") return { x: p.x + (g.offset || 0), z: south, halfWidth: gapHalf };
    if (side === "east") return { x: east, z: p.z + (g.offset || 0), halfWidth: gapHalf };
    return { x: west, z: p.z + (g.offset || 0), halfWidth: gapHalf };
  };
  return (
    <group>
      {/* Slightly darker pasture inside the fence. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[p.x, 0.015, p.z]} receiveShadow>
        <planeGeometry args={[p.w - 1, p.d - 1]} />
        <meshStandardMaterial color={GRASS_DARK} />
      </mesh>
      <FenceRun x1={west} z1={north} x2={east} z2={north} gap={gapFor("north")} />
      <FenceRun x1={west} z1={south} x2={east} z2={south} gap={gapFor("south")} />
      <FenceRun x1={east} z1={north} x2={east} z2={south} gap={gapFor("east")} />
      <FenceRun x1={west} z1={north} x2={west} z2={south} gap={gapFor("west")} />
      {p.label && !hideLabel && (
        /* zIndexRange keeps the label UNDER the challenge cards (z 28). */
        <Html position={[p.x, 2.4, p.z]} center distanceFactor={22} className="ix-badge-anchor" zIndexRange={[24, 0]}>
          <div className="unlock-sign open">{p.label}</div>
        </Html>
      )}
    </group>
  );
}

function Barn() {
  const { x, z, w, d, wall, roof, trim } = FARM_BARN;
  const H = 4.2;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, H, d]} />
        <meshStandardMaterial color={wall} />
      </mesh>
      {/* Gambrel-ish roof: a big triangular prism. */}
      <mesh position={[0, H + 1.1, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[(w * 0.72) / Math.SQRT2, (w * 0.72) / Math.SQRT2, d + 0.6]} />
        <meshStandardMaterial color={roof} />
      </mesh>
      {/* Big front doors (south face) + cross braces. */}
      <mesh position={[0, 1.5, d / 2 + 0.06]}>
        <boxGeometry args={[4.4, 3.0, 0.12]} />
        <meshStandardMaterial color={trim} />
      </mesh>
      <mesh position={[0, 1.5, d / 2 + 0.13]}>
        <boxGeometry args={[0.25, 3.0, 0.05]} />
        <meshStandardMaterial color={wall} />
      </mesh>
      {/* Hayloft window. */}
      <mesh position={[0, H + 0.9, d / 2 + 0.35]}>
        <cylinderGeometry args={[0.55, 0.55, 0.1, 16]} />
        <meshStandardMaterial color={trim} />
      </mesh>
    </group>
  );
}

function Silo() {
  const { x, z, radius, height } = FARM_SILO;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[radius, radius, height, 18]} />
        <meshStandardMaterial color="#d8dde2" />
      </mesh>
      <mesh position={[0, height + radius * 0.45, 0]} castShadow>
        <sphereGeometry args={[radius, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#aeb6bd" />
      </mesh>
    </group>
  );
}

function Windmill() {
  const { x, z, height } = FARM_WINDMILL;
  const blades = useRef();
  useFrame((_, dt) => {
    if (blades.current) blades.current.rotation.z += dt * 0.9;
  });
  return (
    <group position={[x, 0, z]}>
      {/* Tapered lattice tower. */}
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.25, 1.0, height, 6]} />
        <meshStandardMaterial color="#8a8f94" />
      </mesh>
      {/* Hub + four blades, facing south. */}
      <group ref={blades} position={[0, height + 0.3, 0.6]}>
        <mesh>
          <sphereGeometry args={[0.3, 10, 10]} />
          <meshStandardMaterial color="#5a5f64" />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 2]} position={[Math.cos((i * Math.PI) / 2) * 1.5, Math.sin((i * Math.PI) / 2) * 1.5, 0]}>
            <boxGeometry args={[i % 2 === 0 ? 2.6 : 0.5, i % 2 === 0 ? 0.5 : 2.6, 0.08]} />
            <meshStandardMaterial color="#e8e2d0" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function CropField() {
  const { x, z, rows, rowLength, rowGap } = FARM_CROPS;
  const plants = useMemo(() => {
    const out = [];
    for (let r = 0; r < rows; r++) {
      const rz = z - ((rows - 1) * rowGap) / 2 + r * rowGap;
      for (let i = 0; i <= Math.floor(rowLength / 1.4); i++) {
        out.push({ x: x - rowLength / 2 + i * 1.4, z: rz, s: 0.8 + ((r * 7 + i * 3) % 5) * 0.08 });
      }
    }
    return out;
  }, [x, z, rows, rowLength, rowGap]);
  return (
    <group>
      {/* Tilled soil bed. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.012, z]} receiveShadow>
        <planeGeometry args={[rowLength + 3, rows * rowGap + 3]} />
        <meshStandardMaterial color="#a97e50" />
      </mesh>
      {plants.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]} scale={p.s}>
          <mesh position={[0, 0.35, 0]} castShadow>
            <coneGeometry args={[0.28, 0.7, 6]} />
            <meshStandardMaterial color="#4f9d3f" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Scarecrow() {
  const { x, z } = FARM_SCARECROW;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 1.8, 8]} />
        <meshStandardMaterial color={POST_WOOD} />
      </mesh>
      <mesh position={[0, 1.35, 0]} castShadow>
        <boxGeometry args={[1.3, 0.12, 0.12]} />
        <meshStandardMaterial color={POST_WOOD} />
      </mesh>
      <mesh position={[0, 1.35, 0]}>
        <boxGeometry args={[0.6, 0.55, 0.35]} />
        <meshStandardMaterial color="#c96f3b" />
      </mesh>
      <mesh position={[0, 1.95, 0]}>
        <sphereGeometry args={[0.26, 12, 12]} />
        <meshStandardMaterial color="#f0d9a8" />
      </mesh>
      <mesh position={[0, 2.2, 0]}>
        <coneGeometry args={[0.35, 0.4, 10]} />
        <meshStandardMaterial color="#d9b45c" />
      </mesh>
    </group>
  );
}

function HayBale({ x, z, rot }) {
  return (
    <mesh position={[x, 0.7, z]} rotation={[Math.PI / 2, 0, rot]} castShadow>
      <cylinderGeometry args={[0.7, 0.7, 1.3, 14]} />
      <meshStandardMaterial color="#dfc06a" />
    </mesh>
  );
}

// ---- World dressing (F7): boundary fence · hills · autumn trees ------------

const AMBER_COLORS = ["#c2542c", "#d97b33", "#d9a441"];

/** A liquid amber: taller trunk + layered autumn-coloured canopy. */
function AutumnTree({ position, scale = 1 }) {
  const [x, z] = position;
  return (
    <group position={[x, 0, z]} scale={scale}>
      <mesh castShadow position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 1.8, 8]} />
        <meshStandardMaterial color="#6e5140" />
      </mesh>
      <mesh castShadow position={[0, 2.2, 0]}>
        <sphereGeometry args={[1.2, 12, 10]} />
        <meshStandardMaterial color={AMBER_COLORS[0]} />
      </mesh>
      <mesh castShadow position={[0.55, 2.9, 0.25]}>
        <sphereGeometry args={[0.8, 10, 8]} />
        <meshStandardMaterial color={AMBER_COLORS[1]} />
      </mesh>
      <mesh castShadow position={[-0.5, 2.8, -0.2]}>
        <sphereGeometry args={[0.65, 10, 8]} />
        <meshStandardMaterial color={AMBER_COLORS[2]} />
      </mesh>
    </group>
  );
}

/**
 * THE big liquid amber landmark: a large autumn tree over a carpet of fallen
 * leaves. Walking through the carpet kicks the nearby leaves into a brief
 * flutter (they spin up, drift, and settle back down).
 */
function BigLiquidAmber() {
  const [ax, az] = BIG_AMBER.position;
  const leafRefs = useRef([]);
  const leaves = useMemo(() => {
    const out = [];
    for (let i = 0; i < BIG_AMBER.leafCount; i++) {
      const a = i * 2.399;
      const r = 0.6 + (i / BIG_AMBER.leafCount) * BIG_AMBER.leafRadius;
      out.push({
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        rot: (i * 1.7) % Math.PI,
        color: AMBER_COLORS[i % 3],
        vy: 0, vx: 0, vz: 0, y: 0.02, spin: 0,
      });
    }
    return out;
  }, []);
  const lastPlayer = useRef({ x: 0, z: 0 });

  useFrame((state, dt) => {
    const px = playerState.x - ax;
    const pz = playerState.z - az;
    const moving = Math.hypot(playerState.x - lastPlayer.current.x, playerState.z - lastPlayer.current.z) > 0.01;
    lastPlayer.current = { x: playerState.x, z: playerState.z };

    leaves.forEach((leaf, i) => {
      const m = leafRefs.current[i];
      if (!m) return;
      // Kick grounded leaves the player walks over (only while moving).
      if (moving && leaf.y <= 0.03) {
        const d = Math.hypot(px - leaf.x, pz - leaf.z);
        if (d < 1.1) {
          leaf.vy = 1.6 + Math.random() * 1.6;
          leaf.vx = (leaf.x - px) * (1.2 + Math.random()) + (Math.random() - 0.5);
          leaf.vz = (leaf.z - pz) * (1.2 + Math.random()) + (Math.random() - 0.5);
          leaf.spin = 6 + Math.random() * 8;
        }
      }
      if (leaf.y > 0.02 || leaf.vy > 0) {
        leaf.vy -= 4.5 * dt; // floaty leaf gravity
        leaf.x += leaf.vx * dt;
        leaf.z += leaf.vz * dt;
        leaf.y = Math.max(0.02, leaf.y + leaf.vy * dt);
        leaf.vx *= 1 - 1.6 * dt;
        leaf.vz *= 1 - 1.6 * dt;
        leaf.rot += leaf.spin * dt;
        if (leaf.y <= 0.02 && leaf.vy < 0) {
          leaf.vy = 0; leaf.vx = 0; leaf.vz = 0; leaf.spin = 0;
          // Keep the carpet under the canopy.
          const d = Math.hypot(leaf.x, leaf.z);
          if (d > BIG_AMBER.leafRadius) {
            leaf.x *= BIG_AMBER.leafRadius / d;
            leaf.z *= BIG_AMBER.leafRadius / d;
          }
        }
      }
      m.position.set(leaf.x, leaf.y, leaf.z);
      m.rotation.set(-Math.PI / 2 + Math.sin(leaf.rot) * 0.5, leaf.rot * 0.3, leaf.rot);
    });
  });

  return (
    <group position={[ax, 0, az]}>
      <AutumnTree position={[0, 0]} scale={2.1} />
      {leaves.map((leaf, i) => (
        <mesh
          key={i}
          ref={(el) => { leafRefs.current[i] = el; }}
          position={[leaf.x, leaf.y, leaf.z]}
          rotation={[-Math.PI / 2, 0, leaf.rot]}
        >
          <planeGeometry args={[0.22, 0.16]} />
          <meshStandardMaterial color={leaf.color} side={2} />
        </mesh>
      ))}
    </group>
  );
}

/** Tall WHITE-PICKET boundary fence around the whole property: closely-spaced
 *  white pickets (~2.2 m) with pointed tops + two rails. Non-jumpable in the
 *  collider layer (farmColliders.js) so the player can't hop out of the farm. */
const PICKET_WHITE = "#f4f4ef";
function BoundaryFence() {
  const { halfW, halfD } = BOUNDARY_FENCE;
  const edges = [
    { from: [-halfW, -halfD], to: [halfW, -halfD] },
    { from: [-halfW, halfD], to: [halfW, halfD] },
    { from: [-halfW, -halfD], to: [-halfW, halfD] },
    { from: [halfW, -halfD], to: [halfW, halfD] },
  ];
  return (
    <group>
      {edges.map((e, ei) => {
        const [x1, z1] = e.from;
        const [x2, z2] = e.to;
        const len = Math.hypot(x2 - x1, z2 - z1);
        const rot = Math.atan2(-(z2 - z1), x2 - x1);
        const pickets = Math.round(len / 1.5); // closely-spaced pickets
        return (
          <group key={ei} position={[(x1 + x2) / 2, 0, (z1 + z2) / 2]} rotation={[0, rot, 0]}>
            {/* Two horizontal rails tying the pickets together. */}
            {[1.5, 0.7].map((y) => (
              <mesh key={y} position={[0, y, 0]} castShadow>
                <boxGeometry args={[len, 0.12, 0.08]} />
                <meshStandardMaterial color={PICKET_WHITE} />
              </mesh>
            ))}
            {Array.from({ length: pickets + 1 }, (_, i) => {
              const px = -len / 2 + (len * i) / pickets;
              return (
                <group key={`p${i}`} position={[px, 0, 0]}>
                  {/* Picket: a tall thin white slat. */}
                  <mesh position={[0, 1.05, 0]} castShadow>
                    <boxGeometry args={[0.16, 2.1, 0.09]} />
                    <meshStandardMaterial color={PICKET_WHITE} />
                  </mesh>
                  {/* Pointed top (4-sided pyramid cap). */}
                  <mesh position={[0, 2.24, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                    <coneGeometry args={[0.13, 0.28, 4]} />
                    <meshStandardMaterial color={PICKET_WHITE} />
                  </mesh>
                </group>
              );
            })}
          </group>
        );
      })}
    </group>
  );
}

/** Hazy rolling hills out on the horizon (softened by the fog). */
function HorizonHills() {
  return (
    <group>
      {HORIZON_HILLS.map(([x, z, sx, sy, sz], i) => (
        <mesh key={i} position={[x, -1.5, z]} scale={[sx, sy, sz]}>
          <sphereGeometry args={[1, 14, 10]} />
          <meshStandardMaterial color={i % 2 ? "#86b06a" : "#7aa763"} />
        </mesh>
      ))}
    </group>
  );
}

/** The milk truck — parked by the Milk Splitter's dairy corner (F8). Uses
 *  the teacher's Meshy tanker (public/models/milk-truck.glb), with the
 *  primitive truck below as the fallback until/unless it loads. Tune
 *  MILK_TRUCK_SCALE / the layout rotationY on first look. */
const MILK_TRUCK_URL = `${import.meta.env.BASE_URL}models/milk-truck.glb`;
const MILK_TRUCK_SCALE = 2.2;
try { useGLTF.preload(MILK_TRUCK_URL); } catch { /* ignore */ }

function MilkTruckModel() {
  const { scene } = useGLTF(MILK_TRUCK_URL);
  return <primitive object={scene} scale={MILK_TRUCK_SCALE} />;
}

function MilkTruck() {
  const [x, z] = MILK_TRUCK.position;
  return (
    <group position={[x, 0, z]} rotation={[0, MILK_TRUCK.rotationY || 0, 0]}>
      <StandErrorBoundary fallback={<PrimitiveMilkTruck />}>
        <Suspense fallback={<PrimitiveMilkTruck />}>
          <MilkTruckModel />
        </Suspense>
      </StandErrorBoundary>
    </group>
  );
}

function PrimitiveMilkTruck() {
  return (
    <group>
      {/* Chassis + cab. */}
      <mesh castShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[4.6, 0.35, 1.9]} />
        <meshStandardMaterial color="#4a5563" />
      </mesh>
      <mesh castShadow position={[1.75, 1.25, 0]}>
        <boxGeometry args={[1.2, 1.15, 1.8]} />
        <meshStandardMaterial color="#3a7bd5" />
      </mesh>
      <mesh position={[2.36, 1.3, 0]}>
        <boxGeometry args={[0.06, 0.6, 1.5]} />
        <meshStandardMaterial color="#cfe4ff" />
      </mesh>
      {/* The milk tank. */}
      <mesh castShadow position={[-0.7, 1.45, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.85, 0.85, 2.9, 18]} />
        <meshStandardMaterial color="#f3f0e8" metalness={0.25} roughness={0.35} />
      </mesh>
      <mesh position={[-0.7, 1.45, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.87, 0.87, 1.0, 18]} />
        <meshStandardMaterial color="#3a7bd5" />
      </mesh>
      {/* Wheels. */}
      {[[-1.7, 0.85], [-1.7, -0.85], [0.4, 0.85], [0.4, -0.85], [1.8, 0.85], [1.8, -0.85]].map(([wx, wz], i) => (
        <mesh key={i} position={[wx, 0.35, wz]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.24, 12]} />
          <meshStandardMaterial color="#23272e" />
        </mesh>
      ))}
    </group>
  );
}

function FarmTree({ position }) {
  const [x, z] = position;
  return (
    <group position={[x, 0, z]}>
      <mesh castShadow position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.2, 0.26, 1.4, 8]} />
        <meshStandardMaterial color="#8d6e63" />
      </mesh>
      <mesh castShadow position={[0, 1.9, 0]}>
        <sphereGeometry args={[1.15, 12, 10]} />
        <meshStandardMaterial color="#5aa856" />
      </mesh>
      <mesh castShadow position={[0.5, 2.5, 0.2]}>
        <sphereGeometry args={[0.75, 10, 8]} />
        <meshStandardMaterial color="#6cb862" />
      </mesh>
    </group>
  );
}

/**
 * Trophy shelf (F5) — the CUPS on the trophy bench, coloured live from the
 * player's best scores: gold 100%, silver 75–99%, bronze 50–74%, and a small
 * empty pedestal below that. The bench itself is the `farm-records`
 * interactable (model "bench"); this renders on its seat.
 */
// A compact trophy whose BASE sits at its own origin (y = 0), so it can be
// dropped straight onto a pigeonhole shelf. Gold/silver/bronze bowl, or a small
// empty plinth when the challenge hasn't been medalled yet.
function ShelfTrophy({ percent }) {
  const medal = medalFor(percent);
  if (!medal) {
    return (
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.16, 0.1, 12]} />
        <meshStandardMaterial color="#9a8a76" />
      </mesh>
    );
  }
  return (
    <group>
      <mesh castShadow position={[0, 0.055, 0]}>
        <cylinderGeometry args={[0.13, 0.16, 0.11, 12]} />
        <meshStandardMaterial color="#7a6a56" />
      </mesh>
      <mesh castShadow position={[0, 0.27, 0]}>
        <cylinderGeometry args={[0.2, 0.1, 0.34, 14]} />
        <meshStandardMaterial color={medal.color} emissive={medal.color} emissiveIntensity={0.25} metalness={0.5} roughness={0.35} />
      </mesh>
      {[-0.22, 0.22].map((dx) => (
        <mesh key={dx} position={[dx, 0.31, 0]}>
          <torusGeometry args={[0.075, 0.025, 8, 14]} />
          <meshStandardMaterial color={medal.color} metalness={0.5} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

// The GRAND trophy — a large gold cup with a star, awarded on top of the
// cabinet only when every challenge is gold (a perfect farm). Base at y = 0.
function GrandTrophy() {
  const gold = "#ffd166";
  return (
    <group>
      <mesh castShadow position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.26, 0.32, 0.12, 16]} />
        <meshStandardMaterial color="#8a6a2a" />
      </mesh>
      <mesh castShadow position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.16, 0.2, 0.14, 16]} />
        <meshStandardMaterial color="#7a6a56" />
      </mesh>
      <mesh castShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.34, 0.14, 0.6, 18]} />
        <meshStandardMaterial color={gold} emissive={gold} emissiveIntensity={0.4} metalness={0.6} roughness={0.25} />
      </mesh>
      {[-0.36, 0.36].map((dx) => (
        <mesh key={dx} position={[dx, 0.56, 0]}>
          <torusGeometry args={[0.12, 0.035, 8, 16]} />
          <meshStandardMaterial color={gold} metalness={0.6} roughness={0.25} />
        </mesh>
      ))}
      {/* A star crowning the cup. */}
      <mesh position={[0, 0.92, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.04, 5]} />
        <meshStandardMaterial color={gold} emissive={gold} emissiveIntensity={0.6} metalness={0.6} roughness={0.2} />
      </mesh>
    </group>
  );
}

// The teacher's trophy-stand model (public/models/trophy.glb): a cabinet with
// TEN pigeonhole shelves (2 rows × 5) — one per farm challenge — plus an arched
// top. Falls back to a primitive bench until/unless the glb loads.
const TROPHY_STAND_URL = `${import.meta.env.BASE_URL}models/trophy.glb`;
const TROPHY_STAND_SCALE = 1.5;
// The whole assembly is scaled up so the stand reads as a landmark by the
// entrance fence. The cups are placed by MEASURING the cabinet's bounding box
// (below), so they self-fit whatever the glb's real size is — doubling this
// just makes everything bigger while the trophies stay in their pigeonholes.
const TROPHY_STAND_GROUP_SCALE = 5.2;
// The grand gold trophy that appears ON TOP once all ten challenges are gold.
const GRAND_Y = 0.50;   // height on the cabinet (fraction from base) — the top ledge
const GRAND_SCALE = 0.5; // size as a fraction of cabinet height
// Pigeonhole layout as FRACTIONS of the measured cabinet box. These were read
// DIRECTLY off the trophy.glb mesh (vertex-density peaks = horizontal shelf
// surfaces): the plinth top (lower shelf) sits at ~0.12 of the 1.5-unit height,
// the middle divider top (upper shelf) at ~0.32, and the top ledge at ~0.50.
// Each cubby is ~0.14 tall, so the cups are sized to ~0.10 to sit with headroom.
const PH_COLS = 5;
const PH_X_INSET = 0.12;   // horizontal inset of the outer columns
const PH_ROW_UPPER = 0.32; // upper shelf row (top of the middle divider)
const PH_ROW_LOWER = 0.12; // lower shelf row (top of the plinth)
const PH_Z_FRAC = 0.70;    // depth toward the front opening (0 back → 1 front)
const PH_CUP = 0.22;       // trophy size as a fraction of cabinet height
try { useGLTF.preload(TROPHY_STAND_URL); } catch { /* ignore */ }

function TrophyStandModel({ onMeasured }) {
  const { scene } = useGLTF(TROPHY_STAND_URL);
  const ref = useRef();
  useLayoutEffect(() => {
    if (!ref.current || !onMeasured) return;
    ref.current.updateWorldMatrix(true, true);
    onMeasured(new THREE.Box3().setFromObject(ref.current));
  }, [scene, onMeasured]);
  return <primitive ref={ref} object={scene} scale={TROPHY_STAND_SCALE} />;
}

class StandErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { /* fall back silently */ }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function FallbackBench() {
  return (
    <group>
      {[-1.1, 1.1].map((dx) => (
        <mesh key={dx} castShadow position={[dx, 0.3, 0]}>
          <boxGeometry args={[0.22, 0.6, 0.7]} />
          <meshStandardMaterial color="#6b4f2a" />
        </mesh>
      ))}
      <mesh castShadow position={[0, 0.66, 0]}>
        <boxGeometry args={[3.0, 0.14, 0.9]} />
        <meshStandardMaterial color="#c98f4a" />
      </mesh>
    </group>
  );
}

function TrophyShelf() {
  // Reactive: the stores' bestScore updates the moment a set finishes.
  const fenceBest = useFarmChallenge((s) => s.bestScore);
  const roundupBest = useRoundUp((s) => s.bestScore);
  const orderBest = useOrderParts((s) => s.bestScore);
  const crateBest = useCratePacking((s) => s.bestScore);
  const milkBest = useMilkSplitter((s) => s.bestScore);
  const weighBest = useWeighStation((s) => s.bestScore);
  const tradeBest = useTradingPost((s) => s.bestScore);
  const veggieBest = useVeggiePlot((s) => s.bestScore);
  const plankBest = usePlankGap((s) => s.bestScore);
  const shopBest = useFarmShop((s) => s.bestScore);
  const [x, z] = FARM_RECORDS_STAND.position;

  const groupRef = useRef();
  const [box, setBox] = useState(null); // cabinet AABB in WORLD space

  // Ten challenges in reading order → the 2×5 pigeonhole grid.
  const entries = [
    ["fence", fenceBest], ["roundup", roundupBest], ["order", orderBest],
    ["crate", crateBest], ["milk", milkBest], ["weigh", weighBest],
    ["trade", tradeBest], ["veggie", veggieBest], ["plank", plankBest],
    ["shop", shopBest],
  ];

  // Convert the measured world-space box into this group's LOCAL frame, then
  // lay the 2×5 grid across the cabinet — fully self-fitting to the model.
  const placed = useMemo(() => {
    if (!box || !groupRef.current) return null;
    groupRef.current.updateWorldMatrix(true, false);
    const inv = new THREE.Matrix4().copy(groupRef.current.matrixWorld).invert();
    const local = new THREE.Box3();
    const v = new THREE.Vector3();
    for (const xx of [box.min.x, box.max.x]) {
      for (const yy of [box.min.y, box.max.y]) {
        for (const zz of [box.min.z, box.max.z]) {
          v.set(xx, yy, zz).applyMatrix4(inv);
          local.expandByPoint(v);
        }
      }
    }
    const w = local.max.x - local.min.x;
    const h = local.max.y - local.min.y;
    const dz = local.max.z - local.min.z;
    if (!(w > 0 && h > 0)) return null;
    const x0 = local.min.x + w * PH_X_INSET;
    const x1 = local.max.x - w * PH_X_INSET;
    const zFront = local.min.z + dz * PH_Z_FRAC;
    const cupScale = h * PH_CUP;
    const cups = entries.map(([key, best], i) => {
      const col = i % PH_COLS;
      const row = Math.floor(i / PH_COLS); // 0 = upper, 1 = lower
      const px = x0 + (x1 - x0) * (col / (PH_COLS - 1));
      const py = local.min.y + h * (row === 0 ? PH_ROW_UPPER : PH_ROW_LOWER);
      return { key, best, px, py, pz: zFront, cupScale };
    });
    // Every challenge gold → the grand trophy stands on top.
    const allGold = entries.every(([key, best]) => {
      const m = medalFor(farmBestPercent(key, best));
      return m && m.id === "gold";
    });
    const grand = {
      x: (local.min.x + local.max.x) / 2,
      y: local.min.y + h * GRAND_Y,
      z: local.min.z + dz * 0.5,
      scale: h * GRAND_SCALE,
    };
    return { cups, allGold, grand };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [box, fenceBest, roundupBest, orderBest, crateBest, milkBest, weighBest, tradeBest, veggieBest, plankBest, shopBest]);

  return (
    <group ref={groupRef} position={[x, 0, z]} rotation={[0, FARM_RECORDS_STAND.rotationY || 0, 0]} scale={TROPHY_STAND_GROUP_SCALE}>
      <StandErrorBoundary fallback={<FallbackBench />}>
        <Suspense fallback={<FallbackBench />}>
          <TrophyStandModel onMeasured={setBox} />
        </Suspense>
      </StandErrorBoundary>
      {/* One dynamic trophy per pigeonhole (gold/silver/bronze/empty), placed
          from the measured cabinet box so they always sit ON the shelves. */}
      {placed && placed.cups.map(({ key, best, px, py, pz, cupScale }) => (
        <group key={key} position={[px, py, pz]} scale={cupScale}>
          <ShelfTrophy percent={farmBestPercent(key, best)} />
        </group>
      ))}
      {/* The grand gold trophy on top — only when every challenge is gold. */}
      {placed && placed.allGold && (
        <group position={[placed.grand.x, placed.grand.y, placed.grand.z]} scale={placed.grand.scale}>
          <GrandTrophy />
        </group>
      )}
    </group>
  );
}

// ---- Wandering cows (F12) — black-and-white Holsteins in the cow paddock ----

/** One low-poly Holstein, facing +z (front). */
function Cow() {
  const WHITE = "#f4f4f0";
  const BLACK = "#2b2b2b";
  return (
    <group scale={0.9}>
      {/* Legs. */}
      {[[-0.32, -0.45], [0.32, -0.45], [-0.32, 0.45], [0.32, 0.45]].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.28, lz]} castShadow>
          <boxGeometry args={[0.13, 0.56, 0.13]} />
          <meshStandardMaterial color={BLACK} />
        </mesh>
      ))}
      {/* Body (white) + black patches. */}
      <mesh position={[0, 0.78, 0]} castShadow>
        <boxGeometry args={[0.95, 0.62, 1.4]} />
        <meshStandardMaterial color={WHITE} />
      </mesh>
      <mesh position={[0.2, 0.98, 0.25]} castShadow>
        <boxGeometry args={[0.55, 0.28, 0.5]} />
        <meshStandardMaterial color={BLACK} />
      </mesh>
      <mesh position={[-0.28, 0.92, -0.35]} castShadow>
        <boxGeometry args={[0.45, 0.3, 0.45]} />
        <meshStandardMaterial color={BLACK} />
      </mesh>
      {/* Head + snout + ears (front, +z). */}
      <mesh position={[0, 0.9, 0.9]} castShadow>
        <boxGeometry args={[0.5, 0.46, 0.46]} />
        <meshStandardMaterial color={WHITE} />
      </mesh>
      <mesh position={[0, 0.82, 1.15]}>
        <boxGeometry args={[0.34, 0.3, 0.14]} />
        <meshStandardMaterial color="#d9a0a0" />
      </mesh>
      {[-0.28, 0.28].map((e) => (
        <mesh key={e} position={[e, 1.12, 0.86]}>
          <boxGeometry args={[0.13, 0.1, 0.18]} />
          <meshStandardMaterial color={BLACK} />
        </mesh>
      ))}
      {/* Tail. */}
      <mesh position={[0, 0.7, -0.75]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.06, 0.5, 0.06]} />
        <meshStandardMaterial color={BLACK} />
      </mesh>
    </group>
  );
}

const COW_COUNT = 5;
function WanderingCows() {
  const refs = useRef([]);
  const cows = useRef(null);
  if (!cows.current) {
    const b = COW_WANDER;
    cows.current = Array.from({ length: COW_COUNT }, (_, i) => {
      const x = b.minX + ((i + 0.5) / COW_COUNT) * (b.maxX - b.minX);
      const z = b.minZ + (0.25 + 0.5 * (i % 2)) * (b.maxZ - b.minZ);
      return { x, z, tx: x, tz: z, speed: 0.55 + (i % 3) * 0.18, wait: 0.5 + i * 0.4 };
    });
  }
  useFrame((_, dt) => {
    // Ambient herd holds still while a challenge runs (the Round-Up's own
    // task cows are a separate component and are unaffected).
    if (isAnyChallengeActive()) return;
    const b = COW_WANDER;
    cows.current.forEach((c, i) => {
      const g = refs.current[i];
      if (!g) return;
      const dx = c.tx - c.x;
      const dz = c.tz - c.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.4) {
        // Arrived → graze a moment, then pick a new spot to amble to.
        if (c.wait <= 0) c.wait = 1.5 + Math.random() * 3.5;
        c.wait -= dt;
        if (c.wait <= 0) {
          c.tx = b.minX + Math.random() * (b.maxX - b.minX);
          c.tz = b.minZ + Math.random() * (b.maxZ - b.minZ);
        }
      } else {
        const step = Math.min(d, c.speed * dt);
        c.x += (dx / d) * step;
        c.z += (dz / d) * step;
        g.rotation.y = Math.atan2(dx, dz);
      }
      g.position.x = c.x;
      g.position.z = c.z;
      g.position.y = Math.abs(Math.sin((c.x + c.z) * 1.6)) * 0.03; // gentle plod bob
    });
  });
  return (
    <group>
      {cows.current.map((c, i) => (
        <group key={i} ref={(el) => { refs.current[i] = el; }} position={[c.x, 0, c.z]}>
          <Cow />
        </group>
      ))}
    </group>
  );
}

// ---- Wandering pigs (F1) — pink piglets snuffling round the pig pen ---------

/** One low-poly pig, facing +z (front). Snout, ears and a little curly tail. */
function Pig() {
  const PINK = "#e8a0b0";
  const SNOUT = "#d97f95";
  const HOOF = "#7a5560";
  return (
    <group scale={0.6}>
      {/* Legs. */}
      {[[-0.26, -0.34], [0.26, -0.34], [-0.26, 0.34], [0.26, 0.34]].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.18, lz]} castShadow>
          <boxGeometry args={[0.14, 0.36, 0.14]} />
          <meshStandardMaterial color={HOOF} />
        </mesh>
      ))}
      {/* Round body. */}
      <mesh position={[0, 0.56, 0]} castShadow>
        <boxGeometry args={[0.7, 0.56, 1.05]} />
        <meshStandardMaterial color={PINK} />
      </mesh>
      {/* Head (front, +z). */}
      <mesh position={[0, 0.6, 0.68]} castShadow>
        <boxGeometry args={[0.5, 0.46, 0.4]} />
        <meshStandardMaterial color={PINK} />
      </mesh>
      {/* Snout. */}
      <mesh position={[0, 0.54, 0.92]}>
        <cylinderGeometry args={[0.13, 0.15, 0.14, 12]} />
        <meshStandardMaterial color={SNOUT} />
      </mesh>
      {/* Ears. */}
      {[-0.17, 0.17].map((e) => (
        <mesh key={e} position={[e, 0.86, 0.6]} rotation={[0.3, 0, 0]}>
          <coneGeometry args={[0.1, 0.18, 4]} />
          <meshStandardMaterial color={SNOUT} />
        </mesh>
      ))}
      {/* Curly tail (a little torus at the back). */}
      <mesh position={[0, 0.62, -0.56]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.09, 0.03, 6, 12]} />
        <meshStandardMaterial color={PINK} />
      </mesh>
    </group>
  );
}

const PIG_COUNT = 8;
function WanderingPigs() {
  const refs = useRef([]);
  const pigs = useRef(null);
  if (!pigs.current) {
    const b = PIG_WANDER;
    pigs.current = Array.from({ length: PIG_COUNT }, (_, i) => {
      // Spread the starting spots across the pen in a rough grid.
      const cols = 4;
      const cx = (i % cols + 0.5) / cols;
      const cz = (Math.floor(i / cols) + 0.5) / Math.ceil(PIG_COUNT / cols);
      const x = b.minX + cx * (b.maxX - b.minX);
      const z = b.minZ + cz * (b.maxZ - b.minZ);
      return { x, z, tx: x, tz: z, speed: 0.5 + (i % 3) * 0.16, wait: 0.4 + i * 0.3 };
    });
  }
  useFrame((_, dt) => {
    const b = PIG_WANDER;
    pigs.current.forEach((c, i) => {
      const g = refs.current[i];
      if (!g) return;
      const dx = c.tx - c.x;
      const dz = c.tz - c.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.35) {
        // Arrived → snuffle a moment, then pick a new spot to trot to.
        if (c.wait <= 0) c.wait = 1.2 + Math.random() * 3.0;
        c.wait -= dt;
        if (c.wait <= 0) {
          c.tx = b.minX + Math.random() * (b.maxX - b.minX);
          c.tz = b.minZ + Math.random() * (b.maxZ - b.minZ);
        }
      } else {
        const step = Math.min(d, c.speed * dt);
        c.x += (dx / d) * step;
        c.z += (dz / d) * step;
        g.rotation.y = Math.atan2(dx, dz);
      }
      g.position.x = c.x;
      g.position.z = c.z;
      g.position.y = Math.abs(Math.sin((c.x + c.z) * 2.2)) * 0.025; // quick little trot bob
    });
  });
  return (
    <group>
      {pigs.current.map((c, i) => (
        <group key={i} ref={(el) => { refs.current[i] = el; }} position={[c.x, 0, c.z]}>
          <Pig />
        </group>
      ))}
    </group>
  );
}

// ---- Jumping pond fish (F1) — small orange fish leap out of the duck pond ----

/** One little orange fish, long axis along +z, that arcs out of the water and
 *  splashes back at intermittent intervals. Rendered INSIDE the pond group, so
 *  x/z are offsets from the pond centre and y is the height above the water. */
const FISH_COUNT = 4;
const FISH_ORANGE = "#f4913e";
const FISH_FIN = "#e2701c";

function Fish() {
  return (
    <group>
      {/* Body — a stretched sphere. */}
      <mesh scale={[0.16, 0.2, 0.42]} castShadow>
        <sphereGeometry args={[1, 12, 10]} />
        <meshStandardMaterial color={FISH_ORANGE} />
      </mesh>
      {/* Tail fin at the back (−z). */}
      <mesh position={[0, 0, -0.44]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.13, 0.22, 4]} />
        <meshStandardMaterial color={FISH_FIN} side={2} />
      </mesh>
      {/* Top fin. */}
      <mesh position={[0, 0.16, 0]} rotation={[-0.3, 0, 0]}>
        <coneGeometry args={[0.07, 0.16, 4]} />
        <meshStandardMaterial color={FISH_FIN} side={2} />
      </mesh>
    </group>
  );
}

function PondFish() {
  const refs = useRef([]);
  const fish = useRef(null);
  const R = FARM_POND.radius - 1.4; // keep leaps inside the water surface
  if (!fish.current) {
    fish.current = Array.from({ length: FISH_COUNT }, (_, i) => ({
      t: 0,                                   // progress through the current leap (0..dur)
      dur: 0,                                 // leap duration once airborne
      wait: 0.8 + i * 1.3,                    // stagger the first jumps
      x: 0, z: 0, dx: 0, dz: 0, peak: 0, heading: 0,
      jumping: false,
    }));
  }
  useFrame((_, dt) => {
    fish.current.forEach((f, i) => {
      const g = refs.current[i];
      if (!g) return;
      if (!f.jumping) {
        // Resting below the surface — hidden until the next leap.
        g.visible = false;
        f.wait -= dt;
        if (f.wait <= 0) {
          // Start a new leap from a random spot inside the pond.
          const a = Math.random() * Math.PI * 2;
          const r = Math.sqrt(Math.random()) * R;
          f.x = Math.cos(a) * r;
          f.z = Math.sin(a) * r;
          const dir = Math.random() * Math.PI * 2;
          const travel = 0.8 + Math.random() * 1.2;
          f.dx = Math.cos(dir) * travel;
          f.dz = Math.sin(dir) * travel;
          f.heading = Math.atan2(f.dx, f.dz);
          f.peak = 0.9 + Math.random() * 0.9;
          f.dur = 0.75 + Math.random() * 0.35;
          f.t = 0;
          f.jumping = true;
        }
        return;
      }
      // Airborne — parabolic arc; nose up on the way out, nose down splashing in.
      f.t += dt;
      const u = f.t / f.dur;         // 0..1
      if (u >= 1) {
        f.jumping = false;
        f.wait = 2.5 + Math.random() * 4.5; // intermittent gap before the next leap
        g.visible = false;
        return;
      }
      const y = 4 * f.peak * u * (1 - u);          // parabola: 0 → peak → 0
      const vy = 4 * f.peak * (1 - 2 * u);         // vertical velocity (for the pitch)
      g.visible = true;
      g.position.set(f.x + f.dx * u, 0.05 + y, f.z + f.dz * u);
      g.rotation.set(-Math.atan2(vy, 2.2), f.heading, 0);
    });
  });
  return (
    <group>
      {fish.current.map((_, i) => (
        <group key={i} ref={(el) => { refs.current[i] = el; }} visible={false}>
          <Fish />
        </group>
      ))}
    </group>
  );
}

// ---- Pig-pen mud splashes — brown droplets kicked up when walking the wallow -
function MudSplash() {
  const [mx, mz] = FARM_MUD.center;
  const R = FARM_MUD.radius;
  const POOL = 24;
  const drops = useRef(null);
  if (!drops.current) {
    drops.current = Array.from({ length: POOL }, () => ({ live: false, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 }));
  }
  const refs = useRef([]);
  const cursor = useRef(0);
  const acc = useRef(0);
  const last = useRef({ x: playerState.x, z: playerState.z });

  useFrame((_, dt) => {
    const dx = playerState.x - last.current.x;
    const dz = playerState.z - last.current.z;
    const moved = Math.hypot(dx, dz);
    last.current = { x: playerState.x, z: playerState.z };
    const inMud = Math.hypot(playerState.x - mx, playerState.z - mz) < R && playerState.y < 0.6;

    if (inMud && moved > 0.001) {
      acc.current += moved;
      if (acc.current >= 0.45) {
        acc.current = 0;
        for (let k = 0; k < 3; k++) {
          const d = drops.current[cursor.current];
          d.live = true;
          d.x = playerState.x + (Math.random() - 0.5) * 0.35;
          d.z = playerState.z + (Math.random() - 0.5) * 0.35;
          d.y = 0.06;
          d.vy = 1.6 + Math.random() * 1.7;
          d.vx = (Math.random() - 0.5) * 1.8;
          d.vz = (Math.random() - 0.5) * 1.8;
          cursor.current = (cursor.current + 1) % POOL;
        }
      }
    }

    for (let i = 0; i < POOL; i++) {
      const m = refs.current[i];
      if (!m) continue;
      const d = drops.current[i];
      if (!d.live) { if (m.visible) m.visible = false; continue; }
      d.vy -= 9 * dt;
      d.x += d.vx * dt; d.y += d.vy * dt; d.z += d.vz * dt;
      if (d.y <= 0.02 && d.vy < 0) { d.live = false; m.visible = false; continue; }
      m.visible = true;
      m.position.set(d.x, d.y, d.z);
    }
  });

  return (
    <group>
      {Array.from({ length: POOL }).map((_, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }} visible={false}>
          <sphereGeometry args={[0.09, 6, 5]} />
          <meshStandardMaterial color="#5a3d28" />
        </mesh>
      ))}
    </group>
  );
}

// ---- The region --------------------------------------------------------------

export default function FarmScenery() {
  // Paddock name labels are signposts for a student WALKING the farm. While
  // ANY challenge runs they come down — floating world text sitting in front
  // of the challenge props is the single biggest source of visual clutter
  // (was Veggie-Plot-only; generalised with the snow-world pass).
  const challengeActive = useFarmChallengeActive();
  return (
    <group>
      {/* Base pasture — extends WELL past the boundary fence so the horizon
          hills + distant trees sit on grass, fading into the fog. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[FARM_BOUNDS.width + 160, FARM_BOUNDS.height + 160]} />
        <meshStandardMaterial color={GRASS} />
      </mesh>

      {/* World dressing (F7): property fence, horizon, autumn colour. */}
      <BoundaryFence />
      <HorizonHills />
      {DISTANT_TREES.map((t, i) =>
        t.autumn ? (
          <AutumnTree key={`dt${i}`} position={t.pos} scale={1.3} />
        ) : (
          <FarmTree key={`dt${i}`} position={t.pos} />
        )
      )}
      {AUTUMN_TREES.map((pos, i) => (
        <AutumnTree key={`at${i}`} position={pos} />
      ))}
      <BigLiquidAmber />

      {/* Dirt lanes + the barn yard. */}
      {FARM_LANES.map((l) => (
        <mesh key={l.id} rotation={[-Math.PI / 2, 0, 0]} position={[l.x, 0.01, l.z]} receiveShadow>
          <planeGeometry args={[l.w, l.d]} />
          <meshStandardMaterial color={DIRT} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[FARM_YARD.center[0], 0.011, FARM_YARD.center[1]]} receiveShadow>
        <circleGeometry args={[FARM_YARD.radius, 40]} />
        <meshStandardMaterial color={DIRT} />
      </mesh>

      {/* Buildings + landmarks. */}
      <Barn />
      <Silo />
      <Windmill />
      <CropField />
      <Scarecrow />
      <TrophyShelf />
      <MilkTruck />

      {/* Five black-and-white cows wander the cow paddock (around Plank the Gap). */}
      <WanderingCows />

      {/* Eight pigs snuffle around the pig pen. */}
      <WanderingPigs />

      {/* Paddocks — interiors EMPTY, ready for Meshy cows/pigs/sheep. */}
      {FARM_PADDOCKS.map((p) => (
        <Paddock key={p.id} p={p} hideLabel={challengeActive} />
      ))}

      {/* Round-Up sorting pen (F3) — the herd + challenge live in
          RoundUpChallenge.jsx; the pen itself is static scenery. */}
      <Paddock p={ROUNDUP_PEN} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ROUNDUP_PEN.x, 0.018, ROUNDUP_PEN.z]} receiveShadow>
        <planeGeometry args={[ROUNDUP_PEN.w - 1.2, ROUNDUP_PEN.d - 1.2]} />
        <meshStandardMaterial color={DIRT} />
      </mesh>

      {/* Pig-pen mud wallow — bare earth (grass excluded), with muddy footprints
          + splashes when the player wades through it. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[FARM_MUD.center[0], 0.02, FARM_MUD.center[1]]} receiveShadow>
        <circleGeometry args={[FARM_MUD.radius, 28]} />
        <meshStandardMaterial color="#8a6a4b" />
      </mesh>
      <Footprints
        test={(x, z) => Math.hypot(x - FARM_MUD.center[0], z - FARM_MUD.center[1]) < FARM_MUD.radius}
        color="#4a3220"
        size={0.2}
        life={2.5}
        stride={0.5}
      />
      <MudSplash />

      {/* Duck pond — with small orange fish leaping out at intervals. */}
      <group position={[FARM_POND.center[0], 0, FARM_POND.center[1]]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
          <circleGeometry args={[FARM_POND.radius, 36]} />
          <meshStandardMaterial color="#4cc9f0" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, 0]}>
          <circleGeometry args={[FARM_POND.radius + 0.8, 36]} />
          <meshStandardMaterial color="#d9c58f" />
        </mesh>
        <PondFish />
      </group>

      {/* Hay bales + trees. */}
      {FARM_HAY_BALES.map((b, i) => (
        <HayBale key={i} x={b[0]} z={b[1]} rot={b[2]} />
      ))}
      {FARM_TREES.map((pos, i) => (
        <FarmTree key={i} position={pos} />
      ))}
    </group>
  );
}
