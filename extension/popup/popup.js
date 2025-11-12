/**
 * Popup Script
 * Main interface for controlling the Sales Coach
 */

let isRecording = false;
let sessionStartTime = null;
let durationInterval = null;

// DOM elements
const toggleBtn = document.getElementById('toggleBtn');
const btnIcon = document.getElementById('btnIcon');
const btnText = document.getElementById('btnText');
const statusBadge = document.getElementById('statusBadge');
const statusText = document.getElementById('statusText');
const adminBtn = document.getElementById('adminBtn');
const settingsBtn = document.getElementById('settingsBtn');
const historyBtn = document.getElementById('historyBtn');
const helpBtn = document.getElementById('helpBtn');
const upgradeLink = document.getElementById('upgradeLink');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadStats();
  await checkRecordingStatus();
  setupEventListeners();
});

/**
 * Setup event listeners
 */
function setupEventListeners() {
  toggleBtn.addEventListener('click', handleToggleRecording);
  adminBtn.addEventListener('click', openAdminDashboard);
  settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  historyBtn.addEventListener('click', openHistory);
  helpBtn.addEventListener('click', openHelp);
  upgradeLink.addEventListener('click', (e) => {
    e.preventDefault();
    openUpgrade();
  });
}

/**
 * Check current recording status
 */
async function checkRecordingStatus() {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'GET_RECORDING_STATUS'
    });

    if (response && response.isRecording) {
      updateUIState(true);
    }
  } catch (error) {
    console.error('Error checking recording status:', error);
  }
}

/**
 * Handle toggle recording
 */
async function handleToggleRecording() {
  try {
    // Get current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) {
      alert('No active tab found');
      return;
    }

    // Check if it's a meeting URL
    if (!isMeetingUrl(tab.url)) {
      const proceed = confirm('This doesn\'t appear to be a meeting page. Continue anyway?');
      if (!proceed) return;
    }

    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording(tab);
    }

  } catch (error) {
    console.error('Error toggling recording:', error);
    alert('Error: ' + error.message);
  }
}

/**
 * Start recording
 */
async function startRecording(tab) {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'START_RECORDING',
      tabId: tab.id
    });

    if (response.success) {
      updateUIState(true);
      sessionStartTime = Date.now();
      startDurationCounter();
      await incrementSessionCount();
    } else {
      throw new Error(response.error || 'Failed to start recording');
    }

  } catch (error) {
    console.error('Error starting recording:', error);
    alert('Failed to start recording: ' + error.message);
  }
}

/**
 * Stop recording
 */
async function stopRecording() {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'STOP_RECORDING'
    });

    if (response.success) {
      updateUIState(false);
      stopDurationCounter();
      sessionStartTime = null;
    } else {
      throw new Error(response.error || 'Failed to stop recording');
    }

  } catch (error) {
    console.error('Error stopping recording:', error);
  }
}

/**
 * Update UI state
 */
function updateUIState(recording) {
  isRecording = recording;

  if (recording) {
    btnIcon.textContent = '⏸';
    btnText.textContent = 'Stop Coaching';
    toggleBtn.classList.add('recording');
    statusBadge.classList.add('recording');
    statusText.textContent = 'Recording';
  } else {
    btnIcon.textContent = '▶';
    btnText.textContent = 'Start Coaching';
    toggleBtn.classList.remove('recording');
    statusBadge.classList.remove('recording');
    statusText.textContent = 'Ready';
  }
}

/**
 * Start duration counter
 */
function startDurationCounter() {
  durationInterval = setInterval(() => {
    if (sessionStartTime) {
      const duration = Math.floor((Date.now() - sessionStartTime) / 1000 / 60);
      document.getElementById('sessionDuration').textContent = duration + 'm';
    }
  }, 1000);
}

/**
 * Stop duration counter
 */
function stopDurationCounter() {
  if (durationInterval) {
    clearInterval(durationInterval);
    durationInterval = null;
  }
}

/**
 * Load stats from storage
 */
async function loadStats() {
  try {
    const result = await chrome.storage.local.get(['stats']);
    const stats = result.stats || {
      sessionsToday: 0,
      totalSuggestions: 0,
      recentSuggestions: []
    };

    // Update stats display
    document.getElementById('sessionsToday').textContent = stats.sessionsToday || 0;
    document.getElementById('suggestionsCount').textContent = stats.totalSuggestions || 0;

    // Display recent suggestions
    displayRecentSuggestions(stats.recentSuggestions || []);

  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

/**
 * Display recent suggestions
 */
function displayRecentSuggestions(suggestions) {
  const container = document.getElementById('recentSuggestions');

  if (suggestions.length === 0) {
    container.innerHTML = '<p class="empty-state">No suggestions yet</p>';
    return;
  }

  container.innerHTML = suggestions.slice(0, 3).map(sugg => `
    <div class="suggestion-item">
      ${sugg.message}
      <div class="suggestion-time">${formatTime(sugg.timestamp)}</div>
    </div>
  `).join('');
}

/**
 * Increment session count
 */
async function incrementSessionCount() {
  try {
    const result = await chrome.storage.local.get(['stats']);
    const stats = result.stats || { sessionsToday: 0 };

    stats.sessionsToday = (stats.sessionsToday || 0) + 1;

    await chrome.storage.local.set({ stats });
    document.getElementById('sessionsToday').textContent = stats.sessionsToday;

  } catch (error) {
    console.error('Error incrementing session count:', error);
  }
}

/**
 * Check if URL is a meeting page
 */
function isMeetingUrl(url) {
  const meetingDomains = [
    'meet.google.com',
    'zoom.us',
    'teams.microsoft.com',
    'webex.com'
  ];

  return meetingDomains.some(domain => url.includes(domain));
}

/**
 * Open admin dashboard
 */
function openAdminDashboard() {
  const adminUrl = chrome.runtime.getURL('admin/admin.html');
  chrome.tabs.create({ url: adminUrl });
}

/**
 * Open history page
 */
function openHistory() {
  // TODO: Create history page
  alert('History feature coming soon!');
}

/**
 * Open help
 */
function openHelp() {
  window.open('https://your-help-page.com', '_blank');
}

/**
 * Open upgrade page
 */
function openUpgrade() {
  window.open('https://your-upgrade-page.com', '_blank');
}

/**
 * Format timestamp
 */
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';

  return date.toLocaleDateString();
}

console.log('Sales Coach AI Popup loaded');
