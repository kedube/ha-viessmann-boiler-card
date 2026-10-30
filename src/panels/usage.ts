import { LitElement, html, nothing } from "lit";
import { dayStarts, fetchHistory, fetchHourlyChanges, runDays, toPoints, type Point, type RunDay } from "../system/history";
import type { HomeAssistant } from "../types";
import { formatTemperature } from "../util/temperature";
import type { PanelContext } from "./context";
import { stat } from "./controls";
import { duration } from "./format";
import { runTimeChart, temperatureChart } from "./usage-charts";

const DAY_MS = 86_400_000;
const RUN_DAYS = 30;
const REFRESH_MS = 5 * 60_000; // read the recorder again after this while the tab is open

interface TemperatureSource {
  key: string;
  label: string;
  color: string;
  entityId: string;
  nowC: number | null;
}

/**
 * The Usage tab: temperatures over the last day and burner run time per day,
 * from Home Assistant's history. The card keeps it while other tabs are open,
 * so its history and choices survive, but it only loads and draws while open.
 * It renders into the card's shadow root to share the card's styles.
 */
export class ViessmannBoilerUsage extends LitElement {
  static properties = {
    ctx: { attribute: false },
    active: { attribute: false },
    _hidden: { state: true },
    _temps: { state: true },
    _days: { state: true },
    _error: { state: true },
    _loading: { state: true },
    _hoverTime: { state: true },
    _hoverDay: { state: true },
  };

  declare ctx?: PanelContext;
  declare active: boolean;
  declare _hidden: Set<string>;
  declare _temps?: { start: number; end: number; points: Record<string, Point[]> };
  declare _days?: RunDay[];
  declare _error?: string;
  declare _loading: boolean;
  declare _hoverTime?: number;
  declare _hoverDay?: number;
  private _loaded?: { key: string; at: number };

  constructor() {
    super();
    this.active = false;
    this._hidden = new Set();
    this._loading = false;
  }

  protected createRenderRoot(): HTMLElement {
    return this;
  }

  protected shouldUpdate(): boolean {
    return this.active;
  }

  protected willUpdate(): void {
    const ctx = this.ctx;
    if (!ctx || this._loading) return;
    const key = sourceIds(ctx).join(" ");
    if (this._loaded?.key !== key || Date.now() - this._loaded.at > REFRESH_MS) this._load(ctx, key);
  }

  protected render() {
    const ctx = this.ctx;
    if (!ctx) return html`<p class="empty">Waiting for the ViCare boiler…</p>`;
    const lang = ctx.hass.language ?? "en";
    const sources = temperatureSources(ctx);
    const temps = this._temps;
    const days = this._days;
    return html`
      <div class="panel-grid">
        <section class="panel">
          <header class="panel-head"><h3>Temperatures</h3><span class="muted">Last 24 hours</span></header>
          <div class="series-toggles">
            ${sources.map(
              (s) => html`
                <button class="series-toggle" style="--c:${s.color}" aria-pressed=${!this._hidden.has(s.key)} @click=${() => this._toggle(s.key)}>
                  <i class="key line"></i>${s.label}<span class="muted">${formatTemperature(s.nowC, ctx.unit)}</span>
                </button>
              `,
            )}
          </div>
          ${temps
            ? temperatureChart({
                series: sources
                  .filter((s) => !this._hidden.has(s.key))
                  .map((s) => ({ ...s, points: temps.points[s.entityId] ?? [] })),
                start: temps.start,
                end: temps.end,
                unit: ctx.unit,
                lang,
                loading: this._loading,
                hover: this._hoverTime,
                onHover: (t) => (this._hoverTime = t),
              })
            : this._placeholder()}
        </section>
        <section class="panel">
          <header class="panel-head"><h3>Burner run time</h3><span class="muted">Last ${RUN_DAYS} days</span></header>
          ${days ? this._runTime(days, lang) : this._placeholder()}
        </section>
      </div>
    `;
  }

