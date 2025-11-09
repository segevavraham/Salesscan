/**
 * Eleven Labs Integration Service
 * Real-time speech-to-text transcription using Eleven Labs API
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '../config/logger';
import { config } from '../config/env';

export interface TranscriptionSegment {
  text: string;
  speaker: 'salesperson' | 'client' | 'unknown';
  timestamp: number;
  confidence: number;
  isFinal: boolean;
}

export interface TranscriptionOptions {
  language?: string;
  speakerDiarization?: boolean;
  punctuation?: boolean;
  model?: 'base' | 'enhanced';
}

export class ElevenLabsService {
  private client: AxiosInstance;
  private apiKey: string;
  private activeStreams: Map<string, any> = new Map();

  constructor() {
    this.apiKey = config.elevenlabsApiKey || '';

    this.client = axios.create({
      baseURL: 'https://api.elevenlabs.io/v1',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!this.apiKey) {
      logger.warn('⚠️ Eleven Labs API key not configured');
    }
  }

  /**
   * Start real-time transcription stream
   */
  async startTranscriptionStream(
    meetingId: string,
    options: TranscriptionOptions = {}
  ): Promise<void> {
    try {
      logger.info(`Starting Eleven Labs transcription stream for meeting: ${meetingId}`);

      const streamConfig = {
        language: options.language || 'en',
        speaker_diarization: options.speakerDiarization !== false,
        punctuation: options.punctuation !== false,
        model: options.model || 'enhanced',
      };

      // Store stream configuration
      this.activeStreams.set(meetingId, {
        config: streamConfig,
        startTime: Date.now(),
        segments: [],
      });

      logger.info(`✅ Transcription stream started for meeting: ${meetingId}`);
    } catch (error) {
      logger.error('Error starting Eleven Labs transcription:', error);
      throw error;
    }
  }

  /**
   * Process audio chunk for transcription
   */
  async processAudioChunk(
    meetingId: string,
    audioData: Buffer
  ): Promise<TranscriptionSegment | null> {
    try {
      const stream = this.activeStreams.get(meetingId);
      if (!stream) {
        throw new Error(`No active stream for meeting: ${meetingId}`);
      }

      // Convert audio buffer to base64
      const audioBase64 = audioData.toString('base64');

      // Send to Eleven Labs API
      const response = await this.client.post('/speech-to-text', {
        audio: audioBase64,
        model: stream.config.model,
        language: stream.config.language,
        enable_speaker_diarization: stream.config.speaker_diarization,
      });

      if (response.data && response.data.text) {
        const segment: TranscriptionSegment = {
          text: response.data.text,
          speaker: this.identifySpeaker(response.data),
          timestamp: Date.now() - stream.startTime,
          confidence: response.data.confidence || 0.9,
          isFinal: response.data.is_final !== false,
        };

        // Store segment
        stream.segments.push(segment);

        return segment;
      }

      return null;
    } catch (error) {
      logger.error('Error processing audio chunk with Eleven Labs:', error);
      return null;
    }
  }

  /**
   * Process audio file for transcription (non-streaming)
   */
  async transcribeAudioFile(
    audioFilePath: string,
    options: TranscriptionOptions = {}
  ): Promise<TranscriptionSegment[]> {
    try {
      logger.info(`Transcribing audio file: ${audioFilePath}`);

      const fs = await import('fs');
      const audioBuffer = fs.readFileSync(audioFilePath);
      const audioBase64 = audioBuffer.toString('base64');

      const response = await this.client.post('/speech-to-text', {
        audio: audioBase64,
        model: options.model || 'enhanced',
        language: options.language || 'en',
        enable_speaker_diarization: options.speakerDiarization !== false,
      });

      if (response.data && response.data.transcription) {
        const segments: TranscriptionSegment[] = response.data.transcription.map(
          (segment: any, index: number) => ({
            text: segment.text,
            speaker: this.identifySpeaker(segment),
            timestamp: segment.start_time || index * 1000,
            confidence: segment.confidence || 0.9,
            isFinal: true,
          })
        );

        logger.info(`✅ Transcription completed: ${segments.length} segments`);
        return segments;
      }

      return [];
    } catch (error) {
      logger.error('Error transcribing audio file:', error);
      throw error;
    }
  }

  /**
   * Stop transcription stream
   */
  async stopTranscriptionStream(meetingId: string): Promise<TranscriptionSegment[]> {
    try {
      const stream = this.activeStreams.get(meetingId);
      if (!stream) {
        throw new Error(`No active stream for meeting: ${meetingId}`);
      }

      const segments = stream.segments;
      this.activeStreams.delete(meetingId);

      logger.info(`✅ Transcription stream stopped for meeting: ${meetingId}`);
      logger.info(`Total segments: ${segments.length}`);

      return segments;
    } catch (error) {
      logger.error('Error stopping transcription stream:', error);
      throw error;
    }
  }

  /**
   * Get available voices for text-to-speech (bonus feature)
   */
  async getAvailableVoices(): Promise<any[]> {
    try {
      const response = await this.client.get('/voices');
      return response.data.voices || [];
    } catch (error) {
      logger.error('Error fetching Eleven Labs voices:', error);
      return [];
    }
  }

  /**
   * Convert text to speech (bonus feature for AI responses)
   */
  async textToSpeech(text: string, voiceId?: string): Promise<Buffer | null> {
    try {
      const response = await this.client.post(
        `/text-to-speech/${voiceId || 'default'}`,
        {
          text,
          model_id: 'eleven_monolingual_v1',
        },
        {
          responseType: 'arraybuffer',
        }
      );

      return Buffer.from(response.data);
    } catch (error) {
      logger.error('Error converting text to speech:', error);
      return null;
    }
  }

  /**
   * Identify speaker from transcription data
   */
  private identifySpeaker(data: any): 'salesperson' | 'client' | 'unknown' {
    // If speaker diarization is enabled
    if (data.speaker_label) {
      // Assuming speaker 0 is salesperson, speaker 1 is client
      // This can be configured based on actual implementation
      return data.speaker_label === 'SPEAKER_00' ? 'salesperson' : 'client';
    }

    // Fallback: analyze based on patterns or return unknown
    return 'unknown';
  }

  /**
   * Get transcription statistics
   */
  getStreamStats(meetingId: string): any {
    const stream = this.activeStreams.get(meetingId);
    if (!stream) return null;

    return {
      meetingId,
      startTime: stream.startTime,
      duration: Date.now() - stream.startTime,
      segmentsCount: stream.segments.length,
      totalWords: stream.segments.reduce(
        (sum: number, seg: any) => sum + seg.text.split(' ').length,
        0
      ),
    };
  }

  /**
   * Check API status and quota
   */
  async checkApiStatus(): Promise<{
    isAvailable: boolean;
    quota?: any;
    error?: string;
  }> {
    try {
      // Check user subscription info
      const response = await this.client.get('/user');

      return {
        isAvailable: true,
        quota: {
          characterCount: response.data.subscription?.character_count || 0,
          characterLimit: response.data.subscription?.character_limit || 0,
          canExtendCharacterLimit: response.data.subscription?.can_extend_character_limit || false,
        },
      };
    } catch (error: any) {
      logger.error('Eleven Labs API check failed:', error);
      return {
        isAvailable: false,
        error: error.message,
      };
    }
  }
}

export const elevenLabsService = new ElevenLabsService();
