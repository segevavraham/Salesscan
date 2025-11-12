/**
 * Proactive Coaching Engine
 * Smart coaching system that provides timely tips and nudges
 * Like Duolingo for sales - gamified, proactive, and contextual
 */

export class ProactiveCoachingEngine {
  constructor() {
    this.rules = [];
    this.triggers = new Map();
    this.coachingCards = [];
    this.activeCard = null;
    this.statistics = {
      totalCoaches: 0,
      acceptedSuggestions: 0,
      dismissedSuggestions: 0,
      successRate: 0
    };

    // Initialize rules
    this.initializeRules();
  }

  /**
   * Initialize coaching rules
   */
  initializeRules() {
    this.rules = [
      // TIME-BASED RULES
      {
        id: 'meeting_too_long',
        type: 'time',
        condition: (context) => context.duration > 45 * 60 * 1000, // 45 minutes
        message: '⏰ Meeting running long',
        advice: 'Consider wrapping up or scheduling a follow-up. Long meetings lose effectiveness after 45 minutes.',
        action: 'Suggest next steps',
        priority: 'medium'
      },
      {
        id: 'silence_too_long',
        type: 'time',
        condition: (context) => context.silenceDuration > 20000, // 20 seconds
        message: '🤫 Long silence detected',
        advice: 'Break the silence! Ask an open-ended question or summarize what was discussed.',
        quickActions: [
          'What are your thoughts on this?',
          'Let me summarize what we\'ve covered...',
          'Any questions so far?'
        ],
        priority: 'high'
      },

      // TALK RATIO RULES
      {
        id: 'talking_too_much',
        type: 'talk_ratio',
        condition: (context) => context.talkRatio.salesperson > 70,
        message: '🗣️ You\'re dominating the conversation',
        advice: 'Great salespeople listen 60-70% of the time. Ask more questions and let the client talk.',
        quickActions: [
          'Tell me more about that...',
          'How does that affect your business?',
          'What concerns do you have?'
        ],
        priority: 'high'
      },
      {
        id: 'client_not_engaged',
        type: 'talk_ratio',
        condition: (context) => context.talkRatio.client < 30,
        message: '👂 Client seems quiet',
        advice: 'Engage them! They should be doing most of the talking. Ask open-ended questions.',
        quickActions: [
          'What challenges are you facing?',
          'Walk me through your current process...',
          'What would ideal success look like?'
        ],
        priority: 'high'
      },

      // SENTIMENT RULES
      {
        id: 'sentiment_declining',
        type: 'sentiment',
        condition: (context) => {
          const recent = context.sentimentHistory.slice(-3);
          return recent.length >= 3 &&
                 recent.every((s, i) => i === 0 || s < recent[i-1]);
        },
        message: '📉 Sentiment declining',
        advice: 'The client seems less enthusiastic. Address their concerns directly and show empathy.',
        quickActions: [
          'I sense some hesitation. What concerns you?',
          'Let\'s make sure this is right for you...',
          'What would make this a perfect fit?'
        ],
        priority: 'urgent'
      },
      {
        id: 'client_excited',
        type: 'sentiment',
        condition: (context) => context.currentSentiment === 'positive' && context.urgency > 7,
        message: '🎉 Client is excited!',
        advice: 'Strike while the iron is hot! Move towards commitment or next steps.',
        quickActions: [
          'Should we move forward with this?',
          'What are the next steps on your end?',
          'When would you like to get started?'
        ],
        priority: 'high'
      },

      // STAGE-BASED RULES
      {
        id: 'discovery_no_questions',
        type: 'stage',
        condition: (context) => {
          return context.stage === 'discovery' &&
                 context.questionCount < 3 &&
                 context.duration > 10 * 60 * 1000;
        },
        message: '🔍 Not enough discovery',
        advice: 'You should ask 5-10 questions in discovery. Uncover their pain points before pitching.',
        quickActions: [
          'What prompted you to look for a solution?',
          'What happens if you don\'t solve this?',
          'Who else is affected by this problem?'
        ],
        priority: 'high'
      },
      {
        id: 'qualification_missing_budget',
        type: 'stage',
        condition: (context) => {
          return context.stage === 'qualification' &&
                 !context.discussedTopics.includes('budget') &&
                 context.duration > 15 * 60 * 1000;
        },
        message: '💰 Budget not discussed',
        advice: 'You need to understand their budget before proposing a solution.',
        quickActions: [
          'What budget have you allocated for this?',
          'Are you comparing different price points?',
          'What\'s your investment timeline?'
        ],
        priority: 'high'
      },
      {
        id: 'closing_no_next_steps',
        type: 'stage',
        condition: (context) => {
          return context.stage === 'closing' &&
                 context.duration > 40 * 60 * 1000 &&
                 !context.nextStepsScheduled;
        },
        message: '📅 Schedule next steps!',
        advice: 'Always end with clear next steps scheduled. Don\'t leave it open-ended.',
        quickActions: [
          'Let\'s schedule a follow-up right now',
          'What day works best for you next week?',
          'Can we get a contract review scheduled?'
        ],
        priority: 'urgent'
      },

      // BUYING SIGNALS
      {
        id: 'buying_signal_detected',
        type: 'buying_signal',
        condition: (context) => context.buyingSignals.length > 0,
        message: '🎯 Buying signal detected!',
        advice: (context) => {
          const signal = context.buyingSignals[context.buyingSignals.length - 1];
          return `Client mentioned "${signal}". This is a strong buying signal - advance the conversation!`;
        },
        quickActions: [
          'Would you like to move forward?',
          'What would need to happen for you to say yes?',
          'Should we discuss implementation?'
        ],
        priority: 'urgent'
      },

      // OBJECTION HANDLING
      {
        id: 'price_objection',
        type: 'objection',
        condition: (context) => {
          return context.objections.some(obj => obj.type === 'price_concern');
        },
        message: '💵 Price objection detected',
        advice: 'Don\'t defend the price. Focus on value and ROI. Understand their budget constraints.',
        quickActions: [
          'Let\'s talk about the value you\'ll receive...',
          'What\'s the cost of not solving this problem?',
          'Would you like to see some ROI projections?'
        ],
        priority: 'high'
      },
      {
        id: 'competitor_mentioned',
        type: 'objection',
        condition: (context) => {
          return context.competitorsMentioned && context.competitorsMentioned.length > 0;
        },
        message: '🏢 Competitor mentioned',
        advice: (context) => {
          const competitor = context.competitorsMentioned[context.competitorsMentioned.length - 1];
          return `Client mentioned ${competitor}. Don't bad-mouth them - focus on your unique value.`;
        },
        quickActions: [
          'What do you like about their solution?',
          'What concerns do you have about them?',
          'Let me share what makes us different...'
        ],
        priority: 'high'
      },

      // PATTERN DETECTION
      {
        id: 'too_many_features',
        type: 'pattern',
        condition: (context) => {
          const featureWords = ['feature', 'capability', 'function', 'integration'];
          const count = context.yourMessages.reduce((acc, msg) => {
            return acc + featureWords.reduce((sum, word) =>
              sum + (msg.toLowerCase().match(new RegExp(word, 'g')) || []).length
            , 0);
          }, 0);
          return count > 10;
        },
        message: '📋 Feature overload!',
        advice: 'You\'re listing too many features. Focus on benefits and outcomes, not features.',
        priority: 'medium'
      },
      {
        id: 'not_enough_questions',
        type: 'pattern',
        condition: (context) => {
          const questionRatio = context.questionCount / (context.totalMessages || 1);
          return questionRatio < 0.2 && context.duration > 10 * 60 * 1000;
        },
        message: '❓ Ask more questions!',
        advice: 'Great sellers ask 50% more questions than average sellers. Be curious!',
        priority: 'high'
      },

      // ENCOURAGEMENT & POSITIVE REINFORCEMENT
      {
        id: 'great_question',
        type: 'encouragement',
        condition: (context) => {
          const lastMessage = context.yourMessages[context.yourMessages.length - 1];
          const greatQuestions = ['why', 'how', 'tell me', 'walk me through', 'help me understand'];
          return greatQuestions.some(q => lastMessage?.toLowerCase().includes(q));
        },
        message: '✨ Great question!',
        advice: 'That was an excellent discovery question. Keep digging deeper!',
        priority: 'low',
        type: 'positive'
      }
    ];
  }

