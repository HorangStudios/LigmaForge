let sceneHistory = [];
let currentIndex = -1;

function addObject() {
    sceneHistory.splice(currentIndex + 1, sceneHistory.length - currentIndex - 1);
    sceneHistory.push(JSON.parse(JSON.stringify(sceneSchematics)));
    currentIndex = sceneHistory.length - 1;
}

function updateScene() {
    sceneSchematics = JSON.parse(JSON.stringify(sceneHistory[currentIndex]));
    listSchematic();
}

function undo() {
    if (currentIndex > 0) {
        currentIndex--;
        updateScene();
    }
}

function redo() {
    if (currentIndex < sceneHistory.length - 1) {
        currentIndex++;
        updateScene();
    }
}

document.addEventListener("keydown", function (event) {
    if (event.ctrlKey && event.key === "z") {
        undo();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.ctrlKey && event.key === "y") {
        redo();
    }
});