/**
 * Meeting Summary Generator
 * Creates comprehensive AI-generated meeting summaries
 * Includes: key takeaways, action items, recommendations, follow-up templates
 */

export class MeetingSummaryGenerator {
  constructor(openAIService) {
    this.openAI = openAIService;
    this.summaryCache = new Map();
  }

  /**
   * Generate complete meeting summary
   */
  async generateSummary(meetingData) {
    console.log('📝 Generating meeting summary...');

    const summary = {
      metadata: this.generateMetadata(meetingData),
      quickStats: this.generateQuickStats(meetingData),
      keyTakeaways: await this.generateKeyTakeaways(meetingData),
      whatWentWell: this.analyzeStrengths(meetingData),
      areasForImprovement: this.analyzeWeaknesses(meetingData),
      actionItems: this.extractActionItems(meetingData),
      aiRecommendations: await this.generateRecommendations(meetingData),
      sentimentJourney: this.createSentimentJourney(meetingData),
      keyMoments: this.identifyKeyMoments(meetingData),
      followUpEmail: await this.generateFollowUpEmail(meetingData),
      nextSteps: this.defineNextSteps(meetingData)
    };

    // Cache summary
    this.summaryCache.set(meetingData.id, summary);

    console.log('✅ Summary generated');
    return summary;
  }

