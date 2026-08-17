import * as THREE from "three";

/**
 * ROOT MOTION (2026-08-01) — extract a clip's built-in travel so CODE owns
 * where a character ends up.
 *
 * THE PROBLEM. Meshy's action clips (Pete's `360_Power_Spin_Jump`, the
 * players' `Jump_Over_Obstacle_2`) animate the HIPS bone forward through
 * space — the character visibly leaps a few metres. But the game's position
 * for that character never moved, so the instant the clip ends and the pose
 * returns to rest, the body SNAPS back to where it started. That backwards
 * slide is the bug.
 *
 * THE FIX. Two halves, both here:
 *   1. `extractRootMotion` strips the HORIZONTAL translation out of the
 *      clip's root track, so the clip animates IN PLACE and can never move
 *      the body on its own. Vertical (the hop) is left alone — that's the
 *      arc, and it belongs to the animation.
 *   2. It returns a `sample(t)` curve of the travel it removed. Callers feed
 *      that into their own position each frame, so the character travels
 *      exactly as the animator intended AND the game's idea of where they
 *      are stays true. No snap, and collision/bounds still work because the
 *      real position was never bypassed.
 *
 * Clip tracks are shared across every user of a cached glTF, so this MUTATES
 * the clip once and marks it — calling it again is a no-op that returns the
 * cached curve.
 */

const CACHE = new WeakMap();

/** The bone a clip actually translates (usually "Hips" / "Root" / "Armature"). */
function findRootTrack(clip) {
  // Prefer an explicitly named root/hips track…
  const named = clip.tracks.find(
    (t) => /\.position$/.test(t.name) && /(hips|root|pelvis|armature)/i.test(t.name)
  );
  if (named) return named;
  // …otherwise the position track that travels furthest horizontally.
  let best = null;
  let bestSpan = 0;
  for (const t of clip.tracks) {
    if (!/\.position$/.test(t.name)) continue;
    const v = t.values;
    if (!v || v.length < 6) continue;
    const span = Math.hypot(v[v.length - 3] - v[0], v[v.length - 1] - v[2]);
    if (span > bestSpan) {
      bestSpan = span;
      best = t;
    }
  }
  return bestSpan > 1e-4 ? best : null;
}

/**
 * Strip a clip's horizontal root travel and return a sampler for it.
 *
 * @returns {null | {
 *   duration: number,               // the clip's real length, seconds
 *   total: {x: number, z: number},  // travel removed, in the ROOT BONE's units
 *   sample: (t: number) => {x, z},  // travel at time t (same units)
 * }}
 * `null` when the clip doesn't move (walk/idle cycles) — callers then just
 * play it and nothing else changes.
 */
export function extractRootMotion(clip) {
  if (!clip) return null;
  if (CACHE.has(clip)) return CACHE.get(clip);

  const track = findRootTrack(clip);
  if (!track) {
    CACHE.set(clip, null);
    return null;
  }

  const times = track.times;
  const values = track.values;
  const n = times.length;
  const x0 = values[0];
  const z0 = values[2];

  // Copy out the horizontal offsets BEFORE flattening them.
  const dx = new Float32Array(n);
  const dz = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    dx[i] = values[i * 3] - x0;
    dz[i] = values[i * 3 + 2] - z0;
    // Flatten in place: the clip now spins/jumps without going anywhere.
    // values[i*3 + 1] (height) is deliberately untouched.
    values[i * 3] = x0;
    values[i * 3 + 2] = z0;
  }

  const motion = {
    // The track's name is captured NOW: once the values are flattened the
    // "furthest travelling track" fallback could never find it again.
    trackName: track.name,
    duration: n ? times[n - 1] : 0,
    total: { x: dx[n - 1] || 0, z: dz[n - 1] || 0 },
    sample(t) {
      if (n === 0) return { x: 0, z: 0 };
      if (t <= times[0]) return { x: dx[0], z: dz[0] };
      if (t >= times[n - 1]) return { x: dx[n - 1], z: dz[n - 1] };
      // Linear between keyframes — plenty for a position curve.
      let hi = 1;
      while (hi < n - 1 && times[hi] < t) hi++;
      const lo = hi - 1;
      const span = times[hi] - times[lo] || 1;
      const f = (t - times[lo]) / span;
      return { x: dx[lo] + (dx[hi] - dx[lo]) * f, z: dz[lo] + (dz[hi] - dz[lo]) * f };
    },
  };

  CACHE.set(clip, motion);
  return motion;
}

/**
 * Return a CLONE of `clip` whose root (hips) horizontal travel has been
 * flattened, so the clip animates IN PLACE. Height (the hop's arc) is kept.
 *
 * Unlike `extractRootMotion`, this does NOT mutate the shared clip and is meant
 * to be applied to the animation list BEFORE the mixer is built (so the action
 * plays the in-place version). This is the reliable way to stop a travelling
 * clip (e.g. the players' jump) from snapping the mesh back to the take-off spot
 * when it ends — horizontal travel is owned by the game code instead.
 *
 * Returns the original clip unchanged when it doesn't travel (walk/idle cycles).
 */
export function flattenClipTravel(clip) {
  if (!clip || typeof clip.clone !== "function") return clip;
  const track = findRootTrack(clip);
  if (!track) return clip;
  const clone = clip.clone(); // three's clone copies each track's values array
  const ct = clone.tracks.find((t) => t.name === track.name);
  if (!ct || !ct.values || ct.values.length < 3) return clip;
  const v = ct.values;
  const x0 = v[0];
  const z0 = v[2];
  for (let i = 0; i < v.length; i += 3) {
    v[i] = x0; // flatten X
    v[i + 2] = z0; // flatten Z — height (v[i+1]) is deliberately left alone
  }
  return clone;
}

const _scale = new THREE.Vector3();

/**
 * How many WORLD units one unit of root-bone travel is worth.
 *
 * The track lives in the root bone's parent space (Meshy rigs put a 0.01
 * armature scale there), and our own character group scales on top. Reading
 * the live world scale picks up both, so nothing has to be hardcoded — if a
 * model is re-exported at a different scale this still holds.
 *
 * Returns 0 when the bone can't be found, which makes callers no-op safely.
 */
export function rootMotionScale(object3d, trackName) {
  if (!object3d || !trackName) return 0;
  const boneName = trackName.replace(/\.position$/, "");
  const bone = object3d.getObjectByName(boneName);
  const parent = bone && bone.parent;
  if (!parent) return 0;
  parent.getWorldScale(_scale);
  // Rigs are uniformly scaled; x is representative.
  return _scale.x || 0;
}
