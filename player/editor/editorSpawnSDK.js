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

    // Add the cube to the scene
    scene.add(cube);
}

function addSphere(sphereradius, spherewidth, sphereheight, sizeX, sizeY, sizeZ, color) {
    // Create a new sphere geometry with a radius of 1
    var sphereGeometry = new THREE.SphereGeometry(sizeX, sizeY, sizeZ);
    // Create a new mesh material with a red color
    var sphereMaterial = new THREE.MeshPhongMaterial({ color: color });
    // Create a new mesh using the sphere geometry and material
    var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    sphere.position.set(sphereradius, spherewidth, sphereheight);
    // Add the sphere to the scene
    scene.add(sphere);
}

function addCone(x, y, z, sizeX, sizeY, sizeZ, color) {
    // Create a new geometry for the cone
    var geometry = new THREE.ConeGeometry(sizeX, sizeY, sizeZ);
    // Create a new material for the cone
    var material = new THREE.MeshPhongMaterial({ color: color });
    // Create a new mesh from the geometry and material
    var cone = new THREE.Mesh(geometry, material);
    cone.castShadow = true;
    cone.receiveShadow = true;
    cone.position.set(x, y, z);
    // Add the cone to the scene
    scene.add(cone);
}

function addCylinder(x, y, z, sizeX, sizeY, sizeZ, radialSegments, color) {
    // Create a new geometry for the cone
    var geometry = new THREE.CylinderGeometry(sizeX, sizeY, sizeZ, radialSegments);
    // Create a new material for the cone
    var material = new THREE.MeshPhongMaterial({ color: color });
    // Create a new mesh from the geometry and material
    var cylinder = new THREE.Mesh(geometry, material);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    cylinder.position.set(x, y, z);
    // Add the cone to the scene
    scene.add(cylinder);
}

function addLight(x, y, z, intensity, distance, color) {
    // Create a new point light
    var light = new THREE.PointLight(color, intensity, distance);
    // Position the light in the scene
    light.position.set(x, y, z);
    light.castShadow = true;
    // Add the light to the scene
    scene.add(light);
}

function generateterrain(voxsize, tersize, color) {
    // Create a new ImprovedNoise object
    var noise = new THREE.ImprovedNoise();

    // Create a voxel size and terrain size
    var voxelSize = voxsize;
    var terrainSize = tersize;

    // Create a new geometry and material for the voxel terrain
    var geometry = new THREE.BoxGeometry(voxelSize, voxelSize, voxelSize);
    var material = new THREE.MeshPhongMaterial({ color: color });

    // Loop through each position in the terrain and create a voxel mesh
    for (var x = 0; x < terrainSize; x++) {
        for (var y = 0; y < terrainSize; y++) {
            // Generate a random height value using ImprovedNoise
            var height = noise.noise(x / 10, y / 10, 0) * 10;

            // Create a new voxel mesh and position it based on the terrain size and voxel size
            var voxel = new THREE.Mesh(geometry, material);
            voxel.position.x = x * voxelSize;
            voxel.position.y = height;
            voxel.position.z = y * voxelSize;

            // Add the voxel mesh to the scene
            scene.add(voxel);
        }
    }
}