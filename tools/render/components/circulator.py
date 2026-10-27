"""Wet-rotor circulator with isolation flange valves, 1" pipe, inline on a
horizontal pipe 70 mm off the wall. Modelled on the cast-iron circulators in
the owner's plant room (motor pointing at the viewer, terminal box on top),
without branding.
"""

from lib import geometry as g

from .base import Component

AXIS_Y = -70.0
PORT_X = 152.5


class Circulator(Component):
    id = 'circulator-red'

    def __init__(self, cid='circulator-red', colour='red'):
        super().__init__()
        self.id = cid
        self.colour = colour

    def build(self, coll, m):
        k = self.keep
        paint = m.pump_red if self.colour == 'red' else m.pump_black
        y = AXIS_Y
        # volute and flanged necks
        k(g.cylinder(coll, 'volute', (0, y + 22, 0), (0, y - 40, 0), 56, paint, segments=64, bevel=4.0))
        k(g.cylinder(coll, 'volute_rim', (0, y - 38, 0), (0, y - 46, 0), 50, paint, segments=64, bevel=1.5))
        k(g.cylinder(coll, 'necks', (-80, y, 0), (80, y, 0), 25, paint, bevel=1.0))
        for side in (-1, 1):
            x_in, x_out = side * 70, side * 82
            k(g.cylinder(coll, f'flange_{side}', (x_in, y, 0), (x_out, y, 0), 37, paint, bevel=1.5))
            for z in (-27, 27):
                k(g.cylinder(coll, f'bolt_{side}_{z}', (x_out - 1, y, z), (x_out + 9, y, z), 5, m.zinc))
        # motor can, front cover and vent plug
        k(g.cylinder(coll, 'motor', (0, y - 44, 0), (0, y - 150, 0), 48, paint, segments=64, bevel=3.0))
        k(g.cylinder(coll, 'motor_band', (0, y - 92, 0), (0, y - 96, 0), 48.6, m.plastic_dark_grey, segments=64))
        k(g.cylinder(coll, 'front_cover', (0, y - 150, 0), (0, y - 156, 0), 45, m.plastic_black,
                     segments=64, bevel=1.5))
        k(g.cylinder(coll, 'vent_plug', (0, y - 156, 0), (0, y - 160, 0), 9, m.chrome, bevel=0.8))
        # terminal box with a blank label and cable gland
        k(g.box(coll, 'terminal_box', (-36, y - 140, 30), (36, y - 52, 76), paint, bevel=4.0))
        k(g.box(coll, 'terminal_label', (-24, y - 140.6, 46), (24, y - 139.6, 64), m.label_white, bevel=0.3))
        k(g.cylinder(coll, 'cable_gland', (36, y - 96, 52), (50, y - 96, 52), 8, m.plastic_black, bevel=1.0))

        # isolation flange valves with yellow levers
        for side in (-1, 1):
            s = side
            k(g.cylinder(coll, f'iso_flange_{s}', (s * 83, y, 0), (s * 94, y, 0), 37, m.brass, bevel=1.5))
            k(g.cylinder(coll, f'iso_body_{s}', (s * 94, y, 0), (s * 132, y, 0), 23, m.brass, bevel=2.0))
            k(g.cylinder(coll, f'iso_stem_{s}', (s * 112, y, 18), (s * 112, y, 34), 5, m.brass))
            k(g.box(coll, f'iso_handle_{s}', (min(s * 104, s * 150), y - 7, 32), (max(s * 104, s * 150), y + 7, 39),
                    m.handle_yellow, bevel=2.5))
            k(g.hexagon(coll, f'iso_union_{s}', (s * 132, y, 0), (s * 146, y, 0), 46, m.brass))
            k(g.cylinder(coll, f'stub_{s}', (s * 146, y, 0), (s * PORT_X, y, 0), 14.3, m.copper))

        self.port('inlet', (-PORT_X, y, 0), (-1, 0, 0), 28.6)
        self.port('outlet', (PORT_X, y, 0), (1, 0, 0), 28.6)
        self.point('label', (0, y - 160, 0))
        self.point('terminal_box', (0, y - 140, 55))
