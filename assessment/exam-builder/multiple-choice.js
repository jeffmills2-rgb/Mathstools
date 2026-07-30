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
      space: "none",
      tags: [...(question.tags || []), "multiple choice"]
    };
  }

  if (!isSuitableForMultipleChoice(question)) return null;

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
  const prompt = String(question.prompt || "").trim().toLowerCase();

  // "Shade the fraction" is a student drawing task, not a natural MC item.
  if (prompt.startsWith("shade ")) return false;
  if (prompt.startsWith("draw ")) return false;
  if (prompt.startsWith("construct ")) return false;
  if (prompt.startsWith("plot ")) return false;
  if (question.type === "shade-fraction") return false;
  if (question.type === "shaded-fractions-shade") return false;
  if (question.type === "distance-time-construct") return false;
  if (question.type === "factor-tree-complete") return false;

  // Very open prompts are not reliable as automatic MC items.
  if (!question.answer) return false;

  return true;
}

function buildDistractors(question, correct) {
  const builders = [
    fractionDistractors,
    indexDistractors,
    ratioRateDistractors,
    numericDistractors,
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
    .filter(choice => choice !== correct);
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


function indexDistractors(question, correct) {
  const text = String(correct).trim();
  const out = [];

  const pow = parseIndexPower(text);
  if (pow) {
    const { base, exponent } = pow;
    out.push(formatIndexPower(base, exponent + 1));
    out.push(formatIndexPower(base, Math.max(0, exponent - 1)));
    out.push(formatIndexPower(base + 1, exponent));
    out.push(String(Math.pow(base, exponent)));
    out.push(formatIndexPower(base, exponent * 2));
  }

  const factorMatch = text.match(/^(.+?)(?:\s*=\s*)?([2-9][⁰¹²³⁴⁵⁶⁷⁸⁹]*(?:\s*×\s*[2-9][⁰¹²³⁴⁵⁶⁷⁸⁹]*)+)$/);
  if (factorMatch) {
    const expr = factorMatch[2];
    out.push(expr.replace(/²/g, "×2"));
    out.push(expr.replace(/³/g, "×3"));
  }

  if (/^1$/.test(text) && /⁰|\^0|zero index/i.test(String(question.prompt || ""))) {
    out.push("0", "10", "Cannot be evaluated");
  }

  return out;
}

function parseIndexPower(text) {
  const normalized = String(text).trim().replace(/\s+/g, "");
  const unicodeMatch = normalized.match(/^(\d+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)$/);
  if (unicodeMatch) {
    return {
      base: Number(unicodeMatch[1]),
      exponent: unsuperscript(unicodeMatch[2])
    };
  }

  const caretMatch = normalized.match(/^(\d+)\^(\d+)$/);
  if (caretMatch) {
    return {
      base: Number(caretMatch[1]),
      exponent: Number(caretMatch[2])
    };
  }

  return null;
}

function unsuperscript(text) {
  const map = {
    "⁰": "0",
    "¹": "1",
    "²": "2",
    "³": "3",
    "⁴": "4",
    "⁵": "5",
    "⁶": "6",
    "⁷": "7",
    "⁸": "8",
    "⁹": "9"
  };

  return Number(String(text).split("").map(ch => map[ch] ?? "").join(""));
}

function formatIndexPower(base, exponent) {
  return `${base}${toSuperscript(exponent)}`;
}

function toSuperscript(value) {
  const map = {
    "-": "⁻",
    "0": "⁰",
    "1": "¹",
    "2": "²",
    "3": "³",
    "4": "⁴",
    "5": "⁵",
    "6": "⁶",
    "7": "⁷",
    "8": "⁸",
    "9": "⁹"
  };

  return String(value).split("").map(ch => map[ch] ?? ch).join("");
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

  if (/[a-zA-Z]/.test(text)) {
    out.push(text.replace(/\s*\+\s*/g, " − "));
    out.push(text.replace(/\s*−\s*/g, " + "));
    out.push(text.replace(/(\d)([a-zA-Z])/g, "$1 + $2"));
    out.push(text.replace(/\(([^)]+)\)/g, "$1"));
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

  // Keep only one exact correct answer but shuffle the final order.
  const correctIndex = unique.indexOf(correct);
  if (correctIndex > 0) {
    unique.splice(correctIndex, 1);
    unique.unshift(correct);
  }

  for (let i = unique.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unique[i], unique[j]] = [unique[j], unique[i]];
  }

  return unique;
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
  const text = String(value).replaceAll("−", "-").trim();

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
