/**
 * CEO Tone Checklist Validator
 *
 * Validates social media post copy against brand voice guidelines.
 * References Designer microcopy standards from content_pipeline.md
 *
 * @see docs/specs/content_pipeline.md (Copy QA Checklist, Microcopy Standards)
 * @see app/services/content/post-drafter.ts
 */

/**
 * Tone Validation Result
 */
export interface ToneValidationResult {
  overall: "pass" | "review" | "fail";
  checks: {
    brand_voice: {
      status: "pass" | "review" | "fail";
      score: number; // 0-100
      issues: string[];
      suggestions: string[];
    };
    content_accuracy: {
      status: "pass" | "review" | "fail";
      issues: string[];
    };
    seo_discoverability: {
      status: "pass" | "review" | "fail";
      issues: string[];
      suggestions: string[];
    };
    platform_guidelines: {
      status: "pass" | "review" | "fail";
      issues: string[];
    };
  };
  cta_analysis: {
    present: boolean;
    type?: "primary" | "secondary" | "urgency";
    effectiveness: "strong" | "moderate" | "weak";
  };
  length_analysis: {
    character_count: number;
    optimal: boolean;
    platform_limit?: number;
  };
  readability: {
    grade_level: number; // Flesch-Kincaid grade level
    score: number; // 0-100 (higher = easier to read)
    recommendation: string;
  };
}

/**
 * Brand Voice Guidelines (from content_pipeline.md)
 */
const BRAND_VOICE_RULES = {
  // Positive indicators (conversational, enthusiast peer)
  positive_keywords: [
    "you",
    "your",
    "we",
    "our",
    "together",
    "check out",
    "discover",
    "love",
    "passion",
  ],

  // Negative indicators (overly salesy, spammy)
  negative_keywords: [
    "buy now!!!",
    "click here!!!",
    "limited time!!!",
    "act now!!!",
    "don't miss out!!!",
    "exclusive deal!!!",
  ],

  // Jargon to avoid (unless explaining)
  jargon_to_avoid: ["synergy", "leverage", "disruptive", "paradigm"],

  // Tone markers
  conversational_markers: ["?", "!", "..."],

  // Hot rod community language (appropriate jargon)
  community_language: [
    "hot rod",
    "classic",
    "restoration",
    "build",
    "vintage",
    "custom",
    "period-correct",
  ],
};

/**
 * Platform Character Limits (from content_pipeline.md)
 */
const PLATFORM_LIMITS: Record<string, { optimal: number; max: number }> = {
  instagram: { optimal: 125, max: 2200 },
  facebook: { optimal: 120, max: 63206 },
  tiktok: { optimal: 100, max: 2200 },
};

/**
 * CTA Patterns (from content_pipeline.md - Microcopy Standards)
 */
const CTA_PATTERNS = {
  primary: [
    /shop\s+[\w\s]+/i,
    /pre-order\s+now/i,
    /get\s+yours/i,
    /order\s+now/i,
  ],
  secondary: [/learn\s+more/i, /see\s+details/i, /check\s+out/i, /discover/i],
  urgency: [
    /limited\s+stock/i,
    /first\s+\d+\s+units/i,
    /while\s+supplies\s+last/i,
    /today\s+only/i,
  ],
};

/**
 * Validate Post Tone
 *
 * Comprehensive tone check against brand voice guidelines.
 *
 * @param text - Post copy to validate
 * @param platform - Target platform (for length check)
 * @returns Validation result with issues and suggestions
 */
