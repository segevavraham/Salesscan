/**
 * Sales Coach AI - Background Service Worker
 * Manages recording, speech recognition, and AI analysis
 */

let recordingState = {
  isRecording: false,
  currentTabId: null,
  mediaRecorder: null,
  audioChunks: [],
  transcriptionBuffer: []
};

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Sales Coach AI installed');

  // Initialize default settings
  chrome.storage.local.set({
    settings: {
      autoStartRecording: false,
      language: 'he-IL', // Hebrew by default
      aiProvider: 'openai',
      showRealTimeSuggestions: true
    }
  });
});

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message);

  switch (message.type) {
    case 'START_RECORDING':
      handleStartRecording(sender.tab.id, sendResponse);
      return true; // Keep channel open for async response

    case 'STOP_RECORDING':
      handleStopRecording(sendResponse);
      return true;

    case 'GET_RECORDING_STATUS':
      sendResponse({ isRecording: recordingState.isRecording });
      return true;

    case 'TRANSCRIPTION_UPDATE':
      handleTranscriptionUpdate(message.data, sender.tab.id);
      return false;

    case 'REQUEST_SUGGESTION':
      handleSuggestionRequest(message.data, sendResponse);
      return true;

    default:
      console.warn('Unknown message type:', message.type);
  }
});

/**
 * Start recording audio from the current tab
 */
async function handleStartRecording(tabId, sendResponse) {
  try {
    if (recordingState.isRecording) {
      sendResponse({ success: false, error: 'Already recording' });
      return;
    }

    // Get the current tab's audio stream
    const streamId = await chrome.tabCapture.getMediaStreamId({
      targetTabId: tabId
    });

    recordingState.isRecording = true;
    recordingState.currentTabId = tabId;

    // Send message to content script to start UI
    chrome.tabs.sendMessage(tabId, {
      type: 'RECORDING_STARTED',
      streamId: streamId
    });

    sendResponse({ success: true, streamId: streamId });

  } catch (error) {
    console.error('Error starting recording:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Stop recording and process the audio
 */
async function handleStopRecording(sendResponse) {
  try {
    if (!recordingState.isRecording) {
      sendResponse({ success: false, error: 'Not recording' });
      return;
    }

    const tabId = recordingState.currentTabId;

    // Send message to content script to stop
    if (tabId) {
      chrome.tabs.sendMessage(tabId, {
        type: 'RECORDING_STOPPED'
      });
    }

    // Reset state
    recordingState.isRecording = false;
    recordingState.currentTabId = null;
    recordingState.audioChunks = [];
    recordingState.transcriptionBuffer = [];

    sendResponse({ success: true });

  } catch (error) {
    console.error('Error stopping recording:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle transcription updates from speech recognition
 */
async function handleTranscriptionUpdate(data, tabId) {
  const { text, isFinal, speaker } = data;

  console.log('Transcription update:', { text, isFinal, speaker });

  // Add to buffer
  recordingState.transcriptionBuffer.push({
    text,
    speaker,
    timestamp: Date.now(),
    isFinal
  });

  // If we have enough context (last 3-4 sentences), request AI suggestion
  if (isFinal && speaker === 'client') {
    const recentTranscripts = recordingState.transcriptionBuffer
      .slice(-5)
      .filter(t => t.isFinal)
      .map(t => `${t.speaker}: ${t.text}`)
      .join('\n');

    // Request AI suggestion
    requestAISuggestion(recentTranscripts, tabId);
  }
}

/**
 * Request AI suggestion based on conversation context
 */
async function requestAISuggestion(context, tabId) {
  try {
    // Get settings
    const { settings } = await chrome.storage.local.get('settings');

    // TODO: Replace with actual API call to your backend
    // For now, we'll simulate with a simple analysis
    const suggestion = await analyzeConversation(context, settings);

    // Send suggestion to content script
    chrome.tabs.sendMessage(tabId, {
      type: 'SHOW_SUGGESTION',
      suggestion: suggestion
    });

  } catch (error) {
    console.error('Error requesting AI suggestion:', error);
  }
}

/**
 * Analyze conversation and generate suggestions
 * TODO: Replace with actual AI API call
 */
async function analyzeConversation(context, settings) {
  // This is a placeholder - replace with actual API call to OpenAI/Claude/etc.
  console.log('Analyzing context:', context);

  return {
    type: 'suggestion',
    message: 'Try asking about their budget and timeline',
    quickReplies: [
      'What\'s your budget for this project?',
      'When are you looking to get started?',
      'What are your main goals?'
    ],
    confidence: 0.85,
    reasoning: 'Client expressed interest but hasn\'t discussed specifics'
  };
}

/**
 * Handle direct suggestion requests
 */
async function handleSuggestionRequest(data, sendResponse) {
  try {
    const { settings } = await chrome.storage.local.get('settings');
    const suggestion = await analyzeConversation(data.context, settings);
    sendResponse({ success: true, suggestion });
  } catch (error) {
    console.error('Error handling suggestion request:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Tab management - stop recording if tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === recordingState.currentTabId) {
    handleStopRecording(() => {});
  }
});

console.log('Sales Coach AI Service Worker loaded');
