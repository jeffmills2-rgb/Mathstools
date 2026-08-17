import React from "react";

import { useUI } from "./uiStore.js";

/**
 * Renders the toast queue in the top-centre of the screen. Toasts are pushed
 * by announce.js (level-up, quest-complete) and animate in/out via CSS.
 * Click a toast to dismiss it early.
 */
export default function ToastLayer() {
  const toasts = useUI((s) => s.toasts);
  const dismissToast = useUI((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-layer">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast-${t.type}`}
          onClick={() => dismissToast(t.id)}
          role="status"
        >
          <span className="toast-icon">{t.icon}</span>
          <span className="toast-body">
            <span className="toast-title">{t.title}</span>
            {t.message && <span className="toast-message">{t.message}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}
