/**
 * Manager Direction Distribution - 2025-10-24
 * 
 * Distributes tasks to ALL agents based on system status report and alignment plan.
 * NO IDLE AGENTS - everyone gets work assigned.
 */

import "dotenv/config";
import { assignTask } from "../../app/services/tasks.server";
import { logDecision } from "../../app/services/decisions.server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// All available agents from agents.json
const ALL_AGENTS = [
  "manager", "engineer", "qa", "devops", "integrations",
  "ai-customer", "ceo-insights", "ai-knowledge", "inventory",
  "analytics", "seo", "ads", "content", "support",
  "designer", "product", "data"
];

interface TaskDef {
  assignedTo: string;
  taskId: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  allowedPaths: string[];
  priority: "P0" | "P1" | "P2" | "P3";
  estimatedHours: number;
  dependencies?: string[];
  phase?: string;
}

const TASKS: TaskDef[] = [
  // P0 - CRITICAL PATH (System Infrastructure)
  {
    assignedTo: "devops",
    taskId: "DEVOPS-LLAMAINDEX-001",
    title: "Resume LlamaIndex MCP Server",
    description: "Resume the suspended LlamaIndex MCP server and verify it's operational for all agents to use.",
    acceptanceCriteria: [
      "fly apps resume hotdash-llamaindex-mcp executed successfully",
      "Health check returns 200 OK with proper JSON response",
      "All 3 tools (query_knowledge_base, knowledge_base_stats, query_support) listed",
      "Metrics endpoint accessible and returning data",
      "Server logs show no errors"
    ],
    allowedPaths: ["apps/llamaindex-mcp-server/**", "scripts/ops/**"],
    priority: "P0",
    estimatedHours: 0.5,
    phase: "Infrastructure"
  },
  
  {
    assignedTo: "devops",
    taskId: "DEVOPS-CHATWOOT-001",
    title: "Investigate and Fix Chatwoot Accessibility",
    description: "Investigate why Chatwoot is not accessible and restore service. Follow investigation steps from system status report.",
    acceptanceCriteria: [
      "Chatwoot health check passes (https://hotdash-chatwoot.fly.dev accessible)",
      "Database connectivity verified (rails db:migrate:status works)",
      "All required secrets present and valid",
      "Web and worker machines running without critical status",
      "Can create test conversation and send message",
      "Root cause documented in evidence file"
    ],
    allowedPaths: ["deploy/chatwoot/**", "scripts/ops/**", "docs/deployment/**"],
    priority: "P0",
    estimatedHours: 2,
    dependencies: [],
    phase: "Infrastructure"
  },

  // P0 - CRITICAL PATH (Agent Alignment)
  {
    assignedTo: "engineer",
    taskId: "ENG-LLAMAINDEX-MCP-001",
    title: "Migrate CEO Agent to LlamaIndex MCP",
    description: "Migrate CEO agent from direct LlamaIndex.TS to LlamaIndex MCP server (same pattern as customer agents). Follow alignment plan in docs/manager/LLAMAINDEX_MCP_ALIGNMENT_2025-10-24.md",
    acceptanceCriteria: [
      "packages/agents/src/ai-ceo.ts updated to call MCP server",
      "llamaindex.query tool calls https://hotdash-llamaindex-mcp.fly.dev/mcp/tools/call",
      "app/services/rag/ceo-knowledge-base.ts archived (no longer used)",
      "app/routes/api.ceo-agent.llamaindex.query.ts archived (no longer used)",
      "LLAMAINDEX_MCP_URL env var added to .env.local and Fly secrets",
      "Test queries return results from MCP server",
      "MCP server metrics show CEO agent calls incrementing"
    ],
    allowedPaths: [
      "packages/agents/src/ai-ceo.ts",
      "app/services/rag/**",
      "app/routes/api.ceo-agent.llamaindex.query.ts",
      "docs/_archive/**"
    ],
    priority: "P0",
    estimatedHours: 3,
    dependencies: ["DEVOPS-LLAMAINDEX-001"],
    phase: "Agent Alignment"
  },

  {
    assignedTo: "qa",
    taskId: "QA-AGENT-HANDOFFS-001",
    title: "Test All Agent Handoffs and LlamaIndex MCP Integration",
    description: "Verify all agent handoffs work correctly and all agents use LlamaIndex MCP (not direct LlamaIndex.TS). Test customer agents (Triage → sub-agents) and CEO agent.",
    acceptanceCriteria: [
      "Customer agent test: Triage → Order Support → answerFromDocs (MCP) works",
      "Customer agent test: Triage → Product Q&A → answerFromDocs (MCP) works",
      "CEO agent test: llamaindex.query → MCP server works",
      "MCP server metrics show calls from all agents",
      "No direct LlamaIndex.TS usage detected in logs",
      "All test results documented with evidence"
    ],
    allowedPaths: ["tests/**", "scripts/qa/**", "docs/qa/**"],
    priority: "P0",
    estimatedHours: 2,
    dependencies: ["ENG-LLAMAINDEX-MCP-001"],
    phase: "Agent Alignment"
  },

  // P0 - NEW FEATURE (Image Search)
  {
    assignedTo: "data",
    taskId: "DATA-IMAGE-SEARCH-001",
    title: "Implement Image Search Database Schema",
    description: "Create SQL migration for image search tables (customer_photos, image_embeddings) with pgvector support. Follow spec in docs/specs/image-search-simplified-implementation.md",
    acceptanceCriteria: [
      "Migration file created with customer_photos table",
      "Migration file created with image_embeddings table (vector(1536))",
      "IVFFlat index created for vector similarity search",
      "RLS policies created for project isolation",
      "Service role policies created for worker access",
      "Migration tested locally and applied successfully",
      "Schema documented in migration file comments"
    ],
    allowedPaths: ["supabase/migrations/**", "prisma/migrations/**"],
    priority: "P0",
    estimatedHours: 1.5,
    phase: "Image Search"
  },

  {
    assignedTo: "engineer",
    taskId: "ENG-IMAGE-SEARCH-001",
    title: "Implement Image Search Services (GPT-4 Vision + Embeddings)",
    description: "Implement image description service (GPT-4 Vision) and text embedding service for image search. Follow simplified approach from spec.",
    acceptanceCriteria: [
      "app/services/knowledge/image-description.ts created (GPT-4 Vision)",
      "generateImageDescription() function works with signed URLs",
      "generateImageDescriptionFromBase64() function works",
      "Text embedding service reused from existing code",
      "EXIF stripping implemented (privacy)",
      "Thumbnail generation implemented",
      "All services tested with sample images",
      "Cost per image verified (~$0.001)"
    ],
    allowedPaths: [
      "app/services/knowledge/**",
      "app/services/images/**",
      "tests/unit/services/**"
    ],
    priority: "P0",
    estimatedHours: 3,
    dependencies: ["DATA-IMAGE-SEARCH-001"],
    phase: "Image Search"
  },

  {
    assignedTo: "engineer",
    taskId: "ENG-IMAGE-SEARCH-002",
    title: "Implement Image Upload API and Worker",
    description: "Implement image upload API with EXIF stripping, de-duplication, and async worker for embedding generation.",
    acceptanceCriteria: [
      "app/routes/api.images.upload.ts created",
      "EXIF data stripped from uploads (privacy)",
      "De-duplication via checksum works",
      "Thumbnails generated and stored",
      "app/workers/image-embedding-worker.ts created",
      "Worker generates descriptions via GPT-4 Vision",
      "Worker generates embeddings via OpenAI",
      "Worker stores in pgvector",
      "Upload returns immediately, processing async",
      "Error handling and logging implemented"
    ],
    allowedPaths: [
      "app/routes/api.images.upload.ts",
      "app/workers/**",
      "tests/integration/**"
    ],
    priority: "P0",
    estimatedHours: 3,
    dependencies: ["ENG-IMAGE-SEARCH-001"],
    phase: "Image Search"
  },

  {
    assignedTo: "engineer",
    taskId: "ENG-IMAGE-SEARCH-003",
    title: "Implement Image Search API",
    description: "Implement search API that converts text queries to embeddings and searches pgvector for similar images.",
    acceptanceCriteria: [
      "app/routes/api.search.images.ts created",
      "Text query → embedding → pgvector similarity search works",
      "Returns images with similarity scores",
      "Supports minSimilarity threshold (default 0.7)",
      "Supports limit parameter (default 10)",
      "Supports project isolation",
      "Response includes image URLs, descriptions, dimensions",
      "Search performance < 500ms for typical queries"
    ],
    allowedPaths: [
      "app/routes/api.search.images.ts",
      "tests/integration/**"
    ],
    priority: "P0",
    estimatedHours: 2,
    dependencies: ["ENG-IMAGE-SEARCH-002"],
    phase: "Image Search"
  },

  // P1 - DOCUMENTATION & INTEGRATION
  {
    assignedTo: "product",
    taskId: "PRODUCT-DOCS-001",
    title: "Update Documentation for LlamaIndex MCP Alignment",
    description: "Update all documentation to reflect LlamaIndex MCP alignment (remove references to direct LlamaIndex.TS).",
    acceptanceCriteria: [
      "docs/integrations/ceo-agent.md updated (LlamaIndex section)",
      "docs/manager/AGENT_DIRECTION_2025-10-24.md reflects current state",
      "README.md agent architecture diagram updated",
      "Old direct LlamaIndex.TS files archived with git history",
      "All references to direct LlamaIndex.TS removed",
      "MCP-first pattern documented clearly"
    ],
    allowedPaths: ["docs/**", "README.md"],
    priority: "P1",
    estimatedHours: 1,
    dependencies: ["ENG-LLAMAINDEX-MCP-001"],
    phase: "Documentation"
  },

  {
    assignedTo: "integrations",
    taskId: "INT-CHATWOOT-001",
    title: "Test Chatwoot Integration After Fix",
    description: "Test Chatwoot integration end-to-end after DevOps fixes accessibility issues.",
    acceptanceCriteria: [
      "Webhook handler receives events correctly",
      "Agent SDK processes messages",
      "Private notes created successfully",
      "Public replies sent after approval",
      "HITL workflow works end-to-end",
      "All integration points tested and documented"
    ],
    allowedPaths: [
      "app/routes/api.webhooks.chatwoot.tsx",
      "supabase/functions/chatwoot-webhook/**",
      "tests/integration/**"
    ],
    priority: "P1",
    estimatedHours: 2,
    dependencies: ["DEVOPS-CHATWOOT-001"],
    phase: "Integration"
  },

  // P1 - UI & DESIGN
  {
    assignedTo: "designer",
    taskId: "DESIGNER-IMAGE-SEARCH-001",
    title: "Design Image Search UI Components",
    description: "Design UI components for image upload, search, and results display using Shopify Polaris.",
    acceptanceCriteria: [
      "Image upload component designed (drag-drop, file picker)",
      "Image search input component designed",
      "Search results grid component designed",
      "Image preview modal designed",
      "Loading states designed",
      "Error states designed",
      "All components follow Polaris design system",
      "Figma/design files created and shared"
    ],
    allowedPaths: ["docs/design/**", "app/components/**"],
    priority: "P1",
    estimatedHours: 3,
    dependencies: [],
    phase: "Image Search UI"
  },

  // P2 - MONITORING & ANALYTICS
  {
    assignedTo: "analytics",
    taskId: "ANALYTICS-LLAMAINDEX-001",
    title: "Set Up LlamaIndex MCP Monitoring",
    description: "Set up monitoring and analytics for LlamaIndex MCP server usage across all agents.",
    acceptanceCriteria: [
      "Metrics dashboard created for MCP server",
      "Track calls per agent (CEO, Order Support, Product Q&A)",
      "Track query latency and errors",
      "Track knowledge base stats (documents, categories)",
      "Alerts configured for errors or high latency",
      "Weekly report automation set up"
    ],
    allowedPaths: ["app/routes/admin.analytics.**", "scripts/analytics/**"],
    priority: "P2",
    estimatedHours: 2,
    dependencies: ["DEVOPS-LLAMAINDEX-001"],
    phase: "Monitoring"
  },

  {
    assignedTo: "analytics",
    taskId: "ANALYTICS-IMAGE-SEARCH-001",
    title: "Set Up Image Search Analytics",
    description: "Set up analytics for image search feature (upload volume, search queries, performance).",
    acceptanceCriteria: [
      "Track image uploads per day/week/month",
      "Track search queries and results",
      "Track GPT-4 Vision API costs",
      "Track embedding generation costs",
      "Track search performance (latency)",
      "Dashboard created for image search metrics"
    ],
    allowedPaths: ["app/routes/admin.analytics.**", "scripts/analytics/**"],
    priority: "P2",
    estimatedHours: 2,
    dependencies: ["ENG-IMAGE-SEARCH-003"],
    phase: "Monitoring"
  },

  // P2 - CONTENT & SEO
  {
    assignedTo: "content",
    taskId: "CONTENT-KB-001",
    title: "Expand Knowledge Base Content",
    description: "Add more content to knowledge base for LlamaIndex MCP to improve agent responses.",
    acceptanceCriteria: [
      "Shipping policy documented in detail",
      "Return policy documented in detail",
      "Warranty policy documented in detail",
      "Product troubleshooting guides added",
      "FAQ section expanded (20+ questions)",
      "All content indexed in LlamaIndex",
      "Content tested with sample queries"
    ],
    allowedPaths: ["packages/memory/indexes/**", "docs/knowledge-base/**"],
    priority: "P2",
    estimatedHours: 3,
    phase: "Content"
  },

  {
    assignedTo: "seo",
    taskId: "SEO-IMAGE-SEARCH-001",
    title: "SEO Optimization for Image Search",
    description: "Optimize image search feature for SEO (alt text, structured data, sitemaps).",
    acceptanceCriteria: [
      "Alt text generation implemented for uploaded images",
      "Structured data (schema.org) added for images",
      "Image sitemap generated",
      "Image URLs optimized for SEO",
      "Meta tags added for image pages",
      "SEO best practices documented"
    ],
    allowedPaths: ["app/routes/**", "app/services/seo/**"],
    priority: "P2",
    estimatedHours: 2,
    dependencies: ["ENG-IMAGE-SEARCH-003"],
    phase: "SEO"
  },

  // P2 - SUPPORT & TRAINING
  {
    assignedTo: "support",
    taskId: "SUPPORT-AGENT-TRAINING-001",
    title: "Create Agent Training Documentation",
    description: "Create training documentation for customer support agents on how to use AI-assisted replies.",
    acceptanceCriteria: [
      "Training guide created for Chatwoot integration",
      "How to review AI-generated drafts documented",
      "Grading system explained (tone/accuracy/policy)",
      "Common scenarios and examples provided",
      "Troubleshooting guide created",
      "Video tutorial recorded (optional)"
    ],
    allowedPaths: ["docs/training/**", "docs/support/**"],
    priority: "P2",
    estimatedHours: 2,
    dependencies: ["INT-CHATWOOT-001"],
    phase: "Training"
  },

  // P3 - FUTURE ENHANCEMENTS
  {
    assignedTo: "ai-knowledge",
    taskId: "AI-KB-REFRESH-001",
    title: "Implement Knowledge Base Auto-Refresh",
    description: "Implement automatic knowledge base refresh when new content is added.",
    acceptanceCriteria: [
      "File watcher detects new content in knowledge base",
      "Auto-refresh triggered via LlamaIndex MCP refresh_index tool",
      "Refresh runs async without blocking",
      "Refresh status tracked and logged",
      "Manual refresh endpoint created",
      "Refresh schedule configured (daily)"
    ],
    allowedPaths: ["app/workers/**", "app/routes/api.knowledge-base.**"],
    priority: "P3",
    estimatedHours: 2,
    dependencies: ["DEVOPS-LLAMAINDEX-001"],
    phase: "Automation"
  },

  {
    assignedTo: "inventory",
    taskId: "INVENTORY-IMAGE-SEARCH-001",
    title: "Integrate Image Search with Inventory System",
    description: "Allow searching inventory by product images (visual similarity for product matching).",
    acceptanceCriteria: [
      "Product images indexed in image search",
      "Search by product image returns similar products",
      "Integration with Shopify product catalog",
      "Inventory levels shown in search results",
      "Out-of-stock products filtered or marked",
      "Search performance acceptable for inventory queries"
    ],
    allowedPaths: ["app/services/inventory/**", "app/routes/api.inventory.**"],
    priority: "P3",
    estimatedHours: 3,
    dependencies: ["ENG-IMAGE-SEARCH-003"],
    phase: "Inventory Integration"
  },

  {
    assignedTo: "ads",
    taskId: "ADS-IMAGE-SEARCH-001",
    title: "Use Image Search for Ad Creative Optimization",
    description: "Use image search to find similar high-performing ad creatives for optimization.",
    acceptanceCriteria: [
      "Ad creative images indexed in image search",
      "Search by performance metrics (CTR, ROAS)",
      "Find similar creatives to high performers",
      "Recommendations for new ad creatives",
      "Integration with ad platform APIs",
      "Performance tracking and reporting"
    ],
    allowedPaths: ["app/services/ads/**", "app/routes/api.ads.**"],
    priority: "P3",
    estimatedHours: 3,
    dependencies: ["ENG-IMAGE-SEARCH-003"],
    phase: "Ads Optimization"
  },

  {
    assignedTo: "ceo-insights",
    taskId: "CEO-DASHBOARD-001",
    title: "Create CEO Dashboard with LlamaIndex Insights",
    description: "Create executive dashboard that uses LlamaIndex MCP to provide business insights.",
    acceptanceCriteria: [
      "Dashboard shows key metrics (revenue, orders, inventory)",
      "AI-generated insights from LlamaIndex MCP",
      "Natural language query interface",
      "Trend analysis and recommendations",
      "Export to PDF/email functionality",
      "Real-time updates via SSE"
    ],
    allowedPaths: ["app/routes/admin.ceo.**", "app/components/ceo/**"],
    priority: "P3",
    estimatedHours: 4,
    dependencies: ["ENG-LLAMAINDEX-MCP-001"],
    phase: "CEO Tools"
  },

  {
    assignedTo: "ai-customer",
    taskId: "AI-CUSTOMER-HANDOFF-001",
    title: "Implement Customer Agent Handoff Improvements",
    description: "Improve customer agent handoff logic and add more sub-agents for specialized tasks.",
    acceptanceCriteria: [
      "Handoff logic improved (better intent classification)",
      "New sub-agents added (shipping, technical support)",
      "Handoff metrics tracked (accuracy, latency)",
      "Fallback to human agent implemented",
      "Handoff testing automated",
      "Documentation updated"
    ],
    allowedPaths: ["apps/agent-service/src/agents/**", "apps/agent-service/src/tools/**"],
    priority: "P3",
    estimatedHours: 3,
    dependencies: ["QA-AGENT-HANDOFFS-001"],
    phase: "Agent Improvements"
  }
];

