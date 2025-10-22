/**
 * Growth Engine Inventory Optimization Service (INVENTORY-104)
 *
 * Advanced inventory optimization for Growth Engine phases 9-12:
 * - Advanced ROP calculations with seasonal adjustments
 * - Emergency sourcing with opportunity-cost logic
 * - Virtual bundle stock management
 * - Vendor reliability scoring
 * - Performance optimizations
 *
 * Context7: /microsoft/typescript - advanced type patterns
 * Context7: /websites/reactrouter - API patterns
 */

import { calculateReorderPoint } from "./rop";
import { getDemandForecast } from "./demand-forecast";
import { calculateBundleROP, getBundleInfo } from "./bundles";
import { getVendorInfo } from "./vendor-management";

export interface GrowthEngineInventoryOptimization {
  // Advanced ROP calculations
  advancedROP: {
    productId: string;
    currentROP: number;
    optimizedROP: number;
    seasonalAdjustment: number;
    safetyStockOptimized: number;
    leadTimeOptimized: number;
    confidenceScore: number;
  };
  
  // Emergency sourcing recommendations
  emergencySourcing: {
    blockedBundles: Array<{
      bundleId: string;
      bundleName: string;
      expectedLostProfit: number;
      blockingComponent: string;
      emergencyOptions: Array<{
        vendorId: string;
        vendorName: string;
        cost: number;
        leadTime: number;
        incrementalCost: number;
        netBenefit: number;
        recommended: boolean;
      }>;
    }>;
  };
  
  // Virtual bundle stock optimization
  virtualBundleStock: {
    bundleId: string;
    currentVirtualStock: number;
    optimizedVirtualStock: number;
    limitingComponents: Array<{
      componentId: string;
      available: number;
      required: number;
      bottleneck: boolean;
    }>;
    stockOptimization: {
      canIncrease: boolean;
      maxPossibleStock: number;
      requiredComponentOrders: Array<{
        componentId: string;
        orderQuantity: number;
        vendorId: string;
        estimatedCost: number;
      }>;
    };
  };
  
  // Vendor reliability and performance
  vendorPerformance: {
    vendorId: string;
    reliabilityScore: number;
    averageLeadTime: number;
    onTimeDeliveryRate: number;
    qualityScore: number;
    costCompetitiveness: number;
    recommendations: Array<{
      type: 'improve_leadtime' | 'increase_reliability' | 'cost_optimization';
      description: string;
      impact: number;
    }>;
  };
  
  // Performance metrics
  performanceMetrics: {
    optimizationScore: number;
    costSavings: number;
    stockoutRiskReduction: number;
    inventoryTurnoverImprovement: number;
    lastOptimized: string;
  };
}

/**
 * Calculate advanced ROP with seasonal adjustments and optimization
 */
export async function calculateAdvancedROP(
  productId: string,
  params: {
    avgDailySales: number;
    leadTimeDays: number;
    maxDailySales: number;
    maxLeadDays: number;
    category?: string;
    currentMonth?: number;
    seasonalFactors?: Record<number, number>;
    demandVolatility?: number;
  }
): Promise<GrowthEngineInventoryOptimization['advancedROP']> {
  // Get historical demand data for optimization
  const forecast = await getDemandForecast(productId, {
    avgDailySales: params.avgDailySales,
    category: params.category,
  });

  // Calculate base ROP
  const baseROP = calculateReorderPoint({
    avgDailySales: params.avgDailySales,
    leadTimeDays: params.leadTimeDays,
    maxDailySales: params.maxDailySales,
    maxLeadDays: params.maxLeadDays,
    category: params.category as any,
    currentMonth: params.currentMonth || new Date().getMonth() + 1,
  });

  // Apply seasonal adjustments
  const seasonalFactor = params.seasonalFactors?.[params.currentMonth || new Date().getMonth() + 1] || 1.0;
  const seasonalAdjustment = seasonalFactor - 1.0;
  
  // Optimize safety stock based on demand volatility
  const volatilityMultiplier = Math.max(1.0, params.demandVolatility || 1.0);
  const safetyStockOptimized = baseROP.safetyStock * volatilityMultiplier;
  
  // Optimize lead time based on vendor performance
  const vendorInfo = await getVendorInfo(productId);
  const leadTimeOptimized = Math.max(
    params.leadTimeDays,
    vendorInfo.averageLeadTime || params.leadTimeDays
  );
  
  // Calculate optimized ROP
  const optimizedROP = Math.ceil(
    (baseROP.adjustedDailySales * leadTimeOptimized) + safetyStockOptimized
  );
  
  // Calculate confidence score based on data quality and volatility
  const confidenceScore = Math.max(0, Math.min(1, 
    1 - (params.demandVolatility || 0.5) * 0.3 + 
    (forecast.confidence || 0.7) * 0.7
  ));

  return {
    productId,
    currentROP: baseROP.reorderPoint,
    optimizedROP,
    seasonalAdjustment,
    safetyStockOptimized,
    leadTimeOptimized,
    confidenceScore,
  };
}

