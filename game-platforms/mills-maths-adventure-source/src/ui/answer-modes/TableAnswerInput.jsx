import React from "react";

import { tableInputCells } from "../../maths/answerModes.js";

/**
 * TableAnswerInput (Phase 2K) — a small editable table. Static cells are plain
 * text (row/column labels and given values); cells flagged { input:true } become
 * editable boxes. Controlled value is an array of strings (the editable cells,
 * row-major). After checking, per-cell correctness is shown.
 */
export default function TableAnswerInput({ question, value, onChange, disabled, partResults }) {
  const cfg = question.tableConfig || {};
  const editable = tableInputCells(cfg);
  const vals = Array.isArray(value) ? value : editable.map(() => "");

  // Map each editable cell to its flat index so we can update the right slot.
  let counter = -1;

  function setCell(idx, v) {
    const next = vals.slice();
    next[idx] = v;
    onChange(next);
  }

  return (
    <div className="table-input-wrap">
      {cfg.caption && <div className="table-input-caption">{cfg.caption}</div>}
      <table className="answer-table">
        {/* The header row was previously never rendered (3G bugfix) — it now
            appears as a proper <thead>, e.g. Figure | 1 | 2 | 3 | 4 | 5. */}
        {Array.isArray(cfg.headerRow) && cfg.headerRow.length > 0 && (
          <thead>
            <tr>
              {cfg.headerRow.map((h, hi) => (
                <th key={hi} className="answer-cell">{String(h)}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {(cfg.rows || []).map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => {
                if (cell && typeof cell === "object" && cell.input) {
                  counter += 1;
                  const idx = counter;
                  const mark = partResults ? (partResults[idx] ? "cell-correct" : "cell-wrong") : "";
                  return (
                    <td key={ci} className={`answer-cell editable ${mark}`}>
                      <input
                        className="cell-input"
                        type="text"
                        value={vals[idx] || ""}
                        disabled={disabled}
                        onChange={(e) => setCell(idx, e.target.value)}
                      />
                    </td>
                  );
                }
                // Non-numeric cells ("Tiles", "x", "y") are row labels.
                const Tag = Number.isNaN(Number(cell)) ? "th" : "td";
                return (
                  <Tag key={ci} className="answer-cell static">{String(cell)}</Tag>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
