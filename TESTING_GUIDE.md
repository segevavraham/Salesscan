# Testing Guide - Sales Coach AI Extension

## Prerequisites

Before testing, you need **TWO API keys**:

### 1. AssemblyAI API Key (for transcription)
- Sign up at: https://www.assemblyai.com/dashboard/signup
- Free tier includes: **3 hours/month** of transcription
- Get your API key from: https://www.assemblyai.com/app/account

### 2. OpenAI API Key (for AI coaching)
- Sign up at: https://platform.openai.com/signup
- Get your API key from: https://platform.openai.com/api-keys
- Note: Requires payment method, but very affordable (~$0.50-2.00/hour)

---

## Installation Steps

### Step 1: Build the Extension
```bash
npm install
npm run build
```

### Step 2: Load in Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **"Developer mode"** (top right toggle)
3. Click **"Load unpacked"**
4. Select the `dist/` folder from this project
5. The extension should now appear in your extensions list

### Step 3: Configure API Keys
1. Click the extension icon in Chrome toolbar
2. Click **"Settings"** or right-click the icon → **"Options"**
3. Enter your **AssemblyAI API Key**
4. Enter your **OpenAI API Key**
5. Select your preferred language (default: Hebrew)
6. Click **"Save Settings"**

---

## How to Test

### Test 1: Basic Functionality Test
1. Go to any website (e.g., Google.com)
2. Look for the **Sales Coach AI** control panel in the top-right corner
3. Click **"Start Coaching"**
4. Allow microphone access when prompted
5. Start speaking (in Hebrew or English)
6. You should see:
   - ✅ **Live transcription** appearing in real-time
   - ✅ **Waveform visualizer** showing audio levels
   - ✅ **AI suggestions** after you speak
   - ✅ **Meeting stage tracker** on the left side

### Test 2: Real Meeting Test (Google Meet)
1. Create a test Google Meet: https://meet.google.com/new
2. Join the meeting
3. Click **"Start Coaching"** in the Sales Coach panel
4. Have a conversation (simulate client interaction):
   - Ask questions like: "What challenges are you facing?"
   - Mention competitors: "We're also looking at Salesforce"
   - Discuss pricing: "What's your pricing model?"
5. Observe the AI suggestions appearing in real-time
6. Check the analytics dashboard (click 📊 button)

### Test 3: Feature Testing

#### Keyboard Shortcuts
- `Ctrl + Shift + S` - Start/Stop coaching
- `Ctrl + Shift + A` - Show analytics dashboard
- `Ctrl + T` - Toggle transcription overlay
- `Ctrl + Shift + H` - Hide all overlays

#### Proactive Coaching
The system will show coaching cards when:
- You talk too much (>70% talk ratio)
- Client is quiet (<30% talk ratio)
- Long silence (>20 seconds)
- Buying signals detected ("interested", "budget", "timeline")
- Price objections ("too expensive", "cheaper option")
- Competitor mentioned (Salesforce, HubSpot, Zoom, etc.)

#### Meeting Intelligence
- **Stage Tracker**: Watch the left panel track your meeting stage
- **Competitor Cards**: Mention "Salesforce" or "HubSpot" to see intelligent responses
- **Price Assistant**: Say "too expensive" or "discount" to get negotiation tips

---

## Troubleshooting

### Problem: "API keys are missing" error
**Solution**:
1. Right-click extension icon → Options
2. Enter both API keys
3. Click Save Settings
4. Refresh the page and try again

### Problem: Microphone not working
**Solution**:
1. Check browser permissions: `chrome://settings/content/microphone`
2. Ensure the website has microphone access
3. Try clicking "Start Coaching" again

### Problem: No transcription appearing
**Solution**:
1. Check console (F12) for errors
2. Verify AssemblyAI API key is correct
3. Ensure you're speaking loudly enough
4. Check your internet connection

### Problem: No AI suggestions
**Solution**:
1. Verify OpenAI API key is correct
2. Check browser console for 401/403 errors
3. Ensure you have OpenAI credit/billing set up
4. Wait a few seconds - the AI needs time to process

### Problem: Extension not loading on meeting sites
**Solution**:
1. Check that the extension is enabled in `chrome://extensions/`
2. Refresh the meeting page (F5)
3. Try reloading the extension (toggle off/on in extensions page)

