/**
 * MMT EARLY SUBMIT — lets a student who has run out of time submit the work
 * they HAVE done, instead of losing it because the quiz only saves on the last
 * question.
 *
 * A quiz registers two things: how to read its own progress, and its existing
 * finish function. This module owns everything else — the button, the confirm
 * dialog, the partial-record fields and the coverage maths — so the behaviour
 * is identical across every quiz on the site.
 *
 *   import { MMTSubmit } from "/portal/shared/earlySubmit.js";   // or window.MMTSubmit
 *
 *   MMTSubmit.register({
 *     progress: () => ({ attempted: qIndex, correct: score, quizLength: QUIZ_LEN }),
 *     finish:   () => showCertificate()
 *   });
 *
 * `attempted` counts only questions the student has FINISHED with — never the
 * one currently on screen. `correct` is the marks earned in those questions and
 * `quizLength` the marks the whole quiz was offering, so a quiz scoring two
 * marks per question reports both in marks and the percentages still work.
 *
 * On submit this module sets the effective total, calls the quiz's own finish
 * function, and the quiz's existing save path reports `MMTSubmit.total()` in
 * place of its hard-coded length. It never saves by itself — the quiz's own
 * MMTSave / saveAchievement call still does that, so demo mode, error handling
 * and the certificate screen all behave exactly as they already do.
 */

const COVERAGE_FLOOR = 50;   // below this, a partial result can't earn mastery
const UIFONT = "system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

let cfg = null;              // { progress, finish, label, minAttempts }
let partial = false;         // true once an early submit has been made
let snapshot = null;         // the progress reading taken at submit time
let btn = null;
let submitted = false;

