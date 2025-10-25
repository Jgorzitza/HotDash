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

import { APIClient, APIResponse } from './api-client';
import { integrationManager } from './integration-manager';

export interface ChatwootConversation {
  id: number;
  account_id: number;
  inbox_id: number;
  status: 'open' | 'resolved' | 'pending';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  unread_count: number;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  snoozed_until?: string;
  custom_attributes: Record<string, any>;
  meta: {
    sender: {
      id: number;
      name: string;
      email: string;
      phone_number?: string;
      avatar_url?: string;
    };
    assignee?: {
      id: number;
      name: string;
      email: string;
      avatar_url?: string;
    };
    team?: {
      id: number;
      name: string;
    };
    labels: string[];
    hmac_verified: boolean;
    external_id?: string;
  };
  contacts: ChatwootContact[];
  messages: ChatwootMessage[];
  can_reply: boolean;
  channel: string;
  additional_attributes: Record<string, any>;
}

export interface ChatwootContact {
  id: number;
  name: string;
  email?: string;
  phone_number?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  custom_attributes: Record<string, any>;
  additional_attributes: Record<string, any>;
}

export interface ChatwootMessage {
  id: number;
  content: string;
  message_type: 0 | 1; // 0 = incoming, 1 = outgoing
  created_at: string;
  updated_at: string;
  private: boolean;
  sender: {
    id: number;
    name: string;
    email: string;
    avatar_url?: string;
  };
  attachments: ChatwootAttachment[];
  conversation_id: number;
  inbox_id: number;
  sender_type: 'contact' | 'agent_bot' | 'agent';
  content_attributes: Record<string, any>;
}

export interface ChatwootAttachment {
  id: number;
  message_id: number;
  file_type: string;
  file_size: number;
  file_url: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatwootAgent {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  role: 'agent' | 'administrator';
  confirmed: boolean;
  available_name: string;
  created_at: string;
  updated_at: string;
  accounts: Array<{
    id: number;
    name: string;
    role: string;
  }>;
}

export interface ChatwootInbox {
  id: number;
  name: string;
  channel_type: 'web_widget' | 'facebook' | 'twitter' | 'twilio' | 'whatsapp' | 'telegram' | 'line' | 'instagram';
  avatar_url?: string;
  page_reload_url?: string;
  widget_color: string;
  website_url?: string;
  welcome_title: string;
  welcome_tagline: string;
  agent_bot_id?: number;
  created_at: string;
  updated_at: string;
}

export interface ChatwootLabel {
  id: number;
  title: string;
  description?: string;
  color: string;
  show_on_sidebar: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatwootConversationFilters {
  status?: 'open' | 'resolved' | 'pending';
  assignee_type?: 'me' | 'unassigned' | 'all';
  assignee_id?: number;
  inbox_id?: number;
  team_id?: number;
  labels?: string[];
  created_at_from?: string;
  created_at_to?: string;
  updated_at_from?: string;
  updated_at_to?: string;
  search?: string;
}

export class ChatwootAdapter {
  private client: APIClient;

  constructor() {
    const baseUrl = process.env.CHATWOOT_BASE_URL || 'https://app.chatwoot.com';
    const accountId = process.env.CHATWOOT_ACCOUNT_ID;

    this.client = new APIClient({
      baseURL: `${baseUrl}/api/v1/accounts/${accountId}`,
      auth: {
        type: 'api-key',
        apiKey: process.env.CHATWOOT_API_TOKEN!,
        apiKeyHeader: 'api_access_token',
      },
      rateLimit: {
        maxRequestsPerSecond: 10,
        burstSize: 30,
      },
    });
  }

  // Conversations
  async getConversations(filters?: ChatwootConversationFilters & {
    page?: number;
    per_page?: number;
  }): Promise<APIResponse<{ data: ChatwootConversation[]; meta: any }>> {
    return integrationManager.executeRequest('chatwoot', (client) =>
      client.get('/conversations', { params: filters })
    );
  }

  async getConversation(id: number): Promise<APIResponse<ChatwootConversation>> {
    return integrationManager.executeRequest('chatwoot', (client) =>
      client.get(`/conversations/${id}`)
    );
  }

