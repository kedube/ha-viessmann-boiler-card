"""Physically based materials with subtle procedural variation.

Colours are linear RGB. Texture coordinates are object space in metres, so
noise scales read as "features per metre".
"""

import bpy


def srgb(hex_colour):
    """'#rrggbb' -> linear RGB tuple."""
    h = hex_colour.lstrip('#')
    out = []
    for i in (0, 2, 4):
        c = int(h[i:i + 2], 16) / 255.0
        out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return tuple(out)


def _bsdf(mat):
    nt = mat.node_tree
    return nt, next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')


def _coords(nt):
    tex = nt.nodes.new('ShaderNodeTexCoord')
    return tex.outputs['Object']


def _noise(nt, scale, detail=4.0, roughness=0.55):
    n = nt.nodes.new('ShaderNodeTexNoise')
    n.inputs['Scale'].default_value = scale
    n.inputs['Detail'].default_value = detail
    n.inputs['Roughness'].default_value = roughness
    nt.links.new(_coords(nt), n.inputs['Vector'])
    return n


def make(name, base, metallic=0.0, roughness=0.5, specular=0.5, coat=0.0,
         coat_roughness=0.08, rough_var=0.0, rough_scale=6.0, bump=0.0,
         bump_scale=500.0, aniso=0.0, aniso_rot=0.0, tint_var=None,
         tint_scale=14.0, emission=None):
    """A Principled material.

    rough_var: +/- roughness variation (large blotches, rough_scale per metre).
    bump: strength of fine orange-peel / casting texture (bump_scale per metre).
    tint_var: (colour, amount) mixed in by low-frequency noise (patina, wear).
    """
    mat = bpy.data.materials.new(name)
    nt, bsdf = _bsdf(mat)
    bsdf.inputs['Base Color'].default_value = (*base, 1.0)
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Specular IOR Level'].default_value = specular
    if coat:
        bsdf.inputs['Coat Weight'].default_value = coat
        bsdf.inputs['Coat Roughness'].default_value = coat_roughness
    if aniso:
        bsdf.inputs['Anisotropic'].default_value = aniso
        bsdf.inputs['Anisotropic Rotation'].default_value = aniso_rot

    if rough_var:
        n = _noise(nt, rough_scale, detail=3.0)
        mr = nt.nodes.new('ShaderNodeMapRange')
        mr.inputs['To Min'].default_value = max(0.02, roughness - rough_var)
        mr.inputs['To Max'].default_value = min(1.0, roughness + rough_var)
        nt.links.new(n.outputs['Fac'], mr.inputs['Value'])
        nt.links.new(mr.outputs['Result'], bsdf.inputs['Roughness'])

    if tint_var:
        colour, amount = tint_var
        n = _noise(nt, tint_scale, detail=5.0, roughness=0.6)
        ramp = nt.nodes.new('ShaderNodeMapRange')
        ramp.inputs['From Min'].default_value = 0.35
        ramp.inputs['From Max'].default_value = 0.75
        ramp.inputs['To Max'].default_value = amount
        nt.links.new(n.outputs['Fac'], ramp.inputs['Value'])
        mix = nt.nodes.new('ShaderNodeMix')
        mix.data_type = 'RGBA'
        mix.inputs['A'].default_value = (*base, 1.0)
        mix.inputs['B'].default_value = (*colour, 1.0)
        nt.links.new(ramp.outputs['Result'], mix.inputs['Factor'])
        nt.links.new(mix.outputs['Result'], bsdf.inputs['Base Color'])

    if bump:
        n = _noise(nt, bump_scale, detail=2.0, roughness=0.5)
        b = nt.nodes.new('ShaderNodeBump')
        b.inputs['Strength'].default_value = bump
        b.inputs['Distance'].default_value = 0.0002
        nt.links.new(n.outputs['Fac'], b.inputs['Height'])
        nt.links.new(b.outputs['Normal'], bsdf.inputs['Normal'])

    if emission:
        colour, strength = emission
        bsdf.inputs['Emission Color'].default_value = (*colour, 1.0)
        bsdf.inputs['Emission Strength'].default_value = strength
    return mat


