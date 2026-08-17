import { randInt, pick, makeQuestion } from "../../../helpers.js";

/**
 * STAGE 4 · Length — NATIVE, diagram-heavy skills (Phase 3B), built to the
 * NESA Length content statements with figures redrawn from the CHHS Exam
 * Builder length engine (see src/ui/diagrams/Length*.jsx et al).
 *
 * Coverage:
 *   Perimeter of quadrilaterals ..... quadPerimeter, missingSidePerimeter
 *   Composite figures ............... compositeRectilinear, curvedComposite
 *   Circle features ................. circleFeatures (True/False → multiple choice)
 *   Circumference ................... circumference (approx + reverse),
 *                                     circumferenceExact (in terms of π)
 *   Arc length + sectors ............ arcLength (exact + approx), sectorPerimeter
 *   Quadrants & semicircles ......... partialCircle
 *
 * Conventions (teacher-approved):
 *   - Approximate circle answers: "correct to 1 decimal place", graded with a
 *     ±0.05 tolerance (calculator-π and 3.14 users both pass).
 *   - Exact answers "in terms of π": MathLive input, graded by a π-aware
 *     matcher (accepts 12π / 12pi / \pi forms).
 *   - Every sentence on its own line; ratios/labels never wrap.
 */
const SYL = "MA4-LEN";

// ---- graders ---------------------------------------------------------------

// Tolerant numeric check for "correct to 1 dp" circle answers.
function approxCheck(exact, tol = 0.05) {
  return (input) => {
    const n = Number(String(input ?? "").trim().replace(/[a-z%$\s]+/gi, ""));
    return Number.isFinite(n) && Math.abs(n - exact) <= tol;
  };
}

// π-aware check for exact answers kπ (accepts "12π", "12pi", "\pi", "0.5π",
// "3/2 π", bare "π" for k = 1). Rejects plain decimals — exact means exact.
function piCheck(k) {
  return (input) => {
    let s = String(input ?? "")
      .toLowerCase()
      .replace(/\\pi/g, "pi")
      .replace(/π/g, "pi")
      .replace(/\s+/g, "")
      .replace(/[×*·]/g, "");
    if (!s.includes("pi")) return false;
    s = s.replace("pi", "");
    if (s === "") return k === 1;
    const f = s.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/);
    if (f) return Number(f[2]) !== 0 && Math.abs(Number(f[1]) / Number(f[2]) - k) < 1e-9;
    const n = Number(s);
    return Number.isFinite(n) && Math.abs(n - k) < 1e-9;
  };
}

// Build a simple-input question then swap in a custom check.
function withCheck(config, check) {
  const q = makeQuestion(config);
  q.check = check;
  return q;
}

const round1 = (x) => Math.round(x * 10) / 10;
const UNITS = ["cm", "m", "mm"];
// Integer at low levels, one-decimal at 4–5.
const sideVal = (level, lo, hi) =>
  level >= 4 && Math.random() < 0.5 ? randInt(lo, hi - 1) + 0.5 : randInt(lo, hi);

// ---- 1. Perimeter of quadrilaterals -----------------------------------------

