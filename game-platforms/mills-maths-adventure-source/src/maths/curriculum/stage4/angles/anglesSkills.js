import { randInt, pick, makeQuestion } from "../../../helpers.js";

/**
 * STAGE 4 · Angle Relationships — NATIVE skills (Phase 3G). Rebuilt WELL beyond
 * the CHHS angle bank / engine: full NESA coverage of geometry language &
 * conventions, angles at a point, the transversal family (naming + reasons +
 * reverse justification), a TRUE protractor (angle = difference of two non-zero
 * readings), and multi-step chained reasoning.
 *
 * DIFFICULTY BANDING (skill ORDER = concept progression; each skill's levels
 * 1–5 add numeric/step load per DIFFICULTY_INTENT):
 *   A. Language & convention .... naming → conventions → angleTypes
 *   B. One relationship at a point complementarySupplementary → adjacentVertical
 *                                 → anglesAtPoint (straight/right/point, reasons)
 *   C. Measuring ................ protractor (read a DIFFERENCE, choose a scale)
 *   D. Parallel-line pairs ...... namePair (identify) → parallelAngles (solve +
 *                                 reason) → parallelReason (choose the reason)
 *   E. Reverse reasoning ........ areParallel (justify parallel-or-not)
 *   F. Chained reasoning ........ multiStep (several relationships, each reasoned)
 *
 * GRADING: values are numeric (bare number; "N°" also accepted). Naming, type
 * and reason questions are multiple-choice (always 4 distinct options). Every
 * reason is spelled out in the worked feedback, using clean ∠ ° ⊥ ∥ notation.
 */
const SYL = "MA4-ANG";

// Canonical angle-fact reasons (single source of truth — reused in feedback and
// as the correct option in reason questions).
const R = {
  straight: "Angles on a straight line add to 180°.",
  point: "Angles at a point add to 360°.",
  right: "Angles in a right angle add to 90°.",
  vert: "Vertically opposite angles are equal.",
  comp: "Complementary angles add to 90°.",
  supp: "Supplementary angles add to 180°.",
  corr: "Corresponding angles on parallel lines are equal.",
  alt: "Alternate angles on parallel lines are equal.",
  coint: "Co-interior angles on parallel lines are supplementary.",
};

// ---- helpers ----------------------------------------------------------------

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// EXACTLY n distinct options including `correct`, back-filled from `pool`.
function optionsOf(correct, pool, n = 4) {
  const out = [correct];
  for (const c of pool) {
    if (out.length >= n) break;
    if (c != null && !out.includes(c)) out.push(c);
  }
  return shuffle(out);
}

const D = (v) => `${v}°`;

// A numeric-degree answer (student types the number; "N°" also accepted).
function degQ(config, value) {
  return makeQuestion({ ...config, inputMode: "simple", answer: String(value), acceptableAnswers: [`${value}°`] });
}

// A multiple-choice question (naming / type / reason).
function mcQ(config, correct, options) {
  return makeQuestion({ ...config, answerMode: "multipleChoice", answer: correct, options });
}

// Every angle-fact reason (parallel + non-parallel) — the pool the reason
// multiple-choice draws from.
const ALL_REASONS = Object.values(R);

/**
 * A "value + reason" question (teacher request): the student BOTH types the
 * value of x AND selects the correct reason from four options drawn from the
 * full list of angle-fact reasons. Graded as a two-part question — both parts
 * must be right. `correctReason` must be one of the R.* strings.
 */
function valueReasonQ(config, value, correctReason) {
  const options = optionsOf(correctReason, shuffle(ALL_REASONS.filter((r) => r !== correctReason)));
  return makeQuestion({
    ...config,
    answerMode: "multiPart",
    answer: String(value),
    expectedParts: [
      { label: "x =", prompt: "The value of x", answer: String(value), acceptableAnswers: [`${value}°`] },
      { label: "Reason", prompt: "Choose the correct reason", answer: correctReason, options },
    ],
  });
}

// Parallel-line geometry: the size of a named sector for transversal bearing θ.
function sectorSize(sector, theta) {
  const sizes = { upperRight: theta, upperLeft: 180 - theta, lowerLeft: theta, lowerRight: 180 - theta };
  return Math.round(sizes[sector]);
}
// The standard angle-pair positions for each relationship (top sector, bottom sector).
const PAIRS = {
  corresponding: [["upperRight", "upperRight"], ["upperLeft", "upperLeft"], ["lowerLeft", "lowerLeft"], ["lowerRight", "lowerRight"]],
  alternate: [["lowerLeft", "upperRight"], ["lowerRight", "upperLeft"]],
  "co-interior": [["lowerLeft", "upperLeft"], ["lowerRight", "upperRight"]],
};
const OPPOSITE = { upperRight: "lowerLeft", lowerLeft: "upperRight", upperLeft: "lowerRight", lowerRight: "upperLeft" };
const relName = (rel) => (rel === "co-interior" ? "co-interior" : rel);
const relReason = (rel) => (rel === "co-interior" ? R.coint : rel === "alternate" ? R.alt : R.corr);

// Three non-collinear points around a chosen vertex, for naming figures.
function anglePointsFor(bearingA, bearingB) {
  const vx = 175, vy = 130, L = 92;
  const P = (b, len) => ({ x: vx + Math.cos((b * Math.PI) / 180) * len, y: vy - Math.sin((b * Math.PI) / 180) * len });
  return { v: { x: vx, y: vy }, a: P(bearingA, L), b: P(bearingB, L) };
}

