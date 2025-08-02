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
var renderer = new THREE.WebGLRenderer({ antialias: true });
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

    world.step(1 / 60);
    if (gamestarteou) { syncPhysicsToGraphics() };

    world.bodies.forEach(function (body, index) {
        if (body.threeMesh) {
            body.threeMesh.position.copy(body.position);
            body.threeMesh.quaternion.copy(body.quaternion);
        }
    });

    if (typeof cubemesh !== "undefined" && cubemesh.count) {
        for (let i = 0; i < cubeInstanceData.length; i++) {
            const data = cubeInstanceData[i];
            if (data && data.scriptFunction) {
                try {
                    data.scriptFunction(cubemesh, i);
                } catch (err) {
                    debug("[ERR] " + err.message);
                }
            }
            if (data && data.initscriptFunction && !data.initiated) {
                try {
                    data.initscriptFunction(cubemesh, i);
                    data.initiated = true;
                } catch (err) {
                    debug("[ERR] " + err.message);
                }
            }
        }
    }
    if (typeof spheremesh !== "undefined" && spheremesh.count) {
        for (let i = 0; i < sphereInstanceData.length; i++) {
            const data = sphereInstanceData[i];
            if (data && data.scriptFunction) {
                try {
                    data.scriptFunction(cubemesh, i);
                } catch (err) {
                    debug("[ERR] " + err.message);
                }
            }
            if (data && data.initscriptFunction && !data.initiated) {
                try {
                    data.initscriptFunction(cubemesh, i);
                    data.initiated = true;
                } catch (err) {
                    debug("[ERR] " + err.message);
                }
            }
        }
    }
    if (typeof cylindermesh !== "undefined" && cylindermesh.count) {
        for (let i = 0; i < cylinderInstanceData.length; i++) {
            const data = cylinderInstanceData[i];
            if (data && data.scriptFunction) {
                try {
                    data.scriptFunction(cubemesh, i);
                } catch (err) {
                    debug("[ERR] " + err.message);
                }
            }
            if (data && data.initscriptFunction && !data.initiated) {
                try {
                    data.initscriptFunction(cubemesh, i);
                    data.initiated = true;
                } catch (err) {
                    debug("[ERR] " + err.message);
                }
            }
        }
    }

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
    var y = document.getElementById("canvas");
    var b = document.getElementById("chats");
    var z = document.getElementById("devtools");
    if (x.style.width == "0px") {
        x.style.width = "250px";
        y.style.filter = "blur(10px)";
        b.style.filter = "blur(10px)";
    } else {
        x.style.width = "0px";
        z.style.width = "0px";
        y.style.filter = "blur(0px)";
        b.style.filter = "blur(0px)";
    }
}

//show devtools
function showConsole() {
    var x = document.getElementById("devtools");
    if (x.style.width == "0px") {
        x.style.width = "calc(100vw - 250px)";
    } else {
        x.style.width = "0px";
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
            let instanceId = intersects[0].instanceId;
            let data = null;
            if (selectedObject === cubemesh) data = cubeInstanceData[instanceId];
            else if (selectedObject === spheremesh) data = sphereInstanceData[instanceId];
            else if (selectedObject === cylindermesh) data = cylinderInstanceData[instanceId];

            if (data && data.clickscriptFunction) {
                try {
                    data.clickscriptFunction({ mesh: selectedObject, index: instanceId });
                } catch (err) {
                    debug("[ERR] " + err.message);
                }
            }
        } else if (selectedObject.userData.clickscriptfunction) {
            try {
                selectedObject.userData.clickscriptfunction(selectedObject);
            }
            catch (err) {
                debug("[ERR] " + err.message);
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
let ver = "0.5.0";
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