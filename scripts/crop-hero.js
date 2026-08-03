const { decode, encode } = require('./png');
const fs = require('fs');
const path = require('path');

const SRC = process.argv[2];
const OUT = path.join(__dirname, '..', 'assets', 'hero.png');

// All measured from the mockup via scripts/analyze2.js.
const CONTENT_L = 12;
const CONTENT_R = 345;
const ART_TOP = 78;
const ART_BOTTOM = 406; // cart wheels clear the platform here; title glyphs start at 408
// The mockup is a two-panel composite; the join wiped out this band of rows.
// Interpolating across it smears the cart rail, so drop the rows and splice.
const SEAM_TOP = 313;
const SEAM_BOTTOM = 324;

const img = decode(fs.readFileSync(SRC));
const { width, data } = img;
const at = (x, y) => (y * width + x) * 4;

// Confirm the composite left exactly one damaged band.
const bright = [];
for (let y = ART_TOP; y <= ART_BOTTOM; y++) {
  let n = 0;
  for (let x = CONTENT_L; x <= CONTENT_R; x++) {
    const i = at(x, y);
    if (data[i] > 236 && data[i + 1] > 236 && data[i + 2] > 236) n++;
  }
  if (n / (CONTENT_R - CONTENT_L + 1) > 0.05) bright.push(y);
}
console.log(
  bright.length
    ? `damaged rows detected: ${bright[0]}..${bright[bright.length - 1]}`
    : 'no damaged rows detected'
);

const keep = [];
for (let y = ART_TOP; y <= ART_BOTTOM; y++) {
  if (y >= SEAM_TOP && y <= SEAM_BOTTOM) continue;
  keep.push(y);
}

const w = CONTENT_R - CONTENT_L + 1;
const h = keep.length;
const out = Buffer.alloc(w * h * 4);
keep.forEach((srcY, i) => {
  const from = at(CONTENT_L, srcY);
  data.copy(out, i * w * 4, from, from + w * 4);
});

fs.writeFileSync(OUT, encode({ width: w, height: h, data: out }));
console.log(`removed ${SEAM_BOTTOM - SEAM_TOP + 1} seam rows`);
console.log(`wrote assets/hero.png  ${w}x${h}  (aspectRatio ${(w / h).toFixed(4)})`);
