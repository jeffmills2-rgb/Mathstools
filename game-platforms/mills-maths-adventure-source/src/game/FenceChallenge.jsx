import React, { useMemo, useRef, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useGLTF, useAnimations } from "@react-three/drei";

import { CHALLENGE_FENCE, CHALLENGE_FENCE_LENGTH } from "../data/farm/farmLayout.js";
import { useFarmChallenge } from "./farmChallengeStore.js";
import { playerState } from "./sessionStore.js";
import { modelConfig, modelUrl } from "./characters/characterModels.js";

/**
 * FENCE CHALLENGE — 3D layer (F2). The long challenge fence with a RED end
 * post (west) and a BLUE end post (east). While a round is active a glowing
 * marker slides along the fence, tracking the PLAYER's position — the student
 * literally walks to where they think the fraction is and presses "Place".
 * On feedback the fence reveals its measurements: fraction tick marks, the
 * true target (green) and the placement (green/red).
 *
 * The 2D prompt/buttons live in ui/FarmChallengePanel.jsx; round state in
 * game/farmChallengeStore.js; the maths in data/farm/fenceChallenge.js.
 */

const { x1, x2, z, redPost, bluePost } = CHALLENGE_FENCE;
const L = CHALLENGE_FENCE_LENGTH;

function EndPost({ x, color, label, metres }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[0.3, 1.8, 0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.9, 0]} castShadow>
        <sphereGeometry args={[0.28, 12, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} />
      </mesh>
      <Html position={[0, 2.6, 0]} center distanceFactor={14} className="ix-badge-anchor" zIndexRange={[24, 0]}>
        <div className="unlock-sign open" style={{ borderColor: color }}>
          {label} · {metres} m
        </div>
      </Html>
    </group>
  );
}

/** The fence itself — posts + two rails, matching the farm's fence style. */
function FenceLine() {
  const posts = useMemo(() => {
    const steps = Math.round(L / 2.5);
    const out = [];
    for (let i = 1; i < steps; i++) out.push(x1 + (L * i) / steps);
    return out;
  }, []);
  return (
    <group>
      {posts.map((px, i) => (
        <mesh key={i} position={[px, 0.55, z]} castShadow>
          <boxGeometry args={[0.16, 1.1, 0.16]} />
          <meshStandardMaterial color="#7d5a37" />
        </mesh>
      ))}
      {[0.85, 0.45].map((y) => (
        <mesh key={y} position={[(x1 + x2) / 2, y, z]} castShadow>
          <boxGeometry args={[L, 0.09, 0.07]} />
          <meshStandardMaterial color="#9a7248" />
        </mesh>
      ))}
    </group>
  );
}

// ---- The marker bird -------------------------------------------------------
// A bird perched on the fence marks the placement spot: "air squat" clip
// while sitting, "headstand flip" while sliding with the player. Falls back
// to a primitive bird until bird.glb is added to public/models/characters/.

function PrimitiveBird() {
  return (
    <group>
      <mesh castShadow position={[0, 0.22, 0]}>
        <sphereGeometry args={[0.26, 12, 10]} />
        <meshStandardMaterial color="#f3f3ee" />
      </mesh>
      <mesh castShadow position={[0, 0.5, 0.12]}>
        <sphereGeometry args={[0.16, 10, 10]} />
        <meshStandardMaterial color="#f3f3ee" />
      </mesh>
      <mesh position={[0, 0.48, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.05, 0.16, 8]} />
        <meshStandardMaterial color="#f4a30a" />
      </mesh>
      <mesh castShadow position={[0, 0.28, -0.24]} rotation={[0.7, 0, 0]}>
        <boxGeometry args={[0.16, 0.05, 0.3]} />
        <meshStandardMaterial color="#d9d9d2" />
      </mesh>
    </group>
  );
}

/** The glTF bird: switches clips imperatively as the marker starts/stops. */
function BirdModel({ movingRef }) {
  const cfg = modelConfig("fence-bird");
  const { scene, animations } = useGLTF(modelUrl(cfg.file));
  const ref = useRef();
  const { actions, names } = useAnimations(animations, ref);
  const current = useRef(null);

  const idleName = useMemo(
    () => (cfg.idle && names.includes(cfg.idle)) ? cfg.idle
      : names.find((n) => /squat/i.test(n)) || names[0] || null,
    [names, cfg.idle]
  );
  const moveName = useMemo(
    () => names.find((n) => /flip|headstand/i.test(n)) || idleName,
    [names, idleName]
  );

  useFrame(() => {
    const want = movingRef.current ? moveName : idleName;
    if (!want || want === current.current) return;
    const prev = current.current ? actions[current.current] : null;
    const next = actions[want];
    if (!next) return;
    if (prev) prev.fadeOut(0.2);
    next.reset().fadeIn(0.2).play();
    current.current = want;
  });

  return (
    <group ref={ref} scale={cfg.modelScale || 1} position={[0, cfg.yOffset || 0, 0]} rotation={[0, cfg.rotationY || 0, 0]}>
      <primitive object={scene} />
    </group>
  );
}

class BirdErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { /* fall back silently */ }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function MarkerBird({ movingRef }) {
  const fallback = <PrimitiveBird />;
  return (
    <BirdErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <BirdModel movingRef={movingRef} />
      </Suspense>
    </BirdErrorBoundary>
  );
}

/** The sliding marker: tracks the player while placing; locks on feedback. */
function GateMarker() {
  const group = useRef();
  const status = useFarmChallenge((s) => s.status);
  const results = useFarmChallenge((s) => s.results);
  const round = useFarmChallenge((s) => s.currentRound());
  const last = results[results.length - 1] || null;

  const movingRef = useRef(false);

  useFrame(() => {
    if (!group.current) return;
    if (status === "placing") {
      const px = Math.max(x1, Math.min(x2, playerState.x));
      movingRef.current = Math.abs(px - group.current.position.x) > 0.015;
      group.current.position.x = px;
      group.current.position.y = 0.95; // perched on the top rail
    } else if (status === "feedback" && last) {
      movingRef.current = false;
      group.current.position.x = x1 + last.placedFromRed;
      group.current.position.y = 0.95;
    }
  });

  if (status !== "placing" && status !== "feedback") return null;
  const color =
    status === "placing" ? "#f4a30a"
    : last && last.grade.band === "bullseye" ? "#e0a800"
    : last && last.grade.correct ? "#2a9d2a"
    : "#d43f3f";
  const item = status === "placing" ? round && round.item : last && last.round.item;

  return (
    <group ref={group} position={[(x1 + x2) / 2, 0.95, z]}>
      {/* The marker bird — sits on the fence, flips along as you walk. */}
      <MarkerBird movingRef={movingRef} />
      {item && (
        <Html position={[0, 1.5, 0]} center distanceFactor={12} className="ix-badge-anchor" zIndexRange={[24, 0]}>
          <div className="unlock-sign open" style={{ borderColor: color }}>{item}</div>
        </Html>
      )}
    </group>
  );
}

/** Feedback reveal: fraction ticks + the true target in green. */
function FeedbackReveal() {
  const status = useFarmChallenge((s) => s.status);
  const results = useFarmChallenge((s) => s.results);
  const last = results[results.length - 1] || null;
  if (status !== "feedback" || !last) return null;

  const { round, grade } = last;
  const ticks = [];
  for (let k = 1; k < round.d; k++) ticks.push(x1 + (L * k) / round.d);
  const targetX = x1 + grade.targetFromRed;
  const targetM = Math.round(grade.targetFromRed * 10) / 10;

  return (
    <group>
      {ticks.map((tx, i) => (
        <mesh key={i} position={[tx, 1.15, z]}>
          <boxGeometry args={[0.08, 0.5, 0.2]} />
          <meshStandardMaterial color="#fdfdf4" emissive="#fdfdf4" emissiveIntensity={0.25} />
        </mesh>
      ))}
      {/* The true spot — a green flag. */}
      <group position={[targetX, 0, z]}>
        <mesh position={[0, 1.1, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 2.2, 8]} />
          <meshStandardMaterial color="#1c7c1c" />
        </mesh>
        <mesh position={[0.3, 1.95, 0]}>
          <boxGeometry args={[0.6, 0.35, 0.04]} />
          <meshStandardMaterial color="#2a9d2a" emissive="#2a9d2a" emissiveIntensity={0.4} />
        </mesh>
        <Html position={[0, 2.6, 0]} center distanceFactor={12} className="ix-badge-anchor" zIndexRange={[24, 0]}>
          <div className="unlock-sign open" style={{ borderColor: "#2a9d2a" }}>
            {round.display} = {targetM} m from {round.fromEnd}
          </div>
        </Html>
      </group>
    </group>
  );
}

export default function FenceChallenge() {
  return (
    <group>
      <FenceLine />
      <EndPost x={x1} color={redPost.color} label="RED" metres={0} />
      <EndPost x={x2} color={bluePost.color} label="BLUE" metres={L} />
      <GateMarker />
      <FeedbackReveal />
    </group>
  );
}
