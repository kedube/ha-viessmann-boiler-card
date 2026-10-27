import type { BoilerCardConfig } from "../types";
import type { ComponentSpec } from "./catalog";
import type { Pt } from "./geometry";

// A 2D front-elevation diagram in diagram pixels: the boiler side on the left,
// the plate heat exchanger in the middle, and the radiant side with its zone
// loops on the right. Every pipe ends at a part, a manifold, a zone or a
// labelled inlet/outlet.

export type PipeMaterial = "copper" | "pex";

export interface Part {
  key: string;
  spec: ComponentSpec;
  /** Top-left of the image in diagram pixels. */
  x: number;
  y: number;
  /** Diagram pixels per image pixel. */
  scale: number;
  name: string;
  /** Short tag printed on pumps, e.g. BOILER. */
  tag?: string;
}

export interface Pipe {
  key: string;
  /** Loops this pipe belongs to; it shows flow while any of them flows. */
  loops: string[];
  /** Hot side, cold side, or a coil where the water gives off its heat on the way through. */
  side: "supply" | "return" | "coil";
  material: PipeMaterial;
  width: number;
  /** Polyline in flow direction. */
  points: Pt[];
}

/** A tee or manifold fitting where pipes join. */
export interface Joint {
  at: Pt;
  width: number;
  vertical: boolean;
}

/** Where a pipe leaves the diagram, with its shut-off valve and label. */
export interface Terminal {
  key: string;
  at: Pt;
  dir: Pt;
  label: string;
  labelSide?: "left" | "right";
}

