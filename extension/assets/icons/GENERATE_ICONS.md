# Icon Generation Instructions

This directory contains the source SVG icon for Sales Coach AI.

## Quick Method (Online)

1. Open https://cloudconvert.com/svg-to-png
2. Upload `icon.svg`
3. Convert to PNG with these sizes:
   - 16x16 → save as `icon16.png`
   - 32x32 → save as `icon32.png`
   - 48x48 → save as `icon48.png`
   - 128x128 → save as `icon128.png`

## Using ImageMagick (Command Line)

If you have ImageMagick installed:

```bash
# Navigate to this directory
cd extension/assets/icons/

# Generate all sizes
convert icon.svg -resize 16x16 icon16.png
convert icon.svg -resize 32x32 icon32.png
convert icon.svg -resize 48x48 icon48.png
convert icon.svg -resize 128x128 icon128.png
```

## Using Node.js (npm package)

Install the package:
```bash
npm install -g svg2img
```

Then run:
```bash
svg2img icon.svg -o icon16.png -w 16 -h 16
svg2img icon.svg -o icon32.png -w 32 -h 32
svg2img icon.svg -o icon48.png -w 48 -h 48
svg2img icon.svg -o icon128.png -w 128 -h 128
```

## Using Figma/Adobe Illustrator

1. Open `icon.svg` in Figma or Illustrator
2. Export as PNG at each required size
3. Save with the correct filenames

## Required Files

After generation, you should have:
- ✅ icon16.png (16x16)
- ✅ icon32.png (32x32)
- ✅ icon48.png (48x48)
- ✅ icon128.png (128x128)

These files are referenced in `manifest.json` and are required for the Chrome Extension to work properly.
