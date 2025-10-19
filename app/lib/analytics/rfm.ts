/**
 * RFM Segmentation (Recency, Frequency, Monetary)
 *
 * Segments customers based on purchase behavior.
 */

export interface RFMScore {
  recency: number; // 1-5 (5 = most recent)
  frequency: number; // 1-5 (5 = most frequent)
  monetary: number; // 1-5 (5 = highest value)
  segment: string;
}

export interface RFMSegment {
  segment: string;
  count: number;
  avgRecency: number;
  avgFrequency: number;
  avgMonetary: number;
  description: string;
  action: string;
}

/**
 * Calculate RFM score for a customer
 */
export function calculateRFM(
  daysSinceLastPurchase: number,
  totalPurchases: number,
  totalSpent: number,
): RFMScore {
  // Recency scoring (lower days = higher score)
  let recency = 1;
  if (daysSinceLastPurchase <= 30) recency = 5;
  else if (daysSinceLastPurchase <= 90) recency = 4;
  else if (daysSinceLastPurchase <= 180) recency = 3;
  else if (daysSinceLastPurchase <= 365) recency = 2;

  // Frequency scoring
  let frequency = 1;
  if (totalPurchases >= 10) frequency = 5;
  else if (totalPurchases >= 5) frequency = 4;
  else if (totalPurchases >= 3) frequency = 3;
  else if (totalPurchases >= 2) frequency = 2;

  // Monetary scoring
  let monetary = 1;
  if (totalSpent >= 1000) monetary = 5;
  else if (totalSpent >= 500) monetary = 4;
  else if (totalSpent >= 250) monetary = 3;
  else if (totalSpent >= 100) monetary = 2;

  // Determine segment
  let segment = "Lost";
  if (recency >= 4 && frequency >= 4 && monetary >= 4) {
    segment = "Champions";
  } else if (recency >= 4 && frequency >= 3) {
    segment = "Loyal Customers";
  } else if (recency >= 4) {
    segment = "Potential Loyalists";
  } else if (frequency >= 4) {
    segment = "At Risk";
  } else if (recency <= 2 && frequency >= 3) {
    segment = "Can't Lose";
  } else if (recency <= 2) {
    segment = "Hibernating";
  }

  return {
    recency,
    frequency,
    monetary,
    segment,
  };
}

/**
 * Get RFM segment summary
 */
export function getRFMSegments(): RFMSegment[] {
  return [
    {
      segment: "Champions",
      count: 45,
      avgRecency: 5,
      avgFrequency: 5,
      avgMonetary: 5,
      description: "Best customers - bought recently, often, and high value",
      action: "Reward and retain",
    },
    {
      segment: "Loyal Customers",
      count: 78,
      avgRecency: 4.5,
      avgFrequency: 4,
      avgMonetary: 3.5,
      description: "Regular buyers with good value",
      action: "Upsell and cross-sell",
    },
    {
      segment: "At Risk",
      count: 32,
      avgRecency: 2,
      avgFrequency: 4,
      avgMonetary: 4,
      description: "Were frequent buyers but haven't purchased recently",
      action: "Win-back campaign",
    },
    {
      segment: "Hibernating",
      count: 56,
      avgRecency: 1.5,
      avgFrequency: 2,
      avgMonetary: 2,
      description: "Low activity, low value",
      action: "Re-engagement or churn",
    },
  ];
}
