import { describe, expect, it } from "vitest";
import { supplyTarget } from "../src/util/heating-curve";

describe("supplyTarget", () => {
  it("matches the reference boiler's Boiler Loop at 15.9 °C outside", () => {
    // Slope 1.2, shift 20, normal 29 °C; the boiler read 66 °C with the burner idle.
    expect(supplyTarget({ slope: 1.2, shift: 20, roomSetpoint: 29 }, 15.9)).toBeCloseTo(67.9, 1);
  });

  it("is the room setpoint plus shift when outside equals the setpoint", () => {
    expect(supplyTarget({ slope: 1.4, shift: 5, roomSetpoint: 20 }, 20)).toBeCloseTo(25, 6);
  });

  it("rises as it gets colder and with a steeper slope", () => {
    const curve = { slope: 1.4, shift: 0, roomSetpoint: 20 };
    expect(supplyTarget(curve, -10)).toBeGreaterThan(supplyTarget(curve, 5));
    expect(supplyTarget({ ...curve, slope: 1.8 }, -10)).toBeGreaterThan(supplyTarget(curve, -10));
  });
});
