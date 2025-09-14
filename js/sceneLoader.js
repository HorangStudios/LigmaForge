// HorangHill LigmaForge Multipurpose Engine - Parse and load scene
let gamestarteou, transformControls, selSceneNode;
let dummy = new THREE.Object3D();
let instanceBodies = {};
let instanceData = {};
let allMesh = {};
let allIndex = {};

// apply transformcontrols for individual node
function applyTC(scenenode, element, supportScaling) {
    selSceneNode = scenenode;
    outlinePass.selectedObjects = [scenenode];

    transformControls.addEventListener('change', function (event) {
        if (!transformControls.dragging) return

        element["x"] = scenenode.position.x;
        element["y"] = scenenode.position.y;
        element["z"] = scenenode.position.z;

        element["rotx"] = scenenode.rotation.x;
        element["roty"] = scenenode.rotation.y;
        element["rotz"] = scenenode.rotation.z;

        element["sizeX"] = scenenode.scale.x;
        element["sizeY"] = scenenode.scale.y;
        element["sizeZ"] = scenenode.scale.z;

        document.getElementById("x").value = scenenode.position.x;
        document.getElementById("y").value = scenenode.position.y;
        document.getElementById("z").value = scenenode.position.z;

        document.getElementById("rotx").value = scenenode.rotation.x;
        document.getElementById("roty").value = scenenode.rotation.y;
        document.getElementById("rotz").value = scenenode.rotation.z;

        if (!supportScaling) return;

        document.getElementById("sizeX").value = scenenode.scale.x;
        document.getElementById("sizeY").value = scenenode.scale.y;
        document.getElementById("sizeZ").value = scenenode.scale.z;
    });

    transformControls.attach(scenenode);
}

// apply transformcontrols for an item to be added to a multiselect group
function applyGroupTC(scenenode, sceneSchematics, selectGroup, itemIndex, supportScaling) {
    selSceneNode = selectGroup;
    scenenode.userData.nodeUUID = itemIndex;
    outlinePass.selectedObjects = selectGroup.children;

    if (!selectGroup.children.includes(scenenode)) {
        selectGroup.add(scenenode);
    }

    transformControls.addEventListener('change', function () {
        if (!transformControls.dragging) return;

        selectGroup.children.forEach((child) => {
            const idx = child.userData.nodeUUID;
            if (typeof idx === "number" && sceneSchematics[idx]) {
                let worldPos = new THREE.Vector3();
                child.getWorldPosition(worldPos);

                sceneSchematics[idx]["x"] = worldPos.x;
                sceneSchematics[idx]["y"] = worldPos.y;
                sceneSchematics[idx]["z"] = worldPos.z;

                let worldQuat = new THREE.Quaternion();
                child.getWorldQuaternion(worldQuat);
                let worldEuler = new THREE.Euler().setFromQuaternion(worldQuat);

                sceneSchematics[idx]["rotx"] = worldEuler.x;
                sceneSchematics[idx]["roty"] = worldEuler.y;
                sceneSchematics[idx]["rotz"] = worldEuler.z;

                if (supportScaling) {
                    let worldScale = new THREE.Vector3();
                    child.getWorldScale(worldScale);

                    sceneSchematics[idx]["sizeX"] = worldScale.x;
                    sceneSchematics[idx]["sizeY"] = worldScale.y;
                    sceneSchematics[idx]["sizeZ"] = worldScale.z;
                }
            }
        });
    });
    transformControls.attach(selectGroup);
}

// Set up lights and sky
function allOfTheLights() {
    // create hemisphere light
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    // create directional light
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.color.setHSL(0.1, 1, 0.95);
    dirLight.position.set(0, 1.75, -1.75);
    dirLight.position.multiplyScalar(30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.left = - 50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = - 50;
    dirLight.shadow.camera.far = 3500;
    dirLight.shadow.bias = - 0.00001;
    scene.add(dirLight);

    // create ambient light
    const light = new THREE.AmbientLight(0x404040);
    scene.add(light);

    // create sky
    const sky = new THREE.Sky();
    sky.scale.setScalar(450000);
    scene.add(sky);
    Object.assign(sky.material.uniforms, {
        turbidity: { value: 10 },
        rayleigh: { value: 3 },
        mieCoefficient: { value: 0.005 },
        mieDirectionalG: { value: 0.7 }
    });

    // create sun on sky
    const sun = new THREE.Vector3();
    sun.setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - 2), THREE.MathUtils.degToRad(180));
    sky.material.uniforms.sunPosition.value.copy(sun);
}

// apply scripts to the mesh
function applyScript(scenenode, element, i, doApplyToChild = false) {
    var scriptFunction = new Function("mesh", element.updateScript);
    scenenode.userData.scriptFunction = scriptFunction;

    var clickscriptFunction = new Function("mesh", element.clickScript);
    scenenode.userData.clickscriptfunction = clickscriptFunction;

    var initscriptFunction = new Function("mesh", element.initScript);
    scenenode.userData.initscriptFunction = initscriptFunction;

    scenenode.userData.itemIndex = i

    if (!doApplyToChild) return;

    // apply click script for 3d model
    scenenode.traverse((child) => {
        if (child.isMesh) {
            child.userData.clickscriptfunction = clickscriptFunction;
            child.userData.itemIndex = i
        }
    });
}

