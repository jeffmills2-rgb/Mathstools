import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";

import {
  CABIN_BOUNDS,
  CABIN_WALL,
  CABIN_DOOR_GAP,
  CABIN_DOOR,
  CABIN_FIRE,
  CABIN_HEARTH_RUG,
  CABIN_LONG_TABLE,
  CABIN_ROUND_TABLES,
  CABIN_BOOKSHELVES,
  CABIN_BEDROOM,
  CABIN_BED,
  CABIN_WARDROBE,
  CABIN_BEDSIDE,
  CABIN_BEDROOM_RUG,
  CABIN_WINDOWS,
  CABIN_CANDLES,
} from "../data/cabin/cabinLayout.js";
import { playerState } from "./sessionStore.js";

/**
 * THE LODGE INTERIOR — scenery (CB). A warm log-cabin great room: stacked
 * log walls with chinking, a plank floor, the stone WOODFIRE with a live
 * flickering fire + spark light, a long dining table with benches, round
 * side tables with stools and candles, bookshelves, icy twilight windows,
 * a rug by the hearth — and a separate BEDROOM behind plank walls (bed,
 * wardrobe, bedside lamp, rug). No ceiling: the third-person camera looks
 * in dollhouse-style and the dark warm sky reads as rafters in shadow.
 * The south door is AJAR and swings wide as the player approaches — the
 * same trick as the lodge's outside door, so leaving feels like arriving.
 */

const LOG = "#7a5638";
const LOG_DARK = "#5f4128";
const CHINK = "#d8cdb8";
const PLANK = "#8a6a48";
const PLANK_DARK = "#79593b";
const STONE = "#8d8d94";
const STONE_DARK = "#6e6e76";
const RUG_A = "#a63c32";
const RUG_B = "#d9a441";
const CANDLE_GLOW = "#ffd98f";
const WINDOW_ICE = "#7d9fd4";

const HALF_W = CABIN_WALL.halfW;
const HALF_D = CABIN_WALL.halfD;
const WALL_H = CABIN_WALL.height;
const LOG_R = 0.42; // one log course's radius

/** One wall of stacked log courses (horizontal cylinders + end knots). */
function LogWall({ length, position, rotationY, gap }) {
  const courses = Math.round(WALL_H / (LOG_R * 2));
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {Array.from({ length: courses }, (_, i) => {
        const y = LOG_R + i * LOG_R * 2;
        if (!gap) {
          return (
            <mesh key={i} castShadow position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[LOG_R, LOG_R, length, 10]} />
              <meshStandardMaterial color={i % 2 ? LOG : LOG_DARK} />
            </mesh>
          );
        }
        // A doorway gap: two shorter logs either side (the top two courses
        // run FULL length as the lintel above the door).
        const lintel = y > 2.6;
        if (lintel) {
          return (
            <mesh key={i} castShadow position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[LOG_R, LOG_R, length, 10]} />
              <meshStandardMaterial color={i % 2 ? LOG : LOG_DARK} />
            </mesh>
          );
        }
        const side = (length - (gap.xMax - gap.xMin)) / 2;
        const off = (gap.xMax - gap.xMin) / 2 + side / 2;
        return (
          <group key={i}>
            {[-1, 1].map((s) => (
              <mesh key={s} castShadow position={[s * off, y, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[LOG_R, LOG_R, side, 10]} />
                <meshStandardMaterial color={i % 2 ? LOG : LOG_DARK} />
              </mesh>
            ))}
          </group>
        );
      })}
      {/* Chinking strip behind the logs (fills the seams). */}
      <mesh position={[0, WALL_H / 2, -LOG_R * 0.55]}>
        <boxGeometry args={[length, WALL_H, 0.12]} />
        <meshStandardMaterial color={CHINK} />
      </mesh>
    </group>
  );
}

