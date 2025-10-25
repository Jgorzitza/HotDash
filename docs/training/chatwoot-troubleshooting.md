# Chatwoot AI Assistant - Troubleshooting Guide

**Version**: 1.0  
**Last Updated**: 2025-10-24  
**Owner**: Support Team  
**Purpose**: Common issues and solutions for customer support agents

---

## Table of Contents

1. [AI Draft Issues](#ai-draft-issues)
2. [System Access Issues](#system-access-issues)
3. [Workflow Issues](#workflow-issues)
4. [Performance Issues](#performance-issues)
5. [FAQ](#faq)
6. [Escalation Procedures](#escalation-procedures)
7. [Resources & Contacts](#resources--contacts)

---

## AI Draft Issues

### Issue: AI Draft Not Appearing

**Symptoms**:
- Customer message received
- No Private Note with AI draft appears
- Waiting >30 seconds with no draft

**Possible Causes**:
1. Agent SDK service is down
2. Webhook not firing
3. Network connectivity issue
4. Message type not supported (e.g., internal note)

**Solutions**:

**Immediate Action**:
1. ✅ **Don't wait** - Respond manually to customer
2. ✅ **Check Agent SDK status**: https://hotdash-agent-service.fly.dev/health
3. ✅ **Report in feedback**: Log the issue in feedback/support/YYYY-MM-DD.md

**Verification Steps**:
```bash
# Check Agent SDK health
curl https://hotdash-agent-service.fly.dev/health

# Expected response: {"status": "healthy"}
```

**If Service is Down**:
- Notify manager immediately
- Continue responding manually
- Document all affected conversations

---

### Issue: AI Draft Quality is Poor

**Symptoms**:
- Draft consistently misunderstands customer
- Tone is inappropriate
- Contains factual errors
- Violates policies

**Possible Causes**:
1. AI needs more training data
2. Customer message is ambiguous
3. Knowledge base is outdated
4. Edge case not covered in training

**Solutions**:

**Short-term**:
1. ✅ **Grade honestly**: Give low grades (1-2) to poor drafts
2. ✅ **Edit or reject**: Don't approve poor quality
3. ✅ **Document patterns**: Note recurring issues in feedback

**Long-term**:
1. ✅ **Provide feedback**: Your grades train the AI
2. ✅ **Report systematic issues**: If same problem occurs >3 times
3. ✅ **Suggest improvements**: Share ideas with manager

**Example Feedback**:
```
AI consistently misunderstands "bulk order" inquiries - suggests retail 
pricing instead of escalating to sales team. Occurred in conversations 
#1234, #1235, #1236.
```

---

### Issue: AI Draft Contains Errors

**Symptoms**:
- Wrong order number
- Incorrect customer name
- Invalid tracking information
- Wrong product details

**Possible Causes**:
1. Data sync issue with Shopify
2. Multiple orders for same customer
3. AI hallucination (making up data)
4. Outdated information

**Solutions**:

**Immediate Action**:
1. ❌ **Never approve** - Reject draft immediately
2. ✅ **Verify data**: Check Shopify Admin for correct information
3. ✅ **Grade low**: Give 1/5 for accuracy
4. ✅ **Report**: Document in feedback with conversation ID

**Prevention**:
- Always verify order numbers before approving
- Cross-check customer details
- Confirm tracking numbers are valid
- Double-check product specifications

---

## System Access Issues

### Issue: Cannot Login to Chatwoot

**Symptoms**:
- Login page loads but credentials rejected
- "Invalid email or password" error
- Account locked message

**Solutions**:

**Step 1: Verify Credentials**
```bash
# Credentials location
vault/occ/chatwoot/super_admin_staging.env

# Check for:
- Correct email address
- Correct password (case-sensitive)
- No extra spaces
```

**Step 2: Clear Browser Cache**
1. Open browser settings
2. Clear cache and cookies for hotdash-chatwoot.fly.dev
3. Close and reopen browser
4. Try logging in again

**Step 3: Try Incognito Mode**
1. Open incognito/private window
2. Navigate to https://hotdash-chatwoot.fly.dev
3. Try logging in
4. If successful, issue is browser-related

**Step 4: Escalate**
- If none of the above work, contact manager
- Provide error message screenshot
- Note time of issue and browser used

---

### Issue: Permission Errors

**Symptoms**:
- "You don't have permission" message
- Cannot access certain conversations
- Cannot send replies

**Solutions**:

**Check Account Role**:
1. Login to Chatwoot
2. Click profile icon (top right)
3. Check role: Should be "Agent" or "Administrator"

**If Role is Incorrect**:
- Contact manager to update permissions
- Provide your email address
- Specify required access level

---

### Issue: Widget Not Loading

**Symptoms**:
- Live chat widget not appearing on website
- Widget shows error message
- Widget loads but doesn't connect

**Solutions**:

**For Customers**:
1. Refresh page
2. Clear browser cache
3. Try different browser
4. Check if ad blocker is interfering

**For Agents**:
1. Check Chatwoot service status: https://hotdash-chatwoot.fly.dev/health
2. Verify widget token in app/root.tsx
3. Check browser console for errors
4. Report to manager if persistent

---

## Workflow Issues

### Issue: Cannot Approve Draft

**Symptoms**:
- "Approve" button disabled
- Grading form not appearing
- Error when submitting approval

**Solutions**:

**Check Requirements**:
1. ✅ Evidence present (AI draft includes reasoning)
2. ✅ Rollback documented (can undo if needed)
3. ✅ Validation passed (no policy violations)

**If Button Still Disabled**:
1. Refresh page
2. Check browser console for errors
3. Try different browser
4. Contact manager if persistent

---

### Issue: Grading Not Saving

**Symptoms**:
- Submit grades but they don't save
- Error message when grading
- Grades reset after page refresh

**Solutions**:

**Immediate Action**:
1. Take screenshot of grades before submitting
2. Note conversation ID
3. Try submitting again
4. If fails, document in feedback

**Verification**:
```bash
# Check if grades were saved
# Navigate to Hot Dash App → Settings → Integrations → Chatwoot
# Find conversation and verify grades appear
```

**If Persistent**:
- Report to manager with conversation IDs
- Include error messages
- Note browser and time of issue

---

### Issue: Reply Not Sending

**Symptoms**:
- Click "Send" but reply doesn't appear
- Error message when sending
- Reply appears but customer doesn't receive it

**Solutions**:

**Step 1: Verify Reply Sent**
1. Check conversation thread
2. Look for blue background (public reply)
3. Verify timestamp

**Step 2: Check Customer Receipt**
- Email: Check sent folder
- Chat: Verify in conversation history
- SMS: Check Twilio logs (if applicable)

**Step 3: Resend if Needed**
1. Copy reply text
2. Create new reply
3. Send again
4. Document duplicate in Private Note

---

## Performance Issues

### Issue: Slow Response Times

**Symptoms**:
- AI drafts taking >30 seconds
- Chatwoot interface slow to load
- Grading submission slow

**Solutions**:

**Check System Status**:
1. Agent SDK: https://hotdash-agent-service.fly.dev/health
2. Chatwoot: https://hotdash-chatwoot.fly.dev/health
3. Hot Dash: https://hotdash-staging.fly.dev/api/monitoring/health

**If All Systems Healthy**:
- Issue may be local network
- Try different network connection
- Close unnecessary browser tabs
- Restart browser

**If Systems Unhealthy**:
- Report to manager immediately
- Continue working manually
- Document affected conversations

---

### Issue: SLA Breaches

**Symptoms**:
- Response time >2 hours (email)
- Response time >5 minutes (chat)
- Multiple conversations overdue

**Solutions**:

**Immediate Action**:
1. ✅ **Respond immediately** (even if late)
2. ✅ **Acknowledge delay**: "Thanks for your patience..."
3. ✅ **Provide full solution**: Don't make customer wait again
4. ✅ **Consider compensation**: 10% discount for significant delays

**Prevention**:
- Check inbox every 30 minutes
- Set up notifications
- Prioritize urgent conversations
- Escalate if overwhelmed

**SLA Breach Protocol**:
1. Respond with apology
2. Provide complete solution
3. Offer discount if appropriate
4. Document breach reason in feedback

---

### Issue: High Conversation Volume

**Symptoms**:
- >20 open conversations
- Cannot keep up with incoming messages
- SLA breaches increasing

**Solutions**:

**Triage Strategy**:
1. **Urgent first**: Legal threats, VIP, damage claims
2. **Quick wins**: Simple order status inquiries
3. **Complex later**: Technical questions, escalations

**Request Help**:
- Notify manager of high volume
- Request additional agent support
- Suggest temporary auto-responses

**Use AI Effectively**:
- Approve good drafts quickly
- Don't over-edit acceptable responses
- Focus human time on complex cases

---

## FAQ

### Q: How long should I wait for an AI draft?

**A**: Wait up to 30 seconds. If no draft appears, respond manually and report the issue.

---

### Q: What if the AI draft is mostly good but has one error?

**A**: Edit the draft to fix the error, then approve. Grade based on the original draft quality (before your edits).

---

### Q: Can I skip grading if I'm busy?

**A**: No. Grading is mandatory for all approved responses. It takes 10 seconds and improves AI quality.

---

### Q: What if I disagree with the AI's approach?

**A**: Reject the draft, write your own response, and grade the AI draft low (1-2). Your feedback teaches the AI.

---

### Q: How do I know if I should escalate?

**A**: Escalate if you see: legal keywords, VIP customers, damage claims, refunds >$500, or if you're unsure.

---

### Q: What if the customer is abusive?

**A**: Tag as "escalated" and "abusive", create Private Note documenting behavior, notify manager immediately.

---

### Q: Can I use the AI draft for SMS responses?

**A**: Yes, but edit for brevity. SMS has 160 character limits. Focus on key information only.

---

### Q: What if I make a mistake and send the wrong response?

**A**: Send immediate follow-up correction, apologize, document in Private Note, notify manager if significant.

---

### Q: How often should I check for new conversations?

**A**: Every 30 minutes minimum. Set up notifications for urgent conversations.

---

### Q: What if the AI suggests a discount I'm not authorized to give?

**A**: Reject the draft, offer standard compensation, escalate to manager if customer requests more.

---

## Escalation Procedures

### When to Escalate

**Immediate Escalation Required**:
- ❗ Legal keywords (chargeback, lawyer, sue, fraud)
- ❗ Product defect causing damage
- ❗ Refund request >$500
- ❗ Abusive/threatening language
- ❗ GDPR/data privacy requests
- ❗ Media/press inquiries

**Escalate if Unsure**:
- Complex technical questions
- Policy exceptions needed
- Unusual customer requests
- Situations not covered in training

### How to Escalate

**Step 1: Tag in Chatwoot**
- Add tags: `escalated`, `needs_ceo`, `urgent`
- Add specific tags: `legal`, `vip`, `damage_claim`, etc.

**Step 2: Create Private Note**
```
ESCALATION REQUIRED

Customer: [Name]
Order: [Order ID]
Issue: [Brief description]
Reason for escalation: [Why escalating]
What I've tried: [Actions taken]
Recommended resolution: [Your suggestion]
Urgency: [High/Medium/Low]
```

**Step 3: Notify Manager**
- Log in feedback/support/YYYY-MM-DD.md
- Include conversation ID
- Note urgency level

**Step 4: Follow Up**
- Check every 2 hours
- Update customer on progress
- Document all communications

### Escalation Response Times

- **Legal/Damage**: <1 hour
- **VIP/Bulk Order**: <4 hours
- **Complex Technical**: <24 hours
- **Policy Exception**: <24 hours

---

## Resources & Contacts

### Documentation

- **Core Training Guide**: docs/training/chatwoot-ai-assistant-guide.md
- **Scenarios & Examples**: docs/training/chatwoot-scenarios-examples.md
- **Quick Reference**: docs/training/chatwoot-quick-reference.md
- **Integration Guide**: docs/support/chatwoot-integration-guide.md
- **CX Team Guide**: docs/runbooks/cx-team-guide.md

### System URLs

- **Chatwoot**: https://hotdash-chatwoot.fly.dev
- **Agent SDK**: https://hotdash-agent-service.fly.dev
- **Hot Dash App**: https://hotdash-staging.fly.dev
- **Health Dashboard**: https://hotdash-staging.fly.dev/api/monitoring/dashboard

### Credentials

- **Location**: vault/occ/chatwoot/
- **Files**:
  - super_admin_staging.env (admin access)
  - agent_credentials.env (agent access)
  - api_token.env (API access)

### Contacts

**Manager**: 
- Email: manager@hotrodan.com
- Slack: #support-team
- Escalations: feedback/support/YYYY-MM-DD.md

**Technical Issues**:
- DevOps Agent: #devops-team
- Engineer Agent: #engineering-team

**Emergency**:
- CEO: justin@hotrodan.com
- Phone: [Emergency contact number]

### Feedback & Reporting

**Daily Feedback File**:
```
feedback/support/YYYY-MM-DD.md

Format:
- Progress on tasks
- Blockers encountered
- System issues
- Improvement suggestions
```

**Issue Reporting Template**:
```
Issue: [Brief description]
Time: [When it occurred]
Conversation ID: [If applicable]
Steps to reproduce: [What happened]
Expected: [What should happen]
Actual: [What actually happened]
Browser: [Chrome/Firefox/Safari]
Screenshot: [If available]
```

---

## Getting Help

**For Training Questions**:
- Review this guide and training materials
- Ask experienced agents
- Contact manager

**For Technical Issues**:
- Check troubleshooting steps above
- Verify system status
- Report in feedback file
- Escalate if urgent

**For Policy Questions**:
- Review CX Team Guide
- Check with manager
- Escalate if unsure

**For Urgent Issues**:
- Notify manager immediately
- Document in feedback
- Continue working manually if possible

---

**Remember**: When in doubt, escalate. It's better to ask than to make a mistake. Your manager is here to support you.

**Last Updated**: 2025-10-24  
**Next Review**: Monthly or as needed based on feedback

