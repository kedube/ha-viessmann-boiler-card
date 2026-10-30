import type {
  BoilerCardConfig,
  DeviceRegistryEntry,
  EntityRegistryDisplayEntry,
  EntityRegistryEntry,
  HassEntity,
} from "../src/types";

// Reference installation, transcribed from the owner's ViCare and Nest
// diagnostics (2026-10-26): Vitocrossal 300 CU3A 199 with a Vitotronic 200
// (HO1) on a Vitoconnect OPTO2, circuit 1 "Boiler Loop", circuit 2 "Radiant
// Staple Up" behind a plate heat exchanger, a Vitocell 300-V, and seven
// Nest-controlled radiant zones. Serial numbers are made up.

export const BOILER_DEVICE = "dev-vicare-boiler";
const UID = "0000000000000000_0000000000000000"; // gateway_device serials
const P = "vscotho1_200_20";

interface Def {
  id: string;
  state: string;
  attrs?: Record<string, unknown>;
  /** ViCare translation key. */
  tk?: string;
  /** Unique ID suffix after the device identifier. */
  uid?: string;
  platform?: string;
  device?: string;
}

const celsius = { unit_of_measurement: "°C", device_class: "temperature", state_class: "measurement" };

function circuitClimate(supply: number, normal: number, shift: number): Record<string, unknown> {
  return {
    hvac_modes: ["off", "auto", "heat"],
    hvac_mode: "auto",
    min_temp: 3,
    max_temp: 37,
    target_temp_step: 1,
    preset_modes: ["comfort", "eco", "home", "sleep"],
    preset_mode: "home",
    current_temperature: supply,
    temperature: normal,
    vicare_programs: ["comfort", "eco", "external", "normal", "reduced", "standby"],
    active_vicare_program: "normal",
    active_vicare_mode: "dhwAndHeating",
    vicare_modes: ["dhw", "dhwAndHeating", "forcedNormal", "forcedReduced", "standby"],
    heating_curve_slope: 1.2,
    heating_curve_shift: shift,
  };
}

const number = (min: number, max: number, step: number, unit?: string) => ({
  min,
  max,
  step,
  mode: "auto",
  ...(unit ? { unit_of_measurement: unit } : {}),
});

