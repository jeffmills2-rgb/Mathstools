import React, { useMemo, useRef, Suspense } from "react";
import { Html, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

import { useProgress } from "../progress/store.js";
import {
  SCHOOLYARD_BOUNDS,
  SCHOOLYARD_TIERS,
  SCHOOLYARD_STAIRS,
  SCHOOLYARD_TREES,
  SCHOOLYARD_PLANTERS,
  SCHOOLYARD_BUILDINGS,
  SCHOOLYARD_PLAZA,
  SCHOOLYARD_GATE,
  SCHOOLYARD_PODIUM,
  SCHOOLYARD_WELCOME_SIGN,
  SCHOOLYARD_PROPS,
} from "../data/schoolyard/schoolyardLayout.js";
import { schoolyardGroundHeight, tierAtZ } from "../data/schoolyard/schoolyardTerrain.js";
import { SCHOOLYARD_KEY_IDS, hasKey, isBossUnlocked, keysEarned } from "../data/schoolyard/schoolyardProgress.js";

/**
 * SCHOOLYARD SCENERY (W2-F) — a larger, TERRACED Coffs Coast quad: three tiers
 * stepping up toward the buildings, linked by central staircases, with big fig
 * trees, brick planters, perimeter buildings (heritage verandah + blue wall) and
 * a central plaza. Props sit at their tier height (schoolyardGroundHeight) so
 * they match the walkable terrain. Characters render as interactable NPCs
 * (World.jsx). Flat-shaded low-poly; the full art pass comes later.
 */

const STAIR_DEPTH = 3; // matches schoolyardTerrain

// ---- Landmark .glb props (front / two feature trees / Mills greeter) --------
// Each teacher model is loaded on demand and sits on its tier's ground height.
// A silent fallback (nothing) shows while it loads / if the file is missing, so
// the region never breaks. Scale/rotation/position come from SCHOOLYARD_PROPS.
const SY_MODEL_BASE = `${import.meta.env.BASE_URL}models/`;
SCHOOLYARD_PROPS.forEach((p) => {
  try { useGLTF.preload(SY_MODEL_BASE + p.file); } catch { /* ignore */ }
});

class ModelErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { /* fall back silently */ }
  render() { return this.state.failed ? (this.props.fallback || null) : this.props.children; }
}

function PropModel({ file, scale }) {
  const { scene } = useGLTF(SY_MODEL_BASE + file);
  const object = useMemo(() => scene.clone(true), [scene]);
  return <primitive object={object} scale={scale} />;
}

function SchoolyardProp({ prop }) {
  const [x, z] = prop.position;
  const baseY = schoolyardGroundHeight(x, z) + (prop.yOffset || 0);
  return (
    <group position={[x, baseY, z]} rotation={[0, prop.rotationY || 0, 0]}>
      <ModelErrorBoundary>
        <Suspense fallback={null}>
          <PropModel file={prop.file} scale={prop.scale} />
        </Suspense>
      </ModelErrorBoundary>
    </group>
  );
}

function BigTree({ x, z, baseY }) {
  return (
    <group position={[x, baseY, z]}>
      <mesh castShadow position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.35, 0.5, 2.2, 8]} />
        <meshStandardMaterial color="#6b4f3a" />
      </mesh>
      <mesh castShadow position={[0, 3.0, 0]}>
        <sphereGeometry args={[2.1, 14, 12]} />
        <meshStandardMaterial color="#3f7d4f" />
      </mesh>
      <mesh castShadow position={[1.2, 3.6, 0.4]}>
        <sphereGeometry args={[1.3, 12, 10]} />
        <meshStandardMaterial color="#4f9160" />
      </mesh>
      <mesh castShadow position={[-1.1, 3.4, -0.5]}>
        <sphereGeometry args={[1.2, 12, 10]} />
        <meshStandardMaterial color="#357044" />
      </mesh>
    </group>
  );
}

