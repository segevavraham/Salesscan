/**
 * Advanced Meeting Intelligence
 * Includes Confidence Calculator and Performance Scorecard
 */

/**
 * Confidence Calculator
 * Calculates real-time deal confidence score
 */
export class ConfidenceCalculator {
  constructor() {
    this.container = null;
    this.score = 50; // Start at 50%
    this.factors = [];
    this.history = [];
  }

  /**
   * Calculate confidence score based on meeting data
   */
  calculate(meetingData) {
    let score = 50; // Baseline
    this.factors = [];

    // POSITIVE SIGNALS

    // 1. Buying Signals (+5 each, max +25)
    const buyingSignals = meetingData.buyingSignals || [];
    const buyingSignalBonus = Math.min(buyingSignals.length * 5, 25);
    score += buyingSignalBonus;
    if (buyingSignalBonus > 0) {
      this.factors.push({
        type: 'positive',
        name: 'Buying Signals',
        value: buyingSignalBonus,
        description: `${buyingSignals.length} buying signals detected`
      });
    }

    // 2. Questions Asked by Client (+2 each, max +20)
    const clientQuestions = (meetingData.clientQuestions || []).length;
    const questionBonus = Math.min(clientQuestions * 2, 20);
    score += questionBonus;
    if (questionBonus > 0) {
      this.factors.push({
        type: 'positive',
        name: 'Client Engagement',
        value: questionBonus,
        description: `${clientQuestions} questions asked`
      });
    }

    // 3. Positive Sentiment (+10 to +30)
    const positiveSentiment = meetingData.positiveSentiment || 0;
    const sentimentBonus = Math.floor(positiveSentiment * 30);
    score += sentimentBonus;
    if (sentimentBonus > 0) {
      this.factors.push({
        type: 'positive',
        name: 'Positive Sentiment',
        value: sentimentBonus,
        description: `${Math.floor(positiveSentiment * 100)}% positive sentiment`
      });
    }

    // 4. Good Talk Ratio (Client 60-70% talks = +15)
    const clientTalkRatio = meetingData.talkRatio?.client || 50;
    if (clientTalkRatio >= 60 && clientTalkRatio <= 70) {
      score += 15;
      this.factors.push({
        type: 'positive',
        name: 'Optimal Talk Ratio',
        value: 15,
        description: `Client talking ${clientTalkRatio}% (optimal: 60-70%)`
      });
    } else if (clientTalkRatio >= 50 && clientTalkRatio <= 80) {
      score += 8;
      this.factors.push({
        type: 'neutral',
        name: 'Good Talk Ratio',
        value: 8,
        description: `Client talking ${clientTalkRatio}%`
      });
    }

    // 5. Budget Discussed (+10)
    if (meetingData.budgetDiscussed) {
      score += 10;
      this.factors.push({
        type: 'positive',
        name: 'Budget Discussed',
        value: 10,
        description: 'Budget conversation happened'
      });
    }

    // 6. Decision Timeline Set (+10)
    if (meetingData.timelineSet) {
      score += 10;
      this.factors.push({
        type: 'positive',
        name: 'Timeline Set',
        value: 10,
        description: 'Decision timeline established'
      });
    }

    // 7. Next Meeting Scheduled (+15)
    if (meetingData.nextMeetingScheduled) {
      score += 15;
      this.factors.push({
        type: 'positive',
        name: 'Next Meeting Scheduled',
        value: 15,
        description: 'Follow-up meeting confirmed'
      });
    }

    // NEGATIVE SIGNALS

    // 8. Unresolved Objections (-10 each, max -30)
    const unresolvedObjections = (meetingData.objections || []).filter(o => !o.resolved).length;
    const objectionPenalty = Math.min(unresolvedObjections * 10, 30);
    score -= objectionPenalty;
    if (objectionPenalty > 0) {
      this.factors.push({
        type: 'negative',
        name: 'Unresolved Objections',
        value: -objectionPenalty,
        description: `${unresolvedObjections} objections not addressed`
      });
    }

    // 9. Negative Sentiment (-15 to -45)
    const negativeSentiment = meetingData.negativeSentiment || 0;
    const negSentPenalty = Math.floor(negativeSentiment * 45);
    score -= negSentPenalty;
    if (negSentPenalty > 0) {
      this.factors.push({
        type: 'negative',
        name: 'Negative Sentiment',
        value: -negSentPenalty,
        description: `${Math.floor(negativeSentiment * 100)}% negative sentiment`
      });
    }

    // 10. Too Much Salesperson Talking (-15)
    if (clientTalkRatio < 40) {
      score -= 15;
      this.factors.push({
        type: 'negative',
        name: 'Talking Too Much',
        value: -15,
        description: `Client only talking ${clientTalkRatio}% (should be 60-70%)`
      });
    }

    // 11. Long Silences (-20)
    const silenceDuration = meetingData.totalSilenceDuration || 0;
    if (silenceDuration > 30) {
      score -= 20;
      this.factors.push({
        type: 'negative',
        name: 'Uncomfortable Silences',
        value: -20,
        description: `${silenceDuration}s of awkward silence`
      });
    }

    // 12. Competitor Mentioned (-10)
    if (meetingData.competitorMentioned) {
      score -= 10;
      this.factors.push({
        type: 'negative',
        name: 'Competitor Mentioned',
        value: -10,
        description: 'Evaluating competitors'
      });
    }

    // 13. Price Shock (-15)
    if (meetingData.priceShock) {
      score -= 15;
      this.factors.push({
        type: 'negative',
        name: 'Price Concern',
        value: -15,
        description: 'Client expressed pricing concerns'
      });
    }

    // Normalize to 0-100
    score = Math.max(0, Math.min(100, score));

    // Store score
    this.score = score;
    this.history.push({
      timestamp: Date.now(),
      score,
      factors: [...this.factors]
    });

    return {
      score,
      status: this.getStatus(score),
      factors: this.factors,
      recommendation: this.getRecommendation(score, this.factors)
    };
  }

