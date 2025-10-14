#!/usr/bin/env tsx
/**
 * Chatwoot Agent Assignment Automation Script
 * 
 * Automates assignment of conversations to agents based on:
 * - Round-robin distribution
 * - Load balancing (fewest active conversations)
 * - Skill-based routing (optional)
 * 
 * Usage:
 *   export CHATWOOT_API_TOKEN_STAGING="..."
 *   export CHATWOOT_ACCOUNT_ID_STAGING="1"
 *   tsx scripts/chatwoot/assign-conversations.ts [--strategy round-robin|load-balanced]
 */

interface Agent {
  id: number;
  name: string;
  email: string;
  role: string;
  availability_status: string;
  confirmed: boolean;
}

interface Conversation {
  id: number;
  status: string;
  assignee: any;
  inbox_id: number;
  messages_count: number;
  created_at: string;
}

const CHATWOOT_BASE_URL = 'https://hotdash-chatwoot.fly.dev';
const CHATWOOT_API_TOKEN = process.env.CHATWOOT_API_TOKEN_STAGING;
const CHATWOOT_ACCOUNT_ID = process.env.CHATWOOT_ACCOUNT_ID_STAGING || '1';

type AssignmentStrategy = 'round-robin' | 'load-balanced';

class ChatwootAssignmentService {
  private headers: Record<string, string>;
  private baseUrl: string;
  private accountId: string;

  constructor() {
    if (!CHATWOOT_API_TOKEN) {
      throw new Error('CHATWOOT_API_TOKEN_STAGING not found in environment');
    }

    this.headers = {
      'Content-Type': 'application/json',
      'api_access_token': CHATWOOT_API_TOKEN,
    };
    this.baseUrl = CHATWOOT_BASE_URL;
    this.accountId = CHATWOOT_ACCOUNT_ID;
  }

  async getAgents(): Promise<Agent[]> {
    const url = `${this.baseUrl}/api/v1/accounts/${this.accountId}/agents`;
    const res = await fetch(url, { headers: this.headers });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch agents: ${res.status} ${await res.text()}`);
    }

    const agents = await res.json() as Agent[];
    
    // Filter to only available, confirmed agents
    return agents.filter(
      (agent) => agent.confirmed && agent.availability_status !== 'offline'
    );
  }

  async getConversations(status: string = 'open'): Promise<Conversation[]> {
    const url = `${this.baseUrl}/api/v1/accounts/${this.accountId}/conversations?status=${status}`;
    const res = await fetch(url, { headers: this.headers });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch conversations: ${res.status} ${await res.text()}`);
    }

    const data = await res.json();
    return data.data.payload as Conversation[];
  }

  async getAgentConversations(agentId: number): Promise<Conversation[]> {
    const url = `${this.baseUrl}/api/v1/accounts/${this.accountId}/conversations?assignee_type=assigned&assignee_id=${agentId}`;
    const res = await fetch(url, { headers: this.headers });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch agent conversations: ${res.status} ${await res.text()}`);
    }

    const data = await res.json();
    return data.data.payload as Conversation[];
  }

  async assignConversation(conversationId: number, agentId: number): Promise<boolean> {
    const url = `${this.baseUrl}/api/v1/accounts/${this.accountId}/conversations/${conversationId}/assignments`;
    const res = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ assignee_id: agentId }),
    });

    return res.ok;
  }

  async assignUnassignedConversations(strategy: AssignmentStrategy = 'load-balanced'): Promise<void> {
    console.log('🤖 Chatwoot Auto-Assignment Starting...');
    console.log(`📋 Strategy: ${strategy}\n`);

    // Get available agents
    const agents = await this.getAgents();
    
    if (agents.length === 0) {
      console.log('⚠️  No available agents found. All agents are offline or not confirmed.');
      return;
    }

    console.log(`✅ Found ${agents.length} available agent(s):`);
    agents.forEach((agent) => console.log(`   - ${agent.name} (${agent.email}) [${agent.availability_status}]`));
    console.log('');

    // Get unassigned conversations
    const allConversations = await this.getConversations('open');
    const unassigned = allConversations.filter((conv) => !conv.assignee);

    if (unassigned.length === 0) {
      console.log('✨ All conversations are already assigned. Nothing to do!');
      return;
    }

    console.log(`📬 Found ${unassigned.length} unassigned conversation(s)\n`);

    // Assignment logic based on strategy
    const assignments: { conversationId: number; agentId: number; agentName: string }[] = [];

    if (strategy === 'round-robin') {
      // Simple round-robin distribution
      unassigned.forEach((conv, index) => {
        const agent = agents[index % agents.length];
        assignments.push({
          conversationId: conv.id,
          agentId: agent.id,
          agentName: agent.name,
        });
      });
    } else if (strategy === 'load-balanced') {
      // Load-balanced: assign to agent with fewest active conversations
      const agentLoads = new Map<number, number>();

      // Initialize loads
      for (const agent of agents) {
        const agentConvs = await this.getAgentConversations(agent.id);
        agentLoads.set(agent.id, agentConvs.length);
      }

      // Assign to least loaded agent
      for (const conv of unassigned) {
        // Find agent with minimum load
        let minLoad = Infinity;
        let selectedAgent: Agent | null = null;

        for (const agent of agents) {
          const load = agentLoads.get(agent.id) || 0;
          if (load < minLoad) {
            minLoad = load;
            selectedAgent = agent;
          }
        }

        if (selectedAgent) {
          assignments.push({
            conversationId: conv.id,
            agentId: selectedAgent.id,
            agentName: selectedAgent.name,
          });

          // Increment load for next assignment
          agentLoads.set(selectedAgent.id, (agentLoads.get(selectedAgent.id) || 0) + 1);
        }
      }
    }

    // Execute assignments
    console.log('🔄 Assigning conversations...\n');
    const results = {
      successful: [] as number[],
      failed: [] as { id: number; error: string }[],
    };

    for (const assignment of assignments) {
      try {
        const success = await this.assignConversation(
          assignment.conversationId,
          assignment.agentId
        );

        if (success) {
          results.successful.push(assignment.conversationId);
          console.log(`  ✅ Conversation ${assignment.conversationId} → ${assignment.agentName}`);
        } else {
          results.failed.push({
            id: assignment.conversationId,
            error: 'API returned non-OK status',
          });
          console.log(`  ❌ Failed to assign conversation ${assignment.conversationId}`);
        }
      } catch (error) {
        results.failed.push({
          id: assignment.conversationId,
          error: error instanceof Error ? error.message : String(error),
        });
        console.log(`  ❌ Error assigning conversation ${assignment.conversationId}: ${error}`);
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Assignment Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Successfully assigned: ${results.successful.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    
    if (results.failed.length > 0) {
      console.log('\nFailed conversation IDs:');
      results.failed.forEach(({ id, error }) => console.log(`   - ${id}: ${error}`));
    }

    console.log('='.repeat(60));
    console.log('\n🎉 Auto-assignment complete!\n');
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const strategyArg = args.find((arg) => arg.startsWith('--strategy='));
  const strategy: AssignmentStrategy = strategyArg
    ? (strategyArg.split('=')[1] as AssignmentStrategy)
    : 'load-balanced';

  if (!['round-robin', 'load-balanced'].includes(strategy)) {
    console.error('❌ Invalid strategy. Use: round-robin or load-balanced');
    process.exit(1);
  }

  try {
    const service = new ChatwootAssignmentService();
    await service.assignUnassignedConversations(strategy);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { ChatwootAssignmentService };

