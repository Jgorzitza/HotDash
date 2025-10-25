export function chatwootClient(cfg) {
    const h = { api_access_token: cfg.token, "content-type": "application/json" };
    const base = `${cfg.baseUrl}/api/v1/accounts/${cfg.accountId}`;
    return {
        async listOpenConversations(page = 1) {
            const r = await fetch(`${base}/conversations?page=${page}`, {
                headers: h,
            });
            if (!r.ok)
                throw new Error(`Chatwoot ${r.status}`);
            const j = await r.json();
            return j.data;
        },
        async listMessages(conversationId) {
            const r = await fetch(`${base}/conversations/${conversationId}/messages`, { headers: h });
            if (!r.ok)
                throw new Error(`Chatwoot ${r.status}`);
            const j = await r.json();
            return j.payload;
        },
        async sendReply(conversationId, content) {
            const r = await fetch(`${base}/conversations/${conversationId}/messages`, {
                method: "POST",
                headers: h,
                body: JSON.stringify({ content, message_type: 1 }),
            });
            if (!r.ok)
                throw new Error(`Chatwoot ${r.status}`);
            return await r.json();
        },
        async addLabel(conversationId, label) {
            const r = await fetch(`${base}/conversations/${conversationId}/labels`, {
                method: "POST",
                headers: h,
                body: JSON.stringify({ labels: [label] }),
            });
            if (!r.ok)
                throw new Error(`Chatwoot ${r.status}`);
            return await r.json();
        },
        async resolveConversation(conversationId) {
            const r = await fetch(`${base}/conversations/${conversationId}/toggle_status`, {
                method: "POST",
                headers: h,
                body: JSON.stringify({ status: "resolved" }),
            });
            if (!r.ok)
                throw new Error(`Chatwoot ${r.status}`);
            return await r.json();
        },
        async createPrivateNote(conversationId, content) {
            const r = await fetch(`${base}/conversations/${conversationId}/messages`, {
                method: "POST",
                headers: h,
                body: JSON.stringify({ content, message_type: 0, private: true }),
            });
            if (!r.ok)
                throw new Error(`Chatwoot ${r.status}`);
            return await r.json();
        },
        async assignAgent(conversationId, assigneeId) {
            const r = await fetch(`${base}/conversations/${conversationId}/assignments`, {
                method: "POST",
                headers: h,
                body: JSON.stringify({ assignee_id: assigneeId }),
            });
            if (!r.ok)
                throw new Error(`Chatwoot ${r.status}`);
            return await r.json();
        },
        async getConversationDetails(conversationId) {
            const r = await fetch(`${base}/conversations/${conversationId}`, {
                headers: h,
            });
            if (!r.ok)
                throw new Error(`Chatwoot ${r.status}`);
            return await r.json();
        },
    };
}
//# sourceMappingURL=chatwoot.js.map