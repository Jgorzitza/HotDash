/**
 * Content Approval Workflow Service
 * 
 * Manages content approval workflow including:
 * - Content review queue
 * - Approval notifications
 * - Version control for approved content
 * - Integration with scheduling service
 */

import prisma from "~/prisma.server";
import { SchedulingService } from "./scheduling.service";

export interface ContentApproval {
  id: string;
  content_entry_id?: string;
  scheduled_content_id?: string;
  content_type: 'social_post' | 'blog_post' | 'product_description' | 'email_campaign';
  title: string;
  content: string;
  status: 'pending_review' | 'approved' | 'rejected' | 'changes_requested';
  submitted_by: string;
  submitted_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  requested_changes?: string;
  version: number;
  previous_version_id?: string;
  metadata?: Record<string, any>;
}

export interface ApprovalStats {
  pending_review: number;
  approved_today: number;
  rejected_today: number;
  average_review_time_minutes: number;
}

export class ContentApprovalWorkflowService {
  /**
   * Submit content for approval
   */
  static async submitForApproval(input: {
    content_entry_id?: string;
    scheduled_content_id?: string;
    content_type: 'social_post' | 'blog_post' | 'product_description' | 'email_campaign';
    title: string;
    content: string;
    submitted_by: string;
    metadata?: Record<string, any>;
  }): Promise<ContentApproval> {
    try {
      // Check if there's a previous version
      let version = 1;
      let previous_version_id = null;

      if (input.content_entry_id) {
        const { rows } = await prisma.query(
          `SELECT id, version FROM content_approvals 
           WHERE content_entry_id = $1 
           ORDER BY version DESC LIMIT 1`,
          [input.content_entry_id]
        );
        
        if (rows.length > 0) {
          version = rows[0].version + 1;
          previous_version_id = rows[0].id;
        }
      }

      const query = `
        INSERT INTO content_approvals (
          content_entry_id, scheduled_content_id, content_type, title, content,
          status, submitted_by, version, previous_version_id, metadata
        ) VALUES ($1, $2, $3, $4, $5, 'pending_review', $6, $7, $8, $9)
        RETURNING *
      `;

      const params = [
        input.content_entry_id || null,
        input.scheduled_content_id || null,
        input.content_type,
        input.title,
        input.content,
        input.submitted_by,
        version,
        previous_version_id,
        JSON.stringify(input.metadata || {})
      ];

      const { rows } = await prisma.query(query, params);
      return this.mapDbRowToContentApproval(rows[0]);
    } catch (error) {
      console.error('Error submitting content for approval:', error);
      throw new Error('Failed to submit content for approval');
    }
  }

  /**
   * Get approval by ID
   */
  static async getApprovalById(id: string): Promise<ContentApproval | null> {
    try {
      const { rows } = await prisma.query(
        'SELECT * FROM content_approvals WHERE id = $1',
        [id]
      );

      if (rows.length === 0) {
        return null;
      }

      return this.mapDbRowToContentApproval(rows[0]);
    } catch (error) {
      console.error('Error fetching approval:', error);
      throw new Error('Failed to fetch approval');
    }
  }

  /**
   * Get pending approvals
   */
  static async getPendingApprovals(options: {
    content_type?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ items: ContentApproval[]; total: number }> {
    try {
      const { content_type, limit = 50, offset = 0 } = options;

      let query = `SELECT * FROM content_approvals WHERE status = 'pending_review'`;
      const params: any[] = [];
      let paramIndex = 1;

      if (content_type) {
        query += ` AND content_type = $${paramIndex}`;
        params.push(content_type);
        paramIndex++;
      }

      // Get total count
      const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
      const { rows: countRows } = await prisma.query(countQuery, params);
      const total = parseInt(countRows[0].count);

      // Get paginated results
      query += ` ORDER BY submitted_at ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const { rows } = await prisma.query(query, params);
      return {
        items: rows.map(row => this.mapDbRowToContentApproval(row)),
        total
      };
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      throw new Error('Failed to fetch pending approvals');
    }
  }

  /**
   * Approve content
   */
  static async approveContent(
    id: string,
    reviewed_by: string,
    options?: {
      schedule_for?: string;
      publish_immediately?: boolean;
    }
  ): Promise<ContentApproval> {
    try {
      // Update approval status
      const { rows } = await prisma.query(
        `UPDATE content_approvals 
         SET status = 'approved', reviewed_by = $1, reviewed_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [reviewed_by, id]
      );

      if (rows.length === 0) {
        throw new Error('Approval not found');
      }

      const approval = this.mapDbRowToContentApproval(rows[0]);

      // If scheduling is requested, create scheduled content
      if (options?.schedule_for) {
        await SchedulingService.scheduleContent({
          content_entry_id: approval.content_entry_id,
          content_type: approval.content_type,
          platform: approval.metadata?.platform,
          title: approval.title,
          content: approval.content,
          scheduled_for: options.schedule_for,
          created_by: reviewed_by,
          metadata: {
            ...approval.metadata,
            approval_id: approval.id
          }
        });
      }

      // If immediate publishing is requested, handle that
      if (options?.publish_immediately) {
        // TODO: Implement immediate publishing logic
        // This would integrate with the publishing service
      }

      return approval;
    } catch (error) {
      console.error('Error approving content:', error);
      throw new Error('Failed to approve content');
    }
  }

