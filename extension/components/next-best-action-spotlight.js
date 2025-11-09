/**
 * Next Best Action Spotlight
 * Highlights the ONE most important action to take right now
 * Reduces decision fatigue and provides clear guidance
 */

export class NextBestActionSpotlight {
  constructor() {
    this.container = null;
    this.currentAction = null;
    this.actionQueue = [];
    this.actionHistory = [];

    // Define action rules with priorities
    this.actionRules = this.defineActionRules();
  }

  /**
   * Define all possible actions with triggers and priorities
   */
  defineActionRules() {
    return [
      // URGENT ACTIONS (Priority: 1)
      {
        id: 'address_objection_now',
        priority: 1,
        trigger: (context) => {
          const recentObjection = context.objections?.slice(-1)[0];
          return recentObjection && !recentObjection.resolved &&
                 (Date.now() - recentObjection.timestamp < 10000); // Last 10s
        },
        action: {
          title: 'Address This Objection Now',
          icon: '⚠️',
          urgency: 'urgent',
          reasoning: 'Client just raised a concern - address it immediately',
          suggestedPhrases: [
            'That\'s a great point. Let me address that...',
            'I totally understand that concern. Here\'s how we handle it...',
            'Many clients initially felt the same way. What they found was...'
          ],
          tips: [
            'Acknowledge their concern first',
            'Don\'t get defensive',
            'Use customer stories'
          ]
        }
      },

      {
        id: 'stop_talking',
        priority: 1,
        trigger: (context) => {
          return (context.talkRatio?.salesperson || 0) > 75;
        },
        action: {
          title: 'Stop Talking - Ask a Question',
          icon: '🤐',
          urgency: 'urgent',
          reasoning: 'You\'re talking too much (75%+ of the time)',
          suggestedPhrases: [
            'But enough about us - tell me about your current process...',
            'What are your thoughts on this so far?',
            'How would this fit into your workflow?'
          ],
          tips: [
            'Listen more than you talk',
            'Ask open-ended questions',
            'Let them discover the value'
          ]
        }
      },

      // HIGH PRIORITY ACTIONS (Priority: 2)
      {
        id: 'ask_budget',
        priority: 2,
        trigger: (context) => {
          return context.buyingSignals?.length > 0 &&
                 !context.budgetDiscussed &&
                 context.currentStage >= 2; // At least in qualification
        },
        action: {
          title: 'Ask About Budget',
          icon: '💰',
          urgency: 'high',
          reasoning: 'Client showed interest but budget not discussed',
          suggestedPhrases: [
            'To help me provide the best solution, what budget range are we working with?',
            'What have you allocated for solving this problem?',
            'Is this something that\'s budgeted for this quarter?'
          ],
          tips: [
            'Frame it as helping them',
            'Give a range if they hesitate',
            'Tie to ROI, not just cost'
          ]
        }
      },

      {
        id: 'qualify_timeline',
        priority: 2,
        trigger: (context) => {
          return context.buyingSignals?.length > 0 &&
                 !context.timelineDiscussed &&
                 context.currentStage >= 2;
        },
        action: {
          title: 'Understand Their Timeline',
          icon: '📅',
          urgency: 'high',
          reasoning: 'Interest detected but no timeline set',
          suggestedPhrases: [
            'When are you looking to have this implemented?',
            'What\'s driving the timeline on your end?',
            'Are there any deadlines we should be aware of?'
          ],
          tips: [
            'Understand the "why" behind the timeline',
            'Create urgency if needed',
            'Align your process with theirs'
          ]
        }
      },

      {
        id: 'identify_decision_makers',
        priority: 2,
        trigger: (context) => {
          return !context.decisionMakersIdentified &&
                 context.currentStage >= 2 &&
                 context.engagementLevel > 60;
        },
        action: {
          title: 'Identify All Decision Makers',
          icon: '👥',
          urgency: 'high',
          reasoning: 'Good engagement but don\'t know who makes the decision',
          suggestedPhrases: [
            'Who else will be involved in making this decision?',
            'Walk me through your decision-making process...',
            'Besides yourself, who needs to sign off on this?'
          ],
          tips: [
            'Find the economic buyer',
            'Understand the approval process',
            'Get multi-threading going'
          ]
        }
      },

      // MEDIUM PRIORITY ACTIONS (Priority: 3)
      {
        id: 'discovery_questions',
        priority: 3,
        trigger: (context) => {
          return (context.questionsAsked || 0) < 10 &&
                 context.currentStage === 1 &&
                 context.meetingDuration > 300; // 5 minutes in
        },
        action: {
          title: 'Ask More Discovery Questions',
          icon: '🔍',
          urgency: 'medium',
          reasoning: 'Not enough discovery - only asked ${context.questionsAsked} questions',
          suggestedPhrases: [
            'Tell me more about your current process...',
            'What\'s the biggest challenge you\'re facing with this?',
            'How are you handling this today?',
            'What would the ideal solution look like?'
          ],
          tips: [
            'Use the SPIN framework',
            'Listen for pain points',
            'Dig deeper with "why"'
          ]
        }
      },

      {
        id: 'show_roi',
        priority: 3,
        trigger: (context) => {
          return context.priceShock === true;
        },
        action: {
          title: 'Show ROI & Value',
          icon: '📊',
          urgency: 'high',
          reasoning: 'Client expressed pricing concerns',
          suggestedPhrases: [
            'Let me show you how this pays for itself...',
            'Our customers typically see 3x ROI in the first 6 months',
            'What\'s the cost of NOT solving this problem?'
          ],
          tips: [
            'Quantify the pain',
            'Show payback period',
            'Use customer examples'
          ]
        }
      },

      {
        id: 'schedule_next_meeting',
        priority: 3,
        trigger: (context) => {
          return context.meetingDuration > 1800 && // 30 minutes
                 !context.nextMeetingScheduled &&
                 context.dealConfidence > 50;
        },
        action: {
          title: 'Schedule Next Meeting Now',
          icon: '🎯',
          urgency: 'medium',
          reasoning: 'Good meeting but no next steps defined',
          suggestedPhrases: [
            'Let\'s get our next conversation on the calendar...',
            'How does next Tuesday at 2pm look for a deeper dive?',
            'Before we wrap up, when can we reconnect?'
          ],
          tips: [
            'Do it before the call ends',
            'Send calendar invite immediately',
            'Define the agenda for next call'
          ]
        }
      },

      {
        id: 'handle_competitor',
        priority: 2,
        trigger: (context) => {
          return context.competitorMentioned === true;
        },
        action: {
          title: 'Address Competitor Comparison',
          icon: '⚔️',
          urgency: 'high',
          reasoning: 'Client mentioned a competitor',
          suggestedPhrases: [
            'That\'s a solid option. What specifically appeals to you about them?',
            'Many of our customers evaluated them too. Here\'s what made them choose us...',
            'How does their approach compare to what you need?'
          ],
          tips: [
            'Don\'t badmouth competitors',
            'Focus on differentiation',
            'Use trap questions'
          ]
        }
      },

      {
        id: 'create_urgency',
        priority: 3,
        trigger: (context) => {
          return context.currentStage >= 4 && // In closing
                 !context.urgencyCreated &&
                 context.dealConfidence > 60;
        },
        action: {
          title: 'Create Urgency to Close',
          icon: '⏰',
          urgency: 'medium',
          reasoning: 'Deal is progressing but lacks urgency',
          suggestedPhrases: [
            'What would prevent us from moving forward this week?',
            'We have a promotion ending Friday that I\'d hate for you to miss...',
            'Based on your timeline, when should we kick this off?'
          ],
          tips: [
            'Use scarcity (deadline, limited spots)',
            'Tie to their timeline',
            'Make it easy to say yes'
          ]
        }
      },

      {
        id: 'trial_close',
        priority: 3,
        trigger: (context) => {
          return context.currentStage >= 3 &&
                 context.buyingSignals?.length >= 3 &&
                 context.objections?.filter(o => !o.resolved).length === 0;
        },
        action: {
          title: 'Try a Trial Close',
          icon: '🤝',
          urgency: 'medium',
          reasoning: 'Multiple buying signals, no objections - time to close',
          suggestedPhrases: [
            'Based on everything we discussed, does this make sense for you?',
            'Are you ready to move forward with this?',
            'What questions do you still have before we proceed?'
          ],
          tips: [
            'Use assumptive language',
            'Watch for non-verbal cues',
            'Be comfortable with silence'
          ]
        }
      }
    ];
  }

