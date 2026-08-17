/**
 * MMT Platform — shared result helpers (Phase 4A). PURE (no Firebase / DOM):
 * normalise compact `achievements` records, compute summary stats, build CSV +
 * copy-summary text. Used by both the Student and Teacher platforms.
 */
import { toolIdForAchievement } from "./mmtToolRegistry.js";

export function num(v, d = 0) { const n = Number(v); return Number.isFinite(n) ? n : d; }

/** ms since epoch for a record's date-ish fields (newest-first sorting). */
export function recordTime(r = {}) {
  const c = r.createdAt;
  if (c && typeof c.toMillis === "function") { try { return c.toMillis(); } catch { /* noop */ } }
  if (c && typeof c.seconds === "number") return c.seconds * 1000;
  const s = r.createdAtClient || r.dateISO || r.date || r.timestamp;
  const t = s ? Date.parse(s) : NaN;
  return Number.isFinite(t) ? t : 0;
}

export function formatDate(r) {
  const t = recordTime(r);
  if (!t) return "—";
  try { return new Date(t).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); }
  catch { return new Date(t).toISOString().slice(0, 10); }
}

/** Canonical view of one compact achievement record. */
export function normaliseAchievement(r = {}) {
  const total = num(r.total);
  const score = num(r.score);
  const percent = r.percent != null ? num(r.percent) : (total ? Math.round((score / total) * 100) : 0);
  return {
    id: r.id || null,
    studentCode: r.studentCode || r.code || "",
    studentName: r.studentName || r.name || "",
    className: r.className || "",
    teacherCode: r.teacherCode || "",
    teacherName: r.teacherName || r.teacher || "",
    school: r.school || "",
    tool: r.tool || r.toolName || "",
    toolId: toolIdForAchievement(r),
    topic: r.topic || r.masteryTopic || "",
    missionKind: r.missionKind || "",
    score, total, percent,
    xpEarned: num(r.xpEarned),
    time: recordTime(r),
    dateLabel: formatDate(r),
    raw: r,
  };
}

/** Summary stats over a list of normalised records. */
export function summarise(records = []) {
  const n = records.length;
  const totalXp = records.reduce((a, r) => a + num(r.xpEarned), 0);
  const avg = n ? Math.round(records.reduce((a, r) => a + num(r.percent), 0) / n) : 0;
  const best = records.reduce((m, r) => Math.max(m, num(r.percent)), 0);
  return { attempts: n, averagePercent: avg, bestPercent: best, totalXp };
}

/** Per-student rollup for the teacher table. */
export function rollupByStudent(records = []) {
  const map = new Map();
  for (const r of records) {
    const key = r.studentCode || r.studentName || "?";
    if (!map.has(key)) map.set(key, { studentCode: r.studentCode, studentName: r.studentName, className: r.className, items: [] });
    map.get(key).items.push(r);
  }
  return [...map.values()].map((s) => {
    const items = s.items.sort((a, b) => b.time - a.time);
    const sum = summarise(items);
    return {
      studentCode: s.studentCode, studentName: s.studentName, className: s.className,
      attempts: sum.attempts, averagePercent: sum.averagePercent, bestPercent: sum.bestPercent,
      latest: items[0] || null, lastActive: items[0] ? items[0].dateLabel : "—",
      needsSupport: sum.attempts > 0 && sum.averagePercent < 50,
    };
  }).sort((a, b) => (a.className || "").localeCompare(b.className || "") || (a.studentName || "").localeCompare(b.studentName || ""));
}

const CSV_COLS = ["studentName", "studentCode", "className", "tool", "topic", "missionKind", "score", "total", "percent", "xpEarned", "dateLabel"];

export function toCSV(records = []) {
  const esc = (v) => { const s = String(v ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const head = CSV_COLS.join(",");
  const rows = records.map((r) => CSV_COLS.map((c) => esc(r[c])).join(","));
  return [head, ...rows].join("\n");
}

export function summaryText(records = [], heading = "MMT Results Summary") {
  const s = summarise(records);
  return [
    heading,
    `Attempts: ${s.attempts}`,
    `Average: ${s.averagePercent}%`,
    `Best: ${s.bestPercent}%`,
    `Total XP: ${s.totalXp}`,
  ].join("\n");
}
