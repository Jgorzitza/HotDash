/**
 * Fixtures Factory for Dashboard Tiles
 * 
 * Generates test data for all dashboard tiles
 * 
 * Backlog Task #14
 * @see docs/specs/test_plan_template.md
 */

export interface TileData {
  id: string;
  name: string;
  value: number | string;
  trend: 'up' | 'down' | 'flat';
  trendValue: number;
  period: string;
  metadata?: Record<string, any>;
}

export interface RevenueTileData extends TileData {
  currency: string;
  breakdown: {
    online: number;
    pos: number;
  };
}

export interface AOVTileData extends TileData {
  currency: string;
  orderCount: number;
}

export interface ReturnsTileData extends TileData {
  count: number;
  rate: number;
  reasons: Array<{
    reason: string;
    count: number;
  }>;
}

export interface StockTileData extends TileData {
  lowStock: {
    count: number;
    items: Array<{
      id: string;
      name: string;
      quantity: number;
      reorderPoint: number;
    }>;
  };
  outOfStock: {
    count: number;
    items: Array<{
      id: string;
      name: string;
    }>;
  };
  urgentReorder: {
    count: number;
    items: Array<{
      id: string;
      name: string;
      daysUntilStockout: number;
    }>;
  };
}

export interface SEOTileData extends TileData {
  anomalies: Array<{
    keyword: string;
    severity: 'critical' | 'warning' | 'info';
    change: number;
    message: string;
  }>;
}

export interface CXQueueTileData extends TileData {
  pending: number;
  avgResponseTime: number;
  slaBreaches: number;
}

export interface ApprovalsTileData extends TileData {
  pendingReview: number;
  approved: number;
  rejected: number;
  avgApprovalTime: number;
}

/**
 * Fixtures Factory
 */
export class TilesFixtureFactory {
  /**
   * Generate Revenue Tile Data
   */
  static revenue(overrides?: Partial<RevenueTileData>): RevenueTileData {
    return {
      id: 'revenue',
      name: 'Revenue',
      value: 125000,
      trend: 'up',
      trendValue: 12.5,
      period: 'Last 30 days',
      currency: 'USD',
      breakdown: {
        online: 100000,
        pos: 25000
      },
      ...overrides
    };
  }

  /**
   * Generate AOV Tile Data
   */
  static aov(overrides?: Partial<AOVTileData>): AOVTileData {
    return {
      id: 'aov',
      name: 'AOV',
      value: 85.50,
      trend: 'up',
      trendValue: 5.2,
      period: 'Last 30 days',
      currency: 'USD',
      orderCount: 1462,
      ...overrides
    };
  }

  /**
   * Generate Returns Tile Data
   */
  static returns(overrides?: Partial<ReturnsTileData>): ReturnsTileData {
    return {
      id: 'returns',
      name: 'Returns',
      value: '3.2%',
      trend: 'down',
      trendValue: -0.5,
      period: 'Last 30 days',
      count: 47,
      rate: 0.032,
      reasons: [
        { reason: 'Size issue', count: 20 },
        { reason: 'Damaged', count: 12 },
        { reason: 'Wrong item', count: 8 },
        { reason: 'Other', count: 7 }
      ],
      ...overrides
    };
  }

  /**
   * Generate Stock Risk Tile Data
   */
  static stock(overrides?: Partial<StockTileData>): StockTileData {
    return {
      id: 'stock',
      name: 'Stock Risk',
      value: 12,
      trend: 'flat',
      trendValue: 0,
      period: 'Current',
      lowStock: {
        count: 8,
        items: [
          { id: 'prod-1', name: 'Product A', quantity: 15, reorderPoint: 20 },
          { id: 'prod-2', name: 'Product B', quantity: 12, reorderPoint: 20 },
          { id: 'prod-3', name: 'Product C', quantity: 18, reorderPoint: 25 }
        ]
      },
      outOfStock: {
        count: 2,
        items: [
          { id: 'prod-4', name: 'Product D' },
          { id: 'prod-5', name: 'Product E' }
        ]
      },
      urgentReorder: {
        count: 2,
        items: [
          { id: 'prod-6', name: 'Product F', daysUntilStockout: 3 },
          { id: 'prod-7', name: 'Product G', daysUntilStockout: 5 }
        ]
      },
      ...overrides
    };
  }

  /**
   * Generate SEO Anomalies Tile Data
   */
  static seo(overrides?: Partial<SEOTileData>): SEOTileData {
    return {
      id: 'seo',
      name: 'SEO Anomalies',
      value: 3,
      trend: 'up',
      trendValue: 2,
      period: 'Last 7 days',
      anomalies: [
        {
          keyword: 'hot sauce',
          severity: 'critical',
          change: -15,
          message: 'Ranking dropped from #3 to #18'
        },
        {
          keyword: 'spicy condiments',
          severity: 'warning',
          change: -5,
          message: 'Ranking dropped from #8 to #13'
        },
        {
          keyword: 'gourmet hot sauce',
          severity: 'info',
          change: 3,
          message: 'Ranking improved from #12 to #9'
        }
      ],
      ...overrides
    };
  }

  /**
   * Generate CX Queue Tile Data
   */
  static cxQueue(overrides?: Partial<CXQueueTileData>): CXQueueTileData {
    return {
      id: 'cx-queue',
      name: 'CX Queue',
      value: 8,
      trend: 'down',
      trendValue: -3,
      period: 'Current',
      pending: 8,
      avgResponseTime: 12, // minutes
      slaBreaches: 1,
      ...overrides
    };
  }

