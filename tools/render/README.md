# Render pipeline

Blender scripts that model the plant-room equipment and render each part as a
transparent image for the card's front-elevation diagram, plus a `ports.json`
telling the card where pipes attach.

## Usage

```sh
/Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup \
  -P tools/render/render.py -- --component all --out assets/renders --samples 256
python3 tools/render/check_ports.py assets/renders --out /tmp/port-checks
```

- `--component` takes one id, a comma-separated list, or `all` (which also
  removes outputs of components that no longer exist).
- `--device GPU` uses Metal. Its first run compiles kernels for several minutes;
  the default CPU path renders every part in well under a minute.
- `--blend` also saves each scene as a `.blend` for inspection.
- `check_ports.py` needs Pillow. It recomputes every port from `anchor_px` and
  the projection, fails on any difference over 0.5 px, and writes a check
  image per part with the anchor and ports marked.

Each part's `render.webp` and `ports.json` are committed, and `npm run build`
copies them into `dist/` for HACS. The full-size PNGs, saved `.blend` scenes,
check images and the HDRI cache (`tools/render/cache/`, Poly Haven CC0) are
gitignored.

## Contract with the card

- **Axes:** millimetres; X right, Y into the picture, Z up.
- **Camera:** orthographic, straight on (looking along +Y at the front faces),
  1.0 px per mm. Image x = X, image up = Z.
- **Projection:** `px = anchor_px + (x, -z)`.
- **Origin (`anchor_px`):** floor-standing parts at the centre of their
  footprint on the floor; everything else at the part's centre (the pipe axis
  for inline parts).
- **Ports:** always point in the picture plane (`dir` is ±X or ±Z) and
  `diameter_mm` is the outside diameter of the copper or vent pipe the card
  should draw into them.
- **Lighting:** one studio rig for every part (softbox key from
  front-upper-left, fill from the right, a top strip, low HDRI), no shadow
  catchers; the card adds its own drop shadow. `light_dir` in `ports.json` is
  the direction the key light travels.

`ports.json`:

```json
{
  "id": "plate-hx",
  "version": 1,
  "camera": {"yaw_deg": 0, "pitch_deg": 0, "px_per_mm": 1.0},
  "light_dir": [0.389, 0.777, -0.492],
  "mount": "inline",
  "image": {"file": "render.webp", "width": 198, "height": 343},
  "anchor_px": [99.0, 171.5],
  "bounds_mm": {"min": [-83, -150, -155], "max": [83, -1, 155]},
  "ports": {"p1_in": {"pos_mm": [-83, -138, 120], "dir": [-1, 0, 0], "diameter_mm": 28.6, "px": [16.0, 51.5]}},
  "points": {"label": {"pos_mm": [0, -100, 0], "px": [99.0, 171.5]}}
}
```

## Components

| id | ports | notes |
|---|---|---|
| `vitocrossal-300-cu3a-199` | supply (up); return (right, 1100 mm); dhw_supply (left, 642 mm), dhw_return (left, 342 mm) | CU3A-199 drawings; heating and DHW loops separate; no gas or vent pipes |
| `vitocell-300-v-56` | coil_upper (642 mm), coil_lower (342 mm) (right); cold_in (x −150), hot_out (x +150) (up) | 53 USG Vitocell 300-V EVIB dimensions |
| `circulator-red`, `circulator-black` | inlet (left), outlet (right) | with isolation flange valves |
| `plate-hx` | p1_in, p1_out (left), p2_out, p2_in (right) | counter-flow, street elbows |
| `mixing-valve` | a (left), ab (right), b (down) | motor box facing the viewer |
| `zone-valve` | inlet (left), outlet (right) | 3/4" body, grey actuator |
| `tempering-valve` | cold (left), hot (right), mixed (up) | thermostatic mixing valve, 3/4" unions, grey cap facing the viewer |

Each part lives in `components/<name>.py`; shared camera, lights, materials and
geometry helpers are in `lib/`.
