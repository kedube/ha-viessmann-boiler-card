import type { HomeAssistant } from "../types";
import { toCelsius } from "../util/temperature";

// Reads what Home Assistant's recorder already stored from ViCare's polls, so
// none of this uses the Viessmann API allowance.

const HOUR_MS = 3_600_000;

/** A row of `history/history_during_period` with `minimal_response`: state and last update in seconds. */
export interface HistoryRow {
  s: string;
  lu: number;
}

/** A row of `recorder/statistics_during_period`; recent Home Assistant versions send times in ms. */
export interface StatisticRow {
  start: number | string;
  change?: number | null;
}

/** A reading in °C, or null while the sensor was unavailable. */
export interface Point {
  t: number;
  c: number | null;
}

export interface RunDay {
  /** Local midnight. */
  start: number;
  /** Minutes the burner ran, or null when Home Assistant has nothing for the day. */
  minutes: number | null;
  /** Part of the day came from the burner hour counter, so it's in whole hours. */
  wholeHours: boolean;
}

export function fetchHistory(
  hass: HomeAssistant,
  entityIds: string[],
  start: number,
  end: number,
): Promise<Record<string, HistoryRow[]>> {
  if (!entityIds.length) return Promise.resolve({});
  return hass.callWS({
    type: "history/history_during_period",
    start_time: new Date(start).toISOString(),
    end_time: new Date(end).toISOString(),
    entity_ids: entityIds,
    minimal_response: true,
    no_attributes: true,
  });
}

export function fetchHourlyChanges(
  hass: HomeAssistant,
  statisticId: string | undefined,
  start: number,
  end: number,
): Promise<StatisticRow[]> {
  if (!statisticId) return Promise.resolve([]);
  return hass
    .callWS<Record<string, StatisticRow[]>>({
      type: "recorder/statistics_during_period",
      start_time: new Date(start).toISOString(),
      end_time: new Date(end).toISOString(),
      statistic_ids: [statisticId],
      period: "hour",
      types: ["change"],
    })
    .then((result) => result[statisticId] ?? []);
}

/** Readings in °C; the state from before the window is moved to its start. */
export function toPoints(rows: HistoryRow[] = [], unit: string | undefined, start: number): Point[] {
  return rows.map((r) => {
    const v = Number.parseFloat(r.s);
    return { t: Math.max(start, r.lu * 1000), c: Number.isFinite(v) ? toCelsius(v, unit) : null };
  });
}

/** The reading in effect at a time: sensors hold their value until the next report. */
export function valueAt(points: Point[], t: number): number | null {
  let value: number | null = null;
  for (const p of points) {
    if (p.t > t) break;
    value = p.c;
  }
  return value;
}

/** Local midnights of the last `days` days, oldest first. */
export function dayStarts(now: number, days: number): number[] {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    return d.getTime();
  });
}

/**
 * Burner run time per day. The recorder keeps on/off history for a limited
 * time (10 days by default), which gives run time to about a ViCare poll.
 * Before that, the burner hour counter's long-term statistics fill in, in
 * whole hours.
 */
export function runDays(days: number[], now: number, burner: HistoryRow[] = [], hours: StatisticRow[] = []): RunDay[] {
  const windowStart = days[0];
  const changes = states(burner, windowStart);
  // On/off history covers the window from its first row on.
  const from = changes.length ? changes[0].t : Infinity;
  const cut = from <= windowStart ? windowStart : Math.ceil(from / HOUR_MS) * HOUR_MS;
  const spans: Array<[number, number]> = [];
  changes.forEach((c, i) => {
    if (c.s === "on") spans.push([c.t, changes[i + 1]?.t ?? now]);
  });
  const counter = hours.map((h) => ({ start: typeof h.start === "number" ? h.start : Date.parse(h.start), hours: h.change ?? 0 }));

  return days.map((start, i) => {
    const end = Math.min(days[i + 1] ?? now, now);
    const split = Math.min(Math.max(cut, start), end);
    const counted = counter.filter((h) => h.start >= start && h.start < split);
    const ranMs = spans.reduce((sum, [a, b]) => sum + Math.max(0, Math.min(b, end) - Math.max(a, split)), 0);
    if (split === end && !counted.length) return { start, minutes: null, wholeHours: false };
    const minutes = counted.reduce((sum, h) => sum + h.hours * 60, 0) + ranMs / 60_000;
    return { start, minutes, wholeHours: split > start };
  });
}

function states(rows: HistoryRow[], start: number): Array<{ s: string; t: number }> {
  return rows.map((r) => ({ s: r.s, t: Math.max(start, r.lu * 1000) })).sort((a, b) => a.t - b.t);
}
