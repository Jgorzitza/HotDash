/**
 * Task M: Agent Specialization and Routing Logic
 */

// Type definitions for agent routing
interface Agent {
  handle(request: any): Promise<any>;
  execute?(task: any): Promise<any>;
}

interface AgentEntry {
  agent: Agent;
  capabilities: string[];
}

type IntentMap = {
  [key: string]: string;
};

export class AgentRouter {
  private agentRegistry = new Map<string, AgentEntry>();
  
  registerAgent(name: string, agent: Agent, capabilities: string[]) {
    this.agentRegistry.set(name, { agent, capabilities });
  }
  
  route(intent: string, context: any): Agent | undefined {
    // Intent-based routing with fallback
    const intentMap: IntentMap = {
      'order_status': 'OrderSupport',
      'refund': 'OrderSupport',
      'product_question': 'ProductQA',
      'technical': 'TechnicalSupport',
    };
    
    const agentName = intentMap[intent] || 'Triage';
    const entry = this.agentRegistry.get(agentName);
    return entry?.agent || this.agentRegistry.get('Triage')?.agent;
  }
  
  // Capability-based routing
  routeByCapability(requiredCapability: string): Agent[] {
    return Array.from(this.agentRegistry.values())
      .filter((a: AgentEntry) => a.capabilities.includes(requiredCapability))
      .map((a: AgentEntry) => a.agent);
  }
}

export const agentRouter = new AgentRouter();

