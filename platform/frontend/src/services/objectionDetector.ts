/**
 * Objection Detector Service
 * Analyzes customer speech in real-time to detect sales objections
 */

export interface Objection {
  id: string;
  text: string;
  type: 'price' | 'timing' | 'competitor' | 'authority' | 'need' | 'trust';
  timestamp: number;
  confidence: number;
  suggestions: ResponseSuggestion[];
}

export interface ResponseSuggestion {
  id: string;
  text: string;
  type: 'direct' | 'story' | 'question' | 'data';
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
}

export class ObjectionDetector {
  private objectionPatterns = {
    price: {
      keywords: [
        'expensive',
        'cost',
        'price',
        'budget',
        'afford',
        'cheaper',
        'too much',
        'money',
        'investment',
      ],
      patterns: [
        /(?:too|very|really|seems?) (?:expensive|costly|high priced?)/i,
        /(?:can't|cannot|won't) afford/i,
        /(?:over|above|outside) (?:our|my|the) budget/i,
        /(?:cheaper|less expensive) (?:option|alternative|competitor)/i,
      ],
    },
    timing: {
      keywords: [
        'later',
        'next year',
        'next quarter',
        'not ready',
        'too soon',
        'rush',
        'wait',
        'timing',
      ],
      patterns: [
        /(?:not|aren't) ready (?:yet|right now|at this time)/i,
        /(?:maybe|perhaps) (?:next|later|in the future)/i,
        /(?:too|very) (?:soon|early|quick|fast)/i,
        /need (?:more|some) time/i,
      ],
    },
    competitor: {
      keywords: [
        'competitor',
        'alternative',
        'already using',
        'current solution',
        'other vendor',
        'comparison',
      ],
      patterns: [
        /(?:already|currently) (?:using|have|working with)/i,
        /(?:what about|how does this compare to)/i,
        /(?:competitor|alternative) (?:offers|provides|has)/i,
        /(?:why should we|what makes you) (?:switch|choose|different)/i,
      ],
    },
    authority: {
      keywords: [
        'need to discuss',
        'talk to',
        'manager',
        'team',
        'decision maker',
        'approval',
        'boss',
      ],
      patterns: [
        /need to (?:discuss|talk|speak|check) with/i,
        /(?:not|don't have) (?:the |)authority/i,
        /have to (?:ask|get approval from)/i,
        /(?:manager|boss|team) (?:needs to|has to|should) (?:approve|decide)/i,
      ],
    },
    need: {
      keywords: [
        "don't need",
        'not necessary',
        'not a priority',
        'works fine',
        'happy with',
        'satisfied',
      ],
      patterns: [
        /(?:don't|do not) (?:need|require|want)/i,
        /(?:not a |)(?:priority|necessity)/i,
        /(?:works?|working) (?:fine|well|okay) (?:for us|right now)/i,
        /(?:happy|satisfied|content) with (?:current|what we have)/i,
      ],
    },
    trust: {
      keywords: [
        'proven',
        'references',
        'case study',
        'skeptical',
        'unsure',
        'hesitant',
        'doubt',
      ],
      patterns: [
        /(?:not|un)sure (?:if|whether|about)/i,
        /(?:skeptical|doubtful|hesitant) (?:about|of)/i,
        /(?:can you|do you have) (?:prove|show|demonstrate)/i,
        /(?:references|testimonials|case studies|proof)/i,
      ],
    },
  };

  /**
   * Analyze text for objections
   */
  detectObjections(text: string, speaker: 'client' | 'salesperson'): Objection | null {
    // Only analyze client speech
    if (speaker !== 'client') return null;

    const lowerText = text.toLowerCase();

    // Check each objection type
    for (const [type, config] of Object.entries(this.objectionPatterns)) {
      // Check keywords
      const keywordMatches = config.keywords.filter((keyword) =>
        lowerText.includes(keyword.toLowerCase())
      );

      // Check patterns
      const patternMatches = config.patterns.filter((pattern) => pattern.test(text));

      const totalMatches = keywordMatches.length + patternMatches.length * 2;

      if (totalMatches >= 2) {
        // Calculate confidence
        const confidence = Math.min(0.95, 0.6 + totalMatches * 0.1);

        return {
          id: Date.now().toString(),
          text,
          type: type as Objection['type'],
          timestamp: Date.now(),
          confidence,
          suggestions: this.generateSuggestions(type as Objection['type'], text),
        };
      }
    }

    return null;
  }

  /**
   * Generate response suggestions based on objection type
   */
  private generateSuggestions(
    type: Objection['type'],
    objectionText: string
  ): ResponseSuggestion[] {
    const suggestionMap: Record<Objection['type'], ResponseSuggestion[]> = {
      price: [
        {
          id: '1',
          text: "I completely understand budget considerations. Let me show you the ROI our customers typically see - most break even within 3 months and see 300% ROI in the first year. Would a cost-benefit analysis be helpful?",
          type: 'data',
          priority: 'high',
          reasoning: 'Addresses price with concrete value and ROI data',
        },
        {
          id: '2',
          text: "That's a fair concern. Can you share what you're currently spending on this problem? I want to make sure we're comparing the total cost, including time and inefficiency.",
          type: 'question',
          priority: 'high',
          reasoning: 'Reframes from price to total cost of ownership',
        },
        {
          id: '3',
          text: "Many of our best customers had the same initial reaction. What they discovered was that the cost of NOT solving this problem was actually much higher. One client was losing $50K per month in inefficiency alone.",
          type: 'story',
          priority: 'medium',
          reasoning: 'Uses social proof and real cost of inaction',
        },
      ],
      timing: [
        {
          id: '1',
          text: "I appreciate you being upfront about timing. What I'm hearing is you want to be thorough. What if we could get you started with a pilot program that requires minimal commitment while you evaluate?",
          type: 'question',
          priority: 'high',
          reasoning: 'Offers low-risk path forward while respecting their pace',
        },
        {
          id: '2',
          text: "That makes sense. Just curious - what needs to happen between now and then for you to feel ready? Maybe we can help with some of those pieces.",
          type: 'question',
          priority: 'high',
          reasoning: 'Uncovers real blockers and positions you as helper',
        },
        {
          id: '3',
          text: "I understand. One thing to consider - our onboarding typically takes 4-6 weeks, so if you're planning for next quarter, we'd actually need to start the process now to be ready. Does that timeline make sense?",
          type: 'data',
          priority: 'medium',
          reasoning: 'Creates urgency based on implementation reality',
        },
      ],
      competitor: [
        {
          id: '1',
          text: "I'm glad you're doing your due diligence! Many of our customers came from [Competitor]. What they consistently tell us is that we excel at [key differentiator]. What matters most to you in a solution?",
          type: 'question',
          priority: 'high',
          reasoning: 'Respects their process while steering to your strengths',
        },
        {
          id: '2',
          text: "Great question. Rather than me telling you why we're better, let me ask - what's working well with your current solution, and where are you hitting limitations? That'll help me show you exactly where we add value.",
          type: 'question',
          priority: 'high',
          reasoning: 'Uncovers pain points and positions against them',
        },
        {
          id: '3',
          text: "We actually have several customers who switched from [Competitor]. The #1 reason they cite is our [specific feature]. For example, [Customer Name] was able to [specific outcome]. Would a reference call be valuable?",
          type: 'story',
          priority: 'medium',
          reasoning: 'Provides social proof from switchers',
        },
      ],
      authority: [
        {
          id: '1',
          text: "Absolutely, I appreciate you bringing them into the process. Would it be helpful if I prepared a brief summary you can share with your team? What key concerns would they want addressed?",
          type: 'question',
          priority: 'high',
          reasoning: 'Makes it easy for them to champion internally',
        },
        {
          id: '2',
          text: "That makes perfect sense. In my experience, it's helpful to have the decision maker involved early. Would it make sense to schedule a quick call with your [manager/team] so I can answer their questions directly?",
          type: 'question',
          priority: 'high',
          reasoning: 'Gets access to real decision maker',
        },
        {
          id: '3',
          text: "I totally understand. What I've found helpful is giving you everything you need to make a compelling case. What would a 'yes' look like from their perspective? Let's make sure we address those points.",
          type: 'question',
          priority: 'medium',
          reasoning: 'Arms them with ammunition for internal selling',
        },
      ],
      need: [
        {
          id: '1',
          text: "I hear you saying it's working fine. Can I ask - what would 'great' look like? Sometimes we don't realize how much time we're spending on workarounds until we see a better way.",
          type: 'question',
          priority: 'high',
          reasoning: 'Helps them envision better state beyond "fine"',
        },
        {
          id: '2',
          text: "That's fair. Let me ask you this - if you could wave a magic wand and improve one thing about how you [specific process], what would it be?",
          type: 'question',
          priority: 'high',
          reasoning: 'Uncovers latent pain points',
        },
        {
          id: '3',
          text: "I appreciate your honesty. Most of our customers said the same thing before they saw the impact. One team thought they were doing fine until they realized they were spending 10 hours per week on tasks we automate. Would a 15-minute demo change your perspective?",
          type: 'story',
          priority: 'medium',
          reasoning: 'Uses before/after story to create urgency',
        },
      ],
      trust: [
        {
          id: '1',
          text: "I completely understand wanting proof. We have [X] customers in your industry who've seen [specific results]. Would it be helpful to connect you with [similar company name] who implemented this last quarter?",
          type: 'data',
          priority: 'high',
          reasoning: 'Provides concrete social proof and reference',
        },
        {
          id: '2',
          text: "That's exactly why we offer a 30-day pilot program. You can test this with real data, and if you don't see [specific outcome], we'll give you a full refund. What metrics would you want to see to feel confident?",
          type: 'question',
          priority: 'high',
          reasoning: 'Removes risk and defines success criteria',
        },
        {
          id: '3',
          text: "I appreciate your skepticism - it shows you're thorough. We have a case study from [Company Name] that addressed the exact same concerns. They saw [specific results] in [timeframe]. Can I send that over?",
          type: 'story',
          priority: 'medium',
          reasoning: 'Addresses doubt with documented proof',
        },
      ],
    };

    return suggestionMap[type] || [];
  }

  /**
   * Get objection type name
   */
  getObjectionTypeName(type: Objection['type']): string {
    const names = {
      price: 'Price/Budget',
      timing: 'Timing',
      competitor: 'Competition',
      authority: 'Decision Authority',
      need: 'Perceived Need',
      trust: 'Trust/Proof',
    };
    return names[type];
  }

  /**
   * Get handling strategy for objection type
   */
  getHandlingStrategy(type: Objection['type']): string {
    const strategies = {
      price:
        'Focus on value and ROI. Reframe from cost to investment. Use data and case studies.',
      timing: 'Uncover real blockers. Create urgency. Offer low-risk pilot programs.',
      competitor: 'Differentiate on strengths. Get specific pain points. Offer comparisons.',
      authority: 'Get access to decision maker. Arm champion with materials.',
      need: 'Uncover latent pain. Paint vision of better state. Show hidden costs.',
      trust: 'Provide social proof. Offer risk reversal. Share case studies.',
    };
    return strategies[type];
  }
}

export const objectionDetector = new ObjectionDetector();