// ---- A1. Naming & notation ---------------------------------------------------

export const naming = {
  id: "naming",
  name: "Naming & Notation",
  syllabusArea: SYL,
  prerequisiteSkillIds: [],
  nextSkillIds: ["conventions"],

  generate(level) {
    // A rotating set of naming/notation tasks; the harder levels add naming an
    // angle three ways, arms, and reflex angles.
    const va = randInt(20, 70), vb = randInt(110, 160);
    const pts = anglePointsFor(va, vb);
    const figure = {
      points: [
        { id: "A", x: pts.a.x, y: pts.a.y, label: "A" },
        { id: "B", x: pts.v.x, y: pts.v.y, label: "B", labelDy: 20 },
        { id: "C", x: pts.b.x, y: pts.b.y, label: "C" },
      ],
      segments: [{ from: "B", to: "A", type: "ray" }, { from: "B", to: "C", type: "ray" }],
      angles: [{ vertex: "B", from: "A", to: "C", r: 24 }],
    };

    if (level <= 1) {
      return mcQ({
        topic: "naming",
        text: `The angle is drawn with three labelled points.\nWhich point is the VERTEX of the angle?`,
        feedback: `The vertex is the point where the two arms meet — here that is B.`,
        diagramType: "geometryFigure",
        diagramData: figure,
      }, "B", optionsOf("B", ["A", "C", "The interval AC"]));
    }

    if (level === 2) {
      return mcQ({
        topic: "naming",
        text: `Which is a correct name for the marked angle?`,
        feedback: `Name an angle with the VERTEX letter in the middle: ∠ABC (or ∠CBA). The vertex B must be the middle letter.`,
        diagramType: "geometryFigure",
        diagramData: figure,
      }, "∠ABC", optionsOf("∠ABC", ["∠BAC", "∠ACB", "∠CAB", "∠BCA"]));
    }

    if (level === 3) {
      // Naming a ray, line or interval with capitals.
      const figure2 = {
        points: [{ id: "P", x: 70, y: 120, label: "P" }, { id: "Q", x: 285, y: 120, label: "Q" }],
        segments: [{ from: "P", to: "Q", type: "interval", ticks: 0 }],
      };
      return mcQ({
        topic: "naming",
        text: `The diagram shows the interval joining the two points.\nWhat is the correct name for this interval?`,
        feedback: `An interval is named by its two endpoints in capitals: interval PQ.`,
        diagramType: "geometryFigure",
        diagramData: figure2,
      }, "Interval PQ", optionsOf("Interval PQ", ["Ray PQ", "Line PQ", "Point PQ"]));
    }

    if (level === 4) {
      return mcQ({
        topic: "naming",
        text: `For the angle ∠ABC, which two intervals are the ARMS of the angle?`,
        feedback: `The arms are the two rays from the vertex B: BA and BC.`,
        diagramType: "geometryFigure",
        diagramData: figure,
      }, "BA and BC", optionsOf("BA and BC", ["AB and AC", "CA and CB", "AC and the vertex B"]));
    }

    // Level 5: reflex vs the marked angle — naming the reflex angle.
    return mcQ({
      topic: "naming",
      text: `The marked (green) angle at O is less than 180°.\nWhat name is given to the LARGER angle on the other side of the arms?`,
      feedback: `The angle greater than 180° (but less than 360°) is the REFLEX angle.`,
      diagramType: "geometryFigure",
      diagramData: {
        points: [
          { id: "P", x: 275, y: 90, label: "P" },
          { id: "O", x: 175, y: 135, label: "O", labelDy: 20 },
          { id: "Q", x: 80, y: 95, label: "Q" },
        ],
        segments: [{ from: "O", to: "P", type: "ray" }, { from: "O", to: "Q", type: "ray" }],
        angles: [{ vertex: "O", from: "P", to: "Q", r: 26, accent: true }],
      },
    }, "The reflex angle", optionsOf("The reflex angle", ["A right angle", "A straight angle", "An acute angle"]));
  },
};

// ---- A2. Diagram conventions (markings, ⊥, ∥, transversal) -------------------

