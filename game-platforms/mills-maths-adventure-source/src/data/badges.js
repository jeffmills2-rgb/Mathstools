/**
 * BADGES — small achievement system (Phase 2D foundation).
 *
 * Badges are pure DATA here: a registry of every badge that can be earned, plus
 * tiny helpers. This module knows NOTHING about React, the 3D world, or where
 * progress is stored. "Which badges a student has earned" lives in the progress
 * store (earnedBadges) and is persisted via storage.js — exactly like
 * completedEncounters / completedQuests.
 *
 * Badge definition shape (the catalogue):
 *   {
 *     badgeId:     string  // stable unique id, referenced by missions.rewardBadge
 *     badgeName:   string  // shown to the student
 *     description: string  // what it was earned for
 *     icon:        string  // emoji placeholder (swap for art later)
 *   }
 *
 * Earned-badge record shape (what we save per student):
 *   { badgeId, earnedAt }   // earnedAt = ms timestamp
 *
 * The catalogue is intentionally small for the prototype. A teacher portal can
 * later let teachers create badges; this registry would then be loaded from
 * Firebase instead of being hard-coded, with no change to the consumers.
 */
export const BADGES = {
  "fraction-explorer": {
    badgeId: "fraction-explorer",
    badgeName: "Fraction Explorer",
    description: "Completed a fractions, decimals & percentages mission.",
    icon: "🍰",
  },
  "integer-adventurer": {
    badgeId: "integer-adventurer",
    badgeName: "Integer Adventurer",
    description: "Completed an integers mission.",
    icon: "➕",
  },
  "algebra-apprentice": {
    badgeId: "algebra-apprentice",
    badgeName: "Algebra Apprentice",
    description: "Completed an algebra mission.",
    icon: "🧮",
  },
  "stage4-quest-champion": {
    badgeId: "stage4-quest-champion",
    badgeName: "Stage 4 Quest Champion",
    description: "Completed a multi-topic Stage 4 mission.",
    icon: "🏆",
  },
  "schoolyard-champion": {
    badgeId: "schoolyard-champion",
    badgeName: "Schoolyard Champion",
    description: "Cleared the whole Schoolyard and beat the Head Teacher's challenge.",
    icon: "🏅",
  },
};

// Look up a badge definition by id (or null if unknown).
export function getBadge(badgeId) {
  return BADGES[badgeId] || null;
}

// Every badge definition as an array (handy for menus / the DevPanel).
export function getAllBadges() {
  return Object.values(BADGES);
}

// True if a badgeId exists in the catalogue.
export function isValidBadge(badgeId) {
  return Boolean(BADGES[badgeId]);
}

// Build the record we persist when a student earns a badge.
export function makeEarnedBadge(badgeId, when = Date.now()) {
  return { badgeId, earnedAt: when };
}

/**
 * Decorate a list of earned-badge records with their catalogue details for the
 * UI, e.g. [{ badgeId, earnedAt }] -> [{ ...definition, earnedAt }].
 * Unknown ids are skipped so a renamed/removed badge never crashes the profile.
 */
export function decorateEarnedBadges(earnedBadges = []) {
  return earnedBadges
    .map((e) => {
      const def = getBadge(e.badgeId);
      return def ? { ...def, earned: true, earnedAt: e.earnedAt } : null;
    })
    .filter(Boolean);
}