function esc(s){
  return String(s == null ? "" : s)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function read(){
  if (!cfg) return null;
  let p;
  try { p = cfg.progress() || {}; } catch (e) { return null; }
  const quizLength = Math.max(0, Number(p.quizLength) || 0);
  const attempted  = Math.max(0, Math.min(Number(p.attempted) || 0, quizLength || Infinity));
  const correct    = Math.max(0, Math.min(Number(p.correct) || 0, attempted));
  return { attempted, correct, quizLength };
}

/* ---- what the quiz asks us for ------------------------------------------ */

/** The denominator the quiz should report: attempted after an early submit,
 *  its own full length otherwise. */
function total(){
  if (partial && snapshot) return snapshot.attempted;
  const p = read();
  return p ? p.quizLength : 0;
}

/** The extra fields that describe the shape of the attempt. Spread this into
 *  the payload the quiz already builds — on a normal finish it marks the record
 *  complete, so every achievement carries the same shape. */
function fields(){
  const p = (partial && snapshot) ? snapshot : read();
  if (!p) return { completion: "complete" };
  const attempted = partial ? p.attempted : p.quizLength;
  const coverage  = p.quizLength ? Math.round((attempted / p.quizLength) * 100) : 100;
  return {
    completion: partial ? "partial" : "complete",
    quizLength: p.quizLength,
    attempted,
    coverage,
    countsToMastery: coverage >= COVERAGE_FLOOR
  };
}

/** Scale an XP figure by how much of the quiz was actually attempted, so three
 *  right answers earn three answers' worth of XP rather than fifteen's. */
function scaleXP(xp){
  const n = Number(xp) || 0;
  if (!partial || !snapshot || !snapshot.quizLength) return n;
  return Math.round(n * (snapshot.attempted / snapshot.quizLength));
}

function isPartial(){ return partial; }

/* ---- the button --------------------------------------------------------- */

function paint(){
  if (!btn) return;
  const p = read();
  const ready = !!p && p.attempted >= minAttempts() && !submitted;
  btn.disabled = !ready;
  btn.style.opacity = ready ? "1" : ".45";
  btn.style.cursor = ready ? "pointer" : "not-allowed";
  btn.title = ready
    ? "Submit the questions you've finished"
    : "Finish at least one question first";
}

/** Where the button goes, in order of preference: a slot the quiz provides for
 *  it, the slot the sign-in chip already uses (every platform-template quiz has
 *  one, and it sits in the page's own header), or pinned as a last resort. */
function findSlot(){
  return document.getElementById("mmtSubmitSlot")
      || document.getElementById("mmtAuthSlot")
      || null;
}

function ensureButton(){
  if (btn) return btn;
  const slot = findSlot();
  btn = document.createElement("button");
  btn.type = "button";
  btn.id = "mmtSubmitBtn";
  btn.textContent = cfg.label || "Finish & submit";
  btn.style.cssText =
    "display:inline-flex;align-items:center;gap:7px;font-family:" + UIFONT +
    ";font-weight:900;font-size:13px;line-height:1;white-space:nowrap;border:none;" +
    "border-radius:999px;padding:9px 15px;background:#f59e0b;color:#1f2937;" +
    (slot ? "margin-right:8px;" : "position:fixed;top:10px;left:10px;z-index:40;");
  btn.addEventListener("click", confirmSubmit);
  (slot || document.body).appendChild(btn);
  paint();
  return btn;
}

/* ---- the confirm dialog ------------------------------------------------- */

function minAttempts(){ return cfg && cfg.minAttempts != null ? cfg.minAttempts : 1; }

function confirmSubmit(){
  const p = read();
  // Never submit an attempt with nothing in it — the button is disabled until a
  // question is finished, and this keeps a stray call from reaching a quiz that
  // hasn't started yet.
  if (!p || submitted || p.attempted < minAttempts()) return;

  const back = document.createElement("div");
  back.style.cssText =
    "position:fixed;inset:0;z-index:2147483002;display:flex;align-items:center;" +
    "justify-content:center;padding:20px;background:rgba(15,23,42,.55);" +
    "-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);font-family:" + UIFONT + ";";

  const left = p.quizLength - p.attempted;
  back.innerHTML =
    '<div style="background:#fff;border-radius:22px;box-shadow:0 20px 60px rgba(0,0,0,.28);' +
      'max-width:440px;width:100%;overflow:hidden;">' +
      '<div style="font-weight:1000;font-size:22px;padding:20px 22px 6px;color:#111827;">Submit what you\'ve done?</div>' +
      '<div style="padding:6px 22px 20px;">' +
        '<p style="color:#6b7280;font-weight:600;font-size:15px;line-height:1.45;margin:0 0 12px;">' +
          'You\'ve finished <b>' + esc(p.attempted) + '</b> of ' + esc(p.quizLength) + '. ' +
          'Your teacher will see <b>' + esc(p.correct) + ' out of ' + esc(p.attempted) + '</b>, ' +
          'marked as a part-finished attempt.</p>' +
        '<p style="color:#6b7280;font-weight:600;font-size:15px;line-height:1.45;margin:0 0 16px;">' +
          'You won\'t be able to go back to the remaining ' + esc(left) +
          ' question' + (left === 1 ? "" : "s") + ' in this attempt.</p>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap;">' +
          '<button type="button" id="mmtSubmitYes" style="flex:1;min-width:130px;border:none;border-radius:14px;' +
            'padding:13px 18px;font-family:inherit;font-weight:1000;font-size:16px;cursor:pointer;background:#2563eb;color:#fff;">Submit now</button>' +
          '<button type="button" id="mmtSubmitNo" style="flex:1;min-width:130px;border:none;border-radius:14px;' +
            'padding:13px 18px;font-family:inherit;font-weight:1000;font-size:16px;cursor:pointer;background:#f3f4f6;color:#111827;">Keep going</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  function close(){ back.remove(); document.removeEventListener("keydown", onKey); }
  function onKey(e){ if (e.key === "Escape") close(); }

  document.body.appendChild(back);
  document.addEventListener("keydown", onKey);
  back.querySelector("#mmtSubmitNo").addEventListener("click", close);
  back.querySelector("#mmtSubmitYes").addEventListener("click", function(){
    close();
    submit();
  });
  setTimeout(function(){ try { back.querySelector("#mmtSubmitYes").focus(); } catch (e) {} }, 60);
}

/** Take the reading, mark the attempt partial, and hand over to the quiz's own
 *  end screen — which saves exactly as it does on a normal finish. */
function submit(){
  const p = read();
  if (!p || submitted || p.attempted < minAttempts()) return;
  snapshot = p;
  partial = true;
  submitted = true;
  paint();
  if (btn) btn.style.display = "none";
  try { cfg.finish(); }
  catch (e) {
    partial = false; submitted = false; snapshot = null;
    if (btn) btn.style.display = "";
    paint();
    console.error("MMTSubmit: the quiz's finish() threw —", e);
  }
}

/* ---- registration ------------------------------------------------------- */

function register(options){
  cfg = options || {};
  if (typeof cfg.progress !== "function" || typeof cfg.finish !== "function") {
    console.warn("MMTSubmit.register needs both progress() and finish().");
    cfg = null;
    return;
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureButton, { once: true });
  } else {
    ensureButton();
  }
}

/** Call after each answer so the button enables itself at the right moment. */
function refresh(){ paint(); }

/** Reset when a student starts a new level or a fresh attempt. */
function reset(){
  partial = false; submitted = false; snapshot = null;
  if (btn) btn.style.display = "";
  paint();
}

export const MMTSubmit = {
  register, refresh, reset,
  total, fields, scaleXP, isPartial,
  coverageFloor: COVERAGE_FLOOR
};

if (typeof window !== "undefined") window.MMTSubmit = MMTSubmit;
