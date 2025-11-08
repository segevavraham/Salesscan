/**
 * Display Mode Manager
 * Manages different UI modes: Full, Compact, Stealth
 * Improves UX by reducing screen clutter during meetings
 */

export class DisplayModeManager {
  constructor(components) {
    this.components = components; // { transcription, waveform, suggestions, analytics, coaching }
    this.currentMode = 'full';
    this.modes = this.defineModes();
    this.indicator = null;

    this.init();
  }

  /**
   * Define display modes
   */
  defineModes() {
    return {
      full: {
        name: 'Full Mode',
        icon: '📊',
        description: 'All features visible',
        settings: {
          transcription: { visible: true, size: 'large' },
          waveform: { visible: true, size: 'large' },
          suggestions: { visible: true, size: 'large' },
          analytics: { visible: true, size: 'large' },
          coaching: { visible: true, size: 'large' },
          masterControl: { visible: true, size: 'large' }
        }
      },

      compact: {
        name: 'Compact Mode',
        icon: '📱',
        description: 'Essential features only',
        settings: {
          transcription: { visible: false, size: 'small' },
          waveform: { visible: true, size: 'mini' }, // Mini version
          suggestions: { visible: true, size: 'medium' },
          analytics: { visible: false, size: 'small' },
          coaching: { visible: true, size: 'minimal' }, // Minimal indicators
          masterControl: { visible: true, size: 'small' }
        }
      },

      stealth: {
        name: 'Stealth Mode',
        icon: '🔘',
        description: 'Minimal presence, expand on demand',
        settings: {
          transcription: { visible: false, size: 'hidden' },
          waveform: { visible: false, size: 'hidden' },
          suggestions: { visible: false, size: 'on-demand' }, // Show on click
          analytics: { visible: false, size: 'hidden' },
          coaching: { visible: false, size: 'indicator-only' },
          masterControl: { visible: false, size: 'indicator-only' }
        }
      }
    };
  }

  /**
   * Initialize
   */
  init() {
    this.createModeSelector();
    this.createStealthIndicator();
    this.loadSavedMode();
  }

