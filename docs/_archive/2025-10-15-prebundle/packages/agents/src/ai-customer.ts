import { Agent, run, tool, interruption } from '@openai/agents';
import { z } from 'zod';

/** Social post tool (Ayrshare) with human approval */
const PostSchema = z.object({
  text: z.string().min(1),
  mediaUrls: z.array(z.string().url()).optional(),
  platforms: z.array(z.enum(['twitter','facebook','instagram','linkedin','youtube','pinterest','reddit','tiktok','telegram','google'])).min(1)
});
const socialPost = tool({
  name: 'social.post',
  description: 'Schedule or publish a social post via aggregator (Ayrshare)',
  inputSchema: PostSchema,
  async handler({ text, mediaUrls = [], platforms }) {
    // NOTE: call out to your backend `/api/social/post` which proxies to Ayrshare with server-side secret
    // return { id: 'post_123', status: 'pending_approval' };
    return { draft: { text, mediaUrls, platforms } };
  },
  requireApproval: true // triggers HITL flow
});

export const aiCustomer = new Agent({
  name: 'ai-customer',
  instructions: `You write draft replies and draft social posts. All outputs require human approval before sending.`,
  tools: [socialPost],
  onApproval: async (item, approve) => {
    // Present draft to human reviewer in your app UI; store in Supabase for audit.
    // When reviewer approves, call approve(true) with optional modifications.
    await approve(false); // default to require explicit human action
  }
});

export async function handleMessage(userText: string) {
  const r = await run({ agent: aiCustomer, input: userText });
  return r;
}
