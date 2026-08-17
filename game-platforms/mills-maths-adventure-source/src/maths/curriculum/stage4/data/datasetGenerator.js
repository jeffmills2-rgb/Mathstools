import { randInt, pick } from "../../../helpers.js";

const cap = (s) => String(s).replace(/^./, (m) => m.toUpperCase());

/**
 * datasetGenerator (Phase 3I) — PURE synthetic datasets in realistic contexts,
 * each carrying variable metadata (name, TYPE, unit), a title and a data-source
 * line, and a shape matched to the variable type so the data genuinely suits the
 * chart it is drawn as. This is what ties the CLASSIFICATION strand to the
 * CHOICE-OF-GRAPH strand.
 *
 * Dataset shape: {
 *   kind, title, source, xLabel, yLabel,
 *   variable: { name, type, unit },
 *   categories?: [{label, freq}], ordered?,   // categorical / discrete
 *   bins?: [{lo,hi,count}],                    // continuous grouped
 *   series?: [{label, value}],                 // time series
 *   raw?: [numbers],                           // dot plot / stem-and-leaf
 *   bestChart, okCharts,                       // for choose-a-graph
 * }
 */

const YEAR = pick([2023, 2024, 2025]);
const src = (who) => `Source: ${who}, ${YEAR}`;
function rand(min, max) { return randInt(min, max); }
function freqs(n, lo, hi) { return Array.from({ length: n }, () => rand(lo, hi)); }

// ---- categorical (nominal) --------------------------------------------------

const NOMINAL = [
  { name: "favourite fruit", unit: "students", cats: ["Apple", "Banana", "Orange", "Grape", "Mango"], who: "Year 8 survey" },
  { name: "way students travel to school", unit: "students", cats: ["Walk", "Bus", "Car", "Bike", "Train"], who: "Year 8 survey" },
  { name: "favourite pet", unit: "students", cats: ["Dog", "Cat", "Fish", "Bird", "Rabbit"], who: "class survey" },
  { name: "favourite sport", unit: "students", cats: ["Soccer", "Netball", "Cricket", "Basketball", "Tennis"], who: "PE survey" },
  { name: "eye colour", unit: "students", cats: ["Brown", "Blue", "Green", "Hazel"], who: "class survey" },
];

export function makeNominal() {
  const c = pick(NOMINAL);
  const categories = c.cats.map((label) => ({ label, freq: rand(6, 34) }));
  return {
    kind: "categorical", title: cap(c.name),
    source: src(c.who), xLabel: cap(c.name), yLabel: `Number of ${c.unit}`,
    variable: { name: c.name, type: "categorical-nominal", unit: c.unit },
    categories, ordered: false, bestChart: "column", okCharts: ["column", "bar", "sector", "pictogram"],
  };
}

// ---- categorical (ordinal) --------------------------------------------------

