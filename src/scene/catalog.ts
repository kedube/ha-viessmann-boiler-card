import type { Pt } from "./geometry";

// Each component is rendered by tools/render as a straight-on front view into
// `<asset_url>/<id>/`, with a ports.json describing where its pipe connections
// are. Until a render loads, a simple placeholder drawn from the specs below
// stands in. All positions here are image pixels (x right, y down).

export interface Port {
  x: number;
  y: number;
  /** Direction a pipe leaves the port, in image coordinates. */
  dir: Pt;
  diameter: number;
}

export interface ComponentSpec {
  id: string;
  width: number;
  height: number;
  pxPerMm: number;
  /** Image pixel of the component's local origin (floor centre or part centre). */
  anchor: Pt;
  ports: Record<string, Port>;
  points: Record<string, Pt>;
  /** Render URL, when one is available. */
  image?: string;
}

type Dir3 = [number, number, number];
interface MmDef {
  /** Front-view extents in millimetres: [x, z] from the local origin. */
  min: [number, number];
  max: [number, number];
  ports: Record<string, { at: [number, number]; dir: Dir3; d: number }>;
  points?: Record<string, [number, number]>;
}

const LEFT: Dir3 = [-1, 0, 0];
const RIGHT: Dir3 = [1, 0, 0];
const UP: Dir3 = [0, 0, 1];
const DOWN: Dir3 = [0, 0, -1];

const PLACEHOLDERS: Record<string, MmDef> = {
  // Two separate loops through the boiler: heating (supply on top, return on the
  // right side) and DHW (both on the left side, level with the tank's coil:
  // hot out to the upper coil connection, back from the lower one).
  "vitocrossal-300-cu3a-199": {
    min: [-357, 0],
    max: [357, 1640],
    ports: {
      supply: { at: [-64, 1640], dir: UP, d: 34.9 },
      return: { at: [357, 1100], dir: RIGHT, d: 34.9 },
      dhw_supply: { at: [-357, 642], dir: LEFT, d: 28.6 },
      dhw_return: { at: [-357, 342], dir: LEFT, d: 28.6 },
    },
  },
  "vitocell-300-v-56": {
    min: [-344, 0],
    max: [344, 1444],
    ports: {
      coil_upper: { at: [344, 642], dir: RIGHT, d: 28.6 },
      coil_lower: { at: [344, 342], dir: RIGHT, d: 28.6 },
      hot_out: { at: [150, 1444], dir: UP, d: 22.2 },
      cold_in: { at: [-150, 1444], dir: UP, d: 22.2 },
    },
  },
  // Thermostatic mixing valve on the tank outlet: cold and hot in, tempered water out the top.
  "tempering-valve": {
    min: [-55, -45],
    max: [55, 60],
    ports: {
      cold: { at: [-55, 0], dir: LEFT, d: 22.2 },
      hot: { at: [55, 0], dir: RIGHT, d: 22.2 },
      mixed: { at: [0, 60], dir: UP, d: 22.2 },
    },
  },
  "circulator-red": {
    min: [-90, -80],
    max: [90, 130],
    ports: { inlet: { at: [-90, 0], dir: LEFT, d: 25.4 }, outlet: { at: [90, 0], dir: RIGHT, d: 25.4 } },
  },
  "plate-hx": {
    min: [-100, -170],
    max: [100, 170],
    ports: {
      p1_in: { at: [-100, 120], dir: LEFT, d: 25.4 },
      p1_out: { at: [-100, -120], dir: LEFT, d: 25.4 },
      p2_out: { at: [100, 120], dir: RIGHT, d: 25.4 },
      p2_in: { at: [100, -120], dir: RIGHT, d: 25.4 },
    },
  },
  "mixing-valve": {
    min: [-100, -110],
    max: [100, 160],
    ports: {
      a: { at: [-100, 0], dir: LEFT, d: 25.4 },
      ab: { at: [100, 0], dir: RIGHT, d: 25.4 },
      b: { at: [0, -110], dir: DOWN, d: 25.4 },
    },
  },
  "zone-valve": {
    min: [-55, -35],
    max: [55, 110],
    ports: { inlet: { at: [-55, 0], dir: LEFT, d: 19.05 }, outlet: { at: [55, 0], dir: RIGHT, d: 19.05 } },
  },
};
PLACEHOLDERS["circulator-black"] = PLACEHOLDERS["circulator-red"];

