import {
  approveAdCopy,
  createApprovalRequest,
  getApproval,
  markAsApplied,
  rejectAdCopy,
} from "../ads/copy-approval";
import type {
  AdCopy,
  AdCopyApproval,
  AdCopyApprovalRequest,
} from "../ads/types";
import type {
  MarketingApprovalItem,
  MarketingApprovalStatus,
} from "./types";

type ApprovalStore = Map<string, MarketingApprovalItem>;

const launchApprovals: ApprovalStore = new Map();
let seeded = false;

function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function buildAdCopyApproval(request: AdCopyApprovalRequest): AdCopyApproval {
  return createApprovalRequest(request);
}

function ensureLaunchApprovalsSeeded() {
  if (seeded) return;

  const requestedAt = new Date().toISOString();

  const legacyCopy: AdCopy = {
    headlines: ["Your operations toolkit", "Shopify dashboard"],
    descriptions: [
      "Manage inventory, CX, and growth manually from spreadsheets.",
    ],
    finalUrl: "https://hotrodan.com/legacy-dashboard",
  };

  const googleSearchRequest: AdCopyApprovalRequest = {
    campaignId: "google-search-inventory",
    campaignName: "Google Search – Inventory Automation",
    adGroupId: "inv-core-rsa",
    adGroupName: "Inventory Automation RSA",
    currentCopy: legacyCopy,
    proposedCopy: {
      headlines: [
        "Automate Shopify Ops",
        "Inventory Alerts in Minutes",
        "Stop Spreadsheet Chaos",
        "AI Control Center",
      ],
      descriptions: [
        "Unify inventory, CX, and growth with human-reviewed AI. Launch fast.",
        "HotDash forecasts stockouts and drafts actions with CEO oversight.",
      ],
      finalUrl: "https://hotrodan.com/hotdash/trial",
      displayPath1: "inventory",
      displayPath2: "automation",
    },
    reason:
      "Replace placeholder copy with launch-ready RSA aligned to campaign plan.",
    requestedBy: "ads",
    requestedAt,
  };

  const socialCopyRequest: AdCopyApprovalRequest = {
    campaignId: "paid-social-awareness",
    campaignName: "Paid Social – Awareness",
    adGroupId: "meta-carousel",
    adGroupName: "Meta Carousel Launch",
    currentCopy: legacyCopy,
    proposedCopy: {
      headlines: ["Automate Shopify Operations", "AI Control Center for Ops"],
      descriptions: [
        "One control center for inventory, CX, and growth. Human-reviewed AI keeps you in charge.",
        "Stop firefighting. HotDash predicts stockouts and drafts CX replies with approval trails.",
      ],
      finalUrl: "https://hotrodan.com/hotdash",
      displayPath1: "launch",
      displayPath2: "control-center",
    },
    reason:
      "Launch-ready paid social copy referencing human-in-the-loop positioning.",
    requestedBy: "ads",
    requestedAt,
  };

  const googleApproval = buildAdCopyApproval(googleSearchRequest);
  const socialApproval = buildAdCopyApproval(socialCopyRequest);

  launchApprovals.set("google-ads-copy", {
    id: "google-ads-copy",
    type: "ad_copy",
    category: "google_ads",
    title: "Google Ads RSA Copy",
    summary:
      "Approve responsive search ad headlines and descriptions for inventory automation launch campaign.",
    status: googleApproval.status,
    priority: "P0",
    owner: "ads",
    requestedAt,
    dueAt: daysFromNow(3),
    evidence: [
      "docs/marketing/google-ads/CAMPAIGN_PLAN.md",
      "assets/marketing/ADS-LAUNCH-001/google-ads/search_ad_copy.md",
    ],
    relatedAssets: [
      "assets/marketing/ADS-LAUNCH-001/google-ads/creative_brief.md",
    ],
    adCopyApprovalId: googleApproval.id,
  });

  launchApprovals.set("paid-social-copy", {
    id: "paid-social-copy",
    type: "ad_copy",
    category: "paid_social",
    title: "Paid Social Primary Text & Headlines",
    summary:
      "Approve Meta and LinkedIn copy set for awareness and consideration campaigns.",
    status: socialApproval.status,
    priority: "P0",
    owner: "ads",
    requestedAt,
    dueAt: daysFromNow(4),
    evidence: [
      "docs/marketing/social-media/CAMPAIGN_PLAN.md",
      "assets/marketing/ADS-LAUNCH-001/social/paid_social_copy.md",
    ],
    relatedAssets: [
      "assets/marketing/ADS-LAUNCH-001/video/social_teaser_notes.md",
    ],
    adCopyApprovalId: socialApproval.id,
  });

  launchApprovals.set("email-series", {
    id: "email-series",
    type: "creative",
    category: "email",
    title: "Launch Email & Drip Series",
    summary:
      "Review subject lines, body copy, and CTA structure for five-email launch sequence and lifecycle triggers.",
    status: "pending",
    priority: "P1",
    owner: "ads",
    requestedAt,
    dueAt: daysFromNow(5),
    evidence: [
      "docs/marketing/email/CAMPAIGN_PLAN.md",
      "assets/marketing/ADS-LAUNCH-001/email/launch_series_templates.md",
    ],
  });

  launchApprovals.set("content-calendar", {
    id: "content-calendar",
    type: "plan",
    category: "content",
    title: "Content Calendar & Playbook",
    summary:
      "Approve six-week content cadence, downloadable playbook outline, and video production plan.",
    status: "pending",
    priority: "P1",
    owner: "ads",
    requestedAt,
    dueAt: daysFromNow(6),
    evidence: [
      "docs/marketing/content/CONTENT_CALENDAR.md",
      "assets/marketing/ADS-LAUNCH-001/content/blog_outlines.md",
      "assets/marketing/ADS-LAUNCH-001/video/launch_demo_script.md",
    ],
  });

  launchApprovals.set("launch-budget", {
    id: "launch-budget",
    type: "budget",
    category: "budget",
    title: "Launch Budget Allocation",
    summary:
      "Approve $50K aggressive launch plan with channel caps, pacing rules, and contingency scenarios.",
    status: "pending",
    priority: "P0",
    owner: "ads",
    requestedAt,
    dueAt: daysFromNow(2),
    evidence: ["docs/marketing/LAUNCH_BUDGET_RECOMMENDATION.md"],
  });

  launchApprovals.set("launch-timeline", {
    id: "launch-timeline",
    type: "plan",
    category: "timeline",
    title: "Launch Timeline & Task Matrix",
    summary:
      "Confirm cross-functional schedule, checkpoints, and war-room cadence for launch and stabilization.",
    status: "pending",
    priority: "P1",
    owner: "ads",
    requestedAt,
    dueAt: daysFromNow(3),
    evidence: ["docs/marketing/LAUNCH_TIMELINE.md"],
  });

  launchApprovals.set("tracking-analytics", {
    id: "tracking-analytics",
    type: "tracking",
    category: "analytics",
    title: "Analytics & Attribution Setup",
    summary:
      "Validate tracking architecture, conversion events, dashboards, and alert thresholds.",
    status: "pending",
    priority: "P0",
    owner: "ads",
    requestedAt,
    dueAt: daysFromNow(4),
    evidence: ["docs/marketing/analytics/TRACKING_PLAN.md"],
  });

  seeded = true;
}

