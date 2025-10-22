import { logDecision } from '../../app/services/decisions.server';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

interface FeedbackEntry {
  timestamp: string;
  agent: string;
  status: string;
  content: string;
  filePath: string;
}

function parseFeedbackFile(filePath: string): FeedbackEntry[] {
  const content = readFileSync(filePath, 'utf-8');
  const entries: FeedbackEntry[] = [];
  
  // Handle multiple timestamp formats and agent name variations
  const timestampPattern = '(\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}(?::\\d{2})?Z)';
  const agentPattern = '([A-Za-z][A-Za-z0-9\\-_]*)';
  const statusPattern = '([^\\n]+)';
  
  // Try different regex patterns for various markdown formats
  const patterns = [
    // Standard format: ## 2025-10-21T14:30:00Z — Engineer: Status
    new RegExp(`##\\s+${timestampPattern}\\s+—\\s+${agentPattern}:\\s+${statusPattern}`, 'gim'),
    // Alternative format: ## 2025-10-21T14:30Z — ENGINEER: Status
    new RegExp(`##\\s+${timestampPattern}\\s+—\\s+${agentPattern.toUpperCase()}:\\s+${statusPattern}`, 'gim'),
    // Short timestamp: ## 2025-10-21T14:30Z — Engineer: Status
    new RegExp(`##\\s+${timestampPattern}\\s+—\\s+${agentPattern}:\\s+${statusPattern}`, 'gim'),
    // Manager format: ## 2025-10-21T14:30:00Z — Manager: Status
    new RegExp(`##\\s+${timestampPattern}\\s+—\\s+Manager:\\s+${statusPattern}`, 'gim'),
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      let timestamp = match[1];
      const agent = match[2] || 'manager';
      const status = match[3];
      
      // Normalize timestamp format
      if (timestamp.match(/T\d{2}:\d{2}Z$/)) {
        timestamp = timestamp.replace('Z', ':00Z');
      }
      
      // Extract content between this entry and next (or end of file)
      const startIndex = match.index;
      const nextMatch = pattern.exec(content);
      const endIndex = nextMatch ? nextMatch.index : content.length;
      pattern.lastIndex = startIndex; // Reset for next iteration
      
      const entryContent = content.substring(startIndex, endIndex).trim();
      
      entries.push({
        timestamp,
        agent: agent.toLowerCase(),
        status,
        content: entryContent,
        filePath
      });
    }
  }
  
  return entries;
}

function getAllMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  
  function walkDir(currentPath: string) {
    const items = readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = join(currentPath, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (item.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }
  
  walkDir(dir);
  return files;
}

async function bulkImportArchiveFeedback() {
  const archiveDir = 'feedback/archive/2025-10-22-historical-upload';
  const allFiles = getAllMarkdownFiles(archiveDir);
  
  console.log(`Found ${allFiles.length} markdown files in archive`);
  
  let totalEntries = 0;
  let importedEntries = 0;
  let skippedEntries = 0;
  
  for (const filePath of allFiles) {
    console.log(`\nProcessing: ${filePath}`);
    
    try {
      const entries = parseFeedbackFile(filePath);
      console.log(`  Found ${entries.length} entries`);
      totalEntries += entries.length;
      
      for (const entry of entries) {
        try {
          // Check if entry already exists (by timestamp + agent + status)
          const existing = await logDecision({
            scope: 'build',
            actor: entry.agent,
            action: 'archive_import',
            rationale: `Imported from ${entry.filePath}`,
            evidenceUrl: entry.filePath,
            taskId: entry.status.includes('TASK-') ? entry.status : undefined,
            status: entry.status.includes('completed') ? 'completed' : 
                   entry.status.includes('blocked') ? 'blocked' : 
                   entry.status.includes('progress') ? 'in_progress' : 'pending',
            progressPct: entry.status.includes('100%') ? 100 : 
                        entry.status.includes('50%') ? 50 : 
                        entry.status.includes('25%') ? 25 : 0,
            createdAt: new Date(entry.timestamp),
            payload: {
              originalContent: entry.content,
              importSource: 'archive',
              importDate: new Date().toISOString()
            }
          });
          
          importedEntries++;
          console.log(`    ✓ Imported: ${entry.timestamp} — ${entry.agent}: ${entry.status.substring(0, 50)}...`);
          
        } catch (error) {
          skippedEntries++;
          console.log(`    ⚠ Skipped: ${entry.timestamp} — ${entry.agent} (${error.message})`);
        }
      }
      
    } catch (error) {
      console.log(`  ❌ Error processing ${filePath}: ${error.message}`);
    }
  }
  
  console.log(`\n📊 Import Summary:`);
  console.log(`  Total entries found: ${totalEntries}`);
  console.log(`  Successfully imported: ${importedEntries}`);
  console.log(`  Skipped (duplicates/errors): ${skippedEntries}`);
  console.log(`  Files processed: ${allFiles.length}`);
}

bulkImportArchiveFeedback().catch(console.error);
