# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
# Development
npm install              # Install dependencies
npm run dev             # Development mode with watch (auto-rebuilds on changes)
npm run build           # Production build (minified)

# Code Quality
npm run lint            # Lint code with ESLint
npm run format          # Format code with Prettier

# Analysis
npm run analyze         # Analyze bundle size (opens browser visualization)

# Testing
npm test                # Run Jest tests
```

## Testing the Extension

After building:
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select the `dist/` folder (production) or `extension/` folder (development)
5. Test on supported platforms: Google Meet, Zoom, Microsoft Teams, or Webex
6. Use keyboard shortcuts to trigger features (Ctrl+Shift+S, Ctrl+Shift+T, etc.)

## Architecture Overview

### Chrome Extension Structure (Manifest V3)

This is a Chrome Extension with three main execution contexts:

1. **Background Service Worker** ([background/service-worker.js](extension/background/service-worker.js))
   - Persistent logic and message routing
   - Manages recording state globally
   - Coordinates between content scripts and popup

2. **Content Script** ([content/ultimate-content-script.js](extension/content/ultimate-content-script.js))
   - Injected into meeting pages (Google Meet, Zoom, Teams, Webex)
   - Orchestrates all UI components and services
   - Master coordinator for the entire extension

3. **Popup/Options UI** ([popup/](extension/popup/), [options/](extension/options/))
   - User settings and controls
   - API key configuration
   - Feature toggles

### Critical Architecture Patterns

**Component Orchestration**: The `UltimateSalesCoach` class in [content/ultimate-content-script.js](extension/content/ultimate-content-script.js) is the master orchestrator. It initializes and coordinates all components, services, and manages the lifecycle of:
- UI components (suggestion widget, transcription overlay, waveform, analytics dashboard)
- Services (AssemblyAI transcription, OpenAI streaming, proactive coaching, meeting intelligence)
- State management via [utils/state-manager.js](extension/utils/state-manager.js)

**Real-time Transcription Flow**:
1. Audio captured from user's microphone
2. Sent to AssemblyAI WebSocket ([services/assemblyai-realtime.js](extension/services/assemblyai-realtime.js))
3. Transcripts stream back in real-time
4. Displayed in [components/live-transcription-overlay.js](extension/components/live-transcription-overlay.js)
5. Analyzed by [services/proactive-coaching-engine.js](extension/services/proactive-coaching-engine.js)

**AI Streaming Flow**:
1. Conversation context sent to OpenAI GPT-4 Turbo
2. Response streams back via SSE (Server-Sent Events)
3. [services/openai-streaming.js](extension/services/openai-streaming.js) handles chunked responses
4. [components/advanced-suggestion-widget.js](extension/components/advanced-suggestion-widget.js) displays with typing effect

**Meeting Intelligence Pipeline**:
- [services/meeting-intelligence-suite.js](extension/services/meeting-intelligence-suite.js) contains three specialized analyzers:
  - `MeetingStagesTracker`: Detects sales stages (Warming Up, Discovery, Qualification, Presentation, Closing)
  - `CompetitorIntelligence`: Identifies competitor mentions and provides responses
  - `PriceNegotiationAssistant`: Detects pricing discussions and suggests value-based responses

### API Integrations

**AssemblyAI Real-time WebSocket**:
- Endpoint: `wss://api.assemblyai.com/v2/realtime/ws`
- Requires temporary token obtained from REST API
- Supports Hebrew language (`language_code: 'he'`)
- Includes sentiment analysis, entity detection, and word boosting for sales-specific terms
- Sample rate: 16000 Hz

**OpenAI Streaming API**:
- Endpoint: `https://api.openai.com/v1/chat/completions` with `stream: true`
- Uses GPT-4 Turbo model by default
- Chunked transfer encoding via Server-Sent Events
- Cancellable mid-stream for better UX

## Key Implementation Details

### Module System
- All files use ES6 modules (`import`/`export`)
- Webpack bundles with Babel transpilation to Chrome 88+ compatibility
- Dynamic imports are preserved and copied to `dist/` folder

### State Management
- Centralized via [utils/state-manager.js](extension/utils/state-manager.js)
- Uses reactive pattern with event emitters
- Chrome storage API for persistence

