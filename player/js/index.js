// HorangHill LigmaForge Player Engine - 3d scene, physics setup and render, physics update loops
// editor debug
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

    document.getElementById('terminal').appendChild(p)
    console.log(formattedToday + text);
}

function getSnapshot() {
    const today = new Date();
    const yyyy = today.getFullYear();

    let mm = today.getMonth() + 1;
    let dd = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    const formattedToday = dd + '/' + mm + '/' + yyyy;
    const get = renderer.domElement.toDataURL();
    const element = document.createElement('a');

    element.setAttribute('href', get);
    element.setAttribute('download', `${formattedToday}.png`);
    element.click();
}

// Create a scene
var scene = new THREE.Scene();
//scene.fog = new THREE.Fog(0xadd8e6, 10, 100);

//create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 700);
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
var renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.5;
renderer.domElement.id = 'canvas';
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

//AAA game graphics
composer = new THREE.EffectComposer(renderer);
ssaoPass = new THREE.SSAOPass(scene, camera);
ssaoPass.kernelRadius = 1
ssaoPass.minDistance = 0.0001
ssaoPass.maxDistance = 0.3
composer.addPass(ssaoPass);

//update physics
function updatePhysics() {
    // run initscript and script for normal mesh
    scene.traverse(function (object) {
        if ((object instanceof THREE.Mesh || object instanceof THREE.Object3D) && object.userData) {
            if (object.userData.scriptFunction) {
                ScriptSandbox(object.userData.scriptFunction, object.userData.body, object, false);
            }
            if (object.userData.initiated != true && object.userData.initscriptFunction) {
                object.userData.initiated = true;
                ScriptSandbox(object.userData.initscriptFunction, object.userData.body, object, false);
            }
        }
    });

    // continue physics
    world.step(1 / 60);
    if (gamestarteou) { syncPhysicsToGraphics() };

    // apply to normal bodies
    world.bodies.forEach(function (body, index) {
        if (body.threeMesh) {
            body.threeMesh.position.copy(body.position);
            body.threeMesh.quaternion.copy(body.quaternion);
        }
    });

    // initscript and loop scripts for instanced meshes
    Object.keys(allMesh).forEach(key => {
        for (let i = 0; i < instanceData[key].length; i++) {
            const data = instanceData[key][i];
            if (data && data.scriptFunction) {
                ScriptSandbox(data.scriptFunction, instanceBodies[key][i].body, allMesh[key], true, i, instanceBodies[key][i]);
            }
            if (data && data.initscriptFunction && !data.initiated) {
                data.initiated = true;
                ScriptSandbox(data.initscriptFunction, instanceBodies[key][i].body, allMesh[key], true, i, instanceBodies[key][i]);
            }
        }
    });

    requestAnimationFrame(updatePhysics);
}
updatePhysics()

//render
function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate()

//sidebar
function toggleSideBar() {
    var x = document.getElementById("Sidenav");
    var z = document.getElementById("devtools");

    if (x.style.display == "none") {
        x.style.display = "flex";
        x.style.animation = "slideInUp 0.25s";
    } else {
        x.style.animation = "slideOutDown 0.25s";
        z.style.display = "none";
        setTimeout(() => {
            x.style.display = "none";
        }, 250);
    }
}

//click script
function onDocumentMouseDown(event) {
    var mouse = new THREE.Vector2();
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = - (event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
        var selectedObject = intersects[0].object;

        if (selectedObject instanceof THREE.InstancedMesh && intersects[0].instanceId !== undefined) {
            Object.keys(allMesh).forEach(key => {
                if (selectedObject !== allMesh[key]) return;
                let instanceId = intersects[0].instanceId;

                let data = instanceData[key][instanceId]
                if (!data || !data.clickscriptFunction) return;

                if (data.clickscriptFunction.type == "script") {
                    ScriptSandbox(data.clickscriptFunction.code, instanceBodies[key][instanceId].body, selectedObject, true, instanceId, instanceBodies[key][instanceId]);
                } else if (data.clickscriptFunction.type == "clickListener") {
                    data.clickscriptFunction.resolve()
                }
            });
        } else if (selectedObject.userData.clickscriptFunction) {
            if (selectedObject.userData.clickscriptFunction.type == "script") {
                ScriptSandbox(selectedObject.userData.clickscriptFunction.code, selectedObject.userData.body, selectedObject, false);
            } else if (selectedObject.userData.clickscriptFunction.type == "clickListener") {
                selectedObject.userData.clickscriptFunction.resolve()
            }
        }
    }
}

document.getElementById('canvas').addEventListener('click', onDocumentMouseDown, false);

//resize window
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize, false);

//version name
let ver = "0.6.7";
console.log(`
    %cHorangHill V `, `
    font-weight: bold; 
    font-size: 50px;
    color: red; 
    margin-bottom: 15px;
    text-shadow: 3px 3px 0 rgb(217,31,38) , 6px 6px 0 rgb(226,91,14) , 9px 9px 0 rgb(245,221,8) , 12px 12px 0 rgb(5,148,68) , 15px 15px 0 rgb(2,135,206) , 18px 18px 0 rgb(4,77,145) , 21px 21px 0 rgb(42,21,113)
`);
console.log(`HorangHill Client Version ${ver} (LigmaForge)`)
document.getElementById('clientversion').innerText = `HorangHill Client Version ${ver}`
document.getElementById('clientversion1').innerText = `HorangHill Client Version ${ver}`