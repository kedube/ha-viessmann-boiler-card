import { describe, expect, it } from "vitest";
import { FakeHass } from "../dev/fake-hass";
import { BOILER_DEVICE, buildFixture, DEV_CONFIG } from "../dev/fixtures";
import { evaluateSystem } from "../src/system/state";
import { matchThermostat, thermostatIds, zoneNameFor } from "../src/system/thermostats";
import { discoverViCare } from "../src/vicare/discovery";

describe("thermostat matching", () => {
  const hass = new FakeHass().snapshot();

  it("finds each zone's thermostat by name", () => {
    expect(matchThermostat(hass, "Living Room")).toBe("climate.living_room");
    expect(matchThermostat(hass, "Master Bath")).toBe("climate.master_bath");
    expect(matchThermostat(hass, "Bathroom")).toBe("climate.bathroom");
    expect(matchThermostat(hass, "Workshop")).toBeUndefined();
  });

  it("never matches ViCare's own heating circuits", () => {
    expect(thermostatIds(hass).some((id) => id.includes("vscotho1"))).toBe(false);
    expect(matchThermostat(hass, "Heating")).toBeUndefined();
  });

  it("names zones after their thermostat without the word Thermostat", () => {
    expect(zoneNameFor(hass, "climate.living_room")).toBe("Living Room");
  });

  it("reads the heating setpoint of a thermostat in heat/cool mode", () => {
    const st = evaluateSystem(hass, discoverViCare(hass, BOILER_DEVICE, buildFixture().registry), DEV_CONFIG);
    const living = st.circuits.find((c) => c.separated)!.zones.find((z) => z.name === "Living Room")!;
    expect(living.entityId).toBe("climate.living_room");
    expect(living.targetC).toBeCloseTo(20.8, 6);
  });
});
