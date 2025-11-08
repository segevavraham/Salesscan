/**
 * Meeting Intelligence Suite
 * Combined system for stage tracking, competitor intelligence, and pattern detection
 */

/**
 * Meeting Stages Tracker
 * Automatically detects and tracks sales meeting stages
 */
export class MeetingStagesTracker {
  constructor() {
    this.currentStage = 'warming_up';
    this.stageHistory = [];
    this.stageConfidence = 0;
    this.progressWidget = null;

    // Define sales stages
    this.stages = [
      {
        id: 'warming_up',
        name: 'Warming Up',
        description: 'Building rapport and setting agenda',
        icon: '👋',
        color: '#06b6d4',
        keywords: ['hello', 'nice to meet', 'thanks for', 'appreciate', 'how are you'],
        duration: { min: 0, max: 5 } // minutes
      },
      {
        id: 'discovery',
        name: 'Discovery',
        description: 'Understanding needs and pain points',
        icon: '🔍',
        color: '#8b5cf6',
        keywords: ['tell me about', 'what', 'why', 'how', 'challenge', 'problem', 'goal', 'need'],
        duration: { min: 5, max: 20 }
      },
      {
        id: 'qualification',
        name: 'Qualification',
        description: 'Budget, authority, need, timeline',
        icon: '✅',
        color: '#f59e0b',
        keywords: ['budget', 'decision', 'timeline', 'authority', 'approval', 'stakeholder'],
        duration: { min: 15, max: 25 }
      },
      {
        id: 'presentation',
        name: 'Presentation',
        description: 'Demonstrating solution and value',
        icon: '📊',
        color: '#3b82f6',
        keywords: ['solution', 'feature', 'benefit', 'demo', 'show you', 'capability', 'works'],
        duration: { min: 20, max: 35 }
      },
      {
        id: 'handling_objections',
        name: 'Handling Objections',
        description: 'Addressing concerns and doubts',
        icon: '💬',
        color: '#ef4444',
        keywords: ['concern', 'worry', 'but', 'however', 'hesitant', 'unsure', 'expensive'],
        duration: { min: 25, max: 40 }
      },
      {
        id: 'closing',
        name: 'Closing',
        description: 'Moving towards commitment',
        icon: '🤝',
        color: '#22c55e',
        keywords: ['next steps', 'move forward', 'start', 'sign', 'contract', 'agreement', 'commit'],
        duration: { min: 35, max: 60 }
      }
    ];
  }

  /**
   * Initialize stage tracker
   */
  initialize() {
    this.createProgressWidget();
    this.stageHistory.push({
      stage: this.currentStage,
      timestamp: Date.now(),
      confidence: 1.0
    });
  }

  /**
   * Create visual progress widget
   */
  createProgressWidget() {
    this.progressWidget = document.createElement('div');
    this.progressWidget.id = 'sc-stages-widget';
    this.progressWidget.style.cssText = `
      position: fixed;
      top: 100px;
      left: 20px;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 16px;
      padding: 20px;
      box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.1),
        0 10px 40px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(139, 92, 246, 0.3);
      z-index: 999996;
      width: 280px;
      font-family: 'Inter', sans-serif;
    `;

    this.progressWidget.innerHTML = `
      <div style="margin-bottom: 16px;">
        <div style="font-size: 12px; font-weight: 600; color: #8b5cf6; text-transform: uppercase; letter-spacing: 0.5px;">
          Meeting Progress
        </div>
      </div>

      <div id="sc-stages-list"></div>

      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748b;">
          <span>Duration</span>
          <span id="sc-stage-duration">0:00</span>
        </div>
      </div>
    `;

    document.body.appendChild(this.progressWidget);
    this.renderStages();
  }

