/**
 * QUEST TARGETS — thin compatibility layer over the data-driven topic routes.
 *
 * The canonical routing data now lives in data/topicWorldRoutes.js (Phase 2J).
 * This module preserves the older resolver names used across the app and simply
 * delegates to the routes, so the architectural boundary is unchanged:
 *
 *   - CURATED MAIN STORY (data/mainQuest.js → MAIN_QUEST_CHAIN): fixed path,
 *     Pip=Integers, Fern=FDP, Alby=Algebra, Champion's Grove.
 *   - FLEXIBLE MISSION SYSTEM (missions + curriculum registry): any topic/skill;
 *     guided through these routes, with a safe Mission Board fallback for any
 *     topic that has no dedicated zone/NPC (never forced onto Pip/Fern/Alby).
 *
 * Pure. No React, no stores.
 */
import {
  routeGuidanceTarget,
  routeForMission,
  TOPIC_WORLD_ROUTES,
  GENERIC_FALLBACK,
} from "./topicWorldRoutes.js";

// Back-compat: a topic → { targetId, text, fallback }.
export function resolveTopicTarget(topicId) {
  return routeGuidanceTarget(topicId);
}

// Back-compat: a mission → { targetId, text, fallback }.
export function resolveMissionTarget(mission) {
  return routeForMission(mission);
}

// Legacy aliases kept so older imports continue to resolve.
export const TOPIC_TARGETS = Object.fromEntries(
  TOPIC_WORLD_ROUTES.map((r) => [r.topicId, { targetId: r.guidanceTarget, text: r.missionStartText }])
);
export const FALLBACK_TARGET = { ...GENERIC_FALLBACK };
