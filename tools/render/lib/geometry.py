"""Mesh and curve builders. All inputs are millimetres; Blender gets metres."""

import math

import bmesh
import bpy
from mathutils import Matrix, Vector

MM = 0.001


def v(p):
    return Vector((p[0] * MM, p[1] * MM, p[2] * MM))


def _finish(coll, name, bm, mat, smooth=True, sharp_deg=32.0):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    if mat is not None:
        me.materials.append(mat)
    if smooth:
        me.shade_smooth()
        if sharp_deg is not None:
            me.set_sharp_from_angle(angle=math.radians(sharp_deg))
    ob = bpy.data.objects.new(name, me)
    coll.objects.link(ob)
    return ob


def _bevel(ob, width_mm, segments=3, angle_deg=35.0):
    if width_mm <= 0:
        return ob
    mod = ob.modifiers.new('bevel', 'BEVEL')
    mod.width = width_mm * MM
    mod.segments = segments
    mod.limit_method = 'ANGLE'
    mod.angle_limit = math.radians(angle_deg)
    mod.harden_normals = True
    mod.miter_outer = 'MITER_ARC'
    return ob


def _orient(bm, axis_dir, centre):
    """Rotate geometry built along +Z to axis_dir and move it to centre (metres)."""
    q = Vector((0, 0, 1)).rotation_difference(Vector(axis_dir).normalized())
    bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=q.to_matrix())
    bmesh.ops.translate(bm, verts=bm.verts, vec=centre)


def box(coll, name, mn, mx, mat, bevel=2.0, segments=3):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    size = Vector([(mx[i] - mn[i]) * MM for i in range(3)])
    centre = Vector([(mx[i] + mn[i]) * 0.5 * MM for i in range(3)])
    bmesh.ops.scale(bm, vec=size, verts=bm.verts)
    bmesh.ops.translate(bm, vec=centre, verts=bm.verts)
    ob = _finish(coll, name, bm, mat, smooth=True, sharp_deg=None if bevel > 0 else 30.0)
    return _bevel(ob, bevel, segments)


def cylinder(coll, name, p0, p1, r, mat, segments=48, bevel=0.0, r1=None):
    """Solid cylinder (or cone when r1 is given) from p0 to p1."""
    a, b = v(p0), v(p1)
    d = b - a
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=segments,
                          radius1=r * MM, radius2=(r if r1 is None else r1) * MM,
                          depth=d.length)
    _orient(bm, d, (a + b) * 0.5)
    ob = _finish(coll, name, bm, mat)
    return _bevel(ob, bevel, 2)


def hexagon(coll, name, p0, p1, across_flats, mat, bevel=0.6):
    a, b = v(p0), v(p1)
    d = b - a
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=6,
                          radius1=across_flats / math.sqrt(3) * MM,
                          radius2=across_flats / math.sqrt(3) * MM, depth=d.length)
    _orient(bm, d, (a + b) * 0.5)
    ob = _finish(coll, name, bm, mat, smooth=False)
    return _bevel(ob, bevel, 2, angle_deg=25.0)


