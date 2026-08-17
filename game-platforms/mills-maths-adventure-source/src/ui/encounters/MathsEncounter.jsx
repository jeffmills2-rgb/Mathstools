import React, { useEffect, useRef, useState } from "react";

import { buildEncounterQuestions } from "../../maths/curriculum/curriculumRegistry.js";
import { buildMissionQuestions, missionCoversTopic } from "../../missions/missionEngine.js";
import { validateAnswerFormat } from "../../maths/helpers.js";
import { validateMathInput } from "../math-input/mathInputUtils.js";
import { answerModeOf, gradeAnswer, isAnswerReady, emptyValueFor } from "../../maths/answerModes.js";
import { useProgress } from "../../progress/store.js";
import { useSession } from "../../game/sessionStore.js";
import { useUI } from "../effects/uiStore.js";
import { announceResult } from "../effects/announce.js";
import { getBadge } from "../../data/badges.js";
import { scorePercent, bandMessage, resultTitle, isPass } from "../../missions/scoring.js";
import DiagramRenderer from "../diagrams/DiagramRenderer.jsx";
import QuestionPrompt from "../QuestionPrompt.jsx";
import AnswerRenderer from "../answer-modes/AnswerRenderer.jsx";
import TouchKeypad from "../TouchKeypad.jsx";
import CompletionScreen from "./CompletionScreen.jsx";
import { useResults } from "../../results/resultStore.js";
import { makeAttemptId } from "../../results/resultTypes.js";
import { routeForMission } from "../../data/topicWorldRoutes.js";
import { LONG_MISSION_THRESHOLD } from "../../data/missions.js";
import { useCloud } from "../../cloud/cloudSession.js";

// Enter checks the answer for these single-action modes; multiPart/table need
// an explicit Check click, and math mode lets the MathLive field handle Enter.
const ENTER_CHECK_MODES = new Set(["simple", "orderedList", "trueFalse", "comparison"]);

/**
 * MathsEncounter (wrapper) — owns the "Try again" retry: it re-mounts the run
 * with a fresh question set and resets mission progress so a failed attempt can
 * be retried cleanly.
 */
export default function MathsEncounter({ encounter }) {
  const [attempt, setAttempt] = useState(0);
  const resetMissionProgress = useProgress((s) => s.resetMissionProgress);
  const getActiveMission = useProgress((s) => s.getActiveMission);

  function retry() {
    if (getActiveMission()) resetMissionProgress();
    setAttempt((a) => a + 1);
  }

  return <MathsRun key={attempt} encounter={encounter} onRetry={retry} />;
}

// Small fixed bonus on top of the per-question XP (which scales with difficulty).
const COMPLETION_BONUS_XP = 10;
const COINS_PER_CORRECT = 5;

// A short "complete your answer" hint per mode (used to gate the Check button).
function readyHint(mode) {
  if (mode === "trueFalse") return "Choose True or False.";
  if (mode === "comparison") return "Choose <, > or =.";
  if (mode === "orderedList") return "Enter all the values, separated by commas.";
  if (mode === "multiPart") return "Answer every part (a, b, c…).";
  if (mode === "tableInput") return "Fill in every cell of the table.";
  if (mode === "ratio") return "Fill in every part of the ratio.";
  if (mode === "multipleChoice") return "Choose an answer.";
  return "Type an answer first.";
}

/**
 * MathsEncounter — runs a maths quiz.
 *
 * Questions now come from the CURRICULUM REGISTRY (Stage → Topic → Skill), so
 * each question carries rich metadata: topic/skill names, a 1–5 difficulty
 * level + label, an XP value that scales with difficulty, and an input mode.
 *
 * Difficulty is chosen per skill from the player's performance profile
 * (adaptive foundation); each answer is recorded back into that profile, which
 * nudges the working difficulty for next time. XP earned = sum of the xpValue
 * of correctly-answered questions (+ a small completion bonus).
 *
 * Input mode (simple box vs MathLive editor) and the Enter/E-key flow work
 * exactly as before — see the comments in the body.
 */
