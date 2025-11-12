/**
 * Premium Sales Coach - Master Orchestrator
 * מערכת מושלמת שמשלבת את כל הרכיבים
 */

import { FloatingCoachAssistant } from '../components/floating-coach-assistant.js';
import { AdvancedAudioCapture } from '../services/advanced-audio-capture.js';
import { SpeakerDiarization } from '../services/speaker-diarization.js';
import { WebSpeechRecognitionService } from '../services/web-speech-recognition.js';
import { AssemblyAIRealtimeService } from '../services/assemblyai-realtime.js';
import { OpenAIStreamingService } from '../services/openai-streaming.js';
import { ProactiveCoachingEngine } from '../services/proactive-coaching-engine.js';
import { stateManager } from '../utils/state-manager.js';

export class PremiumSalesCoach {
  constructor() {
    // UI Components
    this.floatingAssistant = null;

    // Services
    this.audioCapture = null;
    this.speakerDiarization = null;
    this.speechRecognition = null;
    this.openAI = null;
    this.proactiveCoach = null;

    // State
    this.isActive = false;
    this.isStarting = false; // Race condition protection
    this.sessionStartTime = null;
    this.transcriptionMode = 'web-speech'; // 'web-speech' or 'assemblyai'

    // Configuration
    this.config = {
      openAIKey: null,
      assemblyAIKey: null,
      language: 'he',
      model: 'gpt-4-turbo-preview',
      enableProactiveCoaching: true,
      enableSpeakerDiarization: true,
      usePremiumTranscription: false // AssemblyAI
    };

    // Performance tracking
    this.stats = {
      transcriptCount: 0,
      suggestionsGenerated: 0,
      averageResponseTime: 0,
      sessionDuration: 0
    };
  }

  /**
   * Initialize the premium coach
   */
  async init() {
    console.log('');
    console.log('╔═══════════════════════════════════════════════╗');
    console.log('║  🎯 Premium Sales Coach v3.0 - Starting...   ║');
    console.log('╚═══════════════════════════════════════════════╝');
    console.log('');

    try {
      // Load configuration
      await this.loadConfig();

      // Initialize UI
      this.initializeUI();

      // Setup message listeners
      this.setupMessageListeners();

      // Setup keyboard shortcuts
      this.setupKeyboardShortcuts();

      // Check meeting platform
      this.detectMeetingPlatform();

      console.log('✅ Premium Sales Coach initialized successfully!');
      console.log('');
      console.log('📋 Configuration:');
      console.log('  • OpenAI API:', this.config.openAIKey ? '✅ Connected' : '❌ Missing');
      console.log('  • AssemblyAI API:', this.config.assemblyAIKey ? '✅ Connected' : '⚠️ Optional');
      console.log('  • Language:', this.config.language);
      console.log('  • Transcription Mode:', this.transcriptionMode);
      console.log('  • Speaker Diarization:', this.config.enableSpeakerDiarization ? '✅ Enabled' : '❌ Disabled');
      console.log('  • Proactive Coaching:', this.config.enableProactiveCoaching ? '✅ Enabled' : '❌ Disabled');
      console.log('');

      // Show welcome toast
      this.floatingAssistant.showToast('מאמן המכירות מוכן! לחץ על הכפתור הסגול להתחלה 🎯', 'success');

    } catch (error) {
      console.error('❌ Failed to initialize Premium Sales Coach:', error);
      throw error;
    }
  }

