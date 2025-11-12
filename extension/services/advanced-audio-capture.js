/**
 * Advanced Audio Capture Service
 * תופס אודיו מהפגישה והמיקרופון בו-זמנית
 */

export class AdvancedAudioCapture {
  constructor(config = {}) {
    this.onAudioData = config.onAudioData || (() => {});
    this.onError = config.onError || (() => {});

    // Audio streams
    this.microphoneStream = null;
    this.tabAudioStream = null;
    this.mergedStream = null;

    // Audio processing
    this.audioContext = null;
    this.mediaRecorder = null;
    this.isCapturing = false;

    // Voice activity detection
    this.vad = {
      threshold: 0.01, // Minimum volume to consider as speech
      minSpeechDuration: 300, // ms
      maxSilenceDuration: 1500, // ms
      isSpeaking: false,
      speechStartTime: null,
      lastSpeechTime: null
    };
  }

  /**
   * Start capturing audio
   */
  async start() {
    try {
      console.log('🎤 Starting advanced audio capture...');

      // Get microphone stream
      this.microphoneStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });
      console.log('✅ Microphone stream acquired');

      // Try to get tab audio (for hearing other participants)
      try {
        this.tabAudioStream = await this.getTabAudioStream();
        console.log('✅ Tab audio stream acquired');
      } catch (error) {
        console.warn('⚠️ Could not get tab audio:', error.message);
        console.log('📝 Will use microphone only (may not hear other participants)');
      }

      // Create audio context
      this.audioContext = new AudioContext({ sampleRate: 16000 });

      // Merge streams if we have both
      if (this.tabAudioStream) {
        this.mergedStream = this.mergeAudioStreams(
          this.microphoneStream,
          this.tabAudioStream
        );
      } else {
        this.mergedStream = this.microphoneStream;
      }

      // Setup audio processing
      await this.setupAudioProcessing(this.mergedStream);

      this.isCapturing = true;
      console.log('✅ Advanced audio capture started');

      return true;

    } catch (error) {
      console.error('❌ Error starting audio capture:', error);
      this.onError(error);
      return false;
    }
  }

  /**
   * Get tab audio stream (for hearing meeting participants)
   */
  async getTabAudioStream() {
    // Request tab capture permission
    const streamId = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        type: 'GET_TAB_AUDIO_STREAM',
        tabId: chrome.runtime.id
      }, (response) => {
        if (response && response.streamId) {
          resolve(response.streamId);
        } else {
          reject(new Error('Failed to get stream ID'));
        }
      });
    });

    // Get the stream using the streamId
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: streamId
        }
      },
      video: false
    });

    return stream;
  }

  /**
   * Merge multiple audio streams
   */
  mergeAudioStreams(micStream, tabStream) {
    const audioContext = new AudioContext();

    // Create sources
    const micSource = audioContext.createMediaStreamSource(micStream);
    const tabSource = audioContext.createMediaStreamSource(tabStream);

    // Create destination
    const destination = audioContext.createMediaStreamDestination();

    // Connect both sources to destination
    micSource.connect(destination);
    tabSource.connect(destination);

    console.log('🔀 Audio streams merged successfully');
    return destination.stream;
  }

  /**
   * Setup audio processing pipeline
   */
  async setupAudioProcessing(stream) {
    const source = this.audioContext.createMediaStreamSource(stream);

    // Create analyzer for voice activity detection
    const analyzer = this.audioContext.createAnalyser();
    analyzer.fftSize = 2048;
    analyzer.smoothingTimeConstant = 0.8;

    source.connect(analyzer);

    // Start VAD monitoring
    this.startVoiceActivityDetection(analyzer);

    // Create media recorder for actual recording
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus',
      audioBitsPerSecond: 16000
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.onAudioData({
          data: event.data,
          timestamp: Date.now(),
          isSpeech: this.vad.isSpeaking
        });
      }
    };

    // Start recording in chunks
    this.mediaRecorder.start(250); // 250ms chunks
    console.log('🎙️ Media recorder started');
  }

  /**
   * Voice Activity Detection
   */
  startVoiceActivityDetection(analyzer) {
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const detectVoice = () => {
      if (!this.isCapturing) return;

      analyzer.getByteFrequencyData(dataArray);

      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength / 255; // Normalize to 0-1

      const now = Date.now();

      // Check if speech detected
      if (average > this.vad.threshold) {
        if (!this.vad.isSpeaking) {
          // Speech started
          this.vad.isSpeaking = true;
          this.vad.speechStartTime = now;
          console.log('🗣️ Speech detected');
        }
        this.vad.lastSpeechTime = now;
      } else {
        // Check if silence duration exceeded
        if (this.vad.isSpeaking && this.vad.lastSpeechTime) {
          const silenceDuration = now - this.vad.lastSpeechTime;
          if (silenceDuration > this.vad.maxSilenceDuration) {
            // Speech ended
            const speechDuration = this.vad.lastSpeechTime - this.vad.speechStartTime;
            if (speechDuration >= this.vad.minSpeechDuration) {
              console.log(`🔇 Speech ended (${speechDuration}ms)`);
            }
            this.vad.isSpeaking = false;
            this.vad.speechStartTime = null;
          }
        }
      }

      // Continue monitoring
      requestAnimationFrame(detectVoice);
    };

    detectVoice();
  }

  /**
   * Get current volume level (for visualization)
   */
  getVolumeLevel() {
    // Return normalized volume 0-1
    return this.vad.isSpeaking ? 0.7 : 0.1;
  }

  /**
   * Check if currently speaking
   */
  isSpeaking() {
    return this.vad.isSpeaking;
  }

  /**
   * Stop capturing
   */
  async stop() {
    console.log('🛑 Stopping audio capture...');

    this.isCapturing = false;

    // Stop media recorder
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    // Stop all streams
    if (this.microphoneStream) {
      this.microphoneStream.getTracks().forEach(track => track.stop());
      this.microphoneStream = null;
    }

    if (this.tabAudioStream) {
      this.tabAudioStream.getTracks().forEach(track => track.stop());
      this.tabAudioStream = null;
    }

    if (this.mergedStream) {
      this.mergedStream.getTracks().forEach(track => track.stop());
      this.mergedStream = null;
    }

    // Close audio context
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }

    console.log('✅ Audio capture stopped');
  }

  /**
   * Get capture status
   */
  getStatus() {
    return {
      isCapturing: this.isCapturing,
      hasMicrophone: this.microphoneStream !== null,
      hasTabAudio: this.tabAudioStream !== null,
      isSpeaking: this.vad.isSpeaking
    };
  }
}
