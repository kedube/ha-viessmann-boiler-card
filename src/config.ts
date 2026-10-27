import type { BoilerCardConfig, CircuitConfig, ZoneConfig } from "./types";

// Helpers shared by the card and its editor for reading and updating the config.

/** The owner's layout: a boiler loop, and a radiant circuit behind a heat exchanger. */
export function defaultCircuits(): CircuitConfig[] {
  return [
    { circuit: 1, name: "Boiler Loop", pump_label: "BOILER" },
    { circuit: 2, name: "Radiant", separated_by: "heat_exchanger", mixing_valve: true, pump_label: "RADIANT", zones: [] },
  ];
}

export function circuitsOf(config: BoilerCardConfig): CircuitConfig[] {
  return config.circuits?.length ? config.circuits : defaultCircuits();
}

export function updateCircuit(config: BoilerCardConfig, circuit: number, patch: Partial<CircuitConfig>): BoilerCardConfig {
  return clean({
    ...config,
    circuits: circuitsOf(config).map((c) => (c.circuit === circuit ? { ...c, ...patch } : c)),
  });
}

/** Replaces the zones of the circuit behind the heat exchanger. */
export function updateZones(config: BoilerCardConfig, zones: ZoneConfig[]): BoilerCardConfig {
  const radiant = circuitsOf(config).find((c) => c.separated_by === "heat_exchanger");
  return radiant ? updateCircuit(config, radiant.circuit, { zones }) : config;
}

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length) return items;
  const out = [...items];
  const [item] = out.splice(from, 1);
  out.splice(to, 0, item);
  return out;
}

/** Drops empty optional fields so the YAML stays short. */
export function clean(config: BoilerCardConfig): BoilerCardConfig {
  const out: BoilerCardConfig = { ...config };
  for (const key of ["title", "device_id", "asset_url"] as const) if (!out[key]) delete out[key];
  if (out.circuits) {
    out.circuits = out.circuits.map((c) => {
      const circuit = { ...c };
      if (!circuit.name) delete circuit.name;
      if (!circuit.pump_label) delete circuit.pump_label;
      if (circuit.zones) {
        circuit.zones = circuit.zones.map((z) => (z.thermostat ? z : { name: z.name }));
      }
      return circuit;
    });
  }
  return out;
}
