/*
  MMT Exam Builder — Multiple Choice Helper
  ----------------------------------------
  Converts existing schema-compatible questions into multiple-choice questions.

  The converter keeps the original topic-bank architecture intact:
  - topic banks generate their normal question object
  - this helper builds one correct option plus common-error distractors
  - the renderer already knows how to display choices
*/

const FRACTION_TOKEN = /\[\[frac:(-?\d+):(-?\d+)\]\]/;
const FRACTION_TEXT = /^(-?\d+)\s*\/\s*(-?\d+)$/;

export function makeMultipleChoiceQuestion(question) {
  if (!question) return null;

  // Multiple choice questions should only ever be built from 1-mark source
  // questions. This prevents harder 2-, 3-, 4- and 5-mark extended-response
  // tasks from being converted into unreliable multiple-choice items.
  if (!isOneMarkQuestion(question)) return null;

  const correct = normaliseChoiceText(question.answer);
  if (!correct) return null;

  // Some banks already contain occasional multiple-choice questions.
  // Keep them usable instead of rejecting them.
  if (question.kind === "multiple-choice") {
    const existingChoices = Array.isArray(question.choices)
      ? question.choices.map(normaliseChoiceText).filter(Boolean)
      : [];

    const choices = shuffleUnique([correct, ...existingChoices], correct).slice(0, 4);

    if (choices.length < 4) return null;

    return {
      ...question,
      id: `${question.id}-mc-${Math.random().toString(36).slice(2, 8)}`,
      prompt: cleanMultipleChoicePrompt(question.prompt),
      kind: "multiple-choice",
      marks: 1,
      choices,
      correctAnswer: correct,
      space: "none",
      tags: [...(question.tags || []), "multiple choice"]
    };
  }

  if (!isSuitableForMultipleChoice(question)) return null;

  const existingChoices = Array.isArray(question.choices)
    ? question.choices.map(normaliseChoiceText).filter(Boolean)
    : [];

  if (existingChoices.length >= 4) {
    const choices = shuffleUnique([correct, ...existingChoices], correct).slice(0, 4);

    if (choices.length >= 4) {
      return {
        ...question,
        id: `${question.id}-mc-${Math.random().toString(36).slice(2, 8)}`,
        prompt: cleanMultipleChoicePrompt(question.prompt),
        kind: "multiple-choice",
        marks: 1,
        choices,
        correctAnswer: correct,
        space: "none",
        tags: [...(question.tags || []), "multiple choice"]
      };
    }
  }

  const distractors = buildDistractors(question, correct);
  const choices = shuffleUnique([correct, ...distractors], correct).slice(0, 4);

  if (choices.length < 4) return null;

  return {
    ...question,
    id: `${question.id}-mc-${Math.random().toString(36).slice(2, 8)}`,
    prompt: cleanMultipleChoicePrompt(question.prompt),
    kind: "multiple-choice",
    marks: 1,
    choices,
    correctAnswer: correct,
    space: "none",
    tags: [...(question.tags || []), "multiple choice"]
  };
}


