"""Viessmann-style 3-way mixing valve: black cast body with a black motor box
facing the viewer, as on the owner's radiant circuit. Hot water enters on the
left (a), the radiant return enters from below (b), mixed water leaves on the
right (ab).
"""

from lib import geometry as g

from .base import Component

AXIS_Y = -70.0
PORT = 92.0


class MixingValve(Component):
    id = 'mixing-valve'

    def build(self, coll, m):
        k = self.keep
        y = AXIS_Y
        # cast body: chamber plus three necks
        k(g.cylinder(coll, 'chamber', (0, y + 32, 0), (0, y - 34, 0), 37, m.black_iron, segments=64, bevel=3.0))
        k(g.cylinder(coll, 'neck_x', (-58, y, 0), (58, y, 0), 22, m.black_iron, bevel=1.5))
        k(g.cylinder(coll, 'neck_b', (0, y, 0), (0, y, -58), 22, m.black_iron, bevel=1.5))
        for name, (p0, p1, p2, p3) in (
            ('a', ((-52, y, 0), (-64, y, 0), (-78, y, 0), (-PORT, y, 0))),
            ('ab', ((52, y, 0), (64, y, 0), (78, y, 0), (PORT, y, 0))),
            ('b', ((0, y, -52), (0, y, -64), (0, y, -78), (0, y, -PORT))),
        ):
            k(g.hexagon(coll, f'{name}_body_hex', p0, p1, 46, m.black_iron, bevel=0.8))
            k(g.hexagon(coll, f'{name}_union', p1, p2, 48, m.brass))
            k(g.cylinder(coll, f'{name}_stub', p2, p3, 14.3, m.copper))
        self.port('a', (-PORT, y, 0), (-1, 0, 0), 28.6)
        self.port('ab', (PORT, y, 0), (1, 0, 0), 28.6)
        self.port('b', (0, y, -PORT), (0, 0, -1), 28.6)

        # motor: adapter, housing, manual position knob, cable gland
        front = y - 136
        k(g.cylinder(coll, 'adapter', (0, y - 34, 0), (0, y - 48, 0), 26, m.plastic_black, bevel=1.0))
        k(g.box(coll, 'motor', (-48, front, -62), (48, y - 48, 80), m.plastic_black, bevel=7.0, segments=4))
        k(g.box(coll, 'motor_lid_seam', (-47, front - 0.6, 52), (47, front + 1, 54), m.plastic_dark_grey, bevel=0.3))
        k(g.box(coll, 'motor_label', (48, y - 120, -10), (49.2, y - 62, 40), m.label_white, bevel=0.3))
        k(g.cylinder(coll, 'knob', (0, front, -24), (0, front - 8, -24), 17, m.plastic_dark_grey, bevel=1.5))
        k(g.box(coll, 'knob_pointer', (-2, front - 8.6, -24), (2, front - 7.6, -9), m.label_white, bevel=0.3))
        k(g.cylinder(coll, 'gland', (-26, y - 92, -62), (-26, y - 92, -76), 8, m.plastic_black, bevel=1.0))

        self.point('label', (0, front, 30))
        self.point('knob', (0, front, -24))
