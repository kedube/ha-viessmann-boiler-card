"""Orthographic front camera fitted to the part, per the contract."""

import math

import bpy
from mathutils import Matrix, Vector

from . import contract, geometry


def camera(scene, points_mm):
    """Add the camera; returns image size and where the origin lands (anchor)."""
    xs, ys = zip(*(contract.project_mm(p) for p in points_mm))
    pad = contract.PADDING_PX
    ax, ay = pad - min(xs), pad - min(ys)
    width = int(math.ceil(ax + max(xs) + pad))
    height = int(math.ceil(ay + max(ys) + pad))

    # world point (mm) under the image centre, in the plane through the origin
    s = contract.PX_PER_MM
    cx, cy = (width / 2 - ax) / s, (height / 2 - ay) / s
    r, u, d = (Vector(contract.SCREEN_RIGHT), Vector(contract.SCREEN_UP),
               Vector(contract.VIEW_DIR))
    centre_m = (r * cx - u * cy) * geometry.MM

    cam_data = bpy.data.cameras.new('cam')
    cam_data.type = 'ORTHO'
    cam_data.sensor_fit = 'AUTO'
    cam_data.ortho_scale = max(width, height) / s * geometry.MM
    cam_data.clip_start = 0.01
    cam_data.clip_end = 200.0
    cam = bpy.data.objects.new('cam', cam_data)
    rot = Matrix((r, u, -d)).transposed()  # columns: right, up, back
    cam.matrix_world = Matrix.Translation(centre_m - d * 50.0) @ rot.to_4x4()
    scene.collection.objects.link(cam)
    scene.camera = cam
    scene.render.resolution_x = width
    scene.render.resolution_y = height
    return {'width': width, 'height': height, 'anchor': (ax, ay)}
