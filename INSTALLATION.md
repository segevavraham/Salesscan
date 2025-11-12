# 🚀 Sales Coach AI - Installation Guide

Complete step-by-step guide to set up and run your Sales Coach Chrome Extension.

---

## 📋 Prerequisites

- **Node.js** 16.0.0 or higher
- **npm** 8.0.0 or higher
- **Google Chrome** browser
- **API Keys:**
  - AssemblyAI API Key (for transcription)
  - OpenAI API Key (for AI suggestions)

---

## 🔧 Step 1: Install Dependencies

```bash
# Navigate to project directory
cd Salesscan

# Install all dependencies
npm install
```

This will install:
- Webpack and build tools
- Babel for transpilation
- ESLint and Prettier for code quality
- Testing frameworks

---

## 🎨 Step 2: Generate Icons

The extension requires PNG icons in multiple sizes.

### Quick Method (Online):
1. Go to https://cloudconvert.com/svg-to-png
2. Upload `extension/assets/icons/icon.svg`
3. Convert to PNG at sizes: 16x16, 32x32, 48x48, 128x128
4. Save as `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`
5. Place all files in `extension/assets/icons/`

### Using ImageMagick:
```bash
cd extension/assets/icons/
convert icon.svg -resize 16x16 icon16.png
convert icon.svg -resize 32x32 icon32.png
convert icon.svg -resize 48x48 icon48.png
convert icon.svg -resize 128x128 icon128.png
```

See `extension/assets/icons/GENERATE_ICONS.md` for more methods.

---

## 🏗️ Step 3: Build the Extension

### Development Build (with source maps):
```bash
npm run dev
```

This will:
- Watch for file changes
- Rebuild automatically
- Include source maps for debugging
- Output to `dist/` directory

### Production Build (optimized):
```bash
npm run build
```

This will:
- Minify all code
- Remove source maps
- Optimize bundle size
- Output to `dist/` directory

### Analyze Bundle Size:
```bash
npm run analyze
```

---

## 🔐 Step 4: Get API Keys

### AssemblyAI (Required for Transcription):
1. Sign up at https://www.assemblyai.com/
2. Go to your dashboard
3. Copy your API key
4. Free tier includes **3 hours/month** of transcription

### OpenAI (Required for AI Suggestions):
1. Sign up at https://platform.openai.com/
2. Create an API key
3. Add credits to your account
4. Recommended model: **gpt-4-turbo**

---

## 📦 Step 5: Load Extension in Chrome

### Method 1: Load Unpacked (Development)

1. Open Chrome and navigate to:
   ```
   chrome://extensions/
   ```

2. Enable **Developer mode** (toggle in top right)

3. Click **Load unpacked**

4. Select the `extension/` folder (or `dist/` if you built it)

5. The extension should now appear in your extensions list!

### Method 2: Build and Load (Production)

1. Build the extension:
   ```bash
   npm run build
   ```

2. Load the `dist/` folder in Chrome (same steps as above)

---

## ⚙️ Step 6: Configure the Extension

1. Click the **Sales Coach AI** icon in Chrome toolbar

2. Click **Settings** or right-click → **Options**

3. Enter your API keys:
   - **AssemblyAI Key**: Your transcription API key
   - **OpenAI Key**: Your AI suggestions API key

4. Configure preferences:
   - **Language**: Hebrew (he) or English (en)
   - **Enable Features**: Toggle each feature on/off
     - ✅ Proactive Coaching
     - ✅ Live Transcription
     - ✅ Waveform Visualization
     - ✅ Meeting Stages Tracker
     - ✅ Competitor Intelligence
     - ✅ Price Negotiation Assistant

5. Click **Save Settings**

---

## 🎯 Step 7: Test the Extension

### Supported Platforms:
- ✅ Google Meet (meet.google.com)
- ✅ Zoom (zoom.us)
- ✅ Microsoft Teams (teams.microsoft.com)
- ✅ Webex (webex.com)

### Test It:
1. Open a meeting on one of the supported platforms
2. Click the **Sales Coach AI** toggle button (top right)
3. Allow microphone permissions when prompted
4. The coach will start listening and providing suggestions!

---

## 🎹 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+S` | Start/Stop Sales Coach |
| `Ctrl+Shift+T` | Toggle Transcription Overlay |
| `Ctrl+Shift+W` | Toggle Waveform Visualizer |
| `Ctrl+Shift+A` | Show Analytics Dashboard |
| `Ctrl+Shift+D` | Toggle Proactive Coaching |

---

## 🐛 Troubleshooting

### Extension doesn't load:
- ✅ Check that all PNG icons are generated
- ✅ Verify manifest.json syntax (use a JSON validator)
- ✅ Check Chrome console for errors

### No transcription:
- ✅ Verify AssemblyAI key is correct
- ✅ Check microphone permissions
- ✅ Ensure you're on a supported meeting platform
- ✅ Check browser console for errors

### No AI suggestions:
- ✅ Verify OpenAI key is correct and has credits
- ✅ Check that transcription is working first
- ✅ Monitor API usage in OpenAI dashboard

### High API costs:
- ✅ **AssemblyAI**: ~$0.37/hour of audio
- ✅ **OpenAI GPT-4 Turbo**: ~$0.03 per 1K tokens
- ✅ Disable features you don't need in settings
- ✅ Use GPT-3.5-turbo for lower costs

### Performance issues:
- ✅ Close unnecessary Chrome tabs
- ✅ Disable waveform visualizer if not needed
- ✅ Use production build instead of dev build

---

## 📚 Next Steps

- **Read**: [ARCHITECTURE.md](ARCHITECTURE.md) - Understand the codebase
- **Read**: [ADVANCED_FEATURES.md](ADVANCED_FEATURES.md) - Explore all features
- **Read**: [README_V2.md](README_V2.md) - Full documentation
- **Customize**: Edit coaching rules in `extension/services/proactive-coaching-engine.js`
- **Extend**: Add new meeting platforms in `manifest.json`

---

## 💰 Estimated Costs

### Per Hour of Meeting:
- **AssemblyAI Real-time**: ~$0.37/hour
- **OpenAI GPT-4 Turbo**: ~$0.50-2.00/hour (varies by suggestions)
- **Total**: ~$0.87-2.37 per hour

### Monthly (20 hours):
- **Light use**: ~$17-20/month
- **Heavy use**: ~$40-50/month

### Free Tier Limits:
- **AssemblyAI**: 3 hours/month free
- **OpenAI**: $5 initial credit (expires after 3 months)

---

## 🆘 Need Help?

- **Issues**: https://github.com/YOUR_USERNAME/Salesscan/issues
- **Documentation**: Check all .md files in this repository
- **API Docs**:
  - AssemblyAI: https://www.assemblyai.com/docs
  - OpenAI: https://platform.openai.com/docs

---

**🎉 You're all set! Enjoy your AI-powered sales coaching!**
