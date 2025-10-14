/**
 * Google Search Console Test Data Generator
 * Generates realistic GSC data for growth feature testing
 */

export interface GSCRow {
  keys: string[]; // [url, query, searchType]
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GSCAnalyticsData {
  rows: GSCRow[];
  responseAggregationType: string;
}

export interface GSCPagePerformance {
  url: string;
  title: string;
  clicks: number;
  impressions: number;
  ctr: number;
  avgPosition: number;
  topQueries: string[];
}

const AUTOMOTIVE_QUERIES = [
  "ls swap fuel system",
  "an6 fuel line",
  "fuel pressure regulator",
  "ptfe fuel hose",
  "walbro fuel pump",
  "aeromotive fuel pump",
  "squarebody fuel tank",
  "ls engine fuel lines",
  "hot rod fuel fittings",
  "efi fuel system",
];

const PRODUCT_PAGES = [
  {
    path: "/collections/fuel-pumps-in-tank-and-inline",
    title: "Fuel Pumps - In Tank and Inline | Hot Rod AN",
  },
  {
    path: "/products/ptfe-lined-black-nylon-with-orange-checks-braided-hose-an6-an8-an10",
    title: "PTFE Black Nylon with Orange Checks Braided Hose",
  },
  {
    path: "/collections/ls-engine-an-fuel-line-install-kit",
    title: "LS Engine AN Fuel Line Install Kits",
  },
  {
    path: "/products/aeromotive-inline-fuel-filters-with-an-male-fittings",
    title: "Aeromotive Inline Fuel Filters",
  },
  {
    path: "/collections/fuel-pressure-regulators",
    title: "Fuel Pressure Regulators | Hot Rod AN",
  },
];

/**
 * Generate GSC search analytics data
 */
export function generateGSCAnalytics(rowCount: number = 10): GSCAnalyticsData {
  const rows: GSCRow[] = [];

  for (let i = 0; i < rowCount; i++) {
    const page = PRODUCT_PAGES[i % PRODUCT_PAGES.length];
    const query = AUTOMOTIVE_QUERIES[i % AUTOMOTIVE_QUERIES.length];
    
    const impressions = Math.floor(Math.random() * 2000) + 300;
    const clicks = Math.floor(impressions * (Math.random() * 0.08 + 0.02)); // 2-10% CTR
    const ctr = clicks / impressions;
    const position = Math.random() * 8 + 1; // Position 1-9

    rows.push({
      keys: [`https://hotrodan.com${page.path}`, query, "WEB"],
      clicks,
      impressions,
      ctr,
      position: Number(position.toFixed(1)),
    });
  }

  return {
    rows,
    responseAggregationType: "byPage",
  };
}

/**
 * Generate GSC page performance data
 */
export function generateGSCPagePerformance(pageCount: number = 5): GSCPagePerformance[] {
  return PRODUCT_PAGES.slice(0, pageCount).map((page, i) => {
    const impressions = Math.floor(Math.random() * 3000) + 1000;
    const clicks = Math.floor(impressions * (Math.random() * 0.08 + 0.03)); // 3-11% CTR
    const ctr = clicks / impressions;
    const avgPosition = Math.random() * 4 + 2; // Position 2-6

    return {
      url: `https://hotrodan.com${page.path}`,
      title: page.title,
      clicks,
      impressions,
      ctr,
      avgPosition: Number(avgPosition.toFixed(1)),
      topQueries: AUTOMOTIVE_QUERIES.slice(i * 2, i * 2 + 3),
    };
  });
}

/**
 * Generate underperforming pages (low CTR opportunities)
 */
export function generateUnderperformingPages(count: number = 3): GSCPagePerformance[] {
  return PRODUCT_PAGES.slice(0, count).map((page) => {
    const impressions = Math.floor(Math.random() * 2000) + 500;
    const clicks = Math.floor(impressions * (Math.random() * 0.02 + 0.005)); // 0.5-2.5% CTR (LOW)
    const ctr = clicks / impressions;
    const avgPosition = Math.random() * 5 + 6; // Position 6-11 (poor)

    return {
      url: `https://hotrodan.com${page.path}`,
      title: page.title,
      clicks,
      impressions,
      ctr,
      avgPosition: Number(avgPosition.toFixed(1)),
      topQueries: AUTOMOTIVE_QUERIES.slice(0, 3),
    };
  });
}

/**
 * Generate CTR anomaly detection test data
 */
export function generateCTRAnomalies() {
  return {
    normal: generateGSCPagePerformance(3), // Baseline
    spike: generateGSCPagePerformance(2).map((page) => ({
      ...page,
      ctr: page.ctr * 2.5, // 150% increase
      clicks: page.clicks * 2.5,
    })),
    drop: generateGSCPagePerformance(2).map((page) => ({
      ...page,
      ctr: page.ctr * 0.4, // 60% decrease
      clicks: Math.floor(page.clicks * 0.4),
    })),
  };
}

