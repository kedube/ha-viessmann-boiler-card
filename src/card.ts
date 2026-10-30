import { LitElement, css, html, nothing, svg, type PropertyValues } from "lit";
import { circuitsOf, updateZones } from "./config";
import { DEFAULT_ASSET_URL, EDITOR_TAG, MODELS } from "./const";
import type { CurveDraft, PanelContext } from "./panels/context";
import { diagnosticsPanel } from "./panels/diagnostics";
import { heatingPanel } from "./panels/heating";
import { hotWaterPanel } from "./panels/hot-water";
import { loadComponent, placeholderSpec, type ComponentSpec } from "./scene/catalog";
import { buildDiagram, componentIds, DEFAULT_BOILER, type Diagram, type Part } from "./scene/diagram";
import { FlowLayer, type FlowStream } from "./scene/flow-layer";
import {
  boxesOverlap,
  defsSvg,
  floorSvg,
  jointSvg,
  partSvg,
  pipeShadowsSvg,
  pipeSvg,
  shapePipe,
  terminalSvg,
  zoneTextSvg,
  zoneTileSvg,
  type PartStatus,
  type ShapedPipe,
} from "./scene/svg";
import { evaluateSystem, type SystemState, type ZoneState } from "./system/state";
import { zoneNameFor, zoneThermostats } from "./system/thermostats";
import type { BoilerCardConfig, EntityRegistryEntry, HomeAssistant } from "./types";
import { flowRgb, formatTemperature } from "./util/temperature";
import { discoverViCare, fetchRegistryEntries, vicareDevices, type ViCareEntities } from "./vicare/discovery";

const FLOW_SPEED = 60; // diagram pixels per second
const SEND_DELAY_MS = 1500; // wait for the user to stop adjusting before calling Viessmann
const PENDING_MS = 3 * 60_000; // ViCare polls about once a minute; give up on a change after this

type Tab = "system" | "heating" | "hotwater" | "usage" | "diagnostics";
const TABS: Array<{ id: Tab; label: string }> = [
  { id: "system", label: "System" },
  { id: "heating", label: "Heating" },
  { id: "hotwater", label: "Hot water" },
  { id: "usage", label: "Usage" },
  { id: "diagnostics", label: "Diagnostics" },
];

interface Pending {
  value: number;
  until: number;
  /** Not sent yet: waiting for another entity to report its new value first. */
  after?: { entityId: string; value: number };
}

