import type { BoilerCardConfig, CircuitConfig, HomeAssistant } from "../types";
import { readCelsius } from "../util/temperature";
import { matchThermostat } from "./thermostats";
import type { ViCareEntities } from "../vicare/discovery";

export interface LoopState {
  flowing: boolean;
  supplyC: number | null;
  returnC: number | null;
  /** True when no return sensor exists and returnC is an assumed value. */
  returnEstimated: boolean;
}

export interface ZoneState {
  name: string;
  entityId?: string;
  calling: boolean;
  currentC: number | null;
  targetC: number | null;
}

export interface CircuitState {
  circuit: number;
  name: string;
  pumpOn: boolean;
  supplyC: number | null;
  separated: boolean;
  zones: ZoneState[];
}

export interface SystemState {
  outsideC: number | null;
  boilerC: number | null;
  burner: {
    on: boolean;
    modulation: number | null;
    hours: number | null;
    starts: number | null;
    minutesPerStart: number | null;
  };
  tank: { c: number | null; targetC: number | null; charging: boolean; pumpOn: boolean };
  circuits: CircuitState[];
  /** Keyed by loop: `boiler`, `dhw`, `tap`, `circuit<n>`, `circuit<n>.zone<i>`. */
  loops: Record<string, LoopState>;
}

// Assumed supply/return differences when the controller has no return sensor.
const BOILER_LOOP_DELTA_C = 11;
const RADIANT_LOOP_DELTA_C = 8;
const COLD_MAINS_C = 12;

export function evaluateSystem(hass: HomeAssistant, vicare: ViCareEntities, config: BoilerCardConfig): SystemState {
  const d = vicare.device;
  const isOn = (id?: string) => !!id && hass.states[id]?.state === "on";
  const num = (id?: string) => {
    const v = Number.parseFloat(id ? (hass.states[id]?.state ?? "") : "");
    return Number.isFinite(v) ? v : null;
  };

  const boilerC = readCelsius(hass, d.boiler_temperature) ?? readCelsius(hass, d.boiler_supply_temperature);
  const hours = num(d.burner_hours);
  const starts = num(d.burner_starts);
  const burner = {
    on: isOn(d.burner),
    modulation: num(d.burner_modulation),
    hours,
    starts,
    minutesPerStart: hours !== null && starts ? (hours * 60) / starts : null,
  };

  const tank = {
    c: readCelsius(hass, d.dhw_storage_temperature) ?? readCelsius(hass, d.domestic_hot_water, "current_temperature"),
    targetC: readCelsius(hass, d.domestic_hot_water, "temperature") ?? readCelsius(hass, d.dhw_temperature),
    charging: isOn(d.domestic_hot_water_charging),
    pumpOn: isOn(d.domestic_hot_water_pump),
  };

  const circuitConfigs: CircuitConfig[] = config.circuits?.length
    ? config.circuits
    : Object.keys(vicare.circuits).map((n) => ({ circuit: Number(n) }));
  const circuits: CircuitState[] = circuitConfigs.map((cc) => {
    const e = vicare.circuits[cc.circuit] ?? {};
    return {
      circuit: cc.circuit,
      name: cc.name ?? `Circuit ${cc.circuit}`,
      pumpOn: isOn(e.circulation_pump),
      supplyC: readCelsius(hass, e.supply_temperature),
      separated: cc.separated_by === "heat_exchanger",
      zones: (cc.zones ?? []).map((z) => {
        const entityId = z.thermostat ?? matchThermostat(hass, z.name);
        return {
          name: z.name,
          entityId,
          calling: hass.states[entityId ?? ""]?.attributes.hvac_action === "heating",
          currentC: readCelsius(hass, entityId, "current_temperature"),
          // Thermostats in heat/cool mode keep their heating setpoint in target_temp_low.
          targetC: readCelsius(hass, entityId, "temperature") ?? readCelsius(hass, entityId, "target_temp_low"),
        };
      }),
    };
  });

  const loops: Record<string, LoopState> = {};
  const primary = circuits.find((c) => !c.separated);
  const boilerSupply = boilerC ?? primary?.supplyC ?? null;
  loops.boiler = withReturn(!!primary?.pumpOn, boilerSupply, readCelsius(hass, d.return_temperature), BOILER_LOOP_DELTA_C);
  loops.dhw = {
    flowing: tank.pumpOn || tank.charging,
    supplyC: boilerSupply,
    returnC: tank.c !== null && boilerSupply !== null ? Math.min(boilerSupply, tank.c + 4) : tank.c,
    returnEstimated: true,
  };
  for (const c of circuits.filter((c) => c.separated)) {
    // The circuit pump can report "on" with every zone valve closed; zone calls gate the flow.
    const anyCall = c.zones.length ? c.zones.some((z) => z.calling) : true;
    loops[`circuit${c.circuit}`] = withReturn(c.pumpOn && anyCall, c.supplyC, null, RADIANT_LOOP_DELTA_C);
    c.zones.forEach((z, i) => {
      loops[`circuit${c.circuit}.zone${i}`] = withReturn(c.pumpOn && z.calling, c.supplyC, null, RADIANT_LOOP_DELTA_C);
    });
  }
  loops.tap = { flowing: false, supplyC: tank.c, returnC: COLD_MAINS_C, returnEstimated: true };

  return { outsideC: readCelsius(hass, d.outside_temperature), boilerC, burner, tank, circuits, loops };
}

function withReturn(flowing: boolean, supplyC: number | null, measuredC: number | null, deltaC: number): LoopState {
  if (measuredC !== null) return { flowing, supplyC, returnC: measuredC, returnEstimated: false };
  return { flowing, supplyC, returnC: supplyC === null ? null : supplyC - deltaC, returnEstimated: true };
}