def _waviness(mat, strength):
    """Very low-frequency bump: the slight oil-canning of large sheet panels."""
    nt, bsdf = _bsdf(mat)
    n = _noise(nt, 2.2, detail=1.0, roughness=0.4)
    b = nt.nodes.new('ShaderNodeBump')
    b.inputs['Strength'].default_value = strength
    b.inputs['Distance'].default_value = 0.002
    nt.links.new(n.outputs['Fac'], b.inputs['Height'])
    existing = bsdf.inputs['Normal'].links
    if existing:
        nt.links.new(existing[0].from_socket, b.inputs['Normal'])
    nt.links.new(b.outputs['Normal'], bsdf.inputs['Normal'])


def threads(name, base, metallic=1.0, roughness=0.3, pitch_mm=2.2, axis='Z'):
    """Metal with fine circumferential ridges (threaded nipples)."""
    mat = make(name, base, metallic=metallic, roughness=roughness)
    nt, bsdf = _bsdf(mat)
    wave = nt.nodes.new('ShaderNodeTexWave')
    wave.wave_type = 'BANDS'
    wave.bands_direction = axis
    # Blender's bands repeat every 2*pi/20 units at scale 1; coords are metres.
    wave.inputs['Scale'].default_value = 314.159 / pitch_mm
    nt.links.new(_coords(nt), wave.inputs['Vector'])
    b = nt.nodes.new('ShaderNodeBump')
    b.inputs['Strength'].default_value = 0.6
    b.inputs['Distance'].default_value = 0.0004
    nt.links.new(wave.outputs['Fac'], b.inputs['Height'])
    nt.links.new(b.outputs['Normal'], bsdf.inputs['Normal'])
    return mat