---

## Expected Behavior

### When Working Correctly:

1. **Starting the coach:**
   ```
   Console should show:
   🚀 Initializing Ultimate Sales Coach v2.1...
   📋 Config loaded: { assemblyAIKey: '✅ Set', openAIKey: '✅ Set' }
   ✅ Ultimate Sales Coach ready!
   🎬 Starting Ultimate Sales Coach...
   🎤 Requesting microphone access...
   ✅ Microphone access granted
   🔌 Connecting to AssemblyAI...
   ✅ AssemblyAI connected and streaming
   🤖 Initializing OpenAI...
   ✅ OpenAI initialized
   ✅ Ultimate Sales Coach active!
   ```

2. **During transcription:**
   ```
   📝 Final transcript: { text: "Hello, how are you?", confidence: 0.95 }
   ```

3. **AI suggestions:**
   - Should appear within 2-3 seconds after you stop speaking
   - Should stream in character-by-character (typewriter effect)
   - Should include analysis, strategy, and quick replies

---

## Performance Metrics

### CPU Usage
- **Idle**: ~2-5%
- **Recording**: ~10-15%
- **With AI processing**: ~20-30%

### Memory Usage
- **Initial**: ~50-100 MB
- **During session**: ~150-250 MB
- **After 30 minutes**: ~300-400 MB

### Network Usage
- **AssemblyAI streaming**: ~50-100 KB/sec
- **OpenAI requests**: ~5-10 KB per suggestion
- **Total per hour**: ~200-400 MB

### API Costs (per hour of meeting)
- **AssemblyAI**: ~$0.37/hour
- **OpenAI GPT-4 Turbo**: ~$0.50-2.00/hour
- **Total**: ~$0.87-2.37/hour

---

## Development Testing

### Run in Development Mode
```bash
npm run dev
```
This enables:
- Source maps for debugging
- Faster rebuild on file changes
- Non-minified code

### Watch Mode
```bash
npm run dev
# Keep this running in terminal
# Edit files - auto-rebuilds
# Refresh Chrome extension to see changes
```

### Console Debugging
1. Open DevTools (F12) on the meeting page
2. Look for logs prefixed with emojis:
   - 🚀 Initialization
   - ✅ Success
   - ❌ Errors
   - 📝 Transcripts
   - 🤖 AI responses

---

## Known Issues

1. **First-time microphone permission**: May need to refresh page after granting permission
2. **Hebrew language**: Works best with clear speech, may struggle with heavy accents
3. **Background noise**: Use a good microphone for best results
4. **Long meetings**: Memory usage increases over time (refresh page after 2+ hours)

---

## Success Criteria

✅ Extension loads without errors
✅ API keys are accepted and saved
✅ Microphone access is granted
✅ Real-time transcription appears
✅ Waveform visualizer shows audio levels
✅ AI suggestions generate and display
✅ Proactive coaching cards appear
✅ Meeting stage tracker updates
✅ Competitor intelligence triggers correctly
✅ Price negotiation assistant activates
✅ Analytics dashboard shows data

---

## Next Steps After Testing

1. **Report Issues**: Document any bugs or unexpected behavior
2. **Feature Requests**: Note any missing features or improvements
3. **Performance**: Monitor CPU/memory usage during long sessions
4. **API Costs**: Track actual API usage costs
5. **User Experience**: Note any UX improvements needed

---

## Support

If you encounter issues:
1. Check the console (F12) for error messages
2. Review this guide's troubleshooting section
3. Verify API keys are correct and have sufficient quota
4. Try the extension on a different website
5. Rebuild with `npm run build` and reload extension

---

## Quick Test Script

Here's a conversation script to test all features:

```
You: "Hi, thanks for joining the call today. Tell me about your business."
[Wait for transcription and AI suggestion]

You: "What challenges are you currently facing with sales?"
[Expect discovery-stage detection]

You: "Have you looked at any competitors like Salesforce or HubSpot?"
[Expect competitor intelligence card]

You: "Let me tell you about our pricing. It starts at $99 per month..."
[Wait for client response about price]

You: "I understand the budget concern. Let's talk about ROI..."
[Expect price negotiation assistant]

You: "When would you like to move forward with this?"
[Expect closing stage detection]
```

---

**Happy Testing! 🚀**
