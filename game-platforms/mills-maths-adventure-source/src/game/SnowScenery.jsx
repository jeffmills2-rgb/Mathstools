import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";

import {
  SNOW_BOUNDS,
  SNOW_LANES,
  SNOW_YARD,
  SNOW_LODGE,
  SNOW_WELCOME_SIGN,
  SNOW_RECORDS_STAND,
  SNOW_IGLOOS,
  SNOWMEN,
  XMAS_TREES,
  DISTANT_XMAS,
  SNOW_LAMPS,
  CANDY_CANES,
  ICE_CAVE_MOUND,
  ICE_CRYSTALS,
  SLED_PROP,
  SLED_FLAGS,
  ICE_RINK,
  SNOW_BOUNDARY,
  SNOW_PEAKS,
  SNOW_CHALLENGE_SPOTS,
  PENGUIN_WANDER,
  PENGUIN_COUNT,
  RINK_SLIDERS,
  SLOPE,
  snowGroundHeight,
} from "../data/snow/snowLayout.js";
import { rinkBankColliders } from "../data/snow/snowColliders.js";
import { playerState } from "./sessionStore.js";
import { isAnyChallengeActive, useFarmChallengeActive } from "./farmChallengeActive.js";
import { snowShelfEntries } from "../data/snow/snowRecords.js";
import TrophyStandAssembly from "./TrophyStand.jsx";

/**
 * SNOWBALL SUMS SCENERY (S1) — the fourth region: a twilight snow world with
 * an aurora overhead. Everything here is a low-poly MARKER (snowmen, Christmas
 * trees, waddling penguins, igloos, the rink) ready to be swapped for teacher
 * glbs later — wire replacements like the farm characters and keep the layout
 * data in snowLayout.js as the single source of truth.
 */

const SNOW = "#e8eef8";        // twilight-tinted snow
const SNOW_PATH = "#d3ddee";   // packed-snow lanes
const SNOW_BANK = "#dfe9f6";   // banks / boundary blocks
const ICE = "#b8dff2";         // rink ice
const ICE_DEEP = "#8fc6e6";
const WOOD = "#7a5638";
const WOOD_DARK = "#5d3f26";

// ---- Small props -------------------------------------------------------------

/** Classic three-ball snowman with a carrot nose, coal buttons and a top hat. */
function Snowman({ position }) {
  const [x, z] = position;
  return (
    <group position={[x, 0, z]} rotation={[0, (x * 7 + z * 3) % 6.28, 0]}>
      {[[0.62, 0.62], [1.42, 0.46], [2.02, 0.32]].map(([y, r], i) => (
        <mesh key={i} castShadow position={[0, y, 0]}>
          <sphereGeometry args={[r, 14, 12]} />
          <meshStandardMaterial color="#f6f9ff" />
        </mesh>
      ))}
      {/* Coal eyes + smile + buttons. */}
      {[[-0.1, 2.1, 0.28], [0.1, 2.1, 0.28], [0, 1.5, 0.44], [0, 1.32, 0.45], [0, 1.14, 0.44]].map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.035, 6, 5]} />
          <meshStandardMaterial color="#2b2b2b" />
        </mesh>
      ))}
      {/* Carrot nose. */}
      <mesh position={[0, 2.0, 0.42]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.05, 0.3, 8]} />
        <meshStandardMaterial color="#e8813a" />
      </mesh>
      {/* Stick arms. */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.55, 1.5, 0]} rotation={[0, 0, s * -0.9]}>
          <cylinderGeometry args={[0.03, 0.04, 0.8, 5]} />
          <meshStandardMaterial color="#6b4a2e" />
        </mesh>
      ))}
      {/* Top hat + scarf. */}
      <mesh position={[0, 2.32, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.05, 12]} />
        <meshStandardMaterial color="#23262e" />
      </mesh>
      <mesh castShadow position={[0, 2.46, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.26, 12]} />
        <meshStandardMaterial color="#23262e" />
      </mesh>
      <mesh position={[0, 1.78, 0]}>
        <torusGeometry args={[0.3, 0.06, 8, 14]} />
        <meshStandardMaterial color="#d64545" />
      </mesh>
    </group>
  );
}

