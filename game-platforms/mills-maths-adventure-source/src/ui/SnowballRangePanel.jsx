import React, { useEffect, useRef, useState } from "react";

import { useSnowballRange } from "../game/snowballRangeStore.js";
import { useSession, playerState } from "../game/sessionStore.js";
import { RANGE_ROUNDS_PER_SET, RANGE_TYPE_POINTS } from "../data/snow/snowballRangeChallenge.js";

/**
 * SNOWBALL RANGE — 2D panel (SR). Weigh-Station pacing: SPLIT the handful
 * (tap a gap in the 3D row, or nudge with ← →) then "Throw!" for the exact
 * split points, then TYPE the finished total into the input box. Correct
 * typing → celebrate auto-advances; wrong → camera shake + reason card.
 * Esc quits; leaving the snow world auto-exits.
 */

const CELEBRATE_MS = 2000;

export default function SnowballRangePanel() {
  const status = useSnowballRange((s) => s.status);
  const roundIndex = useSnowballRange((s) => s.roundIndex);
  const score = useSnowballRange((s) => s.score);
  const bestScore = useSnowballRange((s) => s.bestScore);
  const round = useSnowballRange((s) => s.currentRound());
  const splitResult = useSnowballRange((s) => s.splitResult);
  const attempts = useSnowballRange((s) => s.attempts);
  const typedCorrect = useSnowballRange((s) => s.typedCorrect);
  const regionId = useSession((s) => s.currentRegionId);
  const [typed, setTyped] = useState("");
  const [inputWobble, setInputWobble] = useState(false);
  const inputRef = useRef(null);

  // Leaving the snow world ends the challenge.
  useEffect(() => {
    if (status !== "idle" && regionId !== "snow-sums") {
      useSnowballRange.getState().exit();
    }
  }, [status, regionId]);

  // Fresh input + autofocus whenever a typing phase begins.
  useEffect(() => {
    if (status === "typing") {
      setTyped("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [status, roundIndex]);

  // Keys: Esc quits; Enter starts/throws/advances; ← → nudge the divider.
  useEffect(() => {
    if (status === "idle") return undefined;
    function onKey(e) {
      const st = useSnowballRange.getState();
      if (e.key === "Escape") {
        st.exit();
        return;
      }
      const typingInField = e.target && /input|textarea/i.test(e.target.tagName || "");
      if (st.status === "splitting" && !typingInField) {
        if (e.key === "ArrowLeft") st.setSplit(st.splitIndex - 1);
        if (e.key === "ArrowRight") st.setSplit(st.splitIndex + 1);
      }
      if (e.key !== "Enter" || typingInField) return;
      if (st.status === "intro") st.beginRounds();
      else if (st.status === "splitting") st.throwSplit();
      else if (st.status === "missed") st.retrySplit();
      else if (st.status === "feedback" || st.status === "celebrate") st.next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status]);

  // Wrong typed answer, or a throw that didn't fill the frame → shake.
  useEffect(() => {
    if (status === "feedback" || status === "missed") {
      playerState.camShake = { start: Date.now(), dur: 500 };
    }
  }, [status, roundIndex, attempts]);

  // Celebrate → auto-next.
  useEffect(() => {
    if (status !== "celebrate") return undefined;
    const t = setTimeout(() => useSnowballRange.getState().next(), CELEBRATE_MS);
    return () => clearTimeout(t);
  }, [status, roundIndex]);

  if (status === "idle") return null;

  function submitTyped() {
    const result = useSnowballRange.getState().submitSum(typed);
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
            <span>❄️ The Snowball Range</span>
          </div>
          <div className="farm-challenge-line big">
            Split your handful to <span className="fc-value">FILL the crate to ten</span> first — then throw the rest!
          </div>
          <div className="farm-challenge-line">
            Tap between the snowballs (or ← →) to place the split, then Throw. The crate must be
            FULL before you can count the total — first-throw fill = +10, the total = +15.
          </div>
          <div className="farm-challenge-buttons">
            <button
              className="primary-button"
              onClick={(e) => {
                e.currentTarget.blur();
                useSnowballRange.getState().beginRounds();
              }}
            >
              Start! (Enter)
            </button>
            <button className="link-button" onClick={() => useSnowballRange.getState().exit()}>
              Quit
            </button>
          </div>
        </div>
      )}

      {status === "splitting" && round && (
        <div className="farm-challenge-card mini">
          {/* The split, the counts and the sum all live in the 3D scene (the
              divider, the crate, the equation chip). The strip stays a thin
              round/score bar + the action, so the student reads ONE place. */}
          <div className="farm-challenge-head">
            <span>
              ❄️ Round {roundIndex + 1}/{RANGE_ROUNDS_PER_SET} · {score} pts
            </span>
            <button
              className="primary-button"
              onClick={(e) => {
                e.currentTarget.blur();
                useSnowballRange.getState().throwSplit();
              }}
            >
              Throw! (Enter)
            </button>
            <button className="link-button" onClick={() => useSnowballRange.getState().exit()}>
              Quit
            </button>
          </div>
        </div>
      )}

      {/* MISSED — the frame isn't full, so the round does not move on. The
          crate is showing the gaps (or the bounced surplus) behind this card;
          the student re-splits and throws again. From here the sockets
          preview the fill live, so the second go is supported. */}
      {status === "missed" && round && splitResult && (
        <div className="farm-challenge-card">
          <div className="farm-challenge-verdict warm">{splitResult.label}</div>
          <div className="farm-challenge-line big">
            The crate must reach <span className="fc-value">{round.nextTen}</span> before you can
            count the rest.
          </div>
          <div className="farm-challenge-line">
            {splitResult.short
              ? "Look at the empty sockets — that's how many to throw first."
              : "Too many went in. Only the empty sockets can take a snowball."}
          </div>
          <div className="farm-challenge-buttons">
            <button
              className="primary-button"
              onClick={(e) => {
                e.currentTarget.blur();
                useSnowballRange.getState().retrySplit();
              }}
            >
              Try the split again (Enter)
            </button>
            <button className="link-button" onClick={() => useSnowballRange.getState().exit()}>
              Quit
            </button>
          </div>
        </div>
      )}

      {status === "typing" && round && splitResult && (
        <div className="farm-challenge-card">
          <div className={`farm-challenge-verdict ${splitResult.correct ? "good" : "warm"}`}>
            {splitResult.label}
          </div>
          {/* The sum itself is on the crate ("18 + 7 → 20 + 5"), so the card
              only asks the question and takes the answer. */}
          <div className="farm-challenge-line big">How many altogether?</div>
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
              Check (+{RANGE_TYPE_POINTS})
            </button>
          </div>
        </div>
      )}

      {status === "celebrate" && round && (
        <div className="farm-challenge-card mini">
          <div className="farm-challenge-head">
            <span>
              ✓ {round.start} + {round.comp} = {round.nextTen}, then + {round.rest} = {round.sum}! · {score} pts
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
                useSnowballRange.getState().next();
              }}
            >
              {roundIndex + 1 < RANGE_ROUNDS_PER_SET ? "Next round (Enter)" : "Finish (Enter)"}
            </button>
          </div>
        </div>
      )}

      {status === "done" && (
        <div className="farm-challenge-card">
          <div className="farm-challenge-head">
            <span>❄️ The Snowball Range — complete!</span>
          </div>
          <div className="farm-challenge-prompt">
            You scored {score} points. Best so far: {Math.max(bestScore, score)} points.
          </div>
          <div className="farm-challenge-buttons">
            <button className="primary-button" onClick={() => useSnowballRange.getState().start()}>
              Play again
            </button>
            <button className="link-button" onClick={() => useSnowballRange.getState().exit()}>
              Back to the snow
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
