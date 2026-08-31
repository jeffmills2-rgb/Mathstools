# Mills Maths Tools — Project Brief

> Hand this file to Claude at the start of any chat to get up to speed without
> re-uploading everything. Keep it short, current, high-signal. If a fact here
> stops being true, fix it here first.
>
> **NEW (2026-08-17): SINGLE-REPO CONSOLIDATION.** The game SOURCE is no longer a
> separate folder — it now lives IN this repo at
> `game-platforms/mills-maths-adventure-source/` (the Vite project), with its
> BUILT/deployed copy in the sibling `game-platforms/mills-maths-adventure/`.
> There is now ONE folder for everything: the local clone at
> `~/Documents/GitHub/Mills Maths Tools/` (GitHub repo `jeffmills2-rgb/mathstools`,
> Netlify-deployed on push to `main`). **Deploy an Adventure change:** edit in
> `game-platforms/mills-maths-adventure-source/` → `npm run build` → copy `dist/.`
> into `../mills-maths-adventure/` → `git add -A && git commit && git push`.
> §2 "TWO folders", §3 deploy paths and §5's `mathstools-main 2` heading below
> describe the OLD layout — this block supersedes them.
>
> **NEW (2026-08-31, session — being pushed): COMPLETE THE SQUARE — WORKSHEET
> CREATOR.** `worksheet-creators/stage-5/algebra/complete-the-square.html`, the
> first Stage 5 worksheet creator. Same shell, same A4 machinery and the same
> trilingual EN/AR/FA convention as the Unit Conversion creator; cross-listed
> under the SAME three outcomes as the teaching tool (**MA5-ALG-P-01**,
> **MA5-EQU-P-01**, **MA5-EQU-P-02**), and the tool's "Tools ▾" menu row 1 is now
> a live link to it (only Student Quiz is still greyed out).
>
> * **FIVE SECTIONS, and the scaffold fades across them.** **A Label the area
>   model** is the screen from the teaching tool with the two edge labels and the
>   corner missing, and the identity underneath to finish — the picture and the
>   symbols on one card, which is the whole point of the pairing. **B Fill the
>   two boxes** is `x² + bx + ☐ = (x + ☐)²` and nothing else. **C Completed
>   square form** adds a constant to carry. **D Solve the equation** is the whole
>   method with ruled room to work. **E Use it** asks the three things completing
>   the square is actually FOR: the minimum point, the smallest value, and "show
>   this is always positive".
> * **THE LEVEL LADDER IS THE SIGN, NOT THE SIZE, IN SECTION A.** b is ALWAYS
>   even there — half of an odd number is a length nobody can draw on a schematic
>   — so Sweet and Mild are positive and **Medium and Spicy are the NEGATIVE
>   models**, hatched strips and a positive corner. That is where the thinking
>   is. Elsewhere the ladder is even b → either sign → odd b (fractions and
>   surds) → big numbers and a ≠ 1.
> * **EVERY ANSWER IS EXACT.** Nothing on the paper is a rounded decimal:
>   `fr()` keeps p as a half and q as a quarter, `simpSurd()` pulls every square
>   factor out, and roots print as `(−b ± k√m)/2a` reduced by
>   `gcd(gcd(|b|, k), |2a|)`. Checks substitute both roots of 5304 quadratics
>   back into the equation and assert no card ever contains a "." or a hyphen
>   used as a minus.
> * **The discriminant is CHOSEN, not hoped for.** `makeSolveQ` builds Sweet and
>   Mild from the ROOTS (integers, sum even so b stays even, neither root 0 —
>   that would be a factorising question); Medium picks p and a non-square m so
>   the answer is `−p ± √m`; Spicy either brings a ≠ 1 or an odd b. No generated
>   equation is ever unsolvable, and 2400 of them are verified per run.
> * **a is always a factor of b when a ≠ 1**, so taking it out leaves a half at
>   worst rather than an unreadable sixth. And **"show it is always positive" is
>   only ever asked when it IS** — c is built up from the square so q > 0.
> * **A RADICAL IS DRAWN, NOT TYPED.** The √ glyph's metrics differ wildly
>   between maths fonts — in Latin Modern it hangs below the baseline and the
>   vinculum floats off to the left. So the tick is a stretched inline `<svg>`
>   and the vinculum is the radicand's own `border-top`, with
>   `align-items:stretch` making the svg exactly as tall as what it covers.
>   Font-independent, and it survives inside a fraction numerator.
> * **`<sup>` inside a FLEX row is a flex item**, so `gap` pushed it sideways and
>   `vertical-align` stopped applying — `x²` printed as "x 2". Expressions are
>   `display:block` text; only the boxes, fractions and radicals are inline-flex.
> * **Same typography as the teaching tool:** `mathItalic()` + `detectMathAlpha()`
>   for Word's real italic alphabet with an ASCII fallback, weight 500 not 800,
>   and `mathify()` italicises the algebra inside every `<bdi>` in the prose (it
>   parks entities first so `&sup2;` survives, and uses no lookbehind, which old
>   Safari does not have). The "use it" placeholders are `{1}` and `{2}` — DIGITS
>   — precisely so the italiciser walks past them.
> * **Verified headlessly** (jsdom, 67 checks) and screenshotted through
>   Playwright at three densities, five levels, both scopes and all three
>   languages, with an audit for cards or sections running under the page footer.
>
> **NEW (2026-08-31, session — being pushed): COMPLETE THE SQUARE.** A Stage 5
> teaching tool at `interactive-tools/stage-5/algebra/complete-the-square/index.html`,
> built directly from Jeff's own whiteboard lesson (the photos in
> `Complete the square notes.pdf`). Self-contained inline CSS/JS, same shell and
> tokens as the Stage 4 tools. **The tile colours are the sticky notes from the
> board and must not change** — blue x², green x-terms, yellow the constant on
> the right, pink the piece that completes the square. A class that saw the
> board sees the same picture here.
>
> * **TWO modes, one segmented control.** *Build it with tiles* (numbers) and
>   *Prove the formula* (the same moves on ax² + bx + c = 0, ending on the
>   quadratic formula). Steps 5–8 of the lesson notes ARE the proof mode.
> * **Clicking the tile IS the move.** The glowing ring sits on the green
>   rectangle (click → it halves and the second half slides underneath), then on
>   the empty corner (click → the pink square drops in), then on the two
>   right-hand tiles (click → they merge). Next/Back still walk the whole
>   sequence, and every hotspot is a real `role="button"` with `tabindex` so it
>   works from the keyboard.
> * **ONE LAYOUT FOR BOTH SIGNS — the tiles are a TWO-WAY TABLE, not a cut-out.**
>   Teacher feedback 2026-08-31 replaced the curly braces and their bracketed
>   side lengths with plain **edge labels on the top and left**, the way an area
>   model is normally labelled: `x` and `h` sit against the column and the row
>   they measure (`EDGE_FS = 26`, `S.edges`), and every cell is simply the
>   product of its two edges — `x²`, `hx`, `hx`, `h²`. That one change made the
>   old cut-off-strips branch for negative b unnecessary and **it has been
>   deleted**: for x² − 2x = 143 the edge label just reads `−1`, the two `−x`
>   cells are hatched, and the corner reads a **positive** `1` because
>   (−1)(−1) = 1. The sign arithmetic is now visible in the table instead of
>   being narrated by a second story. Same four tile ids (`sq/gr/gb/pk`), same
>   2×2 grid, both signs.
> * **THE PROOF STARTS WITH THREE STEPS OF PURE ALGEBRA, BEFORE ANY TILE.**
>   Teacher feedback 2026-08-31. The tiles can only ever show a MONIC quadratic,
>   so the proof does the two moves that get there first, one arrow-press each:
>   step 1 is ax² + bx + c = 0 on its own, step 2 takes c across, step 3 divides
>   every term by a — and only on step 4 do the tiles appear. When a is divided
>   out the monic equation slides up to become the headline
>   (`proofHeadHTML(monic)` + a `.swap` class re-triggered with
>   `void head.offsetWidth`); taking c across deliberately does NOT touch the
>   headline, because the equation on the card is still the one being solved.
>   That is why the three step constants are **functions of the mode, not
>   numbers**: `TILE_FIRST()` (0 numbers / 3 proof), `DISPLAY_START()` (4 / 7)
>   and `STEPS()` (7 / 10, from `NUM_STEPS` and `PROOF_STEPS`). Anything that
>   indexes steps must CALL them — using `DISPLAY_START` as a constant is a real
>   bug a headless check now catches.
> * **THREE FINAL LINES IN THE PROOF, NOT FOUR.** Rooting both sides and then
>   simplifying √(4a²) to 2a read as the same line twice on screen (teacher
>   feedback 2026-08-31), so the perfect square comes out in the one move:
>   (x + b/2a)² = (b²−4ac)/4a² → x + b/2a = ±√(b²−4ac)/2a → the formula. A check
>   asserts the three lines are pairwise different and that the radical appears
>   on exactly two of them.
> * **FOUR TILE STEPS, THEN THE MODEL GETS OUT OF THE WAY.** The tile steps
>   build the picture; from `DISPLAY_START()` the tiles vanish and the algebra
>   takes the whole board at display size, one line at a time — 3 lines in
>   numbers mode, 4 in the proof. Back and forward across that boundary is the
>   point: the teacher can pull the picture back to show where a line came
>   from. **Both solutions are always shown**; there is no toggle. The history
>   note about negative roots is the optional **Explainer note** (Settings,
>   default OFF) — the area/non-negative argument is a teacher-talk moment,
>   not screen furniture.
> * **The right-hand side is a SQUARE, and the same size as the completed one.**
>   196 is the area of a square of side 14, so drawing it as a wide rectangle
>   quietly contradicted the next step (teacher feedback 2026-08-31). At step 4
>   the merged tile is a square of side `XS + hS`, top-aligned with the left —
>   "square = square" is what makes rooting BOTH sides obvious. It also keeps
>   the yellow tile's id (`yc`) so it GROWS into that square rather than
>   cross-fading, and the pink piece beside it is drawn h by h because it is
>   literally the corner that was just added.
> * **Crossing into the algebra is a MORPH, not a fade.** The pieces are already
>   on screen — the two TOP EDGE LABELS naming the side, and the number in the
>   square — so on the last tile step → first display step they FLY into their
>   places in `(x + 13)² = 196` while the brackets, the ² and the = fade in
>   around them, and they fly back on the way in reverse. Three things make the
>   handoff seamless and must stay true: `sideParts()` builds `x + h` out of the
>   very nodes the edges draw and spaces it with measured `SP()`s, so each edge
>   label lands exactly on its own slot inside the bracket (the negative case
>   drops the `+` and uses one wider spacer instead); `line1Spec(true)` returns
>   the line with those
>   two pieces wrapped in `GH()`, which MEASURES identically but draws nothing,
>   so the frame has holes exactly where they land; and each piece is painted
>   twice mid-flight, its tile colour fading into its equation colour, so
>   neither end pops. Headless checks assert the flight's destination equals
>   what `layoutLines` gives the static line, to the pixel.
> * **The maths line states the CURRENT EQUATION, not the move just made.**
>   Halving a tile does not change the equation, so step 2's line is identical
>   to step 1's in BOTH modes. An earlier build printed
>   `(b/a)x = (b/2a)x + (b/2a)x` at that step and it did not describe the
>   picture on screen; teacher feedback 2026-08-31. The cue carries the move,
>   the maths line carries the state.
> * **The randomiser picks the ROOTS, not the coefficients.** With roots p and
>   q: b = −(p+q), c = −pq, side = |p−q|/2, so the side is always exact and no
>   random equation ever needs a surd. Roots are given **opposite signs**, which
>   forces c > 0 (a positive yellow tile, the picture the lesson used) and
>   guarantees the second-solution step always has something to say. Tiers:
>   Starter (small even positive b) → Core (even, either sign) → Stretch (odd b,
>   so half of it is a half) → Challenge (big, either sign).
> * **Typed equations are freer than random ones:** any b and c, with a surd
>   side rendered exactly (`sideOf` pulls the 4 out — √t = √(4t)/2 — so odd b
>   still lands exactly), and **a negative completed area is reported as "no
>   real solutions" rather than drawn**. That guard is where the discriminant
>   lives; do not let it silently draw a square with negative area.
> * **The tiles are SCHEMATIC and must stay so.** x is unknown, so a true-to-
>   scale picture is impossible (in x² + 26x = 27 the answer is 1 and the
>   x-square would be a speck). `hSize()` still grows the h-side with √|h| so 13
>   looks bigger than 3, clamped to 58–122 against a fixed x-side of 168.
> * **The viewBox is computed per equation** (`computeVB`, over the TILE steps
>   only, never mid-tween) so the tiles fill the card and the algebra display is
>   then centred inside that same box — the card does not resize when the model
>   steps aside. It must also reserve the MEASURED extent of the EDGE labels:
>   once `b/2a` is a real fraction a fixed padding is not enough. The left-hand
>   labels hang 20px clear of the tiles (raised after a clash on the vertical
>   axis, teacher feedback 2026-08-31).
> * **The `=` column starts after whatever the left side actually reaches**, per
>   step. With a fixed column the wide b-by-x tile at step 1 sat on top of the
>   equals sign and the yellow tile (teacher feedback 2026-08-31); a headless
>   check now asserts the clearance at every tile step.
> * **There is a small SVG MATHS TYPESETTER in here** (`MT/MI/MR/MF/MS/MP/MB/SP/GH`,
>   `mSize`, `mDraw`) — real fraction rules, real radicals with a vinculum, and
>   brackets that grow. Slash notation was rejected on teacher feedback.
>   Every variable goes through `MI()`, and **it is set the way WORD SETS IT**:
>   Word's equation editor does not slant an upright face, it draws variables
>   from Cambria Math's own italic alphabet, which lives in Unicode's
>   **Mathematical Alphanumeric Symbols** block (x → U+1D465, and ℎ from U+210E
>   because the block has a hole there). `mathItalic()` does that mapping and
>   `detectMathAlpha()` decides ONCE at boot whether to use it — it measures a
>   run of those code points against a run of private-use ones, and equal widths
>   mean both came back as notdef boxes, so it falls back to ASCII plus a
>   synthesised `font-style:italic` and nothing ever tofus. `--mathFont` leads
>   with **Cambria Math** for exactly that reason, then the other real maths
>   faces, then serifs that at least own a genuine italic. Everything
>   mathematical also dropped from weight 800 to `--mathWeight` 500 — an
>   equation editor sets regular weight, and 800 was most of why it did not look
>   like one (teacher feedback 2026-08-31). Numbers and operators stay upright in
>   `MT()`, and `coefX(v)` writes the coefficient of x and **never prints a 1**,
>   so it reads `−x`, not `−1x`. Two
>   traps it exists to avoid: **SVG collapses leading and trailing whitespace**,
>   so every gap is an explicit measured `SP()` spacer and never a space inside
>   a text node (a text node's rendered and measured widths disagree, which put
>   the `=` on top of the following fraction rule); and **display lines are
>   stacked on their measured ascent and descent**, because a fixed line step
>   makes a fraction-inside-a-radical-inside-a-fraction land on the line above.
>   Widths come from `getComputedTextLength` with an `approxWidth` fallback, so
>   it still lays out under jsdom.
> * **Gotchas:** the proof's tiles carry a typeset NODE and no plain label, so
>   the label guard has to test `t.label != null || t.node` or every green and
>   pink tile prints blank; a hyphen is not a minus sign, so labels go through
>   `neat()`; and the hatch fill for negative cells is a `<pattern>` with a
>   `patternTransform`, which `getBBox` ignores — so a naive overflow audit has
>   to measure the cell, not the paint.
> * **Verified headlessly** (jsdom, 151 checks): 7560 equations re-derived
>   independently (both roots substituted back into x² + bx = c), 2000 random
>   equations against their tier rules, every surd squared back to its target,
>   the scene geometry (the corner exactly fills the L-shape's gap and is h by
>   h; the wide tile is exactly twice the halved one), the negative-b branch,
>   the answer never leaking before its step, the click targets actually
>   advancing, both modes rendering cleanly over 720 steps, no hyphen ever used
>   as a minus, the mode-dependent step constants, the three opening algebra
>   steps revealing one line each with no tiles on screen, the divide-by-a
>   headline matching the monic tiles, the three final proof lines being
>   pairwise different, every cell of the two-way table equal to the product of
>   its edge labels in both signs, and every variable set correctly in BOTH
>   typography paths — italic in the fallback, real math-alphanumeric glyphs and
>   nothing synthetically slanted when the alphabet is there. Screenshotted
>   through Playwright at every step of both modes with an out-of-viewBox audit.
> * **Wired in:** cross-listed in `resources/toolLinks.js` under **MA5-EQU-P-01**,
>   **MA5-EQU-P-02** and **MA5-ALG-P-01**, plus a homepage Interactive Tool card
>   (interactive count 26 → 27). Its **"Tools ▾" menu holds two greyed-out
>   rows** — Worksheet Creator and Student Quiz, neither built.
> * **Deliberately not built (v1):** non-monic a ≠ 1 in the TILE mode — the
>   PROOF mode now does the rearranging explicitly (steps 1–3 above), but the
>   numbers mode still opens monic; and same-sign roots / c < 0, which would put
>   a negative on the yellow tile.

