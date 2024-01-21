let ver = "0.2.8";
console.log(`%cHorangHill`, `
font-weight: bold; 
font-size: 50px;
color: red; 
text-shadow: 3px 3px 0 rgb(217,31,38) , 6px 6px 0 rgb(226,91,14) , 9px 9px 0 rgb(245,221,8) , 12px 12px 0 rgb(5,148,68) , 15px 15px 0 rgb(2,135,206) , 18px 18px 0 rgb(4,77,145) , 21px 21px 0 rgb(42,21,113)
`);
console.log(`HorangHill Client Version ${ver} (LigmaForge)`)
document.getElementById('clientversion').innerText = `HorangHill Client Version ${ver}`

//editor debug
function debug(text) {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1;
    let dd = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    const formattedToday = '[' + dd + '/' + mm + '/' + yyyy + '] ';

    let p = document.createElement('p');
    p.innerText = formattedToday + text;

    document.getElementById('terminal').prepend(p)
    console.log(formattedToday + text);
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
renderer.domElement.style.transition = '0.5s ease';
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
    sceneSchematics.forEach((element, i) => {
        let sceneNode;

        if (i == sceneSchematics.length - 1) {
            document.getElementById('gameload').style.display = "none";
            spawnPlayer()
            debug('Spawning Player...')
        }

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

                if (element.tex) {
                    const texture = new THREE.TextureLoader().load(element.tex, () => {
                        // Once the texture is loaded, replace the sphere's material map with the new texture
                        sceneNode.material.map = texture;
                        sceneNode.material.needsUpdate = true;
                    });
                }

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

                if (element.tex) {
                    const texture = new THREE.TextureLoader().load(element.tex, () => {
                        // Once the texture is loaded, replace the sphere's material map with the new texture
                        sceneNode.material.map = texture;
                        sceneNode.material.needsUpdate = true;
                    });
                }

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

                if (element.tex) {
                    const texture = new THREE.TextureLoader().load(element.tex, () => {
                        // Once the texture is loaded, replace the sphere's material map with the new texture
                        sceneNode.material.map = texture;
                        sceneNode.material.needsUpdate = true;
                    });
                }

                break;

            default:
                console.warn('Unknown Scene Node! ' + element.type);
        }
    });
}

// Render the scene
function animate() {
    requestAnimationFrame(animate);

    render();
}

function render() {
    renderer.render(scene, camera);
}

animate()

function updatePhysics() {
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

    world.step(1 / 120);

    // Update the positions and rotations of the Three.js objects based on the Cannon.js bodies
    world.bodies.forEach(function (body, index) {
        if (body.threeMesh) {
            body.threeMesh.position.copy(body.position);
            body.threeMesh.quaternion.copy(body.quaternion);
        }
    });
}

setInterval(updatePhysics, 0)

function toggleSideBar() {
    var x = document.getElementById("Sidenav");
    var y = document.getElementById("canvas");
    var z = document.getElementById("devtools");
    if (x.style.width == "0px") {
        x.style.width = "250px";
        y.style.filter = "blur(20px)";
    } else {
        x.style.width = "0px";
        z.style.width = "0px";
        y.style.filter = "blur(0px)";
    }
}

function showConsole() {
    var x = document.getElementById("devtools");
    if (x.style.width == "0px") {
        x.style.width = "calc(100vw - 250px)";
    } else {
        x.style.width = "0px";
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