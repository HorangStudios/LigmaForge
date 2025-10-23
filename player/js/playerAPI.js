// HorangHill LigmaForge Player Engine - user-generated code sandbox & api

// node.setColor - changes color of node
function setColor(uuid, color) {
    const u = uuidIndex[uuid];
    if (u.type === "instanced") {
        u.mesh.setColorAt(u.index, new THREE.Color(color));
        u.mesh.instanceColor.needsUpdate = true;
    } else if (u.type === "normalMesh") {
        u.mesh.material.color.set(color);
    }
};

// node.setPosition - changes position of node
function setPosition(uuid, x, y, z) {
    uuidIndex[uuid].body.position.set(x, y, z);
};

// node.setSize - changes size of node (and creates a completely new cannon body)
function setSize(uuid, x, y, z) {
    const u = uuidIndex[uuid];
    if (u.type === "instanced") {
        const instanceType = elemTypes[u.meshType];
        const newMeshMould = new instanceType.threeMesh(...instanceType.args);
        const node = new THREE.Mesh(newMeshMould, new THREE.MeshPhongMaterial({ color: 0xffffff }));
        node.scale.set(x, y, z);

        const newBody = new CANNON.Body({ mass: parseFloat(u.body.mass) });
        newBody.addShape(threeToCannon(node).shape);
        newBody.position.copy(u.body.position);
        newBody.quaternion.copy(u.body.quaternion);

        world.addBody(newBody);
        world.remove(instanceBodies[u.meshType][u.index].body);

        instanceBodies[u.meshType][u.index].scale = new THREE.Vector3(x, y, z);
        instanceBodies[u.meshType][u.index].body = newBody;
    } else if (u.type === "normalMesh") {
        u.mesh.scale.set(x, y, z);
        u.mesh.userData.originalNode.scale.set(x, y, z);

        const newBody = new CANNON.Body({ mass: parseFloat(u.body.mass) });
        newBody.addShape(threeToCannon(u.mesh.userData.originalNode).shape);
        newBody.position.copy(u.body.position);
        newBody.quaternion.copy(u.body.quaternion);
        newBody.threeMesh = u.mesh;

        world.addBody(newBody);
        world.remove(u.mesh.body);
        u.mesh.body = newBody;
    }
};

// node.setRotation - changes rotation of node
function setRotation(uuid, x, y, z) {
    const radX = THREE.MathUtils.degToRad(x);
    const radY = THREE.MathUtils.degToRad(y);
    const radZ = THREE.MathUtils.degToRad(z);

    const quat = new CANNON.Quaternion();
    quat.setFromEuler(radX, radY, radZ, 'XYZ');
    uuidIndex[uuid].body.quaternion.copy(quat);
};

// node.setMass - changes mass of node
function setMass(uuid, mass) {
    uuidIndex[uuid].body.mass = parseFloat(mass);
    uuidIndex[uuid].body.updateMassProperties();
};

// game.setMenu - adds text to client esc menu
function setMenu(id, text) {
    if (document.getElementById(`leaderboardMenu-${id}`)) {
        document.getElementById(`leaderboardMenu-${id}`).innerText = text;
    } else {
        var stat = document.createElement('a');
        stat.innerText = text;
        stat.id = `leaderboardMenu-${id}`;
        document.getElementById('topsidebar').appendChild(stat);
    }
};

// game.sendLocalMessage - send a message on local chat
function sendLocalMessage(text) {
    document.getElementById("chatcontent").innerText = document.getElementById("chatcontent").innerText + "\n" + text;
};

// game.playAudio - plays an audio
function playAudio(url) {
    new Audio(url).play();
};

// game.spawnMesh - spawns a new mesh and returns its id, refer to elemTypes in addShapes.js for types
function spawnMesh(type, sizeX, sizeY, sizeZ, x, y, z, mass) {
    const meshGeo = new elemTypes[type].threeMesh(...elemTypes[type].args);
    const spawnedNode = new THREE.Mesh(meshGeo, new THREE.MeshPhongMaterial({ color: 0xffffff }));
    spawnedNode.scale.set(sizeX, sizeY, sizeZ);
    spawnedNode.position.set(x, y, z);
    scene.add(spawnedNode);

    const newShape = threeToCannon(spawnedNode).shape;
    const newBody = new CANNON.Body({ mass: parseFloat(mass) });
    newBody.addShape(newShape);
    newBody.position.set(x, y, z);
    newBody.threeMesh = spawnedNode;
    world.addBody(newBody);

    spawnedNode.userData.body = newBody;
    spawnedNode.castShadow = true;
    spawnedNode.receiveShadow = true;

    const uuid = makeUniqueId(sceneSchematics);
    uuidIndex[uuid] = {
        "type": "normalMesh",
        "mesh": spawnedNode,
        "body": newBody
    };

    return uuid;
};

// game.createListener - listens to an existing mesh by uuid for events
async function createListener(uuid, event, callback) {
    if (event === "click") {
        const promise = new Promise((resolve) => {
            const resolveFunction = () => { resolve({ _type: "callbackFunction", _callbackId: callback.id }) };
            const resolveData = { type: "clickListener", resolve: resolveFunction };

            if (uuidIndex[uuid].type === "instanced") {
                instanceData[uuidIndex[uuid].meshType][uuidIndex[uuid].index].clickscriptFunction = resolveData;
            } else {
                uuidIndex[uuid].mesh.userData.clickscriptFunction = resolveData;
            }
        });

        return await promise;
    }
};

