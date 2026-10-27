import { describe, expect, it } from "vitest";
import type { HomeAssistant } from "../src/types";
import { flowRgb, formatTemperature, fromCelsius, readCelsius, toCelsius } from "../src/util/temperature";

const hass = (unit: string, states: HomeAssistant["states"]) =>
  ({ states, config: { unit_system: { temperature: unit } } }) as unknown as HomeAssistant;

const entity = (state: string, attributes: Record<string, unknown> = {}) => ({
  entity_id: "x.y",
  state,
  attributes,
  last_changed: "",
  last_updated: "",
});

describe("temperature", () => {
  it("converts between °C and °F", () => {
    expect(toCelsius(150.8, "°F")).toBeCloseTo(66, 6);
    expect(fromCelsius(66, "°F")).toBeCloseTo(150.8, 6);
    expect(toCelsius(66, "°C")).toBe(66);
  });

  it("reads sensors in their own unit and attributes in the system unit", () => {
    const h = hass("°F", {
      "sensor.a": entity("150.8", { unit_of_measurement: "°F" }),
      "climate.b": entity("heat", { current_temperature: 69.8 }),
      "sensor.c": entity("unavailable", { unit_of_measurement: "°C" }),
    });
    expect(readCelsius(h, "sensor.a")).toBeCloseTo(66, 6);
    expect(readCelsius(h, "climate.b", "current_temperature")).toBeCloseTo(21, 6);
    expect(readCelsius(h, "sensor.c")).toBeNull();
    expect(readCelsius(h, undefined)).toBeNull();
  });

  it("formats in the display unit", () => {
    expect(formatTemperature(49.9, "°C", 1)).toBe("49.9 °C");
    expect(formatTemperature(20, "°F")).toBe("68 °F");
    expect(formatTemperature(null, "°C")).toBe("–");
  });

  it("colours the hot side orange and the cold side blue at any temperature", () => {
    for (const c of [20, 40, 70]) {
      const [hr, , hb] = flowRgb("supply", c);
      const [cr, , cb] = flowRgb("return", c);
      expect(hr).toBeGreaterThan(hb);
      expect(cb).toBeGreaterThan(cr);
    }
  });

  it("deepens the hot side toward red as it gets hotter", () => {
    expect(flowRgb("supply", 75)[1]).toBeLessThan(flowRgb("supply", 35)[1]);
    expect(flowRgb("supply", 5)).toEqual(flowRgb("supply", 30));
    expect(flowRgb("return", null)).toEqual(flowRgb("return", 30));
  });
});
