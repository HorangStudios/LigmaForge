// HorangHill LigmaForge Player Engine - Generate playable character & show other players in game

// make randomized uuid
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

// make hex color
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

// send message to game server - called by chat textbox
function typeChat(e) {
  if (event.key === 'Enter') {
    const generatedMessageID = Date.now() + makeid(16)
    const theMessage = e.value

    document.getElementById("chatcontent").innerText = document.getElementById("chatcontent").innerText + '\nYou: ' + theMessage
    firebase.database().ref(`games/${id}/session/${playerUniqueID}/messages/${generatedMessageID}`).set({
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

// create playable character
async function spawnPlayer() {
  var playerRotation = 0;
  var playerRotationY = 0;
  var playerSpeed = 0.1;
  var Health = 100;
  var avatarData = { colors: {} }
  var lastTouchX = 0;
  var lastTouchY = 0;

  // show chat and title bar
  document.getElementById("chats").style.display = 'flex'
  document.getElementById("navigation").style.display = 'block'

  // mouse camera controls
  renderer.domElement.addEventListener("mousedown", async (e) => { if (e.button == 2) { await renderer.domElement.requestPointerLock(); } });
  renderer.domElement.addEventListener("mouseup", (e) => { if (e.button == 2) { document.exitPointerLock(); } });
  renderer.domElement.addEventListener("contextmenu", (e) => { e.preventDefault(); });
  renderer.domElement.addEventListener("mousemove", (e) => {
    if (document.pointerLockElement === renderer.domElement) {
      const sensitivity = 0.0025;
      playerRotation -= e.movementX * sensitivity;
      playerRotationY -= e.movementY * sensitivity;
    }
  });

  // touch camera controls
  renderer.domElement.addEventListener("touchstart", (e) => { lastTouchX = e.targetTouches[0].clientX; });
  renderer.domElement.addEventListener("touchend", (e) => { lastTouchX = 0; });
  renderer.domElement.addEventListener("touchmove", (e) => {
    if (lastTouchX !== 0) {
      const deltaX = e.targetTouches[0].clientX - lastTouchX;
      const deltaY = e.targetTouches[0].clientY - lastTouchY;
      const sensitivity = 0.0025;
      playerRotation -= deltaX * sensitivity;
      playerRotationY -= deltaY * sensitivity;
      lastTouchX = e.targetTouches[0].clientX;
      lastTouchY = e.targetTouches[0].clientY;
    }
  });

  // check if player is falling or jumping
  window.checkPositionChange = function (type) {
    const change = Math.abs(cubeBody.velocity.y);
    var smallChangeThreshold;
    if (type == "anim") {
      smallChangeThreshold = 0.25
    } else {
      smallChangeThreshold = 0.01
    }

    if (change < smallChangeThreshold) {
      return true
    } else {
      return false
    }
  }

  // check if client is run on mobile
  function checkMobile() {
    let check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
  }

  // if run in production, fetch all assets (dataurl) from player avatar
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

  // create player model with avatar data
  var createPlayer = await playerModel(0x800000, avatarData);
  var sceneNode = createPlayer[0];
  scene.add(sceneNode);

  // generate physics model for player
  var cubeShape = threeToCannon(sceneNode).shape;
  var cubeBody = new CANNON.Body({ mass: parseInt(1) });
  var shapeOffset = new CANNON.Vec3(0, 0.75, 0);
  cubeBody.addShape(cubeShape, shapeOffset);
  cubeBody.position.set(0, 0, 0);
  cubeBody.threeMesh = sceneNode;
  world.addBody(cubeBody);

  // keyboard controls data
  var keyState = {
    w: false,
    a: false,
    s: false,
    d: false,
    space: false
  };

  // keyboard controls - key held down
  document.addEventListener('keydown', async function (event) {
    const focusedElem = document.activeElement.tagName;
    const sideNav = document.getElementById("Sidenav");
    if (event.code == 'Escape' && !(focusedElem == 'INPUT' || focusedElem == 'TEXTAREA')) {
      toggleSideBar();
    } else if (!(focusedElem == 'INPUT' || focusedElem == 'TEXTAREA' || sideNav.style.display !== 'none')) {
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
        case 'F2':
          event.preventDefault();
          getSnapshot();
          break;
        case 'Slash':
          event.preventDefault();
          document.getElementById("chatInput").focus();
          break;
        case 'ShiftLeft':
          if (document.pointerLockElement) {
            document.exitPointerLock();
          } else {
            await renderer.domElement.requestPointerLock();
          }
          break;
      }
    }
  });

  // keyboard controls - key released
  document.addEventListener('keyup', function (event) {
    const focusedElem = document.activeElement.tagName;
    const sideNav = document.getElementById("Sidenav");
    if (focusedElem == 'INPUT' || focusedElem == 'TEXTAREA' || sideNav.style.display !== 'none') return;

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

  // mobile-special features
  if (checkMobile()) {
    // hide chat & jump button
    document.getElementById("chats").style.display = 'none'
    document.getElementById("joyDiv").style.display = 'block'
    document.getElementById("jumpDiv").style.display = 'block'
    document.getElementById("jumpBtn").addEventListener("touchstart", () => {
      keyState.space = true
      setTimeout(() => { keyState.space = false }, 100);
    })

    // create joystick
    var playerJoystick = new JoyStick('joyDiv', {
      width: 150,
      height: 150,
      internalFillColor: "#00000050",
      internalStrokeColor: "#00000050",
      externalStrokeColor: "#00000050"
    });
  }

  // player movement loop
  function playerLoop() {
    // calculate player movement direction
    function normalizeRotation(rotation) {
      while (rotation > Math.PI) rotation -= 2 * Math.PI;
      while (rotation < -Math.PI) rotation += 2 * Math.PI;
      return rotation;
    }

    // prevent double diagonal speed
    function calcMovement() {
      const deltaX = Math.sin(playerRotation);
      const deltaZ = Math.cos(playerRotation);
      return { deltaX, deltaZ };
    }

    // move speed sum
    let moveX = 0;
    let moveZ = 0;

    // mobile-special joystick movement
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

    // forward
    if (keyState.w) {
      moveX -= calcMovement().deltaX;
      moveZ -= calcMovement().deltaZ;
    }

    // backwards
    if (keyState.s) {
      moveX += calcMovement().deltaX;
      moveZ += calcMovement().deltaZ;
    }

    // left
    if (keyState.a) {
      moveX -= calcMovement().deltaZ;
      moveZ += calcMovement().deltaX;
    }

    // right
    if (keyState.d) {
      moveX += calcMovement().deltaZ;
      moveZ -= calcMovement().deltaX;
    }

    // jump
    if (keyState.space && checkPositionChange()) {
      cubeBody.velocity.y = 7.5;
    }

    // apply calculated angle and speed to move player
    if (moveX !== 0 || moveZ !== 0) {
      const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
      moveX /= length;
      moveZ /= length;
      cubeBody.position.x += moveX * playerSpeed;
      cubeBody.position.z += moveZ * playerSpeed;
    }

    // apply animation if player is falling/jumping
    if (checkPositionChange("anim")) {
      createPlayer[1].isJumping = false;
    } else {
      createPlayer[1].isJumping = true;
    }

    // pointer lock indicator
    if (document.pointerLockElement) {
      document.getElementById("shiftLock").style.display = 'flex'
    } else {
      document.getElementById("shiftLock").style.display = 'none'
    }

    // apply rotation to player model and physics body
    playerRotation = normalizeRotation(playerRotation);
    sceneNode.rotation.y = playerRotation
    cubeBody.quaternion.setFromEuler(0, playerRotation, 0);

    // update camera to be in new position
    camera.position.setFromSphericalCoords(5, 1, playerRotation);
    camera.position.add(sceneNode.position);
    camera.lookAt(sceneNode.position);

    // empty health if player falls to void
    if (cubeBody.position.y < -30) {
      Health = 0;
    }

    // respawn player when dead
    if (Health <= 0) {
      setTimeout(() => {
        cubeBody.position.set(0, 0, 0);
        Health = 100;
      }, 1500);
    }

    // update health bar
    document.getElementById("health").value = Health

    // send position to server if on multiplayer game
    if (isFirebaseEnv == 'true') {
      const playerRef = firebase.database().ref(`games/${id}/session/${playerUniqueID}`);
      playerRef.update({
        rot: playerRotation,
        pos: cubeBody.position,
        age: Date.now(),
        isWalking: createPlayer[1].isWalking,
        isJumping: createPlayer[1].isJumping
      });
    }

    // repeat the loop
    requestAnimationFrame(playerLoop);
  }

  playerLoop()

  // initial setup for player data on multiplayer game
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

    //firebase.database().ref(`games/${id}/server/${playerUniqueID}`).set(player)
    firebase.database().ref(`games/${id}/session/${playerUniqueID}`).set(player)
  }
}

// create and update model of other players
function otherPlayers() {
  var allPlayersElem = {}
  var allPlayersElemData = {}
  var allPlayersFetchedAvatar = {}
  var allMessages = []
  var spawnedPlayers = 0

  // fetch game server (automatically update on new data)
  firebase.database().ref(`games/${id}/session/`).on('value', async function (snapshot) {
    // get server data
    var listofplayers = snapshot.val();
    var playeramount = Object.keys(listofplayers).length - 1;

    // return if server is empty
    if (!listofplayers) return;

    // process each player
    Object.keys(listofplayers).forEach(async (key) => {
      var element = listofplayers[key];
      var playerData = null;

      // get player data
      if (!allPlayersElemData[key]) {
        playerData = await firebaseFetch(`players/${key}`);
        allPlayersElemData[key] = playerData;
      } else {
        playerData = allPlayersElemData[key];
      }

      // create empty array for avatar assets
      if (!allPlayersFetchedAvatar[key]) {
        allPlayersFetchedAvatar[key] = {};
      }

      // fetch all assets (dataurl) from player avatar
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

      // player age (since joined game)
      const unixTimeMilliseconds = parseInt(element.age);
      const unixTimeDate = new Date(unixTimeMilliseconds);
      const currentTime = new Date();
      const timeDifference = currentTime.getTime() - unixTimeDate.getTime();
      const messages = element.messages;

      // check if player is not us
      if (key != playerUniqueID) {
        if (!allPlayersElem[key] && !(timeDifference >= 10000) && (playeramount > spawnedPlayers)) {
          // create model if not yet
          spawnedPlayers += 1;
          allPlayersElem[key] = await playerModel(getRandomHexColor(), allPlayersFetchedAvatar[key]);
          scene.add(allPlayersElem[key][0]);
        } else if (allPlayersElem[key] && (timeDifference >= 10000)) {
          // remove inactive player (left, disconnected or minimized)
          spawnedPlayers -= 1;
          scene.remove(allPlayersElem[key][0]);
          delete allPlayersElem[key];
          firebase.database().ref(`games/${id}/session/${key}`).remove();
        } else {
          // update position, rotation and animations if model created and not inactive
          if (!allPlayersElem[key]) return;
          allPlayersElem[key][0].position.x = element.pos.x;
          allPlayersElem[key][0].position.y = element.pos.y;
          allPlayersElem[key][0].position.z = element.pos.z;
          allPlayersElem[key][0].rotation.y = element.rot;
          allPlayersElem[key][1].isWalking = element.isWalking;
          allPlayersElem[key][1].isJumping = element.isJumping;
        }
      }

      // return if no messages sent from player
      if (!messages) return;

      // process player messages
      Object.values(messages).forEach((items) => {
        const unixTimeMilliseconds = parseInt(items.age);
        const unixTimeDate = new Date(unixTimeMilliseconds);
        const currentTime = new Date();
        const timeDifference = currentTime.getTime() - unixTimeDate.getTime();

        // put player messages in chat if not added yet and sent less than 10s ago
        if (timeDifference < 10000) {
          if (allMessages.includes(items.id) || key == playerUniqueID) return;

          debug(items.content);
          allMessages.push(items.id);
          document.getElementById("chatcontent").innerText = document.getElementById("chatcontent").innerText + "\n" + items.content;
        }
      });
    });
  });
}