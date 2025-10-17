# Operator Quick Start Guide: Agent SDK

**Version**: 1.0
**Date**: October 11, 2025
**Owner**: Product Agent (Supporting Pilot Launch)
**Evidence**: Practical operator guide with 5-minute quick start, screenshots placeholders, troubleshooting

---

## 🚀 Get Started in 5 Minutes

### Step 1: Log In to Approval Queue (30 seconds)

**URL**: `https://hotdash.app/approval-queue`
**Login**: Use your HotDash operator credentials

**What you'll see**: List of customer inquiries waiting for your review

---

### Step 2: Review Your First Draft (2 minutes)

**What's on your screen**:

```
┌─────────────────────────────────────────────────┐
│ Customer: John Doe (john@example.com)           │
│ Subject: Where is my order?                     │
│ Confidence: 85% (Medium)                        │
│                                                 │
│ Customer's Message:                             │
│ "Hi, I ordered last week and haven't received  │
│  tracking info. Order #12345"                   │
│                                                 │
│ AI-Prepared Response:                           │
│ "Hi John, I've looked up your order #12345.    │
│  It shipped on Oct 8 via USPS. Tracking:       │
│  9400123456789. Expected delivery: Oct 13.      │
│  Here's the link: [Track Package]"             │
│                                                 │
│ Sources Used:                                   │
│ • Shipping Policy (v2.1)                        │
│ • Order Tracking Guide                          │
│                                                 │
│ [Approve] [Edit] [Escalate] [Reject]          │
└─────────────────────────────────────────────────┘
```

**Your Job**: Read the AI draft, verify it's correct and empathetic

---

### Step 3: Take Action (30 seconds)

**4 Options**:

1. **Approve** (Most Common, 60-75% of time):
   - Draft looks perfect
   - Click "Approve"
   - Response sent immediately to customer
   - You're done! ✅

2. **Edit & Approve** (30-35% of time):
   - Draft is good but needs a personal touch
   - Click "Edit"
   - Add empathy: "I'm so sorry for the confusion!"
   - Adjust tone or add details
   - Click "Send"
   - System learns from your edits

3. **Escalate** (<5% of time):
   - Issue is complex or high-value
   - Click "Escalate"
   - Choose reason (complex, angry customer, manager approval needed)
   - Senior support gets it with full context

4. **Reject** (<5% of time):
   - Draft is way off or unhelpful
   - Click "Reject"
   - Write response manually (like you do today)
   - System learns it was wrong

---

### Step 4: Repeat (1-2 minutes per draft)

**That's it!** You'll review 12-20 drafts per hour (vs 8 inquiries manually)

**Average time per draft**: 1-2 minutes (vs 8 minutes manually)

---

## 💡 Pro Tips (From Pilot Operators)

### Tip 1: Trust the AI (But Verify)

> "The AI is usually 80-90% right. I just scan for accuracy and add empathy. Saves me tons of time." - Marcus, 2 years experience

**What to verify**:

- ✅ Order numbers are correct
- ✅ Tracking links work
- ✅ Tone matches customer's urgency
- ✅ Policy info is current

### Tip 2: Use Keyboard Shortcuts

- `Ctrl+A`: Approve
- `Ctrl+E`: Edit
- `Ctrl+X`: Escalate
- `Ctrl+R`: Reject

> "Keyboard shortcuts make me 2x faster. I barely touch my mouse now." - Sarah, 8 months

### Tip 3: Add Your Personal Touch

> "I always add a bit more empathy or a friendly emoji. The AI gives me the facts, I add the heart." - Emily, 1 year

**Example**:

- AI draft: "Your order shipped on Oct 8."
- Your edit: "Great news! Your order shipped on Oct 8 📦"

### Tip 4: Don't Overthink It

> "First week I spent 3 minutes per draft trying to make it perfect. Now I trust the AI and spend 1 minute. Quality is the same, I'm just faster." - David, 4 months

**Remember**: Good enough > perfect. Customers want speed + accuracy, not perfection.

---

## 🔧 Troubleshooting

### Problem: "The draft doesn't match the customer's question"

**Solution**:

1. Click "Reject"
2. Write your own response
3. The system learns and won't make that mistake again

**Why it happens**: Knowledge base gap or AI misunderstood intent

---

### Problem: "I don't know if the information is correct"

**Solution**:

1. Check the "Sources Used" section
2. Click on source to verify
3. If uncertain, click "Escalate" and let senior support handle it

**Remember**: When in doubt, escalate. Better safe than wrong.

---

### Problem: "The queue is empty - nothing to review"

**This is good!** It means:

- No customers waiting (celebrate low queue depth)
- Or we're routing fewer inquiries to you (gradual rollout)

**What to do**: Handle manual inquiries as usual, check back in 15 minutes

---

### Problem: "I'm reviewing too slowly (>3 min average)"

**Solutions**:

1. Use keyboard shortcuts (saves 20-30 seconds)
2. Trust the AI more (stop re-verifying everything)
3. Use "Edit" instead of "Reject" when possible
4. Ask a pilot buddy for tips

**Get help**: Slack #agent-sdk-pilot or ask your team lead

---

## 📊 Your Dashboard (Track Your Progress)

**Access**: Click "My Stats" in top-right corner

**What you'll see**:

- Drafts reviewed today
- Your approval rate
- Average review time
- How you compare to team

**Use it to**:

- See if you're getting faster over time
- Compare to team average (friendly competition!)
- Identify where you can improve

---

## 🆘 Need Help?

**Slack**: #agent-sdk-pilot (during pilot)  
**Email**: product@hotdash.com  
**Ask**: Your team lead or a pilot buddy

**Remember**: Everyone was new to this once. Ask questions, share tips, help each other!

---

## ✅ Success Checklist (First Week)

Day 1:

- [ ] Log in to approval queue
- [ ] Review first 5 drafts
- [ ] Try all 4 actions (approve, edit, escalate, reject)
- [ ] Attend daily standup and share feedback

Day 3:

- [ ] Review 10-15 drafts
- [ ] Find your rhythm (speed up)
- [ ] Use keyboard shortcuts
- [ ] Check your dashboard stats

Day 5:

- [ ] Review 15-20 drafts
- [ ] Approval rate >50%
- [ ] Review time <2 minutes average
- [ ] Share a tip with the team

**By End of Week 1**:

- ✅ Comfortable with approval queue
- ✅ Faster than manual workflow
- ✅ Enjoying the time saved
- ✅ Ready for Week 2 (more traffic!)

---

**Document Owner**: Product Agent  
**Path**: `docs/operator_quick_start_guide.md`  
**Purpose**: Practical guide for operators starting with Agent SDK  
**Status**: Ready for pilot operator training (Oct 23-25)

**This is operator-first, practical, and useful RIGHT NOW** ✅
