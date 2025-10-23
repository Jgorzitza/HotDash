/**
 * Publer Integration Adapter
 * 
 * Provides type-safe methods for Publer API operations:
 * - Social media account management
 * - Post scheduling and publishing
 * - Job status tracking
 * - Workspace management
 */

import { APIClient, APIResponse } from './api-client';
import { integrationManager } from './integration-manager';

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

export class PublerAdapter {
  private client: APIClient;

  constructor() {
    this.client = new APIClient({
      baseURL: 'https://app.publer.com/api/v1',
      auth: {
        type: 'api-key',
        apiKey: process.env.PUBLER_API_KEY!,
        apiKeyHeader: 'Authorization',
      },
      headers: {
        'Publer-Workspace-Id': process.env.PUBLER_WORKSPACE_ID!,
      },
      rateLimit: {
        maxRequestsPerSecond: 5,
        burstSize: 15,
      },
    });
  }

  // Workspaces
  async getWorkspaces(): Promise<APIResponse<PublerWorkspace[]>> {
    return integrationManager.executeRequest('publer', (client) =>
      client.get('/workspaces')
    );
  }

  async getWorkspace(id: string): Promise<APIResponse<PublerWorkspace>> {
    return integrationManager.executeRequest('publer', (client) =>
      client.get(`/workspaces/${id}`)
    );
  }

  // Accounts
  async getAccounts(): Promise<APIResponse<PublerAccount[]>> {
    return integrationManager.executeRequest('publer', (client) =>
      client.get('/accounts')
    );
  }

  async getAccount(id: string): Promise<APIResponse<PublerAccount>> {
    return integrationManager.executeRequest('publer', (client) =>
      client.get(`/accounts/${id}`)
    );
  }

  async updateAccount(id: string, account: Partial<PublerAccount>): Promise<APIResponse<PublerAccount>> {
    return integrationManager.executeRequest('publer', (client) =>
      client.put(`/accounts/${id}`, account)
    );
  }

