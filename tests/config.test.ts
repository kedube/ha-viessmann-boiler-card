import { describe, expect, it } from "vitest";
import { circuitsOf, clean, moveItem, updateCircuit, updateZones } from "../src/config";
import type { BoilerCardConfig } from "../src/types";

const base: BoilerCardConfig = { type: "custom:viessmann-boiler-card" };

describe("config helpers", () => {
  it("falls back to the boiler loop and radiant circuit", () => {
    const circuits = circuitsOf(base);
    expect(circuits.map((c) => c.circuit)).toEqual([1, 2]);
    expect(circuits[1].separated_by).toBe("heat_exchanger");
  });

  it("updates one circuit and keeps the others", () => {
    const next = updateCircuit(base, 2, { name: "Floors" });
    expect(next.circuits?.find((c) => c.circuit === 2)?.name).toBe("Floors");
    expect(next.circuits?.find((c) => c.circuit === 1)?.name).toBe("Boiler Loop");
  });

  it("sets the radiant circuit's zones and drops empty thermostats", () => {
    const next = updateZones(base, [{ name: "Den", thermostat: "" }, { name: "Loft", thermostat: "climate.loft" }]);
    expect(next.circuits?.find((c) => c.circuit === 2)?.zones).toEqual([
      { name: "Den" },
      { name: "Loft", thermostat: "climate.loft" },
    ]);
  });

  it("removes empty optional fields", () => {
    expect(clean({ ...base, title: "", device_id: "", asset_url: "" })).toEqual(base);
  });

  it("moves zones up and down within bounds", () => {
    expect(moveItem(["a", "b", "c"], 2, 1)).toEqual(["a", "c", "b"]);
    expect(moveItem(["a", "b"], 0, -1)).toEqual(["a", "b"]);
  });
});