  /**
   * Generate metadata
   */
  generateMetadata(meetingData) {
    return {
      title: meetingData.title || 'Sales Meeting',
      date: new Date(meetingData.startTime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: new Date(meetingData.startTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      duration: this.formatDuration(meetingData.duration),
      attendees: meetingData.attendees || ['Client'],
      platform: meetingData.platform || 'Unknown'
    };
  }

  /**
   * Generate quick stats
   */
  generateQuickStats(meetingData) {
    return {
      dealConfidence: meetingData.dealConfidence || 0,
      performanceScore: meetingData.performanceScore || 0,
      nextMeeting: meetingData.nextMeetingScheduled ? 'Scheduled' : 'Not scheduled',
      talkRatio: `You: ${meetingData.talkRatio?.salesperson || 50}% | Client: ${meetingData.talkRatio?.client || 50}%`,
      questionsAsked: meetingData.questionsAsked || 0,
      buyingSignals: meetingData.buyingSignals?.length || 0,
      objections: meetingData.objections?.length || 0
    };
  }

  /**
   * Generate AI-powered key takeaways
   */
  async generateKeyTakeaways(meetingData) {
    const prompt = `
Based on this sales meeting transcript and data, identify the 3-5 most important takeaways:

Meeting Context:
- Duration: ${meetingData.duration} seconds
- Talk Ratio: Salesperson ${meetingData.talkRatio?.salesperson}%, Client ${meetingData.talkRatio?.client}%
- Buying Signals: ${meetingData.buyingSignals?.length || 0}
- Objections: ${meetingData.objections?.length || 0}

Key Transcript Moments:
${this.getKeyTranscriptMoments(meetingData)}

Provide 3-5 bullet points covering:
1. Main pain points identified
2. Budget & timeline (if discussed)
3. Decision makers
4. Competitive landscape
5. Client's biggest concerns

Format as bullet points only, no extra text.
`;

    try {
      const response = await this.openAI.generateCompletion(prompt, {
        maxTokens: 300,
        temperature: 0.7
      });

      // Parse response into array
      return response.split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
        .map(line => line.replace(/^[-•]\s*/, '').trim())
        .filter(line => line.length > 0);

    } catch (error) {
      console.error('Error generating takeaways:', error);
      return this.generateFallbackTakeaways(meetingData);
    }
  }

  /**
   * Get key moments from transcript
   */
  getKeyTranscriptMoments(meetingData) {
    if (!meetingData.transcript || meetingData.transcript.length === 0) {
      return 'No transcript available';
    }

    // Get important moments (buying signals, objections, questions)
    const importantMoments = [
      ...meetingData.buyingSignals?.map(s => `[${s.timestamp}] Buying Signal: "${s.text}"`) || [],
      ...meetingData.objections?.map(o => `[${o.timestamp}] Objection: "${o.text}"`) || [],
      ...meetingData.questions?.slice(0, 5).map(q => `[${q.timestamp}] Question: "${q.text}"`) || []
    ];

    return importantMoments.slice(0, 10).join('\n');
  }

  /**
   * Fallback takeaways (if AI fails)
   */
  generateFallbackTakeaways(meetingData) {
    const takeaways = [];

    if (meetingData.buyingSignals?.length > 0) {
      takeaways.push(`Client showed ${meetingData.buyingSignals.length} buying signals - strong interest detected`);
    }

    if (meetingData.objections?.length > 0) {
      const unresolved = meetingData.objections.filter(o => !o.resolved);
      if (unresolved.length > 0) {
        takeaways.push(`${unresolved.length} objections need follow-up`);
      }
    }

    if (meetingData.budgetDiscussed) {
      takeaways.push('Budget was discussed - qualified opportunity');
    }

    if (!meetingData.nextMeetingScheduled) {
      takeaways.push('Next meeting not scheduled - follow up needed');
    }

    return takeaways;
  }

  /**
   * Analyze strengths
   */
  analyzeStrengths(meetingData) {
    const strengths = [];

    // Talk ratio
    if (meetingData.talkRatio?.client >= 60 && meetingData.talkRatio?.client <= 70) {
      strengths.push({
        area: 'Talk Ratio',
        description: `Excellent listening - client spoke ${meetingData.talkRatio.client}% of the time`,
        icon: '🎤'
      });
    }

    // Discovery
    if (meetingData.questionsAsked >= 10) {
      strengths.push({
        area: 'Discovery Quality',
        description: `Strong discovery with ${meetingData.questionsAsked} questions asked`,
        icon: '🔍'
      });
    }

    // Objection handling
    const resolvedObjections = meetingData.objections?.filter(o => o.resolved).length || 0;
    if (resolvedObjections > 0) {
      strengths.push({
        area: 'Objection Handling',
        description: `Successfully addressed ${resolvedObjections} objections`,
        icon: '⚠️'
      });
    }

    // Rapport building
    if ((meetingData.positiveSentiment || 0) > 0.7) {
      strengths.push({
        area: 'Client Rapport',
        description: `Built strong rapport (${Math.round(meetingData.positiveSentiment * 100)}% positive sentiment)`,
        icon: '😊'
      });
    }

    // Next steps
    if (meetingData.nextMeetingScheduled) {
      strengths.push({
        area: 'Next Steps',
        description: 'Secured follow-up meeting - maintained momentum',
        icon: '🎯'
      });
    }

    return strengths;
  }

  /**
   * Analyze weaknesses
   */
  analyzeWeaknesses(meetingData) {
    const improvements = [];

    // Talk ratio
    if (meetingData.talkRatio?.salesperson > 70) {
      improvements.push({
        area: 'Talk Ratio',
        issue: `Talked too much (${meetingData.talkRatio.salesperson}% of the time)`,
        suggestion: 'Ask more questions and listen actively. Aim for 30-40% talk time.',
        priority: 'high',
        icon: '🎤'
      });
    }

    // Discovery
    if (meetingData.questionsAsked < 8) {
      improvements.push({
        area: 'Discovery',
        issue: `Limited discovery (only ${meetingData.questionsAsked} questions asked)`,
        suggestion: 'Ask at least 12-15 discovery questions to uncover pain points.',
        priority: 'high',
        icon: '🔍'
      });
    }

    // Unresolved objections
    const unresolved = meetingData.objections?.filter(o => !o.resolved) || [];
    if (unresolved.length > 0) {
      improvements.push({
        area: 'Objection Handling',
        issue: `${unresolved.length} objections not addressed`,
        suggestion: 'Follow up on: ' + unresolved.map(o => `"${o.text}"`).join(', '),
        priority: 'urgent',
        icon: '⚠️'
      });
    }

    // No next meeting
    if (!meetingData.nextMeetingScheduled && meetingData.dealConfidence > 40) {
      improvements.push({
        area: 'Next Steps',
        issue: 'No follow-up meeting scheduled',
        suggestion: 'Always schedule next meeting before ending the call.',
        priority: 'high',
        icon: '📅'
      });
    }

    // Presentation pacing
    if (meetingData.currentStage === 4 && meetingData.meetingDuration < 1200) {
      improvements.push({
        area: 'Pacing',
        issue: 'Rushed through presentation',
        suggestion: 'Spend more time on demo and value proposition.',
        priority: 'medium',
        icon: '⏱️'
      });
    }

    return improvements;
  }

  /**
   * Extract action items
   */
  extractActionItems(meetingData) {
    const items = meetingData.actionItems || [];

    return {
      yourTasks: items.filter(i => i.assignedTo === 'salesperson' && !i.completed),
      clientTasks: items.filter(i => i.assignedTo === 'client' && !i.completed),
      completedTasks: items.filter(i => i.completed)
    };
  }

  /**
   * Generate AI recommendations
   */
  async generateRecommendations(meetingData) {
    const recommendations = {
      immediate: [],
      beforeNextMeeting: [],
      dealStrategy: []
    };

    // Immediate actions
    if (!meetingData.nextMeetingScheduled) {
      recommendations.immediate.push({
        action: 'Send calendar invite',
        description: 'Propose 2-3 time slots for next meeting within 24 hours',
        priority: 'urgent'
      });
    }

    const unresolved = meetingData.objections?.filter(o => !o.resolved) || [];
    if (unresolved.length > 0) {
      recommendations.immediate.push({
        action: 'Address objections in follow-up email',
        description: `Send detailed responses to: ${unresolved.map(o => o.text).join(', ')}`,
        priority: 'urgent'
      });
    }

    // Before next meeting
    if (meetingData.competitorMentioned) {
      recommendations.beforeNextMeeting.push({
        action: 'Prepare competitive comparison',
        description: 'Create side-by-side comparison highlighting your strengths',
        priority: 'high'
      });
    }

    if (meetingData.questionsAsked < 10) {
      recommendations.beforeNextMeeting.push({
        action: 'Prepare deeper discovery questions',
        description: 'Research their industry and prepare targeted questions',
        priority: 'medium'
      });
    }

    // Deal strategy
    if (meetingData.dealConfidence > 60) {
      recommendations.dealStrategy.push({
        strategy: 'Focus on time-to-value',
        description: 'Emphasize quick wins and fast implementation',
        reasoning: 'High interest detected - speed to value will help close'
      });
    }

    if (meetingData.priceShock) {
      recommendations.dealStrategy.push({
        strategy: 'Lead with ROI',
        description: 'Prepare detailed ROI calculator with their numbers',
        reasoning: 'Price sensitivity detected - need to justify investment'
      });
    }

    return recommendations;
  }

  /**
   * Create sentiment journey visualization data
   */
  createSentimentJourney(meetingData) {
    if (!meetingData.sentimentHistory || meetingData.sentimentHistory.length === 0) {
      return null;
    }

    const timeline = meetingData.sentimentHistory.map((point, i) => ({
      time: this.formatTime(point.timestamp),
      sentiment: point.value,
      label: point.event || ''
    }));

    return {
      timeline,
      averageSentiment: meetingData.positiveSentiment || 0.5,
      trend: this.calculateSentimentTrend(meetingData.sentimentHistory)
    };
  }

  /**
   * Calculate sentiment trend
   */
  calculateSentimentTrend(history) {
    if (history.length < 2) return 'stable';

    const firstHalf = history.slice(0, Math.floor(history.length / 2));
    const secondHalf = history.slice(Math.floor(history.length / 2));

    const firstAvg = firstHalf.reduce((sum, p) => sum + p.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, p) => sum + p.value, 0) / secondHalf.length;

    if (secondAvg > firstAvg + 0.1) return 'improving';
    if (secondAvg < firstAvg - 0.1) return 'declining';
    return 'stable';
  }

  /**
   * Identify key moments
   */
  identifyKeyMoments(meetingData) {
    const moments = [];

    // Add buying signals
    meetingData.buyingSignals?.forEach(signal => {
      moments.push({
        time: this.formatTime(signal.timestamp),
        type: 'buying_signal',
        icon: '💡',
        description: signal.text,
        importance: 'high'
      });
    });

    // Add objections
    meetingData.objections?.forEach(objection => {
      moments.push({
        time: this.formatTime(objection.timestamp),
        type: 'objection',
        icon: '⚠️',
        description: objection.text,
        importance: objection.resolved ? 'medium' : 'high',
        resolved: objection.resolved
      });
    });

    // Add stage transitions
    meetingData.stageHistory?.forEach(stage => {
      moments.push({
        time: this.formatTime(stage.timestamp),
        type: 'stage_change',
        icon: '🗺️',
        description: `Entered ${stage.stageName} stage`,
        importance: 'low'
      });
    });

    return moments.sort((a, b) => a.time.localeCompare(b.time));
  }

  /**
   * Generate follow-up email template
   */
  async generateFollowUpEmail(meetingData) {
    const prompt = `
Write a professional follow-up email for this sales meeting:

Meeting Context:
- Client showed ${meetingData.buyingSignals?.length || 0} buying signals
- ${meetingData.objections?.length || 0} objections raised
- Next meeting: ${meetingData.nextMeetingScheduled ? 'Scheduled' : 'Not scheduled'}
- Deal confidence: ${meetingData.dealConfidence}%

Key Topics Discussed:
${this.getKeyTranscriptMoments(meetingData)}

Write a concise, friendly email that:
1. Thanks them for their time
2. Recaps main pain points discussed
3. Addresses any objections
4. Proposes clear next steps
5. Includes a soft call-to-action

Keep it under 200 words.
`;

    try {
      const email = await this.openAI.generateCompletion(prompt, {
        maxTokens: 400,
        temperature: 0.7
      });

      return {
        subject: this.generateEmailSubject(meetingData),
        body: email,
        timing: 'Within 24 hours',
        attachments: this.suggestAttachments(meetingData)
      };
    } catch (error) {
      console.error('Error generating email:', error);
      return this.generateFallbackEmail(meetingData);
    }
  }

  /**
   * Generate email subject
   */
  generateEmailSubject(meetingData) {
    const companyName = meetingData.companyName || 'our conversation';

    if (meetingData.nextMeetingScheduled) {
      return `Great connecting - Next steps for ${companyName}`;
    }

    if (meetingData.dealConfidence > 70) {
      return `Excited to work together - ${companyName}`;
    }

    return `Following up from our call - ${companyName}`;
  }

  /**
   * Suggest email attachments
   */
  suggestAttachments(meetingData) {
    const attachments = [];

    if (meetingData.priceShock) {
      attachments.push('ROI Calculator');
      attachments.push('Pricing Breakdown');
    }

    if (meetingData.competitorMentioned) {
      attachments.push('Competitive Comparison');
    }

    if (meetingData.buyingSignals?.length > 2) {
      attachments.push('Case Study');
      attachments.push('Product Demo Video');
    }

    return attachments;
  }

  /**
   * Fallback email template
   */
  generateFallbackEmail(meetingData) {
    return {
      subject: this.generateEmailSubject(meetingData),
      body: `Hi [Name],

Great connecting today! I was energized by our conversation about [main pain point].

As discussed, I'm following up with:
- [Key deliverable 1]
- [Key deliverable 2]

Next steps:
- [Action item 1]
- [Action item 2]

Looking forward to [next meeting/continuing the conversation]!

Best,
[Your Name]`,
      timing: 'Within 24 hours',
      attachments: this.suggestAttachments(meetingData)
    };
  }

  /**
   * Define next steps
   */
  defineNextSteps(meetingData) {
    const steps = [];

    // Timeline based on deal stage and confidence
    if (meetingData.nextMeetingScheduled) {
      steps.push({
        step: 'Technical Demo',
        timing: meetingData.nextMeetingDate,
        owner: 'Both',
        status: 'scheduled'
      });
    } else {
      steps.push({
        step: 'Schedule Follow-up',
        timing: 'Within 24 hours',
        owner: 'You',
        status: 'pending'
      });
    }

    if (meetingData.dealConfidence > 60) {
      steps.push({
        step: 'Proposal Delivery',
        timing: 'End of week',
        owner: 'You',
        status: 'pending'
      });

      steps.push({
        step: 'Decision',
        timing: 'End of month',
        owner: 'Client',
        status: 'pending'
      });
    }

    return steps;
  }

  /**
   * Format duration
   */
  formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Format timestamp
   */
  formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Render summary as HTML
   */
  renderSummaryHTML(summary) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Meeting Summary - ${summary.metadata.title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f8fafc;
      color: #1e293b;
    }
    h1 { color: #0f172a; border-bottom: 3px solid #8b5cf6; padding-bottom: 10px; }
    h2 { color: #475569; margin-top: 32px; }
    h3 { color: #64748b; }
    .metadata {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-bottom: 24px;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: #8b5cf6;
    }
    .stat-label {
      font-size: 14px;
      color: #64748b;
    }
    .section {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-bottom: 24px;
    }
    .takeaway {
      padding: 12px;
      background: #f1f5f9;
      border-left: 4px solid #8b5cf6;
      margin: 8px 0;
      border-radius: 4px;
    }
    .strength, .weakness {
      padding: 12px;
      margin: 8px 0;
      border-radius: 4px;
    }
    .strength {
      background: #f0fdf4;
      border-left: 4px solid #10b981;
    }
    .weakness {
      background: #fef2f2;
      border-left: 4px solid #ef4444;
    }
    .priority-urgent { color: #dc2626; font-weight: 600; }
    .priority-high { color: #ea580c; font-weight: 600; }
    .priority-medium { color: #ca8a04; }
    .email-template {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 20px;
      border-radius: 8px;
      font-family: monospace;
      white-space: pre-wrap;
    }
    .action-item {
      padding: 12px;
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      margin: 8px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <h1>📊 Meeting Summary</h1>

  <div class="metadata">
    <h2>${summary.metadata.title}</h2>
    <p><strong>Date:</strong> ${summary.metadata.date} at ${summary.metadata.time}</p>
    <p><strong>Duration:</strong> ${summary.metadata.duration}</p>
    <p><strong>Platform:</strong> ${summary.metadata.platform}</p>
  </div>

  <h2>🎯 Quick Stats</h2>
  <div class="stats">
    <div class="stat-card">
      <div class="stat-value">${summary.quickStats.dealConfidence}%</div>
      <div class="stat-label">Deal Confidence</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${summary.quickStats.performanceScore}/100</div>
      <div class="stat-label">Performance Score</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${summary.quickStats.buyingSignals}</div>
      <div class="stat-label">Buying Signals</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${summary.quickStats.questionsAsked}</div>
      <div class="stat-label">Questions Asked</div>
    </div>
  </div>

  <div class="section">
    <h2>📌 Key Takeaways</h2>
    ${summary.keyTakeaways.map(t => `<div class="takeaway">${t}</div>`).join('')}
  </div>

  <div class="section">
    <h2>✅ What Went Well</h2>
    ${summary.whatWentWell.map(s => `
      <div class="strength">
        <strong>${s.icon} ${s.area}</strong><br>
        ${s.description}
      </div>
    `).join('')}
  </div>

  <div class="section">
    <h2>⚠️ Areas for Improvement</h2>
    ${summary.areasForImprovement.map(w => `
      <div class="weakness">
        <strong>${w.icon} ${w.area}</strong>
        <span class="priority-${w.priority}">[${w.priority.toUpperCase()}]</span><br>
        <em>${w.issue}</em><br>
        💡 ${w.suggestion}
      </div>
    `).join('')}
  </div>

  <div class="section">
    <h2>✅ Action Items</h2>
    <h3>Your Tasks:</h3>
    ${summary.actionItems.yourTasks.map(a => `
      <div class="action-item">
        ☐ ${a.text}<br>
        <small>Due: ${a.dueDate} | Priority: ${a.priority}</small>
      </div>
    `).join('')}

    <h3>Client Tasks:</h3>
    ${summary.actionItems.clientTasks.map(a => `
      <div class="action-item">
        ☐ ${a.text}<br>
        <small>Due: ${a.dueDate}</small>
      </div>
    `).join('')}
  </div>

  <div class="section">
    <h2>💡 AI Recommendations</h2>

    <h3>Immediate Actions:</h3>
    ${summary.aiRecommendations.immediate.map(r => `
      <div class="action-item">
        <strong>${r.action}</strong><br>
        ${r.description}
      </div>
    `).join('')}

    <h3>Before Next Meeting:</h3>
    ${summary.aiRecommendations.beforeNextMeeting.map(r => `
      <div class="takeaway">
        <strong>${r.action}</strong><br>
        ${r.description}
      </div>
    `).join('')}
  </div>

  <div class="section">
    <h2>📧 Follow-up Email Template</h2>
    <p><strong>Subject:</strong> ${summary.followUpEmail.subject}</p>
    <p><strong>Send:</strong> ${summary.followUpEmail.timing}</p>
    <div class="email-template">${summary.followUpEmail.body}</div>

    ${summary.followUpEmail.attachments.length > 0 ? `
      <p><strong>Suggested Attachments:</strong></p>
      <ul>
        ${summary.followUpEmail.attachments.map(a => `<li>${a}</li>`).join('')}
      </ul>
    ` : ''}
  </div>

  <div class="section">
    <h2>🎯 Next Steps</h2>
    ${summary.nextSteps.map(step => `
      <div class="takeaway">
        <strong>${step.step}</strong><br>
        Timeline: ${step.timing} | Owner: ${step.owner}
      </div>
    `).join('')}
  </div>

  <hr style="margin: 40px 0; border: none; border-top: 2px solid #e2e8f0;">
  <p style="text-align: center; color: #64748b; font-size: 14px;">
    Generated by Sales Coach AI v2.2<br>
    ${new Date().toLocaleDateString()}
  </p>
</body>
</html>
    `;
  }

  /**
   * Export summary as PDF (would require additional library)
   */
  async exportAsPDF(summary) {
    // Would use jsPDF or similar
    console.log('PDF export would be implemented here');
  }

  /**
   * Export summary as JSON
   */
  exportAsJSON(summary) {
    const blob = new Blob([JSON.stringify(summary, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-summary-${Date.now()}.json`;
    a.click();
  }

  /**
   * Export summary as HTML file
   */
  exportAsHTML(summary) {
    const html = this.renderSummaryHTML(summary);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-summary-${Date.now()}.html`;
    a.click();
  }
}
