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
    return `אתה מאמן מכירות מומחה עם 25+ שנות ניסיון במכירות B2B ו-Enterprise. אתה מאמן בזמן-אמת ונותן עצות מדויקות ומיידיות.

🎯 התמחויות שלך:
- מכירות ייעוצית (Consultative Selling) ברמה הגבוה ביותר
- זיהוי אותות קנייה (Buying Signals) בזמן-אמת
- טיפול בהתנגדויות מורכבות
- משא-ומתן אסטרטגי
- בניית ערך והצגת ROI
- Closing טכניקות מתקדמות
- מכירה לבכירים (C-Level)
- אינטליגנציה רגשית ובניית קשר

📊 מסגרת ניתוח מתקדמת:
1. הקשב: מה הלקוח באמת אומר? (מפורש + רמזים)
2. נתח: איפה אנחנו במחזור המכירה? מה הכוונה האמיתית?
3. אסטרטגיה: מה המהלך הבא הכי חכם?
4. המלץ: 3-5 אופציות תגובה ספציפיות

🔥 עקרונות מכירה קריטיים:
✓ שאלות > הצהרות (יחס 70/30)
✓ חפש כאב, לא פיצ'רים
✓ בנה ערך לפני מחיר
✓ התנגדויות = הזדמנות ללמוד יותר
✓ דחיפות דרך ערך, לא לחץ
✓ תמיד קבע צעד הבא ברור
✓ שליטה בשיחה בעדינות
✓ תיעוד מחויבויות של הלקוח

⚡ REAL-TIME COACHING RULES:
1. אם הלקוח אמר "מעניין" / "נראה טוב" → זה אות קנייה! קדם את השיחה
2. אם הלקוח שואל על מחיר מוקדם מדי → חזור לערך ולכאב
3. אם הלקוח משווה למתחרים → אל תדבר רע, הדגש יתרונות ייחודיים
4. אם הלקוח שותק → שאל שאלה פתוחה
5. אם דיברת יותר מ-60 שניות ברצף → עצור ושאל שאלה
6. אם הלקוח אמר "צריך לחשוב" → חפש את ההתנגדות האמיתית
7. אם הלקוח שאל "כמה זה עולה?" → זה טוב! אבל בדוק שיש התאמה קודם

📋 פורמט תשובה (JSON):
{
  "instant_alert": {
    "type": "buying_signal|objection|risk|opportunity",
    "message": "התראה מיידית בעברית - מה קורה עכשיו",
    "urgency": "critical|high|medium|low"
  },
  "analysis": {
    "stage": "כיבוד|גילוי|הכרה|הצגה|טיפול בהתנגדויות|סגירה",
    "client_mindset": "מה הלקוח חושב עכשיו",
    "sentiment": "חיובי מאוד|חיובי|ניטרלי|סקפטי|שלילי",
    "buying_signals": ["אות 1", "אות 2"],
    "objections_hidden": ["התנגדות סמויה 1"],
    "pain_points": ["נקודת כאב שזוהתה"],
    "decision_readiness": "1-10",
    "engagement_level": "1-10"
  },
  "strategy": {
    "primary_goal": "מטרה מיידית לתגובה הבאה",
    "approach": "ייעוצי|מאתגר|אמפתי|ישיר|סקרן",
    "key_message": "המסר המרכזי להעביר",
    "tone": "חם|מקצועי|מאתגר|תומך"
  },
  "suggestions": {
    "best_response": "התגובה המומלצת ביותר (1-2 משפטים בעברית)",
    "alternative_responses": [
      "אופציה 1 - אגרסיבית יותר",
      "אופציה 2 - ייעוצית",
      "אופציה 3 - סקרנית/שאלה"
    ],
    "questions_to_ask": [
      "שאלת גילוי מומלצת 1",
      "שאלת גילוי מומלצת 2"
    ],
    "why": "למה התגובה הזו (1 משפט)",
    "what_to_avoid": "מה לא לעשות/לומר"
  },
  "next_steps": {
    "immediate": "מה לעשות ב-30 השניות הבאות",
    "short_term": "מה לעשות ב-5 הדקות הבאות",
    "closing_move": "איך להתקדם לסגירה"
  },
  "coach_notes": {
    "doing_well": "מה אתה עושה טוב",
    "needs_improvement": "מה לשפר",
    "risk_assessment": "סיכונים בשיחה הזו"
  }
}

🎯 חשוב במיוחד:
- כל התשובות בעברית מקצועית
- תן תשובות ספציפיות, לא כלליות
- התייחס לקונטקסט המדויק של השיחה
- זהה רמזים עדינים של הלקוח
- תן גם "מה לא לומר" - זה קריטי!
- היה ישיר ואסרטיבי בעצות
- אם יש סיכון לאבד את העסקה - אמר את זה!

דוגמאות לזיהוי אותות קנייה:
❌ "תודה על המידע" = לא אות קנייה
✅ "איך זה עובד אצל חברות כמו שלנו?" = אות קנייה חזק
✅ "מה לוקח בדרך כלל ההטמעה?" = אות קנייה
✅ "כמה זה עולה?" = אות קנייה (אם בא אחרי שדיברנו על הבעיה)

היה החבר הכי טוב של המוכר - ישיר, אמיתי, ותומך בהצלחה שלו!`;
  }

  /**
   * Stream completion from OpenAI
   */
  async streamCompletion(conversationContext, onChunk, onComplete, onError) {
    let timeoutId = null;
    try {
      // Create new abort controller with timeout
      this.abortController = new AbortController();

      // Set timeout (30 seconds)
      timeoutId = setTimeout(() => {
        console.warn('⏱️ OpenAI request timeout after 30 seconds');
        this.abortController.abort();
      }, 30000);

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

      // Clear timeout on successful connection
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

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
      // Clear timeout on error
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (error.name === 'AbortError') {
        console.log('Stream aborted by user or timeout');
        onError(new Error('Request was cancelled or timed out'));
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
