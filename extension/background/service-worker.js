/**
 * Premium Sales Coach AI - Background Service Worker v3.0
 * Manages audio streaming, state, and communication
 */

let coachState = {
  isActive: false,
  currentTabId: null,
  streamId: null,
  sessionStartTime: null,
  stats: {
    sessionCount: 0,
    totalDuration: 0
  }
};

/**
 * Inject content script programmatically
 */
async function injectContentScript(tabId) {
  try {
    // Inject the content script
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content/ultimate-content-script.js']
    });

    // Inject the CSS
    await chrome.scripting.insertCSS({
      target: { tabId: tabId },
      files: ['styles/overlay.css']
    });

    console.log('Content script injected successfully');

    // Wait a bit for the script to initialize
    await new Promise(resolve => setTimeout(resolve, 500));

    // Try sending the message again
    chrome.tabs.sendMessage(tabId, {
      type: 'RECORDING_STARTED',
      streamId: recordingState.streamId
    }).catch(err => {
      console.error('Still cannot reach content script after injection:', err);
    });

  } catch (error) {
    console.error('Error injecting content script:', error);
    throw error;
  }
}

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('✅ Premium Sales Coach AI v3.0 installed');

  // Initialize default settings
  chrome.storage.local.set({
    settings: {
      language: 'he-IL', // Hebrew by default
      model: 'gpt-4-turbo-preview',
      enableProactiveCoaching: true,
      enableSpeakerDiarization: true,
      usePremiumTranscription: false, // AssemblyAI (paid)
      openAIKey: null,
      assemblyAIKey: null
    }
  });

  console.log('📋 Default settings initialized');
});

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Message received:', message.type);

  switch (message.type) {
    case 'GET_TAB_AUDIO_STREAM':
      handleGetTabAudioStream(message.tabId || sender.tab.id, sendResponse);
      return true;

    case 'COACH_STARTED':
      coachState.isActive = true;
      coachState.currentTabId = sender.tab.id;
      coachState.sessionStartTime = Date.now();
      coachState.stats.sessionCount++;
      console.log('✅ Coach session started');
      sendResponse({ success: true });
      return true;

    case 'COACH_STOPPED':
      if (coachState.sessionStartTime) {
        const duration = Date.now() - coachState.sessionStartTime;
        coachState.stats.totalDuration += duration;
        console.log('⏹️ Coach session stopped. Duration:', Math.round(duration / 1000) + 's');
      }
      coachState.isActive = false;
      coachState.currentTabId = null;
      coachState.sessionStartTime = null;
      sendResponse({ success: true });
      return true;

    case 'GET_COACH_STATUS':
      sendResponse({
        isActive: coachState.isActive,
        sessionStartTime: coachState.sessionStartTime,
        stats: coachState.stats
      });
      return true;

    case 'OPEN_SETTINGS':
      chrome.runtime.openOptionsPage();
      sendResponse({ success: true });
      return false;

    default:
      console.warn('⚠️ Unknown message type:', message.type);
      sendResponse({ success: false, error: 'Unknown message type' });
  }

  return true;
});

/**
 * Get tab audio stream for capturing meeting audio
 */
async function handleGetTabAudioStream(tabId, sendResponse) {
  try {
    console.log('🎤 Requesting tab audio stream for tab:', tabId);

    // Get the media stream ID for tab audio
    const streamId = await chrome.tabCapture.getMediaStreamId({
      targetTabId: tabId
    });

    console.log('✅ Tab audio stream ID acquired:', streamId);

    sendResponse({
      success: true,
      streamId: streamId
    });

  } catch (error) {
    console.error('❌ Error getting tab audio stream:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

// Tab management - cleanup if tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === coachState.currentTabId) {
    console.log('📌 Tab closed, cleaning up coach state');
    if (coachState.sessionStartTime) {
      const duration = Date.now() - coachState.sessionStartTime;
      coachState.stats.totalDuration += duration;
    }
    coachState.isActive = false;
    coachState.currentTabId = null;
    coachState.sessionStartTime = null;
  }
});

console.log('');
console.log('╔═══════════════════════════════════════════════╗');
console.log('║  Premium Sales Coach AI v3.0 Service Worker  ║');
console.log('║  Status: Ready                                ║');
console.log('╚═══════════════════════════════════════════════╝');
console.log('');
