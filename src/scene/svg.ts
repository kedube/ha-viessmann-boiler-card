import { svg, type SVGTemplateResult } from "lit";
import type { Diagram, Joint, Part, Pipe, PipeMaterial, Terminal, ZoneTile } from "./diagram";
import { distanceTo, fillet, normalAt, offsetTowardLight, pathD, polylineLength, slicePolyline, type Pt } from "./geometry";

/** Screen direction toward the key light (upper left). */
export const LIGHT: Pt = [-0.55, -0.835];

const FILLET = 1.5; // bend radius as a multiple of the pipe width
const BOILER_STUB_MM = 27; // side connections on the placeholder boiler

interface Palette {
  edge: string;
  body: string;
  light: string;
  spec: string;
  specOpacity: number;
  ring: string;
}

const TUBE: Record<PipeMaterial, Palette> = {
  copper: { edge: "#74401f", body: "#c07648", light: "#efb186", spec: "#fff4e8", specOpacity: 0.8, ring: "#5d3017" },
  pex: { edge: "#a99f92", body: "#ece6dc", light: "#fffcf6", spec: "#ffffff", specOpacity: 0.9, ring: "#8f8578" },
};

// Press fittings are a touch darker and redder than the tube.
const FITTING: Palette = {
  edge: "#6a361a",
  body: "#b56b40",
  light: "#e6a679",
  spec: "#ffefe0",
  specOpacity: 0.75,
  ring: "#4f2812",
};

export interface ShapedPipe {
  pipe: Pipe;
  points: Pt[];
  corners: Array<{ start: number; end: number }>;
  /** Bounds including the pipe width: [minX, minY, maxX, maxY]. */
  box: [number, number, number, number];
}

/** Rounds a pipe's bends and measures it; done once per layout. */
export function shapePipe(pipe: Pipe): ShapedPipe {
  const f = fillet(pipe.points, pipe.width * FILLET);
  const xs = f.points.map((p) => p[0]);
  const ys = f.points.map((p) => p[1]);
  const h = pipe.width / 2;
  return {
    pipe,
    points: f.points,
    corners: f.corners,
    box: [Math.min(...xs) - h, Math.min(...ys) - h, Math.max(...xs) + h, Math.max(...ys) + h],
  };
}

export function boxesOverlap(a: ShapedPipe, b: ShapedPipe): boolean {
  return a.box[0] < b.box[2] && b.box[0] < a.box[2] && a.box[1] < b.box[3] && b.box[1] < a.box[3];
}

export function defsSvg(d: Diagram): SVGTemplateResult {
  return svg`<defs>
    <filter id="pipe-shadow" filterUnits="userSpaceOnUse" x="0" y="0" width=${d.width} height=${d.height}>
      <feGaussianBlur stdDeviation="2.5" />
    </filter>
    <filter id="part-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="4" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.28" />
    </filter>
    <radialGradient id="contact" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#000" stop-opacity="0.35" />
      <stop offset="1" stop-color="#000" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" class="floor-top" />
      <stop offset="1" class="floor-bottom" />
    </linearGradient>
    <radialGradient id="burner-glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffb04a" stop-opacity="0.85" />
      <stop offset="0.45" stop-color="#ff7a1a" stop-opacity="0.35" />
      <stop offset="1" stop-color="#ff6a00" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="zone-warm" cx="0.75" cy="0.6" r="0.75">
      <stop offset="0" stop-color="#ff8a3d" stop-opacity="0.32" />
      <stop offset="1" stop-color="#ff8a3d" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="ph-steel" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#9ea3a8" /><stop offset="0.35" stop-color="#c9cdd1" /><stop offset="1" stop-color="#8d9297" />
    </linearGradient>
    <linearGradient id="ph-white" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#c9c9c6" /><stop offset="0.35" stop-color="#fafaf8" /><stop offset="1" stop-color="#b9b9b5" />
    </linearGradient>
  </defs>`;
}

