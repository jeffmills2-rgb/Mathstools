import React from "react";

/**
 * ThermometerDiagram — a vertical temperature scale with a mercury fill marking
 * a value. Re-created in React/SVG from the legacy integer diagram engine's
 * thermometer design (legacy DOM code kept only as reference, never imported).
 *
 * Reads diagramData: { min, max, step, value, unit }
 * Shows the marked `value` (e.g. the dawn temperature); the student computes the
 * answer from the question text.
 */
export default function ThermometerDiagram({ data }) {
  const { min = -20, max = 40, step = 10, value, unit = "°C" } = data || {};
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return null;

  const top = 24, bottom = 240, cx = 78, tubeW = 26, bulbR = 22;
  const clamp = (v) => Math.max(min, Math.min(max, v));
  const y = (v) => bottom - ((clamp(v) - min) / (max - min)) * (bottom - top);
  const fmt = (n) => (n < 0 ? `−${Math.abs(n)}` : String(n));
  const hasValue = Number.isFinite(value);
  const cold = hasValue && value < 0;

  // Minor ticks subdivide each major 10° interval (every 2°) so values like
  // −3°C can be read accurately. Major ticks (every `step`) keep their labels.
  const minorStep = Math.max(1, Math.round(step / 5)); // 10 -> 2
  const rightEdge = cx + tubeW / 2;

  const minorTicks = [];
  for (let v = min; v <= max + 1e-9; v += minorStep) {
    if (Math.abs(v % step) < 1e-9) continue; // skip where a major tick sits
    minorTicks.push(
      <line key={`mn${v}`} className="therm-tick-minor"
        x1={rightEdge} y1={y(v)} x2={rightEdge + 6} y2={y(v)} />
    );
  }

  const ticks = [];
  for (let v = min; v <= max + 1e-9; v += step) {
    const isZero = v === 0;
    ticks.push(
      <g key={`tk${v}`}>
        <line className={isZero ? "therm-zero" : "therm-tick"}
          x1={rightEdge} y1={y(v)} x2={rightEdge + (isZero ? 18 : 12)} y2={y(v)} />
        <text className="therm-label" x={cx - tubeW / 2 - 8} y={y(v) + 5} textAnchor="end">{fmt(v)}</text>
      </g>
    );
  }

  return (
    <svg className="diagram-svg" viewBox="0 0 200 300" role="img"
      aria-label={`Thermometer showing ${hasValue ? value : "a"} ${unit}`}>
      {/* glass tube + bulb */}
      <rect className="therm-glass" x={cx - tubeW / 2} y={top} width={tubeW}
        height={bottom - top + 6} rx={tubeW / 2} ry={tubeW / 2} />
      <circle className="therm-glass" cx={cx} cy={bottom + bulbR - 4} r={bulbR} />

      {/* mercury */}
      {hasValue && (
        <>
          <circle className={cold ? "therm-merc cold" : "therm-merc"} cx={cx} cy={bottom + bulbR - 4} r={bulbR - 6} />
          <rect className={cold ? "therm-merc cold" : "therm-merc"} x={cx - (tubeW - 12) / 2}
            y={y(value)} width={tubeW - 12} height={bottom + 4 - y(value)} />
        </>
      )}

      {ticks}

      {hasValue && (
        <text className="therm-value" x={cx + tubeW / 2 + 24} y={y(value) + 5} textAnchor="start">
          {fmt(value)}{unit}
        </text>
      )}
    </svg>
  );
}
