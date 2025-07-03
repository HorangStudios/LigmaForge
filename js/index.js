//threejs r131
var scene = new THREE.Scene();
var stats = new Stats();
var sceneSchematics = [];
document.getElementsByClassName("counter")[0].appendChild(stats.dom);
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
document.getElementById('main').appendChild(renderer.domElement);

//transform controls
var transformControls = new THREE.TransformControls(camera, renderer.domElement);
transformControls.addEventListener('dragging-changed', function (event) {
    controls.enabled = !event.value;
});
scene.add(transformControls);

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
    stats.end();
    requestAnimationFrame(animate);
}
animate()

//resize window
function onWindowResize() {
    var viewPortWidth = document.getElementById("canvas").getBoundingClientRect().width
    var viewPortHeight = document.getElementById("canvas").getBoundingClientRect().height
    camera.aspect = viewPortWidth / viewPortHeight
    camera.updateProjectionMatrix();
    renderer.setSize(viewPortWidth, viewPortHeight);
    composer.setSize(viewPortWidth, viewPortHeight);
}
window.addEventListener('resize', onWindowResize, false);
onWindowResize()

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