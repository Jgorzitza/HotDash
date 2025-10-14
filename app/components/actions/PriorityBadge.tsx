/**
 * PriorityBadge Component
 * 
 * Displays action priority with appropriate color coding
 */

import { Badge } from '@shopify/polaris';

export interface PriorityBadgeProps {
  priority: string;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const normalizedPriority = priority.toLowerCase();
  
  // Map priority to Polaris badge tone
  const getTone = (): 'critical' | 'warning' | 'info' | undefined => {
    switch (normalizedPriority) {
      case 'urgent':
        return 'critical';
      case 'high':
        return 'warning';
      case 'normal':
        return 'info';
      case 'low':
        return undefined; // Subdued/default
      default:
        return 'info';
    }
  };

  return (
    <Badge tone={getTone()}>
      {priority.toUpperCase()}
    </Badge>
  );
}