export const quadPerimeter = {
  id: "quadPerimeter",
  name: "Perimeter of Quadrilaterals",
  syllabusArea: SYL,
  prerequisiteSkillIds: [],
  nextSkillIds: ["missingSidePerimeter"],

  generate(level) {
    const pool = level <= 1 ? ["square", "rectangle"]
      : level === 2 ? ["square", "rectangle", "parallelogram", "rhombus"]
      : ["rectangle", "parallelogram", "rhombus", "kite", "trapezium"];
    const shape = pick(pool);
    const unit = pick(level <= 2 ? ["cm", "m"] : UNITS);
    const L = (v) => `${v} ${unit}`;

    let labels, per, hint;
    if (shape === "square" || shape === "rhombus") {
      const s = sideVal(level, 3, 15);
      labels = [L(s), "", "", ""];
      per = 4 * s;
      hint = `All four sides are equal (see the tick marks): P = 4 × ${s} = ${round1(per)} ${unit}.`;
    } else if (shape === "rectangle" || shape === "parallelogram") {
      // The base is DRAWN longer than the side, so the larger number goes on
      // the base (diagrams aren't to scale, but longer must LOOK longer).
      let v1 = sideVal(level, 3, 18), v2;
      do { v2 = sideVal(level, 3, 18); } while (v2 === v1);
      const b = Math.max(v1, v2), s = Math.min(v1, v2);
      labels = [L(b), L(s), "", ""];
      per = 2 * (b + s);
      hint = `Opposite sides are equal: P = 2 × (${b} + ${s}) = ${round1(per)} ${unit}.`;
    } else if (shape === "kite") {
      // Edges 0/3 are drawn shorter than 1/2 — keep values consistent.
      let v1 = sideVal(level, 3, 14), v2;
      do { v2 = sideVal(level, 3, 14); } while (v2 === v1);
      const a = Math.min(v1, v2), b = Math.max(v1, v2);
      labels = [L(a), L(b), "", ""];
      per = 2 * (a + b);
      hint = `A kite has two pairs of equal sides: P = 2 × (${a} + ${b}) = ${round1(per)} ${unit}.`;
    } else {
      // Trapezium: drawn with the bottom longest and the top shortest.
      const vals = [sideVal(level, 4, 18), sideVal(level, 4, 18), sideVal(level, 4, 18), sideVal(level, 4, 18)]
        .sort((x, y) => y - x);
      const sides = [vals[0], vals[1], vals[3], vals[2]]; // bottom, leg, TOP(min), leg
      labels = sides.map(L);
      per = sides.reduce((x, y) => x + y, 0);
      hint = `Add all four sides: ${sides.join(" + ")} = ${round1(per)} ${unit}.`;
    }

    return makeQuestion({
      topic: "quadPerimeter",
      text: `The diagram shows a ${shape}.\nFind its perimeter, in ${unit}.`,
      answer: round1(per),
      feedback: hint,
      inputMode: "simple",
      diagramType: "lengthPolygon",
      diagramData: { shape, labels },
    });
  },
};

// ---- 2. Missing side, given the perimeter ------------------------------------

