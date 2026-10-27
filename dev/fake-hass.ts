import type { HassEntity, HomeAssistant } from "../src/types";
import { buildFixture } from "./fixtures";

const TEMPERATURE_ATTRS = ["current_temperature", "temperature", "target_temp_low", "target_temp_high", "min_temp", "max_temp"];

/** A stand-in for Home Assistant's `hass` object, backed by the fixture. */
export class FakeHass {
  unit: "°C" | "°F" = "°C";
  dark = false;
  readonly log: string[] = [];
  private fixture = buildFixture();
  private listeners: Array<() => void> = [];

  reset(): void {
    this.fixture = { ...buildFixture(), entities: this.fixture.entities };
  }

  onChange(listener: () => void): void {
    this.listeners.push(listener);
  }

  notify(): void {
    for (const l of this.listeners) l();
  }

  set(entityId: string, state?: string, attributes: Record<string, unknown> = {}): void {
    const current = this.fixture.states[entityId];
    this.fixture.states[entityId] = {
      ...current,
      state: state ?? current.state,
      attributes: { ...current.attributes, ...attributes },
      last_updated: new Date().toISOString(),
    };
  }

  /** A fresh hass object, converted to the selected unit like Home Assistant would. */
  snapshot(): HomeAssistant {
    const states: Record<string, HassEntity> = {};
    for (const [id, entity] of Object.entries(this.fixture.states)) states[id] = this.convert(entity);
    return {
      states,
      entities: this.fixture.entities,
      devices: this.fixture.devices,
      config: { unit_system: { temperature: this.unit } },
      themes: { darkMode: this.dark },
      language: "en",
      user: { is_admin: true },
      callService: async (domain, service, data = {}) => {
        this.log.unshift(`${domain}.${service} ${JSON.stringify(data)}`);
        this.notify();
        // ViCare reports a change on its next poll; a short delay stands in for that.
        setTimeout(() => {
          this.apply(domain, service, data);
          this.notify();
        }, 1500);
      },
      callWS: async <T>(msg: { type: string; [key: string]: unknown }) => {
        if (msg.type === "config/entity_registry/get_entries") {
          const ids = (msg.entity_ids as string[]) ?? [];
          return Object.fromEntries(ids.map((id) => [id, this.fixture.registry[id] ?? null])) as T;
        }
        throw new Error(`Unsupported WS message ${msg.type}`);
      },
    };
  }

  /** Applies a service call to the fixture, which is stored in °C. */
  private apply(domain: string, service: string, data: Record<string, unknown>): void {
    const id = String(data.entity_id ?? "");
    const entity = this.fixture.states[id];
    if (!entity) return;
    const toStored = (v: unknown) => {
      const n = Number(v);
      const celsius = entity.attributes.unit_of_measurement === "°C" || !id.startsWith("number.");
      return this.unit === "°F" && celsius ? Math.round((((n - 32) * 5) / 9) * 10) / 10 : n;
    };
    if (domain === "number" && service === "set_value") {
      const unit = entity.attributes.unit_of_measurement;
      this.set(id, String(unit === "°C" ? toStored(data.value) : Number(data.value)));
    } else if (domain === "vicare" && service === "set_vicare_mode") {
      this.set(id, undefined, { active_vicare_mode: data.vicare_mode });
    } else if (domain === "climate" && service === "set_preset_mode") {
      this.set(id, undefined, { preset_mode: data.preset_mode });
    } else if (service === "set_temperature") {
      this.set(id, undefined, { temperature: toStored(data.temperature) });
    }
  }

  private convert(entity: HassEntity): HassEntity {
    if (this.unit === "°C") return entity;
    const f = (c: number) => Math.round(((c * 9) / 5 + 32) * 10) / 10;
    const attributes = { ...entity.attributes };
    let state = entity.state;
    if (attributes.unit_of_measurement === "°C") {
      attributes.unit_of_measurement = "°F";
      const v = Number.parseFloat(state);
      if (Number.isFinite(v)) state = String(f(v));
    }
    const domain = entity.entity_id.split(".")[0];
    if (domain === "climate" || domain === "water_heater") {
      for (const key of TEMPERATURE_ATTRS) {
        const v = attributes[key];
        if (typeof v === "number") attributes[key] = f(v);
      }
    }
    return { ...entity, state, attributes };
  }
}
