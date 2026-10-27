import type { FakeHass } from "./fake-hass";
import { ENTITY as E, ZONES } from "./fixtures";

export interface Scenario {
  label: string;
  apply(h: FakeHass): void;
}

const callFor = (h: FakeHass, names: string[]) => {
  for (const z of ZONES) h.set(z.entity, undefined, { hvac_action: names.includes(z.name) ? "heating" : "idle" });
};

const burner = (h: FakeHass, modulation: number, boiler: number) => {
  h.set(E.burner, "on");
  h.set(E.modulation, String(modulation));
  h.set(E.boiler, boiler.toFixed(1));
  h.set(E.supply1, boiler.toFixed(1));
};

export const SCENARIOS: Record<string, Scenario> = {
  idle: {
    label: "Idle (as in diagnostics)",
    apply: (h) => h.reset(),
  },
  zones: {
    label: "Three zones heating",
    apply: (h) => {
      h.reset();
      burner(h, 38, 68.5);
      h.set(E.supply2, "43.0");
      callFor(h, ["Den", "Living Room", "Hallway"]);
    },
  },
  hotWater: {
    label: "Hot water charging",
    apply: (h) => {
      h.reset();
      burner(h, 76, 71.0);
      h.set(E.charging, "on");
      h.set(E.dhwPump, "on");
      h.set(E.tank, "41.5");
      h.set(E.waterHeater, undefined, { current_temperature: 41.5 });
    },
  },
  allZones: {
    label: "All zones and hot water",
    apply: (h) => {
      h.reset();
      burner(h, 92, 72.5);
      h.set(E.supply2, "47.5");
      h.set(E.charging, "on");
      h.set(E.dhwPump, "on");
      h.set(E.tank, "44.0");
      callFor(
        h,
        ZONES.map((z) => z.name),
      );
    },
  },
  standby: {
    label: "Summer standby",
    apply: (h) => {
      h.reset();
      h.set(E.pump1, "off");
      h.set(E.pump2, "off");
      h.set(E.boiler, "34.0");
      h.set(E.supply1, "34.0");
      h.set(E.supply2, "24.5");
    },
  },
};
