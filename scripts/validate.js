const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generateLab7Assets() {
  const rawPath = path.join(__dirname, '../public/asset/raw/aster-logo-orig.png');
  const optimizedDir = path.join(__dirname, '../public/asset/optimized');
  const outputPath = path.join(optimizedDir, 'aster-logo-1x1.webp');

  if (!fs.existsSync(optimizedDir)) {
    fs.mkdirSync(optimizedDir, { recursive: true });
  }

  // Exact 1:1 square crop centered on the logo mark
  await sharp(rawPath)
    .resize(512, 512, {
      fit: 'cover',
      position: 'centre'
    })
    .webp({ quality: 90 })
    .toFile(outputPath);

  console.log('Successfully generated Lab 7 1:1 framed asset at:', outputPath);
}

generateLab7Assets().catch(console.error);
