import { LitElement, css, html, nothing } from "lit";
import { circuitsOf, clean, moveItem, updateCircuit, updateZones } from "./config";
import { DEFAULT_ASSET_URL } from "./const";
import { matchThermostat, thermostatIds, zoneNameFor, zoneThermostats } from "./system/thermostats";
import type { BoilerCardConfig, CircuitConfig, HomeAssistant, ZoneConfig } from "./types";
import { vicareDevices } from "./vicare/discovery";

/** The card's visual editor in Home Assistant's dashboard editor. */
export class ViessmannBoilerCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  declare hass?: HomeAssistant;
  declare _config?: BoilerCardConfig;

  setConfig(config: BoilerCardConfig): void {
    this._config = config;
  }

  protected render() {
    const config = this._config;
    const hass = this.hass;
    if (!config || !hass) return nothing;
    const circuits = circuitsOf(config);
    const primary = circuits.find((c) => !c.separated_by);
    const radiant = circuits.find((c) => c.separated_by === "heat_exchanger");
    return html`
      <section>
        <h3>Boiler</h3>
        <label>
          <span>Title</span>
          <input .value=${config.title ?? ""} placeholder="Vitocrossal 300" @change=${(e: Event) => this._update({ ...config, title: text(e) })} />
        </label>
        <label>
          <span>ViCare device</span>
          <select @change=${(e: Event) => this._update({ ...config, device_id: text(e) })}>
            <option value="" ?selected=${!config.device_id}>Find automatically</option>
            ${vicareDevices(hass).map(
              (id) => html`<option value=${id} ?selected=${id === config.device_id}>${deviceName(hass, id)}</option>`,
            )}
          </select>
        </label>
        <label class="check">
          <input type="checkbox" .checked=${config.animation !== false} @change=${(e: Event) => this._update({ ...config, animation: (e.target as HTMLInputElement).checked })} />
          <span>Animate the water flow</span>
        </label>
      </section>
      ${primary ? this._circuit("Heating loop", primary) : nothing}
      ${radiant ? this._circuit("Radiant circuit", radiant) : nothing}
      ${radiant ? this._zones(radiant.zones ?? []) : nothing}
      <section>
        <h3>Renders</h3>
        <label>
          <span>Folder with the boiler renders</span>
          <input .value=${config.asset_url ?? ""} placeholder=${DEFAULT_ASSET_URL} @change=${(e: Event) => this._update({ ...config, asset_url: text(e) })} />
        </label>
      </section>
    `;
  }

  private _circuit(title: string, c: CircuitConfig) {
    const config = this._config!;
    return html`
      <section>
        <h3>${title} <small>ViCare circuit ${c.circuit}</small></h3>
        <div class="pair">
          <label>
            <span>Name</span>
            <input .value=${c.name ?? ""} @change=${(e: Event) => this._update(updateCircuit(config, c.circuit, { name: text(e) }))} />
          </label>
          <label>
            <span>Pump tag</span>
            <input .value=${c.pump_label ?? ""} @change=${(e: Event) => this._update(updateCircuit(config, c.circuit, { pump_label: text(e) }))} />
          </label>
        </div>
      </section>
    `;
  }

  private _zones(zones: ZoneConfig[]) {
    const hass = this.hass!;
    const config = this._config!;
    const thermostats = thermostatIds(hass);
    const set = (next: ZoneConfig[]) => this._update(updateZones(config, next));
    const unused = zoneThermostats(hass).filter(
      (id) => !zones.some((z) => (z.thermostat ?? matchThermostat(hass, z.name)) === id),
    );
    return html`
      <section>
        <h3>Zones <small>${zones.length}</small></h3>
        ${zones.map((z, i) => {
          const matched = z.thermostat ? undefined : matchThermostat(hass, z.name);
          return html`
            <div class="zone">
              <input aria-label="Zone name" .value=${z.name} @change=${(e: Event) => set(zones.map((x, j) => (j === i ? { ...x, name: text(e) } : x)))} />
              <select aria-label="Thermostat" @change=${(e: Event) => set(zones.map((x, j) => (j === i ? { name: x.name, thermostat: text(e) || undefined } : x)))}>
                <option value="" ?selected=${!z.thermostat}>${matched ? `Match by name: ${zoneNameFor(hass, matched)}` : "Match by name: none found"}</option>
                ${thermostats.map((id) => html`<option value=${id} ?selected=${id === z.thermostat}>${zoneNameFor(hass, id)} (${id})</option>`)}
              </select>
              <span class="buttons">
                <button title="Move up" ?disabled=${i === 0} @click=${() => set(moveItem(zones, i, i - 1))}>↑</button>
                <button title="Move down" ?disabled=${i === zones.length - 1} @click=${() => set(moveItem(zones, i, i + 1))}>↓</button>
                <button title="Remove" @click=${() => set(zones.filter((_, j) => j !== i))}>✕</button>
              </span>
            </div>
          `;
        })}
        <div class="row">
          <button @click=${() => set([...zones, { name: `Zone ${zones.length + 1}` }])}>Add zone</button>
          ${unused.length
            ? html`<button @click=${() => set([...zones, ...unused.map((id) => ({ name: zoneNameFor(hass, id), thermostat: id }))])}>
                Add ${unused.length} unassigned thermostat${unused.length === 1 ? "" : "s"}
              </button>`
            : nothing}
        </div>
      </section>
    `;
  }

  private _update(config: BoilerCardConfig): void {
    this._config = clean(config);
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this._config }, bubbles: true, composed: true }));
  }

  static styles = css`
    :host {
      display: grid;
      gap: 18px;
      color: var(--primary-text-color);
    }
    section {
      display: grid;
      gap: 10px;
    }
    h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
    }
    h3 small {
      margin-left: 6px;
      font-weight: 400;
      color: var(--secondary-text-color);
    }
    label {
      display: grid;
      gap: 4px;
      font-size: 0.85rem;
      color: var(--secondary-text-color);
    }
    label.check {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--primary-text-color);
    }
    .pair,
    .zone {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      align-items: end;
    }
    .zone {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr) auto;
      align-items: center;
    }
    input:not([type="checkbox"]),
    select {
      box-sizing: border-box;
      width: 100%;
      padding: 9px 10px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.4));
      border-radius: 6px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
      font: inherit;
      font-size: 0.9rem;
    }
    button {
      padding: 7px 12px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.4));
      border-radius: 6px;
      background: transparent;
      color: var(--primary-text-color);
      font: inherit;
      font-size: 0.85rem;
      cursor: pointer;
    }
    button:disabled {
      opacity: 0.35;
      cursor: default;
    }
    .buttons {
      display: flex;
      gap: 4px;
    }
    .buttons button {
      padding: 6px 9px;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  `;
}

function text(e: Event): string {
  return (e.target as HTMLInputElement | HTMLSelectElement).value.trim();
}

function deviceName(hass: HomeAssistant, id: string): string {
  const d = hass.devices[id];
  return d?.name_by_user ?? d?.name ?? id;
}
