const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const crcTable = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};

const solidPng = (width, height, hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // truecolour
  ihdr[10] = 0; // deflate
  ihdr[11] = 0; // adaptive filtering
  ihdr[12] = 0; // no interlace

  const stride = width * 3;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (stride + 1);
    raw[rowStart] = 0; // filter type: none
    for (let x = 0; x < width; x++) {
      const p = rowStart + 1 + x * 3;
      raw[p] = r;
      raw[p + 1] = g;
      raw[p + 2] = b;
    }
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

const targets = [
  ['assets/hero.png', 800, 450, '#CBE3F0'],
  ['assets/categories/furniture.png', 400, 300, '#8B9E45'],
  ['assets/categories/hand-bag.png', 400, 300, '#E8923A'],
  ['assets/categories/books.png', 400, 300, '#C0392B'],
  ['assets/categories/tech.png', 400, 300, '#27AE60'],
  ['assets/categories/sneakers.png', 400, 300, '#E8546A'],
  ['assets/categories/travel.png', 400, 300, '#2A9D8F'],
  ['assets/icon.png', 1024, 1024, '#2A7F7F'],
  ['assets/adaptive-icon.png', 1024, 1024, '#2A7F7F'],
  ['assets/splash-icon.png', 1284, 2778, '#2A7F7F'],
  ['assets/favicon.png', 48, 48, '#2A7F7F'],
];

const root = path.join(__dirname, '..');
for (const [rel, w, h, hex] of targets) {
  const dest = path.join(root, rel);
  if (fs.existsSync(dest)) {
    console.log(`skip (exists)  ${rel}`);
    continue;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, solidPng(w, h, hex));
  console.log(`created        ${rel}  ${w}x${h}  ${hex}`);
}
