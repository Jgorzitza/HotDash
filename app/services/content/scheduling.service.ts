/**
 * Content Scheduling Service
 * 
 * Manages scheduled content publishing across platforms
 * - Schedule content for future publishing
 * - Track scheduled content status
 * - Execute scheduled publishing
 * - Handle publishing failures and retries
 */

import prisma from "~/prisma.server";

export interface ScheduledContent {
  id: string;
  content_entry_id?: string;
  content_type: 'social_post' | 'blog_post' | 'product_description' | 'email_campaign';
  platform?: string; // For social posts
  title: string;
  content: string;
  scheduled_for: string; // ISO timestamp
  status: 'scheduled' | 'publishing' | 'published' | 'failed' | 'cancelled';
  created_by: string;
  created_at: string;
  published_at?: string;
  failed_at?: string;
  error_message?: string;
  retry_count: number;
  metadata?: Record<string, any>;
}

export interface ScheduleContentInput {
  content_entry_id?: string;
  content_type: 'social_post' | 'blog_post' | 'product_description' | 'email_campaign';
  platform?: string;
  title: string;
  content: string;
  scheduled_for: string;
  created_by: string;
  metadata?: Record<string, any>;
}

export interface SchedulingStats {
  total_scheduled: number;
  scheduled_today: number;
  scheduled_this_week: number;
  published_today: number;
  failed_today: number;
  by_platform: Record<string, number>;
  by_status: Record<string, number>;
}

export class SchedulingService {
  /**
   * Schedule content for future publishing
   */
  static async scheduleContent(input: ScheduleContentInput): Promise<ScheduledContent> {
    try {
      const query = `
        INSERT INTO scheduled_content (
          content_entry_id, content_type, platform, title, content,
          scheduled_for, status, created_by, retry_count, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, 'scheduled', $7, 0, $8)
        RETURNING *
      `;
      
      const params = [
        input.content_entry_id || null,
        input.content_type,
        input.platform || null,
        input.title,
        input.content,
        input.scheduled_for,
        input.created_by,
        JSON.stringify(input.metadata || {})
      ];
      
      const { rows } = await prisma.query(query, params);
      return this.mapDbRowToScheduledContent(rows[0]);
    } catch (error) {
      console.error('Error scheduling content:', error);
      throw new Error('Failed to schedule content');
    }
  }

