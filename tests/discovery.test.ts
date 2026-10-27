import { describe, expect, it } from "vitest";
import { FakeHass } from "../dev/fake-hass";
import { BOILER_DEVICE, buildFixture } from "../dev/fixtures";
import { discoverViCare, fetchRegistryEntries, vicareDevices } from "../src/vicare/discovery";

describe("discoverViCare", () => {
  const hass = new FakeHass().snapshot();
  const { registry } = buildFixture();

  it("finds the boiler device", () => {
    expect(vicareDevices(hass)).toEqual([BOILER_DEVICE]);
  });

  it("assigns circuits from registry unique IDs", () => {
    const v = discoverViCare(hass, BOILER_DEVICE, registry);
    expect(v.circuits[1].heating).toBe("climate.vscotho1_200_20_heating");
    expect(v.circuits[2].heating).toBe("climate.vscotho1_200_20_heating_2");
    expect(v.circuits[2].supply_temperature).toBe("sensor.vscotho1_200_20_supply_temperature_2");
    expect(v.circuits[1].heating_curve_shift).toBe("number.vscotho1_200_20_heating_curve_shift");
    expect(v.device.burner).toBe("binary_sensor.vscotho1_200_20_burner");
    expect(v.device.domestic_hot_water).toBe("water_heater.vscotho1_200_20_domestic_hot_water");
    expect(v.other).toContain("sensor.vscotho1_200_20_hotwater_max_temperature");
  });

  it("falls back to entity id order without registry data", () => {
    const v = discoverViCare(hass, BOILER_DEVICE);
    expect(v.circuits[1].circulation_pump).toBe("binary_sensor.vscotho1_200_20_circulation_pump");
    expect(v.circuits[2].circulation_pump).toBe("binary_sensor.vscotho1_200_20_circulation_pump_2");
  });

  it("applies manual overrides", () => {
    const v = discoverViCare(hass, BOILER_DEVICE, registry, {
      return_temperature: "sensor.pipe_probe",
      "circuit2.supply_temperature": "sensor.radiant_probe",
    });
    expect(v.device.return_temperature).toBe("sensor.pipe_probe");
    expect(v.circuits[2].supply_temperature).toBe("sensor.radiant_probe");
  });

  it("reads unique IDs over the websocket", async () => {
    const entries = await fetchRegistryEntries(hass, BOILER_DEVICE);
    expect(entries["climate.vscotho1_200_20_heating_2"].unique_id).toMatch(/-heating-1$/);
    expect(Object.keys(entries).every((id) => !id.startsWith("climate.garage"))).toBe(true);
  });
});
