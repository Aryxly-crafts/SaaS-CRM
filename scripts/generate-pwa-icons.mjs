import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.resolve(process.cwd(), 'public');
const iconsDir = path.join(publicDir, 'icons');
const sourceLogo = path.join(publicDir, 'logo-mark.png');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

async function generate() {
  console.log('Generating PWA icons from:', sourceLogo);

  // 1. Standard 192x192 icon
  await sharp(sourceLogo)
    .resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(iconsDir, 'icon-192.png'));

  // 2. Standard 512x512 icon
  await sharp(sourceLogo)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(iconsDir, 'icon-512.png'));

  // 3. Maskable 192x192 with safe zone padding
  const inner192 = await sharp(sourceLogo)
    .resize(150, 150, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 192,
      height: 192,
      channels: 4,
      background: { r: 47, g: 126, b: 218, alpha: 1 }, // #2f7eda brand color
    },
  })
    .composite([{ input: inner192, gravity: 'center' }])
    .png()
    .toFile(path.join(iconsDir, 'icon-maskable-192.png'));

  // 4. Maskable 512x512 with safe zone padding
  const inner512 = await sharp(sourceLogo)
    .resize(400, 400, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 47, g: 126, b: 218, alpha: 1 }, // #2f7eda brand color
    },
  })
    .composite([{ input: inner512, gravity: 'center' }])
    .png()
    .toFile(path.join(iconsDir, 'icon-maskable-512.png'));

  // 5. Apple touch icon 180x180 (placed directly in public)
  const appleInner = await sharp(sourceLogo)
    .resize(140, 140, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: appleInner, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  console.log('Successfully generated all PWA icons!');
}

generate().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
