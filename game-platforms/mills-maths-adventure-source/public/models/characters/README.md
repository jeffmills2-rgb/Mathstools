# Character models (glTF) — drop CC0 assets here

This folder holds the 3D character models used for the NPCs and the player. It is
served by Vite from `public/`, so files here are available at
`./models/characters/<file>` in both dev and the built game (vite `base:"./"`).

## What to add
Grab a **free CC0** low-poly character pack (no attribution required, safe for the
site) and copy its `.glb` (or `.gltf`) character files into THIS folder. Good picks:

- **Kenney "Mini Characters"** — https://kenney.nl/assets (many distinct people;
  simple style that matches the game; shared idle/walk animations). Recommended.
- **Quaternius "Ultimate Modular Characters"** — https://quaternius.com (modular,
  animated; build custom staff from parts).
- **KayKit Characters** — https://kaylousberg.com/game-assets (higher fidelity;
  fewer base characters).

Prefer a single-file **.glb** per character (geometry + rig + animations embedded).

## How it's wired
`src/game/characters/characterModels.js` maps each character id (the 12 NPCs +
`player`) to a model file + tuning (scale / yOffset / rotationY / idle+walk clip
names). Until a character has a `file`, it renders the original low-poly
box-and-sphere fallback — so the game always works, and you upgrade one character
at a time.

After copying files in, set each character's `file` (and, if needed, `scale`,
`rotationY`, and the animation clip names) in `characterModels.js`. We'll tune
those together once the real models are in — different packs use different base
sizes and animation names.

> Nothing in this folder is committed as source in the game repo; the built copies
> travel with `dist/` into the website's `game-platforms/mills-maths-adventure/`.
