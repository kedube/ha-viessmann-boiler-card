"""Render to PNG + WebP and write ports.json."""

import json
import os

import bpy

from . import contract


def render(scene, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    png = os.path.join(out_dir, 'render.png')
    webp = os.path.join(out_dir, 'render.webp')
    settings = scene.render.image_settings
    settings.file_format = 'PNG'
    settings.color_mode = 'RGBA'
    settings.color_depth = '8'
    settings.compression = 90
    scene.render.filepath = png
    bpy.ops.render.render(write_still=True)

    settings.file_format = 'WEBP'
    settings.color_mode = 'RGBA'
    settings.quality = 95  # 90 shows faint blocking in the large panel gradients
    bpy.data.images['Render Result'].save_render(webp, scene=scene)
    return png, webp


def _px(anchor, p):
    x, y = contract.project_mm(p)
    return [round(anchor[0] + x, 2), round(anchor[1] + y, 2)]


def ports_json(component, frame, bounds, out_dir):
    anchor = frame['anchor']
    data = {
        'id': component.id,
        'version': 1,
        'camera': {'yaw_deg': contract.YAW_DEG, 'pitch_deg': contract.PITCH_DEG,
                   'px_per_mm': contract.PX_PER_MM},
        'light_dir': [round(c, 4) for c in contract.KEY_LIGHT_DIR],
        'mount': 'floor' if component.floor_standing else 'inline',
        'image': {'file': 'render.webp', 'width': frame['width'], 'height': frame['height']},
        'anchor_px': [round(anchor[0], 3), round(anchor[1], 3)],
        'bounds_mm': {'min': [round(c, 1) for c in bounds[0]],
                      'max': [round(c, 1) for c in bounds[1]]},
        'ports': {
            name: {
                'pos_mm': [round(c, 1) for c in port['pos']],
                'dir': [round(c, 4) for c in port['dir']],
                'diameter_mm': round(port['diameter'], 1),
                'px': _px(anchor, port['pos']),
            }
            for name, port in component.ports.items()
        },
        'points': {
            name: {'pos_mm': [round(c, 1) for c in pos], 'px': _px(anchor, pos)}
            for name, pos in component.points.items()
        },
    }
    if component.notes:
        data['notes'] = component.notes
    path = os.path.join(out_dir, 'ports.json')
    with open(path, 'w') as fh:
        json.dump(data, fh, indent=2)
        fh.write('\n')
    return path
