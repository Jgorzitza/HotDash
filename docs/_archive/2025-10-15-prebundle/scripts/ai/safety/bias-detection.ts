/**
 * Task AD: AI Bias Detection and Mitigation
 */

export class BiasDetector {
  async detectBias(response: string, context: any) {
    return {
      demographic_bias: this.checkDemographicBias(response),
      language_bias: this.checkLanguageBias(response),
      sentiment_bias: this.checkSentimentBias(response, context),
      recommendation_bias: this.checkRecommendationBias(response),
      mitigation_applied: [],
    };
  }
  
  private checkDemographicBias(text: string) {
    const genderedTerms = ['he', 'she', 'him', 'her', 'his', 'hers'];
    const found = genderedTerms.filter(term => text.toLowerCase().includes(` ${term} `));
    return { detected: found.length > 0, terms: found, severity: found.length > 2 ? 'high' : 'low' };
  }
  
  private checkLanguageBias(text: string) {
    const assumptiveLanguage = ['obviously', 'clearly', 'everyone knows', 'simple'];
    const found = assumptiveLanguage.filter(term => text.toLowerCase().includes(term));
    return { detected: found.length > 0, terms: found, severity: 'medium' };
  }
  
  private checkSentimentBias(text: string, context: any) {
    // Check if response tone varies based on customer attributes
    if (context.customerType === 'vip' && !text.includes('valued')) {
      return { detected: true, type: 'vip_favoritism', severity: 'low' };
    }
    return { detected: false };
  }
  
  private checkRecommendationBias(text: string) {
    // Ensure recommendations aren't always highest-priced items
    const priceTerms = ['premium', 'expensive', 'luxury'];
    const count = priceTerms.filter(term => text.toLowerCase().includes(term)).length;
    return { detected: count > 2, severity: count > 2 ? 'medium' : 'low' };
  }
}

