import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const iconSizes = [16, 32, 48, 128];
const svgPath = join(__dirname, 'extension', 'assets', 'icons', 'icon.svg');
const outputDir = join(__dirname, 'extension', 'assets', 'icons');

async function generateIcons() {
  try {
    const svgBuffer = readFileSync(svgPath);
    
    for (const size of iconSizes) {
      const outputPath = join(outputDir, `icon${size}.png`);
      
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Created ${outputPath} (${size}x${size})`);
    }
    
    console.log('\n🎉 All icons generated successfully!');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();


