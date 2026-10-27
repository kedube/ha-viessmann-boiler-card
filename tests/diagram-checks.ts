import type { Diagram } from "../src/scene/diagram";
import type { Pt } from "../src/scene/geometry";

// Shared structural checks for diagrams built from placeholder or rendered specs.

const near = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]) < 0.5;

export function onPolyline(p: Pt, points: Pt[]): boolean {
  for (let i = 1; i < points.length; i++) {
    const [a, b] = [points[i - 1], points[i]];
    const withinX = p[0] >= Math.min(a[0], b[0]) - 0.5 && p[0] <= Math.max(a[0], b[0]) + 0.5;
    const withinY = p[1] >= Math.min(a[1], b[1]) - 0.5 && p[1] <= Math.max(a[1], b[1]) + 0.5;
    const cross = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
    if (withinX && withinY && Math.abs(cross) < 0.5 * Math.hypot(b[0] - a[0], b[1] - a[1])) return true;
  }
  return false;
}

/** Pipe ends that touch no port, terminal or other pipe. */
export function danglingEnds(d: Diagram): string[] {
  const ports = d.parts.flatMap((p) => Object.values(p.spec.ports).map((s): Pt => [p.x + s.x * p.scale, p.y + s.y * p.scale]));
  const terminals = d.terminals.map((t) => t.at);
  return d.pipes.flatMap((pipe) =>
    [pipe.points[0], pipe.points[pipe.points.length - 1]]
      .filter(
        (end) =>
          !ports.some((p) => near(p, end)) &&
          !terminals.some((t) => near(t, end)) &&
          !d.pipes.some((other) => other !== pipe && onPolyline(end, other.points)),
      )
      .map((end) => `${pipe.key} at ${end.map((v) => v.toFixed(1)).join(",")}`),
  );
}

/** Pipe segments that are neither horizontal nor vertical. */
export function diagonalSegments(d: Diagram): string[] {
  return d.pipes.flatMap((pipe) =>
    pipe.points.slice(1).flatMap((b, i) => {
      const a = pipe.points[i];
      return Math.abs(a[0] - b[0]) < 1e-6 || Math.abs(a[1] - b[1]) < 1e-6 ? [] : [`${pipe.key} segment ${i + 1}`];
    }),
  );
}