function Planter({ x, z, radius, baseY }) {
  return (
    <group position={[x, baseY, z]}>
      <mesh castShadow receiveShadow position={[0, 0.35, 0]}>
        <cylinderGeometry args={[radius, radius, 0.7, 20]} />
        <meshStandardMaterial color="#9c4a34" />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[radius - 0.25, radius - 0.25, 0.1, 20]} />
        <meshStandardMaterial color="#5a3d24" />
      </mesh>
      <mesh castShadow position={[0, 1.3, 0]}>
        <sphereGeometry args={[radius * 0.7, 12, 10]} />
        <meshStandardMaterial color="#4e8f52" />
      </mesh>
    </group>
  );
}

function Building({ x, z, w, d, wall, roof, verandah, baseY }) {
  const h = 5.2;
  const long = Math.max(w, d); // verandah runs along the building's long side
  return (
    <group position={[x, baseY, z]}>
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={wall} />
      </mesh>
      <mesh castShadow position={[0, h + 0.25, 0]}>
        <boxGeometry args={[w + 0.6, 0.5, d + 0.6]} />
        <meshStandardMaterial color={roof} />
      </mesh>
      {verandah && (
        <group position={[-(w / 2 + 1.2), 0, 0]}>
          <mesh castShadow position={[0, 3.1, 0]}>
            <boxGeometry args={[2.4, 0.25, long - 1]} />
            <meshStandardMaterial color={roof} />
          </mesh>
          {Array.from({ length: Math.max(2, Math.round(long / 5)) }).map((_, i, a) => {
            const zz = -(long / 2) + 1 + (i * (long - 2)) / (a.length - 1);
            return (
              <mesh key={i} castShadow position={[0.9, 1.5, zz]}>
                <cylinderGeometry args={[0.14, 0.14, 3.0, 8]} />
                <meshStandardMaterial color="#e8e2d6" />
              </mesh>
            );
          })}
        </group>
      )}
    </group>
  );
}

// ---------------------------------------------------------------------------
// CAMPUS BACKDROP — a purely DECORATIVE horizon that sits OUTSIDE the walkable
// bounds (x ∈ ±44, z ∈ ±30), so none of it is ever reachable or solid (no
// colliders): the player is clamped well inside it.
//   • North (Head Teacher side), West (Mr. Dawson side) and East sides each get
//     a LARGE double-storey brick building spanning the whole edge.
//   • South (the side Ms. Mahoney is nearest, where the player arrives) opens to
//     a COASTAL horizon: a sandy beach, ocean and a distant island.
// ---------------------------------------------------------------------------
const BRICK_WALL = "#9c5a44";
const BRICK_DARK = "#803f2c";
const BRICK_ROOF = "#5a3524";
const BRICK_TRIM = "#e7dcc6";
const WINDOW_GLASS = "#bcd6ec";

// A long double-storey brick building. Its windowed FRONT faces local +z; the
// caller rotates it so that front looks in toward the yard. length runs along
// local x, depth along local z. Two window rows + a floor band = "double storey".
function BrickBuilding({ x, z, length, depth = 6, rotationY = 0 }) {
  const STOREY = 4.6;
  const H = STOREY * 2;
  const cols = Math.max(3, Math.round(length / 7));
  const windows = [];
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < cols; i++) {
      const wx = -length / 2 + ((i + 0.5) * length) / cols;
      const wy = STOREY * (row + 0.5);
      windows.push({ wx, wy, key: `${row}-${i}` });
    }
  }
  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      {/* Main brick mass. */}
      <mesh castShadow receiveShadow position={[0, H / 2, 0]}>
        <boxGeometry args={[length, H, depth]} />
        <meshStandardMaterial color={BRICK_WALL} />
      </mesh>
      {/* A darker plinth. */}
      <mesh position={[0, 0.5, depth / 2 + 0.02]}>
        <boxGeometry args={[length, 1.0, 0.1]} />
        <meshStandardMaterial color={BRICK_DARK} />
      </mesh>
      {/* Flat parapet roof. */}
      <mesh castShadow position={[0, H + 0.35, 0]}>
        <boxGeometry args={[length + 0.8, 0.7, depth + 0.8]} />
        <meshStandardMaterial color={BRICK_ROOF} />
      </mesh>
      {/* Floor-dividing band (reads as two storeys). */}
      <mesh position={[0, STOREY, depth / 2 + 0.04]}>
        <boxGeometry args={[length, 0.35, 0.14]} />
        <meshStandardMaterial color={BRICK_TRIM} />
      </mesh>
      {/* Two rows of windows on the yard-facing side. */}
      {windows.map(({ wx, wy, key }) => (
        <mesh key={key} position={[wx, wy, depth / 2 + 0.06]}>
          <boxGeometry args={[2.2, 1.8, 0.12]} />
          <meshStandardMaterial color={WINDOW_GLASS} />
        </mesh>
      ))}
    </group>
  );
}