/** Snow-dusted Christmas tree with baubles and a glowing star. */
function XmasTree({ position, scale = 1 }) {
  const [x, z] = position;
  const baubles = useMemo(() => {
    const cols = ["#e63946", "#ffd166", "#4cc9f0", "#f4a261"];
    return Array.from({ length: 7 }, (_, i) => {
      const a = (i / 7) * Math.PI * 2 + x;
      const tier = i % 3;
      const r = [0.78, 0.6, 0.4][tier];
      const y = [1.35, 1.95, 2.5][tier];
      return { x: Math.cos(a) * r, y, z: Math.sin(a) * r, col: cols[i % 4] };
    });
  }, [x]);
  return (
    <group position={[x, 0, z]} scale={scale}>
      <mesh castShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.16, 0.2, 1, 7]} />
        <meshStandardMaterial color={WOOD_DARK} />
      </mesh>
      {[[1.3, 1.05, 1.5], [2.0, 0.8, 1.2], [2.6, 0.55, 1.0]].map(([y, r, h], i) => (
        <group key={i}>
          <mesh castShadow position={[0, y, 0]}>
            <coneGeometry args={[r, h, 9]} />
            <meshStandardMaterial color={i % 2 ? "#2f6e4f" : "#28604a"} />
          </mesh>
          {/* Snow dusting: a thin white cone rim sitting on each tier. */}
          <mesh position={[0, y + h * 0.18, 0]}>
            <coneGeometry args={[r * 0.82, h * 0.3, 9]} />
            <meshStandardMaterial color="#eef4fd" />
          </mesh>
        </group>
      ))}
      {baubles.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, b.z]}>
          <sphereGeometry args={[0.09, 8, 7]} />
          <meshStandardMaterial color={b.col} emissive={b.col} emissiveIntensity={0.35} />
        </mesh>
      ))}
      {/* Star on top. */}
      <mesh position={[0, 3.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.05, 5]} />
        <meshStandardMaterial color="#ffd166" emissive="#ffd166" emissiveIntensity={0.9} />
      </mesh>
    </group>
  );
}

/** An igloo — snow-block dome with an entrance tunnel. */
function Igloo({ position, rotationY = 0 }) {
  const [x, z] = position;
  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      <mesh castShadow>
        <sphereGeometry args={[1.8, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#f2f7ff" flatShading />
      </mesh>
      {/* Block seams: two slim rings around the dome. */}
      {[[0.55, 1.7], [1.05, 1.42]].map(([y, r], i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r, 0.045, 6, 24]} />
          <meshStandardMaterial color="#d5e2f2" />
        </mesh>
      ))}
      {/* Entrance tunnel (front, +z) with a dark doorway. */}
      <mesh castShadow position={[0, 0.55, 1.75]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.75, 0.75, 1.1, 12, 1, false, Math.PI, Math.PI]} />
        <meshStandardMaterial color="#e8f0fb" flatShading side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.5, 2.31]}>
        <circleGeometry args={[0.55, 14, Math.PI, Math.PI]} />
        <meshStandardMaterial color="#1d2432" />
      </mesh>
    </group>
  );
}

/** Lamp post with a warm glowing globe — the twilight's path lighting. */
function LampPost({ position }) {
  const [x, z] = position;
  return (
    <group position={[x, 0, z]}>
      <mesh castShadow position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.07, 0.1, 3, 8]} />
        <meshStandardMaterial color="#2e3442" />
      </mesh>
      <mesh position={[0, 3.1, 0]}>
        <sphereGeometry args={[0.28, 12, 10]} />
        <meshStandardMaterial color="#ffe6ad" emissive="#ffcf7d" emissiveIntensity={1.4} />
      </mesh>
      <mesh position={[0, 3.38, 0]}>
        <coneGeometry args={[0.34, 0.26, 10]} />
        <meshStandardMaterial color="#2e3442" />
      </mesh>
    </group>
  );
}

/** A candy-cane pole (red/white stripes with a hooked top). */
function CandyCane({ position }) {
  const [x, z] = position;
  const stripes = [0.2, 0.6, 1.0, 1.4, 1.8];
  return (
    <group position={[x, 0, z]}>
      <mesh castShadow position={[0, 1.05, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 2.1, 10]} />
        <meshStandardMaterial color="#f6f6f2" />
      </mesh>
      {stripes.map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <cylinderGeometry args={[0.095, 0.095, 0.16, 10]} />
          <meshStandardMaterial color="#d64545" />
        </mesh>
      ))}
      <mesh position={[0.22, 2.1, 0]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.22, 0.09, 8, 12, Math.PI]} />
        <meshStandardMaterial color="#d64545" />
      </mesh>
    </group>
  );
}

// ---- Buildings & landmarks ---------------------------------------------------

/** The alpine SKI LODGE — warm glowing windows, snowy gable roof, chimney. */
/**
 * The lodge's AJAR front door (CB) — lodge-local coordinates (the Lodge
 * group sits at SNOW_LODGE.x/z). Hinged on the west jamb, resting slightly
 * open with warm light in the crack; it swings wide as the player nears,
 * so stepping through feels like walking INTO the log cabin (the region
 * travel happens via the snow-to-cabin portal in this doorway).
 */