const PLACEHOLDER_PX_PER_MM = 1;

export function placeholderSpec(id: string): ComponentSpec {
  const def = PLACEHOLDERS[id] ?? PLACEHOLDERS["circulator-red"];
  const k = PLACEHOLDER_PX_PER_MM;
  const toPx = ([x, z]: [number, number]): Pt => [(x - def.min[0]) * k, (def.max[1] - z) * k];
  return {
    id,
    pxPerMm: k,
    width: (def.max[0] - def.min[0]) * k,
    height: (def.max[1] - def.min[1]) * k,
    anchor: toPx([0, 0]),
    ports: Object.fromEntries(
      Object.entries(def.ports).map(([name, p]) => {
        const [x, y] = toPx(p.at);
        return [name, { x, y, dir: [p.dir[0], -p.dir[2]] as Pt, diameter: p.d }];
      }),
    ),
    points: Object.fromEntries(Object.entries(def.points ?? {}).map(([name, p]) => [name, toPx(p)])),
  };
}

export interface PortsJson {
  id: string;
  camera: { yaw_deg: number; pitch_deg: number; px_per_mm: number };
  image: { file: string; width: number; height: number };
  anchor_px: [number, number];
  ports: Record<string, { dir: Dir3; diameter_mm: number; px: [number, number] }>;
  points?: Record<string, { px: [number, number] }>;
}

const cache = new Map<string, Promise<ComponentSpec>>();

/** Loads a component's render and ports, falling back to the placeholder. */
export function loadComponent(assetUrl: string, id: string): Promise<ComponentSpec> {
  const base = `${assetUrl.replace(/\/?$/, "/")}${id}/`;
  let pending = cache.get(base);
  if (!pending) {
    pending = fetch(`${base}ports.json`)
      .then((r) => (r.ok ? (r.json() as Promise<PortsJson>) : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((json) => specFromPortsJson(json, base))
      .catch(() => placeholderSpec(id));
    cache.set(base, pending);
  }
  return pending;
}

/** Ports the diagram connects to. */
function requiredPorts(id: string): string[] {
  return Object.keys(PLACEHOLDERS[id]?.ports ?? {});
}

export function specFromPortsJson(json: PortsJson, base: string): ComponentSpec {
  if (json.camera.yaw_deg !== 0 || json.camera.pitch_deg !== 0) {
    console.warn(`viessmann-boiler-card: ${json.id} is not a front view; using the placeholder`);
    return placeholderSpec(json.id);
  }
  const missing = requiredPorts(json.id).filter((name) => !json.ports[name]);
  if (missing.length) {
    console.warn(`viessmann-boiler-card: ${json.id} render lacks ${missing.join(", ")}; using the placeholder`);
    return placeholderSpec(json.id);
  }
  return {
    id: json.id,
    width: json.image.width,
    height: json.image.height,
    pxPerMm: json.camera.px_per_mm,
    anchor: json.anchor_px,
    ports: Object.fromEntries(
      Object.entries(json.ports).map(([name, p]) => {
        const len = Math.hypot(p.dir[0], p.dir[2]) || 1;
        return [name, { x: p.px[0], y: p.px[1], dir: [p.dir[0] / len, -p.dir[2] / len] as Pt, diameter: p.diameter_mm }];
      }),
    ),
    points: Object.fromEntries(Object.entries(json.points ?? {}).map(([name, p]) => [name, p.px])),
    image: `${base}${json.image.file}`,
  };
}
