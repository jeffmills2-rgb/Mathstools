/*
  Exam-builder verification harness
  ---------------------------------
  No external deps. Builds a minimal SVG-capable DOM shim, then:
   1. Imports every question bank, generates questions per type + mixed,
      validates each against the real question schema, collects diagram configs.
   2. Loads every diagram engine into the shim and renders every real
      diagram config produced by the banks, asserting an <svg> was drawn.
   3. Cross-checks every referenced engine id against the renderer registry.
*/

import { readFileSync, readdirSync, statSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";

import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* ---------- minimal DOM shim ---------- */
const SVG_TAGS = new Set(["svg","g","line","rect","circle","ellipse","path","polygon","polyline","text","tspan","defs","marker","lineargradient","radialgradient","stop","pattern","use","clippath","foreignobject","title","desc"]);

class TextNode {
  constructor(t){ this.nodeType = 3; this.textContent = String(t); }
  get _serialized(){ return escapeText(this.textContent); }
}
function escapeText(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

class El {
  constructor(tag, ns){
    this.tagName = tag;
    this.namespaceURI = ns || null;
    this.attributes = {};
    this.children = [];
    this.style = {};
    this.dataset = {};
    this.parentNode = null;
    this._html = null;
    this._text = "";
    const set = new Set();
    this.classList = {
      add: (...c) => c.forEach(x => set.add(x)),
      remove: (...c) => c.forEach(x => set.delete(x)),
      toggle: (c) => (set.has(c) ? (set.delete(c), false) : (set.add(c), true)),
      contains: (c) => set.has(c)
    };
  }
  setAttribute(k, v){ this.attributes[k] = String(v); }
  getAttribute(k){ return k in this.attributes ? this.attributes[k] : null; }
  removeAttribute(k){ delete this.attributes[k]; }
  appendChild(c){ if (c == null) return c; c.parentNode = this; this.children.push(c); this._html = null; return c; }
  append(...cs){ cs.forEach(c => typeof c === "string" ? this.appendChild(new TextNode(c)) : this.appendChild(c)); }
  prepend(...cs){ cs.reverse().forEach(c => { const n = typeof c === "string" ? new TextNode(c) : c; n.parentNode = this; this.children.unshift(n); }); this._html = null; }
  removeChild(c){ const i = this.children.indexOf(c); if (i >= 0) this.children.splice(i, 1); return c; }
  remove(){ if (this.parentNode) this.parentNode.removeChild(this); }
  replaceChildren(...cs){ this.children = []; this._html = null; this.append(...cs); }
  get firstChild(){ return this.children[0] || null; }
  get lastChild(){ return this.children[this.children.length - 1] || null; }
  set innerHTML(v){ this._html = String(v); this.children = []; }
  get innerHTML(){ return this._html != null ? this._html : this.children.map(serialize).join(""); }
  set textContent(v){ this._text = String(v); this.children = []; this._html = null; }
  get textContent(){
    if (this._html != null) return this._text;
    if (this.children.length) return this.children.map(n => n.nodeType === 3 ? n.textContent : n.textContent).join("");
    return this._text;
  }
  _find(pred){
    for (const ch of this.children){
      if (ch.nodeType === 3) continue;
      if (pred(ch)) return ch;
      const r = ch._find(pred);
      if (r) return r;
    }
    return null;
  }
  _findAll(pred, acc = []){
    for (const ch of this.children){
      if (ch.nodeType === 3) continue;
      if (pred(ch)) acc.push(ch);
      ch._findAll(pred, acc);
    }
    return acc;
  }
  querySelector(sel){ const tag = sel.replace(/[#.].*$/, "").toLowerCase(); return this._find(n => (n.tagName || "").toLowerCase() === tag); }
  querySelectorAll(sel){ const tag = sel.replace(/[#.].*$/, "").toLowerCase(); return this._findAll(n => (n.tagName || "").toLowerCase() === tag); }
}

function serialize(node){
  if (node.nodeType === 3) return node._serialized;
  const attrs = Object.entries(node.attributes).map(([k,v]) => ` ${k}="${escapeText(v)}"`).join("");
  const inner = node._html != null ? node._html : node.children.map(serialize).join("");
  return `<${node.tagName}${attrs}>${inner}</${node.tagName}>`;
}

const documentShim = {
  createElementNS: (ns, name) => new El(name, ns),
  createElement: (name) => new El(name, null),
  createTextNode: (t) => new TextNode(t),
  body: new El("body")
};
const windowShim = {};
const navigatorShim = { userAgent: "node-harness" };
globalThis.window = windowShim;
globalThis.document = documentShim;

/* ---------- discovery ---------- */
function walk(dir, match, acc = []){
  for (const entry of readdirSync(dir)){
    const full = path.join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, match, acc);
    else if (match(full)) acc.push(full);
  }
  return acc;
}

const bankFiles = walk(path.join(ROOT, "question-banks"), f => f.endsWith("index.js"));
const engineFiles = walk(path.join(ROOT, "engines"), f => f.endsWith("-engine.js"));

/* ---------- load engines into shim ---------- */
const engineErrors = [];
for (const file of engineFiles){
  try {
    const code = readFileSync(file, "utf8");
    const fn = new Function("window", "document", "navigator", code);
    fn(windowShim, documentShim, navigatorShim);
  } catch (e){
    engineErrors.push(`Engine failed to load: ${path.relative(ROOT, file)} → ${e.message}`);
  }
}
const loadedEngineGlobals = Object.keys(windowShim).filter(k => /^MMT_.*ENGINE$/.test(k));

/* ---------- import schema + registry ---------- */
const { validateQuestion } = await import(pathToFileURL(path.join(ROOT, "schemas/question.schema.js")));
const { DIAGRAM_ENGINE_REGISTRY, renderMathText } = await import(pathToFileURL(path.join(ROOT, "renderers/question-renderer.js")));
const { makeMultipleChoiceQuestion } = await import(pathToFileURL(path.join(ROOT, "utils/multiple-choice.js")));

// Detect any leftover markup token that survived rendering (e.g. [[frac:..]]
// corrupted into [[f²r²a²c²:..]]). After renderMathText the output must contain
// no "[[" or "]]" sequences.
const tokenLeaks = [];
function scanForTokenLeak(bank, where, raw){
  if (raw == null) return;
  const rendered = renderMathText(String(raw));
  if (rendered.includes("[[") || rendered.includes("]]")){
    tokenLeaks.push(`${bank} · ${where}: "${String(raw).slice(0, 50)}" → "${rendered.slice(0, 50)}"`);
  }
}

/* ---------- run banks ---------- */
let totalQuestions = 0;
let totalInvalid = 0;
let mcBuilt = 0;
const bankReport = [];
const diagrams = []; // {bank, engine, config, type}
const referencedEngines = new Set();

for (const file of bankFiles){
  const rel = path.relative(ROOT, file);
  const mod = await import(pathToFileURL(file));
  const genKey = Object.keys(mod).find(k => /^generate.*Questions$/.test(k));
  const typesKey = Object.keys(mod).find(k => /^get.*QuestionTypes$/.test(k));
  if (!genKey){ bankReport.push({ rel, ok: false, note: "no generate*Questions export" }); continue; }

  const generate = mod[genKey];
  const types = typesKey ? (mod[typesKey]() || []) : [];
  const typeIds = types.map(t => (typeof t === "string" ? t : t.id)).filter(Boolean);

  let count = 0, invalid = 0, withDiagram = 0;
  const typeFailures = [];

  // per-type generation
  for (const id of typeIds){
    let produced;
    try {
      produced = generate({ count: 12, allowedTypes: [id] }) || [];
    } catch (e){
      typeFailures.push(`${id}: threw ${e.message}`);
      continue;
    }
    if (!produced.length){ typeFailures.push(`${id}: produced 0`); continue; }
    for (const q of produced){
      count++;
      try { validateQuestion(q); } catch (e){ invalid++; typeFailures.push(`${id}: invalid q → ${e.message}`); }

      // Token-leak scan on the source question's rendered text.
      scanForTokenLeak(rel, `${id}/prompt`, q.prompt);
      scanForTokenLeak(rel, `${id}/answer`, q.answer);
      (Array.isArray(q.choices) ? q.choices : []).forEach((c, i) => scanForTokenLeak(rel, `${id}/choice${i}`, c));
      (Array.isArray(q.working) ? q.working : []).forEach((w, i) => scanForTokenLeak(rel, `${id}/working${i}`, w));

      // Build a multiple-choice version and scan every generated choice. This
      // exercises the distractor builders (where the [[frac]] corruption lived).
      const mc = makeMultipleChoiceQuestion(q);
      if (mc){
        mcBuilt++;
        (mc.choices || []).forEach((c, i) => scanForTokenLeak(rel, `${id}/mc-choice${i}`, c));
        scanForTokenLeak(rel, `${id}/mc-prompt`, mc.prompt);
      }

      if (q.diagram){
        withDiagram++;
        referencedEngines.add(q.diagram.engine);
        if (diagrams.filter(d => d.engine === q.diagram.engine).length < 40){
          diagrams.push({ bank: rel, engine: q.diagram.engine, config: q.diagram.config || {}, type: q.type });
        }
      }

      // Subparts (multi-part questions): scan text + collect any diagrams.
      if (Array.isArray(q.subparts)){
        q.subparts.forEach((sp, spi) => {
          scanForTokenLeak(rel, `${id}/subpart${spi}/prompt`, sp.prompt);
          scanForTokenLeak(rel, `${id}/subpart${spi}/answer`, sp.answer);
          (Array.isArray(sp.working) ? sp.working : []).forEach((w, wi) => scanForTokenLeak(rel, `${id}/subpart${spi}/working${wi}`, w));
          (Array.isArray(sp.choices) ? sp.choices : []).forEach((c, ci) => scanForTokenLeak(rel, `${id}/subpart${spi}/choice${ci}`, c));
          if (sp.diagram){
            withDiagram++;
            referencedEngines.add(sp.diagram.engine);
            if (diagrams.filter(d => d.engine === sp.diagram.engine).length < 40){
              diagrams.push({ bank: rel, engine: sp.diagram.engine, config: sp.diagram.config || {}, type: `${q.type}/subpart` });
            }
          }
        });
      }
    }
  }

  // mixed generation (no allowedTypes)
  try {
    const mixed = generate({ count: 12 }) || [];
    for (const q of mixed){ count++; try { validateQuestion(q); } catch(e){ invalid++; } if (q.diagram){ withDiagram++; referencedEngines.add(q.diagram.engine);} }
  } catch (e){ typeFailures.push(`mixed: threw ${e.message}`); }

  totalQuestions += count; totalInvalid += invalid;
  bankReport.push({ rel, ok: invalid === 0 && typeFailures.length === 0, count, invalid, withDiagram, typeCount: typeIds.length, typeFailures });
}

/* ---------- render every collected diagram ---------- */
const diagramFailures = [];
let diagramsOk = 0;
for (const d of diagrams){
  const globalKey = DIAGRAM_ENGINE_REGISTRY[d.engine];
  const engine = globalKey ? windowShim[globalKey] : null;
  if (!engine || typeof engine.render !== "function"){
    diagramFailures.push(`${d.engine} (from ${d.bank}): engine not available`);
    continue;
  }
  const node = new El("div");
  try {
    engine.render(node, d.config);
  } catch (e){
    diagramFailures.push(`${d.engine} [${d.type}] (${d.bank}): render threw ${e.message}`);
    continue;
  }
  const html = serialize(node);
  if (html.includes("diagram-placeholder")){
    diagramFailures.push(`${d.engine} [${d.type}] (${d.bank}): produced placeholder (unknown diagramType "${d.config?.diagramType}")`);
  } else if (/<svg/i.test(html) || node._find(n => (n.tagName||"").toLowerCase() === "svg")){
    diagramsOk++;
  } else {
    diagramFailures.push(`${d.engine} [${d.type}] (${d.bank}): no <svg> output`);
  }
}

/* ---------- registry cross-check ---------- */
const registryIds = new Set(Object.keys(DIAGRAM_ENGINE_REGISTRY));
const referencedNotInRegistry = [...referencedEngines].filter(e => !registryIds.has(e));
const registryNotLoaded = [...registryIds].filter(id => !windowShim[DIAGRAM_ENGINE_REGISTRY[id]]);

/* ---------- report ---------- */
const line = "─".repeat(64);
console.log(line);
console.log("ENGINE LOADING");
console.log(line);
console.log(`Engine files: ${engineFiles.length} · globals registered: ${loadedEngineGlobals.length}`);
engineErrors.forEach(e => console.log("  ✗ " + e));
if (!engineErrors.length) console.log("  ✓ all engine files loaded without error");

console.log("\n" + line);
console.log("QUESTION BANKS");
console.log(line);
for (const b of bankReport){
  const flag = b.ok ? "✓" : "✗";
  console.log(`${flag} ${b.rel}`);
  console.log(`    questions: ${b.count ?? "-"} · invalid: ${b.invalid ?? "-"} · types: ${b.typeCount ?? "-"} · w/diagram: ${b.withDiagram ?? 0}`);
  if (b.typeFailures && b.typeFailures.length){
    b.typeFailures.slice(0, 8).forEach(f => console.log("      - " + f));
    if (b.typeFailures.length > 8) console.log(`      … +${b.typeFailures.length - 8} more`);
  }
  if (b.note) console.log("      note: " + b.note);
}

console.log("\n" + line);
console.log("DIAGRAM RENDERING (real bank configs)");
console.log(line);
console.log(`Rendered OK: ${diagramsOk} / ${diagrams.length}`);
diagramFailures.slice(0, 30).forEach(f => console.log("  ✗ " + f));
if (diagramFailures.length > 30) console.log(`  … +${diagramFailures.length - 30} more`);

console.log("\n" + line);
console.log("MARKUP TOKEN LEAK SCAN (rendered text + MC choices)");
console.log(line);
console.log(`MC questions built: ${mcBuilt} · token leaks: ${tokenLeaks.length}`);
tokenLeaks.slice(0, 30).forEach(t => console.log("  ✗ " + t));
if (tokenLeaks.length > 30) console.log(`  … +${tokenLeaks.length - 30} more`);
if (!tokenLeaks.length) console.log("  ✓ no raw [[...]] tokens leaked through rendering");

console.log("\n" + line);
console.log("REGISTRY CROSS-CHECK");
console.log(line);
console.log(`Referenced engines: ${[...referencedEngines].sort().join(", ") || "(none)"}`);
console.log(`Referenced but NOT in registry: ${referencedNotInRegistry.join(", ") || "(none)"}`);
console.log(`In registry but NOT loaded: ${registryNotLoaded.join(", ") || "(none)"}`);

console.log("\n" + line);
console.log("SUMMARY");
console.log(line);
const pass = engineErrors.length === 0 && totalInvalid === 0 && diagramFailures.length === 0 && referencedNotInRegistry.length === 0 && tokenLeaks.length === 0 && bankReport.every(b => b.ok);
console.log(`Total questions generated: ${totalQuestions}`);
console.log(`Invalid (schema): ${totalInvalid}`);
console.log(`Diagram render failures: ${diagramFailures.length}`);
console.log(`Markup token leaks: ${tokenLeaks.length}`);
console.log(`Bank issues: ${bankReport.filter(b => !b.ok).length}`);
console.log(pass ? "\n✅ ALL CHECKS PASSED" : "\n⚠️  ISSUES FOUND (see above)");