export function validateTone(
  text: string,
  platform: "instagram" | "facebook" | "tiktok",
): ToneValidationResult {
  const textLower = text.toLowerCase();

  // Brand voice check
  const brandVoice = checkBrandVoice(text, textLower);

  // Content accuracy check (basic - would integrate with product data in production)
  const contentAccuracy = checkContentAccuracy(text);

  // SEO & Discoverability
  const seo = checkSEO(text, textLower);

  // Platform-specific guidelines
  const platformGuidelines = checkPlatformGuidelines(text, platform);

  // CTA analysis
  const ctaAnalysis = analyzeCTA(text);

  // Length analysis
  const lengthAnalysis = analyzeLength(text, platform);

  // Readability
  const readability = calculateReadability(text);

  // Overall status
  const overall = determineOverallStatus([
    brandVoice.status,
    contentAccuracy.status,
    seo.status,
    platformGuidelines.status,
  ]);

  return {
    overall,
    checks: {
      brand_voice: brandVoice,
      content_accuracy: contentAccuracy,
      seo_discoverability: seo,
      platform_guidelines: platformGuidelines,
    },
    cta_analysis: ctaAnalysis,
    length_analysis: lengthAnalysis,
    readability,
  };
}

/**
 * Check Brand Voice
 */
function checkBrandVoice(
  text: string,
  textLower: string,
): {
  status: "pass" | "review" | "fail";
  score: number;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 50; // Start at 50

  // Check for spammy keywords (negative)
  const spammyWords = BRAND_VOICE_RULES.negative_keywords.filter((word) =>
    textLower.includes(word),
  );
  if (spammyWords.length > 0) {
    issues.push(`Avoid spammy language: ${spammyWords.join(", ")}`);
    score -= 30;
    suggestions.push("Remove excessive punctuation and urgency language");
  }

  // Check for conversational tone (positive)
  const conversationalWords = BRAND_VOICE_RULES.positive_keywords.filter(
    (word) => textLower.includes(word),
  );
  if (conversationalWords.length >= 2) {
    score += 20;
  } else if (conversationalWords.length === 0) {
    issues.push("Lacks conversational tone - add 'you', 'we', or 'your'");
    suggestions.push("Write as if talking to a fellow enthusiast");
  }

  // Check for community language (positive)
  const communityWords = BRAND_VOICE_RULES.community_language.filter((word) =>
    textLower.includes(word),
  );
  if (communityWords.length >= 1) {
    score += 15;
  }

  // Check for inappropriate jargon (negative)
  const jargonWords = BRAND_VOICE_RULES.jargon_to_avoid.filter((word) =>
    textLower.includes(word),
  );
  if (jargonWords.length > 0) {
    issues.push(`Avoid business jargon: ${jargonWords.join(", ")}`);
    score -= 15;
  }

  // Determine status
  const status: "pass" | "review" | "fail" =
    score >= 70 ? "pass" : score >= 50 ? "review" : "fail";

  return {
    status,
    score: Math.max(0, Math.min(100, score)),
    issues,
    suggestions:
      suggestions.length > 0
        ? suggestions
        : ["Tone looks good - conversational and on-brand"],
  };
}

/**
 * Check Content Accuracy
 */
function checkContentAccuracy(text: string): {
  status: "pass" | "review" | "fail";
  issues: string[];
} {
  const issues: string[] = [];

  // Check for common issues
  if (text.includes("$") && !text.match(/\$\d+/)) {
    issues.push("Price mentioned without specific amount");
  }

  // Check for unverifiable claims
  const unverifiableWords = ["best", "perfect", "guaranteed", "never"];
  const foundUnverifiable = unverifiableWords.filter((word) =>
    text.toLowerCase().includes(word),
  );
  if (foundUnverifiable.length > 0) {
    issues.push("Unverifiable claims - ensure accuracy or remove");
  }

  return {
    status: issues.length === 0 ? "pass" : "review",
    issues,
  };
}

/**
 * Check SEO & Discoverability
 */
function checkSEO(
  text: string,
  _textLower: string,
): {
  status: "pass" | "review" | "fail";
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check for primary keyword in first 100 characters
  const first100 = text.substring(0, 100);
  const hasKeyword = ["hot rod", "classic", "shift knob", "restoration"].some(
    (keyword) => first100.toLowerCase().includes(keyword),
  );

  if (!hasKeyword) {
    issues.push("Primary keyword should appear in first 100 characters");
    suggestions.push("Front-load product type or benefit in opening");
  }

  // Check for hashtags (if applicable for platform)
  if (!text.includes("#")) {
    suggestions.push("Consider adding 2-4 relevant hashtags");
  }

  return {
    status: issues.length === 0 ? "pass" : "review",
    issues,
    suggestions,
  };
}

