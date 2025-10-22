#!/usr/bin/env tsx
/**
 * Parse and upload manager feedback file to decision_log
 * 
 * Usage:
 *   npx tsx --env-file=.env scripts/manager/upload-feedback.ts <feedback-file>
 * 
 * Example:
 *   npx tsx --env-file=.env scripts/manager/upload-feedback.ts feedback/manager/2025-10-19.md
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { logDecision } from '../../app/services/decisions.server';

interface FeedbackEntry {
  timestamp: string;
  title: string;
  action: string;
  rationale: string;
  evidenceUrl: string;
}

function parseFeedbackFile(filePath: string): FeedbackEntry[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const entries: FeedbackEntry[] = [];
  
  // Match patterns like: ## 2025-10-19T21:45:00Z — Manager: TITLE
  const entryRegex = /##\s+(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)\s+—\s+Manager:\s+(.+?)$/gm;
  
  let match;
  while ((match = entryRegex.exec(content)) !== null) {
    const timestamp = match[1];
    const title = match[2].trim();
    
    // Extract the section content (from this heading to the next ## or end)
    const startIdx = match.index + match[0].length;
    let endIdx = content.indexOf('\n##', startIdx);
    if (endIdx === -1) endIdx = content.length;
    
    const sectionContent = content.substring(startIdx, endIdx).trim();
    
    // Extract key information
    const workingOnMatch = /\*\*Working On\*\*:\s*(.+?)$/m.exec(sectionContent);
    const progressMatch = /\*\*Progress\*\*:\s*(.+?)$/m.exec(sectionContent);
    const evidenceMatch = /\*\*Evidence\*\*:\s*(.+?)$/m.exec(sectionContent);
    
    // Determine action type from title
    let action = 'task_completed';
    if (title.includes('BLOCKER')) action = 'blocker_cleared';
    if (title.includes('FIX') || title.includes('RESOLVED')) action = 'critical_fix';
    if (title.includes('STARTUP') || title.includes('CHECKLIST')) action = 'startup_complete';
    
    // Build rationale from available info
    let rationale = title;
    if (workingOnMatch) {
      rationale = `${title}: ${workingOnMatch[1].trim()}`;
    }
    if (progressMatch && progressMatch[1].includes('✅')) {
      rationale += ` (${progressMatch[1].trim()})`;
    }
    
    // Truncate if too long
    if (rationale.length > 500) {
      rationale = rationale.substring(0, 497) + '...';
    }
    
    entries.push({
      timestamp,
      title,
      action,
      rationale,
      evidenceUrl: path.basename(filePath)
    });
  }
  
  return entries;
}

async function uploadFeedback(filePath: string) {
  console.log(`📁 Parsing feedback file: ${filePath}\n`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }
  
  const entries = parseFeedbackFile(filePath);
  
  console.log(`Found ${entries.length} manager entries to log:\n`);
  console.log('='.repeat(80));
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const entry of entries) {
    try {
      await logDecision({
        scope: 'build',
        actor: 'manager',
        action: entry.action,
        rationale: entry.rationale,
        evidenceUrl: `feedback/manager/${entry.evidenceUrl}`,
        payload: {
          timestamp: entry.timestamp,
          title: entry.title,
          source: 'feedback_upload'
        }
      });
      
      console.log(`✅ [${entry.timestamp}] ${entry.action}`);
      console.log(`   ${entry.rationale.substring(0, 70)}...`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to log entry: ${entry.title}`);
      console.error(`   Error: ${error}`);
      errorCount++;
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`\n✅ Upload complete:`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Total: ${entries.length}`);
}

// Main execution
const feedbackFile = process.argv[2];

if (!feedbackFile) {
  console.error('❌ Usage: upload-feedback.ts <feedback-file-path>');
  console.error('\nExample:');
  console.error('  npx tsx --env-file=.env scripts/manager/upload-feedback.ts feedback/manager/2025-10-19.md');
  process.exit(1);
}

uploadFeedback(feedbackFile)
  .then(() => {
    console.log('\n🎉 Feedback uploaded to decision_log!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n💥 Upload failed:', err);
    process.exit(1);
  });

