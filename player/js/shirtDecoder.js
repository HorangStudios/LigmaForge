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