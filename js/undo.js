// HorangHill LigmaForge Editor Engine - Undo, Redo and keyboard shortcuts
let sceneHistory = [];
let currentIndex = -1;

// add to scene history for new changes
function addObject() {
    sceneHistory.splice(currentIndex + 1, sceneHistory.length - currentIndex - 1);
    sceneHistory.push(JSON.parse(JSON.stringify(sceneSchematics)));
    currentIndex = sceneHistory.length - 1;
}

// apply undo or redo
function updateScene() {
    sceneSchematics = JSON.parse(JSON.stringify(sceneHistory[currentIndex]));
    listSchematic();
}

// undo
function undo() {
    if (currentIndex > 0) {
        currentIndex--;
        updateScene();
    }
}

// redo
function redo() {
    if (currentIndex < sceneHistory.length - 1) {
        currentIndex++;
        updateScene();
    }
}

// keyboard shortcuts
document.addEventListener("keydown", function (event) {
    event.preventDefault()
    if (event.ctrlKey && event.key == "z") {
        undo();
    } else if (event.ctrlKey && event.key == "y") {
        redo();
    } else if (event.ctrlKey && event.key == "d" && document.getElementById("cloneNodeBtn")) {
        document.getElementById("cloneNodeBtn").click()
    } else if (event.key == "s") {
        document.getElementById("transformSelect").click()
    } else if (event.key == "m") {
        document.getElementById("transformMove").click()
    } else if (event.key == "r") {
        document.getElementById("transformRotate").click()
    } else if (event.key == "c") {
        document.getElementById("transformScale").click()
    } else if (event.key == "t") {
        playScene()
    } else if (event.key == "Delete" && document.getElementById("deleteNodeBtn")) {
        document.getElementById("deleteNodeBtn").click()
    }
});