  /**
   * Reject content
   */
  static async rejectContent(
    id: string,
    reviewed_by: string,
    rejection_reason: string
  ): Promise<ContentApproval> {
    try {
      const { rows } = await prisma.query(
        `UPDATE content_approvals 
         SET status = 'rejected', reviewed_by = $1, reviewed_at = NOW(), rejection_reason = $2
         WHERE id = $3
         RETURNING *`,
        [reviewed_by, rejection_reason, id]
      );

      if (rows.length === 0) {
        throw new Error('Approval not found');
      }

      return this.mapDbRowToContentApproval(rows[0]);
    } catch (error) {
      console.error('Error rejecting content:', error);
      throw new Error('Failed to reject content');
    }
  }

  /**
   * Request changes to content
   */
  static async requestChanges(
    id: string,
    reviewed_by: string,
    requested_changes: string
  ): Promise<ContentApproval> {
    try {
      const { rows } = await prisma.query(
        `UPDATE content_approvals 
         SET status = 'changes_requested', reviewed_by = $1, reviewed_at = NOW(), requested_changes = $2
         WHERE id = $3
         RETURNING *`,
        [reviewed_by, requested_changes, id]
      );

      if (rows.length === 0) {
        throw new Error('Approval not found');
      }

      return this.mapDbRowToContentApproval(rows[0]);
    } catch (error) {
      console.error('Error requesting changes:', error);
      throw new Error('Failed to request changes');
    }
  }

  /**
   * Get approval history for content
   */
  static async getApprovalHistory(content_entry_id: string): Promise<ContentApproval[]> {
    try {
      const { rows } = await prisma.query(
        `SELECT * FROM content_approvals 
         WHERE content_entry_id = $1 
         ORDER BY version DESC`,
        [content_entry_id]
      );

      return rows.map(row => this.mapDbRowToContentApproval(row));
    } catch (error) {
      console.error('Error fetching approval history:', error);
      throw new Error('Failed to fetch approval history');
    }
  }

  /**
   * Get approval statistics
   */
  static async getApprovalStats(): Promise<ApprovalStats> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { rows } = await prisma.query(`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'pending_review') as pending_review,
          COUNT(*) FILTER (WHERE status = 'approved' AND reviewed_at::date = $1) as approved_today,
          COUNT(*) FILTER (WHERE status = 'rejected' AND reviewed_at::date = $1) as rejected_today,
          AVG(EXTRACT(EPOCH FROM (reviewed_at - submitted_at)) / 60) FILTER (WHERE reviewed_at IS NOT NULL) as avg_review_time
        FROM content_approvals
      `, [today]);

      return {
        pending_review: parseInt(rows[0].pending_review) || 0,
        approved_today: parseInt(rows[0].approved_today) || 0,
        rejected_today: parseInt(rows[0].rejected_today) || 0,
        average_review_time_minutes: parseFloat(rows[0].avg_review_time) || 0
      };
    } catch (error) {
      console.error('Error fetching approval stats:', error);
      throw new Error('Failed to fetch approval stats');
    }
  }

  /**
   * Map database row to ContentApproval
   */
  private static mapDbRowToContentApproval(row: any): ContentApproval {
    return {
      id: row.id,
      content_entry_id: row.content_entry_id,
      scheduled_content_id: row.scheduled_content_id,
      content_type: row.content_type,
      title: row.title,
      content: row.content,
      status: row.status,
      submitted_by: row.submitted_by,
      submitted_at: row.submitted_at,
      reviewed_by: row.reviewed_by,
      reviewed_at: row.reviewed_at,
      rejection_reason: row.rejection_reason,
      requested_changes: row.requested_changes,
      version: row.version,
      previous_version_id: row.previous_version_id,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata
    };
  }
}

