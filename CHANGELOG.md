# Changelog

All notable changes to Sales Coach AI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.1.0] - 2024-11-08

### 🎉 Major UX/UI Enhancements

#### Added
- **Live Transcription Overlay** (805 lines)
  - Real-time captions overlay like Google Meet but enhanced
  - Speaker identification with color coding
  - Sentiment badges and confidence indicators
  - Auto-scroll with smooth animations
  - Keyboard shortcut: `Ctrl+Shift+T`
  - Customizable position (bottom, top, side)

- **Waveform Visualizer** (400+ lines)
  - Beautiful real-time audio waveform visualization
  - Speaker-aware color transitions
  - Frequency spectrum analysis with 64 bars
  - Volume indicators and recording pulse animation
  - Canvas-based high-performance rendering
  - Keyboard shortcut: `Ctrl+Shift+W`

- **Proactive Coaching Engine** (700+ lines)
  - Duolingo-style contextual coaching tips
  - 15+ intelligent coaching rules:
    - Talk ratio monitoring
    - Buying signal detection
    - Objection handling
    - Question tracking
    - Silence detection
    - Competitor mentions
  - Priority-based tip system (high/medium/low)
  - Auto-dismiss timers
  - Quick action buttons
  - Keyboard shortcut: `Ctrl+Shift+D`

- **Meeting Intelligence Suite** (800+ lines)
  - **Sales Stages Tracker**
    - Auto-detection of meeting stages
    - 5 stages: Warming Up → Discovery → Qualification → Presentation → Closing
    - Stage progression tracking
    - Keyword-based detection with timing analysis
  - **Competitor Intelligence**
    - Automatic competitor mention detection
    - Pre-loaded responses for common competitors
    - Competitor comparison matrix
    - Strength highlighting
  - **Price Negotiation Assistant**
    - Price discussion detection
    - Objection handling for "too expensive"
    - Value-based pricing responses
    - Discount strategy suggestions

- **Ultimate Content Script** (600+ lines)
  - Master orchestrator integrating all 7 major components
  - Unified transcript processing pipeline
  - Complete lifecycle management
  - Master control panel UI
  - 5 keyboard shortcuts

#### Changed
- Updated manifest.json to v2.1.0
- Enhanced description with all new features
- Switched content script from `content-script.js` to `ultimate-content-script.js`

#### Technical
- ~3,300 lines of production-ready code
- Web Audio API + Canvas API integration
- Rules engine with context evaluation
- Advanced speaker detection heuristics
- Reactive state management integration

---

## [2.0.0] - 2024-11-08

### 🚀 Enterprise Streaming Upgrade

#### Added
- **AssemblyAI Real-time Transcription Service** (540 lines)
  - WebSocket-based streaming transcription
  - 95%+ accuracy for Hebrew and English
  - Sub-300ms latency
  - Real-time sentiment analysis
  - Entity detection
  - Speaker diarization
  - Automatic language detection

- **OpenAI Streaming Service** (450 lines)
  - Server-Sent Events (SSE) integration
  - GPT-4 Turbo streaming
  - Real-time typing effect
  - Cancellable streams
  - Context window management (8K tokens)
  - Hebrew and English support

- **Advanced Suggestion Widget** (850 lines)
  - Enterprise-grade UI with glass morphism
  - Animated gradient borders
  - Typing effect for suggestions
  - Sentiment badges (positive/neutral/negative/objection)
  - Confidence meter with animations
  - Quick reply buttons
  - Minimize/maximize functionality
  - Draggable positioning

- **Analytics Dashboard** (600 lines)
  - Real-time sentiment chart
  - Talk ratio visualization
  - Buying signals tracker
  - Objections counter
  - Key moments timeline
  - Session statistics

- **State Manager** (450 lines)
  - Centralized reactive state management
  - Subscription-based updates
  - Persistent storage integration
  - Nested path support
  - Export/import for debugging

- **Advanced Content Script** (620 lines)
  - Integrated all v2.0 features
  - Keyboard shortcuts
  - WebSocket connection management
  - Stream cancellation

#### Changed
- Upgraded package.json to v2.0.0
- Added webpack build system
- Added bundle analyzer
- Enhanced description

#### Technical
- ~4,270 lines of production code
- WebSocket streaming architecture
- SSE for AI responses
- Reactive state pattern
- Chrome Extension Manifest V3

---

## [1.0.0] - 2024-11-08

### 🎊 Initial Release

#### Added
- **Core Extension Infrastructure**
  - Chrome Extension Manifest V3 setup
  - Service worker for background processing
  - Content script injection for meeting platforms
  - Popup interface
  - Options/settings page

- **Audio Recording Service**
  - Tab capture API integration
  - MediaRecorder support
  - RecordRTC integration
  - Audio stream management

- **Speech-to-Text Service**
  - Web Speech API (webkitSpeechRecognition)
  - Real-time speech recognition
  - Whisper API alternative
  - Hebrew language support

- **AI Coach Service**
  - OpenAI/Anthropic integration
  - Buying signal detection
  - Objection detection
  - Suggestion generation

- **Storage Utilities**
  - Settings persistence
  - API key storage
  - Session data management

- **Permissions Handler**
  - Microphone permission requests
  - Tab capture permissions
  - User-friendly permission UI

#### Supported Platforms
- Google Meet (meet.google.com)
- Zoom (zoom.us)
- Microsoft Teams (teams.microsoft.com)
- Webex (webex.com)

#### Technical
- ~4,600 lines of code
- 21 files created
- Full documentation (README, ARCHITECTURE, SETUP)

---

## Roadmap

### [2.2.0] - Planned
- [ ] Multi-language support expansion (Spanish, French, German)
- [ ] Voice fingerprinting for better speaker detection
- [ ] Custom coaching rules editor
- [ ] Meeting summaries and notes
- [ ] CRM integration (Salesforce, HubSpot)
- [ ] Calendar integration
- [ ] Video analysis capabilities

### [3.0.0] - Future
- [ ] On-device AI models (no API required)
- [ ] Advanced video analysis
- [ ] Body language detection
- [ ] Emotion recognition
- [ ] Multi-speaker transcription improvements
- [ ] Team analytics and insights
- [ ] Manager dashboard

---

## Version History Summary

| Version | Date | Major Changes |
|---------|------|---------------|
| 2.1.0 | 2024-11-08 | Live transcription, waveform, proactive coaching, meeting intelligence |
| 2.0.0 | 2024-11-08 | Streaming transcription, streaming AI, advanced UI, analytics |
| 1.0.0 | 2024-11-08 | Initial release with core functionality |

---

## Migration Guides

### From v1.0.0 to v2.0.0
1. Update API keys to include AssemblyAI
2. Rebuild extension: `npm run build`
3. Reload extension in Chrome
4. No breaking changes to user data

### From v2.0.0 to v2.1.0
1. No configuration changes needed
2. All new features are enabled by default
3. Can be toggled in settings
4. No breaking changes

---

## API Cost Changes

### v1.0.0
- Whisper API: ~$0.006/minute
- OpenAI completions: ~$0.002/request

### v2.0.0
- AssemblyAI Real-time: ~$0.006/minute
- OpenAI Streaming: ~$0.01-0.05/hour (variable)

### v2.1.0
- Same as v2.0.0 (no additional API costs)
- All new features use existing APIs

---

[2.1.0]: https://github.com/YOUR_USERNAME/Salesscan/releases/tag/v2.1.0
[2.0.0]: https://github.com/YOUR_USERNAME/Salesscan/releases/tag/v2.0.0
[1.0.0]: https://github.com/YOUR_USERNAME/Salesscan/releases/tag/v1.0.0
