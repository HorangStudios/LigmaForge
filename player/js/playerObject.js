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
      content: theMessage,
      age: Date.now(),
      id: generatedMessageID
    })

    e.value = ''
  }
}

var playerObject
const playerUniqueID = makeid(256)
const firstMessageID = Date.now() + makeid(16)

function spawnPlayer() {
  var playerRotation = 0;
  var cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  var cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x800000 });
  var Health = 100;

  document.addEventListener('keydown', function (event) {
    if (event.keyCode == 27) {
      toggleSideBar()
    }
  });

  leftLeg = new THREE.Mesh(new THREE.BoxGeometry(.45, 1.2, .5), new THREE.MeshPhongMaterial({ color: 0x7d7d7d }))
  leftLeg.position.set(-.27, .25, 0)
  rightLeg = new THREE.Mesh(new THREE.BoxGeometry(.45, 1.2, .5), new THREE.MeshPhongMaterial({ color: 0x7d7d7d }))
  rightLeg.position.set(.27, .25, 0)
  leftArm = new THREE.Mesh(new THREE.BoxGeometry(.45, 1.25, .5), new THREE.MeshPhongMaterial({ color: 0xffffff }))
  leftArm.position.set(-.75, 1.5, 0)
  rightArm = new THREE.Mesh(new THREE.BoxGeometry(.45, 1.25, .5), new THREE.MeshPhongMaterial({ color: 0xffffff }))
  rightArm.position.set(.75, 1.5, 0)
  torso = new THREE.Mesh(new THREE.BoxGeometry(1, 1.25, .5), cubeMaterial)
  torso.position.set(0, 1.5, 0)
  head = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .5), new THREE.MeshPhongMaterial({ color: 0xffffff }))
  head.position.set(0, 2.4, 0)
  sceneNode = new THREE.Group()
  sceneNode.add(leftLeg)
  sceneNode.add(torso)
  sceneNode.add(rightLeg)
  sceneNode.add(leftArm)
  sceneNode.add(rightArm)
  sceneNode.add(head)
  sceneNode.castShadow = true;
  sceneNode.receiveShadow = true;
  sceneNode.position.set(0, 0, 0);
  scene.add(sceneNode);

  var cubeShape = new CANNON.Box(new CANNON.Vec3(1 / 2, 1.7, 1 / 2));
  var cubeBody = new CANNON.Body({ mass: parseInt(1) });
  var shapeOffset = new CANNON.Vec3(0, 1, 0);
  var previousY = cubeBody.position.y;
  cubeBody.addShape(cubeShape, shapeOffset);
  cubeBody.position.set(0, 0, 0);
  cubeBody.threeMesh = sceneNode;
  world.addBody(cubeBody)

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
        break;
      case 'KeyA':
        keyState.a = true;
        break;
      case 'KeyS':
        keyState.s = true;
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
        break;
      case 'KeyA':
        keyState.a = false;
        break;
      case 'KeyS':
        keyState.s = false;
        break;
      case 'KeyD':
        keyState.d = false;
        break;
      case 'Space':
        keyState.space = false;
        break;
    }
  });

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
      const smallChangeThreshold = 0.0001;

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
    if (keyState.space) {
      if (checkPositionChange()) {
        cubeBody.velocity.y = 7.5;
      }
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

    if (isFirebaseEnv) {
      const playerRef = firebase.database().ref(`games/${id}/server/${playerUniqueID}`);
      playerRef.update({
        rot: playerRotation,
        pos: cubeBody.position,
        age: Date.now(),
      });
    }

    requestAnimationFrame(playerLoop);
  }

  playerLoop()

  if (isFirebaseEnv) {
    var player = {
      rot: playerRotation,
      id: playerUniqueID,
      age: Date.now(),
      pos: cubeBody.position,
      messages: {}
    };

    player.messages[firstMessageID] = {
      content: "Joined the game",
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

    Object.values(playerslist).forEach(element => {
      const unixTimeMilliseconds = parseInt(element.age);
      const unixTimeDate = new Date(unixTimeMilliseconds);
      const currentTime = new Date();
      const timeDifference = currentTime.getTime() - unixTimeDate.getTime();
      const messages = element.messages

      if (element.id != playerUniqueID) {
        if (!allPlayersElem[element.id]) {
          var cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
          var cubeMaterial = new THREE.MeshPhongMaterial({ color: getRandomHexColor() });
          allPlayersElem[element.id] = new THREE.Group()
          leftLeg = new THREE.Mesh(new THREE.BoxGeometry(.45, 1.2, .5), new THREE.MeshPhongMaterial({ color: 0x7d7d7d }))
          leftLeg.position.set(-.27, .25, 0)
          rightLeg = new THREE.Mesh(new THREE.BoxGeometry(.45, 1.2, .5), new THREE.MeshPhongMaterial({ color: 0x7d7d7d }))
          rightLeg.position.set(.27, .25, 0)
          leftArm = new THREE.Mesh(new THREE.BoxGeometry(.45, 1.25, .5), new THREE.MeshPhongMaterial({ color: 0xffffff }))
          leftArm.position.set(-.75, 1.5, 0)
          rightArm = new THREE.Mesh(new THREE.BoxGeometry(.45, 1.25, .5), new THREE.MeshPhongMaterial({ color: 0xffffff }))
          rightArm.position.set(.75, 1.5, 0)
          torso = new THREE.Mesh(new THREE.BoxGeometry(1, 1.25, .5), cubeMaterial)
          torso.position.set(0, 1.5, 0)
          head = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .5), new THREE.MeshPhongMaterial({ color: 0xffffff }))
          head.position.set(0, 2.4, 0)
          allPlayersElem[element.id].add(leftLeg)
          allPlayersElem[element.id].add(torso)
          allPlayersElem[element.id].add(rightLeg)
          allPlayersElem[element.id].add(leftArm)
          allPlayersElem[element.id].add(rightArm)
          allPlayersElem[element.id].add(head)
          scene.add(allPlayersElem[element.id])
        } else {
          try {
            allPlayersElem[element.id].position.x = element.pos.x
            allPlayersElem[element.id].position.y = element.pos.y
            allPlayersElem[element.id].position.z = element.pos.z
            allPlayersElem[element.id].rotation.y = element.rot
          } catch (error) { }
        }
      }

      if (timeDifference >= 10000) {
        firebase.database().ref(`games/${id}/server/${element.id}`).remove()
        if (allPlayersElem[element.id]) {
          scene.remove(allPlayersElem[element.id])
        }
      }

      if (!messages) return;
      Object.values(messages).forEach((items, index) => {
        const unixTimeMilliseconds = parseInt(items.age);
        const unixTimeDate = new Date(unixTimeMilliseconds);
        const currentTime = new Date();
        const timeDifference = currentTime.getTime() - unixTimeDate.getTime();
        if (timeDifference >= 10000) {
          firebase.database().ref(`games/${id}/server/${element.id}/messages/${items.id}`).remove()
        } else {
          if (!allMessages.includes(items.id)) {
            allMessages.push(items.id)
            if (element.id == playerUniqueID) return;
            debug(items.content)
            document.getElementById("chatcontent").innerText = document.getElementById("chatcontent").innerText + `\n${playerUniqueID.slice(0,5)}: ` + items.content
          }
        }
      })
    });
  })
}
