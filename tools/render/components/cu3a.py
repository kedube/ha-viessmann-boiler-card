"""Vitocrossal 300 CU3A 199 (same cabinet as the CU3A 160).

Dimensions come from Viessmann's CU3A-199 drawings (viessmann.ca CAD set):
660 mm wide, 713 mm deep without rear piping, 1495 mm to the cabinet top and
1560 mm to the top of the Vitotronic housing. The red accent groove runs down
both front corners, as on the owner's unit; the front panel is set in slightly
so it shows head-on.

Ports follow the owner's piping as two separate loops through the boiler:
the heating loop leaves at the top (supply, with the factory relief valve and
air vent) and comes back on the right side (return); the DHW loop leaves and
returns on the left side, level with the Vitocell's coil connections so those
pipes run straight across. Following Viessmann's Vitocell piping, hot water
leaves at 642 mm into the upper coil connection and comes back from the lower
one at 342 mm. Gas and vent pipes are left out: the diagram shows water loops only.
"""

from lib import geometry as g

from .base import Component

W2 = 330.0          # half width of the body
FRONT_W2 = 322.0    # front panel half width (exposes the red groove)
REAR = -100.0       # rear face
BODY_FRONT = -757.0
FRONT_BACK = -785.0
FRONT = -813.0      # front face
TOP = 1495.0
BODY_BOTTOM = 74.0
DEPTH_MID = (FRONT + REAR) / 2

PORT_Z = 1640.0     # top of the supply riser
SIDE_STUB = 38.0    # how far side connections stand off the side panels