export class ViessmannBoilerCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _specs: { state: true },
    _registry: { state: true },
    _tab: { state: true },
  };

  declare hass?: HomeAssistant;
  declare _config?: BoilerCardConfig;
  declare _specs?: Record<string, ComponentSpec>;
  declare _registry?: Record<string, EntityRegistryEntry>;
  declare _tab: Tab;

  private _diagram?: Diagram;
  private _pipes: ShapedPipe[] = [];
  private _vicare?: ViCareEntities;
  private _state?: SystemState;
  private _discoveryInputs: unknown[] = [];
  private _registryDevice?: string;
  private _flow?: { layer: FlowLayer; canvas: HTMLCanvasElement };
  private _resize?: ResizeObserver;
  private _intersection?: IntersectionObserver;
  private _onScreen = true;
  private readonly _reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  private readonly _pending = new Map<string, Pending>();
  private readonly _timers = new Map<string, number>();
  private readonly _drafts = new Map<number, CurveDraft>();

  constructor() {
    super();
    this._tab = "system";
  }

  setConfig(config: BoilerCardConfig): void {
    if (!config) throw new Error("Invalid configuration");
    const merged = { asset_url: DEFAULT_ASSET_URL, animation: true, ...config, circuits: circuitsOf(config) };
    this._config = merged;
    this._specs = undefined;
    const ids = componentIds(merged);
    Promise.all(ids.map((id) => loadComponent(merged.asset_url, id))).then((specs) => {
      if (this._config !== merged) return;
      this._specs = Object.fromEntries(ids.map((id, i) => [id, specs[i]]));
    });
  }

  /** A starting config for the card picker: the boiler, its two circuits, and a zone per thermostat. */
  static getStubConfig(hass: HomeAssistant): Omit<BoilerCardConfig, "type"> {
    const zones = zoneThermostats(hass).map((id) => ({ name: zoneNameFor(hass, id), thermostat: id }));
    const stub: BoilerCardConfig = { type: "", device_id: vicareDevices(hass)[0], model: DEFAULT_BOILER };
    const { type: _, ...config } = updateZones(stub, zones);
    return config;
  }

  static getConfigElement(): HTMLElement {
    return document.createElement(EDITOR_TAG);
  }

  getCardSize(): number {
    return 7;
  }

  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 6 };
  }

  connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("visibilitychange", this._syncAnimation);
    this._reducedMotion.addEventListener("change", this._syncAnimation);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("visibilitychange", this._syncAnimation);
    this._reducedMotion.removeEventListener("change", this._syncAnimation);
    this._resize?.disconnect();
    this._intersection?.disconnect();
    this._resize = undefined;
    this._intersection = undefined;
    this._flow?.layer.stop();
    // Send anything still waiting for the user to pause rather than dropping it.
    for (const [entityId, timer] of this._timers) {
      window.clearTimeout(timer);
      const p = this._pending.get(entityId);
      if (p && !p.after) this._send(entityId, p.value);
    }
    this._timers.clear();
  }

  protected willUpdate(changed: PropertyValues<this>): void {
    const config = this._config;
    if (!config) return;
    if (changed.has("_config") || changed.has("_specs")) {
      const specs = this._specs;
      this._diagram = buildDiagram((id) => specs?.[id] ?? placeholderSpec(id), config);
      this._pipes = this._diagram.pipes.map(shapePipe);
    }

    const hass = this.hass;
    if (!hass) return;
    const deviceId = config.device_id ?? vicareDevices(hass)[0];
    if (!deviceId) {
      this._vicare = undefined;
      this._state = undefined;
      return;
    }
    if (this._registryDevice !== deviceId) {
      this._registryDevice = deviceId;
      fetchRegistryEntries(hass, deviceId)
        .then((registry) => (this._registry = registry))
        .catch(() => undefined); // fall back to entity id order
    }
    const inputs = [hass.entities, deviceId, this._registry, config.entities];
    if (!this._vicare || inputs.some((v, i) => v !== this._discoveryInputs[i])) {
      this._vicare = discoverViCare(hass, deviceId, this._registry, config.entities);
      this._discoveryInputs = inputs;
    }
    this._state = evaluateSystem(hass, this._vicare, config);
    if (changed.has("hass")) this._settlePending();
  }

  protected render() {
    const d = this._diagram;
    if (!this._config || !d) return nothing;
    const tab = this._tab;
    return html`
      <ha-card class=${this.hass?.themes?.darkMode ? "dark" : ""}>
        ${this._renderHeader()}
        <nav class="tabs" role="tablist">
          ${TABS.map(
            (t) => html`
              <button role="tab" aria-selected=${t.id === tab} class=${t.id === tab ? "active" : ""} @click=${() => (this._tab = t.id)}>
                ${t.label}
              </button>
            `,
          )}
        </nav>
        <div class="scroller" ?hidden=${tab !== "system"}>${this._renderScene(d)}</div>
        ${tab !== "system" && tab !== "usage" ? html`<div class="panels">${this._renderPanel(tab)}</div>` : nothing}
        <div class="panels" ?hidden=${tab !== "usage"}>
          <viessmann-boiler-usage .ctx=${this._panelContext()} .active=${tab === "usage"}></viessmann-boiler-usage>
        </div>
      </ha-card>
    `;
  }

  protected updated(): void {
    const scene = this.renderRoot.querySelector<HTMLElement>(".scene");
    const canvas = this.renderRoot.querySelector<HTMLCanvasElement>("canvas.flow");
    if (!scene || !canvas || !this._diagram) return;
    if (this._flow?.canvas !== canvas) {
      this._flow?.layer.stop();
      this._flow = { layer: new FlowLayer(canvas), canvas };
    }
    if (!this._resize) {
      this._resize = new ResizeObserver(() => this._syncViewport());
      this._resize.observe(scene);
    }
    if (!this._intersection) {
      this._intersection = new IntersectionObserver(([entry]) => {
        this._onScreen = entry.isIntersecting;
        this._syncAnimation();
      });
      this._intersection.observe(scene);
    }
    this._flow.layer.setStreams(this._streams());
    this._syncViewport();
    this._syncAnimation();
  }

  private _renderHeader() {
    const model = MODELS[this._config?.model ?? DEFAULT_BOILER];
    const st = this._state;
    const unit = this._unit();
    return html`
      <div class="header">
        <div class="title">
          ${this._config?.title ?? model?.name ?? "Viessmann"}
          ${model ? html`<span class="variant">${model.variant}</span>` : nothing}
        </div>
        <div class="chips">
          ${st
            ? html`
                <span class="chip">Outside ${formatTemperature(st.outsideC, unit, 1)}</span>
                <span class="chip ${st.burner.on ? "hot" : ""}">
                  ${st.burner.on ? `Burner ${st.burner.modulation ?? 0}%` : "Burner off"}
                </span>
                <span class="chip">Hot water ${formatTemperature(st.tank.c, unit)}</span>
              `
            : html`<span class="chip warn">No ViCare boiler found</span>`}
        </div>
      </div>
    `;
  }

  private _renderScene(d: Diagram) {
    const viewBox = `0 0 ${d.width} ${d.height}`;
    const zones = this._zoneStates();
    return html`
      <div class="scene" style="aspect-ratio: ${d.width} / ${d.height}" @click=${this._onSceneClick}>
        <svg viewBox=${viewBox} aria-hidden="true">
          ${defsSvg(d)} ${floorSvg(d)} ${d.zones.map((z) => zoneTileSvg(z, !!zones[z.index]?.calling))}
          ${pipeShadowsSvg(this._pipes)} ${this._pipes.map(pipeSvg)} ${d.joints.map(jointSvg)}
          ${d.terminals.map(terminalSvg)}
        </svg>
        <canvas class="flow"></canvas>
        <svg viewBox=${viewBox}>
          ${d.parts.map((p) => partSvg(p, this._partStatus(p, zones)))} ${this._burnerGlow(d)}
          ${d.zones.map((z) => zoneTextSvg(z, !!zones[z.index]?.calling, this._zoneTemps(zones[z.index])))}
        </svg>
        <div class="labels">${this._renderLabels(d)}</div>
      </div>
    `;
  }

  private _renderPanel(tab: Tab) {
    const ctx = this._panelContext();
    if (!ctx) return html`<p class="empty">Waiting for the ViCare boiler…</p>`;
    switch (tab) {
      case "heating":
        return heatingPanel(ctx);
      case "hotwater":
        return hotWaterPanel(ctx);
      case "diagnostics":
        return diagnosticsPanel(ctx);
      default:
        return nothing;
    }
  }

  /** A warm glow inside the boiler while the burner fires, brighter at higher modulation. */
  private _burnerGlow(d: Diagram) {
    const burner = this._state?.burner;
    const at = d.anchors.burner?.at;
    if (!burner?.on || !at) return nothing;
    const boiler = d.parts.find((p) => p.key === "boiler");
    const w = boiler ? boiler.spec.width * boiler.scale : 200;
    const level = Math.min(1, Math.max(0, (burner.modulation ?? 50) / 100));
    return svg`<ellipse class="burner-glow" cx=${at[0]} cy=${at[1]} rx=${w * 0.36} ry=${w * 0.5}
      fill="url(#burner-glow)" style="--glow: ${(0.35 + 0.5 * level).toFixed(2)}" />`;
  }

  private _renderLabels(d: Diagram) {
    const st = this._state;
    if (!st) return nothing;
    const unit = this._unit();
    const radiant = st.circuits.find((c) => c.separated);
    const label = (key: string, title: string, value: string, detail?: string, active?: boolean) => {
      const anchor = d.anchors[key];
      if (!anchor) return nothing;
      const left = ((anchor.at[0] / d.width) * 100).toFixed(2);
      const top = ((anchor.at[1] / d.height) * 100).toFixed(2);
      const classes = ["label", active ? "on" : "", anchor.below ? "below" : ""].join(" ");
      return html`
        <button class=${classes} style="left:${left}%;top:${top}%" data-key=${key}>
          <span class="t">${title}</span>
          <span class="v">${value}</span>
          ${detail ? html`<span class="d">${detail}</span>` : nothing}
        </button>
      `;
    };
    const calling = radiant?.zones.filter((z) => z.calling).length ?? 0;
    return html`
      ${label(
        "boiler",
        "Boiler",
        formatTemperature(st.boilerC, unit),
        st.burner.on ? `Burner ${st.burner.modulation ?? 0}%` : "Burner off",
        st.burner.on,
      )}
      ${label(
        "tank",
        "Hot water",
        formatTemperature(st.tank.c, unit),
        st.tank.targetC !== null ? `Target ${formatTemperature(st.tank.targetC, unit)}` : undefined,
        st.tank.charging || st.tank.pumpOn,
      )}
      ${label(
        "hx",
        "Heat exchanger",
        `${formatTemperature(st.loops.boiler?.supplyC ?? null, unit)} → ${formatTemperature(radiant?.supplyC ?? null, unit)}`,
      )}
      ${radiant
        ? label(
            "radiant",
            radiant.name,
            formatTemperature(radiant.supplyC, unit),
            radiant.zones.length ? `${calling} of ${radiant.zones.length} zones calling` : undefined,
            st.loops[`circuit${radiant.circuit}`]?.flowing,
          )
        : nothing}
    `;
  }

  private _partStatus(p: Part, zones: ZoneState[]): PartStatus {
    const st = this._state;
    if (!st) return {};
    const zone = /^zone-valve-(\d+)$/.exec(p.key);
    if (zone) return { on: !!zones[Number(zone[1])]?.calling };
    switch (p.key) {
      case "dhw-pump":
        return { tag: p.tag, on: st.tank.pumpOn };
      case "boiler-pump":
        return { tag: p.tag, on: !!st.circuits.find((c) => !c.separated)?.pumpOn };
      case "radiant-pump":
        return { tag: p.tag, on: !!st.circuits.find((c) => c.separated)?.pumpOn };
      default:
        return {};
    }
  }

  private _zoneStates(): ZoneState[] {
    return this._state?.circuits.find((c) => c.separated)?.zones ?? [];
  }

  /** Compact "21.3° · set 20.6°"; the header already shows the unit. */
  private _zoneTemps(z: ZoneState | undefined): string {
    if (!z || (z.currentC === null && z.targetC === null)) return "";
    const unit = this._unit();
    const deg = (c: number | null) => (c === null ? "–" : `${formatTemperature(c, unit, 1).replace(/ ?°[CF]$/, "")}°`);
    return z.targetC !== null ? `${deg(z.currentC)} · set ${deg(z.targetC)}` : deg(z.currentC);
  }

  private _streams(): FlowStream[] {
    const loops = this._state?.loops ?? {};
    const streams: FlowStream[] = [];
    this._pipes.forEach((p, i) => {
      const loop = p.pipe.loops.map((k) => loops[k]).find((l) => l?.flowing);
      if (!loop) return;
      // Hot side orange, cold side blue; coils fade from one to the other as they give off heat.
      const hot = flowRgb("supply", loop.supplyC);
      const cold = flowRgb("return", loop.returnC);
      const side = p.pipe.side;
      streams.push({
        key: p.pipe.key,
        points: p.points,
        width: p.pipe.width,
        rgb: side === "return" ? cold : hot,
        fade: side === "coil" ? { to: p.points[p.points.length - 1], rgb: cold } : undefined,
        speed: FLOW_SPEED,
        // Pipes drawn later pass in front, so they hide this stream where they cross it.
        occluders: this._pipes
          .slice(i + 1)
          .filter((o) => boxesOverlap(o, p))
          .map((o) => ({ points: o.points, width: o.pipe.width })),
      });
    });
    return streams;
  }

  private _syncViewport(): void {
    const scene = this.renderRoot.querySelector<HTMLElement>(".scene");
    if (!scene || !this._flow || !this._diagram) return;
    const { width, height } = scene.getBoundingClientRect();
    const viewBox = { x: 0, y: 0, w: this._diagram.width, h: this._diagram.height };
    this._flow.layer.setViewport(viewBox, width, height, window.devicePixelRatio || 1);
  }

  private readonly _syncAnimation = (): void => {
    if (!this._flow) return;
    const animate = this._config?.animation !== false && !this._reducedMotion.matches;
    this._flow.layer.setAnimate(animate);
    const visible = this._tab === "system" && this._onScreen && document.visibilityState === "visible";
    if (animate && visible && this.isConnected) this._flow.layer.start();
    else this._flow.layer.stop();
  };

  private readonly _onSceneClick = (ev: Event): void => {
    const target = ev.composedPath().find((n): n is Element => n instanceof Element && n.hasAttribute("data-key"));
    this._moreInfo(target ? this._entityFor(target.getAttribute("data-key") ?? "") : undefined);
  };

  private _entityFor(key: string): string | undefined {
    const v = this._vicare;
    if (!v) return undefined;
    const circuits = this._config?.circuits ?? [];
    const primary = circuits.find((c) => !c.separated_by)?.circuit ?? 1;
    const radiant = v.circuits[circuits.find((c) => c.separated_by)?.circuit ?? 2] ?? {};
    const zone = /^zone(?:-valve)?-(\d+)$/.exec(key);
    if (zone) return this._zoneStates()[Number(zone[1])]?.entityId ?? radiant.heating;
    switch (key) {
      case "boiler":
        return v.device.boiler_temperature ?? v.device.burner;
      case "tank":
      case "tempering":
        return v.device.domestic_hot_water ?? v.device.dhw_storage_temperature;
      case "dhw-pump":
        return v.device.domestic_hot_water_pump;
      case "boiler-pump":
        return v.circuits[primary]?.circulation_pump;
      case "radiant-pump":
        return radiant.circulation_pump;
      case "hx":
      case "mixer":
      case "radiant":
        return radiant.heating;
      default:
        return undefined;
    }
  }

  // Panels: reading values and sending changes.

  private _panelContext(): PanelContext | undefined {
    const { hass, _config: config, _vicare: vicare, _state: state } = this;
    if (!hass || !config || !vicare || !state) return undefined;
    return {
      hass,
      config,
      vicare,
      state,
      unit: this._unit(),
      value: (id) => this._value(id),
      pending: (id) => !!id && this._pending.has(id),
      setValue: (id, value) => this._setValue(id, value),
      call: (domain, service, data) => this._call(domain, service, data),
      moreInfo: (id) => this._moreInfo(id),
      curveDraft: (circuit) => this._drafts.get(circuit),
      setCurveDraft: (circuit, draft) => this._setCurveDraft(circuit, draft),
      applyCurve: (circuit) => this._applyCurve(circuit),
    };
  }

  private _value(entityId: string | undefined): number | null {
    if (!entityId) return null;
    return this._pending.get(entityId)?.value ?? this._reported(entityId);
  }

  /** The value Home Assistant reports: the state of a number, or the target of a water heater or climate. */
  private _reported(entityId: string): number | null {
    const entity = this.hass?.states[entityId];
    if (!entity) return null;
    const domain = entityId.split(".")[0];
    const raw = domain === "water_heater" || domain === "climate" ? entity.attributes.temperature : entity.state;
    const v = typeof raw === "number" ? raw : Number.parseFloat(String(raw));
    return Number.isFinite(v) ? v : null;
  }

  private _setValue(entityId: string, value: number): void {
    this._pending.set(entityId, { value, until: Date.now() + PENDING_MS });
    window.clearTimeout(this._timers.get(entityId));
    this._timers.set(
      entityId,
      window.setTimeout(() => {
        this._timers.delete(entityId);
        this._send(entityId, value);
      }, SEND_DELAY_MS),
    );
    this.requestUpdate();
  }

  private _send(entityId: string, value: number): void {
    if (this._reported(entityId) === value) {
      this._pending.delete(entityId);
      this.requestUpdate();
      return;
    }
    const domain = entityId.split(".")[0];
    if (domain === "number") this._call("number", "set_value", { entity_id: entityId, value }, entityId);
    else this._call(domain, "set_temperature", { entity_id: entityId, temperature: value }, entityId);
  }

  private _call(domain: string, service: string, data: Record<string, unknown>, pendingId?: string): void {
    this.hass?.callService(domain, service, data).catch((err: unknown) => {
      if (pendingId) this._pending.delete(pendingId);
      this.requestUpdate();
      const message = err instanceof Error ? err.message : String((err as { message?: string })?.message ?? err);
      this.dispatchEvent(
        new CustomEvent("hass-notification", {
          detail: { message: `Viessmann: ${message}` },
          bubbles: true,
          composed: true,
        }),
      );
    });
  }

  /** Drops changes Home Assistant now reports, or that never arrived, and sends queued ones. */
  private _settlePending(): void {
    const now = Date.now();
    for (const [entityId, p] of this._pending) {
      if (p.after) {
        if (this._reported(p.after.entityId) === p.after.value || now > p.until) {
          this._pending.set(entityId, { value: p.value, until: now + PENDING_MS });
          this._send(entityId, p.value);
        }
        continue;
      }
      if (this._timers.has(entityId)) continue;
      if (this._reported(entityId) === p.value || now > p.until) this._pending.delete(entityId);
    }
  }

  private _setCurveDraft(circuit: number, draft: CurveDraft | undefined): void {
    const e = this._vicare?.circuits[circuit] ?? {};
    const unchanged =
      draft && draft.slope === this._value(e.heating_curve_slope) && draft.shift === this._value(e.heating_curve_shift);
    if (!draft || unchanged) this._drafts.delete(circuit);
    else this._drafts.set(circuit, draft);
    this.requestUpdate();
  }

  /**
   * ViCare writes slope and shift together, taking the other one from its last
   * reading. So when both change, the shift waits until Home Assistant reports
   * the new slope, or it would put the old slope back.
   */
  private _applyCurve(circuit: number): void {
    const draft = this._drafts.get(circuit);
    const e = this._vicare?.circuits[circuit] ?? {};
    const slopeId = e.heating_curve_slope;
    const shiftId = e.heating_curve_shift;
    if (!draft || !slopeId || !shiftId) return;
    const until = Date.now() + PENDING_MS;
    const slopeChanged = draft.slope !== this._reported(slopeId);
    const shiftChanged = draft.shift !== this._reported(shiftId);
    if (slopeChanged) {
      this._pending.set(slopeId, { value: draft.slope, until });
      this._send(slopeId, draft.slope);
    }
    if (shiftChanged) {
      if (slopeChanged) {
        this._pending.set(shiftId, { value: draft.shift, until, after: { entityId: slopeId, value: draft.slope } });
      } else {
        this._pending.set(shiftId, { value: draft.shift, until });
        this._send(shiftId, draft.shift);
      }
    }
    this._drafts.delete(circuit);
    this.requestUpdate();
  }

  private _moreInfo(entityId: string | undefined): void {
    if (!entityId) return;
    this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
  }

  private _unit(): string {
    return this.hass?.config.unit_system.temperature ?? "°C";
  }

  static styles = css`
    :host {
      display: block;
    }
    ha-card {
      display: block;
      overflow: hidden;
      container: card / inline-size;
      background: var(--ha-card-background, var(--card-background-color, #fff));
      border-radius: var(--ha-card-border-radius, 12px);
      --floor-top: rgba(70, 60, 50, 0.1);
      --floor-bottom: rgba(70, 60, 50, 0);
      --floor-line: rgba(0, 0, 0, 0.18);
      --tile: #efe9e0;
      --tile-stroke: rgba(80, 60, 40, 0.14);
      --panel: rgba(127, 127, 127, 0.07);
      --divider: var(--divider-color, rgba(127, 127, 127, 0.22));
      --accent: var(--primary-color, #03a9f4);
      /* Usage chart series, in order along the water's path (checked for colour-blind separation). */
      --series-boiler: #eb6834;
      --series-circuit-1: #1baf7a;
      --series-circuit-2: #eda100;
      --series-circuit-3: #e87ba4;
      --series-circuit-4: #6250d6;
      --series-tank: #2a78d6;
    }
    ha-card.dark {
      --floor-top: rgba(255, 255, 255, 0.07);
      --floor-bottom: rgba(255, 255, 255, 0);
      --floor-line: rgba(255, 255, 255, 0.16);
      --tile: #2b2825;
      --tile-stroke: rgba(255, 255, 255, 0.08);
      --panel: rgba(255, 255, 255, 0.05);
      --series-boiler: #d95926;
      --series-circuit-1: #199e70;
      --series-circuit-2: #c98500;
      --series-circuit-3: #d55181;
      --series-circuit-4: #9085e9;
      --series-tank: #3987e5;
    }
    [hidden] {
      display: none !important;
    }
    button {
      font: inherit;
      color: inherit;
    }
    .header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px 16px;
      padding: 12px 16px 6px;
    }
    .title {
      font-size: 1.1rem;
      font-weight: 500;
      color: var(--primary-text-color);
    }
    .variant {
      margin-left: 6px;
      font-size: 0.85rem;
      font-weight: 400;
      color: var(--secondary-text-color);
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .chip {
      padding: 6px 10px;
      border-radius: 999px;
      font-size: 0.78rem;
      line-height: 1;
      color: var(--primary-text-color);
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
    }
    .chip.hot {
      background: rgba(240, 96, 40, 0.24);
    }
    .chip.hot::before {
      content: "";
      display: inline-block;
      width: 6px;
      height: 6px;
      margin-right: 6px;
      border-radius: 50%;
      vertical-align: 1px;
      background: #f97316;
      box-shadow: 0 0 6px #f97316;
    }
    .chip.warn {
      background: rgba(219, 68, 55, 0.15);
    }
    .tabs {
      display: flex;
      gap: 4px;
      padding: 0 12px;
      border-bottom: 1px solid var(--divider);
      overflow-x: auto;
    }
    .tabs button {
      padding: 10px 12px 9px;
      border: 0;
      border-bottom: 2px solid transparent;
      background: none;
      font-size: 0.88rem;
      color: var(--secondary-text-color);
      cursor: pointer;
      white-space: nowrap;
    }
    .tabs button.active {
      color: var(--primary-text-color);
      border-bottom-color: var(--accent);
    }
    .scroller {
      overflow-x: auto;
      overscroll-behavior-x: contain;
    }
    .scene {
      position: relative;
      width: 100%;
      overflow: hidden;
      container-type: inline-size;
    }
    /* On narrow cards the diagram keeps a readable size and scrolls sideways. */
    @container card (max-width: 720px) {
      .scene {
        width: 940px;
      }
    }
    .scene > svg,
    .scene > canvas {
      position: absolute;
      inset: 0;
      display: block;
      width: 100%;
      height: 100%;
    }
    .scene > svg:not(:first-of-type) {
      pointer-events: none;
    }
    svg path,
    svg line {
      fill: none;
      stroke-linecap: butt;
      stroke-linejoin: round;
    }
    svg text {
      font-family: var(--ha-font-family-body, Roboto, "Segoe UI", system-ui, sans-serif);
    }
    .floor-top {
      stop-color: var(--floor-top);
    }
    .floor-bottom {
      stop-color: var(--floor-bottom);
    }
    .floor-line {
      stroke: var(--floor-line);
      stroke-width: 1.5;
    }
    .tile {
      fill: var(--tile);
      stroke: var(--tile-stroke);
      stroke-width: 1.5;
    }
    .zone.calling .tile {
      stroke: rgba(249, 115, 22, 0.75);
      stroke-width: 2.5;
    }
    .zone-name {
      font-size: 19px;
      font-weight: 600;
      fill: var(--primary-text-color);
    }
    .zone-temp {
      font-size: 16px;
      fill: var(--secondary-text-color);
    }
    .zone-text .dot {
      fill: #9ca3af;
    }
    .zone-text.calling .dot {
      fill: #f97316;
    }
    .terminal-label {
      font-size: 16px;
      fill: var(--secondary-text-color);
    }
    .brass {
      fill: #b8922f;
      stroke: #7a5d1a;
      stroke-width: 1.5;
    }
    .lever {
      fill: #f2c200;
      stroke: #a07f00;
      stroke-width: 1;
    }
    .burner-glow {
      mix-blend-mode: screen;
      opacity: var(--glow);
      animation: flicker 2.6s ease-in-out infinite alternate;
    }
    @keyframes flicker {
      from {
        opacity: calc(var(--glow) * 0.82);
      }
      to {
        opacity: var(--glow);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .burner-glow {
        animation: none;
      }
    }
    .hit {
      fill: transparent;
      cursor: pointer;
      pointer-events: all;
    }
    .tag {
      fill: #f7f7f5;
      stroke: rgba(0, 0, 0, 0.25);
      stroke-width: 1;
    }
    .tag-text {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.5px;
      fill: #1d1d1d;
    }
    .led {
      fill: #6b7280;
      stroke: rgba(0, 0, 0, 0.35);
      stroke-width: 1;
    }
    .led-halo {
      fill: transparent;
    }
    .status.on .led {
      fill: #4ade80;
    }
    .status.on .led-halo {
      fill: rgba(74, 222, 128, 0.35);
    }
    .labels {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .label {
      position: absolute;
      display: grid;
      gap: 0.1em;
      padding: 0.4em 0.7em 0.45em;
      border: 0;
      border-radius: 0.6em;
      font-family: inherit;
      /* Labels scale with the diagram, within readable limits. */
      font-size: clamp(10px, 1.1cqw, 15px);
      text-align: left;
      white-space: nowrap;
      color: #f5f5f4;
      background: rgba(24, 24, 27, 0.72);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
      backdrop-filter: blur(6px);
      transform: translate(-50%, -100%);
      pointer-events: auto;
      cursor: pointer;
    }
    .label.below {
      transform: translate(-50%, 4px);
    }
    ha-card.dark .label {
      background: rgba(64, 64, 70, 0.88);
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.06), 0 2px 8px rgba(0, 0, 0, 0.4);
    }
    .label .t {
      font-size: max(8px, 0.68em);
      letter-spacing: 0.04em;
      text-transform: uppercase;
      opacity: 0.72;
    }
    .label .v {
      font-size: 1em;
      font-weight: 600;
    }
    .label .d {
      font-size: max(8px, 0.78em);
      opacity: 0.8;
    }
    .label.on .t::before {
      content: "";
      display: inline-block;
      width: 6px;
      height: 6px;
      margin-right: 5px;
      border-radius: 50%;
      vertical-align: 1px;
      background: #4ade80;
      box-shadow: 0 0 6px #4ade80;
    }

    /* Panels */
    .panels {
      padding: 12px;
    }
    .panel-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 380px), 1fr));
      gap: 12px;
    }
    .panel {
      display: grid;
      gap: 12px;
      align-content: start;
      padding: 14px;
      border-radius: 10px;
      background: var(--panel);
      color: var(--primary-text-color);
    }
    .panel.wide {
      grid-column: 1 / -1;
    }
    .panel-head {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      justify-content: space-between;
      gap: 4px 12px;
    }
    .panel-head h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
    }
    .muted {
      color: var(--secondary-text-color);
      font-size: 0.82rem;
    }
    .link {
      padding: 0;
      border: 0;
      background: none;
      color: var(--secondary-text-color);
      font-size: 0.82rem;
      cursor: pointer;
      text-align: right;
    }
    .field {
      display: grid;
      gap: 6px;
      justify-items: start;
    }
    .field-label {
      font-size: 0.75rem;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      color: var(--secondary-text-color);
    }
    .field-row {
      display: flex;
      flex-wrap: wrap;
      align-items: end;
      gap: 12px 18px;
    }
    .segmented {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .segmented button,
    .curve-actions button,
    .actions button {
      padding: 7px 12px;
      border: 1px solid var(--divider);
      border-radius: 999px;
      background: transparent;
      font-size: 0.84rem;
      cursor: pointer;
    }
    .segmented button.selected {
      border-color: var(--accent);
      background: color-mix(in srgb, var(--accent) 16%, transparent);
      font-weight: 600;
    }
    .curve-actions {
      display: flex;
      gap: 8px;
    }
    .curve-actions button.primary {
      border-color: var(--accent);
      background: var(--accent);
      color: var(--text-primary-color, #fff);
      font-weight: 600;
    }
    .stepper {
      display: inline-flex;
      align-items: center;
      border: 1px solid var(--divider);
      border-radius: 999px;
    }
    .stepper.pending {
      border-color: var(--accent);
      box-shadow: 0 0 0 1px var(--accent);
    }
    .step {
      width: 34px;
      height: 34px;
      border: 0;
      border-radius: 50%;
      background: none;
      font-size: 1.15rem;
      line-height: 1;
      cursor: pointer;
    }
    .step:disabled {
      opacity: 0.35;
      cursor: default;
    }
    .step-value {
      min-width: 52px;
      text-align: center;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }
    .step-value small {
      margin-left: 2px;
      font-weight: 400;
      color: var(--secondary-text-color);
    }
    .curve {
      display: grid;
      gap: 8px;
    }
    .curve-chart {
      width: 100%;
      height: auto;
    }
    .curve-chart .grid {
      stroke: var(--divider);
      stroke-width: 1;
    }
    .curve-chart .tick,
    .curve-chart .axis {
      font-size: 10px;
      fill: var(--secondary-text-color);
    }
    .curve-line {
      stroke: #f97316;
      stroke-width: 2.5;
    }
    .curve-line.draft {
      stroke: var(--accent);
      stroke-dasharray: 6 4;
    }
    .curve-chart .now {
      stroke: var(--secondary-text-color);
      stroke-dasharray: 3 3;
      stroke-width: 1;
    }
    .target-dot {
      fill: #f97316;
    }
    .supply-dot {
      fill: none;
      stroke: var(--primary-text-color);
      stroke-width: 2;
    }
    .curve-legend,
    .chart-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 14px;
      font-size: 0.8rem;
    }
    .key {
      display: inline-block;
      width: 10px;
      height: 10px;
      margin-right: 5px;
      border-radius: 50%;
      vertical-align: -1px;
    }
    .key.target {
      background: #f97316;
    }
    .key.supply {
      border: 2px solid var(--primary-text-color);
      box-sizing: border-box;
    }
    .key.draft {
      border-radius: 0;
      height: 2px;
      vertical-align: 3px;
      background: var(--accent);
    }
    .big-reading {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    .big {
      font-size: 2rem;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
      gap: 8px;
    }
    .stat {
      display: grid;
      gap: 2px;
      padding: 8px 10px;
      border: 1px solid var(--divider);
      border-radius: 8px;
      background: transparent;
      text-align: left;
      cursor: pointer;
    }
    .stat:disabled {
      cursor: default;
    }
    .stat-label {
      font-size: 0.72rem;
      color: var(--secondary-text-color);
    }
    .stat-value {
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }
    .stat.on .stat-value::before {
      content: "";
      display: inline-block;
      width: 7px;
      height: 7px;
      margin-right: 6px;
      border-radius: 50%;
      vertical-align: 1px;
      background: #4ade80;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .entity-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
      gap: 0 18px;
    }
    .entity-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 7px 0;
      border: 0;
      border-bottom: 1px solid var(--divider);
      background: none;
      font-size: 0.86rem;
      text-align: left;
      cursor: pointer;
    }
    .empty {
      margin: 0;
      color: var(--secondary-text-color);
    }

    /* Usage */
    viessmann-boiler-usage {
      display: block;
    }
    .series-toggles {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .series-toggle {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      border: 1px solid var(--divider);
      border-radius: 999px;
      background: transparent;
      font-size: 0.82rem;
      cursor: pointer;
    }
    .series-toggle[aria-pressed="false"] {
      color: var(--secondary-text-color);
    }
    .series-toggle[aria-pressed="false"] .key.line {
      background: transparent;
      box-shadow: inset 0 0 0 1px var(--secondary-text-color);
    }
    .key.line {
      width: 14px;
      height: 3px;
      margin-right: 0;
      border-radius: 2px;
      vertical-align: 3px;
      background: var(--c);
    }
    .key.bar {
      border-radius: 2px;
      background: var(--series-boiler);
    }
    .key.bar.whole-hours {
      background: repeating-linear-gradient(
        45deg,
        var(--series-boiler) 0 2px,
        color-mix(in srgb, var(--series-boiler) 30%, transparent) 2px 4px
      );
    }
    .chart {
      position: relative;
      border-radius: 6px;
      outline: none;
      touch-action: pan-y;
      transition: opacity 0.2s;
    }
    .chart:focus-visible {
      box-shadow: 0 0 0 2px var(--accent);
    }
    .chart.loading {
      opacity: 0.55;
    }
    .usage-chart {
      display: block;
      width: 100%;
      height: auto;
    }
    .usage-chart .grid,
    .usage-chart .crosshair {
      stroke: var(--divider);
      stroke-width: 1;
      vector-effect: non-scaling-stroke;
    }
    .usage-chart .crosshair {
      stroke: var(--secondary-text-color);
    }
    .usage-chart .tick {
      font-size: 10px;
      font-variant-numeric: tabular-nums;
      fill: var(--secondary-text-color);
    }
    .series-line {
      stroke: var(--c);
      stroke-width: 2;
      stroke-linecap: round;
      vector-effect: non-scaling-stroke;
    }
    .hover-dot {
      fill: var(--c);
      stroke: var(--ha-card-background, var(--card-background-color, #fff));
      stroke-width: 2;
      vector-effect: non-scaling-stroke;
    }
    .usage-chart .bar {
      fill: var(--series-boiler);
      transition: opacity 0.15s;
    }
    .bars.hovering .bar:not(.active) {
      opacity: 0.45;
    }
    .hatch-back {
      fill: var(--series-boiler);
      opacity: 0.3;
    }
    .hatch-line {
      fill: var(--series-boiler);
    }
    .tip {
      position: absolute;
      top: 4px;
      z-index: 1;
      display: grid;
      gap: 3px;
      padding: 8px 10px;
      border-radius: 8px;
      font-size: 0.78rem;
      white-space: nowrap;
      color: var(--primary-text-color);
      background: var(--ha-card-background, var(--card-background-color, #fff));
      box-shadow: 0 0 0 1px var(--divider), 0 4px 12px rgba(0, 0, 0, 0.16);
      transform: translateX(12px);
      pointer-events: none;
    }
    .tip.left {
      transform: translateX(calc(-100% - 12px));
    }
    .tip-head {
      color: var(--secondary-text-color);
    }
    .tip-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tip strong {
      font-variant-numeric: tabular-nums;
    }
  `;
}
