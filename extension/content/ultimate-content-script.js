/**
 * Ultimate Sales Coach Content Script v2.1
 * Integrates ALL advanced features for the best UX possible
 */

import { LiveCoachWidget } from '../components/live-coach-widget.js';
import { AdvancedSuggestionWidget } from '../components/advanced-suggestion-widget.js';
import { LiveTranscriptionOverlay } from '../components/live-transcription-overlay.js';
import { WaveformVisualizer } from '../components/waveform-visualizer.js';
import { AnalyticsDashboard } from '../components/analytics-dashboard.js';
import { WebSpeechRecognitionService } from '../services/web-speech-recognition.js';
import { OpenAIStreamingService } from '../services/openai-streaming.js';
import { ProactiveCoachingEngine } from '../services/proactive-coaching-engine.js';
import { MeetingStagesTracker, CompetitorIntelligence, PriceNegotiationAssistant } from '../services/meeting-intelligence-suite.js';
import { stateManager } from '../utils/state-manager.js';

class UltimateSalesCoach {
  constructor() {
    // Core components
    this.liveCoachWidget = null;
    this.suggestionWidget = null;
    this.transcriptionOverlay = null;
    this.waveformVisualizer = null;
    this.analyticsDashboard = null;

    // Services
    this.speechRecognition = null;
    this.openAI = null;
    this.proactiveCoach = null;
    this.stagesTracker = null;
    this.competitorIntel = null;
    this.priceAssistant = null;

    // State
    this.isActive = false;
    this.mediaStream = null;
    this.sessionStartTime = null;

    // Configuration
    this.config = {
      elevenLabsKey: null,
      openAIKey: null,
      language: 'he',
      model: 'gpt-4-turbo-preview',
      enableProactiveCoaching: true,
      enableStagesTracker: true,
      enableCompetitorIntel: true,
      enablePriceAssistant: true,
      enableWaveform: true,
      enableLiveTranscription: true
    };

    this.init();
  }

  /**
   * Initialize the ultimate coach
   */
  async init() {
    console.log('🚀 Initializing Ultimate Sales Coach v2.1...');

    // Load config
    await this.loadConfig();

    // Initialize all components
    this.initializeComponents();

    // Setup message listeners
    this.setupMessageListeners();

    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();

    console.log('✅ Ultimate Sales Coach ready!');
  }

  /**
   * Load configuration
   */
  async loadConfig() {
    try {
      const result = await chrome.storage.local.get('settings');
      const settings = result.settings || {};

      // Convert language code (he-IL -> he)
      let languageCode = settings.language || 'he-IL';
      if (languageCode.includes('-')) {
        languageCode = languageCode.split('-')[0];
      }

      this.config = {
        elevenLabsKey: settings.elevenLabsKey || null, // SECURITY: Never store API keys in code
        openAIKey: settings.openAIKey || null, // SECURITY: User must provide their own key
        language: languageCode,
        model: settings.model || 'gpt-4-turbo-preview',
        enableProactiveCoaching: settings.enableProactiveCoaching !== false,
        enableStagesTracker: settings.enableStagesTracker !== false,
        enableCompetitorIntel: settings.enableCompetitorIntel !== false,
        enablePriceAssistant: settings.enablePriceAssistant !== false,
        enableWaveform: settings.enableWaveform !== false,
        enableLiveTranscription: settings.enableLiveTranscription !== false
      };

      console.log('📋 Config loaded:', {
        ...this.config,
        elevenLabsKey: this.config.elevenLabsKey ? '✅ Set' : '❌ Missing',
        openAIKey: this.config.openAIKey ? '✅ Set' : '❌ Missing'
      });

      // Validate API keys
      if (!this.config.elevenLabsKey || !this.config.openAIKey) {
        console.error('❌ API keys are missing! Please configure them in the extension settings.');
      }

    } catch (error) {
      console.error('Error loading config:', error);
    }
  }

