/**
 * Speaker Diarization Service
 * זיהוי דוברים מתקדם באמצעות AI וניתוח דפוסים
 */

export class SpeakerDiarization {
  constructor(config = {}) {
    this.openAIKey = config.openAIKey;
    this.language = config.language || 'he';

    // Speaker profiles
    this.speakers = {
      salesperson: {
        id: 'salesperson',
        name: 'אתה (מוכר)',
        characteristics: [],
        speechPatterns: [],
        confidence: 0
      },
      client: {
        id: 'client',
        name: 'לקוח',
        characteristics: [],
        speechPatterns: [],
        confidence: 0
      }
    };

    // Conversation context
    this.conversationBuffer = [];
    this.lastSpeaker = null;
    this.speakerSwitchCount = 0;

    // Learning mode
    this.learningMode = true;
    this.minLearningMessages = 5;
  }

  /**
   * Detect speaker from transcript
   * Uses multiple strategies: keywords, AI, patterns, turn-taking
   */
  async detectSpeaker(transcript, context = {}) {
    console.log('🔍 Detecting speaker for:', transcript.text.substring(0, 50));

    // Strategy 1: Keyword-based detection (fast, rule-based)
    const keywordResult = this.detectByKeywords(transcript.text);
    console.log('  📌 Keyword detection:', keywordResult);

    // Strategy 2: Pattern-based detection (conversation flow)
    const patternResult = this.detectByPatterns(transcript.text);
    console.log('  📊 Pattern detection:', patternResult);

    // Strategy 3: Turn-taking logic
    const turnTakingResult = this.detectByTurnTaking();
    console.log('  🔄 Turn-taking:', turnTakingResult);

    // Strategy 4: AI-based detection (slower but more accurate)
    let aiResult = null;
    if (this.openAIKey && this.conversationBuffer.length >= 3) {
      aiResult = await this.detectByAI(transcript.text, context);
      console.log('  🤖 AI detection:', aiResult);
    }

    // Combine all strategies with weights
    const result = this.combineDetectionResults({
      keyword: keywordResult,
      pattern: patternResult,
      turnTaking: turnTakingResult,
      ai: aiResult
    });

    console.log(`  ✅ Final decision: ${result.speaker.toUpperCase()} (${Math.round(result.confidence * 100)}%)`);

    // Update conversation buffer
    this.conversationBuffer.push({
      speaker: result.speaker,
      text: transcript.text,
      confidence: result.confidence,
      timestamp: Date.now()
    });

    // Keep buffer manageable
    if (this.conversationBuffer.length > 20) {
      this.conversationBuffer.shift();
    }

    // Update last speaker
    if (this.lastSpeaker !== result.speaker) {
      this.speakerSwitchCount++;
    }
    this.lastSpeaker = result.speaker;

    // Learn patterns if in learning mode
    if (this.learningMode && this.conversationBuffer.length >= this.minLearningMessages) {
      this.learnSpeakerPatterns();
    }

    return {
      speaker: result.speaker,
      confidence: result.confidence,
      method: result.method
    };
  }

