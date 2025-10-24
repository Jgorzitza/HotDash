/**
 * Action Queue Service
 * 
 * Provides business logic for managing the Action Queue system
 * Implements standardized contract with Top-10 ranking and operator approval workflow
 */

import prisma from "~/db.server";
import type { ActionQueueItem } from "~/lib/growth-engine/action-queue";

export interface ActionQueueCreateInput {
  type: string;
  target: string;
  draft: string;
  evidence: {
    mcp_request_ids: string[];
    dataset_links: string[];
    telemetry_refs: string[];
  };
  expected_impact: {
    metric: string;
    delta: number;
    unit: string;
  };
  confidence: number;
  ease: 'simple' | 'medium' | 'hard';
  risk_tier: 'policy' | 'safety' | 'perf' | 'none';
  can_execute: boolean;
  rollback_plan: string;
  freshness_label: string;
  agent: string;
}

export interface ActionQueueUpdateInput {
  status?: 'pending' | 'approved' | 'rejected' | 'executed';
  approved_by?: string;
  approved_at?: Date;
  executed_by?: string;
  executed_at?: Date;
  execution_result?: any;
}

export class ActionQueueService {
  /**
   * Create a new action in the queue
   */
  static async createAction(input: ActionQueueCreateInput): Promise<ActionQueueItem> {
    try {
      const query = `
        INSERT INTO action_queue (
          type, target, draft, evidence, expected_impact, confidence, 
          ease, risk_tier, can_execute, rollback_plan, freshness_label, agent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;
      
      const params = [
        input.type,
        input.target,
        input.draft,
        JSON.stringify(input.evidence),
        JSON.stringify(input.expected_impact),
        input.confidence,
        input.ease,
        input.risk_tier,
        input.can_execute,
        input.rollback_plan,
        input.freshness_label,
        input.agent
      ];
      
      const { rows } = await prisma.query(query, params);
      return this.mapDbRowToActionQueueItem(rows[0]);
    } catch (error) {
      console.error('Error creating action:', error);
      throw new Error('Failed to create action');
    }
  }

  /**
   * Get actions from the queue with filtering, sorting, and pagination
   */
  static async getActions(options: {
    limit?: number;
    offset?: number;
    status?: string;
    agent?: string;
    type?: string;
    risk_tier?: string;
    priority?: string;
    category?: string;
    sort_by?: string;
    sort_order?: string;
  } = {}): Promise<ActionQueueItem[]> {
    try {
      const {
        limit = 10,
        offset = 0,
        status = 'pending',
        agent,
        type,
        risk_tier,
        priority,
        category,
        sort_by = 'score',
        sort_order = 'desc'
      } = options;

      // Build where clause
      const where: any = { status };
      if (agent) where.agent = agent;
      if (type) where.type = type;
      if (risk_tier) where.risk_tier = risk_tier;

      // Build orderBy clause
      const orderBy: any = {};
      const validSortFields = ['score', 'confidence', 'created_at', 'expected_impact'];
      const sortField = validSortFields.includes(sort_by) ? sort_by : 'score';
      orderBy[sortField] = sort_order === 'asc' ? 'asc' : 'desc';

      const actions = await prisma.action_queue.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset
      });

      return actions.map(row => this.mapDbRowToActionQueueItem(row));
    } catch (error) {
      console.error('Error fetching actions:', error);
      throw new Error('Failed to fetch actions');
    }
  }

  /**
   * Get count of actions matching filters
   */
  static async getActionCount(options: {
    status?: string;
    agent?: string;
    type?: string;
    risk_tier?: string;
    priority?: string;
    category?: string;
  } = {}): Promise<number> {
    try {
      const {
        status = 'pending',
        agent,
        type,
        risk_tier
      } = options;

      const where: any = { status };
      if (agent) where.agent = agent;
      if (type) where.type = type;
      if (risk_tier) where.risk_tier = risk_tier;

      return await prisma.action_queue.count({ where });
    } catch (error) {
      console.error('Error counting actions:', error);
      throw new Error('Failed to count actions');
    }
  }

  /**
   * Get top 10 actions by score (for the main queue view)
   */
  static async getTopActions(): Promise<ActionQueueItem[]> {
    return this.getActions({ limit: 10, status: 'pending' });
  }

  /**
   * Get action by ID
   */
  static async getActionById(id: string): Promise<ActionQueueItem | null> {
    try {
      const { rows } = await prisma.query(
        'SELECT * FROM action_queue WHERE id = $1',
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return this.mapDbRowToActionQueueItem(rows[0]);
    } catch (error) {
      console.error('Error fetching action by ID:', error);
      throw new Error('Failed to fetch action');
    }
  }

  /**
   * Update action status and metadata
   */
  static async updateAction(id: string, updates: ActionQueueUpdateInput): Promise<ActionQueueItem> {
    try {
      const updateFields: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (updates.status !== undefined) {
        updateFields.push(`status = $${paramIndex}`);
        params.push(updates.status);
        paramIndex++;
      }

      if (updates.approved_by !== undefined) {
        updateFields.push(`approved_by = $${paramIndex}`);
        params.push(updates.approved_by);
        paramIndex++;
      }

      if (updates.approved_at !== undefined) {
        updateFields.push(`approved_at = $${paramIndex}`);
        params.push(updates.approved_at);
        paramIndex++;
      }

      if (updates.executed_by !== undefined) {
        updateFields.push(`executed_by = $${paramIndex}`);
        params.push(updates.executed_by);
        paramIndex++;
      }

      if (updates.executed_at !== undefined) {
        updateFields.push(`executed_at = $${paramIndex}`);
        params.push(updates.executed_at);
        paramIndex++;
      }

      if (updates.execution_result !== undefined) {
        updateFields.push(`execution_result = $${paramIndex}`);
        params.push(JSON.stringify(updates.execution_result));
        paramIndex++;
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      updateFields.push(`updated_at = NOW()`);
      params.push(id);

      const query = `
        UPDATE action_queue 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const { rows } = await prisma.query(query, params);
      
      if (rows.length === 0) {
        throw new Error('Action not found');
      }

      return this.mapDbRowToActionQueueItem(rows[0]);
    } catch (error) {
      console.error('Error updating action:', error);
      throw new Error('Failed to update action');
    }
  }

