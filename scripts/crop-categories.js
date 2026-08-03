const { decode, encode, crop } = require('./png');
const fs = require('fs');
const path = require('path');

const SRC = process.argv[2];
const OUT_DIR = path.join(__dirname, '..', 'assets', 'categories');

// Grid measured via scripts/analyze-cats.js. The mockup is a two-panel
// composite, so the first card row sits at a slightly taller scale than the
// two below it; each card is cropped at its own bounds and the app renders
// them all at one uniform aspect ratio.
const COL = { left: [35, 175], right: [194, 333] };
const ROW = { top: [124, 303], middle: [321, 480], bottom: [489, 646] };

const CARDS = [
  ['furniture.png', COL.left, ROW.top],
  ['hand-bag.png', COL.right, ROW.top],
  ['books.png', COL.left, ROW.middle],
  ['tech.png', COL.right, ROW.middle],
  ['sneakers.png', COL.left, ROW.bottom],
  ['travel.png', COL.right, ROW.bottom],
];

const img = decode(fs.readFileSync(SRC));

for (const [name, [x0, x1], [y0, y1]] of CARDS) {
  const w = x1 - x0 + 1;
  const h = y1 - y0 + 1;
  const out = crop(img, x0, y0, w, h);
  fs.writeFileSync(path.join(OUT_DIR, name), encode(out));
  console.log(`${name.padEnd(14)} ${w}x${h}  aspect ${(w / h).toFixed(3)}`);
}

// The battery / signal / avatar cluster is decoration with no text meaning,
// so it is lifted straight from the mockup rather than re-drawn.
const ICONS = { x: [249, 350], y: [19, 46] };
const iw = ICONS.x[1] - ICONS.x[0] + 1;
const ih = ICONS.y[1] - ICONS.y[0] + 1;
fs.writeFileSync(
  path.join(__dirname, '..', 'assets', 'header-icons.png'),
  encode(crop(img, ICONS.x[0], ICONS.y[0], iw, ih))
);
console.log(`${'header-icons'.padEnd(14)} ${iw}x${ih}  aspect ${(iw / ih).toFixed(3)}`);
