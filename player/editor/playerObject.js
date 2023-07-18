var playerObject

function spawnPlayer() {
	var cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
	var cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x800000 });

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
	world.addBody(cubeBody);

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
    document.addEventListener('keydown', function(event) {
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

    document.addEventListener('keyup', function(event) {
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

    function playerLoop() {
      camera.position.set(sceneNode.position.x, sceneNode.position.y + 3, sceneNode.position.z + 3);
      camera.lookAt( sceneNode.position );
      cubeBody.quaternion.x = 0
      cubeBody.quaternion.y = 0
      cubeBody.quaternion.z = 0

      if (keyState.w) {
        cubeBody.position.z -= 0.1
      }
      if (keyState.s) {
        cubeBody.position.z += 0.1
      }
      if (keyState.a) {
        cubeBody.position.x -= 0.1
      }
      if (keyState.d) {
        cubeBody.position.x += 0.1
      }
      if (keyState.space) {
        cubeBody.position.y += 0.1
      }

      requestAnimationFrame(playerLoop)
    }

    playerLoop()
}