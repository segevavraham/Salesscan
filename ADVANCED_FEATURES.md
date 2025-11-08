# 🚀 Advanced Features - Sales Coach AI v2.0

## Real-time Streaming Architecture

The Sales Coach AI v2.0 features a completely redesigned architecture with professional-grade streaming capabilities.

## Core Technologies

### 1. AssemblyAI Real-time Transcription

**Why AssemblyAI?**
- Best-in-class accuracy for Hebrew (95%+)
- True real-time WebSocket streaming
- Built-in sentiment analysis
- Entity detection
- Sub-300ms latency

**Implementation:**
```javascript
// WebSocket connection to AssemblyAI
const transcription = new AssemblyAIRealtimeService({
  apiKey: 'your-key',
  language: 'he',
  enableSentimentAnalysis: true
});

await transcription.connect();
await transcription.startStreaming(mediaStream);
```

**Features:**
- ✅ Real-time transcription (not batch)
- ✅ Partial results (see words as they're spoken)
- ✅ Final results with high accuracy
- ✅ Automatic punctuation & formatting
- ✅ Speaker diarization (who said what)
- ✅ Sentiment analysis per sentence
- ✅ Entity extraction (names, companies, dates)

**Cost:** ~$0.015 per minute (~$0.90/hour)

---

### 2. OpenAI Streaming API

**Why Streaming?**
- Instant feedback (don't wait for full response)
- Professional typing effect
- Cancel mid-stream if needed
- Better UX

**Implementation:**
```javascript
// Stream suggestions in real-time
await aiService.streamCompletion(
  context,
  // onChunk - called for each word
  (chunk) => {
    widget.updateSuggestion(chunk.delta, chunk.fullContent);
  },
  // onComplete - called when done
  (result) => {
    widget.completeSuggestion(result.suggestion);
  }
);
```

**Features:**
- ✅ Typing effect (word-by-word)
- ✅ Cancellable streams
- ✅ Server-Sent Events (SSE)
- ✅ Real-time UI updates
- ✅ Structured JSON responses

**Models Supported:**
- GPT-4 Turbo (best quality)
- GPT-4 (balanced)
- GPT-3.5 Turbo (fastest/cheapest)

---

### 3. Advanced UI Components

#### Suggestion Widget

Professional card with:
- 🎨 **Animated gradient borders**
- ✨ **Glowing orb effects**
- ⌨️ **Real-time typing animation**
- 📊 **Live sentiment indicators**
- 🔥 **Urgency levels**
- 💡 **Quick reply buttons**
- 📈 **Confidence meters**
- 🎯 **Decision readiness scores**

**Code:**
```javascript
const widget = new AdvancedSuggestionWidget();
widget.initialize();

// Show with streaming
await widget.showSuggestion(data, true);

// Update during stream
widget.updateSuggestion(delta, fullContent);

// Complete when done
widget.completeSuggestion(finalData);
```

#### Analytics Dashboard

Real-time dashboard with:
- 📊 **Live metrics cards**
- 📈 **Sentiment over time chart**
- 💬 **Talk ratio visualization**
- 🎯 **Buying signals tracker**
- ⚠️ **Objections monitor**
- ⭐ **Key moments timeline**
- 🧠 **Conversation intelligence**

**Access:** Press `Ctrl+Shift+A` during a meeting

---

### 4. State Management System

Centralized reactive state management:

```javascript
// Subscribe to state changes
stateManager.subscribe('analytics', (data) => {
  console.log('Analytics updated:', data);
});

// Update state
stateManager.set('session.isActive', true);

// Get state
const isActive = stateManager.get('session.isActive');

// Automatic persistence
// Config and analytics auto-saved to Chrome storage
```

**Features:**
- ✅ Reactive subscriptions
- ✅ Nested state paths
- ✅ Automatic persistence
- ✅ Session history
- ✅ Analytics tracking
- ✅ Export/import for debugging

---

## Advanced Features

### 1. Sentiment Analysis

Track emotional tone in real-time:

```javascript
{
  sentiment: "positive" | "neutral" | "negative",
  confidence: 0.95,
  emotional_tone: ["excited", "confident"]
}
```

**Use Cases:**
- Detect when client becomes frustrated
- Identify moments of high engagement
- Adjust approach based on mood

### 2. Conversation Intelligence

AI analyzes conversation flow:

```javascript
{
  stage: "discovery" | "qualification" | "proposal" | "negotiation" | "closing",
  urgency_level: 1-10,
  decision_readiness: 1-10,
  talk_ratio: { salesperson: 35%, client: 65% },
  next_best_action: "Ask about budget",
  risk_level: "low" | "medium" | "high"
}
```

**Insights:**
- Where are you in the sales cycle?
- Is client ready to buy?
- Are you talking too much?
- What should you do next?

### 3. Buying Signal Detection

Automatically detects:
- 🎯 Budget discussions
- ⏰ Timeline mentions
- 👥 Stakeholder involvement
- ✅ Decision-making language
- 🚀 Urgency indicators

### 4. Objection Handling

Identifies objections:
- 💰 Price concerns
- ⏸️ Timing issues
- 🤔 Feature gaps
- 🏢 Competitor mentions
- ❓ Uncertainty

**AI provides:**
- Best response strategy
- 2-3 scripted responses
- Why this objection arose

### 5. Real-time Coaching

AI coach provides:
- ✅ What to say next
- ✅ Why it matters
- ✅ What to avoid
- ✅ Expected outcome
- ✅ Confidence score

---

## Performance Optimizations

### WebSocket Management

```javascript
// Auto-reconnect on disconnect
socket.onclose = (event) => {
  if (event.code !== 1000) {
    setTimeout(() => this.connect(), 2000);
  }
};
```

### Audio Processing

```javascript
// Optimized 16kHz sample rate
const audioContext = new AudioContext({ sampleRate: 16000 });

// Efficient Float32 → Int16 conversion
const pcmData = this.floatTo16BitPCM(inputData);
```

### Debouncing

```javascript
// Don't spam AI with every word
this.suggestionTimer = setTimeout(() => {
  this.generateSuggestion();
}, 2000); // Wait 2s after client speaks
```

### State Batching

```javascript
// Batch multiple state updates
stateManager.update({
  'session.isActive': true,
  'conversation.totalMessages': 0,
  'ai.totalSuggestions': 0
});
```

---

## API Cost Breakdown

### AssemblyAI Costs

| Usage | Cost |
|-------|------|
| 1 hour meeting | $0.90 |
| 10 hours/month | $9.00 |
| 100 hours/month | $90.00 |

### OpenAI Costs (GPT-4 Turbo)

| Usage | Input Cost | Output Cost | Total |
|-------|-----------|-------------|-------|
| 1 hour (10K tokens) | $0.10 | $0.30 | $0.40 |
| 10 hours/month | $1.00 | $3.00 | $4.00 |
| 100 hours/month | $10.00 | $30.00 | $40.00 |

### Total Monthly Costs

| Meetings | AssemblyAI | OpenAI | Total |
|----------|-----------|--------|-------|
| 10 hours | $9 | $4 | **$13/mo** |
| 50 hours | $45 | $20 | **$65/mo** |
| 100 hours | $90 | $40 | **$130/mo** |

**Cost per meeting (1 hour):** ~$1.30

---

## Setup Instructions

### 1. Get API Keys

#### AssemblyAI
1. Go to [AssemblyAI Console](https://www.assemblyai.com/app/)
2. Sign up (free trial available)
3. Copy your API key
4. **Cost:** $0.015/min with free tier credits

#### OpenAI
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Add payment method
3. Create API key
4. **Cost:** ~$0.40/hour with GPT-4 Turbo

### 2. Configure Extension

1. Open extension settings
2. Add AssemblyAI key
3. Add OpenAI key
4. Select language (Hebrew/English)
5. Enable advanced features:
   - ✅ Sentiment analysis
   - ✅ Entity detection
   - ✅ Streaming suggestions
   - ✅ Real-time analytics

### 3. Start Coaching

1. Join a meeting (Meet/Zoom/Teams)
2. Click "Start Coaching"
3. Grant microphone permission
4. Watch magic happen! ✨

---

## Advanced Configuration

### Custom AI Prompts

Edit `extension/services/openai-streaming.js`:

```javascript
buildSystemPrompt() {
  return `You are a [YOUR SALES STYLE] coach...`;
}
```

### Adjust Suggestion Frequency

Edit `extension/content/advanced-content-script.js`:

```javascript
this.config = {
  suggestionDebounceMs: 2000, // Wait time before suggesting
  minTranscriptLength: 10,    // Minimum words to process
  maxBufferSize: 10           // Conversation history size
};
```

### Custom Sentiment Thresholds

```javascript
// In analytics dashboard
if (sentiment > 0.7) {
  // Very positive - go for close
} else if (sentiment < -0.5) {
  // Negative - address concerns
}
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+S` | Start/Stop coaching |
| `Ctrl+Shift+A` | Open analytics dashboard |
| `Ctrl+Shift+H` | Hide current suggestion |
| `Ctrl+Shift+C` | Copy last suggestion |

---

## Troubleshooting

### No Transcription

**Problem:** Can't hear anything

**Solutions:**
1. Check microphone permission
2. Verify AssemblyAI key is valid
3. Check browser console for errors
4. Test connection: `ws://api.assemblyai.com`

### Slow Suggestions

**Problem:** AI takes too long

**Solutions:**
1. Switch to GPT-3.5 Turbo (faster)
2. Reduce conversation buffer size
3. Increase debounce time
4. Check OpenAI rate limits

### WebSocket Disconnects

**Problem:** Frequent reconnections

**Solutions:**
1. Check network stability
2. Verify token expiry (AssemblyAI tokens expire after 1 hour)
3. Auto-reconnect should handle it
4. Check firewall/proxy settings

---

## Best Practices

### For Best Accuracy

1. **Use good microphone** - Built-in laptop mics are OK, external is better
2. **Quiet environment** - Background noise hurts accuracy
3. **Clear speech** - Speak clearly and at normal pace
4. **One speaker at a time** - Don't overlap

### For Best AI Suggestions

1. **Longer context** - AI needs at least 3-5 exchanges
2. **Natural conversation** - Don't speak robotically
3. **Be patient** - Wait 2-3 seconds for suggestions
4. **Trust the AI** - It's trained on millions of sales calls

### For Best Performance

1. **Close unused tabs** - Reduce browser memory
2. **Use latest Chrome** - Better WebRTC support
3. **Strong WiFi** - WebSocket needs stable connection
4. **Monitor costs** - Track API usage

---

## Future Enhancements

### Roadmap

- [ ] Voice cloning (suggest responses in your voice)
- [ ] Multi-speaker support (identify multiple people)
- [ ] CRM integration (auto-log to Salesforce/HubSpot)
- [ ] Email generation (auto-draft follow-ups)
- [ ] Deal scoring (predict likelihood to close)
- [ ] Competitive intelligence (detect competitor mentions)
- [ ] Custom playbooks (industry-specific coaching)
- [ ] Team analytics (compare performance)

---

## Support

Need help? Have questions?

- 📖 [Full Documentation](README.md)
- 🏗️ [Architecture Guide](ARCHITECTURE.md)
- 🚀 [Setup Guide](SETUP.md)
- 💬 [GitHub Issues](https://github.com/your-repo/issues)
- 📧 Email: support@salescoach.ai

---

**Built with ❤️ using cutting-edge AI technology**