// A low-poly island out at sea (sand dome + green cap + a couple of palms).
function Island({ x, z, scale = 1 }) {
  return (
    <group position={[x, -0.05, z]} scale={scale}>
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[9, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#e6cf97" />
      </mesh>
      <mesh position={[0, 1.4, 0]}>
        <sphereGeometry args={[5.5, 16, 9, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#5f9e57" />
      </mesh>
      {[[-2.5, 0, 0.4], [2.2, 1, -0.6]].map(([px, pz, tilt], i) => (
        <group key={i} position={[px, 2.2, pz]} rotation={[0, 0, tilt]}>
          <mesh position={[0, 1.4, 0]}><cylinderGeometry args={[0.18, 0.3, 2.8, 6]} /><meshStandardMaterial color="#8a6a44" /></mesh>
          <mesh position={[0, 2.9, 0]}><sphereGeometry args={[1.1, 10, 7]} /><meshStandardMaterial color="#4f9160" /></mesh>
        </group>
      ))}
    </group>
  );
}

// ---- The south coast: gate → road (with traffic) → shops → beach → sea ------
// All of this sits SOUTH of the walkable bound (z ≥ 30) so it is pure backdrop.
const SEA_GATE_Z = 31;   // fence + gate separating the playground from the coast
const ROAD_Z = 39;       // coastal road (cars run east–west along it)
const SHOPS_Z = 48;      // a couple of buildings behind the road
const BEACH_Z = 60;      // sand behind the buildings
const ROAD_HALF = 60;    // cars turn around at ±ROAD_HALF

// A picket fence with a central gate, separating the yard from the coast road.
function SeaGate() {
  const postXs = [];
  for (let x = -44; x <= 44; x += 3.2) if (Math.abs(x) > 5) postXs.push(x);
  return (
    <group position={[0, 0, SEA_GATE_Z]}>
      {postXs.map((x) => (
        <mesh key={x} castShadow position={[x, 1, 0]}>
          <boxGeometry args={[0.18, 2, 0.18]} />
          <meshStandardMaterial color="#42506b" />
        </mesh>
      ))}
      {[[-24.5], [24.5]].map(([cx], i) => (
        <group key={i}>
          <mesh position={[cx, 1.5, 0]}><boxGeometry args={[39, 0.16, 0.16]} /><meshStandardMaterial color="#42506b" /></mesh>
          <mesh position={[cx, 0.6, 0]}><boxGeometry args={[39, 0.16, 0.16]} /><meshStandardMaterial color="#42506b" /></mesh>
        </group>
      ))}
      {/* Central gate: two pillars + a lintel + closed bars. */}
      <mesh castShadow position={[-5, 2.1, 0]}><boxGeometry args={[0.8, 4.2, 0.8]} /><meshStandardMaterial color="#8a5030" /></mesh>
      <mesh castShadow position={[5, 2.1, 0]}><boxGeometry args={[0.8, 4.2, 0.8]} /><meshStandardMaterial color="#8a5030" /></mesh>
      <mesh castShadow position={[0, 4.4, 0]}><boxGeometry args={[10.8, 0.7, 0.7]} /><meshStandardMaterial color="#6b3f2a" /></mesh>
      {[-3.6, -1.8, 0, 1.8, 3.6].map((x) => (
        <mesh key={x} position={[x, 2, 0]}><boxGeometry args={[0.16, 3.8, 0.16]} /><meshStandardMaterial color="#8d99ae" /></mesh>
      ))}
    </group>
  );
}

// The coastal road: dark asphalt strip with a dashed centre line.
function CoastRoad() {
  const dashes = [];
  for (let x = -ROAD_HALF; x <= ROAD_HALF; x += 6) dashes.push(x);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, ROAD_Z]} receiveShadow>
        <planeGeometry args={[2 * ROAD_HALF + 20, 8]} />
        <meshStandardMaterial color="#3a3f45" />
      </mesh>
      {dashes.map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, -0.02, ROAD_Z]}>
          <planeGeometry args={[2.4, 0.35]} />
          <meshStandardMaterial color="#e6c34a" />
        </mesh>
      ))}
    </group>
  );
}

