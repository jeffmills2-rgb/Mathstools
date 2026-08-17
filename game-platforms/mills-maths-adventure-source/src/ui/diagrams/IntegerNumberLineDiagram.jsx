import React from "react";

/**
 * IntegerNumberLineDiagram — a number line that models addition/subtraction
 * with curved "jump" arrows. Re-created in React/SVG from the legacy integer
 * diagram engine's number-line-jumps design (the legacy DOM code is kept only
 * as reference source material and is never imported).
 *
 * Reads diagramData: { min, max, step, start, jumps:[{by}], labels:[..] }
 * The end point is intentionally NOT shown — the student works it out.
 */
export default function IntegerNumberLineDiagram({ data }) {
  const { min, max, step = 1, start = 0, jumps = [], labels } = data || {};
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return null;

  const left = 30, right = 470, y = 96;
  const x = (v) => left + ((v - min) / (max - min)) * (right - left);
  const labelSet = new Set((Array.isArray(labels) ? labels : [min, 0, max]).map(Number));
  const fmt = (n) => (n < 0 ? `−${Math.abs(n)}` : String(n));

  // Tick marks.
  const ticks = [];
  for (let v = min; v <= max + 1e-9; v += step) {
    const labelled = labelSet.has(v);
    ticks.push(
      <g key={`t${v}`}>
        <line className={labelled ? "nl-tick" : "nl-tick-minor"}
          x1={x(v)} y1={y - (labelled ? 12 : 7)} x2={x(v)} y2={y + (labelled ? 12 : 7)} />
        {labelled && (
          <text className="nl-label" x={x(v)} y={y + 30} textAnchor="middle">{fmt(v)}</text>
        )}
      </g>
    );
  }

  // Jump arcs (cumulative from start).
  let current = start;
  const arcs = jumps.map((j, i) => {
    const by = Number(j.by) || 0;
    const next = current + by;
    const x1 = x(current), x2 = x(next);
    const mx = (x1 + x2) / 2;
    const span = Math.abs(x2 - x1);
    const lift = Math.min(52, 18 + span * 0.32);
    const neg = by < 0;
    const dir = x2 >= x1 ? 1 : -1;
    const node = (
      <g key={`j${i}`} className={neg ? "nl-jump neg" : "nl-jump"}>
        <path className="nl-jump-arc" d={`M ${x1} ${y - 5} Q ${mx} ${y - 5 - lift} ${x2} ${y - 5}`} />
        <path className="nl-jump-arrow" d={`M ${x2} ${y - 5} l ${-dir * 8} ${-6} l 0 12 z`} />
        <text className="nl-jump-label" x={mx} y={y - 10 - lift} textAnchor="middle">
          {by >= 0 ? "+" : "−"}{Math.abs(by)}
        </text>
      </g>
    );
    current = next;
    return node;
  });

  return (
    <svg className="diagram-svg diagram-svg-wide" viewBox="0 0 500 150" role="img"
      aria-label={`Number line from ${min} to ${max} starting at ${start}`}>
      <line className="nl-baseline" x1={left} y1={y} x2={right} y2={y} />
      {ticks}
      {/* start marker */}
      <circle className="nl-start" cx={x(start)} cy={y} r="7" />
      {arcs}
    </svg>
  );
}
