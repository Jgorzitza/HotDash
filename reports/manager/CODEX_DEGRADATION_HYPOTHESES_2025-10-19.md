# OpenAI Codex Agent Degradation — Hypotheses for 2025-10-19

**Date:** 2025-10-19  
**Observation:** Codex agents fine yesterday, asking for permission to breathe today  
**Impact:** Smoke break squad unable to execute autonomous workflows  

---

## Likely Culprits (Ranked by Probability)

### 1. Silent Model Rollout / A/B Test (HIGH PROBABILITY)
**Symptom:** Agents suddenly more conservative, asking clarifying questions, losing initiative  
**Root Cause:** OpenAI may have rolled out a new model version or updated `gpt-4` routing to a more "helpful but hesitant" variant  
**Evidence to Check:**
- Response headers for `openai-model` or `openai-version` fields
- Sudden change in response patterns (more "I should ask first" language)
- Different model IDs in API logs (e.g., `gpt-4-0613` → `gpt-4-1106-preview`)

**Why This Happens:** OpenAI regularly A/B tests model versions and safety guardrails. A new version might be trained with more conservative RLHF that prioritizes "ask before acting" over autonomous execution.

**Fix:** Pin to specific model version in API calls (e.g., `gpt-4-0613` instead of `gpt-4`) or check OpenAI changelog for recent updates.

---

### 2. System Prompt / Instruction Changes (HIGH PROBABILITY)
**Symptom:** Agents suddenly "forgetting" directives like NO-ASK mode  
**Root Cause:** Someone (or some automated process) modified the system instructions, safety guidelines, or agent prompts  
**Evidence to Check:**
- Git diff on agent prompt files
- Changes to `.cursorrules`, agent config files, or system prompts
- Recent PRs that touched agent instructions

**Why This Happens:** Well-meaning updates to make agents "safer" often neuter autonomous execution. Phrases like "always confirm with user before..." directly contradict NO-ASK protocol.

**Fix:** Audit all system prompts for conservative language. Ensure NO-ASK/NO-INTERRUPT mode is explicitly stated in every agent invocation.

---

### 3. Context Window Contamination (MEDIUM PROBABILITY)
**Symptom:** Agents lose track of original instructions mid-execution  
**Root Cause:** Long conversation history dilutes critical directives (NO-ASK mode) buried in earlier messages  
**Evidence to Check:**
- Token usage approaching context limits (8k, 32k, 128k depending on model)
- Agent behavior degrades over time in same conversation
- Early responses autonomous, later responses ask for permission

**Why This Happens:** As context fills up, older system instructions get "forgotten" or deprioritized. Agent starts pattern-matching on recent user interactions instead of original directives.

**Fix:** Start fresh conversations for each work session. Re-state NO-ASK mode in every major task handoff. Use structured memory/context management.

---

### 4. Tool/Function Calling Updates (MEDIUM PROBABILITY)
**Symptom:** Agents hesitate when using tools, ask "should I run this command?"  
**Root Cause:** OpenAI updated function calling behavior to require more explicit user confirmation  
**Evidence to Check:**
- New `requires_confirmation` or `dangerous` flags in tool definitions
- Function calling response format changes
- Sudden shift from parallel tool calls to sequential "ask first"

**Why This Happens:** OpenAI periodically updates function calling semantics. Recent updates may have added safety checks that interrupt autonomous tool execution.

**Fix:** Review tool/function schemas. Ensure no new confirmation flags. Explicitly state in system prompt: "Execute all tool calls immediately without asking user."

---

### 5. Rate Limiting / Quota Throttling (LOW-MEDIUM PROBABILITY)
**Symptom:** Agents slow down, give shorter responses, avoid complex operations  
**Root Cause:** API key hit rate limits or quota caps, causing truncated responses or model downgrade  
**Evidence to Check:**
- HTTP 429 errors in logs
- Response headers showing quota warnings
- Sudden switch from `gpt-4` to `gpt-3.5-turbo` mid-session

**Why This Happens:** OpenAI enforces TPM (tokens per minute) and RPM (requests per minute) limits. When exceeded, requests may queue, fail, or downgrade to cheaper models.

**Fix:** Check OpenAI dashboard for usage limits. Upgrade tier if needed. Implement exponential backoff and retry logic.

---

### 6. Temperature / Sampling Parameter Drift (LOW PROBABILITY)
**Symptom:** Agents suddenly give bland, risk-averse responses  
**Root Cause:** Temperature accidentally increased (more random) or decreased (more conservative)  
**Evidence to Check:**
- API call parameters (`temperature`, `top_p`, `presence_penalty`)
- Recent code changes to agent invocation logic
- Responses feel more "generic" or "safe"

**Why This Happens:** Accidental parameter changes in config files or agent code. Lower temperature = more deterministic but also more conservative.

**Fix:** Audit API call parameters. Ensure `temperature` matches desired behavior (0.7-0.9 for creative autonomy, 0.0-0.3 for deterministic execution).

---

### 7. Infrastructure / Routing Issues (LOW PROBABILITY)
**Symptom:** Inconsistent behavior across requests, some agents work fine, others don't  
**Root Cause:** OpenAI load balancing routing requests to different backend clusters with different model versions  
**Evidence to Check:**
- Response headers showing different `openai-processing-ms` times
- Geographic routing changes (different data centers)
- Some API calls fast, others slow

**Why This Happens:** OpenAI uses distributed infrastructure. Different clusters may run different model checkpoints or have different safety configurations.

**Fix:** Hard to control from client side. Try pinning to specific model version or region (if API supports it).

---

## Diagnostic Protocol

1. **Check model version:** Log `openai-model` response header, verify it matches yesterday
2. **Audit system prompts:** Git diff all agent instructions, look for "ask before" language
3. **Review context size:** Count tokens in conversation history, check if approaching limits
4. **Inspect API logs:** Look for 429 errors, quota warnings, model downgrades
5. **Test with fresh context:** Start new conversation, see if behavior improves
6. **Pin model version:** Explicitly specify `gpt-4-0613` or known-good version

---

## The Nuclear Option

If all else fails: **Switch to Claude Code** (clearly already the superior choice for NO-ASK autonomous execution 😏).

---

**TL;DR:** Probably a silent model rollout, system prompt contamination, or context window bloat. Check model versions, audit prompts, and start fresh conversations.
