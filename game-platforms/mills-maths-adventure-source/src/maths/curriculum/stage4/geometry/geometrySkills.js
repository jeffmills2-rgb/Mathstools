import { randInt, pick, makeQuestion } from "../../../helpers.js";
import {
  makeTriangle, makeQuad, makeGenericQuad, customTriangle, buildSpec,
  propertiesOf, QUAD_PROPERTIES, QUAD_NAMES, SPECIAL_QUADS, TRIANGLE_TYPES,
} from "./shapeCatalogue.js";

/**
 * STAGE 4 · Properties of Geometrical Figures — NATIVE skills (Phase 3H). Built
 * from scratch on a shared, property-verified shape catalogue + two diagram
 * engines (GeometryShapeDiagram, GeometryProofDiagram). Full NESA coverage:
 * naming/labelling conventions, classifying triangles and quadrilaterals from
 * marked diagrams, describing/verifying properties, convex vs non-convex, the
 * classification hierarchy ("more than one type"), the angle-sum facts, the
 * three proofs (scaffolded on their constructions), and unknown side/angle
 * problems with reasons.
 *
 * DIFFICULTY BANDING (skill ORDER = concept progression; levels 1–5 add load):
 *   A naming → B triangleType, quadType → C shapeProperties, verifyProperty →
 *   D convexity → E hierarchy → F angleSums → G proofs → H unknownAngles,
 *   unknownSides, multiStep.
 */
const SYL = "MA4-PGF";

// Canonical reasons (single source of truth; reused in feedback + reason MCs).
const R = {
  triSum: "The angle sum of a triangle is 180°.",
  quadSum: "The angle sum of a quadrilateral is 360°.",
  exterior: "An exterior angle of a triangle equals the sum of the two interior opposite angles.",
  isoBase: "The base angles of an isosceles triangle are equal.",
  equilateral: "Every angle of an equilateral triangle is 60°.",
  straight: "Angles on a straight line add to 180°.",
  pgOppAngle: "Opposite angles of a parallelogram are equal.",
  pgCoInt: "Co-interior angles between parallel sides are supplementary.",
  pgOppSide: "Opposite sides of a parallelogram are equal.",
  rhombusSide: "All sides of a rhombus are equal.",
  rectRight: "Every angle of a rectangle is 90°.",
};
const ALL_REASONS = Object.values(R);

// ---- helpers ----------------------------------------------------------------

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function optionsOf(correct, pool, n = 4) {
  const out = [correct];
  for (const c of pool) { if (out.length >= n) break; if (c != null && !out.includes(c)) out.push(c); }
  return shuffle(out);
}
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const D = (v) => `${v}°`;

function degQ(config, value) {
  return makeQuestion({ ...config, inputMode: "simple", answer: String(value), acceptableAnswers: [`${value}°`] });
}
function mcQ(config, correct, options) {
  return makeQuestion({ ...config, answerMode: "multipleChoice", answer: correct, options });
}
function tfQ(config, correct) {
  return makeQuestion({ ...config, answerMode: "trueFalse", answer: correct, options: ["True", "False"] });
}
// SELECT ALL that apply.
function multiSelectQ(config, correctOptions, allOptions) {
  const q = makeQuestion({ ...config, answerMode: "multiSelect", answer: correctOptions.join(", "), options: allOptions });
  q.correctOptions = correctOptions;
  return q;
}
// VALUE + REASON (type the value, pick the reason from 4).
function valueReasonQ(config, value, correctReason) {
  const options = optionsOf(correctReason, shuffle(ALL_REASONS.filter((r) => r !== correctReason)));
  return makeQuestion({
    ...config, answerMode: "multiPart", answer: String(value),
    expectedParts: [
      { label: "x =", prompt: "The value of x", answer: String(value), acceptableAnswers: [`${value}°`, `${value} cm`, `${value}cm`] },
      { label: "Reason", prompt: "Choose the correct reason", answer: correctReason, options },
    ],
  });
}

const TRI_FULL_NAMES = TRIANGLE_TYPES.map(([s, a]) => (s === "equilateral" ? "Equilateral" : `${cap(a)}-angled ${s}`));
const fullTriName = (shape) => (shape.sideClass === "equilateral" ? "Equilateral" : `${cap(shape.angleClass)}-angled ${shape.sideClass}`);

// ---- A. Naming & labelling --------------------------------------------------

