import React, { useEffect, useMemo, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";

import { modelUrl } from "./characterModels.js";
import { useUI } from "../../ui/effects/uiStore.js";
import { injectOutlines } from "./outline.js";

/**
 * CHARACTER MODEL (W2-H) — renders a glTF character and switches animation by
 * proximity: a resting clip when the player is away, and the "talk" clip when
 * they enter the character's radius (`nearby`). Rendered only when a character
 * has a `file`; CharacterAvatar wraps it in <Suspense> + an error boundary, so a
 * missing/broken model falls back to the primitive shape rather than breaking.
 *
 * The scene is CLONED (SkeletonUtils) so the SAME model can be used by more
 * than one NPC at once (e.g. the farmer.glb quiz hosts) without them sharing
 * one object3D. Each clone gets its own animation mixer.
 *
 * Meshy clip names are descriptive (e.g. "Cardio_Dance", "Talk_Passionately",
 * "Running", "Walking"), so we resolve by rule:
 *   - talk  = the clip whose name contains "talk"
 *   - rest  = the first clip that is NOT talk and NOT locomotion (run/walk)
 * Config can override with exact names via cfg.idle / cfg.greet.
 */
export default function CharacterModel({ cfg, scale = 1, nearby = false }) {
  const { scene, animations } = useGLTF(modelUrl(cfg.file));
  const cloned = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const ref = useRef();
  const { actions, names } = useAnimations(animations, ref);
  const highGfx = useUI((s) => s.graphicsQuality) === "high";
  // A stable per-instance phase (0..1) so identical NPCs standing together do
  // NOT play their idle/wave clip in unison — each starts at a different point
  // in the loop (applied as an action.time offset below).
  const phase = useRef(Math.random());

  // Thin cartoon outline (W5-C), High graphics only. Injected after the model
  // mounts; skinned meshes share the skeleton so the outline animates too.
  useEffect(() => {
    if (!highGfx || !ref.current) return undefined;
    const remove = injectOutlines(ref.current, { scale: 1.03 });
    return remove;
  }, [highGfx, cloned]);

  const talkName = useMemo(() => {
    if (cfg.greet && names.includes(cfg.greet)) return cfg.greet;
    return names.find((n) => /talk/i.test(n)) || null;
  }, [names, cfg.greet]);

  const restName = useMemo(() => {
    if (cfg.idle && names.includes(cfg.idle)) return cfg.idle;
    // Prefer a true idle / wave / pose clip. If a model has none of those (e.g.
    // bacon.glb only ships Running / a Talk / Walking), fall back to the TALK
    // gesture — a stationary pose — rather than a locomotion clip, so a standing
    // NPC never rests in a running/walking pose.
    const isLoco = (n) => /(run|walk|sprint|jog|march)/i.test(n);
    return (
      names.find((n) => !/talk/i.test(n) && !isLoco(n)) ||
      names.find((n) => /talk/i.test(n)) ||
      names.find((n) => !isLoco(n)) ||
      names[0] ||
      null
    );
  }, [names, cfg.idle]);

  // Crossfade to the talk clip while the player is nearby, else the resting clip.
  useEffect(() => {
    const target = (nearby && talkName) || restName;
    const action = target ? actions[target] : null;
    if (!action) return undefined;
    action.reset().fadeIn(0.3).play();
    // Desync from other identical NPCs: start this clip at a random phase.
    const dur = action.getClip && action.getClip() ? action.getClip().duration : 0;
    if (dur > 0) action.time = phase.current * dur;
    return () => { action.fadeOut(0.3); };
  }, [actions, restName, talkName, nearby]);

  const s = scale * (cfg.modelScale || 1);
  return (
    <group ref={ref} scale={s} position={[0, cfg.yOffset || 0, 0]} rotation={[0, cfg.rotationY || 0, 0]}>
      <primitive object={cloned} />
    </group>
  );
}
