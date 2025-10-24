/**
 * Content Scheduling Service
 *
 * Manages scheduled content publishing across platforms
 * - Schedule content for future publishing
 * - Track scheduled content status
 * - Execute scheduled publishing
 * - Handle publishing failures and retries
 */
export interface ScheduledContent {
    id: string;
    content_entry_id?: string;
    content_type: 'social_post' | 'blog_post' | 'product_description' | 'email_campaign';
    platform?: string;
    title: string;
    content: string;
    scheduled_for: string;
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
export declare class SchedulingService {
    /**
     * Schedule content for future publishing
     */
    static scheduleContent(input: ScheduleContentInput): Promise<ScheduledContent>;
    /**
     * Get scheduled content by ID
     */
    static getScheduledContentById(id: string): Promise<ScheduledContent | null>;
    /**
     * Get all scheduled content with filters
     */
    static getScheduledContent(options?: {
        status?: string;
        content_type?: string;
        platform?: string;
        start_date?: string;
        end_date?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        items: ScheduledContent[];
        total: number;
    }>;
    /**
     * Get content scheduled for a specific date range (for calendar view)
     */
    static getContentForDateRange(startDate: string, endDate: string): Promise<ScheduledContent[]>;
    /**
     * Update scheduled content
     */
    static updateScheduledContent(id: string, updates: {
        title?: string;
        content?: string;
        scheduled_for?: string;
        status?: string;
        error_message?: string;
        metadata?: Record<string, any>;
    }): Promise<ScheduledContent>;
    /**
     * Cancel scheduled content
     */
    static cancelScheduledContent(id: string): Promise<void>;
    /**
     * Get scheduling statistics
     */
    static getSchedulingStats(): Promise<SchedulingStats>;
    /**
     * Map database row to ScheduledContent
     */
    private static mapDbRowToScheduledContent;
}
//# sourceMappingURL=scheduling.service.d.ts.map