/**
 * Assign Work to Idle Agents - Launch Preparation
 * 
 * CEO working on content (unblocking). Assign work to all idle agents
 * so they can work in parallel while waiting.
 * 
 * Idle agents: data, analytics, inventory, seo, support, devops, pilot, integrations
 */

import "dotenv/config";
import { assignTask } from "../../app/services/tasks.server";
import { logDecision } from "../../app/services/decisions.server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const newTasks = [
  // DATA AGENT - Data quality and monitoring
  {
    assignedBy: 'manager',
    assignedTo: 'data',
    taskId: 'DATA-QUALITY-001',
    title: 'Implement Data Quality Monitoring',
    description: `Set up data quality monitoring for all database tables.

DELIVERABLES:
1. Data quality checks (null values, duplicates, constraints)
2. Monitoring dashboard for data health
3. Alerts for data quality issues
4. Documentation of data quality standards

TABLES TO MONITOR:
- orders, products, customers, inventory
- decision_log, task_assignment
- approvals, grades, edits`,
    acceptanceCriteria: [
      'Data quality checks implemented',
      'Monitoring dashboard created',
      'Alerts configured',
      'Documentation complete'
    ],
    allowedPaths: ['app/services/data-quality/**', 'app/routes/admin.data-quality.tsx', 'docs/data/**'],
    priority: 'P1' as const,
    estimatedHours: 4,
    dependencies: [],
    phase: 'Launch Preparation'
  },

  // ANALYTICS AGENT - Launch metrics
  {
    assignedBy: 'manager',
    assignedTo: 'analytics',
    taskId: 'ANALYTICS-LAUNCH-001',
    title: 'Set Up Launch Metrics Dashboard',
    description: `Create comprehensive launch metrics dashboard.

METRICS TO TRACK:
1. User engagement (DAU, WAU, MAU)
2. Feature adoption rates
3. Performance metrics (load times, errors)
4. Agent performance (suggestions, approvals, accuracy)
5. Business metrics (orders, revenue, inventory turns)

DELIVERABLES:
- Real-time metrics dashboard
- Historical trend analysis
- Alerts for anomalies
- Export to Google Analytics`,
    acceptanceCriteria: [
      'Launch metrics dashboard created',
      'All 5 metric categories tracked',
      'Real-time updates working',
      'Alerts configured',
      'GA integration complete'
    ],
    allowedPaths: ['app/routes/admin.launch-metrics.tsx', 'app/services/analytics/**', 'docs/analytics/**'],
    priority: 'P1' as const,
    estimatedHours: 5,
    dependencies: [],
    phase: 'Launch Preparation'
  },

  // INVENTORY AGENT - Stock optimization
  {
    assignedBy: 'manager',
    assignedTo: 'inventory',
    taskId: 'INVENTORY-OPTIMIZATION-001',
    title: 'Implement Stock Optimization Recommendations',
    description: `Build stock optimization recommendation system.

FEATURES:
1. ROP (Reorder Point) calculations with safety stock
2. EOQ (Economic Order Quantity) recommendations
3. ABC analysis (classify products by value)
4. Slow-moving inventory alerts
5. Overstock warnings

DELIVERABLES:
- Optimization algorithms
- Recommendation UI
- CEO approval workflow
- Historical tracking`,
    acceptanceCriteria: [
      'ROP calculations working',
      'EOQ recommendations accurate',
      'ABC analysis complete',
      'Alerts configured',
      'CEO approval workflow implemented'
    ],
    allowedPaths: ['app/services/inventory/optimization/**', 'app/routes/inventory.optimization.tsx', 'docs/inventory/**'],
    priority: 'P1' as const,
    estimatedHours: 6,
    dependencies: [],
    phase: 'Launch Preparation'
  },

  // SEO AGENT - Launch SEO optimization
  {
    assignedBy: 'manager',
    assignedTo: 'seo',
    taskId: 'SEO-LAUNCH-001',
    title: 'Optimize SEO for Launch',
    description: `Optimize all SEO elements for product launch.

TASKS:
1. Meta tags optimization (all pages)
2. Structured data (Schema.org)
3. Sitemap generation
4. Robots.txt optimization
5. Performance optimization (Core Web Vitals)
6. Social media meta tags (OG, Twitter)

DELIVERABLES:
- All pages have optimized meta tags
- Structured data implemented
- Sitemap auto-generated
- Performance score > 90`,
    acceptanceCriteria: [
      'Meta tags optimized on all pages',
      'Structured data implemented',
      'Sitemap generated',
      'Robots.txt optimized',
      'Performance score > 90',
      'Social meta tags complete'
    ],
    allowedPaths: ['app/routes/**', 'app/components/SEO.tsx', 'public/sitemap.xml', 'public/robots.txt', 'docs/seo/**'],
    priority: 'P1' as const,
    estimatedHours: 4,
    dependencies: [],
    phase: 'Launch Preparation'
  },

  // SUPPORT AGENT - Help documentation
  {
    assignedBy: 'manager',
    assignedTo: 'support',
    taskId: 'SUPPORT-DOCS-001',
    title: 'Create User Help Documentation',
    description: `Create comprehensive user help documentation.

SECTIONS:
1. Getting Started Guide
2. Dashboard Overview
3. Agent Features (how to use each agent)
4. Approval Workflow Guide
5. Troubleshooting
6. FAQ

DELIVERABLES:
- Help center with searchable docs
- Video tutorials (optional)
- Interactive tooltips
- Context-sensitive help`,
    acceptanceCriteria: [
      'All 6 sections complete',
      'Help center searchable',
      'Interactive tooltips added',
      'Context-sensitive help working',
      'User tested and approved'
    ],
    allowedPaths: ['app/routes/help.**', 'docs/help/**', 'app/components/Help/**'],
    priority: 'P2' as const,
    estimatedHours: 5,
    dependencies: [],
    phase: 'Launch Preparation'
  },

  // DEVOPS AGENT - Launch infrastructure
  {
    assignedBy: 'manager',
    assignedTo: 'devops',
    taskId: 'DEVOPS-LAUNCH-001',
    title: 'Prepare Launch Infrastructure',
    description: `Prepare all infrastructure for production launch.

TASKS:
1. Production environment setup (Fly.io)
2. Database backups automated
3. Monitoring and alerting (Prometheus/Grafana)
4. SSL certificates verified
5. CDN configuration
6. Load testing and capacity planning

DELIVERABLES:
- Production environment ready
- Backups automated (daily)
- Monitoring dashboard
- Load test results
- Capacity plan documented`,
    acceptanceCriteria: [
      'Production environment deployed',
      'Automated backups working',
      'Monitoring dashboard live',
      'SSL certificates valid',
      'CDN configured',
      'Load test passed (1000 concurrent users)'
    ],
    allowedPaths: ['fly.toml', 'scripts/deploy/**', 'docs/devops/**', 'monitoring/**'],
    priority: 'P0' as const,
    estimatedHours: 6,
    dependencies: [],
    phase: 'Launch Preparation'
  },

  // PILOT AGENT - User testing
  {
    assignedBy: 'manager',
    assignedTo: 'pilot',
    taskId: 'PILOT-USER-TESTING-001',
    title: 'Conduct Pre-Launch User Testing',
    description: `Conduct comprehensive user testing before launch.

TEST SCENARIOS:
1. New user onboarding
2. Daily workflow (dashboard → agents → approvals)
3. Mobile experience
4. Error handling
5. Performance under load

DELIVERABLES:
- Test plan with scenarios
- User testing sessions (5+ users)
- Bug reports and recommendations
- UX improvement suggestions
- Final sign-off report`,
    acceptanceCriteria: [
      'Test plan complete',
      '5+ user testing sessions conducted',
      'All critical bugs reported',
      'UX recommendations documented',
      'Final sign-off report delivered'
    ],
    allowedPaths: ['docs/testing/**', 'artifacts/pilot/**'],
    priority: 'P1' as const,
    estimatedHours: 8,
    dependencies: [],
    phase: 'Launch Preparation'
  },

  // INTEGRATIONS AGENT - Third-party integrations
  {
    assignedBy: 'manager',
    assignedTo: 'integrations',
    taskId: 'INTEGRATIONS-LAUNCH-001',
    title: 'Verify All Third-Party Integrations',
    description: `Verify all third-party integrations are production-ready.

INTEGRATIONS TO VERIFY:
1. Shopify Admin API (orders, products, inventory)
2. Chatwoot (customer support)
3. Google Analytics (tracking)
4. Supabase (database, auth, storage)
5. OpenAI (agents)
6. Fly.io (hosting)

DELIVERABLES:
- Integration health checks
- Error handling verified
- Rate limiting configured
- Fallback mechanisms tested
- Documentation updated`,
    acceptanceCriteria: [
      'All 6 integrations verified',
      'Health checks implemented',
      'Error handling tested',
      'Rate limiting configured',
      'Fallback mechanisms working',
      'Documentation complete'
    ],
    allowedPaths: ['app/services/integrations/**', 'docs/integrations/**', 'tests/integration/**'],
    priority: 'P0' as const,
    estimatedHours: 5,
    dependencies: [],
    phase: 'Launch Preparation'
  }
];

