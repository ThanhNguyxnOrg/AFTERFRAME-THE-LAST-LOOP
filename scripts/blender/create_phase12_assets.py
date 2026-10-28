"""Generate AFTERFRAME Phase 12 chapter assets and export GLB.

Run with: blender --background --python scripts/blender/create_phase12_assets.py
"""

import math
from math import pi
from pathlib import Path

import bpy

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "public" / "assets" / "blender" / "phase12"


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1.0


def make_material(name, color, metallic, roughness, emission=None, strength=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    emission_input = bsdf.inputs.get("Emission Color") or bsdf.inputs.get("Emission")
    if emission is not None and emission_input is not None:
        emission_input.default_value = (*emission, 1.0)
        bsdf.inputs["Emission Strength"].default_value = strength
    return mat


def palette(style):
    if style == "helix":
        return {
            "structure": make_material("AF_Helix_Structure", (0.10, 0.12, 0.15), 0.82, 0.34),
            "shell": make_material("AF_Helix_Shell", (0.42, 0.49, 0.56), 0.72, 0.25),
            "accent": make_material("AF_Helix_Accent", (0.72, 0.32, 0.04), 0.78, 0.28),
            "glow": make_material("AF_Helix_Glow", (0.08, 0.55, 0.78), 0.35, 0.2, (0.04, 0.55, 0.82), 4.0),
        }
    if style == "choir":
        return {
            "structure": make_material("AF_Choir_Structure", (0.08, 0.16, 0.2), 0.75, 0.38),
            "shell": make_material("AF_Choir_Shell", (0.66, 0.78, 0.8), 0.58, 0.23),
            "accent": make_material("AF_Choir_Gold", (0.62, 0.46, 0.16), 0.88, 0.22),
            "glow": make_material("AF_Choir_Resonance", (0.15, 0.72, 0.84), 0.32, 0.18, (0.04, 0.7, 0.9), 4.5),
        }
    if style == "curator":
        return {
            "structure": make_material("AF_Curator_Structure", (0.09, 0.07, 0.18), 0.78, 0.35),
            "shell": make_material("AF_Curator_Shell", (0.48, 0.4, 0.68), 0.66, 0.24),
            "accent": make_material("AF_Curator_Trim", (0.62, 0.34, 0.08), 0.86, 0.24),
            "glow": make_material("AF_Curator_Memory", (0.55, 0.22, 0.86), 0.42, 0.16, (0.48, 0.08, 0.9), 5.0),
        }
    return {
        "structure": make_material("AF_Matron_Structure", (0.15, 0.035, 0.06), 0.76, 0.34),
        "shell": make_material("AF_Matron_Porcelain", (0.87, 0.81, 0.8), 0.28, 0.2),
        "accent": make_material("AF_Matron_Crimson", (0.62, 0.04, 0.14), 0.68, 0.22, (0.48, 0.01, 0.08), 2.5),
        "glow": make_material("AF_Matron_Scanner", (0.95, 0.3, 0.4), 0.3, 0.16, (0.9, 0.06, 0.2), 5.0),
    }


def root_object(name):
    root = bpy.data.objects.new(name, None)
    bpy.context.scene.collection.objects.link(root)
    return root


def finish(obj, root, material, bevel=0.0):
    obj.data.materials.append(material)
    obj.parent = root
    if bevel > 0:
        bpy.context.view_layer.objects.active = obj
        modifier = obj.modifiers.new("EdgeBevel", "BEVEL")
        modifier.width = bevel
        modifier.segments = 3
        modifier.limit_method = "ANGLE"
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    return obj


def cube(root, name, location, size, material, bevel=0.0, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = size
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    return finish(obj, root, material, bevel)


def cylinder(root, name, location, radius, depth, material, vertices=24, rotation=(0, 0, 0), bevel=0.0):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=vertices, radius=radius, depth=depth, location=location, rotation=rotation
    )
    obj = bpy.context.object
    obj.name = name
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    return finish(obj, root, material, bevel)


def torus(root, name, location, major, minor, material, rotation=(0, 0, 0), segments=36):
    bpy.ops.mesh.primitive_torus_add(
        major_radius=major,
        minor_radius=minor,
        major_segments=segments,
        minor_segments=8,
        location=location,
        rotation=rotation,
    )
    obj = bpy.context.object
    obj.name = name
    return finish(obj, root, material)


def ico(root, name, location, dimensions, material, subdivisions=1):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=subdivisions, radius=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return finish(obj, root, material)


def cone(root, name, location, radius1, radius2, depth, material, vertices=16, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_cone_add(
        vertices=vertices,
        radius1=radius1,
        radius2=radius2,
        depth=depth,
        location=location,
        rotation=rotation,
    )
    obj = bpy.context.object
    obj.name = name
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    return finish(obj, root, material)


def build_helix_gate():
    root = root_object("AF_HelixContainmentGate")
    mats = palette("helix")
    cube(root, "Gate_Foundation", (0, 0, 0.3), (7.2, 2.2, 0.6), mats["structure"], 0.08)
    for side in (-1, 1):
        x = side * 3.0
        cube(root, f"Gate_Pylon_{side}", (x, 0, 3.2), (1.0, 1.3, 6.4), mats["shell"], 0.09)
        cube(root, f"Gate_PylonFoot_{side}", (x, 0, 0.72), (1.5, 1.7, 0.4), mats["accent"], 0.06)
        cube(root, f"Gate_DoorLeaf_{side}", (side * 1.55, 0, 2.8), (2.85, 0.5, 5.2), mats["structure"], 0.07)
        for row in range(3):
            z = 1.15 + row * 1.65
            cube(root, f"Gate_Panel_{side}_{row}", (side * 1.55, -0.31, z), (2.3, 0.18, 0.85), mats["shell"], 0.04)
            cube(root, f"Gate_Warning_{side}_{row}", (side * 1.55, -0.43, z), (1.65, 0.06, 0.1), mats["accent"], 0.012)
        brace = cube(root, f"Gate_Brace_{side}", (side * 1.55, 0.42, 2.9), (0.28, 0.15, 4.1), mats["accent"], 0.03)
        brace.rotation_euler[1] = side * 0.42
    cube(root, "Gate_TopBeam", (0, 0, 6.35), (7.2, 1.5, 0.7), mats["shell"], 0.08)
    cube(root, "Gate_CenterSpine", (0, 0.25, 2.9), (0.34, 0.5, 5.25), mats["accent"], 0.04)
    for row, z in enumerate((1.35, 2.95, 4.55, 5.7)):
        cylinder(root, f"Gate_LockBolt_{row}", (0, -0.54, z), 0.17, 5.7, mats["accent"], 20, (0, pi / 2, 0), 0.02)
        for side in (-1, 1):
            cylinder(root, f"Gate_BoltCap_{row}_{side}", (side * 2.9, -0.54, z), 0.28, 0.18, mats["structure"], 16, (0, pi / 2, 0), 0.025)
    for i in range(5):
        cube(root, f"Gate_Hazard_{i}", (0, -0.58, 0.88 + i * 0.88), (4.6, 0.08, 0.1), mats["glow"], 0.012)
    cylinder(root, "Gate_ScanEmitter_L", (-2.1, -0.66, 4.95), 0.22, 0.18, mats["glow"], 18, (0, pi / 2, 0))
    cylinder(root, "Gate_ScanEmitter_R", (2.1, -0.66, 4.95), 0.22, 0.18, mats["glow"], 18, (0, pi / 2, 0))
    return root


def build_choir_organ():
    root = root_object("AF_ChoirAcousticOrgan")
    mats = palette("choir")
    cube(root, "Organ_Plinth", (0, 0, 0.28), (4.8, 2.7, 0.56), mats["structure"], 0.08)
    cube(root, "Organ_LowerStep", (0, -0.2, 0.72), (4.1, 2.2, 0.44), mats["shell"], 0.06)
    cube(root, "Organ_BackPanel", (0, 0.7, 3.0), (4.0, 0.32, 4.4), mats["structure"], 0.06)
    pipe_specs = [
        (-1.72, 3.1, 0.13), (-1.28, 4.0, 0.15), (-0.84, 5.1, 0.17), (-0.4, 6.15, 0.19),
        (0.05, 7.0, 0.21), (0.5, 6.0, 0.19), (0.95, 5.0, 0.17), (1.4, 4.0, 0.15), (1.84, 3.2, 0.13),
    ]
    for i, (x, height, radius) in enumerate(pipe_specs):
        mat = mats["glow"] if i == 4 else mats["shell"]
        cylinder(root, f"Organ_Pipe_{i}", (x, -0.32, 0.94 + height / 2), radius, height, mat, 20)
        cylinder(root, f"Organ_PipeMouth_{i}", (x, -0.4, 1.02 + height * 0.3), radius * 1.16, 0.18, mats["accent"], 20)
        torus(root, f"Organ_TuningBand_{i}", (x, -0.32, 1.3 + height * 0.66), radius * 1.25, 0.025, mats["accent"])
    for side in (-1, 1):
        cube(root, f"Organ_Wing_{side}", (side * 2.15, 0.12, 2.4), (0.45, 1.7, 3.8), mats["shell"], 0.06, (0, side * 0.13, 0))
        for ledge in range(3):
            cube(root, f"Organ_Balcony_{side}_{ledge}", (side * 2.15, -0.82, 1.2 + ledge * 1.15), (1.1, 0.42, 0.16), mats["structure"], 0.02)
    torus(root, "Organ_CathedralHalo", (0, 0.08, 4.1), 2.55, 0.075, mats["accent"], (pi / 2, 0, 0), 48)
    torus(root, "Organ_ResonanceHalo", (0, 0.02, 3.62), 1.98, 0.055, mats["glow"], (pi / 2, -0.2, 0), 48)
    ico(root, "Organ_Core", (0, -0.4, 3.25), (0.95, 0.65, 1.2), mats["glow"])
    cone(root, "Organ_CrownSpire", (0, 0.0, 7.55), 0.48, 0.08, 1.1, mats["accent"], 8)
    return root


def build_curator_archive():
    root = root_object("AF_CuratorArchiveMonolith")
    mats = palette("curator")
    cube(root, "Archive_Foot", (0, 0, 0.22), (3.4, 2.2, 0.44), mats["structure"], 0.06)
    cylinder(root, "Archive_Plinth", (0, 0, 0.72), 1.2, 0.6, mats["accent"], 12)
    cube(root, "Archive_Spine", (0, 0.15, 3.15), (1.0, 0.85, 5.3), mats["structure"], 0.07)
    for i in range(7):
        width = 3.5 - i * 0.18
        z = 1.18 + i * 0.63
        x = -0.12 if i % 2 == 0 else 0.12
        cube(root, f"Archive_MemorySlab_{i}", (x, -0.08, z), (width, 1.38, 0.38), mats["shell"] if i % 2 else mats["structure"], 0.045, (0, 0, (i - 3) * 0.035))
        cube(root, f"Archive_DataStrip_{i}", (x, -0.78, z), (width * 0.72, 0.05, 0.09), mats["glow"] if i % 3 else mats["accent"], 0.01)
    for side in (-1, 1):
        cube(root, f"Archive_SideFrame_{side}", (side * 1.55, 0.32, 2.75), (0.34, 0.8, 4.4), mats["accent"], 0.04)
        for i in range(4):
            cube(root, f"Archive_SideCell_{side}_{i}", (side * 1.55, -0.15, 1.2 + i * 0.88), (0.46, 0.45, 0.24), mats["glow"], 0.018)
    ico(root, "Archive_RecordCore", (0, -0.86, 3.25), (1.0, 0.46, 1.25), mats["glow"], 1)
    torus(root, "Archive_OuterAstrolabe", (0, 0, 3.55), 2.2, 0.045, mats["accent"], (pi / 2 + 0.16, 0.25, 0), 48)
    torus(root, "Archive_InnerAstrolabe", (0, 0, 3.55), 1.62, 0.035, mats["glow"], (pi / 2 - 0.22, -0.25, 0), 48)
    for i in range(6):
        angle = i * pi / 3
        px = math.cos(angle) * 2.2
        py = math.sin(angle) * 2.2
        ico(root, f"Archive_OrbitalShard_{i}", (px, py, 3.55), (0.3, 0.3, 0.85), mats["glow"] if i % 2 else mats["shell"], 1)
    cone(root, "Archive_Crown", (0, 0, 6.15), 0.72, 0.1, 1.3, mats["shell"], 6)
    ico(root, "Archive_CrownCrystal", (0, 0, 6.8), (0.55, 0.55, 1.1), mats["glow"], 1)
    return root


def build_matron_pod():
    root = root_object("AF_MatronSurgicalPod")
    mats = palette("matron")
    cylinder(root, "Pod_Base", (0, 0, 0.25), 1.55, 0.5, mats["structure"], 24)
    cylinder(root, "Pod_BaseCollar", (0, 0, 0.53), 1.68, 0.18, mats["shell"], 24)
    cylinder(root, "Pod_Body", (0, 0, 2.25), 0.92, 3.45, mats["structure"], 28)
    cylinder(root, "Pod_InnerColumn", (0, -0.52, 2.25), 0.42, 3.35, mats["shell"], 22)
    ico(root, "Pod_Core", (0, -0.92, 2.35), (0.85, 0.45, 1.1), mats["glow"])
    for side in (-1, 1):
        shell = cube(root, f"Pod_ShellPanel_{side}", (side * 1.02, 0.05, 2.35), (0.42, 1.72, 3.7), mats["shell"], 0.12)
        shell.rotation_euler[2] = -side * 0.08
        cube(root, f"Pod_ShellInset_{side}", (side * 1.05, -0.82, 2.35), (0.2, 0.12, 2.9), mats["accent"], 0.025)
        cylinder(root, f"Pod_SideCanister_{side}", (side * 1.36, 0.35, 1.55), 0.25, 1.8, mats["accent"], 16)
        for foot in range(2):
            cube(root, f"Pod_Foot_{side}_{foot}", (side * 1.05, -0.38 + foot * 0.72, 0.22), (1.2, 0.34, 0.38), mats["structure"], 0.05, (0, 0, side * 0.06))
    for z in (1.15, 2.25, 3.32):
        torus(root, f"Pod_ScanRing_{z}", (0, 0, z), 1.12, 0.045, mats["glow"], segments=40)
        cube(root, f"Pod_ScanBridge_{z}", (0, -1.03, z), (1.25, 0.18, 0.14), mats["accent"], 0.02)
    cone(root, "Pod_TopCap", (0, 0, 4.25), 0.94, 0.34, 0.65, mats["shell"], 24)
    torus(root, "Pod_SurgicalLamp", (0, 0, 5.15), 1.2, 0.075, mats["shell"], (0, 0, 0), 40)
    torus(root, "Pod_LampGlow", (0, 0, 5.08), 1.0, 0.035, mats["glow"], segments=40)
    for i in range(4):
        angle = pi / 4 + i * pi / 2
        x = math.cos(angle) * 1.2
        y = math.sin(angle) * 1.2
        cylinder(root, f"Pod_OverheadEmitter_{i}", (x, y, 4.82), 0.12, 0.34, mats["glow"], 14)
    for i in range(4):
        cube(root, f"Pod_FloorLane_{i}", (0, -2.25 + i * 1.35, 0.05), (0.18, 0.95, 0.06), mats["accent"], 0.01)
    return root


def export(name, build_fn):
    reset_scene()
    build_fn()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUT_DIR / f"{name}.glb"
    bpy.ops.export_scene.gltf(
        filepath=str(path),
        export_format="GLB",
        export_apply=True,
        export_yup=True,
        export_cameras=False,
        export_lights=False,
    )
    print(f"EXPORTED {path} ({path.stat().st_size} bytes)")


if __name__ == "__main__":
    export("helix_containment_gate", build_helix_gate)
    export("choir_acoustic_organ", build_choir_organ)
    export("curator_archive_monolith", build_curator_archive)
    export("matron_surgical_pod", build_matron_pod)