class Library:
    """Lazily created materials shared by all components."""

    def __init__(self):
        self._cache = {}

    def __getattr__(self, key):
        if key.startswith('_'):
            raise AttributeError(key)
        if key not in self._cache:
            factory = getattr(type(self), '_' + key, None)
            if factory is None:
                raise AttributeError(key)
            self._cache[key] = factory()
        return self._cache[key]

    # Viessmann casings
    @staticmethod
    def _casing_grey():
        # light silver-grey powder coat (product photos: ~#a9aeae), satin sheen
        mat = make('casing_grey', srgb('#a3a8aa'), metallic=0.12, roughness=0.36,
                   rough_var=0.05, bump=0.04, bump_scale=900.0, coat=0.12, coat_roughness=0.25,
                   tint_var=(srgb('#9ba0a2'), 0.35), tint_scale=3.0)
        _waviness(mat, 0.025)
        return mat

    @staticmethod
    def _casing_dark():
        return make('casing_dark', srgb('#3c3f42'), metallic=0.05, roughness=0.5,
                    rough_var=0.05, bump=0.04, bump_scale=900.0)

    @staticmethod
    def _accent_red():
        return make('accent_red', srgb('#c8151d'), roughness=0.38, coat=0.2)

    @staticmethod
    def _control_orange():
        return make('control_orange', srgb('#ee5a24'), roughness=0.36, specular=0.55,
                    coat=0.25, coat_roughness=0.18, rough_var=0.04)

    @staticmethod
    def _control_orange_dark():
        return make('control_orange_dark', srgb('#d24a1a'), roughness=0.42, coat=0.15)

    @staticmethod
    def _pearl_white():
        # Vitopearlwhite epoxy-coated sheet steel
        return make('pearl_white', srgb('#ecebe6'), roughness=0.32, coat=0.25,
                    coat_roughness=0.12, rough_var=0.04, bump=0.03, bump_scale=700.0,
                    tint_var=(srgb('#e2e0da'), 0.4), tint_scale=2.5)

    # metals
    @staticmethod
    def _brass():
        return make('brass', srgb('#c9a35a'), metallic=1.0, roughness=0.28, rough_var=0.08,
                    tint_var=(srgb('#9a7a3c'), 0.35), tint_scale=18.0)

    @staticmethod
    def _brass_threads():
        return threads('brass_threads', srgb('#c09a52'), roughness=0.32)

    @staticmethod
    def _copper():
        return make('copper', srgb('#e0a183'), metallic=1.0, roughness=0.26, rough_var=0.07,
                    tint_var=(srgb('#a8644a'), 0.45), tint_scale=9.0)

    @staticmethod
    def _stainless():
        # brushed; rough enough to catch the key softbox when seen head-on
        return make('stainless', srgb('#cfd1d1'), metallic=1.0, roughness=0.34,
                    rough_var=0.05, aniso=0.6, aniso_rot=0.25)

    @staticmethod
    def _stainless_threads():
        return threads('stainless_threads', srgb('#c3c5c5'), roughness=0.28, axis='Y')

    @staticmethod
    def _stainless_threads_x():
        return threads('stainless_threads_x', srgb('#c3c5c5'), roughness=0.28, axis='X')

    @staticmethod
    def _stainless_threads_z():
        return threads('stainless_threads_z', srgb('#c3c5c5'), roughness=0.28, axis='Z')

    @staticmethod
    def _knob_grey():
        # tempering valve adjustment cap
        return make('knob_grey', srgb('#a7abae'), roughness=0.42, specular=0.5, coat=0.15)

    @staticmethod
    def _actuator_grey():
        # zone valve actuator housing
        return make('actuator_grey', srgb('#8d9194'), roughness=0.5, specular=0.45, rough_var=0.04,
                    bump=0.05, bump_scale=600.0)

    @staticmethod
    def _zinc():
        return make('zinc', srgb('#b8bdc0'), metallic=1.0, roughness=0.38, rough_var=0.08)

    @staticmethod
    def _black_iron():
        return make('black_iron', srgb('#2e2f31'), metallic=0.6, roughness=0.55, rough_var=0.1,
                    bump=0.08, bump_scale=300.0)

    @staticmethod
    def _chrome():
        return make('chrome', srgb('#d8dadb'), metallic=1.0, roughness=0.12)

    # paints and plastics
    @staticmethod
    def _pump_red():
        # cast-iron circulator painted in a deep red
        return make('pump_red', srgb('#9b141c'), roughness=0.42, coat=0.15, rough_var=0.05,
                    bump=0.06, bump_scale=350.0)

    @staticmethod
    def _pump_black():
        return make('pump_black', srgb('#1c1d1f'), roughness=0.4, coat=0.2, rough_var=0.06,
                    bump=0.05, bump_scale=350.0)

    @staticmethod
    def _plastic_black():
        return make('plastic_black', srgb('#141516'), roughness=0.48, specular=0.45)

    @staticmethod
    def _plastic_dark_grey():
        return make('plastic_dark_grey', srgb('#2d2f31'), roughness=0.5)

    @staticmethod
    def _rubber():
        return make('rubber', srgb('#151515'), roughness=0.85, specular=0.3)

    @staticmethod
    def _handle_yellow():
        return make('handle_yellow', srgb('#f2c200'), roughness=0.45, coat=0.2)

    @staticmethod
    def _label_white():
        return make('label_white', srgb('#f1f1ee'), roughness=0.6, specular=0.3)

    @staticmethod
    def _pp_grey():
        # polypropylene vent pipe
        return make('pp_grey', srgb('#8c9195'), roughness=0.48, specular=0.45, rough_var=0.05)

    @staticmethod
    def _led_dark():
        return make('led_dark', srgb('#3a3d3f'), roughness=0.2, coat=0.6)
