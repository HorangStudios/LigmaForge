let ver = "0.2.3";
console.log(`%cHorangHill`, `
font-weight: bold; 
font-size: 50px;
color: red; 
text-shadow: 3px 3px 0 rgb(217,31,38) , 6px 6px 0 rgb(226,91,14) , 9px 9px 0 rgb(245,221,8) , 12px 12px 0 rgb(5,148,68) , 15px 15px 0 rgb(2,135,206) , 18px 18px 0 rgb(4,77,145) , 21px 21px 0 rgb(42,21,113)
`);
console.log(`HorangHill (LigmaForge) Client Version ${ver}`)
document.getElementById('clientversion').innerText = `HorangHill (LigmaForge) Client Version ${ver}`

//editor debug
function debug(text) {
    console.log('Message from game: ' + text)
}

// Create a scene
var scene = new THREE.Scene();
const color = 0xadd8e6;  // white
const near = 10;
const far = 100;
scene.fog = new THREE.Fog(color, near, far);

//create a camera
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100);
camera.position.set(5, 5, 5);
camera.lookAt(new THREE.Vector3(0, 0, 0));

// Create the physics world
var world = new CANNON.World();
var worldmass = 0
world.gravity.set(0, -9.85, 0);
world.broadphase = new CANNON.NaiveBroadphase();
world.solver.iterations = 10;
const clock = new THREE.Clock();

// Create a renderer
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xadd8e6); // Set the background color to #add8e6
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.domElement.id = 'canvas';
document.body.appendChild(renderer.domElement);

// LIGHTS
const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
hemiLight.color.setHSL(0.6, 1, 0.6);
hemiLight.groundColor.setHSL(0.095, 1, 0.75);
hemiLight.position.set(0, 50, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.color.setHSL(0.1, 1, 0.95);
dirLight.position.set(- 1, 1.75, 1);
dirLight.position.multiplyScalar(30);
scene.add(dirLight);

dirLight.castShadow = true;

dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;

const d = 50;

dirLight.shadow.camera.left = - d;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = - d;

dirLight.shadow.camera.far = 3500;
dirLight.shadow.bias = - 0.0001;

const light = new THREE.AmbientLight(0x404040); // soft white light
scene.add(light);

//testing skybox
const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
    'resources/posx.jpg',
    'resources/negx.jpg',
    'resources/posy.jpg',
    'resources/negy.jpg',
    'resources/posz.jpg',
    'resources/negz.jpg',
]);
scene.background = texture;

