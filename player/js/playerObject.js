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

function playerModel(color) {
  var group = new THREE.Group()
  var data = []
  var step = 0
  var walkingAnimation = false

  group.castShadow = true;
  group.receiveShadow = true;
  group.position.set(0, 0, 0);
  data.isJumping = false
  data.isWalking = false

  leftLeg = new THREE.Mesh(new THREE.BoxGeometry(.5, 1, .5), new THREE.MeshPhongMaterial({ color: 0X808080 }));
  leftLeg.position.set(-.25, 0, 0);
  leftLeg.castShadow = true;
  leftLeg.receiveShadow = true;
  const leftLegPivot = new THREE.Object3D();
  leftLegPivot.position.set(0, 0, 0);
  leftLegPivot.add(leftLeg);
  group.add(leftLegPivot);

  rightLeg = new THREE.Mesh(new THREE.BoxGeometry(.5, 1, .5), new THREE.MeshPhongMaterial({ color: 0X808080 }))
  rightLeg.position.set(.25, 0, 0)
  rightLeg.castShadow = true;
  rightLeg.receiveShadow = true;
  const rightLegPivot = new THREE.Object3D();
  rightLegPivot.position.set(0, 0, 0);
  rightLegPivot.add(rightLeg);
  group.add(rightLegPivot)

  leftArm = new THREE.Mesh(new THREE.BoxGeometry(.5, 1, .5), new THREE.MeshPhongMaterial({ color: 0xffffff }))
  leftArm.position.set(-.75, -0.25, 0)
  leftArm.castShadow = true;
  leftArm.receiveShadow = true;
  const leftArmPivot = new THREE.Object3D();
  leftArmPivot.position.set(0, 1.25, 0);
  leftArmPivot.add(leftArm);
  group.add(leftArmPivot);

  rightArm = new THREE.Mesh(new THREE.BoxGeometry(.5, 1, .5), new THREE.MeshPhongMaterial({ color: 0xffffff }))
  rightArm.position.set(.75, -0.25, 0)
  rightArm.castShadow = true;
  rightArm.receiveShadow = true;
  const rightArmPivot = new THREE.Object3D();
  rightArmPivot.position.set(0, 1.25, 0);
  rightArmPivot.add(rightArm);
  group.add(rightArmPivot);

  torso = new THREE.Mesh(new THREE.BoxGeometry(1, 1, .5), new THREE.MeshPhongMaterial({ color: color }))
  torso.position.set(0, 1, 0)
  torso.castShadow = true;
  torso.receiveShadow = true;
  group.add(torso)

  head = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .5), new THREE.MeshPhongMaterial({ color: 0xffffff }))
  head.position.set(0, 1.75, 0)
  head.castShadow = true;
  head.receiveShadow = true;
  group.add(head)

  function animLoop() {
    const duration = 450;
    const startStep = step;
    const endStep = step === 0 ? 1 : 0;
    const startTime = performance.now();

    const phases = [
      {
        leftLeg: { pos: [0, 0, .25], rot: -(Math.PI / 4) },
        rightLeg: { pos: [0, 0, -.25], rot: (Math.PI / 4) },
        leftArm: { pos: [0, 0, 0], rot: (Math.PI / 4) },
        rightArm: { pos: [0, 0, 0], rot: -(Math.PI / 4) },
      },
      {
        leftLeg: { pos: [0, 0, -.25], rot: (Math.PI / 4) },
        rightLeg: { pos: [0, 0, .25], rot: -(Math.PI / 4) },
        leftArm: { pos: [0, 0, 0], rot: -(Math.PI / 4) },
        rightArm: { pos: [0, 0, 0], rot: (Math.PI / 4) },
      }
    ];

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    function animateTween() {
      const now = performance.now();
      const t = Math.min((now - startTime) / duration, 1);

      leftLegPivot.position.set(
        lerp(phases[startStep].leftLeg.pos[0], phases[endStep].leftLeg.pos[0], t),
        lerp(phases[startStep].leftLeg.pos[1], phases[endStep].leftLeg.pos[1], t),
        lerp(phases[startStep].leftLeg.pos[2], phases[endStep].leftLeg.pos[2], t)
      );
      leftLegPivot.rotation.x = lerp(phases[startStep].leftLeg.rot, phases[endStep].leftLeg.rot, t);

      rightLegPivot.position.set(
        lerp(phases[startStep].rightLeg.pos[0], phases[endStep].rightLeg.pos[0], t),
        lerp(phases[startStep].rightLeg.pos[1], phases[endStep].rightLeg.pos[1], t),
        lerp(phases[startStep].rightLeg.pos[2], phases[endStep].rightLeg.pos[2], t)
      );
      rightLegPivot.rotation.x = lerp(phases[startStep].rightLeg.rot, phases[endStep].rightLeg.rot, t);
      
      leftArmPivot.rotation.x = lerp(phases[startStep].leftArm.rot, phases[endStep].leftArm.rot, t);
      rightArmPivot.rotation.x = lerp(phases[startStep].rightArm.rot, phases[endStep].rightArm.rot, t);
      
      if (t < 1) {
        requestAnimationFrame(animateTween);
      } else {
        step = endStep;
      }
    }

    animateTween();
  }

  setInterval(() => {
    if (data.isJumping) {
      leftArmPivot.rotation.x = (Math.PI);
      rightArmPivot.rotation.x = (Math.PI);
    } else {
      if (!data.isWalking) {
        leftArmPivot.rotation.x = 0;
        rightArmPivot.rotation.x = 0;
      }
    }

    if (data.isWalking) {
      if (walkingAnimation == false) {
        animLoop()
        walkingAnimation = setInterval(animLoop, 500);
      }
    } else {
      clearInterval(walkingAnimation);
      walkingAnimation = false;

      leftLegPivot.position.set(0, 0, 0);
      leftLegPivot.rotation.x = 0;

      rightLegPivot.position.set(0, 0, 0);
      rightLegPivot.rotation.x = 0;
    }
  }, 1);

  return [group, data]
}

