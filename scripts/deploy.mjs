// Copies the build into Home Assistant's www folder, e.g. the config share
// mounted from the Samba add-on, to try a change before releasing it.
// Usage: npm run deploy -- /Volumes/config/www   (or set HA_WWW)
import { cpSync, existsSync } from "node:fs";
import { resolve } from "node:path";

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

// dist/ already has the layout the card expects: its script with the renders in a folder beside it.
cpSync(resolve(import.meta.dirname, "../dist"), target, { recursive: true });

console.log(`Copied the card and its renders to ${target}.`);
console.log("Raise the ?v= number on the dashboard resource so browsers fetch the new version.");
