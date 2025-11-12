/**
 * Standalone Sales Coach - No Modules Required
 * All-in-one script that works without ES6 imports
 */

(function() {
  'use strict';

  console.log('🎯 Loading Standalone Sales Coach...');

  // Load external modules dynamically
  const loadModule = async (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'module';
      script.textContent = `
        import * as module from '${chrome.runtime.getURL(src)}';
        window.__loadedModule = module;
        window.dispatchEvent(new CustomEvent('module-loaded'));
      `;
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  // Wait for module to load
  const waitForModule = () => {
    return new Promise((resolve) => {
      window.addEventListener('module-loaded', () => {
        resolve(window.__loadedModule);
      }, { once: true });
    });
  };

  // Initialize when DOM is ready
  const init = async () => {
    try {
      console.log('📦 Loading modules...');

      // Load FloatingCoachAssistant
      loadModule('components/floating-coach-assistant.js');
      const floatingModule = await waitForModule();
      const FloatingCoachAssistant = floatingModule.FloatingCoachAssistant;

      // Load services
      loadModule('services/web-speech-recognition.js');
      const speechModule = await waitForModule();
      const WebSpeechRecognitionService = speechModule.WebSpeechRecognitionService;

      loadModule('services/openai-streaming.js');
      const openaiModule = await waitForModule();
      const OpenAIStreamingService = openaiModule.OpenAIStreamingService;

      console.log('✅ All modules loaded');

      // Create coach instance
      const coach = {
        floating: null,
        speech: null,
        openai: null,
        isActive: false,

        async init() {
          console.log('🎯 Initializing Standalone Coach...');

          // Initialize UI
          this.floating = new FloatingCoachAssistant();
          this.floating.initialize();

          // Load settings
          const { settings } = await chrome.storage.local.get('settings');
          const config = settings || {};

          // Initialize services
          this.speech = new WebSpeechRecognitionService({
            language: config.language || 'he-IL',
            onTranscript: (data) => this.handleTranscript(data),
            onError: (error) => this.handleError(error)
          });

          if (config.openAIKey) {
            this.openai = new OpenAIStreamingService({
              apiKey: config.openAIKey,
              model: config.model || 'gpt-4-turbo-preview'
            });
          }

          // Setup click handlers
          this.setupEventHandlers();

          console.log('✅ Standalone Coach initialized!');
          this.floating.showToast('מאמן המכירות מוכן! 🎯', 'success');
        },

        setupEventHandlers() {
          // Listen for clicks on the floating widget
          document.addEventListener('click', (e) => {
            const target = e.target.closest('.fca-compact, .fca-start-btn');
            if (target) {
              this.toggleCoaching();
            }
          });

          // Keyboard shortcuts
          document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
              e.preventDefault();
              this.toggleCoaching();
            }
          });
        },

        async toggleCoaching() {
          if (this.isActive) {
            await this.stop();
          } else {
            await this.start();
          }
        },

        async start() {
          if (this.isActive) return;

          console.log('🚀 Starting coaching...');

          if (!this.openai) {
            this.floating.showToast('נא להזין מפתח OpenAI בהגדרות', 'error');
            return;
          }

          try {
            // Start speech recognition
            this.speech.start();
            this.isActive = true;

            this.floating.updateStatus('listening');
            this.floating.showToast('מאזין לשיחה...', 'success');

            console.log('✅ Coaching started');
          } catch (error) {
            console.error('❌ Failed to start:', error);
            this.floating.showToast('שגיאה: ' + error.message, 'error');
          }
        },

        async stop() {
          if (!this.isActive) return;

          console.log('⏹️ Stopping coaching...');

          this.speech.stop();
          this.isActive = false;

          this.floating.updateStatus('idle');
          this.floating.showToast('הפסקתי להאזין', 'info');

          console.log('✅ Coaching stopped');
        },

        handleTranscript(data) {
          console.log('📝 Transcript:', data.text);

          // Show in UI
          this.floating.showTranscript({
            speaker: 'unknown',
            text: data.text,
            timestamp: Date.now()
          });

          // Generate suggestion if final
          if (data.isFinal && this.openai) {
            this.generateSuggestion(data.text);
          }
        },

        async generateSuggestion(text) {
          console.log('🤔 Generating suggestion...');
          this.floating.updateStatus('thinking');

          try {
            const messages = [
              {
                role: 'system',
                content: 'אתה מאמן מכירות מומחה. תן עצה קצרה ומעשית למוכר בעברית.'
              },
              {
                role: 'user',
                content: `הלקוח אמר: "${text}"\n\nמה אני אמור לענות?`
              }
            ];

            let suggestion = '';
            await this.openai.streamCompletion(
              messages,
              (chunk) => {
                suggestion += chunk;
              },
              () => {
                console.log('✅ Suggestion generated');
                this.floating.showSuggestion({
                  title: 'המלצה',
                  text: suggestion,
                  priority: 'medium',
                  actions: [
                    { text: 'העתק', action: 'copy' },
                    { text: 'סיימתי', action: 'done' }
                  ]
                });
                this.floating.updateStatus('listening');
              },
              (error) => {
                console.error('❌ Suggestion error:', error);
                this.floating.updateStatus('alert');
              }
            );
          } catch (error) {
            console.error('❌ Failed to generate suggestion:', error);
            this.floating.updateStatus('alert');
          }
        },

        handleError(error) {
          console.error('💥 Error:', error);
          this.floating.showToast('שגיאה: ' + error.message, 'error');
          this.floating.updateStatus('alert');
        }
      };

      // Initialize
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => coach.init());
      } else {
        coach.init();
      }

      // Make available globally
      window.salesCoach = coach;

    } catch (error) {
      console.error('💥 Failed to initialize Standalone Coach:', error);
    }
  };

  // Start initialization
  init();

})();
