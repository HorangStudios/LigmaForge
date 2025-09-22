// HorangHill LigmaForge Player Engine - Player model template and animations

// process face to be used as head texture
async function faceDecoder(dataURL, headColor, eyeColor) {
  // load face image
  const img = new Image();
  img.src = dataURL;
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  // create canvas for editing
  const canvas = document.createElement("canvas");
  canvas.width = 3215 * (img.height / 1024);
  canvas.height = img.height;

  // create context, head color background and face above
  const ctx = canvas.getContext('2d');
  const x = (canvas.width - img.width) / 2;
  const y = (canvas.height - img.height) / 2;
  ctx.fillStyle = headColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, x, y);

  // apply custom color to eyes
  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (var i = 0; i < imageData.data.length; i += 4) {
    if (
      imageData.data[i] === 255 &&
      imageData.data[i + 1] === 0 &&
      (imageData.data[i + 2] === 244 || imageData.data[i + 2] === 242)
    ) {
      imageData.data[i] = hexToRgb(eyeColor)[0];
      imageData.data[i + 1] = hexToRgb(eyeColor)[1];
      imageData.data[i + 2] = hexToRgb(eyeColor)[2];
    }
  }
  ctx.putImageData(imageData, 0, 0);

  // return processed face
  const result = canvas.toDataURL()
  return result;
}

