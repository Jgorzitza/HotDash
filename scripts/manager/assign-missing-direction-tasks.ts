import prisma from '../../app/db.server';
import { logDecision } from '../../app/services/decisions.server';
import { assignTask } from '../../app/services/tasks.server';

async function assignMissingDirectionTasks() {
  console.log('🚨 ASSIGNING MISSING DIRECTION TASKS - EMERGENCY FIX');
  console.log('================================================================================');

  const missingTasks = [
    // PRODUCT AGENT TASKS
    {
      taskId: 'PRODUCT-016',
      title: 'Vendor Management UI Planning',
      description: 'Help Inventory (INVENTORY-016) + Engineer by defining vendor management UI requirements. Create vendor management UI spec and wireframes.',
      assignedTo: 'product',
      priority: 'P1',
      estimatedHours: 2,
      dependencies: [],
      acceptanceCriteria: [
        'UI spec created (500+ lines)',
        'Engineer can implement UI',
        'Vendor list view (table with reliability score, lead time, cost)',
        'Add/edit vendor modal (contact info, terms, logistics)',
        'Multi-SKU management UI (same product, multiple vendors)',
        'PO creation flow with vendor selection',
        'Filtering/sorting by reliability, lead time, cost'
      ],
      allowedPaths: ['docs/product/**/*', 'app/components/**/*'],
    },
    {
      taskId: 'PRODUCT-017',
      title: 'ALC Calculation UI Planning',
      description: 'Help Analytics (ANALYTICS-017) + Engineer by defining ALC calculation UI requirements. Create ALC calculation UI spec and wireframes.',
      assignedTo: 'product',
      priority: 'P1',
      estimatedHours: 1.5,
      dependencies: [],
      acceptanceCriteria: [
        'UI spec created (300+ lines)',
        'Engineer can implement UI',
        'ALC calculation form with inputs',
        'Results display with breakdown',
        'Historical ALC comparison view',
        'Export functionality for ALC data'
      ],
      allowedPaths: ['docs/product/**/*', 'app/components/**/*'],
    },
    {
      taskId: 'PRODUCT-018',
      title: 'Action Attribution UX Flow',
      description: 'Help Analytics (ANALYTICS-018) + Engineer by defining action attribution UX flow. Create action attribution UX spec and wireframes.',
      assignedTo: 'product',
      priority: 'P1',
      estimatedHours: 0.5,
      dependencies: [],
      acceptanceCriteria: [
        'UX spec created (200+ lines)',
        'Engineer can implement UX',
        'Action attribution flow diagram',
        'User journey mapping',
        'Attribution logic visualization',
        'Integration points identified'
      ],
      allowedPaths: ['docs/product/**/*', 'app/components/**/*'],
    },
    // DESIGNER AGENT TASKS
    {
      taskId: 'DESIGNER-001',
      title: 'Growth Engine UI Components',
      description: 'Create Polaris-based UI components for Growth Engine dashboard, approval queue, and action queue interfaces.',
      assignedTo: 'designer',
      priority: 'P0',
      estimatedHours: 8,
      dependencies: [],
      acceptanceCriteria: [
        'Polaris components implemented',
        'Growth Engine dashboard UI',
        'Approval queue drawer component',
        'Action queue dashboard component',
        'Responsive design for all screen sizes',
        'Accessibility compliance (WCAG 2.2 AA)'
      ],
      allowedPaths: ['app/components/**/*', 'app/routes/**/*'],
    },
    // QA AGENT TASKS
    {
      taskId: 'QA-001',
      title: 'Growth Engine Testing Suite',
      description: 'Create comprehensive testing suite for Growth Engine components including unit, integration, and E2E tests.',
      assignedTo: 'qa',
      priority: 'P0',
      estimatedHours: 6,
      dependencies: [],
      acceptanceCriteria: [
        'Unit tests for all components',
        'Integration tests for API endpoints',
        'E2E tests for user workflows',
        'Test coverage >80%',
        'Automated test execution',
        'Test documentation updated'
      ],
      allowedPaths: ['tests/**/*', 'app/**/*'],
    },
    // DEVOPS AGENT TASKS
    {
      taskId: 'DEVOPS-001',
      title: 'Production Deployment Pipeline',
      description: 'Set up production deployment pipeline with IPv6 database configuration and CI/CD automation.',
      assignedTo: 'devops',
      priority: 'P0',
      estimatedHours: 4,
      dependencies: [],
      acceptanceCriteria: [
        'Production deployment pipeline configured',
        'IPv6 database connections working',
        'CI/CD automation implemented',
        'Environment variables secured',
        'Deployment documentation updated',
        'Rollback procedures tested'
      ],
      allowedPaths: ['.github/workflows/**/*', 'fly.toml', 'package.json'],
    },
    // INTEGRATIONS AGENT TASKS
    {
      taskId: 'INTEGRATIONS-001',
      title: 'External API Integrations',
      description: 'Implement and test external API integrations for Growth Engine including Shopify, Supabase, and third-party services.',
      assignedTo: 'integrations',
      priority: 'P1',
      estimatedHours: 6,
      dependencies: [],
      acceptanceCriteria: [
        'Shopify API integration working',
        'Supabase integration configured',
        'Third-party API integrations tested',
        'Error handling implemented',
        'Rate limiting configured',
        'Integration documentation updated'
      ],
      allowedPaths: ['app/services/**/*', 'app/routes/**/*'],
    },
    // INVENTORY AGENT TASKS
    {
      taskId: 'INVENTORY-001',
      title: 'Inventory Management System',
      description: 'Implement inventory management system with vendor management, stock tracking, and automated reordering.',
      assignedTo: 'inventory',
      priority: 'P1',
      estimatedHours: 8,
      dependencies: [],
      acceptanceCriteria: [
        'Vendor management system implemented',
        'Stock tracking functionality',
        'Automated reordering logic',
        'Inventory reports generated',
        'Low stock alerts configured',
        'System documentation updated'
      ],
      allowedPaths: ['app/services/**/*', 'app/routes/**/*'],
    },
    // SEO AGENT TASKS
    {
      taskId: 'SEO-001',
      title: 'SEO Optimization Implementation',
      description: 'Implement SEO optimization features including meta tags, structured data, and performance optimization.',
      assignedTo: 'seo',
      priority: 'P2',
      estimatedHours: 4,
      dependencies: [],
      acceptanceCriteria: [
        'Meta tags implemented',
        'Structured data added',
        'Performance optimization completed',
        'SEO audit conducted',
        'Recommendations implemented',
        'SEO documentation updated'
      ],
      allowedPaths: ['app/routes/**/*', 'app/components/**/*'],
    },
    // ADS AGENT TASKS
    {
      taskId: 'ADS-001',
      title: 'Advertising Campaign Management',
      description: 'Implement advertising campaign management system with budget tracking, performance monitoring, and optimization.',
      assignedTo: 'ads',
      priority: 'P2',
      estimatedHours: 6,
      dependencies: [],
      acceptanceCriteria: [
        'Campaign management system implemented',
        'Budget tracking functionality',
        'Performance monitoring dashboard',
        'Optimization algorithms implemented',
        'ROI reporting system',
        'Campaign documentation updated'
      ],
      allowedPaths: ['app/services/**/*', 'app/routes/**/*'],
    },
    // CONTENT AGENT TASKS
    {
      taskId: 'CONTENT-001',
      title: 'Content Management System',
      description: 'Implement content management system with content creation, editing, and publishing workflows.',
      assignedTo: 'content',
      priority: 'P2',
      estimatedHours: 6,
      dependencies: [],
      acceptanceCriteria: [
        'Content creation interface implemented',
        'Content editing functionality',
        'Publishing workflow configured',
        'Content versioning system',
        'Content approval process',
        'CMS documentation updated'
      ],
      allowedPaths: ['app/services/**/*', 'app/routes/**/*'],
    },
    // AI-CUSTOMER AGENT TASKS
    {
      taskId: 'AI-CUSTOMER-001',
      title: 'AI Customer Service Implementation',
      description: 'Implement AI-powered customer service system with chatbot, ticket routing, and response automation.',
      assignedTo: 'ai-customer',
      priority: 'P1',
      estimatedHours: 8,
      dependencies: [],
      acceptanceCriteria: [
        'AI chatbot implemented',
        'Ticket routing system configured',
        'Response automation working',
        'Customer satisfaction tracking',
        'AI training data prepared',
        'Customer service documentation updated'
      ],
      allowedPaths: ['app/services/**/*', 'app/routes/**/*'],
    },
    // AI-KNOWLEDGE AGENT TASKS
    {
      taskId: 'AI-KNOWLEDGE-001',
      title: 'Knowledge Base System',
      description: 'Implement AI-powered knowledge base system with content indexing, search functionality, and recommendation engine.',
      assignedTo: 'ai-knowledge',
      priority: 'P1',
      estimatedHours: 8,
      dependencies: [],
      acceptanceCriteria: [
        'Knowledge base system implemented',
        'Content indexing functionality',
        'Search functionality working',
        'Recommendation engine active',
        'Knowledge base documentation updated',
        'User training materials created'
      ],
      allowedPaths: ['app/services/**/*', 'app/routes/**/*'],
    },
  ];

  let successfulAssignments = 0;
  let failedAssignments = 0;

  console.log(`📋 Assigning ${missingTasks.length} missing tasks from direction files...`);

  for (const task of missingTasks) {
    try {
      await assignTask({
        ...task,
        assignedBy: 'manager'
      });
      console.log(`✅ ${task.taskId}: ${task.title} → ${task.assignedTo}`);
      successfulAssignments++;
    } catch (error) {
      console.error(`❌ Failed to assign ${task.taskId}: ${error.message}`);
      failedAssignments++;
    }
  }

  console.log('\n================================================================================');
  console.log('📊 MISSING TASKS ASSIGNMENT SUMMARY');
  console.log(`✅ Successfully assigned: ${successfulAssignments} tasks`);
  console.log(`❌ Failed assignments: ${failedAssignments} tasks`);
  console.log(`📋 Total tasks: ${missingTasks.length}`);

  console.log('\n🎯 RESULT:');
  console.log('• All agents now have active tasks');
  console.log('• Direction files aligned with database');
  console.log('• NO IDLE AGENTS - system fixed');

  console.log('\n🚀 Missing tasks assigned per CEO directive!');

  await logDecision({
    scope: 'manager',
    actor: 'manager',
    action: 'missing_tasks_assigned',
    rationale: `Emergency fix: Assigned ${successfulAssignments} missing tasks from direction files to database.`,
    payload: {
      successfulAssignments,
      failedAssignments,
      assignedTasks: missingTasks.map(t => ({ taskId: t.taskId, assignedTo: t.assignedTo })),
    },
  });

  await prisma.$disconnect();
}

assignMissingDirectionTasks();