// One simple low-poly car (length along +x by default → faces its travel dir).
const CAR_COLORS = ["#d64545", "#3a7bd5", "#e6b34a", "#4a9e5a", "#8d5bd0", "#e8853f"];
function Car({ color }) {
  return (
    <group>
      <mesh position={[0, 0.55, 0]} castShadow><boxGeometry args={[3.2, 0.7, 1.6]} /><meshStandardMaterial color={color} /></mesh>
      <mesh position={[-0.2, 1.05, 0]} castShadow><boxGeometry args={[1.6, 0.6, 1.4]} /><meshStandardMaterial color={color} /></mesh>
      {[0.71, -0.71].map((wz) => (
        <mesh key={wz} position={[-0.2, 1.05, wz]}><boxGeometry args={[1.4, 0.42, 0.04]} /><meshStandardMaterial color="#bcd6ec" /></mesh>
      ))}
      {[[-1, 0.8], [1, 0.8], [-1, -0.8], [1, -0.8]].map(([wx, wz], i) => (
        <mesh key={i} position={[wx, 0.3, wz]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.32, 0.32, 0.24, 10]} /><meshStandardMaterial color="#1c1c1c" /></mesh>
      ))}
    </group>
  );
}

// A few cars trundling back and forth along the coastal road (two lanes).
function TrafficCars() {
  const N = 6;
  const cars = useRef(null);
  if (!cars.current) {
    cars.current = Array.from({ length: N }, (_, i) => ({
      x: -ROAD_HALF + (i / N) * 2 * ROAD_HALF,
      dir: i % 2 === 0 ? 1 : -1,
      speed: 7 + (i % 3) * 2.5,
      lane: (i % 2 === 0 ? 1 : -1) * 1.7, // opposite lanes
      color: CAR_COLORS[i % CAR_COLORS.length],
    }));
  }
  const refs = useRef([]);
  useFrame((_, dt) => {
    cars.current.forEach((c, i) => {
      const g = refs.current[i];
      if (!g) return;
      c.x += c.dir * c.speed * dt;
      if (c.x > ROAD_HALF) { c.x = ROAD_HALF; c.dir = -1; }
      else if (c.x < -ROAD_HALF) { c.x = -ROAD_HALF; c.dir = 1; }
      g.position.x = c.x;
      g.rotation.y = c.dir > 0 ? 0 : Math.PI; // face travel direction
    });
  });
  return (
    <group>
      {cars.current.map((c, i) => (
        <group key={i} ref={(el) => { refs.current[i] = el; }} position={[c.x, 0, ROAD_Z + c.lane]} rotation={[0, c.dir > 0 ? 0 : Math.PI, 0]}>
          <Car color={c.color} />
        </group>
      ))}
    </group>
  );
}

