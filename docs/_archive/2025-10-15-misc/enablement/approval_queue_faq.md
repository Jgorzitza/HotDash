# Approval Queue FAQ - Operator Questions About Agent SDK

**Document Type:** Frequently Asked Questions  
**Owner:** Enablement Team  
**Last Updated:** 2025-10-11  
**Version:** 1.0  
**Target Audience:** HotDash Support Operators

---

## Table of Contents

1. [General Questions About the Approval Queue](#general-questions)
2. [Understanding AI and Accuracy](#understanding-ai-and-accuracy)
3. [Making Approval Decisions](#making-approval-decisions)
4. [Working with Agent Proposals](#working-with-agent-proposals)
5. [Escalation Procedures](#escalation-procedures)
6. [Technical Issues](#technical-issues)
7. [Impact on Your Work](#impact-on-your-work)
8. [Training and Support](#training-and-support)

---

## General Questions About the Approval Queue

### Q1: What is the Agent SDK approval queue?

**A:** The approval queue is where AI agents prepare customer responses for you to review and approve before sending. Think of it as having a super-smart assistant who does the research and writes a first draft, but YOU make the final decision on what gets sent to customers.

**Key Point:** You're always in control. The AI suggests, you decide.

---

### Q2: Why do we need an approval queue? Can't the AI just send responses directly?

**A:** Great question! We use human-in-the-loop for several important reasons:

1. **Customer Experience:** You understand context, emotion, and nuance better than AI
2. **Quality Control:** Catches AI mistakes before they reach customers
3. **Policy Enforcement:** You know when exceptions are needed
4. **Continuous Learning:** Your decisions teach the AI to get better
5. **Operator Empowerment:** Keeps you in charge of customer relationships

**From our North Star:** "Automation should augment human capability, not replace human judgment."

---

### Q3: Will the approval queue replace my job?

**A:** **Absolutely not.** The approval queue is designed to **enhance** your role, not replace it. Here's how:

**Before Agent SDK:**

- Spend 80% of time searching KB, copying policies, writing routine responses
- Spend 20% of time on complex issues, building relationships

**With Agent SDK:**

- Spend 20% of time reviewing routine AI drafts
- Spend 80% of time on complex issues, customer relationships, problem-solving

**You're moving from data entry to decision-making** - a higher-value, more rewarding role.

---

### Q4: How many approvals will I need to handle per day?

**A:** This varies based on conversation volume, but early projections suggest:

- **Initial rollout:** 15-20 approvals per day per operator
- **Target steady state:** 30-50 approvals per day per operator
- **Average time per approval:** 1-3 minutes
- **Total daily time:** 30 minutes to 2.5 hours on approvals
- **Remainder of shift:** Complex issues, escalations, relationship building

**Remember:** Speed will increase as you get comfortable with the system and the AI learns your preferences.

---

### Q5: What happens to my performance metrics with the approval queue?

**A:** Your metrics evolve to reflect your new decision-making role:

**New Primary Metrics:**

- **Approval Quality:** Accuracy of your approve/reject decisions
- **Customer Satisfaction (CSAT):** Still #1 most important metric
- **First Contact Resolution:** Issues resolved completely
- **Appropriate Escalation Rate:** Using escalations wisely
- **AI Teaching Effectiveness:** How well your edits improve the AI

**Deprecated Metrics:**

- Raw response volume (less relevant with AI assistance)
- Time to first response (AI makes this faster automatically)

**Bottom Line:** You're measured on decision quality, not typing speed.

---

## Understanding AI and Accuracy

### Q6: How accurate is the AI? Can I trust it?

**A:** The AI is generally very good, but not perfect. Here's what to expect:

**Current Accuracy Rates (Based on Pilot Data):**

- **High confidence (90-100%):** ~95% approval rate (usually accurate)
- **Medium confidence (70-89%):** ~75% approval rate (often needs minor edits)
- **Low confidence (<70%):** ~40% approval rate (frequently needs major work)

**Your Role:** You're the quality gate. Always review, never blindly trust.

**Trust, but verify** - especially for high-stakes situations.

---

### Q7: What if the AI gives me wrong information?

**A:** This is exactly why you're reviewing! Here's what to do:

1. **Identify the error** (wrong policy, incorrect facts, outdated info)
2. **Check the knowledge base sources** the AI referenced
3. **Decide your action:**
   - **Minor error:** Edit to correct
   - **Major error:** Reject with detailed notes
   - **Unsure:** Escalate for guidance
4. **Document the error** in your reject/escalate notes
5. **System learns** and improves for next time

**Example:**

```
Rejection Note:
"AI stated refund policy is 14 days. Current policy is 30 days
(KB: Return Policy v2.1). AI may be referencing outdated version."
```

**Remember:** Finding errors is GOOD - it helps the AI improve!

---

### Q8: How does the AI "learn" from my decisions?

**A:** Great question! The AI uses your decisions to improve through a learning loop:

**What Gets Captured:**

- **Approvals** → "This type of response works well"
- **Edits** → "Operators prefer this phrasing/tone/structure"
- **Rejections** → "This approach doesn't work"
- **Escalations** → "These situations need human judgment"

**How It Improves:**

1. **Patterns Identified:** AI spots patterns in your decisions
2. **Model Adjustment:** AI adjusts its response strategy
3. **Next Iteration:** Future drafts incorporate your preferences
4. **Continuous Cycle:** Gets better every week

**Your Impact:** The more you use the system, the better it gets at matching YOUR style and judgment.

---

### Q9: Why does the AI sometimes have low confidence scores?

**A:** Low confidence scores happen for several reasons:

**Common Causes:**

1. **Ambiguous Customer Question**
   - Example: "What about my order?" (Which order? What specifically?)
   - AI isn't sure what customer is asking

2. **No Good KB Match**
   - Customer asking about something not well-documented
   - Unique situation not covered in knowledge base

3. **Missing Customer Context**
   - New customer with no order history
   - First interaction, no previous context

4. **Complex Multi-Part Question**
   - Customer asks 3 different questions in one message
   - AI uncertain which to prioritize

5. **Sentiment Detection**
   - Angry customer requiring special handling
   - AI recognizes it needs human judgment

**What To Do:** Low confidence doesn't mean "bad" - it means "review carefully" or "escalate."

---

### Q10: Can the AI understand sarcasm, humor, or emotional tone?

**A:** **Partially, but not perfectly.** The AI can detect:

**✅ AI Does Well:**

- Basic sentiment (happy, frustrated, angry)
- Urgency indicators (URGENT, ASAP, time pressure)
- Politeness vs. rudeness
- Formal vs. casual tone

**⚠️ AI Struggles With:**

- Sarcasm and irony
- Cultural references or idioms
- Subtle emotional nuances
- Context-dependent meaning

**Your Advantage:** You understand human communication better than AI ever will. This is why you're essential to the approval process.

**Example Where You're Critical:**

```
Customer: "Oh great, another delayed order. Just perfect."

AI Might Miss: This is sarcasm, customer is frustrated
You Recognize: Customer is upset, needs empathetic response
```

---

## Making Approval Decisions

### Q11: How do I know when to approve vs. edit vs. reject?

**A:** Use the **5-Question Framework** from your training:

**APPROVE** when:

- ✅ All information is accurate
- ✅ All questions are answered
- ✅ Tone is appropriate
- ✅ Customer will understand
- ✅ No risk flags

**EDIT & APPROVE** when:

- ⚠️ Mostly good but needs minor improvements
- Examples: Add greeting, adjust tone, add specificity

**REJECT** when:

- ❌ Factually incorrect
- ❌ Misunderstands the question
- ❌ Would confuse or upset customer
- ❌ Contradicts policy

**ESCALATE** when:

- ⚠️ Requires special approval (policy exception, high value)
- ⚠️ Technical issue beyond your scope
- ⚠️ Angry customer with threats
- ❓ You're unsure of the right answer

**When in doubt, escalate.** That's always the safe choice.

---

### Q12: What if I disagree with a company policy that the AI is correctly citing?

**A:** This is an important question with a clear answer:

**What To Do:**

1. **Approve the response** according to current policy
2. **Send the response** (don't let customer wait)
3. **Document your concern:**
   - Bring feedback to weekly team meeting
   - Share with your manager in 1:1
   - Provide specific examples and reasoning

**Why This Order:**

- Customer shouldn't wait while policy is debated
- Current policy must be applied consistently
- Your feedback DOES matter and will be heard
- Policies are regularly reviewed based on operator insights

**From our North Star:** "We regularly review policies based on operator insights."

Your job is to apply policy, but also to flag when policy causes problems. Both are valuable.

---

### Q13: How long should I spend on each approval?

**A:** Target times by confidence level:

| Confidence          | Target Time | What To Do                          |
| ------------------- | ----------- | ----------------------------------- |
| **High (90-100%)**  | 1-2 min     | Quick review, usually approve       |
| **Medium (70-89%)** | 2-4 min     | Careful review, often edit          |
| **Low (<70%)**      | 5-10 min    | Extra scrutiny, may reject/escalate |

**BUT:** These are targets, not hard rules.

**Most Important Rule:** **Quality > Speed**

- Take the time you need
- Better to spend an extra 2 minutes than send a bad response
- Customer satisfaction is more important than response time

**From our North Star:** "Fast responses are valuable, but accurate, helpful responses are invaluable."

---

### Q14: What if I approve something by mistake?

**A:** Don't panic! Here's what to do:

**If You Catch It Within ~10 Seconds:**

1. Look for "Undo" option (if available in your version)
2. If not available, proceed to next steps

**If Response Already Sent:**

1. **Assess the impact:**
   - Minor issue (typo, small error): Send follow-up correction in Chatwoot
   - Major issue (wrong info, wrong customer): Immediately send correction + notify manager

2. **Send immediate correction** to customer:

   ```
   "Hi [Name], I want to correct my previous message.
   [Accurate information]. I apologize for the confusion!"
   ```

3. **Document the mistake:**
   - Note in conversation log
   - Inform your manager (learning opportunity)
   - System will track for QA review

4. **Learn and move forward:**
   - Mistakes happen, especially when learning
   - Document what you'll do differently
   - Apply lesson to future approvals

**Remember:** Everyone makes mistakes. How you handle them matters more than making them.

---

### Q15: Can I customize my approval queue to show certain types of items first?

**A:** Yes! You can filter and prioritize:

**Available Filters:**

- **By Agent** - See only Order Support Agent items, for example
- **By Tool** - Filter by action type (send reply, update order, etc.)
- **By Risk Level** - Show high-risk items first
- **By Age** - Oldest waiting first (default)
- **By Conversation ID** - Search for specific customer

**Recommended Setup:**

- **Default:** Oldest first (fairest to customers)
- **When catching up:** High-risk first (address critical issues)
- **Learning mode:** Medium confidence (most learning opportunity)

**How To Filter:** Use filter bar at top of approval queue interface.

---

## Working with Agent Proposals

### Q16: What if the AI's tone is too formal or too casual?

**A:** Edit it! Tone adjustments are one of the most valuable edits you can make.

**Too Formal → Add Warmth:**

```
Before (AI): "We have received your inquiry regarding order status."
After (You): "Thanks for reaching out! I've checked on your order."
```

**Too Casual → Add Professionalism:**

```
Before (AI): "Hey! So like, your thing shipped yesterday lol"
After (You): "Hi! Good news - your order shipped yesterday."
```

**Missing Empathy → Add It:**

```
Before (AI): "Your refund will process in 5-7 business days."
After (You): "I'm sorry this didn't work out. Your refund of $45.99
will process in 5-7 business days."
```

**Your Tone Edits Teach the AI:** Over time, AI learns your preferred style.

---

### Q17: What are "Knowledge Base Sources" and why do they matter?

**A:** Knowledge Base (KB) sources are the articles the AI used to create the draft.

**Why They Matter:**

1. **Verification:** You can check if AI interpreted sources correctly
2. **Version Control:** Ensure AI used current version, not outdated
3. **Relevance:** See if sources actually match customer question
4. **Confidence:** High relevance scores = more likely to be accurate

**What To Check:**

- **Version number:** Is it current?
- **Relevance score:** >80% is good, <60% is concerning
- **Content match:** Does source actually say what AI claims?

**Example:**

```
KB Sources:
• Return Policy (v2.1) - 95% relevance ✅ Current, highly relevant
• Shipping FAQ (v1.3) - 45% relevance ⚠️ Low relevance, why included?
```

**When To Click Through:**

- Low confidence scores (<70%)
- Unfamiliar topic
- Something feels off
- Customer question is complex

---

### Q18: What if the Knowledge Base article the AI references is outdated or wrong?

**A:** This is a critical catch! Here's what to do:

1. **Immediately Reject the Draft**

   ```
   Rejection Note:
   "KB article cited is outdated. Return Policy v2.1 states 30 days,
   but draft references 14 days from older version."
   ```

2. **Write Correct Response** using current policy

3. **Report KB Issue:**
   - Click "Report Inaccuracy" button
   - Alert #support-questions Slack channel
   - Tag @kb-maintenance

4. **Check If Policy Recently Changed:**
   - New policy may not be in system yet
   - Verify with manager or senior support

5. **Document for Team:**
   - Mention in weekly team meeting
   - Help others avoid same issue

**Timeline for KB Fix:** Usually updated within 24 hours

**Your Role:** You're a quality gate for the knowledge base too!

---

### Q19: Can I add information to a draft that the AI didn't include?

**A:** **Absolutely!** That's exactly what "Edit & Approve" is for.

**Common Additions:**

- **Empathy:** "I'm sorry this happened"
- **Specificity:** Add dollar amounts, dates, names
- **Proactive help:** "Would you also like me to..."
- **Personal touch:** Use customer's name, reference history
- **Clear next steps:** "Here's exactly what will happen next"

**Example:**

```
AI Draft:
"Your order will arrive by Oct 15."

Your Addition:
"Hi Maria! Your order of the blue sweater (order #12345) will arrive
by Oct 15. I've also included a 10% off code for your next purchase
as a thank you for your patience: THANKS10"
```

**Additions Teach AI:** System learns what information customers find helpful.

---

### Q20: Why does the AI sometimes repeat information the customer already knows?

**A:** AI sometimes lacks full conversation context. Common causes:

**Reasons:**

1. **First message in conversation** - No history available
2. **Customer context limited** - AI can't see customer's account details
3. **Conversation handoff** - Different agent/operator handled previous message
4. **System limitation** - AI analyzes individual message, not full thread

**What To Do:**

- **Edit to remove redundancy**
- **Add acknowledgment:** "As you mentioned..."
- **Focus on new information:** "Here's the update you asked for:"

**Example Edit:**

```
AI: "Hi John, thank you for your order #12345. Your order will arrive Tuesday."
Customer Already Said: "My order #12345 still hasn't arrived."

Better: "Hi John, I apologize your order #12345 hasn't arrived yet.
I've checked with shipping - it's arriving Tuesday. I'm adding
a 15% discount for the delay."
```

---

## Escalation Procedures

### Q21: When should I escalate instead of making a decision?

**A:** Escalate in these situations (no exceptions):

**ALWAYS ESCALATE:**

- 💰 **High-value issues:** Refunds/credits >$100
- 📜 **Policy exceptions:** Customer requests outside normal policy
- 😠 **Threats:** Legal action, BBB, social media threats
- 🔧 **Technical issues:** Site bugs, payment system errors
- 🏢 **B2B inquiries:** Wholesale, bulk orders, business accounts
- ❓ **You're unsure:** When in doubt, escalate!

**SLA Response Times:**

- **Urgent** (threats, major technical issues): 15 minutes
- **High** (high-value, angry customer): 2 hours
- **Standard** (policy exception, guidance needed): 4 hours

**Remember:** Escalating is not a failure - it's using appropriate judgment!

---

### Q22: What if I escalate too much? Will I get in trouble?

**A:** **No!** Appropriate escalations are encouraged and expected.

**Target Escalation Rate:** 10-15% of approvals

**What This Means:**

- If you escalate 5% → May be handling things you shouldn't (risk!)
- If you escalate 10-15% → Perfect! You're using good judgment
- If you escalate 25% → May need more training (that's okay!)

**You Won't Get In Trouble For:**

- Escalating when policy says to escalate
- Escalating when you're unsure
- Escalating high-risk situations

**You WILL Get Coached If:**

- You don't escalate required situations (high-value without approval)
- You approve things outside your authority
- You guess instead of escalating

**From our North Star:** "Asking for help is a strength, not a weakness."

---

### Q23: What happens after I escalate something?

**A:** Here's the complete escalation flow:

**1. You Click "Escalate"**

- System immediately notifies appropriate person
- Escalation removed from your queue
- Timer starts for SLA tracking

**2. Senior Support/Manager Receives:**

- Full conversation history
- Your escalation notes
- KB articles AI reviewed
- Suggested resolution (if you provided one)

**3. They Take Action:**

- Review within SLA timeframe (15 min to 4 hours)
- Make decision or gather more information
- Respond directly to customer OR
- Send guidance back to you to execute

**4. You're Notified:**

- Escalation resolved notification
- Outcome documented for learning
- May receive coaching/feedback

**5. System Learns:**

- Escalation pattern tracked
- Similar future cases may be flagged automatically
- KB may be updated based on escalation insights

**You Can:** Move on to next approval immediately after escalating.

---

### Q24: Can I escalate directly to a specific person?

**A:** Usually, escalations route automatically based on issue type:

**Automatic Routing:**
| Issue Type | Routes To |
|-----------|----------|
| Policy exception | Senior Support |
| High-value ($100+) | Manager |
| Technical bug | Engineering |
| Angry customer | Senior Support → Manager if threats |
| B2B inquiry | Sales Team |
| Need guidance | Senior Support |

**If You Need Specific Person:**

- Use Slack to directly message them
- Tag them in escalation notes
- For urgent issues, call (phone numbers in Slack profile)

**Manager On-Call:** Always available for critical escalations

---

### Q25: What if I escalate something and then realize I could have handled it?

**A:** That's okay and actually part of the learning process!

**What Happens:**

1. Senior Support reviews your escalation
2. They may:
   - **Handle it** (good escalation)
   - **Send guidance back to you** (learning opportunity)
   - **Provide coaching** (how to handle similar cases next time)

**Example Scenario:**

```
You Escalate: "Customer wants to return item, says it's defective"

Senior Support Response:
"Good instinct to escalate! For future reference: defective items
can be processed as standard returns (no manager approval needed).
Just note 'defective' in return reason. I've handled this one,
but you can handle similar cases directly next time."
```

**This Is Learning:** Over time, you'll need to escalate less as you build confidence and knowledge.

**No Penalty:** You're never penalized for learning or erring on the side of caution.

---

## Technical Issues

### Q26: What if the approval queue is empty but I know there are customers waiting?

**A:** This sometimes happens. Here's the troubleshooting flow:

**1. Check If Agents Are Running:**

- Are conversations active in Chatwoot?
- Has it been >5 minutes since last activity?

**2. Possible Causes:**

- **Normal:** All current inquiries don't require approval (automated responses sent)
- **System issue:** Agent service may be down
- **Filter issue:** You might have filters active

**3. What To Do:**

- **Clear all filters** on approval queue
- **Refresh the page** (hard refresh: Ctrl+Shift+R)
- **Check Chatwoot directly** - handle conversations manually
- **Report in #incidents Slack channel** if issue persists >10 minutes

**4. Manual Mode:**

- Switch to Chatwoot
- Handle conversations normally
- Use KB resources and templates
- Continue providing excellent support

**Remember:** Approval queue is a tool to help you, not replace your ability to work directly with customers.

---

### Q27: The AI suggested response disappeared before I could approve it. What happened?

**A:** Several reasons this might happen:

**Common Causes:**

1. **Timeout/Expiration:**
   - Approval sat in queue too long
   - Default timeout: 30 minutes
   - Auto-removed to prevent stale responses

2. **Another Operator Approved It:**
   - In busy times, multiple operators may see same queue
   - First to approve "claims" it
   - You'll see "Already processed" message

3. **Customer Sent New Message:**
   - Customer's new message changed context
   - AI withdrew old proposal
   - New proposal generated with updated context

4. **System Refresh/Update:**
   - Rare, but system may have updated
   - Proposals regenerated with latest data

**What To Do:**

- Check Chatwoot to see if response was sent
- Look for newer proposal in queue
- If nothing in queue and customer still waiting: handle manually

---

### Q28: Can I access the approval queue from my mobile device?

**A:** Currently, the approval queue is **desktop/laptop optimized only.**

**Why:**

- Complex decision-making requires full screen
- KB article references easier on larger display
- Editing responses is difficult on mobile
- Quality control better on full interface

**Mobile Use:**

- You CAN view queue status
- You CAN see pending count
- You CANNOT approve/reject/edit from mobile

**For Mobile Support:**

- Use Chatwoot mobile app
- Handle conversations directly
- Approvals wait until you're on desktop

**Roadmap:** Mobile approval workflow is being considered for future release.

---

### Q29: What if I lose internet connection while reviewing an approval?

**A:** The system has some protections, but here's what to do:

**If Connection Lost BEFORE Clicking Approve:**

- Draft remains in queue
- Another operator may claim it after timeout
- Reconnect and review again (may be gone)

**If Connection Lost DURING Approve Click:**

- System attempts to complete action
- Usually succeeds (action sent before connection lost)
- Check Chatwoot to verify response was sent
- If not sent: Item returns to queue or handle manually

**Best Practices:**

- Save complex edits frequently (if feature available)
- Don't start approval if connection is unstable
- Use wired connection when possible for stability

**If You Experience Frequent Connection Issues:**

- Report to IT via #tech-support
- May need network troubleshooting

---

### Q30: How do I report a bug or technical issue with the approval queue?

**A:** Clear reporting process:

**For Urgent Issues (System Down, Can't Work):**

1. **Slack: #incidents** channel
2. Include:
   - What happened
   - When it started
   - Error messages (screenshot if possible)
   - Conversation ID if applicable
3. Tag @engineering

**For Non-Urgent Issues (Annoying But Workable):**

1. **Slack: #occ-enablement** channel
2. Describe issue with:
   - What you expected to happen
   - What actually happened
   - Steps to reproduce
   - Screenshot if helpful

**For Feature Requests / Improvements:**

1. **Slack: #product-feedback** channel
2. Describe:
   - What you'd like to improve
   - Why it would help your workflow
   - How often you encounter the issue

**Don't Hesitate:** Your feedback improves the system for everyone!

---

## Impact on Your Work

### Q31: Will I get less customer interaction time with the approval queue?

**A:** Actually, you'll likely get MORE meaningful customer interaction time!

**Time Shift:**

- **Less time on:** Searching KB, writing routine responses, copy-pasting policies
- **More time on:** Complex issues, building relationships, problem-solving

**Quality of Interactions:**

- **Before:** Many quick, transactional responses
- **After:** Fewer but deeper, more valuable interactions

**Example Day:**

- **Before:** Handle 30 conversations, all straightforward
- **After:** Approve 40 AI responses (1 hour), deeply handle 10 complex issues (6 hours)

**Result:** More time doing the work that requires human judgment and builds customer loyalty.

---

### Q32: What if I prefer to write responses myself instead of reviewing AI drafts?

**A:** That's understandable, especially when you're learning! Here's the approach:

**Short Answer:** You can still write manually, but try the approval queue too.

**Hybrid Approach:**

1. **Use approval queue for straightforward items**
   - Order status, tracking, simple policy questions
   - Builds your confidence with AI assistance

2. **Handle complex items manually in Chatwoot**
   - Emotional situations requiring nuance
   - Multi-part complex issues
   - Cases where you have specific customer relationship history

**Over Time:**

- Most operators find approval queue becomes preferred for routine items
- Frees up energy for cases where you add the most value
- But manual option always available

**Flexibility:** Use the tools that help you provide the best customer experience.

---

### Q33: How does the approval queue affect my response time goals?

**A:** Response time metrics evolve with AI assistance:

**New Reality:**

- **AI First Response:** Often instant (seconds)
- **Your Approval Time:** 1-3 minutes
- **Total Time to Customer:** Still very fast

**Metric Changes:**

- **"Time to First Response"** less important (AI makes this instant)
- **"Time to Resolution"** more important (did we solve the problem?)
- **"Approval Decision Time"** new metric (how quickly you review)

**Your Performance:**

- Quality of decisions > Speed of decisions
- Customer satisfaction remains #1 metric
- First contact resolution emphasized

**Don't Stress Speed:** Take time needed to make good decisions.

---

### Q34: Can I still use my favorite response templates?

**A:** Yes! And they work great together with the approval queue:

**Using Templates With AI:**

1. **AI generates first draft** using KB
2. **You review and recognize** "This needs personal touch"
3. **You edit or replace** with your template
4. **AI learns** your template is preferred for this situation

**Best Of Both Worlds:**

- AI handles research and basic structure
- Your templates add personality and proven phrasing
- Over time, AI may incorporate template elements

**Template Sharing:**

- Share effective templates in weekly meetings
- High-performing templates may be added to KB
- System learns from collective team wisdom

**Your Creativity Valued:** Templates and personal touches make responses better!

---

### Q35: Will my schedule or shifts change because of the approval queue?

**A:** **No changes to schedule or shift structure planned.**

**What Stays The Same:**

- Your shift times
- Break schedules
- Team composition
- Reporting structure

**What May Change:**

- Type of work you do during shift (more reviewing, less writing)
- Mix of conversations (more complex, fewer routine)
- Workflow patterns (queue + Chatwoot instead of just Chatwoot)

**Flexibility:**

- If approval queue volume is low, handle Chatwoot directly
- If queue volume is high, focus on approvals
- Always adapt to business needs

**Communication:** Any operational changes will be announced well in advance with full training.

---

## Training and Support

### Q36: How much training will I get before using the approval queue independently?

**A:** Comprehensive training program:

**Phase 1: Onboarding (Week 1)**

- Complete 4 Loom training modules (18m 25s total)
- Read training documentation
- Review this FAQ
- Complete practice exercises

**Phase 2: Supervised Practice (Week 2)**

- Shadow experienced operator (2-4 hours)
- Review real approvals with supervisor
- Handle 10-20 supervised approvals
- Get feedback and coaching

**Phase 3: Independent with Support (Week 3)**

- Handle approvals independently
- Senior support available for questions
- Daily check-ins with mentor
- Gradual increase in complexity

**Phase 4: Fully Independent (Week 4+)**

- Operate independently
- Escalate as needed
- Weekly team knowledge sharing
- Ongoing coaching and development

**No Pressure:** You won't be rushed into independent operation before you're ready.

---

### Q37: Who can I ask questions while I'm learning?

**A:** Multiple support resources:

**During Training:**

- **Your Assigned Mentor:** Primary contact
- **Training Facilitator:** For training content questions
- **Slack #occ-enablement:** General questions

**During Your Shift:**

- **Slack #support-questions:** Quick operational questions
- **Senior Support:** Escalations and complex decisions
- **Your Manager:** Policy interpretations, performance feedback
- **Engineering (via Slack):** Technical issues

**Resources:**

- This FAQ document
- Full training module
- Quick start guide
- Knowledge base

**Don't Hesitate:** No question is too small or "stupid". Everyone is learning!

---

### Q38: What if I still don't feel comfortable using the approval queue after training?

**A:** That's completely normal! Here's the support plan:

**If You Need More Time:**

1. **Talk to your manager** - More supervised practice available
2. **Extended mentorship** - Work alongside experienced operator
3. **Gradual ramp-up** - Start with high-confidence items only
4. **Additional training** - One-on-one coaching sessions

**Common Concerns:**

- "What if I approve something wrong?" → Quality team reviews, mistakes are learning opportunities
- "It feels faster to write myself" → Speed comes with practice, try hybrid approach
- "I don't trust the AI" → Trust but verify, you're the quality gate
- "It's overwhelming" → Start small, build confidence gradually

**Timeline Flexibility:**

- No fixed deadline to be "fully proficient"
- Progress at your own pace
- Support available as long as you need

**Goal:** Your comfort and confidence, not speed of adoption.

---

### Q39: Will there be ongoing training as the system improves?

**A:** Yes! Continuous learning is built into the program:

**Regular Training:**

- **Weekly Team Knowledge Sharing:** 30 minutes every Friday
  - Review interesting/complex approvals
  - Share best practices
  - Q&A with product/engineering team

- **Monthly Skill Development:** Rotating topics
  - Advanced approval techniques
  - New system features
  - Policy updates
  - Customer psychology

- **Quarterly Refreshers:**
  - Review fundamentals
  - Update on system improvements
  - Celebrate successes

**Ad-Hoc Training:**

- When new features launch
- When policies change
- When new agent capabilities added
- When system behavior changes significantly

**Self-Directed Learning:**

- Updated documentation always available
- Recorded training sessions in library
- Practice scenarios you can review anytime

**Staying Current:** You'll never be expected to figure things out on your own.

---

### Q40: How can I provide feedback to improve the approval queue and training?

**A:** We WANT your feedback! Multiple channels:

**Immediate Feedback:**

- **Slack #occ-enablement:** Suggestions and questions
- **Slack #product-feedback:** Feature requests
- **Your Manager:** In 1:1 meetings

**Structured Feedback:**

- **Weekly Team Meetings:** Dedicated feedback time
- **Monthly Surveys:** Operator experience surveys
- **Quarterly Reviews:** System effectiveness assessments

**Specific Feedback Types:**

**Training Improvements:**

- What was confusing in training?
- What examples would be helpful?
- What's missing from documentation?

**System Improvements:**

- What slows you down?
- What features would help?
- What's frustrating or confusing?

**Process Improvements:**

- What workflows feel clunky?
- What policies need clarification?
- What escalation procedures need adjustment?

**Your Voice Matters:** Operators are our internal customers. Your feedback drives improvements.

---

## Quick Reference: Top 10 FAQ

**1. Will this replace my job?**  
No. It enhances your role by automating routine tasks so you can focus on complex issues.

**2. How accurate is the AI?**  
Generally 85-95% accurate depending on complexity, but YOU are the quality gate.

**3. When should I escalate?**  
Always escalate for: high-value issues, policy exceptions, threats, technical issues, or when unsure.

**4. What if I approve something wrong?**  
Catch it quickly and send correction. Document and learn. Mistakes happen.

**5. How long per approval?**  
1-3 minutes typically. Quality > Speed always.

**6. Can I still write responses manually?**  
Yes! Use hybrid approach - AI for routine, manual for complex.

**7. What if the AI gives wrong information?**  
Reject with detailed notes. This helps the AI learn and improve.

**8. How much training will I get?**  
3-4 weeks of structured training with ongoing support.

**9. Will my metrics change?**  
Yes - focus shifts to decision quality and customer satisfaction over typing speed.

**10. Who can I ask for help?**  
Mentor, senior support, managers, #support-questions Slack, and this FAQ!

---

## Still Have Questions?

**This FAQ Is Living Document:** We'll add questions as they come up.

**Ask Your Question:**

- **Slack:** #occ-enablement
- **Email:** customer.support@hotrodan.com
- **Your Manager:** In 1:1 meetings
- **Team Meetings:** Weekly knowledge sharing

**Suggest FAQ Additions:**
If you think a question should be added to this FAQ, message the Enablement team with:

- The question
- Why it's important
- Suggested answer (optional)

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-11  
**Maintained by:** Enablement Team  
**Next Review:** 2025-12-11 (quarterly)

**Related Documents:**

- [Agent SDK Operator Training Module](./agent_sdk_operator_training_module.md) - Complete training guide
- [Approval Queue Quick Start Guide](./approval_queue_quick_start.md) - One-page reference
- [Operator Training QA Template](../runbooks/operator_training_qa_template.md) - Comprehensive operational guide

**Feedback Welcome:** Help us improve this FAQ for all operators!
