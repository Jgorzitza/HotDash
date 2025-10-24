/**
 * Production Launch Metrics Dashboard
 *
 * Displays comprehensive metrics for production launch success including:
 * - Adoption metrics (DAU/MAU, signups, activation, TTFV)
 * - Satisfaction metrics (NPS, CSAT, sentiment)
 * - Feature usage analytics
 * - Business impact measurements
 *
 * @see docs/metrics/dashboard-specification.md
 */
import { useLoaderData } from "react-router";
import { Page, Card, Text, BlockStack, InlineGrid, Badge, Icon, } from "@shopify/polaris";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from "@shopify/polaris-icons";
import { getLaunchMetrics } from "~/services/metrics/launch-metrics";
export async function loader({ request }) {
    const metrics = await getLaunchMetrics();
    return Response.json({
        metrics,
        lastUpdated: new Date().toISOString()
    });
}
export default function LaunchMetrics() {
    const { metrics, lastUpdated } = useLoaderData();
    return (<Page title="Production Launch Metrics" subtitle={`Last updated: ${new Date(lastUpdated).toLocaleString()}`}>
      <BlockStack gap="500">
        {/* KPI Cards */}
        <InlineGrid columns={{ xs: 1, sm: 2, md: 4 }} gap="400">
          <MetricCard title="DAU/MAU Ratio" value={`${metrics.adoption.dauMau.ratio}%`} target="40%" trend={metrics.adoption.dauMau.trend} status={metrics.adoption.dauMau.ratio >= 40 ? 'success' : 'warning'}/>
          
          <MetricCard title="New Signups (This Week)" value={metrics.adoption.signups.signups.toString()} target={metrics.adoption.signups.target.toString()} trend={metrics.adoption.signups.trend} status={metrics.adoption.signups.percentOfTarget >= 100
            ? 'success'
            : 'warning'}/>
          
          <MetricCard title="Net Promoter Score" value={Math.round(metrics.satisfaction.nps.npsScore).toString()} target="50" trend={metrics.satisfaction.nps.trend} status={metrics.satisfaction.nps.npsScore >= 50 ? 'success' : 'warning'}/>
          
          <MetricCard title="Activation Rate" value={`${metrics.adoption.activation.activationRate}%`} target="60%" trend={metrics.adoption.activation.activationRate >= 60 ? 'up' : 'down'} status={metrics.adoption.activation.activationRate >= 60
            ? 'success'
            : 'warning'}/>
        </InlineGrid>
        
        {/* Adoption Metrics Section */}
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">
              Adoption Metrics
            </Text>
            
            <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    Time to First Value
                  </Text>
                  <Text as="p" variant="bodyLg">
                    Median: {metrics.adoption.ttfv.median} minutes
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Target: ≤ 30 minutes
                  </Text>
                  <BlockStack gap="100">
                    <Text as="p" variant="bodySm">
                      Under 15 min: {metrics.adoption.ttfv.distribution.under15min}%
                    </Text>
                    <Text as="p" variant="bodySm">
                      Under 30 min: {metrics.adoption.ttfv.distribution.under30min}%
                    </Text>
                    <Text as="p" variant="bodySm">
                      Under 60 min: {metrics.adoption.ttfv.distribution.under60min}%
                    </Text>
                  </BlockStack>
                </BlockStack>
              </Card>
              
              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    Activation Milestones
                  </Text>
                  <BlockStack gap="100">
                    <MilestoneRow label="Profile Setup" percentage={metrics.adoption.activation.milestoneCompletion.profileSetup}/>
                    <MilestoneRow label="First Integration" percentage={metrics.adoption.activation.milestoneCompletion.firstIntegration}/>
                    <MilestoneRow label="View Dashboard" percentage={metrics.adoption.activation.milestoneCompletion.viewDashboard}/>
                    <MilestoneRow label="First Approval" percentage={metrics.adoption.activation.milestoneCompletion.firstApproval}/>
                    <MilestoneRow label="First Workflow" percentage={metrics.adoption.activation.milestoneCompletion.firstWorkflow}/>
                  </BlockStack>
                </BlockStack>
              </Card>
            </InlineGrid>
            
            <Card>
              <BlockStack gap="200">
                <Text as="h3" variant="headingSm">
                  Feature Adoption
                </Text>
                <BlockStack gap="100">
                  {metrics.adoption.featureAdoption.map((feature) => (<FeatureAdoptionRow key={feature.feature} feature={feature.feature} adoptionRate={feature.adoptionRate} trend={feature.trend}/>))}
                </BlockStack>
              </BlockStack>
            </Card>
          </BlockStack>
        </Card>
        
        {/* Satisfaction Metrics Section */}
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">
              Satisfaction Metrics
            </Text>
            
            <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    NPS Breakdown
                  </Text>
                  <Text as="p" variant="bodyLg">
                    Score: {Math.round(metrics.satisfaction.nps.npsScore)}
                  </Text>
                  <BlockStack gap="100">
                    <Text as="p" variant="bodySm">
                      Promoters (9-10): {metrics.satisfaction.nps.promoters}
                    </Text>
                    <Text as="p" variant="bodySm">
                      Passives (7-8): {metrics.satisfaction.nps.passives}
                    </Text>
                    <Text as="p" variant="bodySm">
                      Detractors (0-6): {metrics.satisfaction.nps.detractors}
                    </Text>
                  </BlockStack>
                </BlockStack>
              </Card>
              
              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    CSAT by Type
                  </Text>
                  <BlockStack gap="100">
                    {metrics.satisfaction.csat.map((csat) => (<div key={csat.interactionType}>
                        <Text as="p" variant="bodySm">
                          {csat.interactionType}: {csat.averageRating.toFixed(1)}/5.0
                        </Text>
                      </div>))}
                  </BlockStack>
                </BlockStack>
              </Card>
              
              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    Sentiment Analysis
                  </Text>
                  <BlockStack gap="100">
                    <Text as="p" variant="bodySm">
                      Positive: {metrics.satisfaction.sentiment.positive}%
                    </Text>
                    <Text as="p" variant="bodySm">
                      Neutral: {metrics.satisfaction.sentiment.neutral}%
                    </Text>
                    <Text as="p" variant="bodySm">
                      Negative: {metrics.satisfaction.sentiment.negative}%
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Average: {(metrics.satisfaction.sentiment.averageSentiment * 100).toFixed(0)}%
                    </Text>
                  </BlockStack>
                </BlockStack>
              </Card>
            </InlineGrid>
          </BlockStack>
        </Card>
        
        {/* Placeholder for Usage and Business Impact sections */}
        <Card>
          <BlockStack gap="200">
            <Text as="h2" variant="headingMd">
              Feature Usage Analytics
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              Coming soon: Engagement heatmap, retention curves, power user metrics
            </Text>
          </BlockStack>
        </Card>
        
        <Card>
          <BlockStack gap="200">
            <Text as="h2" variant="headingMd">
              Business Impact
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              Coming soon: Revenue impact, cost savings, time savings, ROI calculations
            </Text>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>);
}
function MetricCard({ title, value, target, trend, status }) {
    const trendIcon = trend === 'up' || trend === 'improving'
        ? ArrowUpIcon
        : trend === 'down' || trend === 'declining'
            ? ArrowDownIcon
            : MinusIcon;
    const badgeTone = status === 'success' ? 'success' : status === 'warning' ? 'warning' : 'critical';
    return (<Card>
      <BlockStack gap="200">
        <Text as="h3" variant="headingSm" tone="subdued">
          {title}
        </Text>
        <Text as="p" variant="heading2xl">
          {value}
        </Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon source={trendIcon}/>
          <Text as="p" variant="bodySm" tone="subdued">
            Target: {target}
          </Text>
        </div>
        <Badge tone={badgeTone}>{status.toUpperCase()}</Badge>
      </BlockStack>
    </Card>);
}
function MilestoneRow({ label, percentage }) {
    return (<div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Text as="span" variant="bodySm">
        {label}
      </Text>
      <Text as="span" variant="bodySm" fontWeight="semibold">
        {percentage}%
      </Text>
    </div>);
}
function FeatureAdoptionRow({ feature, adoptionRate, trend }) {
    const trendIcon = trend === 'accelerating'
        ? ArrowUpIcon
        : trend === 'slowing'
            ? ArrowDownIcon
            : MinusIcon;
    return (<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text as="span" variant="bodySm">
        {feature}
      </Text>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Text as="span" variant="bodySm" fontWeight="semibold">
          {Math.round(adoptionRate)}%
        </Text>
        <Icon source={trendIcon}/>
      </div>
    </div>);
}
//# sourceMappingURL=launch.metrics.js.map