  /**
   * Load configuration from storage
   */
  async loadConfig() {
    try {
      const result = await chrome.storage.local.get('settings');
      const settings = result.settings || {};

      // Convert language code
      let languageCode = settings.language || 'he-IL';
      if (languageCode.includes('-')) {
        languageCode = languageCode.split('-')[0];
      }

      this.config = {
        openAIKey: settings.openAIKey || null,
        assemblyAIKey: settings.assemblyAIKey || null,
        language: languageCode,
        model: settings.model || 'gpt-4-turbo-preview',
        enableProactiveCoaching: settings.enableProactiveCoaching !== false,
        enableSpeakerDiarization: settings.enableSpeakerDiarization !== false,
        usePremiumTranscription: settings.usePremiumTranscription === true
      };

      // Determine transcription mode
      if (this.config.usePremiumTranscription && this.config.assemblyAIKey) {
        this.transcriptionMode = 'assemblyai';
      } else {
        this.transcriptionMode = 'web-speech';
      }

      // Validate critical config
      if (!this.config.openAIKey) {
        console.warn('⚠️ OpenAI API key missing - AI coaching will not work');
      }

    } catch (error) {
      console.error('Error loading config:', error);
      throw error;
    }
  }

  /**
   * Initialize UI components
   */
  initializeUI() {
    // Create floating assistant
    this.floatingAssistant = new FloatingCoachAssistant();
    this.floatingAssistant.initialize();

    console.log('✅ UI components initialized');
  }

  /**
   * Start the coaching session
   */
  async start() {
    // Race condition protection
    if (this.isActive) {
      console.warn('⚠️ Coaching session already active');
      return;
    }

    if (this.isStarting) {
      console.warn('⚠️ Coaching session already starting');
      return;
    }

    this.isStarting = true;

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 Starting Coaching Session...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    try {
      // Validate API keys
      if (!this.config.openAIKey) {
        this.floatingAssistant.showToast('❌ נדרש מפתח OpenAI API! אנא הגדר במסך ההגדרות', 'error');
        chrome.runtime.openOptionsPage();
        return;
      }

      // Update UI
      this.floatingAssistant.updateStatus('thinking');

      // Initialize services
      await this.initializeServices();

      // Start audio capture
      console.log('🎤 Starting audio capture...');
      const audioStarted = await this.audioCapture.start();
      if (!audioStarted) {
        throw new Error('Failed to start audio capture');
      }

      // Start speech recognition
      console.log('🗣️ Starting speech recognition...');
      const speechStarted = this.speechRecognition.start();
      if (!speechStarted) {
        throw new Error('Failed to start speech recognition');
      }

      // Update state
      this.isActive = true;
      this.isStarting = false; // Clear starting flag
      this.sessionStartTime = Date.now();
      stateManager.startSession('premium');

      // Update UI
      this.floatingAssistant.updateStatus('listening');
      this.floatingAssistant.showToast('✅ מאזין לשיחה! אתחיל לתת עצות כשהלקוח ידבר', 'success');

      console.log('');
      console.log('✅ Coaching session started successfully!');
      console.log('📊 Monitoring conversation...');
      console.log('');

    } catch (error) {
      console.error('❌ Error starting coaching session:', error);

      let errorMessage = 'שגיאה בהפעלת המאמן:\n\n';

      if (error.message.includes('audio') || error.name === 'NotAllowedError') {
        errorMessage += '🎤 נדרשת גישה למיקרופון. אנא אפשר גישה ונסה שוב.';
      } else if (error.message.includes('API') || error.message.includes('401')) {
        errorMessage += '🔑 בעיה במפתחות ה-API. אנא בדוק את ההגדרות.';
      } else {
        errorMessage += error.message;
      }

      this.floatingAssistant.showToast(errorMessage, 'error');
      this.floatingAssistant.updateStatus('alert');

      // Clear starting flag on error
      this.isStarting = false;

      // Cleanup
      await this.stop();
    }
  }

