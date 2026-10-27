import { html, nothing, svg, type TemplateResult } from "lit";
import { supplyTarget, type HeatingCurve } from "../util/heating-curve";
import { formatTemperature, fromCelsius } from "../util/temperature";

const W = 340;
const H = 180;
const PAD = { left: 36, right: 12, top: 10, bottom: 26 };
// Outside temperature runs warm to cold, left to right, as on Viessmann's charts.
const WARMEST = 20;
const COLDEST = -20;
const CEILING_C = 100;
let clipIds = 0;

export interface CurveChartOptions {
  curve: HeatingCurve;
  /** An edited curve that hasn't been applied yet. */
  draft?: HeatingCurve;
  outsideC: number | null;
  supplyC: number | null;
  unit: string;
}

export function curveChart(o: CurveChartOptions): TemplateResult {
  const sample = (curve: HeatingCurve) => {
    const points: Array<[number, number]> = [];
    for (let t = WARMEST; t >= COLDEST; t -= 1) points.push([t, supplyTarget(curve, t)]);
    return points;
  };
  const current = sample(o.curve);
  const draft = o.draft ? sample(o.draft) : [];
  const values = [...current, ...draft].map((p) => p[1]).concat(o.supplyC ?? []);
  const yMin = Math.min(20, Math.floor(Math.min(...values) / 10) * 10);
  // Steep curves run past anything a boiler supplies; the chart stops at 100 °C and clips them.
  const yMax = Math.min(CEILING_C, Math.max(yMin + 30, Math.ceil(Math.max(...values) / 10) * 10));

  const x = (t: number) => PAD.left + ((WARMEST - t) / (WARMEST - COLDEST)) * (W - PAD.left - PAD.right);
  const y = (c: number) => H - PAD.bottom - ((c - yMin) / (yMax - yMin)) * (H - PAD.top - PAD.bottom);
  const path = (points: Array<[number, number]>) =>
    points.map(([t, c], i) => `${i ? "L" : "M"}${x(t).toFixed(1)} ${y(c).toFixed(1)}`).join("");
  const deg = (c: number) => `${Math.round(fromCelsius(c, o.unit))}°`;

  const xTicks = [20, 10, 0, -10, -20];
  const yTicks: number[] = [];
  for (let c = yMin; c <= yMax; c += 10) yTicks.push(c);

  const outside = o.outsideC;
  const target = outside === null ? null : supplyTarget(o.curve, outside);
  // Where today's outside temperature sits on the curve, when it's on the chart.
  const now = outside !== null && target !== null && outside <= WARMEST && outside >= COLDEST ? x(outside) : null;

  const clip = `curve-plot-${++clipIds}`;
  return html`
    <svg class="curve-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Heating curve">
      <defs>
        <clipPath id=${clip}>
          <rect x=${PAD.left} y=${PAD.top - 3} width=${W - PAD.left - PAD.right} height=${H - PAD.top - PAD.bottom + 6} />
        </clipPath>
      </defs>
      ${yTicks.map(
        (c) => svg`
          <line class="grid" x1=${PAD.left} x2=${W - PAD.right} y1=${y(c)} y2=${y(c)} />
          <text class="tick" x=${PAD.left - 6} y=${y(c) + 3.5} text-anchor="end">${deg(c)}</text>`,
      )}
      ${xTicks.map(
        (t) => svg`<text class="tick" x=${x(t)} y=${H - PAD.bottom + 15} text-anchor="middle">${deg(t)}</text>`,
      )}
      <text class="axis" x=${W - PAD.right} y=${H - 2} text-anchor="end">Outside</text>
      <g clip-path="url(#${clip})">
        <path class="curve-line" d=${path(current)} />
        ${draft.length ? svg`<path class="curve-line draft" d=${path(draft)} />` : nothing}
      </g>
      ${now !== null && target !== null
        ? svg`
          <line class="now" x1=${now} x2=${now} y1=${PAD.top} y2=${H - PAD.bottom} />
          <circle class="target-dot" cx=${now} cy=${y(target)} r="4.5" />
          ${o.supplyC !== null ? svg`<circle class="supply-dot" cx=${now} cy=${y(o.supplyC)} r="5" />` : nothing}`
        : nothing}
    </svg>
    <div class="curve-legend">
      <span><i class="key target"></i>Target ${formatTemperature(target, o.unit)}</span>
      <span><i class="key supply"></i>Supply now ${formatTemperature(o.supplyC, o.unit)}</span>
      ${draft.length ? html`<span><i class="key draft"></i>New curve</span>` : nothing}
      <span class="muted">at ${formatTemperature(outside, o.unit, 1)} outside</span>
    </div>
  `;
}