### Keyboard Shortcuts
Implemented in content script, not in manifest (more flexible):
- `Ctrl+Shift+S`: Start/Stop Sales Coach
- `Ctrl+Shift+T`: Toggle Transcription Overlay
- `Ctrl+Shift+W`: Toggle Waveform
- `Ctrl+Shift+A`: Show Analytics Dashboard
- `Ctrl+Shift+D`: Toggle Proactive Coaching

### Audio Visualization
[components/waveform-visualizer.js](extension/components/waveform-visualizer.js) uses:
- Web Audio API for frequency analysis
- HTML5 Canvas for rendering 64-bar spectrum
- RequestAnimationFrame for smooth 60fps updates
- Speaker-aware color transitions (purple for user, cyan for client)

### Proactive Coaching Rules
[services/proactive-coaching-engine.js](extension/services/proactive-coaching-engine.js) implements 15+ intelligent rules:
- Talk ratio monitoring (alert if user talks >60%)
- Buying signal detection (keywords: "interested", "budget", "when can we")
- Objection handling (keywords: "too expensive", "not sure", "need to think")
- Question tracking (encourages discovery questions)
- Silence detection (suggests engagement tactics)

Priority-based display: High > Medium > Low

## Development Notes

### Adding New Components
1. Create in [extension/components/](extension/components/)
2. Import and initialize in [content/ultimate-content-script.js](extension/content/ultimate-content-script.js)
3. Add message handlers if needed
4. Update webpack.config.js if it needs separate bundling

### Adding New Services
1. Create in [extension/services/](extension/services/)
2. Follow existing patterns (constructor with config, connect/disconnect methods)
3. Emit events for state changes
4. Integrate into `UltimateSalesCoach` orchestrator

### API Key Storage
- Stored in Chrome's encrypted storage API: `chrome.storage.local`
- Never logged or exposed in console
- Loaded in `loadConfig()` method of main orchestrator
- Two keys supported: `assemblyAIKey` and `openAIKey`

### Build Output
- Development: Use `extension/` folder directly (faster iteration)
- Production: Use `dist/` folder (minified, optimized)
- Webpack copies all necessary files (manifest, HTML, CSS, assets)
- Service workers and components are copied verbatim (dynamic imports)

### Debugging
- Chrome DevTools: Right-click extension icon > Inspect popup
- Console logs: Inspect service worker via `chrome://extensions/` > Details > Inspect views
- Content script logs: Open DevTools on meeting page
- Use descriptive emoji prefixes in logs (🚀, ✅, ❌, 🔌)

## Common Pitfalls

1. **Manifest V3 Limitations**: Service workers have no DOM access; all UI must be in content scripts
2. **WebSocket Lifecycle**: AssemblyAI WebSocket must be properly closed to avoid resource leaks
3. **Stream Cancellation**: OpenAI streams must be aborted via AbortController when user navigates away
4. **Module Loading**: Dynamic imports require files to be web-accessible-resources in manifest
5. **Audio Context**: Can only start after user interaction (Chrome autoplay policy)
6. **Hebrew Language**: Default language is 'he' (Hebrew) - change in config if needed

## File Organization

- **extension/background/**: Service worker (message routing, state)
- **extension/content/**: Content scripts (v1.0, v2.0, v2.1 - use ultimate-content-script.js)
- **extension/components/**: UI components (overlay, waveform, analytics, etc.)
- **extension/services/**: Business logic (transcription, AI, coaching, intelligence)
- **extension/utils/**: Helper utilities (storage, state, permissions)
- **extension/popup/**: Extension popup interface
- **extension/options/**: Settings page
- **extension/styles/**: CSS files (overlay.css)
- **extension/assets/**: Icons and images

## Language and Localization

- Default language: Hebrew ('he')
- AssemblyAI supports: English, Hebrew, Spanish, French, German, and 30+ languages
- Change via `language` config in storage
- Sales-specific word boosting: "budget", "price", "timeline", "decision"

## Cost Considerations

API costs per hour of meeting:
- AssemblyAI Real-time: ~$0.37/hour
- OpenAI GPT-4 Turbo: ~$0.50-2.00/hour (varies by usage)
- Total: ~$0.87-2.37/hour

Free tiers:
- AssemblyAI: 3 hours/month
- OpenAI: $5 credit (expires after 3 months)
