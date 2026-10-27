import type { HomeAssistant } from "../types";

// Zones can name their thermostat explicitly; otherwise the card looks for a
// climate entity whose name matches the zone, e.g. "Living Room" finds
// climate.living_room or a "Living Room Thermostat". ViCare's own heating
// circuits are never matched.

const normalize = (s: string) => s.toLowerCase().replace(/thermostat/g, "").replace(/[^a-z0-9]/g, "");

const cache = new WeakMap<object, Map<string, string | undefined>>();

export function matchThermostat(hass: HomeAssistant, zoneName: string): string | undefined {
  let byName = cache.get(hass.entities);
  if (!byName) cache.set(hass.entities, (byName = new Map()));
  if (!byName.has(zoneName)) byName.set(zoneName, findThermostat(hass, zoneName));
  return byName.get(zoneName);
}

function findThermostat(hass: HomeAssistant, zoneName: string): string | undefined {
  const want = normalize(zoneName);
  if (!want) return undefined;
  let best: { id: string; score: number; length: number } | undefined;
  for (const id of thermostatIds(hass)) {
    const names = [id.slice("climate.".length), String(hass.states[id]?.attributes.friendly_name ?? "")].map(normalize);
    const exact = names.includes(want);
    const prefix = names.some((n) => n.startsWith(want));
    if (!exact && !prefix) continue;
    const candidate = { id, score: exact ? 2 : 1, length: Math.min(...names.map((n) => n.length)) };
    if (!best || candidate.score > best.score || (candidate.score === best.score && candidate.length < best.length)) {
      best = candidate;
    }
  }
  return best?.id;
}

/** Climate entities that aren't ViCare heating circuits. */
export function thermostatIds(hass: HomeAssistant): string[] {
  return Object.keys(hass.states)
    .filter((id) => id.startsWith("climate.") && hass.entities[id]?.platform !== "vicare")
    .sort();
}

/** Thermostats to offer as new zones: the Nest ones when there are any, otherwise every candidate. */
export function zoneThermostats(hass: HomeAssistant): string[] {
  const all = thermostatIds(hass);
  const nest = all.filter((id) => hass.entities[id]?.platform === "nest");
  return nest.length ? nest : all;
}

/** A zone name from a thermostat's friendly name, without a trailing "Thermostat". */
export function zoneNameFor(hass: HomeAssistant, entityId: string): string {
  const name = String(hass.states[entityId]?.attributes.friendly_name ?? entityId.slice("climate.".length));
  return name.replace(/\s*thermostat$/i, "").trim() || name;
}