  /**
   * Get scheduled content by ID
   */
  static async getScheduledContentById(id: string): Promise<ScheduledContent | null> {
    try {
      const { rows } = await prisma.query(
        'SELECT * FROM scheduled_content WHERE id = $1',
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return this.mapDbRowToScheduledContent(rows[0]);
    } catch (error) {
      console.error('Error fetching scheduled content:', error);
      throw new Error('Failed to fetch scheduled content');
    }
  }

  /**
   * Get all scheduled content with filters
   */
  static async getScheduledContent(options: {
    status?: string;
    content_type?: string;
    platform?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ items: ScheduledContent[]; total: number }> {
    try {
      const {
        status,
        content_type,
        platform,
        start_date,
        end_date,
        limit = 50,
        offset = 0
      } = options;

      let query = 'SELECT * FROM scheduled_content WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;
      
      if (status) {
        query += ` AND status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }
      
      if (content_type) {
        query += ` AND content_type = $${paramIndex}`;
        params.push(content_type);
        paramIndex++;
      }
      
      if (platform) {
        query += ` AND platform = $${paramIndex}`;
        params.push(platform);
        paramIndex++;
      }
      
      if (start_date) {
        query += ` AND scheduled_for >= $${paramIndex}`;
        params.push(start_date);
        paramIndex++;
      }
      
      if (end_date) {
        query += ` AND scheduled_for <= $${paramIndex}`;
        params.push(end_date);
        paramIndex++;
      }
      
      // Get total count
      const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
      const { rows: countRows } = await prisma.query(countQuery, params);
      const total = parseInt(countRows[0].count);
      
      // Get paginated results
      query += ` ORDER BY scheduled_for ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);
      
      const { rows } = await prisma.query(query, params);
      return {
        items: rows.map(row => this.mapDbRowToScheduledContent(row)),
        total
      };
    } catch (error) {
      console.error('Error fetching scheduled content:', error);
      throw new Error('Failed to fetch scheduled content');
    }
  }

  /**
   * Get content scheduled for a specific date range (for calendar view)
   */
  static async getContentForDateRange(
    startDate: string,
    endDate: string
  ): Promise<ScheduledContent[]> {
    try {
      const { rows } = await prisma.query(
        `SELECT * FROM scheduled_content 
         WHERE scheduled_for >= $1 AND scheduled_for <= $2
         ORDER BY scheduled_for ASC`,
        [startDate, endDate]
      );
      
      return rows.map(row => this.mapDbRowToScheduledContent(row));
    } catch (error) {
      console.error('Error fetching content for date range:', error);
      throw new Error('Failed to fetch content for date range');
    }
  }

  /**
   * Update scheduled content
   */
  static async updateScheduledContent(
    id: string,
    updates: {
      title?: string;
      content?: string;
      scheduled_for?: string;
      status?: string;
      error_message?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<ScheduledContent> {
    try {
      const updateFields: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (updates.title !== undefined) {
        updateFields.push(`title = $${paramIndex}`);
        params.push(updates.title);
        paramIndex++;
      }

      if (updates.content !== undefined) {
        updateFields.push(`content = $${paramIndex}`);
        params.push(updates.content);
        paramIndex++;
      }

      if (updates.scheduled_for !== undefined) {
        updateFields.push(`scheduled_for = $${paramIndex}`);
        params.push(updates.scheduled_for);
        paramIndex++;
      }

      if (updates.status !== undefined) {
        updateFields.push(`status = $${paramIndex}`);
        params.push(updates.status);
        paramIndex++;
        
        if (updates.status === 'published') {
          updateFields.push(`published_at = NOW()`);
        } else if (updates.status === 'failed') {
          updateFields.push(`failed_at = NOW()`);
        }
      }

      if (updates.error_message !== undefined) {
        updateFields.push(`error_message = $${paramIndex}`);
        params.push(updates.error_message);
        paramIndex++;
      }

      if (updates.metadata !== undefined) {
        updateFields.push(`metadata = $${paramIndex}`);
        params.push(JSON.stringify(updates.metadata));
        paramIndex++;
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      params.push(id);

      const query = `
        UPDATE scheduled_content 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const { rows } = await prisma.query(query, params);
      
      if (rows.length === 0) {
        throw new Error('Scheduled content not found');
      }

      return this.mapDbRowToScheduledContent(rows[0]);
    } catch (error) {
      console.error('Error updating scheduled content:', error);
      throw new Error('Failed to update scheduled content');
    }
  }

  /**
   * Cancel scheduled content
   */
  static async cancelScheduledContent(id: string): Promise<void> {
    try {
      await this.updateScheduledContent(id, { status: 'cancelled' });
    } catch (error) {
      console.error('Error cancelling scheduled content:', error);
      throw new Error('Failed to cancel scheduled content');
    }
  }

  /**
   * Get scheduling statistics
   */
  static async getSchedulingStats(): Promise<SchedulingStats> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const { rows } = await prisma.query(`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'scheduled') as total_scheduled,
          COUNT(*) FILTER (WHERE status = 'scheduled' AND scheduled_for::date = $1) as scheduled_today,
          COUNT(*) FILTER (WHERE status = 'scheduled' AND scheduled_for::date >= $2) as scheduled_this_week,
          COUNT(*) FILTER (WHERE status = 'published' AND published_at::date = $1) as published_today,
          COUNT(*) FILTER (WHERE status = 'failed' AND failed_at::date = $1) as failed_today
        FROM scheduled_content
      `, [today, weekStartStr]);

      // Get by platform
      const { rows: platformRows } = await prisma.query(`
        SELECT platform, COUNT(*) as count
        FROM scheduled_content
        WHERE status = 'scheduled' AND platform IS NOT NULL
        GROUP BY platform
      `);

      // Get by status
      const { rows: statusRows } = await prisma.query(`
        SELECT status, COUNT(*) as count
        FROM scheduled_content
        GROUP BY status
      `);

      const by_platform: Record<string, number> = {};
      platformRows.forEach(row => {
        by_platform[row.platform] = parseInt(row.count);
      });

      const by_status: Record<string, number> = {};
      statusRows.forEach(row => {
        by_status[row.status] = parseInt(row.count);
      });

      return {
        total_scheduled: parseInt(rows[0].total_scheduled),
        scheduled_today: parseInt(rows[0].scheduled_today),
        scheduled_this_week: parseInt(rows[0].scheduled_this_week),
        published_today: parseInt(rows[0].published_today),
        failed_today: parseInt(rows[0].failed_today),
        by_platform,
        by_status
      };
    } catch (error) {
      console.error('Error fetching scheduling stats:', error);
      throw new Error('Failed to fetch scheduling stats');
    }
  }

  /**
   * Map database row to ScheduledContent
   */
  private static mapDbRowToScheduledContent(row: any): ScheduledContent {
    return {
      id: row.id,
      content_entry_id: row.content_entry_id,
      content_type: row.content_type,
      platform: row.platform,
      title: row.title,
      content: row.content,
      scheduled_for: row.scheduled_for,
      status: row.status,
      created_by: row.created_by,
      created_at: row.created_at,
      published_at: row.published_at,
      failed_at: row.failed_at,
      error_message: row.error_message,
      retry_count: row.retry_count,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata
    };
  }
}

