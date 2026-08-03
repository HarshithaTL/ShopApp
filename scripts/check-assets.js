const fs = require('fs');
const path = require('path');

// Targets assume a ~390pt-wide screen at 3x density.
// `aspect` is what the app's layout constants currently expect; a mismatch
// means the image will be cover-cropped unless the constant is updated too.
const EXPECTED = [
  { file: 'assets/hero.png', minWidth: 1000, aspect: 1, where: 'HERO_ASPECT in src/screens/HomeScreen.js' },
  { file: 'assets/categories/furniture.png', minWidth: 500, aspect: 141 / 160, where: 'CARD_ASPECT in src/components/CategoryCard.js' },
  { file: 'assets/categories/hand-bag.png', minWidth: 500, aspect: 141 / 160, where: 'CARD_ASPECT' },
  { file: 'assets/categories/books.png', minWidth: 500, aspect: 141 / 160, where: 'CARD_ASPECT' },
  { file: 'assets/categories/tech.png', minWidth: 500, aspect: 141 / 160, where: 'CARD_ASPECT' },
  { file: 'assets/categories/sneakers.png', minWidth: 500, aspect: 141 / 160, where: 'CARD_ASPECT' },
  { file: 'assets/categories/travel.png', minWidth: 500, aspect: 141 / 160, where: 'CARD_ASPECT' },
];

const root = path.join(__dirname, '..');
let problems = 0;

console.log('asset                              size        aspect  status');
console.log('-'.repeat(72));

for (const { file, minWidth, aspect } of EXPECTED) {
  const abs = path.join(root, file);
  if (!fs.existsSync(abs)) {
    console.log(`${file.padEnd(34)} ${'MISSING'.padEnd(11)} ${''.padEnd(7)} missing`);
    problems++;
    continue;
  }

  const buf = fs.readFileSync(abs);
  if (buf.readUInt32BE(0) !== 0x89504e47) {
    console.log(`${file.padEnd(34)} ${'not a PNG'}`);
    problems++;
    continue;
  }

  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  const a = w / h;
  const notes = [];
  if (w < minWidth) notes.push(`low-res (want >=${minWidth}px wide)`);
  if (Math.abs(a - aspect) / aspect > 0.02)
    notes.push(`aspect ${a.toFixed(3)} != ${aspect.toFixed(3)} expected`);
  if (notes.length) problems++;

  console.log(
    `${file.padEnd(34)} ${`${w}x${h}`.padEnd(11)} ${a.toFixed(3).padEnd(7)} ${
      notes.length ? notes.join('; ') : 'ok'
    }`
  );
}

console.log('-'.repeat(72));
if (problems) {
  console.log(`${problems} asset(s) need attention.`);
  console.log('If an aspect ratio changed on purpose, update the matching layout');
  console.log('constant listed in EXPECTED at the top of this script.');
} else {
  console.log('All assets are HD and match the layout constants.');
}
process.exit(problems ? 1 : 0);