const VICARE: Def[] = [
  { id: `climate.${P}_heating`, tk: "heating", uid: "heating-0", state: "auto", attrs: circuitClimate(66, 29, 20) },
  { id: `climate.${P}_heating_2`, tk: "heating", uid: "heating-1", state: "auto", attrs: circuitClimate(36.5, 29, 8) },
  {
    id: `water_heater.${P}_domestic_hot_water`,
    tk: "domestic_hot_water",
    uid: "0",
    state: "on",
    attrs: {
      min_temp: 10,
      max_temp: 60,
      target_temp_step: 1,
      operation_list: ["off", "on"],
      operation_mode: "on",
      current_temperature: 49.9,
      temperature: 49,
    },
  },
  { id: `sensor.${P}_outside_temperature`, tk: "outside_temperature", uid: "outside_temperature", state: "15.9", attrs: celsius },
  { id: `sensor.${P}_boiler_temperature`, tk: "boiler_temperature", uid: "boiler_temperature", state: "66.0", attrs: celsius },
  { id: `sensor.${P}_supply_temperature`, tk: "supply_temperature", uid: "supply_temperature-0", state: "66.0", attrs: celsius },
  { id: `sensor.${P}_supply_temperature_2`, tk: "supply_temperature", uid: "supply_temperature-1", state: "36.5", attrs: celsius },
  { id: `sensor.${P}_dhw_storage_temperature`, tk: "dhw_storage_temperature", uid: "dhw_storage_temperature", state: "49.9", attrs: celsius },
  { id: `sensor.${P}_hotwater_max_temperature`, tk: "hotwater_max_temperature", uid: "hotwater_max_temperature", state: "60", attrs: celsius },
  { id: `sensor.${P}_hotwater_min_temperature`, tk: "hotwater_min_temperature", uid: "hotwater_min_temperature", state: "10", attrs: celsius },
  { id: `sensor.${P}_burner_modulation`, tk: "burner_modulation", uid: "burner_modulation-0", state: "0", attrs: { unit_of_measurement: "%" } },
  { id: `sensor.${P}_burner_hours`, tk: "burner_hours", uid: "burner_hours-0", state: "3216", attrs: { unit_of_measurement: "h" } },
  { id: `sensor.${P}_burner_starts`, tk: "burner_starts", uid: "burner_starts-0", state: "18435" },
  { id: `binary_sensor.${P}_circulation_pump`, tk: "circulation_pump", uid: "circulationpump_active-0", state: "on" },
  { id: `binary_sensor.${P}_circulation_pump_2`, tk: "circulation_pump", uid: "circulationpump_active-1", state: "on" },
  { id: `binary_sensor.${P}_frost_protection`, tk: "frost_protection", uid: "frost_protection_active-0", state: "off" },
  { id: `binary_sensor.${P}_frost_protection_2`, tk: "frost_protection", uid: "frost_protection_active-1", state: "off" },
  { id: `binary_sensor.${P}_burner`, tk: "burner", uid: "burner_active-0", state: "off" },
  { id: `binary_sensor.${P}_dhw_charging`, tk: "domestic_hot_water_charging", uid: "charging_active", state: "off" },
  {
    id: `binary_sensor.${P}_dhw_circulation_pump`,
    tk: "domestic_hot_water_circulation_pump",
    uid: "dhw_circulationpump_active",
    state: "on",
  },
  { id: `binary_sensor.${P}_dhw_pump`, tk: "domestic_hot_water_pump", uid: "dhw_pump_active", state: "off" },
  { id: `number.${P}_heating_curve_shift`, tk: "heating_curve_shift", uid: "heating curve shift-0", state: "20", attrs: number(-13, 40, 1) },
  { id: `number.${P}_heating_curve_shift_2`, tk: "heating_curve_shift", uid: "heating curve shift-1", state: "8", attrs: number(-13, 40, 1) },
  { id: `number.${P}_heating_curve_slope`, tk: "heating_curve_slope", uid: "heating curve slope-0", state: "1.2", attrs: number(0.2, 3.5, 0.1) },
  { id: `number.${P}_heating_curve_slope_2`, tk: "heating_curve_slope", uid: "heating curve slope-1", state: "1.2", attrs: number(0.2, 3.5, 0.1) },
  { id: `number.${P}_normal_temperature`, tk: "normal_temperature", uid: "normal_temperature-0", state: "29", attrs: number(3, 37, 1, "°C") },
  { id: `number.${P}_normal_temperature_2`, tk: "normal_temperature", uid: "normal_temperature-1", state: "29", attrs: number(3, 37, 1, "°C") },
  { id: `number.${P}_reduced_temperature`, tk: "reduced_temperature", uid: "reduced_temperature-0", state: "21", attrs: number(3, 37, 1, "°C") },
  { id: `number.${P}_reduced_temperature_2`, tk: "reduced_temperature", uid: "reduced_temperature-1", state: "18", attrs: number(3, 37, 1, "°C") },
  { id: `number.${P}_comfort_temperature`, tk: "comfort_temperature", uid: "comfort_temperature-0", state: "24", attrs: number(4, 37, 1, "°C") },
  { id: `number.${P}_comfort_temperature_2`, tk: "comfort_temperature", uid: "comfort_temperature-1", state: "20", attrs: number(4, 37, 1, "°C") },
  { id: `number.${P}_dhw_temperature`, tk: "dhw_temperature", uid: "dhw_temperature", state: "49", attrs: number(10, 60, 1, "°C") },
];

export const ZONES: Array<{ name: string; entity: string; current: number; target: number; heatCool?: boolean }> = [
  { name: "Garage", entity: "climate.garage", current: 24.6, target: 15.6 },
  { name: "Den", entity: "climate.den", current: 21.3, target: 20.6 },
  { name: "Living Room", entity: "climate.living_room", current: 21.4, target: 20.8, heatCool: true },
  { name: "Entryway", entity: "climate.entryway", current: 21.3, target: 20.6 },
  { name: "Bathroom", entity: "climate.bathroom", current: 21.4, target: 20.6 },
  { name: "Hallway", entity: "climate.hallway", current: 21.2, target: 20.6 },
  { name: "Master Bath", entity: "climate.master_bath", current: 21.4, target: 20.6 },
];