  /**
   * Calculate next best action based on current context
   */
  calculateNextAction(context) {
    // Evaluate all rules
    const triggeredActions = this.actionRules
      .filter(rule => rule.trigger(context))
      .map(rule => ({
        ...rule.action,
        id: rule.id,
        priority: rule.priority,
        confidence: this.calculateConfidence(rule, context)
      }))
      .sort((a, b) => {
        // Sort by priority first, then confidence
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        return b.confidence - a.confidence;
      });

    // Return top action
    return triggeredActions[0] || null;
  }

  /**
   * Calculate confidence in this recommendation
   */
  calculateConfidence(rule, context) {
    let confidence = 70; // Base confidence

    // Increase confidence based on context strength
    if (rule.id === 'ask_budget' && context.buyingSignals?.length > 2) {
      confidence += 20;
    }

    if (rule.id === 'address_objection_now') {
      confidence = 95; // Always high confidence for objections
    }

    if (rule.id === 'stop_talking' && context.talkRatio?.salesperson > 80) {
      confidence = 90;
    }

    return Math.min(100, confidence);
  }

  /**
   * Update and display spotlight
   */
  update(context) {
    const nextAction = this.calculateNextAction(context);

    // Don't show same action repeatedly
    if (nextAction && nextAction.id === this.currentAction?.id) {
      return;
    }

    this.currentAction = nextAction;

    if (nextAction) {
      this.show(nextAction);
      this.logAction(nextAction);
    } else {
      this.hide();
    }
  }

