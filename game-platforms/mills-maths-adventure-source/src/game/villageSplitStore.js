import { create } from "zustand";

import {
  generateVillageSet,
  gradeVillagePredict,
  checkVillageJoin,
  checkVillageTotal,
  VILLAGE_ROUNDS_PER_SET,
  VILLAGE_TENS_POINTS,
  VILLAGE_ONES_POINTS,
  VILLAGE_TOTAL_POINTS,
} from "../data/snow/villageSplitChallenge.js";
import { useProgress } from "../progress/store.js";
import { useUI } from "../ui/effects/uiStore.js";

/**
 * VILLAGE SPLIT STORE (VG) — session state for the partitioning challenge.
 *   predicting  will the ones overflow? → choosePredict()
 *   joining     type the tens wall + the raw ones pile → submitJoin()
 *   typing      the blocks fly together (regroup snap if ones ≥ 10 — timed
 *               by the panel/3D via VILLAGE_BLOCK_MS), type the total
 * Correct total → celebrate (auto-next); wrong → shake + reason card.
 *
 * NOTE: progress is LOCAL-ONLY for now — same note as the other snow stores.
 */

const BEST_KEY = "mma-snow-village-best";

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

export const useVillageSplit = create((set, get) => ({
  // "idle" | "intro" | "predicting" | "joining" | "typing" | "celebrate" | "feedback" | "done"
  status: "idle",
  rounds: [],
  roundIndex: 0,
  predictResult: null,
  joinResult: null, // { tensCorrect, onesCorrect } after submitJoin
  buildStartedAt: 0, // Date.now() when the blocks began flying (3D anim)
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
      rounds: generateVillageSet(),
      roundIndex: 0,
      predictResult: null,
      joinResult: null,
      buildStartedAt: 0,
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

  /** Part A: the overflow prediction. */
  choosePredict(saidYes) {
    const { status } = get();
    if (status !== "predicting") return;
    const round = get().currentRound();
    if (!round) return;
    const predict = gradeVillagePredict(round, saidYes);
    set((s) => ({
      status: "joining",
      predictResult: predict,
      score: s.score + predict.points,
    }));
  },

  /** Part B: tens wall + raw ones pile. Returns "invalid" | "done". */
  submitJoin(tensText, onesText) {
    const { status } = get();
    if (status !== "joining") return "invalid";
    const round = get().currentRound();
    if (!round) return "invalid";
    const join = checkVillageJoin(round, tensText, onesText);
    if (!join.valid) return "invalid";
    set((s) => ({
      status: "typing",
      joinResult: join,
      buildStartedAt: Date.now(),
      score:
        s.score +
        (join.tensCorrect ? VILLAGE_TENS_POINTS : 0) +
        (join.onesCorrect ? VILLAGE_ONES_POINTS : 0),
    }));
    return "done";
  },

  /** Part C: the finished total. Returns "invalid" | "correct" | "wrong". */
  submitTotal(text) {
    const { status } = get();
    if (status !== "typing") return "invalid";
    const round = get().currentRound();
    if (!round) return "invalid";
    const { valid, correct } = checkVillageTotal(round, text);
    if (!valid) return "invalid";
    set((s) => ({
      status: correct ? "celebrate" : "feedback",
      typedCorrect: correct,
      score: s.score + (correct ? VILLAGE_TOTAL_POINTS : 0),
    }));
    return correct ? "correct" : "wrong";
  },

  next() {
    const { status, roundIndex, score, predictResult, joinResult, typedCorrect } = get();
    if (status !== "feedback" && status !== "celebrate") return;
    const round = get().currentRound();
    const results = [...get().results, { round, predictResult, joinResult, typedCorrect }];
    if (roundIndex + 1 < VILLAGE_ROUNDS_PER_SET) {
      set({
        status: "predicting",
        roundIndex: roundIndex + 1,
        predictResult: null,
        joinResult: null,
        buildStartedAt: 0,
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
        icon: "🧊",
        title: "Igloo Village",
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
      joinResult: null,
      buildStartedAt: 0,
      typedCorrect: null,
      results: [],
      score: 0,
    });
  },
}));
