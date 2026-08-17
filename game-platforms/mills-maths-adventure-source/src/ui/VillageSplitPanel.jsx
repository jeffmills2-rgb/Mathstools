import React, { useEffect, useRef, useState } from "react";

import { useVillageSplit } from "../game/villageSplitStore.js";
import { useSession, playerState } from "../game/sessionStore.js";
import {
  VILLAGE_ROUNDS_PER_SET,
  VILLAGE_TENS_POINTS,
  VILLAGE_ONES_POINTS,
  VILLAGE_TOTAL_POINTS,
} from "../data/snow/villageSplitChallenge.js";

/**
 * IGLOO VILLAGE — 2D panel (VG). PREDICT the overflow (Y/N buttons or keys
 * 1–2), JOIN like with like (two quick inputs: the tens wall, then the RAW
 * ones pile — 13, not 3!), then TYPE the finished igloo while the blocks
 * fly and the regroup SNAPS. Wrong total → shake + the split story. Esc
 * quits; leaving the snow world exits.
 */

const CELEBRATE_MS = 2200;

export default function VillageSplitPanel() {
  const status = useVillageSplit((s) => s.status);
  const roundIndex = useVillageSplit((s) => s.roundIndex);
  const score = useVillageSplit((s) => s.score);
  const bestScore = useVillageSplit((s) => s.bestScore);
  const round = useVillageSplit((s) => s.currentRound());
  const predictResult = useVillageSplit((s) => s.predictResult);
  const joinResult = useVillageSplit((s) => s.joinResult);
  const typedCorrect = useVillageSplit((s) => s.typedCorrect);
  const regionId = useSession((s) => s.currentRegionId);
  const [tensTyped, setTensTyped] = useState("");
  const [onesTyped, setOnesTyped] = useState("");
  const [typed, setTyped] = useState("");
  const [inputWobble, setInputWobble] = useState(false);
  const tensRef = useRef(null);
  const onesRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (status !== "idle" && regionId !== "snow-sums") {
      useVillageSplit.getState().exit();
    }
  }, [status, regionId]);

  useEffect(() => {
    if (status === "joining") {
      setTensTyped("");
      setOnesTyped("");
      setTimeout(() => tensRef.current?.focus(), 50);
    }
    if (status === "typing") {
      setTyped("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [status, roundIndex]);

  useEffect(() => {
    if (status === "idle") return undefined;
    function onKey(e) {
      const st = useVillageSplit.getState();
      if (e.key === "Escape") {
        st.exit();
        return;
      }
      const typingInField = e.target && /input|textarea/i.test(e.target.tagName || "");
      if (typingInField) return;
      if (st.status === "predicting") {
        if (e.key === "1") st.choosePredict(true);
        if (e.key === "2") st.choosePredict(false);
        return;
      }
      if (e.key !== "Enter") return;
      if (st.status === "intro") st.beginRounds();
      else if (st.status === "feedback" || st.status === "celebrate") st.next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status]);

  useEffect(() => {
    if (status === "feedback") {
      playerState.camShake = { start: Date.now(), dur: 500 };
    }
  }, [status, roundIndex]);

  useEffect(() => {
    if (status !== "celebrate") return undefined;
    const t = setTimeout(() => useVillageSplit.getState().next(), CELEBRATE_MS);
    return () => clearTimeout(t);
  }, [status, roundIndex]);

  if (status === "idle") return null;

  function submitJoin() {
    const result = useVillageSplit.getState().submitJoin(tensTyped, onesTyped);
    if (result === "invalid") {
      setInputWobble(true);
      setTimeout(() => setInputWobble(false), 400);
      (tensTyped.trim() === "" ? tensRef : onesRef).current?.focus();
    }
  }

  function submitTyped() {
    const result = useVillageSplit.getState().submitTotal(typed);
    if (result === "invalid") {
      setInputWobble(true);
      setTimeout(() => setInputWobble(false), 400);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="farm-challenge-panel">
      {status === "intro" && (
        <div className="farm-challenge-card">
          <div className="farm-challenge-head">
            <span>🧊 Igloo Village</span>
          </div>
          <div className="farm-challenge-line big">
            Join two igloos — <span className="fc-value">tens with tens, ones with ones</span>!
          </div>
          <div className="farm-challenge-line">
            If the ones pile passes ten, ten of them SNAP into a brand-new ten-block. Watch for it!
          </div>
          <div className="farm-challenge-buttons">
            <button
              className="primary-button"
              onClick={(e) => {
                e.currentTarget.blur();
                useVillageSplit.getState().beginRounds();
              }}
            >
              Start! (Enter)
            </button>
            <button className="link-button" onClick={() => useVillageSplit.getState().exit()}>
              Quit
            </button>
          </div>
        </div>
      )}

      {status === "predicting" && round && (
        <div className="farm-challenge-card">
          <div className="farm-challenge-head">
            <span>
              🧊 Round {roundIndex + 1}/{VILLAGE_ROUNDS_PER_SET} · {score} pts — join{" "}
              <span className="fc-value">{round.a}</span> and <span className="fc-value">{round.b}</span>. Will the
              ones OVERFLOW into a new ten-block?
            </span>
            <button className="link-button" onClick={() => useVillageSplit.getState().exit()}>
              Quit
            </button>
          </div>
          <div className="plank-pieces">
            <button
              className="plank-piece-btn"
              onClick={(e) => {
                e.currentTarget.blur();
                useVillageSplit.getState().choosePredict(true);
              }}
            >
              Yes — overflow!
            </button>
            <button
              className="plank-piece-btn"
              onClick={(e) => {
                e.currentTarget.blur();
                useVillageSplit.getState().choosePredict(false);
              }}
            >
              No — it fits
            </button>
          </div>
        </div>
      )}

      {status === "joining" && round && predictResult && (
        <div className="farm-challenge-card">
          <div className={`farm-challenge-verdict ${predictResult.correct ? "good" : "warm"}`}>
            {predictResult.label}
          </div>
          <div className="farm-challenge-line big">
            Tens with tens: {round.ta * 10} + {round.tb * 10}. Ones with ones: {round.oa} + {round.ob}.
          </div>
          <div className={`weigh-input-row${inputWobble ? " wobble" : ""}`}>
            <span className="weigh-unit">tens wall</span>
            <input
              ref={tensRef}
              className="text-input weigh-input"
              type="text"
              inputMode="numeric"
              placeholder="?"
              value={tensTyped}
              maxLength={3}
              onChange={(e) => setTensTyped(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onesRef.current?.focus()}
            />
            <span className="weigh-unit">ones pile</span>
            <input
              ref={onesRef}
              className="text-input weigh-input"
              type="text"
              inputMode="numeric"
              placeholder="?"
              value={onesTyped}
              maxLength={2}
              onChange={(e) => setOnesTyped(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitJoin()}
            />
            <button className="primary-button" onClick={submitJoin}>
              Join! (+{VILLAGE_TENS_POINTS}+{VILLAGE_ONES_POINTS})
            </button>
          </div>
        </div>
      )}

      {status === "typing" && round && joinResult && (
        <div className="farm-challenge-card">
          <div className={`farm-challenge-verdict ${joinResult.tensCorrect && joinResult.onesCorrect ? "good" : "warm"}`}>
            {joinResult.tensCorrect ? `Tens wall ${round.tensSum} ✓` : `The tens wall is ${round.tensSum}!`}{" "}
            {joinResult.onesCorrect ? `Ones pile ${round.onesSum} ✓` : `The ones pile is ${round.onesSum} — the WHOLE pile!`}
          </div>
          <div className="farm-challenge-line big">
            {round.regroup
              ? <>Ten ones SNAP into a new ten-block: {round.tensSum} + 10 + {round.onesSum - 10} = ?</>
              : <>{round.tensSum} + {round.onesSum} = ?</>}
          </div>
          <div className={`weigh-input-row${inputWobble ? " wobble" : ""}`}>
            <input
              ref={inputRef}
              className="text-input weigh-input"
              type="text"
              inputMode="numeric"
              placeholder="?"
              value={typed}
              maxLength={3}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitTyped()}
            />
            <span className="weigh-unit">blocks</span>
            <button className="primary-button" onClick={submitTyped}>
              Check (+{VILLAGE_TOTAL_POINTS})
            </button>
          </div>
        </div>
      )}

      {status === "celebrate" && round && (
        <div className="farm-challenge-card mini">
          <div className="farm-challenge-head">
            <span>
              ✓ {round.a} + {round.b} = {round.tensSum} + {round.onesSum} = {round.total}! · {score} pts
            </span>
          </div>
        </div>
      )}

      {status === "feedback" && round && (
        <div className="farm-challenge-card">
          <div className="farm-challenge-verdict bad">
            {typedCorrect === false ? "Not the total! +0 pts" : "+0 pts"}
          </div>
          <div className="farm-challenge-prompt">{round.reason}</div>
          <div className="farm-challenge-buttons">
            <button
              className="primary-button"
              onClick={(e) => {
                e.currentTarget.blur();
                useVillageSplit.getState().next();
              }}
            >
              {roundIndex + 1 < VILLAGE_ROUNDS_PER_SET ? "Next round (Enter)" : "Finish (Enter)"}
            </button>
          </div>
        </div>
      )}

      {status === "done" && (
        <div className="farm-challenge-card">
          <div className="farm-challenge-head">
            <span>🧊 Igloo Village — complete!</span>
          </div>
          <div className="farm-challenge-prompt">
            You scored {score} points. Best so far: {Math.max(bestScore, score)} points.
          </div>
          <div className="farm-challenge-buttons">
            <button className="primary-button" onClick={() => useVillageSplit.getState().start()}>
              Play again
            </button>
            <button className="link-button" onClick={() => useVillageSplit.getState().exit()}>
              Back to the snow
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
