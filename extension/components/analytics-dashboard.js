/**
 * Real-time Analytics Dashboard
 * Professional dashboard with live metrics and insights
 */

import { stateManager } from '../utils/state-manager.js';

export class AnalyticsDashboard {
  constructor() {
    this.container = null;
    this.isVisible = false;
    this.charts = {};
    this.unsubscribers = [];
  }

  /**
   * Initialize dashboard
   */
  initialize() {
    this.inject Styles();
    this.createContainer();
    this.setupSubscriptions();
  }

  /**
   * Inject dashboard styles
   */
  injectStyles() {
    const styleId = 'sc-analytics-dashboard-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .sc-dashboard-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        z-index: 1000000;
        display: none;
        align-items: center;
        justify-content: center;
        font-family: 'Inter', sans-serif;
        animation: fadeIn 0.3s ease;
      }

      .sc-dashboard-overlay.visible {
        display: flex;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .sc-dashboard {
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        border-radius: 24px;
        width: 90%;
        max-width: 1200px;
        height: 85vh;
        max-height: 800px;
        box-shadow: 0 25px 100px rgba(0, 0, 0, 0.5);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        border: 1px solid rgba(139, 92, 246, 0.3);
      }

      .sc-dashboard-header {
        padding: 24px 32px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .sc-dashboard-title {
        font-size: 24px;
        font-weight: 700;
        color: #e2e8f0;
        margin: 0;
      }

      .sc-dashboard-subtitle {
        font-size: 14px;
        color: #94a3b8;
        margin: 4px 0 0 0;
      }

      .sc-dashboard-close {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #fca5a5;
        cursor: pointer;
        font-size: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .sc-dashboard-close:hover {
        background: rgba(239, 68, 68, 0.2);
        transform: rotate(90deg);
      }

      .sc-dashboard-content {
        flex: 1;
        overflow-y: auto;
        padding: 32px;
      }

      .sc-metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 32px;
      }

      .sc-metric-card {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 20px;
        position: relative;
        overflow: hidden;
      }

      .sc-metric-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, #8b5cf6, #6366f1);
      }

      .sc-metric-label {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #64748b;
        margin-bottom: 8px;
      }

      .sc-metric-value {
        font-size: 32px;
        font-weight: 700;
        color: #e2e8f0;
        display: flex;
        align-items: baseline;
        gap: 8px;
      }

      .sc-metric-unit {
        font-size: 16px;
        color: #94a3b8;
      }

      .sc-metric-trend {
        font-size: 13px;
        margin-top: 8px;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .sc-metric-trend.positive {
        color: #22c55e;
      }

      .sc-metric-trend.negative {
        color: #ef4444;
      }

      .sc-chart-section {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 24px;
      }

      .sc-chart-title {
        font-size: 16px;
        font-weight: 600;
        color: #e2e8f0;
        margin: 0 0 20px 0;
      }

      .sc-sentiment-chart {
        height: 200px;
        display: flex;
        align-items: flex-end;
        gap: 4px;
        padding: 10px 0;
      }

      .sc-sentiment-bar {
        flex: 1;
        background: linear-gradient(to top, rgba(139, 92, 246, 0.3), rgba(139, 92, 246, 0.6));
        border-radius: 4px 4px 0 0;
        position: relative;
        transition: all 0.3s;
      }

      .sc-sentiment-bar:hover {
        background: linear-gradient(to top, rgba(139, 92, 246, 0.5), rgba(139, 92, 246, 0.8));
      }

      .sc-talk-ratio {
        display: flex;
        gap: 12px;
        margin-top: 16px;
      }

      .sc-ratio-bar {
        height: 40px;
        border-radius: 20px;
        position: relative;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.05);
        flex: 1;
      }

      .sc-ratio-fill {
        height: 100%;
        display: flex;
        transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .sc-ratio-salesperson {
        background: linear-gradient(90deg, #8b5cf6, #6366f1);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: 600;
      }

      .sc-ratio-client {
        background: linear-gradient(90deg, #06b6d4, #0ea5e9);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: 600;
      }

      .sc-insights-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .sc-insight-item {
        background: rgba(139, 92, 246, 0.1);
        border: 1px solid rgba(139, 92, 246, 0.3);
        border-radius: 12px;
        padding: 16px;
        display: flex;
        gap: 12px;
        align-items: flex-start;
      }

      .sc-insight-icon {
        font-size: 24px;
        flex-shrink: 0;
      }

      .sc-insight-content {
        flex: 1;
      }

      .sc-insight-title {
        font-size: 14px;
        font-weight: 600;
        color: #e2e8f0;
        margin: 0 0 4px 0;
      }

      .sc-insight-description {
        font-size: 13px;
        color: #94a3b8;
        margin: 0;
        line-height: 1.5;
      }

      .sc-insight-time {
        font-size: 11px;
        color: #64748b;
        margin-top: 8px;
      }

      /* Scrollbar */
      .sc-dashboard-content::-webkit-scrollbar {
        width: 8px;
      }

      .sc-dashboard-content::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
      }

      .sc-dashboard-content::-webkit-scrollbar-thumb {
        background: rgba(139, 92, 246, 0.5);
        border-radius: 4px;
      }

      .sc-dashboard-content::-webkit-scrollbar-thumb:hover {
        background: rgba(139, 92, 246, 0.7);
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Create dashboard container
   */
  createContainer() {
    this.container = document.createElement('div');
    this.container.className = 'sc-dashboard-overlay';
    this.container.onclick = (e) => {
      if (e.target === this.container) {
        this.hide();
      }
    };

    this.container.innerHTML = `
      <div class="sc-dashboard">
        <div class="sc-dashboard-header">
          <div>
            <h2 class="sc-dashboard-title">📊 Real-time Analytics</h2>
            <p class="sc-dashboard-subtitle">Live insights from your sales conversation</p>
          </div>
          <button class="sc-dashboard-close" id="sc-dashboard-close">×</button>
        </div>

        <div class="sc-dashboard-content">
          <!-- Metrics Grid -->
          <div class="sc-metrics-grid" id="sc-metrics-grid"></div>

          <!-- Sentiment Chart -->
          <div class="sc-chart-section">
            <h3 class="sc-chart-title">Sentiment Over Time</h3>
            <div class="sc-sentiment-chart" id="sc-sentiment-chart"></div>
          </div>

          <!-- Talk Ratio -->
          <div class="sc-chart-section">
            <h3 class="sc-chart-title">Talk Ratio</h3>
            <div class="sc-talk-ratio" id="sc-talk-ratio"></div>
          </div>

          <!-- Key Insights -->
          <div class="sc-chart-section">
            <h3 class="sc-chart-title">Key Moments & Insights</h3>
            <div class="sc-insights-list" id="sc-insights-list"></div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);

    // Event listeners
    document.getElementById('sc-dashboard-close').onclick = () => this.hide();
  }

  /**
   * Setup state subscriptions
   */
  setupSubscriptions() {
    // Subscribe to analytics updates
    this.unsubscribers.push(
      stateManager.subscribe('analytics', () => {
        if (this.isVisible) {
          this.update();
        }
      })
    );

    // Subscribe to conversation updates
    this.unsubscribers.push(
      stateManager.subscribe('conversation', () => {
        if (this.isVisible) {
          this.update();
        }
      })
    );
  }

  /**
   * Show dashboard
   */
  show() {
    this.isVisible = true;
    this.container.classList.add('visible');
    this.update();
  }

  /**
   * Hide dashboard
   */
  hide() {
    this.isVisible = false;
    this.container.classList.remove('visible');
  }

  /**
   * Update dashboard with latest data
   */
  update() {
    const summary = stateManager.getAnalyticsSummary();

    this.updateMetrics(summary);
    this.updateSentimentChart();
    this.updateTalkRatio(summary.talkRatio);
    this.updateInsights();
  }

  /**
   * Update metrics cards
   */
  updateMetrics(summary) {
    const metricsGrid = document.getElementById('sc-metrics-grid');

    const metrics = [
      {
        label: 'Session Duration',
        value: this.formatDuration(summary.session.duration),
        unit: '',
        trend: null
      },
      {
        label: 'Total Messages',
        value: summary.session.totalMessages,
        unit: 'messages',
        trend: null
      },
      {
        label: 'Buying Signals',
        value: summary.buyingSignals,
        unit: 'detected',
        trend: summary.buyingSignals > 0 ? 'positive' : null
      },
      {
        label: 'Objections',
        value: summary.objections,
        unit: 'raised',
        trend: summary.objections > 0 ? 'negative' : null
      },
      {
        label: 'AI Suggestions',
        value: summary.suggestions,
        unit: 'provided',
        trend: null
      },
      {
        label: 'Avg Sentiment',
        value: this.formatSentiment(summary.sentiment),
        unit: '',
        trend: summary.sentiment > 0 ? 'positive' : summary.sentiment < 0 ? 'negative' : null
      }
    ];

    metricsGrid.innerHTML = metrics.map(metric => `
      <div class="sc-metric-card">
        <div class="sc-metric-label">${metric.label}</div>
        <div class="sc-metric-value">
          ${metric.value}
          ${metric.unit ? `<span class="sc-metric-unit">${metric.unit}</span>` : ''}
        </div>
        ${metric.trend ? `
          <div class="sc-metric-trend ${metric.trend}">
            ${metric.trend === 'positive' ? '↑' : '↓'}
            ${metric.trend === 'positive' ? 'Good' : 'Alert'}
          </div>
        ` : ''}
      </div>
    `).join('');
  }

  /**
   * Update sentiment chart
   */
  updateSentimentChart() {
    const history = stateManager.get('analytics.sentimentHistory');
    const chart = document.getElementById('sc-sentiment-chart');

    if (history.length === 0) {
      chart.innerHTML = '<p style="color: #64748b; text-align: center;">No sentiment data yet</p>';
      return;
    }

    const sentimentMap = { positive: 100, neutral: 50, negative: 10 };

    chart.innerHTML = history.map((item, index) => {
      const height = sentimentMap[item.value] || 50;
      return `<div class="sc-sentiment-bar" style="height: ${height}%" title="${item.value}"></div>`;
    }).join('');
  }

  /**
   * Update talk ratio visualization
   */
  updateTalkRatio(ratio) {
    const container = document.getElementById('sc-talk-ratio');

    container.innerHTML = `
      <div class="sc-ratio-bar">
        <div class="sc-ratio-fill">
          <div class="sc-ratio-salesperson" style="width: ${ratio.salesperson}%">
            ${ratio.salesperson > 15 ? `You: ${ratio.salesperson}%` : ''}
          </div>
          <div class="sc-ratio-client" style="width: ${ratio.client}%">
            ${ratio.client > 15 ? `Client: ${ratio.client}%` : ''}
          </div>
        </div>
      </div>

      <p style="color: #94a3b8; font-size: 13px; margin-top: 12px;">
        ${this.getTalkRatioInsight(ratio)}
      </p>
    `;
  }

  /**
   * Update insights list
   */
  updateInsights() {
    const buyingSignals = stateManager.get('analytics.buyingSignals');
    const objections = stateManager.get('analytics.objections');
    const keyMoments = stateManager.get('analytics.keyMoments');

    const container = document.getElementById('sc-insights-list');

    const insights = [
      ...buyingSignals.map(signal => ({
        icon: '🎯',
        title: 'Buying Signal Detected',
        description: `Client showed interest: ${signal.type}`,
        timestamp: signal.timestamp
      })),
      ...objections.map(obj => ({
        icon: '⚠️',
        title: 'Objection Raised',
        description: `Client concern: ${obj.type}`,
        timestamp: obj.timestamp
      })),
      ...keyMoments.map(moment => ({
        icon: '⭐',
        title: moment.title || 'Key Moment',
        description: moment.description,
        timestamp: moment.timestamp
      }))
    ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

    if (insights.length === 0) {
      container.innerHTML = '<p style="color: #64748b; text-align: center;">No key moments yet</p>';
      return;
    }

    container.innerHTML = insights.map(insight => `
      <div class="sc-insight-item">
        <div class="sc-insight-icon">${insight.icon}</div>
        <div class="sc-insight-content">
          <h4 class="sc-insight-title">${insight.title}</h4>
          <p class="sc-insight-description">${insight.description}</p>
          <div class="sc-insight-time">${this.formatTime(insight.timestamp)}</div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Helper: Format duration
   */
  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Helper: Format sentiment
   */
  formatSentiment(value) {
    if (value > 0.5) return '😊 Positive';
    if (value < -0.5) return '😟 Negative';
    return '😐 Neutral';
  }

  /**
   * Helper: Get talk ratio insight
   */
  getTalkRatioInsight(ratio) {
    if (ratio.salesperson > 70) {
      return '💡 You\'re talking too much. Try asking more questions and listening.';
    } else if (ratio.salesperson < 30) {
      return '💡 You\'re not talking enough. Take control of the conversation.';
    } else {
      return '✅ Good balance! Maintain this talk ratio.';
    }
  }

  /**
   * Helper: Format time
   */
  formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;

    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  }

  /**
   * Cleanup
   */
  destroy() {
    this.unsubscribers.forEach(unsub => unsub());
    if (this.container) {
      this.container.remove();
    }
  }
}
