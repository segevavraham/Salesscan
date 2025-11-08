/**
 * Action Items Detector
 * Automatically detects and tracks action items from meeting transcripts
 * Uses NLP patterns to identify commitments and tasks
 */

export class ActionItemsDetector {
  constructor() {
    this.items = [];
    this.patterns = this.definePatterns();
    this.container = null;
  }

  /**
   * Define detection patterns
   */
  definePatterns() {
    return [
      // Pattern: "I'll [action]"
      {
        regex: /I'?ll\s+(send|share|prepare|schedule|create|provide|get you|forward|email|call|follow up on)\s+(.+?)(?:\.|,|$)/gi,
        speaker: 'salesperson',
        priority: 'high',
        extract: (match) => ({
          action: match[1],
          details: match[2].trim()
        })
      },

      // Pattern: "I will [action]"
      {
        regex: /I\s+will\s+(send|share|prepare|schedule|create|provide|get you|forward|email)\s+(.+?)(?:\.|,|$)/gi,
        speaker: 'salesperson',
        priority: 'high',
        extract: (match) => ({
          action: match[1],
          details: match[2].trim()
        })
      },

      // Pattern: "Let me [action]"
      {
        regex: /Let\s+me\s+(send|share|prepare|schedule|create|provide|get you|check)\s+(.+?)(?:\.|,|$)/gi,
        speaker: 'salesperson',
        priority: 'high',
        extract: (match) => ({
          action: match[1],
          details: match[2].trim()
        })
      },

      // Pattern: "We'll [action]"
      {
        regex: /We'?ll\s+(need to|have to|should)\s+(.+?)(?:\.|,|$)/gi,
        speaker: 'both',
        priority: 'medium',
        extract: (match) => ({
          action: 'discuss',
          details: match[2].trim()
        })
      },

      // Pattern: "Can you [action]"
      {
        regex: /Can\s+you\s+(send|share|provide|prepare)\s+(.+?)(?:\.|,|\?|$)/gi,
        speaker: 'client',
        priority: 'high',
        extract: (match) => ({
          action: match[1],
          details: match[2].trim()
        })
      },

      // Pattern: "Could you [action]"
      {
        regex: /Could\s+you\s+(send|share|provide|prepare)\s+(.+?)(?:\.|,|\?|$)/gi,
        speaker: 'client',
        priority: 'high',
        extract: (match) => ({
          action: match[1],
          details: match[2].trim()
        })
      },

      // Pattern: "Please [action]"
      {
        regex: /Please\s+(send|share|provide|prepare|schedule)\s+(.+?)(?:\.|,|$)/gi,
        speaker: 'client',
        priority: 'high',
        extract: (match) => ({
          action: match[1],
          details: match[2].trim()
        })
      },

      // Pattern: "We need to [action]"
      {
        regex: /We\s+need\s+to\s+(.+?)(?:\.|,|$)/gi,
        speaker: 'both',
        priority: 'medium',
        extract: (match) => ({
          action: 'complete',
          details: match[1].trim()
        })
      },

      // Pattern: "Action item: [action]"
      {
        regex: /Action\s+item[:\s]+(.+?)(?:\.|,|$)/gi,
        speaker: 'both',
        priority: 'high',
        extract: (match) => ({
          action: 'complete',
          details: match[1].trim()
        })
      },

      // Pattern: "Next step is to [action]"
      {
        regex: /Next\s+step\s+(?:is\s+to|:|)\s*(.+?)(?:\.|,|$)/gi,
        speaker: 'both',
        priority: 'high',
        extract: (match) => ({
          action: 'complete',
          details: match[1].trim()
        })
      }
    ];
  }

  /**
   * Process transcript line and detect action items
   */
  processTranscript(transcript) {
    const text = transcript.text;
    const speaker = transcript.speaker;
    const timestamp = transcript.timestamp;

    const detectedItems = [];

    this.patterns.forEach(pattern => {
      let match;
      const regex = new RegExp(pattern.regex);

      while ((match = regex.exec(text)) !== null) {
        const extracted = pattern.extract(match);

        // Create action item
        const item = {
          id: this.generateId(),
          text: this.cleanText(extracted.details),
          action: extracted.action,
          speaker: speaker,
          assignedTo: this.determineAssignee(pattern.speaker, speaker),
          priority: this.calculatePriority(pattern.priority, extracted.details),
          dueDate: this.extractDueDate(text),
          timestamp,
          matchedText: match[0],
          completed: false,
          source: 'auto-detected'
        };

        // Avoid duplicates
        if (!this.isDuplicate(item)) {
          detectedItems.push(item);
          this.items.push(item);
        }
      }
    });

    if (detectedItems.length > 0) {
      console.log(`✅ Detected ${detectedItems.length} action items`);
      this.render();
      this.notifyNewItems(detectedItems);
    }

    return detectedItems;
  }