export const conventions = {
  id: "conventions",
  name: "Marks, Symbols & Transversals",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["naming"],
  nextSkillIds: ["angleTypes"],

  generate(level) {
    if (level <= 1) {
      return mcQ({
        topic: "conventions",
        text: `A small square is drawn inside the angle at B.\nWhat does this marking tell you?`,
        feedback: `A small square marks a RIGHT ANGLE — the angle is exactly 90°.`,
        diagramType: "geometryFigure",
        diagramData: {
          points: [{ id: "A", x: 285, y: 130, label: "A" }, { id: "B", x: 110, y: 130, label: "B", labelDy: 20 }, { id: "C", x: 110, y: 40, label: "C" }],
          segments: [{ from: "B", to: "A", type: "ray" }, { from: "B", to: "C", type: "ray" }],
          angles: [{ vertex: "B", from: "A", to: "C", right: true }],
        },
      }, "The angle is a right angle (90°)", optionsOf("The angle is a right angle (90°)", ["The angle is 45°", "The two arms are equal in length", "The angle is a straight angle"]));
    }

    if (level === 2) {
      return mcQ({
        topic: "conventions",
        text: `Two angles are drawn with the SAME arc marking.\nWhat does the matching arc marking mean?`,
        feedback: `Matching arc marks show the angles are EQUAL in size.`,
        diagramType: "geometryFigure",
        // The two marked angles ∠AOB and ∠BOC are drawn EQUAL (arms at 0°, 55°,
        // 110° from O) so the matching-mark convention actually looks matched
        // (teacher fix — an equal pair must be drawn equal, not one obtuse + one
        // acute). Both arcs share the same radius and carry one tick.
        diagramData: {
          points: [
            { id: "O", x: 175, y: 140, label: "O", labelDy: 20 },
            { id: "A", x: 280, y: 140, label: "A" }, { id: "B", x: 235, y: 54, label: "B" }, { id: "C", x: 139, y: 41, label: "C" },
          ],
          segments: [{ from: "O", to: "A", type: "ray" }, { from: "O", to: "B", type: "ray" }, { from: "O", to: "C", type: "ray" }],
          angles: [{ vertex: "O", from: "A", to: "B", ticks: 1, r: 32 }, { vertex: "O", from: "B", to: "C", ticks: 1, r: 32 }],
        },
      }, "The two angles are equal", optionsOf("The two angles are equal", ["The two angles add to 90°", "The two angles add to 180°", "Both angles are right angles"]));
    }

    if (level === 3) {
      return mcQ({
        topic: "conventions",
        text: `The two intervals AB and CD each have a single tick mark.\nWhat does the tick marking mean?`,
        feedback: `Matching tick marks show the intervals are EQUAL in length.`,
        diagramType: "geometryFigure",
        diagramData: {
          points: [
            { id: "A", x: 55, y: 80, label: "A" }, { id: "B", x: 175, y: 80, label: "B" },
            { id: "C", x: 55, y: 160, label: "C" }, { id: "D", x: 175, y: 160, label: "D" },
          ],
          segments: [{ from: "A", to: "B", type: "interval", ticks: 1 }, { from: "C", to: "D", type: "interval", ticks: 1 }],
        },
      }, "The intervals AB and CD are equal in length", optionsOf("The intervals AB and CD are equal in length", ["The intervals are parallel", "The intervals are perpendicular", "The angles at A and C are equal"]));
    }

    if (level === 4) {
      // ⊥ vs ∥ symbols.
      const perp = pick([true, false]);
      const correct = perp ? "The lines are perpendicular (they meet at 90°)" : "The lines are parallel (they never meet)";
      return mcQ({
        topic: "conventions",
        text: `Two lines are described by the statement  ${perp ? "PQ ⊥ RS" : "AB ∥ CD"}.\nWhat does this statement mean?`,
        feedback: perp
          ? `The symbol ⊥ means "is perpendicular to": PQ and RS meet at a right angle (90°).`
          : `The symbol ∥ means "is parallel to": AB and CD are parallel and never meet.`,
        diagramType: "geometryFigure",
        diagramData: perp
          ? {
              points: [{ id: "P", x: 175, y: 40, label: "P" }, { id: "X", x: 175, y: 130, label: "" }, { id: "Q", x: 175, y: 190, label: "Q" }, { id: "R", x: 60, y: 130, label: "R" }, { id: "S", x: 290, y: 130, label: "S" }],
              segments: [{ from: "P", to: "Q", type: "line" }, { from: "R", to: "S", type: "line" }],
              angles: [{ vertex: "X", from: "S", to: "P", right: true }],
            }
          : {
              points: [{ id: "A", x: 55, y: 85, label: "A" }, { id: "B", x: 300, y: 85, label: "B" }, { id: "C", x: 55, y: 160, label: "C" }, { id: "D", x: 300, y: 160, label: "D" }],
              segments: [{ from: "A", to: "B", type: "line", chevrons: 1 }, { from: "C", to: "D", type: "line", chevrons: 1 }],
            },
      }, correct, optionsOf(correct, [
        perp ? "The lines are parallel (they never meet)" : "The lines are perpendicular (they meet at 90°)",
        "The lines are equal in length",
        "The lines are the same line",
      ]));
    }

    // Level 5: define a transversal.
    return mcQ({
      topic: "conventions",
      text: `Two parallel lines are crossed by a third line.\nWhat is the name for the third line (the one that cuts across the other two)?`,
      feedback: `A line that crosses two or more other lines is called a TRANSVERSAL.`,
      diagramType: "parallelTransversal",
      diagramData: { acute: 58, direction: "rising", top: [], bottom: [], parallelMarks: true },
    }, "A transversal", optionsOf("A transversal", ["A tangent", "A perpendicular", "A bisector"]));
  },
};

// ---- A3. Classifying angles by size -----------------------------------------

const TYPE_OF = (a) => (a === 90 ? "Right angle" : a === 180 ? "Straight angle" : a === 360 ? "Angle of revolution" : a < 90 ? "Acute angle" : a < 180 ? "Obtuse angle" : "Reflex angle");

