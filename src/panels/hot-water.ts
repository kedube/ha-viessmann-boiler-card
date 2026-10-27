import { html, nothing, type TemplateResult } from "lit";
import { formatTemperature } from "../util/temperature";
import type { PanelContext } from "./context";
import { field, limitsOf, segmented, stat, stepper } from "./controls";
import { capitalize, shortName } from "./format";

export function hotWaterPanel(ctx: PanelContext): TemplateResult {
  const d = ctx.vicare.device;
  const st = ctx.state;
  const heater = d.domestic_hot_water;
  // Prefer the number entity for the target; fall back to the water heater's own setpoint.
  const target = d.dhw_temperature ?? heater;
  const limits = limitsOf(ctx.hass, target, { min: 10, max: 60, step: 1, unit: ctx.unit });
  const onOff = (on: boolean) => (on ? "On" : "Off");
  // Device-specific extras, such as a hot water mode select or a one-time charge button.
  const selects = ctx.vicare.other.filter((id) => id.startsWith("select."));
  const buttons = ctx.vicare.other.filter((id) => id.startsWith("button."));

  return html`
    <div class="panel-grid">
      <section class="panel">
        <header class="panel-head">
          <h3>Hot water</h3>
          <button class="link" @click=${() => ctx.moreInfo(heater)}>Vitocell 300-V</button>
        </header>
        <div class="big-reading">
          <span class="big">${formatTemperature(st.tank.c, ctx.unit, 1)}</span>
          <span class="muted">in the tank</span>
        </div>
        ${target
          ? field(
              "Target",
              stepper({
                ...limits,
                label: "hot water target",
                value: ctx.value(target),
                pending: ctx.pending(target),
                onChange: (v) => ctx.setValue(target, v),
              }),
            )
          : nothing}
        <div class="stats">
          ${stat("Charging", onOff(st.tank.charging), () => ctx.moreInfo(d.domestic_hot_water_charging), st.tank.charging)}
          ${stat("DHW pump", onOff(st.tank.pumpOn), () => ctx.moreInfo(d.domestic_hot_water_pump), st.tank.pumpOn)}
          ${stat("Water heater", capitalize(heater ? (ctx.hass.states[heater]?.state ?? "–") : "–"), () => ctx.moreInfo(heater))}
        </div>
        ${selects.map((id) => selectField(ctx, id))}
        ${buttons.length
          ? html`<div class="actions">
              ${buttons.map(
                (id) =>
                  html`<button @click=${() => ctx.call("button", "press", { entity_id: id })}>${shortName(ctx, id)}</button>`,
              )}
            </div>`
          : nothing}
      </section>
    </div>
  `;
}

function selectField(ctx: PanelContext, entityId: string) {
  const entity = ctx.hass.states[entityId];
  const options = (entity?.attributes.options as string[] | undefined) ?? [];
  if (!options.length) return nothing;
  return field(
    shortName(ctx, entityId),
    segmented(
      shortName(ctx, entityId),
      options.map((o) => ({ value: o, label: o.charAt(0).toUpperCase() + o.slice(1) })),
      entity?.state,
      (option) => ctx.call("select", "select_option", { entity_id: entityId, option }),
    ),
  );
}

