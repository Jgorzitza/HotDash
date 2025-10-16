
# Agent Shutdown (Restart‑safe)

> **Order of operations:** Agents shut down **first**, then the Manager runs their shutdown.  
> Goal: a **clean restart** where any agent can resume with zero hidden context.

---

## 0) Save State (≤ 1 min)
- [ ] Do NOT commit/push. Manager will handle git operations.
- [ ] Ensure your feedback file contains the latest evidence and the completion block if applicable.
- [ ] If a PR already exists, double-check its body includes:
  - `Refs #<issue>` or `Fixes #<issue>` (when DoD is fully met)
  - `Allowed paths: <pattern(s)>`

---

## 1) CI & Sandbox (≤ 1 min)
- [ ] Diffs stay **within Allowed paths** (Danger will enforce on PR).
- [ ] No new `.md` outside allow-list (Docs Policy will fail otherwise).
- [ ] **Dev mode safety:** Do **not** send customer messages, take payments, or run production Shopify mutations.  
      If the UI needed sample “approvals,” ensure they are **fixtures** only:
      `provenance.mode="dev:test"`, include `feedback_ref`, and **Apply disabled**.

---

## 2) Feedback — Final Entry for Today (2–4 min)
Open `feedback/<agent>/<YYYY‑MM‑DD>.md` and append this block:

```md
### Shutdown — <HH:MM> (local time)

**Status**
- Task / Issue: #<id> — PR: #<id or draft> — Branch: agent/<agent>/<molecule>
- DoD completion: <percent or checklist state>
- What changed since last entry: <1–3 bullets>

**Evidence**
- Tests/logs/screens: <links or short notes>
- Tool calls (MCP/adapters) used: <list>

**Blockers**
- <concise description> → **owner**: <me/manager/other> — **ETA**: <date/time>

**Next‑start plan (first 1–2 actions)**
1) …
2) …

**Self‑grade (1–5)**
- Progress vs DoD: <1–5>
- Evidence quality: <1–5>
- Alignment (North Star / Rules / Allowed paths): <1–5>
- Tool discipline (MCP‑first, no freehand, no secrets): <1–5>
- Communication (feedback clarity & cadence): <1–5>

**Retrospective**
- 2–3 things I did well today:
  1) …
  2) …
- 1–2 things to do differently tomorrow:
  1) …
- **One thing I will stop entirely:** …
```

> Keep it concise but specific. The Manager will rely on this to set tomorrow’s direction and unblock you immediately.
> Copy/paste the template to avoid missing sections.

---

## 3) Handoff to Manager (≤ 1 min)
- [ ] Verify your feedback file is up to date.
- [ ] Manager will create/refresh PR and handle CI/review/merge. Do not open or update PRs yourself.

---

## 4) Local Clean‑up (≤ 1 min)
- [ ] Close terminals connected to secrets/tunnels; ensure `.env*` not staged.
- [ ] Stop any local services you started (db, tunnels, dev servers).

---

## 5) Signal Manager
- [ ] Post a one‑liner in the **Issue comment**: “Shutdown complete — see latest feedback entry for status/next-start plan.”
- [ ] @mention the Manager if a blocker needs immediate attention.

---

## Appendix — Quick Commands (optional)
```bash
# Show changed files quickly
git status -s

# Create or mark draft PR via GitHub CLI (manager-controlled)
gh pr create --draft --fill || gh pr ready --undo  # toggle draft state (manager only)

# Manager will execute pushes/merges; agents should refrain from running git push.
```
