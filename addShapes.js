// Function to spawn a new cube
function spawnCube(x, y, z, sizeX, sizeY, sizeZ, color) {
    // Create the cube's geometry
    var cubeGeometry = new THREE.BoxGeometry(sizeX, sizeY, sizeZ);

    // Create the cube's material
    var cubeMaterial = new THREE.MeshPhongMaterial({ color: color });

    // Create the cube
    var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.position.set(x, y, z);

    let schematicItem = {
        "name": "cube",
        "type":"cube",

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

        "initScript": "",
        "updateScript": "",
        "clickScript": "",
        
        "mass": 0
    }

    // Add the cube to the scene
    scene.add(cube);
    sceneSchematics.push(schematicItem)
    listSchematic()
}

function addSphere(sphereradius, spherewidth, sphereheight, x, y, z, color) {
    // Create a new sphere geometry with a radius of 1
    var sphereGeometry = new THREE.SphereGeometry(sphereradius, spherewidth, sphereheight);

    // Create a new mesh material with a red color
    var sphereMaterial = new THREE.MeshPhongMaterial({ color: color });

    // Create a new mesh using the sphere geometry and material
    var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    sphere.position.set(x, y, z);

    let schematicItem = {
        "name": "sphere",
        "type":"sphere",

        "x": x,
        "y": y,
        "z": z,

        "rotx": 0,
        "roty": 0,
        "rotz": 0,

        "sphereradius": sphereradius,
        "spherewidth": spherewidth,
        "sphereheight": sphereheight,

        "color": color,
        "mat": "MeshPhongMaterial",
        "tex": false,

        "initScript": "",
        "updateScript": "",
        "clickScript": "",
        
        "mass": 0
    }

    // Add the sphere to the scene
    scene.add(sphere);
    sceneSchematics.push(schematicItem)
    listSchematic()
}

function addCylinder(x, y, z, radiusTop, radiusBottom, height, radialSegments, color) {
    // Create a new geometry for the cone
    var geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);

    // Create a new material for the cone
    var material = new THREE.MeshPhongMaterial({ color: color });

    // Create a new mesh from the geometry and material
    var cylinder = new THREE.Mesh(geometry, material);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    cylinder.position.set(x, y, z);

    let schematicItem = {
        "name": "cylinder",
        "type": "cylinder",

        "x": x,
        "y": y,
        "z": z,

        "rotx": 0,
        "roty": 0,
        "rotz": 0,
        
        "radius": radiusTop,
        "height": height,
        "radialSegments": radialSegments,

        "color": color,
        "mat": "MeshPhongMaterial",
        "tex": false,

        "initScript": "",
        "updateScript": "",
        "clickScript": "",
        
        "mass": 0
    }

    // Add the cone to the scene
    scene.add(cylinder);
    sceneSchematics.push(schematicItem)
    listSchematic()
}

function addLight(x, y, z, intensity, distance, color) {
    // Create a new point light
    var light = new THREE.PointLight(color, intensity, distance);

    // Position the light in the scene
    light.position.set(x, y, z);
    light.castShadow = true;

    let schematicItem = {
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
    }

    // Add the light to the scene
    scene.add(light);
    sceneSchematics.push(schematicItem)
    listSchematic()
}

function generateterrain(voxsize, tersize, color) {
    // Create a new ImprovedNoise object
    var noise = new THREE.ImprovedNoise();

    // Create a voxel size and terrain size
    var voxelSize = voxsize;
    var terrainSize = tersize;

    // Create a new geometry and material for the voxel terrain
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshPhongMaterial({ color: color });

    var generated = 0;

    // Loop through each position in the terrain and create a voxel mesh
    for (var x = 0; x < terrainSize; x++) {
        for (var y = 0; y < terrainSize; y++) {
            // Generate a random height value using ImprovedNoise
            var height = noise.noise(x / 10, y / 10, 0) * 10;

            let schematicItem = {
                "name": "cube",
                "type":"cube",

                "x": (x * voxelSize) - (terrainSize / 2),
                "y": height,
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

                "initScript": "",
                "updateScript": "",
                "clickScript": "",
                
                "mass": 0
            }

            sceneSchematics.push(schematicItem)
            generated += 1;
        }

        if (generated == (terrainSize * terrainSize)) listSchematic();
    }
}