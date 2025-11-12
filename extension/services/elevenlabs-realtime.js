/**
 * ElevenLabs Real-time Speech-to-Text Service
 * High-quality transcription with excellent Hebrew support using Conversational AI
 */

(function() {
  class ElevenLabsRealtimeService {
    constructor(config = {}) {
      this.apiKey = config.apiKey;
      this.language = config.language || 'he'; // Hebrew default
      this.socket = null;
      this.isConnected = false;
      this.conversationId = null;
      this.onTranscript = config.onTranscript || (() => {});
      this.onError = config.onError || (() => {});
      this.onPartialTranscript = config.onPartialTranscript || (() => {});
      this.agentId = config.agentId; // ElevenLabs Conversational AI agent ID

      this.mediaRecorder = null;
      this.audioContext = null;
      this.audioQueue = [];
      this.isProcessing = false;
    }

    /**
     * Connect to ElevenLabs Conversational AI WebSocket
     */
    async connect() {
      try {
        if (!this.apiKey) {
          throw new Error('ElevenLabs API key is required');
        }

        // ElevenLabs Conversational AI WebSocket endpoint
        const wsUrl = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${this.agentId || 'default'}`;

        // Create WebSocket connection
        this.socket = new WebSocket(wsUrl);

        // Setup event handlers
        this.socket.onopen = () => {
          console.log('✅ ElevenLabs Conversational AI WebSocket connected');
          this.isConnected = true;
          this.startConversation();
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
          if (event.code !== 1000 && event.code !== 1006) {
            console.log('🔄 Reconnecting in 2 seconds...');
            setTimeout(() => this.connect(), 2000);
          }
        };

        return true;

      } catch (error) {
        console.error('❌ Error connecting to ElevenLabs:', error);
        this.onError(error);
        return false;
      }
    }

    /**
     * Start conversation session
     */
    startConversation() {
      if (!this.socket || !this.isConnected) return;

      const initMessage = {
        type: 'conversation_initiation_client_data',
        conversation_config_override: {
          agent: {
            prompt: {
              prompt: 'You are a helpful sales coach assistant. Transcribe the conversation and provide insights.',
              llm: 'gpt-4'
            },
            language: this.language,
          },
          asr: {
            quality: 'high',
            provider: 'elevenlabs', // Use ElevenLabs ASR
            language: this.language
          }
        }
      };

      this.socket.send(JSON.stringify(initMessage));
      console.log('🎙️ ElevenLabs conversation initiated');
    }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(data) {
    try {
      const message = JSON.parse(data);

      switch (message.type) {
        case 'conversation_initiation_metadata':
          this.conversationId = message.conversation_id;
          console.log('🎙️ ElevenLabs conversation started:', this.conversationId);
          break;

        case 'user_transcript':
          // User's speech transcript (this is what we want!)
          if (message.user_transcript) {
            const transcript = {
              text: message.user_transcript,
              confidence: 0.95,
              isFinal: true,
              timestamp: Date.now(),
              language: this.language,
              speaker: 'user'
            };
            this.onTranscript(transcript);
            console.log('📝 User transcript:', message.user_transcript);
          }
          break;

        case 'agent_response':
          // Agent's response (we can ignore or log)
          console.log('🤖 Agent response:', message.agent_response);
          break;

        case 'audio':
          // Audio from agent (ignore for transcription)
          break;

        case 'ping':
          // Respond to ping to keep connection alive
          if (this.socket && this.isConnected) {
            this.socket.send(JSON.stringify({ type: 'pong' }));
          }
          break;

        case 'error':
          console.error('❌ ElevenLabs error:', message.message || message.error);
          this.onError(new Error(message.message || message.error || 'Unknown error'));
          break;

        default:
          console.log('📨 ElevenLabs message:', message.type);
      }

    } catch (error) {
      console.error('❌ Error handling message:', error);
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

      // Send audio chunk - ElevenLabs Conversational AI format
      this.socket.send(JSON.stringify({
        type: 'user_audio_chunk',
        audio_chunk: base64Audio,
        sample_rate: 16000,
        encoding: 'pcm_16'
      }));

    } catch (error) {
      console.error('❌ Error sending audio data:', error);
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
      conversationId: this.conversationId,
      language: this.language
    };
  }
}

  // Export to window for non-module usage
  if (typeof window !== 'undefined') {
    window.ElevenLabsRealtimeService = ElevenLabsRealtimeService;
  }

  // Also export for module usage
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ElevenLabsRealtimeService };
  }
})();

console.log('📦 ElevenLabs Realtime Service loaded');
