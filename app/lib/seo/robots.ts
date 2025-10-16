/**
 * Robots.txt Checker
 * 
 * Validate and analyze robots.txt files
 * 
 * @module lib/seo/robots
 */

export interface RobotsRule {
  userAgent: string;
  allow: string[];
  disallow: string[];
}

export interface RobotsValidation {
  isValid: boolean;
  rules: RobotsRule[];
  sitemaps: string[];
  issues: string[];
  warnings: string[];
}

/**
 * Parse robots.txt content
 */
export function parseRobotsTxt(content: string): RobotsValidation {
  const lines = content.split('\n');
  const rules: RobotsRule[] = [];
  const sitemaps: string[] = [];
  const issues: string[] = [];
  const warnings: string[] = [];
  
  let currentRule: RobotsRule | null = null;
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Skip comments and empty lines
    if (trimmed.startsWith('#') || trimmed === '') {
      return;
    }
    
    const [key, ...valueParts] = trimmed.split(':');
    const value = valueParts.join(':').trim();
    
    if (!value) {
      warnings.push(`Line ${index + 1}: Empty value for ${key}`);
      return;
    }
    
    const lowerKey = key.toLowerCase().trim();
    
    if (lowerKey === 'user-agent') {
      if (currentRule) {
        rules.push(currentRule);
      }
      currentRule = {
        userAgent: value,
        allow: [],
        disallow: [],
      };
    } else if (lowerKey === 'disallow') {
      if (!currentRule) {
        issues.push(`Line ${index + 1}: Disallow without User-agent`);
      } else {
        currentRule.disallow.push(value);
      }
    } else if (lowerKey === 'allow') {
      if (!currentRule) {
        issues.push(`Line ${index + 1}: Allow without User-agent`);
      } else {
        currentRule.allow.push(value);
      }
    } else if (lowerKey === 'sitemap') {
      sitemaps.push(value);
    } else {
      warnings.push(`Line ${index + 1}: Unknown directive ${key}`);
    }
  });
  
  if (currentRule) {
    rules.push(currentRule);
  }
  
  return {
    isValid: issues.length === 0,
    rules,
    sitemaps,
    issues,
    warnings,
  };
}

/**
 * Check if URL is allowed for user agent
 */
export function isUrlAllowed(
  url: string,
  userAgent: string,
  rules: RobotsRule[]
): boolean {
  const matchingRules = rules.filter(
    rule => rule.userAgent === '*' || rule.userAgent === userAgent
  );
  
  if (matchingRules.length === 0) {
    return true; // No rules = allowed
  }
  
  for (const rule of matchingRules) {
    // Check disallow first
    for (const pattern of rule.disallow) {
      if (url.startsWith(pattern)) {
        // Check if there's a more specific allow
        for (const allowPattern of rule.allow) {
          if (url.startsWith(allowPattern) && allowPattern.length > pattern.length) {
            return true;
          }
        }
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Mock robots.txt fetch
 */
export async function fetchRobotsTxt(domain: string): Promise<string> {
  console.log('[robots] Mock fetch robots.txt:', domain);
  return '';
}