/** The animated woodfire: logs, flames that flicker, and a warm light. */
function Woodfire() {
  const flameRefs = useRef([]);
  const lightRef = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    flameRefs.current.forEach((f, i) => {
      if (!f) return;
      const s = 0.85 + Math.sin(t * (7 + i * 2.3) + i * 1.7) * 0.18 + Math.sin(t * 13 + i) * 0.08;
      f.scale.set(s, s * (1 + Math.sin(t * 9 + i) * 0.12), s);
    });
    if (lightRef.current) {
      lightRef.current.intensity = 1.5 + Math.sin(t * 8.5) * 0.25 + Math.sin(t * 13.7) * 0.15;
    }
  });

  const [fx, fz] = CABIN_FIRE.position;
  const W = CABIN_FIRE.width;
  return (
    <group position={[fx, 0, fz]}>
      {/* Stone chimney breast + firebox. */}
      <mesh castShadow position={[0, 2.6, -0.3]}>
        <boxGeometry args={[W, 5.2, 1.6]} />
        <meshStandardMaterial color={STONE} />
      </mesh>
      <mesh castShadow position={[0, 0.95, 0.25]}>
        <boxGeometry args={[W - 1.0, 1.9, 1.2]} />
        <meshStandardMaterial color={STONE_DARK} />
      </mesh>
      {/* The firebox opening (dark) + glowing embers floor. */}
      <mesh position={[0, 0.8, 0.87]}>
        <boxGeometry args={[2.4, 1.5, 0.1]} />
        <meshStandardMaterial color="#140b06" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 1.0]}>
        <planeGeometry args={[2.2, 0.9]} />
        <meshStandardMaterial color="#e8752e" emissive="#e8752e" emissiveIntensity={0.9} />
      </mesh>
      {/* Crossed logs. */}
      {[-0.5, 0.5].map((s, i) => (
        <mesh key={i} castShadow position={[s * 0.4, 0.32, 1.0]} rotation={[0, 0, Math.PI / 2 + s * 0.5]}>
          <cylinderGeometry args={[0.14, 0.14, 1.5, 8]} />
          <meshStandardMaterial color={LOG_DARK} />
        </mesh>
      ))}
      {/* Flickering flames (cones, additive-ish emissives). */}
      {[
        [0, 0.95, 1.0, "#ffb036", 0.55],
        [-0.45, 0.75, 1.05, "#ff8c2a", 0.4],
        [0.42, 0.72, 0.95, "#ffd166", 0.36],
      ].map(([x, y, z, c, r], i) => (
        <mesh key={i} ref={(el) => (flameRefs.current[i] = el)} position={[x, y, z]}>
          <coneGeometry args={[r, 1.15, 8]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1.6} transparent opacity={0.92} />
        </mesh>
      ))}
      {/* The fire's warm flickering light. */}
      <pointLight ref={lightRef} position={[0, 1.6, 1.6]} color="#ffb36b" intensity={1.6} distance={26} decay={2} />
      {/* Mantel + a pair of mugs. */}
      <mesh castShadow position={[0, 2.15, 0.75]}>
        <boxGeometry args={[W - 0.6, 0.18, 0.5]} />
        <meshStandardMaterial color={PLANK_DARK} />
      </mesh>
      {[-1.4, 1.2].map((x, i) => (
        <mesh key={i} castShadow position={[x, 2.36, 0.75]}>
          <cylinderGeometry args={[0.12, 0.1, 0.22, 10]} />
          <meshStandardMaterial color={i ? "#4cc9f0" : "#d6493f"} />
        </mesh>
      ))}
    </group>
  );
}

/** A little candle with a breathing glow. */
function Candle({ position }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.intensity = 0.5 + Math.sin(state.clock.elapsedTime * 6 + position[0]) * 0.12;
  });
  return (
    <group position={[position[0], 1.06, position[1]]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.22, 8]} />
        <meshStandardMaterial color="#f3ead6" />
      </mesh>
      <mesh position={[0, 0.17, 0]}>
        <coneGeometry args={[0.035, 0.1, 6]} />
        <meshStandardMaterial color={CANDLE_GLOW} emissive={CANDLE_GLOW} emissiveIntensity={1.6} />
      </mesh>
      <pointLight ref={ref} position={[0, 0.35, 0]} color={CANDLE_GLOW} intensity={0.5} distance={5} decay={2} />
    </group>
  );
}

