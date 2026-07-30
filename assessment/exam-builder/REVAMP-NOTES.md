# Revamp notes

A phased revamp of the NSW Stage 4 & 5 maths generator. Phase 1 reframes the
tool around worksheets and lays the framework for deeper topic work in Phase 2.

## Phase 1 — done (the "shell")

**Worksheet-first defaults** (`app.js`)
- App now opens on the **Worksheet** template (was HSC exam).
- Default title is "Mathematics Worksheet"; time-allowed blank; instructions are
  worksheet-style ("Complete all questions", "Show all working…", "Ask your
  teacher…"). Exam/test templates automatically switch to formal exam wording.
- Multiple choice still defaults to 0.

**Generic, shareable branding**
- Hardcoded "Coffs Harbour High School" replaced with an editable `[School name]`
  placeholder across the app and all templates/solutions
  (`app.js`, `renderers/exam-renderer.js`, `renderers/worked-solution-renderer.js`,
  `utils/worked-solution-builder.js`). The HSC cover and worked-solution covers
  now use the document's school instead of a fixed brand.

**Visual template picker** (`app.js`, `styles/screen.css`)
- A friendly "Choose a template style" gallery on the dashboard (worksheet,
  textbook, revision, class test, HSC) with icons, taglines and "best for"
  notes. Clicking a card sets the style and re-renders any current document.

**Friendlier interface copy** (`app.js`, `index.html`)
- New heading: "Maths Worksheet & Assessment Builder", NSW Stage 4 & 5 eyebrow,
  and clearer page title.

**Question schema upgraded** (`schemas/question.schema.js`)
- `createQuestion` now keeps `diagramSpace`, `matching`, `mcEligible`, `hint`,
  `subparts` (previously silently dropped). This fixes latent behaviour — e.g.
  number-line tasks marked `mcEligible:false` are no longer turned into multiple
  choice, and `matching`/`diagramSpace` questions now reach the renderer — and
  gives Phase 2 room for richer questions and diagrams.

**Data-driven diagram engine registry** (`renderers/question-renderer.js`)
- The 16 hand-written `if` blocks are replaced by `DIAGRAM_ENGINE_REGISTRY`.
  Adding an engine is now one registry line + one `<script>` tag in `index.html`.
- Engine render errors are caught and shown gracefully instead of crashing.
- Diagrams support an optional `caption` and `notToScale` note.

## Verify

A dependency-free regression harness lives at `tools/verify.mjs`:

```
node tools/verify.mjs
```

It generates questions from every bank (validates against the schema), loads
every engine, renders every real diagram config to check it produces SVG, and
cross-checks the engine registry. Phase 1 result: 23 banks, 2,022 questions,
0 schema errors, 431/431 diagrams OK. Re-run after any Phase 2 edits.

## Phase 1.5 — fixes & UX (done)

**Fraction-token corruption fixed** (`utils/multiple-choice.js`, `renderers/question-renderer.js`)
- Root cause: the multiple-choice distractor builder treated the fraction token
  `[[frac:5:6]]` as algebra and squared its letters, producing `[[f²r²a²c²:5:6]]`,
  which then leaked to the page as raw text. Now distractor builders skip markup
  tokens, malformed token distractors are filtered out, and `renderMathText` has a
  safety net that recovers/strips any stray token. Verified: the pre-fix backup
  leaked 457 times; the fix leaks 0 across 770 MC questions. `tools/verify.mjs`
  now scans every topic's rendered text + MC choices for token leaks.

**Textbook template** (`renderers/*`, `templates/textbook-template/…`)
- Truly two-column now: diagram questions stay inside their column (they used to
  force full width and collapse the layout) and diagrams scale to fit.
- No answer space at all — answer spaces and draw-boxes are no longer generated
  for this style (students answer in their workbooks). Diagrams are kept.

**Guided pop-up wizard** (`app.js`, `styles/screen.css`)
- The four step-cards are replaced by a wizard. Choosing a template style starts
  a chained sequence of pop-ups — Style → Details → Topics → Generate — with a
  progress stepper and Back/Next. After generating, the dashboard shows a review
  panel (print, regenerate, solutions) plus "Change setup" to relaunch the wizard.
  Choosing a different style after generating restyles the document live.

## Phase 1.6 — textbook density (done)

**Root cause of the white space / single column**: the shared `.question-list`
rule in `hsc-template.css` sets `display:flex`, which silently disables CSS
multi-column — so the textbook's `columns:2` never took effect and the 11mm flex
`gap` between every question created the white space.

**Fix** (`templates/textbook-template/textbook-template.css`, full rewrite):
- Forces `display:block` on the textbook question list so the two columns
  actually render (in screen and print; print uses `column-fill:auto` for true
  textbook flow with the least white space).
- Collapsed spacing: ~10.3pt text, 2.4mm between questions, compact headings.
- Small diagrams: capped to ~50mm wide / 42mm tall and scaled via the SVG
  `viewBox` (all 16 engines use one), so every topic's diagrams shrink cleanly.
- No marks, no answer spaces, no draw-boxes.

This is template-level, so it applies to every topic at once. Open
`textbook-preview.html` in a browser to see/print a real generated example.

## Phase 1.7 — setup & answers (done)

- **Blank fields on load**: school, title, subtitle, time and instructions all
  start empty for the teacher to fill; empty instructions are omitted from the
  printed document.
- **Answers format** picker in the wizard (`HSC` / `Class test` / `Textbook` /
  `No answers`). New answer-key renderers: textbook = title + answers by number
  in dense columns; class-test = answers with marks; HSC = full worked solutions;
  none = nothing. (`renderers/worked-solution-renderer.js`)
- **Template → answers default**: choosing a style sets the answer format
  (HSC→HSC, Worksheet/Textbook→Textbook, Class test→Class test); still overridable.
- **Revision package** removed from the template choices.
- **Topic cards** in the wizard made much more compact (no longer "zoomed in").
- **Show answers** is now a proper on/off toggle that reveals the answer key in
  the preview, and the review panel buttons are grouped (primary: print + answers
  toggle; secondary: change setup / regenerate / print answers). Answer controls
  hide when the format is "No answers".

## Phase 2 — Stage 4 depth (done)

Big build-out of the five core Stage 4 topics, mapped to the CambridgeMATHS NSW
Year 7 chapters (1, 3, 4, 5, 6, 9, 10) and the NSW Stage 4 syllabus. Boundary
topics were deliberately excluded for now: the **Cartesian plane** (ch 6G) stays
in Linear Relationships, and **ratios** (ch 3K–L) stay in Ratios & Rates.

**New foundation — multi-part questions.** The schema's `subparts` field is now
rendered. Student copy (`renderers/question-renderer.js`) lays out (a)(b)(c) with
their own prompts, diagrams, choices and answer spaces; the teacher copy
(`renderers/worked-solution-renderer.js` + `utils/worked-solution-builder.js`)
shows per-part working and answers. `tools/verify.mjs` now generates, validates,
renders and token-scans subparts too.

**Per-topic expansion (engines + banks).** Each bank now spans the four variety
styles requested: visual/diagram models, multi-part structured questions,
real-world/worded problems, and reasoning (true/false-with-reason, spot-the-error
multiple choice).

- **Integers** (`engines/integers`, `question-banks/integers`): 7 → 17 question
  types. New engine diagrams: number-line *jumps* (models +/− as arcs) and a
  *thermometer*. New types: add/subtract on a number line, division w/ remainder,
  rounding, estimation, place value (table), substitution with negatives,
  thermometer temperature, true/false, spot-the-error, multi-part.
- **FDP** (`engines/fdp`, `question-banks/fdp`): 15 → 26 types. New engine
  diagrams: fraction circle, fraction of a set, fraction number line, fraction
  multiply area model, double number line, equivalent-fraction bars. New types
  include the matching visual items plus decimal place value, fraction of a
  quantity, percentage on a double number line, true/false, error-spot,
  multi-part percentage.
- **Algebra** (`engines/algebra`, `question-banks/algebraic-techniques`):
  12 → 21 types. New engine diagrams: algebra tiles, single-bracket expand area
  model, perimeter figure with algebraic sides, function machine. New types:
  notation/terms, like-terms with tiles, expand via area model, perimeter
  expression, function machines, worded expressions, error-spot, equivalent-
  expression true/false, multi-part.
- **Equations** (`engines/equations` — *new engine*, `question-banks/equations`):
  15 → 23 types. New `equation-engine` (balance scale, inequality number line,
  bar model), registered in `index.html` + the renderer registry. New types:
  form/solve from a balance, form an equation from a bar model, read an
  inequality from a number line, substitute into a formula (9G), solve by
  inspection (guess-and-check table), equivalent equations, error-spot,
  multi-part form/solve/check.
- **Length & Area** (`engines/length`, `engines/area` + banks): added metric
  length conversions, choose-units, read-a-ruler (new `ruler` diagram),
  error-spot, circle true/false, and multi-part perimeter (Length); grid-count
  area (new `grid-count` diagram), error-spot, area true/false and multi-part
  area (Area).

`utils/worked-solution-builder.js` keyword list extended so the new diagram
types also appear in teacher worked solutions.

**Verify.** `node tools/verify.mjs` → 17 engines, 4,344 questions generated,
0 schema errors, 0 diagram-render failures, 0 markup-token leaks, all banks OK.
A browser preview of every new diagram lives at `diagram-gallery.html` (open it
to see faithful, CSS-applied renders).

## Phase 3 — more Stage 4 topics + fixes (done)

**Textbook number fix.** In the two-column textbook template the question-number
column was a fixed `6mm` track, so 2–3 digit numbers (the unscoped
`.question-number::before{content:"Q"}` + the textbook `.` suffix make "Q146.")
overflowed into the prompt. The column is now `minmax(6mm, auto)` with the number
set `white-space:nowrap` (`templates/textbook-template/textbook-template.css`).

**Length & Area pushed further.** Length: wheel revolutions (distance = πd × revs),
multi-part circle problem. Area: find a missing dimension from the area, area of a
ring/annulus, real-world coverage (paint/turf) multi-part. (Length 21, Area 23 types.)

**Four more topics expanded** (mapped to the new chapter PDFs):

- **Pythagoras** (`engines/pythagoras`, bank): 7 → 11 types. The real-world
  questions now use the engine's rich diagrams (ladder, ramp, rectangle/screen
  diagonal, compass path, gate brace, guy wire) instead of blank draw-boxes. New
  engine diagrams: **3-D box** (space diagonal) and **isosceles** (height). New
  types: working with different units (5D), composite shapes (5E), Pythagoras in
  3-D (5G), and spot-the-error.