  // Posts
  async getPosts(params?: {
    limit?: number;
    offset?: number;
    status?: 'draft' | 'scheduled' | 'published' | 'failed';
    account_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<APIResponse<{ posts: PublerPost[]; total: number }>> {
    return integrationManager.executeRequest('publer', (client) =>
      client.get('/posts', { params })
    );
  }

  async getPost(id: string): Promise<APIResponse<PublerPost>> {
    return integrationManager.executeRequest('publer', (client) =>
      client.get(`/posts/${id}`)
    );
  }

  async createPost(post: {
    text: string;
    accounts: string[];
    scheduled_at?: string;
    media?: PublerMedia[];
    networks?: Record<string, any>;
  }): Promise<APIResponse<PublerPost>> {
    return integrationManager.executeRequest('publer', (client) =>
      client.post('/posts', post)
    );
  }

  async updatePost(id: string, post: Partial<PublerPost>): Promise<APIResponse<PublerPost>> {
    return integrationManager.executeRequest('publer', (client) =>
      client.put(`/posts/${id}`, post)
    );
  }

  async deletePost(id: string): Promise<APIResponse<void>> {
    return integrationManager.executeRequest('publer', (client) =>
      client.delete(`/posts/${id}`)
    );
  }

  // Scheduling
  async schedulePost(input: PublerScheduleInput): Promise<APIResponse<PublerJobResponse>> {
    const body = {
      bulk: {
        state: 'scheduled',
        posts: [
          {
            networks: input.networks || {},
            text: input.text,
            accounts: input.accountIds.map((id) => ({
              id,
              scheduled_at: input.scheduledAt || null,
            })),
            media: input.media || [],
          },
        ],
      },
    };

    return integrationManager.executeRequest('publer', (client) =>
      client.post('/posts/schedule', body)
    );
  }

  async publishPost(input: PublerScheduleInput): Promise<APIResponse<PublerJobResponse>> {
    const body = {
      bulk: {
        state: 'published',
        posts: [
          {
            networks: input.networks || {},
            text: input.text,
            accounts: input.accountIds.map((id) => ({ id })),
            media: input.media || [],
          },
        ],
      },
    };

    return integrationManager.executeRequest('publer', (client) =>
      client.post('/posts/publish', body)
    );
  }

  // Job Management
  async getJobStatus(jobId: string): Promise<APIResponse<PublerJobStatus>> {
    return integrationManager.executeRequest('publer', (client) =>
      client.get(`/job_status/${jobId}`)
    );
  }

  async getJobs(params?: {
    limit?: number;
    offset?: number;
    status?: 'pending' | 'processing' | 'completed' | 'failed';
  }): Promise<APIResponse<{ jobs: PublerJobStatus[]; total: number }>> {
    return integrationManager.executeRequest('publer', (client) =>
      client.get('/jobs', { params })
    );
  }

  async cancelJob(jobId: string): Promise<APIResponse<void>> {
    return integrationManager.executeRequest('publer', (client) =>
      client.post(`/jobs/${jobId}/cancel`)
    );
  }

  // Media
  async uploadMedia(file: File | Buffer, metadata?: {
    alt_text?: string;
    title?: string;
  }): Promise<APIResponse<PublerMedia>> {
    const formData = new FormData();
    if (file instanceof File) {
      formData.append('file', file);
    } else {
      formData.append('file', new Blob([file]));
    }
    
    if (metadata) {
      if (metadata.alt_text) formData.append('alt_text', metadata.alt_text);
      if (metadata.title) formData.append('title', metadata.title);
    }

    return integrationManager.executeRequest('publer', (client) =>
      client.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    );
  }

  async getMedia(id: string): Promise<APIResponse<PublerMedia>> {
    return integrationManager.executeRequest('publer', (client) =>
      client.get(`/media/${id}`)
    );
  }

  async deleteMedia(id: string): Promise<APIResponse<void>> {
    return integrationManager.executeRequest('publer', (client) =>
      client.delete(`/media/${id}`)
    );
  }

  // Analytics
  async getPostAnalytics(postId: string): Promise<APIResponse<{
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
  }>> {
    return integrationManager.executeRequest('publer', (client) =>
      client.get(`/posts/${postId}/analytics`)
    );
  }

  async getAccountAnalytics(accountId: string, params?: {
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
  }>> {
    return integrationManager.executeRequest('publer', (client) =>
      client.get(`/accounts/${accountId}/analytics`, { params })
    );
  }

  // Bulk Operations
  async scheduleBulkPosts(posts: PublerScheduleInput[]): Promise<APIResponse<PublerJobResponse>> {
    const body = {
      bulk: {
        state: 'scheduled',
        posts: posts.map(post => ({
          networks: post.networks || {},
          text: post.text,
          accounts: post.accountIds.map((id) => ({
            id,
            scheduled_at: post.scheduledAt || null,
          })),
          media: post.media || [],
        })),
      },
    };

    return integrationManager.executeRequest('publer', (client) =>
      client.post('/posts/schedule', body)
    );
  }

  async publishBulkPosts(posts: PublerScheduleInput[]): Promise<APIResponse<PublerJobResponse>> {
    const body = {
      bulk: {
        state: 'published',
        posts: posts.map(post => ({
          networks: post.networks || {},
          text: post.text,
          accounts: post.accountIds.map((id) => ({ id })),
          media: post.media || [],
        })),
      },
    };

    return integrationManager.executeRequest('publer', (client) =>
      client.post('/posts/publish', body)
    );
  }

  // Draft Management
  async getDrafts(): Promise<APIResponse<{ posts: PublerPost[]; total: number }>> {
    return integrationManager.executeRequest('publer', (client) =>
      client.get('/posts', { params: { status: 'draft' } })
    );
  }

  async createDraft(post: {
    text: string;
    accounts: string[];
    media?: PublerMedia[];
    networks?: Record<string, any>;
  }): Promise<APIResponse<PublerPost>> {
    return integrationManager.executeRequest('publer', (client) =>
      client.post('/posts', { ...post, status: 'draft' })
    );
  }

  async publishDraft(postId: string): Promise<APIResponse<PublerJobResponse>> {
    return integrationManager.executeRequest('publer', (client) =>
      client.post(`/posts/${postId}/publish`)
    );
  }

  async scheduleDraft(postId: string, scheduledAt: string): Promise<APIResponse<PublerJobResponse>> {
    return integrationManager.executeRequest('publer', (client) =>
      client.post(`/posts/${postId}/schedule`, { scheduled_at: scheduledAt })
    );
  }
}

export const publerAdapter = new PublerAdapter();
