/**
 * KB Configuration and Tuning Parameters
 * Centralized configuration for all KB subsystems
 */

export const KBConfig = {
  /**
   * Search Configuration
   */
  search: {
    // Minimum confidence score for articles to be included in search results
    minConfidence: 0.60,
    
    // Default number of results to return
    defaultLimit: 5,
    
    // Maximum number of results to return
    maxLimit: 20,
    
    // Hybrid search weights
    hybridWeights: {
      semantic: 0.7,  // 70% weight for semantic similarity
      keyword: 0.3    // 30% weight for keyword matching
    },
    
    // Embedding model
    embeddingModel: 'text-embedding-3-small',
    embeddingDimensions: 1536,
    
    // Rate limiting for embedding generation
    embeddingRateLimit: {
      requestsPerMinute: 60,
      delayBetweenRequests: 100 // milliseconds
    }
  },

  /**
   * Quality Scoring Configuration
   */
  quality: {
    // Confidence score formula weights
    confidenceWeights: {
      successRate: 0.4,      // 40% - How often approved without edits
      accuracyGrade: 0.3,    // 30% - Factual correctness
      toneGrade: 0.2,        // 20% - Empathy and professionalism
      policyGrade: 0.1       // 10% - Policy compliance
    },
    
    // Confidence thresholds
    confidenceThresholds: {
      high: 0.80,      // Use freely
      medium: 0.60,    // Use with caution
      low: 0.40,       // Flag for review
      veryLow: 0.00    // Disable/archive
    },
    
    // Quality tier thresholds
    qualityTiers: {
      excellent: {
        confidence: 0.80,
        successRate: 0.80,
        avgGrade: 4.5
      },
      good: {
        confidence: 0.70,
        successRate: 0.70,
        avgGrade: 4.0
      },
      fair: {
        confidence: 0.60,
        successRate: 0.60,
        avgGrade: 3.5
      }
    },
    
    // Archival policy
    archival: {
      daysUnused: 90,
      minConfidence: 0.50
    }
  },

  /**
   * Learning Pipeline Configuration
   */
  learning: {
    // Edit ratio thresholds
    editRatios: {
      minimal: 0.1,      // < 10% edit = high quality
      significant: 0.3,  // >= 30% edit = significant changes
      major: 0.5         // >= 50% edit = major rewrite
    },
    
    // Grade thresholds
    gradeThresholds: {
      excellent: 5,
      good: 4,
      acceptable: 3,
      poor: 2,
      failing: 1
    },
    
    // Learning type classification
    learningTypes: {
      toneImprovement: {
        condition: 'tone <= 3 && accuracy >= 4 && policy >= 4'
      },
      factualCorrection: {
        condition: 'accuracy <= 3'
      },
      policyClarification: {
        condition: 'policy <= 3'
      },
      templateRefinement: {
        condition: 'editRatio < 0.3 && allGrades >= 4'
      },
      newPattern: {
        condition: 'default'
      }
    },
    
    // Article creation thresholds
    articleCreation: {
      minEditRatio: 0.3,
      minGrades: {
        tone: 4,
        accuracy: 4,
        policy: 4
      }
    }
  },

  /**
   * Recurring Issue Detection Configuration
   */
  patterns: {
    // Occurrence thresholds
    occurrenceThresholds: {
      recurring: 3,        // >= 3 in timeWindow = recurring
      critical: 5,         // >= 5 = high priority
      systemic: 10         // >= 10 = escalate to manager
    },
    
    // Time window for pattern detection
    timeWindow: {
      days: 7,
      hours: 168
    },
    
    // Similarity threshold for pattern matching
    similarityThreshold: 0.7,  // 70% Jaccard similarity
    
    // Resolution statuses
    resolutionStatuses: [
      'unresolved',
      'kb_created',
      'escalated',
      'product_issue',
      'policy_update_needed'
    ]
  },

  /**
   * Auto-Update Configuration
   */
  autoUpdate: {
    // Batch update schedule
    batchUpdateInterval: {
      hours: 24
    },
    
    // Stale article detection
    staleThresholds: {
      warning: 60,   // Days since last use
      stale: 90      // Days since last use
    },
    
    // Duplicate detection
    duplicateThreshold: 0.85,  // 85% similarity = duplicate
    
    // Update triggers
    triggers: {
      highQualityApproval: {
        minGrades: 4,
        maxEditRatio: 0.1
      },
      significantEdit: {
        minEditRatio: 0.3,
        minGrades: 4
      },
      lowGrade: {
        maxGrade: 2
      }
    }
  },

  /**
   * Knowledge Graph Configuration
   */
  graph: {
    // Link types and their default strengths
    linkTypes: {
      related: 0.5,
      prerequisite: 0.7,
      alternative: 0.6,
      followup: 0.8
    },
    
    // Auto-discovery thresholds
    autoDiscovery: {
      minStrength: 0.6,
      sameCategoryBonus: 0.3,
      sharedTagBonus: 0.15,
      embeddingSimilarityWeight: 0.4
    },
    
    // Path finding
    pathFinding: {
      maxDepth: 3,
      minPathStrength: 0.3
    }
  },

  /**
   * Telemetry Configuration
   */
  telemetry: {
    // Events to track
    events: {
      search: true,
      articleView: true,
      articleUsage: true,
      learningExtraction: true,
      confidenceUpdate: true,
      articleCreation: true,
      articleArchival: true
    },
    
    // Sampling rates (0-1)
    sampling: {
      search: 1.0,           // 100% - track all searches
      articleView: 0.1,      // 10% - sample article views
      articleUsage: 1.0      // 100% - track all usage
    },
    
    // Retention periods (days)
    retention: {
      events: 90,
      metrics: 365,
      logs: 30
    }
  },

  /**
   * SLO Configuration
   */
  slo: {
    // Search latency targets (milliseconds)
    searchLatency: {
      p50: 100,    // 50th percentile
      p95: 300,    // 95th percentile
      p99: 500     // 99th percentile
    },
    
    // Availability targets
    availability: {
      monthly: 0.999,   // 99.9% uptime
      weekly: 0.995     // 99.5% uptime
    },
    
    // Quality targets
    quality: {
      coverage: 0.70,           // 70% of queries matched
      draftQuality: 0.60,       // 60% minimal edits
      learningVelocity: 5,      // 5 new articles/week
      avgConfidence: 0.70,      // Average confidence >= 0.70
      avgGrades: {
        tone: 4.5,
        accuracy: 4.7,
        policy: 4.8
      }
    },
    
    // Error rate targets
    errorRates: {
      search: 0.001,      // 0.1% error rate
      embedding: 0.005,   // 0.5% error rate
      update: 0.01        // 1% error rate
    }
  },

  /**
   * Privacy Configuration
   */
  privacy: {
    // PII scrubbing rules
    piiScrubbing: {
      enabled: true,
      patterns: {
        email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
        ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
        creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
        address: /\b\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|highway|hwy|square|sq|trail|trl|drive|dr|court|ct|parkway|pkwy|circle|cir|boulevard|blvd)\b/gi
      },
      replacement: '[REDACTED]'
    },
    
    // Data retention
    retention: {
      learningEdits: 365,      // Keep for 1 year
      usageLogs: 90,           // Keep for 90 days
      archivedArticles: 730    // Keep for 2 years
    },
    
    // Anonymization
    anonymization: {
      enabled: true,
      fields: ['reviewer', 'created_by'],
      method: 'hash'  // or 'pseudonym'
    }
  },

  /**
   * Categories Configuration
   */
  categories: [
    'orders',
    'shipping',
    'returns',
    'products',
    'technical',
    'policies'
  ],

  /**
   * Source Types
   */
  sources: [
    'human_edit',
    'template',
    'extracted',
    'manual'
  ]
};

/**
 * Get configuration value by path
 */
export function getConfig(path: string): any {
  const parts = path.split('.');
  let value: any = KBConfig;
  
  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
    } else {
      return undefined;
    }
  }
  
  return value;
}

/**
 * Validate configuration on startup
 */
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate confidence weights sum to 1.0
  const weights = KBConfig.quality.confidenceWeights;
  const sum = weights.successRate + weights.accuracyGrade + weights.toneGrade + weights.policyGrade;
  if (Math.abs(sum - 1.0) > 0.001) {
    errors.push(`Confidence weights must sum to 1.0, got ${sum}`);
  }
  
  // Validate hybrid search weights sum to 1.0
  const hybridSum = KBConfig.search.hybridWeights.semantic + KBConfig.search.hybridWeights.keyword;
  if (Math.abs(hybridSum - 1.0) > 0.001) {
    errors.push(`Hybrid search weights must sum to 1.0, got ${hybridSum}`);
  }
  
  // Validate thresholds are in order
  const thresholds = KBConfig.quality.confidenceThresholds;
  if (thresholds.high <= thresholds.medium || thresholds.medium <= thresholds.low) {
    errors.push('Confidence thresholds must be in descending order');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