  /**
   * Create mode selector UI
   */
  createModeSelector() {
    this.injectStyles();

    const selector = document.createElement('div');
    selector.id = 'sc-mode-selector';
    selector.className = 'sc-mode-selector';
    selector.innerHTML = `
      <div class="sc-mode-label">Display Mode:</div>
      <div class="sc-mode-buttons">
        ${Object.keys(this.modes).map(mode => `
          <button
            class="sc-mode-btn ${mode === this.currentMode ? 'active' : ''}"
            data-mode="${mode}"
            title="${this.modes[mode].description}">
            ${this.modes[mode].icon}
            <span>${this.modes[mode].name}</span>
          </button>
        `).join('')}
      </div>
    `;

    // Add click handlers
    selector.querySelectorAll('.sc-mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = e.currentTarget.dataset.mode;
        this.switchMode(mode);
      });
    });

    document.body.appendChild(selector);
  }

  /**
   * Create stealth mode indicator (tiny dot)
   */
  createStealthIndicator() {
    this.indicator = document.createElement('div');
    this.indicator.id = 'sc-stealth-indicator';
    this.indicator.className = 'sc-stealth-indicator';
    this.indicator.innerHTML = `
      <div class="sc-indicator-dot"></div>
      <div class="sc-indicator-tooltip">Sales Coach AI (Click to expand)</div>
    `;

    // Click to expand
    this.indicator.addEventListener('click', () => {
      this.switchMode('compact');
    });

    // Update color based on sentiment
    this.indicator.dataset.sentiment = 'neutral';

    document.body.appendChild(this.indicator);
    this.indicator.style.display = 'none'; // Hidden by default
  }

  /**
   * Switch display mode
   */
  switchMode(mode) {
    if (!this.modes[mode]) {
      console.error(`Invalid mode: ${mode}`);
      return;
    }

    console.log(`🎨 Switching to ${mode} mode`);

    this.currentMode = mode;
    this.applyMode(mode);
    this.updateModeButtons();
    this.saveMode(mode);

    // Analytics
    this.trackModeChange(mode);
  }

  /**
   * Apply mode settings to all components
   */
  applyMode(mode) {
    const settings = this.modes[mode].settings;

    Object.keys(settings).forEach(componentName => {
      const setting = settings[componentName];
      const component = this.components[componentName];

      if (component && component.container) {
        // Apply visibility
        if (setting.visible === false) {
          component.container.style.display = 'none';
        } else if (setting.visible === true) {
          component.container.style.display = 'block';
        }

        // Apply size
        component.container.dataset.displaySize = setting.size;
        this.applySizeClass(component.container, setting.size);
      }
    });

    // Show/hide stealth indicator
    if (mode === 'stealth') {
      this.indicator.style.display = 'flex';
      document.getElementById('sc-mode-selector').style.display = 'none';
    } else {
      this.indicator.style.display = 'none';
      document.getElementById('sc-mode-selector').style.display = 'flex';
    }
  }

  /**
   * Apply size class to component
   */
  applySizeClass(container, size) {
    // Remove existing size classes
    container.classList.remove('sc-size-large', 'sc-size-medium', 'sc-size-small', 'sc-size-mini', 'sc-size-minimal');

    // Add new size class
    if (size !== 'hidden' && size !== 'on-demand' && size !== 'indicator-only') {
      container.classList.add(`sc-size-${size}`);
    }
  }

  /**
   * Update mode selector buttons
   */
  updateModeButtons() {
    document.querySelectorAll('.sc-mode-btn').forEach(btn => {
      if (btn.dataset.mode === this.currentMode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  /**
   * Update stealth indicator color based on sentiment
   */
  updateIndicatorSentiment(sentiment) {
    if (!this.indicator) return;

    this.indicator.dataset.sentiment = sentiment;
  }

  /**
   * Update stealth indicator with notification count
   */
  updateIndicatorNotifications(count) {
    if (!this.indicator) return;

    let badge = this.indicator.querySelector('.sc-indicator-badge');
    if (count > 0) {
      if (!badge) {
        badge = document.createElement('div');
        badge.className = 'sc-indicator-badge';
        this.indicator.appendChild(badge);
      }
      badge.textContent = count;
    } else if (badge) {
      badge.remove();
    }
  }

  /**
   * Save mode to storage
   */
  async saveMode(mode) {
    try {
      await chrome.storage.local.set({ displayMode: mode });
    } catch (error) {
      console.error('Failed to save mode:', error);
    }
  }

  /**
   * Load saved mode
   */
  async loadSavedMode() {
    try {
      const { displayMode } = await chrome.storage.local.get('displayMode');
      if (displayMode && this.modes[displayMode]) {
        this.switchMode(displayMode);
      }
    } catch (error) {
      console.error('Failed to load mode:', error);
    }
  }

  /**
   * Track mode change for analytics
   */
  trackModeChange(mode) {
    // Track in state manager if available
    if (window.stateManager) {
      window.stateManager.incrementStat(`mode_${mode}_usage`);
    }
  }

  /**
   * Keyboard shortcut: Ctrl+Shift+M to cycle modes
   */
  setupKeyboardShortcut() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        this.cycleMode();
      }
    });
  }

  /**
   * Cycle through modes
   */
  cycleMode() {
    const modes = Object.keys(this.modes);
    const currentIndex = modes.indexOf(this.currentMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    this.switchMode(modes[nextIndex]);
  }

  /**
   * Inject styles
   */
  injectStyles() {
    const styleId = 'sc-display-mode-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Mode Selector */
      .sc-mode-selector {
        position: fixed;
        top: 80px;
        right: 20px;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(20px);
        border-radius: 12px;
        padding: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        z-index: 999998;
        display: flex;
        align-items: center;
        gap: 10px;
        border: 1px solid rgba(139, 92, 246, 0.3);
      }

      .sc-mode-label {
        color: #cbd5e1;
        font-size: 12px;
        font-weight: 500;
        font-family: 'Inter', sans-serif;
      }

      .sc-mode-buttons {
        display: flex;
        gap: 6px;
      }

      .sc-mode-btn {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 6px 12px;
        color: #cbd5e1;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .sc-mode-btn:hover {
        background: rgba(139, 92, 246, 0.2);
        border-color: rgba(139, 92, 246, 0.5);
        transform: scale(1.05);
      }

      .sc-mode-btn.active {
        background: rgba(139, 92, 246, 0.4);
        border-color: #8b5cf6;
        color: #fff;
      }

      .sc-mode-btn span {
        display: none;
      }

      @media (min-width: 768px) {
        .sc-mode-btn span {
          display: inline;
        }
      }

      /* Stealth Indicator */
      .sc-stealth-indicator {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 16px;
        height: 16px;
        z-index: 1000000;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .sc-indicator-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #8b5cf6;
        animation: pulse-glow 2s infinite;
        transition: all 0.3s ease;
      }

      .sc-stealth-indicator[data-sentiment="positive"] .sc-indicator-dot {
        background: #10b981;
      }

      .sc-stealth-indicator[data-sentiment="negative"] .sc-indicator-dot {
        background: #ef4444;
      }

      .sc-stealth-indicator[data-sentiment="objection"] .sc-indicator-dot {
        background: #f59e0b;
      }

      .sc-indicator-tooltip {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 8px;
        background: rgba(15, 23, 42, 0.95);
        color: #fff;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 11px;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }

      .sc-stealth-indicator:hover .sc-indicator-tooltip {
        opacity: 1;
      }

      .sc-indicator-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        background: #ef4444;
        color: #fff;
        font-size: 10px;
        font-weight: 600;
        padding: 2px 5px;
        border-radius: 10px;
        min-width: 16px;
        text-align: center;
      }

      @keyframes pulse-glow {
        0%, 100% {
          box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7);
        }
        50% {
          box-shadow: 0 0 0 6px rgba(139, 92, 246, 0);
        }
      }

      /* Size Classes */
      .sc-size-mini {
        transform: scale(0.6);
        opacity: 0.8;
      }

      .sc-size-small {
        transform: scale(0.8);
      }

      .sc-size-medium {
        transform: scale(0.9);
      }

      .sc-size-large {
        transform: scale(1);
      }

      .sc-size-minimal {
        max-height: 60px;
        overflow: hidden;
      }

      /* Transitions */
      .sc-mode-transition {
        transition: all 0.3s ease-in-out;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Get current mode
   */
  getCurrentMode() {
    return this.currentMode;
  }

  /**
   * Check if feature should be visible
   */
  isFeatureVisible(featureName) {
    return this.modes[this.currentMode].settings[featureName]?.visible !== false;
  }
}