  /**
   * Initialize all services
   */
  async initializeServices() {
    // Audio Capture
    this.audioCapture = new AdvancedAudioCapture({
      onAudioData: (data) => this.handleAudioData(data),
      onError: (error) => this.handleError(error)
    });

    // Speaker Diarization
    if (this.config.enableSpeakerDiarization) {
      this.speakerDiarization = new SpeakerDiarization({
        openAIKey: this.config.openAIKey,
        language: this.config.language
      });
      console.log('✅ Speaker diarization initialized');
    }

    // Speech Recognition
    if (this.transcriptionMode === 'assemblyai') {
      this.speechRecognition = new AssemblyAIRealtimeService({
        apiKey: this.config.assemblyAIKey,
        language: this.config.language,
        onTranscript: (transcript) => this.handleFinalTranscript(transcript),
        onPartialTranscript: (transcript) => this.handlePartialTranscript(transcript),
        onError: (error) => this.handleError(error)
      });
      console.log('✅ AssemblyAI transcription initialized (premium)');
    } else {
      this.speechRecognition = new WebSpeechRecognitionService({
        language: this.config.language === 'he' ? 'he-IL' : 'en-US',
        continuous: true,
        interimResults: true,
        onTranscript: (transcript) => this.handleFinalTranscript(transcript),
        onPartialTranscript: (transcript) => this.handlePartialTranscript(transcript),
        onError: (error) => this.handleError(error)
      });
      console.log('✅ Web Speech Recognition initialized (free)');
    }

    // OpenAI Streaming
    this.openAI = new OpenAIStreamingService({
      apiKey: this.config.openAIKey,
      model: this.config.model
    });
    console.log('✅ OpenAI streaming initialized');

    // Proactive Coaching
    if (this.config.enableProactiveCoaching) {
      this.proactiveCoach = new ProactiveCoachingEngine();
      console.log('✅ Proactive coaching initialized');
    }
  }

  /**
   * Handle audio data from capture
   */
  handleAudioData(data) {
    // Could be used for additional audio analysis
    // For now, we rely on speech recognition services
  }

  /**
   * Handle final transcript
   */
  async handleFinalTranscript(transcript) {
    console.log('');
    console.log('📝 ═══════════ NEW TRANSCRIPT ═══════════');
    console.log('📄 Text:', transcript.text);
    console.log('🎯 Confidence:', (transcript.confidence * 100).toFixed(1) + '%');

    this.stats.transcriptCount++;

    // Detect speaker
    let speaker = 'unknown';
    let speakerConfidence = 0;

    if (this.speakerDiarization) {
      console.log('🔍 Detecting speaker...');
      const speakerResult = await this.speakerDiarization.detectSpeaker(
        { text: transcript.text },
        { conversationHistory: stateManager.get('conversation.buffer') }
      );
      speaker = speakerResult.speaker;
      speakerConfidence = speakerResult.confidence;
      console.log(`👤 Speaker: ${speaker.toUpperCase()} (${(speakerConfidence * 100).toFixed(1)}% confidence)`);
    } else {
      // Fallback: simple detection
      speaker = this.detectSpeakerSimple(transcript.text);
      speakerConfidence = 0.6;
      console.log(`👤 Speaker: ${speaker.toUpperCase()} (simple detection)`);
    }

    // Add to state
    stateManager.addMessage({
      speaker,
      text: transcript.text,
      sentiment: transcript.sentiment,
      confidence: transcript.confidence,
      speakerConfidence,
      timestamp: Date.now()
    });

    // Show in UI
    this.floatingAssistant.showTranscript({
      speaker,
      text: transcript.text
    });

    // Generate AI suggestion if client spoke
    if (speaker === 'client') {
      console.log('🤖 CLIENT SPOKE! Generating AI coaching...');
      this.floatingAssistant.updateStatus('thinking');
      await this.generateAICoaching();
    } else {
      console.log('🎤 You spoke - waiting for client response');
    }

    // Run proactive coaching checks
    if (this.proactiveCoach && speaker === 'client') {
      await this.runProactiveCoaching();
    }

    console.log('═══════════════════════════════════════════');
    console.log('');
  }

  /**
   * Handle partial transcript (for live display)
   */
  handlePartialTranscript(transcript) {
    // Could show in UI for real-time feedback
    // For now, we only show final transcripts
  }