  /**
   * Get status based on score
   */
  getStatus(score) {
    if (score >= 80) {
      return {
        level: 'excellent',
        emoji: '🟢',
        text: 'Strong Signal',
        color: '#10b981',
        message: 'This deal is looking great! Keep the momentum going.'
      };
    } else if (score >= 60) {
      return {
        level: 'good',
        emoji: '🟡',
        text: 'Good Progress',
        color: '#fbbf24',
        message: 'You\'re on track. Address any concerns and move forward.'
      };
    } else if (score >= 40) {
      return {
        level: 'needs-attention',
        emoji: '🟠',
        text: 'Needs Attention',
        color: '#f59e0b',
        message: 'This deal needs work. Focus on addressing objections.'
      };
    } else {
      return {
        level: 'at-risk',
        emoji: '🔴',
        text: 'At Risk',
        color: '#ef4444',
        message: 'This deal is at risk. Consider changing your approach.'
      };
    }
  }

  /**
   * Get recommendation
   */
  getRecommendation(score, factors) {
    const recommendations = [];

    // Based on factors
    const hasObjections = factors.some(f => f.name === 'Unresolved Objections');
    const talkingTooMuch = factors.some(f => f.name === 'Talking Too Much');
    const noPriceShock = negativeFactors.some(f => f.name === 'Price Concern');
    const noNextMeeting = !factors.some(f => f.name === 'Next Meeting Scheduled');

    if (hasObjections) {
      recommendations.push('Address all objections before moving forward');
    }

    if (talkingTooMuch) {
      recommendations.push('Ask more questions and listen actively');
    }

    if (hasPriceShock) {
      recommendations.push('Focus on value, not price. Show ROI.');
    }

    if (noNextMeeting && score >= 50) {
      recommendations.push('Schedule a follow-up meeting before ending the call');
    }

    if (score < 40) {
      recommendations.push('Re-discover their needs. You may have lost the thread.');
    }

    return recommendations.length > 0 ? recommendations : ['Keep doing what you\'re doing!'];
  }

  /**
   * Render confidence UI
   */
  render() {
    if (!this.container) {
      this.createContainer();
    }

    const result = this.calculate(window.currentMeetingData || {});
    const { score, status, factors } = result;

    this.container.innerHTML = `
      <div class="sc-confidence-header">
        <div class="sc-confidence-title">Deal Confidence</div>
        <div class="sc-confidence-score-large">${Math.floor(score)}%</div>
      </div>

      <div class="sc-confidence-bar-container">
        <div class="sc-confidence-bar">
          <div class="sc-confidence-fill" style="width: ${score}%; background: ${status.color}"></div>
        </div>
        <div class="sc-confidence-ticks">
          <div class="sc-tick" style="left: 0%">0</div>
          <div class="sc-tick" style="left: 25%">25</div>
          <div class="sc-tick" style="left: 50%">50</div>
          <div class="sc-tick" style="left: 75%">75</div>
          <div class="sc-tick" style="left: 100%">100</div>
        </div>
      </div>

      <div class="sc-confidence-status">
        <span class="sc-confidence-emoji">${status.emoji}</span>
        <span class="sc-confidence-status-text">${status.text}</span>
      </div>

      <div class="sc-confidence-message">${status.message}</div>

      <div class="sc-confidence-factors">
        <div class="sc-factors-title">Contributing Factors:</div>
        ${factors.slice(0, 5).map(factor => `
          <div class="sc-factor sc-factor-${factor.type}">
            <div class="sc-factor-header">
              <span class="sc-factor-name">${factor.name}</span>
              <span class="sc-factor-value ${factor.value > 0 ? 'positive' : 'negative'}">
                ${factor.value > 0 ? '+' : ''}${factor.value}
              </span>
            </div>
            <div class="sc-factor-desc">${factor.description}</div>
          </div>
        `).join('')}
        ${factors.length > 5 ? `
          <div class="sc-factor-more">+${factors.length - 5} more factors</div>
        ` : ''}
      </div>

      <div class="sc-confidence-recommendations">
        <div class="sc-rec-title">💡 Recommendations:</div>
        ${result.recommendation.map(rec => `
          <div class="sc-rec-item">• ${rec}</div>
        `).join('')}
      </div>
    `;
  }

