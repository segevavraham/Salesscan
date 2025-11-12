/**
 * Speech-to-Text Service
 * Handles real-time speech recognition
 */

export class SpeechToTextService {
  constructor(options = {}) {
    this.language = options.language || 'he-IL';
    this.continuous = options.continuous !== false;
    this.interimResults = options.interimResults !== false;
    this.recognition = null;
    this.onTranscript = options.onTranscript || (() => {});
    this.onError = options.onError || (() => {});
    this.isListening = false;
  }

  /**
   * Check if speech recognition is supported
   */
  static isSupported() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  /**
   * Start speech recognition
   */
  start() {
    if (!SpeechToTextService.isSupported()) {
      const error = new Error('Speech recognition not supported in this browser');
      this.onError(error);
      return false;
    }

    if (this.isListening) {
      console.warn('Speech recognition already running');
      return false;
    }

    try {
      // Create recognition instance
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();

      // Configure recognition
      this.recognition.continuous = this.continuous;
      this.recognition.interimResults = this.interimResults;
      this.recognition.lang = this.language;
      this.recognition.maxAlternatives = 1;

      // Handle results
      this.recognition.onresult = (event) => {
        this.handleResult(event);
      };

      // Handle errors
      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        this.onError(event.error);

        // Restart on certain errors
        if (event.error === 'no-speech' || event.error === 'audio-capture') {
          this.restart();
        }
      };

      // Handle end
      this.recognition.onend = () => {
        this.isListening = false;

        // Auto-restart if continuous
        if (this.continuous) {
          setTimeout(() => this.restart(), 100);
        }
      };

      // Start recognition
      this.recognition.start();
      this.isListening = true;

      console.log('Speech recognition started');
      return true;

    } catch (error) {
      console.error('Error starting speech recognition:', error);
      this.onError(error);
      return false;
    }
  }

  /**
   * Stop speech recognition
   */
  stop() {
    if (this.recognition && this.isListening) {
      this.continuous = false; // Prevent auto-restart
      this.recognition.stop();
      this.isListening = false;
      console.log('Speech recognition stopped');
    }
  }

  /**
   * Restart speech recognition
   */
  restart() {
    if (this.recognition && this.continuous) {
      try {
        this.recognition.start();
        this.isListening = true;
      } catch (error) {
        console.error('Error restarting speech recognition:', error);
      }
    }
  }

  /**
   * Handle speech recognition result
   */
  handleResult(event) {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      const isFinal = result.isFinal;

      // Call callback with transcript data
      this.onTranscript({
        text: transcript,
        confidence: confidence,
        isFinal: isFinal,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Change language
   */
  setLanguage(language) {
    this.language = language;
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }

  /**
   * Get current state
   */
  getState() {
    return {
      isListening: this.isListening,
      language: this.language,
      continuous: this.continuous
    };
  }
}

/**
 * Alternative: OpenAI Whisper API for more accurate transcription
 * This would be used on the backend
 */
export class WhisperTranscriptionService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl = 'https://api.openai.com/v1/audio/transcriptions';
  }

  /**
   * Transcribe audio using Whisper API
   */
  async transcribe(audioBlob, options = {}) {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', options.model || 'whisper-1');

      if (options.language) {
        formData.append('language', options.language);
      }

      if (options.prompt) {
        formData.append('prompt', options.prompt);
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Whisper API error: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        text: result.text
      };

    } catch (error) {
      console.error('Whisper transcription error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}