  /**
   * Generate AI coaching suggestion
   */
  async generateAICoaching() {
    const startTime = Date.now();

    try {
      // Get conversation context
      const context = stateManager.getConversationContext(10);

      console.log('🤖 Sending to OpenAI...');
      console.log('📊 Context length:', context.length, 'chars');

      let fullResponse = '';
      let suggestion = null;

      // Stream from OpenAI
      await this.openAI.streamCompletion(
        context,
        // onChunk
        (chunk) => {
          fullResponse = chunk.fullContent;
          // Could show streaming text in UI
        },
        // onComplete
        (result) => {
          suggestion = result.suggestion;
          const responseTime = Date.now() - startTime;

          console.log('✅ AI response received');
          console.log('⏱️ Response time:', responseTime + 'ms');

          // Update stats
          this.stats.suggestionsGenerated++;
          this.stats.averageResponseTime =
            (this.stats.averageResponseTime * (this.stats.suggestionsGenerated - 1) + responseTime) /
            this.stats.suggestionsGenerated;

          // Display in UI
          if (suggestion && suggestion.suggestions && suggestion.suggestions.best_response) {
            this.floatingAssistant.showSuggestion({
              title: 'המלצה מהמאמן',
              text: suggestion.suggestions.best_response,
              actions: [
                {
                  id: 'copy-main',
                  text: suggestion.suggestions.best_response
                },
                ...(suggestion.suggestions.alternative_responses || []).map((alt, i) => ({
                  id: `copy-alt-${i}`,
                  text: alt
                }))
              ]
            });

            // Record buying signals and objections
            if (suggestion.analysis) {
              if (suggestion.analysis.buying_signals) {
                suggestion.analysis.buying_signals.forEach(signal => {
                  stateManager.recordBuyingSignal(signal);
                });
              }

              if (suggestion.analysis.objections_hidden) {
                suggestion.analysis.objections_hidden.forEach(objection => {
                  stateManager.recordObjection(objection);
                });
              }
            }
          } else {
            // Fallback display
            this.floatingAssistant.showSuggestion({
              title: 'עצה מהמאמן',
              text: fullResponse
            });
          }

          this.floatingAssistant.updateStatus('listening');
        },
        // onError
        (error) => {
          console.error('❌ OpenAI streaming error:', error);
          this.floatingAssistant.showToast('שגיאה בקבלת עצה מהמאמן', 'error');
          this.floatingAssistant.updateStatus('alert');
        }
      );

    } catch (error) {
      console.error('❌ Error generating AI coaching:', error);
      this.floatingAssistant.showToast('שגיאה בייצור עצה', 'error');
      this.floatingAssistant.updateStatus('listening');
    }
  }

  /**
   * Run proactive coaching checks
   */
  async runProactiveCoaching() {
    if (!this.proactiveCoach) return;

    const context = {
      duration: Date.now() - this.sessionStartTime,
      talkRatio: stateManager.calculateTalkRatioPercentage(),
      currentSentiment: stateManager.get('analytics.sentimentHistory').slice(-1)[0]?.value,
      sentimentHistory: stateManager.get('analytics.sentimentHistory').map(s => s.value),
      buyingSignals: stateManager.get('analytics.buyingSignals'),
      objections: stateManager.get('analytics.objections'),
      questionCount: stateManager.get('conversation.buffer').filter(m =>
        m.speaker === 'salesperson' && m.text.includes('?')
      ).length,
      totalMessages: stateManager.get('conversation.totalMessages')
    };

    const triggeredRules = this.proactiveCoach.evaluate(context);

    if (triggeredRules.length > 0) {
      const topRule = triggeredRules[0];

      // Show urgent alert
      if (topRule.priority === 'critical' || topRule.priority === 'high') {
        this.floatingAssistant.showToast(
          `⚠️ ${topRule.message}`,
          topRule.priority === 'critical' ? 'error' : 'warning'
        );
      }

      console.log('⚡ Proactive coaching triggered:', topRule.id);
    }
  }

  /**
   * Simple speaker detection (fallback)
   */
  detectSpeakerSimple(text) {
    const lowerText = text.toLowerCase();

    const salespersonKeywords = ['אני', 'נוכל', 'אנחנו', 'החברה שלנו'];
    const clientKeywords = ['מעניין', 'כמה זה', 'מתי', 'איך'];

    const salespersonScore = salespersonKeywords.filter(k => lowerText.includes(k)).length;
    const clientScore = clientKeywords.filter(k => lowerText.includes(k)).length;

    return salespersonScore > clientScore ? 'salesperson' : 'client';
  }

