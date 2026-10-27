// Copies the built card and its renders into Home Assistant's www folder,
// e.g. the config share mounted from the Samba add-on.
// Usage: npm run deploy -- /Volumes/config/www   (or set HA_WWW)
import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const arg = process.argv[2] ?? process.env.HA_WWW;
if (!arg) {
  console.error("Usage: npm run deploy -- <path to Home Assistant's /config/www>");
  process.exit(1);
}
const target = resolve(arg);
if (!existsSync(target)) {
  console.error(`${target} not found. Is the Home Assistant config share mounted?`);
  process.exit(1);
}

const root = resolve(import.meta.dirname, "..");
cpSync(join(root, "dist/viessmann-boiler-card.js"), join(target, "viessmann-boiler-card.js"));

// Only what the card loads: the WebP render and its ports for each part.
const renders = join(root, "assets/renders");
const out = join(target, "viessmann-boiler-card");
let parts = 0;
for (const id of existsSync(renders) ? readdirSync(renders) : []) {
  for (const file of ["render.webp", "ports.json"]) {
    const src = join(renders, id, file);
    if (!existsSync(src)) continue;
    mkdirSync(join(out, id), { recursive: true });
    cpSync(src, join(out, id, file));
  }
  parts++;
}

console.log(`Copied the card and ${parts} renders to ${target}.`);
console.log("Raise the ?v= number on the dashboard resource so browsers fetch the new version.");