- **Ratios & Rates** (`engines/rates`, bank): 15 → 21 types. New engine diagrams:
  **ratio bar/tape model**, **scale drawing**, **double number line**. New types:
  divide-in-a-ratio with a bar model, scale drawings (6C), rates on a double
  number line, error-spot, true/false, multi-part recipe scaling.
- **Indices** (`engines/indices`, bank): 17 → 24 types. New **index-expansion**
  diagram (shows (x·x·x)×(x·x)=x⁵). New types target ch 5J algebraic index laws
  with coefficients: multiplying, dividing, power-of-a-power and mixed algebraic
  terms, plus an expansion-diagram item, error-spot and true/false.
- **Cartesian Plane & Linear Relationships** (`engines/linear`, bank): 15 → 23
  types. Now uses the engine's `linear-graph` + gradient-triangle capability. New
  types: name the quadrant (bridges the four-quadrant plane from integers ch 6),
  x- and y-intercepts (9F), read the gradient from a graph (9G), gradient from two
  points, gradient–intercept form y = mx + c (9H), a multi-part gradient/intercept/
  equation question, error-spot and true/false.

`utils/worked-solution-builder.js` keyword list extended (ratio, rate, scale,
index, gradient, intercept, quadrant, coordinate, isosceles, 3d) so the new
diagrams also appear in teacher worked solutions. `diagram-gallery.html` updated
with every new diagram.

**Verify.** `node tools/verify.mjs` → 17 engines, 4,704 questions generated,
0 schema errors, 0 diagram-render failures, 0 markup-token leaks, all banks OK.

A backup of the pre-revamp project was saved alongside this folder
(`../Exam-builder-backup-YYYYMMDD`).
