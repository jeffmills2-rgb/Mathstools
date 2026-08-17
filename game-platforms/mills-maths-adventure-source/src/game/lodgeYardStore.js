import { create } from "zustand";

import {
  generateYardSet,
  checkYardOnes,
  checkYardTens,
  checkYardChange,
  YARD_ROUNDS_PER_SET,
  YARD_ONES_POINTS,
  YARD_TENS_POINTS,
  YARD_CHANGE_POINTS,
} from "../data/snow/lodgeYardChallenge.js";
import { useProgress } from "../progress/store.js";
import { useUI } from "../ui/effects/uiStore.js";

/**
 * LODGE YARD STORE (LY) — session state for the friends-of-100 challenge.
 *   ones     type the hop to the next ten → submitOnes() (the beads for
 *            that part-row fill on the board)
 *   tens     type the hop to 100 → submitTens() (the clean rows fill)
 *   typing   type the whole change → submitChange()
 * Correct change → celebrate (auto-next); wrong → shake + reason card.
 * Wrong hops score 0 but the TRUE hop still fills, so the board always
 * teaches the friendly path.
 *
 * NOTE: progress is LOCAL-ONLY for now — same note as the other snow stores.
 */

const BEST_KEY = "mma-snow-lodgeyard-best";

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

export const useLodgeYard = create((set, get) => ({
  // "idle" | "intro" | "ones" | "tens" | "typing" | "celebrate" | "feedback" | "done"
  status: "idle",
  rounds: [],
  roundIndex: 0,
  onesResult: null, // { correct } after submitOnes
  tensResult: null, // { correct } after submitTens
  onesFilledAt: 0, // Date.now() — drives the part-row bead fill
  tensFilledAt: 0, // Date.now() — drives the clean-row bead fill
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
      rounds: generateYardSet(),
      roundIndex: 0,
      onesResult: null,
      tensResult: null,
      onesFilledAt: 0,
      tensFilledAt: 0,
      typedCorrect: null,
      results: [],
      score: 0,
      bestScore: readBest(),
    });
  },

  beginRounds() {
    if (get().status !== "intro") return;
    set({ status: "ones" });
  },

  /** Part A: the hop to the next ten. Returns "invalid" | "done". */
  submitOnes(text) {
    const { status } = get();
    if (status !== "ones") return "invalid";
    const round = get().currentRound();
    if (!round) return "invalid";
    const { valid, correct } = checkYardOnes(round, text);
    if (!valid) return "invalid";
    set((s) => ({
      status: "tens",
      onesResult: { correct },
      onesFilledAt: Date.now(),
      score: s.score + (correct ? YARD_ONES_POINTS : 0),
    }));
    return "done";
  },

  /** Part B: the hop to 100. Returns "invalid" | "done". */
  submitTens(text) {
    const { status } = get();
    if (status !== "tens") return "invalid";
    const round = get().currentRound();
    if (!round) return "invalid";
    const { valid, correct } = checkYardTens(round, text);
    if (!valid) return "invalid";
    set((s) => ({
      status: "typing",
      tensResult: { correct },
      tensFilledAt: Date.now(),
      score: s.score + (correct ? YARD_TENS_POINTS : 0),
    }));
    return "done";
  },

  /** Part C: the whole change. Returns "invalid" | "correct" | "wrong". */
  submitChange(text) {
    const { status } = get();
    if (status !== "typing") return "invalid";
    const round = get().currentRound();
    if (!round) return "invalid";
    const { valid, correct } = checkYardChange(round, text);
    if (!valid) return "invalid";
    set((s) => ({
      status: correct ? "celebrate" : "feedback",
      typedCorrect: correct,
      score: s.score + (correct ? YARD_CHANGE_POINTS : 0),
    }));
    return correct ? "correct" : "wrong";
  },

  next() {
    const { status, roundIndex, score, onesResult, tensResult, typedCorrect } = get();
    if (status !== "feedback" && status !== "celebrate") return;
    const round = get().currentRound();
    const results = [...get().results, { round, onesResult, tensResult, typedCorrect }];
    if (roundIndex + 1 < YARD_ROUNDS_PER_SET) {
      set({
        status: "ones",
        roundIndex: roundIndex + 1,
        onesResult: null,
        tensResult: null,
        onesFilledAt: 0,
        tensFilledAt: 0,
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
        icon: "☕",
        title: "The Lodge Yard",
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
      onesResult: null,
      tensResult: null,
      onesFilledAt: 0,
      tensFilledAt: 0,
      typedCorrect: null,
      results: [],
      score: 0,
    });
  },
}));
