// Create a scene
var scene = new THREE.Scene();

//declare objects
var sceneSchematics = [];

//create a camera
var camera = new THREE.PerspectiveCamera(75, 640 / 400, 0.1, 1000);
camera.position.set(5, 5, 5);
camera.lookAt(new THREE.Vector3(0, 0, 0));

// Create a renderer
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(1920, 1080);
renderer.setClearColor(0xadd8e6); // Set the background color to #add8e6
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.domElement.id = 'canvas';
renderer.gammaInput = true;
renderer.gammaOutput = true;
document.getElementById('main').appendChild(renderer.domElement);

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
    '../resources/posx.jpg',
    '../resources/negx.jpg',
    '../resources/posy.jpg',
    '../resources/negy.jpg',
    '../resources/posz.jpg',
    '../resources/negz.jpg',
]);
scene.background = texture;

//initiate transform controls
var transformControls = new THREE.TransformControls(camera, renderer.domElement);
transformControls.addEventListener('dragging-changed', function (event) {
    controls.enabled = !event.value;
});
scene.add(transformControls);

// Add OrbitControls
var controls = new THREE.OrbitControls(camera, renderer.domElement);

// Render the scene
function render() {

    controls.update()

    renderer.render(scene, camera);

}

function animate() {

    requestAnimationFrame(animate);

    render();

}

animate()

// Save And Open
function exportScene() {
    const json = JSON.stringify(sceneSchematics, null, 2);

    const blob = new Blob([json], { type: "application/json" });
    const fileName = "scene.hhls";

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    scene.add(transformControls);
}

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

function playScene() {
    const receiverWindow = window.open('player/engine.html', 'popup', 'popup=true');

    receiverWindow.addEventListener('load', function () {
        receiverWindow.loadMap(sceneSchematics)
    });
}