// A couple of low-poly shops/houses between the road and the beach.
function CoastShops() {
  const items = [
    { x: -20, w: 10, d: 8, h: 6, wall: "#d9a06b", roof: "#7a4a35" },
    { x: 0, w: 12, d: 9, h: 7.5, wall: "#c98a5a", roof: "#6b3f2a" },
    { x: 22, w: 9, d: 8, h: 5.5, wall: "#e6c79c", roof: "#8a5030" },
  ];
  return (
    <group>
      {items.map((b, i) => (
        <group key={i} position={[b.x, 0, SHOPS_Z]}>
          <mesh position={[0, b.h / 2, 0]} castShadow receiveShadow><boxGeometry args={[b.w, b.h, b.d]} /><meshStandardMaterial color={b.wall} /></mesh>
          <mesh position={[0, b.h + 0.25, 0]} castShadow><boxGeometry args={[b.w + 0.5, 0.5, b.d + 0.5]} /><meshStandardMaterial color={b.roof} /></mesh>
          {/* windows facing the yard (north, −z) */}
          <mesh position={[0, b.h * 0.5, -b.d / 2 - 0.03]}><boxGeometry args={[b.w * 0.6, b.h * 0.35, 0.06]} /><meshStandardMaterial color="#cfe3f5" /></mesh>
        </group>
      ))}
    </group>
  );
}

function CampusBackdrop() {
  return (
    <group>
      {/* NORTH — Head Teacher side: one long double-storey block spanning the
          whole edge, its windows facing south into the yard. z −40 is past the
          walkable bound (z ≥ −30). */}
      <BrickBuilding x={0} z={-40} length={104} depth={6} rotationY={0} />

      {/* WEST — Mr. Dawson side: spans the depth, windows facing east (+x). */}
      <BrickBuilding x={-52} z={-6} length={72} depth={6} rotationY={Math.PI / 2} />

      {/* EAST side: spans the depth, windows facing west (−x). */}
      <BrickBuilding x={52} z={-6} length={72} depth={6} rotationY={-Math.PI / 2} />

      {/* SOUTH — the coast (Ms. Mahoney's side, where the player arrives):
          a gate at the yard edge, then a road with traffic, then a couple of
          shops, then the beach + sea behind them. */}
      <SeaGate />
      <CoastRoad />
      <TrafficCars />
      <CoastShops />
      {/* Ocean out to the horizon. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 130]}>
        <planeGeometry args={[440, 160]} />
        <meshStandardMaterial color="#2f9fd0" />
      </mesh>
      {/* Sandy beach behind the shops. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, BEACH_Z]} receiveShadow>
        <planeGeometry args={[340, 20]} />
        <meshStandardMaterial color="#e8d6a0" />
      </mesh>
      {/* Distant islands on the horizon. */}
      <Island x={26} z={140} scale={1.5} />
      <Island x={-40} z={165} scale={1.0} />
    </group>
  );
}

