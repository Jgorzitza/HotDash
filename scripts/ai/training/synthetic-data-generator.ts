/**
 * Task AB: Synthetic Data Generation for Edge Cases
 */

interface EdgeCaseTemplate {
  example: string;
  intent: string;
  expected_behavior: string;
}

interface EdgeCaseTemplates {
  [category: string]: EdgeCaseTemplate[];
}

// Stub LLM implementation
const llm = {
  async generate(prompt: string): Promise<string> {
    return `Generated variation based on: ${prompt.substring(0, 50)}...`;
  }
};

export class SyntheticDataGenerator {
  
  async generateEdgeCases(category: string, count: number = 20) {
    const templates = (EDGE_CASE_TEMPLATES as EdgeCaseTemplates)[category] || [];
    const synthetic = [];
    
    for (const template of templates) {
      for (let i = 0; i < count / templates.length; i++) {
        const variant = await this.generateVariant(template);
        synthetic.push(variant);
      }
    }
    
    return synthetic;
  }
  
  private async generateVariant(template: EdgeCaseTemplate) {
    // Use LLM to create realistic variations
    const prompt = `Create a realistic customer support query variation of: "${template.example}"
    
Variations to include:
- Different phrasing
- Typos or informal language
- Additional context
- Urgent or emotional tone

Keep the core intent: ${template.intent}`;
    
    const variant = await llm.generate(prompt);
    
    return {
      query: variant,
      intent: template.intent,
      expected_behavior: template.expected_behavior,
      synthetic: true,
    };
  }
}

const EDGE_CASE_TEMPLATES = {
  order_status: [
    { example: 'wheres my order', intent: 'order_status', expected_behavior: 'ask_for_order_number' },
    { example: 'ORDER NOT HERE YET!!!', intent: 'order_status', expected_behavior: 'empathize_and_lookup' },
  ],
  refund: [
    { example: 'give me my money back now', intent: 'refund', expected_behavior: 'explain_policy_calmly' },
  ],
};

