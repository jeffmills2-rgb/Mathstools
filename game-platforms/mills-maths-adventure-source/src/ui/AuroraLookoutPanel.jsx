import React, { useEffect, useRef, useState } from "react";

import { useAuroraLookout } from "../game/auroraLookoutStore.js";
import { useSession, playerState } from "../game/sessionStore.js";
import {
  LOOKOUT_ROUNDS_PER_SET,
  LOOKOUT_STRATEGIES,
  LOOKOUT_ANSWER_POINTS,
} from "../data/snow/auroraLookoutChallenge.js";

/**
 * AURORA LOOKOUT — 2D panel (AL). The capstone: PICK the tool (buttons or
 * keys 1–7 — the brightest path scores full, any sound tool scores half),
 * then EXECUTE it against the one-line scaffold. Wrong answer → shake + the
 * brightest-path story. Esc quits; leaving the snow world exits.
 */

const CELEBRATE_MS = 2400;

export default function AuroraLookoutPanel() {
  const status = useAuroraLookout((s) => s.status);
  const roundIndex = useAuroraLookout((s) => s.roundIndex);
  const score = useAuroraLookout((s) => s.score);
  const bestScore = useAuroraLookout((s) => s.bestScore);
  const round = useAuroraLookout((s) => s.currentRound());
  const pickResult = useAuroraLookout((s) => s.pickResult);
  const typedCorrect = useAuroraLookout((s) => s.typedCorrect);
  const regionId = useSession((s) => s.currentRegionId);
  const [typed, setTyped] = useState("");
  const [inputWobble, setInputWobble] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (status !== "idle" && regionId !== "snow-sums") {
      useAuroraLookout.getState().exit();
    }
  }, [status, regionId]);

  useEffect(() => {
    if (status === "typing") {
      setTyped("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [status, roundIndex]);

  useEffect(() => {
    if (status === "idle") return undefined;
    function onKey(e) {
      const st = useAuroraLookout.getState();
      if (e.key === "Escape") {
        st.exit();
        return;
      }
      const typingInField = e.target && /input|textarea/i.test(e.target.tagName || "");
      if (typingInField) return;
      const num = Number(e.key);
      if (st.status === "picking" && num >= 1 && num <= LOOKOUT_STRATEGIES.length) {
        st.choosePick(LOOKOUT_STRATEGIES[num - 1].key);
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
    const t = setTimeout(() => useAuroraLookout.getState().next(), CELEBRATE_MS);
    return () => clearTimeout(t);
  }, [status, roundIndex]);

  if (status === "idle") return null;

  function submitTyped() {
    const result = useAuroraLookout.getState().submitAnswer(typed);
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
            <span>✨ Aurora Lookout</span>
          </div>
          <div className="farm-challenge-line big">
            The aurora writes a sum — <span className="fc-value">choose the tool</span>, not the answer!
          </div>
          <div className="farm-challenge-line">
            Every trick from the snow world works here. Any sound tool scores — the brightest path scores more.
          </div>
          <div className="farm-challenge-buttons">
            <button
              className="primary-button"
              onClick={(e) => {
                e.currentTarget.blur();
                useAuroraLookout.getState().beginRounds();
              }}
            >
              Start! (Enter)
            </button>
            <button className="link-button" onClick={() => useAuroraLookout.getState().exit()}>
              Quit
            </button>
          </div>
        </div>
      )}

      {status === "picking" && round && (
        <div className="farm-challenge-card">
          <div className="farm-challenge-head">
            <span>
              ✨ Round {roundIndex + 1}/{LOOKOUT_ROUNDS_PER_SET} · {score} pts — the aurora writes{" "}
              <span className="fc-value">{round.expr}</span>. Which tool makes it easy?
            </span>
            <button className="link-button" onClick={() => useAuroraLookout.getState().exit()}>
              Quit
            </button>
          </div>
          <div className="plank-pieces">
            {LOOKOUT_STRATEGIES.map((s) => (
              <button
                key={s.key}
                className="plank-piece-btn"
                onClick={(e) => {
                  e.currentTarget.blur();
                  useAuroraLookout.getState().choosePick(s.key);
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {status === "typing" && round && pickResult && (
        <div className="farm-challenge-card">
          <div className={`farm-challenge-verdict ${pickResult.best ? "good" : pickResult.sound ? "warm" : "bad"}`}>
            {pickResult.label}
          </div>
          <div className="farm-challenge-line big">
            {round.scaffold} <span className="fc-value">?</span>
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
            <span className="weigh-unit">= {round.expr}</span>
            <button className="primary-button" onClick={submitTyped}>
              Check (+{LOOKOUT_ANSWER_POINTS})
            </button>
          </div>
        </div>
      )}

      {status === "celebrate" && round && (
        <div className="farm-challenge-card mini">
          <div className="farm-challenge-head">
            <span>
              ✓ {round.expr} = {round.answer} — the sky approves! · {score} pts
            </span>
          </div>
        </div>
      )}

      {status === "feedback" && round && (
        <div className="farm-challenge-card">
          <div className="farm-challenge-verdict bad">
            {typedCorrect === false ? "Not quite! +0 pts" : "+0 pts"}
          </div>
          <div className="farm-challenge-prompt">{round.reason}</div>
          <div className="farm-challenge-buttons">
            <button
              className="primary-button"
              onClick={(e) => {
                e.currentTarget.blur();
                useAuroraLookout.getState().next();
              }}
            >
              {roundIndex + 1 < LOOKOUT_ROUNDS_PER_SET ? "Next round (Enter)" : "Finish (Enter)"}
            </button>
          </div>
        </div>
      )}

      {status === "done" && (
        <div className="farm-challenge-card">
          <div className="farm-challenge-head">
            <span>✨ Aurora Lookout — complete!</span>
          </div>
          <div className="farm-challenge-prompt">
            You scored {score} points. Best so far: {Math.max(bestScore, score)} points. Ten challenges, ten tools — the snow world is yours.
          </div>
          <div className="farm-challenge-buttons">
            <button className="primary-button" onClick={() => useAuroraLookout.getState().start()}>
              Play again
            </button>
            <button className="link-button" onClick={() => useAuroraLookout.getState().exit()}>
              Back to the snow
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
