const cubeBodies = [];
const sphereBodies = [];
const cylinderBodies = [];
const cubeInstanceData = [];
const sphereInstanceData = [];
const cylinderInstanceData = [];
const dummy = new THREE.Object3D();
let cubemesh, spheremesh, cylindermesh, gamestarteou;
let transformControls
let selSceneNode

function loadScene(sceneSchematics, isForPlayer, select) {
    scene.remove.apply(scene, scene.children);
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

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

    const light = new THREE.AmbientLight(0x404040);
    scene.add(light);

    const sky = new THREE.Sky();
    sky.scale.setScalar(450000);
    scene.add(sky);
    Object.assign(sky.material.uniforms, {
        turbidity: { value: 10 },
        rayleigh: { value: 3 },
        mieCoefficient: { value: 0.005 },
        mieDirectionalG: { value: 0.7 }
    });

    const sun = new THREE.Vector3();
    sun.setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - 2), THREE.MathUtils.degToRad(180));
    sky.material.uniforms.sunPosition.value.copy(sun);

    if (!isForPlayer) {
        if (transformControls) {
            transformControls.detach();
        }

        if (select == false) {
            selSceneNode = false
            outlinePass.selectedObjects = [];
        }

        transformControls = new THREE.TransformControls(camera, renderer.domElement);
        transformControls.setTranslationSnap(0.5)
        transformControls.setRotationSnap(0.5)
        transformControls.setScaleSnap(0.5)
        transformControls.addEventListener('dragging-changed', function (event) {
            controls.enabled = !event.value;
        });

        document.getElementById("transformMove").onclick = () => {
            document.getElementById("clicktosel").checked = false;
            transformControls.setMode('translate')

            if (selSceneNode === false) return;
            transformControls.attach(selSceneNode);
        };

        document.getElementById("transformRotate").onclick = () => {
            document.getElementById("clicktosel").checked = false;
            transformControls.setMode('rotate')

            if (selSceneNode === false) return;
            transformControls.attach(selSceneNode);
        };

        document.getElementById("transformScale").onclick = () => {
            document.getElementById("clicktosel").checked = false;
            transformControls.setMode('scale')

            if (selSceneNode === false) return;
            transformControls.attach(selSceneNode);
        };

        document.getElementById("transformSelect").onclick = () => {
            document.getElementById("clicktosel").checked = true;
            transformControls.detach()
        };

        scene.add(transformControls);
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
    }

    cubeInstanceData.length = 0;
    sphereInstanceData.length = 0;
    cylinderInstanceData.length = 0;

    let cubeIndex = 0;
    const cubegeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubematerial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    cubemesh = new THREE.InstancedMesh(cubegeometry, cubematerial, sceneSchematics.filter(obj => obj.type === "cube").length);
    cubemesh.castShadow = true;
    cubemesh.receiveShadow = true;

    let sphereIndex = 0;
    const spheregeometry = new THREE.SphereGeometry(1, 16, 12);
    const spherematerial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    spheremesh = new THREE.InstancedMesh(spheregeometry, spherematerial, sceneSchematics.filter(obj => obj.type === "spherev2").length);
    spheremesh.castShadow = true;
    spheremesh.receiveShadow = true;

    let cylinderIndex = 0;
    const cylindergeometry = new THREE.CylinderGeometry(4.5, 4.5, 7.5, 32);
    const cylindermaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    cylindermesh = new THREE.InstancedMesh(cylindergeometry, cylindermaterial, sceneSchematics.filter(obj => obj.type === "cylinderv2").length);
    cylindermesh.castShadow = true;
    cylindermesh.receiveShadow = true;

    sceneSchematics.forEach(async (element, i) => {
        let color = new THREE.Color();
        let dummy = new THREE.Object3D();
        let geometry
        let material
        let scenenode

        switch (element.type) {
            case "cube":
                geometry = new THREE.BoxGeometry(1, 1, 1);
                material = new THREE.MeshPhongMaterial({ color: element.color });
                material.transparent = true;
                material.opacity = element.opacity || 1;

                scenenode = new THREE.Mesh(geometry, material);
                scenenode.position.set(element.x, element.y, element.z);
                scenenode.rotation.set(element.rotx, element.roty, element.rotz);
                scenenode.scale.set(element.sizeX, element.sizeY, element.sizeZ);
                scenenode.castShadow = true;
                scenenode.receiveShadow = true;

                if (element.tex || select == i || element.opacity != 1) {
                    if (element.tex) {
                        const texture = new THREE.TextureLoader().load(element.tex, () => {
                            scenenode.material.map = texture;
                            scenenode.material.needsUpdate = true;
                        });
                    }

                    scene.add(scenenode);

                    if (i == select && select !== false) {
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

                            document.getElementById("sizeX").value = scenenode.scale.x;
                            document.getElementById("sizeY").value = scenenode.scale.y;
                            document.getElementById("sizeZ").value = scenenode.scale.z;
                        });

                        if (document.getElementById("clicktosel").checked == true) return;
                        transformControls.attach(scenenode);
                    }

                    var scriptFunction = new Function("mesh", element.updateScript);
                    var clickscriptFunction = new Function("mesh", element.clickScript);
                    var initscriptFunction = new Function("mesh", element.initScript);
                    scenenode.userData.scriptFunction = scriptFunction;
                    scenenode.userData.clickscriptfunction = clickscriptFunction;
                    scenenode.userData.initscriptFunction = initscriptFunction;
                    scenenode.userData.itemIndex = i

                    if (isForPlayer) {
                        const cubeShape = threeToCannon(scenenode).shape;
                        const cubeBody = new CANNON.Body({ mass: parseFloat(element.mass) });
                        cubeBody.addShape(cubeShape);
                        cubeBody.position.set(element.x, element.y, element.z);
                        cubeBody.quaternion.setFromEuler(element.rotx, element.roty, element.rotz)
                        cubeBody.threeMesh = scenenode;
                        world.addBody(cubeBody);
                    };
                } else {
                    dummy.position.set(element.x, element.y, element.z);
                    dummy.rotation.set(element.rotx, element.roty, element.rotz);
                    dummy.scale.set(element.sizeX, element.sizeY, element.sizeZ);
                    dummy.updateMatrix();
                    color.set(element.color);
                    cubemesh.setMatrixAt(cubeIndex, dummy.matrix);
                    cubemesh.setColorAt(cubeIndex, color);

                    if (isForPlayer) {
                        const cubeShape = threeToCannon(scenenode).shape;
                        const cubeBody = new CANNON.Body({ mass: parseFloat(element.mass) });
                        cubeBody.addShape(cubeShape);
                        cubeBody.position.set(element.x, element.y, element.z);
                        cubeBody.quaternion.setFromEuler(element.rotx, element.roty, element.rotz)
                        world.addBody(cubeBody);

                        cubeBodies.push({
                            body: cubeBody,
                            index: cubeIndex,
                            scale: new THREE.Vector3(element.sizeX, element.sizeY, element.sizeZ)
                        });
                        cubeInstanceData.push({
                            scriptFunction: element.updateScript ? new Function("mesh", "index", element.updateScript) : null,
                            clickscriptFunction: element.clickScript ? new Function("mesh", "index", element.clickScript) : null,
                            initscriptFunction: element.initScript ? new Function("mesh", "index", element.initScript) : null,
                            initiated: false,
                            color: element.color
                        });
                    } else {
                        cubeInstanceData.push({
                            itemIndex: i
                        })
                    };

                    cubeIndex++;
                }
                break;

            case "spherev2":
                geometry = new THREE.SphereGeometry(1, 16, 12);
                material = new THREE.MeshPhongMaterial({ color: element.color });
                material.transparent = true;
                material.opacity = element.opacity || 1;

                scenenode = new THREE.Mesh(geometry, material);
                scenenode.position.set(element.x, element.y, element.z);
                scenenode.rotation.set(element.rotx, element.roty, element.rotz);
                scenenode.scale.set(element.sizeX, element.sizeY, element.sizeZ);
                scenenode.castShadow = true;
                scenenode.receiveShadow = true;

                if (element.tex || select == i || element.opacity != 1) {
                    if (element.tex) {
                        const texture = new THREE.TextureLoader().load(element.tex, () => {
                            scenenode.material.map = texture;
                            scenenode.material.needsUpdate = true;
                        });
                    }

                    scene.add(scenenode);

                    if (i == select && select !== false) {
                        selSceneNode = scenenode;
                        outlinePass.selectedObjects = [scenenode];

                        transformControls.addEventListener('change', function () {
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

                            document.getElementById("sizeX").value = scenenode.scale.x;
                            document.getElementById("sizeY").value = scenenode.scale.y;
                            document.getElementById("sizeZ").value = scenenode.scale.z;
                        });

                        if (document.getElementById("clicktosel").checked == true) return;
                        transformControls.attach(scenenode);
                    }

                    var scriptFunction = new Function("mesh", element.updateScript);
                    var clickscriptFunction = new Function("mesh", element.clickScript);
                    var initscriptFunction = new Function("mesh", element.initScript);
                    scenenode.userData.scriptFunction = scriptFunction;
                    scenenode.userData.clickscriptfunction = clickscriptFunction;
                    scenenode.userData.initscriptFunction = initscriptFunction;
                    scenenode.userData.itemIndex = i

                    if (isForPlayer) {
                        const sphereShape = threeToCannon(scenenode).shape;
                        const sphereBody = new CANNON.Body({ mass: parseFloat(element.mass) });
                        sphereBody.addShape(sphereShape);
                        sphereBody.position.set(element.x, element.y, element.z);
                        sphereBody.quaternion.setFromEuler(element.rotx, element.roty, element.rotz)
                        sphereBody.threeMesh = scenenode;
                        world.addBody(sphereBody);
                    };
                } else {
                    dummy.position.set(element.x, element.y, element.z);
                    dummy.rotation.set(element.rotx, element.roty, element.rotz);
                    dummy.scale.set(element.sizeX, element.sizeY, element.sizeZ);
                    dummy.updateMatrix();
                    color.set(element.color);
                    spheremesh.setMatrixAt(sphereIndex, dummy.matrix);
                    spheremesh.setColorAt(sphereIndex, color);

                    if (isForPlayer) {
                        const sphereShape = threeToCannon(scenenode).shape;
                        const sphereBody = new CANNON.Body({ mass: parseFloat(element.mass) });
                        sphereBody.addShape(sphereShape);
                        sphereBody.position.set(element.x, element.y, element.z);
                        sphereBody.quaternion.setFromEuler(element.rotx, element.roty, element.rotz)
                        world.addBody(sphereBody);

                        sphereBodies.push({
                            body: sphereBody,
                            index: sphereIndex,
                            scale: new THREE.Vector3(element.sizeX, element.sizeY, element.sizeZ)
                        });
                        sphereInstanceData.push({
                            scriptFunction: element.updateScript ? new Function("mesh", "index", element.updateScript) : null,
                            clickscriptFunction: element.clickScript ? new Function("mesh", "index", element.clickScript) : null,
                            initscriptFunction: element.initScript ? new Function("mesh", "index", element.initScript) : null,
                            initiated: false,
                            color: element.color
                        });
                    } else {
                        sphereInstanceData.push({
                            itemIndex: i
                        })
                    };

                    sphereIndex++;
                }
                break;

            case "cylinderv2":
                geometry = new THREE.CylinderGeometry(4.5, 4.5, 7.5, 32);
                material = new THREE.MeshPhongMaterial({ color: element.color });
                material.transparent = true;
                material.opacity = element.opacity || 1;

                scenenode = new THREE.Mesh(geometry, material);
                scenenode.position.set(element.x, element.y, element.z);
                scenenode.rotation.set(element.rotx, element.roty, element.rotz);
                scenenode.scale.set(element.sizeX / 10, element.sizeY / 10, element.sizeZ / 10);
                scenenode.castShadow = true;
                scenenode.receiveShadow = true;

                if (element.tex || select == i || element.opacity != 1) {

                    if (element.tex) {
                        const texture = new THREE.TextureLoader().load(element.tex, () => {
                            scenenode.material.map = texture;
                            scenenode.material.needsUpdate = true;
                        });
                    }

                    scene.add(scenenode);

                    if (i == select && select !== false) {
                        selSceneNode = scenenode;
                        outlinePass.selectedObjects = [scenenode];

                        transformControls.addEventListener('change', function () {
                            if (!transformControls.dragging) return

                            element["x"] = scenenode.position.x;
                            element["y"] = scenenode.position.y;
                            element["z"] = scenenode.position.z;

                            element["rotx"] = scenenode.rotation.x;
                            element["roty"] = scenenode.rotation.y;
                            element["rotz"] = scenenode.rotation.z;

                            element["sizeX"] = scenenode.scale.x * 10;
                            element["sizeY"] = scenenode.scale.y * 10;
                            element["sizeZ"] = scenenode.scale.z * 10;

                            document.getElementById("x").value = scenenode.position.x;
                            document.getElementById("y").value = scenenode.position.y;
                            document.getElementById("z").value = scenenode.position.z;

                            document.getElementById("rotx").value = scenenode.rotation.x;
                            document.getElementById("roty").value = scenenode.rotation.y;
                            document.getElementById("rotz").value = scenenode.rotation.z;

                            document.getElementById("sizeX").value = scenenode.scale.x;
                            document.getElementById("sizeY").value = scenenode.scale.y;
                            document.getElementById("sizeZ").value = scenenode.scale.z;
                        });

                        if (document.getElementById("clicktosel").checked == true) return;
                        transformControls.attach(scenenode);
                    }

                    var scriptFunction = new Function("mesh", element.updateScript);
                    var clickscriptFunction = new Function("mesh", element.clickScript);
                    var initscriptFunction = new Function("mesh", element.initScript);
                    scenenode.userData.scriptFunction = scriptFunction;
                    scenenode.userData.clickscriptfunction = clickscriptFunction;
                    scenenode.userData.initscriptFunction = initscriptFunction;
                    scenenode.userData.itemIndex = i

                    if (isForPlayer) {
                        const cylinderShape = threeToCannon(scenenode).shape;
                        const cylinderBody = new CANNON.Body({ mass: parseFloat(element.mass) });
                        cylinderBody.addShape(cylinderShape);
                        cylinderBody.position.set(element.x, element.y, element.z);
                        cylinderBody.quaternion.setFromEuler(element.rotx, element.roty, element.rotz)
                        cylinderBody.threeMesh = scenenode;
                        world.addBody(cylinderBody);
                    };
                } else {
                    dummy.position.set(element.x, element.y, element.z);
                    dummy.rotation.set(element.rotx, element.roty, element.rotz);
                    dummy.scale.set(element.sizeX / 10, element.sizeY / 10, element.sizeZ / 10);
                    dummy.updateMatrix();
                    color.set(element.color);
                    cylindermesh.setMatrixAt(cylinderIndex, dummy.matrix);
                    cylindermesh.setColorAt(cylinderIndex, color);

                    if (isForPlayer) {
                        const cylinderShape = threeToCannon(scenenode).shape;
                        const cylinderBody = new CANNON.Body({ mass: parseFloat(element.mass) });
                        cylinderBody.addShape(cylinderShape);
                        cylinderBody.position.set(element.x, element.y, element.z);
                        cylinderBody.quaternion.setFromEuler(element.rotx, element.roty, element.rotz)
                        world.addBody(cylinderBody);

                        cylinderBodies.push({
                            body: cylinderBody,
                            index: cylinderIndex,
                            scale: new THREE.Vector3(element.sizeX / 10, element.sizeY / 10, element.sizeZ / 10)
                        });
                        cylinderInstanceData.push({
                            scriptFunction: element.updateScript ? new Function("mesh", "index", element.updateScript) : null,
                            clickscriptFunction: element.clickScript ? new Function("mesh", "index", element.clickScript) : null,
                            initscriptFunction: element.initScript ? new Function("mesh", "index", element.initScript) : null,
                            initiated: false,
                            color: element.color
                        });
                    } else {
                        cylinderInstanceData.push({
                            itemIndex: i
                        })
                    };

                    cylinderIndex++;
                }
                break;

            case "sphere":
                geometry = new THREE.SphereGeometry(element.sphereradius, element.spherewidth, element.sphereheight);
                material = new THREE.MeshPhongMaterial({ color: element.color });
                material.opacity = element.opacity || 1
                material.transparent = true

                scenenode = new THREE.Mesh(geometry, material);
                scenenode.castShadow = true;
                scenenode.receiveShadow = true;
                scenenode.position.set(element.x, element.y, element.z);
                scenenode.rotation.set(element.rotx, element.roty, element.rotz);
                scene.add(scenenode);

                if (i == select && select !== false) {
                    selSceneNode = scenenode;
                    outlinePass.selectedObjects = [scenenode];

                    transformControls.addEventListener('change', function () {
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

                        document.getElementById("sizeX").value = scenenode.scale.x;
                        document.getElementById("sizeY").value = scenenode.scale.y;
                        document.getElementById("sizeZ").value = scenenode.scale.z;
                    });

                    if (document.getElementById("clicktosel").checked == true) return;
                    transformControls.attach(scenenode);
                }

                if (isForPlayer) {
                    var sphereShape = threeToCannon(scenenode).shape;
                    var sphereBody = new CANNON.Body({ mass: element.mass });
                    sphereBody.addShape(sphereShape);
                    sphereBody.position.set(element.x, element.y, element.z);
                    sphereBody.quaternion.setFromEuler(element.rotx, element.roty, element.rotz)
                    world.addBody(sphereBody);
                    sphereBody.threeMesh = scenenode;
                }

                var scriptFunction = new Function("mesh", element.updateScript);
                var clickscriptFunction = new Function("mesh", element.clickScript);
                var initscriptFunction = new Function("mesh", element.initScript);
                scenenode.userData.scriptFunction = scriptFunction;
                scenenode.userData.clickscriptfunction = clickscriptFunction;
                scenenode.userData.initscriptFunction = initscriptFunction;
                scenenode.userData.itemIndex = i

                if (element.tex) {
                    const texture = new THREE.TextureLoader().load(element.tex);
                    scenenode.material.map = texture;
                    scenenode.material.needsUpdate = true;
                }
                break;

            case "cylinder":
                geometry = new THREE.CylinderGeometry(element.radius, element.radius, element.height, element.radialSegments);
                material = new THREE.MeshPhongMaterial({ color: element.color });
                material.opacity = element.opacity || 1
                material.transparent = true

                scenenode = new THREE.Mesh(geometry, material);
                scenenode.castShadow = true;
                scenenode.receiveShadow = true;
                scenenode.position.set(element.x, element.y, element.z);
                scenenode.rotation.set(element.rotx, element.roty, element.rotz);
                scene.add(scenenode);

                if (i == select && select !== false) {
                    selSceneNode = scenenode;
                    outlinePass.selectedObjects = [scenenode];

                    transformControls.addEventListener('change', function () {
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

                        document.getElementById("sizeX").value = scenenode.scale.x;
                        document.getElementById("sizeY").value = scenenode.scale.y;
                        document.getElementById("sizeZ").value = scenenode.scale.z;
                    });

                    if (document.getElementById("clicktosel").checked == true) return;
                    transformControls.attach(scenenode);
                }

                if (isForPlayer) {
                    var cylinderShape = threeToCannon(scenenode).shape;
                    var cylinderBody = new CANNON.Body({ mass: element.mass });
                    cylinderBody.addShape(cylinderShape);
                    cylinderBody.position.set(element.x, element.y, element.z);
                    cylinderBody.quaternion.setFromEuler(element.rotx, element.roty, element.rotz)
                    world.addBody(cylinderBody);
                    cylinderBody.threeMesh = scenenode;
                }

                var scriptFunction = new Function("mesh", element.updateScript);
                var clickscriptFunction = new Function("mesh", element.clickScript);
                var initscriptFunction = new Function("mesh", element.initScript);
                scenenode.userData.scriptFunction = scriptFunction;
                scenenode.userData.clickscriptfunction = clickscriptFunction;
                scenenode.userData.initscriptFunction = initscriptFunction;
                scenenode.userData.itemIndex = i

                if (element.tex) {
                    const texture = new THREE.TextureLoader().load(element.tex);
                    scenenode.material.map = texture;
                    scenenode.material.needsUpdate = true;
                }
                break;

            case "light":
                scenenode = new THREE.PointLight(element.color, element.intensity, element.distance);
                scenenode.position.set(element.x, element.y, element.z);
                scenenode.castShadow = true;
                scene.add(scenenode);

                if (i == select && select !== false) {
                    transformControls.attach(scenenode);
                    transformControls.addEventListener('change', function () {
                        if (!transformControls.dragging) return

                        element["x"] = scenenode.position.x;
                        element["y"] = scenenode.position.y;
                        element["z"] = scenenode.position.z;

                        element["rotx"] = scenenode.rotation.x;
                        element["roty"] = scenenode.rotation.y;
                        element["rotz"] = scenenode.rotation.z;

                        document.getElementById("x").value = scenenode.position.x;
                        document.getElementById("y").value = scenenode.position.y;
                        document.getElementById("z").value = scenenode.position.z;

                        document.getElementById("rotx").value = scenenode.rotation.x;
                        document.getElementById("roty").value = scenenode.rotation.y;
                        document.getElementById("rotz").value = scenenode.rotation.z;
                    });
                }
                break;

            case "importedGLTFModel":
                const importedGLTF = await new THREE.GLTFLoader().loadAsync(element.gltfData);
                importedGLTF.scene.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                scenenode = importedGLTF.scene
                scenenode.position.set(element.x, element.y, element.z);
                scenenode.rotation.set(element.rotx, element.roty, element.rotz);
                scenenode.scale.set(element.sizeX, element.sizeY, element.sizeZ);
                scene.add(scenenode)

                if (i == select && select !== false) {
                    selSceneNode = scenenode;
                    outlinePass.selectedObjects = [scenenode];

                    transformControls.addEventListener('change', function () {
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

                        document.getElementById("sizeX").value = scenenode.scale.x;
                        document.getElementById("sizeY").value = scenenode.scale.y;
                        document.getElementById("sizeZ").value = scenenode.scale.z;
                    });

                    if (document.getElementById("clicktosel").checked == true) return;
                    transformControls.attach(scenenode);
                }

                if (isForPlayer) {
                    var cylinderShape = threeToCannon(scenenode).shape;
                    var cylinderBody = new CANNON.Body({ mass: element.mass });
                    cylinderBody.addShape(cylinderShape);
                    cylinderBody.position.set(element.x, element.y, element.z);
                    cylinderBody.quaternion.setFromEuler(element.rotx, element.roty, element.rotz)
                    world.addBody(cylinderBody);
                    cylinderBody.threeMesh = scenenode;
                }

                var scriptFunction = new Function("mesh", element.updateScript);
                var clickscriptFunction = new Function("mesh", element.clickScript);
                var initscriptFunction = new Function("mesh", element.initScript);
                scenenode.userData.scriptFunction = scriptFunction;
                scenenode.userData.clickscriptfunction = clickscriptFunction;
                scenenode.userData.initscriptFunction = initscriptFunction;
                scenenode.userData.itemIndex = i

                scenenode.traverse((child) => {
                    if (child.isMesh) {
                        child.userData.clickscriptfunction = clickscriptFunction;
                        child.userData.itemIndex = i
                    }
                });
                break;

            default:
                console.warn('Unknown Scene Node! ' + element.type)
        }

        if (i === sceneSchematics.length - 1 && isForPlayer) {
            document.getElementById('gameload').style.display = "none";

            spawnPlayer();
            debug('Spawning Player...');

            gamestarteou = true
            if (isFirebaseEnv == 'true') {
                otherPlayers();
            }
        }
    });

    scene.add(cubemesh);
    scene.add(spheremesh);
    scene.add(cylindermesh);
}

function syncPhysicsToGraphics() {
    if (!cubemesh || !spheremesh || !cylindermesh) return;

    cubeBodies.forEach(({ body, index, scale }) => {
        dummy.position.copy(body.position);
        dummy.quaternion.copy(body.quaternion);
        dummy.scale.copy(scale);
        dummy.updateMatrix();
        cubemesh.setMatrixAt(index, dummy.matrix);
    });

    sphereBodies.forEach(({ body, index, scale }) => {
        dummy.position.copy(body.position);
        dummy.quaternion.copy(body.quaternion);
        dummy.scale.copy(scale);
        dummy.updateMatrix();
        spheremesh.setMatrixAt(index, dummy.matrix);
    });

    cylinderBodies.forEach(({ body, index, scale }) => {
        dummy.position.copy(body.position);
        dummy.quaternion.copy(body.quaternion);
        dummy.scale.copy(scale);
        dummy.updateMatrix();
        cylindermesh.setMatrixAt(index, dummy.matrix);
    });

    cubemesh.instanceMatrix.needsUpdate = true;
    spheremesh.instanceMatrix.needsUpdate = true;
    cylindermesh.instanceMatrix.needsUpdate = true;
}