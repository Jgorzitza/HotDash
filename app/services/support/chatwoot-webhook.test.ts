/**
 * Chatwoot Webhook Handler Tests
 * Task 11
 */
import { processWebhook } from './chatwoot-webhook';

export async function testWebhookHandler() {
  const testPayload = {
    event: 'message_created' as const,
    id: 1,
    conversation: {
      id: 101,
      inbox_id: 1,
      status: 'open' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    message: {
      id: 201,
      content: 'Test message',
      message_type: 'incoming' as const,
      created_at: new Date().toISOString(),
    },
  };
  
  const result = await processWebhook(testPayload);
  console.log('✅ Webhook test:', result.success);
  return result;
}
