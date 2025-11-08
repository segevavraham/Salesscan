/**
 * Ultimate Sales Coach Content Script v2.1
 * Integrates ALL advanced features for the best UX possible
 */

import { AdvancedSuggestionWidget } from '../components/advanced-suggestion-widget.js';
import { LiveTranscriptionOverlay } from '../components/live-transcription-overlay.js';
import { WaveformVisualizer } from '../components/waveform-visualizer.js';
import { AnalyticsDashboard } from '../components/analytics-dashboard.js';
import { AssemblyAIRealtimeService } from '../services/assemblyai-realtime.js';
import { OpenAIStreamingService } from '../services/openai-streaming.js';
import { ProactiveCoachingEngine } from '../services/proactive-coaching-engine.js';
import { MeetingStagesTracker, CompetitorIntelligence, PriceNegotiationAssistant } from '../services/meeting-intelligence-suite.js';
import { stateManager } from '../utils/state-manager.js';

class UltimateSalesCoach {
  constructor() {
    // Core components
    this.suggestionWidget = null;
    this.transcriptionOverlay = null;
    this.waveformVisualizer = null;
    this.analyticsD ashboard = null;

    // Services
    this.assemblyAI = null;
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
      assemblyAIKey: null,
      openAIKey: null,
      language: 'he',
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

      this.config = {
        assemblyAIKey: settings.assemblyAIKey || settings.apiKey,
        openAIKey: settings.openAIKey || settings.apiKey,
        language: settings.language || 'he',
        enableProactiveCoaching: settings.enableProactiveCoaching !== false,
        enableStagesTracker: settings.enableStagesTracker !== false,
        enableCompetitorIntel: settings.enableCompetitorIntel !== false,
        enablePriceAssistant: settings.enablePriceAssistant !== false,
        enableWaveform: settings.enableWaveform !== false,
        enableLiveTranscription: settings.enableLiveTranscription !== false
      };

    } catch (error) {
      console.error('Error loading config:', error);
    }
  }

  /**
   * Initialize all components
   */
  initializeComponents() {
    // Suggestion Widget
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

      // Request microphone
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });

      // Initialize AssemblyAI
      this.assemblyAI = new AssemblyAIRealtimeService({
        apiKey: this.config.assemblyAIKey,
        language: this.config.language,
        enableSentimentAnalysis: true,
        enableEntityDetection: true,
        onTranscript: (transcript) => this.handleFinalTranscript(transcript),
        onPartialTranscript: (transcript) => this.handlePartialTranscript(transcript),
        onError: (error) => this.handleError(error)
      });

      await this.assemblyAI.connect();
      await this.assemblyAI.startStreaming(this.mediaStream);

      // Initialize OpenAI
      this.openAI = new OpenAIStreamingService({
        apiKey: this.config.openAIKey,
        model: 'gpt-4-turbo-preview'
      });

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
      alert('Failed to start coaching: ' + error.message);
    }
  }

  /**
   * Stop coaching
   */
  async stop() {
    console.log('⏹️ Stopping Ultimate Sales Coach...');

    // Stop AssemblyAI
    if (this.assemblyAI) {
      await this.assemblyAI.stop();
      this.assemblyAI = null;
    }

    // Stop Waveform
    if (this.waveformVisualizer) {
      this.waveformVisualizer.stop();
      this.waveformVisualizer = null;
    }

    // Stop media stream
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
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

    console.log('✅ Ultimate Sales Coach stopped');
  }

  /**
   * Handle final transcript from AssemblyAI
   */
  async handleFinalTranscript(transcript) {
    console.log('📝 Final transcript:', transcript);

    // Detect speaker (simplified)
    const speaker = this.detectSpeaker(transcript.text);
    transcript.speaker = speaker;

    // Add to state
    stateManager.addMessage({
      speaker,
      text: transcript.text,
      sentiment: transcript.sentiment,
      confidence: transcript.confidence,
      timestamp: Date.now()
    });

    // Update transcription overlay
    if (this.transcriptionOverlay) {
      this.transcriptionOverlay.addTranscript({
        ...transcript,
        speaker,
        isFinal: true
      });
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
      await this.runProactiveCoaching();
    }

    // Generate AI suggestion (if client spoke)
    if (speaker === 'client') {
      await this.generateStreamingSuggestion();
    }
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

      // Show empty widget with streaming
      await this.suggestionWidget.showSuggestion({
        suggestions: { main_advice: '' }
      }, true);

      // Stream from OpenAI
      await this.openAI.streamCompletion(
        context,
        // onChunk
        (chunk) => {
          this.suggestionWidget.updateSuggestion(chunk.delta, chunk.fullContent);
        },
        // onComplete
        (result) => {
          this.suggestionWidget.completeSuggestion(result);

          // Record buying signals and objections
          if (result.suggestion?.analysis) {
            const analysis = result.suggestion.analysis;

            if (analysis.buying_signals) {
              analysis.buying_signals.forEach(signal => {
                stateManager.recordBuyingSignal(signal);
              });
            }

            if (analysis.objections) {
              analysis.objections.forEach(objection => {
                stateManager.recordObjection(objection);
              });
            }
          }
        },
        // onError
        (error) => {
          console.error('❌ AI streaming error:', error);
        }
      );

    } catch (error) {
      console.error('Error generating suggestion:', error);
    }
  }

  /**
   * Detect speaker (simplified)
   */
  detectSpeaker(text) {
    // Simple heuristic: questions usually from salesperson
    if (text.trim().endsWith('?')) {
      return 'salesperson';
    }

    // Use conversation buffer to alternate
    const buffer = stateManager.get('conversation.buffer');
    const lastSpeaker = buffer[buffer.length - 1]?.speaker;

    return lastSpeaker === 'client' ? 'salesperson' : 'client';
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