export const angleTypes = {
  id: "angleTypes",
  name: "Types of Angles",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["naming"],
  nextSkillIds: ["complementarySupplementary"],

  generate(level) {
    // Choose a value whose TYPE the student must name; harder levels sit near
    // the boundaries and include straight / reflex / revolution.
    let value;
    if (level <= 1) value = pick([30, 45, 60, 90, 120, 135]);
    else if (level === 2) value = pick([90, 180, randInt(20, 80), randInt(100, 170)]);
    else if (level === 3) value = pick([180, 360, randInt(200, 340), randInt(20, 80)]);
    else value = pick([89, 91, 90, 179, 181, 180, 270, 359]);

    const type = TYPE_OF(value);
    const options = optionsOf(type, shuffle(["Acute angle", "Right angle", "Obtuse angle", "Straight angle", "Reflex angle", "Angle of revolution"]).filter((t) => t !== type));

    // Draw the angle (a revolution/reflex is drawn as the appropriate arc).
    const bearingB = value >= 360 ? 359.9 : value;
    const dd = {
      arms: value >= 360 ? [0] : [0, bearingB],
      sectors: value >= 360
        ? [{ from: 0, to: 359.9, label: `${value}°`, kind: "known" }]
        : [{ from: 0, to: bearingB, label: `${value}°`, kind: "known" }],
    };
    return mcQ({
      topic: "angleTypes",
      text: `What type of angle is shown (${value}°)?`,
      feedback: `${value}° is ${type.toLowerCase()}. (Acute < 90°, right = 90°, obtuse 90–180°, straight = 180°, reflex 180–360°, revolution = 360°.)`,
      diagramType: "angleAtVertex",
      diagramData: dd,
    }, type, options);
  },
};

// ---- B1. Complementary & supplementary (named vocabulary) -------------------

export const complementarySupplementary = {
  id: "complementarySupplementary",
  name: "Complementary & Supplementary",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["angleTypes"],
  nextSkillIds: ["adjacentVertical"],

  generate(level) {
    if (level <= 1) {
      const a = randInt(15, 75);
      return degQ({
        topic: "complementarySupplementary",
        text: `Two angles are COMPLEMENTARY.\nOne of them is ${a}°. Find the other.`,
        feedback: `${R.comp} Other = 90° − ${a}° = ${90 - a}°.`,
      }, 90 - a);
    }
    if (level === 2) {
      const a = randInt(20, 160);
      return degQ({
        topic: "complementarySupplementary",
        text: `Two angles are SUPPLEMENTARY.\nOne of them is ${a}°. Find the other.`,
        feedback: `${R.supp} Other = 180° − ${a}° = ${180 - a}°.`,
      }, 180 - a);
    }
    if (level === 3) {
      // Name the relationship from a pair that adds to 90 or 180.
      const supp = pick([true, false]);
      const a = supp ? randInt(30, 150) : randInt(20, 70);
      const b = (supp ? 180 : 90) - a;
      const correct = supp ? "Supplementary" : "Complementary";
      return mcQ({
        topic: "complementarySupplementary",
        text: `${a}° and ${b}° add to ${supp ? 180 : 90}°.\nWhat name is given to this pair of angles?`,
        feedback: supp ? R.supp : R.comp,
        diagramType: "angleAtVertex",
        diagramData: supp
          ? { arms: [0, a, 180], sectors: [{ from: 0, to: a, label: D(a) }, { from: a, to: 180, label: D(b) }] }
          : { arms: [0, a, 90], sectors: [{ from: 0, to: a, label: D(a) }, { from: a, to: 90, label: D(b) }, { from: 0, to: 90, kind: "right" }] },
      }, correct, optionsOf(correct, ["Vertically opposite", "Adjacent", supp ? "Complementary" : "Supplementary"]));
    }
    if (level === 4) {
      // Find x in a complementary (right-angle) OR supplementary (straight) split.
      const supp = pick([true, false]);
      const a = supp ? randInt(35, 150) : randInt(15, 70);
      const x = (supp ? 180 : 90) - a;
      return valueReasonQ({
        topic: "complementarySupplementary",
        text: `Find the value of x, then choose the reason.`,
        feedback: supp ? `${R.supp}\nx = 180° − ${a}° = ${x}°.` : `${R.comp}\nx = 90° − ${a}° = ${x}°.`,
        diagramType: "angleAtVertex",
        diagramData: supp
          ? { arms: [0, a, 180], sectors: [{ from: 0, to: a, label: D(a) }, { from: a, to: 180, label: "x", kind: "missing" }] }
          : { arms: [0, a, 90], sectors: [{ from: 0, to: a, label: D(a) }, { from: a, to: 90, label: "x", kind: "missing" }, { from: 0, to: 90, kind: "right" }] },
      }, x, supp ? R.supp : R.comp);
    }
    // Level 5: choose the correct statement/reason.
    const comp = pick([true, false]);
    const a = comp ? randInt(20, 70) : randInt(30, 150);
    const correct = comp ? R.comp : R.supp;
    return mcQ({
      topic: "complementarySupplementary",
      text: `x and ${a}° together ${comp ? "form a right angle" : "lie on a straight line"}.\nWhich statement correctly describes them?`,
      feedback: `${correct} So x = ${(comp ? 90 : 180) - a}°.`,
      diagramType: "angleAtVertex",
      diagramData: comp
        ? { arms: [0, a, 90], sectors: [{ from: 0, to: a, label: D(a) }, { from: a, to: 90, label: "x", kind: "missing" }, { from: 0, to: 90, kind: "right" }] }
        : { arms: [0, a, 180], sectors: [{ from: 0, to: a, label: D(a) }, { from: a, to: 180, label: "x", kind: "missing" }] },
    }, correct, optionsOf(correct, [comp ? R.supp : R.comp, R.vert, R.straight].filter((r) => r !== correct)));
  },
};

