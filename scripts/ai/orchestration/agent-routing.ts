/**
 * Task M: Agent Specialization and Routing Logic
 */

export class AgentRouter {
  private agentRegistry = new Map<string, Agent>();
  
  registerAgent(name: string, agent: Agent, capabilities: string[]) {
    this.agentRegistry.set(name, { agent, capabilities });
  }
  
  route(intent: string, context: any): Agent {
    // Intent-based routing with fallback
    const intentMap = {
      'order_status': 'OrderSupport',
      'refund': 'OrderSupport',
      'product_question': 'ProductQA',
      'technical': 'TechnicalSupport',
    };
    
    const agentName = intentMap[intent] || 'Triage';
    return this.agentRegistry.get(agentName)?.agent || this.agentRegistry.get('Triage').agent;
  }
  
  // Capability-based routing
  routeByCapability(requiredCapability: string): Agent[] {
    return Array.from(this.agentRegistry.values())
      .filter(a => a.capabilities.includes(requiredCapability))
      .map(a => a.agent);
  }
}

export const agentRouter = new AgentRouter();