// The Head Teacher's padlocked gate — a full-width barrier across the top tier
// with a central gate holding 8 padlocks. A padlock "breaks" (disappears) as
// each key is earned; once all 8 are earned the whole gate is gone (open path).
function KellahanGate() {
  const completedMissions = useProgress((s) => s.completedMissions);
  if (isBossUnlocked(completedMissions)) return null;
  const { z, halfWidth } = SCHOOLYARD_GATE;
  const baseY = schoolyardGroundHeight(0, z);
  return (
    <group position={[0, baseY, z]}>
      {/* Full-width low barrier (spans the widened region width). */}
      <mesh castShadow receiveShadow position={[0, 0.8, 0]}>
        <boxGeometry args={[SCHOOLYARD_BOUNDS.width, 1.6, 0.5]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
      {/* Central gate frame + bars. */}
      <mesh castShadow position={[-halfWidth, 1.6, 0]}><boxGeometry args={[0.5, 3.2, 0.5]} /><meshStandardMaterial color="#3a4a6b" /></mesh>
      <mesh castShadow position={[halfWidth, 1.6, 0]}><boxGeometry args={[0.5, 3.2, 0.5]} /><meshStandardMaterial color="#3a4a6b" /></mesh>
      <mesh castShadow position={[0, 3.3, 0]}><boxGeometry args={[halfWidth * 2 + 0.5, 0.5, 0.5]} /><meshStandardMaterial color="#3a4a6b" /></mesh>
      {[-4, -2, 0, 2, 4].map((x) => (
        <mesh key={x} position={[x, 1.7, 0]}><boxGeometry args={[0.14, 3.0, 0.14]} /><meshStandardMaterial color="#8d99ae" /></mesh>
      ))}
      {/* 8 padlocks — a remaining lock for each key not yet earned. */}
      {SCHOOLYARD_KEY_IDS.map((id, i) => {
        if (hasKey(id, completedMissions)) return null;
        const x = -5.25 + i * 1.5;
        return (
          <group key={id} position={[x, 1.5, 0.4]}>
            <mesh castShadow><boxGeometry args={[0.5, 0.6, 0.24]} /><meshStandardMaterial color="#f4c430" /></mesh>
            <mesh position={[0, 0.45, 0]} rotation={[0, 0, 0]}><torusGeometry args={[0.18, 0.06, 8, 16, Math.PI]} /><meshStandardMaterial color="#d9a300" /></mesh>
          </group>
        );
      })}
      <Html position={[0, 4.4, 0]} center distanceFactor={16} className="ix-badge-anchor">
        <div className="unlock-sign locked">🔒 Head Teacher — {keysEarned(completedMissions)}/8 keys</div>
      </Html>
    </group>
  );
}

export default function SchoolyardScenery() {
  const { width, height } = SCHOOLYARD_BOUNDS;
  const t0 = SCHOOLYARD_TIERS[0];
  const [px, pz] = SCHOOLYARD_PLAZA.center;

  return (
    <>
      {/* Grass surround beyond the yard, wide enough for the town to stand on. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[width + 60, height + 56]} />
        <meshStandardMaterial color="#5f8f4e" />
      </mesh>

      {/* Background horizon (all OUTSIDE the walkable bounds, non-solid): big
          brick buildings on the N/W/E sides + a coastal beach/ocean/island on
          the south (Ms. Mahoney's side). */}
      <CampusBackdrop />

      {/* Lowest tier: an asphalt plane. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, t0.height + 0.01, (t0.zMin + t0.zMax) / 2]} receiveShadow>
        <planeGeometry args={[width, t0.zMax - t0.zMin]} />
        <meshStandardMaterial color="#717a85" />
      </mesh>

      {/* Raised terraces (their sides form the retaining walls). */}
      {[SCHOOLYARD_TIERS[1], SCHOOLYARD_TIERS[2]].map((t, i) => (
        <mesh key={t.id} position={[0, t.height / 2, (t.zMin + t.zMax) / 2]} castShadow receiveShadow>
          <boxGeometry args={[width, t.height, t.zMax - t.zMin]} />
          <meshStandardMaterial color={i === 0 ? "#77808b" : "#7f8893"} />
        </mesh>
      ))}

      {/* Central staircases (three steps each). */}
      {SCHOOLYARD_STAIRS.map((s) => {
        const bottom = s.zBoundary + STAIR_DEPTH / 2;
        return [0, 1, 2].map((j) => {
          const frac = (j + 1) / 3;
          const hh = s.from + (s.to - s.from) * frac;
          const zc = bottom - j - 0.5;
          return (
            <mesh key={`${s.id}-${j}`} position={[0, hh / 2, zc]} castShadow receiveShadow>
              <boxGeometry args={[s.halfWidth * 2, hh, STAIR_DEPTH / 3]} />
              <meshStandardMaterial color="#9aa3ad" />
            </mesh>
          );
        });
      })}

      {/* Central plaza marking (on its tier). */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[px, schoolyardGroundHeight(px, pz) + 0.02, pz]}>
        <circleGeometry args={[SCHOOLYARD_PLAZA.radius, 40]} />
        <meshStandardMaterial color="#9aa3ad" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[px, schoolyardGroundHeight(px, pz) + 0.04, pz]}>
        <ringGeometry args={[2.4, 2.7, 40]} />
        <meshStandardMaterial color="#e6e9ec" />
      </mesh>

      {/* Buildings, trees, planters — each sitting on its tier. */}
      {SCHOOLYARD_BUILDINGS.map((b) => (
        <Building key={b.id} {...b} baseY={schoolyardGroundHeight(b.x, b.z)} />
      ))}
      {SCHOOLYARD_TREES.map((p, i) => (
        <BigTree key={`t-${i}`} x={p[0]} z={p[1]} baseY={schoolyardGroundHeight(p[0], p[1])} />
      ))}
      {SCHOOLYARD_PLANTERS.map((p, i) => (
        <Planter key={`pl-${i}`} x={p[0]} z={p[1]} radius={p[2]} baseY={schoolyardGroundHeight(p[0], p[1])} />
      ))}

      {/* Teacher landmark models (SCHOOLYARD_PROPS): the "front" building near
          Mr. Pearce, two large feature trees flanking the plaza, and Mills the
          guide greeting players in the NW corner. Each sits on its tier + is
          solid (colliders in schoolyardColliders). Scales are starting values. */}
      {SCHOOLYARD_PROPS.map((p) => (
        <SchoolyardProp key={p.id} prop={p} />
      ))}

      {/* Welcome greeting — now a floating label above Mills (mills.glb, from
          SCHOOLYARD_PROPS) in the corner nearest Ms. Bacon. */}
      {(() => {
        const [sx, sz] = SCHOOLYARD_WELCOME_SIGN.position;
        const baseY = schoolyardGroundHeight(sx, sz);
        return (
          <Html position={[sx, baseY + 3.6, sz]} center distanceFactor={17} className="ix-badge-anchor" zIndexRange={[24, 0]}>
            <div style={{ width: 240, textAlign: "center", fontWeight: 800, fontSize: 20, lineHeight: 1.15, color: "#0b2a6b", background: "rgba(238,244,255,0.92)", borderRadius: 10, padding: "8px 12px", boxShadow: "0 2px 8px rgba(0,0,0,0.25)" }}>
              {SCHOOLYARD_WELCOME_SIGN.text}
            </div>
          </Html>
        );
      })()}

      {/* The Head Teacher's podium (she stands on it). */}
      {(() => {
        const [ppx, ppz] = SCHOOLYARD_PODIUM.position;
        const baseY = tierAtZ(ppz).height;
        const R = SCHOOLYARD_PODIUM.radius;
        const H = SCHOOLYARD_PODIUM.height;
        return (
          <group position={[ppx, baseY, ppz]}>
            <mesh castShadow receiveShadow position={[0, H / 2, 0]}>
              <cylinderGeometry args={[R, R + 0.3, H, 28]} />
              <meshStandardMaterial color="#c9ccd1" />
            </mesh>
            <mesh position={[0, H + 0.03, 0]}>
              <cylinderGeometry args={[R - 0.2, R - 0.2, 0.06, 28]} />
              <meshStandardMaterial color="#e6e9ec" />
            </mesh>
          </group>
        );
      })()}

      {/* The Head Teacher's padlocked gate (breaks lock-by-lock as keys are earned). */}
      <KellahanGate />

      {/* The nine staff render as real interactable NPCs (World.jsx). */}
    </>
  );
}