function LodgeDoor({ faceZ }) {
  const doorRef = useRef();
  useFrame(() => {
    if (!doorRef.current) return;
    const doorWorldX = SNOW_LODGE.x;
    const doorWorldZ = SNOW_LODGE.z + faceZ;
    const near = Math.hypot(playerState.x - doorWorldX, playerState.z - doorWorldZ) < 4.5;
    const target = near ? -1.8 : -0.35; // ajar → wide open (inward)
    doorRef.current.rotation.y += (target - doorRef.current.rotation.y) * 0.08;
  });
  return (
    <group position={[0, 0, faceZ]}>
      {/* Jambs + a dark doorway behind the panel (the "inside"). */}
      {[-1, 1].map((s) => (
        <mesh key={s} castShadow position={[s * 0.95, 1.15, 0.02]}>
          <boxGeometry args={[0.18, 2.3, 0.16]} />
          <meshStandardMaterial color={WOOD_DARK} />
        </mesh>
      ))}
      <mesh position={[0, 1.1, -0.05]}>
        <boxGeometry args={[1.6, 2.2, 0.06]} />
        <meshStandardMaterial color="#1c1108" />
      </mesh>
      {/* Warm firelight spilling through the opening. */}
      <mesh position={[0, 1.05, -0.01]}>
        <boxGeometry args={[1.3, 2.0, 0.03]} />
        <meshStandardMaterial color="#ffb36b" emissive="#ff9a3c" emissiveIntensity={0.9} transparent opacity={0.85} />
      </mesh>
      <pointLight position={[0, 1.4, 0.8]} color="#ffb36b" intensity={0.8} distance={7} decay={2} />
      {/* The door panel, hinged west. */}
      <group position={[-0.85, 0, 0.08]}>
        <group ref={doorRef} rotation={[0, -0.35, 0]}>
          <mesh castShadow position={[0.8, 1.1, 0]}>
            <boxGeometry args={[1.6, 2.2, 0.1]} />
            <meshStandardMaterial color={WOOD_DARK} />
          </mesh>
          {/* Plank lines + handle. */}
          {[0.35, 0.8, 1.25].map((px) => (
            <mesh key={px} position={[px, 1.1, 0.06]}>
              <boxGeometry args={[0.04, 2.1, 0.03]} />
              <meshStandardMaterial color="#3a2a18" />
            </mesh>
          ))}
          <mesh position={[1.42, 1.1, 0.08]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial color="#c9a227" metalness={0.5} roughness={0.4} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function Lodge() {
  const { x, z, w, d, wall, roof, trim } = SNOW_LODGE;
  const H = 4.2;
  return (
    <group position={[x, 0, z]}>
      <mesh castShadow position={[0, H / 2, 0]}>
        <boxGeometry args={[w, H, d]} />
        <meshStandardMaterial color={wall} />
      </mesh>
      {/* Gable roof: two tilted slabs meeting at a ridge, plus snow caps. */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh castShadow position={[0, H + 1.15, s * (d / 4)]} rotation={[s * 0.62, 0, 0]}>
            <boxGeometry args={[w + 1.2, 0.3, d * 0.62]} />
            <meshStandardMaterial color={roof} />
          </mesh>
          <mesh position={[0, H + 1.38, s * (d / 4)]} rotation={[s * 0.62, 0, 0]}>
            <boxGeometry args={[w + 1.3, 0.12, d * 0.62]} />
            <meshStandardMaterial color="#eef4fd" />
          </mesh>
        </group>
      ))}
      {/* Gable ends. */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (w / 2 - 0.01), H + 0.8, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.01, d / 2 + 0.4, 1.9, 4, 1]} />
          <meshStandardMaterial color={wall} />
        </mesh>
      ))}
      {/* Warm windows on the south face (toward the lane). */}
      {[-4.6, -2.2, 2.2, 4.6].map((wx) => (
        <mesh key={wx} position={[wx, 2.2, d / 2 + 0.02]}>
          <boxGeometry args={[1.3, 1.3, 0.06]} />
          <meshStandardMaterial color="#ffd98f" emissive="#ffb85c" emissiveIntensity={1.1} />
        </mesh>
      ))}
      {/* The AJAR front door (CB) — hinged on the west jamb, it swings wide
          as the player approaches; warm firelight spills through the crack.
          Walking in travels to the Lodge Interior (the snow-to-cabin portal
          sits in this doorway — regions.js). */}
      <LodgeDoor faceZ={d / 2} />
      <mesh position={[0, 2.35, d / 2 + 0.05]}>
        <boxGeometry args={[2.0, 0.16, 0.08]} />
        <meshStandardMaterial color={trim} />
      </mesh>
      {/* Chimney with a snow cap. */}
      <mesh castShadow position={[w / 4, H + 1.9, -d / 5]}>
        <boxGeometry args={[1.0, 1.8, 1.0]} />
        <meshStandardMaterial color="#8a8f9c" />
      </mesh>
      <mesh position={[w / 4, H + 2.85, -d / 5]}>
        <boxGeometry args={[1.15, 0.14, 1.15]} />
        <meshStandardMaterial color="#eef4fd" />
      </mesh>
    </group>
  );
}

