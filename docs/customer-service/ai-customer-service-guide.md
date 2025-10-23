# AI Customer Service Implementation Guide

## Overview

The AI Customer Service system provides automated customer support with human-in-the-loop (HITL) approval workflows. The system includes AI chatbot functionality, intelligent ticket routing, response automation, and comprehensive satisfaction tracking.

## System Architecture

### Core Components

1. **AI Chatbot Service** (`chatbot.service.ts`)
   - OpenAI integration for natural language processing
   - Inquiry analysis and response generation
   - Confidence scoring and approval workflows
   - **MCP Tool Integration**: Shopify Storefront MCP and Customer Accounts MCP

2. **Ticket Routing Service** (`ticket-routing.service.ts`)
   - Intelligent routing based on inquiry analysis
   - Agent availability and specialization matching
   - Escalation workflows for complex issues

3. **Response Automation Service** (`response-automation.service.ts`)
   - Template-based response generation
   - HITL approval workflows
   - Performance tracking and optimization

4. **Satisfaction Tracking Service** (`satisfaction-tracking.service.ts`)
   - Customer feedback collection and analysis
   - Satisfaction metrics and reporting
   - Alert system for low satisfaction scores

5. **Training Data Service** (`training-data.service.ts`)
   - AI training data management
   - Knowledge base maintenance
   - Performance analytics and improvements

### MCP Integration Components

6. **Storefront Sub-Agent** (`storefront-sub-agent.service.ts`)
   - **Shopify Storefront MCP Integration**
   - Product catalog access and searches
   - Availability checks and inventory queries
   - Collection browsing and policy queries
   - Public store information access

7. **Accounts Sub-Agent** (`accounts-sub-agent.service.ts`)
   - **Customer Accounts MCP Integration**
   - Authenticated customer data access
   - Order history and tracking information
   - Account preferences management
   - **ABAC Security**: PII access controls and audit logging

8. **MCP Integration Service** (`mcp-integration.service.ts`)
   - **Shopify Storefront MCP**: Product catalog and availability queries
   - **Customer Accounts MCP**: Authenticated customer data access
   - Centralized MCP tool management and monitoring for production customer service

## API Endpoints

### Chatbot API (`/api/ai-customer/chatbot`)

#### GET Parameters
- `action=pending-responses` - Get responses pending approval
- `action=performance-metrics` - Get chatbot performance metrics
- `action=routing-stats` - Get ticket routing statistics
- `action=automation-metrics` - Get response automation metrics
- `action=satisfaction-metrics` - Get satisfaction tracking metrics
- `action=storefront-metrics` - Get Storefront Sub-Agent performance metrics
- `action=accounts-metrics` - Get Accounts Sub-Agent performance metrics

#### POST Actions
- `action=process-inquiry` - Process new customer inquiry
- `action=approve-response` - Approve and send AI response
- `action=reject-response` - Reject AI response
- `action=record-feedback` - Record customer feedback
- `action=generate-report` - Generate satisfaction report

#### MCP Integration Actions
- `action=search-products` - Search products using Storefront MCP
- `action=check-availability` - Check product availability using Storefront MCP
- `action=get-customer-orders` - Get customer orders using Customer Accounts MCP
- `action=get-order-details` - Get specific order details using Customer Accounts MCP
- `action=get-account-info` - Get customer account information using Customer Accounts MCP
- `action=update-preferences` - Update customer preferences using Customer Accounts MCP

## Configuration

### Environment Variables

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Database Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Application Configuration
APP_URL=https://your-app-url.com
```

### Service Configuration

#### Chatbot Service
```typescript
const chatbotConfig = {
  model: 'gpt-4o-mini',
  maxTokens: 500,
  temperature: 0.7,
  autoApproveThreshold: 0.9,
  escalationKeywords: ['complaint', 'refund', 'cancel', 'urgent'],
  responseTimeTarget: 300, // seconds
};
```

#### Ticket Routing Service
```typescript
const routingConfig = {
  defaultTeam: 'general_support',
  escalationThreshold: 0.8,
  maxAgentLoad: 8,
  responseTimeTarget: 30, // minutes
};
```

## Database Schema

### Customer Inquiries Table
```sql
CREATE TABLE customer_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id VARCHAR NOT NULL,
  customer_email VARCHAR NOT NULL,
  customer_name VARCHAR,
  message TEXT NOT NULL,
  channel VARCHAR CHECK (channel IN ('email', 'chat', 'sms')),
  priority VARCHAR CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR CHECK (status IN ('new', 'assigned', 'in_progress', 'pending_approval', 'resolved')),
  tags TEXT[],
  metadata JSONB,
  assigned_to UUID,
  assigned_team VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### AI Responses Table
