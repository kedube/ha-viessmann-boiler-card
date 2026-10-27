import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DEV_CONFIG } from "../dev/fixtures";
import { placeholderSpec, specFromPortsJson, type PortsJson } from "../src/scene/catalog";
import { buildDiagram, componentIds } from "../src/scene/diagram";
import { danglingEnds, diagonalSegments } from "./diagram-checks";

// Renders are not committed, so these checks run only where tools/render has produced them.
// The files are read from disk on every run so a fresh render is never checked against a cached copy.
const dir = join(import.meta.dirname, "../assets/renders");
const rendered: PortsJson[] = existsSync(dir)
  ? readdirSync(dir)
      .map((id) => join(dir, id, "ports.json"))
      .filter((file) => existsSync(file))
      .map((file) => JSON.parse(readFileSync(file, "utf8")) as PortsJson)
  : [];
const specs = Object.fromEntries(rendered.map((json) => [json.id, specFromPortsJson(json, "/renders/")]));

describe.skipIf(Object.keys(specs).length === 0)("diagram with the Blender renders", () => {
  const d = buildDiagram((id) => specs[id] ?? placeholderSpec(id), DEV_CONFIG);

  it("has a front-view render for every part", () => {
    for (const id of componentIds(DEV_CONFIG)) expect(specs[id]?.image, id).toBeDefined();
  });

  it("has no pipes that end in mid-air", () => {
    expect(danglingEnds(d)).toEqual([]);
  });

  it("uses only horizontal and vertical runs", () => {
    expect(diagonalSegments(d)).toEqual([]);
  });

  it("keeps every part inside the diagram", () => {
    for (const p of d.parts) {
      expect(p.x, p.key).toBeGreaterThanOrEqual(0);
      expect(p.y, p.key).toBeGreaterThanOrEqual(0);
      expect(p.x + p.spec.width * p.scale, p.key).toBeLessThanOrEqual(d.width);
      expect(p.y + p.spec.height * p.scale, p.key).toBeLessThanOrEqual(d.height);
    }
  });
});
