/**
 * Assign Ads Agent Launch Task
 * 
 * Ads agent completed all work and is idle. Assign launch prep task.
 */

import "dotenv/config";
import { assignTask } from "../../app/services/tasks.server";
import { logDecision } from "../../app/services/decisions.server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const adsLaunchTask = {
  assignedBy: 'manager',
  assignedTo: 'ads',
  taskId: 'ADS-LAUNCH-001',
  title: 'Prepare Launch Marketing Campaigns',
  description: `Prepare all marketing campaigns for product launch.

CAMPAIGNS TO PREPARE:

1. Google Ads Campaign
   - Search ads for key product terms
   - Shopping ads for product catalog
   - Display remarketing
   - Budget allocation and bidding strategy

2. Social Media Ads
   - Facebook/Instagram ads
   - LinkedIn ads (B2B focus)
   - Creative assets and copy
   - Audience targeting

3. Email Marketing
   - Launch announcement email
   - Feature highlight series
   - Customer testimonials
   - Drip campaign for new users

4. Content Marketing
   - Blog posts (launch announcement, how-to guides)
   - Case studies
   - Video content (product demos)
   - Social media content calendar

5. Analytics & Tracking
   - UTM parameters for all campaigns
   - Conversion tracking setup
   - Attribution modeling
   - ROI tracking dashboard

DELIVERABLES:
- Campaign plans for all 5 channels
- Creative assets (copy, images, videos)
- Budget allocation ($X across channels)
- Launch timeline and schedule
- Tracking and analytics setup
- CEO approval workflow for campaigns

BUDGET: TBD by CEO
TIMELINE: Ready for launch date

CEO APPROVAL REQUIRED:
- All campaign copy and creative
- Budget allocation
- Launch timeline`,
  acceptanceCriteria: [
    'Google Ads campaign plan complete',
    'Social media ads plan complete',
    'Email marketing campaign ready',
    'Content marketing calendar created',
    'Analytics and tracking setup',
    'All creative assets prepared',
    'Budget allocation proposed',
    'CEO approval workflow implemented',
    'Launch timeline documented'
  ],
  allowedPaths: [
    'docs/marketing/**',
    'app/routes/admin.marketing.**',
    'app/services/marketing/**',
    'assets/marketing/**'
  ],
  priority: 'P1' as const,
  estimatedHours: 8,
  dependencies: [],
  phase: 'Launch Preparation'
};

async function assignAdsTask() {
  console.log("📢 ASSIGNING LAUNCH TASK TO ADS AGENT\n");
  console.log("=".repeat(80));

  try {
    await assignTask(adsLaunchTask);
    console.log(`✅ ${adsLaunchTask.taskId}: ${adsLaunchTask.title}`);
    console.log(`   Assigned to: ${adsLaunchTask.assignedTo}`);
    console.log(`   Priority: ${adsLaunchTask.priority}`);
    console.log(`   Estimated: ${adsLaunchTask.estimatedHours} hours`);
    console.log(`   Status: assigned (ready to start)`);
  } catch (error: any) {
    if (error.message?.includes('Unique constraint')) {
      console.log(`⚠️  ${adsLaunchTask.taskId}: Already exists`);
    } else {
      console.error(`❌ ${adsLaunchTask.taskId}: ${error.message}`);
      throw error;
    }
  }

  // Log decision
  await logDecision({
    scope: 'build',
    actor: 'manager',
    action: 'ads_agent_launch_task_assigned',
    rationale: `Ads agent completed all assigned work (ADS-IMAGE-SEARCH-001) and reported idle. Assigned ADS-LAUNCH-001 (Prepare Launch Marketing Campaigns, 8h, P1) for launch preparation. Ads agent can now work on marketing campaigns in parallel with other agents. Total launch prep: 9 agents, 51 hours.`,
    evidenceUrl: 'scripts/manager/assign-ads-agent-launch-task.ts',
    payload: {
      taskId: 'ADS-LAUNCH-001',
      agent: 'ads',
      priority: 'P1',
      estimatedHours: 8,
      previousTask: 'ADS-IMAGE-SEARCH-001',
      previousStatus: 'completed',
      totalLaunchPrepAgents: 9,
      totalLaunchPrepHours: 51
    }
  });

  console.log("\n✅ Decision logged");
  console.log("\n📊 Launch Prep Summary:");
  console.log("   Total agents: 9");
  console.log("   Total hours: 51");
  console.log("   P0 tasks: 2 (devops, integrations)");
  console.log("   P1 tasks: 6 (data, analytics, inventory, seo, pilot, ads)");
  console.log("   P2 tasks: 1 (support)");
  console.log("\n✅ All idle agents now have launch prep work!\n");

  await prisma.$disconnect();
}

assignAdsTask().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});