```sql
CREATE TABLE ai_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID REFERENCES customer_inquiries(id),
  template_id UUID,
  draft_response TEXT NOT NULL,
  confidence DECIMAL(3,2) NOT NULL,
  suggested_tags TEXT[],
  requires_approval BOOLEAN NOT NULL DEFAULT FALSE,
  approval_reason TEXT,
  approval_status VARCHAR CHECK (approval_status IN ('pending', 'approved', 'rejected', 'auto_approved')),
  approver_id UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  final_response TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Customer Feedback Table
```sql
CREATE TABLE customer_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID REFERENCES customer_inquiries(id),
  response_id UUID REFERENCES ai_responses(id),
  customer_id VARCHAR NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  category VARCHAR CHECK (category IN ('response_quality', 'response_time', 'resolution_effectiveness', 'overall_satisfaction')),
  comment TEXT,
  tags TEXT[],
  follow_up_required BOOLEAN DEFAULT FALSE,
  sentiment VARCHAR CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Usage Examples

### Processing a Customer Inquiry

```typescript
import { aiChatbot } from '~/services/ai-customer/chatbot.service.js';

const inquiry = {
  customerId: 'customer-123',
  customerEmail: 'customer@example.com',
  customerName: 'John Doe',
  message: 'Where is my order #12345?',
  channel: 'email',
  priority: 'medium',
  tags: ['order', 'tracking'],
  metadata: { orderNumber: '12345' }
};

const response = await aiChatbot.processInquiry(inquiry);
console.log('AI Response:', response);
```

### Approving a Response

```typescript
import { responseAutomationService } from '~/services/ai-customer/response-automation.service.js';

await responseAutomationService.approveResponse(
  responseId,
  approverId,
  'Thank you for your inquiry. Your order #12345 is currently being processed and will ship within 24 hours.'
);
```

### Recording Customer Feedback

```typescript
import { satisfactionTrackingService } from '~/services/ai-customer/satisfaction-tracking.service.js';

const feedback = await satisfactionTrackingService.recordFeedback(
  inquiryId,
  responseId,
  customerId,
  {
    rating: 5,
    category: 'overall_satisfaction',
    comment: 'Very helpful and quick response!',
    tags: ['satisfied', 'quick_response']
  }
);
```

## Monitoring and Analytics

### Key Metrics

1. **Response Time**: Average time to respond to customer inquiries
2. **Auto-Approval Rate**: Percentage of responses automatically approved
3. **Customer Satisfaction**: Average satisfaction rating from feedback
4. **Resolution Rate**: Percentage of inquiries successfully resolved
5. **Escalation Rate**: Percentage of inquiries requiring human intervention

### Performance Monitoring

```typescript
// Get chatbot performance metrics
const metrics = await aiChatbot.getPerformanceMetrics();
console.log('Total Inquiries:', metrics.totalInquiries);
console.log('Auto Resolved:', metrics.autoResolved);
console.log('Customer Satisfaction:', metrics.customerSatisfaction);

// Get satisfaction metrics
const satisfactionMetrics = await satisfactionTrackingService.getSatisfactionMetrics(
  startDate,
  endDate
);
console.log('Overall Satisfaction:', satisfactionMetrics.overallSatisfaction);
console.log('Trend Direction:', satisfactionMetrics.trendDirection);
```

## Best Practices

### 1. Response Quality
- Use clear, professional language
- Provide specific, actionable information
- Always offer additional assistance
- Maintain consistent tone and style

### 2. Approval Workflows
- Set appropriate confidence thresholds
- Review high-risk responses manually
- Escalate complex issues promptly
- Monitor approval queue regularly

### 3. Customer Satisfaction
- Send satisfaction surveys promptly
- Follow up on negative feedback
- Track satisfaction trends
- Implement continuous improvements

### 4. Training Data Management
- Regularly review and update training data
- Monitor performance metrics
- Add new examples based on customer feedback
- Remove outdated or ineffective entries

## Troubleshooting

### Common Issues

1. **Low Confidence Scores**
   - Review training data quality
   - Add more specific examples
   - Adjust confidence thresholds

2. **High Escalation Rates**
   - Improve routing rules
   - Enhance training data
   - Optimize response templates

3. **Low Customer Satisfaction**
   - Analyze feedback comments
   - Review response quality
   - Improve approval workflows

### Error Handling

```typescript
try {
  const response = await aiChatbot.processInquiry(inquiry);
  // Process response
} catch (error) {
  console.error('Error processing inquiry:', error);
  // Handle error appropriately
  // Log error for monitoring
  // Provide fallback response
}
```

## Security Considerations

### Data Protection
- Encrypt sensitive customer data
- Implement proper access controls
- Regular security audits
- Compliance with privacy regulations

### AI Safety
- Monitor for inappropriate responses
- Implement content filtering
- Regular model updates
- Human oversight for sensitive topics

## Future Enhancements

### Planned Features
1. Multi-language support
2. Voice integration
3. Advanced analytics dashboard
4. Integration with CRM systems
5. Proactive customer outreach

### Continuous Improvement
- Regular performance reviews
- Customer feedback integration
- Training data optimization
- Technology updates and upgrades

## Support and Maintenance

### Regular Tasks
- Monitor system performance
- Update training data
- Review customer feedback
- Optimize response templates
- Maintain knowledge base

### Contact Information
- Technical Support: tech-support@hotrodan.com
- Customer Service: support@hotrodan.com
- Emergency Contact: emergency@hotrodan.com

---

*This documentation is maintained by the AI Customer Service team. Last updated: October 23, 2025*
