/**
 * Reviewer Rubric for Content
 * 
 * Standardized grading criteria for HITL content review:
 * - Tone (1-5)
 * - Accuracy (1-5)
 * - Policy Compliance (1-5)
 */

// ============================================================================
// Types
// ============================================================================

export interface RubricCriteria {
  category: 'tone' | 'accuracy' | 'policy';
  grade: 1 | 2 | 3 | 4 | 5;
  description: string;
  examples: string[];
}

export interface ReviewGuidelines {
  category: 'tone' | 'accuracy' | 'policy';
  title: string;
  description: string;
  criteria: RubricCriteria[];
  commonIssues: string[];
  bestPractices: string[];
}

// ============================================================================
// Rubric Definitions
// ============================================================================

export const TONE_RUBRIC: ReviewGuidelines = {
  category: 'tone',
  title: 'Tone & Voice',
  description: 'Evaluate how well the content matches brand voice and resonates with audience',
  criteria: [
    {
      category: 'tone',
      grade: 5,
      description: 'Perfect brand voice - authentic, engaging, and on-brand',
      examples: [
        'Matches brand personality exactly',
        'Appropriate level of formality',
        'Engaging and conversational',
      ],
    },
    {
      category: 'tone',
      grade: 4,
      description: 'Good tone with minor adjustments needed',
      examples: [
        'Mostly on-brand with small tweaks',
        'Slightly too formal or casual',
        'Good but could be more engaging',
      ],
    },
    {
      category: 'tone',
      grade: 3,
      description: 'Acceptable but needs improvement',
      examples: [
        'Generic or bland voice',
        'Inconsistent tone',
        'Missing brand personality',
      ],
    },
    {
      category: 'tone',
      grade: 2,
      description: 'Poor tone - significant issues',
      examples: [
        'Wrong tone for audience',
        'Too salesy or pushy',
        'Lacks authenticity',
      ],
    },
    {
      category: 'tone',
      grade: 1,
      description: 'Unacceptable - complete rewrite needed',
      examples: [
        'Completely off-brand',
        'Inappropriate or offensive',
        'Robotic or impersonal',
      ],
    },
  ],
  commonIssues: [
    'Too formal for social media',
    'Overly promotional language',
    'Lacks personality',
    'Inconsistent with previous posts',
  ],
  bestPractices: [
    'Use conversational language',
    'Show brand personality',
    'Be authentic and genuine',
    'Match audience expectations',
  ],
};

export const ACCURACY_RUBRIC: ReviewGuidelines = {
  category: 'accuracy',
  title: 'Accuracy & Facts',
  description: 'Verify all facts, claims, and product information are correct',
  criteria: [
    {
      category: 'accuracy',
      grade: 5,
      description: 'Completely accurate - all facts verified',
      examples: [
        'All product details correct',
        'Pricing accurate',
        'Claims are substantiated',
      ],
    },
    {
      category: 'accuracy',
      grade: 4,
      description: 'Mostly accurate with minor corrections',
      examples: [
        'Small typos or formatting',
        'Minor detail needs update',
        'One small factual error',
      ],
    },
    {
      category: 'accuracy',
      grade: 3,
      description: 'Some inaccuracies present',
      examples: [
        'Multiple small errors',
        'Outdated information',
        'Vague or unclear claims',
      ],
    },
    {
      category: 'accuracy',
      grade: 2,
      description: 'Significant inaccuracies',
      examples: [
        'Wrong product information',
        'Incorrect pricing',
        'Misleading claims',
      ],
    },
    {
      category: 'accuracy',
      grade: 1,
      description: 'Mostly incorrect - cannot be published',
      examples: [
        'Major factual errors',
        'False claims',
        'Completely wrong information',
      ],
    },
  ],
  commonIssues: [
    'Outdated product information',
    'Incorrect pricing or availability',
    'Unverified claims',
    'Typos in product names',
  ],
  bestPractices: [
    'Verify all facts before posting',
    'Check product catalog for accuracy',
    'Confirm pricing and availability',
    'Substantiate all claims',
  ],
};

export const POLICY_RUBRIC: ReviewGuidelines = {
  category: 'policy',
  title: 'Policy Compliance',
  description: 'Ensure content complies with platform policies and brand guidelines',
  criteria: [
    {
      category: 'policy',
      grade: 5,
      description: 'Fully compliant with all policies',
      examples: [
        'Follows platform guidelines',
        'Adheres to brand guidelines',
        'No policy violations',
      ],
    },
    {
      category: 'policy',
      grade: 4,
      description: 'Compliant with minor policy notes',
      examples: [
        'Small guideline clarification needed',
        'Minor formatting adjustment',
        'One small policy consideration',
      ],
    },
    {
      category: 'policy',
      grade: 3,
      description: 'Some policy concerns',
      examples: [
        'Borderline policy compliance',
        'Missing required disclosures',
        'Unclear compliance',
      ],
    },
    {
      category: 'policy',
      grade: 2,
      description: 'Policy violations present',
      examples: [
        'Missing FTC disclosures',
        'Violates platform rules',
        'Brand guideline violations',
      ],
    },
    {
      category: 'policy',
      grade: 1,
      description: 'Major policy violations - cannot publish',
      examples: [
        'Illegal claims',
        'Prohibited content',
        'Serious guideline violations',
      ],
    },
  ],
  commonIssues: [
    'Missing #ad or #sponsored tags',
    'Prohibited claims (medical, etc.)',
    'Copyright violations',
    'Inappropriate content',
  ],
  bestPractices: [
    'Include required disclosures',
    'Follow FTC guidelines',
    'Respect copyright',
    'Adhere to platform policies',
  ],
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get all rubric guidelines
 */
export function getAllRubrics(): ReviewGuidelines[] {
  return [TONE_RUBRIC, ACCURACY_RUBRIC, POLICY_RUBRIC];
}

/**
 * Get rubric by category
 */
export function getRubric(category: 'tone' | 'accuracy' | 'policy'): ReviewGuidelines {
  const rubrics = {
    tone: TONE_RUBRIC,
    accuracy: ACCURACY_RUBRIC,
    policy: POLICY_RUBRIC,
  };
  return rubrics[category];
}

/**
 * Get criteria for specific grade
 */
export function getCriteriaForGrade(
  category: 'tone' | 'accuracy' | 'policy',
  grade: 1 | 2 | 3 | 4 | 5
): RubricCriteria {
  const rubric = getRubric(category);
  return rubric.criteria.find(c => c.grade === grade)!;
}

/**
 * Calculate overall quality score
 */
export function calculateOverallScore(
  toneGrade: number,
  accuracyGrade: number,
  policyGrade: number
): {
  score: number;
  rating: 'excellent' | 'good' | 'acceptable' | 'poor' | 'unacceptable';
  recommendation: string;
} {
  const avgScore = (toneGrade + accuracyGrade + policyGrade) / 3;

  let rating: 'excellent' | 'good' | 'acceptable' | 'poor' | 'unacceptable';
  let recommendation: string;

  if (avgScore >= 4.5) {
    rating = 'excellent';
    recommendation = 'Publish as-is or with minor tweaks';
  } else if (avgScore >= 3.5) {
    rating = 'good';
    recommendation = 'Publish with minor edits';
  } else if (avgScore >= 2.5) {
    rating = 'acceptable';
    recommendation = 'Needs moderate revisions before publishing';
  } else if (avgScore >= 1.5) {
    rating = 'poor';
    recommendation = 'Significant revisions required';
  } else {
    rating = 'unacceptable';
    recommendation = 'Complete rewrite needed - do not publish';
  }

  return { score: avgScore, rating, recommendation };
}