/** The floor the tank and boiler stand on, with soft contact shadows. */
export function floorSvg(d: Diagram): SVGTemplateResult {
  const { y, x0, x1 } = d.floor;
  const standing = d.parts.filter((p) => p.key === "tank" || p.key === "boiler");
  return svg`
    <rect class="floor" x=${x0} y=${y} width=${x1 - x0} height=${d.height - y} fill="url(#floor)" />
    <line class="floor-line" x1=${x0} y1=${y} x2=${x1} y2=${y} />
    ${standing.map((p) => {
      const w = p.spec.width * p.scale;
      return svg`<ellipse cx=${p.x + w / 2} cy=${y} rx=${w * 0.56} ry="9" fill="url(#contact)" />`;
    })}`;
}

export function pipeShadowsSvg(pipes: ShapedPipe[]): SVGTemplateResult {
  return svg`<g filter="url(#pipe-shadow)" opacity="0.2" transform="translate(3 5)">
    ${pipes.map((p) => svg`<path d=${pathD(p.points)} stroke="#2b2117" stroke-width=${p.pipe.width * 0.9} />`)}
  </g>`;
}

function tube(points: Pt[], width: number, pal: Palette): SVGTemplateResult {
  const d = pathD(points);
  return svg`
    <path d=${d} stroke=${pal.edge} stroke-width=${width} />
    <path d=${d} stroke=${pal.body} stroke-width=${width * 0.8} />
    <path d=${pathD(offsetTowardLight(points, width * 0.17, LIGHT))} stroke=${pal.light} stroke-width=${width * 0.36} opacity="0.9" />
    <path d=${pathD(offsetTowardLight(points, width * 0.28, LIGHT))} stroke=${pal.spec} stroke-width=${Math.max(0.6, width * 0.08)} opacity=${pal.specOpacity} />
    <path d=${pathD(offsetTowardLight(points, -width * 0.3, LIGHT))} stroke=${pal.light} stroke-width=${width * 0.07} opacity="0.3" />`;
}

function ring(points: Pt[], at: number, width: number, pal: Palette): SVGTemplateResult {
  const i = Math.min(points.length - 1, Math.max(0, at));
  const [nx, ny] = normalAt(points, i);
  const [x, y] = points[i];
  const h = width * 0.6;
  return svg`<line x1=${x - nx * h} y1=${y - ny * h} x2=${x + nx * h} y2=${y + ny * h} stroke=${pal.ring} stroke-width=${Math.max(0.8, width * 0.08)} opacity="0.75" />`;
}

/** A pipe with press-fit elbows at every copper bend. */
export function pipeSvg(p: ShapedPipe): SVGTemplateResult {
  const { width, material } = p.pipe;
  const socket = width * 0.9;
  const fittings =
    material === "copper"
      ? p.corners.map(({ start, end }) => {
          const from = Math.max(0, distanceTo(p.points, start) - socket);
          const to = Math.min(polylineLength(p.points), distanceTo(p.points, end) + socket);
          const arc = slicePolyline(p.points, from, to);
          return svg`${tube(arc, width * 1.14, FITTING)}${ring(arc, 1, width * 1.14, FITTING)}${ring(arc, arc.length - 2, width * 1.14, FITTING)}`;
        })
      : null;
  return svg`<g class="pipe">${tube(p.points, width, TUBE[material])}${fittings}</g>`;
}

/** A tee on a header or manifold. */
export function jointSvg(j: Joint): SVGTemplateResult {
  const h = j.width * 0.95;
  const points: Pt[] = j.vertical
    ? [
        [j.at[0], j.at[1] - h],
        [j.at[0], j.at[1] + h],
      ]
    : [
        [j.at[0] - h, j.at[1]],
        [j.at[0] + h, j.at[1]],
      ];
  return svg`<g class="pipe">${tube(points, j.width * 1.16, FITTING)}${ring(points, 0, j.width * 1.16, FITTING)}${ring(points, 1, j.width * 1.16, FITTING)}</g>`;
}

