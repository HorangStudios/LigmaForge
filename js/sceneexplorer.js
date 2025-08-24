// HorangHill LigmaForge Editor Engine - Parse and edit scene
// convert file to dataurl/base64
const convertBase64 = (event) => {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();

        fileReader.onload = () => {
            resolve(fileReader.result);
        };

        fileReader.onerror = (error) => {
            reject(error);
        };

        fileReader.readAsDataURL(event.target.files[0]);
    });
};

// list and load game
let lastSelectedObj
function listSchematic(toClick = false, clickSelect = false) {
    // skip this code if selecting an already selected object
    if (toClick === lastSelectedObj && clickSelect) {
        return
    } else {
        lastSelectedObj = toClick
    }

    // node inspector sidebar
    const shapesList = document.getElementById('explorercontent');
    const itemProperties = document.getElementById('detailscontent');
    itemProperties.innerHTML = '<h3>Inspect</h3><br><span>Select something on the explorer to edit its properties here!</span>';

    // nodes list sidebar
    if (sceneSchematics.length != 0) {
        shapesList.innerHTML = '<h3>Explorer</h3><br>';
    } else {
        shapesList.innerHTML = '<h3>Explorer</h3><br><span>Add something to the project to see it here!</span>';
    }

    // process and add schematics to scene
    loadScene(sceneSchematics, false, false)

    // create input fields for each properties to the node inspector sidebar
    sceneSchematics.forEach((element, i) => {
        let button = document.createElement('button');
        button.className = 'sceneNodeIcon';
        button.innerHTML = `<i class="fa fa-cubes"></i> ` + element.name;

        button.onclick = function () {
            // process and add schematics to scene
            loadScene(sceneSchematics, false, i)

            // empty out inspector
            itemProperties.innerHTML = '';

            // create delete button
            let delButton = document.createElement('button');
            delButton.innerHTML = `<i class="fa-solid fa-trash"></i>`
            delButton.className = "sceneNodeIcon halfbutton";
            delButton.id = 'deleteNodeBtn';
            delButton.title = 'Delete (Del)';

            // create clone button
            let cloneButton = document.createElement('button');
            cloneButton.innerHTML = `<i class="fa-regular fa-clone"></i>`
            cloneButton.className = "sceneNodeIcon halfbutton";
            cloneButton.id = 'cloneNodeBtn';
            cloneButton.title = 'Clone (Ctrl + D)';

            // when delete button clicked
            delButton.onclick = function () {
                sceneSchematics.splice(i, 1);
                listSchematic()
                addObject()
            }

            // when clone button clicked
            cloneButton.onclick = function () {
                sceneSchematics.push(JSON.parse(JSON.stringify(element)))
                listSchematic(i)
                addObject()
            }

            // add line spacer
            itemProperties.prepend(document.createElement('hr'));

            Object.entries(element).forEach(([key, value]) => {
                // create input and label
                let input = document.createElement('input');
                let label = document.createElement('label');

                // label text, class, id and input value, id
                label.innerText = key + ":";
                label.className = "nodeSceneLabel";
                label.setAttribute('for', key);
                input.value = value;
                input.id = key;

                // set input type to its appropriate data type
                if (typeof value == 'number') {
                    input.type = "number"
                } else {
                    input.type = "text"
                }

                // set color for color input
                if (key == "color") {
                    input.setAttribute("value", value)
                }

                // update scene when data changed
                input.onchange = async function (event) {
                    if (key == "color") {
                        element[key] = input.value;
                        listSchematic(i);
                    } else if (key == "opacity") {
                        element[key] = parseFloat(input.value);
                        listSchematic(i);
                    } else if (typeof value == 'number') {
                        element[key] = parseInt(input.value);
                        listSchematic(i);
                    } else if (input.type == 'file') {
                        const base64 = await convertBase64(event);
                        element[key] = base64;
                        listSchematic(i);
                    } else {
                        element[key] = input.value;
                        listSchematic(i);
                    }
                    addObject()
                };

                // add input if the data is allowed to be edited
                if (key !== "type" && key !== "mat" && key !== "initScript" && key !== "updateScript" && key !== "clickScript" && key !== "gltfData") {
                    itemProperties.appendChild(label);
                    itemProperties.appendChild(input);
                }

                // color picker
                if (key == "color") {
                    input.type = "color"
                }

                // texture file uploader
                if (key == "tex") {
                    input.type = "file"
                    input.accept = 'image/png, image/jpeg'

                    let clearBtn = document.createElement('a')
                    clearBtn.innerHTML = '&nbsp;(Clear)'
                    clearBtn.style.cursor = 'pointer'
                    clearBtn.style.textDecoration = 'underline'
                    label.appendChild(clearBtn)

                    clearBtn.onclick = function () {
                        element[key] = false
                        listSchematic(i);
                        addObject()
                    }
                }

                // initscript edit
                if (key == "initScript") {
                    let button = document.createElement('button');
                    button.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> InitScript`
                    button.className = "sceneNodeIcon";

                    button.onclick = async function () {
                        let code = await spawnCodeEditor(element.initScript, element.name + ' InitScript')
                        element['initScript'] = code;
                        addObject()
                    }

                    itemProperties.prepend(button);
                }

                // updatescript edit
                if (key == "updateScript") {
                    let button = document.createElement('button');
                    button.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> UpdateScript`
                    button.className = "sceneNodeIcon";

                    button.onclick = async function () {
                        let code = await spawnCodeEditor(element.updateScript, element.name + ' updateScript')
                        element['updateScript'] = code;
                        addObject()
                    }

                    itemProperties.prepend(button);
                }

                // clickscript edit
                if (key == "clickScript") {
                    let button = document.createElement('button');
                    button.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> ClickScript`
                    button.className = "sceneNodeIcon";

                    button.onclick = async function () {
                        let code = await spawnCodeEditor(element.clickScript, element.name + ' clickScript')
                        element['clickScript'] = code;
                        addObject()
                    }

                    itemProperties.prepend(button);
                }
            });

            // delete and clone button (+separator)
            itemProperties.prepend(delButton);
            itemProperties.prepend(cloneButton);
            itemProperties.prepend(document.createElement("br"));

            // inspector title
            let title = document.createElement("h3");
            title.innerText = 'Inspect';
            itemProperties.prepend(title);
        };

        // add node to node list
        shapesList.appendChild(button);

        // auto inspect selected item when scene is reloaded
        if (i === toClick) {
            button.click();
        }
    });
}

// create baseplate
addElem.cube(0, -1, 0, 32, 1, 32, '#008000')