// add mesh to physics engine
function applyPhysics(scenenode, element) {
    const cubeShape = threeToCannon(scenenode).shape;
    const cubeBody = new CANNON.Body({ mass: parseFloat(element.mass) });

    cubeBody.addShape(cubeShape);
    cubeBody.position.set(element.x, element.y, element.z);
    cubeBody.quaternion.setFromEuler(element.rotx, element.roty, element.rotz)
    cubeBody.threeMesh = scenenode;

    world.addBody(cubeBody);
}

// add node to instance
function applyInstance(element, index, type, sceneSchematics, geometry, scenenode, isForPlayer, i) {
    // create mesh type if not yet defined
    if (typeof allMesh[type] == 'undefined' || i === 0) {
        allMesh[type] = new THREE.InstancedMesh(geometry, new THREE.MeshPhongMaterial({ color: 0xffffff }), sceneSchematics.filter(obj => obj.type === type).length);
        allMesh[type].castShadow = true;
        allMesh[type].receiveShadow = true;
    }

    // create mesh index if not yet created
    if (typeof index[type] == 'undefined' || i === 0) {
        index[type] = 0;
    }

    // create mesh bodies if not yet created
    if (typeof instanceBodies[type] == 'undefined' || i === 0) {
        instanceBodies[type] = [];
    }

    // create mesh instance data if not yet created
    if (typeof instanceData[type] == 'undefined' || i === 0) {
        instanceData[type] = [];
    }

    // create color and dummy
    let color = new THREE.Color();
    let dummy = new THREE.Object3D();

    // add node to instance
    dummy.position.set(element.x, element.y, element.z);
    dummy.rotation.set(element.rotx, element.roty, element.rotz);
    dummy.scale.set(element.sizeX, element.sizeY, element.sizeZ);
    dummy.updateMatrix();
    color.set(element.color);
    allMesh[type].setMatrixAt(index[type], dummy.matrix);
    allMesh[type].setColorAt(index[type], color);

    // create physics model if run on player
    if (isForPlayer) {
        const shape = threeToCannon(scenenode).shape;
        const body = new CANNON.Body({ mass: parseFloat(element.mass) });
        body.addShape(shape);
        body.position.set(element.x, element.y, element.z);
        body.quaternion.setFromEuler(element.rotx, element.roty, element.rotz)
        world.addBody(body);

        instanceBodies[type].push({
            body: body,
            index: index[type],
            scale: new THREE.Vector3(element.sizeX, element.sizeY, element.sizeZ)
        });

        instanceData[type].push({
            scriptFunction: element.updateScript ? new Function("mesh", "index", element.updateScript) : null,
            clickscriptFunction: element.clickScript ? new Function("mesh", "index", element.clickScript) : null,
            initscriptFunction: element.initScript ? new Function("mesh", "index", element.initScript) : null,
            initiated: false,
            color: element.color
        });
    } else {
        instanceData[type].push({
            itemIndex: i
        })
    };

    index[element.type]++
}

// apply textures
function applyTex(scenenode, textureData) {
    const texture = new THREE.TextureLoader().load(textureData, () => {
        scenenode.material.map = texture;
        scenenode.material.needsUpdate = true;
    });
};

