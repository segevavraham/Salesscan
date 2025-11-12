/**
 * Waveform Visualizer
 * Beautiful real-time audio waveform visualization
 * Shows who's speaking, volume, and provides visual feedback
 */

export class WaveformVisualizer {
  constructor(options = {}) {
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.animationId = null;
    this.isActive = false;

    // Configuration
    this.config = {
      width: options.width || 300,
      height: options.height || 80,
      barCount: options.barCount || 64,
      barWidth: options.barWidth || 3,
      barGap: options.barGap || 2,
      smoothingTimeConstant: options.smoothing || 0.8,
      fftSize: options.fftSize || 2048,
      minDecibels: options.minDecibels || -90,
      maxDecibels: options.maxDecibels || -10,
      colors: {
        salesperson: 'rgba(139, 92, 246, 0.8)',
        client: 'rgba(6, 182, 212, 0.8)',
        background: 'rgba(15, 23, 42, 0.6)',
        inactive: 'rgba(100, 116, 139, 0.3)'
      }
    };

    // State
    this.currentSpeaker = null;
    this.volumeHistory = [];
    this.maxVolumeHistorySize = 60; // Keep last 60 frames (~1 second at 60fps)
    this.speakingThreshold = 30; // Minimum volume to be considered "speaking"
  }

  /**
   * Initialize visualizer
   */
  async initialize(mediaStream) {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Create analyser
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.config.fftSize;
      this.analyser.smoothingTimeConstant = this.config.smoothingTimeConstant;
      this.analyser.minDecibels = this.config.minDecibels;
      this.analyser.maxDecibels = this.config.maxDecibels;

      // Connect media stream
      const source = this.audioContext.createMediaStreamSource(mediaStream);
      source.connect(this.analyser);

      // Setup data array
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);

      // Create container and canvas
      this.createContainer();

      // Start visualization
      this.isActive = true;
      this.draw();

