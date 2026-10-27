"""Check renders against their ports.json (run with a normal Python that has Pillow).

  python3 tools/render/check_ports.py assets/renders [--out DIR] [--scale 2]

For every component it recomputes each port and point position from
anchor_px + the contract projection, fails if any differs from the stored px
by more than 0.5 px, and writes <id>-check.png: the render composited over the
card's wall colour with the anchor and ports marked.
"""

import argparse
import json
import os
import sys

from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import contract  # noqa: E402

WALL = (236, 232, 225)
FLOOR = (198, 200, 201)


def check(comp_dir, out_dir, scale):
    with open(os.path.join(comp_dir, 'ports.json')) as fh:
        data = json.load(fh)
    ax, ay = data['anchor_px']
    worst = 0.0
    for kind in ('ports', 'points'):
        for name, item in data[kind].items():
            dx, dy = contract.project_mm(item['pos_mm'])
            err = max(abs(ax + dx - item['px'][0]), abs(ay + dy - item['px'][1]))
            worst = max(worst, err)
            if err > 0.5:
                print(f"  FAIL {data['id']} {kind}.{name}: off by {err:.2f}px")

    img = Image.open(os.path.join(comp_dir, 'render.png')).convert('RGBA')
    bg = Image.new('RGBA', img.size, WALL + (255,))
    if data.get('mount') == 'floor':
        ImageDraw.Draw(bg).rectangle([0, ay, img.size[0], img.size[1]], fill=FLOOR + (255,))
    comp = Image.alpha_composite(bg, img)
    comp = comp.resize((comp.size[0] * scale, comp.size[1] * scale), Image.LANCZOS)
    d = ImageDraw.Draw(comp)
    r = 4 * scale
    d.line([(ax * scale - 3 * r, ay * scale), (ax * scale + 3 * r, ay * scale)], fill=(0, 90, 255), width=2)
    d.line([(ax * scale, ay * scale - 3 * r), (ax * scale, ay * scale + 3 * r)], fill=(0, 90, 255), width=2)
    for name, item in data['ports'].items():
        px, py = item['px'][0] * scale, item['px'][1] * scale
        d.ellipse([px - r, py - r, px + r, py + r], outline=(0, 200, 60), width=3)
        dx, dy = contract.project_mm(item['dir'])
        d.line([(px, py), (px + dx * 30 * scale, py + dy * 30 * scale)], fill=(0, 200, 60), width=2)
        d.text((px + r + 2, py - r), name, fill=(0, 120, 30))
    for name, item in data['points'].items():
        px, py = item['px'][0] * scale, item['px'][1] * scale
        d.rectangle([px - r / 2, py - r / 2, px + r / 2, py + r / 2], outline=(220, 0, 160), width=2)
        d.text((px + r, py + r), name, fill=(160, 0, 120))
    out = os.path.join(out_dir, f"{data['id']}-check.png")
    comp.convert('RGB').save(out)
    print(f"{data['id']}: worst projection error {worst:.3f}px -> {out}")
    return worst <= 0.5


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('renders')
    ap.add_argument('--out', default=None)
    ap.add_argument('--scale', type=int, default=2)
    args = ap.parse_args()
    out_dir = args.out or args.renders
    os.makedirs(out_dir, exist_ok=True)
    ok = True
    for cid in sorted(os.listdir(args.renders)):
        comp_dir = os.path.join(args.renders, cid)
        if os.path.isfile(os.path.join(comp_dir, 'ports.json')):
            ok = check(comp_dir, out_dir, args.scale) and ok
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