export interface ZoneTile {
  index: number;
  key: string;
  name: string;
  loop: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Diagram {
  width: number;
  height: number;
  floor: { y: number; x0: number; x1: number };
  parts: Part[];
  pipes: Pipe[];
  joints: Joint[];
  terminals: Terminal[];
  zones: ZoneTile[];
  /** Label anchors; `below` anchors hang their label under the point. */
  anchors: Record<string, { at: Pt; below?: boolean }>;
}

export const DEFAULT_BOILER = "vitocrossal-300-cu3a-199";
export const PART_IDS = {
  tank: "vitocell-300-v-56",
  pumpRed: "circulator-red",
  pumpBlack: "circulator-black",
  hx: "plate-hx",
  mixer: "mixing-valve",
  zoneValve: "zone-valve",
  tempering: "tempering-valve",
} as const;

export function componentIds(config: BoilerCardConfig): string[] {
  return [config.model ?? DEFAULT_BOILER, ...Object.values(PART_IDS)];
}

// Diagram pixels per millimetre: appliances at true relative size, small parts
// enlarged so they stay legible.
const APPLIANCE = 0.36;
const PART = 0.5;
const PIPE = { main: 13, branch: 10, pex: 7 };

const FLOOR = 800;
const SUPPLY_Y = 120; // top run of the boiler's heating loop
const DHW_GAP = 230; // from the tank's coil connections to the boiler's DHW connections
const TEMPERING_Y = 200; // thermostatic mixing valve above the tank
const HX_CLEARANCE = 90; // from the heating supply drop to the heat exchanger, room for its label
const RADIANT_RETURN_Y = 772;
const ROW_TOP = 100;
const ROW_PITCH = 100;
const TILE_W = 300;
const TILE_TOP = 60; // tile top sits this far above its branch line
const TILE_BOTTOM = 20; // and its bottom this far below
const COIL_PITCH = 15;
const TERMINAL_Y = 46;

export function buildDiagram(specFor: (id: string) => ComponentSpec, config: BoilerCardConfig): Diagram {
  const circuits = config.circuits ?? [];
  const primary = circuits.find((c) => !c.separated_by);
  const radiant = circuits.find((c) => c.separated_by === "heat_exchanger");
  const radiantLoop = `circuit${radiant?.circuit ?? 2}`;
  const zoneConfigs = radiant?.zones?.length ? radiant.zones : [{ name: radiant?.name ?? "Radiant circuit" }];
  const zoneLoop = (i: number) => (radiant?.zones?.length ? `${radiantLoop}.zone${i}` : radiantLoop);

  const parts: Part[] = [];
  const pipes: Pipe[] = [];
  const joints: Joint[] = [];
  const terminals: Terminal[] = [];

  /** Places a part so its anchor, or the named port, lands at `at`. */
  const place = (key: string, id: string, mm: number, at: Pt, name: string, by?: string, tag?: string): Part => {
    const spec = specFor(id);
    const scale = mm / spec.pxPerMm;
    const ref: Pt = by ? [spec.ports[by].x, spec.ports[by].y] : spec.anchor;
    const part: Part = { key, spec, scale, x: at[0] - ref[0] * scale, y: at[1] - ref[1] * scale, name, tag };
    parts.push(part);
    return part;
  };
  const port = (p: Part, name: string): Pt => {
    const s = p.spec.ports[name];
    return [p.x + s.x * p.scale, p.y + s.y * p.scale];
  };
  const left = (p: Part) => p.x;
  const right = (p: Part) => p.x + p.spec.width * p.scale;
  const top = (p: Part) => p.y;
  const bottom = (p: Part) => p.y + p.spec.height * p.scale;
  const centre = (p: Part) => (left(p) + right(p)) / 2;
  const pipe = (key: string, loops: string[], side: Pipe["side"], width: number, points: Pt[], material: PipeMaterial = "copper") =>
    pipes.push({ key, loops, side, material, width, points });

  /** Places an inline part (inlet left, outlet right) centred on the straight run from a to b. */
  const between = (key: string, id: string, a: Pt, b: Pt, name: string, tag?: string): Part => {
    const spec = specFor(id);
    const span = (spec.ports.outlet.x - spec.ports.inlet.x) * (PART / spec.pxPerMm);
    return place(key, id, PART, [(a[0] + b[0]) / 2 - span / 2, a[1]], name, "inlet", tag);
  };

  // Boiler side: two separate loops through the boiler, with no shared fittings.
  // DHW (Viessmann's Vitocell piping): hot water runs through the DHW pump into
  // the tank's upper coil connection, and the cooler water comes back from the
  // lower one. Heating: warm water rises from the top through the BOILER pump
  // into the heat exchanger and comes straight back from its bottom.
  const tank = place("tank", PART_IDS.tank, APPLIANCE, [185, FLOOR], "Vitocell 300-V");
  const coilUpper = port(tank, "coil_upper");
  const coilLower = port(tank, "coil_lower");

  const boilerId = config.model ?? DEFAULT_BOILER;
  const boilerSpec = specFor(boilerId);
  const dhwOffset = (boilerSpec.ports.dhw_supply.x - boilerSpec.anchor[0]) * (APPLIANCE / boilerSpec.pxPerMm);
  const boiler = place("boiler", boilerId, APPLIANCE, [coilUpper[0] + DHW_GAP - dhwOffset, FLOOR], "Vitocrossal 300");
  const dhwSupply = port(boiler, "dhw_supply");
  const dhwReturn = port(boiler, "dhw_return");
  const supply = port(boiler, "supply");
  const ret = port(boiler, "return");

  const dhwPump = between("dhw-pump", PART_IDS.pumpRed, coilUpper, dhwSupply, "Hot water pump", "DHW");
  pipe("dhw-supply", ["dhw"], "supply", PIPE.branch, level(dhwSupply, port(dhwPump, "outlet")));
  pipe("dhw-to-tank", ["dhw"], "supply", PIPE.branch, level(port(dhwPump, "inlet"), coilUpper));
  pipe("dhw-return", ["dhw"], "return", PIPE.branch, level(coilLower, dhwReturn));

  const boilerPump = place(
    "boiler-pump",
    PART_IDS.pumpRed,
    PART,
    [supply[0] + 60, SUPPLY_Y],
    "Boiler pump",
    "inlet",
    primary?.pump_label ?? "BOILER",
  );
  const bpOut = port(boilerPump, "outlet");
  // The supply drops right after the pump, leaving clear space above the heat
  // exchanger for its label. The exchanger hangs with its bottom connection
  // level with the boiler return.
  const hxDrop = bpOut[0] + 28;
  const hx = place(
    "hx",
    PART_IDS.hx,
    PART,
    [Math.max(hxDrop + HX_CLEARANCE, ret[0] + 90), ret[1]],
    "Heat exchanger",
    "p1_out",
  );
  const p1In = port(hx, "p1_in");
  const p1Out = port(hx, "p1_out");
  const p2Out = port(hx, "p2_out");
  const p2In = port(hx, "p2_in");
  pipe("boiler-supply", ["boiler"], "supply", PIPE.main, [supply, [supply[0], SUPPLY_Y], port(boilerPump, "inlet")]);
  pipe("pump-to-hx", ["boiler"], "supply", PIPE.main, [bpOut, [hxDrop, bpOut[1]], [hxDrop, p1In[1]], p1In]);
  pipe("hx-return", ["boiler"], "return", PIPE.main, level(p1Out, ret));

  // Domestic water on top of the tank: cold in beside the hot outlet, and a
  // thermostatic mixing valve tempering the hot water on its way to the taps.
  const hot = port(tank, "hot_out");
  const cold = port(tank, "cold_in");
  const tempering = place("tempering", PART_IDS.tempering, PART, [(hot[0] + cold[0]) / 2, TEMPERING_Y], "Mixing valve");
  const temperCold = port(tempering, "cold");
  const temperHot = port(tempering, "hot");
  const mixed = port(tempering, "mixed");
  const coldTee: Pt = [cold[0], temperCold[1]];
  pipe("tap-cold", ["tap"], "return", PIPE.branch, [[cold[0], TERMINAL_Y], cold]);
  pipe("tap-cold-to-mixer", ["tap"], "return", PIPE.branch, [coldTee, temperCold]);
  pipe("tap-hot", ["tap"], "supply", PIPE.branch, [hot, [hot[0], temperHot[1]], temperHot]);
  pipe("tap-mixed", ["tap"], "supply", PIPE.branch, [mixed, [mixed[0], TERMINAL_Y]]);
  joints.push({ at: coldTee, width: PIPE.branch, vertical: true });
  terminals.push(
    { key: "cold", at: [cold[0], TERMINAL_Y], dir: [0, -1], label: "Cold water in", labelSide: "left" },
    { key: "hot", at: [mixed[0], TERMINAL_Y], dir: [0, -1], label: "Hot water to taps" },
  );

  // Radiant side: mixing valve, RADIANT pump, supply manifold.
  const mixer = place("mixer", PART_IDS.mixer, PART, [p2Out[0] + 70, p2Out[1]], "Mixing valve", "a");
  const mixAb = port(mixer, "ab");
  const mixB = port(mixer, "b");
  const radiantPump = place(
    "radiant-pump",
    PART_IDS.pumpBlack,
    PART,
    [mixAb[0] + 40, mixAb[1]],
    "Radiant pump",
    "inlet",
    radiant?.pump_label ?? "RADIANT",
  );
  const rpOut = port(radiantPump, "outlet");
  pipe("hx-to-mixer", [radiantLoop], "supply", PIPE.main, [p2Out, port(mixer, "a")]);
  pipe("mixer-to-pump", [radiantLoop], "supply", PIPE.main, [mixAb, port(radiantPump, "inlet")]);

  const m1 = rpOut[0] + 60;
  const feedY = rpOut[1];
  pipe("pump-to-manifold", [radiantLoop], "supply", PIPE.main, [rpOut, [m1, feedY]]);
  joints.push({ at: [m1, feedY], width: PIPE.main, vertical: true });

  const rows = zoneConfigs.map((_, i) => ROW_TOP + i * ROW_PITCH);
  const valves = rows.map((y, i) => place(`zone-valve-${i}`, PART_IDS.zoneValve, PART, [m1 + 30, y], "Zone valve", "inlet"));
  const tileX = port(valves[0], "outlet")[0] + 30;
  const m2 = tileX + TILE_W + 40;

  // Supply manifold, split where the flow divides: each segment flows for the zones beyond it.
  const supplyNodes = [...new Set([...rows, feedY])].sort((a, b) => a - b);
  for (let k = 0; k < supplyNodes.length - 1; k++) {
    const [ya, yb] = [supplyNodes[k], supplyNodes[k + 1]];
    const above = yb <= feedY;
    const served = rows.flatMap((y, i) => ((above ? y <= ya : y >= yb) ? [zoneLoop(i)] : []));
    const points: Pt[] = above ? [[m1, yb], [m1, ya]] : [[m1, ya], [m1, yb]];
    pipe(`supply-manifold-${k}`, served, "supply", PIPE.main, points);
  }

  // Zone loops: zone valve, PEX coil in the zone tile, back to the return manifold.
  const zones: ZoneTile[] = zoneConfigs.map((z, i) => {
    const y = rows[i];
    const loop = zoneLoop(i);
    pipe(`zone-${i}-supply`, [loop], "supply", PIPE.branch, [[m1, y], port(valves[i], "inlet")]);
    pipe(`zone-${i}-to-coil`, [loop], "supply", PIPE.branch, [port(valves[i], "outlet"), [tileX, y]]);
    pipe(`zone-${i}-coil`, [loop], "coil", PIPE.pex, coil(tileX, tileX + TILE_W, y, y - TILE_TOP + 14), "pex");
    pipe(`zone-${i}-return`, [loop], "return", PIPE.branch, [[tileX + TILE_W, y], [m2, y]]);
    joints.push({ at: [m1, y], width: PIPE.main, vertical: true }, { at: [m2, y], width: PIPE.main, vertical: true });
    return { index: i, key: `zone-${i}`, name: z.name, loop, x: tileX, y: y - TILE_TOP, w: TILE_W, h: TILE_TOP + TILE_BOTTOM };
  });

  // Return manifold flows down; each segment carries the zones above it.
  for (let i = 0; i < rows.length - 1; i++) {
    pipe(`return-manifold-${i}`, rows.slice(0, i + 1).map((_, j) => zoneLoop(j)), "return", PIPE.main, [
      [m2, rows[i]],
      [m2, rows[i + 1]],
    ]);
  }

  // Back along the floor to the mixing valve bypass and the heat exchanger.
  const hxReturnX = p2In[0] + 34;
  const bypassTee: Pt = [mixB[0], RADIANT_RETURN_Y];
  pipe("radiant-return", [radiantLoop], "return", PIPE.main, [[m2, rows[rows.length - 1]], [m2, RADIANT_RETURN_Y], bypassTee]);
  pipe("mixer-bypass", [radiantLoop], "return", PIPE.branch, [bypassTee, mixB]);
  pipe("hx-secondary-return", [radiantLoop], "return", PIPE.main, [
    bypassTee,
    [hxReturnX, RADIANT_RETURN_Y],
    [hxReturnX, p2In[1]],
    p2In,
  ]);
  joints.push({ at: bypassTee, width: PIPE.main, vertical: false });

  const below = (p: Part) => ({ at: [centre(p), bottom(p) + 4] as Pt, below: true });
  const burner = boiler.spec.points.burner_glow;
  return {
    width: m2 + 50,
    height: FLOOR + 36,
    floor: { y: FLOOR, x0: left(tank) - 30, x1: right(boiler) + 30 },
    parts,
    pipes,
    joints,
    terminals,
    zones,
    anchors: {
      boiler: { at: [centre(boiler), top(boiler) + (bottom(boiler) - top(boiler)) * 0.3] },
      tank: { at: [centre(tank), top(tank) + (bottom(tank) - top(tank)) * 0.28] },
      hx: { at: [centre(hx), top(hx) - 6] },
      radiant: below(radiantPump),
      // Where the burner's glow shows on the boiler; the render marks its combustion area.
      burner: {
        at: burner
          ? [boiler.x + burner[0] * boiler.scale, boiler.y + burner[1] * boiler.scale]
          : [centre(boiler), top(boiler) + (bottom(boiler) - top(boiler)) * 0.6],
      },
    },
  };
}

/** A straight run from a to b, with a jog halfway if the two aren't level. */
function level(a: Pt, b: Pt): Pt[] {
  if (Math.abs(a[1] - b[1]) < 0.5) return [a, [b[0], a[1]]];
  const mid = (a[0] + b[0]) / 2;
  return [a, [mid, a[1]], [mid, b[1]], b];
}

/**
 * A zone's PEX coil: in along the branch line, a square wave of passes up to
 * `top` and back, then out along the branch line. Filleting rounds it into a
 * serpentine.
 */
function coil(x0: number, x1: number, y: number, top: number): Pt[] {
  const start = x0 + 150;
  const end = x1 - 18;
  const pairs = Math.max(1, Math.floor(((end - start) / COIL_PITCH - 1) / 2));
  const points: Pt[] = [
    [x0, y],
    [start, y],
  ];
  for (let k = 0; k <= pairs * 2 - 1; k++) {
    const x = start + k * COIL_PITCH;
    const [from, to] = k % 2 === 0 ? [y, top] : [top, y];
    if (k > 0) points.push([x, from]);
    points.push([x, to]);
  }
  points.push([x1, y]);
  return points;
}