/** The ICE CAVE corner — a snow mound with glowing ice crystals. */
function IceCave() {
  const [mx, mz] = ICE_CAVE_MOUND.position;
  return (
    <group>
      <mesh castShadow position={[mx, 0, mz]}>
        <sphereGeometry args={[ICE_CAVE_MOUND.radius, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#dce8f7" flatShading />
      </mesh>
      {/* Dark cave mouth facing the challenge area (south-east). */}
      <mesh position={[mx + 1.7, 0.9, mz + 1.9]} rotation={[0, Math.atan2(1.7, 1.9), 0]}>
        <circleGeometry args={[1.0, 14, Math.PI, Math.PI]} />
        <meshStandardMaterial color="#131a2b" />
      </mesh>
      {ICE_CRYSTALS.map(([cx, cz], i) => (
        <group key={i} position={[cx, 0, cz]} rotation={[0, i * 1.7, 0.12]}>
          <mesh castShadow position={[0, 0.9, 0]}>
            <coneGeometry args={[0.5, 1.9, 5]} />
            <meshStandardMaterial color="#9fdcf2" emissive="#59b8dd" emissiveIntensity={0.6} transparent opacity={0.92} flatShading />
          </mesh>
          <mesh castShadow position={[0.5, 0.5, 0.2]} rotation={[0, 0.9, -0.3]}>
            <coneGeometry args={[0.28, 1.0, 5]} />
            <meshStandardMaterial color="#bfeafc" emissive="#6fc8e8" emissiveIntensity={0.5} transparent opacity={0.92} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * The sledding HILL (SL) — the only non-flat ground in the snow world. A
 * subdivided plane draped over snowGroundHeight(), lifted 3 cm so its zero
 * skirt never z-fights the flat snowfield, with a groomed RUN strip down
 * the fall line where the challenge's number window lives.
 */
function SlopeHill() {
  const geom = useMemo(() => {
    const w = SLOPE.xMax - SLOPE.xMin;
    const d = SLOPE.zMax - SLOPE.zMin;
    const g = new THREE.PlaneGeometry(w, d, 48, 40);
    g.rotateX(-Math.PI / 2); // lay flat: local x → world x, local z → world z
    const pos = g.attributes.position;
    const cx = (SLOPE.xMin + SLOPE.xMax) / 2;
    const cz = (SLOPE.zMin + SLOPE.zMax) / 2;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) + cx;
      const z = pos.getZ(i) + cz;
      pos.setY(i, snowGroundHeight(x, z));
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <group>
      <mesh
        geometry={geom}
        position={[(SLOPE.xMin + SLOPE.xMax) / 2, 0.03, (SLOPE.zMin + SLOPE.zMax) / 2]}
        receiveShadow
      >
        <meshStandardMaterial color="#eef3fb" />
      </mesh>
    </group>
  );
}

/** A wooden sled + course flags marking the Sledding Slope. */
function SledAndFlags() {
  const [sx, sz] = SLED_PROP.position;
  return (
    <group>
      <group position={[sx, snowGroundHeight(sx, sz), sz]} rotation={[0, SLED_PROP.rotationY, 0]}>
        {/* Runners. */}
        {[-0.45, 0.45].map((rx) => (
          <mesh key={rx} castShadow position={[rx, 0.14, 0]}>
            <boxGeometry args={[0.09, 0.09, 2.1]} />
            <meshStandardMaterial color="#8a8f9c" />
          </mesh>
        ))}
        {/* Deck slats. */}
        {[-0.6, -0.2, 0.2, 0.6].map((dz) => (
          <mesh key={dz} castShadow position={[0, 0.32, dz]}>
            <boxGeometry args={[1.05, 0.08, 0.3]} />
            <meshStandardMaterial color={WOOD} />
          </mesh>
        ))}
        {/* Curled front. */}
        <mesh castShadow position={[0, 0.5, 1.05]} rotation={[0.7, 0, 0]}>
          <boxGeometry args={[1.05, 0.08, 0.5]} />
          <meshStandardMaterial color={WOOD} />
        </mesh>
      </group>
      {SLED_FLAGS.map(([fx, fz], i) => (
        <group key={i} position={[fx, snowGroundHeight(fx, fz), fz]}>
          <mesh castShadow position={[0, 1.1, 0]}>
            <cylinderGeometry args={[0.05, 0.07, 2.2, 7]} />
            <meshStandardMaterial color={WOOD_DARK} />
          </mesh>
          <mesh position={[0.34, 1.95, 0]}>
            <boxGeometry args={[0.62, 0.4, 0.03]} />
            <meshStandardMaterial color={i % 2 ? "#4cc9f0" : "#e63946"} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** The welcome sign — a snow-capped wooden board facing the arrival point. */
function WelcomeSign() {
  const [x, z] = SNOW_WELCOME_SIGN.position;
  return (
    <group position={[x, 0, z]} rotation={[0, SNOW_WELCOME_SIGN.rotationY, 0]}>
      {[-0.8, 0.8].map((px) => (
        <mesh key={px} castShadow position={[px, 0.9, 0]}>
          <cylinderGeometry args={[0.09, 0.11, 1.8, 8]} />
          <meshStandardMaterial color={WOOD_DARK} />
        </mesh>
      ))}
      <mesh castShadow position={[0, 1.5, 0]}>
        <boxGeometry args={[2.4, 1.0, 0.12]} />
        <meshStandardMaterial color={WOOD} />
      </mesh>
      <mesh position={[0, 2.06, 0]}>
        <boxGeometry args={[2.5, 0.12, 0.16]} />
        <meshStandardMaterial color="#eef4fd" />
      </mesh>
      <Html position={[0, 1.5, 0.1]} center distanceFactor={9} className="ix-badge-anchor" zIndexRange={[24, 0]}>
        <div className="unlock-sign open">{SNOW_WELCOME_SIGN.text}</div>
      </Html>
    </group>
  );
}

// ---- The ice rink ------------------------------------------------------------

function IceRinkSheet() {
  const [cx, cz] = ICE_RINK.center;
  return (
    <group position={[cx, 0, cz]}>
      {/* The ice: an ellipse (unit circle scaled), glassy and pale. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} scale={[ICE_RINK.rx, ICE_RINK.rz, 1]} receiveShadow>
        <circleGeometry args={[1, 48]} />
        <meshStandardMaterial color={ICE} emissive={ICE_DEEP} emissiveIntensity={0.12} roughness={0.12} metalness={0.25} />
      </mesh>
      {/* A lighter centre sheen + faint skate circles. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} scale={[ICE_RINK.rx * 0.55, ICE_RINK.rz * 0.55, 1]}>
        <circleGeometry args={[1, 36]} />
        <meshBasicMaterial color="#d7effb" transparent opacity={0.35} />
      </mesh>
      {[0.35, 0.6].map((f, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, i * 0.9]} position={[0, 0.035, 0]} scale={[ICE_RINK.rx * f, ICE_RINK.rz * f, 1]}>
          <torusGeometry args={[1, 0.012, 4, 48, Math.PI * 1.3]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
        </mesh>
      ))}
      {/* Snow-bank ring — one mound per bank collider, so the visual can never
          drift from the physics (the southern entrance gap matches too). */}
      {rinkBankColliders().map((c) => (
        <mesh key={c.id} castShadow position={[c.x - cx, 0.12, c.z - cz]}>
          <sphereGeometry args={[0.85, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={SNOW_BANK} flatShading />
        </mesh>
      ))}
    </group>
  );
}

// ---- Penguins ----------------------------------------------------------------

/** One low-poly penguin, facing +z (front). ~1.0 tall. Marker until a glb lands. */
function Penguin() {
  const BLACK = "#23262e";
  const WHITE = "#f2f5fa";
  const ORANGE = "#e8913a";
  return (
    <group>
      {/* Body (black) + belly (white). */}
      <mesh castShadow position={[0, 0.52, 0]} scale={[1, 1.35, 1]}>
        <sphereGeometry args={[0.32, 12, 10]} />
        <meshStandardMaterial color={BLACK} />
      </mesh>
      <mesh position={[0, 0.47, 0.1]} scale={[0.82, 1.2, 0.82]}>
        <sphereGeometry args={[0.29, 12, 10]} />
        <meshStandardMaterial color={WHITE} />
      </mesh>
      {/* Head + eyes + beak. */}
      <mesh castShadow position={[0, 1.02, 0]}>
        <sphereGeometry args={[0.2, 12, 10]} />
        <meshStandardMaterial color={BLACK} />
      </mesh>
      {[[-0.08, 1.08, 0.15], [0.08, 1.08, 0.15]].map((p, i) => (
        <group key={i}>
          <mesh position={p}>
            <sphereGeometry args={[0.045, 6, 5]} />
            <meshStandardMaterial color={WHITE} />
          </mesh>
          <mesh position={[p[0], p[1], p[2] + 0.035]}>
            <sphereGeometry args={[0.02, 5, 4]} />
            <meshStandardMaterial color="#111319" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.98, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.05, 0.18, 7]} />
        <meshStandardMaterial color={ORANGE} />
      </mesh>
      {/* Flippers. */}
      {[-1, 1].map((s) => (
        <mesh key={s} castShadow position={[s * 0.32, 0.58, 0]} rotation={[0, 0, s * -0.5]} scale={[0.35, 1, 0.7]}>
          <sphereGeometry args={[0.18, 8, 7]} />
          <meshStandardMaterial color={BLACK} />
        </mesh>
      ))}
      {/* Feet. */}
      {[-0.12, 0.12].map((fx) => (
        <mesh key={fx} position={[fx, 0.05, 0.08]}>
          <boxGeometry args={[0.14, 0.06, 0.24]} />
          <meshStandardMaterial color={ORANGE} />
        </mesh>
      ))}
    </group>
  );
}

/** Penguins WADDLE around the colony — amble to a random spot, pause, repeat.
 *  While walking they rock side to side (the waddle) and bob a little. */
function WaddlingPenguins() {
  const refs = useRef([]);
  const bodies = useRef([]);
  const pens = useRef(null);
  if (!pens.current) {
    const b = PENGUIN_WANDER;
    pens.current = Array.from({ length: PENGUIN_COUNT }, (_, i) => {
      const x = b.minX + ((i + 0.5) / PENGUIN_COUNT) * (b.maxX - b.minX);
      const z = b.minZ + (0.2 + 0.6 * (i % 2)) * (b.maxZ - b.minZ);
      return { x, z, tx: x, tz: z, speed: 0.8 + (i % 3) * 0.25, wait: 0.5 + i * 0.6, phase: i * 1.3 };
    });
  }
  useFrame((state, dt) => {
    // Hold still while a challenge runs — no ambient motion competing with
    // the maths for the student's attention.
    if (isAnyChallengeActive()) {
      bodies.current.forEach((body) => {
        if (body) { body.rotation.z = 0; body.position.y = 0; }
      });
      return;
    }
    const b = PENGUIN_WANDER;
    const t = state.clock.elapsedTime;
    pens.current.forEach((p, i) => {
      const g = refs.current[i];
      const body = bodies.current[i];
      if (!g) return;
      const dx = p.tx - p.x;
      const dz = p.tz - p.z;
      const d = Math.hypot(dx, dz);
      let walking = false;
      if (d < 0.3) {
        if (p.wait <= 0) p.wait = 1.2 + Math.random() * 3.5;
        p.wait -= dt;
        if (p.wait <= 0) {
          p.tx = b.minX + Math.random() * (b.maxX - b.minX);
          p.tz = b.minZ + Math.random() * (b.maxZ - b.minZ);
        }
      } else {
        walking = true;
        const step = Math.min(d, p.speed * dt);
        p.x += (dx / d) * step;
        p.z += (dz / d) * step;
        g.rotation.y = Math.atan2(dx, dz);
      }
      g.position.set(p.x, 0, p.z);
      if (body) {
        // The waddle: side-to-side rock + a tiny hop-bob while walking.
        body.rotation.z = walking ? Math.sin(t * 9 + p.phase) * 0.16 : 0;
        body.position.y = walking ? Math.abs(Math.sin(t * 9 + p.phase)) * 0.05 : 0;
      }
    });
  });
  return (
    <group>
      {pens.current.map((p, i) => (
        <group key={i} ref={(el) => { refs.current[i] = el; }} position={[p.x, 0, p.z]}>
          <group ref={(el) => { bodies.current[i] = el; }}>
            <Penguin />
          </group>
        </group>
      ))}
    </group>
  );
}

/** Two penguins BELLY-SLIDE back and forth across the rink, spinning upright
 *  at each end before flopping down for the return run. */
function RinkPenguins() {
  const refs = useRef([]);
  const sliders = useRef(null);
  if (!sliders.current) {
    const [cx, cz] = ICE_RINK.center;
    sliders.current = Array.from({ length: RINK_SLIDERS }, (_, i) => ({
      ax: cx - ICE_RINK.rx * 0.62, az: cz + (i ? 2.6 : -2.4),
      bx: cx + ICE_RINK.rx * 0.62, bz: cz + (i ? -2.2 : 2.8),
      t: i * 0.45, dir: 1, speed: 0.14 + i * 0.03,
    }));
  }
  useFrame((state, dt) => {
    // Freeze mid-rink while a challenge runs (the Glide-by-Tens number line
    // shares this ice — sliders crossing it mid-round are pure distraction).
    if (isAnyChallengeActive()) return;
    sliders.current.forEach((s, i) => {
      const g = refs.current[i];
      if (!g) return;
      s.t += dt * s.speed * s.dir;
      if (s.t > 1) { s.t = 1; s.dir = -1; }
      if (s.t < 0) { s.t = 0; s.dir = 1; }
      // Ease so they push off fast and coast into each end.
      const u = s.t < 0.5 ? 2 * s.t * s.t : 1 - Math.pow(-2 * s.t + 2, 2) / 2;
      const x = s.ax + (s.bx - s.ax) * u;
      const z = s.az + (s.bz - s.az) * u;
      const heading = Math.atan2((s.bx - s.ax) * s.dir, (s.bz - s.az) * s.dir);
      const atEnd = s.t <= 0.02 || s.t >= 0.98;
      g.position.set(x, atEnd ? 0 : 0.05, z);
      if (atEnd) {
        // Upright at the ends, spinning gleefully on the spot.
        g.rotation.set(0, g.rotation.y + dt * 5, 0);
      } else {
        // Belly-down, nose-first for the slide.
        g.rotation.set(-Math.PI / 2 + 0.18, heading, 0);
      }
    });
  });
  return (
    <group>
      {sliders.current.map((s, i) => (
        <group key={i} ref={(el) => { refs.current[i] = el; }} position={[s.ax, 0, s.az]}>
          <Penguin />
        </group>
      ))}
    </group>
  );
}

// ---- Sky: aurora, stars, moon ------------------------------------------------

/** One rippling aurora curtain — a wavy, additive ribbon high in the sky. */
function AuroraRibbon({ y, z, color, opacity = 0.26, speed = 0.35, phase = 0, height = 11, tilt = 0.35 }) {
  const ref = useRef();
  useFrame((state) => {
    const g = ref.current && ref.current.geometry;
    if (!g) return;
    const t = state.clock.elapsedTime * speed + phase;
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      pos.setZ(i, Math.sin(x * 0.045 + t) * 4 + Math.sin(x * 0.12 - t * 1.7) * 1.5);
    }
    pos.needsUpdate = true;
  });
  return (
    <mesh ref={ref} position={[0, y, z]} rotation={[tilt, 0, 0]}>
      <planeGeometry args={[150, height, 72, 1]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  );
}

function Aurora() {
  return (
    <group>
      <AuroraRibbon y={44} z={-72} color="#58f0a8" opacity={0.3} speed={0.3} phase={0} height={13} />
      <AuroraRibbon y={52} z={-64} color="#4fd8c8" opacity={0.22} speed={0.42} phase={2.1} height={9} />
      <AuroraRibbon y={58} z={-56} color="#a06ef2" opacity={0.16} speed={0.24} phase={4.4} height={8} />
    </group>
  );
}

/** A field of stars inside the sky dome (radius 130 — stars sit at ~118). */
function Stars() {
  const geom = useMemo(() => {
    const N = 160;
    const positions = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      // Deterministic pseudo-random spread over the upper hemisphere.
      const a = (i * 2.399963) % (Math.PI * 2); // golden angle
      const u = 0.15 + 0.83 * (((i * 37) % 97) / 97);
      const r = 118;
      const y = r * u;
      const rr = Math.sqrt(Math.max(0, r * r - y * y));
      positions[i * 3] = Math.cos(a) * rr;
      positions[i * 3 + 1] = y * 0.62 + 14;
      positions[i * 3 + 2] = Math.sin(a) * rr;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, []);
  return (
    <points geometry={geom}>
      <pointsMaterial color="#e9f0ff" size={2.2} sizeAttenuation={false} transparent opacity={0.85} fog={false} depthWrite={false} />
    </points>
  );
}

/** A big low moon with a soft halo. */
function Moon() {
  return (
    <group position={[-62, 54, -88]}>
      <mesh>
        <sphereGeometry args={[6, 20, 16]} />
        <meshBasicMaterial color="#f2f5ff" fog={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[8.4, 20, 16]} />
        <meshBasicMaterial color="#aebcf2" transparent opacity={0.18} fog={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ---- Boundary + horizon ------------------------------------------------------

/** The property line: a tall ridge of ice blocks all the way around. */
function BoundaryBank() {
  const { halfW, halfD } = SNOW_BOUNDARY;
  const BLOCK = 4.6;
  const runs = [
    { x1: -halfW, z1: -halfD, x2: halfW, z2: -halfD },
    { x1: -halfW, z1: halfD, x2: halfW, z2: halfD },
    { x1: -halfW, z1: -halfD, x2: -halfW, z2: halfD },
    { x1: halfW, z1: -halfD, x2: halfW, z2: halfD },
  ];
  return (
    <group>
      {runs.map((r, ri) => {
        const len = Math.hypot(r.x2 - r.x1, r.z2 - r.z1);
        const steps = Math.round(len / BLOCK);
        const yaw = Math.atan2(r.x2 - r.x1, r.z2 - r.z1);
        return Array.from({ length: steps }, (_, i) => {
          const t = (i + 0.5) / steps;
          const h = 1.9 + ((i * 13 + ri * 7) % 5) * 0.22; // gentle crenellation
          return (
            <mesh
              key={`${ri}-${i}`}
              castShadow
              position={[r.x1 + (r.x2 - r.x1) * t, h / 2, r.z1 + (r.z2 - r.z1) * t]}
              rotation={[0, yaw, 0]}
            >
              <boxGeometry args={[1.5, h, BLOCK * 0.94]} />
              <meshStandardMaterial color={(i + ri) % 2 ? SNOW_BANK : "#cfe0f2"} flatShading />
            </mesh>
          );
        });
      })}
    </group>
  );
}

/** Snowy horizon peaks out in the fog (visual only). */
function SnowPeaks() {
  return (
    <group>
      {SNOW_PEAKS.map(([x, z, sx, sy, sz], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh scale={[sx, sy, sz]}>
            <coneGeometry args={[1, 2, 7]} />
            <meshStandardMaterial color="#c3d2e8" flatShading />
          </mesh>
          <mesh position={[0, sy * 1.25, 0]} scale={[sx * 0.42, sy * 0.8, sz * 0.42]}>
            <coneGeometry args={[1, 2, 7]} />
            <meshStandardMaterial color="#f0f5fd" flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ---- The region --------------------------------------------------------------

export default function SnowScenery() {
  // While an in-world challenge runs the world goes quiet: the area signposts
  // come down so nothing floats in front of the challenge props.
  const challengeActive = useFarmChallengeActive();
  return (
    <group>
      {/* Base snowfield — extends WELL past the boundary bank so the peaks +
          distant trees sit on snow, fading into the twilight fog. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[SNOW_BOUNDS.width + 160, SNOW_BOUNDS.height + 160]} />
        <meshStandardMaterial color={SNOW} />
      </mesh>

      {/* The sledding hill in the NE corner (the only terrain bump). */}
      <SlopeHill />

      {/* Sky theatre: aurora curtains, stars and a low moon. */}
      <Aurora />
      <Stars />
      <Moon />

      {/* World dressing: the boundary ridge + snowy peaks + distant trees. */}
      <BoundaryBank />
      <SnowPeaks />
      {DISTANT_XMAS.map((pos, i) => (
        <XmasTree key={`dx${i}`} position={pos} scale={1.35} />
      ))}

      {/* Packed-snow lanes + the lodge yard. */}
      {SNOW_LANES.map((l) => (
        <mesh key={l.id} rotation={[-Math.PI / 2, 0, 0]} position={[l.x, 0.01, l.z]} receiveShadow>
          <planeGeometry args={[l.w, l.d]} />
          <meshStandardMaterial color={SNOW_PATH} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[SNOW_YARD.center[0], 0.011, SNOW_YARD.center[1]]} receiveShadow>
        <circleGeometry args={[SNOW_YARD.radius, 40]} />
        <meshStandardMaterial color={SNOW_PATH} />
      </mesh>

      {/* Buildings + landmarks. */}
      <Lodge />
      <IceCave />
      <SledAndFlags />
      <WelcomeSign />
      <IceRinkSheet />

      {/* The trophy stand — IDENTICAL to Fraction Farm's (trophy.glb, ten
          pigeonholes, self-calibrating cups, grand trophy at 10× gold). */}
      <TrophyStandAssembly
        position={SNOW_RECORDS_STAND.position}
        rotationY={SNOW_RECORDS_STAND.rotationY}
        entries={snowShelfEntries()}
      />

      {/* Props. */}
      {SNOW_IGLOOS.map(([x, z, rot], i) => (
        <Igloo key={`ig${i}`} position={[x, z]} rotationY={rot} />
      ))}
      {SNOWMEN.map((pos, i) => (
        <Snowman key={`sm${i}`} position={pos} />
      ))}
      {XMAS_TREES.map((pos, i) => (
        <XmasTree key={`xt${i}`} position={pos} />
      ))}
      {SNOW_LAMPS.map((pos, i) => (
        <LampPost key={`lp${i}`} position={pos} />
      ))}
      {CANDY_CANES.map((pos, i) => (
        <CandyCane key={`cc${i}`} position={pos} />
      ))}

      {/* Wildlife: waddling penguins + two rink belly-sliders. */}
      <WaddlingPenguins />
      <RinkPenguins />

      {/* Challenge-area labels (the rink already reads as itself). They are
          signposts for a student WALKING the world — while a challenge runs
          they're pure clutter, and the "Snowball Range" pill in particular
          sits right in front of the ten-frame crate, so they all go. */}
      {!challengeActive && SNOW_CHALLENGE_SPOTS.filter((s) => s.id !== "rink").map((s) => (
        <Html
          key={s.id}
          position={[s.center[0], snowGroundHeight(s.center[0], s.center[1]) + 2.6, s.center[1]]}
          center
          distanceFactor={22}
          className="ix-badge-anchor"
          zIndexRange={[24, 0]}
        >
          <div className="unlock-sign open">{s.label}</div>
        </Html>
      ))}
    </group>
  );
}
