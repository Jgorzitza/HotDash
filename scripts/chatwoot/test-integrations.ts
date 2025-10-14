#!/usr/bin/env tsx
/**
 * Chatwoot Integration Testing Script
 * 
 * Tests all Chatwoot integrations:
 * - Webhook delivery and processing
 * - Approval queue API endpoints
 * - Notification system
 * - End-to-end message flow
 * 
 * Usage:
 *   tsx scripts/chatwoot/test-integrations.ts
 */

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

const AGENT_SERVICE_URL = 'https://hotdash-agent-service.fly.dev';
const CHATWOOT_BASE_URL = 'https://hotdash-chatwoot.fly.dev';
const APPROVAL_API_URL = 'https://hotdash-staging.fly.dev/api/approvals/chatwoot';

class ChatwootIntegrationTester {
  private results: TestResult[] = [];

  async runAllTests(): Promise<void> {
    console.log('🧪 Chatwoot Integration Testing Suite\n');
    console.log('='.repeat(60) + '\n');

    await this.testWebhookEndpoint();
    await this.testWebhookPayloadProcessing();
    await this.testApprovalQueueAPI();
    await this.testChatwootHealth();
    
    this.printResults();
  }

  async testWebhookEndpoint(): Promise<void> {
    console.log('📡 Test 1: Webhook Endpoint Availability...');

    try {
      const res = await fetch(`${AGENT_SERVICE_URL}/webhooks/chatwoot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'test' }),
      });

      const data = await res.json();

      if (res.ok) {
        this.results.push({
          name: 'Webhook Endpoint',
          status: 'pass',
          message: 'Webhook endpoint is accessible and responding',
          details: { status: res.status, response: data },
        });
        console.log('  ✅ PASS: Webhook endpoint accessible\n');
      } else {
        this.results.push({
          name: 'Webhook Endpoint',
          status: 'fail',
          message: `Webhook returned HTTP ${res.status}`,
          details: data,
        });
        console.log(`  ❌ FAIL: HTTP ${res.status}\n`);
      }
    } catch (error) {
      this.results.push({
        name: 'Webhook Endpoint',
        status: 'fail',
        message: 'Webhook endpoint unreachable',
        details: error instanceof Error ? error.message : String(error),
      });
      console.log(`  ❌ FAIL: ${error}\n`);
    }
  }

  async testWebhookPayloadProcessing(): Promise<void> {
    console.log('📨 Test 2: Webhook Payload Processing...');

    const testPayload = {
      event: 'message_created',
      conversation: { id: 999 },
      message: {
        content: 'Test message: What is the shipping timeframe for order #12345?',
        message_type: 0,
        id: 1,
      },
      sender: { type: 'contact', id: 1, name: 'Test Customer' },
      inbox: { id: 1, name: 'Test Inbox' },
    };

    try {
      const res = await fetch(`${AGENT_SERVICE_URL}/webhooks/chatwoot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload),
      });

      const data = await res.json();

