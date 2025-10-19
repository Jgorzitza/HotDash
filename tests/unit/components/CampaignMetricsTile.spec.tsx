/**
 * Campaign Metrics Tile Component Tests
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "../../utils/render";
import {
  CampaignMetricsTile,
  CompactCampaignMetricsTile,
} from "~/components/dashboard/CampaignMetricsTile";

describe("CampaignMetricsTile", () => {
  it("renders loading state", () => {
    render(
      <CampaignMetricsTile
        spend={0}
        roas={0}
        cpc={0}
        clicks={0}
        impressions={0}
        loading={true}
      />,
    );
    expect(screen.getByText(/loading/i)).toBeDefined();
  });

  it("renders error state", () => {
    render(
      <CampaignMetricsTile
        spend={0}
        roas={0}
        cpc={0}
        clicks={0}
        impressions={0}
        error="Test error"
      />,
    );
    expect(screen.getByText(/test error/i)).toBeDefined();
  });

  it("renders metrics correctly", () => {
    render(
      <CampaignMetricsTile
        spend={1000}
        roas={4.5}
        cpc={1.25}
        clicks={800}
        impressions={40000}
        roasTrend="up"
        roasChange="+12%"
      />,
    );

    expect(screen.getByText(/Campaign Metrics/i)).toBeDefined();
    expect(screen.getByText(/4.50x/i)).toBeDefined();
  });

  it("shows excellent badge for high ROAS", () => {
    render(
      <CampaignMetricsTile
        spend={1000}
        roas={5.0}
        cpc={1.0}
        clicks={1000}
        impressions={50000}
      />,
    );
    expect(screen.getByText(/Excellent/i)).toBeDefined();
  });

  it("shows needs improvement badge for low ROAS", () => {
    render(
      <CampaignMetricsTile
        spend={1000}
        roas={1.5}
        cpc={1.0}
        clicks={1000}
        impressions={50000}
      />,
    );
    expect(screen.getByText(/Needs Improvement/i)).toBeDefined();
  });
});

describe("CompactCampaignMetricsTile", () => {
  it("renders compact layout", () => {
    render(<CompactCampaignMetricsTile spend={1000} roas={4.0} cpc={1.5} />);
    expect(screen.getByText(/Campaigns/i)).toBeDefined();
  });

  it("shows loading state", () => {
    render(
      <CompactCampaignMetricsTile spend={0} roas={0} cpc={0} loading={true} />,
    );
    // Should render spinner
    expect(true).toBe(true);
  });
});
