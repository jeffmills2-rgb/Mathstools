#!/usr/bin/env node
/**
 * compress-models.mjs — shrink every .glb in public/models/ for the web.
 *
 * Recipe (proven ~20x smaller with no visible quality loss on this art style):
 *   • resize textures to 1024px  • re-encode textures to WebP
 *   • meshopt geometry compression
 * The output loads with NO code changes: @react-three/drei's useGLTF enables the
 * meshopt decoder by default, and three.js decodes EXT_texture_webp natively.
 *
 * Idempotent: models that are ALREADY meshopt-compressed are skipped, so you can
 * safely run it after dropping in a new Meshy export and it only touches the new
 * ones. Compresses in place (writes to a temp file first, then swaps).
 *
 * Usage:  npm run models:compress
 * Needs:  @gltf-transform/cli (a devDependency — run `npm install` once first).
 */
import { readFileSync, statSync, renameSync, rmSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const MODELS_DIR = join(HERE, "..", "public", "models");
const TEXTURE_SIZE = 1024; // px — bump for models that need sharper close-ups

const mb = (n) => (n / 1048576).toFixed(1) + " MB";

async function findGlbs(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await findGlbs(p)));
    else if (e.name.toLowerCase().endsWith(".glb")) out.push(p);
  }
  return out;
}

// True if the .glb already uses meshopt compression (so we can skip it).
function alreadyCompressed(file) {
  const b = readFileSync(file);
  if (b.readUInt32LE(0) !== 0x46546c67) return false; // not 'glTF'
  const total = b.readUInt32LE(8);
  let off = 12;
  while (off + 8 <= total) {
    const clen = b.readUInt32LE(off);
    const ctype = b.readUInt32LE(off + 4);
    off += 8;
    if (ctype === 0x4e4f534a) { // JSON chunk
      try {
        const json = JSON.parse(b.subarray(off, off + clen).toString("utf8"));
        return (json.extensionsUsed || []).includes("EXT_meshopt_compression");
      } catch { return false; }
    }
    off += clen;
  }
  return false;
}

const files = await findGlbs(MODELS_DIR).catch((e) => {
  console.error(`Could not read ${MODELS_DIR}: ${e.message}`);
  process.exit(1);
});

let compressed = 0, skipped = 0, failed = 0, before = 0, after = 0;
for (const f of files) {
  const rel = relative(MODELS_DIR, f);
  if (alreadyCompressed(f)) { console.log(`skip   ${rel} (already compressed)`); skipped++; continue; }
  const sizeBefore = statSync(f).size;
  const tmp = f + ".tmp.glb";
  try {
    execFileSync("gltf-transform", [
      "optimize", f, tmp,
      "--compress", "meshopt",
      "--texture-compress", "webp",
      "--texture-size", String(TEXTURE_SIZE),
    ], { stdio: "pipe" });
    renameSync(tmp, f);
    const sizeAfter = statSync(f).size;
    before += sizeBefore; after += sizeAfter;
    console.log(`ok     ${rel.padEnd(30)} ${mb(sizeBefore)} -> ${mb(sizeAfter)}`);
    compressed++;
  } catch (e) {
    try { rmSync(tmp, { force: true }); } catch { /* ignore */ }
    console.error(`FAIL   ${rel}: ${(e.stderr || e.message || "").toString().trim().split("\n").pop()}`);
    failed++;
  }
}

console.log(
  `\nDone: ${compressed} compressed, ${skipped} skipped, ${failed} failed.` +
  (compressed ? `  ${mb(before)} -> ${mb(after)} on the new files.` : "")
);
if (failed) process.exitCode = 1;