  async updateConversation(id: number, updates: {
    status?: 'open' | 'resolved' | 'pending';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    assignee_id?: number;
    team_id?: number;
    custom_attributes?: Record<string, any>;
  }): Promise<APIResponse<ChatwootConversation>> {
    return integrationManager.executeRequest('chatwoot', (client) =>
      client.put(`/conversations/${id}`, updates)
    );
  }

  async assignConversation(id: number, assigneeId: number): Promise<APIResponse<ChatwootConversation>> {
    return integrationManager.executeRequest('chatwoot', (client) =>
      client.post(`/conversations/${id}/assignments`, { assignee_id: assigneeId })
    );
  }

  async unassignConversation(id: number): Promise<APIResponse<ChatwootConversation>> {
    return integrationManager.executeRequest('chatwoot', (client) =>
      client.delete(`/conversations/${id}/assignments`)
    );
  }

  async resolveConversation(id: number): Promise<APIResponse<ChatwootConversation>> {
    return integrationManager.executeRequest('chatwoot', (client) =>
      client.post(`/conversations/${id}/toggle_status`, { status: 'resolved' })
    );
  }

  async reopenConversation(id: number): Promise<APIResponse<ChatwootConversation>> {
    return integrationManager.executeRequest('chatwoot', (client) =>
      client.post(`/conversations/${id}/toggle_status`, { status: 'open' })
    );
  }

  // Messages
  async getMessages(conversationId: number, params?: {
    before?: number;
    after?: number;
    limit?: number;
  }): Promise<APIResponse<{ data: ChatwootMessage[] }>> {
    return integrationManager.executeRequest('chatwoot', (client) =>
      client.get(`/conversations/${conversationId}/messages`, { params })
    );
  }

  async sendMessage(conversationId: number, message: {
    content: string;
    message_type: 0 | 1;
    private?: boolean;
    attachments?: File[];
  }): Promise<APIResponse<ChatwootMessage>> {
    const formData = new FormData();
    formData.append('content', message.content);
    formData.append('message_type', message.message_type.toString());
    if (message.private) formData.append('private', 'true');
    
    if (message.attachments) {
      message.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
    }

    return integrationManager.executeRequest('chatwoot', (client) =>
      client.post(`/conversations/${conversationId}/messages`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    );
  }

  async createPrivateNote(conversationId: number, content: string): Promise<APIResponse<ChatwootMessage>> {
    return this.sendMessage(conversationId, {
      content,
      message_type: 0,
      private: true,
    });
  }

  async updateMessage(conversationId: number, messageId: number, content: string): Promise<APIResponse<ChatwootMessage>> {
    return integrationManager.executeRequest('chatwoot', (client) =>
      client.put(`/conversations/${conversationId}/messages/${messageId}`, { content })
    );
  }

  async deleteMessage(conversationId: number, messageId: number): Promise<APIResponse<void>> {
    return integrationManager.executeRequest('chatwoot', (client) =>
      client.delete(`/conversations/${conversationId}/messages/${messageId}`)
    );
  }

  // Labels
  async getLabels(): Promise<APIResponse<{ data: ChatwootLabel[] }>> {
    return integrationManager.executeRequest('chatwoot', (client) =>
      client.get('/labels')
    );
  }

  async createLabel(label: {
    title: string;
    description?: string;
    color?: string;
    show_on_sidebar?: boolean;
  }): Promise<APIResponse<ChatwootLabel>> {
    return integrationManager.executeRequest('chatwoot', (client) =>
      client.post('/labels', label)
    );
  }

  async addLabelToConversation(conversationId: number, labelId: number): Promise<APIResponse<void>> {
    return integrationManager.executeRequest('chatwoot', (client) =>
      client.post(`/conversations/${conversationId}/labels`, { labels: [labelId] })
    );
  }

  async removeLabelFromConversation(conversationId: number, labelId: number): Promise<APIResponse<void>> {
    return integrationManager.executeRequest('chatwoot', (client) =>
      client.delete(`/conversations/${conversationId}/labels/${labelId}`)
    );
  }

  // Contacts
  async getContacts(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    sort?: string;
  }): Promise<APIResponse<{ data: ChatwootContact[]; meta: any }>> {
    return integrationManager.executeRequest('chatwoot', (client) =>
      client.get('/contacts', { params })
    );
  }

  async getContact(id: number): Promise<APIResponse<ChatwootContact>> {
    return integrationManager.executeRequest('chatwoot', (client) =>
      client.get(`/contacts/${id}`)
    );
  }

