// packages/memory/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Memory, DecisionLog, Fact } from './index';

export function supabaseMemory(url: string, key: string): Memory {
  const sb = createClient(url, key);
  return {
    async putDecision(d: DecisionLog) {
      await sb.from('decision_log').insert({
        scope: d.scope, who: d.who, what: d.what, why: d.why,
        sha: d.sha, evidence_url: d.evidenceUrl, created_at: d.createdAt
      });
    },
    async listDecisions(scope) {
      const q = scope ? sb.from('decision_log').select('*').eq('scope', scope)
                      : sb.from('decision_log').select('*');
      const { data } = await q.order('created_at', { ascending: false });
      return (data || []).map((r:any) => ({
        id: r.id, scope: r.scope, who: r.who, what: r.what, why: r.why,
        sha: r.sha, evidenceUrl: r.evidence_url, createdAt: r.created_at
      }));
    },
    async putFact(f: Fact) {
      await sb.from('facts').insert({
        project: f.project, topic: f.topic, key: f.key, value: f.value, created_at: f.createdAt
      });
    },
    async getFacts(topic?: string, key?: string) {
      let q = sb.from('facts').select('*');
      if (topic) q = q.eq('topic', topic);
      if (key) q = q.eq('key', key);
      const { data } = await q.order('created_at', { ascending: false });
      return (data || []).map((r:any) => ({
        project: r.project, topic: r.topic, key: r.key, value: r.value, createdAt: r.created_at
      }));
    }
  };
}
