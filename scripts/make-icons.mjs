// Renders the placeholder goat icon to PNG files in public/ without any image library.
import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const INK = [14, 12, 19];
const HORN = [244, 241, 234];
const HEAD = [215, 255, 62];
const SUPERSAMPLE = 4;

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng(size, rgb) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 2;
  const raw = Buffer.alloc(size * (size * 3 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    rgb.copy(raw, y * (size * 3 + 1) + 1, y * size * 3, (y + 1) * size * 3);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const inEllipse = (u, v, cx, cy, rx, ry) => ((u - cx) / rx) ** 2 + ((v - cy) / ry) ** 2 <= 1;

function inBeard(u, v) {
  if (v < 0.72 || v > 0.9) return false;
  const halfWidth = 0.06 * (1 - (v - 0.72) / 0.18);
  return Math.abs(u - 0.5) <= halfWidth;
}

function inHorns(u, v) {
  const d = Math.hypot(u - 0.5, v - 0.44);
  return d >= 0.2 && d <= 0.28 && v < 0.42 && Math.abs(u - 0.5) > 0.06;
}

// Goat face in a unit square, v grows downward.
function colorAt(u, v) {
  if (inEllipse(u, v, 0.44, 0.53, 0.026, 0.03) || inEllipse(u, v, 0.56, 0.53, 0.026, 0.03)) return INK;
  if (inEllipse(u, v, 0.5, 0.56, 0.16, 0.21) || inBeard(u, v)) return HEAD;
  if (inEllipse(u, v, 0.3, 0.47, 0.1, 0.04) || inEllipse(u, v, 0.7, 0.47, 0.1, 0.04)) return HEAD;
  if (inHorns(u, v)) return HORN;
  return INK;
}

function render(size, scale) {
  const rgb = Buffer.alloc(size * size * 3);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const sum = [0, 0, 0];
      for (let sy = 0; sy < SUPERSAMPLE; sy++) {
        for (let sx = 0; sx < SUPERSAMPLE; sx++) {
          const u = ((x + (sx + 0.5) / SUPERSAMPLE) / size - 0.5) / scale + 0.5;
          const v = ((y + (sy + 0.5) / SUPERSAMPLE) / size - 0.5) / scale + 0.5;
          colorAt(u, v).forEach((c, i) => (sum[i] += c));
        }
      }
      sum.forEach((c, i) => (rgb[(y * size + x) * 3 + i] = Math.round(c / SUPERSAMPLE ** 2)));
    }
  }
  return encodePng(size, rgb);
}

const outputs = [
  ["public/icon-192.png", 192, 1],
  ["public/icon-512.png", 512, 1],
  ["public/icon-512-maskable.png", 512, 0.75],
  ["public/apple-touch-icon.png", 180, 0.9],
];
for (const [path, size, scale] of outputs) writeFileSync(path, render(size, scale));
