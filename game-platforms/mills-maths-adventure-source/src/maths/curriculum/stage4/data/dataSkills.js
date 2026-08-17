import { randInt, pick, makeQuestion } from "../../../helpers.js";
import {
  makeNominal, makeOrdinal, makeDiscrete, makeContinuous, makeTimeSeries, makePartsOfWhole,
  datasetForChart, anyDataset, SCENARIOS, TYPE_LABEL,
} from "./datasetGenerator.js";
import { sectorAngleOf, stats, sum } from "../../../../ui/diagrams/chartUtils.js";

/**
 * STAGE 4 · Data Classification & Visualisation — NATIVE skills (Phase 3I).
 * Built on the pure charting core (chartUtils) + dataset generator + three chart
 * renderers. Full NESA coverage: classify variables (numerical discrete/
 * continuous, categorical nominal/ordinal), read + interpret graphs, construct/
 * complete graphs, select AND justify the best graph, interpret trends to
 * predict + conclude, and explain WHY a graph misleads and HOW to fix it, plus
 * an infographic "choose the representations" task.
 *
 * BANDING (skill order = progression): classify → read → construct → choose+
 * justify → interpret/predict/compare → misleading → infographic. Levels 1–5 add
 * chart variety and reasoning depth.
 */
const SYL = "MA4-DAT";

const CHART_NAME = {
  column: "Column graph", bar: "Bar graph", sector: "Sector (pie) graph", dividedBar: "Divided bar graph",
  pictogram: "Pictogram", line: "Line graph", histogram: "Histogram", polygon: "Frequency polygon",
  dotPlot: "Dot plot", stemLeaf: "Stem-and-leaf plot",
};
const CHART_REASON = {
  column: "Column graphs compare the frequencies of separate categories.",
  sector: "A sector (pie) graph shows how parts make up a whole.",
  line: "A line graph shows how a quantity changes over time.",
  histogram: "A histogram shows the distribution of continuous grouped data.",
  dotPlot: "A dot plot shows the spread of a small set of discrete data.",
  dividedBar: "A divided bar graph shows the parts of a whole.",
  stemLeaf: "A stem-and-leaf plot shows the distribution while keeping the actual values.",
};
const FAMILY = {
  column: "statAxisChart", bar: "statAxisChart", line: "statAxisChart", histogram: "statAxisChart", polygon: "statAxisChart",
  sector: "statProportionChart", dividedBar: "statProportionChart", pictogram: "statProportionChart",
  dotPlot: "statPlotChart", stemLeaf: "statPlotChart",
};

// ---- helpers ----------------------------------------------------------------

function shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function optionsOf(correct, pool, n = 4) { const out = [correct]; for (const c of pool) { if (out.length >= n) break; if (c != null && !out.includes(c)) out.push(c); } return shuffle(out); }

function degQ(config, value) { return makeQuestion({ ...config, inputMode: "simple", answer: String(value), acceptableAnswers: [`${value}°`] }); }
function mcQ(config, correct, options) { return makeQuestion({ ...config, answerMode: "multipleChoice", answer: correct, options }); }
function multiSelectQ(config, correctOptions, allOptions) { const q = makeQuestion({ ...config, answerMode: "multiSelect", answer: correctOptions.join(", "), options: allOptions }); q.correctOptions = correctOptions; return q; }
// A two-part question where BOTH parts are multiple-choice (choice + reason /
// problem + fix). Reuses the multi-part MC machinery — both must be correct.
function twoPartQ(config, parts) {
  return makeQuestion({
    ...config, answerMode: "multiPart", answer: parts[parts.length - 1].answer,
    expectedParts: parts.map((p) => ({ label: p.label, prompt: p.prompt, answer: p.answer, options: optionsOf(p.answer, shuffle(p.pool)) })),
  });
}
function chartOf(ds, chartType, extra = {}) {
  return { diagramType: FAMILY[chartType], diagramData: { chartType, ...ds, unit: ds.variable?.unit, ...extra } };
}

const NUM_SCENARIOS = SCENARIOS.filter((s) => s.type.startsWith("numerical"));
const CAT_SCENARIOS = SCENARIOS.filter((s) => s.type.startsWith("categorical"));

