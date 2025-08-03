function makeid(length) {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  let counter = 0;

  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }

  return result;
}

function getRandomHexColor() {
  var red = Math.floor(Math.random() * 256);
  var green = Math.floor(Math.random() * 256);
  var blue = Math.floor(Math.random() * 256);
  var redHex = red.toString(16).padStart(2, '0');
  var greenHex = green.toString(16).padStart(2, '0');
  var blueHex = blue.toString(16).padStart(2, '0');
  var hexColor = '#' + redHex + greenHex + blueHex;

  return hexColor;
}

function typeChat(e) {
  if (event.key === 'Enter') {
    const generatedMessageID = Date.now() + makeid(16)
    const theMessage = e.value

    document.getElementById("chatcontent").innerText = document.getElementById("chatcontent").innerText + '\nYou: ' + theMessage
    firebase.database().ref(`games/${id}/server/${playerUniqueID}/messages/${generatedMessageID}`).set({
      content: (firebase.auth().currentUser.displayName || "Player") + ": " + theMessage,
      age: Date.now(),
      id: generatedMessageID
    })

    e.value = ''
  }
}

var playerObject
var playerUniqueID
var firstMessageID = Date.now() + makeid(16)

async function spawnPlayer() {
  var playerRotation = 0;
  var playerSpeed = 0.1;
  var Health = 100;
  var shirt = false;
  var pants = false;
  var colors = false;

  var lastMouseX = 0;
  var lastTouchX = 0;
  var canvasHoldDown = false;

  document.getElementById("chats").style.display = 'flex'
  document.getElementById("navigation").style.display = 'block'

  renderer.domElement.addEventListener("mousedown", async (e) => { if (e.button == 2) { await renderer.domElement.requestPointerLock(); } });
  renderer.domElement.addEventListener("mouseup", (e) => { if (e.button == 2) { document.exitPointerLock(); } });
  renderer.domElement.addEventListener("contextmenu", (e) => { e.preventDefault(); });
  renderer.domElement.addEventListener("mousemove", (e) => {
    if (document.pointerLockElement === renderer.domElement) {
      const sensitivity = 0.0025;
      playerRotation += e.movementX * sensitivity;
    }
  });

  renderer.domElement.addEventListener("touchstart", (e) => { lastTouchX = e.targetTouches[0].clientX; });
  renderer.domElement.addEventListener("touchend", (e) => { lastTouchX = 0; });
  renderer.domElement.addEventListener("touchmove", (e) => {
    if (lastTouchX !== 0) {
      const deltaX = e.targetTouches[0].clientX - lastTouchX;
      const sensitivity = 0.0025;
      playerRotation += deltaX * sensitivity;
      lastTouchX = e.targetTouches[0].clientX;
    }
  });

  function checkPositionChange() {
    const cubeBodynewValue = cubeBody.position.y;
    const change = Math.abs(cubeBodynewValue - previousY);
    const smallChangeThreshold = 0.0005;

    if (change <= smallChangeThreshold) {
      previousY = cubeBodynewValue;
      return true
    } else {
      previousY = cubeBodynewValue;
      return false
    }
  }

  if (isFirebaseEnv == 'true') {
    var playerData = await firebaseFetch(`players/${playerUniqueID}`)
    if (playerData !== null) {
      if (playerData.avatar.colors != null) {
        colors = playerData.avatar.colors;
      }

      if (playerData.avatar.shirt !== false && playerData.avatar.shirt != null) {
        shirt = (await firebaseFetch(`catalog/${playerData.avatar.shirt}`)).asset;
      }

      if (playerData.avatar.pants !== false && playerData.avatar.shirt != null) {
        pants = (await firebaseFetch(`catalog/${playerData.avatar.pants}`)).asset;
      }
    }
  }

  var createPlayer = await playerModel(0x800000, { "shirt": shirt, "pants": pants, "colors": colors });
  var sceneNode = createPlayer[0];
  scene.add(sceneNode);

  var cubeShape = new CANNON.Box(new CANNON.Vec3(1 / 2, 1.7, 1 / 2));
  var cubeBody = new CANNON.Body({ mass: parseInt(1) });
  var shapeOffset = new CANNON.Vec3(0, 1.12, 0);
  var previousY = cubeBody.position.y;
  cubeBody.addShape(cubeShape, shapeOffset);
  cubeBody.position.set(0, 0, 0);
  cubeBody.threeMesh = sceneNode;
  world.addBody(cubeBody);

  var keyState = {
    w: false,
    a: false,
    s: false,
    d: false,
    space: false
  };

  document.addEventListener('keydown', async function (event) {
    switch (event.code) {
      case 'KeyW':
        keyState.w = true;
        createPlayer[1].isWalking = true;
        break;
      case 'KeyA':
        keyState.a = true;
        createPlayer[1].isWalking = true;
        break;
      case 'KeyS':
        keyState.s = true;
        createPlayer[1].isWalking = true;
        break;
      case 'KeyD':
        keyState.d = true;
        createPlayer[1].isWalking = true;
        break;
      case 'Space':
        keyState.space = true;
        break;
      case 'Escape':
        toggleSideBar();
        break;
      case 'ShiftLeft':
        if (document.pointerLockElement) {
          document.exitPointerLock();
        } else {
          await renderer.domElement.requestPointerLock();
        }
        break;
    }
  });

  document.addEventListener('keyup', function (event) {
    switch (event.code) {
      case 'KeyW':
        keyState.w = false;
        createPlayer[1].isWalking = false;
        break;
      case 'KeyA':
        keyState.a = false;
        createPlayer[1].isWalking = false;
        break;
      case 'KeyS':
        keyState.s = false;
        createPlayer[1].isWalking = false;
        break;
      case 'KeyD':
        keyState.d = false;
        createPlayer[1].isWalking = false;
        break;
      case 'Space':
        keyState.space = false;
        break;
    }
  });

  if (navigator.userAgentData.mobile) {
    document.getElementById("joyDiv").style.display = 'block'
    document.getElementById("jumpDiv").style.display = 'block'
    document.getElementById("jumpBtn").addEventListener("touchstart", () => {
      keyState.space = true
      setTimeout(() => { keyState.space = false }, 100);
    })

    new JoyStick('joyDiv', {}, function (stickData) {
      if (stickData.cardinalDirection == "N") {
        keyState.w = true;
        createPlayer[1].isWalking = true;
      } else if (stickData.cardinalDirection == "NW") {
        keyState.w = true;
        keyState.a = true;
        createPlayer[1].isWalking = true;
      } else if (stickData.cardinalDirection == "W") {
        keyState.a = true;
        createPlayer[1].isWalking = true;
      } else if (stickData.cardinalDirection == "SW") {
        keyState.a = true;
        keyState.s = true;
        createPlayer[1].isWalking = true;
      } else if (stickData.cardinalDirection == "S") {
        keyState.s = true;
        createPlayer[1].isWalking = true;
      } else if (stickData.cardinalDirection == "SE") {
        keyState.s = true;
        keyState.d = true;
        createPlayer[1].isWalking = true;
      } else if (stickData.cardinalDirection == "E") {
        keyState.d = true;
        createPlayer[1].isWalking = true;
      } else if (stickData.cardinalDirection == "NE") {
        keyState.w = true;
        keyState.d = true;
        createPlayer[1].isWalking = true;
      } else if (stickData.cardinalDirection == "C") {
        keyState.w = false;
        keyState.a = false;
        keyState.s = false;
        keyState.d = false;
        createPlayer[1].isWalking = false;
      }
    });
  }

  function playerLoop() {
    function normalizeRotation(rotation) {
      while (rotation > Math.PI) rotation -= 2 * Math.PI;
      while (rotation < -Math.PI) rotation += 2 * Math.PI;
      return rotation;
    }

    function calcMovement() {
      const deltaX = Math.sin(playerRotation);
      const deltaZ = Math.cos(playerRotation);
      return { deltaX, deltaZ };
    }

    let moveX = 0;
    let moveZ = 0;

    if (keyState.w) {
      moveX -= calcMovement().deltaX;
      moveZ -= calcMovement().deltaZ;
    }

    if (keyState.s) {
      moveX += calcMovement().deltaX;
      moveZ += calcMovement().deltaZ;
    }

    if (keyState.a) {
      moveX -= calcMovement().deltaZ;
      moveZ += calcMovement().deltaX;
    }

    if (keyState.d) {
      moveX += calcMovement().deltaZ;
      moveZ -= calcMovement().deltaX;
    }

    if (moveX !== 0 || moveZ !== 0) {
      const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
      moveX /= length;
      moveZ /= length;
      cubeBody.position.x += moveX * playerSpeed;
      cubeBody.position.z += moveZ * playerSpeed;
    }

    if (keyState.space && checkPositionChange()) {
      cubeBody.velocity.y = 7.5;
    }

    if (checkPositionChange()) {
      createPlayer[1].isJumping = false;
    } else {
      createPlayer[1].isJumping = true;
    }

    if (document.pointerLockElement) {
      document.getElementById("shiftLock").style.display = 'flex'
    } else {
      document.getElementById("shiftLock").style.display = 'none'
    }

    playerRotation = normalizeRotation(playerRotation);
    sceneNode.rotation.y = playerRotation
    cubeBody.quaternion.setFromEuler(0, playerRotation, 0);

    camera.position.setFromSphericalCoords(5, 1, playerRotation);
    camera.position.add(sceneNode.position);
    camera.lookAt(sceneNode.position);

    if (cubeBody.position.y < -30) {
      Health = 0;
    }

    if (Health <= 0) {
      setTimeout(() => {
        cubeBody.position.set(0, 0, 0);
        Health = 100;
      }, 1500);
    }

    document.getElementById("health").value = Health

    if (isFirebaseEnv == 'true') {
      const playerRef = firebase.database().ref(`games/${id}/server/${playerUniqueID}`);
      playerRef.update({
        rot: playerRotation,
        pos: cubeBody.position,
        age: Date.now(),
        isWalking: createPlayer[1].isWalking,
        isJumping: createPlayer[1].isJumping
      });
    }

    requestAnimationFrame(playerLoop);
  }

  playerLoop()

  if (isFirebaseEnv == 'true') {
    var player = {
      rot: playerRotation,
      pos: cubeBody.position,
      age: Date.now(),
      isWalking: false,
      isJumping: false,
      messages: {}
    };

    player.messages[firstMessageID] = {
      content: (firebase.auth().currentUser.displayName || "Player") + " Joined the game",
      age: Date.now(),
      id: firstMessageID
    }

    firebase.database().ref(`games/${id}/server/${playerUniqueID}`).set(player)
  }
}