export const naming = {
  id: "naming", name: "Naming & Labelling", syllabusArea: SYL,
  prerequisiteSkillIds: [], nextSkillIds: ["triangleType"],
  generate(level) {
    if (level <= 1) {
      // Correct cyclic name for a labelled quadrilateral (vertices in order).
      const q = makeQuad(pick(SPECIAL_QUADS));
      const labs = ["A", "B", "C", "D"];
      const correct = "ABCD";
      return mcQ({
        topic: "naming",
        text: `The quadrilateral's vertices are labelled A, B, C, D in order around it.\nWhich is a correct name for it?`,
        feedback: `Name a shape by going AROUND it in order: ABCD (or BCDA, or the reverse DCBA). Jumping across, like ABDC, is not allowed.`,
        diagramType: "geometryShape", diagramData: buildSpec(q, { labels: labs, ticks: false, right: false }),
      }, correct, optionsOf(correct, ["ABDC", "ACBD", "ADBC"]));
    }
    if (level === 2) {
      const t = makeTriangle(...pick(TRIANGLE_TYPES));
      return mcQ({
        topic: "naming",
        text: `In triangle ABC, which symbol names the angle at vertex B?`,
        feedback: `The angle at B is written ∠ABC (the vertex letter B in the middle).`,
        diagramType: "geometryShape", diagramData: buildSpec(t, { labels: ["A", "B", "C"], ticks: false, arcs: false, right: false }),
      }, "∠ABC", optionsOf("∠ABC", ["∠BAC", "∠ACB", "∠CAB"]));
    }
    if (level === 3) {
      return mcQ({
        topic: "naming",
        text: `A four-sided shape is called a quadrilateral.\nWhat is the correct name for the interval joining two opposite corners of a quadrilateral?`,
        feedback: `A line joining two opposite (non-adjacent) vertices is a DIAGONAL.`,
        diagramType: "geometryShape", diagramData: buildSpec(makeQuad("parallelogram"), { labels: true, diagonals: true, ticks: false, chevrons: false, right: false }),
      }, "A diagonal", optionsOf("A diagonal", ["A radius", "An altitude", "A transversal"]));
    }
    if (level === 4) {
      const t = makeTriangle("scalene", "acute");
      return mcQ({
        topic: "naming",
        text: `Which correctly lists the three SIDES of triangle ABC?`,
        feedback: `A triangle's sides are the intervals between each pair of vertices: AB, BC and CA.`,
        diagramType: "geometryShape", diagramData: buildSpec(t, { labels: ["A", "B", "C"], ticks: false, arcs: false, right: false }),
      }, "AB, BC, CA", optionsOf("AB, BC, CA", ["A, B, C", "∠A, ∠B, ∠C", "AC, CB, AA"]));
    }
    // L5: which is the INCLUDED angle between two named sides.
    return mcQ({
      topic: "naming",
      text: `In triangle ABC, which angle is BETWEEN sides AB and BC (the included angle)?`,
      feedback: `Sides AB and BC meet at vertex B, so the included angle is ∠ABC.`,
      diagramType: "geometryShape", diagramData: buildSpec(makeTriangle("scalene", "obtuse"), { labels: ["A", "B", "C"], ticks: false, arcs: false, right: false }),
    }, "∠ABC", optionsOf("∠ABC", ["∠BAC", "∠BCA", "∠CAB"]));
  },
};

// ---- B1. Classify a triangle -----------------------------------------------