export const missingSidePerimeter = {
  id: "missingSidePerimeter",
  name: "Missing Side from Perimeter",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["quadPerimeter"],
  nextSkillIds: ["compositeRectilinear"],

  generate(level) {
    const pool = level <= 1 ? ["square", "rectangle"]
      : level === 2 ? ["rectangle", "triangle"]
      : ["rectangle", "triangle", "parallelogram", "kite", "trapezium"];
    const shape = pick(pool);
    const unit = pick(["cm", "m"]);
    const L = (v) => `${v} ${unit}`;

    let labels, highlightEdge, answer, per, hint;
    if (shape === "square") {
      const s = sideVal(level, 3, 15);
      per = 4 * s;
      labels = ["x", "", "", ""];
      highlightEdge = 0;
      answer = s;
      hint = `P = 4 × side, so x = ${round1(per)} ÷ 4 = ${round1(s)} ${unit}.`;
    } else if (shape === "rectangle" || shape === "parallelogram") {
      // x goes on the edge that matches its SIZE: the base is drawn longer, so
      // if the missing value is the larger one, x sits on the base.
      let v1 = sideVal(level, 3, 18), v2;
      do { v2 = sideVal(level, 3, 18); } while (v2 === v1);
      const big = Math.max(v1, v2), small = Math.min(v1, v2);
      const missingBig = pick([true, false]);
      per = 2 * (big + small);
      const known = missingBig ? small : big;
      answer = missingBig ? big : small;
      labels = missingBig ? ["x", L(small), "", ""] : [L(big), "x", "", ""];
      highlightEdge = missingBig ? 0 : 1;
      hint = `P = 2 × (${known} + x), so x = ${round1(per)} ÷ 2 − ${known} = ${round1(answer)} ${unit}.`;
    } else if (shape === "triangle") {
      // Drawn with the bottom longest, then the left, then the right side.
      const vals = [sideVal(level, 4, 14), sideVal(level, 4, 14), sideVal(level, 4, 14)].sort((x, y) => y - x);
      const sides = [vals[0], vals[2], vals[1]]; // bottom(max), right(min), left(mid)
      const missing = randInt(0, 2);
      per = sides.reduce((x, y) => x + y, 0);
      answer = sides[missing];
      labels = sides.map((v, i) => (i === missing ? "x" : L(v)));
      highlightEdge = missing;
      const others = sides.filter((_, i) => i !== missing);
      hint = `x = P − (other sides) = ${round1(per)} − (${others.join(" + ")}) = ${round1(answer)} ${unit}.`;
    } else if (shape === "kite") {
      // Edges 0/3 are drawn shorter than 1/2 — x goes on the matching edge.
      let v1 = sideVal(level, 3, 14), v2;
      do { v2 = sideVal(level, 3, 14); } while (v2 === v1);
      const short = Math.min(v1, v2), long = Math.max(v1, v2);
      const missingLong = pick([true, false]);
      per = 2 * (short + long);
      const known = missingLong ? short : long;
      answer = missingLong ? long : short;
      labels = missingLong ? [L(short), "x", "", ""] : ["x", L(long), "", ""];
      highlightEdge = missingLong ? 1 : 0;
      hint = `A kite has two pairs of equal sides: 2 × (${known} + x) = ${round1(per)}, so x = ${round1(answer)} ${unit}.`;
    } else {
      // Trapezium: bottom longest, top (the missing edge) shortest.
      const vals = [sideVal(level, 4, 18), sideVal(level, 4, 18), sideVal(level, 4, 18), sideVal(level, 4, 18)]
        .sort((x, y) => y - x);
      const sides = [vals[0], vals[1], vals[3], vals[2]]; // bottom, leg, TOP(min), leg
      per = sides.reduce((x, y) => x + y, 0);
      labels = [L(sides[0]), L(sides[1]), "x", L(sides[3])];
      highlightEdge = 2;
      answer = sides[2];
      hint = `x = P − (other sides) = ${round1(per)} − (${sides[0]} + ${sides[1]} + ${sides[3]}) = ${round1(sides[2])} ${unit}.`;
    }

    return makeQuestion({
      topic: "missingSidePerimeter",
      text: `The ${shape} has a perimeter of ${round1(per)} ${unit}.\nFind the missing side x, in ${unit}.`,
      answer: round1(answer),
      feedback: hint,
      inputMode: "simple",
      diagramType: "lengthPolygon",
      diagramData: { shape, labels, highlightEdge, note: `Perimeter = ${round1(per)} ${unit}` },
    });
  },
};

// ---- 3. Composite rectilinear perimeter --------------------------------------

export const compositeRectilinear = {
  id: "compositeRectilinear",
  name: "Composite Figures (right angles)",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["quadPerimeter"],
  nextSkillIds: ["curvedComposite"],

  generate(level) {
    const unit = pick(["cm", "m"]);
    const W = randInt(8, level <= 2 ? 14 : 20);
    const H = randInt(6, level <= 2 ? 10 : 14);
    const c = randInt(2, W - 3); // top notch width (edge 2)
    const d = randInt(2, H - 3); // notch height (edge 3)
    // L-shape, y-up: bottom W, then up the right side H−d, in c… — the classic
    // "all corners are right angles" figure. P = 2 × (W + H) always.
    const points = [
      { x: 0, y: 0 }, { x: W, y: 0 }, { x: W, y: H - d },
      { x: W - c, y: H - d }, { x: W - c, y: H }, { x: 0, y: H },
    ];
    const per = 2 * (W + H);
    const L = (v) => `${v} ${unit}`;

    // Label 4 edges; the student derives the other two from the right angles.
    const edgeLabels = [
      { edge: 0, text: L(W) },
      { edge: 2, text: L(c) },
      { edge: 3, text: L(d) },
      { edge: 5, text: L(H) },
    ];
    // Levels 1–2 also label one derived edge to ease in.
    if (level <= 2) edgeLabels.push({ edge: 1, text: L(H - d) });

    return makeQuestion({
      topic: "compositeRectilinear",
      text: `All corners in the figure are right angles.\nFind the perimeter, in ${unit}.`,
      answer: per,
      feedback: `The unlabelled edges are ${W} − ${c} = ${W - c} and ${H} − ${d} = ${H - d}. Adding all six sides gives ${per} ${unit} — the same as 2 × (${W} + ${H}).`,
      inputMode: "simple",
      diagramType: "compositeRectilinear",
      diagramData: { points, edgeLabels },
    });
  },
};

