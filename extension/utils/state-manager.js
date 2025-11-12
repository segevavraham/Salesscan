/**
 * Advanced State Management System
 * Centralized state with reactive updates and persistence
 */

export class StateManager {
  constructor() {
    this.state = {
      // Session state
      session: {
        isActive: false,
        startTime: null,
        duration: 0,
        platform: null
      },

      // Conversation state
      conversation: {
        buffer: [],
        totalMessages: 0,
        speakerMap: new Map(),
        currentTopic: null
      },

      // AI state
      ai: {
        isProcessing: false,
        lastSuggestion: null,
        totalSuggestions: 0,
        avgConfidence: 0
      },

      // Analytics
      analytics: {
        sentimentHistory: [],
        buyingSignals: [],
        objections: [],
        keyMoments: [],
        talkRatio: { salesperson: 0, client: 0 }
      },

      // Configuration
      config: {
        assemblyAIKey: null,
        openAIKey: null,
        language: 'he',
        autoSuggest: true,
        streamingMode: true
      },

      // UI state
      ui: {
        panelVisible: true,
        panelMinimized: false,
        suggestionVisible: false,
        dashboardOpen: false
      }
    };

    // Subscribers for reactive updates
    this.subscribers = new Map();

    // Persistence
    this.persistKeys = ['config', 'analytics'];
    this.loadFromStorage();
  }

  /**
   * Get state value
   */
  get(path) {
    return this.getNestedValue(this.state, path);
  }

  /**
   * Set state value and notify subscribers
   */
  set(path, value) {
    this.setNestedValue(this.state, path, value);
    this.notify(path, value);

    // Persist if needed
    const rootKey = path.split('.')[0];
    if (this.persistKeys.includes(rootKey)) {
      this.saveToStorage(rootKey);
    }
  }

  /**
   * Update multiple state values at once
   */
  update(updates) {
    for (const [path, value] of Object.entries(updates)) {
      this.set(path, value);
    }
  }