  /**
   * Detect speaker by keywords (Hebrew & English)
   */
  detectByKeywords(text) {
    const lowerText = text.toLowerCase();

    // Salesperson keywords (Hebrew)
    const salespersonKeywords = [
      // Self-references
      'אני', 'אנחנו', 'אנו',
      // Company references
      'החברה שלנו', 'המוצר שלנו', 'הפתרון שלנו', 'הצוות שלנו',
      // Offering
      'נוכל להציע', 'נוכל לעזור', 'אני ממליץ', 'הצעה שלי',
      // Questions to client
      'מה אתה חושב', 'ספר לי', 'מה דעתך', 'האם אתה',
      // Opening/closing
      'תודה שהקדשת', 'נשמח לעבוד', 'בוא נדבר',
      // English
      'our company', 'our product', 'we can offer', 'let me', 'i recommend'
    ];

    // Client keywords (Hebrew)
    const clientKeywords = [
      // Expressing interest/concern
      'מעניין', 'מה עם', 'איך זה עובד', 'כמה זה עולה',
      // Questions
      'מתי', 'איפה', 'למה', 'איך',
      // Needs/pain points
      'אנחנו צריכים', 'הבעיה שלנו', 'אני מחפש', 'נתקלנו ב',
      // Company references (client's)
      'החברה שלנו', 'הצוות שלנו', 'המערכת שלנו', 'התהליך שלנו',
      // Objections
      'אבל', 'מצד שני', 'לא בטוח', 'צריך לחשוב',
      // Comparative
      'לעומת', 'בהשוואה ל', 'יש לכם', 'האם אתם',
      // English
      'we need', 'our problem', 'how much', 'when can', 'do you have'
    ];

    // Count matches
    let salespersonScore = 0;
    let clientScore = 0;

    salespersonKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        salespersonScore += 1;
      }
    });

    clientKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        clientScore += 1;
      }
    });

    // Specific patterns that strongly indicate speaker
    if (lowerText.includes('החברה שלנו')) {
      // Ambiguous - need context
      // If talking about offering services = salesperson
      if (lowerText.includes('מציע') || lowerText.includes('עובד')) {
        salespersonScore += 2;
      } else {
        // If talking about needs = client
        clientScore += 2;
      }
    }

    // Questions at the end usually from salesperson
    if (text.trim().endsWith('?')) {
      salespersonScore += 0.5;
    }

    if (salespersonScore > clientScore) {
      return {
        speaker: 'salesperson',
        confidence: Math.min(0.9, 0.5 + (salespersonScore - clientScore) * 0.1),
        score: salespersonScore
      };
    } else if (clientScore > salespersonScore) {
      return {
        speaker: 'client',
        confidence: Math.min(0.9, 0.5 + (clientScore - salespersonScore) * 0.1),
        score: clientScore
      };
    } else {
      return {
        speaker: null,
        confidence: 0,
        score: 0
      };
    }
  }

  /**
   * Detect speaker by conversation patterns
   */
  detectByPatterns(text) {
    if (this.conversationBuffer.length < 2) {
      return { speaker: null, confidence: 0 };
    }

    // Analyze recent conversation flow
    const recentMessages = this.conversationBuffer.slice(-5);

    // Check if this is likely a response
    const lastMessage = recentMessages[recentMessages.length - 1];
    if (lastMessage && lastMessage.speaker) {
      // People tend to alternate in conversation
      const alternativeSpeaker = lastMessage.speaker === 'salesperson' ? 'client' : 'salesperson';

      // Calculate alternation confidence based on history
      let alternationCount = 0;
      for (let i = 1; i < recentMessages.length; i++) {
        if (recentMessages[i].speaker !== recentMessages[i - 1].speaker) {
          alternationCount++;
        }
      }

      const alternationRate = alternationCount / (recentMessages.length - 1);

      return {
        speaker: alternativeSpeaker,
        confidence: alternationRate * 0.7, // Max 70% confidence from patterns
        alternationRate
      };
    }

    return { speaker: null, confidence: 0 };
  }

  /**
   * Detect by turn-taking logic
   */
  detectByTurnTaking() {
    // Simple rule: speakers alternate
    if (this.lastSpeaker) {
      return {
        speaker: this.lastSpeaker === 'salesperson' ? 'client' : 'salesperson',
        confidence: 0.5 // Medium confidence
      };
    }

    // First message of conversation - likely salesperson (opening)
    return {
      speaker: 'salesperson',
      confidence: 0.6
    };
  }

  /**
   * Detect speaker using AI (OpenAI)
   */
  async detectByAI(text, context) {
    if (!this.openAIKey) return null;

    try {
      // Build context from recent conversation
      const recentContext = this.conversationBuffer
        .slice(-3)
        .map(m => `${m.speaker === 'salesperson' ? 'SALESPERSON' : 'CLIENT'}: ${m.text}`)
        .join('\n');

      const prompt = `You are a speaker identification system for sales conversations.

Recent conversation:
${recentContext}

New statement: "${text}"

Is the speaker the SALESPERSON or the CLIENT?

Respond with ONLY one word: SALESPERSON or CLIENT`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openAIKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a speaker identification assistant.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1,
          max_tokens: 10
        })
      });

      if (!response.ok) {
        console.warn('AI detection API error:', response.status);
        return null;
      }

      const data = await response.json();
      const answer = data.choices[0].message.content.trim().toUpperCase();

      if (answer.includes('CLIENT')) {
        return { speaker: 'client', confidence: 0.85 };
      } else if (answer.includes('SALESPERSON')) {
        return { speaker: 'salesperson', confidence: 0.85 };
      }

      return null;

    } catch (error) {
      console.warn('AI detection error:', error.message);
      return null;
    }
  }

  /**
   * Combine detection results with weights
   */
  combineDetectionResults(results) {
    const weights = {
      keyword: 0.35,
      pattern: 0.15,
      turnTaking: 0.10,
      ai: 0.40 // AI gets highest weight when available
    };

    let salespersonScore = 0;
    let clientScore = 0;
    let totalWeight = 0;

    // Process each result
    Object.entries(results).forEach(([method, result]) => {
      if (!result || !result.speaker) return;

      const weight = weights[method];
      const score = result.confidence * weight;
      totalWeight += weight;

      if (result.speaker === 'salesperson') {
        salespersonScore += score;
      } else if (result.speaker === 'client') {
        clientScore += score;
      }
    });

    // Normalize scores
    salespersonScore = totalWeight > 0 ? salespersonScore / totalWeight : 0;
    clientScore = totalWeight > 0 ? clientScore / totalWeight : 0;

    // Determine winner
    if (salespersonScore > clientScore) {
      return {
        speaker: 'salesperson',
        confidence: salespersonScore,
        method: 'combined'
      };
    } else if (clientScore > salespersonScore) {
      return {
        speaker: 'client',
        confidence: clientScore,
        method: 'combined'
      };
    } else {
      // Tie - use turn-taking as fallback
      return {
        speaker: this.lastSpeaker === 'salesperson' ? 'client' : 'salesperson',
        confidence: 0.5,
        method: 'fallback'
      };
    }
  }

  /**
   * Learn speaker patterns over time
   */
  learnSpeakerPatterns() {
    // Analyze conversation buffer to identify patterns
    const salespersonMessages = this.conversationBuffer.filter(m => m.speaker === 'salesperson');
    const clientMessages = this.conversationBuffer.filter(m => m.speaker === 'client');

    // Extract common words/phrases for each speaker
    // This could be enhanced with more sophisticated NLP

    console.log(`📚 Learning: ${salespersonMessages.length} salesperson msgs, ${clientMessages.length} client msgs`);
    this.learningMode = false; // Disable after first learning
  }

  /**
   * Reset conversation state
   */
  reset() {
    this.conversationBuffer = [];
    this.lastSpeaker = null;
    this.speakerSwitchCount = 0;
    this.learningMode = true;
    console.log('🔄 Speaker diarization reset');
  }

  /**
   * Get conversation statistics
   */
  getStats() {
    const salespersonCount = this.conversationBuffer.filter(m => m.speaker === 'salesperson').length;
    const clientCount = this.conversationBuffer.filter(m => m.speaker === 'client').length;

    return {
      totalMessages: this.conversationBuffer.length,
      salespersonMessages: salespersonCount,
      clientMessages: clientCount,
      speakerSwitches: this.speakerSwitchCount,
      talkRatio: salespersonCount / (salespersonCount + clientCount) || 0
    };
  }
}