  /**
   * Approve an action
   */
  static async approveAction(id: string, operatorId: string): Promise<ActionQueueItem> {
    return this.updateAction(id, {
      status: 'approved',
      approved_by: operatorId,
      approved_at: new Date()
    });
  }

  /**
   * Reject an action
   */
  static async rejectAction(id: string, operatorId: string): Promise<ActionQueueItem> {
    return this.updateAction(id, {
      status: 'rejected',
      approved_by: operatorId,
      approved_at: new Date()
    });
  }

  /**
   * Delete an action
   */
  static async deleteAction(id: string): Promise<void> {
    try {
      await prisma.action_queue.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error deleting action:', error);
      throw new Error('Failed to delete action');
    }
  }

  /**
   * Execute an approved action
   */
  static async executeAction(id: string, operatorId: string): Promise<ActionQueueItem> {
    // First check if action is approved
    const action = await this.getActionById(id);
    if (!action) {
      throw new Error('Action not found');
    }
    
    if (action.status !== 'approved') {
      throw new Error('Action must be approved before execution');
    }

    // Execute the action (this would call the appropriate service based on type)
    const executionResult = await this.executeActionByType(action);

    // Update the action with execution result
    return this.updateAction(id, {
      status: 'executed',
      executed_by: operatorId,
      executed_at: new Date(),
      execution_result: executionResult
    });
  }

  /**
   * Execute action based on type
   */
  private static async executeActionByType(action: ActionQueueItem): Promise<any> {
    // This would contain the actual execution logic for each action type
    // For now, return a mock result
    return {
      success: true,
      message: `Executed ${action.type} action for ${action.target}`,
      timestamp: new Date().toISOString(),
      execution_id: `exec_${Date.now()}`
    };
  }

  /**
   * Get action queue statistics
   */
  static async getStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    executed: number;
    rejected: number;
  }> {
    try {
      const { rows } = await prisma.query(`
        SELECT 
          status,
          COUNT(*) as count
        FROM action_queue 
        GROUP BY status
      `);

      const stats = {
        total: 0,
        pending: 0,
        approved: 0,
        executed: 0,
        rejected: 0
      };

      rows.forEach(row => {
        stats.total += parseInt(row.count);
        stats[row.status] = parseInt(row.count);
      });

      return stats;
    } catch (error) {
      console.error('Error fetching action queue stats:', error);
      throw new Error('Failed to fetch stats');
    }
  }

  /**
   * Map database row to ActionQueueItem
   */
  private static mapDbRowToActionQueueItem(row: any): ActionQueueItem {
    return {
      id: row.id,
      type: row.type,
      target: row.target,
      draft: row.draft,
      evidence: typeof row.evidence === 'string' ? JSON.parse(row.evidence) : row.evidence,
      expected_impact: typeof row.expected_impact === 'string' ? JSON.parse(row.expected_impact) : row.expected_impact,
      confidence: parseFloat(row.confidence),
      ease: row.ease,
      risk_tier: row.risk_tier,
      can_execute: row.can_execute,
      rollback_plan: row.rollback_plan,
      freshness_label: row.freshness_label,
      agent: row.agent,
      score: row.score ? parseFloat(row.score) : 0,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      approved_at: row.approved_at,
      approved_by: row.approved_by,
      executed_at: row.executed_at,
      executed_by: row.executed_by,
      execution_result: row.execution_result
    };
  }
}
