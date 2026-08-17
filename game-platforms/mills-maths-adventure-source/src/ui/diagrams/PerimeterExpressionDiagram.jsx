import React from "react";

/**
 * PerimeterExpressionDiagram — a rectangle (width/length labels) or a triangle
 * (three side labels) whose side lengths are algebraic expressions. The student
 * writes/simplifies the perimeter. Reads diagramData:
 *   rectangle: { shape:"rectangle", width, length }
 *   triangle:  { shape:"triangle", sides:[a,b,c] }
 * From the legacy perimeter-figure design (reference only).
 */
export default function PerimeterExpressionDiagram({ data }) {
  const shape = data?.shape === "triangle" ? "triangle" : "rectangle";

  if (shape === "triangle") {
    const sides = Array.isArray(data?.sides) ? data.sides : ["", "", ""];
    const ax = 150, ay = 22, bx = 40, by = 150, cx = 260, cy = 150;
    return (
      <svg className="diagram-svg diagram-svg-wide" viewBox="0 0 300 180" role="img" aria-label="Triangle figure">
        <polygon className="perim-shape" points={`${ax},${ay} ${bx},${by} ${cx},${cy}`} />
        <text className="perim-label" x={(ax + bx) / 2 - 14} y={(ay + by) / 2} textAnchor="end">{sides[0]}</text>
        <text className="perim-label" x={(bx + cx) / 2} y={by + 22} textAnchor="middle">{sides[2]}</text>
        <text className="perim-label" x={(ax + cx) / 2 + 14} y={(ay + cy) / 2} textAnchor="start">{sides[1]}</text>
      </svg>
    );
  }

  const width = String(data?.width ?? "");
  const length = String(data?.length ?? "");
  const x0 = 40, y0 = 30, w = 220, h = 96;
  return (
    <svg className="diagram-svg diagram-svg-wide" viewBox="0 0 320 160" role="img" aria-label="Rectangle figure">
      <rect className="perim-shape" x={x0} y={y0} width={w} height={h} />
      <text className="perim-label" x={x0 + w / 2} y={y0 + h + 24} textAnchor="middle">{width}</text>
      <text className="perim-label" x={x0 + w + 12} y={y0 + h / 2 + 5} textAnchor="start">{length}</text>
    </svg>
  );
}
