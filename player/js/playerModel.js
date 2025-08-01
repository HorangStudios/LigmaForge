async function shirtDecoder(dataURL) {
  const scale = { x: 585, y: 559 }
  const results = {}
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

  const img = new Image();
  img.src = dataURL;

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  for (const [name, region] of Object.entries(parts)) {
    const partCanvas = document.createElement('canvas');
    const partCtx = partCanvas.getContext('2d');
    const x = img.naturalWidth * (region.x / scale.x);
    const y = img.naturalHeight * (region.y / scale.y);
    const width = img.naturalWidth * (region.width / scale.x);
    const height = img.naturalHeight * (region.height / scale.y);

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

async function playerModel(color, avatar) {
  var group = new THREE.Group()
  var data = []
  var step = 0
  var walkingAnimation = false

  if (avatar.shirt !== false) {
    var shirt = await shirtDecoder(avatar.shirt)
  }

  if (avatar.pants !== false) {
    var pants = await shirtDecoder(avatar.pants)
  }

  group.castShadow = true;
  group.receiveShadow = true;
  group.position.set(0, 0, 0);
  data.isJumping = false
  data.isWalking = false

  if (avatar.pants !== false) {
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

  var leftLegPivot = new THREE.Object3D();
  leftLeg.position.set(-.25, 0, 0);
  leftLeg.castShadow = true;
  leftLeg.receiveShadow = true;
  leftLegPivot.position.set(0, 0, 0);
  leftLegPivot.add(leftLeg);
  group.add(leftLegPivot);

  if (avatar.pants !== false) {
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

  var rightLegPivot = new THREE.Object3D();
  rightLeg.position.set(.25, 0, 0)
  rightLeg.castShadow = true;
  rightLeg.receiveShadow = true;
  rightLegPivot.position.set(0, 0, 0);
  rightLegPivot.add(rightLeg);
  group.add(rightLegPivot)

  if (avatar.shirt !== false) {
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

  var leftArmPivot = new THREE.Object3D();
  leftArm.position.set(-.75, -0.25, 0)
  leftArm.castShadow = true;
  leftArm.receiveShadow = true;
  leftArmPivot.position.set(0, 1.25, 0);
  leftArmPivot.add(leftArm);
  group.add(leftArmPivot);

  if (avatar.shirt !== false) {
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

  var rightArmPivot = new THREE.Object3D();
  rightArm.position.set(.75, -0.25, 0)
  rightArm.castShadow = true;
  rightArm.receiveShadow = true;
  rightArmPivot.position.set(0, 1.25, 0);
  rightArmPivot.add(rightArm);
  group.add(rightArmPivot);

  if (avatar.shirt !== false) {
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

  torso.position.set(0, 1, 0)
  torso.castShadow = true;
  torso.receiveShadow = true;
  group.add(torso)

  const pathToTexture = "https://horangstudios.github.io/LigmaForge/player/js/Manface.png";
  const headtexture = new THREE.TextureLoader().load(pathToTexture);
  headtexture.wrapS = THREE.RepeatWrapping;
  headtexture.wrapT = THREE.RepeatWrapping;
  headtexture.offset.x = 0;
  headtexture.repeat.x = 1;

  var headMaterials = [];
  if (pathToTexture == "") {
    headMaterials = new THREE.MeshPhongMaterial({ color: avatar.colors.head || 0xffffff })
  } else {
    headMaterials = [
      new THREE.MeshPhongMaterial({ color: avatar.colors.head || 0xffffff, map: headtexture, transparent: true }),
      new THREE.MeshPhongMaterial({ color: avatar.colors.head || 0xffffff }),
      new THREE.MeshPhongMaterial({ color: avatar.colors.head || 0xffffff })
    ];
  }

  head = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .5, 32, 1, false, 0, Math.PI * 2), headMaterials);
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