const { decode } = require('./png');
const fs = require('fs');

const img = decode(fs.readFileSync(process.argv[2]));
const { width, height, data } = img;
const px = (x, y) => {
  const i = (y * width + x) * 4;
  return [data[i], data[i + 1], data[i + 2]];
};
const dark = (x, y) => {
  const [r, g, b] = px(x, y);
  return r < 80 && g < 80 && b < 80;
};

console.log(`size ${width}x${height}`);

const probeY = (height / 2) | 0;
let x = 0;
while (x < width && !dark(x, probeY)) x++;
while (x < width && dark(x, probeY)) x++;
const cl = x;
x = width - 1;
while (x >= 0 && !dark(x, probeY)) x--;
while (x >= 0 && dark(x, probeY)) x--;
const cr = x;
console.log(`content x ${cl}..${cr} (w=${cr - cl + 1})\n`);

const near = (p, q, tol) =>
  Math.abs(p[0] - q[0]) < tol && Math.abs(p[1] - q[1]) < tol && Math.abs(p[2] - q[2]) < tol;

// The page background is the near-white gutter between cards.
const bg = px(cl + 2, (height * 0.55) | 0);
console.log(`sampled gutter colour rgb(${bg})\n`);

console.log('rows: fraction of pixels matching gutter (low = card content)');
const rowBg = [];
for (let y = 0; y < height; y++) {
  let n = 0;
  for (let xx = cl; xx <= cr; xx++) if (near(px(xx, y), bg, 18)) n++;
  rowBg.push(n / (cr - cl + 1));
}
let run = null;
for (let y = 0; y <= height; y++) {
  const gutter = y < height && rowBg[y] > 0.85;
  if (gutter && !run) run = y;
  if (!gutter && run !== null) {
    if (y - run >= 2) console.log(`  gutter rows ${run}..${y - 1} (${y - run})`);
    run = null;
  }
}

console.log('\ncolumns within card bands: fraction matching gutter');
const colBg = [];
for (let xx = cl; xx <= cr; xx++) {
  let n = 0;
  let t = 0;
  for (let y = (height * 0.2) | 0; y < (height * 0.9) | 0; y++) {
    if (near(px(xx, y), bg, 18)) n++;
    t++;
  }
  colBg.push(n / t);
}
run = null;
for (let i = 0; i <= colBg.length; i++) {
  const gutter = i < colBg.length && colBg[i] > 0.5;
  if (gutter && run === null) run = i;
  if (!gutter && run !== null) {
    console.log(`  gutter cols ${cl + run}..${cl + i - 1} (${i - run})`);
    run = null;
  }
}

console.log('\nbright band (composite seam) per row:');
for (let y = 0; y < height; y++) {
  let n = 0;
  for (let xx = cl; xx <= cr; xx++) {
    const [r, g, b] = px(xx, y);
    if (r > 244 && g > 244 && b > 244) n++;
  }
  const f = n / (cr - cl + 1);
  if (f > 0.5) console.log(`  y=${y} ${f.toFixed(2)}`);
}
