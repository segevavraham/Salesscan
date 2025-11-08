# 🎯 Sales Coach AI - Chrome Extension v2.1

> Enterprise-grade AI sales coach with real-time streaming transcription, live visualization, proactive coaching, and intelligent meeting insights

[![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-production--ready-brightgreen.svg)](PRODUCTION_READY_CHECKLIST.md)

---

## 📋 Overview

**Sales Coach AI** is a professional Chrome extension that transforms your sales meetings with real-time AI assistance. It combines streaming transcription, live audio visualization, proactive coaching, and intelligent meeting insights to help you close more deals.

Think of it as having an expert sales coach, a transcriptionist, and a data analyst working together during every meeting - all powered by cutting-edge AI.

---

## ✨ Features

### 🎬 Live Experience

#### **Real-time Transcription Overlay**
- Live captions displayed directly on screen (like Google Meet but better)
- Speaker identification with color coding
- Sentiment badges (positive, neutral, negative, objection)
- Confidence indicators
- Auto-scroll and smooth animations
- Keyboard shortcut: `Ctrl+Shift+T`

#### **Waveform Visualizer**
- Beautiful real-time audio visualization
- Speaker-aware color transitions (purple for you, cyan for client)
- 64-bar frequency spectrum analysis
- Volume indicators and recording pulse
- High-performance Canvas rendering
- Keyboard shortcut: `Ctrl+Shift+W`

### 🧠 AI Intelligence

#### **Streaming AI Suggestions**
- GPT-4 Turbo streaming responses
- Real-time typing effect
- Contextual advice based on conversation
- Quick reply buttons
- Cancellable streams
- Sentiment analysis integration

#### **Proactive Coaching Engine**
- 15+ intelligent coaching rules
- Duolingo-style contextual tips
- Talk ratio monitoring
- Buying signal detection
- Objection handling guidance
- Question tracking
- Silence detection
- Priority-based tips (high/medium/low)
- Auto-dismiss timers

### 📊 Meeting Intelligence

#### **Sales Stages Tracker**
- Automatic stage detection:
  - 🤝 Warming Up
  - 🔍 Discovery
  - ✅ Qualification
  - 📊 Presentation
  - 💰 Closing
- Stage progression tracking
- Keyword-based detection

#### **Competitor Intelligence**
- Automatic competitor mention detection
- Pre-loaded responses for common competitors
- Comparison matrix
- Strength highlighting

#### **Price Negotiation Assistant**
- Price discussion detection
- "Too expensive" objection handling
- Value-based pricing responses
- Discount strategy suggestions

### 📈 Analytics Dashboard