  /**
   * Initialize all components
   */
  initializeComponents() {
    // Live Coach Widget (NEW!)
    this.liveCoachWidget = new LiveCoachWidget();
    this.liveCoachWidget.initialize();

    // Suggestion Widget (fallback)
    this.suggestionWidget = new AdvancedSuggestionWidget();
    this.suggestionWidget.initialize();

    // Live Transcription
    if (this.config.enableLiveTranscription) {
      this.transcriptionOverlay = new LiveTranscriptionOverlay();
      this.transcriptionOverlay.initialize();
    }

    // Analytics Dashboard
    this.analyticsDashboard = new AnalyticsDashboard();
    this.analyticsDashboard.initialize();

    // Proactive Coaching
    if (this.config.enableProactiveCoaching) {
      this.proactiveCoach = new ProactiveCoachingEngine();
    }

    // Meeting Stages Tracker
    if (this.config.enableStagesTracker) {
      this.stagesTracker = new MeetingStagesTracker();
    }

    // Competitor Intelligence
    if (this.config.enableCompetitorIntel) {
      this.competitorIntel = new CompetitorIntelligence();
    }

    // Price Negotiation Assistant
    if (this.config.enablePriceAssistant) {
      this.priceAssistant = new PriceNegotiationAssistant();
    }

    // Create master control panel
    this.createMasterControlPanel();
  }

  /**
   * Create master control panel
   */
  createMasterControlPanel() {
    const panel = document.createElement('div');
    panel.id = 'sc-master-control';
    panel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 16px;
      padding: 16px 20px;
      box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.05),
        0 10px 40px rgba(0, 0, 0, 0.3),
        0 0 80px rgba(139, 92, 246, 0.2);
      z-index: 999999;
      font-family: 'Inter', sans-serif;
      display: flex;
      align-items: center;
      gap: 16px;
    `;

    panel.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div id="sc-master-status" style="
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #64748b;
          box-shadow: 0 0 10px rgba(100, 116, 139, 0.5);
          transition: all 0.3s;
        "></div>
        <div>
          <div style="font-size: 12px; font-weight: 600; color: #8b5cf6; text-transform: uppercase; letter-spacing: 0.5px;">
            Sales Coach AI
          </div>
          <div id="sc-master-label" style="font-size: 11px; color: #64748b;">
            Ready to coach
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 8px;">
        <button id="sc-master-toggle" style="
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        ">
          Start Coaching
        </button>
        <button id="sc-master-dashboard" style="
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.2s;
        " title="Analytics Dashboard">
          📊
        </button>
      </div>
    `;

    document.body.appendChild(panel);

    // Event listeners
    document.getElementById('sc-master-toggle').onclick = () => this.toggle();
    document.getElementById('sc-master-dashboard').onclick = () => this.analyticsDashboard.show();
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
   * Start coaching
   */
  async start() {
    try {
      console.log('🎬 Starting Ultimate Sales Coach...');

      // Validate API key (only OpenAI needed now!)
      if (!this.config.openAIKey) {
        alert('❌ OpenAI API key is missing!\n\nPlease configure your OpenAI API key in the extension settings before starting.');
        chrome.runtime.openOptionsPage();
        return;
      }

      // Initialize Web Speech Recognition (FREE! Built into Chrome!)
      console.log('🎤 Starting speech recognition...');
      this.speechRecognition = new WebSpeechRecognitionService({
        language: this.config.language === 'he' ? 'he-IL' : 'en-US',
        continuous: true,
        interimResults: true,
        onTranscript: (transcript) => this.handleFinalTranscript(transcript),
        onPartialTranscript: (transcript) => this.handlePartialTranscript(transcript),
        onError: (error) => this.handleError(error)
      });

      this.speechRecognition.start();
      console.log('✅ Speech recognition started - listening to conversation!');

      // Initialize OpenAI
      console.log('🤖 Initializing OpenAI...');
      this.openAI = new OpenAIStreamingService({
        apiKey: this.config.openAIKey,
        model: this.config.model
      });
      console.log('✅ OpenAI initialized');

      // Initialize Waveform
      if (this.config.enableWaveform) {
        this.waveformVisualizer = new WaveformVisualizer();
        await this.waveformVisualizer.initialize(this.mediaStream);
      }

      // Initialize Stages Tracker
      if (this.stagesTracker) {
        this.stagesTracker.initialize();
      }

      // Update state
      this.isActive = true;
      this.sessionStartTime = Date.now();
      stateManager.startSession('ultimate');

      // Update UI
      this.updateMasterControlUI(true);

      // Show transcription overlay
      if (this.transcriptionOverlay) {
        this.transcriptionOverlay.show();
      }

      console.log('✅ Ultimate Sales Coach active!');

    } catch (error) {
      console.error('❌ Error starting coach:', error);

      let errorMessage = 'Failed to start coaching:\n\n';

      if (error.name === 'NotAllowedError') {
        errorMessage += '🎤 Microphone access denied. Please allow microphone access and try again.';
      } else if (error.message.includes('401') || error.message.includes('403')) {
        errorMessage += '🔑 Invalid API key. Please check your API keys in settings.';
      } else if (error.message.includes('token')) {
        errorMessage += '🔑 Authentication failed. Please verify your ElevenLabs API key.';
      } else {
        errorMessage += error.message;
      }

      alert(errorMessage);
    }
  }

