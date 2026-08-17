# Schoolyard storyboard — the Coffs Coast (W2-E)

> The second region is a schoolyard on the **Coffs Coast** (Coffs Harbour, NSW —
> Gumbaynggirr Country). The story dressing draws on real local landmarks so it
> feels like *home* to Coffs Harbour High students. Light, friendly, sandbox tone
> — no locked gates; the maths is the accessible number-facts warm-up (W1).

## Local anchors (researched)
- **The Big Banana** — Australia's original "Big Thing" (1964), a working banana
  plantation with a walk-through banana, toboggan and mini-golf.
- **Muttonbird Island / Giidany Miirlarl** — seabird rookery reached by the
  breakwall from Jetty Beach; wedge-tailed shearwaters nest here, and humpbacks
  pass on the "whale highway" (May–Nov).
- **Jetty Beach & the Marina** — the harbour, fishing vessels, and the
  **Fishermen's Co-op** (fish & chips by the water).
- **Solitary Islands Marine Park** — diving and marine life offshore.
- **Niigi Niigi / Sealy Lookout & Bruxner Park** — an escarpment 310 m up with the
  Forest Sky Pier and subtropical rainforest, looking back over the coast.

## The map — a terraced quad (W2-F)
Enlarged to 76×60 and built as **three tiers stepping up toward the buildings**
(front quad → middle → upper), linked by **central staircases** — mirroring the
real school's levels. Each tier holds three staff. Data-driven: everything (chain,
warm-up, dialogue, completion, interactable) is generated from the character list
in `schoolyard/schoolyardLayout.js`.

## The nine characters (theme → maths)
Renamed to staff and expanded to nine, spaced 3-per-tier, skills balanced
round-robin (add/sub · × · ÷), each with a Coffs Coast flavour line:
- **Tier 0 (front quad):** Mr. Pearce (Big Banana), Ms. Mahoney (Jetty Beach),
  Ms. Ewings (Muttonbird Island).
- **Tier 1 (middle):** Mrs. Kellahan (Fishermen's Co-op), Mr. Dawson (Sealy
  Lookout), Mr. Heywood (Solitary Islands diving).
- **Tier 2 (upper):** Mr. Morgan (banana plantations), Mrs. Bacon (the marina),
  Ms. Brookes (Bruxner rainforest).
All nine are teacher-assignable (function whitelist + portal manifest).

## Story beats (dialogue, not cutscenes — the player stays in control)
1. **Island — Sage** mentions a shimmering **Teleport Gate** to the south-west
   that leads to "the Schoolyard on the Coffs Coast."
2. **Arrival** — stepping through, a **welcome sign** by the plaza greets the
   player: beaches, the Big Banana and the mountains, and points them to Helen,
   Darby and Elka.
3. **Each character** opens with a friendly local line, then offers a quick number
   warm-up (score ≥ 60% to pass). Off-theme teacher tasks still overlay normally.
4. **Completion** lines are warm and local ("race you along the breakwall").

## Tone / respect
Use the well-known place names lightly and warmly. Giidany Miirlarl (Muttonbird
Island) and Niigi Niigi (Sealy Lookout) are Gumbaynggirr names — reference the
places kindly, no sacred/cultural claims. Keep it about the fun of the Coast.

## Later (graphics upgrade)
Swap the blocky buildings/props for themed set-dressing: a mini Big Banana, a
breakwall + island silhouette, a Forest Sky Pier lookout, fishing boats. Out of
scope for W2-E (story pass only).
