/**
 * Agent Collaboration Coordinator
 * 
 * Orchestrates collaboration between multiple agents to solve complex tasks.
 * Implements patterns like sequential handoff, parallel consultation, and consensus.
 */

import type { Agent } from '@openai/agents';

export interface CollaborationTask {
  id: string;
  type: 'sequential' | 'parallel' | 'consensus';
  agents: string[];
  input: string;
  context: Record<string, any>;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  results: AgentResult[];
  finalOutput?: any;
  startTime?: Date;
  endTime?: Date;
}

export interface AgentResult {
  agentName: string;
  output: any;
  confidence: number;
  timestamp: Date;
  durationMs: number;
}

/**
 * Coordinates collaboration between multiple agents
 */
export class CollaborationCoordinator {
  private tasks = new Map<string, CollaborationTask>();

  /**
   * Create a sequential collaboration task
   * Each agent processes the output of the previous agent
   */
  async sequential(
    agents: string[],
    input: string,
    context: Record<string, any> = {}
  ): Promise<CollaborationTask> {
    const task: CollaborationTask = {
      id: `seq-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type: 'sequential',
      agents,
      input,
      context,
      status: 'pending',
      results: [],
      startTime: new Date(),
    };

    this.tasks.set(task.id, task);
    console.log(`[Collaboration] Sequential task created: ${task.id} (${agents.join(' → ')})`);

    return task;
  }

  /**
   * Create a parallel collaboration task
   * All agents process the same input simultaneously
   */
  async parallel(
    agents: string[],
    input: string,
    context: Record<string, any> = {}
  ): Promise<CollaborationTask> {
    const task: CollaborationTask = {
      id: `par-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type: 'parallel',
      agents,
      input,
      context,
      status: 'pending',
      results: [],
      startTime: new Date(),
    };

    this.tasks.set(task.id, task);
    console.log(`[Collaboration] Parallel task created: ${task.id} (${agents.join(', ')})`);

    return task;
  }

  /**
   * Create a consensus collaboration task
   * Agents vote on the best response
   */
  async consensus(
    agents: string[],
    input: string,
    context: Record<string, any> = {}
  ): Promise<CollaborationTask> {
    const task: CollaborationTask = {
      id: `con-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type: 'consensus',
      agents,
      input,
      context,
      status: 'pending',
      results: [],
      startTime: new Date(),
    };

    this.tasks.set(task.id, task);
    console.log(`[Collaboration] Consensus task created: ${task.id} (${agents.join(', ')})`);

    return task;
  }

  /**
   * Add agent result to task
   */
  addResult(taskId: string, result: AgentResult): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.results.push(result);
    console.log(`[Collaboration] Result added to ${taskId} from ${result.agentName}`);

    // Check if task is complete
    if (task.results.length === task.agents.length) {
      this.completeTask(taskId);
    }
  }

  /**
   * Mark task as complete and generate final output
   */
  private completeTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = 'completed';
    task.endTime = new Date();

    // Generate final output based on collaboration type
    switch (task.type) {
      case 'sequential':
        // Last agent's output is the final output
        task.finalOutput = task.results[task.results.length - 1]?.output;
        break;

      case 'parallel':
        // Combine all outputs
        task.finalOutput = {
          type: 'parallel',
          results: task.results.map(r => ({
            agent: r.agentName,
            output: r.output,
            confidence: r.confidence,
          })),
        };
        break;

      case 'consensus':
        // Select output with highest confidence
        const bestResult = task.results.reduce((best, current) => {
          return current.confidence > best.confidence ? current : best;
        }, task.results[0]);
        task.finalOutput = {
          type: 'consensus',
          selected: bestResult.agentName,
          output: bestResult.output,
          confidence: bestResult.confidence,
          alternatives: task.results
            .filter(r => r.agentName !== bestResult.agentName)
            .map(r => ({ agent: r.agentName, confidence: r.confidence })),
        };
        break;
    }

    const duration = task.endTime.getTime() - (task.startTime?.getTime() || 0);
    console.log(`[Collaboration] Task ${taskId} completed in ${duration}ms`);
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): CollaborationTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get all active tasks
   */
  getActiveTasks(): CollaborationTask[] {
    return Array.from(this.tasks.values()).filter(
      t => t.status === 'pending' || t.status === 'in_progress'
    );
  }

  /**
   * Get completed tasks
   */
  getCompletedTasks(limit: number = 10): CollaborationTask[] {
    return Array.from(this.tasks.values())
      .filter(t => t.status === 'completed')
      .sort((a, b) => (b.endTime?.getTime() || 0) - (a.endTime?.getTime() || 0))
      .slice(0, limit);
  }

  /**
   * Clean up old tasks
   */
  cleanup(maxAgeMs: number = 24 * 60 * 60 * 1000): number {
    const now = Date.now();
    let removed = 0;

    for (const [taskId, task] of this.tasks.entries()) {
      const age = now - (task.startTime?.getTime() || 0);
      if (age > maxAgeMs && task.status === 'completed') {
        this.tasks.delete(taskId);
        removed++;
      }
    }

    return removed;
  }
}

/**
 * Common collaboration patterns
 */
export const CollaborationPatterns = {
  /**
   * Triage → Specialist pattern
   * Triage agent classifies, then hands off to specialist
   */
  triageAndSpecialize: async (coordinator: CollaborationCoordinator, input: string) => {
    return coordinator.sequential(['Triage', 'specialist'], input, {
      pattern: 'triage_and_specialize',
    });
  },

  /**
   * Multiple specialists review in parallel
   * Useful for complex questions requiring different expertise
   */
  parallelReview: async (coordinator: CollaborationCoordinator, input: string, specialists: string[]) => {
    return coordinator.parallel(specialists, input, {
      pattern: 'parallel_review',
    });
  },

  /**
   * Consensus for sensitive actions
   * Multiple agents must agree before taking action
   */
  consensusAction: async (coordinator: CollaborationCoordinator, input: string, agents: string[]) => {
    return coordinator.consensus(agents, input, {
      pattern: 'consensus_action',
      requiresApproval: true,
    });
  },

  /**
   * Draft → Review → Send pattern
   * One agent drafts, another reviews, final approval before sending
   */
  draftReviewSend: async (coordinator: CollaborationCoordinator, input: string) => {
    return coordinator.sequential(['Order Support', 'Quality Checker', 'Sender'], input, {
      pattern: 'draft_review_send',
    });
  },
};

// Export singleton instance
export const collaborationCoordinator = new CollaborationCoordinator();

// Run cleanup every 6 hours
setInterval(() => {
  const removed = collaborationCoordinator.cleanup();
  if (removed > 0) {
    console.log(`[Collaboration] Cleaned up ${removed} old tasks`);
  }
}, 6 * 60 * 60 * 1000);

