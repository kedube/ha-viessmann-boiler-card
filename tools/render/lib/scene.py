"""Empty scene and Cycles settings."""

import bpy


def reset():
    bpy.ops.wm.read_homefile(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = 'METRIC'
    scene.unit_settings.scale_length = 1.0
    return scene


def configure(scene, samples, device='CPU'):
    scene.render.engine = 'CYCLES'
    cycles = scene.cycles
    cycles.device = 'CPU'
    if device == 'GPU':
        prefs = bpy.context.preferences.addons['cycles'].preferences
        try:
            prefs.compute_device_type = 'METAL'
            prefs.get_devices()
            gpus = [d for d in prefs.devices if d.type != 'CPU']
            for d in prefs.devices:
                d.use = d in gpus
            if gpus:
                cycles.device = 'GPU'
        except (TypeError, AttributeError):
            pass

    cycles.samples = samples
    cycles.use_adaptive_sampling = True
    cycles.adaptive_threshold = 0.008
    cycles.use_denoising = True
    cycles.denoiser = 'OPENIMAGEDENOISE'
    cycles.max_bounces = 10
    cycles.glossy_bounces = 6
    cycles.transparent_max_bounces = 8
    cycles.caustics_reflective = False
    cycles.caustics_refractive = False
    cycles.sample_clamp_indirect = 8.0

    scene.render.film_transparent = True
    scene.render.resolution_percentage = 100
    scene.render.pixel_aspect_x = 1.0
    scene.render.pixel_aspect_y = 1.0
    scene.render.filter_size = 1.2

    # Standard keeps brand colours (Viessmann orange, red) saturated; AgX washes
    # them out. Exposure is pulled down so lit white sits just above the wall.
    scene.view_settings.view_transform = 'Standard'
    scene.view_settings.exposure = -0.45
    scene.view_settings.gamma = 1.0
    scene.sequencer_colorspace_settings.name = 'sRGB'
