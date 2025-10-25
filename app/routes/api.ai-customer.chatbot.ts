/**
 * AI Customer Service Chatbot API
 * 
 * Handles customer inquiries, AI response generation, and approval workflows.
 * 
 * @route /api/ai-customer/chatbot
 */

import { type ActionFunctionArgs, type LoaderFunctionArgs} from 'react-router';
import { aiChatbot} from '~/services/ai-customer/chatbot.service.js';
import { getTicketRoutingService} from '~/services/ai-customer/ticket-routing.service.js';
import { getResponseAutomationService} from '~/services/ai-customer/response-automation.service.js';
import { getSatisfactionTrackingService} from '~/services/ai-customer/satisfaction-tracking.service.js';
import { getStorefrontSubAgent} from '~/services/ai-customer/storefront-sub-agent.service.js';
import { getAccountsSubAgent} from '~/services/ai-customer/accounts-sub-agent.service.js';
import { logDecision} from '~/services/decisions.server.js';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const routingService = getTicketRoutingService();
    const automationService = getResponseAutomationService();
    const satisfactionService = getSatisfactionTrackingService();
    const storefrontAgent = getStorefrontSubAgent();
    const accountsAgent = getAccountsSubAgent();

    switch (action) {
      case 'pending-responses':
        const pendingResponses = await aiChatbot.getPendingResponses();
        return Response.json({ success: true, data: pendingResponses });

      case 'performance-metrics':
        const metrics = await aiChatbot.getPerformanceMetrics();
        return Response.json({ success: true, data: metrics });

      case 'routing-stats':
        await routingService.initialize();
        const routingStats = await routingService.getRoutingStats();
        return Response.json({ success: true, data: routingStats });

      case 'automation-metrics':
        await automationService.initialize();
        const automationMetrics = await automationService.getAutomationMetrics();
        return Response.json({ success: true, data: automationMetrics });

      case 'satisfaction-metrics':
        const endDate = new Date().toISOString();
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days ago
        const satisfactionMetrics = await satisfactionService.getSatisfactionMetrics(startDate, endDate);
        return Response.json({ success: true, data: satisfactionMetrics });

      case 'storefront-metrics':
        const storefrontMetrics = await storefrontAgent.getPerformanceMetrics();
        return Response.json({ success: true, data: storefrontMetrics });

      case 'accounts-metrics':
        const accountsMetrics = await accountsAgent.getPerformanceMetrics();
        return Response.json({ success: true, data: accountsMetrics });

      default:
        return Response.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in AI customer chatbot loader:', error);
    if (error instanceof Error && error.message.includes('Supabase credentials not configured')) {
      return Response.json({ success: false, error: 'Supabase not configured' }, { status: 503 });
    }

    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const action = formData.get('action') as string;
    const routingService = getTicketRoutingService();
    const automationService = getResponseAutomationService();
    const satisfactionService = getSatisfactionTrackingService();
    const storefrontAgent = getStorefrontSubAgent();

    switch (action) {
      case 'process-inquiry': {
        const inquiryData = {
          customerId: formData.get('customerId') as string,
          customerEmail: formData.get('customerEmail') as string,
          customerName: formData.get('customerName') as string,
          message: formData.get('message') as string,
          channel: formData.get('channel') as 'email' | 'chat' | 'sms',
          priority: formData.get('priority') as 'low' | 'medium' | 'high' | 'urgent',
          tags: JSON.parse(formData.get('tags') as string || '[]'),
          metadata: JSON.parse(formData.get('metadata') as string || '{}'),
        };

        // Process inquiry through AI chatbot
        const aiResponse = await aiChatbot.processInquiry(inquiryData);

        // Route inquiry to appropriate agent/team
        await routingService.initialize();
        const routingResult = await routingService.routeInquiry(aiResponse.inquiryId, inquiryData);

        // Generate automated response
        await automationService.initialize();
        const automatedResponse = await automationService.generateAutomatedResponse(
          { id: aiResponse.inquiryId, ...inquiryData },
          { confidence: aiResponse.confidence, inquiryType: 'general' }
        );

        return Response.json({
          success: true,
          data: {
            aiResponse,
            routingResult,
            automatedResponse,
          },
        });
      }

      case 'approve-response': {
        const responseId = formData.get('responseId') as string;
        const approverId = formData.get('approverId') as string;
        const finalResponse = formData.get('finalResponse') as string;

        await automationService.approveResponse(responseId, approverId, finalResponse);
        
        // Send the approved response
        await automationService.sendResponse(responseId);

        // Send satisfaction survey
        await satisfactionService.sendSatisfactionSurvey(
          formData.get('inquiryId') as string,
          responseId
        );

        return Response.json({ success: true, message: 'Response approved and sent' });
      }

      case 'reject-response': {
        const responseId = formData.get('responseId') as string;
        const approverId = formData.get('approverId') as string;
        const rejectionReason = formData.get('rejectionReason') as string;

        await automationService.rejectResponse(responseId, approverId, rejectionReason);

        return Response.json({ success: true, message: 'Response rejected' });
      }

      case 'record-feedback': {
        const inquiryId = formData.get('inquiryId') as string;
        const responseId = formData.get('responseId') as string;
        const customerId = formData.get('customerId') as string;
        const rating = parseInt(formData.get('rating') as string);
        const category = formData.get('category') as string;
        const comment = formData.get('comment') as string;
        const tags = JSON.parse(formData.get('tags') as string || '[]');

        const feedback = await satisfactionService.recordFeedback(
          inquiryId,
          responseId,
          customerId,
          {
            rating,
            category: category as any,
            comment,
            tags,
          }
        );

        return Response.json({ success: true, data: feedback });
      }

      case 'generate-report': {
        const startDate = formData.get('startDate') as string;
        const endDate = formData.get('endDate') as string;

        const report = await satisfactionService.generateSatisfactionReport(startDate, endDate);

        return Response.json({ success: true, data: report });
      }

      case 'search-products': {
        const customerId = formData.get('customerId') as string;
        const query = formData.get('query') as string;
        const filters = JSON.parse(formData.get('filters') as string || '{}');
        const sortBy = formData.get('sortBy') as string;
        const limit = parseInt(formData.get('limit') as string || '20');

        const result = await storefrontAgent.searchProducts(customerId, query, filters, sortBy, limit);

        return Response.json({ success: true, data: result });
      }

      case 'check-availability': {
        const customerId = formData.get('customerId') as string;
        const productId = formData.get('productId') as string;
        const variantId = formData.get('variantId') as string;
        const location = formData.get('location') as string;

        const result = await storefrontAgent.checkAvailability(customerId, productId, variantId, location);

        return Response.json({ success: true, data: result });
      }

      case 'get-customer-orders': {
        const customerId = formData.get('customerId') as string;
        const token = formData.get('token') as string;
        const limit = parseInt(formData.get('limit') as string || '10');

        const result = await accountsAgent.getCustomerOrders(customerId, token, limit);

        return Response.json({ success: true, data: result });
      }

      case 'get-order-details': {
        const customerId = formData.get('customerId') as string;
        const orderId = formData.get('orderId') as string;
        const token = formData.get('token') as string;

        const result = await accountsAgent.getOrderDetails(customerId, orderId, token);

        return Response.json({ success: true, data: result });
      }

      case 'get-account-info': {
        const customerId = formData.get('customerId') as string;
        const token = formData.get('token') as string;

        const result = await accountsAgent.getCustomerAccountInfo(customerId, token);

        return Response.json({ success: true, data: result });
      }

      case 'update-preferences': {
        const customerId = formData.get('customerId') as string;
        const token = formData.get('token') as string;
        const preferences = JSON.parse(formData.get('preferences') as string || '{}');

        const result = await accountsAgent.updateCustomerPreferences(customerId, token, preferences);

        return Response.json({ success: true, data: { updated: result } });
      }

      default:
        return Response.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in AI customer chatbot action:', error);
    if (error instanceof Error && error.message.includes('Supabase credentials not configured')) {
      return Response.json({ success: false, error: 'Supabase not configured' }, { status: 503 });
    }

    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
