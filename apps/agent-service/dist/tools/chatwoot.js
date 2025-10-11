import { tool } from '@openai/agents';
import { z } from 'zod';
import fetch from 'node-fetch';
const base = process.env.CHATWOOT_BASE_URL;
const token = process.env.CHATWOOT_API_TOKEN;
const accountId = process.env.CHATWOOT_ACCOUNT_ID;
/**
 * Post JSON to Chatwoot API
 */
async function postJSON(path, body) {
    const res = await fetch(`${base}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api_access_token': token,
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Chatwoot ${path} failed: ${res.status} ${text}`);
    }
    return res.json();
}
/**
 * Create a private note in a conversation for human review.
 * Use this to propose drafts, summaries, and next actions.
 *
 * Private notes are only visible to agents/operators, not customers.
 * No approval required since it's internal only.
 */
export const cwCreatePrivateNote = tool({
    name: 'chatwoot_create_private_note',
    description: 'Create a private note (internal only) in a Chatwoot conversation so an agent can review/approve.',
    parameters: z.object({
        conversationId: z.number().describe('Chatwoot conversation ID'),
        content: z.string().min(1).describe('Content of the private note'),
    }),
    async execute({ conversationId, content }) {
        try {
            const path = `/api/v1/accounts/${accountId}/conversations/${conversationId}/messages`;
            const payload = {
                content,
                private: true,
                content_type: 'text'
            };
            const json = await postJSON(path, payload);
            return { ok: true, id: json.id, message: 'Private note created successfully' };
        }
        catch (error) {
            console.error('[Chatwoot Private Note] Error:', error.message);
            return `Error creating private note: ${error.message}`;
        }
    },
});
/**
 * Send a public reply to the customer.
 *
 * ⚠️ REQUIRES APPROVAL - This sends a message visible to the customer.
 * Keep this behind needsApproval for safety.
 */
export const cwSendPublicReply = tool({
    name: 'chatwoot_send_public_reply',
    description: 'Send a public reply in a Chatwoot conversation to the customer. Use only after a human approves the draft.',
    parameters: z.object({
        conversationId: z.number().describe('Chatwoot conversation ID'),
        content: z.string().min(1).describe('Content of the public reply to send'),
    }),
    needsApproval: true, // 🔒 Human approval required
    async execute({ conversationId, content }) {
        try {
            const path = `/api/v1/accounts/${accountId}/conversations/${conversationId}/messages`;
            const payload = {
                content,
                private: false,
                content_type: 'text'
            };
            const json = await postJSON(path, payload);
            return { ok: true, id: json.id, message: 'Public reply sent successfully' };
        }
        catch (error) {
            console.error('[Chatwoot Public Reply] Error:', error.message);
            return `Error sending public reply: ${error.message}`;
        }
    },
});
//# sourceMappingURL=chatwoot.js.map