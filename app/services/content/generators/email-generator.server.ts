/**
 * Email Campaign Generator
 * 
 * Automated, personalized email campaign creation based on customer segments and behavior.
 * CEO approval required for all campaigns (needsApproval: true)
 * 
 * Features:
 * - Segment-based personalization
 * - Behavior-triggered campaigns
 * - A/B testing support
 * - Performance tracking
 */

import { tool } from '@openai/agents';
import { z } from 'zod';
import type { EmailCampaign } from '../templates/content-schemas';
import { EmailCampaignSchema, EMAIL_TEMPLATES } from '../templates/content-schemas';
import { brandVoiceValidator, ceoApprovalLearner } from '../brand-voice-validator.server';

// ============================================================================
// Types
// ============================================================================

interface CustomerSegment {
  id: string;
  name: EmailCampaign['segment'];
  users: Array<{
    email: string;
    name: string;
    customData: Record<string, any>;
  }>;
}

interface CampaignTrigger {
  type: 'usage_threshold' | 'time_based' | 'behavior' | 'milestone';
  condition: Record<string, any>;
  emailTemplate: keyof typeof EMAIL_TEMPLATES;
}

// ============================================================================
// Email Campaign Generator
// ============================================================================

export class EmailCampaignGenerator {
  /**
   * Generate personalized email campaigns for a segment
   */
  async generateForSegment(
    segment: CustomerSegment,
    templateType: keyof typeof EMAIL_TEMPLATES
  ): Promise<EmailCampaign[]> {
    const template = EMAIL_TEMPLATES[templateType];
    const campaigns: EmailCampaign[] = [];
    
    for (const user of segment.users.slice(0, 100)) { // Batch limit
      const campaign = await this.generatePersonalized(user, segment.name, template);
      if (campaign) campaigns.push(campaign);
    }
    
    return campaigns;
  }

  /**
   * Generate single personalized email
   */
  private async generatePersonalized(
    user: { email: string; name: string; customData: Record<string, any> },
    segment: EmailCampaign['segment'],
    template: typeof EMAIL_TEMPLATES[keyof typeof EMAIL_TEMPLATES]
  ): Promise<EmailCampaign | null> {
    // 1. Personalize subject line
    const subject = this.personalizeSubject(template.subject_formula, user);
    
    // 2. Generate email body
    const body = await this.generateEmailBody(user, segment, template);
    
    // 3. Validate brand voice
    const voiceCheck = await brandVoiceValidator.validate(body);
    
    if (voiceCheck.score < 0.7) {
      // Auto-correct
      const { corrected } = await this.autoCorrectBrandVoice(body);
      return this.generatePersonalized(user, segment, template); // Retry with corrections
    }
    
    // 4. Create campaign object
    return {
      subject,
      preheader: this.generatePreheader(body),
      content: {
        greeting: `Hi ${user.name},`,
        body,
        cta: {
          text: template.cta,
          url: this.generateCTAUrl(segment, template),
        },
        footer: 'Best,\nThe HotDash Team',
      },
      segment,
      personalization: {
        name: user.name,
        ...this.extractPersonalizationVars(user.customData),
      },
      needsApproval: true, // CEO must approve
    };
  }

  /**
   * Personalize subject line with user data
   */
  private personalizeSubject(formula: string, user: any): string {
    let subject = formula;
    
    // Replace placeholders
    subject = subject.replace('[Name]', user.name);
    subject = subject.replace('[Product]', 'HotDash');
    
    // Add personalization based on user data
    if (user.customData?.tickets_processed) {
      subject = subject.replace('[Metric]', `${user.customData.tickets_processed} tickets`);
    }
    
    return subject;
  }

