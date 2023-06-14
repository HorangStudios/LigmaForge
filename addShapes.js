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
        
        "mass": 1
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
        
        "mass": 1
    }

    // Add the sphere to the scene
    scene.add(sphere);
    sceneSchematics.push(schematicItem)
    listSchematic()
}

function addCone(x, y, z, radius, height, radialSegments, color) {
    // Create a new geometry for the cone
    var geometry = new THREE.ConeGeometry(radius, height, radialSegments);

    // Create a new material for the cone
    var material = new THREE.MeshPhongMaterial({ color: color });

    // Create a new mesh from the geometry and material
    var cone = new THREE.Mesh(geometry, material);
    cone.castShadow = true;
    cone.receiveShadow = true;
    cone.position.set(x, y, z);

    let schematicItem = {
        "name": "cone",
        "type": "cone",

        "x": x,
        "y": y,
        "z": z,

        "rotx": 0,
        "roty": 0,
        "rotz": 0,

        "radius": radius,
        "height": height,
        "radialSegments": radialSegments,

        "color": color,
        "mat": "MeshPhongMaterial",
        "tex": false,

        "initScript": "",
        "updateScript": "",
        "clickScript": "",
        
        "mass": 1
    }

    // Add the cone to the scene
    scene.add(cone);
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
        
        "radiusTop": radiusTop,
        "radiusBottom": radiusBottom,
        "height": height,
        "radialSegments": radialSegments,

        "color": color,
        "mat": "MeshPhongMaterial",
        "tex": false,

        "initScript": "",
        "updateScript": "",
        "clickScript": "",
        
        "mass": 1
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