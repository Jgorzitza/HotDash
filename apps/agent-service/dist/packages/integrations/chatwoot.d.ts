export interface ChatwootConfig {
    baseUrl: string;
    token: string;
    accountId: number;
}
export interface Conversation {
    id: number;
    inbox_id: number;
    status: "open" | "resolved" | "pending";
    created_at: number;
    meta?: any;
    tags?: string[];
    contacts?: Array<{
        name?: string | null;
    }>;
}
export interface Message {
    id: number;
    content: string;
    message_type: 0 | 1;
    created_at: number;
}
export declare function chatwootClient(cfg: ChatwootConfig): {
    listOpenConversations(page?: number): Promise<Conversation[]>;
    listMessages(conversationId: number): Promise<Message[]>;
    sendReply(conversationId: number, content: string): Promise<unknown>;
    addLabel(conversationId: number, label: string): Promise<unknown>;
    resolveConversation(conversationId: number): Promise<unknown>;
    createPrivateNote(conversationId: number, content: string): Promise<unknown>;
    assignAgent(conversationId: number, assigneeId: number): Promise<unknown>;
    getConversationDetails(conversationId: number): Promise<unknown>;
};
//# sourceMappingURL=chatwoot.d.ts.map