const NEST: Def[] = ZONES.map((z) => ({
  id: z.entity,
  platform: "nest",
  device: `dev-nest-${z.entity.split(".")[1]}`,
  state: z.heatCool ? "heat_cool" : "heat",
  attrs: {
    friendly_name: `${z.name} Thermostat`,
    hvac_modes: z.heatCool ? ["heat", "cool", "heat_cool", "off"] : ["heat", "off"],
    hvac_action: "idle",
    current_temperature: z.current,
    current_humidity: 52,
    min_temp: 9,
    max_temp: 32,
    ...(z.heatCool ? { target_temp_low: z.target, target_temp_high: 24.9 } : { temperature: z.target }),
  },
}));

const now = "2026-10-26T21:30:00+00:00";

export function buildFixture() {
  const states: Record<string, HassEntity> = {};
  const entities: Record<string, EntityRegistryDisplayEntry> = {};
  const registry: Record<string, EntityRegistryEntry> = {};
  for (const def of [...VICARE, ...NEST]) {
    const platform = def.platform ?? "vicare";
    const device = def.device ?? BOILER_DEVICE;
    states[def.id] = {
      entity_id: def.id,
      state: def.state,
      attributes: { friendly_name: friendlyName(def.id), ...def.attrs },
      last_changed: now,
      last_updated: now,
    };
    entities[def.id] = { entity_id: def.id, platform, device_id: device, translation_key: def.tk };
    registry[def.id] = {
      entity_id: def.id,
      platform,
      device_id: device,
      translation_key: def.tk ?? null,
      unique_id: def.uid ? `${UID}-${def.uid}` : def.id,
    };
  }
  const devices: Record<string, DeviceRegistryEntry> = {
    [BOILER_DEVICE]: { id: BOILER_DEVICE, name: "VScotHO1 200 20", manufacturer: "Viessmann", model: "VScotHO1 200 20" },
    ...Object.fromEntries(
      NEST.map((n) => [n.device!, { id: n.device!, name: String(n.attrs?.friendly_name), manufacturer: "Google Nest" }]),
    ),
  };
  return { states, entities, registry, devices };
}

export const DEV_CONFIG: BoilerCardConfig = {
  type: "custom:viessmann-boiler-card",
  device_id: BOILER_DEVICE,
  model: "vitocrossal-300-cu3a-199",
  asset_url: "/renders/",
  hot_water: { tank: "vitocell-300-v-56", charging: "pump", recirculation: false },
  circuits: [
    { circuit: 1, name: "Boiler Loop", pump_label: "BOILER" },
    {
      circuit: 2,
      name: "Radiant Staple Up",
      separated_by: "heat_exchanger",
      mixing_valve: true,
      pump_label: "RADIANT",
      // No thermostat IDs: each zone finds its Nest by name, as on the real system.
      zones: ZONES.map((z) => ({ name: z.name })),
    },
  ],
};

export const ENTITY = {
  burner: `binary_sensor.${P}_burner`,
  burnerHours: `sensor.${P}_burner_hours`,
  modulation: `sensor.${P}_burner_modulation`,
  boiler: `sensor.${P}_boiler_temperature`,
  supply1: `sensor.${P}_supply_temperature`,
  supply2: `sensor.${P}_supply_temperature_2`,
  pump1: `binary_sensor.${P}_circulation_pump`,
  pump2: `binary_sensor.${P}_circulation_pump_2`,
  charging: `binary_sensor.${P}_dhw_charging`,
  dhwPump: `binary_sensor.${P}_dhw_pump`,
  tank: `sensor.${P}_dhw_storage_temperature`,
  waterHeater: `water_heater.${P}_domestic_hot_water`,
  climate1: `climate.${P}_heating`,
  climate2: `climate.${P}_heating_2`,
};

function friendlyName(entityId: string): string {
  const [, object] = entityId.split(".");
  const name = object.replace(`${P}_`, "").replace(/_/g, " ");
  return `VScotHO1 200 20 ${name.charAt(0).toUpperCase()}${name.slice(1)}`;
}
