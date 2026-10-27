// 2D polyline helpers for drawing pipes in scene pixels.

export type Pt = [number, number];

export interface Filleted {
  points: Pt[];
  /** Index ranges of each rounded corner within `points`, used to draw fittings. */
  corners: Array<{ start: number; end: number }>;
}

/** Rounds polyline corners with quadratic arcs and returns a dense polyline. */
export function fillet(input: readonly (readonly [number, number])[], radius: number, steps = 8): Filleted {
  const pts = dedupe(input);
  if (pts.length < 3) return { points: pts, corners: [] };
  const out: Pt[] = [pts[0]];
  const corners: Filleted["corners"] = [];
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const c = pts[i + 1];
    const ab = dist(a, b);
    const bc = dist(b, c);
    const cross = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]);
    if (Math.abs(cross) < 1e-6 * ab * bc) continue;
    const r = Math.min(radius, ab / 2, bc / 2);
    const p0 = lerp(b, a, r / ab);
    const p2 = lerp(b, c, r / bc);
    const start = out.length;
    out.push(p0);
    for (let k = 1; k < steps; k++) out.push(quad(p0, b, p2, k / steps));
    out.push(p2);
    corners.push({ start, end: out.length - 1 });
  }
  out.push(pts[pts.length - 1]);
  return { points: out, corners };
}

/**
 * Shifts each point sideways toward the light by `amount × (light · normal)`, so a
 * highlight drawn along the result stays on the lit side as the pipe bends.
 */
export function offsetTowardLight(points: readonly Pt[], amount: number, light: readonly [number, number]): Pt[] {
  return points.map((p, i) => {
    const [nx, ny] = normalAt(points, i);
    const k = amount * (light[0] * nx + light[1] * ny);
    return [p[0] + k * nx, p[1] + k * ny];
  });
}

/** Unit normal of the polyline at point i (averaged over its neighbours). */
export function normalAt(points: readonly Pt[], i: number): Pt {
  const prev = points[Math.max(0, i - 1)];
  const next = points[Math.min(points.length - 1, i + 1)];
  const tx = next[0] - prev[0];
  const ty = next[1] - prev[1];
  const len = Math.hypot(tx, ty) || 1;
  return [-ty / len, tx / len];
}

export function pathD(points: readonly Pt[]): string {
  return points.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("");
}

export function polylineLength(points: readonly Pt[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += dist(points[i - 1], points[i]);
  return total;
}

/** The part of a polyline between two distances along it. */
export function slicePolyline(points: readonly Pt[], from: number, to: number): Pt[] {
  const out: Pt[] = [pointAlong(points, from)];
  let travelled = 0;
  for (let i = 1; i < points.length; i++) {
    travelled += dist(points[i - 1], points[i]);
    if (travelled > from && travelled < to) out.push(points[i]);
  }
  out.push(pointAlong(points, to));
  return out;
}

/** Distance along the polyline to point index i. */
export function distanceTo(points: readonly Pt[], index: number): number {
  let total = 0;
  for (let i = 1; i <= index; i++) total += dist(points[i - 1], points[i]);
  return total;
}

/** Point at a given distance along the polyline. */
export function pointAlong(points: readonly Pt[], distance: number): Pt {
  let remaining = distance;
  for (let i = 1; i < points.length; i++) {
    const seg = dist(points[i - 1], points[i]);
    if (remaining <= seg) return lerp(points[i - 1], points[i], seg ? remaining / seg : 0);
    remaining -= seg;
  }
  return points[points.length - 1];
}

export function dist(a: readonly [number, number], b: readonly [number, number]): number {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

function lerp(a: readonly [number, number], b: readonly [number, number], t: number): Pt {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

function quad(p0: Pt, p1: Pt, p2: Pt, t: number): Pt {
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]];
}

function dedupe(points: readonly (readonly [number, number])[]): Pt[] {
  const out: Pt[] = [];
  for (const p of points) {
    const last = out[out.length - 1];
    if (!last || dist(last, p) > 0.01) out.push([p[0], p[1]]);
  }
  return out;
}