// ---- B2. Adjacent & vertically opposite angles ------------------------------

export const adjacentVertical = {
  id: "adjacentVertical",
  name: "Adjacent & Vertically Opposite",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["complementarySupplementary"],
  nextSkillIds: ["anglesAtPoint"],

  generate(level) {
    if (level <= 1) {
      return mcQ({
        topic: "adjacentVertical",
        text: `Two angles share a common vertex and a common arm, and do not overlap.\nWhat are these angles called?`,
        feedback: `Angles that share a common vertex and a common arm are ADJACENT angles.`,
        diagramType: "angleAtVertex",
        diagramData: { arms: [0, 55, 130], sectors: [{ from: 0, to: 55, label: "a" }, { from: 55, to: 130, label: "b" }] },
      }, "Adjacent angles", optionsOf("Adjacent angles", ["Vertically opposite angles", "Complementary angles", "Corresponding angles"]));
    }

    // A crossing-lines figure for the remaining levels.
    const base = randInt(0, 30);
    const known = randInt(35, 145);
    const b2 = base + known; // second line bearing
    const lines = [base, b2];
    // Four sectors around the point.
    const s = [
      { from: base, to: b2 },              // known (size `known`)
      { from: b2, to: base + 180 },        // adjacent (180 - known)
      { from: base + 180, to: b2 + 180 },  // vertically opposite known (= known)
      { from: b2 + 180, to: base + 360 },  // (180 - known)
    ];

    if (level === 2) {
      // x is vertically opposite the known → equal.
      return valueReasonQ({
        topic: "adjacentVertical",
        text: `Two straight lines cross.\nFind the value of x, then choose the reason.`,
        feedback: `${R.vert} x = ${known}°.`,
        diagramType: "crossingLines",
        diagramData: {
          lines,
          sectors: [
            { from: s[0].from, to: s[0].to, label: D(known), kind: "equal", tickCount: 1 },
            { from: s[2].from, to: s[2].to, label: "x", kind: "missing" },
          ],
        },
      }, known, R.vert);
    }

    if (level === 3) {
      // Identify which pair is vertically opposite.
      return mcQ({
        topic: "adjacentVertical",
        text: `Two straight lines cross at O, making four angles a, b, c, d in order around the point.\nWhich pair is VERTICALLY OPPOSITE?`,
        feedback: `Vertically opposite angles sit across the vertex from each other: a and c (and likewise b and d). ${R.vert}`,
        diagramType: "crossingLines",
        diagramData: {
          lines,
          sectors: [
            { from: s[0].from, to: s[0].to, label: "a" },
            { from: s[1].from, to: s[1].to, label: "b" },
            { from: s[2].from, to: s[2].to, label: "c" },
            { from: s[3].from, to: s[3].to, label: "d" },
          ],
        },
      }, "a and c", optionsOf("a and c", ["a and b", "b and c", "a and d"]));
    }

    if (level === 4) {
      // Given an adjacent angle, find x that is vertically opposite it (2 ideas —
      // more than one valid path, so the value alone is asked for).
      const adj = 180 - known;
      return degQ({
        topic: "adjacentVertical",
        text: `Two straight lines cross.\nFind the value of x.`,
        feedback: `Angles on a straight line: the angle next to ${known}° is 180° − ${known}° = ${adj}°.\n${R.vert} x = ${adj}°.`,
        diagramType: "crossingLines",
        diagramData: {
          lines,
          sectors: [
            { from: s[0].from, to: s[0].to, label: D(known), kind: "known" },
            { from: s[3].from, to: s[3].to, label: "x", kind: "missing" },
          ],
        },
      }, adj);
    }

    // Level 5: choose the reason justifying x.
    return mcQ({
      topic: "adjacentVertical",
      text: `Two straight lines cross. x is directly opposite the ${known}° angle.\nWhich reason gives x = ${known}°?`,
      feedback: `${R.vert}`,
      diagramType: "crossingLines",
      diagramData: {
        lines,
        sectors: [
          { from: s[0].from, to: s[0].to, label: D(known), kind: "equal", tickCount: 1 },
          { from: s[2].from, to: s[2].to, label: "x", kind: "missing" },
        ],
      },
    }, R.vert, optionsOf(R.vert, [R.straight, R.supp, R.corr]));
  },
};

// ---- B3. Angles at a point (straight line / right angle / around a point) ---

