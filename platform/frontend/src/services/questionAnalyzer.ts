/**
 * Question Analyzer Service
 * Analyzes customer questions and provides intelligent response suggestions
 */

export interface Question {
  id: string;
  text: string;
  category: 'product' | 'pricing' | 'implementation' | 'support' | 'technical' | 'integration';
  timestamp: number;
  intent: 'clarification' | 'objection' | 'interest' | 'comparison';
  suggestions: QuestionResponse[];
}

export interface QuestionResponse {
  id: string;
  text: string;
  type: 'direct' | 'story' | 'demo' | 'data';
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
  followUp?: string;
}

export class QuestionAnalyzer {
  private questionPatterns = {
    product: {
      keywords: ['feature', 'capability', 'does it', 'can it', 'how does', 'what does'],
      patterns: [
        /(?:what|which) (?:features?|capabilities?)/i,
        /(?:can|does) (?:it|this|your solution)/i,
        /how (?:does|do) (?:you|it|this)/i,
        /(?:tell me|show me) (?:about|how)/i,
      ],
    },
    pricing: {
      keywords: ['cost', 'price', 'pricing', 'how much', 'payment', 'subscription', 'plan'],
      patterns: [
        /how much (?:does|is|would)/i,
        /what (?:does|is) the (?:cost|price|pricing)/i,
        /(?:pricing|payment) (?:model|structure|options?)/i,
        /what (?:plans?|tiers?) (?:do you have|are available)/i,
      ],
    },
    implementation: {
      keywords: [
        'implement',
        'setup',
        'onboard',
        'deploy',
        'install',
        'get started',
        'migration',
      ],
      patterns: [
        /how (?:long|quickly) (?:to|does it take|can we)/i,
        /(?:implementation|setup|onboarding) (?:process|time|timeline)/i,
        /how do we (?:get started|begin|implement)/i,
        /what (?:does|is) the (?:process|timeline)/i,
      ],
    },
    support: {
      keywords: ['support', 'help', 'training', 'assistance', 'customer service', 'documentation'],
      patterns: [
        /what (?:kind of|type of) support/i,
        /(?:do you|is there) (?:provide|offer|have) (?:training|support)/i,
        /who (?:helps?|supports?)/i,
        /(?:customer service|technical support|help)/i,
      ],
    },
    technical: {
      keywords: [
        'api',
        'security',
        'data',
        'technology',
        'architecture',
        'infrastructure',
        'scalability',
      ],
      patterns: [
        /(?:what|which) (?:technology|stack|platform)/i,
        /how (?:secure|safe|protected)/i,
        /(?:does|do) (?:you|it) (?:scale|integrate|connect)/i,
        /(?:api|integration|security|data) (?:capabilities?|features?)/i,
      ],
    },
    integration: {
      keywords: [
        'integrate',
        'connect',
        'works with',
        'compatible',
        'api',
        'sync',
        'import',
        'export',
      ],
      patterns: [
        /(?:integrate|work|connect) with/i,
        /(?:compatible|work) with (?:our|my|existing)/i,
        /can (?:we|you|it) (?:import|export|sync)/i,
        /(?:api|integration) (?:with|for)/i,
      ],
    },
  };

  /**
   * Analyze question and generate responses
   */
  analyzeQuestion(text: string, speaker: 'client' | 'salesperson'): Question | null {
    // Only analyze client questions
    if (speaker !== 'client') return null;

    // Must be a question
    if (!this.isQuestion(text)) return null;

    const category = this.categorizeQuestion(text);
    if (!category) return null;

    const intent = this.determineIntent(text);

    return {
      id: Date.now().toString(),
      text,
      category,
      timestamp: Date.now(),
      intent,
      suggestions: this.generateResponses(category, text, intent),
    };
  }

  /**
   * Check if text is a question
   */
  private isQuestion(text: string): boolean {
    const questionMarkers = [
      '?',
      /^(?:what|when|where|who|why|how|can|could|would|is|are|do|does)/i,
      /\b(?:tell me|show me|explain|wondering|curious)\b/i,
    ];

    return questionMarkers.some((marker) => {
      if (typeof marker === 'string') {
        return text.includes(marker);
      }
      return marker.test(text);
    });
  }

