import React from "react";

/**
 * TilePatternDiagram (Phase 3F; variety added 3G, visualpatterns.org-style) —
 * a growing geometric tile pattern with the RULE visible in the structure:
 * tiles(n) = a·n + b, where b fixed "base" tiles are dark and each step adds
 * a light tiles. Three layouts:
 *
 *   towers — a dark base column + n light columns of a           (any a, b)
 *   row    — a horizontal strip: b dark then a·n light           (a ≤ 3)
 *   L      — a dark corner + two arms of n growing out           (a = 2)
 *
 * diagramData: { a, b, figures?: number, showCounts?, style? }
 */
export default function TilePatternDiagram({ data }) {
  const a = Math.max(1, Math.floor(Number(data?.a ?? 3)));
  const b = Math.max(0, Math.floor(Number(data?.b ?? 1)));
  const figures = Math.min(4, Math.max(2, Math.floor(Number(data?.figures ?? 3))));
  const showCounts = data?.showCounts !== false;
  const style = ["towers", "row", "L"].includes(data?.style) ? data.style : "towers";

  const t = 13, gap = 3;
  const step = t + gap;
  const count = (n) => a * n + b;

  const tile = (key, x, y, dark) => (
    <rect key={key} className={dark ? "tp-base" : "tp-step"} rx={2} x={x} y={y} width={t} height={t} />
  );

  const groups = [];

  if (style === "row") {
    // One figure per line, tiles in a single strip.
    let y = 24;
    for (let n = 1; n <= figures; n++) {
      const tiles = [];
      for (let i = 0; i < b; i++) tiles.push(tile(`b${i}`, 16 + 70 + i * step, y - t, true));
      for (let i = 0; i < a * n; i++) tiles.push(tile(`s${i}`, 16 + 70 + (b + i) * step, y - t, false));
      groups.push(
        <g key={n}>
          <text className="fd-axis" x={16} y={y - 3}>{`Figure ${n}`}</text>
          {tiles}
          {showCounts && (
            <text className="fd-label-sm" x={16 + 70 + (b + a * n) * step + 8} y={y - 3}>{count(n)}</text>
          )}
        </g>
      );
      y += 30;
    }
    const W = Math.max(340, 16 + 70 + (b + a * figures) * step + 40);
    return (
      <svg className="diagram-svg diagram-svg-wide" viewBox={`0 0 ${W} ${24 + figures * 30}`}
        role="img" aria-label="Growing tile pattern">
        {groups}
      </svg>
    );
  }

  if (style === "L") {
    // Corner of b dark tiles; vertical arm n and horizontal arm n (a = 2).
    const colH = figures + Math.max(1, b);
    const baseY = 30 + colH * step;
    let x = 16;
    for (let n = 1; n <= figures; n++) {
      const tiles = [];
      // Corner block (dark), stacked upward from the bottom-left.
      for (let i = 0; i < Math.max(1, b); i++) tiles.push(tile(`c${i}`, x, baseY - (i + 1) * step, true));
      // Vertical arm above the corner.
      for (let i = 0; i < n; i++) tiles.push(tile(`v${i}`, x, baseY - (Math.max(1, b) + i + 1) * step, false));
      // Horizontal arm to the right of the corner.
      for (let i = 0; i < n; i++) tiles.push(tile(`h${i}`, x + (i + 1) * step, baseY - step, false));
      const w = (n + 1) * step;
      groups.push(
        <g key={n}>
          <text className="fd-axis" x={x + w / 2} y={16} textAnchor="middle">{`Figure ${n}`}</text>
          {tiles}
          {showCounts && (
            <text className="fd-label-sm" x={x + w / 2} y={baseY + 16} textAnchor="middle">{count(n)}</text>
          )}
        </g>
      );
      x += w + 30;
    }
    return (
      <svg className="diagram-svg diagram-svg-wide" viewBox={`0 0 ${Math.max(340, x)} ${30 + colH * step + 26}`}
        role="img" aria-label="Growing tile pattern">
        {groups}
      </svg>
    );
  }

  // Default: towers.
  const colH = Math.max(a, b);
  const baseY = 30 + colH * step;
  let x = 16;
  for (let n = 1; n <= figures; n++) {
    const cols = [];
    if (b > 0) cols.push({ count: b, dark: true });
    for (let k = 0; k < n; k++) cols.push({ count: a, dark: false });
    const tiles = [];
    cols.forEach((col, ci) => {
      for (let r = 0; r < col.count; r++) {
        tiles.push(tile(`${ci}-${r}`, x + ci * step, baseY - (r + 1) * step, col.dark));
      }
    });
    const w = cols.length * step;
    groups.push(
      <g key={n}>
        <text className="fd-axis" x={x + w / 2} y={16} textAnchor="middle">{`Figure ${n}`}</text>
        {tiles}
        {showCounts && (
          <text className="fd-label-sm" x={x + w / 2} y={baseY + 16} textAnchor="middle">{count(n)}</text>
        )}
      </g>
    );
    x += w + 26;
  }
  return (
    <svg className="diagram-svg diagram-svg-wide" viewBox={`0 0 ${Math.max(340, x)} ${baseY + 26}`}
      role="img" aria-label="Growing tile pattern">
      {groups}
    </svg>
  );
}