// Turn a compact axis label into a natural time phrase (teacher fix — "at Mon"
// reads badly): "on Monday" / "in Week 2" / "in January".
const DAY_NAMES = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday" };
const MONTH_NAMES = { Jan: "January", Feb: "February", Mar: "March", Apr: "April", May: "May", Jun: "June" };
function timePhrase(label) {
  if (DAY_NAMES[label]) return `on ${DAY_NAMES[label]}`;
  if (MONTH_NAMES[label]) return `in ${MONTH_NAMES[label]}`;
  const wk = /^Wk\s*(\d+)$/.exec(label);
  if (wk) return `in Week ${wk[1]}`;
  return `at ${label}`;
}

// ---- A1. Define a variable & numerical vs categorical -----------------------

export const defineClassify = {
  id: "defineClassify", name: "Classifying Variables", syllabusArea: SYL,
  prerequisiteSkillIds: [], nextSkillIds: ["discreteContinuous"],
  generate(level) {
    if (level <= 1) {
      return mcQ({
        topic: "defineClassify",
        text: `In statistics, what is a VARIABLE?`,
        feedback: `A variable is any characteristic, number or quantity that can be measured or counted.`,
      }, "Any characteristic, number or quantity that can be measured or counted", optionsOf(
        "Any characteristic, number or quantity that can be measured or counted",
        ["A letter that stands for an unknown number in an equation", "The answer to a survey question", "A type of graph"]));
    }
    if (level >= 4) {
      // Select ALL that are categorical (or numerical) — the set is composed to
      // always contain some of each type.
      const wantCat = pick([true, false]);
      const A = shuffle(wantCat ? CAT_SCENARIOS : NUM_SCENARIOS).slice(0, randInt(2, 3));
      const B = shuffle(wantCat ? NUM_SCENARIOS : CAT_SCENARIOS).slice(0, 2);
      const chosen = shuffle([...A, ...B]);
      const correct = chosen.filter((s) => s.type.startsWith(wantCat ? "categorical" : "numerical")).map((s) => cap(s.text));
      const all = chosen.map((s) => cap(s.text));
      return multiSelectQ({
        topic: "defineClassify",
        text: `Select ALL of these variables that are ${wantCat ? "CATEGORICAL" : "NUMERICAL"}.`,
        feedback: `${wantCat ? "Categorical" : "Numerical"} here: ${correct.join("; ")}.`,
      }, correct, all);
    }
    const s = pick(SCENARIOS);
    const isNum = s.type.startsWith("numerical");
    return mcQ({
      topic: "defineClassify",
      text: `Classify this variable:\n"${cap(s.text)}".\nIs it numerical or categorical?`,
      feedback: isNum ? `Numerical — it is a number that is counted or measured.` : `Categorical — it sorts data into groups or categories, not numbers.`,
    }, isNum ? "Numerical" : "Categorical", ["Numerical", "Categorical"]);
  },
};

// ---- A2. Discrete vs continuous ---------------------------------------------

export const discreteContinuous = {
  id: "discreteContinuous", name: "Discrete or Continuous", syllabusArea: SYL,
  prerequisiteSkillIds: ["defineClassify"], nextSkillIds: ["nominalOrdinal"],
  generate(level) {
    if (level >= 4) {
      const disc = shuffle(NUM_SCENARIOS.filter((s) => s.type === "numerical-discrete")).slice(0, randInt(2, 3));
      const cont = shuffle(NUM_SCENARIOS.filter((s) => s.type === "numerical-continuous")).slice(0, 2);
      const chosen = shuffle([...disc, ...cont]);
      const correct = chosen.filter((s) => s.type === "numerical-discrete").map((s) => cap(s.text));
      const all = chosen.map((s) => cap(s.text));
      return multiSelectQ({
        topic: "discreteContinuous",
        text: `These are all NUMERICAL variables.\nSelect ALL that are DISCRETE (counted in whole numbers).`,
        feedback: `Discrete (counted): ${correct.join("; ")}. The rest are continuous (measured).`,
      }, correct, all);
    }
    const s = pick(NUM_SCENARIOS);
    const disc = s.type === "numerical-discrete";
    return mcQ({
      topic: "discreteContinuous",
      text: `"${cap(s.text)}" is a numerical variable.\nIs it discrete or continuous?`,
      feedback: disc ? `Discrete — it can only take separate whole-number values (you COUNT it).` : `Continuous — it can take any value in a range (you MEASURE it).`,
    }, disc ? "Discrete" : "Continuous", ["Discrete", "Continuous"]);
  },
};