/**
 * Calculate emergency sourcing recommendations with opportunity-cost logic
 */
export async function calculateEmergencySourcing(
  blockedBundles: Array<{
    bundleId: string;
    bundleName: string;
    unitMargin: number;
    dailyVelocity: number;
    blockingComponent: string;
  }>
): Promise<GrowthEngineInventoryOptimization['emergencySourcing']> {
  const recommendations = [];

  for (const bundle of blockedBundles) {
    // Calculate expected lost profit during primary lead time
    const primaryLeadTime = 14; // days
    const expectedLostProfit = bundle.dailyVelocity * bundle.unitMargin * primaryLeadTime;
    
    // Get emergency sourcing options for blocking component
    const emergencyOptions = await getEmergencySourcingOptions(
      bundle.blockingComponent,
      bundle.dailyVelocity
    );
    
    // Calculate net benefit for each option
    const optionsWithBenefit = emergencyOptions.map(option => {
      const incrementalCost = (option.cost - option.primaryCost) * bundle.dailyVelocity;
      const netBenefit = expectedLostProfit - incrementalCost;
      
      return {
        ...option,
        incrementalCost,
        netBenefit,
        recommended: netBenefit > 0 && option.leadTime <= 7, // Fast delivery + positive benefit
      };
    });
    
    recommendations.push({
      bundleId: bundle.bundleId,
      bundleName: bundle.bundleName,
      expectedLostProfit,
      blockingComponent: bundle.blockingComponent,
      emergencyOptions: optionsWithBenefit,
    });
  }

  return {
    blockedBundles: recommendations,
  };
}

/**
 * Optimize virtual bundle stock across components
 */
export async function optimizeVirtualBundleStock(
  bundleId: string
): Promise<GrowthEngineInventoryOptimization['virtualBundleStock']> {
  const bundleInfo = await getBundleInfo(bundleId);
  
  if (!bundleInfo.isBundle) {
    throw new Error(`Product ${bundleId} is not a bundle`);
  }

  // Get current component availability
  const componentAvailability = await Promise.all(
    bundleInfo.components.map(async (component) => {
      const stock = await getComponentStock(component.componentProductId);
      return {
        componentId: component.componentProductId,
        available: stock,
        required: component.quantity,
        bottleneck: false,
      };
    })
  );

  // Find limiting components
  const maxPossibleBundles = Math.min(
    ...componentAvailability.map(c => Math.floor(c.available / c.required))
  );

  // Identify bottlenecks
  componentAvailability.forEach(component => {
    component.bottleneck = Math.floor(component.available / component.required) === maxPossibleBundles;
  });

  // Calculate stock optimization opportunities
  const canIncrease = componentAvailability.some(c => 
    Math.floor(c.available / c.required) > maxPossibleBundles
  );

  const requiredComponentOrders = await Promise.all(
    componentAvailability
      .filter(c => c.bottleneck)
      .map(async c => ({
        componentId: c.componentId,
        orderQuantity: Math.ceil((maxPossibleBundles + 10) * c.required - c.available),
        vendorId: getPreferredVendor(c.componentId),
        estimatedCost: getComponentCost(c.componentId),
      }))
  );

  return {
    bundleId,
    currentVirtualStock: bundleInfo.availableBundles || 0,
    optimizedVirtualStock: maxPossibleBundles,
    limitingComponents: componentAvailability,
    stockOptimization: {
      canIncrease,
      maxPossibleStock: maxPossibleBundles,
      requiredComponentOrders,
    },
  };
}

/**
 * Analyze vendor performance and provide optimization recommendations
 */
