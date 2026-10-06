"""Render the bus GLB from preset angles with Blender (headless, Cycles CPU).
usage: python3 render.py model.glb out_prefix [views=comma list] [samples]
"""
import sys, math
import bpy
from mathutils import Vector

glb, prefix = sys.argv[1], sys.argv[2]
views = sys.argv[3].split(",") if len(sys.argv) > 3 else ["hero", "right", "left", "front"]
samples = int(sys.argv[4]) if len(sys.argv) > 4 else 24

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb)

meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
# normalise orientation: long axis -> X
import mathutils
bpy.context.view_layer.update()
_p = [o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
_ex = max(p.x for p in _p) - min(p.x for p in _p); _ey = max(p.y for p in _p) - min(p.y for p in _p)
if _ey > _ex:
    for o in bpy.context.scene.objects:
        if o.parent is None:
            o.matrix_world = mathutils.Matrix.Rotation(math.pi / 2, 4, "Z") @ o.matrix_world
    bpy.context.view_layer.update()
    print("rotated model 90deg so length runs along X")
pts = [o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
ctr = (mn + mx) / 2
L = (mx - mn).length
print("bounds", mn, mx)

scn = bpy.context.scene
scn.render.engine = "CYCLES"
scn.cycles.device = "CPU"
scn.cycles.samples = samples
scn.cycles.use_denoising = True
scn.render.resolution_x, scn.render.resolution_y = 1600, 900
scn.view_settings.view_transform = "Standard"

world = bpy.data.worlds.new("w"); scn.world = world
world.use_nodes = True
bg = world.node_tree.nodes["Background"]
bg.inputs[0].default_value = (1, 1, 1, 1); bg.inputs[1].default_value = 1.0

# soft key light
bpy.ops.object.light_add(type="AREA", location=(ctr.x + 0.5 * L, ctr.y - 0.8 * L, mx.z + 0.65 * L))
key = bpy.context.object; key.data.energy = 3000 * (L / 12.8) ** 2; key.data.size = 0.8 * L
key.rotation_euler = (math.radians(45), 0, math.radians(30))

# shadow catcher ground
bpy.ops.mesh.primitive_plane_add(size=L * 16, location=(ctr.x, ctr.y, mn.z))
bpy.context.object.is_shadow_catcher = True
scn.render.film_transparent = False

cam_data = bpy.data.cameras.new("cam"); cam_data.lens = 50
cam = bpy.data.objects.new("cam", cam_data); scn.collection.objects.link(cam); scn.camera = cam

# Blender: +X = model length axis, +Y/-Y sides, +Z up. Front direction decided by caller via view names.
d = L * 1.45
presets = {
    "right": Vector((0, -1, 0.15)),      # looking at -Y side
    "left": Vector((0, 1, 0.15)),        # +Y side
    "front": Vector((1, 0, 0.15)),       # +X end
    "back": Vector((-1, 0, 0.15)),
    "hero": Vector((0.75, -1, 0.22)),    # +X end and -Y side
    "hero2": Vector((0.75, 1, 0.22)),    # +X end and +Y side
    "hero3": Vector((-0.75, -1, 0.22)),
    "hero4": Vector((-0.75, 1, 0.22)),
}
for v in views:
    dirv = presets[v].normalized()
    cam.location = ctr + dirv * d
    look = ctr - cam.location
    cam.rotation_euler = look.to_track_quat("-Z", "Y").to_euler()
    scn.render.filepath = f"{prefix}_{v}.png"
    bpy.ops.render.render(write_still=True)
    print("wrote", scn.render.filepath)
