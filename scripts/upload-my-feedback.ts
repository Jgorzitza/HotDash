#!/usr/bin/env tsx
/**
 * Upload all your feedback files to the database
 * 
 * Simple usage for agents:
 *   npx tsx --env-file=.env scripts/upload-my-feedback.ts <your-agent-name>
 * 
 * Examples:
 *   npx tsx --env-file=.env scripts/upload-my-feedback.ts engineer
 *   npx tsx --env-file=.env scripts/upload-my-feedback.ts data
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { logDecision } from '../app/services/decisions.server';

interface FeedbackEntry {
  timestamp: string;
  title: string;
  taskId?: string;
  status?: string;
  progressPct?: number;
  action: string;
  rationale: string;
  evidenceUrl: string;
}

function parseFeedbackFile(filePath: string, agentName: string): FeedbackEntry[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const entries: FeedbackEntry[] = [];
  const fileName = path.basename(filePath);
  
  // Match patterns like: ## 2025-10-21T14:30:00Z — Engineer: TITLE
  // Handle both lowercase and capitalized agent names
  const capitalizedAgent = agentName.charAt(0).toUpperCase() + agentName.slice(1);
  const entryRegex = new RegExp(`##\\s+(\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z)\\s+—\\s+${capitalizedAgent}:\\s+(.+?)$`, 'gim');
  
  let match;
  while ((match = entryRegex.exec(content)) !== null) {
    const timestamp = match[1];
    const title = match[2].trim();
    
    // Extract section content
    const startIdx = match.index + match[0].length;
    let endIdx = content.indexOf('\n##', startIdx);
    if (endIdx === -1) endIdx = content.length;
    
    const sectionContent = content.substring(startIdx, endIdx).trim();
    
    // Extract structured data
    const workingOnMatch = /\*\*Working On\*\*:\s*(.+?)$/m.exec(sectionContent);
    const progressMatch = /\*\*Progress\*\*:\s*(.+?)$/m.exec(sectionContent);
    const blockerMatch = /\*\*Blockers?\*\*:\s*(.+?)$/m.exec(sectionContent);
    
    // Try to extract taskId (e.g., "ENG-029", "DATA-017")
    const taskIdMatch = /([A-Z]{2,}-\d{3,})/i.exec(sectionContent);
    const taskId = taskIdMatch ? taskIdMatch[1].toUpperCase() : undefined;
    
    // Try to extract progress percentage
    let progressPct: number | undefined;
    const pctMatch = /(\d+)%/.exec(sectionContent);
    if (pctMatch) {
      progressPct = parseInt(pctMatch[1], 10);
    }
    
    // Determine status
    let status: string | undefined;
    if (title.includes('COMPLETE') || title.includes('DONE') || progressMatch?.[1].includes('100%') || progressMatch?.[1].includes('✅')) {
      status = 'completed';
    } else if (blockerMatch || title.includes('BLOCKED')) {
      status = 'blocked';
    } else if (title.includes('PROGRESS') || progressPct) {
      status = 'in_progress';
    }
    
    // Determine action
    let action = 'task_progress';
    if (status === 'completed') action = 'task_completed';
    if (status === 'blocked') action = 'task_blocked';
    if (title.includes('BLOCKER') || title.includes('FIX')) action = 'blocker_cleared';
    if (title.includes('STARTUP')) action = 'startup_complete';
    
    // Build rationale
    let rationale = title;
    if (workingOnMatch) {
      rationale = `${title}: ${workingOnMatch[1].trim()}`;
    }
    if (rationale.length > 500) {
      rationale = rationale.substring(0, 497) + '...';
    }
    
    entries.push({
      timestamp,
      title,
      taskId,
      status,
      progressPct,
      action,
      rationale,
      evidenceUrl: `feedback/${agentName}/${fileName}`
    });
  }
  
  return entries;
}

async function uploadAgentFeedback(agentName: string) {
  console.log(`📁 Uploading feedback for agent: ${agentName}\n`);
  
  const feedbackDir = path.join('feedback', agentName);
  
  if (!fs.existsSync(feedbackDir)) {
    console.error(`❌ Feedback directory not found: ${feedbackDir}`);
    console.error(`\nMake sure you run this from the project root and use the correct agent name.`);
    process.exit(1);
  }
  
  // Get all markdown files
  const files = fs.readdirSync(feedbackDir)
    .filter(f => f.endsWith('.md'))
    .sort();
  
  if (files.length === 0) {
    console.log(`⚪ No feedback files found in ${feedbackDir}`);
    return;
  }
  
  console.log(`Found ${files.length} feedback files:\n`);
  files.forEach(f => console.log(`   - ${f}`));
  console.log('');
  console.log('='.repeat(80));
  
  let totalEntries = 0;
  let successCount = 0;
  let errorCount = 0;
  
  for (const file of files) {
    const filePath = path.join(feedbackDir, file);
    console.log(`\n📄 Processing: ${file}`);
    
    const entries = parseFeedbackFile(filePath, agentName);
    totalEntries += entries.length;
    
    console.log(`   Found ${entries.length} entries`);
    
    for (const entry of entries) {
      try {
        await logDecision({
          scope: 'build',
          actor: agentName,
          taskId: entry.taskId,
          status: entry.status as any,
          progressPct: entry.progressPct,
          action: entry.action,
          rationale: entry.rationale,
          evidenceUrl: entry.evidenceUrl,
          payload: {
            timestamp: entry.timestamp,
            title: entry.title,
            source: 'historical_feedback_upload'
          }
        });
        
        successCount++;
      } catch (error) {
        console.error(`   ❌ Failed: ${entry.title.substring(0, 50)}...`);
        errorCount++;
      }
    }
    
    console.log(`   ✅ Uploaded ${entries.length} entries from ${file}`);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 Upload Complete:`);
  console.log(`   Files processed: ${files.length}`);
  console.log(`   Total entries: ${totalEntries}`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  
  if (successCount > 0) {
    console.log(`\n✅ Your feedback history is now in the database!`);
    console.log(`\nManager can now query your historical work via:`);
    console.log(`   - scripts/manager/query-agent-status.ts`);
    console.log(`   - scripts/manager/query-decisions.ts`);
  }
}

// Main execution
const agentName = process.argv[2];

if (!agentName) {
  console.error('❌ Usage: upload-my-feedback.ts <your-agent-name>');
  console.error('\nExamples:');
  console.error('  npx tsx --env-file=.env scripts/upload-my-feedback.ts engineer');
  console.error('  npx tsx --env-file=.env scripts/upload-my-feedback.ts data');
  console.error('  npx tsx --env-file=.env scripts/upload-my-feedback.ts integrations');
  console.error('\nValid agent names:');
  console.error('  engineer, designer, data, devops, integrations, analytics,');
  console.error('  inventory, seo, ads, content, product, qa, pilot,');
  console.error('  ai-customer, ai-knowledge, support, manager');
  process.exit(1);
}

uploadAgentFeedback(agentName.toLowerCase())
  .then(() => {
    console.log('\n🎉 Upload complete!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n💥 Upload failed:', err);
    process.exit(1);
  });

