"""Camera and scale shared by every render and by the card.

The card draws a 2D front elevation. World axes are millimetres: X right,
Y away from the viewer (into the picture), Z up. The camera is orthographic and
looks straight along +Y at the front (-Y) faces, so image x = world X and image
up = world Z, at PX_PER_MM pixels per millimetre.
"""

import math

YAW_DEG = 0.0
PITCH_DEG = 0.0
PX_PER_MM = 1.0
PADDING_PX = 16

VIEW_DIR = (0.0, 1.0, 0.0)
SCREEN_RIGHT = (1.0, 0.0, 0.0)
SCREEN_UP = (0.0, 0.0, 1.0)

# Key light offset from the part's centre (metres): front-upper-left.
KEY_OFFSET_M = (-1.5, -3.0, 1.9)
_n = math.sqrt(sum(c * c for c in KEY_OFFSET_M))
KEY_LIGHT_DIR = tuple(-c / _n for c in KEY_OFFSET_M)  # direction the key light travels


def dot(a, b):
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]


def project_mm(p):
    """Image offset in px of point p (mm) from where the origin projects."""
    return (dot(p, SCREEN_RIGHT) * PX_PER_MM, -dot(p, SCREEN_UP) * PX_PER_MM)
