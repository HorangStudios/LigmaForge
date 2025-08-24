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
  var avatarData = { colors: {} }
  var lastTouchX = 0;

  document.getElementById("chats").style.display = 'flex'
  document.getElementById("navigation").style.display = 'block'

  renderer.domElement.addEventListener("mousedown", async (e) => { if (e.button == 2) { await renderer.domElement.requestPointerLock(); } });
  renderer.domElement.addEventListener("mouseup", (e) => { if (e.button == 2) { document.exitPointerLock(); } });
  renderer.domElement.addEventListener("contextmenu", (e) => { e.preventDefault(); });
  renderer.domElement.addEventListener("mousemove", (e) => {
    if (document.pointerLockElement === renderer.domElement) {
      const sensitivity = 0.0025;
      playerRotation -= e.movementX * sensitivity;
    }
  });

  renderer.domElement.addEventListener("touchstart", (e) => { lastTouchX = e.targetTouches[0].clientX; });
  renderer.domElement.addEventListener("touchend", (e) => { lastTouchX = 0; });
  renderer.domElement.addEventListener("touchmove", (e) => {
    if (lastTouchX !== 0) {
      const deltaX = e.targetTouches[0].clientX - lastTouchX;
      const sensitivity = 0.0025;
      playerRotation -= deltaX * sensitivity;
      lastTouchX = e.targetTouches[0].clientX;
    }
  });

  function checkPositionChange() {
    const change = Math.abs(cubeBody.velocity.y);
    const smallChangeThreshold = 0.16416666666666666;

    if (change <= smallChangeThreshold) {
      return true
    } else {
      return false
    }
  }

  function checkMobile() {
    let check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
  }

  if (isFirebaseEnv == 'true') {
    var playerData = await firebaseFetch(`players/${playerUniqueID}`)
    if (playerData !== null) {
      const avatarKeys = Object.keys(playerData.avatar);
      for (let i = 0; i < avatarKeys.length; i++) {
        const avatarkey = avatarKeys[i];
        const avatarvalue = playerData.avatar[avatarkey];
        if (avatarkey == 'colors') {
          avatarData["colors"] = playerData.avatar.colors;
        } else {
          if (avatarvalue === false) {
            avatarData[avatarkey] = false;
          } else {
            avatarData[avatarkey] = (await firebaseFetch(`catalog/${avatarvalue}`)).asset;
          }
        }
      }
    }
  }

  var createPlayer = await playerModel(0x800000, avatarData);
  var sceneNode = createPlayer[0];
  scene.add(sceneNode);

  var cubeShape = threeToCannon(sceneNode).shape;
  var cubeBody = new CANNON.Body({ mass: parseInt(1) });
  var shapeOffset = new CANNON.Vec3(0, 0.75, 0);
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

  if (checkMobile()) {
    document.getElementById("chats").style.display = 'none'
    document.getElementById("joyDiv").style.display = 'block'
    document.getElementById("jumpDiv").style.display = 'block'
    document.getElementById("jumpBtn").addEventListener("touchstart", () => {
      keyState.space = true
      setTimeout(() => { keyState.space = false }, 100);
    })

    var playerJoystick = new JoyStick('joyDiv', {
      width: 150,
      height: 150,
      internalFillColor: "#00000050",
      internalStrokeColor: "#00000050",
      externalStrokeColor: "#00000050"
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

    if (checkMobile()) {
      let joystickDir = playerJoystick.GetDir()
      if (joystickDir == "N") {
        moveX -= calcMovement().deltaX;
        moveZ -= calcMovement().deltaZ;
        createPlayer[1].isWalking = true;
      } else if (joystickDir == "NW") {
        moveX -= calcMovement().deltaX;
        moveZ -= calcMovement().deltaZ;
        moveX -= calcMovement().deltaZ;
        moveZ += calcMovement().deltaX;
        createPlayer[1].isWalking = true;
      } else if (joystickDir == "W") {
        moveX -= calcMovement().deltaZ;
        moveZ += calcMovement().deltaX;
        createPlayer[1].isWalking = true;
      } else if (joystickDir == "SW") {
        moveX -= calcMovement().deltaZ;
        moveZ += calcMovement().deltaX;
        moveX += calcMovement().deltaX;
        moveZ += calcMovement().deltaZ;
        createPlayer[1].isWalking = true;
      } else if (joystickDir == "S") {
        moveX += calcMovement().deltaX;
        moveZ += calcMovement().deltaZ;
        createPlayer[1].isWalking = true;
      } else if (joystickDir == "SE") {
        moveX += calcMovement().deltaX;
        moveZ += calcMovement().deltaZ;
        moveX += calcMovement().deltaZ;
        moveZ -= calcMovement().deltaX;
        createPlayer[1].isWalking = true;
      } else if (joystickDir == "E") {
        moveX += calcMovement().deltaZ;
        moveZ -= calcMovement().deltaX;
        createPlayer[1].isWalking = true;
      } else if (joystickDir == "NE") {
        moveX += calcMovement().deltaZ;
        moveZ -= calcMovement().deltaX;
        moveX -= calcMovement().deltaX;
        moveZ -= calcMovement().deltaZ;
        createPlayer[1].isWalking = true;
      } else if (joystickDir == "C") {
        createPlayer[1].isWalking = false;
      }
    }

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
    firebase.database().ref(`games/${id}/real-time/${playerUniqueID}`).set(player)
  }
}

function otherPlayers() {
  var allPlayersElem = {}
  var allPlayersElemData = {}
  var allPlayersFetchedAvatar = {}
  var allMessages = []
  var spawnedPlayers = 0

  firebase.database().ref(`games/${id}/server/`).on('value', async function (snapshot) {
    var playerslist = snapshot.val();
    var listofplayers = await firebaseFetch(`games/${id}/real-time/`);
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
        allPlayersFetchedAvatar[key] = {};
      }

      if (playerData !== null) {
        const avatarKeys = Object.keys(playerData.avatar);
        for (let i = 0; i < avatarKeys.length; i++) {
          const avatarkey = avatarKeys[i];
          const avatarvalue = playerData.avatar[avatarkey];
          if (avatarkey == 'colors') {
            allPlayersFetchedAvatar[key]["colors"] = playerData.avatar.colors;
          } else {
            if (avatarvalue === false) {
              allPlayersFetchedAvatar[key][avatarkey] = false;
            } else {
              allPlayersFetchedAvatar[key][avatarkey] = (await firebaseFetch(`catalog/${avatarvalue}`)).asset;
            }
          }
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
          console.log(spawnedPlayers)
          allPlayersElem[key] = await playerModel(getRandomHexColor(), allPlayersFetchedAvatar[key]);
          scene.add(allPlayersElem[key][0]);
        } else if (allPlayersElem[key] && (timeDifference >= 10000)) {
          console.log(spawnedPlayers)
          scene.remove(allPlayersElem[key][0]);
          delete allPlayersElem[key];
          firebase.database().ref(`games/${id}/real-time/${key}`).remove();
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