> **NEW (2026-08-31, session — being pushed): UNIT CONVERSION — DOUBLE NUMBER
> LINE.** A new Stage 4 teaching tool at
> `interactive-tools/stage-4/measurement-space/unit-conversion-number-line/index.html`
> (self-contained inline CSS/JS, same shell/tokens as the Stage 4 fraction
> tools). Metric conversions are done by SCALING, not by a rule about zeros: the
> larger unit runs along the top line, the smaller along the bottom, and every
> value on the page is the same multiplier applied to the `1 : ratio` anchor.
>
> * **The anchor never leaves the screen.** Step 1 is `1 km / 1000 m` and
>   nothing else; every later position is drawn WITH it, because the whole
>   argument is “2 is twice 1, so it is twice 1000”. This is why the drawn
>   domain is `max(1.35, lam * 1.28)` rather than something that frames the
>   target nicely — do not “improve” it into a view that drops the anchor.
> * **Steps are anchor → (pose → reveal) × n**, endlessly, generated lazily and
>   cached in `state.rounds` so Back replays the same numbers instead of
>   re-rolling them. Each Next to a NEW position runs a two-phase tween in one
>   animation (old target fades, line geo-zooms, new target arrives); pose →
>   reveal does NOT zoom, so the eye stays on the position.
> * **The blank ALTERNATES top and bottom** (`r % 2`), so the class converts in
>   both directions. Big-to-small and small-to-big are deliberately told as the
>   SAME act — the × arc is identical on both lines either way — with the
>   × / ÷ rule carried only by the one line of maths underneath.
> * **The scaling arc arrives in two halves:** the GIVEN line's `× lam` arc is
>   there at the pose, and the other line's identical arc appears with the
>   answer. “The same jump on both lines” is the reveal. The vertical green
>   `× ratio` link is shown alone at the anchor step, then at the target on
>   each reveal — two routes to the same answer, a commutative square.
> * **The faint hop marks are NEVER labelled.** Labelling every anchor multiple
>   on both lines would hand over the answer; unlabelled they let a child count
>   hops. When the target falls between hops that ONE interval is subdivided,
>   and the subdivision is chosen (2/4/5/8/10/16/20) so the target lands ON a
>   mark — a target floating between sub-ticks reads as a drawing error. Skipped
>   when the marks would come closer than 18px.
> * **Three hard constraints on the multiplier `lam`,** all about the picture,
>   enforced in `lamPool` and asserted headlessly: `lam >= 0.25` (closer to zero
>   and the label collides with the 0), `lam <= 12` (further out and the anchor
>   is squashed against the left edge), and `|lam - 1| >= 0.1` (a target sitting
>   on the anchor hides the jump). **Big numbers come from a bigger unit gap
>   (km → cm gives 1 : 100 000), never from a bigger multiplier.**
> * **Tiers vary the VALUES, not the units** — Starter (whole 2–9) → Core (whole
>   to 12 + halves) → Stretch (one decimal place, values under 1) → Challenge
>   (awkward decimals — 0.375, 1.125, 11.25). A tier may carry at most
>   `log10(ratio)` decimal places (`+1` at Challenge, which is the only tier
>   allowed a decimal on the smaller-unit line).
> * **Gotcha — floating point:** `8.2 * 1000000` is `8199999.999999999`. Every
>   product goes through `mulK()` (scale to a whole number of thousandths
>   FIRST), and `round9()` rounds to 12 SIGNIFICANT figures, not 12 decimal
>   places — the bottom line reaches into the billions for mg and mL.
> * **Gotcha — the settings menu must NOT scroll.** The Difficulty submenu is
>   absolutely positioned outside the menu box, so any `overflow` but `visible`
>   on `.settingsMenu` clips it away entirely. Keep the menu short instead.
> * **Gotcha:** the stylesheet's `.nline text{font-family:var(--mathFont)}` beats
>   a `font-family` presentation ATTRIBUTE, so UI-font labels go through
>   `uiFont()` (inline `style.fontFamily`) — same trap as the area model.
> * **Units:** length (km/m/cm/mm), mass (t/kg/g/mg), capacity (ML/kL/L/mL). The
>   top list omits the smallest unit and the bottom list offers only the units
>   BELOW the chosen top one, so the ratio always exceeds one.
> * **Settings:** Measure / Top line / Bottom line, a Difficulty submenu, and
>   four Display switches — Estimate first (default OFF; a typed prediction is
>   locked in before Next unlocks, and is reported back at the reveal), Scaling
>   arrows, Unit link, Faint hop marks.
> * **Verified headlessly** (jsdom, 53 checks): 3080 multiplier/unit-pair
>   combinations for exactness, decimal-place limits, whole smaller-unit values
>   and label spacing; 480 pose/reveal pairs asserting the answer is NEVER on
>   the line before the reveal (compared as whole `<text>` labels — substring
>   matching false-positives, “375” lives inside “0.375”), that the empty box is
>   there at the pose and gone at the reveal, the alternating blank, Back not
>   re-rolling, the unit pickers, estimate mode, every Display toggle, Reset, and
>   that the on-screen cue stays under 60 characters. Screenshotted through
>   Playwright at every step including mid-zoom.
> * **The Display defaults are all OFF except the hop marks** (teacher feedback,
>   same session): the scaling arrows and the unit link are a REVEAL the teacher
>   chooses to add, not scaffolding the class starts with. Do not switch them
>   back on by default.
> * **Cross-listed in `resources/toolLinks.js` under FIVE outcomes** — Stage 3
>   **MA3-GM-02** (Length), **MA3-NSM-01** (Mass), **MA3-3DS-02** (Volume and
>   capacity), and Stage 4 **MA4-LEN-C-01** and **MA4-RAT-C-01** (the double
>   number line IS the ratio representation). Nothing is duplicated on disk;
>   all ten rows point at the same two URLs. Its **“Tools ▾” menu holds two
>   rows** — a live *Worksheet Creator* link and a greyed-out *Student Quiz*
>   (the harness asserts that shape). No Firebase, no registry entry, no
>   homepage card yet.