function MathsRun({ encounter, onRetry }) {
  const closeEncounter = useSession((s) => s.closeEncounter);
  const openEncounter = useSession((s) => s.openEncounter);
  const completeEncounter = useProgress((s) => s.completeEncounter);
  const recordSkillAttempt = useProgress((s) => s.recordSkillAttempt);
  const recordMissionAttempt = useProgress((s) => s.recordMissionAttempt);
  const finalizeActiveMission = useProgress((s) => s.finalizeActiveMission);
  const playSound = useUI((s) => s.playSound);
  const touchMode = useUI((s) => s.touchMode);

  // --- MISSION WIRING -------------------------------------------------------
  // Decide ONCE (at mount, non-reactively) whether this encounter is driven by
  // the active mission, and if so which mission filters to use:
  //   - config.useActiveMission → this IS the mission runner (whole mission)
  //   - otherwise, if a mission is active and covers this NPC's (stage, topic),
  //     the NPC's maths is filtered to that topic by the mission ("Fern pulls
  //     Stage 4 FDP from the selected skills"). Topics the mission doesn't cover
  //     fall back to the encounter's normal curriculum config.
  const [missionCtx] = useState(() => {
    const cfg = encounter.config;
    const active = useProgress.getState().getActiveMission();
    if (!active) return { mode: false };

    if (cfg.useActiveMission) {
      return { mode: true, mission: active, count: active.requiredQuestions ?? 5 };
    }
    if (cfg.stage && cfg.topicId && missionCoversTopic(active, cfg.stage, cfg.topicId)) {
      // Topic-scoped view of the mission so this NPC only asks its own topic,
      // but still respects the mission's selected skills + difficulty range.
      const scoped = { ...active, selectedTopics: [cfg.topicId] };
      return { mode: true, mission: scoped, count: cfg.questionCount ?? 5 };
    }
    return { mode: false };
  });

  // Build the question set once. Mission questions come from the mission filters
  // (respecting difficultyRange + adaptive); otherwise from the encounter config.
  const [questions] = useState(() => {
    if (missionCtx.mode) {
      return buildMissionQuestions(
        missionCtx.mission,
        missionCtx.count,
        (skillId) => useProgress.getState().getSkillProfile(skillId)
      );
    }
    return buildEncounterQuestions(encounter.config, (skillId) =>
      useProgress.getState().getWorkingDifficulty(skillId)
    );
  });

  const questionCount = questions.length || (encounter.config.questionCount ?? 5);

  const [index, setIndex] = useState(0);
  const [value, setValue] = useState(() => emptyValueFor(questions[0] || {}));
  const [lastGrade, setLastGrade] = useState(null);
  const [status, setStatus] = useState("answering"); // answering | correct | wrong
  const [validationMsg, setValidationMsg] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [reward, setReward] = useState(null);
  const [cloudStatus, setCloudStatus] = useState(null); // null|pending|saved|failed|demo|skipped

  const awardedRef = useRef(false);
  const earnedXpRef = useRef(0); // accumulates xpValue of correct answers
  const missionDoneRef = useRef(null); // set if the mission completes mid-encounter

  // Result capture (Phase 2L): one attempt id + start time per RUN. "Try again"
  // remounts MathsRun (key=attempt), so each attempt gets a fresh record.
  const startedAtRef = useRef(Date.now());
  const attemptIdRef = useRef(null);
  if (!attemptIdRef.current) attemptIdRef.current = makeAttemptId();
  const questionResultsRef = useRef([]);
  const savedRecordRef = useRef(null); // the normalised record after saving

  const question = questions[index] || {};
  const isLast = index + 1 >= questionCount;
  const mode = answerModeOf(question);

  function checkAnswer() {
    if (status !== "answering") return;

    // Must have a complete answer for this mode (no blank/partial submits).
    if (!isAnswerReady(question, value)) {
      setValidationMsg(readyHint(mode));
      return;
    }
    // Typed numeric/expression formats still get their format validation.
    if (mode === "simple") {
      const v = validateAnswerFormat(value);
      if (!v.valid) { setValidationMsg(v.message); return; }
    } else if (mode === "math") {
      const v = validateMathInput(value);
      if (!v.valid) { setValidationMsg(v.message); return; }
    }
    setValidationMsg("");

    const grade = gradeAnswer(question, value);
    setLastGrade(grade);
    const isCorrect = grade.correct;
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      earnedXpRef.current += question.xpValue || 0;
      playSound("correct");
    } else {
      playSound("wrong");
    }
    // Record the attempt against the question's skill (drives adaptive difficulty).
    if (question.skillId) recordSkillAttempt(question.skillId, isCorrect);

    // Mission-driven questions advance mission PROGRESS (display only). Whether
    // the mission completes is decided at the end based on the pass threshold.
    if (missionCtx.mode) {
      recordMissionAttempt(isCorrect, isCorrect ? question.xpValue || 0 : 0);
    }

    // Capture the question-level result (Phase 2L) — one push per question
    // (checkAnswer is guarded by status, so it can't double-record).
    questionResultsRef.current.push({
      questionId: question.id,
      text: question.text,
      topicId: question.topicId,
      skillId: question.skillId,
      difficultyLevel: question.difficultyLevel,
      requestedDifficultyLevel: question.requestedDifficultyLevel,
      actualDifficultyLevel: question.actualDifficultyLevel,
      answerMode: mode,
      studentAnswer: Array.isArray(value) ? value.join(" | ") : String(value),
      expectedAnswer: question.answer,
      acceptableAnswers: question.acceptableAnswers,
      correct: isCorrect,
      partResults: grade.partResults || null,
      diagramType: question.diagramType,
      legacyType: question.legacyType,
      sourceType: question.sourceType,
      feedback: question.feedback,
    });

    setStatus(isCorrect ? "correct" : "wrong");
  }

  function next() {
    if (isLast) {
      setFinished(true);
      return;
    }
    const nextQ = questions[index + 1] || {};
    setIndex((i) => i + 1);
    setValue(emptyValueFor(nextQ));
    setLastGrade(null);
    setStatus("answering");
    setValidationMsg("");
  }

  function handleEnter() {
    if (status === "answering") checkAnswer();
    else next();
  }
  const handleEnterRef = useRef(handleEnter);
  handleEnterRef.current = handleEnter;

  // Enter behaviour (Phase 2K): while answering, only single-action modes check
  // on Enter (multiPart/table need an explicit Check; math lets the MathLive
  // field handle Enter). Once answered, Enter advances for every mode.
  useEffect(() => {
    if (finished) return undefined;
    function onKeyDown(e) {
      if (e.key !== "Enter") return;
      if (status === "answering") {
        if (mode === "math") return; // MathLive field handles its own Enter
        if (!ENTER_CHECK_MODES.has(mode)) return; // don't submit mid multi-field
      }
      e.preventDefault();
      handleEnterRef.current();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [status, finished, mode]);

  // Finish: decide pass/fail, award participation XP always, and only complete
  // the challenge/mission (and grant the mission reward) on a PASS (Phase 2G).
  useEffect(() => {
    if (finished && !awardedRef.current) {
      awardedRef.current = true;
      const pct = scorePercent(correctCount, questionCount);
      const passed = isPass(correctCount, questionCount);
      // Correct-answer XP is always earned; the completion bonus only on a pass.
      const xp = earnedXpRef.current + (passed ? COMPLETION_BONUS_XP : 0);
      const coins = correctCount * COINS_PER_CORRECT;
      const result = completeEncounter({ encounterId: encounter.id, xp, coins, passed });
      setReward({ xp, coins, passed, scorePercent: pct, ...result });
      playSound(passed ? "complete" : "wrong");
      if (passed) announceResult(result);

      // Mission completion is decided here, gated by the pass threshold.
      if (missionCtx.mode) {
        const md = finalizeActiveMission({ correct: correctCount, total: questionCount });
        if (md.justCompleted) {
          missionDoneRef.current = md;
          const badge = md.badge ? getBadge(md.badge) : null;
          useUI.getState().pushToast({
            type: "quest",
            icon: badge ? badge.icon : "🎯",
            title: "Mission Complete!",
            message: badge ? `Badge earned: ${badge.badgeName}` : "Rewards granted",
          });
          playSound("questComplete");
        }
      }

      // Save the LOCAL attempt result (Phase 2L). Runs once per finished run
      // (awardedRef guard) — failed attempts are saved as status "failed" and
      // never complete the mission. Leaving mid-attempt never reaches here.
      saveAttemptResult({ pct, passed, xp, coins });

      // CLOUD dual-save (Phase 3B / 3B.1) — fire-and-forget; never blocks the
      // result screen. Local save above is the source of truth. ALL completed
      // attempts sync when registered (story is tagged missionKind:"story" by the
      // mapper and never feeds teacher tasks/summaries). Demo/skip stay local.
      const rec = savedRecordRef.current;
      const cloud = useCloud.getState();
      if (cloud.mode === "skip") {
        setCloudStatus("demo");
      } else if (cloud.mode === "registered" && rec) {
        setCloudStatus("pending");
        cloud.saveAttempt(rec).then((s) => setCloudStatus(s.status)).catch(() => setCloudStatus("failed"));
      } else {
        // Not signed in — local only, with a gentle "sign in to save online".
        setCloudStatus("unregistered");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  // Build + persist the attempt record from this run's questions/mission.
  function saveAttemptResult({ pct, passed, xp, coins }) {
    const m = missionCtx.mission;
    const topicIds = [...new Set(questions.map((q) => q.topicId).filter(Boolean))];
    const topicNames = topicIds.map((id) => (questions.find((q) => q.topicId === id) || {}).topicName || id);
    const skillIds = [...new Set(questions.map((q) => q.skillId).filter(Boolean))];
    const skillNames = skillIds.map((id) => (questions.find((q) => q.skillId === id) || {}).skillName || id);
    const profile = useProgress.getState().profile || {};
    savedRecordRef.current = useResults.getState().addResult({
      attemptId: attemptIdRef.current,
      missionId: m ? m.missionId : null,
      missionKind: m ? (m.kind || "practice") : "practice",
      // Teacher-assigned tasks carry the assignment id as taskId so the teacher
      // portal can match completion to a specific Adventure task (missionId ===
      // assignmentId for these). Null for story/free/preset missions.
      taskId: m && m.kind === "teacher" ? m.missionId : null,
      missionTitle: m ? m.title : (encounter.title || "Challenge"),
      studentName: profile.name || "Explorer",
      studentCode: profile.studentCode || null,
      classCode: profile.classCode || null,
      stage: questions[0]?.stage || (m && m.stages && m.stages[0]) || null,
      topicIds, topicNames, skillIds, skillNames,
      difficultyRange: m ? m.difficultyRange : null,
      adaptiveOn: m ? Boolean(m.adaptiveOn) : false,
      passThreshold: (m && m.passThreshold) || 0.6,
      questionCount,
      correctCount,
      percentage: pct,
      passed,
      startedAt: startedAtRef.current,
      completedAt: Date.now(),
      xpAwarded: xp,
      coinsAwarded: coins,
      badgeAwarded: (missionDoneRef.current && missionDoneRef.current.badge) || null,
      routedTarget: m && m.kind !== "story" ? routeForMission(m).targetId : null,
      questionResults: questionResultsRef.current,
    });
  }

  // On the result/mission-complete screen, Escape closes it (no progress to
  // lose — the challenge is finished), consistent with the other safe popups.
  useEffect(() => {
    if (!finished) return undefined;
    function onKey(e) {
      if (e.key === "Escape") closeEncounter();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finished, closeEncounter]);

  if (finished) {
    const pct = scorePercent(correctCount, questionCount);
    const passed = isPass(correctCount, questionCount);
    const md = missionDoneRef.current;
    const missionReward = md && md.justCompleted
      ? {
          title: missionCtx.mission?.title,
          badge: md.badge ? getBadge(md.badge) : null,
          rewardXP: md.rewardXP,
          rewardCoins: md.rewardCoins,
        }
      : null;
    // Teacher/free-choice missions get a fuller summary + a "Return to Mission
    // Board" option. Story (npc-*) missions keep the simple island flow.
    const m = missionCtx.mission;
    const isTeacherMission = missionCtx.mode && m && m.kind && m.kind !== "story";
    const missionSummary = isTeacherMission
      ? { title: m.title, topics: m.selectedTopics || [], skills: m.selectedSkills || [] }
      : null;
    const onBoard = isTeacherMission
      ? () => { closeEncounter(); openEncounter("mission-board"); }
      : null;
    const onViewResults = () => { closeEncounter(); useUI.getState().setResults(true); };
    return (
      <CompletionScreen
        title={resultTitle(passed)}
        subtitle={`${bandMessage(pct)}  (${correctCount} of ${questionCount} correct · ${pct}%)`}
        passed={passed}
        reward={reward || {}}
        missionReward={missionReward}
        missionSummary={missionSummary}
        savedRecord={savedRecordRef.current}
        cloudStatus={cloudStatus}
        onRetry={passed ? null : onRetry}
        onBoard={onBoard}
        onViewResults={onViewResults}
        onClose={closeEncounter}
      />
    );
  }

  function leaveWithConfirm() {
    const ok = window.confirm(
      "Leave this challenge? Your progress in this challenge will not be saved."
    );
    if (ok) closeEncounter();
  }

  return (
    <div className="modal-card">
      <button className="modal-close" onClick={leaveWithConfirm} title="Leave challenge" aria-label="Leave challenge">
        ✕
      </button>
      <div className="modal-header">
        <span className="modal-npc" style={{ color: "#2667cc" }}>
          {encounter.title}
        </span>
        <span className="modal-topic">{question.topicName}</span>
        {missionCtx.mode && (
          <span className="mission-chip" title={missionCtx.mission?.title}>
            🎯 Mission{missionCtx.mission?.adaptiveOn ? " · adaptive" : ""}
          </span>
        )}
        <span className={`difficulty-chip diff-level-${question.difficultyLevel}`}>
          {question.difficultyLabel} · +{question.xpValue} XP
        </span>
        <span className="modal-progress">
          Question {index + 1} of {questionCount}
        </span>
      </div>

      {/* Progress: dots for short missions; a clean bar for long ones. */}
      {questionCount > LONG_MISSION_THRESHOLD ? (
        <div className="q-progress-bar" aria-hidden="true">
          <div className="q-progress-fill" style={{ width: `${Math.round((index / questionCount) * 100)}%` }} />
        </div>
      ) : (
        <div className="q-dots" aria-hidden="true">
          {questions.map((_, i) => (
            <span key={i} className={`q-dot ${i < index ? "past" : ""} ${i === index ? "current" : ""}`} />
          ))}
        </div>
      )}

      <QuestionPrompt question={question} />

      {/* Optional figure for diagram-based questions (e.g. Area). Renders above
          the answer input and works with both simple and MathLive input. */}
      {question.diagramType && question.diagramData && (
        <DiagramRenderer question={question} />
      )}

      <AnswerRenderer
        question={question}
        value={value}
        onChange={(v) => { setValue(v); if (validationMsg) setValidationMsg(""); }}
        disabled={status !== "answering"}
        invalid={Boolean(validationMsg)}
        result={lastGrade}
        onMathEnter={() => handleEnterRef.current()}
        remountKey={index}
      />

      {/* On-screen keypad (W4-D): touch devices type numeric answers here instead
          of the OS keyboard. Only for the simple numeric mode while answering;
          math uses MathLive's own keyboard, and the button modes need none. */}
      {touchMode && mode === "simple" && status === "answering" && (
        <TouchKeypad
          onKey={(ch) => { setValue((v) => (v || "") + ch); if (validationMsg) setValidationMsg(""); }}
          onBackspace={() => { setValue((v) => (v || "").slice(0, -1)); if (validationMsg) setValidationMsg(""); }}
          onClear={() => { setValue(""); if (validationMsg) setValidationMsg(""); }}
        />
      )}

      {validationMsg && <div className="validation-msg">{validationMsg}</div>}

      {status === "correct" && (
        <div className="feedback correct pop">
          <span className="feedback-head">Correct{lastGrade && lastGrade.total > 1 ? ` — all ${lastGrade.total} parts!` : ""}</span>
          {question.feedback && <div className="feedback-work">{question.feedback}</div>}
        </div>
      )}
      {status === "wrong" && (
        <div className="feedback wrong pop">
          <span className="feedback-head">Let's look at this one</span>
          {lastGrade && lastGrade.total > 1 && (
            <div className="part-score">{lastGrade.correctCount} of {lastGrade.total} parts correct (all parts needed)</div>
          )}
          <div className="feedback-work">
            The answer is <strong>{question.answer}</strong>.
            {question.feedback && <div className="feedback-explain">{question.feedback}</div>}
          </div>
        </div>
      )}

      <div className="modal-actions">
        {status === "answering" ? (
          <button className="primary-button" onClick={checkAnswer}>
            Check
          </button>
        ) : (
          <button className="primary-button" onClick={next}>
            {isLast ? "Finish" : "Next →"}
          </button>
        )}
        <button className="link-button" onClick={closeEncounter}>
          Leave
        </button>
      </div>
    </div>
  );
}