// ---- 4. Circle features (name the highlighted part) --------------------------

const FEATURES = ["radius", "diameter", "chord", "arc", "sector", "segment", "tangent"];
const FEATURE_DEFS = {
  radius: "a line from the centre to the circle",
  diameter: "a line through the centre joining two points on the circle",
  chord: "a line joining two points on the circle (not through the centre)",
  arc: "a part of the circle itself (a curved section of the circumference)",
  sector: "a 'pizza slice' between two radii and an arc",
  segment: "the region between a chord and an arc",
  tangent: "a line outside the circle touching it at exactly one point",
};

export const circleFeatures = {
  id: "circleFeatures",
  name: "Features of a Circle",
  syllabusArea: SYL,
  prerequisiteSkillIds: [],
  nextSkillIds: ["circumference"],

  generate(level) {
    const feature = pick(FEATURES);

    if (level <= 2) {
      const claimTrue = pick([true, false]);
      const claimed = claimTrue ? feature : pick(FEATURES.filter((f) => f !== feature));
      const answer = claimTrue ? "True" : "False";
      return makeQuestion({
        topic: "circleFeatures",
        text: `True or false: the highlighted part of the circle is ${/^[aeiou]/.test(claimed) ? "an" : "a"} ${claimed}.`,
        answer,
        feedback: `The highlighted part is ${/^[aeiou]/.test(feature) ? "an" : "a"} ${feature} — ${FEATURE_DEFS[feature]}. So the statement is ${answer.toLowerCase()}.`,
        answerMode: "trueFalse",
        options: ["True", "False"],
        diagramType: "circleFeatures",
        diagramData: { feature },
      });
    }

    // Levels 3+: multiple choice from 4 plausible names.
    const distractors = FEATURES.filter((f) => f !== feature);
    const options = [feature];
    while (options.length < 4) {
      const d = pick(distractors);
      if (!options.includes(d)) options.push(d);
    }
    options.sort();
    return makeQuestion({
      topic: "circleFeatures",
      text: "What is the name of the highlighted part of the circle?",
      answer: feature,
      feedback: `It is ${/^[aeiou]/.test(feature) ? "an" : "a"} ${feature} — ${FEATURE_DEFS[feature]}.`,
      answerMode: "multipleChoice",
      options,
      diagramType: "circleFeatures",
      diagramData: { feature },
    });
  },
};

// ---- 5. Circumference (approximate + reverse) ---------------------------------

