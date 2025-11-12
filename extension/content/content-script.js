/**
 * Sales Coach AI - Content Script
 * Injected into meeting pages to provide real-time coaching
 */

class SalesCoachUI {
  constructor() {
    this.isRecording = false;
    this.recognition = null;
    this.mediaStream = null;
    this.overlayContainer = null;
    this.suggestionWidget = null;

    this.init();
  }

  /**
   * Initialize the Sales Coach UI
   */
  init() {
    console.log('Sales Coach AI: Initializing on', window.location.href);

    // Create overlay container
    this.createOverlayContainer();

    // Create control panel
    this.createControlPanel();

    // Listen for messages from background
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sendResponse);
      return true;
    });

    // Detect meeting platform
    this.detectMeetingPlatform();
  }

  /**
   * Create the main overlay container
   */
  createOverlayContainer() {
    this.overlayContainer = document.createElement('div');
    this.overlayContainer.id = 'sales-coach-overlay';
    this.overlayContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;
    document.body.appendChild(this.overlayContainer);
  }

  /**
   * Create control panel for starting/stopping recording
   */
  createControlPanel() {
    const panel = document.createElement('div');
    panel.id = 'sales-coach-control-panel';
    panel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 20px;
      border-radius: 12px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
      pointer-events: auto;
      z-index: 1000000;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      transition: all 0.3s ease;
    `;

    const statusDot = document.createElement('div');
    statusDot.id = 'sales-coach-status-dot';
    statusDot.style.cssText = `
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #ff4444;
      animation: pulse 2s infinite;
    `;

    const statusText = document.createElement('span');
    statusText.id = 'sales-coach-status-text';
    statusText.textContent = 'Ready';

    const toggleButton = document.createElement('button');
    toggleButton.id = 'sales-coach-toggle-btn';
    toggleButton.textContent = 'Start Coaching';
    toggleButton.style.cssText = `
      background: white;
      color: #667eea;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    `;
    toggleButton.onmouseover = () => {
      toggleButton.style.transform = 'scale(1.05)';
    };
    toggleButton.onmouseout = () => {
      toggleButton.style.transform = 'scale(1)';
    };
    toggleButton.onclick = () => this.toggleRecording();

    // Add settings button
    const settingsButton = document.createElement('button');
    settingsButton.id = 'sales-coach-settings-btn';
    settingsButton.innerHTML = '⚙️';
    settingsButton.title = 'Settings';
    settingsButton.style.cssText = `
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 16px;
    `;
    settingsButton.onmouseover = () => {
      settingsButton.style.background = 'rgba(255, 255, 255, 0.3)';
      settingsButton.style.transform = 'scale(1.1)';
    };
    settingsButton.onmouseout = () => {
      settingsButton.style.background = 'rgba(255, 255, 255, 0.2)';
      settingsButton.style.transform = 'scale(1)';
    };
    settingsButton.onclick = () => {
      chrome.runtime.sendMessage({ type: 'OPEN_SETTINGS' });
    };

    panel.appendChild(statusDot);
    panel.appendChild(statusText);
    panel.appendChild(toggleButton);
    panel.appendChild(settingsButton);
    this.overlayContainer.appendChild(panel);

    // Add pulse animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      @keyframes slideIn {
        from { transform: translateY(-20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Detect which meeting platform we're on
   */
  detectMeetingPlatform() {
    const url = window.location.href;
    let platform = 'unknown';

    if (url.includes('meet.google.com')) {
      platform = 'google-meet';
    } else if (url.includes('zoom.us')) {
      platform = 'zoom';
    } else if (url.includes('teams.microsoft.com')) {
      platform = 'teams';
    } else if (url.includes('webex.com')) {
      platform = 'webex';
    }

    console.log('Detected platform:', platform);
    this.platform = platform;
  }

  /**
   * Toggle recording on/off
   */
  async toggleRecording() {
    if (this.isRecording) {
      await this.stopRecording();
    } else {
      await this.startRecording();
    }
  }

  /**
   * Start recording and speech recognition
   */
  async startRecording() {
    try {
      // Request background to start recording
      const response = await chrome.runtime.sendMessage({
        type: 'START_RECORDING'
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      // Start speech recognition
      await this.startSpeechRecognition();

      this.isRecording = true;
      this.updateControlPanelState(true);

      console.log('Recording started');

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording: ' + error.message);
    }
  }

  /**
   * Stop recording
   */
  async stopRecording() {
    try {
      // Stop speech recognition
      if (this.recognition) {
        this.recognition.stop();
        this.recognition = null;
      }

      // Tell background to stop
      await chrome.runtime.sendMessage({
        type: 'STOP_RECORDING'
      });

      this.isRecording = false;
      this.updateControlPanelState(false);

      console.log('Recording stopped');

    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  }

  /**
   * Start speech recognition using Web Speech API
   */
  async startSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
      throw new Error('Speech recognition not supported');
    }

    this.recognition = new webkitSpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'he-IL'; // Hebrew - can be changed based on settings

    this.recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const isFinal = event.results[i].isFinal;

        console.log('Transcript:', transcript, 'Final:', isFinal);

        // Detect speaker - improved logic
        const speaker = this.detectSpeaker(transcript, isFinal);
        
        // Send to background for processing
        chrome.runtime.sendMessage({
          type: 'TRANSCRIPTION_UPDATE',
          data: {
            text: transcript,
            isFinal: isFinal,
            speaker: speaker,
            timestamp: Date.now()
          }
        });
        
        // If client spoke, trigger improvement suggestion
        if (isFinal && speaker === 'client') {
          this.triggerImprovementSuggestion(transcript);
        }
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    this.recognition.onend = () => {
      // Restart if still recording
      if (this.isRecording) {
        this.recognition.start();
      }
    };

    this.recognition.start();
  }

  /**
   * Detect speaker based on text patterns and context
   */
  detectSpeaker(text, isFinal) {
    if (!isFinal) return 'unknown';
    
    // Track conversation history
    if (!this.conversationHistory) {
      this.conversationHistory = [];
    }
    
    // Patterns that indicate salesperson
    const salespersonPatterns = [
      /^(שלום|היי|בוקר טוב|ערב טוב|תודה|תודה רבה)/i,
      /^(אני|אנחנו|המוצר שלנו|השירות שלנו)/i,
      /^(בואו|בואי|אפשר|נוכל|אני יכול|אני יכול להציע)/i,
      /\?$/  // Questions usually from salesperson
    ];
    
    // Patterns that indicate client
    const clientPatterns = [
      /^(אני|אנחנו|אצלנו|בחברה שלנו|אצלי)/i,
      /^(אבל|אלא|רק|לא|כן|נראה)/i,
      /^(מה|איך|מתי|איפה|למה|מי)/i,
      /(מתעניין|רוצה|צריך|מחפש|בודק|שוקל)/i
    ];
    
    // Check patterns
    const isSalesperson = salespersonPatterns.some(pattern => pattern.test(text));
    const isClient = clientPatterns.some(pattern => pattern.test(text));
    
    // Use last speaker as context
    const lastSpeaker = this.conversationHistory[this.conversationHistory.length - 1]?.speaker;
    
    // Determine speaker
    let speaker = 'unknown';
    if (isSalesperson && !isClient) {
      speaker = 'salesperson';
    } else if (isClient && !isSalesperson) {
      speaker = 'client';
    } else if (lastSpeaker) {
      // Alternate if both patterns match
      speaker = lastSpeaker === 'client' ? 'salesperson' : 'client';
    } else {
      // Default: first message is usually salesperson
      speaker = this.conversationHistory.length === 0 ? 'salesperson' : 'client';
    }
    
    // Store in history
    this.conversationHistory.push({
      speaker,
      text,
      timestamp: Date.now()
    });
    
    // Keep only last 20 messages
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }
    
    return speaker;
  }

  /**
   * Trigger improvement suggestion when client speaks
   */
  async triggerImprovementSuggestion(clientText) {
    console.log('🎯 Client spoke, triggering improvement suggestion:', clientText);
    
    try {
      // Request AI suggestion from background
      const response = await chrome.runtime.sendMessage({
        type: 'GET_IMPROVEMENT_SUGGESTION',
        data: {
          clientText: clientText,
          conversationHistory: this.conversationHistory || []
        }
      });
      
      if (response && response.suggestion) {
        this.showSuggestion({
          improvement: response.suggestion.improvement || response.suggestion.message,
          clientSignal: clientText,
          quickReplies: response.suggestion.quickReplies || [],
          reasoning: response.suggestion.reasoning || ''
        });
      }
    } catch (error) {
      console.error('Error getting improvement suggestion:', error);
    }
  }

  /**
   * Update control panel state
   */
  updateControlPanelState(isRecording) {
    const statusDot = document.getElementById('sales-coach-status-dot');
    const statusText = document.getElementById('sales-coach-status-text');
    const toggleBtn = document.getElementById('sales-coach-toggle-btn');

    if (isRecording) {
      statusDot.style.background = '#44ff44';
      statusText.textContent = 'Coaching Active';
      toggleBtn.textContent = 'Stop Coaching';
      toggleBtn.style.background = '#ff4444';
      toggleBtn.style.color = 'white';
    } else {
      statusDot.style.background = '#ff4444';
      statusText.textContent = 'Ready';
      toggleBtn.textContent = 'Start Coaching';
      toggleBtn.style.background = 'white';
      toggleBtn.style.color = '#667eea';
    }
  }

  /**
   * Handle messages from background
   */
  handleMessage(message, sendResponse) {
    switch (message.type) {
      case 'RECORDING_STARTED':
        console.log('Recording started with stream ID:', message.streamId);
        break;

      case 'RECORDING_STOPPED':
        console.log('Recording stopped');
        this.isRecording = false;
        this.updateControlPanelState(false);
        break;

      case 'SHOW_SUGGESTION':
        this.showSuggestion(message.suggestion);
        break;

      default:
        console.warn('Unknown message type:', message.type);
    }

    sendResponse({ received: true });
  }

  /**
   * Show AI suggestion to the user
   */
  showSuggestion(suggestion) {
    console.log('Showing suggestion:', suggestion);

    // Remove existing suggestion if any
    if (this.suggestionWidget) {
      this.suggestionWidget.remove();
    }

    // Create suggestion widget
    this.suggestionWidget = document.createElement('div');
    this.suggestionWidget.className = 'sales-coach-suggestion';
    this.suggestionWidget.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      max-width: 400px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
      padding: 20px;
      pointer-events: auto;
      animation: slideIn 0.4s ease;
      border: 2px solid #667eea;
    `;

    // Suggestion header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    `;

    const icon = document.createElement('div');
    icon.textContent = '⚡';
    icon.style.fontSize = '24px';

    const title = document.createElement('div');
    title.textContent = 'נקודות לשיפור - בזמן אמת';
    title.style.cssText = `
      font-weight: 700;
      color: #f59e0b;
      font-size: 16px;
    `;

    header.appendChild(icon);
    header.appendChild(title);

    // Client signal (what the client said) - always show if available
    if (suggestion.clientSignal || suggestion.improvement) {
      const clientSignal = document.createElement('div');
      clientSignal.className = 'client-signal';
      clientSignal.innerHTML = `<strong>👤 הלקוח אמר:</strong> ${suggestion.clientSignal || 'הלקוח דיבר לאחרונה'}`;
      clientSignal.style.cssText = `
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        border-left: 5px solid #f59e0b;
        padding: 16px;
        border-radius: 12px;
        margin-bottom: 16px;
        font-size: 14px;
        color: #92400e;
        font-weight: 600;
        line-height: 1.8;
        box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);
      `;
      this.suggestionWidget.appendChild(clientSignal);
    }

    // Improvement point - always show
    const improvement = document.createElement('div');
    improvement.className = 'improvement-point';
    improvement.innerHTML = `<strong>💡 נקודה לשיפור:</strong> ${suggestion.improvement || suggestion.message || 'נקודת שיפור'}`;
    improvement.style.cssText = `
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border-left: 5px solid #3b82f6;
      padding: 16px;
      border-radius: 12px;
      margin-bottom: 16px;
      font-size: 15px;
      color: #1e40af;
      font-weight: 600;
      line-height: 1.8;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
    `;

    // Suggestion message (fallback)
    const message = document.createElement('div');
    if (!suggestion.improvement && suggestion.message) {
      message.textContent = suggestion.message;
      message.style.cssText = `
        margin-bottom: 16px;
        color: #333;
        line-height: 1.5;
        font-weight: 500;
      `;
    }

    // Quick replies
    const quickReplies = document.createElement('div');
    quickReplies.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;

    suggestion.quickReplies?.forEach(reply => {
      const button = document.createElement('button');
      button.textContent = reply;
      button.style.cssText = `
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
        padding: 10px 14px;
        border-radius: 8px;
        text-align: left;
        cursor: pointer;
        transition: all 0.2s ease;
        color: #333;
      `;
      button.onmouseover = () => {
        button.style.background = '#667eea';
        button.style.color = 'white';
        button.style.borderColor = '#667eea';
      };
      button.onmouseout = () => {
        button.style.background = '#f3f4f6';
        button.style.color = '#333';
        button.style.borderColor = '#e5e7eb';
      };
      button.onclick = () => {
        // Copy to clipboard
        navigator.clipboard.writeText(reply);
        button.textContent = '✓ Copied!';
        setTimeout(() => {
          button.textContent = reply;
        }, 2000);
      };
      quickReplies.appendChild(button);
    });

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #999;
      line-height: 1;
    `;
    closeBtn.onclick = () => {
      this.suggestionWidget.remove();
      this.suggestionWidget = null;
    };

    this.suggestionWidget.appendChild(closeBtn);
    this.suggestionWidget.appendChild(header);
    
    // Add improvement point if exists
    if (improvement) {
      this.suggestionWidget.appendChild(improvement);
    }
    
    // Add message if exists
    if (message && message.textContent) {
      this.suggestionWidget.appendChild(message);
    }
    
    this.suggestionWidget.appendChild(quickReplies);

    this.overlayContainer.appendChild(this.suggestionWidget);

    // Keep widget visible - STICKY mode (no auto-hide)
    // Widget stays visible until user closes it or new suggestion appears
    // This ensures improvement points are always visible during the meeting
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new SalesCoachUI();
  });
} else {
  new SalesCoachUI();
}

console.log('Sales Coach AI Content Script loaded');