// ---- A3. Nominal vs ordinal -------------------------------------------------

export const nominalOrdinal = {
  id: "nominalOrdinal", name: "Nominal or Ordinal", syllabusArea: SYL,
  prerequisiteSkillIds: ["discreteContinuous"], nextSkillIds: ["readGraph"],
  generate(level) {
    if (level >= 4) {
      const ord = shuffle(CAT_SCENARIOS.filter((s) => s.type === "categorical-ordinal")).slice(0, randInt(2, 3));
      const nom = shuffle(CAT_SCENARIOS.filter((s) => s.type === "categorical-nominal")).slice(0, 2);
      const chosen = shuffle([...ord, ...nom]);
      const correct = chosen.filter((s) => s.type === "categorical-ordinal").map((s) => cap(s.text));
      const all = chosen.map((s) => cap(s.text));
      return multiSelectQ({
        topic: "nominalOrdinal",
        text: `These are all CATEGORICAL variables.\nSelect ALL that are ORDINAL (the categories have a natural order).`,
        feedback: `Ordinal (ordered categories): ${correct.join("; ")}. The rest are nominal (no order).`,
      }, correct, all);
    }
    const s = pick(CAT_SCENARIOS);
    const ord = s.type === "categorical-ordinal";
    return mcQ({
      topic: "nominalOrdinal",
      text: `"${cap(s.text)}" is a categorical variable.\nIs it nominal or ordinal?`,
      feedback: ord ? `Ordinal — the categories have a natural ORDER.` : `Nominal — the categories are just names with NO natural order.`,
    }, ord ? "Ordinal" : "Nominal", ["Nominal", "Ordinal"]);
  },
};

// ---- B. Read values off a graph ---------------------------------------------

export const readGraph = {
  id: "readGraph", name: "Reading Graphs", syllabusArea: SYL,
  prerequisiteSkillIds: ["nominalOrdinal"], nextSkillIds: ["constructGraph"],
  generate(level) {
    if (level <= 1) {
      const ds = pick([makeNominal, makeOrdinal])();
      const c = pick(ds.categories);
      return degQ({
        topic: "readGraph", text: `Read the graph.\nHow many ${ds.variable.unit} are in the "${c.label}" category?`,
        feedback: `Read the height of the "${c.label}" column: ${c.freq}.`,
        ...chartOf(ds, "column"),
      }, c.freq);
    }
    if (level === 2) {
      const ds = makeTimeSeries();
      const p = pick(ds.series);
      const when = timePhrase(p.label);
      return degQ({
        topic: "readGraph", text: `Read the line graph.\nFind the ${ds.variable.name} ${when}.`,
        feedback: `Find ${when.replace(/^(on|in|at) /, "")} on the horizontal axis and read up to the line: ${p.value} ${ds.variable.unit}.`,
        ...chartOf(ds, "line"),
      }, p.value);
    }
    if (level === 3) {
      const ds = makeDiscrete();
      const st = stats(ds.raw);
      const ask = pick(["total", "mode", "range"]);
      const val = ask === "total" ? st.n : ask === "mode" ? st.mode : st.range;
      const q = ask === "total" ? `How many ${ds.variable.unit} were surveyed in total?` : ask === "mode" ? `What is the mode (most common value)?` : `What is the range of the data?`;
      return degQ({
        topic: "readGraph", text: `Read the dot plot.\n${q}`,
        feedback: ask === "total" ? `Count all the dots: ${val}.` : ask === "mode" ? `The tallest stack is at ${val} — that is the mode.` : `Range = highest − lowest = ${st.max} − ${st.min} = ${val}.`,
        ...chartOf(ds, "dotPlot"),
      }, val);
    }
    if (level === 4) {
      const ds = makeContinuous();
      const st = stats(ds.raw);
      const ask = pick(["count", "max", "min"]);
      const val = ask === "count" ? ds.raw.length : ask === "max" ? st.max : st.min;
      const q = ask === "count" ? `How many values are shown in total?` : ask === "max" ? `What is the largest value?` : `What is the smallest value?`;
      return degQ({
        topic: "readGraph", text: `Read the stem-and-leaf plot.\n${q}`,
        feedback: ask === "count" ? `Count every leaf: ${val}.` : `Use the key to read the ${ask === "max" ? "last" : "first"} value: ${val}.`,
        ...chartOf(ds, "stemLeaf"),
      }, val);
    }
    // L5: read a sector graph — most common category (MC).
    const ds = makePartsOfWhole();
    const top = ds.categories.reduce((a, b) => (b.freq > a.freq ? b : a));
    return mcQ({
      topic: "readGraph", text: `Read the sector (pie) graph.\nWhich category is the LARGEST?`,
      feedback: `The largest sector is "${top.label}".`,
      ...chartOf(ds, "sector"),
    }, top.label, optionsOf(top.label, shuffle(ds.categories.map((c) => c.label).filter((l) => l !== top.label))));
  },
};