  /**
   * Stop the coaching session
   */
  async stop() {
    console.log('');
    console.log('⏹️ Stopping coaching session...');

    this.isActive = false;

    // Stop audio capture
    if (this.audioCapture) {
      await this.audioCapture.stop();
    }

    // Stop speech recognition
    if (this.speechRecognition) {
      if (this.transcriptionMode === 'assemblyai') {
        await this.speechRecognition.stop();
      } else {
        this.speechRecognition.stop();
      }
    }

    // Cancel ongoing AI requests
    if (this.openAI) {
      this.openAI.cancelStream();
    }

    // Update state
    stateManager.endSession();

    // Reset speaker diarization
    if (this.speakerDiarization) {
      this.speakerDiarization.reset();
    }

    // Calculate session duration
    if (this.sessionStartTime) {
      this.stats.sessionDuration = Date.now() - this.sessionStartTime;
      console.log('📊 Session stats:');
      console.log('  • Duration:', Math.round(this.stats.sessionDuration / 1000) + 's');
      console.log('  • Transcripts:', this.stats.transcriptCount);
      console.log('  • Suggestions:', this.stats.suggestionsGenerated);
      console.log('  • Avg response time:', Math.round(this.stats.averageResponseTime) + 'ms');
    }

    // Update UI
    this.floatingAssistant.updateStatus('listening');
    this.floatingAssistant.showToast('הפגישה הסתיימה. מקווה שעזרתי! 🎯', 'success');

    console.log('✅ Coaching session stopped');
    console.log('');
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
   * Setup message listeners
   */
  setupMessageListeners() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.type) {
        case 'TOGGLE_COACH':
          this.toggle();
          sendResponse({ success: true });
          break;

        case 'GET_STATUS':
          sendResponse({
            isActive: this.isActive,
            stats: this.stats,
            config: {
              ...this.config,
              openAIKey: this.config.openAIKey ? '***' : null,
              assemblyAIKey: this.config.assemblyAIKey ? '***' : null
            }
          });
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

      // Ctrl+Shift+H - Hide/Show UI
      if (e.ctrlKey && e.shiftKey && e.key === 'H') {
        e.preventDefault();
        this.floatingAssistant.toggle();
      }

      // Ctrl+Shift+O - Open Settings
      if (e.ctrlKey && e.shiftKey && e.key === 'O') {
        e.preventDefault();
        chrome.runtime.openOptionsPage();
      }
    });

    console.log('⌨️ Keyboard shortcuts enabled:');
    console.log('  • Ctrl+Shift+S: Start/Stop');
    console.log('  • Ctrl+Shift+H: Hide/Show');
    console.log('  • Ctrl+Shift+O: Settings');
  }

  /**
   * Detect meeting platform
   */
  detectMeetingPlatform() {
    const url = window.location.href;

    if (url.includes('meet.google.com')) {
      console.log('🎥 Platform: Google Meet');
    } else if (url.includes('zoom.us')) {
      console.log('🎥 Platform: Zoom');
    } else if (url.includes('teams.microsoft.com')) {
      console.log('🎥 Platform: Microsoft Teams');
    } else if (url.includes('webex.com')) {
      console.log('🎥 Platform: Webex');
    } else {
      console.log('🎥 Platform: Unknown (demo/testing mode)');
    }
  }

  /**
   * Handle errors
   */
  handleError(error) {
    console.error('💥 Premium Sales Coach Error:', error);
    this.floatingAssistant.showToast('שגיאה: ' + error.message, 'error');
    this.floatingAssistant.updateStatus('alert');
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.premiumSalesCoach = new PremiumSalesCoach();
    window.premiumSalesCoach.init();
  });
} else {
  window.premiumSalesCoach = new PremiumSalesCoach();
  window.premiumSalesCoach.init();
}

console.log('🎯 Premium Sales Coach v3.0 Script Loaded');
