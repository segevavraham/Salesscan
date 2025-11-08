/**
 * Advanced Suggestion Widget
 * Professional UI with streaming typing effects, animations, and intelligence
 */

export class AdvancedSuggestionWidget {
  constructor() {
    this.container = null;
    this.currentSuggestion = null;
    this.isStreaming = false;
    this.typingSpeed = 15; // ms per character
    this.particles = [];
  }

  /**
   * Initialize and inject widget into page
   */
  initialize() {
    this.injectStyles();
    this.createContainer();
    this.setupAnimations();
  }

  /**
   * Inject advanced styles
   */
  injectStyles() {
    const styleId = 'sales-coach-advanced-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

      .sc-widget-container {
        position: fixed;
        bottom: 30px;
        right: 30px;
        z-index: 999999;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        pointer-events: none;
      }

      .sc-suggestion-card {
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        border-radius: 20px;
        padding: 24px;
        max-width: 450px;
        box-shadow:
          0 0 0 1px rgba(255, 255, 255, 0.1),
          0 20px 60px -10px rgba(0, 0, 0, 0.5),
          0 0 100px rgba(99, 102, 241, 0.3);
        backdrop-filter: blur(20px);
        pointer-events: auto;
        animation: slideInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
        overflow: hidden;
        border: 1px solid rgba(139, 92, 246, 0.3);
      }

      /* Animated gradient border effect */
      .sc-suggestion-card::before {
        content: '';
        position: absolute;
        inset: -2px;
        border-radius: 20px;
        padding: 2px;
        background: linear-gradient(45deg, #8b5cf6, #3b82f6, #06b6d4, #8b5cf6);
        background-size: 300% 300%;
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        animation: gradientRotate 3s ease infinite;
        opacity: 0.5;
        z-index: -1;
      }

      @keyframes gradientRotate {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }

      /* Glowing orb background */
      .sc-glow-orb {
        position: absolute;
        width: 200px;
        height: 200px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%);
        filter: blur(40px);
        animation: float 6s ease-in-out infinite;
        z-index: -1;
      }

      @keyframes float {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(30px, -30px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
      }

      /* Header */
      .sc-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
        position: relative;
      }

      .sc-ai-icon {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
        animation: pulse 2s ease-in-out infinite;
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4); }
        50% { transform: scale(1.05); box-shadow: 0 6px 20px rgba(139, 92, 246, 0.6); }
      }

      .sc-header-content {
        flex: 1;
      }

      .sc-title {
        font-size: 14px;
        font-weight: 600;
        color: #e2e8f0;
        margin: 0 0 4px 0;
      }

      .sc-subtitle {
        font-size: 12px;
        color: #94a3b8;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .sc-live-indicator {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(239, 68, 68, 0.2);
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 11px;
        color: #fca5a5;
      }

      .sc-live-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #ef4444;
        animation: blink 1.5s ease-in-out infinite;
      }

      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }

      /* Analysis Section */
      .sc-analysis {
        margin-bottom: 20px;
        padding: 16px;
        background: rgba(15, 23, 42, 0.5);
        border-radius: 12px;
        border-left: 3px solid #8b5cf6;
      }

      .sc-analysis-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
      }

      .sc-analysis-item {
        flex: 1;
      }

      .sc-analysis-label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #64748b;
        margin-bottom: 4px;
      }

      .sc-analysis-value {
        font-size: 14px;
        font-weight: 600;
        color: #e2e8f0;
      }

      .sc-sentiment-positive { color: #22c55e; }
      .sc-sentiment-neutral { color: #f59e0b; }
      .sc-sentiment-negative { color: #ef4444; }

      /* Main Advice */
      .sc-main-advice {
        margin-bottom: 20px;
      }

      .sc-advice-label {
        font-size: 12px;
        font-weight: 500;
        color: #8b5cf6;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .sc-advice-text {
        font-size: 15px;
        line-height: 1.6;
        color: #f1f5f9;
        margin: 0;
        min-height: 24px;
      }

      /* Typing cursor effect */
      .sc-typing-cursor {
        display: inline-block;
        width: 2px;
        height: 16px;
        background: #8b5cf6;
        margin-left: 2px;
        animation: cursorBlink 1s step-end infinite;
        vertical-align: middle;
      }

      @keyframes cursorBlink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }

      /* Quick Replies */
      .sc-quick-replies {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .sc-quick-reply-btn {
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);
        border: 1px solid rgba(139, 92, 246, 0.3);
        padding: 14px 16px;
        border-radius: 12px;
        text-align: left;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        color: #e2e8f0;
        font-size: 14px;
        line-height: 1.5;
        position: relative;
        overflow: hidden;
        opacity: 0;
        transform: translateX(20px);
        animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      .sc-quick-reply-btn:nth-child(1) { animation-delay: 0.1s; }
      .sc-quick-reply-btn:nth-child(2) { animation-delay: 0.2s; }
      .sc-quick-reply-btn:nth-child(3) { animation-delay: 0.3s; }

      @keyframes slideInRight {
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      .sc-quick-reply-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.3), transparent);
        transition: left 0.5s;
      }

      .sc-quick-reply-btn:hover {
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%);
        border-color: rgba(139, 92, 246, 0.6);
        transform: translateX(4px);
        box-shadow: 0 8px 24px rgba(139, 92, 246, 0.3);
      }

      .sc-quick-reply-btn:hover::before {
        left: 100%;
      }

      .sc-quick-reply-btn:active {
        transform: scale(0.98);
      }

      .sc-copy-indicator {
        position: absolute;
        top: 50%;
        right: 16px;
        transform: translateY(-50%);
        background: rgba(34, 197, 94, 0.2);
        color: #22c55e;
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 600;
        opacity: 0;
        transition: opacity 0.3s;
      }

      .sc-copy-indicator.show {
        opacity: 1;
      }

      /* Close button */
      .sc-close-btn {
        position: absolute;
        top: 16px;
        right: 16px;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #94a3b8;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        font-size: 18px;
        line-height: 1;
      }

      .sc-close-btn:hover {
        background: rgba(239, 68, 68, 0.2);
        border-color: rgba(239, 68, 68, 0.4);
        color: #fca5a5;
        transform: rotate(90deg);
      }

      /* Confidence meter */
      .sc-confidence {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .sc-confidence-label {
        font-size: 11px;
        color: #64748b;
        margin-bottom: 8px;
        display: flex;
        justify-content: space-between;
      }

      .sc-confidence-bar {
        height: 6px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
        overflow: hidden;
        position: relative;
      }

      .sc-confidence-fill {
        height: 100%;
        background: linear-gradient(90deg, #8b5cf6, #6366f1);
        border-radius: 3px;
        transition: width 1s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
        overflow: hidden;
      }

      .sc-confidence-fill::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        animation: shimmer 2s infinite;
      }

      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }

      /* Animations */
      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(30px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes slideOut {
        to {
          opacity: 0;
          transform: translateY(30px) scale(0.95);
        }
      }

      /* Responsive */
      @media (max-width: 768px) {
        .sc-widget-container {
          right: 16px;
          bottom: 16px;
        }

        .sc-suggestion-card {
          max-width: calc(100vw - 32px);
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Create widget container
   */
  createContainer() {
    this.container = document.createElement('div');
    this.container.className = 'sc-widget-container';
    document.body.appendChild(this.container);
  }

  /**
   * Setup particle animations
   */
  setupAnimations() {
    // Particle system for visual effects (optional)
  }

  /**
   * Show suggestion with streaming effect
   */
  async showSuggestion(data, isStreaming = false) {
    // Remove existing suggestion
    if (this.currentSuggestion) {
      this.hideSuggestion();
    }

    this.isStreaming = isStreaming;

    // Create card
    const card = this.createSuggestionCard(data);
    this.container.appendChild(card);
    this.currentSuggestion = card;

    // If streaming, show typing effect
    if (isStreaming) {
      await this.showTypingEffect(data);
    }
  }

  /**
   * Update suggestion during streaming
   */
  updateSuggestion(delta, fullContent) {
    if (!this.currentSuggestion) return;

    const adviceText = this.currentSuggestion.querySelector('.sc-advice-text');
    if (adviceText) {
      adviceText.textContent = fullContent;
    }
  }

  /**
   * Complete suggestion (end streaming)
   */
  completeSuggestion(finalData) {
    this.isStreaming = false;

    // Remove typing cursor
    const cursor = this.currentSuggestion?.querySelector('.sc-typing-cursor');
    if (cursor) {
      cursor.remove();
    }

    // Update with final data
    if (finalData.suggestion) {
      this.updateCardWithFullData(finalData.suggestion);
    }
  }

  /**
   * Create suggestion card HTML
   */
  createSuggestionCard(data) {
    const card = document.createElement('div');
    card.className = 'sc-suggestion-card';

    const analysis = data.analysis || {};
    const suggestions = data.suggestions || {};
    const intelligence = data.conversation_intelligence || {};

    card.innerHTML = `
      <div class="sc-glow-orb"></div>

      <button class="sc-close-btn" aria-label="Close">×</button>

      <div class="sc-header">
        <div class="sc-ai-icon">🧠</div>
        <div class="sc-header-content">
          <h3 class="sc-title">AI Sales Coach</h3>
          <div class="sc-subtitle">
            <span class="sc-live-indicator">
              <span class="sc-live-dot"></span>
              LIVE
            </span>
            <span>${analysis.stage || 'Analyzing'}...</span>
          </div>
        </div>
      </div>

      ${this.createAnalysisSection(analysis)}

      <div class="sc-main-advice">
        <div class="sc-advice-label">
          💡 Recommendation
        </div>
        <p class="sc-advice-text">
          ${this.isStreaming ? '<span class="sc-typing-cursor"></span>' : suggestions.main_advice || 'Analyzing conversation...'}
        </p>
      </div>

      <div class="sc-quick-replies" id="sc-quick-replies">
        ${this.createQuickReplies(suggestions.quick_replies || [])}
      </div>

      ${this.createConfidenceMeter(analysis.decision_readiness || 5)}
    `;

    // Add event listeners
    card.querySelector('.sc-close-btn').onclick = () => this.hideSuggestion();

    // Quick reply buttons
    card.querySelectorAll('.sc-quick-reply-btn').forEach((btn, index) => {
      btn.onclick = () => this.copyToClipboard(btn, suggestions.quick_replies[index]);
    });

    return card;
  }

  /**
   * Create analysis section
   */
  createAnalysisSection(analysis) {
    const sentimentClass = `sc-sentiment-${analysis.sentiment || 'neutral'}`;

    return `
      <div class="sc-analysis">
        <div class="sc-analysis-row">
          <div class="sc-analysis-item">
            <div class="sc-analysis-label">Sentiment</div>
            <div class="sc-analysis-value ${sentimentClass}">
              ${this.getSentimentEmoji(analysis.sentiment)} ${analysis.sentiment || 'Neutral'}
            </div>
          </div>
          <div class="sc-analysis-item">
            <div class="sc-analysis-label">Urgency</div>
            <div class="sc-analysis-value">
              ${this.getUrgencyIndicator(analysis.urgency_level || 5)}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create quick replies HTML
   */
  createQuickReplies(replies) {
    if (!replies || replies.length === 0) return '';

    return replies.map((reply, index) => `
      <button class="sc-quick-reply-btn" data-index="${index}">
        ${reply}
        <span class="sc-copy-indicator">✓ Copied</span>
      </button>
    `).join('');
  }

  /**
   * Create confidence meter
   */
  createConfidenceMeter(confidence) {
    const percentage = confidence * 10; // Convert 1-10 to percentage

    return `
      <div class="sc-confidence">
        <div class="sc-confidence-label">
          <span>Decision Readiness</span>
          <span>${percentage}%</span>
        </div>
        <div class="sc-confidence-bar">
          <div class="sc-confidence-fill" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
  }

  /**
   * Update card with full parsed data
   */
  updateCardWithFullData(data) {
    if (!this.currentSuggestion) return;

    // Update analysis
    if (data.analysis) {
      const analysisSection = this.currentSuggestion.querySelector('.sc-analysis');
      if (analysisSection) {
        analysisSection.innerHTML = this.createAnalysisSection(data.analysis).match(/<div class="sc-analysis">([\s\S]*)<\/div>/)[1];
      }
    }

    // Update quick replies
    if (data.suggestions?.quick_replies) {
      const repliesContainer = this.currentSuggestion.querySelector('#sc-quick-replies');
      if (repliesContainer) {
        repliesContainer.innerHTML = this.createQuickReplies(data.suggestions.quick_replies);

        // Re-attach event listeners
        repliesContainer.querySelectorAll('.sc-quick-reply-btn').forEach((btn, index) => {
          btn.onclick = () => this.copyToClipboard(btn, data.suggestions.quick_replies[index]);
        });
      }
    }

    // Update confidence
    if (data.analysis?.decision_readiness) {
      const confidenceFill = this.currentSuggestion.querySelector('.sc-confidence-fill');
      if (confidenceFill) {
        confidenceFill.style.width = (data.analysis.decision_readiness * 10) + '%';
      }
    }
  }

  /**
   * Show typing effect for advice text
   */
  async showTypingEffect(data) {
    // This will be called during streaming from OpenAI
    // The actual typing happens in updateSuggestion()
  }

  /**
   * Copy to clipboard and show indicator
   */
  async copyToClipboard(button, text) {
    try {
      await navigator.clipboard.writeText(text);

      const indicator = button.querySelector('.sc-copy-indicator');
      indicator.classList.add('show');

      setTimeout(() => {
        indicator.classList.remove('show');
      }, 2000);

    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }

  /**
   * Hide suggestion with animation
   */
  hideSuggestion() {
    if (!this.currentSuggestion) return;

    this.currentSuggestion.style.animation = 'slideOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';

    setTimeout(() => {
      if (this.currentSuggestion) {
        this.currentSuggestion.remove();
        this.currentSuggestion = null;
      }
    }, 300);
  }

  /**
   * Helper: Get sentiment emoji
   */
  getSentimentEmoji(sentiment) {
    const emojis = {
      positive: '😊',
      neutral: '😐',
      negative: '😟',
      concerned: '🤔'
    };
    return emojis[sentiment] || '😐';
  }

  /**
   * Helper: Get urgency indicator
   */
  getUrgencyIndicator(level) {
    const fires = Math.min(Math.ceil(level / 2), 5);
    return '🔥'.repeat(fires);
  }
}