function cleanMultipleChoicePrompt(prompt) {
  return String(prompt ?? "")
    .replace(/\s*Give\s+a\s+reason\s+for\s+your\s+answer\.?/gi, "")
    .replace(/\s*Give\s+reasons\s+for\s+your\s+answer\.?/gi, "")
    .replace(/\s*Justify\s+your\s+answer\.?/gi, "")
    .replace(/\s*Show\s+your\s+working\.?/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function buildBalancedMultipleChoiceQuestions({
  topics = {},
  selectedTopics = {},
  count = 0,
  maxAttemptsPerQuestion = 25
} = {}) {
  const candidatePool = buildSelectedTypePool(topics, selectedTopics);

  if (!candidatePool.length || count < 1) return [];

  const out = [];
  let pool = shuffleArray(candidatePool);
  let poolIndex = 0;
  let safety = 0;
  const maxSafety = count * Math.max(1, candidatePool.length) * maxAttemptsPerQuestion;

  while (out.length < count && safety < maxSafety) {
    safety += 1;

    if (poolIndex >= pool.length) {
      pool = shuffleArray(candidatePool);
      poolIndex = 0;
    }

    const candidate = pool[poolIndex];
    poolIndex += 1;

    const topic = topics[candidate.topicId];
    if (!topic?.generate) continue;

    // Important: generate from ONE selected type at a time.
    // Passing the whole allowedTypes array with count: 1 causes most banks
    // to repeatedly choose the first selected type.
    const generated = topic.generate({
      count: 1,
      allowedTypes: [candidate.typeId]
    });

    const question = Array.isArray(generated) ? generated[0] : null;
    const mcQuestion = makeMultipleChoiceQuestion(question);

    if (mcQuestion) {
      out.push(mcQuestion);
    }
  }

  return out;
}

function isOneMarkQuestion(question) {
  const marks = Number(question?.marks ?? 1);
  return Number.isFinite(marks) && marks === 1;
}

function buildSelectedTypePool(topics, selectedTopics) {
  const pool = [];

  Object.entries(selectedTopics || {}).forEach(([topicId, config]) => {
    const topic = topics[topicId];
    if (!topic?.generate) return;

    const allowedTypes = Array.isArray(config?.allowedTypes)
      ? config.allowedTypes
      : [];

    const uniqueTypes = [...new Set(allowedTypes)].filter(Boolean);

    uniqueTypes.forEach(typeId => {
      pool.push({ topicId, typeId });
    });
  });

  return pool;
}

function shuffleArray(items) {
  const arr = items.slice();

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

function isSuitableForMultipleChoice(question) {
  if (!isOneMarkQuestion(question)) return false;

  const prompt = String(question.prompt || "").trim().toLowerCase();
  const type = String(question.type || "");
  const tags = Array.isArray(question.tags) ? question.tags : [];

  // Respect explicit opt-outs from the question bank. This is useful for
  // 1-mark diagram tasks that still need students to draw or mark directly
  // on the diagram rather than choose from A-D.
  if (question.mcEligible === false || question.multipleChoice === false) return false;
  if (tags.some(tag => /no[-\s]?multiple[-\s]?choice|not[-\s]?multiple[-\s]?choice|constructed[-\s]?response|diagram[-\s]?task/i.test(String(tag)))) {
    return false;
  }

  // Number-line placement questions are not meaningful as multiple choice:
  // the student needs to mark the value on the number line itself.
  if (type === "place-number-line") return false;
  if (/^(place|plot|mark)\s+.+\s+on\s+the\s+number\s+line\b/.test(prompt)) return false;

  // For Non-linear Relationships A and B, restrict automatic multiple choice
  // to the graph-selection style only. Longer graph-description, table,
  // feature and simultaneous-equation prompts work better as extended response.
  if (tags.includes("non-linear-relationships-a") || tags.includes("non-linear-relationships-b")) {
    return type === "nonlinear-match-equation-to-graph" || type === "nonlinear-b-which-graph";
  }

  // "Shade the fraction" is a student drawing task, not a natural MC item.
  if (prompt.startsWith("shade ")) return false;
  if (prompt.startsWith("draw ")) return false;
  if (prompt.startsWith("construct ")) return false;
  if (prompt.startsWith("plot ")) return false;
  if (prompt.startsWith("graph ")) return false;
  if (question.type === "shade-fraction") return false;
  if (question.type === "shaded-fractions-shade") return false;
  if (question.type === "distance-time-construct") return false;
  if (question.type === "intersecting-lines") return false;
  if (question.type === "graph-from-equation") return false;
  if (question.type === "graph-from-table") return false;
  if (question.type === "plot-coordinates") return false;
  if (question.type === "advanced-composite-area") return false;
  if (question.type === "expand-binomial-area-model") return false;
  if (question.type === "recognise-valid-nets") return false;
  if (question.type === "create-rearrange-nets") return false;
  if (question.type === "identify-prism-faces") return false;
  if (question.type === "rectangular-prism-3d") return false;
  if (question.type === "three-dimensional-elevation-bearing") return false;
  if (question.type === "three-dimensional-practical") return false;
  if (question.type === "mixed-non-right-trig") return false;
  if (question.type === "nonlinear-quadratic-table-values") return false;
  if (question.type === "nonlinear-exponential-table-values") return false;
  if (question.type === "nonlinear-graph-quadratic-from-table") return false;
  if (question.type === "nonlinear-graph-exponential-from-table") return false;
  if (question.type === "nonlinear-construct-table-and-graph-quadratic") return false;
  if (question.type === "nonlinear-construct-table-and-graph-exponential") return false;
  if (question.type === "nonlinear-blank-graph-application") return false;
  if (question.type === "nonlinear-b-quadratic-features") return false;
  if (question.type === "nonlinear-b-compare-parabolas") return false;
  if (question.type === "nonlinear-b-exponential-features") return false;
  if (question.type === "nonlinear-b-match-equation-graph") return false;

  // Very open prompts are not reliable as automatic MC items.
  if (!question.answer) return false;

  return true;
}

function buildDistractors(question, correct) {
  const builders = [
    fractionDistractors,
    areaDistractors,
    lengthDistractors,
    linearRelationshipDistractors,
    ratioRateDistractors,
    numericDistractors,
    financialBInterestDistractors,
    equationDistractors,
    algebraicDistractors,
    textDistractors
  ];

  const distractors = [];

  for (const builder of builders) {
    distractors.push(...builder(question, correct));
  }

  return distractors
    .map(normaliseChoiceText)
    .filter(Boolean)
    .filter(isRenderableChoice)
    .filter(choice => choice !== correct);
}

// A choice is renderable if it contains no leftover markup tokens other than
// well-formed fraction tokens. This stops any corrupted [[...]] markup from
// reaching the page as a literal string.
function isRenderableChoice(text) {
  const value = String(text ?? "");
  if (!value.includes("[[")) return true;

  const stripped = value
    .replace(/\[\[frac:-?\d+:-?\d+\]\]/g, "")
    .replace(/\[\[algfrac:[^:\]]+:[^:\]]+\]\]/g, "");

  return !stripped.includes("[[");
}

function fractionDistractors(question, correct) {
  const frac = parseFraction(correct);
  if (!frac) return [];

  const { n, d } = frac;
  const out = [];

  // Common shaded-fraction / FDP errors.
  out.push(formatFraction(d - n, d));       // unshaded instead of shaded
  out.push(formatFraction(n + 1, d));       // one part too many
  out.push(formatFraction(Math.max(1, n - 1), d)); // one part too few
  out.push(formatFraction(n, d + 1));       // denominator count error
  out.push(formatFraction(d, n));           // reciprocal

  // If a diagram has original parts, use unsimplified/diagram-based errors.
  const cfg = question.diagram?.config || {};
  const shaded = Number(cfg.shadedParts ?? cfg.shaded ?? cfg.numerator);
  const parts = Number(cfg.totalParts ?? cfg.parts ?? cfg.denominator);
  if (Number.isFinite(shaded) && Number.isFinite(parts) && parts > 0) {
    out.push(formatFraction(shaded, parts));
    out.push(formatFraction(parts - shaded, parts));
    out.push(formatFraction(shaded, parts - shaded || parts + 1));
  }

  return out;
}





function areaDistractors(question, correct) {
  const type = String(question.type || "");
  const text = String(correct).trim();
  const out = [];
  const cfg = question.diagram?.config || {};
  const unit = cfg.unit || "";

  const areaMatch = text.match(/^(\d+(?:\.\d+)?)\s*(cm²|m²|mm²|ha|km²)$/);
  if (areaMatch) {
    const value = Number(areaMatch[1]);
    const suffix = areaMatch[2];

    out.push(`${formatPlainNumber(value + 1)} ${suffix}`);
    out.push(`${formatPlainNumber(Math.max(1, value - 1))} ${suffix}`);
    out.push(`${formatPlainNumber(value * 2)} ${suffix}`);
    out.push(`${formatPlainNumber(value / 2)} ${suffix}`);
  }

  if (type === "area-triangles") {
    const base = readNumericLabel(cfg.baseLabel);
    const height = readNumericLabel(cfg.heightLabel);
    if (base && height) {
      out.push(`${base * height} ${unit}²`); // forgot to halve
      out.push(`${base + height} ${unit}²`);
    }
  }

  if (type === "area-trapeziums") {
    const a = readNumericLabel(cfg.topLabel);
    const b = readNumericLabel(cfg.bottomLabel);
    const h = readNumericLabel(cfg.heightLabel);
    if (a && b && h) {
      out.push(`${(a + b) * h} ${unit}²`); // forgot to halve
      out.push(`${a * b * h} ${unit}²`);
    }
  }

  if (type === "area-rhombuses" || type === "area-kites") {
    const x = readNumericLabel(cfg.diagonalXLabel);
    const y = readNumericLabel(cfg.diagonalYLabel);
    if (x && y) {
      out.push(`${x * y} ${unit}²`); // forgot to halve
      out.push(`${x + y} ${unit}²`);
    }
  }

  if (type.startsWith("area-circles")) {
    const radius = Number(cfg.radius);
    const diameter = Number(cfg.diameter);
    if (Number.isFinite(radius)) {
      out.push(`${2 * radius}π ${unit}`.trim()); // circumference
      out.push(`${radius}π ${unit}²`.trim()); // forgot square
      out.push(`${radius * radius * 2}π ${unit}²`.trim());
    }
    if (Number.isFinite(diameter)) {
      out.push(`${diameter * diameter}π ${unit}²`.trim()); // used diameter as radius
      out.push(`${diameter}π ${unit}`.trim()); // circumference
      out.push(`${diameter / 2}π ${unit}²`.trim());
    }
  }

  if (type === "area-sectors") {
    const radius = Number(cfg.radius);
    const angle = Number(cfg.angle);
    if (Number.isFinite(radius) && Number.isFinite(angle)) {
      const correctCoeff = angle / 360 * radius * radius;
      out.push(`${roundForChoice(2 * radius * angle / 360)}π ${unit}`.trim()); // arc length instead of area
      out.push(`${roundForChoice(radius * radius)}π ${unit}²`.trim()); // full circle
      out.push(`${roundForChoice(correctCoeff * 2)}π ${unit}²`.trim());
    }
  }

  if (type === "area-semicircles" || type === "area-quadrants") {
    const radius = Number(cfg.radius);
    if (Number.isFinite(radius)) {
      out.push(`${radius * radius}π ${unit}²`.trim()); // full circle
      out.push(`${2 * radius}π ${unit}`.trim()); // circumference-style
      out.push(`${radius}π ${unit}²`.trim()); // forgot square
    }
  }

  if (type === "choose-area-units") {
    const units = ["mm²", "cm²", "m²", "ha", "km²"];
    out.push(...units.filter(u => u !== text));
  }

  if (type === "convert-area-units") {
    const numeric = parseFloat(text.replace(/\s/g, ""));
    if (Number.isFinite(numeric)) {
      const suffix = text.replace(String(numeric), "").trim();
      out.push(`${numeric / 100} ${suffix}`);
      out.push(`${numeric * 100} ${suffix}`);
      out.push(`${numeric / 10000} ${suffix}`);
      out.push(`${numeric * 10000} ${suffix}`);
    }
  }

  return out;
}

function readNumericLabel(value) {
  const match = String(value || "").match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function lengthDistractors(question, correct) {
  const type = String(question.type || "");
  const text = String(correct).trim();
  const out = [];

  const cfg = question.diagram?.config || {};

  if (type.includes("circumference")) {
    const value = Number(cfg.value);
    if (Number.isFinite(value)) {
      if (cfg.given === "radius") {
        out.push(`${value}π ${cfg.unit || ""}`.trim());       // used πr instead of 2πr
        out.push(`${value * value}π ${cfg.unit || ""}`.trim()); // area-style error
      } else {
        out.push(`${value / 2}π ${cfg.unit || ""}`.trim());   // used radius instead of diameter
        out.push(`${value * 2}π ${cfg.unit || ""}`.trim());   // doubled diameter
      }
    }
  }

  if (type === "arc-length" || type === "sector-perimeter") {
    const radius = Number(cfg.radius);
    const angle = Number(cfg.angle);
    const unit = cfg.unit || "";
    if (Number.isFinite(radius) && Number.isFinite(angle)) {
      const arcCoefficient = 2 * radius * angle / 360;
      out.push(`${roundForChoice(arcCoefficient + radius)}π ${unit}`.trim());
      out.push(`${roundForChoice(2 * radius)}π ${unit}`.trim()); // full circumference coefficient
      out.push(`${roundForChoice(radius * angle / 360)}π ${unit}`.trim()); // forgot 2
    }
  }

  if (type === "semicircle-perimeter" || type === "quadrant-perimeter") {
    const radius = Number(cfg.radius);
    const unit = cfg.unit || "";
    if (Number.isFinite(radius)) {
      out.push(`${radius}π ${unit}`.trim());       // curved part only for semicircle
      out.push(`${2 * radius} ${unit}`.trim());    // straight parts only
      out.push(`${2 * radius}π ${unit}`.trim());   // full circumference confusion
    }
  }

  const numberUnit = text.match(/^(\d+(?:\.\d+)?)\s*(cm|m|mm)$/);
  if (numberUnit) {
    const value = Number(numberUnit[1]);
    const unit = numberUnit[2];
    out.push(`${value + 2} ${unit}`);
    out.push(`${Math.max(1, value - 2)} ${unit}`);
    out.push(`${value * 2} ${unit}`);
  }

  if (["radius", "diameter", "chord", "arc", "sector", "segment", "tangent"].includes(text.toLowerCase())) {
    const features = ["radius", "diameter", "chord", "arc", "sector", "segment", "tangent"];
    out.push(...features.filter(feature => feature !== text.toLowerCase()));
  }

  return out;
}

function roundForChoice(value) {
  if (Math.abs(value - Math.round(value)) < 1e-9) return String(Math.round(value));
  return Number(value.toFixed(2)).toString();
}

function linearRelationshipDistractors(question, correct) {
  const text = String(correct).trim();
  const out = [];

  const coordMatch = text.match(/^\((-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\)$/);
  if (coordMatch) {
    const x = Number(coordMatch[1]);
    const y = Number(coordMatch[2]);

    out.push(`(${formatPlainNumber(y)}, ${formatPlainNumber(x)})`);
    out.push(`(${formatPlainNumber(-x)}, ${formatPlainNumber(y)})`);
    out.push(`(${formatPlainNumber(x)}, ${formatPlainNumber(-y)})`);
    out.push(`(${formatPlainNumber(x + 1)}, ${formatPlainNumber(y)})`);
    out.push(`(${formatPlainNumber(x)}, ${formatPlainNumber(y + 1)})`);
  }

  const xMatch = text.match(/^x\s*=\s*(-?\d+(?:\.\d+)?)$/i);
  if (xMatch) {
    const value = Number(xMatch[1]);
    out.push(`x = ${formatPlainNumber(value + 1)}`);
    out.push(`x = ${formatPlainNumber(value - 1)}`);
    out.push(`x = ${formatPlainNumber(-value)}`);
  }

  if (/^line\s+a$/i.test(text)) out.push("Line B");
  if (/^line\s+b$/i.test(text)) out.push("Line A");

  return out;
}

function ratioRateDistractors(question, correct) {
  const text = String(correct).trim();
  const out = [];

  const ratioMatch = text.match(/^(\d+)\s*:\s*(\d+)(?:\s*:\s*(\d+))?$/);
  if (ratioMatch) {
    const a = Number(ratioMatch[1]);
    const b = Number(ratioMatch[2]);
    const c = ratioMatch[3] !== undefined ? Number(ratioMatch[3]) : null;

    if (c === null) {
      out.push(`${b}:${a}`);
      out.push(`${a + 1}:${b}`);
      out.push(`${Math.max(1, a - 1)}:${b}`);
      out.push(`${a}:${b + 1}`);
      out.push(`${a * 2}:${b * 2}`);
    } else {
      out.push(`${b}:${a}:${c}`);
      out.push(`${a}:${c}:${b}`);
      out.push(`${a + 1}:${b}:${c}`);
      out.push(`${a}:${b + 1}:${c}`);
    }
  }

  if (/^pack\s+a$/i.test(text)) out.push("Pack B");
  if (/^pack\s+b$/i.test(text)) out.push("Pack A");

  if (/^yes$/i.test(text)) out.push("No");
  if (/^no$/i.test(text)) out.push("Yes");

  return out;
}

function numericDistractors(question, correct) {
  const parsed = parseNumberWithSuffix(correct);
  if (!parsed) return [];

  const { value, suffix, prefix } = parsed;
  const out = [];

  out.push(formatNumber(value + 1, suffix, prefix));
  out.push(formatNumber(value - 1, suffix, prefix));
  out.push(formatNumber(-value, suffix, prefix));

  if (Math.abs(value) >= 10) {
    out.push(formatNumber(value + 10, suffix, prefix));
    out.push(formatNumber(value - 10, suffix, prefix));
  }

  if (String(correct).includes(".")) {
    out.push(formatNumber(value * 10, suffix, prefix));
    out.push(formatNumber(value / 10, suffix, prefix));
  }

  if (suffix === "%") {
    out.push(formatNumber(value / 100, "", prefix));
    out.push(formatNumber(100 - value, "%", prefix));
  }

  if (suffix === "°") {
    out.push(formatNumber(180 - value, "°", prefix));
    out.push(formatNumber(90 - value, "°", prefix));
    out.push(formatNumber(360 - value, "°", prefix));
  }

  return out;
}


function financialBInterestDistractors(question, correct) {
  const type = String(question.type || "");
  const cfg = question.diagram?.config || {};
  const text = String(correct || "");
  const parsed = parseNumberWithSuffix(text);
  const out = [];

  if (!type.includes("compound") && !type.includes("depreciation")) return out;

  if (parsed && parsed.prefix === "$") {
    const value = parsed.value;
    out.push(formatNumber(value * 1.1, parsed.suffix, parsed.prefix));
    out.push(formatNumber(value * 0.9, parsed.suffix, parsed.prefix));
    out.push(formatNumber(value + 100, parsed.suffix, parsed.prefix));
    out.push(formatNumber(Math.max(0, value - 100), parsed.suffix, parsed.prefix));
  }

  if (/^\d+(?:\.\d+)?%/.test(text)) {
    const value = Number(text.match(/\d+(?:\.\d+)?/)[0]);
    out.push(`${formatPlainNumber(value + 1)}% pa`);
    out.push(`${formatPlainNumber(Math.max(0.1, value - 1))}% pa`);
    out.push(`${formatPlainNumber(100 - value)}% pa`);
  }

  return out;
}

function equationDistractors(question, correct) {
  if (!String(correct).includes("=")) return [];

  const match = String(correct).match(/^([a-zA-Z])\s*=\s*(-?\d+(?:\.\d+)?)/);
  if (!match) return [];

  const variable = match[1];
  const value = Number(match[2]);
  const out = [
    `${variable} = ${formatPlainNumber(-value)}`,
    `${variable} = ${formatPlainNumber(value + 1)}`,
    `${variable} = ${formatPlainNumber(value - 1)}`
  ];

  if (Math.abs(value) >= 2) {
    out.push(`${variable} = ${formatPlainNumber(value * 2)}`);
  }

  return out;
}

function algebraicDistractors(question, correct) {
  const text = String(correct);
  const out = [];

  // Never treat a markup token (e.g. [[frac:5:6]] or [[algfrac:...]]) as an
  // algebraic expression. The letters inside the token name ("frac") would
  // otherwise be mangled into things like [[f²r²a²c²:5:6]], which then fail to
  // render and leak the raw token to students.
  if (text.includes("[[")) {
    return out;
  }

  // Only apply algebraic-expression distractors to compact algebra answers.
  // Long descriptive answers (for example graph features or coordinate pairs joined by "and")
  // were being mangled into unreadable options.
  if (text.length > 32 || /\b(and|or|intercept|asymptote|growth|decay|units|translated|narrower|wider)\b/i.test(text)) {
    return out;
  }

  if (/[a-zA-Z]/.test(text)) {
    out.push(text.replace(/\s*\+\s*/g, " − "));
    out.push(text.replace(/\s*−\s*/g, " + "));
    out.push(text.replace(/(\d)([a-zA-Z])/g, "$1 + $2"));
    out.push(text.replace(/\(([^)]+)\)/g, "$1"));

    // Common Stage 5 algebra expansion errors.
    out.push(text.replace(/[a-zA-Z]²/g, match => match.slice(0, 1)));
    out.push(text.replace(/([a-zA-Z])(?!²)/g, "$1²"));
    out.push(text.replace(/\s+/g, ""));
  }

  return out;
}

function textDistractors(question, correct) {
  const prompt = String(question.prompt || "");
  const out = [];

  if (correct === "<") out.push(">", "=");
  if (correct === ">") out.push("<", "=");
  if (correct === "=") out.push("<", ">");

  if (/true/i.test(correct) || /false/i.test(correct)) {
    out.push(/true/i.test(correct) ? "False" : "True");
  }

  if (/round/i.test(prompt)) {
    const num = parseFloat(correct);
    if (Number.isFinite(num)) {
      out.push(String(Math.round(num)));
      out.push(num.toFixed(2));
    }
  }

  return out;
}

function shuffleUnique(values, correct) {
  const seen = new Set();
  const unique = [];

  for (const value of values) {
    const cleaned = normaliseChoiceText(value);
    if (!cleaned) continue;
    if (seen.has(cleaned)) continue;
    seen.add(cleaned);
    unique.push(cleaned);
  }

  const normalisedCorrect = normaliseChoiceText(correct);
  const distractors = unique.filter(choice => choice !== normalisedCorrect);

  for (let i = distractors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [distractors[i], distractors[j]] = [distractors[j], distractors[i]];
  }

  const finalChoices = [normalisedCorrect, ...distractors.slice(0, 3)].filter(Boolean);

  for (let i = finalChoices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [finalChoices[i], finalChoices[j]] = [finalChoices[j], finalChoices[i]];
  }

  return finalChoices;
}

function normaliseChoiceText(value) {
  return String(value ?? "")
    .replaceAll("−", "-")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^-/, "−");
}

function parseFraction(value) {
  const text = String(value).trim();

  let match = text.match(FRACTION_TOKEN);
  if (match) {
    return {
      n: Number(match[1]),
      d: Number(match[2])
    };
  }

  match = text.match(FRACTION_TEXT);
  if (match) {
    return {
      n: Number(match[1]),
      d: Number(match[2])
    };
  }

  return null;
}

function formatFraction(n, d) {
  if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return "";
  return `[[frac:${Math.round(n)}:${Math.round(d)}]]`;
}

function parseNumberWithSuffix(value) {
  const text = String(value)
    .replaceAll("−", "-")
    .replace(/(?<=\d)[ ,](?=\d{3}(\D|$))/g, "")
    .trim();

  if (text.includes(":")) return null;

  const match = text.match(/^(\$)?\s*(-?\d+(?:\.\d+)?)\s*([^\d]*)$/);
  if (!match) return null;

  return {
    prefix: match[1] || "",
    value: Number(match[2]),
    suffix: (match[3] || "").trim()
  };
}

function formatNumber(value, suffix = "", prefix = "") {
  if (!Number.isFinite(value)) return "";
  return `${prefix}${formatPlainNumber(value)}${suffix}`;
}

function formatPlainNumber(value) {
  if (Math.abs(value - Math.round(value)) < 1e-9) {
    return String(Math.round(value)).replace("-", "−");
  }

  return Number(value.toFixed(2)).toString().replace("-", "−");
}
