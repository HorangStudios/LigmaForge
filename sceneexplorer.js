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

    scene.remove.apply(scene, scene.children);

    // Rebuild Lights and controls
    scene.add(hemiLight);
    scene.add(dirLight);
    scene.add(light);
    scene.add(transformControls);

    transformControls.detach()

    sceneSchematics.forEach((element, i) => {
        let scenenode

        switch (element.type) {
            case "cube":
                var cubeGeometry = new THREE.BoxGeometry(element.sizeX, element.sizeY, element.sizeZ);
                var cubeMaterial = new THREE.MeshPhongMaterial({ color: element.color });

                scenenode = new THREE.Mesh(cubeGeometry, cubeMaterial);
                scenenode.castShadow = true;
                scenenode.receiveShadow = true;
                scenenode.position.set(element.x, element.y, element.z);
                scenenode.rotation.set(element.rotx, element.roty, element.rotz);
                scene.add(scenenode);

                if (element.tex) {
                    const texture = new THREE.TextureLoader().load(element.tex, () => {
                        // Once the texture is loaded, replace the sphere's material map with the new texture
                        scenenode.material.map = texture;
                        scenenode.material.needsUpdate = true;
                    });
                }

                break;
            case "sphere":
                var sphereGeometry = new THREE.SphereGeometry(element.sphereradius, element.spherewidth, element.sphereheight);
                var sphereMaterial = new THREE.MeshPhongMaterial({ color: element.color });

                scenenode = new THREE.Mesh(sphereGeometry, sphereMaterial);
                scenenode.castShadow = true;
                scenenode.receiveShadow = true;
                scenenode.position.set(element.x, element.y, element.z);
                scenenode.rotation.set(element.rotx, element.roty, element.rotz);
                scene.add(scenenode);

                if (element.tex) {
                    const texture = new THREE.TextureLoader().load(element.tex, () => {
                        // Once the texture is loaded, replace the sphere's material map with the new texture
                        scenenode.material.map = texture;
                        scenenode.material.needsUpdate = true;
                    });
                }

                break;
            case "cylinder":
                var geometry = new THREE.CylinderGeometry(element.radius, element.radius, element.height, element.radialSegments);
                var material = new THREE.MeshPhongMaterial({ color: element.color });

                scenenode = new THREE.Mesh(geometry, material);
                scenenode.castShadow = true;
                scenenode.receiveShadow = true;
                scenenode.position.set(element.x, element.y, element.z);
                scenenode.rotation.set(element.rotx, element.roty, element.rotz);
                scene.add(scenenode);

                if (element.tex) {
                    const texture = new THREE.TextureLoader().load(element.tex, () => {
                        // Once the texture is loaded, replace the sphere's material map with the new texture
                        scenenode.material.map = texture;
                        scenenode.material.needsUpdate = true;
                    });
                }

                break;
            case "light":
                scenenode = new THREE.PointLight(element.color, element.intensity, element.distance);

                scenenode.position.set(element.x, element.y, element.z);
                scenenode.castShadow = true;
                scene.add(scenenode);
                break;
            default:
                console.warn('Unknown Scene Node! ' + element.type)
        }

        let button = document.createElement('button');
        button.className = 'sceneNodeIcon';
        button.innerHTML = `<i class="fa fa-cubes"></i> ` + element.name;

        button.onclick = function () {
            shapesList.innerHTML = '';

            transformControls.attach(scenenode);
            transformControls.addEventListener('change', function () {
                element["x"] = scenenode.position.x;
                element["y"] = scenenode.position.y;
                element["z"] = scenenode.position.z;

                element["rotx"] = scenenode.rotation.x;
                element["roty"] = scenenode.rotation.y;
                element["rotz"] = scenenode.rotation.z;
            });

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
                listSchematic()
            }

            delButton.onclick = function () {
                delete sceneSchematics[i];
                listSchematic()
            }

            cloneButton.onclick = function () {
                sceneSchematics.push(element)
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

                label.className = "nodeSceneLabel";

                input.onchange = async function (event) {
                    if (key == "color") {
                        element[key] = input.value;
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