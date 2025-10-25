#!/usr/bin/env tsx
/**
 * Assign Next Phase Tasks to All Agents
 * Based on completed work and Growth Engine phases
 * 
 * Usage: npx tsx --env-file=.env scripts/manager/assign-next-phase-tasks.ts
 */

import { assignTask } from '../../app/services/tasks.server';

const TASKS = [
  // ENGINEER - Continue Growth Engine Implementation
  {
    assignedTo: 'engineer',
    taskId: 'ENG-060',
    title: 'Growth Engine Security Hardening',
    description: 'Implement security hardening for Growth Engine: PII redaction enforcement, ABAC validation, store switch safety checks, and dev MCP ban verification in production builds.',
    acceptanceCriteria: [
      'PII redaction enforced in all customer-facing responses',
      'ABAC permissions validated for all agent actions',
      'Store switch safety checks prevent hardcoded store references',
      'Dev MCP imports blocked in production builds',
      'Security tests passing with 100% coverage'
    ],
    allowedPaths: ['app/services/security/**', 'app/lib/security/**', 'tests/security/**'],
    priority: 'P1' as const,
    estimatedHours: 4,
    phase: 'Phase 10'
  },

  // DATA - Real-time Analytics Dashboard
  {
    assignedTo: 'data',
    taskId: 'DATA-022',
    title: 'Real-time Analytics Dashboard Data Layer',
    description: 'Create database schema and RLS policies for real-time analytics dashboard: live metrics aggregation, performance tracking, and action attribution data.',
    acceptanceCriteria: [
      'Real-time metrics aggregation tables created',
      'RLS policies enforce agent-specific data access',
      'Materialized views for performance optimization',
      'Migration tested and documented',
      'Rollback plan documented'
    ],
    allowedPaths: ['supabase/migrations/**', 'prisma/schema.prisma', 'app/db.server.ts'],
    priority: 'P1' as const,
    estimatedHours: 3,
    phase: 'Phase 11'
  },

  // ANALYTICS - Predictive Analytics Implementation
  {
    assignedTo: 'analytics',
    taskId: 'ANALYTICS-003',
    title: 'Predictive Analytics Implementation',
    description: 'Implement predictive analytics for inventory forecasting, demand prediction, and revenue projections using historical data and ML models.',
    acceptanceCriteria: [
      'Demand forecasting model implemented',
      'Revenue projection calculations working',
      'Inventory optimization recommendations generated',
      'Historical data analysis complete',
      'Predictions validated against actual data'
    ],
    allowedPaths: ['app/services/analytics/**', 'app/lib/analytics/**', 'tests/analytics/**'],
    priority: 'P1' as const,
    estimatedHours: 4,
    phase: 'Phase 11'
  },

  // INVENTORY - AI-Powered Inventory Optimization
  {
    assignedTo: 'inventory',
    taskId: 'INVENTORY-021',
    title: 'AI-Powered Inventory Optimization',
    description: 'Implement AI-powered inventory optimization: automated ROP calculations, safety stock recommendations, and emergency sourcing triggers based on sales velocity and lead times.',
    acceptanceCriteria: [
      'Automated ROP calculations working',
      'Safety stock recommendations generated',
      'Emergency sourcing triggers implemented',
      'Sales velocity analysis integrated',
      'Lead time tracking functional'
    ],
    allowedPaths: ['app/services/inventory/**', 'app/lib/inventory/**', 'tests/inventory/**'],
    priority: 'P1' as const,
    estimatedHours: 3,
    phase: 'Phase 11'
  },

  // SEO - Advanced SEO Automation
  {
    assignedTo: 'seo',
    taskId: 'SEO-003',
    title: 'Advanced SEO Automation',
    description: 'Implement advanced SEO automation: automated meta tag optimization, schema markup generation, sitemap updates, and Search Console integration for real-time monitoring.',
    acceptanceCriteria: [
      'Automated meta tag optimization working',
      'Schema markup generation implemented',
      'Sitemap auto-updates functional',
      'Search Console integration complete',
      'SEO monitoring dashboard operational'
    ],
    allowedPaths: ['app/services/seo/**', 'app/lib/seo/**', 'app/routes/sitemap.xml.ts', 'tests/seo/**'],
    priority: 'P1' as const,
    estimatedHours: 2,
    phase: 'Phase 11'
  },

  // ADS - AI-Powered Ad Optimization
  {
    assignedTo: 'ads',
    taskId: 'ADS-005',
    title: 'AI-Powered Ad Optimization',
    description: 'Implement AI-powered ad optimization: automated bid adjustments, audience targeting recommendations, and performance-based budget allocation.',
    acceptanceCriteria: [
      'Automated bid adjustment logic implemented',
      'Audience targeting recommendations generated',
      'Performance-based budget allocation working',
      'ROI tracking integrated',
      'Optimization dashboard functional'
    ],
    allowedPaths: ['app/services/ads/**', 'app/lib/ads/**', 'tests/ads/**'],
    priority: 'P1' as const,
    estimatedHours: 3,
    phase: 'Phase 11'
  },

  // CONTENT - AI Content Generation
  {
    assignedTo: 'content',
    taskId: 'CONTENT-002',
    title: 'AI Content Generation System',
    description: 'Implement AI content generation system: automated product descriptions, blog post drafts, and social media content with brand voice consistency.',
    acceptanceCriteria: [
      'Product description generation working',
      'Blog post draft generation implemented',
      'Social media content generation functional',
      'Brand voice consistency enforced',
      'Content approval workflow integrated'
    ],
    allowedPaths: ['app/services/content/**', 'app/lib/content/**', 'tests/content/**'],
    priority: 'P1' as const,
    estimatedHours: 3,
    phase: 'Phase 12'
  },

  // AI-CUSTOMER - Advanced Customer AI Features
  {
    assignedTo: 'ai-customer',
    taskId: 'AI-CUSTOMER-002',
    title: 'Advanced Customer AI Features',
    description: 'Implement advanced customer AI features: sentiment analysis, intent detection, automated response suggestions, and satisfaction tracking.',
    acceptanceCriteria: [
      'Sentiment analysis working',
      'Intent detection implemented',
      'Automated response suggestions generated',
      'Satisfaction tracking functional',
      'HITL approval workflow integrated'
    ],
    allowedPaths: ['app/services/ai-customer/**', 'tests/ai-customer/**'],
    priority: 'P1' as const,
    estimatedHours: 3,
    phase: 'Phase 12'
  },

  // AI-KNOWLEDGE - Advanced Knowledge Base AI
  {
    assignedTo: 'ai-knowledge',
    taskId: 'AI-KNOWLEDGE-003',
    title: 'Advanced Knowledge Base AI',
    description: 'Implement advanced knowledge base AI: automated knowledge extraction from conversations, FAQ generation, and knowledge gap identification.',
    acceptanceCriteria: [
      'Automated knowledge extraction working',
      'FAQ generation implemented',
      'Knowledge gap identification functional',
      'Knowledge base updates automated',
      'Search relevance improved'
    ],
    allowedPaths: ['app/services/ai-knowledge/**', 'apps/llamaindex-mcp-server/**', 'tests/ai-knowledge/**'],
    priority: 'P1' as const,
    estimatedHours: 3,
    phase: 'Phase 12'
  },

  // DEVOPS - Production Monitoring Setup
  {
    assignedTo: 'devops',
    taskId: 'DEVOPS-017',
    title: 'Production Monitoring and Alerting',
    description: 'Implement comprehensive production monitoring: error tracking, performance monitoring, uptime monitoring, and automated alerting for critical issues.',
    acceptanceCriteria: [
      'Error tracking configured (Sentry or similar)',
      'Performance monitoring implemented',
      'Uptime monitoring active',
      'Automated alerting configured',
      'Monitoring dashboard operational'
    ],
    allowedPaths: ['app/lib/monitoring/**', '.github/workflows/**', 'fly.toml', 'scripts/ops/**'],
    priority: 'P1' as const,
    estimatedHours: 2,
    phase: 'Phase 10'
  },

  // INTEGRATIONS - Advanced API Rate Limiting
  {
    assignedTo: 'integrations',
    taskId: 'INTEGRATIONS-021',
    title: 'Advanced API Rate Limiting and Retry Logic',
    description: 'Implement advanced API rate limiting and retry logic for all third-party integrations: exponential backoff, circuit breakers, and request queuing.',
    acceptanceCriteria: [
      'Exponential backoff implemented',
      'Circuit breakers configured',
      'Request queuing functional',
      'Rate limit monitoring active',
      'Retry logic tested'
    ],
    allowedPaths: ['app/services/integrations/**', 'app/lib/integrations/**', 'tests/integrations/**'],
    priority: 'P1' as const,
    estimatedHours: 2,
    phase: 'Phase 11'
  },

  // DESIGNER - Growth Engine UI Polish
  {
    assignedTo: 'designer',
    taskId: 'DES-018',
    title: 'Growth Engine UI Polish and Accessibility',
    description: 'Polish Growth Engine UI components: accessibility improvements, responsive design refinements, loading states, error states, and empty states.',
    acceptanceCriteria: [
      'WCAG 2.1 AA compliance achieved',
      'Responsive design tested on all breakpoints',
      'Loading states implemented',
      'Error states designed and implemented',
      'Empty states designed and implemented'
    ],
    allowedPaths: ['app/components/**', 'app/styles/**', 'tests/components/**'],
    priority: 'P2' as const,
    estimatedHours: 4,
    phase: 'Phase 11'
  },

  // PRODUCT - Growth Engine Feature Specs
  {
    assignedTo: 'product',
    taskId: 'PRODUCT-019',
    title: 'Growth Engine Phase 12 Feature Specifications',
    description: 'Create detailed feature specifications for Phase 12 Growth Engine features: CX conversation mining, theme task generation, and product ideation workflow.',
    acceptanceCriteria: [
      'CX conversation mining spec complete',
      'Theme task generation spec complete',
      'Product ideation workflow spec complete',
      'User flows documented',
      'Acceptance criteria defined'
    ],
    allowedPaths: ['docs/specs/**', 'docs/product/**'],
    priority: 'P2' as const,
    estimatedHours: 3,
    phase: 'Phase 12'
  },

  // QA - Growth Engine Integration Testing
  {
    assignedTo: 'qa',
    taskId: 'QA-002',
    title: 'Growth Engine End-to-End Integration Testing',
    description: 'Create and execute comprehensive end-to-end integration tests for Growth Engine: agent handoffs, approval workflows, action attribution, and telemetry pipeline.',
    acceptanceCriteria: [
      'Agent handoff tests passing',
      'Approval workflow tests passing',
      'Action attribution tests passing',
      'Telemetry pipeline tests passing',
      'Test coverage > 80%'
    ],
    allowedPaths: ['tests/integration/**', 'tests/e2e/**'],
    priority: 'P1' as const,
    estimatedHours: 4,
    phase: 'Phase 11'
  },

  // PILOT - Growth Engine Smoke Testing
  {
    assignedTo: 'pilot',
    taskId: 'PILOT-002',
    title: 'Growth Engine Smoke Testing and Validation',
    description: 'Execute smoke testing for all Growth Engine features: verify critical paths, validate data flows, test error handling, and confirm rollback procedures.',
    acceptanceCriteria: [
      'Critical paths validated',
      'Data flows tested',
      'Error handling verified',
      'Rollback procedures confirmed',
      'Smoke test suite documented'
    ],
    allowedPaths: ['tests/smoke/**', 'docs/runbooks/**'],
    priority: 'P2' as const,
    estimatedHours: 3,
    phase: 'Phase 11'
  },

  // SUPPORT - Growth Engine Documentation
  {
    assignedTo: 'support',
    taskId: 'SUPPORT-002',
    title: 'Growth Engine User Documentation and Training',
    description: 'Create comprehensive user documentation and training materials for Growth Engine: user guides, video tutorials, troubleshooting guides, and FAQ.',
    acceptanceCriteria: [
      'User guides complete',
      'Video tutorials recorded',
      'Troubleshooting guides written',
      'FAQ documented',
      'Training materials reviewed'
    ],
    allowedPaths: ['docs/support/**', 'docs/guides/**', 'docs/troubleshooting/**'],
    priority: 'P2' as const,
    estimatedHours: 4,
    phase: 'Phase 12'
  },

  // QA-HELPER - UI Component Testing (unblock from analytics.ts fix)
  {
    assignedTo: 'qa-helper',
    taskId: 'QA-UI-002',
    title: 'Growth Engine UI Component Testing',
    description: 'Create comprehensive UI component tests for Growth Engine components: ActionQueueCard, ApprovalDrawer, PII Card, and all dashboard tiles.',
    acceptanceCriteria: [
      'ActionQueueCard tests passing',
      'ApprovalDrawer tests passing',
      'PII Card tests passing',
      'Dashboard tile tests passing',
      'Test coverage > 85%'
    ],
    allowedPaths: ['tests/unit/**', 'tests/components/**'],
    priority: 'P1' as const,
    estimatedHours: 3,
    phase: 'Phase 11'
  }
];

async function assignAllTasks() {
  console.log('🎯 Assigning Next Phase Tasks to All 17 Agents');
  console.log('='.repeat(80));
  console.log(`\nTotal tasks to assign: ${TASKS.length}\n`);

  let successCount = 0;
  let existsCount = 0;
  let errorCount = 0;

  for (const task of TASKS) {
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
  console.log('📊 Assignment Summary:');
  console.log(`   ✅ Successfully assigned: ${successCount}`);
  console.log(`   ⚠️  Already exists: ${existsCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📋 Total: ${TASKS.length}`);
  console.log('\n✅ Task assignment complete!');
}

assignAllTasks().catch(console.error);

