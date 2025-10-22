import { assignTask } from '../../app/services/tasks.server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assignAllIdleAgents() {
  console.log('🎯 Assigning Tasks to ALL Idle Agents (15 completed agents)');
  console.log('=' .repeat(60));

  // ENGINEER - Growth Engine Core Features
  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'engineer',
    taskId: 'ENG-024',
    title: 'Growth Engine Advanced Dashboard Features',
    description: 'Implement advanced dashboard features for Growth Engine phases 9-12 including real-time updates, advanced analytics, and performance optimizations.',
    acceptanceCriteria: [
      'Advanced dashboard features implemented',
      'Real-time updates working across all tiles',
      'Performance optimizations applied',
      'All Growth Engine requirements met'
    ],
    allowedPaths: ['app/**'],
    priority: 'P0',
    estimatedHours: 4,
    dependencies: [],
  });

  // DESIGNER - Growth Engine UX
  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'designer',
    taskId: 'DES-022',
    title: 'Growth Engine UX Design System',
    description: 'Create comprehensive UX design system for Growth Engine phases 9-12 with advanced components and interactions.',
    acceptanceCriteria: [
      'Growth Engine design system created',
      'Advanced component library updated',
      'UX patterns for all phases documented',
      'Accessibility guidelines updated'
    ],
    allowedPaths: ['docs/design/**'],
    priority: 'P0',
    estimatedHours: 3,
    dependencies: [],
  });

  // DATA - Growth Engine Data Architecture
  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'data',
    taskId: 'DATA-108',
    title: 'Growth Engine Data Architecture',
    description: 'Design and implement comprehensive data architecture for Growth Engine phases 9-12 with advanced analytics and reporting.',
    acceptanceCriteria: [
      'Growth Engine data architecture designed',
      'Advanced analytics tables created',
      'Data flow optimized for performance',
      'Reporting infrastructure implemented'
    ],
    allowedPaths: ['supabase/migrations/**', 'prisma/schema.prisma', 'docs/**'],
    priority: 'P0',
    estimatedHours: 3,
    dependencies: [],
  });

  // DEVOPS - Growth Engine Infrastructure
  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'devops',
    taskId: 'DEVOPS-006',
    title: 'Growth Engine Infrastructure Setup',
    description: 'Set up infrastructure for Growth Engine phases 9-12 including monitoring, scaling, and deployment automation.',
    acceptanceCriteria: [
      'Growth Engine infrastructure configured',
      'Monitoring and alerting set up',
      'Scaling policies implemented',
      'Deployment automation working'
    ],
    allowedPaths: ['docs/runbooks/**', 'fly.toml', 'package.json'],
    priority: 'P0',
    estimatedHours: 3,
    dependencies: [],
  });

  // INTEGRATIONS - Growth Engine Integrations
  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'integrations',
    taskId: 'INTEGRATIONS-102',
    title: 'Growth Engine Advanced Integrations',
    description: 'Implement advanced integrations for Growth Engine phases 9-12 including AI services, analytics platforms, and third-party APIs.',
    acceptanceCriteria: [
      'Advanced integrations implemented',
      'AI services integrated',
      'Analytics platforms connected',
      'Third-party APIs working'
    ],
    allowedPaths: ['app/**', 'docs/**'],
    priority: 'P0',
    estimatedHours: 3,
    dependencies: [],
  });

  // ANALYTICS - Growth Engine Analytics
  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'analytics',
    taskId: 'ANALYTICS-022',
    title: 'Growth Engine Advanced Analytics',
    description: 'Implement advanced analytics for Growth Engine phases 9-12 including predictive analytics, machine learning, and business intelligence.',
    acceptanceCriteria: [
      'Advanced analytics implemented',
      'Predictive analytics working',
      'Machine learning models deployed',
      'Business intelligence dashboards created'
    ],
    allowedPaths: ['app/**', 'docs/**'],
    priority: 'P0',
    estimatedHours: 3,
    dependencies: [],
  });

  // INVENTORY - Growth Engine Inventory
  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'inventory',
    taskId: 'INVENTORY-103',
    title: 'Growth Engine Inventory Optimization',
    description: 'Implement advanced inventory optimization for Growth Engine phases 9-12 including AI-powered forecasting and automated reordering.',
    acceptanceCriteria: [
      'Advanced inventory optimization implemented',
      'AI-powered forecasting working',
      'Automated reordering system active',
      'Inventory analytics dashboard created'
    ],
    allowedPaths: ['app/**', 'docs/**'],
    priority: 'P0',
    estimatedHours: 3,
    dependencies: [],
  });

  // ADS - Growth Engine Advertising
  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'ads',
    taskId: 'ADS-103',
    title: 'Growth Engine Advanced Advertising',
    description: 'Implement advanced advertising features for Growth Engine phases 9-12 including AI-powered ad optimization and automated campaigns.',
    acceptanceCriteria: [
      'Advanced advertising features implemented',
      'AI-powered ad optimization working',
      'Automated campaigns active',
      'Advertising analytics dashboard created'
    ],
    allowedPaths: ['app/**', 'docs/**'],
    priority: 'P0',
    estimatedHours: 3,
    dependencies: [],
  });

  // CONTENT - Growth Engine Content
  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'content',
    taskId: 'CONTENT-024',
    title: 'Growth Engine Content Strategy',
    description: 'Develop comprehensive content strategy for Growth Engine phases 9-12 including AI-generated content and automated content optimization.',
    acceptanceCriteria: [
      'Growth Engine content strategy created',
      'AI-generated content system implemented',
      'Automated content optimization working',
      'Content analytics dashboard created'
    ],
    allowedPaths: ['docs/**'],
    priority: 'P0',
    estimatedHours: 3,
    dependencies: [],
  });

  // QA - Growth Engine Quality Assurance
  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'qa',
    taskId: 'QA-104',
    title: 'Growth Engine Quality Assurance',
    description: 'Implement comprehensive quality assurance for Growth Engine phases 9-12 including automated testing, performance monitoring, and quality gates.',
    acceptanceCriteria: [
      'Growth Engine QA framework created',
      'Automated testing implemented',
      'Performance monitoring active',
      'Quality gates established'
    ],
    allowedPaths: ['docs/**'],
    priority: 'P0',
    estimatedHours: 3,
    dependencies: [],
  });

  // PILOT - Growth Engine Testing
  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'pilot',
    taskId: 'PILOT-022',
    title: 'Growth Engine Testing Framework',
    description: 'Develop comprehensive testing framework for Growth Engine phases 9-12 including end-to-end testing, user acceptance testing, and performance testing.',
    acceptanceCriteria: [
      'Growth Engine testing framework created',
      'End-to-end testing implemented',
      'User acceptance testing active',
      'Performance testing automated'
    ],
    allowedPaths: ['docs/**'],
    priority: 'P0',
    estimatedHours: 3,
    dependencies: [],
  });

  // AI-CUSTOMER - Growth Engine AI
  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'ai-customer',
    taskId: 'AI-CUSTOMER-105',
    title: 'Growth Engine AI Implementation',
    description: 'Implement advanced AI features for Growth Engine phases 9-12 including natural language processing, machine learning, and automated decision making.',
    acceptanceCriteria: [
      'Advanced AI features implemented',
      'Natural language processing working',
      'Machine learning models deployed',
      'Automated decision making active'
    ],
    allowedPaths: ['app/**', 'docs/**'],
    priority: 'P0',
    estimatedHours: 3,
    dependencies: [],
  });

  // AI-KNOWLEDGE - Growth Engine Knowledge
  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'ai-knowledge',
    taskId: 'AI-KNOWLEDGE-101',
    title: 'Growth Engine Knowledge Management',
    description: 'Implement advanced knowledge management for Growth Engine phases 9-12 including AI-powered search, knowledge graphs, and automated content curation.',
    acceptanceCriteria: [
      'Advanced knowledge management implemented',
      'AI-powered search working',
      'Knowledge graphs created',
      'Automated content curation active'
    ],
    allowedPaths: ['app/**', 'docs/**'],
    priority: 'P0',
    estimatedHours: 3,
    dependencies: [],
  });

  // SUPPORT - Growth Engine Support
  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'support',
    taskId: 'SUPPORT-013',
    title: 'Growth Engine Support Framework',
    description: 'Create comprehensive support framework for Growth Engine phases 9-12 including AI-powered support, automated troubleshooting, and advanced documentation.',
    acceptanceCriteria: [
      'Growth Engine support framework created',
      'AI-powered support implemented',
      'Automated troubleshooting active',
      'Advanced documentation created'
    ],
    allowedPaths: ['docs/runbooks/**'],
    priority: 'P0',
    estimatedHours: 3,
    dependencies: [],
  });

  // MANAGER - Growth Engine Coordination
  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'manager',
    taskId: 'MANAGER-002',
    title: 'Growth Engine Project Coordination',
    description: 'Coordinate Growth Engine phases 9-12 implementation across all agents including project management, milestone tracking, and stakeholder communication.',
    acceptanceCriteria: [
      'Growth Engine project plan created',
      'Milestone tracking implemented',
      'Stakeholder communication active',
      'Agent coordination optimized'
    ],
    allowedPaths: ['docs/**'],
    priority: 'P0',
    estimatedHours: 4,
    dependencies: [],
  });

  console.log('\n✅ ALL 15 Idle Agents Assigned New Tasks');
  console.log('Priority: P0 for all agents');
  console.log('Focus: Growth Engine phases 9-12 implementation');
  console.log('Total: 15 new tasks assigned');
  console.log('Next: All agents should start working immediately');
}

assignAllIdleAgents().finally(() => prisma.$disconnect());
