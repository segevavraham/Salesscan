/**
 * All-in-One Sales Coach Content Script
 * Combines FloatingCoachAssistant, WebSpeechRecognitionService, and OpenAIStreamingService
 * WITHOUT ES6 imports - fully self-contained
 */

// ============================================================================
// OpenAI Streaming Service
// ============================================================================
(function() {
  class OpenAIStreamingService {
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

  // Expose to window
  window.OpenAIStreamingService = OpenAIStreamingService;
})();

// ============================================================================
// Web Speech Recognition Service
// ============================================================================
(function() {
  class WebSpeechRecognitionService {
    constructor(config = {}) {
      this.language = config.language || 'he-IL';
      this.onTranscript = config.onTranscript || (() => {});
      this.onPartialTranscript = config.onPartialTranscript || (() => {});
      this.onError = config.onError || (() => {});
      this.continuous = config.continuous !== false;
      this.interimResults = config.interimResults !== false;

      this.recognition = null;
      this.isActive = false;
      this.restartTimeout = null;

      // Prevent infinite restart loop
      this.restartCount = 0;
      this.maxRestarts = 5;
      this.restartWindow = 60000; // Reset counter after 1 minute
      this.lastRestartTime = null;
    }

    /**
     * Start recognition
     */
    start() {
      try {
        console.log('🎙️ Starting Web Speech Recognition...');

        // Check if browser supports it
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          throw new Error('Speech recognition not supported in this browser');
        }

        // Create recognition instance
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = this.continuous;
        this.recognition.interimResults = this.interimResults;
        this.recognition.lang = this.language;
        this.recognition.maxAlternatives = 1;

        // Event handlers
        this.recognition.onstart = () => {
          console.log('✅ Speech recognition started');
          this.isActive = true;
        };

        this.recognition.onresult = (event) => {
          this.handleResult(event);
        };

        this.recognition.onerror = (event) => {
          console.error('❌ Speech recognition error:', event.error);

          // Auto-restart on certain errors
          if (event.error === 'no-speech' || event.error === 'audio-capture') {
            console.log('🔄 Auto-restarting recognition...');
            this.restart();
          } else {
            this.onError(new Error(event.error));
          }
        };

        this.recognition.onend = () => {
          console.log('🔌 Speech recognition ended');

          // Auto-restart if it was active
          if (this.isActive) {
            console.log('🔄 Auto-restarting recognition...');
            this.restart();
          }
        };

        // Start!
        this.recognition.start();
        console.log('🎤 Listening for speech...');

        return true;

      } catch (error) {
        console.error('Error starting speech recognition:', error);
        this.onError(error);
        return false;
      }
    }

    /**
     * Handle recognition results
     */
    handleResult(event) {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;

        console.log(`🎤 ${result.isFinal ? 'FINAL' : 'interim'}: "${transcript}" (${Math.round(confidence * 100)}%)`);

        if (result.isFinal) {
          // Final transcript
          this.onTranscript({
            text: transcript,
            confidence: confidence,
            isFinal: true,
            timestamp: Date.now()
          });
        } else {
          // Partial transcript
          this.onPartialTranscript({
            text: transcript,
            confidence: confidence,
            isFinal: false,
            timestamp: Date.now()
          });
        }
      }
    }

    /**
     * Stop recognition
     */
    stop() {
      console.log('🛑 Stopping speech recognition...');

      this.isActive = false;

      if (this.restartTimeout) {
        clearTimeout(this.restartTimeout);
        this.restartTimeout = null;
      }

      if (this.recognition) {
        try {
          this.recognition.stop();
        } catch (error) {
          console.warn('Error stopping recognition:', error);
        }
        this.recognition = null;
      }

      console.log('✅ Speech recognition stopped');
    }

    /**
     * Restart recognition (with small delay and limit)
     */
    restart() {
      if (!this.isActive) return;

      // Check if we need to reset the counter
      const now = Date.now();
      if (this.lastRestartTime && (now - this.lastRestartTime > this.restartWindow)) {
        this.restartCount = 0;
        console.log('🔄 Restart counter reset');
      }

      // Check restart limit
      if (this.restartCount >= this.maxRestarts) {
        console.error('❌ Max restart limit reached. Stopping auto-restart.');
        this.onError(new Error(`Speech recognition failed after ${this.maxRestarts} attempts`));
        this.isActive = false;
        return;
      }

      if (this.restartTimeout) {
        clearTimeout(this.restartTimeout);
      }

      this.restartCount++;
      this.lastRestartTime = now;

      console.log(`🔄 Restarting recognition (attempt ${this.restartCount}/${this.maxRestarts})`);

      this.restartTimeout = setTimeout(() => {
        if (this.isActive) {
          try {
            if (this.recognition) {
              this.recognition.start();
            } else {
              this.start();
            }
          } catch (error) {
            console.warn('Error restarting recognition:', error);
          }
        }
      }, 1000);
    }

    /**
     * Get status
     */
    getStatus() {
      return {
        isActive: this.isActive,
        language: this.language
      };
    }
  }

  // Expose to window
  window.WebSpeechRecognitionService = WebSpeechRecognitionService;
})();

