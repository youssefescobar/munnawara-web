"""Repaint the Neoplan Tourliner 4K atlas to the Durrah livery:
black body, white band under the windows with a teal pinstripe, white front face.
"""
import numpy as np
from PIL import Image
from scipy import ndimage

BLACK = np.array([15, 16, 18], float)
WHITE = np.array([232, 234, 237], float)
TEAL = np.array([30, 128, 142], float)

atlas = np.asarray(Image.open("img0.jpg").convert("RGB")).astype(float)


def hsv(a):
    a = a / 255.0
    mx = a.max(-1); mn = a.min(-1); d = mx - mn
    s = np.where(mx > 0, d / (mx + 1e-6), 0)
    return s, mx


def seam_map(v):
    """straight thin dark lines (door seams, belt line) as 0..1"""
    vm = ndimage.median_filter(v, size=9)
    line = np.clip(((vm - v) / (vm + 1e-6) - 0.12) * 3, 0, 1)
    vert = ndimage.grey_closing(ndimage.grey_opening(line, size=(41, 1)), size=(31, 1))
    horz = ndimage.grey_closing(ndimage.grey_opening(line, size=(1, 61)), size=(1, 61))
    return np.maximum(vert, horz)


def paint_mask(a, force=None, pad=True):
    s, v = hsv(a)
    m = (s < 0.16) & (v > 0.40)
    m = ndimage.binary_closing(m, iterations=2)          # swallow thin seams inside paint
    # dark cut-outs (glass, wheel arches) and everything enclosed by them stay untouched
    dark = (v < 0.36) | ((s > 0.25) & (v < 0.6))
    dark = ndimage.binary_opening(dark, iterations=3)     # only big dark areas
    if pad:
        padded = np.pad(dark, ((0, 3), (0, 0)), constant_values=True)  # close arches open at the bottom
        enclosed = ndimage.binary_fill_holes(padded)[:-3]
    else:
        enclosed = dark
    m &= ~ndimage.binary_dilation(enclosed, iterations=2)
    if force is not None:
        m |= force
    return m


def apply(a, zone, force=None, pad=True):
    m = paint_mask(a, force, pad)
    s, v = hsv(a)
    seam = seam_map(v) * m
    if force is not None:
        seam = seam * ~ndimage.binary_dilation(force, iterations=6)
    lum = zone.mean(-1, keepdims=True) / 255
    tgt = np.where(lum > 0.4, zone * (1 - 0.5 * seam[..., None]), zone + 34 * seam[..., None])
    soft = ndimage.gaussian_filter(m.astype(float), 0.8)[..., None]
    return a * (1 - soft) + tgt * soft


def side(y0, y1, flip, text_box, glass_poly, protect=()):
    """y0:y1 atlas rows of a side strip; flip=True if stored upside-down."""
    a = atlas[y0:y1].copy()
    if flip:
        a = a[::-1]
    H, W = a.shape[:2]
    s, v = hsv(a)
    # window bottom edge: lowest glass row per column, fitted with a line over the straight run
    glass = (v < 0.45) & (a[..., 2] > a[..., 0] + 8) & (np.arange(H)[:, None] < 470)
    glass = ndimage.binary_opening(glass, iterations=3)
    # window bottom edge: scan up from y=600 through neutral paint until it stops (glass / frame)
    paintlike = (s < 0.14) & (v > 0.5)
    paintlike = ndimage.binary_opening(paintlike, structure=np.ones((5, 1)))
    xs, yw = [], []
    for x in range(0, W, 8):
        col = paintlike[:600, x]
        if not col[590:600].all():
            continue
        nz = np.nonzero(~col)[0]
        if len(nz) and nz.max() > 300: xs.append(x); yw.append(nz.max())
    xs, yw = np.array(xs), np.array(yw, float)
    ok = (xs > 800) & ((xs < 2150) | (xs > 3650)) & (xs < 3900)
    flat = float(np.median(yw[ok]))
    k, c = 0.0, flat
    edge = np.full(W, flat)
    # belt line: darkest straight row between 600 and 680
    rowdark = (1 - v[600:680, 700:3500]).mean(1)
    belt = 600 + int(np.argmax(rowdark))
    print(f"strip rows {y0}-{y1} flip={flip}: window edge y={c:.0f}+{k:.4f}x, belt y={belt}")

    yy, xx = np.mgrid[0:H, 0:W].astype(float)
    top = edge[None, :] + 3 + 0 * yy
    zone = np.tile(BLACK, (H, W, 1))
    band_top, band_bot = top + 22, belt + 3
    # raked leading edge, further forward at the bottom (front of the bus is at x=0)
    lead = 1050 - (yy - band_top) / np.maximum(band_bot - band_top, 1) * 380
    cov_x = np.clip(xx - lead + 0.5, 0, 1)
    white = np.clip(yy - band_top + 0.5, 0, 1) * np.clip(band_bot - yy + 0.5, 0, 1) * cov_x
    teal = np.clip(yy - top + 0.5, 0, 1) * np.clip(band_top - 4 - yy + 0.5, 0, 1) * np.clip(xx - 1060 + 0.5, 0, 1)
    zone = zone * (1 - white[..., None]) + WHITE * white[..., None]
    zone = zone * (1 - teal[..., None]) + TEAL * teal[..., None]

    force = np.zeros((H, W), bool)
    x0, ty0, x1, ty1 = text_box
    force[ty0:ty1, x0:x1] = True
    noseam = (yy > edge[None, :] - 10) & (yy < band_top + 6)
    out = apply(a, zone, force | noseam)

    # front end: hand-traced door/windscreen glass keeps the original pixels,
    # all other plain paint in front of the white band becomes the zone colour
    from PIL import ImageDraw
    gm = Image.new("L", (W, H), 0); ImageDraw.Draw(gm).polygon(glass_poly, fill=255)
    for (px, py, pr) in protect:
        ImageDraw.Draw(gm).ellipse((px - pr, py - pr, px + pr, py + pr), fill=255)
    gmask = np.asarray(gm) > 0
    FX = 660
    s2, v2 = hsv(a[:, :FX])
    plain = (s2 < 0.16) & (v2 > 0.40)
    plain = ndimage.binary_closing(plain, iterations=2)
    lab, n = ndimage.label(plain)
    outside_ids = np.unique(lab[plain & ~gmask[:, :FX]])
    plain = np.isin(lab, outside_ids[outside_ids > 0])     # paint that continues across the glass outline
    upper_glass = gmask[:, :FX] & (np.arange(H)[:, None] < 540)
    plain &= ~upper_glass
    keep_glass = gmask[:, :FX] & ~plain
    sp = ndimage.gaussian_filter(plain.astype(float), 0.8)[..., None]
    fo = out[:, :FX] * (1 - sp) + zone[:, :FX] * sp
    fo[keep_glass] = a[:, :FX][keep_glass]
    out[:, :FX] = fo
    if flip:
        out = out[::-1]
    atlas[y0:y1] = out
    np.save(f"edge_{y0}.npy", edge)
    return c, k, belt


