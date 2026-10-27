import { describe, expect, it } from "vitest";
import { DEV_CONFIG, ZONES } from "../dev/fixtures";
import { placeholderSpec } from "../src/scene/catalog";
import { buildDiagram } from "../src/scene/diagram";
import { fillet, offsetTowardLight, type Pt } from "../src/scene/geometry";
import { danglingEnds, diagonalSegments, onPolyline } from "./diagram-checks";

describe("geometry", () => {
  it("rounds corners but keeps the ends", () => {
    const f = fillet(
      [
        [0, 0],
        [100, 0],
        [100, 100],
      ],
      20,
    );
    expect(f.points[0]).toEqual([0, 0]);
    expect(f.points[f.points.length - 1]).toEqual([100, 100]);
    expect(f.corners).toHaveLength(1);
    expect(f.points.some(([x, y]) => x === 100 && y === 0)).toBe(false);
  });

  it("moves highlights toward the light", () => {
    const [p] = offsetTowardLight(
      [
        [0, 0],
        [100, 0],
      ],
      4,
      [0, -1],
    );
    expect(p[1]).toBeCloseTo(-4, 6);
  });
});

describe("2D diagram with placeholders", () => {
  const d = buildDiagram(placeholderSpec, DEV_CONFIG);

  it("has no pipes that end in mid-air", () => {
    expect(danglingEnds(d)).toEqual([]);
  });

  it("uses only horizontal and vertical runs", () => {
    expect(diagonalSegments(d)).toEqual([]);
  });

  it("draws all seven zones with their own loops, valves and coils", () => {
    expect(d.zones.map((z) => z.name)).toEqual(ZONES.map((z) => z.name));
    for (const z of d.zones) {
      expect(d.parts.some((p) => p.key === `zone-valve-${z.index}`)).toBe(true);
      const coil = d.pipes.find((p) => p.key === `zone-${z.index}-coil`);
      expect(coil?.material).toBe("pex");
      expect(coil?.side).toBe("coil");
      expect(coil?.loops).toEqual([`circuit2.zone${z.index}`]);
    }
  });

  it("only flows each manifold segment for the zones beyond it", () => {
    expect(d.pipes.find((p) => p.key === "supply-manifold-0")!.loops).toEqual(["circuit2.zone0"]);
    expect(d.pipes.find((p) => p.key === "return-manifold-5")!.loops).toHaveLength(6);
  });

  const portAt = (key: string, name: string): Pt => {
    const part = d.parts.find((p) => p.key === key)!;
    const s = part.spec.ports[name];
    return [part.x + s.x * part.scale, part.y + s.y * part.scale];
  };
  const pipe = (key: string) => d.pipes.find((p) => p.key === key)!;
  // Straight runs keep their start height exactly, so their far end can differ by rounding.
  const expectNear = (a: Pt | undefined, b: Pt) => {
    expect(a?.[0]).toBeCloseTo(b[0], 6);
    expect(a?.[1]).toBeCloseTo(b[1], 6);
  };

  it("keeps the DHW and heating loops separate, with no tees on the boiler side", () => {
    const boilerSide = d.pipes.filter((p) => p.loops.includes("boiler") || p.loops.includes("dhw"));
    expect(boilerSide.some((p) => p.loops.includes("boiler") && p.loops.includes("dhw"))).toBe(false);
    for (const j of d.joints) {
      expect(boilerSide.some((p) => onPolyline(j.at, p.points))).toBe(false);
    }
  });

  it("runs hot water through the DHW pump into the tank's upper coil, cooler water back from the lower one", () => {
    const hot = pipe("dhw-to-tank");
    const cool = pipe("dhw-return");
    expect(hot.side).toBe("supply");
    expect(hot.points.at(-1)).toEqual(portAt("tank", "coil_upper"));
    expect(pipe("dhw-supply").points[0]).toEqual(portAt("boiler", "dhw_supply"));
    expect(cool.side).toBe("return");
    expect(cool.points[0]).toEqual(portAt("tank", "coil_lower"));
    expectNear(cool.points.at(-1), portAt("boiler", "dhw_return"));
    expect(hot.points[0][1]).toBeLessThan(cool.points[0][1]);
  });

  it("brings cold water in on top beside the hot outlet, through the mixing valve to the taps", () => {
    expect(pipe("tap-cold").points.at(-1)).toEqual(portAt("tank", "cold_in"));
    expect(pipe("tap-cold-to-mixer").points.at(-1)).toEqual(portAt("tempering", "cold"));
    expect(onPolyline(pipe("tap-cold-to-mixer").points[0], pipe("tap-cold").points)).toBe(true);
    expect(pipe("tap-hot").points[0]).toEqual(portAt("tank", "hot_out"));
    expect(pipe("tap-hot").points.at(-1)).toEqual(portAt("tempering", "hot"));
    expect(pipe("tap-mixed").points[0]).toEqual(portAt("tempering", "mixed"));
    expect(d.terminals.map((t) => t.label).sort()).toEqual(["Cold water in", "Hot water to taps"]);
    // Both connections sit on top of the tank, so nothing comes in from the side.
    expect(portAt("tank", "cold_in")[1]).toBeCloseTo(portAt("tank", "hot_out")[1], 6);
  });

  it("drops the heating supply right after the pump, leaving room above the heat exchanger for its label", () => {
    const hx = d.parts.find((p) => p.key === "hx")!;
    const hxCentre = hx.x + (hx.spec.width * hx.scale) / 2;
    const dropX = pipe("pump-to-hx").points[1][0];
    expect(dropX - portAt("boiler-pump", "outlet")[0]).toBeLessThan(40);
    // A label up to ~230 diagram px wide, centred on the exchanger, stays clear of the drop.
    expect(hxCentre - dropX).toBeGreaterThanOrEqual(115);
  });

  it("takes warm water over the top through the BOILER pump and back straight from the heat exchanger's bottom", () => {
    const warm = pipe("boiler-supply");
    expect(warm.points[0]).toEqual(portAt("boiler", "supply"));
    expect(warm.points.at(-1)).toEqual(portAt("boiler-pump", "inlet"));
    expect(pipe("pump-to-hx").points.at(-1)).toEqual(portAt("hx", "p1_in"));
    const back = pipe("hx-return");
    expect(back.side).toBe("return");
    expect(back.points).toHaveLength(2);
    expect(back.points[0]).toEqual(portAt("hx", "p1_out"));
    expect(back.points[1][1]).toBe(back.points[0][1]);
  });

  it("fits a landscape card", () => {
    expect(d.width / d.height).toBeGreaterThan(1.6);
    for (const p of d.parts) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x + p.spec.width * p.scale).toBeLessThanOrEqual(d.width);
    }
  });
});