  /**
   * Stop coaching
   */
  async stop() {
    console.log('⏹️ Stopping Ultimate Sales Coach...');

    // Stop Speech Recognition
    if (this.speechRecognition) {
      this.speechRecognition.stop();
      this.speechRecognition = null;
    }

    // Stop Waveform
    if (this.waveformVisualizer) {
      this.waveformVisualizer.stop();
      this.waveformVisualizer = null;
    }

    // Cancel ongoing AI requests
    if (this.openAI) {
      this.openAI.cancelStream();
    }

    // Update state
    this.isActive = false;
    stateManager.endSession();

    // Update UI
    this.updateMasterControlUI(false);

    // Hide overlays
    if (this.transcriptionOverlay) {
      this.transcriptionOverlay.hide();
    }

    if (this.suggestionWidget) {
      this.suggestionWidget.hideSuggestion();
    }

    if (this.liveCoachWidget) {
      this.liveCoachWidget.hide();
    }

    console.log('✅ Ultimate Sales Coach stopped');
  }

  /**
   * Handle final transcript from ElevenLabs
   */
  async handleFinalTranscript(transcript) {
    console.log('🎙️ ===== NEW TRANSCRIPT RECEIVED =====');
    console.log('📝 Text:', transcript.text);
    console.log('📊 Confidence:', transcript.confidence);

    // Detect speaker
    const speaker = this.detectSpeaker(transcript.text);
    transcript.speaker = speaker;

    console.log('👤 Speaker detected as:', speaker.toUpperCase());

    // Add to state
    stateManager.addMessage({
      speaker,
      text: transcript.text,
      sentiment: transcript.sentiment,
      confidence: transcript.confidence,
      timestamp: Date.now()
    });

    console.log('✅ Message added to conversation state');

    // Update transcription overlay
    if (this.transcriptionOverlay) {
      this.transcriptionOverlay.addTranscript({
        ...transcript,
        speaker,
        isFinal: true
      });
      console.log('✅ Transcript displayed on screen');
    }

    // Update waveform speaker
    if (this.waveformVisualizer) {
      this.waveformVisualizer.setSpeaker(speaker);
    }

    // Detect stage
    if (this.stagesTracker) {
      this.stagesTracker.detectStage(transcript, {
        startTime: this.sessionStartTime,
        discussedTopics: stateManager.get('conversation.buffer').map(m => m.text)
      });
    }

    // Check competitor mention
    if (this.competitorIntel) {
      this.competitorIntel.detectMention(transcript);
    }

    // Check price discussion
    if (this.priceAssistant) {
      this.priceAssistant.detectPriceDiscussion(transcript);
    }

    // Proactive coaching
    if (this.proactiveCoach && speaker === 'client') {
      console.log('🔄 Running proactive coaching checks...');
      await this.runProactiveCoaching();
    }

    // Generate AI suggestion (if client spoke)
    if (speaker === 'client') {
      console.log('🤖 CLIENT SPOKE! Generating AI coaching suggestion...');
      await this.generateStreamingSuggestion();
    } else {
      console.log('🎤 You spoke - waiting for client response before coaching');
    }

    console.log('🎙️ ===== TRANSCRIPT PROCESSING COMPLETE =====\n');
  }

