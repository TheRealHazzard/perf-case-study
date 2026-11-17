// Generates the large "photographs" the page uses, so the repo stays small.
// They are deliberately full-size camera-style JPEGs, like a real unoptimized site.
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'node:fs';

const OUT = 'public/img';
mkdirSync(OUT, { recursive: true });

function rng(seed) {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

async function make(file, w, h, hue, seed) {
  if (existsSync(`${OUT}/${file}`)) return;
  const rand = rng(seed);
  const buf = Buffer.alloc(w * h * 3);
  const f1 = 2 + rand() * 4, f2 = 3 + rand() * 5, p = rand() * 6;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = x / w, v = y / h;
      const t = Math.sin(u * f1 + p) * Math.cos(v * f2 - p) * 0.5 + 0.5;
      const light = 0.25 + 0.5 * t + 0.15 * (1 - v);
      const hh = (hue + 60 * t) % 360;
      const c = (1 - Math.abs(2 * light - 1)) * 0.7;
      const k = (n) => (n + hh / 30) % 12;
      const ch = (n) => {
        const m = light - (c / 2);
        return Math.max(0, Math.min(255, (m + c * Math.max(0, Math.min(1, Math.min(k(n) - 3, 9 - k(n))))) * 255 + (rand() - 0.5) * 14));
      };
      const i = (y * w + x) * 3;
      buf[i] = ch(0); buf[i + 1] = ch(8); buf[i + 2] = ch(4);
    }
  }
  await sharp(buf, { raw: { width: w, height: h, channels: 3 } }).jpeg({ quality: 92 }).toFile(`${OUT}/${file}`);
  console.log('generated', file);
}

await make('hero.jpg', 3200, 2000, 205, 1);
for (let i = 1; i <= 24; i++) await make(`gear-${i}.jpg`, 1600, 1067, (i * 37) % 360, 100 + i);
