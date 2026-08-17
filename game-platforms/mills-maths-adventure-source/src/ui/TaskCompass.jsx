import React, { useEffect, useMemo, useRef, useState } from "react";

import { useCloud } from "../cloud/cloudSession.js";
import { useSession, playerState } from "../game/sessionStore.js";
import { useProgress } from "../progress/store.js";
import { isFarmTaskDone } from "../cloud/farmCompletion.js";
import { planRoute, compassAngle, targetDistance } from "../data/taskCompass.js";
import { Bi } from "../i18n/i18n.jsx";

const ARRIVE_RADIUS = 3.2; // metres — show "You're here" when this close in-region

/**
 * Task navigation compass — a large, prominent top-of-screen arrow that points
 * the player toward their current teacher-set task: first to the portal for the
 * task's region, then to the challenge / NPC once inside. Multiple tasks are
 * followed in the order the teacher set them (earliest assignedAt first).
 * Renders nothing when there are no outstanding tasks.
 */
export default function TaskCompass() {
  const assignments = useCloud((s) => s.assignments);
  const currentRegionId = useSession((s) => s.currentRegionId);
  const completed = useProgress((s) => s.completedMissions);
  const arrowRef = useRef(null);
  const distRef = useRef(null);
  const [plan, setPlan] = useState(null);

  // Recompute the active task + waypoint whenever tasks, region or completion change.
  const route = useMemo(() => {
    const isDone = (t) => t.location === "farm"
      ? isFarmTaskDone(t.assignmentId)
      : (completed || []).includes(t.assignmentId);
    return planRoute(assignments, currentRegionId, isDone);
  }, [assignments, currentRegionId, completed]);

  useEffect(() => { setPlan(route); }, [route]);

  // Rotate the arrow every frame from the live player position + camera yaw.
  useEffect(() => {
    if (!route) return undefined;
    const tx = route.waypoint.pos[0];
    const tz = route.waypoint.pos[1];
    let raf;
    const tick = () => {
      const ang = compassAngle(playerState.x, playerState.z, playerState.camYaw || 0, tx, tz);
      const d = targetDistance(playerState.x, playerState.z, tx, tz);
      const arrived = route.inRegion && d <= ARRIVE_RADIUS;
      if (arrowRef.current) {
        arrowRef.current.style.transform = arrived ? "rotate(0rad)" : "rotate(" + ang + "rad)";
        arrowRef.current.style.opacity = arrived ? "0.5" : "1";
      }
      if (distRef.current) distRef.current.textContent = arrived ? "You're here" : Math.round(d) + " m";
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [route]);

  if (!plan) return null;
  const label = plan.inRegion ? plan.name : (plan.waypoint.label || "the portal");
  const lead = plan.inRegion ? "Go to" : "Head to";

  return (
    <div className="hud-compass">
      <div className="hud-compass-arrow" ref={arrowRef} aria-hidden="true">
        <svg viewBox="0 0 24 24" width="46" height="46">
          <path d="M12 2 L20 20 L12 15.5 L4 20 Z" fill="currentColor" />
        </svg>
      </div>
      <div className="hud-compass-text">
        <div className="hud-compass-label"><Bi>{lead}</Bi> {label}</div>
        <div className="hud-compass-dist" ref={distRef}></div>
      </div>
    </div>
  );
}