export const triangleType = {
  id: "triangleType", name: "Classifying Triangles", syllabusArea: SYL,
  prerequisiteSkillIds: ["naming"], nextSkillIds: ["quadType"],
  generate(level) {
    const [sc, ac] = pick(TRIANGLE_TYPES);
    const t = makeTriangle(sc, ac);
    const spec = buildSpec(t, { labels: true, ticks: true, arcs: true, right: true });
    if (level <= 1) {
      const correct = cap(sc);
      return mcQ({
        topic: "triangleType", text: `Classify this triangle by its SIDES.`,
        feedback: `${sc === "equilateral" ? "All three sides are equal (three ticks)" : sc === "isosceles" ? "Two sides are equal (matching ticks)" : "All three sides are different"} → ${sc}.`,
        diagramType: "geometryShape", diagramData: spec,
      }, correct, ["Equilateral", "Isosceles", "Scalene"]);
    }
    if (level === 2) {
      const correct = `${cap(ac)}-angled`;
      return mcQ({
        topic: "triangleType", text: `Classify this triangle by its ANGLES.`,
        feedback: `The largest angle is ${ac === "right" ? "exactly 90° (right-angle mark)" : ac === "obtuse" ? "more than 90°" : "less than 90°"} → ${ac}-angled.`,
        diagramType: "geometryShape", diagramData: spec,
      }, correct, ["Acute-angled", "Right-angled", "Obtuse-angled"]);
    }
    if (level === 3) {
      const correct = fullTriName(t);
      return mcQ({
        topic: "triangleType", text: `Give the FULL name of this triangle (side and angle).`,
        feedback: `By sides it is ${sc}; by angles it is ${ac === "acute" && sc === "equilateral" ? "acute" : ac}-angled → ${correct}.`,
        diagramType: "geometryShape", diagramData: spec,
      }, correct, optionsOf(correct, shuffle(TRI_FULL_NAMES.filter((x) => x !== correct))));
    }
    if (level === 4) {
      // Select ALL true statements about the triangle.
      const facts = [];
      facts.push(["It has three equal sides", sc === "equilateral"]);
      facts.push(["It has (at least) two equal sides", sc !== "scalene"]);
      facts.push(["It has a right angle", ac === "right"]);
      facts.push(["It has an obtuse angle", ac === "obtuse"]);
      facts.push(["All three angles are less than 90°", ac === "acute"]);
      const chosen = shuffle(facts).slice(0, 4);
      const correct = chosen.filter(([, v]) => v).map(([s]) => s);
      const all = chosen.map(([s]) => s);
      const safe = correct.length ? correct : [chosen.find(([, v]) => v) ? chosen.find(([, v]) => v)[0] : all[0]];
      return multiSelectQ({
        topic: "triangleType", text: `Select ALL statements that are true for this triangle.`,
        feedback: `True: ${safe.join("; ") || "—"}. (${fullTriName(t)}.)`,
        diagramType: "geometryShape", diagramData: spec,
      }, safe, all);
    }
    // L5: full name, near-boundary variety (already varied by makeTriangle).
    const correct = fullTriName(t);
    return mcQ({
      topic: "triangleType", text: `Give the FULL name of this triangle.`,
      feedback: `${correct}. Read the side ticks and the angle marks together.`,
      diagramType: "geometryShape", diagramData: spec,
    }, correct, optionsOf(correct, shuffle(TRI_FULL_NAMES.filter((x) => x !== correct))));
  },
};

// ---- B2. Classify a quadrilateral ------------------------------------------

export const quadType = {
  id: "quadType", name: "Classifying Quadrilaterals", syllabusArea: SYL,
  prerequisiteSkillIds: ["triangleType"], nextSkillIds: ["shapeProperties"],
  generate(level) {
    const pool = level <= 1 ? ["square", "rectangle"] : level === 2 ? ["square", "rectangle", "parallelogram", "trapezium"] : SPECIAL_QUADS;
    const type = pick(pool);
    const q = makeQuad(type);
    const correct = cap(type);
    return mcQ({
      topic: "quadType",
      text: `What is the MOST SPECIFIC name for this quadrilateral?`,
      feedback: quadFeedback(type),
      diagramType: "geometryShape",
      diagramData: buildSpec(q, { labels: true, ticks: true, right: true, chevrons: type === "parallelogram" || type === "trapezium" }),
    }, correct, optionsOf(correct, shuffle(SPECIAL_QUADS.filter((t) => t !== type).map(cap))));
  },
};
function quadFeedback(type) {
  const m = {
    square: "Four equal sides and four right angles → square.",
    rectangle: "Opposite sides equal and four right angles (but not all sides equal) → rectangle.",
    rhombus: "Four equal sides but no right angles → rhombus.",
    parallelogram: "Two pairs of parallel sides, opposite sides equal, no right angles, not all sides equal → parallelogram.",
    trapezium: "Exactly one pair of parallel sides → trapezium.",
    kite: "Two pairs of adjacent equal sides and perpendicular diagonals → kite.",
  };
  return m[type];
}

// ---- C1. Which properties does the shape have (select-all) ------------------

export const shapeProperties = {
  id: "shapeProperties", name: "Properties of Quadrilaterals", syllabusArea: SYL,
  prerequisiteSkillIds: ["quadType"], nextSkillIds: ["verifyProperty"],
  generate(level) {
    const type = pick(level <= 2 ? ["square", "rectangle", "parallelogram"] : SPECIAL_QUADS);
    const q = makeQuad(type);
    const props = propertiesOf(type);
    // Show a mix of true + false properties (5 shown).
    const trueOnes = QUAD_PROPERTIES.filter((p) => props[p]);
    const falseOnes = QUAD_PROPERTIES.filter((p) => !props[p]);
    const showTrue = shuffle(trueOnes).slice(0, Math.min(3, trueOnes.length));
    const need = 5 - showTrue.length;
    const showFalse = shuffle(falseOnes).slice(0, need);
    const all = shuffle([...showTrue, ...showFalse]);
    const correct = all.filter((p) => props[p]);
    const safe = correct.length ? correct : [showTrue[0] || all[0]];
    return multiSelectQ({
      topic: "shapeProperties",
      text: `Select ALL the properties that this ${type} has.`,
      feedback: `A ${type} has: ${trueOnes.join("; ")}.`,
      diagramType: "geometryShape",
      diagramData: buildSpec(q, { labels: true, ticks: true, right: true, chevrons: true, diagonals: level >= 3 }),
    }, safe, all);
  },
};

