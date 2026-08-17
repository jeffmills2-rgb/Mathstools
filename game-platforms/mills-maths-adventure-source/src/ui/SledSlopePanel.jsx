import React, { useEffect, useRef, useState } from "react";

import { useSledSlope } from "../game/sledSlopeStore.js";
import { useSession, playerState } from "../game/sessionStore.js";
import {
  SLED_ROUNDS_PER_SET,
  SLED_PREDICT_OPTIONS,
  SLED_DIFF_POINTS,
  SLED_MAX_SLIDES,
} from "../data/snow/sledSlopeChallenge.js";

/**
 * SLEDDING SLOPE — 2D panel (SL). PREDICT the rope thought-experiment
 * (buttons or keys 1–3), SLIDE the roped pair with the nudge buttons (or
 * ↓/→ down 1, ↑/← up 1) until the back sled sits on a decade, RACE! to
 * confirm, then TYPE the difference. Wrong difference → camera shake + the
 * constant-difference story on the reason card. Esc quits.
 */

const CELEBRATE_MS = 2600;

const PREDICT_LABEL = { bigger: "Gets bigger", same: "Stays the same", smaller: "Gets smaller" };

export default function SledSlopePanel() {
  const status = useSledSlope((s) => s.status);
  const roundIndex = useSledSlope((s) => s.roundIndex);
  const score = useSledSlope((s) => s.score);
  const bestScore = useSledSlope((s) => s.bestScore);
  const round = useSledSlope((s) => s.currentRound());
  const slid = useSledSlope((s) => s.slid);
  const slidesUsed = useSledSlope((s) => s.slidesUsed);
  const predictResult = useSledSlope((s) => s.predictResult);
  const slideResult = useSledSlope((s) => s.slideResult);
  const typedCorrect = useSledSlope((s) => s.typedCorrect);
  const regionId = useSession((s) => s.currentRegionId);
  const [typed, setTyped] = useState("");
  const [inputWobble, setInputWobble] = useState(false);
  const inputRef = useRef(null);

  // Leaving the snow world ends the challenge.
  useEffect(() => {
    if (status !== "idle" && regionId !== "snow-sums") {
      useSledSlope.getState().exit();
    }
  }, [status, regionId]);

  // Fresh input + autofocus whenever a typing phase begins.
  useEffect(() => {
    if (status === "typing") {
      setTyped("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [status, roundIndex]);

  // Keys: Esc quits; Enter starts/races/advances; 1–3 predict; arrows nudge.
  useEffect(() => {
    if (status === "idle") return undefined;
    function onKey(e) {
      const st = useSledSlope.getState();
      if (e.key === "Escape") {
        st.exit();
        return;
      }
      const typingInField = e.target && /input|textarea/i.test(e.target.tagName || "");
      if (typingInField) return;
      const num = Number(e.key);
      if (st.status === "predicting" && num >= 1 && num <= SLED_PREDICT_OPTIONS.length) {
        st.choosePredict(SLED_PREDICT_OPTIONS[num - 1]);
        return;
      }
      if (st.status === "sliding") {
        if (e.key === "ArrowDown" || e.key === "ArrowRight") {
          e.preventDefault();
          st.nudge(1);
          return;
        }
        if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
          e.preventDefault();
          st.nudge(-1);
          return;
        }
      }
      if (e.key !== "Enter") return;
      if (st.status === "intro") st.beginRounds();
      else if (st.status === "sliding") st.confirmSlide();
      else if (st.status === "feedback" || st.status === "celebrate") st.next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status]);

  // Wrong typed difference → shake.
  useEffect(() => {
    if (status === "feedback") {
      playerState.camShake = { start: Date.now(), dur: 500 };
    }
  }, [status, roundIndex]);

  // Celebrate (the race) → auto-next.
  useEffect(() => {
    if (status !== "celebrate") return undefined;
    const t = setTimeout(() => useSledSlope.getState().next(), CELEBRATE_MS);
    return () => clearTimeout(t);
  }, [status, roundIndex]);

  if (status === "idle") return null;

  function submitTyped() {
    const result = useSledSlope.getState().submitDiff(typed);
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
            <span>🛷 Sledding Slope</span>
          </div>
          <div className="farm-challenge-line big">
            Two sleds, one rope — <span className="fc-value">the rope is the gap</span>, and it can't stretch!
          </div>
          <div className="farm-challenge-line">
            Slide the PAIR together until the back sled sits on a friendly decade — the difference never changes.
          </div>
          <div className="farm-challenge-buttons">
            <button
              className="primary-button"
              onClick={(e) => {
                e.currentTarget.blur();
                useSledSlope.getState().beginRounds();
              }}
            >
              Start! (Enter)
            </button>
            <button className="link-button" onClick={() => useSledSlope.getState().exit()}>
              Quit
            </button>
          </div>
        </div>
      )}

      {status === "predicting" && round && (
        <div className="farm-challenge-card">
          <div className="farm-challenge-head">
            <span>
              🛷 Round {roundIndex + 1}/{SLED_ROUNDS_PER_SET} · {score} pts — sleds at{" "}
              <span className="fc-value">{round.a}</span> and <span className="fc-value">{round.b}</span>.{" "}
              {round.scenario.text}
            </span>
            <button className="link-button" onClick={() => useSledSlope.getState().exit()}>
              Quit
            </button>
          </div>
          <div className="plank-pieces">
            {SLED_PREDICT_OPTIONS.map((o) => (
              <button
                key={o}
                className="plank-piece-btn"
                onClick={(e) => {
                  e.currentTarget.blur();
                  useSledSlope.getState().choosePredict(o);
                }}
              >
                {PREDICT_LABEL[o]}
              </button>
            ))}
          </div>
        </div>
      )}

      {status === "sliding" && round && predictResult && (
        <div className="farm-challenge-card">
          <div className={`farm-challenge-verdict ${predictResult.correct ? "good" : "warm"}`}>
            {predictResult.label}
          </div>
          <div className="farm-challenge-line big">
            Now slide the PAIR until the <span className="fc-value">back sled</span> sits on a decade:{" "}
            <span className="fc-value">{round.a + slid} − {round.b + slid}</span>
          </div>
          <div className="plank-pieces">
            <button
              className="plank-piece-btn"
              disabled={slidesUsed >= SLED_MAX_SLIDES}
              onClick={(e) => {
                e.currentTarget.blur();
                useSledSlope.getState().nudge(1);
              }}
            >
              ⬊ Slide down 1
            </button>
            <button
              className="plank-piece-btn"
              disabled={slidesUsed >= SLED_MAX_SLIDES}
              onClick={(e) => {
                e.currentTarget.blur();
                useSledSlope.getState().nudge(-1);
              }}
            >
              ⬉ Drag up 1
            </button>
          </div>
          <div className="farm-challenge-buttons">
            <button
              className="primary-button"
              onClick={(e) => {
                e.currentTarget.blur();
                useSledSlope.getState().confirmSlide();
              }}
            >
              RACE! (Enter)
            </button>
          </div>
        </div>
      )}

      {status === "typing" && round && slideResult && (
        <div className="farm-challenge-card">
          <div className={`farm-challenge-verdict ${slideResult.correct ? "good" : "warm"}`}>
            {slideResult.label}
            {!slideResult.correct && ` The friendly spot: ${round.a + round.shift} − ${round.decade}.`}
          </div>
          <div className="farm-challenge-line big">
            {round.a + slid} − {round.b + slid} — what's the difference?
          </div>
          <div className={`weigh-input-row${inputWobble ? " wobble" : ""}`}>
            <input
              ref={inputRef}
              className="text-input weigh-input"
              type="text"
              inputMode="numeric"
              placeholder="?"
              value={typed}
              maxLength={4}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitTyped()}
            />
            <span className="weigh-unit">apart</span>
            <button className="primary-button" onClick={submitTyped}>
              Check (+{SLED_DIFF_POINTS})
            </button>
          </div>
        </div>
      )}

      {status === "celebrate" && round && (
        <div className="farm-challenge-card mini">
          <div className="farm-challenge-head">
            <span>
              ✓ {round.a} − {round.b} = {round.gap} — and they're off! 🛷🛷 · {score} pts
            </span>
          </div>
        </div>
      )}

      {status === "feedback" && round && (
        <div className="farm-challenge-card">
          <div className="farm-challenge-verdict bad">
            {typedCorrect === false ? "Not the gap! +0 pts" : "+0 pts"}
          </div>
          <div className="farm-challenge-prompt">{round.reason}</div>
          <div className="farm-challenge-buttons">
            <button
              className="primary-button"
              onClick={(e) => {
                e.currentTarget.blur();
                useSledSlope.getState().next();
              }}
            >
              {roundIndex + 1 < SLED_ROUNDS_PER_SET ? "Next round (Enter)" : "Finish (Enter)"}
            </button>
          </div>
        </div>
      )}

      {status === "done" && (
        <div className="farm-challenge-card">
          <div className="farm-challenge-head">
            <span>🛷 Sledding Slope — complete!</span>
          </div>
          <div className="farm-challenge-prompt">
            You scored {score} points. Best so far: {Math.max(bestScore, score)} points.
          </div>
          <div className="farm-challenge-buttons">
            <button className="primary-button" onClick={() => useSledSlope.getState().start()}>
              Play again
            </button>
            <button className="link-button" onClick={() => useSledSlope.getState().exit()}>
              Back to the snow
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