  /**
   * Subscribe to state changes
   */
  subscribe(path, callback) {
    if (!this.subscribers.has(path)) {
      this.subscribers.set(path, new Set());
    }

    this.subscribers.get(path).add(callback);

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(path);
      if (subs) {
        subs.delete(callback);
      }
    };
  }

  /**
   * Notify subscribers of state change
   */
  notify(path, value) {
    // Notify exact path subscribers
    const subscribers = this.subscribers.get(path);
    if (subscribers) {
      subscribers.forEach(callback => callback(value, path));
    }

    // Notify parent path subscribers (e.g., 'session' when 'session.isActive' changes)
    const parts = path.split('.');
    for (let i = parts.length - 1; i > 0; i--) {
      const parentPath = parts.slice(0, i).join('.');
      const parentSubs = this.subscribers.get(parentPath);
      if (parentSubs) {
        const parentValue = this.get(parentPath);
        parentSubs.forEach(callback => callback(parentValue, parentPath));
      }
    }
  }

  /**
   * Get nested value from object
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Set nested value in object
   */
  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);

    target[lastKey] = value;
  }

  /**
   * Start a new session
   */
  startSession(platform = 'unknown') {
    this.update({
      'session.isActive': true,
      'session.startTime': Date.now(),
      'session.platform': platform,
      'conversation.buffer': [],
      'conversation.totalMessages': 0,
      'ai.totalSuggestions': 0
    });
  }

  /**
   * End current session
   */
  endSession() {
    const sessionData = {
      duration: Date.now() - this.get('session.startTime'),
      totalMessages: this.get('conversation.totalMessages'),
      totalSuggestions: this.get('ai.totalSuggestions'),
      analytics: this.get('analytics')
    };

    // Save session to history
    this.saveSessionHistory(sessionData);

    // Reset session state
    this.update({
      'session.isActive': false,
      'session.startTime': null,
      'session.duration': 0,
      'conversation.buffer': [],
      'ai.isProcessing': false
    });
  }

  /**
   * Add message to conversation
   */
  addMessage(message) {
    const buffer = this.get('conversation.buffer');
    buffer.push(message);

    // Trim buffer if too large
    if (buffer.length > 20) {
      buffer.shift();
    }

    this.update({
      'conversation.buffer': buffer,
      'conversation.totalMessages': this.get('conversation.totalMessages') + 1
    });

    // Update talk ratio
    this.updateTalkRatio(message.speaker, message.text.length);

    // Analyze sentiment
    if (message.sentiment) {
      this.addSentimentData(message.sentiment);
    }
  }

  /**
   * Update talk ratio analytics
   */
  updateTalkRatio(speaker, wordCount) {
    const talkRatio = this.get('analytics.talkRatio');
    talkRatio[speaker] = (talkRatio[speaker] || 0) + wordCount;
    this.set('analytics.talkRatio', talkRatio);
  }

  /**
   * Add sentiment data point
   */
  addSentimentData(sentiment) {
    const history = this.get('analytics.sentimentHistory');
    history.push({
      value: sentiment,
      timestamp: Date.now()
    });

    // Keep last 50 data points
    if (history.length > 50) {
      history.shift();
    }

    this.set('analytics.sentimentHistory', history);
  }

  /**
   * Record buying signal
   */
  recordBuyingSignal(signal) {
    const signals = this.get('analytics.buyingSignals');
    signals.push({
      type: signal,
      timestamp: Date.now(),
      context: this.get('conversation.buffer').slice(-3)
    });

    this.set('analytics.buyingSignals', signals);
  }

  /**
   * Record objection
   */
  recordObjection(objection) {
    const objections = this.get('analytics.objections');
    objections.push({
      type: objection,
      timestamp: Date.now(),
      context: this.get('conversation.buffer').slice(-3)
    });

    this.set('analytics.objections', objections);
  }

  /**
   * Record key moment
   */
  recordKeyMoment(moment) {
    const moments = this.get('analytics.keyMoments');
    moments.push({
      ...moment,
      timestamp: Date.now()
    });

    this.set('analytics.keyMoments', moments);
  }

  /**
   * Get conversation context for AI
   */
  getConversationContext(lastN = 10) {
    const buffer = this.get('conversation.buffer');
    return buffer.slice(-lastN).map(msg =>
      `${msg.speaker.toUpperCase()}: ${msg.text}`
    ).join('\n');
  }

  /**
   * Get analytics summary
   */
  getAnalyticsSummary() {
    const analytics = this.get('analytics');
    const session = this.get('session');
    const conversation = this.get('conversation');

    return {
      session: {
        duration: Date.now() - session.startTime,
        platform: session.platform,
        totalMessages: conversation.totalMessages
      },
      sentiment: this.calculateAverageSentiment(),
      talkRatio: this.calculateTalkRatioPercentage(),
      buyingSignals: analytics.buyingSignals.length,
      objections: analytics.objections.length,
      keyMoments: analytics.keyMoments.length,
      suggestions: this.get('ai.totalSuggestions')
    };
  }

  /**
   * Calculate average sentiment
   */
  calculateAverageSentiment() {
    const history = this.get('analytics.sentimentHistory');
    if (history.length === 0) return 0;

    const sentimentMap = { positive: 1, neutral: 0, negative: -1 };
    const sum = history.reduce((acc, item) => {
      return acc + (sentimentMap[item.value] || 0);
    }, 0);

    return sum / history.length;
  }

  /**
   * Calculate talk ratio percentage
   */
  calculateTalkRatioPercentage() {
    const ratio = this.get('analytics.talkRatio');
    const total = ratio.salesperson + ratio.client;

    if (total === 0) return { salesperson: 0, client: 0 };

    return {
      salesperson: Math.round((ratio.salesperson / total) * 100),
      client: Math.round((ratio.client / total) * 100)
    };
  }

  /**
   * Save to Chrome storage
   */
  async saveToStorage(key) {
    try {
      const data = { [key]: this.state[key] };
      await chrome.storage.local.set(data);
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  /**
   * Load from Chrome storage
   */
  async loadFromStorage() {
    try {
      const result = await chrome.storage.local.get(this.persistKeys);

      for (const key of this.persistKeys) {
        if (result[key]) {
          this.state[key] = result[key];
        }
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  }

  /**
   * Save session history
   */
  async saveSessionHistory(sessionData) {
    try {
      const result = await chrome.storage.local.get('sessionHistory');
      const history = result.sessionHistory || [];

      history.push({
        ...sessionData,
        timestamp: Date.now()
      });

      // Keep last 50 sessions
      if (history.length > 50) {
        history.shift();
      }

      await chrome.storage.local.set({ sessionHistory: history });
    } catch (error) {
      console.error('Error saving session history:', error);
    }
  }

  /**
   * Get session history
   */
  async getSessionHistory() {
    try {
      const result = await chrome.storage.local.get('sessionHistory');
      return result.sessionHistory || [];
    } catch (error) {
      console.error('Error getting session history:', error);
      return [];
    }
  }

  /**
   * Clear all data
   */
  async clearAll() {
    this.state = {
      session: { isActive: false, startTime: null, duration: 0, platform: null },
      conversation: { buffer: [], totalMessages: 0, speakerMap: new Map(), currentTopic: null },
      ai: { isProcessing: false, lastSuggestion: null, totalSuggestions: 0, avgConfidence: 0 },
      analytics: { sentimentHistory: [], buyingSignals: [], objections: [], keyMoments: [], talkRatio: { salesperson: 0, client: 0 } },
      config: { assemblyAIKey: null, openAIKey: null, language: 'he', autoSuggest: true, streamingMode: true },
      ui: { panelVisible: true, panelMinimized: false, suggestionVisible: false, dashboardOpen: false }
    };

    await chrome.storage.local.clear();
    this.notify('*', this.state);
  }

  /**
   * Export state for debugging
   */
  export() {
    return JSON.parse(JSON.stringify(this.state));
  }

  /**
   * Import state for debugging
   */
  import(data) {
    this.state = data;
    this.notify('*', this.state);
  }
}

// Create singleton instance
export const stateManager = new StateManager();