  /**
   * Generate email body based on segment and template
   */
  private async generateEmailBody(
    user: any,
    segment: EmailCampaign['segment'],
    template: any
  ): Promise<string> {
    // Different body generation based on segment
    switch (segment) {
      case 'new_signups':
        return this.generateWelcomeEmail(user);
      
      case 'active_users':
        return this.generateFeatureEmail(user);
      
      case 'churned_users':
        return this.generateReactivationEmail(user);
      
      case 'enterprise_prospects':
        return this.generateEnterpriseEmail(user);
      
      case 'pilot_customers':
        return this.generatePilotEmail(user);
      
      default:
        return this.generateGenericEmail(user);
    }
  }

  private generateWelcomeEmail(user: any): string {
    return `Welcome to HotDash! You're about to make your support team a lot more efficient.

Here's what to do first:

1. Connect your Shopify store (takes 2 minutes)
2. Process your first 10 tickets with AI assistance
3. See the time savings yourself

Most teams are up and running in under 24 hours.

Need help getting started? Reply to this email or check out our quick start guide.`;
  }

  private generateFeatureEmail(user: any): string {
    const ticketsProcessed = user.customData?.tickets_processed || 0;
    
    return `You've processed ${ticketsProcessed} tickets with HotDash--nice work!

We just launched a new feature that'll save you even more time: [Feature Name]

What it does: [Benefit specific to operator]
Why it matters: [Concrete time/cost savings]
How to use it: [Simple 3-step instruction]

Give it a try and let us know what you think.`;
  }

  private generateReactivationEmail(user: any): string {
    return `We noticed you haven't used HotDash in a while.

Missing something? We'd love to hear your feedback.

Since you last logged in, we've added:
-> [Feature 1] - [Benefit]
-> [Feature 2] - [Benefit]
-> [Feature 3] - [Benefit]

Worth another look? Your account is still active.

If HotDash wasn't the right fit, that's OK--but we'd appreciate knowing why so we can improve.`;
  }

  private generateEnterpriseEmail(user: any): string {
    return `You're processing a lot of support tickets--impressive scale!

We'd love to chat about Enterprise features that might help:

-> Multi-location support (franchise operations)
-> Advanced analytics and reporting
-> Custom agent training
-> Priority SLA and support
-> Volume discounts

Interested in a conversation? Reply with a good time to connect.`;
  }

  private generatePilotEmail(user: any): string {
    return `Thank you for being an early adopter!

Your feedback has been incredibly valuable. Here's what we've improved based on pilot input:

-> [Improvement 1] - Your suggestion!
-> [Improvement 2] - From your feedback
-> [Improvement 3] - Community request

As a pilot participant, you're getting early access to all new features.

Questions or more feedback? We're all ears.`;
  }

  private generateGenericEmail(user: any): string {
    return `Quick update from HotDash:

[Value proposition or update relevant to this segment]

[Specific benefit with example]

[Call to action]`;
  }

  private generatePreheader(body: string): string {
    // First 100 chars of body (appears in inbox preview)
    return body.substring(0, 100).replace(/\n/g, ' ').trim();
  }

  private generateCTAUrl(segment: EmailCampaign['segment'], template: any): string {
    const baseUrl = 'https://hotdash.com';
    
    // Segment-specific landing pages with UTM tracking
    const urls: Record<string, string> = {
      new_signups: `${baseUrl}/getting-started?utm_source=email&utm_campaign=welcome`,
      active_users: `${baseUrl}/features?utm_source=email&utm_campaign=feature_announce`,
      churned_users: `${baseUrl}/reactivate?utm_source=email&utm_campaign=winback`,
      enterprise_prospects: `${baseUrl}/enterprise?utm_source=email&utm_campaign=enterprise_outreach`,
      pilot_customers: `${baseUrl}/pilot?utm_source=email&utm_campaign=pilot_update`,
    };
    
    return urls[segment] || baseUrl;
  }

  private extractPersonalizationVars(customData: Record<string, any>): Record<string, string> {
    return {
      tickets_processed: String(customData.tickets_processed || 0),
      days_active: String(customData.days_active || 0),
      team_size: String(customData.team_size || 1),
      plan: String(customData.plan || 'free'),
    };
  }

