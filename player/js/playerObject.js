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
  var Health = 100;
  var shirt = false;
  var pants = false;
  var colors = false;

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

  document.addEventListener('keydown', function (event) {
    if (event.keyCode == 27) {
      toggleSideBar();
    }
  });

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

  document.addEventListener('keydown', function (event) {
    switch (event.code) {
      case 'KeyW':
        keyState.w = true;
        createPlayer[1].isWalking = true;
        break;
      case 'KeyA':
        keyState.a = true;
        break;
      case 'KeyS':
        keyState.s = true;
        createPlayer[1].isWalking = true;
        break;
      case 'KeyD':
        keyState.d = true;
        break;
      case 'Space':
        keyState.space = true;
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
        break;
      case 'KeyS':
        keyState.s = false;
        createPlayer[1].isWalking = false;
        break;
      case 'KeyD':
        keyState.d = false;
        break;
      case 'Space':
        keyState.space = false;
        break;
    }
  });

  if (navigator.userAgentData.mobile) {
    var Joy1 = new JoyStick('joyDiv', {}, function (stickData) {
      if (stickData.cardinalDirection == "N") {
        keyState.w = true;
        createPlayer[1].isWalking = true;
      } else if (stickData.cardinalDirection == "C") {
        keyState.w = false;
        keyState.a = false;
        keyState.s = false;
        keyState.d = false;
        keyState.space = false;
        createPlayer[1].isWalking = false;
      } else if (stickData.cardinalDirection == "NW") {
        keyState.w = true;
        keyState.a = true;
        createPlayer[1].isWalking = true;
      } else if (stickData.cardinalDirection == "W") {
        keyState.a = true;
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
      }
      else if (stickData.cardinalDirection == "NE") {
        keyState.d = true;
      }
    });
  }

  var cameraAngle = 0;
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

    if (keyState.w) {
      cubeBody.position.x -= calcMovement().deltaX / 10;
      cubeBody.position.z -= calcMovement().deltaZ / 10;
    }
    if (keyState.s) {
      cubeBody.position.x += calcMovement().deltaX / 10;
      cubeBody.position.z += calcMovement().deltaZ / 10;
    }
    if (keyState.a) {
      playerRotation += 0.02;
    }
    if (keyState.d) {
      playerRotation -= 0.02;
    }
    if (keyState.space && checkPositionChange()) {
      cubeBody.velocity.y = 7.5;
    }

    if (checkPositionChange()) {
      createPlayer[1].isJumping = false;
    } else {
      createPlayer[1].isJumping = true;
    }

    function lerpAngle(a, b, t) {
      let difference = b - a;
      difference = ((difference + Math.PI) % (2 * Math.PI)) - Math.PI;
      return a + difference * t;
    }

    playerRotation = normalizeRotation(playerRotation);
    sceneNode.rotation.y = playerRotation
    cubeBody.quaternion.setFromEuler(0, playerRotation, 0);

    cameraAngle = lerpAngle(cameraAngle, playerRotation, 0.1);
    camera.position.setFromSphericalCoords(5, 1, cameraAngle);
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
var allMessages = []
function otherPlayers() {
  firebase.database().ref(`games/${id}/server/`).on('value', function (snapshot) {
    var playerslist = snapshot.val()
    if (!playerslist) return;

    Object.keys(playerslist).forEach(async (key) => {
      var element = playerslist[key]
      var playerData = await firebaseFetch(`players/${key}`)
      var shirt = false;
      var pants = false;
      var colors = false;

      if (playerData !== null) {
        if (playerData.avatar.colors != null) {
          colors = playerData.avatar.colors;
        }

        if (playerData.avatar.shirt !== false && playerData.avatar.shirt != null) {
          var shirt = (await firebaseFetch(`catalog/${playerData.avatar.shirt}`)).asset
        }

        if (playerData.avatar.pants !== false && playerData.avatar.pants != null) {
          var pants = (await firebaseFetch(`catalog/${playerData.avatar.pants}`)).asset
        }
      }

      const unixTimeMilliseconds = parseInt(element.age);
      const unixTimeDate = new Date(unixTimeMilliseconds);
      const currentTime = new Date();
      const timeDifference = currentTime.getTime() - unixTimeDate.getTime();
      const messages = element.messages

      if (key != playerUniqueID) {
        if (!allPlayersElem[key]) {
          const createPlayer = await playerModel(getRandomHexColor(), { "shirt": shirt, "pants": pants, "colors": colors });
          allPlayersElem[key] = createPlayer;
          scene.add(createPlayer[0]);
        } else {
          try {
            allPlayersElem[key][0].position.x = element.pos.x
            allPlayersElem[key][0].position.y = element.pos.y
            allPlayersElem[key][0].position.z = element.pos.z
            allPlayersElem[key][0].rotation.y = element.rot
            allPlayersElem[key][1].isWalking = element.isWalking
            allPlayersElem[key][1].isJumping = element.isJumping
          } catch (error) { }
        }
      }

      if (timeDifference >= 10000) {
        firebase.database().ref(`games/${id}/server/${key}`).remove()
        if (allPlayersElem[key]) {
          scene.remove(allPlayersElem[key][0])
        }
      }

      if (!messages) return;
      Object.values(messages).forEach((items, index) => {
        const unixTimeMilliseconds = parseInt(items.age);
        const unixTimeDate = new Date(unixTimeMilliseconds);
        const currentTime = new Date();
        const timeDifference = currentTime.getTime() - unixTimeDate.getTime();
        if (timeDifference >= 10000) {
          firebase.database().ref(`games/${id}/server/${key}/messages/${items.id}`).remove()
        } else {
          if (!allMessages.includes(items.id)) {
            allMessages.push(items.id)
            if (key == playerUniqueID) return;
            debug(items.content)
            document.getElementById("chatcontent").innerText = document.getElementById("chatcontent").innerText + "\n" + items.content
          }
        }
      })
    });
  })
}
