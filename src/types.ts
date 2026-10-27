// Minimal Home Assistant frontend types used by the card.

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
}

/** Entry from `hass.entities` (entity registry, display subset). */
export interface EntityRegistryDisplayEntry {
  entity_id: string;
  name?: string | null;
  device_id?: string;
  area_id?: string;
  platform?: string;
  translation_key?: string;
  entity_category?: "config" | "diagnostic";
  hidden?: boolean;
}

/** Full entity registry entry, as returned by `config/entity_registry/get_entries`. */
export interface EntityRegistryEntry {
  entity_id: string;
  unique_id: string;
  platform: string;
  device_id?: string | null;
  translation_key?: string | null;
}

export interface DeviceRegistryEntry {
  id: string;
  name: string | null;
  name_by_user?: string | null;
  manufacturer?: string | null;
  model?: string | null;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  entities: Record<string, EntityRegistryDisplayEntry>;
  devices: Record<string, DeviceRegistryEntry>;
  config: { unit_system: { temperature: string } };
  themes?: { darkMode?: boolean };
  language?: string;
  user?: { is_admin: boolean };
  callService(domain: string, service: string, data?: Record<string, unknown>): Promise<unknown>;
  callWS<T>(msg: { type: string; [key: string]: unknown }): Promise<T>;
}

export interface ZoneConfig {
  name: string;
  /** Climate entity whose `hvac_action` tells when the zone calls for heat. */
  thermostat?: string;
}

export interface CircuitConfig {
  /** Viessmann numbering: 1 = HC1 (ViCare API circuit 0). */
  circuit: number;
  name?: string;
  pump_label?: string;
  separated_by?: "heat_exchanger";
  mixing_valve?: boolean;
  zones?: ZoneConfig[];
}

export interface HotWaterConfig {
  tank?: string;
  charging?: "pump" | "three_way_valve" | "combi";
  recirculation?: boolean;
}

export interface BoilerCardConfig {
  type: string;
  title?: string;
  device_id?: string;
  model?: string;
  layout?: "plant-room";
  /** Base URL of the render asset pack (one folder per component). */
  asset_url?: string;
  hot_water?: HotWaterConfig;
  circuits?: CircuitConfig[];
  /** Manual entity overrides, e.g. `boiler_temperature` or `circuit2.supply_temperature`. */
  entities?: Record<string, string>;
  animation?: boolean;
}
