"""Shared component interface."""


class Component:
    """One renderable part. Subclasses build geometry in local millimetres.

    Local origin: floor-standing parts at the centre of their footprint on the
    floor (z=0); everything else at the part's centre (the pipe axis for inline
    parts). Ports must point in the picture plane (+/-X or +/-Z).
    """

    id = ''
    floor_standing = False
    notes = None

    def __init__(self):
        self.ports = {}
        self.points = {}
        self.objects = []

    def build(self, coll, mats):
        raise NotImplementedError

    def keep(self, ob):
        self.objects.append(ob)
        return ob

    def port(self, name, pos, direction, diameter):
        self.ports[name] = {'pos': tuple(pos), 'dir': tuple(direction), 'diameter': diameter}

    def point(self, name, pos):
        self.points[name] = tuple(pos)
