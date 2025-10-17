# Playwright Coverage Plan — CX Escalations & Sales Pulse (Draft 2025-10-09)

## Scope

- CX Escalations modal flows: open → approve → escalate → resolve.
- Sales Pulse modal (pending implementation) focus on chart + action buttons.

## Test Matrix

| Scenario                    | Data Setup                                      | Assertions                                                           |
| --------------------------- | ----------------------------------------------- | -------------------------------------------------------------------- |
| Approve templated reply     | Seed conversation with `ship_update` suggestion | Button enabled, decision log request emitted, toast confirms send    |
| Escalate to manager         | SLA breach + missing template                   | Escalation tag applied, audit log action `chatwoot.escalate` present |
| Missing suggestion fallback | Conversation without heuristics keywords        | Approve disabled, guidance text visible                              |
| Sales Pulse anomaly         | Mock data toggles anomaly flag                  | Modal copy matches English-only deck, telemetry event fired          |

## Fixtures Needed

- Staging Chatwoot conversation seeds (shipping + refund).
- Decision log Supabase access for assertion step.
- Mock Sales Pulse dataset with anomaly toggle.

## Next Steps

1. Convert matrix to Playwright specs once staging data arrives.
2. Coordinate with engineering on telemetry hook to assert network payload.
3. Archive run artifacts under `test-results/playwright/2025-10-xx/` for QA evidence.
