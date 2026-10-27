import type { EntityRegistryEntry, HomeAssistant } from "../types";

// ViCare entities are matched by their translation keys. Heating circuits share
// one device; the circuit number is only visible in the entity's unique ID suffix.

const CIRCUIT_KEYS = new Set([
  "heating",
  "supply_temperature",
  "circulation_pump",
  "frost_protection",
  "heating_curve_shift",
  "heating_curve_slope",
  "normal_temperature",
  "reduced_temperature",
  "comfort_temperature",
  "normal_heating_temperature",
  "reduced_heating_temperature",
  "comfort_heating_temperature",
]);

const DEVICE_KEYS = new Set([
  "outside_temperature",
  "boiler_temperature",
  "boiler_supply_temperature",
  "return_temperature",
  "dhw_storage_temperature",
  "dhw_storage_top_temperature",
  "hotwater_out_temperature",
  "burner_modulation",
  "burner_hours",
  "burner_starts",
  "volumetric_flow",
  "burner",
  "domestic_hot_water_charging",
  "domestic_hot_water_pump",
  "domestic_hot_water_circulation_pump",
  "one_time_charge",
  "solar_pump",
  "dhw_temperature",
  "domestic_hot_water",
]);

export interface ViCareEntities {
  deviceId: string;
  /** Translation key → entity id. */
  device: Record<string, string>;
  /** Viessmann circuit number (1 = HC1) → translation key → entity id. */
  circuits: Record<number, Record<string, string>>;
  /** Every other ViCare entity on the device. */
  other: string[];
}

/** ViCare devices that have entities, the boiler (with heating circuits) first. */
export function vicareDevices(hass: HomeAssistant): string[] {
  const counts = new Map<string, { total: number; heating: number }>();
  for (const entry of Object.values(hass.entities)) {
    if (entry.platform !== "vicare" || !entry.device_id) continue;
    const c = counts.get(entry.device_id) ?? { total: 0, heating: 0 };
    c.total++;
    if (entry.translation_key === "heating") c.heating++;
    counts.set(entry.device_id, c);
  }
  return [...counts]
    .sort(([, a], [, b]) => b.heating - a.heating || b.total - a.total)
    .map(([id]) => id);
}

export function discoverViCare(
  hass: HomeAssistant,
  deviceId: string,
  registry: Record<string, EntityRegistryEntry> = {},
  overrides: Record<string, string> = {},
): ViCareEntities {
  const result: ViCareEntities = { deviceId, device: {}, circuits: {}, other: [] };
  const unnumbered = new Map<string, string[]>();

  for (const entry of Object.values(hass.entities)) {
    if (entry.platform !== "vicare" || entry.device_id !== deviceId) continue;
    const key = entry.translation_key ?? "";
    if (DEVICE_KEYS.has(key)) {
      result.device[key] ??= entry.entity_id;
    } else if (CIRCUIT_KEYS.has(key)) {
      const apiCircuit = circuitFromUniqueId(registry[entry.entity_id]?.unique_id);
      if (apiCircuit === null) {
        unnumbered.set(key, [...(unnumbered.get(key) ?? []), entry.entity_id]);
      } else {
        (result.circuits[apiCircuit + 1] ??= {})[key] ??= entry.entity_id;
      }
    } else {
      result.other.push(entry.entity_id);
    }
  }

  // Without registry data, Home Assistant's entity id order (x, x_2, x_3…) follows the circuits.
  for (const [key, ids] of unnumbered) {
    ids.sort(byEntityIdSuffix).forEach((id, i) => {
      (result.circuits[i + 1] ??= {})[key] ??= id;
    });
  }

  for (const [role, entityId] of Object.entries(overrides)) {
    const m = /^circuit(\d+)\.(.+)$/.exec(role);
    if (m) (result.circuits[Number(m[1])] ??= {})[m[2]] = entityId;
    else result.device[role] = entityId;
  }

  result.other.sort();
  return result;
}

/** Fetches full registry entries (with unique IDs) for the device's ViCare entities. */
export async function fetchRegistryEntries(
  hass: HomeAssistant,
  deviceId: string,
): Promise<Record<string, EntityRegistryEntry>> {
  const entityIds = Object.values(hass.entities)
    .filter((e) => e.platform === "vicare" && e.device_id === deviceId)
    .map((e) => e.entity_id);
  if (!entityIds.length) return {};
  const response = await hass.callWS<Record<string, EntityRegistryEntry | null> | EntityRegistryEntry[]>({
    type: "config/entity_registry/get_entries",
    entity_ids: entityIds,
  });
  const out: Record<string, EntityRegistryEntry> = {};
  const entries = Array.isArray(response) ? response : Object.values(response ?? {});
  for (const entry of entries) if (entry) out[entry.entity_id] = entry;
  return out;
}

function circuitFromUniqueId(uniqueId: string | undefined): number | null {
  const m = uniqueId ? /-(\d+)$/.exec(uniqueId) : null;
  return m ? Number(m[1]) : null;
}

function byEntityIdSuffix(a: string, b: string): number {
  const n = (id: string) => Number(/_(\d+)$/.exec(id)?.[1] ?? 1);
  return n(a) - n(b) || a.localeCompare(b);
}
