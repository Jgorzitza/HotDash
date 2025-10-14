/**
 * Auto-Remediation Executor
 * Executes safe remediation actions and logs to audit trail
 */

import { createClient } from "~/config/supabase.server";
import { remediationRules, type RemediationResult } from "./rules.server";

export async function executeRemediation(
  ruleId: string,
  metrics: any,
  request: Request
): Promise<RemediationResult> {
  const rule = remediationRules.find((r) => r.id === ruleId);
  
  if (!rule) {
    throw new Error(`Remediation rule not found: ${ruleId}`);
  }
  
  // Safety check: Only execute safe actions
  if (!rule.safe) {
    throw new Error(`Remediation rule ${ruleId} is not marked as safe - manual approval required`);
  }
  
  // Check if condition is still met
  if (!rule.checkFunction(metrics)) {
    return {
      success: false,
      action: rule.action,
      details: `Condition no longer met: ${rule.condition}`,
      timestamp: new Date().toISOString(),
    };
  }
  
  // Execute remediation action
  const result = await rule.actionFunction(rule.params);
  
  // Log to audit trail
  const supabase = createClient(request);
  await supabase.from("observability_logs").insert({
    level: "INFO",
    message: `Auto-remediation executed: ${rule.name}`,
    metadata: {
      rule_id: ruleId,
      condition: rule.condition,
      action: rule.action,
      result: result,
      metrics: metrics,
    },
  });
  
  return result;
}

export async function checkAndRemediate(
  metrics: any,
  request: Request
): Promise<RemediationResult[]> {
  const results: RemediationResult[] = [];
  
  for (const rule of remediationRules) {
    if (rule.checkFunction(metrics)) {
      console.log(`[Auto-Remediation] Condition met: ${rule.condition}`);
      
      try {
        const result = await executeRemediation(rule.id, metrics, request);
        results.push(result);
        
        // Log success
        console.log(`[Auto-Remediation] ✅ ${rule.name}: ${result.details}`);
      } catch (error) {
        console.error(`[Auto-Remediation] ❌ ${rule.name} failed:`, error);
        results.push({
          success: false,
          action: rule.action,
          details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }
  
  return results;
}

export async function getRemediationHistory(
  request: Request,
  limit: number = 100
) {
  const supabase = createClient(request);
  
  const { data, error } = await supabase
    .from("observability_logs")
    .select("*")
    .ilike("message", "%Auto-remediation executed%")
    .order("created_at", { ascending: false })
    .limit(limit);
    
  if (error) {
    throw error;
  }
  
  return data;
}
