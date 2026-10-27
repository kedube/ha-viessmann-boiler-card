import { html, nothing, type TemplateResult } from "lit";
import type { HomeAssistant } from "../types";

// Small controls styled with Home Assistant's theme variables. They work
// without Home Assistant's own components, so the dev page can show them too.

export interface Limits {
  min: number;
  max: number;
  step: number;
  unit?: string;
}

/** Limits of a number, water heater or climate entity, in its display unit. */
export function limitsOf(hass: HomeAssistant, entityId: string | undefined, fallback: Limits): Limits {
  const a = entityId ? hass.states[entityId]?.attributes : undefined;
  if (!a) return fallback;
  const num = (...keys: string[]) => {
    for (const k of keys) if (typeof a[k] === "number") return a[k] as number;
    return undefined;
  };
  return {
    min: num("min", "min_temp") ?? fallback.min,
    max: num("max", "max_temp") ?? fallback.max,
    step: num("step", "target_temp_step") ?? fallback.step,
    unit: (a.unit_of_measurement as string | undefined) ?? fallback.unit,
  };
}

export interface StepperOptions extends Limits {
  value: number | null;
  pending?: boolean;
  label: string;
  onChange(value: number): void;
}

export function stepper(o: StepperOptions): TemplateResult {
  const digits = decimals(o.step);
  const set = (v: number) => o.onChange(Number(Math.min(o.max, Math.max(o.min, v)).toFixed(digits)));
  const v = o.value;
  return html`
    <span class="stepper ${o.pending ? "pending" : ""}">
      <button class="step" ?disabled=${v === null || v <= o.min} @click=${() => v !== null && set(v - o.step)} aria-label="Lower ${o.label}">−</button>
      <span class="step-value">${v === null ? "–" : v.toFixed(digits)}${o.unit ? html`<small>${o.unit}</small>` : nothing}</span>
      <button class="step" ?disabled=${v === null || v >= o.max} @click=${() => v !== null && set(v + o.step)} aria-label="Raise ${o.label}">+</button>
    </span>
  `;
}

export function segmented<T extends string>(
  label: string,
  options: Array<{ value: T; label: string }>,
  current: T | undefined,
  onSelect: (value: T) => void,
): TemplateResult {
  return html`
    <div class="segmented" role="radiogroup" aria-label=${label}>
      ${options.map(
        (o) => html`
          <button
            role="radio"
            aria-checked=${o.value === current}
            class=${o.value === current ? "selected" : ""}
            @click=${() => o.value !== current && onSelect(o.value)}
          >
            ${o.label}
          </button>
        `,
      )}
    </div>
  `;
}

export function field(label: string, control: unknown): TemplateResult {
  return html`<div class="field"><span class="field-label">${label}</span>${control}</div>`;
}

/** A labelled reading; tapping it opens the entity's more-info dialog. */
export function stat(label: string, value: string, onTap?: () => void, active?: boolean): TemplateResult {
  return html`
    <button class="stat ${active ? "on" : ""}" ?disabled=${!onTap} @click=${() => onTap?.()}>
      <span class="stat-label">${label}</span>
      <span class="stat-value">${value}</span>
    </button>
  `;
}

function decimals(step: number): number {
  const s = String(step);
  return s.includes(".") ? s.split(".")[1].length : 0;
}
