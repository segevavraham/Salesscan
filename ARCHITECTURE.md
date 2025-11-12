# 🏗️ Sales Coach AI - Architecture Documentation

## System Overview

Sales Coach AI is built as a Chrome Extension using Manifest V3. It operates in three main contexts:

1. **Background Service Worker** - Persistent logic
2. **Content Scripts** - Injected into meeting pages
3. **Popup/Options UI** - User interface

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface Layer                   │
├─────────────────────────────────────────────────────────────┤
│  Popup UI          │  Options Page    │  Content Overlay    │
│  - Start/Stop      │  - Settings      │  - Suggestions      │
│  - Stats           │  - API Config    │  - Quick Replies    │
│  - History         │  - Preferences   │  - Control Panel    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Background Service Worker                  │
├─────────────────────────────────────────────────────────────┤
│  - Message Routing                                           │
│  - Recording State Management                                │
│  - AI Request Coordination                                   │
│  - Transcription Buffer Management                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Services Layer                         │
├──────────────────┬──────────────────┬──────────────────────┤
│  Audio Recorder  │  Speech-to-Text  │    AI Coach Engine   │
│                  │                  │                      │
│  - TabCapture    │  - Web Speech    │  - OpenAI/Claude    │
│  - MediaRecorder │    API           │  - Context Analysis  │
│  - Stream Mgmt   │  - Whisper API   │  - Suggestion Gen    │
└──────────────────┴──────────────────┴──────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Storage & Utilities                      │
├──────────────────┬──────────────────────────────────────────┤
│  Storage Manager │  Permissions Manager                      │
│                  │                                           │
│  - Settings      │  - Tab Capture                           │
│  - Transcripts   │  - Microphone                            │
│  - Analytics     │  - Notifications                         │
└──────────────────┴──────────────────────────────────────────┘
```

## Data Flow

### Recording Flow

```
1. User clicks "Start Coaching"
   └→ Popup sends START_RECORDING message to Background

2. Background Service Worker
   └→ Requests tab capture permission
   └→ Gets media stream ID
   └→ Sends RECORDING_STARTED to Content Script

3. Content Script
   └→ Starts Web Speech API recognition
   └→ Displays control panel UI
   └→ Begins listening

4. Audio Processing
   └→ Microphone → Web Speech API → Transcript
   └→ Transcript sent to Background Worker
   └→ Background buffers transcripts

5. AI Analysis
   └→ When client speaks (detected by speaker ID)
   └→ Background sends last 5 messages to AI
   └→ AI analyzes and generates suggestion

6. Display Suggestion
   └→ Background sends SHOW_SUGGESTION to Content Script
   └→ Content Script displays overlay with quick replies
   └→ User can click to copy suggestions
```

### Message Flow

```javascript
// Message types between components:

Popup → Background:
  - START_RECORDING
  - STOP_RECORDING
  - GET_RECORDING_STATUS

Content Script → Background:
  - TRANSCRIPTION_UPDATE
  - REQUEST_SUGGESTION

Background → Content Script:
  - RECORDING_STARTED
  - RECORDING_STOPPED
  - SHOW_SUGGESTION
```

## Key Components

### 1. Background Service Worker

**File**: `extension/background/service-worker.js`

**Responsibilities**:
- Manage global recording state
- Route messages between components
- Buffer transcription data
- Coordinate AI requests
- Manage tab lifecycle

**Key State**:
```javascript
{
  isRecording: boolean,
  currentTabId: number,
  mediaRecorder: MediaRecorder,
  audioChunks: Blob[],
  transcriptionBuffer: Transcript[]
}
```

### 2. Content Script

**File**: `extension/content/content-script.js`

**Responsibilities**:
- Inject overlay UI into meeting pages
- Handle speech recognition
- Display suggestions
- Manage control panel
- Detect meeting platform

**Key Methods**:
- `startRecording()` - Initialize speech recognition
- `stopRecording()` - Clean up resources
- `showSuggestion()` - Display AI suggestion overlay
- `detectMeetingPlatform()` - Identify Zoom/Meet/Teams/Webex

### 3. Audio Recorder Service

**File**: `extension/services/audio-recorder.js`

**Responsibilities**:
- Capture tab audio using Chrome TabCapture API
- Record audio chunks
- Create audio blobs for processing

**API Used**:
- `chrome.tabCapture.getMediaStreamId()`
- `MediaRecorder` API

### 4. Speech-to-Text Service

**File**: `extension/services/speech-to-text.js`

**Two Implementations**:

#### Web Speech API (Real-time, Free)
```javascript
const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'he-IL';
```

**Pros**:
- Free
- Real-time
- No API calls needed

**Cons**:
- Browser-dependent
- Less accurate for Hebrew
- Requires internet

#### OpenAI Whisper API (Batch, Paid)
```javascript
// Send audio blob to Whisper API
POST https://api.openai.com/v1/audio/transcriptions
```

**Pros**:
- Very accurate
- Excellent Hebrew support
- Multiple languages

**Cons**:
- Costs money
- Batch processing (not real-time)
- Requires audio upload

### 5. AI Coach Engine

**File**: `extension/services/ai-coach.js`

**Responsibilities**:
- Analyze conversation context
- Generate actionable suggestions
- Detect buying signals
- Identify objections
- Provide quick reply options

**AI Providers Supported**:

#### OpenAI (GPT-4)
```javascript
POST https://api.openai.com/v1/chat/completions
{
  model: "gpt-4-turbo-preview",
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: conversationContext }
  ]
}
```

#### Anthropic (Claude)
```javascript
POST https://api.anthropic.com/v1/messages
{
  model: "claude-3-opus-20240229",
  system: systemPrompt,
  messages: conversationHistory
}
```

#### Custom Backend
You can implement your own backend that:
- Receives conversation context
- Runs your custom AI model
- Returns suggestions in the expected format

**Expected Response Format**:
```javascript
{
  suggestion: "Ask about their budget and timeline",
  quickReplies: [
    "What's your budget for this project?",
    "When are you looking to get started?",
    "What are your main goals?"
  ],
  reasoning: "Client expressed interest but hasn't discussed specifics",
  signals: ["interest", "timeline_discussion"],
  confidence: 0.85
}
```

## Storage Structure

### Chrome Storage Schema

```javascript
{
  // Settings
  settings: {
    autoStart: boolean,
    language: string,
    aiProvider: 'openai' | 'anthropic' | 'custom',
    apiKey: string,
    model: string,
    // ... more settings
  },

  // Stats
  stats: {
    sessionsToday: number,
    totalSuggestions: number,
    totalTranscripts: number
  },

  // Recent Suggestions
  recentSuggestions: [
    {
      message: string,
      timestamp: number,
      quickReplies: string[]
    }
  ],

  // Transcripts (if enabled)
  transcripts: [
    {
      id: string,
      timestamp: number,
      platform: string,
      duration: number,
      messages: [
        { speaker: string, text: string, timestamp: number }
      ]
    }
  ]
}
```

## Security Considerations

### 1. API Key Storage
- Stored in Chrome Storage (encrypted by Chrome)
- Never logged or transmitted except to API
- Can be cleared by user

### 2. Permissions
Required permissions:
- `activeTab` - Access current tab
- `tabCapture` - Capture audio
- `storage` - Store settings
- `scripting` - Inject content scripts

### 3. Data Privacy
- No audio uploaded unless using Whisper API
- Transcripts stored locally only
- User can configure retention period
- Clear data anytime

### 4. Content Security Policy
```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