  /**
   * Handle partial transcript
   */
  handlePartialTranscript(transcript) {
    // Update live transcription
    if (this.transcriptionOverlay) {
      this.transcriptionOverlay.addTranscript({
        ...transcript,
        speaker: 'unknown',
        isFinal: false
      });
    }
  }

  /**
   * Run proactive coaching checks
   */
  async runProactiveCoaching() {
    if (!this.proactiveCoach) return;

    const context = {
      duration: Date.now() - this.sessionStartTime,
      silenceDuration: 0, // TODO: Calculate
      talkRatio: stateManager.calculateTalkRatioPercentage(),
      currentSentiment: stateManager.get('analytics.sentimentHistory').slice(-1)[0]?.value,
      sentimentHistory: stateManager.get('analytics.sentimentHistory').map(s => s.value),
      stage: this.stagesTracker?.currentStage || 'unknown',
      buyingSignals: stateManager.get('analytics.buyingSignals'),
      objections: stateManager.get('analytics.objections'),
      questionCount: stateManager.get('conversation.buffer').filter(m =>
        m.speaker === 'salesperson' && m.text.includes('?')
      ).length,
      totalMessages: stateManager.get('conversation.totalMessages'),
      yourMessages: stateManager.get('conversation.buffer')
        .filter(m => m.speaker === 'salesperson')
        .map(m => m.text),
      discussedTopics: [],
      nextStepsScheduled: false,
      urgency: 5,
      competitorsMentioned: this.competitorIntel?.competitors.keys() || []
    };

    // Evaluate rules
    const triggeredRules = this.proactiveCoach.evaluate(context);

    // Show highest priority rule
    if (triggeredRules.length > 0) {
      const topRule = triggeredRules[0];
      this.proactiveCoach.showCoachingCard(
        topRule,
        (rule) => {
          console.log('✅ User accepted coaching:', rule.id);
          // Track acceptance
        },
        (rule) => {
          console.log('❌ User dismissed coaching:', rule.id);
          // Track dismissal
        }
      );
    }
  }

  /**
   * Generate streaming AI suggestion
   */
  async generateStreamingSuggestion() {
    try {
      // Get conversation context
      const context = stateManager.getConversationContext(10);

      // Show loading in new widget
      this.liveCoachWidget.showLoading();

      let fullResponse = '';

      // Stream from OpenAI
      await this.openAI.streamCompletion(
        context,
        // onChunk
        (chunk) => {
          fullResponse = chunk.fullContent;
          this.liveCoachWidget.updateStreaming(fullResponse);
        },
        // onComplete
        (result) => {
          console.log('🤖 AI Coaching received:', result.suggestion);

          // Show in new professional widget
          if (result.suggestion) {
            this.liveCoachWidget.showCoaching(result.suggestion);

            // Record buying signals and objections
            if (result.suggestion.analysis) {
              const analysis = result.suggestion.analysis;

              if (analysis.buying_signals) {
                analysis.buying_signals.forEach(signal => {
                  stateManager.recordBuyingSignal(signal);
                });
              }

              if (analysis.objections_hidden) {
                analysis.objections_hidden.forEach(objection => {
                  stateManager.recordObjection(objection);
                });
              }
            }
          } else {
            // Fallback to old widget if parsing fails
            this.suggestionWidget.showSuggestion({
              suggestions: { main_advice: fullResponse }
            });
          }
        },
        // onError
        (error) => {
          console.error('❌ AI streaming error:', error);
          this.liveCoachWidget.hide();
        }
      );

    } catch (error) {
      console.error('Error generating suggestion:', error);
      this.liveCoachWidget.hide();
    }
  }

