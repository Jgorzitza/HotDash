# Customer Service Agents — End‑to‑End (OpenAI Agents JS + LlamaIndex.TS + Chatwoot + Shopify)

**Status:** production‑oriented scaffold you can drop into a Node/TS monorepo.  
**Goal:** stand up multi‑agent customer service with RAG, Shopify lookups/actions, Chatwoot routing, and a human‑approval wall for everything public‑facing.  
**Philosophy:** tools do the grunt work; humans approve the sharp bits; we keep tight logs to improve the model.

---

## What you get

- **Agents** built with `@openai/agents` orchestrated by handoffs (triage → specialized agents).
- **RAG** via LlamaIndex.TS for policy/FAQ/docs lookups.
- **Chatwoot** webhook ingestion and outbound messaging utilities.
- **Shopify** GraphQL read/write tools (read‑only by default; write tools ship disabled behind approvals).
- **Human‑in‑the‑loop**: every external action requires approval (`needsApproval`) with a simple REST approval queue your dashboard can render.
- **Feedback** capture: JSONL + SQL schema + thin API to score responses; designed to become a training/eval corpus.

> This file is long because it’s complete. Copy it into your repo as `AGENTS_CUSTOMER_SERVICE.md` and follow it top‑to‑bottom.

---

## 0) Prereqs

- Node 18+ (or Bun), TypeScript 5+
- Postgres (optional but recommended) for approval+feedback state
- Accounts/tokens:
  - **OpenAI**: `OPENAI_API_KEY`
  - **Chatwoot**: `CHATWOOT_API_TOKEN`, base URL, `ACCOUNT_ID`
  - **Shopify** (private or custom app): `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_ADMIN_TOKEN` (scopes at minimum `read_orders`; later `read_all_orders` if you need >60 days; write scopes if you actually modify orders)
- Your **dashboard app**: somewhere to show a queue of pending approvals and one‑click Approve/Reject buttons that hit our endpoints.

---

## 1) Install

```bash
npm i @openai/agents zod dotenv express body-parser node-fetch@3
npm i -D typescript ts-node @types/node @types/express
# LlamaIndex.TS (core + reader)
npm i llamaindex @llamaindex/readers/directory
# Optional: Postgres
npm i pg
```

Create `tsconfig.json` if you don’t have one:

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "outDir": "dist",
  },
  "include": ["src"],
}
```

`.env.example`:

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Optional OpenAI tracing to dashboard
OPENAI_TRACING_API_KEY=...

# Chatwoot
CHATWOOT_BASE_URL=https://app.chatwoot.com
CHATWOOT_API_TOKEN=
CHATWOOT_ACCOUNT_ID=123

# Shopify Admin GraphQL
SHOPIFY_STORE_DOMAIN=yourstore.myshopify.com
SHOPIFY_ADMIN_TOKEN=shpat_...

# LlamaIndex
LLAMA_EMBED_MODEL=openai/text-embedding-3-small

# Server
PORT=8787

# Postgres (optional; if unset, we fall back to JSONL)
PG_URL=postgres://user:pass@host:5432/dbname
```

---

## 2) Project layout

```
src/
  server.ts                # Express server + webhook + approval endpoints
  agents/
    index.ts               # triage + specialized agents + handoffs
  tools/
    chatwoot.ts            # send private notes / public replies
    shopify.ts             # look up orders, optionally perform updates
    rag.ts                 # LlamaIndex query tool
  feedback/
    store.ts               # Postgres or JSONL storage
    types.ts               # shared types & Zod schemas
```

---

## 3) RAG: LlamaIndex.TS tool

`src/tools/rag.ts`

