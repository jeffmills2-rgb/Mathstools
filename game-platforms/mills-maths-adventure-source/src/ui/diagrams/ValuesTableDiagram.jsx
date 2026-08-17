import React from "react";

/**
 * ValuesTableDiagram (Phase 3G, teacher feedback) — a DISPLAY table of values
 * with proper cells and borders, e.g.
 *
 *      x | 1 | 2 | 3 | 4
 *      y | 7 | 11 | 15 | 19
 *
 * (Previously tables of values appeared as plain "x: 1, 2, 3" text lines.)
 * Supports multiple tables stacked (e.g. one per line for intersections).
 *
 * diagramData: { tables: [{ label?, rows: [{ label, values: [] }] }] }
 */
export default function ValuesTableDiagram({ data }) {
  const tables = Array.isArray(data?.tables) ? data.tables : [];
  if (!tables.length) return null;

  const cellW = 44, labelW = 64, cellH = 30, tableGap = 34, titleH = 22;

  let y = 10;
  const groups = tables.map((t, ti) => {
    const rows = t.rows || [];
    const cols = Math.max(...rows.map((r) => (r.values || []).length), 1);
    const width = labelW + cols * cellW;
    const startY = y + (t.label ? titleH : 0);
    const els = [];

    if (t.label) {
      els.push(
        <text key="title" className="fd-label-sm" x={12} y={y + 14}>{t.label}</text>
      );
    }
    rows.forEach((row, ri) => {
      const ry = startY + ri * cellH;
      els.push(
        <g key={`r${ri}`}>
          <rect className="vt-cell vt-label" x={12} y={ry} width={labelW} height={cellH} />
          <text className="vt-label-text" x={12 + labelW / 2} y={ry + cellH / 2 + 5} textAnchor="middle">
            {row.label}
          </text>
          {(row.values || []).map((v, ci) => (
            <g key={ci}>
              <rect className="vt-cell" x={12 + labelW + ci * cellW} y={ry} width={cellW} height={cellH} />
              <text className="vt-value" x={12 + labelW + ci * cellW + cellW / 2} y={ry + cellH / 2 + 5} textAnchor="middle">
                {String(v)}
              </text>
            </g>
          ))}
        </g>
      );
    });
    y = startY + rows.length * cellH + (ti < tables.length - 1 ? tableGap : 0);
    return <g key={ti}>{els}</g>;
  });

  const maxCols = Math.max(...tables.map((t) => Math.max(...(t.rows || []).map((r) => (r.values || []).length), 1)));
  const W = Math.max(300, 24 + labelW + maxCols * cellW);

  return (
    <svg className="diagram-svg diagram-svg-wide" viewBox={`0 0 ${W} ${y + 14}`} role="img"
      aria-label="Table of values">
      {groups}
    </svg>
  );
}
