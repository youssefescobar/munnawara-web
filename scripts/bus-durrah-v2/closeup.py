import sys, math, bpy
from mathutils import Vector, Matrix
glb, outp = sys.argv[1], sys.argv[2]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb)
scn = bpy.context.scene
scn.render.engine = "CYCLES"; scn.cycles.device = "CPU"; scn.cycles.samples = 32; scn.cycles.use_denoising = True
scn.render.resolution_x, scn.render.resolution_y = 1400, 800
scn.view_settings.view_transform = "Standard"
w = bpy.data.worlds.new("w"); scn.world = w; w.use_nodes = True
w.node_tree.nodes["Background"].inputs[0].default_value = (1, 1, 1, 1)
bpy.ops.object.light_add(type="AREA", location=(1.5, 1.2, 1.4)); l = bpy.context.object; l.data.energy = 120; l.data.size = 2
l.rotation_euler = (math.radians(50), 0, math.radians(120))
logo = [o for o in scn.objects if o.name.startswith("logo_pos_x")][0]
c = sum((logo.matrix_world @ v.co for v in logo.data.vertices), Vector()) / len(logo.data.vertices)
cd = bpy.data.cameras.new("c"); cd.lens = 50; cam = bpy.data.objects.new("c", cd); scn.collection.objects.link(cam); scn.camera = cam
cam.location = c + Vector((0.75, -0.35, 0.08))
cam.rotation_euler = (c - cam.location).to_track_quat("-Z", "Y").to_euler()
scn.render.filepath = outp
bpy.ops.render.render(write_still=True)
