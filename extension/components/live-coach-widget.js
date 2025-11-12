/**
 * Live Coach Widget - Professional Real-time Sales Coaching
 * מאמן מכירות בזמן אמת עם UI מתקדם
 */

export class LiveCoachWidget {
  constructor() {
    this.container = null;
    this.currentCoaching = null;
    this.isVisible = false;
    this.alertsQueue = [];
  }

  /**
   * Initialize widget
   */
  initialize() {
    this.injectStyles();
    this.createContainer();
  }

  /**
   * Inject professional RTL styles
   */
  injectStyles() {
    const styleId = 'live-coach-widget-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700;800&display=swap');

      .lc-widget-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999999;
        font-family: 'Heebo', -apple-system, sans-serif;
        direction: rtl;
        text-align: right;
      }

      /* Instant Alert - Critical Notifications */
      .lc-instant-alert {
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%) scale(0.9);
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        padding: 20px 32px;
        border-radius: 16px;
        font-size: 18px;
        font-weight: 700;
        box-shadow:
          0 0 0 4px rgba(239, 68, 68, 0.2),
          0 20px 50px rgba(239, 68, 68, 0.4),
          0 0 100px rgba(239, 68, 68, 0.3);
        animation: alertPulse 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        z-index: 99999999;
        backdrop-filter: blur(20px);
        border: 2px solid rgba(255, 255, 255, 0.3);
        cursor: pointer;
        max-width: 600px;
      }

      .lc-instant-alert.buying_signal {
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        box-shadow:
          0 0 0 4px rgba(34, 197, 94, 0.2),
          0 20px 50px rgba(34, 197, 94, 0.4),
          0 0 100px rgba(34, 197, 94, 0.3);
      }

      .lc-instant-alert.opportunity {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        box-shadow:
          0 0 0 4px rgba(245, 158, 11, 0.2),
          0 20px 50px rgba(245, 158, 11, 0.4),
          0 0 100px rgba(245, 158, 11, 0.3);
      }

      @keyframes alertPulse {
        0% { transform: translateX(-50%) scale(0.9); opacity: 0; }
        50% { transform: translateX(-50%) scale(1.05); }
        100% { transform: translateX(-50%) scale(1); opacity: 1; }
      }

      .lc-alert-icon {
        display: inline-block;
        font-size: 28px;
        margin-left: 12px;
        animation: bounce 0.6s ease-in-out infinite;
      }

      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }

      /* Main Coaching Card */
      .lc-coach-card {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        border-radius: 24px;
        width: 520px;
        box-shadow:
          0 0 0 1px rgba(139, 92, 246, 0.3),
          0 25px 70px -10px rgba(0, 0, 0, 0.6),
          0 0 120px rgba(139, 92, 246, 0.2);
        backdrop-filter: blur(30px) saturate(180%);
        animation: slideInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
        overflow: hidden;
        border: 1px solid rgba(139, 92, 246, 0.4);
      }

      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(50px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      /* Animated gradient border */
      .lc-coach-card::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 24px;
        padding: 2px;
        background: linear-gradient(120deg, #8b5cf6, #3b82f6, #06b6d4, #8b5cf6);
        background-size: 300% 300%;
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        animation: borderFlow 4s ease infinite;
        opacity: 0.6;
        pointer-events: none;
      }

      @keyframes borderFlow {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }

      /* Header Section */
      .lc-header {
        padding: 24px 24px 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.05));
      }

      .lc-header-right {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .lc-stage-badge {
        background: rgba(139, 92, 246, 0.2);
        color: #c4b5fd;
        padding: 8px 16px;
        border-radius: 12px;
        font-size: 13px;
        font-weight: 600;
        border: 1px solid rgba(139, 92, 246, 0.3);
      }

      .lc-urgency-indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #22c55e;
        box-shadow: 0 0 15px rgba(34, 197, 94, 0.6);
        animation: pulse 2s ease-in-out infinite;
      }

      .lc-urgency-indicator.critical {
        background: #ef4444;
        box-shadow: 0 0 15px rgba(239, 68, 68, 0.8);
      }

      .lc-urgency-indicator.high {
        background: #f59e0b;
        box-shadow: 0 0 15px rgba(245, 158, 11, 0.7);
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.2); opacity: 0.8; }
      }

      .lc-close-btn {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #94a3b8;
        width: 32px;
        height: 32px;
        border-radius: 10px;
        cursor: pointer;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .lc-close-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #e2e8f0;
        transform: scale(1.1);
      }

      /* Analysis Section */
      .lc-analysis {
        padding: 20px 24px;
        background: rgba(139, 92, 246, 0.03);
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }

      .lc-analysis-row {
        display: flex;
        gap: 12px;
        margin-bottom: 12px;
      }

      .lc-analysis-item {
        flex: 1;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 12px;
      }

      .lc-analysis-label {
        font-size: 11px;
        color: #94a3b8;
        font-weight: 600;
        margin-bottom: 6px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .lc-analysis-value {
        font-size: 14px;
        color: #e2e8f0;
        font-weight: 600;
      }

      .lc-sentiment-positive { color: #22c55e; }
      .lc-sentiment-negative { color: #ef4444; }
      .lc-sentiment-neutral { color: #f59e0b; }

      /* Best Response Section */
      .lc-best-response {
        padding: 24px;
        background: linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(16, 185, 129, 0.04));
        border-right: 4px solid #22c55e;
        margin: 0 24px;
        border-radius: 16px;
        margin-top: 20px;
        position: relative;
      }

      .lc-best-response::before {
        content: '⭐';
        position: absolute;
        top: -15px;
        right: 20px;
        font-size: 30px;
        filter: drop-shadow(0 0 10px rgba(34, 197, 94, 0.6));
      }

      .lc-section-title {
        font-size: 13px;
        color: #22c55e;
        font-weight: 700;
        margin-bottom: 12px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .lc-response-text {
        font-size: 16px;
        color: #f1f5f9;
        line-height: 1.7;
        font-weight: 500;
        margin-bottom: 12px;
      }

      .lc-copy-btn {
        background: linear-gradient(135deg, #22c55e, #16a34a);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 10px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
      }

      .lc-copy-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(34, 197, 94, 0.4);
      }

      .lc-copy-btn:active {
        transform: translateY(0);
      }

      .lc-copy-btn.copied {
        background: linear-gradient(135deg, #3b82f6, #2563eb);
      }

      /* Alternative Responses */
      .lc-alternatives {
        padding: 20px 24px;
      }

      .lc-alt-option {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 14px 16px;
        margin-bottom: 10px;
        cursor: pointer;
        transition: all 0.2s;
        position: relative;
        padding-right: 50px;
      }

      .lc-alt-option:hover {
        background: rgba(139, 92, 246, 0.1);
        border-color: rgba(139, 92, 246, 0.3);
        transform: translateX(-4px);
      }

      .lc-alt-tag {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(139, 92, 246, 0.2);
        color: #c4b5fd;
        font-size: 10px;
        padding: 4px 8px;
        border-radius: 6px;
        font-weight: 600;
      }

      .lc-alt-text {
        font-size: 14px;
        color: #cbd5e1;
        line-height: 1.6;
      }

      /* Questions Section */
      .lc-questions {
        padding: 20px 24px;
        background: rgba(59, 130, 246, 0.03);
        border-top: 1px solid rgba(255, 255, 255, 0.05);
      }

      .lc-question-item {
        background: rgba(59, 130, 246, 0.08);
        border-right: 3px solid #3b82f6;
        border-radius: 10px;
        padding: 12px 16px;
        margin-bottom: 10px;
        color: #cbd5e1;
        font-size: 14px;
        line-height: 1.6;
        cursor: pointer;
        transition: all 0.2s;
      }

      .lc-question-item:hover {
        background: rgba(59, 130, 246, 0.15);
        transform: translateX(-4px);
      }

      .lc-question-item::before {
        content: '❓';
        margin-left: 8px;
      }

      /* Coach Notes */
      .lc-coach-notes {
        padding: 20px 24px;
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(59, 130, 246, 0.03));
      }

      .lc-note-item {
        margin-bottom: 14px;
        display: flex;
        gap: 12px;
        align-items: flex-start;
      }

      .lc-note-icon {
        font-size: 20px;
        flex-shrink: 0;
      }

      .lc-note-content {
        flex: 1;
      }

      .lc-note-title {
        font-size: 12px;
        color: #94a3b8;
        font-weight: 600;
        margin-bottom: 4px;
      }

      .lc-note-text {
        font-size: 14px;
        color: #e2e8f0;
        line-height: 1.5;
      }

      /* Next Steps */
      .lc-next-steps {
        padding: 20px 24px;
        background: rgba(245, 158, 11, 0.05);
        border-top: 1px solid rgba(255, 255, 255, 0.05);
      }

      .lc-step {
        background: rgba(245, 158, 11, 0.08);
        border-right: 3px solid #f59e0b;
        border-radius: 12px;
        padding: 14px 16px;
        margin-bottom: 10px;
      }

      .lc-step-title {
        font-size: 12px;
        color: #fbbf24;
        font-weight: 700;
        margin-bottom: 6px;
        text-transform: uppercase;
      }

      .lc-step-text {
        font-size: 14px;
        color: #fef3c7;
        line-height: 1.6;
      }

      /* Risk Assessment */
      .lc-risk-high {
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05));
        border: 2px solid #ef4444;
        padding: 16px;
        border-radius: 12px;
        margin: 20px 24px;
      }

      .lc-risk-title {
        color: #fca5a5;
        font-weight: 700;
        font-size: 14px;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .lc-risk-text {
        color: #fecaca;
        font-size: 14px;
        line-height: 1.6;
      }

      /* Loading State */
      .lc-loading {
        padding: 40px;
        text-align: center;
      }

      .lc-loading-spinner {
        width: 50px;
        height: 50px;
        border: 4px solid rgba(139, 92, 246, 0.2);
        border-top-color: #8b5cf6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .lc-loading-text {
        color: #94a3b8;
        font-size: 14px;
      }

      /* Fade out animation */
      .lc-fade-out {
        animation: fadeOut 0.3s ease-out forwards;
      }

      @keyframes fadeOut {
        to {
          opacity: 0;
          transform: translateX(50px);
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
    this.container.className = 'lc-widget-container';
    document.body.appendChild(this.container);
  }

  /**
   * Show instant alert
   */
  showInstantAlert(alert) {
    const alertEl = document.createElement('div');
    alertEl.className = `lc-instant-alert ${alert.type}`;
    alertEl.innerHTML = `
      <span class="lc-alert-icon">${this.getAlertIcon(alert.type)}</span>
      ${alert.message}
    `;

    document.body.appendChild(alertEl);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      alertEl.classList.add('lc-fade-out');
      setTimeout(() => alertEl.remove(), 300);
    }, 5000);

    // Click to dismiss
    alertEl.onclick = () => {
      alertEl.classList.add('lc-fade-out');
      setTimeout(() => alertEl.remove(), 300);
    };
  }

  /**
   * Get alert icon
   */
  getAlertIcon(type) {
    const icons = {
      buying_signal: '🎯',
      objection: '⚠️',
      risk: '🚨',
      opportunity: '⚡'
    };
    return icons[type] || '💡';
  }

  /**
   * Show coaching
   */
  async showCoaching(coaching) {
    this.currentCoaching = coaching;
    this.isVisible = true;

    // Show instant alert if exists
    if (coaching.instant_alert && coaching.instant_alert.urgency !== 'low') {
      this.showInstantAlert(coaching.instant_alert);
    }

    // Build main card
    const card = this.buildCoachingCard(coaching);
    this.container.innerHTML = '';
    this.container.appendChild(card);
  }

  /**
   * Build coaching card
   */
  buildCoachingCard(coaching) {
    const card = document.createElement('div');
    card.className = 'lc-coach-card';

    const analysis = coaching.analysis || {};
    const suggestions = coaching.suggestions || {};
    const nextSteps = coaching.next_steps || {};
    const coachNotes = coaching.coach_notes || {};

    card.innerHTML = `
      <!-- Header -->
      <div class="lc-header">
        <div class="lc-header-right">
          <div class="lc-stage-badge">${analysis.stage || 'מכירה'}</div>
          <div class="lc-urgency-indicator ${coaching.instant_alert?.urgency || 'medium'}"></div>
        </div>
        <button class="lc-close-btn">×</button>
      </div>

      <!-- Analysis -->
      <div class="lc-analysis">
        <div class="lc-analysis-row">
          <div class="lc-analysis-item">
            <div class="lc-analysis-label">סנטימנט</div>
            <div class="lc-analysis-value lc-sentiment-${this.getSentimentClass(analysis.sentiment)}">
              ${analysis.sentiment || 'ניטרלי'}
            </div>
          </div>
          <div class="lc-analysis-item">
            <div class="lc-analysis-label">מוכנות להחלטה</div>
            <div class="lc-analysis-value">${analysis.decision_readiness || '?'}/10</div>
          </div>
          <div class="lc-analysis-item">
            <div class="lc-analysis-label">רמת מעורבות</div>
            <div class="lc-analysis-value">${analysis.engagement_level || '?'}/10</div>
          </div>
        </div>
        ${analysis.client_mindset ? `
          <div style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.3); border-radius: 10px;">
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px; font-weight: 600;">💭 מה הלקוח חושב:</div>
            <div style="font-size: 13px; color: #cbd5e1;">${analysis.client_mindset}</div>
          </div>
        ` : ''}
      </div>

      <!-- Best Response -->
      <div class="lc-best-response">
        <div class="lc-section-title">✨ התגובה המומלצת ביותר</div>
        <div class="lc-response-text">${suggestions.best_response || 'אין המלצה'}</div>
        <button class="lc-copy-btn" onclick="navigator.clipboard.writeText('${this.escapeQuotes(suggestions.best_response || '')}'); this.textContent='✓ הועתק!'; this.classList.add('copied'); setTimeout(() => { this.textContent='העתק לתשובה'; this.classList.remove('copied'); }, 2000);">
          העתק לתשובה
        </button>
        ${suggestions.why ? `
          <div style="margin-top: 12px; font-size: 12px; color: #94a3b8; font-style: italic;">
            💡 ${suggestions.why}
          </div>
        ` : ''}
      </div>

      <!-- Alternative Responses -->
      ${suggestions.alternative_responses && suggestions.alternative_responses.length ? `
        <div class="lc-alternatives">
          <div class="lc-section-title" style="color: #8b5cf6;">🎭 אופציות נוספות</div>
          ${suggestions.alternative_responses.map((alt, i) => `
            <div class="lc-alt-option" onclick="navigator.clipboard.writeText('${this.escapeQuotes(alt)}'); alert('הועתק!');">
              <span class="lc-alt-tag">אופציה ${i + 1}</span>
              <div class="lc-alt-text">${alt}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Questions -->
      ${suggestions.questions_to_ask && suggestions.questions_to_ask.length ? `
        <div class="lc-questions">
          <div class="lc-section-title" style="color: #3b82f6;">🔍 שאלות מומלצות</div>
          ${suggestions.questions_to_ask.map(q => `
            <div class="lc-question-item" onclick="navigator.clipboard.writeText('${this.escapeQuotes(q)}'); this.style.background='rgba(34,197,94,0.15)';">
              ${q}
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Coach Notes -->
      <div class="lc-coach-notes">
        <div class="lc-section-title" style="color: #c4b5fd;">📝 הערות המאמן</div>
        ${coachNotes.doing_well ? `
          <div class="lc-note-item">
            <div class="lc-note-icon">✅</div>
            <div class="lc-note-content">
              <div class="lc-note-title">עושה טוב</div>
              <div class="lc-note-text">${coachNotes.doing_well}</div>
            </div>
          </div>
        ` : ''}
        ${coachNotes.needs_improvement ? `
          <div class="lc-note-item">
            <div class="lc-note-icon">📈</div>
            <div class="lc-note-content">
              <div class="lc-note-title">לשיפור</div>
              <div class="lc-note-text">${coachNotes.needs_improvement}</div>
            </div>
          </div>
        ` : ''}
        ${suggestions.what_to_avoid ? `
          <div class="lc-note-item">
            <div class="lc-note-icon">⛔</div>
            <div class="lc-note-content">
              <div class="lc-note-title">להימנע</div>
              <div class="lc-note-text">${suggestions.what_to_avoid}</div>
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Risk Assessment -->
      ${coachNotes.risk_assessment && coachNotes.risk_assessment !== 'אין' ? `
        <div class="lc-risk-high">
          <div class="lc-risk-title">
            <span>🚨</span>
            <span>אזהרת סיכון</span>
          </div>
          <div class="lc-risk-text">${coachNotes.risk_assessment}</div>
        </div>
      ` : ''}

      <!-- Next Steps -->
      <div class="lc-next-steps">
        <div class="lc-section-title" style="color: #fbbf24;">🎯 צעדים הבאים</div>
        ${nextSteps.immediate ? `
          <div class="lc-step">
            <div class="lc-step-title">⚡ עכשיו (30 שניות)</div>
            <div class="lc-step-text">${nextSteps.immediate}</div>
          </div>
        ` : ''}
        ${nextSteps.short_term ? `
          <div class="lc-step">
            <div class="lc-step-title">⏱️ קצר טווח (5 דקות)</div>
            <div class="lc-step-text">${nextSteps.short_term}</div>
          </div>
        ` : ''}
        ${nextSteps.closing_move ? `
          <div class="lc-step">
            <div class="lc-step-title">🎯 מהלך סגירה</div>
            <div class="lc-step-text">${nextSteps.closing_move}</div>
          </div>
        ` : ''}
      </div>
    `;

    // Add close button handler
    card.querySelector('.lc-close-btn').onclick = () => {
      this.hide();
    };

    return card;
  }

  /**
   * Get sentiment class
   */
  getSentimentClass(sentiment) {
    if (!sentiment) return 'neutral';
    if (sentiment.includes('חיובי')) return 'positive';
    if (sentiment.includes('שלילי')) return 'negative';
    return 'neutral';
  }

  /**
   * Escape quotes for HTML attributes
   */
  escapeQuotes(str) {
    return (str || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }

  /**
   * Show loading state
   */
  showLoading() {
    this.container.innerHTML = `
      <div class="lc-coach-card">
        <div class="lc-loading">
          <div class="lc-loading-spinner"></div>
          <div class="lc-loading-text">המאמן מנתח את השיחה...</div>
        </div>
      </div>
    `;
    this.isVisible = true;
  }

  /**
   * Hide widget
   */
  hide() {
    const card = this.container.querySelector('.lc-coach-card');
    if (card) {
      card.classList.add('lc-fade-out');
      setTimeout(() => {
        this.container.innerHTML = '';
        this.isVisible = false;
      }, 300);
    }
  }

  /**
   * Update with streaming content
   */
  updateStreaming(partialContent) {
    // For now, just show loading
    // Can be enhanced to show partial content
  }
}