## Performance Optimization

### 1. Lazy Loading
- Services loaded only when needed
- Content script injected only on meeting pages

### 2. Debouncing
- AI requests debounced to avoid excessive API calls
- Only analyze when client finishes speaking (isFinal = true)

### 3. Buffer Management
- Keep only last 5 transcript messages in buffer
- Clear old transcripts based on retention settings

### 4. Memory Management
- Stop media streams when recording stops
- Clean up event listeners on disconnect
- Use service worker keepalive only when recording

## Testing Strategy

### Unit Tests
```javascript
// Test AI Coach Service
test('generates valid suggestions', async () => {
  const coach = new AICoachService({ provider: 'mock' });
  const suggestion = await coach.analyzeMeeting('Client: What is the price?');
  expect(suggestion).toHaveProperty('quickReplies');
});
```

### Integration Tests
```javascript
// Test full flow
test('recording to suggestion flow', async () => {
  // 1. Start recording
  // 2. Send mock transcript
  // 3. Verify AI called
  // 4. Verify suggestion displayed
});
```

### Manual Testing
1. Load extension in Chrome
2. Open test meeting
3. Start coaching
4. Verify transcription
5. Verify suggestions appear
6. Test all settings

## Deployment

### Building for Production

```bash
npm run build
```

This will:
1. Bundle JavaScript with Webpack
2. Minify CSS
3. Optimize images
4. Create `extension.zip` for Chrome Web Store

### Publishing to Chrome Web Store

1. Create developer account
2. Prepare assets:
   - Icon (128x128)
   - Screenshots
   - Promotional images
3. Upload ZIP file
4. Fill in store listing
5. Submit for review

## Monetization Implementation

### License Verification Flow

```javascript
// On extension load
async function verifyLicense() {
  const { licenseKey } = await chrome.storage.local.get('licenseKey');

  if (!licenseKey) {
    return { tier: 'free', features: FREE_FEATURES };
  }

  // Verify with backend
  const response = await fetch('https://your-api.com/verify-license', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ licenseKey })
  });

  const license = await response.json();

  return {
    tier: license.tier,
    features: license.features,
    expiresAt: license.expiresAt
  };
}
```

### Feature Gating

```javascript
// Check before allowing feature
async function canUseFeature(feature) {
  const license = await getLicense();

  const featureMap = {
    'unlimited_sessions': ['pro', 'enterprise'],
    'all_platforms': ['pro', 'enterprise'],
    'advanced_ai': ['pro', 'enterprise'],
    'analytics': ['enterprise']
  };

  return featureMap[feature].includes(license.tier);
}
```

## Future Enhancements

### 1. Backend API (Optional)
For advanced features:
```
- User authentication
- Cloud transcript storage
- Team analytics
- Custom AI model training
- CRM integrations
```

### 2. Advanced AI Features
```
- Speaker diarization (who said what)
- Sentiment analysis
- Deal scoring
- Auto-generated summaries
- Follow-up email drafting
```

### 3. Integrations
```
- Salesforce - Auto-log calls
- HubSpot - Create deals
- Slack - Send summaries
- Email - Send follow-ups
```

## Troubleshooting

### Common Issues

**Issue**: Speech recognition not working
**Solution**:
- Check microphone permissions
- Verify Web Speech API support
- Try different language setting

**Issue**: No AI suggestions
**Solution**:
- Verify API key
- Check network connection
- Review console errors
- Test API directly

**Issue**: Extension crashes
**Solution**:
- Check Chrome version
- Review service worker logs
- Clear extension data
- Reinstall extension

## Resources

- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Anthropic API Docs](https://docs.anthropic.com)

---

For questions or contributions, please see the main README.md
