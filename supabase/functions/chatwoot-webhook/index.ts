import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";
import { createHmac } from "https://deno.land/std@0.208.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-chatwoot-signature",
};

interface ChatwootWebhookPayload {
  event: string;
  account: {
    id: number;
    name: string;
  };
  inbox?: {
    id: number;
    name: string;
  };
  conversation: {
    id: number;
    inbox_id: number;
    status: string;
    created_at: number;
    meta?: any;
    contact?: {
      name?: string;
      email?: string;
      phone?: string;
    };
    messages?: Array<{
      id: number;
      content: string;
      message_type: number;
      created_at: number;
      sender: {
        type: string;
      };
    }>;
  };
  message?: {
    id: number;
    content: string;
    message_type: number;
    created_at: number;
    sender: {
      type: string;
    };
  };
}

function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;

  const hmac = createHmac("sha256", secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest("hex");

  return signature === expectedSignature;
}

async function logToObservability(
  supabase: any,
  level: string,
  message: string,
  metadata: any
) {
  await supabase.from("observability_logs").insert({
    level,
    message,
    metadata,
  });
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // Get environment variables
    const webhookSecret = Deno.env.get("CHATWOOT_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!webhookSecret || !supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Missing required environment variables" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Read and verify webhook signature
    const rawBody = await req.text();
    const signature = req.headers.get("X-Chatwoot-Signature");

    if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      await logToObservability(supabase, "WARN", "Invalid webhook signature", {
        signature,
        ip: req.headers.get("x-forwarded-for"),
      });

      return new Response(
        JSON.stringify({ error: "Invalid webhook signature" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse webhook payload
    const payload: ChatwootWebhookPayload = JSON.parse(rawBody);

    await logToObservability(
      supabase,
      "INFO",
      "Chatwoot webhook received",
      {
        event: payload.event,
        conversation_id: payload.conversation?.id,
        message_id: payload.message?.id,
      }
    );

    // Filter: Only process customer messages
    if (
      payload.event !== "message_created" ||
      !payload.message ||
      payload.message.sender.type !== "contact" ||
      payload.conversation.status !== "open"
    ) {
      await logToObservability(
        supabase,
        "INFO",
        "Webhook event filtered out",
        {
          event: payload.event,
          sender_type: payload.message?.sender?.type,
          conversation_status: payload.conversation?.status,
          reason: "Not a customer message in open conversation",
        }
      );

      return new Response(JSON.stringify({ ok: true, filtered: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract conversation details
    const {
      conversation,
      message,
    } = payload;

    // TODO: Query LlamaIndex for knowledge context
    // const llamaIndexUrl = Deno.env.get("LLAMAINDEX_SERVICE_URL");
    // const knowledgeResults = await fetch(`${llamaIndexUrl}/api/llamaindex/query`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     query: message.content,
    //     top_k: 5,
    //     min_relevance: 0.7,
    //   }),
    // }).then(r => r.json());

    // TODO: Generate draft response via Agent SDK
    // const agentSdkUrl = Deno.env.get("AGENTSDK_SERVICE_URL");
    // const draft = await fetch(`${agentSdkUrl}/api/agentsdk/draft`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     customer_message: message.content,
    //     customer_context: {
    //       name: conversation.contact?.name,
    //       email: conversation.contact?.email,
    //       conversation_id: conversation.id,
    //     },
    //     knowledge_context: knowledgeResults.results,
    //   }),
    // }).then(r => r.json());

    // TODO: Create private note in Chatwoot with draft
    // const chatwootToken = Deno.env.get("CHATWOOT_API_TOKEN");
    // const chatwootBaseUrl = Deno.env.get("CHATWOOT_BASE_URL");
    // const privateNote = await fetch(
    //   `${chatwootBaseUrl}/api/v1/accounts/${payload.account.id}/conversations/${conversation.id}/messages`,
    //   {
    //     method: "POST",
    //     headers: {
    //       "api_access_token": chatwootToken,
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       content: `🤖 DRAFT RESPONSE...\n\n${draft.draft_response}`,
    //       message_type: 0,
    //       private: true,
    //     }),
    //   }
    // ).then(r => r.json());

    // TODO: Insert into approval queue
    // await supabase.from("agent_sdk_approval_queue").insert({
    //   conversation_id: conversation.id,
    //   chatwoot_message_id: privateNote.id,
    //   customer_message: message.content,
    //   draft_response: draft.draft_response,
    //   confidence_score: draft.confidence_score,
    //   knowledge_sources: draft.sources,
    //   status: "pending",
    // });

    // For now, just log that we received a valid customer message
    await logToObservability(
      supabase,
      "INFO",
      "Customer message queued for Agent SDK processing",
      {
        conversation_id: conversation.id,
        message_id: message.id,
        customer_email: conversation.contact?.email,
        message_preview: message.content.substring(0, 100),
        processing_time_ms: Date.now() - startTime,
      }
    );

    return new Response(
      JSON.stringify({
        ok: true,
        message: "Webhook processed successfully (Agent SDK integration pending)",
        conversation_id: conversation.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Chatwoot webhook error:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

