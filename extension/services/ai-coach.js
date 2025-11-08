/**
 * AI Coach Service
 * Analyzes conversations and provides real-time suggestions
 */

export class AICoachService {
  constructor(config = {}) {
    this.apiKey = config.apiKey;
    this.apiProvider = config.provider || 'openai'; // 'openai', 'anthropic', 'custom'
    this.apiUrl = config.apiUrl || this.getDefaultApiUrl();
    this.model = config.model || this.getDefaultModel();
    this.conversationHistory = [];
    this.systemPrompt = this.buildSystemPrompt();
  }

  /**
   * Get default API URL based on provider
   */
  getDefaultApiUrl() {
    const urls = {
      'openai': 'https://api.openai.com/v1/chat/completions',
      'anthropic': 'https://api.anthropic.com/v1/messages',
      'custom': '' // Your custom backend URL
    };
    return urls[this.apiProvider] || urls['custom'];
  }

  /**
   * Get default model based on provider
   */
  getDefaultModel() {
    const models = {
      'openai': 'gpt-4-turbo-preview',
      'anthropic': 'claude-3-opus-20240229',
      'custom': 'default'
    };
    return models[this.apiProvider] || models['custom'];
  }

  /**
   * Build system prompt for the AI coach
   */
  buildSystemPrompt() {
    return `You are an expert sales coach AI assistant. Your role is to:

1. Listen to sales conversations in real-time
2. Analyze what the prospect/client is saying
3. Provide actionable suggestions to the salesperson
4. Recommend specific responses and questions
5. Identify buying signals and objections
6. Help close deals effectively

Guidelines:
- Be concise and actionable
- Provide 2-3 specific response options
- Explain your reasoning briefly
- Focus on what matters most right now
- Consider the prospect's emotional state
- Help build rapport and trust

Format your responses as JSON with this structure:
{
  "suggestion": "Brief actionable advice",
  "quickReplies": ["Option 1", "Option 2", "Option 3"],
  "reasoning": "Why this matters",
  "signals": ["signal1", "signal2"]
}`;
  }

  /**
   * Analyze conversation and get suggestion
   */
  async analyzeMeeting(conversationContext) {
    try {
      // Add to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: `Current conversation:\n${conversationContext}\n\nWhat should the salesperson say or do next?`
      });

      // Limit history to last 10 exchanges
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      // Get AI suggestion based on provider
      let suggestion;
      if (this.apiProvider === 'openai') {
        suggestion = await this.getOpenAISuggestion();
      } else if (this.apiProvider === 'anthropic') {
        suggestion = await this.getAnthropicSuggestion();
      } else {
        suggestion = await this.getCustomSuggestion();
      }

      // Add AI response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: JSON.stringify(suggestion)
      });

      return suggestion;

    } catch (error) {
      console.error('Error analyzing conversation:', error);
      return this.getFallbackSuggestion();
    }
  }

  /**
   * Get suggestion from OpenAI
   */
  async getOpenAISuggestion() {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: this.systemPrompt },
          ...this.conversationHistory
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON response
    try {
      return JSON.parse(content);
    } catch {
      // If not JSON, create structured response
      return {
        suggestion: content,
        quickReplies: [],
        reasoning: 'AI analysis',
        signals: []
      };
    }
  }

  /**
   * Get suggestion from Anthropic Claude
   */
  async getAnthropicSuggestion() {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 500,
        system: this.systemPrompt,
        messages: this.conversationHistory
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Parse JSON response
    try {
      return JSON.parse(content);
    } catch {
      return {
        suggestion: content,
        quickReplies: [],
        reasoning: 'AI analysis',
        signals: []
      };
    }
  }

  /**
   * Get suggestion from custom backend
   */
  async getCustomSuggestion() {
    // Send to your custom backend API
    const response = await fetch(this.apiUrl + '/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        history: this.conversationHistory,
        systemPrompt: this.systemPrompt
      })
    });

    if (!response.ok) {
      throw new Error(`Custom API error: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Fallback suggestion when API fails
   */
  getFallbackSuggestion() {
    return {
      suggestion: 'Continue listening actively and ask clarifying questions',
      quickReplies: [
        'Can you tell me more about that?',
        'What would success look like for you?',
        'How does this align with your goals?'
      ],
      reasoning: 'Fallback suggestion - API unavailable',
      signals: []
    };
  }

  /**
   * Detect buying signals
   */
  detectBuyingSignals(text) {
    const buyingSignals = [
      { pattern: /budget|cost|price|invest/i, signal: 'budget_discussion' },
      { pattern: /timeline|when|start|implement/i, signal: 'timeline_interest' },
      { pattern: /decision|approve|sign|contract/i, signal: 'decision_making' },
      { pattern: /team|stakeholder|boss|manager/i, signal: 'stakeholder_involvement' },
      { pattern: /next steps|move forward|proceed/i, signal: 'ready_to_advance' }
    ];

    const detected = [];
    for (const { pattern, signal } of buyingSignals) {
      if (pattern.test(text)) {
        detected.push(signal);
      }
    }

    return detected;
  }

  /**
   * Detect objections
   */
  detectObjections(text) {
    const objections = [
      { pattern: /too expensive|costly|price/i, type: 'price_objection' },
      { pattern: /not sure|uncertain|doubt/i, type: 'uncertainty' },
      { pattern: /competitor|alternative|other option/i, type: 'competition' },
      { pattern: /not now|later|busy/i, type: 'timing_objection' },
      { pattern: /don't need|already have/i, type: 'no_need' }
    ];

    const detected = [];
    for (const { pattern, type } of objections) {
      if (pattern.test(text)) {
        detected.push(type);
      }
    }

    return detected;
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Update configuration
   */
  updateConfig(config) {
    if (config.apiKey) this.apiKey = config.apiKey;
    if (config.provider) this.apiProvider = config.provider;
    if (config.model) this.model = config.model;
    if (config.apiUrl) this.apiUrl = config.apiUrl;
  }
}
