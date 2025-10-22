# Agent Shutdown (Restart‑safe)

> **Order of operations:** Agents shut down **first**, then the Manager runs their shutdown.  
> Goal: a **clean restart** where any agent can resume with zero hidden context.

---

## 0) Save State (≤ 1 min) [DATABASE-DRIVEN]

- [ ] Do NOT commit/push. Manager will handle git operations.
- [ ] Log final status via `logDecision()`:
  ```typescript
  await logDecision({
    scope: 'build',
    actor: '<your-agent>',
    taskId: '{TASK-ID}',
    status: 'completed',  // or 'in_progress', 'blocked'
    progressPct: 100,     // or current %
    action: 'shutdown',
    rationale: 'Shutdown - {TASK-ID} {status}, {evidence summary}',
    evidenceUrl: 'artifacts/<agent>/2025-10-22/final-status.md',
    durationActual: 4.5,
    nextAction: 'Resume testing tomorrow' // or 'Task complete'
  });
  ```
- [ ] (Optional) Ensure markdown feedback file has final notes if needed
- [ ] Ensure PR body includes:
  - `Refs #<issue>` or `Fixes #<issue>` (when DoD is fully met)
  - A line: `Allowed paths: <pattern(s)>`

---

## 1) CI & Sandbox (≤ 1 min)

- [ ] Diffs stay **within Allowed paths** (Danger will enforce on PR).
- [ ] No new `.md` outside allow-list (Docs Policy will fail otherwise).
- [ ] **Dev mode safety:** Do **not** send customer messages, take payments, or run production Shopify mutations.  
       If the UI needed sample “approvals,” ensure they are **fixtures** only:
      `provenance.mode="dev:test"`, include `feedback_ref`, and **Apply disabled**.

---

## 2) Final Progress Report (≤ 2 min) [DATABASE-DRIVEN]

**PRIMARY: Log shutdown status via `logDecision()`**:

```typescript
import { logDecision } from '~/services/decisions.server';

await logDecision({
  scope: 'build',
  actor: '<your-agent>',
  taskId: '{TASK-ID}',
  status: 'in_progress',        // or 'completed' if done
  progressPct: 75,              // Current progress
  action: 'shutdown',
  rationale: 'Shutdown - {TASK-ID} at 75%, tests passing, ready to resume tomorrow',
  evidenceUrl: 'artifacts/<agent>/2025-10-22/shutdown-status.md',
  durationActual: 6.5,          // Total hours today
  nextAction: 'Resume integration testing tomorrow morning',
  blockerDetails: 'None',       // or describe blockers
  blockedBy: null               // or dependency task ID
});
```

**OPTIONAL: Markdown backup** (if you want detailed notes):

Open `feedback/<agent>/<YYYY‑MM‑DD>.md` and append shutdown notes if desired.

**Manager Visibility**: 
- Manager runs `query-agent-status.ts` to see your shutdown status instantly
- Manager runs `query-blocked-tasks.ts` to see if you're blocked
- No need to read your entire markdown file

> **Why this matters**: Manager sees your status in < 1 second instead of reading your file.

---

## 3) Handoff to Manager (≤ 1 min) [DATABASE-DRIVEN]

- [ ] Verify you logged shutdown via `logDecision()` (step 2 above)
- [ ] Manager will query your status via `query-agent-status.ts` (< 1 sec)
- [ ] (Optional) Post in Issue comment if urgent blocker needs attention
- [ ] Manager will create/refresh PR and handle CI/review/merge.

**Manager sees your status instantly via database queries** - no need to announce.

---

## 4) Local Clean‑up (≤ 1 min)

- [ ] Close terminals connected to secrets/tunnels; ensure `.env*` not staged.
- [ ] Stop any local services you started (db, tunnels, dev servers).

---

## 5) Signal Manager [DATABASE-DRIVEN]

- [ ] Your `logDecision()` call automatically signals Manager (they query the database)
- [ ] Only @mention Manager in Issue if **urgent blocker** needs immediate attention
- [ ] Otherwise, Manager will see your status in next query (< 1 second)

**Database = automatic signaling** - Manager checks `query-agent-status.ts` during shutdown.

---

## Appendix — Quick Commands (optional)

```bash
# Show changed files quickly
git status -s

# Push current branch
git push -u origin HEAD

# Create or mark draft PR via GitHub CLI (if you use it)
gh pr create --draft --fill || gh pr ready --undo  # toggle draft state
```