  private async autoCorrectBrandVoice(content: string): Promise<{ corrected: string; changes: string[] }> {
    let corrected = content;
    const changes: string[] = [];
    
    const replacements: Record<string, string> = {
      'utilize': 'use',
      'leverage': 'use',
    };
    
    for (const [banned, preferred] of Object.entries(replacements)) {
      const regex = new RegExp(`\\b${banned}\\b`, 'gi');
      if (regex.test(corrected)) {
        corrected = corrected.replace(regex, preferred);
        changes.push(`"${banned}" -> "${preferred}"`);
      }
    }
    
    return { corrected, changes };
  }
}

// ============================================================================
// Behavior-Triggered Campaign System
// ============================================================================

export class TriggerBasedCampaignEngine {
  /**
   * Monitor user behavior and trigger appropriate campaigns
   */
  async checkTriggers(userId: string, userData: any): Promise<EmailCampaign[]> {
    const campaigns: EmailCampaign[] = [];
    
    // Trigger 1: Usage threshold (approaching limit)
    if (userData.usage_percent >= 80) {
      campaigns.push(await this.generateUpgradeNudge(userId, userData));
    }
    
    // Trigger 2: Milestone reached (celebrate + upsell)
    if (userData.tickets_processed % 1000 === 0) {
      campaigns.push(await this.generateMilestoneCelebration(userId, userData));
    }
    
    // Trigger 3: High satisfaction (referral request)
    if (userData.satisfaction_score >= 90 && userData.days_active >= 30) {
      campaigns.push(await this.generateReferralRequest(userId, userData));
    }
    
    // Trigger 4: Inactivity (re-engagement)
    if (userData.days_since_last_use >= 14) {
      campaigns.push(await this.generateReactivationEmail(userId, userData));
    }
    
    return campaigns.filter(c => c !== null) as EmailCampaign[];
  }

  private async generateUpgradeNudge(userId: string, data: any): Promise<EmailCampaign> {
    return {
      subject: `You're at ${data.usage_percent}% of your plan--time to upgrade?`,
      preheader: `Avoid overage fees. Upgrade now and get more capacity.`,
      content: {
        greeting: `Hi ${data.name},`,
        body: `You're doing great! You've processed ${data.tickets_processed} tickets this month.

You're currently at ${data.usage_percent}% of your ${data.plan} plan limit.

To avoid overage fees and get more capacity, consider upgrading to ${this.suggestNextPlan(data.plan)}.

Benefits:
-> ${this.getUpgradeBenefits(data.plan).join('\n-> ')}

ROI: Based on your usage, upgrading saves you $${this.calculateSavings(data)} per month.`,
        cta: {
          text: 'View Upgrade Options',
          url: `https://hotdash.com/upgrade?user=${userId}`,
        },
        footer: 'Questions about upgrading? Reply to this email.',
      },
      segment: 'active_users',
      personalization: { usage_percent: String(data.usage_percent) },
      needsApproval: true,
    };
  }

  private async generateMilestoneCelebration(userId: string, data: any): Promise<EmailCampaign> {
    return {
      subject: `🎉 You hit ${data.tickets_processed} tickets!`,
      preheader: `Celebrate your milestone--and see what's next.`,
      content: {
        greeting: `Hi ${data.name},`,
        body: `Amazing! You just processed your ${data.tickets_processed}th ticket with HotDash.

That's ${this.calculateTimeSaved(data.tickets_processed)} hours saved compared to manual support.

What's next:
-> Keep the momentum going
-> Try our advanced features
-> Refer a colleague (you both get $500)

Thanks for being part of the HotDash community!`,
        cta: {
          text: 'Refer a Friend -> $500 Credit',
          url: `https://hotdash.com/referrals?user=${userId}`,
        },
        footer: 'Keep up the great work!',
      },
      segment: 'active_users',
      personalization: { milestone: String(data.tickets_processed) },
      needsApproval: true,
    };
  }