// ---- C2. Verify a specific property ----------------------------------------

export const verifyProperty = {
  id: "verifyProperty", name: "Verifying Properties", syllabusArea: SYL,
  prerequisiteSkillIds: ["shapeProperties"], nextSkillIds: ["convexity"],
  generate(level) {
    if (level <= 2) {
      // True/false property claim about a shown shape.
      const type = pick(SPECIAL_QUADS);
      const prop = pick(QUAD_PROPERTIES);
      const holds = propertiesOf(type)[prop];
      return tfQ({
        topic: "verifyProperty",
        text: `True or false?\nThis ${type} has this property: "${prop}".`,
        feedback: holds ? `True — a ${type} does have: ${prop.toLowerCase()}.` : `False — a ${type} does NOT always have: ${prop.toLowerCase()}.`,
        diagramType: "geometryShape",
        diagramData: buildSpec(makeQuad(type), { labels: true, ticks: true, right: true, chevrons: true, diagonals: /diagonal/i.test(prop) }),
      }, holds ? "True" : "False");
    }
    // L3+: which shape ALWAYS has a given property? (MC)
    const prop = pick(["Diagonals are equal", "Diagonals are perpendicular", "All sides are equal", "All angles are 90°"]);
    const holders = SPECIAL_QUADS.filter((t) => propertiesOf(t)[prop]);
    const correct = cap(pick(holders));
    const nonHolders = SPECIAL_QUADS.filter((t) => !propertiesOf(t)[prop]).map(cap);
    return mcQ({
      topic: "verifyProperty",
      text: `Which of these quadrilaterals ALWAYS has this property?\n"${prop}"`,
      feedback: `${correct} always has: ${prop.toLowerCase()}. (Shapes that always have it: ${holders.map(cap).join(", ")}.)`,
    }, correct, optionsOf(correct, shuffle(nonHolders)));
  },
};

// ---- D. Convex vs non-convex -----------------------------------------------

export const convexity = {
  id: "convexity", name: "Convex & Non-Convex", syllabusArea: SYL,
  prerequisiteSkillIds: ["verifyProperty"], nextSkillIds: ["hierarchy"],
  generate(level) {
    const concave = pick([true, false]);
    const shape = concave ? makeGenericQuad(true) : (level <= 2 ? makeQuad(pick(SPECIAL_QUADS)) : makeGenericQuad(false));
    const correct = concave ? "Non-convex (concave)" : "Convex";
    return mcQ({
      topic: "convexity",
      text: `Is this quadrilateral convex or non-convex?`,
      feedback: concave
        ? `Non-convex (concave): one interior angle is a reflex angle (greater than 180°) — the shape is "pushed in" at that vertex.`
        : `Convex: every interior angle is less than 180° and no vertex points inwards.`,
      diagramType: "geometryShape", diagramData: buildSpec(shape, { labels: true, ticks: false, right: false }),
    }, correct, ["Convex", "Non-convex (concave)"]);
  },
};

// ---- E. Classification hierarchy ("more than one type") ---------------------

