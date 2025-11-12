# Icons

You need to create icon files in the following sizes:

- `icon16.png` - 16x16 pixels (toolbar)
- `icon32.png` - 32x32 pixels (toolbar retina)
- `icon48.png` - 48x48 pixels (extensions page)
- `icon128.png` - 128x128 pixels (Chrome Web Store)

## Design Guidelines

### Concept
The icon should represent a sales coach or AI assistant:
- 🎯 Target/goal (sales focus)
- 💡 Light bulb (suggestions)
- 🤖 Robot face (AI)
- 🎤 Microphone (voice recognition)
- 📊 Graph trending up (sales)

### Recommended Design
A combination of:
- Primary: Target icon with AI/tech elements
- Colors: Purple gradient (#667eea to #764ba2)
- Style: Modern, rounded, friendly

### Tools to Create Icons

1. **Figma** (Free, Online)
   - Go to figma.com
   - Create 128x128 artboard
   - Design your icon
   - Export as PNG in all sizes

2. **Canva** (Free, Online)
   - Use custom dimensions
   - Export in all sizes

3. **GIMP** (Free, Desktop)
   - Open source image editor
   - Scale to different sizes

4. **Adobe Illustrator** (Paid)
   - Professional tool
   - Export to PNG

### Quick Placeholder Icons

For testing, you can use emojis as placeholder:

```bash
# Use an emoji-to-png converter or screenshot emojis:
🎯 - Main icon (target)
```

### Chrome Web Store Assets

For publishing, you'll also need:
- **Small promo tile**: 440x280 pixels
- **Large promo tile**: 920x680 pixels
- **Marquee**: 1400x560 pixels
- **Screenshots**: 1280x800 or 640x400 pixels (3-5 screenshots)

### Example Icon Structure

```
icon128.png
├─ Purple gradient background
├─ White target/bullseye icon
└─ Small microphone or AI accent
```

## Generate Icons Online

Quick option:
1. Go to https://www.favicon-generator.org/
2. Upload a base image
3. Download all sizes

## AI-Generated Icons

Use AI tools:
1. **DALL-E** or **Midjourney**
   - Prompt: "Modern app icon for AI sales coach, purple gradient, target symbol, minimalist, flat design"

2. **Stable Diffusion**
   - Similar prompt
   - Generate and export

## Temporary Solution

Until you have custom icons, the extension will use Chrome's default extension icon. The extension will still work perfectly, but won't look as professional in the toolbar.
