#!/usr/bin/env tsx
/**
 * Assign Production-Ready Tasks
 * For agents that completed their work and need new production tasks
 */

import { assignTask } from '../../app/services/tasks.server';

const PRODUCTION_TASKS = [
  // SUPPORT - Production Documentation & Training
  {
    assignedTo: 'support',
    taskId: 'SUPPORT-002',
    title: 'Production Launch Documentation & Training Materials',
    description: 'Create comprehensive production launch documentation: user guides, troubleshooting runbooks, FAQ, video tutorials, and operator training materials for Growth Engine.',
    acceptanceCriteria: [
      'User guide complete with screenshots',
      'Troubleshooting runbook documented',
      'FAQ with 20+ common questions',
      'Video tutorials recorded (5+ videos)',
      'Operator training checklist created'
    ],
    allowedPaths: ['docs/support/**', 'docs/guides/**', 'docs/troubleshooting/**', 'docs/training/**'],
    priority: 'P0' as const,
    estimatedHours: 6,
    phase: 'Production Launch'
  },

  // INVENTORY - Production Inventory Monitoring
  {
    assignedTo: 'inventory',
    taskId: 'INVENTORY-022',
    title: 'Production Inventory Monitoring & Alerts',
    description: 'Implement production inventory monitoring: real-time stock alerts, automated ROP notifications, emergency sourcing triggers, and inventory health dashboard.',
    acceptanceCriteria: [
      'Real-time stock alerts operational',
      'Automated ROP notifications working',
      'Emergency sourcing triggers configured',
      'Inventory health dashboard live',
      'Alert escalation workflow documented'
    ],
    allowedPaths: ['app/services/inventory/**', 'app/routes/inventory.alerts.tsx', 'app/lib/inventory/**'],
    priority: 'P0' as const,
    estimatedHours: 4,
    phase: 'Production Launch'
  },

  // ADS - Production Ad Campaign Monitoring
  {
    assignedTo: 'ads',
    taskId: 'ADS-006',
    title: 'Production Ad Campaign Monitoring & Optimization',
    description: 'Implement production ad campaign monitoring: real-time ROAS tracking, automated bid adjustments, budget alerts, and campaign performance dashboard.',
    acceptanceCriteria: [
      'Real-time ROAS tracking operational',
      'Automated bid adjustments working',
      'Budget alerts configured',
      'Campaign performance dashboard live',
      'Optimization recommendations generated'
    ],
    allowedPaths: ['app/services/ads/**', 'app/routes/ads.dashboard.tsx', 'app/lib/ads/**'],
    priority: 'P1' as const,
    estimatedHours: 4,
    phase: 'Production Launch'
  },

  // CONTENT - Production Content Calendar
  {
    assignedTo: 'content',
    taskId: 'CONTENT-003',
    title: 'Production Content Calendar & Publishing Workflow',
    description: 'Implement production content calendar: scheduled publishing, content approval workflow, SEO optimization integration, and content performance tracking.',
    acceptanceCriteria: [
      'Content calendar UI operational',
      'Scheduled publishing working',
      'Approval workflow integrated',
      'SEO optimization automated',
      'Performance tracking dashboard live'
    ],
    allowedPaths: ['app/services/content/**', 'app/routes/content.calendar.tsx', 'app/lib/content/**'],
    priority: 'P1' as const,
    estimatedHours: 5,
    phase: 'Production Launch'
  },

  // INTEGRATIONS - Production API Health Monitoring
  {
    assignedTo: 'integrations',
    taskId: 'INTEGRATIONS-022',
    title: 'Production API Health Monitoring & Circuit Breakers',
    description: 'Implement production API health monitoring: real-time health checks, circuit breakers, retry logic, rate limit monitoring, and integration status dashboard.',
    acceptanceCriteria: [
      'Real-time health checks operational',
      'Circuit breakers configured',
      'Retry logic with exponential backoff',
      'Rate limit monitoring active',
      'Integration status dashboard live'
    ],
    allowedPaths: ['app/services/integrations/**', 'app/routes/integrations.health.tsx', 'app/lib/integrations/**'],
    priority: 'P0' as const,
    estimatedHours: 4,
    phase: 'Production Launch'
  },

  // DATA - Production Data Quality Monitoring
  {
    assignedTo: 'data',
    taskId: 'DATA-023',
    title: 'Production Data Quality Monitoring & Validation',
    description: 'Implement production data quality monitoring: data validation rules, anomaly detection, data freshness checks, and data quality dashboard.',
    acceptanceCriteria: [
      'Data validation rules configured',
      'Anomaly detection operational',
      'Data freshness checks active',
      'Data quality dashboard live',
      'Alert escalation workflow documented'
    ],
    allowedPaths: ['app/services/data/**', 'app/routes/data.quality.tsx', 'app/lib/data/**', 'supabase/migrations/**'],
    priority: 'P1' as const,
    estimatedHours: 5,
    phase: 'Production Launch'
  },

  // SEO - Production SEO Monitoring
  {
    assignedTo: 'seo',
    taskId: 'SEO-004',
    title: 'Production SEO Monitoring & Critical Issue Alerts',
    description: 'Implement production SEO monitoring: real-time ranking tracking, critical issue alerts (48h SLA), Search Console integration, and SEO health dashboard.',
    acceptanceCriteria: [
      'Real-time ranking tracking operational',
      'Critical issue alerts configured (48h SLA)',
      'Search Console integration live',
      'SEO health dashboard operational',
      'Automated issue resolution workflow'
    ],
    allowedPaths: ['app/services/seo/**', 'app/routes/seo.monitoring.tsx', 'app/lib/seo/**'],
    priority: 'P0' as const,
    estimatedHours: 4,
    phase: 'Production Launch'
  },

  // ANALYTICS - Production Analytics Monitoring
  {
    assignedTo: 'analytics',
    taskId: 'ANALYTICS-004',
    title: 'Production Analytics Monitoring & Anomaly Detection',
    description: 'Implement production analytics monitoring: real-time metric tracking, anomaly detection, conversion funnel monitoring, and analytics health dashboard.',
    acceptanceCriteria: [
      'Real-time metric tracking operational',
      'Anomaly detection configured',
      'Conversion funnel monitoring active',
      'Analytics health dashboard live',
      'Alert escalation workflow documented'
    ],
    allowedPaths: ['app/services/analytics/**', 'app/routes/analytics.monitoring.tsx', 'app/lib/analytics/**'],
    priority: 'P1' as const,
    estimatedHours: 4,
    phase: 'Production Launch'
  },

  // DEVOPS - Production Deployment Automation
  {
    assignedTo: 'devops',
    taskId: 'DEVOPS-018',
    title: 'Production Deployment Automation & Rollback Procedures',
    description: 'Implement production deployment automation: zero-downtime deployments, automated rollback, health checks, and deployment monitoring dashboard.',
    acceptanceCriteria: [
      'Zero-downtime deployment working',
      'Automated rollback configured',
      'Health checks operational',
      'Deployment monitoring dashboard live',
      'Rollback procedures documented'
    ],
    allowedPaths: ['.github/workflows/**', 'fly.toml', 'scripts/ops/**', 'docs/runbooks/**'],
    priority: 'P0' as const,
    estimatedHours: 5,
    phase: 'Production Launch'
  },

  // PILOT - Production Smoke Testing
  {
    assignedTo: 'pilot',
    taskId: 'PILOT-003',
    title: 'Production Smoke Testing & Validation Suite',
    description: 'Create production smoke testing suite: critical path validation, data integrity checks, integration testing, and smoke test automation.',
    acceptanceCriteria: [
      'Critical path smoke tests created',
      'Data integrity checks operational',
      'Integration tests passing',
      'Smoke test automation configured',
      'Test results dashboard live'
    ],
    allowedPaths: ['tests/smoke/**', 'tests/production/**', 'scripts/ops/**'],
    priority: 'P0' as const,
    estimatedHours: 4,
    phase: 'Production Launch'
  },

  // DESIGNER - Production UI Polish
  {
    assignedTo: 'designer',
    taskId: 'DES-019',
    title: 'Production UI Polish & Accessibility Compliance',
    description: 'Final production UI polish: accessibility audit (WCAG 2.1 AA), responsive design validation, loading states, error states, and empty states.',
    acceptanceCriteria: [
      'WCAG 2.1 AA compliance achieved',
      'Responsive design validated on all breakpoints',
      'Loading states implemented consistently',
      'Error states designed and implemented',
      'Empty states designed and implemented'
    ],
    allowedPaths: ['app/components/**', 'app/styles/**', 'tests/accessibility/**'],
    priority: 'P1' as const,
    estimatedHours: 6,
    phase: 'Production Launch'
  },

  // PRODUCT - Production Metrics Dashboard
  {
    assignedTo: 'product',
    taskId: 'PRODUCT-020',
    title: 'Production Metrics Dashboard & Success Tracking',
    description: 'Create production metrics dashboard: track all North Star metrics, success criteria, KPIs, and business impact measurements.',
    acceptanceCriteria: [
      'North Star metrics dashboard operational',
      'Success criteria tracking configured',
      'KPI monitoring active',
      'Business impact measurements live',
      'Weekly report automation configured'
    ],
    allowedPaths: ['app/routes/metrics.dashboard.tsx', 'app/services/metrics/**', 'docs/metrics/**'],
    priority: 'P1' as const,
    estimatedHours: 5,
    phase: 'Production Launch'
  }
];

async function assignProductionTasks() {
  console.log('🚀 Assigning Production-Ready Tasks');
  console.log('='.repeat(80));
  console.log(`\nTotal tasks to assign: ${PRODUCTION_TASKS.length}\n`);

  let successCount = 0;
  let existsCount = 0;
  let errorCount = 0;

  for (const task of PRODUCTION_TASKS) {
    try {
      await assignTask({
        assignedBy: 'manager',
        ...task
      });
      console.log(`✅ ${task.taskId}: ${task.title} → ${task.assignedTo}`);
      successCount++;
    } catch (error: any) {
      if (error.message?.includes('Unique constraint') || error.code === 'P2002') {
        console.log(`⚠️  ${task.taskId}: Already exists`);
        existsCount++;
      } else {
        console.error(`❌ ${task.taskId}: ${error.message}`);
        errorCount++;
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 Production Task Assignment Summary:');
  console.log(`   ✅ Successfully assigned: ${successCount}`);
  console.log(`   ⚠️  Already exists: ${existsCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📋 Total: ${PRODUCTION_TASKS.length}`);
  console.log('\n🚀 Production tasks assigned! All agents ready for production launch.');
}

assignProductionTasks().catch(console.error);

