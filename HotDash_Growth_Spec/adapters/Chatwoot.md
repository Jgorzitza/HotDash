# Chatwoot Adapter

## Webhooks
- `message.created`: incoming customer message → intent classification → candidate `CW_REPLY_DRAFT` Action.
- `conversation.status_changed`: finalize outcomes when tickets close.

## Macros
- Provide a one-click macro: Approve reply → send message → attach cart link → tag conversation → close or snooze.

## Reply Constraints
- Facts must originate from our KB (metaobjects + how-to articles). No external claims.
- Tone: concise, confident, practical. Include safety notes where applicable.

## Logging
- Save the final reply, operator edits (diff), and resolution time.
