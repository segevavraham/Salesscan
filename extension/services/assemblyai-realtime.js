/**
 * AssemblyAI Real-time Transcription Service
 * State-of-the-art real-time speech recognition with excellent Hebrew support
 */

export class AssemblyAIRealtimeService {
  constructor(config = {}) {
    this.apiKey = config.apiKey;
    this.language = config.language || 'he'; // Hebrew default
    this.socket = null;
    this.isConnected = false;
    this.sessionId = null;
    this.onTranscript = config.onTranscript || (() => {});
    this.onError = config.onError || (() => {});
    this.onPartialTranscript = config.onPartialTranscript || (() => {});

    // Advanced features
    this.enableSentimentAnalysis = config.enableSentimentAnalysis || true;
    this.enableEntityDetection = config.enableEntityDetection || true;
    this.enableTopicDetection = config.enableTopicDetection || true;

    this.mediaRecorder = null;
    this.audioContext = null;
    this.audioQueue = [];
    this.isProcessing = false;
  }

  /**
   * Get temporary token for WebSocket connection
   */
  async getTemporaryToken() {
    try {
      const response = await fetch('https://api.assemblyai.com/v2/realtime/token', {
        method: 'POST',
        headers: {
          'authorization': this.apiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          expires_in: 3600 // 1 hour
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to get token: ${response.status}`);
      }

      const data = await response.json();
      return data.token;

    } catch (error) {
      console.error('Error getting AssemblyAI token:', error);
      this.onError(error);
      throw error;
    }
  }

  /**
   * Connect to AssemblyAI Real-time WebSocket
   */
  async connect() {
    try {
      // Get temporary token
      const token = await this.getTemporaryToken();

      // Build WebSocket URL with parameters
      const params = new URLSearchParams({
        sample_rate: 16000,
        word_boost: JSON.stringify(['budget', 'price', 'timeline', 'decision']), // Sales-specific words
        ...(this.language !== 'en' && { language_code: this.language })
      });

      const wsUrl = `wss://api.assemblyai.com/v2/realtime/ws?${params.toString()}&token=${token}`;

      // Create WebSocket connection
      this.socket = new WebSocket(wsUrl);

      // Setup event handlers
      this.socket.onopen = () => {
        console.log('✅ AssemblyAI WebSocket connected');
        this.isConnected = true;
        this.sendConfiguration();
      };

      this.socket.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.socket.onerror = (error) => {
        console.error('❌ AssemblyAI WebSocket error:', error);
        this.onError(error);
      };

      this.socket.onclose = (event) => {
        console.log('🔌 AssemblyAI WebSocket closed:', event.code, event.reason);
        this.isConnected = false;

        // Auto-reconnect if not intentional close
        if (event.code !== 1000) {
          setTimeout(() => this.connect(), 2000);
        }
      };

      return true;

    } catch (error) {
      console.error('Error connecting to AssemblyAI:', error);
      this.onError(error);
      return false;
    }
  }

  /**
   * Send configuration to AssemblyAI
   */
  sendConfiguration() {
    if (!this.socket || !this.isConnected) return;

    const config = {
      sample_rate: 16000,
      enable_extra_session_information: true
    };

    // Add advanced features if enabled
    if (this.enableSentimentAnalysis) {
      config.sentiment_analysis = true;
    }

    if (this.enableEntityDetection) {
      config.entity_detection = true;
    }

    console.log('📤 Sending configuration to AssemblyAI:', config);
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(data) {
    try {
      const message = JSON.parse(data);

      switch (message.message_type) {
        case 'SessionBegins':
          this.sessionId = message.session_id;
          console.log('🎙️ AssemblyAI session started:', this.sessionId);
          break;

        case 'PartialTranscript':
          // Real-time partial results
          this.onPartialTranscript({
            text: message.text,
            confidence: message.confidence,
            words: message.words,
            audio_start: message.audio_start,
            audio_end: message.audio_end,
            isFinal: false
          });
          break;

        case 'FinalTranscript':
          // Final transcript with all metadata
          const transcript = {
            text: message.text,
            confidence: message.confidence,
            words: message.words,
            audio_start: message.audio_start,
            audio_end: message.audio_end,
            isFinal: true,
            created: message.created,

            // Advanced features
            sentiment: message.sentiment_analysis_results || null,
            entities: message.entities || null,
            topics: message.iab_categories_result || null
          };

          this.onTranscript(transcript);
          break;

        case 'SessionTerminated':
          console.log('🛑 AssemblyAI session terminated');
          this.isConnected = false;
          break;

        default:
          console.log('📨 Unknown message type:', message.message_type);
      }

    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  /**
   * Start streaming audio from microphone
   */
  async startStreaming(stream) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      // Create AudioContext for processing
      this.audioContext = new AudioContext({ sampleRate: 16000 });
      const source = this.audioContext.createMediaStreamSource(stream);

      // Create ScriptProcessor for audio chunks
      const processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        if (!this.isConnected) return;

        const inputData = e.inputBuffer.getChannelData(0);

        // Convert Float32Array to Int16Array (required by AssemblyAI)
        const pcmData = this.floatTo16BitPCM(inputData);

        // Send to AssemblyAI
        this.sendAudioData(pcmData);
      };

      source.connect(processor);
      processor.connect(this.audioContext.destination);

      console.log('🎤 Started streaming audio to AssemblyAI');
      return true;

    } catch (error) {
      console.error('Error starting audio stream:', error);
      this.onError(error);
      return false;
    }
  }

  /**
   * Convert Float32Array to Int16Array PCM
   */
  floatTo16BitPCM(float32Array) {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16Array;
  }

  /**
   * Send audio data to AssemblyAI
   */
  sendAudioData(audioData) {
    if (!this.socket || !this.isConnected) return;

    try {
      // Convert Int16Array to base64
      const base64Audio = this.arrayBufferToBase64(audioData.buffer);

      // Send audio chunk
      this.socket.send(JSON.stringify({
        audio_data: base64Audio
      }));

    } catch (error) {
      console.error('Error sending audio data:', error);
    }
  }

  /**
   * Convert ArrayBuffer to base64
   */
  arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Stop streaming and disconnect
   */
  async stop() {
    try {
      // Stop audio context
      if (this.audioContext) {
        await this.audioContext.close();
        this.audioContext = null;
      }

      // Send termination message
      if (this.socket && this.isConnected) {
        this.socket.send(JSON.stringify({
          terminate_session: true
        }));
      }

      // Close WebSocket
      if (this.socket) {
        this.socket.close(1000, 'Client disconnect');
        this.socket = null;
      }

      this.isConnected = false;
      this.sessionId = null;

      console.log('🛑 AssemblyAI streaming stopped');

    } catch (error) {
      console.error('Error stopping AssemblyAI:', error);
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      sessionId: this.sessionId,
      language: this.language
    };
  }
}

/**
 * Alternative: Deepgram Real-time Service
 * Another excellent option with great performance
 */
export class DeepgramRealtimeService {
  constructor(config = {}) {
    this.apiKey = config.apiKey;
    this.language = config.language || 'he';
    this.socket = null;
    this.isConnected = false;
    this.onTranscript = config.onTranscript || (() => {});
    this.onError = config.onError || (() => {});
  }

  async connect() {
    try {
      // Build Deepgram WebSocket URL
      const params = new URLSearchParams({
        language: this.language,
        model: 'nova-2', // Latest model
        smart_format: 'true',
        punctuate: 'true',
        interim_results: 'true',
        endpointing: '300',
        utterance_end_ms: '1000'
      });

      const wsUrl = `wss://api.deepgram.com/v1/listen?${params.toString()}`;

      this.socket = new WebSocket(wsUrl, ['token', this.apiKey]);

      this.socket.onopen = () => {
        console.log('✅ Deepgram WebSocket connected');
        this.isConnected = true;
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.channel?.alternatives?.[0]) {
          const alternative = data.channel.alternatives[0];

          this.onTranscript({
            text: alternative.transcript,
            confidence: alternative.confidence,
            words: alternative.words,
            isFinal: data.is_final,
            speech_final: data.speech_final
          });
        }
      };

      this.socket.onerror = (error) => {
        console.error('❌ Deepgram error:', error);
        this.onError(error);
      };

      this.socket.onclose = () => {
        console.log('🔌 Deepgram closed');
        this.isConnected = false;
      };

      return true;

    } catch (error) {
      console.error('Error connecting to Deepgram:', error);
      return false;
    }
  }

  async startStreaming(stream) {
    if (!this.isConnected) {
      await this.connect();
    }

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && this.socket && this.isConnected) {
        this.socket.send(event.data);
      }
    };

    mediaRecorder.start(250); // Send chunks every 250ms
    this.mediaRecorder = mediaRecorder;
  }

  async stop() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
    }

    if (this.socket) {
      this.socket.close();
    }
  }
}