export const hierarchy = {
  id: "hierarchy", name: "The Classification Hierarchy", syllabusArea: SYL,
  prerequisiteSkillIds: ["convexity"], nextSkillIds: ["angleSums"],
  generate(level) {
    if (level <= 2) {
      // Select ALL names that also apply to the shape.
      const type = pick(["square", "rectangle", "rhombus"]);
      const q = makeQuad(type);
      const names = QUAD_NAMES[type].filter((nme) => nme !== "quadrilateral").map(cap);
      const distractPool = SPECIAL_QUADS.map(cap).filter((nme) => !names.includes(nme));
      const all = shuffle([...names, ...shuffle(distractPool).slice(0, Math.max(2, 5 - names.length))]);
      return multiSelectQ({
        topic: "hierarchy",
        text: `A ${type} can be called by more than one name.\nSelect ALL the names that also correctly describe this ${type}.`,
        feedback: `A ${type} is also: ${names.filter((nme) => nme.toLowerCase() !== type).join(", ")}. (Every ${type} satisfies each of their definitions.)`,
        diagramType: "geometryShape", diagramData: buildSpec(q, { labels: true, ticks: true, right: true, chevrons: true }),
      }, names, all);
    }
    if (level === 3) {
      // True/false hierarchy statements.
      const items = [
        ["Every square is a rectangle", true], ["Every rectangle is a square", false],
        ["Every square is a rhombus", true], ["Every rhombus is a square", false],
        ["Every rectangle is a parallelogram", true], ["Every parallelogram is a rectangle", false],
        ["Every rhombus is a parallelogram", true], ["Every trapezium is a parallelogram", false],
      ];
      const [claim, ans] = pick(items);
      return tfQ({
        topic: "hierarchy", text: `True or false?\n${claim}.`,
        feedback: ans ? `True — it always satisfies the more general definition.` : `False — the more general shape doesn't have to satisfy the stricter definition.`,
      }, ans ? "True" : "False");
    }
    // L4-5: WHY does a shape belong to more than one type (reason MC).
    const pairs = [
      ["a square", "a rhombus", "A square has four equal sides, which is exactly the definition of a rhombus."],
      ["a square", "a rectangle", "A square has four right angles, which is exactly the definition of a rectangle."],
      ["a rectangle", "a parallelogram", "A rectangle has two pairs of parallel sides, which is the definition of a parallelogram."],
      ["a rhombus", "a parallelogram", "A rhombus has two pairs of parallel sides, which is the definition of a parallelogram."],
    ];
    const [a, b, why] = pick(pairs);
    const distract = [
      "Because they look similar.", "Because both have four sides only.", "Because all quadrilaterals are the same.",
      "Because it has the same area.", "Because its diagonals are equal.",
    ];
    return mcQ({
      topic: "hierarchy",
      text: `Why is ${a} also ${b}?`,
      feedback: why,
    }, why, optionsOf(why, shuffle(distract)));
  },
};

// ---- F. Angle-sum facts + simple finds -------------------------------------

export const angleSums = {
  id: "angleSums", name: "Angle Sums", syllabusArea: SYL,
  prerequisiteSkillIds: ["hierarchy"], nextSkillIds: ["proofs"],
  generate(level) {
    if (level <= 1) {
      return mcQ({
        topic: "angleSums", text: `What is the sum of the interior angles of a TRIANGLE?`,
        feedback: R.triSum,
      }, "180°", optionsOf("180°", ["360°", "90°", "540°"]));
    }
    if (level === 2) {
      return mcQ({
        topic: "angleSums", text: `What is the sum of the interior angles of a QUADRILATERAL?`,
        feedback: R.quadSum,
      }, "360°", optionsOf("360°", ["180°", "270°", "540°"]));
    }
    if (level === 3) {
      // Triangle: two angles given, find the third (value + reason).
      let a = randInt(35, 80), b = randInt(35, 80); while (180 - a - b < 20) { a = randInt(35, 80); b = randInt(35, 80); }
      const x = 180 - a - b;
      const t = customTriangle([a, b, x]);
      const angs = t.angles.map(Math.round);
      const xi = angs.indexOf(nearest(angs, x));
      const labels = {}; angs.forEach((A, i) => { labels[i] = i === xi ? "x" : D(A); });
      return valueReasonQ({
        topic: "angleSums", text: `Find the value of x, then choose the reason.`,
        feedback: `${R.triSum}\nx = 180° − ${a}° − ${b}° = ${x}°.`,
        diagramType: "geometryShape", diagramData: buildSpec(t, { labels: true, ticks: false, arcs: false, right: false, angleLabels: labels }),
      }, x, R.triSum);
    }
    if (level === 4) {
      // Quadrilateral: three angles given, find the fourth (value + reason).
      const q = makeQuad(pick(["parallelogram", "trapezium", "rectangle"]));
      const angs = q.angles.map(Math.round);
      const xi = randInt(0, 3);
      const given = angs.filter((_, i) => i !== xi);
      const x = 360 - given.reduce((s, v) => s + v, 0);
      const labels = {}; angs.forEach((A, i) => { labels[i] = i === xi ? "x" : D(A); });
      return valueReasonQ({
        topic: "angleSums", text: `Find the value of x, then choose the reason.`,
        feedback: `${R.quadSum}\nx = 360° − (${given.map(D).join(" + ")}) = ${x}°.`,
        diagramType: "geometryShape", diagramData: buildSpec(q, { labels: true, ticks: false, right: false, angleLabels: labels }),
      }, x, R.quadSum);
    }
    // L5: exterior angle of a triangle = sum of the two interior opposite.
    let a = randInt(40, 75), b = randInt(40, 75); while (a + b > 155) { a = randInt(40, 75); b = randInt(40, 75); }
    const ext = a + b;
    return valueReasonQ({
      topic: "angleSums", text: `Find the value of x (the exterior angle), then choose the reason.`,
      feedback: `${R.exterior}\nx = ${a}° + ${b}° = ${ext}°.`,
      diagramType: "geometryProof", diagramData: { kind: "exteriorAngle", ext: { a, b, exterior: null }, labels: { ext: "x" } },
    }, ext, R.exterior);
  },
};
function nearest(list, v) { return list.reduce((best, cur) => (Math.abs(cur - v) < Math.abs(best - v) ? cur : best), list[0]); }