```ts
import { tool } from "@openai/agents";
import { z } from "zod";
import { VectorStoreIndex, SimpleDirectoryReader } from "llamaindex";

let queryFn: ((q: string) => Promise<string>) | null = null;

// Build a tiny in-memory RAG index from ./data (markdown, txt, pdf, etc.)
export async function ensureRag() {
  if (queryFn) return queryFn;
  const reader = new SimpleDirectoryReader();
  const docs = await reader.loadData("./data"); // put FAQs, refund policy, shipping SLAs, troubleshooting guides here
  const index = await VectorStoreIndex.fromDocuments(docs);
  const engine = index.asQueryEngine({ similarityTopK: 5 });
  queryFn = async (q: string) => (await engine.query({ query: q })).response;
  return queryFn;
}

export const answerFromDocs = tool({
  name: "answer_from_docs",
  description:
    "Answer questions using internal docs/FAQs/policies. Good for shipping, returns, warranties, troubleshooting.",
  parameters: z.object({ question: z.string() }),
  // read-only; no approval required
  execute: async ({ question }) => {
    const q = await ensureRag();
    const answer = await q(question);
    return answer;
  },
});
```

> Drop files into `./data/` and restart. Keep this read‑only. The agent uses it to anchor answers in your policy universe.

---

## 4) Chatwoot utility tools

`src/tools/chatwoot.ts`

```ts
import { tool } from "@openai/agents";
import { z } from "zod";
import fetch from "node-fetch";

const base = process.env.CHATWOOT_BASE_URL!;
const token = process.env.CHATWOOT_API_TOKEN!;
const accountId = process.env.CHATWOOT_ACCOUNT_ID!;

async function postJSON(path: string, body: any) {
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      api_access_token: token,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Chatwoot ${path} failed: ${res.status} ${t}`);
  }
  return res.json();
}

/**
 * Create a private note in a conversation for human review.
 * Use this to propose drafts, summaries, and next actions.
 */
export const cwCreatePrivateNote = tool({
  name: "chatwoot_create_private_note",
  description:
    "Create a private note (internal only) in a Chatwoot conversation so an agent can review/approve.",
  parameters: z.object({
    conversationId: z.number(),
    content: z.string().min(1),
  }),
  async execute({ conversationId, content }) {
    const path = `/api/v1/accounts/${accountId}/conversations/${conversationId}/messages`;
    const payload = { content, private: true, content_type: "text" };
    const json = await postJSON(path, payload);
    return { ok: true, id: json.id };
  },
});

/**
 * Send a public reply to the customer (OFF by default; approval required).
 * Keep this behind needsApproval for now.
 */
export const cwSendPublicReply = tool({
  name: "chatwoot_send_public_reply",
  description:
    "Send a public reply in a Chatwoot conversation to the customer. Use only after a human approves the draft.",
  parameters: z.object({
    conversationId: z.number(),
    content: z.string().min(1),
  }),
  // Guard with approval; the SDK will interrupt runs until approved.
  needsApproval: true,
  async execute({ conversationId, content }) {
    const path = `/api/v1/accounts/${accountId}/conversations/${conversationId}/messages`;
    const payload = { content, private: false, content_type: "text" };
    const json = await postJSON(path, payload);
    return { ok: true, id: json.id };
  },
});
```

Notes:

- Endpoints use Chatwoot **Application API** style: `/api/v1/accounts/:account_id/...` and `api_access_token` header.
- We separate **private notes** (drafts) from **public replies** (approval‑gated).

---

## 5) Shopify Admin GraphQL tools

`src/tools/shopify.ts`

```ts
import { tool } from "@openai/agents";
import { z } from "zod";
import fetch from "node-fetch";

const domain = process.env.SHOPIFY_STORE_DOMAIN!; // e.g. yourstore.myshopify.com
const adminToken = process.env.SHOPIFY_ADMIN_TOKEN!;

