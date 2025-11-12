/**
 * Advanced Sales Coach Content Script
 * Professional real-time streaming implementation
 */

import { AdvancedSuggestionWidget } from '../components/advanced-suggestion-widget.js';
import { AssemblyAIRealtimeService } from '../services/assemblyai-realtime.js';
import { OpenAIStreamingService } from '../services/openai-streaming.js';

class AdvancedSalesCoach {
  constructor() {
    this.isActive = false;
    this.widget = null;
    this.transcriptionService = null;
    this.aiService = null;
    this.mediaStream = null;

    // State
    this.state = {
      isRecording: false,
      conversationBuffer: [],
      currentSpeaker: null,
      lastClientMessage: null,
      suggestionInProgress: false,
      metrics: {
        totalTranscripts: 0,
        totalSuggestions: 0,
        averageConfidence: 0,
        sessionStartTime: null
      }
    };

    // Configuration
    this.config = {
      minTranscriptLength: 10, // Minimum characters to process
      suggestionDebounceMs: 2000, // Wait 2s after client speaks before suggesting
      maxBufferSize: 10, // Keep last 10 messages
      enableAutoSuggestions: true
    };

    // Timers
    this.suggestionTimer = null;
    this.heartbeatInterval = null;

    this.init();
  }

  /**
   * Initialize the advanced coach
   */
  async init() {
    console.log('🚀 Initializing Advanced Sales Coach...');

    // Load settings
    await this.loadSettings();

    // Create widget
    this.widget = new AdvancedSuggestionWidget();
    this.widget.initialize();

    // Create control panel
    this.createAdvancedControlPanel();

    // Listen for messages from background
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sendResponse);
      return true;
    });

    console.log('✅ Advanced Sales Coach initialized');
  }

  /**
   * Load settings from storage
   */
  async loadSettings() {
    try {
      const result = await chrome.storage.local.get('settings');
      const settings = result.settings || {};

      this.config.assemblyAIKey = settings.assemblyAIKey || settings.apiKey;
      this.config.openAIKey = settings.openAIKey || settings.apiKey;
      this.config.language = settings.language || 'he';
      this.config.aiProvider = settings.aiProvider || 'openai';
      this.config.enableAutoSuggestions = settings.showRealTimeSuggestions !== false;

    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  /**
   * Create advanced control panel
   */
  createAdvancedControlPanel() {
    const panel = document.createElement('div');
    panel.id = 'sc-advanced-control-panel';
    panel.innerHTML = `
      <style>
        #sc-advanced-control-panel {
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 16px;
          padding: 16px 20px;
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.05),
            0 10px 40px rgba(0, 0, 0, 0.3),
            0 0 60px rgba(139, 92, 246, 0.2);
          z-index: 999998;
          display: flex;
          align-items: center;
          gap: 14px;
          font-family: 'Inter', -apple-system, sans-serif;
          pointer-events: auto;
          backdrop-filter: blur(20px);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        #sc-advanced-control-panel:hover {
          box-shadow:
            0 0 0 1px rgba(139, 92, 246, 0.4),
            0 15px 50px rgba(0, 0, 0, 0.4),
            0 0 80px rgba(139, 92, 246, 0.3);
        }

        .sc-panel-status {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sc-panel-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #64748b;
          box-shadow: 0 0 10px rgba(100, 116, 139, 0.5);
          transition: all 0.3s;
        }

        .sc-panel-indicator.active {
          background: #22c55e;
          box-shadow: 0 0 15px rgba(34, 197, 94, 0.6);
          animation: breathe 2s ease-in-out infinite;
        }

        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }

        .sc-panel-label {
          font-size: 13px;
          font-weight: 500;
          color: #94a3b8;
        }

        .sc-panel-value {
          font-size: 14px;
          font-weight: 600;
          color: #e2e8f0;
        }

        .sc-panel-toggle {
          background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }

        .sc-panel-toggle:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
        }

        .sc-panel-toggle:active {
          transform: scale(0.98);
        }

        .sc-panel-toggle.active {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }

        .sc-panel-stats {
          display: flex;
          gap: 16px;
          padding-left: 16px;
          border-left: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sc-panel-stat {
          text-align: center;
        }

        .sc-panel-stat-value {
          font-size: 16px;
          font-weight: 700;
          color: #8b5cf6;
          display: block;
        }

        .sc-panel-stat-label {
          font-size: 10px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .sc-panel-minimize {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          transition: all 0.2s;
        }

        .sc-panel-minimize:hover {
          background: rgba(139, 92, 246, 0.2);
          border-color: rgba(139, 92, 246, 0.4);
          color: #c4b5fd;
        }
      </style>

      <div class="sc-panel-status">
        <div class="sc-panel-indicator" id="sc-panel-indicator"></div>
        <div>
          <div class="sc-panel-label">AI Sales Coach</div>
          <div class="sc-panel-value" id="sc-panel-status">Ready</div>
        </div>
      </div>

      <div class="sc-panel-stats">
        <div class="sc-panel-stat">
          <span class="sc-panel-stat-value" id="sc-stat-transcripts">0</span>
          <span class="sc-panel-stat-label">Messages</span>
        </div>
        <div class="sc-panel-stat">
          <span class="sc-panel-stat-value" id="sc-stat-suggestions">0</span>
          <span class="sc-panel-stat-label">Suggestions</span>
        </div>
        <div class="sc-panel-stat">
          <span class="sc-panel-stat-value" id="sc-stat-duration">0:00</span>
          <span class="sc-panel-stat-label">Duration</span>
        </div>
      </div>

      <button class="sc-panel-toggle" id="sc-panel-toggle">
        Start Coaching
      </button>

      <button class="sc-panel-minimize" id="sc-panel-minimize">
        −
      </button>
    `;

    document.body.appendChild(panel);

    // Event listeners
    document.getElementById('sc-panel-toggle').onclick = () => this.toggle();
    document.getElementById('sc-panel-minimize').onclick = () => this.minimizePanel();
  }

  /**
   * Toggle coaching on/off
   */
  async toggle() {
    if (this.isActive) {
      await this.stop();
    } else {
      await this.start();
    }
  }

  /**
   * Start coaching session
   */
  async start() {
    try {
      console.log('🎬 Starting advanced coaching session...');

      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });

      // Initialize AssemblyAI
      this.transcriptionService = new AssemblyAIRealtimeService({
        apiKey: this.config.assemblyAIKey,
        language: this.config.language,
        enableSentimentAnalysis: true,
        enableEntityDetection: true,
        onTranscript: (transcript) => this.handleTranscript(transcript),
        onPartialTranscript: (transcript) => this.handlePartialTranscript(transcript),
        onError: (error) => this.handleError(error)
      });

      await this.transcriptionService.connect();
      await this.transcriptionService.startStreaming(this.mediaStream);

      // Initialize OpenAI Streaming
      this.aiService = new OpenAIStreamingService({
        apiKey: this.config.openAIKey,
        model: 'gpt-4-turbo-preview'
      });

      // Update state
      this.isActive = true;
      this.state.isRecording = true;
      this.state.sessionStartTime = Date.now();

      // Update UI
      this.updatePanelUI(true);

      // Start heartbeat
      this.startHeartbeat();

      console.log('✅ Coaching session started');

    } catch (error) {
      console.error('❌ Error starting coaching:', error);
      alert('Failed to start coaching: ' + error.message);
    }
  }

  /**
   * Stop coaching session
   */
  async stop() {
    console.log('⏹️ Stopping coaching session...');

    // Stop transcription
    if (this.transcriptionService) {
      await this.transcriptionService.stop();
      this.transcriptionService = null;
    }

    // Stop media stream
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    // Cancel any ongoing AI stream
    if (this.aiService) {
      this.aiService.cancelStream();
    }

    // Stop heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Update state
    this.isActive = false;
    this.state.isRecording = false;

    // Update UI
    this.updatePanelUI(false);

    // Hide any active suggestions
    if (this.widget) {
      this.widget.hideSuggestion();
    }

    console.log('✅ Coaching session stopped');
  }

  /**
   * Handle final transcript from AssemblyAI
   */
  handleTranscript(transcript) {
    console.log('📝 Final transcript:', transcript);

    // Detect speaker (simplified - in production use voice recognition)
    const speaker = this.detectSpeaker(transcript.text);

    // Add to buffer
    this.state.conversationBuffer.push({
      speaker,
      text: transcript.text,
      confidence: transcript.confidence,
      timestamp: Date.now(),
      sentiment: transcript.sentiment,
      entities: transcript.entities
    });

    // Trim buffer
    if (this.state.conversationBuffer.length > this.config.maxBufferSize) {
      this.state.conversationBuffer.shift();
    }

    // Update metrics
    this.state.metrics.totalTranscripts++;
    this.updateStats();

    // If client spoke, prepare suggestion
    if (speaker === 'client' && this.config.enableAutoSuggestions) {
      this.state.lastClientMessage = transcript.text;
      this.debounceSuggestion();
    }

    // Send to background for storage
    chrome.runtime.sendMessage({
      type: 'TRANSCRIPT_UPDATE',
      data: {
        speaker,
        text: transcript.text,
        sentiment: transcript.sentiment,
        timestamp: Date.now()
      }
    });
  }

  /**
   * Handle partial (interim) transcripts
   */
  handlePartialTranscript(transcript) {
    // Show real-time transcription in panel or overlay
    console.log('👂 Listening:', transcript.text);
  }

  /**
   * Debounce AI suggestions
   */
  debounceSuggestion() {
    // Clear existing timer
    if (this.suggestionTimer) {
      clearTimeout(this.suggestionTimer);
    }

    // Wait for client to finish speaking
    this.suggestionTimer = setTimeout(() => {
      this.generateSuggestion();
    }, this.config.suggestionDebounceMs);
  }

  /**
   * Generate AI suggestion with streaming
   */
  async generateSuggestion() {
    if (this.state.suggestionInProgress) {
      console.log('⏭️ Skipping suggestion - already in progress');
      return;
    }

    try {
      this.state.suggestionInProgress = true;

      // Build conversation context
      const context = this.state.conversationBuffer
        .map(msg => `${msg.speaker.toUpperCase()}: ${msg.text}`)
        .join('\n');

      console.log('🤖 Generating suggestion for context:', context);

      // Show empty widget with streaming indicator
      await this.widget.showSuggestion({
        suggestions: {
          main_advice: ''
        }
      }, true);

      // Stream suggestion from OpenAI
      await this.aiService.streamCompletion(
        context,
        // onChunk - real-time typing effect
        (chunk) => {
          this.widget.updateSuggestion(chunk.delta, chunk.fullContent);
        },
        // onComplete - final suggestion
        (result) => {
          console.log('✅ Suggestion complete:', result.suggestion);
          this.widget.completeSuggestion(result);

          this.state.metrics.totalSuggestions++;
          this.updateStats();

          this.state.suggestionInProgress = false;
        },
        // onError
        (error) => {
          console.error('❌ Error generating suggestion:', error);
          this.state.suggestionInProgress = false;
        }
      );

    } catch (error) {
      console.error('Error in generateSuggestion:', error);
      this.state.suggestionInProgress = false;
    }
  }

  /**
   * Detect speaker (simplified)
   * In production, use voice fingerprinting or speaker diarization
   */
  detectSpeaker(text) {
    // Simple heuristic: questions are more likely from salesperson
    if (text.includes('?')) {
      return 'salesperson';
    }

    // Use AI to detect speaker (cached in background)
    // For now, alternate between speakers
    const lastSpeaker = this.state.conversationBuffer[this.state.conversationBuffer.length - 1]?.speaker;
    return lastSpeaker === 'client' ? 'salesperson' : 'client';
  }

  /**
   * Update panel UI
   */
  updatePanelUI(isActive) {
    const indicator = document.getElementById('sc-panel-indicator');
    const status = document.getElementById('sc-panel-status');
    const toggle = document.getElementById('sc-panel-toggle');

    if (isActive) {
      indicator.classList.add('active');
      status.textContent = 'Coaching Active';
      toggle.textContent = 'Stop Coaching';
      toggle.classList.add('active');
    } else {
      indicator.classList.remove('active');
      status.textContent = 'Ready';
      toggle.textContent = 'Start Coaching';
      toggle.classList.remove('active');
    }
  }

  /**
   * Update stats display
   */
  updateStats() {
    document.getElementById('sc-stat-transcripts').textContent = this.state.metrics.totalTranscripts;
    document.getElementById('sc-stat-suggestions').textContent = this.state.metrics.totalSuggestions;
  }

  /**
   * Start heartbeat for duration counter
   */
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (!this.state.sessionStartTime) return;

      const duration = Math.floor((Date.now() - this.state.sessionStartTime) / 1000);
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;

      document.getElementById('sc-stat-duration').textContent =
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
  }

  /**
   * Minimize/expand panel
   */
  minimizePanel() {
    const panel = document.getElementById('sc-advanced-control-panel');
    // Add minimize functionality
  }

  /**
   * Handle messages from background
   */
  handleMessage(message, sendResponse) {
    switch (message.type) {
      case 'FORCE_SUGGESTION':
        this.generateSuggestion();
        sendResponse({ success: true });
        break;

      case 'UPDATE_CONFIG':
        this.loadSettings();
        sendResponse({ success: true });
        break;

      default:
        console.log('Unknown message:', message.type);
    }
  }

  /**
   * Handle errors
   */
  handleError(error) {
    console.error('💥 Sales Coach Error:', error);

    // Show error notification
    // In production, add error handling UI
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.salesCoach = new AdvancedSalesCoach();
  });
} else {
  window.salesCoach = new AdvancedSalesCoach();
}

console.log('🎯 Advanced Sales Coach Content Script Loaded');