> **NEW (2026-08-31, session — being pushed): CONVERTING UNITS OF MEASUREMENT
> — WORKSHEET CREATOR.** `worksheet-creators/stage-4/measurement-space/unit-conversion.html`,
> the printable sibling of the tool above, built from Jeff's own Stage 3
> “Converting units of capacity” sheet (a full double number line with values
> missing down BOTH lines, then plain conversions). Same shell, spice ladder,
> trilingual convention, measured-then-greedy pagination and answer key as the
> Multiplying Fractions creator — read that one's notes first, this is the same
> machine.
>
> * **Five sections, scaffold fading left to right** (`line`, `jump`, `fluent`,
>   `compare`, `word`), each independently toggled with its OWN question count
>   and its OWN spice ladder. **A** fill a whole number line (the Stage 3
>   opener) → **B** one jump from the 1 : ratio anchor → **C** bare conversions
>   → **D** write `<` `=` `>` between two measurements → **E** short in-context
>   problems.
> * **TWO orthogonal controls, and they must stay orthogonal:** **Stage** picks
>   the UNIT PAIRS (Stage 3 = neighbouring units only, and never mg or t;
>   Stage 4 = any gap), **Level** picks the NUMBERS on them. So a Stage 3 class
>   can still meet spicy decimals on L and mL.
> * **Section D's whole point is the EQUAL pairs.** Roughly one comparison in
>   four is genuinely equal (2.5 km vs 2500 m), because a student reading only
>   the digits will always call it “<”. Do not “fix” the frequency down.
> * **TWO multiplier pools, and the difference matters.** `poolFor(level, k,
>   forPicture)`: the DRAWN pool obeys the teaching tool's constraints (0.25 ≤
>   lam ≤ 12, |lam−1| ≥ 0.1) so the picture works; the TEXT pool is wider,
>   which is where `8886 mL = 8.886 L` lives. Both cap decimal places at
>   `log10(ratio)` so the smaller unit always lands whole.
> * **The printed jump needs FOUR extra limits the board does not** — it gets a
>   quarter of the width. Ratio ≤ 10 000, lam ≤ 6, |lam−1| ≥ 0.3, and its own
>   620-unit viewBox (a 1000-unit one shrank the type to nothing). It also
>   **draws no zeros**: the closed left end says zero already, and on a
>   half-page card the two zero labels sat on top of the anchor.
> * **Fill-the-line ticks are BUCKETED, not just min-gapped.** Random picks with
>   a minimum gap still clump — five ticks landed at 1, 6, 7, 8, 9 and left half
>   the line empty. One tick per bucket, jittered inside the middle of it, is
>   irregular (the point) AND spread (legible). Grids must be fine enough to
>   jitter in: with E=1 at tenths there are only 10 slots and four ticks are
>   FORCED onto 2, 4, 6, 8, which put two identical lines on one page. Hence
>   `SPAN_DEC` prefers finer grids and the dedupe key for a line is its TICK
>   PATTERN ALONE, ignoring units.
> * **The given side ALTERNATES down every line** — that is what makes one
>   picture ask for both directions.
> * **Reasoning prompts are TAGGED by measure** (`fam`), because a
>   capacity-only sheet arguing about kilometres is a sheet nobody reads. Keep
>   at least two per family so a one-measure paper can vary them.
> * **The larger unit is on TOP**, matching the teaching tool. Jeff's original
>   sheet had mL on top; consistency with the board won.
> * **Nothing on the student half is coloured** — these get photocopied. The
>   only colour is the answer key's green.
> * **Gotchas:** every printed value is length-capped (≤ 9 characters) or a long
>   one wraps and makes a card taller than the row the packer measured;
>   comparisons use `baseOf()` (scale to whole thousandths FIRST) because
>   `12.06 * 1e9` carries fuzz that made two genuinely equal amounts compare
>   unequal; and the pagination heights are NaN-proofed so a zero-layout
>   environment cannot produce a nonsense budget.
> * **Verified headlessly** (jsdom, 71 checks): 2240 generated questions
>   re-derived independently (including that every printed `<` `=` `>` is the
>   true relation and never compares two values in the same unit), 5337
>   multipliers for exactness and whole smaller-unit values, 672 number lines
>   for tick spread/alternation/wholeness, rendered pages inspected for answer
>   leaks on the student half, section lettering, question numbering, the
>   trilingual rendering in all three languages, template completeness across
>   EN/AR/FA, every option toggle and Reset. Audited again under Playwright for
>   real layout: no page overflows its A4 box, no question is lost or
>   duplicated when a section splits, non-final pages run 95–97% full, and the
>   Arabic and Farsi papers were screenshotted.
> * **Wired into the homepage** (`index.html`): a full *Interactive Tool* card
>   and a *Worksheet Creator* mini card, so both appear under the nav's
>   Interactive Tools / Worksheet Creator tabs and in search. Their
>   `data-search` text spells the units out in FULL (millilitres, kilograms —
>   a teacher does not type "mL") and carries all five outcome codes and both
>   stage words, since a card can only hold one `data-stage`.
> * **Housekeeping done at the same time:** the hardcoded `.group-count` pills
>   on the homepage had drifted — worksheet-creator said 18 for 24 cards and
>   online-quizzes said 20 for 23, both wrong BEFORE this change. All three
>   (with interactive-tools 19 → 26) now match the cards. **They are hardcoded,
>   not computed** — the live counts are only on the chooser tiles
>   (`refreshCatCounts`), so a new card means editing the pill by hand.
> * **TODO:** the AR/FA strings want a fluent proofread (same as the other
>   creators). A **cubic-units section** (isometric cubes — how many small cubes
>   fill the big one, leading to 1 cm³ = 1 mL) was scoped from Jeff's original
>   sheet and deliberately left out of v1.