async function gql<T>(query: string, variables?: Record<string, any>) {
  const res = await fetch(`https://${domain}/admin/api/2025-10/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": adminToken,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data as T;
}

/** Read‑only: find recent orders for a customer (by email or name). */
export const shopifyFindOrders = tool({
  name: "shopify_find_orders",
  description: "Find recent orders for a customer by email or name. Read-only.",
  parameters: z.object({
    query: z
      .string()
      .describe(
        'Shopify order search query, e.g. "email:john@example.com" or free text',
      ),
    first: z.number().int().min(1).max(50).default(10),
  }),
  async execute({ query, first }) {
    const data = await gql<{ orders: { edges: any[] } }>(
      `query($query:String!, $first:Int!) {
        orders(query:$query, first:$first, sortKey:CREATED_AT, reverse:true) {
          edges { node { id name email createdAt financialStatus fulfillmentStatus
            totalPriceSet { shopMoney { amount currencyCode } }
            currentSubtotalPriceSet { shopMoney { amount currencyCode } }
            lineItems(first: 30) { edges { node { title quantity sku } } }
            customer { id email displayName } 
            shippingAddress { name address1 city province zip country }
          } }
        }
      }`,
      { query, first },
    );
    return data.orders.edges.map((e) => e.node);
  },
});

/**
 * Sensitive action: cancel an order. Ship disabled behind approvals.
 * You probably won’t allow this until you’ve road‑tested the drafts.
 */
export const shopifyCancelOrder = tool({
  name: "shopify_cancel_order",
  description:
    "Cancel a Shopify order with an optional reason. Requires human approval.",
  parameters: z.object({
    orderId: z
      .string()
      .describe('GraphQL ID, e.g. "gid://shopify/Order/1234567890"'),
    notify: z.boolean().default(false),
    reason: z
      .enum(["CUSTOMER", "DECLINED", "FRAUD", "INVENTORY", "OTHER"])
      .optional(),
  }),
  needsApproval: true,
  async execute({ orderId, notify, reason }) {
    const data = await gql<{ orderCancel: { userErrors: any[] } }>(
      `mutation($orderId:ID!, $notify:Boolean!, $reason:OrderCancelReason) {
        orderCancel(id:$orderId, notifyCustomer:$notify, reason:$reason) {
          userErrors { field message }
        }
      }`,
      { orderId, notify, reason },
    );
    if (data.orderCancel.userErrors?.length)
      throw new Error(JSON.stringify(data.orderCancel.userErrors));
    return { ok: true };
  },
});
```

Defaults:

- We pin GraphQL to `2025-10`. Change as Shopify deprecates older versions.
- Read‑only queries do not need approval; mutations do.

---

## 6) Agents + handoffs

`src/agents/index.ts`

```ts
import { Agent, tool } from "@openai/agents";
import { z } from "zod";
import { answerFromDocs } from "../tools/rag";
import { shopifyFindOrders, shopifyCancelOrder } from "../tools/shopify";
import { cwCreatePrivateNote, cwSendPublicReply } from "../tools/chatwoot";

// A tiny tool the triage agent can use to annotate intent in-line.
const setIntent = tool({
  name: "set_intent",
  description: "Classify the user message into a high-level intent bucket.",
  parameters: z.object({
    intent: z.enum([
      "order_status",
      "refund",
      "cancel",
      "exchange",
      "product_question",
      "other",
    ]),
  }),
  async execute({ intent }) {
    return { intent };
  },
});

export const orderSupportAgent = new Agent({
  name: "Order Support",
  instructions: [
    "You help with order status, returns, exchanges, and cancellations.",
    "Prefer read-only checks first (Shopify find_orders).",
    "If a mutation is required (cancel/refund), propose a clear private note explaining steps and risks.",
    "Do NOT send anything to the customer directly; use private notes and wait for approval.",
  ].join("\n"),
  tools: [
    answerFromDocs,
    shopifyFindOrders,
    shopifyCancelOrder,
    cwCreatePrivateNote,
    cwSendPublicReply,
  ],
});

export const productQAAgent = new Agent({
  name: "Product Q&A",
  instructions: [
    "You answer product questions based on internal docs/FAQs/spec sheets via answer_from_docs.",
    "If missing info, propose a private note requesting human input.",
    "No public replies without approval.",
  ].join("\n"),
  tools: [answerFromDocs, cwCreatePrivateNote, cwSendPublicReply],
});

export const triageAgent = new Agent({
  name: "Triage",
  instructions: [
    "Decide whether the conversation is about orders or product questions.",
    "If order-related, hand off to Order Support. If product knowledge, hand off to Product Q&A.",
    "Use set_intent to record your guess; include it in private notes.",
  ].join("\n"),
  tools: [setIntent],
  handoffs: [orderSupportAgent, productQAAgent],
});
```

> We keep a strict rule in the system prompt: **no public replies** without approval. Tools that can talk publicly are approval‑gated.

---

## 7) Server: webhook → run agent → interruptions → approval queue

`src/server.ts`

```ts
import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import {
  run,
  RunState,
  RunResult,
  setDefaultOpenAIKey,
  setTracingExportApiKey,
} from "@openai/agents";
import { triageAgent } from "./agents";
import {
  saveFeedbackSample,
  saveApprovalState,
  loadApprovalState,
  listPendingApprovals,
} from "./feedback/store";

setDefaultOpenAIKey(process.env.OPENAI_API_KEY!);
if (process.env.OPENAI_TRACING_API_KEY)
  setTracingExportApiKey(process.env.OPENAI_TRACING_API_KEY);

const app = express();
app.use(bodyParser.json());

/**
 * Chatwoot webhook (subscribe at least to message_created).
 * We only respond to new incoming customer messages (not agent messages).
 */
app.post("/webhooks/chatwoot", async (req, res) => {
  try {
    const event = req.body;
    if (event?.event !== "message_created") return res.json({ ignored: true });
    const msg = event; // payload shape documented by Chatwoot

    const conversationId: number = event?.conversation?.id;
    const text: string | undefined = event?.content;
    const isIncoming: boolean =
      event?.message_type === 0 || event?.sender?.type === "contact";
    if (!conversationId || !text || !isIncoming)
      return res.json({ ignored: true });

    // Kick off agent run with the raw user text. You can layer extra context (shop/customer) if you have it.
    let result: RunResult<any, any> = await run(triageAgent, text);

    // If tools need approval, the SDK interrupts and returns pending items.
    if (result.interruptions?.length) {
      // Persist state for later
      await saveApprovalState(conversationId, result.state);
      // Summarize what’s proposed and add a private note in Chatwoot (via our own tool)
      const planned = result.interruptions.map((i) => ({
        agent: i.agent.name,
        tool: i.rawItem.name,
        args: i.rawItem.arguments,
      }));

      // Compose a private note instructing the human what to approve
      const summary = [
        `🤖 Proposed plan by agents:`,
        ...planned.map(
          (p) => `• ${p.agent} → ${p.tool} ${JSON.stringify(p.args)}`,
        ),
        ``,
        `Approve in dashboard → Approvals queue → conversation ${conversationId}`,
      ].join("\n");

      // We don’t call tools from here; this webhook handler should be fast. Your dashboard will display approvals.
      return res.json({
        status: "pending_approval",
        conversationId,
        interruptions: planned,
      });
    }

    // If there were no approval-gated tools, we likely just have a draft text as finalOutput.
    // Save a feedback seed so a human can grade it later.
    await saveFeedbackSample({
      conversationId,
      inputText: text,
      modelDraft: String(result.finalOutput ?? ""),
      safeToSend: false,
      labels: [],
    });

    return res.json({
      status: "draft_ready",
      conversationId,
      draft: result.finalOutput,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || "webhook error" });
  }
});

/**
 * Your dashboard calls this to fetch all pending approvals (cross-conversation).
 */
app.get("/approvals", async (_req, res) => {
  const rows = await listPendingApprovals();
  res.json(
    rows.map((r) => ({
      id: r.id,
      conversationId: r.conversationId,
      createdAt: r.createdAt,
      pending: r.pending, // array of { agent, tool, args }
    })),
  );
});

/**
 * Approve or reject a specific interruption item by index (0..N-1).
 * The UI should show details and collect a reason for audit.
 */
app.post("/approvals/:id/:idx/:action", async (req, res) => {
  const { id, idx, action } = req.params;
  const approve = action === "approve";
  const state = await loadApprovalState(id);
  if (!state) return res.status(404).json({ error: "not found" });

  // Rehydrate RunState and apply decision
  const hydrated = await RunState.fromString(triageAgent, state.serialized);
  const interruption = state.lastInterruptions[Number(idx)];
  if (!interruption)
    return res.status(400).json({ error: "bad interruption index" });

  if (approve) hydrated.approve(interruption);
  else hydrated.reject(interruption);

  // Resume run
  let result = await run(triageAgent, hydrated);

  // Loop until clear (in case multiple approvals are needed)
  while (result.interruptions?.length) {
    // Persist the new pending set and exit; UI can approve the next set
    await saveApprovalState(state.conversationId, result.state);
    return res.json({
      status: "more_pending",
      pending: result.interruptions.map((i) => ({
        agent: i.agent.name,
        tool: i.rawItem.name,
        args: i.rawItem.arguments,
      })),
    });
  }

  // Finished. Either we produced a final draft or executed tools.
  // Up to policy: either auto-create a private note with the draft, or require a second approval to send publicly.
  const finalText = String(result.finalOutput ?? "");
  await saveFeedbackSample({
    conversationId: state.conversationId,
    inputText: state.lastInput ?? "",
    modelDraft: finalText,
    safeToSend: true, // This approval path indicates it’s okay to send, but the public send tool is still gated
    labels: ["approved"],
  });

  return res.json({ status: "complete", finalOutput: finalText });
});

const port = Number(process.env.PORT || 8787);
app.listen(port, () => console.log(`agents server on :${port}`));
```

**Why this flow works**

- Webhook stays quick; it stores pending approvals and returns.
- Your **dashboard** lists `/approvals` → operator clicks a row → sees proposed tool call(s) and the draft → presses **Approve** (or **Reject**) → server continues the run using `RunState.fromString(...)` and `state.approve(...)` → result either finishes or yields more approvals.

---

## 8) Feedback capture (training & eval fuel)

`src/feedback/types.ts`

```ts
import { z } from "zod";

export const FeedbackSchema = z.object({
  conversationId: z.number(),
  inputText: z.string(),
  modelDraft: z.string().default(""),
  safeToSend: z.boolean().default(false),
  // operator labels/tags — keep it compact but consistent
  labels: z.array(z.string()).default([]),
  // optional structured rubric
  rubric: z
    .object({
      factuality: z.number().min(1).max(5).optional(),
      helpfulness: z.number().min(1).max(5).optional(),
      tone: z.number().min(1).max(5).optional(),
      policyAlignment: z.number().min(1).max(5).optional(),
      firstTimeResolution: z.number().min(1).max(5).optional(),
    })
    .partial()
    .default({}),
  annotator: z.string().optional(),
  notes: z.string().optional(),
  // keep raw telemetry for training
  meta: z.record(z.any()).optional(),
});

export type Feedback = z.infer<typeof FeedbackSchema>;
```

`src/feedback/store.ts`

```ts
import fs from "node:fs";
import path from "node:path";
import { Pool } from "pg";
import type { Feedback } from "./types";

type ApprovalRow = {
  id: string;
  conversationId: number;
  serialized: string;
  lastInterruptions: any[];
  lastInput?: string;
  createdAt: string;
};

const pgUrl = process.env.PG_URL;
const usePg = !!pgUrl;

let pool: Pool | null = null;
if (usePg) {
  pool = new Pool({ connectionString: pgUrl });
}

const dataDir = path.join(process.cwd(), "data");
const feedbackPath = path.join(dataDir, "feedback.jsonl");
const approvalsDir = path.join(dataDir, "approvals");
fs.mkdirSync(approvalsDir, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });

export async function saveFeedbackSample(sample: Feedback) {
  if (usePg && pool) {
    await pool.query(
      `INSERT INTO agent_feedback
       (conversation_id, input_text, model_draft, safe_to_send, labels, rubric, annotator, notes, meta)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        sample.conversationId,
        sample.inputText,
        sample.modelDraft,
        sample.safeToSend,
        JSON.stringify(sample.labels ?? []),
        JSON.stringify(sample.rubric ?? {}),
        sample.annotator ?? null,
        sample.notes ?? null,
        JSON.stringify(sample.meta ?? {}),
      ],
    );
  } else {
    fs.appendFileSync(feedbackPath, JSON.stringify(sample) + "\n");
  }
}