// ---- C. Construct / complete a graph ----------------------------------------

export const constructGraph = {
  id: "constructGraph", name: "Constructing Graphs", syllabusArea: SYL,
  prerequisiteSkillIds: ["readGraph"], nextSkillIds: ["chooseGraph"],
  generate(level) {
    if (level <= 2) {
      const ds = makePartsOfWhole();
      const total = sum(ds.categories.map((c) => c.freq));
      const c = pick(ds.categories);
      const angle = sectorAngleOf(c.freq, total);
      return degQ({
        topic: "constructGraph",
        text: `You are drawing a sector (pie) graph.\n"${c.label}" is ${c.freq} out of ${total} ${ds.variable.unit === "%" ? "%" : ds.variable.unit}.\nWhat angle (in degrees) should its sector be?`,
        feedback: `Sector angle = frequency ÷ total × 360° = ${c.freq} ÷ ${total} × 360° = ${angle}°.`,
        ...chartOf(ds, "sector"),
      }, angle);
    }
    if (level === 3) {
      const ds = makeContinuous();
      const b = pick(ds.bins);
      return degQ({
        topic: "constructGraph",
        text: `You are drawing a histogram.\nHow many values fall in the class ${b.lo}–${b.hi} ${ds.variable.unit}?`,
        feedback: `Count the values from ${b.lo} up to (but not including) ${b.hi}: ${b.count}.`,
        ...chartOf(ds, "stemLeaf"),
      }, b.count);
    }
    if (level === 4) {
      const per = pick([2, 5, 10]);
      const icons = randInt(2, 6);
      const value = per * icons;
      return degQ({
        topic: "constructGraph",
        text: `On a pictogram, each icon represents ${per} people.\nHow many people do ${icons} icons represent?`,
        feedback: `${icons} × ${per} = ${value} people.`,
      }, value);
    }
    // L5: complete a stem-and-leaf — count values in a stem.
    const ds = makeContinuous();
    const st = pick(ds.raw);
    const stem = Math.floor(st / 10);
    const count = ds.raw.filter((v) => Math.floor(v / 10) === stem).length;
    return degQ({
      topic: "constructGraph",
      text: `You are completing a stem-and-leaf plot.\nHow many values have the stem ${stem}?`,
      feedback: `Count the leaves on the stem ${stem}: ${count}.`,
      ...chartOf(ds, "stemLeaf"),
    }, count);
  },
};

// ---- D. Choose + justify the best graph -------------------------------------

export const chooseGraph = {
  id: "chooseGraph", name: "Choosing the Best Graph", syllabusArea: SYL,
  prerequisiteSkillIds: ["constructGraph"], nextSkillIds: ["interpretTrend"],
  generate(level) {
    const ds = anyDataset();
    const best = ds.bestChart;
    const graphAns = CHART_NAME[best], reasonAns = CHART_REASON[best];
    return twoPartQ({
      topic: "chooseGraph",
      text: `A dataset records ${ds.variable.name} — a ${TYPE_LABEL[ds.variable.type].toLowerCase()} variable.\nChoose the best graph to display it, then the reason.`,
      feedback: `${graphAns}: ${reasonAns}`,
    }, [
      { label: "Graph", prompt: "The best graph type", answer: graphAns, pool: shuffle(Object.values(CHART_NAME).filter((n) => n !== graphAns)) },
      { label: "Reason", prompt: "Why is it best?", answer: reasonAns, pool: shuffle(Object.values(CHART_REASON).filter((r) => r !== reasonAns)) },
    ]);
  },
};

