// Frames real GuildOS screenshots (from GuildOS/docs/screenshots) into
// lightweight WebP images with a transparent background, so they sit well on
// both GitHub themes. The screenshots themselves are not edited.
//   node showcase.mjs <path-to-GuildOS/docs/screenshots>
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const SRC = process.argv[2];
if (!SRC) throw new Error('usage: node showcase.mjs <GuildOS/docs/screenshots>');
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'screens');
fs.mkdirSync(OUT, { recursive: true });

const roundMask = (w, h, r) =>
  Buffer.from(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" fill="#fff"/></svg>`);
const border = (w, h, r, stroke, sw) =>
  Buffer.from(`<svg width="${w}" height="${h}"><rect x="${sw / 2}" y="${sw / 2}" width="${w - sw}" height="${h - sw}" rx="${r}" fill="none" stroke="${stroke}" stroke-width="${sw}"/></svg>`);

async function rounded(file, width, radius, stroke = '#2A3A5C', strokeWidth = 2) {
  const img = sharp(path.join(SRC, file)).resize({ width });
  const { data, info } = await img.png().toBuffer({ resolveWithObject: true });
  return sharp(data)
    .composite([
      { input: roundMask(info.width, info.height, radius), blend: 'dest-in' },
      { input: border(info.width, info.height, radius, stroke, strokeWidth) },
    ])
    .png()
    .toBuffer({ resolveWithObject: true });
}

// 1) Desktop dashboard + phone, side by side.
{
  const W = 1600;
  const H = 870;
  const desk = await rounded('overview.png', 1320, 20);
  const phone = await rounded('mobile-overview.png', 330, 34, '#3A4A6C', 8);
  await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([
      { input: desk.data, left: 0, top: 8 },
      { input: phone.data, left: W - phone.info.width - 10, top: H - phone.info.height - 4 },
    ])
    .webp({ quality: 80, alphaQuality: 90 })
    .toFile(path.join(OUT, 'guildos-showcase.webp'));
}

// 2) Two feature screens for the details panel.
for (const name of ['automation-studio', 'permission-matrix']) {
  const shot = await rounded(`${name}.png`, 1200, 18);
  await sharp(shot.data).webp({ quality: 78, alphaQuality: 90 }).toFile(path.join(OUT, `guildos-${name}.webp`));
}

for (const f of fs.readdirSync(OUT)) console.log(`${(fs.statSync(path.join(OUT, f)).size / 1024).toFixed(0).padStart(5)} KB  assets/screens/${f}`);