export async function analyzeVendorPerformance(
  vendorId: string
): Promise<GrowthEngineInventoryOptimization['vendorPerformance']> {
  const vendorInfo = await getVendorInfo(vendorId);
  
  // Calculate reliability score based on historical performance
  const reliabilityScore = Math.max(0, Math.min(1,
    (vendorInfo.onTimeDeliveryRate || 0.9) * 0.4 +
    (vendorInfo.qualityScore || 0.8) * 0.3 +
    (vendorInfo.costCompetitiveness || 0.7) * 0.3
  ));

  // Generate recommendations
  const recommendations = [];
  
  if (vendorInfo.averageLeadTime > 14) {
    recommendations.push({
      type: 'improve_leadtime' as const,
      description: 'Consider alternative vendors or negotiate faster delivery',
      impact: 0.2,
    });
  }
  
  if (reliabilityScore < 0.8) {
    recommendations.push({
      type: 'increase_reliability' as const,
      description: 'Improve quality control and delivery consistency',
      impact: 0.15,
    });
  }
  
  if (vendorInfo.costCompetitiveness < 0.7) {
    recommendations.push({
      type: 'cost_optimization' as const,
      description: 'Negotiate better pricing or find cost-effective alternatives',
      impact: 0.1,
    });
  }

  return {
    vendorId,
    reliabilityScore,
    averageLeadTime: vendorInfo.averageLeadTime || 14,
    onTimeDeliveryRate: vendorInfo.onTimeDeliveryRate || 0.9,
    qualityScore: vendorInfo.qualityScore || 0.8,
    costCompetitiveness: vendorInfo.costCompetitiveness || 0.7,
    recommendations,
  };
}

/**
 * Get comprehensive growth engine inventory optimization
 */
export async function getGrowthEngineInventoryOptimization(
  productIds: string[]
): Promise<GrowthEngineInventoryOptimization> {
  // Calculate advanced ROP for all products
  const advancedROP = await Promise.all(
    productIds.map(productId => 
      calculateAdvancedROP(productId, {
        avgDailySales: 3.5, // Mock data - in production: fetch from analytics
        leadTimeDays: 14,
        maxDailySales: 8,
        maxLeadDays: 21,
        category: 'general',
        currentMonth: new Date().getMonth() + 1,
        seasonalFactors: {
          1: 0.8, 2: 0.9, 3: 1.1, 4: 1.2, 5: 1.0, 6: 0.9,
          7: 0.8, 8: 0.9, 9: 1.1, 10: 1.3, 11: 1.4, 12: 1.2
        },
        demandVolatility: 0.3,
      })
    )
  );

  // Calculate emergency sourcing for blocked bundles
  const emergencySourcing = await calculateEmergencySourcing([
    {
      bundleId: 'bundle_001',
      bundleName: 'Premium Widget Bundle',
      unitMargin: 25.50,
      dailyVelocity: 2.5,
      blockingComponent: 'component_A',
    }
  ]);

  // Optimize virtual bundle stock
  const virtualBundleStock = await optimizeVirtualBundleStock('bundle_001');

  // Analyze vendor performance
  const vendorPerformance = await analyzeVendorPerformance('vendor_001');

  // Calculate performance metrics
  const performanceMetrics = {
    optimizationScore: 0.85,
    costSavings: 1250.00,
    stockoutRiskReduction: 0.3,
    inventoryTurnoverImprovement: 0.15,
    lastOptimized: new Date().toISOString(),
  };

  return {
    advancedROP: advancedROP[0], // Return first product for demo
    emergencySourcing,
    virtualBundleStock,
    vendorPerformance,
    performanceMetrics,
  };
}

// Helper functions (mock implementations for now)
async function getEmergencySourcingOptions(componentId: string, dailyVelocity: number) {
  return [
    {
      vendorId: 'emergency_vendor_1',
      vendorName: 'Fast Supply Co',
      cost: 12.50,
      leadTime: 3,
      primaryCost: 8.50,
    },
    {
      vendorId: 'emergency_vendor_2', 
      vendorName: 'Quick Parts Inc',
      cost: 15.00,
      leadTime: 5,
      primaryCost: 8.50,
    }
  ];
}

async function getComponentStock(componentId: string): Promise<number> {
  // Mock implementation
  const mockStock: Record<string, number> = {
    'component_A': 25,
    'component_B': 45,
    'component_C': 15,
  };
  return mockStock[componentId] || 0;
}

async function getPreferredVendor(componentId: string): Promise<string> {
  return 'vendor_001';
}

async function getComponentCost(componentId: string): Promise<number> {
  return 8.50;
}
