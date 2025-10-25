/**
 * Real-Time Analytics Dashboard Route
 * 
 * Task: DATA-022
 * 
 * Route: /analytics/realtime
 * 
 * Displays comprehensive real-time analytics dashboard with live metrics,
 * KPI tracking, performance monitoring, and alert system.
 */

import { RealtimeAnalyticsDashboard } from "~/components/analytics/RealtimeAnalyticsDashboard";

export default function RealtimeAnalyticsRoute() {
  return <RealtimeAnalyticsDashboard />;
}