export const anglesAtPoint = {
  id: "anglesAtPoint",
  name: "Angles at a Point",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["adjacentVertical"],
  nextSkillIds: ["protractor"],

  generate(level) {
    if (level <= 1) {
      // Straight line, one known.
      const a = randInt(35, 145);
      const x = 180 - a;
      return valueReasonQ({
        topic: "anglesAtPoint",
        text: `Find the value of x, then choose the reason.`,
        feedback: `${R.straight}\nx = 180° − ${a}° = ${x}°.`,
        diagramType: "angleAtVertex",
        diagramData: { arms: [0, a, 180], sectors: [{ from: 0, to: a, label: D(a) }, { from: a, to: 180, label: "x", kind: "missing" }] },
      }, x, R.straight);
    }

    if (level === 2) {
      // Right angle split.
      const a = randInt(20, 70);
      const x = 90 - a;
      return valueReasonQ({
        topic: "anglesAtPoint",
        text: `Find the value of x, then choose the reason.`,
        feedback: `${R.right}\nx = 90° − ${a}° = ${x}°.`,
        diagramType: "angleAtVertex",
        diagramData: { arms: [0, a, 90], sectors: [{ from: 0, to: a, label: D(a) }, { from: a, to: 90, label: "x", kind: "missing" }, { from: 0, to: 90, kind: "right" }] },
      }, x, R.right);
    }

    if (level === 3) {
      // Straight line, two knowns (three adjacent angles).
      let a, b;
      do { a = randInt(30, 90); b = randInt(30, 90); } while (180 - a - b < 20);
      const x = 180 - a - b;
      return valueReasonQ({
        topic: "anglesAtPoint",
        text: `Find the value of x, then choose the reason.`,
        feedback: `${R.straight}\nx = 180° − (${a}° + ${b}°) = ${x}°.`,
        diagramType: "angleAtVertex",
        diagramData: { arms: [0, a, a + b, 180], sectors: [{ from: 0, to: a, label: D(a) }, { from: a, to: a + b, label: D(b) }, { from: a + b, to: 180, label: "x", kind: "missing" }] },
      }, x, R.straight);
    }

    if (level === 4) {
      // Around a point, one or two knowns.
      const two = pick([true, false]);
      let a, b, x;
      if (two) { do { a = randInt(80, 150); b = randInt(80, 150); x = 360 - a - b; } while (x < 40 || x > 200); }
      else { a = randInt(120, 300); x = 360 - a; }
      const arms = two ? [20, 20 + a, 20 + a + b] : [20, 20 + a];
      const sectors = two
        ? [{ from: 20, to: 20 + a, label: D(a) }, { from: 20 + a, to: 20 + a + b, label: D(b) }, { from: 20 + a + b, to: 380, label: "x", kind: "missing" }]
        : [{ from: 20, to: 20 + a, label: D(a) }, { from: 20 + a, to: 380, label: "x", kind: "missing" }];
      return valueReasonQ({
        topic: "anglesAtPoint",
        text: `Find the value of x, then choose the reason.`,
        feedback: `${R.point}\nx = 360° − ${two ? `(${a}° + ${b}°)` : `${a}°`} = ${x}°.`,
        diagramType: "angleAtVertex",
        diagramData: { arms, sectors },
      }, x, R.point);
    }

    // Level 5: reason MC for an angles-at-a-point situation.
    const around = pick([true, false]);
    const correct = around ? R.point : R.straight;
    const a = around ? randInt(120, 300) : randInt(35, 145);
    const x = (around ? 360 : 180) - a;
    return mcQ({
      topic: "anglesAtPoint",
      text: `Which reason lets you find x in this diagram?`,
      feedback: `${correct} So x = ${around ? 360 : 180}° − ${a}° = ${x}°.`,
      diagramType: "angleAtVertex",
      diagramData: around
        ? { arms: [20, 20 + a], sectors: [{ from: 20, to: 20 + a, label: D(a) }, { from: 20 + a, to: 380, label: "x", kind: "missing" }] }
        : { arms: [0, a, 180], sectors: [{ from: 0, to: a, label: D(a) }, { from: a, to: 180, label: "x", kind: "missing" }] },
    }, correct, optionsOf(correct, [around ? R.straight : R.point, R.right, R.vert]));
  },
};

// ---- C. Protractor (angle = DIFFERENCE of two non-zero readings) ------------

export const protractor = {
  id: "protractor",
  name: "Reading a Protractor",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["anglesAtPoint"],
  nextSkillIds: ["namePair"],

  generate(level) {
    // BOTH arms sit at non-zero readings; the answer is the DIFFERENCE. Levels
    // escalate: same-side subtraction → straddle 90° (crossing scales) → close
    // readings / near the ends (still never 0° or 180°).
    let a, b;
    if (level <= 1) { a = pick([10, 15, 20, 25, 30]); b = a + pick([25, 30, 35, 40]); }
    else if (level === 2) { a = pick([20, 25, 30, 35, 40]); b = a + pick([45, 50, 55, 60]); }
    else if (level === 3) { a = randInt(20, 75); b = randInt(100, 160); } // straddle 90°
    else if (level === 4) { a = randInt(10, 70); b = a + pick([15, 20, 25]); } // finer subtraction
    else { a = pick([10, 15, 20]); b = pick([150, 160, 165, 170]); } // wide, near the ends
    if (b > 178) b = 178;
    if (a === b) b = a + 20;
    const lo = Math.min(a, b), hi = Math.max(a, b);
    const answer = hi - lo;
    const straddle = lo < 90 && hi > 90;
    return degQ({
      topic: "protractor",
      text: `Read the size of the angle between the two arms of the protractor.`,
      feedback:
        `Read BOTH arms on the SAME scale, then SUBTRACT — the angle is the difference, not the number an arm points at.\n` +
        `Inner scale: the arms are at ${lo}° and ${hi}°, so the angle = ${hi}° − ${lo}° = ${answer}°.` +
        (straddle ? `\n(The arms lie on opposite sides of 90°, so take care to use one scale for both.)` : ``),
      diagramType: "protractor",
      diagramData: { armA: lo, armB: hi },
    }, answer);
  },
};

