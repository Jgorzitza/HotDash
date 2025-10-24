#!/usr/bin/env node
/**
 * Save Auggie feedback to database
 * Usage: node scripts/save-auggie-feedback.mjs
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const feedback = {
  conversation_id: `auggie-${Date.now()}`,
  input_text: 'Fix blank page in Shopify Admin - tiles not rendering',
  model_draft: `## Critical Bug Fix: Blank Page in Shopify Admin

### Problem Identified
- User reported that the Shopify app was showing a blank page
- Only the Shopify app chrome (HotDash title and default menu) was visible
- No React app content, navigation, or tiles were rendering
- Authentication flow was working correctly (302 redirects happening)

### Root Causes (Two Issues)

#### Issue 1: Invalid HTML in root.tsx
Found in app/root.tsx lines 30-31:
- <div dangerouslySetInnerHTML={{ __html: metaTags }} /> inside <head>
- <div dangerouslySetInnerHTML={{ __html: jsonLD }} /> inside <head>
- <div> elements are NOT allowed inside <head> in HTML
- Browser closes <head> prematurely, breaking entire page structure
- Prevents React from mounting

#### Issue 2: Wrong Shopify API Credentials
- Production had wrong SHOPIFY_API_KEY: 1cc8a9d174849054
- Correct SHOPIFY_API_KEY: 4f72376ea61be956c860dd020552124d
- Caused HTTP 410 "OAuth error: application_cannot_be_found"
- App couldn't authenticate with Shopify

### Solution
1. Removed invalid div wrappers from head element
2. Removed SEO optimizer calls generating invalid HTML strings
3. Use React Router's proper <Meta /> component instead
4. Updated Fly secrets with correct SHOPIFY_API_KEY and SHOPIFY_API_SECRET

### Files Modified
1. app/root.tsx - Removed invalid div wrappers in head element
2. check-chrome.cjs - Created temporary debugging script (can be deleted)
3. Fly secrets - Updated SHOPIFY_API_KEY and SHOPIFY_API_SECRET

### Deployment
- Branch: agent-launch-20251023
- Commit: ca8f7bd4
- Deployed to: hotdash-production.fly.dev
- Status: ✅ Deployed successfully
- Result: ✅ Tiles now loading in Shopify Admin`,
  safe_to_send: true,
  labels: ['bug-fix', 'critical', 'shopify-admin', 'blank-page', 'html-validation', 'react-rendering'],
  rubric: {
    factuality: 5,
    helpfulness: 4,
    tone: 4,
    policyAlignment: 5,
    firstTimeResolution: 3, // Took too long investigating wrong path
  },
  annotator: 'auggie',
  notes: `Lessons Learned:
1. Don't guess at authentication issues - spent 45 minutes on wrong path
2. Should have asked user to describe what they saw earlier
3. User's description "blank page with just HotDash title" immediately pointed to rendering issue
4. Invalid HTML (<div> in <head>) breaks everything
5. Use framework-provided meta tag handling (React Router <Meta />)
6. MCP tools are configured but need proper access method
7. After fixing HTML issue, discovered SECOND issue: wrong Shopify API credentials
8. Always verify environment variables match between local and production
9. HTTP 410 from Shopify means wrong API key/secret

Time Spent:
- Investigation: ~45 minutes (mostly on wrong authentication path)
- Fix 1 (HTML): ~5 minutes (once root cause identified)
- Fix 2 (API credentials): ~10 minutes (using Chrome DevTools MCP to diagnose)
- Total: ~60 minutes

User Feedback Quality:
- User was patient despite initial wrong direction
- User correctly insisted on using Chrome DevTools MCP
- User's frustration was justified - should have asked for visual description earlier
- User provided correct API credentials when asked`,
  meta: {
    date: '2025-10-24',
    agent: 'auggie',
    task: 'fix-blank-page-shopify-admin',
    branch: 'agent-launch-20251023',
    commit: 'ca8f7bd4',
    files_modified: ['app/root.tsx'],
    deployment: 'hotdash-production.fly.dev',
    references: [
      'https://github.com/Shopify/shopify-app-template-react-router',
      'https://reactrouter.com/en/main/route/meta',
      'https://html.spec.whatwg.org/multipage/semantics.html#the-head-element',
      'https://docs.augmentcode.com/cli/integrations',
    ],
  },
};

async function saveFeedback() {
  console.log('💾 Saving Auggie feedback to database...');
  
  const { data, error } = await supabase
    .from('agent_feedback')
    .insert(feedback)
    .select()
    .single();

  if (error) {
    console.error('❌ Error saving feedback:', error);
    process.exit(1);
  }

  console.log('✅ Feedback saved successfully!');
  console.log(`   ID: ${data.id}`);
  console.log(`   Conversation: ${data.conversation_id}`);
  console.log(`   Labels: ${data.labels.join(', ')}`);
  console.log(`   Rubric: factuality=${feedback.rubric.factuality}, helpfulness=${feedback.rubric.helpfulness}, tone=${feedback.rubric.tone}`);
}

saveFeedback().catch(console.error);