export const circumference = {
  id: "circumference",
  name: "Circumference of a Circle",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["circleFeatures"],
  nextSkillIds: ["circumferenceExact", "partialCircle"],

  generate(level) {
    const unit = pick(["cm", "m"]);

    // Levels 4–5 (half the time): REVERSE — given C, find d or r.
    if (level >= 4 && Math.random() < 0.5) {
      const askFor = pick(["diameter", "radius"]);
      const d = randInt(4, 20);
      const exact = askFor === "diameter" ? d : d / 2;
      const C = round1(Math.PI * d);
      return withCheck({
        topic: "circumference",
        text: `A circle has a circumference of ${C.toFixed(1)} ${unit}.\nFind its ${askFor}, correct to 1 decimal place.`,
        answer: exact.toFixed(1),
        feedback: `${askFor === "diameter" ? "d = C ÷ π" : "r = C ÷ π ÷ 2"} = ${exact.toFixed(1)} ${unit}.`,
        inputMode: "simple",
        diagramType: "circleMeasure",
        diagramData: { given: "circumference", value: C.toFixed(1), unit, askFor },
      }, approxCheck(exact));
    }

    const given = pick(["radius", "diameter"]);
    const v = level <= 2 ? randInt(3, 12) : sideVal(level, 3, 20);
    const exact = given === "radius" ? 2 * Math.PI * v : Math.PI * v;
    return withCheck({
      topic: "circumference",
      text: `Find the circumference of the circle, correct to 1 decimal place.\nGive your answer in ${unit}.`,
      answer: round1(exact).toFixed(1),
      feedback: `C = ${given === "radius" ? `2πr = 2 × π × ${v}` : `πd = π × ${v}`} ≈ ${round1(exact).toFixed(1)} ${unit}.`,
      inputMode: "simple",
      diagramType: "circleMeasure",
      diagramData: { given, value: v, unit },
    }, approxCheck(exact));
  },
};

// ---- 6. Circumference in terms of π -------------------------------------------

export const circumferenceExact = {
  id: "circumferenceExact",
  name: "Circumference in Terms of π",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["circumference"],
  nextSkillIds: ["arcLength"],

  generate(level) {
    const unit = pick(["cm", "m"]);
    const given = pick(["radius", "diameter"]);
    const v = level <= 2 ? randInt(2, 10) : level >= 4 && Math.random() < 0.4 ? randInt(2, 12) + 0.5 : randInt(2, 20);
    const k = given === "radius" ? 2 * v : v;

    return withCheck({
      topic: "circumferenceExact",
      text: `Find the circumference of the circle.\nGive an exact answer in terms of π, in ${unit}.`,
      answer: `${k}π`,
      feedback: `C = ${given === "radius" ? `2πr = 2 × π × ${v}` : `πd = π × ${v}`} = ${k}π ${unit}.`,
      inputMode: "math",
      diagramType: "circleMeasure",
      diagramData: { given, value: v, unit },
    }, piCheck(k));
  },
};

// ---- 7. Arc length -------------------------------------------------------------

// θ → radius pool giving an INTEGER (or .5) π-coefficient k = (θ/360)·2r.
// (180° is deliberately absent — semicircles live in partialCircle, where the
// DIAMETER is labelled instead; teacher fix.)
const ARC_SETUPS = [
  { angle: 45, radii: [4, 8, 12, 16, 20] },
  { angle: 60, radii: [3, 6, 9, 12, 15] },
  { angle: 90, radii: [2, 4, 6, 8, 10, 14] },
  { angle: 120, radii: [3, 6, 9, 12] },
  { angle: 270, radii: [2, 4, 6, 8] },
];

export const arcLength = {
  id: "arcLength",
  name: "Arc Length",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["circumferenceExact"],
  nextSkillIds: ["sectorPerimeter"],

  generate(level) {
    // The radius and angle are on the DIAGRAM — the text never restates them
    // (teacher fix: no redundant diagram-describing sentences).
    const setups = level <= 2 ? ARC_SETUPS.filter((s) => s.angle === 90)
      : level >= 5 ? ARC_SETUPS
      : ARC_SETUPS.filter((s) => s.angle <= 120);
    const setup = pick(setups);
    const r = pick(setup.radii);
    const unit = pick(["cm", "m"]);
    const frac = setup.angle / 360;
    const k = frac * 2 * r; // integer or .5 by construction
    const exactMode = level >= 3;

    if (exactMode) {
      return withCheck({
        topic: "arcLength",
        text: `Calculate the length of the highlighted arc.\nGive an exact answer in terms of π, in ${unit}.`,
        answer: `${k}π`,
        feedback: `l = (θ ÷ 360) × 2πr = (${setup.angle} ÷ 360) × 2 × π × ${r} = ${k}π ${unit}.`,
        inputMode: "math",
        diagramType: "sectorArc",
        diagramData: { angle: setup.angle, radius: r, unit, highlightArc: true },
      }, piCheck(k));
    }

    const exact = k * Math.PI;
    return withCheck({
      topic: "arcLength",
      text: `Calculate the length of the highlighted arc, correct to 1 decimal place.`,
      answer: round1(exact).toFixed(1),
      feedback: `l = (θ ÷ 360) × 2πr = (${setup.angle} ÷ 360) × 2 × π × ${r} ≈ ${round1(exact).toFixed(1)} ${unit}.`,
      inputMode: "simple",
      diagramType: "sectorArc",
      diagramData: { angle: setup.angle, radius: r, unit, highlightArc: true },
    }, approxCheck(exact));
  },
};

