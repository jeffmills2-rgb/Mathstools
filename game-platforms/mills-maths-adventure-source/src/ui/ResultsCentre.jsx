import React, { useEffect, useState } from "react";

import { useUI } from "./effects/uiStore.js";
import { useResults } from "../results/resultStore.js";
import { useProgress } from "../progress/store.js";
import { decorateEarnedBadges, getBadge } from "../data/badges.js";
import { getMission } from "../data/missions.js";
import {
  sortByRecent,
  summariseByTopic,
  summariseBySkill,
  teacherSummary,
  studentProgress,
  overallSnapshot,
  hardestAnswerModes,
  repeatedFailures,
  lowTopics,
  suggestedNextStep,
  teacherReportText,
  answerModeSummary,
  toJSON,
  toCSV,
  toQuestionCSV,
} from "../results/resultUtils.js";
import { LOCAL_ONLY_WARNING } from "../classroom/pilotInfo.js";

/**
 * ResultsCentre (Phase 2L, polished in 2M) — a LOCAL attempt history + reporting
 * overlay. Not a teacher portal. Four views: recent attempts (+ per-question
 * detail), a topic/skill summary, a teacher-style report, and an encouraging
 * student progress view. Local JSON/CSV export + a copyable plain-English report.
 */
function fmtDate(ts) {
  if (!ts) return "—";
  try { return new Date(ts).toLocaleString(); } catch { return String(ts); }
}
function fmtShort(ts) {
  if (!ts) return "—";
  try { return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" }) + " " + new Date(ts).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }); }
  catch { return "—"; }
}
function download(filename, text, type) {
  try {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  } catch (err) { console.warn("download failed", err); }
}
function copyText(text, onDone) {
  try { if (navigator.clipboard) navigator.clipboard.writeText(text); onDone && onDone(); }
  catch { /* ignore */ }
}
function dash(v) { return v == null || v === "" ? "—" : v; }

const TABS = [
  ["attempts", "Recent attempts"],
  ["summary", "Topic & skill"],
  ["teacher", "Teacher report"],
  ["student", "Your progress"],
];

const EMPTY = {
  attempts: "No attempts yet. Complete a mission to see results here.",
  summary: "Skill summaries will appear after questions are completed.",
  teacher: "Teacher insights will appear after one or more attempts.",
  student: "Your progress card will grow as you complete missions.",
};

export default function ResultsCentre() {
  const open = useUI((s) => s.resultsOpen);
  const setOpen = useUI((s) => s.setResults);
  const results = useResults((s) => s.results);

  const earnedBadges = useProgress((s) => s.earnedBadges);
  const completedMissions = useProgress((s) => s.completedMissions);
  const profile = useProgress((s) => s.profile);

  const [tab, setTab] = useState("attempts");
  const [detailId, setDetailId] = useState(null);
  const [copied, setCopied] = useState("");
  // Simple local filters for the attempts list (Phase 2O classroom workflow).
  const [fTopic, setFTopic] = useState("");
  const [fKind, setFKind] = useState("");
  const [fName, setFName] = useState("");
  const [fResult, setFResult] = useState("");
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    function onKey(e) { if (e.key === "Escape") setOpen(false); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!open) return null;

  const recent = sortByRecent(results);
  const detail = detailId ? results.find((r) => r.attemptId === detailId) : null;
  const hasData = results.length > 0;

  // Filter options + filtered list for the attempts tab.
  const topicOptions = [...new Set(results.flatMap((r) => r.topicNames || []))].filter(Boolean).sort();
  const kindOptions = [...new Set(results.map((r) => r.missionKind).filter(Boolean))].sort();
  const filteredRecent = recent.filter((r) => {
    if (fTopic && !(r.topicNames || []).includes(fTopic)) return false;
    if (fKind && r.missionKind !== fKind) return false;
    if (fResult === "passed" && !r.passed) return false;
    if (fResult === "failed" && r.passed) return false;
    if (fName) {
      const hay = `${r.studentName || ""} ${r.studentCode || ""}`.toLowerCase();
      if (!hay.includes(fName.toLowerCase())) return false;
    }
    return true;
  });
  const filtersActive = fTopic || fKind || fName || fResult;

  function flash(label) { setCopied(label); setTimeout(() => setCopied(""), 1500); }

  return (
    <div className="results-overlay" onClick={() => setOpen(false)}>
      <div className="results-panel" onClick={(e) => e.stopPropagation()}>
        <div className="results-header">
          <h2>📊 Results Centre <span className="results-sub">local review</span></h2>
          <div className="results-header-actions">
            <div className="export-wrap">
              <button className="results-export" disabled={!hasData} onClick={() => setExportOpen((o) => !o)}>Export ▾</button>
              {exportOpen && hasData && (
                <div className="export-menu" onMouseLeave={() => setExportOpen(false)}>
                  <button onClick={() => { copyText(toJSON(results), () => flash("JSON copied")); setExportOpen(false); }}>{copied === "JSON copied" ? "Copied!" : "Copy JSON"}</button>
                  <button onClick={() => { download("mills-results.json", toJSON(results), "application/json"); setExportOpen(false); }}>Download JSON</button>
                  <button onClick={() => { download("mills-attempts.csv", toCSV(results), "text/csv"); setExportOpen(false); }}>Attempts CSV</button>
                  <button onClick={() => { download("mills-questions.csv", toQuestionCSV(results), "text/csv"); setExportOpen(false); }}>Questions CSV</button>
                </div>
              )}
            </div>
            <button className="dev-close" onClick={() => setOpen(false)}>✕</button>
          </div>
        </div>

        {hasData && <div className="results-local-warning">💾 {LOCAL_ONLY_WARNING}</div>}

        <div className="results-tabs">
          {TABS.map(([id, label]) => (
            <button key={id} className={`results-tab ${tab === id ? "active" : ""}`} onClick={() => { setTab(id); setDetailId(null); }}>
              {label}
            </button>
          ))}
        </div>

        <div className="results-body">
          {!hasData && tab !== "student" && <p className="results-empty">{EMPTY[tab]}</p>}

          {tab === "attempts" && hasData && !detail && (
            <>
              <div className="results-filters">
                <input className="filter-name" type="text" placeholder="Search name / code" value={fName} onChange={(e) => setFName(e.target.value)} />
                <select value={fTopic} onChange={(e) => setFTopic(e.target.value)}>
                  <option value="">All topics</option>
                  {topicOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={fKind} onChange={(e) => setFKind(e.target.value)}>
                  <option value="">All kinds</option>
                  {kindOptions.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
                <select value={fResult} onChange={(e) => setFResult(e.target.value)}>
                  <option value="">Pass + fail</option>
                  <option value="passed">Passed only</option>
                  <option value="failed">Failed only</option>
                </select>
                {filtersActive ? (
                  <button className="link-button nowrap" onClick={() => { setFTopic(""); setFKind(""); setFName(""); setFResult(""); }}>Clear</button>
                ) : null}
                <span className="filter-count">{filteredRecent.length} of {recent.length}</span>
              </div>
              {filteredRecent.length === 0
                ? <p className="results-empty">No attempts match these filters.</p>
                : <AttemptList recent={filteredRecent} onOpen={setDetailId} />}
            </>
          )}
          {tab === "attempts" && detail && <AttemptDetail attempt={detail} onBack={() => setDetailId(null)} />}

          {tab === "summary" && hasData && <TopicSkillSummary results={results} />}

          {tab === "teacher" && hasData && (
            <TeacherReport results={results} copied={copied} onCopy={() => copyText(teacherReportText(results), () => flash("report copied"))} />
          )}

          {tab === "student" && (
            <StudentProgressView
              results={results}
              earnedBadges={earnedBadges}
              completedMissions={completedMissions}
              studentName={profile?.name}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function pill(passed) {
  return <span className={`result-pill ${passed ? "pass" : "fail"}`}>{passed ? "passed" : "failed"}</span>;
}
function scoreClass(pct) {
  if (pct >= 80) return "score-high";
  if (pct >= 50) return "score-mid";
  return "score-low";
}

function AttemptList({ recent, onOpen }) {
  return (
    <div className="attempts-scroll">
      <table className="results-table attempts-table">
        <thead>
          <tr><th>When</th><th>Mission</th><th>Player</th><th>Topic</th><th className="ta-center">Score</th><th className="ta-center">Result</th><th>Kind</th><th></th></tr>
        </thead>
        <tbody>
          {recent.map((r) => {
            const badge = r.badgeAwarded ? getBadge(r.badgeAwarded) : null;
            return (
              <tr key={r.attemptId}>
                <td className="ta-when">{fmtShort(r.completedAt)}</td>
                <td className="ta-mission"><span className="ta-mission-title">{dash(r.missionTitle)}</span>{badge ? <span className="ta-badge" title={badge.badgeName}> {badge.icon}</span> : null}</td>
                <td>{dash(r.studentName)}</td>
                <td className="ta-topic">{(r.topicNames || []).join(", ") || "—"}</td>
                <td className="ta-center"><span className={`score-badge ${scoreClass(r.percentage)}`}>{r.percentage}%</span><span className="ta-frac">{r.correctCount}/{r.questionCount}</span></td>
                <td className="ta-center">{pill(r.passed)}</td>
                <td><span className={`kind-pill kind-${r.missionKind}`}>{r.missionKind}</span></td>
                <td className="ta-details"><button className="link-button nowrap" onClick={() => onOpen(r.attemptId)}>Details&nbsp;→</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function AttemptDetail({ attempt, onBack }) {
  const topicName = {};
  (attempt.topicIds || []).forEach((id, i) => { topicName[id] = (attempt.topicNames || [])[i] || id; });
  const skillName = {};
  (attempt.skillIds || []).forEach((id, i) => { skillName[id] = (attempt.skillNames || [])[i] || id; });
  const badge = attempt.badgeAwarded ? getBadge(attempt.badgeAwarded) : null;
  const dr = attempt.difficultyRange;

  return (
    <div className="attempt-detail">
      <button className="link-button nowrap" onClick={onBack}>←&nbsp;Back to attempts</button>

      <div className="ad-summary">
        <div className="ad-title-row">
          <h3>{dash(attempt.missionTitle)}</h3>
          {pill(attempt.passed)}
          <span className={`kind-pill kind-${attempt.missionKind}`}>{attempt.missionKind}</span>
        </div>
        <div className="ad-stat-grid">
          <div className="ad-stat"><span className={`ad-score ${scoreClass(attempt.percentage)}`}>{attempt.percentage}%</span><span className="ad-stat-label">{attempt.correctCount}/{attempt.questionCount} correct</span></div>
          <div className="ad-stat"><span className="ad-stat-val">{Math.round(attempt.passThreshold * 100)}%</span><span className="ad-stat-label">pass mark</span></div>
          <div className="ad-stat"><span className="ad-stat-val">{attempt.durationSeconds || 0}s</span><span className="ad-stat-label">time</span></div>
          <div className="ad-stat"><span className="ad-stat-val">{fmtShort(attempt.completedAt)}</span><span className="ad-stat-label">completed</span></div>
        </div>
        <div className="ad-meta">
          <span>Player: {dash(attempt.studentName)}{attempt.studentCode ? ` (${attempt.studentCode})` : ""}</span>
          <span>Topics: {(attempt.topicNames || []).join(", ") || "—"}</span>
          <span>Skills: {(attempt.skillNames || []).join(", ") || "—"}</span>
          {dr && <span>Difficulty {dr.min}–{dr.max}</span>}
          {attempt.adaptiveOn && <span>adaptive</span>}
          {badge && <span>🏅 {badge.badgeName}</span>}
        </div>
      </div>

      {(!attempt.questionResults || attempt.questionResults.length === 0) ? (
        <p className="results-empty">No per-question detail was recorded for this attempt.</p>
      ) : (
        <ol className="qresult-list">
          {attempt.questionResults.map((q, i) => (
            <li key={i} className={`qresult ${q.correct ? "ok" : "bad"}`}>
              <div className="qresult-top">
                <span className="qresult-num">Q{i + 1}</span>
                <span className="qresult-mark">{q.correct ? "✓" : "✗"}</span>
                <span className="qresult-text">{dash(q.text)}</span>
                <span className="qresult-mode">{q.answerMode || "simple"}</span>
              </div>
              <div className="qresult-answers">
                <span>Your answer: <code>{dash(q.studentAnswer)}</code></span>
                <span>Expected: <code>{dash(q.expectedAnswer)}</code></span>
              </div>
              {q.partResults && (
                <div className="qresult-parts">Parts: {q.partResults.map((p, j) => <span key={j} className={p ? "p-ok" : "p-bad"}>{p ? "✓" : "✗"}</span>)}</div>
              )}
              <div className="qresult-tags">
                {(topicName[q.topicId] || q.topicId) && <span>{topicName[q.topicId] || q.topicId}</span>}
                {(skillName[q.skillId] || q.skillId) && <span>{skillName[q.skillId] || q.skillId}</span>}
                {q.difficultyLevel != null && <span>Diff {q.difficultyLevel}</span>}
                {q.diagramType && <span>📐 {q.diagramType}</span>}
                {q.sourceType && <span>{q.sourceType}</span>}
              </div>
              {q.feedback && <div className="qresult-feedback">{q.feedback}</div>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function statusClass(status) {
  return "status-" + String(status).toLowerCase().replace(/\s+/g, "-");
}

function TopicSkillSummary({ results }) {
  const topics = summariseByTopic(results);
  const skills = summariseBySkill(results);
  return (
    <div className="summary-grid">
      <div>
        <h3 className="questlog-subhead">By topic</h3>
        <div className="attempts-scroll">
          <table className="results-table compact">
            <thead><tr><th>Topic</th><th>Att</th><th>Latest</th><th>Best</th><th>Avg</th><th>P/F</th><th>Status</th></tr></thead>
            <tbody>
              {topics.map((t) => (
                <tr key={t.topicId}>
                  <td>{dash(t.topicName)}</td><td>{t.attempts}</td><td>{t.latestScore}%</td><td>{t.bestScore}%</td><td>{t.avgPercentage}%</td>
                  <td>{t.passCount}/{t.failCount}</td>
                  <td><span className={`mastery ${statusClass(t.status)}`}>{t.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <h3 className="questlog-subhead">By skill</h3>
        <div className="attempts-scroll">
          <table className="results-table compact">
            <thead><tr><th>Skill</th><th>Qs</th><th>✓</th><th>Avg</th><th>Status</th></tr></thead>
            <tbody>
              {skills.map((s) => (
                <tr key={s.skillId}>
                  <td>{dash(s.skillName)}</td><td>{s.questions}</td><td>{s.correct}</td><td>{s.avgPercentage}%</td>
                  <td><span className={`mastery ${statusClass(s.status)}`}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TeacherReport({ results, onCopy, copied }) {
  const snap = overallSnapshot(results);
  const t = teacherSummary(results);
  const hard = hardestAnswerModes(results);
  const reps = repeatedFailures(results);
  const low = lowTopics(results);
  const next = suggestedNextStep(results);

  return (
    <div className="teacher-summary">
      <div className="teacher-top">
        <h3 className="questlog-subhead" style={{ margin: 0 }}>Local teaching report</h3>
        <button className="results-export" onClick={onCopy}>{copied === "report copied" ? "Copied!" : "📋 Copy teacher summary"}</button>
      </div>

      <div className="snapshot-cards">
        <div className="snap-card"><span className="snap-val">{snap.total}</span><span className="snap-label">attempts</span></div>
        <div className="snap-card ok"><span className="snap-val">{snap.passed}</span><span className="snap-label">passed</span></div>
        <div className="snap-card bad"><span className="snap-val">{snap.failed}</span><span className="snap-label">failed</span></div>
        <div className="snap-card"><span className="snap-val">{snap.avgPercentage}%</span><span className="snap-label">average</span></div>
        <div className="snap-card"><span className="snap-val">{snap.latest ? snap.latest.percentage + "%" : "—"}</span><span className="snap-label">latest</span></div>
      </div>

      {next && <div className="next-step">🧭 {next}</div>}

      <div className="teacher-cols">
        <div>
          <h4>Strong ✅</h4>
          {t.strongSkills.length ? <ul>{t.strongSkills.map((s) => <li key={s.skillId}>{s.skillName} ({s.avgPercentage}%)</li>)}</ul> : <p className="muted">None yet</p>}
        </div>
        <div>
          <h4>Developing 📈</h4>
          {t.developingSkills.length ? <ul>{t.developingSkills.map((s) => <li key={s.skillId}>{s.skillName} ({s.avgPercentage}%)</li>)}</ul> : <p className="muted">None</p>}
        </div>
        <div>
          <h4>Needs practice ⚠️</h4>
          {t.needPracticeSkills.length ? <ul>{t.needPracticeSkills.map((s) => <li key={s.skillId}>{s.skillName} ({s.avgPercentage}%)</li>)}</ul> : <p className="muted">None</p>}
        </div>
      </div>

      <div className="teacher-cols">
        <div>
          <h4>Answer-mode insight</h4>
          <ul>{hard.map((m) => <li key={m.answerMode}>{m.answerMode}: {m.avgPercentage}% ({m.correct}/{m.questions})</li>)}</ul>
        </div>
        <div>
          <h4>Mission insight</h4>
          {reps.length ? <ul>{reps.map((r) => <li key={r.title}>Repeated fail: {r.title} ×{r.count}</li>)}</ul> : <p className="muted">No repeated failures.</p>}
          {low.length ? <ul>{low.map((tp) => <li key={tp.topicId}>Low topic: {tp.topicName} ({tp.avgPercentage}%)</li>)}</ul> : <p className="muted">No low-scoring topics.</p>}
        </div>
      </div>

      <h4>Failed attempts ({t.failedAttempts.length})</h4>
      {t.failedAttempts.length ? (
        <ul>{t.failedAttempts.slice(0, 12).map((r) => <li key={r.attemptId}>{r.missionTitle} — {r.percentage}% ({(r.topicNames || []).join(", ")})</li>)}</ul>
      ) : <p className="muted">No failed attempts. 🎉</p>}
    </div>
  );
}

function topicMessage(t) {
  if (t.status === "Secure") return `${t.topicName} is looking secure — fantastic!`;
  if (t.status === "Developing") return `${t.topicName} is developing — try again to make it Secure.`;
  if (t.status === "Needs practice") return `${t.topicName} needs more practice — you can do it!`;
  return `${t.topicName} — give it a go!`;
}

function StudentProgressView({ results, earnedBadges, completedMissions, studentName }) {
  const badges = decorateEarnedBadges(earnedBadges || []);
  const prog = studentProgress(results, { studentName, badges, completedMissions });
  const recentByTime = [...prog.recent].sort((a, b) => (a.completedAt || 0) - (b.completedAt || 0));
  const best = results.length ? Math.max(...results.map((r) => r.percentage)) : 0;
  let trend = null;
  if (recentByTime.length >= 2) {
    const diff = recentByTime[recentByTime.length - 1].percentage - recentByTime[recentByTime.length - 2].percentage;
    trend = diff > 0 ? "up" : diff < 0 ? "down" : "flat";
  }

  if (!results.length && badges.length === 0 && (completedMissions || []).length === 0) {
    return <p className="results-empty">Your progress card will grow as you complete missions. Go and find Pip, Fern or Alby!</p>;
  }

  return (
    <div className="student-progress">
      <p className="student-hello">
        Great work, {prog.studentName}! You've completed <strong>{prog.attemptCount}</strong> challenge{prog.attemptCount === 1 ? "" : "s"}.
        {results.length > 0 && <> Your best result so far is <strong>{best}%</strong>.</>}
        {trend === "up" && <> 📈 You're improving — keep it up!</>}
        {trend === "down" && <> Don't worry about a dip — try again to bounce back!</>}
      </p>

      <h3 className="questlog-subhead">🏅 Badges ({badges.length})</h3>
      <div className="badge-row">
        {badges.length ? badges.map((b) => <span key={b.badgeId} className="badge-chip" title={b.description}>{b.icon} {b.badgeName}</span>) : <span className="muted">No badges yet — keep going!</span>}
      </div>

      <h3 className="questlog-subhead">✅ Completed missions</h3>
      <div className="badge-row">
        {(completedMissions || []).length ? (completedMissions || []).map((id) => {
          const m = getMission(id);
          return <span key={id} className="mission-chip-static">{m ? m.title : id}</span>;
        }) : <span className="muted">None yet</span>}
      </div>

      <h3 className="questlog-subhead">🎯 Your topics</h3>
      <div className="mastery-cards">
        {prog.topicSummary.length ? prog.topicSummary.map((t) => (
          <div key={t.topicId} className={`mastery-card ${statusClass(t.status)}`}>
            <div className="mc-top"><span className="mc-topic">{t.topicName}</span><span className={`mastery ${statusClass(t.status)}`}>{t.status}</span></div>
            <div className="mc-best">Best {t.bestScore}% · {t.attempts} attempt{t.attempts === 1 ? "" : "s"}</div>
            <div className="mc-msg">{topicMessage(t)}</div>
          </div>
        )) : <span className="muted">Play a challenge to see your progress.</span>}
      </div>

      {prog.recent.length > 0 && (
        <>
          <h3 className="questlog-subhead">🕑 Recent</h3>
          <ul className="student-recent">
            {prog.recent.map((r) => (
              <li key={r.attemptId}>{r.missionTitle} — you scored {r.percentage}% {r.passed ? "✓ passed" : "· keep trying!"}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
