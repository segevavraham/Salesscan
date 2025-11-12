/**
 * Floating Coach Assistant - Premium UI/UX
 * עוזר מכירות צף מושלם שמשתלב בפגישה
 */

export class FloatingCoachAssistant {
  constructor() {
    this.container = null;
    this.position = { x: null, y: null };
    this.isDragging = false;
    this.mode = 'compact'; // compact, widget, full
    this.isVisible = true;
  }

  /**
   * Initialize the floating assistant
   */
  initialize() {
    this.injectStyles();
    this.createContainer();
    this.loadPosition();
    this.setupDragAndDrop();
    this.detectMeetingPlatform();
  }

  /**
   * Inject beautiful RTL styles
   */
  injectStyles() {
    const styleId = 'floating-coach-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800&display=swap');

      /* Container */
      .fca-container {
        position: fixed;
        z-index: 999999999;
        font-family: 'Heebo', -apple-system, sans-serif;
        direction: rtl;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }

      .fca-container * {
        pointer-events: auto;
      }

      /* Compact Mode - Floating Button */
      .fca-compact {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 64px;
        height: 64px;
        background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
        border-radius: 50%;
        box-shadow:
          0 8px 32px rgba(139, 92, 246, 0.4),
          0 0 0 8px rgba(139, 92, 246, 0.1),
          0 0 80px rgba(139, 92, 246, 0.3);
        cursor: move;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(10px);
        border: 3px solid rgba(255, 255, 255, 0.2);
        animation: float 6s ease-in-out infinite;
      }

      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }

      .fca-compact:hover {
        transform: scale(1.1) !important;
        box-shadow:
          0 12px 48px rgba(139, 92, 246, 0.5),
          0 0 0 12px rgba(139, 92, 246, 0.15),
          0 0 100px rgba(139, 92, 246, 0.4);
      }

      .fca-compact-icon {
        font-size: 32px;
        animation: pulse 2s ease-in-out infinite;
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }

      /* Status Badge */
      .fca-status-badge {
        position: absolute;
        top: -4px;
        left: -4px;
        width: 20px;
        height: 20px;
        background: #22c55e;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 20px rgba(34, 197, 94, 0.6);
        animation: heartbeat 1.5s ease-in-out infinite;
      }

      @keyframes heartbeat {
        0%, 100% { transform: scale(1); }
        25% { transform: scale(1.2); }
        50% { transform: scale(1); }
      }

      .fca-status-badge.listening {
        background: #22c55e;
      }

      .fca-status-badge.thinking {
        background: #f59e0b;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .fca-status-badge.alert {
        background: #ef4444;
        animation: blink 0.5s ease-in-out infinite;
      }

      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }

      /* Widget Mode - Small Card */
      .fca-widget {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 360px;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(40px) saturate(180%);
        border-radius: 24px;
        padding: 20px;
        box-shadow:
          0 0 0 1px rgba(139, 92, 246, 0.4),
          0 24px 64px rgba(0, 0, 0, 0.5),
          0 0 100px rgba(139, 92, 246, 0.2);
        border: 1px solid rgba(139, 92, 246, 0.3);
        cursor: move;
        animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }

      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(30px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      /* Full Mode - Expanded Panel */
      .fca-full {
        position: fixed;
        top: 80px;
        right: 24px;
        width: 480px;
        max-height: calc(100vh - 120px);
        background: rgba(15, 23, 42, 0.98);
        backdrop-filter: blur(60px) saturate(200%);
        border-radius: 28px;
        box-shadow:
          0 0 0 1px rgba(139, 92, 246, 0.5),
          0 32px 96px rgba(0, 0, 0, 0.6),
          0 0 120px rgba(139, 92, 246, 0.25);
        border: 1px solid rgba(139, 92, 246, 0.4);
        overflow: hidden;
        animation: expandIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      }

      @keyframes expandIn {
        from {
          opacity: 0;
          transform: scale(0.9);
          max-height: 200px;
        }
        to {
          opacity: 1;
          transform: scale(1);
          max-height: calc(100vh - 120px);
        }
      }

      /* Header */
      .fca-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 24px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.05));
        cursor: move;
      }

      .fca-logo {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .fca-logo-icon {
        font-size: 32px;
        filter: drop-shadow(0 0 10px rgba(139, 92, 246, 0.6));
      }

      .fca-logo-text {
        display: flex;
        flex-direction: column;
      }

      .fca-logo-title {
        font-size: 18px;
        font-weight: 800;
        background: linear-gradient(135deg, #8b5cf6, #3b82f6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        letter-spacing: -0.5px;
      }

      .fca-logo-subtitle {
        font-size: 11px;
        color: #94a3b8;
        font-weight: 500;
        margin-top: -2px;
      }

      .fca-controls {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .fca-control-btn {
        width: 36px;
        height: 36px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #cbd5e1;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        font-size: 16px;
      }

      .fca-control-btn:hover {
        background: rgba(139, 92, 246, 0.2);
        border-color: rgba(139, 92, 246, 0.4);
        color: #c4b5fd;
        transform: scale(1.1);
      }

      .fca-control-btn:active {
        transform: scale(0.95);
      }

      /* Status Bar */
      .fca-status-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 24px;
        background: rgba(0, 0, 0, 0.2);
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }

      .fca-status-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: #94a3b8;
      }

      .fca-status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #22c55e;
        box-shadow: 0 0 10px rgba(34, 197, 94, 0.6);
      }

      .fca-status-dot.active {
        animation: heartbeat 1.5s ease-in-out infinite;
      }

      /* Content Area */
      .fca-content {
        padding: 20px 24px;
        max-height: calc(100vh - 300px);
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: rgba(139, 92, 246, 0.3) transparent;
      }

      .fca-content::-webkit-scrollbar {
        width: 6px;
      }

      .fca-content::-webkit-scrollbar-track {
        background: transparent;
      }

      .fca-content::-webkit-scrollbar-thumb {
        background: rgba(139, 92, 246, 0.3);
        border-radius: 10px;
      }

      .fca-content::-webkit-scrollbar-thumb:hover {
        background: rgba(139, 92, 246, 0.5);
      }

      /* Suggestion Card */
      .fca-suggestion-card {
        background: linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(16, 185, 129, 0.04));
        border-right: 4px solid #22c55e;
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 16px;
        animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }

      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      .fca-suggestion-title {
        font-size: 14px;
        font-weight: 700;
        color: #22c55e;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .fca-suggestion-text {
        font-size: 15px;
        color: #f1f5f9;
        line-height: 1.7;
        margin-bottom: 16px;
        font-weight: 500;
      }

      .fca-suggestion-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .fca-action-btn {
        padding: 10px 16px;
        background: rgba(34, 197, 94, 0.1);
        border: 1px solid rgba(34, 197, 94, 0.3);
        border-radius: 10px;
        color: #86efac;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }

      .fca-action-btn:hover {
        background: rgba(34, 197, 94, 0.2);
        border-color: rgba(34, 197, 94, 0.5);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
      }

      /* Transcript Stream */
      .fca-transcript-item {
        background: rgba(255, 255, 255, 0.03);
        border-radius: 12px;
        padding: 12px 16px;
        margin-bottom: 10px;
        border-right: 3px solid #6366f1;
        animation: fadeIn 0.3s ease;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .fca-transcript-speaker {
        font-size: 11px;
        color: #94a3b8;
        font-weight: 600;
        margin-bottom: 6px;
        text-transform: uppercase;
      }

      .fca-transcript-speaker.client {
        color: #3b82f6;
      }

      .fca-transcript-speaker.salesperson {
        color: #8b5cf6;
      }

      .fca-transcript-text {
        font-size: 14px;
        color: #e2e8f0;
        line-height: 1.6;
      }

      /* Empty State */
      .fca-empty-state {
        text-align: center;
        padding: 60px 20px;
        color: #64748b;
      }

      .fca-empty-icon {
        font-size: 64px;
        margin-bottom: 16px;
        opacity: 0.3;
      }

      .fca-empty-text {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 8px;
      }

      .fca-empty-subtext {
        font-size: 13px;
        opacity: 0.7;
      }

      /* Notification Toast */
      .fca-toast {
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%) scale(0.9);
        background: linear-gradient(135deg, #8b5cf6, #6366f1);
        color: white;
        padding: 16px 24px;
        border-radius: 16px;
        font-size: 15px;
        font-weight: 600;
        box-shadow:
          0 0 0 4px rgba(139, 92, 246, 0.2),
          0 20px 40px rgba(139, 92, 246, 0.4);
        animation: toastIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        z-index: 1000000000;
        max-width: 500px;
        text-align: center;
      }

      @keyframes toastIn {
        to {
          transform: translateX(-50%) scale(1);
        }
      }

      .fca-toast.success {
        background: linear-gradient(135deg, #22c55e, #16a34a);
      }

      .fca-toast.warning {
        background: linear-gradient(135deg, #f59e0b, #d97706);
      }

      .fca-toast.error {
        background: linear-gradient(135deg, #ef4444, #dc2626);
      }

      /* Responsive */
      @media (max-width: 768px) {
        .fca-widget, .fca-full {
          width: calc(100vw - 32px);
          right: 16px;
        }

        .fca-full {
          top: 60px;
          max-height: calc(100vh - 80px);
        }
      }

      /* Dragging State */
      .fca-dragging {
        cursor: grabbing !important;
        opacity: 0.9;
        transform: scale(1.05);
      }

      /* Hide when fullscreen */
      .fca-container.hidden {
        opacity: 0;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Create main container
   */
  createContainer() {
    this.container = document.createElement('div');
    this.container.className = 'fca-container';
    document.body.appendChild(this.container);

    // Start in compact mode
    this.renderCompactMode();
  }

  /**
   * Render compact mode (floating button)
   */
  renderCompactMode() {
    this.mode = 'compact';
    this.container.innerHTML = `
      <div class="fca-compact" id="fca-main">
        <div class="fca-status-badge listening"></div>
        <div class="fca-compact-icon">💜</div>
      </div>
    `;

    // Click to expand
    const compact = this.container.querySelector('.fca-compact');
    compact.onclick = (e) => {
      if (!this.isDragging) {
        this.renderWidgetMode();
      }
    };
  }

  /**
   * Render widget mode (small card)
   */
  renderWidgetMode() {
    this.mode = 'widget';
    this.container.innerHTML = `
      <div class="fca-widget" id="fca-main">
        <div class="fca-header">
          <div class="fca-logo">
            <div class="fca-logo-icon">💜</div>
            <div class="fca-logo-text">
              <div class="fca-logo-title">Sales Coach</div>
              <div class="fca-logo-subtitle">מאמן מכירות AI</div>
            </div>
          </div>
          <div class="fca-controls">
            <button class="fca-control-btn" id="fca-expand-btn" title="הרחב">⤢</button>
            <button class="fca-control-btn" id="fca-minimize-btn" title="מזער">−</button>
          </div>
        </div>
        <div class="fca-status-bar">
          <div class="fca-status-item">
            <div class="fca-status-dot active"></div>
            <span>מקשיב</span>
          </div>
          <div class="fca-status-item">
            <span>🎤 דקות: <strong>0:00</strong></span>
          </div>
        </div>
        <div class="fca-content">
          <div class="fca-empty-state">
            <div class="fca-empty-icon">👂</div>
            <div class="fca-empty-text">מקשיב לשיחה...</div>
            <div class="fca-empty-subtext">העצות יופיעו כאן ברגע שהלקוח ידבר</div>
          </div>
        </div>
      </div>
    `;

    // Setup controls
    document.getElementById('fca-expand-btn').onclick = () => this.renderFullMode();
    document.getElementById('fca-minimize-btn').onclick = () => this.renderCompactMode();
  }

  /**
   * Render full mode (expanded panel)
   */
  renderFullMode() {
    this.mode = 'full';
    this.container.innerHTML = `
      <div class="fca-full" id="fca-main">
        <div class="fca-header">
          <div class="fca-logo">
            <div class="fca-logo-icon">💜</div>
            <div class="fca-logo-text">
              <div class="fca-logo-title">Sales Coach AI</div>
              <div class="fca-logo-subtitle">מאמן מכירות בזמן אמת</div>
            </div>
          </div>
          <div class="fca-controls">
            <button class="fca-control-btn" id="fca-settings-btn" title="הגדרות">⚙</button>
            <button class="fca-control-btn" id="fca-collapse-btn" title="כווץ">⤓</button>
            <button class="fca-control-btn" id="fca-minimize-btn" title="מזער">−</button>
          </div>
        </div>
        <div class="fca-status-bar">
          <div class="fca-status-item">
            <div class="fca-status-dot active"></div>
            <span>פעיל ומאזין</span>
          </div>
          <div class="fca-status-item">
            <span>⏱️ <strong>0:00</strong></span>
          </div>
          <div class="fca-status-item">
            <span>💬 <strong>0</strong> הודעות</span>
          </div>
        </div>
        <div class="fca-content" id="fca-content-area">
          <div class="fca-empty-state">
            <div class="fca-empty-icon">🎯</div>
            <div class="fca-empty-text">מוכן לעזור!</div>
            <div class="fca-empty-subtext">התחל את הפגישה ואקבל עצות בזמן אמת</div>
          </div>
        </div>
      </div>
    `;

    // Setup controls
    document.getElementById('fca-collapse-btn').onclick = () => this.renderWidgetMode();
    document.getElementById('fca-minimize-btn').onclick = () => this.renderCompactMode();
    document.getElementById('fca-settings-btn').onclick = () => this.openSettings();
  }

  /**
   * Show coaching suggestion
   */
  showSuggestion(suggestion) {
    const contentArea = document.getElementById('fca-content-area');
    if (!contentArea) return;

    // Clear empty state
    contentArea.innerHTML = '';

    // Create suggestion card
    const card = document.createElement('div');
    card.className = 'fca-suggestion-card';
    card.innerHTML = `
      <div class="fca-suggestion-title">
        ⭐ ${suggestion.title || 'המלצה מהמאמן'}
      </div>
      <div class="fca-suggestion-text">${suggestion.text}</div>
      ${suggestion.actions ? `
        <div class="fca-suggestion-actions">
          ${suggestion.actions.map(action => `
            <button class="fca-action-btn" data-action="${action.id}">
              ${action.text}
            </button>
          `).join('')}
        </div>
      ` : ''}
    `;

    contentArea.insertBefore(card, contentArea.firstChild);

    // Add action handlers
    card.querySelectorAll('.fca-action-btn').forEach(btn => {
      btn.onclick = () => {
        const actionId = btn.getAttribute('data-action');
        this.handleAction(actionId, btn.textContent);
      };
    });

    // Auto-expand to widget mode if compact
    if (this.mode === 'compact') {
      this.renderWidgetMode();
      setTimeout(() => this.showSuggestion(suggestion), 100);
    }
  }

  /**
   * Show transcript
   */
  showTranscript(transcript) {
    const contentArea = document.getElementById('fca-content-area');
    if (!contentArea) return;

    // Create transcript item
    const item = document.createElement('div');
    item.className = 'fca-transcript-item';
    item.innerHTML = `
      <div class="fca-transcript-speaker ${transcript.speaker}">${transcript.speaker === 'client' ? 'לקוח' : 'אתה'}</div>
      <div class="fca-transcript-text">${transcript.text}</div>
    `;

    contentArea.insertBefore(item, contentArea.firstChild);

    // Keep only last 10 transcripts
    const items = contentArea.querySelectorAll('.fca-transcript-item');
    if (items.length > 10) {
      items[items.length - 1].remove();
    }
  }

  /**
   * Show toast notification
   */
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fca-toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'toastIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) reverse';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * Update status
   */
  updateStatus(status, data = {}) {
    const statusBadge = this.container.querySelector('.fca-status-badge');
    if (statusBadge) {
      statusBadge.className = `fca-status-badge ${status}`;
    }

    // Update status bar if in widget/full mode
    if (this.mode !== 'compact') {
      // Update timer, message count, etc.
      // TODO: Implement status bar updates
    }
  }

  /**
   * Setup drag and drop
   */
  setupDragAndDrop() {
    let startX, startY, initialX, initialY;

    document.addEventListener('mousedown', (e) => {
      const target = e.target.closest('#fca-main');
      if (!target) return;

      const isDraggable = e.target.closest('.fca-header, .fca-compact');
      if (!isDraggable) return;

      this.isDragging = true;
      target.classList.add('fca-dragging');

      const rect = target.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      initialX = rect.left;
      initialY = rect.top;

      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;

      const target = this.container.querySelector('#fca-main');
      if (!target) return;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      const newX = initialX + deltaX;
      const newY = initialY + deltaY;

      target.style.left = `${newX}px`;
      target.style.top = `${newY}px`;
      target.style.right = 'auto';
      target.style.bottom = 'auto';

      this.position = { x: newX, y: newY };
    });

    document.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        const target = this.container.querySelector('#fca-main');
        if (target) {
          target.classList.remove('fca-dragging');
        }
        this.savePosition();
      }
    });
  }

  /**
   * Save position to storage
   */
  savePosition() {
    if (this.position.x !== null && this.position.y !== null) {
      chrome.storage.local.set({ 'fca-position': this.position });
    }
  }

  /**
   * Load position from storage
   */
  async loadPosition() {
    const result = await chrome.storage.local.get('fca-position');
    if (result['fca-position']) {
      this.position = result['fca-position'];
      // Apply position if exists
      const target = this.container.querySelector('#fca-main');
      if (target && this.position.x !== null) {
        target.style.left = `${this.position.x}px`;
        target.style.top = `${this.position.y}px`;
        target.style.right = 'auto';
        target.style.bottom = 'auto';
      }
    }
  }

  /**
   * Detect meeting platform and adjust position
   */
  detectMeetingPlatform() {
    const url = window.location.href;

    if (url.includes('meet.google.com')) {
      // Google Meet - position to avoid controls
      console.log('📍 Detected Google Meet');
    } else if (url.includes('zoom.us')) {
      // Zoom - different positioning
      console.log('📍 Detected Zoom');
    } else if (url.includes('teams.microsoft.com')) {
      // Teams
      console.log('📍 Detected Microsoft Teams');
    }
  }

  /**
   * Handle action button click
   */
  handleAction(actionId, actionText) {
    // Copy to clipboard
    navigator.clipboard.writeText(actionText).then(() => {
      this.showToast('הועתק ללוח!', 'success');
    });
  }

  /**
   * Open settings
   */
  openSettings() {
    chrome.runtime.openOptionsPage();
  }

  /**
   * Show/hide
   */
  show() {
    this.container.classList.remove('hidden');
    this.isVisible = true;
  }

  hide() {
    this.container.classList.add('hidden');
    this.isVisible = false;
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }
}
