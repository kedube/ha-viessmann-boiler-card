import { html, nothing, svg, type TemplateResult } from "lit";
import { valueAt, type Point, type RunDay } from "../system/history";
import { formatTemperature, fromCelsius } from "../util/temperature";
import { duration } from "./format";

// Same frame as the heating curve chart, so the panels line up.
const W = 340;
const H = 180;
const PAD = { left: 36, right: 12, top: 10, bottom: 26 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;
const BASE = H - PAD.bottom;
const MINUTE_MS = 60_000;
const KEY_STEP_MS = 15 * MINUTE_MS;
let patternIds = 0;

export interface Series {
  key: string;
  label: string;
  /** CSS colour, from the card's series palette. */
  color: string;
  points: Point[];
}

export interface TemperatureChartOptions {
  series: Series[];
  start: number;
  end: number;
  unit: string;
  lang: string;
  loading?: boolean;
  /** The time under the pointer or keyboard focus. */
  hover?: number;
  onHover(t: number | undefined): void;
}

export function temperatureChart(o: TemperatureChartOptions): TemplateResult {
  const span = o.end - o.start;
  const x = (t: number) => PAD.left + ((t - o.start) / span) * PLOT_W;
  const display = (c: number) => fromCelsius(c, o.unit);
  const values = o.series.flatMap((s) => s.points.flatMap((p) => (p.c === null ? [] : [display(p.c)])));
  const range = niceRange(values.length ? values : [display(20), display(80)], [5, 10, 20, 25, 50]);
  const yv = (v: number) => BASE - ((v - range.min) / (range.max - range.min)) * PLOT_H;
  const y = (c: number) => yv(display(c));

  const hour = new Intl.DateTimeFormat(o.lang, { hour: "numeric" });
  const time = new Intl.DateTimeFormat(o.lang, { hour: "numeric", minute: "2-digit" });
  const hx = o.hover === undefined ? null : x(o.hover);
  const at = (s: Series) => (o.hover === undefined ? null : valueAt(s.points, o.hover));

  const pick = (k: number) => o.start + Math.round((k * span) / MINUTE_MS) * MINUTE_MS;
  const step = (dir: number) => Math.min(o.end, Math.max(o.start, (o.hover ?? o.end) + dir * KEY_STEP_MS));

  return frame({
    label: "Temperatures over the last 24 hours",
    loading: o.loading,
    onPick: (k) => o.onHover(pick(k)),
    onStep: (dir) => o.onHover(dir ? step(dir) : (o.hover ?? o.end)),
    onClear: () => o.onHover(undefined),
    plot: svg`
      ${ticks(range).map(
        (v) => svg`
          <line class="grid" x1=${PAD.left} x2=${W - PAD.right} y1=${yv(v)} y2=${yv(v)} />
          <text class="tick" x=${PAD.left - 6} y=${yv(v) + 3.5} text-anchor="end">${v}°</text>`,
      )}
      ${sixHourMarks(o.start, o.end).map(
        (t) => svg`<text class="tick" x=${x(t)} y=${BASE + 15} text-anchor="middle">${hour.format(t)}</text>`,
      )}
      ${o.series.map((s) => svg`<path class="series-line" style="--c:${s.color}" d=${stepPath(s.points, o.end, x, y)} />`)}
      ${hx === null
        ? nothing
        : svg`
          <line class="crosshair" x1=${hx} x2=${hx} y1=${PAD.top} y2=${BASE} />
          ${o.series.map((s) => {
            const c = at(s);
            return c === null ? nothing : svg`<circle class="hover-dot" style="--c:${s.color}" cx=${hx} cy=${y(c)} r="4" />`;
          })}`}
    `,
    tip:
      o.hover === undefined
        ? nothing
        : tip(
            x(o.hover),
            html`
              <span class="tip-head">${time.format(o.hover)}</span>
              ${o.series.map(
                (s) => html`
                  <span class="tip-row">
                    <i class="key line" style="--c:${s.color}"></i>
                    <strong>${formatTemperature(at(s), o.unit, 1)}</strong>
                    <span class="muted">${s.label}</span>
                  </span>
                `,
              )}
            `,
          ),
  });
}

export interface RunTimeChartOptions {
  days: RunDay[];
  lang: string;
  loading?: boolean;
  /** The day under the pointer or keyboard focus. */
  hover?: number;
  onHover(index: number | undefined): void;
}

export function runTimeChart(o: RunTimeChartOptions): TemplateResult {
  const n = o.days.length;
  const band = PLOT_W / n;
  const barW = Math.min(24, band - 2);
  const hours = o.days.map((d) => (d.minutes ?? 0) / 60);
  const range = niceRange([0, 1, ...hours], [1, 2, 3, 4, 6, 12]);
  const y = (h: number) => BASE - (h / range.max) * PLOT_H;
  const x = (i: number) => PAD.left + i * band + (band - barW) / 2;

  const short = new Intl.DateTimeFormat(o.lang, { month: "short", day: "numeric" });
  const long = new Intl.DateTimeFormat(o.lang, { weekday: "short", month: "short", day: "numeric" });
  const today = n - 1;
  const hatch = `whole-hours-${++patternIds}`;
  const day = o.hover === undefined ? undefined : o.days[o.hover];

  return frame({
    label: `Burner run time per day over the last ${n} days`,
    loading: o.loading,
    onPick: (k) => o.onHover(Math.min(today, Math.floor(k * n))),
    onStep: (dir) => o.onHover(Math.min(today, Math.max(0, (o.hover ?? today) + dir))),
    onClear: () => o.onHover(undefined),
    plot: svg`
      <defs>
        <pattern id=${hatch} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect class="hatch-back" width="4" height="4" />
          <rect class="hatch-line" width="2" height="4" />
        </pattern>
      </defs>
      ${ticks(range).map(
        (h) => svg`
          <line class="grid" x1=${PAD.left} x2=${W - PAD.right} y1=${y(h)} y2=${y(h)} />
          <text class="tick" x=${PAD.left - 6} y=${y(h) + 3.5} text-anchor="end">${h} h</text>`,
      )}
      ${o.days.map((d, i) =>
        (today - i) % 7
          ? nothing
          : svg`<text class="tick" x=${x(i) + barW / 2} y=${BASE + 15} text-anchor="middle">${i === today ? "Today" : short.format(d.start)}</text>`,
      )}
      <g class="bars ${o.hover === undefined ? "" : "hovering"}">
        ${o.days.map((d, i) =>
          d.minutes
            ? svg`<path class="bar ${i === o.hover ? "active" : ""}" style=${d.wholeHours ? `fill:url(#${hatch})` : ""}
                d=${barPath(x(i), y(hours[i]), barW)} />`
            : nothing,
        )}
      </g>
    `,
    tip:
      o.hover === undefined || !day
        ? nothing
        : tip(
            x(o.hover) + barW / 2,
            html`
              <span class="tip-head">${o.hover === today ? "Today so far" : long.format(day.start)}</span>
              <strong>${day.minutes === null ? "No record" : duration(day.minutes)}</strong>
              ${day.wholeHours ? html`<span class="muted">Whole hours, from the hour counter</span>` : nothing}
            `,
          ),
  });
}

interface FrameOptions {
  label: string;
  loading?: boolean;
  plot: unknown;
  tip: unknown;
  /** Pointer at a position across the plot, 0 to 1. */
  onPick(k: number): void;
  /** Arrow keys: -1 or 1, or 0 when the chart takes focus. */
  onStep(dir: number): void;
  onClear(): void;
}

/** The chart, its tooltip, and pointer and arrow-key tracking; values are also in the tiles and legend. */
function frame(o: FrameOptions): TemplateResult {
  const track = (ev: PointerEvent) => {
    const rect = (ev.currentTarget as Element).getBoundingClientRect();
    const vx = ((ev.clientX - rect.left) / rect.width) * W;
    o.onPick(Math.min(1, Math.max(0, (vx - PAD.left) / PLOT_W)));
  };
  const key = (ev: KeyboardEvent) => {
    if (ev.key === "Escape") return o.onClear();
    const dir = ev.key === "ArrowLeft" ? -1 : ev.key === "ArrowRight" ? 1 : 0;
    if (!dir) return;
    ev.preventDefault();
    o.onStep(dir);
  };
  // A click or tap also focuses the chart; only keyboard focus starts at the latest point.
  const focus = (ev: FocusEvent) => (ev.currentTarget as Element).matches(":focus-visible") && o.onStep(0);
  return html`
    <div class="chart ${o.loading ? "loading" : ""}" tabindex="0" @keydown=${key} @focus=${focus} @blur=${o.onClear}>
      <svg
        class="usage-chart"
        viewBox="0 0 ${W} ${H}"
        role="img"
        aria-label=${o.label}
        @pointermove=${track}
        @pointerdown=${track}
        @pointerleave=${(ev: PointerEvent) => ev.pointerType === "mouse" && o.onClear()}
      >
        ${o.plot}
      </svg>
      ${o.tip}
    </div>
  `;
}

/** A tooltip beside a point on the chart, flipped to the left in the right half. */
function tip(atX: number, content: unknown): TemplateResult {
  return html`<div class="tip ${atX > W / 2 ? "left" : ""}" style="left:${((atX / W) * 100).toFixed(2)}%">${content}</div>`;
}

interface Range {
  min: number;
  max: number;
  step: number;
}

/** Bounds on round numbers, with at most five steps between them. */
function niceRange(values: number[], steps: number[]): Range {
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const step = steps.find((s) => Math.ceil(hi / s) - Math.floor(lo / s) <= 5) ?? steps[steps.length - 1];
  const min = Math.floor(lo / step) * step;
  return { min, max: Math.max(min + step, Math.ceil(hi / step) * step), step };
}

function ticks(r: Range): number[] {
  const out: number[] = [];
  for (let v = r.min; v <= r.max; v += r.step) out.push(v);
  return out;
}

/** Local times on the hour at 0:00, 6:00, 12:00 and 18:00 within the window. */
function sixHourMarks(start: number, end: number): number[] {
  const t = new Date(start);
  t.setMinutes(0, 0, 0);
  const out: number[] = [];
  for (t.setHours(t.getHours() + 1); t.getTime() < end; t.setHours(t.getHours() + 1)) {
    if (t.getHours() % 6 === 0) out.push(t.getTime());
  }
  return out;
}

/** Each reading holds until the next one; unavailable readings leave a gap. */
function stepPath(points: Point[], end: number, x: (t: number) => number, y: (c: number) => number): string {
  let d = "";
  let open = false;
  for (const p of points) {
    const px = x(p.t).toFixed(1);
    if (open) d += `H${px}`;
    if (p.c === null) {
      open = false;
      continue;
    }
    d += open ? `V${y(p.c).toFixed(1)}` : `M${px} ${y(p.c).toFixed(1)}`;
    open = true;
  }
  if (open) d += `H${x(end).toFixed(1)}`;
  return d;
}

/** A bar with a rounded top, square on the baseline. */
function barPath(x: number, top: number, w: number): string {
  const r = Math.min(4, w / 2, BASE - top);
  const f = (v: number) => v.toFixed(1);
  return (
    `M${f(x)} ${BASE}V${f(top + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + r)} ${f(top)}` +
    `H${f(x + w - r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + w)} ${f(top + r)}V${BASE}Z`
  );
}