class VitocrossalCU3A(Component):
    id = 'vitocrossal-300-cu3a-199'
    floor_standing = True
    notes = ('Heating loop: supply on top (with relief valve and air vent), return on the right side. '
             'DHW loop: dhw_supply and dhw_return on the left side at the tank coil heights.')

    def build(self, coll, m):
        k = self.keep
        # cabinet
        k(g.box(coll, 'body', (-W2, BODY_FRONT, BODY_BOTTOM), (W2, REAR, TOP - 4), m.casing_grey, bevel=3.0))
        k(g.box(coll, 'top_rear', (-W2 + 1, -511, TOP - 4), (W2 - 1, REAR - 1.5, TOP), m.casing_grey, bevel=1.5))
        k(g.box(coll, 'top_front', (-W2 + 1, BODY_FRONT + 1, TOP - 4), (W2 - 1, -514, TOP), m.casing_grey, bevel=1.5))
        k(g.box(coll, 'front_panel', (-FRONT_W2, FRONT, 78), (FRONT_W2, FRONT_BACK, TOP), m.casing_grey,
                bevel=3.5, segments=4))
        # red accent groove between the front panel and the side panels
        k(g.box(coll, 'accent', (-W2 + 2, FRONT_BACK - 6, 78), (W2 - 2, BODY_FRONT + 4, TOP - 4),
                m.accent_red, bevel=1.0))
        # plinth and adjustable feet
        k(g.box(coll, 'plinth', (-298, -742, 18), (298, REAR - 6, BODY_BOTTOM + 2), m.casing_dark, bevel=2.0))
        for i, (fx, fy) in enumerate(((-272, -150), (272, -150), (-272, -700), (272, -700))):
            k(g.cylinder(coll, f'foot_pad_{i}', (fx, fy, 0), (fx, fy, 6), 32, m.rubber, bevel=1.0))
            k(g.cylinder(coll, f'foot_stem_{i}', (fx, fy, 6), (fx, fy, 20), 8, m.zinc))
            k(g.hexagon(coll, f'foot_nut_{i}', (fx, fy, 8), (fx, fy, 15), 24, m.zinc))

        self._control_unit(coll, m)
        self._supply_riser(coll, m)
        # heating return on the right; DHW loop on the left, level with the tank coil
        self._side_stub(coll, m, 'return', 1, 1100, 34.9, union_af=52)
        self._side_stub(coll, m, 'dhw_supply', -1, 642, 28.6, union_af=44)
        self._side_stub(coll, m, 'dhw_return', -1, 342, 28.6, union_af=44)

        self.point('label', (0, FRONT, 1300))
        self.point('display', (0, -747, 1538))
        self.point('burner_glow', (0, -430, 1060))

    def _control_unit(self, coll, m):
        k = self.keep
        k(g.box(coll, 'vitotronic_base', (-127, -744, TOP - 1), (127, -606, 1517), m.control_orange_dark, bevel=3.0))
        k(g.box(coll, 'vitotronic', (-130, -747, 1515), (130, -604, 1560), m.control_orange, bevel=6.0, segments=4))
        k(g.box(coll, 'vitotronic_seam', (-129, -747.6, 1516.5), (129, -746.4, 1518.5), m.control_orange_dark,
                bevel=0.4))
        k(g.cylinder(coll, 'vitotronic_boss', (-143, -676, 1537), (-126, -676, 1537), 21,
                     m.control_orange, bevel=1.5))
        for i, x in enumerate((-106, -96)):
            k(g.cylinder(coll, f'led_{i}', (x, -747.6, 1540), (x, -746.0, 1540), 2.2, m.led_dark))

    def _supply_riser(self, coll, m):
        k = self.keep
        x, y = -64.0, -45.0
        k(g.pipe(coll, 'supply_riser', [(x, REAR, 1256), (x, y, 1256), (x, y, 1560)], 21.1,
                 m.black_iron, bend_r=38))
        k(g.cylinder(coll, 'supply_tee', (x, y, 1552), (x, y, 1598), 26, m.brass, bevel=1.5))
        # relief valve branch (+X) with its lever and discharge
        k(g.cylinder(coll, 'relief_nipple', (x, y, 1575), (x + 46, y, 1575), 13.4, m.brass))
        k(g.cylinder(coll, 'relief_body', (x + 58, y, 1540), (x + 58, y, 1604), 22, m.brass, bevel=1.5))
        k(g.cylinder(coll, 'relief_cap', (x + 58, y, 1604), (x + 58, y, 1616), 16, m.brass, bevel=1.0))
        k(g.box(coll, 'relief_lever', (x + 50, y - 5, 1616), (x + 104, y + 5, 1621), m.zinc, bevel=1.5))
        k(g.cylinder(coll, 'relief_discharge', (x + 58, y, 1540), (x + 58, y, 1500), 13.4, m.brass))
        # automatic air vent branch (-X)
        k(g.cylinder(coll, 'vent_nipple', (x, y, 1575), (x - 42, y, 1575), 10.5, m.brass))
        k(g.cylinder(coll, 'vent_body', (x - 52, y, 1560), (x - 52, y, 1618), 20, m.brass, bevel=1.5))
        k(g.cylinder(coll, 'vent_cap', (x - 52, y, 1618), (x - 52, y, 1634), 11, m.plastic_black, bevel=1.0))
        # union and copper stub where the system supply connects
        k(g.hexagon(coll, 'supply_union', (x, y, 1598), (x, y, 1618), 52, m.brass))
        k(g.cylinder(coll, 'supply_stub', (x, y, 1618), (x, y, PORT_Z), 17.45, m.copper))
        self.port('supply', (x, y, PORT_Z), (0, 0, 1), 34.9)

    def _side_stub(self, coll, m, name, side, z, tube_od, union_af):
        """Copper nipple with a brass union through a side panel, mid-depth."""
        k = self.keep
        y, r = DEPTH_MID, tube_od / 2
        k(g.cylinder(coll, f'{name}_grommet', (side * (W2 - 3), y, z), (side * (W2 + 3), y, z), r + 10,
                     m.plastic_black, bevel=1.0))
        k(g.cylinder(coll, f'{name}_nipple', (side * (W2 - 2), y, z), (side * (W2 + SIDE_STUB), y, z), r, m.copper))
        k(g.hexagon(coll, f'{name}_union', (side * (W2 + 12), y, z), (side * (W2 + 26), y, z), union_af, m.brass))
        self.port(name, (side * (W2 + SIDE_STUB), y, z), (side, 0, 0), tube_od)
