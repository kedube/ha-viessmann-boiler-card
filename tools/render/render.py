"""Render plant-room components for the Viessmann boiler card.

Run with Blender 5.0:
  /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup \
      -P tools/render/render.py -- --component <id|all> --out assets/renders [--samples N]
"""

import argparse
import os
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path:
    sys.path.insert(0, HERE)

import bpy  # noqa: E402

from components import REGISTRY  # noqa: E402
from lib import export, framing, geometry, materials, scene, stage  # noqa: E402


def parse_args():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    ap = argparse.ArgumentParser(prog='render.py')
    ap.add_argument('--component', default='all', help='component id or "all"')
    ap.add_argument('--out', default='assets/renders')
    ap.add_argument('--samples', type=int, default=256)
    ap.add_argument('--device', choices=('CPU', 'GPU'), default='CPU',
                    help='GPU uses Metal; its first run compiles kernels, which can take minutes')
    ap.add_argument('--blend', action='store_true', help='also save the .blend for inspection')
    return ap.parse_args(argv)


def render_one(cid, out_root, samples, device, save_blend):
    started = time.time()
    sc = scene.reset()
    scene.configure(sc, samples, device)
    coll = sc.collection
    comp = REGISTRY[cid]()
    comp.build(coll, materials.Library())
    pts = geometry.evaluated_points_mm(comp.objects)
    bounds = ([min(p[i] for p in pts) for i in range(3)], [max(p[i] for p in pts) for i in range(3)])
    centre = [(bounds[0][i] + bounds[1][i]) / 2 for i in range(3)]
    stage.world(sc, os.path.join(HERE, 'cache'))
    stage.lights(sc, centre)
    frame = framing.camera(sc, pts)
    out_dir = os.path.join(out_root, cid)
    png, _ = export.render(sc, out_dir)
    export.ports_json(comp, frame, bounds, out_dir)
    if save_blend:
        bpy.ops.wm.save_as_mainfile(filepath=os.path.join(out_dir, f'{cid}.blend'), copy=True)
    print(f'[render] {cid}: {frame["width"]}x{frame["height"]} px in {time.time() - started:.1f}s -> {png}')


OUTPUT_FILES = ('render.png', 'render.webp', 'ports.json')


def remove_stale(out_root):
    """Delete outputs of components that are no longer in the registry."""
    if not os.path.isdir(out_root):
        return
    for name in os.listdir(out_root):
        path = os.path.join(out_root, name)
        if name in REGISTRY or not os.path.isfile(os.path.join(path, 'ports.json')):
            continue
        for f in os.listdir(path):
            if f in OUTPUT_FILES or f.endswith('.blend'):
                os.remove(os.path.join(path, f))
        if not os.listdir(path):
            os.rmdir(path)
        print(f'[render] removed stale output {path}')


def main():
    args = parse_args()
    ids = list(REGISTRY) if args.component == 'all' else args.component.split(',')
    unknown = [c for c in ids if c not in REGISTRY]
    if unknown:
        raise SystemExit(f'unknown component(s): {", ".join(unknown)}; known: {", ".join(REGISTRY)}')
    out_root = os.path.abspath(args.out)
    if args.component == 'all':
        remove_stale(out_root)
    for cid in ids:
        render_one(cid, out_root, args.samples, args.device, args.blend)


main()