// ---- D1. Name the angle pair (corresponding / alternate / co-interior) -------

export const namePair = {
  id: "namePair",
  name: "Naming Angle Pairs",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["protractor"],
  nextSkillIds: ["parallelAngles"],

  generate(level) {
    const acute = randInt(35, 70);
    const direction = pick(["rising", "falling"]);
    let rel;
    if (level <= 1) rel = pick(["corresponding", "alternate"]);
    else if (level === 2) rel = pick(["corresponding", "alternate", "co-interior"]);
    else rel = pick(["corresponding", "alternate", "co-interior", "vertically opposite"]);

    const top = [], bottom = [];
    let correct;
    if (rel === "vertically opposite") {
      const atTop = pick([true, false]);
      const s1 = pick(["upperRight", "upperLeft", "lowerLeft", "lowerRight"]);
      const arr = atTop ? top : bottom;
      arr.push({ sector: s1, label: "p", accent: true });
      arr.push({ sector: OPPOSITE[s1], label: "q", accent: true });
      correct = "Vertically opposite angles";
    } else {
      const [ts, bs] = pick(PAIRS[rel]);
      top.push({ sector: ts, label: "p", accent: true });
      bottom.push({ sector: bs, label: "q", accent: true });
      correct = rel === "co-interior" ? "Co-interior angles" : rel === "alternate" ? "Alternate angles" : "Corresponding angles";
    }

    return mcQ({
      topic: "namePair",
      text: `Two parallel lines are cut by a transversal.\nWhat is the name of the marked angle pair (p and q)?`,
      feedback: `The marked pair are ${correct.toLowerCase()}.`,
      diagramType: "parallelTransversal",
      diagramData: { acute, direction, top, bottom, parallelMarks: true },
    }, correct, optionsOf(correct, ["Corresponding angles", "Alternate angles", "Co-interior angles", "Vertically opposite angles"].filter((o) => o !== correct)));
  },
};

// ---- D2. Solve on parallel lines (with a reason) ----------------------------

export const parallelAngles = {
  id: "parallelAngles",
  name: "Parallel Lines: Finding Angles",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["namePair"],
  nextSkillIds: ["parallelReason"],

  generate(level) {
    const acute = randInt(35, 70);
    const direction = pick(["rising", "falling"]);
    const theta = direction === "falling" ? 180 - acute : acute;
    let rel;
    if (level <= 2) rel = pick(["corresponding", "alternate"]);
    else if (level === 3) rel = "co-interior";
    else rel = pick(["corresponding", "alternate", "co-interior"]);

    const [ts, bs] = pick(PAIRS[rel]);
    const knownAtTop = pick([true, false]);
    const knownSector = knownAtTop ? ts : bs;
    const missingSector = knownAtTop ? bs : ts;
    const known = sectorSize(knownSector, theta);
    const answer = sectorSize(missingSector, theta);

    const top = [], bottom = [];
    (knownAtTop ? top : bottom).push({ sector: knownSector, label: D(known) });
    (knownAtTop ? bottom : top).push({ sector: missingSector, label: "x", accent: true });

    return valueReasonQ({
      topic: "parallelAngles",
      text: `The two lines are parallel.\nFind the value of x, then choose the reason.`,
      feedback: rel === "co-interior"
        ? `${R.coint}\nx = 180° − ${known}° = ${answer}°.`
        : `${relReason(rel)}\nx = ${answer}°.`,
      diagramType: "parallelTransversal",
      diagramData: { acute, direction, top, bottom, parallelMarks: true },
    }, answer, rel === "co-interior" ? R.coint : relReason(rel));
  },
};

// ---- D3. Choose the reason (graded reason MC) -------------------------------

export const parallelReason = {
  id: "parallelReason",
  name: "Parallel Lines: Reasons",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["parallelAngles"],
  nextSkillIds: ["areParallel"],

  generate(level) {
    const acute = randInt(35, 70);
    const direction = pick(["rising", "falling"]);
    const theta = direction === "falling" ? 180 - acute : acute;
    const rel = level <= 1 ? pick(["corresponding", "alternate"]) : level === 2 ? "co-interior" : pick(["corresponding", "alternate", "co-interior"]);
    const [ts, bs] = pick(PAIRS[rel]);
    const known = sectorSize(ts, theta);
    const answer = sectorSize(bs, theta);
    const correct = relReason(rel);

    const top = [{ sector: ts, label: D(known) }];
    const bottom = [{ sector: bs, label: "x", accent: true }];

    return mcQ({
      topic: "parallelReason",
      text: `The two lines are parallel and x = ${answer}°.\nWhich reason justifies this?`,
      feedback: `${correct}${rel === "co-interior" ? ` (x = 180° − ${known}° = ${answer}°)` : ` (equal angles, so x = ${answer}°)`}`,
      diagramType: "parallelTransversal",
      diagramData: { acute, direction, top, bottom, parallelMarks: true },
    }, correct, optionsOf(correct, [R.corr, R.alt, R.coint, R.vert].filter((r) => r !== correct)));
  },
};

// ---- E. Reverse reasoning: are the lines parallel? --------------------------

