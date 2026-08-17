import React, { useEffect, useRef, useState } from "react";

import { useMeadowLevel } from "../game/meadowLevelStore.js";
import { useSession, playerState } from "../game/sessionStore.js";
import {
  MEADOW_ROUNDS_PER_SET,
  MEADOW_MOVE_OPTIONS,
  MEADOW_CANT,
  MEADOW_TOTAL_POINTS,
  MEADOW_HOP_MS,
  MEADOW_LEVEL_TAIL_MS,
} from "../data/snow/meadowLevelChallenge.js";

/**
 * SNOWMAN MEADOW — 2D panel (ML). PREDICT the hop count with the buttons
 * (keys 1–4, or 5 for "Can't make twins!"), watch the balls hop and the
 * equation chain grow, then TYPE the total via the double. Wrong total →
 * camera shake + the levelling story on the reason card. Esc quits.
 */

const CELEBRATE_MS = 2200;

export default function MeadowLevelPanel() {
  const status = useMeadowLevel((s) => s.status);
  const roundIndex = useMeadowLevel((s) => s.roundIndex);
  const score = useMeadowLevel((s) => s.score);
  const bestScore = useMeadowLevel((s) => s.bestScore);
  const round = useMeadowLevel((s) => s.currentRound());
  const predictResult = useMeadowLevel((s) => s.predictResult);
  const typedCorrect = useMeadowLevel((s) => s.typedCorrect);
  const regionId = useSession((s) => s.currentRegionId);
  const [typed, setTyped] = useState("");
  const [inputWobble, setInputWobble] = useState(false);
  const inputRef = useRef(null);

  // Leaving the snow world ends the challenge.
  useEffect(() => {
    if (status !== "idle" && regionId !== "snow-sums") {
      useMeadowLevel.getState().exit();
    }
  }, [status, regionId]);

  // Fresh input + autofocus whenever a typing phase begins.
  useEffect(() => {
    if (status === "typing") {
      setTyped("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [status, roundIndex]);

  // Keys: Esc quits; Enter starts/advances; 1–5 answer the prediction.
  useEffect(() => {
    if (status === "idle") return undefined;
    function onKey(e) {
      const st = useMeadowLevel.getState();
      if (e.key === "Escape") {
        st.exit();
        return;
      }
      const typingInField = e.target && /input|textarea/i.test(e.target.tagName || "");
      if (typingInField) return;
      const num = Number(e.key);
      if (st.status === "predicting" && num >= 1 && num <= MEADOW_MOVE_OPTIONS.length) {
        st.choosePredict(MEADOW_MOVE_OPTIONS[num - 1]);
        return;
      }
      if (e.key !== "Enter") return;
      if (st.status === "intro") st.beginRounds();
      else if (st.status === "feedback" || st.status === "celebrate") st.next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status]);

  // The hops play one beat per ball — then the typing box appears.
  useEffect(() => {
    if (status !== "levelling") return undefined;
    const st = useMeadowLevel.getState();
    const moves = st.currentRound()?.moves || 1;
    const t = setTimeout(() => useMeadowLevel.getState().finishLevel(), moves * MEADOW_HOP_MS + MEADOW_LEVEL_TAIL_MS);
    return () => clearTimeout(t);
  }, [status, roundIndex]);

  // Wrong typed total → shake.
  useEffect(() => {
    if (status === "feedback") {
      playerState.camShake = { start: Date.now(), dur: 500 };
    }
  }, [status, roundIndex]);

  // Celebrate → auto-next.
  useEffect(() => {
    if (status !== "celebrate") return undefined;
    const t = setTimeout(() => useMeadowLevel.getState().next(), CELEBRATE_MS);
    return () => clearTimeout(t);
  }, [status, roundIndex]);

  if (status === "idle") return null;

  function submitTyped() {
    const result = useMeadowLevel.getState().submitTotal(typed);
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
            <span>⛄ Snowman Meadow</span>
          </div>
          <div className="farm-challenge-line big">
            Hop snowballs across until the snowmen are <span className="fc-value">level twins</span> — then use the double!
          </div>
          <div className="farm-challenge-line">
            The total NEVER changes while balls move. But watch out — some pairs can't be twins at all…
          </div>
          <div className="farm-challenge-buttons">
            <button
              className="primary-button"
              onClick={(e) => {
                e.currentTarget.blur();
                useMeadowLevel.getState().beginRounds();
              }}
            >
              Start! (Enter)
            </button>
            <button className="link-button" onClick={() => useMeadowLevel.getState().exit()}>
              Quit
            </button>
          </div>
        </div>
      )}

      {status === "predicting" && round && (
        <div className="farm-challenge-card">
          <div className="farm-challenge-head">
            <span>
              ⛄ Round {roundIndex + 1}/{MEADOW_ROUNDS_PER_SET} · {score} pts — {round.left} and {round.right} snowballs.{" "}
              <span className="fc-value">How many must hop</span> to make level twins?
            </span>
            <button className="link-button" onClick={() => useMeadowLevel.getState().exit()}>
              Quit
            </button>
          </div>
          <div className="plank-pieces">
            {MEADOW_MOVE_OPTIONS.map((m) => (
              <button
                key={m}
                className="plank-piece-btn"
                onClick={(e) => {
                  e.currentTarget.blur();
                  useMeadowLevel.getState().choosePredict(m);
                }}
              >
                {m === MEADOW_CANT ? "Can't make twins!" : m}
              </button>
            ))}
          </div>
        </div>
      )}

      {status === "levelling" && round && predictResult && (
        <div className="farm-challenge-card mini">
          <div className="farm-challenge-head">
            <span>
              {predictResult.label} — watch the total stay the same…
            </span>
          </div>
        </div>
      )}

      {status === "typing" && round && (
        <div className="farm-challenge-card">
          <div className="farm-challenge-line big">
            {round.canTwin
              ? <>Level twins! <span className="fc-value">{round.level} + {round.level}</span> — double {round.level} makes what?</>
              : <>As close as twins get: <span className="fc-value">{round.level} + {round.level + 1}</span> — double {round.level} and 1 more?</>}
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
            <span className="weigh-unit">snowballs</span>
            <button className="primary-button" onClick={submitTyped}>
              Check (+{MEADOW_TOTAL_POINTS})
            </button>
          </div>
        </div>
      )}

      {status === "celebrate" && round && (
        <div className="farm-challenge-card mini">
          <div className="farm-challenge-head">
            <span>
              ✓ {round.left} + {round.right} = {round.canTwin ? `double ${round.level}` : `double ${round.level} + 1`} = {round.total}! · {score} pts
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
                useMeadowLevel.getState().next();
              }}
            >
              {roundIndex + 1 < MEADOW_ROUNDS_PER_SET ? "Next round (Enter)" : "Finish (Enter)"}
            </button>
          </div>
        </div>
      )}

      {status === "done" && (
        <div className="farm-challenge-card">
          <div className="farm-challenge-head">
            <span>⛄ Snowman Meadow — complete!</span>
          </div>
          <div className="farm-challenge-prompt">
            You scored {score} points. Best so far: {Math.max(bestScore, score)} points.
          </div>
          <div className="farm-challenge-buttons">
            <button className="primary-button" onClick={() => useMeadowLevel.getState().start()}>
              Play again
            </button>
            <button className="link-button" onClick={() => useMeadowLevel.getState().exit()}>
              Back to the snow
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