  async createContact(contact: {
    name: string;
    email?: string;
    phone_number?: string;
    avatar_url?: string;
    custom_attributes?: Record<string, any>;
    additional_attributes?: Record<string, any>;
  }): Promise<APIResponse<ChatwootContact>> {
    return integrationManager.executeRequest('chatwoot', (client) =>
      client.post('/contacts', contact)
    );
  }

  async updateContact(id: number, contact: Partial<ChatwootContact>): Promise<APIResponse<ChatwootContact>> {
    return integrationManager.executeRequest('chatwoot', (client) =>
      client.put(`/contacts/${id}`, contact)
    );
  }

  async deleteContact(id: number): Promise<APIResponse<void>> {
    return integrationManager.executeRequest('chatwoot', (client) =>
      client.delete(`/contacts/${id}`)
    );
  }

  // Agents
  async getAgents(): Promise<APIResponse<{ data: ChatwootAgent[] }>> {
    return integrationManager.executeRequest('chatwoot', (client) =>
      client.get('/agents')
    );
  }

  async getAgent(id: number): Promise<APIResponse<ChatwootAgent>> {
    return integrationManager.executeRequest('chatwoot', (client) =>
      client.get(`/agents/${id}`)
    );
  }

  // Inboxes
  async getInboxes(): Promise<APIResponse<{ data: ChatwootInbox[] }>> {
    return integrationManager.executeRequest('chatwoot', (client) =>
      client.get('/inboxes')
    );
  }

  async getInbox(id: number): Promise<APIResponse<ChatwootInbox>> {
    return integrationManager.executeRequest('chatwoot', (client) =>
      client.get(`/inboxes/${id}`)
    );
  }

  // Analytics
  async getConversationAnalytics(params?: {
    type: 'account' | 'agent' | 'inbox' | 'label';
    id?: number;
    since?: string;
    until?: string;
  }): Promise<APIResponse<{
    total_conversations: number;
    open_conversations: number;
    resolved_conversations: number;
    pending_conversations: number;
    avg_first_response_time: number;
    avg_resolution_time: number;
    conversations_count: Array<{
      value: number;
      timestamp: string;
    }>;
  }>> {
    return integrationManager.executeRequest('chatwoot', (client) =>
      client.get('/reports/conversations', { params })
    );
  }

  async getAgentAnalytics(params?: {
    agent_id?: number;
    since?: string;
    until?: string;
  }): Promise<APIResponse<{
    agent_id: number;
    agent_name: string;
    conversations_count: number;
    avg_resolution_time: number;
    avg_first_response_time: number;
    total_messages: number;
  }>> {
    return integrationManager.executeRequest('chatwoot', (client) =>
      client.get('/reports/agents', { params })
    );
  }

  // Bulk Operations
  async bulkUpdateConversations(conversationIds: number[], updates: {
    status?: 'open' | 'resolved' | 'pending';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    assignee_id?: number;
    team_id?: number;
    labels?: number[];
  }): Promise<APIResponse<{ updated_count: number }>> {
    return integrationManager.executeRequest('chatwoot', (client) =>
      client.post('/conversations/bulk_update', {
        conversation_ids: conversationIds,
        ...updates,
      })
    );
  }

  async bulkAssignConversations(conversationIds: number[], assigneeId: number): Promise<APIResponse<{ updated_count: number }>> {
    return this.bulkUpdateConversations(conversationIds, { assignee_id: assigneeId });
  }

  async bulkResolveConversations(conversationIds: number[]): Promise<APIResponse<{ updated_count: number }>> {
    return this.bulkUpdateConversations(conversationIds, { status: 'resolved' });
  }

  // Search
  async searchConversations(query: string, filters?: {
    status?: 'open' | 'resolved' | 'pending';
    assignee_id?: number;
    inbox_id?: number;
  }): Promise<APIResponse<{ data: ChatwootConversation[]; meta: any }>> {
    return integrationManager.executeRequest('chatwoot', (client) =>
      client.get('/conversations/search', { 
        params: { 
          q: query, 
          ...filters 
        } 
      })
    );
  }

  async searchContacts(query: string): Promise<APIResponse<{ data: ChatwootContact[]; meta: any }>> {
    return integrationManager.executeRequest('chatwoot', (client) =>
      client.get('/contacts/search', { params: { q: query } })
    );
  }
}

export const chatwootAdapter = new ChatwootAdapter();
