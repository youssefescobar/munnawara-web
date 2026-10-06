"""Build the rebranded Tourliner GLB: repainted 4K livery + logo decals shrink-wrapped to both sides.
usage: python3 build2.py in.glb tex.jpg logo.png out.glb CX HPX
  CX  = logo centre along the strip (texture px, front of bus at 0)
  HPX = logo height in texture px
"""
import sys, math
import numpy as np
import bpy, bmesh
from mathutils import Vector
from mathutils.geometry import barycentric_transform, intersect_point_tri_2d

src, tex, logo, out = sys.argv[1:5]
CX, HPX = float(sys.argv[5]), float(sys.argv[6])
N = 4096
geo = np.load("geo.npy")  # per strip: window-edge intercept, slope, belt row

# strip -> atlas mapping: (row offset, flipped)
STRIPS = {"A": (1680, False, geo[0]), "B": (0, True, geo[1])}

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
body = [o for o in bpy.context.scene.objects if o.type == "MESH"][0]
bpy.context.view_layer.update()

img = bpy.data.images.load(bpy.path.abspath(tex)); img.name = "livery_4k"
for n in body.active_material.node_tree.nodes:
    if n.type == "TEX_IMAGE":
        n.image = img

mw = body.matrix_world
bm = bmesh.new(); bm.from_mesh(body.data); bm.transform(mw)
bmesh.ops.triangulate(bm, faces=bm.faces[:])
uvl = bm.loops.layers.uv.active
tris = [([l[uvl].uv.copy() for l in f.loops], [l.vert.co.copy() for l in f.loops], f.normal.copy()) for f in bm.faces]
uv_arr = np.array([[u.x, u.y] for t in tris for u in t[0]]).reshape(-1, 3, 2)
umin, umax = uv_arr.min(1), uv_arr.max(1)


def strip_to_uv(strip, x, y):
    off, flip, _ = STRIPS[strip]
    ay = off + (999 - y if flip else y)
    return Vector((x / N, 1 - ay / N))


def locate(uv):
    cand = np.nonzero((umin[:, 0] <= uv.x) & (umax[:, 0] >= uv.x) & (umin[:, 1] <= uv.y) & (umax[:, 1] >= uv.y))[0]
    for i in cand:
        uvs, cos, nrm = tris[i]
        if intersect_point_tri_2d(uv, *uvs):
            return barycentric_transform(uv.to_3d(), *[u.to_3d() for u in uvs], *cos), nrm
    return None, None


limg = bpy.data.images.load(bpy.path.abspath(logo)); limg.name = "dmtc_logo"
mat = bpy.data.materials.new("logo_decal"); mat.use_nodes = True
nt = mat.node_tree; bsdf = nt.nodes["Principled BSDF"]
t = nt.nodes.new("ShaderNodeTexImage"); t.image = limg; t.extension = "CLIP"
nt.links.new(t.outputs["Color"], bsdf.inputs["Base Color"])
nt.links.new(t.outputs["Alpha"], bsdf.inputs["Alpha"])
bsdf.inputs["Roughness"].default_value = 0.3
bsdf.inputs["Metallic"].default_value = 0.0
try:
    mat.surface_render_method = "BLENDED"
except Exception:
    pass
aspect = limg.size[0] / limg.size[1]

L = max(body.dimensions)
for name, (off, flip, (c, k, belt)) in STRIPS.items():
    edge = np.load(f"edge_{off}.npy")
    band_top = edge[int(CX)] + 3 + 22
    cy = (band_top + belt) / 2
    p, n = locate(strip_to_uv(name, CX, cy))
    p2, _ = locate(strip_to_uv(name, CX, cy + 40))
    if p is None or p2 is None:
        print("no hit for", name); continue
    mpp = (p - p2).length / 40
    n = n.normalized()
    h = HPX * mpp; w = h * aspect
    up = Vector((0, 0, 1))
    right = up.cross(n).normalized(); vup = n.cross(right).normalized()
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=24, y_subdivisions=24, size=1)
    ob = bpy.context.object; ob.name = f"logo_{"pos_x" if n.x > 0 else "neg_x"}"
    me = ob.data
    for v in me.vertices:
        x, y = v.co.x, v.co.y
        v.co = p + right * (x * w) + vup * (y * h) + n * (0.02 * L)
    # grid UVs 0..1 already from primitive
    sw = ob.modifiers.new("wrap", "SHRINKWRAP")
    sw.target = body; sw.wrap_method = "NEAREST_SURFACEPOINT"; sw.offset = 0.0006 * L
    sw.wrap_mode = "OUTSIDE_SURFACE"
    bpy.ops.object.modifier_apply(modifier="wrap")
    me.materials.append(mat)
    print(f"decal {ob.name}: centre {tuple(round(q,3) for q in p)} normal {tuple(round(q,2) for q in n)} size {w:.3f}x{h:.3f} (bus length {L:.2f})")

bpy.ops.export_scene.gltf(filepath=bpy.path.abspath(out), export_format="GLB", export_image_format="AUTO",
                          export_jpeg_quality=92)
print("exported", out)
