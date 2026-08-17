import React, { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { useKeyboard } from "./useKeyboard.js";
import { useProgress } from "../progress/store.js";
import { useUI } from "../ui/effects/uiStore.js";
import { useSession, playerState, clearMoveTarget, touchInput } from "./sessionStore.js";
import { getColliders } from "../data/worldColliders.js";
import { getRegion, clampToBounds } from "../data/regions.js";
import { resolveCircle, groundHeightAt, PLAYER_RADIUS, STEP_UP, STEP_DOWN } from "../systems/collisionEngine.js";
import PlayerCharacter from "./characters/PlayerCharacter.jsx";
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
import { useSnowballRange } from "./snowballRangeStore.js";
import { useRinkGlide } from "./rinkGlideStore.js";
import { useGroveLights } from "./groveLightsStore.js";
import { useMeadowLevel } from "./meadowLevelStore.js";
import { useSledSlope } from "./sledSlopeStore.js";
import { useVillageSplit } from "./villageSplitStore.js";
import { useColonyPairs } from "./colonyPairsStore.js";
import { useCaveCrystals } from "./caveCrystalsStore.js";
import { useLodgeYard } from "./lodgeYardStore.js";
import { useAuroraLookout } from "./auroraLookoutStore.js";
import { useResults } from "../results/resultStore.js";
import { isPlaygroundUnlocked } from "../results/resultUtils.js";
import {
  CHALLENGE_FENCE, CHALLENGE_FENCE_LENGTH, ROUNDUP_FIELD, ROUNDUP_PEN,
  ORDER_GARDEN, ORDER_VIEW_SPOT, CRATE_AREA, CRATE_ROW, CRATE_VIEW_SPOT,
  MILK_AREA, MILK_VIEW_SPOT, WEIGH_AREA, WEIGH_VIEW_SPOT,
  TRADE_AREA, TRADE_VIEW_SPOT, VEGGIE_AREA, VEGGIE_VIEW_SPOT,
  PLANK_AREA, PLANK_VIEW_SPOT,
  SHOP_AREA, SHOP_VIEW_SPOT,
} from "../data/farm/farmLayout.js";
import {
  isOnIce, RANGE_AREA, RANGE_VIEW_SPOT,
  RINK_GLIDE_LINE, RINK_GLIDE_VIEW_SPOT,
  GROVE_TREE_POS, GROVE_VIEW_SPOT,
  MEADOW_TOWER_LEFT, MEADOW_TOWER_RIGHT, MEADOW_VIEW_SPOT,
  SLOPE_LANE, SLOPE_VIEW_SPOT, snowGroundHeight,
  VILLAGE_BUILD_SITE, VILLAGE_VIEW_SPOT,
  COLONY_AREA, COLONY_VIEW_SPOT,
  CAVE_AREA, CAVE_VIEW_SPOT,
  YARD_AREA, YARD_VIEW_SPOT,
  LOOKOUT_AREA, LOOKOUT_VIEW_SPOT,
} from "../data/snow/snowLayout.js";

// The five late snow challenges (VG/PC/IC/LY/AL) share one camera treatment:
// park at a viewing spot, front-on locked view of their area. Resolved as a
// single priority-picked mode; per-mode framing lives here.
//   spot  where the player parks · look  the camera's look-at point ·
//   fit   half-width the frame must fit · lift  camera-height factor
const LATE_SNOW_VIEW = {
  village: { spot: VILLAGE_VIEW_SPOT, look: [VILLAGE_BUILD_SITE[0], 1.5, VILLAGE_BUILD_SITE[1] + 1.2], fit: 9.0, base: 2.6 },
  colony: { spot: COLONY_VIEW_SPOT, look: [COLONY_AREA.x, 1.1, COLONY_AREA.z - 1.4], fit: 9.5, base: 2.4 },
  cave: { spot: CAVE_VIEW_SPOT, look: [CAVE_AREA.x, 1.3, CAVE_AREA.z - 4.0], fit: 8.5, base: 2.4 },
  yard: { spot: YARD_VIEW_SPOT, look: [YARD_AREA.x + 1.2, 2.0, YARD_AREA.z - 2.0], fit: 8.5, base: 2.8 },
  lights: { spot: LOOKOUT_VIEW_SPOT, look: [LOOKOUT_AREA.x, 4.6, LOOKOUT_AREA.z - 6.0], fit: 10.5, base: 3.4 },
};

// Short decaying camera wobble for wrong answers (triggered by the challenge
// panels via playerState.camShake = { start, dur }).
function applyCamShake(camera) {
  const sh = playerState.camShake;
  if (!sh) return;
  const age = Date.now() - sh.start;
  if (age >= sh.dur) {
    playerState.camShake = null;
    return;
  }
  const amp = 0.28 * (1 - age / sh.dur);
  camera.position.x += Math.sin(age * 0.09) * amp;
  camera.position.y += Math.cos(age * 0.13) * amp * 0.6;
}

const MOVE_SPEED = 7; // units per second (a touch faster for the bigger map)
const RUN_MULTIPLIER = 2; // hold Shift to run

// Third-person camera placement, expressed as a distance + height "behind"
// the player. The "behind" direction is rotated by `camYaw` (Z/X controls).
// Lowered angle (W6): ~20° above the horizon (was ~33°) so more of the world is
// visible toward the horizon. Slightly further back to keep the player framed.
const CAMERA_DISTANCE = 12;
const CAMERA_HEIGHT = 4.5;
const ROTATE_SPEED = 1.8; // radians per second while Z or X is held

// Jump (small + game-friendly). Gravity integrates a vertical velocity; the
// player can only jump again after landing (no flying / infinite jumps). Apex
// ≈ v²/2g ≈ 1.3, enough to hop straight up the 1.1-high plateau edge.
const JUMP_VELOCITY = 7.2; // initial upward speed
const GRAVITY = 20; // downward acceleration
// A jump is a projectile: the horizontal launch velocity is locked in at
// take-off and can't be steered mid-air. A jump from a STANDSTILL still leaps
// forward (the animation is a forward vault) — this is that hop's speed. The
// jump clip's Hips travel is ~3.8 world units over the arc, so 5 u/s × ~0.72 s
// airtime ≈ 3.6 units matches the animation's leap and lands cleanly. (The
// snap-back is fixed at the source — the clip now animates in place; see
// PlayerCharacter.jsx — so this value only sets how far the hop carries.)
const JUMP_FORWARD_HOP = 5; // units/second, forward hop for a standing jump

// Camera Lock: how quickly the camera eases behind the movement direction.
const CAM_FOLLOW = 3.0;

// Slippery ice (the Snowball Sums rink): on the ice, input steers a PERSISTENT
// velocity instead of driving displacement directly — so the player skates with
// momentum and glides to a stop. Lower grip = slipperier.
const ICE_GRIP = 1.5; // s⁻¹ — how quickly input takes hold (and glide decays)
const ICE_STOP_SPEED = 0.06; // below this the glide is considered stopped

// Fence Challenge camera mode (F2 feedback): while the challenge runs, the
// camera glides to a fixed SIDE-ON view that frames the WHOLE fence (a giant
// physical number line), and the player walks LEFT/RIGHT only along a line
// just in front of it. The walk-line offset south of the fence:
const FENCE_WALK_OFFSET = 2.4;
const FENCE_CAM_MIN = 20; // never closer than this
const FENCE_CAM_MAX = 50; // never further (fog starts at 55)

// Round-Up camera mode (F3 feedback): while the herding challenge runs, the
// camera glides to a raised vantage SOUTH-EAST of the herd field + pen,
// looking DOWN at ~45° so the whole herd is visible at once. The player
// still walks normally (WASD/arrows/tap) — the movement basis is aligned to
// the locked view so the controls stay intuitive.
const ROUNDUP_CAM_YAW = Math.PI / 4; // camera sits to the SE (+x, +z)
const ROUNDUP_CAM_MIN = 26; // zoomed out enough to always see the whole herd
const ROUNDUP_CAM_MAX = 50;
// Centre of everything the view must contain (field + pen), from the layout.
const RU_LOOK_X = (Math.min(ROUNDUP_FIELD.x1, ROUNDUP_PEN.x - ROUNDUP_PEN.w / 2) +
  Math.max(ROUNDUP_FIELD.x2, ROUNDUP_PEN.x + ROUNDUP_PEN.w / 2)) / 2;
const RU_LOOK_Z = ((ROUNDUP_PEN.z - ROUNDUP_PEN.d / 2) + ROUNDUP_FIELD.z2) / 2;

// Order-the-Parts camera mode (F4): a close, front-on view of the carrot row
// (this challenge is tap-only, so the player parks at the viewing spot).
const ORDER_CAM_MIN = 11;
const ORDER_CAM_MAX = 30;

// Crate Packing camera mode (F6): a STEEP (~48° down), close view of the
// staging area so the fruit + crate sockets read large and nothing occludes
// the groups/leftovers (teacher feedback). Camera pulls back to the SOUTH.
const CRATE_CAM_MIN = 10;
const CRATE_CAM_MAX = 26;
const CRATE_LOOK_Z_OFFSET = -0.5; // centre piles + row + the big count chips

// Locked-gate/boundary hint: show when within this distance of a hinted
// collider, and keep it on screen for this long after the last near-contact.
const HINT_RANGE = 2.6;
const HINT_LINGER = 3000; // ms (≥3s, per Phase 2H-D)

// Lerp between two angles along the shortest path (radians).
function lerpAngle(a, b, t) {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

export const CAMERA_DISTANCE_VALUE = CAMERA_DISTANCE; // re-export for DevPanel

/**
 * The student's controllable character.
 *
 * Responsibilities:
 *   - read the keyboard each frame and move the character
 *   - keep the character on the island
 *   - publish its position to playerState (so interactables can measure distance)
 *   - drive a third-person camera that follows AND can orbit around the player
 *
 * Camera orbit (Mario-64 / Lakitu style): holding Z rotates the camera left
 * around the player, X rotates right. Movement is CAMERA-RELATIVE, so "forward"
 * always means "away from the camera, into the screen" no matter which way the
 * camera is facing — keeping the controls feeling natural after rotating.
 */
export default function Player() {
  const group = useRef();
  const keys = useKeyboard();
  const { camera } = useThree();

  const profile = useProgress((s) => s.profile);
  const activeEncounterId = useSession((s) => s.activeEncounterId);
  const cameraLock = useUI((s) => s.cameraLock);
  const fpv = useUI((s) => s.fpv);

  // Colliders depend on unlock-affecting progress AND the active region → rebuild
  // only when those change (not every frame).
  const completedMissions = useProgress((s) => s.completedMissions);
  const earnedBadges = useProgress((s) => s.earnedBadges);
  const completedEncounters = useProgress((s) => s.completedEncounters);
  const currentRegionId = useSession((s) => s.currentRegionId);
  const colliders = useMemo(
    () => getColliders({ completedMissions, earnedBadges, completedEncounters }, currentRegionId),
    [completedMissions, earnedBadges, completedEncounters, currentRegionId]
  );

  // Camera yaw (radians). 0 = camera directly behind the player on +Z.
  const camYaw = useRef(0);

  // Reusable temp vectors (avoid allocating inside the frame loop).
  const move = useRef(new THREE.Vector3());
  const camTarget = useRef(new THREE.Vector3());

  // Vertical jump state.
  const vy = useRef(0); // vertical velocity
  const grounded = useRef(true); // on the ground (can jump)
  const jumpHeld = useRef(false); // edge-detect so holding Shift doesn't re-jump
  const jumpVel = useRef({ x: 0, z: 0 }); // horizontal launch velocity, locked while airborne
  const lastTravel = useRef(0); // cooldown so a portal doesn't re-trigger instantly
  const stuckFrames = useRef(0); // tap-to-move: abandon a target we can't reach
  const fpvYaw = useRef(0); // first-person look yaw
  const fpvPitch = useRef(0); // first-person look pitch
  const fpvInit = useRef(false); // seed the look direction on entering FPV
  const camLook = useRef(new THREE.Vector3()); // lerped look-at point (locked modes)
  const lockedPrev = useRef(false); // seed camLook on entering a locked camera mode
  const iceVel = useRef({ x: 0, z: 0 }); // persistent skate velocity on the rink ice

  useFrame((_, delta) => {
    if (!group.current) return;

    // Teleport request (Return to Hub / DevPanel) — snap and clear.
    if (playerState.teleport) {
      group.current.position.x = playerState.teleport.x;
      group.current.position.z = playerState.teleport.z;
      group.current.position.y = 0;
      vy.current = 0;
      grounded.current = true;
      playerState.teleport = null;
    }

    // Active region: its bounds clamp the player and its own ground function (the
    // Schoolyard's tiers/stairs) drives height, else island-1's plateau/stairs.
    const region = getRegion(useSession.getState().currentRegionId);
    const groundAt = (x, z) => (region.groundHeight ? region.groundHeight(x, z) : groundHeightAt(x, z));

    const k = keys.current;
    // Freeze locomotion while an encounter modal is open OR in first-person look
    // mode (in FPV the arrow/WASD keys steer the camera instead of the player).
    const frozen = Boolean(activeEncounterId) || fpv;

    // Fence Challenge mode (F2): fixed side-on camera + left/right-only walking
    // along the fence. Active for the whole challenge (placing → done).
    const fenceMode =
      region.id === "farm-parts-whole" && useFarmChallenge.getState().status !== "idle";

    // Round-Up mode (F3): raised ~45° camera over the herd field; walking
    // stays free. (The farm challenges are mutually exclusive.)
    const roundUpMode =
      !fenceMode && region.id === "farm-parts-whole" && useRoundUp.getState().status !== "idle";

    // Order-the-Parts mode (F4): front-on garden camera; the puzzle is
    // tap-only, so the player just parks at the viewing spot.
    const orderMode =
      !fenceMode && !roundUpMode && region.id === "farm-parts-whole" &&
      useOrderParts.getState().status !== "idle";

    // Crate Packing mode (F6): front-on barn-yard camera; tap-only.
    const crateMode =
      !fenceMode && !roundUpMode && !orderMode && region.id === "farm-parts-whole" &&
      useCratePacking.getState().status !== "idle";

    // Milk Splitter mode (F8): front-on dairy-corner camera; tap-only.
    const milkMode =
      !fenceMode && !roundUpMode && !orderMode && !crateMode &&
      region.id === "farm-parts-whole" && useMilkSplitter.getState().status !== "idle";

    // Weigh Station mode (F9): front-on NE-corner camera; tap-only.
    const weighMode =
      !fenceMode && !roundUpMode && !orderMode && !crateMode && !milkMode &&
      region.id === "farm-parts-whole" && useWeighStation.getState().status !== "idle";

    // Trading Post mode (F10): front-on eastern-stalls camera; tap-only.
    const tradeMode =
      !fenceMode && !roundUpMode && !orderMode && !crateMode && !milkMode && !weighMode &&
      region.id === "farm-parts-whole" && useTradingPost.getState().status !== "idle";

    // Veggie Plot mode (F11): front-on camera on the paddock bed; drag/tap-only.
    const veggieMode =
      !fenceMode && !roundUpMode && !orderMode && !crateMode && !milkMode && !weighMode && !tradeMode &&
      region.id === "farm-parts-whole" && useVeggiePlot.getState().status !== "idle";

    // Plank the Gap mode (F12): front-on camera on the fence gap; tap-only.
    const plankMode =
      !fenceMode && !roundUpMode && !orderMode && !crateMode && !milkMode && !weighMode && !tradeMode && !veggieMode &&
      region.id === "farm-parts-whole" && usePlankGap.getState().status !== "idle";

    // Farm Shop mode (F13): front-on camera on the market stall; typed answers.
    const shopMode =
      !fenceMode && !roundUpMode && !orderMode && !crateMode && !milkMode && !weighMode && !tradeMode && !veggieMode && !plankMode &&
      region.id === "farm-parts-whole" && useFarmShop.getState().status !== "idle";

    // Snowball Range mode (SR): front-on camera on the ten-frame crate in the
    // snow world; tap/type-only (its own region, so no farm-mode overlap).
    const rangeMode = region.id === "snow-sums" && useSnowballRange.getState().status !== "idle";

    // Ice Rink glide mode (RG): side-on camera framing the whole rink number
    // line; the plan is button/tap-only, so the player parks off to the side.
    const rinkGlideMode =
      !rangeMode && region.id === "snow-sums" && useRinkGlide.getState().status !== "idle";

    // Christmas Tree Grove mode (GV): front-on camera on the big light-up
    // tree; button/type-only, so the player parks at the viewing spot.
    const groveMode =
      !rangeMode && !rinkGlideMode && region.id === "snow-sums" &&
      useGroveLights.getState().status !== "idle";

    // Snowman Meadow mode (ML): front-on camera on the two snowman towers;
    // button/type-only, so the player parks at the viewing spot.
    const meadowMode =
      !rangeMode && !rinkGlideMode && !groveMode && region.id === "snow-sums" &&
      useMeadowLevel.getState().status !== "idle";

    // Sledding Slope mode (SL): side-on camera on the hill's number window;
    // button/type-only, so the player parks at the viewing spot.
    const sledMode =
      !rangeMode && !rinkGlideMode && !groveMode && !meadowMode &&
      region.id === "snow-sums" && useSledSlope.getState().status !== "idle";

    // The five late snow challenges (VG/PC/IC/LY/AL) — one priority pick.
    const lateSnowMode =
      region.id === "snow-sums" && !rangeMode && !rinkGlideMode && !groveMode && !meadowMode && !sledMode
        ? useVillageSplit.getState().status !== "idle"
          ? "village"
          : useColonyPairs.getState().status !== "idle"
            ? "colony"
            : useCaveCrystals.getState().status !== "idle"
              ? "cave"
              : useLodgeYard.getState().status !== "idle"
                ? "yard"
                : useAuroraLookout.getState().status !== "idle"
                  ? "lights"
                  : null
        : null;

    // --- Camera orbit (Z / X, or the on-screen rotate buttons) ---
    // (disabled in the locked challenge views)
    if (!frozen && !fenceMode && !roundUpMode && !orderMode && !crateMode && !milkMode && !weighMode && !tradeMode && !veggieMode && !plankMode && !shopMode && !rangeMode && !rinkGlideMode && !groveMode && !meadowMode && !sledMode && !lateSnowMode) {
      if (k.rotateLeft || touchInput.rotateLeft) camYaw.current -= ROTATE_SPEED * delta;
      if (k.rotateRight || touchInput.rotateRight) camYaw.current += ROTATE_SPEED * delta;
    }
    // Align the movement basis with the locked Round-Up view so WASD/arrows
    // keep matching the screen while (and after) the camera glides over.
    if (roundUpMode) {
      camYaw.current = lerpAngle(camYaw.current, ROUNDUP_CAM_YAW, 1 - Math.exp(-3 * delta));
    }
    const yaw = camYaw.current;
    const sin = Math.sin(yaw);
    const cos = Math.cos(yaw);

    // Camera-relative basis on the ground plane.
    //   forward = from camera toward player ("into the screen")
    //   right   = screen-right
    // At yaw = 0 these are (0,-1) and (1,0), matching the original layout.
    const forward = { x: -sin, z: -cos };
    const right = { x: cos, z: -sin };

    // --- Movement (camera-relative; fence mode = world left/right only;
    // order/crate/milk modes = tap-only, no locomotion) ---
    move.current.set(0, 0, 0);
    if (!frozen && !orderMode && !crateMode && !milkMode && !weighMode && !tradeMode && !veggieMode && !plankMode && !shopMode && !rangeMode && !rinkGlideMode && !groveMode && !meadowMode && !sledMode && !lateSnowMode) {
      if (fenceMode) {
        // Left/right arrows (or A/D, or the on-screen rotate buttons) slide
        // the player along the fence in WORLD x — screen-left is west (red
        // post), screen-right is east (blue post) in the locked view.
        const dx =
          (k.right ? 1 : 0) - (k.left ? 1 : 0) +
          (touchInput.rotateRight ? 1 : 0) - (touchInput.rotateLeft ? 1 : 0);
        move.current.x = dx;
        move.current.z = 0;
      } else {
        const fwd = (k.forward ? 1 : 0) - (k.backward ? 1 : 0);
        const strafe = (k.right ? 1 : 0) - (k.left ? 1 : 0);
        move.current.x = forward.x * fwd + right.x * strafe;
        move.current.z = forward.z * fwd + right.z * strafe;
      }
    }

    const pos = group.current.position;
    const prevX = pos.x;
    const prevZ = pos.z;

    // Tap-to-move (W4): when the keyboard isn't driving movement, steer toward the
    // tapped destination (playerState.moveTarget). Keyboard input always wins and
    // cancels the target, so touch + WASD coexist on hybrid devices.
    const ARRIVE = 0.35; // stop this close to the destination
    if (move.current.lengthSq() > 0) {
      if (playerState.moveTarget) clearMoveTarget(); // keyboard cancels tap + approach
      stuckFrames.current = 0;
    } else if (playerState.moveTarget && !frozen) {
      const tx = playerState.moveTarget.x - prevX;
      const tz = playerState.moveTarget.z - prevZ;
      if (Math.hypot(tx, tz) <= ARRIVE) {
        playerState.moveTarget = null; // arrived (approachId left for the UI)
        stuckFrames.current = 0;
      } else {
        move.current.set(tx, 0, tz); // the block below normalises + steps
      }
    }

    // Hold Shift to RUN (2× speed + the run animation).
    const running = Boolean(k.run) && !frozen;

    // Slippery ice (Snowball Sums rink): while ON the ice, input steers a
    // persistent velocity (momentum + glide) rather than setting displacement
    // directly. Off the ice the velocity just mirrors the input, so stepping
    // onto the rink carries the walk/run speed in and gliding feels seamless.
    const onIce = region.id === "snow-sums" && isOnIce(prevX, prevZ);
    const hasInput = move.current.lengthSq() > 0;
    if (hasInput) move.current.normalize();
    const targetSpeed = MOVE_SPEED * (running ? RUN_MULTIPLIER : 1);
    if (onIce) {
      const grip = 1 - Math.exp(-ICE_GRIP * delta);
      iceVel.current.x += (move.current.x * targetSpeed - iceVel.current.x) * grip;
      iceVel.current.z += (move.current.z * targetSpeed - iceVel.current.z) * grip;
    } else {
      iceVel.current.x = move.current.x * targetSpeed;
      iceVel.current.z = move.current.z * targetSpeed;
    }
    const glideSpeed = Math.hypot(iceVel.current.x, iceVel.current.z);
    const gliding = !frozen && !hasInput && onIce && glideSpeed > ICE_STOP_SPEED;

    // Horizontal locomotion. GROUNDED → live input (or ice glide) drives it.
    // AIRBORNE → the launch velocity locked in at take-off drives it and live
    // input is IGNORED, so a jump follows a fixed arc (no mid-air steering) and
    // lands wherever its trajectory carries it — like a real leap.
    const airborne = !grounded.current;
    const hv = airborne ? jumpVel.current : iceVel.current;
    const hvLen = Math.hypot(hv.x, hv.z);
    const applyHoriz = airborne ? (!frozen && hvLen > 1e-6) : (hasInput || gliding);
    if (applyHoriz) {
      const steeringToTarget = !airborne && Boolean(playerState.moveTarget) && !k.forward && !k.backward && !k.left && !k.right;
      // Facing/camera direction follows the ACTUAL velocity (input direction off
      // the ice, skate direction on it, launch direction in the air).
      const vLen = Math.max(hvLen, 1e-6);
      const dirX = hv.x / vLen;
      const dirZ = hv.z / vLen;
      move.current.set(hv.x * delta, 0, hv.z * delta);

      // Camera Lock: ease the camera to sit BEHIND the movement direction
      // (Option A: Z/X still nudges, then movement gently pulls it back).
      // Skip while airborne — the jump direction is fixed, so leave the camera be.
      if (!airborne && cameraLock && !frozen && !fenceMode && !roundUpMode) {
        const desiredYaw = Math.atan2(-dirX, -dirZ);
        camYaw.current = lerpAngle(camYaw.current, desiredYaw, 1 - Math.exp(-CAM_FOLLOW * delta));
      }

      let nx = prevX + move.current.x;
      let nz = prevZ + move.current.z;

      // Keep the player within the ACTIVE region's walkable bounds (a circle for
      // island-1, a rectangle for the Schoolyard).
      const clamped = clampToBounds(nx, nz, region.bounds);
      nx = clamped.x;
      nz = clamped.z;

      // Solid-object collision: push out of any collider (slides naturally).
      // While AIRBORNE (mid-jump, y > ~0.9), drop `jumpable` colliders so Space
      // vaults paddock / challenge fences — border fences stay non-jumpable.
      const activeColliders = pos.y > 0.9 ? colliders.filter((c) => !c.jumpable) : colliders;
      const res = resolveCircle(nx, nz, activeColliders, PLAYER_RADIUS);
      nx = res.x;
      nz = res.z;

      // Ground "walls": can't walk UP a surface taller than STEP_UP above the
      // current height (plateau side / final stair). Slide along it per-axis.
      if (groundAt(nx, nz) > pos.y + STEP_UP) {
        if (groundAt(nx, prevZ) <= pos.y + STEP_UP) nz = prevZ;
        else if (groundAt(prevX, nz) <= pos.y + STEP_UP) nx = prevX;
        else { nx = prevX; nz = prevZ; }
      }

      // Hitting a wall mid-air kills the horizontal launch velocity, so the jump
      // drops straight down against the obstacle instead of hugging it.
      if (airborne && Math.hypot(nx - prevX, nz - prevZ) < 0.004) {
        jumpVel.current.x = 0;
        jumpVel.current.z = 0;
      }

      pos.x = nx;
      pos.z = nz;
      // Face the travel direction while grounded; keep the take-off facing in the
      // air (you can't twist to a new heading mid-jump).
      if (!airborne) group.current.rotation.y = Math.atan2(move.current.x, move.current.z);

      // Tap-to-move safety valve: if we're steering to a target but a collider /
      // boundary is stopping us making progress, abandon the target so we don't
      // shuffle in place forever (e.g. the tap landed inside a wall).
      if (steeringToTarget) {
        if (Math.hypot(pos.x - prevX, pos.z - prevZ) < 0.004) {
          if (++stuckFrames.current > 12) { clearMoveTarget(); stuckFrames.current = 0; }
        } else {
          stuckFrames.current = 0;
        }
      }
    }

    // --- JUMP TRAVEL ------------------------------------------------------
    // Horizontal jump travel is now CODE-OWNED via `jumpVel` (locked at
    // take-off, integrated in the locomotion block above), so a jump is a
    // predictable projectile that never slides back. PlayerCharacter still
    // strips the leap out of the jump CLIP so it animates IN PLACE (no visual
    // snap when the clip ends) — but we deliberately DON'T re-apply that
    // animation step to the position here, or the character would travel twice.
    playerState.jumpRootStep = null; // drained so it can't accumulate

    // Fence mode: smoothly WALK the player into position — ease them onto the
    // walk line just in front of the fence, and keep them between the posts
    // (a little beyond each end so the end posts are still reachable).
    if (fenceMode && !frozen) {
      pos.x = Math.max(CHALLENGE_FENCE.x1 - 1.5, Math.min(CHALLENGE_FENCE.x2 + 1.5, pos.x));
      const walkZ = CHALLENGE_FENCE.z + FENCE_WALK_OFFSET;
      const dz = walkZ - pos.z;
      if (Math.abs(dz) > 0.02) {
        const step = Math.min(Math.abs(dz), MOVE_SPEED * 0.8 * delta);
        pos.z += Math.sign(dz) * step;
        // Face the walk-in direction (unless the player is already sliding
        // left/right, in which case the move block set the facing).
        if (Math.abs(dz) > 0.4 && !k.left && !k.right) {
          group.current.rotation.y = Math.atan2(0, Math.sign(dz));
        }
      }
    }

    // Order/crate/milk modes: smoothly park the player at the viewing spot
    // (the challenges are tap-only) and ignore stray tap-to-move targets.
    if ((orderMode || crateMode || milkMode || weighMode || tradeMode || veggieMode || plankMode || shopMode || rangeMode || rinkGlideMode || groveMode || meadowMode || sledMode || lateSnowMode) && !frozen) {
      if (playerState.moveTarget) clearMoveTarget();
      const spot = lateSnowMode ? LATE_SNOW_VIEW[lateSnowMode].spot : rangeMode ? RANGE_VIEW_SPOT : rinkGlideMode ? RINK_GLIDE_VIEW_SPOT : groveMode ? GROVE_VIEW_SPOT : meadowMode ? MEADOW_VIEW_SPOT : sledMode ? SLOPE_VIEW_SPOT : orderMode ? ORDER_VIEW_SPOT : crateMode ? CRATE_VIEW_SPOT : milkMode ? MILK_VIEW_SPOT : weighMode ? WEIGH_VIEW_SPOT : tradeMode ? TRADE_VIEW_SPOT : veggieMode ? VEGGIE_VIEW_SPOT : plankMode ? PLANK_VIEW_SPOT : SHOP_VIEW_SPOT;
      const odx = spot[0] - pos.x;
      const odz = spot[1] - pos.z;
      const od = Math.hypot(odx, odz);
      if (od > 0.05) {
        const step = Math.min(od, MOVE_SPEED * 0.8 * delta);
        pos.x += (odx / od) * step;
        pos.z += (odz / od) * step;
        group.current.rotation.y = Math.atan2(odx, odz);
      } else if (orderMode) {
        group.current.rotation.y = Math.PI; // face the garden (north)
      } else if (crateMode) {
        // Crate mode parks off to the side — face the staging area itself.
        group.current.rotation.y = Math.atan2(CRATE_AREA.x - pos.x, CRATE_AREA.z - pos.z);
      } else if (milkMode) {
        group.current.rotation.y = Math.atan2(MILK_AREA.x - pos.x, MILK_AREA.z - pos.z);
      } else if (weighMode) {
        group.current.rotation.y = Math.atan2(WEIGH_AREA.x - pos.x, WEIGH_AREA.z - pos.z);
      } else if (tradeMode) {
        group.current.rotation.y = Math.atan2(TRADE_AREA.x - pos.x, TRADE_AREA.z - pos.z);
      } else if (veggieMode) {
        group.current.rotation.y = Math.atan2(VEGGIE_AREA.x - pos.x, VEGGIE_AREA.z - pos.z);
      } else if (plankMode) {
        group.current.rotation.y = Math.atan2(PLANK_AREA.x - pos.x, PLANK_AREA.z - pos.z);
      } else if (rangeMode) {
        group.current.rotation.y = Math.atan2(RANGE_AREA.x - pos.x, RANGE_AREA.z - pos.z);
      } else if (rinkGlideMode) {
        // Face the middle of the rink number line.
        const lineMidX = (RINK_GLIDE_LINE.xMin + RINK_GLIDE_LINE.xMax) / 2;
        group.current.rotation.y = Math.atan2(lineMidX - pos.x, RINK_GLIDE_LINE.z - pos.z);
      } else if (groveMode) {
        group.current.rotation.y = Math.atan2(GROVE_TREE_POS[0] - pos.x, GROVE_TREE_POS[1] - pos.z);
      } else if (meadowMode) {
        const towersMidX = (MEADOW_TOWER_LEFT[0] + MEADOW_TOWER_RIGHT[0]) / 2;
        group.current.rotation.y = Math.atan2(towersMidX - pos.x, MEADOW_TOWER_LEFT[1] - pos.z);
      } else if (sledMode) {
        const laneMidX = (SLOPE_LANE.xTop + SLOPE_LANE.xBottom) / 2;
        group.current.rotation.y = Math.atan2(laneMidX - pos.x, SLOPE_LANE.z - pos.z);
      } else if (lateSnowMode) {
        const lk = LATE_SNOW_VIEW[lateSnowMode].look;
        group.current.rotation.y = Math.atan2(lk[0] - pos.x, lk[2] - pos.z);
      } else {
        group.current.rotation.y = Math.atan2(SHOP_AREA.x - pos.x, SHOP_AREA.z - pos.z);
      }
    }

    // Persistent locked-gate / boundary hint: while the player is NEAR a hinted
    // (locked) collider, refresh the hint + its 3s expiry. The prompt UI polls
    // playerState and keeps it visible until the expiry passes — so it lingers
    // after the player stops, instead of vanishing the moment movement ends.
    let bestHint = null;
    let bestD = Infinity;
    for (const c of colliders) {
      if (!c.hint) continue;
      const d = Math.hypot(pos.x - c.x, pos.z - c.z) - c.radius;
      if (d < bestD) { bestD = d; bestHint = c.hint; }
    }
    if (bestHint && bestD <= HINT_RANGE) {
      playerState.blockedHint = bestHint;
      playerState.blockedExpiry = Date.now() + HINT_LINGER;
    }

    // --- Jump (Shift or the on-screen Jump button): edge-triggered + only when
    // grounded → no flying. ---
    const jumpPressed = k.jump || touchInput.jump;
    if (!frozen && !fenceMode && !orderMode && !crateMode && !milkMode && !weighMode && !tradeMode && !veggieMode && !plankMode && !shopMode && !rangeMode && !rinkGlideMode && !groveMode && !meadowMode && !sledMode && !lateSnowMode) {
      if (jumpPressed && !jumpHeld.current && grounded.current) {
        vy.current = JUMP_VELOCITY;
        grounded.current = false;
        // Lock the horizontal launch velocity for the whole arc (no steering).
        // Moving at take-off → carry that momentum forward; standing → a hop in
        // the facing direction, so a solo jump still leaps ahead and lands there.
        if (hasInput) {
          jumpVel.current.x = iceVel.current.x;
          jumpVel.current.z = iceVel.current.z;
        } else {
          const yaw = group.current.rotation.y;
          jumpVel.current.x = Math.sin(yaw) * JUMP_FORWARD_HOP;
          jumpVel.current.z = Math.cos(yaw) * JUMP_FORWARD_HOP;
        }
      }
      jumpHeld.current = jumpPressed;
    } else {
      jumpHeld.current = false;
    }

    // --- Verticality: follow the ground height; fall off ledges; land after a
    // jump. The walkable surface comes from groundHeightAt (plateau + stairs). ---
    const ground = groundAt(pos.x, pos.z);
    if (grounded.current) {
      if (ground >= pos.y - STEP_DOWN) {
        pos.y = ground; // walk up small steps / stay / step down smoothly
      } else {
        grounded.current = false; // walked off a ledge → start falling
        vy.current = 0;
        // Carry current horizontal momentum off the edge (projectile — but no
        // steering once airborne), matching the locked-arc jump behaviour.
        jumpVel.current.x = iceVel.current.x;
        jumpVel.current.z = iceVel.current.z;
      }
    }
    if (!grounded.current) {
      vy.current -= GRAVITY * delta;
      pos.y += vy.current * delta;
      if (pos.y <= ground) {
        pos.y = ground;
        vy.current = 0;
        grounded.current = true;
        jumpVel.current.x = 0; // landed → clear the locked launch velocity
        jumpVel.current.z = 0;
      }
    }

    // Publish position for proximity checks (non-reactive shared object).
    playerState.x = pos.x;
    playerState.y = pos.y;
    playerState.z = pos.z;
    playerState.camYaw = camYaw.current;
    // The model's yaw — PlayerCharacter rotates the jump's root motion by it.
    if (group.current) playerState.facing = group.current.rotation.y;

    // Animation mode for the rigged player model (PlayerCharacter.jsx):
    // airborne → jump; actually moving this frame → run/walk; else idle.
    // (Displacement covers keyboard, tap-to-move AND the auto walk-ins.)
    const movedThisFrame = Math.hypot(pos.x - prevX, pos.z - prevZ) > 0.004;
    playerState.animMode = !grounded.current
      ? "jump"
      : movedThisFrame
        ? (running ? "run" : "walk")
        : "idle";

    // Teleport Gates: stepping into a portal travels to its target region (with a
    // short cooldown so arriving next to one can't bounce you straight back).
    if (!frozen) {
      for (const portal of region.portals || []) {
        if (Math.hypot(pos.x - portal.position[0], pos.z - portal.position[1]) <= portal.radius) {
          // Locked gate: the Retrieval Practice Playground stays shut until Pip,
          // Fern and Alby have each been passed with at least 80%. Stepping onto
          // it just shows the hint (BlockedGatePrompt) instead of travelling.
          if (portal.lock === "playground" && !isPlaygroundUnlocked(useResults.getState().results)) {
            playerState.blockedHint = "Score at least 80% with Pip, Fern and Alby to open this gate.";
            playerState.blockedExpiry = Date.now() + HINT_LINGER;
            break;
          }
          if (Date.now() - lastTravel.current > 1200) {
            lastTravel.current = Date.now();
            useSession.getState().setRegion(portal.target);
            // Door-to-door travel (CB): land AT the matching doorway rather
            // than the region spawn (overrides setRegion's spawn teleport).
            if (portal.arrive) {
              playerState.teleport = { x: portal.arrive[0], z: portal.arrive[1] };
            }
          }
          break;
        }
      }
    }

    const p = group.current.position;

    if (fpv) {
      // --- First-person look (W6): camera at the eyes; arrows/WASD pan the view.
      if (!fpvInit.current) { fpvYaw.current = group.current.rotation.y; fpvPitch.current = 0; fpvInit.current = true; }
      const LOOK = 1.7 * delta;
      if (k.left) fpvYaw.current += LOOK;
      if (k.right) fpvYaw.current -= LOOK;
      if (k.forward) fpvPitch.current = Math.min(1.2, fpvPitch.current + LOOK);
      if (k.backward) fpvPitch.current = Math.max(-1.0, fpvPitch.current - LOOK);
      const eyeY = p.y + 1.7;
      camera.position.set(p.x, eyeY, p.z);
      const cp = Math.cos(fpvPitch.current);
      camTarget.current.set(
        p.x + Math.sin(fpvYaw.current) * cp,
        eyeY + Math.sin(fpvPitch.current),
        p.z + Math.cos(fpvYaw.current) * cp
      );
      camera.lookAt(camTarget.current);
    } else if (fenceMode) {
      fpvInit.current = false;
      // --- Fence Challenge camera (F2): a fixed, slightly elevated SIDE-ON
      // view framing the WHOLE fence. Distance is computed from the camera's
      // real fov/aspect so both end posts are always on screen (capped inside
      // the fog). Position AND look-at both ease in → a smooth glide. ---
      const midX = (CHALLENGE_FENCE.x1 + CHALLENGE_FENCE.x2) / 2;
      const halfW = Math.tan((camera.fov * Math.PI) / 360) * camera.aspect;
      const dist = Math.min(FENCE_CAM_MAX, Math.max(FENCE_CAM_MIN, (CHALLENGE_FENCE_LENGTH / 2 + 5) / halfW));
      if (!lockedPrev.current) camLook.current.set(p.x, p.y + 1, p.z); // seed from the player
      camTarget.current.set(midX, 5 + dist * 0.22, CHALLENGE_FENCE.z + dist);
      camera.position.lerp(camTarget.current, 1 - Math.pow(0.01, delta));
      camLook.current.lerp({ x: midX, y: 1.0, z: CHALLENGE_FENCE.z }, 1 - Math.pow(0.01, delta));
      camera.lookAt(camLook.current);
    } else if (roundUpMode) {
      fpvInit.current = false;
      // --- Round-Up camera (F3): raised SE vantage looking down ~45° at the
      // whole herd field + sorting pen. Distance from live fov/aspect so
      // every cow fits; position + look-at both ease in (smooth glide). ---
      const halfW = Math.tan((camera.fov * Math.PI) / 360) * camera.aspect;
      const dist = Math.min(ROUNDUP_CAM_MAX, Math.max(ROUNDUP_CAM_MIN, 15 / halfW));
      if (!lockedPrev.current) camLook.current.set(p.x, p.y + 1, p.z); // seed from the player
      // 45° down from the SE: horizontal offset (0.5·d, 0.5·d), height 0.707·d.
      camTarget.current.set(RU_LOOK_X + dist * 0.5, dist * 0.707, RU_LOOK_Z + dist * 0.5);
      camera.position.lerp(camTarget.current, 1 - Math.pow(0.01, delta));
      camLook.current.lerp({ x: RU_LOOK_X, y: 0, z: RU_LOOK_Z }, 1 - Math.pow(0.01, delta));
      camera.lookAt(camLook.current);
    } else if (orderMode) {
      fpvInit.current = false;
      // --- Order-the-Parts camera (F4): close, front-on view of the carrot
      // row so the value chips are easy to read + tap. ---
      const halfW = Math.tan((camera.fov * Math.PI) / 360) * camera.aspect;
      const dist = Math.min(ORDER_CAM_MAX, Math.max(ORDER_CAM_MIN, 7.5 / halfW));
      if (!lockedPrev.current) camLook.current.set(p.x, p.y + 1, p.z);
      camTarget.current.set(ORDER_GARDEN.x, 3.2 + dist * 0.28, ORDER_GARDEN.z + dist);
      camera.position.lerp(camTarget.current, 1 - Math.pow(0.01, delta));
      camLook.current.lerp({ x: ORDER_GARDEN.x, y: 0.9, z: ORDER_GARDEN.z }, 1 - Math.pow(0.01, delta));
      camera.lookAt(camLook.current);
    } else if (crateMode) {
      fpvInit.current = false;
      // --- Crate Packing camera (F6): steep top-down-ish view (~48°) close
      // over the staging area, so fruit/sockets/groups read LARGE. ---
      const halfW = Math.tan((camera.fov * Math.PI) / 360) * camera.aspect;
      const dist = Math.min(CRATE_CAM_MAX, Math.max(CRATE_CAM_MIN, 7.0 / halfW));
      const lookZ = (CRATE_AREA.z + CRATE_ROW.z) / 2 + CRATE_LOOK_Z_OFFSET;
      if (!lockedPrev.current) camLook.current.set(p.x, p.y + 1, p.z);
      camTarget.current.set(CRATE_AREA.x, dist * 0.78, lookZ + dist * 0.7);
      camera.position.lerp(camTarget.current, 1 - Math.pow(0.01, delta));
      camLook.current.lerp({ x: CRATE_AREA.x, y: 0, z: lookZ }, 1 - Math.pow(0.01, delta));
      camera.lookAt(camLook.current);
      applyCamShake(camera); // wrong-answer wobble (CratePackingPanel)
    } else if (milkMode) {
      fpvInit.current = false;
      // --- Milk Splitter camera (F8): front-on view of the machine, its
      // chutes and the notation jugs in the dairy corner. ---
      const halfW = Math.tan((camera.fov * Math.PI) / 360) * camera.aspect;
      const dist = Math.min(28, Math.max(11, 8.0 / halfW));
      if (!lockedPrev.current) camLook.current.set(p.x, p.y + 1, p.z);
      camTarget.current.set(MILK_AREA.x, 2.8 + dist * 0.3, MILK_AREA.z + 1.5 + dist);
      camera.position.lerp(camTarget.current, 1 - Math.pow(0.01, delta));
      camLook.current.lerp({ x: MILK_AREA.x, y: 1.4, z: MILK_AREA.z - 0.5 }, 1 - Math.pow(0.01, delta));
      camera.lookAt(camLook.current);
      applyCamShake(camera); // wrong-answer wobble (MilkSplitterPanel)
    } else if (weighMode) {
      fpvInit.current = false;
      // --- Weigh Station camera (F9): front-on view of the scale, its
      // zoomed beam and the ≈ signs. ---
      const halfW = Math.tan((camera.fov * Math.PI) / 360) * camera.aspect;
      // Closer than the other stations so the (now central, bigger) number
      // line fills the screen.
      const dist = Math.min(22, Math.max(9, 6.2 / halfW));
      if (!lockedPrev.current) camLook.current.set(p.x, p.y + 1, p.z);
      // The beam is CENTRED on the weigh area now, so look straight at it
      // (x = WEIGH_AREA.x) and frame its centre (beam sits ~1.9 toward camera).
      camTarget.current.set(WEIGH_AREA.x, 2.4 + dist * 0.28, WEIGH_AREA.z + 1.9 + dist);
      camera.position.lerp(camTarget.current, 1 - Math.pow(0.01, delta));
      camLook.current.lerp({ x: WEIGH_AREA.x, y: 2.2, z: WEIGH_AREA.z + 1.4 }, 1 - Math.pow(0.01, delta));
      camera.lookAt(camLook.current);
      applyCamShake(camera); // wrong-answer wobble (WeighStationPanel)
    } else if (tradeMode) {
      fpvInit.current = false;
      // --- Trading Post camera (F10): front-on view of the three stalls +
      // the trading table between the pens. ---
      const halfW = Math.tan((camera.fov * Math.PI) / 360) * camera.aspect;
      // Steeper (~45°) and closer so the stall tags read LARGE.
      const dist = Math.min(24, Math.max(10, 7.5 / halfW));
      if (!lockedPrev.current) camLook.current.set(p.x, p.y + 1, p.z);
      camTarget.current.set(TRADE_AREA.x, dist * 0.72, TRADE_AREA.z + 1.5 + dist * 0.66);
      camera.position.lerp(camTarget.current, 1 - Math.pow(0.01, delta));
      camLook.current.lerp({ x: TRADE_AREA.x, y: 0.8, z: TRADE_AREA.z - 0.6 }, 1 - Math.pow(0.01, delta));
      camera.lookAt(camLook.current);
      applyCamShake(camera); // wrong-answer wobble (TradingPostPanel)
    } else if (veggieMode) {
      fpvInit.current = false;
      // --- Veggie Plot camera (F11): a steep (~50°), close top-down-ish view of
      // the garden bed so the grid + shaded overlap read clearly from above. ---
      const halfW = Math.tan((camera.fov * Math.PI) / 360) * camera.aspect;
      const dist = Math.min(24, Math.max(10, 7.5 / halfW));
      if (!lockedPrev.current) camLook.current.set(p.x, p.y + 1, p.z);
      camTarget.current.set(VEGGIE_AREA.x, dist * 0.82, VEGGIE_AREA.z + 1.0 + dist * 0.6);
      camera.position.lerp(camTarget.current, 1 - Math.pow(0.01, delta));
      camLook.current.lerp({ x: VEGGIE_AREA.x, y: 0.2, z: VEGGIE_AREA.z }, 1 - Math.pow(0.01, delta));
      camera.lookAt(camLook.current);
      applyCamShake(camera); // wrong-answer wobble (VeggiePlotPanel)
    } else if (plankMode) {
      fpvInit.current = false;
      // --- Plank the Gap camera (F12): front-on, slightly raised view of the
      // fence gap so the twelfths grid + laid planks read clearly. ---
      const halfW = Math.tan((camera.fov * Math.PI) / 360) * camera.aspect;
      const dist = Math.min(26, Math.max(11, 9.0 / halfW));
      if (!lockedPrev.current) camLook.current.set(p.x, p.y + 1, p.z);
      camTarget.current.set(PLANK_AREA.x, 2.4 + dist * 0.32, PLANK_AREA.z + 1.6 + dist);
      camera.position.lerp(camTarget.current, 1 - Math.pow(0.01, delta));
      camLook.current.lerp({ x: PLANK_AREA.x, y: 0.7, z: PLANK_AREA.z }, 1 - Math.pow(0.01, delta));
      camera.lookAt(camLook.current);
      applyCamShake(camera); // wrong-answer wobble (PlankGapPanel)
    } else if (shopMode) {
      fpvInit.current = false;
      // --- Farm Shop camera (F13): front-on view of the market stall so the
      // striped awning, produce crate and chalkboard ledger read clearly. ---
      const halfW = Math.tan((camera.fov * Math.PI) / 360) * camera.aspect;
      const dist = Math.min(26, Math.max(12, 9.5 / halfW));
      if (!lockedPrev.current) camLook.current.set(p.x, p.y + 1, p.z);
      camTarget.current.set(SHOP_AREA.x, 2.8 + dist * 0.34, SHOP_AREA.z + 2.0 + dist);
      camera.position.lerp(camTarget.current, 1 - Math.pow(0.01, delta));
      camLook.current.lerp({ x: SHOP_AREA.x, y: 1.4, z: SHOP_AREA.z }, 1 - Math.pow(0.01, delta));
      camera.lookAt(camLook.current);
      applyCamShake(camera); // wrong-answer wobble (FarmShopPanel)
    } else if (rangeMode) {
      fpvInit.current = false;
      // --- Snowball Range camera (SR): front-on view of the ten-frame crate
      // stand with the handful row in the foreground — the split + throw
      // read like a fairground game booth. The half-width fits the frame,
      // the crate stack west of it and the spare-pile tray east of it (≈ 6.4
      // either side of centre) and no more, so the ten-frame fills the shot
      // instead of sitting small in the middle of the snowfield. ---
      const halfW = Math.tan((camera.fov * Math.PI) / 360) * camera.aspect;
      const dist = Math.min(20, Math.max(9, 6.6 / halfW));
      if (!lockedPrev.current) camLook.current.set(p.x, p.y + 1, p.z);
      camTarget.current.set(RANGE_AREA.x, 2.4 + dist * 0.26, RANGE_AREA.z + 1.2 + dist);
      camera.position.lerp(camTarget.current, 1 - Math.pow(0.01, delta));
      camLook.current.lerp({ x: RANGE_AREA.x, y: 1.9, z: RANGE_AREA.z - 2.4 }, 1 - Math.pow(0.01, delta));
      camera.lookAt(camLook.current);
      applyCamShake(camera); // wrong-answer wobble (SnowballRangePanel)
    } else if (rinkGlideMode) {
      fpvInit.current = false;
      // --- Ice Rink glide camera (RG): a raised side-on view from the SOUTH
      // framing the WHOLE 0–100 number line (fence-style: distance computed
      // from live fov/aspect so both ends always fit, capped inside the fog). ---
      const lineMidX = (RINK_GLIDE_LINE.xMin + RINK_GLIDE_LINE.xMax) / 2;
      const lineHalf = (RINK_GLIDE_LINE.xMax - RINK_GLIDE_LINE.xMin) / 2;
      const halfW = Math.tan((camera.fov * Math.PI) / 360) * camera.aspect;
      const dist = Math.min(44, Math.max(18, (lineHalf + 3.5) / halfW));
      if (!lockedPrev.current) camLook.current.set(p.x, p.y + 1, p.z);
      camTarget.current.set(lineMidX, 3.5 + dist * 0.3, RINK_GLIDE_LINE.z + dist);
      camera.position.lerp(camTarget.current, 1 - Math.pow(0.01, delta));
      camLook.current.lerp({ x: lineMidX, y: 0.6, z: RINK_GLIDE_LINE.z }, 1 - Math.pow(0.01, delta));
      camera.lookAt(camLook.current);
      applyCamShake(camera); // wrong-landing wobble (RinkGlidePanel)
    } else if (groveMode) {
      fpvInit.current = false;
      // --- Grove camera (GV): front-on view of the big light-up tree with
      // the bundle box beside it — the whole spiral of lights readable. ---
      const halfW = Math.tan((camera.fov * Math.PI) / 360) * camera.aspect;
      const dist = Math.min(26, Math.max(11, 8.5 / halfW));
      if (!lockedPrev.current) camLook.current.set(p.x, p.y + 1, p.z);
      camTarget.current.set(GROVE_TREE_POS[0], 2.8 + dist * 0.3, GROVE_TREE_POS[1] + 2.0 + dist);
      camera.position.lerp(camTarget.current, 1 - Math.pow(0.01, delta));
      camLook.current.lerp({ x: GROVE_TREE_POS[0], y: 2.2, z: GROVE_TREE_POS[1] }, 1 - Math.pow(0.01, delta));
      camera.lookAt(camLook.current);
      applyCamShake(camera); // wrong-answer wobble (GroveLightsPanel)
    } else if (meadowMode) {
      fpvInit.current = false;
      // --- Meadow camera (ML): front-on view of the two snowman towers so
      // both stacks + the equation chain read clearly. ---
      const towersMidX = (MEADOW_TOWER_LEFT[0] + MEADOW_TOWER_RIGHT[0]) / 2;
      const halfW = Math.tan((camera.fov * Math.PI) / 360) * camera.aspect;
      const dist = Math.min(26, Math.max(11, 8.0 / halfW));
      if (!lockedPrev.current) camLook.current.set(p.x, p.y + 1, p.z);
      camTarget.current.set(towersMidX, 2.6 + dist * 0.3, MEADOW_TOWER_LEFT[1] + 2.0 + dist);
      camera.position.lerp(camTarget.current, 1 - Math.pow(0.01, delta));
      camLook.current.lerp({ x: towersMidX, y: 1.9, z: MEADOW_TOWER_LEFT[1] }, 1 - Math.pow(0.01, delta));
      camera.lookAt(camLook.current);
      applyCamShake(camera); // wrong-answer wobble (MeadowLevelPanel)
    } else if (sledMode) {
      fpvInit.current = false;
      // --- Sledding Slope camera (SL): a raised side-on view from the SOUTH
      // framing the whole run in profile, so the hill's rise, the number
      // window and the taut rope all read at once. ---
      const laneMidX = (SLOPE_LANE.xTop + SLOPE_LANE.xBottom) / 2;
      const laneMidH = snowGroundHeight(laneMidX, SLOPE_LANE.z);
      const halfW = Math.tan((camera.fov * Math.PI) / 360) * camera.aspect;
      const dist = Math.min(30, Math.max(14, 9.5 / halfW));
      if (!lockedPrev.current) camLook.current.set(p.x, p.y + 1, p.z);
      camTarget.current.set(laneMidX, laneMidH + 2.6 + dist * 0.26, SLOPE_LANE.z + dist);
      camera.position.lerp(camTarget.current, 1 - Math.pow(0.01, delta));
      camLook.current.lerp({ x: laneMidX, y: laneMidH + 1.1, z: SLOPE_LANE.z }, 1 - Math.pow(0.01, delta));
      camera.lookAt(camLook.current);
      applyCamShake(camera); // wrong-answer wobble (SledSlopePanel)
    } else if (lateSnowMode) {
      fpvInit.current = false;
      // --- Late snow challenges (VG/PC/IC/LY/AL): a shared front-on camera
      // from the SOUTH of each area, framed per-mode (the Lookout's aims
      // high so the aurora's written sum owns the screen). ---
      const view = LATE_SNOW_VIEW[lateSnowMode];
      const halfW = Math.tan((camera.fov * Math.PI) / 360) * camera.aspect;
      const dist = Math.min(28, Math.max(11, view.fit / halfW));
      if (!lockedPrev.current) camLook.current.set(p.x, p.y + 1, p.z);
      camTarget.current.set(view.look[0], view.base + dist * 0.3, view.look[2] + 3.0 + dist);
      camera.position.lerp(camTarget.current, 1 - Math.pow(0.01, delta));
      camLook.current.lerp({ x: view.look[0], y: view.look[1], z: view.look[2] }, 1 - Math.pow(0.01, delta));
      camera.lookAt(camLook.current);
      applyCamShake(camera); // wrong-answer wobble (the five late panels)
    } else {
      fpvInit.current = false;
      // --- Third-person camera follow (orbited by camYaw) ---
      // Camera sits "behind" the player: opposite the forward direction.
      camTarget.current.set(
        p.x + sin * CAMERA_DISTANCE,
        p.y + CAMERA_HEIGHT,
        p.z + cos * CAMERA_DISTANCE
      );
      camera.position.lerp(camTarget.current, 1 - Math.pow(0.001, delta));
      camera.lookAt(p.x, p.y + 1, p.z);
    }
    lockedPrev.current = fenceMode || roundUpMode || orderMode || crateMode || milkMode || weighMode || tradeMode || veggieMode || plankMode || shopMode || rangeMode || rinkGlideMode || groveMode || meadowMode || sledMode || Boolean(lateSnowMode);
  });

  // The player's initial position = the active region's spawn (island-1 default).
  const spawnPt = getRegion(useSession.getState().currentRegionId).spawn;

  return (
    <group ref={group} position={[spawnPt.x, 0, spawnPt.z]}>
      {/* main1.glb with movement-driven idle/walk/run/jump animation
          (primitive avatar fallback until the model loads). HIDDEN in
          first-person view so the camera (at the eyes) never sits inside the
          character mesh. */}
      <group visible={!fpv}>
        <PlayerCharacter profile={profile} />
      </group>
    </group>
  );
}
