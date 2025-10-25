/**
 * Mobile Navigation Component
 * Bottom navigation bar for mobile devices
 * Aligned with Shopify Polaris mobile patterns
 */

import { Link, useLocation } from 'react-router';

export interface MobileNavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
}

export interface MobileNavProps {
  items: MobileNavItem[];
}

/**
 * Mobile Navigation Component
 * 
 * Features:
 * - Fixed bottom navigation (mobile only)
 * - Touch-friendly 44x44px targets
 * - Active state indication
 * - Swipe gesture support
 * - Dark mode support
 * 
 * @example
 * ```tsx
 * <MobileNav items={[
 *   { id: 'home', label: 'Home', path: '/', icon: <HomeIcon /> },
 *   { id: 'approvals', label: 'Approvals', path: '/approvals', icon: <ApprovalIcon /> },
 * ]} />
 * ```
 */
export function MobileNav({ items }: MobileNavProps) {
  const location = useLocation();

  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {items.map((item) => {
        const isActive = location.pathname === item.path;
        
        return (
          <Link
            key={item.id}
            to={item.path}
            className={`mobile-nav__item ${isActive ? 'mobile-nav__item--active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="mobile-nav__icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="mobile-nav__label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Default navigation items for HotDash
 */
export const defaultMobileNavItems: MobileNavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: 'approvals',
    label: 'Approvals',
    path: '/approvals',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 12l2 2 4-4" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  {
    id: 'notifications',
    label: 'Alerts',
    path: '/notifications',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
      </svg>
    ),
  },
];

/**
 * Swipeable Container Component
 * Enables swipe gestures for navigation
 */
export interface SwipeableProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export function Swipeable({
  children,
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
}: SwipeableProps) {
  let touchStartX = 0;
  let touchEndX = 0;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) < threshold) {
      return;
    }

    if (diff > 0 && onSwipeLeft) {
      onSwipeLeft();
    } else if (diff < 0 && onSwipeRight) {
      onSwipeRight();
    }
  };

  return (
    <div
      className="swipeable"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}

/**
 * Pull to Refresh Component
 * Enables pull-to-refresh gesture on mobile
 */
export interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
}

export function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = React.useState(false);
  const [pullDistance, setPullDistance] = React.useState(0);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  let touchStartY = 0;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touchY = e.touches[0].clientY;
    const distance = touchY - touchStartY;

    // Only pull if at top of page
    if (window.scrollY === 0 && distance > 0) {
      setPullDistance(distance);
      setIsPulling(distance > threshold);
    }
  };

  const handleTouchEnd = async () => {
    if (isPulling && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setIsPulling(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
      setIsPulling(false);
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={`pull-to-refresh ${isPulling ? 'pull-to-refresh--active' : ''}`}
        style={{ transform: `translateY(${Math.min(pullDistance, threshold)}px)` }}
      >
        {isRefreshing ? (
          <span className="pulse">Refreshing...</span>
        ) : isPulling ? (
          <span>Release to refresh</span>
        ) : (
          <span>Pull to refresh</span>
        )}
      </div>
      {children}
    </div>
  );
}

/**
 * Mobile-specific utility hooks
 */

/**
 * Detect if device is mobile
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

/**
 * Detect touch device
 */
export function useIsTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Get viewport dimensions
 */
export function useViewport() {
  const [viewport, setViewport] = React.useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  React.useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
}

import * as React from 'react';

