# Data Handling Summary — Hootsuite POC

## Data Categories (to confirm with vendor)
| Data Type | Description | Purpose | Notes |
| --- | --- | --- | --- |
| Mentions | _TBD — expected: social posts, comments, DMs metadata_ | Feed sentiment dashboards & alerts | Confirm platform coverage + redaction policy |
| Sentiment scores | _TBD — vendor classifier output_ | Drive trend lines & anomaly detection | Ensure model confidence included |
| Engagement metrics | _TBD — likes, shares, clicks per mention_ | Marketing campaign reporting | Validate aggregation windows |

## Storage & Residency
- **Primary region:** _TBD (target: vendor provides region + subprocessor list)_
- **Replication:** _Note any secondary regions or CDN use._
- **Encryption:** _Capture at-rest and in-transit guarantees (AES-256, TLS 1.2+, etc.)._

## Retention & Deletion
- **Vendor retention limit:** _Target ≤90 days; confirm actual policy and configurable settings._
- **HotDash retention:** _Document local copy duration (logs, monitoring data) and purge job cadence._
- **Deletion workflow:**
  1. _Vendor request path (support ticket / API)._ 
  2. _Internal owner triggering deletion._
  3. _Verification evidence (support confirmation, logs)._ 

## Access Controls
- **OAuth scopes:** _List granted scopes from Shopify app install screen._
- **Admin users:** _Document named accounts, 2FA state, quarterly review trigger._
- **API tokens:** _Record rotation cadence aligned with secret runbook (90 days)._ 

## Outstanding Questions
1. Does vendor store raw payloads beyond HotDash retention target?
2. Are sentiment scores derived on vendor infrastructure only, or can we request on-prem processing?
3. Can vendor suppress or anonymize PII before delivery?

> Update each placeholder once HS-44721 questionnaire responses are received; attach supporting evidence snapshots alongside this summary.