  /**
   * Show spotlight
   */
  show(action) {
    if (!this.container) {
      this.createContainer();
    }

    this.container.className = `sc-spotlight sc-spotlight-${action.urgency}`;
    this.container.innerHTML = `
      <div class="sc-spotlight-header">
        <div class="sc-spotlight-icon">${action.icon}</div>
        <div class="sc-spotlight-title-section">
          <div class="sc-spotlight-label">🎯 NEXT BEST ACTION</div>
          <div class="sc-spotlight-title">${action.title}</div>
        </div>
        <div class="sc-spotlight-confidence">${action.confidence}%</div>
      </div>

      <div class="sc-spotlight-reasoning">
        <strong>WHY:</strong> ${action.reasoning}
      </div>

      <div class="sc-spotlight-phrases">
        <div class="sc-spotlight-section-title">💬 Say This:</div>
        ${action.suggestedPhrases.map((phrase, i) => `
          <div class="sc-spotlight-phrase" onclick="nextBestAction.copyPhrase('${phrase.replace(/'/g, "\\'")}')">
            <span class="sc-phrase-number">${i + 1}</span>
            <span class="sc-phrase-text">"${phrase}"</span>
            <span class="sc-phrase-copy">📋</span>
          </div>
        `).join('')}
      </div>

      <div class="sc-spotlight-tips">
        <div class="sc-spotlight-section-title">💡 Tips:</div>
        ${action.tips.map(tip => `
          <div class="sc-spotlight-tip">• ${tip}</div>
        `).join('')}
      </div>

      <div class="sc-spotlight-actions">
        <button class="sc-spotlight-btn sc-spotlight-done" onclick="nextBestAction.markDone()">
          ✓ Done
        </button>
        <button class="sc-spotlight-btn sc-spotlight-skip" onclick="nextBestAction.skip()">
          Skip
        </button>
        <button class="sc-spotlight-btn sc-spotlight-more" onclick="nextBestAction.showMore()">
          More Info
        </button>
      </div>
    `;

