function makeid(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
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

var playerObject
const playerUniqueID = makeid(256)

function spawnPlayer() {
  var playerRotation = 0;
  var cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  var cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x800000 });
  var Health = 100;
  var buttonh = document.createElement('a')
  buttonh.innerText = "Health: " + Health;
  document.getElementById('topsidebar').appendChild(buttonh)
  document.addEventListener('keydown', function (event) {
    if (event.keyCode == 27) {
      toggleSideBar()
    }
  });

  sceneNode = new THREE.Mesh(cubeGeometry, cubeMaterial);
  sceneNode.castShadow = true;
  sceneNode.receiveShadow = true;
  sceneNode.position.set(0, 1, 0);
  scene.add(sceneNode);

  // Create the corresponding Cannon.js body
  var cubeShape = new CANNON.Box(new CANNON.Vec3(1 / 2, 1 / 2, 1 / 2));
  var cubeBody = new CANNON.Body({ mass: parseInt(1) });
  cubeBody.addShape(cubeShape);
  cubeBody.position.set(0, 0, 0);
  world.addBody(cubeBody)

  // Associate the Three.js mesh with the Cannon.js body
  cubeBody.threeMesh = sceneNode;

  var keyState = {
    w: false,
    a: false,
    s: false,
    d: false,
    space: false
  };

  // Event listeners for keydown and keyup events
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

  var targetPosition = new THREE.Vector3();
  var cameraPosition = new THREE.Vector3();
  var cameraAngle = 0;

  function playerLoop() {
    if (playerRotation > 1) {
      playerRotation = 1
    } else if (playerRotation < -1) {
      playerRotation = -1
    }

    function calcRot() {
      var angleRadians = 2 * Math.atan2(playerRotation, cubeBody.quaternion.w);
      var angleDegrees = angleRadians * (180 / Math.PI);

      const angleInRadians = angleDegrees * (Math.PI / 180);

      const deltaX = 1 * Math.cos(angleInRadians);
      const deltaZ = 1 * Math.sin(angleInRadians);

      const newX = deltaX;
      const newZ = deltaZ;

      return { newZ, newX };
    }

    var angleRadians = 2 * Math.atan2(playerRotation, cubeBody.quaternion.w);
    var angleDegrees = angleRadians * (180 / Math.PI);
    const angleInRadians = angleDegrees * (Math.PI / 180);

    cameraAngle = THREE.MathUtils.lerp(cameraAngle, angleInRadians, 1);
    camera.position.setFromSphericalCoords(5, 1, cameraAngle);
    camera.position.add(sceneNode.position);
    camera.lookAt(sceneNode.position);

    cubeBody.quaternion.x = 0
    cubeBody.quaternion.y = playerRotation
    cubeBody.quaternion.z = 0

    if (cubeBody.position.y < -30) {
      Health = 0;
    }
    if (Health < 0.1) {
      cubeBody.position.set(0, 0, 0);
      Health = 100;
    }
    buttonh.innerText = "Health: " + Health;

    if (keyState.w) {
      cubeBody.position.z -= calcRot().newX / 10
      cubeBody.position.x -= calcRot().newZ / 10
    }
    if (keyState.s) {
      cubeBody.position.z += calcRot().newX / 10
      cubeBody.position.x += calcRot().newZ / 10
    }
    if (keyState.a) {
      playerRotation += 0.01
    }
    if (keyState.d) {
      playerRotation -= 0.01
    }
    if (keyState.space) {
      if (Math.abs(cubeBody.velocity.y) < 0.1) {
        cubeBody.velocity.y = 7.5;
      }
    }

    if (playerRotation > 1) {
      playerRotation = 1;
    } else if (playerRotation < -1) {
      playerRotation = -1;
    }    

    if (isFirebaseEnv) {
      firebase.database().ref(`games/${id}/server/${playerUniqueID}/rot`).set(playerRotation)
      firebase.database().ref(`games/${id}/server/${playerUniqueID}/pos`).set(cubeBody.position)
      firebase.database().ref(`games/${id}/server/${playerUniqueID}/age`).set(Date.now())
      firebase.database().ref(`games/${id}/server/${playerUniqueID}/id`).set(playerUniqueID)
    }
  }

  setInterval(playerLoop, 10)

  if (isFirebaseEnv) {
    var player = {
      rot: playerRotation,
      id: playerUniqueID,
      age: Date.now(),
      pos: cubeBody.position
    };

    firebase.database().ref(`games/${id}/server/${playerUniqueID}`).set(player)
  }
}

var allPlayersElem = {}
function otherPlayers() {
  firebase.database().ref(`games/${id}/server/`).on('value', function (snapshot) {
    var playerslist = snapshot.val()
    Object.values(playerslist).forEach(element => {
      const unixTimeMilliseconds = parseInt(element.age);
      const unixTimeDate = new Date(unixTimeMilliseconds);
      const currentTime = new Date();
      const timeDifference = currentTime.getTime() - unixTimeDate.getTime();

      if (element.id != playerUniqueID) {
        if (!allPlayersElem[element.id]) {
          var cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
          var cubeMaterial = new THREE.MeshPhongMaterial({ color: getRandomHexColor() });
          allPlayersElem[element.id] = new THREE.Mesh(cubeGeometry, cubeMaterial);
          scene.add(allPlayersElem[element.id])
        } else {
          allPlayersElem[element.id].position.x = element.pos.x
          allPlayersElem[element.id].position.y = element.pos.y
          allPlayersElem[element.id].position.z = element.pos.z
          allPlayersElem[element.id].rotation.y = element.rot
        }
      }

      if (timeDifference >= 10000) {
        firebase.database().ref(`games/${id}/server/${element.id}`).remove()
        if (allPlayersElem[element.id]) {
          scene.remove(allPlayersElem[element.id])
        }
      }
    });
  })
}
