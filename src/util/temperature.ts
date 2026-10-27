import type { HomeAssistant } from "../types";

export type Rgb = [number, number, number];

export function toCelsius(value: number, unit: string | undefined): number {
  return unit === "°F" ? ((value - 32) * 5) / 9 : value;
}

export function fromCelsius(celsius: number, unit: string | undefined): number {
  return unit === "°F" ? (celsius * 9) / 5 + 32 : celsius;
}

/** Reads a temperature sensor or climate attribute and returns °C, or null when unavailable. */
export function readCelsius(hass: HomeAssistant, entityId: string | undefined, attribute?: string): number | null {
  if (!entityId) return null;
  const entity = hass.states[entityId];
  if (!entity) return null;
  const raw = attribute ? entity.attributes[attribute] : entity.state;
  const value = typeof raw === "number" ? raw : Number.parseFloat(String(raw));
  if (!Number.isFinite(value)) return null;
  // Climate and water heater attributes follow the system unit; sensors carry their own.
  const unit = attribute
    ? hass.config.unit_system.temperature
    : (entity.attributes.unit_of_measurement as string | undefined) ?? hass.config.unit_system.temperature;
  return toCelsius(value, unit);
}

export function formatTemperature(celsius: number | null, unit: string, digits = 0): string {
  if (celsius === null) return "–";
  return `${fromCelsius(celsius, unit).toFixed(digits)} ${unit}`;
}

// Flow colours: the hot (supply) side of every loop runs orange to red with
// temperature, the cold (return) side in blues, so the two sides read at a glance.
const WARM: Array<[number, Rgb]> = [
  [30, [255, 176, 64]],
  [50, [255, 132, 40]],
  [75, [236, 70, 44]],
];
const COOL: Array<[number, Rgb]> = [
  [15, [40, 104, 245]],
  [45, [64, 148, 255]],
  [70, [104, 186, 255]],
];

export function flowRgb(side: "supply" | "return", celsius: number | null): Rgb {
  return side === "return" ? ramp(COOL, celsius ?? 30) : ramp(WARM, celsius ?? 50);
}

function ramp(stops: Array<[number, Rgb]>, celsius: number): Rgb {
  if (celsius <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    const [t1, c1] = stops[i];
    if (celsius <= t1) {
      const [t0, c0] = stops[i - 1];
      const k = (celsius - t0) / (t1 - t0);
      return [0, 1, 2].map((j) => Math.round(c0[j] + (c1[j] - c0[j]) * k)) as Rgb;
    }
  }
  return stops[stops.length - 1][1];
}
