/**
 * Publer Integration Adapter
 *
 * Provides type-safe methods for Publer API operations:
 * - Social media account management
 * - Post scheduling and publishing
 * - Job status tracking
 * - Workspace management
 */
import { APIResponse } from './api-client';
export interface PublerWorkspace {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
}
export interface PublerAccount {
    id: string;
    name: string;
    username: string;
    platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'pinterest' | 'youtube' | 'tiktok';
    avatar_url?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
export interface PublerPost {
    id: string;
    text: string;
    media?: PublerMedia[];
    accounts: string[];
    scheduled_at?: string;
    published_at?: string;
    status: 'draft' | 'scheduled' | 'published' | 'failed';
    created_at: string;
    updated_at: string;
}
export interface PublerMedia {
    id: string;
    type: 'image' | 'video' | 'gif';
    url: string;
    thumbnail_url?: string;
    alt_text?: string;
    width?: number;
    height?: number;
}
export interface PublerJobResponse {
    job_id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    created_at: string;
    updated_at: string;
}
export interface PublerJobStatus {
    job_id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    posts: Array<{
        id: string;
        account_id: string;
        status: 'pending' | 'processing' | 'completed' | 'failed';
        error?: string;
        published_at?: string;
    }>;
    created_at: string;
    updated_at: string;
}
export interface PublerScheduleInput {
    text: string;
    accountIds: string[];
    scheduledAt?: string;
    media?: PublerMedia[];
    networks?: Record<string, any>;
}
export declare class PublerAdapter {
    private client;
    constructor();
    getWorkspaces(): Promise<APIResponse<PublerWorkspace[]>>;
    getWorkspace(id: string): Promise<APIResponse<PublerWorkspace>>;
    getAccounts(): Promise<APIResponse<PublerAccount[]>>;
    getAccount(id: string): Promise<APIResponse<PublerAccount>>;
    updateAccount(id: string, account: Partial<PublerAccount>): Promise<APIResponse<PublerAccount>>;
    getPosts(params?: {
        limit?: number;
        offset?: number;
        status?: 'draft' | 'scheduled' | 'published' | 'failed';
        account_id?: string;
        date_from?: string;
        date_to?: string;
    }): Promise<APIResponse<{
        posts: PublerPost[];
        total: number;
    }>>;
    getPost(id: string): Promise<APIResponse<PublerPost>>;
    createPost(post: {
        text: string;
        accounts: string[];
        scheduled_at?: string;
        media?: PublerMedia[];
        networks?: Record<string, any>;
    }): Promise<APIResponse<PublerPost>>;
    updatePost(id: string, post: Partial<PublerPost>): Promise<APIResponse<PublerPost>>;
    deletePost(id: string): Promise<APIResponse<void>>;
    schedulePost(input: PublerScheduleInput): Promise<APIResponse<PublerJobResponse>>;
    publishPost(input: PublerScheduleInput): Promise<APIResponse<PublerJobResponse>>;
    getJobStatus(jobId: string): Promise<APIResponse<PublerJobStatus>>;
    getJobs(params?: {
        limit?: number;
        offset?: number;
        status?: 'pending' | 'processing' | 'completed' | 'failed';
    }): Promise<APIResponse<{
        jobs: PublerJobStatus[];
        total: number;
    }>>;
    cancelJob(jobId: string): Promise<APIResponse<void>>;
    uploadMedia(file: File | Buffer, metadata?: {
        alt_text?: string;
        title?: string;
    }): Promise<APIResponse<PublerMedia>>;
    getMedia(id: string): Promise<APIResponse<PublerMedia>>;
    deleteMedia(id: string): Promise<APIResponse<void>>;
    getPostAnalytics(postId: string): Promise<APIResponse<{
        post_id: string;
        metrics: {
            impressions?: number;
            reach?: number;
            engagement?: number;
            clicks?: number;
            likes?: number;
            comments?: number;
            shares?: number;
        };
        generated_at: string;
    }>>;
    getAccountAnalytics(accountId: string, params?: {
        date_from?: string;
        date_to?: string;
        metrics?: string[];
    }): Promise<APIResponse<{
        account_id: string;
        metrics: Record<string, number>;
        period: {
            from: string;
            to: string;
        };
        generated_at: string;
    }>>;
    scheduleBulkPosts(posts: PublerScheduleInput[]): Promise<APIResponse<PublerJobResponse>>;
    publishBulkPosts(posts: PublerScheduleInput[]): Promise<APIResponse<PublerJobResponse>>;
    getDrafts(): Promise<APIResponse<{
        posts: PublerPost[];
        total: number;
    }>>;
    createDraft(post: {
        text: string;
        accounts: string[];
        media?: PublerMedia[];
        networks?: Record<string, any>;
    }): Promise<APIResponse<PublerPost>>;
    publishDraft(postId: string): Promise<APIResponse<PublerJobResponse>>;
    scheduleDraft(postId: string, scheduledAt: string): Promise<APIResponse<PublerJobResponse>>;
}
export declare const publerAdapter: PublerAdapter;
//# sourceMappingURL=publer-adapter.d.ts.map