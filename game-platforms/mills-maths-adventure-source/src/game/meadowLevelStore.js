import { create } from "zustand";

import {
  generateMeadowSet,
  gradeMeadowPredict,
  checkMeadowTotal,
  MEADOW_ROUNDS_PER_SET,
  MEADOW_TOTAL_POINTS,
} from "../data/snow/meadowLevelChallenge.js";
import { useProgress } from "../progress/store.js";
import { useUI } from "../ui/effects/uiStore.js";

/**
 * MEADOW LEVEL STORE (ML) — session state for the levelling challenge.
 *   predicting  call the hop count (or "Can't make twins!") → choosePredict()
 *   levelling   the TRUE hops play out, one ball per beat (panel-timed via
 *               MEADOW_HOP_MS) — the equation chain grows as they land
 *   typing      type the total via the double → submitTotal()
 * Correct typing → celebrate (auto-next); wrong → shake + reason card.
 *
 * NOTE: progress is LOCAL-ONLY for now — same note as the other snow stores.
 */

const BEST_KEY = "mma-snow-snowmen-best";

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

export const useMeadowLevel = create((set, get) => ({
  // "idle" | "intro" | "predicting" | "levelling" | "typing" | "celebrate" | "feedback" | "done"
  status: "idle",
  rounds: [],
  roundIndex: 0,
  predictResult: null, // gradeMeadowPredict() after Part A
  levelStartedAt: 0, // Date.now() when the hops began (drives the 3D)
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
      rounds: generateMeadowSet(),
      roundIndex: 0,
      predictResult: null,
      levelStartedAt: 0,
      typedCorrect: null,
      results: [],
      score: 0,
      bestScore: readBest(),
    });
  },

  beginRounds() {
    if (get().status !== "intro") return;
    set({ status: "predicting" });
  },

  /** Part A: predict the hop count — the TRUE hops always play out next. */
  choosePredict(choice) {
    const { status } = get();
    if (status !== "predicting") return;
    const round = get().currentRound();
    if (!round) return;
    const predict = gradeMeadowPredict(round, choice);
    set((s) => ({
      status: "levelling",
      predictResult: predict,
      levelStartedAt: Date.now(),
      score: s.score + predict.points,
    }));
  },

  /** Called by the panel when the hop animation completes. */
  finishLevel() {
    if (get().status !== "levelling") return;
    set({ status: "typing" });
  },

  /** Part B: the typed total. Returns "invalid" | "correct" | "wrong". */
  submitTotal(text) {
    const { status } = get();
    if (status !== "typing") return "invalid";
    const round = get().currentRound();
    if (!round) return "invalid";
    const { valid, correct } = checkMeadowTotal(round, text);
    if (!valid) return "invalid";
    set((s) => ({
      status: correct ? "celebrate" : "feedback",
      typedCorrect: correct,
      score: s.score + (correct ? MEADOW_TOTAL_POINTS : 0),
    }));
    return correct ? "correct" : "wrong";
  },

  next() {
    const { status, roundIndex, score, predictResult, typedCorrect } = get();
    if (status !== "feedback" && status !== "celebrate") return;
    const round = get().currentRound();
    const results = [...get().results, { round, predictResult, typedCorrect }];
    if (roundIndex + 1 < MEADOW_ROUNDS_PER_SET) {
      set({
        status: "predicting",
        roundIndex: roundIndex + 1,
        predictResult: null,
        levelStartedAt: 0,
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
        icon: "⛄",
        title: "Snowman Meadow",
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
      predictResult: null,
      levelStartedAt: 0,
      typedCorrect: null,
      results: [],
      score: 0,
    });
  },
}));
