// HorangHill LigmaForge Multipurpose Engine - Node templates
var addElem = {}

// cube spawn code
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

// sphere spawn code
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

// cylinder spawn code
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

// spawn node spawn code
addElem.spawnnode = function (x, y, z, sizeX, sizeY, sizeZ, color) {
    sceneSchematics.push({
        "name": "Spawn Node",
        "type": "spawnnode",

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
        "team": "none",

        "initScript": "",
        "updateScript": "",
        "clickScript": "",

        "mass": 0
    })

    listSchematic()
    addObject()
}

// light spawn code
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

// import 3d model
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

// generate terrain
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

// static mesh definitions
var elemTypes = {
    "cube": {
        threeMesh: THREE.BoxGeometry,
        args: [1, 1, 1],
        name: "Cube",
        icon: "fa-solid fa-cube",
        spawnFunction: addElem.cube,
        spawnArgs: [0, 0, 0, 1, 1, 1, '#ff0000']
    },
    "spherev2": {
        threeMesh: THREE.SphereGeometry,
        args: [1, 16, 12],
        name: "Sphere",
        icon: "fa-solid fa-circle-half-stroke",
        spawnFunction: addElem.sphere,
        spawnArgs: [0, 0, 0, 1, 1, 1, '#ff0000']
    },
    "cylinderv2": {
        threeMesh: THREE.CylinderGeometry,
        args: [4.5, 4.5, 7.5, 32],
        name: "Cylinder",
        icon: "fa-solid fa-circle-half-stroke",
        spawnFunction: addElem.cylinder,
        spawnArgs: [0, 0, 0, 0.1, 0.1, 0.1, '#ff0000']
    },
    "spawnnode": {
        threeMesh: THREE.BoxGeometry,
        args: [1, 1, 1],
        name: "Spawn Node",
        icon: "fa-solid fa-flag",
        spawnFunction: addElem.spawnnode,
        spawnArgs: [0, 0, 0, 1.5, 0.25, 1.5, '#808080']
    }
}

// spawn static mesh spawn buttons
Object.values(elemTypes).forEach(item => {
    const br = document.createElement("br");
    const elem = document.createElement("button");
    elem.title = "Add " + item.name;
    elem.onclick = function () {
        item.spawnFunction(...item.spawnArgs);
    }

    const icon = document.createElement("i");
    icon.className = item.icon;

    elem.append(icon);
    document.getElementById("spawnIcon").append(elem);
    document.getElementById("spawnIcon").append(br);
});