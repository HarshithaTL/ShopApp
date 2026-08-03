const { decode, encode, crop } = require('./png');
const fs = require('fs');
const path = require('path');

// The generated artwork is 2:3; the grid from the mockup is 0.881. Crop the
// difference here rather than letting resizeMode do it blind, so the framing
// of each subject is chosen rather than always centred.
const TARGET_ASPECT = 141 / 160;

// 0 keeps the top of the frame, 1 keeps the bottom, 0.5 is centred.
const BIAS = {
  'furniture.png': 0.55,
  'hand-bag.png': 0.5,
  'books.png': 0.6,
  'tech.png': 0.55,
  'sneakers.png': 0.5,
  'travel.png': 0.42, // keep the sun hat above the suitcase
};

const dir = path.join(__dirname, '..', 'assets', 'categories');

for (const [file, bias] of Object.entries(BIAS)) {
  const abs = path.join(dir, file);
  const img = decode(fs.readFileSync(abs));
  const targetH = Math.round(img.width / TARGET_ASPECT);

  if (targetH >= img.height) {
    console.log(`${file.padEnd(15)} already <= target aspect, left alone`);
    continue;
  }

  const spare = img.height - targetH;
  const top = Math.round(spare * bias);
  fs.writeFileSync(abs, encode(crop(img, 0, top, img.width, targetH)));
  console.log(
    `${file.padEnd(15)} ${img.width}x${img.height} -> ${img.width}x${targetH}  ` +
      `(trimmed ${top} top / ${spare - top} bottom)`
  );
}
