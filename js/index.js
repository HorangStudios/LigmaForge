// HorangHill LigmaForge Editor Engine - 3d scene, orbitcontrols, save, open, preview, click to select and render
//threejs r131
var scene = new THREE.Scene();
var sceneSchematics = [];
var explorerMenu = document.getElementById("explorer")
var explorerList = document.getElementById("explorercontent")

//performance stats
var stats = new Stats();
stats.dom.id = "resourceMonitor"
stats.dom.style.left = ''
document.getElementById("controls").appendChild(stats.dom);
//scene.fog = new THREE.Fog(0xadd8e6, 10, 100);

//create a camera
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000000);
camera.position.set(5, 5, 5);
camera.lookAt(new THREE.Vector3(0, 0, 0));

// Create a renderer
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.domElement.id = 'canvas';
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
document.body.appendChild(renderer.domElement);

//controls
var clock = new THREE.Clock();
var controls = new THREE.FlyControls(camera, renderer.domElement);
controls.movementSpeed = 50;
controls.rollSpeed = 0;
controls.autoForward = false;
controls.dragToLook = true;

//Outline Effect
const composer = new THREE.EffectComposer(renderer);
const renderPass = new THREE.RenderPass(scene, camera);
const outlinePass = new THREE.OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
composer.addPass(renderPass);
composer.addPass(outlinePass);

//render
function animate() {
    stats.begin();
    if (document.getElementById("homepage").style.display == "none") composer.render(scene, camera);
    stats.end();

    const delta = clock.getDelta();
    controls.update(delta);
    resizeCanvas()

    requestAnimationFrame(animate);
}
animate()

//resize window
var prevWidth = 0
var prevHeight = 0
function resizeCanvas() {
    let sideButtonsWidth = document.getElementById('sideButtons').getBoundingClientRect().width
    let explorerWidth = document.getElementById('details').getBoundingClientRect().width
    let controlsHeight = document.getElementById('controls').getBoundingClientRect().height
    let currWidth = window.innerWidth - (sideButtonsWidth + explorerWidth)
    let currHeight = window.innerHeight - (controlsHeight + 1)

    if ((currHeight != prevHeight) || (currWidth != prevWidth)) {
        prevWidth = currWidth
        prevHeight = currHeight

        document.getElementById("canvas").style.marginRight = explorerWidth
        document.getElementById("canvas").width = currWidth;
        document.getElementById("canvas").height = currHeight;

        document.getElementById("tabs").style.marginRight = explorerWidth
        document.getElementById("tabs").style.width = `${currWidth}px`;
        document.getElementById("tabs").style.height = `${currHeight}px`;

        camera.aspect = currWidth / currHeight
        camera.updateProjectionMatrix();
        renderer.setSize(currWidth, currHeight);
    }
}

// click to select
var startTime;
function onDocumentMouseDown(event, duration) {
    if (event.target !== renderer.domElement || duration > 250 || event.button != 0) return;

    var canvasDimensions = renderer.domElement.getBoundingClientRect();
    var mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - canvasDimensions.left) / canvasDimensions.width) * 2 - 1;
    mouse.y = - ((event.clientY - canvasDimensions.top) / canvasDimensions.height) * 2 + 1;

    var raycaster = new THREE.Raycaster();
    raycaster.params.Points = { threshold: 0.01 };
    raycaster.setFromCamera(mouse, camera);

    var objectsToIntersect = scene.children.filter(obj => !(obj.type === "TransformControls" || obj.isTransformControls));
    var intersects = raycaster.intersectObjects(objectsToIntersect, true);

    if (intersects.length > 0) {
        var selectedObject = intersects[0].object;

        if (selectedObject instanceof THREE.InstancedMesh && intersects[0].instanceId !== undefined) {
            let instanceId = intersects[0].instanceId;
            Object.keys(allMesh).forEach(key => {
                if (selectedObject !== allMesh[key]) return;
                let data = instanceData[key][instanceId]

                if (!data || !('itemIndex' in data)) return;
                let idx = data.itemIndex;

                if (event.shiftKey) {
                    let selectionArray = [...lastSelectedObj];
                    if (!selectionArray.includes(idx)) {
                        selectionArray.push(idx);
                    } else {
                        selectionArray.splice(selectionArray.indexOf(idx), 1);
                    }
                    listSchematic(selectionArray);
                } else {
                    if (!lastSelectedObj.includes(idx)) {
                        listSchematic([idx]);
                    } else {
                        listSchematic([]);
                    }
                }
            });
        } else {
            let idx = selectedObject.userData && selectedObject.userData.itemIndex;
            if (idx !== undefined) {
                if (event.shiftKey) {
                    let selectionArray = [...lastSelectedObj];
                    if (!selectionArray.includes(idx)) {
                        selectionArray.push(idx);
                    } else {
                        selectionArray.splice(selectionArray.indexOf(idx), 1);
                    }
                    listSchematic(selectionArray);
                } else {
                    if (!lastSelectedObj.includes(idx)) {
                        listSchematic([idx]);
                    } else {
                        listSchematic([]);
                    }
                }
            } else if (transformControls.object) {
                listSchematic([]);
            }
        }
    }
}