// ---- 8. Perimeter of a sector ---------------------------------------------------

export const sectorPerimeter = {
  id: "sectorPerimeter",
  name: "Perimeter of a Sector",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["arcLength"],
  nextSkillIds: [],

  generate(level) {
    const setups = level <= 2 ? ARC_SETUPS.filter((s) => s.angle === 90)
      : level >= 5 ? ARC_SETUPS
      : ARC_SETUPS.filter((s) => s.angle <= 120);
    const setup = pick(setups);
    const r = pick(setup.radii);
    const unit = pick(["cm", "m"]);
    const arc = (setup.angle / 360) * 2 * Math.PI * r;
    const exact = arc + 2 * r;

    return withCheck({
      topic: "sectorPerimeter",
      text: `Calculate the perimeter of the sector (arc + two radii), correct to 1 decimal place.`,
      answer: round1(exact).toFixed(1),
      feedback: `Arc = (${setup.angle} ÷ 360) × 2 × π × ${r} ≈ ${round1(arc).toFixed(1)}. Perimeter = arc + 2 × ${r} ≈ ${round1(exact).toFixed(1)} ${unit}.`,
      inputMode: "simple",
      diagramType: "sectorArc",
      diagramData: { angle: setup.angle, radius: r, unit },
    }, approxCheck(exact));
  },
};

// ---- 9. Semicircles & quadrants ---------------------------------------------

export const partialCircle = {
  id: "partialCircle",
  name: "Semicircles & Quadrants",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["circumference"],
  nextSkillIds: ["curvedComposite"],

  generate(level) {
    const kind = level <= 2 ? "semicircle" : pick(["semicircle", "quadrant"]);
    const r = randInt(3, level <= 2 ? 10 : 16);
    const unit = pick(["cm", "m"]);
    const arc = kind === "semicircle" ? Math.PI * r : (Math.PI * r) / 2;
    const exact = arc + 2 * r;

    if (kind === "semicircle") {
      // Teacher fix: semicircles are labelled with the DIAMETER, and the text
      // never restates what the diagram shows.
      const d = 2 * r;
      return withCheck({
        topic: "partialCircle",
        text: `The diagram shows a semicircle.\nCalculate its perimeter, correct to 1 decimal place.`,
        answer: round1(exact).toFixed(1),
        feedback: `Curved part = (π × ${d}) ÷ 2 ≈ ${round1(arc).toFixed(1)}; straight edge (the diameter) = ${d}. Perimeter ≈ ${round1(exact).toFixed(1)} ${unit}.`,
        inputMode: "simple",
        diagramType: "sectorArc",
        diagramData: { angle: 180, radius: r, unit, labelMode: "diameter", labelValue: d },
      }, approxCheck(exact));
    }

    return withCheck({
      topic: "partialCircle",
      text: `The diagram shows a quadrant of a circle.\nCalculate its perimeter (arc + two radii), correct to 1 decimal place.`,
      answer: round1(exact).toFixed(1),
      feedback: `Arc = (π × ${r}) ÷ 2 ≈ ${round1(arc).toFixed(1)}; two radii = ${2 * r}. Perimeter ≈ ${round1(exact).toFixed(1)} ${unit}.`,
      inputMode: "simple",
      diagramType: "sectorArc",
      diagramData: { angle: 90, radius: r, unit },
    }, approxCheck(exact));
  },
};

