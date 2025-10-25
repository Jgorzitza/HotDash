/**
 * AI Customer Service Training Data and Templates Service
 *
 * Manages AI training data, response templates, and knowledge base
 * for the AI customer service system.
 *
 * @module app/services/ai-customer/training-data.service
 */
import { createClient } from '@supabase/supabase-js';
import { logDecision } from '../decisions.server.js';
export class TrainingDataService {
    supabase;
    trainingData = [];
    knowledgeBase = [];
    constructor() {
        this.supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    }
    /**
     * Initialize training data service
     */
    async initialize() {
        try {
            await this.loadTrainingData();
            await this.loadKnowledgeBase();
            console.log('✅ Training data service initialized');
        }
        catch (error) {
            console.error('❌ Failed to initialize training data service:', error);
            throw error;
        }
    }
    /**
     * Get training data for AI model training
     */
    async getTrainingData(category) {
        try {
            if (category) {
                return this.trainingData.filter(data => data.category === category && data.isActive);
            }
            return this.trainingData.filter(data => data.isActive);
        }
        catch (error) {
            console.error('Error getting training data:', error);
            throw error;
        }
    }
    /**
     * Search knowledge base for relevant information
     */
    async searchKnowledgeBase(query, category) {
        try {
            const queryLower = query.toLowerCase();
            let results = this.knowledgeBase.filter(entry => entry.isActive);
            if (category) {
                results = results.filter(entry => entry.category === category);
            }
            // Score entries based on relevance
            const scoredResults = results.map(entry => {
                let score = 0;
                // Check title match
                if (entry.title.toLowerCase().includes(queryLower)) {
                    score += 10;
                }
                // Check content match
                if (entry.content.toLowerCase().includes(queryLower)) {
                    score += 5;
                }
                // Check tag matches
                const tagMatches = entry.tags.filter(tag => tag.toLowerCase().includes(queryLower) || queryLower.includes(tag.toLowerCase())).length;
                score += tagMatches * 3;
                // Check search keyword matches
                const keywordMatches = entry.searchKeywords.filter(keyword => keyword.toLowerCase().includes(queryLower) || queryLower.includes(keyword.toLowerCase())).length;
                score += keywordMatches * 2;
                return { ...entry, relevanceScore: score };
            });
            // Sort by relevance score and return top results
            return scoredResults
                .filter(result => result.relevanceScore > 0)
                .sort((a, b) => b.relevanceScore - a.relevanceScore)
                .slice(0, 10);
        }
        catch (error) {
            console.error('Error searching knowledge base:', error);
            throw error;
        }
    }
    /**
     * Add new training data
     */
    async addTrainingData(category, question, answer, tags = []) {
        try {
            const { data: trainingData, error } = await this.supabase
                .from('ai_training_data')
                .insert({
                category,
                question,
                answer,
                tags,
                confidence: 0.8, // Default confidence
                usage_count: 0,
                success_rate: 0,
                last_updated: new Date().toISOString(),
                is_active: true,
            })
                .select()
                .single();
            if (error) {
                throw new Error(`Failed to add training data: ${error.message}`);
            }
            // Reload training data
            await this.loadTrainingData();
            // Log decision
            await logDecision({
                scope: 'build',
                actor: 'ai-customer',
                taskId: 'AI-CUSTOMER-001',
                status: 'in_progress',
                progressPct: 75,
                action: 'training_data_added',
                rationale: `Added new training data for category: ${category}`,
                evidenceUrl: `app/services/ai-customer/training-data.service.ts`,
                payload: {
                    trainingDataId: trainingData.id,
                    category,
                    tags,
                },
            });
            return trainingData;
        }
        catch (error) {
            console.error('Error adding training data:', error);
            throw error;
        }
    }
    /**
     * Update training data performance
     */
    async updateTrainingDataPerformance(trainingDataId, success, confidence) {
        try {
            // Get current training data
            const { data: currentData, error: fetchError } = await this.supabase
                .from('ai_training_data')
                .select('usage_count, success_rate, confidence')
                .eq('id', trainingDataId)
                .single();
            if (fetchError || !currentData) {
                return;
            }
            // Calculate new metrics
            const newUsageCount = currentData.usage_count + 1;
            const currentSuccesses = Math.round((currentData.success_rate / 100) * currentData.usage_count);
            const newSuccesses = success ? currentSuccesses + 1 : currentSuccesses;
            const newSuccessRate = (newSuccesses / newUsageCount) * 100;
            const newConfidence = confidence || currentData.confidence;
            // Update training data
            await this.supabase
                .from('ai_training_data')
                .update({
                usage_count: newUsageCount,
                success_rate: newSuccessRate,
                confidence: newConfidence,
                last_updated: new Date().toISOString(),
            })
                .eq('id', trainingDataId);
            // Reload training data
            await this.loadTrainingData();
        }
        catch (error) {
            console.error('Error updating training data performance:', error);
        }
    }
    /**
     * Add knowledge base entry
     */
    async addKnowledgeBaseEntry(title, content, category, tags = [], relatedProducts = [], searchKeywords = []) {
        try {
            const { data: knowledgeEntry, error } = await this.supabase
                .from('knowledge_base')
                .insert({
                title,
                content,
                category,
                tags,
                related_products: relatedProducts,
                search_keywords: searchKeywords,
                last_updated: new Date().toISOString(),
                is_active: true,
            })
                .select()
                .single();
            if (error) {
                throw new Error(`Failed to add knowledge base entry: ${error.message}`);
            }
            // Reload knowledge base
            await this.loadKnowledgeBase();
            // Log decision
            await logDecision({
                scope: 'build',
                actor: 'ai-customer',
                taskId: 'AI-CUSTOMER-001',
                status: 'in_progress',
                progressPct: 80,
                action: 'knowledge_base_entry_added',
                rationale: `Added new knowledge base entry: ${title}`,
                evidenceUrl: `app/services/ai-customer/training-data.service.ts`,
                payload: {
                    knowledgeEntryId: knowledgeEntry.id,
                    title,
                    category,
                    tags,
                },
            });
            return knowledgeEntry;
        }
        catch (error) {
            console.error('Error adding knowledge base entry:', error);
            throw error;
        }
    }
    /**
     * Get training metrics
     */
    async getTrainingMetrics() {
        try {
            const activeEntries = this.trainingData.filter(data => data.isActive);
            const totalTrainingData = activeEntries.length;
            const averageConfidence = activeEntries.length > 0
                ? activeEntries.reduce((sum, data) => sum + data.confidence, 0) / activeEntries.length
                : 0;
            const averageSuccessRate = activeEntries.length > 0
                ? activeEntries.reduce((sum, data) => sum + data.successRate, 0) / activeEntries.length
                : 0;
            // Calculate category distribution
            const categoryDistribution = {};
            activeEntries.forEach(data => {
                categoryDistribution[data.category] = (categoryDistribution[data.category] || 0) + 1;
            });
            // Get top performing entries
            const topPerformingEntries = activeEntries
                .filter(data => data.usageCount > 0)
                .sort((a, b) => (b.successRate * b.usageCount) - (a.successRate * a.usageCount))
                .slice(0, 10);
            // Generate improvement recommendations
            const improvementRecommendations = this.generateImprovementRecommendations(activeEntries);
            return {
                totalTrainingData,
                activeEntries,
                averageConfidence,
                averageSuccessRate,
                categoryDistribution,
                topPerformingEntries,
                improvementRecommendations,
            };
        }
        catch (error) {
            console.error('Error getting training metrics:', error);
            throw error;
        }
    }
    /**
     * Generate improvement recommendations
     */
    generateImprovementRecommendations(trainingData) {
        const recommendations = [];
        // Check for low confidence entries
        const lowConfidenceEntries = trainingData.filter(data => data.confidence < 0.7);
        if (lowConfidenceEntries.length > 0) {
            recommendations.push(`Review and improve ${lowConfidenceEntries.length} entries with low confidence scores`);
        }
        // Check for unused entries
        const unusedEntries = trainingData.filter(data => data.usageCount === 0);
        if (unusedEntries.length > 0) {
            recommendations.push(`Consider removing or updating ${unusedEntries.length} unused training entries`);
        }
        // Check for low success rate entries
        const lowSuccessEntries = trainingData.filter(data => data.successRate < 70 && data.usageCount > 5);
        if (lowSuccessEntries.length > 0) {
            recommendations.push(`Improve ${lowSuccessEntries.length} entries with low success rates`);
        }
        // Check category balance
        const categories = [...new Set(trainingData.map(data => data.category))];
        const categoryCounts = categories.map(category => ({
            category,
            count: trainingData.filter(data => data.category === category).length,
        }));
        const minCategoryCount = Math.min(...categoryCounts.map(c => c.count));
        const maxCategoryCount = Math.max(...categoryCounts.map(c => c.count));
        if (maxCategoryCount > minCategoryCount * 3) {
            recommendations.push('Consider balancing training data across categories for better coverage');
        }
        return recommendations;
    }
    /**
     * Load training data from database
     */
    async loadTrainingData() {
        try {
            const { data, error } = await this.supabase
                .from('ai_training_data')
                .select('*')
                .order('last_updated', { ascending: false });
            if (error) {
                throw new Error(`Failed to load training data: ${error.message}`);
            }
            this.trainingData = (data || []).map(item => ({
                id: item.id,
                category: item.category,
                question: item.question,
                answer: item.answer,
                tags: item.tags || [],
                confidence: item.confidence || 0.8,
                usageCount: item.usage_count || 0,
                successRate: item.success_rate || 0,
                lastUpdated: item.last_updated,
                isActive: item.is_active,
            }));
            console.log(`📋 Loaded ${this.trainingData.length} training data entries`);
        }
        catch (error) {
            console.error('Error loading training data:', error);
            // Initialize with default training data if database fails
            this.trainingData = this.getDefaultTrainingData();
        }
    }
    /**
     * Load knowledge base from database
     */
    async loadKnowledgeBase() {
        try {
            const { data, error } = await this.supabase
                .from('knowledge_base')
                .select('*')
                .order('last_updated', { ascending: false });
            if (error) {
                throw new Error(`Failed to load knowledge base: ${error.message}`);
            }
            this.knowledgeBase = (data || []).map(item => ({
                id: item.id,
                title: item.title,
                content: item.content,
                category: item.category,
                tags: item.tags || [],
                relatedProducts: item.related_products || [],
                searchKeywords: item.search_keywords || [],
                lastUpdated: item.last_updated,
                isActive: item.is_active,
            }));
            console.log(`📋 Loaded ${this.knowledgeBase.length} knowledge base entries`);
        }
        catch (error) {
            console.error('Error loading knowledge base:', error);
            // Initialize with default knowledge base if database fails
            this.knowledgeBase = this.getDefaultKnowledgeBase();
        }
    }
    /**
     * Get default training data when database is unavailable
     */
    getDefaultTrainingData() {
        return [
            {
                id: 'training-1',
                category: 'order_support',
                question: 'Where is my order?',
                answer: 'I can help you track your order. Please provide your order number and I\'ll look up the current status for you.',
                tags: ['order', 'tracking', 'status'],
                confidence: 0.95,
                usageCount: 45,
                successRate: 92,
                lastUpdated: new Date().toISOString(),
                isActive: true,
            },
            {
                id: 'training-2',
                category: 'product_support',
                question: 'What products do you have for my car?',
                answer: 'We have a wide selection of automotive parts and accessories. To find products compatible with your specific vehicle, please provide your car\'s make, model, and year.',
                tags: ['products', 'compatibility', 'vehicle'],
                confidence: 0.90,
                usageCount: 32,
                successRate: 88,
                lastUpdated: new Date().toISOString(),
                isActive: true,
            },
            {
                id: 'training-3',
                category: 'billing',
                question: 'How do I get a refund?',
                answer: 'We offer refunds for unused items within 30 days of purchase. Please contact our billing department with your order number and reason for return.',
                tags: ['refund', 'return', 'billing'],
                confidence: 0.85,
                usageCount: 28,
                successRate: 85,
                lastUpdated: new Date().toISOString(),
                isActive: true,
            },
            {
                id: 'training-4',
                category: 'technical_support',
                question: 'How do I install this part?',
                answer: 'We provide detailed installation guides for all our products. You can find installation instructions in the product documentation or contact our technical support team for assistance.',
                tags: ['installation', 'technical', 'guide'],
                confidence: 0.88,
                usageCount: 25,
                successRate: 90,
                lastUpdated: new Date().toISOString(),
                isActive: true,
            },
            {
                id: 'training-5',
                category: 'general',
                question: 'What are your business hours?',
                answer: 'Our customer service hours are Monday through Friday, 8 AM to 6 PM EST. You can reach us by phone, email, or chat during these hours.',
                tags: ['hours', 'contact', 'support'],
                confidence: 0.98,
                usageCount: 15,
                successRate: 100,
                lastUpdated: new Date().toISOString(),
                isActive: true,
            },
        ];
    }
    /**
     * Get default knowledge base when database is unavailable
     */
    getDefaultKnowledgeBase() {
        return [
            {
                id: 'kb-1',
                title: 'Order Tracking and Status',
                content: 'Customers can track their orders using the order number provided in their confirmation email. Orders typically ship within 1-2 business days and arrive within 5-7 business days for standard shipping.',
                category: 'order_support',
                tags: ['order', 'tracking', 'shipping'],
                relatedProducts: [],
                searchKeywords: ['order status', 'tracking', 'shipping', 'delivery'],
                lastUpdated: new Date().toISOString(),
                isActive: true,
            },
            {
                id: 'kb-2',
                title: 'Product Compatibility Guide',
                content: 'All our products include compatibility information in their descriptions. Use our vehicle selector tool or contact technical support for assistance with specific compatibility questions.',
                category: 'product_support',
                tags: ['compatibility', 'vehicle', 'parts'],
                relatedProducts: [],
                searchKeywords: ['compatibility', 'vehicle', 'fit', 'parts'],
                lastUpdated: new Date().toISOString(),
                isActive: true,
            },
            {
                id: 'kb-3',
                title: 'Return and Refund Policy',
                content: 'We accept returns of unused items within 30 days of purchase. Items must be in original packaging with all accessories. Refunds are processed within 5-7 business days after receipt of returned items.',
                category: 'billing',
                tags: ['return', 'refund', 'policy'],
                relatedProducts: [],
                searchKeywords: ['return policy', 'refund', 'return process'],
                lastUpdated: new Date().toISOString(),
                isActive: true,
            },
            {
                id: 'kb-4',
                title: 'Installation Support',
                content: 'We provide comprehensive installation guides, video tutorials, and technical support for all our products. Our technical support team can assist with installation questions and troubleshooting.',
                category: 'technical_support',
                tags: ['installation', 'technical', 'support'],
                relatedProducts: [],
                searchKeywords: ['installation', 'how to install', 'technical support'],
                lastUpdated: new Date().toISOString(),
                isActive: true,
            },
            {
                id: 'kb-5',
                title: 'Contact Information and Hours',
                content: 'Customer service is available Monday through Friday, 8 AM to 6 PM EST. Contact us via phone at 1-800-HOTRODAN, email at support@hotrodan.com, or through our live chat system.',
                category: 'general',
                tags: ['contact', 'hours', 'support'],
                relatedProducts: [],
                searchKeywords: ['contact', 'business hours', 'phone', 'email'],
                lastUpdated: new Date().toISOString(),
                isActive: true,
            },
        ];
    }
}
/**
 * Default training data service instance
 */
export const trainingDataService = new TrainingDataService();
//# sourceMappingURL=training-data.service.js.map