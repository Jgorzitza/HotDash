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
import { APIResponse } from './api-client';
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
    message_type: 0 | 1;
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
export declare class ChatwootAdapter {
    private client;
    constructor();
    getConversations(filters?: ChatwootConversationFilters & {
        page?: number;
        per_page?: number;
    }): Promise<APIResponse<{
        data: ChatwootConversation[];
        meta: any;
    }>>;
    getConversation(id: number): Promise<APIResponse<ChatwootConversation>>;
    updateConversation(id: number, updates: {
        status?: 'open' | 'resolved' | 'pending';
        priority?: 'low' | 'medium' | 'high' | 'urgent';
        assignee_id?: number;
        team_id?: number;
        custom_attributes?: Record<string, any>;
    }): Promise<APIResponse<ChatwootConversation>>;
    assignConversation(id: number, assigneeId: number): Promise<APIResponse<ChatwootConversation>>;
    unassignConversation(id: number): Promise<APIResponse<ChatwootConversation>>;
    resolveConversation(id: number): Promise<APIResponse<ChatwootConversation>>;
    reopenConversation(id: number): Promise<APIResponse<ChatwootConversation>>;
    getMessages(conversationId: number, params?: {
        before?: number;
        after?: number;
        limit?: number;
    }): Promise<APIResponse<{
        data: ChatwootMessage[];
    }>>;
    sendMessage(conversationId: number, message: {
        content: string;
        message_type: 0 | 1;
        private?: boolean;
        attachments?: File[];
    }): Promise<APIResponse<ChatwootMessage>>;
    createPrivateNote(conversationId: number, content: string): Promise<APIResponse<ChatwootMessage>>;
    updateMessage(conversationId: number, messageId: number, content: string): Promise<APIResponse<ChatwootMessage>>;
    deleteMessage(conversationId: number, messageId: number): Promise<APIResponse<void>>;
    getLabels(): Promise<APIResponse<{
        data: ChatwootLabel[];
    }>>;
    createLabel(label: {
        title: string;
        description?: string;
        color?: string;
        show_on_sidebar?: boolean;
    }): Promise<APIResponse<ChatwootLabel>>;
    addLabelToConversation(conversationId: number, labelId: number): Promise<APIResponse<void>>;
    removeLabelFromConversation(conversationId: number, labelId: number): Promise<APIResponse<void>>;
    getContacts(params?: {
        page?: number;
        per_page?: number;
        search?: string;
        sort?: string;
    }): Promise<APIResponse<{
        data: ChatwootContact[];
        meta: any;
    }>>;
    getContact(id: number): Promise<APIResponse<ChatwootContact>>;
    createContact(contact: {
        name: string;
        email?: string;
        phone_number?: string;
        avatar_url?: string;
        custom_attributes?: Record<string, any>;
        additional_attributes?: Record<string, any>;
    }): Promise<APIResponse<ChatwootContact>>;
    updateContact(id: number, contact: Partial<ChatwootContact>): Promise<APIResponse<ChatwootContact>>;
    deleteContact(id: number): Promise<APIResponse<void>>;
    getAgents(): Promise<APIResponse<{
        data: ChatwootAgent[];
    }>>;
    getAgent(id: number): Promise<APIResponse<ChatwootAgent>>;
    getInboxes(): Promise<APIResponse<{
        data: ChatwootInbox[];
    }>>;
    getInbox(id: number): Promise<APIResponse<ChatwootInbox>>;
    getConversationAnalytics(params?: {
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
    }>>;
    getAgentAnalytics(params?: {
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
    }>>;
    bulkUpdateConversations(conversationIds: number[], updates: {
        status?: 'open' | 'resolved' | 'pending';
        priority?: 'low' | 'medium' | 'high' | 'urgent';
        assignee_id?: number;
        team_id?: number;
        labels?: number[];
    }): Promise<APIResponse<{
        updated_count: number;
    }>>;
    bulkAssignConversations(conversationIds: number[], assigneeId: number): Promise<APIResponse<{
        updated_count: number;
    }>>;
    bulkResolveConversations(conversationIds: number[]): Promise<APIResponse<{
        updated_count: number;
    }>>;
    searchConversations(query: string, filters?: {
        status?: 'open' | 'resolved' | 'pending';
        assignee_id?: number;
        inbox_id?: number;
    }): Promise<APIResponse<{
        data: ChatwootConversation[];
        meta: any;
    }>>;
    searchContacts(query: string): Promise<APIResponse<{
        data: ChatwootContact[];
        meta: any;
    }>>;
}
export declare const chatwootAdapter: ChatwootAdapter;
//# sourceMappingURL=chatwoot-adapter.d.ts.map