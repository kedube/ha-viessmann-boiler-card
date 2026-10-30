import type { HistoryRow, StatisticRow } from "../src/system/history";
import { ENTITY as E } from "./fixtures";

// A made-up month of burner cycles and temperatures, standing in for Home
// Assistant's recorder. Like a default recorder, it keeps on/off and
// temperature history for 10 days and the hour counter's statistics for good.

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAYS = 31;
const KEEP_MS = 10 * 24 * HOUR_MS;

export interface FakeRecorder {
  history: Record<string, HistoryRow[]>;
  /** Hourly change of each statistic, oldest first. */
  statistics: Record<string, Array<StatisticRow & { start: number; end: number }>>;
}

export function simulateRecorder(now: number): FakeRecorder {
  const random = mulberry32(2026);
  const begin = Math.floor((now - DAYS * 24 * HOUR_MS) / HOUR_MS) * HOUR_MS;
  const kept = now - KEEP_MS;
  const history: Record<string, HistoryRow[]> = {};
  // Readings reach Home Assistant once a minute, when they change, like ViCare's polls.
  const record = (id: string, t: number, s: string) => {
    const rows = (history[id] ??= []);
    if (t >= kept && rows.at(-1)?.s !== s) rows.push({ s, lu: t / 1000 });
  };

  let boiler = 45;
  let radiant = 30;
  let tank = 48;
  let on = false;
  let charging = false;
  let ranMinutes = 0;
  const hourly: number[] = [];
  for (let t = begin, i = 0; t < now; t += MINUTE_MS, i++) {
    const at = new Date(t);
    const hour = at.getHours() + at.getMinutes() / 60;
    // Colder at night and as the month goes on.
    const outside = 11 - (6 * (t - begin)) / (DAYS * 24 * HOUR_MS) + 5 * Math.sin(((hour - 9) / 24) * 2 * Math.PI);
    const demand = Math.min(1, Math.max(0.1, (18 - outside) / 22));
    const target = charging ? 74 : 32 + 38 * demand;

    // Morning and evening showers draw the tank down; the boiler charges it below 44 °C.
    tank -= (hour > 6.5 && hour < 7.5) || (hour > 19 && hour < 19.7) ? 0.12 : 0.004;
    if (tank < 44) charging = true;
    if (charging) tank += 0.3;
    if (tank >= 50) charging = false;

    if (!on && boiler < target - 6) on = true;
    if (on && boiler >= target + 3) on = false;
    boiler += on ? 0.9 + random() * 0.4 : -(0.12 + 0.55 * demand);
    boiler = Math.max(28, boiler);
    radiant += (26 + 18 * demand + random() - radiant) * 0.05;
    if (on) ranMinutes++;
    if (i % 60 === 59) hourly.push(ranMinutes);

    record(E.burner, t, on ? "on" : "off");
    if (now - t <= 26 * HOUR_MS) {
      record(E.boiler, t, boiler.toFixed(1));
      record(E.supply1, t, Math.max(28, boiler - 0.6).toFixed(1));
      record(E.supply2, t, radiant.toFixed(1));
      record(E.tank, t, tank.toFixed(1));
    }
  }

  // The hour counter only counts whole hours, so its hourly change is 0 or 1.
  const counter = (minutes: number) => Math.floor(3180 + minutes / 60);
  const statistics: FakeRecorder["statistics"] = {
    [E.burnerHours]: hourly.map((ran, h) => ({
      start: begin + h * HOUR_MS,
      end: begin + (h + 1) * HOUR_MS,
      change: counter(ran) - counter(hourly[h - 1] ?? 0),
    })),
  };
  return { history, statistics };
}

/** A small seeded random number generator, so the dev page looks the same on every load. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