    this.container.style.display = 'block';
    this.playNotificationSound();
  }

  /**
   * Hide spotlight
   */
  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  /**
   * Copy phrase to clipboard
   */
  copyPhrase(phrase) {
    navigator.clipboard.writeText(phrase);
    this.showCopyNotification();
  }

  /**
   * Show copy notification
   */
  showCopyNotification() {
    const notification = document.createElement('div');
    notification.className = 'sc-copy-notification';
    notification.textContent = '✓ Copied to clipboard!';
    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 2000);
  }

  /**
   * Mark action as done
   */
  markDone() {
    if (this.currentAction) {
      this.actionHistory.push({
        ...this.currentAction,
        completedAt: Date.now(),
        status: 'completed'
      });
    }
    this.hide();
  }

  /**
   * Skip action
   */
  skip() {
    if (this.currentAction) {
      this.actionHistory.push({
        ...this.currentAction,
        skippedAt: Date.now(),
        status: 'skipped'
      });
    }
    this.hide();
  }

  /**
   * Show more info
   */
  showMore() {
    // Could expand to show battle cards, customer stories, etc
    alert('More detailed guidance would appear here in full implementation');
  }

  /**
   * Log action for analytics
   */
  logAction(action) {
    console.log(`🎯 Next Best Action: ${action.title}`);
  }

  /**
   * Play subtle notification sound
   */
  playNotificationSound() {
    // Simple beep using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      // Silently fail if audio not supported
    }
  }

  /**
   * Create container
   */
  createContainer() {
    this.container = document.createElement('div');
    this.container.id = 'sc-next-best-action';
    this.container.className = 'sc-spotlight';
    document.body.appendChild(this.container);
    this.injectStyles();
  }

  /**
   * Inject styles
   */
  injectStyles() {
    const styleId = 'sc-spotlight-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .sc-spotlight {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 500px;
        max-width: 90vw;
        background: rgba(15, 23, 42, 0.98);
        backdrop-filter: blur(30px);
        border-radius: 20px;
        padding: 24px;
        box-shadow:
          0 0 0 4px rgba(139, 92, 246, 0.3),
          0 20px 60px rgba(0, 0, 0, 0.6),
          0 0 120px rgba(139, 92, 246, 0.4);
        z-index: 1000003;
        animation: spotlightAppear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        font-family: 'Inter', sans-serif;
      }

      .sc-spotlight-urgent {
        border: 3px solid #ef4444;
        box-shadow:
          0 0 0 4px rgba(239, 68, 68, 0.3),
          0 20px 60px rgba(0, 0, 0, 0.6),
          0 0 120px rgba(239, 68, 68, 0.5);
      }

      .sc-spotlight-high {
        border: 3px solid #f59e0b;
        box-shadow:
          0 0 0 4px rgba(245, 158, 11, 0.3),
          0 20px 60px rgba(0, 0, 0, 0.6),
          0 0 120px rgba(245, 158, 11, 0.4);
      }

      @keyframes spotlightAppear {
        0% {
          transform: translate(-50%, -50%) scale(0.8);
          opacity: 0;
        }
        100% {
          transform: translate(-50%, -50%) scale(1);
          opacity: 1;
        }
      }

      .sc-spotlight-header {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        margin-bottom: 20px;
      }

      .sc-spotlight-icon {
        font-size: 48px;
        flex-shrink: 0;
      }

      .sc-spotlight-title-section {
        flex: 1;
      }

      .sc-spotlight-label {
        font-size: 11px;
        color: #8b5cf6;
        font-weight: 700;
        letter-spacing: 1px;
        margin-bottom: 6px;
      }

      .sc-spotlight-title {
        font-size: 20px;
        font-weight: 700;
        color: #f1f5f9;
        line-height: 1.3;
      }

      .sc-spotlight-confidence {
        font-size: 24px;
        font-weight: 700;
        color: #8b5cf6;
        background: rgba(139, 92, 246, 0.15);
        padding: 8px 12px;
        border-radius: 8px;
      }

      .sc-spotlight-reasoning {
        background: rgba(139, 92, 246, 0.1);
        border-left: 3px solid #8b5cf6;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        color: #e2e8f0;
        margin-bottom: 20px;
        line-height: 1.6;
      }

      .sc-spotlight-reasoning strong {
        color: #8b5cf6;
      }

      .sc-spotlight-section-title {
        font-size: 13px;
        font-weight: 600;
        color: #cbd5e1;
        margin-bottom: 12px;
      }

      .sc-spotlight-phrases {
        margin-bottom: 20px;
      }

      .sc-spotlight-phrase {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        padding: 14px;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .sc-spotlight-phrase:hover {
        background: rgba(139, 92, 246, 0.15);
        border-color: #8b5cf6;
        transform: translateX(4px);
      }

      .sc-phrase-number {
        width: 24px;
        height: 24px;
        background: rgba(139, 92, 246, 0.3);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
        color: #c4b5fd;
        flex-shrink: 0;
      }

      .sc-phrase-text {
        flex: 1;
        font-size: 14px;
        color: #e2e8f0;
        line-height: 1.5;
      }

      .sc-phrase-copy {
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .sc-spotlight-phrase:hover .sc-phrase-copy {
        opacity: 1;
      }

      .sc-spotlight-tips {
        background: rgba(251, 191, 36, 0.08);
        border-radius: 10px;
        padding: 14px;
        margin-bottom: 20px;
      }

      .sc-spotlight-tip {
        font-size: 13px;
        color: #fde68a;
        line-height: 1.6;
        margin: 6px 0;
      }

      .sc-spotlight-actions {
        display: flex;
        gap: 10px;
      }

      .sc-spotlight-btn {
        flex: 1;
        padding: 12px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        border: none;
      }

      .sc-spotlight-done {
        background: rgba(16, 185, 129, 0.3);
        color: #6ee7b7;
        border: 2px solid #10b981;
      }

      .sc-spotlight-done:hover {
        background: rgba(16, 185, 129, 0.4);
        transform: scale(1.05);
      }

      .sc-spotlight-skip {
        background: rgba(255, 255, 255, 0.05);
        color: #cbd5e1;
        border: 2px solid rgba(255, 255, 255, 0.1);
      }

      .sc-spotlight-skip:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .sc-spotlight-more {
        background: rgba(139, 92, 246, 0.2);
        color: #c4b5fd;
        border: 2px solid rgba(139, 92, 246, 0.3);
      }

      .sc-spotlight-more:hover {
        background: rgba(139, 92, 246, 0.3);
      }

      .sc-copy-notification {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(16, 185, 129, 0.95);
        color: white;
        padding: 12px 24px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        z-index: 1000004;
        animation: slideDown 0.3s ease;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Get analytics
   */
  getAnalytics() {
    return {
      totalActions: this.actionHistory.length,
      completed: this.actionHistory.filter(a => a.status === 'completed').length,
      skipped: this.actionHistory.filter(a => a.status === 'skipped').length,
      completionRate: this.actionHistory.length > 0
        ? (this.actionHistory.filter(a => a.status === 'completed').length / this.actionHistory.length) * 100
        : 0
    };
  }
}

// Global access
window.nextBestAction = null;