// Function to import a GLTF file to the scene
function loadMap(sceneSchematics) {
    var loadedItems = 0

    sceneSchematics.forEach(element => {
        let sceneNode;

        loadedItems += 1;

        switch (element.type) {
            case "cube":
                var cubeGeometry = new THREE.BoxGeometry(element.sizeX, element.sizeY, element.sizeZ);
                var cubeMaterial = new THREE.MeshPhongMaterial({ color: element.color });

                sceneNode = new THREE.Mesh(cubeGeometry, cubeMaterial);
                sceneNode.castShadow = true;
                sceneNode.receiveShadow = true;
                sceneNode.position.set(element.x, element.y, element.z);
                sceneNode.rotation.set(element.rotx, element.roty, element.rotz);
                scene.add(sceneNode);

                // Create the corresponding Cannon.js body
                var cubeShape = new CANNON.Box(new CANNON.Vec3(element.sizeX / 2, element.sizeY / 2, element.sizeZ / 2));
                var cubeBody = new CANNON.Body({ mass: parseInt(element.mass) });
                cubeBody.addShape(cubeShape);
                cubeBody.position.set(element.x, element.y, element.z);
                world.addBody(cubeBody);

                // Associate the Three.js mesh with the Cannon.js body
                cubeBody.threeMesh = sceneNode;

                //Apply Scripts
                const scriptFunction = new Function("mesh", element.updateScript);
                sceneNode.userData.scriptFunction = scriptFunction;
                const clickscriptFunction = new Function("mesh", element.clickScript);
                sceneNode.userData.clickscriptfunction = clickscriptFunction;
                const initscriptFunction = new Function("mesh", element.initScript);
                sceneNode.userData.initscriptFunction = initscriptFunction;

                break;

            // Add cases for other object types if needed

            case "cylinder":
                var cylinderGeometry = new THREE.CylinderGeometry(element.radius, element.radius, element.height, element.radialSegments);
                var cylinderMaterial = new THREE.MeshPhongMaterial({ color: element.color });

                sceneNode = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
                sceneNode.castShadow = true;
                sceneNode.receiveShadow = true;
                sceneNode.position.set(element.x, element.y, element.z);
                sceneNode.rotation.set(element.rotx, element.roty, element.rotz);
                scene.add(sceneNode);

                // Create the corresponding Cannon.js body
                var cylinderShape = new CANNON.Cylinder(element.radius, element.radius, element.height, element.radialSegments);
                var cylinderBody = new CANNON.Body({ mass: element.mass });
                cylinderBody.addShape(cylinderShape);
                cylinderBody.position.set(element.x, element.y, element.z);
                world.addBody(cylinderBody);

                // Associate the Three.js mesh with the Cannon.js body
                cylinderBody.threeMesh = sceneNode;
                break;

            case "sphere":
                var sphereGeometry = new THREE.SphereGeometry(element.sphereradius, element.spherewidth, element.sphereheight);
                var sphereMaterial = new THREE.MeshPhongMaterial({ color: element.color });

                sceneNode = new THREE.Mesh(sphereGeometry, sphereMaterial);
                sceneNode.castShadow = true;
                sceneNode.receiveShadow = true;
                sceneNode.position.set(element.x, element.y, element.z);
                sceneNode.rotation.set(element.rotx, element.roty, element.rotz);
                scene.add(sceneNode);

                // Create the corresponding Cannon.js body
                var sphereShape = new CANNON.Sphere(element.sphereradius);
                var sphereBody = new CANNON.Body({ mass: element.mass });
                sphereBody.addShape(sphereShape);
                sphereBody.position.set(element.x, element.y, element.z);
                world.addBody(sphereBody);

                // Associate the Three.js mesh with the Cannon.js body
                sphereBody.threeMesh = sceneNode;
                break;

            default:
                console.warn('Unknown Scene Node! ' + element.type);
        }

        if (loadedItems == sceneSchematics.length) {
            document.getElementById('gameload').style.display = "none";
            spawnPlayer()
        }
    });
}

// Render the scene
function animate() {

    requestAnimationFrame(animate);

    render();

}

function render() {

    world.step(1 / 120);

    // Update the positions and rotations of the Three.js objects based on the Cannon.js bodies
    world.bodies.forEach(function (body, index) {
        if (body.threeMesh) {
            body.threeMesh.position.copy(body.position);
            body.threeMesh.quaternion.copy(body.quaternion);
        }
    });

    scene.traverse(function (object) {
        if (object instanceof THREE.Mesh && object.userData.scriptFunction) {
            try {
                object.userData.scriptFunction(object);

                if (object.userData.initiated != true) {
                    object.userData.initscriptFunction(object);
                    object.userData.initiated = true;
                }
            }
            catch (err) {
                debug("[ERR] " + err.message);
            }
        }
    });

    renderer.render(scene, camera);
}

animate()

function toggleSideBar() {
    var x = document.getElementById("Sidenav");
    var y = document.getElementById("canvas");
    if (x.style.width == "0px") {
        x.style.width = "250px";
        y.style.filter = "blur(10px)";
    } else {
        x.style.width = "0px";
        y.style.filter = "blur(0px)";
    }
}

document.getElementById('canvas').addEventListener('click', onDocumentMouseDown, false);

function onDocumentMouseDown(event) {

    // Get the mouse position relative to the canvas
    var mouse = new THREE.Vector2();
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = - (event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    // Create a new raycaster
    var raycaster = new THREE.Raycaster();

    // Set the origin and direction of the raycaster
    raycaster.setFromCamera(mouse, camera);

    // Get an array of objects that the ray intersects with
    var intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        // Get the first intersected object
        var selectedObject = intersects[0].object;

        if (selectedObject.userData.clickscriptfunction) {
            try {
                selectedObject.userData.clickscriptfunction(selectedObject);
            }
            catch (err) {
                debug("[ERR] " + err.message);
            }
        }
    }
}

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}