  private async generateReferralRequest(userId: string, data: any): Promise<EmailCampaign> {
    return {
      subject: `Love HotDash? Know someone who'd benefit?`,
      preheader: `Refer a friend and you both get $500 credit.`,
      content: {
        greeting: `Hi ${data.name},`,
        body: `You've been crushing it with HotDash (${data.satisfaction_score}% satisfaction!).

Know someone else struggling with support volume? Refer them and:
-> They get 14-day trial + onboarding help
-> You get $500 credit when they become a paying customer
-> They get $500 credit on their first invoice

Your unique referral link: [LINK]

Share on LinkedIn, email colleagues, or post in Shopify communities.

Thanks for spreading the word!`,
        cta: {
          text: 'Get Your Referral Link',
          url: `https://hotdash.com/refer?user=${userId}`,
        },
        footer: 'Questions? Reply anytime.',
      },
      segment: 'active_users',
      personalization: { satisfaction_score: String(data.satisfaction_score) },
      needsApproval: true,
    };
  }

  private async generateReactivationEmail(userId: string, data: any): Promise<EmailCampaign> {
    return {
      subject: `We miss you! What can we improve?`,
      preheader: `Your account is still active. See what's new.`,
      content: {
        greeting: `Hi ${data.name},`,
        body: `It's been ${data.days_since_last_use} days since you last used HotDash.

We'd love to understand what happened:
-> Was something missing?
-> Did you hit a blocker?
-> Is there a feature you need?

Since you've been away, we've added:
${this.getRecentFeatures().map(f => `-> ${f.name}: ${f.benefit}`).join('\n')}

Worth another look? Your account is ready whenever you are.

If HotDash wasn't the right fit, no worries--but we'd appreciate any feedback to help us improve.`,
        cta: {
          text: "See What's New",
          url: `https://hotdash.com/login?user=${userId}`,
        },
        footer: 'Feedback? Just reply to this email.',
      },
      segment: 'churned_users',
      personalization: { days_inactive: String(data.days_since_last_use) },
      needsApproval: true,
    };
  }

  // Helper methods
  private suggestNextPlan(currentPlan: string): string {
    const upgrades: Record<string, string> = {
      'free': 'Pro',
      'pro': 'Business',
      'business': 'Enterprise',
    };
    return upgrades[currentPlan.toLowerCase()] || 'Pro';
  }

  private getUpgradeBenefits(currentPlan: string): string[] {
    return [
      'Higher ticket limits (no overage)',
      'Priority support',
      'Advanced analytics',
      'Custom agent training',
    ];
  }

  private calculateSavings(data: any): number {
    // Simplified ROI calculation
    const overage_cost = (data.usage_percent - 100) * 50;
    const upgrade_cost = this.getUpgradeCost(data.plan);
    return Math.max(0, overage_cost - upgrade_cost);
  }

  private getUpgradeCost(currentPlan: string): number {
    const costs: Record<string, number> = {
      'free': 99,
      'pro': 299,
      'business': 999,
    };
    return costs[currentPlan.toLowerCase()] || 99;
  }

  private calculateTimeSaved(ticketsProcessed: number): number {
    // Assume 20 min saved per ticket with AI assistance
    return Math.round((ticketsProcessed * 20) / 60); // Hours
  }

  private getRecentFeatures(): Array<{ name: string; benefit: string }> {
    // TODO: Pull from product changelog
    return [
      { name: 'Multi-language support', benefit: 'Serve global customers' },
      { name: 'Advanced analytics', benefit: 'Track team performance' },
      { name: 'Custom workflows', benefit: 'Automate your processes' },
    ];
  }

  private generatePreheader(body: string): string {
    const firstSentence = body.split('.')[0];
    return firstSentence.substring(0, 100).trim();
  }

  private extractPersonalizationVars(customData: Record<string, any>): Record<string, string> {
    const vars: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(customData)) {
      vars[key] = String(value);
    }
    
