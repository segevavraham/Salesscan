/**
 * Live Transcription Overlay
 * Real-time transcription display with speaker colors and animations
 * Like Google Meet's live captions but way better
 */

export class LiveTranscriptionOverlay {
  constructor() {
    this.container = null;
    this.transcripts = [];
    this.maxTranscripts = 5; // Show last 5 messages
    this.isVisible = true;
    this.position = 'bottom'; // bottom, top, side
    this.autoScroll = true;

    // Speaker colors (vibrant and accessible)
    this.speakerColors = {
      salesperson: {
        bg: 'rgba(139, 92, 246, 0.15)',
        border: '#8b5cf6',
        text: '#c4b5fd',
        name: 'You'
      },
      client: {
        bg: 'rgba(6, 182, 212, 0.15)',
        border: '#06b6d4',
        text: '#67e8f9',
        name: 'Client'
      },
      unknown: {
        bg: 'rgba(148, 163, 184, 0.15)',
        border: '#94a3b8',
        text: '#cbd5e1',
        name: 'Speaker'
      }
    };
  }

  /**
   * Initialize overlay
   */
  initialize() {
    this.injectStyles();
    this.createContainer();
    this.setupKeyboardShortcuts();
  }

  /**
   * Inject styles
   */
  injectStyles() {
    const styleId = 'sc-live-transcription-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .sc-transcript-overlay {
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        max-width: 800px;
        width: 90%;
        z-index: 999997;
        pointer-events: none;
        font-family: 'Inter', -apple-system, sans-serif;
      }

      .sc-transcript-overlay.hidden {
        opacity: 0;
        pointer-events: none;
      }

      .sc-transcript-container {
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(20px) saturate(180%);
        border-radius: 20px;
        padding: 20px;
        box-shadow:
          0 0 0 1px rgba(255, 255, 255, 0.1),
          0 20px 60px rgba(0, 0, 0, 0.5),
          0 0 100px rgba(139, 92, 246, 0.2);
        border: 1px solid rgba(139, 92, 246, 0.3);
        max-height: 300px;
        overflow-y: auto;
        pointer-events: auto;
      }

      /* Custom Scrollbar */
      .sc-transcript-container::-webkit-scrollbar {
        width: 6px;
      }