  createContainer() {
    this.container = document.createElement('div');
    this.container.id = 'sc-confidence-calculator';
    this.container.className = 'sc-confidence-calculator';
    document.body.appendChild(this.container);
    this.injectStyles();
  }

  injectStyles() {
    const styleId = 'sc-confidence-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .sc-confidence-calculator {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 340px;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(20px);
        border-radius: 16px;
        padding: 20px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        z-index: 999996;
        border: 1px solid rgba(139, 92, 246, 0.3);
        font-family: 'Inter', sans-serif;
      }

      .sc-confidence-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .sc-confidence-title {
        font-size: 16px;
        font-weight: 600;
        color: #f1f5f9;
      }

      .sc-confidence-score-large {
        font-size: 32px;
        font-weight: 700;
        color: #8b5cf6;
        font-variant-numeric: tabular-nums;
      }

      .sc-confidence-bar-container {
        margin-bottom: 12px;
      }

      .sc-confidence-bar {
        height: 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        overflow: hidden;
        position: relative;
      }

      .sc-confidence-fill {
        height: 100%;
        transition: width 0.5s ease, background 0.3s ease;
        border-radius: 6px;
        box-shadow: 0 0 20px currentColor;
      }

      .sc-confidence-ticks {
        display: flex;
        justify-content: space-between;
        margin-top: 4px;
        position: relative;
      }

      .sc-tick {
        font-size: 10px;
        color: #64748b;
        position: absolute;
        transform: translateX(-50%);
      }

      .sc-confidence-status {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }

      .sc-confidence-emoji {
        font-size: 24px;
      }

      .sc-confidence-status-text {
        font-size: 16px;
        font-weight: 600;
        color: #f1f5f9;
      }

      .sc-confidence-message {
        font-size: 13px;
        color: #cbd5e1;
        line-height: 1.5;
        margin-bottom: 16px;
        padding: 12px;
        background: rgba(139, 92, 246, 0.1);
        border-radius: 8px;
      }

      .sc-confidence-factors {
        margin-bottom: 16px;
      }

      .sc-factors-title {
        font-size: 12px;
        color: #94a3b8;
        margin-bottom: 8px;
        font-weight: 500;
      }

      .sc-factor {
        background: rgba(255, 255, 255, 0.03);
        border-radius: 6px;
        padding: 8px 10px;
        margin-bottom: 6px;
        border-left: 3px solid transparent;
      }

      .sc-factor-positive {
        border-left-color: #10b981;
      }

      .sc-factor-negative {
        border-left-color: #ef4444;
      }

      .sc-factor-neutral {
        border-left-color: #fbbf24;
      }

