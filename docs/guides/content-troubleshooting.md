# Content System Troubleshooting

**Owner:** Content Agent  
**Date:** 2025-10-19

## Common Issues

### "Post failed to schedule"

**Cause:** Publer API error or invalid data
**Fix:**

1. Check Publer health: `runPublerHealthCheck()`
2. Validate post data against schema
3. Check rate limits
4. Review error logs

### "Tone validation failing"

**Cause:** Post doesn't meet brand voice guidelines
**Fix:**

1. Review tone-validator.ts rules
2. Add conversational words ("you", "we")
3. Remove spammy language
4. Include clear CTA

### "Metrics not updating"

**Cause:** Analytics fetcher not running or Publer API issue
**Fix:**

1. Check cron job status
2. Verify Publer access token valid
3. Check webhook delivery
4. Manual fetch: `fetchPostMetrics(post_id)`

### "Approval not showing in drawer"

**Cause:** Not properly submitted or state incorrect
**Fix:**

1. Verify `createContentApproval()` called
2. Check approval.state === "pending_review"
3. Ensure `submitApproval()` succeeded
4. Check Supabase insert

## Error Codes

- `RATE_LIMIT`: Wait until reset time, then retry
- `AUTH_ERROR`: Refresh token or re-authenticate
- `NETWORK_ERROR`: Check connection, retry with backoff
- `VALIDATION_ERROR`: Fix post data, check schema

## Escalation

If blocked >10 minutes:

1. Log error in feedback/content/YYYY-MM-DD.md
2. Include exact error + attempted fixes
3. @mention manager in Issue
4. Propose next step
