/**
 * Meeting Navigator
 * Visual map showing progress through sales stages
 * Helps sales rep know where they are and what's next
 */

export class MeetingNavigator {
  constructor() {
    this.container = null;
    this.currentStage = 0;
    this.startTime = Date.now();
    this.stageHistory = [];

    this.stages = [
      {
        id: 'warming',
        icon: '👋',
        name: 'Warming Up',
        description: 'Building rapport',
        avgDuration: 5, // minutes
        keywords: ['hello', 'how are you', 'thanks for', 'nice to', 'pleasure'],
        tips: ['Build rapport', 'Make them comfortable', 'Find common ground']
      },
      {
        id: 'discovery',
        icon: '🔍',
        name: 'Discovery',
        description: 'Understanding needs',
        avgDuration: 15,
        keywords: ['challenge', 'problem', 'currently using', 'pain point', 'struggling', 'need'],
        tips: ['Ask open questions', 'Listen actively', 'Identify pain points']
      },
      {
        id: 'qualification',
        icon: '✅',
        name: 'Qualification',
        description: 'Assessing fit',
        avgDuration: 10,
        keywords: ['budget', 'timeline', 'decision', 'who else', 'authority', 'process'],
        tips: ['Confirm budget', 'Understand timeline', 'Identify stakeholders']
      },
      {
        id: 'presentation',
        icon: '📊',
        name: 'Presentation',
        description: 'Showing solution',
        avgDuration: 20,
        keywords: ['demo', 'feature', 'benefit', 'how it works', 'example', 'use case'],
        tips: ['Show relevant features', 'Tie to their needs', 'Use customer stories']
      },
      {
        id: 'closing',
        icon: '🤝',
        name: 'Closing',
        description: 'Moving forward',
        avgDuration: 10,
        keywords: ['next steps', 'move forward', 'get started', 'sign', 'contract', 'proposal'],
        tips: ['Create urgency', 'Address final concerns', 'Define clear next steps']
      }
    ];

    this.init();
  }

  /**
   * Initialize navigator
   */
  init() {
    this.injectStyles();
    this.createContainer();
    this.render();
    this.startTimer();
  }

  /**
   * Create container
   */
  createContainer() {
    this.container = document.createElement('div');
    this.container.id = 'sc-meeting-navigator';
    this.container.className = 'sc-meeting-navigator';
    document.body.appendChild(this.container);
  }

  /**
   * Render navigator UI
   */
  render() {
    const currentStage = this.stages[this.currentStage];
    const nextStage = this.stages[this.currentStage + 1];
    const duration = this.getCurrentStageDuration();

    this.container.innerHTML = `
      <div class="sc-nav-header">
        <div class="sc-nav-title">Meeting Progress</div>
        <div class="sc-nav-timer" id="sc-nav-timer">0:00</div>
      </div>

      <div class="sc-nav-stages">
        ${this.stages.map((stage, i) => `
          <div class="sc-nav-stage ${i === this.currentStage ? 'active' : ''} ${i < this.currentStage ? 'completed' : ''}">
            <div class="sc-nav-stage-icon">${stage.icon}</div>
            <div class="sc-nav-stage-name">${stage.name}</div>
            ${i < this.currentStage ? '<div class="sc-nav-check">✓</div>' : ''}
          </div>
          ${i < this.stages.length - 1 ? '<div class="sc-nav-connector"></div>' : ''}
        `).join('')}
      </div>

      <div class="sc-nav-current">
        <div class="sc-nav-current-label">Current Stage:</div>
        <div class="sc-nav-current-stage">
          <span class="sc-nav-current-icon">${currentStage.icon}</span>
          <span class="sc-nav-current-name">${currentStage.name}</span>
          <span class="sc-nav-current-time">(${duration})</span>
        </div>
        <div class="sc-nav-current-desc">${currentStage.description}</div>
      </div>

      ${nextStage ? `
        <div class="sc-nav-next">
          <div class="sc-nav-next-label">Next:</div>
          <div class="sc-nav-next-stage">
            ${nextStage.icon} ${nextStage.name}
          </div>
        </div>
      ` : `
        <div class="sc-nav-final">
          <div class="sc-nav-final-icon">🎉</div>
          <div class="sc-nav-final-text">Ready to close!</div>
        </div>
      `}

      <div class="sc-nav-tips">
        <div class="sc-nav-tips-label">💡 Tips for this stage:</div>
        ${currentStage.tips.map(tip => `
          <div class="sc-nav-tip">• ${tip}</div>
        `).join('')}
      </div>

      <div class="sc-nav-actions">
        <button class="sc-nav-btn" onclick="meetingNavigator.previousStage()">← Prev</button>
        <button class="sc-nav-btn sc-nav-btn-primary" onclick="meetingNavigator.nextStage()">Next →</button>
      </div>
    `;

    this.updateTimer();
  }