# side strips (rows in atlas); text boxes are in upright strip coords
GLASS_A = [(10, 110), (110, 98), (220, 190), (300, 280), (334, 360), (337, 560), (312, 640), (252, 700),
           (150, 752), (40, 777), (10, 772)]
GLASS_B = [(10, 110), (110, 98), (220, 190), (300, 280), (332, 360), (337, 620), (302, 692), (222, 752),
           (100, 792), (30, 802), (10, 797)]
geoA = side(1680, 2700, False, (2200, 440, 3620, 625), GLASS_A, protect=[(632, 942, 80), (705, 870, 0)])
geoB = side(0, 1000, True, (2200, 440, 3640, 625), GLASS_B)

# roof strip -> black
r = atlas[1000:1680].copy()
atlas[1000:1680] = apply(r, np.tile(BLACK, r.shape[:2] + (1,)))

# front (stored upside-down): bumper black, face panel under the windscreen white, rest black
f = atlas[2700:3010, 20:840].copy()                      # bumper + face only, windscreen untouched
H, W = f.shape[:2]
yy = np.mgrid[0:H, 0:W][0]
fz = np.tile(BLACK, (H, W, 1))
fz[yy >= 140] = WHITE                                      # atlas rows 2840+ (next to the windscreen)
atlas[2700:3010, 20:840] = apply(f, fz, pad=False)

g = atlas[3010:3650, 20:840].copy()
gs, gv = hsv(g)
bright = (gs < 0.16) & (gv > 0.45)
lab, n = ndimage.label(bright)
side_ids = set(np.unique(np.r_[lab[:, 0], lab[:, -1], lab[:, 1:40].ravel(), lab[:, -40:].ravel()])) - {0}
corner = np.isin(lab, list(side_ids))
cm = ndimage.gaussian_filter(corner.astype(float), 0.8)[..., None]
atlas[3010:3650, 20:840] = g * (1 - cm) + BLACK * cm

# rear -> black
rr = atlas[2700:3650, 860:1620].copy()
keep = rr[3270 - 2700:3610 - 2700, 920 - 860:1570 - 860].copy()   # rear window glass
rr = apply(rr, np.tile(BLACK, rr.shape[:2] + (1,)))
cur = rr[3270 - 2700:3610 - 2700, 920 - 860:1570 - 860]
ks, kv = hsv(keep)
bright = ~ndimage.binary_opening((kv < 0.5) | (ks > 0.25), iterations=2)
lab, n = ndimage.label(bright)
border = set(np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]])) - {0}
rim = np.isin(lab, list(border))
isglass = ~ndimage.binary_dilation(rim, iterations=2)
cur[isglass] = keep[isglass]
atlas[2700:3650, 860:1620] = rr

img = Image.fromarray(np.clip(atlas, 0, 255).astype(np.uint8))
img.save("tex2_new.png"); img.save("tex2_new.jpg", quality=93, subsampling=0)
np.save("geo.npy", np.array([geoA, geoB]))
print("saved")