    return vars;
  }

  private async autoCorrectBrandVoice(content: string): Promise<{ corrected: string; changes: string[] }> {
    let corrected = content;
    const changes: string[] = [];
    
    const replacements: Record<string, string> = {
      'utilize': 'use',
      'leverage': 'use',
    };
    
    for (const [banned, preferred] of Object.entries(replacements)) {
      const regex = new RegExp(`\\b${banned}\\b`, 'gi');
      if (regex.test(corrected)) {
        corrected = corrected.replace(regex, preferred);
        changes.push(`"${banned}" -> "${preferred}"`);
      }
    }
    
    return { corrected, changes };
  }
}

// ============================================================================
// A/B Testing System
// ============================================================================

export class EmailABTester {
  /**
   * Generate A/B test variants for subject lines and content
   */
  async generateVariants(
    baseEmail: EmailCampaign,
    variantCount: number = 2
  ): Promise<EmailCampaign[]> {
    const variants: EmailCampaign[] = [
      { ...baseEmail, abTestVariant: 'control' },
    ];
    
    // Variant A: Different subject line
    const variantA = {
      ...baseEmail,
      subject: this.generateSubjectVariant(baseEmail.subject),
      abTestVariant: 'A' as const,
    };
    variants.push(variantA);
    
    // Variant B: Different CTA
    if (variantCount >= 2) {
      const variantB = {
        ...baseEmail,
        content: {
          ...baseEmail.content,
          cta: {
            ...baseEmail.content.cta,
            text: this.generateCTAVariant(baseEmail.content.cta.text),
          },
        },
        abTestVariant: 'B' as const,
      };
      variants.push(variantB);
    }
    
    return variants;
  }

  private generateSubjectVariant(original: string): string {
    // Generate variations: question -> statement, short -> long, etc.
    if (original.includes('?')) {
      return original.replace('?', '!'); // Question -> Exclamation
    }
    
    if (original.length < 40) {
      return `${original} - Here's How`; // Add context
    }
    
    // Try emoji variation
    return `✨ ${original}`;
  }

  private generateCTAVariant(original: string): string {
    const variants: Record<string, string> = {
      'Get Started': 'Try It Free',
      'Learn More': 'See How It Works',
      'View Plans': 'Compare Pricing',
      'Book Demo': 'Schedule a Call',
    };
    
    return variants[original] || original;
  }

  /**
   * Track which variant performs better
   */
  async trackVariantPerformance(
    campaignId: string,
    variant: 'control' | 'A' | 'B',
    metrics: { opens: number; clicks: number; conversions: number }
  ): Promise<void> {
    // TODO: Save to database and calculate winner
    // await db.abTestResults.upsert({ campaignId, variant, metrics });
  }
}

// ============================================================================
// OpenAI Agent Tool: Send Email Campaign (CEO Approval Required)
// ============================================================================

export const sendEmailCampaignTool = tool({
  name: 'send_email_campaign',
  description: 'Send an email campaign to a customer segment. Requires CEO approval.',
  parameters: EmailCampaignSchema,
  needsApproval: true, // CEO MUST approve
  
  async execute({ subject, content, segment, personalization }) {
    // This only executes AFTER CEO approval
    
    console.log(`[CEO APPROVED] Sending email campaign: "${subject}" to segment: ${segment}`);
    
    // TODO: Integrate with email service (SendGrid, Postmark, etc.)
    // await emailService.send({
    //   to: getUsersInSegment(segment),
    //   subject,
    //   html: renderEmailTemplate(content, personalization),
    // });
    
    // Learn from CEO approval
    await ceoApprovalLearner.learnFromApproval(
      content.body,
      null,
      true,
      'email'
    );
    
    return {
      success: true,
      sent: 0, // TODO: Actual count
      segment,
      sentAt: new Date().toISOString(),
    };
  },
});

// ============================================================================
// Export
// ============================================================================

export const emailGenerator = new EmailCampaignGenerator();
export const abTester = new EmailABTester();
export const triggerEngine = new TriggerBasedCampaignEngine();

export { EmailCampaignGenerator, sendEmailCampaignTool };

