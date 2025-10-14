/**
 * ActionTypeBadge Component
 * 
 * Displays the platform/tool type with appropriate styling
 */

import { Badge } from '@shopify/polaris';

export interface ActionTypeBadgeProps {
  toolName: string;
}

export function ActionTypeBadge({ toolName }: ActionTypeBadgeProps) {
  // Extract platform from tool name
  const platform = toolName.split('_')[0].toLowerCase();
  
  // Map platform to badge tone
  const getTone = (): 'success' | 'info' | undefined => {
    switch (platform) {
      case 'shopify':
        return 'success';
      case 'chatwoot':
        return 'info';
      default:
        return undefined; // Subdued/default
    }
  };

  // Format platform name
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);

  return (
    <Badge tone={getTone()}>
      {platformName}
    </Badge>
  );
}

