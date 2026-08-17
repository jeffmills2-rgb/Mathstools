import React, { useEffect, useRef, useState } from "react";

import { useLodgeYard } from "../game/lodgeYardStore.js";
import { useSession, playerState } from "../game/sessionStore.js";
import {
  YARD_ROUNDS_PER_SET,
  YARD_ONES_POINTS,
  YARD_TENS_POINTS,
  YARD_CHANGE_POINTS,
} from "../data/snow/lodgeYardChallenge.js";

/**
 * THE LODGE YARD — 2D panel (LY). Three quick typed hops per round: the
 * ONES hop to the next ten, the TENS hop to 100, then the whole change —
 * each landing on the hundred-bead board as it's answered. Zero is
 * sometimes the right hop! Wrong change → shake + the friends-of-100
 * story. Esc quits; leaving the snow world exits.
 */

const CELEBRATE_MS = 2200;

export default function LodgeYardPanel() {
  const status = useLodgeYard((s) => s.status);
  const roundIndex = useLodgeYard((s) => s.roundIndex);
  const score = useLodgeYard((s) => s.score);
  const bestScore = useLodgeYard((s) => s.bestScore);
  const round = useLodgeYard((s) => s.currentRound());
  const onesResult = useLodgeYard((s) => s.onesResult);
  const tensResult = useLodgeYard((s) => s.tensResult);
  const typedCorrect = useLodgeYard((s) => s.typedCorrect);
  const regionId = useSession((s) => s.currentRegionId);
  const [typed, setTyped] = useState("");
  const [inputWobble, setInputWobble] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (status !== "idle" && regionId !== "snow-sums") {
      useLodgeYard.getState().exit();
    }
  }, [status, regionId]);

  // Fresh input + autofocus at each typed step.
  useEffect(() => {
    if (status === "ones" || status === "tens" || status === "typing") {
      setTyped("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [status, roundIndex]);

  useEffect(() => {
    if (status === "idle") return undefined;
    function onKey(e) {
      const st = useLodgeYard.getState();
      if (e.key === "Escape") {
        st.exit();
        return;
      }
      const typingInField = e.target && /input|textarea/i.test(e.target.tagName || "");
      if (e.key !== "Enter" || typingInField) return;
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
    const t = setTimeout(() => useLodgeYard.getState().next(), CELEBRATE_MS);
    return () => clearTimeout(t);
  }, [status, roundIndex]);

  if (status === "idle") return null;

  function wobble() {
    setInputWobble(true);
    setTimeout(() => setInputWobble(false), 400);
    inputRef.current?.focus();
  }

  function submitCurrent() {
    const st = useLodgeYard.getState();
    let result = "invalid";
    if (st.status === "ones") result = st.submitOnes(typed);
    else if (st.status === "tens") result = st.submitTens(typed);
    else if (st.status === "typing") result = st.submitChange(typed);
    if (result === "invalid") wobble();
  }

  return (
    <div className="farm-challenge-panel">
      {status === "intro" && (
        <div className="farm-challenge-card">
          <div className="farm-challenge-head">
            <span>☕ The Lodge Yard</span>
          </div>
          <div className="farm-challenge-line big">
            Pay with a <span className="fc-value">100-token</span> — count the change UP in two hops!
          </div>
          <div className="farm-challenge-line">
            First hop to the next ten, then hop to 100. Careful: sometimes a hop is ZERO.
          </div>
          <div className="farm-challenge-buttons">
            <button
              className="primary-button"
              onClick={(e) => {
                e.currentTarget.blur();
                useLodgeYard.getState().beginRounds();
              }}
            >
              Start! (Enter)
            </button>
            <button className="link-button" onClick={() => useLodgeYard.getState().exit()}>
              Quit
            </button>
          </div>
        </div>
      )}

      {(status === "ones" || status === "tens" || status === "typing") && round && (
        <div className="farm-challenge-card">
          <div className="farm-challenge-head">
            <span>
              ☕ Round {roundIndex + 1}/{YARD_ROUNDS_PER_SET} · {score} pts — cocoa costs{" "}
              <span className="fc-value">{round.price}</span>, paid with 100.
            </span>
            <button className="link-button" onClick={() => useLodgeYard.getState().exit()}>
              Quit
            </button>
          </div>
          {status === "tens" && onesResult && (
            <div className={`farm-challenge-verdict ${onesResult.correct ? "good" : "warm"}`}>
              {onesResult.correct
                ? `+${round.onesHop} → ${round.afterOnes} ✓ (+${YARD_ONES_POINTS} pts)`
                : `The ones hop was ${round.onesHop}: ${round.price} + ${round.onesHop} → ${round.afterOnes}.`}
            </div>
          )}
          {status === "typing" && tensResult && (
            <div className={`farm-challenge-verdict ${tensResult.correct ? "good" : "warm"}`}>
              {tensResult.correct
                ? `+${round.tensHop} → 100 ✓ (+${YARD_TENS_POINTS} pts)`
                : `The tens hop was ${round.tensHop}: ${round.afterOnes} + ${round.tensHop} → 100.`}
            </div>
          )}
          <div className="farm-challenge-line big">
            {status === "ones" && (
              <>
                Hop 1: {round.price} + <span className="fc-value">?</span> lands on the next ten (0 if it's there!)
              </>
            )}
            {status === "tens" && (
              <>
                Hop 2: {round.afterOnes} + <span className="fc-value">?</span> lands on 100
              </>
            )}
            {status === "typing" && (
              <>
                So the whole change is <span className="fc-value">?</span>
              </>
            )}
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
              onKeyDown={(e) => e.key === "Enter" && submitCurrent()}
            />
            <span className="weigh-unit">tokens</span>
            <button className="primary-button" onClick={submitCurrent}>
              {status === "ones"
                ? `Hop! (+${YARD_ONES_POINTS})`
                : status === "tens"
                  ? `Hop! (+${YARD_TENS_POINTS})`
                  : `Change! (+${YARD_CHANGE_POINTS})`}
            </button>
          </div>
        </div>
      )}

      {status === "celebrate" && round && (
        <div className="farm-challenge-card mini">
          <div className="farm-challenge-head">
            <span>
              ✓ 100 − {round.price} = {round.change} — enjoy the cocoa! · {score} pts
            </span>
          </div>
        </div>
      )}

      {status === "feedback" && round && (
        <div className="farm-challenge-card">
          <div className="farm-challenge-verdict bad">
            {typedCorrect === false ? "Not the change! +0 pts" : "+0 pts"}
          </div>
          <div className="farm-challenge-prompt">{round.reason}</div>
          <div className="farm-challenge-buttons">
            <button
              className="primary-button"
              onClick={(e) => {
                e.currentTarget.blur();
                useLodgeYard.getState().next();
              }}
            >
              {roundIndex + 1 < YARD_ROUNDS_PER_SET ? "Next round (Enter)" : "Finish (Enter)"}
            </button>
          </div>
        </div>
      )}

      {status === "done" && (
        <div className="farm-challenge-card">
          <div className="farm-challenge-head">
            <span>☕ The Lodge Yard — complete!</span>
          </div>
          <div className="farm-challenge-prompt">
            You scored {score} points. Best so far: {Math.max(bestScore, score)} points.
          </div>
          <div className="farm-challenge-buttons">
            <button className="primary-button" onClick={() => useLodgeYard.getState().start()}>
              Play again
            </button>
            <button className="link-button" onClick={() => useLodgeYard.getState().exit()}>
              Back to the snow
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