- Real-time sentiment chart
- Talk ratio visualization (you vs. client)
- Buying signals counter
- Objections tracker
- Key moments timeline
- Session statistics
- Export capabilities

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 16+ and npm 8+
- Chrome Browser 88+
- [AssemblyAI API Key](https://www.assemblyai.com/) (free 3 hours/month)
- [OpenAI API Key](https://platform.openai.com/)

### 2. Installation
```bash
git clone <your-repo>
cd Salesscan
npm install
```

### 3. Generate Icons
```bash
cd extension/assets/icons/
# See GENERATE_ICONS.md for instructions
```

### 4. Build
```bash
npm run build   # Production
# or
npm run dev     # Development (with watch)
```

### 5. Load in Chrome
1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select `extension/` folder (or `dist/` if built)

### 6. Configure
1. Click extension icon
2. Go to **Settings**
3. Enter API keys
4. Enable features
5. Save

**📖 Detailed guide**: [INSTALLATION.md](INSTALLATION.md)

---

## 🎮 Usage

### Supported Platforms
- ✅ Google Meet (meet.google.com)
- ✅ Zoom (zoom.us)
- ✅ Microsoft Teams (teams.microsoft.com)
- ✅ Webex (webex.com)

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+S` | Start/Stop Sales Coach |
| `Ctrl+Shift+T` | Toggle Transcription Overlay |
| `Ctrl+Shift+W` | Toggle Waveform |
| `Ctrl+Shift+A` | Show Analytics Dashboard |
| `Ctrl+Shift+D` | Toggle Proactive Coaching |

### During a Meeting
1. Join a meeting on any supported platform
2. Click the **Sales Coach** toggle button (top right)
3. Allow microphone permissions
4. Watch as real-time transcription, suggestions, and insights appear!

---

## 🏗️ Architecture

### Technology Stack
- **Transcription**: AssemblyAI Real-time WebSocket API
- **AI**: OpenAI GPT-4 Turbo Streaming
- **Audio**: Web Audio API + Canvas visualization
- **State**: Reactive state management
- **Build**: Webpack 5 + Babel
- **Manifest**: Chrome Extension Manifest V3

### Key Components
| Component | File | Lines | Purpose |
|-----------|------|-------|---------|
| Ultimate Coach | `content/ultimate-content-script.js` | 654 | Master orchestrator |
| Transcription | `components/live-transcription-overlay.js` | 805 | Live captions |
| Waveform | `components/waveform-visualizer.js` | 400+ | Audio visualization |
| Proactive Coach | `services/proactive-coaching-engine.js` | 700+ | Contextual tips |
| Meeting Intel | `services/meeting-intelligence-suite.js` | 800+ | Stages, competitors, pricing |
| AssemblyAI | `services/assemblyai-realtime.js` | 540 | Streaming transcription |
| OpenAI | `services/openai-streaming.js` | 450 | Streaming AI responses |

**📖 Full architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)

---

## 💰 Pricing & Costs

### API Costs (Per Hour of Meeting)
- **AssemblyAI Real-time**: ~$0.37/hour
- **OpenAI GPT-4 Turbo**: ~$0.50-2.00/hour
- **Total**: ~$0.87-2.37 per meeting hour

### Free Tier
- **AssemblyAI**: 3 hours/month free
- **OpenAI**: $5 credit (expires after 3 months)

### Monthly Estimates (20 hours)
- Light use: $17-20/month
- Heavy use: $40-50/month

**💡 Tip**: Use GPT-3.5-turbo instead of GPT-4 to reduce costs by 90%

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [INSTALLATION.md](INSTALLATION.md) | Complete setup guide with troubleshooting |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Technical architecture and design |
| [ADVANCED_FEATURES.md](ADVANCED_FEATURES.md) | Detailed feature documentation |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute to the project |
| [CHANGELOG.md](CHANGELOG.md) | Version history and updates |
| [SECURITY.md](SECURITY.md) | Security best practices |
| [PRODUCTION_READY_CHECKLIST.md](PRODUCTION_READY_CHECKLIST.md) | Deployment readiness |

---

## 🛠️ Development

### Build Commands
```bash
npm run dev          # Development mode with watch
npm run build        # Production build (minified)
npm run lint         # Lint code with ESLint
npm run format       # Format code with Prettier
npm run analyze      # Analyze bundle size
```

### Project Structure
```
Salesscan/
├── extension/
│   ├── background/           # Service worker
│   ├── content/             # Content scripts (v1.0, v2.0, v2.1)
│   ├── components/          # UI components (6 files)
│   ├── services/            # Business logic & APIs (7 files)
│   ├── utils/               # Helper functions (3 files)
│   ├── popup/               # Extension popup
│   ├── options/             # Settings page
│   ├── styles/              # CSS files
│   ├── assets/              # Icons and images
│   └── manifest.json        # Extension configuration
├── webpack.config.js        # Build configuration
├── package.json             # Dependencies
└── docs/                    # Documentation
```

### Tech Stack
- **ES6+** with Babel transpilation
- **Webpack 5** for bundling
- **Chrome Extension Manifest V3**
- **WebSockets** for real-time transcription
- **Server-Sent Events** for streaming AI
- **Web Audio API** for visualization
- **Canvas API** for waveform rendering

---

## 🔒 Privacy & Security

### Data Handling
- ✅ **No data collection** - Everything stays on your device
- ✅ **Encrypted API keys** - Stored in Chrome's secure storage
- ✅ **HTTPS/WSS only** - All communications encrypted
- ✅ **No tracking** - Zero analytics or telemetry

### Third-Party Data Sharing
Data is ONLY sent to:
1. **AssemblyAI** - For transcription (your audio)
2. **OpenAI** - For AI suggestions (transcribed text)

You control both API keys and can revoke access anytime.

### Compliance
- ✅ GDPR compliant
- ✅ CCPA compliant
- ✅ No data sale
- ✅ Right to erasure (uninstall = all data deleted)

**📖 Full security details**: [SECURITY.md](SECURITY.md)

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

**📖 Full guidelines**: [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

**Additional terms**: Users are responsible for API costs and compliance with third-party service terms.

---

## 🎉 Version History

| Version | Date | Highlights |
|---------|------|------------|
| **2.1.0** | 2024-11-08 | Live transcription, waveform, proactive coaching, meeting intelligence |
| **2.0.0** | 2024-11-08 | Streaming transcription & AI, advanced UI, analytics dashboard |
| **1.0.0** | 2024-11-08 | Initial release with core functionality |

**📖 Full changelog**: [CHANGELOG.md](CHANGELOG.md)

---

## 🌟 Roadmap

### v2.2.0 (Planned)
- [ ] Multi-language expansion (Spanish, French, German)
- [ ] Voice fingerprinting for speaker detection
- [ ] Custom coaching rules editor
- [ ] Meeting summaries and automatic notes
- [ ] CRM integrations (Salesforce, HubSpot)

### v3.0.0 (Future)
- [ ] On-device AI (no API costs)
- [ ] Video analysis capabilities
- [ ] Body language detection
- [ ] Team analytics and manager dashboard

---

## 💬 Support

### Need Help?
- 📖 Check [INSTALLATION.md](INSTALLATION.md) for setup issues
- 🐛 Open an issue on GitHub for bugs
- 💡 Use Discussions for questions
- 📧 Email: support@your-domain.com

### Found a Bug?
1. Check existing issues
2. Create a new issue with:
   - Description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Chrome version, extension version, OS

---

## 🙏 Acknowledgments

Built with:
- [AssemblyAI](https://www.assemblyai.com/) - Real-time transcription
- [OpenAI](https://openai.com/) - GPT-4 Turbo AI
- [Chrome Extensions](https://developer.chrome.com/docs/extensions/) - Platform
- [Webpack](https://webpack.js.org/) - Build system
- Inspired by meeting intelligence tools like Gong, Chorus, and Fireflies

---

## 📊 Stats

- **Total Lines of Code**: ~12,000+
- **Components**: 20 JavaScript files
- **Documentation**: ~4,500 lines
- **Features**: 50+ capabilities
- **Development Time**: ~15-20 hours
- **Status**: ✅ Production Ready

---

**Made with ❤️ for sales professionals worldwide**

**⭐ Star this repo** if you find it useful!