// ---- E1. Interpret a trend → predict / conclude -----------------------------

export const interpretTrend = {
  id: "interpretTrend", name: "Interpreting Trends", syllabusArea: SYL,
  prerequisiteSkillIds: ["chooseGraph"], nextSkillIds: ["compareGraphs"],
  generate(level) {
    if (level <= 1) {
      const ds = makeTimeSeries();
      const rising = ds.series[ds.series.length - 1].value >= ds.series[0].value;
      return mcQ({
        topic: "interpretTrend", text: `Look at the overall trend on the line graph.\nIs ${ds.variable.name} generally increasing or decreasing over time?`,
        feedback: `Overall the line ${rising ? "rises" : "falls"} from start to end — the trend is ${rising ? "increasing" : "decreasing"}.`,
        ...chartOf(ds, "line"),
      }, rising ? "Increasing" : "Decreasing", ["Increasing", "Decreasing"]);
    }
    if (level <= 3) {
      // Predict the next value from a steady (arithmetic) trend. `start` is a
      // multiple of the step and yStep = d, so EVERY point lands on a gridline
      // — the rise per week is read straight off the vertical axis (teacher fix).
      const d = pick([2, 3, 4]);
      const start = d * randInt(2, 3);
      const labels = ["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5"];
      const series = labels.map((label, i) => ({ label, value: start + i * d }));
      const next = start + labels.length * d;
      const ds = { kind: "timeSeries", title: "Plant height over time", source: "Source: science experiment, 2024", xLabel: "Time", yLabel: "Height (cm)", variable: { name: "plant height", type: "numerical-continuous", unit: "cm" }, series, yStep: d };
      return degQ({
        topic: "interpretTrend",
        text: `The line graph rises by the same amount each week.\nUse the trend to PREDICT the height in Week 6.`,
        feedback: `Each point is one gridline higher, so the height rises by ${d} cm each week: Week 6 = ${series[4].value} + ${d} = ${next} cm.`,
        ...chartOf(ds, "line"),
      }, next);
    }
    // L4-5: draw a conclusion from the trend (MC).
    const ds = makeTimeSeries();
    const rising = ds.series[ds.series.length - 1].value >= ds.series[0].value;
    const correct = rising ? "The values are growing, so we expect them to keep rising." : "The values are falling, so we expect them to keep dropping.";
    return mcQ({
      topic: "interpretTrend", text: `Based on the trend, which conclusion is best supported by the graph?`,
      feedback: correct,
      ...chartOf(ds, "line"),
    }, correct, optionsOf(correct, ["The values never change.", "The values are completely random.", rising ? "The values are falling." : "The values are rising."]));
  },
};

// ---- E2. Compare features / draw conclusions --------------------------------

export const compareGraphs = {
  id: "compareGraphs", name: "Comparing & Concluding", syllabusArea: SYL,
  prerequisiteSkillIds: ["interpretTrend"], nextSkillIds: ["misleading"],
  generate(level) {
    const ds = pick([makeNominal, makeOrdinal])();
    const sorted = [...ds.categories].sort((a, b) => b.freq - a.freq);
    if (level <= 2) {
      const a = sorted[0], b = sorted[sorted.length - 1];
      return degQ({
        topic: "compareGraphs", text: `Read the graph.\nHow many MORE ${ds.variable.unit} are in "${a.label}" than in "${b.label}"?`,
        feedback: `${a.freq} − ${b.freq} = ${a.freq - b.freq}.`,
        ...chartOf(ds, "column"),
      }, a.freq - b.freq);
    }
    if (level === 3) {
      const total = sum(ds.categories.map((c) => c.freq));
      return degQ({
        topic: "compareGraphs", text: `Read the graph.\nHow many ${ds.variable.unit} are there altogether?`,
        feedback: `Add every column: ${ds.categories.map((c) => c.freq).join(" + ")} = ${total}.`,
        ...chartOf(ds, "column"),
      }, total);
    }
    const top = sorted[0];
    return mcQ({
      topic: "compareGraphs", text: `Which conclusion is supported by the graph?`,
      feedback: `"${top.label}" has the tallest column, so it is the most common.`,
      ...chartOf(ds, "column"),
    }, `"${top.label}" is the most common category`, optionsOf(`"${top.label}" is the most common category`,
      [`"${sorted[sorted.length - 1].label}" is the most common category`, "Every category is equally common", "The data is about heights"]));
  },
};