const ORDINAL = [
  { name: "T-shirt size", unit: "orders", cats: ["S", "M", "L", "XL"], who: "uniform shop" },
  { name: "survey rating", unit: "responses", cats: ["Poor", "Fair", "Good", "Very good", "Excellent"], who: "customer survey" },
  { name: "level of agreement", unit: "responses", cats: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"], who: "student survey" },
  { name: "school report grade", unit: "students", cats: ["E", "D", "C", "B", "A"], who: "Year 8 reports" },
];

export function makeOrdinal() {
  const c = pick(ORDINAL);
  const categories = c.cats.map((label) => ({ label, freq: rand(5, 30) }));
  return {
    kind: "categorical", title: cap(c.name),
    source: src(c.who), xLabel: cap(c.name), yLabel: `Number of ${c.unit}`,
    variable: { name: c.name, type: "categorical-ordinal", unit: c.unit },
    categories, ordered: true, bestChart: "column", okCharts: ["column", "bar"],
  };
}

// ---- numerical (discrete) ---------------------------------------------------

const DISCRETE = [
  { name: "number of siblings", unit: "students", lo: 0, hi: 5, who: "Year 8 survey" },
  { name: "number of pets owned", unit: "students", lo: 0, hi: 4, who: "class survey" },
  { name: "goals scored per game", unit: "games", lo: 0, hi: 6, who: "season records" },
  { name: "books read last month", unit: "students", lo: 0, hi: 6, who: "library survey" },
];

export function makeDiscrete() {
  const c = pick(DISCRETE);
  const raw = [];
  const n = rand(16, 26);
  for (let i = 0; i < n; i++) raw.push(rand(c.lo, c.hi));
  const categories = [];
  for (let v = c.lo; v <= c.hi; v++) categories.push({ label: String(v), freq: raw.filter((r) => r === v).length });
  return {
    kind: "discrete", title: `${c.name.replace(/^./, (m) => m.toUpperCase())}`,
    source: src(c.who), xLabel: c.name, yLabel: "Frequency",
    variable: { name: c.name, type: "numerical-discrete", unit: c.unit },
    categories, raw, bestChart: "dotPlot", okCharts: ["dotPlot", "column"],
  };
}

// ---- numerical (continuous) -------------------------------------------------

const CONTINUOUS = [
  { name: "height", unit: "cm", lo: 140, hi: 185, width: 10, who: "Year 8 measurements" },
  { name: "reaction time", unit: "ms", lo: 200, hi: 380, width: 30, who: "science experiment" },
  { name: "mass of apples", unit: "g", lo: 100, hi: 190, width: 15, who: "orchard sample" },
  { name: "long jump distance", unit: "cm", lo: 250, hi: 430, width: 30, who: "sports carnival" },
];

export function makeContinuous() {
  const c = pick(CONTINUOUS);
  const raw = [];
  const n = rand(18, 28);
  for (let i = 0; i < n; i++) raw.push(rand(c.lo, c.hi - 1));
  const bins = [];
  for (let lo = c.lo; lo < c.hi; lo += c.width) bins.push({ lo, hi: lo + c.width, count: raw.filter((v) => v >= lo && v < lo + c.width).length });
  return {
    kind: "continuous", title: cap(c.name),
    source: src(c.who), xLabel: `${cap(c.name)} (${c.unit})`, yLabel: "Frequency",
    variable: { name: c.name, type: "numerical-continuous", unit: c.unit },
    bins, raw, width: c.width, bestChart: "histogram", okCharts: ["histogram", "polygon", "stemLeaf"],
  };
}

// ---- time series (line) -----------------------------------------------------

// Values are generated as whole MULTIPLES of `step`, and `yStep` tells the chart
// to place gridlines at that step, so every point lands exactly on a gridline
// (the increment and the values are then readable off the vertical axis).
const TIMESERIES = [
  { name: "temperature", unit: "°C", labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], step: 5, kLo: 3, kHi: 7, who: "weather station" },
  { name: "daily website visitors", unit: "visitors", labels: ["Mon", "Tue", "Wed", "Thu", "Fri"], step: 20, kLo: 2, kHi: 8, who: "site analytics" },
  { name: "plant height", unit: "cm", labels: ["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5", "Wk 6"], step: 3, kLo: 1, kHi: 7, who: "science experiment", rising: true },
  { name: "monthly sales", unit: "$1000s", labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], step: 10, kLo: 2, kHi: 8, who: "company records" },
];

export function makeTimeSeries() {
  const c = pick(TIMESERIES);
  let k = rand(c.kLo, Math.round((c.kLo + c.kHi) / 2));
  const series = c.labels.map((label) => {
    k = c.rising ? Math.min(c.kHi, k + rand(1, 2)) : Math.max(c.kLo, Math.min(c.kHi, k + rand(-2, 2)));
    return { label, value: k * c.step };
  });
  return {
    kind: "timeSeries", title: `${cap(c.name)} over time`,
    source: src(c.who), xLabel: "Time", yLabel: `${cap(c.name)} (${c.unit})`,
    variable: { name: c.name, type: "numerical-continuous", unit: c.unit },
    series, yStep: c.step, rising: Boolean(c.rising), bestChart: "line", okCharts: ["line"],
  };
}

