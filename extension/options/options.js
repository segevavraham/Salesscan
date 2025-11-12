/**
 * Options/Settings Page Script
 */

// Default settings
const defaultSettings = {
  autoStart: false,
  showRealTimeSuggestions: true,
  recordTranscripts: true,
  language: 'he-IL',
  multiLanguage: false,
  elevenLabsKey: '',
  openAIKey: '',
  model: 'gpt-4-turbo-preview',
  suggestionFrequency: 'medium',
  autoHideSuggestions: true,
  detectBuyingSignals: true,
  detectObjections: true,
  soundNotifications: false,
  desktopNotifications: false,
  dataRetention: true,
  retentionDays: 30
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  setupEventListeners();
});

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Save button
  document.getElementById('saveBtn').addEventListener('click', saveSettings);

  // Reset button
  document.getElementById('resetBtn').addEventListener('click', resetSettings);

  // Clear data button
  document.getElementById('clearDataBtn').addEventListener('click', clearAllData);

  // Links
  document.getElementById('privacyLink').addEventListener('click', (e) => {
    e.preventDefault();
    window.open('https://your-privacy-policy.com', '_blank');
  });

  document.getElementById('supportLink').addEventListener('click', (e) => {
    e.preventDefault();
    window.open('https://your-support-page.com', '_blank');
  });
}

/**
 * Load settings from storage
 */
async function loadSettings() {
  try {
    const result = await chrome.storage.local.get(['settings']);
    const settings = result.settings || defaultSettings;

    // General Settings
    document.getElementById('autoStart').checked = settings.autoStart;
    document.getElementById('showRealTimeSuggestions').checked = settings.showRealTimeSuggestions;
    document.getElementById('recordTranscripts').checked = settings.recordTranscripts;

    // Language Settings
    document.getElementById('language').value = settings.language;
    document.getElementById('multiLanguage').checked = settings.multiLanguage;

    // API Keys
    document.getElementById('elevenLabsKey').value = settings.elevenLabsKey || '';
    document.getElementById('openAIKey').value = settings.openAIKey || '';
    document.getElementById('model').value = settings.model;

    // Suggestion Settings
    document.getElementById('suggestionFrequency').value = settings.suggestionFrequency;
    document.getElementById('autoHideSuggestions').checked = settings.autoHideSuggestions;
    document.getElementById('detectBuyingSignals').checked = settings.detectBuyingSignals;
    document.getElementById('detectObjections').checked = settings.detectObjections;

    // Notification Settings
    document.getElementById('soundNotifications').checked = settings.soundNotifications;
    document.getElementById('desktopNotifications').checked = settings.desktopNotifications;

    // Privacy Settings
    document.getElementById('dataRetention').checked = settings.dataRetention;
    document.getElementById('retentionDays').value = settings.retentionDays;

    console.log('Settings loaded');

  } catch (error) {
    console.error('Error loading settings:', error);
    showStatus('Error loading settings', 'error');
  }
}

/**
 * Save settings to storage
 */
async function saveSettings() {
  try {
    const elevenLabsKey = document.getElementById('elevenLabsKey').value.trim();
    const openAIKey = document.getElementById('openAIKey').value.trim();

    // Validate API keys
    if (!elevenLabsKey || !openAIKey) {
      showStatus('Both API keys are required!', 'error');
      return;
    }

    const settings = {
      // General Settings
      autoStart: document.getElementById('autoStart').checked,
      showRealTimeSuggestions: document.getElementById('showRealTimeSuggestions').checked,
      recordTranscripts: document.getElementById('recordTranscripts').checked,

      // Language Settings
      language: document.getElementById('language').value,
      multiLanguage: document.getElementById('multiLanguage').checked,

      // API Keys
      elevenLabsKey: elevenLabsKey,
      openAIKey: openAIKey,
      model: document.getElementById('model').value,

      // Suggestion Settings
      suggestionFrequency: document.getElementById('suggestionFrequency').value,
      autoHideSuggestions: document.getElementById('autoHideSuggestions').checked,
      detectBuyingSignals: document.getElementById('detectBuyingSignals').checked,
      detectObjections: document.getElementById('detectObjections').checked,

      // Notification Settings
      soundNotifications: document.getElementById('soundNotifications').checked,
      desktopNotifications: document.getElementById('desktopNotifications').checked,

      // Privacy Settings
      dataRetention: document.getElementById('dataRetention').checked,
      retentionDays: parseInt(document.getElementById('retentionDays').value)
    };

    await chrome.storage.local.set({ settings });

    showStatus('✅ Settings saved successfully!', 'success');

    console.log('Settings saved:', { ...settings, elevenLabsKey: '***', openAIKey: '***' });

  } catch (error) {
    console.error('Error saving settings:', error);
    showStatus('❌ Error saving settings', 'error');
  }
}

/**
 * Reset settings to defaults
 */
async function resetSettings() {
  if (!confirm('Are you sure you want to reset all settings to defaults?')) {
    return;
  }

  try {
    await chrome.storage.local.set({ settings: defaultSettings });
    await loadSettings();
    showStatus('Settings reset to defaults', 'success');
  } catch (error) {
    console.error('Error resetting settings:', error);
    showStatus('Error resetting settings', 'error');
  }
}

/**
 * Clear all data
 */
async function clearAllData() {
  if (!confirm('Are you sure you want to delete all stored data? This cannot be undone.')) {
    return;
  }

  try {
    await chrome.storage.local.clear();
    await chrome.storage.local.set({ settings: defaultSettings });
    await loadSettings();
    showStatus('All data cleared successfully', 'success');
  } catch (error) {
    console.error('Error clearing data:', error);
    showStatus('Error clearing data', 'error');
  }
}


/**
 * Show status message
 */
function showStatus(message, type) {
  const statusEl = document.getElementById('statusMessage');
  statusEl.textContent = message;
  statusEl.className = `status-message ${type}`;

  setTimeout(() => {
    statusEl.className = 'status-message';
  }, 3000);
}

console.log('Sales Coach AI Options page loaded');
