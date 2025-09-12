// HorangHill LigmaForge Editor Engine - Undo, Redo and keyboard shortcuts
let sceneHistory = [];
let currentIndex = -1;
let shiftKeyHeld

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
    const focusedElem = document.activeElement.tagName;
    if (focusedElem == 'INPUT' || focusedElem == 'TEXTAREA') return;
    
    if (event.ctrlKey && event.key == "z") {
        event.preventDefault()
        undo();
    } else if (event.ctrlKey && event.key == "y") {
        event.preventDefault()
        redo();
    } else if (event.ctrlKey && event.key == "d" && document.getElementById("cloneNodeBtn")) {
        event.preventDefault()
        document.getElementById("cloneNodeBtn").click()
    } else if (event.key == "m") {
        event.preventDefault()
        document.getElementById("transformMove").click()
    } else if (event.key == "r") {
        event.preventDefault()
        document.getElementById("transformRotate").click()
    } else if (event.key == "s") {
        event.preventDefault()
        document.getElementById("transformScale").click()
    } else if (event.key == "t") {
        event.preventDefault()
        playScene()
    } else if (event.key == "Delete" && document.getElementById("deleteNodeBtn")) {
        event.preventDefault()
        document.getElementById("deleteNodeBtn").click()
    } else if (event.key == "ShiftLeft") {
        event.preventDefault()
        shiftKeyHeld = true
    }
});

document.addEventListener("keyup", function (event) {
    if (event.key == "ShiftLeft") {
        event.preventDefault()
        shiftKeyHeld = false
    }
})