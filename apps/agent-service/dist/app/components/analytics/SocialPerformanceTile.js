/**
 * Social Performance Analytics Tile
 *
 * ANALYTICS-006: Display social media performance metrics
 *
 * Features:
 * - Total reach and engagement metrics
 * - Platform breakdown
 * - Top performing post
 * - Performance trends
 */
import { Card, CardContent, CardHeader, CardTitle } from "@shopify/polaris";
export function SocialPerformanceTile({ data, loading = false, }) {
    if (loading) {
        return (<Card>
        <CardHeader>
          <CardTitle>Social Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>);
    }
    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + "M";
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + "K";
        }
        return num.toString();
    };
    const formatPercentage = (num) => {
        return Math.round(num * 100) / 100 + "%";
    };
    return (<Card>
      <CardHeader>
        <CardTitle>Social Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatNumber(data.totalReach)}
            </div>
            <div className="text-sm text-gray-600">Total Reach</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatNumber(data.totalEngagement)}
            </div>
            <div className="text-sm text-gray-600">Total Engagement</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Average Engagement Rate</span>
            <span className="text-lg font-bold text-purple-600">
              {formatPercentage(data.averageEngagementRate)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-purple-600 h-2 rounded-full transition-all duration-300" style={{ width: `${Math.min(data.averageEngagementRate, 100)}%` }}></div>
          </div>
        </div>

        {data.topPerformingPost && (<div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Top Performing Post
            </div>
            <div className="text-sm text-gray-600 mb-2">
              {data.topPerformingPost.content.substring(0, 100)}
              {data.topPerformingPost.content.length > 100 && "..."}
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{data.topPerformingPost.platform}</span>
              <span>
                {formatNumber(data.topPerformingPost.metrics.engagement)}{" "}
                engagement
              </span>
            </div>
          </div>)}

        <div>
          <div className="text-sm font-medium text-gray-700 mb-3">
            Platform Breakdown
          </div>
          <div className="space-y-2">
            {data.platformBreakdown.map((platform) => (<div key={platform.platform} className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm capitalize">
                    {platform.platform}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {formatNumber(platform.engagement)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatPercentage(platform.avgEngagementRate)} rate
                  </div>
                </div>
              </div>))}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            {data.totalPosts} posts • {data.period.start} to {data.period.end}
          </div>
        </div>
      </CardContent>
    </Card>);
}
/**
 * Social Performance Tile Loader
 *
 * ANALYTICS-006: Load social performance data for the tile
 */
export async function socialPerformanceLoader() {
    // This would typically fetch data from your analytics service
    // For now, return mock data
    const mockData = {
        totalPosts: 12,
        totalReach: 45600,
        totalEngagement: 2340,
        averageEngagementRate: 5.13,
        topPerformingPost: {
            postId: "post-123",
            platform: "instagram",
            content: "Check out our new powder board collection! Perfect for winter adventures. #powderboard #winter #snowboarding",
            publishedAt: "2025-10-21T10:00:00Z",
            metrics: {
                likes: 156,
                shares: 23,
                comments: 12,
                reach: 1200,
                impressions: 1450,
                clicks: 89,
                engagement: 191,
            },
            performance: {
                engagementRate: 15.92,
                clickThroughRate: 6.14,
                reachRate: 82.76,
            },
            trend: {
                engagementChange: 12.5,
                reachChange: 8.3,
                clicksChange: 15.2,
            },
        },
        platformBreakdown: [
            {
                platform: "instagram",
                posts: 5,
                reach: 23400,
                engagement: 1200,
                avgEngagementRate: 5.13,
            },
            {
                platform: "facebook",
                posts: 4,
                reach: 15600,
                engagement: 780,
                avgEngagementRate: 5.0,
            },
            {
                platform: "twitter",
                posts: 3,
                reach: 6600,
                engagement: 360,
                avgEngagementRate: 5.45,
            },
        ],
        period: {
            start: "2025-10-15",
            end: "2025-10-22",
        },
    };
    return { data: mockData };
}
//# sourceMappingURL=SocialPerformanceTile.js.map