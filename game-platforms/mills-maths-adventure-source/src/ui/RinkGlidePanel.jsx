import React, { useEffect } from "react";

import { useRinkGlide } from "../game/rinkGlideStore.js";
import { useSession, playerState } from "../game/sessionStore.js";
import {
  RINK_ROUNDS_PER_SET,
  RINK_MAX_QUEUE,
  RINK_PUSH_MS,
  RINK_GLIDE_TAIL_MS,
} from "../data/snow/rinkGlideChallenge.js";

/**
 * ICE RINK — 2D panel (RG). PLAN a queue of pushes with the big buttons
 * (or the arrow keys: ↑ +10, → +1, ↓ −10, ← −1), Backspace undoes, then GO —
 * the penguin skates the jumps and the landing is graded (exact land 15 +
 * fewest-pushes bonus 10/6/3). Wrong landing → camera shake + the fewest-
 * pushes route on the reason card. Esc quits; leaving the snow world exits.
 */

const CELEBRATE_MS = 2200;

const PUSH_LABEL = { 10: "+10", 1: "+1", "-10": "−10", "-1": "−1" };
const PUSH_KEYS = { ArrowUp: 10, ArrowRight: 1, ArrowDown: -10, ArrowLeft: -1 };

export default function RinkGlidePanel() {
  const status = useRinkGlide((s) => s.status);
  const roundIndex = useRinkGlide((s) => s.roundIndex);
  const score = useRinkGlide((s) => s.score);
  const bestScore = useRinkGlide((s) => s.bestScore);
  const round = useRinkGlide((s) => s.currentRound());
  const queue = useRinkGlide((s) => s.queue);
  const landResult = useRinkGlide((s) => s.landResult);
  const regionId = useSession((s) => s.currentRegionId);

  // Leaving the snow world ends the challenge.
  useEffect(() => {
    if (status !== "idle" && regionId !== "snow-sums") {
      useRinkGlide.getState().exit();
    }
  }, [status, regionId]);

  // Keys: Esc quits; Enter starts/goes/advances; arrows queue; Backspace undoes.
  useEffect(() => {
    if (status === "idle") return undefined;
    function onKey(e) {
      const st = useRinkGlide.getState();
      if (e.key === "Escape") {
        st.exit();
        return;
      }
      const typingInField = e.target && /input|textarea/i.test(e.target.tagName || "");
      if (typingInField) return;
      if (st.status === "planning") {
        const push = PUSH_KEYS[e.key];
        const r = st.currentRound();
        if (push !== undefined && r && r.buttons.includes(push)) {
          e.preventDefault();
          st.addPush(push);
          return;
        }
        if (e.key === "Backspace") {
          e.preventDefault();
          st.undoPush();
          return;
        }
      }
      if (e.key !== "Enter") return;
      if (st.status === "intro") st.beginRounds();
      else if (st.status === "planning") st.go();
      else if (st.status === "feedback" || st.status === "celebrate") st.next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status]);

  // The glide plays for one beat per push — then grade it.
  useEffect(() => {
    if (status !== "gliding") return undefined;
    const ms = useRinkGlide.getState().queue.length * RINK_PUSH_MS + RINK_GLIDE_TAIL_MS;
    const t = setTimeout(() => useRinkGlide.getState().finishGlide(), ms);
    return () => clearTimeout(t);
  }, [status, roundIndex]);

  // Missed landing → shake.
  useEffect(() => {
    if (status === "feedback") {
      playerState.camShake = { start: Date.now(), dur: 500 };
    }
  }, [status, roundIndex]);

  // Celebrate → auto-next.
  useEffect(() => {
    if (status !== "celebrate") return undefined;
    const t = setTimeout(() => useRinkGlide.getState().next(), CELEBRATE_MS);
    return () => clearTimeout(t);
  }, [status, roundIndex]);

  if (status === "idle") return null;

  return (
    <div className="farm-challenge-panel">
      {status === "intro" && (
        <div className="farm-challenge-card">
          <div className="farm-challenge-head">
            <span>⛸️ The Ice Rink</span>
          </div>
          <div className="farm-challenge-line big">
            The rink is a giant <span className="fc-value">number line</span> — glide the penguin to the fish bucket!
          </div>
          <div className="farm-challenge-line">
            Queue your pushes, then GO. Land exactly = 15 pts. Fewest pushes = +10 more — big jumps beat little shoves!
          </div>
          <div className="farm-challenge-buttons">
            <button
              className="primary-button"
              onClick={(e) => {
                e.currentTarget.blur();
                useRinkGlide.getState().beginRounds();
              }}
            >
              Start! (Enter)
            </button>
            <button className="link-button" onClick={() => useRinkGlide.getState().exit()}>
              Quit
            </button>
          </div>
        </div>
      )}

      {status === "planning" && round && (
        <div className="farm-challenge-card">
          <div className="farm-challenge-head">
            <span>
              ⛸️ Round {roundIndex + 1}/{RINK_ROUNDS_PER_SET} · {score} pts — glide{" "}
              <span className="fc-value">{round.start}</span> → <span className="fc-value">{round.target}</span>
            </span>
            <button className="link-button" onClick={() => useRinkGlide.getState().exit()}>
              Quit
            </button>
          </div>
          <div className="plank-pieces">
            {round.buttons.map((b) => (
              <button
                key={b}
                className="plank-piece-btn"
                disabled={queue.length >= RINK_MAX_QUEUE}
                onClick={(e) => {
                  e.currentTarget.blur();
                  useRinkGlide.getState().addPush(b);
                }}
              >
                {PUSH_LABEL[b]}
              </button>
            ))}
            <button
              className="plank-piece-btn"
              disabled={queue.length === 0}
              onClick={(e) => {
                e.currentTarget.blur();
                useRinkGlide.getState().undoPush();
              }}
            >
              ⌫ Undo
            </button>
          </div>
          <div className="farm-challenge-line">
            {queue.length === 0 ? (
              <>Plan the glide (↑ +10 · → +1{round.four ? " · ↓ −10 · ← −1" : ""})…</>
            ) : (
              <>
                {queue.map((v, i) => (
                  <span key={i} className="fc-value">{PUSH_LABEL[v]}</span>
                ))}{" "}
                — {queue.length} push{queue.length === 1 ? "" : "es"}
              </>
            )}
          </div>
          <div className="farm-challenge-buttons">
            <button
              className="primary-button"
              disabled={queue.length === 0}
              onClick={(e) => {
                e.currentTarget.blur();
                useRinkGlide.getState().go();
              }}
            >
              GO! (Enter)
            </button>
          </div>
        </div>
      )}

      {status === "gliding" && round && (
        <div className="farm-challenge-card mini">
          <div className="farm-challenge-head">
            <span>⛸️ Gliding… {queue.length} push{queue.length === 1 ? "" : "es"} queued</span>
          </div>
        </div>
      )}

      {status === "celebrate" && round && landResult && (
        <div className="farm-challenge-card mini">
          <div className="farm-challenge-head">
            <span>
              ✓ Landed on {round.target} in {landResult.pushes} — {landResult.effLabel} +{landResult.points} pts · {score} pts
            </span>
          </div>
        </div>
      )}

      {status === "feedback" && round && landResult && (
        <div className="farm-challenge-card">
          <div className="farm-challenge-verdict bad">
            Slid to {landResult.finalValue} — not {round.target}! +0 pts
          </div>
          <div className="farm-challenge-prompt">{round.reason}</div>
          <div className="farm-challenge-buttons">
            <button
              className="primary-button"
              onClick={(e) => {
                e.currentTarget.blur();
                useRinkGlide.getState().next();
              }}
            >
              {roundIndex + 1 < RINK_ROUNDS_PER_SET ? "Next round (Enter)" : "Finish (Enter)"}
            </button>
          </div>
        </div>
      )}

      {status === "done" && (
        <div className="farm-challenge-card">
          <div className="farm-challenge-head">
            <span>⛸️ The Ice Rink — complete!</span>
          </div>
          <div className="farm-challenge-prompt">
            You scored {score} points. Best so far: {Math.max(bestScore, score)} points.
          </div>
          <div className="farm-challenge-buttons">
            <button className="primary-button" onClick={() => useRinkGlide.getState().start()}>
              Play again
            </button>
            <button className="link-button" onClick={() => useRinkGlide.getState().exit()}>
              Back to the snow
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