// ============================================================================
// Floating Coach Assistant
// ============================================================================
(function() {
  class FloatingCoachAssistant {
    constructor() {
      this.container = null;
      this.position = { x: null, y: null };
      this.isDragging = false;
      this.mode = 'compact'; // compact, widget, full
      this.isVisible = true;
    }

    /**
     * Initialize the floating assistant
     */
    initialize() {
      this.injectStyles();
      this.createContainer();
      this.loadPosition();
      this.setupDragAndDrop();
      this.detectMeetingPlatform();
    }

    /**
     * Inject beautiful RTL styles
     */
    injectStyles() {
      const styleId = 'floating-coach-styles';
      if (document.getElementById(styleId)) return;

      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800&display=swap');

      /* Container */
      .fca-container {
        position: fixed;
        z-index: 999999999;
        font-family: 'Heebo', -apple-system, sans-serif;
        direction: rtl;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }

      .fca-container * {
        pointer-events: auto;
      }

      /* Compact Mode - Floating Button */
      .fca-compact {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 64px;
        height: 64px;
        background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
        border-radius: 50%;
        box-shadow:
          0 8px 32px rgba(139, 92, 246, 0.4),
          0 0 0 8px rgba(139, 92, 246, 0.1),
          0 0 80px rgba(139, 92, 246, 0.3);
        cursor: move;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(10px);
        border: 3px solid rgba(255, 255, 255, 0.2);
        animation: float 6s ease-in-out infinite;
      }

      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }

      .fca-compact:hover {
        transform: scale(1.1) !important;
        box-shadow:
          0 12px 48px rgba(139, 92, 246, 0.5),
          0 0 0 12px rgba(139, 92, 246, 0.15),
          0 0 100px rgba(139, 92, 246, 0.4);
      }

      .fca-compact-icon {
        font-size: 32px;
        animation: pulse 2s ease-in-out infinite;
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }

      /* Status Badge */
      .fca-status-badge {
        position: absolute;
        top: -4px;
        left: -4px;
        width: 20px;
        height: 20px;
        background: #22c55e;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 20px rgba(34, 197, 94, 0.6);
        animation: heartbeat 1.5s ease-in-out infinite;
      }

      @keyframes heartbeat {
        0%, 100% { transform: scale(1); }
        25% { transform: scale(1.2); }
        50% { transform: scale(1); }
      }

      .fca-status-badge.listening {
        background: #22c55e;
      }

      .fca-status-badge.thinking {
        background: #f59e0b;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .fca-status-badge.alert {
        background: #ef4444;
        animation: blink 0.5s ease-in-out infinite;
      }

      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }

      /* Widget Mode - Small Card */
      .fca-widget {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 360px;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(40px) saturate(180%);
        border-radius: 24px;
        padding: 20px;
        box-shadow:
          0 0 0 1px rgba(139, 92, 246, 0.4),
          0 24px 64px rgba(0, 0, 0, 0.5),
          0 0 100px rgba(139, 92, 246, 0.2);
        border: 1px solid rgba(139, 92, 246, 0.3);
        cursor: move;
        animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }

      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(30px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      /* Full Mode - Expanded Panel */
      .fca-full {
        position: fixed;
        top: 80px;
        right: 24px;
        width: 480px;
        max-height: calc(100vh - 120px);
        background: rgba(15, 23, 42, 0.98);
        backdrop-filter: blur(60px) saturate(200%);
        border-radius: 28px;
        box-shadow:
          0 0 0 1px rgba(139, 92, 246, 0.5),
          0 32px 96px rgba(0, 0, 0, 0.6),
          0 0 120px rgba(139, 92, 246, 0.25);
        border: 1px solid rgba(139, 92, 246, 0.4);
        overflow: hidden;
        animation: expandIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      }

      @keyframes expandIn {
        from {
          opacity: 0;
          transform: scale(0.9);
          max-height: 200px;
        }
        to {
          opacity: 1;
          transform: scale(1);
          max-height: calc(100vh - 120px);
        }
      }

      /* Header */
      .fca-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 24px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.05));
        cursor: move;
      }

      .fca-logo {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .fca-logo-icon {
        font-size: 32px;
        filter: drop-shadow(0 0 10px rgba(139, 92, 246, 0.6));
      }

      .fca-logo-text {
        display: flex;
        flex-direction: column;
      }

      .fca-logo-title {
        font-size: 18px;
        font-weight: 800;
        background: linear-gradient(135deg, #8b5cf6, #3b82f6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        letter-spacing: -0.5px;
      }

      .fca-logo-subtitle {
        font-size: 11px;
        color: #94a3b8;
        font-weight: 500;
        margin-top: -2px;
      }

      .fca-controls {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .fca-control-btn {
        width: 36px;
        height: 36px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #cbd5e1;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        font-size: 16px;
      }

      .fca-control-btn:hover {
        background: rgba(139, 92, 246, 0.2);
        border-color: rgba(139, 92, 246, 0.4);
        color: #c4b5fd;
        transform: scale(1.1);
      }

      .fca-control-btn:active {
        transform: scale(0.95);
      }

      /* Status Bar */
      .fca-status-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 24px;
        background: rgba(0, 0, 0, 0.2);
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }

      .fca-status-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: #94a3b8;
      }

      .fca-status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #22c55e;
        box-shadow: 0 0 10px rgba(34, 197, 94, 0.6);
      }

      .fca-status-dot.active {
        animation: heartbeat 1.5s ease-in-out infinite;
      }

      /* Content Area */
      .fca-content {
        padding: 20px 24px;
        max-height: calc(100vh - 300px);
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: rgba(139, 92, 246, 0.3) transparent;
      }

      .fca-content::-webkit-scrollbar {
        width: 6px;
      }

      .fca-content::-webkit-scrollbar-track {
        background: transparent;
      }

      .fca-content::-webkit-scrollbar-thumb {
        background: rgba(139, 92, 246, 0.3);
        border-radius: 10px;
      }

      .fca-content::-webkit-scrollbar-thumb:hover {
        background: rgba(139, 92, 246, 0.5);
      }

      /* Suggestion Card */
      .fca-suggestion-card {
        background: linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(16, 185, 129, 0.04));
        border-right: 4px solid #22c55e;
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 16px;
        animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }

      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      .fca-suggestion-title {
        font-size: 14px;
        font-weight: 700;
        color: #22c55e;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .fca-suggestion-text {
        font-size: 15px;
        color: #f1f5f9;
        line-height: 1.7;
        margin-bottom: 16px;
        font-weight: 500;
      }

      .fca-suggestion-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .fca-action-btn {
        padding: 10px 16px;
        background: rgba(34, 197, 94, 0.1);
        border: 1px solid rgba(34, 197, 94, 0.3);
        border-radius: 10px;
        color: #86efac;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }

      .fca-action-btn:hover {
        background: rgba(34, 197, 94, 0.2);
        border-color: rgba(34, 197, 94, 0.5);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
      }

      /* Transcript Stream */
      .fca-transcript-item {
        background: rgba(255, 255, 255, 0.03);
        border-radius: 12px;
        padding: 12px 16px;
        margin-bottom: 10px;
        border-right: 3px solid #6366f1;
        animation: fadeIn 0.3s ease;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .fca-transcript-speaker {
        font-size: 11px;
        color: #94a3b8;
        font-weight: 600;
        margin-bottom: 6px;
        text-transform: uppercase;
      }

      .fca-transcript-speaker.client {
        color: #3b82f6;
      }

      .fca-transcript-speaker.salesperson {
        color: #8b5cf6;
      }

      .fca-transcript-text {
        font-size: 14px;
        color: #e2e8f0;
        line-height: 1.6;
      }

      /* Empty State */
      .fca-empty-state {
        text-align: center;
        padding: 60px 20px;
        color: #64748b;
      }

      .fca-empty-icon {
        font-size: 64px;
        margin-bottom: 16px;
        opacity: 0.3;
      }

      .fca-empty-text {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 8px;
      }

      .fca-empty-subtext {
        font-size: 13px;
        opacity: 0.7;
      }

      /* Notification Toast */
      .fca-toast {
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%) scale(0.9);
        background: linear-gradient(135deg, #8b5cf6, #6366f1);
        color: white;
        padding: 16px 24px;
        border-radius: 16px;
        font-size: 15px;
        font-weight: 600;
        box-shadow:
          0 0 0 4px rgba(139, 92, 246, 0.2),
          0 20px 40px rgba(139, 92, 246, 0.4);
        animation: toastIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        z-index: 1000000000;
        max-width: 500px;
        text-align: center;
      }

      @keyframes toastIn {
        to {
          transform: translateX(-50%) scale(1);
        }
      }

      .fca-toast.success {
        background: linear-gradient(135deg, #22c55e, #16a34a);
      }

      .fca-toast.warning {
        background: linear-gradient(135deg, #f59e0b, #d97706);
      }

      .fca-toast.error {
        background: linear-gradient(135deg, #ef4444, #dc2626);
      }

      /* Responsive */
      @media (max-width: 768px) {
        .fca-widget, .fca-full {
          width: calc(100vw - 32px);
          right: 16px;
        }

        .fca-full {
          top: 60px;
          max-height: calc(100vh - 80px);
        }
      }

      /* Dragging State */
      .fca-dragging {
        cursor: grabbing !important;
        opacity: 0.9;
        transform: scale(1.05);
      }

      /* Hide when fullscreen */
      .fca-container.hidden {
        opacity: 0;
        pointer-events: none;
      }
    `;
      document.head.appendChild(style);
    }

    /**
     * Create main container
     */
    createContainer() {
      this.container = document.createElement('div');
      this.container.className = 'fca-container';
      document.body.appendChild(this.container);

      // Start in compact mode
      this.renderCompactMode();
    }

    /**
     * Render compact mode (floating button)
     */
    renderCompactMode() {
      this.mode = 'compact';
      this.container.innerHTML = `
      <div class="fca-compact" id="fca-main">
        <div class="fca-status-badge listening"></div>
        <div class="fca-compact-icon">💜</div>
      </div>
    `;

      // Click to expand
      const compact = this.container.querySelector('.fca-compact');
      compact.onclick = (e) => {
        if (!this.isDragging) {
          this.renderWidgetMode();
        }
      };
    }

    /**
     * Render widget mode (small card)
     */
    renderWidgetMode() {
      this.mode = 'widget';
      this.container.innerHTML = `
      <div class="fca-widget" id="fca-main">
        <div class="fca-header">
          <div class="fca-logo">
            <div class="fca-logo-icon">💜</div>
            <div class="fca-logo-text">
              <div class="fca-logo-title">Sales Coach</div>
              <div class="fca-logo-subtitle">מאמן מכירות AI</div>
            </div>
          </div>
          <div class="fca-controls">
            <button class="fca-control-btn" id="fca-expand-btn" title="הרחב">⤢</button>
            <button class="fca-control-btn" id="fca-minimize-btn" title="מזער">−</button>
          </div>
        </div>
        <div class="fca-status-bar">
          <div class="fca-status-item">
            <div class="fca-status-dot active"></div>
            <span>מקשיב</span>
          </div>
          <div class="fca-status-item">
            <span>🎤 דקות: <strong>0:00</strong></span>
          </div>
        </div>
        <div class="fca-content">
          <div class="fca-empty-state">
            <div class="fca-empty-icon">👂</div>
            <div class="fca-empty-text">מקשיב לשיחה...</div>
            <div class="fca-empty-subtext">העצות יופיעו כאן ברגע שהלקוח ידבר</div>
          </div>
        </div>
      </div>
    `;

      // Setup controls
      document.getElementById('fca-expand-btn').onclick = () => this.renderFullMode();
      document.getElementById('fca-minimize-btn').onclick = () => this.renderCompactMode();
    }

    /**
     * Render full mode (expanded panel)
     */
    renderFullMode() {
      this.mode = 'full';
      this.container.innerHTML = `
      <div class="fca-full" id="fca-main">
        <div class="fca-header">
          <div class="fca-logo">
            <div class="fca-logo-icon">💜</div>
            <div class="fca-logo-text">
              <div class="fca-logo-title">Sales Coach AI</div>
              <div class="fca-logo-subtitle">מאמן מכירות בזמן אמת</div>
            </div>
          </div>
          <div class="fca-controls">
            <button class="fca-control-btn" id="fca-settings-btn" title="הגדרות">⚙</button>
            <button class="fca-control-btn" id="fca-collapse-btn" title="כווץ">⤓</button>
            <button class="fca-control-btn" id="fca-minimize-btn" title="מזער">−</button>
          </div>
        </div>
        <div class="fca-status-bar">
          <div class="fca-status-item">
            <div class="fca-status-dot active"></div>
            <span>פעיל ומאזין</span>
          </div>
          <div class="fca-status-item">
            <span>⏱️ <strong>0:00</strong></span>
          </div>
          <div class="fca-status-item">
            <span>💬 <strong>0</strong> הודעות</span>
          </div>
        </div>
        <div class="fca-content" id="fca-content-area">
          <div class="fca-empty-state">
            <div class="fca-empty-icon">🎯</div>
            <div class="fca-empty-text">מוכן לעזור!</div>
            <div class="fca-empty-subtext">התחל את הפגישה ואקבל עצות בזמן אמת</div>
          </div>
        </div>
      </div>
    `;

      // Setup controls
      document.getElementById('fca-collapse-btn').onclick = () => this.renderWidgetMode();
      document.getElementById('fca-minimize-btn').onclick = () => this.renderCompactMode();
      document.getElementById('fca-settings-btn').onclick = () => this.openSettings();
    }

    /**
     * Show coaching suggestion
     */
    showSuggestion(suggestion) {
      const contentArea = document.getElementById('fca-content-area');
      if (!contentArea) return;

      // Clear empty state
      contentArea.innerHTML = '';

      // Create suggestion card
      const card = document.createElement('div');
      card.className = 'fca-suggestion-card';
      card.innerHTML = `
      <div class="fca-suggestion-title">
        ⭐ ${suggestion.title || 'המלצה מהמאמן'}
      </div>
      <div class="fca-suggestion-text">${suggestion.text}</div>
      ${suggestion.actions ? `
        <div class="fca-suggestion-actions">
          ${suggestion.actions.map(action => `
            <button class="fca-action-btn" data-action="${action.id}">
              ${action.text}
            </button>
          `).join('')}
        </div>
      ` : ''}
    `;

      contentArea.insertBefore(card, contentArea.firstChild);

      // Add action handlers
      card.querySelectorAll('.fca-action-btn').forEach(btn => {
        btn.onclick = () => {
          const actionId = btn.getAttribute('data-action');
          this.handleAction(actionId, btn.textContent);
        };
      });

      // Auto-expand to widget mode if compact
      if (this.mode === 'compact') {
        this.renderWidgetMode();
        setTimeout(() => this.showSuggestion(suggestion), 100);
      }
    }

    /**
     * Show transcript
     */
    showTranscript(transcript) {
      const contentArea = document.getElementById('fca-content-area');
      if (!contentArea) return;

      // Create transcript item
      const item = document.createElement('div');
      item.className = 'fca-transcript-item';
      item.innerHTML = `
      <div class="fca-transcript-speaker ${transcript.speaker}">${transcript.speaker === 'client' ? 'לקוח' : 'אתה'}</div>
      <div class="fca-transcript-text">${transcript.text}</div>
    `;

      contentArea.insertBefore(item, contentArea.firstChild);

      // Keep only last 10 transcripts
      const items = contentArea.querySelectorAll('.fca-transcript-item');
      if (items.length > 10) {
        items[items.length - 1].remove();
      }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
      const toast = document.createElement('div');
      toast.className = `fca-toast ${type}`;
      toast.textContent = message;
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.style.animation = 'toastIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) reverse';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }

    /**
     * Update status
     */
    updateStatus(status, data = {}) {
      const statusBadge = this.container.querySelector('.fca-status-badge');
      if (statusBadge) {
        statusBadge.className = `fca-status-badge ${status}`;
      }

      // Update status bar if in widget/full mode
      if (this.mode !== 'compact') {
        // Update timer, message count, etc.
        // TODO: Implement status bar updates
      }
    }

    /**
     * Setup drag and drop
     */
    setupDragAndDrop() {
      let startX, startY, initialX, initialY;

      document.addEventListener('mousedown', (e) => {
        const target = e.target.closest('#fca-main');
        if (!target) return;

        const isDraggable = e.target.closest('.fca-header, .fca-compact');
        if (!isDraggable) return;

        this.isDragging = true;
        target.classList.add('fca-dragging');

        const rect = target.getBoundingClientRect();
        startX = e.clientX;
        startY = e.clientY;
        initialX = rect.left;
        initialY = rect.top;

        e.preventDefault();
      });

      document.addEventListener('mousemove', (e) => {
        if (!this.isDragging) return;

        const target = this.container.querySelector('#fca-main');
        if (!target) return;

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        const newX = initialX + deltaX;
        const newY = initialY + deltaY;

        target.style.left = `${newX}px`;
        target.style.top = `${newY}px`;
        target.style.right = 'auto';
        target.style.bottom = 'auto';

        this.position = { x: newX, y: newY };
      });

      document.addEventListener('mouseup', () => {
        if (this.isDragging) {
          this.isDragging = false;
          const target = this.container.querySelector('#fca-main');
          if (target) {
            target.classList.remove('fca-dragging');
          }
          this.savePosition();
        }
      });
    }

    /**
     * Save position to storage
     */
    savePosition() {
      if (this.position.x !== null && this.position.y !== null) {
        chrome.storage.local.set({ 'fca-position': this.position });
      }
    }

    /**
     * Load position from storage
     */
    async loadPosition() {
      const result = await chrome.storage.local.get('fca-position');
      if (result['fca-position']) {
        this.position = result['fca-position'];
        // Apply position if exists
        const target = this.container.querySelector('#fca-main');
        if (target && this.position.x !== null) {
          target.style.left = `${this.position.x}px`;
          target.style.top = `${this.position.y}px`;
          target.style.right = 'auto';
          target.style.bottom = 'auto';
        }
      }
    }

    /**
     * Detect meeting platform and adjust position
     */
    detectMeetingPlatform() {
      const url = window.location.href;

      if (url.includes('meet.google.com')) {
        // Google Meet - position to avoid controls
        console.log('📍 Detected Google Meet');
      } else if (url.includes('zoom.us')) {
        // Zoom - different positioning
        console.log('📍 Detected Zoom');
      } else if (url.includes('teams.microsoft.com')) {
        // Teams
        console.log('📍 Detected Microsoft Teams');
      }
    }

    /**
     * Handle action button click
     */
    handleAction(actionId, actionText) {
      // Copy to clipboard
      navigator.clipboard.writeText(actionText).then(() => {
        this.showToast('הועתק ללוח!', 'success');
      });
    }

    /**
     * Open settings
     */
    openSettings() {
      if (chrome.runtime && chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        window.open(chrome.runtime.getURL('options/options.html'), '_blank');
      }
    }

    /**
     * Show/hide
     */
    show() {
      this.container.classList.remove('hidden');
      this.isVisible = true;
    }

    hide() {
      this.container.classList.add('hidden');
      this.isVisible = false;
    }

    toggle() {
      if (this.isVisible) {
        this.hide();
      } else {
        this.show();
      }
    }
  }

  // Expose to window
  window.FloatingCoachAssistant = FloatingCoachAssistant;
})();

// ============================================================================
// Main Application Initialization
// ============================================================================
(function() {
  console.log('🚀 All-in-One Sales Coach initializing...');

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  async function init() {
    try {
      console.log('✅ DOM ready, starting initialization...');

      // Load configuration from Chrome storage
      const config = await loadConfig();

      // Initialize UI
      const coach = new window.FloatingCoachAssistant();
      coach.initialize();
      console.log('✅ UI initialized');

      // Initialize Speech Recognition
      const speechRecognition = new window.WebSpeechRecognitionService({
        language: config.language || 'he-IL',
        continuous: true,
        interimResults: true,
        onTranscript: handleTranscript,
        onPartialTranscript: handlePartialTranscript,
        onError: handleSpeechError
      });

      // Initialize OpenAI Service
      const openAI = new window.OpenAIStreamingService({
        apiKey: config.openAIKey,
        model: config.model || 'gpt-4-turbo-preview'
      });

      // Store references globally for debugging
      window.salesCoach = {
        ui: coach,
        speech: speechRecognition,
        ai: openAI,
        config: config,
        conversationBuffer: []
      };

      // Start speech recognition
      if (config.openAIKey) {
        const started = speechRecognition.start();
        if (started) {
          coach.showToast('✅ Sales Coach פעיל!', 'success');
          coach.updateStatus('listening');
        }
      } else {
        coach.showToast('⚠️ נדרש מפתח OpenAI בהגדרות', 'warning');
        setTimeout(() => {
          // Open options page safely
          if (chrome.runtime && chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
          } else {
            // Fallback: open options page manually
            window.open(chrome.runtime.getURL('options/options.html'), '_blank');
          }
        }, 2000);
      }

      console.log('✅ All-in-One Sales Coach ready!');

      // Handle transcript from speech recognition
      function handleTranscript(transcript) {
        console.log('📝 Final transcript:', transcript.text);

        // Show in UI
        coach.showTranscript({
          speaker: 'salesperson', // Default to salesperson, can be improved with AI detection
          text: transcript.text
        });

        // Add to conversation buffer
        window.salesCoach.conversationBuffer.push({
          timestamp: transcript.timestamp,
          speaker: 'salesperson',
          text: transcript.text
        });

        // Keep last 10 messages
        if (window.salesCoach.conversationBuffer.length > 10) {
          window.salesCoach.conversationBuffer.shift();
        }

        // Get AI coaching (debounced)
        debounceGetCoaching();
      }

      // Handle partial transcript
      function handlePartialTranscript(transcript) {
        // console.log('🎤 Partial:', transcript.text);
        // Could show this in real-time in UI
      }

      // Handle speech recognition errors
      function handleSpeechError(error) {
        console.error('❌ Speech error:', error);
        coach.showToast('שגיאה בזיהוי קול', 'error');
        coach.updateStatus('alert');
      }

      // Debounce coaching requests
      let coachingTimeout = null;
      function debounceGetCoaching() {
        if (coachingTimeout) {
          clearTimeout(coachingTimeout);
        }

        coachingTimeout = setTimeout(() => {
          getCoachingSuggestion();
        }, 3000); // Wait 3 seconds after last speech
      }

      // Get coaching suggestion from OpenAI
      async function getCoachingSuggestion() {
        try {
          coach.updateStatus('thinking');

          // Build conversation context
          const context = window.salesCoach.conversationBuffer
            .map(msg => `[${msg.speaker}]: ${msg.text}`)
            .join('\n');

          console.log('🤖 Requesting coaching for context:', context);

          // Stream response
          await openAI.streamCompletion(
            context,
            // onChunk
            (chunk) => {
              // console.log('📨 Chunk:', chunk.delta);
            },
            // onComplete
            (result) => {
              console.log('✅ Coaching complete:', result.suggestion);

              coach.updateStatus('listening');

              // Show suggestion
              if (result.suggestion.suggestions) {
                const suggestion = result.suggestion.suggestions;
                coach.showSuggestion({
                  title: 'עצה מהמאמן',
                  text: suggestion.best_response || suggestion.main_advice,
                  actions: suggestion.alternative_responses
                    ? suggestion.alternative_responses.slice(0, 3).map((resp, idx) => ({
                        id: `action-${idx}`,
                        text: resp
                      }))
                    : []
                });
              } else if (result.suggestion.instant_alert) {
                const alert = result.suggestion.instant_alert;
                coach.showSuggestion({
                  title: alert.type === 'buying_signal' ? '🎯 אות קנייה!' : '⚠️ שים לב',
                  text: alert.message
                });
              }
            },
            // onError
            (error) => {
              console.error('❌ OpenAI error:', error);
              coach.updateStatus('alert');
              coach.showToast('שגיאה בקבלת עצה מהמאמן', 'error');
            }
          );

        } catch (error) {
          console.error('Error getting coaching:', error);
          coach.updateStatus('alert');
        }
      }

    } catch (error) {
      console.error('❌ Initialization error:', error);
    }
  }

  // Load configuration from Chrome storage
  async function loadConfig() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['openAIKey', 'model', 'language'], (result) => {
        resolve({
          openAIKey: result.openAIKey || '',
          model: result.model || 'gpt-4-turbo-preview',
          language: result.language || 'he-IL'
        });
      });
    });
  }

})();

console.log('📦 All-in-One Sales Coach loaded successfully!');
