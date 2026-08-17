/**
 * Task navigation compass — pure routing + heading math (no React/R3F).
 *
 * Given the current region, the player's position + camera yaw, and a teacher
 * task, work out the world point the player should head toward next — the portal
 * that leads to the task's region, or the challenge / NPC itself once in-region —
 * and the on-screen arrow angle to it.
 *
 * Coordinates are [x, z] world units; angles are radians. The camera basis in
 * Player.jsx is forward = (-sin(yaw), -cos(yaw)) ("into the screen" / up) and
 * right = (cos(yaw), -sin(yaw)) (screen-right), which this module uses directly.
 */
import { getRegion } from "./regions.js";
import { getInteractable } from "./interactables.js";
import { FARM_TASK_META, farmObjectiveText } from "./farm/farmTaskObjective.js";

export const HUB_REGION = "island-1";

/** Wrap an angle to (-π, π]. */
export function normAngle(a) {
  a = a % (2 * Math.PI);
  if (a > Math.PI) a -= 2 * Math.PI;
  if (a <= -Math.PI) a += 2 * Math.PI;
  return a;
}

/**
 * Resolve a teacher task to its final destination { region, pos:[x,z], name },
 * or null if it can't be resolved. Farm tasks point at the challenge sign; NPC
 * tasks at the host interactable.
 */
export function taskTarget(task) {
  if (!task) return null;
  if (task.location === "farm" && task.challengeId) {
    const it = getInteractable("farm-" + task.challengeId + "-sign");
    if (!it || !it.position) return null;
    const meta = FARM_TASK_META[task.challengeId];
    return { region: it.regionId || "farm-parts-whole", pos: it.position, name: (meta && meta.name) || task.challengeId };
  }
  const npc = String(task.npcId || "").toLowerCase();
  if (!npc) return null;
  const it = getInteractable(npc);
  if (!it || !it.position) return null;
  return { region: it.regionId || HUB_REGION, pos: it.position, name: it.name || npc };
}

/**
 * World point [x,z] to head toward from `currentRegion` for a target in
 * `targetRegion`: the target itself when already there, otherwise the portal in
 * the current region that leads there (routing via the island hub when there's no
 * direct portal). Returns { pos, kind:'target'|'portal', label }. Topology:
 * island-1 is the hub; schoolyard and farm are leaves off it.
 */
export function nextWaypoint(currentRegion, targetRegion, targetPos) {
  if (currentRegion === targetRegion) return { pos: targetPos, kind: "target", label: null };
  const region = getRegion(currentRegion);
  const portals = (region && region.portals) || [];
  let p = portals.find((pt) => pt.target === targetRegion);
  if (!p) p = portals.find((pt) => pt.target === HUB_REGION); // leaf → back to the hub first
  if (!p || !p.position) return null;
  return { pos: p.position, kind: "portal", label: p.label || null };
}

/** Distance between the player and a world point. */
export function targetDistance(px, pz, tx, tz) {
  return Math.hypot(tx - px, tz - pz);
}

/**
 * On-screen compass angle (radians) toward a world point. 0 = straight ahead
 * (arrow points up); positive = clockwise (target to the player's right). Derived
 * from the camera basis so it tracks the live camera yaw exactly.
 */
export function compassAngle(px, pz, camYaw, tx, tz) {
  const dx = tx - px;
  const dz = tz - pz;
  const sin = Math.sin(camYaw);
  const cos = Math.cos(camYaw);
  const rightComp = dx * cos - dz * sin;   // component along screen-right
  const fwdComp = -dx * sin - dz * cos;    // component along "into screen" (up)
  return Math.atan2(rightComp, fwdComp);
}

/**
 * Pick the current task + resolve its waypoint for the current region. Tasks are
 * ordered by assignedAt (the order the teacher set them); the first not-yet-done
 * one is active. `isDone(task)` decides completion. Returns
 * { task, name, inRegion, waypoint:{pos,kind,label} } or null.
 */
export function planRoute(assignments, currentRegion, isDone) {
  const tasks = [...(assignments || [])].filter(Boolean)
    .sort((a, b) => (a.assignedAt || 0) - (b.assignedAt || 0));
  for (const t of tasks) {
    if (isDone && isDone(t)) continue;
    const tgt = taskTarget(t);
    if (!tgt) continue;
    const wp = nextWaypoint(currentRegion, tgt.region, tgt.pos);
    if (!wp) continue;
    return { task: t, name: tgt.name, inRegion: currentRegion === tgt.region, waypoint: wp };
  }
  return null;
}

/**
 * The first outstanding teacher task (farm or NPC), in the order the teacher set
 * them (earliest assignedAt first). `isDone(task)` decides completion. Returns
 * the task, or null when nothing is outstanding. Used by the HUD objective line
 * so the on-screen objective always matches the compass.
 */
export function firstOutstandingTask(assignments, isDone) {
  const tasks = [...(assignments || [])].filter(Boolean)
    .sort((a, b) => (a.assignedAt || 0) - (b.assignedAt || 0));
  for (const t of tasks) {
    if (isDone && isDone(t)) continue;
    return t;
  }
  return null;
}

/** One-line objective for a teacher task — "Find X …". Pure. */
export function taskObjectiveText(task) {
  if (!task) return null;
  if (task.location === "farm" && task.challengeId) return farmObjectiveText(task.challengeId);
  const tgt = taskTarget(task);
  const who = (tgt && tgt.name) || task.npcId || "your teacher's task";
  const title = task.title || "Teacher task";
  return `Find ${who} for your teacher task: “${title}”`;
}
