"""Thermostatic mixing (tempering) valve for a DHW tank outlet, in the style of
a Caleffi 521 or Watts LFMMV, unbranded: brass body, union ends, round grey
adjustment cap facing the viewer. Cold enters on the left, hot on the right,
tempered water leaves at the top. About 110 mm between the union faces.
"""

import math

from lib import geometry as g

from .base import Component

AXIS_Y = -70.0
PORT = 55.0


class TemperingValve(Component):
    id = 'tempering-valve'

    def build(self, coll, m):
        k = self.keep
        y = AXIS_Y
        # cast body: thermostat chamber along the view axis, plus three necks
        k(g.cylinder(coll, 'chamber', (0, y + 26, 0), (0, y - 30, 0), 27, m.brass, segments=64, bevel=2.5))
        k(g.cylinder(coll, 'neck_x', (-32, y, 0), (32, y, 0), 15, m.brass, bevel=1.0))
        k(g.cylinder(coll, 'neck_up', (0, y, 0), (0, y, 32), 15, m.brass, bevel=1.0))
        ends = (
            ('cold', ((-30, y, 0), (-44, y, 0), (-49, y, 0), (-PORT, y, 0)), (-1, 0, 0)),
            ('hot', ((30, y, 0), (44, y, 0), (49, y, 0), (PORT, y, 0)), (1, 0, 0)),
            ('mixed', ((0, y, 30), (0, y, 44), (0, y, 49), (0, y, PORT)), (0, 0, 1)),
        )
        for name, (p0, p1, p2, p3), direction in ends:
            k(g.hexagon(coll, f'{name}_union', p0, p1, 34, m.brass))
            k(g.cylinder(coll, f'{name}_tail', p1, p2, 13.5, m.brass, bevel=0.6))
            k(g.cylinder(coll, f'{name}_stub', p2, p3, 11.1, m.copper))
            self.port(name, p3, direction, 22.2)

        # adjustment cap with grip ribs and a pointer
        front = y - 30
        k(g.cylinder(coll, 'cap_collar', (0, front, 0), (0, front - 5, 0), 22, m.brass, bevel=1.0))
        k(g.cylinder(coll, 'cap', (0, front - 5, 0), (0, front - 27, 0), 23, m.knob_grey, segments=64, bevel=2.0))
        for i in range(18):
            a = 2 * math.pi * i / 18
            cx, cz = 23 * math.cos(a), 23 * math.sin(a)
            k(g.cylinder(coll, f'rib_{i}', (cx, front - 7, cz), (cx, front - 25, cz), 1.6, m.knob_grey, segments=10))
        k(g.box(coll, 'pointer', (-1.6, front - 28, 6), (1.6, front - 26.6, 19), m.plastic_dark_grey, bevel=0.4))

        self.point('label', (0, front - 27, 0))