/** A brass shut-off valve with a yellow lever where a pipe leaves the diagram, plus its label. */
export function terminalSvg(t: Terminal): SVGTemplateResult {
  const [x, y] = t.at;
  const vertical = t.dir[0] === 0;
  const body = vertical
    ? svg`<rect x=${x - 9} y=${y - 2} width="18" height="26" rx="4" class="brass" />`
    : svg`<rect x=${x - 2} y=${y - 9} width="26" height="18" rx="4" class="brass" />`;
  const lever = vertical
    ? svg`<rect x=${x + 6} y=${y + 6} width="26" height="6" rx="3" class="lever" />`
    : svg`<rect x=${x + 7} y=${y - 30} width="6" height="24" rx="3" class="lever" />`;
  const label = !vertical
    ? svg`<text class="terminal-label" x=${x - 10} y=${y + 5} text-anchor="end">${t.label}</text>`
    : t.labelSide === "left"
      ? svg`<text class="terminal-label" x=${x - 16} y=${y + 14} text-anchor="end">${t.label}</text>`
      : svg`<text class="terminal-label" x=${x + 40} y=${y + 14}>${t.label}</text>`;
  return svg`<g class="terminal">${body}${lever}${label}</g>`;
}

export function zoneTileSvg(z: ZoneTile, calling: boolean): SVGTemplateResult {
  return svg`<g class="zone ${calling ? "calling" : ""}">
    <rect class="tile" x=${z.x} y=${z.y} width=${z.w} height=${z.h} rx="10" />
    ${calling ? svg`<rect x=${z.x} y=${z.y} width=${z.w} height=${z.h} rx="10" fill="url(#zone-warm)" />` : null}
  </g>`;
}

export function zoneTextSvg(z: ZoneTile, calling: boolean, temps: string): SVGTemplateResult {
  const x = z.x + 14;
  return svg`<g class="zone-text ${calling ? "calling" : ""}">
    <circle cx=${x + 5} cy=${z.y + 21} r="5" class="dot" />
    <text class="zone-name" x=${x + 16} y=${z.y + 27}>${z.name}</text>
    <text class="zone-temp" x=${x} y=${z.y + 50}>${temps}</text>
    <rect class="hit" data-key=${z.key} x=${z.x} y=${z.y} width=${z.w} height=${z.h} />
  </g>`;
}

/** Live status shown on a part: a printed tag (like the labels on real pumps) and a status light. */
export interface PartStatus {
  tag?: string;
  on?: boolean;
}

export function partSvg(p: Part, status: PartStatus = {}): SVGTemplateResult {
  const w = p.spec.width * p.scale;
  const h = p.spec.height * p.scale;
  const body = p.spec.image
    ? svg`<image href=${p.spec.image} x=${p.x} y=${p.y} width=${w} height=${h} preserveAspectRatio="none" />`
    : placeholder(p, w, h);
  return svg`<g filter="url(#part-shadow)">${body}</g>${statusSvg(p, w, status)}
    <rect class="hit" data-key=${p.key} x=${p.x} y=${p.y} width=${w} height=${h} />`;
}

function statusSvg(p: Part, w: number, { tag, on }: PartStatus): SVGTemplateResult | null {
  if (tag === undefined && on === undefined) return null;
  const cx = p.x + w / 2;
  const cy = p.y + 14;
  const tagW = tag ? tag.length * 9.6 + 14 : 0;
  const led: Pt = tag ? [cx + tagW / 2 + 9, cy] : [p.x + w - 6, p.y + 8];
  return svg`<g class="status ${on ? "on" : ""}">
    ${tag
      ? svg`<rect class="tag" x=${cx - tagW / 2} y=${cy - 10} width=${tagW} height="20" rx="3" />
        <text class="tag-text" x=${cx} y=${cy + 5} text-anchor="middle">${tag}</text>`
      : null}
    ${on !== undefined
      ? svg`<circle class="led-halo" cx=${led[0]} cy=${led[1]} r="9" /><circle class="led" cx=${led[0]} cy=${led[1]} r="5" />`
      : null}
  </g>`;
}

/** Simple stand-ins drawn until a part's render is available. */
function placeholder(p: Part, w: number, h: number): SVGTemplateResult {
  return svg`${placeholderBody(p, w, h)}${placeholderStubs(p)}`;
}

