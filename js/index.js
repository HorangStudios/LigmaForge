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
renderer.toneMappingExposure = 0.5;
renderer.domElement.id = 'canvas';
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

//transform controls
var transformControls = new THREE.TransformControls(camera, renderer.domElement);
scene.add(transformControls);
transformControls.setTranslationSnap(0.5)
transformControls.setRotationSnap(0.5)
transformControls.setScaleSnap(0.5)
transformControls.addEventListener('dragging-changed', function (event) {
    controls.enabled = !event.value;
});

//AAA game graphics
composer = new THREE.EffectComposer(renderer);
ssaoPass = new THREE.SSAOPass(scene, camera);
ssaoPass.kernelRadius = 1
ssaoPass.minDistance = 0.001
ssaoPass.maxDistance = 0.3
composer.addPass(ssaoPass);

//render
function animate() {
    stats.begin();
    controls.update()
    renderer.render(scene, camera);
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
    let controlsHeight = document.getElementById('controls').getBoundingClientRect().height
    let currWidth = window.innerWidth - (sideButtonsWidth + 2)
    let currHeight = window.innerHeight - (controlsHeight + 1)

    if ((currHeight != prevHeight) || (currWidth != prevWidth)) {
        prevWidth = currWidth
        prevHeight = currHeight

        document.getElementById("canvas").style.marginTop = 0
        document.getElementById("canvas").width = currWidth;
        document.getElementById("canvas").height = currHeight;

        camera.aspect = currWidth / currHeight
        camera.updateProjectionMatrix();
        renderer.setSize(currWidth, currHeight);
    }
}

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

//close sidebar
function closeExplorer() {
    listSchematic()

    explorerMenu.style.transition = "all 0.1s ease";
    explorerMenu.style.width = "0vw"
    explorerMenu.style.borderWidth = "0px";

    setTimeout(() => { explorerMenu.style.transition = "none"; }, 100);
}

//show sidebar
function openExplorer() {
    if (explorerMenu.style.width == "0vw") {
        explorerMenu.style.transition = "all 0.1s ease";
        explorerMenu.style.borderWidth = "1px";

        if (window.matchMedia('(pointer: none), (pointer: coarse)').matches) {
            explorerMenu.style.width = "100vw";
            explorerMenu.style.marginLeft = "0px";
            explorerMenu.style.marginTop = document.getElementById("sidecontainer").getBoundingClientRect().height;
            explorerMenu.style.height = `calc(100vh - ${document.getElementById("controls").getBoundingClientRect().height}px - ${document.getElementById("sidecontainer").getBoundingClientRect().height}px)`;
        } else {
            explorerMenu.style.width = "25vw";
            explorerMenu.style.marginLeft = document.getElementById("sidecontainer").getBoundingClientRect().width;
            explorerMenu.style.marginTop = "0px";
            explorerMenu.style.height = `calc(100vh - ${document.getElementById("controls").getBoundingClientRect().height}px)`;
        }
    } else {
        closeExplorer()
    }
}

//toggle transformcontrols snapping
function setSnapping(val) {
    if (val == true) {
        transformControls.setTranslationSnap(0.5)
        transformControls.setRotationSnap(0.5)
        transformControls.setScaleSnap(0.5)
    } else {
        transformControls.setTranslationSnap(0)
        transformControls.setRotationSnap(0)
        transformControls.setScaleSnap(0)
    }
}

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