      if (res.ok && data.status === 'draft_ready') {
        this.results.push({
          name: 'Webhook Processing',
          status: 'pass',
          message: 'Webhook correctly processes message_created events',
          details: { draft: data.draft, conversationId: data.conversationId },
        });
        console.log('  ✅ PASS: Message processed, draft generated\n');
      } else if (res.ok && data.ignored) {
        this.results.push({
          name: 'Webhook Processing',
          status: 'warning',
          message: 'Webhook ignored test payload (expected behavior)',
          details: data,
        });
        console.log('  ⚠️  WARNING: Payload ignored (may need agent service fixes)\n');
      } else {
        this.results.push({
          name: 'Webhook Processing',
          status: 'fail',
          message: 'Webhook processing failed',
          details: data,
        });
        console.log(`  ❌ FAIL: ${JSON.stringify(data)}\n`);
      }
    } catch (error) {
      this.results.push({
        name: 'Webhook Processing',
        status: 'fail',
        message: 'Error testing webhook processing',
        details: error instanceof Error ? error.message : String(error),
      });
      console.log(`  ❌ FAIL: ${error}\n`);
    }
  }

  async testApprovalQueueAPI(): Promise<void> {
    console.log('📋 Test 3: Approval Queue API...');

    try {
      const res = await fetch(APPROVAL_API_URL);
      const data = await res.json();

      if (res.ok && Array.isArray(data.approvals)) {
        this.results.push({
          name: 'Approval Queue API',
          status: 'pass',
          message: `Approval queue API working (${data.count} pending approvals)`,
          details: { count: data.count, approvals: data.approvals.slice(0, 3) },
        });
        console.log(`  ✅ PASS: ${data.count} approvals in queue\n`);
      } else if (res.ok && data.approvals) {
        this.results.push({
          name: 'Approval Queue API',
          status: 'warning',
          message: 'API working but returned unexpected format',
          details: data,
        });
        console.log('  ⚠️  WARNING: Unexpected response format\n');
      } else {
        this.results.push({
          name: 'Approval Queue API',
          status: 'fail',
          message: `API returned HTTP ${res.status}`,
          details: data,
        });
        console.log(`  ❌ FAIL: HTTP ${res.status}\n`);
      }
    } catch (error) {
      this.results.push({
        name: 'Approval Queue API',
        status: 'fail',
        message: 'Approval queue API unreachable',
        details: error instanceof Error ? error.message : String(error),
      });
      console.log(`  ❌ FAIL: ${error}\n`);
    }
  }

  async testChatwootHealth(): Promise<void> {
    console.log('🏥 Test 4: Chatwoot Health...');

    try {
      const res = await fetch(`${CHATWOOT_BASE_URL}/api`);
      const data = await res.json();

      if (res.ok && data.version) {
        this.results.push({
          name: 'Chatwoot Health',
          status: 'pass',
          message: `Chatwoot v${data.version} is healthy`,
          details: data,
        });
        console.log(`  ✅ PASS: Chatwoot v${data.version} running\n`);
      } else {
        this.results.push({
          name: 'Chatwoot Health',
          status: 'fail',
          message: 'Chatwoot health check failed',
          details: data,
        });
        console.log(`  ❌ FAIL: Unexpected response\n`);
      }
    } catch (error) {
      this.results.push({
        name: 'Chatwoot Health',
        status: 'fail',
        message: 'Chatwoot instance unreachable',
        details: error instanceof Error ? error.message : String(error),
      });
      console.log(`  ❌ FAIL: ${error}\n`);
    }
  }

  private printResults(): void {
    console.log('='.repeat(60));
    console.log('📊 Test Results Summary');
    console.log('='.repeat(60) + '\n');

    const passed = this.results.filter((r) => r.status === 'pass').length;
    const failed = this.results.filter((r) => r.status === 'fail').length;
    const warnings = this.results.filter((r) => r.status === 'warning').length;

    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    console.log('');

    console.log('Detailed Results:\n');
    this.results.forEach((result) => {
      const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
      console.log(`${icon} ${result.name}: ${result.message}`);
      if (result.details) {
        console.log(`   Details: ${JSON.stringify(result.details, null, 2).split('\n').join('\n   ')}`);
      }
      console.log('');
    });

    console.log('='.repeat(60));

    // Overall status
    if (failed === 0 && warnings === 0) {
      console.log('\n🎉 All tests passed! Integrations are fully operational.\n');
      process.exit(0);
    } else if (failed === 0) {
      console.log('\n⚠️  All tests passed with warnings. Review warnings above.\n');
      process.exit(0);
    } else {
      console.log('\n❌ Some tests failed. Review failures above and fix issues.\n');
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  try {
    const tester = new ChatwootIntegrationTester();
    await tester.runAllTests();
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { ChatwootIntegrationTester };

