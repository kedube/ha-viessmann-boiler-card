"""Brazed plate heat exchanger on a wall bracket.

Four 1" nipples on the front plate, each turned sideways by a brass street
elbow so the ports lie in the picture plane: primary (boiler side) enters
top-left and leaves bottom-left, secondary (radiant side) enters bottom-right
and leaves top-right (counter-flow).
"""

from lib import geometry as g

from .base import Component

W, H = 120.0, 310.0
BACK, FRONT = -40.0, -100.0
PORT_X, PORT_Z = 35.0, 120.0
NIPPLE_Y = FRONT - 20.0     # nipple end
ELBOW_Y = FRONT - 38.0      # elbow centreline in front of the plate
REACH = 48.0                # how far the elbow outlet sits beyond the nipple


class PlateHeatExchanger(Component):
    id = 'plate-hx'

    def build(self, coll, m):
        k = self.keep
        # bracket from the wall to the back plate
        k(g.box(coll, 'bracket', (-46, BACK - 1, -140), (46, -3, 140), m.zinc, bevel=1.5))
        k(g.box(coll, 'bracket_flange', (-60, -6, -150), (60, -1, 150), m.zinc, bevel=1.0))

        # cover plates and the stack of brazed plates between them
        k(g.rounded_slab(coll, 'back_plate', (0, 0), W, H, BACK - 3, BACK, 9, m.stainless, bevel=0.6))
        k(g.rounded_slab(coll, 'front_plate', (0, 0), W, H, FRONT, FRONT + 3, 9, m.stainless, bevel=0.8))
        n = 22
        pitch = (BACK - 3 - (FRONT + 3)) / n
        for i in range(n):
            y0 = FRONT + 3 + i * pitch
            k(g.rounded_slab(coll, f'plate_{i}', (0, 0), W - 1.2, H - 1.2, y0 + 0.2, y0 + pitch - 0.2, 8.4,
                             m.stainless, bevel=0.35, corner_segments=6))

        # ports: weld boss, threaded nipple, brass street elbow turned to the side
        ports = (('p1_in', -1, PORT_Z), ('p1_out', -1, -PORT_Z),
                 ('p2_in', 1, -PORT_Z), ('p2_out', 1, PORT_Z))
        for name, side, z in ports:
            x = side * PORT_X
            k(g.cylinder(coll, f'{name}_boss', (x, FRONT + 1, z), (x, FRONT - 5, z), 22, m.stainless, bevel=1.0))
            k(g.cylinder(coll, f'{name}_nipple', (x, FRONT - 5, z), (x, NIPPLE_Y, z), 16.7, m.stainless_threads))
            k(g.hexagon(coll, f'{name}_elbow_hex', (x, NIPPLE_Y + 2, z), (x, NIPPLE_Y - 10, z), 40, m.brass))
            out_x = x + side * REACH
            k(g.pipe(coll, f'{name}_elbow', [(x, NIPPLE_Y - 10, z), (x, ELBOW_Y, z), (out_x - side * 6, ELBOW_Y, z)],
                     19.0, m.brass, bend_r=16))
            k(g.cylinder(coll, f'{name}_bead', (out_x - side * 10, ELBOW_Y, z), (out_x - side * 4, ELBOW_Y, z),
                         20.5, m.brass, bevel=1.0))
            k(g.cylinder(coll, f'{name}_stub', (out_x - side * 6, ELBOW_Y, z), (out_x, ELBOW_Y, z), 14.3, m.copper))
            self.port(name, (out_x, ELBOW_Y, z), (side, 0, 0), 28.6)

        # blank rating label
        k(g.box(coll, 'label', (-36, FRONT - 0.4, -46), (36, FRONT + 0.2, 46), m.label_white, bevel=0.3))
        self.point('label', (0, FRONT, 0))
