# Resources by Stage

Live page: **https://www.millsmathstools.au/resources/**

Teaching and revision resources organised by NSW Mathematics K–10 Syllabus (2022)
outcome. Stage 4 (Years 7–8) and Stage 5 (Years 9–10), grouped by strand,
collapsible by topic.

---

## How to add a resource (3 steps)

**1. Drop the file in the right folder.**

```
resources/stage-5/trigonometry/bearings-intro.pptx
resources/stage-4/equations/two-step-equations-worksheet.pdf
```

Folder names are lowercase-hyphenated and match the `slug` of each topic in
`resourcesManifest.js`. They already exist — see the tree below.

**2. Add one line to `resourcesManifest.js`.**

Find the topic (search for its `slug`), find the right outcome inside
`outcomes`, and push an object into that outcome's `resources` array:

```js
{
  code: "MA5-TRG-C-02",
  path: "Core",
  focusArea: "Trigonometry B",
  statement: "applies trigonometry to solve problems, including bearings …",
  resources: [
    { title:"Bearings — intro deck", type:"pptx", file:"bearings-intro.pptx",
      note:"Worked examples + 6 practice questions", year:"Year 9",
      tags:["bearings","worked examples"] }
  ]
}
```

**3. Push.**

```bash
git add -A && git commit -m "resources: add bearings deck" && git push
```

Netlify redeploys in ~1 minute. Nothing else needs editing — the page counts,
badges and search index all rebuild from the manifest.

---

## Resource fields

| Field    | Required | Notes |
|----------|----------|-------|
| `title`  | yes      | Shown on the card |
| `type`   | yes      | `pdf` · `pptx` · `docx` · `xlsx` · `link` · `video` |
| `file`   | yes*     | Filename only — resolved against the topic folder. *Not needed for `type:"link"` |
| `url`    | link only| Full URL for `type:"link"` |
| `note`   | no       | One short line under the title |
| `year`   | no       | e.g. `"Year 9"` — renders as a small chip |
| `tags`   | no       | Array of strings — searchable, render as chips |

---

## Structure

```
resources/
  index.html               the landing page (self-contained; reads the manifest)
  resourcesManifest.js     ← THE ONLY FILE YOU EDIT
  README.md                this file
  stage-4/<topic>/         drop Stage 4 files here
  stage-5/<topic>/         drop Stage 5 files here
```

### Stage 4 topics (15 topics · 16 outcomes)

| Strand | Folder | Outcomes |
|---|---|---|
| Number & Algebra | `computation-with-integers` | MA4-INT-C-01 |
| | `fractions-decimals-percentages` | MA4-FRC-C-01 |
| | `ratios-and-rates` | MA4-RAT-C-01 |
| | `algebraic-techniques` | MA4-ALG-C-01 |
| | `indices` | MA4-IND-C-01 |
| | `equations` | MA4-EQU-C-01 |
| | `linear-relationships` | MA4-LIN-C-01 |
| Measurement & Space | `length` | MA4-LEN-C-01 |
| | `right-angled-triangles-pythagoras` | MA4-PYT-C-01 |
| | `area` | MA4-ARE-C-01 |
| | `volume` | MA4-VOL-C-01 |
| | `angle-relationships` | MA4-ANG-C-01 |
| | `properties-of-geometrical-figures` | MA4-GEO-C-01 |
| Statistics & Probability | `data-classification-visualisation-analysis` | MA4-DAT-C-01, MA4-DAT-C-02 |
| | `probability` | MA4-PRO-C-01 |

### Stage 5 topics (19 topics · 41 outcomes — focus areas collated)

NESA splits Stage 5 into 41 focus areas (Trigonometry A/B/C/D, Equations A/B/C …).
Those are **collated into one topic per concept** here; each outcome keeps its own
Core / Path badge.