export async function saveApprovalState(conversationId: number, state: any) {
  const id = `${conversationId}-${Date.now()}`;
  const record: ApprovalRow = {
    id,
    conversationId,
    serialized: JSON.stringify(state),
    lastInterruptions: state.interruptions ?? [],
    createdAt: new Date().toISOString(),
  };
  if (usePg && pool) {
    await pool.query(
      `INSERT INTO approvals (id, conversation_id, serialized, last_interruptions, created_at)
       VALUES ($1,$2,$3,$4,$5)`,
      [
        record.id,
        record.conversationId,
        record.serialized,
        JSON.stringify(record.lastInterruptions),
        record.createdAt,
      ],
    );
  } else {
    fs.writeFileSync(
      path.join(approvalsDir, `${id}.json`),
      JSON.stringify(record, null, 2),
    );
  }
  return record;
}

export async function listPendingApprovals(): Promise<ApprovalRow[]> {
  if (usePg && pool) {
    const { rows } = await pool.query(
      `SELECT id, conversation_id, serialized, last_interruptions, created_at FROM approvals ORDER BY created_at DESC`,
    );
    return rows.map((r: any) => ({
      id: r.id,
      conversationId: Number(r.conversation_id),
      serialized: r.serialized,
      lastInterruptions: r.last_interruptions,
      createdAt: r.created_at,
    }));
  }
  const files = fs.readdirSync(approvalsDir).filter((f) => f.endsWith(".json"));
  return files.map((f) =>
    JSON.parse(fs.readFileSync(path.join(approvalsDir, f), "utf-8")),
  );
}