  /**
   * Clean extracted text
   */
  cleanText(text) {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[,\.;]+$/, '')
      .trim();
  }

  /**
   * Determine who should complete the action
   */
  determineAssignee(patternSpeaker, actualSpeaker) {
    if (patternSpeaker === 'salesperson') return 'salesperson';
    if (patternSpeaker === 'client') return 'client';

    // For 'both', assign based on who said it
    if (actualSpeaker === 'salesperson') return 'client';
    if (actualSpeaker === 'client') return 'salesperson';

    return 'both';
  }

  /**
   * Calculate priority
   */
  calculatePriority(basePriority, details) {
    const urgentKeywords = ['urgent', 'asap', 'today', 'immediately', 'now'];
    const importantKeywords = ['important', 'critical', 'essential', 'must'];

    const lowerDetails = details.toLowerCase();

    if (urgentKeywords.some(kw => lowerDetails.includes(kw))) {
      return 'urgent';
    }

    if (importantKeywords.some(kw => lowerDetails.includes(kw))) {
      return 'high';
    }

    return basePriority;
  }

  /**
   * Extract due date from text
   */
  extractDueDate(text) {
    const today = new Date();

    // "by tomorrow" / "tomorrow"
    if (/tomorrow/i.test(text)) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }

    // "by end of week" / "this week"
    if (/(?:by\s+)?(?:end\s+of\s+)?(?:this\s+)?week/i.test(text)) {
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + (5 - today.getDay()));
      return endOfWeek.toISOString().split('T')[0];
    }

    // "today"
    if (/today/i.test(text)) {
      return today.toISOString().split('T')[0];
    }

    // "by Friday" / "on Monday" etc
    const dayMatch = text.match(/(?:by|on)\s+(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i);
    if (dayMatch) {
      const targetDay = dayMatch[1];
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const targetIndex = daysOfWeek.indexOf(targetDay);
      const currentIndex = today.getDay();

      let daysUntil = targetIndex - currentIndex;
      if (daysUntil <= 0) daysUntil += 7;

      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + daysUntil);
      return targetDate.toISOString().split('T')[0];
    }

    // Default: 1 week from now
    const oneWeek = new Date(today);
    oneWeek.setDate(today.getDate() + 7);
    return oneWeek.toISOString().split('T')[0];
  }

  /**
   * Check if item is duplicate
   */
  isDuplicate(newItem) {
    return this.items.some(item =>
      item.text.toLowerCase() === newItem.text.toLowerCase() &&
      item.assignedTo === newItem.assignedTo
    );
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return 'action-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get all action items
   */
  getItems(filters = {}) {
    let filtered = [...this.items];

    if (filters.assignedTo) {
      filtered = filtered.filter(item => item.assignedTo === filters.assignedTo);
    }

    if (filters.priority) {
      filtered = filtered.filter(item => item.priority === filters.priority);
    }

    if (filters.completed !== undefined) {
      filtered = filtered.filter(item => item.completed === filters.completed);
    }

    return filtered.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Toggle completion
   */
  toggleComplete(itemId) {
    const item = this.items.find(i => i.id === itemId);
    if (item) {
      item.completed = !item.completed;
      this.render();
      this.saveToStorage();
    }
  }

  /**
   * Delete item
   */
  deleteItem(itemId) {
    this.items = this.items.filter(i => i.id !== itemId);
    this.render();
    this.saveToStorage();
  }

  /**
   * Add manual item
   */
  addManualItem(text, assignedTo = 'salesperson', priority = 'medium') {
    const item = {
      id: this.generateId(),
      text,
      action: 'complete',
      speaker: null,
      assignedTo,
      priority,
      dueDate: this.extractDueDate('one week'),
      timestamp: Date.now(),
      completed: false,
      source: 'manual'
    };

    this.items.push(item);
    this.render();
    this.saveToStorage();
  }

  /**
   * Save to storage
   */
  async saveToStorage() {
    try {
      await chrome.storage.local.set({
        actionItems: this.items
      });
    } catch (error) {
      console.error('Failed to save action items:', error);
    }
  }

  /**
   * Load from storage
   */
  async loadFromStorage() {
    try {
      const { actionItems } = await chrome.storage.local.get('actionItems');
      if (actionItems) {
        this.items = actionItems;
        this.render();
      }
    } catch (error) {
      console.error('Failed to load action items:', error);
    }
  }

  /**
   * Notify new items detected
   */
  notifyNewItems(items) {
    const notification = document.createElement('div');
    notification.className = 'sc-action-notification';
    notification.innerHTML = `
      <div class="sc-action-notif-icon">✅</div>
      <div class="sc-action-notif-text">
        ${items.length} action item${items.length > 1 ? 's' : ''} detected!
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  /**
   * Render action items UI
   */
  render() {
    if (!this.container) {
      this.createContainer();
    }

    const yourItems = this.getItems({ assignedTo: 'salesperson', completed: false });
    const clientItems = this.getItems({ assignedTo: 'client', completed: false });
    const completed = this.getItems({ completed: true });

    this.container.innerHTML = `
      <div class="sc-actions-header">
        <div class="sc-actions-title">Action Items</div>
        <button class="sc-actions-add-btn" onclick="actionItemsDetector.showAddDialog()">+ Add</button>
      </div>

      <div class="sc-actions-stats">
        <div class="sc-stat">
          <div class="sc-stat-value">${yourItems.length}</div>
          <div class="sc-stat-label">Your Tasks</div>
        </div>
        <div class="sc-stat">
          <div class="sc-stat-value">${clientItems.length}</div>
          <div class="sc-stat-label">Client Tasks</div>
        </div>
      </div>

      <div class="sc-actions-section">
        <div class="sc-section-title">🎯 Your Tasks</div>
        ${yourItems.length > 0 ? `
          ${yourItems.map(item => this.renderItem(item)).join('')}
        ` : '<div class="sc-empty">No tasks yet</div>'}
      </div>

      <div class="sc-actions-section">
        <div class="sc-section-title">👤 Client Tasks</div>
        ${clientItems.length > 0 ? `
          ${clientItems.map(item => this.renderItem(item)).join('')}
        ` : '<div class="sc-empty">No client tasks</div>'}
      </div>

      ${completed.length > 0 ? `
        <div class="sc-actions-section">
          <div class="sc-section-title">✅ Completed (${completed.length})</div>
          ${completed.slice(0, 3).map(item => this.renderItem(item)).join('')}
        </div>
      ` : ''}

      <div class="sc-actions-footer">
        <button class="sc-actions-export-btn" onclick="actionItemsDetector.exportItems()">
          Export to Calendar
        </button>
      </div>
    `;
  }

  /**
   * Render single item
   */
  renderItem(item) {
    const priorityColors = {
      urgent: '#ef4444',
      high: '#f59e0b',
      medium: '#fbbf24',
      low: '#94a3b8'
    };

    return `
      <div class="sc-action-item ${item.completed ? 'completed' : ''}" data-priority="${item.priority}">
        <input type="checkbox"
               class="sc-action-checkbox"
               ${item.completed ? 'checked' : ''}
               onchange="actionItemsDetector.toggleComplete('${item.id}')">

        <div class="sc-action-content">
          <div class="sc-action-text">${item.text}</div>
          <div class="sc-action-meta">
            <span class="sc-action-priority" style="color: ${priorityColors[item.priority]}">
              ${item.priority}
            </span>
            <span class="sc-action-due">Due: ${this.formatDate(item.dueDate)}</span>
          </div>
        </div>

        <button class="sc-action-delete" onclick="actionItemsDetector.deleteItem('${item.id}')">
          ×
        </button>
      </div>
    `;
  }

  /**
   * Format date
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  /**
   * Show add dialog (simplified)
   */
  showAddDialog() {
    const text = prompt('Enter action item:');
    if (text) {
      this.addManualItem(text);
    }
  }

  /**
   * Export items
   */
  async exportItems() {
    const items = this.getItems({ completed: false });

    // Create ICS file format
    let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Sales Coach AI//Action Items//EN\n';

    items.forEach(item => {
      icsContent += 'BEGIN:VTODO\n';
      icsContent += `SUMMARY:${item.text}\n`;
      icsContent += `DUE:${item.dueDate.replace(/-/g, '')}T170000Z\n`;
      icsContent += `PRIORITY:${item.priority === 'urgent' ? '1' : item.priority === 'high' ? '3' : '5'}\n`;
      icsContent += `STATUS:NEEDS-ACTION\n`;
      icsContent += 'END:VTODO\n';
    });

    icsContent += 'END:VCALENDAR';

    // Download
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'action-items.ics';
    a.click();
  }

  /**
   * Create container
   */
  createContainer() {
    this.container = document.createElement('div');
    this.container.id = 'sc-action-items';
    this.container.className = 'sc-action-items';
    document.body.appendChild(this.container);
    this.injectStyles();
  }

  /**
   * Inject styles
   */
  injectStyles() {
    const styleId = 'sc-action-items-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .sc-action-items {
        position: fixed;
        top: 500px;
        right: 20px;
        width: 340px;
        max-height: 600px;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(20px);
        border-radius: 16px;
        padding: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        z-index: 999995;
        border: 1px solid rgba(139, 92, 246, 0.3);
        font-family: 'Inter', sans-serif;
        overflow-y: auto;
      }

      .sc-actions-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .sc-actions-title {
        font-size: 16px;
        font-weight: 600;
        color: #f1f5f9;
      }

      .sc-actions-add-btn {
        padding: 6px 12px;
        background: rgba(139, 92, 246, 0.3);
        border: 1px solid #8b5cf6;
        border-radius: 6px;
        color: #fff;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .sc-actions-add-btn:hover {
        background: rgba(139, 92, 246, 0.4);
      }

      .sc-actions-stats {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;
      }

      .sc-stat {
        flex: 1;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 8px;
        padding: 12px;
        text-align: center;
      }

      .sc-stat-value {
        font-size: 24px;
        font-weight: 700;
        color: #8b5cf6;
      }

      .sc-stat-label {
        font-size: 11px;
        color: #94a3b8;
        margin-top: 4px;
      }

      .sc-actions-section {
        margin-bottom: 16px;
      }

      .sc-section-title {
        font-size: 13px;
        font-weight: 600;
        color: #cbd5e1;
        margin-bottom: 8px;
      }

      .sc-action-item {
        background: rgba(255, 255, 255, 0.03);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 8px;
        display: flex;
        align-items: flex-start;
        gap: 10px;
        transition: all 0.2s ease;
        border-left: 3px solid transparent;
      }

      .sc-action-item[data-priority="urgent"] {
        border-left-color: #ef4444;
      }

      .sc-action-item[data-priority="high"] {
        border-left-color: #f59e0b;
      }

      .sc-action-item:hover {
        background: rgba(255, 255, 255, 0.05);
      }

      .sc-action-item.completed {
        opacity: 0.5;
      }

      .sc-action-item.completed .sc-action-text {
        text-decoration: line-through;
      }

      .sc-action-checkbox {
        width: 18px;
        height: 18px;
        cursor: pointer;
        flex-shrink: 0;
        margin-top: 2px;
      }

      .sc-action-content {
        flex: 1;
      }

      .sc-action-text {
        font-size: 13px;
        color: #e2e8f0;
        line-height: 1.5;
        margin-bottom: 6px;
      }

      .sc-action-meta {
        display: flex;
        gap: 12px;
        font-size: 11px;
      }

      .sc-action-priority {
        font-weight: 600;
        text-transform: uppercase;
      }

      .sc-action-due {
        color: #94a3b8;
      }

      .sc-action-delete {
        width: 24px;
        height: 24px;
        border: none;
        background: rgba(239, 68, 68, 0.2);
        color: #fca5a5;
        border-radius: 4px;
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
        flex-shrink: 0;
        opacity: 0;
        transition: all 0.2s ease;
      }

      .sc-action-item:hover .sc-action-delete {
        opacity: 1;
      }

      .sc-action-delete:hover {
        background: rgba(239, 68, 68, 0.3);
      }

      .sc-empty {
        text-align: center;
        padding: 20px;
        color: #64748b;
        font-size: 13px;
      }

      .sc-actions-footer {
        padding-top: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .sc-actions-export-btn {
        width: 100%;
        padding: 10px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        color: #cbd5e1;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .sc-actions-export-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
      }

      .sc-action-notification {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(16, 185, 129, 0.95);
        backdrop-filter: blur(20px);
        border-radius: 12px;
        padding: 12px 20px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        z-index: 1000002;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideUp 0.3s ease;
      }

      .sc-action-notif-icon {
        font-size: 20px;
      }

      .sc-action-notif-text {
        font-size: 14px;
        color: #fff;
        font-weight: 500;
      }

      @keyframes slideUp {
        from {
          transform: translateX(-50%) translateY(20px);
          opacity: 0;
        }
        to {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
      }
    `;

    document.head.appendChild(style);
  }
}

// Global access
window.actionItemsDetector = null;
