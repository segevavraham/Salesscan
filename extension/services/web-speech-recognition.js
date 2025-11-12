/**
 * Web Speech Recognition Service
 * Uses Chrome's built-in speech recognition (FREE!)
 * Excellent Hebrew support
 */

export class WebSpeechRecognitionService {
  constructor(config = {}) {
    this.language = config.language || 'he-IL';
    this.onTranscript = config.onTranscript || (() => {});
    this.onPartialTranscript = config.onPartialTranscript || (() => {});
    this.onError = config.onError || (() => {});
    this.continuous = config.continuous !== false;
    this.interimResults = config.interimResults !== false;

    this.recognition = null;
    this.isActive = false;
    this.restartTimeout = null;

    // Prevent infinite restart loop
    this.restartCount = 0;
    this.maxRestarts = 5;
    this.restartWindow = 60000; // Reset counter after 1 minute
    this.lastRestartTime = null;
  }

  /**
   * Start recognition
   */
  start() {
    try {
      console.log('🎙️ Starting Web Speech Recognition...');

      // Check if browser supports it
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error('Speech recognition not supported in this browser');
      }

      // Create recognition instance
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = this.continuous;
      this.recognition.interimResults = this.interimResults;
      this.recognition.lang = this.language;
      this.recognition.maxAlternatives = 1;

      // Event handlers
      this.recognition.onstart = () => {
        console.log('✅ Speech recognition started');
        this.isActive = true;
      };

      this.recognition.onresult = (event) => {
        this.handleResult(event);
      };

      this.recognition.onerror = (event) => {
        console.error('❌ Speech recognition error:', event.error);

        // Auto-restart on certain errors
        if (event.error === 'no-speech' || event.error === 'audio-capture') {
          console.log('🔄 Auto-restarting recognition...');
          this.restart();
        } else {
          this.onError(new Error(event.error));
        }
      };

      this.recognition.onend = () => {
        console.log('🔌 Speech recognition ended');

        // Auto-restart if it was active
        if (this.isActive) {
          console.log('🔄 Auto-restarting recognition...');
          this.restart();
        }
      };

      // Start!
      this.recognition.start();
      console.log('🎤 Listening for speech...');

      return true;

    } catch (error) {
      console.error('Error starting speech recognition:', error);
      this.onError(error);
      return false;
    }
  }

  /**
   * Handle recognition results
   */
  handleResult(event) {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;

      console.log(`🎤 ${result.isFinal ? 'FINAL' : 'interim'}: "${transcript}" (${Math.round(confidence * 100)}%)`);

      if (result.isFinal) {
        // Final transcript
        this.onTranscript({
          text: transcript,
          confidence: confidence,
          isFinal: true,
          timestamp: Date.now()
        });
      } else {
        // Partial transcript
        this.onPartialTranscript({
          text: transcript,
          confidence: confidence,
          isFinal: false,
          timestamp: Date.now()
        });
      }
    }
  }

  /**
   * Stop recognition
   */
  stop() {
    console.log('🛑 Stopping speech recognition...');

    this.isActive = false;

    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.warn('Error stopping recognition:', error);
      }
      this.recognition = null;
    }

    console.log('✅ Speech recognition stopped');
  }

  /**
   * Restart recognition (with small delay and limit)
   */
  restart() {
    if (!this.isActive) return;

    // Check if we need to reset the counter
    const now = Date.now();
    if (this.lastRestartTime && (now - this.lastRestartTime > this.restartWindow)) {
      this.restartCount = 0;
      console.log('🔄 Restart counter reset');
    }

    // Check restart limit
    if (this.restartCount >= this.maxRestarts) {
      console.error('❌ Max restart limit reached. Stopping auto-restart.');
      this.onError(new Error(`Speech recognition failed after ${this.maxRestarts} attempts`));
      this.isActive = false;
      return;
    }

    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
    }

    this.restartCount++;
    this.lastRestartTime = now;

    console.log(`🔄 Restarting recognition (attempt ${this.restartCount}/${this.maxRestarts})`);

    this.restartTimeout = setTimeout(() => {
      if (this.isActive) {
        try {
          if (this.recognition) {
            this.recognition.start();
          } else {
            this.start();
          }
        } catch (error) {
          console.warn('Error restarting recognition:', error);
        }
      }
    }, 1000);
  }

  /**
   * Get status
   */
  getStatus() {
    return {
      isActive: this.isActive,
      language: this.language
    };
  }
}
