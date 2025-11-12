/**
 * Storage Utility
 * Helper functions for Chrome storage
 */

export class StorageManager {
  /**
   * Get data from storage
   */
  static async get(keys) {
    try {
      return await chrome.storage.local.get(keys);
    } catch (error) {
      console.error('Error getting from storage:', error);
      return {};
    }
  }

  /**
   * Set data in storage
   */
  static async set(data) {
    try {
      await chrome.storage.local.set(data);
      return true;
    } catch (error) {
      console.error('Error setting storage:', error);
      return false;
    }
  }

  /**
   * Remove data from storage
   */
  static async remove(keys) {
    try {
      await chrome.storage.local.remove(keys);
      return true;
    } catch (error) {
      console.error('Error removing from storage:', error);
      return false;
    }
  }

  /**
   * Clear all storage
   */
  static async clear() {
    try {
      await chrome.storage.local.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  /**
   * Get settings
   */
  static async getSettings() {
    const result = await this.get('settings');
    return result.settings || {};
  }

  /**
   * Save settings
   */
  static async saveSettings(settings) {
    return await this.set({ settings });
  }

  /**
   * Save transcript
   */
  static async saveTranscript(transcript) {
    try {
      const result = await this.get('transcripts');
      const transcripts = result.transcripts || [];

      transcripts.push({
        id: Date.now().toString(),
        timestamp: Date.now(),
        ...transcript
      });

      await this.set({ transcripts });
      return true;
    } catch (error) {
      console.error('Error saving transcript:', error);
      return false;
    }
  }

  /**
   * Get transcripts
   */
  static async getTranscripts(limit = 50) {
    const result = await this.get('transcripts');
    const transcripts = result.transcripts || [];
    return transcripts.slice(-limit);
  }

  /**
   * Save suggestion
   */
  static async saveSuggestion(suggestion) {
    try {
      const result = await this.get(['stats', 'recentSuggestions']);
      const stats = result.stats || { totalSuggestions: 0 };
      const recentSuggestions = result.recentSuggestions || [];

      stats.totalSuggestions = (stats.totalSuggestions || 0) + 1;

      recentSuggestions.unshift({
        ...suggestion,
        timestamp: Date.now()
      });

      // Keep only last 100 suggestions
      if (recentSuggestions.length > 100) {
        recentSuggestions.pop();
      }

      await this.set({ stats, recentSuggestions });
      return true;
    } catch (error) {
      console.error('Error saving suggestion:', error);
      return false;
    }
  }

  /**
   * Get stats
   */
  static async getStats() {
    const result = await this.get('stats');
    return result.stats || {
      sessionsToday: 0,
      totalSuggestions: 0,
      totalTranscripts: 0
    };
  }

  /**
   * Update stats
   */
  static async updateStats(updates) {
    const stats = await this.getStats();
    const updated = { ...stats, ...updates };
    await this.set({ stats: updated });
    return updated;
  }
}