// ---- G. The three proofs (fill the reasons on the construction) -------------

export const proofs = {
  id: "proofs", name: "Angle-Sum Proofs", syllabusArea: SYL,
  prerequisiteSkillIds: ["angleSums"], nextSkillIds: ["unknownAngles"],
  generate(level) {
    const which = level <= 2 ? "triangleSum" : level === 3 ? "exteriorAngle" : pick(["triangleSum", "exteriorAngle", "quadSum"]);
    if (which === "triangleSum") {
      return proofQ({
        topic: "proofs",
        text: `Complete the proof that the angle sum of a triangle is 180°.\nA line is drawn through the apex, parallel to the base.`,
        diagram: { kind: "triangleSum", labels: { a: "a", b: "b", c: "c" } },
        parts: [
          { label: "(a)", prompt: "The two angles marked b are equal because…", answer: "Alternate angles on parallel lines are equal.", pool: ["Corresponding angles on parallel lines are equal.", "Vertically opposite angles are equal.", "Co-interior angles are supplementary."] },
          { label: "(b)", prompt: "At the apex, a, b and c together make a…", answer: "straight angle (180°)", pool: ["right angle (90°)", "full revolution (360°)", "reflex angle"] },
          { label: "(c)", prompt: "Therefore a + b + c =", answer: "180°", pool: ["360°", "90°", "540°"] },
        ],
        feedback: `The line through the apex is parallel to the base, so the two angles marked b are equal (alternate angles) and likewise for c. At the apex a + b + c lie on a straight line = 180°, so the triangle's angles sum to 180°.`,
      });
    }
    if (which === "exteriorAngle") {
      return proofQ({
        topic: "proofs",
        text: `Complete the proof that an exterior angle of a triangle equals the sum of the two interior opposite angles.`,
        diagram: { kind: "exteriorAngle", labels: { a: "a", b: "b", ext: "x" } },
        parts: [
          { label: "(a)", prompt: "The exterior angle x and the interior angle c are on a straight line, so x + c =", answer: "180°", pool: ["360°", "90°", "x − c"] },
          { label: "(b)", prompt: "The interior angles give a + b + c =", answer: "180°", pool: ["360°", "90°", "a + b"] },
          { label: "(c)", prompt: "Comparing the two, the exterior angle x =", answer: "a + b", pool: ["a − b", "a + b + c", "180° + c"] },
        ],
        feedback: `x + c = 180° (straight line) and a + b + c = 180° (angle sum), so x = a + b.`,
      });
    }
    return proofQ({
      topic: "proofs",
      text: `Complete the proof that the angle sum of a quadrilateral is 360°.\nA diagonal is drawn.`,
      diagram: { kind: "quadSum" },
      parts: [
        { label: "(a)", prompt: "The diagonal splits the quadrilateral into…", answer: "two triangles", pool: ["three triangles", "four triangles", "one triangle"] },
        { label: "(b)", prompt: "The angles of each triangle sum to…", answer: "180°", pool: ["90°", "360°", "60°"] },
        { label: "(c)", prompt: "So the quadrilateral's angles sum to 2 × 180° =", answer: "360°", pool: ["180°", "540°", "270°"] },
      ],
      feedback: `A diagonal makes two triangles; each has an angle sum of 180°, so the quadrilateral's angles sum to 2 × 180° = 360°.`,
    });
  },
};
function proofQ({ topic, text, diagram, parts, feedback }) {
  return makeQuestion({
    topic, text, feedback, answerMode: "multiPart", answer: parts[parts.length - 1].answer,
    diagramType: "geometryProof", diagramData: diagram,
    expectedParts: parts.map((p) => ({ label: p.label, prompt: p.prompt, answer: p.answer, options: optionsOf(p.answer, shuffle(p.pool)) })),
  });
}

// ---- H1. Unknown angles from properties + angle sums ------------------------