// game.deleteMesh - deletes mesh from scene
function deleteMesh(uuid) {
    const u = uuidIndex[uuid];
    if (u.type === "instanced") {
        instanceBodies[u.meshType][u.index].scale = new THREE.Vector3(0, 0, 0);
        world.remove(u.body);
    } else if (u.type === "normalMesh") {
        scene.remove(u.mesh);
        world.remove(u.body);
    }
};

// script sandbox
function ScriptSandbox(code, body, mesh, isInstance, id = 0, bodyData = {}) {
    let iframe = document.createElement('iframe');
    iframe.style = 'position: absolute; left: -9999px;';

    // all of the apis to add to the sandbox
    const apis = {
        node: { setColor, setPosition, setSize, setRotation, setMass },
        game: { setMenu, sendLocalMessage, spawnMesh, createListener, deleteMesh, playAudio },
        mesh: {
            getUUID: () => {
                return (isInstance ? bodyData.uuid : mesh.userData.uuid);
            },
            getPosition: () => {
                return body.position;
            },
            getMass: () => {
                return body.mass;
            },
            getColor: () => {
                if (isInstance) {
                    let meshcolor = new THREE.Color();
                    mesh.getColorAt(id, meshcolor);
                    return meshcolor.getHexString();
                } else {
                    return mesh.material.color.getHexString();
                }
            },
            getSize: () => {
                return (isInstance ? bodyData.scale : mesh.scale);
            },
            getRotation: () => {
                const x = THREE.MathUtils.radToDeg(body.quaternion.x);
                const y = THREE.MathUtils.radToDeg(body.quaternion.y);
                const z = THREE.MathUtils.radToDeg(body.quaternion.z);
                return { x: x, y: y, z: z };
            }
        }
    }

    // parse apis object to be injected to iframe
    let apistring = "";
    Object.keys(apis).forEach((element, i) => {
        const selected = apis[element];
        let functions = "";

        Object.keys(selected).forEach((name, i) => {
            let newline = (i + 1 == Object.keys(selected).length) ? "" : ",\n";
            functions += `  ${name}: (...args) => api.call('${element}.${name}', ...args)${newline}`;
        });

        let newline = (i + 1 == Object.keys(apis).length) ? "" : "\n";
        apistring += `window.${element} = {\n${functions}\n};${newline}`;
    });

    // process messages between sandbox and engine
    let functionStore = new Map();
    let fnCounter = 0;
    window.addEventListener('message', async (event) => {
        if (event.source !== iframe.contentWindow) return;
        if (typeof event.data == 'undefined') return;
        const msg = event.data;

        if (msg.type === 'call') {
            const fnName = msg.fn.split(".") || msg.fn;
            if (!apis[fnName[0]][fnName[1]]) return;
            const result = await apis[fnName[0]][fnName[1]](...msg.args);

            if (typeof result === 'function') {
                const id = 'fn_' + (++fnCounter);
                functionStore.set(id, result);
                iframe.contentWindow.postMessage({ type: 'return', callId: msg.callId, result: { __isFunction: true, id } }, '*');
            } else {
                iframe.contentWindow.postMessage({ type: 'return', callId: msg.callId, result }, '*');
            }
        } else if (msg.type === 'callFunction' && functionStore.has(msg.id)) {
            const fn = functionStore.get(msg.id);
            const result = await fn(...msg.args);

            iframe.contentWindow.postMessage({ type: 'returnFunction', callId: msg.callId, result }, '*');
        } else if (msg.type === 'error') {
            console.error(msg.message)
        }
    });

    // add api and code to iframe
    const iframeScript = `
        window.api = {
            pending: new Map(),
            functionStore: new Map(),
            fnCounter: 0,
            call(fn, ...args) {
                const processedArgs = args.map(arg => {
                    if (typeof arg === 'function') {
                        const id = 'fn_' + (++api.fnCounter);
                        api.functionStore.set(id, arg);
                        return { __isFunction: true, id };
                    }
                    return arg;
                });
                const callId = Math.random().toString(36).slice(2);
                parent.postMessage({ type: 'call', fn, args: processedArgs, callId }, '*');
                return new Promise(resolve => api.pending.set(callId, resolve));
            },
            wrapValue(val) {
                if (val && val.__isFunction) {
                    const id = val.id;
                    return (...args) => {
                        const callId = Math.random().toString(36).slice(2);
                        parent.postMessage({ type: 'callFunction', id, args: args, callId }, '*');
                        return new Promise(resolve => api.pending.set(callId, resolve));
                    };
                }
                return val;
            }
        };

        window.addEventListener('message', e => {
            const msg = e.data;
            if (msg.type === 'return' || msg.type === 'returnFunction') {
                const { callId, result } = msg;
                if (result && result._type === 'callbackFunction' && typeof result._callbackId === 'string') {
                    api.functionStore.get(result._callbackId)(...(result.args || []));
                };
                if (api.pending.has(callId)) {
                    api.pending.get(callId)(api.wrapValue(result));
                    api.pending.delete(callId);
                };
            }
        });

        ${apistring}

        (async () => {
            try {
                ${code}
            } catch (err) {
                parent.postMessage({ type: 'error', message: err.message }, '*');
            }
        })();
    `;
    iframe.srcdoc = `<script>${iframeScript}<\/script>`;
    document.body.appendChild(iframe);
}