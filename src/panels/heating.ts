import { html, nothing, type TemplateResult } from "lit";
import type { CircuitState } from "../system/state";
import { formatTemperature, readCelsius } from "../util/temperature";
import type { PanelContext } from "./context";
import { field, limitsOf, segmented, stepper } from "./controls";
import { curveChart } from "./curve-chart";

// ViCare operating modes, as listed in a circuit's vicare_modes attribute.
const MODE_LABELS: Record<string, string> = {
  dhwAndHeating: "Heating & hot water",
  heating: "Heating only",
  dhw: "Hot water only",
  forcedNormal: "Always normal",
  forcedReduced: "Always reduced",
  standby: "Standby",
  dhwAndHeatingCooling: "Heating, cooling & hot water",
  heatingCooling: "Heating & cooling",
  cooling: "Cooling only",
};

const PROGRAM_LABELS: Record<string, string> = {
  normal: "Normal",
  reduced: "Reduced",
  comfort: "Comfort",
  eco: "Eco",
  standby: "Standby",
  external: "External",
  holiday: "Holiday",
};

export function heatingPanel(ctx: PanelContext): TemplateResult {
  return html`<div class="panel-grid">${ctx.state.circuits.map((c) => circuitPanel(ctx, c))}</div>`;
}

function circuitPanel(ctx: PanelContext, c: CircuitState): TemplateResult {
  const e = ctx.vicare.circuits[c.circuit] ?? {};
  const climate = e.heating;
  const a = climate ? (ctx.hass.states[climate]?.attributes ?? {}) : {};
  const modes = (a.vicare_modes as string[] | undefined) ?? [];
  const program = a.active_vicare_program as string | undefined;
  const presets = (a.preset_modes as string[] | undefined) ?? [];

  // Comfort and Eco are temporary programs; "home" drops back to the schedule.
  const presetOptions = [
    ...(presets.includes("home") ? [{ value: "home", label: "Schedule" }] : []),
    ...(presets.includes("comfort") ? [{ value: "comfort", label: "Comfort" }] : []),
    ...(presets.includes("eco") ? [{ value: "eco", label: "Eco" }] : []),
  ];
  const preset = a.preset_mode === "comfort" || a.preset_mode === "eco" ? (a.preset_mode as string) : "home";

  const status = [
    `${formatTemperature(c.supplyC, ctx.unit)} supply`,
    c.pumpOn ? "pump running" : "pump off",
    program ? `${PROGRAM_LABELS[program] ?? program} program` : undefined,
  ].filter(Boolean);

  return html`
    <section class="panel">
      <header class="panel-head">
        <h3>${c.name}</h3>
        <button class="link" @click=${() => ctx.moreInfo(climate)}>${status.join(" · ")}</button>
      </header>
      ${modes.length && climate
        ? field(
            "Mode",
            segmented(
              "Mode",
              modes.map((m) => ({ value: m, label: MODE_LABELS[m] ?? m })),
              a.active_vicare_mode as string | undefined,
              (m) => ctx.call("vicare", "set_vicare_mode", { entity_id: climate, vicare_mode: m }),
            ),
          )
        : nothing}
      ${presetOptions.length > 1 && climate
        ? field(
            "Program",
            segmented("Program", presetOptions, preset, (p) =>
              ctx.call("climate", "set_preset_mode", { entity_id: climate, preset_mode: p }),
            ),
          )
        : nothing}
      <div class="field-row">
        ${temperature(ctx, "Normal", e.normal_temperature ?? e.normal_heating_temperature)}
        ${temperature(ctx, "Reduced", e.reduced_temperature ?? e.reduced_heating_temperature)}
        ${temperature(ctx, "Comfort", e.comfort_temperature ?? e.comfort_heating_temperature)}
      </div>
      ${curve(ctx, c, e, program)}
    </section>
  `;
}

function temperature(ctx: PanelContext, label: string, entityId: string | undefined) {
  if (!entityId) return nothing;
  const limits = limitsOf(ctx.hass, entityId, { min: 3, max: 37, step: 1 });
  return field(
    `${label} room`,
    stepper({
      ...limits,
      label: `${label.toLowerCase()} room temperature`,
      value: ctx.value(entityId),
      pending: ctx.pending(entityId),
      onChange: (v) => ctx.setValue(entityId, v),
    }),
  );
}

function curve(ctx: PanelContext, c: CircuitState, e: Record<string, string>, program: string | undefined) {
  const slopeId = e.heating_curve_slope;
  const shiftId = e.heating_curve_shift;
  const slope = ctx.value(slopeId);
  const shift = ctx.value(shiftId);
  if (!slopeId || !shiftId || slope === null || shift === null) return nothing;

  const draft = ctx.curveDraft(c.circuit);
  const shown = draft ?? { slope, shift };
  const roomSetpoint = activeSetpointC(ctx, e, program) ?? 20;
  const edit = (change: Partial<typeof shown>) => ctx.setCurveDraft(c.circuit, { ...shown, ...change });

  return html`
    <div class="curve">
      <div class="field-row">
        ${field(
          "Curve slope",
          stepper({
            ...limitsOf(ctx.hass, slopeId, { min: 0.2, max: 3.5, step: 0.1 }),
            unit: undefined,
            label: "heating curve slope",
            value: shown.slope,
            pending: !!draft || ctx.pending(slopeId),
            onChange: (v) => edit({ slope: v }),
          }),
        )}
        ${field(
          "Curve shift",
          stepper({
            ...limitsOf(ctx.hass, shiftId, { min: -13, max: 40, step: 1 }),
            unit: undefined,
            label: "heating curve shift",
            value: shown.shift,
            pending: !!draft || ctx.pending(shiftId),
            onChange: (v) => edit({ shift: v }),
          }),
        )}
        ${draft
          ? html`
              <div class="curve-actions">
                <button class="primary" @click=${() => ctx.applyCurve(c.circuit)}>Apply</button>
                <button @click=${() => ctx.setCurveDraft(c.circuit, undefined)}>Cancel</button>
              </div>
            `
          : nothing}
      </div>
      ${curveChart({
        curve: { slope, shift, roomSetpoint },
        draft: draft ? { ...draft, roomSetpoint } : undefined,
        outsideC: ctx.state.outsideC,
        supplyC: c.supplyC,
        unit: ctx.unit,
      })}
    </div>
  `;
}

/** The room setpoint the curve is following now, in °C. Eco runs 3 °C below normal. */
function activeSetpointC(ctx: PanelContext, e: Record<string, string>, program: string | undefined): number | null {
  const read = (id: string | undefined) => readCelsius(ctx.hass, id);
  switch (program) {
    case "reduced":
      return read(e.reduced_temperature ?? e.reduced_heating_temperature);
    case "comfort":
      return read(e.comfort_temperature ?? e.comfort_heating_temperature);
    case "eco": {
      const normal = read(e.normal_temperature ?? e.normal_heating_temperature);
      return normal === null ? null : normal - 3;
    }
    default:
      return read(e.normal_temperature ?? e.normal_heating_temperature);
  }
}
