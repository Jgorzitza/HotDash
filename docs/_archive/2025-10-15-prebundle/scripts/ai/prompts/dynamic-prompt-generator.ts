/**
 * Task P: Dynamic Prompt Generation Based on Context
 */

export class DynamicPromptGenerator {
  
  generate(basePrompt: string, context: {
    customerType: 'standard' | 'vip';
    sentiment: 'positive' | 'neutral' | 'negative';
    complexity: 'simple' | 'complex';
    history: string[];
  }): string {
    let prompt = basePrompt;
    
    // Add VIP handling
    if (context.customerType === 'vip') {
      prompt += '\n\nIMPORTANT: This is a VIP customer. Provide premium service and escalate to supervisor if needed.';
    }
    
    // Adjust for sentiment
    if (context.sentiment === 'negative') {
      prompt += '\n\nCustomer appears frustrated. Use extra empathy and offer proactive solutions.';
    }
    
    // Add conversation history summary
    if (context.history.length > 0) {
      prompt += `\n\nConversation context: ${context.history.slice(-3).join('. ')}`;
    }
    
    return prompt;
  }
}

