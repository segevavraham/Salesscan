/**
 * Audio Recorder Service
 * Handles audio recording from meetings
 */

export class AudioRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
    this.isRecording = false;
  }

  /**
   * Start recording audio from a media stream
   */
  async startRecording(streamId) {
    try {
      // Get the media stream from the stream ID
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          mandatory: {
            chromeMediaSource: 'tab',
            chromeMediaSourceId: streamId
          }
        }
      });

      // Create MediaRecorder
      const options = { mimeType: 'audio/webm' };
      this.mediaRecorder = new MediaRecorder(this.stream, options);

      // Handle data available
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // Handle recording stop
      this.mediaRecorder.onstop = () => {
        this.handleRecordingStop();
      };

      // Start recording
      this.mediaRecorder.start(1000); // Collect data every second
      this.isRecording = true;

      console.log('Audio recording started');

      return { success: true };

    } catch (error) {
      console.error('Error starting audio recording:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Stop recording
   */
  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;

      // Stop all tracks
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
      }

      console.log('Audio recording stopped');
    }
  }

  /**
   * Handle recording stop
   */
  handleRecordingStop() {
    // Create blob from chunks
    const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });

    // You can now send this to backend for processing
    console.log('Audio blob created:', audioBlob.size, 'bytes');

    // Clear chunks
    this.audioChunks = [];

    return audioBlob;
  }

  /**
   * Get current recording state
   */
  getState() {
    return {
      isRecording: this.isRecording,
      duration: this.mediaRecorder?.state === 'recording'
        ? Date.now() - this.startTime
        : 0
    };
  }
}
