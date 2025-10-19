/**
 * Funnel Analysis Pipeline
 *
 * Analyzes conversion funnels to identify drop-off points.
 */

export interface FunnelStep {
  name: string;
  users: number;
  dropoffRate: number;
  conversionRate: number;
}

export interface FunnelAnalysis {
  funnelName: string;
  steps: FunnelStep[];
  overallConversionRate: number;
  biggestDropoff: string;
  recommendations: string[];
}

/**
 * Analyze funnel performance
 */
export function analyzeFunnel(
  funnelName: string,
  stepsData: Array<{ name: string; users: number }>,
): FunnelAnalysis {
  const totalUsers = stepsData[0].users;
  const steps: FunnelStep[] = [];
  let biggestDropoff = "";
  let maxDropoffRate = 0;

  stepsData.forEach((step, idx) => {
    const dropoffRate =
      idx > 0
        ? ((stepsData[idx - 1].users - step.users) / stepsData[idx - 1].users) *
          100
        : 0;

    const conversionRate = (step.users / totalUsers) * 100;

    steps.push({
      name: step.name,
      users: step.users,
      dropoffRate,
      conversionRate,
    });

    if (dropoffRate > maxDropoffRate) {
      maxDropoffRate = dropoffRate;
      biggestDropoff = step.name;
    }
  });

  const finalUsers = stepsData[stepsData.length - 1].users;
  const overallConversionRate = (finalUsers / totalUsers) * 100;

  const recommendations: string[] = [];
  if (maxDropoffRate > 50) {
    recommendations.push(
      `High drop-off at ${biggestDropoff} (${maxDropoffRate.toFixed(1)}%) - investigate UX issues`,
    );
  }

  return {
    funnelName,
    steps,
    overallConversionRate,
    biggestDropoff,
    recommendations,
  };
}

/**
 * Mock checkout funnel
 */
export function getCheckoutFunnel(): FunnelAnalysis {
  return analyzeFunnel("Checkout", [
    { name: "Product Page", users: 5000 },
    { name: "Add to Cart", users: 750 },
    { name: "Checkout Started", users: 400 },
    { name: "Shipping Info", users: 320 },
    { name: "Payment", users: 280 },
    { name: "Order Complete", users: 250 },
  ]);
}