// load scene
function loadScene(sceneSchematics, isForPlayer, select) {
    // clear scene then re-add sky and lighting
    scene.remove.apply(scene, scene.children);
    allOfTheLights();

    // editor-specific features
    if (!isForPlayer) {
        // hide transform controls & unhighlight if nothing is selected
        if (transformControls) transformControls.detach();
        if (select == false) {
            selSceneNode = false
            outlinePass.selectedObjects = [];
        }

        // create transform controls
        transformControls = new THREE.TransformControls(camera, renderer.domElement);
        transformControls.addEventListener('dragging-changed', function (event) { controls.enabled = !event.value; });
        scene.add(transformControls);

        // move tool
        document.getElementById("transformMove").onclick = () => {
            transformControls.setMode('translate')
            if (selSceneNode !== false) transformControls.attach(selSceneNode);
        };

        // rotate tool
        document.getElementById("transformRotate").onclick = () => {
            transformControls.setMode('rotate')
            if (selSceneNode !== false) transformControls.attach(selSceneNode);
        };

        // scale tool
        document.getElementById("transformScale").onclick = () => {
            transformControls.setMode('scale')
            if (selSceneNode !== false) transformControls.attach(selSceneNode);
        };

        // set snapping
        setSnapping = function (val) {
            if (val == true) {
                transformControls.setTranslationSnap(0.5)
                transformControls.setRotationSnap(0.5)
                transformControls.setScaleSnap(0.5)
            } else {
                transformControls.setTranslationSnap(0)
                transformControls.setRotationSnap(0)
                transformControls.setScaleSnap(0)
            }
        }
        setSnapping(document.getElementById("snaptogrid").checked)
    }

    // instanced meshes - initial setup
    instanceBodies = {};
    instanceData = {};
    allMesh = {};
    allIndex = {};

    // selector group - editor only
    let selectGroup = new THREE.Group();

    // create all nodes
    sceneSchematics.forEach(async (element, i) => {
        let geometry, material, scenenode;

        // check node type (default is for static meshes)
        switch (element.type) {
            case "light":
                // create light
                scenenode = new THREE.PointLight(element.color, element.intensity, element.distance);
                scenenode.position.set(element.x, element.y, element.z);
                scenenode.castShadow = true;
                scene.add(scenenode);

                // spawn node and apply transformcontrols
                if (Array.isArray(select) && select.includes(i)) {
                    if (select.length === 1) {
                        applyTC(scenenode, element, false);
                    } else {
                        applyGroupTC(scenenode, sceneSchematics, selectGroup, i, false);
                    }
                }
                break;

            case "importedGLTFModel":
                // load 3d model dataurl
                const importedGLTF = await new THREE.GLTFLoader().loadAsync(element.gltfData);
                importedGLTF.scene.traverse((child) => {
                    // enable shadows in 3d model
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                // change 3d model geometry
                scenenode = importedGLTF.scene
                scenenode.position.set(element.x, element.y, element.z);
                scenenode.rotation.set(element.rotx, element.roty, element.rotz);
                scenenode.scale.set(element.sizeX, element.sizeY, element.sizeZ);
                scene.add(scenenode);

                // spawn node and apply transformcontrols
                if (Array.isArray(select) && select.includes(i)) {
                    if (select.length === 1) {
                        applyTC(scenenode, element, true);
                    } else {
                        applyGroupTC(scenenode, sceneSchematics, selectGroup, i, true);
                    }
                }

                // add node script to object data & add mesh to physics world (if running on player)
                if (isForPlayer) applyPhysics(scenenode, element);
                applyScript(scenenode, element, i, true);
                break;

            default:
                if (element.type in elemTypes) {
                    // create geometry
                    geometry = new elemTypes[element.type].threeMesh(...elemTypes[element.type].args);
                    material = new THREE.MeshPhongMaterial({ color: element.color });
                    material.transparent = true;
                    material.opacity = element.opacity || 1;

                    // change geometry
                    scenenode = new THREE.Mesh(geometry, material);
                    scenenode.position.set(element.x, element.y, element.z);
                    scenenode.rotation.set(element.rotx, element.roty, element.rotz);
                    scenenode.scale.set(element.sizeX, element.sizeY, element.sizeZ);
                    scenenode.castShadow = true;
                    scenenode.receiveShadow = true;

                    // skip instancing and generate independent model if selected in editor or has custom texture/opacity properties
                    if (element.tex || (Array.isArray(select) && select.includes(i)) || element.opacity != 1) {
                        // apply transformcontrols and add node to scene
                        if (Array.isArray(select) && select.includes(i)) {
                            if (select.length === 1) {
                                scene.add(scenenode);
                                applyTC(scenenode, element, true);
                            } else {
                                scene.add(scenenode);
                                applyGroupTC(scenenode, sceneSchematics, selectGroup, i, true);
                            }
                        } else {
                            scene.add(scenenode);
                        }

                        // add node script to object data,  add mesh to physics world (if running on player) & apply texture if available
                        if (element.tex) applyTex(scenenode, element.tex);
                        if (isForPlayer) applyPhysics(scenenode, element);
                        applyScript(scenenode, element, i);
                    } else {
                        // add node to instance
                        applyInstance(element, allIndex, element.type, sceneSchematics, geometry, scenenode, isForPlayer, i);
                    }
                } else {
                    // log unknown/deprecated node (when the element is not in elemTypes)
                    if (typeof debug !== 'undefined') {
                        debug('Unknown or Deprecated Node: ' + element.type);
                    } else {
                        console.warn('Unknown or Deprecated Node: ' + element.type);
                    }
                }
        }

        // spawn player if done loading
        if (i === sceneSchematics.length - 1) {
            if (isForPlayer) {
                document.getElementById('gameload').style.display = "none";

                spawnPlayer();
                debug('Spawning Player...');

                gamestarteou = true
                if (isFirebaseEnv == 'true') {
                    otherPlayers();
                }
            } else {
                scene.add(selectGroup)
                if (select.length > 1) {
                    outlinePass.selectedObjects = selectGroup.children;
                }
            }
        }
    });

    // spawn all instances on screen
    Object.values(allMesh).forEach(element => { scene.add(element) });
}

// special for instanced meshes - update individual instance to its physics model
function syncPhysicsToGraphics() {
    Object.keys(instanceBodies).forEach(i => {
        const data = instanceBodies[i];
        data.forEach(({ body, index, scale }) => {
            dummy.position.copy(body.position);
            dummy.quaternion.copy(body.quaternion);
            dummy.scale.copy(scale);
            dummy.updateMatrix();
            allMesh[i].setMatrixAt(index, dummy.matrix);
        });

        allMesh[i].instanceMatrix.needsUpdate = true;
    });
}