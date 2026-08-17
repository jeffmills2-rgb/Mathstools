import React from "react";

import { useUI } from "../ui/effects/uiStore.js";
import { TRANSLATIONS } from "./translations.js";
import "./i18n.css";

/**
 * BILINGUAL SUPPORT (EALD) — a lightweight, offline i18n layer.
 *
 * When the language is Farsi ("fa") or Arabic ("ar"), on-screen English text is
 * shown WITH the translation: the translated line (right-to-left) on top and the
 * original English underneath, so a student always has both. English ("en") is
 * the default and renders text unchanged.
 *
 * Coverage is a hand-built dictionary (see translations.js). Any string not yet
 * in the dictionary simply falls back to English — nothing breaks, and coverage
 * grows by adding entries. Numbers and maths symbols are universal, so they are
 * intentionally left as-is.
 *
 * Usage:
 *   <Bi>Sound</Bi>                     → bilingual block for a fixed label
 *   <Bi en={someString}>{someString}</Bi>
 *   t("Options", lang)                 → a plain translated string (for title=/aria-)
 */

export const LANG_ORDER = ["en", "fa", "ar"];
// The language's own name, with the English name in brackets after it, so a
// teacher (or student) can always tell which language is which.
export const LANG_LABEL = { en: "English", fa: "فارسی (Farsi)", ar: "العربية (Arabic)" };
export const RTL_LANGS = new Set(["fa", "ar"]);

/** The current UI language ("en" | "fa" | "ar"). */
export function useLang() {
  return useUI((s) => s.language);
}

/** Look up a translation, or null if none / language is English. */
export function translate(text, lang) {
  if (text == null || lang === "en" || !RTL_LANGS.has(lang)) return null;
  const dict = TRANSLATIONS[lang];
  if (!dict) return null;
  return dict[String(text).trim()] || null;
}

/** A plain translated string (falls back to English) — for attributes. */
export function t(text, lang) {
  return translate(text, lang) || text;
}

/**
 * Bilingual text. Children (or `en`) is the English source; when a translation
 * exists for the active language it renders translated-over-English, else plain
 * English. `block` stacks the two lines (default); pass block={false} for a
 * tighter inline treatment.
 */
export function Bi({ children, en, className = "", block = true }) {
  const lang = useLang();
  const english = en != null ? en : typeof children === "string" ? children : null;
  const tr = translate(english, lang);
  if (!tr) return <>{children}</>; // English-only (default, or no translation yet)
  return (
    <span className={`bi ${block ? "bi-block" : "bi-inline"} ${className}`.trim()}>
      <span className="bi-tr" dir="rtl" lang={lang}>{tr}</span>
      <span className="bi-en">{english}</span>
    </span>
  );
}

/**
 * A reusable language picker — a dropdown listing English / فارسی (Farsi) /
 * العربية (Arabic). Used on the character-select screen and in the ⚙ Options
 * menu. `compact` shrinks it for the menu.
 */
export function LanguageSelector({ compact = false }) {
  const language = useUI((s) => s.language);
  const setLanguage = useUI((s) => s.setLanguage);
  return (
    <select
      className={`lang-select ${compact ? "compact" : ""}`.trim()}
      aria-label="Language"
      value={language}
      lang={language}
      dir={RTL_LANGS.has(language) ? "rtl" : "ltr"}
      onChange={(e) => { setLanguage(e.target.value); e.currentTarget.blur(); }}
    >
      {LANG_ORDER.map((code) => (
        <option key={code} value={code} lang={code}>
          {LANG_LABEL[code]}
        </option>
      ))}
    </select>
  );
}
