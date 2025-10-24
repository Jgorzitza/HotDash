/**
 * Chatwoot Integration Adapter
 *
 * Provides type-safe methods for Chatwoot API operations:
 * - Conversation management
 * - Message handling
 * - Contact management
 * - Agent operations
 * - Analytics and reporting
 */
import { APIClient } from './api-client';
import { integrationManager } from './integration-manager';
export class ChatwootAdapter {
    client;
    constructor() {
        const baseUrl = process.env.CHATWOOT_BASE_URL || 'https://app.chatwoot.com';
        const accountId = process.env.CHATWOOT_ACCOUNT_ID;
        this.client = new APIClient({
            baseURL: `${baseUrl}/api/v1/accounts/${accountId}`,
            auth: {
                type: 'api-key',
                apiKey: process.env.CHATWOOT_API_TOKEN,
                apiKeyHeader: 'api_access_token',
            },
            rateLimit: {
                maxRequestsPerSecond: 10,
                burstSize: 30,
            },
        });
    }
    // Conversations
    async getConversations(filters) {
        return integrationManager.executeRequest('chatwoot', (client) => client.get('/conversations', { params: filters }));
    }
    async getConversation(id) {
        return integrationManager.executeRequest('chatwoot', (client) => client.get(`/conversations/${id}`));
    }
    async updateConversation(id, updates) {
        return integrationManager.executeRequest('chatwoot', (client) => client.put(`/conversations/${id}`, updates));
    }
    async assignConversation(id, assigneeId) {
        return integrationManager.executeRequest('chatwoot', (client) => client.post(`/conversations/${id}/assignments`, { assignee_id: assigneeId }));
    }
    async unassignConversation(id) {
        return integrationManager.executeRequest('chatwoot', (client) => client.delete(`/conversations/${id}/assignments`));
    }
    async resolveConversation(id) {
        return integrationManager.executeRequest('chatwoot', (client) => client.post(`/conversations/${id}/toggle_status`, { status: 'resolved' }));
    }
    async reopenConversation(id) {
        return integrationManager.executeRequest('chatwoot', (client) => client.post(`/conversations/${id}/toggle_status`, { status: 'open' }));
    }
    // Messages
    async getMessages(conversationId, params) {
        return integrationManager.executeRequest('chatwoot', (client) => client.get(`/conversations/${conversationId}/messages`, { params }));
    }
    async sendMessage(conversationId, message) {
        const formData = new FormData();
        formData.append('content', message.content);
        formData.append('message_type', message.message_type.toString());
        if (message.private)
            formData.append('private', 'true');
        if (message.attachments) {
            message.attachments.forEach((file, index) => {
                formData.append(`attachments[${index}]`, file);
            });
        }
        return integrationManager.executeRequest('chatwoot', (client) => client.post(`/conversations/${conversationId}/messages`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }));
    }
    async createPrivateNote(conversationId, content) {
        return this.sendMessage(conversationId, {
            content,
            message_type: 0,
            private: true,
        });
    }
    async updateMessage(conversationId, messageId, content) {
        return integrationManager.executeRequest('chatwoot', (client) => client.put(`/conversations/${conversationId}/messages/${messageId}`, { content }));
    }
    async deleteMessage(conversationId, messageId) {
        return integrationManager.executeRequest('chatwoot', (client) => client.delete(`/conversations/${conversationId}/messages/${messageId}`));
    }
    // Labels
    async getLabels() {
        return integrationManager.executeRequest('chatwoot', (client) => client.get('/labels'));
    }
    async createLabel(label) {
        return integrationManager.executeRequest('chatwoot', (client) => client.post('/labels', label));
    }
    async addLabelToConversation(conversationId, labelId) {
        return integrationManager.executeRequest('chatwoot', (client) => client.post(`/conversations/${conversationId}/labels`, { labels: [labelId] }));
    }
    async removeLabelFromConversation(conversationId, labelId) {
        return integrationManager.executeRequest('chatwoot', (client) => client.delete(`/conversations/${conversationId}/labels/${labelId}`));
    }
    // Contacts
    async getContacts(params) {
        return integrationManager.executeRequest('chatwoot', (client) => client.get('/contacts', { params }));
    }
    async getContact(id) {
        return integrationManager.executeRequest('chatwoot', (client) => client.get(`/contacts/${id}`));
    }
    async createContact(contact) {
        return integrationManager.executeRequest('chatwoot', (client) => client.post('/contacts', contact));
    }
    async updateContact(id, contact) {
        return integrationManager.executeRequest('chatwoot', (client) => client.put(`/contacts/${id}`, contact));
    }
    async deleteContact(id) {
        return integrationManager.executeRequest('chatwoot', (client) => client.delete(`/contacts/${id}`));
    }
    // Agents
    async getAgents() {
        return integrationManager.executeRequest('chatwoot', (client) => client.get('/agents'));
    }
    async getAgent(id) {
        return integrationManager.executeRequest('chatwoot', (client) => client.get(`/agents/${id}`));
    }
    // Inboxes
    async getInboxes() {
        return integrationManager.executeRequest('chatwoot', (client) => client.get('/inboxes'));
    }
    async getInbox(id) {
        return integrationManager.executeRequest('chatwoot', (client) => client.get(`/inboxes/${id}`));
    }
    // Analytics
    async getConversationAnalytics(params) {
        return integrationManager.executeRequest('chatwoot', (client) => client.get('/reports/conversations', { params }));
    }
    async getAgentAnalytics(params) {
        return integrationManager.executeRequest('chatwoot', (client) => client.get('/reports/agents', { params }));
    }
    // Bulk Operations
    async bulkUpdateConversations(conversationIds, updates) {
        return integrationManager.executeRequest('chatwoot', (client) => client.post('/conversations/bulk_update', {
            conversation_ids: conversationIds,
            ...updates,
        }));
    }
    async bulkAssignConversations(conversationIds, assigneeId) {
        return this.bulkUpdateConversations(conversationIds, { assignee_id: assigneeId });
    }
    async bulkResolveConversations(conversationIds) {
        return this.bulkUpdateConversations(conversationIds, { status: 'resolved' });
    }
    // Search
    async searchConversations(query, filters) {
        return integrationManager.executeRequest('chatwoot', (client) => client.get('/conversations/search', {
            params: {
                q: query,
                ...filters
            }
        }));
    }
    async searchContacts(query) {
        return integrationManager.executeRequest('chatwoot', (client) => client.get('/contacts/search', { params: { q: query } }));
    }
}
export const chatwootAdapter = new ChatwootAdapter();
//# sourceMappingURL=chatwoot-adapter.js.map