export const unknownAngles = {
  id: "unknownAngles", name: "Unknown Angles", syllabusArea: SYL,
  prerequisiteSkillIds: ["proofs"], nextSkillIds: ["unknownSides"],
  generate(level) {
    const kind = level <= 1 ? "isosceles" : level === 2 ? pick(["isosceles", "triSum"]) : level === 3 ? pick(["parallelogram", "triSum"]) : pick(["isosceles", "parallelogram", "exterior"]);
    if (kind === "isosceles") {
      // EVEN apex (≠ 60) so the base angle (180 − apex) ÷ 2 is always a WHOLE
      // number (teacher fix — no half-degree answers).
      let apex; do { apex = randInt(15, 57) * 2; } while (apex === 60);
      const base = (180 - apex) / 2;
      const t = customTriangle([base, base, apex]);
      const angs = t.angles.map(Math.round);
      // apex = the distinct one; a base = unknown.
      const apexIdx = angs.indexOf(nearest(angs, apex));
      const baseIdxs = [0, 1, 2].filter((i) => i !== apexIdx);
      const xi = pick(baseIdxs);
      const labels = {}; labels[apexIdx] = D(apex); labels[xi] = "x";
      // mark the equal legs so the isosceles property is visible
      return valueReasonQ({
        topic: "unknownAngles", text: `Find the value of x, then choose the reason.`,
        feedback: `${R.isoBase} x = (180° − ${apex}°) ÷ 2 = ${base}°.`,
        diagramType: "geometryShape", diagramData: buildSpec(t, { labels: true, ticks: true, arcs: false, right: false, angleLabels: labels }),
      }, base, R.isoBase);
    }
    if (kind === "triSum") {
      let a = randInt(35, 85), b = randInt(35, 85); while (180 - a - b < 20) { a = randInt(35, 85); b = randInt(35, 85); }
      const x = 180 - a - b;
      const t = customTriangle([a, b, x]);
      const angs = t.angles.map(Math.round);
      const xi = angs.indexOf(nearest(angs, x));
      const labels = {}; angs.forEach((A, i) => { labels[i] = i === xi ? "x" : D(A); });
      return valueReasonQ({
        topic: "unknownAngles", text: `Find the value of x, then choose the reason.`,
        feedback: `${R.triSum} x = 180° − ${a}° − ${b}° = ${x}°.`,
        diagramType: "geometryShape", diagramData: buildSpec(t, { labels: true, ticks: false, arcs: false, right: false, angleLabels: labels }),
      }, x, R.triSum);
    }
    if (kind === "parallelogram") {
      const q = makeQuad("parallelogram");
      const angs = q.angles.map(Math.round);
      const gi = randInt(0, 3);
      const opposite = pick([true, false]);
      const xi = opposite ? (gi + 2) % 4 : (gi + 1) % 4;
      const labels = {}; labels[gi] = D(angs[gi]); labels[xi] = "x";
      const answer = opposite ? angs[gi] : 180 - angs[gi];
      return valueReasonQ({
        topic: "unknownAngles", text: `ABCD is a parallelogram.\nFind the value of x, then choose the reason.`,
        feedback: opposite ? `${R.pgOppAngle} x = ${angs[gi]}°.` : `${R.pgCoInt} x = 180° − ${angs[gi]}° = ${answer}°.`,
        diagramType: "geometryShape", diagramData: buildSpec(q, { labels: true, ticks: false, right: false, chevrons: true, angleLabels: labels }),
      }, answer, opposite ? R.pgOppAngle : R.pgCoInt);
    }
    // exterior angle
    let a = randInt(40, 75), b = randInt(40, 75); while (a + b > 150) { a = randInt(40, 75); b = randInt(40, 75); }
    return valueReasonQ({
      topic: "unknownAngles", text: `Find the value of x (the exterior angle), then choose the reason.`,
      feedback: `${R.exterior} x = ${a}° + ${b}° = ${a + b}°.`,
      diagramType: "geometryProof", diagramData: { kind: "exteriorAngle", ext: { a, b, exterior: null }, labels: { ext: "x" } },
    }, a + b, R.exterior);
  },
};

// ---- H2. Unknown sides from properties -------------------------------------