      .sc-factor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
      }

      .sc-factor-name {
        font-size: 12px;
        font-weight: 500;
        color: #e2e8f0;
      }

      .sc-factor-value {
        font-size: 11px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 4px;
      }

      .sc-factor-value.positive {
        background: rgba(16, 185, 129, 0.2);
        color: #6ee7b7;
      }

      .sc-factor-value.negative {
        background: rgba(239, 68, 68, 0.2);
        color: #fca5a5;
      }

      .sc-factor-desc {
        font-size: 11px;
        color: #94a3b8;
      }

      .sc-factor-more {
        font-size: 11px;
        color: #64748b;
        text-align: center;
        padding: 6px;
        cursor: pointer;
      }

      .sc-factor-more:hover {
        color: #8b5cf6;
      }

      .sc-confidence-recommendations {
        background: rgba(251, 191, 36, 0.1);
        border-radius: 8px;
        padding: 12px;
      }

      .sc-rec-title {
        font-size: 12px;
        color: #fbbf24;
        font-weight: 500;
        margin-bottom: 8px;
      }

      .sc-rec-item {
        font-size: 11px;
        color: #fde68a;
        line-height: 1.5;
        margin: 4px 0;
      }
    `;

    document.head.appendChild(style);
  }
}


/**
 * Performance Scorecard
 * Scores meeting performance across multiple dimensions
 */
export class PerformanceScorecard {
  constructor() {
    this.scores = {};
  }

  /**
   * Calculate all performance scores
   */
  calculate(meetingData) {
    this.scores = {
      talkRatio: this.scoreTalkRatio(meetingData.talkRatio?.client || 50),
      discovery: this.scoreDiscovery(meetingData.questionsAsked || 0, meetingData.keyAreasCovered || []),
      objectionHandling: this.scoreObjectionHandling(meetingData.objections || []),
      nextSteps: this.scoreNextSteps(meetingData),
      sentiment: this.scoreSentiment(meetingData.positiveSentiment || 0.5),
      pacing: this.scorePacing(meetingData),
      overall: 0
    };

    // Calculate overall score (weighted average)
    this.scores.overall = this.calculateOverallScore(this.scores);

    return this.scores;
  }

  scoreTalkRatio(clientPercent) {
    if (clientPercent >= 60 && clientPercent <= 70) return { score: 100, feedback: 'Perfect!' };
    if (clientPercent >= 50 && clientPercent <= 80) return { score: 80, feedback: 'Good' };
    if (clientPercent >= 40 && clientPercent <= 90) return { score: 60, feedback: 'Needs work' };
    return { score: 40, feedback: 'Talk less, listen more' };
  }

  scoreDiscovery(questions, keyAreasCovered) {
    let score = 0;
    let feedback = '';

    if (questions >= 15) {
      score += 50;
      feedback = 'Excellent discovery';
    } else if (questions >= 10) {
      score += 40;
      feedback = 'Good discovery';
    } else if (questions >= 5) {
      score += 25;
      feedback = 'Needs more questions';
    } else {
      score += 10;
      feedback = 'Very limited discovery';
    }

    score += (keyAreasCovered.length / 7) * 50;

    return { score: Math.min(100, score), feedback, details: `${questions} questions asked` };
  }

  scoreObjectionHandling(objections) {
    if (objections.length === 0) {
      return { score: 100, feedback: 'No objections raised' };
    }

    const resolved = objections.filter(o => o.resolved).length;
    const avgResponseTime = objections.reduce((sum, o) => sum + (o.responseTime || 30), 0) / objections.length;

    let score = (resolved / objections.length) * 70;

    if (avgResponseTime < 15) score += 30;
    else if (avgResponseTime < 30) score += 20;
    else score += 10;

    return {
      score: Math.min(100, score),
      feedback: `${resolved}/${objections.length} objections resolved`,
      details: `Avg response: ${Math.floor(avgResponseTime)}s`
    };
  }

  scoreNextSteps(meetingData) {
    let score = 0;

    if (meetingData.nextMeetingScheduled) score += 50;
    if (meetingData.actionItemsDefined) score += 30;
    if (meetingData.clearTimeline) score += 20;

    return {
      score,
      feedback: score >= 80 ? 'Clear next steps' : 'Define clearer next steps'
    };
  }

  scoreSentiment(positiveSentiment) {
    const score = Math.floor(positiveSentiment * 100);
    return {
      score,
      feedback: score >= 75 ? 'Very positive' : score >= 50 ? 'Mostly positive' : 'Needs improvement'
    };
  }

  scorePacing(meetingData) {
    // Placeholder - would analyze talk speed, pauses, etc
    return { score: 76, feedback: 'Good energy' };
  }

  calculateOverallScore(scores) {
    const weights = {
      talkRatio: 0.20,
      discovery: 0.25,
      objectionHandling: 0.25,
      nextSteps: 0.15,
      sentiment: 0.10,
      pacing: 0.05
    };

    return Math.floor(
      Object.keys(weights).reduce((total, key) =>
        total + ((scores[key]?.score || 0) * weights[key]), 0
      )
    );
  }

  /**
   * Generate report
   */
  generateReport() {
    return {
      overall: this.scores.overall,
      breakdown: this.scores,
      grade: this.getGrade(this.scores.overall),
      strengths: this.identifyStrengths(),
      improvements: this.identifyImprovements()
    };
  }

  getGrade(score) {
    if (score >= 90) return { letter: 'A+', emoji: '🌟' };
    if (score >= 85) return { letter: 'A', emoji: '⭐' };
    if (score >= 80) return { letter: 'A-', emoji: '👍' };
    if (score >= 75) return { letter: 'B+', emoji: '👌' };
    if (score >= 70) return { letter: 'B', emoji: '✅' };
    return { letter: 'C', emoji: '📚' };
  }

  identifyStrengths() {
    return Object.keys(this.scores)
      .filter(key => key !== 'overall' && this.scores[key].score >= 80)
      .map(key => ({ area: key, score: this.scores[key].score }));
  }

  identifyImprovements() {
    return Object.keys(this.scores)
      .filter(key => key !== 'overall' && this.scores[key].score < 70)
      .map(key => ({ area: key, score: this.scores[key].score, feedback: this.scores[key].feedback }));
  }
}