// ---- parts of a whole (pie / divided bar) -----------------------------------

const PARTS = [
  { name: "how Ava spends a typical day", unit: "hours", cats: [["Sleep", 8], ["School", 6], ["Homework", 2], ["Sport", 2], ["Free time", 4], ["Meals", 2]], who: "personal diary" },
  { name: "monthly household budget", unit: "%", cats: [["Rent", 35], ["Food", 25], ["Transport", 15], ["Savings", 15], ["Other", 10]], who: "family budget" },
  { name: "school canteen sales", unit: "%", cats: [["Drinks", 30], ["Snacks", 25], ["Lunches", 35], ["Fruit", 10]], who: "canteen records" },
];

export function makePartsOfWhole() {
  const c = pick(PARTS);
  const categories = c.cats.map(([label, freq]) => ({ label, freq }));
  return {
    kind: "partsOfWhole", title: `${c.name.replace(/^./, (m) => m.toUpperCase())}`,
    source: src(c.who), xLabel: c.name, yLabel: c.unit,
    variable: { name: c.name, type: "categorical-nominal", unit: c.unit },
    categories, bestChart: "sector", okCharts: ["sector", "dividedBar"],
  };
}

// A dataset well-suited to a requested chart type (for read / construct tasks).
export function datasetForChart(chart) {
  switch (chart) {
    case "histogram": case "polygon": return makeContinuous();
    case "stemLeaf": return makeContinuous();
    case "dotPlot": return makeDiscrete();
    case "line": return makeTimeSeries();
    case "sector": case "dividedBar": case "pictogram": return makePartsOfWhole();
    case "bar": return pick([makeNominal, makeOrdinal])();
    default: return pick([makeNominal, makeOrdinal, makeDiscrete])();
  }
}
export function anyDataset() {
  return pick([makeNominal, makeOrdinal, makeDiscrete, makeContinuous, makeTimeSeries, makePartsOfWhole])();
}

// ---- classification scenario bank -------------------------------------------
// Each scenario carries its correct classification for the classify skills.
// type ∈ numerical-discrete | numerical-continuous | categorical-nominal | categorical-ordinal

export const SCENARIOS = [
  { text: "the number of students in each class", type: "numerical-discrete" },
  { text: "the number of pets a person owns", type: "numerical-discrete" },
  { text: "the number of goals scored in a match", type: "numerical-discrete" },
  { text: "the number of siblings a student has", type: "numerical-discrete" },
  { text: "the height of a plant in centimetres", type: "numerical-continuous" },
  { text: "the time taken to run 100 metres", type: "numerical-continuous" },
  { text: "the mass of a bag of apples", type: "numerical-continuous" },
  { text: "the temperature of a room during the day", type: "numerical-continuous" },
  { text: "the colour of cars in a car park", type: "categorical-nominal" },
  { text: "the type of pet a person owns", type: "categorical-nominal" },
  { text: "a person's favourite sport", type: "categorical-nominal" },
  { text: "the country a person was born in", type: "categorical-nominal" },
  { text: "T-shirt sizes (S, M, L, XL)", type: "categorical-ordinal" },
  { text: "a movie rating (1 to 5 stars)", type: "categorical-ordinal" },
  { text: "the level of agreement (disagree, neutral, agree)", type: "categorical-ordinal" },
  { text: "a school report grade (A, B, C, D)", type: "categorical-ordinal" },
];

export const TYPE_LABEL = {
  "numerical-discrete": "Numerical (discrete)",
  "numerical-continuous": "Numerical (continuous)",
  "categorical-nominal": "Categorical (nominal)",
  "categorical-ordinal": "Categorical (ordinal)",
};