// click to select - when mouse held
document.getElementById('canvas').addEventListener('mousedown', () => {
    startTime = Date.now();
});

// click to select - when mouse released
document.getElementById('canvas').addEventListener('mouseup', (event) => {
    if (startTime) {
        const duration = Date.now() - startTime;
        onDocumentMouseDown(event, duration)
    }
});

//editor controls
renderer.domElement.addEventListener('wheel', e => { e.preventDefault(); camera.translateZ(e.deltaY * 0.01); }, { passive: false });
renderer.domElement.addEventListener("mousedown", async (e) => { if (e.button === 2) { try { await renderer.domElement.requestPointerLock(); } catch (err) { } } });
renderer.domElement.addEventListener("mouseup", (e) => { if (e.button === 2 && document.pointerLockElement === renderer.domElement) { document.exitPointerLock(); } });
renderer.domElement.addEventListener("contextmenu", (e) => e.preventDefault());
document.addEventListener("mousemove", (e) => {
    const sensitivity = 0.0025;
    const PI_2 = Math.PI / 2;
    const euler = new THREE.Euler(0, 0, 0, 'YXZ');

    if (document.pointerLockElement !== renderer.domElement) return;
    euler.setFromQuaternion(camera.quaternion);
    euler.y -= e.movementX * sensitivity;
    euler.x -= e.movementY * sensitivity;
    euler.x = Math.max(-PI_2, Math.min(PI_2, euler.x));
    camera.quaternion.setFromEuler(euler);
});

// save
function exportScene() {
    const json = JSON.stringify(sceneSchematics, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const fileName = "scene.hhls";
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
}

// open
function importScene() {
    var input = document.getElementById("file-input");
    const file = input.files[0];

    const reader = new FileReader();
    reader.onload = function (event) {
        const contents = event.target.result;
        const json = JSON.parse(contents);
        sceneSchematics = json;
        gltfcache = {};
        texcache = {};
        listSchematic();
        document.getElementById("homepage").style.display = "none";
    };

    reader.readAsText(file);
}

// play
function playScene() {
    const receiverWindow = window.open('player/index.html', 'popup', 'popup=true,width=640,height=400');

    receiverWindow.addEventListener('load', function () {
        receiverWindow.loadScene(sceneSchematics, true, false)
    });
}

//toggle transformcontrols snapping
var setSnapping

//export scene to gltf model
function exportGLTF() {
    const exporter = new THREE.GLTFExporter();
    exporter.parse(
        scene,
        function (gltf) {
            const blob = new Blob([JSON.stringify(gltf, null, 2)], { type: "application/json" });
            const fileName = "scene.gltf";
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            link.click();
        },
        function (error) {
            console.log('An error happened');
        }
    );
}

//close tab confirmation
// window.addEventListener('beforeunload', (event) => {
//   event.preventDefault();
//   event.returnValue = ''; 
// });

//start translation
startAutomaticTranslation()
document.getElementById("languages").value = localStorage.getItem("prefLang") || "default";