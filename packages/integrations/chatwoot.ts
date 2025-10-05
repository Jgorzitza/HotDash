// packages/integrations/chatwoot.ts
export interface ChatwootConfig { baseUrl: string; token: string; accountId: number; }
export interface Conversation {
  id: number;
  inbox_id: number;
  status: 'open'|'resolved'|'pending';
  created_at: number;
  meta?: any;
  tags?: string[];
  contacts?: Array<{ name?: string | null }>;
}
export interface Message { id: number; content: string; message_type: 0|1; created_at: number; }

export function chatwootClient(cfg: ChatwootConfig) {
  const h = { 'api_access_token': cfg.token, 'content-type': 'application/json' };
  const base = `${cfg.baseUrl}/api/v1/accounts/${cfg.accountId}`;
  return {
    async listOpenConversations(page=1) {
      const r = await fetch(`${base}/conversations?page=${page}`, { headers: h });
      if (!r.ok) throw new Error(`Chatwoot ${r.status}`);
      const j = await r.json();
      return j.data as Conversation[];
    },
    async listMessages(conversationId: number) {
      const r = await fetch(`${base}/conversations/${conversationId}/messages`, { headers: h });
      if (!r.ok) throw new Error(`Chatwoot ${r.status}`);
      const j = await r.json();
      return j.payload as Message[];
    },
    async sendReply(conversationId: number, content: string) {
      const r = await fetch(`${base}/conversations/${conversationId}/messages`, {
        method: 'POST', headers: h, body: JSON.stringify({ content, message_type: 1 })
      });
      if (!r.ok) throw new Error(`Chatwoot ${r.status}`);
      return await r.json();
    }
  };
}