  /**
   * Detect speaker (improved)
   */
  detectSpeaker(text) {
    const lowerText = text.toLowerCase();

    // Keywords that indicate salesperson
    const salespersonKeywords = [
      'אני', 'נוכל', 'נציע', 'אנחנו', 'החברה שלנו', 'המוצר שלנו',
      'הפתרון שלנו', 'אז ספר', 'בוא נדבר', 'מה אתה חושב'
    ];

    // Keywords that indicate client
    const clientKeywords = [
      'מעניין', 'רוצה לדעת', 'איך זה', 'כמה זה', 'מתי',
      'אני צריך', 'אנחנו צריכים', 'הבעיה שלנו', 'החברה שלנו צריכה'
    ];

    // Check salesperson keywords
    if (salespersonKeywords.some(keyword => lowerText.includes(keyword))) {
      console.log('🎤 Detected: YOU (salesperson) -', text.substring(0, 50));
      return 'salesperson';
    }

    // Check client keywords
    if (clientKeywords.some(keyword => lowerText.includes(keyword))) {
      console.log('👤 Detected: CLIENT -', text.substring(0, 50));
      return 'client';
    }

    // Questions usually from salesperson
    if (text.trim().endsWith('?')) {
      console.log('🎤 Detected: YOU (question) -', text.substring(0, 50));
      return 'salesperson';
    }

    // Use conversation buffer to alternate
    const buffer = stateManager.get('conversation.buffer');
    const lastSpeaker = buffer[buffer.length - 1]?.speaker;

    const detected = lastSpeaker === 'client' ? 'salesperson' : 'client';
    console.log(`🔄 Detected: ${detected.toUpperCase()} (alternating) -`, text.substring(0, 50));

    return detected;
  }

  /**
   * Update master control UI
   */
  updateMasterControlUI(isActive) {
    const status = document.getElementById('sc-master-status');
    const label = document.getElementById('sc-master-label');
    const toggle = document.getElementById('sc-master-toggle');

    if (isActive) {
      status.style.background = '#22c55e';
      status.style.boxShadow = '0 0 15px rgba(34, 197, 94, 0.6)';
      label.textContent = 'Coaching Active';
      label.style.color = '#86efac';
      toggle.textContent = 'Stop Coaching';
      toggle.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
    } else {
      status.style.background = '#64748b';
      status.style.boxShadow = '0 0 10px rgba(100, 116, 139, 0.5)';
      label.textContent = 'Ready to coach';
      label.style.color = '#64748b';
      toggle.textContent = 'Start Coaching';
      toggle.style.background = 'linear-gradient(135deg, #8b5cf6, #6366f1)';
    }
  }

  /**
   * Setup message listeners
   */
  setupMessageListeners() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.type) {
        case 'FORCE_SUGGESTION':
          this.generateStreamingSuggestion();
          sendResponse({ success: true });
          break;

        case 'TOGGLE_TRANSCRIPTION':
          if (this.transcriptionOverlay) {
            this.transcriptionOverlay.toggle();
          }
          sendResponse({ success: true });
          break;

        case 'SHOW_DASHBOARD':
          this.analyticsDashboard.show();
          sendResponse({ success: true });
          break;

        default:
          console.log('Unknown message:', message.type);
      }

      return true;
    });
  }

  /**
   * Setup keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+Shift+S - Start/Stop
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        this.toggle();
      }

      // Ctrl+Shift+A - Analytics
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        this.analyticsDashboard.show();
      }

      // Ctrl+T - Toggle transcription
      if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        if (this.transcriptionOverlay) {
          this.transcriptionOverlay.toggle();
        }
      }

      // Ctrl+Shift+H - Hide all
      if (e.ctrlKey && e.shiftKey && e.key === 'H') {
        e.preventDefault();
        if (this.transcriptionOverlay) this.transcriptionOverlay.hide();
        if (this.suggestionWidget) this.suggestionWidget.hideSuggestion();
        if (this.waveformVisualizer) this.waveformVisualizer.hide();
      }
    });
  }

  /**
   * Handle errors
   */
  handleError(error) {
    console.error('💥 Ultimate Sales Coach Error:', error);
    // Show user-friendly error notification
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.ultimateSalesCoach = new UltimateSalesCoach();
  });
} else {
  window.ultimateSalesCoach = new UltimateSalesCoach();
}

console.log('🎯 Ultimate Sales Coach v2.1 Script Loaded');