/** The long dining table + benches. */
function LongTable() {
  const t = CABIN_LONG_TABLE;
  return (
    <group position={[t.x, 0, t.z]}>
      <mesh castShadow position={[0, 0.95, 0]}>
        <boxGeometry args={[t.w, 0.14, t.d]} />
        <meshStandardMaterial color={PLANK} />
      </mesh>
      {[[-t.w / 2 + 0.5, -t.d / 2 + 0.35], [t.w / 2 - 0.5, -t.d / 2 + 0.35], [-t.w / 2 + 0.5, t.d / 2 - 0.35], [t.w / 2 - 0.5, t.d / 2 - 0.35]].map(([lx, lz], i) => (
        <mesh key={i} castShadow position={[lx, 0.45, lz]}>
          <boxGeometry args={[0.18, 0.9, 0.18]} />
          <meshStandardMaterial color={PLANK_DARK} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <group key={s} position={[0, 0, s * (t.d / 2 + 0.85)]}>
          <mesh castShadow position={[0, 0.5, 0]}>
            <boxGeometry args={[t.w - 1.2, 0.1, 0.55]} />
            <meshStandardMaterial color={PLANK} />
          </mesh>
          {[-1, 1].map((e) => (
            <mesh key={e} castShadow position={[e * (t.w / 2 - 1.1), 0.24, 0]}>
              <boxGeometry args={[0.16, 0.48, 0.5]} />
              <meshStandardMaterial color={PLANK_DARK} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/** A round side table with two stools. */
function RoundTable({ x, z, r }) {
  return (
    <group position={[x, 0, z]}>
      <mesh castShadow position={[0, 0.92, 0]}>
        <cylinderGeometry args={[r, r, 0.12, 16]} />
        <meshStandardMaterial color={PLANK} />
      </mesh>
      <mesh castShadow position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.16, 0.22, 0.9, 8]} />
        <meshStandardMaterial color={PLANK_DARK} />
      </mesh>
      {[0.8, 2.6].map((a, i) => (
        <group key={i} position={[Math.sin(a) * (r + 0.75), 0, Math.cos(a) * (r + 0.75)]}>
          <mesh castShadow position={[0, 0.42, 0]}>
            <cylinderGeometry args={[0.32, 0.36, 0.12, 10]} />
            <meshStandardMaterial color={PLANK} />
          </mesh>
          <mesh castShadow position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.09, 0.12, 0.4, 8]} />
            <meshStandardMaterial color={PLANK_DARK} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** A bookshelf with rows of little books. */
function Bookshelf({ position }) {
  const spines = [];
  for (let row = 0; row < 3; row++) {
    let off = -0.72;
    let k = 0;
    while (off < 0.6) {
      const w = 0.12 + ((row * 7 + k * 3) % 4) * 0.03;
      spines.push([off + w / 2, 0.62 + row * 0.62, w, 0.34 + ((k + row) % 3) * 0.05, ["#a63c32", "#3a6ea5", "#d9a441", "#4a7c59", "#7b5cd6"][(row + k) % 5]]);
      off += w + 0.03;
      k++;
    }
  }
  return (
    <group position={[position[0], 0, position[1]]} rotation={[0, Math.PI / 2, 0]}>
      <mesh castShadow position={[0, 1.1, -0.1]}>
        <boxGeometry args={[1.7, 2.2, 0.5]} />
        <meshStandardMaterial color={PLANK_DARK} />
      </mesh>
      {spines.map(([x, y, w, h, c], i) => (
        <mesh key={i} position={[x, y, 0.12]}>
          <boxGeometry args={[w, h, 0.22]} />
          <meshStandardMaterial color={c} />
        </mesh>
      ))}
    </group>
  );
}

/** The bedroom: plank interior walls with a doorway + furniture. */
function Bedroom() {
  const { wallX, wallZ, doorXMin, doorXMax } = CABIN_BEDROOM;
  const H = 3.2;
  const zLen = HALF_D - wallZ;
  return (
    <group>
      {/* Plank wall along z = wallZ (with the doorway gap). */}
      <mesh castShadow position={[(wallX + doorXMin) / 2, H / 2, wallZ]}>
        <boxGeometry args={[doorXMin - wallX, H, 0.3]} />
        <meshStandardMaterial color={PLANK_DARK} />
      </mesh>
      <mesh castShadow position={[(doorXMax + HALF_W) / 2, H / 2, wallZ]}>
        <boxGeometry args={[HALF_W - doorXMax, H, 0.3]} />
        <meshStandardMaterial color={PLANK_DARK} />
      </mesh>
      {/* The lintel over the bedroom doorway. */}
      <mesh castShadow position={[(doorXMin + doorXMax) / 2, H - 0.3, wallZ]}>
        <boxGeometry args={[doorXMax - doorXMin, 0.6, 0.3]} />
        <meshStandardMaterial color={PLANK_DARK} />
      </mesh>
      {/* Plank wall along x = wallX. */}
      <mesh castShadow position={[wallX, H / 2, wallZ + zLen / 2]}>
        <boxGeometry args={[0.3, H, zLen]} />
        <meshStandardMaterial color={PLANK_DARK} />
      </mesh>

      {/* The bed: frame, mattress, pillow, blanket. */}
      <group position={[CABIN_BED.position[0], 0, CABIN_BED.position[1]]} rotation={[0, CABIN_BED.rotationY, 0]}>
        <mesh castShadow position={[0, 0.3, 0]}>
          <boxGeometry args={[2.1, 0.5, 3.2]} />
          <meshStandardMaterial color={PLANK_DARK} />
        </mesh>
        <mesh castShadow position={[0, 0.62, 0]}>
          <boxGeometry args={[1.9, 0.3, 3.0]} />
          <meshStandardMaterial color="#f3ead6" />
        </mesh>
        <mesh castShadow position={[0, 0.82, -1.05]}>
          <boxGeometry args={[1.5, 0.24, 0.7]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh castShadow position={[0, 0.74, 0.55]}>
          <boxGeometry args={[1.92, 0.16, 1.9]} />
          <meshStandardMaterial color={RUG_A} />
        </mesh>
        <mesh castShadow position={[0, 1.1, -1.62]}>
          <boxGeometry args={[2.1, 1.1, 0.14]} />
          <meshStandardMaterial color={PLANK_DARK} />
        </mesh>
      </group>

      {/* Wardrobe. */}
      <group position={[CABIN_WARDROBE.position[0], 0, CABIN_WARDROBE.position[1]]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh castShadow position={[0, 1.25, 0]}>
          <boxGeometry args={[1.7, 2.5, 0.9]} />
          <meshStandardMaterial color={PLANK} />
        </mesh>
        <mesh position={[0, 1.25, 0.46]}>
          <boxGeometry args={[0.06, 2.1, 0.04]} />
          <meshStandardMaterial color={LOG_DARK} />
        </mesh>
      </group>

      {/* Bedside table + lamp. */}
      <group position={[CABIN_BEDSIDE.position[0], 0, CABIN_BEDSIDE.position[1]]}>
        <mesh castShadow position={[0, 0.5, 0]}>
          <boxGeometry args={[0.8, 1.0, 0.8]} />
          <meshStandardMaterial color={PLANK} />
        </mesh>
      </group>

      {/* Bedroom rug. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[CABIN_BEDROOM_RUG.position[0], 0.03, CABIN_BEDROOM_RUG.position[1]]}>
        <circleGeometry args={[CABIN_BEDROOM_RUG.radius, 24]} />
        <meshStandardMaterial color={RUG_B} />
      </mesh>
    </group>
  );
}

/** A window: frame + icy twilight pane + snowy sill. */
function CabinWindow({ x, z, rotY }) {
  return (
    <group position={[x, 2.2, z]} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0, 0.5]}>
        <boxGeometry args={[1.9, 1.6, 0.14]} />
        <meshStandardMaterial color={PLANK_DARK} />
      </mesh>
      <mesh position={[0, 0, 0.56]}>
        <boxGeometry args={[1.6, 1.3, 0.05]} />
        <meshStandardMaterial color={WINDOW_ICE} emissive={WINDOW_ICE} emissiveIntensity={0.55} />
      </mesh>
      {/* Muntins + snowy sill. */}
      <mesh position={[0, 0, 0.6]}>
        <boxGeometry args={[0.06, 1.3, 0.04]} />
        <meshStandardMaterial color={PLANK_DARK} />
      </mesh>
      <mesh position={[0, -0.85, 0.62]}>
        <boxGeometry args={[2.0, 0.14, 0.3]} />
        <meshStandardMaterial color="#eef4fd" />
      </mesh>
    </group>
  );
}

/** The ajar return door — swings wide as the player approaches. */
function AjarDoor() {
  const doorRef = useRef();
  useFrame(() => {
    if (!doorRef.current) return;
    const [dx, dz] = CABIN_DOOR.position;
    const near = Math.hypot(playerState.x - dx, playerState.z - dz) < 4.5;
    const target = near ? 1.9 : 0.4; // ajar → wide open
    doorRef.current.rotation.y += (target - doorRef.current.rotation.y) * 0.08;
  });
  const [dx, dz] = CABIN_DOOR.position;
  return (
    <group position={[dx, 0, HALF_D]}>
      {/* Frame posts + lintel around the wall gap. */}
      {[-1, 1].map((s) => (
        <mesh key={s} castShadow position={[s * 2.0, 1.5, 0]}>
          <boxGeometry args={[0.3, 3.0, 0.6]} />
          <meshStandardMaterial color={PLANK_DARK} />
        </mesh>
      ))}
      <mesh castShadow position={[0, 3.0, 0]}>
        <boxGeometry args={[4.3, 0.35, 0.6]} />
        <meshStandardMaterial color={PLANK_DARK} />
      </mesh>
      {/* The door panel, hinged on the west jamb. */}
      <group position={[-1.8, 0, 0.1]}>
        <group ref={doorRef} rotation={[0, 0.4, 0]}>
          <mesh castShadow position={[1.75, 1.4, 0]}>
            <boxGeometry args={[3.5, 2.8, 0.12]} />
            <meshStandardMaterial color={PLANK} />
          </mesh>
          <mesh position={[3.1, 1.4, 0.1]}>
            <sphereGeometry args={[0.09, 8, 8]} />
            <meshStandardMaterial color="#c9a227" metalness={0.5} roughness={0.4} />
          </mesh>
        </group>
      </group>
      {/* Cold twilight spilling in through the doorway. */}
      <pointLight position={[0, 2.0, 1.2]} color="#7d9fd4" intensity={0.5} distance={8} decay={2} />
    </group>
  );
}

export default function CabinScenery() {
  return (
    <group>
      {/* The plank floor (with darker plank seams). */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[CABIN_BOUNDS.width + 8, CABIN_BOUNDS.height + 8]} />
        <meshStandardMaterial color={PLANK} />
      </mesh>
      {Array.from({ length: 14 }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-HALF_W + 1 + i * (HALF_W / 7), 0.01, 0]}>
          <planeGeometry args={[0.12, CABIN_BOUNDS.height + 6]} />
          <meshStandardMaterial color={PLANK_DARK} />
        </mesh>
      ))}

      {/* The four log walls (the south wall carries the doorway gap). */}
      <LogWall length={HALF_W * 2} position={[0, 0, -HALF_D]} rotationY={0} />
      <LogWall length={HALF_W * 2} position={[0, 0, HALF_D]} rotationY={Math.PI} gap={CABIN_DOOR_GAP} />
      <LogWall length={HALF_D * 2} position={[-HALF_W, 0, 0]} rotationY={Math.PI / 2} />
      <LogWall length={HALF_D * 2} position={[HALF_W, 0, 0]} rotationY={-Math.PI / 2} />
      {/* Corner posts. */}
      {[[-HALF_W, -HALF_D], [HALF_W, -HALF_D], [-HALF_W, HALF_D], [HALF_W, HALF_D]].map(([cx, cz], i) => (
        <mesh key={i} castShadow position={[cx, WALL_H / 2, cz]}>
          <cylinderGeometry args={[0.55, 0.6, WALL_H, 10]} />
          <meshStandardMaterial color={LOG_DARK} />
        </mesh>
      ))}

      <Woodfire />

      {/* The hearth rug (two-tone rings). */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[CABIN_HEARTH_RUG.position[0], 0.03, CABIN_HEARTH_RUG.position[1]]}>
        <circleGeometry args={[CABIN_HEARTH_RUG.radius, 28]} />
        <meshStandardMaterial color={RUG_A} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[CABIN_HEARTH_RUG.position[0], 0.04, CABIN_HEARTH_RUG.position[1]]}>
        <ringGeometry args={[CABIN_HEARTH_RUG.radius * 0.55, CABIN_HEARTH_RUG.radius * 0.72, 28]} />
        <meshStandardMaterial color={RUG_B} />
      </mesh>

      <LongTable />
      {CABIN_ROUND_TABLES.map((t, i) => (
        <RoundTable key={i} {...t} />
      ))}
      {CABIN_BOOKSHELVES.map((p, i) => (
        <Bookshelf key={i} position={p} />
      ))}
      <Bedroom />
      {CABIN_WINDOWS.map(([x, z, rotY], i) => (
        <CabinWindow key={i} x={x} z={z} rotY={rotY} />
      ))}
      {CABIN_CANDLES.map((p, i) => (
        <Candle key={i} position={p} />
      ))}
      <AjarDoor />

      {/* A firewood basket by the hearth. */}
      <group position={[3.6, 0, -18.2]}>
        <mesh castShadow position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.7, 0.55, 0.7, 10, 1, true]} />
          <meshStandardMaterial color={PLANK_DARK} side={THREE.DoubleSide} />
        </mesh>
        {[0, 0.7, 1.4, 2.1].map((a, i) => (
          <mesh key={i} castShadow position={[Math.sin(a) * 0.22, 0.55 + (i % 2) * 0.16, Math.cos(a) * 0.22]} rotation={[0.3, a, 0]}>
            <cylinderGeometry args={[0.11, 0.11, 0.9, 7]} />
            <meshStandardMaterial color={LOG} />
          </mesh>
        ))}
      </group>

      {/* The lodge sign over the mantel. */}
      <Html position={[0, 5.4, -19.4]} center distanceFactor={12} className="ix-badge-anchor" zIndexRange={[24, 0]}>
        <div className="fc-count-chip">🔥 The Lodge</div>
      </Html>
    </group>
  );
}