export async function loadApprovalState(
  id: string,
): Promise<ApprovalRow | null> {
  if (usePg && pool) {
    const { rows } = await pool.query(
      `SELECT id, conversation_id, serialized, last_interruptions, created_at FROM approvals WHERE id=$1`,
      [id],
    );
    if (!rows[0]) return null;
    const r = rows[0];
    return {
      id: r.id,
      conversationId: Number(r.conversation_id),
      serialized: r.serialized,
      lastInterruptions: r.last_interruptions,
      createdAt: r.created_at,
    };
  }
  const p = path.join(approvalsDir, `${id}.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}
```

SQL to provision Postgres:

```sql
-- approvals with serialized RunState blobs (stringified)
CREATE TABLE IF NOT EXISTS approvals (
  id TEXT PRIMARY KEY,
  conversation_id BIGINT NOT NULL,
  serialized TEXT NOT NULL,
  last_interruptions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- graded samples for training/eval
CREATE TABLE IF NOT EXISTS agent_feedback (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT NOT NULL,
  input_text TEXT NOT NULL,
  model_draft TEXT NOT NULL,
  safe_to_send BOOLEAN NOT NULL DEFAULT false,
  labels TEXT[] NOT NULL DEFAULT '{}',
  rubric JSONB NOT NULL DEFAULT '{}'::jsonb,
  annotator TEXT,
  notes TEXT,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 9) Wiring Chatwoot

- In Chatwoot **Settings → Integrations → Webhooks**, add a webhook pointing to your server `/webhooks/chatwoot`. Subscribe to at least `message_created`.
- Create an **API channel** if you want to receive messages from your own front‑end and unify the flow.
- Operators will live in your **dashboard** (not Chatwoot) for the approval queue, or you can paste the approval links as **private notes** so agents can click through.

---

## 10) Policy & guardrails (recommended)

You can add output guardrails around tone/policy. Example (mild): ensure the draft includes empathy and references policy when denying requests.

```ts
import { defineOutputGuardrail } from "@openai/agents";

export const toneGuardrail = defineOutputGuardrail({
  name: "tone_policy_guardrail",
  description:
    "Block drafts that are hostile or that promise actions that violate policy.",
  execute: async ({ input, output }) => {
    const bad = /(refund guaranteed|100% promise|swear words here)/i.test(
      String(output ?? ""),
    );
    if (bad) {
      return { blocked: true, reason: "Policy-violating promise/tone" };
    }
    return { blocked: false };
  },
});
// Attach on an Agent by adding outputGuardrails: [toneGuardrail]
```

Start simple; iterate based on real mistakes you see in feedback.

---

## 11) Running locally

```bash
# seed data/ with your FAQ/policies
mkdir -p data && echo "Our return window is 30 days..." > data/returns.md

cp .env.example .env
# Fill in API keys and IDs

# Type-check and run
npx ts-node src/server.ts
# or
tsc -w & node dist/server.js
```

Webhook test (rough):

```bash
curl -X POST http://localhost:8787/webhooks/chatwoot \
  -H 'Content-Type: application/json' \
  -d '{
    "event":"message_created",
    "conversation":{"id": 999},
    "message_type": 0,
    "sender": {"type":"contact"},
    "content":"Where is my order 12345?"
  }'
```

You should get `{ "status":"pending_approval", ... }` the first time a tool call requires approval.

---

## 12) Dashboard contract (minimal)

- **List approvals**: `GET /approvals` → `[{ id, conversationId, createdAt, pending: [{agent, tool, args}] }]`
- **Approve**: `POST /approvals/:id/:idx/approve`
- **Reject**: `POST /approvals/:id/:idx/reject`

Enhance as you like: add actor identity, reason, bulk approvals, or auto‑approval for safe tools over time.

---

## 13) Training loop (reality‑tested)

1. **Collect**: Save every draft + human correction (what was actually sent). Your dashboard can add a “Replace draft with my message” and send that delta to `agent_feedback`.
2. **Score** quickly: 5‑point rubric for factuality/helpfulness/tone/policy/first‑time‑resolution.
3. **Screen** for privacy and policy. Redact PII if needed.
4. **Eval**: Turn 100–300 labeled items into a regression test (exact match for intent, heuristic for tone, etc.).
5. **Fine‑tune / few‑shot**: Use the best labeled pairs as system/task demonstrations or fine‑tune if volume justifies.
6. **Tighten approvals**: Gradually auto‑approve safe read‑only tools; keep writes gated until error rate < your tolerance.

---

## 14) Switches you’ll want in prod

- Disable **Shopify mutations** until you have gold‑standard coverage.
- Rate‑limit webhooks per conversation to avoid duplicate processing.
- Idempotency keys for outbound Chatwoot messages (echo_id or source_id) to prevent dupes.
- Trace everything (enable OpenAI tracing exporter + your app logs).

---

## 15) Common pitfalls & blunt truths

- Tool calls can **fan out**; expect more than one approval before a reply is ready.
- RAG answers are only as good as the docs. Garbage in → garbage out. Curate `./data/` mercilessly.
- Shopify **orders** are limited to last **60 days** unless the app has `read_all_orders`. Don’t chase ghosts.
- Don’t ship without a **feedback** loop; you’ll fly blind and regress on edge cases.

---

## 16) Deploy check‑list

- Environment variables present (keys, domains, account IDs).
- Webhook URL reachable from Chatwoot (consider a proxy or queue).
- Postgres tables migrated or `data/` writeable.
- Dashboard approval UI hooked to `/approvals` and approve/reject endpoints.
- RAG seeded with live policies and top 50 customer questions.
- Guards on: approval‑gates for any external write or public reply.

---

## License

This scaffold is yours to modify in your project. Keep your keys secret; keep your approvals tight. Iterate fast, measure faster.