/** Short brass connection stubs at the ports a placeholder's pipes attach to. */
function placeholderStubs(p: Part): SVGTemplateResult[] {
  const boiler = p.key === "boiler";
  return Object.values(p.spec.ports).map((port) => {
    const d = Math.max(8, port.diameter * p.spec.pxPerMm * p.scale * 1.3);
    const onTop = port.dir[1] < 0;
    const len = boiler ? (onTop ? p.spec.height * p.scale * 0.088 : BOILER_STUB_MM * p.scale) : 12;
    const x = p.x + port.x * p.scale;
    const y = p.y + port.y * p.scale;
    // The stub runs from the port back into the part, against the pipe direction.
    const [dx, dy] = [-port.dir[0] * len, -port.dir[1] * len];
    return svg`<rect x=${Math.min(x, x + dx) - (dx ? 0 : d / 2)} y=${Math.min(y, y + dy) - (dy ? 0 : d / 2)}
      width=${dx ? Math.abs(dx) : d} height=${dy ? Math.abs(dy) : d} rx="2" class="brass" />`;
  });
}

function placeholderBody(p: Part, w: number, h: number): SVGTemplateResult {
  const { x, y } = p;
  const id = p.spec.id;
  if (id.startsWith("vitocrossal") || id.startsWith("vitodens")) {
    const stub = h * 0.088;
    const inset = BOILER_STUB_MM * p.scale; // side connections stick out this far
    const [cx, cw] = [x + inset, w - 2 * inset];
    return svg`
      <rect x=${cx} y=${y + stub} width=${cw} height=${h - stub} rx="5" fill="url(#ph-steel)" />
      <rect x=${cx} y=${y + stub} width="3.5" height=${h - stub} fill="#c8102e" />
      <rect x=${cx + cw - 3.5} y=${y + stub} width="3.5" height=${h - stub} fill="#c8102e" />
      <rect x=${cx + cw * 0.3} y=${y + stub - 16} width=${cw * 0.4} height="16" rx="3" fill="#e2551b" />`;
  }
  if (id.startsWith("vitocell")) {
    return svg`<rect x=${x} y=${y} width=${w} height=${h} rx=${w * 0.1} fill="url(#ph-white)" stroke="#a9a9a5" />`;
  }
  if (id.startsWith("circulator")) {
    const colour = id.endsWith("black") ? "#2a2c2e" : "#a3242a";
    return svg`
      <rect x=${x + w * 0.1} y=${y + h * 0.42} width=${w * 0.8} height=${h * 0.36} rx="6" fill=${colour} />
      <circle cx=${x + w / 2} cy=${y + h * 0.45} r=${Math.min(w, h) * 0.32} fill=${colour} stroke="#111" stroke-opacity="0.4" />
      <rect x=${x + w * 0.3} y=${y} width=${w * 0.4} height=${h * 0.2} rx="3" fill=${colour} />`;
  }
  if (id === "plate-hx") {
    return svg`<rect x=${x + w * 0.2} y=${y} width=${w * 0.6} height=${h} rx="4" fill="url(#ph-steel)" stroke="#6f757b" />`;
  }
  if (id === "tempering-valve") {
    return svg`
      <rect x=${x + w * 0.42} y=${y} width=${w * 0.16} height=${h * 0.5} class="brass" />
      <rect x=${x} y=${y + h * 0.42} width=${w} height=${h * 0.3} rx="5" class="brass" />
      <circle cx=${x + w / 2} cy=${y + h * 0.84} r=${Math.min(w, h) * 0.16} fill="#8e9398" />`;
  }
  if (id === "mixing-valve") {
    return svg`
      <rect x=${x + w * 0.4} y=${y + h * 0.55} width=${w * 0.2} height=${h * 0.45} fill="#2e3033" />
      <rect x=${x} y=${y + h * 0.5} width=${w} height=${h * 0.2} rx="4" fill="#2e3033" />
      <rect x=${x + w * 0.22} y=${y} width=${w * 0.56} height=${h * 0.5} rx="5" fill="#1c1d1f" stroke="#55585c" />`;
  }
  return svg`
    <rect x=${x} y=${y + h * 0.66} width=${w} height=${h * 0.2} rx="3" fill="#b8922f" />
    <rect x=${x + w * 0.12} y=${y} width=${w * 0.76} height=${h * 0.66} rx="4" fill="#8e9398" />`;
}