def tube(coll, name, p0, p1, r_out, r_in, mat, segments=64, bevel=0.6):
    """Hollow cylinder (collar, ring) from p0 to p1."""
    a, b = v(p0), v(p1)
    d = b - a
    h = d.length
    bm = bmesh.new()
    rings = []
    for z in (-h / 2, h / 2):
        for r in (r_out * MM, r_in * MM):
            ring = [bm.verts.new((r * math.cos(2 * math.pi * i / segments),
                                  r * math.sin(2 * math.pi * i / segments), z))
                    for i in range(segments)]
            rings.append(ring)
    out0, in0, out1, in1 = rings
    for i in range(segments):
        j = (i + 1) % segments
        bm.faces.new((out0[i], out0[j], out1[j], out1[i]))
        bm.faces.new((in0[j], in0[i], in1[i], in1[j]))
        bm.faces.new((out0[j], out0[i], in0[i], in0[j]))
        bm.faces.new((out1[i], out1[j], in1[j], in1[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    _orient(bm, d, (a + b) * 0.5)
    ob = _finish(coll, name, bm, mat)
    return _bevel(ob, bevel, 2)


def rounded_slab(coll, name, centre, width, height, y0, y1, corner_r, mat,
                 bevel=0.6, corner_segments=8):
    """Rounded rectangle in the XZ plane, extruded along Y from y0 to y1."""
    cx, cz = centre
    hw, hh = width / 2, height / 2
    pts = []
    for (sx, sz, start) in ((1, 1, 0), (-1, 1, 90), (-1, -1, 180), (1, -1, 270)):
        ox, oz = cx + sx * (hw - corner_r), cz + sz * (hh - corner_r)
        for k in range(corner_segments + 1):
            ang = math.radians(start + 90 * k / corner_segments)
            pts.append((ox + corner_r * math.cos(ang), oz + corner_r * math.sin(ang)))
    bm = bmesh.new()
    front = [bm.verts.new((x * MM, y0 * MM, z * MM)) for x, z in pts]
    back = [bm.verts.new((x * MM, y1 * MM, z * MM)) for x, z in pts]
    n = len(pts)
    bm.faces.new(front)
    bm.faces.new(list(reversed(back)))
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new((front[i], front[j], back[j], back[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    ob = _finish(coll, name, bm, mat, smooth=True, sharp_deg=40.0)
    return _bevel(ob, bevel, 2, angle_deg=50.0)


def pipe(coll, name, points, r, mat, bend_r=None, steps=10):
    """Tube following a polyline (mm) with radiused bends."""
    pts = [Vector(p) for p in points]
    bend_r = bend_r if bend_r is not None else r * 1.6
    path = [pts[0]]
    for i in range(1, len(pts) - 1):
        a, b, c = pts[i - 1], pts[i], pts[i + 1]
        d0, d1 = (b - a).normalized(), (c - b).normalized()
        turn = d0.angle(d1)
        if turn < 1e-3:
            path.append(b)
            continue
        cut = min(bend_r * math.tan(turn / 2), (b - a).length * 0.49, (c - b).length * 0.49)
        p_in, p_out = b - d0 * cut, b + d1 * cut
        for k in range(steps + 1):
            t = k / steps
            # quadratic Bezier through the corner approximates the arc closely
            q = (1 - t) ** 2 * p_in + 2 * (1 - t) * t * b + t ** 2 * p_out
            path.append(q)
    path.append(pts[-1])

    cu = bpy.data.curves.new(name, 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = r * MM
    cu.bevel_resolution = 6
    cu.use_fill_caps = True
    sp = cu.splines.new('POLY')
    sp.points.add(len(path) - 1)
    for i, p in enumerate(path):
        sp.points[i].co = (p.x * MM, p.y * MM, p.z * MM, 1.0)
    ob = bpy.data.objects.new(name, cu)
    if mat is not None:
        cu.materials.append(mat)
    coll.objects.link(ob)
    return ob


def plane(coll, name, corners):
    """Quad from four corner points (mm)."""
    bm = bmesh.new()
    vs = [bm.verts.new(v(c)) for c in corners]
    bm.faces.new(vs)
    return _finish(coll, name, bm, None, smooth=False)


def evaluated_points_mm(objects):
    """World-space vertex positions (mm) of the evaluated objects."""
    dg = bpy.context.evaluated_depsgraph_get()
    out = []
    for ob in objects:
        ev = ob.evaluated_get(dg)
        try:
            me = ev.to_mesh()
        except RuntimeError:
            continue
        if me is None:
            continue
        mw = ev.matrix_world
        for vert in me.vertices:
            w = mw @ vert.co
            out.append((w.x / MM, w.y / MM, w.z / MM))
        ev.to_mesh_clear()
    return out
