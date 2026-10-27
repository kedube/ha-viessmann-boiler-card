"""Studio lighting, identical for every component.

Lights sit at fixed offsets from the part's centre, so a small circulator and
the boiler receive the same light: a large softbox key from front-upper-left
(directional shading and highlights on front faces), a dimmer fill from the
right, a top strip for edge highlights, and a low-strength studio HDRI for
reflections in metal. The background stays transparent.
"""

import math
import os

import bpy
from mathutils import Vector

from . import contract

HDRI_STRENGTH = 0.32
HDRI_FILES = ('studio_small_09_2k.hdr', 'photo_studio_loft_hall_2k.hdr')

# name, offset from centre (m), size (m), power (W). Powers give roughly
# 3 / 0.8 / 0.6 W/m2 at the part: key, fill, top.
LIGHTS = (
    ('key', contract.KEY_OFFSET_M, 2.6, 140.0),
    ('fill', (2.8, -2.4, 0.2), 3.2, 34.0),
    ('top', (0.2, -0.9, 2.6), 1.8, 14.0),
)


def world(scene, cache_dir):
    w = bpy.data.worlds.new('studio')
    scene.world = w
    nt = w.node_tree
    bg = next(n for n in nt.nodes if n.type == 'BACKGROUND')
    bg.inputs['Strength'].default_value = HDRI_STRENGTH
    hdri = next((os.path.join(cache_dir, f) for f in HDRI_FILES
                 if os.path.exists(os.path.join(cache_dir, f))), None)
    if hdri:
        env = nt.nodes.new('ShaderNodeTexEnvironment')
        env.image = bpy.data.images.load(hdri, check_existing=True)
        mapping = nt.nodes.new('ShaderNodeMapping')
        coords = nt.nodes.new('ShaderNodeTexCoord')
        mapping.inputs['Rotation'].default_value = (0.0, 0.0, math.radians(125.0))
        nt.links.new(coords.outputs['Generated'], mapping.inputs['Vector'])
        nt.links.new(mapping.outputs['Vector'], env.inputs['Vector'])
        nt.links.new(env.outputs['Color'], bg.inputs['Color'])
    else:
        bg.inputs['Color'].default_value = (0.75, 0.75, 0.75, 1.0)
    return hdri


def lights(scene, centre_mm):
    centre = Vector(centre_mm) * 0.001
    for name, offset, size, power in LIGHTS:
        light = bpy.data.lights.new(name, 'AREA')
        light.shape = 'SQUARE'
        light.size = size
        light.energy = power
        ob = bpy.data.objects.new(name, light)
        ob.location = centre + Vector(offset)
        ob.rotation_euler = (centre - ob.location).to_track_quat('-Z', 'Y').to_euler()
        scene.collection.objects.link(ob)