async function assignWork() {
  console.log("🚀 ASSIGNING WORK TO IDLE AGENTS - LAUNCH PREPARATION\n");
  console.log("=".repeat(80));

  let assignedCount = 0;
  let existsCount = 0;

  for (const task of newTasks) {
    try {
      await assignTask(task);
      console.log(`✅ ${task.taskId}: ${task.title} → ${task.assignedTo} (${task.priority}, ${task.estimatedHours}h)`);
      assignedCount++;
    } catch (error: any) {
      if (error.message?.includes('Unique constraint')) {
        console.log(`⚠️  ${task.taskId}: Already exists`);
        existsCount++;
      } else {
        console.error(`❌ ${task.taskId}: ${error.message}`);
      }
    }
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log(`✅ Assigned: ${assignedCount} tasks`);
  console.log(`⚠️  Already existed: ${existsCount} tasks`);
  console.log(`📊 Total: ${assignedCount + existsCount}/${newTasks.length}`);

  const totalHours = newTasks.reduce((sum, t) => sum + t.estimatedHours, 0);
  console.log(`⏱️  Total work: ${totalHours} hours across ${newTasks.length} agents`);

  // Log decision
  await logDecision({
    scope: 'build',
    actor: 'manager',
    action: 'launch_prep_work_assigned',
    rationale: `Assigned ${assignedCount} launch preparation tasks to idle agents while CEO works on content (unblocking). All agents can work in parallel. Total: ${totalHours} hours across 8 agents. Focus: data quality, launch metrics, stock optimization, SEO, help docs, infrastructure, user testing, integrations.`,
    evidenceUrl: 'scripts/manager/assign-work-to-idle-agents.ts',
    payload: {
      tasksAssigned: assignedCount,
      tasksExisted: existsCount,
      totalHours,
      agents: newTasks.map(t => t.assignedTo),
      priorities: {
        P0: newTasks.filter(t => t.priority === 'P0').length,
        P1: newTasks.filter(t => t.priority === 'P1').length,
        P2: newTasks.filter(t => t.priority === 'P2').length
      }
    }
  });

  console.log(`\n✅ Decision logged\n`);

  await prisma.$disconnect();
}

assignWork().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});

