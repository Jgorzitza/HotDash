/**
 * AI Customer Service Chatbot API
 *
 * Handles customer inquiries, AI response generation, and approval workflows.
 *
 * @route /api/ai-customer/chatbot
 */
import { aiChatbot } from '~/services/ai-customer/chatbot.service.js';
import { ticketRoutingService } from '~/services/ai-customer/ticket-routing.service.js';
import { responseAutomationService } from '~/services/ai-customer/response-automation.service.js';
import { satisfactionTrackingService } from '~/services/ai-customer/satisfaction-tracking.service.js';
import { storefrontSubAgent } from '~/services/ai-customer/storefront-sub-agent.service.js';
import { accountsSubAgent } from '~/services/ai-customer/accounts-sub-agent.service.js';
export async function loader({ request }) {
    try {
        const url = new URL(request.url);
        const action = url.searchParams.get('action');
        switch (action) {
            case 'pending-responses':
                const pendingResponses = await aiChatbot.getPendingResponses();
                return Response.json({ success: true, data: pendingResponses });
            case 'performance-metrics':
                const metrics = await aiChatbot.getPerformanceMetrics();
                return Response.json({ success: true, data: metrics });
            case 'routing-stats':
                await ticketRoutingService.initialize();
                const routingStats = await ticketRoutingService.getRoutingStats();
                return Response.json({ success: true, data: routingStats });
            case 'automation-metrics':
                await responseAutomationService.initialize();
                const automationMetrics = await responseAutomationService.getAutomationMetrics();
                return Response.json({ success: true, data: automationMetrics });
            case 'satisfaction-metrics':
                const endDate = new Date().toISOString();
                const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days ago
                const satisfactionMetrics = await satisfactionTrackingService.getSatisfactionMetrics(startDate, endDate);
                return Response.json({ success: true, data: satisfactionMetrics });
            case 'storefront-metrics':
                const storefrontMetrics = await storefrontSubAgent.getPerformanceMetrics();
                return Response.json({ success: true, data: storefrontMetrics });
            case 'accounts-metrics':
                const accountsMetrics = await accountsSubAgent.getPerformanceMetrics();
                return Response.json({ success: true, data: accountsMetrics });
            default:
                return Response.json({ success: false, error: 'Invalid action' }, { status: 400 });
        }
    }
    catch (error) {
        console.error('Error in AI customer chatbot loader:', error);
        return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
export async function action({ request }) {
    try {
        const formData = await request.formData();
        const action = formData.get('action');
        switch (action) {
            case 'process-inquiry': {
                const inquiryData = {
                    customerId: formData.get('customerId'),
                    customerEmail: formData.get('customerEmail'),
                    customerName: formData.get('customerName'),
                    message: formData.get('message'),
                    channel: formData.get('channel'),
                    priority: formData.get('priority'),
                    tags: JSON.parse(formData.get('tags') || '[]'),
                    metadata: JSON.parse(formData.get('metadata') || '{}'),
                };
                // Process inquiry through AI chatbot
                const aiResponse = await aiChatbot.processInquiry(inquiryData);
                // Route inquiry to appropriate agent/team
                await ticketRoutingService.initialize();
                const routingResult = await ticketRoutingService.routeInquiry(aiResponse.inquiryId, inquiryData);
                // Generate automated response
                await responseAutomationService.initialize();
                const automatedResponse = await responseAutomationService.generateAutomatedResponse({ id: aiResponse.inquiryId, ...inquiryData }, { confidence: aiResponse.confidence, inquiryType: 'general' });
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
                const responseId = formData.get('responseId');
                const approverId = formData.get('approverId');
                const finalResponse = formData.get('finalResponse');
                await responseAutomationService.approveResponse(responseId, approverId, finalResponse);
                // Send the approved response
                await responseAutomationService.sendResponse(responseId);
                // Send satisfaction survey
                await satisfactionTrackingService.sendSatisfactionSurvey(formData.get('inquiryId'), responseId);
                return Response.json({ success: true, message: 'Response approved and sent' });
            }
            case 'reject-response': {
                const responseId = formData.get('responseId');
                const approverId = formData.get('approverId');
                const rejectionReason = formData.get('rejectionReason');
                await responseAutomationService.rejectResponse(responseId, approverId, rejectionReason);
                return Response.json({ success: true, message: 'Response rejected' });
            }
            case 'record-feedback': {
                const inquiryId = formData.get('inquiryId');
                const responseId = formData.get('responseId');
                const customerId = formData.get('customerId');
                const rating = parseInt(formData.get('rating'));
                const category = formData.get('category');
                const comment = formData.get('comment');
                const tags = JSON.parse(formData.get('tags') || '[]');
                const feedback = await satisfactionTrackingService.recordFeedback(inquiryId, responseId, customerId, {
                    rating,
                    category: category,
                    comment,
                    tags,
                });
                return Response.json({ success: true, data: feedback });
            }
            case 'generate-report': {
                const startDate = formData.get('startDate');
                const endDate = formData.get('endDate');
                const report = await satisfactionTrackingService.generateSatisfactionReport(startDate, endDate);
                return Response.json({ success: true, data: report });
            }
            case 'search-products': {
                const customerId = formData.get('customerId');
                const query = formData.get('query');
                const filters = JSON.parse(formData.get('filters') || '{}');
                const sortBy = formData.get('sortBy');
                const limit = parseInt(formData.get('limit') || '20');
                const result = await storefrontSubAgent.searchProducts(customerId, query, filters, sortBy, limit);
                return Response.json({ success: true, data: result });
            }
            case 'check-availability': {
                const customerId = formData.get('customerId');
                const productId = formData.get('productId');
                const variantId = formData.get('variantId');
                const location = formData.get('location');
                const result = await storefrontSubAgent.checkAvailability(customerId, productId, variantId, location);
                return Response.json({ success: true, data: result });
            }
            case 'get-customer-orders': {
                const customerId = formData.get('customerId');
                const token = formData.get('token');
                const limit = parseInt(formData.get('limit') || '10');
                const result = await accountsSubAgent.getCustomerOrders(customerId, token, limit);
                return Response.json({ success: true, data: result });
            }
            case 'get-order-details': {
                const customerId = formData.get('customerId');
                const orderId = formData.get('orderId');
                const token = formData.get('token');
                const result = await accountsSubAgent.getOrderDetails(customerId, orderId, token);
                return Response.json({ success: true, data: result });
            }
            case 'get-account-info': {
                const customerId = formData.get('customerId');
                const token = formData.get('token');
                const result = await accountsSubAgent.getCustomerAccountInfo(customerId, token);
                return Response.json({ success: true, data: result });
            }
            case 'update-preferences': {
                const customerId = formData.get('customerId');
                const token = formData.get('token');
                const preferences = JSON.parse(formData.get('preferences') || '{}');
                const result = await accountsSubAgent.updateCustomerPreferences(customerId, token, preferences);
                return Response.json({ success: true, data: { updated: result } });
            }
            default:
                return Response.json({ success: false, error: 'Invalid action' }, { status: 400 });
        }
    }
    catch (error) {
        console.error('Error in AI customer chatbot action:', error);
        return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=api.ai-customer.chatbot.js.map