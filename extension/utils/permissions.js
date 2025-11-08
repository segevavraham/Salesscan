/**
 * Permissions Utility
 * Helper functions for managing Chrome permissions
 */

export class PermissionsManager {
  /**
   * Check if we have required permissions
   */
  static async checkPermissions() {
    try {
      const hasPermissions = await chrome.permissions.contains({
        permissions: ['activeTab', 'tabCapture', 'storage']
      });

      return hasPermissions;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }

  /**
   * Request permissions
   */
  static async requestPermissions() {
    try {
      const granted = await chrome.permissions.request({
        permissions: ['activeTab', 'tabCapture', 'storage', 'scripting']
      });

      if (granted) {
        console.log('Permissions granted');
      } else {
        console.warn('Permissions denied');
      }

      return granted;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  /**
   * Request microphone permission
   */
  static async requestMicrophone() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Stop the stream immediately
      stream.getTracks().forEach(track => track.stop());

      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  }

  /**
   * Request notification permission
   */
  static async requestNotifications() {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  /**
   * Check if we can access the current tab
   */
  static async canAccessTab(tabId) {
    try {
      await chrome.tabs.get(tabId);
      return true;
    } catch (error) {
      console.error('Cannot access tab:', error);
      return false;
    }
  }

  /**
   * Check if tab capture is available
   */
  static async canCaptureTab(tabId) {
    try {
      const streamId = await chrome.tabCapture.getMediaStreamId({
        targetTabId: tabId
      });

      return !!streamId;
    } catch (error) {
      console.error('Tab capture not available:', error);
      return false;
    }
  }
}