      .sc-transcript-container::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 3px;
      }

      .sc-transcript-container::-webkit-scrollbar-thumb {
        background: rgba(139, 92, 246, 0.5);
        border-radius: 3px;
      }

      .sc-transcript-container::-webkit-scrollbar-thumb:hover {
        background: rgba(139, 92, 246, 0.7);
      }

      /* Header */
      .sc-transcript-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .sc-transcript-title {
        font-size: 12px;
        font-weight: 600;
        color: #8b5cf6;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .sc-live-indicator-small {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(239, 68, 68, 0.2);
        padding: 3px 8px;
        border-radius: 10px;
        font-size: 10px;
        color: #fca5a5;
      }

      .sc-live-dot-small {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: #ef4444;
        animation: blink 1.5s ease-in-out infinite;
      }

      .sc-transcript-controls {
        display: flex;
        gap: 8px;
      }

      .sc-transcript-btn {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #94a3b8;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        transition: all 0.2s;
      }

      .sc-transcript-btn:hover {
        background: rgba(139, 92, 246, 0.2);
        border-color: rgba(139, 92, 246, 0.4);
        color: #c4b5fd;
        transform: scale(1.05);
      }

      /* Transcript Messages */
      .sc-transcript-messages {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .sc-transcript-message {
        opacity: 0;
        animation: slideInMessage 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      @keyframes slideInMessage {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .sc-message-wrapper {
        display: flex;
        gap: 12px;
        align-items: flex-start;
      }

      .sc-speaker-avatar {
        width: 32px;
        height: 32px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 600;
        flex-shrink: 0;
        border: 2px solid;
        position: relative;
      }

      .sc-speaker-avatar::after {
        content: '';
        position: absolute;
        inset: -4px;
        border-radius: 12px;
        background: inherit;
        opacity: 0.3;
        filter: blur(8px);
        z-index: -1;
      }

      .sc-message-content {
        flex: 1;
        padding: 12px 16px;
        border-radius: 12px;
        border-left: 3px solid;
        position: relative;
        overflow: hidden;
      }

      .sc-message-content::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: inherit;
        opacity: 0.1;
        z-index: -1;
      }

      .sc-speaker-name {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 6px;
        opacity: 0.8;
      }

      .sc-message-text {
        font-size: 14px;
        line-height: 1.6;
        color: #e2e8f0;
        margin: 0;
      }

      /* Partial (interim) transcript styling */
      .sc-message-partial {
        opacity: 0.6;
        font-style: italic;
      }

      .sc-message-partial::after {
        content: '●';
        display: inline-block;
        margin-left: 4px;
        animation: blink 1s ease-in-out infinite;
      }

      /* Timestamp */
      .sc-message-timestamp {
        font-size: 10px;
        color: #64748b;
        margin-top: 6px;
      }

      /* Sentiment Badge */
      .sc-sentiment-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        border-radius: 8px;
        font-size: 10px;
        font-weight: 600;
        margin-top: 6px;
      }

      .sc-sentiment-positive {
        background: rgba(34, 197, 94, 0.2);
        color: #86efac;
      }

      .sc-sentiment-neutral {
        background: rgba(251, 191, 36, 0.2);
        color: #fde047;
      }

      .sc-sentiment-negative {
        background: rgba(239, 68, 68, 0.2);
        color: #fca5a5;
      }

      /* Empty State */
      .sc-transcript-empty {
        text-align: center;
        padding: 40px 20px;
        color: #64748b;
      }

      .sc-transcript-empty-icon {
        font-size: 48px;
        margin-bottom: 12px;
        opacity: 0.5;
      }

      .sc-transcript-empty-text {
        font-size: 14px;
        margin: 0;
      }

      /* Minimized State */
      .sc-transcript-overlay.minimized .sc-transcript-container {
        max-height: 60px;
        overflow: hidden;
      }

      .sc-transcript-overlay.minimized .sc-transcript-messages {
        display: none;
      }

      /* Position Variants */
      .sc-transcript-overlay.position-top {
        bottom: auto;
        top: 80px;
      }

      .sc-transcript-overlay.position-side {
        left: auto;
        right: 20px;
        transform: none;
        max-width: 400px;
      }

      /* Animations */
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }

      /* Responsive */
      @media (max-width: 768px) {
        .sc-transcript-overlay {
          bottom: 20px;
          width: 95%;
        }

        .sc-transcript-container {
          max-height: 200px;
        }

        .sc-message-wrapper {
          gap: 8px;
        }

        .sc-speaker-avatar {
          width: 28px;
          height: 28px;
          font-size: 12px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Create container
   */
  createContainer() {
    this.container = document.createElement('div');
    this.container.className = 'sc-transcript-overlay';

    this.container.innerHTML = `
      <div class="sc-transcript-container">
        <div class="sc-transcript-header">
          <div class="sc-transcript-title">
            <span>🎙️ Live Transcription</span>
            <span class="sc-live-indicator-small">
              <span class="sc-live-dot-small"></span>
              LIVE
            </span>
          </div>
          <div class="sc-transcript-controls">
            <button class="sc-transcript-btn" id="sc-transcript-minimize" title="Minimize">−</button>
            <button class="sc-transcript-btn" id="sc-transcript-position" title="Change Position">⇄</button>
            <button class="sc-transcript-btn" id="sc-transcript-hide" title="Hide (Ctrl+T)">×</button>
          </div>
        </div>
        <div class="sc-transcript-messages" id="sc-transcript-messages">
          <div class="sc-transcript-empty">
            <div class="sc-transcript-empty-icon">🎤</div>
            <p class="sc-transcript-empty-text">Start speaking to see live transcription...</p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);

    // Setup event listeners
    document.getElementById('sc-transcript-minimize').onclick = () => this.toggleMinimize();
    document.getElementById('sc-transcript-position').onclick = () => this.cyclePosition();
    document.getElementById('sc-transcript-hide').onclick = () => this.hide();
  }

  /**
   * Add transcript message
   */
  addTranscript(transcript) {
    const { text, speaker, isFinal, sentiment, confidence, timestamp } = transcript;

    // Remove empty state
    const messagesContainer = document.getElementById('sc-transcript-messages');
    const emptyState = messagesContainer.querySelector('.sc-transcript-empty');
    if (emptyState) {
      emptyState.remove();
    }

    // Check if we should update existing partial or create new
    if (!isFinal) {
      // Update or create partial transcript
      this.updatePartialTranscript(transcript);
    } else {
      // Finalize and add new transcript
      this.finalizeTranscript(transcript);
    }

    // Auto-scroll to bottom
    if (this.autoScroll) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Store transcript
    this.transcripts.push(transcript);

    // Trim old transcripts
    if (this.transcripts.length > this.maxTranscripts * 2) {
      this.transcripts = this.transcripts.slice(-this.maxTranscripts);
      this.renderTranscripts();
    }
  }

  /**
   * Update partial (interim) transcript
   */
  updatePartialTranscript(transcript) {
    const messagesContainer = document.getElementById('sc-transcript-messages');
    let partialMessage = messagesContainer.querySelector('.sc-message-partial');

    if (!partialMessage) {
      // Create new partial message
      const messageEl = this.createMessageElement(transcript, true);
      messagesContainer.appendChild(messageEl);
    } else {
      // Update existing partial
      const textEl = partialMessage.querySelector('.sc-message-text');
      if (textEl) {
        textEl.textContent = transcript.text;
      }
    }
  }

  /**
   * Finalize transcript (convert partial to final)
   */
  finalizeTranscript(transcript) {
    const messagesContainer = document.getElementById('sc-transcript-messages');
    const partialMessage = messagesContainer.querySelector('.sc-message-partial');

    if (partialMessage) {
      // Remove partial styling
      partialMessage.classList.remove('sc-message-partial');

      // Update with final data
      const textEl = partialMessage.querySelector('.sc-message-text');
      if (textEl) {
        textEl.textContent = transcript.text;
      }

      // Add sentiment badge if available
      if (transcript.sentiment) {
        const contentEl = partialMessage.querySelector('.sc-message-content');
        const sentimentBadge = this.createSentimentBadge(transcript.sentiment);
        contentEl.appendChild(sentimentBadge);
      }
    } else {
      // Create new final message
      const messageEl = this.createMessageElement(transcript, false);
      messagesContainer.appendChild(messageEl);
    }

    // Remove old messages
    const messages = messagesContainer.querySelectorAll('.sc-transcript-message');
    if (messages.length > this.maxTranscripts) {
      messages[0].style.animation = 'slideInMessage 0.3s reverse';
      setTimeout(() => messages[0].remove(), 300);
    }
  }

  /**
   * Create message element
   */
  createMessageElement(transcript, isPartial = false) {
    const { text, speaker, sentiment, confidence, timestamp } = transcript;
    const colors = this.speakerColors[speaker] || this.speakerColors.unknown;

    const messageEl = document.createElement('div');
    messageEl.className = `sc-transcript-message ${isPartial ? 'sc-message-partial' : ''}`;

    const speakerInitial = colors.name[0].toUpperCase();
    const time = timestamp ? new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }) : '';

    messageEl.innerHTML = `
      <div class="sc-message-wrapper">
        <div class="sc-speaker-avatar" style="background: ${colors.bg}; border-color: ${colors.border}; color: ${colors.text}">
          ${speakerInitial}
        </div>
        <div class="sc-message-content" style="background: ${colors.bg}; border-color: ${colors.border}">
          <div class="sc-speaker-name" style="color: ${colors.text}">
            ${colors.name}
          </div>
          <p class="sc-message-text">${text}</p>
          ${time ? `<div class="sc-message-timestamp">${time}</div>` : ''}
        </div>
      </div>
    `;

    return messageEl;
  }

  /**
   * Create sentiment badge
   */
  createSentimentBadge(sentiment) {
    const badge = document.createElement('div');
    badge.className = `sc-sentiment-badge sc-sentiment-${sentiment}`;

    const emoji = {
      positive: '😊',
      neutral: '😐',
      negative: '😟'
    }[sentiment] || '😐';

    badge.innerHTML = `${emoji} ${sentiment}`;
    return badge;
  }

  /**
   * Render all transcripts
   */
  renderTranscripts() {
    const messagesContainer = document.getElementById('sc-transcript-messages');
    messagesContainer.innerHTML = '';

    if (this.transcripts.length === 0) {
      messagesContainer.innerHTML = `
        <div class="sc-transcript-empty">
          <div class="sc-transcript-empty-icon">🎤</div>
          <p class="sc-transcript-empty-text">Start speaking to see live transcription...</p>
        </div>
      `;
      return;
    }

    const recentTranscripts = this.transcripts.slice(-this.maxTranscripts);
    recentTranscripts.forEach(transcript => {
      const messageEl = this.createMessageElement(transcript, false);
      messagesContainer.appendChild(messageEl);
    });
  }

  /**
   * Clear all transcripts
   */
  clear() {
    this.transcripts = [];
    this.renderTranscripts();
  }

  /**
   * Show overlay
   */
  show() {
    this.isVisible = true;
    this.container.classList.remove('hidden');
  }

  /**
   * Hide overlay
   */
  hide() {
    this.isVisible = false;
    this.container.classList.add('hidden');
  }

  /**
   * Toggle visibility
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Toggle minimize
   */
  toggleMinimize() {
    this.container.classList.toggle('minimized');
  }

  /**
   * Cycle position (bottom -> top -> side -> bottom)
   */
  cyclePosition() {
    const positions = ['bottom', 'top', 'side'];
    const currentIndex = positions.indexOf(this.position);
    const nextIndex = (currentIndex + 1) % positions.length;

    // Remove old position class
    this.container.classList.remove(`position-${this.position}`);

    // Set new position
    this.position = positions[nextIndex];
    this.container.classList.add(`position-${this.position}`);
  }

  /**
   * Setup keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+T - Toggle transcription overlay
      if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        this.toggle();
      }

      // Ctrl+Shift+T - Clear transcripts
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        this.clear();
      }
    });
  }

  /**
   * Export transcripts
   */
  exportTranscripts() {
    const text = this.transcripts
      .filter(t => t.isFinal)
      .map(t => `[${new Date(t.timestamp).toLocaleTimeString()}] ${t.speaker.toUpperCase()}: ${t.text}`)
      .join('\n');

    return text;
  }

  /**
   * Download transcripts
   */
  downloadTranscripts() {
    const text = this.exportTranscripts();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${Date.now()}.txt`;
    a.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Destroy overlay
   */
  destroy() {
    if (this.container) {
      this.container.remove();
    }
  }
}
