# 🎯 Sales Coach AI - Chrome Extension

> AI-powered real-time sales coaching extension that provides intelligent suggestions during sales meetings

## 📋 Overview

Sales Coach AI is a Chrome extension that listens to your sales meetings in real-time, transcribes the conversation, and uses AI to provide actionable suggestions and response recommendations. It's like having an expert sales coach whispering in your ear during every meeting.

### ✨ Key Features

- **🎤 Real-time Audio Transcription** - Uses Web Speech API for live speech-to-text
- **🤖 AI-Powered Suggestions** - Integrates with OpenAI GPT-4, Anthropic Claude, or custom AI backends
- **💡 Smart Recommendations** - Provides 2-3 quick response options based on conversation context
- **🎯 Buying Signal Detection** - Automatically identifies when prospects show interest
- **⚠️ Objection Detection** - Alerts you when prospects raise concerns
- **🌍 Multi-language Support** - Hebrew, English, Spanish, French, German, and more
- **🔒 Privacy-First** - All data stored locally, API keys encrypted
- **📊 Analytics & History** - Track your performance over time

## 🏗️ Architecture

### Project Structure

```
Salesscan/
├── extension/
│   ├── background/
│   │   └── service-worker.js      # Background service worker
│   ├── content/
│   │   └── content-script.js      # Content script injected into meeting pages
│   ├── popup/
│   │   ├── popup.html             # Extension popup UI
│   │   ├── popup.css              # Popup styles
│   │   └── popup.js               # Popup logic
│   ├── options/
│   │   ├── options.html           # Settings page
│   │   ├── options.css            # Settings styles
│   │   └── options.js             # Settings logic
│   ├── services/
│   │   ├── audio-recorder.js      # Audio recording service
│   │   ├── speech-to-text.js      # Speech recognition service
│   │   └── ai-coach.js            # AI analysis and suggestions
│   ├── components/
│   │   └── (UI components)
│   ├── utils/
│   │   ├── storage.js             # Storage utilities
│   │   └── permissions.js         # Permissions management
│   ├── styles/
│   │   └── (CSS files)
│   ├── assets/
│   │   └── icons/                 # Extension icons
│   └── manifest.json              # Extension manifest
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- Chrome Browser (version 88+)
- API key from OpenAI or Anthropic (or your own backend)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd Salesscan
```

2. **Install dependencies**
```bash
npm install
```

3. **Build the extension**
```bash
npm run build
# or for development
npm run dev
```

4. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extension` folder

5. **Configure Settings**
   - Click the extension icon
   - Go to Settings
   - Add your API key (OpenAI or Anthropic)
   - Choose your preferred language
   - Configure other preferences

## 🎮 How to Use

### Basic Usage

1. **Start a Meeting**
   - Join a meeting on Google Meet, Zoom, Teams, or Webex
   - The extension will automatically detect the meeting platform

2. **Start Coaching**
   - Click the "Start Coaching" button in the control panel (top-right corner)
   - Or click the extension icon and press "Start Coaching"

3. **Get Suggestions**
   - The AI will listen to the conversation
   - When the client speaks, it analyzes the context
   - Suggestions appear as pop-ups with quick response options

4. **Use Quick Replies**
   - Click any suggestion to copy it to clipboard
   - Paste it in the chat or use it as a guide

5. **Stop Coaching**
   - Click "Stop Coaching" when done
   - Your session data is saved for analytics

### Supported Platforms

- ✅ Google Meet (meet.google.com)
- ✅ Zoom (zoom.us)
- ✅ Microsoft Teams (teams.microsoft.com)
- ✅ Webex (webex.com)

## ⚙️ Configuration

### AI Provider Setup

#### OpenAI (GPT-4)
1. Get an API key from [OpenAI Platform](https://platform.openai.com)
2. Go to extension Settings
3. Select "OpenAI" as provider
4. Enter your API key
5. Choose model (GPT-4 Turbo recommended)

#### Anthropic (Claude)
1. Get an API key from [Anthropic Console](https://console.anthropic.com)
2. Go to extension Settings
3. Select "Anthropic" as provider
4. Enter your API key
5. Choose model (Claude 3 Opus recommended)

#### Custom Backend
1. Set up your own backend API
2. Go to extension Settings
3. Select "Custom" as provider
4. Enter your API URL
5. Enter authentication token

### Language Settings

The extension supports multiple languages:
- **Hebrew (עברית)** - Default
- **English (US/UK)**
- **Spanish (Español)**
- **French (Français)**
- **German (Deutsch)**

You can also enable multi-language detection to automatically switch between languages.

## 🔧 Development

### Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Speech Recognition**: Web Speech API
- **AI Integration**: OpenAI API / Anthropic API
- **Storage**: Chrome Storage API
- **Build Tool**: Webpack 5

### Development Commands

```bash
# Install dependencies
npm install

