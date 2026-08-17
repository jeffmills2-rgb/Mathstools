import React, { Suspense } from "react";
import { useGLTF } from "@react-three/drei";

import { modelConfig, modelUrl, configuredModelFiles } from "./characterModels.js";
import CharacterModel from "./CharacterModel.jsx";

/**
 * CHARACTER AVATAR (W2-H) — the single entry point for drawing a character body.
 * If the character has a glTF `file` configured it renders the 3D model (with an
 * idle animation); otherwise — and if the model fails to load — it renders the
 * original low-poly box-and-sphere fallback. So the game always works, and each
 * character upgrades the moment its model + config are added.
 */

// Preload any configured models (no-op while every id is still on the fallback).
configuredModelFiles().forEach((f) => {
  try { useGLTF.preload(modelUrl(f)); } catch { /* ignore */ }
});

function PrimitiveBody({ color }) {
  return (
    <group>
      <mesh castShadow position={[0, 0.9, 0]}>
        <boxGeometry args={[1, 1.4, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh castShadow position={[0, 2, 0]}>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

// Renders the fallback if a model errors while loading (missing file, bad rig…).
class ModelErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { /* keep the world alive; fall back silently */ }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export default function CharacterAvatar({ id, color, scale = 1, nearby = false }) {
  const cfg = modelConfig(id);
  const fallback = <group scale={scale}><PrimitiveBody color={color} /></group>;
  if (!cfg.file) return fallback;
  return (
    <ModelErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <CharacterModel cfg={cfg} scale={scale} nearby={nearby} />
      </Suspense>
    </ModelErrorBoundary>
  );
}
