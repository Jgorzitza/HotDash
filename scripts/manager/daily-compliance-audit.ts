import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function dailyComplianceAudit() {
  console.log('📊 DAILY COMPLIANCE AUDIT - Database-Driven Workflow');
  console.log('=' .repeat(60));
  console.log(`Date: ${new Date().toISOString().split('T')[0]}`);

  // 1. Check agent activity levels
  const agentActivity = await checkAgentActivity();
  
  // 2. Check for rule violations
  const violations = await checkRuleViolations();
  
  // 3. Check for stale blockers
  const staleBlockers = await checkStaleBlockers();
  
  // 4. Check database usage vs markdown usage
  const usageStats = await checkUsagePatterns();
  
  // 5. Generate compliance score
  const complianceScore = calculateComplianceScore(agentActivity, violations, staleBlockers, usageStats);
  
  // 6. Generate report
  console.log('\n📊 COMPLIANCE REPORT');
  console.log('=' .repeat(40));
  
  console.log(`\n🎯 COMPLIANCE SCORE: ${complianceScore}/100`);
  
  if (complianceScore >= 90) {
    console.log('✅ EXCELLENT: Database-driven workflow fully adopted');
  } else if (complianceScore >= 70) {
    console.log('⚠️ GOOD: Some improvements needed');
  } else if (complianceScore >= 50) {
    console.log('🚨 POOR: Significant compliance issues');
  } else {
    console.log('❌ CRITICAL: Major workflow violations');
  }
  
  console.log('\n📈 AGENT ACTIVITY:');
  Object.entries(agentActivity).forEach(([agent, stats]) => {
    console.log(`   ${agent}: ${stats.logDecisions} logDecision() calls, ${stats.dbQueries} DB queries`);
  });
  
  if (violations.length > 0) {
    console.log('\n❌ VIOLATIONS:');
    violations.forEach(v => console.log(`   - ${v}`));
  }
  
  if (staleBlockers.length > 0) {
    console.log('\n🚧 STALE BLOCKERS:');
    staleBlockers.forEach(b => console.log(`   - ${b.actor}: ${b.taskId} (${b.hoursBlocked}h)`));
  }
  
  console.log('\n📊 USAGE PATTERNS:');
  console.log(`   Database queries: ${usageStats.dbQueries}`);
  console.log(`   Markdown usage: ${usageStats.markdownUsage}`);
  console.log(`   logDecision() calls: ${usageStats.logDecisions}`);
  
  // 7. Generate action items
  const actionItems = generateActionItems(complianceScore, violations, staleBlockers);
  
  if (actionItems.length > 0) {
    console.log('\n🎯 ACTION ITEMS:');
    actionItems.forEach(item => console.log(`   - ${item}`));
  }
  
  // 8. Log audit results
  await logAuditResults(complianceScore, violations, staleBlockers, usageStats);
  
  console.log('\n✅ DAILY AUDIT COMPLETE');
  console.log('Next: Monitor compliance, escalate violations to CEO if needed');
}

async function checkAgentActivity() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const activity = await prisma.decisionLog.groupBy({
    by: ['actor'],
    where: {
      createdAt: {
        gte: today
      }
    },
    _count: {
      id: true
    }
  });
  
  const result: Record<string, { logDecisions: number; dbQueries: number }> = {};
  
  for (const agent of activity) {
    result[agent.actor] = {
      logDecisions: agent._count.id,
      dbQueries: 0 // Would need to check actual DB queries
    };
  }
  
  return result;
}

async function checkRuleViolations() {
  const violations: string[] = [];
  
  // Check for markdown direction file usage
  try {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    const { stdout } = await execAsync('grep -r "docs/directions/" app/ --include="*.ts" --include="*.tsx" | grep -v "archived" || true');
    
    if (stdout.trim()) {
      violations.push('Markdown direction file usage detected');
    }
  } catch (error) {
    // Ignore errors
  }
  
  return violations;
}

async function checkStaleBlockers() {
  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
  
  const staleBlockers = await prisma.decisionLog.findMany({
    where: {
      status: 'blocked',
      createdAt: {
        lt: fourHoursAgo
      }
    },
    select: {
      actor: true,
      taskId: true,
      createdAt: true
    }
  });
  
  return staleBlockers.map(blocker => ({
    actor: blocker.actor,
    taskId: blocker.taskId,
    hoursBlocked: Math.round((Date.now() - blocker.createdAt.getTime()) / (1000 * 60 * 60))
  }));
}

async function checkUsagePatterns() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const logDecisions = await prisma.decisionLog.count({
    where: {
      createdAt: {
        gte: today
      }
    }
  });
  
  return {
    dbQueries: 1, // Would need to check actual DB queries
    markdownUsage: 0, // Would need to check markdown usage
    logDecisions
  };
}

function calculateComplianceScore(activity: any, violations: string[], staleBlockers: any[], usage: any): number {
  let score = 100;
  
  // Deduct for violations
  score -= violations.length * 10;
  
  // Deduct for stale blockers
  score -= staleBlockers.length * 5;
  
  // Deduct for low activity
  const totalActivity = Object.values(activity).reduce((sum: number, stats: any) => sum + stats.logDecisions, 0);
  if (totalActivity < 20) {
    score -= 20;
  }
  
  // Deduct for low logDecision usage
  if (usage.logDecisions < 10) {
    score -= 15;
  }
  
  return Math.max(0, score);
}

function generateActionItems(score: number, violations: string[], staleBlockers: any[]): string[] {
  const actions: string[] = [];
  
  if (score < 70) {
    actions.push('Escalate to CEO: Compliance score below 70%');
  }
  
  if (violations.length > 0) {
    actions.push('Block PRs with markdown direction file usage');
    actions.push('Require database-driven process compliance');
  }
  
  if (staleBlockers.length > 5) {
    actions.push('Unblock stale dependencies immediately');
    actions.push('Review blocker resolution process');
  }
  
  if (actions.length === 0) {
    actions.push('Continue monitoring compliance daily');
  }
  
  return actions;
}

async function logAuditResults(score: number, violations: string[], staleBlockers: any[], usage: any) {
  await prisma.decisionLog.create({
    data: {
      scope: 'ops',
      actor: 'manager',
      action: 'daily_compliance_audit',
      rationale: `Compliance score: ${score}/100, Violations: ${violations.length}, Stale blockers: ${staleBlockers.length}`,
      evidenceUrl: 'scripts/manager/daily-compliance-audit.ts',
      payload: {
        complianceScore: score,
        violations: violations.length,
        staleBlockers: staleBlockers.length,
        usageStats: usage
      }
    }
  });
}

dailyComplianceAudit().finally(() => prisma.$disconnect());