# Development mode (watch)
npm run dev

# Production build
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

### Key Files to Customize

1. **AI Prompts** - `extension/services/ai-coach.js`
   - Modify the `buildSystemPrompt()` method
   - Customize suggestion format and behavior

2. **UI Styling** - `extension/content/content-script.js`
   - Modify `showSuggestion()` method
   - Customize colors, positioning, animations

3. **Platform Detection** - `extension/content/content-script.js`
   - Modify `detectMeetingPlatform()` method
   - Add support for new platforms

## 🧪 Testing

### Manual Testing

1. Load extension in Chrome
2. Join a test meeting or open a meeting page
3. Start coaching
4. Speak into microphone
5. Verify transcription appears in console
6. Check that suggestions pop up

### API Testing

Test the AI service independently:

```javascript
import { AICoachService } from './extension/services/ai-coach.js';

const coach = new AICoachService({
  apiKey: 'your-key',
  provider: 'openai'
});

const suggestion = await coach.analyzeMeeting('Client: What\'s the price?');
console.log(suggestion);
```

## 🔐 Security & Privacy

- **Local Storage**: All data stored locally on your machine
- **Encrypted Keys**: API keys stored securely in Chrome Storage
- **No Cloud Recording**: Audio is not uploaded anywhere
- **Minimal Permissions**: Only requests necessary permissions
- **Data Retention**: Configurable retention period (7-365 days)

## 📊 Monetization Strategy

### Free Tier
- 10 coaching sessions per month
- Basic suggestions
- English only
- Google Meet support only

### Pro Tier ($29/month)
- Unlimited sessions
- Advanced AI suggestions
- All languages
- All platforms
- Analytics dashboard
- Custom AI training

### Enterprise Tier (Custom Pricing)
- Custom AI backend
- Team analytics
- Custom integrations
- Priority support
- On-premise deployment

## 🛣️ Roadmap

### Phase 1 (Current)
- [x] Basic transcription
- [x] AI suggestions
- [x] Multi-language support
- [x] Settings page

### Phase 2 (Next)
- [ ] Analytics dashboard
- [ ] Meeting summaries
- [ ] Email integration
- [ ] CRM integration (Salesforce, HubSpot)

### Phase 3 (Future)
- [ ] Team features
- [ ] Custom AI training on your calls
- [ ] Auto-generated follow-up emails
- [ ] Deal scoring and forecasting

## 🐛 Troubleshooting

### Extension doesn't start
- Check Chrome version (88+)
- Verify all permissions granted
- Check console for errors

### No transcription
- Grant microphone permission
- Check language settings
- Verify Web Speech API support

### No AI suggestions
- Verify API key is correct
- Check internet connection
- Review API quota/limits
- Check console for API errors

### Suggestions not showing
- Check "Show real-time suggestions" is enabled
- Verify DOM injection permissions
- Check z-index conflicts with meeting platform

## 📝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Anthropic for Claude API
- Chrome Extensions team for excellent documentation

## 📞 Support

- Email: support@salescoach.ai
- Issues: GitHub Issues
- Docs: [Documentation](https://docs.salescoach.ai)

## 💰 Payment & Licensing

For production use, you'll need to implement:

1. **Stripe/PayPal Integration** for subscriptions
2. **License Key Verification** in the extension
3. **Backend API** for license management

Example backend endpoints needed:
- `POST /api/auth/verify-license`
- `POST /api/usage/track`
- `GET /api/subscription/status`

---

**Built with ❤️ for sales professionals who want to close more deals**
