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

    // Auto-response processing - integrates with Agent SDK approval system
    // Call auto-responder service to classify intent and generate response
    const autoResponderUrl = Deno.env.get("AUTO_RESPONDER_URL"); // Points to React Router app
    
    if (autoResponderUrl) {
      try {
        const autoResponseResult = await fetch(
          `${autoResponderUrl}/api/cx/auto-response`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              conversationId: conversation.id,
              customerMessage: message.content,
              conversationHistory: conversation.messages || [],
              customerMetadata: {
                name: conversation.contact?.name,
                email: conversation.contact?.email,
              },
            }),
          }
        ).then(r => r.json());

        // If high confidence and should auto-respond, queue for approval
        if (autoResponseResult.shouldAutoRespond) {
          await logToObservability(
            supabase,
            "INFO",
            "Auto-response generated, queued for CEO approval",
            {
              conversationId: conversation.id,
              intent: autoResponseResult.intent.category,
              confidence: autoResponseResult.confidence,
              needsApproval: true,
            }
          );
        } else {
          await logToObservability(
            supabase,
            "INFO",
            "Message routed to human queue",
            {
              conversationId: conversation.id,
              intent: autoResponseResult.intent.category,
              confidence: autoResponseResult.confidence,
              reason: "below_confidence_threshold_or_complex",
            }
          );
        }
      } catch (error) {
        await logToObservability(
          supabase,
          "WARN",
          "Auto-responder service unavailable, falling back to manual queue",
          {
            error: error.message,
            conversationId: conversation.id,
          }
        );
      }
    }

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

