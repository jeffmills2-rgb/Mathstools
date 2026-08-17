import React, { useEffect, useRef, useState } from "react";

import { useCaveCrystals } from "../game/caveCrystalsStore.js";
import { useSession, playerState } from "../game/sessionStore.js";
import {
  CAVE_ROUNDS_PER_SET,
  CAVE_ANSWER_POINTS,
  CAVE_GLOW_MS,
  CAVE_GLOW_TAIL_MS,
} from "../data/snow/caveCrystalsChallenge.js";

/**
 * THE ICE CAVE — 2D panel (IC). CHOOSE the direction (buttons or keys 1–2:
 * count up / count back), watch the crystals glow one beat at a time, then
 * TYPE the answer — how many glows (up) or where you landed (back). Wrong
 * answer → shake + the think-addition story. Esc quits.
 */

const CELEBRATE_MS = 2200;

export default function CaveCrystalsPanel() {
  const status = useCaveCrystals((s) => s.status);
  const roundIndex = useCaveCrystals((s) => s.roundIndex);
  const score = useCaveCrystals((s) => s.score);
  const bestScore = useCaveCrystals((s) => s.bestScore);
  const round = useCaveCrystals((s) => s.currentRound());
  const chooseResult = useCaveCrystals((s) => s.chooseResult);
  const typedCorrect = useCaveCrystals((s) => s.typedCorrect);
  const regionId = useSession((s) => s.currentRegionId);
  const [typed, setTyped] = useState("");
  const [inputWobble, setInputWobble] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (status !== "idle" && regionId !== "snow-sums") {
      useCaveCrystals.getState().exit();
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
      const st = useCaveCrystals.getState();
      if (e.key === "Escape") {
        st.exit();
        return;
      }
      const typingInField = e.target && /input|textarea/i.test(e.target.tagName || "");
      if (typingInField) return;
      if (st.status === "choosing") {
        if (e.key === "1") st.chooseDirection("up");
        if (e.key === "2") st.chooseDirection("back");
        return;
      }
      if (e.key !== "Enter") return;
      if (st.status === "intro") st.beginRounds();
      else if (st.status === "feedback" || st.status === "celebrate") st.next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status]);

  // The glows play one beat per crystal — then the typing box.
  useEffect(() => {
    if (status !== "lighting") return undefined;
    const r = useCaveCrystals.getState().currentRound();
    const ms = (r ? r.steps : 3) * CAVE_GLOW_MS + CAVE_GLOW_TAIL_MS;
    const t = setTimeout(() => useCaveCrystals.getState().finishLighting(), ms);
    return () => clearTimeout(t);
  }, [status, roundIndex]);

  useEffect(() => {
    if (status === "feedback") {
      playerState.camShake = { start: Date.now(), dur: 500 };
    }
  }, [status, roundIndex]);

  useEffect(() => {
    if (status !== "celebrate") return undefined;
    const t = setTimeout(() => useCaveCrystals.getState().next(), CELEBRATE_MS);
    return () => clearTimeout(t);
  }, [status, roundIndex]);

  if (status === "idle") return null;

  function submitTyped() {
    const result = useCaveCrystals.getState().submitAnswer(typed);
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
            <span>🌌 The Ice Cave</span>
          </div>
          <div className="farm-challenge-line big">
            Subtraction isn't always take-away — sometimes you <span className="fc-value">count UP</span>!
          </div>
          <div className="farm-challenge-line">
            Close numbers? Count up the tiny gap. Taking a tiny bit? Count back. Fewest glows wins.
          </div>
          <div className="farm-challenge-buttons">
            <button
              className="primary-button"
              onClick={(e) => {
                e.currentTarget.blur();
                useCaveCrystals.getState().beginRounds();
              }}
            >
              Start! (Enter)
            </button>
            <button className="link-button" onClick={() => useCaveCrystals.getState().exit()}>
              Quit
            </button>
          </div>
        </div>
      )}

      {status === "choosing" && round && (
        <div className="farm-challenge-card">
          <div className="farm-challenge-head">
            <span>
              🌌 Round {roundIndex + 1}/{CAVE_ROUNDS_PER_SET} · {score} pts —{" "}
              <span className="fc-value">{round.a} − {round.b}</span>. Which way lights fewer crystals?
            </span>
            <button className="link-button" onClick={() => useCaveCrystals.getState().exit()}>
              Quit
            </button>
          </div>
          <div className="plank-pieces">
            <button
              className="plank-piece-btn"
              onClick={(e) => {
                e.currentTarget.blur();
                useCaveCrystals.getState().chooseDirection("up");
              }}
            >
              ⬆ Count UP from {round.b}
            </button>
            <button
              className="plank-piece-btn"
              onClick={(e) => {
                e.currentTarget.blur();
                useCaveCrystals.getState().chooseDirection("back");
              }}
            >
              ⬇ Count BACK from {round.a}
            </button>
          </div>
        </div>
      )}

      {status === "lighting" && round && chooseResult && (
        <div className="farm-challenge-card mini">
          <div className="farm-challenge-head">
            <span>{chooseResult.label} — watch the wall…</span>
          </div>
        </div>
      )}

      {status === "typing" && round && (
        <div className="farm-challenge-card">
          <div className="farm-challenge-line big">
            {round.kind === "up"
              ? <>The glows climbed from {round.b} to {round.a} — <span className="fc-value">how many glows</span> is the answer!</>
              : <>{round.b} glows stepped back from {round.a} — <span className="fc-value">where you landed</span> is the answer!</>}
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
            <span className="weigh-unit">= {round.a} − {round.b}</span>
            <button className="primary-button" onClick={submitTyped}>
              Check (+{CAVE_ANSWER_POINTS})
            </button>
          </div>
        </div>
      )}

      {status === "celebrate" && round && (
        <div className="farm-challenge-card mini">
          <div className="farm-challenge-head">
            <span>
              ✓ {round.a} − {round.b} = {round.answer}! · {score} pts
            </span>
          </div>
        </div>
      )}

      {status === "feedback" && round && (
        <div className="farm-challenge-card">
          <div className="farm-challenge-verdict bad">
            {typedCorrect === false ? "Not the answer! +0 pts" : "+0 pts"}
          </div>
          <div className="farm-challenge-prompt">{round.reason}</div>
          <div className="farm-challenge-buttons">
            <button
              className="primary-button"
              onClick={(e) => {
                e.currentTarget.blur();
                useCaveCrystals.getState().next();
              }}
            >
              {roundIndex + 1 < CAVE_ROUNDS_PER_SET ? "Next round (Enter)" : "Finish (Enter)"}
            </button>
          </div>
        </div>
      )}

      {status === "done" && (
        <div className="farm-challenge-card">
          <div className="farm-challenge-head">
            <span>🌌 The Ice Cave — complete!</span>
          </div>
          <div className="farm-challenge-prompt">
            You scored {score} points. Best so far: {Math.max(bestScore, score)} points.
          </div>
          <div className="farm-challenge-buttons">
            <button className="primary-button" onClick={() => useCaveCrystals.getState().start()}>
              Play again
            </button>
            <button className="link-button" onClick={() => useCaveCrystals.getState().exit()}>
              Back to the snow
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