/**
 * Check Platform-Specific Guidelines
 */
function checkPlatformGuidelines(
  text: string,
  platform: string,
): {
  status: "pass" | "review" | "fail";
  issues: string[];
} {
  const issues: string[] = [];

  if (platform === "instagram") {
    // Instagram: Check for link in caption (not clickable)
    if (text.match(/https?:\/\//)) {
      issues.push(
        "Instagram: Links in captions aren't clickable - use 'link in bio' instead",
      );
    }

    // Check for excessive hashtags
    const hashtagCount = (text.match(/#/g) || []).length;
    if (hashtagCount > 10) {
      issues.push(
        `Too many hashtags (${hashtagCount}) - keep to 5-7 for best reach`,
      );
    }
  }

  if (platform === "facebook") {
    // Facebook: Check for link placement
    if (
      !text.match(/https?:\/\//) &&
      text.toLowerCase().includes("learn more")
    ) {
      issues.push("Facebook: Include link URL when using 'learn more' CTA");
    }
  }

  return {
    status: issues.length === 0 ? "pass" : "review",
    issues,
  };
}

/**
 * Analyze CTA
 */
function analyzeCTA(text: string): {
  present: boolean;
  type?: "primary" | "secondary" | "urgency";
  effectiveness: "strong" | "moderate" | "weak";
} {
  let type: "primary" | "secondary" | "urgency" | undefined;

  // Check for CTA patterns
  for (const pattern of CTA_PATTERNS.primary) {
    if (pattern.test(text)) {
      type = "primary";
      break;
    }
  }

  if (!type) {
    for (const pattern of CTA_PATTERNS.secondary) {
      if (pattern.test(text)) {
        type = "secondary";
        break;
      }
    }
  }

  if (!type) {
    for (const pattern of CTA_PATTERNS.urgency) {
      if (pattern.test(text)) {
        type = "urgency";
        break;
      }
    }
  }

  const present = !!type;
  const effectiveness: "strong" | "moderate" | "weak" =
    type === "primary" || type === "urgency"
      ? "strong"
      : type === "secondary"
        ? "moderate"
        : "weak";

  return {
    present,
    type,
    effectiveness,
  };
}

/**
 * Analyze Length
 */
function analyzeLength(
  text: string,
  platform: string,
): {
  character_count: number;
  optimal: boolean;
  platform_limit?: number;
} {
  const charCount = text.length;
  const limits = PLATFORM_LIMITS[platform];

  return {
    character_count: charCount,
    optimal: limits ? charCount <= limits.optimal : charCount < 300,
    platform_limit: limits?.max,
  };
}

/**
 * Calculate Readability (Simplified Flesch Reading Ease)
 */
function calculateReadability(text: string): {
  grade_level: number;
  score: number;
  recommendation: string;
} {
  const words = text.split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).length || 1;
  const avgWordsPerSentence = words / sentences;

  // Simplified scoring (real would count syllables)
  const score = Math.max(
    0,
    Math.min(100, 100 - (avgWordsPerSentence - 10) * 5),
  );

  const recommendation =
    score >= 70
      ? "Easy to read - good for social media"
      : score >= 50
        ? "Moderate - consider shorter sentences"
        : "Complex - simplify language for broader reach";

  return {
    grade_level: Math.floor(avgWordsPerSentence / 2),
    score,
    recommendation,
  };
}

/**
 * Determine Overall Status
 */
function determineOverallStatus(
  statuses: Array<"pass" | "review" | "fail">,
): "pass" | "review" | "fail" {
  if (statuses.includes("fail")) return "fail";
  if (statuses.includes("review")) return "review";
  return "pass";
}
