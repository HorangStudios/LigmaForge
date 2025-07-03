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

function listSchematic() {
    const shapesList = document.getElementById('sidebar');
    shapesList.innerHTML = '';

    loadScene(sceneSchematics, false, false)

    sceneSchematics.forEach((element, i) => {
        let button = document.createElement('button');
        button.className = 'sceneNodeIcon';
        button.innerHTML = `<i class="fa fa-cubes"></i> ` + element.name;

        button.onclick = function () {
            loadScene(sceneSchematics, false, i)
            scene.add(transformControls)

            shapesList.innerHTML = '';

            let backButton = document.createElement('button');
            backButton.innerHTML = `<i class="fa-solid fa-circle-left"></i> Back`
            backButton.className = "sceneNodeIcon";

            let delButton = document.createElement('button');
            delButton.innerHTML = `<i class="fa-solid fa-trash"></i> Delete`
            delButton.className = "sceneNodeIcon";

            let cloneButton = document.createElement('button');
            cloneButton.innerHTML = `<i class="fa-regular fa-clone"></i> Clone`
            cloneButton.className = "sceneNodeIcon";

            backButton.onclick = function () {
                transformControls.detach()
                listSchematic()
            }

            delButton.onclick = function () {
                transformControls.detach()
                sceneSchematics.splice(i, 1);
                listSchematic()
            }

            cloneButton.onclick = function () {
                transformControls.detach()
                var copy = JSON.parse(JSON.stringify(element));
                sceneSchematics.push(copy)
                listSchematic()
            }

            shapesList.appendChild(document.createElement('hr'));
            shapesList.appendChild(backButton);
            shapesList.appendChild(delButton);
            shapesList.appendChild(cloneButton);
            shapesList.appendChild(document.createElement('hr'));

            Object.entries(element).forEach(([key, value]) => {
                let input = document.createElement('input');
                let label = document.createElement('label');

                label.innerText = key + ":";
                input.value = value;

                if (typeof value == 'number') {
                    input.type = "number"
                }

                if (key == "color") {
                    input.setAttribute("value", value)
                }

                label.className = "nodeSceneLabel";

                input.onchange = async function (event) {
                    transformControls.detach()
                    if (key == "color") {
                        element[key] = input.value;
                        listSchematic();
                        return
                    } if (key == "opacity") {
                        element[key] = parseFloat(input.value);
                    } else if (typeof value == 'number') {
                        element[key] = parseInt(input.value);
                    } else if (input.type == 'file') {
                        const base64 = await convertBase64(event);
                        element[key] = base64;
                    } else {
                        element[key] = input.value;
                    }
                    listSchematic();
                };

                if (key !== "type" && key !== "mat" && key !== "initScript" && key !== "updateScript" && key !== "clickScript") {
                    shapesList.appendChild(label);
                    shapesList.appendChild(input);
                }

                if (key == "color") {
                    input.type = "color"
                }

                if (key == "tex") {
                    input.type = "file"

                    let clearBtn = document.createElement('a')
                    clearBtn.innerText = '(Clear)'
                    label.appendChild(clearBtn)

                    clearBtn.onclick = function () {
                        transformControls.detach()
                        element[key] = false
                        listSchematic();
                    }
                }

                if (key == "initScript") {
                    let button = document.createElement('button');
                    button.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> InitScript`
                    button.className = "sceneNodeIcon";

                    button.onclick = async function () {
                        let code = await spawnCodeEditor(element.initScript, element.name + ' InitScript')
                        element['initScript'] = code;
                    }

                    shapesList.prepend(button);
                }

                if (key == "updateScript") {
                    let button = document.createElement('button');
                    button.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> UpdateScript`
                    button.className = "sceneNodeIcon";

                    button.onclick = async function () {
                        let code = await spawnCodeEditor(element.updateScript, element.name + ' updateScript')
                        element['updateScript'] = code;
                    }

                    shapesList.prepend(button);
                }

                if (key == "clickScript") {
                    let button = document.createElement('button');
                    button.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> ClickScript`
                    button.className = "sceneNodeIcon";

                    button.onclick = async function () {
                        let code = await spawnCodeEditor(element.clickScript, element.name + ' clickScript')
                        element['clickScript'] = code;
                    }

                    shapesList.prepend(button);
                }
            });
        };

        shapesList.appendChild(button);
    });
}