async function distributeDirection() {
  console.log("🎯 MANAGER DIRECTION DISTRIBUTION - 2025-10-24");
  console.log("=".repeat(80));
  console.log(`\n📋 Total tasks to assign: ${TASKS.length}`);
  console.log(`👥 Agents receiving work: ${new Set(TASKS.map(t => t.assignedTo)).size}/${ALL_AGENTS.length}\n`);

  let successCount = 0;
  let existsCount = 0;
  let errorCount = 0;

  for (const task of TASKS) {
    try {
      await assignTask({
        assignedBy: "manager",
        ...task
      });
      console.log(`✅ ${task.taskId}: ${task.title} → ${task.assignedTo} (${task.priority}, ${task.estimatedHours}h)`);
      successCount++;
    } catch (error: any) {
      if (error.message?.includes("Unique constraint") || error.code === "P2002") {
        console.log(`⚠️  ${task.taskId}: Already exists`);
        existsCount++;
      } else {
        console.error(`❌ ${task.taskId}: ${error.message}`);
        errorCount++;
      }
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log(`✅ Successfully assigned: ${successCount}`);
  console.log(`⚠️  Already existed: ${existsCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📊 Total: ${successCount + existsCount + errorCount}/${TASKS.length}`);

  // Log to decision log
  await logDecision({
    scope: "build",
    actor: "manager",
    action: "direction_distributed",
    rationale: `Direction distributed to ALL agents (NO IDLE). Assigned ${successCount} new tasks, ${existsCount} already existed. Based on system status report (2025-10-24) and LlamaIndex MCP alignment plan.`,
    evidenceUrl: "docs/manager/SYSTEM_STATUS_2025-10-24.md",
    payload: {
      tasksAssigned: successCount,
      tasksExisted: existsCount,
      tasksErrored: errorCount,
      totalTasks: TASKS.length,
      agentsWithWork: new Set(TASKS.map(t => t.assignedTo)).size,
      totalAgents: ALL_AGENTS.length,
      priorities: {
        P0: TASKS.filter(t => t.priority === "P0").length,
        P1: TASKS.filter(t => t.priority === "P1").length,
        P2: TASKS.filter(t => t.priority === "P2").length,
        P3: TASKS.filter(t => t.priority === "P3").length
      }
    }
  });

  console.log("\n✅ Direction distribution logged to database");

  await prisma.$disconnect();
}

distributeDirection().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});