      console.log('✅ Waveform visualizer initialized');
      return true;

    } catch (error) {
      console.error('❌ Error initializing waveform visualizer:', error);
      return false;
    }
  }

  /**
   * Create container with canvas
   */
  createContainer() {
    // Create container
    this.container = document.createElement('div');
    this.container.className = 'sc-waveform-container';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${this.config.colors.background};
      backdrop-filter: blur(20px);
      border-radius: 16px;
      padding: 16px 20px;
      box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.1),
        0 10px 40px rgba(0, 0, 0, 0.3),
        0 0 60px rgba(139, 92, 246, 0.2);
      z-index: 999996;
      display: flex;
      align-items: center;
      gap: 16px;
      border: 1px solid rgba(139, 92, 246, 0.3);
    `;

    // Create label
    const label = document.createElement('div');
    label.style.cssText = `
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      font-weight: 600;
      color: #8b5cf6;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
    `;
    label.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 16px;">🎙️</span>
        <span id="sc-waveform-speaker">Listening...</span>
      </div>
    `;

    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.config.width;
    this.canvas.height = this.config.height;
    this.canvas.style.cssText = `
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.2);
    `;
    this.ctx = this.canvas.getContext('2d');

    // Create volume meter
    const volumeMeter = document.createElement('div');
    volumeMeter.id = 'sc-volume-meter';
    volumeMeter.style.cssText = `
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: 3px solid rgba(139, 92, 246, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      position: relative;
      overflow: hidden;
    `;
    volumeMeter.innerHTML = `
      <div id="sc-volume-fill" style="
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(to top, rgba(139, 92, 246, 0.6), rgba(139, 92, 246, 0.2));
        transition: height 0.1s;
        height: 0%;
      "></div>
      <span style="position: relative; z-index: 1;">🔊</span>
    `;

    this.container.appendChild(label);
    this.container.appendChild(this.canvas);
    this.container.appendChild(volumeMeter);

    document.body.appendChild(this.container);

    // Add minimize button
    const minimizeBtn = document.createElement('button');
    minimizeBtn.textContent = '−';
    minimizeBtn.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      width: 24px;
      height: 24px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #94a3b8;
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    `;
    minimizeBtn.onmouseover = () => {
      minimizeBtn.style.background = 'rgba(139, 92, 246, 0.2)';
      minimizeBtn.style.color = '#c4b5fd';
    };
    minimizeBtn.onmouseout = () => {
      minimizeBtn.style.background = 'rgba(255, 255, 255, 0.05)';
      minimizeBtn.style.color = '#94a3b8';
    };
    minimizeBtn.onclick = () => this.toggleMinimize();

    this.container.appendChild(minimizeBtn);
  }

  /**
   * Draw waveform
   */
  draw() {
    if (!this.isActive || !this.analyser) return;

    this.animationId = requestAnimationFrame(() => this.draw());

    // Get frequency data
    this.analyser.getByteFrequencyData(this.dataArray);

    // Calculate average volume
    const average = this.dataArray.reduce((a, b) => a + b, 0) / this.dataArray.length;

    // Update volume history
    this.volumeHistory.push(average);
    if (this.volumeHistory.length > this.maxVolumeHistorySize) {
      this.volumeHistory.shift();
    }

    // Detect if speaking
    const isSpeaking = average > this.speakingThreshold;

    // Update volume meter
    this.updateVolumeMeter(average);

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw waveform
    this.drawBars(isSpeaking);

    // Draw peak line
    this.drawPeakLine();
  }

  /**
   * Draw frequency bars
   */
  drawBars(isSpeaking) {
    const barCount = this.config.barCount;
    const totalBarWidth = this.config.barWidth + this.config.barGap;
    const startX = (this.canvas.width - (barCount * totalBarWidth)) / 2;

    // Sample dataArray to get barCount values
    const step = Math.floor(this.dataArray.length / barCount);

    for (let i = 0; i < barCount; i++) {
      const value = this.dataArray[i * step];
      const percent = value / 255;
      const barHeight = percent * (this.canvas.height - 10);

      const x = startX + (i * totalBarWidth);
      const y = (this.canvas.height - barHeight) / 2;

      // Color based on speaking state and speaker
      let color;
      if (isSpeaking) {
        if (this.currentSpeaker === 'client') {
          color = this.config.colors.client;
        } else {
          color = this.config.colors.salesperson;
        }
      } else {
        color = this.config.colors.inactive;
      }

      // Draw bar with gradient
      const gradient = this.ctx.createLinearGradient(x, y, x, y + barHeight);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, color.replace('0.8', '0.3'));

      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(x, y, this.config.barWidth, barHeight);

      // Add glow effect for high values
      if (percent > 0.7 && isSpeaking) {
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = color;
        this.ctx.fillRect(x, y, this.config.barWidth, barHeight);
        this.ctx.shadowBlur = 0;
      }
    }
  }

  /**
   * Draw peak volume line
   */
  drawPeakLine() {
    if (this.volumeHistory.length < 2) return;

    const maxVolume = Math.max(...this.volumeHistory);
    const percent = maxVolume / 255;
    const y = this.canvas.height / 2;

    // Draw center line
    this.ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, y);
    this.ctx.lineTo(this.canvas.width, y);
    this.ctx.stroke();
  }

  /**
   * Update volume meter
   */
  updateVolumeMeter(volume) {
    const volumeFill = document.getElementById('sc-volume-fill');
    if (volumeFill) {
      const percent = Math.min(100, (volume / 255) * 100);
      volumeFill.style.height = percent + '%';

      // Change color based on volume
      if (percent > 70) {
        volumeFill.style.background = 'linear-gradient(to top, rgba(239, 68, 68, 0.6), rgba(239, 68, 68, 0.2))';
      } else if (percent > 40) {
        volumeFill.style.background = 'linear-gradient(to top, rgba(139, 92, 246, 0.6), rgba(139, 92, 246, 0.2))';
      } else {
        volumeFill.style.background = 'linear-gradient(to top, rgba(6, 182, 212, 0.6), rgba(6, 182, 212, 0.2))';
      }
    }
  }

  /**
   * Set current speaker
   */
  setSpeaker(speaker) {
    this.currentSpeaker = speaker;

    const speakerLabel = document.getElementById('sc-waveform-speaker');
    if (speakerLabel) {
      const labels = {
        salesperson: 'You speaking',
        client: 'Client speaking',
        unknown: 'Listening...'
      };
      speakerLabel.textContent = labels[speaker] || labels.unknown;

      // Update color
      const colors = {
        salesperson: '#8b5cf6',
        client: '#06b6d4',
        unknown: '#64748b'
      };
      speakerLabel.style.color = colors[speaker] || colors.unknown;
    }
  }

  /**
   * Toggle minimize
   */
  toggleMinimize() {
    if (this.container.style.height === '40px') {
      // Expand
      this.container.style.height = 'auto';
      this.canvas.style.display = 'block';
      document.getElementById('sc-volume-meter').style.display = 'flex';
    } else {
      // Minimize
      this.container.style.height = '40px';
      this.canvas.style.display = 'none';
      document.getElementById('sc-volume-meter').style.display = 'none';
    }
  }

  /**
   * Stop visualization
   */
  stop() {
    this.isActive = false;

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  /**
   * Hide visualizer
   */
  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  /**
   * Show visualizer
   */
  show() {
    if (this.container) {
      this.container.style.display = 'flex';
    }
  }

  /**
   * Destroy visualizer
   */
  destroy() {
    this.stop();

    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }

  /**
   * Get current volume level (0-100)
   */
  getCurrentVolume() {
    if (this.volumeHistory.length === 0) return 0;
    const latest = this.volumeHistory[this.volumeHistory.length - 1];
    return Math.round((latest / 255) * 100);
  }

  /**
   * Get average volume over last second
   */
  getAverageVolume() {
    if (this.volumeHistory.length === 0) return 0;
    const sum = this.volumeHistory.reduce((a, b) => a + b, 0);
    const avg = sum / this.volumeHistory.length;
    return Math.round((avg / 255) * 100);
  }

  /**
   * Is someone speaking?
   */
  isSpeaking() {
    const avg = this.getAverageVolume();
    return avg > (this.speakingThreshold / 255) * 100;
  }
}
