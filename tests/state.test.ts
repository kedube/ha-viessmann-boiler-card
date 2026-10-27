import { describe, expect, it } from "vitest";
import { FakeHass } from "../dev/fake-hass";
import { BOILER_DEVICE, buildFixture, DEV_CONFIG } from "../dev/fixtures";
import { SCENARIOS } from "../dev/scenarios";
import { evaluateSystem } from "../src/system/state";
import { discoverViCare } from "../src/vicare/discovery";

function evaluate(scenario: keyof typeof SCENARIOS) {
  const fake = new FakeHass();
  SCENARIOS[scenario].apply(fake);
  const hass = fake.snapshot();
  return evaluateSystem(hass, discoverViCare(hass, BOILER_DEVICE, buildFixture().registry), DEV_CONFIG);
}

describe("evaluateSystem", () => {
  it("reads the reference install as idle", () => {
    const st = evaluate("idle");
    expect(st.boilerC).toBe(66);
    expect(st.outsideC).toBe(15.9);
    expect(st.tank).toMatchObject({ c: 49.9, targetC: 49, charging: false, pumpOn: false });
    expect(st.burner.on).toBe(false);
    expect(st.burner.minutesPerStart).toBeCloseTo(10.47, 2);
  });

  it("keeps the radiant loop still while no zone calls, even with its pump on", () => {
    const st = evaluate("idle");
    expect(st.circuits.find((c) => c.circuit === 2)?.pumpOn).toBe(true);
    expect(st.loops.circuit2.flowing).toBe(false);
    expect(st.loops.boiler.flowing).toBe(true);
  });

  it("flows the radiant loop and calling zones only", () => {
    const st = evaluate("zones");
    expect(st.loops.circuit2.flowing).toBe(true);
    expect(st.loops["circuit2.zone1"].flowing).toBe(true); // Den
    expect(st.loops["circuit2.zone0"].flowing).toBe(false); // Garage
    expect(st.loops.circuit2.returnEstimated).toBe(true);
    expect(st.loops.circuit2.returnC).toBeCloseTo(35, 6);
  });

  it("flows the tank loop while charging", () => {
    const st = evaluate("hotWater");
    expect(st.loops.dhw.flowing).toBe(true);
    expect(st.burner).toMatchObject({ on: true, modulation: 76 });
  });

  it("stops everything in standby", () => {
    const st = evaluate("standby");
    expect(Object.values(st.loops).some((l) => l.flowing)).toBe(false);
  });
});
