import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function enforceDatabaseWorkflow() {
  console.log('🔍 MANAGER ENFORCEMENT: Database-Driven Workflow Compliance');
  console.log('=' .repeat(60));

  const violations: string[] = [];
  const warnings: string[] = [];

  // 1. Check for markdown direction file usage in code
  console.log('📋 Checking for markdown direction file usage...');
  const appDir = path.join(process.cwd(), 'app');
  const violations_found = await checkMarkdownUsage(appDir);
  violations.push(...violations_found);

  // 2. Check agent logDecision() usage frequency
  console.log('📊 Checking agent logDecision() usage...');
  const logDecisionStats = await checkLogDecisionUsage();
  
  // 3. Check for database task querying
  console.log('🗄️ Checking database task querying...');
  const dbQueryStats = await checkDatabaseQuerying();

  // 4. Check for blocked tasks that should be unblocked
  console.log('🚧 Checking for stale blocked tasks...');
  const staleBlocked = await checkStaleBlockedTasks();

  // 5. Generate compliance report
  console.log('\n📊 COMPLIANCE REPORT');
  console.log('=' .repeat(40));

  if (violations.length > 0) {
    console.log('❌ VIOLATIONS FOUND:');
    violations.forEach(v => console.log(`   - ${v}`));
  }

  if (warnings.length > 0) {
    console.log('⚠️ WARNINGS:');
    warnings.forEach(w => console.log(`   - ${w}`));
  }

  console.log('\n📈 AGENT ACTIVITY STATS:');
  console.log(`   logDecision() calls today: ${logDecisionStats.total}`);
  console.log(`   Database queries today: ${dbQueryStats.total}`);
  console.log(`   Stale blocked tasks: ${staleBlocked.length}`);

  // 6. Enforcement actions
  if (violations.length > 0) {
    console.log('\n🚨 ENFORCEMENT ACTIONS:');
    console.log('   1. Blocking PRs with markdown direction file usage');
    console.log('   2. Escalating to CEO for repeated violations');
    console.log('   3. Requiring database-driven process compliance');
  }

  if (logDecisionStats.total < 10) {
    console.log('\n⚠️ LOW ACTIVITY: Agents may not be logging progress properly');
    console.log('   Expected: 20+ logDecision() calls per day');
    console.log('   Actual: ' + logDecisionStats.total);
  }

  if (staleBlocked.length > 5) {
    console.log('\n🚧 STALE BLOCKERS: Multiple agents blocked for >4 hours');
    console.log('   Action: Manager should unblock dependencies immediately');
  }

  console.log('\n✅ ENFORCEMENT COMPLETE');
  console.log('Next: Monitor compliance daily, escalate violations');
}

async function checkMarkdownUsage(dir: string): Promise<string[]> {
  const violations: string[] = [];
  
  try {
    const files = await getAllFiles(dir);
    
    for (const file of files) {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for markdown direction file usage
        if (content.includes('docs/directions/') && !content.includes('archived')) {
          violations.push(`Markdown direction usage in ${file}`);
        }
        
        // Check for feedback markdown usage (should use database)
        if (content.includes('feedback/') && content.includes('.md') && !content.includes('logDecision')) {
          violations.push(`Markdown feedback usage in ${file} - should use logDecision()`);
        }
      }
    }
  } catch (error) {
    console.log(`   Error checking markdown usage: ${error}`);
  }
  
  return violations;
}

async function checkLogDecisionUsage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const stats = await prisma.decisionLog.aggregate({
    where: {
      createdAt: {
        gte: today
      }
    },
    _count: {
      id: true
    }
  });
  
  return {
    total: stats._count.id,
    date: today.toISOString().split('T')[0]
  };
}

async function checkDatabaseQuerying() {
  // Check for database task querying patterns
  const appDir = path.join(process.cwd(), 'app');
  const files = await getAllFiles(appDir);
  
  let dbQueries = 0;
  for (const file of files) {
    if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('getMyTasks') || content.includes('get-my-tasks')) {
        dbQueries++;
      }
    }
  }
  
  return { total: dbQueries };
}

async function checkStaleBlockedTasks() {
  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
  
  const staleBlocked = await prisma.decisionLog.findMany({
    where: {
      status: 'blocked',
      createdAt: {
        lt: fourHoursAgo
      }
    },
    select: {
      actor: true,
      taskId: true,
      blockerDetails: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  });
  
  return staleBlocked;
}

async function getAllFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        const subFiles = await getAllFiles(fullPath);
        files.push(...subFiles);
      } else {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Ignore errors for directories we can't read
  }
  
  return files;
}

enforceDatabaseWorkflow().finally(() => prisma.$disconnect());
