/**
 * Chatwoot Read Tool
 * 
 * Server-side tool for reading Chatwoot conversations and messages.
 * Backlog task #2: Chatwoot read tool (conversations, messages)
 */

import { tool } from '@openai/agents';
import { z } from 'zod';

/**
 * Conversation schema
 */
export const ConversationSchema = z.object({
  id: z.number(),
  account_id: z.number(),
  inbox_id: z.number(),
  status: z.enum(['open', 'resolved', 'pending']),
  assignee_id: z.number().nullable(),
  contact_id: z.number(),
  messages: z.array(z.object({
    id: z.number(),
    content: z.string(),
    message_type: z.enum(['incoming', 'outgoing']),
    created_at: z.string(),
    sender: z.object({
      id: z.number(),
      name: z.string(),
      email: z.string().optional(),
    }),
  })),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Conversation = z.infer<typeof ConversationSchema>;

/**
 * Get Chatwoot conversation
 */
export const chatwootGetConversationTool = tool({
  name: 'cw_get_conversation',
  description: 'Get a Chatwoot conversation with all messages',
  parameters: z.object({
    conversationId: z.number().describe('Chatwoot conversation ID'),
  }),
  execute: async ({ conversationId }) => {
    console.log('[Chatwoot] Getting conversation:', conversationId);

    // TODO: Implement actual Chatwoot API call
    // const response = await fetch(
    //   `${process.env.CHATWOOT_URL}/api/v1/accounts/${accountId}/conversations/${conversationId}`,
    //   {
    //     headers: {
    //       'api_access_token': process.env.CHATWOOT_API_TOKEN,
    //     },
    //   }
    // );

    // Mock data
    return {
      id: conversationId,
      account_id: 1,
      inbox_id: 1,
      status: 'open',
      assignee_id: null,
      contact_id: 123,
      messages: [
        {
          id: 1,
          content: 'Where is my order #12345?',
          message_type: 'incoming',
          created_at: new Date().toISOString(),
          sender: {
            id: 123,
            name: 'John Doe',
            email: 'john@example.com',
          },
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },
});

/**
 * List Chatwoot conversations
 */
export const chatwootListConversationsTool = tool({
  name: 'cw_list_conversations',
  description: 'List Chatwoot conversations with filters',
  parameters: z.object({
    status: z.enum(['open', 'resolved', 'pending']).optional(),
    assigneeId: z.number().optional(),
    inboxId: z.number().optional(),
    page: z.number().default(1),
  }),
  execute: async ({ status, assigneeId, inboxId, page }) => {
    console.log('[Chatwoot] Listing conversations:', { status, assigneeId, inboxId, page });

    // TODO: Implement actual Chatwoot API call
    // Mock data
    return {
      conversations: [
        {
          id: 1,
          status: 'open',
          contact: {
            name: 'John Doe',
            email: 'john@example.com',
          },
          last_message: 'Where is my order?',
          updated_at: new Date().toISOString(),
        },
      ],
      total: 1,
      page,
    };
  },
});

