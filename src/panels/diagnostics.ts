import { html, type TemplateResult } from "lit";
import { formatTemperature } from "../util/temperature";
import type { PanelContext } from "./context";
import { stat } from "./controls";
import { capitalize, shortName } from "./format";

export function diagnosticsPanel(ctx: PanelContext): TemplateResult {
  const { state: st, vicare: v } = ctx;
  const d = v.device;
  const b = st.burner;
  const lang = ctx.hass.language ?? "en";
  const n = (value: number | null, digits = 0) =>
    value === null ? "–" : value.toLocaleString(lang, { maximumFractionDigits: digits, minimumFractionDigits: digits });
  const onOff = (id: string | undefined) => (id ? (ctx.hass.states[id]?.state === "on" ? "On" : "Off") : "–");

  const entities = [
    ...Object.values(d),
    ...Object.values(v.circuits).flatMap((c) => Object.values(c)),
    ...v.other,
  ]
    .filter((id, i, all) => all.indexOf(id) === i && ctx.hass.states[id])
    .sort((a, b) => shortName(ctx, a).localeCompare(shortName(ctx, b)));

  return html`
    <div class="panel-grid">
      <section class="panel">
        <header class="panel-head"><h3>Burner</h3><span class="muted">${lastUpdate(ctx, entities)}</span></header>
        <div class="stats">
          ${stat("Burner", b.on ? "On" : "Off", () => ctx.moreInfo(d.burner), b.on)}
          ${stat("Modulation", b.modulation === null ? "–" : `${n(b.modulation)} %`, () => ctx.moreInfo(d.burner_modulation))}
          ${stat("Hours", n(b.hours), () => ctx.moreInfo(d.burner_hours))}
          ${stat("Starts", n(b.starts), () => ctx.moreInfo(d.burner_starts))}
          ${stat("Run per start", b.minutesPerStart === null ? "–" : `${n(b.minutesPerStart, 1)} min`)}
          ${stat("Boiler", formatTemperature(st.boilerC, ctx.unit, 1), () => ctx.moreInfo(d.boiler_temperature))}
          ${stat("Outside", formatTemperature(st.outsideC, ctx.unit, 1), () => ctx.moreInfo(d.outside_temperature))}
        </div>
      </section>
      ${st.circuits.map((c) => {
        const e = v.circuits[c.circuit] ?? {};
        return html`
          <section class="panel">
            <header class="panel-head"><h3>${c.name}</h3><span class="muted">Circuit ${c.circuit}</span></header>
            <div class="stats">
              ${stat("Supply", formatTemperature(c.supplyC, ctx.unit, 1), () => ctx.moreInfo(e.supply_temperature))}
              ${stat("Pump", c.pumpOn ? "Running" : "Off", () => ctx.moreInfo(e.circulation_pump), c.pumpOn)}
              ${stat("Frost protection", onOff(e.frost_protection), () => ctx.moreInfo(e.frost_protection))}
            </div>
          </section>
        `;
      })}
      <section class="panel wide">
        <header class="panel-head"><h3>All ViCare entities</h3><span class="muted">${entities.length}</span></header>
        <div class="entity-list">
          ${entities.map(
            (id) => html`
              <button class="entity-row" @click=${() => ctx.moreInfo(id)}>
                <span>${shortName(ctx, id)}</span>
                <span class="muted">${display(ctx, id)}</span>
              </button>
            `,
          )}
        </div>
      </section>
    </div>
  `;
}

function display(ctx: PanelContext, entityId: string): string {
  const entity = ctx.hass.states[entityId];
  if (!entity) return "–";
  const unit = entity.attributes.unit_of_measurement as string | undefined;
  // Only plain numbers: entity ids like "sensor.x_2" or dates shouldn't be parsed.
  const value = /^-?\d+(\.\d+)?$/.test(entity.state) ? Number(entity.state) : NaN;
  if (Number.isFinite(value)) return `${value.toLocaleString(ctx.hass.language ?? "en")}${unit ? ` ${unit}` : ""}`;
  return capitalize(entity.state);
}

/** When ViCare last reported anything; it polls Viessmann about once a minute. */
function lastUpdate(ctx: PanelContext, entityIds: string[]): string {
  const latest = Math.max(...entityIds.map((id) => Date.parse(ctx.hass.states[id]?.last_updated ?? "") || 0));
  if (!latest) return "";
  const minutes = Math.round((Date.now() - latest) / 60000);
  const rtf = new Intl.RelativeTimeFormat(ctx.hass.language ?? "en", { numeric: "auto" });
  return `Updated ${rtf.format(-Math.max(0, minutes), "minute")}`;
}