// ---- 10. Curved composite figures ---------------------------------------------

export const curvedComposite = {
  id: "curvedComposite",
  name: "Composite Figures (with circles)",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["partialCircle", "compositeRectilinear"],
  nextSkillIds: [],

  generate(level) {
    const pool = level <= 2 ? ["rectangleSemicircle", "stadium"]
      : level <= 4 ? ["rectangleSemicircle", "stadium", "archRectangle", "squareQuadrantCutout"]
      : ["archRectangle", "squareQuadrantCutout", "fourSemicircleSquare", "stadium"];
    const shape = pick(pool);
    const unit = pick(["cm", "m"]);

    let data, exact, text, hint;
    if (shape === "stadium") {
      const w = randInt(8, 20);
      const h = randInt(4, Math.min(12, w - 1));
      exact = 2 * w + Math.PI * h;
      data = { shape, unit, w, h };
      text = `The running track is a rectangle with a semicircle on each end (width ${h} ${unit}).`;
      hint = `Two straights + a full circle of diameter ${h}: P = 2 × ${w} + π × ${h} ≈ ${round1(exact).toFixed(1)} ${unit}.`;
    } else if (shape === "archRectangle") {
      const w = randInt(6, 14);
      const h = randInt(4, 10);
      exact = w + 2 * h + (Math.PI * w) / 2;
      data = { shape, unit, w, h };
      text = `The window is a rectangle with a semicircle on top (the dashed line is not part of the boundary).`;
      hint = `Bottom + two sides + semicircular arc: ${w} + 2 × ${h} + (π × ${w}) ÷ 2 ≈ ${round1(exact).toFixed(1)} ${unit}.`;
    } else if (shape === "squareQuadrantCutout") {
      const side = randInt(4, 14);
      exact = 2 * side + (Math.PI * side) / 2;
      data = { shape, unit, side };
      text = `The figure is bounded by two straight sides and a quarter-circle arc (the dashed lines are not part of the boundary).`;
      hint = `Two sides + quarter arc of radius ${side}: 2 × ${side} + (2 × π × ${side}) ÷ 4 ≈ ${round1(exact).toFixed(1)} ${unit}.`;
    } else if (shape === "fourSemicircleSquare") {
      const side = randInt(4, 12);
      exact = 2 * Math.PI * side;
      data = { shape, unit, side };
      text = `Four semicircles sit on the sides of a square (dashed). Each semicircle has diameter ${side} ${unit}.`;
      hint = `Each arc = (π × ${side}) ÷ 2; four of them = 2 × π × ${side} ≈ ${round1(exact).toFixed(1)} ${unit}.`;
    } else {
      const w = randInt(6, 16);
      const h = randInt(4, 12);
      exact = 2 * w + h + (Math.PI * h) / 2;
      data = { shape, unit, w, h };
      text = `The figure is a rectangle with a semicircle on one end (the dashed line is not part of the boundary).`;
      hint = `Top + bottom + left side + semicircular arc: 2 × ${w} + ${h} + (π × ${h}) ÷ 2 ≈ ${round1(exact).toFixed(1)} ${unit}.`;
    }

    return withCheck({
      topic: "curvedComposite",
      text: `${text}\nFind the perimeter of the figure, correct to 1 decimal place.`,
      answer: round1(exact).toFixed(1),
      feedback: hint,
      inputMode: "simple",
      diagramType: "curvedComposite",
      diagramData: data,
    }, approxCheck(exact));
  },
};

// The full ordered skill list for the Length topic.
export const LENGTH_SKILLS_LIST = [
  quadPerimeter,
  missingSidePerimeter,
  compositeRectilinear,
  circleFeatures,
  circumference,
  circumferenceExact,
  arcLength,
  sectorPerimeter,
  partialCircle,
  curvedComposite,
];

export default LENGTH_SKILLS_LIST;