  /**
   * Categorize question by topic
   */
  private categorizeQuestion(text: string): Question['category'] | null {
    const lowerText = text.toLowerCase();
    let maxScore = 0;
    let bestCategory: Question['category'] | null = null;

    for (const [category, config] of Object.entries(this.questionPatterns)) {
      const keywordMatches = config.keywords.filter((keyword) =>
        lowerText.includes(keyword.toLowerCase())
      ).length;

      const patternMatches = config.patterns.filter((pattern) => pattern.test(text)).length;

      const score = keywordMatches + patternMatches * 2;

      if (score > maxScore) {
        maxScore = score;
        bestCategory = category as Question['category'];
      }
    }

    return maxScore >= 1 ? bestCategory : 'product';
  }

  /**
   * Determine question intent
   */
  private determineIntent(text: string): Question['intent'] {
    const lowerText = text.toLowerCase();

    // Objection disguised as question
    if (
      /(?:why should|what makes|how is this better|compared to|versus)/i.test(text) ||
      /(?:concerned|worried|skeptical|doubt)/i.test(text)
    ) {
      return 'objection';
    }

    // Comparison shopping
    if (/(?:compare|comparison|competitor|alternative|other options)/i.test(text)) {
      return 'comparison';
    }

    // Strong interest
    if (
      /(?:how soon|when can|ready to|next steps|move forward|get started)/i.test(text) ||
      /(?:who|what) (?:do i|should i) (?:contact|talk to)/i.test(text)
    ) {
      return 'interest';
    }

    // Default: clarification
    return 'clarification';
  }

