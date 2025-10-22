import { logDecision } from '../../app/services/decisions.server';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function parseFeedbackFile(filePath: string): any[] {
  const content = readFileSync(filePath, 'utf-8');
  const entries: any[] = [];
  
  // Simple regex to find all timestamp entries
  const entryRegex = /##\s+(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?Z)\s+—\s+([A-Za-z][A-Za-z0-9\-_]*):\s+(.+?)$/gim;
  
  let match;
  while ((match = entryRegex.exec(content)) !== null) {
    let timestamp = match[1];
    const agent = match[2].toLowerCase();
    const status = match[3];
    
    // Normalize timestamp
    if (timestamp.match(/T\d{2}:\d{2}Z$/)) {
      timestamp = timestamp.replace('Z', ':00Z');
    }
    
    entries.push({
      timestamp,
      agent,
      status,
      filePath
    });
  }
  
  return entries;
}

function getAllMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  
  function walkDir(currentPath: string) {
    try {
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
    } catch (error) {
      console.log(`  ⚠ Skipping directory ${currentPath}: ${error.message}`);
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
  
  // Process files in smaller batches to avoid memory issues
  const batchSize = 5;
  for (let i = 0; i < allFiles.length; i += batchSize) {
    const batch = allFiles.slice(i, i + batchSize);
    console.log(`\nProcessing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(allFiles.length/batchSize)}`);
    
    for (const filePath of batch) {
      console.log(`  Processing: ${filePath.split('/').pop()}`);
      
      try {
        const entries = parseFeedbackFile(filePath);
        console.log(`    Found ${entries.length} entries`);
        totalEntries += entries.length;
        
        for (const entry of entries) {
          try {
            await logDecision({
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
                originalContent: entry.status,
                importSource: 'archive',
                importDate: new Date().toISOString()
              }
            });
            
            importedEntries++;
            
          } catch (error) {
            skippedEntries++;
            // Don't log every skip to avoid spam
          }
        }
        
      } catch (error) {
        console.log(`    ❌ Error: ${error.message}`);
      }
    }
    
    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n📊 Import Summary:`);
  console.log(`  Total entries found: ${totalEntries}`);
  console.log(`  Successfully imported: ${importedEntries}`);
  console.log(`  Skipped (duplicates/errors): ${skippedEntries}`);
  console.log(`  Files processed: ${allFiles.length}`);
}

bulkImportArchiveFeedback().catch(console.error);
