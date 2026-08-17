import { useEffect } from "react";

import { useUI } from "../ui/effects/uiStore.js";
import { TRANSLATIONS } from "./translations.js";

/**
 * BILINGUAL AUTO-LAYER — makes the WHOLE app bilingual without editing every
 * component. When the language is Farsi/Arabic it scans the on-screen text and,
 * for any string that exactly matches a dictionary key (see translations.js),
 * shows the translation with the English underneath — wherever it was drawn
 * (menus, panels, dialogue, and the in-world drei <Html> 3D labels).
 *
 * Design notes (so it stays safe in a live React + react-three-fiber app):
 *   • It NEVER adds or removes DOM nodes — it only edits a matched text node's
 *     value in place and sets attributes on its parent. So it can't clash with
 *     React's reconciliation (which crashes if you restructure nodes it owns).
 *     The English "underneath" is drawn by CSS: `[data-bi-en]::after`.
 *   • It only translates EXACT dictionary matches, so anything not translated
 *     stays clean English — never machine-mangled.
 *   • The MutationObserver watches text/child changes only (NOT attributes), so
 *     the per-frame transform updates on 3D labels don't trigger it.
 *   • Nodes inside a manual <Bi> block (class "bi") are skipped — that handles
 *     its own bilingual rendering.
 *   • On switching back to English (or unmount) it restores every string.
 */

const RTL = new Set(["fa", "ar"]);

function skipParent(el) {
  if (!el || !el.tagName) return true;
  const tag = el.tagName;
  if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT" || tag === "TEXTAREA" || tag === "INPUT" || tag === "CODE" || tag === "KBD") return true;
  if (el.isContentEditable) return true;
  if (el.closest && el.closest(".bi")) return true; // manual <Bi> handles these
  return false;
}

function textNodes() {
  const out = [];
  if (typeof document === "undefined" || !document.body) return out;
  let walker;
  try {
    walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        const v = n.nodeValue;
        if (!v || !v.trim()) return NodeFilter.FILTER_REJECT;
        return skipParent(n.parentElement) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      },
    });
  } catch {
    return out;
  }
  while (walker.nextNode()) out.push(walker.currentNode);
  return out;
}

// Translate: raw text (whitespace preserved) → translation, marking the parent.
function apply(dict, lang) {
  for (const node of textNodes()) {
    const raw = node.nodeValue;
    const key = raw.trim();
    const tr = dict[key];
    if (!tr) continue;
    const p = node.parentElement;
    if (!p) continue;
    const newVal = raw.replace(key, tr);
    if (node.nodeValue !== newVal) node.nodeValue = newVal;
    if (p.getAttribute("data-bi-en") !== key) p.setAttribute("data-bi-en", key);
    if (p.getAttribute("dir") !== "rtl") p.setAttribute("dir", "rtl");
    if (p.getAttribute("lang") !== lang) p.setAttribute("lang", lang);
  }
}

// Restore: translation → English (using a reverse map of the language we leave).
function restore(reverse) {
  for (const node of textNodes()) {
    const key = node.nodeValue.trim();
    const en = reverse[key];
    if (en) {
      const back = node.nodeValue.replace(key, en);
      if (node.nodeValue !== back) node.nodeValue = back;
    }
  }
  try {
    document.querySelectorAll("[data-bi-en]").forEach((p) => {
      p.removeAttribute("data-bi-en");
      p.removeAttribute("dir");
      p.removeAttribute("lang");
    });
  } catch { /* ignore */ }
}

export default function BilingualLayer() {
  const lang = useUI((s) => s.language);
  useEffect(() => {
    if (!RTL.has(lang) || !TRANSLATIONS[lang]) return undefined;
    const dict = TRANSLATIONS[lang];
    const reverse = {};
    for (const en in dict) reverse[String(dict[en]).trim()] = en;

    let raf = 0;
    const run = () => { try { apply(dict, lang); } catch { /* ignore */ } };
    run();

    let obs = null;
    try {
      obs = new MutationObserver(() => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(run);
      });
      obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    } catch { /* ignore */ }

    return () => {
      if (obs) obs.disconnect();
      cancelAnimationFrame(raf);
      try { restore(reverse); } catch { /* ignore */ }
    };
  }, [lang]);
  return null;
}
