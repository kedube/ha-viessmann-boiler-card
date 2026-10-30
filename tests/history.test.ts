import { describe, expect, it } from "vitest";
import { dayStarts, runDays, toPoints, valueAt, type HistoryRow } from "../src/system/history";

const HOUR = 3_600_000;
const days = dayStarts(new Date(2026, 9, 30, 15, 0).getTime(), 3);
const [d0, d1, d2] = days;
const now = d2 + 15 * HOUR;
const at = (t: number, s: string): HistoryRow => ({ s, lu: t / 1000 });

describe("burner run time per day", () => {
  it("adds up the on/off history within each local day", () => {
    const burner = [at(d0 - HOUR, "off"), at(d0 + 2 * HOUR, "on"), at(d0 + 2.5 * HOUR, "off"), at(d1 - 0.25 * HOUR, "on"), at(d1 + 0.5 * HOUR, "off")];
    const result = runDays(days, now, burner);
    expect(result.map((d) => d.minutes)).toEqual([45, 30, 0]);
    expect(result.every((d) => !d.wholeHours)).toBe(true);
  });

  it("counts today up to now while the burner is still on", () => {
    const result = runDays(days, now, [at(d0, "off"), at(now - 20 * 60_000, "on")]);
    expect(result[2].minutes).toBe(20);
  });

  it("uses the hour counter in whole hours before the on/off history begins", () => {
    // The recorder kept on/off history from 13:20 on day 1.
    const burner = [at(d1 + 13.33 * HOUR, "off"), at(d1 + 16 * HOUR, "on"), at(d1 + 16.5 * HOUR, "off")];
    const hours = [
      { start: d0 + 5 * HOUR, change: 1 },
      { start: d0 + 6 * HOUR, change: 0 },
      { start: d1 + 9 * HOUR, change: 1 },
      // After the cut at 14:00, the on/off history counts instead.
      { start: d1 + 16 * HOUR, change: 1 },
    ];
    const result = runDays(days, now, burner, hours);
    expect(result[0]).toEqual({ start: d0, minutes: 60, wholeHours: true });
    expect(result[1]).toEqual({ start: d1, minutes: 90, wholeHours: true });
    expect(result[2]).toEqual({ start: d2, minutes: 0, wholeHours: false });
  });

  it("leaves days without any record empty", () => {
    expect(runDays(days, now).map((d) => d.minutes)).toEqual([null, null, null]);
  });

  it("starts each day at local midnight", () => {
    expect(days.map((d) => new Date(d).getHours())).toEqual([0, 0, 0]);
    expect(new Date(d2).getDate()).toBe(30);
  });
});

describe("temperature readings", () => {
  it("converts to °C, moves the earlier state to the window's start and keeps gaps", () => {
    const points = toPoints([at(d1 - HOUR, "140"), at(d1 + HOUR, "unavailable"), at(d1 + 2 * HOUR, "122")], "°F", d1);
    expect(points).toEqual([
      { t: d1, c: 60 },
      { t: d1 + HOUR, c: null },
      { t: d1 + 2 * HOUR, c: 50 },
    ]);
    expect(valueAt(points, d1 + 0.5 * HOUR)).toBe(60);
    expect(valueAt(points, d1 + 1.5 * HOUR)).toBeNull();
    expect(valueAt(points, d1 - HOUR)).toBeNull();
  });
});
