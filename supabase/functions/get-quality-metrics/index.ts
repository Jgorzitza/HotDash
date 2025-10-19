/**
 * Supabase Edge Function: get-quality-metrics
 * 
 * RPC function to efficiently query customer reply quality metrics.
 * Returns aggregated data from customer_reply_quality_metrics view.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface QualityMetricsRequest {
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  limit?: number;
}

interface QualityMetricsResponse {
  metrics: Array<{
    date: string;
    total_replies: number;
    approved_count: number;
    avg_tone: number;
    avg_accuracy: number;
    avg_policy: number;
    avg_edit_distance: number;
    approval_rate_pct: number;
  }>;
  summary: {
    totalReplies: number;
    avgQualityScore: number;
    overallApprovalRate: number;
  };
}

serve(async (req) => {
  try {
    // CORS headers
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        },
      });
    }

    const { startDate, endDate, limit = 30 }: QualityMetricsRequest = await req.json();

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );

    // Build query
    let query = supabaseClient
      .from("customer_reply_quality_metrics")
      .select("*")
      .order("date", { ascending: false })
      .limit(limit);

    // Add date filters if provided
    if (startDate) {
      query = query.gte("date", startDate);
    }
    if (endDate) {
      query = query.lte("date", endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Calculate summary metrics
    const totalReplies = data.reduce((sum, row) => sum + row.total_replies, 0);
    const avgTone = data.reduce((sum, row) => sum + row.avg_tone, 0) / data.length;
    const avgAccuracy = data.reduce((sum, row) => sum + row.avg_accuracy, 0) / data.length;
    const avgPolicy = data.reduce((sum, row) => sum + row.avg_policy, 0) / data.length;
    const approvedCount = data.reduce((sum, row) => sum + row.approved_count, 0);

    const avgQualityScore = (avgTone + avgAccuracy + avgPolicy) / 3;
    const overallApprovalRate = totalReplies > 0 ? (approvedCount / totalReplies) * 100 : 0;

    const response: QualityMetricsResponse = {
      metrics: data,
      summary: {
        totalReplies,
        avgQualityScore: Number(avgQualityScore.toFixed(2)),
        overallApprovalRate: Number(overallApprovalRate.toFixed(2)),
      },
    };

    return new Response(JSON.stringify(response), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
});

