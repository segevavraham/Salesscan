/**
 * OpenAI Streaming Service
 * Real-time streaming responses for immediate suggestions
 */

export class OpenAIStreamingService {
  constructor(config = {}) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'gpt-4-turbo-preview';
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
    this.conversationHistory = [];
    this.systemPrompt = this.buildSystemPrompt();
    this.abortController = null;
  }

  /**
   * Build expert system prompt
   */
  buildSystemPrompt() {
    return `You are an elite sales coach AI with 20+ years of enterprise sales experience. Your expertise includes:

CORE COMPETENCIES:
- Consultative selling & solution-based approaches
- Objection handling & negotiation tactics
- Buying signal recognition & opportunity progression
- Emotional intelligence & rapport building
- C-level executive communication

ANALYSIS FRAMEWORK:
1. LISTEN: What is the prospect really saying? (explicit + implicit)
2. ASSESS: Where are we in the sales cycle? What's their intent?
3. STRATEGIZE: What's the best next move to advance the deal?
4. RECOMMEND: Provide 2-3 specific, actionable responses

RESPONSE FORMAT (JSON):
{
  "analysis": {
    "stage": "discovery|qualification|proposal|negotiation|closing",
    "sentiment": "positive|neutral|negative|concerned",
    "buying_signals": ["signal1", "signal2"],
    "objections": ["objection1"],
    "key_topics": ["topic1", "topic2"],
    "urgency_level": 1-10,
    "decision_readiness": 1-10
  },
  "strategy": {
    "primary_goal": "What to achieve in next response",
    "approach": "consultative|challenging|empathetic|direct",
    "key_message": "Core point to communicate"
  },
  "suggestions": {
    "main_advice": "Brief, actionable advice (1-2 sentences)",
    "quick_replies": [
      "Specific response option 1",
      "Specific response option 2",
      "Specific response option 3"
    ],
    "why": "Brief reasoning (1 sentence)",
    "caution": "What to avoid (if applicable)"
  },
  "conversation_intelligence": {
    "talk_ratio": "Are you talking too much/too little?",
    "next_best_action": "What should happen next?",
    "risk_level": "low|medium|high"
  }
}

SALES PRINCIPLES:
✓ Questions > Statements (80/20 rule)
✓ Listen for pain, not features
✓ Build value before discussing price
✓ Handle objections with curiosity, not defense
✓ Create urgency through value, not pressure
✓ Always advance the sale or schedule next step

Be concise, actionable, and immediately useful. Focus on what to say RIGHT NOW.`;
  }

  /**
   * Stream completion from OpenAI
   */
  async streamCompletion(conversationContext, onChunk, onComplete, onError) {
    try {
      // Create new abort controller
      this.abortController = new AbortController();

      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: `CURRENT CONVERSATION:\n${conversationContext}\n\nProvide your expert coaching response in JSON format.`
      });

      // Limit history to last 10 messages
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      // Make streaming request
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
          max_tokens: 1000,
          stream: true // Enable streaming!
        }),
        signal: this.abortController.signal
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      // Process stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        // Decode chunk
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.trim() === 'data: [DONE]') continue;

          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices?.[0]?.delta?.content;

              if (content) {
                fullContent += content;

                // Call chunk callback with incremental update
                onChunk({
                  delta: content,
                  fullContent: fullContent,
                  done: false
                });
              }

            } catch (parseError) {
              console.warn('Error parsing SSE data:', parseError);
            }
          }
        }
      }

      // Parse final JSON response
      let suggestion;
      try {
        // Extract JSON from markdown code blocks if present
        let jsonContent = fullContent;
        const jsonMatch = fullContent.match(/```json\n?([\s\S]*?)\n?```/);
        if (jsonMatch) {
          jsonContent = jsonMatch[1];
        }

        suggestion = JSON.parse(jsonContent);
      } catch (parseError) {
        console.error('Error parsing final JSON:', parseError);
        // Fallback to basic structure
        suggestion = {
          suggestions: {
            main_advice: fullContent,
            quick_replies: [],
            why: 'AI response'
          }
        };
      }

      // Add to conversation history
      this.conversationHistory.push({
        role: 'assistant',
        content: fullContent
      });

      // Call complete callback
      onComplete({
        suggestion,
        fullContent,
        done: true
      });

      return suggestion;

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Stream aborted by user');
        return null;
      }

      console.error('Error streaming from OpenAI:', error);
      onError(error);
      throw error;
    }
  }

  /**
   * Cancel ongoing stream
   */
  cancelStream() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * Quick analysis without full coaching
   */
  async quickAnalysis(text) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo', // Faster for quick analysis
          messages: [
            {
              role: 'system',
              content: 'Analyze this sales conversation snippet. Respond with JSON: {"sentiment": "positive|neutral|negative", "signals": [], "urgency": 1-10}'
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.3,
          max_tokens: 200
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      return JSON.parse(content);

    } catch (error) {
      console.error('Error in quick analysis:', error);
      return null;
    }
  }

  /**
   * Detect speaker role (salesperson vs client)
   */
  async detectSpeaker(text, previousContext = '') {
    try {
      const prompt = `Based on this conversation, is the speaker the SALESPERSON or the CLIENT?

Previous context: ${previousContext}

Current statement: "${text}"

Respond with just one word: SALESPERSON or CLIENT`;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a speaker identification system.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1,
          max_tokens: 10
        })
      });

      const data = await response.json();
      const result = data.choices[0].message.content.trim().toUpperCase();

      return result === 'CLIENT' ? 'client' : 'salesperson';

    } catch (error) {
      console.error('Error detecting speaker:', error);
      return 'unknown';
    }
  }

  /**
   * Generate follow-up email
   */
  async generateFollowUpEmail(conversationSummary) {
    const prompt = `Based on this sales conversation, generate a professional follow-up email:

${conversationSummary}

Format:
Subject: [compelling subject line]
Body: [personalized email with clear next steps]

Keep it concise, value-focused, and action-oriented.`;

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: 'You are an expert sales email writer.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      const data = await response.json();
      return data.choices[0].message.content;

    } catch (error) {
      console.error('Error generating email:', error);
      return null;
    }
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
    if (config.model) this.model = config.model;
  }
}