  /**
   * Render stages list
   */
  renderStages() {
    const container = document.getElementById('sc-stages-list');
    if (!container) return;

    container.innerHTML = this.stages.map((stage, index) => {
      const isActive = stage.id === this.currentStage;
      const isPassed = this.stageHistory.some(h => h.stage === stage.id);

      return `
        <div style="
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          margin-bottom: 8px;
          border-radius: 10px;
          background: ${isActive ? `${stage.color}20` : 'rgba(255, 255, 255, 0.03)'};
          border: 1px solid ${isActive ? stage.color : 'transparent'};
          transition: all 0.3s;
          ${isActive ? 'transform: scale(1.02);' : ''}
        ">
          <div style="
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: ${isPassed || isActive ? `${stage.color}40` : 'rgba(255, 255, 255, 0.05)'};
            border: 2px solid ${isPassed || isActive ? stage.color : 'rgba(255, 255, 255, 0.1)'};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            flex-shrink: 0;
            ${isActive ? `box-shadow: 0 0 20px ${stage.color}60;` : ''}
          ">
            ${isPassed && !isActive ? '✓' : stage.icon}
          </div>
          <div style="flex: 1;">
            <div style="
              font-size: 13px;
              font-weight: ${isActive ? '600' : '500'};
              color: ${isActive ? stage.color : '#94a3b8'};
            ">
              ${stage.name}
            </div>
            ${isActive ? `
              <div style="
                font-size: 10px;
                color: #64748b;
                margin-top: 2px;
              ">
                ${stage.description}
              </div>
            ` : ''}
          </div>
          ${isActive ? `
            <div style="
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: ${stage.color};
              animation: pulse 2s ease-in-out infinite;
            "></div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  /**
   * Detect stage from conversation
   */
  detectStage(transcript, conversationContext) {
    const text = transcript.text.toLowerCase();
    const scores = {};

    // Score each stage based on keywords
    for (const stage of this.stages) {
      let score = 0;

      // Keyword matching
      for (const keyword of stage.keywords) {
        if (text.includes(keyword)) {
          score += 10;
        }
      }

      // Time-based scoring
      const duration = (Date.now() - conversationContext.startTime) / 1000 / 60; // minutes
      if (duration >= stage.duration.min && duration <= stage.duration.max) {
        score += 5;
      }

      scores[stage.id] = score;
    }

    // Get highest scoring stage
    const bestStage = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)[0];
    const confidence = scores[bestStage] / 50; // Normalize to 0-1

    // Only change stage if confidence is high enough
    if (confidence > 0.3 && bestStage !== this.currentStage) {
      this.changeStage(bestStage, confidence);
    }
  }

  /**
   * Change current stage
   */
  changeStage(newStage, confidence = 1.0) {
    this.currentStage = newStage;
    this.stageConfidence = confidence;

    this.stageHistory.push({
      stage: newStage,
      timestamp: Date.now(),
      confidence
    });

    this.renderStages();

    // Trigger stage change event
    window.dispatchEvent(new CustomEvent('sc-stage-change', {
      detail: {
        stage: newStage,
        confidence,
        stageInfo: this.stages.find(s => s.id === newStage)
      }
    }));
  }

  /**
   * Get current stage info
   */
  getCurrentStage() {
    return this.stages.find(s => s.id === this.currentStage);
  }

  /**
   * Get stage progress (0-100%)
   */
  getProgress() {
    const currentIndex = this.stages.findIndex(s => s.id === this.currentStage);
    return Math.round(((currentIndex + 1) / this.stages.length) * 100);
  }

  /**
   * Hide widget
   */
  hide() {
    if (this.progressWidget) {
      this.progressWidget.style.display = 'none';
    }
  }

  /**
   * Show widget
   */
  show() {
    if (this.progressWidget) {
      this.progressWidget.style.display = 'block';
    }
  }

  /**
   * Destroy widget
   */
  destroy() {
    if (this.progressWidget) {
      this.progressWidget.remove();
    }
  }
}

/**
 * Competitor Intelligence System
 * Detects competitor mentions and provides strategic responses
 */
export class CompetitorIntelligence {
  constructor() {
    this.competitors = new Map();
    this.mentions = [];
    this.knownCompetitors = this.loadKnownCompetitors();
  }

  /**
   * Load known competitors database
   */
  loadKnownCompetitors() {
    return [
      {
        name: 'Salesforce',
        aliases: ['sf', 'sales force', 'sfdc'],
        category: 'CRM',
        strengths: ['Enterprise features', 'Ecosystem', 'Brand recognition'],
        weaknesses: ['Expensive', 'Complex', 'Steep learning curve'],
        positioning: 'We\'re more intuitive and cost-effective while still being powerful.'
      },
      {
        name: 'HubSpot',
        aliases: ['hub spot', 'hubspot'],
        category: 'Marketing/CRM',
        strengths: ['Easy to use', 'Marketing tools', 'Free tier'],
        weaknesses: ['Limited customization', 'Expensive at scale', 'Support issues'],
        positioning: 'We offer better customization and support at your scale.'
      },
      {
        name: 'Zoom',
        aliases: ['zoom', 'zoom meetings'],
        category: 'Video Conferencing',
        strengths: ['Simple', 'Reliable', 'Well-known'],
        weaknesses: ['Security concerns', 'Limited features', 'No AI coaching'],
        positioning: 'We add AI-powered sales coaching that Zoom doesn\'t have.'
      },
      {
        name: 'Microsoft Teams',
        aliases: ['teams', 'ms teams', 'microsoft teams'],
        category: 'Collaboration',
        strengths: ['Office integration', 'Enterprise ready', 'Secure'],
        weaknesses: ['Complex', 'Limited sales features', 'No AI coaching'],
        positioning: 'We\'re built specifically for sales teams with AI coaching.'
      }
    ];
  }

  /**
   * Detect competitor mention
   */
  detectMention(transcript) {
    const text = transcript.text.toLowerCase();

    for (const competitor of this.knownCompetitors) {
      const allNames = [competitor.name.toLowerCase(), ...competitor.aliases];

      for (const name of allNames) {
        if (text.includes(name)) {
          this.recordMention(competitor, transcript);
          return competitor;
        }
      }
    }

    return null;
  }

  /**
   * Record competitor mention
   */
  recordMention(competitor, transcript) {
    const mention = {
      competitor: competitor.name,
      text: transcript.text,
      timestamp: Date.now(),
      sentiment: transcript.sentiment
    };

    this.mentions.push(mention);

    // Update competitor counter
    const count = this.competitors.get(competitor.name) || 0;
    this.competitors.set(competitor.name, count + 1);

    // Show competitor card
    this.showCompetitorCard(competitor, mention);
  }

  /**
   * Show competitor intelligence card
   */
  showCompetitorCard(competitor, mention) {
    const card = document.createElement('div');
    card.className = 'sc-competitor-card';
    card.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      max-width: 500px;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border-radius: 16px;
      padding: 20px;
      box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.1),
        0 15px 50px rgba(0, 0, 0, 0.4),
        0 0 80px rgba(239, 68, 68, 0.3);
      border: 1px solid rgba(239, 68, 68, 0.3);
      z-index: 999998;
      animation: bounceIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: 'Inter', sans-serif;
    `;

    card.innerHTML = `
      <style>
        @keyframes bounceIn {
          0% { opacity: 0; transform: translateX(-50%) scale(0.8); }
          50% { transform: translateX(-50%) scale(1.05); }
          100% { opacity: 1; transform: translateX(-50%) scale(1); }
        }
      </style>

      <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px;">
        <div style="
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(239, 68, 68, 0.2);
          border: 2px solid #ef4444;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
        ">🏢</div>
        <div style="flex: 1;">
          <div style="font-size: 16px; font-weight: 600; color: #fca5a5; margin-bottom: 4px;">
            Competitor Mentioned: ${competitor.name}
          </div>
          <div style="font-size: 13px; color: #94a3b8;">
            Client mentioned "${mention.text.substring(0, 50)}..."
          </div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          font-size: 24px;
          line-height: 1;
          padding: 0;
        ">×</button>
      </div>

      <div style="
        background: rgba(239, 68, 68, 0.1);
        border-left: 3px solid #ef4444;
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 12px;
      ">
        <div style="font-size: 12px; font-weight: 600; color: #fca5a5; margin-bottom: 8px;">
          💡 Positioning Strategy
        </div>
        <div style="font-size: 13px; color: #e2e8f0; line-height: 1.6;">
          ${competitor.positioning}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
        <div style="
          background: rgba(34, 197, 94, 0.1);
          border-radius: 8px;
          padding: 10px;
        ">
          <div style="font-size: 11px; font-weight: 600; color: #86efac; margin-bottom: 6px;">
            ✓ Their Strengths
          </div>
          <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #cbd5e1;">
            ${competitor.strengths.map(s => `<li>${s}</li>`).join('')}
          </ul>
        </div>
        <div style="
          background: rgba(239, 68, 68, 0.1);
          border-radius: 8px;
          padding: 10px;
        ">
          <div style="font-size: 11px; font-weight: 600; color: #fca5a5; margin-bottom: 6px;">
            ✗ Their Weaknesses
          </div>
          <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #cbd5e1;">
            ${competitor.weaknesses.map(w => `<li>${w}</li>`).join('')}
          </ul>
        </div>
      </div>

      <div style="
        font-size: 11px;
        color: #64748b;
        text-align: center;
        padding-top: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      ">
        ⚠️ Never bad-mouth competitors. Focus on your unique value.
      </div>
    `;

    document.body.appendChild(card);

    // Auto-remove after 45 seconds
    setTimeout(() => {
      if (card.parentElement) {
        card.style.animation = 'bounceIn 0.3s reverse';
        setTimeout(() => card.remove(), 300);
      }
    }, 45000);
  }

  /**
   * Get competitor mentions
   */
  getMentions() {
    return [...this.mentions];
  }

  /**
   * Get competitor counts
   */
  getCounts() {
    return Object.fromEntries(this.competitors);
  }
}

/**
 * Price Negotiation Assistant
 * Helps handle pricing discussions and objections
 */
export class PriceNegotiationAssistant {
  constructor() {
    this.priceDiscussions = [];
    this.negotiationStrategies = this.loadStrategies();
  }

  /**
   * Load negotiation strategies
   */
  loadStrategies() {
    return [
      {
        trigger: 'too expensive',
        strategy: 'value_focus',
        response: 'I understand budget is important. Let\'s look at the ROI and value you\'ll receive...',
        tips: [
          'Focus on value, not price',
          'Calculate ROI with them',
          'Break down cost per user/month',
          'Compare to cost of NOT solving the problem'
        ]
      },
      {
        trigger: 'cheaper option',
        strategy: 'quality_differentiation',
        response: 'There are cheaper options, and there are better options. Let me explain what makes us different...',
        tips: [
          'Don\'t compete on price alone',
          'Highlight unique features',
          'Discuss total cost of ownership',
          'Share success stories'
        ]
      },
      {
        trigger: 'discount',
        strategy: 'value_exchange',
        response: 'I might be able to work something out. What would you be willing to commit to in exchange?',
        tips: [
          'Never give discounts freely',
          'Ask for something in return',
          'Annual contract vs monthly',
          'Case study or referral'
        ]
      }
    ];
  }

  /**
   * Detect price discussion
   */
  detectPriceDiscussion(transcript) {
    const text = transcript.text.toLowerCase();
    const priceKeywords = ['price', 'cost', 'expensive', 'cheap', 'budget', 'discount', 'money', '$', 'payment'];

    const foundKeywords = priceKeywords.filter(keyword => text.includes(keyword));

    if (foundKeywords.length > 0) {
      this.recordDiscussion(transcript, foundKeywords);
      return true;
    }

    return false;
  }

  /**
   * Record price discussion
   */
  recordDiscussion(transcript, keywords) {
    this.priceDiscussions.push({
      text: transcript.text,
      keywords,
      timestamp: Date.now(),
      sentiment: transcript.sentiment
    });

    // Check for negotiation opportunities
    for (const strategy of this.negotiationStrategies) {
      if (transcript.text.toLowerCase().includes(strategy.trigger)) {
        this.showNegotiationHelper(strategy);
        break;
      }
    }
  }

  /**
   * Show negotiation helper
   */
  showNegotiationHelper(strategy) {
    const helper = document.createElement('div');
    helper.className = 'sc-negotiation-helper';
    helper.style.cssText = `
      position: fixed;
      bottom: 250px;
      right: 30px;
      max-width: 380px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      border-radius: 16px;
      padding: 20px;
      box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.1),
        0 15px 50px rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(251, 191, 36, 0.3);
      z-index: 999997;
      font-family: 'Inter', sans-serif;
      animation: slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    helper.innerHTML = `
      <style>
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      </style>

      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
        <div style="font-size: 32px;">💰</div>
        <div style="flex: 1;">
          <div style="font-size: 14px; font-weight: 600; color: #fde047;">
            Price Negotiation Detected
          </div>
          <div style="font-size: 12px; color: #94a3b8;">
            Strategy: ${strategy.strategy.replace('_', ' ')}
          </div>
        </div>
      </div>

      <div style="
        background: rgba(251, 191, 36, 0.1);
        border-left: 3px solid #fbbf24;
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 12px;
      ">
        <div style="font-size: 13px; color: #e2e8f0; line-height: 1.6;">
          "${strategy.response}"
        </div>
      </div>

      <div style="margin-bottom: 12px;">
        <div style="font-size: 11px; font-weight: 600; color: #fde047; margin-bottom: 8px;">
          💡 Negotiation Tips:
        </div>
        ${strategy.tips.map(tip => `
          <div style="
            font-size: 12px;
            color: #cbd5e1;
            padding: 6px 0;
            display: flex;
            align-items: flex-start;
            gap: 8px;
          ">
            <span style="color: #fbbf24;">▸</span>
            <span>${tip}</span>
          </div>
        `).join('')}
      </div>

      <button onclick="this.parentElement.remove()" style="
        width: 100%;
        background: linear-gradient(135deg, #fbbf24, #f59e0b);
        color: #0f172a;
        border: none;
        padding: 10px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;
      ">
        Got it! ✓
      </button>
    `;

    document.body.appendChild(helper);

    // Auto-remove after 40 seconds
    setTimeout(() => {
      if (helper.parentElement) {
        helper.style.opacity = '0';
        setTimeout(() => helper.remove(), 300);
      }
    }, 40000);
  }

  /**
   * Get price discussions
   */
  getDiscussions() {
    return [...this.priceDiscussions];
  }
}