  private _runTime(days: RunDay[], lang: string) {
    const past = days.slice(0, -1).flatMap((d) => (d.minutes === null ? [] : [d.minutes]));
    const average = past.length ? past.reduce((a, b) => a + b, 0) / past.length : null;
    const show = (minutes: number | null | undefined) => (minutes == null ? "–" : duration(minutes));
    return html`
      <div class="stats">
        ${stat("Today so far", show(days.at(-1)?.minutes))} ${stat("Yesterday", show(days.at(-2)?.minutes))}
        ${stat("Daily average", show(average))}
      </div>
      ${runTimeChart({
        days,
        lang,
        loading: this._loading,
        hover: this._hoverDay,
        onHover: (i) => (this._hoverDay = i),
      })}
      ${days.some((d) => d.wholeHours)
        ? html`
            <div class="chart-legend">
              <span><i class="key bar"></i>On/off history</span>
              <span><i class="key bar whole-hours"></i>Whole hours, from the hour counter</span>
            </div>
          `
        : nothing}
    `;
  }

  private _placeholder() {
    return this._error
      ? html`<p class="empty">Couldn't read Home Assistant's history: ${this._error}</p>`
      : html`<p class="empty">Loading history…</p>`;
  }

  private _toggle(key: string): void {
    const hidden = new Set(this._hidden);
    if (!hidden.delete(key)) hidden.add(key);
    this._hidden = hidden;
  }

  private async _load(ctx: PanelContext, key: string): Promise<void> {
    this._loading = true;
    const { hass, vicare } = ctx;
    const end = Date.now();
    const start = end - DAY_MS;
    const days = dayStarts(end, RUN_DAYS);
    const sources = temperatureSources(ctx);
    const burner = vicare.device.burner;
    try {
      const [temps, burnerHistory, hours] = await Promise.all([
        fetchHistory(hass, sources.map((s) => s.entityId), start, end),
        fetchHistory(hass, burner ? [burner] : [], days[0], end),
        fetchHourlyChanges(hass, vicare.device.burner_hours, days[0], end),
      ]);
      const points = Object.fromEntries(sources.map((s) => [s.entityId, toPoints(temps[s.entityId], unitOf(hass, s.entityId), start)]));
      this._temps = { start, end, points };
      this._days = runDays(days, end, burner ? burnerHistory[burner] : [], hours);
      this._error = undefined;
    } catch (err) {
      this._error = err instanceof Error ? err.message : String((err as { message?: string })?.message ?? err);
    } finally {
      // A failed read waits as long as a successful one before trying again.
      this._loaded = { key, at: Date.now() };
      this._loading = false;
    }
  }
}

/** The boiler, each circuit's supply and the tank, coloured along the water's path. */
function temperatureSources(ctx: PanelContext): TemperatureSource[] {
  const { state: st, vicare: v } = ctx;
  const d = v.device;
  const sources: Array<Omit<TemperatureSource, "entityId"> & { entityId?: string }> = [
    {
      key: "boiler",
      label: "Boiler",
      color: "var(--series-boiler)",
      entityId: d.boiler_temperature ?? d.boiler_supply_temperature,
      nowC: st.boilerC,
    },
    ...st.circuits.map((c, i) => ({
      key: `circuit${c.circuit}`,
      label: `${c.name} supply`,
      color: `var(--series-circuit-${i + 1})`,
      entityId: v.circuits[c.circuit]?.supply_temperature,
      nowC: c.supplyC,
    })),
    { key: "tank", label: "Hot water tank", color: "var(--series-tank)", entityId: d.dhw_storage_temperature, nowC: st.tank.c },
  ];
  return sources.filter((s): s is TemperatureSource => !!s.entityId);
}

function sourceIds(ctx: PanelContext): string[] {
  const d = ctx.vicare.device;
  return [...temperatureSources(ctx).map((s) => s.entityId), d.burner ?? "", d.burner_hours ?? ""];
}

/** History is stored in the unit the sensor reports, which is the one it shows now. */
function unitOf(hass: HomeAssistant, entityId: string): string {
  return (hass.states[entityId]?.attributes.unit_of_measurement as string | undefined) ?? hass.config.unit_system.temperature;
}