> **NEW (2026-08-26, session — being pushed): MULTIPLYING FRACTIONS — AREA
> MODEL.** A new Stage 4 teaching tool at
> `interactive-tools/stage-4/number/multiplying-fractions-area-model/index.html`
> (self-contained inline CSS/JS, same shell/tokens as the other Stage 4 fraction
> tools). ONE unit square is cut into columns by one fraction and into rows by
> the other; the answer is the rectangle where the two shadings cross.
>
> **Design rule for this tool: the SCREEN carries the picture, the TEACHER
> carries the words.** A first build put a "what the picture says" receipt panel
> beside the square and a paragraph of narration per step; both were cut on
> teacher feedback (2026-08-26) as too busy. What is left is the square, the two
> edge labels, a ≤48-character cue, and one line of maths. A headless check
> ENFORCES the cue length — do not let explanation creep back in.
>
> * **Five reveals, and only five** (ids `whole,across,down,name,answer`):
>   `whole` (the blank square under a "1 whole" bracket — the first click is
>   deliberately the empty unit) → `across` (the SECOND fraction, light blue —
>   cut into d columns, shade c) → `down` (the FIRST fraction, also light blue,
>   **darker where the two overlap**) → `name` (every cell in the whole square
>   carries its own unit fraction: dark inside the overlap, pale outside — this
>   is where the denominator comes from) → `answer`. Shaded once = light,
>   shaded twice = dark, so the picture explains itself without a legend.
> * **The answer step CLEARS the piece names** and shows the product alone
>   (a×c/b×d) on a white plate in the middle of the overlap. It does NOT
>   simplify. If the answer simplifies, a **Simplify** button appears in the nav
>   row (key `m`); pressing it re-groups the picture and the button becomes
>   **Undo**. Simplifying is a THING THAT HAPPENS TO THE PIECES, never a line of
>   text: the pn small pieces slide to new homes, the square is re-cut into sd
>   bigger parts with bold rules, the edge brackets come off (they no longer
>   measure those fractions), and the plate gains "= sn/sd". Leaving the step,
>   changing the problem or Start again all drop it.
> * **How the re-grouping is computed** (`blockSplit`): split sd into x·y with
>   x | acrD and y | dwnD, giving sd equal BLOCKS each holding exactly g whole
>   pieces. Such a split always exists because sd divides acrD·dwnD (distribute
>   each prime's exponent between the two). `targetCell(k)` places piece k in
>   block floor(k/g); `sourceCell(k)` is where it started inside the overlap;
>   the difference drives a `slideIn` transform. Do NOT replace this with "shade
>   the first sn columns" — the pieces do not tile a column unless sd | acrD.
> * **The number line is OPT-IN** (Settings › Show number line, default OFF, or
>   the `n` key) and it tells the SAME story one dimension down, in step with the
>   square: at `across` the line is cut into d and c of them shaded, with its
>   name above; at `down` that shaded length is broken into b parts and the
>   answer's worth darkened; at `name` the cut is carried across the whole line
>   (skipped past 30 pieces — it turns into a hairbrush); at `answer` the point
>   is dotted and named below the axis, and Simplify re-cuts it into sd parts
>   and renames the point. It never shows all three values at once. **When it is
>   on the SQUARE SHRINKS** — `layout()` swaps a whole geometry set (`G`) and the
>   viewBox (`VB_PLAIN` 610 tall / `VB_LINE` 700), which is the only reason the
>   two never collide. Nothing in the draw code may use a fixed square constant;
>   read `G.x/G.y/G.s/G.r/G.b/G.ly`.
> * **"Read it the other way"** (button, or `s`) transposes the picture — same
>   rectangle, factors swapped. Commutativity as a fact about a shape.
> * **Decimal layer on the SAME model** (Settings › Decimals and percentages).
>   The randomiser's **Tenths** tier forces both denominators to 10 and switches
>   the labels on, so 0.4 × 0.6 is a 10×10 grid of hundredths. `decStr()` gives
>   an EXACT terminating decimal where one exists and `≈` otherwise.
> * **Randomiser tiers:** Unit fractions → Simple (bottoms 2–6) → Any proper
>   (2–12) → Answer simplifies → Tenths.
> * **Proper fractions only** (bottoms 2–12) so the square is exactly one whole.
>   Mixed numbers would need a grid wider than 1 — a real extension, and the
>   bridge to expanding brackets.
> * **Predict mode was REMOVED** in the redesign (it hung off the old always-on
>   number line). If it comes back it belongs as an extra step BEFORE the blank
>   whole, shown only when the line is on.
> * **Gotcha:** the stylesheet's `.model text{font-family:var(--mathFont)}` beats
>   a `font-family` presentation ATTRIBUTE, so UI-font labels must set
>   `e.style.fontFamily` inline or every label comes out serif.
> * **Verified headlessly** (jsdom, ~336k checks): every a/b×c/d with bottoms
>   2–12 re-derived independently, including that the picture's two counts ARE
>   the numerator and denominator; the reveal is exactly five steps in that
>   order; step 1 is a bare square; the piece names appear at step 4 and are
>   GONE at step 5; **the answer never appears before step 5** and carries no
>   "=" until Simplify (asserted via `[data-role="answer"]`, not string
>   sniffing); for all 3145 simplifiable pairs the block split exists, blocks
>   hold exactly g pieces, and every piece lands on its own cell inside the
>   first sn blocks; the Simplify/Undo button states; swap = commutativity;
>   decimal/percentage naming with exact round-trips; the number-line group
>   (`[data-role="line"]`) only ever grows; the cue stays <= 48 characters.
>   Screenshotted through Playwright at every step, including a real
>   click-through of Simplify and Undo.
> * **The WORKSHEET CREATOR** is
>   `worksheet-creators/stage-4/number/multiplying-fractions.html`. Five lettered
>   sections, each handing the student a different amount of the model, which is
>   the whole design idea: `shade` (a square already cut both ways — shade it)
>   → `finish` (only the SECOND fraction is cut and shaded; the student makes
>   the other cuts) → `read` (a shaded model, write the multiplication —
>   backwards) → `nopart` (a BLANK square; the student cuts it up) → `nomodel`
>   (plain fluency, one line per question, no picture). A `count` section
>   (fill in b×d and a×c) was built and then **removed on teacher feedback
>   2026-08-26** — do not add it back without asking.
>   Four spice levels (sweet = unit fractions; mild never simplifies; medium
>   sometimes; spicy always), a simplest-form step, and a misconception to argue
>   with at the foot of every page. **Model sections cap b×d at 48** (`MODEL_CAP`)
>   so a square is still shadeable by hand; `nomodel` may go higher.
>   - **THREE model cards per row, always.** The square is the point, so it gets
>     the width; the size selector changes the SQUARE (52 / 46 / 38 mm), never
>     the column count. Only `nomodel` packs more across — and it drops a column
>     when the simplest-form box is on, because that adds a whole extra fraction
>     to a one-line card. Its cards also `flex-wrap`, so they can never spill out
>     of a column (they did, and got clipped, before that was added).
>   - **Trilingual EN / AR / FA** (`langSel`, persisted as `mmt-mulf-ws-lang`),
>     same convention as the other creators: chosen language on top, English
>     beneath, numerals and fractions Western and LTR inside `<bdi>`. Two
>     gotchas, both found in render: the simplest-form note must be joined to the
>     instruction **per language** before `TR()`, or the heading prints four
>     alternating lines; and the ✎ has to live inside each translation, or the
>     block-level target-language line pushes it onto a row of its own.
>   - **The answer key re-renders the models as `full`**, so the teacher marks
>     the picture, not just the numbers. Same square size, so pagination is
>     unaffected.
>   - **There are NO boxed numerator/denominator slots.** The student gets an
>     equals sign and a ruled line, nothing more. Boxed slots were built first
>     and **removed on teacher feedback 2026-08-26**: they make children ask
>     “what goes in this box?” instead of thinking about the question. Do not
>     reintroduce them. The Read section gets one full-width line and the
>     student writes the whole multiplication; on a key the line is replaced by
>     the answer in green. Nothing on the page hints at which answers simplify.
>   - **Question counts are PER SECTION** (`nShade`, `nFinish`, `nRead`,
>     `nNopart`, `nNomodel`), not one global total — a teacher wanting 4 shaded
>     models and 30 fluency questions can have exactly that. Each card's toggle
>     and its number box stay in step (typing 0 switches the section off;
>     switching a section on fills in a sensible default), and a live pill shows
>     the total. **Every section climbs its OWN spice ladder**, so a short
>     section still runs sweet → spicy inside itself.
>   - **The probe is measured TWICE, student and key, and the larger kept.**
>     Both halves share one pagination, and an answer written into a key card
>     can make it taller than the blank one it mirrors.
>   - **Packing is measured, then GREEDY.** An earlier version tried to even the
>     pages out by packing to the average section cost; with five small sections
>     that average is barely one section, so every page came out holding one
>     section and two-thirds white. Pages now run 95–99% full. The reasoning box
>     is `flex:1 0 auto` and STRETCHES into whatever the last page leaves (capped
>     at 96mm so a light page does not become a full page of ruled paper), so its
>     natural height — which the packer reserves — must stay modest: that is why
>     `.exSq` is 26mm and `.ruled` is a repeating-gradient at a fixed handwriting
>     pitch rather than a fixed number of `<span>` rules.
> * **Wired in:** both are filed under **MA4-FRC-C-01** in
>   `resources/toolLinks.js` (Teacher tool + Worksheet maker) with mini cards on
>   the homepage. The teaching tool's **"Tools ▾" menu holds exactly two rows** —
>   a live *Worksheet Creator* link and a greyed-out *Student Quiz* — and the
>   headless harness asserts that shape. The four other Stage 4 fraction tools
>   still link TO the teaching tool from their own menus. No student quiz yet;
>   see §8.

> **NEW (2026-08-20, session — being pushed): ADDING AND SUBTRACTING FRACTIONS
> family.** The teaching tool
> (`interactive-tools/stage-4/number/adding-fractions/index.html`, built the
> night before as "Adding Fractions") grew up and gained its two siblings:
>
> 1. **Teaching tool upgrades.** (a) The EQUIVALENT FRACTIONS now appear in a
>    band between the joined bar and the number line once the split step is
>    reached (e.g. 3/6 + 2/6 under their segments; subtraction writes −C/D
>    inside the pink hatch) — the line moved down to make room (viewBox 436).
>    (b) **Negative answers allowed**: the take-away may exceed the start; the
>    axis extends to −1 (`axisMin()`), sign-aware fraction rendering everywhere,
>    the swap/validation removed, narration adapts ("straight past zero").
>    (c) Below-line labels sit lower and the landing tick is shorter, so labels
>    like 17/20 no longer collide with ticks. (d) A "Tools ▾" menu links the two
>    siblings. Retitled **Adding and Subtracting Fractions**.
> 2. **Student quiz** `online-quizzes/stage-4/number/adding-subtracting-fractions.html`
>    (registry id `adding-subtracting-fractions-quiz`). Sweet/Mild/Medium/Spicy,
>    15 questions; the ladder raises the RENAMING demand while the model stays —
>    Sweet same denominators, Mild related (one bar re-splits), Medium unrelated
>    (both re-split, improper sums, simplifying), **Spicy = Medium with NO model
>    + take-aways that pass zero** (negative answers). Estimate-first (drag the
>    marker, never marked), then the bars, then an optional reveal (tagged
>    `usedRenameReveal`) on **every modelled level — Sweet ("Show the pieces"),
>    Mild and Medium ("Show the renaming")**; what disappears at Spicy and Extra
>    hot is the model itself. The reveal is a **back/forward arrow pair** (forward
>    disabled once revealed, back greyed until then) and the pieces ANIMATE
>    falling into place and lifting back out (slideIn/slideOut on the strip
>    segments, faded ticks/labels) instead of snapping; the same smooth BACK now
>    exists on the teaching tool (`state.animExit` + exit classes slideOut /
>    tickOut / fadeOut / popOut — one-step Back plays the current step's exit,
>    then lands). A **fifth level, Extra hot** (`extrahot`): coprime denominator
>    pairs, both <= 10, product >= 18, and BOTH fractions in simplest form
>    (2/6 would quietly reduce to 1/3) — e.g. 3/8 + 4/7, where the new unit is
>    the denominators multiplied; no model, improper sums + negative take-aways.
>    The MathLive box sits on the equation's own line, vertically CENTRED with
>    it (padding only — a min-height taller than the content top-aligns the
>    fraction), and the fraction button + its translated "Click to enter a
>    fraction" hint sit in their own centred row ABOVE the whole question card
>    (`#fracBarRow`, revealed with the field, hidden in the estimate phase and
>    when MathLive fails to load); landing labels drop a row near endpoint
>    labels ("1 whole"). **Answers are entered in a MathLive fraction editor** —
>    the Adventure's MathAnswerInput pattern trimmed to ONE fraction-template
>    button (`\frac{#?}{#?}`, so a typed whole number stays outside → mixed
>    numbers work), menu/keyboard icons hidden, Enter captured; loaded from
>    jsDelivr (`mathlive@0.101.2`), and if the CDN is unreachable the plain
>    typed input silently remains. **Never set `display`/flex on `<math-field>`**
>    — it breaks MathLive's own hit-testing and the first keystroke after a click
>    is swallowed (cost a debugging round); size it with min-height + padding.
>    Marking reads the LATEX (never ascii-math,
>    which flattens "1 3/20" to "13/20") via `latexToEntry()`, handling
>    MathLive's brace-less `\frac44` form. Matched as EXACT rationals,
>    any equivalent form (10/12 = 5/6 = mixed); one attempt per question. Carries
>    the byte-identical v2 login block (now **eleven** quizzes — §8 updated).
>    **Trilingual EN/AR/FA** (same convention as the Fractions Number Line Quiz:
>    selected language on top, English beneath; maths/numerals stay Western/LTR;
>    lang toggle in the top row, persisted as `mmt-asf-lang`; non-English
>    attempts tagged `lang:ar`/`lang:fa` in `types[]`).
> 3. **Worksheet creator** `worksheet-creators/stage-4/number/adding-subtracting-fractions.html`.
>    Level ladder (same/related/unrelated/mixed spice), add/sub/both, past-1-whole
>    and negative toggles, answer key. "Show the model" prints the two bars in
>    their own units above a number line already cut into the COMMON unit with
>    the start marked (the answer is NOT marked — counting on/back is the work;
>    the count-on arrow hint was removed on teacher feedback); an **Extra hot
>    tier** (value `coprime`) mirrors the quiz's fifth level — coprime pairs
>    <= 10 (model pool capped at product 20 for readable ticks), its own dark-red
>    badge, and Mixed spice now deals a ladder of all FOUR tiers;
>    2×4 per A4 with the model, 3×6 without. (A "Fade the model" option that
>    scaffolded only the first half was removed on teacher feedback 2026-08-20 —
>    unnecessary; run two papers instead.) The control panel is laid out in three
>    full-width BANDS — "The paper" (level / operation / count / language in an
>    auto-fit grid), "Options" (the toggles in one wrapping row) and the action
>    buttons — so nothing is orphaned when the window narrows.
>    A **Worksheet language** select (EN / AR / FA,
>    persisted as `mmt-asf-ws-lang`) prints every card instruction, the Answer
>    label and Name/Date bilingually — Arabic or Farsi on top, English beneath —
>    re-rendering the SAME questions on change.
>
> All three are filed under **MA4-FRC-C-01** in `resources/toolLinks.js`, mini
> cards added on the homepage, quiz registered in `mmtToolRegistry.js`
> (masteryTopic `adding-subtracting-fractions`).
>
> **NEW (2026-08-18, session — DEPLOYED, commits `34cbb73` / `9d962b3` /
> `5c9029e`): FRACTION TO PERCENTAGE family, a shared quiz SIGN-IN BANNER, and
> per-kind RESOURCE ICONS.**
>
> 1. **Fraction to Percentage.** The teaching tool
>    (`interactive-tools/stage-4/number/fraction-to-percentage/`, built the night
>    before) now has two siblings —
>    `worksheet-creators/stage-4/number/fraction-to-percentage.html` and
>    `online-quizzes/stage-4/number/fraction-to-percentage.html`. The tool's
>    "Tools ▾" menu holds ONLY those two. All three are filed under
>    **MA4-FRC-C-01** in `resources/toolLinks.js`, so they appear on Resources by
>    Stage → Stage 4 → Fractions, Decimals and Percentages.
>    - *Worksheet:* "Show number line" ON prints the tool's FIRST REVEAL — whole
>      partitioned, fraction marked, shaded distance, blank under the tick — 2×4
>      per A4; OFF is the plain conversion card, 3×6. The tier is re-checked
>      AFTER reducing, so a "Friendly" question can never arrive recurring.
>      Denominators cap at 20 when the model shows, or ticks become unreadable.
>    - *Quiz:* 15 questions, Sweet / Mild / Medium / Spicy (**Spicy = Medium's
>      bank with NO model**). Each model question runs estimate → a HELD beat to
>      read the estimate → placement → one part named (100 ÷ d) → the student
>      counts on. **No unit fractions in any bank** — with the first part
>      revealed, 1/d would BE the answer. Recurring answers accept `66 2/3`,
>      `200/3` or `66.7` and reject `66.6`. One attempt per question, so the
>      score is a true /15; the estimate is never marked.
>
> 2. **Shared quiz login block v2.** The **ten** quizzes carrying
>    `mmtLoginOverlay` now hold a BYTE-IDENTICAL copy. To change it: edit the
>    copy in `online-quizzes/stage-4/number/fraction-to-percentage.html`, then
>    re-apply to the other nine by replacing the span from
>    `<!-- ===== MMT student-code login` to the `</script>` after
>    `window.MMTMode=`. New in v2:
>    - a status chip painted into **`#mmtAuthSlot`** (added beside each quiz's
>      Reset button) — "Signed in as NAME", or "Guest mode" + a Sign in button
>      that reopens the overlay. It sits in the page's own flow so it stays
>      BEHIND the quiz's modals instead of bleeding over them;
>    - `window.MMTAuth { mode, student, name, signedIn, signIn, certTail, shareLine }`;
>    - certificate wording that follows the sign-in state — **Google Classroom is
>      mentioned only when nothing is being saved**. The block rewrites every
>      `.certSub`; a quiz's OWN certificate / clipboard / canvas text calls
>      `MMTAuth.certTail()` or `.shareLine()`.
>    **Firestore rules did NOT need changing** — the live `achievements` block
>    already allows create for the signed-in student, and these write that same
>    shape. Do not re-investigate this.
>
> 3. **Resources by Stage icons.** Uploaded files badge with a TEXT label, so a
>    GLYPH badge now means "this opens a page" and the drawing says which kind:
>    teacher tool (screen + cursor), student quiz (clipboard + tick), worksheet
>    maker (ruled sheet), lesson plan (open book), flip/flash cards, game (die).
>    Edit `KIND_VARIANT` / `KIND_ICON` in `resources/index.html`; a `kind` with
>    no entry falls back to the old globe.
>
> **Bridge gotcha (cost an hour):** a Claude session that dies mid-write leaves
> `.git/index.lock` / `HEAD.lock` behind, and the desktop-bridge shell can only
> `mv`, never delete — so git then refuses every commit with "Another git process
> seems to be running". Check `find .git -name '*.lock'` and clear them in
> Terminal. The bridge also has NO network, so `git push` must be run by hand.
>
> **NEW (2026-08-17, session — being pushed): STAGE 3 MULTIPLICATIVE RELATIONS
> + GEOMETRIC MEASURE.** Two more Stage 3 banks, taking the stage to **6 of 8**
> topics. **Geometric Measure** (18 types) reuses the linear, angle and length
> engines. **Multiplicative Relations** (21 types) needed the one genuinely new
> engine, `engines/array-area/array-area-engine.js`, which draws four things:
> an array, an area model (build it, read it), a factor-rectangle set, and a
> hundred chart with multiples shaded. Twelve of its twenty-one types carry a
> figure, because "use partitioning and place value to multiply" is a claim
> about a picture. Division reuses the SAME rectangle with the quotient
> missing, so the inverse is visible rather than asserted.
> Every Stage 3 bank now has its own harness in `assessment/exam-builder/tools/`
> (`node tools/stage3-<topic>.mjs`) that re-derives every answer independently
> of the bank — the new `stage3-multiplicative.mjs` caught a live defect, where
> `a − b × c` could evaluate negative (Stage 3 has no integers yet); the bank
> now builds the product first and places the start number above it.
>
> **NEW (2026-08-04, session — being pushed): REVISION GENERATOR overhaul +
> Stage 3.** Big session on `assessment/exam-builder/` (the "Revision Generator"
> on the homepage). Three strands:
>
> 1. **Print/layout rules, all universal across the five templates.** Stacked
>    fractions no longer spill into the line above (`--frac-scale` /
>    `--frac-leading` in `hsc-template.css`); diagrams are sized at a CONSTANT
>    SCALE from their own ink so a label is the same physical size in every
>    question (`fitDiagramSvg()`); tables, diagrams and answer rules all align
>    with the prompt text via `--content-indent`; topic bands can never be
>    stranded from their questions; an expression that ends a prompt is set on
>    its own line and is never split; thousands separators are non-breaking.
>    `styles/print.css` now suppresses the "A4 preview" watermark.
> 2. **The worksheet template was rebuilt.** Answer space is a KIND, not a
>    t-shirt size — see `utils/answer-space-rules.js` `resolveAnswerSpace()`:
>    a short answer gets a small inline box, working gets ruled lines sized by
>    marks, and a question answered on its diagram gets nothing. Same paper went
>    from 61 pages to 20. Two columns, like the textbook template.
> 3. **STAGE 3 (Years 5–6) added.** Stages are now DATA (`STAGES` registry in
>    `app.js`) rather than hardcoded pairs, so a new stage is one entry. **Five**
>    banks built so far — Represents Numbers, Additive Relations, Fractions,
>    2D Space and Area, and **Geometric Measure** (18 types: coordinate plane in
>    one and four quadrants, metric length, perimeter, protractor reading, and
>    angles on a straight line / at a point — reusing the linear, angle and
>    length engines, no new engine needed). See
>    `assessment/exam-builder/docs/stage-3-syllabus-reference.md`, which is the
>    source of truth for scope, outcome mapping and the calibration conventions
>    every further Stage 3 bank should follow.
>
> New `assessment/exam-builder/tools/` harnesses (plain `node`, no deps except
> `picker.mjs` which needs jsdom and skips without it), plus `layout-check.html`
> which renders real questions in the browser and measures the boxes.
>
> Last reviewed: 2026-08-26. **All LIVE** — the Adventure now has **14 Stage 4
> topics** (deployed 2026-07-08, commit `aad2142`): the Phase 3A–3G expansion
> (Ratios & Rates, Length, Equations, Probability, Indices, Linear) PLUS Angle
> Relationships (3G), Properties of Geometrical Figures (3H) and Data
> Classification & Visualisation (3I). Also live: schoolyard NPCs now default to
> a RANDOM Stage 4 topic (a teacher task still overrides). `adventureManifest.js`
> lists all 14 topics and matches the live game.
>
> **NEW (2026-07-22, session — deployed): portal UX + teacher-visibility + game
> compass.** (1) **Login readiness on both portals** (`portal/teacher/` +
> `portal/student/`): the Sign in button starts disabled ("Connecting…" + spinner)
> until the page scripts/Firebase SDK load, a progress bar runs through BOTH
> sign-in AND the dashboard data load (no more mid-load flip back to a clickable
> "Sign in"), and a 12s safety net prevents a lockout. (2) **Portal→game sign-in:**
> the student dashboard "Play" link now carries `?code=` so the game auto-signs-in
> (game side rebuilt). (3) **Results & Analytics Topic column** shows the actual
> challenge/mission name for Adventure rows (e.g. "The Round-Up") instead of a
> generic label — display-side, so existing rows are fixed too. (4) **Teacher
> dashboard Refresh button** reloads results/completions and updates an open
> Results / Manage Tasks view in place. (5) **Farm progress now reaches the
> teacher:** the game uploads any farm set finished while signed in, and back-fills
> locally-earned farm trophies on sign-in (see the game repo CLAUDE.md). (6)
> **Task navigation compass** in the Adventure — a top-of-screen arrow to the next
> teacher task (see the game repo CLAUDE.md). Deployed via commits `8fae9af` /
> `9df6990` / `bae6a94`.

> **NEW (being pushed 2026-07-08):** a **Fraction Bar + Number Line** teacher
> interactive tool (`interactive-tools/stage-4/number/fraction-bar-number-line/`)
> with a "Tools ▾" menu, plus two student pages in `online-quizzes/stage-4/number/`:
> the **Fraction Thinking Explorer** (open shuffler) and the **Fractions Number
> Line Quiz** (guided 8-stage progression; file kept as `fraction-thinking-quest.html`).
> The Quiz is **trilingual (EN/AR/FA)** and now **randomises every stage's values**
> each attempt (same learning intention). Both student pages are registered in
> `mmtToolRegistry.js`. See §5.
> Full details: the game repo's CLAUDE.md (per-phase sections + "Schoolyard
> default topics").
> **The Adventure's "Fraction Farm"** (deployed 2026-07-18, commit `0ec63a1`)
> — a THIRD region (large late-afternoon farming world, portal BEHIND the
> island spawn) with in-world fraction challenges, each 15 rounds +
> local-only bests + a trophy stand (trophy.glb): **Fence Challenge**
> (fraction of a length on a locked side-on number-line view, banded points
> + BULLSEYE), **The Round-Up** (f/d/% OF AN AMOUNT — herd cows into a pen;
> herd regroups into equal groups), **Order the Parts** (order f/d/% — swap
> carrots, confetti/reveal), **Crate Packing** (HCF as biggest common group
> size — animated fruit splitting, spill = remainder; host Peck the Bird).
> Also live: portal renames ("Fraction Farm" / "Retrieval Practice
> Playground"), rigged main1.glb player (Space = jump, Shift = run),
> name-only welcome screen (character creator retired).
> **NOT yet deployed (built 2026-07-18, game source): The Milk Splitter** —
> terminating vs recurring decimals: the machine performs the division live
> (digits grow, tank drains; recurring = endless drip loop 🔁), predict
> STOPS/REPEATS then pick the dot-notation jug; host Milkman Pearce + a
> Meshy milk-truck.glb. Needs `npm run build` → copy `dist/.` → push.
> Game-source checks 391 → 425, all passing. Full details: the game repo's
> CLAUDE.md (F1–F8, W7).
>
> **NEW (built 2026-07-22, TEACHER PLATFORM v2 — being deployed):** the Teacher
> Platform (`portal/teacher/index.html`) was redesigned **button-first** (a home
> screen of tiles; every action opens a pop-up window). New capabilities, all
> keeping the secure server-authed model:
> - **Add Student** now supports **bulk** (paste one "First Surname" per line).
> - **Saved classes** — new callables `createClass` / `setClassActive` + a
>   `classes` collection (a teacher reads only their own). Classes now persist
>   (even empty) instead of being derived from students.
> - **Set Dashboard Task** — assign online quizzes to a class with a due date via
>   new callables `createDashboardTask` / `updateDashboardTask` /
>   `setDashboardTaskActive` + a `dashboardAssignments` collection. The **student
>   portal** shows a **task pop-up** on login (+ a "Tasks set by your teacher"
>   section). A task can be a **whole quiz** OR a **custom sub-topic subset**: the
>   portal opens a quiz's existing "Create student quiz link" builder in a pop-up
>   and reads the generated link back (same-origin), storing it site-relative.
>   Only the 4 quizzes with a builder support subsets (integers, angles, fdp,
>   algebraic-techniques).
> - **Set Adventure Task** — reworked into locations (Number Island / Retrieval
>   Practice Playground / **Fraction Farm**). Farm challenges are now assignable
>   (see below). Number Island wording shows Pip = Addition & Subtraction facts,
>   Alby = Multiplication facts, Fern = Division facts (portal display only).
> - **Fraction Farm Adventure tasks** — a farm task = an `adventureAssignments`
>   doc with `location:"farm"` + `challengeId` (the game reads it, shows an
>   in-world objective, and writes a cloud completion tagged with the task id).
>   Needs the game built + pushed. Full game side: the game repo's CLAUDE.md
>   (DONE 2026-07-22 — Fraction Farm teacher tasks).
> - **Rules:** the live rules now include `adventureAssignments`,
>   `dashboardAssignments` AND `classes` blocks (an earlier go-live copy was
>   missing `adventureAssignments` — restored). `firestore.golive.claims.rules`
>   in the website repo matches the live rules.

---

## 1. What this is
A hub-and-spoke website of interactive maths tools for NSW Years 7–10, built by a
NSW maths teacher. It now also has a **secure Student/Teacher Platform** and
**Mills Maths Adventure** (a 3D low-poly maths game), all live.

- **Live site:** https://www.millsmathstools.au (Netlify + custom domain)
- **GitHub repo (the website):** https://github.com/jeffmills2-rgb/mathstools (branch `main`)
- **Firebase project:** `mills-maths-tools` (Blaze plan)

## 2. TWO folders / two projects (important)
1. **`mathstools-main 2/` = THE WEBSITE** (what deploys). Plain static HTML +
   the portal + the *built* Adventure. It is a **git clone of the repo above**;
   Netlify auto-deploys `main` on every push (`netlify.toml` = `publish="."`,
   no build step).
2. **`Mills Maths Adventure/` = THE GAME SOURCE** (Vite + React + R3F + Zustand +
   MathLive). Not uploadable as-is — must be **built**. Also holds the **Cloud
   Functions** (`functions/`).

## 3. Deploy workflows
- **Website change** (HTML tool, quiz, homepage, portal): edit in
  `mathstools-main 2` → `git add -A && git commit -m "…" && git push`. Live in ~1 min.
- **Adventure change:** edit in `Mills Maths Adventure` → `npm run build` → copy
  `dist/.` into `mathstools-main 2/game-platforms/mills-maths-adventure/` → push
  the website. (`vite.config.js` has `base:"./"` so it works in that subfolder.)
- **Cloud Functions change:** edit `Mills Maths Adventure/functions/index.js` →
  `firebase deploy --only functions --project mills-maths-tools`.
- **Firestore rules:** deploy MANUALLY via Firebase Console → Firestore → Rules
  (never from code). Current live rules = `firestore.golive.claims.rules` (kept in
  the website repo for reference).
- Rollback safety branch on GitHub: `backup/pre-portal-…`.

## 4. Security model (the core of the rebuild)
- **No anonymous auth, no client identity reads.** Everyone signs in via the
  **secure code exchange**: Cloud Functions `exchangeStudentCode` /
  `exchangeTeacherCode` validate a typed code server-side and mint a Firebase
  custom token with claims `{ role, studentCode | teacherCode, … }`; clients
  `signInWithCustomToken`.
- **`createStudentForTeacher`** (callable, teacher-authed) creates students
  server-side, stamped with the caller's own `teacherCode`.
- **`setStudentAvatar`** (callable, student-authed) saves the Adventure player's
  customisable avatar to the caller's OWN `students/{code}` doc (code from the
  verified claim). Admin-SDK write (no rules change); avatar is returned by
  `exchangeStudentCode` and applied on sign-in so the character follows the
  student across devices. Cosmetic only — no answers/PII stored.
- **Teacher-set Adventure tasks** (callables `createAdventureTask`,
  `updateAdventureTask`, `setAdventureTaskActive`, all teacher-authed and stamped
  with the caller's own `teacherCode`) write the `adventureAssignments` collection;
  rules let a teacher manage their class's tasks and a student read active tasks
  matching their `teacherCode`+`className` claims. See §6 + the game repo's
  `docs/teacher-adventure-tasks-plan.md`. **Farm tasks (2026-07-22):** the same
  callables also accept a farm shape (`location:"farm"` + `challengeId`, no NPC/
  topic) — the game writes the completion (game repo CLAUDE.md).
- **Saved classes (2026-07-22):** callables `createClass` (idempotent, doc id
  `<TEACHERCODE>__<NAME>`) / `setClassActive`, both teacher-authed and stamped
  with the caller's `teacherCode`, write a `classes` collection. Rules: a teacher
  reads only their own; client writes denied.
- **Dashboard tasks (2026-07-22):** callables `createDashboardTask` (one doc per
  quiz), `updateDashboardTask`, `setDashboardTaskActive`, teacher-authed, write a
  `dashboardAssignments` collection (fields `toolId`, `title`, `launchUrl`,
  `className`, `dueAt`, `active`). Rules mirror `adventureAssignments` (teacher
  reads own; student reads active tasks matching teacherCode+className). The
  `launchUrl` can carry a quiz's `?assignment=1&level=…&types=…` subset params.
- **Live Firestore rules are strict + claim-based:** a student reads only their
  own data; a teacher reads only their own class; results are create-only and
  scoped to the signed-in student; no client identity writes; no result
  edits/deletes; default deny. Identity is managed server-side only.
- **Never store typed student answers in Firebase.** The web API key is public by
  design. The **arcade/flip-card games** use a **different** Firebase project
  (`mmt-firebase-games`) and are out of scope for these rules — BUT **Mills Maths
  Adventure is on `mills-maths-tools`** (it joined the secure ecosystem), so the
  claim-based rules above DO apply to it.
- Functions region: **us-central1**. Test codes: student `8F6AYH`, teacher `MILLS0423`.

## 5. Website structure (`mathstools-main 2`)
```
index.html                         hub / homepage (nav links to portal + Adventure)
portal/                            THE PLATFORM
  student/index.html               Student Platform (results/progress + teacher-set task pop-up)
  teacher/index.html               Teacher Platform — BUTTON-FIRST (v2, 2026-07-22): a tile home
                                   screen → pop-ups for Add Student (single+bulk), Add Class,
                                   Set Dashboard Task (quizzes + sub-topic builder), Set Adventure
                                   Task (island/playground/farm), Students, Results, Manage Tasks
  admin/index.html                 disabled page (admin via Firebase Console)
  shared/ firebaseConfig.js · codeExchangeClient.js · quizClient.js ·
          mmtToolRegistry.js · resultUtils.js · portalStyles.css ·
          adventureManifest.js (Stage-4 topics/NPCs for the Set-task form)
online-quizzes/ , interactive-tools/ , worksheet-creators/ , flip-cards/ , games/
assessment/exam-builder/
assessment/exam-builder/           THE REVISION GENERATOR (homepage calls it that)
  app.js                           UI + the STAGES registry (stage3/4/5) + generation
  question-banks/<topic>/          Stage 4 · stage-5/<topic>/ · stage-3/<topic>/
  engines/<name>/                  18 SVG diagram engines, one file each
  renderers/                       question-renderer (one question) + exam-renderer (the paper)
  templates/<name>/                hsc-style (base) · class-test · revision-package ·
                                   worksheet · textbook-template
  utils/answer-space-rules.js      what answer space a question gets, and why
  docs/stage-3-syllabus-reference.md  Stage 3 scope, outcomes, calibration rules
  tools/verify.mjs                 all banks: schema, diagrams, token leaks
  tools/stages.mjs · stage3*.mjs · picker.mjs   targeted harnesses (see the header block)
  layout-check.html                renders real questions in-browser and measures them
game-platforms/mills-maths-adventure/   the BUILT Adventure (index.html + assets/)
dashboards/                        OLD dashboards → now redirect stubs to /portal/*
firestore.golive.claims.rules      the live security rules (reference copy)
portal/PLACEMENT.md , portal/README.md   migration + structure notes
```
- **Tool registry** (`portal/shared/mmtToolRegistry.js`) declares which tools feed
  the platform — add/disable entries here; nothing else hardcodes a tool. Each
  entry's `achievementToolName` must match the EXACT `tool` string the quiz writes.
- All Firebase quizzes were migrated to the secure exchange (via `quizClient.js`
  or inline). The decimal-zoom rounding quiz was converted from a public
  leaderboard to a secure achievements quiz.
- **Complete the Square (2026-08-31):** teacher tool
  `interactive-tools/stage-5/algebra/complete-the-square/`, the first Stage 5
  algebra tool. Two modes (tiles, and the formula proof), cross-listed under
  **MA5-EQU-P-01 / MA5-EQU-P-02 / MA5-ALG-P-01**, alongside its worksheet
  creator `worksheet-creators/stage-5/algebra/complete-the-square.html` (the
  first Stage 5 creator, listed under the same three outcomes, reached from the
  tool's "Tools ▾" menu). Read BOTH 2026-08-31 header blocks before touching the
  tile colours, the proof's opening algebra steps, the exact-answer arithmetic
  or the drawn radical.
- **Unit Conversion family (2026-08-31):** teacher tool
  `interactive-tools/stage-4/measurement-space/unit-conversion-number-line/`
  and worksheet creator
  `worksheet-creators/stage-4/measurement-space/unit-conversion.html`.
  **Cross-listed under five outcomes** so it is findable from both stages:
  Stage 3 **MA3-GM-02** / **MA3-NSM-01** / **MA3-3DS-02**, Stage 4
  **MA4-LEN-C-01** / **MA4-RAT-C-01** (ten rows, two URLs, nothing duplicated
  on disk — the same cross-listing convention as the Protractor). No Firebase,
  no registry entry, no student quiz yet. Read the two 2026-08-31 header
  blocks before touching the drawn domain, the hop marks, the multiplier
  constraints or the worksheet's tick bucketing.
- **Multiplying Fractions — Area Model (2026-08-26):** teacher tool
  `interactive-tools/stage-4/number/multiplying-fractions-area-model/`, filed
  under **MA4-FRC-C-01**. Teaching tool ONLY so far (no worksheet, no quiz), and
  it does not touch Firebase or the registry. Its “Tools ▾” menu holds the other
  four Stage 4 fraction tools, and each of those now links back to it. FIVE
  reveal steps, an opt-in number line, a Simplify/Undo re-grouping, and
  deliberately almost no on-screen prose — read the 2026-08-26 header block
  before adding anything to it. Its worksheet creator is
  `worksheet-creators/stage-4/number/multiplying-fractions.html`.
- **Fraction to Percentage family (2026-08-18):** teacher tool
  `interactive-tools/stage-4/number/fraction-to-percentage/` (double number line,
  fraction above / percentage below, step reveals, predict mode) +
  `worksheet-creators/stage-4/number/fraction-to-percentage.html` +
  `online-quizzes/stage-4/number/fraction-to-percentage.html` (registered in
  `mmtToolRegistry.js` as `fraction-to-percentage-student-quiz`). See the
  2026-08-18 header block.
- **Fraction Bar + Number Line family (2026-07-08):**
  - **Teacher tool** `interactive-tools/stage-4/number/fraction-bar-number-line/index.html`
    — self-contained (inline CSS/JS): a fraction shown as a part-whole bar, a
    point/decimal on a (double) number line, and as division (Animate). Denominator
    2–100, Bar/Number-Line/Decimal/Simplify toggles, smooth zoom-out, drag the
    point, arrow-key nudge. Has a **"Tools ▾"** menu → **Student Quiz** link.
  - **Student pages** in `online-quizzes/stage-4/number/`, both registered in
    `mmtToolRegistry.js` and using the secure `MMTQuiz` save (dynamic import → work
    offline; **no typed answers stored**, only structured `types[]` flags):
    - `fraction-thinking-explorer.html` — open "Explore + shuffler" (superseded for
      classroom use by the Quiz; kept enabled).
    - `fraction-thinking-quest.html` — **"Fractions Number Line Quiz"** (title/registry
      renamed; filename kept). Guided **8-stage** progression
      (understand→equivalence→density→recurring→division→improper→compare→convince),
      **trilingual EN/AR/FA** (selected language on top, English beneath; number line
      stays LTR/Western numerals), part-b checkable inputs + reasoning chips stored as
      `types[]` tags. **Every stage randomises its values per attempt** via per-stage
      `gen()` functions cached in `P` (`{token}` templates filled by `fill()`); same
      learning intention each time, cleared on reset. `score/total` = stages completed.
    - Tested headlessly (jsdom): all 8 stages generate valid params in all 3 langs,
      no leftover `{tokens}`, satisfiable across 200 random trials.
    - TODO: AR/FA strings want a fluent proofread; hub cards for the student pages;
      teacher portal export of the `types[]` reasoning tags.

## 6. Mills Maths Adventure (game source repo)
- Vite + React + R3F. `src/` (game), `functions/` (Cloud Functions),
  `portal/` (a DEV copy used only by the automated checks — the **website**
  `portal/` is the deployed one).
- **Dev panel** shows only in `npm run dev` (hidden in the production build).
- Defaults: **Camera Lock ON, Quest HUD OFF**.
- **391 headless system checks** in `src/dev/systemChecks.js` — run via the babel
  parse-check + Node harness (set `package.json` `type:module` temporarily, shim
  localStorage/window/document, run `runSystemChecks()`; restore package.json).
  esbuild can't run in that harness (platform mismatch) — don't rely on it.
- **Player avatar cloud-save (W3):** customisable "shape" avatar saved to the
  student's `students/{code}` doc via `setStudentAvatar` (follows them across
  devices). **Touch controls (W4):** tap-to-move / tap-to-interact / on-screen
  keypad, ⚙-toggled. **Soft-cartoon graphics (W5):** ⚙ **Graphics** High/Low
  (auto-low on touch) — lighting/AO/bloom/outlines/wind-grass; needs the
  `@react-three/postprocessing` dep (`npm install` before build). **World redesign
  (W6):** bigger irregular island, square plaza, snow/ash themed zones, grove→
  SchoolYard portal. FPV toggle is PARKED (not working). Full where-everything-
  lives: the game repo's `CLAUDE.md` (W3–W6 sections).
- Cloud save: completed attempts write a compact `achievements` record + a rich
  `adventureAttempts` record (no typed answers). Demo/skip stays local-only.
  Curriculum/adapters/diagram systems are isolated — only adapters touch legacy banks.
- **Teacher-set tasks (Phases 1–2, built 2026-07-01):** teachers assign tasks from
  the Teacher Platform; students get them roster-pushed by class, delivered by the
  chosen NPC (Pip/Fern/Alby, off-theme allowed). New `adventureAssignments`
  collection + functions (§4). Game side: `cloudSession.loadAssignments()` →
  runtime missions + NPC chain overlay (teacher steps prepended so they show even
  for a finished student). Completion is tagged with `taskId` and surfaced in the
  teacher portal (per-task Done count + View breakdown, and a "Teacher task" badge
  per student). Full design/where-everything-lives:
  `Mills Maths Adventure/docs/teacher-adventure-tasks-plan.md`.

## 7. Working agreement with Claude
- **Test before deploying** where practical: website pages via a local server
  (`python3 -m http.server` from `mathstools-main 2`, open the page); bigger
  changes via a branch + Netlify deploy preview.
- Keep the secure-exchange model; never re-open anonymous writes or client
  identity writes; never store typed answers; don't weaken the live rules without
  a clear reason.
- Match existing design tokens / folder casing (lowercase-hyphenated).
- **Teacher-facing controls stay readable in English.** A worksheet creator's
  language `<select>` names the language in ENGLISH FIRST with the native script
  in brackets — `English` / `Arabic (العربية)` / `Farsi / Persian (فارسی)` (the
  Adding and Subtracting Fractions one prints bilingually, so it reads
  `Arabic + English (العربية)`). The control's own label keeps the English name
  in every language too (`زبان برگه (Worksheet language)`), or a teacher who
  switches to Farsi cannot find the control again. Swept across all 7 creators
  with a language selector on 2026-08-20. Student-facing toggles are different —
  the quizzes' `EN / ع / فا` buttons are chosen BY the student, so native script
  alone is right there.
- When a change spans both repos (e.g. a teacher feature + a function), deploy the
  **function first**, then push the website.

## 8. Open / future items
- **Student-quiz sign-in sweep:** 11 of 26 quizzes carry the v2 login block
  (adding-subtracting-fractions joined 2026-08-20).
  The other **15** still have bespoke inline sign-in and their own completion
  screens (9 of those have no `.certSub` at all) — extend the v2 block to them
  when convenient. Within the ten, `collecting-like-terms` and `factor-circles`
  have no `.certSub` (they end with a copy-a-message panel), so only the chip
  changed there; their "paste into Google Classroom" copy tips are about a
  celebration message, not a result, and were left alone (the trilingual one
  has AR/FA translations of that string too).
- **Multiplying Fractions — Area Model siblings:** the teaching tool and the
  **worksheet creator** shipped 2026-08-26 (see the header block). Still to
  build: a **student quiz** (`online-quizzes/stage-4/number/multiplying-fractions.html`,
  registry id `multiplying-fractions-quiz`) carrying the v2 login block and the
  MathLive fraction box — a ladder that fades the model, then the counting, then
  leaves only the rule. Also possible in the tool itself: **mixed numbers**
  (needs a grid wider than one whole, and is the bridge to expanding brackets),
  and **dividing** fractions on the same square.
- **Complete the Square siblings:** the teaching tool AND its worksheet creator
  shipped 2026-08-31. Still
  to build: a **worksheet creator** and a **student quiz** (both stubbed as
  greyed rows in its Tools menu). Extensions flagged in the header block:
  non-monic quadratics in the TILE mode (needs a "divide by a" step), c < 0,
  and a discriminant view built on the existing "no real solutions" guard.
- **Unit Conversion — Double Number Line siblings:** the teaching tool and the
  **worksheet creator** both shipped 2026-08-31. Still to build: a **student
  quiz** (`online-quizzes/stage-4/measurement-space/unit-conversion.html`,
  registry id `unit-conversion-quiz`) carrying the v2 login block — it is
  stubbed as the one remaining greyed row in the tool's Tools menu. A
  **cubic-units section** for the worksheet creator (isometric cubes → 1 cm³ =
  1 mL) is scoped and deliberately unbuilt. Possible extensions to the tool itself:
  **time** (h/min/s — valuable precisely BECAUSE the ratio is 60, not a power
  of ten, so it breaks the “move the decimal point” habit) and **area/volume**
  (m² ↔ cm² is 10 000, not 100 — the classic trap, and it would need its own
  tier). Digital storage (GB/MB/kB) was considered and left out.
- **Revision Generator — Stage 3**: 6 of 8 topics built (Represents Numbers,
  Additive Relations, Multiplicative Relations, Fractions, 2D Space and Area,
  Geometric Measure). Each remaining topic needs a new diagram engine first:
  **3D Space and Volume** (nets) and **Mass and Time** (analog clock). Data and
  Chance are deliberately deferred. Geometric Measure shipped WITHOUT its
  optional grid-map engine — the syllabus's grid-reference-vs-coordinate
  distinction is asked in prose for now; a grid-map engine would improve it.
  Scope, outcome mapping and the calibration conventions are in
  `assessment/exam-builder/docs/stage-3-syllabus-reference.md` — read it before
  writing a bank, and add the new conventions it records to any new one.
- Revision Generator — smaller follow-ups: right-align the worksheet answer
  boxes into a consistent column for faster marking (trade-off: short prompts
  wrap awkwardly around them); page numbers need Chrome's own print
  header/footer since CSS cannot generate them; the protractor and thermometer
  diagrams still carry more whitespace than they need.
- Adventure: **interactive plot-a-point input mode** (student taps the
  Cartesian grid — flagged during the Linear Relationships build); **Stage 5
  depth** (still just 2 sample skills); **Area extension** as a further Stage 4
  topic. (The 14 Stage 4 topics — through Angles, Geometry and Data — are all
  LIVE; see the game repo's Phase 3A–3J sections.)
- Consider a **DevPanel diagram/chart gallery** to eyeball every new figure at
  once, and a live-review polish pass on the newest diagrams (protractor,
  geometry shapes, data charts).
- Teacher portal: revisit **graphs** (engagement/leaderboard — removed for now),
  add student **enable/disable/edit**. (Adventure-TASK create/edit/remove +
  completion view, **saved classes**, **dashboard/quiz tasks + sub-topic builder**
  and **farm Adventure tasks** are now DONE — see the 2026-07-22 header block, §4.)
  Follow-ups: subset builders for the other quizzes; a systemChecks farm-task
  check; a class rename/merge view.
- Adventure tasks — future polish: per-skill selection in the Set-task form (only
  topic-level today — now 14 Stage 4 topics), in-game due-date
  display/overdue handling, more stages/NPCs.
- Functions runtime: bump **Node 20 → 22** before Oct 2026 (Google deprecation).
- Consider **App Check**; consider consolidating the 3 Firebase projects later.
- Old pre-reorg URLs (e.g. `/factor-circles/`) now 404 — add redirects if any were
  widely shared.
