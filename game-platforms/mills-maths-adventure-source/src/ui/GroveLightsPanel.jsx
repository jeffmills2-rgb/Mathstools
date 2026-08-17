import React, { useEffect, useRef, useState } from "react";

import { useGroveLights } from "../game/groveLightsStore.js";
import { useSession, playerState } from "../game/sessionStore.js";
import {
  GROVE_ROUNDS_PER_SET,
  GROVE_ADJUSTMENTS,
  GROVE_TOTAL_POINTS,
} from "../data/snow/groveLightsChallenge.js";

/**
 * CHRISTMAS TREE GROVE — 2D panel (GV). Three quick parts per round: GRAB
 * the friendly bundle pile (buttons or keys 1–3), pick the FIX (buttons or
 * keys 1–5: unclip 2 / unclip 1 / perfect / clip 1 / clip 2), then TYPE the
 * finished total. Wrong total → camera shake + the compensation sentence on
 * the reason card. Esc quits; leaving the snow world exits.
 */

const CELEBRATE_MS = 2000;

export default function GroveLightsPanel() {
  const status = useGroveLights((s) => s.status);
  const roundIndex = useGroveLights((s) => s.roundIndex);
  const score = useGroveLights((s) => s.score);
  const bestScore = useGroveLights((s) => s.bestScore);
  const round = useGroveLights((s) => s.currentRound());
  const grabResult = useGroveLights((s) => s.grabResult);
  const adjustResult = useGroveLights((s) => s.adjustResult);
  const typedCorrect = useGroveLights((s) => s.typedCorrect);
  const regionId = useSession((s) => s.currentRegionId);
  const [typed, setTyped] = useState("");
  const [inputWobble, setInputWobble] = useState(false);
  const inputRef = useRef(null);

  // Leaving the snow world ends the challenge.
  useEffect(() => {
    if (status !== "idle" && regionId !== "snow-sums") {
      useGroveLights.getState().exit();
    }
  }, [status, regionId]);

  // Fresh input + autofocus whenever a typing phase begins.
  useEffect(() => {
    if (status === "typing") {
      setTyped("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [status, roundIndex]);

  // Keys: Esc quits; Enter starts/advances; 1–3 grab, 1–5 fix.
  useEffect(() => {
    if (status === "idle") return undefined;
    function onKey(e) {
      const st = useGroveLights.getState();
      if (e.key === "Escape") {
        st.exit();
        return;
      }
      const typingInField = e.target && /input|textarea/i.test(e.target.tagName || "");
      if (typingInField) return;
      const num = Number(e.key);
      if (st.status === "grabbing" && num >= 1 && num <= 3) {
        const r = st.currentRound();
        if (r) st.chooseGrab(r.grabOptions[num - 1]);
        return;
      }
      if (st.status === "adjusting" && num >= 1 && num <= GROVE_ADJUSTMENTS.length) {
        st.chooseAdjust(GROVE_ADJUSTMENTS[num - 1].value);
        return;
      }
      if (e.key !== "Enter") return;
      if (st.status === "intro") st.beginRounds();
      else if (st.status === "feedback" || st.status === "celebrate") st.next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status]);

  // Wrong typed total → shake.
  useEffect(() => {
    if (status === "feedback") {
      playerState.camShake = { start: Date.now(), dur: 500 };
    }
  }, [status, roundIndex]);

  // Celebrate → auto-next.
  useEffect(() => {
    if (status !== "celebrate") return undefined;
    const t = setTimeout(() => useGroveLights.getState().next(), CELEBRATE_MS);
    return () => clearTimeout(t);
  }, [status, roundIndex]);

  if (status === "idle") return null;

  function submitTyped() {
    const result = useGroveLights.getState().submitTotal(typed);
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
            <span>🎄 Christmas Tree Grove</span>
          </div>
          <div className="farm-challenge-line big">
            Lights come in <span className="fc-value">bundles of TEN</span> — clipping singles is slow!
          </div>
          <div className="farm-challenge-line">
            Grab the friendly pile, hang the lot, then fix it: unclip the extra (ping!) or clip one more.
          </div>
          <div className="farm-challenge-buttons">
            <button
              className="primary-button"
              onClick={(e) => {
                e.currentTarget.blur();
                useGroveLights.getState().beginRounds();
              }}
            >
              Start! (Enter)
            </button>
            <button className="link-button" onClick={() => useGroveLights.getState().exit()}>
              Quit
            </button>
          </div>
        </div>
      )}

      {status === "grabbing" && round && (
        <div className="farm-challenge-card">
          <div className="farm-challenge-head">
            <span>
              🎄 Round {roundIndex + 1}/{GROVE_ROUNDS_PER_SET} · {score} pts — {round.start} lights on, {" "}
              <span className="fc-value">{round.add} more</span> needed. Which grab?
            </span>
            <button className="link-button" onClick={() => useGroveLights.getState().exit()}>
              Quit
            </button>
          </div>
          <div className="plank-pieces">
            {round.grabOptions.map((n) => (
              <button
                key={n}
                className="plank-piece-btn"
                onClick={(e) => {
                  e.currentTarget.blur();
                  useGroveLights.getState().chooseGrab(n);
                }}
              >
                {n} bundle{n === 1 ? "" : "s"} ({n * 10})
              </button>
            ))}
          </div>
        </div>
      )}

      {status === "adjusting" && round && grabResult && (
        <div className="farm-challenge-card">
          <div className={`farm-challenge-verdict ${grabResult.correct ? "good" : "warm"}`}>
            {grabResult.label}
            {!grabResult.correct && ` The quick grab was ${round.grabBundles} bundles (${round.grabValue}).`}
          </div>
          <div className="farm-challenge-line big">
            {round.grabBundles} bundles hung: {round.start} + {round.grabValue} ={" "}
            <span className="fc-value">{round.hung}</span>. The tree needed {round.add} more — what's the fix?
          </div>
          <div className="plank-pieces">
            {GROVE_ADJUSTMENTS.map((a) => (
              <button
                key={a.value}
                className="plank-piece-btn"
                onClick={(e) => {
                  e.currentTarget.blur();
                  useGroveLights.getState().chooseAdjust(a.value);
                }}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {status === "typing" && round && adjustResult && (
        <div className="farm-challenge-card">
          <div className={`farm-challenge-verdict ${adjustResult.correct ? "good" : "warm"}`}>
            {adjustResult.label}
            {!adjustResult.correct &&
              ` It needed: ${GROVE_ADJUSTMENTS.find((a) => a.value === round.adjust)?.label.toLowerCase()}.`}
          </div>
          <div className="farm-challenge-line big">
            {round.adjust < 0
              ? <>{round.hung} − {-round.adjust} — how many lights now?</>
              : round.adjust > 0
                ? <>{round.hung} + {round.adjust} — how many lights now?</>
                : <>So how many lights is that all together?</>}
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
            <span className="weigh-unit">lights</span>
            <button className="primary-button" onClick={submitTyped}>
              Check (+{GROVE_TOTAL_POINTS})
            </button>
          </div>
        </div>
      )}

      {status === "celebrate" && round && (
        <div className="farm-challenge-card mini">
          <div className="farm-challenge-head">
            <span>
              ✓ {round.start} + {round.grabValue}
              {round.adjust < 0 ? ` − ${-round.adjust}` : round.adjust > 0 ? ` + ${round.adjust}` : ""} = {round.total}! · {score} pts
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
                useGroveLights.getState().next();
              }}
            >
              {roundIndex + 1 < GROVE_ROUNDS_PER_SET ? "Next round (Enter)" : "Finish (Enter)"}
            </button>
          </div>
        </div>
      )}

      {status === "done" && (
        <div className="farm-challenge-card">
          <div className="farm-challenge-head">
            <span>🎄 Christmas Tree Grove — complete!</span>
          </div>
          <div className="farm-challenge-prompt">
            You scored {score} points. Best so far: {Math.max(bestScore, score)} points.
          </div>
          <div className="farm-challenge-buttons">
            <button className="primary-button" onClick={() => useGroveLights.getState().start()}>
              Play again
            </button>
            <button className="link-button" onClick={() => useGroveLights.getState().exit()}>
              Back to the snow
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
