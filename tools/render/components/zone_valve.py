"""Zone valve in the style of the owner's Caleffi Z-one units: small brass
body inline on a horizontal 3/4" pipe, grey actuator on top with a black cap
and a blank label.
"""

from lib import geometry as g

from .base import Component

AXIS_Y = -70.0
PORT = 56.0


class ZoneValve(Component):
    id = 'zone-valve'

    def build(self, coll, m):
        k = self.keep
        y = AXIS_Y
        # brass body with sweat ends
        k(g.cylinder(coll, 'body', (-34, y, 0), (34, y, 0), 18, m.brass, bevel=2.0))
        k(g.cylinder(coll, 'boss', (0, y, 0), (0, y, 24), 16, m.brass, bevel=1.5))
        for side in (-1, 1):
            k(g.hexagon(coll, f'end_{side}', (side * 32, y, 0), (side * 45, y, 0), 34, m.brass))
            k(g.cylinder(coll, f'stub_{side}', (side * 45, y, 0), (side * PORT, y, 0), 11.1, m.copper))
        self.port('inlet', (-PORT, y, 0), (-1, 0, 0), 22.2)
        self.port('outlet', (PORT, y, 0), (1, 0, 0), 22.2)

        # actuator
        front = y - 52
        k(g.box(coll, 'actuator', (-35, front, 20), (35, y + 18, 116), m.actuator_grey, bevel=4.0, segments=4))
        k(g.box(coll, 'actuator_rib', (-33, front - 0.8, 100), (33, front + 1, 103), m.actuator_grey, bevel=0.5))
        k(g.box(coll, 'cap', (-33, front + 3, 113), (33, y + 15, 128), m.plastic_black, bevel=2.5))
        k(g.box(coll, 'label', (-23, front - 0.7, 78), (23, front + 0.5, 96), m.label_white, bevel=0.4))
        k(g.cylinder(coll, 'screw', (-24, front, 58), (-24, front - 2, 58), 4.5, m.chrome, bevel=0.6))

        self.point('label', (0, front, 87))