  /**
   * Detect stage based on transcript
   */
  detectStage(transcript) {
    const text = transcript.text.toLowerCase();
    const currentStage = this.stages[this.currentStage];

    // Check if still in current stage
    const currentStageScore = this.scoreStage(text, currentStage);

    // Check next stage
    const nextStageIndex = this.currentStage + 1;
    if (nextStageIndex < this.stages.length) {
      const nextStage = this.stages[nextStageIndex];
      const nextStageScore = this.scoreStage(text, nextStage);

      // If next stage score is significantly higher, advance
      if (nextStageScore > currentStageScore + 2) {
        this.advanceToStage(nextStageIndex);
      }
    }
  }

  /**
   * Score stage based on keywords
   */
  scoreStage(text, stage) {
    let score = 0;
    stage.keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        score += 1;
      }
    });
    return score;
  }

  /**
   * Advance to specific stage
   */
  advanceToStage(stageIndex) {
    if (stageIndex >= this.stages.length || stageIndex <= this.currentStage) {
      return;
    }

    console.log(`🗺️ Advancing to stage: ${this.stages[stageIndex].name}`);

    // Record stage transition
    this.stageHistory.push({
      from: this.currentStage,
      to: stageIndex,
      timestamp: Date.now(),
      duration: this.getCurrentStageDuration()
    });

    this.currentStage = stageIndex;
    this.render();

    // Show notification
    this.showStageNotification(this.stages[stageIndex]);
  }

  /**
   * Manual navigation
   */
  nextStage() {
    if (this.currentStage < this.stages.length - 1) {
      this.advanceToStage(this.currentStage + 1);
    }
  }

  previousStage() {
    if (this.currentStage > 0) {
      this.currentStage--;
      this.render();
    }
  }

  /**
   * Get current stage duration
   */
  getCurrentStageDuration() {
    const lastTransition = this.stageHistory[this.stageHistory.length - 1];
    const startTime = lastTransition ? lastTransition.timestamp : this.startTime;
    const duration = Math.floor((Date.now() - startTime) / 1000); // seconds

    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Start timer
   */
  startTimer() {
    setInterval(() => {
      this.updateTimer();
    }, 1000);
  }

  /**
   * Update timer display
   */
  updateTimer() {
    const duration = Math.floor((Date.now() - this.startTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    const timerElement = document.getElementById('sc-nav-timer');
    if (timerElement) {
      timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Update current stage duration
    const currentTimeElement = this.container.querySelector('.sc-nav-current-time');
    if (currentTimeElement) {
      currentTimeElement.textContent = `(${this.getCurrentStageDuration()})`;
    }
  }

  /**
   * Show stage notification
   */
  showStageNotification(stage) {
    const notification = document.createElement('div');
    notification.className = 'sc-stage-notification';
    notification.innerHTML = `
      <div class="sc-stage-notif-icon">${stage.icon}</div>
      <div class="sc-stage-notif-content">
        <div class="sc-stage-notif-title">Entered: ${stage.name}</div>
        <div class="sc-stage-notif-desc">${stage.description}</div>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  /**
   * Get meeting analytics
   */
  getAnalytics() {
    return {
      currentStage: this.stages[this.currentStage],
      totalDuration: Math.floor((Date.now() - this.startTime) / 1000),
      stageHistory: this.stageHistory,
      averageStageDuration: this.calculateAverageStageDuration(),
      completionPercentage: ((this.currentStage + 1) / this.stages.length) * 100
    };
  }

  /**
   * Calculate average stage duration
   */
  calculateAverageStageDuration() {
    if (this.stageHistory.length === 0) return 0;

    const totalDuration = this.stageHistory.reduce((sum, h) => {
      const duration = parseInt(h.duration.split(':')[0]) * 60 + parseInt(h.duration.split(':')[1]);
      return sum + duration;
    }, 0);

    return Math.floor(totalDuration / this.stageHistory.length);
  }

  /**
   * Inject styles
   */
  injectStyles() {
    const styleId = 'sc-meeting-navigator-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .sc-meeting-navigator {
        position: fixed;
        top: 140px;
        right: 20px;
        width: 320px;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(20px);
        border-radius: 16px;
        padding: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        z-index: 999997;
        border: 1px solid rgba(139, 92, 246, 0.3);
        font-family: 'Inter', sans-serif;
      }

      .sc-nav-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .sc-nav-title {
        font-size: 14px;
        font-weight: 600;
        color: #f1f5f9;
      }

      .sc-nav-timer {
        font-size: 12px;
        color: #8b5cf6;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }

      .sc-nav-stages {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
        padding-bottom: 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .sc-nav-stage {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
      }

      .sc-nav-stage-icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        transition: all 0.3s ease;
      }

      .sc-nav-stage.active .sc-nav-stage-icon {
        background: rgba(139, 92, 246, 0.3);
        border-color: #8b5cf6;
        box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
      }

      .sc-nav-stage.completed .sc-nav-stage-icon {
        background: rgba(16, 185, 129, 0.2);
        border-color: #10b981;
      }

      .sc-nav-stage-name {
        margin-top: 6px;
        font-size: 9px;
        color: #94a3b8;
        text-align: center;
        max-width: 50px;
        line-height: 1.2;
      }

      .sc-nav-stage.active .sc-nav-stage-name {
        color: #c4b5fd;
        font-weight: 600;
      }

      .sc-nav-check {
        position: absolute;
        top: -4px;
        right: -4px;
        width: 14px;
        height: 14px;
        background: #10b981;
        border-radius: 50%;
        color: #fff;
        font-size: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .sc-nav-connector {
        width: 20px;
        height: 2px;
        background: rgba(255, 255, 255, 0.1);
        margin: 0 -8px;
      }

      .sc-nav-current {
        margin-bottom: 12px;
      }

      .sc-nav-current-label {
        font-size: 11px;
        color: #94a3b8;
        margin-bottom: 6px;
      }

      .sc-nav-current-stage {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        color: #f1f5f9;
        font-weight: 600;
      }

      .sc-nav-current-time {
        font-size: 12px;
        color: #8b5cf6;
        font-weight: normal;
      }

      .sc-nav-current-desc {
        font-size: 12px;
        color: #cbd5e1;
        margin-top: 4px;
      }

      .sc-nav-next {
        padding: 8px;
        background: rgba(139, 92, 246, 0.1);
        border-radius: 8px;
        margin-bottom: 12px;
      }

      .sc-nav-next-label {
        font-size: 10px;
        color: #94a3b8;
        margin-bottom: 4px;
      }

      .sc-nav-next-stage {
        font-size: 13px;
        color: #c4b5fd;
        font-weight: 500;
      }

      .sc-nav-final {
        text-align: center;
        padding: 12px;
        background: rgba(16, 185, 129, 0.1);
        border-radius: 8px;
        margin-bottom: 12px;
      }

      .sc-nav-final-icon {
        font-size: 24px;
        margin-bottom: 4px;
      }

      .sc-nav-final-text {
        font-size: 14px;
        color: #6ee7b7;
        font-weight: 600;
      }

      .sc-nav-tips {
        background: rgba(251, 191, 36, 0.1);
        border-radius: 8px;
        padding: 10px;
        margin-bottom: 12px;
      }

      .sc-nav-tips-label {
        font-size: 11px;
        color: #fbbf24;
        margin-bottom: 6px;
        font-weight: 500;
      }

      .sc-nav-tip {
        font-size: 11px;
        color: #fde68a;
        line-height: 1.4;
        margin: 2px 0;
      }

      .sc-nav-actions {
        display: flex;
        gap: 8px;
      }

      .sc-nav-btn {
        flex: 1;
        padding: 8px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        color: #cbd5e1;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .sc-nav-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
      }

      .sc-nav-btn-primary {
        background: rgba(139, 92, 246, 0.3);
        border-color: #8b5cf6;
        color: #fff;
      }

      .sc-nav-btn-primary:hover {
        background: rgba(139, 92, 246, 0.4);
      }

      /* Stage Notification */
      .sc-stage-notification {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(20px);
        border-radius: 12px;
        padding: 16px 20px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        z-index: 1000001;
        border: 1px solid rgba(139, 92, 246, 0.5);
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideDown 0.3s ease;
      }

      .sc-stage-notification.fade-out {
        animation: fadeOut 0.3s ease;
        opacity: 0;
      }

      .sc-stage-notif-icon {
        font-size: 32px;
      }

      .sc-stage-notif-title {
        font-size: 14px;
        font-weight: 600;
        color: #f1f5f9;
        margin-bottom: 2px;
      }

      .sc-stage-notif-desc {
        font-size: 12px;
        color: #cbd5e1;
      }

      @keyframes slideDown {
        from {
          transform: translateX(-50%) translateY(-20px);
          opacity: 0;
        }
        to {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
      }

      @keyframes fadeOut {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }
    `;

    document.head.appendChild(style);
  }
}

// Global access for button clicks
window.meetingNavigator = null;
