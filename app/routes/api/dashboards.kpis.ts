/**
 * KPI Dashboards API
 * Provides real-time metrics for monitoring dashboards
 * Growth Spec: I1-I8
 */

import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { createClient } from "~/config/supabase.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const dashboard = url.searchParams.get("dashboard") || "all";
  
  const supabase = createClient(request);
  
  const dashboards: Record<string, any> = {};
  
  // Dashboard 1: Action Throughput
  if (dashboard === "all" || dashboard === "throughput") {
    const { data: throughput } = await supabase
      .from("v_action_throughput_hourly")
      .select("*")
      .limit(24);
      
    const { data: backlog } = await supabase
      .from("v_action_backlog_current")
      .select("*")
      .single();
      
    dashboards.throughput = {
      hourly: throughput || [],
      backlog: backlog || {},
    };
  }
  
  // Dashboard 2: Recommender Performance
  if (dashboard === "all" || dashboard === "recommender") {
    const { data: performance } = await supabase
      .from("v_recommender_performance")
      .select("*")
      .limit(20);
      
    const { data: daily } = await supabase
      .from("v_daily_approval_metrics")
      .select("*")
      .limit(30);
      
    dashboards.recommender = {
      performance: performance || [],
      daily_metrics: daily || [],
    };
  }
  
  // Dashboard 3: SEO Impact (placeholder)
  if (dashboard === "all" || dashboard === "seo") {
    dashboards.seo = {
      status: "Requires GA/GSC integration",
      implementation: "Growth Spec A1-A7",
    };
  }
  
  // Dashboard 4: System Health
  if (dashboard === "all" || dashboard === "health") {
    const { data: health } = await supabase
      .from("v_system_health_current")
      .select("*")
      .single();
      
    const { data: apiMetrics } = await supabase
      .from("v_api_health_metrics")
      .select("*")
      .limit(24);
      
    const { data: agentPerf } = await supabase
      .from("v_agent_performance_summary")
      .select("*")
      .limit(20);
      
    dashboards.health = {
      current: health || {},
      api_metrics: apiMetrics || [],
      agent_performance: agentPerf || [],
    };
  }
  
  return json({
    timestamp: new Date().toISOString(),
    dashboards,
    available: ["throughput", "recommender", "seo", "health"],
  });
}