// convert hex to rgb
function hexToRgb(hex) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(x => x + x).join('');
  }
  const num = parseInt(hex, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

// process shirt data and return individual images for each body parts
async function shirtDecoder(dataURL) {
  // image scale/ratio and result data
  const scale = { x: 585, y: 559 }
  const results = {}

  // position and size for each body part on the template
  const parts = {
    torsoFront: { x: 231, y: 74, width: 127, height: 127 },
    torsoBack: { x: 427, y: 74, width: 127, height: 127 },
    torsoLeft: { x: 361, y: 74, width: 63, height: 127 },
    torsoRight: { x: 165, y: 74, width: 63, height: 127 },
    torsoUp: { x: 231, y: 8, width: 127, height: 63 },
    torsoDown: { x: 231, y: 204, width: 127, height: 63 },

    leftArmFront: { x: 217, y: 355, width: 63, height: 127 },
    leftArmBack: { x: 85, y: 355, width: 63, height: 127 },
    leftArmLeft: { x: 19, y: 355, width: 63, height: 127 },
    leftArmRight: { x: 151, y: 355, width: 63, height: 127 },
    leftArmUp: { x: 217, y: 289, width: 63, height: 63 },
    leftArmDown: { x: 217, y: 485, width: 63, height: 63 },

    rightArmFront: { x: 308, y: 355, width: 63, height: 127 },
    rightArmBack: { x: 440, y: 355, width: 63, height: 127 },
    rightArmLeft: { x: 374, y: 355, width: 63, height: 127 },
    rightArmRight: { x: 506, y: 355, width: 63, height: 127 },
    rightArmUp: { x: 308, y: 289, width: 63, height: 63 },
    rightArmDown: { x: 308, y: 485, width: 63, height: 63 },
  };

  // load image
  const img = new Image();
  img.src = dataURL;
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  // create canvas and put image
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  // crop out each parts from the image
  for (const [name, region] of Object.entries(parts)) {
    // create canvas
    const partCanvas = document.createElement('canvas');
    const partCtx = partCanvas.getContext('2d');

    // get position and size while also considering higher resolution or stretched aspect ratio
    const x = img.naturalWidth * (region.x / scale.x);
    const y = img.naturalHeight * (region.y / scale.y);
    const width = img.naturalWidth * (region.width / scale.x);
    const height = img.naturalHeight * (region.height / scale.y);

    // draw cropped part to the canvas
    partCanvas.width = width;
    partCanvas.height = height;
    partCtx.drawImage(
      canvas,
      x, y, width, height,
      0, 0, width, height
    );

    results[name] = partCanvas.toDataURL();
  }
  return results;
}

// player model template
async function playerModel(color, avatar) {
  // 3d model group and editable data for animation states
  var group = new THREE.Group();
  var data = [];

  // internal animation states
  var step = 0;
  var walkingAnimation = false;
  var jumpingAnimation = false;

  // process shirt
  if (avatar.shirt !== false && typeof avatar.shirt !== 'undefined') {
    var shirt = await shirtDecoder(avatar.shirt)
  }

  // process pants
  if (avatar.pants !== false && typeof avatar.pants !== 'undefined') {
    var pants = await shirtDecoder(avatar.pants)
  }

  // 3d model group initial setup
  group.castShadow = true;
  group.receiveShadow = true;
  group.position.set(0, 0, 0);

  // editable animation states
  data.isJumping = false
  data.isWalking = false

  // apply pants texture to left leg model or solid color
  var leftLeg
  if (avatar.pants !== false && typeof avatar.pants !== 'undefined') {
    const loader = new THREE.TextureLoader();
    const materials = [
      new THREE.MeshPhongMaterial({ color: 0xffffff, map: loader.load(pants.leftArmRight) }),
      new THREE.MeshPhongMaterial({ color: 0xffffff, map: loader.load(pants.leftArmLeft) }),
      new THREE.MeshPhongMaterial({ color: 0xffffff, map: loader.load(pants.leftArmUp) }),
      new THREE.MeshPhongMaterial({ color: 0xffffff, map: loader.load(pants.leftArmDown) }),
      new THREE.MeshPhongMaterial({ color: 0xffffff, map: loader.load(pants.leftArmBack) }),
      new THREE.MeshPhongMaterial({ color: 0xffffff, map: loader.load(pants.leftArmFront) }),
    ];
    leftLeg = new THREE.Mesh(new THREE.BoxGeometry(.5, 1, .5), materials);
  } else {
    leftLeg = new THREE.Mesh(new THREE.BoxGeometry(.5, 1, .5), new THREE.MeshPhongMaterial({ color: avatar.colors.leftLeg || 0X808080 }))
  }

  // create left leg model
  var leftLegPivot = new THREE.Object3D();
  leftLeg.position.set(-.25, 0, 0);
  leftLeg.castShadow = true;
  leftLeg.receiveShadow = true;
  leftLegPivot.position.set(0, 0, 0);
  leftLegPivot.add(leftLeg);
  group.add(leftLegPivot);

  // apply pants texture to right leg model or solid color
  var rightLeg
  if (avatar.pants !== false && typeof avatar.pants !== 'undefined') {
    const loader = new THREE.TextureLoader();
    const materials = [
      new THREE.MeshPhongMaterial({ color: 0xffffff, map: loader.load(pants.rightArmRight) }),
      new THREE.MeshPhongMaterial({ color: 0xffffff, map: loader.load(pants.rightArmLeft) }),
      new THREE.MeshPhongMaterial({ color: 0xffffff, map: loader.load(pants.rightArmUp) }),
      new THREE.MeshPhongMaterial({ color: 0xffffff, map: loader.load(pants.rightArmDown) }),
      new THREE.MeshPhongMaterial({ color: 0xffffff, map: loader.load(pants.rightArmBack) }),
      new THREE.MeshPhongMaterial({ color: 0xffffff, map: loader.load(pants.rightArmFront) }),
    ];
    rightLeg = new THREE.Mesh(new THREE.BoxGeometry(.5, 1, .5), materials);
  } else {
    rightLeg = new THREE.Mesh(new THREE.BoxGeometry(.5, 1, .5), new THREE.MeshPhongMaterial({ color: avatar.colors.rightLeg || 0X808080 }))
  }

  // create right leg model
  var rightLegPivot = new THREE.Object3D();
  rightLeg.position.set(.25, 0, 0)
  rightLeg.castShadow = true;
  rightLeg.receiveShadow = true;
  rightLegPivot.position.set(0, 0, 0);
  rightLegPivot.add(rightLeg);
  group.add(rightLegPivot)

  // apply shirt texture to left arm model or solid color
  var leftArm
  if (avatar.shirt !== false && typeof avatar.shirt !== 'undefined') {
    const loader = new THREE.TextureLoader();
    const materials = [
      new THREE.MeshPhongMaterial({ color: 0xffffff, map: loader.load(shirt.leftArmRight) }),
      new THREE.MeshPhongMaterial({ color: 0xffffff, map: loader.load(shirt.leftArmLeft) }),
      new THREE.MeshPhongMaterial({ color: 0xffffff, map: loader.load(shirt.leftArmUp) }),
      new THREE.MeshPhongMaterial({ color: 0xffffff, map: loader.load(shirt.leftArmDown) }),
      new THREE.MeshPhongMaterial({ color: 0xffffff, map: loader.load(shirt.leftArmBack) }),
      new THREE.MeshPhongMaterial({ color: 0xffffff, map: loader.load(shirt.leftArmFront) }),
    ];
    leftArm = new THREE.Mesh(new THREE.BoxGeometry(.5, 1, .5), materials);
  } else {
    leftArm = new THREE.Mesh(new THREE.BoxGeometry(.5, 1, .5), new THREE.MeshPhongMaterial({ color: avatar.colors.leftArm || 0xffffff }))
  }

  // create left arm model
  var leftArmPivot = new THREE.Object3D();
  leftArm.position.set(-.75, -0.25, 0)
  leftArm.castShadow = true;
  leftArm.receiveShadow = true;
  leftArmPivot.position.set(0, 1.25, 0);
  leftArmPivot.add(leftArm);
  group.add(leftArmPivot);

  // apply shirt texture to right arm model or solid color
  var rightArm
  if (avatar.shirt !== false && typeof avatar.shirt !== 'undefined') {
    const loader = new THREE.TextureLoader();
    const materials = [
      new THREE.MeshPhongMaterial({ color: 0xffffff, map: loader.load(shirt.rightArmRight) }),
      new THREE.MeshPhongMaterial({ color: 0xffffff, map: loader.load(shirt.rightArmLeft) }),
      new THREE.MeshPhongMaterial({ color: 0xffffff, map: loader.load(shirt.rightArmUp) }),
      new THREE.MeshPhongMaterial({ color: 0xffffff, map: loader.load(shirt.rightArmDown) }),
      new THREE.MeshPhongMaterial({ color: 0xffffff, map: loader.load(shirt.rightArmBack) }),
      new THREE.MeshPhongMaterial({ color: 0xffffff, map: loader.load(shirt.rightArmFront) }),
    ];
    rightArm = new THREE.Mesh(new THREE.BoxGeometry(.5, 1, .5), materials);
  } else {
    rightArm = new THREE.Mesh(new THREE.BoxGeometry(.5, 1, .5), new THREE.MeshPhongMaterial({ color: avatar.colors.rightArm || 0xffffff }))
  }

  // create right arm model
  var rightArmPivot = new THREE.Object3D();
  rightArm.position.set(.75, -0.25, 0)
  rightArm.castShadow = true;
  rightArm.receiveShadow = true;
  rightArmPivot.position.set(0, 1.25, 0);
  rightArmPivot.add(rightArm);
  group.add(rightArmPivot);

  // apply shirt texture to torso model or solid color
  var torso
  if (avatar.shirt !== false && typeof avatar.shirt !== 'undefined') {
    const loader = new THREE.TextureLoader();
    const materials = [
      new THREE.MeshPhongMaterial({ color: 0xffffff, map: loader.load(shirt.torsoRight) }),
      new THREE.MeshPhongMaterial({ color: 0xffffff, map: loader.load(shirt.torsoLeft) }),
      new THREE.MeshPhongMaterial({ color: 0xffffff, map: loader.load(shirt.torsoUp) }),
      new THREE.MeshPhongMaterial({ color: 0xffffff, map: loader.load(shirt.torsoDown) }),
      new THREE.MeshPhongMaterial({ color: 0xffffff, map: loader.load(shirt.torsoBack) }),
      new THREE.MeshPhongMaterial({ color: 0xffffff, map: loader.load(shirt.torsoFront) }),
    ];
    torso = new THREE.Mesh(new THREE.BoxGeometry(1, 1, .5), materials);
  } else {
    torso = new THREE.Mesh(new THREE.BoxGeometry(1, 1, .5), new THREE.MeshPhongMaterial({ color: avatar.colors.torso || color }))
  }

  // create torso model
  torso.position.set(0, 1, 0)
  torso.castShadow = true;
  torso.receiveShadow = true;
  group.add(torso)

  // apply face texture to head model or solid color
  var head
  if (avatar.face !== false && typeof avatar.face !== 'undefined') {
    const loader = new THREE.TextureLoader();
    const loadFace = await faceDecoder(avatar.face, avatar.colors.head || 0xffffff, avatar.colors.eye || 0xffffff);
    const headMaterials = [
      new THREE.MeshPhongMaterial({ color: 0xffffff, map: loader.load(loadFace) }),
      new THREE.MeshPhongMaterial({ color: avatar.colors.head || 0xffffff }),
      new THREE.MeshPhongMaterial({ color: avatar.colors.head || 0xffffff })
    ];
    head = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .5, 32, 1, false, 0, Math.PI * 2), headMaterials);
  } else {
    head = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .5, 32, 1, false, 0, Math.PI * 2), new THREE.MeshPhongMaterial({ color: avatar.colors.head || 0xffffff }));
  }

  // create head model
  head.position.set(0, 1.75, 0)
  head.castShadow = true;
  head.receiveShadow = true;
  group.add(head)

  // lerp animation function (ease)
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // animation loop
  function animLoop() {
    // walking animation step data
    const duration = 450;
    const startStep = step;
    const endStep = step === 0 ? 1 : 0;
    const startTime = performance.now();

    // walking animation steps
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

    // animate walking
    function animateTween() {
      const now = performance.now();
      const t = Math.min((now - startTime) / duration, 1);

      // apply step to left leg
      leftLegPivot.position.set(
        lerp(phases[startStep].leftLeg.pos[0], phases[endStep].leftLeg.pos[0], t),
        lerp(phases[startStep].leftLeg.pos[1], phases[endStep].leftLeg.pos[1], t),
        lerp(phases[startStep].leftLeg.pos[2], phases[endStep].leftLeg.pos[2], t)
      );
      leftLegPivot.rotation.x = lerp(phases[startStep].leftLeg.rot, phases[endStep].leftLeg.rot, t);

      // apply step to right leg
      rightLegPivot.position.set(
        lerp(phases[startStep].rightLeg.pos[0], phases[endStep].rightLeg.pos[0], t),
        lerp(phases[startStep].rightLeg.pos[1], phases[endStep].rightLeg.pos[1], t),
        lerp(phases[startStep].rightLeg.pos[2], phases[endStep].rightLeg.pos[2], t)
      );
      rightLegPivot.rotation.x = lerp(phases[startStep].rightLeg.rot, phases[endStep].rightLeg.rot, t);

      // apply step to arms. avoid applying animation if jumping/falling
      if (!data.isJumping) {
        leftArmPivot.rotation.x = lerp(phases[startStep].leftArm.rot, phases[endStep].leftArm.rot, t);
        rightArmPivot.rotation.x = lerp(phases[startStep].rightArm.rot, phases[endStep].rightArm.rot, t);
      }

      // continue animation or go to next step if completed
      if (t < 1) {
        requestAnimationFrame(animateTween);
      } else {
        step = endStep;
      }
    }

    animateTween();
  }

  // animate jump
  function animLoopJump(target) {
    // animation duration
    const duration = 450;
    const startTime = performance.now();

    // rotation pre-animation
    const originalRotationLeft = leftArmPivot.rotation.x
    const originalRotationRight = rightArmPivot.rotation.x

    // apply the animation
    function lerpTheJump() {
      const now = performance.now();
      const t = Math.min((now - startTime) / duration, 1);

      // apply to left arm
      leftArmPivot.rotation.set(
        lerp(originalRotationLeft, target, t),
        leftArmPivot.rotation.y,
        leftArmPivot.rotation.z
      )

      // apply to right arm
      rightArmPivot.rotation.set(
        lerp(originalRotationRight, target, t),
        rightArmPivot.rotation.y,
        rightArmPivot.rotation.z
      )

      // run animation if not completed
      if (t < 1) {
        requestAnimationFrame(lerpTheJump);
      }
    }

    // start animation
    lerpTheJump();
  }

  setInterval(() => {
    // check if editable data for jumping is edited
    if (data.isJumping) {
      if (jumpingAnimation == false) {
        jumpingAnimation = true;
        animLoopJump(Math.PI);
      }
    } else {
      if (!data.isJumping) {
        if (jumpingAnimation == true) {
          jumpingAnimation = false;
          animLoopJump(0);
        }
      }
    }

    // check if editable data for walking is edited
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

  // return model group and editable data
  return [group, data]
}