  /**
   * Evaluate context and return coaching suggestions
   */
  evaluate(context) {
    const triggeredRules = [];

    for (const rule of this.rules) {
      try {
        if (rule.condition(context)) {
          triggeredRules.push({
            ...rule,
            triggeredAt: Date.now()
          });
        }
      } catch (error) {
        console.error(`Error evaluating rule ${rule.id}:`, error);
      }
    }

    // Sort by priority
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    triggeredRules.sort((a, b) =>
      (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99)
    );

    return triggeredRules;
  }

  /**
   * Show coaching card
   */
  showCoachingCard(rule, onAccept, onDismiss) {
    // Create card
    const card = document.createElement('div');
    card.className = 'sc-coaching-card';
    card.style.cssText = `
      position: fixed;
      bottom: 400px;
      right: 30px;
      max-width: 350px;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border-radius: 16px;
      padding: 20px;
      box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.1),
        0 15px 50px rgba(0, 0, 0, 0.4),
        0 0 80px rgba(139, 92, 246, 0.3);
      border: 1px solid rgba(139, 92, 246, 0.3);
      z-index: 999995;
      animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: 'Inter', sans-serif;
    `;

    // Priority color
    const priorityColors = {
      urgent: '#ef4444',
      high: '#f59e0b',
      medium: '#8b5cf6',
      low: '#06b6d4'
    };
    const priorityColor = priorityColors[rule.priority] || '#8b5cf6';

    card.innerHTML = `
      <style>
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
      </style>

      <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px;">
        <div style="
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: ${priorityColor}20;
          border: 2px solid ${priorityColor};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        ">
          ${this.getPriorityIcon(rule.priority)}
        </div>
        <div style="flex: 1;">
          <div style="
            font-size: 14px;
            font-weight: 600;
            color: #e2e8f0;
            margin-bottom: 4px;
          ">
            ${rule.message}
          </div>
          <div style="
            font-size: 12px;
            color: #94a3b8;
            line-height: 1.5;
          ">
            ${typeof rule.advice === 'function' ? rule.advice(context) : rule.advice}
          </div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          font-size: 20px;
          line-height: 1;
          padding: 0;
          width: 24px;
          height: 24px;
        ">×</button>
      </div>

      ${rule.quickActions ? `
        <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
          ${rule.quickActions.map((action, i) => `
            <button class="sc-quick-action-btn" data-index="${i}" style="
              background: rgba(139, 92, 246, 0.1);
              border: 1px solid rgba(139, 92, 246, 0.3);
              padding: 10px 12px;
              border-radius: 8px;
              text-align: left;
              cursor: pointer;
              color: #e2e8f0;
              font-size: 13px;
              transition: all 0.2s;
            " onmouseover="this.style.background='rgba(139, 92, 246, 0.2)'" onmouseout="this.style.background='rgba(139, 92, 246, 0.1)'">
              ${action}
            </button>
          `).join('')}
        </div>
      ` : ''}

      <div style="display: flex; gap: 8px;">
        <button class="sc-coaching-accept" style="
          flex: 1;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          color: white;
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
        <button class="sc-coaching-dismiss" style="
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        ">
          Dismiss
        </button>
      </div>

      <div style="
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        font-size: 11px;
        color: #64748b;
        text-align: center;
      ">
        Success Rate: ${this.statistics.successRate.toFixed(0)}% •
        Tip ${this.statistics.totalCoaches + 1}
      </div>
    `;

    document.body.appendChild(card);
    this.activeCard = card;
    this.statistics.totalCoaches++;

    // Event listeners
    card.querySelector('.sc-coaching-accept').onclick = () => {
      this.statistics.acceptedSuggestions++;
      this.updateSuccessRate();
      card.style.animation = 'slideInRight 0.3s reverse';
      setTimeout(() => card.remove(), 300);
      if (onAccept) onAccept(rule);
    };

    card.querySelector('.sc-coaching-dismiss').onclick = () => {
      this.statistics.dismissedSuggestions++;
      this.updateSuccessRate();
      card.remove();
      if (onDismiss) onDismiss(rule);
    };

    // Quick action buttons
    card.querySelectorAll('.sc-quick-action-btn').forEach(btn => {
      btn.onclick = () => {
        const actionText = btn.textContent.trim();
        navigator.clipboard.writeText(actionText);
        btn.textContent = '✓ Copied!';
        btn.style.background = 'rgba(34, 197, 94, 0.2)';
        btn.style.borderColor = 'rgba(34, 197, 94, 0.4)';
        setTimeout(() => {
          btn.textContent = actionText;
          btn.style.background = 'rgba(139, 92, 246, 0.1)';
          btn.style.borderColor = 'rgba(139, 92, 246, 0.3)';
        }, 2000);
      };
    });

    // Auto-dismiss after 30 seconds (except urgent)
    if (rule.priority !== 'urgent') {
      setTimeout(() => {
        if (card.parentElement) {
          card.style.opacity = '0';
          setTimeout(() => card.remove(), 300);
        }
      }, 30000);
    }
  }

  /**
   * Get priority icon
   */
  getPriorityIcon(priority) {
    const icons = {
      urgent: '🚨',
      high: '⚡',
      medium: '💡',
      low: '✨'
    };
    return icons[priority] || '💡';
  }

  /**
   * Update success rate
   */
  updateSuccessRate() {
    const total = this.statistics.acceptedSuggestions + this.statistics.dismissedSuggestions;
    if (total > 0) {
      this.statistics.successRate = (this.statistics.acceptedSuggestions / total) * 100;
    }
  }

  /**
   * Get statistics
   */
  getStatistics() {
    return { ...this.statistics };
  }

  /**
   * Clear active card
   */
  clearActiveCard() {
    if (this.activeCard) {
      this.activeCard.remove();
      this.activeCard = null;
    }
  }
}