| Strand | Folder | Collates | Outcomes |
|---|---|---|---|
| Number & Algebra | `financial-mathematics` | Financial mathematics A, B | MA5-FIN-C-01/02 |
| | `algebraic-techniques` | Algebraic techniques A, B, C | MA5-ALG-C-01, P-01, P-02 |
| | `indices-and-surds` | Indices A, B, C | MA5-IND-C-01, P-01, P-02 |
| | `equations` | Equations A, B, C | MA5-EQU-C-01, P-01, P-02 |
| | `linear-relationships` | Linear relationships A, B, C | MA5-LIN-C-01/02, P-01 |
| | `non-linear-relationships` | Non-linear relationships A, B, C | MA5-NLI-C-01/02, P-01 |
| | `variation-and-rates-of-change` | Variation and rates of change A, B | MA5-RAT-P-01/02 |
| | `polynomials` | Polynomials | MA5-POL-P-01 |
| | `logarithms` | Logarithms | MA5-LOG-P-01 |
| | `functions-and-other-graphs` | Functions and other graphs | MA5-FNC-P-01 |
| Measurement & Space | `numbers-of-any-magnitude` | Numbers of any magnitude | MA5-MAG-C-01 |
| | `trigonometry` | Trigonometry A, B, C, D | MA5-TRG-C-01/02, P-01/02 |
| | `area-and-surface-area` | Area and surface area A, B | MA5-ARE-C-01, P-01 |
| | `volume` | Volume A, B | MA5-VOL-C-01, P-01 |
| | `properties-of-geometrical-figures` | Properties of geometrical figures A, B, C | MA5-GEO-C-01, P-01/02 |
| | `circle-geometry` | Circle geometry | MA5-CIR-P-01 |
| | `introduction-to-networks` | Introduction to networks | MA5-NET-P-01 |
| Statistics & Probability | `data-analysis` | Data analysis A, B, C | MA5-DAT-C-01/02, P-01 |
| | `probability` | Probability A, B | MA5-PRO-C-01, P-01 |

---

## Deep links

The page supports hash deep-links, handy for putting on a Google Classroom post
or a scope-and-sequence doc:

- `/resources/#stage-5` — opens on the Stage 5 tab
- `/resources/#MA5-TRG-C-02` — opens Stage 5, filters to that outcome and scrolls to it

---

## File hygiene (read once)

Files live in the repo alongside the manifest, so a single commit always contains
both the PDF and its entry — they can't drift apart. That's the reason for this
setup. It works comfortably to several hundred worksheets.

Two things to know:

**1. Replacing files is expensive; adding them is cheap.**
Git keeps every version of a binary forever. Adding 300 worksheets is fine
(~350 MB, well inside GitHub's 1 GB soft limit and Netlify's free tier). But
re-exporting the *same* worksheet ten times stores all ten copies permanently.
So: get a worksheet right before committing it, rather than pushing successive
drafts of the same file.

**2. Canva decorative borders cost ~900 KB per page.**
Measured on `adding-fractions-with-common-denominators.pdf`: two objects were
93% of the 1.9 MB file. They're not images — they're the full-bleed decorative
border drawn as vector paths, one per page. The actual maths content (text,
fonts, fraction bars) is about 40 KB.

This means compression tools barely help — the data is already Flate-compressed
vector, not a downsamplable raster. Ghostscript manages ~25%.

If file size ever matters, the lever is **Canva, not tooling**: exporting without
the decorative background takes a worksheet from ~1.2 MB to ~90 KB. Purely
optional — the borders look good and nothing is currently straining.

**Don't flatten PDFs to raster to save space.** It roughly halves the size but
destroys the text layer — no PDF search, no copy-paste, no screen-reader access.
Not a worthwhile trade.

### When to revisit

If the library passes roughly 500 files, or you start hosting video, move the
files to object storage (Cloudflare R2's free tier is 10 GB with zero egress
fees) and switch those manifest entries to `type:"link"` with full URLs. The page
already supports that — no code change needed.

---

## Adding a whole new topic

Only needed if NESA changes the syllabus. Add an object to `stage4` or `stage5`
in the manifest with `slug`, `name`, `strand`, `icon`, `blurb`, `outcomes[]`,
then create the matching folder. The page picks it up automatically.

---

Outcome codes and statements are verbatim from the
[NSW Mathematics K–10 Syllabus (2022)](https://curriculum.nsw.edu.au/learning-areas/mathematics/mathematics-k-10-2022),
© NSW Education Standards Authority. Pathway notes: Stn = Standard,
Adv = Advanced, Ext = Extension.
