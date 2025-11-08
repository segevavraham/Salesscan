# 🚀 Quick Setup Guide

## Prerequisites Checklist

Before you begin, make sure you have:

- [ ] Node.js 16+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Google Chrome browser (version 88+)
- [ ] API key from OpenAI or Anthropic (get one below)

## Step-by-Step Setup

### 1. Get an API Key

#### Option A: OpenAI (Recommended for English)

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)
6. **Important**: Add credits to your account ($5-10 recommended)

**Cost**: ~$0.01-0.05 per meeting session with GPT-4 Turbo

#### Option B: Anthropic Claude (Recommended for Hebrew)

1. Go to [Anthropic Console](https://console.anthropic.com)
2. Sign up or log in
3. Navigate to API Keys
4. Create a new key
5. Copy the key
6. Add credits to your account

**Cost**: ~$0.02-0.08 per meeting session with Claude 3 Opus

#### Option C: Custom Backend (Advanced)

Skip this if you don't have your own AI backend.

### 2. Install the Extension

```bash
# Clone the repository
git clone <your-repo-url>
cd Salesscan

# Install dependencies
npm install

# Build the extension
npm run build
```

### 3. Load in Chrome

1. Open Chrome
2. Go to `chrome://extensions/`
3. Toggle "Developer mode" (top right)
4. Click "Load unpacked"
5. Navigate to the `Salesscan/extension` folder
6. Click "Select Folder"

You should now see the Sales Coach AI extension icon in your toolbar!

### 4. Configure Settings

1. Click the extension icon in Chrome toolbar
2. Click the ⚙️ Settings button
3. Configure the following:

#### General Settings
- ✅ Auto-start coaching when joining a meeting (optional)
- ✅ Show real-time suggestions (keep enabled)
- ✅ Save meeting transcripts (optional)

#### Language Settings
- Select your primary language (Hebrew or English)
- Enable multi-language detection if needed

#### AI Provider Configuration
- **AI Provider**: Select OpenAI or Anthropic
- **API Key**: Paste your API key here
- **Model**:
  - For OpenAI: Select "GPT-4 Turbo" (best) or "GPT-3.5 Turbo" (cheaper)
  - For Anthropic: Select "Claude 3 Opus" (best) or "Claude 3 Sonnet" (cheaper)

#### Suggestion Preferences
- **Frequency**: Medium (recommended)
- ✅ Auto-hide suggestions after 30 seconds
- ✅ Detect buying signals
- ✅ Detect objections

5. Click "Save Settings"

### 5. Grant Permissions

When you first use the extension, Chrome will ask for permissions:

1. **Microphone** - Required for speech recognition
   - Click "Allow" when prompted

2. **Tab Capture** - Required to record meeting audio
   - Automatically granted

3. **Notifications** (Optional)
   - Click "Allow" if you want desktop alerts

### 6. Test the Extension

#### Quick Test (No Meeting Required)

1. Open any webpage
2. Click the extension icon
3. Click "Start Coaching"
4. Speak into your microphone
5. Check the console (F12) for transcription logs

#### Full Test (With Meeting)

1. Join a Google Meet test meeting:
   - Go to [meet.google.com/new](https://meet.google.com/new)
   - Start an instant meeting
   - Allow camera/microphone

2. Look for the Sales Coach control panel (top-right corner)

3. Click "Start Coaching"

4. Speak into your microphone:
   - "Hello, how can I help you?"
   - "What is your budget for this project?"

5. You should see transcription in the console (F12)

6. Wait 5-10 seconds for AI suggestions to appear

## Troubleshooting

### Extension Not Appearing

**Problem**: Extension doesn't show in toolbar

**Solutions**:
1. Make sure you selected the `extension` folder (not the parent folder)
2. Check for errors in `chrome://extensions/`
3. Click the puzzle icon in toolbar and pin the extension
4. Refresh Chrome

### No Transcription

**Problem**: Speech recognition not working

**Solutions**:
1. Grant microphone permission
2. Check language setting matches what you're speaking
3. Try speaking louder and clearer
4. Open console (F12) and check for errors
5. Verify Web Speech API support: Open console and type:
   ```javascript
   'webkitSpeechRecognition' in window
   ```
   Should return `true`

### No AI Suggestions

**Problem**: Transcription works but no suggestions appear

**Solutions**:
1. **Check API Key**:
   - Go to Settings
   - Verify API key is correct
   - No spaces or extra characters

2. **Check API Credits**:
   - Log into OpenAI/Anthropic console
   - Verify you have credits
   - Check usage limits

3. **Check Network**:
   - Open console (F12) → Network tab
   - Look for API calls to openai.com or anthropic.com
   - Check for 401/403 errors (API key issues)
   - Check for 429 errors (rate limit)

4. **Check Console Errors**:
   - Open console (F12)
   - Look for red error messages
   - Common errors:
     - "API key invalid" → Check your API key
     - "Rate limit exceeded" → Wait or upgrade plan
     - "Network error" → Check internet connection

### Suggestions Not Showing

**Problem**: API works but overlay doesn't appear

**Solutions**:
1. Check "Show real-time suggestions" is enabled in Settings
2. Open console and look for "Showing suggestion:" logs
3. Try clicking extension icon → ensure coaching is active
4. Check for z-index conflicts with meeting platform
5. Try refreshing the page

### Extension Crashes

**Problem**: Extension stops working randomly

**Solutions**:
1. Check Chrome version: `chrome://version/` (need 88+)
2. Open `chrome://extensions/` → Check for errors
3. Click "Errors" button to see detailed logs
4. Clear extension data:
   - Go to Settings
   - Click "Clear All Data"
   - Restart Chrome
5. Reinstall:
   - Remove extension
   - Delete `Salesscan/extension` folder
   - Pull latest code
   - `npm install && npm run build`
   - Reload extension

## Platform-Specific Setup

### Google Meet

Works out of the box! Just:
1. Go to [meet.google.com](https://meet.google.com)
2. Join any meeting
3. Click "Start Coaching"

### Zoom

1. Go to [zoom.us](https://zoom.us)
2. Join meeting in browser (not desktop app)
3. Allow microphone when prompted
4. Click "Start Coaching"

### Microsoft Teams

1. Use Teams in browser ([teams.microsoft.com](https://teams.microsoft.com))
2. Join meeting
3. Click "Start Coaching"

### Webex

1. Use Webex in browser
2. Join meeting
3. Click "Start Coaching"

## Development Setup

If you want to modify the code:

### Watch Mode
```bash
npm run dev
```

This will:
- Watch for file changes
- Auto-rebuild
- You still need to click "Reload" in `chrome://extensions/`

### Debugging

1. **Background Worker Logs**:
   - Go to `chrome://extensions/`
   - Find Sales Coach AI
   - Click "service worker" link
   - Opens console for background script

2. **Content Script Logs**:
   - Open the meeting page
   - Press F12 for DevTools
   - Check Console tab

3. **Popup Logs**:
   - Right-click extension icon
   - Select "Inspect popup"
   - Opens DevTools for popup

## Next Steps

Now that you're set up:

1. **Try it in a real meeting** - Use it in your next sales call
2. **Customize settings** - Adjust suggestion frequency, language, etc.
3. **Review history** - Check your past sessions and suggestions
4. **Give feedback** - Report issues or request features

## Support

Need help?

- Check [README.md](README.md) for detailed docs
- Check [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
- Open an issue on GitHub
- Email: support@salescoach.ai

## Cost Estimate

### OpenAI GPT-4 Turbo
- Input: $10 per 1M tokens
- Output: $30 per 1M tokens
- **1 hour meeting ≈ 10,000 tokens ≈ $0.50**

### Anthropic Claude 3 Opus
- Input: $15 per 1M tokens
- Output: $75 per 1M tokens
- **1 hour meeting ≈ 10,000 tokens ≈ $0.90**

### Anthropic Claude 3 Sonnet (Cheaper)
- Input: $3 per 1M tokens
- Output: $15 per 1M tokens
- **1 hour meeting ≈ 10,000 tokens ≈ $0.18**

**Recommendation**: Start with GPT-3.5 Turbo or Claude Sonnet for testing, then upgrade to GPT-4 or Opus for production.

---

Happy Selling! 🚀