export function getMarketingApprovals(): MarketingApprovalItem[] {
  ensureLaunchApprovalsSeeded();

  const approvals: MarketingApprovalItem[] = [];

  for (const item of launchApprovals.values()) {
    if (item.adCopyApprovalId) {
      const approval = getApproval(item.adCopyApprovalId);
      if (approval) {
        approvals.push({
          ...item,
          status: approval.status,
          reviewedBy: approval.reviewedBy,
          reviewedAt: approval.reviewedAt,
          reviewNotes: approval.reviewNotes,
        });
        continue;
      }
    }
    approvals.push(item);
  }

  return approvals.sort((a, b) => {
    if (a.priority === b.priority) {
      return a.requestedAt.localeCompare(b.requestedAt);
    }
    return a.priority < b.priority ? -1 : 1;
  });
}

export function updateMarketingApprovalStatus(
  id: string,
  status: MarketingApprovalStatus,
  reviewer: string,
  reviewNotes?: string,
): MarketingApprovalItem {
  ensureLaunchApprovalsSeeded();

  const item = launchApprovals.get(id);
  if (!item) {
    throw new Error(`Marketing approval not found: ${id}`);
  }

  let updatedItem: MarketingApprovalItem = item;

  if (item.adCopyApprovalId) {
    let approval: AdCopyApproval | undefined;
    if (status === "approved") {
      approval = approveAdCopy(item.adCopyApprovalId, reviewer, reviewNotes);
    } else if (status === "rejected") {
      approval = rejectAdCopy(item.adCopyApprovalId, reviewer, reviewNotes ?? "");
    } else if (status === "applied") {
      approval = markAsApplied(item.adCopyApprovalId);
    } else {
      approval = getApproval(item.adCopyApprovalId);
    }

    if (approval) {
      updatedItem = {
        ...item,
        status: approval.status,
        reviewedBy: approval.reviewedBy,
        reviewedAt: approval.reviewedAt,
        reviewNotes: approval.reviewNotes,
      };
    }
  } else {
    updatedItem = {
      ...item,
      status,
      reviewedBy: reviewer,
      reviewedAt: new Date().toISOString(),
      reviewNotes,
    };
  }

  launchApprovals.set(id, updatedItem);
  return updatedItem;
}