  /**
   * Generate response suggestions
   */
  private generateResponses(
    category: Question['category'],
    questionText: string,
    intent: Question['intent']
  ): QuestionResponse[] {
    const responseMap: Record<Question['category'], QuestionResponse[]> = {
      product: [
        {
          id: '1',
          text: "Great question! Let me show you exactly how this works. [Open relevant feature and demonstrate]. The key benefit here is that it allows you to [specific outcome]. Does this address what you were looking for?",
          type: 'demo',
          priority: 'high',
          reasoning: 'Show don\'t tell - demo creates clarity and engagement',
          followUp: 'Ask: "What would you want to see this do in your workflow?"',
        },
        {
          id: '2',
          text: "Absolutely. This feature was actually built based on customer feedback from [similar company type]. What it does is [clear explanation]. For example, one customer uses it to [specific use case].",
          type: 'story',
          priority: 'high',
          reasoning: 'Combines explanation with social proof and concrete example',
        },
        {
          id: '3',
          text: "Yes! We have [feature/capability]. What's unique about our approach is [differentiator]. Would you like me to show you how it works with your specific use case?",
          type: 'direct',
          priority: 'medium',
          reasoning: 'Direct answer with differentiation and offer to customize',
        },
      ],
      pricing: [
        {
          id: '1',
          text: "I appreciate you asking about investment. Our pricing is based on [value metric] because we want to align with your success. For a [their size/type] like yours, we typically see [range]. But rather than focus on price, can I understand your expected ROI?",
          type: 'data',
          priority: 'high',
          reasoning: 'Provides transparency while reframing to value',
          followUp: 'Ask: "What would make this a no-brainer investment for you?"',
        },
        {
          id: '2',
          text: "Great question. We have three tiers designed for different needs. [Quick overview]. Most companies your size start with [tier] at [price]. The question I always ask is - what's the cost of NOT solving this problem?",
          type: 'direct',
          priority: 'high',
          reasoning: 'Clear structure with anchor pricing and reframe',
        },
        {
          id: '3',
          text: "The investment depends on [variables]. What I can tell you is that our customers typically see [ROI timeframe]. For example, [Customer Name] paid for their annual subscription in the first quarter just from [specific savings].",
          type: 'story',
          priority: 'medium',
          reasoning: 'Uses ROI story to justify price',
        },
      ],
      implementation: [
        {
          id: '1',
          text: "Excellent question - this is where we really shine. Our average implementation is [timeframe], but we've had customers up and running in as little as [fastest time]. We provide [white glove support details]. Would a detailed implementation plan be helpful?",
          type: 'data',
          priority: 'high',
          reasoning: 'Provides concrete timeline and differentiates on service',
          followUp: 'Offer to share implementation roadmap',
        },
        {
          id: '2',
          text: "I love that you're thinking ahead. The process is [X simple steps]. We handle [what you do], and all you need to do is [minimal effort]. For example, [recent customer] was fully operational in [timeframe] while their team was still doing their normal work.",
          type: 'story',
          priority: 'high',
          reasoning: 'Simplifies process and uses recent success story',
        },
        {
          id: '3',
          text: "Setup typically takes [timeframe] and includes: [bullet points]. The key is we do the heavy lifting. You won't need to pull your team away from their work. Sound good?",
          type: 'direct',
          priority: 'medium',
          reasoning: 'Clear steps with reassurance about minimal disruption',
        },
      ],
      support: [
        {
          id: '1',
          text: "This is actually one of our biggest differentiators. You get [specific support offerings]. Plus, we have a dedicated CSM who knows your account. Our average response time is [time], and our customer satisfaction score is [score]. What level of support is important to you?",
          type: 'data',
          priority: 'high',
          reasoning: 'Highlights support as competitive advantage with metrics',
        },
        {
          id: '2',
          text: "Great question - support is crucial. We provide [support tiers]. Every customer also gets access to [resources]. One thing our customers love is [unique support feature]. Would you like to meet your potential CSM?",
          type: 'direct',
          priority: 'high',
          reasoning: 'Comprehensive answer with personal touch',
        },
        {
          id: '3',
          text: "We take support seriously. You'll have [support description]. For example, when [Customer] had [issue], we [response] within [timeframe]. Does that level of support meet your expectations?",
          type: 'story',
          priority: 'medium',
          reasoning: 'Proves support quality with real example',
        },
      ],
      technical: [
        {
          id: '1',
          text: "Great technical question. We're built on [technology stack] which means [benefits]. For security, we have [certifications/compliance]. For scale, we handle [impressive metrics]. Do you have specific technical requirements I should address?",
          type: 'data',
          priority: 'high',
          reasoning: 'Demonstrates technical credibility and invites deeper dive',
          followUp: 'Offer to connect with technical team',
        },
        {
          id: '2',
          text: "I can give you the overview, but would it be helpful to have our CTO/Solutions Architect join for 15 minutes? They can dive deep into [specific technical area] and answer any technical questions your team has.",
          type: 'direct',
          priority: 'high',
          reasoning: 'Respects technical complexity and brings in expert',
        },
        {
          id: '3',
          text: "Absolutely. Our architecture is [high-level description]. For example, [Technical Customer] needed [specific requirement], and we were able to [solution]. I can send over our technical documentation. What specific aspects matter most to you?",
          type: 'story',
          priority: 'medium',
          reasoning: 'Provides overview with promise of detail',
        },
      ],
      integration: [
        {
          id: '1',
          text: "Yes! We integrate with [list of integrations]. We have a REST API that's documented at [URL]. Most integrations take [timeframe]. What systems are you using that you'd want to connect?",
          type: 'direct',
          priority: 'high',
          reasoning: 'Directly addresses integration capability',
          followUp: 'Ask about their tech stack',
        },
        {
          id: '2',
          text: "Great question - we're built to be integration-friendly. We currently have [number] pre-built integrations including [popular ones]. Plus our API lets you build custom connections. [Customer] integrated with [unusual system] in [timeframe]. What do you need to connect to?",
          type: 'story',
          priority: 'high',
          reasoning: 'Shows flexibility with proof point',
        },
        {
          id: '3',
          text: "Integration is one of our core strengths. We offer [integration types]. During implementation, our team helps set up all your key integrations. Would a technical integration review be helpful?",
          type: 'data',
          priority: 'medium',
          reasoning: 'Positions integration as strength and offers help',
        },
      ],
    };

    return responseMap[category] || responseMap.product;
  }

  /**
   * Get buying signal from question
   */
  getBuyingSignal(question: Question): 'strong' | 'moderate' | 'weak' | 'none' {
    const strongSignals = [
      'next steps',
      'move forward',
      'get started',
      'how soon',
      'when can',
      'contract',
      'agreement',
      'onboard',
    ];

    const moderateSignals = [
      'implementation',
      'setup',
      'timeline',
      'pricing',
      'payment',
      'support',
      'team',
    ];

    const lowerText = question.text.toLowerCase();

    if (strongSignals.some((signal) => lowerText.includes(signal))) {
      return 'strong';
    }

    if (moderateSignals.some((signal) => lowerText.includes(signal))) {
      return 'moderate';
    }

    if (question.intent === 'interest') {
      return 'moderate';
    }

    return question.intent === 'objection' ? 'none' : 'weak';
  }
}

export const questionAnalyzer = new QuestionAnalyzer();