// ---- F. Misleading graphs (why + how to fix) --------------------------------

export const misleading = {
  id: "misleading", name: "Misleading Graphs", syllabusArea: SYL,
  prerequisiteSkillIds: ["compareGraphs"], nextSkillIds: ["infographic"],
  generate(level) {
    const usePictogram = level >= 4 && pick([true, false]);
    if (usePictogram) {
      const ds = makePartsOfWhole();
      return twoPartQ({
        topic: "misleading",
        text: `This pictogram is misleading.\nChoose what makes it misleading, then how to fix it.`,
        feedback: `The icons are drawn in different sizes, so the areas exaggerate the differences. Fix: make every icon the same size.`,
        ...chartOf(ds, "pictogram", { misleading: "iconSize" }),
      }, [
        { label: "Problem", prompt: "What makes it misleading?", answer: "The icons are drawn in different sizes.", pool: ["There is no key.", "The categories are unlabelled.", "There are too few categories.", "The icons are the wrong colour."] },
        { label: "Fix", prompt: "How would you fix it?", answer: "Make every icon the same size.", pool: ["Add more colours.", "Use fewer categories.", "Remove the key.", "Make the icons 3-D."] },
      ]);
    }
    const ds = datasetForChart("bar"); // categorical → column
    const ct = "column";
    return twoPartQ({
      topic: "misleading",
      text: `This graph is misleading.\nChoose what makes it misleading, then how to fix it.`,
      feedback: `The vertical axis does not start at zero, so small differences look much larger than they really are. Fix: start the vertical axis at zero.`,
      ...chartOf(ds, ct, { misleading: "truncated" }),
    }, [
      { label: "Problem", prompt: "What makes it misleading?", answer: "The vertical axis does not start at zero.", pool: ["The bars are different colours.", "There is no title.", "The categories are in the wrong order.", "There are too many categories."] },
      { label: "Fix", prompt: "How would you fix it?", answer: "Start the vertical axis at zero.", pool: ["Use brighter colours.", "Remove the title.", "Sort the categories alphabetically.", "Make the bars wider."] },
    ]);
  },
};

// ---- G. Infographic: choose the representations ------------------------------

export const infographic = {
  id: "infographic", name: "Infographics", syllabusArea: SYL,
  prerequisiteSkillIds: ["misleading"], nextSkillIds: [],
  generate(level) {
    const ds = anyDataset();
    const ok = ds.okCharts.map((c) => CHART_NAME[c]);
    const distract = shuffle(Object.values(CHART_NAME).filter((n) => !ok.includes(n)));
    const all = shuffle([...ok, ...distract.slice(0, Math.max(2, 6 - ok.length))]);
    return multiSelectQ({
      topic: "infographic",
      text: `You are designing an infographic for a dataset of ${ds.variable.name} (${TYPE_LABEL[ds.variable.type].toLowerCase()}).\nSelect ALL the graph types that would suit this data.`,
      feedback: `Suitable graphs: ${ok.join(", ")}. They match a ${TYPE_LABEL[ds.variable.type].toLowerCase()} variable.`,
    }, ok, all);
  },
};

function cap(s) { return String(s).replace(/^./, (m) => m.toUpperCase()); }

export const DATA_SKILLS_LIST = [
  defineClassify, discreteContinuous, nominalOrdinal, readGraph, constructGraph,
  chooseGraph, interpretTrend, compareGraphs, misleading, infographic,
];

export default DATA_SKILLS_LIST;
