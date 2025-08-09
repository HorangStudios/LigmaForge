var addElem = {}

addElem.cube = function (x, y, z, sizeX, sizeY, sizeZ, color) {
    sceneSchematics.push({
        "name": "cube",
        "type": "cube",

        "x": x,
        "y": y,
        "z": z,

        "rotx": 0,
        "roty": 0,
        "rotz": 0,

        "sizeX": sizeX,
        "sizeY": sizeY,
        "sizeZ": sizeZ,

        "color": color,
        "mat": "MeshPhongMaterial",
        "tex": false,
        "opacity": 1,

        "initScript": "",
        "updateScript": "",
        "clickScript": "",

        "mass": 0
    })

    listSchematic()
    addObject()
}

addElem.sphere = function (x, y, z, sizeX, sizeY, sizeZ, color) {
    sceneSchematics.push({
        "name": "sphere",
        "type": "spherev2",

        "x": x,
        "y": y,
        "z": z,

        "rotx": 0,
        "roty": 0,
        "rotz": 0,

        "sizeX": sizeX,
        "sizeY": sizeY,
        "sizeZ": sizeZ,

        "color": color,
        "mat": "MeshPhongMaterial",
        "tex": false,
        "opacity": 1,

        "initScript": "",
        "updateScript": "",
        "clickScript": "",

        "mass": 0
    })

    listSchematic()
    addObject()
}

addElem.cylinder = function (x, y, z, sizeX, sizeY, sizeZ, color) {
    sceneSchematics.push({
        "name": "cylinder",
        "type": "cylinderv2",

        "x": x,
        "y": y,
        "z": z,

        "rotx": 0,
        "roty": 0,
        "rotz": 0,

        "sizeX": sizeX,
        "sizeY": sizeY,
        "sizeZ": sizeZ,

        "color": color,
        "mat": "MeshPhongMaterial",
        "tex": false,
        "opacity": 1,

        "initScript": "",
        "updateScript": "",
        "clickScript": "",

        "mass": 0
    })

    listSchematic()
    addObject()
}

addElem.light = function (x, y, z, intensity, distance, color) {
    sceneSchematics.push({
        "name": "light",
        "type": "light",

        "x": x,
        "y": y,
        "z": z,

        "rotx": 0,
        "roty": 0,
        "rotz": 0,

        "intensity": intensity,
        "distance": distance,
        "color": color,
    })

    listSchematic()
    addObject()
}

addElem.importGLTFModel = function (x, y, z) {
    var input = document.createElement("input")
    var reader = new FileReader();
    input.type = 'file'
    input.accept = '.glb, .gltf'

    input.onchange = function () {
        const file = input.files[0];
        reader.readAsDataURL(file);
    }

    reader.onload = function (event) {
        const contents = event.target.result;
        sceneSchematics.push({
            "name": input.files[0].name,
            "type": "importedGLTFModel",

            "x": x,
            "y": y,
            "z": z,

            "sizeX": 1,
            "sizeY": 1,
            "sizeZ": 1,

            "rotx": 0,
            "roty": 0,
            "rotz": 0,

            "initScript": "",
            "updateScript": "",
            "clickScript": "",

            "gltfData": contents,
            "mass": 0
        })

        listSchematic()
        addObject()
    };

    input.click()
}

addElem.terrain = function (voxsize, tersize, color) {
    var noise = new THREE.ImprovedNoise();
    var voxelSize = voxsize;
    var terrainSize = tersize;
    var generated = 0;

    for (var x = 0; x < terrainSize; x++) {
        for (var y = 0; y < terrainSize; y++) {
            sceneSchematics.push({
                "name": "cube",
                "type": "cube",

                "x": (x * voxelSize) - (terrainSize / 2),
                "y": (noise.noise(x / 10, y / 10, 0) * 10) - 10,
                "z": (y * voxelSize) - (terrainSize / 2),

                "rotx": 0,
                "roty": 0,
                "rotz": 0,

                "sizeX": voxelSize,
                "sizeY": voxelSize,
                "sizeZ": voxelSize,

                "color": color,
                "mat": "MeshPhongMaterial",
                "tex": false,
                "opacity": 1,

                "initScript": "",
                "updateScript": "",
                "clickScript": "",

                "mass": 0
            })
            generated += 1;
        }

        if (generated == (terrainSize * terrainSize)) { listSchematic(); addObject() };
    }

}

spawnCube = addElem.cube
addSphere = addElem.sphere
addCylinder = addElem.cylinder
addLight = addElem.light
generateterrain = addElem.terrain