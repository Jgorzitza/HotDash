export type MarketingApprovalCategory =
  | "google_ads"
  | "paid_social"
  | "email"
  | "content"
  | "budget"
  | "timeline"
  | "analytics";

export type MarketingApprovalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "applied";

export type MarketingApprovalType =
  | "ad_copy"
  | "creative"
  | "plan"
  | "budget"
  | "tracking";

export interface MarketingApprovalItem {
  id: string;
  type: MarketingApprovalType;
  category: MarketingApprovalCategory;
  title: string;
  summary: string;
  status: MarketingApprovalStatus;
  priority: "P0" | "P1" | "P2";
  owner: string;
  requestedAt: string;
  dueAt?: string;
  evidence: string[];
  relatedAssets?: string[];
  adCopyApprovalId?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}
