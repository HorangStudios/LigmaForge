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
var selectObjCall = {}
var lastSelectedObj = []
function listSchematic(toClick = []) {
    // clear node select code & set last selected object
    lastSelectedObj = toClick
    selectObjCall = {}

    // node inspector sidebar
    const shapesList = document.getElementById('explorercontent');
    const itemProperties = document.getElementById('detailscontent');
    shapesList.innerHTML = '';

    // return to scene tab
    document.getElementById('scene').click();

    // hide clickscript buttons
    const clickscriptbtn = document.getElementById('clickscript');
    const updatescriptbtn = document.getElementById('updatescript');
    const initscriptbtn = document.getElementById('initscript');
    clickscriptbtn.style.display = 'none';
    updatescriptbtn.style.display = 'none';
    initscriptbtn.style.display = 'none';

    // clear code tabs
    const tabclickscript = document.getElementById('tab-clickscript');
    const tabupdatescript = document.getElementById('tab-updatescript');
    const tabinitscript = document.getElementById('tab-initscript');
    tabclickscript.innerHTML = '';
    tabupdatescript.innerHTML = '';
    tabinitscript.innerHTML = '';

    function cloneGroup(group) {
        group.forEach(element => {
            sceneSchematics.push(JSON.parse(JSON.stringify(sceneSchematics[element])))
            listSchematic(group)
            addObject()
        });
    }

    function delGroup(group) {
        group.sort((a, b) => b - a);
        group.forEach(index => {
            sceneSchematics.splice(index, 1);
        });

        listSchematic();
        addObject();
    }


    // create group delete button
    let delButton = document.createElement('button');
    delButton.innerHTML = `<i class="fa-solid fa-trash"></i>`
    delButton.className = "sceneNodeIcon halfbutton";
    delButton.id = 'deleteNodeBtn';
    delButton.title = 'Delete (Del)';

    // create group clone button
    let cloneButton = document.createElement('button');
    cloneButton.innerHTML = `<i class="fa-regular fa-clone"></i>`
    cloneButton.className = "sceneNodeIcon halfbutton";
    cloneButton.id = 'cloneNodeBtn';
    cloneButton.title = 'Clone (Ctrl + D)';

    // shapes list selection code
    shapesList.onchange = function () {
        // return to scene tab
        document.getElementById('scene').click();

        // hide clickscript buttons & clear code tabs
        clickscriptbtn.style.display = 'none';
        updatescriptbtn.style.display = 'none';
        initscriptbtn.style.display = 'none';
        tabclickscript.innerHTML = '';
        tabupdatescript.innerHTML = '';
        tabinitscript.innerHTML = '';

        // get selected nodes
        const selectedValues = Array.from(shapesList.options).filter(option => option.selected).map(option => Number(option.value));

        // select the node on the scene
        if (selectedValues.length == 1) {
            selectObjCall[selectedValues[0]]();
        } else if (selectedValues.length > 1) {
            // process and add schematics to scene with transformcontrols
            loadScene(sceneSchematics, false, selectedValues)
            itemProperties.innerHTML = '';

            itemProperties.prepend(delButton);
            delButton.onclick = () => { delGroup(selectedValues) };

            itemProperties.prepend(cloneButton);
            cloneButton.onclick = () => { cloneGroup(selectedValues) };

            itemProperties.append(document.createElement('hr'));
            itemProperties.append(document.createElement('br'));
            itemProperties.append(document.createElement('span').innerText = 'Selecting multiple items');
        }
    }

    // empty out inspector
    if (toClick.length > 1) {
        itemProperties.innerHTML = '';

        itemProperties.prepend(delButton);
        delButton.onclick = () => { delGroup(toClick) };

        itemProperties.prepend(cloneButton);
        cloneButton.onclick = () => { cloneGroup(toClick) };

        itemProperties.append(document.createElement('hr'));
        itemProperties.append(document.createElement('br'));
        itemProperties.append(document.createElement('span').innerText = 'Selecting multiple items');
    } else if (toClick.length == 0) {
        itemProperties.innerHTML = `
            <h3>Inspect</h3>
            Select something on the explorer to edit its properties here
        `;
    }

    // process and add schematics to scene
    loadScene(sceneSchematics, false, toClick)

    // create input fields for each properties to the node inspector sidebar
    sceneSchematics.forEach((element, i) => {
        let button = document.createElement('option');
        button.innerHTML = `<i class="fa fa-cubes"></i> ` + element.name;
        button.value = i;

        // show node properties when selected as individual
        selectObjCall[i] = function () {
            // process and add schematics to scene with transformcontrols
            loadScene(sceneSchematics, false, [i])

            // empty out inspector
            itemProperties.innerHTML = '';

            // when delete button clicked
            delButton.onclick = function () {
                sceneSchematics.splice(i, 1);
                listSchematic()
                addObject()
            }

            // when clone button clicked
            cloneButton.onclick = function () {
                sceneSchematics.push(JSON.parse(JSON.stringify(element)))
                listSchematic([i])
                addObject()
            }

            // add line spacer
            itemProperties.prepend(document.createElement('hr'));

            Object.entries(element).forEach(async ([key, value]) => {
                // create input and label
                let input = document.createElement('input');
                let label = document.createElement('label');
                let labelname = valueLabel[key] ? valueLabel[key] : key;

                // label text, class, id and input value, id
                label.innerText = await translateOrLoadFromCache(labelname, prefLang) + ":";
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
                        listSchematic([i]);
                    }if (key == "uuid") {
                        input.value = element[key];
                        listSchematic([i]);
                    } else if (key == "opacity") {
                        element[key] = parseFloat(input.value);
                        listSchematic([i]);
                    } else if (typeof value == 'number') {
                        element[key] = parseInt(input.value);
                        listSchematic([i]);
                    } else if (input.type == 'file') {
                        const base64 = await convertBase64(event);
                        element[key] = base64;
                        listSchematic([i]);
                    } else {
                        element[key] = input.value;
                        listSchematic([i]);
                    }
                    addObject()
                };

                // add input if the data is allowed to be edited
                if (key !== "type" && key !== "mat" && key !== "initScript" && key !== "updateScript" && key !== "clickScript" && key !== "gltfData") {
                    itemProperties.appendChild(label);
                    itemProperties.appendChild(input);
                    itemProperties.appendChild(document.createElement('br'));
                }

                // color picker
                if (key == "color") {
                    input.type = "color"
                }

                // texture file uploader
                if (key == "tex") {
                    if (element[key] == false) {
                        input.type = "file";
                        input.accept = 'image/png, image/jpeg';
                    } else {
                        input.type = "button";
                        input.value = "Clear";
                        input.onclick = function () {
                            element[key] = false
                            listSchematic([i]);
                            addObject()
                        }
                    }

                }

                // initscript edit
                if (key == "initScript") {
                    initscriptbtn.style.display = 'inline-block';
                    initscriptbtn.onclick = function () {
                        let textarea = document.createElement("textarea");
                        textarea.innerHTML = element.initScript;
                        tabinitscript.appendChild(textarea);

                        let editor = CodeMirror.fromTextArea(textarea, {
                            mode: "javascript",
                            lineNumbers: true,
                            lineWrapping: true
                        });

                        editor.on('change', (args) => {
                            element['initScript'] = editor.getValue();
                            addObject()
                        });
                    }
                }

                // updatescript edit
                if (key == "updateScript") {
                    updatescriptbtn.style.display = 'inline-block';
                    updatescriptbtn.onclick = function () {
                        let textarea = document.createElement("textarea");
                        textarea.innerHTML = element.updateScript;
                        tabupdatescript.appendChild(textarea);

                        let editor = CodeMirror.fromTextArea(textarea, {
                            mode: "javascript",
                            lineNumbers: true,
                            lineWrapping: true
                        });

                        editor.on('change', (args) => {
                            element['updateScript'] = editor.getValue();
                            addObject()
                        });
                    }
                }

                // clickscript edit
                if (key == "clickScript") {
                    clickscriptbtn.style.display = 'inline-block';
                    clickscriptbtn.onclick = function () {
                        let textarea = document.createElement("textarea");
                        textarea.innerHTML = element.clickScript;
                        tabclickscript.appendChild(textarea);

                        let editor = CodeMirror.fromTextArea(textarea, {
                            mode: "javascript",
                            lineNumbers: true,
                            lineWrapping: true
                        });

                        editor.on('change', (args) => {
                            element['clickScript'] = editor.getValue();
                            addObject()
                        });
                    }
                }
            });

            // delete and clone button (+separator)
            itemProperties.prepend(delButton);
            itemProperties.prepend(cloneButton);
        };

        // auto select if selected
        if (toClick.includes(i)) {
            button.selected = true
            if (toClick.length == 1) {
                selectObjCall[i]()
            }
        }

        // add node to node list
        shapesList.appendChild(button);
    });
}

// create baseplate
addElem.cube(0, -1, 0, 32, 1, 32, '#008000')