var allPlayersElem = {}
var allPlayersElemData = {}
var allPlayersFetchedAvatar = {}
var allMessages = []
var spawnedPlayers = 0

function otherPlayers() {
  firebase.database().ref(`games/${id}/server/`).on('value', async function (snapshot) {
    var playerslist = snapshot.val();
    var listofplayers = await firebaseFetch(`games/${id}/server/`);
    var playeramount = Object.keys(listofplayers).length - 1;
    if (!playerslist) return;

    Object.keys(playerslist).forEach(async (key) => {
      var element = playerslist[key];
      var playerData = null;

      if (!allPlayersElemData[key]) {
        playerData = await firebaseFetch(`players/${key}`);
        allPlayersElemData[key] = playerData;
      } else {
        playerData = allPlayersElemData[key];
      }

      if (!allPlayersFetchedAvatar[key]) {
        allPlayersFetchedAvatar[key] = {
          "colors": false,
          "shirt": false,
          "pants": false,
        };
      }

      if (playerData !== null) {
        if (playerData.avatar.colors != null && !allPlayersFetchedAvatar[key]["colors"]) {
          allPlayersFetchedAvatar[key]["colors"] = playerData.avatar.colors;
        }

        if (playerData.avatar.shirt !== false && playerData.avatar.shirt != null && !allPlayersFetchedAvatar[key]["shirt"]) {
          const shirtData = await firebaseFetch(`catalog/${playerData.avatar.shirt}`);
          allPlayersFetchedAvatar[key]["shirt"] = shirtData.asset;
        }

        if (playerData.avatar.pants !== false && playerData.avatar.pants != null && !allPlayersFetchedAvatar[key]["pants"]) {
          const pantsData = await firebaseFetch(`catalog/${playerData.avatar.pants}`);
          allPlayersFetchedAvatar[key]["pants"] = pantsData.asset;
        }
      }

      const unixTimeMilliseconds = parseInt(element.age);
      const unixTimeDate = new Date(unixTimeMilliseconds);
      const currentTime = new Date();
      const timeDifference = currentTime.getTime() - unixTimeDate.getTime();
      const messages = element.messages;

      if (key != playerUniqueID) {
        if (!allPlayersElem[key] && !(timeDifference >= 10000) && (playeramount > spawnedPlayers)) {
          spawnedPlayers += 1;
          allPlayersElem[key] = await playerModel(getRandomHexColor(), { "shirt": allPlayersFetchedAvatar[key]["shirt"], "pants": allPlayersFetchedAvatar[key]["pants"], "colors": allPlayersFetchedAvatar[key]["colors"] });
          scene.add(allPlayersElem[key][0]);
        } else if (allPlayersElem[key] && (timeDifference >= 10000)) {
          scene.remove(allPlayersElem[key][0]);
          delete allPlayersElem[key];
        } else {
          if (!allPlayersElem[key]) return;
          allPlayersElem[key][0].position.x = element.pos.x;
          allPlayersElem[key][0].position.y = element.pos.y;
          allPlayersElem[key][0].position.z = element.pos.z;
          allPlayersElem[key][0].rotation.y = element.rot;
          allPlayersElem[key][1].isWalking = element.isWalking;
          allPlayersElem[key][1].isJumping = element.isJumping;
        }
      }

      if (!messages) return;

      Object.values(messages).forEach((items) => {
        const unixTimeMilliseconds = parseInt(items.age);
        const unixTimeDate = new Date(unixTimeMilliseconds);
        const currentTime = new Date();
        const timeDifference = currentTime.getTime() - unixTimeDate.getTime();

        if (timeDifference >= 10000) {
          firebase.database().ref(`games/${id}/server/${key}/messages/${items.id}`).remove();
        } else {
          if (!allMessages.includes(items.id)) {
            allMessages.push(items.id);

            if (key == playerUniqueID) return;

            debug(items.content);
            document.getElementById("chatcontent").innerText =
              document.getElementById("chatcontent").innerText + "\n" + items.content;
          }
        }
      });
    });
  });
}