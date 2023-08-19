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
            let hr = document.createElement('hr');
            backButton.innerHTML = `<i class="fa-solid fa-circle-left"></i> Back`
            backButton.className = "sceneNodeIcon";

            let delButton = document.createElement('button');
            delButton.innerHTML = `<i class="fa-solid fa-trash"></i> Delete`
            delButton.className = "sceneNodeIcon";

            backButton.onclick = function () {
                listSchematic()
            }

            delButton.onclick = function () {
                delete sceneSchematics[i];
                listSchematic()
            }

            shapesList.appendChild(delButton);
            shapesList.appendChild(backButton);
            shapesList.appendChild(hr);

            Object.entries(element).forEach(([key, value]) => {
                let input = document.createElement('input');
                let label = document.createElement('label');

                label.innerText = key + ":";
                input.value = value;

                if (typeof value == 'number') {
                    input.type = "number"
                }

                label.className = "nodeSceneLabel";

                input.onchange = function () {
                    if (typeof value == 'number') {
                        element[key] = parseInt(input.value);
                    } else {
                        element[key] = input.value;
                    }
                    listSchematic();
                };

                if (key !== "type" && key !== "mat" && key !== "tex" && key !== "initScript" && key !== "updateScript" && key !== "clickScript") {
                    shapesList.appendChild(label);
                    shapesList.appendChild(input);
                }

                if (key == "color") {
                    input.type = "color"
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