import { create } from "zustand";

import {
  generateGroveSet,
  gradeGroveGrab,
  gradeGroveAdjust,
  checkGroveTotal,
  GROVE_ROUNDS_PER_SET,
  GROVE_TOTAL_POINTS,
} from "../data/snow/groveLightsChallenge.js";
import { useProgress } from "../progress/store.js";
import { useUI } from "../ui/effects/uiStore.js";

/**
 * GROVE LIGHTS STORE (GV) — session state for the compensation challenge.
 * Three-part rounds (Trading-Post-style):
 *   grabbing   pick the friendly bundle pile → chooseGrab()
 *   adjusting  the FRIENDLY bundles hang (even after a wrong grab — the
 *              student sees the quick way), then pick the fix → chooseAdjust()
 *   typing     the true fix performs (ping!), type the total → submitTotal()
 * Correct typing → celebrate (auto-next); wrong → shake + reason card.
 *
 * NOTE: progress is LOCAL-ONLY for now — same note as the other snow stores.
 */

const BEST_KEY = "mma-snow-pines-best";

function readBest() {
  try {
    const v = Number(localStorage.getItem(BEST_KEY));
    return Number.isFinite(v) ? v : 0;
  } catch {
    return 0;
  }
}

function writeBest(score) {
  try {
    if (score > readBest()) localStorage.setItem(BEST_KEY, String(score));
  } catch {
    /* best score is a nicety only */
  }
}

export const useGroveLights = create((set, get) => ({
  // "idle" | "intro" | "grabbing" | "adjusting" | "typing" | "celebrate" | "feedback" | "done"
  status: "idle",
  rounds: [],
  roundIndex: 0,
  grabResult: null, // gradeGroveGrab() after Part A
  adjustResult: null, // gradeGroveAdjust() after Part B
  typedCorrect: null,
  results: [],
  score: 0,
  bestScore: readBest(),

  currentRound() {
    const { rounds, roundIndex } = get();
    return rounds[roundIndex] || null;
  },

  start() {
    set({
      status: "intro",
      rounds: generateGroveSet(),
      roundIndex: 0,
      grabResult: null,
      adjustResult: null,
      typedCorrect: null,
      results: [],
      score: 0,
      bestScore: readBest(),
    });
  },

  beginRounds() {
    if (get().status !== "intro") return;
    set({ status: "grabbing" });
  },

  /** Part A: pick a bundle pile. The friendly pile always hangs next. */
  chooseGrab(bundles) {
    const { status } = get();
    if (status !== "grabbing") return;
    const round = get().currentRound();
    if (!round || !round.grabOptions.includes(bundles)) return;
    const grab = gradeGroveGrab(round, bundles);
    set((s) => ({
      status: "adjusting",
      grabResult: grab,
      score: s.score + grab.points,
    }));
  },

  /** Part B: pick the fix (−2…+2 from GROVE_ADJUSTMENTS). */
  chooseAdjust(value) {
    const { status } = get();
    if (status !== "adjusting") return;
    const round = get().currentRound();
    if (!round) return;
    const adj = gradeGroveAdjust(round, value);
    set((s) => ({
      status: "typing",
      adjustResult: adj,
      score: s.score + adj.points,
    }));
  },

  /** Part C: the typed total. Returns "invalid" | "correct" | "wrong". */
  submitTotal(text) {
    const { status } = get();
    if (status !== "typing") return "invalid";
    const round = get().currentRound();
    if (!round) return "invalid";
    const { valid, correct } = checkGroveTotal(round, text);
    if (!valid) return "invalid";
    set((s) => ({
      status: correct ? "celebrate" : "feedback",
      typedCorrect: correct,
      score: s.score + (correct ? GROVE_TOTAL_POINTS : 0),
    }));
    return correct ? "correct" : "wrong";
  },

  next() {
    const { status, roundIndex, score, grabResult, adjustResult, typedCorrect } = get();
    if (status !== "feedback" && status !== "celebrate") return;
    const round = get().currentRound();
    const results = [...get().results, { round, grabResult, adjustResult, typedCorrect }];
    if (roundIndex + 1 < GROVE_ROUNDS_PER_SET) {
      set({
        status: "grabbing",
        roundIndex: roundIndex + 1,
        grabResult: null,
        adjustResult: null,
        typedCorrect: null,
        results,
      });
      return;
    }
    writeBest(score);
    if (score > 0) {
      const coins = Math.floor(score / 5);
      useProgress.getState().awardRewards({ xp: score, coins });
      useUI.getState().pushToast({
        type: "reward",
        icon: "🎄",
        title: "Christmas Tree Grove",
        message: `${score} points — +${score} XP, +${coins} coins!`,
      });
    }
    set({ status: "done", results, bestScore: Math.max(readBest(), score) });
  },

  exit() {
    set({
      status: "idle",
      rounds: [],
      roundIndex: 0,
      grabResult: null,
      adjustResult: null,
      typedCorrect: null,
      results: [],
      score: 0,
    });
  },
}));
