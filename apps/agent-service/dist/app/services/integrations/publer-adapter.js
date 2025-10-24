/**
 * Publer Integration Adapter
 *
 * Provides type-safe methods for Publer API operations:
 * - Social media account management
 * - Post scheduling and publishing
 * - Job status tracking
 * - Workspace management
 */
import { APIClient } from './api-client';
import { integrationManager } from './integration-manager';
export class PublerAdapter {
    client;
    constructor() {
        this.client = new APIClient({
            baseURL: 'https://app.publer.com/api/v1',
            auth: {
                type: 'api-key',
                apiKey: process.env.PUBLER_API_KEY,
                apiKeyHeader: 'Authorization',
            },
            headers: {
                'Publer-Workspace-Id': process.env.PUBLER_WORKSPACE_ID,
            },
            rateLimit: {
                maxRequestsPerSecond: 5,
                burstSize: 15,
            },
        });
    }
    // Workspaces
    async getWorkspaces() {
        return integrationManager.executeRequest('publer', (client) => client.get('/workspaces'));
    }
    async getWorkspace(id) {
        return integrationManager.executeRequest('publer', (client) => client.get(`/workspaces/${id}`));
    }
    // Accounts
    async getAccounts() {
        return integrationManager.executeRequest('publer', (client) => client.get('/accounts'));
    }
    async getAccount(id) {
        return integrationManager.executeRequest('publer', (client) => client.get(`/accounts/${id}`));
    }
    async updateAccount(id, account) {
        return integrationManager.executeRequest('publer', (client) => client.put(`/accounts/${id}`, account));
    }
    // Posts
    async getPosts(params) {
        return integrationManager.executeRequest('publer', (client) => client.get('/posts', { params }));
    }
    async getPost(id) {
        return integrationManager.executeRequest('publer', (client) => client.get(`/posts/${id}`));
    }
    async createPost(post) {
        return integrationManager.executeRequest('publer', (client) => client.post('/posts', post));
    }
    async updatePost(id, post) {
        return integrationManager.executeRequest('publer', (client) => client.put(`/posts/${id}`, post));
    }
    async deletePost(id) {
        return integrationManager.executeRequest('publer', (client) => client.delete(`/posts/${id}`));
    }
    // Scheduling
    async schedulePost(input) {
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
        return integrationManager.executeRequest('publer', (client) => client.post('/posts/schedule', body));
    }
    async publishPost(input) {
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
        return integrationManager.executeRequest('publer', (client) => client.post('/posts/publish', body));
    }
    // Job Management
    async getJobStatus(jobId) {
        return integrationManager.executeRequest('publer', (client) => client.get(`/job_status/${jobId}`));
    }
    async getJobs(params) {
        return integrationManager.executeRequest('publer', (client) => client.get('/jobs', { params }));
    }
    async cancelJob(jobId) {
        return integrationManager.executeRequest('publer', (client) => client.post(`/jobs/${jobId}/cancel`));
    }
    // Media
    async uploadMedia(file, metadata) {
        const formData = new FormData();
        if (file instanceof File) {
            formData.append('file', file);
        }
        else {
            formData.append('file', new Blob([file]));
        }
        if (metadata) {
            if (metadata.alt_text)
                formData.append('alt_text', metadata.alt_text);
            if (metadata.title)
                formData.append('title', metadata.title);
        }
        return integrationManager.executeRequest('publer', (client) => client.post('/media/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }));
    }
    async getMedia(id) {
        return integrationManager.executeRequest('publer', (client) => client.get(`/media/${id}`));
    }
    async deleteMedia(id) {
        return integrationManager.executeRequest('publer', (client) => client.delete(`/media/${id}`));
    }
    // Analytics
    async getPostAnalytics(postId) {
        return integrationManager.executeRequest('publer', (client) => client.get(`/posts/${postId}/analytics`));
    }
    async getAccountAnalytics(accountId, params) {
        return integrationManager.executeRequest('publer', (client) => client.get(`/accounts/${accountId}/analytics`, { params }));
    }
    // Bulk Operations
    async scheduleBulkPosts(posts) {
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
        return integrationManager.executeRequest('publer', (client) => client.post('/posts/schedule', body));
    }
    async publishBulkPosts(posts) {
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
        return integrationManager.executeRequest('publer', (client) => client.post('/posts/publish', body));
    }
    // Draft Management
    async getDrafts() {
        return integrationManager.executeRequest('publer', (client) => client.get('/posts', { params: { status: 'draft' } }));
    }
    async createDraft(post) {
        return integrationManager.executeRequest('publer', (client) => client.post('/posts', { ...post, status: 'draft' }));
    }
    async publishDraft(postId) {
        return integrationManager.executeRequest('publer', (client) => client.post(`/posts/${postId}/publish`));
    }
    async scheduleDraft(postId, scheduledAt) {
        return integrationManager.executeRequest('publer', (client) => client.post(`/posts/${postId}/schedule`, { scheduled_at: scheduledAt }));
    }
}
export const publerAdapter = new PublerAdapter();
//# sourceMappingURL=publer-adapter.js.map