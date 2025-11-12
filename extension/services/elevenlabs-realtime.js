/**
 * ElevenLabs Real-time Speech-to-Text Service
 * High-quality transcription with excellent Hebrew support
 */

export class ElevenLabsRealtimeService {
  constructor(config = {}) {
    this.apiKey = config.apiKey;
    this.language = config.language || 'he'; // Hebrew default
    this.socket = null;
    this.isConnected = false;
    this.sessionId = null;
    this.onTranscript = config.onTranscript || (() => {});
    this.onError = config.onError || (() => {});
    this.onPartialTranscript = config.onPartialTranscript || (() => {});

    this.mediaRecorder = null;
    this.audioContext = null;
    this.audioQueue = [];
    this.isProcessing = false;
  }

  /**
   * Connect to ElevenLabs WebSocket
   */
  async connect() {
    try {
      // ElevenLabs WebSocket endpoint
      const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/stream`;

      // Create WebSocket connection
      this.socket = new WebSocket(wsUrl);

      // Setup event handlers
      this.socket.onopen = () => {
        console.log('✅ ElevenLabs WebSocket connected');
        this.isConnected = true;
        this.authenticate();
      };

      this.socket.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.socket.onerror = (error) => {
        console.error('❌ ElevenLabs WebSocket error:', error);
        this.onError(error);
      };

      this.socket.onclose = (event) => {
        console.log('🔌 ElevenLabs WebSocket closed:', event.code, event.reason);
        this.isConnected = false;

        // Auto-reconnect if not intentional close
        if (event.code !== 1000) {
          setTimeout(() => this.connect(), 2000);
        }
      };

      return true;

    } catch (error) {
      console.error('Error connecting to ElevenLabs:', error);
      this.onError(error);
      return false;
    }
  }

  /**
   * Authenticate with API key
   */
  authenticate() {
    if (!this.socket || !this.isConnected) return;

    this.socket.send(JSON.stringify({
      type: 'auth',
      api_key: this.apiKey,
      language: this.language,
      model: 'eleven_multilingual_v2' // Best model for Hebrew
    }));

    console.log('🔑 Authenticating with ElevenLabs...');
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(data) {
    try {
      const message = JSON.parse(data);

      switch (message.type) {
        case 'auth_success':
          this.sessionId = message.session_id;
          console.log('🎙️ ElevenLabs session started:', this.sessionId);
          break;

        case 'partial_transcript':
          // Real-time partial results
          this.onPartialTranscript({
            text: message.text,
            confidence: message.confidence || 0.9,
            isFinal: false,
            timestamp: Date.now()
          });
          break;

        case 'final_transcript':
          // Final transcript
          const transcript = {
            text: message.text,
            confidence: message.confidence || 0.95,
            isFinal: true,
            timestamp: Date.now(),
            language: message.language || this.language,
            // ElevenLabs provides speaker diarization
            speaker: message.speaker || 'unknown'
          };

          this.onTranscript(transcript);
          break;

        case 'error':
          console.error('❌ ElevenLabs error:', message.message);
          this.onError(new Error(message.message));
          break;

        default:
          console.log('📨 Unknown message type:', message.type);
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

        // Convert Float32Array to Int16Array
        const pcmData = this.floatTo16BitPCM(inputData);

        // Send to ElevenLabs
        this.sendAudioData(pcmData);
      };

      source.connect(processor);
      processor.connect(this.audioContext.destination);

      console.log('🎤 Started streaming audio to ElevenLabs');
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
   * Send audio data to ElevenLabs
   */
  sendAudioData(audioData) {
    if (!this.socket || !this.isConnected) return;

    try {
      // Convert Int16Array to base64
      const base64Audio = this.arrayBufferToBase64(audioData.buffer);

      // Send audio chunk
      this.socket.send(JSON.stringify({
        type: 'audio',
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
          type: 'stop'
        }));
      }

      // Close WebSocket
      if (this.socket) {
        this.socket.close(1000, 'Client disconnect');
        this.socket = null;
      }

      this.isConnected = false;
      this.sessionId = null;

      console.log('🛑 ElevenLabs streaming stopped');

    } catch (error) {
      console.error('Error stopping ElevenLabs:', error);
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
