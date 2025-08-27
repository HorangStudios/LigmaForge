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
var controls = new THREE.OrbitControls(camera, renderer.domElement);
renderer.setSize(1920, 1080);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.domElement.id = 'canvas';
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

//Outline Effect
const composer = new THREE.EffectComposer(renderer);
const renderPass = new THREE.RenderPass(scene, camera);
const outlinePass = new THREE.OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
const ssaoPass = new THREE.SSAOPass(scene, camera);
ssaoPass.kernelRadius = 1
ssaoPass.minDistance = 0.001
ssaoPass.maxDistance = 0.3
composer.addPass(renderPass);
composer.addPass(outlinePass);
//composer.addPass(ssaoPass);

//render
function animate() {
    stats.begin();
    controls.update()
    composer.render(scene, camera);
    resizeCanvas()
    stats.end();
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
    let currWidth = window.innerWidth - ((sideButtonsWidth + 2) + (explorerWidth + 2))
    let currHeight = window.innerHeight - (controlsHeight + 1)

    if ((currHeight != prevHeight) || (currWidth != prevWidth)) {
        prevWidth = currWidth
        prevHeight = currHeight

        document.getElementById("canvas").style.marginTop = 0
        document.getElementById("canvas").style.marginRight = explorerWidth + 1
        document.getElementById("canvas").width = currWidth;
        document.getElementById("canvas").height = currHeight;

        camera.aspect = currWidth / currHeight
        camera.updateProjectionMatrix();
        renderer.setSize(currWidth, currHeight);
    }
}

// click to select
var startTime;
function onDocumentMouseDown(event, duration) {
    if (event.target !== renderer.domElement || document.getElementById("clicktosel").checked == false || duration > 250) return;

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
            let data = null;

            if (selectedObject === cubemesh) data = cubeInstanceData[instanceId];
            else if (selectedObject === spheremesh) data = sphereInstanceData[instanceId];
            else if (selectedObject === cylindermesh) data = cylinderInstanceData[instanceId];

            if (data && 'itemIndex' in data) {
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
            }
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
        listSchematic()
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

//start translation
startAutomaticTranslation()
document.getElementById("languages").value = localStorage.getItem("prefLang") || "default";