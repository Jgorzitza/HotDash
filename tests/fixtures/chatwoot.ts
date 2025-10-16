/**
 * Chatwoot Fixtures
 * 
 * Mock data for testing Chatwoot integrations.
 * Backlog task #20: Fixtures for Chatwoot + OpenAI
 */

import type { Conversation } from '../../app/agents/tools/chatwoot';

export const mockConversations: Conversation[] = [
  {
    id: 1,
    account_id: 1,
    inbox_id: 1,
    status: 'open',
    assignee_id: null,
    contact_id: 101,
    messages: [
      {
        id: 1,
        content: 'Hi, I ordered a set of AN-6 fittings last week (order #12345) and I haven\'t received any tracking information yet. Can you help me find out where my order is?',
        message_type: 'incoming',
        created_at: '2025-10-15T10:00:00Z',
        sender: {
          id: 101,
          name: 'John Doe',
          email: 'john.doe@example.com',
        },
      },
    ],
    created_at: '2025-10-15T10:00:00Z',
    updated_at: '2025-10-15T10:00:00Z',
  },
  {
    id: 2,
    account_id: 1,
    inbox_id: 1,
    status: 'open',
    assignee_id: null,
    contact_id: 102,
    messages: [
      {
        id: 2,
        content: 'I received my order yesterday but the fittings are the wrong size. I need AN-8 but got AN-6. Can I return these and get the right size?',
        message_type: 'incoming',
        created_at: '2025-10-15T11:00:00Z',
        sender: {
          id: 102,
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
        },
      },
    ],
    created_at: '2025-10-15T11:00:00Z',
    updated_at: '2025-10-15T11:00:00Z',
  },
  {
    id: 3,
    account_id: 1,
    inbox_id: 1,
    status: 'open',
    assignee_id: null,
    contact_id: 103,
    messages: [
      {
        id: 3,
        content: 'What is your return policy? I might need to return some items.',
        message_type: 'incoming',
        created_at: '2025-10-15T12:00:00Z',
        sender: {
          id: 103,
          name: 'Bob Johnson',
          email: 'bob.johnson@example.com',
        },
      },
    ],
    created_at: '2025-10-15T12:00:00Z',
    updated_at: '2025-10-15T12:00:00Z',
  },
];

export const mockEscalatedConversation: Conversation = {
  id: 4,
  account_id: 1,
  inbox_id: 1,
  status: 'open',
  assignee_id: null,
  contact_id: 104,
  messages: [
    {
      id: 4,
      content: 'This is unacceptable! I will contact my lawyer if you don\'t refund me immediately. I\'ve been waiting for 3 weeks!',
      message_type: 'incoming',
      created_at: '2025-10-15T13:00:00Z',
      sender: {
        id: 104,
        name: 'Angry Customer',
        email: 'angry@example.com',
      },
    },
  ],
  created_at: '2025-10-15T13:00:00Z',
  updated_at: '2025-10-15T13:00:00Z',
};

export const mockVIPConversation: Conversation = {
  id: 5,
  account_id: 1,
  inbox_id: 1,
  status: 'open',
  assignee_id: null,
  contact_id: 105,
  messages: [
    {
      id: 5,
      content: 'Hi, I\'m a regular customer and I have a question about bulk ordering. Can you help?',
      message_type: 'incoming',
      created_at: '2025-10-15T14:00:00Z',
      sender: {
        id: 105,
        name: 'VIP Customer',
        email: 'vip@example.com',
      },
    },
  ],
  created_at: '2025-10-15T14:00:00Z',
  updated_at: '2025-10-15T14:00:00Z',
};

