/**
 * Predictive Analytics Service
 *
 * ANALYTICS-003: Comprehensive predictive analytics for customer behavior and sales forecasting
 * Integrates multiple forecasting models and prediction algorithms
 */
import { type TrendForecast } from './trend-forecast';
import { type DemandForecast } from '../inventory/demand-forecast';
export interface CustomerBehaviorPrediction {
    customerId?: string;
    segment: 'power' | 'casual' | 'new' | 'at_risk' | 'churned';
    churnProbability: number;
    lifetimeValuePrediction: number;
    nextPurchaseProbability: number;
    predictedPurchaseDate: string | null;
    recommendedActions: string[];
    confidence: number;
}
export interface SalesForecast {
    period: {
        start: string;
        end: string;
        days: number;
    };
    predictions: {
        revenue: TrendForecast;
        conversions: TrendForecast;
        averageOrderValue: TrendForecast;
        customerAcquisition: TrendForecast;
    };
    seasonalFactors: {
        factor: string;
        impact: number;
        confidence: number;
    }[];
    recommendations: string[];
    overallConfidence: number;
}
export interface PredictiveInsights {
    customerBehavior: {
        totalCustomers: number;
        atRiskCount: number;
        highValueCount: number;
        predictions: CustomerBehaviorPrediction[];
    };
    salesForecasts: {
        next7Days: SalesForecast;
        next14Days: SalesForecast;
        next30Days: SalesForecast;
    };
    inventoryForecasts: {
        productId: string;
        productName: string;
        forecast: DemandForecast;
    }[];
    actionRecommendations: {
        priority: 'high' | 'medium' | 'low';
        category: 'customer_retention' | 'sales_optimization' | 'inventory_management' | 'marketing';
        action: string;
        expectedImpact: number;
        confidence: number;
    }[];
    generatedAt: string;
}
/**
 * Predict customer behavior and churn risk
 */
export declare function predictCustomerBehavior(customerId?: string): Promise<CustomerBehaviorPrediction[]>;
/**
 * Generate comprehensive sales forecast
 */
export declare function generateSalesForecast(days: 7 | 14 | 30): Promise<SalesForecast>;
/**
 * Generate comprehensive predictive insights
 */
export declare function generatePredictiveInsights(): Promise<PredictiveInsights>;
//# sourceMappingURL=predictive-analytics.d.ts.map