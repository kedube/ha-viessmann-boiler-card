"""Vitocell 300-V indirect DHW tank, 53 USG (200 L) casing.

Viessmann's nearest size to the owner's "56 gal" tank is the 53 USG EVIB:
634 mm diameter, 1410 mm tall, Vitopearlwhite casing, connections protruding
27 mm at 642 (coil supply), 342 (coil return), 892 (recirculation) and 77 mm
(cold water). Source: Vitocell 300-V EVIB technical data 6250497-02.

For the front elevation the coil connections face right (+X), toward the
boiler; hot water leaves and cold water enters side by side through the top,
as in the owner's plant room (cold left, hot right).
"""

import math

from lib import geometry as g

from .base import Component

R = 317.0           # casing radius
CY = -367.0         # axis depth (only matters for the model, not the elevation)
HEIGHT = 1410.0
STUB = 27.0


class Vitocell300V(Component):
    id = 'vitocell-300-v-56'
    floor_standing = True
    notes = 'Modelled on the 53 USG (200 L) Vitocell 300-V EVIB, the closest Viessmann size to 56 gal.'

    def build(self, coll, m):
        k = self.keep
        # three adjustable feet under a black base ring
        for i in range(3):
            a = math.radians(-90 + 120 * i)
            fx, fy = 230 * math.cos(a), CY + 230 * math.sin(a)
            k(g.cylinder(coll, f'foot_{i}', (fx, fy, 0), (fx, fy, 16), 18, m.plastic_black, bevel=1.0))
        k(g.cylinder(coll, 'base_ring', (0, CY, 12), (0, CY, 46), R - 7, m.plastic_black, segments=128, bevel=2.5))
        k(g.cylinder(coll, 'casing', (0, CY, 44), (0, CY, HEIGHT - 16), R, m.pearl_white, segments=160, bevel=2.5))
        # top cover with a slight overhanging lip and a shadow line under it
        k(g.cylinder(coll, 'top_cover', (0, CY, HEIGHT - 17), (0, CY, HEIGHT), R + 1.5, m.pearl_white,
                     segments=160, bevel=5.0))
        k(g.cylinder(coll, 'top_seam', (0, CY, HEIGHT - 19), (0, CY, HEIGHT - 16), R + 0.4,
                     m.plastic_dark_grey, segments=160))

        def side_stub(name, z, side, r, tube_od, port=True):
            x0, x1 = side * (R - 6), side * (R + STUB)
            k(g.cylinder(coll, f'{name}_rosette', (side * (R - 8), CY, z), (side * (R + 2.5), CY, z), r + 11,
                         m.plastic_black, bevel=1.0))
            k(g.cylinder(coll, f'{name}_nipple', (x0, CY, z), (x1, CY, z), r, m.stainless_threads_x))
            if port:
                self.port(name, (x1, CY, z), (side, 0, 0), tube_od)
            return x1

        side_stub('coil_upper', 642, 1, 16.7, 28.6)
        side_stub('coil_lower', 342, 1, 16.7, 28.6)
        cap_x = side_stub('recirc', 892, 1, 16.7, 28.6, port=False)
        k(g.hexagon(coll, 'recirc_cap', (cap_x - 2, CY, 892), (cap_x + 12, CY, 892), 41, m.brass))

        # cold in and hot out through the top cover
        for name, x in (('cold_in', -150.0), ('hot_out', 150.0)):
            k(g.cylinder(coll, f'{name}_rosette', (x, CY, HEIGHT - 2), (x, CY, HEIGHT + 3), 24, m.plastic_black,
                         bevel=1.0))
            k(g.cylinder(coll, f'{name}_nipple', (x, CY, HEIGHT), (x, CY, HEIGHT + 34), 13.35, m.stainless_threads_z))
            self.port(name, (x, CY, HEIGHT + 34), (0, 0, 1), 22.2)
        # inspection opening cover, centred on the top
        k(g.cylinder(coll, 'inspection_cover', (0, CY, HEIGHT - 1), (0, CY, HEIGHT + 9), 70, m.plastic_dark_grey,
                     segments=96, bevel=2.5))

        self.point('label', (0, CY - R, 1000))
        self.point('top', (0, CY, HEIGHT))