export const areParallel = {
  id: "areParallel",
  name: "Are the Lines Parallel?",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["parallelReason"],
  nextSkillIds: ["multiStep"],

  generate(level) {
    const acute = randInt(38, 68);
    const direction = pick(["rising", "falling"]);
    const theta = direction === "falling" ? 180 - acute : acute;
    const rel = level <= 1 ? "corresponding" : level === 2 ? "alternate" : level <= 4 ? "co-interior" : pick(["corresponding", "alternate", "co-interior"]);
    const [ts, bs] = pick(PAIRS[rel]);
    const topSize = sectorSize(ts, theta);
    const trueBottom = sectorSize(bs, theta);
    // Decide parallel-or-not; if not, offset the second angle so the test fails.
    const isParallel = pick([true, false]);
    const bottomSize = isParallel ? trueBottom : Math.min(155, Math.max(25, trueBottom + pick([-1, 1]) * randInt(12, 26)));
    const equalRel = rel !== "co-interior";
    const holds = equalRel ? topSize === bottomSize : topSize + bottomSize === 180;

    const desc = equalRel ? "equal" : "supplementary (add to 180°)";
    const relText = relName(rel);
    const correct = holds
      ? `Yes — the ${relText} angles are ${desc}, so the lines are parallel.`
      : `No — the ${relText} angles are not ${desc}, so the lines are not parallel.`;
    const distractors = [
      holds
        ? `No — the ${relText} angles are not ${desc}, so the lines are not parallel.`
        : `Yes — the ${relText} angles are ${desc}, so the lines are parallel.`,
      `Yes — all angles on a transversal are always equal.`,
      `No — a transversal can never make two lines parallel.`,
    ];

    const top = [{ sector: ts, label: D(topSize) }];
    const bottom = [{ sector: bs, label: D(bottomSize) }];

    return mcQ({
      topic: "areParallel",
      text: `The diagram (a sketch, not to scale) shows two lines cut by a transversal.\nUse the marked angles to decide: are the two lines parallel? Justify your answer.`,
      feedback: equalRel
        ? `Test the ${relText} angles: ${topSize}° and ${bottomSize}°. ${holds ? `They are equal, so the lines ARE parallel (${relText} angles equal).` : `They are NOT equal, so the lines are NOT parallel.`}`
        : `Test the co-interior angles: ${topSize}° + ${bottomSize}° = ${topSize + bottomSize}°. ${holds ? `They are supplementary (180°), so the lines ARE parallel.` : `They do not add to 180°, so the lines are NOT parallel.`}`,
      diagramType: "parallelTransversal",
      diagramData: { acute, direction, top, bottom, parallelMarks: false, caption: "Sketch — not to scale" },
    }, correct, optionsOf(correct, distractors));
  },
};

// ---- F. Multi-step chained reasoning ----------------------------------------

export const multiStep = {
  id: "multiStep",
  name: "Multi-Step Reasoning",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["areParallel"],
  nextSkillIds: [],

  generate(level) {
    // Multi-step problems can be solved by more than one valid chain of
    // relationships, so the question asks ONLY for the value (no forced path,
    // no reason to select). One worked route is shown in the feedback.
    const template = pick(["P", "C"]);

    if (template === "P") {
      const acute = randInt(38, 66);
      const direction = pick(["rising", "falling"]);
      const theta = direction === "falling" ? 180 - acute : acute;
      const a = sectorSize("upperRight", theta); // known at top upperRight
      const y = a;                                // corresponding at bottom upperRight
      const x = 180 - y;                          // straight line at bottom
      const top = [{ sector: "upperRight", label: D(a) }];
      const bottom = [{ sector: "upperRight", label: "y" }, { sector: "upperLeft", label: "x", accent: true }];
      return degQ({
        topic: "multiStep",
        text: `The two lines are parallel.\nFind the value of x.`,
        feedback: `One way: ${R.corr} so y = ${a}°. Then ${R.straight} x = 180° − ${y}° = ${x}°.\n(Other reasoning paths also give x = ${x}° — e.g. co-interior angles directly.)`,
        diagramType: "parallelTransversal",
        diagramData: { acute, direction, top, bottom, parallelMarks: true },
      }, x);
    }

    // Template C: crossing lines — a straight-line step then vertically opposite.
    const base = randInt(0, 25);
    const known = randInt(40, 80);
    const b2 = base + known;
    const lines = [base, b2];
    const adj = 180 - known;
    const x = adj;
    return degQ({
      topic: "multiStep",
      text: `Two straight lines cross.\nFind the value of x.`,
      feedback: `One way: ${R.straight} the angle next to ${known}° is 180° − ${known}° = ${adj}°. Then ${R.vert} x = ${x}°.\n(Other paths also reach x = ${x}°.)`,
      diagramType: "crossingLines",
      diagramData: { lines, sectors: [{ from: base, to: b2, label: D(known), kind: "known" }, { from: b2 + 180, to: base + 360, label: "x", kind: "missing" }] },
    }, x);
  },
};

// The full ordered skill list — the ORDER is the conceptual progression.
export const ANGLES_SKILLS_LIST = [
  naming,
  conventions,
  angleTypes,
  complementarySupplementary,
  adjacentVertical,
  anglesAtPoint,
  protractor,
  namePair,
  parallelAngles,
  parallelReason,
  areParallel,
  multiStep,
];

export default ANGLES_SKILLS_LIST;
