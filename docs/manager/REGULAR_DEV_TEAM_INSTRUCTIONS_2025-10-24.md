# Regular Dev Team Instructions - LLM Gateway Infrastructure

**Date:** 2025-10-24  
**Manager:** Augment Agent  
**CEO:** Justin  
**Status:** ACTIVE - Continue building agents normally

---

## 🚨 CRITICAL: DO NOT PAUSE AGENT DEVELOPMENT

**specialagent001 is building infrastructure in parallel. You should CONTINUE BUILDING AGENTS NORMALLY.**

---

## ✅ What You Should Do NOW (Phase 1)

### Keep Building Production Agents

**✅ CONTINUE:**
- Building ai-customer features
- Building ceo-insights features
- Building ai-knowledge features
- Building background agents (analytics, inventory, seo, ads, content)
- Adding new features
- Fixing bugs
- Writing tests
- Deploying changes to production

**✅ USE CURRENT SETUP:**
```typescript
// Keep using direct OpenAI (for now)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,        // sk-proj-... (direct OpenAI key)
  baseURL: "https://api.openai.com/v1"       // Direct OpenAI endpoint
});
```

**✅ DEPLOY NORMALLY:**
```bash
# Deploy agent changes as usual
fly deploy -a hotdash-agent-service
```

---

## ❌ What You Should NOT Do NOW (Phase 1)

**❌ DO NOT:**
- Wait for infrastructure to be ready
- Pause agent development
- Change OPENAI_BASE_URL yet
- Change OPENAI_API_KEY yet
- Worry about LiteLLM integration

**Why?** Infrastructure is being built in parallel by specialagent001. Your work is independent.

---

## 🔄 What Changes Later (Phase 2 - After Infrastructure Ready)

### Simple 2-Line Change Per Agent Group

**Manager will assign cutover tasks when infrastructure is ready.**

**Example cutover (ai-customer + support):**

```typescript
// BEFORE (Phase 1 - now)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,        // sk-proj-xxxxxxxxxxxxx
  baseURL: "https://api.openai.com/v1"       // Direct OpenAI
});

// AFTER (Phase 2 - later)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,        // prod_customer_key (from vault)
  baseURL: "https://gateway.hotrodan.com"    // Our LiteLLM gateway
});
```

**Environment variable changes:**

```bash
# BEFORE (Phase 1 - now)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx  # Direct OpenAI key

# AFTER (Phase 2 - later)
OPENAI_API_KEY=<prod_customer_key>    # LiteLLM team key (from vault)
```

**That's it!** No code changes, just env vars.

---

## 📋 Phase 2 Cutover Tasks (LATER - Not Now)

**Manager will assign these tasks when infrastructure is ready:**

### Task 1: Update ai-customer + support agents
- Update env vars (2 lines)
- Deploy
- Verify in Langfuse

### Task 2: Update ceo-insights + ai-knowledge agents
- Update env vars (2 lines)
- Deploy
- Verify in Langfuse

### Task 3: Update background agents
- Update env vars (2 lines)
- Deploy
- Verify in Langfuse

### Task 4: Monitor and verify
- Check Langfuse dashboard
- Verify cache hit rate
- Monitor costs

**Estimated effort:** 4-6 hours total (simple env var changes)

---

## 🎯 What You Get (Automatically After Cutover)

**No code changes needed - these benefits are automatic:**

### 1. Caching (30-50% faster, cheaper)
```
Request 1: "What is the return policy?" → OpenAI API (slow, costs money)
Request 2: "What is the return policy?" → Cache (fast, FREE)
Request 3: "What's your refund policy?"  → Semantic cache (fast, FREE)
```

### 2. Quotas (Protection from runaway costs)
```
prod_customer_key: 100 requests/min, $50/day max
prod_ceo_key: 60 requests/min, $25/day max
prod_background_key: 30 requests/min, $10/day max
```

### 3. Observability (Langfuse Dashboard)
```
- See all LLM requests in real-time
- Track costs per agent
- Monitor latency and errors
- Analyze cache hit rates
```

### 4. Cost Tracking (Automatic)
```
- Daily cost reports
- Cost per agent
- Token usage trends
- Budget alerts
```

---

## 🔍 How It Works (Behind the Scenes)

### Current Flow (Phase 1 - Now)
```
Your Agent → OpenAI API → Response
```

### Future Flow (Phase 2 - After Cutover)
```
Your Agent → LiteLLM Gateway → Cache Check
                                    ↓ (if miss)
                                OpenAI API → Response
                                    ↓
                                Langfuse (trace logging)
```

**Your agent doesn't know the difference!** OpenAI SDK works exactly the same.

---

## 📊 Timeline

### Phase 1: NOW (2-3 days)
- **specialagent001:** Build infrastructure
- **Regular dev team:** Build agents normally (in parallel)
- **No conflicts:** Both teams work independently

### Phase 2: LATER (1 day, 4-6 hours)
- **Regular dev team:** Simple env var cutover
- **Manager:** Assign cutover tasks
- **Result:** All agents using LiteLLM gateway

**Total:** 3-4 days

---

## ❓ FAQ

### Q: Should I wait for infrastructure before building agents?
**A: NO!** Keep building agents normally. Infrastructure is being built in parallel.

### Q: Will I need to change my code?
**A: NO!** Just env vars (2 lines per agent group). OpenAI SDK works the same.

### Q: What if infrastructure isn't ready when I finish my agent?
**A: Deploy normally with direct OpenAI.** We'll cutover to LiteLLM later (simple env var change).

### Q: Can I test with LiteLLM before cutover?
**A: Wait for Phase 2.** specialagent001 will test infrastructure first.

### Q: What if something breaks during cutover?
**A: Easy rollback.** Just revert env vars to direct OpenAI.

### Q: Do I need to learn LiteLLM or Langfuse?
**A: NO!** It's transparent. Just use OpenAI SDK as usual.

---

## ✅ Summary for Regular Dev Team

**DO NOW (Phase 1):**
- ✅ Build agents normally (ai-customer, ceo-insights, background agents)
- ✅ Deploy changes to production
- ✅ Use direct OpenAI API (current setup)
- ✅ Continue with assigned tasks (27 tasks)

**DO LATER (Phase 2 - when infrastructure ready):**
- ✅ Update env vars (2 lines per agent group)
- ✅ Deploy updated agents
- ✅ Monitor Langfuse dashboard
- ✅ Verify everything works

**DON'T:**
- ❌ Wait for infrastructure
- ❌ Pause agent development
- ❌ Change env vars yet (wait for Phase 2)
- ❌ Worry about LiteLLM integration (it's transparent)

---

## 📞 Questions?

**Ask Manager (Augment Agent) via:**
- Decision log: `logDecision()` with questions
- Feedback files: `feedback/<your-agent>/YYYY-MM-DD.md`
- GitHub Issues: Link to relevant task

---

**KEEP BUILDING AGENTS - Infrastructure work is happening in parallel!**