export const unknownSides = {
  id: "unknownSides", name: "Unknown Sides", syllabusArea: SYL,
  prerequisiteSkillIds: ["unknownAngles"], nextSkillIds: ["multiStep"],
  generate(level) {
    const kind = pick(level <= 2 ? ["rhombus", "parallelogram"] : ["rhombus", "parallelogram", "isosceles", "kite"]);
    const val = randInt(4, 18);
    if (kind === "rhombus" || kind === "square") {
      const q = makeQuad("rhombus");
      const gi = randInt(0, 3), xi = (gi + 1) % 4;
      const sideLabels = {}; sideLabels[gi] = `${val} cm`; sideLabels[xi] = "x";
      return valueReasonQ({
        topic: "unknownSides", text: `Find the value of x (in cm), then choose the reason.`,
        feedback: `${R.rhombusSide} x = ${val} cm.`,
        diagramType: "geometryShape", diagramData: buildSpec(q, { labels: true, ticks: true, right: false, sideLabels }),
      }, val, R.rhombusSide);
    }
    if (kind === "parallelogram") {
      const q = makeQuad("parallelogram");
      const gi = randInt(0, 3), xi = (gi + 2) % 4; // opposite side
      const sideLabels = {}; sideLabels[gi] = `${val} cm`; sideLabels[xi] = "x";
      return valueReasonQ({
        topic: "unknownSides", text: `ABCD is a parallelogram.\nFind the value of x (in cm), then choose the reason.`,
        feedback: `${R.pgOppSide} x = ${val} cm.`,
        diagramType: "geometryShape", diagramData: buildSpec(q, { labels: true, ticks: false, right: false, chevrons: true, sideLabels }),
      }, val, R.pgOppSide);
    }
    if (kind === "kite") {
      const q = makeQuad("kite");
      // one of the equal adjacent pairs
      const pairIdx = pick([[0, 3], [1, 2]]);
      const sideLabels = {}; sideLabels[pairIdx[0]] = `${val} cm`; sideLabels[pairIdx[1]] = "x";
      return valueReasonQ({
        topic: "unknownSides", text: `Find the value of x (in cm), then choose the reason.`,
        feedback: `A kite has two pairs of adjacent equal sides. x = ${val} cm.`,
        diagramType: "geometryShape", diagramData: buildSpec(q, { labels: true, ticks: true, right: false, sideLabels }),
      }, val, R.rhombusSide);
    }
    // isosceles triangle equal legs
    const t = makeTriangle("isosceles", pick(["acute", "obtuse"]));
    const legs = [1, 2]; // edges P1P2, P2P0 are the equal legs by construction
    const sideLabels = {}; sideLabels[legs[0]] = `${val} cm`; sideLabels[legs[1]] = "x";
    return valueReasonQ({
      topic: "unknownSides", text: `Triangle ABC is isosceles.\nFind the value of x (in cm), then choose the reason.`,
      feedback: `The two equal sides of an isosceles triangle are equal. x = ${val} cm.`,
      diagramType: "geometryShape", diagramData: buildSpec(t, { labels: true, ticks: true, arcs: false, right: false, sideLabels }),
    }, val, R.isoBase);
  },
};

// ---- H3. Multi-step (value only — more than one valid path) -----------------

export const multiStep = {
  id: "multiStep", name: "Multi-Step Problems", syllabusArea: SYL,
  prerequisiteSkillIds: ["unknownSides"], nextSkillIds: [],
  generate(level) {
    // Isosceles triangle: apex given, find a base angle. EVEN apex (≠ 60) keeps
    // the base angle a whole number (teacher fix).
    let apex; do { apex = randInt(20, 45) * 2; } while (apex === 60);
    const base = (180 - apex) / 2;
    const t = customTriangle([base, base, apex]);
    const angs = t.angles.map(Math.round);
    const apexIdx = angs.indexOf(nearest(angs, apex));
    const baseIdxs = [0, 1, 2].filter((i) => i !== apexIdx);
    const xi = pick(baseIdxs);
    const labels = {}; labels[apexIdx] = D(Math.round(apex)); labels[xi] = "x";
    const x = Math.round(base);
    if (pick([true, false])) {
      // Variant: parallelogram — find x via co-interior then opposite.
      const q = makeQuad("parallelogram");
      const qa = q.angles.map(Math.round);
      const gi = randInt(0, 3), xi2 = (gi + 1) % 4;
      const lbl = {}; lbl[gi] = D(qa[gi]); lbl[xi2] = "x";
      const ans = 180 - qa[gi];
      return degQ({
        topic: "multiStep", text: `ABCD is a parallelogram.\nFind the value of x.`,
        feedback: `One way: co-interior angles between the parallel sides are supplementary, so x = 180° − ${qa[gi]}° = ${ans}°. (Opposite angles equal gives the same result via another route.)`,
        diagramType: "geometryShape", diagramData: buildSpec(q, { labels: true, ticks: false, right: false, chevrons: true, angleLabels: lbl }),
      }, ans);
    }
    return degQ({
      topic: "multiStep", text: `Triangle ABC is isosceles with apex ${Math.round(apex)}°.\nFind the value of x.`,
      feedback: `One way: base angles of an isosceles triangle are equal and the angle sum is 180°, so x = (180° − ${Math.round(apex)}°) ÷ 2 = ${x}°.`,
      diagramType: "geometryShape", diagramData: buildSpec(t, { labels: true, ticks: true, arcs: false, right: false, angleLabels: labels }),
    }, x);
  },
};

export const GEOMETRY_SKILLS_LIST = [
  naming, triangleType, quadType, shapeProperties, verifyProperty, convexity,
  hierarchy, angleSums, proofs, unknownAngles, unknownSides, multiStep,
];

export default GEOMETRY_SKILLS_LIST;
