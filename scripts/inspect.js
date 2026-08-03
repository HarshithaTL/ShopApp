const { decode, encode, crop } = require('./png');
const fs = require('fs');

// Nearest-neighbour zoom so small artefacts are actually visible.
const scale = (img, f) => {
  const w = img.width * f;
  const h = img.height * f;
  const out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const s = (((y / f) | 0) * img.width + ((x / f) | 0)) * 4;
      img.data.copy(out, (y * w + x) * 4, s, s + 4);
    }
  }
  return { width: w, height: h, data: out };
};

const [, , src, x0, y0, w, h, f, dest] = process.argv;
const img = decode(fs.readFileSync(src));
const region = crop(img, +x0, +y0, +w, +h);
fs.writeFileSync(dest, encode(scale(region, +f)));
console.log(`${dest}  ${region.width}x${region.height} @${f}x`);
