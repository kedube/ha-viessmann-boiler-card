import type { PanelContext } from "./context";

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Friendly name without the device name in front of it. */
export function shortName(ctx: PanelContext, entityId: string): string {
  const name = String(ctx.hass.states[entityId]?.attributes.friendly_name ?? entityId);
  const device = ctx.hass.devices[ctx.vicare.deviceId];
  const prefix = device?.name_by_user ?? device?.name;
  return prefix && name.startsWith(`${prefix} `) ? name.slice(prefix.length + 1) : name;
}

/** "42 min", "3 h" or "3 h 12 min". */
export function duration(minutes: number): string {
  const m = Math.round(minutes);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return m % 60 ? `${h} h ${m % 60} min` : `${h} h`;
}