var playerObject
const playerUniqueID = makeid(256)
const firstMessageID = Date.now() + makeid(16)

function spawnPlayer() {
  var playerRotation = 0;
  var Health = 100;

  document.addEventListener('keydown', function (event) {
    if (event.keyCode == 27) {
      toggleSideBar()
    }
  });

  var createPlayer = playerModel(0x800000)
  var sceneNode = createPlayer[0]
  scene.add(sceneNode);

  var cubeShape = new CANNON.Box(new CANNON.Vec3(1 / 2, 1.7, 1 / 2));
  var cubeBody = new CANNON.Body({ mass: parseInt(1) });
  var shapeOffset = new CANNON.Vec3(0, 1.12, 0);
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

    if (isFirebaseEnv) {
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

  if (isFirebaseEnv) {
    var player = {
      rot: playerRotation,
      id: playerUniqueID,
      age: Date.now(),
      pos: cubeBody.position,
      isWalking: false,
      isJumping: false,
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
          const createPlayer = playerModel(getRandomHexColor());
          allPlayersElem[element.id] = createPlayer;
          scene.add(createPlayer[0]);
        } else {
          try {
            allPlayersElem[element.id][0].position.x = element.pos.x
            allPlayersElem[element.id][0].position.y = element.pos.y
            allPlayersElem[element.id][0].position.z = element.pos.z
            allPlayersElem[element.id][0].rotation.y = element.rot
            allPlayersElem[element.id][1].isWalking = element.isWalking
            allPlayersElem[element.id][1].isJumping = element.isJumping
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
            document.getElementById("chatcontent").innerText = document.getElementById("chatcontent").innerText + `\n${playerUniqueID.slice(0, 5)}: ` + items.content
          }
        }
      })
    });
  })
}
