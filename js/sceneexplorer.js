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

let lastSelectedObj
function listSchematic(toClick = false, clickSelect = false) {
    if (toClick === lastSelectedObj && clickSelect) {
        return
    } else {
        lastSelectedObj = toClick
    }

    const shapesList = document.getElementById('explorercontent');
    const itemProperties = document.getElementById('detailscontent');
    itemProperties.innerHTML = '<h3>Inspect</h3><br><span>Select something on the explorer to edit its properties here!</span>';

    if (sceneSchematics.length != 0) {
        shapesList.innerHTML = '<h3>Explorer</h3><br>';
    } else {
        shapesList.innerHTML = '<h3>Explorer</h3><br><span>Add something to the project to see it here!</span>';
    }

    loadScene(sceneSchematics, false, false)

    sceneSchematics.forEach((element, i) => {
        let button = document.createElement('button');
        button.className = 'sceneNodeIcon';
        button.innerHTML = `<i class="fa fa-cubes"></i> ` + element.name;

        button.onclick = function () {
            loadScene(sceneSchematics, false, i)

            itemProperties.innerHTML = '';

            let delButton = document.createElement('button');
            delButton.innerHTML = `<i class="fa-solid fa-trash"></i>`
            delButton.className = "sceneNodeIcon halfbutton";

            let cloneButton = document.createElement('button');
            cloneButton.innerHTML = `<i class="fa-regular fa-clone"></i>`
            cloneButton.className = "sceneNodeIcon halfbutton";

            delButton.onclick = function () {
                sceneSchematics.splice(i, 1);
                listSchematic()
                addObject()
            }

            cloneButton.onclick = function () {
                sceneSchematics.push(JSON.parse(JSON.stringify(element)))
                listSchematic(i)
                addObject()
            }

            itemProperties.prepend(document.createElement('hr'));

            Object.entries(element).forEach(([key, value]) => {
                let input = document.createElement('input');
                let label = document.createElement('label');

                label.innerText = key + ":";
                label.setAttribute('for', key);
                input.value = value;
                input.id = key;

                if (typeof value == 'number') {
                    input.type = "number"
                } else {
                    input.type = "text"
                }

                if (key == "color") {
                    input.setAttribute("value", value)
                }

                label.className = "nodeSceneLabel";

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

                if (key !== "type" && key !== "mat" && key !== "initScript" && key !== "updateScript" && key !== "clickScript" && key !== "gltfData") {
                    itemProperties.appendChild(label);
                    itemProperties.appendChild(input);
                }

                if (key == "color") {
                    input.type = "color"
                }

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

            itemProperties.prepend(delButton);
            itemProperties.prepend(cloneButton);
            itemProperties.prepend(document.createElement("br"));

            let title = document.createElement("h3");
            title.innerText = 'Inspect';
            itemProperties.prepend(title);
        };

        shapesList.appendChild(button);

        if (i === toClick) {
            button.click();
        }
    });
}

addElem.cube(0, -1, 0, 32, 1, 32, '#008000')