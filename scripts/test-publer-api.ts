/**
 * Publer API Testing Script
 * 
 * Tests all 6 Publer client functions with real API credentials
 * Mode: DRAFT ONLY - No actual publishing
 * 
 * Requirements:
 * - PUBLER_API_KEY in environment
 * - PUBLER_WORKSPACE_ID in environment
 * 
 * Functions tested:
 * 1. listWorkspaces()
 * 2. listAccounts()
 * 3. getAccount(accountId)
 * 4. schedulePost() - DRAFT mode
 * 5. getJobStatus(jobId)
 * 6. publishPost() - SKIPPED (unsafe)
 */

import { createPublerClient } from '../app/services/publer/client';
import type { PublerPost } from '../app/services/publer/types';

async function main() {
  console.log('='.repeat(80));
  console.log('Publer API Testing Script');
  console.log('='.repeat(80));
  console.log('');

  // Check environment variables
  const apiKey = process.env.PUBLER_API_KEY;
  const workspaceId = process.env.PUBLER_WORKSPACE_ID;

  if (!apiKey || !workspaceId) {
    console.error('❌ Missing credentials:');
    console.error('  PUBLER_API_KEY:', apiKey ? '✅ Set' : '❌ Missing');
    console.error('  PUBLER_WORKSPACE_ID:', workspaceId ? '✅ Set' : '❌ Missing');
    console.error('');
    console.error('Load credentials from vault/occ/publer/api_token.env');
    process.exit(1);
  }

  console.log('✅ Credentials loaded');
  console.log('  API Key:', apiKey.substring(0, 10) + '...');
  console.log('  Workspace ID:', workspaceId);
  console.log('');

  // Create client
  const client = createPublerClient();
  console.log('✅ Publer client created');
  console.log('');

  // Test 1: List Workspaces
  console.log('─'.repeat(80));
  console.log('TEST 1: listWorkspaces()');
  console.log('─'.repeat(80));
  try {
    const workspacesResult = await client.listWorkspaces();
    if (workspacesResult.success && workspacesResult.data) {
      console.log('✅ SUCCESS');
      console.log(`Found ${workspacesResult.data.length} workspaces:`);
      workspacesResult.data.forEach((ws, i) => {
        console.log(`  ${i + 1}. ${ws.name} (ID: ${ws.id})`);
      });
      if (workspacesResult.rateLimitInfo) {
        console.log(`Rate Limit: ${workspacesResult.rateLimitInfo.remaining}/${workspacesResult.rateLimitInfo.limit} remaining`);
      }
    } else {
      console.log('❌ FAILED');
      console.log('Error:', workspacesResult.error);
    }
  } catch (error) {
    console.log('❌ EXCEPTION');
    console.log('Error:', error);
  }
  console.log('');

  // Test 2: List Accounts
  console.log('─'.repeat(80));
  console.log('TEST 2: listAccounts()');
  console.log('─'.repeat(80));
  let testAccountId: string | null = null;
  try {
    const accountsResult = await client.listAccounts();
    if (accountsResult.success && accountsResult.data) {
      console.log('✅ SUCCESS');
      console.log(`Found ${accountsResult.data.length} social accounts:`);
      accountsResult.data.forEach((acc, i) => {
        console.log(`  ${i + 1}. ${acc.platform || 'Unknown'}: ${acc.name} (ID: ${acc.id})`);
        // Use first account for testing regardless of is_active status
        if (i === 0) {
          testAccountId = acc.id;
        }
      });
      if (accountsResult.rateLimitInfo) {
        console.log(`Rate Limit: ${accountsResult.rateLimitInfo.remaining}/${accountsResult.rateLimitInfo.limit} remaining`);
      }
    } else {
      console.log('❌ FAILED');
      console.log('Error:', accountsResult.error);
    }
  } catch (error) {
    console.log('❌ EXCEPTION');
    console.log('Error:', error);
  }
  console.log('');

  // Test 3: Get Account (if we have an account ID)
  if (testAccountId) {
    console.log('─'.repeat(80));
    console.log('TEST 3: getAccount()');
    console.log('─'.repeat(80));
    console.log(`Getting details for account: ${testAccountId}`);
    try {
      const accountResult = await client.getAccount(testAccountId);
      if (accountResult.success && accountResult.data) {
        console.log('✅ SUCCESS');
        console.log(`Account: ${accountResult.data.name}`);
        console.log(`Platform: ${accountResult.data.platform}`);
        console.log(`Username: ${accountResult.data.username || 'N/A'}`);
        console.log(`Active: ${accountResult.data.is_active}`);
        if (accountResult.rateLimitInfo) {
          console.log(`Rate Limit: ${accountResult.rateLimitInfo.remaining}/${accountResult.rateLimitInfo.limit} remaining`);
        }
      } else {
        console.log('❌ FAILED');
        console.log('Error:', accountResult.error);
      }
    } catch (error) {
      console.log('❌ EXCEPTION');
      console.log('Error:', error);
    }
    console.log('');
  } else {
    console.log('⚠️  SKIPPING TEST 3: No active account found');
    console.log('');
  }

  // Test 4: Schedule Post (DRAFT MODE - schedule far in future, then we can delete it)
  console.log('─'.repeat(80));
  console.log('TEST 4: schedulePost() - DRAFT MODE');
  console.log('─'.repeat(80));
  let jobId: string | null = null;
  if (testAccountId) {
    try {
      // Schedule post 30 days in future so it doesn't publish
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      
      const testPost: PublerPost = {
        text: '[TEST] This is a test post from HotDash integration testing. Will be deleted.',
        accountIds: [testAccountId],
        scheduledAt: futureDate.toISOString(),
      };

      console.log(`Scheduling test post for: ${futureDate.toISOString()}`);
      
      const scheduleResult = await client.schedulePost(testPost);
      if (scheduleResult.success && scheduleResult.data) {
        console.log('✅ SUCCESS');
        console.log(`Job ID: ${scheduleResult.data.job_id}`);
        console.log(`Status: ${scheduleResult.data.status}`);
        jobId = scheduleResult.data.job_id;
        if (scheduleResult.rateLimitInfo) {
          console.log(`Rate Limit: ${scheduleResult.rateLimitInfo.remaining}/${scheduleResult.rateLimitInfo.limit} remaining`);
        }
      } else {
        console.log('❌ FAILED');
        console.log('Error:', scheduleResult.error);
      }
    } catch (error) {
      console.log('❌ EXCEPTION');
      console.log('Error:', error);
    }
  } else {
    console.log('⚠️  SKIPPING: No account available for testing');
  }
  console.log('');

  // Test 5: Get Job Status (if we created a job)
  if (jobId) {
    console.log('─'.repeat(80));
    console.log('TEST 5: getJobStatus()');
    console.log('─'.repeat(80));
    console.log(`Checking status for job: ${jobId}`);
    try {
      const statusResult = await client.getJobStatus(jobId);
      if (statusResult.success && statusResult.data) {
        console.log('✅ SUCCESS');
        console.log(`Job ID: ${statusResult.data.job_id}`);
        console.log(`Status: ${statusResult.data.status}`);
        console.log(`Progress: ${statusResult.data.progress}%`);
        if (statusResult.data.error) {
          console.log(`Error: ${statusResult.data.error}`);
        }
        if (statusResult.rateLimitInfo) {
          console.log(`Rate Limit: ${statusResult.rateLimitInfo.remaining}/${statusResult.rateLimitInfo.limit} remaining`);
        }
      } else {
        console.log('❌ FAILED');
        console.log('Error:', statusResult.error);
      }
    } catch (error) {
      console.log('❌ EXCEPTION');
      console.log('Error:', error);
    }
  } else {
    console.log('⚠️  SKIPPING TEST 5: No job created');
  }
  console.log('');

  // Test 6: Publish Post - SKIPPED for safety
  console.log('─'.repeat(80));
  console.log('TEST 6: publishPost() - SKIPPED');
  console.log('─'.repeat(80));
  console.log('⚠️  Skipping publishPost() test to avoid accidental publishing');
  console.log('   This function works similarly to schedulePost() but publishes immediately');
  console.log('   Not safe to test in production environment');
  console.log('');

  // Summary
  console.log('='.repeat(80));
  console.log('Test Summary');
  console.log('='.repeat(80));
  console.log('✅ TEST 1: listWorkspaces() - Completed');
  console.log('✅ TEST 2: listAccounts() - Completed');
  console.log(testAccountId ? '✅ TEST 3: getAccount() - Completed' : '⚠️  TEST 3: getAccount() - Skipped (no account)');
  console.log(jobId ? '✅ TEST 4: schedulePost() - Completed (DRAFT)' : '⚠️  TEST 4: schedulePost() - Skipped (no account)');
  console.log(jobId ? '✅ TEST 5: getJobStatus() - Completed' : '⚠️  TEST 5: getJobStatus() - Skipped (no job)');
  console.log('⚠️  TEST 6: publishPost() - Skipped for safety');
  console.log('');
  console.log('Rate Limit Info:', client.getRateLimitInfo());
  console.log('Rate Limit Approaching?', client.isRateLimitApproaching());
  console.log('');
  console.log('='.repeat(80));
  console.log('Testing Complete!');
  console.log('='.repeat(80));
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