  /**
   * Generate Approvals Queue Tile Data
   */
  static approvals(overrides?: Partial<ApprovalsTileData>): ApprovalsTileData {
    return {
      id: 'approvals',
      name: 'Approvals Queue',
      value: 5,
      trend: 'flat',
      trendValue: 0,
      period: 'Current',
      pendingReview: 5,
      approved: 23,
      rejected: 2,
      avgApprovalTime: 8, // minutes
      ...overrides
    };
  }

  /**
   * Generate All Tiles Data
   */
  static allTiles(): TileData[] {
    return [
      this.revenue(),
      this.aov(),
      this.returns(),
      this.stock(),
      this.seo(),
      this.cxQueue(),
      this.approvals()
    ];
  }

  /**
   * Generate Empty State Data
   */
  static empty(): TileData[] {
    return [
      this.revenue({ value: 0, trend: 'flat', trendValue: 0 }),
      this.aov({ value: 0, trend: 'flat', trendValue: 0, orderCount: 0 }),
      this.returns({ value: '0%', count: 0, rate: 0, trend: 'flat', trendValue: 0 }),
      this.stock({ value: 0, trend: 'flat', trendValue: 0 }),
      this.seo({ value: 0, anomalies: [], trend: 'flat', trendValue: 0 }),
      this.cxQueue({ value: 0, pending: 0, trend: 'flat', trendValue: 0 }),
      this.approvals({ value: 0, pendingReview: 0, trend: 'flat', trendValue: 0 })
    ];
  }

  /**
   * Generate Error State Data
   */
  static error(): TileData[] {
    return this.allTiles().map(tile => ({
      ...tile,
      error: 'Failed to load data',
      value: 'Error'
    }));
  }

  /**
   * Generate Loading State Data
   */
  static loading(): TileData[] {
    return this.allTiles().map(tile => ({
      ...tile,
      loading: true,
      value: '...'
    }));
  }

  /**
   * Generate High Volume Scenario
   */
  static highVolume(): TileData[] {
    return [
      this.revenue({ value: 500000, trend: 'up', trendValue: 45.2 }),
      this.aov({ value: 125.75, trend: 'up', trendValue: 15.3, orderCount: 3976 }),
      this.returns({ value: '5.8%', count: 231, rate: 0.058, trend: 'up', trendValue: 1.2 }),
      this.stock({ value: 45, trend: 'up', trendValue: 12 }),
      this.seo({ value: 12, trend: 'up', trendValue: 8 }),
      this.cxQueue({ value: 32, pending: 32, trend: 'up', trendValue: 15 }),
      this.approvals({ value: 18, pendingReview: 18, trend: 'up', trendValue: 7 })
    ];
  }

  /**
   * Generate Critical Alerts Scenario
   */
  static criticalAlerts(): TileData[] {
    return [
      this.revenue({ value: 45000, trend: 'down', trendValue: -35.5 }),
      this.aov({ value: 52.30, trend: 'down', trendValue: -18.2 }),
      this.returns({ value: '12.5%', count: 187, rate: 0.125, trend: 'up', trendValue: 8.3 }),
      this.stock({ 
        value: 28, 
        trend: 'up', 
        trendValue: 15,
        outOfStock: { count: 15, items: [] },
        urgentReorder: { count: 13, items: [] }
      }),
      this.seo({ 
        value: 8, 
        trend: 'up', 
        trendValue: 6,
        anomalies: [
          { keyword: 'main keyword', severity: 'critical', change: -25, message: 'Major drop' }
        ]
      }),
      this.cxQueue({ value: 45, pending: 45, slaBreaches: 12, trend: 'up', trendValue: 22 }),
      this.approvals({ value: 23, pendingReview: 23, avgApprovalTime: 45, trend: 'up', trendValue: 18 })
    ];
  }

  /**
   * Generate Locale-Specific Data
   */
  static withLocale(locale: string, currency: string): TileData[] {
    return [
      this.revenue({ currency }),
      this.aov({ currency }),
      this.returns(),
      this.stock(),
      this.seo(),
      this.cxQueue(),
      this.approvals()
    ];
  }

  /**
   * Generate Time-Series Data for Testing Trends
   */
  static timeSeries(days: number): Array<{ date: string; tiles: TileData[] }> {
    const series: Array<{ date: string; tiles: TileData[] }> = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      series.push({
        date: date.toISOString().split('T')[0],
        tiles: this.allTiles()
      });
    }
    
    return series;
  }
}

/**
 * Helper function to generate random tile data
 */
export function randomTileData(): TileData[] {
  const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randomTrend = (): 'up' | 'down' | 'flat' => {
    const trends: Array<'up' | 'down' | 'flat'> = ['up', 'down', 'flat'];
    return trends[random(0, 2)];
  };
  
  return [
    TilesFixtureFactory.revenue({ 
      value: random(50000, 200000), 
      trend: randomTrend(),
      trendValue: random(-20, 20)
    }),
    TilesFixtureFactory.aov({ 
      value: random(50, 150), 
      trend: randomTrend(),
      trendValue: random(-10, 10)
    }),
    TilesFixtureFactory.returns({ 
      value: `${random(1, 10)}%`, 
      count: random(10, 100),
      rate: random(1, 10) / 100,
      trend: randomTrend()
    }),
    TilesFixtureFactory.stock({ 
      value: random(0, 50), 
      trend: randomTrend()
    }),
    TilesFixtureFactory.seo({ 
      value: random(0, 15), 
      trend: randomTrend()
    }),
    TilesFixtureFactory.cxQueue({ 
      value: random(0, 30), 
      pending: random(0, 30),
      trend: randomTrend()
    }),
    TilesFixtureFactory.approvals({ 
      value: random(0, 20), 
      pendingReview: random(0, 20),
      trend: randomTrend()
    })
  ];
}

